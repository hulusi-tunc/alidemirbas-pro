#!/usr/bin/env node
// Deterministic validator for the Marketing Calculator Library dataset.
// No external deps. Re-runnable regression harness, mirrors the style of
// validate-seo-metadata.mjs / validate-journey-production.mjs already in
// this production/ folder. Errors fail the run; warnings are reported but
// never suppressed or "fixed" by changing the data to make them go away.
import { readFileSync, writeFileSync } from "fs";

const dir = new URL("./", import.meta.url);
const read = (name) => JSON.parse(readFileSync(new URL(name, dir)));

const taxonomy = read("calculator-taxonomy.json");
const candidatesDoc = read("calculator-candidates.json");
const familiesDoc = read("calculator-formula-families.json");
const catalogDoc = read("calculator-catalog.json");

const candidates = candidatesDoc.candidates;
const families = familiesDoc.families;
const catalog = catalogDoc.calculators;

const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

const validCategories = new Set(taxonomy.categories.map((c) => c.id));
const validSubcategories = new Set(
  taxonomy.categories.flatMap((c) => c.subcategories.map((s) => `${c.id}/${s.id}`))
);
const validFamilyIds = new Set(families.map((f) => f.id));

// --- candidates.json checks ---
const candIds = candidates.map((c) => c.id);
const candIdSet = new Set(candIds);
const dupCandIds = candIds.filter((id, i) => candIds.indexOf(id) !== i);
if (dupCandIds.length) err(`Duplicate candidate ids: ${[...new Set(dupCandIds)].join(", ")}`);

for (const c of candidates) {
  if (!validCategories.has(c.category)) err(`${c.id}: unknown category "${c.category}"`);
  if (c.subcategory && !validSubcategories.has(`${c.category}/${c.subcategory}`)) {
    err(`${c.id}: subcategory "${c.subcategory}" not defined under category "${c.category}"`);
  }
  if (!["calculator", "calculator-educational", "glossary", "duplicate-variant", "skip"].includes(c.classification)) {
    err(`${c.id}: invalid classification "${c.classification}"`);
  }
  if (c.classification === "duplicate-variant") {
    if (!c.dup) err(`${c.id}: classification is duplicate-variant but dup is null`);
    else if (!candIdSet.has(c.dup)) err(`${c.id}: dup points to unknown id "${c.dup}"`);
    else if (c.dup === c.id) err(`${c.id}: dup self-reference`);
  } else if (c.dup) {
    err(`${c.id}: dup is set but classification is "${c.classification}", not duplicate-variant`);
  }
}

// --- formula-families.json checks ---
const famMemberOf = new Map(); // candidate id -> family id (standalone/keptSeparate)
const famFoldedInto = new Map(); // candidate id -> family id (foldedVariants)
for (const f of families) {
  if (!f.id || !f.shape || !f.decision) err(`Family missing id/shape/decision: ${JSON.stringify(f).slice(0, 60)}`);
  for (const id of [...f.standaloneCalculators, ...(f.keptSeparate || [])]) {
    if (!candIdSet.has(id)) err(`Family ${f.id}: standalone/keptSeparate references unknown candidate "${id}"`);
    if (famMemberOf.has(id)) err(`Family ${f.id}: "${id}" already claimed by family ${famMemberOf.get(id)} as standalone`);
    famMemberOf.set(id, f.id);
  }
  for (const id of f.foldedVariants) {
    if (!candIdSet.has(id)) err(`Family ${f.id}: foldedVariants references unknown candidate "${id}"`);
    if (famFoldedInto.has(id)) err(`Family ${f.id}: "${id}" already folded by family ${famFoldedInto.get(id)}`);
    famFoldedInto.set(id, f.id);
    const c = candidates.find((x) => x.id === id);
    if (c && c.classification !== "duplicate-variant") {
      err(`Family ${f.id}: "${id}" is in foldedVariants but candidates.json classifies it as "${c.classification}", not duplicate-variant`);
    }
  }
}
for (const c of candidates) {
  if (c.classification === "calculator" || c.classification === "calculator-educational") {
    if (!famMemberOf.has(c.id)) err(`${c.id}: classification "${c.classification}" but not listed in any family's standaloneCalculators/keptSeparate`);
  }
  if (c.classification === "duplicate-variant" && !famFoldedInto.has(c.id)) {
    err(`${c.id}: classification duplicate-variant but not listed in any family's foldedVariants`);
  }
}

// --- catalog.json checks (Phase 12 required checks) ---
const catIds = catalog.map((c) => c.id);
const catSlugs = catalog.map((c) => c.slug);
const dupCatIds = catIds.filter((id, i) => catIds.indexOf(id) !== i);
if (dupCatIds.length) err(`Duplicate catalog ids: ${[...new Set(dupCatIds)].join(", ")}`);
const dupSlugs = catSlugs.filter((s, i) => catSlugs.indexOf(s) !== i);
if (dupSlugs.length) err(`Duplicate catalog slugs: ${[...new Set(dupSlugs)].join(", ")}`);

const catalogSlugSet = new Set(catSlugs);
for (const c of catalog) {
  if (/\bcalculator\s+calculator\b/i.test(c.name)) err(`${c.slug}: name has a doubled "Calculator" suffix: "${c.name}"`);
  if (!validCategories.has(c.category)) err(`${c.slug}: unknown category "${c.category}"`);
  if (c.subcategory && !validSubcategories.has(`${c.category}/${c.subcategory}`)) {
    err(`${c.slug}: subcategory "${c.subcategory}" not defined under category "${c.category}"`);
  }
  if (/(^-|-$|--)/.test(c.slug)) err(`${c.slug}: slug has a leading/trailing/double hyphen`);
  if (!["P0", "P1", "P2", "P3"].includes(c.priority)) err(`${c.slug}: invalid priority "${c.priority}"`);
  if (!["calculator", "calculator-educational"].includes(c.classification)) err(`${c.slug}: invalid classification "${c.classification}"`);
  if (!c.inputs || !c.inputs.length) err(`${c.slug}: no inputs defined`);
  if (!c.outputs || !c.outputs.length) err(`${c.slug}: no outputs defined`);
  for (const rel of c.relatedCalculators) {
    if (rel === c.slug) err(`${c.slug}: relatedCalculators contains a self-reference`);
    if (!catalogSlugSet.has(rel)) err(`${c.slug}: relatedCalculators references unknown slug "${rel}"`);
  }
  if (!validFamilyIds.has(c.formulaFamily)) err(`${c.slug}: formulaFamily "${c.formulaFamily}" not defined in calculator-formula-families.json`);
  if (!c.exampleInput || !Object.keys(c.exampleInput).length) err(`${c.slug}: exampleInput is empty`);
  if (!c.exampleOutput || !Object.keys(c.exampleOutput).length) err(`${c.slug}: exampleOutput is empty`);
}

// --- warnings (Phase 12: reported, never silently resolved) ---
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
for (let i = 0; i < catalog.length; i++) {
  for (let j = i + 1; j < catalog.length; j++) {
    const a = catalog[i], b = catalog[j];
    if (norm(a.name) === norm(b.name)) warn(`Near-identical calculator names: "${a.name}" (${a.slug}) vs "${b.name}" (${b.slug})`);
    if (a.formula.trim() === b.formula.trim() && a.formulaFamily !== b.formulaFamily) {
      warn(`Identical formula string across different families: ${a.slug} (${a.formulaFamily}) vs ${b.slug} (${b.formulaFamily})`);
    }
  }
}
for (const c of catalog) {
  if (c.inputs.length >= 5) warn(`${c.slug}: unusually many inputs (${c.inputs.length}) - consider whether this should split into modes`);
  if (c.relatedCalculators.length === 0) warn(`${c.slug}: no related calculators listed - isolated node in the relationship graph`);
}
// alias collisions across different calculators
const aliasOwner = new Map();
for (const c of catalog) {
  for (const a of c.aliases) {
    const key = norm(a);
    if (aliasOwner.has(key) && aliasOwner.get(key) !== c.slug) {
      warn(`Alias "${a}" listed under both "${aliasOwner.get(key)}" and "${c.slug}"`);
    }
    aliasOwner.set(key, c.slug);
  }
}
// LTV: documented multi-model ambiguity - warn if the doc note ever gets lost, don't hide it
const ltv = catalog.find((c) => c.slug === "ltv");
if (ltv && !/model/i.test(ltv.formulaPlainEnglish)) {
  warn("ltv: formulaPlainEnglish no longer flags that multiple LTV models exist - re-check calculator-architecture.md Phase 5 note");
}

const report = {
  generatedAt: "static (re-run to refresh)",
  counts: {
    candidates: candidates.length,
    families: families.length,
    catalog: catalog.length,
    byClassification: Object.fromEntries(
      ["calculator", "calculator-educational", "glossary", "duplicate-variant", "skip"].map((k) => [
        k, candidates.filter((c) => c.classification === k).length,
      ])
    ),
    byPriority: Object.fromEntries(
      ["P0", "P1", "P2", "P3"].map((k) => [k, catalog.filter((c) => c.priority === k).length])
    ),
  },
  errors,
  warnings,
  status: errors.length === 0 ? "PASS" : "FAIL",
};

writeFileSync(new URL("./calculator-validation-report.json", dir), JSON.stringify(report, null, 2) + "\n");

console.log(`Candidates: ${candidates.length} | Families: ${families.length} | Catalog: ${catalog.length}`);
console.log(`Errors: ${errors.length} | Warnings: ${warnings.length}`);
if (errors.length) {
  console.log("\nERRORS:");
  errors.forEach((e) => console.log("  - " + e));
}
if (warnings.length) {
  console.log("\nWARNINGS:");
  warnings.forEach((w) => console.log("  - " + w));
}
process.exit(errors.length ? 1 : 0);
