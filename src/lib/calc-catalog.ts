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

export type CalcUnit = string;

export type CalcField = { key: string; label: string; unit: CalcUnit | null };

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
  modes?: CalcMode[];
  formulaDisplay?: string;
  examplesByMode?: Record<string, { input: Record<string, unknown>; output: Record<string, unknown> }>;
};

const CATALOG = catalogJson.calculators as CalcSpec[];

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

export function toRuntimeSpec(spec: CalcSpec): RuntimeCalcSpec {
  const related = spec.relatedCalculators
    .map((s) => bySlug.get(s))
    .filter((s): s is CalcSpec => Boolean(s) && LIVE_CALCULATOR_SLUGS.includes(s!.slug))
    .map((s) => ({ slug: s.slug, name: s.name }));
  return {
    slug: spec.slug,
    name: spec.name,
    category: spec.category,
    classification: spec.classification,
    formula: spec.formula,
    formulaPlainEnglish: spec.formulaPlainEnglish,
    inputs: spec.inputs,
    outputs: spec.outputs,
    modes: spec.modes,
    formulaDisplay: spec.formulaDisplay,
    examplesByMode: spec.examplesByMode,
    exampleInput: spec.exampleInput,
    exampleOutput: spec.exampleOutput,
    related,
  };
}

export function shortDescription(spec: CalcSpec, lang: Lang): string {
  // formulaPlainEnglish is authored English prose (Phase 1 was English-only
  // research). No TR translation exists yet for the new batch - fall back
  // to the same English sentence for tr rather than inventing a translation
  // here silently. Flagged in calculator-architecture.md open questions.
  void lang;
  return spec.formulaPlainEnglish;
}
