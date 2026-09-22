# CLAUDE.md

@AGENTS.md

## Commands

```bash
npm run dev
npm run build
npm run lint
npx tsc --noEmit

npm run validate:canonical
npm run validate:journey-production
npm run validate:seo
```

Run `npm run build` before merging code changes. When lint reports an inherited problem, separate it from errors introduced by the files you touched rather than changing unrelated code.

## Routing

The site has two route trees:

- English: `src/app/(en)/...`
- Turkish: `src/app/tr/...`

There is no dynamic `[lang]` segment. Shared pages live in `src/components` and receive a `lang` prop; route files should stay thin.

This is a demo / portfolio site. Do not preserve legacy URLs with redirects. When an old page is retired, remove the route and let Next.js return its default 404. Do not add custom catch-all 404 routes or custom locale 404 pages unless explicitly requested.

Add only active public routes to `src/app/sitemap.ts`.

## Content ownership

General site copy lives in `src/lib/content.ts`.

Lab project card metadata also lives in `copy[lang].lab.projects` and is accessed through `src/lib/skill-catalog.ts`.

Detailed copy for bespoke Lab product pages lives in:
- `src/lib/skill-pages/change-history.tsx`
- `src/lib/skill-pages/dashboard-builder.tsx`
- `src/lib/skill-pages/numerspace.tsx`

The corresponding page components import that copy. Do not create a second copy block in the component.

Blog content lives in `src/lib/blog-posts.ts`.

A/B test source data lives in `src/data/ab-tests.json`.

## Numbers in copy

Do not type corpus, test, template, calculator, category or year counts directly into user-facing copy when they can be derived.

Current Lab metrics are resolved through `src/lib/lab-project-facts.ts` from their source data. Journey library counts are derived through the canonical/public corpus adapters. Footer year is dynamic.

If a number cannot be derived from a maintained source, prefer removing the number from copy.

## Journey architecture

`src/canonical` is the authored source for the journey graph. The public website reads it through server-side adapters in `src/lib`, especially `canonical-view.ts` and `public-corpus.ts`.

Do not import the canonical corpus or `canonical-view.ts` from a `"use client"` component. Shape data on the server and pass plain props to client components.

Some canonical journeys are intentionally excluded from public listings. Do not delete canonical records merely because they are not exposed on the website; other journeys may still hand off to or reference them.

Journey detail routes use the shared journey route layer and the `@modal` interceptor under `/lab/journeys`.

## Calculators

Runtime calculator data is not dead repository material.

The site imports:
- `production/calculators/calculator-catalog.json`
- `production/calculators/content/*.json`

through `src/lib/calc-catalog.ts` and `src/lib/calc-content.ts`.

Keep catalog, registry, content and validator changes in sync when adding or removing a calculator.

## Search

`src/app/api/search/route.ts` statically imports the search engine and index data from `search/`. Those files are part of the deployed search feature and must not be removed as generic audit output.

Keep search data imports static so Next.js includes them in the server bundle.

## Generated and tooling directories

Not everything outside `src` ships to the browser.

- `production/calculators` contains runtime calculator data.
- `search` contains runtime search data plus search tooling.
- `production`, `seo`, `scripts` and `qa` also contain generation and validation material.

Before deleting a generated file, check both runtime imports and validator/generator consumers. Do not keep one-off historical artifacts in main simply because they existed in an earlier version of the repo.

## Design

For design or visual work, follow `AGENTS.md` and load `.claude/skills/ali-web-design/SKILL.md`.

Do not restyle the global header/footer as a side effect of a page-specific task. Do not invent product metrics, screenshots or proof points.
