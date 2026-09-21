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
