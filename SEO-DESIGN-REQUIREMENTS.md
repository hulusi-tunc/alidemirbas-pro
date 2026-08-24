# SEO Design Requirements

What the SEO architecture (see `seo/`) needs the redesign to preserve or provide. No pixel, layout, or visual decisions here — those are the designer's to make. This is the list of constraints the SEO contract depends on, so the redesign doesn't quietly break something the contract assumes.

## 1. Exactly one visible H1 per page

Every page family has exactly one H1 source defined in `seo/h1-contract.json`. Whatever the new design does with headings, each page must still render exactly one `<h1>` — not zero (a purely visual "hero" styled as something else), not two (a hero heading plus a repeated section heading also marked as H1).

## 2. Breadcrumbs — which page families need one

`seo/breadcrumb-contract.json` defines a real trail for every family except `home` and `catchall`. Today, three families (`calculator-detail`, `ab-test-library-detail`, `journey-library-detail`) render only a single "back to index" link, not a multi-level trail. The redesign can either:
- keep the single back-link pattern visually and let the full trail exist only in `BreadcrumbList` structured data (a legitimate choice — Google reads the structured data independent of what's visually shown), or
- render the full trail visibly.

Either is fine. What matters: whichever trail data ends up on screen and whichever trail data goes into the `BreadcrumbList` JSON-LD must come from the **same source** (the contract file), not two independently maintained copies that can drift apart.

## 3. Indexable content must never be client-only

None of the current programmatic content (A/B test scenario body, journey graph/nodes, calculator FAQ) is client-only today — all of it is server-rendered on a hard page load, confirmed directly in this audit (see `seo/site-route-inventory.json`'s `journey-library-detail-modal` entry for the one case that specifically needed checking: the intercepted `@modal` route for journeys, which was confirmed to have zero effect on what a crawler sees, since a hard load always renders the real server component). If the redesign introduces new client-side-only rendering (a new interactive widget, a lazy-loaded content section, an intersection-observer reveal), the text content inside it must still be present in the initial server-rendered HTML — don't gate crawlable text behind a client-side fetch or a "load more" that requires a click.

## 4. FAQ content must stay crawlable

The 43 calculator pages carry real FAQ content today, rendered via `FaqAccordion` (a real DOM element per question, not a virtualized/client-fetched list). Whatever the new FAQ UI looks like (accordion, tabs, whatever), each Q&A pair needs to exist in the page's HTML on load — `<details>/<summary>`, a plain always-rendered list with CSS-only collapse, or an accordion whose closed-state content is still in the DOM (just visually hidden) all work; a version that only fetches the answer text on click does not.

Also see `seo/structured-data-contract.json`: `FAQPage` schema itself is **not recommended** right now (Google restricted its rich-result eligibility to authoritative gov/health sites in 2023) — this requirement is about the FAQ content staying crawlable as plain page text, not about adding FAQPage markup.

## 5. Content hierarchy / heading order

Each page family's content should keep a sane heading order under its one H1 — H2s for major sections (Formula, Worked Example, FAQ, Related, etc. on a calculator page; Primary KPI, What to Test, Never Do on an A/B test page; the flow graph, guardrails, reusable rule on a journey page), H3s only nested under a real H2, never skipping a level for a visual-only reason. This is already the pattern in every existing content component (`CalculatorContent.tsx`, `AbTestRoutes.tsx`, `JourneyDetailBody.tsx`) — just don't regress it.

## 6. Internal link slots

Page families that currently carry a "related content" section and should keep one in any redesign:
- **calculator-detail** — `RelatedGrid`, sourced from either the content's own authored `related[]` (verified against live slugs at render time) or the catalog's `relatedCalculators` fallback.
- **lab-product (dashboard-builder)** — up to 4 other Lab project links.

Page families that do NOT currently have a "related" section but structurally could gain internal-linking value from one, if the redesign wants to add it:
- **ab-test-library-detail** (211 pages) — no cross-links to other scenarios in the same category/surface today, beyond the back-link to the index.
- **journey-library-detail** (255 pages) — does link to `distinctFrom` journeys and competing journeys where the data has them, but not a general "related journeys in this category" block.
- **blog-article** (5 pages) — already links out to relevant calculators/tools (`post.related`), no gap here.

## 7. OG asset needs (`NEEDS-DESIGN-ASSET`)

No Open Graph image exists anywhere on the site today (confirmed: zero `openGraph`/`twitter` fields in the whole codebase). Not a blocker for this round, but worth knowing before the redesign locks in image dimensions/branding elsewhere:
- **Site-wide default OG image** — doesn't exist. The only real image asset in the repo is `public/portrait.jpg` (not a 1200×630 social card).
- **Per-article OG image** (5 blog articles) — realistic to hand-design at this scale.
- **Generated-template OG image** for the two large corpora (211 A/B test pages, 255 journey pages, optionally 43 calculators) — this is a template/generator asset (e.g. a card showing the page's title + a category label), not 211+255 individual hand-made images. If the redesign is choosing a visual system/type scale, keeping this kind of generated-card layout in mind early avoids a mismatched one-off later.
- **Per-Lab-project OG image** (2 products: A/B Test Playbook, Dashboard Builder) — optional, low priority.

## 8. What NOT to worry about

- Trailing slashes, query-parameter URLs, and locale routing are already fully handled at the framework/data layer (see `seo/canonical-contract.json`) — nothing here depends on a design decision.
- hreflang is fully automatic via one shared metadata helper — a new page family just needs to call it with its own path, no per-page hreflang authoring.
- Sitemap inclusion is automatic for anything added to the right data source (calculator catalog, journey canonical data, A/B test data, blog posts array) — a new page in an existing family doesn't need a manual sitemap edit.
