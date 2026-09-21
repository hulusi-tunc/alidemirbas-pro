# Phase 1 audit — Retention & Contactability (13 public journeys)

Scope: `RET-24` `RET-26` `RET-28` `RET-30` `RET-31` `RET-32` `RET-290` `RET-292`
`RET-293` `RET-294` `RET-295` `CON-272` `CON-300`.

Source: `audit/public-journeys-current-state.json` (canonical + rendered state), read per
journey. Cross-checks against `scripts/validate-public-scope.mjs`,
`scripts/sunset-suppression-evidence.mjs`, `audit/public-scope-validation.md`,
`src/canonical/events.ts`, `src/lib/journey-canvas-layout.ts` and
`src/lib/journey-tr-overrides.ts`.

---

## Domain-level findings, before the per-journey sections

### F1 — the "persistent / low-friction / in-session" role block is boilerplate, not design

Eight of the thirteen journeys (RET-26, RET-31, RET-32, RET-290, RET-292, RET-293, RET-294,
RET-295) carry a `channelStrategy.roles` block that is *verbatim identical in structure* and
near-identical in wording:

```
persistent    → email    "…should be kept / survive until the person can act — the default"
low-friction  → push     "a current device registration exists and the permission covering it still stands"
in-session    → in-app   "the person is already in a session where …"
```

Every one of those blocks is labelled `RECOMMENDED_DEFAULT`, and every message action in those
eight journeys therefore renders a two- or three-channel plan. That is the corpus-wide default
shape the brief rejects. **None of the eight journeys records a device-registration state, a
session state, or any condition that reads either** — the `when` clauses describe signals the
graphs never consult. Under the brief's rule ("do not invent eligibility signals; if the
evidence for a split is not in the current data, prefer the simpler pattern and say so") those
roles collapse to their own stated default, which is `email`.

Consequence: **push disappears from this domain entirely** (removed from RET-26, RET-31,
RET-32, RET-290, RET-292, RET-293, RET-294, RET-295). This is the single largest change in the
audit and I have listed it among the calls I am least sure about. The condition under which it
should be revisited is named per journey and is always the same: a recorded device-registration
/ push-token state that a condition can actually branch on.

The three journeys that keep a non-email channel keep it because a **drawn decision** selects
it: RET-24 (evidence class), RET-28 (declaration surface), CON-272 (which route survives).

### F2 — the send gate is drawn inconsistently across the domain

`c.sendable` / `c.sendable2` are implementation gates ("May the touch go out?") and are
correctly absorbed in RET-290, RET-293, RET-294, RET-31, RET-32 and CON-300's first gate. They
are **still drawn** in RET-295 (`c.sendable`) and CON-300 (`c.sendable2`).

- RET-295's is a true implementation gate whose short arm goes to `a.record-no-action` — it
  should collapse and does not. Reason it escapes the Family C rule: its short arm is a
  *shared* hop (`a.record-no-action` is also the target of `c.date`'s third branch), and the
  rule requires every parent of a shared hop to have collapsed first. Fix is data-side: give
  `c.date`'s "Cycle already spent" arm its own recording hop, or fold the send gate into
  `c.date` exactly as **RET-292 already does** (RET-292 has no separate send gate at all, and
  is the cleaner of the two).
- CON-300's `c.sendable2` **should stay drawn**. Its short arm is not a bookkeeping hop — it
  goes to `a.suppress`, i.e. "there is nobody left to give notice to, so end contact without
  a notice". That is a business outcome, not a permission check. The current renderer gets
  this right; do not "fix" it.

### F3 — RENDERER BUG: five journeys draw a different graph on the Turkish route

`displayDelta` reports five journeys corpus-wide where a canonical node is drawn on EN and not
on TR: **ACT-13** (`a.identify`), **ACT-19** (`a.persist`), **RET-24** (`a.evidence`),
**RET-26** (`a.assess`), **FBK-43** (`a.persist-positive`). Two of the five are in this domain
and both are the node that carries the journey's whole justification (RET-24's evidence
assembly, RET-26's failure assessment).

Root cause, confirmed in source. `absorbableBookkeeping()`
(`src/lib/journey-canvas-layout.ts:431`) decides whether an internal action only writes a
journal row by reading the **localized** meta string:

```ts
const writes = n.meta.filter((m) => m.startsWith("writes "));
const journalOnly = writes.every((m) => { … });   // [].every(…) === true
```

On the Turkish route `localizeMeta()` (`src/lib/journey-tr-overrides.ts:134`) has already
rewritten `writes risk_evidence (append)` into `risk_evidence alanına yazar (append)`. The
`startsWith("writes ")` filter therefore returns an empty array, `[].every(…)` is `true`,
`journalOnly` passes, and **every single-in/single-out internal action is absorbed on TR
regardless of what it writes.**

Fix (generic, one place, no journey ids): `absorbableBookkeeping` must read the structural
write fields rather than the rendered meta string — either carry `writes` through on `FlowNode`
as data, or run `localizeStructural()` *after* `buildDisplayGraph()` rather than before. The
display graph must be locale-invariant by construction; `measure-display.mjs` already reports
`displayNodeCountEn` / `displayNodeCountTr` and should be made to **fail** on any divergence,
not just report it.

This is outside my scope to implement and affects four domains. Flagged here because two of
its five victims are mine.

### F4 — the sunset-suppression partition constrains every channel change in this domain

`scripts/sunset-suppression-evidence.mjs` fails in **both** directions: a journey with a
communication action whose `contact.defaultPriority` is `promotional` or `lifecycle` **must**
carry `s.sunset`; one whose priority is anything else **must not**. Current state of my 13:

| priority | journeys | carries `s.sunset` |
|---|---|---|
| promotional | RET-31, RET-32, RET-293, RET-294 | yes ✓ |
| lifecycle | RET-30, RET-290, RET-292, RET-295 | yes ✓ |
| retention | RET-24, RET-28 | no ✓ |
| service | RET-26, CON-272, CON-300 | no ✓ (CON-300 is the writer) |

**RET-24's new customer-facing action must stay at `priority: "retention"`.** It is a
risk check-in, not marketing; reclassifying it to `lifecycle` would make
`sunset-suppression-evidence.mjs` exit 1 until `s.sunset` were added, and adding `s.sunset`
would be wrong — a relationship-at-risk check-in is not promotional contact. Same reasoning
already holds for RET-28.

### F5 — nothing in the public corpus delivers a retention intervention

`retention_intervention_delivered` appears exactly twice in `src/`: as RET-30's own trigger
(`src/canonical/retention.ts:2698`) and as its registry row (`src/canonical/events.ts:431`).
**No journey emits it.** RET-24's `h.intervention` hands off to RET-30 on the grounds that "a
proportionate automated retention intervention [is] being delivered" — but the delivery is
nobody's. This is the evidence for RET-24's new customer stage, and it is discussed in full
below.

---

## RET-24 · Churn Risk Escalation — MANDATORY FIX

**Purpose.** Decide how hard to push back on a relationship at risk, in proportion to how much
independent evidence there actually is.

**Current flow.**

```
Churn risk threshold crossed
  → Has explicit cancellation intent already been expressed?
      ├ Already cancelling ─────────────────► Handoff RET-28 Cancellation Save
      └ No stated intent
  → [Assemble the signals with their sources and strengths]      (writes risk_evidence)
  → Is the risk driven by a known operational problem?
      ├ Known problem ─────────────────────► Handoff RET-23 Health Deterioration Diagnosis
      └ No known problem
  → Does the evidence justify a person?
      ├ Justified → Does a higher-precedence contender already claim this account?
      │                ├ Clear     → [Owner task, execution: human] → Handoff external human lifecycle
      │                └ Contended → Exit  "risk recorded, nothing proportionate to do"
      └ Not justified → Is a proportionate automated recovery available?
                       ├ Available            ► Handoff RET-30 Retention Offer Follow-Up
                       └ Nothing proportionate → Exit
```

13 canonical nodes, 14 display nodes, **0 communication actions**, `channels: ["task"]`.

### Problems found

1. **No customer-facing channel at all.** Breaks the hard rule. It is the corpus's only
   recorded exception (`CHANNEL_RULE_EXCEPTIONS` in `scripts/validate-public-scope.mjs:85`).
2. **The intervention handoff is to a journey that cannot start.** `h.intervention` → RET-30,
   whose trigger is `retention_intervention_delivered`, whose evidence requires "a defined
   intervention *actually delivered*", and whose `insufficientAlone` explicitly rejects "an
   intervention scheduled but not yet delivered". RET-24 decides that an intervention is
   available and then hands off as if it had been sent. **Nothing in the corpus sends it**
   (F5). RET-30 is a follow-up journey waiting on a touch that has no author.
3. **`x.monitor` is doing two unrelated jobs** — "nothing proportionate to do" (a judgement
   about evidence strength) and "a higher-precedence contender owns this account" (a
   contention outcome). Two different re-entry stories are already crammed into one `reEntry`
   sentence.
4. **The escalation decision runs before anything has been attempted.** `c.human` asks whether
   the evidence justifies a person while no cheaper response has been tried, so the journey's
   own rule `s.g4` ("the size of the intervention tracks the strength of the evidence") is
   applied once, at entry, on static evidence, and never re-read.
5. `a.evidence` is drawn on EN and absorbed on TR (F3).

### The customer-facing stage I designed, and the evidence for it

**The stage: one risk check-in, sent to the customer, routed by the class of signal that
raised the risk, before any escalation.**

Evidence it rests on — all of it already in RET-24's own authored data, none invented:

- The trigger's `evidence.requires` enumerates the signal classes: *sustained meaningful usage
  decline · a failed renewal or payment · a negative support experience · repeated unresolved
  blockers · explicit dissatisfaction · exploration of cancellation · a key stakeholder
  leaving · falling account-wide adoption.*
- `a.evidence` already **records** those signals with their sources and strengths and writes
  `risk_evidence` (mode `append`). The routing signal is a field the journey writes itself.
- `s.g4` requires the response to be proportionate to the evidence. The cheapest proportionate
  response to an inferred, uncorroborated-by-the-customer risk is to **ask the customer**, not
  to spend a person's time or to make a save offer.
- `contact.localCap` is `churn_risk.touches`, default **1**, basis `corpus-rule`, described as
  "the budget is the plan's own length". One touch is exactly the budget the journey already
  declares.
- F5: the intervention RET-30 is waiting for does not exist. This journey is the only place it
  can be sent from, because this is the journey that holds the evidence and mints the
  `retention_episode_id`.

**Channel routing (a drawn decision, two branches, both customer-facing):**

| branch | signal classes it reads from `risk_evidence` | channel | why |
|---|---|---|---|
| **Disengagement** | sustained usage decline · falling account-wide adoption · a key stakeholder leaving · a failed renewal or payment | **Email** | the person is, by definition of the signal, not in the product. The brief's own rule: do not rely on in-app to recover someone who has stopped using the product. The check-in has to reach them where they are and carry a route to a person. |
| **In-product friction** | repeated unresolved blockers · a negative support experience · explicit dissatisfaction | **In-app** | the risk was generated by something failing *inside* the product, where the person still is. The check-in belongs beside the thing that is failing; an email about a blocker they are looking at right now is worse than a prompt on it. |

No push and no SMS. Nothing in RET-24 asserts a time bound (SMS's stated precondition) and
nothing records a device registration (push's). The check-in carries **no offer** — offers are
RET-28's and RET-30's — it names what we can see is going wrong and gives a route to a person.

**The internal escalation is not a channel and stays internal.** `a.owner-task` keeps
`execution: "human"` and `channels` keeps `task`. It moves to *after* the check-in window, so
a person's attention is spent on a relationship that did not respond rather than on one that
would have answered an email.

### Can the channel-rule exception be dropped?

**Yes. Delete the `CHANNEL_RULE_EXCEPTIONS` entry for RET-24 in
`scripts/validate-public-scope.mjs` in the same commit as the canonical change, and leave the
map empty rather than removing the mechanism.**

Check 3 has two halves and both are satisfied after this change:

- *declares a customer channel* — `channels` becomes `["email", "in-app", "task"]`; `email` and
  `in-app` are in `CUSTOMER_CHANNELS`. ✓
- *has a communication action* — `a.check-in` carries `execution: "communication"`. ✓

The reason the exception was written no longer holds. `audit/public-scope-validation.md`
argues that "giving it a message of its own would not add a customer touch; it would duplicate
one of those four". That was true of the graph as authored, and **is not true of this
message**, because none of the four owns it:

- **RET-28** owns the moment a cancellation is *declared*. RET-24's check-in only ever runs on
  the `No stated intent` arm — the branch where RET-28 by construction has nothing to say.
- **RET-23** owns a risk with an identified operational cause. The check-in only runs on the
  `No known problem` arm.
- **RET-30** owns the *follow-up to a delivered intervention*. It cannot own the delivery; its
  own evidence rejects an undelivered one (F5). After this change RET-24 delivers and RET-30
  follows up, which is the relationship the handoff's `carries` block already describes.
- **The external human lifecycle** owns a conversation that has not started yet, and now
  starts better informed.

`contact.competition` already arbitrates the residual risk exactly as
`audit/public-scope-validation.md` says it does: `exclusionGroup: "retention-outreach"`,
`scope: "account"`, precedence *below* an open issue under human ownership and *below* a
declared cancellation intent, *above* generic retention intervention, `onLoss: "suppressed"`.
A cancellation intent arriving mid-window preempts the check-in; a live human-owned issue
preempts it; RET-30 (lowest in the group) yields to it. Nothing needed to be added.

Check 5 of the same validator names RET-24 as one of four journeys whose canonical channels
include an operational value — that stays true, because `task` stays. Its comment needs no
edit.

Note also the `EXCEPTIONS` map should remain in the file as an empty `Map` with its comment
intact: the discipline (a list with a reason, printed every run) is worth keeping for the next
journey that tries to claim one.

### Final orchestration

**Conditional routing** (evidence class selects the surface), single touch, event-or-timeout
re-check, then escalation. Not fallback: neither channel substitutes for the other, and
neither is "tried first". The two arms address materially different customers.

### Final customer channels

**Email** (disengagement arm) · **In-app** (in-product friction arm). `task` remains as a
declared operational channel backing `a.owner-task`, and `publicChannels()` keeps it off the
badge row.

### Customer touch count

**1.** (Matches `churn_risk.touches` default of 1.)

### Final flow

```
Trigger: Churn risk threshold crossed
  │
  ├─ Decision: Has a cancellation already been declared?
  │     ├ Already cancelling ──────────────► Handoff: Cancellation Save (RET-28)
  │     └ No stated intent
  │
  ├─ [Assemble the evidence with its sources and strengths]   ← internal, must stay drawn
  │
  ├─ Decision: Does the evidence name an operational cause that already has an owner?
  │     ├ Known problem ──────────────────► Handoff: Health Deterioration Diagnosis (RET-23)
  │     └ No known problem
  │
  ├─ Decision: Is a proportionate check-in available, and is this account uncontended?
  │     ├ Contended, or nothing proportionate ──► Exit: "risk recorded; another owner holds
  │     │                                           this account" / "evidence too thin to act"
  │     └ Proportionate
  │
  ├─ Decision: What kind of risk is this?                    ← routes the channel
  │     ├ Disengagement            → Message: Risk check-in (Email)
  │     └ In-product friction      → Message: Risk check-in (In-app)
  │
  ├─ Wait: until the relationship recovers, a cancellation is declared,
  │        or the check-in window closes
  │
  └─ Decision: Did the relationship state move?
        ├ Recovered ─────────────────────► Exit: "risk cleared without escalation"
        ├ Cancellation declared ─────────► Handoff: Cancellation Save (RET-28)
        ├ Answered / intervention taken ─► Handoff: Retention Offer Follow-Up (RET-30)
        └ No change
              └─ Decision: Does the unanswered evidence now justify a person?
                    ├ Justified     → [Owner task — Human] → Handoff: external human lifecycle
                    └ Not justified → Exit: "risk recorded, monitored"
```

### State re-checks

- Before the check-in: cancellation intent, operational-cause ownership and the
  retention-outreach contest are re-read (three existing decisions, unchanged in kind).
- The wait's `recheck` re-reads the relationship state and the cancellation record from the
  system of record before acting on the timeout.
- **`c.human` now runs on post-check-in evidence**, not on entry evidence. That is the whole
  point of moving it: a person is spent on a relationship that did not answer.

### Stop conditions

`relationship_recovered` (registry id, exists) · `explicit_cancellation_intent` (registry id,
exists — routes to RET-28, not to the escalation) · a higher-precedence retention-outreach
contender claiming the account mid-window (`onLoss: "suppressed"`, already declared) · the
check-in window timing out.

**Both wait events already exist in `src/canonical/events.ts`. No new event, and therefore no
`scripts/event-curation.json` change and no `build-event-registry.mjs` run, is required.**

### Ownership / handoff

Unchanged in structure: RET-28, RET-23, RET-30, external human lifecycle. Two edges move —
RET-28 is now reachable *twice* (at entry and from the post-check-in decision) and RET-30 is
now reached **after** a real delivery rather than instead of one. The `retention_episode_id`
minted at `h.intervention` should now be minted at `a.check-in` (that is where the episode
becomes real) and carried on the handoff unchanged.

### Canonical changes needed

1. `channels: ["task"]` → `["email", "in-app", "task"]`.
2. `contact.channelStrategy.roles`: add two roles with journey-specific `when` clauses —
   `persistent → email` ("the risk is disengagement; the person is not in the product") and
   `in-session → in-app` ("the risk is in-product friction; the check-in belongs beside the
   thing that is failing"). Keep the existing `human → task` role. Set `fallback` to `"none"`;
   these are alternatives, not a cascade.
3. New condition `c.signal-class` — *"What kind of risk is this?"* — two branches, each
   `observes: "risk_evidence"`. Placed after the contention gate.
4. New action `a.check-in`, `execution: "communication"`, on each branch of `c.signal-class`
   (or one node whose channel is branch-resolved — see *Renderer changes*).
   `writes: [{ field: "retention_episode_id", mode: "set" }]`.
   Guardrail text on the node: names what the evidence shows, gives a route to a person,
   carries no offer and no discount.
5. New wait `w.response`: `untilEvent: ["relationship_recovered", "explicit_cancellation_intent"]`,
   `timeout.after` keyed `churn_risk.response_window`, `class: "response-window"`,
   `required: true`, `windowExtendsOnEngagement: false`, `relativeTo: "previous-touch"`,
   with a `recheck` sentence.
6. New condition `c.moved` — *"Did the relationship state move?"* — four branches as drawn.
7. `c.human` and `c.priority-clear` move to after `c.moved`'s "No change" arm.
   `c.priority-clear`'s contention question moves **forward** to before the check-in (you do
   not send to an account somebody else is working); it is the same question asked once, in
   the right place.
8. `orchestration.strategy`: `"single-notice"` → `"conditional-routing"` (or the corpus's
   existing equivalent), and `orchestration.touches` gains a touch `t-checkin` with
   `stage: "risk-check-in"`, `action: "a.check-in"`, `channelRoles: ["persistent","in-session"]`,
   `gatedBy: "w.response"` is **not** set (the wait follows the touch), `mandatory: false`.
   Keep the existing `t1` owner-task touch, renumbered after it.
9. `x.monitor` splits into two exits with honest, separate `reEntry` text:
   `x.contended` (class `suppression` — another owner holds the account) and
   `x.monitored` (class `no-action` — evidence too thin, or the check-in went unanswered and
   a person is not warranted).
10. New exit `x.recovered`, class `success`.
11. `contact.localCap` value stays `1`. `pressureClass` stays `none` — this is service-class
    contact about the customer's own deteriorating state, not promotional pressure.
12. **Do not** add `s.sunset` and **do not** change `defaultPriority` away from `retention`
    (F4).

### Display-only changes needed

- `a.evidence` must keep its card on **both** locales (F3). It writes real state
  (`risk_evidence`) and is the justification the whole journey rests on.
- `c.signal-class` must stay drawn — it materially changes the customer's route, which is
  exactly the brief's exception to hiding gates.
- The contention gate (`c.priority-clear`) is a genuine business decision (it changes who owns
  the account), not an implementation gate, and must stay drawn. It already does.
- Trigger card reads **"Churn Risk Detected"**, not `Trigger churn_risk_threshold_crossed
  Authoritative`.

### Renderer changes needed

- **F3 locale-invariance fix** — required, or the new evidence node will vanish on TR again.
- `TOUCH_STAGE_TR` (`src/components/ui/JourneyCanvasNodes.tsx`) needs a row for the new
  `risk-check-in` stage, in the same commit, per the glossary rule.
- If `a.check-in` is authored as one node with a branch-resolved channel rather than two
  nodes, the layout engine needs **per-parent instancing extended from shared terminals to a
  shared message node** — the same `x.converted@c.state` mechanism keyed by `layoutId`, so
  each arm draws its own single-channel card. This is generic and RET-28 needs it too; if it
  is not built, author two `a.check-in` nodes instead and take the duplication in canonical.

---

## RET-26 · Service Recovery

**Purpose.** Match the response to what actually failed, whether it is fixed, and whether a
remedy is genuinely owed.

**Current flow.**

```
Authoritative negative experience
  → [Establish what failed, what it cost, whether it is resolved, who else is on it]
  → Is another recovery process already handling this failure?  ├ Already handled → Exit (defer)
  → Is the underlying issue still unresolved?                   ├ Still broken  → Handoff external operational resolution
  → Is a recovery communication actually useful here?           ├ Not useful    → Exit (silent)
  → Does policy and the actual impact support compensation?     ├ Owed          → Handoff REM-159
  → [Acknowledge: what failed, what was done, what prevents it] (Email + Push)
  → Exit "failure acknowledged, no remedy owed"
```

### Problems found

1. **Email + Push on a single acknowledgement card.** Push's stated precondition is "the
   failure happened inside the app, the person is active there, and the acknowledgement is
   short" — the journey reads none of that, and the acknowledgement's own authored content
   ("what failed, what was done about it, and what stops it happening again") is by definition
   not short. This is F1.
2. `a.assess` is drawn on EN and absorbed on TR (F3). It writes `failure_record` — real state,
   not a journal row.
3. Nothing else. The four-gate cascade is correct and each gate is a genuine business
   decision with a distinct outcome; none of them is a send-path gate, and none should
   collapse.

### Final orchestration

**Single.** One message, no wait, no follow-up. A service failure is acknowledged once; the
journey's own `localCap` rule already says so ("One acknowledgement per failure; a second
message about the same failure is a second failure"). This is the domain's clean example of
the brief's `Trigger → gates → Email → Exit` being legitimate.

### Final customer channels

**Email**, single.

### Customer touch count

**1.**

### Final flow

```
Trigger: Service failure recorded
  → [Establish what failed, what it cost, whether it is resolved]
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

### State re-checks

None needed and none added — there is one touch and the four gates immediately precede it.

### Stop conditions

Another process taking the failure · the issue still being open · the failure never having
reached the customer · a remedy being owed (REM-159 takes over and this journey does not also
speak).

### Ownership / handoff

Unchanged. `competition: "none"`, `priority: "service"` — correct; a service acknowledgement
is not rationed against promotional pressure.

### Canonical changes needed

1. `channels: ["email","push"]` → `["email"]`.
2. Remove the `low-friction → push` role from `contact.channelStrategy.roles`; set
   `fallback: "none"`.
3. `orchestration.touches[0].channelRoles`: `["persistent","low-friction"]` → `["persistent"]`.

(These three must land together — `validate:canonical` errors in both directions on a declared
channel with no backing action, and on an action channel with no declaration.)

### Display-only changes needed

`a.assess` must keep its card on both locales (F3).

### Renderer changes needed

F3 only.

---

## RET-28 · Cancellation Save

**Purpose.** Treat stated intent to leave as a decision point where a genuinely relevant
alternative may be offered, and never as an obstacle course.

**Current flow.**

```
Explicit cancellation intent
  → [Read what they hold, what cancelling ends, when it takes effect]
  → Is a declared reason available?  ├ Declared → record reason
  → Is asking for a reason useful?   ├ Not worth asking → proceed without one
  → [Ask once, cancellation path open beside it]  (In-app + Email)
  → Wait (session-bound) → What came back? ├ A reason → record  ├ Decided meanwhile → decision
  → Does a legitimate resolution exist for this reason?
        ├ A real alternative → [Offer once]  (In-app + Email) → Handoff RET-30
        └ Nothing genuine    → Wait (intent window) → What did they decide?
                                     ├ Confirmed → Handoff SUB-167
                                     └ Abandoned → Exit lapsed
```

### Problems found

1. **In-app + Email on both message cards.** Unlike F1's boilerplate, RET-28's role block is
   journey-specific and *states a real routing rule*: in-session "when the intent was declared
   inside the product", persistent "when the intent was declared outside the product, by
   message or by phone". The journey has the signal — the trigger's own evidence enumerates
   "a cancel flow entered" vs "a cancellation asked for through a person" — **and never
   branches on it.** The result is a two-channel card where a one-branch decision belongs.
2. `c.ask` ("Is asking for a reason useful and appropriate here?") is doing two jobs: a
   judgement about whether the answer changes the offer, and an implicit judgement about
   surface ("asking would function as friction"). Asking a survey question of somebody who is
   cancelling *by phone* is not friction, it is impossible — that case belongs to the surface
   decision, not to this one.
3. Nothing else. The "path is never obstructed" rule, the single-ask/single-offer cap and the
   RET-30 handoff are all correct and must not be touched.

### Final orchestration

**Conditional routing**, decided once at entry on the declaration surface, inherited by both
touches. Not fallback — an in-app ask and an email ask reach two genuinely different people in
two different situations, and neither substitutes for the other.

### Final customer channels

**In-app** (intent declared in the product) · **Email** (intent declared through a person or
off-product).

### Customer touch count

**1–2.** The ask exists only on the in-product arm; the offer exists only where a genuine
alternative matches the reason. Cap `cancellation_save.touches = 2` is unchanged and still
correct.

### Final flow

```
Trigger: Cancellation intent declared
  → [Read what they hold and what cancelling would end]
  → Decision: Where was the intent declared?
        ├ In the cancel flow
        │     → Decision: Is a reason already on record?
        │           ├ Declared     → [record the reason]
        │           └ Not declared → Message: Reason ask (In-app), cancel path open beside it
        │                          → Wait: until a reason is given, or the cancellation is
        │                            confirmed or abandoned (session-bound)
        │                          → Decision: What came back?
        │                                ├ A reason          → [record the reason]
        │                                └ Decided meanwhile → the decision below
        └ Through a person / off product
              → [record the reason the person took, or that none was given]
  → Decision: Does a legitimate resolution exist for this reason?
        ├ A real alternative → Message: Alternative offer  (In-app on the in-flow arm,
        │                      Email on the off-product arm) → Handoff: Retention Offer
        │                      Follow-Up (RET-30)
        └ Nothing genuine
  → Wait: until the cancellation is confirmed or abandoned (intent window)
  → Decision: What did they decide?
        ├ Confirmed ─────► Handoff: Cancellation Effective-Date Resolution (SUB-167)
        └ Abandoned ─────► Exit: intent expressed, not carried through
```

### State re-checks

Both existing `recheck` clauses stay and are the right ones: `w.answer` re-reads the intent
("still open, not confirmed, not abandoned") and `w.decision` re-reads the relationship
("still active, no cancellation executed elsewhere"). No touch is sent after a decision.

### Stop conditions

`cancellation_confirmed` · `cancellation_flow_abandoned` · the session ending (the ask's own
attribute-bound window — unanswered is the answer) · `s.once` (one ask, one offer, ever).

### Ownership / handoff

Unchanged, and explicitly do-not-reopen: a declared intent outranks inferred risk (RET-24
yields to it at entry), only the offer step yields to a human-owned issue, and the
cancellation path itself is never obstructed by any contest.

### Canonical changes needed

1. New condition `c.surface` — *"Where was the cancellation intent declared?"* — two branches,
   `observes: "intent record, intake route"`, placed immediately after `a.context`. The route
   is already recorded: the trigger's evidence distinguishes the three intake forms.
2. Delete `c.ask`. Its "worth asking" arm becomes the in-flow arm of `c.surface` plus the
   existing `c.reason`; its "not worth asking" arm becomes the off-product arm, which goes to
   `a.no-reason` exactly as today.
3. `a.ask`: `channelRoles: ["in-session","persistent"]` → `["in-session"]`; channel plan
   becomes In-app only.
4. `a.offer`: keep both roles, but bind the channel to `c.surface`'s recorded branch rather
   than emitting a two-channel plan — the offer goes out on the surface the intent arrived on
   and is not re-decided. Note in `destination.mustNotClaim` stays as authored.
5. `channels` stays `["email","in-app"]` — both are still backed.
6. `orchestration.strategy`: `"offer-decide-remind"` → `"conditional-routing"`.

### Display-only changes needed

- `c.surface` must be drawn. It changes the customer's visible route (whether a question is
  asked at all, and on what).
- `a.context` is correctly absorbed today (bookkeeping, no `writes`) — leave it absorbed.
- Branch labels: "In the cancel flow" / "Through a person" — both short enough to survive the
  Family F label budget when merged.

### Renderer changes needed

Same shared-message-node per-parent instancing as RET-24 item 3, if `a.offer` stays a single
node. Otherwise none.

---

## RET-30 · Retention Offer Follow-Up

**Purpose.** Close a retention attempt on what actually happened to the relationship, and stop
the same offer being made twice.

**Current flow.**

```
Retention intervention delivered
  → Wait: until accepted / declined / recovered / failed / cancellation decided  (bounded)
      ├ on event → What happened to the intervention?
      │       ├ Accepted → [verify against the system of record] → Did the state actually change?
      │       │        ├ Applied              → Handoff RET-27 Recovery Stability Check
      │       │        └ Accepted not applied → Handoff external operational resolution
      │       ├ Declined → [record the decline against the episode] → Is a cancellation still in progress?
      │       │        ├ Still cancelling → Handoff SUB-167
      │       │        └ No cancellation  → Exit "declined, relationship intact"
      │       ├ Recovered without answering → Handoff RET-27
      │       ├ Failed to execute           → Handoff external operational resolution
      │       └ Decided meanwhile           → Handoff SUB-167
      └ on timeout → With no response, is one bounded follow-up justified?
              ├ Justified     → [Follow-up]  (Email + In-app) → Exit cooldown
              └ Not justified → Exit cooldown
```

### Problems found

1. **Its trigger has no author** (F5). Not RET-30's fault and not fixable inside RET-30 —
   it is fixed by RET-24 above and by RET-28's existing `h.intervention`. Recorded here so
   the two sides are read together.
2. **Email + In-app on the follow-up.** The follow-up's own justification is "the offer is
   time-limited or its terms were plausibly not understood" — that is a document to be
   re-read, not an in-session prompt. F1.
3. `a.verify` and `a.record-decline` are absorbed (they write `retention_episode_history`,
   a journal name). `a.verify` writes nothing and is a genuine step — "acceptance is a
   customer saying yes; application is the state having moved" is the journey's central
   insight and its card is gone. **`a.verify` should be drawn.** The fix is data-side: it has
   no `writes` at all, which is what makes it absorbable; giving it an honest
   `writes: [{ field: "retention_outcome", mode: "set" }]` both describes what it does and
   restores its card under the existing rule.
4. `x.declined` and `x.cooldown` are already correct, with distinct re-entry stories.

### Final orchestration

**Event-or-timeout.** The event arm is a five-way read of what actually happened and sends
nothing; the timeout arm is the only path that communicates, and it sends at most one.
Distinct from everything else in the domain: this is the only journey here whose *default*
outcome is silence and whose message exists only on the unanswered branch.

### Final customer channels

**Email**, single, on the follow-up only.

### Customer touch count

**0–1.**

### Final flow

Unchanged in shape from the current flow above, with three edits: `a.followup` becomes Email
only; `a.verify` regains its card; the `Decided meanwhile` and `Failed to execute` arms are
unchanged.

### State re-checks

`w.outcome.recheck` already re-reads the customer from the system of record before acting on
the timeout — correct, and it is what stops a follow-up landing on somebody who has already
cancelled. `a.verify` is itself a state re-check and is the reason `s.g1` holds ("retention is
recorded from the relationship state, never from the customer's answer").

### Stop conditions

`retention_offer_accepted` · `retention_offer_declined` · `relationship_recovered` ·
`intervention_failed` · `cancellation_confirmed` · `cancellation_flow_abandoned` · the
decision window closing. Six terminating events on one wait is unusual but correct here —
every one of them is a genuinely different outcome with a different owner.

### Ownership / handoff

Unchanged. Lowest in `retention-outreach`: any live risk case or open issue on the account
outranks it. RET-27 (Recovery Stability Check) takes over on a positive outcome — the
`distinctFrom` note is right and must stay.

### Canonical changes needed

1. `channels: ["email","in-app"]` → `["email"]`.
2. Remove the `in-session → in-app` role; `fallback: "none"`.
3. `orchestration.touches[0].channelRoles`: `["persistent","in-session"]` → `["persistent"]`.
4. Give `a.verify` a `writes` entry naming the real state it establishes (item 3 above).

### Display-only changes needed

`a.verify` drawn. `a.record-decline` stays absorbed — it genuinely only appends to
`retention_episode_history`.

### Renderer changes needed

None.

---

## RET-31 · Predicted Need Replenishment

**Purpose.** Prompt a person to replenish a consumable shortly before its usable period is
predicted to end, stating the prediction as an estimate, and stop the moment they buy, dismiss,
or the cycle passes.

**Current flow.**

```
Expected depletion approaching
  → Is there a need to prompt, and may we? ├ Already met → Exit replenished  ├ Not eligible → Exit no-action
  → [open instance] → Wait (lead time before expected_depletion_at)
  → At the lead point, is the need still unmet?  ├ Replenished → Exit  ├ Dismissed → Exit
  → (send gate) → [Lead prompt]  (Email + Push + In-app)
  → Wait (margin after expected_depletion_at)
  → After the estimated depletion, what happened?  ├ Replenished → Exit  ├ Dismissed → Exit
  → (send gate) → [Follow-up]  (Email + Push + In-app)
  → Wait (lifetime) → What ended the observation?  ├ Replenished → Exit  ├ Dismissed → Exit
  → timeout → Exit lapsed
```

### Problems found

1. **Three channels on both touches**, F1. Worst case in the domain: the same three-role block
   as seven other journeys, on a journey whose entire design point is *timing*, not reach.
2. Otherwise this is one of the best-authored journeys in the corpus and needs almost nothing.
   The state re-checks are exemplary (every wait re-reads purchases, subscriptions and
   dismissals and **recomputes the expected depletion date from the latest purchase**).

### Final orchestration

**Event-or-timeout anchored on a computed attribute** (`deadline-countdown` against
`expected_depletion_at`). Its signature — and what separates it from the other two members of
the recommendation trio — is that **both waits are `relativeTo: "attribute"`, not
`relativeTo: "previous-touch"`**: the lead prompt is timed *before* the estimated depletion
date and the follow-up *after* it. The two touches bracket a date the system computed. Neither
RET-293 nor RET-294 has an attribute-anchored wait anywhere.

### Final customer channels

**Email**, single, on both touches.

### Customer touch count

**2.** (`replenishment.touches` default 2, unchanged.)

### Final flow

As current, with both message cards reduced to Email and nothing else changed.

### State re-checks

Already correct and best-in-domain. Keep verbatim: purchases, subscriptions and dismissals
re-read before every touch; the depletion date recomputed from the latest purchase; a purchase
by **any channel** closes the instance.

### Stop conditions

`purchase_completed` · `replenishment_need_dismissed` · an active subscription or
auto-replenishment covering the need · the prediction cycle passing.

### Ownership / handoff

Unchanged. `commerce-recovery`, below process and selection recovery, above interest recovery.
No handoffs — correct; nothing else owns a predicted need.

### Canonical changes needed

1. `channels: ["email","push","in-app"]` → `["email"]`.
2. Remove the `low-friction → push, in-app` role; `fallback: "none"`.
3. Both touches' `channelRoles`: `["persistent","low-friction"]` → `["persistent"]`.

**Revisit condition (named because this is the strongest push case in the domain):** touch 2
fires *after* the estimated depletion has passed, is short, and its route back is a single
step — the brief's own description of push. If a device-registration state is ever recorded
against the person and a condition can branch on it, touch 2 becomes a genuine
`Push if reachable → Email otherwise` fallback. It is not one today because nothing in the
journey reads a token.

### Display-only changes needed

None. `a.open`, both send gates and `w.lead` / `w.window` are correctly absorbed; the three
state conditions and both message cards are correctly drawn.

### Renderer changes needed

None.

---

## RET-32 · Lapsed Customer Win-Back

**Purpose.** Invite a person whose paid relationship ended or went dormant to come back — once,
honestly, with whatever has actually changed since they left.

**Current flow.**

```
Lapsed customer detected
  → Is this relationship one we may write to about coming back?  ├ Excluded → record → Exit no-action
  → [open instance]
  → What can the invitation honestly say?  ├ Something changed → (send gate)
                                           └ Nothing specific  → (send gate)     ← both arms same target
  → (send gate) → [Invitation]  (Email + Push)
  → Wait (response window) ├ repaid → Exit won
  → Is a follow-up enabled, and is there something honest to add?
        ├ Enabled with something to add → (send gate) → [Follow-up] (Email + Push) → Wait → Exit
        └ Not enabled / nothing to add  → Exit lapsed
```

### Problems found

1. **`c.basis` is a fork whose two arms go to the same node** (`c.sendable`). It changes what
   the message *says*, not what the journey *does*. That is P-FORK-NOOP-01 and it is a
   decision the business does not have — the honest-content rule (`s.honest`) is a content
   guardrail, not a branch.
2. **Email + Push on both touches**, F1. Push here is worse than boilerplate: the recipient is
   by definition somebody whose paid relationship *ended*, and the role's own precondition is
   "a valid push token still exists on a device the person kept the app on". Betting a win-back
   on a retained app install is a channel choice made by the template, not by the business.
3. `s.permission` already says the right thing and must not be weakened: "absent permission is
   a recorded no-action, **never a fallback to another channel**". That sentence is the
   corpus's own statement of the brief's fallback rule.

### Final orchestration

**Sequential**, one invitation and one optional follow-up, each gated on there being something
honest to add. The second touch is conditional on a **business configuration**
(`winback.follow_up_enabled`, `winback.incentive_policy`) rather than on customer behaviour —
that is what separates it from RET-294's reminder, which is conditional on customer state.

### Final customer channels

**Email**, single, on both touches.

### Customer touch count

**1–2.**

### Final flow

```
Trigger: Lapsed customer detected
  → Decision: May we write to this relationship about coming back?
        ├ Excluded ──► [record the excluding reason] → Exit: no invitation sent
        └ Eligible
  → [open the win-back instance against this lapse]
  → Message: Invitation (Email)          ← says what changed where something did; plain otherwise
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

### State re-checks

`w.response.recheck` re-reads the relationship ("still lapsed, nothing opened on it, permission
still recorded") before the second touch — correct and must stay. `w.final` re-reads from the
system of record.

### Stop conditions

`relationship_repaid` · `purchase_completed` · the long cooldown · `s.sunset` (the standing
marketing suppression CON-300 writes — **do not weaken**) · any live retention, complaint, risk
or payment journey on the account, which means the relationship is not lapsed at all.

### Ownership / handoff

Unchanged and do-not-reopen: lowest in `retention-outreach`; distinct from ACT-20 by
eligibility (there was a paid relationship), from RET-28 by timing (after the save window and
its cooldown), and from CON-300 by subject. That last `distinctFrom` entry is the clearest
statement in the corpus of why sunset is not win-back and it must be preserved verbatim.

### Canonical changes needed

1. Delete `c.basis`. Move its content rule into `a.touch1`'s guardrail text and into
   `s.honest`, which already carries it. The branch label "Something changed that speaks to
   why they left" becomes part of what the invitation says, not a decision the reader has to
   follow.
2. `channels: ["email","push"]` → `["email"]`.
3. Remove the `low-friction → push` role; `fallback: "none"`.
4. Both touches' `channelRoles`: `["persistent","low-friction"]` → `["persistent"]`.

### Display-only changes needed

Removing `c.basis` removes one drawn node; `a.open` and both send gates stay absorbed. The
"Excluded" arm's `a.record-no-action` stays drawn (PR #10's rule — every parent of a shared
hop must collapse before the hop may be hidden, and `c.sendable`/`c.sendable2` do not both
collapse into the same host).

### Renderer changes needed

None.

---

## RET-290 · First Purchase Thank You & Bounceback

**Purpose.** Mark the moment a buyer becomes a customer for the first time, and give them one
honest reason to come back — without ever speaking over the order's own transactional
confirmation.

**Current flow.**

```
First purchase completed
  → Wait (settle: let the order confirmation have its moment)
  → Now that the order has settled, is a welcome still the right thing?
        ├ Already returned    → Exit returning
        ├ Relationship ended  → Exit closed
        └ Welcome due → (send gate) → [Welcome]  (Email + In-app)
  → Wait (bounceback window)
  → Has a second purchase already been made?  ├ Returned → Exit returning
  → (send gate, also checks the business has an issued offer) → [Bounceback] (Email + In-app + Push)
  → Exit "welcomed and prompted"
```

### Problems found

1. **Two and three channels on the two touches**, F1.
2. Nothing structural. The `w.settle` wait is the mechanism that keeps RET-290 from speaking
   over FUL-301, and it is exactly right — **do not merge, do not remove, do not shorten.**

### RET-290 versus FUL-301 — explicitly preserved

The boundary is already held in three independent places and all three stay:

- `contact.competition.precedence`: *"below the order's own confirmation (FUL-301) and below
  the post-purchase follow-up on the same person's order — the record has to open before
  anything is said about the relationship it opened"*, `onLoss: "suppressed"`.
- `w.settle`'s own timeout reason: *"a welcome that lands beside the order confirmation reads
  as a duplicate of it"*.
- `s.transactional` in the `noAction` list.

FUL-301 states what the business took on. RET-290 opens the relationship. No post-purchase
marketing moves into the confirmation and the welcome never restates order contents. Nothing
in this audit touches that.

### Final orchestration

**Sequential**, welcome then optional bounceback, with a settle wait in front of the first
touch. Distinct from RET-294's maturation wait: `w.settle` exists to yield to *another
journey's* message, not to let a product be used.

### Final customer channels

**Email**, single, on both touches.

### Customer touch count

**1–2.** The bounceback exists only where the business has actually issued an offer
(`c.sendable2` observes the offer record) — a real gate, not a template step.

### Final flow

As current, both message cards reduced to Email.

### State re-checks

`w.settle.recheck` re-reads the purchase record, the order state and permission;
`w.second.recheck` re-reads the purchase record and permission. `c.second` explicitly stops a
bounceback reaching somebody who already came back. All correct.

### Stop conditions

A second purchase (`x.returning`, and the instance never reopens — "a relationship is a first
one only once") · `permission_withdrawn` · the first purchase being cancelled or reversed · no
issued offer to name.

### Ownership / handoff

Unchanged. No handoffs; the ordinary retention journeys take the relationship from `x.returning`.

### Canonical changes needed

1. `channels: ["email","in-app","push"]` → `["email"]`.
2. Remove the `in-session → in-app` and `low-friction → push` roles; `fallback: "none"`.
3. `a.welcome.channelRoles`: `["persistent","in-session"]` → `["persistent"]`.
   `a.bounceback.channelRoles`: `["persistent","in-session","low-friction"]` → `["persistent"]`.

### Display-only changes needed

None. Both waits, both send gates, `a.record-no-action` and `x.no-action` are correctly
absorbed (9 display nodes from 14 canonical — this is the display layer working as intended).

### Renderer changes needed

None.

---

## RET-292 · First Purchase Anniversary

**Purpose.** Recognise the anniversary of the date somebody first bought — the relationship's
own age, counted from its first transaction and from nothing else — and say so once.

**Current flow.**

```
First purchase anniversary approaching
  → Is this anniversary still ours to recognise?
        ├ Relationship ended → Exit closed
        ├ Not sendable       → [record] → Exit no-action
        └ Recognise → [Recognition]  (Email + Push + In-app) → Exit recognised
```

### Problems found

1. **Three channels on a one-touch journey**, F1. This is the starkest case: seven canonical
   nodes, one message, and a three-role channel cascade attached to it.
2. Nothing else at all. RET-292 is already `Trigger → Decision → Message → Exit`, which the
   brief names as a legitimate shape, and it folds its send gate into its eligibility
   condition rather than drawing a second one — **the pattern RET-295 should copy.**

### Final orchestration

**Single.**

### Final customer channels

**Email**, single.

### Customer touch count

**1.**

### Final flow

```
Trigger: First purchase anniversary approaching
  → Decision: Is this anniversary still ours to recognise?
        ├ Relationship ended ──► Exit: closed without a message
        ├ Not sendable ────────► Exit: no recognition sent, reason recorded
        └ Recognise
  → Message: Anniversary recognition (Email)
  → Exit: recognised for this interval
```

### State re-checks

One decision immediately before one send. Nothing further is needed and nothing is added.

### Stop conditions

A closed account · a fully reversed first purchase · withdrawn permission · the interval having
already been recognised · **the interval passing** (`s.interval`: never sent late, never merged
into the next one — this is the journey's sharpest rule and must survive).

### Ownership / handoff

Unchanged and do-not-reopen: `date-recognition` exclusion group, **below** RET-295. Where both
fall in the same window this one is suppressed and its interval closes unsent.

### Canonical changes needed

1. `channels: ["email","push","in-app"]` → `["email"]`.
2. Remove the `low-friction` and `in-session` roles; `fallback: "none"`.
3. `orchestration.touches[0].channelRoles` → `["persistent"]`.

### Display-only changes needed

None.

### Renderer changes needed

None.

---

## RET-293 · Personalized Recommendations

**Purpose.** Show a person a small set of things that follow from what they themselves have
done — and only while every item in it is still something they can actually buy.

**Current flow.**

```
Recommendation signal qualified
  → Is the recommendation still valid?
        ├ Already bought → Exit purchased
        ├ Stale or empty → [record] → Exit no-action
        └ Valid → (send gate) → [Recommendation]  (Email + In-app + Push)
  → Wait (observation window)
  → Did the recommendation reach a relevant purchase?
        ├ Converted → Exit  ├ Dismissed → Exit  ├ No conversion → Exit
```

### Problems found

1. **Three channels**, F1, with `fallback: "next-eligible-role"` — the explicit cascade the
   brief rejects by name.
2. Nothing else. The journey is already one touch and its observation window measures without
   communicating.

### How the trio stays distinct — RET-293's share

RET-293 is **a predicted affinity, one shot, then measurement only**. It is the only member of
the trio with **no second touch of any kind** and the only one whose wait exists purely to
decide whether a purchase may honestly be attributed to the message
(`"past its window a purchase is the person's own doing, and counting it here would be a claim
the data does not support"`). Its distinguishing canonical rule is `s.unavailable`: every item
is re-read for availability, eligibility and ownership **immediately before sending**, and
where nothing survives, nothing is sent. Neither RET-31 nor RET-294 re-reads a set.

### Final orchestration

**Single**, followed by a measurement-only observation window.

### Final customer channels

**Email**, single.

### Customer touch count

**1.** (`recommendations.touches` default 1, unchanged.)

### Final flow

As current, with the message card reduced to Email.

### State re-checks

`c.valid` is the re-check and it is the right one — signal recency, item availability,
ownership, prior declines. `w.window.recheck` re-reads the purchase record and any dismissal.

### Stop conditions

`purchase_completed` · `interest_dismissed` (and the *subject* is never proposed again) · the
signal passing its recency rule · no item surviving the availability re-read · **RET-294
holding the person** (`recommendation-offer` group, RET-293 is below).

### Ownership / handoff

Unchanged and do-not-reopen: below RET-294 in `recommendation-offer`, scope `person`,
`onLoss: "suppressed"` — the two never propose a next purchase to the same person at once.

### Canonical changes needed

1. `channels: ["email","in-app","push"]` → `["email"]`.
2. Remove the `in-session` and `low-friction` roles; `fallback: "none"`.
3. `orchestration.touches[0].channelRoles`: `["persistent","in-session","low-friction"]` →
   `["persistent"]`.

### Display-only changes needed

None. `c.sendable` and `w.window` are correctly absorbed.

### Renderer changes needed

None.

---

## RET-294 · Cross-Sell / Next Best Offer

**Purpose.** Offer the thing that genuinely completes something the person already owns, once
the first thing has had time to be used, and stop the moment they have it.

**Current flow.**

```
Purchase with known complement
  → Wait (maturation: until the owned thing has plausibly been received and used)
  → Is there still a complementary next step worth offering?
        ├ Already complete    → Exit complete
        ├ No longer applicable → Exit closed
        └ Opportunity stands → (send gate) → [Offer]  (Email + Push + In-app)
  → Wait (response window)
  → Was the offer taken?  ├ Taken → Exit  ├ Declined → Exit
                          └ No answer yet → (send gate) → [Reminder]  (Email + In-app) → Exit offered
```

### Problems found

1. **Three channels then two**, F1, with `next-eligible-role` fallback.
2. Nothing else. `s.segment` is already in place and already says the right thing: *"A segment
   split is made only where the offer itself genuinely differs by segment. Splitting one offer
   into branches that send the same thing adds a decision the business does not actually
   have."* That is the brief's own rule, authored into the corpus.

### How the trio stays distinct — RET-294's share

RET-294 is **a declared product relationship, matured, then offered and reminded once**. Its
signature is `w.maturation`: **the only wait in the trio that precedes every touch**, whose
whole purpose is to stop an accessory reaching somebody whose order is still in transit
(`s.premature`). Its opportunity is bound to a *relationship between two products the company
has declared* — not to a person-pattern (RET-293) and not to a computed depletion date
(RET-31). Its second touch is gated on **customer state** ("still does not have the complement
and has not said they do not want it"), where RET-32's second touch is gated on business
configuration.

Summary of the trio, to make the difference explicit:

| | what it reads | what it claims | shape | anchor |
|---|---|---|---|---|
| RET-31 | this person's own prior purchase + the item's usable life | *you are about to run out of the thing you have* | 2 touches bracketing a date | `expected_depletion_at` (attribute) |
| RET-293 | a recorded signal about this person | *these resemble what you have shown interest in* | 1 touch, then measure | the signal's recency rule |
| RET-294 | a declared relationship between two products + ownership | *this completes the thing you own* | maturation → offer → one reminder | ownership of the subject |

Three different sources of evidence, three different claims, three different shapes. They are
not the same journey.

### Final orchestration

**Sequential with a maturation gate in front.**

### Final customer channels

**Email**, single, on both touches.

### Customer touch count

**1–2.** (`next_offer.touches` default 2, unchanged.)

### Final flow

As current, both message cards reduced to Email.

### State re-checks

Best in the trio and must stay verbatim: `s.owned` — *"Ownership is re-read immediately before
every touch and never trusted from the record that opened the instance."* `w.maturation.recheck`
re-reads ownership of both products, the declared relationship and permission;
`w.response.recheck` re-reads ownership of the complement and any dismissal.

### Stop conditions

`purchase_completed` (the complement acquired by **any route**) · `interest_dismissed` ·
`permission_withdrawn` · the declared product relationship ceasing to hold (`x.closed`,
class `invalid-state`) · the touch budget.

### Ownership / handoff

Unchanged and do-not-reopen: **above** RET-293 in `recommendation-offer`; while RET-294 holds a
person RET-293 is suppressed for them rather than queued. No handoffs.

### Canonical changes needed

1. `channels: ["email","push","in-app"]` → `["email"]`.
2. Remove the `low-friction` and `in-session` roles; `fallback: "none"`.
3. `a.offer.channelRoles`: `["persistent","low-friction","in-session"]` → `["persistent"]`.
   `a.remind.channelRoles`: `["persistent","in-session"]` → `["persistent"]`.

### Display-only changes needed

None — 10 display nodes from 15 canonical, with both waits, both send gates,
`a.record-no-action` and `x.no-action` absorbed. Correct.

### Renderer changes needed

None.

---

## RET-295 · Birthday & Milestone

**Purpose.** Recognise a date that belongs to the person themselves — a birthday they told us,
or a milestone their own record has reached — and say so once, with nothing attached that has
not been issued.

**Current flow.**

```
Personal milestone approaching
  → Is this date still ours to recognise?
        ├ Relationship ended  → Exit closed
        ├ Cycle already spent → [record] → Exit no-action
        └ Recognise → May the recognition go out?       ← drawn send gate
                          ├ Suppressed → [record] → Exit no-action
                          └ Sendable → [Recognition]  (Email + Push + In-app) → Exit recognised
```

### Problems found

1. **Three channels**, F1.
2. **The send gate is drawn** (F2) where RET-292's equivalent is folded into its eligibility
   condition. Two journeys in the same exclusion group, doing the same thing, drawing a
   different number of decisions.

### Deliberate mirroring of RET-292

RET-292 and RET-295 come out of this audit with the **same shape** — `Trigger → Decision →
Email → Exit`, one touch — and that is correct, not a convergence failure. They are the two
halves of one product rule, held apart by data rather than by flow:

- different entities (`anniversary_cycle` vs `milestone_cycle`);
- different *sources* of the date (the company's own record of a first purchase vs a date the
  person supplied or their own record reached);
- **one exclusion group with an explicit precedence** — RET-295 above RET-292 — so a person
  never receives both in the same window, and the loser's interval closes **unsent** rather
  than queueing.

That precedence is stated on both sides and is do-not-reopen. Making the two flows differ for
the sake of differing would be exactly the fabrication the brief forbids. What distinguishes
them belongs in the detail panel and the `distinctFrom` rows, both of which already carry it.

### Final orchestration

**Single.**

### Final customer channels

**Email**, single.

### Customer touch count

**1.**

### Final flow

```
Trigger: Personal milestone approaching
  → Decision: Is this date still ours to recognise?
        ├ Relationship ended  ──► Exit: closed without a message
        ├ Cycle already spent ──► Exit: no recognition sent, reason recorded
        └ Recognise
  → Message: Milestone recognition (Email)
  → Exit: recognised for this cycle
```

### State re-checks

One decision immediately before one send. The send-path check folds into it (see below).

### Stop conditions

A closed account · withdrawn permission · the person having asked to be left alone (**and that
person is not re-entered** — the strongest re-entry clause in the domain) · the cycle having
been recognised · the date having passed.

### Ownership / handoff

Unchanged and do-not-reopen: `date-recognition`, **above** RET-292, scope `person`.

### Canonical changes needed

1. `channels: ["email","push","in-app"]` → `["email"]`.
2. Remove the `low-friction` and `in-session` roles; `fallback: "none"`.
3. `orchestration.touches[0].channelRoles` → `["persistent"]`.
4. **Fold `c.sendable` into `c.date`** exactly as RET-292 folds its send check into
   `c.eligible`: `c.date`'s "Recognise" arm gains "…and the send path passes", and a fourth
   branch "Not sendable" goes to `a.record-no-action`. `c.sendable` is deleted.
   `orchestration.touches[0].prerequisites` becomes `["c.date"]`.

### Display-only changes needed

Item 4 removes the drawn gate at the data level, which is the right fix — the alternative
(teaching the collapser to handle a shared `a.record-no-action` hop) would change behaviour
for every journey in the corpus to fix one card here.

### Renderer changes needed

None.

---

## CON-272 · Contact Recovery

**Purpose.** Get a dead destination replaced by asking on a route that still works, so a
delivery failure is repaired once rather than retried blind — and without either side mistaking
it for a change of permission.

**Current flow.**

```
Contact point recorded undeliverable
  → What can carry the repair request without using the broken destination?
        ├ Reachable in product  → [Ask]  (In-app)
        ├ Reachable off product → [Ask]  (SMS + Email)          ← two channels on one card
        └ Nothing left          → Exit dark
  → Wait (one repair cycle)
        ├ timeout → Exit suppressed
        └ on event → What ended the wait?
                ├ Recovered → Exit recovered
                └ Replaced  → [Confirm]  (In-app + Email + SMS)  ← three channels on one card
                            → Exit repaired
```

### Problems found

1. **The routing decision is right and the channels on its arms are not.** `c.route` is the
   only genuine reachability decision in the domain and it is drawn — good. But its
   "Reachable off product" arm then carries SMS *and* Email on one card, which discards the
   decision the branch was supposed to have made.
2. **`a.confirm` carries all three channels.** The confirmation should go on the route that
   actually carried the repair; sending it on three is the thing `s.g2` forbids in spirit
   ("the repair request never goes to the destination being repaired").
3. SMS's role precondition is *"an asserted time bound lies inside the urgent horizon"* —
   CON-272 asserts no time bound anywhere. SMS is not the urgent channel here; it is the
   **surviving** channel when the failed destination was the email address.

### The domain's one legitimate fallback

The brief flagged CON-272 as the clearest candidate and the data supports it. The entity is
`[contact_point_id, person_id]` — *"this address, this number, this token"* — so the journey
always knows **which** destination died, and `s.g3` already forces it to check that a
surviving route is both deliverable **and permitted**. Splitting the off-product arm by which
route survives is therefore reading a field the journey is built on, not inventing one:

- the **email address** died and a permitted, deliverable **phone number** survives → **SMS**;
- the **phone number** or **push token** died and the **email address** survives → **Email**;
- the person is signed in → **In-app**, regardless, because the request is most credible where
  they already are and it costs no delivery reputation.

This is a substitution in the brief's strict sense: the channel we would otherwise use
*genuinely cannot be used*, because it is the thing that broke.

### Final orchestration

**Conditional routing on reachability**, with the confirmation inheriting the route that
worked. Three arms, one touch each, no cascade.

### Final customer channels

**In-app** · **Email** · **SMS** — one per branch, and the confirmation on the same route as
the request.

### Customer touch count

**2.** The request and the confirmation. Both are `mandatory: true` and the journey's own
`localCap` correctly caps only *non-mandatory* touches at 0 — there is nothing discretionary
here to ration.

### Final flow

```
Trigger: Contact point recorded undeliverable
  → Decision: What can carry the repair request without using the broken destination?
        ├ Signed in                 → Message: Repair request (In-app)
        ├ Email survives            → Message: Repair request (Email)
        ├ Only the phone survives   → Message: Repair request (SMS)
        └ Nothing working and permitted ──► Exit: no route left; destination stays suppressed
  → Wait: until a replacement verifies, the original becomes deliverable again,
          or the destination is removed  (one repair cycle)
        └ timeout ──► Exit: destination stays suppressed after one repair cycle
  → Decision: What ended the wait?
        ├ Recovered ──► Exit: original destination reachable again; nothing replayed
        └ Replaced
  → Message: Repair confirmation (on the route that carried the request)
  → Exit: destination replaced and in use; permission unchanged
```

### State re-checks

`w.corrected.recheck` re-reads the person and the failed contact point from the system of
record before acting on the timeout — correct. `s.g5` requires the corrected value to be
**verified** before the destination is treated as usable, and `s.g1` keeps the whole thing off
the permission record.

### Stop conditions

`replacement_destination_verified` · `destination_deliverable_again` · `destination_removed` ·
`s.g4` — **one repair cycle per destination**, which is the journey's hardest rule and the
reason it must never retry.

### Ownership / handoff

Unchanged and important: **highest** in `contactability-question`, `onLoss: "paused"` (not
suppressed — the repair resumes). While a repair is open, CON-300 stands down rather than
reading a dead destination as disinterest. That is the correct dependency and it is stated on
both sides.

### Canonical changes needed

1. Split `c.route`'s "Reachable off product" branch into two: "Email survives" and "Only the
   phone survives", each `observes: "contact point record, permission record, deliverability"`.
   Four branches total including "Nothing left".
2. Split `a.prompt-alt` into `a.prompt-email` (channel Email, role `persistent`) and
   `a.prompt-sms` (channel SMS, role `urgent` renamed to `surviving-route` — the `urgent`
   role's `when` clause is untrue here and should be rewritten to
   *"the failed destination was the email address and a permitted, deliverable number
   survives"*).
3. `a.confirm`: bind the channel to the route recorded at `c.route` rather than declaring three.
4. `orchestration.touches`: `t2` splits into two; `t3`'s `channelRoles` reduces to the
   recorded role.
5. `channels: ["in-app","sms","email"]` unchanged — all three stay backed.

### Display-only changes needed

- `c.route` stays drawn (it already is) and gains a fourth arm. Branch labels must stay short
  enough for the Family F budget: "Signed in" / "Email survives" / "Phone survives" /
  "Nothing left".
- Each prompt card carries exactly one channel, which the split delivers.

### Renderer changes needed

Same shared-message-node per-parent instancing as RET-24 / RET-28 if `a.confirm` stays one
node. Otherwise none.

---

## CON-300 · Unengaged Subscriber Sunset

**Purpose.** Decide whether continued marketing contact is still warranted for somebody who has
answered none of it — by asking them once, putting *fewer* beside *none* as a real answer, and
ending marketing contact where no answer ever comes.

**Current flow.**

```
Marketing contact unanswered across window
  → Does the record actually support the conclusion?
        ├ Nothing to read   → [record] → Exit no-action
        ├ Already answered  → Exit answered
        └ Supported → (send gate) → [The question]  (Email + In-app)
  → Wait (answer window)
  → Did the question get an answer?
        ├ Keep it      → Exit kept
        ├ Fewer instead → Handoff CON-283 Frequency Preference Update
        ├ Stop it      → Handoff CON-35 Permission Change Enforcement
        └ No answer → May the final notice go out?
              ├ No route left → [record marketing_suppression]
              └ Sendable → [Final notice]  (Email + In-app)
  → Wait (notice period) → What did the notice period end in?
        ├ Keep it / Fewer / Stop it → as above
        └ Ended by silence → [record marketing_suppression]
  → Can the ending be confirmed to the person?
        ├ Nothing to confirm on → Exit ended
        └ Confirm it → [Confirmation]  (Email) → Handoff CON-38 Communication Suppression
```

### Problems found

1. **Email + In-app on the question and on the final notice.** Everything else about CON-300 is
   exemplary; this is the one place the template shows.
2. Nothing else. This is the best-authored journey in the domain.

### The channel argument, which is CON-300's own

The question must go out **on the route whose silence is being read**. CON-300's trigger
evidence requires *"confirmation that those sends ran on a route whose engagement the company
can observe"*, and its `persistent → email` role says email is *"the default route, and the one
the unengaged window was measured on"*. Asking "shall we keep writing to you?" through an
in-app notice — to somebody selected precisely because they do not read what we send by
email — asks the question somewhere other than where the evidence came from, and would let a
product-active person be sunsetted on the strength of a channel they never used.

So: **Email for all three touches**, and the argument is derived from the journey's own subject
matter rather than from a channel preference. The preference centre stays the destination and
is reached by a link.

### CON-300 stays distinct from RET-32 — and its suppression is not weakened

The end state here is **marketing suppression**, not recovery. The two sides already state it
and both stay verbatim:

- CON-300's own `distinctFrom RET-32`; RET-32's `distinctFrom CON-300` — *"a person can be
  perfectly engaged with our messages and still lapsed, or still buying and entirely silent on
  everything we send."*
- `a.suppress` writes `marketing_suppression` and **leaves the person's permission record
  exactly as it was** — "silence is not an opt-out, and writing one here would put a decision
  on their record that they never made." Untouched.
- `s.sunset` is read by 27 promotional/lifecycle journeys, of which **eight are in this
  domain** (RET-30, RET-31, RET-32, RET-290, RET-292, RET-293, RET-294, RET-295). Nothing in
  this audit removes an `s.sunset` clause, changes a `contact.defaultPriority`, or adds a
  communication action to a journey that would need one (F4).
  `scripts/sunset-suppression-evidence.mjs` stays green in both directions.
- The three handoffs (CON-38 enforcement, CON-283 frequency, CON-35 permission) are unchanged.
  CON-300 decides; it never holds the suppression itself.

**No offer, no incentive, no argument for the relationship** appears on any of the three
touches, per the authored `mustNotClaim` lists. That is what makes it a sunset rather than a
second win-back, and it is why the reduced-cadence option sits *beside* stopping rather than
in front of it.

### Final orchestration

**Sequential with a mandatory terminal notice.** Two discretionary touches (the question, the
final notice) and one mandatory one (the confirmation, which is a notice about our own sending
and is therefore not rationed against the discretionary budget). That third, mandatory,
non-discretionary touch is unique in the domain.

### Final customer channels

**Email**, single, on all three touches.

### Customer touch count

**2 discretionary + 1 mandatory = 3.** This exceeds the brief's preferred 1–3 only at its
ceiling and the business reason is documented in the journey itself: a stated ending date that
passes without the ending happening *"teaches the person that nothing we say about their
preferences is load-bearing"*, so the confirmation is not optional.

### Final flow

As current, with the question and the final notice reduced to Email.

### State re-checks

Both waits re-read the engagement record, the preference record and the permission record from
the systems that own them. Every one of the four answers is re-read at both decision points, so
an answer arriving late still stops the sunset. Correct and untouched.

### Stop conditions

`marketing_engagement_recorded` · `frequency_preference_changed` · `permission_withdrawn` ·
a higher-precedence contactability journey taking the person (CON-272's repair, or a frequency
confirmation) · the notice period expiring, which is the only path to suppression.

### Ownership / handoff

Unchanged. **Lowest** in `contactability-question` — a contact repair is fixing a route that
broke and a frequency confirmation is answering a cadence the person chose, and both already
answer the question this journey would otherwise ask over the top of. CON-272 outranks it, as
stated on both sides.

### Canonical changes needed

1. `channels: ["email","in-app"]` → `["email"]`.
2. Remove the `in-session → in-app` role; `fallback: "none"`.
3. `a.ask.channelRoles` and `a.final.channelRoles`: `["persistent","in-session"]` →
   `["persistent"]`. `a.confirm-end` is already `["persistent"]`.

### Display-only changes needed

**None — and specifically, do not collapse `c.sendable2`** (F2). Its short arm goes to
`a.suppress`, which is the journey's most consequential step; it is a business decision, not a
send-path gate, and the current renderer is right to draw it.

### Renderer changes needed

None.

---

## Summary table

| ID | before pattern | after pattern | channels | touches | biggest change |
|---|---|---|---|---|---|
| **RET-24** | routing only — **no customer channel** | conditional routing → single touch → re-check → escalation | Email · In-app (+ `task` internal) | 1 | Adds the corpus's missing retention intervention; the channel-rule exception can be deleted |
| RET-26 | single, Email+Push | **single** | Email | 1 | Push removed; acknowledgement is a document, not a nudge |
| RET-28 | two dual-channel touches | **conditional routing** on the declaration surface | In-app · Email | 1–2 | The routing rule its own `channelStrategy` states is finally drawn; `c.ask` deleted |
| RET-30 | event-or-timeout, Email+In-app follow-up | **event-or-timeout** | Email | 0–1 | `a.verify` regains its card; now fed by a real delivery from RET-24 |
| RET-31 | 2 touches, 3 channels each | **event-or-timeout anchored on `expected_depletion_at`** | Email | 2 | Push/in-app removed; the attribute anchoring is what makes it not-a-recommendation |
| RET-32 | 2 touches, Email+Push, no-op fork | **sequential**, second touch on business config | Email | 1–2 | `c.basis` deleted (a fork whose arms did the same thing) |
| RET-290 | 2 touches, 2–3 channels | **sequential** behind a settle wait | Email | 1–2 | Channels reduced; FUL-301 boundary explicitly preserved in all three places it lives |
| RET-292 | single, 3 channels | **single** | Email | 1 | `Trigger → Decision → Email → Exit`, the domain's minimal correct journey |
| RET-293 | single, 3 channels + cascade | **single**, then measurement only | Email | 1 | Cascade removed; the only trio member with no second touch |
| RET-294 | 2 touches, 3+2 channels | **sequential behind a maturation wait** | Email | 1–2 | Channels reduced; maturation wait is its distinguishing anchor |
| RET-295 | single, 3 channels, drawn send gate | **single** | Email | 1 | Send gate folded into `c.date` (copies RET-292); mirrors RET-292 by design |
| **CON-272** | routing decision, dual/triple-channel arms | **conditional routing on reachability** — the domain's one true fallback | In-app · Email · SMS | 2 | Off-product arm split by which route actually survives |
| CON-300 | 3 touches, 2 of them dual-channel | **sequential + mandatory terminal notice** | Email | 2 + 1 mandatory | Asks on the route whose silence it is reading; suppression untouched |

**Pattern distribution — no convergence.**

| pattern | journeys |
|---|---|
| single | RET-26 · RET-292 · RET-293 · RET-295 (4) |
| conditional routing | RET-24 · RET-28 · CON-272 (3) |
| sequential | RET-32 · RET-290 · RET-294 · CON-300 (4) |
| event-or-timeout | RET-30 · RET-31 (2) |
| parallel | none — nothing in this domain needs two channels at once |
| fallback | CON-272 only, and only because the desired route is the one that broke |

**Recovery cluster** (RET-26 single · RET-28 conditional routing · RET-30 event-or-timeout ·
RET-32 sequential · CON-300 sequential-plus-mandatory-notice · RET-24 conditional-routing-plus-
escalation) — six journeys, five distinct shapes, touch counts 1 / 1–2 / 0–1 / 1–2 / 3 / 1.
**Not the same shape.**

**Recommendation trio** (RET-31 attribute-anchored countdown, 2 touches · RET-293 one shot then
measure, 1 touch · RET-294 maturation then offer then reminder, 1–2 touches) — three different
evidence sources, three different claims, three different topologies.
**Not the same shape.**

---

## The three calls I am least sure about

**1. Removing push from the domain entirely (F1).** Eight journeys lose push in one stroke on
the grounds that the `low-friction` role is boilerplate repeated verbatim and that no journey
reads a device-registration state. The rule is right; the sweep is broad. The single case I
would most expect to be argued back is **RET-31's second touch** — it fires after the estimated
depletion, it is short, and its reorder route is one step, which is the brief's own description
of push. If anyone records a push-token state that a condition can branch on, that touch should
become a genuine `Push if reachable → Email otherwise`. I did not build it because the signal
does not exist in the data today, and the brief says to prefer the simpler pattern and say so.

**2. Moving `c.human` after the customer check-in in RET-24.** The brief directs that the
escalation follow the customer attempt, and the resulting journey is better — a person's time
is spent on a relationship that did not answer. But for the strongest evidence on the largest
relationship, person-first is arguably still correct, and my design sends an email or an in-app
prompt first in every case. I mitigated it by keeping the contention gate *in front* of the
check-in (so an account a person already owns is never messaged) and by re-reading evidence
after the window, but somebody who knows the business may want a third arm at `c.signal-class`:
*evidence strong enough that a person goes first, with no automated touch at all.* I did not add
it because RET-24's own data gives no threshold that would separate that case from `c.human`'s.

**3. Folding RET-295's send gate into `c.date` rather than teaching the collapser to handle a
shared bookkeeping hop.** This fixes the visible inconsistency with RET-292 at the data layer
and requires no renderer change, which is the safer trade. But it is a canonical edit made for
a display reason, which is exactly what Phase 2.1's rule warns against, and the same shape
(a send gate whose short arm shares `a.record-no-action` with a business branch) very likely
exists in other domains. If two or three other audits report it, the generic fix — a shared hop
may be hidden once *every* parent that reaches it has collapsed, with the business parent
keeping its own recording hop — is the better answer and this edit should be reverted in favour
of it.
