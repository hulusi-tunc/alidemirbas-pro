# Journey Library Launch QA

Visual polish + usability QA pass, not a design or architecture round. Taxonomy (2 primary + 2
reference surfaces), item-discovery/search, and canonical content are closed and were not reopened
here - see `journey-library-user-taxonomy-audit.md` and `journey-library-item-discovery-audit.md`
for that work. This pass only inspected the rendered result and fixed what visually needed it.

## Pages reviewed

Rendered and inspected live (desktop 1440px, tablet 768/820px, mobile 375/390px):

- `/lab` (entry point sanity check only)
- `/lab/journeys` (hub - Hero, Split primary cards, secondary Reference Strip, Stories, Library, Final)
- `/lab/customer-journeys` (search, filters, Presets, category sections, cards)
- `/lab/operational-workflows` (search, filters, category sections, cards)
- `/lab/lifecycle-states`, `/lab/runtime-mechanisms` (sanity check only, not redesigned)
- 4 Customer Journey detail pages (Acquisition, Activation, Retention, the Human Routing journey
  ACQ-04) and 4 Operations detail pages (one per Type: Reviews & Decisions, Account & Access,
  Service & Fulfillment, Systems & Reliability), at desktop and a subset at mobile
- Keyboard/focus behavior on `/lab/customer-journeys` (Tab order, visible focus rings)

## Issues found

| Area | Issue | Severity | Fix |
|---|---|---|---|
| Customer Journeys / Lifecycle States / Runtime Mechanisms filter row | The Goal filter's default option read "All Goals" while its siblings read "All categories" / "All channels" / "All types" (lowercase) - a visible capitalization inconsistency on the one filter row shared across 3 surfaces | LOW | Reworded to "All goals" (EN) / "Tüm goal'ler" (TR) in `content.ts` |

Everything else inspected - hub hierarchy, listing page structure, card design, category section
density, filter alignment/wrapping, search interaction, empty state, graph rendering, detail-page
continuity, information hierarchy, advanced/technical content placement, typography/spacing,
responsive behavior, keyboard/focus - held up under direct inspection with nothing else rising to a
real, fixable issue. See "Items intentionally left unchanged" below for what was checked and why it
didn't need a change.

## Changes applied

1. `src/lib/content.ts` - `allGoals`: "All Goals" → "All goals" (EN), "Tüm Goal'ler" → "Tüm goal'ler"
   (TR). One string, shared by all 3 surfaces that show the Goal filter (Customer Journeys,
   Lifecycle States, Runtime Mechanisms); Operations shows Type instead and was already correct.

That is the only code change this round.

## Items intentionally left unchanged

- **Hub hierarchy** (`/lab/journeys`): confirmed live - the Split section renders exactly 2 full
  primary cards (Customer Journeys 71, Operations 124) with real preview journeys and a dark/outline
  CTA, then a visually distinct "Also part of the library - opened from a journey, not usually
  browsed on their own" strip holding 2 smaller, compact, gray (`bg-paper-soft`) cards for Lifecycle
  States (64) and Runtime Mechanisms (25) - no preview cards, just count + blurb + link. The
  hierarchy is unambiguous at a glance, at both 1440px and 375px (mobile stacks the two primary
  cards, then the strip, in the same order). Counts are small mono numbers in a card corner, not
  competing with the card title. No change needed.
- **Listing page hierarchy** (both surfaces): heading + count badge + one-paragraph intro + surface
  switch + search + filter row + (Presets, Customer Journeys only) + category sections, all in one
  visual block before the first card. A first-time visitor reads title, count and intro in the first
  screenful without scrolling on desktop or tablet. No change needed.
- **Cards** (both surfaces, checked across normal/multi-channel/Human Routing/long-title/
  several-badges examples): title, badge row (channel accents, Human Routing muted badge prepended
  where relevant, muted `Internal`/`Task` fallback), one clamped purpose sentence, category + id +
  node-count footer. Consistent height rhythm, no metadata leaking in beyond that set, real
  `focus-visible` outline and hover state confirmed on the actual link element (not simulated).
  Nothing added or removed.
- **Category sections**: real category `purpose` text under each heading, a mono id-prefix badge as
  the visual marker, consistent `mt-4`/`gap-12` rhythm between sections, "Show more (N)" instead of
  an unbroken wall past 6 cards per section. Single-item sections (Customer Journeys has 4: structure,
  risk, rollout, incident) render identically to larger ones - same header treatment, same card grid,
  nothing looks broken at n=1.
- **Filters**: Category + Channel + Goal + Search (Customer Journeys) and Category + Channel + Type +
  Search (Operations) - alignment, control widths, wrapping (2-per-row at 768/820px, stacked at
  375px), and reset (`Clear all`, shown once a filter/search is active) all checked live, nothing
  broken. Per this round's own brief, no filter was added, removed, or reworked.
- **Search UX**: typing is responsive, result count updates live, `Clear all` is offered both inline
  and in the empty state, combining search with a filter narrows further as expected. Search
  *logic* (aliases, matching) was fixed and closed in the prior round and was not reopened here -
  this pass only checked the interaction, not the matching behavior.
- **Graph rendering** (checked across all 8 sampled detail pages, one Operations page at 375px):
  nodes render at readable size, edge labels are legible, no node text overflows its card, the canvas
  container is `overflow-auto` (native scroll/pan in both directions) with visible zoom/pan/expand/
  reset controls - content that extends past the initial view is one scroll or one tap away, not
  clipped with no way out. This is the existing, correct interaction pattern for a diagram larger
  than its viewport; no engine change made or needed.
- **Detail-page continuity**: every sampled journey (4 Customer Journeys incl. the Human Routing one,
  4 Operations, one per Type) opens with the same title the card showed, its canonical id/category/
  channels directly under that, then purpose and goal, before any implementation detail. Advanced
  content (instance identity, suppressions/canonical rules, collision & priority, measurement) sits
  further down the page, after the plain-language framing, on both journey shapes (practitioner-view
  and graph-only). No mismatch found between what a card promised and what the detail page opened on.
- **Advanced/technical content placement**: already below the fold relative to purpose/goal on every
  sampled page - confirmed by direct inspection, not just a source read. No progressive-disclosure
  mechanism needed beyond the page order that's already there.
- **Stale copy/counts**: searched the codebase for "Operational Workflows" (only match is an internal
  canonical-source comment describing architecture layers, not user-facing text - correctly left
  alone per this round's own instruction to preserve internal canonical terminology), hardcoded `68`/
  `67` (none - every count reads from `SURFACE_ROWS[key].length` at build), "four surfaces" (only in
  code comments, and still literally true - there are 4 routes, 2 presented as primary), and the
  "campaigns to launch"/"campaign templates" phrasing (present and correct - it's the language that
  *already* frames Lifecycle States as non-launchable, not a leftover). Nothing stale found.
- **Feature scope**: no filter, route, sort control, or new UI concept was added. This round is
  exactly what it says - polish and QA, not expansion.

## Responsive QA

Rendered at 375px, 390px, 768px, 820px and 1440px for both listing pages, the hub, and a sample of
detail pages; no horizontal page overflow detected at any breakpoint (checked programmatically via
`scrollWidth > clientWidth`, not just by eye). Filters stack full-width on mobile, wrap 2-per-row on
tablet. Cards remain single-column on mobile, 2-column on tablet, 3-column on desktop, all readable.
Badges wrap without clipping. Headings don't collide with the count badge or intro paragraph at any
width tested. The hub's secondary Reference Strip keeps its distinct (smaller, gray) treatment at
every width, including mobile where it stacks the two cards vertically rather than losing the
visual distinction from the primary cards above it.

## Validation

- `npx tsc --noEmit` - clean
- `npm run build` - clean, every route still `○`/`●` except the two pre-existing `ƒ` exceptions
- `npm run validate:canonical` - 0 errors, 284 journeys / 3690 nodes unchanged, canonical
  customer/mechanism/operational split unchanged (68 communicating / 67 silent by `sends` alone,
  untouched by this round)
- `npm run validate:journey-production` - 30/30 PASS, canonical source mutation = 0
- `npm run validate:seo` - PASS
- `npm run lint` - identical to the pre-existing baseline (1 pre-existing error in `MobileNav.tsx`,
  13 pre-existing warnings elsewhere; none touched, none added)
- User-facing counts confirmed live: Customer Journeys 71, Operations 124, Lifecycle States 64,
  Runtime Mechanisms 25, total 284

## Launch verdict

**READY**
