# Public scope validation — the 52/21/73 reconciliation

> **Superseded as a statement of the current scope.** This file records how the
> library was reconciled to **52/21/73** at the end of Phases 0–24, and the
> RET-24 question it settled is still live and still correct. The scope itself
> has since moved: Phases 25–33 added seventeen journeys, so the library is
> **69 public / 21 excluded / 90 source**. `audit/public-journey-scope.md` is
> the current statement; `src/lib/public-corpus.ts` is the decision itself.
> Every "52" and "73" below is the figure as it stood then. The 21 exclusions
> are unchanged.

Written because the audit was running at **51 public journeys** while the
approved scope is **52**. This records which journey the difference was, how it
got there, what reversed it, and the state now.

## Current state — verified

| | | how |
|---|---|---|
| source corpus (library surface) | **73** | `audit/manifest.json` + the two scope lists |
| public journeys | **52** | `PUBLIC_LIBRARY_IDS` in `src/lib/public-corpus.ts` |
| excluded from the public product | **21** | `EXCLUDED_FROM_PUBLIC`, same file |

`52 + 21 = 73`, no duplicate ids, no id in both lists, every id resolves to a
real journey. Checked three independent ways:

1. **Module-load assertion** (`public-corpus.ts`) — the decided list and the
   list the surface rule derives must be the same 52 ids, or the build throws
   with the offending ids named.
2. **`scripts/validate-public-scope.mjs`** — 15 checks, 0 failures.
3. **A real render** — 52 slugs resolve `200` in EN and TR, 21 return `404` in
   EN and TR, both gallery pages state 52.

Downstream artifacts reconciled in the same pass: `production/surface-assignment.json`
(21 flagged `excludedFromPublic`), the six `search/search-index*.json` files
(journey documents back to 141), and `audit/manifest.json` (52 journeys,
`expected_count` 52, no issues).

---

## The unaccounted journey: RET-24 — Churn Risk Escalation

**It was not lost and it was not a silent change.** It was removed by an
explicit decision, taken in response to a direct question, and recorded at the
time in `audit/public-journey-scope.md` and in a comment at its own entry in
`public-corpus.ts`. What follows is the paper trail and the correction.

### Why it was ever in question

The brief carries two rules that RET-24, alone in the corpus, cannot satisfy at
the same time:

- *"The final public library contains EXACTLY 52 journeys"* — and RET-24 is on
  the list.
- *"Every public journey must contain at least one customer-facing
  communication action … If a public journey has zero customer-facing
  communication nodes: FAIL THE BUILD / AUDIT."*

RET-24 has **zero** communication actions. It declares one channel, `task`. Its
graph assembles risk evidence and routes:

| path | destination |
|---|---|
| cancellation intent already expressed | handoff → RET-28 |
| risk driven by a known operational problem | handoff → RET-23 |
| evidence justifies a person | account-owner task → external human lifecycle |
| proportionate automated recovery available | handoff → RET-30 |
| nothing proportionate to do | exit `x.monitor` |

Three options were put up — keep it as a documented exception, add a customer
message to it, or take it out of the 52 — and the recorded answer was to take
it out. That produced 51/22.

### What reversed it

Reinstating it surfaced a fact that the original analysis missed, and that
invalidates the reasoning which argued hardest against keeping it.

The case against keeping RET-24 rested on the claim that giving it a customer
message would duplicate RET-30's ownership of the same retention episode. Two
independent reviews said so, reading the journey's **handoff nodes**. Neither
read its `contact` block, which already arbitrates exactly that:

```
contact.competition = {
  exclusionGroup: "retention-outreach",
  scope:          "account",
  precedence:     "below an open issue under human ownership and below a
                   declared cancellation intent on the same account,
                   ABOVE generic retention intervention",
  onLoss:         "suppressed",
}
```

RET-24 is already ranked **above** generic retention intervention on the same
account, with `onLoss: suppressed`. The duplicate-ownership hazard that drove
its removal was already solved in its own authored data — which is the same
mechanism A9 asks for everywhere else.

So the removal was decided on an incomplete reading. RET-24 is back in the 52.

### The residual, and how it is held

Restoring it does not give it a customer message, and it should not have one.
Every message a customer receives from a RET-24 episode is sent by the journey
that took ownership — RET-28, RET-23 or RET-30 — under RET-24's own precedence.
Adding a fifth message would not add a customer touch; it would duplicate one
of those four, which is precisely the failure the ownership chains exist to
prevent.

The channel rule therefore carries **one recorded exception**, in
`scripts/validate-public-scope.mjs`:

```js
const CHANNEL_RULE_EXCEPTIONS = new Map([
  ["RET-24", "routing/escalation journey - its customer messaging is owned by
              RET-28 / RET-23 / RET-30 under RET-24's own
              retention-outreach precedence"],
]);
```

It is deliberately a **list with a reason beside each entry, printed on every
run**, not a boolean and not a silent skip:

- a second journey cannot join it without an edit here and a written reason;
- the run prints `WARN channel rule exception: RET-24 — …` every time, so it
  can never pass unnoticed;
- the check still **fails** for any journey not on the list.

This is the same discipline the repo already uses for reviewed vNext warnings
(`production/vnext-warning-reviews.json`): the rule stays enforced, the one
known-correct counterexample is named and justified rather than the rule being
weakened for everyone.

---

## Cause, stated plainly

The scope did not drift. A conflict between two rules in the brief was
escalated, decided, and implemented — and the decision was taken on an
analysis that had not read the one field which resolved the conflict without
removing anything. Restoring 52 was the correction, not a second scope change.

**Preventing a repeat:** any future claim that two journeys collide must quote
the `contact.competition` block of both before proposing that either be
removed, suppressed or given a message. Handoff nodes describe where work goes;
`contact.competition` is what decides who is allowed to talk. The collision
review's own soundest findings are the ones that read both.
