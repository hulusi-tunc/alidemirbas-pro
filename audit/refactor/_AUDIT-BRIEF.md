# Phase 1 audit brief — shared by every domain agent

**You write exactly ONE file, your own `audit/refactor/<domain>.md`.** Do not modify any
source file, any canonical journey, any component, or another agent's output. Do not
commit, push or open a PR. Other agents are auditing other domains in this same tree at
the same time.

## Source of truth

`audit/public-journeys-current-state.json` — read-only export of the current canonical AND
rendered display state of all 69 public journeys. Every canonical node's full raw data is
under `node.metadata`.

**It is 6.7 MB. NEVER read it whole — it will destroy your context.** Query it:

```js
const x = require("./audit/public-journeys-current-state.json");
const j = x.journeys.find(j => j.id === "ACQ-11");
console.log(JSON.stringify({ id:j.id, trigger:j.trigger, goal:j.goal,
  channelsDeclared:j.channelsDeclared, used:j.customerFacingChannelsActuallyUsed,
  orchestration:j.orchestrationRaw, ownership:j.ownership, handoffs:j.handoffs,
  suppressions:j.suppressions, displayDelta:j.displayDelta,
  nodes:j.canonicalNodes.map(n=>({id:n.id,type:n.type,label:n.label.en,
    channel:n.channel,wait:n.wait,condition:n.condition,targets:n.targets})) }, null, 2));
```

Pull one journey at a time, only the slices you need.
`audit/public-journeys-current-state-index.md` is small — read it fully.
Also small and useful: `audit/patterns.md`, `audit/glossary.md`,
`audit/public-journey-scope.md`, `audit/new-journey-collision-review.md`,
`audit/collision-fixes.md`, `audit/batch-{b,c,d}-notes.md`.

## What this refactor is for

Make these journeys read like credible, modern lifecycle journeys — the quality of thinking
found in a mature CRM platform, but **vendor-neutral**: never name a vendor, never copy
vendor copy or templates.

### The single most important rule

**There is NO universal channel orchestration model.** The corpus overuses a
"Primary X / Fallback Y" shape on almost every communication action. That is not acceptable
as a default.

Every communication stage uses the pattern that fits **that specific business moment**:
**single · sequential · conditional routing · parallel · fallback · segment-based ·
event-or-timeout · a justified combination**. None is mandatory. A journey may legitimately
be `Trigger → Wait → Email → Exit`.

**Fallback is legitimate ONLY when the desired channel genuinely cannot be used and another
substitutes for it** (push not reachable → email; WhatsApp not eligible → SMS). Multiple
channels on an action does NOT mean fallback. Do not call a secondary channel a fallback
just because it is second.

**Customer-facing channels are exactly:** `email` `sms` `push` `whatsapp` `in_app`.
Internal actions — CRM update, Slack, sales task, support assignment, human review, case
creation — are **not channels**. They may exist as supporting actions but must never be
presented as customer-facing. **Every public journey must have at least one genuine
customer-facing communication action.**

### Channel principles

- **Email** — detail, persistent reference, education, documents, transactional records.
- **SMS** — time-sensitive concise action: appointment, deadline, payment, delivery issue,
  urgent recovery. Not a generic fallback for everything.
- **Push** — active app audience, timely nudges, abandonment, status changes.
- **WhatsApp** — only where permission/eligibility exists and conversational contact
  genuinely fits. "High value ⇒ WhatsApp" is NOT a universal rule.
- **In-app** — active product users, onboarding, adoption, contextual guidance. Do not rely
  on In-app alone to recover someone who has stopped using the product.

## Method — ask these IN ORDER, per journey. Never start from the channel.

1. What actual event starts it? 2. What entity/state is tracked? 3. What is the
customer-facing purpose? 4. What is success? 5. What event should immediately terminate
communication? 6. Is an initial wait necessary? 7. How many touches are actually useful?
8. Before every later touch, does state need re-reading? 9. Does another journey take
ownership? 10. What channel behaviour fits this stage? 11. Does a split actually change
treatment? 12. What is the terminal outcome?

`Correctness > complexity. State > channel. Behavior > labels. Clarity > node count.`

Prefer **1–3 customer-facing touches**; a 4th or later needs a documented business reason
(an incident journey whose state genuinely changes over time may legitimately have more).
Repeated communication normally needs a **state re-check** before the next touch — never
send a reminder after success.

**Do not invent** segmentation, urgency, channel preference or eligibility signals to make a
journey look sophisticated. If the evidence for a split is not in the current data, prefer
the simpler pattern and say so.

**Do not generate 69 identical flows.** If nearly every journey lands on the same shape, the
refactor has failed. Diversity must come from business requirements, not from a quota.

## Canvas expectations

The display graph communicates: Trigger · Wait · Decision · Message · Handoff · Exit.
Technical detail belongs in the detail panel — global permission engines, generic contact
pressure checks, bookkeeping, measurement plumbing, technical identifiers. **But a condition
that materially changes the customer's path MUST stay visible.** Do not draw a generic
"does permission exist?" gate on every journey; expose it only where it genuinely changes
the visible route (e.g. `Can receive SMS? → SMS / Email`).

Each customer-facing message card should normally represent ONE channel, showing channel +
short action name. Triggers read naturally — `Checkout Started`, not
`Trigger checkout_started Declared`.

## Ownership already decided — do not reopen

Cart-specific recovery outranks generic selection recovery. Checkout-specific outranks
generic process recovery. Payment failure takes ownership from checkout recovery. New Lead
Welcome owns initial lead contact before Lead Nurture. Specific deadline/expiry journeys
outrank generic Action Required. Subscription Renewal outranks generic Expiry Reminder.
Payment Failure → Grace Period → Access Restriction. ACQ-289 ranks above ACQ-13.
CON-300 Sunset is distinct from Win-Back; its end state is marketing suppression.
RET-290 First Purchase Thank You stays distinct from FUL-301 Order Confirmation.

## Output format — one section per journey

**ID · Name · Purpose · Current flow** (plain text, arrows and branches) · **Problems found**
· **Final orchestration** (which pattern and why that one) · **Final customer channels** ·
**Customer touch count** · **Final flow** (plain text) · **State re-checks** ·
**Stop conditions** · **Ownership / handoff** · **Canonical changes needed** ·
**Display-only changes needed** · **Renderer changes needed**.

Be concrete enough that an implementer could build from your section without re-deriving the
design. Where you propose a split, name the signal it reads and where that signal already
exists in the data. Where you remove a split, say what it was doing and why it does not
change treatment.

End with a summary table: ID · before pattern · after pattern · channels · touches · biggest
change.
