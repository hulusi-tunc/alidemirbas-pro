/* Pure calculation engine - deterministic, framework-free, no React.
   One function per live calculator slug (see calc-catalog.ts
   LIVE_CALCULATOR_SLUGS). Inputs are already-parsed numbers (percentage
   fields arrive as 0-1 decimals, see calc-format.ts parseField); outputs
   are raw numbers/booleans/strings in the scale calc-format.ts expects
   (percentage-point outputs are already in "points" scale, not decimal -
   see the file header note there). This module has zero dependencies -
   no stats/math library - every distribution value needed (z-scores for
   fixed confidence/power levels) is a standard, citable constant, not a
   numerically-solved one, so pulling in a stats package would be dead
   weight for the arithmetic this batch actually needs (Phase 2 §31). */

// Deliberately loose: inputs are a dynamic bag whose shape differs per
// calculator (plain numbers for most, one JSON-encoded array field for
// the funnel tool). Each function below narrows what it actually reads;
// callers build this object from already-validated form values.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComputeInputs = Record<string, any>;
export type ComputeOutputs = Record<string, number | boolean | string | unknown[]>;
export type ComputeFn = (inputs: ComputeInputs) => ComputeOutputs;

const div = (a: number, b: number): number => (b === 0 ? NaN : a / b);

// Standard normal two-tailed z-values for the fixed confidence levels this
// batch's enum inputs offer, and one-tailed z-values for the fixed power
// levels offered. Textbook constants (e.g. Cohen, Statistical Power
// Analysis), not derived - see calculator-architecture.md Phase 2 note.
const Z_ALPHA_TWO_TAILED: Record<string, number> = { "90": 1.645, "95": 1.96, "99": 2.576 };
const Z_BETA_ONE_TAILED: Record<string, number> = { "80": 0.8416, "90": 1.2816 };

const REGISTRY: Record<string, ComputeFn> = {
  roas: ({ revenue, spend }) => ({ roas: div(revenue, spend) }),
  cpc: ({ spend, clicks }) => ({ cpc: div(spend, clicks) }),
  cpm: ({ spend, impressions }) => ({ cpm: div(spend, impressions) * 1000 }),
  cac: ({ spend, customers }) => ({ cac: div(spend, customers) }),
  aov: ({ revenue, orders }) => ({ aov: div(revenue, orders) }),
  "gross-margin": ({ revenue, cogs }) => ({ grossMargin: div(revenue - cogs, revenue) }),
  /* The eight email metrics, from one input set. Each is the same formula
     the eight retired single-metric calculators used - open-rate, ctor,
     delivery-rate, bounce-rate-email, unsubscribe-rate, complaint-rate,
     list-growth-rate and revenue-per-recipient - not a re-derivation; only
     the old revenue-per-recipient's `emailsSent` is renamed, to `sent`,
     because it was always the same quantity delivery-rate already asked
     for under that name.

     Unlike every other entry here this one is partial by design: an absent
     input yields NaN for the metrics that need it (div already does this
     for a zero denominator) and the eight are independent, so seven still
     compute while the eighth waits for its own field. EmailPerformanceTool
     reads that NaN as "not answerable yet" rather than as an error. */
  "email-performance": ({ sent, delivered, opens, clicks, bounced, unsubscribes, complaints, revenue, newSubscribers, listStart }) => ({
    deliveryRate: div(delivered, sent),
    bounceRate: div(bounced, sent),
    openRate: div(opens, delivered),
    // clicks over OPENS, not over delivered - that would be Email CTR, a
    // different metric. CTOR isolates content and offer quality from
    // deliverability and open-rate noise.
    ctor: div(clicks, opens),
    unsubRate: div(unsubscribes, delivered),
    complaintRate: div(complaints, delivered),
    listGrowthRate: div(newSubscribers - unsubscribes, listStart),
    rpr: div(revenue, sent),
  }),
  cr: ({ conversions, opportunities }) => ({ conversionRate: div(conversions, opportunities) }),

  "retention-rate": ({ startCustomers, endCustomers, acquiredCustomers }) => {
    const retentionRate = div(endCustomers - acquiredCustomers, startCustomers);
    return { retentionRate, churnRate: Number.isFinite(retentionRate) ? 1 - retentionRate : NaN };
  },

  // Customer-count churn, not revenue churn (Phase 1's own formulaPlainEnglish
  // for this slug). Deliberately independent from "retention-rate"'s
  // churnRate output above - same shape (lost / start), but this one is the
  // calculator whose whole reason to exist is the logo/account-count framing.
  "logo-churn": ({ lostCustomers, startCustomers }) => ({
    logoChurn: div(lostCustomers, startCustomers),
  }),

  "ltv-cac-ratio": ({ ltv, cac }) => ({ ltvCacRatio: div(ltv, cac) }),

  "cac-payback-period": ({ cac, arpu, grossMarginPct }) => ({
    paybackMonths: div(cac, arpu * grossMarginPct),
  }),

  "break-even-point": ({ fixedCosts, pricePerUnit, variableCostPerUnit }) => {
    const contributionPerUnit = pricePerUnit - variableCostPerUnit; // <=0 means no break-even exists at this price
    const breakEvenUnits = div(fixedCosts, contributionPerUnit);
    const breakEvenCac = contributionPerUnit; // max CAC you can afford per unit and still break even
    const breakEvenRoas = div(pricePerUnit, breakEvenCac); // ROAS floor, as a multiplier
    return {
      breakEvenUnits: Number.isFinite(breakEvenUnits) && contributionPerUnit > 0 ? Math.ceil(breakEvenUnits) : NaN,
      breakEvenCac: contributionPerUnit > 0 ? breakEvenCac : NaN,
      breakEvenRoas: contributionPerUnit > 0 ? breakEvenRoas : NaN,
    };
  },

  nrr: ({ startingMrr, expansion, contraction, churnedMrr }) => {
    const nrr = div(startingMrr + expansion - contraction - churnedMrr, startingMrr);
    const grr = div(startingMrr - contraction - churnedMrr, startingMrr);
    return { nrr, grr };
  },

  "rule-of-40": ({ revenueGrowthRate, profitMargin }) => ({
    // Inputs arrive as 0-1 decimals (parsed as "%" fields); Rule of 40 adds
    // them as whole percentage POINTS, not decimals - convert back to the
    // point scale here so 30% + 15% = 45 pts, not 0.45 (Phase 2 §8).
    ruleOf40Score: revenueGrowthRate * 100 + profitMargin * 100,
  }),

  ltv: ({ aov, purchaseFrequency, customerLifespan, grossMarginPct, churnRate, arpdau, avgLifetimeDays }) => {
    // Mode is resolved by CalculatorTool.tsx before calling this - it
    // passes only the fields the selected mode needs. We detect which
    // mode ran by which fields are finite, since all three share the
    // same registry slot (Phase 2 §10 multi-mode requirement).
    if (Number.isFinite(arpdau) && Number.isFinite(avgLifetimeDays)) {
      return { ltv: arpdau * avgLifetimeDays };
    }
    if (Number.isFinite(grossMarginPct) && Number.isFinite(churnRate)) {
      return { ltv: div(aov * purchaseFrequency * grossMarginPct, churnRate) };
    }
    return { ltv: aov * purchaseFrequency * customerLifespan };
  },

  "ab-test": ({ visitorsA, conversionsA, visitorsB, conversionsB }) => {
    const p1 = div(conversionsA, visitorsA);
    const p2 = div(conversionsB, visitorsB);
    const pPooled = div(conversionsA + conversionsB, visitorsA + visitorsB);
    const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / visitorsA + 1 / visitorsB));
    const z = div(p2 - p1, se);
    const pValue = 2 * (1 - normalCdf(Math.abs(z)));
    return {
      controlRate: p1,
      variantRate: p2,
      absoluteUplift: (p2 - p1) * 100, // percentage points, see file header
      relativeUplift: div(p2, p1) - 1,
      zScore: z,
      pValue,
      significant: Number.isFinite(pValue) && pValue < 0.05,
    };
  },

  "sample-size-calculator": ({ baselineRate, mde, power, significanceLevel }) => {
    // Phase 1's own validationRules flagged this as ambiguous (relative vs
    // absolute MDE) without picking one - implementation surfaced the gap
    // via a failing test (30,405 didn't reproduce). Resolved explicitly
    // here: `mde` is a RELATIVE lift (matches how most CRO tools frame
    // "detect a 10% relative improvement"), converted to the absolute
    // effect the classic two-proportion formula needs. Documented in
    // calculator-architecture.md Phase 2, not left silently ambiguous.
    // The minimum-detectable-effect calculator, which solved this same
    // equation for the opposite unknown and shared this convention, was
    // retired with the library trim - this is now the only place the
    // relative-MDE convention is implemented.
    const zAlpha = Z_ALPHA_TWO_TAILED[String(significanceLevel)] ?? 1.96;
    const zBeta = Z_BETA_ONE_TAILED[String(power)] ?? 0.8416;
    const p = baselineRate;
    const absoluteMde = p * mde;
    const n = (2 * Math.pow(zAlpha + zBeta, 2) * p * (1 - p)) / Math.pow(absoluteMde, 2);
    return { samplePerVariant: Math.ceil(n) };
  },

  "funnel-analysis-multistep": ({ stages: rawStages }) => {
    const stages = (Array.isArray(rawStages) ? rawStages : JSON.parse(String(rawStages))) as {
      label: string;
      count: number;
    }[];
    const stepConversions: { label: string; value: number }[] = [];
    const dropOffByStage: { label: string; value: number }[] = [];
    for (let i = 1; i < stages.length; i++) {
      const rate = div(stages[i].count, stages[i - 1].count);
      stepConversions.push({ label: `${stages[i - 1].label} → ${stages[i].label}`, value: rate });
      dropOffByStage.push({ label: stages[i].label, value: Number.isFinite(rate) ? 1 - rate : NaN });
    }
    const overallConversion = stages.length >= 2 ? div(stages[stages.length - 1].count, stages[0].count) : NaN;
    return { stepConversions, overallConversion, dropOffByStage };
  },
};

export function getCompute(slug: string): ComputeFn | undefined {
  return REGISTRY[slug];
}

// Abramowitz-Stegun erf approximation, same as the legacy implementation
// (src/lib/calculators.ts) - kept identical on purpose so the A/B test
// calculator's p-value does not silently change during migration.
function erf(x: number): number {
  const s = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return s * y;
}
function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}
