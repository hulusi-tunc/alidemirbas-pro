# Phase 1 audit — Activation, onboarding & early value

**Scope:** the 7 public ACT journeys — `ACT-12` `ACT-13` `ACT-14` `ACT-17` `ACT-18` `ACT-19` `ACT-20`.
**Method:** `audit/refactor/_AUDIT-BRIEF.md`, applied question-by-question per journey.
**Evidence:** `audit/public-journeys-current-state.json` (canonical + rendered state, build `P0oUOg5KFhHcUmzvrIWCE`),
`audit/DECISIONS-PENDING.md` (items B1, B2, B5, A7), `audit/channel-orchestration-map.md`,
`audit/patterns.md`. No source file was modified.

---

## Domain finding before the per-journey sections

Four of these seven journeys are authored with the **same channel declaration**: two roles,
`in-session → in-app` and `persistent → email`, plus `fallback: "same-role-other-channel"`
(ACT-12 `a.surface`, ACT-13 `a.specific-action`, ACT-17 all three touches, ACT-19 `a.ask`).
ACT-14 carries the same declaration with a third role wedged in, on **all four** of its message
actions identically. That is the "same shape everywhere" risk the domain brief names, and it is
real: five journeys, eleven message actions, one channel plan.

Two things follow, and they point in opposite directions.

**1. The in-session / off-session split is genuine, and it is not a fallback.** `ChannelStrategy.fallback`
is defined in `src/canonical/types.ts:352` as *"DELIVERY recovery for the same touch after a delivery
failure — not the next touch."* So the canonical schema never claimed these were fallbacks. The
**renderer** claims it: `ChannelPriorityRow` (`src/components/ui/JourneyCanvasNodes.tsx:259`) labels
row 0 "Primary" and every later row "Fallback", **by position**, discarding the `role` name that
`channelPlan` already carries. Every multi-role message card in this domain therefore reads
*Primary: In-app / Fallback: Email* when the authored meaning is *in the product → in-app; otherwise →
email*. This is a display defect, not a canonical one, and fixing it is the single highest-leverage
change in the domain (it touches 11 cards in these 7 journeys alone). It is written up under
**Renderer changes needed** on ACT-12 and not repeated seven times.

**2. Declaring it once on a role list is not the same as showing it.** Where the route genuinely
changes what the customer sees, the audit makes it a **visible condition with one card per channel**,
per the brief's canvas rule. I apply that to exactly three journeys — ACT-12's step prompt, ACT-14's
help offer, ACT-19's question — because in those three the message *lands in a different place*
depending on the answer. I deliberately do **not** apply it to ACT-17, ACT-18 or ACT-20, where the
business moment already determines the channel without asking anything, and I remove the second
channel entirely from ACT-13 and ACT-20 rather than dress a declaration up as a route.

**Reclassification.** ACT-13 and ACT-14 are `priority: service` / `pressureClass: service` in the
current data. That is correct and it is load-bearing here: both answer something the person is
already doing (a named blocker, visible help-seeking), so neither is bounded by the lifecycle
pressure budget and neither should behave like a nurture. It changes two things in this audit —
their touch caps are re-expressed as *customer*-touch caps of **1** (ACT-13) and their channel
choice is decided by "what does a stuck person need to keep?" rather than by reach.

---

## ACT-12 · Onboarding Nurture

**Purpose.** Advance onboarding from the state the product's own setup record reports, one useful
step at a time, until activation or the window closes.

**Current flow**

```
t.active (onboarding_active_without_activation)
 → a.read (read the milestone record)
 → c.next-step  Is there a critical next step still outstanding?
     ├─ outstanding → a.surface  [In-app + Email, one card, "Primary / Fallback"]
     └─ setup done  → c.ready  Has activation actually been achieved?
            ├─ yes → h.activated (ACT-16)
            └─ checklist done, no value → w.progress
 a.surface → w.progress  (until setup_milestone_completed | activation_recorded;
                          timeout onboarding.step_interval)
     ├─ on event   → c.what-happened  Which event arrived?
     │      ├─ activation → h.activated (ACT-16)
     │      └─ progress, no value → a.read            ← loop back
     └─ on timeout → c.window  Is the onboarding window still open?
            ├─ open    → c.stalled-step  Is the same prerequisite actually blocking activation?
            │      ├─ named prerequisite unchanged → h.blocker (ACT-13)
            │      └─ nothing identifiable → a.read  ← loop back
            └─ expired → x.window-closed
```

12 canonical nodes, 13 drawn (`h.activated` is drawn once per parent). **Customer touches today: up
to 5** — one `a.surface` node re-entered through two back edges, bounded only by
`onboarding.step_prompts` (`default 5`, `confidence: low`, `basis: example-only`). This is
**DECISIONS-PENDING B2**.

**Problems found**

1. **Five touches against a brief that asks for 1–3, and the five exist nowhere in the graph.** The
   cap is an invisible counter. A reader of the canvas cannot see what stops the loop, and the one
   thing that does stop it is a number with `basis: example-only`.
2. **The budget is a ceiling, not a cascade — but nothing on the page says so.** Each prompt re-reads
   the milestone record (`a.read`) and `s.done-step` forbids re-suggesting a completed step. That is
   a genuinely good property and it is invisible: `a.read` renders as a generic "Internal" card.
3. **`a.read` is a bookkeeping-looking card doing the journey's most important work.** It survives
   absorption only because its in-degree is 3. Its content — "read from the product's own record of
   what was done rather than from what was sent or opened" — is the answer to `c.next-step`, drawn
   as a separate box one hop earlier.
4. **The in-session/off-session route is declared and never drawn** (see the domain finding).
5. Two loop-backs converge on `a.read` from conditions that mean different things (a step *was*
   completed vs nothing happened at all), and after the merge the journey cannot tell them apart.

**Final orchestration — sequential (state-driven repeat, capped at 3) + conditional routing**

Sequential, because the prompts genuinely follow one another and each one is about a *different*
step. Not a cascade: the sequence is driven by the milestone record, so touch 2 exists only if the
record still shows work outstanding. Conditional routing inside each touch, because the next step is
taken in the product and the prompt should point at it from where it is taken — with email as the
route for a person who is not there, not as a fallback for a failed in-app send.

**Final customer channels.** In-app (in session) · Email (otherwise). One channel per card.

**Customer touch count: 3 maximum** (down from 5), and 1 is the common case.

**Final flow**

```
t.active (Onboarding active without activation)
 → c.next-step  Is there a critical next step still outstanding?      [reads the milestone record]
     ├─ A critical step is outstanding → c.where
     └─ Setup complete → c.ready  Has activation actually been achieved?
            ├─ Activation recorded → h.activated (ACT-16)
            └─ Checklist finished, no value produced → w.progress
 c.where  Is the person in the product right now?
     ├─ In session     → a.prompt-inapp  [In-app · the one next step, at the place it is taken]
     └─ Not in session → a.prompt-email  [Email · the same step, with what it is for]
 a.prompt-inapp / a.prompt-email → w.progress
 w.progress  until setup_milestone_completed | activation_recorded
             timeout onboarding.step_interval (required; relative to previous touch)
     ├─ on event   → c.what-happened  Which event arrived?
     │      ├─ Activation recorded → h.activated (ACT-16)
     │      └─ A step was completed, value not produced yet → c.budget
     └─ on timeout → c.window  Is the onboarding window still open?
            ├─ Open → c.stalled-step  Is one named prerequisite actually blocking activation?
            │      ├─ Yes, unchanged and blocking → h.blocker (ACT-13)
            │      └─ No progress, nothing identifiable → c.budget
            └─ Expired → x.window-closed
 c.budget  Is there a step prompt left in this instance's budget?
     ├─ Yes    → c.next-step                       (back edge; the record is re-read)
     └─ Spent  → x.prompts-spent
```

15 canonical nodes. The change that matters is `c.budget`: **the cap becomes a decision on the
canvas instead of a counter behind it.** A reader now sees that the journey stops prompting for a
stated reason, and the budget drops 5 → 3.

**State re-checks.** `c.next-step` is the re-read — every repeat passes through it before a prompt is
composed, so a completed step is never suggested again and the property survives the recount.
`c.what-happened` separates "a step was completed" from "activation happened". `c.window` re-reads
the window before any further prompt. `c.stalled-step` re-reads whether one named prerequisite is
the obstacle (this is what routes to ACT-13, not a timer).

**Stop conditions.** `activation_recorded` from anywhere (supersedes the journey wherever it sits,
`s.activated`); a named prerequisite established as the blocker (→ ACT-13); the onboarding window
expiring; the prompt budget being spent; an open ACT-14 assisted session (`s.assisted`); an
outstanding ACT-19 question (`s.personalizing`); marketing suppression (`s.sunset`).

**Ownership / handoff.** ACT-12 is the *route-walker*. It yields to ACT-13 the moment the obstacle
has a name (`h.blocker`, which carries the exact outstanding prerequisite and suppresses the generic
prompt for it), pauses under ACT-14 and ACT-19, and hands to ACT-16 on activation. It is the
*destination* of ACT-13 `h.resume`, ACT-19 `h.progress` and ACT-20 `h.onboarding`. **Nothing here is
reopened** — A7 (ACT-19 vs ACT-12) is already resolved in the data by `s.personalizing` and the
eligibility clause that names it; this audit keeps both verbatim.

**Canonical changes needed**

- `contact.localCap.onboarding.step_prompts.default.value`: **5 → 3**; keep `required: false`, raise
  `confidence` to `medium` and change `basis` from `example-only` to `corpus-rule` — 3 is now the
  graph's own ceiling, not an illustration. Keep the `rule` sentence; it is the thing that makes the
  budget honest and it is quoted on the page.
- Delete node `a.read`. Move its sentence into `c.next-step.observes` ("the product's own record of
  completed setup milestones, never send or open history") and repoint the two back edges to
  `c.next-step` via the new `c.budget`.
- Add `c.budget` — `asks: "Is there a step prompt left in this instance's budget?"`, branches
  `→ c.next-step` / `→ x.prompts-spent`.
- Add exit `x.prompts-spent` — state "step prompts spent; onboarding continues without further
  prompting", `class: "no-action"`, `reEntry:` a further `setup_milestone_completed` or a new
  onboarding instance re-opens it; the completed milestones are kept.
- Split `a.surface` into `a.prompt-inapp` (`channelRoles: ["in-session"]`) and `a.prompt-email`
  (`channelRoles: ["persistent"]`), both `execution: "communication"`; add `c.where` above them.
- `orchestration.touches`: replace the single `t1` with `t1-inapp` / `t1-email`, same `stage:
  "next-step"`, `prerequisites: ["c.next-step", "c.where"]`.
- `channelStrategy.fallback`: `"same-role-other-channel"` → `"none"`. There is no second channel to
  recover a failed in-app prompt onto; the route is chosen, not retried.
- `measurement.operational`: add `prompts_per_instance_vs_budget` beside the existing
  `prompts_per_instance`, so the 3 is measured rather than asserted.
- `distinctFrom` / `preemptedBy` / all nine suppressions: **unchanged**.

**Display-only changes needed**

- `x.prompts-spent` and `x.window-closed` must both stay drawn (G1/G5).
- The back edge `c.budget → c.next-step` is a loop; it already gets `back: true` from
  `flowNodesOf`'s position pass. Its branch label must read "A prompt remains" / "Bir istem kaldı",
  not the full `when` sentence (Family F label budget).
- Figure caption must count the drawn layout, not the canonical 15 (D5).

**Renderer changes needed** *(this item is the domain's, recorded once here)*

`ChannelPriorityRow` (`src/components/ui/JourneyCanvasNodes.tsx:259-279`) labels channel rows
`Primary` / `Fallback` **by index**, discarding `channelPlan[i].role`, which `canonical-view.ts:670`
already supplies. Change it to label each row from its role, with a bilingual `ROLE_LABEL` table
alongside `CARD_TEXT` (`in-session` → *In session* / *Oturumdayken*; `persistent` → *Otherwise* /
*Aksi halde*; `low-friction` → *One-step route* / *Tek adımlık yol*; `urgent` → *Urgent* / *Acil*;
`human` → *Person* / *Kişi*), and keep the words *Primary*/*Fallback* **only** where the journey's
`channelStrategy.fallback !== "none"`, which is what the schema defines them to mean. Glossary rows
for Primary/Fallback in `audit/glossary.md` must be updated in the same change.

---

## ACT-13 · Onboarding Blocker Reminder

**Purpose.** Aim the whole journey at one named missing thing, and resume onboarding once it exists.

**Current flow**

```
t.blocked (activation_blocked_by_named_requirement)
 → a.identify (name the exact requirement; writes blocking_requirement)
 → c.blocking  Does this requirement actually block activation?
     ├─ not blocking → x.not-blocking
     └─ blocks       → c.self-resolvable  Can this account resolve it directly?
            ├─ yes → a.specific-action  [Email + In-app, one card, "Primary / Fallback"]
            └─ no  → a.route-dependency [internal work item — human execution, NOT a channel]
 both → w.resolve  (until named_requirement_satisfied; timeout activation_blocker.resolve)
     ├─ on event   → a.stop-reminders → c.next-blocker
     │        ├─ nothing else outstanding → h.resume (ACT-12)
     │        └─ a second requirement appeared → x.next-blocker
     └─ on timeout → c.unresolved  What does this warrant?
            ├─ a person should own it → h.escalate (external human-in-the-loop)
            ├─ another path to value  → h.reroute (ACT-11)
            └─ neither → x.blocked
```

16 canonical, 15 drawn (EN) / **14 drawn (TR)**. Customer touches: **1**; cap says 2 because it
counts the internal work item (**DECISIONS-PENDING B5**).

**Problems found**

1. **The dependency branch tells the customer nothing.** If the requirement needs another team, a
   third party or a person who has not joined, ACT-13 raises an internal work item and the blocked
   account hears **silence** until either `named_requirement_satisfied` fires or the resolve horizon
   expires. A service journey whose whole purpose is "aim at one named missing thing" should not
   leave the person who is blocked uninformed on the branch where they are *least* able to act.
2. **The cap counts a work item as a touch.** `activation_blocker.touches = 2` is presented as a
   contact cap; one of the two is `a.route-dependency`, which reaches no customer.
3. **A two-role channel plan on a service notice**, rendered Primary/Fallback (domain finding).
4. **`a.stop-reminders` is correct and invisible.** It is absorbed (`writes: suppressed_sends`, a
   journal name) — which is right for the canvas, but it is the guardrail `s.g3` in executable form
   and deserves to appear in the detail panel's *Represented canonical steps*, which it does.
5. **Locale-divergent display graph.** `a.identify` is drawn on EN and **absorbed on TR**. Cause,
   traced: `absorbableBookkeeping` (`src/lib/journey-canvas-layout.ts:431`) tests
   `m.startsWith("writes ")` against `FlowNode.meta`, but on the TR route `localizeMeta`
   (`src/lib/journey-tr-overrides.ts:138`) has already rewritten that string to
   `"blocking_requirement alanına yazar (set)"`. The filter returns `[]`, and `[].every(...)` is
   `true`, so **every** single-in/single-out internal action is absorbed on TR *regardless of what it
   writes*. Corpus-wide this hits exactly the 5 journeys where an internal action writes real state
   and has degree 1: ACT-13 `a.identify`, ACT-19 `a.persist`, RET-24 `a.evidence`, RET-26 `a.assess`,
   FBK-43 `a.persist-positive`. See **Renderer changes needed**.

**Final orchestration — segment-based, with a parallel pair on one segment**

Segment-based at the top: *who can actually clear this requirement* is the question that changes
everything downstream, and it is already authored (`c.self-resolvable`). Then **single** on the
self-resolvable arm — one named action, one message — and **parallel** on the other arm: the
internal routing and a customer notice go out at the same moment because they are addressed to
**different people** and carry different content. This is the same justification the corpus already
accepts for RSK-273 (two different people) and INC-254 (record + live surface); it is not two
interruptive channels aimed at one person.

**Final customer channels.** Email, on both arms. Single channel, no route condition.

The person is blocked by something that frequently cannot be cleared in the session they are in — a
verification, an administrator, an integration credential, a colleague who has not joined. The
message has to name the requirement, say what clears it, and **survive until the person can act on
it**, which is email's defined role in this corpus. In-app is dropped: it is not a second attempt at
the same message, and a banner does not survive the walk to whoever holds the credential.

**Customer touch count: 1** (per instance, per requirement). The internal work item is not a touch.

**Final flow**

```
t.blocked (Activation blocked by a named requirement)
 → a.identify  (name the exact requirement and what it is blocking; writes blocking_requirement)
 → c.blocking  Does this requirement actually block activation?
     ├─ Value can still be produced without it → x.not-blocking
     └─ Activation cannot occur while it is unmet → c.self-resolvable
 c.self-resolvable  Can this account clear the requirement itself?
     ├─ It holds the access, information and permission → a.specific-action
     │        [Email · the one action that clears this named requirement]
     └─ It needs another team, a third party or someone who has not joined yet
              ├─ a.route-dependency  [internal work item · raise it with whoever can resolve it]
              └─ a.hold-notice       [Email · what is outstanding, who now holds it, what happens next]
              (both, at the same moment)
 a.specific-action / a.hold-notice / a.route-dependency → w.resolve
 w.resolve  until named_requirement_satisfied
            timeout activation_blocker.resolve (required; relative to trigger)
     ├─ on event   → a.stop-reminders (cancels anything queued) → c.next-blocker
     │        ├─ No other mandatory requirement outstanding → h.resume (ACT-12)
     │        └─ Clearing this one revealed a second → x.next-blocker
     └─ on timeout → c.unresolved  What does this unresolved requirement warrant?
            ├─ A person should now own it → h.escalate (external · human-in-the-loop lifecycle)
            ├─ Value is reachable by another path → h.reroute (ACT-11)
            └─ Mandatory, unresolvable, unavoidable → x.blocked
```

**State re-checks.** `c.blocking` before anything is said. `a.stop-reminders` on the event arm —
the strongest re-check in the domain, because it cancels *queued* sends rather than only declining
the next one. `c.next-blocker` re-reads whether activation is now reachable before handing back.
`c.unresolved` re-reads what the requirement warrants instead of sending again.

**Stop conditions.** `named_requirement_satisfied` (stops every reminder immediately, including
scheduled ones, `s.g3`); the requirement turning out not to block (`x.not-blocking`); the resolve
horizon expiring; a person taking ownership (`h.escalate`, which suppresses automated reminders
about this requirement).

**Ownership / handoff.** ACT-13 **owns the named-requirement moment**. ACT-12 suppresses its generic
prompt for that prerequisite (`s.blocker` + `h.blocker.suppresses`) and ACT-14 defers to it at
`c.duplicate`. One instance per `(account_id, requirement_id)`; two blockers are two instances and
are never stacked into one message (`x.next-blocker.reEntry`). **Not reopened.**

**Canonical changes needed**

- Add `a.hold-notice`, `execution: "communication"`, `channelRoles: ["persistent"]`, next `w.resolve`.
  Its `does`: name the outstanding requirement, say it is now with the party who can resolve it, and
  say what happens when it is. It must **not** ask the account to do anything — it is on the branch
  where they cannot.
- `c.self-resolvable`'s second branch now targets both `a.route-dependency` and `a.hold-notice`
  (a parallel pair). Add `channelStrategy.simultaneous: { allowed: true, reason: "the work item and
  the account notice are addressed to different people and carry different content" }` — the schema
  already has this field (`types.ts:354`) and no journey in this domain uses it.
- `orchestration.touches`: add `t3` `stage: "dependency-hold"`, `action: "a.hold-notice"`,
  `channelRoles: ["persistent"]`, `prerequisites: ["c.blocking", "c.self-resolvable"]`.
- `contact.localCap.activation_blocker.touches`: `2 → 1`, and rewrite the `rule` to say explicitly
  that it counts **customer touches** and that `a.route-dependency` is a work item, not a send
  (DECISIONS-PENDING B5, recommendation (a)). Keep `confidence: high`.
- `a.specific-action.channelRoles`: `["persistent", "in-session"]` → `["persistent"]`.
- `channelStrategy.roles`: drop the `in-session` row. Keep `human` (it describes
  `a.route-dependency`, correctly, as a non-channel). `fallback: "same-role-other-channel"` → `"none"`.
- `channels`: `["email", "in-app", "task"]` → `["email", "task"]`. Note that `task` must stay — the
  validator requires `channels` to be *backed* by an action with `execution: "human"`, and
  `a.route-dependency` is that action. It is not a customer-facing channel and must never be drawn
  as one.
- `distinctFrom ACT-14`, all three guardrails, all three suppressions: **unchanged**.

**Display-only changes needed**

- `a.hold-notice` and `a.route-dependency` must render as two cards, side by side on the same branch,
  not as a chain. The human card keeps the `Human / İnsan` kind label and carries **no channel pill**
  (`humanLabels` already excludes email/sms/push/whatsapp/in_app).
- Branch labels on `c.self-resolvable` want the short form — "They can clear it" / "Someone else
  must" — not the authored `when` sentences (Family F budget).
- All three exits and all three handoffs stay drawn (G1/G2).

**Renderer changes needed**

Fix the TR absorption bug traced above. Two options, in order of preference:

1. Run `absorbableBookkeeping` against the **structural** `FlowNode` list, before
   `localizeStructural` rewrites `meta` — i.e. compute the display graph once from the canonical
   projection and localize the surviving cards, rather than localizing and then deciding what to
   draw. This also removes a whole class of future locale-dependent display divergence.
2. If the pipeline order cannot change: make the predicate fail closed —
   `if (writes.length !== n.meta.filter(isWriteLine).length) continue;` with `isWriteLine` matching
   both the English template and `WRITES_RE`'s Turkish form — and add a check to
   `audit/measure-display.mjs` that asserts the EN and TR drawn node sets are **identical**, which
   would have caught all five journeys mechanically.

---

## ACT-14 · Onboarding Help

**Purpose.** Offer help to someone who is visibly trying and getting nowhere, and stop asking once
they have answered.

**Current flow**

```
t.struggling (help_seeking_without_activation_progress)
 → c.hard-entry → [instance closed or already activated → x.not-eligible]
 → c.duplicate  → [an open case, a human owner, or ACT-13 owns a named requirement → x.defer]
 → a.offer      [In-app + Push + Email, one card, "Primary / Fallback"]
 → w.response (until assisted_session_scheduled | activation_recorded | assistance_declined;
               timeout struggling_user.response)
     ├─ on event   → c.what-happened
     │      ├─ session scheduled → a.confirm  [same 3-channel plan] → w.session
     │      │        ├─ on event → c.outcome
     │      │        │     ├─ activation → h.activated (ACT-16)
     │      │        │     └─ no value   → c.followup → a.followup [same plan] / x.normal
     │      │        └─ on timeout → x.no-outcome
     │      ├─ activation without a session → h.activated
     │      └─ declined → x.declined
     └─ on timeout → c.final-option → a.final [same plan] / x.normal
```

19 canonical, 23 drawn (6 shared-terminal instances — `x.normal` and `h.activated` each reached from
several branches). Touches: **3** on the booked path, **2** on the silence path. Cap says 4 because
it counts nodes rather than paths.

**Problems found**

1. **Four message actions, one identical channel plan.** An offer, a booking confirmation, a
   post-session follow-up and a final self-service link are four different kinds of message with
   four different half-lives, and all four declare `in-session → low-friction → persistent`.
2. **Push does not meet its own stated condition here.** `channelStrategy` defines `low-friction` as
   *"a valid token exists and the message is a single step from the notification"*. Booking an
   assisted setup session is not a single step from a notification, and neither is reading a
   post-session follow-up. Push is declared on all four touches and earned on none.
3. **The booking confirmation is treated as a nudge.** It is the one message in this journey the
   person actually asked for — it carries a time and a join route — and it is the one that most needs
   to persist and be findable later.
4. **Cap 4 vs a real maximum of 3.** Same class of error as B4 (`ACQ-285`): the cap counts nodes,
   the graph has no path with four touches.

**Final orchestration — event-or-timeout, with conditional routing on the offer only**

The spine is genuinely event-or-timeout: everything after the offer is decided by *what the person
did* — booked, activated by themselves, said no, or said nothing — and each of those four answers
leads somewhere different. That is not a cascade and must not be flattened into one. Conditional
routing applies to the **offer alone**, because that is the one message whose right place depends on
where the person is at that moment. Every later stage is **single**, because by then the moment has
decided the channel for us.

**Final customer channels.** In-app (offer, in session) · Email (offer off-session, confirmation,
follow-up, final option). Push removed.

**Customer touch count: 3 maximum** (booked path: offer → confirmation → one follow-up), **2** on the
silence path (offer → final option), **1** on the declined path. Of these, at most **2 are nudges**
(`a.offer`, `a.final`) and they never occur on the same path as more than one another —
`s.g4` already states this and now the cap agrees with it.

**Final flow**

```
t.struggling (Help-seeking without activation progress)
 → c.hard-entry  Are the hard entry conditions met?
     ├─ The instance closed, or activation already happened → x.not-eligible
     └─ Still open and unactivated → c.duplicate
 c.duplicate  Is a person already working this same blocker?
     ├─ An open case, an assigned owner, or ACT-13 owns a named requirement → x.defer
     └─ Nothing covers it → c.where
 c.where  Is the person in the product right now?
     ├─ In session     → a.offer-inapp  [In-app · help named against the step they keep returning to]
     └─ Not in session → a.offer-email  [Email · the same offer, plus the guide for that step]
 → w.response  until assisted_session_scheduled | activation_recorded | assistance_declined
               timeout struggling_user.response (required; relative to previous touch)
     ├─ on event   → c.what-happened  What did they do?
     │      ├─ Booked an assisted session → a.confirm
     │      │        [Email · the time, how to join, and the problem it opens with]
     │      │     → w.session  until assisted_session_outcome_recorded | booking_cancelled
     │      │                  timeout = the session time plus a short grace period
     │      │        ├─ on event → c.outcome  Did activation follow the assistance?
     │      │        │      ├─ Activation recorded → h.activated (ACT-16)
     │      │        │      └─ Session happened, still no value → c.followup
     │      │        │             ├─ The session named a specific remaining action
     │      │        │             │        → a.followup [Email · that action, once]
     │      │        │             └─ Nothing specific came out of it → x.normal
     │      │        └─ on timeout → x.no-outcome
     │      ├─ Activated without any session → h.activated (ACT-16)
     │      └─ Turned the offer down → x.declined  (cooldown in force)
     └─ on timeout → c.final-option  Is one final self-service option worth sending?
            ├─ A specific guide exists for the step they were stuck on
            │        → a.final [Email · that guide, and stop] → x.normal
            └─ Nothing specific to point at → x.normal
```

**State re-checks.** `c.duplicate` before the offer (the decisive one — it is what stops ACT-14
chasing somebody ACT-13 or a human owner is already working). `c.what-happened` reads the answer
rather than assuming silence. `c.outcome` reads whether activation followed before deciding whether
anything is still owed. `c.followup` and `c.final-option` both ask *is there something specific
left to say* — and both have a branch that sends nothing, which is the guardrail that keeps this
journey from becoming encouragement.

**Stop conditions.** `assistance_declined` (hard stop plus cooldown — `s.g3`); `activation_recorded`
from anywhere; an open support case or human owner for the same issue (`s.g2`, `x.defer`); the
onboarding/trial instance closing; a booking with no recorded outcome (`x.no-outcome` — waiting
longer will not produce one); nothing specific left to say (both `x.normal` arms).

**Ownership / handoff.** ACT-14 is **below ACT-13**: `c.duplicate` explicitly defers when ACT-13 owns
a named requirement on the instance, on the stated grounds that *"the struggle is almost always that
requirement, and a help offer beside a blocker reminder is two voices on one problem."* It also
defers to any open case or assigned human owner. ACT-12 pauses its generic prompts while an ACT-14
session is booked (`s.assisted`, released on `assisted_session_outcome_recorded` or
`booking_cancelled`). **Not reopened** — all three relationships stay exactly as authored.

**Canonical changes needed**

- Split `a.offer` into `a.offer-inapp` (`channelRoles: ["in-session"]`) and `a.offer-email`
  (`channelRoles: ["persistent"]`); add `c.where` between `c.duplicate` and them.
- `a.confirm`, `a.followup`, `a.final`: `channelRoles` → `["persistent"]` each.
- `channelStrategy.roles`: drop the `low-friction` row; `fallback` → `"none"`.
- `channels`: `["email", "in-app", "push"]` → `["email", "in-app"]`.
- `contact.localCap.struggling_user.touches`: `4 → 3`, and rewrite the `rule` to state the cap is the
  **longest path**, not the node count: *offer, booking confirmation, one follow-up*. Add to the
  rule that the booking confirmation is a requested transactional message, so the **nudge** budget is
  2 and `s.g4` is its statement.
- `orchestration.touches`: `t1` becomes `t1-inapp` / `t1-email`; `t2`/`t3`/`t4` keep their stages and
  take `channelRoles: ["persistent"]`. Add `after` references (`t2.after = "t1-*"`, `t3.after = "t2"`,
  `t4.after = "t1-*"`) so the plan's progression is the reference the schema wants rather than array
  order.
- All four suppressions, `distinctFrom ACT-13`, and every exit's `reEntry`: **unchanged**.

**Display-only changes needed**

- Six shared-terminal instances is the highest in this domain and it is correct — `x.normal` beside
  each branch that reaches it beats one card with four connectors crossing the canvas. Keep.
- `x.defer` should say on the card *which* owner it deferred to; it currently states only that it
  deferred. Its `state` string already carries "the person already handling it"; the branch label on
  `c.duplicate` is where ACT-13 should be named.
- Message card titles should come from `Touch.stage` (`offer`, `confirm`, `followup`, `final`), which
  `touchStages()` already supplies — so the four cards read as four different things at a glance.

**Renderer changes needed.** None beyond the `ChannelPriorityRow` fix recorded on ACT-12 (which, once
the plans above are single-role, stops applying to this journey at all — the cards fall through to a
single channel pill, which is what the brief asks for).

---

## ACT-17 · Adoption Nurture

**Purpose.** Carry an account from having produced value once to producing it repeatedly, measured
against its own use-case.

**Current flow**

```
t.activated (core_activation_completed)
 → a.recognize  [In-app + Email]  (acknowledge what was produced)
 → c.next  Does a natural next action follow from what they just did?
     ├─ yes → a.surface  [In-app + Email]  (the one action that follows)  → a.measure
     └─ no  → a.measure
 a.measure (read adoption from value-producing usage) → c.stable  Has adoption become stable?
     ├─ stable   → h.normal (external customer-lifecycle)
     └─ not yet  → a.next-behavior  [In-app + Email]  → w.observe
 w.observe (until value_produced; timeout adoption.observation_window)
     ├─ on event   → a.measure          ← loop back
     └─ on timeout → h.stall (ACT-18)
```

10 canonical, 10 drawn. **Customer touches today: 5** against a declared cap of **4**, and the
orchestration map claims ≤3. This is **DECISIONS-PENDING B1**, and it is the worst touch-count row
in the corpus.

**Problems found**

1. **The loop nudges on success.** `w.observe` fires `on value_produced` → `a.measure` → `c.stable` →
   if not yet stable → **another nudge**. An account that produces value steadily but has not yet hit
   the rhythm the use-case implies gets a behaviour nudge *every time it succeeds*. That is the
   opposite of the guardrail `message_after_success` this journey declares in `measurement.guardrails`.
2. **Nothing in the graph bounds the loop.** Only `adoption.touches` does, and its default is
   `confidence: low`, `basis: example-only`. Graph says 5, cap says 4, map says 3 — three numbers,
   no agreement (B1).
3. **Recognition and the next action are two sends about one event.** `a.recognize` and `a.surface`
   are back-to-back with no wait between them: the person produced something, and we message them
   twice about it. `c.next`'s two branches differ only in whether the second message exists.
4. **Three touches, one channel plan** (domain finding) — and here the plan is genuinely wrong twice
   over, because the right channel is decided by the moment and needs no condition (below).

**Final orchestration — sequential, two touches, a different single channel on each**

Sequential because the second touch genuinely follows the first *and* is separated from it by a real
observation window. Two, not five. Single channel on each touch and **no route condition**, because
each moment already determines the channel:

- **Touch 1** fires on `core_activation_completed` — an event that by definition just happened *in
  the product*. The person is there. **In-app**, on the thing they just made.
- **Touch 2** fires after an observation window during which value did **not** repeat. By
  construction they are not in a working session. **Email**, which survives until their next one.

That is two channels chosen by two different business moments, and it is why this journey needs no
`c.where` while ACT-12 does.

**Final customer channels.** In-app (recognition + next action) · Email (one behaviour nudge).

**Customer touch count: 2.** The reduction is structural, not a counter: after the redesign there is
**no path through the graph with three customer-facing sends**.

**Final flow**

```
t.activated (Core activation completed)
 → a.recognize  [In-app · name the specific thing that was produced, in its own terms,
                 and — only where one genuinely follows — the one action that follows from it]
 → w.observe  until value_produced
              timeout adoption.observation_window (required; the use-case's own rhythm)
     ├─ on event   → c.stable  Is value being produced repeatedly at this use-case's rhythm?
     │      ├─ Yes → h.normal (external · customer lifecycle)
     │      └─ Produced, not yet repeating → a.next-behavior
     │              [Email · the one behaviour that would produce more value in THIS use-case]
     │           → w.confirm  until value_produced
     │                        timeout adoption.observation_window
     │              ├─ on event   → c.stable-after-nudge  Is it repeating now?
     │              │        ├─ Yes → h.normal
     │              │        └─ Still not → h.stall (ACT-18)
     │              └─ on timeout → h.stall (ACT-18)
     └─ on timeout → h.stall (ACT-18)
```

`a.measure` is folded into the two `c.stable*` conditions — "read adoption from value-producing
usage, not activity" is the *basis* of the question, and belongs in the condition's `observes`, not
in a card of its own. The two stable conditions are separate nodes rather than one with a back edge:
**that is what bounds the nudge at exactly one, with no counter.**

**State re-checks.** `c.stable` before the nudge and `c.stable-after-nudge` after it — both read
value-producing usage, and `guardrails[3]` ("vanity activity does not inflate the adoption state...
excluded by construction, not filtered out afterwards") is what they read. There is no path on which
a nudge is sent without the adoption state having been re-read immediately before it.

**Stop conditions.** Value repeating at the use-case's rhythm (`h.normal` — the lifecycle owner takes
the account, `s.stable`); the observation window closing without repeated value (`h.stall` → ACT-18,
`s.stall` — *a nurture nudge is never sent into a stall*); nothing real to recognise
(`s.nothing-real`); an open complaint, live risk case or declared cancellation intent (`s.contest`);
marketing suppression (`s.sunset`).

**Ownership / handoff.** ACT-17 begins where ACT-12 ends (`core_activation_completed`) and its
`distinctFrom ACT-12` is exactly right: *"Onboarding gets someone to value once. This is about the
second, fifth and twentieth time, where the obstacle is habit rather than setup."* It hands its own
failure case to ACT-18 and is ACT-18's own recovery destination (`ACT-18.h.adoption → ACT-17`) — a
closed two-journey loop with a cooldown on the ACT-18 side. **Not reopened.**

**Canonical changes needed**

- Merge `a.surface` into `a.recognize` and delete `c.next`. `a.recognize.does` becomes: acknowledge
  the specific thing produced in its own terms, and where a next action genuinely follows from it —
  sharing it, repeating it, extending it — name that one action in the same message; where nothing
  genuinely follows, recognise and say nothing more. **`s.nothing-real` becomes the rule inside one
  message instead of a branch between two.**
- Delete `a.measure`; move its sentence into `c.stable.observes` and `c.stable-after-nudge.observes`.
- Add `w.confirm` (same `Config` key `adoption.observation_window`, `windowExtendsOnEngagement:
  false`) and `c.stable-after-nudge`; repoint `a.next-behavior.next` to `w.confirm`.
- Remove the back edge `w.observe.onEvent → a.measure`; `w.observe.onEvent → c.stable`.
- `contact.localCap.adoption.touches`: **4 → 2**; `confidence: low → medium`,
  `basis: example-only → corpus-rule`, `applicableWhen`: "one recognition and one behaviour nudge
  across the early-adoption window — the graph's own touch count". This is DECISIONS-PENDING **B1
  option (b)**, applied, and it also closes the map's ≤3 claim: the true answer is 2.
- `a.recognize.channelRoles`: `["in-session", "persistent"]` → `["in-session"]`.
  `a.next-behavior.channelRoles`: → `["persistent"]`. `channelStrategy.fallback` → `"none"`.
- `orchestration.touches`: `t0` keeps `stage: "recognition"` and absorbs `t1`'s purpose; delete `t1`;
  `t2` keeps `stage: "behaviour-nudge"`, `prerequisites: ["c.stable"]`, `after: "t0"`.
- `orchestration.strategy`: `"single-notice"` → `"progressive-recovery"` is **wrong** here; the
  honest value is whichever enum member means "a notice and one bounded follow-up". If none fits,
  leave `"single-notice"` and record it — do not invent a strategy name to describe two touches.
- `measurement.guardrails` keeps `message_after_success`; it now has a graph that cannot violate it.
- All six suppressions, all three guardrails, `distinctFrom ACT-12`: **unchanged**.

**Display-only changes needed**

- `c.stable` and `c.stable-after-nudge` ask the same question at two stages — this is exactly
  Family F's `P-RECHECK-01`. They must render in **one recognisable form** so a reader sees "the same
  question, asked again" rather than two unrelated decisions. That is the open design item in
  `audit/patterns.md`, and this journey is the cleanest place to land it.
- `h.stall` is reached from three branches; per-parent instancing already handles that. `h.normal`
  from two. Both stay drawn.
- ACT-17 has **no exit nodes at all** — every ending is a handoff. Same reader problem as C2
  (FUL-146/FUL-148). The detail page should state "ends by handing off to Adoption Recovery /
  the lifecycle owner" rather than showing a journey with no visible stop.

**Renderer changes needed.** None specific; the `ChannelPriorityRow` fix stops applying once both
touches are single-role.

---

## ACT-18 · Adoption Recovery

**Purpose.** Work out why value stopped recurring before doing anything about it — including the case
where nothing is wrong.

**Current flow**

```
t.stall (expected_adoption_pattern_not_met)
 → a.diagnose (absorbed on the canvas)
 → c.type  What does the evidence show?
     ├─ recoverable blocker → a.recover  [Email + Push, one card, "Primary / Fallback"]
     ├─ needs a person      → h.assistance (external human-in-the-loop)
     ├─ need genuinely met  → x.satisfied
     └─ no evidence         → x.no-intervention
 a.recover → w.recover (until value_produced; timeout adoption_recovery.window)
     ├─ on event   → h.adoption (ACT-17)
     └─ on timeout → h.monitor (external health monitoring)
```

10 canonical, 9 drawn (`a.diagnose` absorbed). Touches: **1**, cap 1, `confidence: medium`.
**This is the best-designed journey in the domain and the least changed by this audit.**

**Problems found**

1. **`a.diagnose` is absorbed and it is the whole journey.** It has in-degree 1, out-degree 1, no
   `execution` and **no `writes` at all** — so `absorbableBookkeeping` hides it. But the journey's
   stated purpose is *"work out why value stopped recurring before doing anything about it"*, and
   `a.diagnose` is that act. What a reader sees is a trigger that goes straight to a four-way
   decision, with the diagnosis nowhere. This is Family A working exactly as specified and producing
   the wrong answer on one journey.
2. **Email + Push declared as one plan, rendered Primary/Fallback** — when the corpus has already
   authored the *condition* that separates them (`low-friction`: "a valid token exists **and the
   blocker is a single step the person can take from the notification**"). The signal exists; the
   route is not drawn.
3. `x.satisfied` and `x.no-intervention` are the two best exits in the domain and nothing on the card
   distinguishes "they finished" from "we found nothing". Display only.

**Final orchestration — conditional routing by diagnosis, one message or none**

Not single, not fallback. The diagnosis decides both *whether* anything is sent (two of `c.type`'s
four branches send nothing, one hands to a person) and *which channel* carries it. Push and email are
not two attempts at the same message here — they carry different messages: push is the one-step
blocker the person can clear from the notification, email is the blocker that has to be explained.

**Final customer channels.** Push (a one-step blocker, where a live app route exists) · Email
(everything else). Exactly one of them is sent, and often neither.

**Customer touch count: 1, or 0.** Cap stays 1. This is the one journey in the domain whose most
common correct outcome is silence, and that must not be designed away.

**Final flow**

```
t.stall (Expected adoption pattern not met)
 → a.diagnose  [Internal · what does the evidence actually show — unfinished setup, a missing
                integration, no clear next use-case, collaborators who never joined, a technical
                blocker, or a use-case that is finished and needs nothing further]
 → c.type  What does the evidence show?
     ├─ Something specific is in the way → c.one-step
     │        Is the diagnosed blocker a single step, with a live app route to it?
     │        ├─ Yes → a.recover-push  [Push · that one step]
     │        └─ No  → a.recover-email [Email · the blocker named and explained]
     ├─ A technical problem a message will not solve → h.assistance (external · human-in-the-loop)
     ├─ The use-case was completed — the account got what it came for → x.satisfied
     └─ Usage looks light against a generic expectation, nothing indicates a problem
              → x.no-intervention
 a.recover-push / a.recover-email → w.recover  until value_produced
              timeout adoption_recovery.window (required; the product's own rhythm)
     ├─ on event   → h.adoption (ACT-17)
     └─ on timeout → h.monitor (external · health monitoring)
```

**State re-checks.** There is only one touch, so there is no second-touch re-read to do — and that is
the design. The re-check that matters here is `a.diagnose` **before** the touch, and `c.type`'s two
silent branches are the re-check's teeth: `s.no-evidence` ("encouragement into silence is the failure
this journey exists to avoid") and `s.need-met`.

**Stop conditions.** `value_produced` (→ ACT-17); the recovery window closing (→ health monitoring,
with `adoption-frequency messaging for this use-case` suppressed on the way out); the need turning
out to be met; no evidence of a problem; a blocker needing a person (`s.human` — *no automated touch
alongside a human intervention*); any open issue under human ownership, live risk case or declared
cancellation intent (`s.contest` — ACT-18 is **lowest** in `retention-outreach`).

**Ownership / handoff.** ACT-18 is ACT-17's stall destination and ACT-17 is ACT-18's recovery
destination; the `adoption_recovery.cooldown` (30–90 days) is what stops that pair oscillating. Its
`distinctFrom ACT-14` is precise and stays: *"ACT-14 is pre-activation and triggered by help-seeking.
This is post-activation and triggered by silence, where the most common correct answer is that
nothing is wrong."* **Not reopened.**

**Canonical changes needed**

- Add `c.one-step` — `asks: "Is the diagnosed blocker a single step, with a live app route to it?"`,
  `observes: "diagnosed_blocker and whether a valid app route exists"` (both already exist:
  `diagnosed_blocker` is a required field on two of this journey's handoff contracts, and the app-route
  condition is `channelStrategy.roles[low-friction].when` verbatim).
- Split `a.recover` into `a.recover-push` (`channelRoles: ["low-friction"]`) and `a.recover-email`
  (`channelRoles: ["persistent"]`), both `execution: "communication"`, both → `w.recover`.
- `orchestration.touches`: `t1` becomes `t1-push` / `t1-email`, same `stage: "recovery"`,
  `prerequisites: ["c.type", "c.one-step"]`.
- `channelStrategy.fallback`: `"same-role-other-channel"` → `"none"`.
- `contact.localCap.adoption_recovery.touches`: **unchanged at 1**. Its `rule` — *"one recovery touch
  per diagnosed blocker; a second touch on the same diagnosis is pressure, not help"* — is the best
  cap sentence in the domain and should be the model for the others.
- Give `a.diagnose` a `writes: [{ field: "diagnosed_blocker", mode: "set" }]`. It already produces
  that value — every downstream handoff contract requires it — and recording it is both honest and
  what keeps the node drawn (see below).
- Everything else — six suppressions, three guardrails, four exits' classes, three handoff contracts:
  **unchanged.**

**Display-only changes needed**

- Once `a.diagnose` declares `writes: diagnosed_blocker`, `absorbableBookkeeping` stops absorbing it
  (`diagnosed_blocker` is not a journal name) and the diagnosis is drawn. **This is the right fix:
  the rule reads authored data, and the data was simply incomplete.** Do not special-case the node.
- `x.satisfied` (`class: invalid-state`) and `x.no-intervention` (`class: no-action`) must read
  differently on the canvas — "they finished" is a success-shaped ending wearing an `invalid-state`
  class, and a reader should not have to open the card to tell it from "we found nothing".
  Consider whether `x.satisfied.class` should be `success`; that is a canonical question, flagged
  not decided.
- `c.type`'s four branch labels are the clearest in the domain and should be kept short —
  "Recoverable blocker" / "Needs a person" / "Need genuinely met" / "No evidence of a problem" — as
  the orchestration map already renders them.

**Renderer changes needed.** None beyond the shared `ChannelPriorityRow` fix.

---

## ACT-19 · Onboarding Personalization

**Purpose.** Get the one piece of context onboarding needs to choose a path — only when not having it
would actually change that path.

**Current flow**

```
t.needed (onboarding_needs_named_role_or_use_case)
 → c.declared  Does a reliable declared value already exist?
     ├─ yes → a.reuse (absorbed) → a.adapt → h.progress (ACT-12)
     └─ no  → c.material  Would the answer materially change the path to value?
            ├─ yes → a.ask  [Email + In-app, one card, "Primary / Fallback"]
            └─ no  → x.dont-ask
 a.ask → w.answer (until question_answered; timeout role_use.answer — a short response window)
     ├─ on event   → a.persist (declared_context) → a.adapt → h.progress
     └─ on timeout → a.default (absorbed) → h.progress
```

11 canonical, 10 drawn (EN) / **9 drawn (TR)**. Touches: **1**, cap 1, `confidence: high`. Cooldown
`"none"` — one question per onboarding instance, never re-asked.

**Problems found**

1. **The one weakness is the channel, and it is the domain's core question in miniature.** This is
   *a question asked in the middle of someone's setup* (its own `role_use.answer` rule says so:
   "a short window — this is a question in the middle of someone's setup, not a survey"). Whether it
   arrives inline in the product or in an email is not a delivery detail — it changes what the
   question *is*. Declared as two roles on one card, rendered Primary/Fallback.
2. **`a.persist` is drawn on EN and absorbed on TR** — the same bug traced under ACT-13, here hiding
   the node that enforces this journey's single most important guardrail (`s.g1`: behavioural
   inference is never written into the declared field). On the Turkish route, the guardrail's
   executable form is invisible.
3. **`a.default` is absorbed** and it carries a real rule — *"The default is not written into the
   declared field as though someone had chosen it"* — which is `s.g1` again, on the timeout arm. It
   writes nothing, so Family A takes it; the detail panel lists it under *Represented canonical
   steps*, which is the correct mitigation, but this is the second node in one journey where the
   guardrail lives in an absorbed card.

Otherwise this journey is close to exemplary: one touch, a genuine "do not ask" exit, a short
window, and a documented default rather than an indefinite hold.

**Final orchestration — single, with conditional routing**

Single: there is exactly one question, it is never repeated, and an unanswered question must not hold
up the path to value. Conditional routing on the one touch, because in-session and off-session change
what gets asked and where the answer lands, and both are already authored.

**Final customer channels.** In-app (in session — inline, answerable in one step, in the setup flow
the question is about) · Email (otherwise — the same one question, answerable from the message).

**Customer touch count: 1.**

**Final flow**

```
t.needed (Onboarding needs a named role or use-case)
 → c.declared  Does a reliable declared value already exist?
     ├─ Stated before, still current → a.reuse (record that it was reused rather than re-asked)
     │        → a.adapt → h.progress (ACT-12)
     └─ Nothing declared — only behaviour, which is not the same thing → c.material
 c.material  Would the answer materially change the path to value?
     ├─ Different answers lead to genuinely different setup, examples or first actions → c.where
     └─ The path is the same whatever they answer → x.dont-ask
 c.where  Is the person in the product right now?
     ├─ In session     → a.ask-inapp  [In-app · one question, inline in the setup flow]
     └─ Not in session → a.ask-email  [Email · the same one question, answerable from the message]
 → w.answer  until question_answered
             timeout role_use.answer (required; a short response window)
     ├─ on event   → a.persist  (the declared value with its source and time, in a field that only
     │                           ever holds declared answers) → a.adapt → h.progress (ACT-12)
     └─ on timeout → a.default  (continue on a documented default path; record that no declared
                                 value exists — the default is never written into the declared
                                 field) → h.progress (ACT-12)
```

**State re-checks.** `c.declared` is the re-check that prevents the commonest failure — asking again
for something already given. `c.material` is a re-check of *our own* need, not the customer's state,
and it is the reason this journey sends nothing most of the time. There is no second touch, so no
further re-read is owed.

**Stop conditions.** `question_answered`; the short response window expiring (→ documented default,
never a second ask); a reliable declared value already existing; the answer not changing the path.
Cooldown `"none"` is correct and must not be "fixed": there is nothing to cool down because nothing
is ever re-asked.

**Ownership / handoff.** ACT-19 **chooses** the onboarding route; ACT-12 walks it. While the question
is outstanding ACT-19 owns the onboarding conversation on the same channels, and ACT-12 holds its
generic prompts (`ACT-12.s.personalizing` + the matching eligibility clause). Every path ends in
`h.progress → ACT-12`, carrying the declared value with its source **or the explicit fact that there
is none**, plus which adaptations were applied so they are not applied twice. This is
DECISIONS-PENDING **A7, already resolved in the data**; this audit changes none of it.

**Canonical changes needed**

- Split `a.ask` into `a.ask-inapp` (`channelRoles: ["in-session"]`) and `a.ask-email`
  (`channelRoles: ["persistent"]`); add `c.where` between `c.material` and them.
- `orchestration.touches`: `t1` becomes `t1-inapp` / `t1-email`, same `stage: "ask"`,
  `prerequisites: ["c.declared", "c.material", "c.where"]`.
- `channelStrategy.fallback`: `"same-role-other-channel"` → `"none"`.
- `contact.localCap.role_use.touches`: **unchanged at 1** — it is already a true customer-touch cap.
- All three guardrails, `s.sunset`, `distinctFrom ACT-12`, the cooldown, `a.reuse` / `a.persist` /
  `a.default` / `a.adapt`: **unchanged**.

**Display-only changes needed**

- `a.persist` must be drawn on **both** routes (renderer fix below). It is where `s.g1` is enforced.
- `a.default` stays absorbed into `h.progress`, which is acceptable **only** because the detail panel
  lists it under *Represented canonical steps*. Verify that it does on the TR route too.
- `x.dont-ask` is one of the most valuable cards in the corpus — a journey that decides not to speak.
  It should not be rendered as a faint terminal at the bottom of the canvas (`P-LADDER-01`).

**Renderer changes needed.** The TR absorption bug — see ACT-13. ACT-19 is the second of the two
occurrences in this domain and the more damaging of the two.

---

## ACT-20 · Dormant Lead Reactivation

**Purpose.** Make one bounded attempt to restart a relationship that never became a paying one, and
judge the result on what the person actually did.

**Current flow**

```
t.dormant (engaged_non_customer_became_dormant)
 → c.never-monetized  Has this relationship ever been monetised in this context?
     ├─ never paid → a.reason (absorbed) → c.worth-it
     └─ was a paying customer → x.winback
 c.worth-it  Is there a credible reason, and is this person still eligible and contactable?
     ├─ worth one attempt → a.attempt  [Email + Push, one card, "Primary / Fallback"]
     └─ not worth it → x.no-reason
 a.attempt → w.return (until meaningful_return; timeout dormant_non.return)
     ├─ on event   → a.inspect (absorbed) → c.state  What state did they actually return into?
     │        ├─ unfinished onboarding → h.onboarding (ACT-12)
     │        ├─ renewed commercial intent → h.intent (ACQ-03)
     │        ├─ no current qualification → h.qualify (ACQ-05)
     │        └─ signal did not survive inspection → x.engagement-only
     └─ on timeout → x.sunset (cooldown in force)
```

15 canonical, 13 drawn. Touches: **1**, cap 1, `confidence: high`. `pressureClass: promotional`,
lowest in `lifecycle-stage` with `onLoss: exit`.

**Problems found**

1. **Push is declared for somebody who has gone quiet.** `low-friction` is defined here as *"a valid
   token or app session exists and the message is a single step from the notification"*. The trigger
   is dormancy: by construction there is no app session, and the attempt is built on *"the recorded
   reason"* — unfinished setup, an interest expressed, something now relevant, a real change in the
   product. That is content that needs explaining, which is email's role in this corpus, not a
   one-step notification. This is the brief's "do not rely on a channel that assumes an active
   audience to recover someone who has stopped".
2. Nothing else. `a.inspect` ("opening the message is not returning") and `x.engagement-only` are the
   corpus's clearest statement that a journey must not report its own message as a result, and
   `c.never-monetized` correctly routes former customers out to win-back rather than competing with
   it.

**Final orchestration — single**

One bounded attempt, one channel, one window, then a cooldown. No condition, no route, no second
touch. The brief explicitly permits `Trigger → … → Email → Exit`, and this journey is the case for
which that permission exists: **a promotional attempt at somebody who has already stopped answering
earns exactly one message and no cleverness.**

**Final customer channels.** Email. Single.

**Customer touch count: 1.**

**Final flow**

```
t.dormant (An engaged non-customer became dormant)
 → c.never-monetized  Has this relationship ever been monetised in this context?
     ├─ No customer or paid relationship exists or has existed → a.reason
     └─ A monetised relationship exists or once existed → x.winback  (belongs to win-back)
 a.reason  [Internal · is there a credible reason to come back — setup never finished, an interest
            expressed, something now relevant, a destination left incomplete, a real product change]
 → c.worth-it  Is there a credible reason, and is this person still eligible and contactable?
     ├─ A specific reason exists and permission and eligibility both hold → a.attempt
     │        [Email · one bounded attempt built on the recorded reason — never a general note
     │         that they have been missed, which says nothing and asks for nothing]
     └─ No specific reason, or permission or eligibility has lapsed → x.no-reason
 → w.return  until meaningful_return
             timeout dormant_non.return (required; the reactivation window)
     ├─ on event   → a.inspect  [Internal · opening the message is not returning; the question is
     │                           whether any real state moved]
     │        → c.state  What state did they actually return into?
     │              ├─ An onboarding instance is open and setup resumed → h.onboarding (ACT-12)
     │              ├─ Intent stronger than the record holds → h.intent (ACQ-03)
     │              ├─ Back, with nothing on record about qualification → h.qualify (ACQ-05)
     │              └─ Engagement with the message and nothing more → x.engagement-only
     └─ on timeout → x.sunset  (reactivation window closed; cooldown in force)
```

**State re-checks.** `c.worth-it` reads reason, eligibility and contactability together before the
one send. `a.inspect` + `c.state` re-read *what actually moved* before anything is declared — this is
the journey's whole claim to honesty and it must stay.

**Stop conditions.** `meaningful_return` (→ whichever journey owns the state they returned into); the
reactivation window closing (`x.sunset`, cooldown required — `required: true`, the only required
cooldown in this domain); no credible reason; permission or eligibility lapsed; a former paying
relationship (`x.winback`); any current lifecycle on the same person (lowest in `lifecycle-stage`,
`onLoss: exit` — it leaves rather than queues); marketing suppression (`s.sunset`).

**Ownership / handoff.** ACT-20 owns nothing for long: three of its four return states hand straight
out (ACT-12, ACQ-03, ACQ-05), each carrying the dormancy so the receiver does not read the return as
first-time interest. Former paying customers are out of scope by construction — win-back is a
different journey with different economics (`s.g2`, `x.winback`, `distinctFrom ACQ-07`). **Not
reopened.**

**Canonical changes needed**

- `a.attempt.channelRoles`: `["persistent", "low-friction"]` → `["persistent"]`.
- `channelStrategy.roles`: drop the `low-friction` row; `fallback` → `"none"`.
- `channels`: `["email", "push"]` → `["email"]`.
- `orchestration.touches[t1].channelRoles`: → `["persistent"]`.
- Everything else — cap, cooldown, four suppressions, three guardrails, five terminals, three handoff
  contracts: **unchanged**.

**Display-only changes needed**

- `a.reason` and `a.inspect` are both absorbed (no `writes`, degree 1). `a.inspect` in particular
  carries the sentence that distinguishes a return from an open, and it is folded into `c.state`.
  That is defensible — the condition it feeds asks the same question — but the caption and the
  detail panel must make it visible. Verify *Represented canonical steps* lists both on both routes
  (they are currently absorbed on EN **and** TR, so they are not affected by the TR bug).
- Five exits/handoff terminals on a 13-node canvas: check for `P-LADDER-01` stacking.
- With a single channel, the card falls through to one channel pill and `ChannelPriorityRow` no
  longer renders — which is the correct end state for this journey.

**Renderer changes needed.** None.

---

## Summary

| ID | Before pattern | After pattern | Channels | Touches | Biggest change |
|---|---|---|---|---:|---|
| **ACT-12** Onboarding Nurture | Sequential loop, unbounded in-graph (B+G) | **Sequential (state-driven repeat, capped 3) + conditional routing** | In-app (in session) · Email | 5 → **3** | Budget 5 → 3 **and made visible** as `c.budget`; `a.read` folded into the decision it feeds |
| **ACT-13** Onboarding Blocker Reminder | Single + internal task (A) | **Segment-based + parallel on the dependency arm** | Email | 1 (cap 2 → **1**) | The blocked account is no longer left silent when somebody else holds the requirement |
| **ACT-14** Onboarding Help | Sequential, 4 identical 3-channel plans (A+B+G) | **Event-or-timeout + conditional routing on the offer only** | In-app (offer, in session) · Email | 3 max (cap 4 → **3**) | Push removed — it never met its own stated condition; four stages get four channel decisions |
| **ACT-17** Adoption Nurture | Sequential loop nudging on every success (A+B+G) | **Sequential, 2 touches, one channel each** | In-app (recognition) · Email (nudge) | 5 → **2** | Loop replaced by a structural bound: no path has a third send |
| **ACT-18** Adoption Recovery | Single, Email/Push as one plan (A+G) | **Conditional routing by diagnosis — one message or none** | Push (one-step blocker) · Email | 1, often **0** | Diagnosis drawn instead of absorbed, by giving it the `writes` it already produces |
| **ACT-19** Onboarding Personalization | Single, 2 roles on one card (A+G) | **Single, with conditional routing** | In-app (in session) · Email | **1** | The one question is routed to where it can be answered in one step |
| **ACT-20** Dormant Lead Reactivation | Single, Email/Push as one plan (A+G) | **Single** | Email | **1** | Push dropped: dormancy is the trigger, so an active-app channel cannot be assumed |

**Seven journeys, six distinct shapes.** Reading the spines side by side:

```
ACT-12  Trigger → Decision → Route → Message → Wait ⟲ (budget) → Handoff / Handoff / Exit
ACT-13  Trigger → Internal → Decision → Segment ⇒ { Message | Message ∥ Work item } → Wait → …
ACT-14  Trigger → Gate → Gate → Route → Message → Wait ⇒ 4 answers ⇒ { Message → Wait → … | Message | Exit }
ACT-17  Trigger → Message → Wait → Decision → Message → Wait → Decision → Handoff
ACT-18  Trigger → Internal → Decision(4) ⇒ { Route ⇒ Message | Handoff | Exit | Exit } → Wait → …
ACT-19  Trigger → Decision → Decision → Route → Message → Wait ⇒ { persist | default } → Handoff
ACT-20  Trigger → Decision → Internal → Decision → Message → Wait → Decision(4) ⇒ 3 Handoffs + Exit
```

None of them is `Condition → In-app → Wait → Email`. The two that are both "single"
(ACT-19, ACT-20) differ in everything but that word: one routes its single touch and ends in a
handoff that continues the same conversation, the other sends one unrouted message and ends in four
different judgements about what actually happened.

**Channel totals across the domain:** In-app 4 journeys · Email 7 · Push 1 · SMS 0 · WhatsApp 0.
SMS and WhatsApp appear nowhere, and that is the right answer for a domain about people inside a
product: no journey here has a deadline of ours to name or a payment to chase.

**Touch totals:** 1 · 1 · 3 · 2 · 1 · 1 · 1 — maximum 3 on any path in any journey, against a
starting state of two journeys at 5.

**Cross-domain items raised, for whoever consolidates:**

1. `ChannelPriorityRow` labels channel rows Primary/Fallback by position, discarding the authored
   role. Affects every multi-role message card in the corpus, not just these seven.
2. `absorbableBookkeeping` runs after TR localization and therefore absorbs **every** degree-1
   internal action on the Turkish route regardless of what it writes. Five journeys diverge today
   (ACT-13, ACT-19, RET-24, RET-26, FBK-43); the two in this domain hide guardrail enforcement.
   A "EN and TR drawn node sets are identical" assertion in `audit/measure-display.mjs` would have
   caught it.
3. Three caps in this domain counted nodes rather than customer touches on a path (ACT-13, ACT-14,
   and ACT-17's disagreement between graph, cap and map). DECISIONS-PENDING B1/B2/B5 are applied
   here; B4 (ACQ-285) is the same error in another domain.

---

## The three calls I am least sure about

**1. ACT-13's self-resolvable arm as Email only.** I dropped In-app from a journey whose subject is
a requirement the account can clear *itself* — often from inside the product, at the exact screen
where it is blocked. The argument for Email alone is that the requirement frequently cannot be
cleared in the session it is discovered in (a verification, an administrator, a credential, a
colleague who has not joined), the journey is `service` priority so the message is a notice of
record, and a banner does not survive the walk to whoever holds the thing. The argument against is
that I applied the in-session/off-session route to three other journeys and refused it here, and a
reader could reasonably call that inconsistent. **The alternative**, if this is overturned: give
ACT-13 the same `c.where` split as ACT-12, with In-app carrying "the one action, here" and Email
carrying the same requirement with what it unblocks. Nothing else in the section changes.

**2. Collapsing ACT-17's recognition and next action into one message.** This is what takes ACT-17
from 5 touches to 2, and it is a judgement about message content, not structure: I claim that
"here is what you made" and "here is the one thing that follows from it" are one message about one
event, and that sending them separately with no wait between them is the corpus talking twice about
a single moment. The counter-argument is that recognition and a suggestion have different
intentions, and merging them risks turning an acknowledgement into a pitch — which is precisely what
`s.nothing-real` exists to prevent. I have moved that guardrail *inside* the message ("where nothing
genuinely follows, recognise and say nothing more"), but a guardrail inside a message is weaker than
a branch between two nodes. **The alternative:** keep `c.next` and `a.surface` and land ACT-17 at
3 touches instead of 2 — still within the brief, still a large improvement on 5, and it preserves
the branch.

**3. Keeping Push in ACT-18 while removing it from ACT-20.** Both journeys are about somebody who
has gone quiet, and I answered "is a quiet person reachable by push?" differently in the two
sections. My reason is that ACT-18's subject is a **post-activation account that has used the
product and stopped**, where the app plausibly exists and a one-step blocker is genuinely one tap
from a notification — and that the corpus has already authored the condition that tests exactly
this. ACT-20's subject is a **non-customer who never paid and went dormant**, where the attempt
carries an explanation and the channel would be assumed rather than known. That distinction is real
but it is finer than I would like, and it rests on a `c.one-step` condition that has never been
evaluated against data. **The alternative:** make ACT-18 single Email as well, accept that Push
disappears from the domain entirely, and record that the corpus has no evidence for a one-step
blocker route. That is the more conservative reading of the brief's "do not invent" rule, and it
costs ACT-18 nothing structurally — the `c.type` four-way diagnosis is what makes that journey
distinctive, not its channel.
