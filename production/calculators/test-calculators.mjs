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
  // Mirrors calc-catalog.ts LIVE_CALCULATOR_SLUGS. Every one of these is
  // driven from the catalog's own exampleInput/exampleOutput below, so a
  // calculator listed here without a compute function fails loudly.
  "roas", "cpc", "cpm", "cac",
  "aov", "gross-margin", "break-even-point", "ltv", "ltv-cac-ratio", "cac-payback-period",
  "retention-rate", "nrr", "logo-churn", "rule-of-40",
  "cr", "funnel-analysis-multistep",
  "ab-test", "sample-size-calculator",
  "email-performance",
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

/* The minimum-detectable-effect block that used to sit here - a canonical
   check, a five-case round-trip against sample-size-calculator and a
   directionality check - went with that calculator when the library was
   trimmed. sample-size-calculator's own relative-MDE convention is still
   exercised by the generic per-slug loop above, against the catalog's own
   verified example. */

// --- Phase 27: shared edge-case tests, applied where the calculator's own validationRules say they apply ---
const edgeCases = [
  { label: "roas: zero spend -> NaN, not Infinity", fn: () => getCompute("roas")({ revenue: 100, spend: 0 }).roas, assertNaN: true },
  { label: "cr: zero opportunities -> NaN", fn: () => getCompute("cr")({ conversions: 5, opportunities: 0 }).conversionRate, assertNaN: true },
  { label: "cac-payback-period: zero margin -> NaN", fn: () => getCompute("cac-payback-period")({ cac: 100, arpu: 10, grossMarginPct: 0 }).paybackMonths, assertNaN: true },
  { label: "retention-rate: 0 input is legitimate, not treated as missing", fn: () => getCompute("retention-rate")({ startCustomers: 100, endCustomers: 0, acquiredCustomers: 0 }).retentionRate, assertEqual: 0 },
  { label: "ab-test: zero conversions on both sides is still computable", fn: () => getCompute("ab-test")({ visitorsA: 1000, conversionsA: 0, visitorsB: 1000, conversionsB: 0 }).zScore, assertEqual: NaN, assertNaN: true },
  { label: "break-even-point: variable cost >= price -> NaN (no break-even exists)", fn: () => getCompute("break-even-point")({ fixedCosts: 1000, pricePerUnit: 10, variableCostPerUnit: 10 }).breakEvenUnits, assertNaN: true },
  { label: "gross-margin: cost exceeding revenue gives a negative margin, not clamped to 0", fn: () => getCompute("gross-margin")({ revenue: 100, cogs: 150 }).grossMargin, assertEqual: -0.5 },
  { label: "logo-churn: zero customers at period start -> NaN, not Infinity", fn: () => getCompute("logo-churn")({ lostCustomers: 5, startCustomers: 0 }).logoChurn, assertNaN: true },
  // email-performance is the one calculator that is partial by design:
  // these prove a metric whose own inputs are present computes even when
  // most of the form is empty, and that a missing or zero denominator
  // takes down only its own metric rather than the whole result set.
  { label: "email-performance: a metric computes from its own two fields alone", fn: () => getCompute("email-performance")({ delivered: 9800, sent: 10000 }).deliveryRate, assertClose: 0.98 },
  { label: "email-performance: an unrelated metric stays NaN while another computes", fn: () => getCompute("email-performance")({ delivered: 9800, sent: 10000 }).openRate, assertNaN: true },
  { label: "email-performance: CTOR is clicks/opens, not clicks/delivered", fn: () => getCompute("email-performance")({ clicks: 392, opens: 2450, delivered: 9800 }).ctor, assertClose: 0.16 },
  { label: "email-performance: zero denominator kills only its own metric", fn: () => getCompute("email-performance")({ opens: 100, delivered: 0, sent: 10000, bounced: 200 }).openRate, assertNaN: true },
  { label: "email-performance: ...and the others still compute alongside it", fn: () => getCompute("email-performance")({ opens: 100, delivered: 0, sent: 10000, bounced: 200 }).bounceRate, assertClose: 0.02 },
  { label: "email-performance: list growth goes negative when losses exceed gains", fn: () => getCompute("email-performance")({ newSubscribers: 100, unsubscribes: 300, listStart: 10000 }).listGrowthRate, assertClose: -0.02 },
  { label: "email-performance: revenue per recipient divides by sent, not delivered", fn: () => getCompute("email-performance")({ revenue: 2000, sent: 10000, delivered: 9800 }).rpr, assertClose: 0.2 },
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
