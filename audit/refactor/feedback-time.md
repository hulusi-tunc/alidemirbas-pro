# Phase 1 audit — Feedback & Time (9 public journeys)

`FBK-41` `FBK-42` `FBK-43` `FBK-49` · `TIM-61` `TIM-63` `TIM-268` `TIM-274` `TIM-281`

Written against `audit/public-journeys-current-state.json` (canonical + rendered display state,
read per journey), cross-read with `audit/51-journey-design-matrix.md` (rows and decisions 8, 9),
`audit/DECISIONS-PENDING.md` (A4, A9, B5), `audit/channel-orchestration-map.md` and
`audit/patterns.md`. Every count below is read from the export, not estimated.

## Headline

This cluster is in better shape than the brief's worst case. **It is not nine copies of one
shape**: TIM-61 is a looping event-or-timeout, TIM-281 is a four-way conditional route, TIM-274 is
a justified sequence across a fixed window, FBK-43 is a seven-way classifier, FBK-41/42 are one-ask
journeys arbitrated against each other. Only **two of the nine need a shape change** (FBK-41,
FBK-49). The rest need channel-role, cap, stop-condition and reciprocity corrections.

Three defects recur across the cluster and are worth stating once:

1. **Caps count plan entries, not path touches.** `localCap` is set to "the plan's own length" in
   FBK-42, FBK-49, TIM-268 and TIM-274, where the plan's entries are mutually exclusive branches or
   include an internal work item. Four of my nine caps are wrong by this rule; three are too high
   (FBK-42 2→1, FBK-49 counts a `task`, TIM-268 3→2) and one (TIM-274) is right by accident.
2. **`["persistent","urgent"]` is pasted onto every touch in a journey rather than onto the touch
   that earns it.** TIM-268 and TIM-274 both put SMS on their *confirmations*. A "you're all set"
   by SMS is exactly the generic escalation the brief forbids, and it devalues the one message in
   the cluster that genuinely earns SMS (TIM-274's last call).
3. **Family A absorbs the "establish the facts" step in five of these nine journeys.**
   `a.evaluate` (FBK-42), `a.retrieve` (FBK-49), `a.reread` and `a.actor` (TIM-63), `a.establish`
   (TIM-281) all declare `writes: []`, so `absorbableBookkeeping()` hides them. Each is the step the
   journey's own guardrails call load-bearing ("the route is worked out before anything is said").
   The reader is not misled — the following question card represents them — but the fix is
   per-journey and honest: **declare the state these actions actually produce.** Named per journey
   below.

---

## FBK-41 · Feedback Request

**Purpose.** Ask about one completed experience, once, at a moment where asking is appropriate —
and treat the gap between asking and hearing back as a real state.

**Current flow** (14 canonical / 14 display, nothing absorbed)

```
potential_feedback_moment
 → Is the experience complete from the person's side?
      Not yet → Wait until experience_completed (timeout: completion_horizon, required)
                    timeout → Exit: never completed, nothing asked
                    event   ↘
      Complete ↘
 → Is there an unresolved issue in this context?   Unresolved → Exit: deferred
 → Has feedback been collected for this context recently?  Already → Exit: duplicate
 → Appropriate moment, within the ask budget?      Not now  → Exit: eligible, not asked
      Appropriate ↓
 → Request feedback   [in-app · email · push on one card]
 → Wait until feedback_submitted (3–7 days, example-only)
      event   → Exit: received (FBK-43 owns what it means)
      timeout → Exit: asked, no response — recorded as no signal
```

**Problems found**

- **Three consecutive eligibility gates, six cards, all ending in "nothing was sent."** Only
  `c.complete` changes the customer's visible route (it opens a wait). `c.open-issue`, `c.recent`
  and `c.moment` are a gauntlet: each is a two-branch question whose short arm is a terminal
  no-send. Family C's `collapsibleGates()` does not fire on them because their short arms exit
  directly instead of passing through a bookkeeping hop — correct by that rule, wrong for the
  reader.
- **The one message card carries three channels and no visible rule.** `channelStrategy.roles`
  states three genuinely different situations (`in-session` = the experience ended in-product and
  they are still there; `persistent` = it ended elsewhere; `low-friction` = a valid token and a
  one-step answer). On the canvas that is one Message card with three badges, which reads as the
  Primary/Fallback ladder the refactor exists to remove.
- `x.received` names FBK-43 in its text but there is no handoff and no link. Correct canonically
  (FBK-43 has its own trigger and most asks never produce one) but the reader cannot follow it.
- No SMS. **Correct** — see below.

**Final orchestration.** **Conditional routing on where the experience ended**, with a **legitimate
same-role fallback** (in-app → push) and **event-or-timeout** on the response window. Not
segment-based: nothing in this journey's data segments the *person*, only the *situation*. Not
sequential: there is one ask and `s.frequency` forbids a chase.

The in-app → push fallback is legitimate under the brief's own definition: the desired channel is
"reach them where the experience happened", and when the session has ended that channel genuinely
cannot be used, so push substitutes for it. Email is *not* a fallback here — it is the route for a
different situation (the experience ended outside the product at all).

**Final customer channels.** `in_app` · `push` (same-role substitute for in-app) · `email`.
**No SMS**: a satisfaction ask has no deadline, no consequence and nothing the person must do by a
date. SMS here would be interruption without stake.

**Customer touch count.** **1.**

**Final flow**

```
Potential feedback moment
 → Is the experience complete from the person's side?
      Not yet → Wait until experience_completed (completion_horizon) → timeout → Exit: never completed
      Complete ↓
 → Is asking appropriate now?            [ONE decision, three named no-send reasons]
      An unresolved issue is open here  → Exit: deferred — resolution owns this first
      Already asked about this context  → Exit: duplicate
      The ask budget is spent           → Exit: eligible, not asked
      Appropriate ↓
 → Did the experience end in the product?
      Yes, and they are still there → Ask (In-app)
      Yes, but the session ended    → Ask (Push)        [same-role substitute]
      No                            → Ask (Email)
 → Wait until feedback_submitted (3–7 days)
      event   → Exit: received — FBK-43 owns what it means
      timeout → Exit: asked, no response — recorded as no signal
```

**State re-checks.** The experience is re-read when `w.completion` fires (`recheck` already says
so). One touch, so nothing further is required.

**Stop conditions.** `feedback_submitted`; an unresolved issue appearing in the context; the
standing marketing suppression `s.sunset` (CON-300 / CON-38); FBK-42 taking the `outbound-ask` slot.

**Ownership / handoff.** Loses the `outbound-ask` group to FBK-42 at the same moment
(`onLoss: suppressed`, re-opens independently at its next moment). FBK-43 owns whatever comes
back. No handoff node, correctly.

**Canonical changes needed** (`src/canonical/feedback.ts`)

1. Merge `c.open-issue`, `c.recent`, `c.moment` into one condition `c.appropriate` with four
   branches. Keep `x.deferred`, `x.duplicate`, `x.not-now` exactly as they are — their `reEntry`
   semantics differ materially and must not be merged. Net −2 cards.
2. Split `a.request` into `a.request-in-session` (`in-app`, with `push` as the same-role substitute)
   and `a.request-persistent` (`email`), behind a new condition `c.where` reading
   "Did the experience end in the product?". Net +2 cards, and the channel logic becomes visible
   instead of being three badges on one card.
3. Leave `feedback_request.touches` at **1** — still correct after the split, because the branches
   are mutually exclusive. Update `applicableWhen` to say so.

**Display-only changes needed.** None beyond what (1) and (2) produce.

**Renderer changes needed.** The exit `x.received` should be able to name FBK-43 as text the reader
recognises as another journey without being a link — the same affordance Family D's open
P-HANDOFF-02 item asks for on archived handoffs.

---

## FBK-42 · Advocacy Request

**Purpose.** Ask someone to vouch for us only where the relationship has earned it, and keep
publishing what they give us a separate permission.

**Current flow** (15 canonical / 14 display; `a.evaluate` absorbed)

```
potential_advocacy_opportunity
 → Is there an open negative issue anywhere in this relationship?  Something open → Exit: suppressed
 → [Weigh the accumulated positive evidence]                        (absorbed)
 → Is the evidence sufficient to justify asking?   Not yet → Exit: not yet eligible
 → What size of request does this evidence support?
      Low commitment  → Light ask   [email · in-app · push]
      High commitment → Heavy ask   [email · in-app]  — never push
 → Wait until advocacy_action_taken | request_declined (window required, no default)
      timeout → Exit: no response; nothing inferred
      event   → What came back?
                  Contributed, for public reuse → Handoff: CON-31 Permission Validation
                  Contributed, internal only    → Exit: contributed
                  Declined                      → Exit: declined; cooldown in force
```

**Problems found**

- **`localCap` is 2; only one ask is ever sent.** `a.ask-light` and `a.ask-heavy` are the two arms
  of `c.type` and can never both fire. The matrix's Touches cell already reads "1 (light ask or
  heavy ask, never both)". The cap is set to "the plan's own length" — the same defect class as
  B5, applied to mutually exclusive branches rather than to an internal work item.
- **The light ask lists `persistent` first.** A one-tap rating's whole point is the low-friction
  route; leading with email makes the light ask indistinguishable from the heavy one and reproduces
  the corpus's default ladder. The heavy ask's `persistent` → `in-session`, never push, is right
  and should not be touched.
- **The feedback → advocacy line can still read as one drip — through FBK-43, not through FBK-41.**
  FBK-41 and FBK-42 are properly arbitrated (`outbound-ask`, FBK-42 wins, loser recorded as
  not-now). But `FBK-43.a.acknowledge-positive` sends a customer message ("thank you for saying
  that"), then `c.contribution → c.eligible → h.advocacy` hands straight to FBK-42, whose
  eligibility does not read how recently an acknowledgement about the same record went out. FBK-43
  is `pressureClass: service`, so its acknowledgement does not spend the `outbound-ask` budget
  either. **Two messages about the same compliment can land back to back.**
- `a.evaluate` is absorbed by Family A (writes nothing, one in, one out). It is the journey's
  thesis — *"the set is what matters, not the most recent item in it"*. `c.sufficient` carries it
  and lists it under *Represented canonical steps*, so nothing is lost, but see the cluster note.

**Final orchestration.** **Segment-based** — the size of the ask is set by the strength of
accumulated evidence, which is a real segment that changes both the message and the channel class —
plus **event-or-timeout** on the response window. Unchanged; this journey's shape is right.

**Final customer channels.** Light ask: `in_app` (active, one tap) → `push` (same-role substitute
where the session has ended but a token exists) → `email`. Heavy ask: `email`, `in_app`, **never
push** (already encoded; keep). **No SMS** — a favour has no deadline, and interrupting someone to
ask for one is how a supporter becomes a complaint.

**Customer touch count.** **1.**

**Final flow.** Unchanged from the current flow above, with the light ask's role order reversed and
one added eligibility clause.

**State re-checks.** `c.negative` at entry (and it must stay drawn — `s.g6` says an open negative
issue suppresses this *whatever the positive evidence says*, which is a business rule, not a gate).
New: at instance open, read whether an acknowledgement about the same feedback record was sent
inside the ask separation window.

**Stop conditions.** `advocacy_action_taken`; `request_declined`; an open negative issue appearing;
`s.sunset`.

**Ownership / handoff.** Wins `outbound-ask` over FBK-41. **`h.permission → CON-31` must stay
drawn and must not be collapsed** — contributing is not permission to publish, the contribution is
held unpublished until CON-31 records the scope, and that boundary is the journey's whole reason to
exist. Guard check G2 covers it; keep it that way.

**Canonical changes needed** (`src/canonical/feedback.ts`)

1. `advocacy_eligibility.touches` default **2 → 1**; rule: "One ask per opportunity — light or
   heavy, never both."
2. `a.ask-light.channelRoles` / `channelStrategy` order → `in-session`, `low-friction`,
   `persistent`.
3. Add eligibility clause: *"no acknowledgement about the same feedback record was sent inside the
   ask separation window"*, and have `FBK-43.h.advocacy` carry the acknowledgement's send time.
4. `a.evaluate` should declare the state it produces (`writes: [{ field: "relationship_evidence",
   mode: "set" }]`) so it keeps its own card.
5. Optional: `distinctFrom` names only FBK-43. Adding FBK-41 is documentation the group already
   enforces.

**Display-only changes needed.** None — (4) is a canonical declaration that changes the display as
a consequence.

**Renderer changes needed.** None.

---

## FBK-43 · Feedback Follow-Up

**Purpose.** Get one piece of feedback to the process that can act on it, and keep the record open
until anything promised in return has actually happened.

**Current flow** (34 canonical / 32 display — the largest canvas in this cluster; 6 shared-terminal
instances; `a.persist`, `a.classify`, `a.attach`, `a.assess`, `a.product` absorbed)

```
feedback_received → [persist verbatim] → [classify: 7 values]
 → What does this mean operationally?
    PRAISE              → [store as dated evidence] → Is recognition appropriate?
                              Worth it → Acknowledge the specific praise  [email · in-app]
                              Not      ↘
                          → Did they volunteer something reusable?
                              Yes → Handoff: external advocacy-contribution
                              No  → Does the relationship meet advocacy eligibility?
                                      Eligible → Handoff: FBK-42
                                      Not      → Exit: recorded as evidence
    SERVICE_ISSUE /     → Does an open case already cover this?
    COMPLAINT                Yes → [attach] → Exit: attached
                             No  → [assess] → Is there an actionable operational issue?
                                      Not actionable → Acknowledge  [email · in-app] → Exit: heard
                                      Actionable     → Escalation criteria?
                                                          Severe   → [mark severity]  ↘
                                                          Ordinary → Handoff: FBK-46
    SUPPORT_NEED        → [create work item]  ← NOTHING IS SAID TO THE PERSON
                          → Wait until work_item_outcome_recorded (the owning SLA, required)
                                timeout → Exit: obligation outstanding; loop not closed
                                event   ↘
    PRODUCT_FEEDBACK    → [pass to product intake] ↘
                          → Was a follow-up promised?
                                Nothing promised → Exit: loop closed
                                Promised → Wait until promised_followup_delivered (7–14d)
                                              event   → Exit: loop closed
                                              timeout → Handoff: DEC-181
    GENERAL_COMMENT     → Is an acknowledgement appropriate? → Acknowledge / Exit: stored
    UNKNOWN             → Handoff: DEC-181
```

**Problems found**

- **The touch plan counts internal work as touches.** `orchestration.touches` has **five** entries;
  two (`t-obligation` → `a.obligation`, `t-escalate` → `a.escalate`) carry
  `channelRoles: ["human"]` and are internal routing. Any counter that reads `touches.length`
  reports FBK-43 as a 5-touch journey. **The `localCap` is already correct** — `feedback.touches`
  is 1, "one acknowledgement per feedback record" — so the brief's framing needs one correction:
  it is FBK-49, not FBK-43, whose *cap* counts the `task`. FBK-43's defect is in the *plan*.
  Applying B5's principle to both: **a touch plan, like a cap, counts customer-facing touches
  only.**
- **`task` must stay in `channels`.** It backs `a.obligation` and `a.escalate`
  (`execution: "human"`), and `validate:canonical` errors in both directions if a declared channel
  has no backing action. `publicChannels()` already filters it from public badges. Do not delete it,
  and do not present it as a customer channel anywhere.
- **The SUPPORT_NEED branch says nothing to the person who asked for help.** It is the branch most
  likely to belong to somebody who is waiting on us, and it is the only classification that reaches
  a message-free limb: work item → SLA wait → (promise check) → exit. REM-305 *Support Request
  Acknowledgement* exists for exactly this and triggers on `support_request_received`, which is
  what `a.obligation`'s work item raises. Nothing in FBK-43's data says so, so the gap reads as an
  omission rather than as deference.
- **`distinctFrom` is empty** on a journey that FBK-41, FBK-42 and REM-305 all name in theirs.
- **`w.followup` invents a deadline the journey says it never invents.** `feedback.obligation_sla`
  is correctly `required: true` ("the owning process's own SLA"), but `feedback.promise_window`
  carries an `example-only` 7–14 day default. The promise has its own date
  (`relativeTo: "attribute"` is already set); the default should go.
- `c.route`'s seven branches and the three mutually exclusive acknowledgements are the journey's
  value. **They stay drawn.** So do `c.existing` (do not open a second case) and `c.actionable`
  (do not manufacture a fault) — both are business decisions, not gates.

**Final orchestration.** **Conditional routing** — a seven-way classification that decides what is
said, to whom, and whether anything is said at all — plus **event-or-timeout** twice (the owning
process's SLA, and the promise window). Explicitly **not sequential**: no path sends two
acknowledgements.

**Final customer channels.** `email` (the default — they wrote to us) · `in_app` (where the feedback
was given in-product and they are still there). **No SMS, no push**: an acknowledgement is never
urgent and asks the person to do nothing. `task` stays declared, filtered at the publishing
boundary.

**Customer touch count.** **1** — exactly one acknowledgement per record, on whichever route it
took. Up to two internal work items, which are not touches.

**Final flow.** As above, with one change: `a.obligation` states that the work item it raises is
acknowledged to the requester by REM-305, not from here.

**State re-checks.** `c.existing` before opening a case; `c.actionable` before acknowledging a
negative; `c.promise` after the work item resolves. New: before `h.advocacy` fires, carry whether
and when an acknowledgement about this record was sent.

**Stop conditions.** `work_item_outcome_recorded` with nothing promised → `x.closed`; an open case
already covering it → `x.attached`; `UNKNOWN` → `h.triage`; a promise broken → `h.promise`
(escalates rather than expiring — correct, keep).

**Ownership / handoff.** FBK-46 (actionable issue, suppresses satisfaction and retention outreach
about the same experience), FBK-42 (advocacy eligibility), DEC-181 (unclassifiable, broken
promise), `external:advocacy-contribution`. REM-305 owns acknowledging a support request.

**Canonical changes needed** (`src/canonical/feedback.ts`)

1. Exclude `channelRoles: ["human"]` entries from the touch plan's customer count — either drop
   `t-obligation` / `t-escalate` from `orchestration.touches` (the action nodes already carry
   `execution: "human"`, which is what backs `task`), or mark them so every counter excludes them.
   Whichever is chosen must be applied identically to FBK-49 and ACT-13.
2. `a.obligation`: state that the requester is acknowledged by REM-305 on
   `support_request_received`, and carry the feedback record id so the two records stay linked.
3. Populate `distinctFrom`: FBK-41 (this begins only if something comes back), FBK-42 (this reacts
   to one signal; that weighs the accumulated relationship), REM-305 (this starts from an account
   of an experience; that from a request made of us) — the reciprocals of text those three already
   carry.
4. `feedback.promise_window`: drop the `example-only` default, make it `required: true` against
   `promised_followup_at`.

**Display-only changes needed.** 32 cards is the largest canvas in this set and the loop-closure
limb (`a.obligation` → `w.outcome` → `x.open` → `c.promise` → `w.followup` → `h.promise` →
`x.closed`, plus `a.product`) is the part a reader has least context for. Nothing here should be
absorbed — it is all real business logic.

**Renderer changes needed.** A visual grouping affordance ("routing" vs "loop closure") would help
this one canvas, and the corpus has no such primitive today. Stated as an item, not proposed as a
fix — adding one for a single journey would fail the Phase 2.1 generic-only rule.

---

## FBK-49 · Missing Information Reminder

**Purpose.** Treat a genuinely blocking data gap as a named dependency — the exact item, and the
process that cannot proceed without it — rather than as wanting to know more about someone.

**Current flow** (15 canonical / 12 display; `a.identify`, `a.retrieve`, `a.persist` absorbed)

```
required_data_missing_and_blocking
 → [identify the exact item and the process it blocks]        (absorbed)
 → Can an authoritative source supply this without asking anyone?
      We already have it → [retrieve and reconcile]  (absorbed) ↘
      It has to be provided ↓
 → Who can actually supply it?
      The customer  → Request it  [email · in-app]
      Someone internal → Raise an internal work item   [task — NOT a customer channel]
 → Wait until requested_information_received (window required, sized to what is blocked)
      timeout → Given how critical the blocked process is, what now?
                   Critical → Handoff: external human-in-the-loop (carries what was tried)
                   Alternate route → Exit: proceeding by another path
                   Not worth pursuing → Exit: stays blocked and says so
      event   → Is what we now have valid?
                   Valid   → [persist] (absorbed) → Exit: requirement satisfied
                   Invalid → (straight to the criticality question — SILENTLY)
```

**Problems found**

- **The cap counts the internal work item.** `missing_critical.touches` = 2, rule "the budget is
  the plan's own length", where the plan is `[a.request (customer), a.request-internal (human)]`.
  Only one of the two ever reaches a customer, and they are mutually exclusive branches of
  `c.provider` besides. This is **decision 8 / B5 verbatim**, and B5's recommendation (a) —
  *"a cap that counts internal work items is not a contact cap"* — is applied below.
- **What the customer sent can be rejected without anybody telling them.** `c.valid`'s
  "Invalid or incomplete" arm goes straight to `c.criticality`, which can reach `x.abandoned`
  ("the blocked process stays blocked and says so" — says so to whom?). A person who was asked for
  a document, sent one, and hears nothing has no way to know it was refused. This is the most
  common real failure of a document-request flow and the branch already exists in the graph; only
  the message is missing.
- **`a.retrieve` is absorbed** although it is the entire content of the "we already have it"
  branch. It writes nothing, so Family A hides it, leaving `c.authoritative → c.valid` with an
  invisible step in between.
- **`w.received.until` listens for one event only.** If the blocked process is cancelled, or the
  requirement is satisfied by another route, the instance waits out its window and then escalates a
  dependency nobody needs. `dependency_resolved` and `process_cancelled` both exist in
  `src/canonical/events.ts` (the former's registry `entity` reads "the fulfilment request", which
  an implementer should check before reusing it).
- **`competition: "none"`** while TIM-268's eligibility names FBK-49 as an owner it defers to. See
  the TIM-268 section.

**Final orchestration.** **Conditional routing** — who actually holds the missing item decides who
is asked and on which route, and that is the journey's one real split — plus **event-or-timeout**
bounded by what the blocked process can afford. **Not fallback**: the internal work item is not a
substitute for a failed customer email; it is a different party. **Not sequential**: the second
customer message exists only where the first produced something we had to refuse.

**Final customer channels.** `email` (a request for a document must survive until they can act on
it) · `in_app` (where they are in the product). **No SMS.** There is no `due_at` on this journey, no
`urgent_horizon` attribute, and no recorded consequence with a date — the wait is "as long as the
blocked process can afford", which is a business window the customer cannot see. Adding SMS here
would be the generic escalation the brief forbids, and there is no evidence in the data for it.
`task` stays declared and stays filtered from public badges.

**Customer touch count.** **2** — one request, and one rejection notice only where what arrived was
received and refused. The second touch is earned by a genuine state change: we now know the item
arrived and does not satisfy the requirement, which is information the person cannot have.

**Final flow**

```
Required data missing and blocking
 → Can an authoritative source supply it?
      We hold it → Retrieve and reconcile → (join the validity check)
      It must be provided ↓
 → Who holds it?
      The customer     → Request it, naming what it unblocks   [Email · In-app]
      Someone internal → Raise an internal work item            [not a customer touch]
 → Wait until requested_information_received
        (or dependency_resolved / process_cancelled — the requirement stopped mattering)
      event → Is what we now have valid?
                 Valid   → Persist → Exit: requirement satisfied, the process resumes
                 Invalid → Tell them what was wrong and re-request  [Email · In-app]   ← 2nd touch
                              → back to the same wait, ONCE (cap 2 enforces it)
      timeout → How critical is the blocked process?
                 Critical           → Handoff: human-in-the-loop (carries what was already tried)
                 Alternate route    → Exit: proceeding another way
                 Not worth pursuing → Exit: stays blocked and says so
```

**State re-checks.** `c.authoritative` before asking anyone at all; `c.valid` on arrival; and a
re-read before the re-request that the item is still required — the blocked process may have been
cancelled while we waited.

**Stop conditions.** `requested_information_received` **and** valid; the requirement being met by
another route (`dependency_resolved`); the blocked process being cancelled (`process_cancelled`).

**Ownership / handoff.** `external:human-in-the-loop-lifecycle` on escalation, carrying what was
already tried so nobody repeats the request that failed. ACT-13 owns the same shape scoped to
activation (`distinctFrom` already states it). TIM-268 defers to FBK-49 for a blocking data item —
one-sided today.

**Canonical changes needed** (`src/canonical/feedback.ts`)

1. `missing_critical.touches` → **2 customer touches**, rule rewritten: *"One request to whoever
   holds the item, and one re-request only where what arrived was received and refused. An internal
   work item is not a touch."* This applies B5 (a) and fixes the number's meaning; the number
   happens to stay 2, for a different and honest reason.
2. Add `a.reject` (`execution: "communication"`, `email` + `in-app`) on `c.valid`'s
   "Invalid or incomplete" arm, naming what was wrong, and route it back to `w.received` once.
3. `a.retrieve`: declare the state it produces (`writes: [{ field: "requirement_value", mode:
   "set" }]`) so it keeps its card. `a.identify` and `a.persist` write only
   `blocking_requirement_log` and are correctly absorbed.
4. Add `dependency_resolved` (and/or `process_cancelled`) to `w.received.until`.
5. Join `obligation-reminder` at scope `communication-purpose` with a one-line precedence
   ("above the generic obligation reminder — this journey knows which process stalls without the
   item; TIM-268 can only name the item"), `onLoss: suppressed`. This is the reciprocal of a rule
   TIM-268 already states.

**Display-only changes needed.** None beyond what (2) and (3) produce.

**Renderer changes needed.** None.

---

## TIM-61 · Deadline Tracking

**Purpose.** Let a deadline govern the **state** of one obligation, rather than schedule messages
around a date.

**Current flow** (14 canonical / 12 display; `a.store`, `a.satisfied` absorbed)

```
authoritative_deadline_assigned
 → [store the deadline, its timezone, its owner and what would count as completion]  (absorbed)
 → Wait until obligation_satisfied | pre_deadline_threshold_reached
        (timeout: the deadline itself — attribute-bound, required)
      event → Which happened?
                 Completed → [mark satisfied, invalidate every queued reminder]  (absorbed)
                              → Exit: satisfied before its deadline
                 Threshold → Is a pre-deadline reminder useful here, and does policy define one?
                                Nothing to send → back to the wait
                                Send it → Reminder  [email · push · sms · whatsapp]
                                              → back to the wait
      timeout → The deadline passed with the obligation open — what does the rule say?
                 OVERDUE     → Handoff: TIM-62
                 ESCALATED   → Handoff: OWN-55
                 EXPIRED     → Handoff: TIM-64
                 FAILED      → Exit: failed at its deadline, as the rule defines
                 STILL_VALID → Exit: deadline passed, obligation unchanged
```

**Event-or-timeout verdict: GENUINE, and the best instance of the shape in the corpus.** One wait
bounded by an absolute attribute (`due_at`), listening for both "it is done" and "a threshold
arrived", with a loop back for each further threshold and five genuinely different endings on the
timeout arm. This is the model the rest of the TIM cluster should be measured against, and nothing
about its structure should change.

**Problems found**

- **Four channels on one message card with no visible rule** — the strongest Primary/Fallback smell
  in my nine. The roles are real (`persistent` email; `low-friction` push where the action is one
  step; `urgent` sms/whatsapp inside `urgent_horizon` with recorded permission), but on the canvas
  they are four badges.
- **Two urgent channels with an identical `when`.** SMS and WhatsApp carry the same condition and
  nothing in the data distinguishes them. `audit/channel-orchestration-map.md` records the intent —
  WhatsApp is "an urgent-role alternative to SMS, never a value upgrade" — but the `when` clause
  does not say it.
- **The loop has no visible bound.** `deadline_tracking.touches` is deliberately `required: true`
  with no default ("the thresholds are policy, and none is added to make a schedule") — which is
  right — but a reader sees `Reminder → Wait → Reminder` and cannot tell whether that is two
  messages or ten.
- Three of the five endings hand off to non-public journeys (TIM-62, OWN-55, TIM-64), so they render
  as text and not as links, with no stated reason. Family D's open item.

**Final orchestration.** **Event-or-timeout (looping)** as the primary shape, with **conditional
routing** on the urgent horizon made visible. One touch per policy-defined threshold; not a
sequence, because the repeats are the customer's own policy thresholds rather than a cascade we
designed.

**Final customer channels.** `email` (default) · `push` (where the action is one step and a token
exists) · `sms` (**only** where `due_at` is inside `urgent_horizon` **and** SMS permission is
recorded) · `whatsapp` (same-role substitute for SMS only).

**SMS verdict: right.** A governing deadline with a policy-defined consequence is the textbook case
— a real date, a real thing to do, a real outcome for not doing it. The gate is already correct;
what is missing is that the gate is invisible.

**Customer touch count.** **1 per policy-defined threshold.** The corpus cannot state a number
because the thresholds belong to the customer's policy, and it should keep saying so rather than
inventing a cap.

**Final flow**

```
Authoritative deadline assigned
 → [store the deadline and what would satisfy it]
 → Wait until obligation_satisfied | pre_deadline_threshold_reached  (bounded by the deadline)
      event → Which happened?
                 Completed → Invalidate every queued reminder → Exit: satisfied
                 Threshold → Does policy define a reminder here, and can they still act on it?
                                No  → back to the wait
                                Yes ↓
                           → Is the deadline inside the urgent horizon, with permission recorded?
                                Yes → Reminder (SMS)        [WhatsApp where that is their channel]
                                No, one-step action → Reminder (Push)
                                Otherwise → Reminder (Email)
                           → back to the wait   [bounded by deadline_tracking.touches — policy]
      timeout → What does the governing rule say? → OVERDUE / ESCALATED / EXPIRED / FAILED / STILL_VALID
```

**State re-checks.** The wait itself re-reads: `obligation_satisfied` invalidates every queued
reminder through `a.satisfied`'s `suppressed_sends` write. **That is the single best stop-condition
implementation in this cluster** and the pattern TIM-274 should copy.

**Stop conditions.** `obligation_satisfied` at any point — and every queued reminder and escalation
is invalidated with it. The deadline itself, absolutely.

**Ownership / handoff.** Holds `obligation_reminder` **above** TIM-268: a governing deadline
outranks a bare due date. Both sides are declared with `onLoss: suppressed`. Settled — do not
reopen.

**Canonical changes needed** (`src/canonical/time.ts`)

1. Split the urgent branch out of `a.remind` into a visible condition — "Is the deadline inside the
   urgent horizon, with permission recorded?" — with `a.remind-urgent` (`sms`, `whatsapp`) and
   `a.remind` (`email`, `push`). This is the brief's own worked example of a condition that
   genuinely changes the visible route.
2. Give WhatsApp its own `when`: *"where WhatsApp is the recorded messaging channel for this person
   and SMS is not"* — making it a genuine same-role substitute rather than a second urgent channel.
3. `a.store` writes `deadline_log` only and is correctly absorbed. `a.satisfied` writes
   `deadline_log` + `suppressed_sends` — both journal-shaped, so it is absorbed too, and that is
   the one absorption in this journey I would reverse: invalidating every queued reminder is a
   visible consequence, not bookkeeping.

**Display-only changes needed.** The loop edge back to `w.tracking` should carry the cap key
`deadline_tracking.touches`, so a bounded loop does not read as an unbounded one.

**Renderer changes needed.** The three non-public handoff cards should say why the target is not a
link (Family D, P-HANDOFF-02 — already an open corpus-wide item).

---

## TIM-63 · Expiry Reminder

**Purpose.** Use the window before an expiry only where acting inside it could actually change what
happens — and where it cannot, either say plainly what will happen, or say nothing.

**Current flow** (14 canonical / 11 display; `a.reread`, `a.actor`, `a.invalidate` absorbed)

```
pre_expiry_window_entered
 → [re-read the entity's current state]  (absorbed)
 → Has it already been renewed, replaced or completed?   Already → Exit: nothing is expiring
 → Is an action available that would materially change the outcome?
      Action available → [establish who must act and what the action is] (absorbed)
                          → Action prompt  [email · in-app · sms · push]
      Nothing can be done → Is telling anyone useful even so?
                               Worth saying → Informational notice  [EMAIL ONLY]
                               Not worth it → Exit: nothing to do, nothing worth saying
 → Wait until renewed | completion_recorded | replaced   (timeout: expires_at, attribute-bound)
      event   → [invalidate the old validity's queued actions] (absorbed)
                 → Handoff: external renewal-lifecycle
      timeout → Handoff: TIM-64 Expiry Validation
```

**Event-or-timeout verdict: GENUINE, with a caveat worth stating.** `w.resolution` is bounded by
`expires_at` as the system of record asserts it, and its two arms reach genuinely different places.
But the message is sent **before** the wait: the wait carries no touch and exists only to decide
which ending. So the journey is really *Conditional (what is said) → Single send → Event-or-timeout
(which ending)*. That is an unusual and correct shape — entering the window **is** the timing
decision, as the journey's own row says — and it should be kept, not normalised into a
"wait then send" pattern.

**Problems found**

- **The journey's best idea is invisible.** `a.prompt-action` declares four channels;
  `a.inform` declares one, deliberately — *"a prompt to act where acting is impossible is worse
  than silence"*. On the canvas both are just "Message" cards, so the contrast a practitioner
  should take away from this journey does not survive rendering.
- **The urgent gate is invisible** for the same reason it is in TIM-61. Here the two urgent channels
  are genuinely different (push needs a token and an app; SMS does not), so this is a real
  conditional and not a duplicate — but it is three conjoined conditions (inside `urgent_horizon`,
  action is one step, permission recorded) collapsed into a badge.
- **No success exit.** Both endings are handoffs (`external:renewal-lifecycle`, TIM-64) and the only
  exits are suppressions. A library reader sees a journey that never finishes — the same shape as
  C2 (FUL-146 / FUL-148), and the same answer applies: state it on the page rather than adding
  exits that duplicate state the receivers own.
- **TIM-63 is one of the eight journeys TIM-268 defers to and cannot reciprocate.** Its
  `competition` block is already spent on `relationship-continuity` (with SUB-163), and a journey
  declares exactly one. **This is the structural reason decision 9's remainder cannot be closed by
  option (a) for TIM-63** — not an oversight. Its `distinctFrom` names TIM-64 and SUB-163 but not
  TIM-268.

**Final orchestration.** **Conditional routing** — is there an action, and if not is it worth saying
anything — plus **single** and **event-or-timeout** on the outcome. Shape unchanged; the urgent
branch made visible.

**Final customer channels.** Prompt: `email` (default) · `in_app` (the responsible actor is in the
product) · `sms` or `push` (only inside `urgent_horizon`, only where the action is a single step,
only with recorded permission). Notice: **`email` only**.

**SMS verdict: right, and narrowly.** A validity that lapses is a real deadline with a real
consequence, and there is a specific action that changes it. But TIM-63 caps at one message, so the
urgent role applies only where the *window itself* opens inside the urgent horizon — a short-notice
expiry. That narrowness is what keeps SMS meaningful, and it must stay in the `when` clause.

**Customer touch count.** **1** — a prompt to act or an informational notice, never both.

**Final flow**

```
Pre-expiry window entered
 → Re-read: has it already been renewed, replaced or completed?
      Already resolved → Exit: nothing is expiring
 → Is an action available that would materially change the outcome?
      Yes → Who is responsible, and what is the action?
             → Is the expiry inside the urgent horizon, with a one-step action and permission?
                  Yes → Prompt to act (SMS or Push)
                  In the product → Prompt to act (In-app)
                  Otherwise → Prompt to act (Email)
      No  → Is telling anyone useful even though nothing can be done?
                  Worth saying → Informational notice (Email only — no action, no urgency)
                  Not worth it → Exit: nothing to do, nothing worth saying
 → Wait until renewed | completion_recorded | replaced   (bounded by expires_at)
      event   → Invalidate the old validity's queued actions → Handoff: renewal lifecycle
      timeout → Handoff: TIM-64 Expiry Validation
```

**State re-checks.** `a.reread` + `c.already` at entry — correct and necessary, because the window
opened on a schedule and the state may have moved. `a.invalidate` on the success arm stops a
renewal granted today being undone by an expiry scheduled yesterday. One touch, so nothing further.

**Stop conditions.** `renewed`, `completion_recorded`, `replaced`; an entity already resolved when
the window is re-read; SUB-163 holding the renewal cycle.

**Ownership / handoff.** Below SUB-163 in `relationship-continuity` wherever the expiring entity is
a relationship with renewal terms; owns every expiring entity with no renewal cycle. Above TIM-268
by TIM-268's own declaration — unreciprocated, for the structural reason above.

**Canonical changes needed** (`src/canonical/time.ts`)

1. Make the urgent gate a visible condition ahead of `a.prompt-action`, splitting it into
   `a.prompt-urgent` (`sms`, `push`) and `a.prompt-action` (`email`, `in-app`).
2. `a.actor` should declare the state it produces (`writes: [{ field: "responsible_actor",
   mode: "set" }]`) so the step that establishes *who must act* keeps its card. `a.reread` and
   `a.invalidate` are correctly absorbed — the question card and the handoff carry them.
3. Add a `distinctFrom` entry naming TIM-268, stating the deference TIM-268 already states from its
   side, and record in that entry that the reciprocity is `distinctFrom`-only because the
   `competition` block is spent on `relationship-continuity`.

**Display-only changes needed.** The detail page should state "ends by handing off to …" on both
terminal handoffs, per decision C2's recommended treatment.

**Renderer changes needed.** None specific to this journey.

---

## TIM-268 · Action Required Reminder — the generic fallback

**Purpose.** Remind somebody of what they owe while there is still time to do it, **from the state
the obligation is in at the moment of sending** — and only where no journey scoped to the
obligation's own type already owns that reminder.

**Current flow** (15 canonical / 16 display — 2 shared-terminal instances of `x.moot`; nothing
absorbed)

```
customer_owed_obligation_outstanding
 → Is there a gap before the deadline worth waiting through?
      Due now or already past → ↓
      Time remains → Wait until obligation_no_longer_owed | obligation_changed_still_owed
                        (timeout: the reminder point — required)
                        BOTH ARMS → ↓
 → [Re-read the obligation from authoritative current state immediately before sending]
 → Is anything still owed at the moment of sending?
      Nothing outstanding → Exit: no longer owed; nothing was sent
      Still outstanding ↓
 → Reminder  [email · sms]
 → Wait until obligation_satisfied | obligation_no_longer_owed | deadline_passed_unmet
      (timeout: due_at — required)
      event   → How did it resolve?
                   Satisfied → Confirmation  [email · sms] → Exit: satisfied and confirmed
                   Cancelled or adjusted away → Exit: moot
                   Still owed at the deadline → ↓
      timeout → Overdue notice  [email · sms]
                → Does a defined consequence own this now?
                     Yes → Handoff: external consequence-owner
                     No  → Exit: lapsed unmet
```

**Event-or-timeout verdict — one genuine, one rejected**

- **`w.due` — REJECTED.** Both arms converge on `a.recheck`. The `until[]` events only wake it
  early; nothing about the route depends on which arm fired. It is a **timed wait with an early
  wake, followed by a state re-read** — a good design, and exactly the state-re-check the brief
  asks for, but it should not be presented or counted as event-or-timeout. (Family B's collapse
  does not fire because the sole successor is an action, not a condition.)
- **`w.deadline` — GENUINE.** The arms reach different places. But `deadline_passed_unmet` in
  `until[]` **is** the timeout at `due_at`, by two routes, and both reach `a.overdue`. Removing it
  from `until[]` makes `c.settled`'s third branch unreachable, and removing that leaves a clean
  two-branch question. Net: one event id and one branch fewer, and no behaviour lost.

**Problems found**

- **All three touches carry `["persistent","urgent"]`.** A confirmation that an obligation is
  discharged is never urgent — nothing needs acting on — and the overdue notice is sent *before*
  `c.escalate` establishes whether a consequence exists at all. **This is the clearest case of
  SMS-as-generic-escalation in my nine.**
- **`localCap` is 3, "the plan's own length"; the longest path is 2.** `c.settled` cannot reach both
  `a.confirm` and `a.overdue`, and `x.moot` sends nothing at all. Same defect class as FBK-42 and
  FBK-49.
- **The generic-fallback rule is complete on TIM-268's side and has no counterparty.** Eligibility
  clause 3 names all nine type-scoped owners by id (TIM-61, TIM-63, DOC-215, REL-284, ACC-263,
  RLT-279, SCH-266, ACT-13, FBK-49); `s.g6` and `s.g7` state the rule; `distinctFrom` names ten
  journeys. But `obligation-reminder` has exactly **two** members — TIM-268 and TIM-61 — and of the
  eight others:
  - **TIM-63** (`relationship-continuity`) and **SCH-266** (`booking-lifecycle`) are already in
    other exclusion groups and **cannot join a second**, because a journey declares one
    `competition` block. For them the one-sided clause plus a reciprocal `distinctFrom` is the only
    available mechanism.
  - **DOC-215, REL-284, ACC-263, RLT-279, ACT-13, FBK-49** all declare `competition: "none"` and
    **can** join `obligation-reminder`, which is scoped `communication-purpose` and therefore does
    not need a shared instance key. (Only TIM-61 shares TIM-268's `["obligation_id"]`; all eight
    others key on something else.)

  **I am not inventing an ordering.** The ordering is already stated — by TIM-268 itself ("lowest in
  the group … below every journey scoped to the obligation's own type") and by each of the nine
  naming the type it owns. What is missing is the reciprocal declaration, which is data
  completeness, not a product call. That is decision 9 option (a) for six journeys and option (b)
  for two, and the split is forced by the data rather than chosen.
- `a.recheck` survives Family A (two in-edges) and stays drawn. Correct — the re-read is this
  journey's entire thesis and the reason it is safe to be generic.

**Final orchestration.** **Single reminder → event-or-timeout at the deadline → conditional on the
outcome.** Explicitly **not sequential**: the reminder and the confirmation/overdue notice are two
different facts about one obligation, and `s.g3` forbids repetition ("one reminder before the
deadline and one notice after it; repetition past that is a recovery process and belongs
elsewhere"). The `w.due` leg is a **timed wait with a state re-read**, which is its own shape and
should be named as such rather than as event-or-timeout.

**Final customer channels.** `email` on all three touches. `sms` on **the reminder only** — gated on
`due_at` inside `urgent_horizon` with recorded permission, as today — and on the overdue notice only
where a defined consequence is already recorded against the obligation. **Never on the
confirmation.**

**SMS verdict: right for the reminder, wrong everywhere else it currently sits.** The reminder is a
real deadline with a real consequence and a single way to discharge it. The confirmation asks for
nothing. The overdue notice is urgent only if something now happens because of it, and the journey
does not know that until one node later.

**Customer touch count.** **2** (reminder, then confirmation *or* overdue notice). `x.moot` is a
zero-touch ending and should stay one.

**Final flow**

```
Customer owes a defined action, with a due date, that nothing more specific owns
 → Is there a gap before the reminder point worth waiting through?
      Due now or past → ↓
      Time remains → Wait until the reminder point (waking early on any change to the obligation)
 → Re-read the obligation: what is owed NOW, what has been received, what the deadline is now
 → Is anything still owed?
      No  → Exit: no longer owed; nothing was sent
      Yes ↓
 → Is due_at inside the urgent horizon, with SMS permission recorded?
      Yes → Reminder (SMS)     naming what REMAINS outstanding and the one way to discharge it
      No  → Reminder (Email)
 → Wait until obligation_satisfied | obligation_no_longer_owed   (bounded by due_at)
      event   → Satisfied → Confirmation (Email) → Exit: satisfied and confirmed
                 Cancelled or adjusted away → Exit: moot
      timeout → Overdue notice (Email; SMS only where a consequence is already recorded)
                → Does a defined consequence own this now?
                     Yes → Handoff: consequence owner (carries what remains, and every reminder sent)
                     No  → Exit: lapsed unmet
```

**State re-checks.** `a.recheck` immediately before the send, every time — keep exactly as is, and
it is the pattern TIM-274 is missing.

**Stop conditions.** `obligation_satisfied`, `obligation_no_longer_owed` — at both waits. Plus:
any type-scoped journey taking ownership of the obligation, which is what the eligibility clause
and `s.g6`/`s.g7` enforce.

**Ownership / handoff.** Lowest in `obligation-reminder`. Hands to
`external:consequence-owner` carrying what remains outstanding **and which reminders were sent** —
which is the right thing to carry and should not be trimmed.

**Canonical changes needed** (`src/canonical/time.ts`)

1. `outstanding_obligation.touches` default **3 → 2**; rule: "one reminder before the deadline and
   one notice after it; the two post-deadline notices are mutually exclusive."
2. `t2 confirm` → `channelRoles: ["persistent"]`. `t3 overdue` → `["persistent"]`, with the urgent
   role admissible only where a consequence is already recorded against the obligation.
3. Remove `deadline_passed_unmet` from `w.deadline.until`, and remove `c.settled`'s now-unreachable
   "Still owed at the deadline" branch. The timeout at `due_at` is that event.
4. Reclassify `w.due` in the orchestration record as a timed wait with a state re-read, not
   event-or-timeout.
5. **Reciprocity, the six that can join:** add DOC-215, REL-284, ACC-263, RLT-279, ACT-13 and
   FBK-49 to `obligation-reminder` at scope `communication-purpose`, each with a one-line
   precedence above TIM-268 and `onLoss: suppressed`. Only **FBK-49** is in my scope and its clause
   is written in that section; the other five belong to their own domain agents and are named here
   so nobody assumes they are covered.
6. **Reciprocity, the two that cannot:** TIM-63 and SCH-266 get a `distinctFrom` entry naming
   TIM-268, with the reason the `competition` block is unavailable. TIM-63's is written in its
   section.

**Display-only changes needed.** `w.due` + `a.recheck` should read as one unit — "Wait until the
reminder point, then re-read what is owed" — the same treatment Family B gives a wait and its
follower condition. Today they are two cards joined by a one-hop connector.

**Renderer changes needed.** The Family B `waitNode` treatment currently applies only where the
wait's sole successor is a **condition**. Extending it to a sole-successor **action whose only job
is a re-read** would need a signal the corpus can detect; `a.recheck` writes nothing and has two
in-edges, so the existing detector cannot see it. Stated as an item, not proposed as a rule —
inventing one for a single site would fail the generic-only constraint.

---

## TIM-274 · Grace Period Recovery

**Purpose.** Make grace a state the holder is in **knowingly** — what stopped, what still works,
when the window ends, and the one route back.

**Current flow** (13 canonical / 13 display; nothing absorbed, nothing shared — the cleanest graph
in this cluster)

```
grace_period_started
 → Does grace restrict anything the holder will actually notice?
      Function reduced      → Grace notice: what stopped, what still works, the end date, the route back
      Continuity unchanged  → Quiet notice: validity lapsed, nothing has changed yet, and the date it will
 → Wait until recovery_condition_satisfied | entity_terminated
      (timeout: grace_period.grace — the last point at which one more message can still be acted on)
      event   → What ended the wait?
                   Recovered   → Confirmation → Exit: recovered inside the window
                   Ended early → Exit: grace ended by termination
      timeout → Last call: the exact end date, what stops at it, the same single route
 → Wait until recovery_condition_satisfied   (timeout: grace_deadline_at)
      event   → (back to "What ended the wait?")
      timeout → Loss notice: the window has closed, what is gone, whether a route exists on other terms
                 → Exit: window closed unrecovered
```

**Event-or-timeout verdict: GENUINE at both waits.** `w.grace` and `w.final` are both bounded by a
real attribute (`grace_deadline_at` and a point measured back from it), and both arms reach
genuinely different places. This is the right shape for a fixed window.

**The 5-touch question.** TIM-274 declares **five** communication nodes and is one of four journeys
in the corpus that do (with TIM-281, SCH-277, RSK-273). **It is not a cascade.** The longest path is
**three** touches, and the cap is already 3:

- one of `a.notify-restricted` / `a.notify-quiet` — mutually exclusive arms of `c.restricted`;
- `a.last-call`, only on the timeout arm;
- one of `a.confirm` / `a.lost` — mutually exclusive endings.

So five nodes, three touches, and of those three only **two are asks** — the confirmation and the
loss notice are statements of what happened, and the journey is explicitly right that both must be
sent (`s.g5`: *"silence after a recovery and silence after an expiry are indistinguishable to the
person living in the window"*). **No touch removed.** The 4th-touch justification the brief asks for
does not arise, because there is no 4th touch; what arises is that the corpus's touch counter reads
`orchestration.touches.length` and reports 5.

**Problems found**

- **`w.final.until` lists only `recovery_condition_satisfied`.** `w.grace` listens for
  `recovery_condition_satisfied` **and** `entity_terminated`; `w.final` dropped the second. An
  entity terminated during the last leg therefore times out and receives `a.lost` — a "your window
  has closed, here is what you have lost" notice sent to somebody whose thing was already
  cancelled. **This is the sharpest bug in my nine**, and it is the same class as decision A5
  (RET-30 and `cancellation_confirmed`).
- **Consequently `c.outcome`'s "Ended early → x.moot" branch is unreachable from `w.final`.** It
  exists only for `w.grace` today, and becomes reachable the moment the fix above lands.
- **No state re-read before `a.last-call` or `a.lost`.** Both fire on a timeout, and both are sent
  blind. TIM-268 re-reads immediately before every send and is right to; TIM-274 sends the two most
  consequential messages in the cluster without doing so.
- **All five touches carry `["persistent","urgent"]`.** `a.notify-quiet` — whose entire content is
  *"nothing has changed yet"* — can be sent by SMS. So can the recovery confirmation. That is the
  same defect as TIM-268 and it directly undermines the one message here that genuinely earns SMS.
- **The cap is 3 and correct**, but for the same "plan's own length" reason that is wrong
  everywhere else in this cluster; its `applicableWhen` does already name the longest path, which is
  the honest form and should be copied to the others.

**Final orchestration.** **Conditional (does grace actually bite?) → sequential across a fixed
window → event-or-timeout at both bounds.** A justified combination, and the matrix's own
justification stands: the three touches are three different facts about one window — it has opened,
it is about to close, it closed or was recovered — not one message repeated.

**Final customer channels.** `email` on all five. `sms` on **`a.last-call` only** — plus
`a.notify-restricted` where the reduction is already biting *and* `grace_deadline_at` is inside the
urgent horizon. `a.notify-quiet`, `a.confirm`, `a.lost` → email.

**SMS verdict: `a.last-call` is the single best SMS case in my nine.** A fixed end date, a named
consequence, one message, one route back, and no second reminder behind it. Everywhere else in this
journey SMS is decoration.

**Customer touch count.** **3** on the longest path — two asks and one statement of the outcome.

**Final flow**

```
Grace period started (authoritatively recorded, with a fixed end and a recorded recovery condition)
 → Does grace restrict anything the holder will actually notice?
      Function reduced → Grace notice (Email; SMS where the reduction bites and the end is near)
      Continuity unchanged → Quiet notice (Email)
 → Wait until recovery_condition_satisfied | entity_terminated   (to the last actionable point)
      event   → What ended the wait?
                   Recovered   → Confirmation (Email) → Exit: recovered inside the window
                   Ended early → Exit: grace ended by termination
      timeout → Re-read: is the window still open, is the entity still in grace, has the end moved?
                   Still in grace → Last call (Email + SMS): the exact end date, what stops, the one route
                   Otherwise      → (join "What ended the wait?")
 → Wait until recovery_condition_satisfied | entity_terminated   (to grace_deadline_at)
      event   → (join "What ended the wait?")
      timeout → Re-read, then Loss notice (Email): what is gone, and whether a route exists on other terms
                 → Exit: window closed unrecovered
```

**State re-checks.** One before the last call, one before the loss notice — both new. The waits
already re-read on their event arms.

**Stop conditions.** `recovery_condition_satisfied` and `entity_terminated`, **at both waits**;
ACC-261 recording a restriction, which supersedes this journey outright.

**Ownership / handoff.** `access-consequence-narration` with ACC-261, `onLoss: superseded` — below
the restriction notice, above FIN-134, whose messaging ends where the grace state begins. TIM-281
is excluded by eligibility clauses on both sides. Zero handoff nodes and that is correct: this
journey narrates a state TIM-65 owns and hands nothing on. **Strong; do not reopen.**

**Canonical changes needed** (`src/canonical/time.ts`)

1. Add `entity_terminated` to `w.final.until`. One event id; it removes a message sent to somebody
   whose entity was already cancelled and makes `c.outcome`'s second branch reachable from both
   waits.
2. Add `a.recheck-grace` between `w.grace`'s timeout arm and `a.last-call`, and reuse it between
   `w.final`'s timeout arm and `a.lost`. Same shape as `TIM-268.a.recheck`; it must write real state
   (the re-read grace record) so Family A does not absorb it.
3. Channel roles: `t1 notify-restricted` → `["persistent","urgent"]` with the urgent `when`
   narrowed to "the reduction is already biting"; `t2 notify-quiet` → `["persistent"]`;
   `t3 confirm` → `["persistent"]`; `t4 last-call` → `["persistent","urgent"]` (unchanged);
   `t5 lost` → `["persistent"]`.
4. Keep `grace_period.touches` at 3 and keep its `applicableWhen` wording — it is the only cap in
   this cluster that names the longest path rather than the plan's length, and the other four
   should be rewritten to match it.

**Display-only changes needed.** None. 13 canonical, 13 drawn, nothing absorbed, nothing shared —
this journey renders exactly as it is authored, which is why its bugs are legible.

**Renderer changes needed.** None.

---

## TIM-281 · Expired Access Recovery

**Purpose.** Give somebody who has come back to something that expired the **one** route that
actually restores it, at the moment they are asking — because naming the wrong route spends the only
intent this ever gets.

**Current flow** (13 canonical / 13 display; `a.establish` absorbed; 2 shared instances of
`x.still-expired`)

```
holder_acted_on_expired_entity
 → [establish what the expiry actually did: suspended, invalidated, or ended the relationship]  (absorbed)
 → Which mechanism restores validity here?
      Renewal          → "Here is the renewal, what it costs, and what carries across the gap"
      Requalification  → "This is not a renewal; these conditions have to be met again"
      Replacement only → "The old one stays expired; a new one is issued, and here is what differs"
      No route back    → "There is no way back to this one; here is what exists instead"  → Exit: terminal
 → Wait until validity_restored | recovery_attempt_abandoned   (response window, required)
      timeout → Exit: still expired; the route was offered and not taken
      event   → Did validity come back?
                   Valid again → Confirmation: what is valid now, and that a replacement is a NEW object
                                  → Exit: valid again by the route that was named
                   Abandoned   → Exit: still expired
```

**Event-or-timeout verdict: GENUINE.** `w.act` is bounded by a response window measured from the
touch that named the route, listens for both success and explicit abandonment, and the arms reach
different places. Correct and minimal.

**The 5-touch question.** TIM-281 declares **five** communication nodes and the longest path is
**two**: one of the four mutually exclusive route statements from `c.route`, then the confirmation.
The cap is already 2. **This is a four-way conditional route, not a cascade, and it is the cleanest
example of that pattern in my nine.** `a.no-route` correctly bypasses `w.act` entirely — there is
nothing to wait for. **No touch removed.**

**Problems found**

- **`competition: "none"` is a false statement in the data.** TIM-274 names TIM-281 in
  `distinctFrom` and both carry eligibility clauses that exclude each other (TIM-281: *"no grace
  period is open on the entity"*; TIM-274: *"while grace is open the holder is answered from
  here"*). The contest is real and is genuinely resolved — but by eligibility at instance open, not
  by arbitration — and `"none"` reads as "there is no contest".
- **`a.establish` is absorbed** although `s.g1` makes it the journey's thesis: *"the route is worked
  out before anything is said. One wrong route spends an intent that arrived willing."* It writes
  nothing, so Family A hides it. `c.route` carries it, so a reader loses nothing, but the step the
  journey exists to insist on is the one that does not get a card.
- Nothing else. The channel set, the cap, the wait, the bypass on the dead-end branch and both
  endings are right as authored.

**Final orchestration.** **Conditional routing (four-way) + single + event-or-timeout.** Unchanged.
This is the reference journey for "the split genuinely changes what is said" in this cluster: four
messages that differ in substance, not in tone, and choosing among them is the whole job.

**Final customer channels.** `email` (persistent — a route statement with costs and conditions must
survive until they act on it) · `in_app` (they are in the product, having just tried the expired
thing). **No SMS, no push.**

**SMS verdict: wrong here, and deliberately so.** The holder is already in front of us, at a moment
of their own choosing, having just acted. There is no deadline we are racing and no consequence
they have not already met. Interrupting somebody who is currently asking us a question is the
purest form of the generic-escalation failure.

**Customer touch count.** **2** — one route statement, one confirmation.

**Final flow.** Unchanged from the current flow above.

**State re-checks.** `a.establish` reads what the expiry actually did before any route is named —
this is the re-check, and it should be visible. `c.outcome` re-reads whether validity actually came
back before confirming.

**Stop conditions.** `validity_restored`; `recovery_attempt_abandoned`; an open grace period on the
entity (TIM-274 owns the holder while the window is open).

**Ownership / handoff.** No handoffs, correctly — TIM-69 decides the mechanism and issues any
replacement; this journey carries the holder along whichever route that decision names. Excluded
from TIM-274 by eligibility on both sides.

**Canonical changes needed** (`src/canonical/time.ts`)

1. `a.establish` should declare the state it produces (`writes: [{ field: "expiry_effect",
   mode: "set" }]`) so it keeps its card.
2. Replace `competition: "none"` with an explicit statement that the contest with TIM-274 is
   resolved by eligibility rather than by arbitration, naming the clause on each side. See the
   least-certain calls below — if the runtime arbiter can only enforce exclusion groups, the right
   answer is instead to join `access-consequence-narration` below TIM-274.

**Display-only changes needed.** None.

**Renderer changes needed.** None.

---

## Summary

| ID | Before (pattern) | After (pattern) | Customer channels | Touches | Biggest change |
|---|---|---|---|---|---|
| **FBK-41** | Single + Event-or-timeout, 3 channels on one card, 3 gates in a row | **Conditional routing** (where the experience ended) + same-role fallback in-app→push + Event-or-timeout | in-app · push · email | 1 | Three eligibility gates merged into one decision (3 exits kept); the channel choice made visible instead of three badges |
| **FBK-42** | Segment-based + Event-or-timeout | **Segment-based + Event-or-timeout** (unchanged) | light: in-app · push · email / heavy: email · in-app, never push | 1 | Cap 2 → 1 (the two asks are mutually exclusive); light ask's role order fixed; new clause stopping an FBK-43 acknowledgement and an advocacy ask landing back to back |
| **FBK-43** | Conditional (7-way) + Event-or-timeout ×2 | **Conditional routing + Event-or-timeout** (unchanged) | email · in-app (+ `task`, internal) | 1 | Touch plan counts customer touches only (2 `human` entries excluded); SUPPORT_NEED branch states that REM-305 acknowledges the requester; empty `distinctFrom` filled |
| **FBK-49** | Conditional + Event-or-timeout, silent on rejection | **Conditional routing + Event-or-timeout + one bounded re-request** | email · in-app (+ `task`, internal) | 2 | B5 applied — the cap stops counting the internal work item; a rejected submission now gets told; `a.retrieve` keeps its card |
| **TIM-61** | Event-or-timeout (looping) + Conditional | **Event-or-timeout (looping) + visible urgent-horizon conditional** | email · push · sms (urgent horizon + permission) · whatsapp (same-role substitute) | 1 per policy threshold | The 4-channel badge row becomes a real SMS/Push/Email branch; WhatsApp gets a `when` that makes it a substitute, not a second urgent channel |
| **TIM-63** | Conditional + Single + Event-or-timeout | **unchanged shape**, urgent gate made visible | prompt: email · in-app · sms/push (urgent) / notice: **email only** | 1 | The email-only informational notice — the journey's best idea — made legible; reciprocity with TIM-268 recorded as `distinctFrom`, because its `competition` block is spent |
| **TIM-268** | "Conditional + Single + Event-or-timeout" | **Single reminder + Event-or-timeout at the deadline + Conditional outcome**; `w.due` reclassified as a timed wait with a re-read | email (all) · sms (reminder only; overdue only where a consequence is recorded) | 2 | SMS off the confirmation; cap 3 → 2; `deadline_passed_unmet` removed from `until[]` (the timeout *is* it); the fallback rule given counterparties |
| **TIM-274** | Conditional + Sequential + Single + Event-or-timeout | **same, justified** — both waits made symmetric | email (all) · sms on the last call (and a biting restriction) | 3 | `entity_terminated` added to `w.final.until` — today a cancelled entity still gets the loss notice; re-reads added before the last call and the loss notice |
| **TIM-281** | Conditional + Single + Event-or-timeout | **unchanged** — the reference conditional route of this cluster | email · in-app | 2 | `competition: "none"` replaced with the eligibility-based exclusion it actually uses; `a.establish` keeps its card |

### Pattern distribution after the audit (9 journeys)

| Pattern | Journeys | Count |
|---|---|---|
| **Event-or-timeout** | all nine | 9 |
| **Conditional routing** | FBK-41, FBK-43, FBK-49, TIM-61, TIM-63, TIM-268, TIM-274, TIM-281 | 8 |
| **Single** | FBK-41, FBK-42, FBK-43, TIM-61, TIM-63, TIM-268, TIM-281 | 7 |
| **Segment-based** | FBK-42 | 1 |
| **Sequential** | TIM-274 | 1 |
| **Fallback** (same-role, genuinely unreachable primary) | FBK-41 (in-app→push), FBK-42 (in-app→push), TIM-61 (sms→whatsapp) | 3 |
| **Parallel** | — | 0 |

Fallback stays at 3 of 9 and in every case the desired channel is genuinely unavailable — a session
that has ended, or a market where SMS is not the messaging channel. No journey in this cluster
gains a fallback it did not earn, and no journey loses a channel it needs.

### Touch counts after the audit

`1` FBK-41, FBK-42, FBK-43, TIM-63 · `1 per policy threshold` TIM-61 · `2` FBK-49, TIM-268, TIM-281 ·
`3` TIM-274. **Nothing in this cluster reaches four.**

### The three calls I am least sure about

1. **FBK-49's second customer touch.** I am adding a message (tell the person what they sent was
   refused) at the same time as applying B5, which is a decision to *lower* caps. The number stays
   2 but its meaning changes completely. The branch and the guardrail that justify it are both
   already in the data, and a silent rejection is the most common real failure of a document
   request — but an auditor asked to reduce touches has just added one, and that deserves a second
   reader.
2. **Keeping WhatsApp on TIM-61.** Two urgent channels with an identical `when` is the
   Primary/Fallback smell the refactor exists to remove. I keep WhatsApp only as a same-role
   substitute for SMS with a stated condition, on the strength of
   `audit/channel-orchestration-map.md`'s record that it appears exactly once in the corpus and
   deliberately. But **nothing in TIM-61's own data distinguishes the two channels**, and the
   simpler honest answer — drop WhatsApp, keep SMS — is defensible and would cost the corpus its
   only WhatsApp journey.
3. **Leaving TIM-281 out of `access-consequence-narration`.** I recommend stating the
   eligibility-based exclusion rather than joining the group, because the exclusion is on the
   entity's *state* (is a grace window open?) rather than on communication pressure, and the two
   journeys key on different things (`entity_ref + grace_period_id` vs `entity_ref + attempt_id`).
   If the runtime arbiter can only enforce exclusion groups, this is wrong and TIM-281 should join
   below TIM-274 — which is what the collision review's instinct was.

Honourable mention, at the edge of the same list: **merging FBK-41's three eligibility gates into
one condition.** It removes two cards and keeps all three exits with their distinct `reEntry`
semantics, but it discards the stated evaluation order (resolution before duplicate before budget).
That order lives on in the `eligibility` prose, so I judged nothing lost — but it is a judgement.

### Out of scope, named so nobody assumes it is covered

Closing decision 9's remainder needs reciprocal clauses on **DOC-215, REL-284, ACC-263, RLT-279 and
ACT-13** (all `competition: "none"`, all able to join `obligation-reminder`) and on **SCH-266**
(already in `booking-lifecycle`, so `distinctFrom` only). FBK-49 and TIM-63 are the two in my scope
and are handled above.
