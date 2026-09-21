# Phase 1 audit — Access · Identity · Finance

Scope: the six public ACCESS / IDENTITY / FINANCE journeys.
`ACC-261` `ACC-263` `IDN-84` `IDN-271` `FIN-134` `FIN-302`

Source: `audit/public-journeys-current-state.json` (canonical + rendered state), read per journey.
Cross-references: `audit/new-journey-collision-review.md` (N5 / F6), `audit/patterns.md`,
`src/canonical/types.ts`, `src/lib/canonical-view.ts`, `src/components/ui/JourneyCanvasNodes.tsx`,
`src/canonical/events.ts`.

---

## 0. Three findings that cut across all six, stated once

These are the reason the six journeys read worse than they are. None of them is a per-journey
design decision; each is one place in one file. They are repeated in the per-journey sections
only where the consequence is specific.

### 0.1 "Primary X / Fallback Y" is a renderer artifact, not the data — **P0, corpus-wide**

Every message card in all six journeys renders a `Primary` row and a `Fallback` row. **No journey
in this domain declares a fallback in that sense.** `ChannelStrategy.fallback` is documented in
`src/canonical/types.ts:352`:

> `/** DELIVERY recovery for the same touch after a delivery failure - not the next touch. */`

All six journeys set it to `same-role-other-channel` — fallback *inside* one role, after a bounce.
What the card labels "Fallback" is the journey's **second role**, and a role is a routing
context carrying its own `when` clause:

| journey | role 1 | role 2 | the `when` the card throws away |
|---|---|---|---|
| ACC-261 / ACC-263 | persistent · email | in-session · in-app | *"the person is active in the product and the action is taken there"* |
| IDN-84 | in-session · in-app | persistent · email | *"the message has to be kept and survive until the person can act on it"* |
| IDN-271 | persistent · email | urgent · sms | *"a verified number the signal does not implicate exists"* |
| FIN-134 | in-session · in-app | persistent · email | urgent · sms+push: *"an asserted consequence date exists inside the urgent horizon and permission for service messages on this channel is recorded"* |
| FIN-302 | persistent · email | in-session · in-app | *"the person is in the product where the original transaction and its refund are both visible"* |

Every one of those is **conditional routing**. `touchChannelPlans()`
(`src/lib/canonical-view.ts:639`) joins `Touch.channelRoles` × `ChannelStrategy.roles` into an
ordered list and drops `when`; `ChannelPriorityRow` (`JourneyCanvasNodes.tsx:259`) then hardcodes
`i === 0 ? "Primary" : "Fallback"`. The brief's "single most important rule" is not primarily a
canonical problem in this domain — **the canonical data is mostly right and the page is misreporting
it.** Fixing the renderer removes the false-fallback reading from all six at once, and from most of
the corpus.

### 0.2 `simultaneous` is declared, typed, and read by nothing — **P0, IDN-271**

`ChannelStrategy.simultaneous` exists in `types.ts:354` and is set in exactly one place,
`src/canonical/identity.ts:3375` (IDN-271):

> `{ allowed: true, reason: "every verified destination the signal does not implicate is told at once, because a single destination may itself be the compromised one" }`

`grep -rn simultaneous src/lib src/components` returns nothing. So the one journey in the corpus
that declares a genuine **parallel** send — for a stated security reason, backed by its own
`s.multi-destination` suppression — renders as *"Primary Email / Fallback SMS"*, which asserts the
exact behaviour the journey forbids. This is the corpus's clearest legitimate parallel and the page
says it is a fallback ladder.

### 0.3 The wait card never shows the event-or-timeout shape — **P1, five of six**

Two separate defects in `waitLabel()` (`JourneyCanvasNodes.tsx:137`):

- **A wait with a `Config.default` shows only the number and never the event.** FIN-134's
  `w.recovery` renders as `2 days–3 days`; its `untilEvent` is `[obligation_satisfied,
  recovery_attempt_abandoned]`. The journey's first guardrail — `s.resolved`, *"Exit the moment the
  obligation is satisfied"* — is invisible on the canvas. Worse, that `2 days–3 days` carries
  `confidence: "low", basis: "example-only"` in the data and is printed on a public page with no
  qualifier. Under `AGENTS.md` ("never put a fabricated number on a page") an example-only range
  presented as the duration is the thing that rule forbids.
- **A wait without a default shows only its FIRST event.** `firstClause()` cuts `until A, or B, or C`
  at the first "or". IDN-271's `w.verify` reads *"Until the owner confirms the activity was theirs"*
  and drops `activity_reported_not_own` — on a security journey, the dropped arm is the one that
  matters. ACC-263, ACC-261 and FIN-302 lose an arm the same way.

The correct wait card for this domain is **event(s) + the bound**, e.g.
`Until the obligation is satisfied · or the consequence date`. Never a bare number, and never one
arm of three.

---

## ACC-261 · Access Restriction Notice

**Purpose.** Tell the account holder what access is going away, when, and the one condition that
brings it back, so a restriction is a decision they can act on rather than a discovery they make.

**Current flow.**

```
Access restriction or end recorded
 → Decision: Can the holder do anything about this?
      Resolvable by them   → Decision: Is there a permitted route to them?
                                  Reachable   → Message: Notify (Email/In-app)
                                  Unreachable → Handoff: Contactability Recalculation (CON-36)
      Not theirs to resolve→ Message: Inform only (Email/In-app) → Exit: informed
      Placed by a security response → Exit: announced by the security response
 → Notify → Wait: release_condition_met | restriction_lifted | restriction_made_permanent,
            timeout at resolution_deadline_at   (both arms → one condition)
 → Decision: Where did it land?
      Restored        → Message: Confirm (Email/In-app) → Exit: restored and confirmed
      Still restricted→ Exit: restriction stands past its deadline
```

**Problems found.**

1. **The journey breaks its own guardrail on one of its two arms.** `s.g4`: *"Restoration is
   confirmed explicitly. Silence after a resolved restriction reads as the restriction continuing."*
   The `Not theirs to resolve` arm runs `a.inform-only → x.informed` and **stops**. A person told
   "your access is restricted, there is nothing you can do" is never told when it is lifted — which
   is the one case where they have no way of finding out for themselves. This is the substantive
   defect in the journey.
2. **`restriction_made_permanent` is waited for and has no arm.** It is in `w.resolve.untilEvent`
   (and exists in the registry, `events.ts:430`). `c.outcome` has two branches: *"the condition was
   met and access is back"* (false) and *"the deadline passed with the condition unmet"* (also
   false — no deadline passed). A permanent restriction falls through both, and if it is routed to
   `x.stands` anyway the holder is told their deadline passed and `x.stands`'s own `reEntry`
   (*"if the condition is satisfied afterwards, the restoration path runs"*) is a promise that
   cannot be kept.
3. **The reachability gate is on one arm only.** `c.reachable` guards `a.notify` and not
   `a.inform-only`, though both send. Either the gate is misplaced or it is missing.
4. **The wait card prints the wrong noun.** `release_condition_met`'s registry meaning
   (`events.ts:397`) is written for a *suppression*: *"the condition recorded to release the
   suppression is met"*. The card on this access-restriction journey therefore reads
   *"Until the condition recorded to release the suppression is met."*
5. **Declared vs actual — mismatch.** `defaultPriority: service`, `pressureClass: service`,
   `localCap { value: 2, appliesTo: "all" }`, and **all three touches `mandatory: false`**. But
   `s.g4` makes the restoration confirmation an obligation, and `s.g2` (*"The notice names what
   still works"*) makes the notice one. The journey behaves as though two touches cannot be
   withheld and declares that both can be rationed. This is the same class of defect as
   ACT-13/ACT-14 — a declaration that does not describe the behaviour — and it is the one
   priority/class mismatch I found in this domain.
6. Channel presentation: §0.1. In-app is not a fallback for email here; it is where the person is
   standing when they hit the restriction.

**Final orchestration.** **Conditional routing → event-or-timeout.** Two routing decisions that
genuinely change what the person receives (does the security response already own this message; can
the holder act), then a single wait that ends on the restriction's own resolution *or* its stated
deadline. Not a sequence, not a fallback, no escalation: a restriction is one statement and one
outcome.

**Final customer channels.** **Email** always — a restriction is a change to what the person holds
and the deadline and release condition must survive until they can act on them. **In-app**
additionally where the person is active in the product, because that is where the corrective action
(pay, upload, re-verify) is taken. **No SMS**: the urgency here is a deadline measured in days that
is written in the message, not a one-bit action, and the message must be kept.

**Customer touch count.** **2** — the notice, and the outcome. Both arms of the actionable split
carry the same budget.

**Final flow.**

```
Access restriction or end recorded
 → Decision: Is there a permitted route to them?
        Unreachable → Handoff: Contactability Recalculation
 → Decision: Can the holder do anything about this?
        Placed by a security response → Exit: announced by the security response (IDN-271 owns it)
        Resolvable by them            → Message: what is restricted · what still works ·
                                        the deadline · the one condition that lifts it
        Not theirs to resolve         → Message: what is restricted · what still works ·
                                        who is deciding · no call to action
 → Wait: until released, lifted or made permanent — or the stated deadline
 → Decision: Where did it land?
        Restored         → Message: what was restored → Exit: restored and confirmed
        Made permanent   → Exit: restriction is now permanent; the holder was told
        Deadline passed  → Exit: restriction stands past its deadline
```

**State re-checks.** One, already authored and correct: `w.resolve.recheck` re-reads the account +
restriction from the system of record before acting on the timeout. Nothing is sent on a stale
restriction.

**Stop conditions.** `restriction_lifted` ends the wait and routes to the confirmation, not to
silence. `x.security-owned` stops the journey before any send when IDN-271 already owns the
message. No touch is repeated.

**Ownership / handoff.** Highest in `access-consequence-narration` (scope `account`); TIM-274 Grace
Period Recovery stops from the moment this one is recorded, and TIM-274 states the reciprocal
(`distinctFrom: TIM-65, FIN-134, ACC-261, TIM-281`). `ACC-78` decides and records the restriction;
this journey only narrates it — correct and stated. One handoff out, to CON-36 (non-public).
**This journey is the public tail of the FIN-134 chain** (FIN-134 → `h.restrict` → ACC-78 → the
restriction this journey narrates) and neither end says so on the page — see FIN-134, and §0 of the
display list below.

**Canonical changes needed.**

- **C1 (P0).** Route `a.inform-only` into `w.resolve` instead of `x.informed`. Both message arms
  converge on the same wait and the same outcome condition. Delete `x.informed`; the
  not-theirs-to-resolve case now ends at `x.restored` / `x.permanent` / `x.stands` like the other.
  This is what `s.g4` already requires.
- **C2 (P1).** Move `c.reachable` to sit directly after `t.restricted`, ahead of `c.actionable`, so
  one gate covers both sends. Net node count unchanged.
- **C3 (P1).** Add a third branch to `c.outcome` — `Made permanent` / *"the restriction was made
  permanent; the release condition no longer applies"* → new exit `x.permanent`, class `failure`,
  `reEntry`: *"a later review that converts the restriction back into a bounded one is a new
  instance"*. Removes the unhandled `restriction_made_permanent` arm.
- **C4 (P1).** Fix the class declaration to match behaviour. Mark `t2` (`a.notify`) and `t3`
  (`a.confirm`) `mandatory: true`, set `localCap.appliesTo: "non-mandatory"`, and set
  `localCap.default.value: 0` with the corpus's own honest basis (*"every touch in the plan is
  marked mandatory"* — the wording FIN-302 and IDN-271 already use). Leave `defaultPriority` and
  `pressureClass` at `service`: a restriction notice is a service message, not a transactional
  record of a money movement, and `service` is correct for it.
- **C5 (P2).** Either give the wait its own event (`restriction_release_condition_met`, added via
  `scripts/event-curation.json` then `node scripts/build-event-registry.mjs`) or reword
  `release_condition_met`'s registry `meaning` so it is not suppression-specific. The second is one
  line but changes the meaning for every other consumer of that id — prefer the first.

Node count: 13 → 13 canonical (one exit removed, one added, one condition reordered, one branch
added).

**Display-only changes needed.**

- The `Not theirs to resolve` arm must show its message and then the shared wait, so the reader can
  see that both arms end in a stated outcome.
- `x.security-owned` must stay drawn. It is the visible IDN-271 boundary and it is the only place a
  reader learns why some restrictions produce no notice.

**Renderer changes needed.** §0.1 (role `when` instead of Primary/Fallback) and §0.3 (wait card
shows events + bound). §0.3 also fixes the "suppression" wording symptom even before C5 lands, if
the card is made to prefer the wait's own `duration.rule` over the registry `meaning`.

---

## ACC-263 · Activation Reminder

**Purpose.** Get somebody to use what they have been granted before the window to claim it closes,
because an unredeemed entitlement is indistinguishable from one that was never granted.

**Current flow.**

```
Entitlement provisioned and reachable
 → Decision: Is this the holder's first entitlement of this kind?
      First time       → Message: Ready  (Email/In-app)
      Already familiar → Message: Brief  (Email/In-app)
 → Wait: capability_first_used | entitlement_revoked_or_replaced,
         timeout at activation_window_ends_at
      on event   → Decision: What ended the wait?  Used → Exit activated · Withdrawn → Exit moot
      on timeout → Decision: Is there still time to claim it?
                       Time remains  → Message: Remind (Email/In-app)
                                       → Wait: capability_first_used,
                                               timeout at activation_window_ends_at
                                               → Exit activated / Exit lapsed
                       Window closed → Exit lapsed
```

**Problems found.**

1. **The reminder can never fire.** `w.first-use.timeout` is `relativeTo: "attribute", attribute:
   "activation_window_ends_at"` — it fires **at the end of the window**. `c.remind`'s "Time remains"
   branch requires *"the window has a meaningful period left"*, which is false by construction at
   that instant. The wait's own `duration.rule` says the opposite of what the timeout does:
   *"The single reminder is placed before the activation window closes, late enough that the first
   notice has had its chance and early enough that claiming is still possible."* And `w.last-chance`
   is bound to the **same** attribute, so the second wait has zero length. As authored, this journey
   sends one message and lapses; the whole reminder half of it is dead.
2. **The second wait violates `s.g3`.** `s.g3`: *"Lapsed-unclaimed and revoked-before-use are
   recorded as different outcomes — one is about the holder, the other is not."* `w.last-chance`
   waits only on `capability_first_used`, so an entitlement revoked after the reminder goes out
   lands on `x.lapsed` — the holder is recorded as having failed to claim something we withdrew.
3. Channel presentation: §0.1.

**Final orchestration.** **Segment-based first touch, then event-or-timeout with one reminder.**
The segment is real and its signal is authored: `c.first-time` reads the holder's prior use of this
capability class, which `s.g2` (*"A holder who has used this capability before is not re-onboarded
onto it"*) already asserts is knowable. The two messages are genuinely different — one explains what
the capability is for, one names only what changed — so the split changes treatment and stays. The
brief's instruction to keep this one simple is right: **no orchestration is added.** Everything below
is repair.

**Final customer channels.** **Email** always — the grant and its deadline are a record.
**In-app** additionally when the person is in the product, because the "single first action" is
taken there and an in-app prompt is one click from it. **No SMS, no push.** An activation window is
measured in days or weeks and the message names one action; there is nothing an SMS adds that the
deadline in the email does not already carry.

**Customer touch count.** **2** — the grant notice (one of two variants), and at most one reminder.
`s.g1` (*"One reminder, never two. The window is the pressure; repetition is not."*) is correct and
is kept.

**Final flow.**

```
Entitlement provisioned and reachable
 → Decision: Has the holder used this capability before?
      No  → Message: what this is, what it lets you do, the one first action
      Yes → Message: what changed from what you already had
 → Wait: until first use — or the reminder point (before the window closes)
      first use / withdrawn → Decision: What ended the wait?
              Used      → Exit: activated
              Withdrawn → Exit: entitlement withdrawn before use
      reminder point → Decision: Is there still time to claim it?
              Time remains  → Message: the deadline and the same one action
              Window closed → Exit: lapsed unclaimed
 → Wait: until first use or withdrawal — or the window closes
      → Decision: What ended the wait?   (the same condition, reused)
              Used      → Exit: activated
              Withdrawn → Exit: entitlement withdrawn before use
      window closed → Exit: lapsed unclaimed
```

**State re-checks.** Both waits already carry a `recheck` re-reading the entitlement and its window
from the system of record before acting on the timeout. That is what stops a reminder reaching
somebody who has already activated. Correct as authored; keep.

**Stop conditions.** `capability_first_used` at any point. `entitlement_revoked_or_replaced` at any
point — **currently only honoured on the first wait**, which is C7 below.

**Ownership / handoff.** `competition: "none"`, no handoffs. Correct: ACC-72 provisions the
capability, ACC-76 owns the credential lifecycle, and both are named in `distinctFrom`. Nothing
else speaks about this entitlement. No change.

**Canonical changes needed.**

- **C6 (P0).** Give `w.first-use` its own timeout Config — `entitlement_activation.reminder_lead`,
  `required: true`, `class: "attribute-bound"` relative to `activation_window_ends_at` with a lead,
  and a `rule` that states it is the reminder point rather than the window end. The window end stays
  on `w.last-chance`. Without this the journey's second half is unreachable.
- **C7 (P1).** Add `entitlement_revoked_or_replaced` to `w.last-chance.untilEvent` and point
  `w.last-chance.onEvent` at the existing `c.used` instead of straight at `x.activated`. No new
  nodes; `c.used` is exactly the question ("What ended the wait?") and it already has both arms.
  This is what `s.g3` requires.
- **C8 (P2).** `c.remind`'s "Time remains" branch survives C6 as a genuine guard for the case where
  the issued window is shorter than the reminder lead. Reword its `when` to say that
  (*"the reminder point falls inside the window and no reminder has been sent for this issuance"*)
  rather than the vaguer *"a meaningful period left"*.

**Declared vs actual — no mismatch.** `service` / `service`, cap 2, `appliesTo: "all"`, all three
touches `mandatory: false`. That is honest here and unlike ACC-261: nothing in this journey must be
sent. An entitlement nobody claimed is a loss, not a broken promise, and both touches can be
withheld under pressure without the journey lying to anyone. Affirmed as a reference declaration —
and the reason it is *not* promotional is that the entitlement is already granted and already
theirs; nothing new is being offered.

**Display-only changes needed.** None beyond §0. Once C6 lands, the two waits should render with
distinct bounds (reminder point vs window close) rather than the identical string they produce
today.

**Renderer changes needed.** §0.1 and §0.3 only.

---

## IDN-84 · Verification Recovery

**Purpose.** Route a failed verification by *why* it failed, and keep our own failures out of the
customer's verification record.

**Current flow.**

```
Verification attempt failed
 → (internal: classify the failure — absorbed, not drawn)
 → Decision: What kind of failure was it?
      The person can correct it → Decision: Does the retry budget have room?
                                     Room   → Message: Explain what to correct (In-app/Email)
                                              → Exit: bounded retry available
                                     Spent  → Handoff: Decision Request (DEC-181)
      Ours, and transient       → Decision: Safe retry within the backoff budget?
                                     Retry      → (internal: retry with backoff — absorbed)
                                                  → Exit: bounded retry available
                                     Persistent → Handoff: Ownership Escalation (OWN-55)
      Needs a person            → Handoff: Decision Request (DEC-181)
      Terminal by policy        → Message: cannot be verified on this basis (In-app/Email)
                                  → Exit: verification not possible on this basis
```

**Is this an event-or-timeout journey? No — and it should not be made one.**

The brief flags IDN-84 as a strong candidate. Checked honestly, it is not, and the corpus says why
in the journey's own trigger evidence: `insufficientAlone` names *"a verification that expired with
no attempt made, **which is IDN-81's expiry**"*. The "did they ever retry / did the window close"
question is owned by IDN-81. If IDN-84 grew a wait it would own the retry loop, which `s.g3`
(*"Repeated retries do not bypass security controls"*) exists to prevent, and it would duplicate
IDN-81's timeout. The entity is `verification_instance_id` — **one failed attempt**, not the
verification window — and a second failure fires the trigger again. The absence of a wait here is
correct and deliberate, and it is the reason this journey is the shape it is. **Leave it synchronous.**

**Problems found.**

1. **The "ours, and transient" arm sends the customer nothing, ever.** A person who just watched
   their verification fail because of *our* outage gets silence while we retry. `s.g2` (*"A
   technical failure is never recorded as an identity rejection"*) protects our record; nothing
   protects their experience, and `a.explain`'s own reasoning — *"a retry offered without an
   explanation produces the same attempt again"* — applies here with more force, because the person
   will resubmit perfectly good evidence.
2. **`h.review` hands over with the customer told nothing.** Both `h.review` edges (from `c.class`
   "Needs a person" and from `c.retry-budget` "Budget spent") go to DEC-181 with `suppresses: null`
   and a two-line `carries` that does not say whether the holder has been contacted. A mismatch held
   for human review, with the person hearing nothing, is the textbook verification complaint. It
   matters most on the `Budget spent` arm, where the person *has* been explained to once and now
   hits a wall with no further word.
3. **`a.backoff` is hidden by the bookkeeping collapse and should not be.** `displayDelta` shows
   both `a.classify` and `a.backoff` absorbed. `a.classify` is a correct absorption (classify-then-
   continue, Family A / P-CLASSIFY-01). `a.backoff` is **not bookkeeping** — it re-attempts a
   verification against a provider — but it writes no journal row, so `absorbableBookkeeping()`
   hides it and the reader sees `Safe retry available? --Retry--> Bounded retry available` with the
   retry itself invisible. Same false positive as FIN-134's `a.retry` (§FIN-134, problem 8). Two
   of six journeys, so it is generic, not a one-off.
4. **The two touches need different channel treatment and cannot express it.** Both declare the same
   `[in-session, persistent]` roles, so the card draws the same ladder on both. They are not the
   same: `a.explain` belongs in-app where they are standing, with email as the persistent copy;
   `a.explain-terminal` is a **decision** about their identity claim and must go to email
   unconditionally, in-app as well when they are present. That is one conditional route and one
   parallel send, presented today as two identical fallback ladders.
5. **Declared vs actual — soft mismatch.** `defaultPriority: "security"`, `pressureClass: "none"`.
   The exemption from caps is right. The `security` label is over-claimed: this journey responds to
   *"a verification attempt that did not establish its claim"*, and its own `c.class` says one of
   the four reasons is **our provider falling over**. Calling an unreadable-document message a
   security-priority send stretches a word that IDN-271 uses correctly for a compromise incident.
   `transactional` with `pressureClass: "none"` describes it — a message about one specific record
   the person is acting on, exempt from rationing. This is my second-least-confident call (see §6).
6. `localCap` is `{ value: 1, appliesTo: "non-mandatory" }` with basis *"the graph's own touch
   count"*, while **both** touches are `mandatory: true`. The cap is therefore vacuous, and its
   stated basis is wrong twice over: the graph has two communication actions, and they are exclusive
   arms rather than a count. Cosmetic, but it is a declaration that does not describe the data.

**Final orchestration.** **Conditional routing, single touch per route.** Four failure classes, four
different business responses, one message on each route that speaks to the customer, no sequence, no
wait, no fallback. This is one of the few journeys in the corpus where the right answer really is
`Trigger → Decision → Message → Exit` on each arm, and it should stay that way.

**Final customer channels.** **In-app** for the correctable failure and the our-fault statement —
the person is in the flow, the retry is one step away, and the in-product surface is where a
verification actually happens. **Email** for those two as the persistent copy, and for the terminal
decision **unconditionally and in parallel with in-app**: "we cannot verify this claim on this basis"
is a decision the person will need to re-read and possibly act on weeks later. **No SMS** — a
verification failure gives the person something to *do* with evidence attached, not a one-bit
action, and SMS cannot carry it.

**Customer touch count.** **1.** Exactly one of `a.explain` / `a.ours` / `a.explain-terminal` fires
per instance; the two handoff routes send nothing and pass ownership.

**Final flow.**

```
Verification attempt failed
 → Decision: What kind of failure was it?
      The person can correct it → Decision: Does the retry budget have room?
              Room  → Message: exactly what to correct, and the bounded retry
                      (In-app where in session · Email as the record)
                      → Exit: bounded retry available
              Spent → Handoff: Decision Request — carrying that the holder was explained to
                      once and has not been told the budget is spent
      Ours, and transient       → Decision: Safe retry within the backoff budget?
              Retry      → Internal: retry with backoff (drawn)
                           → Message: this failed on our side, nothing you sent was
                             rejected, we are retrying  (In-app)
                           → Exit: bounded retry available
              Persistent → Handoff: Ownership Escalation
      Needs a person            → Handoff: Decision Request — carrying that the holder
                                  has not been told anything yet
      Terminal by policy        → Message: this claim cannot be verified on this basis,
                                  and what basis would be accepted
                                  (Email and In-app together)
                                  → Exit: verification not possible on this basis
```

**State re-checks.** None needed and none present — the journey resolves synchronously from the
failure record. Correct.

**Stop conditions.** None to add: there is no wait to stop. The journey's stop condition is its own
exit, and a subsequent attempt on the same claim opens a new instance.

**Ownership / handoff.** `competition: "none"`, `distinctFrom: []` — the only empty `distinctFrom`
in my six. IDN-81 owns verification expiry and is named only in the trigger's `insufficientAlone`
prose; DEC-181 and OWN-55 own the escalations. See C11.

**Canonical changes needed.**

- **C9 (P1).** Add `a.ours` on the `c.technical-budget → Retry` arm: a single-channel in-app
  statement that the failure was ours, that nothing they submitted was rejected, and that it is
  being retried. Single channel, single touch, no new wait, no new decision. Register it as touch
  `t3`, stage `explain`, `channelRoles: ["in-session"]`, `mandatory: true`.
- **C10 (P1).** Extend both `h.review` handoffs' `carries` to state what the holder has and has not
  been told, so the receiving journey knows whether it owes them a first word. On the
  `c.retry-budget → Budget spent` edge add: *"that the holder was explained to once and has not been
  told the budget is spent."* On the `c.class → Needs a person` edge: *"that nothing has been said
  to the holder about this attempt."*
- **C11 (P2).** Add `distinctFrom: IDN-81` — *"IDN-81 owns a verification that expired with no
  attempt made. This journey owns one attempt that was made and failed; it never waits to see
  whether the holder retries, because the window is IDN-81's."* This is the sentence that makes the
  no-wait decision legible instead of looking like an omission.
- **C12 (P2).** Split the channel declaration per touch: `a.explain` and `a.ours`
  `["in-session", "persistent"]` / `["in-session"]`; `a.explain-terminal` `["persistent",
  "in-session"]` with `simultaneous: { allowed: true, reason: "a decision about an identity claim is
  both read now and kept" }`. Requires §0.2 to be readable on the page.
- **C13 (P2).** `defaultPriority` `security` → `transactional`, keeping `pressureClass: "none"`.
  Set `localCap.default.value: 0` with the honest basis *"every touch in the plan is marked
  mandatory"*. See §6 — lowest-confidence item in this file.

**Display-only changes needed.** `a.backoff` must be drawn (see the renderer item). The two DEC-181
handoff instances are correctly drawn once per parent; keep.

**Renderer changes needed.** §0.1. Plus a **Family A correction**: `absorbableBookkeeping()` in
`src/lib/journey-canvas-layout.ts` hides a single-in/single-out internal action that writes nothing.
"Writes nothing" is not the same as "does nothing" — `a.backoff` (IDN-84) and `a.retry` (FIN-134)
both perform a real external attempt. The rule should absorb only actions that write a journal row,
not actions that write nothing at all; the `writes: []` case needs its own test. Two of six journeys
in this domain lose a genuine step to it.

---

## IDN-271 · Account Security Alert

**Purpose.** Ask the owner the one question that resolves a suspected compromise, on a route the
suspicion does not touch, while saying plainly whether anything has actually been restricted.

**Current flow.**

```
Compromise incident opened with scope determined
 → Decision: Is there a destination the signal does not implicate?
      Every route implicated → Exit: no destination outside the suspicion; no alert sent
      Clean route → Decision: Has anything actually been restricted?
            Containment applied → Message: what was restricted, why, and that confirming
                                  the activity resolves it   (Email + SMS, simultaneous)
            Nothing restricted  → Message: was this you? nothing has been restricted
                                  (Email + SMS, simultaneous)
 → Wait: activity_confirmed_own | activity_reported_not_own | security_review_concluded,
         timeout at the incident's review point
      on event   → Decision: What did the answer establish?
            Theirs     → Message: cleared, and what was lifted → Exit: cleared
            Not theirs → Handoff: Account Recovery Verification (IDN-88)
      on timeout → Message: the incident is open past its review point, what remains
                   restricted → Exit: incident open past its review point
```

**This is the best journey of the six and needs no canonical change.** Saying so is part of the
audit: the refactor is not obliged to move everything, and a corpus where every journey was rewritten
would have failed differently.

**Problems found — all display or declaration.**

1. **The page contradicts the journey's own safety rule.** §0.2. `s.multi-destination`: *"The alert
   goes to every verified, unimplicated destination at once; a single destination that may itself be
   compromised is never the only one told."* The card says `Primary Email / Fallback SMS` — i.e.
   SMS only if email fails, which is exactly the single-destination behaviour the suppression
   forbids. This is the most damaging instance of the corpus-wide fallback artifact, because here
   the wrong reading is a security claim.
2. **The wait card drops the arm that matters.** §0.3. It renders *"Until the owner confirms the
   activity was theirs"*; the `until` list is `[activity_confirmed_own, activity_reported_not_own,
   security_review_concluded]` and the timeout is the incident's review point. On a compromise
   alert, "reported not theirs" is the arm the reader needs to see.
3. **`c.route` is one refactor away from being erased.** It is structurally identical to a generic
   deliverability gate: a binary condition whose short arm is an exit of class `no-action`
   (`x.withheld`). It survives `collapsibleGates()` today only because the corpus's corrective rule
   (PR #10) additionally requires the short arm to pass through a bookkeeping hop, and `c.route`
   goes to its exit directly. It must never be collapsed: *"is this destination implicated by the
   suspicion?"* is the single most important business decision in the corpus, not plumbing. Worth a
   `guard-display.mjs` case of its own so that a future widening of the gate rule fails mechanically
   rather than being caught by reading — which is exactly the history `audit/patterns.md` Family C
   records.
4. **Copy divergence between the touch and the node.** Touch `t-standing`'s purpose ends *"nothing
   further is **assumed from their silence**"*; the node `a.standing` says *"nothing further is
   **required from them**"*. The touch's version is the correct one and matches the wait's own rule
   (*"silence is never read as confirmation"*). The node's version is weaker and, on a still-open
   incident, arguably untrue.

**Why SMS is genuinely right here** — the brief asks for the per-journey reason rather than a blanket
escalation rule. Three things are true at once and all three are needed: the question is **one bit**
("was this you?"), the account **may be compromised right now**, and **email itself may be the
compromised destination**. That last one is what makes this a parallel send rather than a choice:
the point is not to reach the fastest channel, it is to make sure at least one destination the
attacker does not hold is told. No other journey in this domain has that property, which is why SMS
appears here and in exactly one place in FIN-134 and nowhere else in the six.

**Final orchestration.** **Parallel, then event-or-timeout.** Both halves are already authored
correctly. The parallel is justified by `simultaneous.reason` and `s.multi-destination`; the
event-or-timeout is justified by `s.owner-informed-past-review` (*"An incident open past its review
point is stated to the owner as open... it is not silently left in place"*), which is what turns the
timeout arm into a real message rather than a silent expiry. **This is the reference implementation
of event-or-timeout in the corpus** and the shape other journeys should be measured against.

**Final customer channels.** **Email and SMS together**, to every verified destination the signal
does not implicate. Not a ladder. Unchanged from canonical.

**Customer touch count.** **2** — the alert, and the resolution (cleared / standing). Both mandatory,
`localCap.default.value: 0` with the basis *"every touch in the plan is marked mandatory"*. Exemplary
and unchanged.

**Final flow.** As authored, with the alert cards showing a parallel send and the wait card showing
all three events plus the review point.

**State re-checks.** `w.verify.recheck` re-reads the incident — the owner's answer if any, the
security review's state, and what remains restricted — before acting on the timeout. That is why
`a.standing` can name what is still restricted rather than repeating the original alert. Correct.

**Stop conditions.** Any of the three events. `x.withheld` stops before any send where every route is
implicated — the alert is withheld rather than sent to the attacker, and IDN-90 (which opened the
incident) continues on the security side. Correct that there is no handoff there: nothing needs to be
told, because the journey that would be told is the one that started this.

**Ownership / handoff.** `competition: "none"` and that is right — a compromise incident contests
with nothing; `s.hard-gates-only` states the exemption explicitly. One handoff, to IDN-88 on a
confirmed compromise. IDN-90 owns scope and containment, IDN-88 owns rebuilding control, and both are
named in `distinctFrom`. **ACC-261 defers to this journey by name** (`c.actionable` branch 2,
"Placed by a security response") and IDN-271 does not name ACC-261 back — a one-sided row of the same
kind as N5, harmless but worth the ownership agent's attention (see §5).

**Canonical changes needed.**

- **C14 (P2, copy only).** Align `a.standing`'s text with its touch: *"...and that nothing further is
  assumed from their silence"*. One clause.
- Nothing else. Declared class `security` / `pressureClass: none` is **correct and is the reference**
  for what `security` should mean in this corpus — an authoritatively opened incident with a
  determined scope, not any message about identity.

**Display-only changes needed.** `c.route` must stay drawn, permanently. Recommend an explicit
`guard-display.mjs` assertion naming it, alongside the G3 condition-branch check.

**Renderer changes needed.** §0.2 (read `simultaneous` and render a "Sent together" group instead of
a Primary/Fallback ladder — this journey is the only consumer today, so per `audit/patterns.md`'s own
rule it is business logic that must be drawn, not a transform to generalise) and §0.3.

---

## FIN-134 · Payment Failure Recovery

**Purpose.** Respond to the reason a payment actually failed, and keep the obligation alive while
doing it.

**Current flow.**

```
Authoritative payment failure
 → (internal: classify into the class the provider reported — absorbed, not drawn)
 → Decision: What kind of failure was it?
      Transient, safe to retry   → (internal: retry on the same idempotency key — absorbed)
                                   → Wait: recovery
      The customer can fix it    → Message: the exact corrective action  (In-app/Email)
                                   → Wait: recovery
      Declined / no usable reason→ Decision: Is an alternative route available, and whose
                                   decision is it?
            A defined fallback the system may use → Internal: charge it → Wait: recovery
            The customer must choose or authorise→ Message: offer the alternatives
                                   (In-app/Email) → Wait: alternate choice
                                          selected → Internal: charge it → Wait: recovery
                                          timeout  → Decision: what does policy apply?
            Nothing further to offer → Wait: recovery
 → Wait: obligation_satisfied | recovery_attempt_abandoned, timeout at the consequence date
      on event   → Decision: How did recovery end?
            Satisfied → Message: obligation discharged (Email/In-app) → Exit: recovered
            Abandoned → Decision: what does policy apply?
      on timeout → Decision: Is a reminder still useful, and is there a consequence to name?
            Consequence ahead → Message: the consequence and its date, same corrective
                                action (Email/SMS/Push) → Wait: final
            Nothing to add    → Decision: what does policy apply?
 → Wait: final (obligation_satisfied | abandoned, timeout at the recovery window)
      → Decision: How did recovery end?  /  Decision: what does policy apply?
 → Decision: The obligation is unpaid after the recovery window — what does policy apply?
      Grace period       → Handoff: Grace Period Management (TIM-65)
      Overdue tracking   → Handoff: Overdue State Recalculation (TIM-62)
      Access restriction → Handoff: Access Suspension (ACC-78)
```

**Problems found.**

1. **The canvas hides the journey's first rule and prints an example-only number instead.** §0.3.
   `w.recovery` renders `2 days–3 days` and `w.alternate-choice` renders `3 days–7 days`. Neither
   says what it is waiting **for**. `s.resolved` — *"Exit the moment the obligation is satisfied,
   cancelled or waived by any means. A recovery message about a paid obligation is the failure this
   journey exists to prevent."* — is the most important sentence in the journey and is invisible on
   the page. Both those Configs carry `confidence: "low", basis: "example-only"`, and
   `w.recovery`'s carries `avoidWhen: "no consequence date - the recovery window is the only bound"`.
   A public page printing `2 days–3 days` with none of that is the fabricated-number failure
   `AGENTS.md` names.
2. **The reminder's urgent channels are declared as a fallback and are actually a condition.** `a.remind`
   is `persistent[email] + urgent[sms, push]`, rendered `Primary Email / Fallback SMS Push`. The
   `urgent` role's own `when` is *"an asserted consequence date exists inside the urgent horizon **and**
   permission for service messages on this channel is recorded"*, and `c.reminder`'s branch has already
   established *"an asserted consequence date lies ahead"*. So the real behaviour is: **email always**,
   because the corrective link has to survive; **SMS/push additionally** when the consequence is close
   enough for the person to still act. That is a conditional parallel, not a ladder, and the difference
   matters: as drawn, a person about to lose access gets an SMS only if their email bounces.
3. **A method can be charged without the customer being told.** `c.alternate` branch 1 — *"another
   stored method exists and standing authority already covers charging it"* — routes to
   `a.use-alternate` (internal) and then straight to `w.recovery`. The customer is never told the
   first method failed or that a second was charged; they learn it from their statement. In a
   journey whose own `s.hard-gates` insists it is *"transactional communication about an obligation
   the person already holds"*, that is the one silent arm.
4. **The approved chain is real in the data and unreadable on the page.** The brief's chain — Payment
   Failure → Grace Period → Access Restriction — exists, but FIN-134's three handoffs all target
   **non-public** journeys (TIM-65, TIM-62, ACC-78), which render as plain text with no link, by
   design. The **public** continuations are TIM-274 Grace Period Recovery and ACC-261 Access
   Restriction Notice, and both name FIN-134 or ACC-78 from their side (TIM-274 `distinctFrom`:
   `TIM-65, FIN-134, ACC-261, TIM-281`; ACC-261 `distinctFrom`: `ACC-78, ACC-74, TIM-274`). A reader
   of FIN-134 sees three dead-end grey cards and never learns that the customer-facing continuation
   exists. This is Family D's open P-HANDOFF-02 item, and this chain is its sharpest case.
5. **`a.retry` is hidden by the bookkeeping collapse.** Same Family A false positive as IDN-84's
   `a.backoff`: a real payment retry, writing no journal row, absorbed. The reader sees
   `What kind of failure? --Transient-- > (a wait)` with the retry invisible — so the arm that
   explains why no message is sent for a transient failure looks like an arm that does nothing at all.
6. **The one-sided ownership row — N5 / P1-5, confirmed still open on this branch.** FIN-134's
   `distinctFrom` is `[OPS-124, TIM-274]`. **SCH-303** defers to it three ways (`s.failure-not-ours`:
   *"Ownership of the money moves to payment recovery (FIN-134), and this journey stops talking about
   the payment"*; `h.payment-failure → FIN-134`; a `distinctFrom` row). **FIN-302** names it
   (*"FIN-134 is money that failed to come in and an obligation that stays open. This is money going
   back out..."*). FIN-134 names neither. `audit/new-journey-collision-review.md` §5 **F6** specifies
   the exact two rows to add and they are **not applied on this branch** — I verified the export.
   Batch D's decision to leave `contact.competition: "none"` is right and should stand;
   only `distinctFrom` is missing. **Recorded, not fixed — the ownership agent reconciles.**
7. **`w.final` duplicates `w.recovery` almost exactly.** Both wait on `[obligation_satisfied,
   recovery_attempt_abandoned]`, both route `onEvent → c.recovered`, both route `onTimeout` into the
   consequence path. The only difference is the bound: `w.recovery` ends at the consequence date,
   `w.final` at the recovery window. That is a real difference — the reminder lives between them —
   and the two waits are load-bearing. Keep both, but they should read as *"and then the rest of the
   window"* rather than as two unrelated waits, which is what the current rendering (a number, then
   an event) makes them look like.
8. **20 canonical nodes is the top of what is defensible and it is earned here.** Three failure
   classes produce three genuinely different business responses; an authority question ("whose
   decision is it to pick a method?") that the corpus is right to treat as a customer decision rather
   than an internal one; and three different downstream consequences. Do not simplify this journey to
   match the others. Its complexity is a business requirement, which is precisely the diversity the
   brief asks for.

**Declared vs actual — correct, and the reference for the domain.** `defaultPriority: transactional`,
`pressureClass: none`, `localCap.appliesTo: "non-mandatory"` with `value: 1`, and exactly one
discretionary touch (`a.remind`, `mandatory: false`) against three mandatory ones. `s.hard-gates`
states the reasoning in the journey's own words: *"Hard gates (GLB-31) apply. Pressure caps do not:
this is transactional communication about an obligation the person already holds, and it is
deduplicated by obligation and touch rather than rationed."* **That sentence is what ACT-13/ACT-14
were missing.** No change.

**Final orchestration.** **Conditional routing by failure class → event-or-timeout on the obligation
→ conditional escalation by policy.** Three patterns, each earned by a different question. The
routing is by *why the payment failed* (which changes what we ask for); the event-or-timeout is
`paid` vs `the consequence date arrives` (which is the only honest bound, since the obligation does
not expire); the escalation is by *what policy applies to an unpaid obligation* (which is not this
journey's decision to make, hence three handoffs rather than three endings).

**Final customer channels.**

- **Corrective request** — **In-app** where the person has a session, because the corrective action
  is a form and the shortest route to it is inside the product; **Email** otherwise and as the copy
  that survives. Conditional routing on session, not fallback.
- **Alternate-method offer** — same two, same reason.
- **Reminder** — **Email always** (it carries the corrective link and the consequence date, both of
  which must be re-readable); **SMS and Push additionally** where the consequence date is inside the
  urgent horizon and service-message permission is recorded on that channel. This is the one place in
  the six where SMS is right for *deadline* reasons rather than security reasons: access is about to
  be restricted, the action is short, and the person may not open email in time.
- **Discharge confirmation** — **Email** (the record that the obligation is closed) and **In-app**
  where present. No SMS: nothing is owed and nothing is urgent.

**Customer touch count.** **3** worst case — corrective request (or alternate offer), one reminder,
one confirmation. `a.remind`'s own text holds the line: *"One notice — a second one is a recovery
sequence, not a reminder."* Within the brief's 1–3 without needing a documented exception.

**Final flow.**

```
Authoritative payment failure
 → Decision: What kind of failure was it?
      Transient, safe to retry    → Internal: retry on the same idempotency key (drawn)
      The customer can fix it     → Message: the exact corrective action and what is owed
                                    (In-app where in session · Email as the record)
      Declined / no usable reason → Decision: Is an alternative route available, and whose
                                    decision is it?
            Standing authority covers it → Internal: charge it (drawn)
            The customer must choose     → Message: the alternatives, and that the
                                           obligation stands either way
                                           → Wait: until a method is selected — or the
                                             consequence date, whichever is sooner
            Nothing further to offer     → (straight to the recovery wait)
 → Wait: until the obligation is satisfied or abandoned — or the consequence date
      satisfied → Decision: How did recovery end?
            Satisfied → Message: discharged, nothing further expected, and which method
                        discharged it  (Email · In-app)  → Exit: recovered
            Abandoned → (to the policy decision)
      consequence date → Decision: Is a reminder still useful, and is there a consequence
                         to name?
            Consequence ahead → Message: the consequence and its date, same corrective
                                action  (Email always · SMS/Push when the consequence is
                                inside the urgent horizon)
            Nothing to add    → (to the policy decision)
 → Wait: the rest of the recovery window — until satisfied or abandoned
 → Decision: The obligation is unpaid after the recovery window — what does policy apply?
      Grace period       → Handoff: Grace Period Management
                           (TIM-274 Grace Period Recovery is what the holder hears next)
      Overdue tracking   → Handoff: Overdue State Recalculation
      Access restriction → Handoff: Access Suspension
                           (ACC-261 Access Restriction Notice is what the holder hears next)
```

**State re-checks.** Three, all authored and all correct — and this journey is the corpus's best
example of why the brief asks for them. `w.recovery.recheck`: *"the obligation is still outstanding
and the method is still invalid, read from the system of record immediately before the reminder."*
`w.alternate-choice.recheck` and `w.final.recheck` likewise. No reminder can reach somebody who has
paid. Keep all three verbatim.

**Stop conditions.** `obligation_satisfied` at any point routes to the confirmation, never to
silence. `recovery_attempt_abandoned` routes to the policy decision. `s.retry-in-progress` blocks the
corrective request while a system retry may still succeed — a genuinely good rule that prevents the
"your payment failed" / "your payment succeeded" pair two minutes apart. `s.unknown-outcome` blocks
everything on an unreconciled attempt. All correct; no change.

**Ownership / handoff.** Three handoffs, all to non-public lifecycle mechanisms; `h.grace` carries a
`suppresses` clause that correctly stops every further payment-failure message while the grace window
runs. **It takes ownership from checkout recovery** (the decided rule) and **is deferred to by
SCH-303 and FIN-302 while naming neither** — N5 / P1-5, open, F6 specifies the fix, recorded here for
the ownership agent.

**Canonical changes needed.**

- **C15 (P1).** Extend `a.confirmed` to name which method discharged the obligation, and add a
  suppression — `s.authorised-method`: *"Where a stored method was charged under standing authority
  after another failed, the confirmation names the method used. A charge the person did not choose
  is disclosed at the moment the obligation closes, not discovered on a statement."* Closes the
  silent-alternate arm without adding a node.
- **C16 (P2).** Give `w.recovery` and `w.alternate-choice` Configs that are honest on a page: keep the
  `example-only` ranges in the detail panel, but the card must show the event and the bound. If the
  renderer fix in §0.3 lands, no canonical change is needed here at all — this item exists only as
  the fallback if the renderer is not changed.
- **C17 — recorded, not to be fixed by this agent (N5 / P1-5 / F6).** `FIN-134.distinctFrom` +=
  `SCH-303` and `FIN-302`, wording already specified verbatim in
  `audit/new-journey-collision-review.md` §5 F6. Verified absent from the current export.
  `contact.competition` stays `"none"` — Batch D's reasoning holds.

**Display-only changes needed.**

- `a.retry` and `a.use-alternate` must both be drawn. `a.use-alternate` already is; `a.retry` is not.
- The handoff cards for `h.grace` and `h.restrict` should name the **public journey the holder hears
  next** (TIM-274, ACC-261) alongside the non-public target. This is the generic form of Family D's
  open P-HANDOFF-02 item: where an archived handoff target is narrated by a public journey, say so
  and link that one. It is derivable — TIM-274 and ACC-261 both name the target in `distinctFrom` —
  so it is a rule, not a per-journey lookup.

**Renderer changes needed.** §0.1 (the reminder is the case that proves it), §0.3 (both key waits),
and the Family A `writes: []` correction from IDN-84.

---

## FIN-302 · Refund Notification

**Purpose.** Tell the person money is going back, and then whether it actually arrived — keeping the
decision to refund, the movement of the money and its arrival as three facts stated at the moments
each becomes true.

**Current flow.**

```
Refund submitted for settlement
 → Decision: What is actually moving, and against what?
      The whole transaction → (send gate)
      Part of it            → (send gate)
      Nothing is moving     → Exit: nothing to announce
 → (send gate: may the notice go out? — hidden, correctly)
      No route → (internal: record why) → Exit: no notice sent
 → Message: money is going back — the amount, whole or part, and that it has not arrived
   (Email/In-app)
 → Wait: refund_settlement_confirmed | refund_settlement_failed, timeout at the settlement
   window (both arms → one condition, collapsed into it)
 → Decision: What does the financial record say happened to the money?
      Returned in full → Message: returned, and how much  → Exit: returned and confirmed
      Returned in part → Message: what came back, what did not, what happens to the rest
                         → Exit: partly returned
      Not confirmed    → Message: not confirmed back, being reconciled, nothing needed
                         from you → Exit: not confirmed back
```

**This journey is close to exemplary and its guardrails are the reason.** `s.approved` (*"Approved is
not refunded and submitted is not settled"*), `s.timing` (*"Nothing is promised about when the money
will appear"*), `s.partial`, `s.unknown` and `s.once` (*"One message per state that becomes true"*)
are the tightest set in the six, and the graph honours all of them except on one arm.

**Problems found.**

1. **A withdrawal mid-window is told as a reconciliation.** `x.void` catches a submission withdrawn
   *before* anything was said. After `a.issued` has gone out, `w.outcome` waits on
   `[refund_settlement_confirmed, refund_settlement_failed]` only — so a submission reversed or
   withdrawn during the window falls to the timeout and the person is told *"the money has not been
   confirmed back, the movement is being reconciled."* That is false; it was withdrawn, and
   `s.approved`'s own standard (*"Every message says which of the three is true at the moment it is
   sent"*) is broken. There is **no withdrawal event in the registry** — `grep refund_ events.ts`
   returns only `authorized_for_execution`, `requested`, `settlement_confirmed`, `settlement_failed`,
   `submitted_for_settlement` — so this needs a registry addition, not just a branch.
2. **`c.scope`'s whole-vs-part split does not change the route.** Both branches go to the same node.
   The twin-route edge merge already draws them as one edge labelled *"The whole transaction · Part
   of it"*, so a reader sees a decision whose two visible labels lead to the same box — Family F's
   P-FORK-NOOP-01. **What the split is actually doing** is asserting a content requirement, and that
   requirement already lives in two better places: `s.partial` (*"A partial refund is named as
   partial, with the amount returned and the amount still refundable stated separately"*) and
   `a.issued`'s own prose. **Why it does not change treatment:** the same message goes out on the
   same channels to the same person either way; only the numbers inside it differ, and the numbers
   come from the record, not from the branch. The only real question `c.scope` asks is *"is anything
   moving at all?"*
3. **The wait card drops the failure arm.** §0.3 — it renders *"Until the financial record confirms
   that funds were returned..."* and never mentions `refund_settlement_failed` or the settlement
   window. On a refund journey, the dropped arm is the one the person is afraid of.
4. Channel presentation: §0.1.

**The REM-305 boundary — intact, and stated from this side.** The brief asks that FIN-302 hold the
line after REM-305 was constrained. Verified on this branch, both sides present:

- **FIN-302 → REM-305** (`distinctFrom`): *"REM-305 closes a support request and tells the requester
  that a resolution was reached; its subject is the case, and it states no amount, no timing and no
  settlement state. This journey is the one that announces the money, read from the financial record."*
- **REM-305** carries `s.money` and `distinctFrom: FIN-302` — F3 applied.

**Stated from FIN-302's side, the boundary is three claims REM-305 does not carry and must not make:**
the **amount** (`s.partial` — a part announced as a whole), the **timing** (`s.timing` — no date is
promised, because the settlement route's timing is not the sender's to assert), and the **settlement
state** (`s.approved` — submitted is not settled). REM-305 may say a request closed. It may not say
the refund settled, how much came back, or when it will appear, because it reads the case record and
those three facts live in the financial record (FIN-138's). **No change needed; keep it exactly as
it is and do not let a later edit soften `s.approved`, which is the load-bearing one.**

**Final orchestration.** **Single notice, then event-or-timeout resolving to one of three mutually
exclusive outcome statements.** Not a sequence and not a fallback: `a.settled`, `a.partial` and
`a.unresolved` are exclusive arms of one condition, which is exactly what the journey's `localCap`
basis says (*"the outcome touches are exclusive arms of one condition rather than a sequence"*).
This is the cleanest event-or-timeout in the domain after IDN-271, and it is the right shape because
the second message exists only when a *state* became true, never because time passed — `s.once`.

**Final customer channels.** **Email** for both touches — a statement about money is the thing people
go back and look for, forward to someone, and check against a bank statement. **In-app**
additionally where the person is in the product with the original transaction and its refund both on
screen, because that is where the statement belongs beside the thing it is about. **No SMS, no push,
and this is the clearest case in the six.** There is nothing for the person to do, no deadline to
beat, and the entire value of the message is that it can be re-read. An SMS saying money is on its
way, with no amount retained and no record kept, generates the support contact the journey exists to
prevent.

**Customer touch count.** **2** — the movement, then the outcome. Both mandatory. `s.once` forbids a
third and is right.

**Final flow.**

```
Refund submitted for settlement
 → Decision: Is money actually moving?
      Nothing is moving → Exit: nothing to announce
 → Message: money is going back — the amount submitted, whole or part with the remainder
   named separately, and that it has not arrived yet  (Email · In-app where present)
 → Wait: until the record confirms the money was returned or failed — or the settlement
   window closes
 → Decision: What does the financial record say happened to the money?
      Returned in full  → Message: returned, and how much → Exit: returned and confirmed
      Returned in part  → Message: what came back, what did not, what happens to the rest
                          → Exit: partly returned
      Withdrawn         → Message: the refund was withdrawn before it settled, and what
                          the record now shows → Exit: withdrawn after notice
      Not confirmed     → Message: not confirmed back, being reconciled rather than
                          re-attempted, nothing needed from you → Exit: not confirmed back
```

**State re-checks.** One, authored and correct: `w.outcome.recheck` re-reads *"the refund record, the
original transaction and the remaining refundable amount, re-read from the financial systems that own
them"*. That is what makes the partial arm honest — the remaining refundable amount is read at the
moment of the second message, not carried from the first. Keep verbatim.

**Stop conditions.** `refund_settlement_confirmed` / `_failed` end the wait; the settlement window
bounds it; `x.void` stops before any send; the hidden send gate stops with a recorded reason where no
route exists. After the outcome message the journey ends — `s.once` forbids a reminder, and a further
refund against the same transaction is a new instance with its own `refund_id`.

**Ownership / handoff.** No handoffs, `competition: "none"`, and five `distinctFrom` rows — FIN-137
(who decided), FIN-138 (who moved the money and tells nobody), REM-157 (which remedy), FIN-134 (money
in vs money out), REM-305 (the case vs the money). That is the most completely stated boundary set in
the six. **FIN-134 does not name it back** — N5 / P1-5, recorded under FIN-134 C17.

**Canonical changes needed.**

- **C18 (P1).** Add `refund_submission_withdrawn` to the event registry via
  `scripts/event-curation.json` + `node scripts/build-event-registry.mjs`; add it to
  `w.outcome.untilEvent`; add a fourth branch to `c.outcome` (*"the submission was withdrawn or
  reversed after the notice went out"*) → new message `a.withdrawn` → new exit `x.withdrawn`, class
  `invalid-state`. This is the one place the journey currently makes a claim its own `s.approved`
  forbids.
- **C19 (P2).** Reduce `c.scope` to two branches — `Money is moving` → send gate, `Nothing is
  moving` → `x.void` — and rely on `s.partial` and `a.issued`'s existing content requirement for the
  whole/part distinction, which is where it already lives. Removes a drawn decision whose two labels
  point at the same box and teaches the reader nothing.
- Nothing else. The declaration is exemplary: `transactional` / `pressureClass: none` /
  `localCap.value: 0` with the basis *"every touch in the plan is marked mandatory"*, and the entity
  note (*"a further refund against the same transaction is its own movement with its own instance,
  which is what keeps a partial refund from being announced twice as a whole one"*) does real work.

**Display-only changes needed.** None beyond §0. Confirm the send-gate collapse stays: `c.sendable`
→ `a.record-no-action` → `x.no-action` (class `no-action`, through a bookkeeping hop) is a textbook
implementation gate and `collapsibleGates()` is right to hide it. It is also a useful contrast with
IDN-271's `c.route`, which looks identical and must never be hidden — the difference is that one
records why nothing was sent and the other decides who is safe to tell.

**Renderer changes needed.** §0.1 and §0.3.

---

## 4. Pattern distribution

| ID | before (as drawn) | after | why that pattern |
|---|---|---|---|
| ACC-261 | conditional routing + event-or-timeout, one arm truncated | **conditional routing → event-or-timeout** | two routing decisions that change what is said; one wait ending on the restriction's own resolution or its stated deadline |
| ACC-263 | segment-based + event-or-timeout (second half unreachable) | **segment-based → event-or-timeout, one reminder** | the first-vs-familiar split changes the message; the window is the pressure, so one reminder and no sequence |
| IDN-84 | conditional routing, one arm silent | **conditional routing, single touch per route** | four failure classes, four business responses; the retry window is IDN-81's, so no wait belongs here |
| IDN-271 | parallel + event-or-timeout (drawn as fallback) | **parallel → event-or-timeout** (unchanged) | every unimplicated destination at once because one of them may be the attacker's; the review point is a real bound |
| FIN-134 | conditional routing + event-or-timeout + escalation | **same, unchanged in shape** | three failure classes, an authority question, three policy consequences — complexity earned by the business |
| FIN-302 | single notice + event-or-timeout | **single notice → event-or-timeout** (unchanged in shape) | one message per state that becomes true; three exclusive outcome statements, not a sequence |

**Six journeys, five distinct patterns, no two identical.** Nothing was pushed toward a common shape:
IDN-84 stays synchronous with no wait at all, FIN-302 stays at two touches, FIN-134 stays at twenty
nodes. Four of the six genuinely fit event-or-timeout and one genuinely does not, which is the answer
the brief asked me to check rather than assume.

**Fallback count after this audit: zero.** No journey in this domain declares a fallback in the
brief's sense, and none needs one. Every "Fallback" row on every card in all six is §0.1.

**SMS appears twice, both earned:** IDN-271 (the destination itself may be compromised, so the alert
goes to every clean route at once) and FIN-134's reminder (access is about to be restricted and the
action is short). It appears nowhere else, and four of the six are email-plus-in-app because what
those journeys send is a record, not a prompt.

---

## 5. Declared priority vs actual behaviour

Checked `contact.defaultPriority` and `contact.pressureClass` against what each journey does.

| ID | declared | verdict |
|---|---|---|
| ACC-261 | `service` / `service`, cap 2 `appliesTo: all`, **all touches `mandatory: false`** | **Mismatch.** `s.g4` makes the restoration confirmation an obligation and `s.g2` makes the notice one, but both are declared rationable. Same class of defect as ACT-13/ACT-14. Fix: C4. |
| ACC-263 | `service` / `service`, cap 2 `appliesTo: all`, all `mandatory: false` | Correct. Nothing here must be sent — an unclaimed entitlement is a loss, not a broken promise — and `service` is right because the entitlement is already granted and already theirs. |
| IDN-84 | `security` / `none`, cap 1 `appliesTo: non-mandatory`, both touches mandatory | **Soft mismatch.** The cap exemption is right; the `security` label over-claims — one of this journey's four failure classes is *our provider falling over*. `transactional` / `none` describes it. Also the cap's basis (*"the graph's own touch count"*) is wrong: two exclusive actions, both mandatory, cap vacuous. Fix: C13. |
| IDN-271 | `security` / `none`, cap 0, every touch mandatory, `s.hard-gates-only` | Correct, **and the reference** for what `security` means: an authoritatively opened incident with a determined scope. |
| FIN-134 | `transactional` / `none`, cap 1 `appliesTo: non-mandatory`, one discretionary touch | Correct, **and the reference** for a payment journey. `s.hard-gates` states the reasoning in the journey's own words — the sentence ACT-13/ACT-14 were missing. |
| FIN-302 | `transactional` / `none`, cap 0, every touch mandatory | Correct. Cap basis (*"every touch in the plan is marked mandatory"*) is the honest form other journeys should copy. |

**One hard mismatch (ACC-261) and one soft one (IDN-84).** Neither is a suppression risk in the
ACT-13/ACT-14 direction — no journey in this domain is declared `lifecycle` or `promotional`, so none
of them is exposed to the CON-300 sunset or traded against a marketing cap, and that is correct: a
restriction notice, a verification result, a failed payment and a refund are none of them marketing.
The transactional/promotional line holds across all six. ACC-261's defect is the inverse risk — a
service journey that declares its obligatory touches discretionary, so a pressure budget could
legitimately withhold the message telling somebody their access came back.

**Open ownership rows (for the ownership agent, not fixed here):**

- **N5 / P1-5 — FIN-134 names neither SCH-303 nor FIN-302.** Confirmed still open on this branch.
  F6 specifies both rows verbatim. `contact.competition` stays `"none"`.
- **ACC-261 → IDN-271 is one-sided.** ACC-261's `c.actionable` defers to the security response by
  name and IDN-271 does not name ACC-261 back. Harmless (the deferral is enforced by ACC-261's own
  branch) but it is the same shape as N5 and belongs on the same list.

---

## 6. The three calls I am least sure about

1. **IDN-84 C13 — demoting `defaultPriority` from `security` to `transactional`.** The practical
   effect is nil, because `pressureClass: "none"` already carries the exemption and `security` and
   `transactional` are treated the same by every gate I can see. My argument is semantic: if
   `security` means anything, IDN-271 is what it means, and letting a "your document was unreadable"
   message carry the same class erodes it. But the counter-argument is real — a verification failure
   *is* an account-integrity event, and a failed identity check gating access to money is closer to
   IDN-271 than my framing admits. **If the corpus wants `security` to mean "identity and access
   integrity" rather than "an open compromise incident", IDN-84 is already correct and C13 should be
   dropped.** That is a product call about vocabulary, not a defect, and I would not implement C13
   without it being made explicitly.

2. **IDN-84 C9 — adding the `a.ours` message on the transient-failure arm.** I am confident the
   silence is wrong; I am not confident a journey message is the right instrument. The honest
   counter-argument is that a transient provider failure clears in seconds while the person is still
   watching a spinner, and the in-product surface — not a lifecycle journey — should say "retrying".
   If that is true, C9 adds a message that arrives after the problem resolved, which is exactly the
   noise the brief warns against. I chose to recommend it because the arm is reachable *only* when
   the backoff budget has room and the failure has already been classified as ours, and because
   `a.explain`'s own reasoning (an unexplained retry produces the same attempt again) applies with
   more force when the evidence was fine. **The safer variant, if C9 is rejected: leave the arm
   silent but extend `c.technical-budget`'s "Retry" branch prose to say the product surface owns the
   statement, so the silence is a documented decision rather than a gap.**

3. **FIN-302 C19 — collapsing `c.scope` from three branches to two.** The whole/part distinction is
   the single thing FIN-302 is most careful about (`s.partial`, the entity note about not announcing
   a part as a whole, a separate `a.partial` outcome message). Removing it from the *routing* while
   keeping it in the *content* is right by the brief's rule — a split that sends the same message on
   the same channels to the same person does not change treatment — but it removes the most visible
   signal that the journey takes partial refunds seriously, on the one journey where that signal is
   most load-bearing. **If a reviewer would rather keep the three-way split as a statement of intent,
   I would not argue hard.** The cheaper half of the change is uncontroversial and worth doing either
   way: the twin-route edge merge already draws the two arms as one edge, so the canvas is currently
   showing a fork with two labels and one destination, which is the worst of both readings.

A fourth, noted rather than counted: **ACC-261 C1** (routing the inform-only arm into the shared
wait) adds a second touch to a path that currently has one, on a journey whose person has been told
there is nothing they can do. I am confident it is right — `s.g4` requires it and the alternative is
leaving somebody permanently uninformed about their own access — but it is the only change in this
file that increases contact.

---

## 7. Summary table

| ID | before pattern | after pattern | channels | touches | biggest change |
|---|---|---|---|---|---|
| **ACC-261** Access Restriction Notice | conditional routing + event-or-timeout, one arm dead-ends after a single message | **conditional routing → event-or-timeout**, both arms share the wait and the outcome | Email always · In-app where in session. No SMS. | 2 | The "nothing you can do" arm now hears that the restriction lifted — `s.g4` is honoured on both arms instead of one; plus an arm for `restriction_made_permanent`, which is waited for and currently unhandled |
| **ACC-263** Activation Reminder | segment-based + event-or-timeout with an **unreachable second half** | **segment-based → event-or-timeout, one reminder** (shape unchanged) | Email always · In-app where in session. No SMS/push. | 2 | The reminder can actually fire: `w.first-use` gets its own reminder-lead Config instead of timing out at the window end, where `c.remind`'s own branch condition is false by construction |
| **IDN-84** Verification Recovery | conditional routing, one arm customer-silent | **conditional routing, single touch per route** — explicitly *not* event-or-timeout | In-app + Email, per-touch; terminal decision on both together. No SMS. | 1 | Checked the event-or-timeout hypothesis and rejected it with evidence: the retry window is IDN-81's, named in this journey's own trigger evidence. The transient-failure arm gains the one message it was missing |
| **IDN-271** Account Security Alert | **parallel + event-or-timeout, drawn as a fallback ladder** | **parallel → event-or-timeout** — canonical unchanged | Email **and** SMS together, to every unimplicated destination | 2 | No canonical change. The page is the defect: `simultaneous` is declared, typed and read by nothing, so the corpus's one genuine parallel renders as the exact behaviour its own suppression forbids |
| **FIN-134** Payment Failure Recovery | conditional routing + event-or-timeout + policy escalation | **same shape, unchanged** — complexity is earned | In-app/Email (corrective) · Email always + SMS/Push inside the urgent horizon (reminder) · Email/In-app (confirmation) | 3 | The canvas prints `2 days–3 days` — an `example-only`, `confidence: low` range — where the journey's first rule ("exit the moment the obligation is satisfied") should be. Plus the silent alternate-method charge, and the N5 one-sidedness recorded for the ownership agent |
| **FIN-302** Refund Notification | single notice + event-or-timeout | **single notice → event-or-timeout** — shape unchanged | Email always · In-app where present. **No SMS — the clearest case in the six.** | 2 | A refund withdrawn after the notice went out is currently told as "being reconciled", which `s.approved` forbids; needs a registry event and a fourth outcome arm. The REM-305 boundary is intact and is restated here from FIN-302's side as three claims REM-305 may not make: the amount, the timing, the settlement state |
