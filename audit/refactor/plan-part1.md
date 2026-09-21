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
