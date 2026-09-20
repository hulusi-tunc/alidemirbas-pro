# 73-journey display audit — final report

Every number in this file is computed from `audit/manifest.json`,
`audit/journeys/*.yaml`, `audit/display-before.json`, `audit/display-after.json`
and `audit/guard-report.json`. None is estimated.

---

## 1. Scope

| | |
|---|---|
| public journeys in the library | **73** (the page's own derived count, `LIBRARY_JOURNEYS`) |
| journeys audited | **73 / 73** — one YAML each in `audit/journeys/` |
| journeys blocked | **0** (`blocked_reason: null` in all 73) |
| journeys needing a canonical change | **0** (`mutation_required: false` in all 73) |
| severity | **P0 5 · P1 50 · P2 18** |
| journey types in the taxonomy | 20, every journey carrying at least one |

The canonical corpus itself is untouched: `npm run validate:canonical` reports
**286 journeys · 3728 nodes · 0 errors · 0 unreviewed vNext warnings**, and
`validate:journey-production` check 30 reports **canonical source mutation = 0**.

## 2. What the audit found

The six slices proposed **46 distinct pattern ids**. `audit/patterns.md`
reconciles them into six families. Counts are journeys, not occurrences:

| family | top id | journeys | status |
|---|---|---|---|
| A — internal bookkeeping | P-INTERNAL-01 | 40 | **shipped** (#11) |
| B — wait + follower condition | P-WAIT-02 | 14 | measured, capped at 15 waits, queued |
| C — implementation gates | P-GATE-01 | 22 | **shipped** (#9), **corrected** (#10) |
| D — terminals and handoffs | P-EXIT-01 | 55 | mostly shipped before this audit |
| E — text budgets | P-DETAIL-01 | 49 | **shipped** (#12) |
| F — labels, merges, loops | P-MERGE-01 | 41 | merge shipped; labels measured, deprioritised |

## 3. What shipped

All four changes are generic transforms in the display layer. **No rule branches
on a journey id, no coordinate is hand-placed, and the ELK layout engine is
unchanged** — the Phase 2.1 constraint holds for every one of them.

**PR #9 → #10 — implementation gates.** A send-path gate ("May the touch go
out?") draws no box. The first version used `exitClass === "no-action"` alone
and **erased authored business logic in five journeys** (RET-24, TIM-63, RET-30,
RET-32, ACQ-13), found independently by three slices. #10 replaced the signal:
the short arm must pass through a node that *records why nothing was sent*.
That took the rule from 24 collapsed gates to **9 — all nine literally asking
"May the touch go out?"** — and the 15 it stopped collapsing are all real
business questions. A second fix requires every parent of a shared hop to have
collapsed before the hop may be hidden.

**PR #11 — bookkeeping absorption.** An internal action is hidden when it is not
the entry, carries no `execution`, has one edge in and one out, and every
`writes` it declares matches the corpus's journal-write convention (`*_log`,
`*_history`, `*_trail`, `*_audit`, `suppressed_sends`). Of the 117 such actions,
**103 are absorbed and 14 keep their cards** because they write real state.

**PR #11 — represented canonical steps.** Every card that stands for more than
one canonical node lists all of them in the detail panel, in canonical order —
*Represented canonical steps / Temsil edilen kanonik adımlar*. This is the
Phase 2.2 contract and it is what makes a collapse a change of drawing rather
than of meaning.

**PR #12 — card text budget.** `cardSummary()` cuts a card body at the
sentence's own first boundary that fits 120 characters, taking the longest such
cut, never below 24. The detail panel still renders the full sentence.

## 4. Measured effect

Both phases measured with the same script against a real render of all 73
journeys in both locales (`audit/measure-display.mjs`).

| | before | after |
|---|---|---|
| display nodes, all 73 journeys | 1065 | **962** (−103, −9.7%) |
| per journey | min 8 / median 14 / max 34 | min 7 / median 13 / max 29 |
| journeys reduced / unchanged / grown | — | **42 / 31 / 0** |
| journeys still showing a plain Internal card | 52 | **26** |
| long cards (>110 chars), both locales | 56 | **25** |
| longest card text | 412 | **133** |
| render errors | 0 | **0** |
| locale leaks | 0 | **0** |

Largest reductions: DOC-215 21→13, DEC-184 19→13, SCH-180 18→12, DOC-220 14→9,
INC-254 14→9, DOC-214 11→7.

133 rather than 120 because the measured string includes the card's kind row
(`Internal · 03`); every card *body* is ≤ 120 by construction.

## 5. Complexity budget

Against the brief's targets (short ≤ 8, standard ≤ 12, medium multi-branch ≤ 16):

- more than 16 nodes: **15 → 9** journeys
- more than 12 nodes: **57 → 44** journeys
- more than 8 nodes: **71 → 69** journeys
- the largest journey: **FBK-43, 34 → 29**

The corpus does not reach the budget on node count alone, and the remaining
overage is concentrated in genuinely large multi-branch journeys rather than
spread thinly. The families that would close the rest are B (15 nodes, capped)
and F/P-STATE-01 (design work, not a transform) — see §7.

## 6. Validation

| gate | result |
|---|---|
| `node audit/guard-display.mjs` | **PASS** — G4 canonical drift none (73/73 hashes match), G1/G2/G3 findings **0** |
| `npm run validate:canonical` | PASS — 0 errors, 0 unreviewed vNext warnings |
| `npm run validate:journey-production` | PASS — 30/30, canonical source mutation 0 |
| `npm run validate:seo` | PASS — 0 errors |
| `npx tsc --noEmit` | clean |
| `npm run build` | exit 0 |
| `npm run lint` | **1 error, pre-existing and unrelated** — see below |

`audit/guard-display.mjs` is the audit's own durable product. It renders every
journey in both locales and fails if any canonical exit with a live parent is
not drawn (G1), any handoff is not drawn (G2), any drawn condition loses an
out-edge per distinct branch target (G3), or any of the 73 canonical hashes
drifts (G4). The class of bug that shipped in PR #9 now fails mechanically
instead of being caught by reading.

The one lint error is in `src/components/ui/MobileNav.tsx:78`
(`react-hooks/set-state-in-effect`) — a file this audit never touched, and
already on `main` before it started. It does not fail the build. Left alone
deliberately rather than folded into an unrelated change.

## 7. What is left, and why

1. **Family F — merged branch labels.** 180 labels exceed 24 characters; the
   longest is 71 (*"Değiştiriyor · Değiştirmiyor ama yine de bir güncelleme
   yükümlülüğü var"*), produced by the twin-route edge merge joining two arms'
   labels. Deprioritised on measurement: 86 of the 180 are in the 20–30 range
   and only 10 exceed 50, so this is one long line, not a paragraph.
2. **Family B — wait + follower condition, 15 waits across 7 journeys.** The id
   counts suggested ~28 journeys; the canonical graph gives 15 waits, because 86
   of the 105 waits send `onEvent` and `onTimeout` to different nodes and
   merging would erase a branch. Worth doing, small.
3. **Entry eligibility gates — measured and NOT shipped.** The brief asked for
   entry plumbing to fold into the trigger. The structural shape matches 9
   conditions corpus-wide and **3 of the 9 are real business decisions**
   (CON-283 *"Did they ask for less, or for none?"*, IDN-271, and arguably
   ACT-20). No further signal in the canonical data separates them. Shipping it
   would repeat PR #9 exactly. `audit/reference-example.md` works this through
   on ACQ-11, where `c.eligible` is consequently still drawn.
4. **P-STATE-01 — one form for a repeated state question** (14 journeys). Real,
   generic, and a change to how a decision *reads* rather than to the graph, so
   it wants a render-and-critique pass rather than a measurement.

## 8. Files

| file | what it is |
|---|---|
| `audit/repo-map.md` | Phase 0 discovery |
| `audit/build-manifest.mjs` → `manifest.json`, `canonical-baseline.json` | the 73-journey manifest and the per-journey semantic hashes |
| `audit/journeys/*.yaml` | 73 per-journey audits |
| `audit/patterns.md` | Phase 2 — 46 ids reconciled into 6 families |
| `audit/reference-example.md` | Phase 2.3 — ACQ-11 canonical vs display, worked |
| `audit/glossary.md` | Phase 2.4 — the shipped EN/TR pairs and where they live |
| `audit/measure-display.mjs` → `display-before.json`, `display-after.json` | the render-based measurement |
| `audit/guard-display.mjs` → `guard-report.json` | the P0 guard |
| `audit/REPORT.md` | this file |
