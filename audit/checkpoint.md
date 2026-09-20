# Current Checkpoint

Scope: **58 public / 21 excluded / 79 source** — Batch A of the 17 additions shipped.
Target when all four batches land: **69 public / 21 excluded / 90 source**.
Phase: Phase 25–33, adding 17 new public journeys, over the approved decision
list (`audit/DECISIONS-PENDING.md`) which is partly still open.

## Execution order and status

| # | Step | Status |
|---|---|---|
| 0 | Reconcile 52 vs 51 | **DONE** — PR #21 |
| 1 | A1 — ACQ-287/288 vNext ownership contract | **DONE** |
| 2 | A2 + A3 — commerce precedence, payment handoff | **DONE** |
| 3 | A4 — TIM-268 generic fallback | **DONE** |
| 4 | A5–A9 — remaining ownership rules | **DONE** (A5, A6, A7, A8, A9) |
| 5 | B — contact-count changes | B3 + B4 **DONE**; B1/B2/B5 pending |
| 6 | C — data hygiene | C1 **DONE**; C2–C5 pending |
| 7 | D — canvas fixes | pending |
| 8 | Redesign batches over the 52 | pending |
| 9 | Phase 25–33 — 17 new journeys | Batch A **DONE** (ACQ-289, RET-290, FUL-291, RET-292, RET-293, RET-294); B/C/D pending |

## Shipped to main

| PR | What |
|---|---|
| #14 | Family B — wait folded into its exclusive decision |
| #15 | Public library scoped from 73 → 51 (superseded by #21) |
| #16 | Canvas: implementation vocabulary off the cards |
| #17 | Repo map rewritten for this refactor |
| #18 / #19 | Phase 13 design matrix + its count correction |
| #20 | `DECISIONS-PENDING.md` |
| #21 | **Scope reconciled to 52**, `public-scope-validation.md` |
| #23 | A1 · A2 · A3 · A6 + C1 · B3 · B4 — commerce ownership |
| #24 | CLAUDE.md corpus/library numbers corrected |
| #25 | A4 · A8 · A9 — obligation, grace and access chains |

## The scope question, settled

RET-24 Churn Risk Escalation was the 52nd journey. It was removed by an
explicit decision (its channel rule conflict), then **restored** when its own
`contact.competition` block turned out to already rank it above generic
retention intervention with `onLoss: suppressed` — the hazard that argued for
removing it was already solved in its authored data.

It stays public with **one recorded exception** to the channel rule, named and
reasoned in `scripts/validate-public-scope.mjs`, printed on every run. Full
account: `audit/public-scope-validation.md`.

**Rule that came out of it:** any claim that two journeys collide must quote
the `contact.competition` block of BOTH before proposing that either be
removed, suppressed or given a message.

## Gates — all green at the last full run

| gate | result |
|---|---|
| `scripts/validate-public-scope.mjs` | PASS — 15 checks, 0 failures, 3 warnings |
| `audit/canvas-hygiene.mjs` | PASS — 1457 cards, 0 findings |
| `audit/guard-display.mjs` | PASS — canonical drift none, G1/G2/G3/G5/G6 0 |
| `npm run validate:canonical` | PASS — 0 errors |
| `npm run validate:journey-production` | PASS — 30/30, baseline 292/3802 |
| `npm run validate:seo` | PASS |
| `tsc` / `build` / `eslint` | clean |
| route parity | 58 × 200 EN+TR · 21 × 404 EN+TR |

## After every step — the required loop

**Order matters.** `build-manifest.mjs` rewrites `canonical-baseline.json`, which
is the very thing `guard-display.mjs`'s G4 check compares against. Run the
manifest first and G4 compares the new corpus to a baseline generated from the
new corpus — it reports "no drift" no matter what changed, which is exactly what
happened on the A1 step and had to be caught by hand.

Run in the right order it works: on the A4/A8/A9 step G4 named exactly the eight
journeys the decisions targeted (ACC-261, FIN-134, SUB-163, TIM-61, TIM-63,
TIM-268, TIM-274, TIM-281) and nothing else, matching an independent diff of the
dump, *before* the new baseline was adopted.

```
npm run dump:canonical
node scripts/surface-assignment.mjs
npm run validate:canonical
npm run build && npx next start -p 4511

#  G4 FIRST, against the COMMITTED baseline, so intended drift is listed by id
node audit/guard-display.mjs 4511
#  ... confirm the journeys it names are the ones this step was supposed to
#  change, and nothing else. THEN adopt the new baseline:
node audit/build-manifest.mjs
node search/build-search-index.mjs

node scripts/validate-public-scope.mjs
node audit/canvas-hygiene.mjs 4511
node audit/measure-display.mjs after 4511      # locale leaks must stay 0
npm run validate:journey-production            # frozen node-count baseline
```

Cross-check the intended drift independently, which does not depend on run
order:

```bash
node -e 'const {execSync}=require("child_process");
const old=JSON.parse(execSync("git show HEAD:audit/canonical-baseline.json").toString());
const now=require("./audit/canonical-baseline.json");
console.log(Object.keys(old).filter(id=>now[id]&&old[id].hash!==now[id].hash).join(", ")||"none");'
```

Generated files are git-tracked; a stale one shows as a diff.

## The guard's unreachability exception, and what re-closed the hole

G1 used to demand that every canonical ending be drawn. That is wrong once a
gate legitimately collapses: the gate takes its "record why nothing was sent"
hop with it, and an exit reached ONLY through that hop has nothing left
pointing at it. RET-290 and FUL-291 are exactly this; ACQ-11 keeps its
`x.no-action` because `c.eligible` also points there. So G1/G2 now ask "is it
drawn IF a drawn node still leads to it".

That relaxation re-opens the hole the guard was written for: a wrongly
collapsed *business decision* hides, its exits become unreachable, and no
drawn parent is left to flag it. Two checks close it:

- **G5** — a journey must draw at least one ending (catches total loss).
- **G6** — a condition may only be missing from the canvas if it matches the
  one sanctioned gate shape: exactly two branches, exactly one of them an
  unexecuted hop into a `no-action` exit. Anything else is a decision the
  reader lost.

G6 is not vacuous: 25 conditions in the 58 public journeys are hidden, and all
25 match that shape. Forcing `sanctioned = false` reports all 25, which is how
that was proven.

## Traps that have already cost time

1. **`validate:canonical`'s channel rule is bidirectional.** Adding or removing
   a communication action without moving `channels` in the same edit fails the
   build.
2. **Card heights must be measured with the slot released to `height: auto`.**
   The canvas is CSS-transformed, so `getBoundingClientRect` returns the
   *zoomed* value and reports every card as overflowing.
3. **`journey-marketing.ts` throws at module load** if any of ACQ-01, ACQ-09,
   ACT-12, CON-38, TIM-65 is removed. Two are in the 52.
4. **TR overrides are keyed by node id** — adding a canonical node ships its
   English sentence to the TR route verbatim, under a correct Turkish kind
   label. The locale check only looked for English CHROME words, so it could
   not see this and reported 0 while two cards were English; it now also flags
   English function words (`the`, `and`, `that`, `still`, …), two or more in
   one card. Every new canonical node needs a `journey-tr-overrides.ts` entry
   in the same commit.
5. **Squash-merged branches orphan their history** — branch from a freshly
   reset `main`, or the next PR diffs against a stale merge-base.

## Open, not blocking

- `SIZE.exit` is 68; the worst Turkish exit wants 103 in a 200px slot. D1 is
  the approved fix (start ~240, validate visually).

- `npm run lint` has 1 pre-existing error in `src/components/ui/MobileNav.tsx:78`,
  unrelated, not build-failing.
