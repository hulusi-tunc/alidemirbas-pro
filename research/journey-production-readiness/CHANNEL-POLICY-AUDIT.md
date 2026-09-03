# Channel policy audit — 71 orchestration-bearing Customer Journeys

Scope: the same 71 journeys as `COMMUNICATING-CUSTOMER-JOURNEYS-AUDIT.md` (see that file for why
the corpus count is 71, not the 68 named in this round's brief). This document answers one
question only: **does a journey's declared channel list actually tell an implementer which
channel to use for which message, or does it just list what the journey is capable of?**

**Status after the gap-closure round:** §4's FBK-43 (P0) is closed - `task` now has a declared
`channelStrategy` role and two touches. §4's ACQ-09, ACT-14 and §5's TIM-61/63/268/274 are closed
- see `FIXES-APPLIED.md` for the specific edits. §4's FBK-46 (P1, `task` unmapped, lower risk than
FBK-43) and §4's SCH-266/SCH-180/SCH-282 (P1, urgent-role eligibility text not evaluable) were named
here but not in this round's explicit scope list and remain open - both are real, itemized findings
worth a future pass. The findings below are otherwise as first written; only the closed items are
marked.

Channel richness is not scored here as a virtue. A journey with one channel and a stated reason
is READY on this dimension; a journey with three channels and no selection rule is not, however
many channels it lists.

## 1. Corpus channel usage

| Channel | Journeys using it |
|---|--:|
| email | 68 |
| in-app | 38 |
| sms | 20 |
| push | 17 |
| task | 10 |
| sales | 1 |
| whatsapp | 1 |

Email is the near-universal default (68 of 71) — it is the one channel every journey can assume
survives until the person can act, which is why it is the `persistent` role's default filler
almost everywhere in the corpus. `task`/`sales` are the human-routing channels, not messages; they
appear on journeys where the graph's own `execution: "human"` actions need a destination, not
where "we should also try a person" was added for reach.

## 2. Multi-channel journeys

**61 of 71 journeys (86%) declare more than one channel.** This is high, but it is a corpus
property worth stating plainly rather than treating as suspicious on its own: almost every
communicating journey in this library reaches its person through more than one route somewhere
across its touch plan (an in-session nudge if they're active, a persistent message if not, an
urgent channel if a real deadline is inside its horizon). The audit question is not "why so many
channels" but "is each one's selection rule real."

## 3. Journeys where action-level routing is already obvious

The large majority of the 61 multi-channel journeys pass this check outright: every
`channelStrategy.roles[].when` condition is genuinely mutually exclusive with its siblings (a
session/token check, a permission check, an asserted-deadline check), so an implementer reading
the contract can trace exactly one channel per send. Representative, fully resolved examples
across the five audit groups: ACQ-11/ACQ-12/ACQ-13 (app-session-or-push-token present vs. absent,
then SMS gated on an asserted time-bound element with explicit permission); FIN-134 (in-session
first, then persistent, then urgent only with an asserted consequence date and recorded service
permission); IDN-271 (declared `channelStrategy.simultaneous` — every verified, unimplicated
destination told at once, by design, not by omission); CON-264/CON-272 (channel is determined by
the destination kind itself, not a real choice to police).

## 4. Journeys where the journey-level channel list is insufficient

Six specific, real gaps surfaced across the batch — named here because each is a P0 or P1 finding
in the affected journey's own contract, not a stylistic nitpick:

1. **FBK-43 (Feedback Follow-Up)** — P0. Declares `email, in-app, task`; `channelStrategy.roles`
   maps only email and in-app. `task` has no role, no destination, and is not represented in any
   of the three modeled `orchestration.touches`, even though `a.obligation` (support-need work
   item) and `a.escalate` (severity escalation) are both `execution: "human"` and plainly need
   internal work-item routing. This is the clearest instance of "N channels declared, N-1
   explained" in the corpus.
2. **FBK-46 (Complaint Resolution)** — P1. Same shape, lower severity: `task` is declared and used
   by `a.assign`/`a.escalate`, both internal ticket-assignment steps with an obvious real-world
   mapping (a ticketing system's own assignment feature), so the ambiguity is smaller than
   FBK-43's.
3. **ACT-14 (Onboarding Help)** — P1, the clearest per-action ambiguity in the corpus. All four
   touches (offer/confirm/followup/final) list all three eligible roles
   (persistent/in-session/low-friction) with no per-touch narrowing beyond the generic
   journey-level role text — unlike its siblings ACT-12/ACT-13/ACT-17/ACT-19/ACT-20, which all
   resolve to a clean session-present-vs-absent either/or, ACT-14 gives no rule for which of the
   three actually fires on a given send.
4. **ACQ-09 (Lead Nurture)** — P1. The single touch `a.educate` is declared under two roles
   (persistent/email, in-session/in-app) whose "when" conditions are not mutually exclusive ("must
   survive" vs. "person is active" can both hold at once) — smaller than ACT-14's gap (one touch,
   two roles) but the same underlying problem: no stated precedence when both are true.
5. **FBK-42 (Advocacy Request)** — P1. `a.ask-heavy`'s declared eligible channels include push
   (low-friction) even though the action's own purpose text explicitly argues against an
   interruptive route for a high-commitment ask ("not an interruption to be tapped past; it needs
   somewhere they can read it twice") — the declared channel set contradicts the action's own
   documented intent.
6. **SCH-266 / SCH-180 / SCH-282** — P1, a shared pattern rather than three unrelated bugs. In each
   case an "urgent" (or "low-friction") role's stated eligibility condition cannot actually be
   evaluated as written: SCH-266's `a.remind` inherits the journey-wide urgent-role text verbatim
   even though it is only reachable once the critical-prerequisite condition has already resolved
   false, so half its own rule can never be true for that action; SCH-180's `a.inform` is offered
   the urgent role though nothing about the customer's committed time changed on that branch;
   SCH-282's push role requires "a valid token or app session," a signal no field in the journey's
   attribute list actually carries.

## 5. A related, narrower finding: named thresholds with no config key

**TIM-61, TIM-63, TIM-268, TIM-274** (P1, all four) each gate an "urgent" role on "an asserted
time bound lies inside the urgent horizon" — but none of the four names an `urgent_horizon`
attribute anywhere in `implementation.attributes`, unlike every other timing dependency in these
same journeys (due_at, grace_deadline_at, response windows), which are either attribute-bound or
carry a named `ConfigRef` key. The threshold exists only as prose inside
`channelStrategy.roles[].when`. This is a config gap that happens to surface through channel
selection, not a channel-selection defect on its own — recorded here because it was found while
auditing channel policy and would otherwise be easy to miss.

## 6. Channels that appear overused / under-modelled

- **Overused relative to modelling:** none of the corpus's channels are used gratuitously in the
  sense of "declared but never the right answer" — every channel that appears is genuinely reached
  by at least one real send path in at least one journey. The closer finding is **push**, which
  shows up in several journeys (ACT-14, ACQ-09, SCH-282 above) as the channel most likely to be
  declared without a fully principled selection rule — not because push itself is wrong, but
  because "low-friction, session/token present" is the easiest condition to state loosely and the
  hardest to verify without a named attribute.
- **Under-modelled:** `task`/`sales` (human routing) are correctly modelled everywhere they are the
  journey's *only* channel (RET-24, ACQ-04, ACT-11 — single-channel, no policy needed, no gap), but
  are the two channels most often left unmapped when declared *alongside* message channels
  (FBK-43, FBK-46 above) — an implementer reading only the journey-level `channels` array would not
  guess that a `task` destination is an internal work-item system, not a customer-facing send.

## 7. Proposed action-level channel-policy model

Confirmed by this audit as sufficient — see `implementation-contract.schema.ts`'s
`ChannelPolicyRule`:

```ts
interface ChannelPolicyRule {
  action: string;            // node id of the communication/human action
  eligible: string[];        // ordered — first eligible role wins
  preferredWhen?: string;
  fallback?: string[];
  urgency: "low" | "normal" | "high";
  requiresPermission: boolean;
  requiresContactability: boolean;
}
```

The audit did not find a case this shape could not express. What it found instead is a
*population* gap, not a *schema* gap: roughly a tenth of touches across the corpus (see §4-5) have
an eligible-channel entry whose `preferredWhen` either cannot be evaluated against the journey's
own declared attributes, or is not mutually exclusive with a sibling role. The fix in every case
above is a one- or two-line correction to an existing `channelStrategy.roles[].when` or the
addition of a missing attribute key — none required a new field on the model itself.

## 8. What this audit does not argue

No finding above recommends adding a channel to any journey to look more omnichannel, and no
journey was marked down for using only one channel. RET-24, ACQ-04 and ACT-11 (single `task`
channel, no policy needed) and REM-151/REM-152 (single `email` channel) are explicitly correct as
written.
