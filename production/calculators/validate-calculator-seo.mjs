#!/usr/bin/env node
// Deterministic validator for the Phase 3 SEO architecture. No external
// deps, same pattern as validate-calculators.mjs. Errors fail the run;
// warnings are reported and never suppressed to force a clean run.
import { readFileSync, writeFileSync } from "fs";

const dir = new URL("./", import.meta.url);
const read = (name) => JSON.parse(readFileSync(new URL(name, dir)));

const catalog = read("calculator-catalog.json").calculators;
const seoMap = read("calculator-seo-map.json").calculators;
const contentSlots = read("calculator-content-slots.json").calculators;
const cannibal = read("calculator-cannibalization-report.json");
const glossary = read("calculator-glossary-backlog.json");
const comparisons = read("calculator-comparison-backlog.json").comparisons;

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const catalogSlugs = new Set(catalog.map((c) => c.slug));
const VALID_INTENTS = new Set(["tool", "formula", "definition", "interpretation", "example", "benchmark", "comparison", "method-model", "improvement", "glossary-related-concept"]);
const VALID_PLACEMENTS = new Set(["same-page", "supporting-section", "future-glossary", "future-comparison-page", "future-guide", "skip"]);
const VALID_DEPTHS = new Set(["light", "standard", "deep"]);
const VALID_PRIORITIES = new Set(["A", "B", "C", "D"]);
const VALID_SLOTS = new Set([
  "definition", "formulaExplanation", "howToCalculate", "workedExample", "interpretation",
  "goodValue", "commonMistakes", "methodology", "assumptions", "limitations", "benchmarks",
  "comparisonLinks", "relatedMetrics", "faq",
]);

// --- every calculator has exactly one SEO record, every record maps to a real calculator ---
const seoSlugs = seoMap.map((s) => s.slug);
if (seoSlugs.length !== catalog.length) err(`SEO map has ${seoSlugs.length} records, catalog has ${catalog.length}`);
for (const c of catalog) if (!seoSlugs.includes(c.slug)) err(`${c.slug}: missing from calculator-seo-map.json`);
for (const s of seoMap) if (!catalogSlugs.has(s.slug)) err(`${s.slug}: SEO record references a slug not in catalog.json`);
const dupSeoSlugs = seoSlugs.filter((s, i) => seoSlugs.indexOf(s) !== i);
if (dupSeoSlugs.length) err(`Duplicate SEO records for: ${[...new Set(dupSeoSlugs)].join(", ")}`);

// --- per-record structural checks ---
const primaryKeywords = new Map(); // keyword -> [slugs]
for (const s of seoMap) {
  if (!VALID_DEPTHS.has(s.contentDepth)) err(`${s.slug}: invalid contentDepth "${s.contentDepth}"`);
  if (!VALID_PRIORITIES.has(s.seoPriority)) err(`${s.slug}: invalid seoPriority "${s.seoPriority}"`);
  if (/calculator\s+calculator/i.test(s.titlePattern)) err(`${s.slug}: titlePattern duplicates "Calculator"`);
  const catRec = catalog.find((c) => c.slug === s.slug);
  if (catRec && /calculator\s+calculator/i.test(catRec.name)) err(`${s.slug}: catalog name duplicates "Calculator" (Phase 2 validator should have caught this)`);

  for (const kw of s.secondaryKeywords) {
    if (!VALID_INTENTS.has(kw.intent)) err(`${s.slug}: secondary keyword "${kw.keyword}" has invalid intent "${kw.intent}"`);
    if (!VALID_PLACEMENTS.has(kw.placement)) err(`${s.slug}: secondary keyword "${kw.keyword}" has invalid placement "${kw.placement}"`);
  }
  if (!s.secondaryKeywords.some((k) => k.intent === "formula")) warn(`${s.slug}: no formula-intent secondary keyword`);
  if (s.secondaryKeywords.length > 10) warn(`${s.slug}: unusually broad secondary keyword set (${s.secondaryKeywords.length})`);
  if (s.seoPriority === "A" && s.contentDepth === "light" && s.secondaryKeywords.length < 3) {
    warn(`${s.slug}: A-priority calculator with light content depth and few secondary keywords - verify this is intentional`);
  }

  if (!primaryKeywords.has(s.primaryKeyword)) primaryKeywords.set(s.primaryKeyword, []);
  primaryKeywords.get(s.primaryKeyword).push(s.slug);

  const catForRelated = catalog.find((c) => c.slug === s.slug);
  if (catForRelated && catForRelated.relatedCalculators.length === 0) warn(`${s.slug}: no related calculators (from catalog.json) - comparisonLinks slot has nothing to point to`);

  for (const risk of s.cannibalizationRisks) {
    if (risk.with === s.slug) err(`${s.slug}: cannibalizationRisks contains a self-reference`);
    if (!catalogSlugs.has(risk.with)) err(`${s.slug}: cannibalizationRisks references unknown slug "${risk.with}"`);
  }
  for (const gId of s.futureGlossary) {
    const exists = glossary.fromPhase1Candidates.some((g) => g.id === gId) || glossary.newDiscoveries.some((g) => g.id === gId);
    if (!exists) err(`${s.slug}: futureGlossary references unknown glossary id "${gId}"`);
  }
  for (const cmpId of s.futureComparisons) {
    if (!comparisons.some((c) => c.id === cmpId)) err(`${s.slug}: futureComparisons references unknown comparison id "${cmpId}"`);
  }
}

// --- duplicate primary keyword targets (unless it's the same calculator, which can't happen given the loop above) ---
for (const [kw, slugs] of primaryKeywords) {
  if (slugs.length > 1) err(`Duplicate primaryKeyword "${kw}" across: ${slugs.join(", ")}`);
}

// --- same keyword mapped to multiple pages (secondary "same-page" keywords colliding across DIFFERENT calculators) ---
const samePageKeywordOwner = new Map();
for (const s of seoMap) {
  for (const kw of s.secondaryKeywords) {
    if (kw.placement !== "same-page") continue;
    if (samePageKeywordOwner.has(kw.keyword) && samePageKeywordOwner.get(kw.keyword) !== s.slug) {
      warn(`Keyword "${kw.keyword}" targeted as same-page by both "${samePageKeywordOwner.get(kw.keyword)}" and "${s.slug}"`);
    }
    samePageKeywordOwner.set(kw.keyword, s.slug);
  }
}

// --- very similar primary keywords (naive: same after stripping "calculator" and non-letters) ---
const normalized = new Map();
for (const s of seoMap) {
  const norm = s.primaryKeyword.replace(/\bcalculator\b/gi, "").replace(/[^a-z0-9]/gi, "");
  if (normalized.has(norm) && normalized.get(norm) !== s.slug) {
    warn(`Near-identical primary keywords: "${s.primaryKeyword}" (${s.slug}) vs "${seoMap.find((x) => x.slug === normalized.get(norm)).primaryKeyword}" (${normalized.get(norm)})`);
  } else {
    normalized.set(norm, s.slug);
  }
}

// --- content slots ---
for (const cs of contentSlots) {
  for (const slot of [...cs.required, ...cs.optional, ...cs.prohibited]) {
    if (!VALID_SLOTS.has(slot)) err(`${cs.slug}: invalid content slot name "${slot}"`);
  }
  const overlap = cs.required.filter((s) => cs.prohibited.includes(s));
  if (overlap.length) err(`${cs.slug}: slot(s) both required and prohibited: ${overlap.join(", ")}`);
}

// --- comparison backlog ---
const cmpIds = comparisons.map((c) => c.id);
const dupCmpIds = cmpIds.filter((id, i) => cmpIds.indexOf(id) !== i);
if (dupCmpIds.length) err(`Duplicate comparison ids: ${[...new Set(dupCmpIds)].join(", ")}`);
for (const c of comparisons) {
  for (const key of ["a", "b", "c"]) {
    if (!c[key]) continue;
    if (!catalogSlugs.has(c[key])) err(`Comparison "${c.id}": references unknown calculator slug "${c[key]}"`);
  }
  if (c.a === c.b) err(`Comparison "${c.id}": self-comparison (a === b)`);
}

// --- glossary backlog ---
const glossaryIds = [...glossary.fromPhase1Candidates.map((g) => g.id), ...glossary.newDiscoveries.map((g) => g.id)];
const dupGlossaryIds = glossaryIds.filter((id, i) => glossaryIds.indexOf(id) !== i);
if (dupGlossaryIds.length) err(`Duplicate glossary ids: ${[...new Set(dupGlossaryIds)].join(", ")}`);
for (const g of glossary.newDiscoveries) {
  for (const rc of g.relatedCalculators) if (!catalogSlugs.has(rc)) err(`Glossary "${g.id}": relatedCalculators references unknown slug "${rc}"`);
}

// --- cannibalization report: no dead references, no self-pairs ---
for (const p of cannibal.namedCollisions) {
  if (p.a === p.b) err(`Cannibalization pair self-reference: ${p.a}`);
  if (!catalogSlugs.has(p.a) || !catalogSlugs.has(p.b)) err(`Cannibalization pair references unknown slug: ${p.a} / ${p.b}`);
  if (!["cannibalization-risk", "adjacent-intent", "no-issue", "formula-family", "alias"].includes(p.risk)) {
    err(`Cannibalization pair ${p.a}/${p.b}: invalid risk classification "${p.risk}"`);
  }
}

const report = {
  counts: {
    seoRecords: seoMap.length,
    byContentDepth: Object.fromEntries([...VALID_DEPTHS].map((d) => [d, seoMap.filter((s) => s.contentDepth === d).length])),
    bySeoPriority: Object.fromEntries([...VALID_PRIORITIES].map((p) => [p, seoMap.filter((s) => s.seoPriority === p).length])),
    comparisons: comparisons.length,
    cannibalizationRiskPairs: cannibal.namedCollisions.filter((p) => p.risk === "cannibalization-risk").length,
    aliasPairsAutoVerified: cannibal.aliasPairsAlreadyMerged.length,
    glossaryBacklog: glossaryIds.length,
  },
  errors,
  warnings,
  status: errors.length === 0 ? "PASS" : "FAIL",
};
writeFileSync(new URL("./calculator-seo-validation-report.json", dir), JSON.stringify(report, null, 2) + "\n");

console.log(`SEO records: ${seoMap.length} | Comparisons: ${comparisons.length} | Glossary backlog: ${glossaryIds.length}`);
console.log(`Errors: ${errors.length} | Warnings: ${warnings.length}`);
if (errors.length) { console.log("\nERRORS:"); errors.forEach((e) => console.log("  - " + e)); }
if (warnings.length) { console.log("\nWARNINGS:"); warnings.forEach((w) => console.log("  - " + w)); }
process.exit(errors.length ? 1 : 0);
