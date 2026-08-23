// Phase 4.5 audit artifact: a dry structural simulation of all 77
// catalog calculators against the current content system, WITHOUT
// writing any content (instruction 37). Flags which calculators would
// need special handling under the rules as they stand, before any of
// them get written.
import { readFileSync, writeFileSync } from "fs";

const dir = new URL("./", import.meta.url);
const read = (name) => JSON.parse(readFileSync(new URL(name, dir)));

const catalog = read("calculator-catalog.json").calculators;
const seoMap = read("calculator-seo-map.json").calculators;
const bySlug = Object.fromEntries(seoMap.map((s) => [s.slug, s]));

const DONE_13 = new Set([
  "cr", "roas", "ctr", "cac", "ltv", "ltv-cac-ratio", "cac-payback-period",
  "aov", "gross-margin", "retention-rate", "nrr", "ab-test", "sample-size-calculator",
]);
const LIVE_34 = new Set([
  "roas", "marketing-roi", "ctr", "cpc", "cpm", "cpa", "cpl", "cac", "aov",
  "gross-margin", "retention-rate", "open-rate", "nrr", "ltv", "ltv-cac-ratio",
  "cac-payback-period", "cr", "ab-test", "activation-rate", "mrr",
  "funnel-analysis-multistep", "sample-size-calculator", "revenue-per-visitor",
  "contribution-margin", "break-even-point", "dau-mau-stickiness", "d1-retention",
  "saas-quick-ratio", "rule-of-40", "cart-abandonment", "confidence-interval-calculator",
  "test-duration-estimator", "profit-margin", "engagement-rate",
]);
// Calculators whose experimentation-category "deep" classification is
// backed by genuine statistical methodology (distributions, hypothesis
// tests, power). test-duration-estimator is intentionally excluded -
// see calculator-content-system-audit.md's depth-model finding.
const GENUINELY_STATISTICAL = new Set([
  "ab-test", "sample-size-calculator", "confidence-interval-calculator",
  "minimum-detectable-effect", "bayesian-probability-to-beat",
  "multi-variant-test-significance", "srm-check",
]);

const rows = catalog.map((c) => {
  const sm = bySlug[c.slug];
  const notes = [];
  if (c.modes) notes.push("needs a models-type section + examplesByMode (only LTV needs this today)");
  if (c.outputs.length >= 2) notes.push(`multi-output (${c.outputs.length}) - verify generic interpretation covers all outputs or needs per-output notes`);
  if (c.inputs.some((i) => i.unit && i.unit.startsWith("array"))) notes.push("array/dynamic input - needs an input-format explanation beyond the standard scalar-field slots");
  if (sm.cannibalizationRisks.length > 0) notes.push("has a flagged cannibalization risk - comparison-note required under the conditional rule");
  if (sm.contentDepth === "deep" && c.category === "experimentation" && !GENUINELY_STATISTICAL.has(c.slug)) {
    notes.push("deep-by-category-blanket-rule but check actual methodological complexity before writing (see test-duration-estimator finding)");
  }
  return {
    slug: c.slug,
    priority: c.priority,
    status: LIVE_34.has(c.slug) ? (DONE_13.has(c.slug) ? "content-done" : "live-no-content-yet") : "not-implemented",
    contentDepth: sm.contentDepth,
    fitStatus: notes.length === 0 ? "clean-fit" : "special-handling",
    notes,
  };
});

const summary = {
  total: rows.length,
  cleanFit: rows.filter((r) => r.fitStatus === "clean-fit").length,
  specialHandling: rows.filter((r) => r.fitStatus === "special-handling").length,
  byStatus: Object.fromEntries(
    ["content-done", "live-no-content-yet", "not-implemented"].map((s) => [s, rows.filter((r) => r.status === s).length])
  ),
};

writeFileSync(new URL("./calculator-content-stress-test.json", dir), JSON.stringify({
  _description: "Phase 4.5 dry simulation of the content system against all 77 catalog calculators. No content was written for this - it only flags which calculators the CURRENT rules would need to special-case before writing (instruction 37).",
  summary,
  calculators: rows,
}, null, 2) + "\n");

console.log(JSON.stringify(summary, null, 2));
