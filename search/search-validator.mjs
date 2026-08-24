#!/usr/bin/env node
// Re-runnable validator for the search/ data layer. No external deps.
// Run: node search/search-validator.mjs
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

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

/* -------------------------------------------------------------------- reports */
console.log(`\n${pass} passed, ${fail} failed`);
writeFileSync(path.join(ROOT, "search/search-validation-report.json"), JSON.stringify({
  _description: "Output of search/search-validator.mjs - regenerate by re-running that script.",
  summary: { pass, fail, totalDocuments: index.length },
  failures,
}, null, 2) + "\n");
console.log("wrote search/search-validation-report.json");
process.exit(fail ? 1 : 0);
