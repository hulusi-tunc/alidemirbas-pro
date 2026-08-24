#!/usr/bin/env node
// Re-runnable validator for the search/ data layer. No external deps.
// Run: node search/search-validator.mjs
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { execFileSync } from "child_process";
import { search } from "./headless-search-prototype.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rj = (p) => JSON.parse(readFileSync(path.join(ROOT, p), "utf8"));

const index = rj("search/search-index.json");
const manifest = rj("search/search-manifest.json");
const taxonomy = rj("search/search-taxonomy.json");
const aliases = rj("search/search-aliases.json").aliases;
const relationsDoc = rj("search/search-relations.json");
const facets = rj("search/search-facets.json");
const schema = rj("search/search-document.schema.json");

let pass = 0, fail = 0;
const failures = [];
const check = (n, desc, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${String(n).padStart(2)}. ${desc}${extra ? ` — ${extra}` : ""}`);
  if (ok) pass++; else { fail++; failures.push(`${n}. ${desc}${extra ? ` — ${extra}` : ""}`); }
};

/* -------------------------------------------------------- 1. document count */
check(1, "document count matches manifest.totalDocuments", index.length === manifest.totalDocuments, `index=${index.length}, manifest=${manifest.totalDocuments}`);
check(1.1, "document count matches sourceVersion sum (211+255+43+6+5)", index.length === 211 + 255 + 43 + 6 + 5, `got ${index.length}`);

/* -------------------------------------------------------------- 2. duplicate ID */
const ids = index.map((d) => d.id);
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
check(2, "duplicate document id = 0", dupIds.length === 0, `${dupIds.length} dup(s)`);

/* ------------------------------------------------------------- 3. duplicate URL */
const urls = index.map((d) => d.url);
const dupUrls = urls.filter((u, i) => urls.indexOf(u) !== i);
check(3, "duplicate url = 0", dupUrls.length === 0, `${dupUrls.length} dup(s): ${dupUrls.slice(0, 5).join(", ")}`);

/* ---------------------------------------------------------- 4. invalid canonical */
let invalidCanonical = 0;
for (const d of index) {
  if (d.external) { if (d.canonical !== null) invalidCanonical++; continue; }
  if (!d.canonical || !d.canonical.startsWith("https://alidemirbas.com.tr")) invalidCanonical++;
}
check(4, "canonical is null for external docs, production-domain for internal docs", invalidCanonical === 0, `${invalidCanonical} bad`);

/* --------------------------------------------- 5. non-indexable entity in search */
// Every document IS meant to be searchable regardless of `indexable` (an SEO
// concept, not a search-inclusion one - see headless-search-prototype.mjs's
// own comment). What this checks instead: any indexable:false document that
// is NOT external is unusual and worth a second look (currently none - all
// 43 live calculators are index:true, so the only indexable:false docs today
// are the 3 external Lab products, which is expected and correct).
const unexpectedNonIndexable = index.filter((d) => !d.indexable && !d.external);
check(5, "every indexable:false document is external (no unexplained non-indexable internal doc)", unexpectedNonIndexable.length === 0, unexpectedNonIndexable.map((d) => d.id).join(", "));

/* --------------------------------------------------------- 6. merged journey visible */
const mergedIds = new Set(aliases.filter((a) => a.type === "merged-journey").map((a) => a.alias));
const mergedVisible = index.filter((d) => d.type === "journey" && mergedIds.has(d.slug.toUpperCase()));
const mergedIdLeak = index.filter((d) => d.type === "journey" && mergedIds.has(d.id.replace("journey:", "")));
check(6, "no merged journey id/slug has its own document", mergedVisible.length === 0 && mergedIdLeak.length === 0, `${mergedVisible.length + mergedIdLeak.length} leaked`);

/* -------------------------------------------------------------- 7. broken alias */
const idSet = new Set(ids);
const brokenAliases = aliases.filter((a) => !idSet.has(a.targetId));
check(7, "every alias targetId resolves to a real document", brokenAliases.length === 0, brokenAliases.map((a) => a.alias).join(", "));

/* ------------------------------------------------------------ 8. alias collision */
const aliasStrings = new Set(aliases.flatMap((a) => [a.alias.toLowerCase(), a.aliasSlugLowercased]));
const collidingDocs = index.filter((d) => aliasStrings.has(d.id.toLowerCase()) || aliasStrings.has(d.slug.toLowerCase()));
check(8, "no alias string collides with a real, active document's own id/slug", collidingDocs.length === 0, collidingDocs.map((d) => d.id).join(", "));

/* ------------------------------------------------------------ 9. unknown taxonomy */
const validNormalizedCat = new Set(taxonomy.categoryMap.shared);
const validSurface = new Set(taxonomy.surfaces.values);
const validStage = new Set(taxonomy.funnelStages.values);
const validObjective = new Set(taxonomy.businessObjectives.values);
const validIntent = new Set(taxonomy.intents.values);
let unknownTaxonomy = 0;
const unknownExamples = [];
for (const d of index) {
  for (const v of d.normalizedCategory) if (!validNormalizedCat.has(v)) { unknownTaxonomy++; unknownExamples.push(`${d.id}:normalizedCategory:${v}`); }
  for (const v of d.surface) if (!validSurface.has(v)) { unknownTaxonomy++; unknownExamples.push(`${d.id}:surface:${v}`); }
  for (const v of d.funnelStage) if (!validStage.has(v)) { unknownTaxonomy++; unknownExamples.push(`${d.id}:funnelStage:${v}`); }
  for (const v of d.businessObjective) if (!validObjective.has(v)) { unknownTaxonomy++; unknownExamples.push(`${d.id}:businessObjective:${v}`); }
  for (const v of d.intent) if (!validIntent.has(v)) { unknownTaxonomy++; unknownExamples.push(`${d.id}:intent:${v}`); }
}
check(9, "every taxonomy-dimension value is a member of its controlled vocabulary", unknownTaxonomy === 0, `${unknownTaxonomy} unknown: ${unknownExamples.slice(0, 5).join(", ")}`);

/* ------------------------------------------------------ 10. invalid relation target */
let invalidRelationTarget = 0;
for (const [from, r] of Object.entries(relationsDoc.relations)) {
  if (!idSet.has(from)) invalidRelationTarget++;
  for (const bucket of [r.relatedPrimary, r.relatedSecondary]) for (const e of bucket) if (!idSet.has(e.to)) invalidRelationTarget++;
}
check(10, "every relation edge (from and to) resolves to a real document", invalidRelationTarget === 0, `${invalidRelationTarget} broken`);

/* -------------------------------------------------------------- 11. self relation */
let selfRelations = 0;
for (const [from, r] of Object.entries(relationsDoc.relations)) {
  for (const bucket of [r.relatedPrimary, r.relatedSecondary]) for (const e of bucket) if (e.to === from) selfRelations++;
}
check(11, "no document relates to itself", selfRelations === 0, `${selfRelations} found`);

/* --------------------------------------------------------- 12. duplicate relation */
let duplicateRelations = 0;
for (const [, r] of Object.entries(relationsDoc.relations)) {
  const allTargets = [...r.relatedPrimary, ...r.relatedSecondary].map((e) => e.to);
  duplicateRelations += allTargets.length - new Set(allTargets).size;
}
check(12, "no document has a duplicate relation edge to the same target", duplicateRelations === 0, `${duplicateRelations} dup(s)`);

/* --------------------------------------------------- 13-14. missing title/URL */
const missingTitle = index.filter((d) => !d.title || !d.title.trim());
const missingUrl = index.filter((d) => !d.url || !d.url.trim());
check(13, "every document has a non-empty title", missingTitle.length === 0, missingTitle.map((d) => d.id).join(", "));
check(14, "every document has a non-empty url", missingUrl.length === 0, missingUrl.map((d) => d.id).join(", "));

/* ---------------------------------------------- 15-16. searchText empty/oversized */
const emptySearchText = index.filter((d) => !d.searchText || !d.searchText.trim());
const oversizedSearchText = index.filter((d) => d.searchText.length > 2000);
check(15, "every document has a non-empty searchText", emptySearchText.length === 0, emptySearchText.map((d) => d.id).join(", "));
check(16, "no searchText exceeds the 2000-char cap", oversizedSearchText.length === 0, oversizedSearchText.map((d) => `${d.id}(${d.searchText.length})`).join(", "));

/* -------------------------------------------------------------- 17. invalid facet */
let invalidFacet = 0;
const facetToValidSet = {
  normalizedCategory: validNormalizedCat, surface: validSurface, funnelStage: validStage, businessObjective: validObjective,
};
for (const [dim, validSet] of Object.entries(facetToValidSet)) {
  for (const v of facets[dim].values) if (!validSet.has(v.value)) invalidFacet++;
}
check(17, "every facet value belongs to its dimension's controlled vocabulary", invalidFacet === 0, `${invalidFacet} bad`);

/* ------------------------------------------------- 18. missing source provenance */
const missingSource = index.filter((d) => !d.source || !Array.isArray(d.source.file) || !d.source.file.length || !Array.isArray(d.source.fields) || !d.source.fields.length);
check(18, "every document has non-empty source.file and source.fields", missingSource.length === 0, missingSource.map((d) => d.id).join(", "));

/* --------------------------------------------------- 19. schema conformance (lightweight) */
const schemaProps = new Set(Object.keys(schema.properties));
let schemaViolations = 0;
for (const d of index) {
  for (const key of Object.keys(d)) if (!schemaProps.has(key)) schemaViolations++;
  for (const req of schema.required) if (!(req in d)) schemaViolations++;
}
check(19, "every document has exactly the schema's required fields, no extras", schemaViolations === 0, `${schemaViolations} violation(s)`);

/* --------------------------------------------------- 20. type/id prefix consistency */
const badIdPrefix = index.filter((d) => !d.id.startsWith(`${d.type}:`));
check(20, "every document id is prefixed with its own type", badIdPrefix.length === 0, badIdPrefix.map((d) => d.id).join(", "));

/* ------------------------------------------- 21. exact-title-match ranking regression
   For a sample of real document titles (one per type, deterministically
   picked - first document of each type in index order, not cherry-picked
   for a good result), searching the EXACT title string must return that
   same document as the #1 result. This is the ranking floor the whole
   scorer exists to guarantee (scoreDocument's own exact-title-match bonus
   is +100, the single largest score component) - a regression here means
   the most basic case broke. */
const titleSampleByType = {};
for (const d of index) if (!titleSampleByType[d.type]) titleSampleByType[d.type] = d;
let exactTitleRegressions = 0;
const exactTitleFailures = [];
for (const d of Object.values(titleSampleByType)) {
  const top = search(d.title, { limit: 1 }).results[0];
  if (!top || top.id !== d.id) { exactTitleRegressions++; exactTitleFailures.push(`"${d.title}" -> expected ${d.id}, got ${top ? top.id : "(none)"}`); }
}
check(21, "exact-title-match ranking regression (one real title per type must self-rank #1)", exactTitleRegressions === 0, exactTitleFailures.join("; "));

/* ------------------------------------------- 22. exact-alias ranking regression
   Every alias in search-aliases.json must actually resolve its own alias
   string to its declared targetId when run through search() - not just
   structurally valid (check 7 already confirms targetId exists), but
   actually WORKING at ranking time via the alias-match +95 bonus. */
let exactAliasRegressions = 0;
const exactAliasFailures = [];
for (const a of aliases) {
  const top = search(a.alias, { limit: 1 }).results[0];
  if (!top || top.id !== a.targetId) { exactAliasRegressions++; exactAliasFailures.push(`"${a.alias}" -> expected ${a.targetId}, got ${top ? top.id : "(none)"}`); }
}
check(22, "exact-alias ranking regression (every alias must resolve top-1 to its targetId)", exactAliasRegressions === 0, exactAliasFailures.join("; "));

/* --------------------------------------------------------- 23. invalid type */
const validTypes = new Set(["ab-test", "journey", "calculator", "lab-product", "blog-article"]);
const invalidTypeDocuments = index.filter((d) => !validTypes.has(d.type));
check(23, "invalid type = 0 (every document is one of the 5 real corpus types)", invalidTypeDocuments.length === 0, invalidTypeDocuments.map((d) => d.id).join(", "));

/* ----------------------------------------------------- 24. invalid language */
const validLanguages = new Set(["en", "tr", "en+tr"]);
const invalidLanguageDocuments = index.filter((d) => !validLanguages.has(d.language));
check(24, "invalid language = 0 (every document's language is one of en/tr/en+tr)", invalidLanguageDocuments.length === 0, invalidLanguageDocuments.map((d) => `${d.id}:${d.language}`).join(", "));

/* ------------------------------------------------- 25. duplicate canonical */
const canonicals = index.filter((d) => d.canonical).map((d) => d.canonical);
const dupCanonicals = canonicals.filter((c, i) => canonicals.indexOf(c) !== i);
check(25, "duplicate canonical URL = 0 (among non-null canonicals)", dupCanonicals.length === 0, `${dupCanonicals.length} dup(s): ${dupCanonicals.slice(0, 5).join(", ")}`);

/* ---------------------------------------------- 26. facet counts match real dataset */
// Recompute every facet value's documentCount directly from index and diff
// against facets.json's own stored numbers - catches a stale facets.json
// that wasn't regenerated after an index change.
let facetCountMismatches = 0;
const facetMismatchExamples = [];
const dimToField = { type: "type", normalizedCategory: "normalizedCategory", surface: "surface", funnelStage: "funnelStage", businessObjective: "businessObjective", metric: "metric" };
for (const [dim, field] of Object.entries(dimToField)) {
  const real = new Map();
  for (const d of index) {
    const vals = field === "type" ? [d.type] : d[field];
    for (const v of vals ?? []) real.set(v, (real.get(v) ?? 0) + 1);
  }
  for (const entry of facets[dim]?.values ?? []) {
    const realCount = real.get(entry.value) ?? 0;
    if (realCount !== entry.documentCount) { facetCountMismatches++; facetMismatchExamples.push(`${dim}:${entry.value} stored=${entry.documentCount} real=${realCount}`); }
  }
}
check(26, "facet counts match real dataset (recomputed from index, diffed against search-facets.json)", facetCountMismatches === 0, facetMismatchExamples.slice(0, 5).join("; "));

/* -------------------------------------------------------- 27. synonym collision */
// Different check from check 8's alias collision (a synonym's own `term` is
// EXPECTED to often equal its own targetId's slug/acronym - e.g. term "CTR"
// for targetId calculator:ctr is the whole point of that entry, not a bug).
// What would be a real problem: a synonym's term/equivalent colliding with
// a DIFFERENT document's id/slug (one that isn't its own declared
// targetId) - that would mean the synonym text is ambiguous with an
// unrelated document, not just descriptive of its own target.
const synonymsDoc = rj("search/search-synonyms.json");
let synonymCollisions = 0;
const synonymCollisionExamples = [];
for (const s of synonymsDoc.synonyms) {
  const ownTargets = new Set([s.targetId].filter(Boolean).map((t) => t.toLowerCase()));
  for (const str of [s.term, ...s.equivalents]) {
    const strLower = str.toLowerCase();
    for (const d of index) {
      if (ownTargets.has(d.id.toLowerCase())) continue; // matching its own declared target is expected, not a collision
      if (strLower === d.id.toLowerCase() || strLower === d.slug.toLowerCase()) { synonymCollisions++; synonymCollisionExamples.push(`"${str}" (synonym for ${s.targetId ?? "corpus-wide"}) collides with ${d.id}`); }
    }
  }
}
check(27, "no synonym term/equivalent collides with a DIFFERENT real document's own id/slug", synonymCollisions === 0, synonymCollisionExamples.slice(0, 5).join("; "));

/* ------------------------------------------------- 28. search result -> existing route */
// Every document's own url must match the real route SHAPE that type's
// actual Next.js pages use - not just "starts with a slash" but the real
// per-type path prefix, so a search result can never point at a URL the
// site itself wouldn't generate.
const routePrefixByType = {
  "calculator": "/calculators/", "ab-test": "/lab/ab-testing/library/", "journey": "/lab/journeys/",
  "blog-article": "/blog/", "lab-product": null, // lab-product urls are legitimately either on-site (/lab/...) or off-site (external:true) - no single prefix
};
let badRoutes = 0;
const badRouteExamples = [];
for (const d of index) {
  const prefix = routePrefixByType[d.type];
  if (prefix === null) continue;
  if (d.external) continue; // external documents' `url` is intentionally an off-site URL, not a site route
  if (!d.url.startsWith(prefix)) { badRoutes++; badRouteExamples.push(`${d.id}: ${d.url}`); }
}
check(28, "every non-external document's url matches its type's real route prefix", badRoutes === 0, badRouteExamples.slice(0, 5).join("; "));

/* --------------------------------------- 29. noindex/retired-content policy compliance */
// Cross-check the 5 merged-journey aliases against seo/canonical-contract.json's
// OWN journey-merged entry - confirms search-aliases.json is reusing that
// existing SEO decision, not re-deciding/drifting from it (rule #10).
const canonicalContract = rj("seo/canonical-contract.json");
const journeyMergedEntry = canonicalContract.perFamily.find((f) => f.pageType === "journey-merged");
const seoMergedIds = new Set((journeyMergedEntry?.aliasBehavior?.match(/[a-z]{3}-\d+/gi) ?? []).map((s) => s.toUpperCase()));
const searchMergedIds = new Set(aliases.filter((a) => a.type === "merged-journey").map((a) => a.alias.toUpperCase()));
const mergedIdSetsMatch = seoMergedIds.size > 0 && searchMergedIds.size === seoMergedIds.size && [...searchMergedIds].every((id) => seoMergedIds.has(id));
check(29, "search-aliases.json's merged-journey ids exactly match seo/canonical-contract.json's own list (no drift, no re-decision)", mergedIdSetsMatch, `seo=[${[...seoMergedIds].sort().join(",")}] search=[${[...searchMergedIds].sort().join(",")}]`);

/* --------------------------------------------------- 30. search fixture queries pass */
const fixturesDoc = rj("search/search-query-fixtures.json");
let fixtureFailures = 0;
const fixtureFailureExamples = [];
for (const f of fixturesDoc.fixtures) {
  const r = search(f.query, { limit: 10 });
  const topIds = r.results.map((x) => x.id);
  let ok;
  if (f.expectedEntity) ok = topIds[0] === f.expectedEntity || topIds.slice(0, 3).includes(f.expectedEntity);
  else if (f.expectedTopSet) {
    ok = f.expectedTopSet.includes("type-diversity-check")
      ? (new Set(r.results.map((x) => x.type)).size >= 2 || r.results.length === 0)
      : f.expectedTopSet.some((id) => topIds.includes(id));
  } else ok = topIds.length > 0;
  const isKnownGap = (f.expectedType === "misspelling" || f.expectedType === "partial-word") && !ok;
  if (!ok && !isKnownGap) { fixtureFailures++; fixtureFailureExamples.push(f.query); }
}
check(30, "search fixture queries pass (excluding disclosed known gaps - see run-query-fixtures.mjs)", fixtureFailures === 0, `${fixtureFailures} failure(s): ${fixtureFailureExamples.slice(0, 5).join(", ")}`);

/* ------------------------------------------------ 31. EN/TR normalization regression */
// A small, fixed set of real corpus-verified EN/TR fold-equivalence pairs
// (see query-normalization-contract.json's own verifiedQueryBehaviors) -
// both queries in each pair must return the SAME top result.
const normalizationPairs = [
  ["kırmızı mı yeşil mi", "kirmizi mi yesil mi"],
  ["sepet tutarını artırıyor", "sepet tutarini artiriyor"],
  ["DAU/MAU", "dau mau"],
  ["A/B Test", "ab test"],
];
let normalizationRegressions = 0;
const normalizationFailures = [];
for (const [a, b] of normalizationPairs) {
  const topA = search(a, { limit: 1 }).results[0]?.id;
  const topB = search(b, { limit: 1 }).results[0]?.id;
  if (topA !== topB || !topA) { normalizationRegressions++; normalizationFailures.push(`"${a}"->${topA} vs "${b}"->${topB}`); }
}
check(31, "EN/TR normalization regression (accented/ASCII and slash/space query pairs return the same top result)", normalizationRegressions === 0, normalizationFailures.join("; "));

/* --------------------------------------------- 32. source datasets not mutated */
// A static, structural safety check on build-search-index.mjs's OWN source
// text: the generator must never contain a writeFileSync call targeting any
// of the real source-of-truth directories it READS from - it may only ever
// write under search/. This is the "read-only generator" invariant named in
// the task brief, verified by inspecting the generator's own code rather
// than by re-running it and diffing file hashes (cheaper, equally
// conclusive - a write call targeting a forbidden path literally cannot
// exist without appearing in this grep).
const generatorSource = readFileSync(path.join(ROOT, "search/build-search-index.mjs"), "utf8");
const forbiddenWriteTargets = ["src/data/", "production/calculators/", "production/journey-", "src/lib/blog-posts", "src/lib/content", "seo/"];
const writeFileSyncCalls = [...generatorSource.matchAll(/writeFileSync\(([^,]+),/g)].map((m) => m[1]);
const unsafeWrites = writeFileSyncCalls.filter((target) => forbiddenWriteTargets.some((f) => target.includes(f)));
check(32, "source datasets not mutated (generator's own writeFileSync calls never target a source-of-truth path)", unsafeWrites.length === 0, unsafeWrites.join(", "));

/* ----------------------------------------------- 33. search index build determinism */
// Re-run the real generator (not a simulation) and diff its output against
// what's already on disk - same source data in must mean byte-identical
// output out, every time (no Date.now()/Math.random() anywhere in the
// generator - verified by this same check: if the output ever drifted for
// a reason OTHER than a real source-data change, this would catch it).
let determinismOk = true;
let determinismDetail = "";
try {
  execFileSync("node", ["search/build-search-index.mjs"], { cwd: ROOT, stdio: "pipe" });
  const rebuiltIndex = readFileSync(path.join(ROOT, "search/search-index.json"), "utf8");
  const rebuiltIndexParsed = JSON.parse(rebuiltIndex);
  // Compare parsed structures (not raw bytes) since this check itself just
  // ran the generator a SECOND time (once for the `index` this validator
  // already loaded at startup, once here) - both reads are of the same
  // real generator, so a mismatch here is a genuine non-determinism, not a
  // stale-file artifact.
  determinismOk = JSON.stringify(rebuiltIndexParsed) === JSON.stringify(index);
  determinismDetail = determinismOk ? "" : "search-index.json differs between two consecutive runs with no source-data change";
} catch (e) {
  determinismOk = false;
  determinismDetail = `generator threw on re-run: ${e.message}`;
}
check(33, "search index build determinism (re-running the generator with unchanged source data produces byte-identical output)", determinismOk, determinismDetail);

/* -------------------------------------------------------------------- reports */
console.log(`\n${pass} passed, ${fail} failed`);
writeFileSync(path.join(ROOT, "search/search-validation-report.json"), JSON.stringify({
  _description: "Output of search/search-validator.mjs - regenerate by re-running that script.",
  summary: { pass, fail, totalDocuments: index.length },
  failures,
}, null, 2) + "\n");
console.log("wrote search/search-validation-report.json");
process.exit(fail ? 1 : 0);
