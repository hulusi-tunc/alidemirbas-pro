#!/usr/bin/env node
// Journey Filter Taxonomy generator + validator, runnable directly from
// the repo root: `node production/generate-journey-filter-taxonomy.mjs`.
//
// src/canonical/*.ts uses extensionless relative imports (bundler
// resolution, standard for this repo's tsconfig) that Node's native ESM
// loader can't resolve on its own. This script never edits the real
// files: it makes a throwaway temp copy with `.ts` added to each
// relative import, executes that copy (Node 22.6+ strips TS types
// natively - no ts-node/tsx dependency needed), and deletes the temp
// copy when done. src/canonical/ itself is read-only throughout.
import { readdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const repoRoot = new URL("../", import.meta.url).pathname;
const canonicalDir = join(repoRoot, "src/canonical");
const tmp = mkdtempSync(join(tmpdir(), "canonical-run-"));

for (const f of readdirSync(canonicalDir).filter((f) => f.endsWith(".ts"))) {
  const src = readFileSync(join(canonicalDir, f), "utf8");
  const patched = src.replace(/from "(\.\/[A-Za-z0-9_-]+)"/g, 'from "$1.ts"');
  writeFileSync(join(tmp, f), patched);
}

let mod;
try {
  mod = await import(join(tmp, "index.ts"));
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

const journeys = mod.CATEGORIES.flatMap((c) => c.journeys.map((j) => ({ ...j, categoryId: c.id })));

// --- Filter 1: Category / Domain - the existing `category` field, unchanged ---
const categoryCounts = {};
for (const j of journeys) categoryCounts[j.categoryId] = (categoryCounts[j.categoryId] || 0) + 1;

// --- Filter 2: Lifecycle Stage - evidenced only for 4 category-anchored
// stages; every other category is cross-lifecycle by the corpus's own
// "domain-neutral" self-description (see journey-filter-taxonomy-audit.md). ---
const STAGE_BY_CATEGORY = {
  acquisition: "acquisition-qualification",
  activation: "activation-onboarding",
  retention: "engagement-retention",
  terminal: "ending-closure",
};
const lifecycleStage = (j) => STAGE_BY_CATEGORY[j.categoryId] || "cross-lifecycle";

// --- Filter 3: Goal / Use Case - keyword rules derived from cross-category
// name/purpose frequency analysis across all 255 journeys (see the audit
// doc's methodology section), not pre-imagined. Ordered by specificity;
// first match wins. ---
const GOAL_RULES = [
  ["eligibility-qualification", /eligib|qualif/i],
  ["consent-permission", /consent|permission|preference|contactability|opt.?(in|out)/i],
  ["identity-verification", /identit|verif|authenticat/i],
  ["expiry-renewal", /expir|renew/i],
  ["cancellation-termination", /cancel|terminat|closure|closed|close\b/i],
  ["suspension-restoration", /suspen|restor|reinstat/i],
  ["revocation-access-change", /revok|entitlement|provision|deprovision|capability|credential/i],
  ["ownership-transfer", /ownership|transfer|delegat|custody|assign\b/i],
  ["merge-consolidation", /merge|consolidat|duplicate|link(ed)?\b|split\b/i],
  ["reconciliation-correction", /reconcil|correct|mismatch|discrepan|financial obligation/i],
  ["recovery-retry", /recover|retry|resume|failure|failed/i],
  ["escalation-exception", /escalat|exception|override|violation/i],
  ["delivery-confirmation", /deliver|confirm|submit|dispatch/i],
  ["compensation-remedy", /compensat|remedy|refund|credit\b|dispute|chargeback/i],
  ["change-versioning", /version|amend|supersede|migrat|rollout|deploy|cutover/i],
  ["scheduling-commitment", /schedul|reservat|appointment|slot|booking|availability/i],
  ["decision-approval", /approv|review|decision|authoris|authoriz/i],
  ["risk-compliance", /risk|complian|polic(y|ies)|block|threshold/i],
  ["data-integrity", /\bdata\b|import|parse|backfill|transform/i],
  ["progression-milestone", /onboarding|activation|adoption|progress|queue|process(ing)?\b|execution|attendance/i],
];
function classifyGoal(j) {
  const text = j.name + " " + j.purpose;
  for (const [goal, re] of GOAL_RULES) if (re.test(text)) return goal;
  return "review-required";
}

// --- Handoff-as-primitive test ---
let mixedTerminal = 0, handoffOnlyTerminal = 0, withHandoff = 0, zeroHandoff = 0;
const handoffByCategory = {};
for (const j of journeys) {
  const kinds = j.nodes.map((n) => n.kind);
  const h = kinds.filter((k) => k === "handoff").length;
  const e = kinds.filter((k) => k === "exit").length;
  if (h === 0) zeroHandoff++; else withHandoff++;
  if (h > 0 && e > 0) mixedTerminal++;
  if (h > 0 && e === 0) handoffOnlyTerminal++;
  handoffByCategory[j.categoryId] = handoffByCategory[j.categoryId] || { total: 0, withHandoff: 0 };
  handoffByCategory[j.categoryId].total++;
  if (h > 0) handoffByCategory[j.categoryId].withHandoff++;
}
const handoffTest = { zeroHandoff, withHandoff, mixedTerminal, handoffOnlyTerminal, totalJourneys: journeys.length, byCategory: handoffByCategory };

// --- Build classification records ---
const classification = journeys.map((j) => {
  const goal = classifyGoal(j);
  return {
    id: j.id, slug: j.slug, name: j.name, category: j.categoryId,
    lifecycleStage: lifecycleStage(j),
    lifecycleStageReviewRequired: false,
    goal, goalReviewRequired: goal === "review-required",
  };
});

const goalCounts = {}, goalByCategory = {};
for (const c of classification) {
  goalCounts[c.goal] = (goalCounts[c.goal] || 0) + 1;
  goalByCategory[c.goal] = goalByCategory[c.goal] || new Set();
  goalByCategory[c.goal].add(c.category);
}
const stageCounts = {};
for (const c of classification) stageCounts[c.lifecycleStage] = (stageCounts[c.lifecycleStage] || 0) + 1;

const taxonomy = {
  _description: "Journey Filter Taxonomy (audit turn). Category/Domain reuses the existing canonical `category` field unchanged. Lifecycle Stage and Goal/Use Case are derived, evidence-based, from src/canonical/ - canonical journey data itself was never modified. Regenerate with: node production/generate-journey-filter-taxonomy.mjs",
  categoryDomain: {
    source: "existing CanonicalJourney.category field - not invented",
    values: mod.CATEGORIES.map((c) => ({ id: c.id, title: c.title, count: categoryCounts[c.id] })),
  },
  lifecycleStage: {
    source: "derived: category-anchored for acquisition/activation/retention/terminal, cross-lifecycle for the other 22 categories (self-described as 'domain-neutral' in their own purpose text)",
    values: Object.entries(stageCounts).map(([id, count]) => ({ id, count })),
  },
  goalUseCase: {
    source: "derived from cross-category name/purpose keyword frequency analysis across all 255 journeys - not pre-imagined",
    values: Object.entries(goalCounts)
      .filter(([id]) => id !== "review-required")
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ id, count, categorySpread: [...(goalByCategory[id] || [])].length })),
    reviewRequiredCount: goalCounts["review-required"] || 0,
  },
};

writeFileSync(join(repoRoot, "production/journey-filter-taxonomy.json"), JSON.stringify(taxonomy, null, 2) + "\n");
writeFileSync(join(repoRoot, "production/journey-filter-classification.json"), JSON.stringify({
  _description: "Per-journey classification for the 3 filters. Canonical id/slug/graph untouched - this is a separate metadata layer, never merged back into src/canonical/.",
  count: classification.length,
  journeys: classification,
}, null, 2) + "\n");

// --- Validation ---
const errors = [], warnings = [];
const EXPECTED_COUNT = 255;
if (classification.length !== EXPECTED_COUNT) errors.push(`Classified ${classification.length} journeys, expected ${EXPECTED_COUNT}`);
const seen = new Set();
for (const j of classification) {
  if (seen.has(j.id)) errors.push(`Duplicate journey id: ${j.id}`);
  seen.add(j.id);
}
const smallGoals = taxonomy.goalUseCase.values.filter((v) => v.count < 4);
if (smallGoals.length) warnings.push(`Goal values with <4 journeys (kept distinct on purpose, see audit doc): ${smallGoals.map((v) => `${v.id}(${v.count})`).join(", ")}`);
const lopsided = taxonomy.lifecycleStage.values.find((v) => v.count / EXPECTED_COUNT > 0.7);
if (lopsided) warnings.push(`lifecycleStage "${lopsided.id}" holds ${lopsided.count}/${EXPECTED_COUNT} (${Math.round(100 * lopsided.count / EXPECTED_COUNT)}%) - real but lopsided, see audit doc`);
const reviewCount = taxonomy.goalUseCase.reviewRequiredCount;
if (reviewCount / EXPECTED_COUNT > 0.15) warnings.push(`${reviewCount}/${EXPECTED_COUNT} journeys review-required (${Math.round(100 * reviewCount / EXPECTED_COUNT)}%) - re-check the goal ruleset`);

const report = {
  counts: {
    totalJourneys: classification.length,
    categoryValues: taxonomy.categoryDomain.values.length,
    lifecycleStageValues: taxonomy.lifecycleStage.values.length,
    goalValues: taxonomy.goalUseCase.values.length,
    reviewRequired: reviewCount,
  },
  handoffPrimitiveTest: handoffTest,
  errors, warnings,
  status: errors.length === 0 ? "PASS" : "FAIL",
};
writeFileSync(join(repoRoot, "production/journey-filter-validation-report.json"), JSON.stringify(report, null, 2) + "\n");

console.log(JSON.stringify(report.counts, null, 2));
console.log(`Errors: ${errors.length} | Warnings: ${warnings.length}`);
if (errors.length) { console.log("ERRORS:"); errors.forEach((e) => console.log("  - " + e)); }
if (warnings.length) { console.log("WARNINGS:"); warnings.forEach((w) => console.log("  - " + w)); }
process.exit(errors.length ? 1 : 0);
