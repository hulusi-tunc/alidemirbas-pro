# 51-journey design matrix — Phase 13

One row per public journey, all **51**, grouped under the nine category headings of
`audit/public-journey-scope.md`. **RET-24 is not in this matrix**: it was removed from the public
set by explicit decision (scope file, "RET-24 — the one real conflict, and how it was settled").

**Sources.** Trigger / Goal / Key split / Stop / Handoff from `audit/journey-blueprints.md`;
Model and Channels from `audit/channel-orchestration-map.md`; ownership-transfer events from
`audit/collision-review.md`; every Timing value and every wait key read back from
`production/canonical-dump.json`.

**How to read the cells.**

- **Touches** — the maximum customer-facing messages on *one path, to one recipient*. Not the
  node count: mutually exclusive branch messages are not added together. Where a journey reaches
  4+, the Model cell carries the justification.
- **Model** — Single · Sequential · Conditional · Parallel · Fallback · Segment-based ·
  Event-or-timeout. Nothing else is legal. A human or internal work item is **never** a model; it
  appears only in Handoff.
- **Channels** — Email, SMS, Push, WhatsApp, In-app only. `task` and `sales` are operational
  behaviour, not channels; where a journey raises an internal work item it is in Handoff.
  ACT-13, FBK-43 and FBK-49 declare `task` in canonical `channels` — correctly, and it is filtered
  at the publishing boundary, so it is absent from their Channels cells here.
- **Timing** — canonical `Config` values. A wait whose `after` is `required: true` with no default
  is written **"configured, no default"**; no number is invented for it. Ranges marked
  *(example-only)* carry `basis: "example-only"` in the dump and are illustrative defaults, not
  recommendations.
- **Stop condition** — the event that ends the journey immediately, usually the goal being met.
- **Handoff** — who takes ownership and on what event. Journeys marked *(not public)* are real
  canonical targets outside the 51; a handoff into one renders as a name, never a link.

---

## 1 · Acquisition, intent & qualification — 7 journeys

| ID | Journey | Trigger | Goal | Touches | Model | Channels | Timing | Key split | Stop condition | Handoff |
|---|---|---|---|---|---|---|---|---|---|---|
| ACQ-11 | Abandoned Process Recovery | `process_started` — an authoritative record that a resumable process opened with ≥1 item and a resume destination | Bring them back to *this* process and let them finish it | 3 | Sequential, Conditional, Event-or-timeout | Push, In-app, Email; SMS only on the final notice where a real expiry is asserted | 30–60 min from `last_activity_at`; 20–28 h to touch 2; recovery lifetime 3–7 days from trigger *(example-only)*; final wait bound to the platform's own `expires_at` | What is the process now — open, completed, cancelled, expired or superseded? | `process_completed` → `x.converted` | **FIN-134** on `payment_failed`, suppressing every queued recovery touch |
| ACQ-12 | Abandoned Selection Recovery | `selection_recorded` — items placed in a cart or saved list, with current availability and price | Show the selection as it currently stands and let them act | 2 | Sequential, Event-or-timeout | Push, In-app, Email — **no SMS**, there is no asserted deadline to name | 1–4 h from `last_selection_activity_at`, re-armed on edits; 2–4 days to touch 2; 7–14 day lifetime *(example-only)* | Can any of the selection still be acted on? | `selection_converted` — an order including a selected item | **ACQ-11** on `process_started`, carrying the touches already sent |
| ACQ-288 | Cart Abandonment Recovery | `item_added_to_cart` (authoritative) | Return a person who added to cart but never started checkout | 2 | Sequential, Segment-based, Fallback, Event-or-timeout | Push, Email, WhatsApp, SMS | 2 h from the trigger; 20–24 h to reminder 2; 48 h observation close *(all example-only)* | Is this a high-value cart? | `process_completed` — a purchase including a cart item → `x.purchased` | **ACQ-287** on `checkout_started`, suppressing every queued cart reminder |
| ACQ-287 | Checkout Abandonment Recovery | `checkout_started` — a checkout record with ≥1 item and a resume destination | Return a person who started checkout and did not finish | 2 | Sequential, Segment-based, Fallback, Event-or-timeout | Push, Email, WhatsApp, SMS | 45 min from the trigger; 6 h to reminder 2; 24 h observation close *(all example-only)* | Is this a high-value checkout? | `process_completed` — the checkout the reminders pointed at | none — it is the end of the cart/checkout chain |
| ACQ-09 | Lead Nurture | `valid_lead_not_destination_ready` — a captured lead with a recorded entry reason and no destination it is ready for | Spend one bounded window advancing a not-yet-ready lead, and close it either way | 1 | Single, Event-or-timeout | In-app in session, Email otherwise | `bounded_education.window` from the trigger — **configured, no default**; engagement inside it never extends it | Is there explicit permission and a lawful basis? Submitting a form is not consent | `nurture_progression_signal` → `h.progressed` | **ACQ-03** *(not public)* on progression, carrying the entry reason and what was already sent |
| ACQ-285 | New Lead Welcome | `first_party_interest_captured` — a capture with the stated context, a contact point and the permission position recorded as its own fact | Answer a declared interest with what that interest asked for, and go no further | 2 | Conditional, Sequential, Event-or-timeout | Email | Fulfilment immediately on capture, no wait; `captured_interest.nurture` bounded sequence from the previous touch — **configured, no default**, its end stated when it opens | Did they declare that they want a person, or the material? | `x.delivered` — fulfilled with no continuing permission; or `destination_declared` | **`external:sales-assignment`** where only a person can answer, carrying what they declared and what permission covers |
| ACQ-13 | Unresolved Interest Recovery | `interest_signal_recorded` — attributed, repeated, recent attention ending in neither a selection nor a process | Bring someone back to the thing they looked at, once, and leave everyone else alone | 1 | Single, Event-or-timeout | Push, In-app, Email | 12–48 h from `last_interest_at`; then a 3–7 day observation window with no second touch *(example-only)* | Does this attention qualify as interest at all? | `selection_recorded` / `process_started` / `purchase_completed` → `x.resolved` | none — the owning journey picks the subject up on its own trigger |

---

## 2 · Activation, onboarding & early value — 7 journeys

| ID | Journey | Trigger | Goal | Touches | Model | Channels | Timing | Key split | Stop condition | Handoff |
|---|---|---|---|---|---|---|---|---|---|---|
| ACT-17 | Adoption Nurture | `core_activation_completed` — an activation *with the artifact or result produced*, so recognition can name it | Turn one activation into repeated value in the same use-case | **5** | Sequential, Single, Event-or-timeout — **4+ justified**: recognition and one next action fire together at activation, then at most 3 behaviour nudges, one per observation window against a fixed budget. Each nudge is a different behaviour read from value-producing usage, never a re-send. See the decision list: 5 exceeds the declared cap of 4 | In-app in session, Email otherwise | No wait before recognition; `adoption.observation_window` from the previous touch — **configured, no default** — re-armed once per nudge, budget 3 *(example-only)* | Has adoption become stable — is value produced repeatedly at the use-case's own rhythm? | `value_produced` at the expected rhythm → `h.normal` | **`external:customer-lifecycle`** on stabilising; **ACT-18** on stall when the observation window closes |
| ACT-18 | Adoption Recovery | `expected_adoption_pattern_not_met` — measured against *this product's* intended rhythm | Diagnose why value stopped and address that one blocker, or record that there is nothing to address | 1 | Single, Event-or-timeout | Email; Push where the blocker is a single step | No wait before the touch — diagnosis comes first; `adoption_recovery.window` from the touch — **configured, no default** | What does the evidence show — recoverable blocker, needs a person, need genuinely met, or no problem at all? | `value_produced` → `h.adoption` | **ACT-17** on recovery; **`external:health-monitoring`** when the window closes; **`external:human-in-the-loop-lifecycle`** on a technical blocker |
| ACT-20 | Dormant Lead Reactivation | `engaged_non_customer_became_dormant` — past the inactivity threshold defined for this context | One bounded attempt to restart a relationship that never became a paying one | 1 | Single, Event-or-timeout | Email (they are out of the product); Push only where a token survives | No wait before the attempt; `dormant_non.return` reactivation window from the touch — **configured, no default**; then a required cooldown | Has this relationship ever been monetised in this context? (the hard boundary against RET-32) | `meaningful_return` — real state moving, not the message being opened | **ACT-12** on returning into unfinished setup; ACQ-03 / ACQ-05 *(not public)* on intent or re-qualification |
| ACT-13 | Onboarding Blocker Reminder | `activation_blocked_by_named_requirement` — a specific unmet requirement, not an empty optional field | Aim the whole journey at one named missing thing and resume onboarding once it exists | 1 | Single, Event-or-timeout | In-app in session, Email otherwise | `activation_blocker.resolve` from the trigger — **configured, no default**, sized to *this* requirement | Can the account resolve the requirement directly, or does it depend on someone else? | `named_requirement_satisfied` — queued reminders are cancelled the instant it arrives | **ACT-12** on resume; an **internal work item** to the party who owns the dependency; `external:human-in-the-loop-lifecycle` on escalation; ACT-11 *(not public)* on reroute |
| ACT-14 | Onboarding Help | `help_seeking_without_activation_progress` — repeated help-seeking *and* no activation progress behind it | Offer help to someone visibly trying and getting nowhere, and stop asking once they answer | **3** on the booked path (2 on the silent path) | Sequential, Single, Event-or-timeout — **justified**: each touch answers an event the person caused (they booked, the session produced an outcome). It is not a chase: the offer is made at most twice by guardrail, and the silent path gets one final self-service option and stops | In-app in session → Push → Email | `struggling_user.response` window from the offer — **configured, no default**; `struggling_user.session` = the scheduled session plus a short grace — **configured, no default** | Is a person already working this same blocker? (explicitly ACT-13's named requirement) | `activation_recorded`, or `assistance_declined` | **ACT-16** *(not public)* on activation, carrying whether assistance was involved |
| ACT-12 | Onboarding Nurture | `onboarding_active_without_activation` — an open onboarding instance with no activation recorded | Surface the single most useful next step until activation, a named blocker, or the window closes | **5** (1 per prompt, against a 5-prompt budget) | Sequential, Event-or-timeout — **4+ justified**: one prompt per interval, each read from the product's own milestone record; a completed step is never suggested again, so no prompt repeats another. The ceiling is the budget, not a planned cascade | In-app in session, Email otherwise | `onboarding.step_interval` from the previous touch — **configured, no default** — re-armed per prompt against a budget of 5 *(example-only)* | Is the same prerequisite actually blocking, or is this just a quiet interval? | `activation_recorded` — it supersedes the journey wherever it sits | **ACT-16** *(not public)* on activation; **ACT-13** on a named blocker, suppressing the generic prompt for that prerequisite |
| ACT-19 | Onboarding Personalization | `onboarding_needs_named_role_or_use_case` — a decision that depends on it, with no reliable value available | Get the one piece of context onboarding needs, only where not having it would change the path | 1 | Single, Event-or-timeout | In-app in session, Email otherwise | `role_use.answer` from the question — **configured, no default**, short by design; the timeout applies a documented default and does not write it into the declared field | Would the answer materially change the path to value? If not, do not ask | `question_answered` | **ACT-12** at `h.progress` — on the answer *or* on the documented default — carrying the declared value or the explicit fact that there is none |

---

## 3 · Engagement, retention & contactability — 6 journeys

| ID | Journey | Trigger | Goal | Touches | Model | Channels | Timing | Key split | Stop condition | Handoff |
|---|---|---|---|---|---|---|---|---|---|---|
| RET-28 | Cancellation Save | `explicit_cancellation_intent` — a cancel flow entered or a cancellation requested while still reversible | Learn why, offer one genuine alternative if one matches, and let them decide — with the cancellation path fully open beside it | 2 | Sequential, Single, Event-or-timeout | In-app beside the cancellation step; Email where intent was declared by phone or message | `cancellation_save.answer_window` = the end of the session or conversation the question was put in (attribute-bound, high confidence); `cancellation_save.intent_window` 7–14 days from the trigger *(example-only)* | Does a legitimate resolution exist for the reason they declared? | `cancellation_confirmed` or `cancellation_flow_abandoned` | **RET-30** when an alternative is offered, carrying the declared reason and the cancellation episode; SUB-167 *(not public)* on confirmation |
| RET-32 | Lapsed Customer Win-Back | `lapsed_customer_detected` — ≥1 completed paid term, lapsed under the company's rule, with the cancellation's own save window and cooldown already passed | Invite them back plainly, speaking to why they left where that is known | 2 | Sequential, Event-or-timeout | Email (they are out of the product); Push only where a token survives | Invitation immediately on eligibility; `winback.response_window` 14–30 days to the follow-up; `winback.lifetime` 30–60 days observing *(example-only)*; then a 180–365 day cooldown | Is this relationship one we may write to at all — reason, dispute history, permission? | `relationship_repaid` / `purchase_completed` → `x.won` | none — it is the lowest in `retention-outreach` and ends on its own |
| RET-31 | Predicted Need Replenishment | `expected_depletion_approaching` — inferred from *this person's own* prior purchase and the item's usable period | Get the replenishment made before the need bites, with the prediction stated honestly as an estimate | 2 | Sequential, Event-or-timeout | Email; Push/In-app where reorder is one step — **no SMS**, a prediction is not a deadline | `replenishment.lead_time` 3–7 days *before* `expected_depletion_at`; `follow_margin` 3–7 days *after* it; `lifetime` 14–30 days observing *(all example-only)*; the depletion date is recomputed from the latest purchase at every wait | At the lead point, is the need still genuinely unmet? | `purchase_completed` → `x.replenished`; `replenishment_need_dismissed` mutes the cycle | none |
| RET-30 | Retention Offer Follow-Up | `retention_intervention_delivered` — an intervention *actually delivered*, not merely scheduled | Close a retention attempt on what actually happened to the relationship, and stop the same offer being made twice | 1 | Single, Event-or-timeout | Email; In-app where the person is in the product | `retention_intervention.outcome` decision window from the trigger — **configured, no default**; there is no second window | Did the state actually change, or was the offer only accepted? | `retention_offer_accepted` / `retention_offer_declined` / `relationship_recovered` / `intervention_failed` | **RET-27** *(not public)* on a positive outcome; `external:operational-resolution` on a failure to apply; SUB-167 on a declined offer with the cancellation continuing |
| RET-26 | Service Recovery | `authoritative_negative_experience` — a *recorded failure*; negative feedback alone is FBK-43's | Say what failed, what was done and what prevents it — once, only when useful, only after resolution | 1 | Single | Email (something they can keep); Push only where the failure was in-app and they are active there | **No waits at all** — a single synchronous pass of eligibility questions; every wait would be a delay in an apology | Is a recovery communication actually useful here? A silent fix of something they never saw stays silent | The acknowledgement being sent with no remedy owed → `x.acknowledged` | `external:operational-resolution` while the issue is still unresolved; **REM-159** *(not public)* where a remedy is owed |
| CON-272 | Contact Recovery | `contact_point_recorded_undeliverable` — a *permanent* failure class against one specific destination | Get a dead destination replaced by asking on a route that still works | 2 | Fallback, Single, Event-or-timeout | In-app where they are in the product; otherwise the surviving permitted route — SMS or Email. **Never the failed destination** | Ask immediately on the undeliverable record; `contactability_repair.corrected` = the single repair cycle allowed for this destination — **configured, no default** | What can carry the repair request without using the broken destination? | `replacement_destination_verified` → `x.repaired`; or `destination_deliverable_again` → `x.recovered` | none — one cycle, then the destination stays suppressed |

---

## 4 · Feedback, advocacy & relationship signals — 4 journeys

| ID | Journey | Trigger | Goal | Touches | Model | Channels | Timing | Key split | Stop condition | Handoff |
|---|---|---|---|---|---|---|---|---|---|---|
| FBK-42 | Advocacy Request | `potential_advocacy_opportunity` — a contextually sensible moment against a relationship with accumulated positive evidence | Ask only where the relationship has earned it, and keep public reuse a separate permission | 1 (light ask or heavy ask, never both) | Segment-based, Event-or-timeout | Light ask: In-app / Push / Email. Heavy ask: Email or In-app — **never Push** | Ask immediately once evidence is sufficient; `advocacy_eligibility.response` window from the ask — **configured, no default**; then a required cooldown | What size of request does the accumulated evidence support — a rating, or a testimonial? | `advocacy_action_taken`, or `request_declined` | **CON-31** *(not public)* where public reuse is intended, holding the contribution unpublished until a separate permission exists |
| FBK-43 | Feedback Follow-Up | `feedback_received` — with enough substance to classify; a bare score is stored, not routed | Route one piece of feedback to what it operationally means, and close the loop only where something is owed | 1 (exactly one acknowledgement per record) | Conditional, Event-or-timeout | Email (they wrote to us); In-app where the feedback was given in-product | `feedback.obligation_sla` = **the owning process's own SLA** — configured, no default; this journey never invents a deadline for work it does not own. Promise window 7–14 days against `promised_followup_at` *(example-only)* | What does this feedback mean operationally? (a 7-way classification) | `work_item_outcome_recorded` with nothing promised outstanding → `x.closed` | **FBK-46** *(not public)* on an actionable issue, suppressing satisfaction and retention outreach about the same experience; **FBK-42** on advocacy eligibility; DEC-181 on unclassifiable feedback or a broken promise; an **internal work item** raised in the owning process |
| FBK-41 | Feedback Request | `potential_feedback_moment` — an experience reaching a point worth asking about | Ask about one completed experience, once, at an appropriate moment | 1 | Single, Event-or-timeout | In-app where the experience ended in-product; Email otherwise; Push where the answer is one step | `feedback_request.completion_horizon` on the incomplete branch — **configured, no default**; an experience that never completes inside it is never asked about. Response window 3–7 days *(example-only)* | Is the experience actually complete *from the person's side*? | `feedback_submitted` → `x.received` | none — what came back is FBK-43's, on its own trigger |
| FBK-49 | Missing Information Reminder | `required_data_missing_and_blocking` — a named business process that cannot safely proceed, and the specific item it waits on | Treat a genuinely blocking data gap as a named dependency, not as wanting to know more about someone | 1 | Single, Event-or-timeout | Email; In-app where the person is in the product | `missing_critical.received` from the request — **configured, no default**, sized to *what is blocked* rather than to the request | Who can actually supply the missing item — the customer, or someone internal? | `requested_information_received` and validated → `x.resumed` | `external:human-in-the-loop-lifecycle` on escalation, carrying what was already tried; an **internal work item** where an internal party holds the data |

---

## 5 · Time, deadlines, expiry & temporary states — 5 journeys

| ID | Journey | Trigger | Goal | Touches | Model | Channels | Timing | Key split | Stop condition | Handoff |
|---|---|---|---|---|---|---|---|---|---|---|
| TIM-268 | Action Required Reminder | `customer_owed_obligation_outstanding` — an authoritative record that a defined action is owed by a named person, with a due date | Remind somebody of what they owe while there is still time to do it | 2 (reminder, then confirmation *or* overdue notice) | Conditional, Single, Event-or-timeout | Email by default; **SMS only** where `due_at` falls inside the urgent horizon and SMS permission is recorded | `outstanding_obligation.due` — the reminder point measured back from `due_at`, **configured, no default**, skipped entirely where it is already past; then `w.deadline` runs to `due_at` itself | Is anything still owed at the moment of sending? The obligation is re-read immediately before the send | `obligation_satisfied` / `obligation_no_longer_owed` → `x.satisfied` (terminal) | **`external:consequence-owner`** where a defined consequence takes over, carrying what remains outstanding and exactly which reminders were sent |
| TIM-61 | Deadline Tracking | `authoritative_deadline_assigned` — by a system or rule *entitled to set one* | Let a deadline govern the **state** of one obligation, rather than schedule messages around a date | 1 per policy-defined threshold | Conditional, Event-or-timeout | Email; Push where the action is one step; **SMS or WhatsApp only** inside the urgent horizon with recorded permission | `deadline_tracking.tracking` bounded by `due_at` — **configured, no default** — re-armed per policy threshold. The touch cap `deadline_tracking.touches` is likewise **required with no default** | What does the governing rule say the deadline's passing means? (five outcomes, only one of them failure) | `obligation_satisfied` before the deadline — every queued reminder is invalidated | TIM-62 (overdue), OWN-55 (escalated), TIM-64 (expired) — *none public* |
| TIM-281 | Expired Access Recovery | `holder_acted_on_expired_entity` — an authoritative expiry *plus an attempt by the holder after it* | Give somebody who has come back the one route that actually restores it, at the moment they are asking | 2 (one route statement, one confirmation) | Conditional, Single, Event-or-timeout | Email; In-app where they are in the product | Route named at the moment of the attempt, no wait before it; `expired_entity.act` response window from the statement — **configured, no default** | Which mechanism restores validity here — renewal, requalification, replacement, or no route at all? | `validity_restored` → `x.restored` | none — where there is no route back, it says so once and ends at `x.terminal` |
| TIM-63 | Expiry Reminder | `pre_expiry_window_entered` — a window whose length reflects how long acting on it actually takes | Tell whoever can act what is expiring and the one action that changes the outcome — or say plainly what will happen, or say nothing | 1 (action prompt *or* informational notice, never both) | Conditional, Event-or-timeout | Email default; In-app where the responsible actor is in the product; **SMS or Push only** inside the urgent horizon where the action is one step and permission is recorded | No wait before the message — entering the window *is* the timing decision; `expiry.expiry_moment` runs to `expires_at` as the system of record asserts it (attribute-bound, high confidence) | Is an action available that would materially change the outcome? A prompt to act with nothing to do is a false one | `renewed` / `replaced` / `completion_recorded` → `h.resolved` | **`external:renewal-lifecycle`** on resolution, suppressing every expiry action queued under the old validity; **TIM-64** *(not public)* when the window closes unresolved |
| TIM-274 | Grace Period Recovery | `grace_period_started` — an authoritative grace state already recorded, with a fixed end date and a recorded recovery condition | Make grace a state the holder is in *knowingly* — what stopped, what still works, when it ends, the one route back | **3** (grace notice, last call, then confirmation *or* loss notice) | Conditional, Sequential, Single, Event-or-timeout — **justified**: the three are three different facts about one fixed window — it has opened, it is about to close, it closed or was recovered — not one message repeated. Both endings are stated because silence after recovery and silence after expiry are indistinguishable from inside the window | Email; SMS where `grace_deadline_at` is inside the urgent horizon with permission | Notice immediately on the grace state, no wait; `grace_period.grace` = the last point inside the window at which one further message can still be acted on, measured back from `grace_deadline_at` — **configured, no default**; `grace_period.final` runs to `grace_deadline_at` itself — **configured, no default** | Does grace restrict anything the holder will actually notice? | `recovery_condition_satisfied` → `x.recovered` | none — the window never extends and the journey ends at recovery, termination or loss |

---

## 6 · Access, identity & relationship — 5 journeys

| ID | Journey | Trigger | Goal | Touches | Model | Channels | Timing | Key split | Stop condition | Handoff |
|---|---|---|---|---|---|---|---|---|---|---|
| ACC-261 | Access Restriction Notice | `access_restriction_or_end_recorded` — authoritative, with a stated condition or deadline that would resolve it | Make a restriction a decision they can act on rather than a discovery they make later | 2 (notice, then restoration confirmation) | Conditional, Single, Event-or-timeout | Email; In-app where they are in the product | Notice immediately on the restriction, no wait; `access_restriction.resolve` runs to `resolution_deadline_at` — **configured, no default**; passing it silently would make the notice false | Can the holder do anything about this — is it theirs to resolve, or not? | `release_condition_met` / `restriction_lifted` → `x.restored` | **CON-36** *(not public)* when the notice cannot be delivered on any permitted route, carrying which routes were tried and why each was closed |
| ACC-263 | Activation Reminder | `entitlement_provisioned_and_reachable` — granted **and** confirmed reachable, with an activation window | Get them to actually use what they were granted before the claim window closes | 2 (one notice, one reminder — there is no second reminder) | Segment-based, Sequential, Event-or-timeout | Email; In-app where they are in the product | Notice on provisioning, no wait; `entitlement_activation.first_use` placed before `activation_window_ends_at`, late enough that the notice has had its chance — **configured, no default**; `last_chance` runs to the window's close — **configured, no default** | Is this the holder's first entitlement of this kind, or one they already use? | `capability_first_used` → `x.activated` | none |
| IDN-271 | Account Security Alert | `compromise_incident_opened_with_scope_determined` — the incident, its affected scope, and whether containment was applied | Tell the owner what was seen and what was restricted, and let their answer resolve it | 2 (alert, then all-clear *or* standing-open notice) | Single, Event-or-timeout | Email and/or SMS — **every verified destination the signal does not implicate, told at once** (`channelStrategy.simultaneous.allowed: true`), because a single destination may itself be the compromised one | Alert immediately on the incident opening, no wait; `security_alert.review_point` = the review point set by the security process — **configured, no default**. Exempt from pressure caps and marketing permission by design | Has anything actually been restricted (containment), or is this a watch? "Suspected" is not "confirmed" | `activity_confirmed_own` / `activity_reported_not_own` / `security_review_concluded` → `x.cleared` | **IDN-88** *(not public)* on a confirmed compromise, carrying which destinations were treated as implicated |
| IDN-84 | Verification Recovery | `verification_attempt_failed` — an attempt that did not establish its claim | Route a failed verification by *why* it failed, and keep our own failures out of the customer's verification record | 1 (a correctable explanation, or a terminal one) | Conditional | In-app where the person is in the product; Email otherwise | **No waits** — a person mid-verification is waiting on an answer now. The bound is the policy retry budget for this claim's security sensitivity; our own technical failures retry on backoff and send nothing | What kind of failure was it? (8-way classification into 4 routes) | `x.retry` — a bounded retry is available and the instance stays open against the same budget | **OWN-55** *(not public)* on a technical failure that is not clearing; **DEC-181** *(not public)* where human judgement is needed or the budget is spent |
| REL-284 | Invitation Reminder | `relationship_invitation_issued` — by a party with the authority, naming the counterparty, the scope, the direction and an expiry | Put a proposed link in front of the party who has to accept it, on terms they can see, and close the question before it goes stale | **3** (invitation, one reminder, one confirmation) | Segment-based, Sequential, Single, Event-or-timeout — **justified**: only one of the three is a chase. The invitation and the confirmation are the two ends of the transaction — the confirmation goes to *both sides* and names the scope, because an unstated scope is assumed to be total — and exactly one reminder sits between them | Email; In-app where the counterparty is in the product | Invitation on issue, no wait; `relationship_invitation.response` = the point at which one reminder would still leave time to act, measured back from `expires_at` — **configured, no default**; `final` runs to `expires_at` — **configured, no default** | Does the counterparty already exist here in their own right, or is this someone with no prior relationship? | `invitation_accepted` → `x.active` (declined or withdrawn closes it terminally) | none — every invitation expires rather than sitting open |

---

## 7 · Transactions, fulfillment & remedies — 6 journeys

| ID | Journey | Trigger | Goal | Touches | Model | Channels | Timing | Key split | Stop condition | Handoff |
|---|---|---|---|---|---|---|---|---|---|---|
| FIN-134 | Payment Failure Recovery | `authoritative_payment_failure` — the payment system stating the attempt failed; **a timeout is explicitly not one** | Get the obligation paid by responding to the failure that actually happened, while the obligation stays alive | **3** (corrective request or alternate-method choice, reminder, discharge confirmation) | Conditional, Sequential, Single, Event-or-timeout — **justified**: only the reminder is discretionary and it is capped at 1 (`payment.discretionary_touches`, `appliesTo: non-mandatory`). The corrective request and the discharge confirmation are obligations and are not rationed; a transient failure retries silently and sends none of them | In-app where a session is open (the fix is a form); Email otherwise; **SMS or Push only** where an asserted consequence date is inside the urgent horizon with service-message permission | Corrective request immediately on the failure; alternate-choice window 3–7 days *(example-only)*; `payment.reminder_point` 2–3 days before `consequence_date` *(example-only)*, skipped where no consequence date exists; `payment.recovery_window` from the trigger — **configured, no default** | What kind of failure was it — transient, customer-fixable, or declined with no usable reason? | `obligation_satisfied` → `x.recovered` | TIM-65 (grace), TIM-62 (overdue), ACC-78 (restriction) — *none public*. Uniquely a `handoff-chain` measurement scope: the outcome is observed *through* TIM-65 until `grace_period_ended` |
| FUL-146 | Delivery Delay Alert | `expected_fulfillment_timing_slipped` — a **material** slip; one inside the commitment's own tolerance is not | Hold lateness as its own state, with the original commitment intact behind whatever the new estimate is | 2 (delay update, then a choice offer *or* a no-choice/escalation update) | Conditional, Event-or-timeout | Email; SMS where the new time bound is inside the urgent horizon with permission | Update immediately on the slip, no wait — a delay the person does not know about is the failure this journey exists to prevent; `fulfillment_delay.decision` window — **configured, no default**; `fulfillment_delay.resume` revised horizon from the trigger — **configured, no default** | Does the counterparty have a real decision to make, or is there genuinely nothing to offer? | `fulfillment_resumed_or_completed` → `h.resume`. **The graph has no exit node** — every ending is a handoff | FUL-144 (resume), FUL-145 (alternative), FUL-150 (cancel), OWN-55 (escalation) — *none public*. Cedes in-transit slips to **FUL-265** by explicit suppression |
| FUL-265 | Delivery Tracking | `obligation_handed_to_delivery_executor` — a dispatch record naming the executor and the destination | Carry the recipient from "it left our hands" to "they agree it was discharged correctly" | **3** (dispatch notice, arrival-or-non-arrival notice, acceptance request) | Sequential, Conditional, Single, Event-or-timeout — **justified**: each states a different authoritative fact about a different moment — it left, it arrived (or did not), and silence from this date counts as acceptance. None repeats another, and the acceptance request is sent only where acceptance carries a consequence | Email; SMS where the expected window is inside the urgent horizon with permission | Dispatch notice on hand-off, no wait; `dispatch_to.delivery` = **the executor's own expected window** — configured, no default; its passing without an authoritative report is a non-arrival, never an assumed delivery. `dispatch_to.acceptance` runs to `acceptance_window_ends_at` — **configured, no default** | What did the executor authoritatively report — a final confirmation, or nothing? | `delivery_accepted` → `x.accepted` (terminal) | **FUL-148** on non-arrival, minting a fresh `delivery_attempt_id`; **FUL-149** *(not public)* on `delivery_issue_raised` |
| FUL-148 | Failed Delivery Recovery | `authoritative_delivery_attempt_failure` — the executor confirming an attempt was made and delivery did not occur | Recover a failed delivery according to why it failed, within a bounded number of attempts | 2 (a correction request, or an offer of concrete alternatives) | Conditional, Event-or-timeout | Email; SMS where the reattempt window is inside the urgent horizon with permission | Message immediately on the attempt failure, no wait; `delivery_attempt.correction` and `delivery_attempt.route_choice` are each waited on only as long as a reattempt inside the bounded policy is still possible — both **configured, no default** | What kind of failure was it — and specifically, **refused** (a decision) or **unavailable** (an absence)? | `delivery_correction_provided` → a further attempt dispatched (`h.retry`); otherwise the policy attempt limit being reached. **The graph has no exit node** | FUL-147 (retry), **REM-151** on return (minting a fresh `issue_id`), FUL-145 (damaged) — only REM-151 is public |
| REM-151 | Post-Purchase Issue Recovery | `post_completion_issue_reported` — a **concrete** problem with something delivered, not a feeling about the experience | Establish whether something delivered has left an obligation unresolved, and which mechanism could satisfy it | 1 (an acknowledgement, only on the no-defect branch) | Single | Email only | **No waits** — a reported issue is answered now, not after a window; a single assessment pass | Is there an actionable unresolved obligation, or an experience that fell short with nothing having gone wrong? | The assessment finding no unresolved obligation → `x.no-defect`; or an existing case absorbing it → `x.attached` | **REM-157** on an actionable obligation, carrying it stated as *what is owed* rather than as what was complained about |
| REM-157 | Remedy Confirmation | `remedy_decision_required` — a confirmed issue with an unresolved obligation and no remedy selected | Choose the remedy that would actually satisfy the obligation, from the ones that genuinely exist | 2 (options presented, then the no-remedy statement where that is the answer) | Conditional, Single, Event-or-timeout | Email; In-app where they are in the product | Options presented on the decision being required, no wait; `remedy_selection.selection` from the presentation — **configured, no default**; an unanswered choice takes the policy default, recorded as *no selection made* rather than as a choice | Does the counterparty genuinely choose between remedies at all? | `remedy_selected`, or the policy default applying at the selection timeout | REM-156 (correction), REM-155 (replacement), REM-152 (return), FIN-137 (refund) — *none public*; the refund handoff carries the explicit fact that this journey selected the remedy and did not decide the refund is owed |

---

## 8 · Subscriptions & scheduling — 6 journeys

| ID | Journey | Trigger | Goal | Touches | Model | Channels | Timing | Key split | Stop condition | Handoff |
|---|---|---|---|---|---|---|---|---|---|---|
| SUB-262 | Cancellation Confirmation | `cancellation_confirmed` — authoritative, **with an effective end date**; an intention or a failed payment is not one | Carry somebody from deciding to leave to losing access, so the end date is never a surprise | 2 (confirmation, then an ending notice where a meaningful window exists) | Sequential, Single, Event-or-timeout | Email (the record they keep); In-app where they are in the product | Confirmation immediately on cancellation, no wait; `cancellation_wind.window` runs to `effective_end_at` — **configured, no default**. Paid-for access is never cut short and the date never moves silently | Is there a meaningful window before access ends? If not, the second touch is skipped | `cancellation_withdrawn` → `x.returned`, immediately — a reminder that access is ending, sent to somebody who has just stayed, is worse than nothing | **SUB-170** *(not public)* where obligations outlive the end date |
| SUB-163 | Renewal Reminder | `renewal_decision_window_opens` — a term end inside the window the *governing terms* define | Bring a renewal cycle to a **recorded decision** before the notice deadline | 2 (the notice the terms oblige, and one decision request) | Conditional, Single, Event-or-timeout | Email; In-app where the decision holder is in the product; **SMS or Push only** where the notice deadline is inside the urgent horizon with service-message permission | Notice when the terms require it to be given; `renewal.decision_deadline` = `term_end_at` **minus the notice period the terms require** (attribute-bound, high confidence); `renewal.notice_deadline` bounds the blocked-review path on the same boundary | What does the renewal model require — automatic, an explicit decision, or internal review? | `renewal_decision_recorded` | SUB-164 (decided), SUB-168 (non-renewal), OWN-55 (review outlived the notice period), DEC-181 (terms undefined) — *none public*; the only exit is `x.superseded`, where a cancellation in motion takes the relationship |
| SCH-266 | Appointment Reminder | `confirmed_booking_with_customer_owed_prerequisites` — confirmed, future, with ≥1 outstanding prerequisite owned by the customer | Get the customer's side done before the commitment arrives, built from what the booking *is at the moment of sending* | 2 (one prerequisite prompt naming everything outstanding, then the at-risk notice **or** the reminder — never both) | Conditional, Single, Event-or-timeout | Email; In-app where the person is in the product; **SMS** for the at-risk notice and same-day reminders | `scheduling.pre_start_window` 24–72 h before `scheduled_at` *(example-only)*, set from how long the customer's own preparation takes — not from how long ago the booking was made. Too close to prompt goes straight to revalidation | Is anything outstanding that would stop the service actually happening? | `prerequisites_completed` discharges the prompt; `booking_materially_changed` or a cancellation ends it at `x.superseded` with nothing sent | **SCH-174** *(not public)* on a critical prerequisite still outstanding; **SCH-177** *(not public)* at pre-start, suppressing any further reminder for this occurrence |
| SCH-282 | Availability Search Abandonment | `availability_query_closed_without_reservation` — a query for a named person against a specific resource and window, with no reservation since | Follow up with something **genuinely bookable now**, or a waitlist place, or nothing | 1 (the nearest bookable window, or a waitlist place — one offer per query) | Conditional, Event-or-timeout | Email; Push where the route back is one step — **no SMS**, an abandoned enquiry carries no commitment | `availability_searched.settle` from the trigger — **configured, no default** — long enough that an unprompted booking has had its chance and no longer than the question stays live; the offer's and the waitlist's own validity windows are likewise **configured, no default**. Availability is re-evaluated from scratch at send time | What is actually available now — a near window, a waitlist place, or nothing? | `booking_confirmed` → `x.booked` | none — "nothing fits" exits silently at `x.nothing` with no message sent |
| SCH-277 | Booking Confirmation | `reservation_request_recorded` — against a named requester, resource and slot, with a permitted contact point; availability being *displayed* is not one | Tell the requester whether the time they asked for is now a commitment | 2 (acknowledgement, then one outcome message — confirm / re-offer / decline / lapse, mutually exclusive) | Conditional, Single, Event-or-timeout | Email; SMS where the requested slot is inside the urgent horizon with permission | Acknowledgement immediately on the request, no wait; `reservation_outcome.outcome` = the period booking semantics allow a request to stay unresolved — **configured, no default**; `w.choice` runs to `choice_deadline_at` — **configured, no default** | What did revalidation decide — committed, gone but something near, or gone with nothing near? | `booking_confirmed` → `x.confirmed`; a lapse is always stated, never left to silence | **SCH-173** *(not public)* when they take one of the offered slots |
| SCH-280 | No-Show Follow-Up | `no_show_recorded_against_booking` — authoritative, with the semantics it was judged under, and policy naming rebooking rather than a fee | State the fact without penalty language and give the single route to a new booking where one exists | 1 (a rebooking offer **or** an acknowledgement, never both) | Conditional, Event-or-timeout | Email (it carries the rebooking route); SMS where the rebooking window is short and permission is recorded | Message immediately after the booking's latest events are re-read, no wait; `no_show.rebooking_window` 7–14 days *(example-only)* | Could the provider or resource actually have delivered? Before telling somebody they missed something, prove it was not us | `rebooked` → `x.rebooked`; `rebooking_declined` or the stated window passing closes it | **SCH-180** *(not public)* where our own side could not have delivered — and **no message is sent** |

---

## 9 · Risk, documents, rollout & incidents — 5 journeys

| ID | Journey | Trigger | Goal | Touches | Model | Channels | Timing | Key split | Stop condition | Handoff |
|---|---|---|---|---|---|---|---|---|---|---|
| RSK-273 | Usage Limit Alert | `limit_reached_and_action_blocked` — an authoritative usage figure **and** an action actually blocked | Meet somebody at the moment a limit stops them with the three facts that decide what happens next | **3 per recipient** (wall notice, capacity offer or blocked-party notice, reset notice) | Parallel, Conditional, Single, Event-or-timeout — **justified**: the wall notice and the reset notice are mandatory and bracket a single discretionary offer (`usage_limit.touches`, `appliesTo: non-mandatory`). A fourth communication node fires on the held-elsewhere path, but it is the Parallel pair — the decision holder and the blocked party are two different people needing two different things | In-app (the wall notice, by definition — they are in the product); Email | Wall notice immediately at the block, no wait; `usage_limit.capacity` runs to the **authoritative** `window_resets_at` — configured, no default. No reset point is ever invented or guessed | Does the person who hit the limit hold the capacity decision? | `limit_reset` → `x.reset`, or `capacity_authorised` | **SUB-166** *(not public)* where capacity needs a plan or terms change |
| DOC-214 | Document Delivery | `issued_document_requires_distribution` — an **issued** version with a party to receive it; a draft is not one | Get a specific issued version to the party who should have it | 1 | Single, Event-or-timeout | Email only | `document_distribution.distribution` = the communication mechanism's own delivery window — **configured, no default**. Past it the outcome is reconciled, never assumed | How did the distribution resolve — confirmed, failed, or **unknown**? An unknown outcome is recorded as unknown and never as delivered | `distribution_confirmed` → `x.distributed` | **CMS-208** *(not public)* on failure, requiring any fallback route to carry the same version; `external:external-status-reconciliation` on an unknown outcome |
| DOC-215 | Signature Reminder | `document_requires_signature` — a version requiring signature by identified parties; mere acknowledgement is not one | Collect every required signature on one exact version: request once per signer, remind outstanding signers once, end honestly | **2 per signer** (one request, one reminder — a signer who signed is never reminded) | Sequential, Single, Event-or-timeout | Email only | `signature.reminder_point` 3–5 days before `validity_ends_at` *(example-only)*, or the process's recorded review point where no window is defined; `signature.validity_window` runs to `validity_ends_at` or that review point (attribute-bound, high confidence) | Is a signature validity window even defined? Where none is, **none is invented** | Every required signature collected on the correct version → `h.effective`; `document_version_superseded` ends it and suppresses outstanding requests | **DOC-216** *(not public)* when fully signed, stating explicitly that signed is not effective; `external:operational-resolution` on a decline, carrying that the document remains validly issued |
| RLT-279 | Upgrade Blocker Reminder | `target_held_on_named_prerequisite` — a held target, the **specific** blocker named rather than described, and preparation window time still remaining | Tell the holder the one thing standing between the target and the change, while there is still enough window to clear it | 2 (name the blocker with its date, then one last call naming the same blocker and the same date — there is no third) | Conditional, Sequential, Event-or-timeout | In-app where the holder is in the product; Email otherwise | Notice while enough preparation window remains, no wait before it; `upgrade_blocker.clear` = the point past which the target cannot be made ready in time, inside `preparation_window_ends_at` — **configured, no default**; `upgrade_blocker.final` runs to the window's end — **configured, no default** | Can the holder clear this blocker themselves? If not, nothing is asked of them | `named_requirement_satisfied` → `h.resume`; `change_withdrawn` ends it at `x.moot` | **RLT-242** *(not public)* on resume, carrying what the holder was told so readiness is not announced twice |
| INC-254 | Incident Update | `incident_reaches_communication_relevant_state` — a state change that could change what an affected party should do or expect; **time having passed is not one** | Tell the people actually affected something true and useful, through the mechanism that already owns delivery | 1 per material state change | Parallel, Single — **Parallel justified**: Email and In-app go together for two different purposes. Email carries the record to people who are not in the product; the in-app surface reaches whoever is hitting the fault right now. Neither is interruptive, so this is not two alarms | Email **and** In-app, together | **No waits and no wait node in the graph** — an incident update that waits is not an incident update. The next update is bound to a stated condition, never to a clock | Does this materially change the guidance the recipient already has? | The resolution notice reaching the scope that was told → `x.closed-comms`; where nothing material changed, `x.no-send` is recorded rather than passed over silently | none |

---

## Model distribution

A journey is counted once per model however many of its stages use it, so the column sums exceed 51.

| Model | Journeys | Count | Share of 51 |
|---|---:|---:|---:|
| **Single** | ACQ-09, ACQ-13, ACT-13, ACT-14, ACT-17, ACT-18, ACT-19, ACT-20, CON-272, RET-26, RET-28, RET-30, TIM-268, TIM-274, TIM-281, ACC-261, IDN-271, REL-284, FIN-134, FUL-265, REM-151, REM-157, SUB-262, SUB-163, SCH-266, SCH-277, RSK-273, DOC-214, DOC-215, INC-254 | **30** | 59% |
| **Conditional** | ACQ-11, ACQ-285, FBK-43, TIM-268, TIM-61, TIM-63, TIM-274, TIM-281, ACC-261, IDN-84, FIN-134, FUL-146, FUL-148, FUL-265, REM-157, SUB-163, SCH-266, SCH-277, SCH-280, SCH-282, RSK-273, RLT-279 | **22** | 43% |
| **Sequential** | ACQ-11, ACQ-12, ACQ-285, ACQ-287, ACQ-288, ACT-12, ACT-14, ACT-17, RET-28, RET-31, RET-32, TIM-274, ACC-263, REL-284, FIN-134, FUL-265, SUB-262, DOC-215, RLT-279 | **19** | 37% |
| **Segment-based** | ACQ-287, ACQ-288, FBK-42, ACC-263, REL-284 | **5** | 10% |
| **Fallback** | ACQ-287, ACQ-288, CON-272 | **3** | 6% |
| **Parallel** | RSK-273, INC-254 | **2** | 4% |
| **Event-or-timeout** | all except RET-26, IDN-84, REM-151 and INC-254 — the four journeys with no wait node in the graph | **47** | 92% |

**No single model dominates in a way that should worry anyone, and Fallback is nowhere near universal.**

- **Fallback — 3 of 51 (6%).** Used only where the first channel has genuinely failed or is known
  unreachable: a dead contact point (CON-272), and the two cart/checkout routers that need a push
  token to exist (ACQ-288, ACQ-287). Everywhere else a second channel appears it is because the
  message or the urgency changed — that is Conditional — not because the first one broke. This is
  the check the brief asked for, and it passes.
- **Single at 59% is the intended shape, not over-use.** It records that 30 journeys discharge at
  least one stage with exactly one message. Most of those 30 also carry Sequential or Conditional;
  only four are single-model end to end (RET-26, IDN-84 and REM-151 — all three wait-free and
  single-touch — plus INC-254, which pairs Single with Parallel).
- **Conditional at 43% is the genuine workhorse.** It is the model that decides *what is said*,
  which is where the corpus concentrates its design effort.
- **Parallel at 2 and Segment-based at 5 are both rare and both earned.** Parallel never pairs two
  interruptive channels: INC-254 is record + live surface, RSK-273 is two different people.
  Segment-based turns on order value (ACQ-287/288), first-time vs familiar holder (ACC-263),
  existing vs new counterparty (REL-284) and strength of relationship evidence (FBK-42).
- **Event-or-timeout at 47 is structural, not a style choice** — it is simply every journey with a
  wait node, and it combines with all the others.
- **Touch counts are not maximised.** 27 of 51 journeys reach at most 1 customer touch on any path;
  15 reach 2; 7 reach 3; and only ACT-17 and ACT-12 reach more — both flagged below.

---

## Rows that need a decision before implementation

Each of these is a row whose cells cannot be finalised without a call somebody else has to make.
The disagreement is stated and the options are listed; **none is resolved here.**

### 1 · ACQ-288 and ACQ-287 — the Touches cell contradicts the journeys' own prose

`ACQ-287.reusableRule` and both journeys' `distinctFrom` describe "a fixed three-touch cascade".
Both graphs contain **two** reminders; `w.third` runs out into a completion check and exits. The
blueprint (F3) and the orchestration map both count 2; the canonical prose says 3.
**Options:** (a) correct the prose to "two reminders then an abandonment check", which the
blueprint argues for; (b) add a third communication node to both graphs.

### 2 · ACQ-288 and ACQ-287 — the Touches, Channels and Handoff cells have no contract behind them

These are the only two of the 51 with no `contact`, no `channelStrategy`, no `orchestration`, no
`measurement`, no `eligibility`, no `suppressions`, an empty `entity.instanceKey` and no
`concurrency` (blueprint F2, collision S1 — **P0**). Consequences for this matrix: the Touches
cell has no `localCap` to rest on; the Channels cell has no `channelStrategy` behind the
WhatsApp/SMS escalation; the ACQ-288 → ACQ-287 handoff has no receiving contract for the touch
count it carries; and neither journey is in the `commerce-recovery` exclusion group that
ACQ-11/12/13, RET-31 and SCH-282 all use, so nothing suppresses them and they suppress nothing.
**Options:** (a) migrate both to the vNext contract before shipping — at minimum
`entity.instanceKey` + `concurrency`, a `contact` block joining `commerce-recovery`, and
`measurement`; (b) ship them as the two least-enforced rows in the library and record why.

### 3 · ACQ-288 vs ACQ-12, and ACQ-287 vs ACQ-11 — four rows, two lifecycle states

ACQ-11's entity scope names "the basket-and-checkout" and its trigger is a resumable process
opening; `checkout_started` satisfies it exactly. ACQ-12's trigger is items placed in a selection;
`item_added_to_cart` satisfies it exactly. Nothing arbitrates: the only separation is a
`distinctFrom` describing *authoring* intent, which the collision review is explicit is not
enforcement (C1.1, C1.2 — both **P0**). One cart-then-checkout session opens four instances and up
to ten messages, so four Trigger cells in this matrix describe two real-world moments.
**Options:** (a) *specialisation* — add ACQ-288/287 to `commerce-recovery` with precedence **above**
ACQ-12/ACQ-11 and `onLoss: suppressed` on the generic pair; (b) *presets* — demote ACQ-288/287 to
`discovery.presets` of ACQ-12/ACQ-11, which the scope file's fixing of all four as journeys puts
out of bounds unless that decision is reopened.

### 4 · ACT-17 — Touches 5 against a declared cap of 4, and against the orchestration map's own claim

The reachable maximum is recognition (1) + next action (1) + `adoption.nudge_budget` (default 3)
= **5**, while `adoption.touches` defaults to **4** (blueprint F5b). Separately, the orchestration
map's sanity check states "no journey exceeds 3 customer touches on any single path, and every
journey's touch count matches its canonical `contact.localCap`" — which is false for this row on
both halves. Three sources, three numbers.
**Options:** (a) raise the cap to 5; (b) lower the nudge budget to 2 so the cap holds; (c) leave the
graph and correct the orchestration map's claim.

### 5 · ACT-12 — Touches 5, same conflict with the orchestration map

`onboarding.step_prompts` defaults to 5 *(example-only)* and each prompt is a customer message, so
the maximum on one path is 5. The orchestration map's "no journey exceeds 3 customer touches on any
single path" is again contradicted. The graph is self-consistent — a completed step is never
re-prompted — so this is a reporting conflict, not a design fault.
**Options:** (a) accept 5 and correct the map's claim; (b) lower the prompt budget so the map's
statement becomes true across the corpus.

### 6 · ACQ-09 — the Touches cell contradicts the journey's own objective and cap

The graph sends **one** email and then waits out the whole window. `contact.localCap` is described
as "the number of educational touches inside the bounded window" and is `required: true` with no
default, and the objective promises "a window of useful education" (blueprint F5c). The
orchestration map agrees with the graph at one touch.
**Options:** (a) fix the objective and the cap's prose to say one touch, which the blueprint argues
is also the better design; (b) add further education nodes so the prose becomes true.

### 7 · ACQ-285 — Touches 2 on any path, cap default 3

`captured_interest.touches` defaults to 3 with the basis "the graph's own touch count". The
blueprint counts a maximum of 2 on any single path, because the third node sits on the
mutually exclusive person-request branch. This matrix's Touches column is defined per path, so the
row says 2 and the cap says 3.
**Options:** (a) correct the cap to 2; (b) keep 3 and record that this cap counts nodes rather than
a reachable path.

### 8 · ACT-13 and FBK-49 — cap 2 where only one message reaches a customer

Both default `touches` to 2 counting the internal `task` node as a touch; only one of the two is a
customer message, which is why both rows read 1. The `task`-as-channel question is already settled
at the display layer by the scope file, but the *cap* still counts it.
**Options:** (a) redefine these caps as customer-touch caps and set them to 1; (b) leave them as
plan-length counters and document that they include internal work items.

### 9 · TIM-268 vs TIM-61 — identical instance key, two pre-deadline reminders

Both key on `["obligation_id"]`, both `one-active-per-key`, both send a pre-deadline reminder about
the same obligation on overlapping channels, both declare `competition: "none"`, and neither
`distinctFrom` names the other (blueprint F4b, collision C8.1 and S2 — **P0**). Until one of them
owns the sending, both rows' Touches, Timing and Stop cells describe messages a customer would
receive twice. The collision review also shows TIM-268's generic eligibility swallowing **nine**
other public journeys' reminders (TIM-63, DOC-215, REL-284, ACC-263, RLT-279, SCH-266, ACT-13,
FBK-49 and TIM-61).
**Options:** (a) the review's S2 proposal — make TIM-268 the explicit *fallback*, owning an
obligation only where no type-scoped journey already owns its reminder, via one one-sided
eligibility clause plus a suppression; (b) a shared exclusion group on `obligation_id` ordering
TIM-61 (state) above TIM-268 (sending); (c) make TIM-61's `a.remind` defer to TIM-268 outright.

### 10 · FUL-146 and FUL-148 — the Stop condition cell has no exit to point at

Neither graph contains a single exit node; every ending is a handoff, and every target is outside
the public 51 (blueprint F5d). SUB-163 is the same shape with one exit (`x.superseded`) and four
non-public handoffs. Canonically correct, but a library reader sees a journey with no visible
ending.
**Options:** (a) no graph change, and the detail page gets a stated "ends by handing off to …"
treatment; (b) add terminal exits, which would duplicate state the receiving journeys own.

### 11 · FUL-265 — `x.unresolved` is a handoff wearing an exit's id

The non-arrival node is `kind: "handoff"` with `to: "FUL-148"` but is named `x.unresolved`, and
`measurement.journeyOutcome.refs` lists it beside real exits (blueprint F5e). Any consumer keying
off the id prefix will read this row's Stop cell and its Handoff cell as the same thing.
**Options:** (a) rename it to `h.unresolved`; (b) leave it and require every consumer to read
`kind` rather than the id.

### 12 · RSK-273 — the recipient of the reset notice is not stated

Four communication nodes fire on the held-elsewhere path, which is only 3 per recipient because
`a.offer-holder` and `a.notify-blocked-party` go to different people. But `a.reset`'s recipient is
not stated where the capacity decision was held elsewhere (blueprint F5f), so the row's "3 per
recipient" is true only under an assumption.
**Options:** (a) state which party the reset notice goes to; (b) split it into two notices, which
would make this the only journey with a second Parallel pair.

### 13 · INC-254 — the orchestration map assigns it a model its graph cannot support

The map counts INC-254 under Event-or-timeout ("all except RET-26, IDN-84, REM-151 and RET-24"),
but the canonical graph has **no wait node at all** — which the blueprint states directly and
approvingly ("an incident update that waits is not an incident update"). This row therefore omits
Event-or-timeout, and the distribution above reports 47 rather than the map's 48.
**Options:** (a) correct the map's Event-or-timeout list to exclude INC-254; (b) add the
stated-condition wait the blueprint describes, which would change the journey's design.

### 14 · RET-30 — the Stop condition cell does not fire on the event that should end it

`RET-30.w.outcome.until` lists four events and `cancellation_confirmed` is not among them
(collision C5.1 — **P0**). A customer who ignores the offer and completes the cancellation triggers
none of the four, so the wait times out into `a.followup` — a retention follow-up landing while
SUB-262 is sending the wind-down notice, which is exactly the re-litigation `SUB-262.s.g1` forbids.
**Options:** (a) add `cancellation_confirmed` and `cancellation_flow_abandoned` to
`w.outcome.until` plus a "decided meanwhile" branch routing to the existing `h.proceed`; (b) a
suppression on RET-30 alone; (c) put SUB-262 into `retention-outreach` so the group orders them.

### 15 · Four pairs whose Trigger and Goal cells describe one moment for one person

Each is a **P0** in the collision review with no enforcement today. All eight rows are written as if
the other did not exist, because the canonical data gives no basis to write them otherwise.

| Pair | The shared moment | What is missing |
|---|---|---|
| ACQ-285 vs ACQ-09 (C2.1) | A form fill that carries permission and is not destination-ready — both open a bounded email education sequence | Neither `distinctFrom` names the other; both `competition: "none"`; different keys (`capture_id` vs `lead_id`) so neither's "no instance already open" clause can see the other |
| ACT-19 vs ACT-12 (C3.1) | `onboarding_active_without_activation` is true for the whole of ACT-19's answer wait — ACT-12 may push the very step the answer was about to re-route | ACT-12 has a purpose-built clause for ACT-14 and none for ACT-19; both `distinctFrom` blocks absent |
| TIM-274 vs TIM-281 (C8.2) | A holder hits the reduction during grace and acts on it — which is the *normal* way grace is discovered — firing both triggers and two recovery routes for one entity | Neither names the other; both `competition: "none"` |
| SUB-163 vs TIM-63 (A1), and TIM-274 vs ACC-261 (A2) | A subscription term end is both a renewal window and a pre-expiry window; an unpaid obligation puts one account into grace *and* restriction, from two FIN-134 handoffs | Near-verbatim duplicate messages; SUB-163's required notice is exempt from pressure caps, so no cap deduplicates them |

**Options in every case:** (a) a reciprocal `distinctFrom` plus a shared exclusion group with an
explicit precedence and `onLoss`; (b) a one-sided eligibility clause naming the other journey's
open state, the pattern FUL-146/FUL-265 and FBK-41/FBK-42 already use successfully; (c) accept the
overlap as configuration-time guidance rather than a runtime rule. The collision review carries a
worked proposal for each; none is adopted here.
