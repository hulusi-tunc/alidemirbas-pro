# Orphaned public assets (archived 2026-09-05)

Files that lived under `public/` but were referenced by nothing in `src/`,
`next.config.ts`, or any Next filename convention (`favicon`, `icon`,
`apple-icon`, `opengraph-image`, `manifest` all live in `src/app/`). Verified
with a repo-wide grep before the move. Served-by-convention files
(`public/llms.txt`) and every referenced asset (`portrait.jpg`, `logos/*`,
`lab/sky-dark.jpg`, `lab/sky-hero.jpg`, `lab/sky-mesh.jpg`) stayed in place.

| File | Size | What it was |
| --- | --- | --- |
| `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | 128 B - 1.4 KB | `create-next-app` boilerplate icons; never referenced by this site. |
| `sky-glow.jpg` | 42 KB | A fourth sky background for the /lab index; the page uses `sky-hero`, `sky-mesh` and `sky-dark` and never referenced this one. |

`seo/open-graph-contract.json` mentions the five boilerplate icons in a note
describing what `public/` contained at audit time; that note is descriptive,
not a reference.
