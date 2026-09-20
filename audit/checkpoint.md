# Current Checkpoint

Phase: 1 — 73/73 read-only audit (in progress)
Current batch: n/a (audit, not apply)
Last completed journey: n/a
Pending: 73
Validated: 0
Blocked: 0

## Phase status

- [x] **Phase 0 — Repo discovery.** `audit/repo-map.md` written. Every starting
      hint verified against the tree at `1d2e929`. Key finding: the display
      graph layer exists (`buildDisplayGraph` in `journey-canvas-layout.ts`,
      4 generic transforms + an unreachable prune) but **no display overlay /
      presentation-metadata layer exists** — Phase 2.1 Level 2 would be net new.
- [x] **Phase 0.1 — Manifest.** `audit/manifest.json`: **73 found / 73
      expected**, no count mismatch, no unknown node types. Journey-type
      taxonomy derived from the corpus (20 types; the largest are
      multi-branch 73, communication 70, wait-event-timeout 64, handoff 58,
      nested-decision 47, back-edge-retry 35, shared-exit 31).
- [x] **Phase 0.2 — Canonical baseline.** `audit/canonical-baseline.json`:
      sha256 per journey over a stable semantic projection (nodes with all
      per-kind semantics, edges, conditions, waits/timing, suppressions,
      handoffs, exits, channel strategy, orchestration, measurement,
      guardrails, entity). Object keys sorted before hashing so key order
      cannot cause a false diff.
- [x] **Baseline display measurement.** `audit/display-before.json`, measured
      from a real render (73 × 2 locales, `next start` + puppeteer) rather
      than a re-implementation of the display graph.
- [ ] **Phase 1 — 73/73 audit.** 6 parallel read-only subagents, 12–13
      journeys each, writing `audit/journeys/{slug}.yaml` only.
- [ ] Phase 2 — pattern inventory + display architecture
- [ ] Phase 3 — reusable implementation
- [ ] Phase 4 — batch apply + validate
- [ ] Phase 5 — full-corpus regression + final report

## Baseline numbers (measured, not estimated)

| Metric | Value |
|---|---|
| Journeys rendering without error | 73 / 73 |
| Locale leaks (EN chrome on TR, TR chrome on EN) | 0 journeys |
| Journeys with a card over 110 characters | **52 / 73** |
| Journeys still showing plain `Internal · NN` cards | **52 / 73** |
| Display nodes per journey (EN) | min 15 / median 23 / max 60 |

Against the complexity budget (short ≤8, standard ≤12, medium multi-branch
≤16) a median of 23 means most of the corpus is over budget, and the two
52/73 figures say why: implementation prose and bookkeeping cards.

## Shared code changed

- None yet this task. Last shared-code change was PR #9 (`collapsibleGates`,
  `channelPlan`, handoff shortName, `splitExitState` comma fix), already on
  `main`.

## Last successful validation

- build: PASS (`1d2e929`)
- typecheck: PASS
- lint: PASS on changed files (1 pre-existing unrelated error in `MobileNav.tsx`)
- canonical guard: baseline generated, not yet re-checked
- locale guard: PASS (0 leaks measured)
- visual: baseline render of all 73 journeys, 0 errors

## Notes

- Shared repo: a second author (Hulusi) commits to the same canvas files.
  Re-fetch before each batch; keep changes additive; never force-push.

## Next action

Wait for the 6 audit subagents, then merge their per-journey YAML into the
manifest and write `audit/patterns.md` (Phase 2).
