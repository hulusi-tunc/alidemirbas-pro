# Journey Canvas — Technical Validation Report

**Scope:** Extended autonomous validation run across the full 255-journey canonical library, via a test-only route (`/qa-canvas-sweep/[id]`) that bypasses the production `CANVAS_JOURNEY_IDS` gate. Production gating is unchanged — 39 journeys remain canvas-enabled in production; the other 216 still render via `CanonicalFlow`. Nothing in this report has been committed, pushed, merged, or deployed.

**Companion document:** `EXECUTIVE-VALIDATION-SUMMARY.md` (short, decision-oriented). This document is the detailed technical record behind it.

---

## Phase A — Full 255-journey shadow QA run

Ran the full 18-check structural QA gate (canonical integrity, node/edge identity and counts, branch-label fidelity, terminal reachability, node-overlap, edge/node collision, label/label and label/node collision, canvas bounds, pan/zoom reachability, text-clipping, initial-viewport metrics, fit-to-view, drawer-camera stability, console-cleanliness, mobile reachability) against all 255 journeys, three times over the course of this run as fixes landed:

| Sweep | Journeys | Failures | Notes |
|---|---|---|---|
| v1 (initial) | 255 | 1 | RLT-250: label/node collision on a 1-row backward edge |
| v2 (interrupted) | partial | — | Server was killed mid-run while testing an unrelated fix; superseded by v3 |
| v3 | 255 | 0 | Confirms the RLT-250 fix; no new regressions |
| v4 (final, +1 check) | 255 | 0 | Adds `entryVisibleOnLoad` (19th check); confirms the RSK-194 fix; no new regressions |

**Two renderer defects found and fixed, both general (no per-journey special-casing):**

### Defect 1 — RLT-250: backward-edge label collision

RLT-250 has a 1-row cycle (`c.regression → w.observe`). The layout engine's edge-label "jog" (the vertical offset that clears a label from its source row) used a direction-*unaware* formula for non-detour edges: `Math.min(rowBottom + OFFSET, rowBottom + (y2 - rowBottom) / 2)`. For any backward edge this collapses to the midpoint branch, since `y2 - rowBottom` is negative — placing the label back on top of the source row instead of clear of it. A previous round had already fixed the same directional flaw for detour-triggering back-edges (|row distance| ≥ 2) but left the plain-elbow path for 1-row back-edges unfixed.

**Fix:** unified both paths under one direction-aware rule: `jogY = rowTo <= rowFrom ? rowTop.get(rowFrom) - OFFSET : rowBottom + OFFSET`. Verified via exact pixel geometry, `tsc`/`eslint` clean, full rebuild, 39-fixture regression (all pass), then a fresh 255-sweep (0 failures).

### Defect 2 — RSK-194: entry node scrolled off-screen on load

`JourneyCanvas`'s initial-scroll logic centers the viewport on the graph's full horizontal bounding box (`scrollLeft = (layout.width * zoom - clientWidth) / 2`), with an explicit code comment stating the intent: *"so the trigger's own entry pin is never scrolled past."* For 254/255 journeys the entry node sits close enough to the bounding box's own horizontal midpoint that this holds. RSK-194's topology is lopsided enough (heavy fan-out added mostly to one side of an otherwise-linear entry column) that centering on the full box scrolled the entry trigger card **completely out of the initial viewport** — a real blank-canvas-on-load defect, confirmed via direct measurement (entry rect at x≈1571–1743, visible viewport at x≈37–1403, zero overlap) and reproduced independently with a purpose-built diagnostic before being folded into the QA harness.

An automated check across all 255 journeys (before the fix) found this was genuinely rare: **1/255 journeys affected**, with 0 partially-clipped borderline cases.

**Fix:** `centerInitial()` still centers on the full bounding box by default (unchanged behavior for 254/255 journeys), but now clamps the result so the entry node's own screen position stays within the viewport with a small margin, mirroring the clamp mobile already had (`Math.max(0, entry.x * z - clientWidth * 0.32)`). Verified the same way as Defect 1, plus a new **`entryVisibleOnLoad`** check added permanently to both `qa-gate.mjs` (39-fixture regression) and `full-sweep-255.mjs` (255-journey sweep) so this class of defect is now a permanent regression contract, not a one-off fix.

### Two smaller defects found via static code audit and fixed generally

- **Duplicate React keys for edges sharing `(from, to)`** — a real pattern (7/255 journeys have a condition node with two branches to the same target, e.g. ACQ-10's `NO_PRIORITY`/`PROCUREMENT_BLOCK`/`PRICE`/`COMPETITOR` all routing to `c.reentry`). React's dev-only duplicate-key warning doesn't fire in production, so this was invisible to console-error checks. Fixed by adding a branch-index discriminator to the edge's React `key`/`id`.
- **`NodeDetailPanel` had no Escape-to-close or focus management** — unlike `JourneyModal.tsx`'s established convention. Fixed by replicating the same pattern (capture pre-open `activeElement`, autofocus the close button, listen for Escape, restore focus on close/switch) *without* a focus trap or `aria-modal`, since this panel is deliberately non-modal (canvas stays interactive behind it).

---

## Phase B — Regression discipline

The 39-journey fixture (the four original stress-test journeys plus the 10- and 25-journey coverage batches from prior rounds) was re-run after every renderer change made during this run — 4 times total. All 39 passed on every run, including the final run with the new `entryVisibleOnLoad` check added. No journey in the fixture ever regressed.

---

## Phase C — Responsive automated run (1440 / 1024 / 768 / 375)

The main 255-journey sweep already covers 1440 (desktop) and 375 (mobile) — the renderer's two genuinely distinct code paths (`isMobile()` branches at a 640px breakpoint). 1024 and 768 both exceed that breakpoint and take the same desktop path as 1440, but `initialZoom()`'s fit-to-contain computation and the new entry-visibility clamp both depend on `clientWidth`, so rendered pixel geometry can still differ at a narrower viewport — worth testing directly rather than assuming invariance.

A dedicated pass tested `pageOverflow`, `nodeOverlap`, `labelCollision`, `canvasBounds`, `entryVisibleOnLoad`, and `consoleErrors` at both 1024 and 768 across all 255 journeys (510 page loads total).

**Result: 510/510 rows clean (255 journeys × 2 viewports), 0 failing checks, 0 errors** at both 1024 and 768 — confirming the two Phase A fixes (and every other structural property) hold at every tested width, not just 1440/375.

---

## Phase D — Machine-readable rendered-metrics dataset

`production/journey-canvas-validation/rendered-metrics-255.json` — one row per journey (255 rows), with every field specified: `journeyId, category, nodeCount, edgeCount, depth, conditionCount, waitCount, handoffCount, mergeCount, cycleCount, terminalCount, maxFanOut, graphWidth, graphHeight, initialZoom, theoreticalFitZoom, widthOccupancy, heightOccupancy, requiresHorizontalPan, requiresVerticalPan, detourEdgeCount, backEdgeCount, maxDetourDistance, longestRenderedNodeHeight, longestRenderedLabelWidth, canonicalIntegrity, nodeOverlap, edgeNodeCollision, labelNodeCollision, labelLabelCollision, boundsValid, textReadable, mobileReachable, drawerCameraStable, consoleClean`. Generated from the final (v4) sweep data — 0 rows with an error, 0 rows with any QA failure.

---

## Phase E — Zoom policy analysis (analysis only — no policy change made)

| Metric | p10 | p25 | median | p75 | p90 | p95 | max |
|---|---|---|---|---|---|---|---|
| Initial zoom | 0.70 | 0.70 | 0.70 | 0.70 | 0.70 | 0.70 | 0.755 |
| Theoretical fit-to-contain zoom | 0.269 | 0.309 | 0.368 | 0.422 | 0.508 | 0.531 | 0.755 |
| Width occupancy | 44% | 53% | 65% | 78% | 98% | 110% | 367% |
| Height occupancy | 137% | 165% | 190% | 227% | 260% | 277% | 398% |

- **99.6% of journeys (254/255) render at the 0.7 zoom floor** — i.e. their theoretical fit-to-contain zoom is below 0.7, so the floor is the binding constraint almost everywhere, not the exception.
- **99.6% require vertical pan** at initial zoom (expected — the grammar is a top-to-bottom flowchart; vertical scroll is the intended primary navigation).
- **8.6% require horizontal pan** at initial zoom (up to 21.7% in the "very-large" node-count band). This is a real, size-correlated cost, not noise.

**By size band** (quartile-derived: small ≤10 nodes, medium 11–12, large 13–15, very-large 16+):

| Band | n | Median fit-zoom | % at floor | % requiring H-pan |
|---|---|---|---|---|
| small | 73 | 0.479 | 98.6% | 1.4% |
| medium | 62 | 0.379 | 100% | 9.7% |
| large | 74 | 0.330 | 100% | 6.8% |
| very-large | 46 | 0.284 | 100% | 21.7% |

The 0.7 floor was tuned (per its own code comment) against ACQ-01's width specifically. Across the full 255, it is not a close call — the fit-zoom distribution sits well below 0.7 for the overwhelming majority of the library, and the gap widens monotonically with size. This is squarely a **UX policy question** (does the floor trade off legibility for coverage in the way the team wants, especially for the largest ~18% of journeys), not a correctness defect — every journey in the dataset passes its structural QA checks regardless of occupancy percentage. No zoom/pan policy change was made.

---

## Phase F — Detour and back-edge routing analysis (analysis only — no redesign made)

- **62.7% of journeys (160/255)** have at least one detour-routed edge (a non-adjacent-row edge routed through a side corridor rather than a plain elbow).
- Detour count: median 1, p90 3, max 5 (ACC-80, TRM-110, FUL-142, DOC-216 each have 5).
- Back-edges (cycles): median 0, p95 1, max 2 (ACT-12, FBK-46, OWN-57, TIM-61, TRM-110, RSK-198, RLT-245 each have 2).
- Widest rendered graph: ACQ-10 at 7160px (a 5-way condition branch on a 10-node journey — width driven entirely by branch fan-out, not node count).

Visual inspection (Phase G/H, below) of the highest-detour and highest-back-edge journeys found the routing itself sound in every case — no new collisions, no visual dominance that obscured the graph's meaning. The one genuine defect this class of topology exposed (RLT-250's backward-edge label jog) is already fixed under Phase A. No detour-routing redesign was made.

---

## Phase G/H — Visual outlier audit and random sample

**17 outliers** selected by extremum across: width/height occupancy, graph width, detour count, back-edge count, max detour distance, node count, depth, fan-out, merge count, wait count, handoff count, cycle count, terminal count, smallest journey, and longest rendered label/node. **10 additional journeys** via a documented deterministic seed (`mulberry32`, seed `20260826`, Fisher-Yates shuffle over the non-outlier pool), for 27 journeys total, each inspected at 1440 and 375.

| Classification | Count | Journeys |
|---|---|---|
| PASS | 24 | All 10 random-sample journeys; 14 of 17 outliers |
| RENDERER DEFECT (fixed under Phase A) | 1 | RSK-194 |
| UX POLICY ISSUE | 2 | ACQ-10, RET-23 |

**ACQ-10** (widest graph, 367% width occupancy) and **RET-23** (8-way branch, 160% width occupancy) are both structurally clean — zero collisions, correct branch routing — but require substantial horizontal panning to see every branch at initial zoom. This is the most visible instance of the Phase E zoom-floor finding, not a new defect: the graph is a faithful, correct rendering of a genuinely wide condition node. No fix was made (per the explicit instruction that only RENDERER DEFECT permits a fix during this run); both are flagged for whoever owns the Phase E policy decision.

No other outlier or random-sample journey showed a POLISH OPPORTUNITY item that rose to a nameable finding beyond the two above.

---

## Phase I — Component robustness audit

- **Journey-ID conditionals:** none, before or after this round's fixes. Grepped explicitly for both fixed defects' journey IDs (`RSK-194`, `RLT-250`, `ACQ-10`, `RET-23`) across the renderer — zero matches. Both fixes are geometry/data-shape-general.
- **Hidden CSS / hardcoded IDs:** none beyond the pre-existing, documented ones (`.altor-dot-grid`, `MOBILE_BREAKPOINT`, `DESKTOP_MIN_ZOOM`) — all load-bearing constants with explanatory comments, not journey-specific hacks.
- **Dead code / stale comments:** two stale comments found and fixed (`JourneyModal.tsx`, `JourneyRoutes.tsx`: "the one canvas-enabled journey" → "a canvas-enabled journey," now that 39 are enabled). No dead code found to remove.
- **Debug logging:** none present.
- **DAG / uniqueness / wait / action-channel assumptions:** cross-checked against the canonical schema directly.
  - The layout's cycle-safe DFS (WHITE/GRAY/BLACK coloring, back-edges excluded from column-averaging) is a real safety net, not defensive-for-no-reason code — 7/255 journeys have genuine cycles.
  - The duplicate-edge-key fix (above) confirms the `(from, to)` non-uniqueness assumption was real, not hypothetical.
  - Wait nodes' `onEvent`/`onTimeout` dual-branch handling matches the schema exactly (both fields optional, both handled).
  - The Action-channel gap (see Phase M) is already correctly handled as a data limitation, not silently worked around.

No broad aesthetic refactor was performed, per instruction — only the two stale comments were touched.

---

## Phase J — Performance

**Batch page-load timing, all 255** (SSR + hydration + `layoutJourneyCanvas` + first paint, via Playwright navigation timing):

| min | median | p95 | max |
|---|---|---|---|
| 643ms | 657ms | 675ms | 698ms |

The distribution is remarkably tight (55ms spread from min to max) and **uncorrelated with node count** — the 5 slowest journeys range from 7 to 15 nodes, not the largest in the library. This strongly suggests the layout computation is not a bottleneck at any size tested; the ~650ms floor is dominated by fixed SSR/hydration cost, not per-journey graph complexity.

**Interaction responsiveness, 5 representative journeys** (small/median/large/largest/most-complex by a composite score):

| Journey | Zoom | Fit-to-view | Drawer open | Drawer close |
|---|---|---|---|---|
| REL-98 (small) | 76ms | 49ms | 63ms | 389ms |
| RSK-191 (median) | 75ms | 50ms | 57ms | 410ms |
| ACC-76 (large) | 73ms | 35ms | 57ms | 394ms |
| SUB-166 (largest) | 69ms | 32ms | 58ms | 394ms |
| DOC-216 (most complex) | 69ms | 50ms | 56ms | 395ms |

Zoom/fit/drawer-open are all comfortably sub-100ms. Drawer-close's consistent ~390–410ms (tight range across all 5, regardless of journey size) is a deliberate spring-physics exit animation (`springSnap` transition in `NodeDetailPanel.tsx`), not a performance defect. No optimization was performed — nothing here indicated a real bottleneck.

---

## Phase K — Accessibility sanity check

- **Keyboard reachability / focus state:** verified via a dedicated script exercising Tab-order into the canvas, zoom controls, and node cards. All checks pass: node cards are keyboard-focusable, Enter opens the drawer, focus moves into the drawer's close button on open, Escape closes it, and focus returns to the triggering node afterward.
- **Escape / focus management on the detail drawer:** fixed this round (see Phase A, Defect 3) — captures the trigger element, autofocuses the close button, restores focus on close or node-switch. Deliberately non-modal (no focus trap / `aria-modal`), matching the canvas's own "stays interactive behind the drawer" design intent — a narrower pattern than `JourneyModal.tsx`'s full modal convention, chosen because this panel isn't one.
- **Two QA-harness bugs found and fixed in `a11y-test.mjs` itself while verifying the above** (both genuine test-script defects, not product regressions — confirmed by direct manual reproduction before touching the script):
  - The Escape-close check used a fixed `waitForTimeout(400)` before asserting the dialog was gone. The drawer's exit is a spring animation (`springSnap`: stiffness 420, damping 32, mass 0.6, effectively critically damped), not a fixed-duration transition, and `AnimatePresence` keeps the dialog mounted until the animation genuinely finishes — which lands right at ~400ms, so the fixed wait was a coin flip. Replaced with `locator.waitFor({ state: "detached" })`, which polls for the actual DOM removal instead of guessing a duration.
  - The focus-visible-class check called `page.evaluate((id) => ..., /* missing second argument */)` — `id` was `undefined` inside the callback, so the selector always resolved to `[data-canvas-node-id="undefined"] button`, matching nothing, and the check always reported `false`. Fixed by passing `firstNodeId` as the second argument. Direct inspection confirmed the real button's `className` has always correctly included `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`.
  - Re-run after both fixes: **all 8 checks pass**, including `escapeClosesDrawer: true` and `hasFocusVisibleClass: true`.
- **Accessible names:** zoom/reset/fit controls and node cards all carry `aria-label`s already; no gaps found.
- **Color contrast (WCAG 2.1 AA):** two real, pre-existing failures found via direct hex-based relative-luminance calculation, cross-referenced against the codebase's own inline contrast comments:
  - `ExitCard`'s kind-label and headline both used `text-ink-400` (#7a8398) → **3.80:1** against white/transparent, below the 4.5:1 AA threshold for normal text.
  - `OutcomeCard`'s kind-label used `text-success` (#399a43) on `bg-paper` → **3.6:1**, also below AA — and `globals.css`'s own comment on that token already reads `/* 3.6:1 on white — never text-on-white */`, meaning this was a known, documented, but unaddressed violation.
  - **Fixed:** `ExitCard` → `text-ink-500` (#566078, 6.29:1, and the codebase's own `--color-ink-muted`/`--color-ink-subtle` semantic alias for exactly this token). `OutcomeCard`'s kind-label → `text-ink-700` (dark neutral, matching the pattern other cards use for real text); its icon stays `text-success` since icons only need the more lenient 3:1 non-text threshold, which 3.6:1 already clears.
  - Verified via `tsc`/`eslint` clean, rebuild, and the 39-fixture regression (all pass) — per Phase K's own instruction, a color-only change doesn't require a full 255-sweep since none of the 19 structural checks read color.
- **Color not the sole mechanism:** confirmed via code reading — every state distinction (branch labels, terminal markers, node kind) also carries text or shape, not color alone.

---

## Phase L — Detail drawer content audit

Exhaustive field-by-field verification of the drawer's rendering against each node kind's canonical schema, plus a 31-sample empirical spot-check across Actions, Conditions, Waits, Handoffs, and Exits/Outcomes (≥5 each). **Zero issues** — no data loss, no invented content, and missing optional fields (e.g., a wait node's absent `onTimeout`) render as an omitted section rather than a placeholder or a crash.

---

## Phase M — Canonical data quality report (no canonical data changed)

| Finding | Classification | Detail |
|---|---|---|
| Action-node text runs long (up to 483 chars for `OWN-54`'s `a.inventory`) | CONTENT QUALITY (by design) | Already anticipated by the renderer: `qa-gate.mjs`'s own comment notes "clampHits expected only for Action's long paragraph (explicit carve-out)." Full text is available in the detail drawer (Phase L). Not a defect. |
| Duplicate-target condition branches (7/255 journeys, e.g. ACQ-10's 4 decline reasons all routing to `c.reentry`) | VALID BUT UNUSUAL TOPOLOGY | Legitimate design: distinct, separately-labeled business reasons that intentionally converge on the same downstream handling. The renderer now keys these correctly (see Phase A, Defect 3). Not a data error. |
| Action-subtype gap — the grammar defines 11 channel accent colors (Email, SMS, Push, etc.); the canonical `ActionNode` schema (`{ does, writes?, next }`) carries no channel field on any of the 255 journeys | DATA MODEL LIMITATION (already documented in-code) | Already fully documented at the top of `JourneyCanvasNodes.tsx` as the "ACTION SUBTYPE GAP" — every Action renders as INTERNAL because nothing in the real data could honestly select any of the other ten accents. Restated here, not re-solved; the existing in-code documentation is the correct place for this. |
| Long branch labels (up to 73 chars, e.g. CMS-203) | VALID BUT UNUSUAL TOPOLOGY | Already handled correctly — `estimatedLabelWidth()`'s zoom-corrected sizing and the post-layout label-separation pass keep 0 collisions across all 255 at every tested viewport. |

No canonical content, field, or schema was modified.

---

## Phase N — Final build quality gate

| Check | Result |
|---|---|
| `tsc --noEmit` | Clean |
| `eslint` (all changed files) | Clean |
| `npm run build` (`rm -rf .next && npm run build`) | Exit 0, all 255×2 (en/tr) journey routes + intercepting-route modal variants prerender without error |
| 39-fixture regression | 39/39 pass (final run, with `entryVisibleOnLoad` included) |
| 255-journey structural QA gate | 255/255 pass, 0 errors (final run, 19 checks) |
| 1024/768 viewport pass | 255/255 clean at both intermediate breakpoints |

The working tree is left uncommitted, per instruction, with a clean and fully passing local build.

---

## Phase P — Recommendation

**C — technically sound, ready for a controlled expansion beyond the current 39** — see `EXECUTIVE-VALIDATION-SUMMARY.md` for the full reasoning. In short: correctness is solid (255/255 structural QA pass at every tested viewport, two genuine defects found and fixed, zero canonical-data changes needed), the one open item is a UX-policy question about the zoom floor for the largest ~18% of journeys (not a defect), and the remaining polish items (contrast, drawer focus) are closed. The zoom-floor question does not block a controlled expansion — it can be decided independently, on any timeline.

## Phase Q — Rollout plan

Written and kept as `ROLLOUT-PLAN-DRAFT.md` — a 6-stage sequence (enable-all-255-locally → full-build-verification → controlled-commit → push/preview-deployment → post-deployment-smoke-test → remove-temporary-gating). Planning only; explicitly not executed, per instruction.

---

## Files changed this session

- `src/lib/journey-canvas-layout.ts` — direction-aware edge-label jog (Defect 1), duplicate-key fix (Defect 3a)
- `src/components/JourneyCanvas.tsx` — entry-visibility clamp on initial scroll (Defect 2)
- `src/components/ui/NodeDetailPanel.tsx` — Escape/focus management (Defect 3b)
- `src/components/ui/JourneyCanvasNodes.tsx` — two WCAG contrast fixes (Phase K)
- `src/components/JourneyModal.tsx`, `src/components/JourneyRoutes.tsx` — two stale-comment fixes (Phase I), no logic change
- `src/app/(en)/qa-canvas-sweep/[id]/page.tsx` — new test-only route (not linked, bypasses production gating)
- `production/journey-canvas-validation/` — this report, the executive summary, the rollout-plan draft, and `rendered-metrics-255.json`

No production gating (`CANVAS_JOURNEY_IDS`), canonical content, or canonical schema was touched.
