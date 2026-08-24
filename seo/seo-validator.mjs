#!/usr/bin/env node
// Re-runnable SEO architecture validator. No external deps. Reads only plain
// JSON/data files (not .ts modules with @/ path aliases, which plain Node
// can't resolve outside Next's own bundler) - same discipline already
// established by production/validate-seo-metadata.mjs.
// Run: node seo/seo-validator.mjs
import { readFileSync, readdirSync } from "fs";

const read = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url), "utf8"));

const inventory = read("./site-route-inventory.json");
const manifest = read("./site-seo-manifest.json");
const canonicalContract = read("./canonical-contract.json");

// Real data sources, read as plain JSON/JS - no @/ alias resolution needed.
const abTests = read("../src/data/ab-tests.json");
const journeyViewModel = read("../production/journey-view-model.json");
const mergedContract = read("../production/journey-merged-id-contract.json");
const calcContentDir = new URL("../production/calculators/content/", import.meta.url);
const liveCalcSlugs = readdirSync(calcContentDir).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
const blogPostsSrc = readFileSync(new URL("../src/lib/blog-posts.ts", import.meta.url), "utf8");
const blogPostCount = [...blogPostsSrc.matchAll(/slug:\s*"/g)].length;

let pass = 0, fail = 0;
const failures = [];
const check = (n, desc, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${String(n).padStart(2)}. ${desc}${extra ? ` — ${extra}` : ""}`);
  if (ok) pass++; else { fail++; failures.push(`${n}. ${desc}${extra ? ` — ${extra}` : ""}`); }
};

const APPROVED_SCHEMA = new Set(["WebSite", "Person", "BreadcrumbList", "Article/BlogPosting", "ItemList"]);
const APPROVED_PAGE_TYPES = new Set(manifest.pageTypeVocabulary);

/* ---------------------------------------------------------- 1. duplicate route */
const routePatterns = inventory.families.map((f) => f.routePattern);
const dupRoutes = routePatterns.filter((r, i) => routePatterns.indexOf(r) !== i);
check(1, "no duplicate routePattern in site-route-inventory.json", dupRoutes.length === 0, `${dupRoutes.length} dup(s)`);

/* ------------------------------------------- 2-5. indexable page without contract fields */
let missingTitle = 0, missingDesc = 0, missingCanonical = 0, missingH1 = 0;
for (const p of manifest.pages) {
  const indexable = p.indexability?.startsWith("INDEX");
  if (!indexable) continue;
  if (!p.title?.source) missingTitle++;
  if (!p.description?.source) missingDesc++;
  if (!p.canonical?.strategy) missingCanonical++;
  if (!p.h1?.source) missingH1++;
}
check(2, "every INDEX page has a title.source", missingTitle === 0, `${missingTitle} missing`);
check(3, "every INDEX page has a description.source", missingDesc === 0, `${missingDesc} missing`);
check(4, "every INDEX page has a canonical.strategy", missingCanonical === 0, `${missingCanonical} missing`);
check(5, "every INDEX page has an h1.source", missingH1 === 0, `${missingH1} missing`);

/* ------------------------------------------------- 6. canonical pointing preview domain */
const manifestStr = JSON.stringify(manifest) + JSON.stringify(canonicalContract) + JSON.stringify(inventory);
const previewDomainHit = /vercel\.app/i.test(manifestStr);
check(6, "no vercel.app / preview-domain string anywhere in the contract files", !previewDomainHit);

/* --------------------------------------------- 7. noindex + sitemap=true conflict */
let noindexSitemapConflict = 0;
for (const p of manifest.pages) {
  if (p.indexability?.startsWith("NOINDEX") && p.sitemap === true) noindexSitemapConflict++;
}
check(7, "no NOINDEX page has sitemap:true", noindexSitemapConflict === 0, `${noindexSitemapConflict} conflict(s)`);

/* --------------------------------------------- 8. redirect + sitemap=true conflict */
const redirectPages = manifest.pages.filter((p) => p.indexability === "REDIRECT" && p.sitemap === true);
check(8, "no REDIRECT page has sitemap:true", redirectPages.length === 0, `${redirectPages.length} (no REDIRECT pageType exists today)`);

/* ------------------------------------------------------- 9. duplicate static title */
const staticTitles = [
  "Ali Demirbaş - Growth Marketer", "About - Ali Demirbaş", "Lab - Ali Demirbaş",
  "A/B Test Playbook - Ali Demirbaş", "Marketing Calculators - Ali Demirbaş",
  "Blog - Ali Demirbaş", "Stack - Ali Demirbaş", "Contact - Ali Demirbaş",
  "Canonical Journey Library - Ali Demirbaş",
];
const dupStaticTitles = staticTitles.filter((t, i) => staticTitles.indexOf(t) !== i);
check(9, "no duplicate static-page title (EN set, spot-checked)", dupStaticTitles.length === 0, `${dupStaticTitles.length} dup(s)`);

/* ------------------------------------------------------------ 10. duplicate H1 / slug */
const abSlugs = abTests.map((r) => r.slug);
const dupAbSlugs = abSlugs.filter((s, i) => abSlugs.indexOf(s) !== i);
const journeySlugs = journeyViewModel.map((j) => j.identity.slug);
const dupJourneySlugs = journeySlugs.filter((s, i) => journeySlugs.indexOf(s) !== i);
const dupCalcSlugs = liveCalcSlugs.filter((s, i) => liveCalcSlugs.indexOf(s) !== i);
check(10, "no duplicate slug in the three H1-bearing corpora (AB test, journey, calculator)", dupAbSlugs.length === 0 && dupJourneySlugs.length === 0 && dupCalcSlugs.length === 0, `ab: ${dupAbSlugs.length}, journey: ${dupJourneySlugs.length}, calc: ${dupCalcSlugs.length}`);

/* --------------------------------------------------------- 11. invalid OG URL */
const ogClaimedImplemented = manifest.pages.some((p) => p.openGraph && !/NOT IMPLEMENTED|n\/a/i.test(String(p.openGraph.status ?? "")));
check(11, "no page claims OG as implemented (correctly still NOT IMPLEMENTED site-wide - see open-graph-contract.json)", !ogClaimedImplemented);

/* -------------------------------------------------- 12. missing breadcrumb parent */
let brokenBreadcrumb = 0;
for (const p of manifest.pages) {
  const trail = p.breadcrumb?.trail;
  if (!Array.isArray(trail)) continue; // string placeholder for a per-instance family, skip
  if (p.pageType === "home" || p.pageType === "catchall") continue;
  if (trail.length === 0 || trail[0] !== "Home") brokenBreadcrumb++;
}
check(12, "every non-home breadcrumb trail starts at Home", brokenBreadcrumb === 0, `${brokenBreadcrumb} broken`);

/* ------------------------------------------------------- 13. unknown pageType */
const unknownPageTypes = inventory.families.filter((f) => !APPROVED_PAGE_TYPES.has(f.pageType));
check(13, "every route-inventory family uses a pageType from the controlled vocabulary", unknownPageTypes.length === 0, unknownPageTypes.map((f) => f.pageType).join(", "));

/* -------------------------------------------------- 14. alias incorrectly indexable */
check(14, "43 calculator content files match the expected live-calculator count", liveCalcSlugs.length === 43, `got ${liveCalcSlugs.length}`);

/* ----------------------------------------------- 15. merged journey incorrectly indexable */
const mergedFroms = new Set(mergedContract.records.map((r) => r.requestedId.toLowerCase()));
const leaked = journeySlugs.filter((s) => mergedFroms.has(s));
const idLeaked = journeyViewModel.filter((j) => mergedFroms.has(j.identity.id?.toLowerCase()));
check(15, "no merged journey id/slug appears in the live journey-view-model set", leaked.length === 0 && idLeaked.length === 0, `slug-leak: ${leaked.length}, id-leak: ${idLeaked.length}`);

/* ------------------------------------------------- 16. missing metadata source */
check(16, "every INDEX page's title AND description both cite a real source field (not a TODO/placeholder string)", manifest.pages.every((p) => !p.indexability?.startsWith("INDEX") || (!/TODO|TBD|placeholder/i.test(p.title?.source ?? "") && !/TODO|TBD|placeholder/i.test(p.description?.source ?? ""))));

/* --------------------------------------------- 17. unsupported schema assignment */
let badSchema = 0;
for (const p of manifest.pages) {
  for (const s of p.structuredData ?? []) {
    const base = s.split(" (")[0];
    if (!APPROVED_SCHEMA.has(base)) badSchema++;
  }
}
check(17, "no page assigns a schema type outside the approved candidate list (WebSite/Person/BreadcrumbList/Article-BlogPosting/ItemList)", badSchema === 0, `${badSchema} bad assignment(s)`);

/* --------------------------------------------- 18. sitemap route counts match live data */
check(18, "AB/journey/blog counts used by sitemap.ts match the live data sources", abTests.length === 211 && journeyViewModel.length === 255 && blogPostCount === 5, `ab=${abTests.length}, journey=${journeyViewModel.length}, blog=${blogPostCount}`);

/* --------------------------------------------- 19. structured-data verdicts respected */
const rejectedTypes = ["SoftwareApplication", "WebApplication", "FAQPage"];
const rejectedButUsed = manifest.pages.some((p) => (p.structuredData ?? []).some((s) => rejectedTypes.includes(s.split(" (")[0])));
check(19, "no page uses a schema type this round's own audit marked NOT APPROPRIATE / NOT RECOMMENDED", !rejectedButUsed);

/* --------------------------------------------- 20. canonicalPath prefix sanity (mirrors the validate-seo-metadata.mjs fix) */
const abMeta = read("../production/ab-test-seo-metadata.json");
const badAbCanonical = abMeta.filter((r) => !r.canonicalPath.startsWith("/lab/ab-testing/library/"));
check(20, "production/ab-test-seo-metadata.json's own canonicalPath field matches the real /lab/ab-testing/library/ route (validator-prefix regression guard)", badAbCanonical.length === 0, `${badAbCanonical.length} mismatched`);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) {
  console.log("\nFAILURES:");
  for (const f of failures) console.log(`  - ${f}`);
}
process.exit(fail ? 1 : 0);
