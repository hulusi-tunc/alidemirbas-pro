# Phase 1 audit — system events

**Scope:** the 6 public DOCUMENT / INCIDENT / ROLLOUT / RISK journeys —
`DOC-214` `DOC-215` `INC-254` `REL-284` `RLT-279` `RSK-273`.

**Method:** `audit/refactor/_AUDIT-BRIEF.md`, applied in order, one journey at a time, against
`audit/public-journeys-current-state.json`. Cross-read: `audit/51-journey-design-matrix.md`
(rows 164, 208–212 and open items 12/13), `audit/journey-blueprints.md` (F5f and the five
per-journey blueprints), `audit/channel-orchestration-map.md` (rows 128–130, 169–179),
`audit/DECISIONS-PENDING.md` (C4, C5, A4), `audit/patterns.md`, `audit/reference-example.md`.

---

## The headline for this domain

**Five of these six journeys are already close to right, and the correct output of this audit is
mostly *don't*.** I changed no journey's orchestration pattern. I removed one split, added none,
and added no customer-facing touch anywhere. The touch counts stay 1 · 2 · 1 · 3 · 2 · 3.

What is actually broken in this set is not the shapes — it is **three things, and two of them are
corpus-wide, not mine**:

### F1 · The "Primary / Fallback" label is false on all six, and false by construction on 55 of 69

`ChannelPriorityRow` (`src/components/ui/JourneyCanvasNodes.tsx:251–280`) labels channel-role row
0 `Primary` and **every later row `Fallback`, unconditionally**. It never reads whether a fallback
relation exists.

The corpus authors exactly that fact and the renderer ignores it. Counting
`channelStrategy.fallback` across all 69 public journeys:

| `channelStrategy.fallback` | journeys | what it means |
|---|---|---|
| `same-role-other-channel` | **55** | fallback happens **inside** one role, between that role's own channels |
| `next-eligible-role` | 14 | fallback is role-to-role — the only value for which "Fallback" is true |

**All six of my journeys are in the 55.** So on every multi-role card in this set the canvas states
a substitution relationship that the journey's own data denies. On INC-254 it contradicts the
authored design directly: the design matrix and the orchestration map both record INC-254 as
**Parallel** — "Email carries the record to people who are not in the product; the in-app surface
reaches whoever is hitting the fault right now" — and the card renders it `Primary Email / Fallback
In-app`, i.e. "in-app only if email fails". That is the brief's named failure mode, rendered.

On the two single-channel journeys (DOC-214, DOC-215) the same component prints a bare `Primary
Email` row — a priority label over a list of one.

And it is the overuse the brief names: **142 of the corpus's 160 touches declare more than one
channel role; 18 declare one.**

This is a **renderer change**, listed in full under *Renderer changes* below. It is the single
highest-value change available from this domain and it is generic — it branches on a field the
corpus already authors, never on a journey id.

### F2 · The intended per-touch channel design exists, in prose, and is not in the data

`audit/channel-orchestration-map.md` already states the right answer per touch: RSK-273's wall
notice is *"**In-app**, at the point the action is stopped"*; REL-284 is *"Email; In-app where the
counterparty is in the product"*; DOC-214/DOC-215 are *"**Email only**"*. But in
`orchestration.touches[].channelRoles`, **every touch in RSK-273, REL-284, RLT-279 and INC-254
declares the identical role pair** — `["in-session","persistent"]` or `["persistent","in-session"]`
— regardless of who the recipient is or where they are. The design was flattened on the way into
the canonical data, and then the renderer put a false "Fallback" on top of the flattening.

Fixing F2 is the only canonical channel work I propose, and it is per-touch edits to
`channelRoles` on four journeys. It **removes** channel rows; it adds none.

### F3 · Three data defects that make a journey state something untrue

- **RLT-279 `x.held` is classed `success`** while it is the path on which the journey's own
  business outcome (`named_requirement_satisfied`) is structurally impossible.
- **RLT-279 `w.final.until` drops `change_withdrawn`**, so a change withdrawn after the last call
  is recorded as `x.unprepared` — the exact mislabelling `s.g4` ("Not ready is not failed") exists
  to prevent. Same class of bug as open item 14 (RET-30), which was fixed.
- **DOC-215's one-reminder gate is per-process while its stated rule is per-signer**, so under a
  signing order a later signer can never be reminded.

None of the three is a shape problem. All three are one-line canonical edits.

---

## What I deliberately did NOT do

Recorded explicitly, because in this domain restraint is the deliverable:

| I did not | where I was tempted | why not |
|---|---|---|
| Add any orchestration to **DOC-214** | it is a 7-card journey and looks thin next to ACQ-11 | It is a 1-touch transactional delivery. A second touch would be a second copy of a document, which is the failure `s.g1` names. The burden of proof was on adding, and there is none. |
| Inflate **DOC-215** beyond email | signature chasing invites SMS/push | A signature request is a document with a destination and a legal validity boundary. SMS cannot carry it and push cannot persist it. Email is the only channel that fits, and the journey already says so. |
| Add a second reminder anywhere | DOC-215, REL-284, RLT-279 all stop at one | Each states the reason in its own suppressions (`s.one-reminder`, `s.g4` "the expiry is the pressure", `s.g3` "two prompts at most"). Three journeys, three independently authored statements of the same discipline. Adding a chase would contradict all three. |
| Add a wait to **INC-254** | the matrix's open item 13 offers it as option (b) | See the INC-254 section. The absence is the design. |
| Add a "can we reach them?" permission gate to any of the six | the canvas expectations mention it | None of the six routes differently on permission. `GLB-31` hard gates are already in `eligibility` on all six, which is where they belong. |
| Add urgency / SMS to **RSK-273** | "your action is blocked" reads urgent | Being at a usage limit is not time-critical — the reset is a known future date and nothing is lost by waiting. `s.g1` forbids the vocabulary of urgency here outright. |
| Split **RSK-273's** reset notice into two | open item 12 offers it as option (b) | It would create the corpus's only second Parallel pair to tell a person a wait they were not in has ended. See below. |
| Segment **RLT-279** any further | "enterprise vs self-serve holder" | The evidence is not in the data. `c.resolvable` is the only split the journey has facts for, and it already earns its place. |
| Add a `recipient` concept to the schema | RSK-273 and REL-284 both address two parties | The corpus expresses recipient in the action's own prose and in `Touch.purpose`. Introducing a field is a schema change, out of scope for Phase 1, and unnecessary for the fix. |

---

# DOC-214 · Document Delivery

**Purpose.** Get one specific *issued* version to the party who should have it, and know honestly
whether it arrived — without delivery state ever being confused with document validity.

**Current flow** (11 canonical nodes → 7 drawn)

```
t.requires (issued_document_requires_distribution)
  → a.recipient   (resolve recipient + permitted route)        [not drawn — bookkeeping]
  → a.version     (bind distribution to the exact version)     [not drawn — bookkeeping]
  → a.distribute  EMAIL
  → w.distribution  until distribution_confirmed | distribution_failed
       ├─ on event  → c.outcome  "How did the distribution resolve?"
       │                ├─ Confirmed → a.confirmed → x.distributed  (success)
       │                └─ Failed    → h.recover → CMS-208
       └─ on timeout → a.unknown (record UNKNOWN, never DELIVERED)
                        → h.reconcile → external:external-status-reconciliation
```

**Problems found**

1. **The card says `Primary Email` over a one-channel plan.** F1. `channelStrategy.roles` has a
   single role (`persistent` → `email`) and `fallback: "same-role-other-channel"` — a fallback
   declaration with nothing to fall back to. Display noise on the corpus's cleanest journey.
2. **`a.version` is not drawn.** Family A absorbed it as bookkeeping (in-degree 1, out-degree 1,
   writes only a journal row), but its headline is *"Bind the distribution to the exact issued
   version"* — and `s.g2` makes version binding one of the journey's three stated guarantees. This
   is the one absorption in my set I would argue with: it is not bookkeeping, it is the step that
   makes the send correct. **I am not proposing a change** — the absorption rule is data-driven and
   correct as a rule, and the node is one click away under *Represented canonical steps*. I record
   it because it is a real cost of an otherwise good rule. (One of my three least-sure calls.)
3. **Trigger reads `Trigger Issued document requires distribution Authoritative`.** Corpus-wide
   item D6 in `DECISIONS-PENDING.md`; not re-litigated here.

**Final orchestration: Single, with event-or-timeout resolution. Unchanged.**
One message, one recipient, one version. There is no second business moment: the document has
either arrived or it has not, and "has not" is somebody else's journey (CMS-208). A cascade here
would send the same document twice, which is precisely what `s.g1` and the `document_distribution.touches`
budget of 1 forbid. The event-or-timeout half is what makes it good: the timeout does not assume
delivery, it records *unknown* and hands off.

**Final customer channels:** `email`. Only. No role label on the card.

**Customer touch count:** **1.**

**Final flow** — identical to current. No canonical graph change.

**State re-checks:** one, and it is enough — `w.distribution.recheck` re-reads the issued version
from the system of record before acting on the timeout, so a version superseded during the delivery
window is not reconciled as though it were still current.

**Stop conditions:** `distribution_confirmed` → `x.distributed` · `distribution_failed` →
`h.recover` · window elapsed with neither → `h.reconcile`. There is no path on which this journey
sends again.

**Ownership / handoff:** `h.recover → CMS-208` (not public, renders as a name not a link) carrying
`message_id` + `destination_id` and *"the explicit requirement that any fallback route carries the
same version"*. `h.reconcile → external:external-status-reconciliation` carrying *"the document
remains valid and issued regardless of how this resolves"*. Both are correct and both stay.

**Canonical changes needed**

- **None to the graph.** One field: drop `channelStrategy.fallback` or set it to a value that says
  "no fallback" — a one-role strategy cannot fall back to anything, and leaving the field populated
  is what feeds the false label. *(Low priority; F1's renderer fix makes it cosmetic.)*

**Display-only changes needed**

- No role label row when the plan has exactly one role: render the `Email` pill alone. (F1.)

**Renderer changes needed:** F1 (see the consolidated section).

---

# DOC-215 · Signature Reminder

**Purpose.** Collect every required signature against **one exact version**: request once per
signer, remind outstanding signers once, and end honestly — expired is not declined, and a deadline
nobody set is never invented.

**Current flow** (21 canonical nodes → 13 drawn)

```
t.requires (document_requires_signature)
  → a.define (signers, authority, order, scope, window)        [not drawn]
  → c.window  "Is a signature validity window defined?"
       ├─ Defined     → a.bounded    [not drawn] ┐
       └─ Not defined → a.unbounded  [not drawn] ┴→ a.request
  → a.request  EMAIL  (AWAITING_SIGNATURE, bound to the version)
  → w.signatures  until signer_signed | signer_declined | document_version_superseded
       │            timeout = signature.reminder_point (3–5 days, example-only, confidence LOW)
       ├─ on event   → c.event "What happened?"
       │      ├─ signed     → a.record-sig [nd] → c.complete "All required signatures complete?"
       │      │                                     ├─ All  → a.fully-signed [nd] → h.effective → DOC-216
       │      │                                     └─ Some → back to w.signatures
       │      ├─ declined   → a.declined [nd] → h.declined → external:operational-resolution
       │      └─ superseded → a.superseded [nd] → x.superseded
       └─ on timeout → c.reminder-useful "Would a reminder still change anything?"
              ├─ It would     → a.remind  EMAIL  → w.expiry
              └─ It would not → w.expiry
  → w.expiry  same until-set, timeout = signature.validity_window
       ├─ on event   → c.event  (same three answers)
       └─ on timeout → a.expired [nd] → x.expired
```

This is the corpus's textbook **event-or-timeout** and it is already modelled correctly: the wait
listens for the real terminating events *and* for the window closing, and the timeout arm re-reads
state (`w.signatures.recheck`: *"who has signed the correct version, who declined, whether the
version still stands"*) before it will send anything.

**Problems found**

1. **`c.window` is a no-op diamond on the canvas.** Both branches converge on `a.request`, and both
   of the branch's own actions are already absorbed as bookkeeping. What the reader sees is a
   Decision card whose two arms (merged by P-MERGE-01 into one edge labelled `Defined · Not
   defined`) point at the same next card. The split is real *data* — it decides what the message may
   claim and what `w.expiry` binds to — but it is not a **route**, and the brief's canvas rule is
   that a condition stays visible when it materially changes the customer's **path**. It does not.
2. **The one-reminder gate is per-process; the stated rule is per-signer.** `s.one-reminder` reads
   *"One reminder per signer; a second is a re-request the process does not make"*, and `t-remind`'s
   purpose is *"Remind only the signers still outstanding"*. But `c.reminder-useful`'s send arm
   fires only when *"no reminder has been sent **on it** yet"* — on the process. Under a signing
   **order** (which `a.define` explicitly captures) signer 2 becomes actionable only after signer 1
   signs; if the single process-level reminder was already spent on signer 1, signer 2 is never
   reminded at all. The design matrix's "2 per signer" is therefore true only for the first
   outstanding set.
3. **The wait card renders `3 days–5 days` as if it were authoritative.** That `Config` carries
   `confidence: "low"`, `basis: "example-only"`, `applicableWhen: "a validity window of weeks"` and
   `avoidWhen: "no validity window — the review point is the bound"`. It is the only wait in my six
   that renders a duration at all; the other five render their `until` sentence. On the
   *Not defined* branch the stated number is explicitly wrong by its own `avoidWhen`, and `s.no-invented-deadline`
   is the journey's own guardrail against exactly that. A page showing `3 days–5 days` with no mark
   is close to `AGENTS.md`'s "never put a fabricated number on a page".
4. **Title vs scope.** The library card says *Signature Reminder*; the journey owns request,
   collection, completion, decline, supersession and expiry. The reminder is one of its two touches.
   The slug (`signature-process`) is right. Cosmetic, recorded, not proposed.
5. `Primary Email` over a one-channel plan. F1.

**Final orchestration: event-or-timeout, with one sequential gated reminder. Unchanged.**
This is the pattern the whole corpus should be copying from, and the reason is the `until` set:
the wait ends on *signed*, *declined* or *superseded* — three ways the reminder stops being useful —
and only the fourth outcome (nothing happened) reaches a send, and then only after a re-check.
No segment split, no channel choice, no urgency ladder. **Do not touch the shape.**

**Final customer channels:** `email`. Only. Resisted: SMS "your signature is needed" (cannot carry
the document, and there is no urgency the request's own terms set), push (no persistence for a legal
artifact), in-app (a required signer frequently has no product session at all — the same argument
that fixes REL-284 below).

**Customer touch count:** **2 per signer** (request + one reminder), and only if that signer is
still outstanding at the reminder point.

**Final flow** — graph unchanged. Display:

```
Document requires signature
  → Signature request  ·  Email
  → Wait  (until signed, declined or superseded — reminder point before the validity boundary)
       ├─ Decision "What happened?"  → signed / declined / superseded
       │      signed → Decision "Are all required signatures complete?"
       │                 ├─ All complete → Handoff · Document Effectiveness Validation
       │                 └─ Some remain  → back to Wait
       │      declined   → Handoff · Operational resolution
       │      superseded → Exit · Signature process ended
       └─ Decision "Would a reminder still change anything?"
              ├─ It would     → Reminder · Email  → Wait to the validity boundary
              └─ It would not → Wait to the validity boundary
  → Wait to the validity boundary → (same three answers) / Exit · SIGNATURE_EXPIRED
```

**State re-checks:** both, and both are genuine — `w.signatures.recheck` and `w.expiry.recheck` each
re-read the version and every signer before the timeout is acted on. This is the corpus's best
instance of "never send a reminder after success": a signer who signed is dropped from the
outstanding set by the re-read, not by a suppression rule.

**Stop conditions:** `signer_signed` (per signer, feeding `c.complete`) · `signer_declined` ·
`document_version_superseded` — which additionally **suppresses outstanding requests**, stated in
`s.version` and enacted at `a.superseded` · the validity window elapsing → `x.expired`, recorded as
*expired*, never as refused.

**Ownership / handoff:** `h.effective → DOC-216` carrying *"signed is not effective"* explicitly.
`h.declined → external:operational-resolution` carrying *"the document remains validly issued — what
is absent is agreement rather than the artifact"*. Both correct, both stay.
Open item A4 (TIM-268's generic obligation eligibility swallows DOC-215) is unresolved and is not
mine to close; DOC-215 should join the `obligation-reminder` exclusion group stating its own side —
a signature request is scoped to a document version and outranks a bare due-date reminder.

**Canonical changes needed**

1. `c.reminder-useful` branch 0 `when`: replace *"no reminder has been sent on it yet"* with
   *"this signer has not been reminded yet"*; align `s.one-reminder` to the same scope. No node
   added, no touch added to any signer — it changes which signers the single reminder addresses.
2. Optional, and I lean no: nothing else.

**Display-only changes needed**

1. **Absorb `c.window` into the `Signature request` card.** Generic rule, expressible without a
   journey id: *a condition whose branches all converge on the same successor, and every branch's
   action is itself absorbable, is not a route* — the card it converges on represents it and lists
   it under *Represented canonical steps*. (P-FORK-NOOP-01, 2 journeys corpus-wide. Small; I still
   think it is right, because a Decision that decides nothing visible is worse than a missing card.
   **One of my three least-sure calls** — it is the same shape as the `c.eligible` rule that
   `audit/reference-example.md` deliberately did not ship.)
2. **Mark an example-only duration on the wait card.** Where `Config.default.basis ===
   "example-only"` or `confidence === "low"`, the wait card should render the `until` sentence
   instead of the number, or the number with an explicit "example" qualifier. Generic — it reads
   two fields every `Config` already carries, and it is the only defence the canvas has against
   presenting an illustrative default as a commitment.
3. One-role plan → no `Primary` row. (F1.)

**Renderer changes needed:** F1, plus the example-only wait treatment in (2) above if it is
implemented on the card rather than in the view model.

---

# INC-254 · Incident Update

**Purpose.** Tell the people actually affected something **true and useful**, through the mechanism
that already owns delivery — and say nothing when nothing has changed.

**Current flow** (14 canonical nodes → 9 drawn). **Zero wait nodes. Verified in the export:**
`canonicalNodes.filter(n => n.type === "wait").length === 0`, and the matrix's open item 13 is
correct on the facts.

```
t.relevant (incident_reaches_communication_relevant_state)
  → a.determine  (what is known, what is not, what action, what the next-update condition is)  [nd]
  → c.cohort  "Can the affected cohort be identified with reasonable precision?"
       ├─ It can         → a.scoped [nd] ┐
       └─ It cannot yet  → a.broad  [nd] ┴→ c.verified
  → c.verified  "Is what would be said actually confirmed?"
       ├─ Confirmed     ──────────────────┐
       └─ Not confirmed → a.hold-claim [nd]┴→ c.material
  → c.material  "Does this materially change the guidance the recipient already has?"
       ├─ It does                                  → a.communicate
       ├─ It does not, and no commitment requires  → a.no-send [nd] → x.no-send
       └─ It does not, but a commitment requires   → a.communicate
  → a.communicate   EMAIL + IN-APP (one send, two surfaces)
  → c.final  "Is this the resolution notice for this recipient scope?"
       ├─ It is     → x.closed-comms
       └─ It is not → x.updated
```

## The missing wait — what it is and what it means

**The absence is the design, and the design is right.** Three independent pieces of evidence:

1. The trigger's own `evidence.insufficientAlone` is *"time having passed since the last update,
   which is not itself information"*. A wait is a clock. Binding the next update to a clock is the
   precise thing the trigger refuses.
2. `x.updated`'s state string: *"update issued; the next update is bound to a stated condition
   rather than to a clock"*, and its `reEntry`: *"the stated condition occurring, or a material
   change, produces the next update"*.
3. **The instance key is `["incident_id", "recipient_cohort_id", "state_change_id"]`.** This is the
   load-bearing fact and it answers the touch-count question directly.

### So how does a journey with no wait produce more than 3 touches?

**It does not — per instance.** Because `state_change_id` is part of the key, **each material state
change is its own instance**, and each instance sends exactly one message. The multi-touch incident
narrative (first notice → scope corrected → workaround → fix in progress → resolved) is **five
instances of a one-touch journey**, not one instance of a five-touch journey. `audit/journey-blueprints.md`
states this outright: *"Each material change is its own instance, which is why one message per
instance is correct."*

That is why INC-254 legitimately exceeds three touches **to a person over an incident** while
carrying a `localCap` of **1** and a single `orchestration.touches` entry — and the brief's
requirement that I document what makes each additional touch a new fact is satisfied structurally
rather than by argument: **a touch only exists if a new `state_change_id` exists, and a
`state_change_id` only exists if the incident's authoritative state changed.** Time passing creates
no key, so it creates no touch. This is a genuinely better mechanism than a touch budget, and it is
the reason this journey does not need a cap to behave.

`c.material` is the second guard: even given a new state change, if the guidance the recipient
already holds is unchanged, the instance exits at `x.no-send` — **recorded, with a reason, not
silently skipped**. An incident journey with an explicit "we said nothing, and here is why" ending
is rare and should be protected.

### Verdict on open item 13

**Option (a): correct the orchestration map's Event-or-timeout list to exclude INC-254.** Do not add
a wait. The matrix already omits it and counts 61 of 69 rather than the map's arithmetic; it is the
map that is wrong. Adding the "stated-condition wait" of option (b) would turn a journey whose whole
point is *no clock* into one with a clock, and would also make the instance key incoherent — a wait
inside an instance keyed on `state_change_id` is waiting for a state change that would, by
definition, start a different instance.

**Problems found**

1. **`Primary Email / Fallback In-app`.** F1, and here it inverts the authored design. Both the
   matrix and the map record INC-254 as **Parallel**, justified as *"Email carries the record to
   people who are not in the product; the in-app surface reaches whoever is hitting the fault right
   now. Neither is interruptive, so this is not two alarms."* The card says "try email, fall back to
   in-app". These are contradictory claims about the same send. Worst instance of F1 in the corpus.
2. **`orchestration.touches[t1].mandatory: false`.** An incident notice — including the resolution
   notice, which is the same node — is a service obligation to a cohort that was already told
   something. Marking it discretionary lets a pressure cap suppress the message that closes a loop
   we opened. `pressureClass` is already `"service"`; `mandatory` should agree.
3. **`measurement` has no `businessOutcome` and `goal.event` is `null`.** Every other journey in my
   six declares one. INC-254's outcome is coverage — did the resolution notice reach the scope that
   was told — and nothing measures it. Flagged; the fix is a measurement-plumbing decision I do not
   think belongs in a display refactor.
4. `c.final` is an **exit classifier**, not a customer-path decision: the message has already gone
   and both arms are exits. I considered absorbing it and decided **against**. "This is over for
   you" vs "there is more coming" is the single most reader-relevant fact on an incident canvas, and
   collapsing it would leave two exits joined to one send with nothing saying which is which.
   Endings are never collapsed. **Keep drawn.**

**Final orchestration: Parallel — one send, two surfaces, simultaneously. Unchanged.**
This is one of only two genuine Parallel journeys in the public corpus and it qualifies on the
brief's own terms: the two channels serve **different purposes for different people** (a durable
record for those outside the product; a live surface for whoever is hitting the fault now), not one
purpose with a substitute. Neither interrupts. The design is right; only its label is wrong.

**Final customer channels:** `email` **and** `in_app`, together, labelled as two roles — not as a
priority chain.

**Customer touch count:** **1 per instance**, i.e. 1 per material state change, unbounded across an
incident by construction and bounded by the incident's own state machine.

**Final flow** — graph unchanged; only the send card's channel presentation changes.

**State re-checks:** `a.determine` is the re-read, and it runs before anything is scoped: what is
known, what is not, what action is needed, and the condition under which the next update happens.
There is no later touch inside an instance, so there is nothing to re-check before.

**Stop conditions:** `x.no-send` where nothing material changed and no commitment requires an update
(recorded with a reason). `x.closed-comms` where the resolution notice reached the scope that was
told — and `x.closed-comms.reEntry` is the best line in my six: *"a relapse is communicated as a
relapse rather than as a new incident, because the recipients were told it was over."*

**Ownership / handoff:** none, correctly. `a.communicate` explicitly raises the send through the
canonical communication mechanism rather than building a delivery path, which is a dependency, not
a handoff.

**Canonical changes needed**

1. `orchestration.touches[t1].mandatory: false → true`.
2. Correct `audit/channel-orchestration-map.md`'s Event-or-timeout roster to exclude INC-254
   (open item 13, option (a)). Documentation, not canonical — but it is the item the matrix is
   waiting on.
3. **Not** a wait node. Under any reading.
4. Optional / flagged: give `measurement.businessOutcome` an event. Out of scope here.

**Display-only changes needed**

- Nothing beyond F1. 14 → 9 nodes is already a good projection, the three decisions drawn are all
  business logic, and all three exits are drawn.

**Renderer changes needed:** F1 — and INC-254 is the regression test for it. After the change this
card must read `In the product · In-app` / `Record · Email` (or equivalent), and must not contain
the word *Fallback* / *Yedek* in either locale.

---

# REL-284 · Invitation Reminder

*(The least-documented of my six. Read before classifying: despite the title, this is not a
reminder journey — the reminder is one of its four touches.)*

**Purpose.** Put a proposed link in front of the party who has to accept it, **on terms they can see
before they answer**, and close the question one way or the other before the invitation goes stale.
The subject is the *invitation*, not either party: `instanceKey: ["invitation_id"]`.

**Current flow** (13 canonical nodes → 14 drawn; nothing absorbed, `x.expired` instanced twice)

```
t.invited (relationship_invitation_issued — with a named counterparty, a scope, a direction and an expiry)
  → c.known  "Does the counterparty already exist here in their own right?"
       ├─ Existing holder → a.invite-known  EMAIL + IN-APP
       └─ New to us       → a.invite-new    EMAIL + IN-APP
  → w.response  until invitation_accepted | invitation_declined | invitation_withdrawn
       │          timeout = relationship_invitation.response (the point at which one reminder
       │          would still leave time to act, measured back from expiry; required, no default)
       ├─ on event   → c.response "How was the invitation answered?"
       │      ├─ Accepted            → a.confirm  EMAIL + IN-APP, TO BOTH SIDES → x.active
       │      └─ Declined/withdrawn  → x.closed  (terminal: true — never revived)
       └─ on timeout → c.remind "Is a reminder still worth sending?"
              ├─ Time remains  → a.remind  EMAIL + IN-APP → w.final
              └─ Window closed → x.expired
  → w.final  same until-set, timeout = the invitation's own expiry
       ├─ on event   → c.response
       └─ on timeout → x.expired
```

**What it actually is:** an invitation lifecycle with a **segment-based opening**, an
**event-or-timeout** middle, a **single** reminder and a **two-recipient confirmation**. The matrix
classifies it *Segment-based, Sequential, Single, Event-or-timeout — justified: only one of the
three is a chase*. That holds up.

**Problems found**

1. **The segment split is real, but the channel does not follow it — and it cannot.**
   `c.known`'s second branch is defined as *"the counterparty **has no record here** and knows the
   inviting party but not us"*. Someone with no record here **has no in-app surface**. Yet
   `a.invite-new` declares the identical `channelRoles: ["persistent","in-session"]` as
   `a.invite-known`, and the card advertises an in-app route to a person who cannot be reached in
   the app. This is the clearest evidence-backed channel defect in my six, and the signal is in the
   branch's own `when` string — nothing is invented to fix it.
2. **`Primary Email / Fallback In-app` on all four sends.** F1.
3. **`a.confirm` is `mandatory: false`.** `s.g3` — *"Scope and direction are stated in the
   invitation itself, not discovered after acceptance"* — and `a.confirm`'s own headline — *"An
   unstated scope is assumed to be total by whoever has less to gain from it"* — together make the
   confirmation the message that prevents the journey's worst failure. A discretionary budget must
   not be able to drop it.
4. **`c.remind`'s "and no reminder has been sent for it" clause is dead.** `c.remind` is reachable
   only from `w.response`'s timeout, which fires once, and there is no edge back to it. Harmless;
   noted so an implementer does not build state for a guard that cannot fire.
5. **Title vs scope.** *Invitation Reminder* names the third-most-important touch. The slug
   (`relationship-invitation`), the purpose, the entity note and the category all describe an
   invitation lifecycle. Recommend renaming the display title to **Relationship Invitation** /
   **İlişki Daveti**. It is `title.en` / `title.tr` only; REL-284 is not one of the five ids
   `src/lib/journey-marketing.ts` hard-references, so nothing throws.
6. Open item A4: REL-284 is one of the eight journeys TIM-268's generic eligibility still swallows.
   Not mine to close; recorded.

**Final orchestration: Segment-based opening → event-or-timeout → single reminder → dual-recipient
confirmation. Pattern unchanged; the segment is made to do real work.**

The split earns its place three times over: different *content* (an existing holder asks what
accepting **costs** them; a stranger reads an unexplained invitation as a claim already made),
different *reachability* (only one of them has a product session), and different *framing risk*.
It is currently doing only the first of the three. Making it also drive the channel is the change.

**Final customer channels**

| touch | recipient | channel | why |
|---|---|---|---|
| `a.invite-known` | existing holder | `in_app` + `email` | They have a session; the in-app surface is where they will act, the email is the record of terms they can re-read. Two roles, no fallback relation. |
| `a.invite-new` | counterparty with no record | **`email` only** | They have no in-app surface. The invitation must persist and carry the scope statement. Declaring in-app here is a channel that cannot fire. |
| `a.remind` | counterparty | same as the invite that was sent | One reminder on the route that already reached them. Not a new channel, not an escalation — `s.g4`: *"the expiry is the pressure; repetition is not."* |
| `a.confirm` | **both sides** | `email` + `in_app` per side as above | A statement of scope and direction that both parties will be held to must persist. |

**Customer touch count:** **3 to the counterparty** (invitation, one reminder, confirmation) and
**1 to the inviting party** (confirmation). Matches `relationship_invitation.touches` = 3.

**Final flow**

```
Relationship invitation issued
  → Decision "Does the counterparty already exist here in their own right?"
       ├─ Existing holder → Invitation · In-app + Email
       └─ New to us       → Invitation · Email
  → Wait (until accepted, declined or withdrawn — reminder point, measured back from expiry)
       ├─ Decision "How was the invitation answered?"
       │      ├─ Accepted           → Confirmation · to both sides · Email (+ In-app where held)
       │      │                        → Exit · Link active, both identities intact
       │      └─ Declined/withdrawn → Exit · Invitation declined or withdrawn  (terminal)
       └─ Decision "Is a reminder still worth sending?"
              ├─ Time remains  → Reminder · same route as the invitation → Wait to expiry
              └─ Window closed → Exit · Expired unanswered
  → Wait to the invitation's own expiry
       ├─ → Decision "How was the invitation answered?"
       └─ → Exit · Expired unanswered
```

**State re-checks:** both waits re-read the invitation from the system of record before acting on
the timeout, which is what stops a reminder going out on an invitation the inviting party withdrew
during the response window. Correct and already there.

**Stop conditions:** `invitation_accepted` · `invitation_declined` · `invitation_withdrawn` — all
three in **both** waits' `until` sets, which is the right answer and is what RLT-279 below gets
wrong. Plus the invitation's own expiry → `x.expired`. `x.closed` is the only `terminal: true` exit
in my six: *"a declined one is never revived."*

**Ownership / handoff:** none. `distinctFrom` correctly separates REL-91 (decides whether a link has
an authoritative basis) and SUB-161 (owns an agreement with a term).

**Canonical changes needed**

1. `orchestration.touches[t2].channelRoles` (`a.invite-new`): `["persistent","in-session"]` →
   `["persistent"]`. The counterparty has no in-app surface by the branch's own definition.
2. `orchestration.touches[t4].channelRoles` (`a.remind`) → `["persistent"]`. The reminder follows
   the invitation's route, and the route that is always available is the persistent one.
3. `orchestration.touches[t3].mandatory: false → true` (`a.confirm`).
4. Cosmetic, recommended: `title.en` → "Relationship Invitation", `title.tr` → "İlişki Daveti".
5. Optional cleanup: drop the dead *"and no reminder has been sent for it"* clause from
   `c.remind` branch 0's `when`.

**Display-only changes needed**

- Nothing structural. 13 → 14 with two `x.expired` instances is per-parent instancing working
  correctly: each branch keeps its own ending beside it.

**Renderer changes needed:** F1.

---

# RLT-279 · Upgrade Blocker Reminder

**Purpose.** Tell the holder of a blocked target **the one specific thing** standing between it and
the change, while there is still enough preparation window left to clear it — and ask nothing of a
holder who cannot clear it.

Same family as TIM-268 *Action Required Reminder* and ACC-263 *Activation Reminder*, and one of the
three reference journeys ACT-13/ACT-14 were aligned to. **It stays in that family and it stays
simple.**

**Current flow** (13 canonical nodes → 15 drawn; `h.resume` and `x.unprepared` each instanced twice)

```
t.blocked (target_held_on_named_prerequisite — the blocker NAMED, not described, window time left)
  → c.resolvable  "Can the holder clear this blocker themselves?"
       ├─ Theirs to clear → a.name-blocker  IN-APP + EMAIL  → w.clear
       └─ Not theirs      → a.inform-hold   IN-APP + EMAIL  → x.held   [classed "success"]
  → w.clear  until named_requirement_satisfied | change_withdrawn
       │       timeout = upgrade_blocker.clear (the point past which the target cannot be made
       │       ready in time, inside the preparation window; required, no default)
       ├─ on event   → c.cleared "What ended the wait?"
       │      ├─ Blocker cleared  → h.resume → RLT-242
       │      └─ Change withdrawn → x.moot
       └─ on timeout → c.last-call "Is a second prompt still worth sending?"
              ├─ Time remains  → a.last-call  IN-APP + EMAIL → w.final
              └─ Window closed → x.unprepared
  → w.final  until named_requirement_satisfied   ←── change_withdrawn IS MISSING
       ├─ on event   → h.resume  (direct, no condition)
       └─ on timeout → x.unprepared
```

**Problems found**

1. **`w.final.until` is `["named_requirement_satisfied"]` — `change_withdrawn` is missing.**
   `w.clear` listens for both. `w.final` listens for one. So a change withdrawn *after* the last
   call cannot end the instance: it runs to the window close and exits `x.unprepared` —
   *"preparation window closed with the blocker outstanding"* — recording a target as unprepared for
   a change that no longer exists. `s.g4` says *"Not ready is not failed"*; this fails in the other
   direction, recording a moot target as unprepared. This is structurally the same bug as open item
   14 (RET-30's `w.outcome.until` missing `cancellation_confirmed`), which was fixed as a **P0**.
   `change_withdrawn` already exists in `src/canonical/events.ts:94` — no registry change.
2. **`x.held` is classed `success`.** The state is *"held on a blocker the holder cannot clear"*.
   The journey's `businessOutcome.event` is `named_requirement_satisfied`, which on this path is
   structurally unreachable — nothing is asked, nothing can be cleared, the instance ends. Classing
   it `success` puts every not-theirs-to-clear target into the success numerator. `journey-blueprints.md`
   records the class (*"held (not theirs to clear — success class)"*) without questioning it.
   Recommend **`no-action`**: nothing was asked and nothing could be done. `invalid-state` is the
   defensible alternative. **One of my three least-sure calls** — see the closing section.
3. **`w.final.onEvent → h.resume` directly, with no condition.** Correct only while the wait listens
   for exactly one event. The moment `change_withdrawn` is added (fix 1) it would hand a withdrawn
   change to RLT-242 as "ready". The fix is free: route `w.final.onEvent` to the **existing**
   `c.cleared`, whose question — *"What ended the wait?"* — and whose two branches
   (`Blocker cleared → h.resume`, `Change withdrawn → x.moot`) are already exactly right. Two
   canonical edges; no new node; the display node count drops by one because `h.resume@w.final`
   collapses into `h.resume@c.cleared`.
4. **`Primary In-app / Fallback Email` on all three sends.** F1. And here it is specifically wrong
   in *order*: `a.name-blocker` and `a.last-call` both name **a date after which the change can no
   longer be applied** and ask for work done outside the product (free capacity, move off a version,
   accept a dependency). That is a persistent-record message. In-app is where they may see it if
   they happen to be live; it is not the primary route and it is certainly not the thing email falls
   back from.
5. **All three touches are `mandatory: false`.** `a.name-blocker` is the entire reason the journey
   exists — if it is suppressed, the holder is never told why the target is held, which is the
   failure `s.g1` names. `a.inform-hold` likewise carries a fact nobody else will deliver. The
   last call is legitimately discretionary.
6. Open item A4: RLT-279 is one of the eight TIM-268 still swallows. Recorded, not mine.

**Final orchestration: Conditional routing on who can act, then event-or-timeout with one gated
last call. Unchanged — and kept in the TIM-268 / ACC-263 family.**

`c.resolvable` is a real business decision by the brief's test: it changes the message, the number
of touches (2 vs 1), whether anything is asked at all, and the ending. It is not an implementation
gate, its short arm does not record a suppression reason, and it must stay drawn.

**Final customer channels:** `email` (persistent — the dated, actionable prompt) and `in_app` (the
in-product surface where the holder is live). Two roles, **no fallback relation**, and the persistent
role stated first because the message names a date and requires work outside the product. Resisted:
SMS (this is an infrastructure change window, not a payment deadline), push, and any escalation
ladder across the two prompts — `s.g3` requires both prompts to name **the same blocker and the same
date**, so escalating the channel between them would contradict the content rule.

**Customer touch count:** **2** on the actionable path (name the blocker, then one last call);
**1** on the not-theirs path (inform, ask nothing). There is no third — *"a blocker nobody has
cleared twice is a decision, not an oversight."*

**Final flow**

```
Target held on a named prerequisite
  → Decision "Can the holder clear this blocker themselves?"
       ├─ Theirs to clear → Name the blocker · Email + In-app  (the one prerequisite, what clearing
       │                     it involves, and the date it stops mattering)
       └─ Not theirs      → Hold notice · Email + In-app  (held, and why — nothing asked)
                              → Exit · Held on a blocker the holder cannot clear   [class: no-action]
  → Wait (until the prerequisite is satisfied or the change is withdrawn — to the point past which
          the target cannot be made ready in time)
       ├─ Decision "What ended the wait?"
       │      ├─ Blocker cleared  → Handoff · Change Readiness (RLT-242)
       │      └─ Change withdrawn → Exit · Change withdrawn before the blocker was cleared
       └─ Decision "Is a second prompt still worth sending?"
              ├─ Time remains  → Last call · Email + In-app (same blocker, same date) → Wait
              └─ Window closed → Exit · Preparation window closed with the blocker outstanding
  → Wait to the window's close (until satisfied OR withdrawn)
       ├─ → Decision "What ended the wait?"   ← now shared, instead of a bare handoff
       └─ → Exit · Preparation window closed with the blocker outstanding
```

**State re-checks:** both waits re-read the target before acting on the timeout, so the last call is
not sent against a blocker that cleared during the window. With fix (3), the post-last-call path
also re-reads *why* the wait ended instead of assuming.

**Stop conditions:** `named_requirement_satisfied` → `h.resume` · `change_withdrawn` → `x.moot`
(**on both waits, after fix 1**) · the preparation window closing → `x.unprepared`.

**Ownership / handoff:** `h.resume → RLT-242` *Change Readiness* (not public; renders as a name, not
a link) carrying *"what the holder was told, so readiness is not announced to them twice"* — which
is exactly the kind of carry the corpus should be copying. `distinctFrom` correctly separates
RLT-242 (owns the blockers) and RLT-241 (owns scope).

**Canonical changes needed**

1. `w.final.until`: `["named_requirement_satisfied"]` → `["named_requirement_satisfied",
   "change_withdrawn"]`. **P0-equivalent.**
2. `w.final.onEvent`: `h.resume` → `c.cleared`. No new node.
3. `x.held.class`: `"success"` → `"no-action"`.
4. `orchestration.touches[t1].mandatory` (`a.inform-hold`) and `[t2].mandatory`
   (`a.name-blocker`): `false` → `true`. Leave `t3` (`a.last-call`) discretionary.
5. Reorder `channelRoles` on all three touches to `["persistent","in-session"]` so the record-bearing
   role is stated first. *(Order-only; it changes the card's row order, not the channel set.)*

**Display-only changes needed**

- None beyond F1. After canonical fix (2) the display drops from 15 to 14 nodes because the second
  `h.resume` instance merges; that is a consequence, not a display rule.

**Renderer changes needed:** F1.

---

# RSK-273 · Usage Limit Alert

**Purpose.** Meet somebody at the moment a limit stops them with the three facts that decide what
happens next — what the limit is, when it resets, and whether more capacity can be bought —
**without any of it reading as an accusation**.

**Current flow** (13 canonical nodes → 13 drawn; `w.capacity` collapsed into `c.outcome` by
Family B, `x.blocked` instanced twice)

```
t.blocked (limit_reached_and_action_blocked — an AUTHORITATIVE usage figure AND an action actually blocked)
  → a.at-the-wall   IN-APP + EMAIL   (which limit, the usage against it, when the window resets)
  → c.path  "What path exists from here?"
       ├─ Capacity is purchasable → c.decider
       ├─ Resets on its own       → w.capacity
       └─ Neither                 → x.blocked
  → c.decider  "Does the person who hit the limit hold the capacity decision?"
       ├─ Theirs to decide → a.offer-self          IN-APP + EMAIL → w.capacity
       └─ Held elsewhere   → a.offer-holder        IN-APP + EMAIL   → to the DECISION HOLDER
                              → a.notify-blocked-party  IN-APP + EMAIL → to the BLOCKED PARTY
                                 → w.capacity
  → w.capacity  until capacity_authorised | limit_reset | held_action_abandoned
       │          timeout = usage_limit.capacity, attribute-bound to the AUTHORITATIVE
       │          window_resets_at; required, no default. "No reset point is ever invented."
       └─ both arms → c.outcome "What changed?"
              ├─ Capacity authorised → h.capacity → SUB-166
              ├─ Window reset        → a.reset   IN-APP + EMAIL → x.reset
              └─ Still blocked       → x.blocked
```

## The `a.reset` recipient — open item 12 / blueprint F5f / DECISIONS-PENDING C4

**Verified.** Four communication actions fire on the held-elsewhere path
(`a.at-the-wall`, `a.offer-holder`, `a.notify-blocked-party`, `a.reset`), which is 3 per recipient
**only if `a.reset` goes to one of the two parties and not both**. The canonical data does not say
which. `a.reset`'s headline — *"Say the window has reset and the held action can proceed"* — and
`touches[t5].purpose` — same wording — name no recipient, and the schema has no recipient field: the
corpus expresses recipient in prose (`a.offer-holder`: *"Tell the party who holds the decision…"*;
`a.notify-blocked-party`: *"Tell the person whose action is held…"*). `a.reset` is the only one of
the five that omits it, on the only path where it is ambiguous.

### Who should receive it: **the party whose action was held.** Always, on both paths.

Four reasons, all from the journey's own data:

1. **The message's content only makes sense to that person.** *"The held action can proceed"* is an
   instruction to resume. The decision holder has no held action to resume.
2. **The instance is keyed on `["entity_ref","limit_id","window_id"]`** — the entity and its limit.
   The decision holder is a participant on one branch, not the subject.
3. **`s.g4` does not require it.** The rule reads *"Where the capacity decision belongs to somebody
   else, **both parties are told** — the one waiting and the one who can end the wait"*, and it is
   satisfied at the moment of the block, by the `a.offer-holder` / `a.notify-blocked-party` pair.
   A reset is not the capacity decision; it is the wait ending **without** one.
4. **`measurement.guardrails` includes `message_after_success`.** On a reset the decision holder's
   ask has simply lapsed — nothing they did succeeded or failed. Sending them a notice about
   somebody else's unblocking is precisely a message after the fact with no action in it.

**This takes option (a) — state the party — which is also `DECISIONS-PENDING.md`'s own
recommendation.** I reject option (b) explicitly: splitting the reset into two notices would give
RSK-273 the corpus's **only second Parallel pair**, and it would spend a touch telling somebody a
wait they were not in has ended.

**The holder is not left hanging**, and this is the part that makes option (a) safe without adding
anything: `touches[t3].purpose` already requires `a.offer-holder` to state *"what the reset
alternative is"*, and `a.notify-blocked-party` already gives the blocked party *"the authoritative
point at which the window resets anyway"*. Both parties therefore hold the reset date **before** the
wait begins. The one improvement worth making is a sentence, not a node: `a.offer-holder` should say
that the ask lapses at that date — so a holder does not authorise capacity for a wait that has
already ended.

**Problems found**

1. `a.reset`'s recipient is unstated. Above.
2. **All five sends declare the identical `channelRoles: ["in-session","persistent"]`,** and all five
   render `Primary In-app / Fallback Email`. This is the flattening (F2) at its most visible,
   because RSK-273 is the journey where the recipients are provably in different places:
   - `a.at-the-wall` — the trigger *is* an action being blocked in the product. They are in-session
     by definition. The orchestration map already says **"In-app, at the point the action is
     stopped"**. An email duplicating a wall notice they are looking at is noise.
   - `a.offer-holder` — a **different party**, on the commercial side of the relationship, who was
     not in the product when the block happened and who has to make a spend decision. Email.
   - `a.reset` — fires at `window_resets_at`, which may be days later. The person left *because they
     were blocked*. The brief's own in-app rule: *"Do not rely on In-app alone to recover someone
     who has stopped using the product."* Email must carry it.
3. **`a.notify-blocked-party` is `mandatory: false`.** It is not an offer — it is the fact that the
   decision now sits with a named person, which `s.g4` makes a rule. The two genuine offers
   (`a.offer-self`, `a.offer-holder`) are correctly discretionary; this one is not.
4. `a.offer-holder → a.notify-blocked-party` is drawn as a **sequential chain**, which reads as
   "then". They are a Parallel pair to two different people — the action's own headline says so
   (*"separate sends to separate people on separate routes, and either one can fail without the
   other"*) — and the canvas cannot show it. This is the one place in my six where I think the
   display genuinely under-represents the design. I am **not** proposing a new node type for it;
   see Renderer changes for a minimal treatment.

**Final orchestration: Conditional routing on the path and on who decides, containing one justified
Parallel pair, resolved by event-or-timeout. Unchanged.**

Both conditions earn their place. `c.path` changes the ending (purchasable / resets / neither).
`c.decider` changes **who is written to** — the strongest form of a split the brief recognises, and
the one case in my six where a split changes the recipient rather than the copy. The Parallel pair
is justified on the brief's exact terms: two people, two different needs, neither interruptive.

**Final customer channels** — per touch, not per journey:

| touch | recipient | channel | why |
|---|---|---|---|
| `a.at-the-wall` | the blocked person | **`in_app`** | They are standing at the block. Definitional, and already stated in the orchestration map. |
| `a.offer-self` | the blocked person | `in_app` + `email` | The offer follows the wall notice in session; email carries the price and the free reset date they will compare later. |
| `a.offer-holder` | the decision holder | **`email`** | A different party, probably not in the product, making a spend decision that needs a record. |
| `a.notify-blocked-party` | the blocked person | **`in_app`** | They are still at the wall. |
| `a.reset` | **the blocked person** | **`email`** (+ `in_app` where they are live) | Fires at the authoritative reset, potentially days later, to someone who left because they were blocked. |

**Customer touch count:** **3 per recipient, maximum.** Blocked person: wall notice → offer *or*
blocked-party notice → reset notice. Decision holder: one offer. Matches the matrix's "3 per
recipient" and, with `a.reset`'s recipient stated, it is true without an assumption.

**Final flow**

```
Limit reached and action blocked
  → At the wall · In-app   (which limit, usage against it, when the window resets)
  → Decision "What path exists from here?"
       ├─ Capacity is purchasable → Decision "Does the person who hit the limit hold the decision?"
       │       ├─ Theirs to decide → Capacity offer · In-app + Email  (paid path AND the free reset)
       │       └─ Held elsewhere   → Offer to the decision holder · Email   ┐ two sends,
       │                             Notice to the blocked party · In-app   ┘ two people, together
       ├─ Resets on its own → (wait)
       └─ Neither           → Exit · At the limit with no route to more capacity in this window
  → Wait (until capacity is authorised, the window resets, or the held action is abandoned —
          to the AUTHORITATIVE window reset; no reset point is ever invented)
  → Decision "What changed?"
       ├─ Capacity authorised → Handoff · Plan Change Validation (SUB-166)
       ├─ Window reset        → Reset notice · to the party whose action was held · Email
       │                          → Exit · Window reset, capacity available again
       └─ Still blocked       → Exit · At the limit with no route to more capacity in this window
```

**State re-checks:** `w.capacity.recheck` re-reads the entity and its limit from the system of record
before the timeout is acted on, and `a.reset`'s own headline requires the reset to be *"taken from
the authoritative reset rather than an assumed clock"* — a re-check written into the message content
itself, which is the strongest form in the corpus. Nothing is sent on a guessed date.

**Stop conditions:** `capacity_authorised` → `h.capacity` · `limit_reset` → `a.reset` → `x.reset` ·
`held_action_abandoned` (in the `until` set, so an abandoned action stops the journey before the
reset notice — correct: there is no held action left to release) · neither, at the window's close →
`x.blocked`.

**Ownership / handoff:** `h.capacity → SUB-166` *Plan Change Validation* (not public). `distinctFrom`
is unusually good here and should be left alone: RSK-199 owns the block, the count and the reset —
this journey *"adds nothing operational"*; RSK-193 restricts in response to risk, and routing a
limit through it *"is how ordinary usage gets treated as suspicion"*.

**Canonical changes needed**

1. **State the recipient of `a.reset`** in the node's `does` prose and in `touches[t5].purpose`:
   *"Tell the person whose action was held that the window has reset and the action can proceed…"*.
   Closes open item 12 / C4 / blueprint F5f.
2. Add a fifth guardrail / suppression making the rule explicit and checkable, e.g.
   *"The reset notice goes to the party whose action was held. The capacity decision holder is not
   notified of a reset they were not waiting on."* This is what stops a later implementer from
   reading `s.g4` as covering the reset too.
3. Extend `touches[t3].purpose` (`a.offer-holder`) so the offer states that the ask lapses at the
   reset date. One sentence; no node, no touch.
4. `orchestration.touches[t4].mandatory: false → true` (`a.notify-blocked-party`).
5. Per-touch `channelRoles` per the table above: `t1 ["in-session"]`, `t2 ["in-session","persistent"]`,
   `t3 ["persistent"]`, `t4 ["in-session"]`, `t5 ["persistent","in-session"]`.

**Display-only changes needed**

- None structural. The Family B collapse of `w.capacity` into `c.outcome` (*"Until additional
  capacity is authorised / What changed?"*) is one of the 15 provably-safe merges and reads well.

**Renderer changes needed:** F1, plus the Parallel-pair treatment below.

---

# Consolidated renderer changes

## R1 · Name channel rows by their role, not by their position *(fixes F1; affects all 69)*

**Where:** `ChannelPriorityRow` and `CARD_TEXT.primary` / `.fallback`,
`src/components/ui/JourneyCanvasNodes.tsx:251–280` and `:318–319`; the same Primary/Fallback pair in
`src/components/ui/NodeDetailPanel.tsx:170–180`. Fed by `channelPlan`, built in
`touchChannelPlans()`, `src/lib/canonical-view.ts` (~`:553–580`), from
`Touch.channelRoles × channelStrategy.roles`.

**The rule, stated so it can be implemented without reading a journey id:**

1. **One role in the plan → no label column.** Render the channel pill alone. (DOC-214, DOC-215 stop
   saying `Primary` over a list of one.)
2. **Two or more roles → label each row with the role's own name**, from a closed `ROLE_LABEL` table
   keyed on the five role ids the corpus uses — `in-session` · `persistent` · `low-friction` ·
   `urgent` · `human` — authored EN/TR in `src/`, exactly like `TOUCH_STAGE_TR`. Each role already
   carries a `when` sentence in `channelStrategy.roles` that can seed the wording (`in-session`:
   *"the person is active in the product"*; `persistent`: *"the message has to be kept"*).
3. **Use the word *Fallback* / *Yedek* only where `channelStrategy.fallback === "next-eligible-role"`.**
   That is the corpus's own declaration of a role-to-role fallback, and it covers **14 of 69**
   journeys. The other **55 — including all six of mine — declare `same-role-other-channel`**, i.e.
   fallback happens *inside* a role, between the channels on one row. The current renderer states
   the opposite of the data on 55 journeys.

This is generic (three authored fields, no id branching), it is measurable (`audit/measure-display.mjs`
can count cards carrying a Fallback row before and after; expect a fall from ~55 journeys to ≤14),
and it is the change that most directly answers the brief's *"There is NO universal channel
orchestration model."*

**Follow-ups this creates, outside my file:** a `ROLE_LABEL` row-pair per role in `audit/glossary.md`
(the glossary's own rule 3: a new user-facing word is added to its table in `src/`, in both
languages, in the same commit), and a re-run of `audit/preset-locale.mjs` and
`audit/locale-sweep.mjs`.

## R2 · Say when two sends are one moment, not a sequence *(RSK-273; INC-254 benefits)*

`a.offer-holder → a.notify-blocked-party` is two sends to two different people at the same moment,
drawn as a chain. The signal already exists in authored data: two consecutive `execution:
"communication"` actions where the second's touch has **no `after`** pointing at the first and both
share the same `prerequisites` (here both are `["c.path","c.decider"]`). A minimal treatment —
a "together" marker on the connector, or the two cards drawn side by side on one rank — would be
enough. **I am not proposing a new node kind**, and if the signal turns out to be too thin corpus-wide,
leaving it drawn as a chain is acceptable; the cards' own text says they are separate sends.
*(Lowest-confidence of my renderer asks.)*

## R3 · Do not render an example-only duration as a commitment *(DOC-215)*

Where a wait's `Config.default` carries `basis: "example-only"` or `confidence: "low"`, the wait card
should render the `until` sentence rather than the number (or the number explicitly marked). DOC-215
is the only wait in my six that renders a duration and it is the only one whose default is
example-only — and its own `s.no-invented-deadline` forbids exactly the claim the card makes.
Generic: two fields every `Config` already carries.

---

# Summary table

| ID | before pattern | after pattern | channels (before → after) | touches | biggest change |
|---|---|---|---|---|---|
| **DOC-214** Document Delivery | Single + event-or-timeout | **unchanged** | email → email | **1** | Nothing. Deliberately left as a one-touch single; the only edit is removing a `Primary` label over a list of one. |
| **DOC-215** Signature Reminder | Sequential + single gated reminder + event-or-timeout | **unchanged** | email → email | **2** per signer | One-reminder gate re-scoped **per signer**, matching its own `s.one-reminder`; `c.window` absorbed as a no-op diamond; example-only duration stops rendering as a commitment. |
| **INC-254** Incident Update | Parallel, **no wait**, 1 touch/instance | **unchanged** | email + in-app → email + in-app, **as a Parallel pair, not a fallback chain** | **1** per material state change | The false `Fallback In-app` label removed; the missing wait confirmed correct (open item 13 → option (a)); touch marked mandatory. |
| **REL-284** Invitation Reminder | Segment-based + event-or-timeout + single reminder | **unchanged** | email + in-app on every send → **email only to a counterparty with no record here**; in-app only where a session exists | **3** counterparty / **1** inviter | The existing segment finally drives the channel — an in-app route was advertised to people the branch itself defines as having no record here. Confirmation made mandatory. |
| **RLT-279** Upgrade Blocker Reminder | Conditional routing + sequential + event-or-timeout | **unchanged** (stays in the TIM-268 / ACC-263 family) | in-app + email → email-led + in-app, no fallback claim | **2** actionable / **1** not-theirs | `change_withdrawn` added to `w.final.until` and its event arm routed through the existing `c.cleared` — a withdrawn change currently exits as "unprepared". `x.held` re-classed off `success`. |
| **RSK-273** Usage Limit Alert | Conditional routing + one Parallel pair + event-or-timeout | **unchanged** | one flat in-app+email plan on all five sends → **per touch**: in-app at the wall, email to the decision holder, email for the reset | **3** per recipient | `a.reset`'s recipient stated — **the party whose action was held** (open item 12 / C4, option (a)); blocked-party notice made mandatory. |

**Pattern distribution across the six (unchanged before → after):**
Single 3 (DOC-214, DOC-215, INC-254) · Event-or-timeout 5 (all but INC-254) · Sequential 3
(DOC-215, REL-284, RLT-279) · Conditional routing 2 (RLT-279, RSK-273) · Segment-based 1 (REL-284) ·
Parallel 2 (INC-254, RSK-273) · **Fallback 0**.

No journey in this set declares a fallback relation, and after R1 no card in this set will claim one.

---

# The three calls I am least sure about

1. **Absorbing `c.window` in DOC-215.** It is the same shape as `c.eligible`, which
   `audit/reference-example.md` deliberately *did not* ship a rule for, having measured that 3 of 9
   structural matches were real business logic. My case is narrower — all branches converge on one
   successor *and* every branch action is itself absorbable — and P-FORK-NOOP-01 is only 2 journeys
   corpus-wide, which is thin evidence for a generic rule. The counter-argument is real: *"is a
   deadline even defined?"* is one of DOC-215's four stated guardrails, and hiding the question may
   hide the discipline. If the second P-FORK-NOOP-01 journey turns out to be a genuine decision,
   **do not ship the rule** — leave the diamond drawn.

2. **Re-classing `x.held` from `success` to `no-action` in RLT-279.** The class is wrong; I am
   confident of that much, because `named_requirement_satisfied` is unreachable on that path. What I
   am not sure of is *which* class replaces it. `no-action` usually means "we did not send", and here
   a message **was** sent. `invalid-state` is the alternative and would sit consistently beside
   `x.moot`. A third reading defends the status quo: the journey's *own* goal on that branch is "tell
   them and ask nothing", which it achieved. I think that confuses the journey succeeding at its task
   with the business outcome occurring, and the `class` field feeds the latter — but this is a
   product-semantics call the author should confirm.

3. **RSK-273's channel per touch, specifically `a.at-the-wall` dropping to in-app alone.** The
   orchestration map says "In-app, at the point the action is stopped" and the trigger makes them
   in-session by definition, so the reasoning is sound. But it removes the only durable copy of the
   three facts (*which limit, the usage, the reset date*) that the whole journey exists to deliver,
   and a person who hits a wall and immediately closes the tab keeps nothing. The safe alternative is
   to leave `t1` as two roles and simply relabel them (R1 alone) — which is why I have kept R1 and
   the `channelRoles` edits as **separate** changes: R1 is safe on its own and can ship first.

   The same doubt applies, more weakly, to `a.notify-blocked-party`.

**One more thing worth an author's eye, which I did not count among the three because it is not my
call to make:** `INC-254.measurement` has no `businessOutcome` and `goal.event` is `null` — the only
journey in my six without one. Its real outcome is *coverage*: did the resolution notice reach the
scope that was told. Nothing measures that today, and `x.closed-comms` is where it would be measured.
