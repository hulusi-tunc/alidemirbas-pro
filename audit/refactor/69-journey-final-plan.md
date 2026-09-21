# 69-journey final plan — Phase 25 refactor

Consolidated from eleven Phase 1 audits (`audit/refactor/`) under the binding
rules in `_ARBITRATION.md`. All 69 public journeys, one section each.


# Refactor plan — part 1 of 4

**Journeys:** `ACQ-09` `ACQ-11` `ACQ-12` `ACQ-13` `ACQ-285` `ACQ-287` `ACQ-288` `ACQ-289` ·
`ACT-12` `ACT-13` `ACT-14` `ACT-17` `ACT-18` `ACT-19` `ACT-20`.
**Sources:** `acquisition.md` and `activation.md` (domain, binding on business flow, waits, touch
count, state re-checks, stop conditions, canonical edits); `orchestration-matrix.md` (**J**,
binding on the pattern and final channels of every communication stage); `ownership.md` (**I**,
binding on ownership, precedence, handoffs, `distinctFrom`); `canvas.md` (**K**, binding on what
the canvas draws and on renderer changes); `_ARBITRATION.md` (binding over all four).

**What had to be arbitrated.** The two domain audits and the orchestration matrix disagree about
channels on **eight** of these fifteen journeys, always in the same direction: the domain reads the
authored `channelRoles[].when` clauses and keeps a second channel as a route or a fallback, while
the matrix asks whether any node in the journey actually *resolves* that choice and finds that —
outside ACQ-287/288 — none does. The matrix wins by the arbitration table on every one of them
(ACQ-11 t1/t3, ACQ-12 t1, ACQ-13, ACT-12, ACT-14 `a.offer`, ACT-18, ACT-19), and in each case it
had evidence the domain did not: the corpus-wide count that only two journeys carry a channel
router. None is escalated. Where the domain found something the matrix could not see — ACQ-285's
one node standing for N sends, ACQ-287/288's undetected cancellation and emptied-cart defects,
ACT-13's silent dependency arm, ACT-12's invisible prompt budget — the domain's canonical edit is
applied on top of the matrix's channel verdict; those are complementary, not conflicting. Two
places set the horizontals against each other and both are settled by `_ARBITRATION.md` §5 rather
than by me: the six ACQ-287/288 routers, which **K** rates a correct collapse and which the
arbitration requires to be **drawn**, and the send-path gate the acquisition audit wants promoted
out of the router prose, which **K**'s gate inventory keeps collapsed — I authored the gate and
kept it hidden, and drew the router instead. Touch counts are the domain's column throughout, which
is why ACT-12 is 3 here and 1 in the matrix's summary table: the matrix counted the stage, the
domain counted the loop. Nothing below is marked `CONFLICT — ESCALATED`.

---

## ACQ-09 — Lead Nurture

**Purpose:** Give a legitimate but not-yet-ready lead a bounded window of useful education, and end
the window whether or not it worked. The sunset is a fact about the attempt, not a judgement about
the person.

**Current flow:**
```
Trigger valid_lead_not_destination_ready
  → c.basis "permission and lawful basis for this kind of communication?"
      ├─ No basis → Exit  held, no nurture started
      └─ Basis exists → a.educate  [Primary In-app / Fallback Email]
           → w.first (until nurture_progression_signal | permission_withdrawn | contactability_lost)
              ├─ event   → c.what-ended → Handoff ACQ-03 / Exit / Exit
              └─ timeout → c.still-open "is the lead still the lead this window opened for?"
                    ├─ Progressed → Handoff ACQ-03
                    ├─ Permission withdrawn → Exit
                    ├─ Route lost → Exit
                    └─ Still not ready → a.educate2  [Primary In-app / Fallback Email]
                         → w.window → timeout → Exit sunset · event → c.what-ended
```

**Problems found:**
- Both education cards render `Primary In-app / Fallback Email` on a `same-role-other-channel`
  journey, which the schema says is not a fallback at all (canvas §P0-2 Defect B; matrix §4).
- The `in-session` role is unreachable by this journey's own trigger: a lead that has reached no
  destination is not in the product, so the asserted in-app audience has no evidence behind it
  (matrix, ACQ-09 `a.educate` row; acquisition problem 1).
- `channels: ["email", "in-app"]` overstates the journey by one channel (acquisition problem 2).
- `TOUCH_STAGE_TR` has no row for `educate-again`, so the TR reader gets **Mesaj** where the EN
  reader gets **Educate again** (acquisition §0.3).
- `c.basis` is a permission gate drawn as a Decision with no visible route change (canvas §2.2
  Tier A).

**Final orchestration:** `sequential` — two bounded touches, each stage `single`. The touches are
one plan with a fixed length (`bounded_education.touches` = 2) and the second only exists because
the first did not land; nothing substitutes for email at either stage, so there is nothing to fall
back from. (Matrix: `single` + `sequential`, email, 2 — agrees with the domain.)

**Final customer channels:** `email`

**Customer touch count:** 2 — longest path to one recipient.

**Final flow:**
```
Trigger  Lead did not reach a destination
  → [c.basis collapses: permission is a delivery prerequisite, not a route]
  → Email #1  Education matched to the reason the lead entered
      → Wait  second_touch  (progression | permission withdrawn | route lost)
         ├─ event   → Decision "what ended the wait?" → Handoff ACQ-03 / Exit / Exit
         └─ timeout → Decision "is the lead still the lead this window opened for?"   ◀ RE-CHECK
               ├─ Progressed meanwhile → Handoff ACQ-03 Intent Escalation
               ├─ Permission withdrawn → Exit  permission no longer covers it
               ├─ Route lost           → Exit  no permitted route
               └─ Still not ready → Email #2  the last education of this window
                    → Wait  window
                       ├─ timeout → Exit  sunset, no progression
                       └─ event   → Decision "what ended the wait?"
```

**State re-checks:** `c.still-open` sits between the two touches and re-reads the lead from the
system of record — recorded progression signal, permission position, destination deliverability.
`s.progressed` states the same rule in prose (*"the second education is never sent to a lead that
has already progressed"*); the node and the suppression must not be allowed to drift apart.

**Stop conditions:** `nurture_progression_signal` (→ handoff, not an exit), `permission_withdrawn`,
`contactability_lost`, `bounded_education.window` timeout (→ sunset), and the sender-side
`marketing_suppression` CON-300 writes (`s.sunset`), which is a hard gate under GLB-31 and is
invisible to a purpose-level permission check.

**Ownership / handoff:** ACQ-285 owns the initial lead contact window; this journey is ineligible
while an ACQ-285 instance is open on the capture the lead came from and starts only once that window
closes and its own entry conditions are still true (`s.first-touch`). Progression hands to **ACQ-03
Intent Escalation**, a routed customer journey that is not one of the 69, so the card shows its name
as text and never as a link. Ownership §1.2 rates this pair *already resolved and a model for a
boundary with no competition block on either side* — nothing is reopened. This journey must not say
anything about a lead's commercial readiness; that is ACQ-03's.

**Canonical changes needed:**
- `channels: ["email"]` — drop `"in-app"`.
- `channelStrategy.roles`: drop the `in-session` role; keep `persistent` → `email`;
  `fallback: "none"` (with one role, `"same-role-other-channel"` is moot and `"none"` is clearer).
- `orchestration.touches[t1].channelRoles` and `[t2].channelRoles` → `["persistent"]`.
- Nothing structural: no node added, removed or re-pointed.

**Display-only changes needed:**
- Both education cards render one **Email** pill and no rank label.
- `c.basis` stops being drawn (it is the Tier-A permission gate; its "no basis" arm is the
  sanctioned no-action ending and prunes with it).
- Add a `TOUCH_STAGE_TR` row for `educate-again`; while the table is open, add the deliberate rows
  for `initial-reminder`, `second-reminder` and `second-reminder-high-value`, which render a TR
  title today only by accident.
- Trigger card reads as an event (*"Lead did not reach a destination"*), without the
  `SignalSource` provenance chip.

**Renderer changes needed:** the shared `ChannelPriorityRow` rule (one channel group → channel pill,
no rank label); the Tier-A gate collapse (a two-branch condition whose question is permission or
eligibility and whose short arm is a recorded no-action ending is not drawn); the trigger-card
provenance rule. No journey-specific change.

---

## ACQ-11 — Abandoned Process Recovery

**Purpose:** Return a person to a resumable process they started and did not complete — a checkout,
an application, a quote, a registration — while it is still resumable, and never assert a state the
system does not hold. This is the generic pattern; ACQ-287 is its checkout specialisation.

**Current flow:**
```
Trigger process_started
  → c.eligible "can this process be recovered for this person at all?"
      ├─ Not eligible → Exit no-action
      └─ Eligible → w.abandon (30–60 min from last_activity_at)
           → c.state "what is the process now?" (5 branches)                       ◀ RE-CHECK
               ├─ Completed → Exit converted        ├─ Cancelled/expired/emptied → Exit invalid
               ├─ Superseded → Exit superseded      ├─ Payment failed → Handoff FIN-134
               └─ Still resumable → c.sendable → a.touch1 [Primary Push+In-app / Fallback Email]
                    → w.second (20–28 h) → c.state2 (6 branches)                   ◀ RE-CHECK
                        ├─ Resumed, still open → a.note-return → w.resumed → c.state2
                        └─ Still open → c.sendable2 → a.touch2 [Primary Email / Fallback Push]
                             → w.final (3–7 d) → c.state3                          ◀ RE-CHECK
                                 └─ Still open → c.final-enabled
                                       ├─ Disabled / no honest expiry → Exit lapsed
                                       └─ Enabled → a.touch3 [Primary Email / Fallback SMS]
                                            → w.close (until expires_at) → Exit lapsed / c.close
```

**Problems found:**
- Three touches, three `Primary/Fallback` cards, and **none** of the three is a fallback: the
  journey contains no node that resolves a channel (matrix, `UNRESOLVED` on all three).
- Touch 2's second role is dead by its own `when` (a content-carrying touch always selects
  `persistent`), and touch 3's roles are in an order that makes `urgent` unreachable — the card
  draws a substitution that cannot occur (acquisition §0.2).
- `a.note-return` is absorbed, so the canvas shows a wait and does not show that the journey loops
  back into it or that the loop is bounded (canvas §3.2).
- 31 display nodes from 19 canonical, 17 of them terminal instances, fed by three state decisions of
  5, 6 and 5 branches — the largest branch highway in the library (canvas §P2-7). This is a
  canonical authoring problem, not a layout one.
- `c.eligible` is a Tier-A permission/eligibility gate drawn as a Decision (canvas §2.2).
- ACQ-11 carries `distinctFrom` rows for ACQ-08, SCH-282 and ACQ-287 but none for ACQ-12, whose
  `h.process → ACQ-11` hands it the instance (ownership D-14).

**Final orchestration:** `sequential` — a three-stage progressive recovery, every stage `single`.
The stages are separated by real waits and each is reached only through a state re-read, which is
what `sequential` means here; the channel does not change because a route failed, it changes because
the *moment* changed — a nudge, then an explanation, then a deadline. **Arbitrated:** the domain
called stage 1 a true fallback (push/in-app, else email) and stage 3 conditional routing (SMS, else
email); the matrix is binding on both and makes them `single` email and `single` SMS, on the
evidence — which the domain did not weigh — that nothing in this journey can resolve a channel and
that push belongs to the checkout specialisation that has the router. Applied the matrix.

**Final customer channels:** `email` (touches 1 and 2) · `sms` (touch 3)

**Customer touch count:** 3 maximum, 2 on the default path — touch 3 sits behind two gates
(`recovery.final_notice_enabled` and an honest-expiry test), so it exists only where there is a real
deadline to name.

**Final flow:**
```
Trigger  A process was started and left unfinished
  → [c.eligible collapses]  → Wait  first check (30–60 min from last activity)
  → Decision "what is the process now?"                                            ◀ RE-CHECK
      ├─ Completed → Exit converted   ├─ Cancelled, expired or emptied → Exit invalid
      ├─ Superseded → Exit superseded ├─ Payment failed → Handoff FIN-134
      └─ Still resumable → Email #1   the process as it stands, with a link that restores it
  → Wait  second check (20–28 h)
  → Decision "what is the process now, and did they come back?"                    ◀ RE-CHECK
      ├─ as above
      ├─ Resumed, still open → Note the return and re-arm one further wait (bounded) ─┐
      └─ Still open, not resumed → Email #2   the likely blocker, and a route to ask
  → Wait  lifetime (3–7 d)
  → Decision "at the end of the lifetime, what is it?"                             ◀ RE-CHECK
      └─ Still open → Decision "is the final notice enabled, and is there a real expiry to name?"
            ├─ Disabled, or no honest expiry → Exit lapsed
            └─ Enabled → SMS #3   the process closes at X, here is the link
                 → Wait until expires_at → Exit lapsed / Decision "what ended it?"
```

**State re-checks:** the best in the domain and preserved exactly — `c.state` before touch 1,
`c.state2` before touch 2, `c.state3` **and** `c.final-enabled` before touch 3, `c.close` after it.
The re-entry loop (`a.note-return` → `w.resumed` → `c.state2`) holds the second touch once for a
person who came back and left again rather than skipping or hurrying it; keep it, and now draw it.

**Stop conditions:** `process_completed` by any route including offline, `process_cancelled`,
`process_expired`, `items_removed_all`, `payment_failed` (→ FIN-134), supersession by a newer
logical process, `recovery.lifetime`, the platform's own `expires_at`, any send-path gate (recorded
as a no-action), CON-300 sender-side suppression.

**Ownership / handoff:** below **ACQ-287** for checkouts and suppressed for any checkout that journey
holds (`s.specialised`); above every held cart, held selection, inferred interest and predicted need.
Receives the instance from **ACQ-12** (`h.process`, which suppresses every queued selection touch)
and hands to **FIN-134** on payment failure — payment failure is not abandonment, and this journey
must not say anything about the payment. All four orderings are stated from both sides
(ownership §1.1) and none is reopened. **Consequence to record with the business:** with touch 3 on
SMS only, a person with no deliverable number gets no final notice at all; the matrix took that
deliberately (§5-4) on the grounds that a third promotional email is indistinguishable from touch 2
and `c.sendable` already records a no-action as a legitimate outcome.

**Canonical changes needed:**
- `channels: ["email", "sms"]` — drop `"push"` and `"in-app"`.
- `channelStrategy.roles`: keep `persistent` → `email` and `urgent` → `sms`; drop `low-friction`;
  `fallback: "none"`.
- `orchestration.touches`: `[t1].channelRoles` → `["persistent"]`, `[t2].channelRoles` →
  `["persistent"]`, `[t3].channelRoles` → `["urgent"]`.
- Tighten `channelStrategy.roles[urgent].when` to *"explicit commercial SMS permission is recorded
  and the platform asserts the time-bound element the final notice names"*, so the role's condition
  points at `c.final-enabled` instead of restating it loosely.
- Give `a.note-return` an authored bound (a `Config` for the number of re-arms, honest `basis`) and
  a budget-spent path, so the prose's "one further wait" is true in the graph as well as in the text.
- `distinctFrom` += a row naming **ACQ-12**, mirroring the one ACQ-12 already carries (ownership
  D-14).
- **Branch-count reduction is the real work here.** The three state decisions carry 5, 6 and 5
  branches and each ending branch draws its own terminal; fold the terminal-only branches that share
  a state class (`cancelled` / `expired` / `emptied` → one *closed unfinished* arm, already one exit)
  so each decision asks one question with four arms at most. No behaviour changes; the canvas stops
  drawing a transition table.

**Display-only changes needed:**
- Three touch cards, three single pills: Email, Email, SMS. No rank labels.
- `a.note-return` is drawn (it re-arms a wait; that is structural, not bookkeeping).
- `c.eligible` stops being drawn.
- `c.final-enabled` **stays** drawn — it is the gate that makes the third touch honest, and it is a
  business decision, not a send-path gate.
- Branch labels on the state decisions use the short form, not the authored `when` sentence.

**Renderer changes needed:** `ChannelPriorityRow` (single group → bare pill); Tier-A gate collapse;
`absorbableBookkeeping` must read authored structure rather than `meta` prose, and must never absorb
an internal action whose successor is a wait it re-enters; `estimatedLabelWidth`'s budget applies to
the back-edge label. No per-journey layout — the 31-node canvas is fixed in canonical, not in the
layout engine.

---

## ACQ-12 — Abandoned Selection Recovery

**Purpose:** Return a person to items they selected — a cart, a basket, a saved list — and did not
carry into a process, while the selection still stands and at least one item can still be acted on.
Generic; ACQ-288 is its cart specialisation.

**Current flow:**
```
Trigger selection_recorded
  → c.eligible ├─ Not eligible → Exit no-action
      └─ Eligible → w.settle (1–4 h)
           → c.state "what is the selection now?"                                  ◀ RE-CHECK
               ├─ Converted → Exit converted          ├─ Cleared → Exit invalid
               ├─ Carried into a process → Handoff ACQ-11
               ├─ Changed, still held → a.rearm → w.settle   (loop, bounded in prose only)
               └─ Still held → c.availability
                     ├─ Nothing available → Exit  every item unavailable
                     └─ At least one available → c.sendable → a.touch1 [Primary Push+In-app / Fallback Email]
                          → w.second (2–4 d) → c.state2 → c.sendable2
                               → a.touch2 [Primary Email / Fallback Push]
                                    → w.lifetime (7–14 d) → c.state3 → Exit lapsed
```

**Problems found:**
- Both touches render `Primary/Fallback` and neither is one; touch 2's second role is dead by its
  own `when` (acquisition §0.2, canvas §P0-2 Defect B).
- Nothing in the journey resolves a channel, so the asserted push is unbacked (matrix `UNRESOLVED`).
  The matrix records the honest cost of this (§5-3): the second touch's justification is a *change
  the platform asserts* — availability restored, price changed — which is the textbook push moment,
  and it goes to email only because this journey carries no push-eligibility signal at all.
- **The re-arm loop is bounded in prose only.** `a.rearm` says *"a bounded number of times"*; no
  `Config` carries the number and no branch fires when the budget is spent. `validate-public-scope`
  checks that every *wait* is bounded, which this passes; the *loop* is not.
- `a.rearm` is absorbed, so the bounded re-entry is drawn as a plain step (canvas §3.2).
- `c.eligible` is a Tier-A gate drawn as a Decision (canvas §2.2).

**Final orchestration:** `sequential` — two touches, both `single`. Deliberately the same shape as
ACQ-11 stages 1 and 2, because this is the same pattern one level up the commerce chain; there is no
third touch and no final notice, because a held selection has no expiry to name honestly, which the
journey's own `distinctFrom[ACQ-11]` already says. **Arbitrated:** the domain kept stage 1 as a
push/in-app fallback; the matrix is binding and makes it `single` email, on the corpus-wide evidence
the domain did not have. Applied the matrix, and recorded its own reservation above.

**Final customer channels:** `email`

**Customer touch count:** 2

**Final flow:**
```
Trigger  A selection was recorded and left
  → [c.eligible collapses]  → Wait  first check (1–4 h)
  → Decision "what is the selection now?"                                          ◀ RE-CHECK
      ├─ Converted → Exit converted            ├─ Cleared → Exit  selection no longer stands
      ├─ Carried into a process → Handoff ACQ-11 Abandoned Process Recovery
      ├─ Changed, still held → Re-arm the first wait from the new last activity
      │                        (bounded: selection.rearm_limit)
      │                          └─ budget spent → Decision "can any of it still be acted on?" ◀ NEW
      └─ Still held → Decision "can any of it still be acted on?"
            ├─ Nothing available → Exit  nothing here can be bought
            └─ At least one available → Email #1   the items as they stand
  → Wait  second check (2–4 d)
  → Decision "what is the selection now?"                                          ◀ RE-CHECK
      └─ Still held → Email #2   what changed about the items they kept
  → Wait  lifetime (7–14 d) → Decision "at the end of the lifetime, what is it?"
      └─ Still held → Exit  lapsed
```

**State re-checks:** `c.state` before touch 1, `c.availability` immediately after it — never message
somebody about items none of which can be bought — `c.state2` before touch 2, `c.state3` at lifetime
end. Two independent re-reads stand between the first touch and the second (state, then sendability).

**Stop conditions:** `selection_converted`, `selection_cleared`, `process_started` (→ handoff to
ACQ-11, not an exit), every item unavailable, `selection.lifetime`, any send-path gate, CON-300
suppression.

**Ownership / handoff:** suppressed for any selection **ACQ-288** holds — a cart is a selection and
the cart implementation outranks the generic pattern (`s.specialised`, stated four ways). Hands the
instance to **ACQ-11** the moment a process starts from the selection (`h.process`, carrying
`suppresses: ["every queued recovery touch for this selection"]`). Above ACQ-13 and above RET-31 for
the same person. Ownership §1.1 rates all of these already resolved. **Documentation row owed:**
ACQ-289 is named by this journey's group and not named back (`D-19`).

**Canonical changes needed:**
- `channels: ["email"]`; `channelStrategy.roles` keeps `persistent` → `email` only;
  `fallback: "none"`; `orchestration.touches[t1]`/`[t2].channelRoles` → `["persistent"]`.
- Add a `Config` `selection.rearm_limit` (a budget with an honest `basis`; `required: false` with a
  low-confidence default is acceptable) and give `a.rearm` a **budget-spent** path that falls through
  to `c.availability` instead of back to `w.settle`. This is what makes *"a bounded number of times"*
  true in the graph.
- `distinctFrom` += a row naming **ACQ-289** (ownership D-19).

**Display-only changes needed:**
- Two cards, one Email pill each, no rank labels.
- `a.rearm` is drawn, and the back edge carries its bound on the card so the loop reads as bounded at
  a glance.
- `c.eligible` stops being drawn; `c.availability` **stays** drawn — it is a business decision
  specific to this journey, not a send-path gate.

**Renderer changes needed:** `ChannelPriorityRow`; Tier-A gate collapse; `absorbableBookkeeping` must
not absorb an internal action that re-arms the wait it feeds; back-edge label budget. Nothing
journey-specific.

---

## ACQ-13 — Unresolved Interest Recovery

**Purpose:** Follow up qualified but unresolved attention — browsing that ended in neither a
selection nor a process — with **at most one touch**, and record no-action as the normal outcome
whenever the attention does not qualify.

**Current flow:**
```
Trigger interest_signal_recorded
  → c.qualify "does this attention qualify, and is it still unresolved?"
      ├─ Already resolved → Exit resolved
      ├─ Does not qualify → a.record-no-action → Exit  no touch sent   (the common outcome)
      └─ Qualified → w.settle (12–48 h)
           ├─ event (selection | process | purchase) → Exit resolved
           └─ timeout → c.state "still unresolved, and is its subject still there?"  ◀ RE-CHECK
                 ├─ Resolved meanwhile → Exit resolved
                 ├─ Subject gone → Exit  nothing sent about something they cannot act on
                 └─ Unresolved, available → c.sendable
                       ├─ Suppressed → a.record-no-action → Exit no-action
                       └─ Sendable → a.touch1 [Primary Push+In-app / Fallback Email]
                            → w.lifetime (3–7 d) → Exit resolved / Exit touched once, not resolved
```

**Problems found:**
- Structurally this is the cleanest single-notice in the domain and the audits agree it needs no
  business change. The one defect is the channel claim: `Primary Push+In-app / Fallback Email` over a
  journey with nothing that resolves a route (matrix `UNRESOLVED`; canvas §P0-2 Defect B).
- The subject is an **inferred** interest — attention nobody confirmed, ranked lowest in
  `commerce-recovery` by the journey's own precedence. A push interrupt on a guess is the least
  defensible send in the corpus (matrix, ACQ-13 row).
- `a.record-no-action` is drawn as a card whose entire content is "record that nothing was sent"
  (canvas §P1-4) — it survives absorption only because two gates share it, so the more carefully the
  journey measures its silence, the more the canvas clutters.

**Final orchestration:** `single` — one touch, one channel, no sequence and no progression to
express. **Arbitrated:** the domain called this a genuine reachability fallback; the matrix is
binding and makes it `single` email. Applied the matrix; its reasoning (an interrupt on inferred
attention, from the group's lowest-ranked member) is also the better business answer.

**Final customer channels:** `email`

**Customer touch count:** 1

**Final flow:**
```
Trigger  An interest signal was recorded
  → Decision "does this attention qualify as interest, and is it still unresolved?"
      ├─ Already resolved → Exit resolved
      ├─ Does not qualify → Exit  no touch sent, reason recorded   (the expected outcome)
      └─ Qualified → Wait  settle window (12–48 h)
           ├─ event   → Exit resolved
           └─ timeout → Decision "still unresolved, and is its subject still there?"  ◀ RE-CHECK
                 ├─ Resolved meanwhile → Exit resolved
                 ├─ Subject gone → Exit  nothing to act on
                 └─ Unresolved, available → Email #1   the one thing they looked at, once
                      → Wait  lifetime (3–7 d)
                         ├─ event   → Exit resolved
                         └─ timeout → Exit  touched once, not resolved
```

**State re-checks:** `c.qualify` at entry, `c.state` after the settle window (resolution *and*
subject availability), `c.sendable` immediately before the send. No later touch, so no further
re-check is owed.

**Stop conditions:** `selection_recorded`, `process_started`, `purchase_completed` (all → resolved),
subject unavailable, any send-path gate, `interest.lifetime`, CON-300 suppression.

**Ownership / handoff:** no handoff — resolution is an exit, because whichever journey owns a
selection, process or purchase picks the person up on its own trigger. Bottom of `commerce-recovery`:
**yields to ACQ-289** and is suppressed for a person that alert holds (ownership §4-12 records this
half as closed), and under SCH-282 and RET-31 once P0-3's rewrite lands. Not reopened. This journey
must never assert that the person wants the item — it has an inferred signal and says so.

**Canonical changes needed:**
- `channels: ["email"]`; drop the `low-friction` role; `fallback: "none"`;
  `orchestration.touches[t1].channelRoles` → `["persistent"]`.
- `distinctFrom` += rows naming **ACQ-289** (D-19) and **RET-293** (D-22), mirroring rows that
  already exist on the other side.
- No structural change. The graph is right.

**Display-only changes needed:**
- One Email pill, no rank label.
- The `a.record-no-action` arms stop being drawn — a branch arm whose target is a pure no-action
  record is plumbing, and the business question the condition asks is unaffected.

**Renderer changes needed:** `ChannelPriorityRow`; the no-action-record arm rule (§4.4 of the canvas
audit) — a branch whose target writes only the suppression journal and ends the sending is not drawn,
with the existing `hideable()` parent test unchanged so a record step something else still points at
survives.

---

## ACQ-285 — New Lead Welcome

**Purpose:** Answer a declared interest with the thing that interest actually asked for, and carry it
onward only as far as what the person said about themselves justifies. Owns the initial lead contact
window, ahead of ACQ-09.

**Current flow:**
```
Trigger first_party_interest_captured
  → c.email-route "is the destination they supplied usable for this?"
      ├─ Not usable → c.declared-no-route
      │      ├─ Asked for a person → Handoff external:sales-assignment
      │      └─ Asked for the material → Exit  nothing deliverable
      └─ Usable → c.declared "what did the person actually declare?"
            ├─ Asked for a person → a.first-touch [Email] → Handoff sales-assignment
            └─ Asked for the material → a.deliver [Email]  exactly what was asked, once
                  → c.permission "is there permission to continue past fulfilment?"
                      ├─ Fulfilment only → Exit  fulfilled, no continuing contact permitted
                      └─ Permitted → a.nurture  "Open a bounded sequence…"   ◀◀ ONE node, N messages
                           → w.nurture (until destination_declared | permission_withdrawn)
                               ├─ timeout → Exit  sequence ended, no destination declared
                               └─ event → c.progressed → Handoff sales / Exit stopped
```

**Problems found:**
- **`a.nurture` is one card standing for an unknown number of sends** (*"open a bounded sequence on
  the subject they declared"*), while `contactCap` (`captured_interest.touches`, default 2,
  confidence **high**) counts that whole sequence as one touch. The canvas shows a reader one message
  where the journey may send five. This is the defect the matrix could not see — it scored
  `a.nurture` as a single correct stage — and it is why the matrix's touch count of 2 is only true
  after the fix below.
- **Nothing re-reads state between fulfilment and the sequence's messages.** `c.permission` is
  checked once, before the sequence opens; nothing asks whether the person has since declared
  readiness, at which point the sales handoff owns them. Every sibling in this domain re-checks.
- All three message cards render `Primary: Email` over a single channel — the "fake Primary" defect
  (canvas §P0-2 Defect A; this journey supplies three of the eighteen cards).
- `c.email-route` names a channel in a node id on a journey whose channel strategy is deliberately
  generic; the question it asks is right, the id leaks the implementation.
- `t1` and `t2` are two first touches with no `after`, which is correct — they are mutually exclusive
  arms — but is stated only inside the cap's prose.

**Final orchestration:** a justified **combination** — `conditional routing` on what the person
declared, then `sequential` on the material arm. Not segment-based: `c.declared` reads a *declared
fact about this specific request* (did they ask for a person, or for the material), not a segment the
company assigns. Single channel at every stage. Matrix: `single` + `sequential`, email, 2 — the
conditional routing is the branch the matrix scores as two separate first-touch stages, so the two
readings agree on every stage and on the count.

**Final customer channels:** `email`

**Customer touch count:** 2 maximum on any one path — 1 on the person-led arm and 1 on the
fulfilment-only arm.

**Final flow:**
```
Trigger  A first-party interest was captured
  → Decision "is the contact point they gave usable for this?"
      ├─ Not usable → Decision "what did they ask for?"
      │      ├─ Asked for a person → Handoff  sales assignment
      │      └─ Asked for material → Exit  nothing deliverable
      └─ Usable → Decision "what did the person actually declare?"
            ├─ Asked for a person → Email #1  what they asked for, and when a person follows up
            │                          → Handoff  sales assignment
            └─ Asked for material → Email #1  exactly what was asked, once, nothing alongside
                  → Decision "permission to continue past fulfilment?"
                      ├─ Fulfilment only → Exit  fulfilled
                      └─ Permitted → Wait  follow-up window
                                     (until destination_declared | permission_withdrawn)
                            ├─ event   → Decision "what ended it?" → Handoff sales / Exit stopped
                            └─ timeout → Decision "is this still a lead with nothing declared?"  ◀ NEW RE-CHECK
                                  ├─ Readiness declared → Handoff  sales assignment
                                  ├─ Permission withdrawn → Exit  stopped at the person's request
                                  └─ Still open → Email #2  one further message on the declared
                                                  subject, stating plainly that this is the last of
                                                  the welcome and what happens next
                                       → Wait  window
                                           ├─ event   → Decision "what ended it?"
                                           └─ timeout → Exit  welcome ended, no destination declared
```

**State re-checks:** a new `c.still-open` before the second message, reading three things — has a
destination been declared since fulfilment, does the permission recorded at capture still stand, and
is the contact point still deliverable. The welcome's closing message is never sent to somebody who
has already declared readiness; the sales handoff owns them from that moment.

**Stop conditions:** `destination_declared` (→ sales handoff), `permission_withdrawn`, no deliverable
destination at entry, `welcome.window` timeout, CON-300 suppression (`s.sunset`).

**Ownership / handoff:** **owns the initial lead contact window before ACQ-09** — settled, and
ownership §4-18 rates the pair complete with no competition block on either side. ACQ-09's
`s.first-touch` and its eligibility both name this journey; when this one's window closes
(`x.delivered`, `x.sunset`, `x.stopped`) ACQ-09 may start if its own entry conditions still hold.
Hands to `external:sales-assignment` on the person-led arm and on declared readiness — that is a
**handoff, never a channel**, and it stays drawn as a Handoff card. This journey must not make a
commercial claim about the lead; it delivers what was asked and says who follows up.
**Documentation row owed:** `distinctFrom` += **RET-290** (ownership D-20).

**Canonical changes needed:**
- Replace `a.nurture` with **`a.follow-up`**: one communication action, not a sequence. Text along
  the lines of *"send one further message on the subject they declared, saying plainly that this is
  the last of the welcome and what happens next; a sequence with no stated end is a subscription
  nobody agreed to."*
- Insert **`c.still-open`** between the first wait and `a.follow-up` (branches: *Readiness declared*
  → `h.person`; *Permission withdrawn* → `x.stopped`; *Still open* → `a.follow-up`).
- Re-point `w.nurture` as the wait **before** the follow-up (`captured_interest.nurture` →
  `welcome.follow_up`, class `response-window`), and add `w.window` (`welcome.window`, class
  `observation-window`) as the post-touch observation window feeding the existing `c.progressed` /
  `x.sunset` / `x.stopped` terminals.
- `orchestration.touches[t3]` gains `after: "t2"`, `gatedBy: "w.follow-up"`,
  `prerequisites: ["c.permission", "c.still-open"]`, and `stage: "follow-up"` (already in
  `TOUCH_STAGE_TR`) rather than `nurture`.
- `contactCap` prose rewritten to describe two **messages** rather than "fulfilment and a sequence".
  The number 2 stays; it becomes true.
- Rename `c.email-route` → `c.contactable` (the id leaks a channel).
- `distinctFrom` += **RET-290**.
- Net canonical 15 → 17.

**Display-only changes needed:**
- Three message cards, one Email pill each, **no `Primary` label** — this journey is three of the
  eighteen fake-Primary cards.
- `c.permission` **stays** drawn. The canvas audit judged it a keep (§2.3 note): it looks like a
  consent check, but its answer decides whether this journey exists at all past its transactional
  obligation — and after the change above it is also the gate in front of a real second message.
- The display count goes ~17 → ~19; the two added nodes buy the reader a correct touch count.

**Renderer changes needed:** `ChannelPriorityRow` — one channel group renders a pill and no rank
label at all. Nothing else; this journey needs no collapse or absorption change.

---

## ACQ-287 — Checkout Abandonment Recovery

**Purpose:** Return a person who started checkout and did not finish, reaching for the highest-value
checkouts on a more direct channel, and never sending once the purchase is already there.

**Current flow:**
```
Trigger checkout_started
  → w.first 45 min (until process_completed | payment_failed)
  → c.completed1 "is the checkout completed, and is it still ours to recover?"      ◀ RE-CHECK
      ├─ Completed → Exit purchased    ├─ Payment failed → Handoff FIN-134
      └─ Not completed → a.router1 [UNDRAWN: reads push permission + a valid current token,
                                    plus the pressure cap and the commerce-recovery contest]
                          → a.reminder1  [Primary Push / Fallback Email]
  → w.second 6 h → c.completed2 (same three branches)                               ◀ RE-CHECK
      └─ Not completed → c.highvalue "is this a high-value checkout?"
            ├─ High-value → a.router2-hv [UNDRAWN] → a.reminder2-hv [Primary WhatsApp + SMS]
            └─ Standard   → a.router2-std [UNDRAWN] → a.reminder2-std [Primary Push / Fallback Email]
  → w.third 24 h → c.completed3                                                     ◀ RE-CHECK
      ├─ Completed → Exit purchased   ├─ Payment failed → Handoff FIN-134
      └─ Not completed → Exit abandoned
```

**Problems found:**
- **The three routers are the only nodes in the library that actually resolve a channel, and all
  three are hidden.** `a.router1` / `a.router2-hv` / `a.router2-std` read push-token validity and
  WhatsApp reachability and write `selected_channel_t1` / `selected_channel_t2`; the display folds
  them into the message card. The one place the behaviour is real is the one place it is not drawn
  (matrix §The systemic defect; `_ARBITRATION.md` §5).
- **A cancelled or expired checkout is never detected.** All three waits watch only
  `process_completed` and `payment_failed`, and all three conditions branch only *Completed / Payment
  failed / Not completed*. The generic pattern this journey specialises (ACQ-11) handles cancelled,
  expired and emptied; the specialisation handles none of them, so it will send touch 2 against a
  checkout the person cancelled. **A correctness defect, not a presentation one.**
- **The send-path gate is hidden inside router prose.** Permission, reachability, the promotional
  pressure cap and the commerce-recovery contest re-read are all folded into the router's `does`
  text. Every sibling (ACQ-11/12/13/289) carries that as an explicit `c.sendable` condition.
- **No-action is under-measured.** `measurement.operational` has `no_channel_available_rate`, which
  covers only "neither route is reachable"; the same router can decline for permission, pressure cap
  or contest, and none of those is counted or written to `suppressed_sends`. Four sibling journeys
  state the convention this breaks: *no-action is a measured outcome rather than a silent absence*.
- `a.reminder2-hv` renders `Primary: WhatsApp + SMS` — one role carrying two channels, flattened into
  an undifferentiated row, losing the WhatsApp→SMS order the router asserts (canvas §P0-2 Defect A).
- `channelStrategy.roles[urgent].when` restates the high-value threshold `c.highvalue` already owns.

**Final orchestration:** a justified **combination** — a `sequential` two-touch cascade, with a
**segment-based** split at touch 2 and a **true fallback** inside each stage. Every part earns its
place: the segment is a real treatment change (a high-value checkout gets a different register *and*
a direct personal channel, on `checkout_value` against a company-configured threshold that
`c.highvalue` already reads and already draws), and the fallback is the legitimate kind — push
substituted by email when no device registration clears, WhatsApp substituted by SMS when the number
is not reachable on WhatsApp. The matrix scores all three stages `fallback (true)` — its §3 list
contains eight such stages in the whole corpus and three of them are here — and requires
`c.highvalue` to stay drawn, so the stage verdict and the journey-level combination agree.

**Final customer channels:** `push` + `email` (touch 1 and the standard arm of touch 2) ·
`whatsapp` + `sms` (high-value arm of touch 2)

**Customer touch count:** 2

**Final flow:**
```
Trigger  Checkout started
  → Wait 45 min  (until process_completed | payment_failed | process_cancelled | process_expired)
  → Decision "what is the checkout now?"                                            ◀ RE-CHECK
      ├─ Completed ────────────→ Exit  purchased
      ├─ Payment failed ───────→ Handoff FIN-134 Payment Failure Recovery
      ├─ Cancelled or expired ─→ Exit  closed unfinished          ◀ NEW
      └─ Still open → [c.sendable1 — authored, collapsed: permission, pressure cap, contest;
                       the suppressed arm records the reason and rejoins the next wait]
            → Channel decision "is a current push registration reachable?"          ◀ NOW DRAWN
                 → Reminder #1   Push if reachable · otherwise Email
  → Wait 6 h (same until-set)
  → Decision "what is the checkout now?"                                            ◀ RE-CHECK
      ├─ Completed / Payment failed / Cancelled or expired → as above
      └─ Still open → Decision "is this checkout at or above the high-value threshold?"
            ├─ High-value → Channel decision "is this number reachable on WhatsApp?"  ◀ NOW DRAWN
            │                  → Reminder #2 high-value   WhatsApp · otherwise SMS
            └─ Standard   → Channel decision "is a current push registration reachable?"
                               → Reminder #2   Push if reachable · otherwise Email
  → Wait 24 h (same until-set)
  → Decision "at the end of the cascade, what is the checkout?"                     ◀ RE-CHECK
      ├─ Completed → Exit purchased        ├─ Payment failed → Handoff FIN-134
      ├─ Cancelled or expired → Exit closed unfinished
      └─ Still open → Exit  abandoned
```

**State re-checks:** completion and payment failure are re-read immediately before every touch
(`c.completed1/2/3`) — the journey's strongest feature, and exactly what `s.completed` promises:
*"every reminder is reached only through a condition that just re-read completion."* Each of the
three now re-reads cancellation and expiry as well, so the promise covers every way a checkout can
stop being recoverable. The send gate re-reads permission, pressure and the commerce-recovery contest
immediately before each send.

**Stop conditions:** `process_completed` by any route (in product, in store, by phone),
`payment_failed` (→ FIN-134), **`process_cancelled` / `process_expired` (new)**, supersession by a
newer checkout for the same person, any send-path gate (recorded, not silent), CON-300 sender-side
suppression, the end of the cascade.

**Ownership / handoff:** **highest in `commerce-recovery`.** Outranks ACQ-11, which it specialises and
which is suppressed for any checkout this journey holds (stated four times over: both precedences,
`s.generic`, `s.specialised`, reciprocal `distinctFrom`). Receives the cart from **ACQ-288** at
`checkout_started`, with every queued cart reminder suppressed from that moment. Yields the instance
to **FIN-134** on payment failure and says nothing further about the payment. Ownership §1.1 rates
every pair resolved. **One row owed on the other side:** FIN-134 acknowledges neither this handoff nor
ACQ-11's (ownership §2.2 / P0-1) — that fix belongs to FIN-134's section, not this one.

**Canonical changes needed:**
1. **Cancellation and expiry.** Add `process_cancelled` and `process_expired` to the `until` sets of
   `w.first`, `w.second`, `w.third`. **Use the registry ids, not the mapping names:**
   `src/canonical/events.ts` carries `process_cancelled` and `process_expired`, with
   `checkout_cancelled` / `checkout_expired` listed only as `commonMappings` — the acquisition audit
   named the mappings. Add a *Cancelled or expired* branch to `c.completed1/2/3` pointing at a new
   exit `x.invalid` (`class: "invalid-state"`, state *"closed unfinished — cancelled or expired;
   nothing further is sent"*, `reEntry` *"a new checkout is a new instance"*). Rename the three
   conditions to *"What is the checkout now?"* to match the wider branch set.
2. **Promote the gate out of the router prose.** Add `c.sendable1`, `c.sendable2-hv`,
   `c.sendable2-std` (branches *Sendable* / *Suppressed*), the suppressed arm passing through
   `a.record-no-action` (writes `suppressed_sends`) and rejoining the next wait — which is what the
   router prose already says happens. Strip the permission / pressure / contest sentences out of the
   router `does` text so each router only picks a channel.
3. `measurement.operational` += `no_action_rate_by_reason` (keep `no_channel_available_rate`; the two
   are not the same thing).
4. `channelStrategy.roles[urgent].when` → drop the threshold clause, keep only *"explicit permission
   for direct commercial messaging on a phone number is recorded and the number is reachable"*. The
   threshold stays in `c.highvalue`, in one place.
5. `orchestration.touches[t2-hv].channelRoles` stays `["urgent"]`; the WhatsApp→SMS order is carried
   by the role's own channel list and needs no change once the renderer reads a role's channels in
   order.
6. Canonical 17 → ~22. This is the one journey in the set where the right answer adds nodes, and all
   five are doing real work: one honest terminal and three gates that were being asserted in prose.

**Display-only changes needed:**
- **The three routers are drawn**, as channel-decision cards ahead of their sends: *"Is a current
  push registration reachable?"* and *"Is this number reachable on WhatsApp?"*. **Arbitrated:** the
  canvas audit rates `collapsibleRouters` a correct collapse (§3.1: *"pick a channel and send on it
  are one step to a reader"*); `_ARBITRATION.md` §5 overrides it — where a stage's pattern is
  conditional or fallback, the deciding node must be visible. Applied the arbitration. This is the
  reference case: after it, a reader can tell a real substitution from an asserted one anywhere in
  the library.
- The three new `c.sendable*` gates are **not** drawn. The canvas audit's gate inventory hides 33 of
  35 send-path gates and the brief forbids a generic permission card on every canvas; the gate is
  authored so it is real, testable and measurable, and collapsed so the canvas keeps its one visible
  decision per moment. (See the renderer rule below — the collapse shape has to admit a suppressed
  arm that rejoins the flow rather than exiting.)
- Touch 1 and touch 2-std read `Push if reachable · otherwise Email`; touch 2 high-value reads
  `WhatsApp · otherwise SMS` **in that order, two rows**, not one undifferentiated pair.
- The two second-touch cards keep their distinct `touchStage` titles (`second-reminder-high-value` /
  `second-reminder`) so the segment is named on the card as well as on the Decision above it; add both
  to `TOUCH_STAGE_TR`.

**Renderer changes needed:**
- An action that resolves a channel — one that writes a `selected_channel*` field under a
  channel-selection contract — is a **channel decision** and must be drawn as a decision-kind card
  ahead of the send it feeds, never folded into it. Stated over authored data, no journey id.
- A single role carrying more than one channel renders its channels **in order, with substitution
  wording**, not as one flat row of pills. The distinguishing signal is already authored:
  `fallback: "same-role-other-channel"` means the channels inside a role substitute for each other
  (render ordered); `"next-eligible-role"` means they are one step of the priority (render flat).
  Where a journey declares `next-eligible-role` but authors two substituting channels inside one
  role, the role should be split in canonical rather than the rule bent.
- `collapsibleGates`' shape test must admit a two-branch send-path gate whose suppressed arm records a
  reason and **rejoins the flow**, not only one whose suppressed arm reaches a no-action exit.
  Otherwise a journey is punished on the canvas for continuing its cascade after declining one send.
- `ChannelPriorityRow`: no `Primary` label over a single group.

---

## ACQ-288 — Cart Abandonment Recovery

**Purpose:** Return a person who added an item to their cart and did not start checkout; hand the
cart to ACQ-287 the instant checkout starts; never send once the purchase is there.

**Current flow:**
```
Trigger item_added_to_cart
  → w.first 2 h (until selection_cleared | process_completed | checkout_started)
  → c.active1 "is the cart still active?"
      ├─ Cleared or expired → Exit  cart no longer active      ◀ asked BEFORE purchase
      └─ Active → c.purchased1 ├─ Completed → Exit purchased
            └─ Not completed → c.checkout1 ├─ Started → Handoff ACQ-287
                  └─ Not started → a.router1 [UNDRAWN] → a.reminder1 [Primary Push / Fallback Email]
  → w.second 20–24 h (until process_completed | checkout_started)   ◀ no cleared event
  → c.purchased2 → c.checkout2 → c.highvalue
      ├─ High-value → a.router2-hv [UNDRAWN] → a.reminder2-hv  [Primary WhatsApp + SMS]
      └─ Standard   → a.router2-std [UNDRAWN] → a.reminder2-std [Primary Push / Fallback Email]
  → w.third 48 h → c.purchased3 → c.active2 → Exit abandoned / Exit cleared
```

**Problems found:**
- **The second reminder can be sent about a cart the person already emptied.** `w.second` waits only
  on `process_completed` and `checkout_started` — `selection_cleared` is in `w.first`'s and
  `w.third`'s until-sets but not this one — and the stage-2 chain never asks whether the cart is
  still active. A cart cleared after touch 1 walks straight into touch 2. **A correctness defect.**
- **Branch-order risk at stage 1.** `c.active1` exits to `x.cleared` (`class: invalid-state`) before
  `c.purchased1` asks about a purchase. On a platform that empties the cart on completion, a converted
  cart is recorded as an invalid state — **a success recorded as a failure.** Asking "purchased?"
  first removes the risk entirely.
- **Six single-question condition cards where three would do**, on a journey that is explicitly the
  same cascade as ACQ-287 one step earlier and should read as its twin. 20 display nodes, 7 of them
  terminal instances (canvas §P2-7).
- The same three hidden routers, the same hidden send gate, the same under-measured no-action and the
  same flattened WhatsApp/SMS pair as ACQ-287.

**Final orchestration:** identical to ACQ-287, deliberately — a `sequential` two-touch cascade,
**segment-based** at touch 2, with a **true fallback** inside each stage, plus an ownership handoff
evaluated at every re-check. The two journeys are the same cascade at two stages of one purchase, and
the canvas should say so. (Matrix: all three stages `fallback (true)`; three of its eight true
fallbacks are here.)

**Final customer channels:** `push` + `email` (touch 1, standard arm of touch 2) · `whatsapp` + `sms`
(high-value arm)

**Customer touch count:** 2

**Final flow:**
```
Trigger  An item was added to the cart
  → Wait 2 h  (until process_completed | checkout_started | selection_cleared | process_expired)
  → Decision "what is the cart now?"                                                ◀ RE-CHECK
      ├─ Purchased ──────────→ Exit  purchased                  ◀ ASKED FIRST
      ├─ Checkout started ───→ Handoff ACQ-287 Checkout Abandonment Recovery
      ├─ Cleared or expired ─→ Exit  cart no longer active
      └─ Still held → [gate authored, collapsed]
            → Channel decision "is a current push registration reachable?"          ◀ NOW DRAWN
                 → Reminder #1   Push if reachable · otherwise Email
  → Wait 20–24 h  (same until-set — selection_cleared ADDED)
  → Decision "what is the cart now?"                                                ◀ RE-CHECK
      ├─ Purchased / Checkout started / Cleared or expired → as above
      └─ Still held → Decision "is this cart at or above the high-value threshold?"
            ├─ High-value → Channel decision "reachable on WhatsApp?" → Reminder #2 hv
            │                                                            WhatsApp · otherwise SMS
            └─ Standard   → Channel decision "push reachable?" → Reminder #2
                                                                Push if reachable · otherwise Email
  → Wait 48 h (same until-set)
  → Decision "at the end of the cascade, what is the cart?"                         ◀ RE-CHECK
      ├─ Purchased → Exit purchased
      ├─ Cleared or expired → Exit  cart no longer active
      └─ Still held → Exit  abandoned
```

**State re-checks:** one merged condition per stage, in a fixed order — purchase first, then ownership
(checkout started), then validity (cleared or expired), then the send gate. Three re-checks, one
before each touch and one at the end: the same rhythm as ACQ-287.

**Stop conditions:** `process_completed` including at least one item from this cart, `checkout_started`
(→ handoff, not an exit), `selection_cleared` / `process_expired`, supersession by a newer cart, any
send-path gate, CON-300 suppression, end of cascade.

**Ownership / handoff:** above **ACQ-12**, the generic held-selection pattern it specialises, which is
suppressed for any cart this journey holds. Hands the cart to **ACQ-287** at `checkout_started`
(`h.checkout`, carrying `suppresses: ["every queued cart reminder for this cart"]`) — correctly
one-way, because a checkout never hands back to a cart. Below ACQ-287 and ACQ-11; above inferred
interest and predicted-need replenishment. Ownership §1.1: all resolved, nothing reopened. **Row owed:**
`distinctFrom` += **RET-294** (ownership D-23).

**Canonical changes needed:**
1. **Merge the condition chains, purchase asked first every time:**
   - `c.active1` + `c.purchased1` + `c.checkout1` → one **`c.state1`**: *Purchased* → `x.purchased` ·
     *Checkout started* → `h.checkout` · *Cleared or expired* → `x.cleared` · *Still held* → the
     stage-1 gate.
   - `c.purchased2` + `c.checkout2` → one **`c.state2`**: *Purchased* · *Checkout started* · *Cleared
     or expired* (new) · *Still held* → `c.highvalue`.
   - `c.purchased3` + `c.active2` → one **`c.state3`**: *Purchased* · *Cleared or expired* · *Still
     held* → `x.abandoned`.
   Net −3 canonical and −3 display nodes (22 → 19 canonical, 20 → 17 display).
2. **Add `selection_cleared` and `process_expired` to `w.second`'s `until` set**, so clearing the cart
   ends the wait instead of being noticed three stages later. (Registry ids: `process_expired` carries
   `cart_expired` as a `commonMapping`; do not author the mapping name.)
3. Same gate promotion, `a.record-no-action` / `suppressed_sends` write and `no_action_rate_by_reason`
   metric as ACQ-287 items 2–3.
4. Same `channelStrategy.roles[urgent].when` split as ACQ-287 item 4.
5. `distinctFrom` += **RET-294**.

**Display-only changes needed:** the same three card treatments as ACQ-287 (routers drawn as channel
decisions, ordered WhatsApp→SMS rows, no rank labels), the gates authored and collapsed, and the
condition merge — which is the single biggest readability gain available in this set, because it
*reduces* the node count while making the twin journeys draw as twins.

**Renderer changes needed:** the same four generic rules stated in the previous section — a
channel-resolving node drawn as a decision; ordered channels within one role; the widened
send-path-gate collapse shape; no `Primary` label over a single group. No journey-specific rule, no layout exception.

---

## ACQ-289 — Back-in-Stock Alert

**Purpose:** Tell a person, once, that the specific item they wanted while it was unavailable can be
bought again — and only while that interest is still honestly theirs.

**Current flow:**
```
Trigger interest_recorded_while_unavailable
  → w.availability (until item_available_again | purchase_completed | interest_dismissed)
      ├─ timeout → Exit  interest expired before availability returned; no alert sent
      └─ event → c.relevant "is this interest still worth alerting on?"             ◀ RE-CHECK
            ├─ Already bought → Exit purchased
            ├─ No longer wanted → Exit  interest closed
            └─ Still wanted → c.sendable
                  ├─ Suppressed → a.record-no-action → Exit no-action
                  └─ Sendable → a.alert [Primary Push / Fallback In-app / Fallback Email]
                       → w.window (until purchase_completed | item_unavailable)
                       → c.converted → Exit purchased / Exit  alerted, not bought
```

**Problems found:**
- Three roles render `Primary Push / Fallback In-app / Fallback Email`, and **the middle one is not a
  fallback in any sense**: `in-session`'s `when` is *"the person is already in a session where the
  item can be opened directly"* — somebody looking at the item can already see it is purchasable, and
  the alert's whole job is to reach somebody who is **not** looking. The role adds a channel and a card
  row without adding a business case.
- The push→email relationship **is** real here and is the corpus's clearest push moment (one fact,
  immediately actionable, short-lived), but this journey carries **no node that can resolve it**. It is
  the only stage in the whole matrix where a channel is prescribed that the journey cannot currently
  select (matrix §3, entry 8).
- `TOUCH_STAGE_TR` has no row for `availability-alert`: the EN reader gets **Availability alert**, the
  TR reader gets **Mesaj**.
- Nothing else. This is the best-instrumented journey in the set: availability is re-read immediately
  before the alert and explicitly never trusted from the event that opened the window (`s.unavailable`),
  the measurement carries a **required** persistent per-person holdout with an honest basis, and the
  guardrails include `alert_for_unavailable_item` and `repeat_alert_same_cycle`.

**Final orchestration:** `fallback` (true) — push where a current device registration and its
permission stand, otherwise email. Two steps, one substitution, driven purely by reachability: the
moment availability returns is worth minutes, push is the treatment, and email is what you send when
the push cannot be delivered. **Arbitrated:** the domain reached the same pattern but proposed no way
to resolve it; the matrix is binding and requires the ACQ-287 router contract to be **imported and
drawn**. Applied the matrix — and note this is the only canonical addition the matrix prescribes
anywhere, on the grounds that the signal is not invented but defined twice already inside the same
exclusion group.

**Final customer channels:** `push`, `email`

**Customer touch count:** 1

**Final flow:**
```
Trigger  Interest recorded while the item was unavailable
  → Wait  interest lifetime  (availability returns | purchased | interest dismissed)
      ├─ timeout → Exit  interest expired; no alert sent
      └─ event → Decision "is this interest still worth alerting on?"               ◀ RE-CHECK
            ├─ Already bought → Exit purchased
            ├─ No longer wanted → Exit  interest closed
            └─ Still wanted → [c.sendable authored, collapsed: permission, pressure cap,
                               commerce-recovery contest; suppressed → recorded no-action]
                  → Channel decision "is a current push registration reachable?"    ◀ NEW, DRAWN
                       → Alert   Push if reachable · otherwise Email
                            → Wait  conversion window
                            → Decision "did the alert reach a purchase?"
                                 ├─ Purchased → Exit purchased
                                 └─ Not purchased → Exit  alerted, not bought
```

**State re-checks:** three, all present and all required. `c.relevant` re-reads purchasability, the
purchase record and withdrawal at the moment availability returns; `c.sendable` re-reads permission,
deliverability, the pressure cap and the commerce-recovery contest immediately before the send;
`c.converted` reads the purchase record after the window. Nothing to add.

**Stop conditions:** `purchase_completed` by any route, `item_unavailable` again before the alert,
`interest_dismissed`, `back_in_stock.interest_lifetime` timeout, any send-path gate, CON-300
suppression, the conversion window closing.

**Ownership / handoff:** no handoff. Below a checkout in motion (ACQ-287), the generic process pattern
(ACQ-11), a held cart (ACQ-288), a held selection (ACQ-12), a predicted need (RET-31) and an
availability enquiry (SCH-282); **above ACQ-13**, which is suppressed for a person this alert holds.
The precedence half of that ordering is closed from both sides (ownership §4-12); the three
`distinctFrom` rows owed on the other side (ACQ-12, ACQ-13, RET-31 → ACQ-289, D-19) belong to those
journeys' sections. Not reopened.

**On "normally 1 touch, rarely 2":** the journey is at 1 and stays there. A second alert is forbidden
twice over — `s.single` (*"one alert per availability cycle; a second message about the same return of
the same item is a repeat, not a reminder"*) and the `repeat_alert_same_cycle` guardrail — and the only
honest second alert is a **new availability cycle**, which the entity definition already makes a new
instance. A company that wants a same-cycle reminder is changing the contract, not configuring it, and
the place for that is a **preset** under `discovery.presets` raising `back_in_stock.touches` with its
own `applicableWhen`, not a second touch node. Adding one would break `s.single`, the guardrail and the
holdout's attribution in a single edit.

**Canonical changes needed:**
1. `channels: ["push", "email"]` — drop `"in-app"`.
2. `channelStrategy.roles`: drop the `in-session` role; keep `low-friction` → `push` and `persistent`
   → `email`; keep `fallback: "next-eligible-role"` — here it is true.
3. `orchestration.touches[t1].channelRoles` → `["low-friction", "persistent"]`.
4. **Add the router.** Import the ACQ-287 `a.router1` contract verbatim — reads communication
   permission and a valid, current push registration, writes `selected_channel`, feeds `a.alert` — so
   the fallback this journey draws is one it can actually perform. Add `no_action_rate_by_reason` to
   `measurement.operational` alongside the existing no-action measurement.
5. `distinctFrom` += **SCH-282** (ownership D-27).

**Display-only changes needed:** the alert card shows **two** rows — `Push if reachable · otherwise
Email` — instead of three, with the new router drawn as the channel decision above it. Add
`availability-alert` to `TOUCH_STAGE_TR`. Display node count goes 10 → 11.

**Renderer changes needed:** the channel-resolving node drawn as a decision, as stated above;
`ChannelPriorityRow` labelling from the declared pattern rather than array position
— with `next-eligible-role` rendered as *"if unreachable"*, which reads true, rather than *"Fallback"*,
which does not; the `TOUCH_STAGE_TR` completeness rule (every `Touch.stage` in the corpus has a row).

---

## ACT-12 — Onboarding Nurture

**Purpose:** Advance onboarding from the state the product's own setup record reports, one useful
step at a time, until activation or the window closes.

**Current flow:**
```
Trigger onboarding_active_without_activation
  → a.read (read the milestone record)
  → c.next-step "is there a critical next step still outstanding?"
      ├─ Outstanding → a.surface  [Primary In-app / Fallback Email]
      └─ Setup done  → c.ready "has activation actually been achieved?"
            ├─ Yes → Handoff ACT-16
            └─ Checklist done, no value → w.progress
  a.surface → w.progress (until setup_milestone_completed | activation_recorded;
                          timeout onboarding.step_interval)
      ├─ event   → c.what-happened ├─ activation → Handoff ACT-16
      │                            └─ progress, no value → a.read          ← loop back
      └─ timeout → c.window ├─ expired → Exit window closed
                            └─ open → c.stalled-step
                                  ├─ named prerequisite unchanged → Handoff ACT-13
                                  └─ nothing identifiable → a.read         ← loop back
```

**Problems found:**
- **Up to five customer touches, and the five exist nowhere in the graph.** One `a.surface` node is
  re-entered through two back edges, bounded only by `onboarding.step_prompts` (default **5**,
  `confidence: low`, `basis: example-only`). The cap is an invisible counter; a reader cannot see what
  stops the loop, and the one thing that does is a number authored as an illustration.
- **The budget is a ceiling, not a cascade, and nothing on the page says so.** Every prompt re-reads
  the milestone record and `s.done-step` forbids re-suggesting a completed step — a genuinely good
  property, rendered as a generic "Internal" card.
- `a.read` is a bookkeeping-looking node doing the journey's most important work; it survives
  absorption only because its in-degree is 3.
- The in-session/off-session route is **declared and never drawn**, and rendered `Primary In-app /
  Fallback Email` on a `same-role-other-channel` journey, where the schema says that is not a fallback.
- Two loop-backs converge on `a.read` from conditions that mean different things (a step *was*
  completed vs nothing happened at all), and after the merge the journey cannot tell them apart.

**Final orchestration:** `sequential` — a state-driven repeat of one `single`-channel prompt, capped at
3 by a visible budget. Sequential rather than a cascade because each prompt is about a *different*
step and exists only if the milestone record still shows work outstanding. **Arbitrated:** the domain
made each prompt conditional routing (in-app in session, email otherwise, via a new `c.where`); the
matrix is binding and makes the stage `single` → email, on evidence the domain did not weigh — *the
prompt exists to reach somebody who has stopped progressing; a person still in the product is
completing milestones, and `w.progress` absorbs them, and a next-step panel inside the product is the
product's own surface, not a journey send.* Applied the matrix: **no `c.where`, no in-app prompt
node.** The touch count is the domain's column and stays at **3** — the matrix's summary row of 1
counts the stage, not the loop.

**Final customer channels:** `email`

**Customer touch count:** 3 maximum — longest path to one recipient; 1 is the common case.

**Final flow:**
```
Trigger  Onboarding active without activation
  → Decision "is there a critical next step still outstanding?"       [reads the milestone record]
      ├─ A critical step is outstanding → Email   the one next step, and what it is for
      └─ Setup complete → Decision "has activation actually been achieved?"
            ├─ Activation recorded → Handoff ACT-16
            └─ Checklist finished, no value produced → Wait  progress
  Email → Wait  progress   until setup_milestone_completed | activation_recorded
                           timeout onboarding.step_interval (required; from the previous touch)
      ├─ event   → Decision "which event arrived?"
      │      ├─ Activation recorded → Handoff ACT-16
      │      └─ A step was completed, value not produced yet → Decision "budget?"
      └─ timeout → Decision "is the onboarding window still open?"
             ├─ Expired → Exit  window closed
             └─ Open → Decision "is one named prerequisite actually blocking activation?"
                   ├─ Yes, unchanged and blocking → Handoff ACT-13 Onboarding Blocker Reminder
                   └─ No progress, nothing identifiable → Decision "budget?"
  Decision "is there a step prompt left in this instance's budget?"                 ◀ NEW, DRAWN
      ├─ A prompt remains → back to "is there a critical next step outstanding?"   (the record is re-read)
      └─ Budget spent → Exit  step prompts spent; onboarding continues without further prompting
```

**State re-checks:** `c.next-step` is the re-read, and every repeat passes through it before a prompt
is composed, so a completed step is never suggested again. `c.what-happened` separates "a step was
completed" from "activation happened". `c.window` re-reads the window before any further prompt.
`c.stalled-step` re-reads whether one *named* prerequisite is the obstacle — which is what routes to
ACT-13, not a timer.

**Stop conditions:** `activation_recorded` from anywhere (supersedes the journey wherever it sits,
`s.activated`); a named prerequisite established as the blocker (→ ACT-13); the onboarding window
expiring; the prompt budget being spent; an open ACT-14 assisted session (`s.assisted`); an outstanding
ACT-19 question (`s.personalizing`); marketing suppression (`s.sunset`).

**Ownership / handoff:** ACT-12 is the route-walker. It yields to **ACT-13** the moment the obstacle
has a name (`h.blocker`, carrying the exact outstanding prerequisite and suppressing the generic prompt
for it), **pauses** under ACT-14 and ACT-19 — both suppressions name the other journey's own node ids,
which ownership §1.3 rates the best-stated non-group boundary in the corpus — and hands to **ACT-16**
on activation. It is the destination of ACT-13 `h.resume`, ACT-19 `h.progress` and ACT-20
`h.onboarding`. It must not name a blocker (that is ACT-13's sentence) and must not ask a profiling
question (that is ACT-19's). Nothing is reopened. **Owed, from ownership P2-7:** `lifecycle-stage`
binds ACT-12 and ACT-20 and orders neither — extend this journey's precedence to state *"above dormant
lead reactivation (ACT-20) for the same person, because an onboarding already in motion is a current
lifecycle and reactivation is the attempt to start one"*, and add a `distinctFrom` row naming ACT-20,
mirroring the `h.onboarding → ACT-12` handoff ACT-20 already carries.

**Canonical changes needed:**
- `contact.localCap.onboarding.step_prompts.default.value`: **5 → 3**; keep `required: false`, raise
  `confidence` to `medium`, change `basis` from `example-only` to `corpus-rule` — 3 is now the graph's
  own ceiling, not an illustration. Keep the `rule` sentence; it is what makes the budget honest and it
  is quoted on the page.
- Delete `a.read`; move its sentence into `c.next-step.observes` (*"the product's own record of
  completed setup milestones, never send or open history"*) and repoint both back edges through the new
  budget decision.
- Add **`c.budget`** — *"Is there a step prompt left in this instance's budget?"*, branches
  → `c.next-step` / → `x.prompts-spent`.
- Add exit **`x.prompts-spent`** — `class: "no-action"`, state *"step prompts spent; onboarding
  continues without further prompting"*, `reEntry`: a further `setup_milestone_completed` or a new
  onboarding instance re-opens it, and the completed milestones are kept.
- `a.surface` stays **one** action with `channelRoles: ["persistent"]`; drop the `in-session` role from
  `channelStrategy.roles`; `fallback` → `"none"`; `channels: ["email"]`.
- `measurement.operational` += `prompts_per_instance_vs_budget` beside the existing
  `prompts_per_instance`, so the 3 is measured rather than asserted.
- Precedence + `distinctFrom` rows per ownership P2-7.
- `distinctFrom` / `preemptedBy` / all nine suppressions otherwise **unchanged**. Canonical 12 → 13.

**Display-only changes needed:**
- One Email pill on the prompt card, no rank label.
- `c.budget` is drawn — **the cap becomes a decision on the canvas instead of a counter behind it.**
  This is the mechanism, not the number: a reader now sees that the journey stops prompting for a
  stated reason.
- `x.prompts-spent` and `x.window-closed` both stay drawn.
- The back edge `c.budget → c.next-step` keeps its `back: true` treatment and its branch label reads
  *"A prompt remains"* / *"Bir istem kaldı"*, not the full `when` sentence.
- Any figure caption counts the drawn layout, not the canonical 13.

**Renderer changes needed:** `ChannelPriorityRow` — label each row from the touch's own declared
pattern and the role it carries, never from array position, and render nothing at all over a single
group. Keep the words *Primary* / *Fallback* only where the journey's `channelStrategy.fallback` is a
role-advancing value, which is what the schema defines them to mean; the glossary rows for
Primary/Fallback must be updated in the same change.

---

## ACT-13 — Onboarding Blocker Reminder

**Purpose:** Aim the whole journey at one named missing thing, and resume onboarding once it exists.

**Current flow:**
```
Trigger activation_blocked_by_named_requirement
  → a.identify (name the exact requirement; writes blocking_requirement)   [drawn EN, absorbed TR]
  → c.blocking "does this requirement actually block activation?"
      ├─ Not blocking → Exit not-blocking
      └─ Blocks → c.self-resolvable "can this account resolve it directly?"
            ├─ Yes → a.specific-action   [Primary Email / Fallback In-app]
            └─ No  → a.route-dependency  [renders "Primary: Task" — an internal work item]
  both → w.resolve (until named_requirement_satisfied; timeout activation_blocker.resolve)
      ├─ event   → a.stop-reminders [ABSORBED] → c.next-blocker
      │        ├─ Nothing else outstanding → Handoff ACT-12
      │        └─ A second requirement appeared → Exit next-blocker
      └─ timeout → c.unresolved ├─ A person should own it → Handoff external human-in-the-loop
                                ├─ Another path to value → Handoff ACT-11
                                └─ Neither → Exit blocked
```

**Problems found:**
- **The dependency branch tells the customer nothing.** Where the requirement needs another team, a
  third party or a person who has not joined, the journey raises an internal work item and the blocked
  account hears **silence** until either the requirement is satisfied or the resolve horizon expires. A
  service journey aimed at one named missing thing should not leave the person uninformed on the branch
  where they are *least* able to act.
- **The cap counts a work item as a customer touch.** `activation_blocker.touches = 2`, and one of the
  two is `a.route-dependency`, which reaches no customer. (`_ARBITRATION.md` §2: ACT-13 and FBK-49 are
  the two journeys whose cap counts an internal work item.)
- `a.route-dependency` renders **`Primary: Task`** — one of the five `execution: "human"` cards drawing
  an internal work queue in the customer-channel idiom (`_ARBITRATION.md` §4).
- A two-role channel plan on a service notice, rendered Primary/Fallback over
  `same-role-other-channel`.
- **`a.stop-reminders` is absorbed, and it is the single most important stop-condition in the
  journey** — *"stop every reminder about this requirement immediately, including any already
  queued"*. It qualifies as journal-only solely because `suppressed_sends` is in `JOURNAL_WRITE`, but
  writing that field here is not a record of the action, it **is** the action.
- **Locale-divergent display graph:** `a.identify` is drawn on EN and absorbed on TR, because
  `absorbableBookkeeping` tests `meta` prose that TR localization has already rewritten, so the filter
  returns `[]` and `[].every(...)` is `true`. Five journeys diverge corpus-wide; this is one.

**Final orchestration:** `segment-based`, with a **parallel** pair on one segment. Segment-based at the
top because *who can actually clear this requirement* changes everything downstream and is already
authored (`c.self-resolvable`); then `single` on the self-resolvable arm — one named action, one
message — and `parallel` on the other arm, because the internal routing and a customer notice go out at
the same moment, are addressed to **different people** and carry different content. That is the same
justification the corpus already accepts for RSK-273 and INC-254; it is not two interruptive channels
aimed at one person. **Arbitrated:** the matrix scores this journey `single` → email, but it was
scoring the one communication stage that exists today; the customer notice on the dependency arm is a
*new* stage the matrix never evaluated, and the defect that motivates it (an account left in silence)
is a business-flow finding, which is the domain's column. Applied the domain's addition on top of the
matrix's channel verdict — the new stage is email too, so the two do not actually collide.

**Final customer channels:** `email` — on both arms. Single channel, no route condition. The person is
blocked by something that frequently cannot be cleared in the session they are in (a verification, an
administrator, an integration credential, a colleague who has not joined); the message has to name the
requirement, say what clears it, and **survive until they can act on it**. In-app is dropped: it is not
a second attempt at the same message, and a banner does not survive the walk to whoever holds the
credential. `task` is **not** a channel and never appears as one.

**Customer touch count:** 1 — per instance, per requirement, on every path. The internal work item is
not a touch.

**Final flow:**
```
Trigger  Activation blocked by a named requirement
  → Name the exact requirement and what it is blocking   (writes blocking_requirement)
  → Decision "does this requirement actually block activation?"
      ├─ Value can still be produced without it → Exit  not blocking
      └─ Activation cannot occur while it is unmet → Decision "can this account clear it itself?"
            ├─ It holds the access, information and permission
            │       → Email   the one action that clears this named requirement
            └─ It needs another team, a third party or someone who has not joined
                    ├─ Work item   raise it with whoever can resolve it   [internal · no channel]
                    └─ Email       what is outstanding, who now holds it, what happens next
                    (both, at the same moment — different recipients, different content)
  → Wait  resolve   until named_requirement_satisfied
                    timeout activation_blocker.resolve (required; relative to trigger)
      ├─ event   → Stop every reminder about this requirement, including any already queued  ◀ DRAWN
      │        → Decision "with this requirement met, is activation now reachable?"
      │              ├─ No other mandatory requirement outstanding → Handoff ACT-12
      │              └─ Clearing this one revealed a second → Exit  next blocker
      └─ timeout → Decision "what does this unresolved requirement warrant?"
             ├─ A person should now own it → Handoff  external human-in-the-loop
             ├─ Value is reachable by another path → Handoff ACT-11
             └─ Mandatory, unresolvable, unavoidable → Exit  blocked
```

**State re-checks:** `c.blocking` before anything is said. `a.stop-reminders` on the event arm — the
strongest re-check in the domain, because it cancels *queued* sends rather than only declining the next
one. `c.next-blocker` re-reads whether activation is now reachable before handing back.
`c.unresolved` re-reads what the requirement warrants instead of sending again.

**Stop conditions:** `named_requirement_satisfied` (stops every reminder immediately, including
scheduled ones, `s.g3`); the requirement turning out not to block; the resolve horizon expiring; a
person taking ownership (`h.escalate`, which suppresses automated reminders about this requirement).

**Ownership / handoff:** ACT-13 **owns the named-requirement moment**. ACT-12 suppresses its generic
prompt for that prerequisite (`s.blocker` + `h.blocker.suppresses`) and ACT-14 defers to it at
`c.duplicate`. One instance per `(account_id, requirement_id)`; two blockers are two instances and are
never stacked into one message. Hands back to **ACT-12** on resolution and to **ACT-11** where value is
reachable by another path. Three things are **owed here and are ownership's column**, not the domain's:
- `distinctFrom` += **ACT-12**, mirroring `s.blocker` and `h.blocker` (D-9) — the winner of an ownership
  transfer currently states nothing about the transfer.
- `distinctFrom[ACT-14].because` extended with the consequence (P1-3): *"…and where both are true — a
  named requirement outstanding and help being sought against it — this journey holds the account and
  the help offer is suppressed for it, because an obstacle with a name is answerable and a general
  offer of help is not."* (ACT-14 gains the reciprocal row and an `s.named-blocker` suppression.)
- `suppressions` += `s.generic-reminder` and a `distinctFrom` row naming **TIM-268** (P1-4 / D-28): this
  journey owns the reminder for the requirement it holds, and the generic outstanding-obligation
  reminder is suppressed for that obligation while this instance holds it.

**Canonical changes needed:**
- Add **`a.hold-notice`** — `execution: "communication"`, `channelRoles: ["persistent"]`, next
  `w.resolve`. Its `does`: name the outstanding requirement, say it is now with the party who can
  resolve it, and say what happens when it is. It must **not** ask the account to do anything — it is on
  the branch where they cannot.
- `c.self-resolvable`'s second branch targets both `a.route-dependency` and `a.hold-notice`; add
  `channelStrategy.simultaneous: { allowed: true, reason: "the work item and the account notice are
  addressed to different people and carry different content" }` — the schema already has the field and
  no journey in this domain uses it.
- `orchestration.touches` += `t3`, `stage: "dependency-hold"`, `action: "a.hold-notice"`,
  `channelRoles: ["persistent"]`, `prerequisites: ["c.blocking", "c.self-resolvable"]`.
- `contact.localCap.activation_blocker.touches`: **2 → 1**, with the `rule` rewritten to say explicitly
  that it counts **customer** touches and that `a.route-dependency` is a work item, not a send. Keep
  `confidence: high`.
- `a.specific-action.channelRoles`: `["persistent", "in-session"]` → `["persistent"]`; drop the
  `in-session` role from `channelStrategy.roles`; `fallback` → `"none"`.
- `channels`: `["email", "in-app", "task"]` → `["email", "task"]`. **`task` must stay** — the validator
  requires `channels` to be backed by an action carrying `execution: "human"`, and
  `a.route-dependency` is that action. It is not a customer-facing channel and must never be drawn as
  one.
- The three ownership rows above (D-9, P1-3, P1-4/D-28).
- All three guardrails and all three suppressions otherwise **unchanged**.

**Display-only changes needed:**
- `a.hold-notice` and `a.route-dependency` render as **two cards side by side on the same branch**, not
  as a chain. The human card keeps its `Human / İnsan` kind label and carries **no channel pill**.
- `a.stop-reminders` is **drawn**. **Arbitrated:** the activation audit called its absorption "right
  for the canvas"; the canvas audit lists it among the nine wrong collapses and is binding on what the
  canvas draws. Applied the canvas audit — a stop-condition that cancels queued sends is not
  bookkeeping, and the wait capsule that currently absorbs it has room for a duration and nothing else.
- `a.identify` must be drawn on **both** locales (the TR absorption bug).
- `c.self-resolvable`'s branch labels take the short form — *"They can clear it"* / *"Someone else
  must"* — not the authored `when` sentences. This is one of the five message-variant forks the canvas
  audit rates legitimate, so the card must foreground what differs (the recipient and the message), not
  repeat the channel block.
- All three exits and all three handoffs stay drawn.

**Renderer changes needed:**
- `absorbableBookkeeping` must read **structure**, not prose: test an authored `writes` array on the
  flow node, never localized `meta` strings. Preferred implementation is to compute the display graph
  from the canonical projection once and localize the surviving cards, which removes a whole class of
  locale-dependent divergence rather than one instance of it.
- Narrow `JOURNAL_WRITE`: `suppressed_sends` is not a journal write when the node is the only writer of
  it on a branch that ends the sending — that is the suppression itself, not a record of one. Stated
  structurally: an internal action whose own write is the journey's declared suppression, or whose
  successor is a wait it re-enters, is never absorbable.
- An internal action may be absorbed only where the card absorbing it can carry its meaning — never
  into a `wait` capsule.
- An action with `execution: "human"` (or `customerFacing: false`) must not be given a channel chip at
  all, and the string `Task` must never appear where a channel appears; it renders as a work-assignment
  affordance instead. One rule, five sites corpus-wide.
- New gate **G7_LOCALE_STRUCTURE**: the drawn node set and edge set must be identical on the EN and TR
  routes. New gate **G8_ACTION_HIDDEN**: an action may be missing from the canvas only if it matches the
  sanctioned absorption shape. Both belong in `audit/guard-display.mjs`, and either would have caught
  this mechanically.

---

## ACT-14 — Onboarding Help

**Purpose:** Offer help to someone who is visibly trying and getting nowhere, and stop asking once they
have answered.

**Current flow:**
```
Trigger help_seeking_without_activation_progress
  → c.hard-entry  ├─ instance closed or already activated → Exit not-eligible
  → c.duplicate   ├─ an open case, a human owner, or ACT-13 owns a named requirement → Exit defer
  → a.offer  [Primary In-app / Fallback Push / Fallback Email]
  → w.response (until assisted_session_scheduled | activation_recorded | assistance_declined;
                timeout struggling_user.response)
      ├─ event → c.what-happened
      │      ├─ Session scheduled → a.confirm [same 3-channel plan] → w.session
      │      │        ├─ event → c.outcome ├─ activation → Handoff ACT-16
      │      │        │                    └─ no value → c.followup → a.followup [same plan] / Exit
      │      │        └─ timeout → Exit no-outcome
      │      ├─ Activation without a session → Handoff ACT-16
      │      └─ Declined → Exit declined
      └─ timeout → c.final-option → a.final [same plan] / Exit normal
```

**Problems found:**
- **Four message actions, one identical channel plan.** An offer, a booking confirmation, a
  post-session follow-up and a final self-service link are four kinds of message with four different
  half-lives, and all four declare `in-session → low-friction → persistent`.
- **Push does not meet its own stated condition here.** `low-friction` is *"a valid token exists and the
  message is a single step from the notification"*. Booking an assisted session is not a single step
  from a notification, and neither is reading a post-session follow-up. Push is declared on all four
  touches and earned on none.
- **The booking confirmation is treated as a nudge.** It is the one message the person actually asked
  for, it carries a time and a join route, and it is the one that most needs to persist and be findable
  on the day.
- **Cap 4 against a real maximum of 3** — the cap counts nodes, and no path carries four touches.
- `c.hard-entry` is a Tier-A eligibility gate drawn as a Decision with no visible route change.

**Final orchestration:** `event-or-timeout`. The spine is genuinely that: everything after the offer is
decided by *what the person did* — booked, activated by themselves, said no, or said nothing — and each
of those four answers leads somewhere different. That must not be flattened into a cascade. Every stage
is `single`; the moment decides the channel at each one. **Arbitrated:** the domain routed the offer
itself (in-app in session, email otherwise, via a new `c.where`); the matrix is binding and makes the
offer `single` → **in_app** outright, because the trigger is help-seeking *behaviour happening now* —
repeated returns to the same setup page, repeated failed attempts — so the person is in the product,
stuck, at this second, and an offer that arrives by email tomorrow is about a moment that has passed.
Applied the matrix: **no `c.where`, no second offer node.**

**Final customer channels:** `in_app` (the offer) · `email` (confirmation, follow-up, final option).
Push removed.

**Customer touch count:** 3 maximum — the booked path (offer → confirmation → one follow-up); 2 on the
silence path (offer → final option); 1 on the declined path. At most **2 of those are nudges**
(`a.offer`, `a.final`) and they never occur on the same path as more than one another, which is what
`s.g4` already says.

**Final flow:**
```
Trigger  Help-seeking without activation progress
  → [c.hard-entry collapses: the instance is closed or already activated → nothing opens]
  → Decision "is a person already working this same blocker?"
      ├─ An open case, an assigned owner, or ACT-13 owns a named requirement → Exit  deferred to them
      └─ Nothing covers it → In-app   help named against the step they keep returning to
  → Wait  response   until assisted_session_scheduled | activation_recorded | assistance_declined
                     timeout struggling_user.response (required; from the previous touch)
      ├─ event → Decision "what did they do?"
      │    ├─ Booked an assisted session
      │    │     → Email   the time, how to join, and the problem it opens with
      │    │     → Wait  session   until assisted_session_outcome_recorded | booking_cancelled
      │    │                       timeout = the session time plus a short grace period
      │    │        ├─ event → Decision "did activation follow the assistance?"
      │    │        │      ├─ Activation recorded → Handoff ACT-16
      │    │        │      └─ Session happened, still no value
      │    │        │            → Decision "did the session name a specific remaining action?"
      │    │        │                  ├─ Yes → Email  that action, once → Exit  normal
      │    │        │                  └─ Nothing specific came out of it → Exit  normal
      │    │        └─ timeout → Exit  no outcome recorded
      │    ├─ Activated without any session → Handoff ACT-16
      │    └─ Turned the offer down → Exit  declined  (cooldown in force)
      └─ timeout → Decision "is one final self-service option worth sending?"
             ├─ A specific guide exists for the step they were stuck on
             │      → Email  that guide, and stop → Exit  normal
             └─ Nothing specific to point at → Exit  normal
```

**State re-checks:** `c.duplicate` before the offer — the decisive one, and what stops ACT-14 chasing
somebody ACT-13 or a human owner is already working. `c.what-happened` reads the answer rather than
assuming silence. `c.outcome` reads whether activation followed before deciding whether anything is
still owed. `c.followup` and `c.final-option` both ask *is there something specific left to say*, and
both carry a branch that sends nothing — the guardrail that keeps this journey from becoming
encouragement.

**Stop conditions:** `assistance_declined` (hard stop plus cooldown, `s.g3`); `activation_recorded`
from anywhere; an open support case or assigned human owner for the same issue (`s.g2`); the
onboarding or trial instance closing; a booking with no recorded outcome (waiting longer will not
produce one); nothing specific left to say.

**Ownership / handoff:** ACT-14 is **below ACT-13** — `c.duplicate` defers when ACT-13 owns a named
requirement on the instance, *"because the struggle is almost always that requirement, and a help offer
beside a blocker reminder is two voices on one problem"* — and below any open case or assigned human
owner. ACT-12 pauses its generic prompts while an ACT-14 session is booked (`s.assisted`, released on
`assisted_session_outcome_recorded` or `booking_cancelled`). Hands to **ACT-16** on activation. Three
rows are owed, all ownership's column:
- `suppressions` += **`s.named-blocker`** (P1-3): *"Where a named mandatory requirement is established
  as the thing preventing activation, the blocker journey (ACT-13) owns the account and this journey
  does not open."* Today `s.g2` defers to an open *support case*, which is not ACT-13, and the two
  triggers can both be true.
- `distinctFrom` += **ACT-19** (P1-2): the two share the identical instance key `account_id +
  person_id`, both message the same person about the same onboarding, both declare
  `competition: "none"`, and neither names the other. Where both are true **this journey holds the
  person**; ACT-19 gains the reciprocal row and an `s.struggling` suppression.
- `distinctFrom` += **ACT-12** (D-10), mirroring `s.assisted`.

**Canonical changes needed:**
- `a.offer` stays **one** action, `channelRoles: ["in-session"]`. No `c.where`, no email variant.
- `a.confirm`, `a.followup`, `a.final`: `channelRoles` → `["persistent"]` each.
- `channelStrategy.roles`: drop the `low-friction` row; `fallback` → `"none"`.
- `channels`: `["email", "in-app", "push"]` → `["email", "in-app"]`.
- `contact.localCap.struggling_user.touches`: **4 → 3**, with the `rule` rewritten to state that the cap
  is the **longest path** and not the node count — offer, booking confirmation, one follow-up — and to
  record that the booking confirmation is a requested transactional message, so the **nudge** budget is
  2 and `s.g4` is its statement.
- `orchestration.touches`: add `after` references (`t2.after = "t1"`, `t3.after = "t2"`,
  `t4.after = "t1"`) so the progression is the reference the schema wants rather than array order.
- The three ownership rows above.
- All four suppressions, `distinctFrom ACT-13`'s existing text and every exit's `reEntry`:
  **unchanged**.

**Display-only changes needed:**
- Four cards, four different single pills and titles: **In-app** offer, **Email** confirmation,
  **Email** follow-up, **Email** final option. Card titles come from `Touch.stage`
  (`offer` / `confirm` / `followup` / `final`), which `touchStages()` already supplies, so the four read
  as four different things at a glance.
- `c.hard-entry` stops being drawn (Tier-A eligibility gate).
- The six shared-terminal instances are the highest in this set and are **correct** — `x.normal` beside
  each branch that reaches it beats one card with four connectors crossing the canvas. Keep.
- `x.defer` should name *which* owner it deferred to; its `state` string already carries "the person
  already handling it", and the branch label on `c.duplicate` is where ACT-13 should be named.

**Renderer changes needed:** none beyond `ChannelPriorityRow` — and once these plans are single-role
that rule stops applying to this journey at all: every card falls through to one channel pill, which is
what the brief asks for. The Tier-A gate collapse is the other generic rule this journey exercises.

---

## ACT-17 — Adoption Nurture

**Purpose:** Carry an account from having produced value once to producing it repeatedly, measured
against its own use-case.

**Current flow:**
```
Trigger core_activation_completed
  → a.recognize  [Primary In-app / Fallback Email]   acknowledge what was produced
  → c.next "does a natural next action follow from what they just did?"
      ├─ Yes → a.surface  [Primary In-app / Fallback Email]  the one action that follows → a.measure
      └─ No  → a.measure
  a.measure (read adoption from value-producing usage)
  → c.stable "has adoption become stable?"
      ├─ Stable → Handoff external customer-lifecycle
      └─ Not yet → a.next-behavior [Primary In-app / Fallback Email] → w.observe
  w.observe (until value_produced; timeout adoption.observation_window)
      ├─ event   → a.measure        ← loop back
      └─ timeout → Handoff ACT-18
```

**Problems found:**
- **The loop nudges on success.** `w.observe` fires on `value_produced` → `a.measure` → `c.stable` →
  not yet stable → **another nudge**. An account producing value steadily but not yet at the rhythm its
  use-case implies is nudged about its behaviour *every time it succeeds* — the exact inverse of the
  `message_after_success` guardrail this journey declares.
- **Nothing in the graph bounds the loop.** Only `adoption.touches` does, at `confidence: low`,
  `basis: example-only`. The graph says 5, the cap says 4, the orchestration map said 3 — three numbers,
  no agreement. This is the worst touch-count row in the corpus.
- **Recognition and the next action are two sends about one event**, back to back with no wait and no
  state change between them. `c.next`'s two branches differ only in whether the second message exists.
- Three touches, one channel plan, rendered Primary/Fallback over `same-role-other-channel`.
- **ACT-17 has no exit nodes at all** — every ending is a handoff, so the canvas shows a journey with no
  visible stop.

**Final orchestration:** `sequential` — two touches, a different `single` channel on each, separated by
a real observation window. No route condition is needed, because each moment already determines its
channel: touch 1 fires on `core_activation_completed`, an event that by definition just happened *in the
product*, so it is **in-app, on the thing they just made**; touch 2 fires after an observation window in
which value did **not** repeat, so by construction they are not in a working session and it is **email**,
which survives until their next one. That is why this journey needs no route split where others might.

**Final customer channels:** `in_app` (recognition) · `email` (one behaviour nudge)

**Customer touch count:** 2 — and the reduction is structural, not a counter: after the redesign **no
path through the graph carries a third customer-facing send.**

**Final flow:**
```
Trigger  Core activation completed
  → Decision "does a natural next action follow from what they just did?"
      ├─ Yes → In-app   name the specific thing they produced, in its own terms, and the one
      │                 action that follows from it — sharing it, repeating it, extending it
      └─ No  → In-app   name the specific thing they produced, and say nothing more
  → Wait  observe   until value_produced
                    timeout adoption.observation_window (required; the use-case's own rhythm)
      ├─ event → Decision "is value being produced repeatedly at this use-case's rhythm?"
      │      ├─ Yes → Handoff  the customer-lifecycle owner
      │      └─ Produced, not yet repeating
      │            → Email   the one behaviour that would produce more value in THIS use-case
      │            → Wait  confirm   until value_produced; same observation window
      │               ├─ event → Decision "is it repeating now?"
      │               │      ├─ Yes → Handoff  the customer-lifecycle owner
      │               │      └─ Still not → Handoff ACT-18 Adoption Recovery
      │               └─ timeout → Handoff ACT-18
      └─ timeout → Handoff ACT-18
```

**State re-checks:** `c.stable` before the nudge and `c.stable-after-nudge` after it — both read
value-producing usage, and the guardrail that *vanity activity does not inflate the adoption state,
being excluded by construction rather than filtered afterwards* is what they read. **There is no path on
which a nudge is sent without the adoption state having been re-read immediately before it.** The two
conditions are separate nodes rather than one node with a back edge, and that is precisely what bounds
the nudge at exactly one with no counter.

**Stop conditions:** value repeating at the use-case's rhythm (→ the lifecycle owner, `s.stable`); the
observation window closing without repeated value (→ ACT-18, `s.stall` — *a nurture nudge is never sent
into a stall*); nothing real to recognise (`s.nothing-real`); an open complaint, live risk case or
declared cancellation intent (`s.contest`); marketing suppression (`s.sunset`).

**Ownership / handoff:** ACT-17 begins where ACT-12 ends (`core_activation_completed`), and its
`distinctFrom ACT-12` is exact: *"onboarding gets someone to value once; this is about the second, fifth
and twentieth time, where the obstacle is habit rather than setup."* It hands its failure case to
**ACT-18** and is ACT-18's own recovery destination — two reciprocal handoffs on one instance key
(`account_id + use_case_id`), which ownership §1.4 rates the right mechanism; a competition group would
add nothing. Two rows are owed: `distinctFrom` += **ACT-18** (D-13, mutual), and **P2-4** —
`s.contest` recites the `retention-outreach` precedence while this journey declares no exclusion group,
so either declare the group with a stated rank or, preferably, rewrite `s.contest` as a state gate:
*"a live risk case (RET-24), an open issue under human ownership or a declared cancellation intent on
the same account means adoption is not the subject; the touch is deferred and re-evaluated against
current state. This journey declares no exclusion group: it hands the use-case to adoption recovery
(ACT-18) rather than contesting it."* The second is the smaller and more honest change, and it also
settles P2-6 for this journey by naming the referent.

**Canonical changes needed:**
- **Merge `a.surface` into `a.recognize`**, and **keep `c.next`**. **Arbitrated:** the domain deleted
  `c.next` and moved the rule inside one message; the matrix requires the merge *and* states that
  `c.next` stays as the gate on whether the merged message carries a next action. The matrix is binding
  on the merge, and keeping the condition also answers the domain's own stated doubt — that a guardrail
  inside a message is weaker than a branch between two nodes. Implement as two **mutually exclusive**
  message variants on `c.next`'s two branches (`a.recognize-next` / `a.recognize-only`), both In-app,
  both → `w.observe`. One touch on either path, `s.nothing-real` preserved as a branch, and the two
  back-to-back sends about one event are gone.
- Delete `a.measure`; move its sentence into `c.stable.observes` and `c.stable-after-nudge.observes`.
- Add `w.confirm` (same `Config` key `adoption.observation_window`,
  `windowExtendsOnEngagement: false`) and `c.stable-after-nudge`; repoint `a.next-behavior.next` to
  `w.confirm`.
- Remove the back edge `w.observe.onEvent → a.measure`; `w.observe.onEvent → c.stable`.
- `contact.localCap.adoption.touches`: **4 → 2**; `confidence: low → medium`; `basis: example-only →
  corpus-rule`; `applicableWhen`: *"one recognition and one behaviour nudge across the early-adoption
  window — the graph's own touch count."*
- `a.recognize-*.channelRoles` → `["in-session"]`; `a.next-behavior.channelRoles` → `["persistent"]`;
  `channelStrategy.fallback` → `"none"`; `channels: ["in-app", "email"]` (unchanged in content, now
  true per stage).
- `orchestration.touches`: `t0` keeps `stage: "recognition"` and absorbs `t1`'s purpose (two variants,
  one stage); delete `t1`; `t2` keeps `stage: "behaviour-nudge"`, `prerequisites: ["c.stable"]`,
  `after: "t0"`.
- `orchestration.strategy`: `"progressive-recovery"` is **wrong** here; if no enum member honestly means
  "a notice and one bounded follow-up", leave `"single-notice"` and record why. Do not invent a strategy
  name to describe two touches.
- `measurement.guardrails` keeps `message_after_success` — it now has a graph that cannot violate it.
- The two ownership rows above. All six suppressions and all three guardrails otherwise **unchanged**.

**Display-only changes needed:**
- `c.stable` and `c.stable-after-nudge` ask the same question at two stages, and must render in **one
  recognisable form** so a reader sees *the same question, asked again* rather than two unrelated
  decisions. This journey is the cleanest place in the library to land that pattern.
- The `c.next` fork is a message-variant fork: the card must foreground what differs (whether a next
  action is named), not repeat an identical channel block on both arms.
- `h.stall` is reached from three branches and `h.normal` from two; per-parent instancing handles that
  and both stay drawn.
- The journey has **no exits at all**, so the detail page must state that it ends by handing off to
  Adoption Recovery or the lifecycle owner, rather than showing a journey with no visible stop.

**Renderer changes needed:** `ChannelPriorityRow` (it stops applying to this journey once both touches
are single-role); the repeated-question rendering rule — a condition that re-asks an earlier condition's
question renders in one recognisable form, keyed on the authored question, not on a journey id; the
message-variant fork rule — where a drawn decision forks into two message cards, the card's prominent
space carries what differs, not the channel block that is identical.

---

## ACT-18 — Adoption Recovery

**Purpose:** Work out why value stopped recurring before doing anything about it — including the case
where nothing is wrong.

**Current flow:**
```
Trigger expected_adoption_pattern_not_met
  → a.diagnose  [ABSORBED — writes nothing, degree 1]
  → c.type "what does the evidence show?"
      ├─ Recoverable blocker → a.recover  [Primary Email / Fallback Push]
      ├─ Needs a person      → Handoff  external human-in-the-loop
      ├─ Need genuinely met  → Exit satisfied
      └─ No evidence         → Exit no-intervention
  a.recover → w.recover (until value_produced; timeout adoption_recovery.window)
      ├─ event   → Handoff ACT-17
      └─ timeout → Handoff  external health monitoring
```

**Problems found:**
- **`a.diagnose` is absorbed and it is the whole journey.** The stated purpose is *"work out why value
  stopped recurring before doing anything about it"*, and this node is that act; the reader sees a
  trigger going straight into a four-way decision with the diagnosis nowhere. It is absorbed because it
  declares no `writes` — yet it produces `diagnosed_blocker`, which **every downstream handoff contract
  requires**. The data is simply incomplete.
- Email + Push declared as one plan and rendered Primary/Fallback, with nothing in the journey that
  resolves between them.
- `x.satisfied` (`class: invalid-state`) and `x.no-intervention` (`class: no-action`) are the two best
  exits in the domain and nothing on the card distinguishes *they finished* from *we found nothing*.

**Final orchestration:** `single` — one message, or none. The diagnosis decides **whether** anything is
sent (two of `c.type`'s four branches send nothing and a third hands to a person), not which channel
carries it; with push withdrawn there is no route left to choose, so the pattern is single and the
decision that matters stays a business decision. **Arbitrated:** the domain proposed conditional routing
by diagnosis (push for a one-step blocker, email otherwise) behind a new `c.one-step` condition; the
matrix is binding and makes it `single` → email, on the grounds that a push to somebody who has stopped
using the product is the least likely delivery and the wrong register for *"here is what was in your
way"*. Applied the matrix — which is also the alternative the domain audit itself named as the more
conservative reading of the "do not invent" rule, since `c.one-step` has never been evaluated against
data.

**Final customer channels:** `email`

**Customer touch count:** 1, and often **0**. This is the one journey in the set whose most common
correct outcome is silence, and that must not be designed away.

**Final flow:**
```
Trigger  Expected adoption pattern not met
  → Diagnose   what does the evidence actually show — unfinished setup, a missing integration, no
               clear next use-case, collaborators who never joined, a technical blocker, or a
               use-case that is finished and needs nothing further   (writes diagnosed_blocker)
  → Decision "what does the evidence show?"
      ├─ Something specific is in the way
      │      → Email   the blocker named and explained, with what clears it
      │      → Wait  recover   until value_produced
      │                        timeout adoption_recovery.window (required; the product's rhythm)
      │         ├─ event   → Handoff ACT-17 Adoption Nurture
      │         └─ timeout → Handoff  health monitoring
      ├─ A technical problem a message will not solve → Handoff  human-in-the-loop
      ├─ The use-case was completed — the account got what it came for → Exit  need met
      └─ Usage looks light against a generic expectation, nothing indicates a problem
             → Exit  no intervention
```

**State re-checks:** there is one touch, so there is no second-touch re-read to do — and that is the
design. The re-check that matters is the diagnosis **before** the touch, and `c.type`'s two silent
branches are its teeth: `s.no-evidence` (*"encouragement into silence is the failure this journey exists
to avoid"*) and `s.need-met`.

**Stop conditions:** `value_produced` (→ ACT-17); the recovery window closing (→ health monitoring, with
adoption-frequency messaging for this use-case suppressed on the way out); the need turning out to be
met; no evidence of a problem; a blocker needing a person (`s.human` — *no automated touch alongside a
human intervention*); any open issue under human ownership, live risk case or declared cancellation
intent (`s.contest`, this journey being lowest in `retention-outreach`).

**Ownership / handoff:** ACT-18 is ACT-17's stall destination and ACT-17 is ACT-18's recovery
destination; `adoption_recovery.cooldown` (30–90 days) is what stops the pair oscillating. Its
`distinctFrom ACT-14` is precise and stays: *"ACT-14 is pre-activation and triggered by help-seeking;
this is post-activation and triggered by silence, where the most common correct answer is that nothing is
wrong."* Owed: `distinctFrom` += **ACT-17** (D-13), and the P2-6 naming fix — replace *"a live risk
case"* with *"a live risk case (RET-24)"* and state the referent of *"an open issue under human
ownership"* by id rather than by phrase. Not reopened otherwise.

**Canonical changes needed:**
- `a.recover` stays **one** action, `channelRoles: ["persistent"]`. No `c.one-step`, no push variant.
- `channelStrategy.roles`: drop the `low-friction` row; `fallback` → `"none"`; `channels: ["email"]`.
- Give `a.diagnose` `writes: [{ field: "diagnosed_blocker", mode: "set" }]`. It already produces that
  value — every downstream handoff contract requires it — and recording it is both honest and what keeps
  the node drawn. **Arbitrated, mildly:** the canvas audit rates this absorption *right* (§3.1, "analysis
  steps whose output is the question the very next Decision card asks) — but it rated the node **as
  authored today**, writing nothing. Once the `writes` is corrected, the structural rule draws it on its
  own, with no special case; that is the fix, and the node must not be exempted by id.
- `contact.localCap.adoption_recovery.touches`: **unchanged at 1**. Its `rule` — *"one recovery touch per
  diagnosed blocker; a second touch on the same diagnosis is pressure, not help"* — is the best cap
  sentence in the domain and should be the model for the others.
- The two ownership rows above. Six suppressions, three guardrails, four exit classes and three handoff
  contracts otherwise **unchanged**.
- **Flagged, not decided:** `x.satisfied.class` is `invalid-state` for what is plainly a success — the
  account got what it came for. Whether it should be `success` is a canonical question for the class
  taxonomy, not something to settle inside one journey.

**Display-only changes needed:**
- The diagnosis is drawn, as a consequence of the corrected `writes` and nothing else.
- `c.type` stays drawn, with its four short branch labels — *Recoverable blocker* / *Needs a person* /
  *Need genuinely met* / *No evidence of a problem*. Three of the four send nothing, which is the
  journey's whole discipline and must be visible.
- `x.satisfied` and `x.no-intervention` must read differently on the canvas; a reader should not have to
  open the card to tell *they finished* from *we found nothing*.
- One Email pill on the recovery card, no rank label.

**Renderer changes needed:** `ChannelPriorityRow`; `absorbableBookkeeping` reading the authored `writes`
array rather than `meta` prose — the same structural rule stated above — which is what lets a corrected
data field change the drawing without a journey-specific branch; an exit card's ending class must be
legible on the card.

---

## ACT-19 — Onboarding Personalization

**Purpose:** Get the one piece of context onboarding needs to choose a path — only when not having it
would actually change that path.

**Current flow:**
```
Trigger onboarding_needs_named_role_or_use_case
  → c.declared "does a reliable declared value already exist?"
      ├─ Yes → a.reuse [ABSORBED] → a.adapt → Handoff ACT-12
      └─ No  → c.material "would the answer materially change the path to value?"
            ├─ Yes → a.ask  [Primary Email / Fallback In-app]
            └─ No  → Exit  do not ask
  a.ask → w.answer (until question_answered; timeout role_use.answer — a short response window)
      ├─ event   → a.persist (declared_context) [drawn EN, ABSORBED TR] → a.adapt → Handoff ACT-12
      └─ timeout → a.default [ABSORBED] → Handoff ACT-12
```

**Problems found:**
- **The one weakness is the channel, and it is the domain's core question in miniature.** This is a
  question asked in the middle of someone's setup — the journey's own wait rule says so: *"a short
  window; this is a question in the middle of someone's setup, not a survey."* Where it arrives is not a
  delivery detail, it changes what the question *is*. Declared as two roles on one card and rendered
  Primary/Fallback.
- **`a.persist` is drawn on EN and absorbed on TR** — the locale bug, here hiding the node that enforces
  this journey's single most important guardrail (`s.g1`: behavioural inference is never written into
  the declared field). On the Turkish route the guardrail's executable form is invisible.
- **`a.default` is absorbed** and carries the same guardrail on the timeout arm (*"the default is not
  written into the declared field as though somebody had chosen it"*). It writes nothing, so the rule
  takes it; the detail panel's *Represented canonical steps* is the correct mitigation and must be
  verified on both routes.
- Otherwise close to exemplary: one touch, a genuine "do not ask" exit, a short window, and a documented
  default rather than an indefinite hold.

**Final orchestration:** `single` — one question, never repeated, and an unanswered question must not
hold up the path to value. **Arbitrated:** the domain routed the single touch (in-app in session, email
otherwise, via a new `c.where`); the matrix is binding and makes it `single` → **in_app**, on the
journey's own wait rule — *a question asked in the middle of setup is asked in the setup*, and emailing
it turns one lightweight question into a survey, which is the thing `s.g3` exists to prevent. Applied the
matrix: **no `c.where`, no email variant.** This journey's one customer-facing action is in-app, which
satisfies the corpus rule.

**Final customer channels:** `in_app`

**Customer touch count:** 1

**Final flow:**
```
Trigger  Onboarding needs a named role or use-case
  → Decision "does a reliable declared value already exist?"
      ├─ Stated before, still current → Record that it was reused rather than re-asked
      │        → Apply the adaptations → Handoff ACT-12
      └─ Nothing declared — only behaviour, which is not the same thing
            → Decision "would the answer materially change the path to value?"
                  ├─ The path is the same whatever they answer → Exit  do not ask
                  └─ Different answers lead to genuinely different setup, examples or first actions
                        → In-app   one question, inline in the setup flow, answerable in one step
  → Wait  answer   until question_answered
                   timeout role_use.answer (required; a short response window)
      ├─ event   → Persist the declared value with its source and time, in a field that only ever
      │            holds declared answers   ◀ DRAWN ON BOTH LOCALES
      │            → Apply the adaptations → Handoff ACT-12 Onboarding Nurture
      └─ timeout → Continue on a documented default path, recording that no declared value exists —
                   the default is never written into the declared field → Handoff ACT-12
```

**State re-checks:** `c.declared` is the re-check that prevents the commonest failure — asking again for
something already given. `c.material` is a re-check of *our own* need rather than the customer's state,
and it is the reason this journey sends nothing most of the time. There is no second touch, so no
further re-read is owed.

**Stop conditions:** `question_answered`; the short response window expiring (→ documented default,
never a second ask); a reliable declared value already existing; the answer not changing the path.
Cooldown `"none"` is correct and must not be "fixed": there is nothing to cool down because nothing is
ever re-asked.

**Ownership / handoff:** ACT-19 **chooses** the onboarding route; ACT-12 walks it. While the question is
outstanding ACT-19 owns the onboarding conversation on the same channels and ACT-12 holds its generic
prompts (`ACT-12.s.personalizing` names this journey's own node ids). Every path ends in `h.progress →
ACT-12`, carrying the declared value with its source **or the explicit fact that there is none**, plus
which adaptations were applied so they are not applied twice. Owed, from ownership **P1-2** — ACT-19 and
ACT-14 share the identical instance key `account_id + person_id`, both message the same person about the
same onboarding, and neither names the other:
- `suppressions` += `s.struggling`: *"An open assisted-help session (ACT-14) for the same person
  suppresses this journey's question. Somebody who is visibly stuck and has asked for help is not also
  asked to describe their role; the question waits until that session resolves, and where the onboarding
  decision has already been defaulted by then, it is not asked at all."*
- `distinctFrom` += **ACT-14**, reciprocal to the row ACT-14 gains.
This journey must not offer help and must not name a blocker; those are ACT-14's and ACT-13's.

**Canonical changes needed:**
- `a.ask` stays **one** action, `channelRoles: ["in-session"]`. No `c.where`, no email variant.
- `channelStrategy.roles`: drop the `persistent` row; `fallback` → `"none"`; `channels: ["in-app"]`.
- `contact.localCap.role_use.touches`: **unchanged at 1** — it is already a true customer-touch cap.
- The two ownership rows above (P1-2).
- All three guardrails, `s.sunset`, `distinctFrom ACT-12`, the cooldown, and `a.reuse` / `a.persist` /
  `a.default` / `a.adapt`: **unchanged**.

**Display-only changes needed:**
- `a.persist` is drawn on **both** routes — it is where `s.g1` is enforced.
- `a.default` stays absorbed into `h.progress`, which is acceptable **only** because the detail panel
  lists it under *Represented canonical steps*; verify that it does on the TR route too.
- `x.dont-ask` is one of the most valuable cards in the corpus — a journey deciding not to speak — and
  should not be rendered as a faint terminal stacked at the bottom of the canvas.
- One In-app pill on the question card, no rank label.

**Renderer changes needed:** the structural `absorbableBookkeeping` fix and the `G7_LOCALE_STRUCTURE`
gate, both stated above; `ChannelPriorityRow`; terminal stacking — an ending that carries a decision the reader
should see is laid out beside the decision that reached it, not banked at the foot of the canvas.

---

## ACT-20 — Dormant Lead Reactivation

**Purpose:** Make one bounded attempt to restart a relationship that never became a paying one, and
judge the result on what the person actually did.

**Current flow:**
```
Trigger engaged_non_customer_became_dormant
  → c.never-monetized "has this relationship ever been monetised in this context?"
      ├─ Never paid → a.reason [ABSORBED] → c.worth-it
      └─ Was a paying customer → Exit  belongs to win-back
  c.worth-it "is there a credible reason, and is this person still eligible and contactable?"
      ├─ Worth one attempt → a.attempt  [Primary Email / Fallback Push]
      └─ Not worth it → Exit  no reason
  a.attempt → w.return (until meaningful_return; timeout dormant_non.return)
      ├─ event   → a.inspect [ABSORBED] → c.state "what state did they actually return into?"
      │        ├─ Unfinished onboarding → Handoff ACT-12
      │        ├─ Renewed commercial intent → Handoff ACQ-03
      │        ├─ No current qualification → Handoff ACQ-05
      │        └─ Signal did not survive inspection → Exit  engagement only
      └─ timeout → Exit  sunset (cooldown in force)
```

**Problems found:**
- **Push is declared for somebody who has gone quiet.** `low-friction` is *"a valid token or app session
  exists and the message is a single step from the notification"*; the trigger is dormancy, so by
  construction there is no app session, and the attempt is built on *the recorded reason* — unfinished
  setup, an interest expressed, something now relevant, a real change in the product — which is content
  that needs explaining. This is the brief's "do not rely on a channel that assumes an active audience to
  recover someone who has stopped using the product."
- `c.worth-it` joins a genuine business question (*is there a credible reason?*) to an eligibility and
  contactability test in one node, and the canvas audit classes the whole card as a permission gate that
  does not change the visible route. As authored it is both things at once, which is why it is hard to
  classify — and the internal step that establishes the reason (`a.reason`) is absorbed, so on the
  current drawing the journey's most distinctive rule is invisible on both routes.
- Nothing else. `a.inspect` (*"opening the message is not returning"*) and `x.engagement-only` are the
  corpus's clearest statement that a journey must not report its own message as a result, and
  `c.never-monetized` correctly routes former customers out to win-back rather than competing with it.

**Final orchestration:** `single` — one bounded attempt, one channel, one window, then a cooldown. No
condition, no route, no second touch. The brief explicitly permits `Trigger → … → Email → Exit`, and this
is the case that permission exists for: **a promotional attempt at somebody who has already stopped
answering earns exactly one message and no cleverness.** Domain and matrix agree; nothing to arbitrate.

**Final customer channels:** `email`

**Customer touch count:** 1

**Final flow:**
```
Trigger  An engaged non-customer became dormant
  → Decision "has this relationship ever been monetised in this context?"
      ├─ A monetised relationship exists or once existed → Exit  belongs to win-back
      └─ No customer or paid relationship exists or has existed
            → Establish the reason   is there something specific to come back for — setup never
              finished, an interest expressed, something now relevant, a real product change
            → Decision "is there a credible reason to make one attempt?"
                  ├─ No specific reason → Exit  nothing worth saying
                  └─ A specific reason exists
                        → [eligibility and contactability gate — authored, collapsed]
                        → Email   one bounded attempt built on the recorded reason; never a general
                                  note that they have been missed, which says nothing and asks for
                                  nothing
  → Wait  return   until meaningful_return
                   timeout dormant_non.return (required; the reactivation window)
      ├─ event → Inspect what actually moved   opening the message is not returning
      │      → Decision "what state did they actually return into?"
      │            ├─ An onboarding instance is open and setup resumed → Handoff ACT-12
      │            ├─ Intent stronger than the record holds → Handoff ACQ-03
      │            ├─ Back, with nothing on record about qualification → Handoff ACQ-05
      │            └─ Engagement with the message and nothing more → Exit  engagement only
      └─ timeout → Exit  reactivation window closed; cooldown in force
```

**State re-checks:** the reason, eligibility and contactability are read together before the one send.
`a.inspect` + `c.state` re-read *what actually moved* before anything is declared — the journey's whole
claim to honesty, and it must stay.

**Stop conditions:** `meaningful_return` (→ whichever journey owns the state they returned into); the
reactivation window closing (cooldown `required: true`, the only required cooldown in this domain); no
credible reason; permission or eligibility lapsed; a former paying relationship; any current lifecycle on
the same person (lowest in `lifecycle-stage`, `onLoss: "exit"` — it leaves rather than queues); marketing
suppression (`s.sunset`).

**Ownership / handoff:** ACT-20 owns nothing for long — three of its four return states hand straight out
(**ACT-12**, **ACQ-03**, **ACQ-05**), each carrying the dormancy so the receiver does not read the return
as first-time interest. Former paying customers are out of scope by construction; win-back is a different
journey with different economics (`s.g2`, `x.winback`, `distinctFrom ACQ-07`). Owed, from ownership
**P2-7**: `lifecycle-stage` binds this journey and ACT-12 and orders neither, and `h.onboarding → ACT-12`
exists while ACT-12 does not acknowledge it — the precedence and `distinctFrom` rows are written on
ACT-12's side above, and this journey's own precedence (*"lowest in the group — any current lifecycle on
the same person outranks reactivation"*) is already correct and needs no change. This journey must never
speak as if the person were a customer.

**Canonical changes needed:**
- `a.attempt.channelRoles`: `["persistent", "low-friction"]` → `["persistent"]`;
  `orchestration.touches[t1].channelRoles` → `["persistent"]`.
- `channelStrategy.roles`: drop the `low-friction` row; `fallback` → `"none"`;
  `channels: ["email", "push"]` → `["email"]`.
- **Split `c.worth-it`** into the business question and the gate: `c.reason` — *"is there a credible
  reason to make one attempt?"*, branches *A specific reason exists* → the send / *No specific reason* →
  `x.no-reason` — with the eligibility-and-contactability half moving into the send-path gate in front of
  `a.attempt`. Nothing new is read: both halves are in that node's text today. This is what lets the
  business decision stay on the canvas while the permission test collapses with the other 33, instead of
  the whole card being classed as a gate and disappearing with the rule the journey is built on.
- Everything else — cap, cooldown, four suppressions, three guardrails, five terminals, three handoff
  contracts: **unchanged**.

**Display-only changes needed:**
- One Email pill, no rank label; with a single channel the priority row stops rendering entirely, which
  is the correct end state for this journey.
- `c.reason` is drawn; the eligibility gate is not.
- `a.reason` and `a.inspect` remain absorbed (no `writes`, degree 1). `a.inspect` in particular carries
  the sentence that distinguishes a return from an open, and it is folded into the condition that asks
  the same question — defensible, but the caption and the detail panel must carry it: verify
  *Represented canonical steps* lists both on **both** routes.
- Five terminals on a 13-node canvas: check for terminal stacking at the foot of the layout.
- The trigger card reads as an event, not as *"Engaged non customer became dormant"* with a provenance
  chip.

**Renderer changes needed:** none specific to this journey. It exercises the same generic rules named
elsewhere — the single-group channel pill, the Tier-A gate collapse, terminal stacking and the
trigger-card provenance rule.

# Refactor plan — part 2

**Scope:** 17 journeys. RET/CON: `RET-24` `RET-26` `RET-28` `RET-30` `RET-31` `RET-32` `RET-290`
`RET-292` `RET-293` `RET-294` `RET-295` `CON-272` `CON-300`. FBK: `FBK-41` `FBK-42` `FBK-43`
`FBK-49`.

**Sources consolidated:** `audit/refactor/retention.md` (C) and the FBK half of
`audit/refactor/feedback-time.md` (D) for business flow, waits, touch counts, state re-checks,
stop conditions and canonical edits; `audit/refactor/orchestration-matrix.md` (J) for the
orchestration pattern and final channels of every communication stage;
`audit/refactor/ownership.md` (I) for ownership, precedence, handoffs and `distinctFrom`;
`audit/refactor/canvas.md` (K) for what is drawn, collapsed and rendered. Facts quoted from the
corpus were re-verified against `audit/public-journeys-current-state.json`, `src/canonical/`
and `scripts/validate-public-scope.mjs` rather than taken on trust.

**What I arbitrated.** Seven questions needed a decision rather than a transcription. (1) **RET-24**
is applied as `_ARBITRATION.md` settles it — C's customer-facing stage stands, J's refusal is
recorded as a dissent inside the section, and the deciding evidence (`retention_intervention_delivered`
is RET-30's trigger and nothing in the corpus emits it — verified: two occurrences in `src/`, RET-30's
own trigger and the registry row) is stated there in full. (2) **RET-28** is the one place where the
domain audit cites evidence the matrix did not consult — the trigger's own `evidence.requires`
enumerates three intake routes — so it is marked `CONFLICT — ESCALATED`, C's conditional routing is
applied, and J's single/in-app verdict is recorded beside it. (3) **CON-300's `c.sendable2`** is
marked `CONFLICT — ESCALATED`: K classifies it as a permission gate that does not change the visible
route, C shows its short arm is the journey's declared end state, and K's own P1-4 concedes
`a.suppress` deserves a card — applied as "keep the decision drawn, re-kind the suppression as an
outcome". (4) **FBK-41**: J examined the exact split D proposes, found `experience_ref` does not
carry the experience type, and refused to invent it. J wins; the journey is single/email, D's design
is recorded with the signal that would revive it. (5) **FBK-49's channels**: D's two-channel request
card is exactly the defect J exists to remove; J wins (email), and the new rejection touch D adds is
given the same treatment. (6) **FBK-42's light ask** loses D's push substitute — J reduces push to
three journeys corpus-wide and none is in this set. (7) **The absorbed "establish the facts" nodes**
are split on K's own §4.3(3) criterion: where K named the node as correctly absorbed and the host
card carries its meaning (`FBK-42 a.evaluate`), no canonical edit is made for display reasons; where
the host card cannot carry it (`RET-30 a.verify`, `FBK-49 a.retrieve`), the node declares the state
it produces and its card returns under the unchanged generic rule. Two smaller calls are recorded in
place: RET-32's `c.eligible` is an eligibility gate under K §2.2 Tier A and collapses (C described
today's behaviour, not a requirement), and RET-295's send gate is folded in canonical by C while
K's generic no-action-arm rule handles the display.

**Counts used below** are read from the export: RET-24 13 canonical / 14 display nodes,
FBK-43 34 / 32 with a five-entry touch plan, CON-300 21 / 21, RET-292 7 / 6. `task` is never a
customer channel anywhere in this plan.

---

## RET-24 — Churn Risk Escalation

**Status: ARBITRATED (`_ARBITRATION.md` §1). C's design stands; J's dissent is recorded below.**

**Purpose:** Decide how hard to push back on a relationship that is drifting, in proportion to how
much independent evidence there actually is — and, before spending a person's time on it, give the
customer the one chance to say what is actually wrong.

**Current flow:**

```
Churn risk threshold crossed
  → Has explicit cancellation intent already been expressed?
      ├ Already cancelling ──────────────► Handoff: Cancellation Save (RET-28)
      └ No stated intent
  → [Assemble the signals with their sources and strengths]      (writes risk_evidence)
  → Is the risk driven by a known operational problem?
      ├ Known problem ───────────────────► Handoff: Health Deterioration Diagnosis (RET-23)
      └ No known problem
  → Does the evidence justify a person?
      ├ Justified → Does a higher-precedence contender already claim this account?
      │                ├ Clear     → [Owner task — human] → Handoff: external human lifecycle
      │                └ Contended → Exit: "risk recorded, nothing proportionate to do"
      └ Not justified → Is a proportionate automated recovery available?
                       ├ Available            ──────────► Handoff: Retention Offer Follow-Up (RET-30)
                       └ Nothing proportionate → Exit (same x.monitor)
```

13 canonical nodes, 14 display nodes, **zero communication actions**, `channels: ["task"]`.

**Problems found:**

- No customer-facing channel at all — the only public journey in that position, and the only entry
  in `CHANNEL_RULE_EXCEPTIONS` (`scripts/validate-public-scope.mjs:85`). Breaks the hard rule that
  every public journey ends in at least one genuine customer-facing communication action. (C; J
  §5-1 recorded the same fact and refused to fix it.)
- **`h.intervention` hands off to a journey that cannot start.** RET-30's trigger is
  `retention_intervention_delivered`, whose evidence requires "a defined intervention *actually
  delivered*" and whose `insufficientAlone` explicitly rejects "an intervention scheduled but not
  yet delivered". **Verified against source: `retention_intervention_delivered` occurs exactly
  twice in `src/` — `src/canonical/retention.ts:2698` (RET-30's own trigger) and
  `src/canonical/events.ts:431` (the registry row). Nothing emits it.** RET-24 decides an
  intervention is available and then hands off as though it had been sent. (C, F5.)
- `x.monitor` carries two unrelated endings in one `reEntry` sentence: "nothing proportionate to do"
  (a judgement about evidence) and "a higher-precedence contender owns this account" (a contention
  outcome). (C.)
- The escalation decision runs on entry evidence, before anything has been attempted, so the
  journey's own rule `s.g4` — the size of the intervention tracks the strength of the evidence — is
  applied once and never re-read. (C.)
- `a.evidence` is drawn on EN and absorbed on TR. It writes `risk_evidence`, real state, and it is
  the justification the entire journey rests on. (C F3; K P0-1, one of five journeys.)
- `a.owner-task` (`execution: "human"`, `customerFacing: false`) renders as **`Primary: Task`** —
  and it is this journey's only message-shaped card, so RET-24's entire customer-facing presence on
  the canvas today is an internal work item. (K §P0-2 Defect A; J §4.2; `_ARBITRATION.md` §4.)

**Why a customer stage, in one paragraph.** Every routing signal it needs is already authored in
RET-24's own data: the trigger's `evidence.requires` enumerates the signal classes (sustained usage
decline · a failed renewal or payment · a negative support experience · repeated unresolved blockers ·
explicit dissatisfaction · exploration of cancellation · a key stakeholder leaving · falling
account-wide adoption), and `a.evidence` already records them with sources and strengths into
`risk_evidence`. `s.g4` requires proportionality, and the cheapest proportionate response to an
inferred risk the customer has not confirmed is to **ask them**, not to spend a person's time or make
a save offer. `contact.localCap` is `churn_risk.touches`, default **1** — one touch is exactly the
budget the journey already declares. And RET-24 is the only journey that holds the evidence and mints
the `retention_episode_id`, so this is not inventing a send: it is supplying the one the corpus
already assumes happened.

**J's dissent, recorded:** the orchestration matrix marked this row `NONE — internal only`, wrote
*"the journey's product is a decision about who acts, not a message … it should not be given a
fabricated customer touch to satisfy the corpus rule"*, and escalated it as a scope question (either
RET-24 moves off the library onto the mechanism surface, or a customer stage is specified for it by
the scope owners). J did not have C's F5 finding. The arbitration records that as the deciding
difference.

**Final orchestration:** **conditional routing**, one touch, then an event-or-timeout re-check, then
the internal escalation. The evidence class already recorded in `risk_evidence` selects the surface;
the two arms address materially different customers and neither substitutes for the other, so this is
routing and explicitly **not** fallback. Nothing is "tried first".

**Final customer channels:** **Email** (disengagement arm) · **In-app** (in-product friction arm).
`task` remains declared to back `a.owner-task` and is filtered from the public badge row by
`publicChannels()`. No push (nothing records a device registration), no SMS (nothing asserts a time
bound).

| branch | signal classes read from `risk_evidence` | channel | why |
|---|---|---|---|
| **Disengagement** | sustained usage decline · falling account-wide adoption · a key stakeholder leaving · a failed renewal or payment | **Email** | by the definition of the signal the person is not in the product. The brief's own rule forbids relying on in-app to recover someone who has stopped using it; the check-in has to reach them where they are and carry a route to a person. |
| **In-product friction** | repeated unresolved blockers · a negative support experience · explicit dissatisfaction | **In-app** | the risk was generated by something failing *inside* the product, where the person still is. The check-in belongs beside the thing that is failing; an email about a blocker they are looking at right now is worse than a prompt on it. |

**Customer touch count:** **1** — matching `churn_risk.touches` default of 1, unchanged.

**Final flow:**

```
Trigger: Churn Risk Detected
  ├─ Decision: Has a cancellation already been declared?
  │     ├ Already cancelling ──────────► Handoff: Cancellation Save (RET-28)
  │     └ No stated intent
  ├─ [Assemble the evidence with its sources and strengths]      ← internal, stays drawn, both locales
  ├─ Decision: Does the evidence name an operational cause that already has an owner?
  │     ├ Known problem ──────────────► Handoff: Health Deterioration Diagnosis (RET-23)
  │     └ No known problem
  ├─ Decision: Is a proportionate check-in available, and is this account uncontended?
  │     ├ Contended, or nothing proportionate ──► Exit: another owner holds this account /
  │     │                                          evidence too thin to act
  │     └ Proportionate
  ├─ Decision: What kind of risk is this?                        ← routes the channel, stays drawn
  │     ├ Disengagement        → Message: Risk check-in (Email)
  │     └ In-product friction  → Message: Risk check-in (In-app)
  ├─ Wait: until the relationship recovers, a cancellation is declared, or the window closes
  └─ Decision: Did the relationship state move?
        ├ Recovered ──────────────────► Exit: risk cleared without escalation
        ├ Cancellation declared ──────► Handoff: Cancellation Save (RET-28)
        ├ Answered / intervention taken ─► Handoff: Retention Offer Follow-Up (RET-30)
        └ No change
              └─ Decision: Does the unanswered evidence now justify a person?
                    ├ Justified     → [Owner task — human, internal] → Handoff: external human lifecycle
                    └ Not justified → Exit: risk recorded, monitored
```

The check-in carries **no offer and no discount** — offers belong to RET-28 and RET-30. It names what
we can see is going wrong and gives a route to a person. **The internal escalation stays internal and
stays a `task`**; it simply moves to *after* the check-in window, so a person's attention is spent on
a relationship that did not answer rather than on one that would have replied to an email.

**State re-checks:** before the check-in, cancellation intent, operational-cause ownership and the
`retention-outreach` contest are re-read (three existing decisions, unchanged in kind, with the
contention question moved forward so nothing is sent into an account somebody already works).
`w.response.recheck` re-reads the relationship state and the cancellation record from the system of
record before acting on the timeout. `c.human` now runs on **post-check-in** evidence.

**Stop conditions:** `relationship_recovered` · `explicit_cancellation_intent` (routes to RET-28, not
to the escalation) · a higher-precedence `retention-outreach` contender claiming the account
mid-window (`onLoss: "suppressed"`, already declared) · the check-in window timing out. **Both wait
events already exist in `src/canonical/events.ts`, so no `scripts/event-curation.json` change and no
`build-event-registry.mjs` run is required.**

**Ownership / handoff:** unchanged in structure — RET-28, RET-23, RET-30, external human lifecycle.
Two edges move: RET-28 becomes reachable twice (at entry and from the post-check-in decision), and
RET-30 is now reached **after a real delivery** rather than instead of one, which is the relationship
its handoff's `carries` block already describes. I re-verified with I §1.5 that nothing else needs
saying: RET-24's precedence already reads *"below an open issue under human ownership and below a
declared cancellation intent on the same account, above generic retention intervention"*, the
`h.cancellation` handoff already carries `suppresses: ["any separate retention track for this
relationship while the cancellation decision is live"]`, and I §4-1 lists RET-24 as checked and
correct. **This journey must not claim** the cancellation conversation (RET-28's), the diagnosis of a
known operational fault (RET-23's), or the outcome of the intervention (RET-30's). The
`retention_episode_id` minted at `h.intervention` today should be minted at `a.check-in` — that is
where the episode becomes real — and carried on the handoff unchanged.

**Canonical changes needed:**
1. `channels: ["task"]` → `["email", "in-app", "task"]`.
2. `contact.channelStrategy.roles`: add `persistent → email` (*"the risk is disengagement; the person
   is not in the product"*) and `in-session → in-app` (*"the risk is in-product friction; the check-in
   belongs beside the thing that is failing"*), keep `human → task`, set `fallback: "none"` — these
   are alternatives, not a cascade.
3. New condition `c.signal-class`, *"What kind of risk is this?"*, two branches, each
   `observes: "risk_evidence"`, placed after the contention gate.
4. New action `a.check-in`, `execution: "communication"`, on each branch of `c.signal-class` (two
   nodes; see *Renderer changes* for the single-node alternative),
   `writes: [{ field: "retention_episode_id", mode: "set" }]`.
5. New wait `w.response`: `untilEvent: ["relationship_recovered", "explicit_cancellation_intent"]`,
   `timeout.after` keyed `churn_risk.response_window`, `class: "response-window"`, `required: true`,
   `windowExtendsOnEngagement: false`, `relativeTo: "previous-touch"`, with a `recheck` sentence.
6. New condition `c.moved`, *"Did the relationship state move?"*, four branches as drawn.
7. `c.human` moves to after `c.moved`'s "No change" arm; `c.priority-clear`'s contention question
   moves **forward** to before the check-in — the same question, asked once, in the right place.
8. `orchestration.strategy` `"single-notice"` → `"conditional-routing"`; `orchestration.touches`
   gains `t-checkin` (`stage: "risk-check-in"`, `action: "a.check-in"`,
   `channelRoles: ["persistent","in-session"]`, `mandatory: false`), with the existing owner-task
   touch renumbered after it and excluded from the customer count (it is `channelRoles: ["human"]`).
9. `x.monitor` splits into `x.contended` (class `suppression`) and `x.monitored` (class `no-action`),
   each with its own honest `reEntry` text.
10. New exit `x.recovered`, class `success`.
11. `contact.localCap` stays `1`; `pressureClass` stays `none`.
12. **Do not** add `s.sunset` and **do not** move `contact.defaultPriority` off `retention` — a
    relationship-at-risk check-in is not promotional contact, and
    `scripts/sunset-suppression-evidence.mjs` fails in both directions (C, F4).
13. **Delete the `RET-24` entry from `CHANNEL_RULE_EXCEPTIONS` in
    `scripts/validate-public-scope.mjs` in the same commit, leaving the `Map` empty with its comment
    intact.** Both halves of check 3 are then satisfied: `channels` contains `email` and `in-app`
    (both in `CUSTOMER_CHANNELS`), and `a.check-in` carries `execution: "communication"`. Check 5
    (journeys whose canonical channels include an operational value) still names RET-24 because
    `task` stays, and needs no edit. Keeping the empty map preserves the discipline — a list with a
    reason, printed every run — for the next journey that tries to claim an exception.

**Display-only changes needed:**
- `a.evidence` keeps its card on **both** locales.
- `c.signal-class` must be drawn: it materially changes the customer's route, which is the brief's
  stated exception to hiding gates.
- The contention gate `c.priority-clear` stays drawn — it changes who owns the account, which is a
  business decision, not an implementation gate. (K §3.3 confirms the current gate rule already
  protects RET-24's "is a proportionate automated recovery available?" card.)
- Trigger card reads **"Churn Risk Detected"**, not `Trigger churn_risk_threshold_crossed Authoritative`.
- `a.owner-task` stops rendering a channel pill of any kind.

**Renderer changes needed:** the locale-invariance fix (structural `writes` on `FlowNode`, never
localised `meta`; lay out once on unlocalised nodes) plus the gate that compares the drawn node and
edge sets across locales — without it any newly drawn internal action vanishes on TR again. The
human-action rule: an action with `execution: "human"` or `customerFacing: false` never enters the
channel-priority row and the string `Task` never appears where a channel appears. A new `Touch.stage`
value requires its Turkish row in the stage dictionary in the same commit (glossary rule). If the
check-in is authored as one node whose channel is branch-resolved rather than two nodes, the layout
engine needs per-parent instancing extended from shared terminals to a shared **message** node, keyed
the same way — a generic capability, not a journey rule.

---

## RET-26 — Service Recovery

**Purpose:** Match the response to what actually failed, whether it is fixed, and whether a remedy is
genuinely owed — and acknowledge the failure once, to the person it happened to.

**Current flow:**

```
Authoritative negative experience
  → [Establish what failed, what it cost, whether it is resolved, who else is on it]
  → Is another recovery process already handling this failure?  ├ Already handled → Exit (defer)
  → Is the underlying issue still unresolved?                   ├ Still broken  → Handoff: external operational resolution
  → Is a recovery communication actually useful here?           ├ Not useful    → Exit (silent)
  → Do policy and the actual impact support compensation?       ├ Owed          → Handoff: REM-159
  → [Acknowledge: what failed, what was done, what prevents it]  (Email + Push)
  → Exit: "failure acknowledged, no remedy owed"
```

**Problems found:**

- **Email + Push on one acknowledgement card**, resolved by nothing in the graph. Push's own role
  precondition is "the failure happened inside the app, the person is active there, and the
  acknowledgement is short"; the journey reads none of that, and the acknowledgement's authored
  content — what failed, what was done about it, and what stops it happening again — is by definition
  not short. (C F1; J: `UNRESOLVED (persistent, low-friction)` → single/email.)
- `a.assess` is drawn on EN and absorbed on TR although it writes `failure_record`, real state.
  (C F3; K P0-1.)
- Nothing else. The four-gate cascade is correct: each gate is a genuine business decision with a
  distinct outcome, none is a send-path gate, and none should collapse.

**Final orchestration:** **single.** One message, no wait, no follow-up — the domain's clean example
of `Trigger → gates → Email → Exit` being legitimate. The journey's own cap says so:
*"One acknowledgement per failure; a second message about the same failure is a second failure."*
(C and J agree.)

**Final customer channels:** **Email**.

**Customer touch count:** **1.**

**Final flow:**

```
Trigger: Service failure recorded
  → [Establish what failed, what it cost, whether it is resolved]     ← drawn, both locales
  → Decision: Is another recovery already handling this failure?
        ├ Already handled ──► Exit: deferred to the process that owns it
        └ Nobody on it
  → Decision: Is the underlying issue still unresolved?
        ├ Still broken ─────► Handoff: operational resolution (external)
        └ Resolved
  → Decision: Is a recovery message actually useful to this person?
        ├ Not useful ───────► Exit: resolved without contact
        └ Useful
  → Decision: Do policy and impact support a remedy?
        ├ Owed ─────────────► Handoff: Compensation Eligibility (REM-159)
        └ Not owed
  → Message: Acknowledgement (Email)
  → Exit: failure acknowledged, no remedy owed
```

**State re-checks:** none needed — single touch, and the four gates sit immediately before it.

**Stop conditions:** another process taking the failure · the issue still being open · the failure
never having reached the customer · a remedy being owed, at which point REM-159 takes over and this
journey does not also speak.

**Ownership / handoff:** `competition: "none"`, `priority: "service"` — correct; a service
acknowledgement is not rationed against promotional pressure. I §2.7 records that RET-26 is the
library's general-purpose service-recovery journey and is named by exactly one journey (CON-300),
while its own `s.duplicate` (*"another recovery process already handling this failure owns it"*) and
REM-151's `s.g4` both defer to a process neither names. The deferral direction is safe (RET-26 always
yields), so this is documentation only: **add reciprocal `distinctFrom` rows between RET-26 and
REM-151** (I, D-18) and a row naming CON-300 (I, D-25). This journey must not claim the remedy
decision (REM-159's) or the operational fix itself.

**Canonical changes needed:**
1. `channels: ["email","push"]` → `["email"]`.
2. Remove the `low-friction → push` role from `contact.channelStrategy.roles`; set `fallback: "none"`.
3. `orchestration.touches[0].channelRoles`: `["persistent","low-friction"]` → `["persistent"]`.
   (These three land together — `validate:canonical` errors in both directions on a declared channel
   with no backing action and on an action channel with no declaration.)
4. `distinctFrom` += REM-151 and CON-300 (I, D-18/D-25), with the reciprocal row added to REM-151 by
   whoever owns that section.

**Display-only changes needed:** `a.assess` keeps its card on both locales. Nothing else — the four
gates stay exactly as drawn.

**Renderer changes needed:** the locale-invariance fix and its cross-locale gate. The
channel-priority rule (one group renders no rank label at all) removes the `Primary` chip this card
will otherwise keep after it drops to one channel.

---

## RET-28 — Cancellation Save

**CONFLICT — ESCALATED.** J (binding on pattern and channel) marks both stages `single → in_app`,
reasoning that the ask and the offer must sit beside an unobstructed cancellation path, which is
"a property of a screen, not of an inbox". C designs conditional routing on the declaration surface
and cites evidence J did not consult: **the trigger's own `evidence.requires` — verified in the
export — reads *"an explicit act: a cancel flow entered, a cancellation requested while still
reversible, or a cancellation asked for through a person"***, and `channelStrategy.roles` already
states the routing rule in words (in-session "when the intent was declared inside the product",
persistent "when the intent was declared outside the product, by message or by phone"). **Applied:
C.** Under J's verdict a person who cancels by phone is sent an in-app question they will never see;
under C's, each card still carries exactly one channel, which is the whole of J's objective. J's
in-app-only verdict is recorded here as the dissent.

**Purpose:** Treat stated intent to leave as a decision point where a genuinely relevant alternative
may be offered, and never as an obstacle course.

**Current flow:**

```
Explicit cancellation intent
  → [Read what they hold, what cancelling ends, when it takes effect]
  → Is a declared reason available?  ├ Declared → [record reason]
  → Is asking for a reason useful?   ├ Not worth asking → proceed without one
  → [Ask once, cancellation path open beside it]   (In-app + Email)
  → Wait (session-bound) → What came back?  ├ A reason → [record]  ├ Decided meanwhile → the decision
  → Does a legitimate resolution exist for this reason?
        ├ A real alternative → [Offer once]  (In-app + Email) → Handoff: RET-30
        └ Nothing genuine    → Wait (intent window) → What did they decide?
                                     ├ Confirmed → Handoff: SUB-167
                                     └ Abandoned → Exit: lapsed
```

**Problems found:**

- **In-app + Email on both message cards, with nothing selecting between them** — the journey states
  a real routing rule in `channelStrategy.roles`, has the signal in its trigger evidence, and never
  branches on it. (C; J `UNRESOLVED` ×2.)
- **`c.ask` does two jobs**: whether the answer would change the offer, and an implicit judgement
  about surface ("asking would function as friction"). Asking a survey question of somebody
  cancelling *by phone* is not friction, it is impossible — that case belongs to a surface decision,
  not this one. (C.)
- `a.record-reason` is drawn and carries an enum list on the card
  (`PRICE, LOW_USAGE, MISSING_VALUE, TECHNICAL_PROBLEM, SERVICE_ISSUE`) — engine vocabulary reaching
  the canvas. (K P1-4 and P1-6.)
- Nothing else. The "path is never obstructed" rule, the single-ask/single-offer cap and the RET-30
  handoff are correct and must not be touched.

**Final orchestration:** **conditional routing**, decided once at entry on the declaration surface
and inherited by both touches. Not fallback: an in-app ask and an emailed ask reach two genuinely
different people in two different situations and neither substitutes for the other.

**Final customer channels:** **In-app** (intent declared in the product) · **Email** (intent declared
through a person or off-product). One channel per card, on every path.

**Customer touch count:** **1–2** (longest path to one recipient: the ask, then the offer). The ask
exists only on the in-product arm; the offer only where a genuine alternative matches the reason.
`cancellation_save.touches = 2` is unchanged and still correct.

**Final flow:**

```
Trigger: Cancellation intent declared
  → [Read what they hold and what cancelling would end]          (stays absorbed — writes nothing)
  → Decision: Where was the intent declared?
        ├ In the cancel flow
        │     → Decision: Is a reason already on record?
        │           ├ Declared     → [record the reason]
        │           └ Not declared → Message: Reason ask (In-app), cancel path open beside it
        │                          → Wait: until a reason is given, or the cancellation is confirmed
        │                            or abandoned (session-bound)
        │                          → Decision: What came back?
        │                                ├ A reason          → [record the reason]
        │                                └ Decided meanwhile → the decision below
        └ Through a person / off product
              → [record the reason the person took, or that none was given]
  → Decision: Does a legitimate resolution exist for this reason?
        ├ A real alternative → Message: Alternative offer (In-app on the in-flow arm, Email on the
        │                      off-product arm) → Handoff: Retention Offer Follow-Up (RET-30)
        └ Nothing genuine
  → Wait: until the cancellation is confirmed or abandoned (intent window)
  → Decision: What did they decide?
        ├ Confirmed ─────► Handoff: Cancellation Effective-Date Resolution (SUB-167)
        └ Abandoned ─────► Exit: intent expressed, not carried through
```

**State re-checks:** both existing `recheck` clauses stay and are the right ones — `w.answer` re-reads
the intent ("still open, not confirmed, not abandoned") and `w.decision` re-reads the relationship
("still active, no cancellation executed elsewhere"). No touch is sent after a decision.

**Stop conditions:** `cancellation_confirmed` · `cancellation_flow_abandoned` · the session ending
(the ask's own attribute-bound window — unanswered is the answer) · `s.once` (one ask, one offer,
ever).

**Ownership / handoff:** unchanged and do-not-reopen (I §1.5): RET-28 is the declared top of
`retention-outreach` — *"a declared intent to leave outranks an inferred risk"* — RET-24 yields to it
at entry, only the offer step ever yields to a human-owned issue, and `s.path` guarantees the
cancellation route itself is never obstructed by any contest. `h.intervention → RET-30` carries the
cancellation episode so a decline is remembered inside it. **This journey must not say** anything
about the effective date or the mechanics of the cancellation (SUB-167's), and must not restate the
risk case (RET-24's). One documentation row: **add `distinctFrom → RET-32`**, mirroring RET-32's
`s.recent` (I, D-11).

**ARBITRATION RESOLVED (Phase 1b):** RET-28 - RESOLVED: C's conditional routing applied (already implemented in this section). J's single/in_app-both-stages verdict is rejected because it would route an in-app question to someone who cancelled by phone; C's answer still gives every card exactly one channel, which is J's actual objective.

**Canonical changes needed:**
1. New condition `c.surface`, *"Where was the cancellation intent declared?"*, two branches,
   `observes: "intent record, intake route"`, placed immediately after `a.context`.
2. Delete `c.ask`: its "worth asking" arm becomes the in-flow arm of `c.surface` plus the existing
   `c.reason`; its "not worth asking" arm becomes the off-product arm, reaching `a.no-reason` exactly
   as today.
3. `a.ask`: `channelRoles: ["in-session","persistent"]` → `["in-session"]`; In-app only.
4. `a.offer`: keep both roles but bind the channel to `c.surface`'s recorded branch rather than
   emitting a two-channel plan. The offer goes out on the surface the intent arrived on and is not
   re-decided. `destination.mustNotClaim` stays as authored.
5. `channels` stays `["email","in-app"]` — both remain backed.
6. `orchestration.strategy`: `"offer-decide-remind"` → `"conditional-routing"`.
7. `a.record-reason`'s card text: replace the enum list with the prose it stands for (the engine
   token leak K P1-6 reports); the enum itself stays in canonical data, not on the card.
8. `distinctFrom` += RET-32.

**Display-only changes needed:**
- `c.surface` must be drawn — it changes whether a question is asked at all, and on what.
- `a.context` is correctly absorbed today (writes nothing, its meaning carried by the next decision);
  leave it absorbed.
- `a.record-reason` is drawn today only because two gates share it (in-degree > 1). Under the generic
  rule that a branch arm whose target is a pure record step is not drawn, it collapses; its meaning
  survives in the reason branch label.
- Branch labels "In the cancel flow" / "Through a person" — short enough to survive the label budget
  when merged.

**Renderer changes needed:** the rule that a card rendering one channel group carries no rank label.
The per-parent instancing of a shared **message** node, if `a.offer` stays a single node whose channel
is branch-resolved; otherwise none. The widened identifier check (bare `SCREAMING_SNAKE` tokens in
card text and in edge labels, which the current check cannot see).

---

## RET-30 — Retention Offer Follow-Up

**Purpose:** Close a retention attempt on what actually happened to the relationship, and stop the
same offer being made twice.

**Current flow:**

```
Retention intervention delivered
  → Wait: until accepted / declined / recovered / failed / cancellation decided  (bounded)
      ├ on event → What happened to the intervention?
      │       ├ Accepted → [verify against the system of record] → Did the state actually change?
      │       │        ├ Applied              → Handoff: RET-27 Recovery Stability Check
      │       │        └ Accepted not applied → Handoff: external operational resolution
      │       ├ Declined → [record the decline] → Is a cancellation still in progress?
      │       │        ├ Still cancelling → Handoff: SUB-167
      │       │        └ No cancellation  → Exit: declined, relationship intact
      │       ├ Recovered without answering → Handoff: RET-27
      │       ├ Failed to execute           → Handoff: external operational resolution
      │       └ Decided meanwhile           → Handoff: SUB-167
      └ on timeout → With no response, is one bounded follow-up justified?
              ├ Justified     → [Follow-up]  (Email + In-app) → Exit: cooldown
              └ Not justified → Exit: cooldown
```

**Problems found:**

- **Its trigger has no author.** `retention_intervention_delivered` is emitted by nothing in the
  corpus (verified; see RET-24). Not RET-30's fault and not fixable inside RET-30 — it is fixed by
  RET-24's new check-in and by RET-28's existing `h.intervention`. Recorded here so the two sides are
  read together. (C F5.)
- **Email + In-app on the follow-up**, selected by nothing. The follow-up's own justification is
  "the offer is time-limited or its terms were plausibly not understood" — a document to be re-read,
  not an in-session prompt. (C F1; J `UNRESOLVED` → email.)
- **`a.verify` is absorbed**, and it is the journey's central insight: *acceptance is a customer
  saying yes; application is the state having moved.* It is absorbable only because it declares
  `writes: []`. (C.)
- **`retention-outreach` contains a genuine deadlock, and RET-30 is one half of it.** Three members
  claim "lowest in the group". RET-30 yields to *"any live risk case or open issue on the same
  account"* — ACT-18 Adoption Recovery is neither. ACT-18 yields to *"an open issue under human
  ownership, a live risk case or a declared cancellation intent"* — RET-30 is none of those. Both are
  `onLoss: "suppressed"`, both account-scoped, and a delivered retention intervention and a stalled
  use case are routinely true at once — that is what a struggling account looks like. On that contest
  each defers to the other and **neither sends**. (I, P0-2.)
- 16 display nodes from 12 distinct canonical nodes: **8 of them are shared-terminal instances**, the
  fourth-heaviest ratio in the library. (K P2-7.)

**Final orchestration:** **event-or-timeout.** The event arm is a five-way read of what actually
happened and sends nothing; the timeout arm is the only path that communicates, and it sends at most
one. This is the only journey in the set whose *default* outcome is silence.
*Reconciliation with J:* the matrix tags the `a.followup` stage `sequential`, which is a statement
about the stage sitting behind `w.outcome` and its `c.followup` re-check. At journey level there is
no earlier touch for it to follow — the count is 0–1 — so the journey's pattern is event-or-timeout
and the stage's position is what J describes. Same shape, two scopes; no disagreement on the channel.

**Final customer channels:** **Email**, on the follow-up only.

**Customer touch count:** **0–1.**

**Final flow:** unchanged in shape from the current flow, with three edits: `a.followup` becomes Email
only; `a.verify` regains its card; the `Decided meanwhile` and `Failed to execute` arms are untouched.

**State re-checks:** `w.outcome.recheck` already re-reads the customer from the system of record
before acting on the timeout, which is what stops a follow-up landing on somebody who has already
cancelled. `a.verify` is itself a state re-check and is the reason `s.g1` holds — *retention is
recorded from the relationship state, never from the customer's answer.*

**Stop conditions:** `retention_offer_accepted` · `retention_offer_declined` ·
`relationship_recovered` · `intervention_failed` · `cancellation_confirmed` ·
`cancellation_flow_abandoned` · the decision window closing. Six terminating events on one wait is
unusual and correct here: each is a genuinely different outcome with a different owner.

**Ownership / handoff:** RET-27 takes over on a positive outcome (the `distinctFrom` note is right
and stays); SUB-167 owns a live cancellation; external operational resolution owns a failed
execution. **The deadlock needs one ordering, and RET-30's side of it is this:** RET-30 ranks **above**
ACT-18, because an intervention the business actually delivered has an outcome to establish where a
stall has only an inference, and because RET-30's `s.g2` requires a declined offer to be remembered
for the whole cancellation episode — a suppressed follow-up loses that record. Concretely (I, P0-2):

- `RET-30.contact.competition.precedence` — replace *"lowest in the group - any live risk case or
  open issue on the same account outranks it"* with *"below the declared cancellation intent
  (RET-28), any live risk case (RET-24) and any open issue under human ownership on the same account;
  above the adoption recovery nudge (ACT-18) …"*.
- `RET-30.suppressions` += `s.contest` (it has none today — the only member of its group in that
  position other than RET-24, which sends nothing) stating the same ordering in an enforceable field.
- **ACT-18 is not in this plan part.** Its reciprocal edits — naming RET-30 in its precedence and in
  its `s.contest` enumeration — belong to whoever holds ACT-18, and **the pair must be landed
  together**: one side alone leaves the group with two bottoms. Flagged for the plan's owner.
- RET-32's bare *"lowest in the group"* opening should also go, so exactly one member claims the
  bottom (see the RET-32 section).

**Canonical changes needed:**
1. `channels: ["email","in-app"]` → `["email"]`.
2. Remove the `in-session → in-app` role; `fallback: "none"`.
3. `orchestration.touches[0].channelRoles`: `["persistent","in-session"]` → `["persistent"]`.
4. `a.verify` declares the state it establishes — `writes: [{ field: "retention_outcome", mode:
   "set" }]`. This is an honesty fix, not a display hack: the node establishes the fact the next
   decision reads, and its card returns under the unchanged generic absorption rule.
5. The precedence and `s.contest` edits above (paired with ACT-18's).

**Display-only changes needed:** `a.verify` drawn. `a.record-decline` stays absorbed — it genuinely
only appends to `retention_episode_history`.

**Renderer changes needed:** the one-group/no-rank-label rule. Nothing journey-specific; the
shared-terminal instancing that inflates this canvas is a generic bound to be considered with the
corpus-wide count, not a rule for this journey.

---

## RET-31 — Predicted Need Replenishment

**Purpose:** Prompt a person to replenish a consumable shortly before its usable period is predicted
to end, state the prediction as an estimate, and stop the moment they buy, dismiss, or the cycle
passes.

**Current flow:**

```
Expected depletion approaching
  → Is there a need to prompt, and may we?  ├ Already met → Exit: replenished  ├ Not eligible → Exit: no-action
  → [open instance] → Wait (lead time before expected_depletion_at)
  → At the lead point, is the need still unmet?  ├ Replenished → Exit  ├ Dismissed → Exit
  → (send gate) → [Lead prompt]   (Email + Push + In-app)
  → Wait (margin after expected_depletion_at)
  → After the estimated depletion, what happened?  ├ Replenished → Exit  ├ Dismissed → Exit
  → (send gate) → [Follow-up]     (Email + Push + In-app)
  → Wait (lifetime) → What ended the observation?  ├ Replenished → Exit  ├ Dismissed → Exit
  → timeout → Exit: lapsed
```

**Problems found:**

- **Three channels on both touches**, resolved by nothing — the worst case in the retention domain,
  on a journey whose entire design point is *timing*, not reach. (C F1; J `UNRESOLVED` ×2 → email.)
- **RET-31 is the corpus's worst one-sided hub.** It is named by **ACQ-289, RET-290, RET-293 and
  RET-294** and names **none of them**. (I, §1.6 and P1-1.)
- **Two unstated collisions.** (a) `commerce-recovery`: RET-31 and SCH-282 both claim *"below process
  recovery and selection recovery"*, both `onLoss: "suppressed"`, neither naming the other (I, P0-3).
  (b) Across groups: RET-31, RET-293 and RET-294 are all `promotional`, all `scope: person`, and all
  three propose a purchase to the same person — but `recommendation-offer`, the group that exists to
  stop exactly that, has RET-31 outside it and mentions it nowhere (I, P1-1).
- 18 display nodes from 13 distinct canonical nodes (7 terminal instances). (K P2-7.)
- Otherwise one of the best-authored journeys in the corpus: every wait re-reads purchases,
  subscriptions and dismissals and **recomputes the expected depletion date from the latest
  purchase**. (C.)

**Final orchestration:** **combination — a sequential pair of touches bracketing an
attribute-anchored date, each reached through an event-or-timeout wait.** That is what distinguishes
it from the other two members of the recommendation trio and it is the reason not to flatten the
label: **both waits are `relativeTo: "attribute"`, not `relativeTo: "previous-touch"`** — the lead
prompt is timed *before* the computed `expected_depletion_at` and the follow-up *after* it. Neither
RET-293 nor RET-294 has an attribute-anchored wait anywhere. (C's journey-level reading; J's
stage-level labels — `single` then `sequential` — are the same shape read one stage at a time, and
both audits land on the same channel.)

**Final customer channels:** **Email**, on both touches.

**Customer touch count:** **2** — `replenishment.touches` default 2, unchanged.

**Final flow:** as current, with both message cards reduced to Email and nothing else changed.

**State re-checks:** already best-in-domain; keep verbatim. Purchases, subscriptions and dismissals
re-read before every touch; the depletion date recomputed from the latest purchase; a purchase by
**any channel** closes the instance.

**Stop conditions:** `purchase_completed` · `replenishment_need_dismissed` · an active subscription or
auto-replenishment covering the need · the prediction cycle passing · `s.sunset`, the standing
marketing suppression CON-300 writes.

**Ownership / handoff:** no handoffs, correctly — nothing else owns a predicted need. The precedence
must stop being one-sided (I, P0-3 and P1-1):

- `RET-31.contact.competition.precedence` → *"below process recovery, selection recovery and the
  availability enquiry (SCH-282) for the same person — a question the person asked about a stated
  window outranks a need computed from their history; above the back-in-stock alert (ACQ-289) and
  inferred-interest recovery (ACQ-13)"*, **and** *"above the recommendation-offer group (RET-293,
  RET-294) for the same person: a purchase the person's own history says is due is a stronger claim
  on the moment than a next step inferred from what they own or a set that resembles what they liked.
  While this journey holds a person, both of those are suppressed for them rather than queued behind
  them."*
- `RET-31.suppressions[s.contest].text` += SCH-282.
- `RET-31.distinctFrom` += **RET-293, RET-294, ACQ-289, RET-290** — the four rows that already exist
  on the other side. This is the single largest hub asymmetry in the corpus and the first to do.
- The reciprocal halves (SCH-282's rewritten precedence and new `s.contest`; the RET-293/RET-294
  clauses) are in this plan part for RET-293/RET-294 and **outside it for SCH-282 and ACQ-289** —
  land each pair together.

**Canonical changes needed:**
1. `channels: ["email","push","in-app"]` → `["email"]`.
2. Remove the `low-friction → push, in-app` role; `fallback: "none"`.
3. Both touches' `channelRoles`: `["persistent","low-friction"]` → `["persistent"]`.
4. The precedence, `s.contest` and `distinctFrom` edits above.

**Revisit condition, recorded because this is the strongest push case in the domain:** touch 2 fires
*after* the estimated depletion has passed, is short, and its route back is a single step — the
brief's own description of push. If a device-registration state is ever recorded against the person
and a condition can branch on it, touch 2 becomes a genuine `Push if reachable → Email otherwise`.
It is not one today because nothing in the journey reads a token, and J reduces push to the three
journeys that can resolve it.

**Display-only changes needed:** none authored. Under the generic rule that a branch arm whose target
is a pure no-action record is not drawn, `c.eligible`'s "Not eligible" arm and the shared
`a.record-no-action` card stop being drawn; the business question `c.eligible` asks stays. Both send
gates and both waits are already correctly absorbed.

**Renderer changes needed:** the one-group/no-rank-label rule; the no-action-arm rule above (generic,
six journeys corpus-wide); no journey-specific work.

---

## RET-32 — Lapsed Customer Win-Back

**Purpose:** Invite a person whose paid relationship ended or went dormant to come back — once,
honestly, with whatever has actually changed since they left.

**Current flow:**

```
Lapsed customer detected
  → Is this relationship one we may write to about coming back?  ├ Excluded → [record] → Exit: no-action
  → [open instance]
  → What can the invitation honestly say?  ├ Something changed → (send gate)
                                           └ Nothing specific  → (send gate)   ← both arms, same target
  → (send gate) → [Invitation]   (Email + Push)
  → Wait (response window)  ├ repaid → Exit: won
  → Is a follow-up enabled, and is there something honest to add?
        ├ Enabled with something to add → (send gate) → [Follow-up] (Email + Push) → Wait → Exit
        └ Not enabled / nothing to add  → Exit: lapsed
```

**Problems found:**

- **`c.basis` is a fork whose two arms go to the same node.** It changes what the message *says*, not
  what the journey *does*, and on the canvas it renders as a violet Decision card with exactly one
  outgoing edge and both answers stacked in one compound label. (C; K P1-5, which proposes the
  generic gate `G9_DEGENERATE_DECISION`.)
- **Email + Push on both touches.** Push here is worse than boilerplate: the recipient is by
  definition somebody whose paid relationship *ended*, and the role's own precondition is a valid
  push token on a device they kept the app on. (C F1; J → email, both stages.)
- `s.permission` already states the brief's own fallback rule — *absent permission is a recorded
  no-action, **never a fallback to another channel*** — and must not be weakened. (C.)
- `c.eligible` is a pure eligibility gate (continue / record-and-stop) drawn as a Decision. (K §2.2
  Tier A.) **Arbitration:** C's note that the "Excluded" arm's record hop "stays drawn" describes
  today's renderer behaviour, not a requirement; K is binding on the canvas and its generic rules
  remove both. Applied: K.

**Final orchestration:** **sequential** — one invitation and one optional follow-up, each gated on
there being something honest to add. What separates it from RET-294's reminder is that the second
touch is conditional on **business configuration** (`winback.follow_up_enabled`,
`winback.incentive_policy`) rather than on customer state. (C and J agree.)

**Final customer channels:** **Email**, on both touches.

**Customer touch count:** **1–2.**

**Final flow:**

```
Trigger: Lapsed customer detected
  → Decision: May we write to this relationship about coming back?    (eligibility gate — not drawn)
        ├ Excluded ──► Exit: no invitation sent, reason recorded
        └ Eligible
  → [open the win-back instance against this lapse]
  → Message: Invitation (Email)     ← says what changed where something did; plain otherwise
  → Wait: until the relationship is repaid or a purchase completes (response window)
        ├ Repaid ──► Exit: won back
        └ Window closed
  → Decision: Is a follow-up enabled, and is there something honest to add?
        ├ Not enabled / nothing to add ──► Exit: invited, not returned
        └ Enabled with something to add
  → Message: Follow-up (Email)
  → Wait: until repaid or the instance lifetime ends
        ├ Repaid ──► Exit: won back
        └ Exit: invited, not returned
```

**State re-checks:** `w.response.recheck` re-reads the relationship — *"still lapsed, nothing opened
on it, permission still recorded"* — before the second touch, and must stay. `w.final` re-reads from
the system of record.

**Stop conditions:** `relationship_repaid` · `purchase_completed` · the long cooldown · `s.sunset`
(the standing marketing suppression CON-300 writes — **do not weaken**) · any live retention,
complaint, risk or payment journey on the account, which means the relationship is not lapsed at all.

**Ownership / handoff:** unchanged and do-not-reopen (I §1.5): RET-32 is the genuine bottom of
`retention-outreach` and resolves its own position by enumerating what outranks it; it is distinct
from ACT-20 by eligibility (there was a paid relationship), from RET-28 by timing (after the save
window and its cooldown), and from CON-300 by subject — *"a person can be perfectly engaged with our
messages and still lapsed, or still buying and entirely silent on everything we send"*, which is the
corpus's clearest statement of why sunset is not win-back and must be preserved verbatim. One edit,
paired with the RET-30/ACT-18 ordering: **drop the bare *"lowest in the group"* opening** in favour
of the enumeration the text already contains, so exactly one member claims the bottom (I, P0-2).
**This journey must not say** anything that argues the marketing relationship itself — that is
CON-300's subject and `s.notwinback` forbids the inverse.

**Canonical changes needed:**
1. Delete `c.basis`. Its content rule moves into `a.touch1`'s guardrail text and into `s.honest`,
   which already carries it; "something changed that speaks to why they left" becomes part of what
   the invitation says, not a decision the reader has to follow.
2. `channels: ["email","push"]` → `["email"]`.
3. Remove the `low-friction → push` role; `fallback: "none"`.
4. Both touches' `channelRoles`: `["persistent","low-friction"]` → `["persistent"]`.
5. Precedence opening rewritten as above.

**Display-only changes needed:** removing `c.basis` removes the degenerate Decision card. `c.eligible`
collapses as an eligibility gate and `a.record-no-action` with it (K §2.2 Tier A, §4.4); the
"Excluded" ending survives as the exit. `a.open` and both send gates stay absorbed.

**Renderer changes needed:** the degenerate-decision rule (a drawn condition with fewer than two
outgoing display edges must not render as a Decision) and its gate; the eligibility-gate and
no-action-arm collapse rules with the parent test kept intact; the one-group/no-rank-label rule.
All generic.

---

## RET-290 — First Purchase Thank You & Bounceback

**Purpose:** Mark the moment a buyer becomes a customer for the first time and give them one honest
reason to come back — without ever speaking over the order's own transactional confirmation.

**Current flow:**

```
First purchase completed
  → Wait (settle: let the order confirmation have its moment)
  → Now that the order has settled, is a welcome still the right thing?
        ├ Already returned   → Exit: returning
        ├ Relationship ended → Exit: closed
        └ Welcome due → (send gate) → [Welcome]  (Email + In-app)
  → Wait (bounceback window)
  → Has a second purchase already been made?  ├ Returned → Exit: returning
  → (send gate, also checks the business has an issued offer) → [Bounceback] (Email + In-app + Push)
  → Exit: "welcomed and prompted"
```

**Problems found:**

- **Two and three channels on the two touches**, selected by nothing. (C F1; J `UNRESOLVED` ×2 →
  email.)
- Nothing structural. `w.settle` is the mechanism that keeps RET-290 from speaking over FUL-301 and
  is exactly right — **do not merge, do not remove, do not shorten.**

**The FUL-301 boundary is preserved, in all three places it lives** (C; I §1.10): the precedence
*"below the order's own confirmation (FUL-301) and below the post-purchase follow-up on the same
person's order — the record has to open before anything is said about the relationship it opened"*
with `onLoss: "suppressed"`; `w.settle`'s own timeout reason *"a welcome that lands beside the order
confirmation reads as a duplicate of it"*; and `s.transactional` in the `noAction` list. FUL-301
states what the business took on; RET-290 opens the relationship. Nothing here touches that. I's
open question about the group's declared `scope: "person"` (P2-1) is FUL-301's and FUL-291's to
settle and changes nothing in RET-290 either way; recorded so it is not re-derived.

**Final orchestration:** **sequential** — welcome, then an optional bounceback, with a settle wait in
front of the first touch. Distinct from RET-294's maturation wait: `w.settle` exists to yield to
*another journey's message*, not to let a product be used. (C and J agree.)

**Final customer channels:** **Email**, on both touches.

**Customer touch count:** **1–2.** The bounceback exists only where the business has actually issued
an offer (`c.sendable2` observes the offer record) — a real gate, not a template step.

**Final flow:** as current, both message cards reduced to Email.

**State re-checks:** `w.settle.recheck` re-reads the purchase record, the order state and permission;
`w.second.recheck` re-reads the purchase record and permission; `c.second` explicitly stops a
bounceback reaching somebody who already came back. All correct, all kept.

**Stop conditions:** a second purchase (`x.returning`, and the instance never reopens — *a
relationship is a first one only once*) · `permission_withdrawn` · the first purchase being cancelled
or reversed · no issued offer to name · `s.sunset`.

**Ownership / handoff:** no handoffs; the ordinary retention journeys take the relationship from
`x.returning`. Unchanged. Two documentation rows (I, D-20/D-21): **RET-290 is named by RET-31 and by
RET-292 and names neither back** in the relevant direction — add `distinctFrom → RET-31` (paired with
RET-31's new row) and the RET-292 row. **This journey must not** restate order contents, and no
post-purchase marketing moves into the confirmation.

**Canonical changes needed:**
1. `channels: ["email","in-app","push"]` → `["email"]`.
2. Remove the `in-session → in-app` and `low-friction → push` roles; `fallback: "none"`.
3. `a.welcome.channelRoles`: `["persistent","in-session"]` → `["persistent"]`;
   `a.bounceback.channelRoles`: `["persistent","in-session","low-friction"]` → `["persistent"]`.
4. `distinctFrom` += RET-31, RET-292 (reciprocals of existing rows).

**Display-only changes needed:** none. Both waits, both send gates, `a.record-no-action` and
`x.no-action` are already absorbed — 9 display nodes from 14 canonical, the display layer working as
intended.

**Renderer changes needed:** the one-group/no-rank-label rule. Otherwise none.

---

## RET-292 — First Purchase Anniversary

**Purpose:** Recognise the anniversary of the date somebody first bought — the relationship's own age,
counted from its first transaction and from nothing else — and say so once.

**Current flow:**

```
First purchase anniversary approaching
  → Is this anniversary still ours to recognise?
        ├ Relationship ended → Exit: closed
        ├ Not sendable       → [record] → Exit: no-action
        └ Recognise → [Recognition]  (Email + Push + In-app) → Exit: recognised
```

**Problems found:**

- **Three channels on a one-touch journey** — seven canonical nodes, one message, a three-role
  cascade attached to it. The starkest case of the corpus default in the domain. (C F1; J → email.)
- Nothing else. RET-292 is already `Trigger → Decision → Message → Exit` and folds its send gate into
  its eligibility condition rather than drawing a second one — the pattern RET-295 should copy.

**Final orchestration:** **single.**

**Final customer channels:** **Email**.

**Customer touch count:** **1.**

**Final flow:**

```
Trigger: First purchase anniversary approaching
  → Decision: Is this anniversary still ours to recognise?
        ├ Relationship ended ──► Exit: closed without a message
        ├ Not sendable ────────► Exit: no recognition sent, reason recorded   (arm not drawn)
        └ Recognise
  → Message: Anniversary recognition (Email)
  → Exit: recognised for this interval
```

**State re-checks:** one decision immediately before one send. Nothing further is needed and nothing
is added.

**Stop conditions:** a closed account · a fully reversed first purchase · withdrawn permission · the
interval having already been recognised · **the interval passing** (`s.interval`: never sent late,
never merged into the next one — the journey's sharpest rule, and it survives) · `s.sunset`.

**Ownership / handoff:** unchanged and do-not-reopen: `date-recognition`, scope `person`, **below**
RET-295. Where both fall in the same window this one is suppressed and its interval closes **unsent**
rather than queueing. I §4-5 records `date-recognition` as stated three times from each side —
precedence, `s.contest` and reciprocal `distinctFrom` — and needing nothing. One documentation row
(I, D-21): RET-292 is named by RET-290 and SUB-163 and names neither back. This journey must not
attach a reward, a tier or a benefit (`s.claim`).

**Canonical changes needed:**
1. `channels: ["email","push","in-app"]` → `["email"]`.
2. Remove the `low-friction` and `in-session` roles; `fallback: "none"`.
3. `orchestration.touches[0].channelRoles` → `["persistent"]`.
4. `distinctFrom` += RET-290, SUB-163 (reciprocals).

**Display-only changes needed:** under the generic rule, `c.eligible`'s "Not sendable" arm and its
shared `a.record-no-action` card stop being drawn; the business question and the two real endings
stay. (K §2.2 Tier B, §4.4 — six journeys corpus-wide, not a RET-292 exception.)

**Renderer changes needed:** the no-action-arm rule and the one-group/no-rank-label rule. Both
generic.

---

## RET-293 — Personalized Recommendations

**Purpose:** Show a person a small set of things that follow from what they themselves have done —
and only while every item in it is still something they can actually buy.

**Current flow:**

```
Recommendation signal qualified
  → Is the recommendation still valid?
        ├ Already bought → Exit: purchased
        ├ Stale or empty → [record] → Exit: no-action
        └ Valid → (send gate) → [Recommendation]  (Email + In-app + Push)
  → Wait (observation window)
  → Did the recommendation reach a relevant purchase?
        ├ Converted → Exit  ├ Dismissed → Exit  ├ No conversion → Exit
```

**Problems found:**

- **Three channels with `fallback: "next-eligible-role"`** — the explicit cascade the brief rejects by
  name, on a card the canvas then renders as Primary/Fallback. (C F1; J `UNRESOLVED` → email; K
  P0-2 Defect B.)
- **The three-way purchase-proposal collision with RET-31** (I, P1-1): `recommendation-offer` exists
  to stop two next-purchase proposals reaching one person at once, and RET-31 is a next-purchase
  proposal sitting outside it. RET-293 carries a `distinctFrom → RET-31` row that explains the
  journeys are different and says nothing about who wins.
- Nothing else. The journey is already one touch and its observation window measures without
  communicating.

**How the trio stays distinct — RET-293's share.** RET-293 is **a predicted affinity, one shot, then
measurement only**. It is the only member with **no second touch of any kind**, and the only one whose
wait exists purely to decide whether a purchase may honestly be attributed to the message — *"past its
window a purchase is the person's own doing, and counting it here would be a claim the data does not
support."* Its distinguishing rule is `s.unavailable`: every item is re-read for availability,
eligibility and ownership **immediately before sending**, and where nothing survives, nothing is sent.
Neither RET-31 nor RET-294 re-reads a set.

**Final orchestration:** **single**, followed by a measurement-only observation window.

**Final customer channels:** **Email**. The deliverable is a *set* of items with the reason each is
there visible from the set itself: a push carries one thing, and an in-product rail is merchandising
rather than a journey send.

**Customer touch count:** **1** — `recommendations.touches` default 1, unchanged.

**Final flow:** as current, with the message card reduced to Email.

**State re-checks:** `c.valid` is the re-check and it is the right one — signal recency, item
availability, ownership, prior declines. `w.window.recheck` re-reads the purchase record and any
dismissal.

**Stop conditions:** `purchase_completed` · `interest_dismissed` (and the *subject* is never proposed
again) · the signal passing its recency rule · no item surviving the availability re-read · **RET-294
holding the person** · `s.sunset`.

**Ownership / handoff:** unchanged and do-not-reopen: below RET-294 in `recommendation-offer`, scope
`person`, `onLoss: "suppressed"` — the two never propose a next purchase to the same person at once,
and I §4-6 records the ordering as stated six times and needing nothing. The one addition (I, P1-1):
**append to `RET-293.contact.competition.precedence`** *"and below predicted-need replenishment
(RET-31), which is suppressed for nothing in this group but outranks both of its members: a purchase
that is actually due outranks one that is merely plausible"*, and **add RET-31 by id to
`s.contest`**. Land it with RET-31's half. One documentation row (I, D-22): RET-293 is named by RET-31
and ACQ-13 and names neither back.

**Canonical changes needed:**
1. `channels: ["email","in-app","push"]` → `["email"]`.
2. Remove the `in-session` and `low-friction` roles; `fallback: "none"`.
3. `orchestration.touches[0].channelRoles`: `["persistent","in-session","low-friction"]` →
   `["persistent"]`.
4. Precedence and `s.contest` edits above.

**Display-only changes needed:** none authored; `c.sendable` and `w.window` are already correctly
absorbed. Under the generic no-action-arm rule the "Stale or empty" record card collapses into its
exit.

**Renderer changes needed:** the one-group/no-rank-label rule, and the false-`Fallback` rule — this is
one of the 21 cards whose journey declares `next-eligible-role`, where even the role advance is
driven by the next role's `when`, not by a delivery failure. Generic.

---

## RET-294 — Cross-Sell / Next Best Offer

**Purpose:** Offer the thing that genuinely completes something the person already owns, once the
first thing has had time to be used, and stop the moment they have it.

**Current flow:**

```
Purchase with known complement
  → Wait (maturation: until the owned thing has plausibly been received and used)
  → Is there still a complementary next step worth offering?
        ├ Already complete     → Exit: complete
        ├ No longer applicable → Exit: closed
        └ Opportunity stands → (send gate) → [Offer]  (Email + Push + In-app)
  → Wait (response window)
  → Was the offer taken?  ├ Taken → Exit  ├ Declined → Exit
                          └ No answer yet → (send gate) → [Reminder] (Email + In-app) → Exit: offered
```

**Problems found:**

- **Three channels then two, with `next-eligible-role` fallback**, resolved by nothing. (C F1; J
  `UNRESOLVED` ×2 → email; K P0-2 Defect B.)
- The same unstated cross-group collision with RET-31 as RET-293 (I, P1-1).
- Nothing else. `s.segment` already says the right thing and is authored corpus text worth quoting
  back at the brief: *"A segment split is made only where the offer itself genuinely differs by
  segment. Splitting one offer into branches that send the same thing adds a decision the business
  does not actually have."*

**How the trio stays distinct — RET-294's share.** RET-294 is **a declared product relationship,
matured, then offered and reminded once**. Its signature is `w.maturation`: **the only wait in the
trio that precedes every touch**, whose purpose is to stop an accessory reaching somebody whose order
is still in transit (`s.premature`). Its opportunity is bound to a relationship between two products
*the company has declared* — not to a person-pattern (RET-293) and not to a computed depletion date
(RET-31). Its second touch is gated on **customer state** ("still does not have the complement and has
not said they do not want it"), where RET-32's second touch is gated on business configuration.

| | what it reads | what it claims | shape | anchor |
|---|---|---|---|---|
| RET-31 | this person's own prior purchase + the item's usable life | *you are about to run out of the thing you have* | 2 touches bracketing a date | `expected_depletion_at` (attribute) |
| RET-293 | a recorded signal about this person | *these resemble what you have shown interest in* | 1 touch, then measure | the signal's recency rule |
| RET-294 | a declared relationship between two products + ownership | *this completes the thing you own* | maturation → offer → one reminder | ownership of the subject |

**Final orchestration:** **sequential**, behind a maturation gate.

**Final customer channels:** **Email**, on both touches. The offer is named *against what they already
own* and has to show both things and the relationship between them; the reminder adds nothing that
was not in the first one, by rule, so the channel does not change either.

**Customer touch count:** **1–2** — `next_offer.touches` default 2, unchanged.

**Final flow:** as current, both message cards reduced to Email.

**State re-checks:** best in the trio and kept verbatim — `s.owned`: *"Ownership is re-read
immediately before every touch and never trusted from the record that opened the instance."*
`w.maturation.recheck` re-reads ownership of both products, the declared relationship and permission;
`w.response.recheck` re-reads ownership of the complement and any dismissal.

**Stop conditions:** `purchase_completed` (the complement acquired by **any route**) ·
`interest_dismissed` · `permission_withdrawn` · the declared product relationship ceasing to hold
(`x.closed`, class `invalid-state`) · the touch budget · `s.sunset`.

**Ownership / handoff:** unchanged and do-not-reopen: **above** RET-293 in `recommendation-offer`;
while RET-294 holds a person RET-293 is suppressed for them rather than queued. No handoffs. The one
addition (I, P1-1): append the RET-31 clause to `contact.competition.precedence` and add RET-31 by id
to `s.contest`, landed with RET-31's half. One documentation row (I, D-23): RET-294 is named by
RET-31, ACQ-288 and RET-295 and names none of them back.

**Canonical changes needed:**
1. `channels: ["email","push","in-app"]` → `["email"]`.
2. Remove the `low-friction` and `in-session` roles; `fallback: "none"`.
3. `a.offer.channelRoles`: `["persistent","low-friction","in-session"]` → `["persistent"]`;
   `a.remind.channelRoles`: `["persistent","in-session"]` → `["persistent"]`.
4. Precedence and `s.contest` edits above.

**Display-only changes needed:** none — 10 display nodes from 15 canonical, with both waits, both send
gates, `a.record-no-action` and `x.no-action` absorbed. Correct as it stands.

**Renderer changes needed:** the one-group/no-rank-label rule and the false-`Fallback` rule. Generic.

---

## RET-295 — Birthday & Milestone

**Purpose:** Recognise a date that belongs to the person themselves — a birthday they told us, or a
milestone their own record has reached — and say so once, with nothing attached that has not been
issued.

**Current flow:**

```
Personal milestone approaching
  → Is this date still ours to recognise?
        ├ Relationship ended  → Exit: closed
        ├ Cycle already spent → [record] → Exit: no-action
        └ Recognise → May the recognition go out?          ← drawn send gate
                          ├ Suppressed → [record] → Exit: no-action
                          └ Sendable → [Recognition]  (Email + Push + In-app) → Exit: recognised
```

**Problems found:**

- **Three channels**, resolved by nothing. (C F1; J → email.)
- **The send gate is drawn** where RET-292's equivalent is folded into its eligibility condition. Two
  journeys in the same exclusion group, doing the same thing, drawing a different number of decisions.
  It escapes the collapse rule on a technicality: its short arm is a *shared* hop
  (`a.record-no-action` is also the target of `c.date`'s third branch), and the rule requires every
  parent of a shared hop to have collapsed first. (C F2; K §2.2 Tier B.)

**Deliberate mirroring of RET-292.** RET-292 and RET-295 come out of this plan with the **same shape**
— `Trigger → Decision → Email → Exit`, one touch — and that is correct, not a convergence failure.
They are two halves of one product rule held apart by data rather than by flow: different entities
(`anniversary_cycle` vs `milestone_cycle`), different *sources* of the date (the company's own record
of a first purchase vs a date the person supplied or their own record reached), and one exclusion
group with an explicit precedence — RET-295 above RET-292 — so a person never receives both in the
same window and the loser's interval closes **unsent**. Making the two flows differ for the sake of
differing would be the fabrication the brief forbids; what distinguishes them belongs in the detail
panel and the `distinctFrom` rows, which already carry it.

**Final orchestration:** **single.**

**Final customer channels:** **Email**.

**Customer touch count:** **1.**

**Final flow:**

```
Trigger: Personal milestone approaching
  → Decision: Is this date still ours to recognise?     (the send path folds into this question)
        ├ Relationship ended  ──► Exit: closed without a message
        ├ Cycle already spent ──► Exit: no recognition sent, reason recorded    (arm not drawn)
        ├ Not sendable        ──► Exit: no recognition sent, reason recorded    (arm not drawn)
        └ Recognise
  → Message: Milestone recognition (Email)
  → Exit: recognised for this cycle
```

**State re-checks:** one decision immediately before one send; the send-path check folds into it.

**Stop conditions:** a closed account · withdrawn permission · **the person having asked to be left
alone, and that person is not re-entered** (the strongest re-entry clause in the domain) · the cycle
having been recognised · the date having passed · `s.sunset`.

**Ownership / handoff:** unchanged and do-not-reopen: `date-recognition`, scope `person`, **above**
RET-292. No handoffs. This journey must not attach a reward, a tier or a benefit that has not been
issued (`s.claim`).

**Canonical changes needed:**
1. `channels: ["email","push","in-app"]` → `["email"]`.
2. Remove the `low-friction` and `in-session` roles; `fallback: "none"`.
3. `orchestration.touches[0].channelRoles` → `["persistent"]`.
4. **Fold `c.sendable` into `c.date`**, exactly as RET-292 folds its send check into `c.eligible`:
   `c.date`'s "Recognise" arm gains "…and the send path passes", a fourth branch "Not sendable" goes
   to `a.record-no-action`, `c.sendable` is deleted, and
   `orchestration.touches[0].prerequisites` becomes `["c.date"]`.

**Recorded caveat on item 4** (C's own, and I agree it is the safer trade today): this is a canonical
edit made for a display reason, which Phase 2.1's rule warns against. The generic alternative —
teaching the collapser that a shared hop may be hidden once *every* parent reaching it has collapsed,
with the business parent keeping its own record hop — is the better answer if two or three other plan
parts report the same shape. **If they do, revert item 4 in favour of the generic rule.** Note that
K's no-action-arm rule (below) already removes both plumbing arms from the drawing, so item 4's only
remaining effect is to stop the corpus stating the same check twice.

**Display-only changes needed:** item 4 removes the drawn gate at the data level. Under the generic
no-action-arm rule both record arms are undrawn and the card reduces to the business question with
its real branches.

**Renderer changes needed:** the no-action-arm rule with the parent test kept intact; the
one-group/no-rank-label rule. Generic; no collapser exception list.

---

## CON-272 — Contact Recovery

**Purpose:** Get a dead destination replaced by asking on a route that still works, so a delivery
failure is repaired once rather than retried blind — and without either side mistaking it for a
change of permission.

**Current flow:**

```
Contact point recorded undeliverable
  → What can carry the repair request without using the broken destination?
        ├ Reachable in product  → [Ask]  (In-app)
        ├ Reachable off product → [Ask]  (SMS + Email)          ← two channels on one card
        └ Nothing left          → Exit: dark
  → Wait (one repair cycle)
        ├ timeout → Exit: suppressed
        └ on event → What ended the wait?
                ├ Recovered → Exit: recovered
                └ Replaced  → [Confirm]  (In-app + Email + SMS)  ← three channels on one card
                            → Exit: repaired
```

**Problems found:**

- **The routing decision is right and the channels on its arms are not.** `c.route` is the only
  genuine reachability decision in the domain and it is already drawn — K §2.3 names it as one of the
  two permission splits that earn a card, *"the sanctioned `Can receive SMS? → SMS / Email` shape"*.
  But its "Reachable off product" arm then carries SMS *and* Email on one card, discarding the
  decision the branch was supposed to have made. (C; J `UNRESOLVED (urgent, persistent)`.)
- **`a.confirm` carries all three channels.** The confirmation should go on the route that actually
  carried the repair; three is what `s.g2` forbids in spirit. (C; J: conditional routing, one channel
  — the route that worked.)
- **SMS's role precondition is untrue here** — *"an asserted time bound lies inside the urgent
  horizon"* — and CON-272 asserts no time bound anywhere. SMS is not the urgent channel in this
  journey; it is the **surviving** channel when the failed destination was the email address. (C.)
- `a.prompt-in-app` renders `Primary: In-app` over a single channel. (K P0-2 Defect A.)

**The library's one true-fallback case, and why it must not stay a label.** J §3 lists 8 true-fallback
stages in 4 journeys corpus-wide; CON-272 `a.prompt-alt` is #7 and the only one outside ACQ-287/288/289.
The entity is `[contact_point_id, person_id]` — *this address, this number, this token* — so the
journey always knows **which** destination died, and `s.g3` already forces it to check that a
surviving route is both deliverable **and permitted** (*availability is not permission*). The desired
route is literally unusable because it is the thing that broke; another substitutes for it. That is
the brief's strict definition. **But it must be a visible decision, not a Primary/Fallback chip:** the
substitution is expressed by splitting `c.route`'s off-product arm so the reader sees which surviving
route was chosen and why, and each message card then carries exactly one channel.

**Final orchestration:** **conditional routing on reachability**, containing the corpus's one true
fallback at its second level, with the confirmation inheriting the route that worked. Four arms, one
touch each, no cascade.

**Final customer channels:** **In-app** · **Email** · **SMS** — one per branch, and the confirmation
on the same route as the request. This is one of only three journeys in the library that legitimately
keeps three channels, because *which route still works* is the subject of the journey rather than a
hedge.

**Customer touch count:** **2** — the request and the confirmation. Both are `mandatory: true`, and
the journey's own cap correctly rations only *non-mandatory* touches (at 0): there is nothing
discretionary here.

**Final flow:**

```
Trigger: Contact point recorded undeliverable
  → Decision: What can carry the repair request without using the broken destination?
        ├ Signed in               → Message: Repair request (In-app)
        ├ Email survives          → Message: Repair request (Email)
        ├ Only the phone survives → Message: Repair request (SMS)
        └ Nothing working and permitted ──► Exit: no route left; destination stays suppressed
  → Wait: until a replacement verifies, the original becomes deliverable again, or the destination
          is removed  (one repair cycle)
        └ timeout ──► Exit: destination stays suppressed after one repair cycle
  → Decision: What ended the wait?
        ├ Recovered ──► Exit: original destination reachable again; nothing replayed
        └ Replaced
  → Message: Repair confirmation (on the route that carried the request)
  → Exit: destination replaced and in use; permission unchanged
```

**State re-checks:** `w.corrected.recheck` re-reads the person and the failed contact point from the
system of record before acting on the timeout. `s.g5` requires the corrected value to be **verified**
before the destination is treated as usable, and `s.g1` keeps the whole thing off the permission
record.

**Stop conditions:** `replacement_destination_verified` · `destination_deliverable_again` ·
`destination_removed` · `s.g4` — **one repair cycle per destination**, the journey's hardest rule and
the reason it must never retry.

**Ownership / handoff:** unchanged and important: **highest** in `contactability-question`, with
`onLoss: "paused"` rather than `suppressed` — the repair resumes, because this journey holds an
obligation to the person that survives a loss (I §4-8 records that as correct under GLB-05). While a
repair is open, **CON-300 stands down** rather than reading a dead destination as disinterest; that
dependency is stated on both sides and stays. This journey must not say anything about permission or
preferences — it repairs a route, it does not change consent.

**Canonical changes needed:**
1. Split `c.route`'s "Reachable off product" branch into "Email survives" and "Only the phone
   survives", each `observes: "contact point record, permission record, deliverability"`. Four
   branches in total.
2. Split `a.prompt-alt` into `a.prompt-email` (Email, role `persistent`) and `a.prompt-sms` (SMS).
   The `urgent` role is renamed to a surviving-route role and its `when` clause rewritten to the truth
   — *"the failed destination was the email address and a permitted, deliverable number survives"* —
   since no time bound exists in this journey.
3. `a.confirm`: bind the channel to the route recorded at `c.route` rather than declaring three.
4. `orchestration.touches`: `t2` splits into two; `t3`'s `channelRoles` reduces to the recorded role.
5. `channels: ["in-app","sms","email"]` unchanged — all three stay backed by an action.

**Display-only changes needed:** `c.route` stays drawn and gains a fourth arm; branch labels stay
short enough for the label budget — "Signed in" / "Email survives" / "Phone survives" / "Nothing
left". Each prompt card carries exactly one channel, which the split delivers.

**Renderer changes needed:** the one-group/no-rank-label rule (which also removes the `Primary: In-app`
chip). Where a message node's channel is resolved by the branch that reaches it, the layout engine
needs per-parent instancing extended from shared terminals to a shared message node, keyed the same
way — generic, and the same capability RET-24 and RET-28 need. Where a stage is genuinely
fallback, the deciding node must be **visible** (`_ARBITRATION.md` §5); here that is satisfied in
canonical by the `c.route` split rather than by a renderer rule.

---

## CON-300 — Unengaged Subscriber Sunset

**CONFLICT — ESCALATED** (display only). K §2.2 Tier A classifies `c.sendable2` — *"May the final
notice go out?"* — as a permission gate that does not change the visible route, escaping the collapse
rule "on a technicality of where the short arm goes first". C shows the short arm is not a technicality:
it goes to `a.suppress`, i.e. *there is nobody left to give notice to, so end marketing contact
without a notice*, which is the journey's declared end state. K's own P1-4 concedes the point in the
other direction — *"writing the marketing suppression **is** this journey's declared end state … so it
deserves a card — but as an **outcome**, not as an `Internal` cog card sitting mid-graph."* **Applied:
keep the decision drawn and re-kind `a.suppress` as an end-state/outcome card.** That satisfies both
audits and does not weaken the suppression.

**Purpose:** Decide whether continued marketing contact is still warranted for somebody who has
answered none of it — by asking them once, putting *fewer* beside *none* as a real answer, and ending
marketing contact where no answer ever comes.

**Current flow:**

```
Marketing contact unanswered across window
  → Does the record actually support the conclusion?
        ├ Nothing to read  → [record] → Exit: no-action
        ├ Already answered → Exit: answered
        └ Supported → (send gate) → [The question]  (Email + In-app)
  → Wait (answer window)
  → Did the question get an answer?
        ├ Keep it       → Exit: kept
        ├ Fewer instead → Handoff: CON-283 Frequency Preference Update
        ├ Stop it       → Handoff: CON-35 Permission Change Enforcement
        └ No answer → May the final notice go out?
              ├ No route left → [record marketing_suppression]
              └ Sendable → [Final notice]  (Email + In-app)
  → Wait (notice period) → What did the notice period end in?
        ├ Keep it / Fewer / Stop it → as above
        └ Ended by silence → [record marketing_suppression]
  → Can the ending be confirmed to the person?
        ├ Nothing to confirm on → Exit: ended
        └ Confirm it → [Confirmation]  (Email) → Handoff: CON-38 Communication Suppression
```

**Problems found:**

- **Email + In-app on the question and on the final notice.** Everything else about CON-300 is
  exemplary; this is the one place the template shows. (C F1; J `UNRESOLVED` ×2 → email.)
- `a.confirm-end` renders `Primary: Email` over a single channel. (K P0-2 Defect A.)
- `a.suppress` is drawn as a mid-graph internal cog rather than as the outcome it is. (K P1-4.)
- Nothing else. This is the best-authored journey in the domain.

**The channel argument, which is the journey's own.** The question must go out **on the route whose
silence is being read.** CON-300's trigger evidence requires *"confirmation that those sends ran on a
route whose engagement the company can observe"*, and its `persistent → email` role says email is
*"the default route, and the one the unengaged window was measured on"*. Asking "shall we keep writing
to you?" through an in-app notice — to somebody selected precisely because they do not read what we
send by email — asks the question somewhere other than where the evidence came from, and would let a
daily product user be sunset on the strength of a channel they never used. J settles it identically
from `s.unmeasurable`. **Email for all three touches**; the preference centre stays the destination and
is reached by a link.

**Final orchestration:** **sequential with a mandatory terminal notice.** Two discretionary touches
(the question, the final notice) and one mandatory one (the confirmation, which is a notice about our
own sending and is therefore not rationed against the discretionary budget). That third,
non-discretionary touch is unique in this set.

**Final customer channels:** **Email**, on all three touches.

**Customer touch count:** **3** — 2 discretionary + 1 mandatory, longest path to one recipient. It
reaches the brief's ceiling and the business reason is authored in the journey: a stated ending date
that passes without the ending happening *"teaches the person that nothing we say about their
preferences is load-bearing"*, so the confirmation is not optional.

**Final flow:** as current, with the question and the final notice reduced to Email, and `a.suppress`
drawn as the end state rather than as an internal step.

**State re-checks:** both waits re-read the engagement record, the preference record and the permission
record from the systems that own them. Every one of the four answers is re-read at both decision
points, so an answer arriving late still stops the sunset. Correct and untouched.

**Stop conditions:** `marketing_engagement_recorded` · `frequency_preference_changed` ·
`permission_withdrawn` · a higher-precedence contactability journey taking the person (CON-272's
repair, or a frequency confirmation) · the notice period expiring, which is the only path to
suppression.

**Ownership / handoff:** unchanged. **Lowest** in `contactability-question` — a contact repair is
fixing a route that broke and a frequency confirmation is answering a cadence the person chose, and
both already answer the question this journey would otherwise ask over the top of; CON-272 outranks
it, stated on both sides. The three handoffs (CON-38 enforcement, CON-283 frequency, CON-35
permission) are unchanged: **CON-300 decides; it never holds the suppression itself.** I §4-9 records
that `s.enforced` is right **not** to model the sunset as a competition group — *"it is a standing
state and not a contest: it decides who may be sent to afterwards, where a competition group decides
only who asks the question now"* — and that this must not be "fixed" by grouping.

**The end state is marketing suppression, and it is not weakened anywhere in this plan.**
- `a.suppress` writes `marketing_suppression` and **leaves the permission record exactly as it was** —
  *"silence is not an opt-out, and writing one here would put a decision on their record that they
  never made."* Untouched.
- CON-300 stays distinct from RET-32 on both sides (`s.notwinback`, reciprocal `distinctFrom`, RET-32's
  `s.sunset`). **No offer, no incentive, no argument for the relationship** appears on any of the three
  touches, per the authored `mustNotClaim` lists. That is what makes it a sunset rather than a second
  win-back, and why the reduced-cadence option sits *beside* stopping rather than in front of it.
- The suppression it writes is now genuinely read: **`s.sunset` is carried by 27 promotional/lifecycle
  journeys, eight of them in this plan part** (RET-30, RET-31, RET-32, RET-290, RET-292, RET-293,
  RET-294, RET-295). Nothing in this part removes an `s.sunset` clause, changes a
  `contact.defaultPriority`, or adds a communication action to a journey that would then need one —
  RET-24's new check-in stays `priority: "retention"` precisely for this reason. **Re-run
  `node scripts/sunset-suppression-evidence.mjs` after the RET-24 change; it must stay green in both
  directions.**
- One documentation row (I, D-25): RET-26 gains a row naming CON-300, mirroring the one CON-300
  already carries.

**ARBITRATION RESOLVED (Phase 1b):** CON-300 - RESOLVED: a.sendable2 draws as a decision card; a.suppress is re-kinded from an internal action to an outcome card, per K's own P1-4 concession that it deserves one. No suppression weakened: no s.sunset removed, no defaultPriority moved.

**Canonical changes needed:**
1. `channels: ["email","in-app"]` → `["email"]`.
2. Remove the `in-session → in-app` role; `fallback: "none"`.
3. `a.ask.channelRoles` and `a.final.channelRoles`: `["persistent","in-session"]` → `["persistent"]`.
   `a.confirm-end` is already `["persistent"]`.

**Display-only changes needed:** **do not collapse `c.sendable2`** — its short arm is a business
outcome, not a send-path gate. `a.suppress` is re-kinded as the journey's end state (an outcome card)
rather than an internal cog sitting mid-graph. `c.sendable` (the first gate) stays absorbed, as it
already is.

**Renderer changes needed:** the one-group/no-rank-label rule (which removes `Primary: Email` from the
confirmation). The collapse rule must recognise, generically, that **an internal action whose own
write is the journey's declared suppression is never absorbable and is drawn as an outcome, not as
bookkeeping** — the same rule that keeps a "stop every queued reminder" step visible elsewhere in the
corpus. No exception list, no journey id.

---

## FBK-41 — Feedback Request

**Purpose:** Ask about one completed experience, once, at a moment where asking is appropriate — and
treat the gap between asking and hearing back as a real state.

**Current flow:** (14 canonical / 14 display, nothing absorbed)

```
Potential feedback moment
 → Is the experience complete from the person's side?
      Not yet → Wait until experience_completed (timeout: completion_horizon, required)
                    timeout → Exit: never completed, nothing asked
                    event   ↘
      Complete ↘
 → Is there an unresolved issue in this context?          Unresolved → Exit: deferred
 → Has feedback been collected for this context recently? Already    → Exit: duplicate
 → Appropriate moment, within the ask budget?             Not now    → Exit: eligible, not asked
      Appropriate ↓
 → Request feedback   (In-app + Email + Push on one card)
 → Wait until feedback_submitted (3–7 days, example-only)
      event   → Exit: received (FBK-43 owns what it means)
      timeout → Exit: asked, no response — recorded as no signal
```

**Problems found:**

- **Three consecutive eligibility gates, six cards, all ending in "nothing was sent."** Only
  `c.complete` changes the customer's visible route (it opens a wait). `c.open-issue`, `c.recent` and
  `c.moment` are a gauntlet of two-branch questions whose short arms exit directly — which is why the
  collapse rule correctly declines them, and why the fix is canonical rather than display. (D.)
- **One message card carrying three channels and no visible rule**, which reads as the
  Primary/Fallback ladder this refactor exists to remove. (D; J `UNRESOLVED (in-session, persistent,
  low-friction)`.)
- `x.received` names FBK-43 in its text but there is no handoff and no link — canonically correct
  (FBK-43 has its own trigger and most asks never produce one), but the reader cannot follow it. (D.)
- No SMS, and that is **correct**.

**Arbitration — the surface split is not taken.** D designs conditional routing on where the
experience ended (In-app where they are still in the product, Push where the session ended, Email
where it ended off-product). **J examined that exact split and refused it**, and J is binding on
pattern and channel: *"the experiences this journey asks about are transactions, finished service
interactions, resolved support cases and usage milestones — most of which end outside the product. A
split on the experience's own surface would be the right answer, but `experience_ref` does not carry
its type anywhere in the data, so I am not inventing it."* The brief's own rule — do not invent a
routing signal; if the evidence for a split is not in the current data, prefer the simpler pattern and
say so — points the same way, and D's push arm would additionally be the only push left in these 17
journeys. **Applied: J. Single, email.** D's design is recorded with the signal that would revive it:
**the experience type carried on `experience_ref`** (transaction / service interaction / onboarding
milestone / support case / usage milestone — the trigger's evidence already enumerates exactly those
five, so the type is known at entry and simply is not carried onto the node). If that field is added,
this journey becomes conditional routing on the experience's own surface and should be revisited
first.

**Final orchestration:** **single**, with an **event-or-timeout** response window and an
event-or-timeout completion wait in front of it. One ask; `s.frequency` forbids a chase.

**Final customer channels:** **Email.** **No SMS** — a satisfaction ask has no deadline, no
consequence and nothing the person must do by a date; SMS here would be interruption without stake.
**No push** — a one-shot survey request is not a timely nudge, and nothing in the journey tests
reachability.

**Customer touch count:** **1.**

**Final flow:**

```
Potential feedback moment
 → Is the experience complete from the person's side?
      Not yet → Wait until experience_completed (completion_horizon) → timeout → Exit: never completed
      Complete ↓
 → Is asking appropriate now?             [ONE decision, three named no-send reasons]
      An unresolved issue is open here → Exit: deferred — resolution owns this first
      Already asked about this context → Exit: duplicate
      The ask budget is spent          → Exit: eligible, not asked
      Appropriate ↓
 → Message: Feedback request (Email)
 → Wait until feedback_submitted (3–7 days)
      event   → Exit: received — FBK-43 owns what it means
      timeout → Exit: asked, no response — recorded as no signal
```

**State re-checks:** the experience is re-read when `w.completion` fires (`recheck` already says so).
One touch, so nothing further is required.

**Stop conditions:** `feedback_submitted` · an unresolved issue appearing in the context ·
the standing marketing suppression (`s.sunset`, CON-300 / CON-38) · **FBK-42 taking the `outbound-ask`
slot**.

**Ownership / handoff:** unchanged and already exemplary (I §1.7): FBK-41 loses `outbound-ask` to
FBK-42 when both are eligible for the same person at the same moment — *"advocacy already presupposes
satisfaction … asking both back-to-back for the same goodwill moment reads as farming it twice"* — and
the loser's cost is written down on both sides (*"recorded as not-now and remains free to re-open
independently at its next moment"*). The `communication-purpose` scope is the right choice: the
contest is over one ask slot, not over an entity. **FBK-43 owns whatever comes back**, and correctly
without a handoff node. This journey must not interpret the feedback it receives.

**Canonical changes needed:** (`src/canonical/feedback.ts`)
1. Merge `c.open-issue`, `c.recent` and `c.moment` into one condition `c.appropriate` with four
   branches. **Keep `x.deferred`, `x.duplicate` and `x.not-now` exactly as they are** — their
   `reEntry` semantics differ materially and must not be merged. Net −2 cards.
2. `a.request`: `channelRoles` → `["persistent"]`; `channels: ["email","in-app","push"]` →
   `["email"]`; remove the `in-session` and `low-friction` roles; `fallback: "none"`.
3. `feedback_request.touches` stays **1**; update `applicableWhen` to state that one ask is the whole
   plan.
4. Record the revisit condition (the experience type on `experience_ref`) in the journey's own notes
   so the refused split is not re-derived from scratch.

**Display-only changes needed:** none beyond what (1) and (2) produce — three cards become one, and
the message card carries one channel.

**Renderer changes needed:** the one-group/no-rank-label rule. An exit should be able to **name
another journey as text the reader recognises without it being a link** — the same affordance an
archived handoff needs, expressed as a generic capability of exit cards rather than as anything
journey-specific.

---

## FBK-42 — Advocacy Request

**Purpose:** Ask someone to vouch for us only where the relationship has earned it, and keep
publishing what they give us a separate permission.

**Current flow:** (15 canonical / 14 display; `a.evaluate` absorbed)

```
Potential advocacy opportunity
 → Is there an open negative issue anywhere in this relationship?  Something open → Exit: suppressed
 → [Weigh the accumulated positive evidence]                       (absorbed)
 → Is the evidence sufficient to justify asking?                   Not yet → Exit: not yet eligible
 → What size of request does this evidence support?
      Low commitment  → Light ask   (Email + In-app + Push)
      High commitment → Heavy ask   (Email + In-app)  — never push
 → Wait until advocacy_action_taken | request_declined (window required, no default)
      timeout → Exit: no response; nothing inferred
      event   → What came back?
                  Contributed, for public reuse → Handoff: CON-31 Permission Validation
                  Contributed, internal only    → Exit: contributed
                  Declined                      → Exit: declined; cooldown in force
```

**Problems found:**

- **`localCap` is 2 and only one ask is ever sent.** `a.ask-light` and `a.ask-heavy` are the two arms
  of `c.type` and can never both fire; the cap is set to "the plan's own length" over mutually
  exclusive branches. This is the touch-count rule the arbitration restates: count the longest path to
  one recipient, not `touches.length`. (D.)
- **The light ask leads with `persistent`.** A one-tap rating's whole point is the low-friction route;
  leading with email makes the light ask indistinguishable from the heavy one. (D; J: light ask →
  `in_app`, heavy ask → `email`.)
- **Two messages about the same compliment can land back to back** — not through FBK-41, which is
  properly arbitrated, but through FBK-43: `FBK-43.a.acknowledge-positive` sends "thank you for saying
  that", then `c.contribution → c.eligible → h.advocacy` hands straight to FBK-42, whose eligibility
  does not read how recently an acknowledgement about the same record went out. FBK-43 is
  `pressureClass: service`, so its acknowledgement does not spend the `outbound-ask` budget either.
  (D.)
- Both message cards render an **identical channel block**, so the canvas spends its most prominent
  space on the thing that is the same and line-clamps the thing that differs — which is the *content*
  of the two asks. (K P2-10.)

**Arbitration — no push on the light ask.** D's final channels read `in_app → push → email` as a
same-role substitute. J reduces push to the three journeys in the corpus that can actually resolve
reachability (ACQ-287, ACQ-288, ACQ-289) and lists FBK-42's light ask as `single → in_app`. FBK-42
records no device-registration state and no condition reads one. **Applied: J. In-app only on the
light ask, email on the heavy ask.** Fixing K P2-10 then comes for free: the two arms stop carrying
the same channel block, and the visible difference becomes the real one.

**Final orchestration:** **segment-based**, with an **event-or-timeout** response window. The size of
the ask is set by the strength of accumulated evidence, which is a real segment already drawn at
`c.type`, and it changes both what is asked and what the channel has to do. J agrees this is a
legitimate segment-based channel difference (each arm is then a single send on one channel), which is
why the two audits' labels — "segment-based" at journey level, "single" per stage — describe the same
shape.

**Final customer channels:** **In-app** (light ask — one tap, at a moment the person is succeeding,
in the product) · **Email** (heavy ask — *"a durable, reviewable route, stating plainly what would be
used, where, and that agreeing to contribute is separate from agreeing to publication"*). **Never push
on the heavy ask** (already encoded; keep). **No SMS** — a favour has no deadline, and interrupting
someone to ask for one is how a supporter becomes a complaint.

**Customer touch count:** **1** — light ask *or* heavy ask, never both.

**Final flow:** as the current flow, with the light ask reduced to In-app, the heavy ask to Email, and
one added eligibility clause (below).

**State re-checks:** `c.negative` at entry, and **it must stay drawn** — `s.g6` says an open negative
issue suppresses this *whatever the positive evidence says*, which is a business rule, not a gate.
New: at instance open, read whether an acknowledgement about the same feedback record was sent inside
the ask separation window.

**Stop conditions:** `advocacy_action_taken` · `request_declined` · an open negative issue appearing ·
`s.sunset`.

**Ownership / handoff:** FBK-42 **wins** `outbound-ask` over FBK-41, stated from both sides (I §1.7).
**`h.permission → CON-31` must stay drawn and must not be collapsed**: contributing is not permission
to publish, the contribution is held unpublished until CON-31 records the scope, and that boundary is
the journey's whole reason to exist — guard check G2 covers it and must keep covering it. This journey
must not publish anything, and must not claim the acknowledgement FBK-43 may already have sent.

**Canonical changes needed:** (`src/canonical/feedback.ts`)
1. `advocacy_eligibility.touches` default **2 → 1**, rule: *"One ask per opportunity — light or heavy,
   never both."*
2. `a.ask-light`: `channelRoles` → `["in-session"]`, channel In-app; `a.ask-heavy`: `channelRoles` →
   `["persistent"]`, channel Email. Remove the `low-friction → push` role; `fallback: "none"`.
   `channels: ["email","in-app","push"]` → `["email","in-app"]`.
3. Add the eligibility clause *"no acknowledgement about the same feedback record was sent inside the
   ask separation window"*, and have `FBK-43.h.advocacy` carry the acknowledgement's send time (the
   FBK-43 half is in that section).
4. Optional documentation: `distinctFrom` names only FBK-43 today; adding FBK-41 records what the
   group already enforces.

**Display-only changes needed:** none. `a.evaluate` **stays absorbed** — K §3.1 names it among the
analysis steps whose output is the question the very next Decision card asks (`c.sufficient` carries
it and lists it under *Represented canonical steps*), and D itself records that nothing is lost.
D's proposal to give it a `writes` entry purely so it keeps a card is **not applied**: it is a
canonical edit made for a display reason on a node the horizontal audit rules correctly absorbed. If
`relationship_evidence` is genuinely read by a later node, declare it for that reason and let the card
return as a consequence.

**Renderer changes needed:** the one-group/no-rank-label rule. Generically, where two arms of a
drawn decision produce message cards, the card's prominent space should carry what differs rather than
the channel block they share — a card-content rule, not a layout exception.

---

## FBK-43 — Feedback Follow-Up

**Purpose:** Get one piece of feedback to the process that can act on it, and keep the record open
until anything promised in return has actually happened.

**Current flow:** (34 canonical / 32 display — the largest canvas in this set; 6 shared-terminal
instances; `a.persist`, `a.classify`, `a.attach`, `a.assess`, `a.product` absorbed on EN and
`a.persist-positive` absorbed on TR only)

```
feedback_received → [persist verbatim] → [classify: 7 values]
 → What does this mean operationally?
    PRAISE            → [store as dated evidence] → Is recognition appropriate?
                            Worth it → Acknowledge the specific praise  (Email + In-app)
                            Not      ↘
                        → Did they volunteer something reusable?
                            Yes → Handoff: external advocacy-contribution
                            No  → Does the relationship meet advocacy eligibility?
                                    Eligible → Handoff: FBK-42
                                    Not      → Exit: recorded as evidence
    SERVICE_ISSUE /   → Does an open case already cover this?
    COMPLAINT              Yes → [attach] → Exit: attached
                           No  → [assess] → Is there an actionable operational issue?
                                    Not actionable → Acknowledge (Email + In-app) → Exit: heard
                                    Actionable     → Escalation criteria?
                                                        Severe   → [mark severity] ↘
                                                        Ordinary → Handoff: FBK-46
    SUPPORT_NEED      → [create work item]   ← NOTHING IS SAID TO THE PERSON
                        → Wait until work_item_outcome_recorded (the owning SLA, required)
                              timeout → Exit: obligation outstanding; loop not closed
                              event   ↘
    PRODUCT_FEEDBACK  → [pass to product intake] ↘
                        → Was a follow-up promised?
                              Nothing promised → Exit: loop closed
                              Promised → Wait until promised_followup_delivered (7–14d)
                                            event   → Exit: loop closed
                                            timeout → Handoff: DEC-181
    GENERAL_COMMENT   → Is an acknowledgement appropriate? → Acknowledge / Exit: stored
    UNKNOWN           → Handoff: DEC-181
```

**Problems found:**

- **The touch plan counts internal work as touches.** `orchestration.touches` has **five** entries
  (verified in the export); two — `t-obligation` → `a.obligation` and `t-escalate` → `a.escalate` —
  carry `channelRoles: ["human"]` and are internal routing, so any counter reading `touches.length`
  reports FBK-43 as a 5-touch journey. **The `localCap` is already correct at 1** — *"One
  acknowledgement per feedback record, on whichever route it took"* — and the journeys whose *cap*
  counts an internal work item are **FBK-49 and ACT-13**, not this one (`_ARBITRATION.md` §2).
  **FBK-43's defect is its touch plan, not its cap.** (D.)
- **Two of the five "Primary: Task" cards in the library are here** — `a.obligation` and `a.escalate`,
  both `execution: "human"`, `customerFacing: false` in canonical, both drawn in the customer-channel
  pill idiom. (K P0-2 Defect A; J §4.2; `_ARBITRATION.md` §4.)
- **`task` must stay in `channels`.** It backs those two actions and `validate:canonical` errors in
  both directions if a declared channel has no backing action. `publicChannels()` already filters it
  from public badges. Do not delete it and do not present it as a customer channel anywhere.
- **The SUPPORT_NEED branch says nothing to the person who asked for help** — the branch most likely
  to belong to somebody waiting on us is the only classification that reaches a message-free limb.
  REM-305 exists for exactly this and triggers on `support_request_received`, which is what
  `a.obligation`'s work item raises; nothing in FBK-43's data says so, so the gap reads as an omission
  rather than as deference. (D.)
- **`distinctFrom` is empty** on a journey that FBK-41, FBK-42, REM-151 and REM-305 all name in
  theirs. (D; I §1.7 and D-12.)
- **`w.followup` invents a deadline the journey says it never invents.** `feedback.obligation_sla` is
  correctly `required: true`, but `feedback.promise_window` carries an `example-only` 7–14 day default
  while the promise has its own date (`relativeTo: "attribute"` is already set). (D.)
- `a.persist-positive` is drawn on EN and absorbed on TR. (K P0-1, one of five journeys.)
- Four `c.route` edge labels are raw enum tokens (`SERVICE_ISSUE or COMPLAINT`, `SUPPORT_NEED`,
  `PRODUCT_FEEDBACK`, `GENERAL_COMMENT`) — a class the hygiene check cannot currently see at all.
  (K P1-6.)

**Final orchestration:** **conditional routing** — a seven-way classification that decides what is
said, to whom, and whether anything is said at all — plus **event-or-timeout** twice (the owning
process's SLA, and the promise window). Explicitly **not sequential**: no path sends two
acknowledgements. The channel is routed by a signal the record already carries.

**Final customer channels:** **the route of origin** — `email` or `in_app`, chosen per instance from
`feedback.source`, never both on one card. The cap already states the rule: *"One acknowledgement per
feedback record, **on whichever route it took**."* Somebody who complained in one place and is
answered in another reads it as the complaint having been passed around. **No SMS and no push**: an
acknowledgement is never urgent and asks the person to do nothing. `task` stays declared and filtered
at the publishing boundary. (D and J agree; J names this among the cheapest conditional routing to
implement because the data is captured at entry.)

**Customer touch count:** **1** — exactly one acknowledgement per record. Up to two internal work
items, which are not touches.

**Final flow:** as the current flow, with three changes: each of the three acknowledgements carries
one channel, resolved from `feedback.source`; `a.obligation` states that the work item it raises is
acknowledged to the requester **by REM-305**, not from here; and the promise wait reads the promise's
own date.

**State re-checks:** `c.existing` before opening a case (do not open a second); `c.actionable` before
acknowledging a negative (do not manufacture a fault); `c.promise` after the work item resolves. New:
before `h.advocacy` fires, carry whether and when an acknowledgement about this record was sent — the
reciprocal of FBK-42's new eligibility clause.

**Stop conditions:** `work_item_outcome_recorded` with nothing promised → `x.closed` · an open case
already covering it → `x.attached` · `UNKNOWN` → `h.triage` · a promise broken → `h.promise`, which
escalates rather than expiring (correct; keep).

**Ownership / handoff:** FBK-46 takes an actionable issue and suppresses satisfaction and retention
outreach about the same experience; FBK-42 takes advocacy eligibility; DEC-181 takes the
unclassifiable and the broken promise; `external:advocacy-contribution` takes a volunteered reusable
contribution. **REM-305 owns acknowledging a support request** — this journey must not also
acknowledge it. `contact.competition` is correctly `"none"`: the entity is the feedback record, and
FBK-43 opens only once feedback has actually arrived (I §1.7). Populate `distinctFrom` (I, D-12).

**Canonical changes needed:** (`src/canonical/feedback.ts`)
1. **Exclude `channelRoles: ["human"]` entries from the touch plan's customer count** — either drop
   `t-obligation` / `t-escalate` from `orchestration.touches` (the action nodes already carry
   `execution: "human"`, which is what backs `task`) or mark them so every counter excludes them.
   **Whichever is chosen must be applied identically to FBK-49 and ACT-13.** A touch plan, like a cap,
   counts customer-facing touches only.
2. Bind each acknowledgement's channel to `feedback.source` (recorded at `a.persist` with the id,
   source, related entity and timestamp) instead of declaring two roles;
   `a.acknowledge-positive`, `a.acknowledge-negative` and `a.acknowledge` each resolve to one channel.
3. `a.obligation`: state that the requester is acknowledged by REM-305 on `support_request_received`,
   and carry the feedback record id so the two records stay linked.
4. Populate `distinctFrom`: FBK-41 (*this begins only if something comes back*), FBK-42 (*this reacts
   to one signal; that weighs the accumulated relationship*), REM-305 (*this starts from an account of
   an experience; that from a request made of us*), REM-151 — the reciprocals of text those journeys
   already carry.
5. `feedback.promise_window`: drop the `example-only` default; `required: true` against
   `promised_followup_at`.
6. `h.advocacy` carries the acknowledgement's send time (FBK-42's new clause reads it).
7. `c.route`'s branch labels: replace the raw enum tokens with the prose they stand for; the enum stays
   in canonical data, not on an edge label.

**Display-only changes needed:** `a.persist-positive` keeps its card on **both** locales. Nothing on
the loop-closure limb (`a.obligation` → `w.outcome` → `x.open` → `c.promise` → `w.followup` →
`h.promise` → `x.closed`, plus `a.product`) should be absorbed — it is all real business logic, and it
is the part of a 32-card canvas a reader has least context for. `c.route`'s seven branches and the
three mutually exclusive acknowledgements stay drawn; so do `c.existing` and `c.actionable`.

**Renderer changes needed:** the locale-invariance fix and its cross-locale gate. **The human-action
rule**: an action with `execution: "human"` or `customerFacing: false` gets no channel chip at all, and
the string `Task` never appears where a channel appears — these two cards are two of the five sites.
The widened identifier check, run over edge labels as well as card text. A generic grouping affordance
for a large canvas (routing vs loop closure) is **recorded as a want, not proposed as a fix** — adding
one for a single journey would break the generic-only rule.

---

## FBK-49 — Missing Information Reminder

**Purpose:** Treat a genuinely blocking data gap as a named dependency — the exact item, and the
process that cannot proceed without it — rather than as wanting to know more about someone.

**Current flow:** (15 canonical / 12 display; `a.identify`, `a.retrieve`, `a.persist` absorbed)

```
required_data_missing_and_blocking
 → [identify the exact item and the process it blocks]        (absorbed)
 → Can an authoritative source supply this without asking anyone?
      We already have it → [retrieve and reconcile]  (absorbed) ↘
      It has to be provided ↓
 → Who can actually supply it?
      The customer     → Request it   (Email + In-app)
      Someone internal → Raise an internal work item   (task — NOT a customer channel)
 → Wait until requested_information_received (window required, sized to what is blocked)
      timeout → Given how critical the blocked process is, what now?
                   Critical           → Handoff: external human-in-the-loop (carries what was tried)
                   Alternate route    → Exit: proceeding by another path
                   Not worth pursuing → Exit: stays blocked and says so
      event   → Is what we now have valid?
                   Valid   → [persist] (absorbed) → Exit: requirement satisfied
                   Invalid → (straight to the criticality question — SILENTLY)
```

**Problems found:**

- **The cap counts the internal work item.** `missing_critical.touches` = 2 with the rule "the budget
  is the plan's own length", where the plan is `[a.request (customer), a.request-internal (human)]` —
  two mutually exclusive branches of `c.provider`, only one of which reaches a customer. **FBK-49 and
  ACT-13 are the two journeys whose cap counts an internal work item** (`_ARBITRATION.md` §2); a cap
  that counts internal work is not a contact cap. (D.)
- **What the customer sent can be rejected without anybody telling them.** `c.valid`'s "Invalid or
  incomplete" arm goes straight to `c.criticality`, which can reach `x.abandoned` — *"the blocked
  process stays blocked and says so"* — says so to whom? A person who was asked for a document, sent
  one, and hears nothing has no way to know it was refused. The branch already exists in the graph;
  only the message is missing. (D.)
- **`a.retrieve` is absorbed although it is the entire content of the "we already have it" branch.**
  It writes nothing, so the absorption rule hides it, leaving `c.authoritative → c.valid` with an
  invisible step between them. (D.)
- **`w.received.until` listens for one event only.** If the blocked process is cancelled, or the
  requirement is satisfied by another route, the instance waits out its window and then escalates a
  dependency nobody needs. `dependency_resolved` and `process_cancelled` both exist in
  `src/canonical/events.ts` (the former's registry `entity` reads "the fulfilment request", which an
  implementer should check before reusing it). (D.)
- **`a.request-internal` renders `Primary: Task`** — one of the five human actions drawn in the
  customer-channel idiom. (K P0-2 Defect A; J §4.2.)
- **`competition: "none"`** while TIM-268's eligibility names FBK-49 as an owner it defers to —
  unenforced and unreciprocated. (D; I, P1-4 and D-28.)

**Arbitration — the request is email only.** D's final channels are `email` (a request for a document
must survive until they can act on it) *and* `in_app` (where they are in the product), with nothing in
the graph choosing between them — which is precisely the defect the matrix exists to remove, and J
lists `a.request` under `single → email`. **Applied: J.** The same reasoning is extended to the new
rejection touch D adds, since it is the same conversation about the same item and nothing selects a
surface. Both audits agree on **no SMS**: there is no `due_at`, no urgent-horizon attribute and no
recorded consequence with a date — the wait is "as long as the blocked process can afford", which is a
business window the customer cannot see.

**Final orchestration:** **conditional routing** — who actually holds the missing item decides who is
asked and on which route, and that is the journey's one real split — plus **event-or-timeout** bounded
by what the blocked process can afford. **Not fallback**: the internal work item is not a substitute
for a failed customer email, it is a different party. **Not sequential**: the second customer message
exists only where the first produced something we had to refuse.

**Final customer channels:** **Email**, on both customer touches. `task` stays declared to back
`a.request-internal` and stays filtered from public badges — it is never presented as a customer
channel.

**Customer touch count:** **2** — one request, and one rejection notice only where what arrived was
received and refused. The second touch is earned by a genuine state change: we now know the item
arrived and does not satisfy the requirement, which is information the person cannot have. (J's
summary row reads 1 because the rejection node does not exist yet; the second touch is a business-flow
addition, which is the domain audit's column.)

**Final flow:**

```
Required data missing and blocking
 → [identify the exact item and the process it blocks]
 → Decision: Can an authoritative source supply it?
      We hold it → [Retrieve and reconcile]  → (join the validity check)      ← drawn
      It must be provided ↓
 → Decision: Who holds it?
      The customer     → Message: Request it, naming what it unblocks   (Email)
      Someone internal → [Raise an internal work item]                  (internal — no channel chip)
 → Wait until requested_information_received
        (or dependency_resolved / process_cancelled — the requirement stopped mattering)
      event → Decision: Is what we now have valid?
                 Valid   → [persist] → Exit: requirement satisfied, the process resumes
                 Invalid → Message: what was wrong, and re-request  (Email)   ← 2nd touch
                              → back to the same wait, ONCE (the cap enforces it)
      timeout → Decision: How critical is the blocked process?
                 Critical           → Handoff: human-in-the-loop (carries what was already tried)
                 Alternate route    → Exit: proceeding another way
                 Not worth pursuing → Exit: stays blocked and says so
```

**State re-checks:** `c.authoritative` before asking anyone at all (do not ask for what we already
hold); `c.valid` on arrival; and a re-read before the re-request that the item is **still required** —
the blocked process may have been cancelled while we waited.

**Stop conditions:** `requested_information_received` **and** valid · the requirement being met by
another route (`dependency_resolved`) · the blocked process being cancelled (`process_cancelled`) ·
the touch budget of 2.

**Ownership / handoff:** `external:human-in-the-loop-lifecycle` on escalation, **carrying what was
already tried so nobody repeats the request that failed**. ACT-13 owns the same shape scoped to
activation and `distinctFrom` already states it. The unreciprocated boundary is with **TIM-268**,
whose `s.g6`/`s.g7` defer to type-specific journeys while none of the eight named journeys says so
back (I, P1-4): add `s.generic-reminder` — *"This journey owns the reminder for the obligation it
holds. The generic outstanding-obligation reminder (TIM-268) is suppressed for that obligation while
this instance holds it: one obligation is reminded of once, by whoever owns its type, and a generic
reminder arriving after the specific one is not a later touch but a second sender."* — plus a
`distinctFrom → TIM-268` row. **Do not** declare FBK-49 into TIM-268's exclusion group: I is explicit
that a group added to make a suppression convenient is how unrelated lifecycles start blocking each
other. D's alternative (join `obligation-reminder` at scope `communication-purpose`) is recorded as
the domain's preference; **I is binding on ownership and its suppression-plus-`distinctFrom` form is
applied.** This journey must not name a deadline it does not have.

**Canonical changes needed:** (`src/canonical/feedback.ts`)
1. `missing_critical.touches` → **2 customer touches**, rule rewritten: *"One request to whoever holds
   the item, and one re-request only where what arrived was received and refused. An internal work
   item is not a touch."* The number happens to stay 2, for a different and honest reason. Apply the
   same human-entry exclusion to the touch plan that FBK-43 and ACT-13 receive (one decision, three
   journeys).
2. Add `a.reject` (`execution: "communication"`, Email) on `c.valid`'s "Invalid or incomplete" arm,
   naming what was wrong, routed back to `w.received` **once**.
3. `a.request`: `channelRoles` → `["persistent"]`; `channels: ["email","in-app","task"]` →
   `["email","task"]`; remove the `in-session` role; `fallback: "none"`.
4. `a.retrieve`: declare the state it produces — `writes: [{ field: "requirement_value", mode: "set" }]`
   — so it keeps its card. This is applied (unlike FBK-42's `a.evaluate`) because the host card
   **cannot** carry its meaning: it is the whole content of a different branch, not an analysis step
   whose output is the next question, and K §4.3(3) states exactly that criterion. `a.identify` and
   `a.persist` write only `blocking_requirement_log` and stay absorbed.
5. Add `dependency_resolved` and `process_cancelled` to `w.received.until`.
6. Add `s.generic-reminder` and `distinctFrom → TIM-268` as above.

**Display-only changes needed:** `a.retrieve` regains its card as a consequence of (4). `c.provider`
stays drawn — it decides whether a customer is written to at all, and it is one of the forks K names
as genuinely changing the route. `a.request-internal` stays on the canvas as an internal step with no
channel chip.

**Renderer changes needed:** the human-action rule (no channel chip, and `Task` never in a channel
position) — this is one of the five sites. The one-group/no-rank-label rule. The structural-`writes`
fix, since (4) only works if absorption reads structure rather than prose.

---

# Summary

## Per-journey outcome

| ID | Journey | Before | Final pattern | Final channels | Touches | Biggest change |
|---|---|---|---|---|---:|---|
| **RET-24** | Churn Risk Escalation | routing only — **no customer channel** | conditional routing | Email · In-app (+ `task`, internal) | 1 | Supplies the retention intervention the corpus already assumes; the channel-rule exception is deleted |
| RET-26 | Service Recovery | single, Email+Push | single | Email | 1 | Push removed — an acknowledgement is a document, not a nudge |
| RET-28 | Cancellation Save | two dual-channel touches | conditional routing | In-app · Email | 1–2 | The routing rule its own `channelStrategy` states is finally drawn; `c.ask` deleted |
| RET-30 | Retention Offer Follow-Up | event-or-timeout, Email+In-app | event-or-timeout | Email | 0–1 | `a.verify` regains its card; fed by a real delivery; one half of the ACT-18 deadlock fix |
| RET-31 | Predicted Need Replenishment | 2 touches × 3 channels | combination (sequential pair, attribute-anchored, event-or-timeout waits) | Email | 2 | Push/in-app removed; the corpus's worst one-sided hub is reciprocated |
| RET-32 | Lapsed Customer Win-Back | 2 touches, Email+Push, no-op fork | sequential | Email | 1–2 | `c.basis` deleted (a fork whose arms did the same thing) |
| RET-290 | First Purchase Thank You | 2 touches, 2–3 channels | sequential | Email | 1–2 | Channels reduced; the FUL-301 boundary preserved in all three places it lives |
| RET-292 | First Purchase Anniversary | single, 3 channels | single | Email | 1 | The minimal correct journey: `Trigger → Decision → Email → Exit` |
| RET-293 | Personalized Recommendations | single, 3 channels + cascade | single | Email | 1 | Cascade removed; the only trio member with no second touch |
| RET-294 | Cross-Sell / Next Best Offer | 2 touches, 3+2 channels | sequential behind a maturation wait | Email | 1–2 | Channels reduced; the maturation wait is its distinguishing anchor |
| RET-295 | Birthday & Milestone | single, 3 channels, drawn send gate | single | Email | 1 | Send gate folded into `c.date`; mirrors RET-292 by design |
| **CON-272** | Contact Recovery | routing decision, dual/triple-channel arms | conditional routing (contains the library's one true fallback) | In-app · Email · SMS | 2 | The off-product arm splits by which route actually survives — a visible decision, not a label |
| CON-300 | Unengaged Subscriber Sunset | 3 touches, 2 of them dual-channel | sequential + mandatory terminal notice | Email | 2 + 1 mandatory | Asks on the route whose silence it reads; suppression untouched and drawn as an outcome |
| FBK-41 | Feedback Request | single, 3 channels, 3 gate cards | single | Email | 1 | Three eligibility gates merge into one four-branch decision; the surface split is refused, with the signal named |
| FBK-42 | Advocacy Request | segment arms, 3+2 channels | segment-based | In-app (light) · Email (heavy) | 1 | Cap 2 → 1; the two arms stop carrying the same channel block |
| FBK-43 | Feedback Follow-Up | 3 stages × 2 channels, 5-entry touch plan | conditional routing | route of origin: Email or In-app | 1 | The touch plan stops counting internal work; the acknowledgement follows `feedback.source` |
| FBK-49 | Missing Information Reminder | 1 customer stage × 2 channels, cap counts a `task` | conditional routing | Email | 2 | A rejection is told to the person who sent the document; the cap stops counting the work item |

## Pattern distribution — no convergence

| pattern | journeys | count |
|---|---|---:|
| single | RET-26 · RET-292 · RET-293 · RET-295 · FBK-41 | 5 |
| conditional routing | RET-24 · RET-28 · CON-272 · FBK-43 · FBK-49 | 5 |
| sequential | RET-32 · RET-290 · RET-294 · CON-300 | 4 |
| event-or-timeout | RET-30 | 1 |
| combination (sequential pair over attribute-anchored event-or-timeout waits) | RET-31 | 1 |
| segment-based | FBK-42 | 1 |
| parallel | none — nothing here needs two channels at one moment | 0 |
| fallback as a whole-journey pattern | none — CON-272 contains the one true fallback **inside** its routing decision | 0 |

Channels after: Email on 16 of 17; In-app on 5 (RET-24, RET-28, CON-272, FBK-42, FBK-43); SMS on 1
(CON-272, as the surviving route); **push and WhatsApp on none**. Touch counts range 0–1 … 3; no
journey exceeds 3, and the one at 3 documents why.

**The recovery cluster keeps five distinct shapes.** RET-26 single (1 touch) · RET-28 conditional
routing (1–2) · RET-30 event-or-timeout (0–1) · RET-32 sequential (1–2) · CON-300 sequential plus a
mandatory notice (3) · RET-24 conditional routing plus escalation (1). Six journeys, five shapes, six
different touch profiles. **The recommendation trio keeps three.** RET-31 reads the person's own prior
purchase and the item's usable life and brackets a computed date with two touches; RET-293 reads a
recorded signal about the person and sends one set, then only measures; RET-294 reads a declared
relationship between two products plus ownership and matures before offering, then reminds once. Three
evidence sources, three claims, three topologies.

## Cross-cutting items this part depends on

1. **Locale-invariant display graph** (structural `writes` on `FlowNode`; lay out once on unlocalised
   nodes; a gate comparing drawn node and edge sets across locales). Three of its five victims are
   here: RET-24 `a.evidence`, RET-26 `a.assess`, FBK-43 `a.persist-positive`. Without it, every
   newly drawn internal action in this part disappears on the Turkish route.
2. **The channel-priority rule**: no `Primary` label over a single group; no `Fallback` label where the
   declared fallback is not role-advancing; a role's channels render as alternatives, not a hierarchy.
3. **The human-action rule**: `execution: "human"` / `customerFacing: false` never renders a channel
   chip, and `Task` never appears where a channel appears. Three of the five sites are in this part
   (RET-24 `a.owner-task`, FBK-43 `a.obligation` and `a.escalate`, FBK-49 `a.request-internal` — four
   cards).
4. **Per-parent instancing of a shared message node**, needed by RET-24, RET-28 and CON-272 if a
   branch-resolved channel is authored on one node instead of two. Generic; if it is not built,
   author the nodes separately and take the duplication in canonical.
5. **The no-action-arm and degenerate-decision rules** (with the parent test intact), which clean
   RET-31, RET-32, RET-292, RET-293 and RET-295 without a single journey-specific branch.
6. **One decision applied to three journeys**: a touch plan, like a cap, counts customer-facing
   touches only — FBK-43, FBK-49 and **ACT-13** (not in this part) must be changed the same way.
7. **Two paired ownership edits that cross plan parts**: RET-30 ↔ **ACT-18** (the `retention-outreach`
   deadlock — neither side may land alone) and RET-31 ↔ **SCH-282** / **ACQ-289** (the
   `commerce-recovery` rank and the four hub rows).
8. **`node scripts/sunset-suppression-evidence.mjs` must be re-run** after RET-24's canonical change;
   RET-24's new action stays `priority: "retention"` so that the script stays green in both
   directions, and no `s.sunset` clause is added or removed anywhere in this part.

# Phase 1b plan — part 3

`TIM-61` `TIM-63` `TIM-268` `TIM-274` `TIM-281` · `ACC-261` `ACC-263` `IDN-84` `IDN-271`
`FIN-134` `FIN-302` · `DOC-214` `DOC-215` `INC-254` `REL-284` `RLT-279` `RSK-273`

Consolidated from `feedback-time.md` (TIM sections only), `access-finance.md` and
`system-events.md` for business flow, waits, touch counts, state re-checks and canonical edits;
from `orchestration-matrix.md` for every orchestration pattern and every final channel; from
`ownership.md` for ownership, precedence, handoffs and `distinctFrom`; from `canvas.md` for every
display and renderer change. **What I arbitrated:** the channel column was the whole of the
disagreement — J is markedly more austere than the three domain audits, and I applied J
everywhere, which drops WhatsApp and push from TIM-61 entirely, drops push from FIN-134's
reminder, drops in-app from ACC-261, REL-284, FIN-302 and FIN-134's two prompts, turns TIM-63's
four-channel prompt and TIM-268's two-channel reminder into email, turns TIM-274's last call and
FIN-134's reminder into genuine parallel sends, and makes ACC-263's `a.brief`, RLT-279's
`a.inform-hold` and RSK-273's `a.at-the-wall` in-app-only. On ownership I applied I over the TIM
domain audit's proposal to enrol six journeys in the `obligation-reminder` exclusion group: I
rules that out under GLB-01/GLB-03 and prescribes a reciprocal `s.generic-reminder` suppression
plus a `distinctFrom` row instead, which is what TIM-63, ACC-263, DOC-215, REL-284 and RLT-279
carry below. On the canvas I applied K's G9 rule over the INC-254 domain section's claim that all
its drawn decisions are business logic — `c.cohort` and `c.verified` each draw one edge and are
absorbed. **One section is marked `CONFLICT — ESCALATED`: INC-254**, where J's "single, delegated,
email" and the domain audit's "parallel, email and in-app" are answers to the same question and
the domain audit holds evidence J does not cite. Everything else in the three domain audits'
canonical columns is carried through unchanged, including the five refusals to add work: DOC-214
stays one touch, DOC-215 stays email, INC-254 gains no wait, RSK-273 gains no second parallel
pair, and `none` appears in the last three fields wherever it is the truth.

---

## TIM-61 — Deadline Tracking

**Purpose:** Let a governing deadline control the *state* of one obligation rather than schedule
messages around a date: hold the deadline, its policy thresholds and what would satisfy it, and
send at most one reminder per threshold the policy actually defines.

**Current flow:**
```
authoritative_deadline_assigned
 → [store the deadline, its timezone, its owner, what counts as completion]   (absorbed)
 → Wait until obligation_satisfied | pre_deadline_threshold_reached
       (timeout: the deadline itself — attribute-bound, required)
     event → Which happened?
                Completed  → [mark satisfied, invalidate every queued reminder] (absorbed)
                             → Exit: satisfied before its deadline
                Threshold  → Is a reminder useful here, and does policy define one?
                                No  → back to the wait
                                Yes → Reminder  [email · push · sms · whatsapp]  → back to the wait
     timeout → The deadline passed with the obligation open — what does the rule say?
                OVERDUE → Handoff TIM-62 · ESCALATED → Handoff OWN-55 · EXPIRED → Handoff TIM-64
                FAILED → Exit: failed at its deadline · STILL_VALID → Exit: deadline passed, unchanged
```

**Problems found:**
- Four channels on one message card with no node anywhere that picks between them — the corpus's
  worst single case (J, matrix row; K §1 inventory).
- SMS and WhatsApp carry an identical `when`; nothing in this journey tests WhatsApp eligibility,
  so asserting it is the "high value ⇒ WhatsApp" rule the brief forbids (J).
- Push is asserted with no push audience established anywhere — an obligation holder may not be a
  product user at all (J).
- The loop has no visible bound: a reader sees `Reminder → Wait → Reminder` and cannot tell whether
  that is two messages or ten (D).
- Three of the five endings hand off to non-public journeys and render as grey text with no stated
  reason (D; K Family D open item).
- `STILL_VALID` reaches the canvas as a raw SCREAMING_SNAKE token on the `c.consequence → x.still-valid`
  edge (K P1-6).

**Final orchestration:** **event-or-timeout (looping)**, with a visible **conditional routing**
branch on *which threshold fired*. Event-or-timeout because one wait, bounded by a real attribute
(`due_at`), listens for both "it is done" and "a threshold arrived" and its timeout arm reaches
five genuinely different endings — this is the reference instance of the shape in the corpus and
nothing about it changes. Conditional routing inside it because the signal that changes the
channel already exists on the waking event: `pre_deadline_threshold_reached` carries which
threshold it is, and an early threshold is information while the last one before the deadline is a
deadline with a consequence `c.consequence` will actually enforce.

**Final customer channels:** `email` at every threshold except the last; `sms` at the final
pre-deadline threshold, where SMS permission is recorded. **WhatsApp and push are dropped.**

**Customer touch count:** **1 per policy-defined threshold.** The corpus is right that it cannot
state a number — the thresholds belong to the customer's governing policy — and
`deadline_tracking.touches` must stay `required: true` with no invented default.

**Final flow:**
```
Authoritative deadline assigned
 → [store the deadline and what would satisfy it]
 → Wait until obligation_satisfied | pre_deadline_threshold_reached   (bounded by the deadline)
     event → Which happened?
               Completed → Invalidate every queued reminder → Exit: satisfied before its deadline
               Threshold → Does policy define a reminder here, and can they still act on it?
                              No  → back to the wait
                              Yes ↓
                          → Which threshold fired?
                               The final pre-deadline threshold, SMS permission recorded
                                                              → Reminder (SMS)
                               Any earlier threshold          → Reminder (Email)
                          → back to the wait   [bounded by deadline_tracking.touches — policy]
     timeout → What does the governing rule say?
                OVERDUE / ESCALATED / EXPIRED / FAILED / STILL_VALID
```

**State re-checks:** The wait is the re-check. `obligation_satisfied` routes to `a.satisfied`,
which invalidates every queued reminder through its `suppressed_sends` write — the best
stop-condition implementation in the TIM cluster and the one TIM-274 is told to copy.

**Stop conditions:** `obligation_satisfied` at any point, taking every queued reminder and
escalation with it. The deadline itself, absolutely.

**Ownership / handoff:** Holds `obligation_reminder` **above** TIM-268 — a governing deadline
outranks a bare due date — stated from both sides, in both precedences, in TIM-61 `s.g5` and
TIM-268 `s.g7`, and in reciprocal `distinctFrom`. I records this pair as resolved five-fold; do
not reopen. Three handoffs out (TIM-62 OVERDUE, OWN-55 ESCALATED, TIM-64 EXPIRED), all non-public.
This journey must not speak about what happens *after* the deadline: the consequence belongs to
whichever of the three the rule names.

**Canonical changes needed:**
1. `src/canonical/time.ts` — split `a.remind` on the threshold. Add a condition after `c.useful`:
   *"Which threshold fired?"*, with `a.remind-final` (`channelRoles: ["urgent"]` → sms, `when`
   keeping the existing recorded-permission clause) and `a.remind` (`channelRoles: ["persistent"]`
   → email). Both edges return to `w.tracking`.
2. Remove `whatsapp` from `channelStrategy.roles[urgent]` for this journey, and remove
   `low-friction` from every touch's `channelRoles`. Nothing in the graph reads a WhatsApp
   eligibility or a push token.
3. Reverse the absorption of `a.satisfied` by declaring what it produces
   (`writes: [{ field: "suppressed_sends", mode: "set" }]` as the journey's declared suppression,
   not as a journal row) — invalidating every queued reminder is a visible consequence.
   `a.store` stays absorbed and is correct.
4. Keep `deadline_tracking.touches` `required: true` with no default.

**Display-only changes needed:** The loop edge back to `w.tracking` carries the cap key
`deadline_tracking.touches`, so a bounded loop does not read as an unbounded one. The
`c.consequence → x.still-valid` edge label renders the humanised outcome, not `STILL_VALID`.

**Renderer changes needed:** K §4.1 — a single-role plan renders its channel pill with no rank
label, and a multi-group plan never prints "Fallback" where `channelStrategy.fallback` is
`same-role-other-channel`. K's H1 widening (bare SCREAMING_SNAKE tokens, run over
`data-canvas-edge-label` as well as card bodies). A handoff card whose destination is not a public
route states why it is not a link (K Family D, P-HANDOFF-02).

---

## TIM-63 — Expiry Reminder

**Purpose:** Use the window before an expiry only where acting inside it could actually change the
outcome — and where it cannot, either say plainly what will happen or say nothing at all.

**Current flow:**
```
pre_expiry_window_entered
 → [re-read the entity's current state]  (absorbed)
 → Has it already been renewed, replaced or completed?   Already → Exit: nothing is expiring
 → Is an action available that would materially change the outcome?
      Yes → [establish who must act and what the action is] (absorbed)
             → Action prompt  [email · in-app · sms · push]
      No  → Is telling anyone useful even so?
                Worth saying → Informational notice  [EMAIL ONLY]
                Not worth it → Exit: nothing to do, nothing worth saying
 → Wait until renewed | completion_recorded | replaced   (timeout: expires_at)
      event   → [invalidate the old validity's queued actions] (absorbed)
                 → Handoff: external renewal-lifecycle
      timeout → Handoff: TIM-64 Expiry Validation
```

**Problems found:**
- The journey's best idea is invisible: `a.prompt-action` declares four channels and `a.inform`
  declares one *deliberately* (*"a prompt to act where acting is impossible is worse than
  silence"*), and on the canvas both are just "Message" cards (D).
- The four channels on the prompt are unresolved — no node reads a signal that picks between them,
  and the journey caps at one message, so there is no escalation for a second channel to be part of
  (J).
- No success exit: both endings are handoffs and the only exits are suppressions, so a reader sees
  a journey that never finishes (D).
- `a.actor` — the step that establishes *who is responsible for acting*, which may be an
  administrator or a third party with no product session at all — is absorbed although it is the
  fact that decides the whole message (D).
- TIM-63 is one of the eight public journeys TIM-268 defers to that say nothing back (I, P1-4).
- `w.resolution` renders `expires_at` as a raw attribute identifier (K P1-6).

**Final orchestration:** **conditional routing.** The decision the journey exists to make is *is
there an action, and if not is it worth saying anything* — three genuinely different outcomes from
one read. The single send and the event-or-timeout tail are subordinate: the message goes out
*before* the wait, and the wait carries no touch at all, existing only to decide which ending. That
unusual shape is correct — entering the window **is** the timing decision — and must not be
normalised into "wait then send".

**Final customer channels:** Prompt: **`email`**. Notice: **`email`**. Nothing else. `a.actor` may
establish a responsible party with no product session, which is exactly why in-app cannot be
asserted; and SMS would be justified only for an imminent one-tap action, which this journey never
establishes.

**Customer touch count:** **1** — a prompt to act *or* an informational notice, never both.

**Final flow:**
```
Pre-expiry window entered
 → Re-read: has it already been renewed, replaced or completed?
      Already resolved → Exit: nothing is expiring
 → Is an action available that would materially change the outcome?
      Yes → Who is responsible, and what is the action?
             → Prompt to act (Email): the action, the route to it, and the date
      No  → Is telling anyone useful even though nothing can be done?
             Worth saying → Informational notice (Email): what will happen, no call to action
             Not worth it → Exit: nothing to do, nothing worth saying
 → Wait until renewed | completion_recorded | replaced   (bounded by expires_at)
      event   → Invalidate the old validity's queued actions → Handoff: renewal lifecycle
      timeout → Handoff: TIM-64 Expiry Validation
```

**State re-checks:** `a.reread` + `c.already` at entry, and they are necessary — the window opened
on a schedule and the state may have moved since. `a.invalidate` on the success arm stops a renewal
granted today being undone by an expiry scheduled yesterday. One touch, so nothing further.

**Stop conditions:** `renewed`, `completion_recorded`, `replaced`; an entity already resolved when
the window is re-read; SUB-163 holding the renewal cycle.

**Ownership / handoff:** Below SUB-163 in `relationship-continuity` wherever the expiring entity is
a relationship with renewal terms (settled from both sides — do not reopen); owns every expiring
entity with no renewal cycle outright. Above TIM-268 by TIM-268's own declaration, currently
unreciprocated. Both endings are handoffs — this journey must not state what the renewal lifecycle
or TIM-64 will decide; it states only that the window opened and what could be done inside it.

**Canonical changes needed:**
1. `src/canonical/time.ts` — `a.prompt-action.channelRoles` → `["persistent"]`; drop `in-session`,
   `urgent` and `low-friction`. `a.inform` already correct.
2. `a.actor` declares the state it produces (`writes: [{ field: "responsible_actor", mode: "set" }]`)
   so the step that establishes who must act keeps its card. `a.reread` and `a.invalidate` stay
   absorbed — the question card and the handoff carry them.
3. **Reciprocity with TIM-268, per I's P1-4 mechanism** (not by joining `obligation-reminder` —
   TIM-63's `competition` block is spent on `relationship-continuity`, and I rules the group route
   out for all eight regardless):
   - `suppressions +=` `CANONICAL_RULE` id `s.generic-reminder`: *"This journey owns the reminder
     for the expiring entity it holds. The generic outstanding-obligation reminder (TIM-268) is
     suppressed for that entity while this instance holds it: one obligation is reminded of once,
     by whoever owns its type, and a generic reminder arriving after the specific one is not a
     later touch but a second sender."*
   - `distinctFrom +=` a row naming TIM-268, mirroring the row TIM-268 already carries, and
     recording that the reciprocity is `distinctFrom`-and-suppression only because a journey
     declares exactly one `competition` block.

**Display-only changes needed:** Both terminal handoff cards state "ends by handing off to …", so
a journey with no success exit does not read as a journey that never finishes (decision C2's
treatment). The `w.resolution` wait card shows its events and its bound in prose, not `expires_at`.

**Renderer changes needed:** K §4.1 (one role → no rank label). K's H1 widening for bare
snake_case identifiers on wait capsules and edge labels.

---

## TIM-268 — Action Required Reminder

**Purpose:** Remind somebody of what they owe while there is still time to do it, **from the state
the obligation is in at the moment of sending** — and only where no journey scoped to the
obligation's own type already owns that reminder.

**Current flow:**
```
customer_owed_obligation_outstanding
 → Is there a gap before the deadline worth waiting through?
      Due now or past → ↓
      Time remains    → Wait until obligation_no_longer_owed | obligation_changed_still_owed
                          (timeout: the reminder point — required)   BOTH ARMS → ↓
 → [Re-read the obligation from authoritative current state immediately before sending]
 → Is anything still owed at the moment of sending?
      Nothing outstanding → Exit: no longer owed; nothing was sent
      Still outstanding ↓
 → Reminder  [email · sms]
 → Wait until obligation_satisfied | obligation_no_longer_owed | deadline_passed_unmet
      (timeout: due_at — required)
      event   → How did it resolve?
                  Satisfied → Confirmation [email · sms] → Exit: satisfied and confirmed
                  Cancelled/adjusted away → Exit: moot
                  Still owed at the deadline → ↓
      timeout → Overdue notice [email · sms]
                → Does a defined consequence own this now?
                     Yes → Handoff: external consequence-owner
                     No  → Exit: lapsed unmet
```

**Problems found:**
- **`w.due` is not an event-or-timeout wait.** Both arms converge on `a.recheck`; the `until[]`
  events only wake it early and nothing about the route depends on which fired. It is a **timed
  wait with an early wake followed by a state re-read** — a good design that is being mis-named.
  *(Already arbitrated; applied.)*
- `deadline_passed_unmet` in `w.deadline.until` **is** the timeout at `due_at` by a second route,
  and both reach `a.overdue`; keeping it makes `c.settled`'s third branch reachable only
  redundantly (D).
- All three touches carry `["persistent","urgent"]`. A confirmation that an obligation is
  discharged is never urgent, and the overdue notice is sent *before* `c.escalate` establishes
  whether a consequence exists at all. The clearest case of SMS-as-generic-escalation in the TIM
  cluster (D), and J removes SMS from the reminder too: this is the lowest-precedence *generic*
  obligation reminder, addressed to somebody whose obligation type we do not know.
- `localCap` is 3, basis "the plan's own length"; the longest path is 2 — `c.settled` cannot reach
  both `a.confirm` and `a.overdue`, and `x.moot` sends nothing (D).
- **The generic-fallback rule is complete on TIM-268's side and has no counterparty.** Eligibility
  clause 3 names nine type-scoped owners; `s.g6`/`s.g7` state the rule; `distinctFrom` names ten
  journeys — and only TIM-61 is in its exclusion group (I, P1-4).
- **TIM-268 and FIN-134 share `obligation_id` and neither names the other** (I, P1-6). An unpaid
  amount past its due date with no attempt yet made is TIM-268's; the same obligation after a
  declined attempt is FIN-134's. The boundary is real, obvious and written nowhere.
- The trigger renders as "Customer owed obligation outstanding" (K P2-9).

**Final orchestration:** **event-or-timeout**, at `w.deadline` — the arms reach genuinely different
places (a confirmation, a moot exit, an overdue notice). Explicitly **not sequential**: the
reminder and the confirmation/overdue notice are two different facts about one obligation, and
`s.g3` forbids repetition. The `w.due` leg ahead of it is a timed wait with a state re-read, which
is its own shape and is named as such.

**Final customer channels:** `email` on all three touches. **No SMS anywhere.** By its own ownership
rule every obligation with a real type is owned by a journey that can justify a sharper channel
(TIM-61 for a governed deadline, SCH-303 for a reservation, FIN-134 for money); what is left here
is "you still owe X by Y, here is the one way to do it" to somebody whose obligation type is
unknown.

**Customer touch count:** **2** — the reminder, then the confirmation *or* the overdue notice.
`x.moot` is a zero-touch ending and stays one.

**Final flow:**
```
Customer owes a defined action, with a due date, that nothing more specific owns
 → Is there a gap before the reminder point worth waiting through?
      Due now or past → ↓
      Time remains    → Wait until the reminder point (waking early on any change to the obligation)
 → Re-read the obligation: what is owed NOW, what has been received, what the deadline is now
 → Is anything still owed?
      No  → Exit: no longer owed; nothing was sent
      Yes → Reminder (Email): what REMAINS outstanding, the deadline, the one way to discharge it
 → Wait until obligation_satisfied | obligation_no_longer_owed   (bounded by due_at)
      event   → Satisfied → Confirmation (Email) → Exit: satisfied and confirmed
                 Cancelled or adjusted away → Exit: moot
      timeout → Overdue notice (Email): what stands now, and what policy actually attaches
                → Does a defined consequence own this now?
                     Yes → Handoff: consequence owner (carries what remains, and every reminder sent)
                     No  → Exit: lapsed unmet
```

**State re-checks:** `a.recheck`, immediately before the send, every time — the journey's entire
thesis and the reason it is safe for it to be generic. It survives Family A on two in-edges and
must stay drawn. It is also the pattern TIM-274 is missing and is told to copy.

**Stop conditions:** `obligation_satisfied` and `obligation_no_longer_owed`, at both waits. Plus any
type-scoped journey taking ownership of the obligation, which is what the eligibility clause and
`s.g6`/`s.g7` enforce — and which, after the reciprocity fix, the other side finally enforces too.

**Ownership / handoff:** Lowest in `obligation-reminder`; `onLoss: suppressed` rather than queued,
because a reminder arriving after the specific one is not a later touch but a second sender. Hands
to `external:consequence-owner` carrying what remains outstanding **and which reminders were
sent** — the right thing to carry; do not trim it. This journey must not name the consequence
itself: `c.escalate` establishes only whether one is owned elsewhere.

**Canonical changes needed:**
1. `outstanding_obligation.touches` default **3 → 2**, rule: *"one reminder before the deadline and
   one notice after it; the two post-deadline notices are mutually exclusive."* Rewrite the
   `applicableWhen` to name the longest path, copying TIM-274's wording.
2. `t1 remind`, `t2 confirm`, `t3 overdue` → `channelRoles: ["persistent"]`. Remove `urgent` from
   all three.
3. Remove `deadline_passed_unmet` from `w.deadline.until`, and remove `c.settled`'s now-redundant
   "Still owed at the deadline" branch. The timeout at `due_at` is that event.
4. Reclassify `w.due` in the orchestration record as a **timed wait with a state re-read**, not
   event-or-timeout.
5. **Reciprocity, per I's P1-4 — the mechanism is a suppression plus a `distinctFrom` row on each
   of the eight, NOT enrolment in `obligation-reminder`.** *(Arbitration: the TIM domain audit
   proposed adding DOC-215, REL-284, ACC-263, RLT-279, ACT-13 and FBK-49 to the group at scope
   `communication-purpose`. I is binding on competition groups and rules that out under
   GLB-01/GLB-03 — their lifecycles are unrelated, and a group added to make a suppression
   convenient is how unrelated lifecycles start blocking each other. The domain audit's reading
   that six of them "can" join is correct on the schema and wrong on the rule.)* The five in this
   part carry their clause in their own sections (TIM-63, ACC-263, DOC-215, REL-284, RLT-279);
   SCH-266, ACT-13 and FBK-49 belong to other parts.
6. **P1-6 · the FIN-134 boundary.** `distinctFrom +=` `{ journey: "FIN-134", because: "FIN-134 opens
   only where a payment system states that an attempt against the obligation actually failed, and
   it owns what is said about the obligation from that moment. This journey is the sending for an
   obligation that is merely outstanding — owed, due, and not yet attempted. Where a recorded
   failure exists, that journey holds the obligation and this one is suppressed for it." }`, and
   name FIN-134 among the type-specific owners in `s.g6`.

**Display-only changes needed:** `w.due` + `a.recheck` read as one unit — *"Wait until the reminder
point, then re-read what is owed"* — the same treatment Family B gives a wait and its follower
condition. Today they are two cards joined by a one-hop connector. The trigger card reads as an
event, not as "Customer owed obligation outstanding".

**Renderer changes needed:** K §4.1. K P2-9 — the trigger card drops the `SignalSource` provenance
row and humanises the event into something that reads as a thing that happened. Not proposed: a
Family B extension that would fold a wait into a *sole-successor action*; `a.recheck` writes
nothing and has two in-edges, so the existing detector cannot see it, and inventing a rule for a
single site would fail the generic-only constraint.

---

## TIM-274 — Grace Period Recovery

**Purpose:** Make grace a state the holder is in **knowingly** — what stopped, what still works,
when the window ends, and the one route back.

**Current flow:**
```
grace_period_started
 → Does grace restrict anything the holder will actually notice?
      Function reduced     → Grace notice: what stopped, what still works, the end date, the route back
      Continuity unchanged → Quiet notice: validity lapsed, nothing has changed yet, and the date it will
 → Wait until recovery_condition_satisfied | entity_terminated
      (timeout: grace_period.grace — the last point at which one more message can still be acted on)
      event   → What ended the wait?
                  Recovered   → Confirmation → Exit: recovered inside the window
                  Ended early → Exit: grace ended by termination
      timeout → Last call: the exact end date, what stops at it, the same single route
 → Wait until recovery_condition_satisfied   (timeout: grace_deadline_at)
      event   → (back to "What ended the wait?")
      timeout → Loss notice → Exit: window closed unrecovered
```

**Problems found:**
- **`w.final.until` lists only `recovery_condition_satisfied`.** `w.grace` listens for
  `recovery_condition_satisfied` **and** `entity_terminated`; `w.final` dropped the second. An
  entity terminated during the last leg therefore times out and receives `a.lost` — *"your window
  has closed, here is what you have lost"* — about a thing that was already cancelled. **The
  sharpest bug in the TIM cluster**, and the same class as the RET-30 `cancellation_confirmed`
  defect that was fixed as a P0.
- **Consequently `c.outcome`'s "Ended early → x.moot" branch is unreachable from `w.final`.** It
  exists only for `w.grace` today and becomes reachable the moment the fix above lands.
- **No state re-read before `a.last-call` or `a.lost`.** Both fire on a timeout and both are sent
  blind — the two most consequential messages in the cluster.
- All five touches carry `["persistent","urgent"]`, including `a.notify-quiet`, whose entire
  content is *"nothing has changed yet"*, and the recovery confirmation. That devalues the one
  message here that genuinely earns SMS.
- The corpus's touch counter reads `orchestration.touches.length` and reports **5**; the longest
  path is **3**. `a.notify-restricted`/`a.notify-quiet` are exclusive arms, as are
  `a.confirm`/`a.lost`.
- `c.restricted` forks into two message cards carrying an identical channel block, so the canvas
  repeats the channel pair twice and clamps the only thing that differs — what the message says
  (K P2-10).

**Final orchestration:** **combination** — conditional (does grace actually bite?) → sequential
across a fixed window → event-or-timeout at both bounds. This is a genuine composite and J's own
justification stands: the three touches are three different facts about one window — it has opened,
it is about to close, it closed or was recovered — not one message repeated. Inside it,
**`a.last-call` is a parallel send**: the email carries what stops, what survives and the recovery
route; the SMS carries the date and that this is the last chance. Neither substitutes for the
other.

**Final customer channels:** `a.notify-restricted` → `email`. `a.notify-quiet` → `email`.
`a.confirm` → `email`. **`a.last-call` → `email` and `sms`, once, together.** `a.lost` → `email`.
The grace notice keeps email alone because `s.g2` makes *"what still works"* mandatory and that is
the part that will not fit in an SMS.

**Customer touch count:** **3** on the longest path — two asks and one statement of the outcome.
Of the three only two are asks; `s.g5` is right that both the confirmation and the loss notice must
be sent (*"silence after a recovery and silence after an expiry are indistinguishable to the person
living in the window"*). No touch is removed and the 4th-touch justification does not arise.

**Final flow:**
```
Grace period started (authoritatively recorded, fixed end, recorded recovery condition)
 → Does grace restrict anything the holder will actually notice?
      Function reduced     → Grace notice (Email): what stopped, what still works, the end date, the route back
      Continuity unchanged → Quiet notice (Email): validity lapsed, nothing has changed yet, and when it will
 → Wait until recovery_condition_satisfied | entity_terminated   (to the last actionable point)
      event   → What ended the wait?
                  Recovered   → Confirmation (Email): which reduced capabilities came back
                                 → Exit: recovered inside the window
                  Ended early → Exit: grace ended by termination
      timeout → Re-read: is the window still open, is the entity still in grace, has the end moved?
                  Still in grace → Last call (Email AND SMS, together): the exact end date,
                                    what stops at it, the one route back
                  Otherwise      → (join "What ended the wait?")
 → Wait until recovery_condition_satisfied | entity_terminated   (to grace_deadline_at)
      event   → (join "What ended the wait?")
      timeout → Re-read, then Loss notice (Email): what is gone, and whether a route exists on
                 other terms → Exit: window closed unrecovered
```

**State re-checks:** Two new ones — `a.recheck-grace` before the last call, and the same node reused
before the loss notice. Both must write real state (the re-read grace record) so Family A does not
absorb them. The waits already re-read on their event arms.

**Stop conditions:** `recovery_condition_satisfied` and `entity_terminated`, **at both waits**;
ACC-261 recording a restriction, which supersedes this journey outright.

**Ownership / handoff:** `access-consequence-narration` with ACC-261, `onLoss: superseded` — below
the restriction notice, above FIN-134, *whose messaging ends where the grace state begins*. TIM-281
is excluded by eligibility on both sides. `distinctFrom` names TIM-65, FIN-134, ACC-261 and
TIM-281; I records this as the corpus's cleanest statement of a narration chain and TIM-274 `s.g6`
(*"One narrator per state, in order"*) as the only honest statement of the whole FIN-134 → grace →
restriction ordering. **Zero handoff nodes, and that is correct**: this journey narrates a state
TIM-65 owns and hands nothing on. It must not restate the payment obligation FIN-134 handed over,
and it must not speak once ACC-261 stands. Do not reopen.

**Canonical changes needed:**
1. **P0-equivalent.** Add `entity_terminated` to `w.final.until`. One event id; it removes a message
   sent to somebody whose entity was already cancelled and makes `c.outcome`'s second branch
   reachable from both waits.
2. Add `a.recheck-grace` between `w.grace`'s timeout arm and `a.last-call`, and reuse it between
   `w.final`'s timeout arm and `a.lost`. Same shape as `TIM-268.a.recheck`, with a real `writes`
   entry.
3. Channel roles: `t1 notify-restricted` → `["persistent"]`; `t2 notify-quiet` → `["persistent"]`;
   `t3 confirm` → `["persistent"]`; `t4 last-call` → `["persistent","urgent"]` with
   `channelStrategy.simultaneous: { allowed: true, reason: "the email carries what stops, what
   survives and the route back; the SMS carries the date and that this is the last chance. Neither
   substitutes for the other and the window closes once." }`; `t5 lost` → `["persistent"]`.
4. Keep `grace_period.touches` at 3 and keep its `applicableWhen` wording verbatim — it is the only
   cap in the cluster that names the longest path rather than the plan's length, and TIM-268's is
   being rewritten to match it.

**Display-only changes needed:** none. 13 canonical, 13 drawn, nothing absorbed, nothing shared —
this journey renders exactly as authored, which is why its bugs are legible.

**Renderer changes needed:** K §4.1, including the `simultaneous` case — two channels on one row as
a parallel send, never a ranked ladder. K P2-10 — where a decision forks into two message cards
with an identical channel block, the card gives its prominent space to what differs (the message)
rather than to what is the same (the channel).

---

## TIM-281 — Expired Access Recovery

**Purpose:** Give somebody who has come back to something that expired the **one** route that
actually restores it, at the moment they are asking — because naming the wrong route spends the
only intent this ever gets.

**Current flow:**
```
holder_acted_on_expired_entity
 → [establish what the expiry actually did: suspended, invalidated, ended the relationship] (absorbed)
 → Which mechanism restores validity here?
      Renewal         → "Here is the renewal, what it costs, and what carries across the gap"
      Requalification → "This is not a renewal; these conditions have to be met again"
      Replacement only→ "The old one stays expired; a new one is issued, and here is what differs"
      No route back   → "There is no way back to this one; here is what exists instead" → Exit: terminal
 → Wait until validity_restored | recovery_attempt_abandoned   (response window, required)
      timeout → Exit: still expired; the route was offered and not taken
      event   → Did validity come back?
                  Valid again → Confirmation: what is valid now, and that a replacement is a NEW object
                                 → Exit: valid again by the route that was named
                  Abandoned   → Exit: still expired
```

**Problems found:**
- **`a.establish` is absorbed** although `s.g1` makes it the journey's thesis: *"the route is worked
  out before anything is said. One wrong route spends an intent that arrived willing."* It writes
  nothing, so Family A hides it.
- The four route statements each declare `email + in_app` with no node reading anything that picks
  between them — yet the signal is already in the instance key. `attempt_id` is half of
  `entity_ref + attempt_id`, so the surface the attempt arrived on is already held.
- `competition: "none"` reads as "there is no contest" while TIM-274 names TIM-281 in
  `distinctFrom` and both carry eligibility clauses excluding each other.
- Nothing else. The cap, the wait, the bypass on the dead-end branch and both endings are right as
  authored.

**Final orchestration:** **conditional routing (four-way).** Four messages that differ in substance,
not in tone, and choosing among them is the whole job — the reference case in this part for "the
split genuinely changes what is said". The route decision *also* now picks the channel, from the
same read. The single send and the event-or-timeout tail sit beneath it; `a.no-route` correctly
bypasses the wait entirely because there is nothing to wait for.

**Final customer channels:** **the surface the attempt was made on** — `in_app` where the holder
acted in the product, `email` otherwise; the confirmation is `email`. **No SMS, no push:** the
holder is already in front of us, at a moment of their own choosing, having just acted. There is no
deadline being raced and no consequence they have not already met.

**Customer touch count:** **2** — one route statement, one confirmation. Five communication nodes,
longest path two; the cap is already 2.

**Final flow:**
```
Holder acted on an expired entity
 → Establish what the expiry actually did (suspended · invalidated · relationship ended)
 → Which mechanism restores validity here?   [answer delivered on the surface the attempt arrived on]
      Renewal          → Renewal route: what it costs, what carries across the gap
      Requalification  → Not a renewal: the conditions that must be met again, listed
      Replacement only → The old one stays expired; a new one is issued, and what differs
      No route back    → There is no way back to this one; here is what exists instead
                          → Exit: no route back (terminal)
 → Wait until validity_restored | recovery_attempt_abandoned   (response window)
      timeout → Exit: still expired; the route was offered and not taken
      event   → Did validity come back?
                  Valid again → Confirmation (Email): what is valid now, and whether it is a new
                                 object or the old one revived → Exit: valid again
                  Abandoned   → Exit: still expired
```

**State re-checks:** `a.establish` reads what the expiry actually did before any route is named —
this *is* the re-check, and it should be visible. `c.outcome` re-reads whether validity actually
came back before confirming.

**Stop conditions:** `validity_restored`; `recovery_attempt_abandoned`; an open grace period on the
entity, which hands the holder to TIM-274 for the length of the window.

**Ownership / handoff:** No handoffs, correctly — TIM-69 decides the mechanism and issues any
replacement; this journey carries the holder along whichever route that decision names, and must
not promise a decision it does not own. **I records `competition: "none"` as right**: TIM-281 is
gated by state, not by contest, and `s.g5` says so (*"An open grace period owns the holder. This
journey starts only once grace has closed at its recorded end, or where no grace period was granted
at all"*), with TIM-274 stating it back in `distinctFrom`. *(Arbitration: the domain audit proposed
replacing `"none"` with a statement of the contest, or failing that joining
`access-consequence-narration` below TIM-274. I is binding on competition and explicitly lists
TIM-281 under "checked and found correct". `"none"` stays; the eligibility clauses on both sides
are the enforcement.)*

**Canonical changes needed:**
1. `a.establish` declares the state it produces (`writes: [{ field: "expiry_effect", mode: "set" }]`)
   so the step the journey exists to insist on keeps its card.
2. Per-route channel selection read from the attempt: `a.renew`, `a.requalify`, `a.replace` and
   `a.no-route` each `channelRoles: ["in-session","persistent"]` with the `in-session` role's
   `when` naming the attempt surface (*"the attempt recorded on `attempt_id` arrived in the
   product"*) and `persistent` carrying every other case. `a.confirm` → `["persistent"]`.
3. `competition: "none"` stays. No change.

**Display-only changes needed:** none.

**Renderer changes needed:** K §4.1 — with a real routing signal declared on the role's `when`, the
card must render a *choice* ("whichever applies"), never a Primary/Fallback hierarchy.

---

## ACC-261 — Access Restriction Notice

**Purpose:** Tell the account holder what access is going away, when, and the one condition that
brings it back, so a restriction is a decision they can act on rather than a discovery they make.

**Current flow:**
```
Access restriction or end recorded
 → Can the holder do anything about this?
      Resolvable by them → Is there a permitted route to them?
                               Reachable   → Notify (Email/In-app)
                               Unreachable → Handoff: Contactability Recalculation (CON-36)
      Not theirs to resolve → Inform only (Email/In-app) → Exit: informed     [DEAD-ENDS]
      Placed by a security response → Exit: announced by the security response
 → Notify → Wait: release_condition_met | restriction_lifted | restriction_made_permanent,
            timeout at resolution_deadline_at   (both arms → one condition)
 → Where did it land?
      Restored         → Confirm (Email/In-app) → Exit: restored and confirmed
      Still restricted → Exit: restriction stands past its deadline
```

**Problems found:**
- **The journey breaks its own guardrail on one of its two arms.** `s.g4`: *"Restoration is
  confirmed explicitly. Silence after a resolved restriction reads as the restriction
  continuing."* The `Not theirs to resolve` arm runs `a.inform-only → x.informed` and stops. A
  person told *"your access is restricted, there is nothing you can do"* is never told when it is
  lifted — the one case where they have no way of finding out for themselves. **The substantive
  defect in the journey.**
- **`restriction_made_permanent` is waited for and has no arm.** `c.outcome` has two branches, both
  false for it; routed to `x.stands` anyway, the holder is told their deadline passed and
  `x.stands`'s own `reEntry` becomes a promise that cannot be kept.
- **The reachability gate is on one arm only.** `c.reachable` guards `a.notify` and not
  `a.inform-only`, though both send.
- The wait card prints `release_condition_met`'s registry meaning, which is written for a
  *suppression*, so the card reads *"Until the condition recorded to release the suppression is
  met."* It also drops two of the three `until` arms.
- **Declared vs actual mismatch.** `localCap { value: 2, appliesTo: "all" }` and all three touches
  `mandatory: false`, while `s.g4` makes the restoration confirmation an obligation and `s.g2`
  makes the notice one. The journey behaves as though two touches cannot be withheld and declares
  that both can be rationed.
- In-app is declared on both sends. You cannot reliably deliver a notice about restricted access
  *inside the thing being restricted*.

**Final orchestration:** **conditional routing**, resolved by an event-or-timeout wait. Two routing
decisions genuinely change what the person receives — does the security response already own this
message, and can the holder act — and then one wait ends on the restriction's own resolution *or*
its stated deadline. Not a sequence, not a fallback, no escalation: a restriction is one statement
and one outcome.

**Final customer channels:** **`email` only, on all three touches.** Email is the only surface a
restriction does not touch; somebody locked out of the product will not see an in-app notice, and
this is load-bearing precisely on the arm where the message names what still works, the deadline
and the single condition that lifts it. No SMS: the urgency is a deadline measured in days that is
written *in* the message, not a one-bit action, and the message has to be kept.

**Customer touch count:** **2** — the notice, and the outcome. Both arms of the actionable split
carry the same budget.

**Final flow:**
```
Access restriction or end recorded
 → Is there a permitted route to them?
      Unreachable → Handoff: Contactability Recalculation (CON-36)
 → Can the holder do anything about this?
      Placed by a security response → Exit: announced by the security response (IDN-271 owns it)
      Resolvable by them   → Notice (Email): what is restricted · what still works · the deadline ·
                              the one condition that lifts it
      Not theirs to resolve→ Notice (Email): what is restricted · what still works · who is
                              deciding · no call to action
 → Wait: until released, lifted or made permanent — or the stated deadline
 → Where did it land?
      Restored       → Confirmation (Email): what was restored → Exit: restored and confirmed
      Made permanent → Exit: restriction is now permanent; the holder was told
      Deadline passed→ Exit: restriction stands past its deadline
```

**State re-checks:** One, already authored and correct: `w.resolve.recheck` re-reads the account and
the restriction from the system of record before acting on the timeout. Nothing is sent against a
stale restriction.

**Stop conditions:** `restriction_lifted` ends the wait and routes to the confirmation, never to
silence. `restriction_made_permanent` ends it at its own exit. `x.security-owned` stops the journey
before any send where IDN-271 already owns the message.

**Ownership / handoff:** Highest in `access-consequence-narration` (scope `account`): from the
moment the restriction stands, this journey owns what the holder is told and the recovery journeys
that ran ahead of it — TIM-274 among them — stop. Stated from both sides; do not reopen. ACC-78
decides and records the restriction; this journey only narrates it. One handoff out, to CON-36
(non-public). **This is the public tail of the FIN-134 chain** (FIN-134 → `h.restrict` → ACC-78 →
the restriction narrated here) and neither end says so on the page. This journey must not restate
the payment obligation or the release deadline that produced the restriction — those belong to
FIN-134 and to TIM-274 respectively. *(I also records that ACC-261 defers to IDN-271 by name while
IDN-271 does not name it back; the reciprocal row is written in IDN-271's section.)*

**Canonical changes needed:**
1. **P0.** Route `a.inform-only` into `w.resolve` instead of `x.informed`; delete `x.informed`. Both
   message arms converge on the same wait and the same outcome condition, so the
   not-theirs-to-resolve case now ends at `x.restored` / `x.permanent` / `x.stands` like the other.
   This is what `s.g4` already requires.
2. **P1.** Move `c.reachable` to sit directly after `t.restricted`, ahead of `c.actionable`, so one
   gate covers both sends. Net node count unchanged.
3. **P1.** Add a third branch to `c.outcome` — *"the restriction was made permanent; the release
   condition no longer applies"* → new exit `x.permanent`, class `failure`, `reEntry`: *"a later
   review that converts the restriction back into a bounded one is a new instance"*.
4. **P1.** Mark `t2` (`a.notify`) and `t3` (`a.confirm`) `mandatory: true`, set
   `localCap.appliesTo: "non-mandatory"` and `localCap.default.value: 0` with the corpus's own
   honest basis (*"every touch in the plan is marked mandatory"*). Leave `defaultPriority` and
   `pressureClass` at `service`.
5. **P1.** `channelRoles` on all three touches → `["persistent"]`. Drop `in-session`.
6. **P2.** Add a journey-appropriate wait event — `restriction_release_condition_met`, via
   `scripts/event-curation.json` then `node scripts/build-event-registry.mjs` — rather than
   rewording `release_condition_met`'s registry meaning, which is consumed elsewhere.

Node count: 13 → 13 canonical (one exit removed, one added, one condition reordered, one branch
added).

**Display-only changes needed:** The `Not theirs to resolve` arm must show its message and then the
shared wait, so a reader can see that both arms end in a stated outcome. `x.security-owned` must
stay drawn — it is the visible IDN-271 boundary and the only place a reader learns why some
restrictions produce no notice. `c.reachable` must stay drawn: K §2.3 lists it as one of exactly
two permission gates in the corpus that genuinely change the visible route, because its short arm
moves ownership to another journey.

**Renderer changes needed:** K §4.1. K's wait-card rule — a wait renders its events **and** its
bound (`Until released, lifted or made permanent · or the stated deadline`), never one arm of
three, and never the registry `meaning` where the wait carries its own `duration.rule`.

---

## ACC-263 — Activation Reminder

**Purpose:** Get somebody to use what they have been granted before the window to claim it closes,
because an unredeemed entitlement is indistinguishable from one that was never granted.

**Current flow:**
```
Entitlement provisioned and reachable
 → Is this the holder's first entitlement of this kind?
      First time       → Ready  (Email/In-app)
      Already familiar → Brief  (Email/In-app)
 → Wait: capability_first_used | entitlement_revoked_or_replaced,
         timeout at activation_window_ends_at
      event   → What ended the wait?  Used → Exit activated · Withdrawn → Exit moot
      timeout → Is there still time to claim it?
                   Time remains  → Remind (Email/In-app)
                                   → Wait: capability_first_used, timeout at activation_window_ends_at
                                     → Exit activated / Exit lapsed
                   Window closed → Exit lapsed
```

**Problems found:**
- **The reminder can never fire.** `w.first-use.timeout` is attribute-bound to
  `activation_window_ends_at` — it fires *at the end of the window* — while `c.remind`'s "Time
  remains" branch requires *"the window has a meaningful period left"*, which is false by
  construction at that instant. The wait's own `duration.rule` says the opposite of what the
  timeout does. `w.last-chance` is bound to the **same** attribute, so the second wait has zero
  length. As authored, this journey sends one message and lapses; **the entire reminder half is
  dead.**
- **The second wait violates `s.g3`** (*"Lapsed-unclaimed and revoked-before-use are recorded as
  different outcomes"*): `w.last-chance` waits only on `capability_first_used`, so an entitlement
  revoked after the reminder lands on `x.lapsed` — the holder recorded as having failed to claim
  something we withdrew.
- `c.first-time` forks into two message cards with an identical channel block, so the canvas repeats
  the channel pair and clamps the only difference (K P2-10) — and the split should in fact change
  the channel.
- ACC-263 is one of the eight public journeys TIM-268 defers to that say nothing back (I, P1-4).

**Final orchestration:** **segment-based**, resolved by an event-or-timeout wait with one gated
reminder. The segment is real and its signal is authored — `c.first-time` reads the holder's prior
use of this capability class, which `s.g2` already asserts is knowable — and it is the rare case
where a segment legitimately changes the **channel** as well as the copy. No orchestration is
added; everything else here is repair.

**Final customer channels:** `a.ready` (first grant) → **`email`**: a first grant needs explaining,
and the holder has no habit of looking for it in the product yet, so it has to be brought to them.
`a.brief` (already familiar) → **`in_app`**: a holder who already uses this capability is a product
user and needs only the delta, which belongs where the capability lives. `a.remind` → **`email`**:
the reminder exists *because* the holder did not come back on their own, so the in-product surface
has already failed to reach them. No SMS, no push — an activation window is measured in days or
weeks and the message names one action.

**Customer touch count:** **2** — the grant notice (one of two variants), and at most one reminder.
`s.g1` (*"One reminder, never two. The window is the pressure; repetition is not."*) is correct and
kept.

**Final flow:**
```
Entitlement provisioned and reachable
 → Has the holder used this capability before?
      No  → Ready (Email): what this is, what it lets you do, the one first action
      Yes → Brief (In-app): what changed from what you already had
 → Wait: until first use or withdrawal — or the REMINDER POINT (a lead before the window closes)
      first use / withdrawn → What ended the wait?
              Used      → Exit: activated
              Withdrawn → Exit: entitlement withdrawn before use
      reminder point → Is there still time to claim it?
              Time remains  → Reminder (Email): the deadline and the same one action
              Window closed → Exit: lapsed unclaimed
 → Wait: until first use or withdrawal — or the window closes
      → What ended the wait?   (the same condition, reused)
              Used      → Exit: activated
              Withdrawn → Exit: entitlement withdrawn before use
      window closed → Exit: lapsed unclaimed
```

**State re-checks:** Both waits already carry a `recheck` re-reading the entitlement and its window
from the system of record before acting on the timeout. That is what stops a reminder reaching
somebody who has already activated. Correct as authored; keep verbatim.

**Stop conditions:** `capability_first_used` at any point. `entitlement_revoked_or_replaced` at any
point — currently honoured only on the first wait, which is the C7 fix below.

**Ownership / handoff:** `competition: "none"`, no handoffs, and that is right: ACC-72 provisions
the capability, ACC-76 owns the credential lifecycle, and both are named in `distinctFrom`. Nothing
else speaks about this entitlement. The one addition is the TIM-268 reciprocity below. This journey
must not speak about the credential or the provisioning decision — only about claiming what is
already granted, which is also why it is not promotional.

**Canonical changes needed:**
1. **P0.** Give `w.first-use` its own timeout `Config` — `entitlement_activation.reminder_lead`,
   `required: true`, `class: "attribute-bound"`, relative to `activation_window_ends_at` with a
   lead, and a `rule` stating it is the reminder point rather than the window end. The window end
   stays on `w.last-chance`. Without this the journey's second half is unreachable.
2. **P1.** Add `entitlement_revoked_or_replaced` to `w.last-chance.untilEvent` and point
   `w.last-chance.onEvent` at the existing `c.used` instead of straight at `x.activated`. No new
   nodes — `c.used` already asks exactly the right question and already has both arms.
3. **P2.** Reword `c.remind` branch 0's `when` to *"the reminder point falls inside the window and
   no reminder has been sent for this issuance"* — it survives fix 1 as a genuine guard for an
   issued window shorter than the reminder lead.
4. `channelRoles`: `t1 ready` → `["persistent"]`, `t2 brief` → `["in-session"]`,
   `t3 remind` → `["persistent"]`.
5. **Reciprocity with TIM-268 (I, P1-4):** `suppressions +=` `CANONICAL_RULE` id
   `s.generic-reminder` with the standard text (*"This journey owns the reminder for the obligation
   it holds. The generic outstanding-obligation reminder (TIM-268) is suppressed for that
   obligation while this instance holds it…"*), plus a `distinctFrom` row naming TIM-268 mirroring
   the row TIM-268 already carries.
6. **No change to the declaration.** `service` / `service`, cap 2, `appliesTo: "all"`, all three
   touches `mandatory: false` is honest here and is affirmed as a reference: an entitlement nobody
   claimed is a loss, not a broken promise, and both touches can be withheld under pressure without
   the journey lying to anyone.

**Display-only changes needed:** Once fix 1 lands, the two waits must render with distinct bounds
(reminder point vs window close) rather than the identical string they produce today.

**Renderer changes needed:** K §4.1 and the wait-card rule (events plus bound, all arms). K P2-10 —
the two variant message cards now differ in channel as well as content, which is exactly the case
the card should be making visible.

---

## IDN-84 — Verification Recovery

**Purpose:** Route a failed verification by *why* it failed, and keep our own failures out of the
customer's verification record.

**Current flow:**
```
Verification attempt failed
 → (internal: classify the failure — absorbed)
 → What kind of failure was it?
      The person can correct it → Does the retry budget have room?
                                     Room  → Explain what to correct (In-app/Email)
                                             → Exit: bounded retry available
                                     Spent → Handoff: Decision Request (DEC-181)
      Ours, and transient       → Safe retry within the backoff budget?
                                     Retry      → (internal: retry with backoff — absorbed)
                                                  → Exit: bounded retry available     [SILENT]
                                     Persistent → Handoff: Ownership Escalation (OWN-55)
      Needs a person            → Handoff: Decision Request (DEC-181)
      Terminal by policy        → Cannot be verified on this basis (In-app/Email)
                                  → Exit: verification not possible on this basis
```

**Problems found:**
- **The "ours, and transient" arm sends the customer nothing, ever.** A person who just watched
  their verification fail because of *our* outage gets silence while we retry, and will resubmit
  perfectly good evidence. `s.g2` protects our record; nothing protects their experience.
- **`h.review` hands over with the customer told nothing.** Both `h.review` edges carry
  `suppresses: null` and a `carries` that does not say whether the holder has been contacted. It
  matters most on the `Budget spent` arm, where the person has been explained to once and now hits
  a wall with no further word.
- **`a.backoff` is hidden by the bookkeeping collapse and should not be.** It re-attempts a
  verification against a provider, but writes nothing, so `absorbableBookkeeping()` hides it and the
  reader sees `Safe retry available? --Retry--> Bounded retry available` with the retry invisible.
  Same false positive as FIN-134's `a.retry` — two journeys, so it is generic (K §3.2, §4.3).
- **The two touches declare identical roles and are not the same message**: one belongs in the flow
  the person is standing in, the other is a decision about their identity claim that they will need
  weeks later.
- `defaultPriority: "security"` over-claims a word IDN-271 uses correctly for a compromise incident;
  one of the four failure classes here is *our provider falling over*.
- `localCap { value: 1, appliesTo: "non-mandatory" }` with basis *"the graph's own touch count"* is
  vacuous — both touches are `mandatory: true`, and the graph's two communication actions are
  exclusive arms rather than a count.
- **No wait, and that is correct.** The brief flags IDN-84 as an event-or-timeout candidate; it is
  not. `insufficientAlone` names *"a verification that expired with no attempt made, which is
  IDN-81's expiry"*. A wait here would own the retry loop, which `s.g3` exists to prevent, and
  would duplicate IDN-81's timeout. The entity is `verification_instance_id` — **one failed
  attempt** — and a second failure fires the trigger again. Leave it synchronous.

**Final orchestration:** **conditional routing**, one touch per route. Four failure classes, four
different business responses, one message on each route that speaks to the customer; no sequence,
no wait, no fallback. This is one of the few journeys where `Trigger → Decision → Message → Exit`
per arm is genuinely the right answer.

**Final customer channels:** `a.explain` (correctable, retry available) → **`in_app`**: the person
just failed an attempt and the bounded retry is one screen away; explaining anywhere else guarantees
the retry happens later or not at all. `a.ours` (new, transient our-fault statement) → **`in_app`**,
same reason. `a.explain-terminal` → **`email`**: a terminal decision about an identity claim, plus
what basis *would* be accepted, which the person will refer back to when they go and get it. No
SMS — a verification failure gives the person something to *do* with evidence attached, not a
one-bit action.

**Customer touch count:** **1.** Exactly one of `a.explain` / `a.ours` / `a.explain-terminal` fires
per instance; the two handoff routes send nothing and pass ownership.

**Final flow:**
```
Verification attempt failed
 → What kind of failure was it?
      The person can correct it → Does the retry budget have room?
              Room  → Explain (In-app): exactly what to correct, and the bounded retry
                      → Exit: bounded retry available
              Spent → Handoff: Decision Request — carrying that the holder was explained to once
                      and has not been told the budget is spent
      Ours, and transient       → Safe retry within the backoff budget?
              Retry      → Internal: retry with backoff  (DRAWN)
                           → Statement (In-app): this failed on our side, nothing you sent was
                             rejected, we are retrying
                           → Exit: bounded retry available
              Persistent → Handoff: Ownership Escalation
      Needs a person            → Handoff: Decision Request — carrying that nothing has been said
                                  to the holder about this attempt
      Terminal by policy        → Decision (Email): this claim cannot be verified on this basis,
                                  and what basis would be accepted
                                  → Exit: verification not possible on this basis
```

**State re-checks:** none needed and none present — the journey resolves synchronously from the
failure record.

**Stop conditions:** none to add; there is no wait to stop. The journey's stop condition is its own
exit, and a subsequent attempt on the same claim opens a new instance.

**Ownership / handoff:** `competition: "none"` and, today, the only empty `distinctFrom` in the
access/identity/finance set. IDN-81 owns verification expiry; DEC-181 and OWN-55 own the two
escalations. This journey must not state what the human reviewer or the escalation owner will
decide — it states only what failed and what the holder may do next. Both handoffs must additionally
state what the holder has and has not been told, so the receiver knows whether it owes them a first
word.

**Canonical changes needed:**
1. **P1.** Add `a.ours` on the `c.technical-budget → Retry` arm: a single-channel in-app statement
   that the failure was ours, that nothing they submitted was rejected, and that it is being
   retried. Register it as touch `t3`, stage `explain`, `channelRoles: ["in-session"]`,
   `mandatory: true`. No new wait, no new decision.
2. **P1.** Extend both `h.review` handoffs' `carries`. On `c.retry-budget → Budget spent`: *"that
   the holder was explained to once and has not been told the budget is spent."* On
   `c.class → Needs a person`: *"that nothing has been said to the holder about this attempt."*
3. **P2.** `distinctFrom +=` IDN-81: *"IDN-81 owns a verification that expired with no attempt made.
   This journey owns one attempt that was made and failed; it never waits to see whether the holder
   retries, because the window is IDN-81's."* This is the sentence that makes the no-wait decision
   legible instead of looking like an omission.
4. **P2.** Per-touch channels: `a.explain` → `["in-session"]`, `a.ours` → `["in-session"]`,
   `a.explain-terminal` → `["persistent"]`. *(Arbitration: the domain audit proposed
   `["persistent","in-session"]` with `simultaneous` on the terminal touch. J is binding on final
   channels and gives it email alone — the retryable arm is in-flow, the terminal arm is a record,
   and that contrast is the whole of the split. No `simultaneous` here.)*
5. **P2.** `defaultPriority` `security` → `transactional`, keeping `pressureClass: "none"`; set
   `localCap.default.value: 0` with the honest basis *"every touch in the plan is marked
   mandatory"*.

**Display-only changes needed:** `a.backoff` must be drawn. The two DEC-181 handoff instances are
correctly drawn once per parent; keep.

**Renderer changes needed:** K §4.1. **K §4.3 — `absorbableBookkeeping` must read structure, not a
field name**: an internal action that writes *nothing* is not thereby bookkeeping, and an action may
only be absorbed if the card absorbing it can carry its meaning. `a.backoff` (here) and `a.retry`
(FIN-134) are the two sites that prove the rule; the `writes: []` case needs its own test. K §4.5's
**G8_ACTION_HIDDEN** gate is what stops this regressing.

---

## IDN-271 — Account Security Alert

**Purpose:** Ask the owner the one question that resolves a suspected compromise, on a route the
suspicion does not touch, while saying plainly whether anything has actually been restricted.

**Current flow:**
```
Compromise incident opened with scope determined
 → Is there a destination the signal does not implicate?
      Every route implicated → Exit: no destination outside the suspicion; no alert sent
      Clean route → Has anything actually been restricted?
            Containment applied → Alert: what was restricted, why, and that confirming the
                                   activity resolves it   (Email + SMS, simultaneous)
            Nothing restricted  → Alert: was this you? nothing has been restricted
                                   (Email + SMS, simultaneous)
 → Wait: activity_confirmed_own | activity_reported_not_own | security_review_concluded,
         timeout at the incident's review point
      event   → What did the answer establish?
            Theirs     → Cleared, and what was lifted → Exit: cleared
            Not theirs → Handoff: Account Recovery Verification (IDN-88)
      timeout → The incident is open past its review point, and what remains restricted
                → Exit: incident open past its review point
```

**Problems found:** *(all of them display, declaration, or one clause of copy — the canonical graph
is right)*
- **The page contradicts the journey's own safety rule.** `s.multi-destination`: *"The alert goes to
  every verified, unimplicated destination at once; a single destination that may itself be
  compromised is never the only one told."* The card says `Primary Email / Fallback SMS` — SMS only
  if email fails, which is exactly the single-destination behaviour the rule forbids. This is the
  most damaging instance of the corpus-wide fallback artifact, because here the wrong reading is a
  security claim.
- **`simultaneous` is declared, typed and read by nothing.** It exists in `types.ts`, is set in
  exactly one place in the corpus — this journey — and `grep -rn simultaneous src/lib src/components`
  returns nothing. The library's only genuine parallel send renders as a fallback ladder.
- **The wait card drops the arm that matters**, rendering *"Until the owner confirms the activity was
  theirs"* and losing `activity_reported_not_own` and the review point.
- **`c.route` is one refactor away from being erased.** It is structurally identical to a generic
  deliverability gate — a binary condition whose short arm is a `no-action` exit — and survives
  `collapsibleGates()` today only because the rule additionally requires the short arm to pass
  through a bookkeeping hop. It must never be collapsed: *"is this destination implicated by the
  suspicion?"* is the single most important business decision in the corpus.
- **Copy divergence between the touch and the node.** `t-standing`'s purpose ends *"nothing further
  is assumed from their silence"*; `a.standing` says *"nothing further is required from them"*. The
  touch's version matches the wait's own rule that silence is never read as confirmation; the
  node's is weaker and, on a still-open incident, arguably untrue.
- `c.contained` forks into two message cards with an identical channel block (K P2-10) — correctly,
  here: the fan-out is the same and only the content differs, which is exactly what the card should
  be showing.

**Final orchestration:** **parallel**, then event-or-timeout. Both halves are already authored
correctly. The parallel is justified by `simultaneous.reason` and `s.multi-destination`; the
event-or-timeout is justified by `s.owner-informed-past-review`, which turns the timeout arm into a
real message rather than a silent expiry. **This is the reference implementation of both shapes in
the corpus.**

**Final customer channels:** **`email` and `sms` together**, to every verified destination the
signal does not implicate — on the alert, on the all-clear and on the still-open notice. Not a
ladder. Three things are true at once and all three are needed: the question is **one bit** ("was
this you?"), the account **may be compromised right now**, and **email itself may be the compromised
destination**. That last one is what makes this parallel rather than a choice — the point is not to
reach the fastest channel but to make sure at least one destination the attacker does not hold is
told. An all-clear has to reach everywhere the alarm did.

**Customer touch count:** **2** — the alert, and the resolution (cleared, or still standing). Both
mandatory; `localCap.default.value: 0` with the basis *"every touch in the plan is marked
mandatory"*. Exemplary and unchanged.

**Final flow:** As authored. The only differences are on the page: the alert cards show a parallel
send, and the wait card shows all three events plus the review point.

**State re-checks:** `w.verify.recheck` re-reads the incident — the owner's answer if any, the
security review's state, and what remains restricted — before acting on the timeout. That is why
`a.standing` can name what is *still* restricted rather than repeating the original alert.

**Stop conditions:** any of `activity_confirmed_own`, `activity_reported_not_own`,
`security_review_concluded`. `x.withheld` stops before any send where every route is implicated —
the alert is withheld rather than sent to the attacker.

**Ownership / handoff:** `competition: "none"` and that is right — a compromise incident contests
with nothing, and `s.hard-gates-only` states the exemption explicitly. One handoff, to IDN-88 on a
confirmed compromise; IDN-90 owns scope and containment, IDN-88 owns rebuilding control, both named
in `distinctFrom`. Correctly no handoff on `x.withheld`: the journey that would be told is the one
that started this. **ACC-261 defers to this journey by name and IDN-271 does not name it back** (I,
one-sided row) — the reciprocal row is added below. This journey must not state what containment
IDN-90 applied beyond what is already recorded, and must not promise a restoration IDN-88 owns.

**Canonical changes needed:**
1. **P2, copy only.** Align `a.standing`'s text with its touch: *"…and that nothing further is
   assumed from their silence"*.
2. **P3.** `distinctFrom +=` ACC-261, mirroring the deference ACC-261 already states from its side
   (its `c.actionable` branch *"Placed by a security response"*): the restriction notice narrates a
   restriction that stands on its own terms, while this journey narrates a suspected compromise and
   the containment applied to it, and where a security response placed the restriction this journey
   is the one that tells the holder.
3. Nothing else. `security` / `pressureClass: none` is **correct and is the reference** for what
   `security` should mean in this corpus — an authoritatively opened incident with a determined
   scope, not any message about identity.

**Display-only changes needed:** `c.route` must stay drawn, permanently.

**Renderer changes needed:** **K §4.1, `simultaneous` branch — render the channels on one row as a
parallel send ("Sent together"), never a Primary/Fallback ladder.** The wait card renders all `until`
events plus the bound. **K §4.5 — add a guard** asserting that a condition whose short arm reaches a
`no-action` exit *without* a bookkeeping hop is never collapsed, so a future widening of the gate
rule fails mechanically rather than being caught by reading. All three are generic rules over
`channelStrategy.simultaneous`, `untilEvent` and `exitClass`; none names a journey.

---

## FIN-134 — Payment Failure Recovery

**Purpose:** Respond to the reason a payment actually failed, and keep the obligation alive while
doing it — without ever speaking about the thing the money was for.

**Current flow:**
```
Authoritative payment failure
 → (internal: classify into the class the provider reported — absorbed)
 → What kind of failure was it?
      Transient, safe to retry    → (internal: retry on the same idempotency key — absorbed)
                                    → Wait: recovery
      The customer can fix it     → Corrective action  (In-app/Email) → Wait: recovery
      Declined / no usable reason → Is an alternative route available, and whose decision is it?
            A defined fallback the system may use → Internal: charge it → Wait: recovery   [SILENT]
            The customer must choose or authorise → Offer the alternatives (In-app/Email)
                                                     → Wait: alternate choice
                                                        selected → Internal: charge it → Wait: recovery
                                                        timeout  → policy decision
            Nothing further to offer              → Wait: recovery
 → Wait: obligation_satisfied | recovery_attempt_abandoned, timeout at the consequence date
      event   → Satisfied → Discharged (Email/In-app) → Exit: recovered
                 Abandoned → policy decision
      timeout → Is a reminder still useful, and is there a consequence to name?
            Consequence ahead → The consequence and its date (Email/SMS/Push) → Wait: final
            Nothing to add    → policy decision
 → Wait: final  →  (same outcome condition / policy decision)
 → The obligation is unpaid after the recovery window — what does policy apply?
      Grace period → Handoff TIM-65 · Overdue → Handoff TIM-62 · Restriction → Handoff ACC-78
```

**Problems found:**
- **FIN-134 is the corpus's largest unreciprocated ownership sink** (I, §2.2 and **P0-1**, the
  ownership audit's top defect). Counted across all 69, **five public journeys hand it ownership or
  declare they stop where it begins** — ACQ-11 (`h.payment`), ACQ-287 (`h.payment`), SCH-303
  (`h.payment-failure`, plus `s.failure-not-ours`, plus a `distinctFrom` row, plus its trigger's
  `insufficientAlone`), TIM-274 (precedence + `s.g6`), FIN-302 (`distinctFrom`). FIN-134's own
  `distinctFrom` names **OPS-124 and TIM-274** and nothing else; three of the five handoffs into it
  are unacknowledged. It declares `competition: "none"`, and `s.hard-gates` removes pressure caps in
  its own words (*"Hard gates (GLB-31) apply. **Pressure caps do not**…"*). So the journey that
  receives ownership of the money is uncapped, declares no contest, and carries no rule stopping it
  from restating the release deadline, the checkout or the process that handed it the money. Every
  other journey in that chain gave something up in writing; this one took it and wrote nothing down.
- **TIM-268 and FIN-134 share `obligation_id` and neither names the other** (I, P1-6). An unpaid
  amount past its due date with no attempt made is TIM-268's; the same obligation after a declined
  attempt is FIN-134's.
- **A method can be charged without the customer being told.** `c.alternate` branch 1 — *"another
  stored method exists and standing authority already covers charging it"* — routes to
  `a.use-alternate` and then straight to `w.recovery`. The customer learns it from their statement.
  In a journey whose own `s.hard-gates` calls itself *"transactional communication about an
  obligation the person already holds"*, that is the one silent arm.
- **The canvas hides the journey's first rule and prints an example-only number instead.**
  `w.recovery` renders `2 days–3 days` and `w.alternate-choice` renders `3 days–7 days`; neither
  says what it is waiting **for**. Both Configs carry `confidence: "low", basis: "example-only"`,
  and `w.recovery`'s carries `avoidWhen: "no consequence date"`. `s.resolved` — *"Exit the moment
  the obligation is satisfied, cancelled or waived by any means"* — is the most important sentence
  in the journey and is invisible. A public page printing `2 days–3 days` unqualified is the
  fabricated-number failure `AGENTS.md` names.
- **`a.retry` is hidden by the bookkeeping collapse** (K §3.2): a real payment retry, writing only a
  journal row, absorbed into a wait capsule that has room for a duration and nothing else. The arm
  that explains why no message is sent for a transient failure looks like an arm that does nothing.
- **The reminder's urgent channels are declared as a fallback and are actually a parallel send.**
  As drawn, a person about to lose access gets an SMS only if their email bounces. Push is asserted
  with no push eligibility tested anywhere in the journey.
- **The approved chain is real in the data and unreadable on the page.** All three handoffs target
  non-public journeys and render as grey text; the **public** continuations are TIM-274 and ACC-261,
  both of which name FIN-134 or ACC-78 from their side.
- 20 canonical nodes is the top of what is defensible and **it is earned here** — three failure
  classes, an authority question, three downstream consequences. Do not simplify this journey to
  match the others.

**Final orchestration:** **combination**, and each part is earned by a different question:
conditional routing **by failure class** (which changes what we ask for), event-or-timeout **on the
obligation** (paid, versus the consequence date arriving — the only honest bound, since the
obligation does not expire), and conditional escalation **by policy** (which is not this journey's
decision, hence three handoffs rather than three endings). Inside it, `a.remind` is a **parallel**
send. `w.final` is not a duplicate of `w.recovery`: the bounds differ (consequence date vs recovery
window) and the reminder lives between them.

**Final customer channels:** `a.corrective` → **`email`**. `a.offer-alternate` → **`email`**. The
payment failed while the person was somewhere else; an in-product billing banner is the product's
own state display, not a send, and it cannot reach the population this stage addresses.
`a.remind` → **`email` and `sms`, once, together** — the email restates the corrective action and
the amount, the SMS carries the date and what happens on it; two jobs, one moment, no substitution.
**Push is dropped.** `a.confirmed` → **`email`**: a receipt, checked in an inbox. SMS appears here
for *deadline* reasons — access is about to be restricted, the action is short, the person may not
open email in time — and nowhere else in the journey.

**Customer touch count:** **3** worst case — corrective request (or alternate offer), one reminder,
one confirmation. `a.remind`'s own text holds the line: *"One notice — a second one is a recovery
sequence, not a reminder."*

**Final flow:**
```
Authoritative payment failure
 → What kind of failure was it?
      Transient, safe to retry    → Internal: retry on the same idempotency key  (DRAWN)
      The customer can fix it     → Corrective request (Email): the exact action and what is owed
      Declined / no usable reason → Is an alternative route available, and whose decision is it?
            Standing authority covers it → Internal: charge it  (DRAWN)
            The customer must choose     → Offer (Email): the alternatives, and that the obligation
                                            stands either way
                                            → Wait: until a method is selected — or the consequence
                                              date, whichever is sooner
            Nothing further to offer     → (straight to the recovery wait)
 → Wait: until the obligation is satisfied or abandoned — or the consequence date
      satisfied → Discharged (Email): nothing further expected, AND WHICH METHOD DISCHARGED IT
                   → Exit: recovered
      abandoned → (to the policy decision)
      consequence date → Is a reminder still useful, and is there a consequence to name?
            Consequence ahead → Reminder (Email AND SMS, together): the consequence, its date,
                                 the same corrective action
            Nothing to add    → (to the policy decision)
 → Wait: the rest of the recovery window — until satisfied or abandoned
 → The obligation is unpaid after the recovery window — what does policy apply?
      Grace period       → Handoff: Grace Period Management
                           (TIM-274 Grace Period Recovery is what the holder hears next)
      Overdue tracking   → Handoff: Overdue State Recalculation
      Access restriction → Handoff: Access Suspension
                           (ACC-261 Access Restriction Notice is what the holder hears next)
```

**State re-checks:** Three, all authored, all correct, and this journey is the corpus's best example
of why the brief asks for them. `w.recovery.recheck`: *"the obligation is still outstanding and the
method is still invalid, read from the system of record immediately before the reminder."*
`w.alternate-choice.recheck` and `w.final.recheck` likewise. No reminder can reach somebody who has
paid. Keep all three verbatim.

**Stop conditions:** `obligation_satisfied` at any point routes to the confirmation, never to
silence. `recovery_attempt_abandoned` routes to the policy decision. `s.retry-in-progress` blocks the
corrective request while a system retry may still succeed — which prevents the "your payment
failed" / "your payment succeeded" pair two minutes apart. `s.unknown-outcome` blocks everything on
an unreconciled attempt. All correct; no change.

**Ownership / handoff:** Three handoffs, all to non-public lifecycle mechanisms. `h.grace` carries a
`suppresses` clause that correctly stops every further payment-failure message while the grace
window runs — the model the other two should follow. It **takes ownership from checkout recovery**
(a settled decision) and is deferred to by five public journeys while naming two.

**What this journey must not say — the bound that is missing today.** It speaks about the
obligation and the corrective action, and about **nothing the obligation was for**. A reservation
that may be released (SCH-303), a checkout that was abandoned (ACQ-287), a process that was left
open (ACQ-11), a refund moving the other way (FIN-302), a grace window that has opened (TIM-274) —
each belongs to the journey that handed the money here or that takes it on, and each of those stops
speaking about the money for the same reason. **A release point or a resume destination received at
a handoff is a consequence to work inside, never a deadline for this journey to restate.**

**Canonical changes needed:**
1. **P0-1 · the five reciprocal rows and the suppression that bounds them** (I, verbatim):
   - `distinctFrom +=` `{ journey: "SCH-303", because: "SCH-303's subject is a reservation that is
     still standing and whether it survives; the payment is a condition on it. This journey's
     subject is the obligation itself, from the moment an attempt actually failed. SCH-303 hands the
     money here and stops speaking about it - this journey never speaks about the reservation, and
     the release point it is handed is a consequence to work inside rather than a deadline to
     restate." }`
   - `distinctFrom +=` `{ journey: "FIN-302", because: "This journey is money that failed to come in
     and an obligation that stays open. FIN-302 is money going back out against an obligation
     already discharged. The two share a payment record and nothing else, and neither ever announces
     the other's movement." }`
   - `distinctFrom +=` `{ journey: "ACQ-287", because: "ACQ-287 recovers a checkout nobody finished.
     This opens only where a checkout was finished and the payment against it failed - its own
     handoff is what ends that journey, and this one never returns to the cart or the items." }`
   - `distinctFrom +=` the same row for **ACQ-11**, reading *"a resumable process"* for *"a
     checkout"*.
   - `distinctFrom +=` the reciprocal **TIM-268** row (I, P1-6), naming the attempted/not-yet-
     attempted line.
   - `suppressions +=` `CANONICAL_RULE`, id `s.subject`: *"This journey speaks about the obligation
     and the corrective action, and about nothing the obligation was for. A reservation that may be
     released, a checkout that was abandoned, a process that was left open - each belongs to the
     journey that handed the money here, and each of those stops speaking about the money for the
     same reason. A release point or a resume destination received at a handoff is a consequence to
     work inside, never a deadline for this journey to restate."*
   - `contact.competition` stays `"none"`. I is explicit that the fix is the stated bound, not a
     competition group; the contest is resolved by handoff, and `s.subject` is what makes the
     uncapped side safe.
2. **P1 · close the silent alternate arm without adding a node.** Extend `a.confirmed` to name which
   method discharged the obligation, and add `s.authorised-method`: *"Where a stored method was
   charged under standing authority after another failed, the confirmation names the method used. A
   charge the person did not choose is disclosed at the moment the obligation closes, not discovered
   on a statement."*
3. **P1 · channels.** `t.corrective` → `["persistent"]`; `t.offer-alternate` → `["persistent"]`;
   `t.remind` → `["persistent","urgent"]` with `urgent` narrowed to `sms` only (drop `push` from the
   role for this journey) and `channelStrategy.simultaneous: { allowed: true, reason: "the email
   restates the corrective action and the amount; the SMS carries the date and what happens on it.
   Sent once, together, before a consequence the company will actually apply." }`;
   `t.confirmed` → `["persistent"]`.
4. **P2 · the wait Configs.** Keep the `example-only` ranges in the detail panel; the card must show
   the event and the bound. **If the renderer change below lands, no canonical change is needed
   here at all** — this item exists only as the fallback if the renderer is not changed.
5. **No change to the declaration.** `transactional` / `pressureClass: none` /
   `localCap.appliesTo: "non-mandatory"` with `value: 1`, one discretionary touch against three
   mandatory ones, and `s.hard-gates` stating the reasoning in the journey's own words. This is the
   reference declaration for the domain.

**Display-only changes needed:**
- `a.retry` must be drawn; `a.use-alternate` already is.
- The handoff cards for `h.grace` and `h.restrict` name the **public journey the holder hears next**
  (TIM-274, ACC-261) alongside the non-public target. This is derivable rather than a per-journey
  lookup — both of those journeys name the target in `distinctFrom` — so it is a rule.

**Renderer changes needed:** K §4.1, including the `simultaneous` parallel case — this reminder is
the case that proves it. The wait card shows its events and its bound, and **a `Config.default`
carrying `basis: "example-only"` or `confidence: "low"` is never rendered as a bare duration**: the
card shows the `until` sentence, or the number explicitly marked as an example. K §4.3 — the
`absorbableBookkeeping` structure fix (`a.retry` and IDN-84's `a.backoff` are the two proving
sites), plus the rule that an action may only be absorbed into a card that can carry its meaning,
never into a `wait` capsule.

---

## FIN-302 — Refund Notification

**Purpose:** Tell the person money is going back, and then whether it actually arrived — keeping the
decision to refund, the movement of the money and its arrival as three facts stated at the moment
each becomes true.

**Current flow:**
```
Refund submitted for settlement
 → What is actually moving, and against what?
      The whole transaction → (send gate)
      Part of it            → (send gate)
      Nothing is moving     → Exit: nothing to announce
 → (send gate: may the notice go out? — hidden, correctly)
      No route → (internal: record why) → Exit: no notice sent
 → Notice: money is going back — the amount, whole or part, and that it has not arrived (Email/In-app)
 → Wait: refund_settlement_confirmed | refund_settlement_failed, timeout at the settlement window
 → What does the financial record say happened to the money?
      Returned in full → Returned, and how much → Exit: returned and confirmed
      Returned in part → What came back, what did not, what happens to the rest → Exit: partly returned
      Not confirmed    → Not confirmed back, being reconciled, nothing needed from you
                          → Exit: not confirmed back
```

**Problems found:**
- **A withdrawal mid-window is told as a reconciliation.** `x.void` catches a submission withdrawn
  *before* anything was said. After `a.issued` has gone out, `w.outcome` waits on
  `[refund_settlement_confirmed, refund_settlement_failed]` only — so a submission reversed or
  withdrawn during the window falls to the timeout and the person is told *"the money has not been
  confirmed back, the movement is being reconciled."* That is false, and `s.approved`'s own standard
  (*"Every message says which of the three is true at the moment it is sent"*) is broken. **There is
  no withdrawal event in the registry**, so this needs a registry addition, not just a branch.
- **`c.scope`'s whole-vs-part split does not change the route.** Both branches go to the same node
  and the twin-route edge merge draws them as one edge labelled *"The whole transaction · Part of
  it"* — a decision whose two visible labels lead to the same box (K P1-5 partial case). What the
  split is actually doing is asserting a content requirement, and that requirement already lives in
  `s.partial` and in `a.issued`'s own prose. The same message goes out on the same channel to the
  same person either way; only the numbers inside it differ, and the numbers come from the record.
- **The wait card drops the failure arm**, rendering only *"Until the financial record confirms that
  funds were returned…"*. On a refund journey the dropped arm is the one the person is afraid of.
- In-app is declared on all four sends; a balance display is not a statement about money.

**Final orchestration:** **event-or-timeout** — one notice, then a wait resolving to one of several
mutually exclusive outcome statements. Not a sequence and not a fallback: `a.settled`, `a.partial`
and `a.unresolved` are exclusive arms of one condition, exactly as the journey's own `localCap`
basis says. It is the right shape because the second message exists only when a *state* became true,
never because time passed — `s.once`.

**Final customer channels:** **`email`** for every touch. A statement about money is the thing
people go back and look for, forward to someone, and check against a bank statement. **No in-app, no
SMS, no push, and this is the clearest case in the domain**: there is nothing for the person to do,
no deadline to beat, and the entire value of the message is that it can be re-read. An SMS saying
money is on its way, with no amount retained and no record kept, generates the support contact the
journey exists to prevent.

**Customer touch count:** **2** — the movement, then the outcome. Both mandatory. `s.once` forbids a
third and is right.

**Final flow:**
```
Refund submitted for settlement
 → Is money actually moving?
      Nothing is moving → Exit: nothing to announce
 → Notice (Email): the amount submitted, whole or part with the remainder named separately,
   and that it has not arrived yet
 → Wait: until the record confirms the money was returned, failed, or the submission was
   withdrawn — or the settlement window closes
 → What does the financial record say happened to the money?
      Returned in full → Returned, and how much → Exit: returned and confirmed
      Returned in part → What came back, what did not, what happens to the rest
                          → Exit: partly returned
      Withdrawn        → The refund was withdrawn before it settled, and what the record now shows
                          → Exit: withdrawn after notice
      Not confirmed    → Not confirmed back, being reconciled rather than re-attempted, nothing
                          needed from you → Exit: not confirmed back
```

**State re-checks:** One, authored and correct: `w.outcome.recheck` re-reads *"the refund record,
the original transaction and the remaining refundable amount, re-read from the financial systems
that own them"*. That is what makes the partial arm honest — the remaining refundable amount is read
at the moment of the second message, not carried from the first. Keep verbatim.

**Stop conditions:** `refund_settlement_confirmed` / `_failed` end the wait; the settlement window
bounds it; `x.void` stops before any send; the hidden send gate stops with a recorded reason where
no route exists. After the outcome message the journey ends — `s.once` forbids a reminder, and a
further refund against the same transaction is a new instance with its own `refund_id`.

**Ownership / handoff:** No handoffs, `competition: "none"`, and five `distinctFrom` rows — FIN-137
(who decided), FIN-138 (who moved the money and tells nobody), REM-157 (which remedy), FIN-134
(money in versus money out), REM-305 (the case versus the money). The most completely stated
boundary set in the domain. **The REM-305 boundary is intact from both sides** (I confirms F3
closed) and is three claims REM-305 does not carry and must not make: the **amount** (`s.partial`),
the **timing** (`s.timing` — no date is promised, because the settlement route's timing is not the
sender's to assert) and the **settlement state** (`s.approved` — submitted is not settled). Keep it
exactly as it is and do not let a later edit soften `s.approved`, which is the load-bearing one.
FIN-134 does not name FIN-302 back; the reciprocal row is written in FIN-134's section.

**Canonical changes needed:**
1. **P1.** Add `refund_submission_withdrawn` to the event registry via `scripts/event-curation.json`
   + `node scripts/build-event-registry.mjs`; add it to `w.outcome.untilEvent`; add a fourth branch
   to `c.outcome` (*"the submission was withdrawn or reversed after the notice went out"*) → new
   message `a.withdrawn` → new exit `x.withdrawn`, class `invalid-state`. This is the one place the
   journey currently makes a claim its own `s.approved` forbids.
2. **P2.** Reduce `c.scope` to two branches — *Money is moving* → send gate, *Nothing is moving* →
   `x.void` — and rely on `s.partial` and `a.issued`'s existing content requirement for the
   whole/part distinction, which is where it already lives.
3. **P2.** `channelRoles` on all touches → `["persistent"]`. Drop `in-session`.
4. Nothing else. The declaration is exemplary — `transactional` / `pressureClass: none` /
   `localCap.value: 0` with the basis *"every touch in the plan is marked mandatory"* — and the
   entity note (*"a further refund against the same transaction is its own movement with its own
   instance, which is what keeps a partial refund from being announced twice as a whole one"*) does
   real work.

**Display-only changes needed:** none. Confirm the send-gate collapse stays: `c.sendable` →
`a.record-no-action` → `x.no-action` is a textbook implementation gate through a bookkeeping hop and
`collapsibleGates()` is right to hide it. It is also the useful contrast with IDN-271's `c.route`,
which looks identical and must never be hidden — one records why nothing was sent, the other decides
who is safe to tell.

**Renderer changes needed:** K §4.1 (one role → no rank label). The wait card renders every `until`
arm plus the bound.

---

## DOC-214 — Document Delivery

**Purpose:** Get one specific *issued* version to the party who should have it, and know honestly
whether it arrived — without delivery state ever being confused with document validity.

**Current flow:**
```
issued_document_requires_distribution
  → [resolve recipient and permitted route]        (absorbed)
  → [bind distribution to the exact issued version] (absorbed)
  → Distribute  EMAIL
  → Wait until distribution_confirmed | distribution_failed
       event   → How did the distribution resolve?
                   Confirmed → [record] → Exit: distributed
                   Failed    → Handoff: CMS-208
       timeout → [record UNKNOWN, never DELIVERED] → Handoff: external status reconciliation
```

**Problems found:**
- **The card says `Primary: Email` over a one-channel plan.** `channelStrategy.roles` has a single
  role and `fallback: "same-role-other-channel"` — a fallback declaration with nothing to fall back
  to. Display noise on the corpus's cleanest journey.
- `a.version` is absorbed although its headline is *"Bind the distribution to the exact issued
  version"* and `s.g2` makes version binding one of the journey's three stated guarantees. **No
  change is proposed:** the absorption rule is data-driven and correct as a rule, and the node is
  one click away under *Represented canonical steps*. Recorded because it is a real cost of an
  otherwise good rule.
- The trigger reads *"Trigger Issued document requires distribution Authoritative"* (K P2-9,
  corpus-wide).

**Final orchestration:** **single.** One message, one recipient, one version. There is no second
business moment — the document has either arrived or it has not, and "has not" is somebody else's
journey. The wait that follows resolves the *outcome* and sends nothing; **a second touch would be a
second copy of a document, which is exactly the failure `s.g1` and the
`document_distribution.touches` budget of 1 name.** The temptation to add orchestration here because
a 7-card journey "looks thin" is the temptation this plan is refusing on purpose: the burden of
proof is on adding, and there is none.

**Final customer channels:** `email`. Only.

**Customer touch count:** **1.**

**Final flow:** identical to the current flow. No graph change.

**State re-checks:** one, and it is enough — `w.distribution.recheck` re-reads the issued version
from the system of record before acting on the timeout, so a version superseded during the delivery
window is not reconciled as though it were still current.

**Stop conditions:** `distribution_confirmed` → the success exit; `distribution_failed` → the
recovery handoff; the window elapsing with neither → the reconciliation handoff. **There is no path
on which this journey sends again.**

**Ownership / handoff:** `h.recover → CMS-208` (non-public) carrying `message_id` +
`destination_id` and *"the explicit requirement that any fallback route carries the same version"*.
`h.reconcile → external:external-status-reconciliation` carrying *"the document remains valid and
issued regardless of how this resolves"*. Both correct, both stay. This journey must never state
that the document is *valid* on the strength of a delivery outcome, or *delivered* on the strength
of a timeout — the timeout records UNKNOWN and hands off, which is the whole point.

**Canonical changes needed:** **none to the graph.** One optional low-priority field: drop
`channelStrategy.fallback` or set it to a value meaning "no fallback", since a one-role strategy
cannot fall back to anything and the populated field is what feeds the false label. The renderer fix
below makes even that cosmetic.

**Display-only changes needed:** no role label row where the plan has exactly one role — render the
`Email` pill alone.

**Renderer changes needed:** K §4.1 — a single-channel action states its channel and does not rank
it; `ChannelPriorityRow` must stop labelling row 0 `Primary` unconditionally. K's
**H5_FAKE_PRIMARY** hygiene check is the gate. K P2-9 — the trigger card drops the `SignalSource`
provenance row.

---

## DOC-215 — Signature Reminder

**Purpose:** Collect every required signature against **one exact version** — request once per
signer, remind outstanding signers once, and end honestly: expired is not declined, and a deadline
nobody set is never invented.

**Current flow:**
```
document_requires_signature
  → [define signers, authority, order, scope, window]      (absorbed)
  → Is a signature validity window defined?
       Defined     → [bind to it]   (absorbed) ┐
       Not defined → [record unset] (absorbed) ┴→ Request
  → Request  EMAIL  (AWAITING_SIGNATURE, bound to the version)
  → Wait until signer_signed | signer_declined | document_version_superseded
       timeout = signature.reminder_point (3–5 days, example-only, confidence LOW)
       event   → What happened?
              signed     → [record] → All required signatures complete?
                                         All  → [record] → Handoff: DOC-216
                                         Some → back to the wait
              declined   → [record] → Handoff: external operational resolution
              superseded → [record] → Exit: signature process ended
       timeout → Would a reminder still change anything?
              It would     → Reminder  EMAIL  → Wait to the validity boundary
              It would not → Wait to the validity boundary
  → Wait to the validity boundary → (same three answers) / Exit: SIGNATURE_EXPIRED
```

**Problems found:**
- **The one-reminder gate is per-process while the stated rule is per-signer.** `s.one-reminder`
  reads *"One reminder per signer; a second is a re-request the process does not make"*, and
  `t-remind`'s purpose is *"Remind only the signers still outstanding"* — but
  `c.reminder-useful`'s send arm fires only when *"no reminder has been sent **on it** yet"*, on the
  process. Under a signing **order**, which `a.define` explicitly captures, signer 2 becomes
  actionable only after signer 1 signs; if the single process-level reminder was spent on signer 1,
  **signer 2 is never reminded at all.**
- **`c.window` is a no-op diamond on the canvas** (K P1-5, G9): both branches converge on
  `a.request`, both branch actions are themselves absorbed, and the twin-edge merge leaves a violet
  Decision card with exactly one outgoing edge. The split is real *data* — it decides what the
  message may claim and what `w.expiry` binds to — but it is not a **route**.
- **The wait card renders `3 days–5 days` as if it were authoritative.** That Config carries
  `confidence: "low"`, `basis: "example-only"`, and `avoidWhen: "no validity window — the review
  point is the bound"`. On the *Not defined* branch the number is explicitly wrong by its own
  `avoidWhen`, and `s.no-invented-deadline` is the journey's own guardrail against exactly that.
- `Primary: Email` over a one-channel plan; `AWAITING_SIGNATURE`, `SIGNATURE_EXPIRED` and
  `validity_ends_at` reach the canvas as raw tokens (K P1-6).
- Title vs scope: the card says *Signature Reminder* while the journey owns request, collection,
  completion, decline, supersession and expiry. The slug (`signature-process`) is right. Cosmetic,
  recorded, not proposed.
- DOC-215 is one of the eight public journeys TIM-268 defers to that say nothing back (I, P1-4).

**Final orchestration:** **event-or-timeout**, with one sequential gated reminder inside it. This is
the pattern the rest of the corpus should be copying and the reason is the `until` set: the wait
ends on *signed*, *declined* or *superseded* — three ways the reminder stops being useful — and only
the fourth outcome (nothing happened) reaches a send, and then only after a re-check. No segment
split, no channel choice, no urgency ladder. **Do not touch the shape.**

**Final customer channels:** `email`. Only, on both touches. Resisted and recorded: SMS (cannot
carry the document, and there is no urgency the request's own terms set), push (no persistence for a
legal artifact), in-app (a required signer frequently has no product session at all).

**Customer touch count:** **2 per signer** — the request, and one reminder, and only if that signer
is still outstanding at the reminder point. Note the request is a **recipient** fan-out (each
required signer), not a channel fan-out.

**Final flow:**
```
Document requires signature
  → [define signers, authority, order, scope and window — and whether a window exists at all]
  → Signature request · Email   (bound to the exact version, to each required signer)
  → Wait (until signed, declined or superseded — reminder point before the validity boundary)
       → What happened?
              signed     → Are all required signatures complete?
                              All complete → Handoff: Document Effectiveness Validation
                              Some remain  → back to the wait
              declined   → Handoff: operational resolution
              superseded → Exit: signature process ended
       → Would a reminder still change anything, FOR A SIGNER NOT YET REMINDED?
              It would     → Reminder · Email (outstanding signers only) → Wait to the boundary
              It would not → Wait to the validity boundary
  → Wait to the validity boundary → (same three answers) / Exit: signature expired
```

**State re-checks:** both, and both are genuine — `w.signatures.recheck` and `w.expiry.recheck` each
re-read the version and every signer before the timeout is acted on. **The corpus's best instance of
"never send a reminder after success"**: a signer who signed is dropped from the outstanding set by
the re-read, not by a suppression rule.

**Stop conditions:** `signer_signed` (per signer, feeding the completeness check); `signer_declined`;
`document_version_superseded`, which additionally **suppresses outstanding requests**, stated in
`s.version` and enacted at `a.superseded`; the validity window elapsing, recorded as *expired*, never
as refused.

**Ownership / handoff:** `h.effective → DOC-216` carrying *"signed is not effective"* explicitly, and
`h.declined → external:operational-resolution` carrying *"the document remains validly issued — what
is absent is agreement rather than the artifact"*. Both correct, both stay. This journey must not
state that a signed document is *effective* — that is DOC-216's — and must not state a deadline the
issuing terms did not set. Plus the TIM-268 reciprocity below: a signature request is scoped to a
document version and outranks a bare due-date reminder.

**Canonical changes needed:**
1. `c.reminder-useful` branch 0 `when`: replace *"no reminder has been sent on it yet"* with *"this
   signer has not been reminded yet"*, and align `s.one-reminder` to the same scope. No node added,
   no touch added to any signer — it changes **which signers** the single reminder addresses.
2. **Reciprocity with TIM-268 (I, P1-4):** `suppressions +=` `CANONICAL_RULE` id
   `s.generic-reminder` with the standard text, plus a `distinctFrom` row naming TIM-268 mirroring
   the row TIM-268 already carries.
3. Nothing else. Shape, channels, cap and stop conditions are correct as authored.

**Display-only changes needed:**
1. **Absorb `c.window` into the `Signature request` card**, listing it under *Represented canonical
   steps*. The generic rule: *a condition whose branches all converge on the same successor, and
   every branch's action is itself absorbable, is not a route.*
2. **Mark an example-only duration on the wait card**: where `Config.default.basis ===
   "example-only"` or `confidence === "low"`, render the `until` sentence instead of the number, or
   the number with an explicit "example" qualifier.
3. One-role plan → no `Primary` row.

**Renderer changes needed:** K §4.1. K §4.4 — after `buildDisplayGraph`, any `condition` DisplayNode
with `outDegree < 2` is absorbed into its target or re-kinded; today it is drawn as a fork with one
line out, which is the worst of both. K §4.5's **G9_DEGENERATE_DECISION** is the gate. The
example-only wait treatment above, expressed over two fields every `Config` already carries. K's H1
widening for `AWAITING_SIGNATURE`, `SIGNATURE_EXPIRED` and `validity_ends_at`.

---

## INC-254 — Incident Update

**CONFLICT — ESCALATED.** J classifies `a.communicate` as **single (delegated)**, final channel
`email`, on the ground that the action's own text hands the channel to the canonical communication
mechanism, so asserting any channel pair on the card contradicts the stage. The domain audit
classifies it as **parallel, `email` + `in_app`**, citing evidence J does not: both
`audit/51-journey-design-matrix.md` and `audit/channel-orchestration-map.md` record INC-254 as
Parallel with an authored justification — *"Email carries the record to people who are not in the
product; the in-app surface reaches whoever is hitting the fault right now. Neither is interruptive,
so this is not two alarms"* — and the instance key makes each send a single, non-repeating message
to a cohort that is split between those two situations by definition. **I applied the domain
audit's answer (parallel, email + in-app).** J's dissent is recorded and is not without force: the
card must also name the **cohort and the state change**, and must not present the mechanism's
delivery plumbing as this journey's channel decision. Both audits agree on the only thing that
matters operationally — **the card must not say "Fallback"**, in either locale.

**Purpose:** Tell the people actually affected something **true and useful**, through the mechanism
that already owns delivery — and say nothing when nothing has changed.

**Current flow:**
```
incident_reaches_communication_relevant_state
  → [determine what is known, what is not, what action, what the next-update condition is] (absorbed)
  → Can the affected cohort be identified with reasonable precision?
       It can        → [scope it]  (absorbed) ┐
       It cannot yet → [go broad]  (absorbed) ┴→ next
  → Is what would be said actually confirmed?
       Confirmed     → ─────────────────────┐
       Not confirmed → [hold the claim] (abs)┴→ next
  → Does this materially change the guidance the recipient already has?
       It does                                 → Communicate
       It does not, and no commitment requires → [record] → Exit: nothing was sent, and why
       It does not, but a commitment requires  → Communicate
  → Communicate   EMAIL + IN-APP (one send, two surfaces)
  → Is this the resolution notice for this recipient scope?
       It is     → Exit: communications closed
       It is not → Exit: update issued
```

**Problems found:**
- **`Primary Email / Fallback In-app` inverts the authored design.** The card says "try email, fall
  back to in-app" about a send the design records as two surfaces doing different jobs at the same
  moment. **The worst instance of the fallback artifact in the corpus** after IDN-271.
- **`orchestration.touches[t1].mandatory: false`.** An incident notice — including the resolution
  notice, which is the same node — is a service obligation to a cohort that was already told
  something. Marking it discretionary lets a pressure cap suppress the message that closes a loop we
  opened. `pressureClass` is already `"service"`; `mandatory` should agree.
- **`measurement` has no `businessOutcome` and `goal.event` is `null`.** The outcome is coverage —
  did the resolution notice reach the scope that was told — and nothing measures it. Flagged; the
  fix is measurement plumbing and does not belong in a display refactor.
- **`c.cohort` and `c.verified` each draw exactly one outgoing edge** (K P1-5, G9): real decisions
  that select message *content*, drawn as forks with both answers stacked in one compound edge chip.
  They read as bugs. *(Arbitration: the domain audit states that "the three decisions drawn are all
  business logic". K is binding on what the canvas draws, and its rule is structural — a drawn
  condition must have ≥ 2 outgoing display edges. Applied to `c.cohort` and `c.verified` only;
  `c.material` and `c.final` both have real forks and stay.)*
- The trigger reads *"Incident reaches communication relevant state"* (K P2-9).

**The missing wait is the design, and it is right.** Three independent pieces of evidence: the
trigger's own `insufficientAlone` is *"time having passed since the last update, which is not itself
information"*; `x.updated`'s state string is *"update issued; the next update is bound to a stated
condition rather than to a clock"*; and **the instance key is
`["incident_id", "recipient_cohort_id", "state_change_id"]`**. That last is load-bearing and answers
the touch-count question outright: because `state_change_id` is part of the key, **each material
state change is its own instance, and each instance sends exactly one message.** The multi-touch
incident narrative — first notice, scope corrected, workaround, fix in progress, resolved — is
**five instances of a one-touch journey**, not one instance of a five-touch journey. That is why
INC-254 legitimately exceeds three touches across an incident while carrying a `localCap` of **1**
and a single `orchestration.touches` entry: a touch exists only if a new `state_change_id` exists,
and that exists only if the incident's authoritative state changed. **Time passing creates no key,
so it creates no touch.** Adding the "stated-condition wait" some notes offer as an option would
turn a journey whose whole point is *no clock* into one with a clock, and would make the instance
key incoherent — a wait inside an instance keyed on `state_change_id` would be waiting for a state
change that, by definition, starts a different instance. **Do not add a wait, under any reading.**

**Final orchestration:** **parallel** — one send, two surfaces, simultaneously. It qualifies on the
brief's own terms: the two channels serve **different purposes for different people** (a durable
record for those outside the product; a live surface for whoever is hitting the fault now), not one
purpose with a substitute, and neither interrupts. This is one of only two genuine parallel journeys
in the public corpus.

**Final customer channels:** `email` **and** `in_app`, together, labelled as two roles doing two
jobs — never as a priority chain. The card additionally names the **cohort** and the **state
change**, which is J's requirement and is what a reader of an incident canvas actually needs.

**Customer touch count:** **1 per instance** — that is, 1 per material state change. Unbounded across
an incident by construction, and bounded by the incident's own state machine rather than by a touch
budget. This is a better mechanism than a cap, and it is why the journey does not need one to
behave.

**Final flow:** graph unchanged apart from the two degenerate decisions being absorbed; only the
send card's channel presentation and the trigger's wording change.

**State re-checks:** `a.determine` is the re-read, and it runs before anything is scoped — what is
known, what is not, what action is needed, and the condition under which the next update happens.
There is no later touch inside an instance, so there is nothing to re-check before.

**Stop conditions:** `x.no-send` where nothing material changed and no commitment requires an update
— **recorded with a reason, not silently skipped**, which is a rare and valuable ending and must be
protected. `x.closed-comms` where the resolution notice reached the scope that was told, whose
`reEntry` is the best line in the set: *"a relapse is communicated as a relapse rather than as a new
incident, because the recipients were told it was over."*

**Ownership / handoff:** none, correctly. `a.communicate` explicitly raises the send through the
canonical communication mechanism rather than building a delivery path — that is a **dependency, not
a handoff**, and it must not be drawn as a channel. This journey owns what is said to an affected
cohort about one state change and nothing else: it does not own the incident, its containment or its
resolution, and it must not claim a fix it has not been told is authoritative (`c.verified` exists
for exactly that).

**ARBITRATION RESOLVED (Phase 1b):** INC-254 - RESOLVED: the domain audit's parallel email+in_app is applied. J lacked the evidence for its single/delegated verdict: two existing documents (51-journey-design-matrix.md, channel-orchestration-map.md) already record this stage as Parallel with an authored justification, and the instance key (state_change_id included) makes each send one non-repeating message to a cohort split between people off-product and people hitting the fault now. Both sides agree the card must never render Fallback/Yedek in either locale - INC-254 is the regression test for that rule.

**Canonical changes needed:**
1. `orchestration.touches[t1].mandatory: false → true`.
2. Declare the send as parallel: `channelStrategy.simultaneous: { allowed: true, reason: "the email
   carries the record to recipients who are not in the product; the in-product surface reaches
   whoever is hitting the fault now. Neither substitutes for the other and neither interrupts." }`,
   with `channelRoles` left as the two roles they are.
3. Correct `audit/channel-orchestration-map.md`'s event-or-timeout roster to **exclude** INC-254
   (documentation, not canonical — but it is the item the design matrix is waiting on).
4. **Not** a wait node. Under any reading.
5. Flagged, out of scope here: give `measurement.businessOutcome` an event.

**Display-only changes needed:** absorb `c.cohort` and `c.verified` into the card they converge on,
listing them under *Represented canonical steps*. Keep `c.material` drawn — one of its arms sends
nothing at all. **Keep `c.final` drawn**: the message has already gone and both arms are exits, but
*"this is over for you"* versus *"there is more coming"* is the single most reader-relevant fact on
an incident canvas, and endings are never collapsed.

**Renderer changes needed:** K §4.1, `simultaneous` branch. **INC-254 is the regression test for it:
after the change this card must read as two roles doing two jobs and must not contain the word
*Fallback* / *Yedek* in either locale** — K's **H6_FALSE_FALLBACK** hygiene check, run on both
locales. K §4.4 / G9 for the two degenerate decisions. K P2-9 for the trigger card.

---

## REL-284 — Invitation Reminder

**Purpose:** Put a proposed link in front of the party who has to accept it, **on terms they can see
before they answer**, and close the question one way or the other before the invitation goes stale.
The subject is the *invitation*, not either party.

**Current flow:**
```
relationship_invitation_issued  (named counterparty, scope, direction, expiry)
  → Does the counterparty already exist here in their own right?
       Existing holder → Invitation  EMAIL + IN-APP
       New to us       → Invitation  EMAIL + IN-APP
  → Wait until invitation_accepted | invitation_declined | invitation_withdrawn
       timeout = the point at which one reminder would still leave time to act, measured back
                 from expiry (required, no default)
       event   → How was the invitation answered?
              Accepted           → Confirmation  EMAIL + IN-APP, TO BOTH SIDES → Exit: link active
              Declined/withdrawn → Exit: closed  (terminal: never revived)
       timeout → Is a reminder still worth sending?
              Time remains  → Reminder  EMAIL + IN-APP → Wait to expiry
              Window closed → Exit: expired unanswered
  → Wait to the invitation's own expiry
       event   → (the same answer condition)
       timeout → Exit: expired unanswered
```

**Problems found:**
- **The segment split is real, but the channel does not follow it — and it cannot.** `c.known`'s
  second branch is defined as *"the counterparty **has no record here** and knows the inviting party
  but not us"*. Someone with no record here **has no in-app surface.** Yet `a.invite-new` declares
  the identical roles as `a.invite-known`, and the card advertises an in-app route to a person who
  cannot be reached in the app. **A hard data error, not a judgement call**, and the signal that
  fixes it is in the branch's own `when` string.
- **`a.confirm` is `mandatory: false`.** `s.g3` (*"Scope and direction are stated in the invitation
  itself, not discovered after acceptance"*) and the action's own headline (*"An unstated scope is
  assumed to be total by whoever has less to gain from it"*) together make the confirmation the
  message that prevents the journey's worst failure. A discretionary budget must not be able to drop
  it.
- **`c.remind`'s "and no reminder has been sent for it" clause is dead.** `c.remind` is reachable
  only from `w.response`'s timeout, which fires once, and there is no edge back to it. Harmless;
  noted so an implementer does not build state for a guard that cannot fire.
- `c.known` forks into two message cards with an identical channel block (K P2-10) — which, after
  the fix, it will not.
- **Title vs scope.** *Invitation Reminder* names the third-most-important of four touches; the slug
  (`relationship-invitation`), the purpose, the entity note and the category all describe an
  invitation lifecycle.
- REL-284 is one of the eight public journeys TIM-268 defers to that say nothing back (I, P1-4).

**Final orchestration:** **segment-based**, opening a wait that is event-or-timeout, one single
reminder, and a dual-recipient confirmation. The segment earns its place three times over —
different *content* (an existing holder asks what accepting **costs** them; a stranger reads an
unexplained invitation as a claim already made), different *reachability* (only one of them has a
product session), and different *framing risk* — and it is currently doing only the first of the
three. **Making it also drive the channel is the change.**

**Final customer channels:** `a.invite-known` → **`email`**. `a.invite-new` → **`email`** (in-app is
impossible on this branch by the branch's own definition). `a.remind` → **`email`** — one reminder on
the route that already reached them, not a new channel and not an escalation. `a.confirm` →
**`email`, to both parties**. The invitation states scope, direction and what accepting would and
would not change, against an expiry: that is *terms*, and terms need a copy the recipient keeps. An
in-product inbox entry is a product surface, not a second send.

**Customer touch count:** **3 to the counterparty** (invitation, one reminder, confirmation) and **1
to the inviting party** (the confirmation). Matches `relationship_invitation.touches` = 3. Note the
confirmation is a **recipient** fan-out, not a channel fan-out — one message sent to each side.

**Final flow:**
```
Relationship invitation issued
  → Does the counterparty already exist here in their own right?
       Existing holder → Invitation · Email  (what accepting costs them, scope, direction, expiry)
       New to us       → Invitation · Email  (who is inviting, what this is, what it does and does
                          not claim — no in-app surface exists on this branch)
  → Wait (until accepted, declined or withdrawn — reminder point, measured back from expiry)
       → How was the invitation answered?
              Accepted           → Confirmation · Email · TO BOTH SIDES: the scope and direction
                                    both parties will be held to → Exit: link active
              Declined/withdrawn → Exit: invitation declined or withdrawn  (terminal)
       → Is a reminder still worth sending?
              Time remains  → Reminder · Email: who is waiting, and the date → Wait to expiry
              Window closed → Exit: expired unanswered
  → Wait to the invitation's own expiry
       → (the same answer condition)  /  Exit: expired unanswered
```

**State re-checks:** both waits re-read the invitation from the system of record before acting on the
timeout, which is what stops a reminder going out on an invitation the inviting party withdrew during
the response window. Correct and already there.

**Stop conditions:** `invitation_accepted`, `invitation_declined`, `invitation_withdrawn` — all three
in **both** waits' `until` sets, which is the right answer and is what RLT-279 gets wrong. Plus the
invitation's own expiry. `x.closed` is `terminal: true`: *a declined one is never revived.*

**Ownership / handoff:** none, and none needed. `distinctFrom` correctly separates REL-91 (which
decides whether a link has an authoritative basis) and SUB-161 (which owns an agreement with a term).
This journey must not state what the link *entitles* either party to beyond the scope written in the
invitation — that is the agreement's, not the invitation's. Plus the TIM-268 reciprocity below.

**Canonical changes needed:**
1. `orchestration.touches[t2].channelRoles` (`a.invite-new`): `["persistent","in-session"]` →
   `["persistent"]`. The counterparty has no in-app surface by the branch's own definition.
2. `orchestration.touches[t1].channelRoles` (`a.invite-known`) → `["persistent"]` and
   `[t4]` (`a.remind`) → `["persistent"]`: the reminder follows the invitation's route, and the route
   that is always available is the persistent one.
3. `orchestration.touches[t3].mandatory: false → true` (`a.confirm`), and `[t3].channelRoles` →
   `["persistent"]`.
4. **Reciprocity with TIM-268 (I, P1-4):** `suppressions +=` `CANONICAL_RULE` id
   `s.generic-reminder` with the standard text, plus a `distinctFrom` row naming TIM-268.
5. Cosmetic, recommended: `title.en` → *"Relationship Invitation"*, `title.tr` → *"İlişki Daveti"*.
   REL-284 is **not** one of the five ids `src/lib/journey-marketing.ts` hard-references, so nothing
   throws.
6. Optional cleanup: drop the dead *"and no reminder has been sent for it"* clause from `c.remind`
   branch 0's `when`.

**Display-only changes needed:** none. 13 canonical → 14 drawn, with two `x.expired` instances, is
per-parent instancing working correctly: each branch keeps its own ending beside it.

**Renderer changes needed:** K §4.1 — after fix 1 and 2 every card here has exactly one role and must
render its channel pill with no rank label at all.

---

## RLT-279 — Upgrade Blocker Reminder

**Purpose:** Tell the holder of a blocked target **the one specific thing** standing between it and
the change, while there is still enough preparation window left to clear it — and ask nothing of a
holder who cannot clear it.

**Current flow:**
```
target_held_on_named_prerequisite  (the blocker NAMED, not described; window time left)
  → Can the holder clear this blocker themselves?
       Theirs to clear → Name the blocker   IN-APP + EMAIL → Wait
       Not theirs      → Hold notice        IN-APP + EMAIL → Exit: held   [classed "success"]
  → Wait until named_requirement_satisfied | change_withdrawn
       timeout = the point past which the target cannot be made ready in time (required, no default)
       event   → What ended the wait?
              Blocker cleared  → Handoff: RLT-242
              Change withdrawn → Exit: moot
       timeout → Is a second prompt still worth sending?
              Time remains  → Last call  IN-APP + EMAIL → Wait to the window close
              Window closed → Exit: unprepared
  → Wait until named_requirement_satisfied        ←── change_withdrawn IS MISSING
       event   → Handoff: RLT-242  (direct, no condition)
       timeout → Exit: unprepared
```

**Problems found:**
- **`w.final.until` is `["named_requirement_satisfied"]` — `change_withdrawn` is missing.** `w.clear`
  listens for both; `w.final` listens for one. A change withdrawn *after* the last call cannot end
  the instance: it runs to the window close and exits `x.unprepared` — *"preparation window closed
  with the blocker outstanding"* — recording a target as unprepared for a change that no longer
  exists. `s.g4` says *"Not ready is not failed"*; this fails in the other direction. Structurally
  the same bug as the RET-30 `cancellation_confirmed` defect, which was fixed as a **P0**.
  `change_withdrawn` already exists in `src/canonical/events.ts` — no registry change needed.
- **`x.held` is classed `success`.** The state is *"held on a blocker the holder cannot clear"*, and
  the journey's `businessOutcome.event` is `named_requirement_satisfied`, which on this path is
  **structurally unreachable** — nothing is asked, nothing can be cleared, the instance ends.
  Classing it `success` puts every not-theirs-to-clear target into the success numerator.
- **`w.final.onEvent → h.resume` directly, with no condition.** Correct only while the wait listens
  for exactly one event; the moment `change_withdrawn` is added it would hand a withdrawn change to
  RLT-242 as "ready".
- **All three touches are `mandatory: false`.** `a.name-blocker` is the entire reason the journey
  exists — suppress it and the holder is never told why the target is held, the failure `s.g1` names
  — and `a.inform-hold` carries a fact nobody else will deliver. Only the last call is legitimately
  discretionary.
- **`Primary In-app / Fallback Email` on all three sends, and here the order is specifically wrong:**
  `a.name-blocker` and `a.last-call` both name *a date after which the change can no longer be
  applied* and ask for work done outside the product. An admin who does not log in during the
  preparation window never sees a console banner.
- The trigger reads *"Target held on named prerequisite"* (K P2-9).
- RLT-279 is one of the eight public journeys TIM-268 defers to that say nothing back (I, P1-4).

**Final orchestration:** **conditional routing** on who can act, then event-or-timeout with one gated
last call — and it stays in the TIM-268 / ACC-263 family of simple obligation reminders. `c.resolvable`
is a real business decision by every test: it changes the message, the number of touches (2 versus
1), **the channel**, whether anything is asked at all, and the ending. It is not an implementation
gate, its short arm records no suppression reason, and it must stay drawn.

**Final customer channels:** `a.inform-hold` (not theirs to clear) → **`in_app`**: nothing is asked
because there is nothing they can do (`s.g2`), and a statement with no action belongs where the
target is managed — the console where they would otherwise wonder why the change is held.
`a.name-blocker` → **`email`**: one prerequisite, real work to do, and a date after which the change
can no longer be applied in this window. `a.last-call` → **`email`**, same reason, one window later.
Resisted: SMS (this is an infrastructure change window, not a payment deadline), push, and any
escalation between the two prompts — `s.g3` requires both to name **the same blocker and the same
date**, so escalating the channel between them would contradict the content rule.

**Customer touch count:** **2** on the actionable path (name the blocker, then one last call) and
**1** on the not-theirs path (inform, ask nothing). There is no third: *a blocker nobody has cleared
twice is a decision, not an oversight.*

**Final flow:**
```
Target held on a named prerequisite
  → Can the holder clear this blocker themselves?
       Theirs to clear → Name the blocker · Email  (the one prerequisite, what clearing it
       │                  involves, and the date it stops mattering)
       Not theirs      → Hold notice · In-app  (held, and why — nothing asked)
                          → Exit: held on a blocker the holder cannot clear   [class: no-action]
  → Wait (until the prerequisite is satisfied OR the change is withdrawn — to the point past which
          the target cannot be made ready in time)
       → What ended the wait?
              Blocker cleared  → Handoff: Change Readiness (RLT-242)
              Change withdrawn → Exit: change withdrawn before the blocker was cleared
       → Is a second prompt still worth sending?
              Time remains  → Last call · Email (same blocker, same date) → Wait
              Window closed → Exit: preparation window closed with the blocker outstanding
  → Wait to the window's close (until satisfied OR withdrawn)
       → What ended the wait?   ← now SHARED with the first wait, instead of a bare handoff
       → Exit: preparation window closed with the blocker outstanding
```

**State re-checks:** both waits re-read the target before acting on the timeout, so the last call is
not sent against a blocker that cleared during the window. With the `c.cleared` re-route below, the
post-last-call path also re-reads *why* the wait ended instead of assuming.

**Stop conditions:** `named_requirement_satisfied` → the handoff; `change_withdrawn` → the moot exit,
**on both waits after the fix**; the preparation window closing → the unprepared exit.

**Ownership / handoff:** `h.resume → RLT-242 Change Readiness` (non-public; renders as a name, not a
link) carrying *"what the holder was told, so readiness is not announced to them twice"* — exactly
the kind of carry the corpus should be copying. `distinctFrom` correctly separates RLT-242 (which
owns the blockers) and RLT-241 (which owns scope). **This journey must not announce readiness or the
change itself** — it names one blocker and one date, and hands over the moment the blocker clears.
Plus the TIM-268 reciprocity below.

**Canonical changes needed:**
1. **P0-equivalent.** `w.final.until`: `["named_requirement_satisfied"]` →
   `["named_requirement_satisfied", "change_withdrawn"]`.
2. `w.final.onEvent`: `h.resume` → the **existing** `c.cleared`, whose question (*"What ended the
   wait?"*) and two branches are already exactly right. Two edges, no new node; the display node
   count drops by one because `h.resume@w.final` merges into `h.resume@c.cleared`.
3. `x.held.class`: `"success"` → `"no-action"` — nothing was asked and nothing could be done.
   (`invalid-state` is the defensible alternative; `no-action` is the recommendation.)
4. `orchestration.touches[t1].mandatory` (`a.inform-hold`) and `[t2].mandatory` (`a.name-blocker`):
   `false → true`. Leave `t3` (`a.last-call`) discretionary.
5. `channelRoles`: `t1 inform-hold` → `["in-session"]`; `t2 name-blocker` → `["persistent"]`;
   `t3 last-call` → `["persistent"]`.
6. **Reciprocity with TIM-268 (I, P1-4):** `suppressions +=` `CANONICAL_RULE` id
   `s.generic-reminder` with the standard text, plus a `distinctFrom` row naming TIM-268.

**Display-only changes needed:** none. After canonical fix 2 the display drops from 15 to 14 nodes
because the second `h.resume` instance merges — that is a consequence, not a display rule.

**Renderer changes needed:** K §4.1 — after fix 5 every card here has one role and renders its
channel pill with no rank label. K P2-9 for the trigger card.

---

## RSK-273 — Usage Limit Alert

**Purpose:** Meet somebody at the moment a limit stops them with the three facts that decide what
happens next — what the limit is, when it resets, and whether more capacity can be bought —
**without any of it reading as an accusation**.

**Current flow:**
```
limit_reached_and_action_blocked  (an AUTHORITATIVE usage figure AND an action actually blocked)
  → At the wall   IN-APP + EMAIL   (which limit, the usage against it, when the window resets)
  → What path exists from here?
       Capacity is purchasable → next
       Resets on its own       → Wait
       Neither                 → Exit: blocked
  → Does the person who hit the limit hold the capacity decision?
       Theirs to decide → Capacity offer         IN-APP + EMAIL → Wait
       Held elsewhere   → Offer to the holder    IN-APP + EMAIL  (DECISION HOLDER)
                           → Notice to the blocked party  IN-APP + EMAIL  (BLOCKED PARTY)
                              → Wait
  → Wait until capacity_authorised | limit_reset | held_action_abandoned
       timeout = attribute-bound to the AUTHORITATIVE window_resets_at; "No reset point is ever invented."
       → What changed?
              Capacity authorised → Handoff: SUB-166
              Window reset        → Reset notice  IN-APP + EMAIL → Exit: reset
              Still blocked       → Exit: blocked
```

**Problems found:**
- **`a.at-the-wall` and `a.offer-self` are two customer messages sent at the same instant, to the
  same person, on the same screen, with nothing between them but two internal reads.** *"You have
  hit X, it resets on Y, and here is the capacity that would release it now — which the reset would
  release for nothing anyway (`s.g3`)"* is **one** message.
- **`a.reset`'s recipient is unstated**, and it is the only one of the five sends that omits it, on
  the only path where it is ambiguous. The schema has no recipient field; the corpus expresses
  recipient in prose, and the other four do.
- **All five sends declare the identical `["in-session","persistent"]` roles** and render
  `Primary In-app / Fallback Email`, on the journey where the recipients are provably in different
  places: the blocked party is in-session by definition, the decision holder is a different party on
  the commercial side who was not in the product when the block happened, and the reset fires days
  later at somebody who left *because they were blocked*.
- **`a.notify-blocked-party` is `mandatory: false`.** It is not an offer — it is the fact that the
  decision now sits with a named person, which `s.g4` makes a rule.
- **`a.offer-holder → a.notify-blocked-party` is drawn as a sequential chain, which reads as
  "then".** They are a parallel pair to two different people, and the action's own headline says so:
  *"separate sends to separate people on separate routes, and either one can fail without the
  other."* The canvas cannot show it.

**Final orchestration:** **conditional routing** — on the path, and on who decides — containing one
justified **parallel pair**, resolved by event-or-timeout. Both conditions earn their place:
`c.path` changes the ending (purchasable / resets / neither), and `c.decider` changes **who is
written to**, which is the strongest form of a split. The parallel pair qualifies on the brief's
exact terms: two people, two different needs, neither interruptive. **Deliberately not done:**
splitting the reset notice into two would give the corpus its only *second* parallel pair and would
spend a touch telling somebody a wait they were not in has ended. And no urgency, no SMS: being at a
usage limit is not time-critical — the reset is a known future date and nothing is lost by waiting —
and `s.g1` forbids the vocabulary of urgency here outright.

**Final customer channels:**

| touch | recipient | channel |
|---|---|---|
| `a.at-the-wall` (now carrying the self-serve offer) | the blocked person | **`in_app`** — the trigger *is* an action being blocked in the product; they are in-session by definition |
| `a.offer-holder` | the decision holder | **`email`** — a different party, on the commercial side, making a spend decision that needs a record |
| `a.notify-blocked-party` | the blocked person | **`in_app`** — still at the wall |
| `a.reset` | **the blocked person** | **`email`** — fires at the authoritative reset, potentially days later, to somebody who left because they were blocked; the brief's own rule forbids relying on in-app alone to recover them |

**Customer touch count:** **3 per recipient, maximum.** Blocked person: wall notice → blocked-party
notice → reset notice on the held-elsewhere path; wall notice (carrying the offer) → reset notice on
the theirs-to-decide path. Decision holder: **1** — one offer.

**Final flow:**
```
Limit reached and action blocked
  → What path exists from here?
       Capacity is purchasable → Does the person who hit the limit hold the decision?
       │       ├─ Theirs to decide → At the wall · In-app: which limit, the usage against it,
       │       │                      when the window resets, AND the capacity that would release
       │       │                      it now — noting the reset would release it for nothing
       │       └─ Held elsewhere   → Offer to the decision holder · Email   ┐ two sends,
       │                             (what is blocked, for whom, what would  │ two people,
       │                              release it, the reset alternative, and │ together
       │                              that the ask lapses at the reset date) │
       │                             At the wall · In-app: the three facts,  ┘
       │                             and that the decision now sits with a named someone else
       ├─ Resets on its own → At the wall · In-app: the three facts, and that it resets on its own
       └─ Neither           → At the wall · In-app: the three facts
                              → Exit: at the limit with no route to more capacity in this window
  → Wait (until capacity is authorised, the window resets, or the held action is abandoned —
          to the AUTHORITATIVE window reset; no reset point is ever invented)
  → What changed?
       Capacity authorised → Handoff: Plan Change Validation (SUB-166)
       Window reset        → Reset notice · Email · TO THE PARTY WHOSE ACTION WAS HELD
                              → Exit: window reset, capacity available again
       Still blocked       → Exit: at the limit with no route to more capacity in this window
```

**State re-checks:** `w.capacity.recheck` re-reads the entity and its limit from the system of record
before the timeout is acted on, and `a.reset`'s own headline requires the reset to be *"taken from
the authoritative reset rather than an assumed clock"* — a re-check written into the message content
itself, which is the strongest form in the corpus. Nothing is sent on a guessed date.

**Stop conditions:** `capacity_authorised` → the handoff; `limit_reset` → the reset notice;
`held_action_abandoned`, which is in the `until` set, so an abandoned action stops the journey before
the reset notice — correct, because there is no held action left to release; neither, at the window's
close → the blocked exit.

**Ownership / handoff:** `h.capacity → SUB-166 Plan Change Validation` (non-public). `distinctFrom`
is unusually good and should be left alone: RSK-199 owns the block, the count and the reset — this
journey *"adds nothing operational"* — and RSK-193 restricts in response to risk, where routing a
limit through it *"is how ordinary usage gets treated as suspicion"*. **This journey must not price
or authorise capacity** (SUB-166's), **must not assert a reset date of its own** (RSK-199's), and
**must not tell the decision holder about a reset they were not waiting on** — on a reset the
holder's ask has simply lapsed, and `measurement.guardrails` already includes `message_after_success`.

**Canonical changes needed:**
1. **Merge `a.offer-self` into `a.at-the-wall`, and move the send to sit after `c.path` and
   `c.decider`** so the single wall message carries whichever of the four shapes applies (self-serve
   offer · decision held elsewhere · resets on its own · no route). `c.path` and `c.decider` stay
   drawn as the gates that decide what the merged message carries; `a.offer-self` is removed as a
   node and as touch `t2`. *(Arbitration: this is J's "required merge" and the domain audit did not
   address it. J is binding on whether two cards are one customer message, and its reasoning —
   two sends at the same instant to the same person on the same screen — is decisive. The touch
   counts above are stated with the merge applied.)*
2. **State the recipient of `a.reset`** in the node's `does` prose and in `touches[t5].purpose`:
   *"Tell the person whose action was held that the window has reset and the action can proceed…"*
   The content only makes sense to that person — the decision holder has no held action to resume —
   the instance is keyed on the entity and its limit, and `s.g4`'s "both parties are told" is
   already satisfied at the moment of the block by the offer/notice pair. A reset is not the
   capacity decision; it is the wait ending **without** one.
3. Add a suppression making that rule explicit and checkable: *"The reset notice goes to the party
   whose action was held. The capacity decision holder is not notified of a reset they were not
   waiting on."*
4. Extend `a.offer-holder`'s purpose so the offer states that **the ask lapses at the reset date** —
   one sentence, no node, no touch — so a holder does not authorise capacity for a wait that has
   already ended.
5. `orchestration.touches[t4].mandatory: false → true` (`a.notify-blocked-party`).
6. `channelRoles`: `a.at-the-wall` → `["in-session"]`; `a.offer-holder` → `["persistent"]`;
   `a.notify-blocked-party` → `["in-session"]`; `a.reset` → `["persistent"]`.

**Display-only changes needed:** none structural. The Family B collapse of `w.capacity` into
`c.outcome` (*"Until additional capacity is authorised / What changed?"*) is one of the
provably-safe merges and reads well; keep it.

**Renderer changes needed:** K §4.1 — after fix 6 every card here has exactly one role and renders
its channel pill with no rank label. Plus a **generic two-recipient treatment**: where two
communication actions are joined by a single edge and their `Touch.purpose` names different
recipients, the pair renders as one moment with two destinations rather than as a "then" chain. No
new node type, and the rule reads only fields the whole corpus carries — never a journey id.

---

## Summary table

| ID | before pattern | after pattern | channels | touches | biggest change |
|---|---|---|---|---|---|
| TIM-61 | event-or-timeout, 4 unresolved channels | **event-or-timeout (looping) + conditional routing** | email · sms (final threshold) | 1 per policy threshold | WhatsApp and push dropped; the threshold becomes a visible routing branch |
| TIM-63 | conditional + single + event-or-timeout | **conditional routing** | email | 1 | the 4-channel prompt becomes email; `a.actor` keeps its card |
| TIM-268 | single + event-or-timeout + conditional | **event-or-timeout** | email | 2 | SMS off all three touches; cap 3→2; `w.due` renamed a timed wait with a re-read |
| TIM-274 | conditional + sequential + event-or-timeout | **combination** (with one parallel touch) | email · **email+sms on the last call** | 3 | `entity_terminated` added to `w.final.until`; two new re-reads |
| TIM-281 | 4-way conditional + single + event-or-timeout | **conditional routing (4-way)** | attempt surface: in_app else email | 2 | the answer is delivered where the question was asked; `a.establish` keeps its card |
| ACC-261 | conditional + event-or-timeout | **conditional routing** | email | 2 | the "nothing you can do" arm stops dead-ending; a permanent-restriction ending added |
| ACC-263 | segment + event-or-timeout | **segment-based** | email · **in_app on the familiar arm** | 2 | the reminder half is made reachable at all (own reminder-point Config) |
| IDN-84 | conditional routing | **conditional routing** | in_app · email (terminal) | 1 | a customer-facing statement added to the our-fault arm; `a.backoff` drawn |
| IDN-271 | parallel + event-or-timeout | **parallel** | email + sms together | 2 | `simultaneous` finally read; one copy clause; `c.route` protected by a gate |
| FIN-134 | conditional + event-or-timeout + conditional | **combination** (with one parallel touch) | email · **email+sms on the reminder** | 3 | five reciprocal rows and `s.subject` — the bound on what it may say about what the money was for |
| FIN-302 | single + event-or-timeout | **event-or-timeout** | email | 2 | a withdrawal mid-window stops being told as a reconciliation |
| DOC-214 | single | **single** | email | 1 | **none** — it stays one touch, and the `Primary` label over one channel goes |
| DOC-215 | event-or-timeout + gated reminder | **event-or-timeout** | email | 2 per signer | the one reminder becomes per-signer, so a later signer under an order can be reminded |
| INC-254 | "Primary email / fallback in-app" | **parallel** | email + in_app together | 1 per instance | the card stops asserting the opposite of the journey's design; no wait added |
| REL-284 | segment + event-or-timeout | **segment-based** | email | 3 counterparty / 1 inviter | in-app removed from a branch where the recipient has no in-app surface |
| RLT-279 | conditional + event-or-timeout | **conditional routing** | in_app (hold) · email (prompts) | 2 / 1 | `change_withdrawn` added to `w.final.until`; `x.held` reclassed off `success` |
| RSK-273 | conditional + parallel pair + event-or-timeout | **conditional routing** | in_app · email (holder, reset) | 3 per recipient | two same-instant sends merged into one wall message; the reset's recipient stated |

**Pattern distribution (17):** conditional routing **6** · event-or-timeout **4** · parallel **2** ·
segment-based **2** · combination **2** · single **1**. **Fallback: 0** — no stage in this part is a
genuine fallback, and every "Primary/Fallback" card here is a renderer artifact over data that does
not say it.

**Sections whose `Canonical changes needed` is legitimately `none` or `none to the graph`: 1** —
DOC-214 (one optional cosmetic field that the renderer fix makes moot). Two more are close and are
not padded to look busier: IDN-271 is one copy clause plus one documentation row, and TIM-281 is one
`writes` declaration plus a per-route channel statement, with `competition: "none"` explicitly left
alone.

**Sections whose `Display-only changes needed` is `none`: 6** — TIM-274, TIM-281, FIN-302, REL-284,
RLT-279, RSK-273.
**Sections whose `Renderer changes needed` is `none`: 0.** Every journey here is touched by the same
two generic rules (`ChannelPriorityRow` and the wait card), which is the finding, not an oversight.

# Phase 1b — consolidated plan, part 4

**Scope (20 journeys, in order):** `FUL-146` `FUL-148` `FUL-265` `FUL-291` `FUL-301` `REM-151`
`REM-157` `REM-305` · `SCH-266` `SCH-277` `SCH-280` `SCH-282` `SCH-303` `SCH-304` `SUB-163`
`SUB-262` `SUB-296` `SUB-297` `SUB-298` `SUB-299`.

**Sources consolidated:** `fulfillment.md` and `scheduling-subscription.md` (domain — binding on
business flow, trigger, waits, touch count, state re-checks, stop conditions, canonical edits);
`orchestration-matrix.md` (**J** — binding on orchestration pattern and final channels per stage);
`ownership.md` (**I** — binding on ownership, precedence, handoffs, `distinctFrom`);
`canvas.md` (**K** — binding on what the canvas draws and on renderer changes). Canonical facts
re-verified against `audit/public-journeys-current-state.json` per journey.

## What I arbitrated

The two domain audits and the orchestration matrix disagree about channels on **fourteen of the
forty-three communication stages in this part**, and the disagreement is systematic rather than
incidental: the domain audits read each journey's `channelStrategy.roles[].when` sentences as
selection *conditions* and therefore kept two or three channels on most touches, while J's
`UNRESOLVED` finding is that **no node anywhere in these twenty graphs reads any of those
sentences** — the order is array order, so a multi-channel stage states a reach nothing resolves.
J is binding on that column, so on every contested stage I applied J's single final channel and
recorded the domain's dissent in the section rather than splitting the difference. The visible
consequences: `FUL-265 a.arrived` becomes **SMS** and `a.no-arrival` becomes **email**, which is
the exact inverse of the fulfilment audit's table; `FUL-291`, `SUB-262`, `SUB-296`, `SUB-298` and
`SUB-299` lose the in-app their domain audits defended; `SCH-282` and `SUB-297` lose push, because
J's corpus rule is that push survives only where a deliverability test exists in the graph and
neither has one; `SCH-304 a.checkin` becomes **SMS** against the scheduling audit's explicit "drop
SMS"; and `SCH-266 a.at-risk` and `SCH-303 a.final` become **parallel** sends rather than ranked
ladders. One stage is marked **CONFLICT — ESCALATED**: `FUL-301 a.confirm`, where the fulfilment
audit's finding is the categorical *"canonical changes needed — none"* and J's verdict on the same
stage requires a one-field `channelRoles` reduction. I applied J, recorded the dissent, and state
plainly that the change adds no touch, no node, no group change and no marketing.

Two further arbitrations were not channel questions. **FUL-146 `c.estimate`** is listed by K under
G9_DEGENERATE_DECISION (a drawn Decision with one outgoing edge) while the fulfilment audit says it
must not be collapsed because its two arms — *"we have a new date"* and *"we honestly do not have
one"* — are the journey's own thesis (`s.g2`). K itself offers a disjunction ("either the content
difference becomes visible, or the decision stops being drawn as a Decision"), so I took the arm the
domain's evidence selects and expressed it as a generic out-degree rule (**R4** below) that leaves
`FUL-301 c.stands` and `FUL-148 c.class` merged, which both domain audits asked for. And **SUB-297
`a.remind`**: J priced it as a repetition ("identical content by rule, so identical channel"), but
the scheduling audit's canonical edit abolishes that stage and replaces it with an expiry-anchored
notice built on a signal already read in `c.valid`'s third branch. The domain is binding on canonical
edits and cited evidence J did not have, so the edit stands and J's row no longer describes the
stage; the replacement's channel is set by J's own push rule, not by the domain's push proposal.

## Renderer rules referenced below (generic; no journey id appears in any of them)

- **R1 — label channel rows by the pattern the touch declares, never by array position.** Replace
  `i === 0 ? primary : fallback` in `ChannelPriorityRow`. `single` → channel pill, no rank label.
  `parallel` → one row, channels side by side, "at the same time". `conditional` → each row
  labelled with its own `when`. `fallback` → "then, if <reason>", and only where the data declares
  a true fallback. Needs K §5.2's `TouchPattern` discriminant on `Touch`; until it exists, the
  honest default is the role list with **no** rank label.
- **R2 — an action with `execution: "human"` or `customerFacing: false` never enters
  `ChannelPriorityRow`.** The string `Task` must never appear where a channel appears.
- **R3 — `absorbableBookkeeping` must read structure, not localised prose.** Add
  `FlowNode.writes?: { field, mode }[]` in `canonical-view.ts` and test it instead of `meta`; lay
  the canvas out once on unlocalised nodes; `suppressed_sends` is not a journal write when the node
  is the branch's only writer of it; never absorb an action into a `wait` capsule.
- **R4 — the twin-edge merge must never reduce a drawn `condition` below two outgoing display
  edges.** Merge compound labels only where ≥ 2 edges survive.
- **R5 — a branch arm whose only target is a pure no-action record is not drawn**, with the
  `hideable()` parent test unchanged.
- **R6 — wait and condition labels obey the same `cardSummary` budget as every other card body**,
  read the timeout `Config`'s own rule and never an `until`/abort event's description, and never
  cut a Turkish phrase before its postposition.
- **R7 — a handoff headline falls back to the target's short EN name, never the full TR
  arrow-string.** A missing short TR name is a data gap, closed in both directions.
- **R8 — `splitExitState` takes the longest cut that fits the budget, never the shortest, and never
  below a floor.**
- **R9 — trigger cards read as event names**, from a display-name table keyed by event id, with the
  `SignalSource` pill kept.
- **R10 — a handoff whose target is not public renders with an affordance stating why it is not a
  link**, instead of a dead card naming a journey.
- **R11 — gates.** `G7_LOCALE_STRUCTURE`, `G8_ACTION_HIDDEN`, `G9_DEGENERATE_DECISION`,
  `H5_FAKE_PRIMARY` / `H6_FALSE_FALLBACK` / `H7_HUMAN_AS_CHANNEL`, `H1` widened to bare snake_case
  and SCREAMING_SNAKE and run over `data-canvas-edge-label`, `H8_CARD_OVERFLOW`.

---

## FUL-146 — Delivery Delay Alert

**Purpose:** Hold lateness as its own state, with the original commitment still visible behind
whatever the new estimate is, and put a decision to the counterparty only where one genuinely
exists.

**Current flow:**
```
Trigger expected_fulfillment_timing_slipped
  → [assess: original commitment, current estimate, cause, scope, impact; record DELAYED]
  → c.estimate: is there a reliable new completion estimate?
        ├ A reliable estimate → [update timing, append to commitment history]
        └ No reliable estimate → [record that none exists rather than issuing one]
  → c.recipient-impact: does the changed timing alter what the recipient plans around?
        ├ It changes their plans → a.delay-update (email · sms)
        └ No material change for them ─────────────────────┐
  a.delay-update → c.threshold: does the delay exceed the acceptable threshold?
        ├ Within tolerance → w.resume                      │
        └ Beyond tolerance → c.choice: is there a decision to make?   ←─┘  (REACHABLE TODAY)
              ├ They choose → a.offer (email · sms) → w.decision
              │     ├ on event → Wait / Reschedule → w.resume · Alternative → h.exception FUL-145
              │     │                                Cancel → h.cancel FUL-150
              │     └ on timeout → w.resume
              └ Nothing to offer → a.no-choice-update (email · sms) → h.escalate OWN-55
  w.resume: on event → h.resume FUL-144 · on timeout → h.escalate OWN-55
```

**Problems found:**
- **Zero exit nodes.** `terminalStates` is empty; all four endings are handoffs (`h.resume`,
  `h.exception`, `h.cancel`, `h.escalate`) and **all four targets are non-public**, so the reader
  sees no ending and four dead cards. Verified in the export. (fulfillment §2.1)
- **A customer can be offered a decision about a delay they were never told about.**
  `c.recipient-impact`'s *"No material change for them"* arm routes to `c.threshold`, from which
  *Beyond tolerance* → `c.choice` → `a.offer` is reachable. The first thing that person hears is
  *"would you like to wait, reschedule, take an alternative, or cancel?"* with no stated subject.
  A live logic defect. (fulfillment)
- All three touches carry the identical `persistent + urgent` pair, including the escalation
  message that tells the person there is nothing they can do. (fulfillment; J `UNRESOLVED` ×3)
- `observes` is empty on all four conditions; the journey predates the field. (fulfillment)
- `c.estimate` draws as a Decision card with exactly one outgoing edge, both answers stacked in one
  compound chip. (canvas P1-5, G9)
- **FUL-146 can open a delay narrative over an open FUL-148 recovery.** `s.g5` excludes only slips
  FUL-265 is *"already tracking under its own wait"*, and FUL-265 exits when it hands to FUL-148 —
  from which moment the exclusion stops biting, while a failed attempt is by definition a material
  slip against the timing commitment. (ownership **P1-5**)
- TR: `h.escalate` renders the target's full title *"Sorumluluk yükseltme → üst merci → çözüm veya
  iade"* where EN renders *"Ownership Escalation"*. (fulfillment §4.2)

**Final orchestration:** combination — **conditional routing** (`c.recipient-impact` → `c.threshold`
→ `c.choice` decide whether the second message is an offer or a statement, and those are different
messages to different people) plus **event-or-timeout** on `w.decision` and a bounded resume watch
on `w.resume`. Per stage J settles all three as `single`: one channel each, chosen by what the
moment is. Not sequential — the second touch is not a follow-up to the first, it is the other arm
of a fork. Not fallback: no channel here substitutes for another.

**Final customer channels:** `a.delay-update` → **SMS**. `a.offer` → **email**.
`a.no-choice-update` → **email**. (J binding. J's `a.delay-update` reason is that this arm is
reached only when the recipient planned their day around the committed window, the one thing that
matters is that it moved, and `s.g3` keeps the commitment history on the order record rather than
in the message — so the message is one line. The fulfilment audit wanted email **and** SMS here and
an SMS pointer on the offer; both are superseded. Both audits agree the escalation message loses
SMS: nothing is being asked, and an urgent-channel alarm with no action attached spends trust and
returns nothing.)

**Customer touch count:** **2** — longest path to one recipient is `a.delay-update` then *either*
`a.offer` *or* `a.no-choice-update`, which are mutually exclusive. `localCap` stays 2.

**Final flow:**
```
Trigger expected_fulfillment_timing_slipped
  → [assess · absorbed]
  → c.estimate: is there a reliable new completion estimate?
        ├ A reliable estimate ─┐   (two labelled arms, one target — kept as a real fork, R4)
        └ No reliable estimate ┴→ c.recipient-impact
  → c.recipient-impact: does the changed timing alter what the recipient plans around?
        ├ It changes their plans → a.delay-update (SMS)
        │      → c.threshold: does the delay exceed the acceptable threshold?
        │            ├ Within tolerance → w.resume
        │            └ Beyond tolerance → c.choice: is there a decision to make?
        │                  ├ They choose → a.offer (email) → w.decision
        │                  │     ├ Wait / Reschedule → w.resume
        │                  │     ├ An alternative → h.exception → FUL-145
        │                  │     ├ Cancel → h.cancel → FUL-150
        │                  │     └ on timeout → w.resume
        │                  └ Nothing to offer → a.no-choice-update (email) → h.escalate → OWN-55
        └ No material change for them → w.resume                            ← CHANGED
  w.resume (fulfillment_delay.resume)
        ├ fulfillment_resumed_or_completed → EXIT x.resumed                 ← NEW
        └ on timeout → h.escalate → OWN-55
```

**State re-checks:** `w.decision` and `w.resume` both re-read the obligation and its timing
commitment from the system of record before a timeout is acted on — keep. **Add one before
`a.offer`:** the offer must not present *cancel* or *reschedule* on an obligation that resumed while
`c.choice` was being evaluated.

**Stop conditions:** `fulfillment_resumed_or_completed` → `x.resumed`, immediately, from anywhere in
the resume watch. A counterparty choosing an alternative or a cancellation moves ownership on the
choice itself. The revised horizon expiring escalates rather than looping. Once the obligation's
latest authoritative state is a failed attempt, FUL-148 is the narrator and this journey does not
open (new `s.g5` clause).

**Ownership / handoff:** No exclusion group, correctly — the boundary that matters is with FUL-265
and it is carried reciprocally by `s.g5` and FUL-265's `s.g6`, which ownership records as the proof
that reciprocity matters more than the mechanism. After the change: one exit (`x.resumed`) and three
handoffs — FUL-145, FUL-150, OWN-55, all non-public, all text with the R10 affordance. **Must not
say:** anything about a delivery attempt that has actually failed (that is FUL-148's), and anything
about position in transit (FUL-265's). Extend `s.g5` per ownership P1-5 to name FUL-148.

**Canonical changes needed:**
- `h.resume` → **exit `x.resumed`**, class `success`, `reEntry`: *"a later slip against the revised
  commitment opens its own instance"*. `measurement.journeyOutcome.type` → `exit-or-handoff`; refs
  updated. Handing back to an execution that never handed over is not a handoff.
- `c.recipient-impact` branch *"No material change for them"*: retarget `c.threshold` → `w.resume`.
  It was routing a customer who was told nothing into a branch that could offer them a decision; if
  the slip does not alter what they plan around there is nothing to offer them either.
- `orchestration.touches`: `t1` (delay-update) drops `persistent`, keeps `urgent`; `t2`
  (no-choice-update) and `t3` (offer) drop `urgent`, keep `persistent`.
- Populate `observes` on `c.estimate`, `c.recipient-impact`, `c.threshold`, `c.choice`.
- Add a `recheck` before `a.offer` naming the obligation's resumption state.
- `suppressions[s.g5].text` — extend with the FUL-148 clause (ownership P1-5, verbatim).

**Display-only changes needed:** none. `c.estimate`'s two arms must stay two labelled arms (R4);
they are not a collapse candidate.

**Renderer changes needed:** R1, R4, R6, R7, R9, R10, R11.

---

## FUL-148 — Failed Delivery Recovery

**Purpose:** Recover a failed delivery according to why it failed, within a bounded number of
attempts, and hand the obligation on when the budget or the recipient's answer ends it.

**Current flow:**
```
Trigger authoritative_delivery_attempt_failure
  → [classify into the class the executor actually reported]
  → c.class: what kind of failure was it?
        ├ Correctable information needed → a.correct (email · sms)
        │     → w.correction ├ on event → c.budget
        │                    └ on timeout → h.return REM-151
        ├ A reattempt is safe ─┐
        ├ No usable reason given ┴→ c.budget: is a reattempt available?
        │         ├ Attempts remain → c.alternate: would an alternative route serve better?
        │         │     ├ Policy authorises it → [alternative route] → h.retry FUL-147
        │         │     ├ The recipient's to choose → a.offer-route (email · sms)
        │         │     │      → w.route-choice ├ Selected → [alt route] → h.retry FUL-147
        │         │     │                       ├ Declined all → h.return REM-151
        │         │     │                       └ on timeout → [reattempt] → h.retry FUL-147
        │         │     └ Reattempt same route → [reattempt] → h.retry FUL-147
        │         └ Exhausted → h.return REM-151
        ├ The recipient refused it → h.return REM-151
        └ Damaged → h.exception FUL-145
```

**Problems found:**
- **Zero exit nodes.** All three endings are handoffs; `h.retry` → FUL-147 is non-public,
  `h.exception` → FUL-145 is non-public, only `h.return` → REM-151 is public. Verified.
  (fulfillment §2.1)
- **18 display cards for a 2-touch journey.** `h.return` is instanced 4× and `h.retry` 2×. The
  per-parent instancing rule is working as designed; the effect is that a third of the canvas is one
  handoff repeated. (fulfillment; canvas P2-7)
- Both touches carry the identical `persistent + urgent` pair with nothing selecting between them.
  (J `UNRESOLVED` ×2)
- **`distinctFrom` is empty.** FUL-148 is handed cases by FUL-265 and hands them to REM-151 and
  states its boundary with neither — and, per ownership, it is also the unstated counterparty of
  FUL-146. (fulfillment; ownership P1-5)
- `c.budget` is not re-read after `w.correction` returns; the bounded budget may have been spent by
  a parallel attempt while the correction was outstanding. (fulfillment)
- TR: `w.route-choice` reads *"Alıcı bir alternatif güzergâh seçene"* — the sentence stops before
  its postposition. (fulfillment §4.1)

**Final orchestration:** combination — **conditional routing** on the failure class (`c.class`, five
branches, which is the journey's entire reason to exist: *refused* is a decision by the recipient and
*unavailable* is an absence, and `s.g3` exists because treating the first as the second keeps
redelivering to someone who has already said no) plus **event-or-timeout** on `w.correction` and
`w.route-choice`. Per stage J settles both as `single`. Not sequential — the correction request and
the route offer are alternatives on different failure classes, never a cadence.

**Final customer channels:** `a.correct` → **SMS**. `a.offer-route` → **email**. (J binding, and J
names `a.correct` one of the corpus's seven surviving SMS stages: the courier is mid-round, the
parcel goes back if nobody answers, and the whole message is one missing fact with an imminent
consequence. `a.offer-route` is a collection point, a different window or a different executor, each
with addresses and times and a stated budget that does not reset — read side by side. The fulfilment
audit wanted email alongside SMS on the correction; superseded.)

**Customer touch count:** **2** — longest path to one recipient is `a.correct` then `a.offer-route`
(correction provided → budget remains → recipient's to choose). `localCap` stays 2.

**Final flow:** shape unchanged from Current flow, with `h.retry` becoming an exit:
```
        … c.alternate
              ├ Policy authorises it → a.alternate → EXIT x.reattempt-scheduled     ← NEW
              ├ The recipient's to choose → a.offer-route (email) → w.route-choice
              │        ├ Selected → a.alternate → EXIT x.reattempt-scheduled        ← NEW
              │        ├ Declined all → h.return → REM-151
              │        └ on timeout → a.reattempt → EXIT x.reattempt-scheduled      ← NEW
              └ Reattempt same route → a.reattempt → EXIT x.reattempt-scheduled     ← NEW
```

**State re-checks:** both waits already re-read the attempt and its obligation before a timeout is
acted on. **Add one:** `w.correction` gains a `recheck` naming the attempt budget, because the edge
already routes its on-event arm into `c.budget` and the budget may have moved.

**Stop conditions:** the policy attempt limit being reached ends recovery at REM-151, not at a
further attempt (`s.g2` — the budget does not reset). A recipient declining every alternative ends it
the same way. `delivery_correction_provided` moves it forward rather than stopping it. A damaged item
leaves for FUL-145 immediately.

**Ownership / handoff:** no exclusion group. After the change: one exit (`x.reattempt-scheduled`) and
two handoffs — REM-151 (public, links; mints a fresh `issue_id` because FUL-148 has no issue concept)
and FUL-145 (non-public, text with the R10 affordance). **While this journey holds a failed attempt
it is the one that tells the recipient about the obligation's timing** — FUL-146 must not narrate a
slip beside it and FUL-265 must not narrate position. **Must not say:** anything about a remedy being
owed; that is REM-151's assessment and REM-157's decision.

**Canonical changes needed:**
- `h.retry` → **exit `x.reattempt-scheduled`**, class `success`, `reEntry`: *"a further attempt that
  also fails opens its own instance against its own `delivery_attempt_id`"*. The entity key is one
  attempt; when a new attempt is scheduled this instance's subject has ceased to exist, which is an
  exit and not a transfer. The `carries` block on the old handoff (attempt history, remaining budget,
  correction or route change applied) becomes a `writes` on `a.alternate` / `a.reattempt`.
  `measurement.journeyOutcome.type` → `exit-or-handoff`; refs updated.
- `orchestration.touches`: `t1` (correct) drops `persistent`, keeps `urgent`; `t2` (offer-route)
  drops `urgent`, keeps `persistent`.
- Add `recheck` to `w.correction` naming the attempt budget.
- `distinctFrom` += **FUL-146**, **FUL-265**, **REM-151** (it has none at all today). FUL-265 —
  *"FUL-265 reports what the executor says about an obligation in motion; this opens on a single
  attempt already known to have failed, and its subject is the attempt, not the obligation."*
  REM-151 — *"REM-151 asks whether an obligation is unresolved after something was delivered; this
  runs while nothing has been delivered at all and a further attempt is still possible."* FUL-146 per
  ownership P1-5.
- `suppressions` += `CANONICAL_RULE` `s.narrator` (ownership P1-5, verbatim): while this journey
  holds a failed attempt it is the one that tells the recipient about the obligation's timing.
- Populate `observes` on `c.class`, `c.budget`, `c.alternate`, `c.route-answer`.

**Display-only changes needed:** none. The 18-card canvas is answered by the exit conversion (two of
the six shared-terminal instances become a different, better ending) and by R5, not by a special case
in the layout. `c.class`'s merged *"A reattempt is safe · No usable reason given"* edge stays merged —
it is honest authoring (`s.g4` forbids inventing a reason) and R4 leaves it alone because four edges
still survive.

**Renderer changes needed:** R1, R4, R6, R7, R10, R11.

---

## FUL-265 — Delivery Tracking

**Purpose:** Carry the recipient from "it left our hands" to "they agree it was discharged
correctly" — because arriving and being agreed to have arrived correctly are two different facts and
only one of them has a recipient as its source.

**Current flow:**
```
Trigger obligation_handed_to_delivery_executor
  → a.dispatch (email · sms)
  → w.delivery (dispatch_to.delivery; until delivery_confirmed | delivery_failed
                | delivery_delay_reported)
      ├ on timeout → a.no-arrival (email · sms) → x.unresolved [a HANDOFF to FUL-148]
      └ on event → c.delivery: what did the executor authoritatively report?
            ├ Delivered → a.arrived (email · sms)
            │     → c.acceptance: does acceptance carry any consequence here?
            │         ├ Acceptance is meaningful → a.accept-request (email · sms)
            │         │     → w.acceptance ├ on event → c.accepted
            │         │     │                    ├ Accepted → EXIT x.accepted
            │         │     │                    └ Issue raised → h.issue FUL-149
            │         │     └ on timeout → [record] → EXIT x.finalized
            │         └ Delivery is the end of it → EXIT x.delivered
            └ Not delivered → a.no-arrival → x.unresolved [HANDOFF FUL-148]
```

**Problems found:**
- **`delivery_delay_reported` wakes the wait and has nowhere to go.** `w.delivery.until` lists three
  events; `c.delivery` has two branches. An in-transit slip falls into *Not delivered* → handoff to
  **Failed Delivery Recovery**. A parcel running a day late is told it has not arrived and is opened
  as a failed-delivery case. (fulfillment §2.3)
- **That defect makes FUL-146's one-sided eligibility clause point at nothing.** `FUL-146 s.g5`
  declines to open a delay narrative *because FUL-265 is said to be tracking the slip under its own
  wait*; FUL-265 holds no such state. The praised clause is aspirational until the branch exists.
- **`x.unresolved` is a handoff wearing an exit's id.** `kind: "handoff"`, `to: "FUL-148"`, sitting in
  `measurement.journeyOutcome.refs` beside three real exits, with a `carries` block that mints a
  fresh `delivery_attempt_id`. Any consumer keying off the `x.` prefix reads the Stop cell and the
  Handoff cell as the same thing. Verified. (fulfillment §2.2)
- **All four touches carry the identical `persistent + urgent` pair** — four messages about four
  different facts given one treatment set once on the journey. (fulfillment; J `UNRESOLVED` ×4)
- `a.no-arrival`'s card body is the one non-wait card still at the 120-character budget boundary
  after `cardSummary`. (canvas P2-8)
- TR truncation on `w.delivery`: *"Teslimat yürütücü"*. (fulfillment §4.1)
- One-sided `distinctFrom`: FUL-291 names FUL-265, FUL-265 does not name back. (ownership D-15)

**Final orchestration:** combination — **sequential** (each touch is a later statement about the same
dispatched obligation, reached only through a state read) with a **conditional routing** point at the
executor's report (`c.delivery`), a **bounded loop** on the revision arm, and **event-or-timeout** on
`w.delivery` and `w.acceptance`. Justified at 3 touches (4 with a revision) because each states a
*different authoritative fact about a different moment* — it left, the window moved, it arrived or did
not, and silence from this date counts as acceptance. None repeats another, and the acceptance request
is sent only where acceptance carries a consequence.

**Final customer channels:** `a.dispatch` → **email**. `a.revised` *(new)* → **SMS**.
`a.arrived` → **SMS**. `a.no-arrival` → **email**. `a.accept-request` → **email**.
(J binding, and this is the sharpest reversal in this part: the fulfilment audit put email on
`a.arrived` and email+SMS on `a.no-arrival`; J puts SMS on `a.arrived` — *"the one moment in the
journey genuinely time-critical to the person: something is at their door now, and the consequence of
not knowing is theft or weather; the proof-of-delivery evidence lives on the order record"* — and
email on `a.no-arrival`, because that message has to distinguish a confirmed failure from an executor
we have lost sight of (`s.g4`) and say what happens next, which is content that needs room. J's list
of surviving SMS stages names `FUL-265 a.arrived` explicitly. `a.revised` has no J row because the
stage does not exist yet; it takes SMS on J's own reasoning — the customer's day has changed, one
fact, one line — which is also what the fulfilment audit proposed.)

**Customer touch count:** **3** normally (dispatch · arrived-or-not-arrived · acceptance request),
**4** on the one permitted revised window. Raise `contact.localCap` 3 → 4 with the revision as its
stated reason.

**Final flow:**
```
Trigger obligation_handed_to_delivery_executor
  → a.dispatch (email)
  → w.delivery (until delivery_confirmed | delivery_failed | delivery_delay_reported)
      ├ on timeout ──────────────────────────────────────┐
      └ on event → c.delivery: what did the executor authoritatively report?
            ├ A revised window was reported → a.revised (SMS)          ← NEW BRANCH + ACTION
            │      → back to w.delivery, re-armed on the revised window
            │        [bounded: dispatch_to.revisions = 1]
            ├ Delivered → a.arrived (SMS)
            │     → c.acceptance: does acceptance carry a consequence?
            │         ├ Acceptance is meaningful → a.accept-request (email) → w.acceptance
            │         │        ├ Accepted → EXIT x.accepted
            │         │        ├ Issue raised → h.issue → FUL-149
            │         │        └ on timeout → EXIT x.finalized
            │         └ Delivery is the end of it → EXIT x.delivered
            └ Not delivered ───────────────────────────────┤
                                                           └→ a.no-arrival (email)
                                                                 → h.no-arrival → FUL-148   ← RENAMED
```

**State re-checks:** both waits already re-read the dispatched obligation from the system of record
before a timeout is acted on. **The re-armed wait must re-read on each re-arm**, and the revision
counter must be read from the instance, never from the event.

**Stop conditions:** `delivery_accepted` → `x.accepted`. `delivery_issue_raised` → FUL-149.
Acceptance window expiry → `x.finalized`, kept forever distinguishable from `x.accepted` (`s.g5`).
A **second** revision, or a confirmed non-arrival, → FUL-148.

**Ownership / handoff:** no exclusion group and it does not need one. Its boundary with FUL-146 is a
one-sided eligibility clause on each side (`FUL-146 s.g5` cedes in-transit slips here, `FUL-265 s.g6`
cedes pre-dispatch slips there) — ownership records this pair as proof that reciprocity, not a
group, is the mechanism. The revision branch is what makes that clause true rather than aspirational.
Handoffs: `h.no-arrival` → FUL-148 (public, links), `h.issue` → FUL-149 (non-public, text + R10).
**Must not say:** it never re-confirms the order (FUL-301's), never explains what to do with the
thing (FUL-291's), and never claims a window the executor has not committed to.

**Canonical changes needed:**
- Rename `x.unresolved` → **`h.no-arrival`**; update the one `measurement.journeyOutcome.refs` entry.
  Not `h.unresolved`: the node is reached from `c.delivery`'s *Not delivered* arm and from
  `w.delivery`'s timeout, and both mean *it did not arrive*, which is what the card should say.
- `c.delivery`: add branch *"A revised window was reported"*, `observes: "delivery_delay_reported"`.
- New action **`a.revised`**, `execution: "communication"`, target `w.delivery`.
- New `Config` **`dispatch_to.revisions`** (`required: true`, default 1) and a revision-count read on
  `w.delivery`'s re-arm.
- `orchestration.touches`: add `t1b`, stage `revised-window`, roles `["urgent"]`, with
  `destination.mustNotClaim: ["a window the executor has not actually committed to"]`. Drop `urgent`
  from `t1` (dispatch) and from `t4` (accept-request); drop `persistent` from `t3` (arrived); drop
  `urgent` from `t2` (no-arrival).
- `contact.localCap` 3 → 4, reason stated.
- New suppression: *"A revised window is stated once. A second revision is not a third narrative — it
  is an executor who cannot hold a window, and the obligation moves to recovery."*
- `distinctFrom` += **FUL-291** (ownership D-15) and **FUL-148** (the reciprocal of FUL-148's new row).

**Display-only changes needed:** none. The bounded loop **must be drawn** — a back edge to the wait is
a real path and hiding it would erase the journey's only loop.

**Renderer changes needed:** R1, R6, R9, R10, R11 (H8 and the widened H1 both bear on this canvas).

---

## FUL-291 — Post-Purchase Follow-Up

**Purpose:** Once what was owed has actually arrived, send the one thing that makes it useful — how
to start with it, how to look after it, what sensibly follows — and nothing else.

**Current flow:**
```
Trigger authoritative_delivery_completion
  → w.settle (post_purchase_followup.settle; abort on post_completion_issue_reported
              | permission_withdrawn)
  → c.state: is a follow-up still the right thing to send?
        ├ Follow-up due → c.sendable [hidden gate]
        │      ├ Sendable → a.followup (email · in_app · push) → EXIT x.followed-up
        │      └ Nothing to say, or suppressed → [record] → x.no-action (not drawn)
        ├ A problem is open → EXIT x.superseded
        └ No longer reachable → EXIT x.closed
```

**Problems found:**
- **Three channel roles with `fallback: "next-eligible-role"`**, so the card reads as a three-step
  ladder — the only journey in the fulfilment set whose chips make that claim. (fulfillment; J
  `UNRESOLVED`)
- **Push cannot carry this message.** Its entire value is that it is keepable and returnable-to —
  setup instructions, care guidance, what sensibly follows. Push is transient by construction. It is
  present because the role existed. (both audits; J's corpus rule: push survives only where a
  deliverability test exists in the graph, and there is none here)
- **The collapsed wait card announces an abort event as the wait's duration.** `c.state`'s EN card
  reads *"Until a concrete problem with a completed fulfillment · Decision: is a follow-up still the
  right thing to send?"*. The Family-B duration strip is rendering `post_completion_issue_reported` —
  an **abort** event — where the timeout `Config`'s rule belongs. The card tells the reader the
  journey waits for a problem to be reported, the exact opposite of `s.issue`. TR is correct, so this
  is EN-side and the locale sweep cannot see it. (fulfillment §4.1 — the serious one)
- Nothing else. `s.substance` (*"where nothing useful is recorded against what was delivered, nothing
  is sent"*) is the best-authored suppression in the domain and `s.rating` correctly keeps FBK-41 out.

**Final orchestration:** **single.** One touch, one moment, one decision before it. No sequence, no
fallback, no conditional routing between channels that changes the path. A journey may legitimately
be `Trigger → Wait → Decision → Email → Exit`, and this is one of them.

**Final customer channels:** **email**, alone. (J binding: guidance content, sent once, to somebody
who has a physical or delivered thing in front of them and *no reason to be in the product*; `s.status`
and `s.rating` already strip out everything that would have made it a notification. The fulfilment
audit kept in-app alongside email and removed only push; J removes both. Recorded dissent: the
`in-session` role's own `when` says "the next step is taken inside the product", but nothing in the
graph reads it, so it is an assertion rather than a route.)

**Customer touch count:** **1.** `localCap` stays 1; the required `post_purchase_followup.cooldown`
stays (completions landing close together produce one follow-up, not one each).

**Final flow:** as current, on email alone, with the wait card corrected. No node is added, removed or
re-routed.

**State re-checks:** `w.settle.recheck` re-reads the fulfilment record, any problem raised against it,
and the person's permission, from the systems that own them, before the one and only send. This is the
model re-check in this corpus and nothing needs adding.

**Stop conditions:** `post_completion_issue_reported` ends the instance at `x.superseded` the instant
it arrives — the remedy lifecycle owns the completion and this journey does not queue beside it.
`permission_withdrawn` → `x.closed`. Nothing useful recorded against what was delivered → nothing sent
(`s.substance`).

**Ownership / handoff:** `post-purchase-welcome`, `scope: person`, `onLoss: suppressed`, **below
FUL-301 and above RET-290**; all three sides declared and agreeing. No handoffs — a problem *ends* this
journey rather than being passed on, because the remedy lifecycle opens from its own event. The
boundary with **RET-290 stays**, stated from this side: different subject (*the thing that arrived* vs
*the person having become a customer*), different trigger and entity (`authoritative_delivery_completion`
keyed `person_id + fulfillment_id`, every completion, vs `first_purchase_completed`, once per person
ever), different failure mode (guidance landing before the thing does, vs a bounceback spent on
somebody who was about to buy anyway). **They are not variants and must not be merged:** a completion
that is also a first purchase produces two ordered messages about two different things. **Must not
say:** welcome, a bounceback, anything about the relationship, and it never confirms the order
(`s.confirmation`).

**Canonical changes needed:** `orchestration.touches[t1].channelRoles` → `["persistent"]` (drop
`in-session` and `low-friction`); drop `push` and `in_app` from `channelsDeclared`;
`channelStrategy.fallback` becomes irrelevant at one role and should be stated as such rather than left
saying `next-eligible-role`.

**Display-only changes needed:** none.

**Renderer changes needed:** R1, **R6 — the collapsed-wait duration strip must read the timeout
`Config`'s own rule and never an `until` event's description; abort events belong in the detail panel.
This is generic and affects every Family-B-collapsed wait in the corpus**, R9, R11.

---

## FUL-301 — Order Confirmation

**CONFLICT — ESCALATED** (channels only; see the last paragraph of *Final customer channels*).

**Purpose:** State once, at the moment the fulfilment record opens, exactly what the business has
taken on and what it has not — the question every later message about this order assumes has already
been answered.

**Current flow:**
```
Trigger fulfillment_obligation_accepted
  → c.stands: does the accepted obligation still stand, and what does it cover?
      ├ Accepted in full ─┐
      ├ Accepted in part ─┴→ c.sendable [hidden gate]
      │                         ├ Sendable → a.confirm (email · sms · in_app)
      │                         └ No route → [record reason] → x.no-action (not drawn)
      └ Nothing stands → EXIT x.void
  a.confirm → w.stands (order_confirmation.record_window; until handed-to-executor
                        | cancellation-effective)
      ├ on timeout → EXIT x.confirmed
      └ on event → c.outcome: what became of the order?
            ├ It started moving → EXIT x.confirmed
            └ Cancelled before it moved → h.cancelled → FUL-150
```

**Problems found:**
- **Three channels on the one transactional record every other post-purchase journey defers to.**
  J ranks this fourth in its nine-to-do-first list: sending one transactional record on three
  channels turns it into three records, which is exactly the duplicate `s.once` exists to prevent,
  and `s.partial` requires the accepted scope, the declined scope and the reason to be in the **same
  message** while `s.record` requires the amount as the financial record holds it — none of which
  fits an SMS or survives an in-app session.
- **The EN wait card reads `"Until a prepared item"`** — nonsense. The TR card on the same node reads
  correctly (*"Sipariş harekete geçene ya da iptal edilene kadar"*). The EN label derivation is
  producing a phrase from something other than the wait's own `Config` rule, and the locale sweep
  cannot see it because English prose on an English route is not a leak. (fulfillment §4.1)
- **FUL-301 and SCH-277 do not distinguish an order from a reservation.** Neither names the other in
  any field; a business that sells a reservation as an order opens both records on one transaction and
  confirms both. (ownership **P1-7**, F5 re-verified)
- **`post-purchase-welcome` declares `scope: "person"` while this journey's own precedence says "the
  order's own"** — the difference between a contact-pressure judgment and an ownership claim over
  another order, and no field says which it is. (ownership **P2-1**)
- Nothing else. This journey is otherwise the reference implementation of its domain.

**Final orchestration:** **single**, with one trailing **event-or-timeout** observation window that
sends nothing. There is exactly one thing to say and exactly one moment at which it is true. No
sequence, because a second message would read as a second order (`s.once`). No fallback, because no
channel is unavailable. The trailing wait exists only to decide which of two endings the record
reached.

**Final customer channels:** **email**, alone. — **CONFLICT — ESCALATED.** J (binding column) settles
`a.confirm` as `single` / email on the evidence above. The fulfilment audit's verdict is *"canonical
changes needed — none"*, keeping email + SMS + in-app on the grounds that SMS is conditioned by its
role's `when` (*"the accepted obligation carries a time-bound action the person has to take"* — a
collection slot, a confirmation owed back) and in-app by *"where the order was placed inside the
product"*. **I applied J**, because J's `UNRESOLVED` finding is that no node in this graph reads either
`when`, and because J's reason is specific to this journey's own suppressions rather than to the role
vocabulary. **The dissent is recorded, and the product owner should confirm it**, because it is the one
place in this part where a horizontal verdict overturns a domain audit's categorical "change nothing".
What it costs: one field. `orchestration.touches[t1].channelRoles` goes from three roles to one. **It
adds no touch, no node, no edge, no marketing and no group change**, and every one of the six authored
suppressions is untouched.

**Customer touch count:** **1.** `mandatory: true`, `pressureClass: "none"`,
`order_confirmation.discretionary_touches` = 0. Unchanged.

**Final flow:** exactly as current, on email alone, with the EN wait label corrected. **No node is
added, removed or re-routed.**

**How FUL-301 is kept from acquiring work it does not need — the explicit do-not list:**
- No second touch, no reminder, no *"your order is being prepared"*, no post-purchase marketing, no
  cross-sell, no review request. Six authored suppressions already forbid all of it (`s.accepted`
  `s.record` `s.partial` `s.once` `s.status` `s.marketing`) and **none is relaxed**.
- No exclusion-group change. It is and stays **highest in `post-purchase-welcome`** with
  `onLoss: "suppressed"`, so FUL-291 and RET-290 wait behind it.
- The `Accepted in full` / `Accepted in part` branches are **not** split into two message cards. They
  merge onto one display edge because both go to the same node; the split changes what the message
  *says* (a declined scope must be stated in the same message, `s.partial`) and not where the customer
  goes. Content, not path. R4 leaves the merge alone because two edges still survive.
- `c.sendable` stays hidden. It is the textbook implementation gate: its short arm passes through a
  bookkeeping hop before exiting, which is the corpus's own signal for "may the touch go out?".
- **RET-290 First Purchase Thank You stays distinct.** Different entity, different trigger, different
  once-ness. Nothing from RET-290 moves here.

**State re-checks:** one, and it is enough — `w.stands.recheck` re-reads the fulfilment record and any
cancellation against it from the systems that own them, before the timeout is acted on.

**Stop conditions:** `fulfillment_cancellation_effective` → `x.void` before the send, `h.cancelled`
after it. `fulfillment_handed_to_delivery_executor` → `x.confirmed`; from that instant FUL-265 owns the
narration and this journey is silent forever.

**Ownership / handoff:** highest in `post-purchase-welcome`; never itself deferred (transactional); the
contest is declared from this side so the other two have a named side to defer to — ownership records
that clause as the house style. One handoff, `h.cancelled` → FUL-150 (non-public, text + R10).
`distinctFrom` FUL-265, FUL-146, FUL-291, RET-290, FIN-131, all five correct. **Must not say:**
anything about progress, position or lateness (`s.status` — FUL-265's and FUL-146's), and it never
confirms the obligation to *pay* that arises from the same event (FIN-131's).

**ARBITRATION RESOLVED (Phase 1b):** FUL-301 - RESOLVED, FLAGGED FOR PRODUCT SIGN-OFF: J's channel reduction is applied (channelRoles three roles -> one). The fulfilment audit's "none" verdict is overturned on journey-specific evidence J holds and the domain audit did not address: three channels asserting one transactional record that is sent once is not a design choice with alternatives, it is the same fact stated three ways. Cost is exactly one field; no touch, node, edge, marketing content or competition-group change. All six of FUL-301's existing suppressions stay untouched. This is the only section in the plan where a horizontal audit overturns a domain audit's explicit "change nothing", so it is the one place a human product owner should look before implementation proceeds.

**Canonical changes needed:**
- `orchestration.touches[t1].channelRoles` → `["persistent"]`; drop `sms` and `in_app` from
  `channelsDeclared`. **This is the escalated change and the only one that touches behaviour.**
- `distinctFrom` += **SCH-277**, and `suppressions[s.status]` extended, per ownership P1-7 / F5 (the
  reciprocal row is specified in SCH-277's section below, so the pair lands in one edit).
- `contact.competition.precedence` — append the ownership P2-1 sentence stating that the group's scope
  is the person rather than the order deliberately, as a contact-pressure judgment and not an ownership
  claim over another order.

**Display-only changes needed:** none.

**Renderer changes needed:** R1, **R6 — the EN wait-label derivation must read the wait's own `Config`
rule**, R9, R10, R11.

---

## REM-151 — Post-Purchase Issue Recovery

**Purpose:** Establish whether something delivered has left an obligation unresolved, and which
recovery mechanism could satisfy it.

**Current flow:**
```
Trigger post_completion_issue_reported
  → [capture: issue id, what it concerns, the problem as reported, scope, when, evidence]
  → c.duplicate: does an existing recovery case already cover this problem?
        ├ Already covered → [attach evidence to the open case] → EXIT x.attached
        └ Nothing open → [assess: unresolved obligation, or an experience that fell short?]
              → c.actionable: is there an actionable unresolved obligation?
                    ├ Actionable → [classify the remedy route] → h.remedy → REM-157
                    └ Not actionable → a.acknowledge (email) → EXIT x.no-defect
```

**Problems found:**
- **It looks like the only customer message is on the branch where nothing happened — and that reading
  is wrong, but nothing on the page says so.** On the actionable branch the person hears nothing from
  REM-151 because **REM-157 speaks immediately**: REM-157 has no entry wait, so `h.remedy` → `a.present`
  is one hop and the remedy options are the next thing that arrives. An acknowledgement here followed a
  second later by an options message would be two senders on one problem — exactly what REM-305's
  `s.contest` exists to prevent. **The current design is right; do not add a touch.** What is missing is
  the *statement* of it. (fulfillment)
- **`x.no-defect` renders as "Heard" / "dinlendi".** The canonical state is *"heard; no unresolved
  obligation and no remedy owed"*; `splitExitState` cut at the semicolon and left a one-word card on the
  branch that most needs explaining — the branch where the answer is no. (fulfillment §4.3)
- **No `distinctFrom` for REM-305 or FUL-148**, both of which hand it cases, nor for RET-26, the
  library's general service-recovery journey whose evidence explicitly includes a failed fulfilment.
  (fulfillment; ownership D-18, §2.7)
- `observes` empty on both conditions.
- **Raised, not decided:** `REM-305 h.owner` → REM-151 assumes every still-open support request is a
  post-completion issue. REM-151's stated eligibility is *"a concrete problem with a completed fulfilment
  or service"*; REM-305 opens on **any** service request. See REM-305's section — the decision belongs to
  whoever owns the remedy arc.

**Final orchestration:** **single.** No wait anywhere in the graph, deliberately — one of only seven
journeys in the 69 with none, and it should stay that way. A reported issue is answered now, not after a
window; one assessment pass, one answer. J agrees (`single`, and it is one of only two stages in this
part already declaring a single channel).

**Final customer channels:** **email**, alone, on the not-actionable branch. (J: already correct. Telling
somebody their report does not describe an unresolved obligation is a decision they may want to contest;
it needs a route they can reply to and keep. No in-app — the person did not necessarily report it in the
product. No SMS — nothing is time-bound and nothing is asked.) Both audits agree; no arbitration needed.

**Customer touch count:** **1.** `localCap` stays 1.

**Final flow:** unchanged.

**State re-checks:** none needed — there is no interval to re-check across. `c.duplicate` reads the
open-case state at entry, which is the only read that matters.

**Stop conditions:** an existing case covering the same obligation absorbs the report at `x.attached`
(`s.g4` — two remedies on one obligation produce two refunds and the second is found by accounting). An
assessment finding no unresolved obligation ends it at `x.no-defect`, with the acknowledgement sent.
`s.g3` — not every issue defaults to a refund — governs the classify step.

**Ownership / handoff:** **second in `service-request`: below REM-305, above REM-157** — the order is
declared from all three sides, and ownership records this group as one of the few backed by a real edge
(`REM-305 h.owner → REM-151`) rather than by precedence alone. One handoff → REM-157 (public, links),
carrying the problem stated as *what is owed* rather than as what was complained about. Entered from
three places: a direct report, `FUL-148 h.return` (which mints a fresh `issue_id` because FUL-148 has no
issue concept) and `REM-305 h.owner`. **Must not say:** anything about the money — `s.money` names
FIN-137 as the decider and FIN-302 as the announcer — and it never presents remedy options, which is
REM-157's first message.

**Canonical changes needed:**
- Add the silence statement to the journey's own `reusableRule` / entity note: *"On the actionable branch
  this journey says nothing, because remedy selection speaks on the same hop. Acknowledging an issue and
  then presenting remedy options a moment later is two senders on one problem."* This is the finding that
  most needs to be visible to a reader, and it is a prose change, not a graph change.
- `distinctFrom` += **REM-305**, **FUL-148**, **RET-26** (ownership D-18, both directions).
- Populate `observes` on `c.duplicate` and `c.actionable`.

**Display-only changes needed:** none. The four absorbed internal actions (`a.capture`, `a.attach`,
`a.assess`, `a.classify`) are correctly absorbed; 11 canonical → 7 display is the right read.

**Renderer changes needed:** R1, **R8 — `splitExitState` must take the longest cut that fits the budget,
never the shortest, and never below a floor**, R9, R11.

---

## REM-157 — Remedy Confirmation

**Purpose:** Choose the remedy that would actually satisfy the unresolved obligation, from the ones that
genuinely exist — and tell the person which one it is.

**Current flow:**
```
Trigger remedy_decision_required
  → [identify the unresolved obligation precisely]
  → [evaluate the remedies policy actually makes available]
  → c.choice: does the counterparty choose between remedies?
        ├ They choose → a.present (email · in_app)
        │      → w.selection (until remedy_selected)
        │          ├ on event → c.route
        │          └ on timeout → [apply the policy default, recorded as "no selection made"]
        │                             → c.route
        └ No choice to make → c.route
  c.route: which remedy resolves the obligation?
        ├ Correction or reperformance → h.correction → REM-156
        ├ Replacement → h.replacement → REM-155
        ├ Return, before anything else → h.return → REM-152
        ├ Refund or credit → h.financial → FIN-137
        └ No remedy is owed → a.no-remedy (email · in_app) → EXIT x.no-remedy
```

**Problems found:**
- **The journey called Remedy Confirmation does not confirm the remedy.** Four of `c.route`'s five
  branches — every branch on which a remedy is actually applied — send **nothing**. The only message on
  the outcome side is *"no remedy is owed"*. Two specific people get nothing: the person for whom there
  was no choice to make, who hears nothing at all from this journey; and the person who **was offered a
  choice and did not answer**, for whom `a.default` applies the policy default and records *"no selection
  made"* and who is never told what was chosen for them. All four receiving journeys are non-public, so a
  library reader sees four unopenable cards and one message. (fulfillment)
- **A TR collision on the canvas.** `h.return` (REM-152 Return Request) and `h.financial` (FIN-137 Refund
  Request) both render as *"İade Talebi"* — two different handoff cards with an identical Turkish label
  on one canvas. Turkish uses *iade* for both; the EN canvas distinguishes them and the TR canvas cannot.
  (fulfillment §4.2)
- **TR `h.replacement` leaks the target's full title** *"Değişim kararı → tahsis etme → teslim etme →
  onaylama"* where EN renders *"Replacement Fulfillment"*. (fulfillment §4.2)
- `observes` empty on all three conditions.
- One-sided `distinctFrom`: SUB-298 names REM-157, REM-157 does not name back. (ownership D-24)

**Final orchestration:** combination — **conditional routing** (`c.choice`: does the counterparty
genuinely choose between remedies at all? — it decides whether a message is sent and a window opened, or
whether the route is taken directly) plus **event-or-timeout** on `w.selection`. Per stage J settles
both existing stages as `single`. Not sequential: the two messages are a presentation and its answer, one
state change apart.

**Final customer channels:** `a.present` → **email**. `a.no-remedy` → **email**.
`a.confirm-remedy` *(new)* → **email**. (J binding on the two existing stages: options with consequences
have to be read, compared and referred back to, and the refusal is the one message somebody is most
likely to quote or escalate. In-app is dropped from both. **No SMS** — choosing between a correction, a
replacement, a return and a refund is not an SMS decision even though `remedy_selection.selection` has a
deadline. The new stage has no J row; it takes email for the same reasons as its two siblings, which is
also the consistent reading of J's verdict on this journey. The fulfilment audit proposed email + in-app
on all three; the in-app is superseded.)

**Customer touch count:** **2** on the longest path — `a.present` then `a.confirm-remedy`, or `a.present`
then `a.no-remedy`; **1** where there was no choice to make. `localCap` stays 2.

**Final flow:**
```
Trigger remedy_decision_required
  → [identify the obligation · evaluate available remedies — absorbed]
  → c.choice: does the counterparty choose between remedies?
        ├ They choose → a.present (email)
        │      → w.selection
        │          ├ remedy_selected → c.route
        │          └ on timeout → [policy default, recorded as "no selection made"] → c.route
        └ No choice to make → c.route
  c.route: which remedy resolves the obligation?
        ├ Correction or reperformance ─┐
        ├ Replacement ─────────────────┤
        ├ Return, before anything else ┼→ a.confirm-remedy (email)            ← NEW
        ├ Refund or credit ────────────┘        → h.correction / h.replacement / h.return / h.financial
        └ No remedy is owed → a.no-remedy (email) → EXIT x.no-remedy
```

**The new touch, and the line it must not cross.** `a.confirm-remedy` states **which remedy will resolve
the obligation and what happens next** — and, where the selection timed out, that the policy default was
applied because no selection was made. It carries `destination.mustNotClaim`, written to REM-305's
standard:
- *"a refund: not the amount, not when it will appear, not whether it has settled"* — a refund selected as
  the **remedy** is a decision about what satisfies the obligation. That money is owed is FIN-137's
  decision; that money has moved is FIN-302's announcement. This journey names the remedy and stops.
- *"a date the receiving journey has not committed to"*
- *"that the remedy is complete"* — it has been selected, not performed.

**State re-checks:** `w.selection.recheck` re-reads the confirmed issue and its obligation before the
timeout is acted on. **Add one before `a.confirm-remedy`:** a remedy the receiving journey has already
begun, or an obligation satisfied meanwhile, must not produce a confirmation of a decision that has been
overtaken.

**Stop conditions:** `remedy_selected` closes the window. The selection window expiring applies the
policy default rather than reopening the question (`s.g3` — a remedy that cannot be delivered is never
offered, so the default is always deliverable). A confirmed issue reaching *no remedy owed* is **always**
said out loud: `a.no-remedy`'s own prose is explicit that *"reaching no remedy and saying nothing leaves
the person believing the question is still open"* — which is the same reasoning that justifies the new
confirmation on the other four branches.

**Ownership / handoff:** **lowest in `service-request`**; suppressed for a case while REM-305 or REM-151
holds it. Four handoffs, all non-public: REM-156, REM-155, REM-152, FIN-137 (text + R10). The FIN-137
handoff already carries the explicit fact that this journey selected the remedy and did **not** decide the
refund is owed — keep that sentence; the new touch must not contradict it. **Must not say:** the money, on
any branch. The existing `distinctFrom: FIN-302` sentence (*"a remedy confirmed here is never money
arrived"*) is already the rule; the new touch is the first place it has to be enforced rather than asserted.

**Canonical changes needed:**
- New action **`a.confirm-remedy`**, `execution: "communication"`, reached from `c.route`'s four remedy
  branches, target = the corresponding handoff. Per-parent instancing will draw it once per branch, which
  is correct — the sentence differs per remedy.
- New `orchestration.touches` entry, stage `remedy-confirmed`, roles `["persistent"]`, `mandatory: false`,
  with the three `mustNotClaim` clauses above.
- New suppression `s.money`, modelled on REM-305's: *"No message from this journey states the money. That
  a refund is owed is FIN-137's decision and that it has moved is FIN-302's announcement; this journey
  names the remedy and nothing about the payment."*
- `orchestration.touches`: drop `in-session` from `t1` (present) and `t2` (no-remedy).
- Add `recheck` before `a.confirm-remedy`.
- `distinctFrom` += **SUB-298** (ownership D-24).
- Populate `observes` on `c.choice`, `c.route`, and on `w.selection`'s arms.
- **Content fix, not a renderer one:** give `h.return` and `h.financial` distinguishing short TR names —
  e.g. *Ürün İadesi Talebi* and *Para İadesi Talebi* — so two handoff cards on one canvas stop reading
  identically.

**Display-only changes needed:** none.

**Renderer changes needed:** R1, R7, R9, R10, R11.

---

## REM-305 — Support Request Acknowledgement

**Purpose:** Tell somebody who raised a problem that it exists, is owned and is not lost — once,
transactionally, and without promising an outcome nobody has decided yet.

**Current flow:**
```
Trigger support_request_received
  → a.capture [under a quotable reference, with a named owner; records the intake route
               and the moment it was received]
  → c.covered: is an open request already covering this problem?
        ├ Already covered → [attach] → EXIT x.attached
        └ Nothing open → c.immediate: was this already resolved when it was received?
              ├ Resolved on receipt → [gate] → a.resolved-now (email · in_app) → EXIT x.resolved
              └ Still open → [gate] → a.acknowledge (email · in_app)   [mandatory: true]
                    → w.window (support_ack.window; until support_request_resolved
                                | request_withdrawn)
                        ├ on event → c.outcome: what resolved the window?
                        │     ├ Resolved → [gate] → a.resolution (email · in_app) → EXIT x.resolved
                        │     └ Withdrawn → EXIT x.withdrawn, nothing further sent
                        └ on timeout → c.open: is the request still open now the window has closed?
                              ├ Still open → h.owner → REM-151   [and NOTHING is sent]
                              └ Closed while the window ran → a.resolution → EXIT x.resolved
```

**Problems found:**
- All three stages render a hierarchy that suggests in-app is a retry of email. (J `UNRESOLVED` ×3)
- **`w.window` is truncated in both locales** — EN *"Until the team"*, TR *"Talep sahibi ekip"*. This is
  the journey's only wait and it is the anti-drip window, the one card a reader most needs to understand,
  and neither locale renders a complete phrase. (fulfillment §4.1)
- **`h.owner` → REM-151 is a category assumption.** REM-151's stated eligibility is *"a concrete problem
  with a completed fulfilment or service"*; REM-305 opens on **any** service request — a billing question,
  an account question, a how-do-I. Every still-open request is handed to a journey whose subject is a
  completed fulfilment, with a minted `issue_id`. **Flagged, not resolved.** (fulfillment §5)
- One-sided `distinctFrom`: REM-305 names REM-151, REM-151 does not name back. (fulfillment; ownership)

**Verified intact and preserved exactly.** Both state-change touches carry the refund prohibition in
`destination.mustNotClaim`, verbatim — *"a refund: not the amount, not when it will appear, not whether it
has settled"* — on **t2** (`a.resolved-now`) and **t3** (`a.resolution`). It is restated in the actions'
own prose and again as the suppression `s.money`, which names FIN-137 as the decider and FIN-302 as the
announcer; `a.resolution`'s `does` sentence says a resolution was reached *"named in the terms the
requester raised it in rather than in the terms of any money that moved"*. **Nothing in this section
relaxes any of it, and the channel and pattern change below does not touch those three fields.** The two
rules the brief names are also both in the data and both stay: *resolved on receipt gets a resolution
message and never an acknowledgement* (`c.immediate` → `a.resolved-now`, `s.already-resolved`), and *still
open at the window's close is handed to REM-151 and gets nothing* (`c.open` → `h.owner`, no send node on
that edge, `s.no-drip`: *"nothing is sent because a period elapsed"*).

**Final orchestration:** combination — **conditional routing**, twice over, plus one **event-or-timeout**
window. The business routing point is `c.immediate` (*was this already resolved when it arrived?*), which
changes which message the requester gets. The **channel** routing point is the recorded intake route,
which J settles as this journey's pattern for all three stages: *answer where they asked*. The window is
an observation window, not a cadence — it sends on the request's own state change and never on elapsed
time. Not sequential; the acknowledgement and the resolution notice are one state change apart, not one
interval apart.

**Final customer channels:** **the intake route the request arrived on** — from `{email, in_app}` —
**with email wherever that route cannot carry a reference the requester can quote later.** (J binding, and
J ranks this ninth in its nine-to-do-first list as one of the two cheapest conditional routings to
implement, because **the signal is already captured at entry**: the trigger evidence requires *"the intake
route it arrived on and the moment it was received"* and `a.capture` records it. Somebody who raised a
problem in one place and is answered in another has to work out whether they are being answered at all.
The exception is a genuine routing rule, not a fallback — nothing failed. **No SMS, and it should be said
out loud:** an acknowledgement is not urgent by construction, its content being *"nothing has happened
yet"*, and a quotable reference number is exactly the thing SMS loses.)

J records this stage in its own *"could not settle"* list at one remove: whether the intake routes in use
can each carry a persistent reference. If some can and some cannot, the caveat becomes a second branch
rather than a clause. That is an implementation input, not a redesign.

**Customer touch count:** **2 maximum on any one instance**, in one of two shapes: either the
resolved-on-receipt message alone, or the acknowledgement followed by one resolution notice. Three
communication actions are declared; the first two are mutually exclusive. The acknowledgement is
`mandatory: true` and sits outside `support_ack.touches`, whose discretionary budget is 1. Unchanged.

**Final flow:** as current. **No structural change proposed**, and no send node is added on the `h.owner`
edge.

**State re-checks:** `w.window.recheck` re-reads the request from the system that owns it — whether it is
still open, who owns it now, and whether anything has been recorded against it — before the timeout is
acted on. `c.open` then asks the question again against that fresh read. This is the correct double-read
for a journey whose second message is conditional on the first not having been overtaken.

**Stop conditions:** `support_request_resolved` → resolution notice → `x.resolved`. `request_withdrawn` →
`x.withdrawn` with nothing further sent (`s.withdrawn`: *"a withdrawn request is not a quiet one"*). An
open request already covering the same problem → `x.attached`, acknowledged once. The window closing on a
still-open request → handoff, silence.

**Ownership / handoff:** **highest in `service-request` while the request is only a request**, with
`s.contest` silencing REM-151 and REM-157 until ownership moves at the handoff; once it moves at `h.owner`
this journey sends nothing further, ever (GLB-06). One handoff → REM-151, public, links. **Must not say:**
the refund — not the amount, not the timing, not whether it settled; that belongs to FIN-302, and
ownership records the FIN-302 ↔ REM-305 boundary as reciprocal and closed in `distinctFrom`, in REM-305's
`s.money` and in FIN-302's `s.decision`.

**Raised and deliberately not decided — `h.owner`'s category.** Two honest ways forward, neither taken
here: **(a)** condition `c.open`'s *"Still open"* arm — where the request concerns a completed fulfilment
or service → `h.owner` → REM-151 unchanged; otherwise a new exit `x.owned` (class `success`), *"the request
is with the team that owns the work, and this journey says nothing further about it"* — which keeps the
anti-drip rule exactly, adds one honest ending and keeps REM-151's stated eligibility true; **(b)** widen
REM-151's eligibility to *"any service request with a concrete problem behind it"*, making it the generic
assessment entry its position in the group already implies, and accept that its name then understates it.
(a) is the smaller change; (b) is the more truthful one. It needs the remedy arc's owner.

**Canonical changes needed:**
- `orchestration.touches[t1..t3]` gain the conditional channel rule keyed on the recorded intake route,
  with the quotable-reference exception written into it. The signal is already captured by `a.capture`;
  **nothing is invented.** (This supersedes the fulfilment audit's *"canonical changes needed — none
  required"* on the channel question only; no structural change follows.)
- Reciprocal `distinctFrom` on **REM-151** naming REM-305 (specified in REM-151's section).
- `observes` on `c.covered`, `c.immediate`, `c.outcome`, `c.open` where absent.

**Display-only changes needed:** none. Where the routing condition's `when` names a customer-visible
difference, R1 draws it on the card's rows rather than as a new Decision node — the intake route is not a
fork in the customer's path, it is which door the same message comes through.

**Renderer changes needed:** R1, **R6 — the `w.window` truncation in both locales**, R9, R11.

---

## SCH-266 — Appointment Reminder

**Purpose:** Get the customer's side of a confirmed commitment done before the commitment arrives, and
build the reminder from what the booking *is* at send time, not from what it was.

**Current flow:**
```
Trigger confirmed booking with customer-owed prerequisites
  → c.time: is there enough time for a prompt to be worth sending?
      ├ Time remains → a.prompt (every outstanding prerequisite, one message) [email + in_app]
      │       → w.prereq (pre-start window; until prerequisites_completed
      │                   | booking_materially_changed)
      │            ├ on event → c.prereq ├ All complete → w.prestart ─┐
      │            │                      └ Booking changed → EXIT x.superseded
      │            └ on timeout ──────────────────────────────────────┤
      └ Too close to prompt ───────────────────────────────────────────┴→ a.revalidate
  → a.revalidate [re-read booking from authoritative state]
  → c.valid: does the booking still stand as just read?
      ├ Cancelled/moved → EXIT x.superseded
      └ Still valid → c.critical: is anything outstanding that would stop the service?
          ├ Critical missing → a.at-risk [sms + email] → h.at-risk → SCH-174
          └ Nothing critical → a.remind [sms + email + in_app] → h.prestart → SCH-177
```

**Problems found:**
- **Both success endings are handoffs into archived Operational Workflows journeys** (SCH-174, SCH-177,
  `isPublicDestination: false`), so they render as plain text with no link. The journey's only drawn exit
  is `x.superseded` — a reader follows the reminder going out and the canvas stops on an unexplained dead
  card. Verified: one exit, two handoffs. (scheduling F3-D)
- **`a.remind` carries three channels with no differentiation, and in-app is the wrong carrier for a
  reminder.** A reminder that only arrives if the person opens the product is not a reminder.
  (scheduling; J `UNRESOLVED`)
- **`a.at-risk` reads as a ladder — `Primary: SMS · Fallback: Email` — on the one mandatory,
  last-chance message in the journey**, which makes the most consequential message look optional on one
  channel. (J §4.1 item 8; canvas P0-2)
- `w.prestart` sends `onEvent` and `onTimeout` to the **same** node, which makes its
  `untilEvent: ["booking_materially_changed"]` decorative on the canvas — the change is actually caught
  by the re-read that follows. (scheduling)
- **No `distinctFrom` row for any `booking-lifecycle` member**, and none for TIM-268.
  (ownership D-16, D-28)

**Final orchestration:** combination — a state-gated **single** prompt, then a mandatory revalidation,
then **conditional routing** at `c.critical` selecting **exactly one of two mutually exclusive messages**,
with the at-risk arm sent **parallel**. The choice is between *warning* and *reminding*, which are
different messages with different obligations, different escalation targets and different caps — the
split changes what is said, who it escalates to and whether the touch is capped. Two **event-or-timeout**
windows (`w.prereq`, `w.prestart`). Not a fallback chain anywhere.

**Final customer channels:**
- `a.prompt` → **email**. (J: every outstanding prerequisite, whose it is, and the point by which each
  must be done — deliberately one message rather than one per requirement, which makes it a list, and
  lists are read, not glanced at. In-app is dropped; the scheduling audit kept it as a parallel route.)
- `a.at-risk` → **SMS and email, once, as a parallel send.** (J binding, and this is one of the corpus's
  four real parallel moments: the SMS carries the last point at which the thing can still be done,
  because the person may be away from a desk; the email carries the time, the place and *how* to do the
  thing, **because the at-risk notice also has to restate the booking** — the SCH-304 precedence note
  depends on it doing so. Different jobs, one moment, mandatory, sent once. Not a hierarchy.)
- `a.remind` → **SMS**. (J binding: the time, the place or joining route, and anything outstanding that
  does not block it — short, one-shot, about a commitment in the next day or two, read on a phone, and
  `s.once` guarantees there is exactly one. Email and in-app are both dropped. The scheduling audit
  proposed SMS same-day / email otherwise; superseded, because the stage is reached only inside the
  pre-start window, which is what makes the text defensible in the first place.)

**Customer touch count:** **2 maximum** — the prompt, then exactly one of at-risk / reminder. Frequently
**1**, when the booking is confirmed inside the pre-start window (`s.too-close`).

**Final flow:** shape unchanged. Only the channel plans change, and the two handoff cards gain the
archived-target affordance.

**State re-checks:** `a.revalidate` before every send — it re-reads the confirmation, the time, the
provider and the outstanding prerequisites from authoritative state — then `c.valid` and `c.critical`
immediately after. **This is the strongest re-check discipline in the domain and must not be simplified.**
`s.changed` forbids building any touch from a stored copy.

**Stop conditions:** `booking_materially_changed` or a cancellation at any point → `x.superseded`
(`s.changed`). One reminder per occurrence, ever (`s.once`). Deduplicated against SCH-277 and SCH-180 on
the same booking (`s.dedup`).

**Ownership / handoff:** **third in `booking-lifecycle`** (SCH-277 > SCH-303 > SCH-266 > SCH-304),
`scope: reservation`, `onLoss: suppressed`. Ownership records this as the best-stated group in the corpus
— a total order with no ties, every member naming every other by id, and the loser's cost written down.
**Do not reopen the ordering.** `h.at-risk` → SCH-174 and `h.prestart` → SCH-177, both archived, both
carrying `suppresses: ["any further reminder for this occurrence"]`. **Must not say:** anything that
presumes a commitment SCH-277 has not yet established, and it is suppressed entirely while SCH-303 holds
the reservation.

**Canonical changes needed:**
- `a.remind`: `channelRoles` `["urgent","persistent","in-session"]` → `["urgent"]`.
- `a.prompt`: `channelRoles` → `["persistent"]`.
- `a.at-risk`: keep both roles and mark the touch **parallel** (`simultaneous`, or K §5.2's
  `pattern: { kind: "parallel", reason: … }` once it exists), so the canvas stops ranking them.
- `distinctFrom` += **SCH-277**, **SCH-303**, **SCH-304** (ownership D-16 — all three already name it)
  and **TIM-268** (ownership D-28).
- Optional, low value: give `w.prestart` a single successor, since both arms already converge. Leave it
  if the Family-B collapse is doing the job.

**Display-only changes needed:** the at-risk / reminder pair should read as a two-way branch on one row,
not as a ladder — which follows from R1 once `a.at-risk` is parallel and `a.remind` is single-channel.

**Renderer changes needed:** R1, R9, **R10 — both endings are archived handoffs, and this is one of the
two journeys in this part that end *only* in them**, R11.

---

## SCH-277 — Booking Confirmation

**Purpose:** Tell the requester whether the time they asked for is now a commitment, and where it is not,
offer what actually exists — because the availability they were shown was a picture and never a hold.

**Current flow:**
```
Trigger reservation_request_recorded
  → a.received ("this is not yet a commitment; the outcome comes at X") [email + sms]
  → w.outcome (booking semantics' own resolution period; until booking_confirmed
               | booking_request_rejected)
      ├ on timeout → a.lapse [email + sms] → EXIT x.lapsed
      └ on event → c.outcome: what did revalidation decide?
           ├ Committed → a.confirm [email + sms] → EXIT x.confirmed
           ├ Gone, something near → a.reoffer (current availability + deadline) [email + sms]
           │        → w.choice (stated choosing deadline)
           │             ├ on timeout → EXIT x.lapsed
           │             └ on event → c.choice ├ Took a slot → h.rebook → SCH-173
           │                                    └ Declined all → EXIT x.declined
           └ Gone, nothing near → a.decline (with next horizon) [email + sms] → EXIT x.declined
```

**Problems found:**
- **Five messages, one channel plan** — the worst instance in the domain, and J's count agrees: 5 of 5
  stages rendering Primary/Fallback. The acknowledgement that says *"this is not yet a commitment"*, the
  confirmation, the re-offer, the decline and the lapse notice are five different business moments with
  at least three different urgency profiles.
- **SMS on the acknowledgement is actively harmful.** The journey's own first guardrail is *"A request
  acknowledged is never worded as a request confirmed."* A text message about a booking is read as a
  booking. The channel choice contradicts the guardrail the journey exists to enforce. (scheduling F3)
- **`a.lapse` is reached from `w.outcome`'s timeout without a state re-read.** Every other journey in
  this cluster re-reads before sending; this one sends *"nothing was booked"* off the wait arm alone. If
  the confirmation landed late, the lapse notice contradicts it. (scheduling)
- **Its suppressions are its guardrails restated verbatim as `s.g1`…`s.g5`.** There is no `s.contest`
  even though it is the top of `booking-lifecycle`, and no statement of what happens when the request is
  superseded by a newer one from the same requester. (scheduling F4)
- **SCH-277 and FUL-301 do not distinguish a reservation from an order.** Neither names the other in any
  field. (ownership **P1-7**)

**Final orchestration:** combination — **conditional routing on an authoritative outcome** (`c.outcome`,
three exclusive arms, deciding which single outcome message is sent) plus **event-or-timeout** on
`w.outcome` and, on the re-offer branch only, on `w.choice`. There is one acknowledgement and then
exactly one outcome message, selected by what the booking system decided. Nothing here is sequential in
the cadence sense and nothing is a fallback. The second window exists only because the requester now has
a decision to make against a stated deadline.

**Final customer channels:** **email on all five stages.** (J binding, and it settles the whole journey
at one channel with a per-stage reason: `a.received` — every stage answers *does a commitment exist?* and
this one says explicitly that it does not yet, which is wording `s.g1` makes load-bearing and is an
argument for a channel with room in it; `a.confirm` — `s.g5` requires the concrete slot restated every
time, date, time, place, what is needed on arrival, which is the record the person brings with them, and
**the SMS in the day before is SCH-266's job, keeping the two separate being why the precedence rules
exist**; `a.reoffer` — a list of slots with a deadline for choosing; `a.decline` — it could not be
committed, nothing is being held, and when capacity of this kind is next expected; `a.lapse` — `s.g4` is
why the stage exists, because silence after a request is read as a commitment, and it is said once,
plainly, on the route the acknowledgement went out on. The scheduling audit made `a.reoffer` the
journey's genuine SMS case and kept a conditional SMS on `a.confirm`; both are superseded.)

**Customer touch count:** **2** — the acknowledgement plus exactly one outcome message. The cap of 2 is
correct and unchanged.

**Final flow:** shape unchanged, on email throughout, plus one state re-read before the lapse notice:
```
  w.outcome ─timeout→ a.reread-outcome → c.resolved-after-all?
                            ├ Resolved after all → c.outcome
                            └ Still unresolved   → a.lapse (email) → EXIT x.lapsed
```

**State re-checks:** `c.outcome` reads the booking record's verdict, not the wait arm — correct. Adding
the re-read before `a.lapse` closes the one gap.

**Stop conditions:** currently none beyond the guardrails. Required additions, written as real
suppressions rather than restated guardrails: exit where the requester cancels the request; exit where a
**newer request from the same requester for the same resource supersedes this one**; and an `s.contest`
stating its own top position from its own side (it is today only in `contact.competition.precedence`).

**Ownership / handoff:** **highest in `booking-lifecycle`**, `onLoss: suppressed`. Its precedence claims
that *"while the requested time has not yet become a commitment, nothing else may speak to the requester
about this booking"* — SCH-303, SCH-266 and SCH-304 are all suppressed for it. **Do not reopen.**
`h.rebook` → SCH-173 (archived, text + R10). **Must not say:** anything that reads as a confirmation
before one exists (`s.g1`), and nothing about the money — a reservation standing on an unpaid obligation
is SCH-303's subject and a failed payment is FIN-134's.

**Canonical changes needed:**
- Split `orchestration.touches[].channelRoles` per touch: all five → `["persistent"]`.
- Add `a.reread-outcome` before `a.lapse` plus the two-branch condition above.
- Replace `s.g1`…`s.g5` with named suppressions stating a rule *and its reason* — `s.not-confirmed`,
  `s.current-availability`, `s.nothing-held`, `s.lapse-stated`, `s.concrete-slot` — and add `s.contest`
  and `s.superseded`.
- `distinctFrom` += **FUL-301**, per ownership P1-7 / F5 as written — the reciprocal of the row specified
  in FUL-301's section, so the pair lands in one edit and neither side ships alone.

**Display-only changes needed:** none. `x.lapsed` is reached from two branches and already instanced
twice (`sharedTerminalInstances: 4`) — correct, keep.

**Renderer changes needed:** R1, R9, R10, R11.

---

## SCH-280 — No-Show Follow-Up

**Purpose:** Offer a way back to somebody whose booking did not happen, having first established that the
miss was theirs and not ours.

**Current flow:**
```
Trigger no_show_recorded against booking
  → a.reread [re-read latest events — absorbed as bookkeeping, not drawn]
  → c.superseded: did the booking genuinely not happen?
       ├ Superseded/reconciled → EXIT x.suppressed (nothing sent)
       └ Genuinely missed → c.provider: could the provider actually have delivered?
            ├ Our side failed → h.provider → SCH-180 Booking Reschedule
            └ Deliverable → c.rebookable: is there anything to offer?
                 ├ Nothing to rebook onto → a.acknowledge [email] → EXIT x.closed
                 └ Rebooking available → a.offer (+ route + closing date) [email + sms]
                                          → w.rebook (7–14d; until rebooked | rebooking_declined)
                                               ├ on timeout → EXIT x.closed
                                               └ on event → c.outcome
                                                    ├ Rebooked → EXIT x.rebooked
                                                    └ Declined → EXIT x.closed
```

**Problems found:**
- **SMS on `a.offer` is the weakest SMS case in the domain.** The moment has already passed; there is no
  deadline inside hours and the rebooking window is 7–14 days. A text about a missed appointment also
  reads as chasing, which is exactly what the *"no blame, no penalty language"* guardrail is guarding
  against. The `channelStrategy` role hedges it (*"the rebooking window is short"*) but **no condition in
  the graph reads that**. (scheduling F3; J `UNRESOLVED`)
- `a.reread` is absorbed by the bookkeeping rule because it declares no `writes` — yet the journey's
  first guardrail is *"The record is re-read immediately before sending. A message about a miss is the one
  thing that cannot be sent on stale state."* The re-read survives on the canvas only through
  `c.superseded`, which is drawn and carries the meaning. Acceptable, but it is the closest this domain
  comes to a collapse hiding something load-bearing. (scheduling)
- **It keys on `booking_id + occurrence_id` — the same instance key as SCH-266 and SCH-304 — messages the
  same holder about the same occurrence, and declares `contact.competition: "none"` with no group and no
  explanation.** SCH-277's precedence claims *"nothing else may speak to the requester about this
  booking"*, which by its own words binds SCH-280; SCH-280 never acknowledges it. In practice the pair
  cannot contest, so this is a stated-boundary gap and not a hazard. (ownership **P2-3**)

**Final orchestration:** combination — a **single** conditional message, then **event-or-timeout**. Three
sequential screening decisions (did it happen · was it us · is there anything to offer) that choose
between *one* message and *no* message, followed by one bounded window that only classifies the outcome.
Deliberately **not** a sequence: *"one offer, not a sequence. Somebody who missed once is not pursued."*

**Final customer channels:** `a.acknowledge` → **email** (already correct, and one of only two
single-channel stages in this part today). `a.offer` → **email**. (J binding, and both audits agree:
`s.no-penalty-language` sets the register — the miss is a fact, stated without penalty, with the single
route to a new booking inside a stated window — and an SMS about a missed appointment arrives as chasing.
The scheduling audit's conditional-SMS escape hatch, *"only where the rebooking route's own closing date
is inside 48 hours"*, is **not** carried: no node reads that attribute, and the brief's rule is to prefer
the simpler pattern and say so.)

**Customer touch count:** **1.** Correct and stays 1.

**Final flow:** unchanged.

**State re-checks:** `a.reread` plus `c.superseded` before anything is sent; `c.outcome` after the window.
Sufficient.

**Stop conditions:** a cancellation, reschedule or late attendance landing after the no-show was recorded
→ `x.suppressed` (`s.reread`). Provider-side failure → handoff, nothing sent (`s.provider-fault`).
Nothing to rebook onto → acknowledgement with no prompt (`s.nothing-to-rebook`).

**Ownership / handoff:** no exclusion group, and that is correct — the booking it speaks about no longer
exists as a future commitment, and it opens strictly after every `booking-lifecycle` member has finished.
But that must be **stated** rather than left as an unexplained `competition: null`. `h.provider` →
SCH-180 (archived, text + R10). Yields nothing else. **Must not say:** anything that re-litigates whose
fault the miss was once `c.provider` has routed it, and nothing about a provider-side failure, which goes
to SCH-180 in silence.

**Canonical changes needed:**
- `a.offer`: drop the `urgent` role. `channelRoles` → `["persistent"]`.
- `suppressions` += `CANONICAL_RULE` `s.after` (ownership P2-3, verbatim): *"This journey opens only once
  the occurrence has passed with nobody there, which is why it is outside the booking-lifecycle group
  rather than at the bottom of it: the booking outcome notice (SCH-277), the reservation payment reminder
  (SCH-303), the readiness reminder (SCH-266) and the pre-arrival notice (SCH-304) have all finished by
  then, and nothing they own can still be said."*
- `distinctFrom` += **SCH-266** and **SCH-304** (ownership P2-3).

**Display-only changes needed:** none.

**Renderer changes needed:** R1, R9, R10, R11.

---

## SCH-282 — Availability Search Abandonment

**Purpose:** Follow an availability question that produced no booking with something that is genuinely
bookable *now*, or with a waitlist place where nothing fits.

**Current flow:**
```
Trigger availability query closed without reservation   [behavioral]
  → c.permitted: may an unprompted offer be sent to this person at all?
       ├ Anonymous / not permitted → EXIT x.no-route
       └ Identified and permitted → w.settle (bounded settle period; until booking_confirmed
                                              | availability_lost; never extended by browsing)
            ├ on event → c.settled ├ Booked unprompted → EXIT x.booked
            │                       └ Window gone → a.recheck
            └ on timeout → a.recheck
  → a.recheck [re-evaluate what is bookable now, from scratch]
  → c.options: what is actually available now?
       ├ A near window is bookable → a.offer (nearest window, labelled as different, not held)
       │                             [email + push] → w.respond → EXIT x.booked / x.lapsed
       ├ Nothing fits, waitlist → a.waitlist (reserves nothing) [email + push]
       │                          → w.waitlist → EXIT x.waitlisted / x.lapsed
       └ Nothing fits, no waitlist → EXIT x.nothing (no message sent)
```

**Problems found:**
- **Push is asserted with nothing in the graph testing whether a push could be delivered.** J's
  corpus-wide rule: 29 journeys assert push, 2 contain a deliverability test, and push survives in 3 —
  ACQ-287, ACQ-288 and ACQ-289, all of which have or import a router. This journey has none.
- **The messages are made of caveats, and push cannot hold one.** `a.offer` must present a different
  window *labelled as a different window* (`s.g2`) and say it is not held (`s.g3`); `a.waitlist`'s entire
  content is the caveat that the place reserves nothing, because *"somebody who believes they hold a
  place they do not hold"* is the failure. (J)
- `c.permitted` reads on the canvas as a generic permission gate — the thing the brief says not to draw
  on every journey — and it escapes `collapsibleGates` on a technicality (its short arm goes straight to
  `x.no-route` without a bookkeeping hop). Here the split is **not** generic: an availability query
  genuinely can be anonymous and identification changes the visible route. The problem is the *wording*,
  which leads with permission instead of with identification. (scheduling; canvas §2.2 Tier A)
- **`x.lapsed` is shared by `w.respond` and `w.waitlist`** — an offer not taken and a waitlist place not
  accepted are two different things — and the exit **state text is the same on both** (*"offer made and
  not taken"*), which is wrong for the waitlist arm. (scheduling)
- **Its precedence contradicts itself in one sentence** — *"alongside interest recovery — an availability
  enquiry that asked for a specific window outranks inferred interest"* — and it is the only member of
  the eight-journey `commerce-recovery` group with **no contest suppression at all**, so its membership is
  stated in one field and enforced in none. It also ties with RET-31: both texts place themselves at the
  identical rank, neither names the other, and both are `onLoss: "suppressed"`, so on a contest each
  defers and **neither sends**. (ownership **P0-3**, **P2-5**)
- `s.g1`…`s.g5` are guardrails restated. (scheduling F4)

**Final orchestration:** combination — a **bounded delay** (`w.settle`, event-or-timeout), a re-evaluation
from scratch, a **single** offer, and a three-way outcome split. **No second touch, ever.** The delay is
not a nurture interval: it exists because *"an offer that arrives while somebody is still choosing
competes with the thing they are choosing, and usually wins nothing."* That is an honest, non-generic
reason for a wait and is worth keeping verbatim.

**Final customer channels:** `a.offer` → **email**. `a.waitlist` → **email**. (J binding. The scheduling
audit called email + push *"unchanged and correct"* and made the brief's push argument — active app
audience, timely nudge, one step from the notification to the booking screen. Superseded on two grounds J
holds and the domain did not weigh: nothing in this graph resolves push deliverability, and both messages
are carefully-worded caveats on an unprompted **promotional** send, which push cannot carry. Both audits
agree there is **no SMS**: an availability enquiry is inferred-adjacent interest and the journey is
`pressureClass: promotional`, so SMS here would be the single clearest violation of the channel rules.)

**Customer touch count:** **1** — offer **or** waitlist, never both. The cap of 2 overstates it; reduce
the `availability_searched.touches` default to **1** to match the graph.

**Final flow:** unchanged in shape.

**State re-checks:** `a.recheck` re-evaluates availability **from scratch** before the offer, explicitly
not reusing what the query returned. This is the correct pattern and the whole point of the journey.

**Stop conditions:** the person books unprompted → `x.booked`, nothing sent. Nothing available and no
waitlist → `x.nothing`, nothing sent. `s.sunset` — CON-300's sender-side marketing suppression — stops it,
which is correct and is required of any promotional journey by
`scripts/sunset-suppression-evidence.mjs`.

**Ownership / handoff:** `commerce-recovery`, `scope: person`, `onLoss: suppressed`. **The tie with RET-31
must be broken in SCH-282's favour**, on the group's own running rationale: an availability enquiry is a
question the person actually asked about a stated window, where a predicted need is computed from history
and confirmed by nobody — which is the same reasoning ACQ-289's repaired precedence already cites SCH-282
for. No handoffs. **Must not say:** that any window is held (`s.g3`), or that the availability shown
earlier still stands (`s.g2`).

This journey is also **the corpus's clearest specific-beats-general precedent and the one to mirror**: its
shape is *name the general journey, name the specific signal, say which attribute of the signal makes it
specific* (a stated window). Any new precedence prose in this refactor should copy that three-part shape.

**Canonical changes needed:**
- `a.offer` and `a.waitlist`: drop the `low-friction` role; `channelRoles` → `["persistent"]`; drop `push`
  from `channelsDeclared`.
- Reword `c.permitted`'s `displayQuestion` to lead with attribution:
  *"Can this query be attributed to a person we may contact?"*
- Split `x.lapsed` into `x.offer-lapsed` and `x.waitlist-lapsed`, or give the waitlist arm its own state
  text.
- `availability_searched.touches` default 2 → **1**.
- `contact.competition.precedence` — replace with the ownership **P0-3** wording verbatim (below checkout
  recovery, the generic process pattern, the held cart and the held selection; **above** predicted-need
  replenishment RET-31, the back-in-stock alert ACQ-289 and inferred-interest recovery ACQ-13, with the
  reason stated).
- `suppressions` += `CANONICAL_RULE` `s.contest` (ownership P0-3 verbatim).
- `distinctFrom` += **ACQ-289** (ownership D-27).
- Rename `s.g1`…`s.g5` to named suppressions stating a rule and its reason.
- *(RET-31's reciprocal half of P0-3 belongs to another consolidator; this side must not ship alone.)*

**Display-only changes needed:** none beyond the `c.permitted` rewording. `c.permitted` **stays drawn** —
it is one of the few permission-shaped gates that genuinely changes the visible route.

**Renderer changes needed:** R1, R9, R11.

---

## SCH-303 — Reservation Payment Reminder

**Purpose:** Keep a reservation that is standing only because a payment is still expected, by telling the
holder what the *booking terms* do about it — and getting out of the way the moment the payment itself is
what went wrong.

**Current flow:**
```
Trigger reservation payment outstanding
  → c.standing: does the reservation still stand with the obligation still outstanding?
       ├ Already settled → EXIT x.kept
       ├ No longer standing → EXIT x.superseded
       └ Standing & outstanding → c.sendable [gate, absorbed]
  → a.remind: what is owed, the terms' due point, what the terms do [email + in_app]
  → w.payment (until obligation_satisfied | authoritative_payment_failure
               | booking_materially_changed; timeout at the due point)
       ├ on event → c.outcome ├ Kept → EXIT x.kept
       │                       ├ Payment failed → h.payment-failure → FIN-134
       │                       └ Withdrawn → EXIT x.superseded
       └ on timeout → c.still: does it still stand as just re-read?
            ├ Settled meanwhile → EXIT x.kept
            ├ Withdrawn meanwhile → EXIT x.superseded
            └ Still at risk → c.sendable2 [gate, absorbed]
  → a.final: the reservation as it stands, the last point it can be kept, what the terms do
    afterwards [sms + email + in_app]   (mandatory)
  → w.release (same three events; timeout at the release point)
       ├ on event → the same three-way resolution (kept / FIN-134 / superseded)
       └ on timeout → a.lapse: released, nothing held, what the record shows [email + sms]
                      (mandatory) → EXIT x.released
```

**Problems found:**
- `a.final` carries three channels and `a.lapse` two, both unconditionally, and `a.final` renders as
  `Primary: SMS · Fallback: Email · Fallback: In-app` — a ladder on the one mandatory last-chance message,
  which makes the most consequential message in the journey look optional on one channel. (scheduling F2/F3;
  J §4.1 item 8)
- **`a.lapse` on SMS is wrong.** The place is already gone. The message is *owed* — the guardrail *"a place
  that disappears in silence is discovered by the holder on the day"* is right — but it is a record, not an
  urgent action, and there is nothing for the holder to do within hours.
- **21 display nodes from 14 distinct canonical nodes drawn** — 10 shared-terminal instances, third-largest
  in the library. Per-parent instancing working as designed on a three-way resolution repeated twice.
  (canvas P2-7)
- **`FIN-134` says nothing back.** SCH-303 states the boundary four times; FIN-134 declares
  `contact.competition: "none"`, disables pressure caps (*"this is transactional communication about an
  obligation the person already holds"*) and carries no rule stopping it from restating the release
  deadline SCH-303 handed it. **That is a defect on FIN-134's side, not this one's.** (ownership **P0-1**)
- No `distinctFrom` row for SCH-304. (ownership D-16)
- Nothing else: the two `c.sendable` gates and `a.record-no-action` / `x.no-action` are absorbed correctly,
  which is exactly the implementation-gate signal. **Noted so nobody "restores" them.**

**Final orchestration:** combination — an **escalating two-window event-or-timeout** with a hard ownership
exit, one stage of which is **parallel**. Two bounded windows anchored to two attributes the *booking terms*
own (the due point, the release point), each resolving three ways. It escalates in **consequence stated**,
not in frequency, and the escalation stops at a handoff rather than at a retry.

**How SCH-303 is kept out of dunning territory — the four tests, all passed today and all kept:**

| test | how it holds |
|---|---|
| **Subject** | The entity is `booking_id`, scoped *"one confirmed reservation whose continued standing depends on a payment its holder still owes."* The money has no instance key here. `a.remind`'s own text: *"The subject is the place they hold, not the money."* |
| **No retry, no decline classification** | There is no retry node, no attempt counter and no decline-code branch anywhere in the graph. The only thing done with a failure is `h.payment-failure`. |
| **No amount stated as a debt** | Every message states *what the terms do to the reservation*. The due point and release point are **read** from the booking terms (`s.superseded`: re-read before every touch) and the journey *"never asserts, moves or softens either."* |
| **Silence after handoff** | `h.payment-failure` carries a `suppresses` clause and there is no path from the handoff back into this graph. Three of the four arms that could see a failure route to it. |

**The channel decision is set so as not to erode this.** The release notice **loses SMS specifically**,
because an SMS about money that has not been paid is the one change that would make this read as
collections. It stays on email. Both audits agree; J agrees; it is not negotiable in implementation.

**Final customer channels:**
- `a.remind` → **email**. (J: what is outstanding, the point the booking terms expect it by, and what those
  terms do if it is not met — terms, quoted — and the reservation holder is not necessarily in the product.
  The scheduling audit kept in-app; superseded.)
- `a.final` → **SMS and email, once, as a parallel send.** (J binding, and one of the corpus's four real
  parallel moments: the SMS carries the deadline, the email carries the reservation as it stands and what
  the terms do after. One moment, mandatory, no second notice. In-app is dropped; the ranking is removed.)
- `a.lapse` → **email**. (The place is already gone; there is nothing to do in the next minutes. What is
  owed is what the record now shows and what exists instead.)

**Customer touch count:** **3**, discretionary budget 1. Correct and unchanged —
`localCap.appliesTo: "non-mandatory"` with both later touches `mandatory: true` is the right shape and is
one of the better-reasoned caps in the corpus. **SCH-303 acquires no fourth touch and no retry.**

**Final flow:** shape unchanged.

**State re-checks:** `c.standing` at entry; `c.still` at the due point, re-reading the reservation **and**
the obligation; and the terms re-read before every touch per `s.superseded`. Comprehensive — **do not
reduce.**

**Stop conditions:** the obligation satisfied, waived or cancelled by any route → `x.kept` (`s.settled`).
The reservation cancelled, moved or materially changed → `x.superseded`. An **authoritative payment
failure** → FIN-134 and silence (`s.failure-not-ours`). An unknown attempt outcome → reconcile first,
treat as neither (`s.unknown-outcome`, GLB-20). SCH-277 holding the reservation → suppressed, not queued
(`s.contest`).

**Ownership / handoff:** **second in `booking-lifecycle`**, below SCH-277 and above SCH-266 and SCH-304 —
*"a reservation that may be released outranks anything about preparing for it or turning up to it."*
`onLoss: suppressed`. **Do not reopen.** `h.payment-failure` → **FIN-134, the only public handoff target in
the twelve scheduling/subscription journeys**, so the only one that renders as a link.
**Must not say, from the handoff onward: anything about the payment.** Preserve the boundary as stated —
asymmetrically and deliberately: SCH-303 declares the deference (`s.failure-not-ours`, `distinctFrom`
FIN-134, the handoff contract) and FIN-134 is deliberately **not** in `booking-lifecycle`. **Do not
"complete" that by adding a competition block to FIN-134** — most FIN-134 instances have no reservation
behind them. The reciprocal work FIN-134 does owe (ownership P0-1) belongs to FIN-134's consolidator.

**Canonical changes needed:**
- `a.remind`: `channelRoles` → `["persistent"]`.
- `a.final`: keep `urgent` and `persistent`, drop `in-session`, and mark the touch **parallel** so the
  canvas stops printing SMS as the primary of a ladder.
- `a.lapse`: drop the `urgent` role; `channelRoles` → `["persistent"]`.
- `distinctFrom` += **SCH-304** (ownership D-16).
- **No other change.** No retry node, no attempt counter, no decline classification, no amount stated as a
  debt, no fourth touch, no group change.

**Display-only changes needed:** none. The four absorbed nodes are absorbed correctly.

**Renderer changes needed:** R1, R9, R11.

---

## SCH-304 — Pre-Arrival Preparation

**Purpose:** Tell somebody what turning up actually requires — and say it only where it answers something
they could not already know.

**Current flow:**
```
Trigger arrival_window_opened
  → c.standing: is this occurrence still something to arrive at?
       ├ Cancelled/moved → EXIT x.superseded
       ├ Already under way → EXIT x.overtaken
       └ Still ahead → c.sendable [gate incl. "does the booking hold arrival facts worth
                                    carrying" — absorbed]
  → a.details: place or joining route, what to have, the step that can be done first
    [email + in_app]
  → w.checkin (until check_in_completed | booking_materially_changed | attendance_recorded)
       ├ on event → Checked in → w.dayof · Changed → x.superseded · Arrived → x.arrived
       └ on timeout → c.owed: is a check-in step still owed?
            ├ Nothing owed → w.dayof
            └ Still owed → [gate] → a.checkin: the one step + last point
                           [in_app + email + sms] → w.dayof
  → w.dayof (until booking_materially_changed | attendance_recorded)
       ├ on event → Changed → x.superseded · Arrived → x.arrived
       └ on timeout → c.late: is there anything that could not have been said earlier?
            ├ Nothing new → EXIT x.ready            (the ordinary case)
            └ Something changed → [gate] → a.late-detail: only what is new, said as new
                                  [sms + in_app + email] → EXIT x.ready
```

**Problems found:**
- `a.checkin` carries three channels and `a.late-detail` all three with SMS declared first, all
  unconditional. (scheduling F1/F2/F3; J `UNRESOLVED` ×3)
- **`w.checkin` renders a 257-character label inside a wait capsule whose reserved slot is 240 × 56.**
  `waitLabel` → `firstClause` only cuts at a clause separator found at index ≤ 90 and otherwise returns the
  whole string; 11 wait labels in the library exceed 70 characters, and wait is the one card kind that never
  gets `cardSummary`'s budget treatment. (canvas P2-8, H8 — and K is explicit that this is a `firstClause`
  bug, **not** a licence for a journey-specific branch)
- 19 display nodes from 15 distinct canonical nodes drawn — 7 terminal instances. Per-parent instancing
  working as designed. (canvas P2-7)
- Nothing else. This is the strongest-authored journey in the domain.

**Final orchestration:** **budgeted conditional touches** — a combination of three independently gated
sends against a ceiling of 3 (`appliesTo: "all"`), with two **event-or-timeout** windows. This is
deliberately the odd shape in the cluster and must stay that way: an occurrence with nothing new reaches
`x.ready` having spent nothing. **The two waits are not delays between messages — they are the windows in
which a fact might become knowable.**

**The guardrail stays, verbatim:** *"A message whose content is how long remains is a countdown, and this
journey does not send one."* Every touch's gate exists to enforce it — `c.owed` (does a check-in step
exist, is it open, is it unfinished), `c.late` (does the booking now hold an arrival fact this journey has
not already sent), and `c.sendable`'s own *"the booking holds arrival facts worth carrying"* clause. **Do
not merge those gates into a generic send check; they are the journey.**

**Final customer channels:**
- `a.details` → **email**. (J: the place or joining route, what to have, and the step that can be done
  before setting off — people save this and open it on the day. In-app dropped.)
- `a.checkin` → **SMS**. (J binding, and J names this one of the corpus's seven surviving SMS stages: one
  step, one deadline, done on a phone shortly before travelling, and `s.nothing-new` means the stage is
  only reached when there is genuinely something owed, which is what makes a text defensible rather than a
  nag; `s.already-done` forbids prompting a completed step. **The scheduling audit said the opposite —
  "drop SMS", because a check-in step lives in the product and texting somebody to go and do it in the app
  is a worse route to the same place.** I applied J: its reason rests on two authored suppressions and the
  domain's rests on a general principle, and the domain's own in-app preference has the same defect as
  everywhere else in this part — nothing in the graph reads the `in-session` role's `when`.)
- `a.late-detail` → **SMS**. (Both audits agree this is genuine: the exact place within the location, the
  access instruction, the person to ask for, sent to somebody already travelling and only ever containing
  the new part. In-app dropped — somebody en route is not in the product — and email dropped with it.)

**Customer touch count:** **0–3**, ceiling 3. Correct and bounded; do not raise or lower.

**Final flow:** shape unchanged.

**State re-checks:** arrival facts re-read from the booking immediately before every touch (`s.changed`);
`c.owed` re-reads the check-in record; `c.late` compares the booking's **current** arrival facts against
what this journey has already sent. Best-in-domain — keep all three.

**Stop conditions:** cancellation or material change → `x.superseded`. Attendance or arrival recorded →
`x.arrived`, immediately, *"rather than finishing its plan"* (`s.overtaken`). Nothing new to say →
`x.ready`, the ordinary case and explicitly **not** a failure (`s.nothing-new`). Any higher
`booking-lifecycle` member holding the occurrence → suppressed (`s.contest`).

**Ownership / handoff:** **lowest in `booking-lifecycle`**, `onLoss: suppressed`. Its own precedence
carries the loser's-cost statement the corpus almost never supplies — *"each of those journeys restates the
time and the place itself, so a suppressed arrival message loses nothing the holder needed"* — and
SCH-266's at-risk notice restating the booking is what makes that true, which is why `a.at-risk` keeps
email in its parallel send. **No handoffs, deliberately** — a second route into SCH-177 would mean two
journeys claiming the same attendance question. **Keep it.** **Must not say:** how long remains.

**Canonical changes needed:**
- `a.details`: `channelRoles` → `["persistent"]`.
- `a.checkin`: `channelRoles` → `["urgent"]` (drop `in-session` and `persistent`).
- `a.late-detail`: `channelRoles` → `["urgent"]` (drop `in-session` and `persistent`).
- Nothing structural. The three gates, the countdown guardrail, the ceiling and the absence of handoffs all
  stay exactly as authored.

**Display-only changes needed:** none. The three gates plus bookkeeping plus `x.no-action` are absorbed
correctly, which is why 20 canonical nodes draw as 19.

**Renderer changes needed:** R1, **R6 — the wait label must pass the same `cardSummary` budget as every
other card body, as a generic `firstClause` fix and never a per-journey branch**, R9, R11.

---

## SUB-163 — Renewal Reminder

**Purpose:** Reach a decision about the next term, **as a decision** — separate from anything that makes
the next term real.

**Current flow:**
```
Trigger renewal decision window opens
  → a.evaluate [eligibility, model, state, notice, pricing, blockers — absorbed]
  → c.notice: are the renewal terms and required notice defined?
       ├ Not defined → h.undefined → DEC-181 Decision Request
       └ Defined → c.notice-required: do the terms require notice to be given?
            ├ Notice required → a.notice: the model, the terms it renews on, what happens if
            │                   they do nothing [email + in_app]  (obligation, outside the cap)
            └ No obligation ──┐
  → c.blockers: does an outstanding blocker prevent the decision?
       ├ Blocked → a.review [record RENEWAL_REVIEW] → w.review (to notice deadline)
       │                ├ on event → c.decision
       │                └ on timeout → h.escalate → OWN-55
       └ Clear → c.model: what does the renewal model require?
            ├ Auto-renew, met → [record decided] → h.execute → SUB-164
            ├ Review first → a.review → w.review (as above)
            └ Explicit decision → a.request [email + in_app + sms + push]
                                  → w.decision (term_end_at minus the notice period;
                                                until renewal_decision_recorded)
                                       ├ on event → c.decision
                                       └ on timeout → a.default [apply the terms' own default]
                                                       → c.decision
  → c.decision: what is the outcome for the next term?
       ├ Cancellation in motion → EXIT x.superseded
       ├ Renew → [record decided] → h.execute → SUB-164
       └ Do not renew → [record NON_RENEWING] → h.scheduled-end → SUB-168
```

**Problems found:**
- **`a.request` carries four channels, with `["sms","push"]` bundled inside a single `urgent` role.** Two
  unrelated channels in one bucket is the clearest artefact of the fallback reflex — it says *"if not SMS
  then push"*, which is not a substitution anybody designed. J ranks this and TIM-61 as the corpus's two
  worst asserted-reach cards and the clearest examples of role lists standing in for thinking.
- **The underlying premise is wrong for this journey.** The deadline is `term_end_at` minus the notice
  period the terms require — days or weeks — and the decision holder is *"whoever holds it"*, frequently a
  signatory or budget owner with no product session and often not the person whose phone is on file.
- **`a.notice` and `a.request` are different objects — a legal obligation and a question — and both can
  fire on the same cycle**, with nothing in the graph preventing two near-identical emails about one
  renewal. No dedup between them. (scheduling)
- **The journey ends only in handoffs** (`journeyOutcome.type: "handoff"`), and **all four targets are
  archived** (DEC-181, OWN-55, SUB-164, SUB-168). The canvas terminates in four non-link text cards plus
  one suppression exit. Verified: one exit (`x.superseded`), four handoffs. Same reader problem as SCH-266,
  worse. (scheduling F3-D)
- **`a.default` is absorbed and should not be.** *"Apply what the governing terms define as the outcome
  when no decision is made"* writes only a journal row, so the bookkeeping rule hides it — and the timeout
  edge now runs straight from the wait into `c.decision` with no sign that a default was applied. It is the
  only place the terms' own outcome is applied and the only thing that makes *"no answer ≠ agreement"*
  visible. (scheduling; canvas §3.2's pattern — a journal field name is the wrong signal for a step that is
  structurally significant)
- **Engine identifiers on the canvas:** `w.review` and `w.decision` render *"term_end_at minus the notice
  period the terms require"*, and `a.review` renders *"Record RENEWAL_REVIEW with what has to be settled"*.
  (canvas P1-6)
- No `distinctFrom` row for RET-292. (ownership D-21)

**Final orchestration:** combination — **conditional routing on the renewal model** (`c.model` decides
whether anybody is asked at all: an auto-renew with its conditions met sends a notice and never asks; an
explicit-decision model asks once) plus **event-or-timeout** on `w.decision` and `w.review`, on one branch
only. There is no sequence and no cadence. This is a journey that is often **zero customer touches** (no
notice obligation + auto-renew) and never more than two.

**Final customer channels:** `a.notice` → **email**. `a.request` → **email**. (J binding on both: the
notice is a contractual obligation — the renewal model that will apply, the terms it renews on, and what
happens if nobody decides — and *"it has to be provable that it was given, and it has to survive the
term"*; the request carries the terms that would apply and the point by which the notice period requires an
answer, addressed to a decision holder who frequently has no product session. **SMS and push are removed**,
and the `["sms","push"]` bundle goes with them. The scheduling audit kept in-app on both; superseded. The
scheduling audit also recorded this as one of the three calls it was least sure of, on the grounds that
`relationship_id` covers consumer subscriptions too and a consumer subscription auto-renewing tomorrow at a
higher price is a genuine urgent-horizon case — but **the journey holds no attribute distinguishing the two
populations**, and the brief's rule is to prefer the simpler pattern and say so rather than invent the
signal. J reaches the same answer independently.)

**Customer touch count:** **0–2.** Correct. The cap — 1 discretionary, the notice outside it — is right and
unchanged.

**Final flow:** shape unchanged, plus a dedup: where the notice has already been sent on this cycle and the
model then requires an explicit decision, `a.request` **restates the decision and does not restate the
terms** the notice already carried.

**State re-checks:** `c.decision`'s first branch re-reads the relationship for a cancellation in motion —
the journey's own sixth guardrail covers exactly the case of a cancellation starting after the request went
out. `w.decision` and `w.review` both re-check. Good; nothing to add.

**Stop conditions:** a cancellation in motion → `x.superseded` (the relationship's own lifecycle takes it).
An open payment recovery → suppressed entirely at eligibility (`s.payment-recovery`). A decision recorded →
nothing further (`s.decided`). Undefined terms → DEC-181, nothing sent.

**Ownership / handoff:** `relationship-continuity`. **Subscription Renewal outranks generic Expiry
Reminder** — already stated from both sides, in SUB-163's `distinctFrom` TIM-63 and in its precedence
prose. **Do not reopen.** Below cancellation-in-motion, below an active risk state, below open payment
recovery. Four handoffs, all archived: DEC-181, OWN-55, SUB-164, SUB-168 — all text, all needing R10.
**Must not say:** anything that makes the next term real; execution is SUB-164's, and a scheduled end is
SUB-168's.

**Canonical changes needed:**
- `a.request`: `channelRoles` → `["persistent"]`, dropping `urgent` (and with it the `["sms","push"]`
  bundle) and `in-session`.
- `a.notice`: `channelRoles` → `["persistent"]`.
- Add a dedup condition, or a suppression `s.notice-already-given`, covering the notice/request overlap on
  one cycle.
- `distinctFrom` += **RET-292** (ownership D-21).
- Move the engine identifiers out of authored card prose: `w.review` / `w.decision` should state *"the
  notice period the terms require, before the term ends"* and `a.review` should not name the constant.
  (The durable fix is canonical; the display half is R11's widened H1.)

**Display-only changes needed:** **keep `a.default` drawn**, or label the timeout edge with it. Absorbing
it silently loses the journey's second guardrail. Expressed generically: **an absorbed action is exempt
from the bookkeeping rule where the edge into it is a wait timeout and it is the only node on that arm**
— which is R3's structural reading of the same rule.

**Renderer changes needed:** R1, R3, R9, **R10 — this is one of the two journeys in this part whose
canvas ends *only* in archived handoffs**, R11.

---

## SUB-262 — Cancellation Confirmation

**Purpose:** Carry somebody through the period between deciding to leave and actually losing access, so
the end date is never a surprise and returning stays possible right up to it.

**Current flow:**
```
Trigger cancellation confirmed
  → a.confirm: the cancellation, the exact end date, what remains until then [email + in_app]
  → c.window: is there a meaningful window before access ends?
       ├ Ends immediately → c.obligations
       └ Window remains → w.window (until cancellation_withdrawn | effective_end_reached)
            ├ on event → c.withdrawn ├ Withdrawn → EXIT x.returned
            │                         └ Still ending → a.ending: what survives and what does
            │                                          not [email + in_app]
            └ on timeout → a.ending
  → c.obligations: does anything outlive the relationship?
       ├ Obligations remain → h.obligations → SUB-170
       └ Nothing outstanding → EXIT x.ended
```

**Problems found:** almost none. **This journey is already right, and the correct finding is largely to
leave it alone.**
- Both stages render a hierarchy that is not one — it declares `same-role-other-channel`, so its second row
  is mislabelled Fallback. (J `UNRESOLVED` ×2; canvas P0-2)
- Its suppressions are its guardrails restated as `s.g1`…`s.g4`. (scheduling F4)
- `measurement` has no `businessOutcome` block and `goal.event` is `null`. That is **honest** — a wind-down
  has no conversion event and inventing one would be worse — but it should be stated rather than absent, so
  a reader does not read it as an omission.

**Final orchestration:** **sequential** — two touches with a mandatory state re-check between them. The
plainest shape in the domain and the right one: one immediate confirmation, one window, one ending notice.
`c.window` is a real condition (a cancellation effective immediately has nowhere to put a second message)
and `c.withdrawn` is the journey's whole point.

**Final customer channels:** **email** on both touches. (J binding. `a.confirm` — `s.g3`: the end date is
stated in the first message and never moves silently, which makes this the reference for everything that
follows, including whether they can still export. `a.ending` — what will and will not survive the end date,
exports, history, outstanding obligations; *"it is the last chance to act on a list, so it needs to be a
list."* **The scheduling audit specifically defended in-app on both and asked that the next reader not
"fix" it for symmetry — I am overruling that, and it is worth naming.** Its argument is that both messages
are read by somebody who is still a customer and still in the product; J's is that both messages are lists
of dates and survivals that must be reopenable, which argues for email and does not argue for in-app, and
nothing in the graph resolves the `in-session` role. **Both audits agree: no SMS** — the end date is weeks
away and the message is a record — **and no push** — nothing here is a nudge.)

**Customer touch count:** **1–2.** Correct.

**Final flow:** unchanged.

**State re-checks:** `c.withdrawn` before the ending notice — *"a reminder that access is ending, sent to
somebody who has just stayed, is worse than sending nothing."* This is exactly the brief's
never-send-a-reminder-after-success rule, **already implemented**; nothing to add.

**Stop conditions:** withdrawal or reactivation → `x.returned`, immediately. **The cancellation is never
re-litigated** (`s.g1`); a save attempt belongs to RET-28, before this journey.

**Ownership / handoff:** no exclusion group, and correctly — nothing else speaks about a cancelled
relationship's wind-down. `distinctFrom` **RET-28** (before the decision) and **SUB-167** (establishes
whether and when it ends), both present and correct. `h.obligations` → SUB-170 (archived, text + R10).
**Must not say:** anything that reopens the decision, and nothing about obligations that outlive the
relationship beyond handing them on.

**Canonical changes needed:**
- `a.confirm` and `a.ending`: `channelRoles` → `["persistent"]`.
- Rename `s.g1`…`s.g4` to named suppressions stating a rule and its reason — `s.no-relitigation` for the
  first.
- Add an explicit `businessOutcome: null` note, or the equivalent, stating **why** there is no conversion
  event.
- **No structural change.**

**Display-only changes needed:** none.

**Renderer changes needed:** R1, R9, R10, R11.

---

## SUB-296 — Loyalty Program Welcome

**Purpose:** Open an enrolled membership honestly: what it grants from today, where it lives, how it is
used — without borrowing product onboarding or the first-purchase welcome.

**Current flow:**
```
Trigger loyalty_membership_enrolled
  → c.state: is this membership ours to welcome?
       ├ No longer stands → EXIT x.closed
       ├ Already welcomed → a.record-no-action → EXIT x.no-action
       └ Welcome due → c.sendable [gate, absorbed]
  → a.welcome: what the membership grants from today, where it lives, how it is used
    [email + in_app]
  → w.benefit (until loyalty_benefit_used | loyalty_membership_ended)  [collapsed into c.used]
  → c.used: has the membership been used yet?
       ├ Already in use → EXIT x.settled
       └ Not yet → [gate] → a.orient: one thing it grants + the route to use it
                            [email + in_app + push] → EXIT x.oriented
```

**Problems found:**
- **It is structurally identical to SUB-297.** 13 canonical / 10 display nodes on both, the same
  `trigger → 3-branch state condition → gate → message → wait → 2-branch condition → gate → message → exit`
  skeleton, the same four exit classes, the same `channelStrategy` roles, the same
  `fallback: next-eligible-role`, the same required persistent holdout. Verified: 13/10 on both. **Two of
  the four loyalty journeys are currently copies of each other.** This is resolved on SUB-297's side, below
  — **SUB-296's shape is the one that is correct for its moment** and must not be flattened toward SUB-297.
- Push on `a.orient`, with no deliverability test anywhere in the graph. (scheduling; J's corpus rule)
- `a.record-no-action` and `x.no-action` **are drawn** here (unlike SCH-303/SCH-304, where they are
  absorbed), because `c.state`'s *"Already welcomed"* branch reaches `a.record-no-action` directly, so the
  in-degree test declines it and the gate rule correctly refuses to hide a node a still-drawn parent points
  at. Both rules are individually right; the outcome is that the canvas carries a bare Internal card.
  (scheduling; canvas P1-4, §2.2 Tier B)
- No `distinctFrom` row for SUB-299, which names it. (ownership D-17)

**Final orchestration:** combination — a **single** lifecycle confirmation, then one **event-or-timeout**
orientation. The first touch is a *response to something the member just did* and is unconditional on the
membership standing. The second exists only because *"members use what they hold without being told"*: the
wait resolves on `loyalty_benefit_used` (→ nothing more to say, `x.settled`) or times out (→ orient).
**The timeout arm is the touch; the event arm is the exit.** That is a clean event-or-timeout, and it is
**not** the shape SUB-297 should have.

**Final customer channels:** `a.welcome` → **email**. `a.orient` → **email**. (J binding, and its reason
for `a.orient` is the sharpest in the loyalty cluster and inverts the domain audit's: the orientation is
reached **precisely because the member has not engaged with the membership**, so *the membership's own
surface has already failed to reach them* — which is an argument against in-app, not for it. The scheduling
audit proposed in-app ahead of email here. J's reason for `a.welcome` is equally specific: *"somebody who
just enrolled does not yet know where 'where it lives' is, which is the reason it cannot be delivered
there."* **Push is dropped** — both audits agree, and J's corpus rule settles it.)

**Customer touch count:** **1–2.** Correct; cap 2 with `appliesTo: "all"` is right.

**Final flow:** shape unchanged.

**State re-checks:** `c.used` re-reads the membership's own usage record immediately before the orientation
(`s.used`); `a.orient` re-reads the record again at send time (`s.grant`). Good; nothing to add.

**Stop conditions:** enrolment reversed, membership cancelled or permission withdrawn → `x.closed`. Benefit
already used → `x.settled`, no orientation. Already welcomed → no-action; **it runs once per membership,
ever**. `s.sunset` stops it. SUB-298 or SUB-299 holding the membership → deferred and re-evaluated, not
queued (`s.contest`).

**Ownership / handoff:** **third in `membership-standing`** (SUB-298 > SUB-299 > SUB-296 > SUB-297),
`scope: subscription`, `onLoss: suppressed`. Ownership finds all six ordered pairs in this group already
resolved and internally complete — **do not reopen.** No handoffs. The boundaries against **RET-290** (first
purchase) and **ACT-12** (onboarding) are stated reciprocally and as suppressions (`s.purchase`,
`s.onboarding`) — the right shape for journeys on *different entities*, and the reason these are correctly
**not** an exclusion group. Ownership singles out the RET-290 ↔ SUB-296 pair as the corpus's cleanest entity
separation: a first purchase and a membership enrolment can be one moment and are two entities.
**Must not say:** anything that explains the product (ACT-12's) or makes a first-purchase bounceback
(RET-290's).

**Canonical changes needed:**
- `a.welcome`: `channelRoles` → `["persistent"]`.
- `a.orient`: `channelRoles` → `["persistent"]` (drop `low-friction` and `in-session`); drop `push` from
  `channelsDeclared`.
- `distinctFrom` += **SUB-299** (ownership D-17).

**Display-only changes needed:** absorb `a.record-no-action` **even where a real branch reaches it**, by
treating the bookkeeping node plus its exit as one absorbed unit when every non-collapsed parent edge is
itself a no-action branch — the narrower alternative being to draw the *"Already welcomed"* arm straight
into `x.no-action`. Either removes a bare Internal card from SUB-296, SUB-297 and SUB-298 at once. This is
R5.

**Renderer changes needed:** R1, R5, R9, R11.

---

## SUB-297 — Loyalty Program Nurture

**Purpose:** Tell a member what their membership is currently holding for them that they have not used, in
a bounded way that ends rather than a cadence that continues.

**Current flow:**
```
Trigger loyalty membership holds unused value
  → c.valid: is there still something real to say?
       ├ Membership no longer stands → EXIT x.closed
       ├ Nothing left to say → a.record-no-action → EXIT x.no-action
       └ Still unused → c.sendable [gate, absorbed]
  → a.explain: what is held, what it may be used for, until when [email + in_app + push]
  → w.act (until loyalty_benefit_used | loyalty_membership_ended | permission_withdrawn)
  → c.acted: has the member used it?
       ├ Used → EXIT x.used
       └ Still unused → [gate] → a.remind: "the same unused thing once more, adding nothing
                                 the explanation did not already have"
                                 [email + in_app + push] → EXIT x.nurtured
```

**Problems found:** — and this is the journey this part changes most.
- **It is a copy of SUB-296.** Same skeleton, same 13 canonical / 10 display node counts, same channel plan
  on both touches, same exit classes, same holdout, same `fallback: next-eligible-role`. Verified.
- **Its second touch adds nothing, by its own admission.** `a.remind`'s canonical text is *"Say the same
  unused thing once more, adding nothing the explanation did not already have."* A second touch **defined**
  as carrying no new information is the exact thing to cut, and cutting it is also what breaks the
  convergence with SUB-296.
- Both touches carry identical three-channel plans, including push on the message that states *"what it may
  be used for and until when"* — a list, on the channel least able to carry one. (J: *"Push carries one
  fact."*)
- **A class mismatch inside the journey itself:** `contact.defaultPriority: "promotional"` and
  `pressureClass: "promotional"`, but its `eligibility` gates on *"purpose-level permission for
  **lifecycle** communication"*. Already recorded in `audit/new-journey-collision-review.md` §3.2 as the
  CON-300 × SUB-297 `1S` finding. It should resolve to `promotional` on both, which is what `s.sunset` and
  the pressure class imply.
- `a.record-no-action` drawn, same shape as SUB-296. (canvas P1-4)

**Final orchestration:** combination — a **single** explanation, then one **conditional** branch on whether
the held subject actually expires, and on the expiring arm one **event-or-timeout** expiry notice anchored
to the subject's own expiry.

The second touch stops being *"the same thing again after a while"* and becomes *"this expires on DATE"* —
a different message, sent because a fact changed, timed against the subject's own expiry rather than against
the first message. Where the held subject has **no** expiry, there is nothing new to say and the journey is
one touch and closes.

**The signal already exists in the data and is not invented.** `c.valid`'s third branch reads *"the subject
has been used, **has expired**, or is no longer usable by this member"*, and `a.explain` already states
*"what it may be used for **and until when**"*. The subject's expiry is read and stated today; the journey
simply does not branch on whether there is one.

This gives the loyalty cluster four genuinely different second-touch rules: **SUB-298** has no second touch ·
**SUB-299** has none either · **SUB-296**'s is gated on *non-use after a window* · **SUB-297**'s is gated on
*the subject having an expiry* and timed to it.

**Final customer channels:** `a.explain` → **email**. `a.expiry-notice` *(replacing `a.remind`)* →
**email**. (J is binding on `a.explain`: a balance or benefit, what it may be used for, and until when —
three facts read from the record at the moment of sending (`s.record`) — and push carries one fact. In-app
and push both dropped. For the replacement stage J's row priced a message the canonical edit abolishes, so
it does not bind; **the scheduling audit proposed push there**, on the reasoning that the message is now
short and one step and that this *inverts* SUB-296 deliberately, the channel following the message rather
than the journey. **I declined the push**, for J's corpus reason rather than against the domain's logic:
nothing in SUB-297's graph tests whether a push can be delivered, and the brief forbids inventing a
reachability signal to make a journey look sophisticated. If a router contract is ever imported into the
loyalty cluster the way J prescribes for ACQ-289, this is the stage that should get it first.)

**Customer touch count:** **1–2**, and **1 wherever the subject does not expire.**

**Final flow:**
```
Trigger loyalty membership holds unused value
  → c.valid: is there still something real to say?
       ├ Membership no longer stands → EXIT x.closed
       ├ Nothing left to say → EXIT x.no-action        (bookkeeping hop absorbed, R5)
       └ Still unused → a.explain: what is held, what it may be used for, until when [email]
  → c.expires: does this subject have an expiry the member can still act before?   ← NEW
       ├ No expiry → EXIT x.explained        ← NEW (one touch, plan complete)
       └ Expires → w.act, re-anchored to the subject's own expiry approach point
                   (resolving on loyalty_benefit_used | loyalty_membership_ended
                    | permission_withdrawn)
            → c.acted: has the member used it?
                 ├ Used → EXIT x.used
                 └ Still unused → a.expiry-notice: "this expires on DATE" [email]  ← REWRITTEN
                                  → EXIT x.nurtured
```

**State re-checks:** `c.acted` before the second touch, unchanged, and **now also re-reading the expiry**.
`s.record` requires every claim re-read at send time. Keep both.

**Stop conditions:** the subject used, expired, or no longer usable → the instance closes; a *different*
unused subject opens its own instance after the cooldown (`s.bounded` — **the cooldown is what stops a
membership with several unused things becoming a standing campaign; keep it exactly as written**).
Membership ended or permission withdrawn → `x.closed`. `s.sunset` stops it. Any higher
`membership-standing` member holding the membership → suppressed (`s.contest`, `s.transactional`).

**Ownership / handoff:** **lowest in `membership-standing`**, `onLoss: suppressed`. **Do not reopen.** No
handoffs. `distinctFrom` **RET-293 / RET-294** (things to *buy* vs one thing already *held*) is stated
reciprocally and **must be preserved — with the expiry-anchored notice it becomes more important, not less,
because "this expires soon" is the sentence most likely to drift into an offer.** **Must not say:** anything
purchasable, and nothing that reads as an offer rather than as a fact about what is already held.

**Canonical changes needed:**
- Add condition **`c.expires`** after `a.explain`, two branches, reading the subject's own expiry from the
  membership record.
- Add exit **`x.explained`** (class `success`, `reEntry`: *"a different unused subject opens its own
  instance once the cooldown has run"*).
- Rewrite `a.remind` → **`a.expiry-notice`**: the content is the expiry, not a repetition.
- Re-anchor `w.act`: `relativeTo: "attribute"`, `attribute: "subject_expires_at"`, replacing the current
  unanchored `required: true` duration.
- `a.explain` and `a.expiry-notice`: `channelRoles` → `["persistent"]`; drop `push` and `in_app` from
  `channelsDeclared`.
- Resolve the `lifecycle` / `promotional` mismatch in `eligibility` to **promotional**.
- `loyalty_nurture.touches` rule text: *"one explanation, and one expiry notice only where the subject
  expires."*
- Populate `observes` on `c.valid`, `c.expires`, `c.acted`.

**Noted, because the domain audit flagged it as a product decision rather than a refactor:** if most
programmes' held benefits carry no expiry, SUB-297 becomes a one-touch journey almost always, and somebody
will read that as the nurture having been gutted. One touch is the correct answer in that case and the
branch makes it explicit rather than silent — **but this warrants an explicit product sign-off rather than
being slipped in with the channel changes.** The alternative that needs no sign-off is to cut `a.remind`
outright and leave SUB-297 at one touch, which breaks the SUB-296 convergence just as well and changes less.
**Do not re-flatten the two journeys into one shape under either option.**

**Display-only changes needed:** the same `a.record-no-action` absorption as SUB-296 (R5).

**Renderer changes needed:** R1, R5, R9, R11.

---

## SUB-298 — Reward Confirmation

**Purpose:** Confirm a state the membership actually reached — a reward earned, credited and usable — as
the record states it, and confirm nothing the record does not.

**Current flow:**
```
Trigger loyalty_reward_earned
  → c.state: is this reward a state the membership has actually reached, and still ours to
             confirm?
       ├ Not a reached state → EXIT x.closed
       ├ Nothing to send → a.record-no-action → EXIT x.no-action
       └ Confirm → a.confirm: what was earned, what it may be used for, until when
                   [email + in_app + push] → EXIT x.confirmed
```

**Problems found:**
- **Push on `a.confirm` contradicts the journey's own guardrail.** The `low-friction` role's `when` is
  *"the confirmation is short enough to carry the whole state"*; the guardrail is *"The confirmation states
  the reward record's own terms."* Terms are not short. (scheduling; J: *"the expiry is the part the member
  will need to check later, which makes this a record rather than a notification"*)
- `a.record-no-action` is absorbed but `x.no-action` is drawn, leaving a 6-node canvas with an exit whose
  parent is invisible. (scheduling; canvas §2.2 Tier B)
- Nothing else. **7 canonical nodes for a one-touch transactional confirmation is the right size.**

**Final orchestration:** **single** transactional confirmation. `Trigger → one three-way state decision →
one message → exit.` There is no wait, no second touch, no comparison, no holdout, and `measurement` has no
`businessOutcome` block — **because a confirmation is owed, not optimised. Do not add orchestration to this
journey.** It is `defaultPriority: "transactional"`, `pressureClass: "none"`, `localCap.appliesTo:
"non-mandatory"` with its one touch `mandatory: true`, so it is never traded against a marketing contact
budget, and `onLoss: "superseded"` rather than `suppressed`, so it loses only to a newer authoritative state
for the same reward. **All four of those are deliberate and correct.**

**Final customer channels:** **email**, alone. (J binding: what was earned, what it may be used for, and
**until when** — the expiry being the part the member will need to check later, which makes this a record;
and *"the in-product balance is the product's own display, not a second send"*, which is J's reason for
dropping in-app as well as push. The scheduling audit dropped push and kept in-app; the in-app is
superseded. J also lists this stage among the ones deliberately **not** on its true-fallback list: the gate
in front of it is binary — deliverable, or the instance records a no-action — and never picks between two
channels.)

**Customer touch count:** **1.** Fixed. One confirmation per reward record, and a redelivered event produces
no second copy (`s.duplicate`).

**Final flow:** unchanged.

**State re-checks:** `c.state` is the only one and the only one needed — it establishes credited (not
projected), membership active, no confirmation already recorded, deliverable destination.

**Stop conditions:** reversed or corrected before sending → `x.closed`, and **the correction is what gets
stated, under its own instance** (`s.reversed`). Not yet credited → not confirmed (`s.credited`). No
deliverable destination → no-action, **never forced onto another route** (`s.deliverable`).

**Ownership / handoff:** **highest in `membership-standing`** — *"a state the membership has actually
reached outranks every marketing-shaped message about it"* — and it yields to nothing in the group. No
handoffs. `distinctFrom` **SUB-297** (a fact about the record vs a claim about behaviour), **SUB-299** (one
reward vs the standing itself), **REM-157** (nothing has gone wrong here); the REM-157 side of that last row
is added in REM-157's section. Its **CON-300 × SUB-298 boundary is recorded as R in the collision review — a
transactional confirmation is not suppressed by a marketing sunset. Preserve.** **Must not say:** anything
about a reward that is projected, pending or reversed.

**Canonical changes needed:** `a.confirm`: `channelRoles` → `["persistent"]` (drop `low-friction` and
`in-session`); drop `push` and `in_app` from `channelsDeclared`. **Nothing else.**

**Display-only changes needed:** absorb `x.no-action` with its parent — the shared fix with SUB-296 and
SUB-297 (R5).

**Renderer changes needed:** R1, R5, R9, R11.

---

## SUB-299 — Loyalty Tier Upgrade

**Purpose:** Tell a member that their membership's standing has moved **up**, and say exactly what that
standing now grants that it did not before — and nothing else.

**Current flow:**
```
Trigger loyalty_tier_changed
  → c.direction: which way did the standing move, and is it in effect?
       ├ Moved down → EXIT x.out-of-scope        (no message, no handoff — deliberate)
       ├ No material movement → a.record-no-action → EXIT x.no-action
       └ Moved up and in effect → c.sendable [gate, absorbed]
  → a.announce: the standing now held, and what it grants that the previous one did not
    [email + in_app + push]
  → w.use (until loyalty_benefit_used | loyalty_membership_ended)  [collapsed into c.used]
  → c.used: has the new standing been used?
       ├ Used → EXIT x.adopted
       └ Not used → EXIT x.announced
```

**Problems found:**
- **Push on `a.announce`, the same contradiction as SUB-298:** the message is a difference list, and *"the
  delta is the content, and a delta is a comparison."* (scheduling; J)
- `a.record-no-action` drawn, same shape as SUB-296/297. (canvas P1-4)
- `w.use → c.used → x.adopted | x.announced` sends nothing on either arm; it is an observation window and
  the two exits differ only in what was measured. **Flagged and deliberately not changed** — see below.
- Nothing else. The downgrade refusal and the absence of a holdout are both right.

**Final orchestration:** **single** lifecycle announcement, with an in-graph refusal and a
measurement-only observation window. One touch. What distinguishes it from SUB-298 is not the number of
messages but the **refusal branch** and the **observation window**: this journey states in the graph that it
does not own the message a downgrade needs, and it holds the instance open afterwards to find out whether
the announcement meant anything.

**Preserve the refusal exactly as it is.** `loyalty_tier_changed` fires for downward movements too;
`c.direction` reads the programme's **own** ordering; a downward movement exits at `x.out-of-scope` (class
`no-action`) with **no message and no handoff**. There is no handoff **because no journey owns that message
and `validate:canonical` forbids a handoff to a non-existent target** — the refusal is honest rather than a
routing stub, and `x.out-of-scope`'s `reEntry` says so in plain words. **Do not add a target, do not add a
message, do not convert the branch into a suppression that hides it from the canvas.**

**Preserve `comparison: "none"` and the absence of a holdout.** *Withholding the news of a standing somebody
has actually earned is not an acceptable control.* SUB-296 and SUB-297 both carry required persistent
holdouts and this one deliberately does not — **that asymmetry is the design, not an omission**, and it
should be visible in the detail panel rather than looking like missing configuration. **Do not add
orchestration or a comparison to this journey.**

**Final customer channels:** **email**, alone. (J binding: the standing now held and what it grants that the
previous one did not, read from the programme's terms — a delta is a comparison and needs room. Push dropped
by both audits and by J's corpus rule; in-app dropped by J. The scheduling audit kept in-app and noted that
push *would* be defensible as a short nudge alongside the email where a programme's standings are a single
named thing and a live app audience exists — **but nothing in the data evidences either condition per
member, so the simpler plan wins and the reason is recorded here.**)

**Customer touch count:** **1.** Fixed. One announcement per change record; two upward movements close
together produce one announcement of the standing actually held.

**Final flow:** unchanged.

**State re-checks:** `c.direction` also checks *"no newer tier change exists"* — the supersession check is
inside the direction condition, which is economical and correct.

**Stop conditions:** downward or lateral movement → `x.out-of-scope`. Not yet in effect → no-action
(`s.effective`). Superseded by a newer change → the instance closes and the newer one speaks
(`s.superseded`). Permission withdrawn or no deliverable destination → no-action, never forced onto another
route (`s.permission`). `s.sunset` stops it. SUB-298 holding the membership → deferred (`s.contest`).

**Ownership / handoff:** **second in `membership-standing`**, below SUB-298 and above SUB-296 and SUB-297,
`onLoss: suppressed`. **Do not reopen.** No handoffs. It already names SUB-296; the reciprocal row is added
on SUB-296's side (ownership D-17). **Must not say:** anything about a downward or lateral movement, and
nothing about a reward record, which is SUB-298's.

**Canonical changes needed:** `a.announce`: `channelRoles` → `["persistent"]` (drop `low-friction` and
`in-session`); drop `push` and `in_app` from `channelsDeclared`. **Nothing else.**

**Display-only changes needed:** the `a.record-no-action` absorption shared with SUB-296/297/298 (R5).
**`w.use → c.used → x.adopted | x.announced` stays drawn**, and this is a deliberate refusal rather than an
oversight: the same `wait → did they use it?` shape appears in SUB-296 where it *does* change the path
(orientation or not), so a generic rule to hide it here would have to distinguish the two by "does a message
follow" — exactly the kind of structural predicate that erased business logic in five journeys the last time
a collapse rule was tightened. And `x.adopted` vs `x.announced` is this journey's only measure of an
announcement it is **forbidden** from A/B testing (`comparison: "none"`); hiding it would leave the canvas
implying the announcement is never evaluated at all.

**Renderer changes needed:** R1, R5, R9, R11.
