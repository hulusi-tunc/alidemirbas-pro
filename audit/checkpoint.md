# Current Checkpoint

Scope: **69 public / 21 excluded / 90 source** — all four batches of the 17
additions are in. Canonical corpus 303 journeys / 3959 nodes.
B, C and D were authored in PARALLEL against the same base and reconciled here.
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
| 9 | Phase 25–33 — 17 new journeys | **DONE**. A: ACQ-289, RET-290, FUL-291, RET-292, RET-293, RET-294 · B: RET-295, SUB-296, SUB-297, SUB-298, SUB-299 · C: CON-300, FUL-301, FIN-302 · D: SCH-303, SCH-304, REM-305. Per-batch notes in `audit/batch-{b,c,d}-notes.md` |

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

## The sunset suppression P0, fixed

The collision review over the seventeen additions found that
`CON-300.a.suppress` wrote `marketing_suppression` and **nothing in 303
journeys read it**, so a person the business had decided to stop marketing to
kept receiving the birthday, the tier announcement, the membership welcome, the
anniversary and the recommendation. CON-300 also described its own scope two
contradictory ways. The broad reading was taken; GLB-31 now names the
sender-side suppression as a hard gate, `CMS-203.a.evaluate` performs it at
send-path step 6, and all 29 promotional/lifecycle journeys carry an `s.sunset`
suppression naming it. No node added — 303/3959 unchanged.

Account, read-side list and before/after evidence:
`audit/sunset-suppression-fix.md`.
Re-runnable proof: `node scripts/sunset-suppression-evidence.mjs` (exits 1 if a
promotional/lifecycle journey stops reading it, or if a transactional one
starts).

**Rule that came out of it:** a cross-journey state is only enforced where the
journeys it binds READ it. A `suppresses` array on a handoff is what the writer
believes; it binds nobody. State the gate at the send path AND from each bound
journey's own side.

## Gates — all green at the last full run

| gate | result |
|---|---|
| `scripts/validate-public-scope.mjs` | PASS — 15 checks, 0 failures, 3 warnings |
| `audit/canvas-hygiene.mjs` | PASS — 0 findings |
| `audit/guard-display.mjs` | PASS — canonical drift none, G1/G2/G3/G5/G6 0 |
| `audit/locale-sweep.mjs` | PASS — 0 leaks over every public TR route |
| `audit/preset-locale.mjs` | PASS — 8/8 presets translated, TR and EN routes both asserted |
| `npm run validate:canonical` | PASS — 303/3959, 0 errors |
| `npm run validate:journey-production` | PASS — baseline 303/3959 |
| `audit/measure-display.mjs` | PASS — 0 locale leaks, 0 render errors |
| `npm run validate:seo` | PASS |
| `tsc` / `build` | clean |
| route parity | 69 × 200 EN+TR · 21 × 404 EN+TR |

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

#  the production/ model is regenerated from the new dump BEFORE the search index
#  and before check 29 — otherwise journey-manifest.json is a corpus behind and
#  build-search-index.mjs files the new journeys as archived
cd production && python3 analyze.py && python3 build_journey_model.py \
  && python3 build_view_model.py && python3 build_manifest_projection.py \
  && python3 build_content_stats.py && python3 build_fixtures.py \
  && python3 build_layout_risks.py && cd ..

#  G4 FIRST, against the COMMITTED baseline, so intended drift is listed by id
node audit/guard-display.mjs 4511
#  ... confirm the journeys it names are the ones this step was supposed to
#  change, and nothing else. THEN adopt the new baseline:
node audit/build-manifest.mjs
node search/build-search-index.mjs

node scripts/validate-public-scope.mjs
node scripts/sunset-suppression-evidence.mjs      # writer-with-no-readers guard
node audit/canvas-hygiene.mjs 4511
node audit/measure-display.mjs after 4511      # locale leaks must stay 0
npm run validate:journey-production            # frozen node-count baseline
node seo/seo-validator.mjs                     # check 18 hardcodes the journey count
node audit/locale-sweep.mjs 4511               # whole-page TR leak sweep (172 routes)
node audit/preset-locale.mjs 4511              # preset names + applicableWhen, TR vs source data
```

`audit/preset-locale.mjs` is in this list because the sweep above cannot cover
it: a preset chip is two words and never reaches the sweep's
two-distinct-function-word threshold, and a preset's `applicableWhen` sentence
is a `discovery` field, which the sweep reports as the known Info-tab gap
rather than failing on. It checks the two strings against the corpus instead of
against a word list — so a preset added to `src/canonical/` without a
`PRESET_TR` entry in `src/lib/journey-tr-overrides.ts` fails here by id, and so
does a call site that renders `PRESET_ROWS` without `localizedPreset`. Run it
with the port; data-only (no port) still catches a missing translation.

`seo/seo-validator.mjs` check 18 is in this list for a reason. It hardcodes
`journeyViewModel.length` on purpose — a tripwire that fails until the constant
moves with the corpus. Batch A changed the corpus without bumping it, and
because CLAUDE.md lists only check 14 as known-failing for that validator, the
failure read as inherited drift for a whole batch before Batch B caught it.
Bump the constant in the same commit as the corpus change.

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

G6 is not vacuous: 25 conditions in the 58 public journeys were hidden when the
check was written, and all 25 matched that shape. Neither Batch B nor Batch D
added a hidden condition. Forcing `sanctioned = false` reports all 25, which is how
that was proven.

## The stale-server trap, now guarded

Every render gate calls `assertServerBuild(PORT)` (`audit/assert-build.mjs`)
before it measures anything, and dies if the server is not serving
`.next/BUILD_ID`. It exists because this failed twice, both times producing
findings that read as real authoring bugs:

- Batch B's first post-manifest guard run reported `G5_NO_VISIBLE_ENDING` and
  `G6_DECISION_HIDDEN` on five brand-new journeys. A server left over from an
  earlier build was serving cached 404s for slugs that did not exist when it
  started.
- Reconciling Batch B against the locale fix, `next start -p 4511` **failed to
  bind** because another worktree's server already held the port. It exits,
  the port still answers 200, every page renders — from the old build. That
  produced a TR `distinctFrom` locale leak that did not exist, and it was
  chased into the data before the server was suspected.

The second is the nastier one and is easy to hit with worktrees in play:
`ps -eo pid,args | grep next-server` before trusting a render gate, or just
let the assertion do it.

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
