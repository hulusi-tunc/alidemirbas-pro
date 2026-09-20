# Channel orchestration map — the 52 public journeys

Scope is `audit/public-journey-scope.md` (fixed: 52 public, 21 excluded). Every stage below is
read from `production/canonical-dump.json` — the graph's own `nodes[]`,
`orchestration.touches[]`, `channelStrategy.roles`, `contact.localCap` and wait defaults. No
journey was given a touch its graph does not contain, and no timing was invented where the
canonical `Config` carries one.

**Customer-facing channels: Email, SMS, Push, WhatsApp, In-app.** `sales` and `task` are
operational handoff behaviour and never appear as a channel here, even where a journey's
canonical `channels` array still declares `task` (ACT-13, FBK-43, FBK-49, RET-24).

## How the models were applied

| Model | Applied when |
|---|---|
| **A — Single channel** | One communication discharges the stage. Includes the common case where the graph names one message and the channel is simply *where the person is* (in-app while in session, otherwise email). Channel **selection** is not orchestration. |
| **B — Sequential** | Two or more touches in order, each separated by a wait and a re-read of the goal state. Escalation across channel classes only where the graph justifies it — never automatic. |
| **C — Conditional routing** | A real split that changes **what is said** or **which channel class carries it** (urgency horizon + recorded permission, decision-holder, failure class, policy route), with the branches merging into one wait or one outcome. |
| **D — Parallel** | Two surfaces sent together for **different purposes** or to **different parties**. Used twice in 52 journeys. |
| **E — Fallback** | Reserved for a first channel that has actually failed or is known unreachable, with a second carrying the **same** message. Three journeys. Not the universal model. |
| **F — Segment-based** | The segment genuinely changes treatment — order value, first-time vs familiar holder, existing vs new counterparty, strength of relationship evidence. Five journeys. |
| **G — Event-or-timeout** | A wait bounded by `until[]` events *or* a max duration, then a re-read of authoritative state before the next send. Combinable with all of the above; present in 48 of 52. |

A yes/no **send gate** (suppression, eligibility, "is this worth saying") is not a model — it is
recorded in the *Success re-check* column. Not sending is a legitimate outcome throughout.

---

## 1. Acquisition, intent & qualification — 7

| Journey | Stage | Model | Channel(s) | Timing | Reason | Success re-check | Merge | Next stage |
|---|---|---|---|---|---|---|---|---|
| **ACQ-11** Abandoned Process Recovery | initial recovery (`a.touch1`) | B + G | Push / In-app; Email where no app route | 30–60 min from last activity on the process | Intent is minutes old — a route back beats content | `c.state` re-reads the process; `c.sendable` gates the send | Low-friction and persistent routes merge at `w.second` | follow-up |
| ACQ-11 | follow-up (`a.touch2`) | B + G | Email primary, Push/In-app secondary | 20–28 h; re-armed once if they returned and left again | The likely blocker needs explanation, which email carries | `c.state2` — completed / cancelled / superseded all stop it | Return path (`a.note-return`) rejoins the same wait | final notice |
| ACQ-11 | final notice (`a.touch3`) | B + C | Email; **SMS only** where a real expiry is asserted and commercial SMS permission is recorded | 3–7 days, bounded by the platform's own `expires_at` | One honest last statement; SMS is earned by an asserted deadline, not by it being the third touch | `c.state3` + `c.final-enabled` — no honest expiry, no send | Disabled branch exits at `x.lapsed`; no third touch | exit / `h.payment` → FIN-134 |
| **ACQ-12** Abandoned Selection Recovery | initial recovery (`a.touch1`) | B + G | Push / In-app; Email where no app route | 1–4 h from last activity, re-armed while they keep editing | A person still editing a selection is deciding, not forgetting | `c.state` + `c.availability` — nothing is sent about items that are gone | Both routes merge at `w.second` | follow-up |
| ACQ-12 | follow-up (`a.touch2`) | B + G | Email primary | 2–4 days | Only where the platform asserts a genuine change (availability, price) | `c.state2` | — | 7–14 day observation → `x.lapsed` |
| ACQ-12 | — | — | **No SMS** | — | A saved selection carries no asserted deadline, so no urgent channel is warranted | — | — | — |
| **ACQ-288** Cart Abandonment Recovery | reminder 1 (`a.reminder1`) | B + E | Push; **falls back to Email** where no valid token | 2 h after the item was added | Same message, second route only because the first cannot deliver | `c.active1` / `c.purchased1` / `c.checkout1` — checkout starting hands off immediately | Both routes merge at `w.second` | reminder 2 |
| ACQ-288 | reminder 2 (`a.reminder2-hv` / `-std`) | F + E | High-value: WhatsApp → SMS. Standard: Push → Email | 20–24 h | Cart value genuinely changes what a direct channel is worth; WhatsApp only with consent and a reachable number | `c.purchased2` / `c.checkout2` before the segment split | Both segments merge at `w.third` | observation |
| ACQ-288 | close | G | none | 48 h | Two touches are the plan; the third window observes rather than sends | `c.purchased3` / `c.active2` | — | `x.purchased` / `x.abandoned` / `h.checkout` → ACQ-287 |
| **ACQ-287** Checkout Abandonment Recovery | reminder 1 | B + E | Push → Email | 45 min after checkout started | Checkout intent decays fastest of anything in the corpus | `c.completed1` | Routes merge at `w.second` | reminder 2 |
| ACQ-287 | reminder 2 | F + E | High-value: WhatsApp → SMS. Standard: Push → Email | 6 h | Order value, not lifecycle, is what justifies the direct channel here | `c.completed2` before the split | Segments merge at `w.third` | observation |
| ACQ-287 | close | G | none | 24 h | Two touches; no third message | `c.completed3` | — | `x.purchased` / `x.abandoned` |
| **ACQ-09** Lead Nurture | education (`a.educate`) | A | In-app in session; Email otherwise | Immediately after the lawful-basis check | One piece of education matched to why they entered — not a drip sequence | `c.basis` — no permission, no nurture | — | bounded window |
| ACQ-09 | window | G | none | `bounded_education.window` | The window ends whether or not it worked; permission withdrawal and route loss end it early | `c.window-event` | Permission / contactability branches stop queued sends | `h.progressed` → ACQ-03 / `x.sunset` |
| **ACQ-285** New Lead Welcome | fulfilment (`a.first-touch` / `a.deliver`) | C | Email only | Immediately on capture | What they declared decides the message: asked for a person vs asked for the material | `c.email-route` — an undeliverable address ends it rather than rerouting | Both branches merge on the fulfilment record | `h.person` or permission check |
| ACQ-285 | nurture (`a.nurture`) | B + G | Email | Bounded sequence, `captured_interest.nurture`, with its end stated when it opens | Continuation travels on permission, fulfilment travels on the request | `c.permission` before it opens; `c.progressed` closes it | — | `h.person` / `x.sunset` |
| **ACQ-13** Unresolved Interest Recovery | recovery (`a.touch1`) | A + G | Push / In-app; Email otherwise | 12–48 h from last attention | Inferred interest is the weakest evidence in the corpus — exactly one touch, cap 1 | `c.qualify`, `c.state`, `c.sendable`; no-action is the expected outcome | — | 3–7 day observation → `x.lapsed` |

## 2. Activation, onboarding & early value — 7

| Journey | Stage | Model | Channel(s) | Timing | Reason | Success re-check | Merge | Next stage |
|---|---|---|---|---|---|---|---|---|
| **ACT-17** Adoption Nurture | recognition (`a.recognize`) | A | In-app in session; Email otherwise | Immediately on core activation | Recognition of the specific thing produced; it has to land near the act | — | — | next action |
| ACT-17 | next action (`a.surface`) | B | In-app / Email | Immediately after recognition | Only where a natural next action follows from what they produced | `c.next` — no genuine next action, nothing sent | Rejoins `a.measure` | behaviour nudge |
| ACT-17 | behaviour nudge (`a.next-behavior`) | B + G | In-app / Email | One per `adoption.observation_window` | Only the next behaviour that produces value in *this* use-case; breadth is not pushed | `c.stable` reads value-producing usage, not activity | — | `h.normal` / `h.stall` → ACT-18 |
| **ACT-18** Adoption Recovery | recovery (`a.recover`) | A + G | Email (blocker needs explaining); Push where the blocker is one step | Immediately after diagnosis | One message, cap 1 — it addresses the diagnosed blocker, not onboarding again | `c.type` — "no evidence of a problem" sends nothing | — | `w.recover` → ACT-17 or health monitoring |
| **ACT-20** Dormant Lead Reactivation | single attempt (`a.attempt`) | A + G | Email (they are out of the product); Push only where a token survives | On dormancy, once a credible reason is recorded | One bounded attempt, cap 1; a general "we miss you" asks for nothing | `a.inspect` — opening the message is not returning; real state must move | — | state-based handoff (ACT-12 / ACQ-03 / ACQ-05) |
| **ACT-13** Onboarding Blocker Reminder | specific action (`a.specific-action`) | A + G | In-app in session; Email otherwise | On the blocking requirement being named | One named action that clears the requirement — never "finish your setup" | `w.resolve`; `a.stop-reminders` cancels queued sends the instant it is satisfied | — | `h.resume` → ACT-12 |
| ACT-13 | dependency route (`a.route-dependency`) | — | **none** (internal work item) | — | The requirement is someone else's to resolve; `task` is operational behaviour, not a channel | `c.next-blocker` | Rejoins the same `w.resolve` | `h.escalate` / `h.reroute` |
| **ACT-14** Onboarding Help | offer (`a.offer`) | A | In-app in session → Push → Email | On help-seeking without progress | Offer named against the step they keep returning to | `c.duplicate` — suppressed if a person already owns the blocker | — | `w.response` |
| ACT-14 | booking confirmation (`a.confirm`) | A + G | Same route as the offer | On booking | Confirms the time, the join route and the problem the session opens with | `c.what-happened` | — | `w.session` |
| ACT-14 | post-session follow-up (`a.followup`) | A | In-app / Email | After the session outcome is recorded | One follow-up tied to what the session covered; the call is not asked for again | `c.outcome` / `c.followup` | — | `x.normal` |
| ACT-14 | final self-service (`a.final`) | B | Email | On the no-response timeout only | Second and last touch on that path — one self-service option, then stop | `c.final-option` | Both paths close at `x.normal` | exit |
| **ACT-12** Onboarding Nurture | next step (`a.surface`) | B + G | In-app in session; Email otherwise | `onboarding.step_interval`, one step at a time | The step is read from the product's own record of what is done, never from what was opened | `a.read` on every loop; a completed step is never suggested again | Milestone events rejoin `a.read` | `h.activated` / `h.blocker` → ACT-13 / `x.window-closed` |
| **ACT-19** Onboarding Personalization | one question (`a.ask`) | A + G | In-app in session; Email otherwise | Once, at the point the path actually forks | Asked only where the answer materially changes the path and no declared value exists | `c.declared` / `c.material`; timeout applies a documented default | — | `h.progress` → ACT-12 |

## 3. Engagement, retention & contactability — 7

| Journey | Stage | Model | Channel(s) | Timing | Reason | Success re-check | Merge | Next stage |
|---|---|---|---|---|---|---|---|---|
| **RET-28** Cancellation Save | reason ask (`a.ask`) | A | In-app beside the cancellation step where intent was declared in-product; Email where it was declared by phone or message | At the moment intent is expressed | Asked once, with the cancellation path fully open beside it | Wait ends with the session or conversation | — | resolution check |
| RET-28 | alternative offer (`a.offer`) | B + G | Same route | Immediately after the reason is recorded | One offer, only where a legitimate alternative matches the declared reason | `c.resolution` — nothing genuine, nothing offered | Both paths reach `w.decision` | `h.intervention` → RET-30 / `h.execute` → SUB-167 |
| **RET-24** Churn Risk Escalation | — | **none** | **none** | — | The journey has **zero customer-facing communication nodes**: it assembles evidence and routes (RET-28 / RET-23 / RET-30, an account-owner task, or nothing). The `task` in its canonical `channels` is operational behaviour. Recorded as the open conflict in the scope file — not resolved here. | `c.human` / `c.priority-clear` / `c.automated` | — | handoff or `x.monitor` |
| **RET-32** Lapsed Customer Win-Back | invitation (`a.touch1`) | B + G | Email (they are out of the product); Push only where a token survives on a device that kept the app | After the cancellation's own cooldown has passed | A plain invitation carrying what actually changed; nothing invented | `c.eligible` + `c.sendable` | — | 14–30 day wait |
| RET-32 | follow-up (`a.touch2`) | B + G | Email / Push | 14–30 days after the invitation | Only where the company enables it **and** there is something honest to add | `c.second` — nothing to add, no send | — | 30–60 day observation → `x.lapsed` |
| **RET-31** Predicted Need Replenishment | lead prompt (`a.touch1`) | B + G | Email (carries the item, the estimate and the route); Push/In-app where reorder is one step | 3–7 days before the estimated depletion | The estimate is stated as an estimate from their own purchases | `c.state` — replenished or dismissed stops it | Both routes merge at `w.window` | follow-up |
| RET-31 | follow-up (`a.touch2`) | B + G | Email / Push / In-app | 3–7 days after the estimate passed unmet | One follow-up, no invented urgency | `c.outcome` / `c.sendable2` | — | 14–30 day observation → `x.lapsed` |
| RET-31 | — | — | **No SMS** | — | A predicted need is not a deadline; SMS would spend urgency the journey does not have | — | — | — |
| **RET-30** Retention Offer Follow-Up | follow-up (`a.followup`) | A + G | Email; In-app where the person is in the product | After `retention_intervention.outcome` elapses with no response | One follow-up and stop, whatever the value of the relationship (cap 1) | `a.verify` reads the system of record — acceptance is not the same as the state changing | — | `x.cooldown` |
| **RET-26** Service Recovery | acknowledgement (`a.acknowledge`) | A | Email (something they can keep); Push only where the failure was in-app and they are active there | Once the underlying issue is resolved | What failed, what was done, what prevents it — no discount standing in for an explanation | `c.duplicate`, `c.resolved`, `c.useful`, `c.compensation` | — | `x.acknowledged` / `h.compensation` → REM-159 |
| **CON-272** Contact Recovery | repair request (`a.prompt-in-app` / `a.prompt-alt`) | **E** + G | In-app where they are in the product; otherwise the surviving permitted route — SMS or Email. **Never the failed destination** | Immediately on the undeliverable record | The textbook fallback: the primary channel is dead by definition, and the same request has to travel another way | `c.route`; nothing left → `x.dark`, suppressed | Both routes merge at `w.corrected` | confirmation |
| CON-272 | confirmation (`a.confirm`) | A | The working route | On verification of the replacement | Says where things go changed, not what may be sent — mandatory | `c.outcome` | — | `x.repaired` / `x.recovered` |

## 4. Feedback, advocacy & relationship signals — 4

| Journey | Stage | Model | Channel(s) | Timing | Reason | Success re-check | Merge | Next stage |
|---|---|---|---|---|---|---|---|---|
| **FBK-42** Advocacy Request | light ask (`a.ask-light`) | F + G | In-app / Push / Email — wherever the person already is | Once the positive evidence is sufficient | A one-tap ask can travel a low-friction route; the segment is the strength of accumulated evidence | `c.negative` (anything open suppresses), `c.sufficient` | Both asks merge at `w.response` | outcome |
| FBK-42 | heavy ask (`a.ask-heavy`) | F | Email or In-app — **never Push** | Same decision point | A review, quote or reference needs a durable, reviewable route that states what would be published | `c.type` sizes the ask to the evidence | Merges at `w.response` | `h.permission` → CON-31 / `x.contributed` |
| **FBK-43** Feedback Follow-Up | acknowledgement (`a.acknowledge` / `-positive` / `-negative`) | C + G | Email (default — they wrote to us); In-app where the feedback was given in-product and they are still there | On classification | The acknowledgement genuinely differs by what they said — praise, an experience we did not meet, a general comment — and one is sent per record | `c.route`, `c.existing` (attach to an open case rather than open a second) | All three merge on the same feedback record | `h.advocacy` → FBK-42 / `x.stored` |
| FBK-43 | operational routing (`a.obligation`, `a.escalate`) | — | **none** (internal work item) | — | Support work and severity marking are `task` behaviour, not a customer channel | `w.outcome` against the obligation SLA | — | `h.issue` → FBK-46 |
| FBK-43 | promised follow-up | G | — | 7–14 days | The record stays open until anything promised has actually happened | `c.promise` | — | `x.closed` / `h.promise` → DEC-181 |
| **FBK-41** Feedback Request | request (`a.request`) | A + G | In-app where the experience ended in-product and they are still there; Email otherwise; Push where the answer is one step | At experience completion | One ask per experience (cap 1), and no chase | `c.open-issue` (resolution owns it first), `c.recent`, `c.moment` | — | 3–7 day window → `x.received` / `x.no-response` |
| **FBK-49** Missing Information Reminder | request (`a.request`) | A + G | Email; In-app where the person is in the product | On the blocking gap being named | Names the exact item and what it unblocks — a request that cannot say what it unblocks is profiling | `c.authoritative` (do we already hold it?), `c.valid` | — | `x.resumed` / `c.criticality` |
| FBK-49 | internal request (`a.request-internal`) | — | **none** (internal work item) | — | An internal dependency is not routed down a customer channel | Same `w.received` | Rejoins `c.valid` | `h.escalate` |

## 5. Time, deadlines, expiry & temporary states — 5

| Journey | Stage | Model | Channel(s) | Timing | Reason | Success re-check | Merge | Next stage |
|---|---|---|---|---|---|---|---|---|
| **TIM-268** Action Required Reminder | reminder (`a.remind`) | C + G | Email by default; **SMS only** where `due_at` falls inside the urgent horizon and SMS permission is recorded | At the reminder point inside `outstanding_obligation.due` | The deadline's proximity, not the journey, decides whether an interruptive channel is warranted | `a.recheck` re-reads the obligation immediately before sending; nothing owed → `x.moot`, nothing sent | Both routes wait at `w.deadline` | confirmation or overdue |
| TIM-268 | confirmation (`a.confirm`) | A | Email / SMS as above | On satisfaction | An obligation met and never acknowledged is one the person keeps checking | `c.settled` | — | `x.satisfied` |
| TIM-268 | overdue notice (`a.overdue`) | A | Email / SMS as above | At the deadline, once | One notice — repeating it is a recovery sequence and belongs to the consequence owner | `c.escalate` | — | `h.consequence` / `x.lapsed` |
| **TIM-61** Deadline Tracking | pre-deadline reminder (`a.remind`) | C + G | Email default; Push where the action is one step; **SMS or WhatsApp only** inside the urgent horizon with recorded permission | At a policy-defined threshold, not on a schedule of its own | The deadline governs the state; the reminder is defined by policy per threshold. WhatsApp appears only as an urgent-role alternative to SMS — never as a value upgrade | `c.useful` — no policy-defined reminder, nothing sent; completion invalidates every queued reminder | Returns to `w.tracking` after each threshold | `c.consequence` → TIM-62 / OWN-55 / TIM-64 |
| **TIM-281** Expired Access Recovery | route statement (`a.renew` / `a.requalify` / `a.replace` / `a.no-route`) | C | Email; In-app where they are in the product | At the moment the holder acts on the expired thing | Four genuinely different messages — naming the wrong route spends the only intent this ever gets | `a.establish` reads what the expiry actually did before any route is named | Renew / requalify / replace merge at `w.act`; no-route terminates at `x.terminal` | confirmation |
| TIM-281 | confirmation (`a.confirm`) | A + G | Email / In-app | On validity being restored | Confirms what is valid now, and that a replacement is a new object rather than the old one revived | `c.outcome` | — | `x.restored` / `x.still-expired` |
| **TIM-63** Expiry Reminder | action prompt (`a.prompt-action`) | C + G | Email default; In-app where the responsible actor is in the product; **SMS or Push only** where `expires_at` is inside the urgent horizon, the action is one step, and permission is recorded | Inside the pre-expiry window, addressed to whoever can actually act | One message per instance (cap 1); the channel escalates on the horizon, not on the journey | `a.reread` — already renewed, replaced or completed → `x.suppressed` | Both branches wait at `w.resolution` | `h.resolved` / `h.expiry` → TIM-64 |
| TIM-63 | informational notice (`a.inform`) | C | **Email only** | Same window | Nothing can be done, so no urgent channel and no call to action | `c.informational` — not worth saying → `x.silent` | Merges at `w.resolution` | as above |
| **TIM-274** Grace Period Recovery | grace notice (`a.notify-restricted` / `a.notify-quiet`) | C | Email; SMS where `grace_deadline_at` is inside the urgent horizon with permission | On the grace period starting | A reduction the holder will feel and one they will not are different messages; dramatising the second teaches them to discount the first | `c.restricted` | Both merge at `w.grace` | last call or confirmation |
| TIM-274 | recovery confirmation (`a.confirm`) | A | Email / SMS | On the recovery condition being met | A recovery nobody confirms leaves the holder still behaving as restricted | `c.outcome` | — | `x.recovered` |
| TIM-274 | last call (`a.last-call`) | B + G | Email; SMS inside the horizon | At the end of `grace_period.grace` | One message naming the exact end date — the fixed end is the pressure, not repetition | Wait re-arms on `recovery_condition_satisfied` | — | lost notice |
| TIM-274 | window closed (`a.lost`) | A | Email | At `grace_period.final` | A holder not told the window shut goes on assuming it is open | — | — | `x.lost` |

## 6. Access, identity & relationship — 5

| Journey | Stage | Model | Channel(s) | Timing | Reason | Success re-check | Merge | Next stage |
|---|---|---|---|---|---|---|---|---|
| **ACC-261** Access Restriction Notice | notice (`a.notify` / `a.inform-only`) | C + G | Email; In-app where they are in the product | On the restriction being recorded | Resolvable by them → what is restricted, what still works and the one condition that lifts it. Not theirs to resolve → the same facts with nothing asked, because a prompt to act where acting is impossible reads as blame | `c.actionable`; a security-placed restriction is announced by the security response (`x.security-owned`), not twice; unreachable → CON-36 | The actionable branch waits at `w.resolve`; inform-only ends at `x.informed` | confirmation |
| ACC-261 | confirmation (`a.confirm`) | A | Email / In-app | On restoration | So the person can tell a resolved restriction from a partial one | `c.outcome` | — | `x.restored` / `x.stands` |
| **ACC-263** Activation Reminder | grant notice (`a.ready` / `a.brief`) | F | Email; In-app where they are in the product | On the entitlement being provisioned and reachable | First-time holder gets what it lets them do plus the single first action; a familiar holder gets only what changed. Re-explaining a capability somebody already uses reads as a system that does not know them | `c.first-time` | Both merge at `w.first-use` | reminder |
| ACC-263 | reminder (`a.remind`) | B + G | Email / In-app | At the end of `entitlement_activation.first_use`, while the window is still open | One reminder naming the deadline and the same first action — no second; a capability nobody wanted is not made wanted by asking twice | `c.used` / `c.remind` | — | `x.activated` / `x.lapsed` |
| **IDN-271** Account Security Alert | alert (`a.alert-contained` / `a.alert-watch`) | A + G | **One** verified destination the signal does not implicate — Email where that address is clean, SMS where it is not | Immediately on the incident opening with its scope determined | A security alert is a single communication, mandatory, with no promotional wrapper. The containment/watch split changes the wording, not the number of sends: "suspected" is not "confirmed" | `c.route` — every route implicated → `x.withheld`, nothing sent | Both wordings wait at `w.verify` | resolution |
| IDN-271 | resolution (`a.cleared` / `a.standing`) | A | Same route | On the answer, or at the review point | Cleared names what was lifted; standing says what remains restricted and that nothing further is assumed from silence | `c.outcome` | — | `x.cleared` / `h.recovery` → IDN-88 / `x.open` |
| **IDN-84** Verification Recovery | explanation (`a.explain` / `a.explain-terminal`) | C | In-app where the person is in the product; Email otherwise | Immediately on the failed attempt | The failure class chooses the message: correctable → what to fix plus the bounded retry; terminal by policy → this basis cannot be verified and what would be accepted. **Our own technical failure sends nothing** and retries with backoff, recording nothing against the person | `c.class`, `c.retry-budget`, `c.technical-budget` | Customer-facing branches end at `x.retry` / `x.terminal`; the technical branch never becomes a message | `h.review` → DEC-181 / `h.escalate` → OWN-55 |
| **REL-284** Invitation Reminder | invitation (`a.invite-known` / `a.invite-new`) | F | Email; In-app where the counterparty is in the product | On the invitation being issued | An existing holder's first question is what accepting costs them; somebody with no prior relationship needs to be told a link is not a transfer. Genuinely different messages | `c.known` | Both merge at `w.response` | confirmation or reminder |
| REL-284 | reminder (`a.remind`) | B + G | Email / In-app | At the end of `relationship_invitation.response`, while time remains | One reminder naming who is waiting and the expiry date — a counterparty who has not answered twice has answered | `c.remind` | — | `w.final` → `x.expired` |
| REL-284 | confirmation (`a.confirm`) | A | Email / In-app, **to both sides** | On acceptance | Names the scope and direction, because an unstated scope is assumed to be total | `c.response` | — | `x.active` |

## 7. Transactions, fulfillment & remedies — 6

| Journey | Stage | Model | Channel(s) | Timing | Reason | Success re-check | Merge | Next stage |
|---|---|---|---|---|---|---|---|---|
| **FIN-134** Payment Failure Recovery | corrective request (`a.corrective` / `a.offer-alternate`) | C | In-app where a session is open (the fix is a form); Email otherwise | Immediately on the authoritative failure | The failure class decides what is said and whether anything is said at all — a transient failure retries silently with the same idempotency key and sends nothing. Mandatory where it does send | `c.class`, `c.alternate` | All branches merge at `w.recovery` | reminder |
| FIN-134 | reminder (`a.remind`) | B + C + G | Email; **SMS or Push only** where an asserted consequence date is inside the urgent horizon with service-message permission | 2–3 days | One reminder naming the consequence and its date; a second would be a recovery sequence | `c.reminder` — nothing to add, no send | Joins `w.final` | confirmation or policy route |
| FIN-134 | confirmation (`a.confirmed`) | A | Email; In-app where they are in the product | On the obligation being satisfied | Mandatory — an obligation met and never acknowledged is one the person keeps checking | `c.recovered` | — | `x.recovered` / `c.next` → TIM-65 / TIM-62 / ACC-78 |
| **FUL-146** Delivery Delay Alert | delay update (`a.delay-update`) | C + G | Email; SMS where the new time bound is inside the urgent horizon with permission | On the slip being assessed | Sent only where the changed timing alters what the recipient should plan around; states the original commitment **and** the current estimate, or that there is not a reliable one | `c.estimate`, `c.recipient-impact` | Rejoins `c.threshold` | tolerance check |
| FUL-146 | choice or no-choice (`a.offer` / `a.no-choice-update`) | C + G | Email / SMS as above | Once the delay exceeds tolerance | Either the choices that genuinely exist (wait, reschedule, alternative, cancel) or the plain statement that there is nothing to offer and it is being escalated — escalating in silence tells the recipient nothing | `c.threshold`, `c.choice`, `c.decision` | Choices merge at `w.resume`; no-choice goes to `h.escalate` | FUL-144 / FUL-145 / FUL-150 / OWN-55 |
| **FUL-265** Delivery Tracking | dispatch (`a.dispatch`) | A | Email; SMS where the expected window is inside the urgent horizon with permission | On hand-off to the executor | The window and whatever reference genuinely follows it — and where none exists, saying so | — | — | `w.delivery` |
| FUL-265 | arrival / non-arrival (`a.arrived` / `a.no-arrival`) | C + G | Email / SMS as above | On the executor's authoritative report, or at the timeout | Arrival states the evidence so the recipient can contradict it while it is fresh; non-arrival says which of the two it is — a confirmed failure or an executor we have lost sight of | `c.delivery` | Arrival continues to acceptance; non-arrival hands off | `h`/`x.unresolved` → FUL-148 |
| FUL-265 | acceptance request (`a.accept-request`) | B + G | Email / SMS | After the arrival confirmation | Only where acceptance carries a consequence; names the date after which silence counts as acceptance | `c.acceptance`, `c.response`; `a.finalize` keeps acceptance-by-expiry distinguishable from acceptance-by-agreement | — | `x.accepted` / `x.finalized` / `h.issue` → FUL-149 |
| **FUL-148** Failed Delivery Recovery | correction or route choice (`a.correct` / `a.offer-route`) | C + G | Email; SMS where the reattempt window is inside the urgent horizon with permission | Immediately on the attempt failure | The executor's failure class chooses the message: correctable information → ask for the exact correction; the choice is the recipient's → put the concrete alternatives. A policy-authorised reroute or reattempt is operational and sends nothing | `c.class`, `c.budget`, `c.alternate`, `c.route-answer` | All paths converge on the bounded attempt budget | `h.retry` → FUL-147 / `h.return` → REM-151 |
| **REM-151** Post-Purchase Issue Recovery | acknowledgement (`a.acknowledge`) | A | **Email only** | On assessment | One message, and only where there is no actionable obligation — nothing is manufactured to give the report somewhere to go. Where a remedy is implied the journey hands off without a message of its own | `c.duplicate` (attach to an open case), `c.actionable` | — | `x.no-defect` / `h.remedy` → REM-157 |
| **REM-157** Remedy Confirmation | options (`a.present`) | C + G | Email; In-app where they are in the product | On the remedy decision being required | Presented only where the counterparty genuinely chooses, and only remedies that actually exist; where there is no choice, nothing is presented and the route is applied | `c.choice`; the selection timeout applies the policy default and records that no selection was made | Choice and no-choice branches merge at `c.route` | REM-156 / REM-155 / REM-152 / FIN-137 |
| REM-157 | no remedy (`a.no-remedy`) | A | Email / In-app | On the route decision | States that the obligation is satisfied or that policy provides none, naming an appeal route **only** where one exists | `c.route` | — | `x.no-remedy` |

## 8. Subscriptions & scheduling — 6

| Journey | Stage | Model | Channel(s) | Timing | Reason | Success re-check | Merge | Next stage |
|---|---|---|---|---|---|---|---|---|
| **SUB-262** Cancellation Confirmation | confirmation (`a.confirm`) | A | Email (the record they keep); In-app where they are in the product | Immediately on cancellation | A single confirmation naming the exact end date and what remains until then — paid-for access is not cut short | `c.window` | — | `w.window` |
| SUB-262 | ending notice (`a.ending`) | B + G | Email / In-app | Shortly before the effective end, only where a meaningful window exists | What will and will not survive — exports, history, outstanding obligations. Needed whether or not they intend to come back | `c.withdrawn` — a withdrawn cancellation ends the journey at `x.returned` | — | `h.obligations` → SUB-170 / `x.ended` |
| **SUB-163** Renewal Reminder | required notice (`a.notice`) | A | Email; addressed to whoever holds the decision | When the terms require notice to be given | Mandatory and contractual: the renewal model, the terms, and what happens if nothing is done | `c.notice`, `c.notice-required` | Rejoins `c.blockers` | decision request |
| SUB-163 | decision request (`a.request`) | C + G | Email; In-app where the decision holder is in the product; **SMS or Push only** where the notice deadline is inside the urgent horizon with service-message permission | `term_end_at` minus the required notice period | The decision is put once (cap 1). Asking is not deciding — the outcome is read from the record, and the timeout applies what the governing terms define | `c.decision`; a cancellation in motion supersedes it | Auto-renew, explicit-decision and review branches converge on `c.decision` | SUB-164 / SUB-168 / OWN-55 |
| **SCH-266** Appointment Reminder | prerequisite prompt (`a.prompt`) | A + G | Email; In-app where the person is in the product | 24–72 h ahead, while there is still time to act | Every outstanding prerequisite in **one** message rather than one per requirement | `c.time` — too close to prompt goes straight to revalidation | — | `w.prereq` |
| SCH-266 | reminder / at-risk notice (`a.remind` / `a.at-risk`) | C + G | Ordinary reminder: Email / In-app, SMS same-day. At-risk: **SMS** (urgent) plus the persistent route | Pre-start window, after `a.revalidate` re-reads the booking | A critical prerequisite missing is a different message on a more direct channel — and the confirmed time is not moved. One reminder per occurrence | `a.revalidate` + `c.valid` — cancelled, moved or superseded → `x.superseded`, nothing sent | Both hand off to the pre-start mechanism | `h.at-risk` → SCH-174 / `h.prestart` → SCH-177 |
| **SCH-282** Availability Search Abandonment | offer / waitlist (`a.offer` / `a.waitlist`) | C + G | Email; Push where the route back is one step | After `availability_searched.settle`, with availability re-evaluated at send time | What is genuinely bookable now decides the message — the nearest window labelled as a different window, a waitlist place that reserves nothing, or no message at all | `c.permitted` (anonymous → no offer), `c.settled`, `a.recheck`, `c.options` | Offer and waitlist run separate waits; "nothing fits" exits silently at `x.nothing` | `x.booked` / `x.waitlisted` / `x.lapsed` |
| SCH-282 | — | — | **No SMS** | — | An abandoned availability question carries no commitment and no deadline of ours | — | — | — |
| **SCH-277** Booking Confirmation | acknowledgement (`a.received`) | A | Email; SMS where the requested slot is inside the urgent horizon with permission | Immediately on the request being recorded | Says explicitly that the request is **not yet a commitment** and when the outcome will come | — | — | `w.outcome` |
| SCH-277 | outcome (`a.confirm` / `a.reoffer` / `a.decline` / `a.lapse`) | C + G | Email / SMS as above | On revalidation, or at the outcome timeout | One outcome message, chosen by what revalidation actually decided. Silence after a request is read as a commitment, so the lapse is stated | `c.outcome` re-reads the booking record; nothing is described as held unless it is held | Confirm, decline and lapse terminate; re-offer opens `w.choice` | `x.confirmed` / `h.rebook` → SCH-173 / `x.lapsed` |
| **SCH-280** No-Show Follow-Up | offer or acknowledgement (`a.offer` / `a.acknowledge`) | C + G | Email (the default — it carries the rebooking route); SMS where the rebooking window is short and permission is recorded | After the no-show is re-read against late-landing events | Established first that the miss was theirs and not ours — our side failed → SCH-180 and **no message**. Something to rebook onto → the offer without penalty language; nothing → a plain statement, because an offer with nothing behind it costs more trust than silence | `a.reread` + `c.superseded` (moved, cancelled or attended after all → `x.suppressed`), `c.provider`, `c.rebookable` | Both messages close the same instance; one message per occurrence (cap 1) | `x.rebooked` / `x.closed` |

## 9. Risk, documents, rollout & incidents — 5

| Journey | Stage | Model | Channel(s) | Timing | Reason | Success re-check | Merge | Next stage |
|---|---|---|---|---|---|---|---|---|
| **RSK-273** Usage Limit Alert | at-the-wall (`a.at-the-wall`) | A | **In-app**, at the point the action is stopped | Immediately, at the block | The person is in the product by definition; which limit, the usage against it, and when the window resets. Mandatory, and nothing that reads as an accusation | — | — | `c.path` |
| RSK-273 | capacity offer (`a.offer-self` / `a.offer-holder`) | C | In-app / Email | Immediately after the wall message | Routed on **who holds the capacity decision** — theirs, or somebody else's. The paid path is never shown without the free reset beside it | `c.path`, `c.decider` | Both branches wait at `w.capacity` | reset or handoff |
| RSK-273 | holder + blocked party (`a.offer-holder` → `a.notify-blocked-party`) | **D** | In-app / Email, **two sends to two different people** | Together | Strong reason: two parties need two different things — one holds a decision, the other is waiting on it and needs the authoritative reset date. Neither is interruptive | `c.decider` | Both feed the same `w.capacity` | `h.capacity` → SUB-166 |
| RSK-273 | reset (`a.reset`) | A + G | In-app / Email | On the authoritative reset, never a locally guessed clock | Mandatory — the held action can proceed, and a guessed reset grants capacity nobody authorised | `c.outcome` | — | `x.reset` / `x.blocked` |
| **DOC-214** Document Delivery | distribution (`a.distribute`) | A + G | **Email only** | On the issued version requiring distribution | One delivery, bound to the exact issued version, raised through the mechanism that owns channels, permissions, retries and delivery evidence. Mandatory | `c.outcome`; an unknown outcome is recorded as unknown and never as delivered | — | `x.distributed` / `h.recover` → CMS-208 / `h.reconcile` |
| **DOC-215** Signature Reminder | signature request (`a.request`) | A | **Email only** | On the document requiring signature | Issued to each required signer, bound to the exact version, naming the authority and the validity boundary. Mandatory | `c.window` — no invented deadline where none is defined | — | `w.signatures` |
| DOC-215 | reminder (`a.remind`) | B + G | Email | 3–5 days, only where a reminder would still change anything | One reminder, **only to signers still outstanding**; any signature, decline or supersession cancels it immediately | `c.reminder-useful`, `c.event`, `c.complete` | Signed signers drop out; the rest return to `w.expiry` | `h.effective` → DOC-216 / `x.expired` |
| **RLT-279** Upgrade Blocker Reminder | blocker notice (`a.name-blocker` / `a.inform-hold`) | C | In-app where the holder is in the product; Email otherwise | While enough of the preparation window remains to clear it | Theirs to clear → the one prerequisite, what clearing it involves, and the date it stops mattering. Not theirs → the change is held and why, with nothing asked | `c.resolvable` | Only the actionable branch waits at `w.clear`; inform-hold ends at `x.held` | last call |
| RLT-279 | last call (`a.last-call`) | B + G | In-app / Email | At the end of `upgrade_blocker.clear`, while the window is open | One further prompt, same prerequisite — there is no third; a blocker nobody has cleared twice is a decision | `c.cleared`, `c.last-call` | — | `h.resume` → RLT-242 / `x.unprepared` |
| **INC-254** Incident Update | update (`a.communicate`) | **D** + G | **Email + In-app**, together | When the incident reaches a communication-relevant state — bound to a stated condition, never to a clock | Strong reason: two surfaces, two purposes. Email carries the record to people who are not in the product; the in-app surface reaches whoever is hitting the fault right now. Neither is interruptive, so this is not two alarms | `c.cohort` (scope it, or say the scope is still being established), `c.verified`, `c.material` — no material change and no commitment → `x.no-send` | Scoped and broad branches merge at the same send | `x.updated` |
| INC-254 | resolution notice (`a.communicate` final) | A | Email + In-app to the same scope | On resolution | Closes the loop with the population that was told, and nobody else | `c.final` | — | `x.closed-comms` |

---

## Distribution — journeys using each model

A journey is counted once per model, whatever the number of stages that use it.
**51 of the 52 carry at least one customer communication stage; RET-24 carries none.**

| Model | Journeys | Count | Share of 51 |
|---|---|---:|---:|
| **A** Single channel | ACQ-09, ACQ-13, ACT-17, ACT-18, ACT-20, ACT-13, ACT-14, ACT-19, RET-28, RET-30, RET-26, CON-272, TIM-268, TIM-281, TIM-274, ACC-261, IDN-271, REL-284, FIN-134, FUL-265, REM-151, REM-157, SUB-262, SUB-163, SCH-266, SCH-277, RSK-273, DOC-214, DOC-215, INC-254 | **30** | 59% |
| **B** Sequential | ACQ-11, ACQ-12, ACQ-288, ACQ-287, ACQ-285, ACT-17, ACT-14, ACT-12, RET-28, RET-32, RET-31, TIM-274, ACC-263, REL-284, FIN-134, FUL-265, SUB-262, DOC-215, RLT-279 | **19** | 37% |
| **C** Conditional routing | ACQ-11, ACQ-285, FBK-43, TIM-268, TIM-61, TIM-281, TIM-63, TIM-274, ACC-261, IDN-84, FIN-134, FUL-146, FUL-265, FUL-148, REM-157, SUB-163, SCH-266, SCH-282, SCH-277, SCH-280, RSK-273, RLT-279 | **22** | 43% |
| **D** Parallel | RSK-273, INC-254 | **2** | 4% |
| **E** Fallback | ACQ-288, ACQ-287, CON-272 | **3** | 6% |
| **F** Segment-based | ACQ-288, ACQ-287, FBK-42, ACC-263, REL-284 | **5** | 10% |
| **G** Event-or-timeout | all except RET-26, IDN-84, REM-151 (no wait node) and RET-24 (no communication) | **48** | 94% |
| *(none)* | RET-24 | **1** | — |

### Sanity checks against the brief

- **Fallback is not the universal model.** MODEL E appears in 3 journeys, and only where the
  first channel has genuinely failed or is known unreachable: a dead contact point (CON-272) and
  the two cart/checkout routers that need a push token to exist. Everywhere else a second
  channel appears, it is because the message or the urgency changed — MODEL C — not because the
  first one broke.
- **Channel count was not maximised.** 30 journeys discharge at least one stage with a single
  communication. No journey exceeds 3 customer touches on any single path, and every journey's
  touch count matches its canonical `contact.localCap`. Four journeys are deliberately
  single-channel end to end: REM-151 and DOC-214 and DOC-215 (Email only), RSK-273's wall
  message (In-app only).
- **SMS is earned, not defaulted.** It appears only where an asserted deadline sits inside the
  urgent horizon *and* permission is recorded (TIM-268, TIM-61, TIM-63, TIM-274, FIN-134,
  FUL-146, FUL-265, FUL-148, SCH-266, SCH-277, SCH-280, SUB-163, CON-272, IDN-271, ACQ-11's
  final notice). It is explicitly withheld from ACQ-12, RET-31 and SCH-282, which have no
  deadline of ours to name.
- **WhatsApp is used twice** (ACQ-288, ACQ-287) as the high-value direct route with consent and
  reachability both required, and once (TIM-61) as an urgent-role alternative to SMS. It is
  never reached for because a customer is "high value" alone.
- **Parallel is rare and justified.** Two journeys, neither pairing two interruptive channels:
  INC-254 (record + live surface) and RSK-273 (two different people).
- **Segment-based is rare and real.** Order value (ACQ-288, ACQ-287), first-time vs familiar
  holder (ACC-263), existing vs new counterparty (REL-284), strength of relationship evidence
  (FBK-42). None of it is decoration.
- **RET-24 remains the open conflict** recorded in the scope file: it is in the immutable 52 and
  has no customer-facing communication node. No model is assigned to it here, and no touch was
  invented to give it one. It needs a product decision on its own design, not an orchestration
  pattern.
