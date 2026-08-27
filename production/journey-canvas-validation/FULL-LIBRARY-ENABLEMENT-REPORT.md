# Journey Canvas — Full-Library Enablement Report

**Scope of this round:** moving from shadow validation (proving Journey Canvas *could* render all 255 journeys, via a test-only bypass route) to controlled full-library enablement (making it the *actual* renderer for all 255, through the real application, with the old renderer's now-dead code removed). Per instruction: **nothing has been committed, pushed, merged, or deployed.** Everything below lives in the local working tree.

**Companion documents:** `EXECUTIVE-VALIDATION-SUMMARY.md` and `TECHNICAL-VALIDATION-REPORT.md` (the prior shadow-validation round); `qa/journey-canvas/README.md` (the permanent QA harness this round formalized).

---

## 1. What changed to enable 255

- **`src/components/JourneyDetailBody.tsx`**: the `CANVAS_JOURNEY_IDS` set — previously read at render time to decide canvas-vs-legacy per journey — is renamed `JOURNEY_CANVAS_REGRESSION_FIXTURE` and is no longer consulted by any rendering logic. `useCanvas` is gone; the component now unconditionally renders `JourneyCanvas` for every journey. The 39-id set itself is unchanged in membership, kept as the QA harness's regression fixture (see §3).
- **`src/components/JourneyRoutes.tsx`**: both `wide` flags (full-page and modal) are now unconditional `true` instead of a per-journey `CANVAS_JOURNEY_IDS.has(...)` check, since every journey now needs the canvas's wide layout.
- Everything downstream of these two files — the real `/lab/journeys/[slug]` route, its intercepted-modal counterpart, and the TR locale mirrors of both — now renders Journey Canvas for all 255 canonical journeys with no per-journey branching left anywhere in the call path.

## 2. What legacy code was removed

Classified before removal, per instruction, rather than deleted on sight:

| Item | Classification | Why |
|---|---|---|
| `src/components/CanonicalFlow.tsx` (212 lines) | **A — definitely obsolete** | Its only call site was the now-unconditional-canvas branch in `JourneyDetailBody.tsx`. Confirmed via full-repo grep: no other import, no test file, nothing else referenced it — the one mention outside code was a design-migration planning doc's prose, not a dependency. Deleted; recoverable from git history (`0f53094`) if ever needed. |
| `flowLabel`/`more`/`less` copy keys (en + tr, `src/lib/content.ts`) | **A — definitely obsolete** | Confirmed via grep: consumed only by `CanonicalFlow`'s own props, nowhere else. Removed alongside it. `nodesLabel` (a similarly-named key) was checked and confirmed still live elsewhere (the library list's node-count badge) — not touched. |

## 3. What was deliberately retained, and why

| Item | Classification | Why kept |
|---|---|---|
| `JOURNEY_CANVAS_REGRESSION_FIXTURE` (the 39 ids) | Kept, repurposed | Explicit instruction: preserve as the permanent regression fixture. Now purely a QA-harness reference (`qa/journey-canvas/qa-gate.mjs` targets exactly these 39) — verified via grep that nothing in the render path reads it anymore. |
| `JourneyModal.tsx`'s `wide` prop (and its narrow `max-w-2xl` branch) | **B — still used, by design** | Every current call site passes `true`, but this is the modal's general width parameter, not something canvas-specific — collapsing it now would mean re-adding it the next time this modal wraps something that isn't a graph. Comment updated to state plainly that both call sites always pass `true` today. |
| `/qa-canvas-sweep/[id]` test-only route | Kept, hardened | All 255 journeys ARE now reachable through the real route (confirmed, §4) — the instruction's first branch would say remove it. Kept instead under the second branch ("if the QA harness still genuinely requires it") because `full-sweep-255.mjs` uses it deliberately, to isolate renderer correctness from the surrounding application (no slug resolution, no metadata, no locale — just the same `FlowNode[]` data straight into the same component). Hardened: now gated behind an explicit `ENABLE_QA_CANVAS_SWEEP=1` opt-in env var rather than being reachable by default — chose this over gating on `NODE_ENV=production` because `next start` for local QA testing already sets that, which would have broken the very workflow the route exists for. Not linked from anywhere in the site. |

## 4. 255 real-route smoke result

Built `qa/journey-canvas/real-route-smoke-255.mjs`: for every one of the 255 canonical journeys, hits the REAL `/lab/journeys/[slug]` route directly (no test-only bypass) and checks HTTP 200, correct journey id, Journey Canvas mounted, trigger node present, correct node count, no legacy-renderer markup, no page overflow, no console/React errors.

**Final result (on the final build, after all fixes below): 255/255 pass, 0 failures.**

Two rounds of this script had test-script bugs that produced false failures before reaching that number — both diagnosed and fixed rather than assumed to be product defects (see §8 for the full account): a `"main, body"` selector list resolving to `body` (whose embedded JSON-LD structured-data script mentions unrelated journeys' ids) instead of `main`, and `\b` word-boundary regex matching failing where the back-link text butts directly against the id with no separating whitespace in `textContent`. Fixed by targeting the exact header element directly instead of scanning free text.

## 5. Handoff-link integrity result

Built `qa/journey-canvas/link-integrity.mjs`: pure data check (no browser) confirming every handoff node's `to` field across all 255 journeys resolves to either a real canonical journey id or a declared `external:` system reference.

**Result: 500/500 handoff references resolved — 423 cross-journey, 77 external, 0 broken.** No invented destinations; nothing to report as broken.

## 6. Regression result

- **39-journey fixture** (`qa/journey-canvas/qa-gate.mjs`, real route): 39/39 pass, run three times across this session as changes landed (after gate removal, after the Escape-layering fix, and on the final build).
- **Full 255-journey structural sweep** (`qa/journey-canvas/full-sweep-255.mjs`, 19-check gate via the shadow route, for renderer-isolated confirmation): 255/255 pass, 0 errors — re-run after the Escape-layering fix to confirm it didn't regress anything in the 18 pre-existing checks plus `entryVisibleOnLoad`.
- **Accessibility** (`qa/journey-canvas/a11y-test.mjs`, real route): 8/8 checks pass on the final build.
- **Drawer content audit** (`qa/journey-canvas/drawer-audit.mjs`, real route, 31 samples): 0 issues.
- **Responsive integration smoke** (`qa/journey-canvas/responsive-integration-smoke.mjs`, real route, 6 representative journeys × 4 viewports = 24 combinations): 24/24 pass — header, journey metadata, canvas, controls, content below canvas, page scroll, and canvas pan all checked together, not just the canvas's own internals.
- **Real-app interaction test** (`qa/journey-canvas/real-app-interaction.mjs`, 11 checks: library search → intercepted modal, node click → drawer, Escape behavior, browser back/forward, direct-URL full page, refresh, switching between journeys, TR locale, mobile library→detail, mouse-driven drawer close, zoom/fit/reset controls): **11/11 pass on the final build** (10/11 before the Escape-layering fix — see §8).

## 7. Build result

| Check | Result |
|---|---|
| `tsc --noEmit` | Clean |
| `eslint` (full `src/` + `qa/`) | Clean — 0 errors, 0 warnings |
| `npm run build` (`rm -rf .next && npm run build`) | Exit 0, all 255×2 (en/tr) journey routes + intercepting-route modal variants prerender without error |

Rebuilt and re-verified three times this round (after gate removal, after `CanonicalFlow` removal, after the Escape-layering fix) — every rebuild was clean before moving on to the next change.

## 8. Integration defects discovered (and fixed)

One genuine, general defect surfaced by real-application interaction testing that the prior shadow-validation round couldn't have caught (it never exercised a modal-wrapped canvas):

**Escape closed both the node drawer and the enclosing modal in one keystroke**, instead of peeling one layer at a time. Root cause: `JourneyModal.tsx`'s Escape handler lives on `document` in the ordinary bubble phase; `NodeDetailPanel.tsx`'s lived on `window`, also bubble phase. Bubble order reaches `document` before `window`, and `JourneyModal`'s handler called `preventDefault()` but not `stopPropagation()` — so both handlers fired on the same keypress. Fixed generally (not journey-specific): `NodeDetailPanel`'s listener now runs in the **capture** phase (which fires before bubble-phase `document` listeners) and calls `stopPropagation()` once it handles Escape, so the modal's own Escape listener never sees a keystroke the drawer already consumed. Verified directly: `escapeClosesDrawerOnly` now correctly shows the drawer gone and the modal still present; a second Escape then closes the modal on its own. Full regression re-run afterward (39-fixture, 255-sweep, a11y, drawer-audit, interaction test) — all clean.

Two QA-harness bugs (not product defects) were found and fixed while building the new scripts above — both diagnosed by direct manual reproduction before touching the script, per the same discipline as the prior round:
- `real-route-smoke-255.mjs`'s id-matching check initially used a `"main, body"` selector and a `\b`-boundary regex scan, both of which had real failure modes explained in §4. Fixed by targeting the header element directly.
- `responsive-integration-smoke.mjs` initially gated on `footerPresent`, which is false on every Lab-section page (Canvas or not) since `LabShell` never renders a `<footer>` — only the separate marketing shell does. Fixed by making it informational rather than gating.

## 9. Canonical-data issues discovered

None found this round. The handoff-link integrity check (§5) is the relevant one for this phase, and it came back clean — 0 broken references, nothing invented, nothing to report. (The three canonical-data observations from the prior shadow-validation round — long Action text, duplicate-target branches, the Action-channel gap — remain as described there; none are new, and none required action then or now.)

## 10. Remaining known limitations

- The zoom-floor UX-policy question from the prior round (99.6% of journeys hit the 0.7 floor; the largest ~18% need real horizontal panning) is unchanged and was explicitly out of scope for this round too (Phase 13's do-not-touch list). Still a real, open product decision — not a defect.
- `/qa-canvas-sweep/[id]` still exists as test-only infrastructure (§3). It is not reachable without an explicit env var and is not linked from anywhere, but it is still present in the codebase; removing it entirely is a call for whoever eventually decides this QA tooling doesn't need the renderer-isolation it provides.
- No CI wiring exists for any of the `qa/journey-canvas/` scripts yet — they are correct, kept in the repo, and documented, but running them today means running them by hand.

## 11. Exact list of changed files

```
 M  src/app/globals.css                        (prior round: 2 WCAG contrast fixes)
 D  src/components/CanonicalFlow.tsx            (removed this round - dead code)
 M  src/components/JourneyDetailBody.tsx        (this round: gate removed, dead branch removed)
 M  src/components/JourneyModal.tsx             (this round: comment updated)
 M  src/components/JourneyRoutes.tsx            (this round: gate removed)
 M  src/lib/content.ts                          (this round: 2 orphaned copy keys removed, en+tr)
 ?? production/journey-canvas-validation/       (both rounds: reports + dataset)
 ?? qa/                                          (this round: permanent QA harness, new)
 ?? src/app/(en)/qa-canvas-sweep/[id]/page.tsx  (prior round: test-only route; this round: hardened)
 ?? src/components/JourneyCanvas.tsx            (prior round: new, + this round's Escape-layering fix)
 ?? src/components/ui/JourneyCanvasNodes.tsx    (prior round: new, + WCAG contrast fixes)
 ?? src/components/ui/NodeDetailPanel.tsx       (prior round: new, + this round's Escape-layering fix)
 ?? src/lib/journey-canvas-layout.ts            (prior round: new; this round: 1 comment updated)
```

## 12. Git diff summary (tracked files only)

```
 src/app/globals.css                  |   8 ++
 src/components/CanonicalFlow.tsx     | 212 ------------------------------
 src/components/JourneyDetailBody.tsx | 242 +++++++++++++++++++++++++----------
 src/components/JourneyModal.tsx      |  15 ++-
 src/components/JourneyRoutes.tsx     |  11 +-
 src/lib/content.ts                   |  20 ++-
 6 files changed, 218 insertions(+), 290 deletions(-)
```

(New, untracked files — `src/components/JourneyCanvas.tsx`, `src/components/ui/JourneyCanvasNodes.tsx`, `src/components/ui/NodeDetailPanel.tsx`, `src/lib/journey-canvas-layout.ts`, the `qa/` directory, `src/app/(en)/qa-canvas-sweep/`, and `production/journey-canvas-validation/` — aren't part of a tracked diff since nothing has been committed yet; their contents are described in §1-§6 above.)

---

## Bottom line

**255 canonical journeys → Journey Library → one journey-detail experience → one Journey Canvas renderer**, confirmed through the real application (not just direct URLs): library search, intercepted modal, node drawer, Escape/back/forward/refresh, another journey, TR locale, and mobile, all exercised and passing. **39 curated journeys → permanent regression fixture**, wired into a real, documented, repo-resident QA harness (`qa/journey-canvas/`) instead of scratch scripts. **Zero journey-specific hacks, zero legacy fallbacks, zero canonical modifications** — confirmed by the same static-audit discipline as the prior round, re-run against this round's own changes.

One genuine, general defect was found and fixed (Escape-layering across the drawer/modal stack) — found specifically because this round tested through the real application rather than only through synthetic URLs, which is exactly what this phase was for. Working tree left uncommitted, exactly as instructed.
