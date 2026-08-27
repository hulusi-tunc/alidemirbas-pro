# Journey Canvas — Rollout Plan (DRAFT, NOT EXECUTED)

This document is planning only, per the night-run's explicit instruction. No
step below has been carried out. It exists so that if/when the renderer is
approved for wider rollout, the sequence is already thought through rather
than improvised.

## Stage 1 — Enable all 255 locally

Replace the 39-ID `CANVAS_JOURNEY_IDS` set in `JourneyDetailBody.tsx` with
either the full 255 or a flag that renders every journey through
`JourneyCanvas`. Remove (or repurpose) the test-only
`/qa-canvas-sweep/[id]` route once production gating itself covers every
journey, since its only purpose was bypassing that gate for testing.

## Stage 2 — Full production build verification

`rm -rf .next && npm run build` clean, confirm all 255×2 (en/tr) journey
routes plus their intercepting-route modal variants compile and
prerender/generate without error. Re-run `tsc --noEmit` and `eslint` across
the full changed set.

## Stage 3 — Controlled commit

A single, reviewable commit (or small stack) containing: the gating change,
removal of the test-only sweep route, and any accumulated validation
tooling worth keeping (e.g. the extended `qa-gate.mjs`) moved into the
repo's own test/scripts directory if the team wants it as a standing CI
check rather than a scratch artifact. Commit message states the scope
plainly: full-library enablement, following N validation rounds (this
document's own history is the evidence trail).

## Stage 4 — Push / preview deployment

Push to a branch, open a PR, let the platform's preview deployment build.
Do not merge to the default branch until the preview is itself smoke-tested
(Stage 5) against the *deployed* build, not just the local one — a config
difference (env vars, edge runtime behavior, CDN caching of the dot-grid
background or the SVG defs) is exactly the kind of thing local-only
verification can't catch.

## Stage 5 — Post-deployment smoke test

Against the live preview URL: spot-check the same representative sample
used in this round's Phase G/H visual audit (outliers + random sample) at
1440/375, confirm the automated 18-check gate still passes when pointed at
the deployed URL instead of localhost, and manually click through a handful
of journeys end-to-end (open a journey page, inspect 2-3 nodes, zoom,
fit-to-view, reset) to catch anything that only breaks under real network
latency or a production asset pipeline.

## Stage 6 — Remove temporary journey gating only after verification

Only after Stage 5 passes clean: delete `CANVAS_JOURNEY_IDS` entirely (or
retire it to a comment noting it's now vestigial) so every journey
unconditionally uses `JourneyCanvas`, and confirm `CanonicalFlow` is either
fully retired or intentionally kept as a fallback/print view — that's a
product decision this document doesn't make.

---

**Nothing above has been executed.** Executing any stage requires explicit
approval and was out of scope for this validation run.
