/* Server-side loader for the Phase 1 calculator catalog
   (production/calculators/calculator-catalog.json) - the single source of
   truth for calculator metadata (formula, inputs, outputs, validation
   rules, examples, relations). Never hand-author calculator metadata
   elsewhere; edit production/calculators/_generate-catalog.mjs and
   re-run it instead.

   This module is safe to import from server components/page files. It is
   NOT imported by any "use client" file - CalculatorTool.tsx receives a
   slim RuntimeCalcSpec as a prop instead, so the full 77-entry catalog
   (with its prose validationRules/edgeCases/aliases) never reaches the
   client bundle. See calc-registry.ts for the client-safe compute layer. */
import catalogJson from "../../production/calculators/calculator-catalog.json";
import type { Lang } from "@/lib/content";
import { TEXT_TOOL_SLUGS } from "@/lib/text-tools";
import { getCompute } from "@/lib/calc-registry";
import { formatByUnit } from "@/lib/calc-format";

export type CalcUnit = string;

export type CalcField = {
  key: string;
  label: string;
  unit: CalcUnit | null;
  /** True when the catalog's own acceptedRanges marks this field ">0" -
      a denominator or count that's mathematically undefined at zero, not
      just "can't be negative" (see toRuntimeSpec below and its own
      comment on why this is enforced generically rather than per-slug). */
  strictlyPositive?: boolean;
};

export type CalcMode = {
  id: string;
  label: string;
  formula: string;
  inputs: CalcField[];
  outputs: CalcField[];
};

export type CalcSpec = {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  classification: "calculator" | "calculator-educational";
  priority: "P0" | "P1" | "P2" | "P3";
  status: "implemented" | "recommended";
  formula: string;
  formulaPlainEnglish: string;
  inputs: CalcField[];
  outputs: CalcField[];
  exampleInput: Record<string, unknown>;
  exampleOutput: Record<string, unknown>;
  relatedMetrics: string[];
  relatedCalculators: string[];
  formulaFamily: string;
  aliases: string[];
  acceptedRanges?: Record<string, string>;
  modes?: CalcMode[];
  formulaDisplay?: string;
  examplesByMode?: Record<string, { input: Record<string, unknown>; output: Record<string, unknown> }>;
};

const CATALOG = catalogJson.calculators as unknown as CalcSpec[];

/* First production batch (Phase 2): all 18 P0 + the 14 P1s selected in
   calculator-architecture.md, PLUS two already-shipped legacy calculators
   (profit-margin, engagement-rate) that fall outside that batch but must
   migrate too - leaving them on the old engine would mean two calculation
   engines computing metrics independently, which Phase 2 explicitly
   forbids. 32 + 2 = 34 live calculators. See calculator-architecture.md
   "Phase 2" section for the full reasoning. */
export const LIVE_CALCULATOR_SLUGS: readonly string[] = [
  // P0 (18)
  "roas", "marketing-roi", "ctr", "cpc", "cpm", "cpa", "cpl", "cac", "aov",
  "gross-margin", "retention-rate", "open-rate", "nrr", "ltv", "ltv-cac-ratio",
  "cac-payback-period", "cr", "ab-test",
  // P1 (14) - first-batch selection from calculator-architecture.md
  "activation-rate", "mrr", "funnel-analysis-multistep", "sample-size-calculator",
  "revenue-per-visitor", "contribution-margin", "break-even-point",
  "dau-mau-stickiness", "d1-retention", "saas-quick-ratio", "rule-of-40",
  "cart-abandonment", "confidence-interval-calculator", "test-duration-estimator",
  // legacy-only migration (already shipped, not in the 32-item batch)
  "profit-margin", "engagement-rate",
  // added for the Content Standard batch that shipped its own page
  // (calculator-catalog.json's own "status: recommended" for this id
  // predates this batch and was never a gate here - LIVE_CALCULATOR_SLUGS
  // always has been the actual gate, same as mrr/break-even-point/
  // test-duration-estimator above, all of which shipped live with that
  // same stale "recommended" status)
  "logo-churn",
  // same promotion pattern as logo-churn above, for the ARR/GRR/
  // Contribution Margin/MDE/Confidence Interval content batch - see
  // calc-registry.ts's own comment on this slug for the relative-MDE
  // convention decision (catalog's exampleOutput is stale, documented in
  // production/calculators/content/minimum-detectable-effect.json's
  // qaNotes, not edited here)
  "minimum-detectable-effect",
  // Batch 06 (CPA/Cart Abandonment/CTOR/SaaS Quick Ratio/DAU-MAU
  // Stickiness): the only one of the five needing a runtime promotion -
  // the other four were already live. CTOR's own catalog exampleInput/
  // exampleOutput (clicks:400, opens:2500 -> 16.00%) was independently
  // re-verified, no known-invalid data here.
  "ctor",
];

const bySlug = new Map(CATALOG.map((c) => [c.slug, c]));

/* Every slug that should resolve as a real route under /calculators/[slug]
   - the 34 live calculators plus the 2 text tools. generateStaticParams
   uses this so an unknown slug 404s instead of falling through. */
export const ALL_TOOL_SLUGS: readonly string[] = [...LIVE_CALCULATOR_SLUGS, ...TEXT_TOOL_SLUGS];

export function getCalcSpec(slug: string): CalcSpec | undefined {
  const spec = bySlug.get(slug);
  if (!spec || !LIVE_CALCULATOR_SLUGS.includes(slug)) return undefined;
  return spec;
}

export function getAllLiveSpecs(): CalcSpec[] {
  return LIVE_CALCULATOR_SLUGS.map((s) => bySlug.get(s)!).filter(Boolean);
}

/* Slim, JSON-serializable projection handed to the client component.
   Drops validationRules/edgeCases/acceptedRanges/aliases/formulaFamily -
   none of it is needed to render or run the calculator, and every dropped
   field is prose that would otherwise ship to every calculator page's
   client bundle for no runtime benefit (Phase 2 §31 performance note). */
export type RuntimeCalcSpec = {
  slug: string;
  name: string;
  category: string;
  classification: CalcSpec["classification"];
  formula: string;
  formulaPlainEnglish: string;
  inputs: CalcField[];
  outputs: CalcField[];
  modes?: CalcMode[];
  formulaDisplay?: string;
  examplesByMode?: CalcSpec["examplesByMode"];
  exampleInput: Record<string, unknown>;
  exampleOutput: Record<string, unknown>;
  related: { slug: string; name: string }[];
};

/* calculator-catalog.json's own exampleOutput/formulaDisplay for
   minimum-detectable-effect is known-stale against this calculator's
   actual RELATIVE-MDE implementation (calc-registry.ts): the catalog's
   static exampleOutput says mde "25.30%" for the canonical example, and
   its formulaDisplay shows only the ABSOLUTE effect formula with no
   division by baseline rate - neither matches what the live calculator
   actually returns (24.42%, a relative lift). Documented in
   production/calculators/content/minimum-detectable-effect.json's
   qaNotes; NOT hand-edited in the catalog file itself. Both values are
   corrected here instead, at the runtime-presentation layer, so the
   compact FormulaBlock/ExampleBlock every live calculator page renders
   (CalculatorTool.tsx) never shows the known-wrong catalog value - the
   corrected example is derived by running the same validated compute
   function the live calculator itself uses, not a hardcoded number, so
   it self-corrects if the implementation or example input ever changes.
   Scoped to this one slug only - no other calculator's catalog-sourced
   example or formula display is touched. */
function correctedExample(spec: CalcSpec): { exampleOutput: Record<string, unknown>; formulaDisplay?: string } {
  if (spec.slug !== "minimum-detectable-effect") {
    return { exampleOutput: spec.exampleOutput, formulaDisplay: spec.formulaDisplay };
  }
  const compute = getCompute(spec.slug);
  const computed = compute?.(spec.exampleInput);
  const exampleOutput = computed && typeof computed.mde === "number" && Number.isFinite(computed.mde)
    ? { mde: formatByUnit(computed.mde, "%") }
    : spec.exampleOutput; // fall back to catalog's value only if the compute function is ever unavailable
  return {
    exampleOutput,
    formulaDisplay:
      "Relative minimum detectable effect = √(2 × (z-values for power and significance, summed)² × Baseline rate × (1 − Baseline rate) ÷ Sample size) ÷ Baseline rate",
  };
}

/* calculator-catalog.json's own formulaPlainEnglish for logo-churn calls
   this "the SaaS-standard framing of Churn Rate" - an overly-definitive
   claim the content correction pass (production/calculators/content/
   logo-churn.json) already softened to "a common SaaS definition" in its
   own authored prose, but this catalog-sourced sentence is rendered
   separately by CalculatorTool.tsx's FormulaBlock and was still showing
   the original wording on the live page. Scoped override, same pattern
   as the minimum-detectable-effect fix above - calculator-catalog.json
   itself is untouched. */
export function correctedFormulaPlainEnglish(spec: CalcSpec): string {
  if (spec.slug !== "logo-churn") return spec.formulaPlainEnglish;
  return "Customer-count churn (as opposed to revenue churn) - a common SaaS definition of Churn Rate.";
}

/* Marks each flat (non-mode) input strictlyPositive when the catalog's
   own acceptedRanges says that field must be ">0" - a real, existing
   distinction Phase 1 already encoded (">0" for a denominator/count that's
   mathematically undefined at zero, ">=0" for one where zero is a valid
   value) that the generic client-side validator never actually read, so
   submitting 0 for e.g. CPA's "conversions" or Cart Abandonment's "carts
   created" silently passed per-field validation and only surfaced later
   as a bare "-" result (formatByUnit's non-finite fallback) with no
   field-level error telling the user why. Scoped to spec.inputs only -
   multi-mode calculators' per-mode inputs (ab-test, funnel, sample-size)
   are untouched here, since acceptedRanges isn't itself keyed by mode. */
function withPositivity(inputs: CalcField[], acceptedRanges: Record<string, string> | undefined): CalcField[] {
  if (!acceptedRanges) return inputs;
  return inputs.map((f) => (acceptedRanges[f.key] === ">0" ? { ...f, strictlyPositive: true } : f));
}

export function toRuntimeSpec(spec: CalcSpec): RuntimeCalcSpec {
  const related = spec.relatedCalculators
    .map((s) => bySlug.get(s))
    .filter((s): s is CalcSpec => Boolean(s) && LIVE_CALCULATOR_SLUGS.includes(s!.slug))
    .map((s) => ({ slug: s.slug, name: s.name }));
  const { exampleOutput, formulaDisplay } = correctedExample(spec);
  return {
    slug: spec.slug,
    name: spec.name,
    category: spec.category,
    classification: spec.classification,
    formula: spec.formula,
    formulaPlainEnglish: correctedFormulaPlainEnglish(spec),
    inputs: withPositivity(spec.inputs, spec.acceptedRanges),
    outputs: spec.outputs,
    modes: spec.modes,
    formulaDisplay,
    examplesByMode: spec.examplesByMode,
    exampleInput: spec.exampleInput,
    exampleOutput,
    related,
  };
}

export function shortDescription(spec: CalcSpec, lang: Lang): string {
  // formulaPlainEnglish is authored English prose (Phase 1 was English-only
  // research). No TR translation exists yet for the new batch - fall back
  // to the same English sentence for tr rather than inventing a translation
  // here silently. Flagged in calculator-architecture.md open questions.
  void lang;
  return correctedFormulaPlainEnglish(spec);
}
