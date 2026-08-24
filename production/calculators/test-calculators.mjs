#!/usr/bin/env node
// Deterministic mathematical verification for the calculation engine
// (src/lib/calc-registry.ts). Zero external deps - Node's native TS
// support (v22.6+ with type stripping, default in v23+) runs the .ts
// module directly via relative import, so no test framework or
// transpile step is needed (Phase 2 §31: don't add dependency weight
// for arithmetic this simple to verify). Run: node production/calculators/test-calculators.mjs
import { readFileSync } from "fs";
import { getCompute } from "../../src/lib/calc-registry.ts";

const catalog = JSON.parse(readFileSync(new URL("./calculator-catalog.json", import.meta.url))).calculators;

const LIVE_SLUGS = [
  "roas", "marketing-roi", "ctr", "cpc", "cpm", "cpa", "cpl", "cac", "aov",
  "gross-margin", "retention-rate", "open-rate", "nrr", "ltv", "ltv-cac-ratio",
  "cac-payback-period", "cr", "ab-test",
  "activation-rate", "mrr", "funnel-analysis-multistep", "sample-size-calculator",
  "revenue-per-visitor", "contribution-margin", "break-even-point",
  "dau-mau-stickiness", "d1-retention", "saas-quick-ratio", "rule-of-40",
  "cart-abandonment", "confidence-interval-calculator", "test-duration-estimator",
  "profit-margin", "engagement-rate",
  "logo-churn", "ctor",
];

let pass = 0, fail = 0;
const failures = [];

function parseExpected(v, unit) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return unit === "%" ? v / 100 : v;
  const cleaned = String(v).replace(/,/g, "");
  const num = parseFloat(cleaned);
  if (Number.isNaN(num)) return v;
  return unit === "%" ? num / 100 : num;
}

function tolerance(unit) {
  if (unit === "%") return 0.0015; // 0.15 percentage points
  if (unit === "count") return 6; // sample-size rounding from 4-decimal z constants
  return 0.06;
}

function check(label, actual, expected, unit) {
  if (typeof expected === "boolean") {
    if (actual === expected) { pass++; return; }
    fail++; failures.push(`${label}: expected ${expected}, got ${actual}`);
    return;
  }
  const exp = parseExpected(expected, unit);
  if (typeof exp !== "number" || Number.isNaN(exp)) return; // non-numeric expected (e.g. free text), skip
  const act = typeof actual === "number" ? actual : NaN;
  if (Number.isFinite(act) && Math.abs(act - exp) <= tolerance(unit)) {
    pass++;
  } else {
    fail++;
    failures.push(`${label}: expected ${exp} (from "${expected}"), got ${act}`);
  }
}

// --- Phase 26: one hard verification per live calculator, from exampleInput/exampleOutput ---
for (const slug of LIVE_SLUGS) {
  const spec = catalog.find((c) => c.slug === slug);
  if (!spec) { fail++; failures.push(`${slug}: not found in catalog.json`); continue; }
  const compute = getCompute(slug);
  if (!compute) { fail++; failures.push(`${slug}: no compute function registered`); continue; }

  if (slug === "funnel-analysis-multistep") {
    const result = compute({ stages: spec.exampleInput.stages });
    check(`${slug}.overallConversion`, result.overallConversion, spec.exampleOutput.overallConversion, "%");
    spec.exampleOutput.stepConversions.forEach((exp, i) => {
      check(`${slug}.stepConversions[${i}]`, result.stepConversions[i]?.value, exp, "%");
    });
    continue;
  }

  // exampleInput is authored as what a human types into the form (e.g.
  // grossMarginPct: 75 for 75%) - the real UI divides "%"-unit fields by
  // 100 before calling compute() (see calc-format.ts parseField), so the
  // test replicates that same conversion rather than feeding raw catalog
  // numbers straight into a function that expects decimals.
  const computeInput = { ...spec.exampleInput };
  for (const inp of spec.inputs) {
    if (inp.unit === "%" && typeof computeInput[inp.key] === "number") computeInput[inp.key] = computeInput[inp.key] / 100;
  }
  const result = compute(computeInput);
  for (const out of spec.outputs) {
    if (!(out.key in spec.exampleOutput)) continue;
    check(`${slug}.${out.key}`, result[out.key], spec.exampleOutput[out.key], out.unit);
  }
}

// --- Phase 28: every LTV mode tested independently, not just the default ---
{
  const ltvSpec = catalog.find((c) => c.slug === "ltv");
  const compute = getCompute("ltv");
  const modeTests = [
    { mode: "simple", input: { aov: 60, purchaseFrequency: 4, customerLifespan: 3 }, expect: 720 },
    { mode: "margin-adjusted", input: { aov: 60, purchaseFrequency: 4, grossMarginPct: 0.6, churnRate: 0.2 }, expect: 720 },
    { mode: "mobile-arpdau", input: { arpdau: 0.2, avgLifetimeDays: 400 }, expect: 80 },
  ];
  for (const t of modeTests) {
    const r = compute(t.input);
    check(`ltv[${t.mode}]`, r.ltv, t.expect, "currency");
  }
  void ltvSpec;
}

// --- Batch 04: minimum-detectable-effect - deliberately NOT run through the
// generic per-slug loop above. calculator-catalog.json's own exampleOutput
// for this slug (mde: "25.30%") is stale against the RELATIVE-MDE
// convention this implementation uses (documented in calc-registry.ts and
// production/calculators/content/minimum-detectable-effect.json's
// qaNotes) - the generic loop's 0.15-percentage-point tolerance for "%"
// units would fail against that stale value even though the
// implementation is correct. Verified here instead with a tighter,
// independently-derived tolerance, plus round-trip and directionality
// checks the generic loop doesn't do for any slug. ---
{
  const mdeCompute = getCompute("minimum-detectable-effect");
  const sampleSizeCompute = getCompute("sample-size-calculator");

  // Canonical catalog example (baselineRate 5%, samplePerVariant 5000,
  // power 80, significanceLevel 95) - independently re-derived by hand
  // (see chat) as 24.42%, not the catalog's stale 25.30%.
  const canonical = mdeCompute({ baselineRate: 0.05, samplePerVariant: 5000, power: 80, significanceLevel: 95 });
  check("minimum-detectable-effect.mde (canonical, independently verified)", canonical.mde, 24.42, "%");

  // Round-trip: sample-size-calculator(baseline, relMDE, power, sig) -> n,
  // then minimum-detectable-effect(baseline, n, power, sig) -> relMDE
  // should reproduce the original relMDE within sample-size rounding
  // tolerance (Math.ceil on n is the only source of drift). Five cases
  // spanning low/moderate/high baseline, small/large MDE, and every
  // supported power/significance combination.
  const roundTripCases = [
    { label: "low baseline 1%, relMDE 20%, power 80, sig 95", baselineRate: 0.01, mde: 0.20, power: 80, significanceLevel: 95 },
    { label: "moderate baseline 10%, relMDE 15%, power 80, sig 95", baselineRate: 0.10, mde: 0.15, power: 80, significanceLevel: 95 },
    { label: "baseline 5%, relMDE 10%, power 90, sig 99 (smaller MDE -> larger n)", baselineRate: 0.05, mde: 0.10, power: 90, significanceLevel: 99 },
    { label: "baseline 5%, relMDE 30%, power 80, sig 90 (larger MDE -> smaller n)", baselineRate: 0.05, mde: 0.30, power: 80, significanceLevel: 90 },
    { label: "high baseline 20%, relMDE 5%, power 80, sig 95", baselineRate: 0.20, mde: 0.05, power: 80, significanceLevel: 95 },
  ];
  for (const c of roundTripCases) {
    const n = sampleSizeCompute({ baselineRate: c.baselineRate, mde: c.mde, power: c.power, significanceLevel: c.significanceLevel }).samplePerVariant;
    const back = mdeCompute({ baselineRate: c.baselineRate, samplePerVariant: n, power: c.power, significanceLevel: c.significanceLevel }).mde;
    check(`minimum-detectable-effect round-trip: ${c.label}`, back, c.mde * 100, "%");
  }

  // Directionality: same baseline/power/significance, larger sample ->
  // smaller (monotonically decreasing) detectable relative MDE.
  const samplesAscending = [1000, 5000, 20000, 100000];
  const mdesForSamples = samplesAscending.map((n) => mdeCompute({ baselineRate: 0.05, samplePerVariant: n, power: 80, significanceLevel: 95 }).mde);
  let monotonic = true;
  for (let i = 1; i < mdesForSamples.length; i++) if (!(mdesForSamples[i] < mdesForSamples[i - 1])) monotonic = false;
  if (monotonic) pass++;
  else { fail++; failures.push(`minimum-detectable-effect directionality: expected strictly decreasing MDE as sample grows, got ${JSON.stringify(mdesForSamples)}`); }
}

// --- Phase 27: shared edge-case tests, applied where the calculator's own validationRules say they apply ---
const edgeCases = [
  { label: "roas: zero spend -> NaN, not Infinity", fn: () => getCompute("roas")({ revenue: 100, spend: 0 }).roas, assertNaN: true },
  { label: "cr: zero opportunities -> NaN", fn: () => getCompute("cr")({ conversions: 5, opportunities: 0 }).conversionRate, assertNaN: true },
  { label: "cac-payback-period: zero margin -> NaN", fn: () => getCompute("cac-payback-period")({ cac: 100, arpu: 10, grossMarginPct: 0 }).paybackMonths, assertNaN: true },
  { label: "retention-rate: 0 input is legitimate, not treated as missing", fn: () => getCompute("retention-rate")({ startCustomers: 100, endCustomers: 0, acquiredCustomers: 0 }).retentionRate, assertEqual: 0 },
  { label: "ab-test: zero conversions on both sides is still computable", fn: () => getCompute("ab-test")({ visitorsA: 1000, conversionsA: 0, visitorsB: 1000, conversionsB: 0 }).zScore, assertEqual: NaN, assertNaN: true },
  { label: "break-even-point: variable cost >= price -> NaN (no break-even exists)", fn: () => getCompute("break-even-point")({ fixedCosts: 1000, pricePerUnit: 10, variableCostPerUnit: 10 }).breakEvenUnits, assertNaN: true },
  { label: "mrr: negative-growth (contraction) is valid, not clamped", fn: () => getCompute("mrr")({ currentMrr: 40000, priorMrr: 50000 }).mrrGrowthRate, assertEqual: -0.2 },
  { label: "gross-margin: cost exceeding revenue gives a negative margin, not clamped to 0", fn: () => getCompute("gross-margin")({ revenue: 100, cogs: 150 }).grossMargin, assertEqual: -0.5 },
  { label: "d1-retention: decimal inputs still compute a valid rate", fn: () => getCompute("d1-retention")({ usersReturnedOnDayN: 333, cohortSize: 1000 }).retentionN, assertClose: 0.333 },
  { label: "logo-churn: zero customers at period start -> NaN, not Infinity", fn: () => getCompute("logo-churn")({ lostCustomers: 5, startCustomers: 0 }).logoChurn, assertNaN: true },
  { label: "test-duration-estimator: raw day count is rounded UP to a full week", fn: () => getCompute("test-duration-estimator")({ requiredSamplePerVariant: 29827, dailyTrafficPerVariant: 1000 }).days, assertEqual: 35 },
];
for (const ec of edgeCases) {
  const v = ec.fn();
  if (ec.assertNaN) {
    if (Number.isNaN(v)) pass++; else { fail++; failures.push(`${ec.label}: expected NaN, got ${v}`); }
  } else if (ec.assertClose !== undefined) {
    if (Math.abs(v - ec.assertClose) < 0.001) pass++; else { fail++; failures.push(`${ec.label}: expected ~${ec.assertClose}, got ${v}`); }
  } else if (ec.assertEqual !== undefined) {
    if (Number.isNaN(ec.assertEqual) ? Number.isNaN(v) : Math.abs(v - ec.assertEqual) < 0.0001) pass++;
    else { fail++; failures.push(`${ec.label}: expected ${ec.assertEqual}, got ${v}`); }
  }
}

console.log(`Calculators tested: ${LIVE_SLUGS.length} | Edge cases: ${edgeCases.length}`);
console.log(`PASS: ${pass}  FAIL: ${fail}`);
if (failures.length) {
  console.log("\nFAILURES:");
  failures.forEach((f) => console.log("  - " + f));
}
process.exit(fail ? 1 : 0);
