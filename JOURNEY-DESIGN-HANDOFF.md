# Canonical Journey Library — design handoff

This describes the problem space, not a solution. Nothing here dictates
color, type, spacing, or component names. Canonical data lives in
`src/canonical/*`; the production model derived from it (used throughout
this document) lives in `production/*` — see especially
`journey-view-model.schema.json`, `journey-graph-contract.json`,
`journey-content-stats.json`, and `journey-fixture-set.json`.

---

## 1. Scale

**255 active journeys**, 3186 nodes, 3816 edges, 26 categories, plus **5
merged redirects** that must never render as live journeys, appear in a
count, or rank independently.

## 2. Every journey is a graph, not a sequence

254 of 255 journeys branch (near-universal — this is a constant of the
domain, not a design differentiator). The meaningful structural axis is
**how a journey ends**:

| primaryStructure | count | meaning |
|---|---|---|
| mixed-termination | 209 | ends in both exits and handoffs |
| router | 30 | ends only in handoffs — pure dispatcher, never resolves in-library |
| self-contained | 16 | ends only in exits — never leaves the library |

Layered on top, **8 independent behaviors**, each present or absent per
journey (a journey can carry several at once — the richest, RET-30 and
FBK-46, carry 6 of the 8 simultaneously):

| behavior | count | design implication |
|---|---|---|
| cross-journey-handoff | 227 | most journeys link elsewhere — treat linking-out as the norm, not the exception |
| wait-timeout | 146 | needs two-armed rendering (event vs. timeout), never a single "next" |
| multi-exit | 135 | can't assume one exit slot |
| backward-edge | 125 | an edge that points to an earlier node — needs a distinct visual treatment (not a straight line down) |
| external-handoff | 68 | hands off to a lifecycle not yet defined — must render as a named PENDING state, never a broken or silently-live link |
| competition | 12 | this journey can lose ownership to another; the losing state (suppressed/paused/superseded/exit) is real content |
| preemption | 2 | vanishingly rare — do not over-invest design effort here, but do not silently drop it either |
| no-re-entry | 5 | the rare exit that forbids a new instance — worth a real visual flag precisely because 428 of 433 exits allow re-entry and don't need one |

## 3. True cycles are rarer than backward edges

Of the 125 journeys with a backward edge, only **33 form an actual graph
cycle** (a path that returns to its own source). The other 92 are simple
back-references. A layout engine needs a recursion guard for the 33; the
other 92 just need a "this points backward" visual cue. Conflating the two
would either over-engineer 92 simple cases or under-guard the 33 real ones.

## 4. Node and edge families

**7 node kinds**, all real, all present: `trigger` (255, exactly one per
journey), `action` (1131), `condition` (702), `wait` (164), `exit` (433),
`handoff` (500), `outcome` (1 — real but statistically negligible; support
it, don't design around it). **7 edge families**: `forward` (1329),
`branch` (1495), `cross-journey-handoff` (423), `wait-timeout` (147),
`backward` (207), `wait-event` (138), `external` (77). Full required/
optional/invalid-state/accessibility contract per family in
`journey-graph-contract.json`.

## 5. Content lengths — no clamping, ever

The single most dangerous assumption in this content: **`action.does` is a
node's ONLY headline field** (no secondary text), and it runs **median 214,
max 483 characters** (OWN-54). A one-line node-headline assumption fails on
the majority of action nodes, not just the outliers. By contrast,
`branch.label` (median 13, max 73 chars) and `wait.timeout.after` (median
35, max 119) are genuinely single-line safe. Full min/median/p90/p95/max
per field, with the record holding each extreme, in
`journey-content-stats.json` — 20 fields measured, none truncated.

## 6. Layout risks are real and quantified

9 categories in `journey-layout-risks.json`, each with an affected count
and worst-case journey id: branch count up to 6 arms (69 journeys with
≥4), forward-chain depth up to 12 (22 journeys with ≥10), up to 4 backward
edges on one graph, up to 6 exits, up to 7 handoffs, fan-in up to 5 and
fan-out up to 8 **on the same node** (ACQ-10 — the single worst
convergence/divergence case in the library).

## 7. External handoffs are a designed-in state, not a defect

18 distinct `external:` lifecycle names appear across 68 journeys — targets
a later category hasn't defined yet (this is intentional per
`src/canonical/types.ts`'s own doc comment). The render contract must
represent this as a named, non-clickable **pending** state — not a broken
link, not a live one. See `journey-graph-contract.json`'s `external` edge
family.

## 8. Merged IDs need their own small contract

5 old ids (CON-37, CMS-209, CTL-239, CTL-240, RET-25) resolve to survivors.
noindex, follow, canonical → survivor, excluded from sitemap, never counted
in any journey/category/graph statistic. Full contract in
`journey-merged-id-contract.json`.

## 9. SEO — mostly complete, one open decision

Title source (`journey.name`) is complete and unique across all 255.
Description source (`journey.purpose`) exists and is unique, but it's
written as internal documentation prose, not search-facing copy — whether
to use it verbatim or author a shorter public description is a real open
decision, not a data gap (flagged, not guessed, in
`journey-seo-contract.json`). hreflang is genuinely **UNKNOWN** — the
canonical schema carries no language field at all.

## 10. Mobile / narrow-viewport constraint

Every graph — from ACT-15's 5 nodes to SUB-166's 23 — has to remain legible
stacked at narrow width. There is no journey short enough to assume desktop-
only, and no journey long enough to justify abandoning mobile support for
"the complex ones only" — complexity and length don't correlate with
category in a way that would let mobile support be scoped down.

## 11. Component families implied by the data (not prescribed)

- A **graph view** shell that can render all 7 node kinds and 7 edge
  families through one consistent grammar (see `journey-graph-contract.json`).
- A distinct **backward-edge** treatment, and within it, a stricter
  **cycle-guard** path for the 33 true-cycle graphs.
- A **pending-external** state, visually distinct from both "no handoff"
  and "resolved handoff."
- A **terminal-exit** flag, reserved for the 5/433 exits that actually
  need it.
- A **competition/losing-state** treatment for the 12 journeys that
  compete for ownership.
- A **merged-redirect banner** state, reused across exactly 5 pages.
- Text components built for the real extremes in §5, not lorem ipsum.

---

## Design fixture set

`production/journey-fixture-set.json` — **17 journeys** chosen to hit every
dimension above at least once: shortest and longest journey, most nodes,
most edges, every primaryStructure, every one of the 8 behaviors, the
worst-case fan-in/fan-out node, the deepest chain, the most backward edges,
every content-length extreme (title, trigger evidence, branch label,
branch detail, guardrail, timeout reason), and one merged-ID alias
(CTL-240 → OWN-54, chosen because OWN-54 is itself a complexity outlier).
Stress-test against these 17 before touching the other 238.
