# Phase 1b — arbitration rules and the plan template

Eleven audits are complete. They overlap, and in a few places they disagree. These
rules are **binding** on every consolidator so the plan does not inherit the
disagreement.

## Which audit wins, by question

| question | binding source |
|---|---|
| orchestration pattern of a communication stage, and its final channel(s) | **J** `orchestration-matrix.md` |
| ownership, precedence, competition groups, handoffs, `distinctFrom` | **I** `ownership.md` |
| what the canvas draws, collapses, or must stop drawing; renderer changes | **K** `canvas.md` |
| business flow, trigger, waits, touch count, state re-checks, stop conditions, canonical edits | **the domain audit** |

Where a domain audit and a horizontal audit answer the **same** question, the
horizontal wins in its column above — *unless* the domain audit cites evidence the
horizontal did not have. In that case record **both**, mark the section
`CONFLICT — ESCALATED`, and state which you applied and why. Do not split the
difference silently.

## Conflicts already arbitrated — apply these, do not re-litigate

1. **RET-24 gets a customer-facing stage.** J refused to invent one and escalated it
   as a scope question; C designed one. **C's design stands.** The deciding evidence
   is C's, and J did not have it: `retention_intervention_delivered` is RET-30's
   trigger and **nothing in the corpus emits it**, while RET-24 is the only journey
   that holds the evidence and mints the episode id. That is not inventing a send —
   it is supplying the one the corpus already assumes happens. Record J's dissent in
   the section.

2. **FBK-43's cap is already correct** (1, customer-facing only). The journeys whose
   cap counts an internal work item are **FBK-49 and ACT-13**. My original brief said
   otherwise; D checked and corrected it. D is right.

3. **TIM-268's `w.due` is not event-or-timeout.** Both arms converge on the same
   action; nothing about the route depends on which fired. It is a timed wait with an
   early wake followed by a state re-read. Call it that.

4. **The five "Primary: Task" cards** (ACT-13, RET-24, FBK-43 ×2, FBK-49) are an
   `execution: "human"` rendering defect, found independently by J and K. One renderer
   rule; no canonical change.

5. **The six ACQ-287/288 routers are the library's only real channel resolution**, and
   all six are currently undrawn. Where a stage's pattern is `conditional` or
   `fallback`, the deciding node must be **visible**.

## The touch-count rule, restated

Count the **longest path to one recipient**, not `orchestration.touches.length`. D
established that the corpus's own counter is wrong: TIM-274 has 5 communication nodes
and a longest path of 3; TIM-281 has 5 and a longest path of 2. Mutually exclusive
branches are not added together.

## Section template — use EXACTLY this, one per journey

```
## <ID> — <Name>

**Purpose:** <one or two sentences>

**Current flow:**
<plain text, arrows and branches>

**Problems found:**
- <one per line, each traceable to an audit>

**Final orchestration:** <single | sequential | conditional | parallel | fallback | segment-based | event-or-timeout | combination — and why THAT one>

**Final customer channels:** <from the five; or `none (internal only)` if that is the truth>

**Customer touch count:** <n — longest path to one recipient>

**Final flow:**
<plain text, arrows and branches>

**State re-checks:** <what is re-read before each later touch, or `none needed — single touch`>

**Stop conditions:** <the events that end communication immediately>

**Ownership / handoff:** <who takes over, on what event; and what this journey must not say>

**Canonical changes needed:** <concrete: node ids, fields, edges. `none` is a valid answer>

**Display-only changes needed:** <concrete. `none` is valid>

**Renderer changes needed:** <generic rules only — never a journey id. `none` is valid>
```

`none` is a legitimate and expected answer in the last three fields. A journey that
is already right should say so plainly rather than be given work to justify a row.

## Hard constraints on every section

- Customer-facing channels are exactly `email` `sms` `push` `whatsapp` `in_app`.
  `task`, CRM, Slack, human review are supporting actions, never channels.
- Every public journey must end with **at least one genuine customer-facing
  communication action**.
- **No journey ids in renderer changes.** No per-journey layout, no coordinates.
- **Do not invent** a routing signal, a segment, an urgency or an eligibility test. If
  the signal is not in the data, say so and take the simpler pattern.
- The public scope stays **69 / 21 / 90**. No journey added or removed.
