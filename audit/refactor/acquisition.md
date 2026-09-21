# Refactor audit — Acquisition (8 public journeys)

Phase 1, audit only. Scope: `ACQ-09` `ACQ-11` `ACQ-12` `ACQ-13` `ACQ-285` `ACQ-287`
`ACQ-288` `ACQ-289`. Evidence: `audit/public-journeys-current-state.json`
(canonical + rendered), `src/canonical/types.ts`, `src/lib/canonical-view.ts`,
`src/components/ui/JourneyCanvasNodes.tsx`, `production/surface-assignment.json`,
`src/canonical/events.ts`.

Ownership decisions listed in the brief (cart > selection, checkout > process,
payment failure > checkout, ACQ-285 > ACQ-09, ACQ-289 > ACQ-13) are treated as
settled and are **not** reopened anywhere below. `audit/collision-fixes.md` §2 and
`audit/new-journey-collision-review.md` N3 record why.

---

## 0. The finding that covers all eight

### 0.1 Primary/Fallback is a renderer default, not the data

`Touch.channelRoles` is documented in `src/canonical/types.ts` as:

> `channelRoles` is ORDERED: the first role whose strategy `when` holds is used —
> channel selection inside one touch, **which is neither touch progression (the
> touch order) nor delivery fallback (`channelStrategy.fallback`)**.

So the schema already states that an ordered role list is *conditional channel
selection*. `ChannelPriorityRow` (`JourneyCanvasNodes.tsx:251`) nonetheless labels
row 0 `Primary` / `Öncelikli` and every later row `Fallback` / `Yedek`,
unconditionally, for every communication card in the corpus. Delivery fallback is a
different field (`ChannelStrategy.fallback`) and is never read by the card.

That single default is the cause of every "Primary X / Fallback Y" card in this
domain. It is a **renderer defect measured against the corpus's own schema**, not a
data problem, and it is generic (it reads a closed 5-value `ChannelRole` enum), so
it satisfies the Phase 2.1 rule that a display fix must not branch on a journey id.

**What the rows should say instead** — derived, no new authored field required:

| shape in the data | what it means | how the card should read |
|---|---|---|
| 1 role, 1 channel | one route, no alternative | bare channel pill, **no label** |
| 1 role, n channels, `fallback: "same-role-other-channel"` | within-role substitution | `WhatsApp · otherwise SMS` |
| n roles, `fallback: "next-eligible-role"` | ordered conditional selection | `Push if reachable · otherwise Email` |
| two touches under a condition | segment-based treatment | each card names its segment; the Decision card carries the split |

Only the third row may ever be worded as a fallback, and only where the later
role's own `when` is the negation of the earlier one's reachability test (which is
the case in ACQ-11 t1, ACQ-12 t1, ACQ-13 t1, ACQ-287 t1/t2-std, ACQ-288 t1/t2-std,
ACQ-289 t1 — and nowhere else in this domain).

An optional strengthening, if the implementer prefers authored over derived: add
`Touch.channelPattern?: "single" | "sequential" | "conditional" | "parallel" |
"fallback" | "segment-based" | "event-or-timeout"` to `types.ts` and label the rows
from it. It is a cross-domain decision; the derivation above needs no canonical edit
and is recommended first.

### 0.2 An ordered role list whose second role can never be selected

Three touches in this domain declare a second role that their own role `when`
clauses make unreachable, and the card draws a fallback that cannot occur:

- **ACQ-11 t2** `["persistent", "low-friction"]` — `persistent.when` is *"no
  low-friction route exists, **or** the touch has to carry the items and survive
  until the person can act"*. t2 carries the process, so the disjunction is always
  true and `low-friction` is dead. Card says `Primary Email / Fallback Push`.
- **ACQ-12 t2** `["persistent", "low-friction"]` — identical.
- **ACQ-11 t3** `["persistent", "urgent"]` — same mechanism; `urgent` (SMS) is dead.
  Here the order is simply backwards: see ACQ-11 below.

### 0.3 Two Turkish card titles are missing

`TOUCH_STAGE_TR` (`JourneyCanvasNodes.tsx`) has no row for `educate-again`
(ACQ-09 `a.educate2`) or `availability-alert` (ACQ-289 `a.alert`). Both fall through
to the generic kind label, so the TR reader gets **Mesaj** where the EN reader gets
**Educate again** / **Availability alert**. Verified on the rendered export. Adding
the two rows is the whole fix. (`initial-reminder`, `second-reminder`,
`second-reminder-high-value` render a TR title only by accident — they are matched
by `ACTION_TITLE_TR_RE` against the action's prose, not by the stage table. Rows for
them would make that deliberate.)

### 0.4 Customer-facing channel inventory

Every journey in this domain has at least one genuine customer-facing communication
action. Nothing internal is presented as a channel anywhere. The one human route,
ACQ-285's `h.person`, is a **handoff** to `external:sales-assignment` and is drawn
as a Handoff card — correct, and it must stay a handoff, never a channel.

---

## ACQ-09 · Lead Nurture

**Purpose.** Give a legitimate but not-yet-ready lead a window of useful education
that ends whether or not it worked. Bounded by design — a fixed window, two touches,
and a sunset that is a fact about the attempt, not a judgement about the person.

### Current flow

```
Trigger valid_lead_not_destination_ready
  → Decision "permission and lawful basis for this kind of communication?"
      ├─ No basis ────────────────────────────────→ Exit  held, no nurture started
      └─ Basis exists → Educate #1  [In-app / Email]
           → Wait  bounded_education.second_touch
                until nurture_progression_signal | permission_withdrawn | contactability_lost
              ├─ timeout → Decision "is the lead still the lead this window opened for?"
              │     ├─ Progressed meanwhile ─────→ Handoff ACQ-03 Intent Escalation
              │     ├─ Permission withdrawn ─────→ stop → Exit  permission no longer covers it
              │     ├─ Route lost ──────────────→ stop → Exit  no permitted route
              │     └─ Still not ready → Educate #2  [In-app / Email]
              │          → Wait  bounded_education.window (same until-set)
              │             ├─ timeout → close window → Exit  sunset, no progression
              │             └─ event ──→ Decision "what ended the wait?"
              └─ event ────────────────→ Decision "what ended the wait?"
                                            ├─ They progressed → Handoff ACQ-03
                                            ├─ Permission withdrawn → Exit
                                            └─ Route lost → Exit
```

### Problems found

1. **Both educate cards read `Primary In-app / Fallback Email`.** A lead who is not
   ready for a destination is, by this journey's own trigger, not in the product.
   The `in-session` role's `when` is *"the person is active in the product and the
   action is taken there"*; education is content that must be kept and re-read,
   which is `persistent`'s own `when` verbatim. The in-session role is unreachable
   in practice and the "fallback" is asserting a substitution that never happens.
2. `channels: ["email", "in-app"]` overstates the journey by one channel.
3. TR title gap on `a.educate2` (§0.3).
4. Everything else is right. The bounded window, the non-extension on engagement
   (`windowExtendsOnEngagement: false` on both waits), the progression re-check and
   the sunset are exactly the behaviour the brief asks to preserve.

### Final orchestration

**Sequential — two bounded touches, each stage single-channel.**
Chosen because the two touches are one plan with a fixed length (`contactCap`
`bounded_education.touches` = 2, basis `corpus-rule`), and because no second channel
substitutes for email at either stage: there is no reachability condition under
which a different route does the same job. `single` per stage, `sequential` across
the journey. No fallback, because nothing is being fallen back from.

**Final customer channels:** `email`.
**Customer touch count:** 2.

### Final flow

```
Trigger valid_lead_not_destination_ready
  → Decision "permission and lawful basis?"
      ├─ No basis ─────────────────────→ Exit  held, no nurture started
      └─ Basis exists → Email #1  Education matched to the entry reason
           → Wait  second_touch  (progression | permission withdrawn | route lost)
              ├─ event  → Decision "what ended the wait?" → Handoff ACQ-03 / Exit / Exit
              └─ timeout → Decision "is the lead still the lead this window opened for?"   ◀ RE-CHECK
                    ├─ Progressed meanwhile ──→ Handoff ACQ-03
                    ├─ Permission withdrawn ──→ Exit
                    ├─ Route lost ───────────→ Exit
                    └─ Still not ready → Email #2  Last education of the window
                         → Wait  window  → timeout → Exit  sunset
                                         → event  → Decision "what ended the wait?"
```

### State re-checks

`c.still-open` sits between the first wait and the second touch and re-reads the
lead from the system of record: a recorded progression signal, the permission
position, and destination deliverability. **Confirmed present and required** — this
is what the brief asked to verify. Suppression `s.progressed` states the same rule
in prose: *"The second education is never sent to a lead that has already
progressed."* Keep both; the suppression and the node must not be allowed to drift
apart.

### Stop conditions

`nurture_progression_signal` (→ handoff, not an exit), `permission_withdrawn`,
`contactability_lost`, `bounded_education.window` timeout (→ sunset), and the
sender-side `marketing_suppression` CON-300 writes (`s.sunset`), which is a hard gate
under GLB-31 and is invisible to a purpose-level permission check.

### Ownership / handoff

ACQ-285 owns initial lead contact; this journey is ineligible while an ACQ-285
instance is open on the capture the lead came from and may start only once that
window closes and its own entry conditions are still true (`s.first-touch`).
Progression hands off to **ACQ-03 Intent Escalation Handoff**, which is a routed
customer journey but not one of the 69 library journeys, so the card correctly shows
its name as text rather than a link. Unchanged.

### Canonical changes needed

1. `channels: ["email"]` (drop `"in-app"`).
2. `channelStrategy.roles`: drop the `in-session` role; keep `persistent` → `email`.
   `fallback` becomes moot with one role; leave `"same-role-other-channel"` or set
   `"none"` — either is honest, `"none"` is clearer.
3. `orchestration.touches[t1].channelRoles` and `[t2].channelRoles` → `["persistent"]`.

Nothing structural. No node added, removed or re-pointed.

### Display-only changes needed

Both educate cards show a single **Email** pill and no Primary/Fallback labels
(falls out of §0.1 row 1 plus the canonical change above).

### Renderer changes needed

§0.1 (single-role/single-channel → bare pill) and §0.3 (`educate-again` row in
`TOUCH_STAGE_TR`). Nothing journey-specific.

---

## ACQ-11 · Abandoned Process Recovery

**Purpose.** Return a person to a resumable process they started and did not
complete — a checkout, an application, a quote, a registration — while it is still
resumable, without ever asserting a state the system does not hold. This is the
**generic** pattern; ACQ-287 is its checkout specialisation.

### Current flow

```
Trigger process_started
  → Decision "can this process be recovered for this person at all?"
      ├─ Not eligible → Exit  no touch sent, reason recorded
      └─ Eligible → open instance, clock from last_activity_at
           → Wait  recovery.first_check (30–60 min, from last_activity_at)
                until completed | cancelled | expired | items_removed_all | payment_failed
           → Decision "what is the process now?"                                  ◀ RE-CHECK
               ├─ Completed → Exit converted   ├─ Cancelled/expired/emptied → Exit invalid
               ├─ Superseded → Exit superseded ├─ Payment failed → Handoff FIN-134
               └─ Still resumable → Decision "may the first touch go out?"
                     ├─ Suppressed → record gate → Exit no-action
                     └─ Sendable → Touch #1  [Primary Push+In-app / Fallback Email]
                          → Wait  recovery.second_check (20–28 h)
                          → Decision "what is the process now, and did they come back?"  ◀ RE-CHECK
                              ├─ Completed / Cancelled / Superseded / Payment failed → as above
                              ├─ Resumed, still open → note return → Wait first_check again ─┐
                              └─ Still open, not resumed → Decision "may the 2nd touch go out?"
                                    ├─ Suppressed → record → Exit no-action
                                    └─ Sendable → Touch #2  [Primary Email / Fallback Push]
                                         → Wait recovery.lifetime (3–7 d)
                                         → Decision "at the end of the lifetime, what is it?"  ◀ RE-CHECK
                                             ├─ Completed / Cancelled / Superseded / Payment → as above
                                             └─ Still open → Decision "final notice enabled,
                                                              and is there a real expiry to name?"
                                                   ├─ Disabled or no honest expiry → Exit lapsed
                                                   └─ Enabled → Touch #3 [Primary Email / Fallback SMS]
                                                        → Wait until expires_at
                                                            ├─ timeout → Exit lapsed
                                                            └─ event → Decision "what ended it?"
```

### Problems found

1. **Touch 2 draws a fallback that cannot happen** (§0.2). `["persistent",
   "low-friction"]` with a content-carrying touch means email always wins;
   `Fallback Push` is decoration.
2. **Touch 3's roles are in the wrong order and therefore also dead.** The final
   notice is the *one* touch the journey proves has a real, platform-asserted expiry
   — `c.final-enabled` will not let it through otherwise — and "an asserted
   time-bound element" is exactly `urgent.when`'s condition. Declared
   `["persistent", "urgent"]`, so `urgent` never fires. The card reads
   `Primary Email / Fallback SMS`, which is both unreachable and the wrong
   relationship: SMS here is not a substitute for email, it is the channel a real
   deadline plus explicit SMS permission earns.
3. Touch 1 is the one genuine fallback in the journey and is currently drawn
   identically to the two that are not — so the canvas gives the reader no way to
   tell the real substitution from the two fabricated ones.
4. Three touches is the top of the preferred range. It is justified: touch 3 sits
   behind **two** gates — a company switch (`recovery.final_notice_enabled`) and an
   honest-expiry test — so the default path is two touches, and the third only
   exists where there is a real deadline to name.

### Final orchestration

**A justified combination — a sequential three-stage progressive recovery whose
stages each use a different channel pattern**, because the three business moments
are genuinely different:

- **Stage 1 — fallback.** Minutes-to-an-hour after the person left. The job is a
  nudge back. Push/in-app if a route is reachable; **email substitutes only because
  the nudge cannot be delivered otherwise**. This is the brief's definition of a
  legitimate fallback.
- **Stage 2 — single.** A day later, the touch addresses the likely blocker and has
  to carry that content and survive until the person acts. Only the persistent route
  can do that job, so there is one channel and no alternative.
- **Stage 3 — conditional routing.** Reached only where the platform asserts a real
  expiry. SMS when explicit commercial SMS permission is on file; email otherwise.
  Not a fallback: SMS is not standing in for a failed email, it is the channel the
  asserted deadline justifies.

**Final customer channels:** `push`, `in_app` (stage 1 only), `email`, `sms` (stage 3
only).
**Customer touch count:** 3 max, 2 on the default path.

### Final flow

Structurally unchanged from Current flow above. The three touch cards become:

```
Touch #1   Push or In-app if reachable · otherwise Email
Touch #2   Email
Touch #3   SMS when an expiry is asserted and SMS permission is on file · otherwise Email
```

### State re-checks

Best in the domain, and to be preserved exactly. Every touch is reached only through
a condition that has just re-read the process: `c.state` before touch 1, `c.state2`
before touch 2, `c.state3` **and** `c.final-enabled` before touch 3, `c.close` after
it. The re-entry loop (`a.note-return` → `w.resumed` → `c.state2`) holds the second
touch once for a person who came back and left again rather than skipping or hurrying
it — a genuinely good piece of design; keep it and keep it drawn.

### Stop conditions

`process_completed` (any channel, including offline), `process_cancelled`,
`process_expired`, `items_removed_all`, `payment_failed` (→ FIN-134), supersession by
a newer logical process, `recovery.lifetime` expiry, the platform's own `expires_at`,
any send-path gate (→ recorded no-action), and the CON-300 sender-side suppression.

### Ownership / handoff

Below **ACQ-287** for checkouts (suppressed for that process while ACQ-287 holds it)
and above every held selection, inferred interest and predicted need. Receives from
**ACQ-12** when a process starts from a selection. Hands off to **FIN-134** on payment
failure — payment failure is not abandonment. All settled; unchanged.

### Canonical changes needed

1. `orchestration.touches[t2].channelRoles` → `["persistent"]`.
2. `orchestration.touches[t3].channelRoles` → `["urgent", "persistent"]` (order
   reversed).
3. Optional but clarifying: tighten `channelStrategy.roles[urgent].when` to read
   *"explicit commercial SMS permission is recorded and the platform asserts the
   time-bound element the final notice names"*, so the role's condition points at
   `c.final-enabled` rather than restating it loosely.

No node added, removed or re-pointed.

### Display-only changes needed

The three touch cards stop reading alike; see Final flow. The contrast between
stage 1 (a real substitution) and stage 3 (a real routing decision) becomes visible
without a single extra node.

### Renderer changes needed

§0.1 only.

---

## ACQ-12 · Abandoned Selection Recovery

**Purpose.** Return a person to items they selected — a cart, a basket, a saved list
— and did not carry into a process, while the selection still stands and the items
are still available. Generic; ACQ-288 is its cart specialisation.

### Current flow

```
Trigger selection_recorded
  → Decision "can this selection be recovered at all?"  ├─ Not eligible → Exit no-action
      └─ Eligible → open instance, clock from last_selection_activity_at
           → Wait  selection.first_check (1–4 h)
                until converted | cleared | process_started | selection_changed
           → Decision "what is the selection now?"                                ◀ RE-CHECK
               ├─ Converted → Exit converted
               ├─ Cleared → Exit invalid
               ├─ Carried into a process → Handoff ACQ-11
               ├─ Changed, still held → re-arm the first wait  ──────────────────┐ (loop)
               └─ Still held → Decision "can any of it still be acted on?"
                     ├─ Nothing available → Exit  every item unavailable
                     └─ At least one available → Decision "may the 1st touch go out?"
                           ├─ Suppressed → record → Exit no-action
                           └─ Sendable → Touch #1  [Primary Push+In-app / Fallback Email]
                                → Wait  selection.second_check (2–4 d)
                                → Decision "what is the selection now, and did anything change?" ◀ RE-CHECK
                                    ├─ Converted / Cleared / Process started / Nothing available → as above
                                    └─ Still held → Decision "may the 2nd touch go out?"
                                          ├─ Suppressed → record → Exit no-action
                                          └─ Sendable → Touch #2  [Primary Email / Fallback Push]
                                               → Wait  selection.lifetime (7–14 d)
                                               → Decision "at the end of the lifetime, what is it?" ◀ RE-CHECK
                                                   └─ Still held → Exit lapsed
```

### Problems found

1. **Touch 2's fallback cannot happen** (§0.2) — identical to ACQ-11 t2 and
   identical in cause.
2. **The re-arm loop is bounded in prose only.** `a.rearm` says *"re-arm the first
   wait from the new last activity, **a bounded number of times**"*, but there is no
   Config carrying that number and no branch that fires when the budget is spent.
   The loop `c.state → a.rearm → w.settle → c.state` is, as drawn, unbounded for a
   person who keeps editing a selection. `scripts/validate-public-scope.mjs` checks
   that every *wait* is bounded, which this passes; the *loop* is not, and that is
   the thing a reader would ask about.
3. The availability gate (`c.availability`) is genuinely good and specific to this
   journey — never message somebody about items none of which can be bought. Keep it
   drawn; it is a business decision, not an implementation gate.

### Final orchestration

**Sequential — two touches, stage 1 fallback, stage 2 single.** Same reasoning as
ACQ-11 stages 1 and 2, and deliberately the same shape, because this journey is the
same pattern one level up the commerce chain. There is no third touch and no final
notice, because a held selection has no expiry to name honestly — the journey's own
`distinctFrom[ACQ-11]` says exactly that.

**Final customer channels:** `push`, `in_app` (stage 1 only), `email`.
**Customer touch count:** 2.

### Final flow

Structurally as above, with:

```
Touch #1   Push or In-app if reachable · otherwise Email
Touch #2   Email
Changed, still held → re-arm  (bounded: selection.rearm_limit)
        └─ budget spent → Decision "can any of it still be acted on?"   ◀ new fall-through
```

### State re-checks

`c.state` (5-way) before touch 1, `c.availability` immediately after it, `c.state2`
before touch 2, `c.state3` at lifetime end. Two independent re-checks stand between
the first touch and the second: state, then sendability. Correct; keep.

### Stop conditions

`selection_converted`, `selection_cleared`, `process_started` (→ handoff to ACQ-11),
every item unavailable, `selection.lifetime`, any send-path gate, CON-300 suppression.

### Ownership / handoff

Suppressed for a selection **ACQ-288** holds (a cart is a selection, and the cart
implementation outranks the generic pattern). Hands the instance to **ACQ-11** the
moment a process starts from the selection. Above ACQ-13 and above RET-31 for the
same person. Settled; unchanged.

### Canonical changes needed

1. `orchestration.touches[t2].channelRoles` → `["persistent"]`.
2. Add a Config `selection.rearm_limit` (class `cooldown`-style budget, honest
   `basis`, `required: false` with a low-confidence default is acceptable) and give
   `a.rearm` a budget-spent path that falls through to `c.availability` instead of
   back to `w.settle`. This makes the prose's "a bounded number of times" true in
   the graph.

### Display-only changes needed

Touch 2 shows a single Email pill. The re-arm back-edge should carry its bound on the
card so the loop reads as bounded at a glance (the back edge is already drawn;
`estimatedLabelWidth`'s budget applies).

### Renderer changes needed

§0.1 only.

---

## ACQ-13 · Unresolved Interest Recovery

**Purpose.** Follow up qualified, unresolved attention — browsing that ended in
neither a selection nor a process — with **at most one touch**, and record no-action
as the normal outcome whenever the attention does not qualify.

### Current flow

```
Trigger interest_signal_recorded
  → Decision "does this attention qualify as interest, and is it still unresolved?"
      ├─ Already resolved → Exit resolved
      ├─ Does not qualify → record reason → Exit  no touch sent  (the common outcome)
      └─ Qualified → open instance, clock from last_interest_at
           → Wait  interest.settle_window (12–48 h)
              ├─ event (selection | process | purchase) → Exit resolved
              └─ timeout → Decision "still unresolved, and is its subject still there?"  ◀ RE-CHECK
                    ├─ Resolved meanwhile → Exit resolved
                    ├─ Subject gone → Exit  nothing sent about something they cannot act on
                    └─ Unresolved, available → Decision "may the touch go out?"
                          ├─ Suppressed → record → Exit no-action
                          └─ Sendable → Touch #1  [Primary Push+In-app / Fallback Email]
                               → Wait  interest.lifetime (3–7 d)
                                  ├─ event → Exit resolved
                                  └─ timeout → Exit  touched once, not resolved
```

### Problems found

1. Nothing structural. This is the cleanest single-notice in the domain: one touch,
   an explicit qualification gate before any instance opens, no-action named as the
   expected outcome in the exit's own state text, and a settle window whose `onEvent`
   goes straight to the success exit with no intervening condition.
2. The only defect is the wording: the card says `Primary Push+In-app / Fallback
   Email` where the relationship is real but the label is generic — the reader cannot
   tell this legitimate fallback from ACQ-11 t2's fabricated one.

### Final orchestration

**Fallback.** One of the three places in this domain where the word is earned: the
desired treatment is an in-the-moment route back to a thing the person was just
looking at, and email substitutes **only** because no push or in-app route is
reachable (`persistent.when`: *"no low-friction route exists"*). One touch, so there
is no sequence and no progression to express.

**Final customer channels:** `push`, `in_app`, `email`.
**Customer touch count:** 1.

### Final flow

Unchanged. Card reads:

```
Touch #1   Push or In-app if reachable · otherwise Email
```

### State re-checks

`c.qualify` at entry, `c.state` after the settle window (resolution *and* subject
availability), `c.sendable` immediately before the send. No later touch, so no
further re-check is owed. Correct.

### Stop conditions

`selection_recorded`, `process_started`, `purchase_completed` (all → resolved),
subject unavailable, any send-path gate, `interest.lifetime`, CON-300 suppression.

### Ownership / handoff

No handoff — resolution is an exit, because the journey that owns a selection,
process or purchase picks it up on its own trigger. Bottom of the commerce-recovery
group; **yields to ACQ-289** and is suppressed for a person that alert holds. No
change, and `audit/collision-fixes.md` §2 is not reopened.

### Canonical changes needed

**None.**

### Display-only changes needed

Card wording only, from §0.1.

### Renderer changes needed

§0.1 only.

---

## ACQ-285 · New Lead Welcome

**Purpose.** Answer a declared interest with the thing that interest actually asked
for, and carry it onward only as far as what the person said about themselves
justifies. Owns the initial lead contact window, ahead of ACQ-09.

### Current flow

```
Trigger first_party_interest_captured
  → Decision "is the destination they supplied actually usable for this?"
      ├─ Not usable → Decision "what did they ask for, given we cannot deliver?"
      │                 ├─ Asked for a person → Handoff external:sales-assignment
      │                 └─ Asked for the material → Exit  nothing deliverable
      └─ Usable → Decision "what did the person actually declare?"
            ├─ Asked for a person → Email  what they asked for + when a person will follow up
            │                         → Handoff external:sales-assignment
            └─ Asked for the material → Email  exactly what was asked, once, nothing alongside
                  → Decision "is there permission to continue past fulfilment?"
                      ├─ Fulfilment only → Exit  fulfilled, no continuing contact permitted
                      └─ Permitted → "Open a bounded sequence …"   ◀◀ one node, N messages
                           → Wait  captured_interest.nurture (until destination_declared
                                                              | permission_withdrawn)
                               ├─ timeout → Exit  sequence ended, no destination declared
                               └─ event → Decision "what ended the sequence?"
                                     ├─ Readiness declared → Handoff sales
                                     └─ Stopped → Exit  stopped at the person's request
```

### Problems found

1. **`a.nurture` is one card standing for an unknown number of sends.** Its own text
   is *"Open a bounded sequence on the subject they declared"*. Meanwhile
   `contactCap` (`captured_interest.touches`, default 2, confidence **high**) says
   *"the reachable maximum on one path — the person-led request and the material
   request are mutually exclusive, so fulfilment and the bounded sequence are the
   most any one instance sends"*. **The cap counts a whole sequence as one touch.**
   This is the clearest case in the domain of the data contradicting a journey's own
   purpose: either the cap is wrong or the node is, and as drawn the canvas shows a
   reader one message where the journey may send five.
2. **No state is re-read between fulfilment and the sequence's messages.**
   `c.permission` is checked once, before the sequence opens. Nothing re-reads
   whether the person has since declared readiness (which would make further welcome
   messages redundant — the sales handoff owns them from that point) before each
   message inside the sequence. Every sibling journey in this domain re-checks; this
   one does not.
3. Minor: `c.email-route` names a channel in a node id on a journey whose channel
   strategy is deliberately generic. The question it asks — "is the contact point
   they gave usable?" — is the right question; the id leaks the implementation.
4. The orchestration lists t1 and t2 as two first touches with no `after`, which is
   correct (they are mutually exclusive branches) but is not stated anywhere a reader
   can see; the cap's own prose is the only place that explains it.

### Final orchestration

**Conditional routing on what the person declared, then a sequential two-touch
welcome on the material arm.** Not segment-based: `c.declared` reads a *declared
fact about this specific request* (did they ask for a person, or for material),
not a segment the company assigns. Single channel at every stage.

Why not a longer sequence: ACQ-09 exists, is the bounded education journey, and is
explicitly ineligible only *while this window is open*. Keeping the welcome to two
messages and letting ACQ-09 take any further education is what the settled ownership
rule already implies, and it makes the stated cap of 2 true.

**Final customer channels:** `email`.
**Customer touch count:** 2 maximum on any one path (1 on the person-led arm and on
the fulfilment-only arm).

### Final flow

```
Trigger first_party_interest_captured
  → Decision "is the contact point they gave usable for this?"
      ├─ Not usable → Decision "what did they ask for?"
      │                 ├─ Asked for a person → Handoff sales assignment
      │                 └─ Asked for material → Exit  nothing deliverable
      └─ Usable → Decision "what did the person actually declare?"
            ├─ Asked for a person → Email #1  what they asked for + when a person follows up
            │                         → Handoff sales assignment
            └─ Asked for material → Email #1  exactly what was asked, once
                  → Decision "permission to continue past fulfilment?"
                      ├─ Fulfilment only → Exit  fulfilled
                      └─ Permitted → Wait  welcome.follow_up
                                        (until destination_declared | permission_withdrawn)
                            ├─ event → Decision "what ended it?" → Handoff sales / Exit stopped
                            └─ timeout → Decision "is this still a lead with nothing declared?" ◀ RE-CHECK
                                  ├─ Readiness declared → Handoff sales assignment
                                  ├─ Permission withdrawn → Exit stopped
                                  └─ Still open → Email #2  one further message on the declared
                                                  subject, stating this is the last of the
                                                  welcome and what happens next
                                       → Wait  welcome.window
                                           ├─ event → Decision "what ended it?"
                                           └─ timeout → Exit  welcome ended, no destination declared
```

### State re-checks

New `c.still-open` before the second message, reading: has a destination been
declared since fulfilment, does the permission recorded at capture still stand, and
is the contact point still deliverable. Never send the welcome's closing message to
somebody who has already declared readiness — the sales handoff owns them.

### Stop conditions

`destination_declared` (→ sales handoff), `permission_withdrawn`, no deliverable
destination at entry, `welcome.window` timeout, CON-300 suppression (`s.sunset`).

### Ownership / handoff

**Owns initial lead contact before ACQ-09** — settled, not reopened. ACQ-09's
`s.first-touch` and eligibility both name this journey; when this one's window closes
(`x.delivered`, `x.sunset`, `x.stopped`) ACQ-09 may start if its own entry conditions
are still true. Hands off to `external:sales-assignment` on the person-led arm and on
declared readiness. The handoff is a handoff, never a channel.

### Canonical changes needed

1. Replace `a.nurture` with `a.follow-up`: **one** communication action, not a
   sequence. Text along the lines of *"Send one further message on the subject they
   declared, saying plainly that this is the last of the welcome and what happens
   next. A sequence with no stated end is a subscription nobody agreed to."*
2. Insert `c.still-open` between the new first wait and `a.follow-up` (branches:
   *Readiness declared* → `h.person`; *Permission withdrawn* → `x.stopped`; *Still
   open* → `a.follow-up`).
3. Re-point `w.nurture`: it becomes the wait **before** the follow-up
   (`captured_interest.nurture` → `welcome.follow_up`, class `response-window`), and
   a second wait `w.window` (`welcome.window`, class `observation-window`) becomes the
   post-touch observation window feeding the existing `c.progressed` /
   `x.sunset` / `x.stopped` terminals.
4. `orchestration.touches[t3]` gains `after: "t2"`, `gatedBy: "w.follow-up"` and
   `prerequisites: ["c.permission", "c.still-open"]`; its `stage` becomes
   `follow-up` (already in `TOUCH_STAGE_TR`) rather than `nurture`.
5. `contactCap` prose updated to describe two *messages*, not "fulfilment and a
   sequence". The number 2 stays; it becomes true.
6. Optional: rename `c.email-route` → `c.contactable`.

### Display-only changes needed

The three message cards keep a single Email pill and lose the "Primary" label
(§0.1 row 1). Node count goes 15 → 17 canonical (+2: the re-check and the second
wait), display 17 → ~19; the increase buys the reader a correct touch count.

### Renderer changes needed

§0.1 only.

---

## ACQ-287 · Checkout Abandonment Recovery

**Purpose.** Return a person who started checkout but did not finish, reaching for
the highest-value checkouts on a more direct channel, and never sending once the
purchase is already there.

### What the graph actually does

Stripped of the router prose, it is:

- 45 minutes after `checkout_started`, re-read completion and payment failure.
- **Touch 1** on whichever route is reachable: push if a current device registration
  and its permission stand, otherwise email. If neither clears both permission and
  reachability, nothing is sent and the instance goes straight to the next wait.
- 6 hours later, re-read completion and payment failure, then **split on checkout
  value** against a company-configured threshold:
  - **high-value** → a direct phone channel, WhatsApp if the number is reachable on
    WhatsApp, otherwise SMS, in a more direct register;
  - **standard** → the same reachability choice as touch 1.
- 24 hours later, re-read once more: completed → success, payment failed → FIN-134,
  otherwise abandoned.

That is **segment-based routing at touch 2, with a reachability fallback inside each
arm** — not the Primary/Fallback pair the cards currently show.

### Current flow

```
Trigger checkout_started
  → Wait 45 min (until process_completed | payment_failed)
  → Decision "is the checkout completed, and is it still this journey's to recover?" ◀ RE-CHECK
      ├─ Completed → Exit purchased   ├─ Payment failed → Handoff FIN-134
      └─ Not completed → [router: permission + reachability + contest re-read, hidden]
                          → Touch #1  [Primary Push / Fallback Email]
           → Wait 6 h → Decision (same three branches)                               ◀ RE-CHECK
                └─ Not completed → Decision "is this a high-value checkout?"
                      ├─ High-value → [router] → Touch #2-hv  [Primary WhatsApp SMS]
                      └─ Standard   → [router] → Touch #2-std [Primary Push / Fallback Email]
           → Wait 24 h → Decision "at the end of the cascade, what is the checkout?"  ◀ RE-CHECK
                 ├─ Completed → Exit purchased  ├─ Payment failed → Handoff FIN-134
                 └─ Not completed → Exit abandoned
```

### Problems found

1. **The value split — the whole point of the journey — is invisible in the channel
   presentation.** Both second-touch cards say "Primary …"; only the Decision card
   above them says why there are two. And the high-value card renders
   `Primary WhatsApp SMS` as one undifferentiated row, losing the WhatsApp→SMS order
   the router prose states.
2. **A cancelled or expired checkout is never detected.** All three waits watch only
   `process_completed` and `payment_failed`, and all three conditions branch only
   *Completed / Payment failed / Not completed*. `checkout_cancelled` and
   `checkout_expired` both exist in `src/canonical/events.ts` and neither is used.
   The generic pattern this journey specialises (ACQ-11) handles cancelled, expired
   and emptied; its specialisation handles none of them — so ACQ-287 will send touch
   2 and its final re-check against a checkout the person cancelled. **This is a
   correctness defect, not a presentation one.**
3. **The send-path gate is hidden inside router prose.** Permission, reachability,
   the promotional pressure cap and the commerce-recovery contest re-read are all
   folded into `a.router1` / `a.router2-*`, which the display collapses into the
   message card. A reader cannot see that the contest is re-read before each touch.
   Every sibling (ACQ-11/12/13/289) draws that as a `c.sendable` condition.
4. **No-action is under-measured.** `measurement.operational` has
   `no_channel_available_rate`, which covers only the "neither route is reachable"
   reason; the same router can also decline for permission, pressure cap or contest,
   and none of those is counted, written to `suppressed_sends`, or reachable as a
   node. The corpus convention — *"no-action is a measured outcome rather than a
   silent absence"* — is stated in four sibling journeys and broken here.
5. `channelStrategy.roles[urgent].when` restates the high-value threshold that
   `c.highvalue` already owns. The segment should live in one place.

### Final orchestration

**Segment-based at touch 2, over a sequential two-touch cascade, with a reachability
fallback inside each arm.** A justified combination, and each half earns its place:

- the **segment** is a real treatment change, not a channel preference — a
  high-value checkout gets a different register *and* a direct personal channel, and
  the signal is `checkout_value` against a company-configured threshold, which is
  already read by `c.highvalue` and already drawn;
- the **fallback** inside each arm is reachability, the legitimate kind: push
  substituted by email when no device registration clears, WhatsApp substituted by
  SMS when the number is not reachable on WhatsApp.

**Final customer channels:** `push` + `email` (touch 1, and the standard arm of touch
2) · `whatsapp` + `sms` (high-value arm of touch 2).
**Customer touch count:** 2.

### Final flow

```
Trigger checkout_started
  → Wait 45 min  (until process_completed | payment_failed | checkout_cancelled | checkout_expired)
  → Decision "what is the checkout now?"                                            ◀ RE-CHECK
      ├─ Completed ──────────────→ Exit  purchased
      ├─ Payment failed ─────────→ Handoff FIN-134
      ├─ Cancelled or expired ───→ Exit  closed unfinished          ◀ NEW
      └─ Still open → Decision "may this reminder go out?"           ◀ NEW (promoted from router)
            ├─ Suppressed → record the gate → (rejoin the next wait, nothing sent)
            └─ Sendable → Touch #1   Push if reachable · otherwise Email
  → Wait 6 h (same until-set)
  → Decision "what is the checkout now?"                                            ◀ RE-CHECK
      ├─ Completed / Payment failed / Cancelled or expired → as above
      └─ Still open → Decision "is this checkout at or above the high-value threshold?"
            ├─ High-value → Decision "may this reminder go out?"
            │      └─ Sendable → Touch #2 high-value   WhatsApp · otherwise SMS
            └─ Standard   → Decision "may this reminder go out?"
                   └─ Sendable → Touch #2   Push if reachable · otherwise Email
  → Wait 24 h (same until-set)
  → Decision "at the end of the cascade, what is the checkout?"                     ◀ RE-CHECK
      ├─ Completed → Exit purchased   ├─ Payment failed → Handoff FIN-134
      ├─ Cancelled or expired → Exit closed unfinished
      └─ Still open → Exit  abandoned
```

### State re-checks

Completion and payment failure are re-read immediately before every touch
(`c.completed1/2/3`), which is the journey's strongest feature and is exactly what
`s.completed` promises — *"every reminder is reached only through a condition that
just re-read completion"*. Preserve it, and extend each of those conditions to
re-read cancellation/expiry as well, so the promise covers every way a checkout can
stop being recoverable.

### Stop conditions

`process_completed` by any route (in product, in store, by phone), `payment_failed`
(→ FIN-134), **`checkout_cancelled` / `checkout_expired` (new)**, supersession by a
newer checkout for the same person, any send-path gate (recorded, not silent),
CON-300 sender-side suppression, and the end of the cascade.

### Ownership / handoff

**Highest in the commerce-recovery group.** Outranks ACQ-11, which it specialises and
which is suppressed for any checkout this journey holds. Receives the cart from
**ACQ-288** at `checkout_started`, with every queued cart reminder suppressed from
that point. Yields the instance to **FIN-134** on payment failure. All settled;
unchanged.

### Canonical changes needed

1. **Add cancelled/expired handling.** Add `checkout_cancelled` and `checkout_expired`
   to `w.first`, `w.second`, `w.third` `until` sets; add a *"Cancelled or expired"*
   branch to `c.completed1`, `c.completed2`, `c.completed3` pointing at a new exit
   `x.invalid` (class `invalid-state`, state *"closed unfinished — cancelled or
   expired; nothing further is sent"*, `reEntry` *"a new checkout is a new
   instance"*). Rename the three conditions to *"What is the checkout now?"* to match
   the wider branch set.
2. **Promote the gate out of the routers.** Add `c.sendable1`, `c.sendable2-hv`,
   `c.sendable2-std` (branches *Sendable* / *Suppressed*), with the suppressed arm
   passing through `a.record-no-action` (writes `suppressed_sends`) and rejoining the
   next wait — which is what the router prose already says happens. Strip the
   permission/reachability/contest sentences out of the router `does` text so the
   routers only pick a channel.
3. `measurement.operational` += `no_action_rate_by_reason` (keep
   `no_channel_available_rate`; the two are not the same thing).
4. `channelStrategy.roles[urgent].when` → drop the threshold clause, keep only
   *"explicit permission for direct commercial messaging on a phone number is
   recorded and the number is reachable"*. The threshold stays in `c.highvalue`.
5. `orchestration.touches[t2-hv].channelRoles` stays `["urgent"]` — the WhatsApp→SMS
   order is already carried by the role's own channel list and needs no change once
   the renderer reads it in order.

Node count goes 17 → ~22 canonical. That is the one journey in this domain where the
right answer adds nodes, and all five are doing real work: one honest terminal and
three visible gates.

### Display-only changes needed

- Touch 1 and touch 2-std: `Push if reachable · otherwise Email`.
- Touch 2 high-value: `WhatsApp · otherwise SMS`, in that order — two rows, not one
  undifferentiated pair.
- The two second-touch cards keep their distinct `touchStage` titles
  (`second-reminder-high-value` / `second-reminder`), so the segment is named on the
  card as well as on the Decision above it. Add both to `TOUCH_STAGE_TR` (§0.3).

### Renderer changes needed

§0.1, plus: a **single role carrying more than one channel must render its channels
in order with the substitution wording**, not as one flat row of pills. That is the
`groups.map((r) => r.channels)` line in `CommunicationCard` and the one-row-per-role
rendering in `ChannelPriorityRow`; today a role's channel list is drawn as an
unordered set *"because they are one step of the priority, not two"*, which is right
for `low-friction = [push, in-app]` and wrong for `urgent = [whatsapp, sms]`. The
distinguishing signal already in the data is `ChannelStrategy.fallback`:
`"same-role-other-channel"` means the channels inside a role substitute for each
other (render them ordered), `"next-eligible-role"` means they are one step
(render them flat). ACQ-287 and ACQ-288 both declare `"next-eligible-role"`, so if
this route is taken their `urgent` role should be split into two roles or the field
reconsidered — see §Least certain in the hand-back.

---

## ACQ-288 · Cart Abandonment Recovery

**Purpose.** Return a person who added an item to their cart but did not start
checkout; hand off to ACQ-287 the instant checkout starts; never send once the
purchase is there.

### Current flow

```
Trigger item_added_to_cart
  → Wait 2 h (until selection_cleared | process_completed | checkout_started)
  → Decision "is the cart still active?"
      ├─ Cleared or expired ─────────────────→ Exit  cart no longer active
      └─ Active → Decision "is the purchase completed?"
            ├─ Completed → Exit purchased
            └─ Not completed → Decision "has checkout started?"
                  ├─ Started → Handoff ACQ-287
                  └─ Not started → [router] → Touch #1 [Primary Push / Fallback Email]
  → Wait 20–24 h (until process_completed | checkout_started)        ◀ no cleared event
  → Decision "is the purchase completed?"
      ├─ Completed → Exit purchased
      └─ Not completed → Decision "has checkout started?"
            ├─ Started → Handoff ACQ-287
            └─ Not started → Decision "is this a high-value cart?"
                  ├─ High-value → [router] → Touch #2-hv  [Primary WhatsApp SMS]
                  └─ Standard   → [router] → Touch #2-std [Primary Push / Fallback Email]
  → Wait 48 h (until process_completed | selection_cleared)
  → Decision "is the purchase completed?"
      ├─ Completed → Exit purchased
      └─ Not completed → Decision "is the cart still active?"
            ├─ Active → Exit abandoned
            └─ Cleared or expired → Exit cleared
```

### Problems found

1. **The second reminder can be sent about a cart the person already emptied.**
   `w.second` waits only on `process_completed` and `checkout_started` —
   `selection_cleared` is in `w.first`'s and `w.third`'s until-sets but not this
   one — and the stage-2 chain (`c.purchased2` → `c.checkout2` → `c.highvalue`) never
   asks whether the cart is still active. A cart cleared after touch 1 walks straight
   into touch 2. This is the "never send a reminder after the state is gone" rule
   broken in the graph.
2. **Branch-order risk at stage 1.** `c.active1` exits to `x.cleared` (class
   `invalid-state`) *before* `c.purchased1` ever asks about a purchase. On a platform
   that empties the cart on completion, a converted cart is recorded as an invalid
   state rather than a success — a success miscounted as a failure. Asking
   "purchased?" first removes the risk entirely.
3. **Six single-question condition cards where three would do.** ACQ-287, its
   declared twin, asks the same question set as one three-branch condition per stage.
   The two journeys are explicitly the same cascade one step apart and read as
   different shapes on the canvas for no reason.
4. Same hidden send-path gate and same under-measured no-action as ACQ-287 (§ACQ-287
   problems 3–4); `no_channel_available_rate` is present, the rest is not.
5. Same Primary/Fallback and same flattened WhatsApp/SMS pair as ACQ-287.

### Final orchestration

**Identical to ACQ-287, deliberately: segment-based at touch 2 over a sequential
two-touch cascade, with a reachability fallback inside each arm** — plus an ownership
handoff evaluated at every re-check. The two journeys are the same cascade at two
stages of the same purchase, and the canvas should say so.

**Final customer channels:** `push` + `email` (touch 1, standard arm of touch 2) ·
`whatsapp` + `sms` (high-value arm).
**Customer touch count:** 2.

### Final flow

```
Trigger item_added_to_cart
  → Wait 2 h (until process_completed | checkout_started | selection_cleared | cart_expired)
  → Decision "what is the cart now?"                                                ◀ RE-CHECK
      ├─ Purchased ───────────────→ Exit  purchased            ◀ asked FIRST
      ├─ Checkout started ────────→ Handoff ACQ-287
      ├─ Cleared or expired ──────→ Exit  cart no longer active
      └─ Still held → Decision "may this reminder go out?"      ◀ promoted from router
            ├─ Suppressed → record the gate → (rejoin the next wait, nothing sent)
            └─ Sendable → Touch #1   Push if reachable · otherwise Email
  → Wait 20–24 h  (same until-set, selection_cleared ADDED)
  → Decision "what is the cart now?"                                                ◀ RE-CHECK
      ├─ Purchased / Checkout started / Cleared or expired → as above
      └─ Still held → Decision "is this cart at or above the high-value threshold?"
            ├─ High-value → gate → Touch #2 high-value   WhatsApp · otherwise SMS
            └─ Standard   → gate → Touch #2   Push if reachable · otherwise Email
  → Wait 48 h (same until-set)
  → Decision "at the end of the cascade, what is the cart?"                         ◀ RE-CHECK
      ├─ Purchased → Exit purchased
      ├─ Cleared or expired → Exit  cart no longer active
      └─ Still held → Exit  abandoned
```

### State re-checks

One merged condition per stage, purchase first, then ownership (checkout started),
then validity (cleared/expired), then the send gate. Three re-checks, one before each
touch and one at the end — same rhythm as ACQ-287.

### Stop conditions

`process_completed` including at least one item from this cart, `checkout_started`
(→ handoff, not an exit), `selection_cleared` / `cart_expired`, supersession by a
newer cart, any send-path gate, CON-300 suppression, end of cascade.

### Ownership / handoff

Above **ACQ-12**, the generic held-selection pattern it specialises, which is
suppressed for any cart this journey holds. Hands the cart to **ACQ-287** at
`checkout_started` and suppresses every reminder it had queued. Settled; unchanged.

### Canonical changes needed

1. **Merge the condition chains**, purchase first every time:
   - `c.active1` + `c.purchased1` + `c.checkout1` → one `c.state1`, branches
     *Purchased* → `x.purchased` · *Checkout started* → `h.checkout` · *Cleared or
     expired* → `x.cleared` · *Still held* → the stage-1 gate.
   - `c.purchased2` + `c.checkout2` → one `c.state2`, branches *Purchased* ·
     *Checkout started* · *Cleared or expired* (new) · *Still held* → `c.highvalue`.
   - `c.purchased3` + `c.active2` → one `c.state3`, branches *Purchased* · *Cleared
     or expired* · *Still held* → `x.abandoned`.
   Net −3 canonical nodes and −3 display nodes (22 → 19 canonical, 20 → 17 display).
2. **Add `selection_cleared` (and `cart_expired`) to `w.second`'s `until` set**, so
   the clearing event can end the wait instead of only being noticed three stages
   later.
3. Same gate promotion, `a.record-no-action` / `suppressed_sends` write and
   `no_action_rate_by_reason` metric as ACQ-287 items 2–3.
4. Same `channelStrategy.roles[urgent].when` split as ACQ-287 item 4.

### Display-only changes needed

Same three card treatments as ACQ-287. The merge above also makes the twin journeys
draw as twins, which is the single biggest readability gain available in this domain
for the node count it costs (it *reduces* the count).

### Renderer changes needed

§0.1, plus the ordered-within-role rendering described under ACQ-287.

---

## ACQ-289 · Back-in-Stock Alert

**Purpose.** Tell a person, once, that the specific item they wanted while it was
unavailable can be bought again — and only while that interest is still honestly
theirs.

### Current flow

```
Trigger interest_recorded_while_unavailable
  → Wait  back_in_stock.interest_lifetime
       until item_available_again | purchase_completed | interest_dismissed
      ├─ timeout → Exit  interest expired before availability returned; no alert sent
      └─ event → Decision "is this interest still worth alerting on?"               ◀ RE-CHECK
            ├─ Already bought → Exit purchased
            ├─ No longer wanted → Exit  interest closed
            └─ Still wanted → Decision "may the alert go out?"
                  ├─ Suppressed → record → Exit no-action
                  └─ Sendable → Alert  [Primary Push / Fallback In-app / Fallback Email]
                       → Wait  back_in_stock.conversion_window
                            (until purchase_completed | item_unavailable)
                       → Decision "did the alert reach a purchase?"
                            ├─ Purchased → Exit purchased
                            └─ Not purchased → Exit  alerted, not bought
```

### Problems found

1. **Three roles render as `Primary Push / Fallback In-app / Fallback Email`, and the
   middle one is not a fallback in any sense.** `in-session`'s `when` is *"the person
   is already in a session where the item can be opened directly"* — a person looking
   at the item in the product can already see it is purchasable; the alert's whole
   job is to reach somebody who is **not** looking. The role adds a channel and a
   card row without adding a business case.
2. TR title gap on `a.alert` (§0.3): the EN reader gets **Availability alert**, the
   TR reader gets **Mesaj**.
3. Nothing else. This is the best-instrumented journey in the domain: availability is
   re-read immediately before the alert and explicitly *never trusted from the event
   that opened the window* (`s.unavailable`); the measurement carries a **required**
   persistent per-person holdout with an honest basis (*"somebody who wanted an
   unavailable item checks back on their own"*); and the guardrail set includes
   `alert_for_unavailable_item` and `repeat_alert_same_cycle`.

### Final orchestration

**Fallback** — push if a current device registration and its permission stand,
otherwise email. Two steps, one substitution, driven purely by reachability. The
brief's canonical example of a legitimate fallback, and this journey is a legitimate
instance of it: the moment availability returns is worth minutes, the push is the
treatment, and email is what you send when the push cannot be delivered.

**Final customer channels:** `push`, `email`.
**Customer touch count:** 1.

### On "normally 1 touch, rarely 2"

The journey is at 1 and should stay there. A second alert is forbidden twice over by
the journey's own contract: `s.single` (*"One alert per availability cycle. A second
message about the same return of the same item is a repeat, not a reminder."*) and
the `repeat_alert_same_cycle` guardrail. The only honest second alert is a **new
availability cycle**, which the entity definition (*"the person, the item, and the
availability cycle the interest was recorded against"*) already makes a new instance.

So a company that wants a same-cycle reminder is changing the contract, not
configuring it, and the right place to express that is a **preset** under
`discovery.presets` that raises `back_in_stock.touches` and states its own
`applicableWhen` — not a second touch node on the canonical graph. Adding a second
touch node here would break `s.single`, the guardrail and the holdout's attribution
in one edit. **Recommendation: do not add one.**

### Final flow

```
Trigger interest_recorded_while_unavailable
  → Wait  interest lifetime  (availability returns | purchased | interest dismissed)
      ├─ timeout → Exit  interest expired; no alert sent
      └─ event → Decision "is this interest still worth alerting on?"
            ├─ Already bought → Exit purchased
            ├─ No longer wanted → Exit  interest closed
            └─ Still wanted → Decision "may the alert go out?"
                  ├─ Suppressed → record the gate → Exit  no alert sent
                  └─ Sendable → Alert   Push if reachable · otherwise Email
                       → Wait  conversion window  → Decision "did the alert reach a purchase?"
                            ├─ Purchased → Exit purchased
                            └─ Not purchased → Exit  alerted, not bought
```

### State re-checks

Three, all required and all present: `c.relevant` re-reads purchasability, the
purchase record and withdrawal at the moment availability returns; `c.sendable`
re-reads permission, deliverability, the pressure cap and the commerce-recovery
contest immediately before the send; `c.converted` reads the purchase record after
the window. Nothing to add.

### Stop conditions

`purchase_completed` by any route, `item_unavailable` again before the alert,
`interest_dismissed`, `back_in_stock.interest_lifetime` timeout, any send-path gate,
CON-300 suppression, and the conversion window closing.

### Ownership / handoff

No handoff. Below a checkout in motion (ACQ-287), the generic process pattern
(ACQ-11), a held cart (ACQ-288), a held selection (ACQ-12), a predicted need (RET-31)
and an availability enquiry (SCH-282); **above ACQ-13**, which is suppressed for a
person this alert holds. Settled by `audit/collision-fixes.md` §2 and not reopened.

### Canonical changes needed

1. `channels: ["push", "email"]` (drop `"in-app"`).
2. `channelStrategy.roles`: drop the `in-session` role. Keep `low-friction` → `push`
   and `persistent` → `email`, and keep `fallback: "next-eligible-role"`.
3. `orchestration.touches[t1].channelRoles` → `["low-friction", "persistent"]`.

### Display-only changes needed

The alert card shows two rows — `Push if reachable · otherwise Email` — instead of
three, and the display node count is unaffected (10). Add `availability-alert` to
`TOUCH_STAGE_TR` (§0.3).

### Renderer changes needed

§0.1 and §0.3 only.

---

## Summary

| ID | before pattern | after pattern | channels | touches | biggest change |
|---|---|---|---|---|---|
| ACQ-09 | Primary/Fallback on both touches | **sequential**, each stage **single** | email | 2 | drop in-app; two single-channel education touches, bounded shape and progression re-check untouched |
| ACQ-11 | Primary/Fallback on all three touches | **combination**: t1 **fallback** · t2 **single** · t3 **conditional routing** | push, in_app, email, sms | 3 (2 default) | t3's roles reversed so SMS is what a real asserted expiry earns, not a dead "fallback" |
| ACQ-12 | Primary/Fallback on both touches | **sequential**: t1 **fallback** · t2 **single** | push, in_app, email | 2 | t2 becomes single-channel; the re-arm loop gets a real bound |
| ACQ-13 | Primary/Fallback | **fallback** (genuine, reachability) | push, in_app, email | 1 | wording only — no canonical change |
| ACQ-285 | Primary/Fallback; one node = N messages | **conditional routing** on what was declared, then **sequential** two-touch | email | 2 max | `a.nurture` becomes one named follow-up with a state re-check before it, making the stated cap of 2 true |
| ACQ-287 | Primary/Fallback on every card | **segment-based** at t2 over a **sequential** cascade, **fallback** inside each arm | push+email · whatsapp+sms | 2 | cancelled/expired checkouts detected at all; send gate promoted out of router prose |
| ACQ-288 | Primary/Fallback on every card | identical to ACQ-287, deliberately | push+email · whatsapp+sms | 2 | six conditions merged into three, purchase asked first, and `selection_cleared` added to the second wait so a cleared cart stops getting touch 2 |
| ACQ-289 | Primary / Fallback / Fallback | **fallback** (genuine, reachability) | push, email | 1 | drop the in-session role; stays at one alert, and "rarely 2" belongs in a preset, not a node |

**Pattern distribution after:** fallback 2 (ACQ-13, ACQ-289) · sequential 2 (ACQ-09,
ACQ-12) · conditional-routing-then-sequential 1 (ACQ-285) · segment-based combination
2 (ACQ-287, ACQ-288) · multi-pattern combination 1 (ACQ-11). Per **stage**: single 6 ·
fallback 7 · conditional routing 2 · segment-based 1 (one split, two arms). Nothing is
parallel and nothing is event-or-timeout — neither fits a moment in this domain.

**Net node effect:** ACQ-288 −3, ACQ-285 +2, ACQ-287 +5, everything else unchanged.
