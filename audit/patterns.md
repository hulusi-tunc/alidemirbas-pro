# Pattern inventory — Phase 2

Six audit slices read all 73 public journeys and each named the recurring shapes it
found in its own vocabulary. That produced **46 distinct pattern ids across 73
journeys**; this file is the reconciliation. Every id below was proposed by at
least one slice, every count is the number of journeys whose YAML in
`audit/journeys/` lists that id, and nothing here is estimated.

The point of the reconciliation is the rule in Phase 2.1: a display fix is only
worth building if it is **generic**. A pattern that occurs once is a journey's
own business logic and must stay drawn; a pattern that occurs in 40 journeys is
plumbing the reader should never have been shown. Families are ordered by what
they cost the reader, not by how many ids fed into them.

Severity across the corpus: **P0 5 · P1 50 · P2 18**. No journey is blocked
(`blocked_reason: null` in all 73) and **no journey requires a canonical
mutation** (`mutation_required: false` in all 73) — every finding is fixable in
the display layer.

---

## Family A — internal bookkeeping absorption · **IMPLEMENTED**

| id | journeys | what the slice called it |
|---|---|---|
| P-INTERNAL-01 | 40 | a single-purpose internal action between two real steps |
| P-RECORD-01 | 15 | "record why" / "write the reason" node |
| P-CLASSIFY-01 | 15 | classify-then-continue |
| P-CHECK-01 | 10 | re-read state and carry on |
| P-READ-01 | 9 | read context and carry on |
| P-OUTCOME-01 | 5 | write the outcome row |
| P-OPEN-01 | 4 | open the instance / start the clock |
| P-SETUP-01 | 4 | arm the thing the next step needs |
| P-EVAL-01 | 3 | evaluate and continue |
| P-ASSESS-01 | 3 | assess and continue |
| P-SEAL-01 | 2 | seal / finalize the record |
| P-COMM-02 | 2 | prepare-then-send split across two nodes |
| P-INTERNAL-02 | 1 | the same, one hop further along |

Unanimous across all six slices as the corpus's #1 source of canvas clutter.

**Shipped** as `absorbableBookkeeping()` in `src/lib/journey-canvas-layout.ts`
(PR #11). An `action` node is hidden when it is not the entry, carries no
`execution`, has exactly one incoming and one outgoing edge, and every `writes`
it declares matches the corpus's own journal-write naming convention
(`*_log`, `*_history`, `*_trail`, `*_audit`, `suppressed_sends`).

That last clause is the whole rule. Of the 117 single-in/single-out internal
actions in the public corpus, 77 write only a journal row and 26 write nothing
at all — those 103 are absorbed. The remaining **14 write real state**
(`a.resolve`, `a.context`, `a.identify`, `a.persist`, `a.evidence`, and the
channel routers) and keep their cards, because "reserve the resource" is a step
a reader needs to see.

Measured effect over all 73 journeys: **1065 → 962 display nodes (−9.7%)**,
42 journeys smaller, 31 unchanged, 0 larger; journeys still showing a plain
Internal card 52 → 26.

A broader variant several slices proposed — "collapse the internal action that
arms a wait" (P-SETUP-01 generalised, 53 nodes across 42 journeys) — was
**deliberately rejected**: it would have hidden genuine steps.

---

## Family B — wait + follower condition · **IMPLEMENTED**

| id | journeys | what the slice called it |
|---|---|---|
| P-WAIT-02 | 14 | the wait and the question after it are one step |
| P-WAITRES-01 | 12 | wait, then resolve what happened |
| P-WAITARM-01 | 7 | the wait's arms *are* the condition's branches |
| P-DEMUX-01 | 4 | the condition only demultiplexes the wait's own events |

The four ids describe the same shape and read, from the slice write-ups, like
the single largest remaining win. **Measuring the canonical graph does not
support that.** Across the 105 waits in the public corpus
(`audit/family-b-detector.mjs`):

- 86 waits send `onEvent` and `onTimeout` to **different** nodes. Those two arms
  are real, distinct information; merging them would erase a branch.
- 19 send both arms to the same node. 2 of those land on something that is not a
  condition, and 2 land on a condition another wait also converges on (ACQ-11's
  `w.second` and `w.resumed` both reach `c.state2` — the resumed-then-still-open
  loop is a second, real way in, so neither collapses).
- That leaves **15 waits across 7 journeys** where the wait has exactly one
  successor, that successor is a condition, and nothing else reaches it — the
  only case where the merge provably loses nothing.

The looser reading (any wait whose `onEvent` is a sole-parent condition, 43
cases) was tested for the signal that would make it safe — every branch's
`observes` value being one of the wait's own `until` events, which would prove
the condition is only naming which event fired. **Exactly 1 of the 43 passes.**
The corpus does not populate `observes` with event ids, so there is no honest
way to tell a demultiplexer from a real decision at those 43 sites, and the
looser reading was not shipped.

**Shipped** as `collapsibleWaitFollowers()` in `src/lib/journey-canvas-layout.ts`.
Unlike Families A/C/E, this one is not absorbed invisibly: the condition keeps
its own card, drawn taller by a compact duration strip
(`ConditionCard`'s `waitNode` prop, `JourneyCanvasNodes.tsx`) so "wait, then read
what happened" reads as one unit — *"30 minutes–60 minutes / What is the process
now?"* — instead of two boxes joined by a one-hop connector. The wait's own
canonical node is preserved exactly like every other collapse and listed under
*Represented canonical steps* when the card is opened.

Measured against a real render, both locales, all 73 journeys: **962 → 947
display nodes (−15, exactly the detector's 15 safe collapses)**, 7 journeys
affected (ACC-261 −1, ACQ-11 −2, ACQ-12 −3, ACQ-287 −3, ACQ-288 −3, RET-31 −2,
RSK-273 −1). `guard-display.mjs` PASS: canonical drift none, G1/G2/G3 findings 0.

---

## Family C — implementation gates · **IMPLEMENTED, then corrected**

| id | journeys | what the slice called it |
|---|---|---|
| P-GATE-01 | 22 | "may the touch go out?" permission/deliverability gate |
| P-GATE-02 | 6 | the same gate, second or third touch |
| P-GATE-03 | 2 | a gate whose short arm records the reason |
| P-GAUNTLET-01 | 2 | several gates in a row |

Shipped as `collapsibleGates()` in PR #9 — and it **erased authored business
logic in five journeys** (RET-24, TIM-63, RET-30, RET-32, ACQ-13), found
independently by three slices. `exitClass === "no-action"` alone does not
separate an implementation gate from a business decision.

PR #10 found the signal that does: a send-path gate **records why it did not
send** before exiting, whereas a business decision branches straight to its
outcome. Requiring the short arm to pass through a bookkeeping hop took the rule
from 24 collapsed gates to **9 — all nine literally asking "May the touch go
out?"** — and the 15 it stopped collapsing are all real business questions. A
second fix requires *every* parent of a shared hop to have collapsed before the
hop may be hidden (RET-32 lost its "Excluded" arm to that).

This family is also why `audit/guard-display.mjs` exists: the same class of bug
now fails mechanically against a real render instead of being caught by reading.

---

## Family D — terminals and handoffs · **PARTLY IMPLEMENTED**

| id | journeys | what the slice called it |
|---|---|---|
| P-EXIT-01 | 55 | exit cards carrying a whole sentence |
| P-TERM-01 | 39 | a shared terminal dragged far from its branch |
| P-HANDOFF-01 | 38 | the handoff card does not name its target |
| P-TERM-02 | 8 | terminal drawn once, connector crosses the canvas |
| P-HANDOFF-02 | 3 | handoff into an archived journey |
| P-LADDER-01 | 4 | exits stacked in a column below everything |

Already shipped before this audit: per-parent instancing of shared terminals
(`x.converted@c.state`) keeps a branch's ending beside the branch; `splitExitState()`
cuts an exit headline at its first real boundary; and the handoff headline now
reads the target journey's short name on both routes.

The remaining P-EXIT-01 / P-TERM-01 counts are largely **already satisfied by
those rules** — the slices audited a render that predates them in part. What is
genuinely left is P-HANDOFF-02: a handoff into an archived Operational Workflows
journey renders as the target's name in text and never as a link, which is
correct and documented, but the card does not say *why* it is not a link.

---

## Family E — text budgets · **IMPLEMENTED**

| id | journeys | what the slice called it |
|---|---|---|
| P-DETAIL-01 | 49 | canonical paragraph sitting on a card |
| P-TEXT-01 | 11 | card text too long to read at a glance |
| P-DETAIL-03 | 5 | the detail panel repeats the card verbatim |
| P-CONTENT-01 | 1 | message card says nothing about the message |

The second-largest family by journey count, and the one that matches the brief's
own words most directly: *canvas'ta teknik paragraf olmasın*.

Every card body was already `line-clamp-2`, so nothing overflowed — but the clamp
cuts wherever the second line runs out, mid-word. The corpus's longest action
sentence is **412 characters** (FBK-47 `a.apply`); a reader glancing at it got
half a subordinate clause and no sign there was more.

**Shipped** as `cardSummary()` in `src/components/ui/JourneyCanvasNodes.tsx`: the
card body is cut at the sentence's own first boundary that fits a 120-character
budget — end of sentence, colon, semicolon or dash first, a comma or "or"/"veya"
only as a last resort — taking the longest such cut, never below 24 characters.
Nothing is paraphrased and the detail panel still renders `node.headline` in
full. It is the same rule the wait pill has used since it shipped (`firstClause`),
generalised to every card.

Measured: **56 → 25 long cards, longest card text 412 → 133 characters** (133
because the kind row, "Internal · 03", is part of the measured string; every body
is ≤ 120 by construction). 1196 of the corpus's 2685 node sentences now get a
summary; 7 have no boundary inside the budget and keep the clamp, exactly as
before.

---

## Family F — labels, merges and loops · **NOT IMPLEMENTED**

| id | journeys | what the slice called it |
|---|---|---|
| P-MERGE-01 | 41 | two arms to the same target drawn as two edges |
| P-LABEL-01 | 38 | branch label too long for its chip |
| P-LOOP-01 | 12 | the back edge drawn as a second lane |
| P-STATE-01 | 14 | the same state question asked in four different shapes |
| P-RECHECK-01 | 3 | the same, named explicitly |
| P-FORK-NOOP-01 | 2 | a fork whose arms do the same thing |
| P-ECHO-01 / P-MIRROR-01 / P-REPEAT-01 | 1 each | a stage repeated verbatim |

P-MERGE-01 is **already implemented** (the twin-route edge merge), which is
itself what produces the remaining P-LABEL-01 findings: a merged edge joins both
arms' labels with "·", so the longest label on the canvas is 71 characters
(*"Değiştiriyor · Değiştirmiyor ama yine de bir güncelleme yükümlülüğü var"*).
180 labels exceed 24 characters. The fix is a label budget of the same shape as
Family E's, applied to `estimatedLabelWidth`'s input rather than to the card.

P-STATE-01 / P-RECHECK-01 want the *same question asked at several stages* to
render in one recognisable form. That is a real reader win and it is generic —
the signal is a set of conditions in one journey sharing an `asks` string — but
it changes how a decision reads, so it wants a render-and-critique pass rather
than a measurement.

---

## What is left, in order

1. **Family F labels** — a 120-character budget on merged branch labels. Same
   shape as Family E, low risk, 38 journeys.
2. **Family D handoff affordance** — say on the card why an archived target is
   not a link.
3. **Family F / P-STATE-01** — one form for a repeated state question. Design
   work, not a transform.

Nothing on that list requires touching `src/canonical/`, and nothing on it can
be implemented by branching on a journey id — the constraint from Phase 2.1
holds for all three.
