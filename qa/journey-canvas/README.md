# Journey Canvas QA harness

Permanent validation tooling for the Journey Canvas renderer, kept in the
repo (rather than an ephemeral scratch directory) so it survives past any
one session. All scripts are plain Node ESM scripts using Playwright
against a locally running build - `npm run build && npx next start -p 4022`
first, then `node qa/journey-canvas/<script>.mjs`. None of these run in CI
yet; that's a separate decision for whoever owns this next.

**`full-sweep-255.mjs` needs one more thing**: it targets the test-only
`/qa-canvas-sweep/[id]` route (see that route's own comment for why it still
exists), which 404s unless `ENABLE_QA_CANVAS_SWEEP=1` is set when starting
the server - `ENABLE_QA_CANVAS_SWEEP=1 npx next start -p 4022`. Every other
script here hits the real `/lab/journeys/[slug]` route and needs no such
flag.

## What's here, and why each one earned a permanent spot

- **`qa-gate.mjs`** - the 39-journey regression fixture (see
  `JOURNEY_CANVAS_REGRESSION_FIXTURE` in `src/components/JourneyDetailBody.tsx`
  for which 39 and why). Runs the full 19-check structural gate (canonical
  integrity, node/edge identity, branch-label fidelity, terminal
  reachability, node-overlap, edge/node collision, label collision, canvas
  bounds, entry-visible-on-load, pan/zoom reachability, text-clipping,
  initial-viewport metrics, fit-to-view, drawer-camera-preservation,
  console-cleanliness, mobile reachability) against the real
  `/lab/journeys/[slug]` route. Run this after every renderer change - it's
  the fast, high-signal check; days-old visual regressions here still get
  caught before a full sweep.

- **`full-sweep-255.mjs`** - the same 19-check gate, run against all 255
  journeys instead of the 39-journey fixture. Slower (~15-20 min); run it
  before shipping a renderer change, not on every edit. Uses the same
  `/qa-canvas-sweep/[id]` test-only route the shadow-validation phase built
  - kept because it isolates renderer correctness from the surrounding
  application (routing, metadata, locale) that `real-route-smoke-255.mjs`
  covers instead. If that route is ever removed (see the phase's own
  decision on it), this script needs pointing at `/lab/journeys/[slug]` by
  slug instead - trivial, but not done automatically.

- **`real-route-smoke-255.mjs`** - integration validation, not renderer
  validation: for all 255 journeys, hits the REAL `/lab/journeys/[slug]`
  route (no test-only bypass) and confirms HTTP 200, the right journey id,
  Journey Canvas mounted, the trigger node present, the right node count,
  no legacy-renderer markup, no page overflow, no console/React errors.
  Answers "does the real app wire every journey to Canvas correctly," which
  `full-sweep-255.mjs` alone can't - that script uses the bypass route by
  design.

- **`viewport-sweep.mjs`** - the two intermediate breakpoints
  (`full-sweep-255.mjs` already covers 1440 desktop and 375 mobile) at
  1024 and 768, across all 255 journeys: page overflow, node overlap, label
  collision, canvas bounds, entry-visible-on-load, console errors. Narrower
  than the full 19-check gate on purpose - these two breakpoints share the
  desktop code path with 1440, so only the checks whose geometry can
  plausibly differ at a narrower `clientWidth` are worth re-running here.

- **`a11y-test.mjs`** - keyboard reachability, Enter-to-open, focus-into-
  drawer, Escape-to-close, focus-return, control accessible names,
  focus-visible styling. Uses `locator.waitFor({state: "detached"})` rather
  than a fixed timeout for anything that depends on the drawer's exit
  animation completing - a fixed wait raced that animation and produced a
  false negative once already (see the technical validation report).

- **`drawer-audit.mjs`** - samples the node detail drawer's rendered content
  against the canonical schema across node kinds (Action, Condition, Wait,
  Handoff, Exit/Outcome), checking for missing/invented content and safe
  handling of absent optional fields.

- **`perf-test.mjs`** - batch page-load timing across all 255, plus
  interaction responsiveness (zoom/fit/drawer-open/drawer-close) for 5
  representative journeys (small/median/large/largest/most-complex).

- **`link-integrity.mjs`** - pure data check, no browser: every handoff
  node's `to` field across all 255 journeys must resolve to either a real
  canonical journey id or a declared `external:` system reference. Reports
  broken references separately from renderer problems; never invents a
  missing destination.

- **`build-phase-d-dataset.mjs`** - merges topology metrics with rendered
  metrics from a `full-sweep-255.mjs` run into one row-per-journey dataset
  (see `production/journey-canvas-validation/rendered-metrics-255.json`).

- **`real-app-interaction.mjs`** - drives the REAL user entry points end to
  end for a representative sample: library search -> intercepted modal,
  node click -> drawer, Escape (drawer-only, then modal), browser
  back/forward across a modal open/close cycle, direct-URL full page,
  refresh, switching between two journeys, TR locale, mobile
  library-to-detail, and mouse-driven drawer close + zoom/fit/reset
  controls. This is what caught the one integration defect the shadow-
  validation phase couldn't have: Escape closing both the drawer and the
  enclosing modal in one keystroke (see
  `FULL-LIBRARY-ENABLEMENT-REPORT.md` §8) - a bug that only exists when a
  canvas is actually nested inside `JourneyModal`, which no synthetic-URL
  test ever exercises.

- **`responsive-integration-smoke.mjs`** - real-route (not the bypass
  route) responsive check at all four breakpoints for 6 representative
  journeys, testing the PAGE around the canvas rather than the canvas's
  own internals (`viewport-sweep.mjs` and `full-sweep-255.mjs` already
  cover that): header, journey metadata, canvas, controls, content below
  canvas, page scroll, canvas pan. `footerPresent` is tracked but not
  gated on - `LabShell` never renders a `<footer>` on any Lab page,
  Canvas or not, so gating on it would fail everything.

## Classified and NOT kept here

The exploratory scripts written while diagnosing specific, now-fixed
defects (per-journey pixel inspectors, one-off screenshot scripts, the
selection scripts used to pick the original 39-journey fixture's members)
were single-use diagnostic tools, not standing validation. Their findings
are already captured permanently in this fixture's own code comment and in
`production/journey-canvas-validation/TECHNICAL-VALIDATION-REPORT.md`;
keeping the scripts themselves would just be duplicate, unmaintained
surface area. They were not moved here.

## Report output

All scripts write their JSON report to `/tmp/<name>-report.json` (ephemeral,
by design - these are run artifacts, not source). Re-run a script to get a
fresh report; nothing here depends on a previous run's output except
`build-phase-d-dataset.mjs`, which explicitly reads
`full-sweep-255.mjs`'s report and a topology inventory that isn't checked
in (regenerate both if you need this end-to-end).
