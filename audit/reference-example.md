# Reference example — ACQ-11, canonical graph vs display graph

Phase 2.3 asks for one journey worked end to end, so that "the display graph is
not the canonical graph" stops being a slogan. ACQ-11 *Abandoned Process
Recovery* is the right one: it is the journey the original brief was written
against, and every transform the corpus uses fires at least once inside it.

Nothing below changes `src/canonical/`. The canonical hash for ACQ-11 is
identical before and after every change in this audit — `audit/guard-display.mjs`
check G4 proves that mechanically on every run.

---

## The canonical graph

**26 nodes**: 1 trigger, 8 conditions, 6 actions, 5 waits, 5 exits, 1 handoff.

```
t.started
  → c.eligible ──Not eligible──────────────────────────→ x.no-action
       │ Eligible
       ↓
     a.open              (opens the instance, starts the abandonment clock)
       ↓
     w.abandon ──on event / on timeout──→ c.state
                                            ├─ Still resumable      → c.sendable
                                            ├─ Completed            → x.converted
                                            ├─ Cancelled/expired    → x.invalid
                                            ├─ Superseded           → x.superseded
                                            └─ Payment failed       → h.payment (FIN-134)
     c.sendable ──Sendable───→ a.touch1
                └─Suppressed─→ a.record-no-action → x.no-action
     a.touch1 → w.second → c.state2 → … c.sendable2 → a.touch2 …
     a.note-return → w.resumed → c.state2      (the resumed-then-still-open loop)
     … w.final → c.state3 → c.final-enabled → a.touch3 / x.lapsed
     … w.close → c.close → x.converted / x.lapsed
```

## The display graph

**21 nodes drawn.** Five canonical nodes are represented by another card rather
than drawn as one of their own, and each is still reachable in one click — the
detail panel lists them under **Represented canonical steps / Temsil edilen
kanonik adımlar**.

| canonical node | why it is not drawn | rule | drawn as part of |
|---|---|---|---|
| `a.open` | writes only `recovery_log`, in-degree 1, out-degree 1 | Family A — `absorbableBookkeeping` | `w.abandon` |
| `a.note-return` | writes only `recovery_log`, in-degree 1, out-degree 1 | Family A | `w.resumed` |
| `c.sendable` | 2 branches; the short arm records *why nothing was sent* before exiting | Family C — `collapsibleGates` | `a.touch1` |
| `c.sendable2` | the same gate, before the second touch | Family C | `a.touch2` |
| `a.record-no-action` | the hop both gates short-circuit through | Family C | the gates' own collapse |

`26 − 5 = 21`, which is exactly what a render of the page reports.

### What is deliberately still drawn

- **All five exits** (`x.converted`, `x.invalid`, `x.superseded`, `x.lapsed`,
  `x.no-action`) and the one handoff `h.payment → FIN-134`. The payment /
  abandonment boundary is a stated rule of this journey, so it can never become
  a hidden edge. Guard checks G1 and G2 fail the build if either disappears.
- **All four state re-reads** (`c.state`, `c.state2`, `c.state3`, `c.close`).
  "What is the process now?" is the question that decides send-versus-stop; it
  is the journey's business logic, not plumbing, and it is asked once per stage
  because each stage genuinely re-reads.
- **`c.final-enabled`.** Its short arm goes to `x.lapsed`, whose class is
  `timeout` — a business ending ("there is no honest expiry to name"), not a
  suppression record. The gate rule does not touch it, by design.
- **`c.eligible`.** See below.

### `c.eligible` — the one thing the brief asked for that is NOT shipped

The brief asked for the entry/eligibility plumbing to be folded into the trigger
card. `c.eligible` — *"Can this process be recovered for this person at all?"* —
is exactly that, and it is still drawn.

A rule for it was written and measured before being rejected. The structural
shape is easy to state: the trigger's immediate successor, a condition with
exactly two branches, one of which goes straight to an exit. Across the 73
public journeys that shape matches **9 conditions**:

| journey | node | asks | verdict |
|---|---|---|---|
| ACQ-09 | `c.basis` | Is there explicit permission and a lawful basis…? | plumbing |
| ACQ-11 | `c.eligible` | Can this process be recovered for this person at all? | plumbing |
| ACQ-12 | `c.eligible` | Can this selection be recovered for this person at all? | plumbing |
| ACT-14 | `c.hard-entry` | Are the hard entry conditions met? | plumbing |
| SCH-282 | `c.permitted` | May an unprompted offer be sent to this person at all? | plumbing |
| ACT-20 | `c.never-monetized` | Has this relationship ever been monetised…? | **borderline** |
| FBK-42 | `c.negative` | Is there an open negative issue anywhere…? | **borderline** |
| CON-283 | `c.less-or-none` | Did they ask for less, or for none? | **a real decision** |
| IDN-271 | `c.route` | Is there a destination the signal does not implicate? | **a real decision** |

Three of nine are business logic. That is the identical failure mode that
shipped in PR #9 and had to be undone in PR #10, where `exitClass ===
"no-action"` looked like a sufficient signal for an implementation gate and
erased authored decisions in five journeys. There is no further structural
signal in the canonical data that separates the top five from the bottom two —
`observes`, exit class, branch count and successor kind are the same on both
sides of that table.

So the rule is not shipped, and this is recorded rather than quietly dropped.
The honest options are (a) leave `c.eligible` drawn, which is what ships today,
or (b) add one authored field to the canonical schema marking a condition as an
entry precondition — a canonical change, which this audit's own constraint
(`mutation_required: false` in all 73 YAMLs) rules out without the author's
decision.

---

## What this example is meant to establish

1. **A collapse must be provable from data the corpus already authors.** Family
   A reads `writes` field names; Family C reads whether the short arm records a
   reason. Neither reads a journey id, and neither would need editing to handle
   a 74th journey.
2. **A collapse is a change of drawing, never of meaning.** Every hidden node is
   listed on the card that represents it, in canonical order.
3. **Endings are never collapsed.** Exits and handoffs are how a reader knows a
   journey can stop; G1 and G2 make that mechanical.
4. **When the signal is not there, the rule does not ship.** `c.eligible` is the
   worked example of that, and it is the reason the canvas is trustworthy at all.
