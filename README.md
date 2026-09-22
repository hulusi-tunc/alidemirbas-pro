# alidemirbas.com.tr

Personal portfolio and product playground built with Next.js.

The site is bilingual (English / Turkish) and includes:
- personal profile and work pages
- Lab projects
- journey and A/B test libraries
- calculators and text tools
- blog content
- an internal search API

## Local development

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
```

Useful validators:

```bash
npm run validate:canonical
npm run validate:journey-production
npm run validate:seo
```

## Repository map

- `src/app` — routes, sitemap, robots and API routes
- `src/components` — shared page and UI components
- `src/lib` — content adapters, catalogs, schemas and server-side view models
- `src/canonical` — canonical journey data
- `production/calculators` — calculator catalog and editorial content consumed by the site
- `search` — search engine code and static index data consumed by `/api/search`
- `public` — site assets
- `scripts`, `qa`, `seo`, `production` — generation, validation and QA tooling

## Content rules

Do not hard-code corpus or catalog counts into user-facing copy when a data source already exists. Derive them from the source data.

Old demo routes are removed rather than redirected. The site does not keep a legacy URL compatibility layer.
