/* Server-side loader for the Phase 1 calculator catalog
   (production/calculators/calculator-catalog.json) - the single source of
   truth for calculator metadata (formula, inputs, outputs, validation
   rules, examples, relations). Never hand-author calculator metadata
   elsewhere; edit production/calculators/_generate-catalog.mjs and
   re-run it instead.

   This module is safe to import from server components/page files. It is
   NOT imported by any "use client" file - CalculatorTool.tsx receives a
   slim RuntimeCalcSpec as a prop instead, so the full 78-entry catalog
   (with its prose validationRules/edgeCases/aliases) never reaches the
   client bundle. See calc-registry.ts for the client-safe compute layer. */
import catalogJson from "../../production/calculators/calculator-catalog.json";
import type { Lang } from "@/lib/content";
import { TEXT_TOOL_SLUGS } from "@/lib/text-tools";

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

/* The live library. This array is the ONLY gate on what exists: the
   `/calculators/[slug]` route prerenders exactly these (plus TEXT_TOOL_SLUGS)
   and 404s on anything else, `getCalcSpec` refuses a slug that isn't here,
   the index page lists these and nothing else, and every related-calculator
   link - catalog-sourced or content-authored - is re-filtered through it.
   Adding a slug here without a compute function in calc-registry.ts, or
   removing one without removing its content file, is the failure mode to
   watch for; both are checked by the calculator validators.

   Trimmed from 43 to 19. The eight single-metric email calculators
   (open-rate, ctor, delivery-rate, bounce-rate-email, unsubscribe-rate,
   complaint-rate, list-growth-rate, revenue-per-recipient) are not gone so
   much as merged: they asked for the same denominators over and over, so
   they are now one `email-performance` page that computes all eight from a
   single input set. The other 17 were removed outright as library scope,
   not because anything was wrong with them - their compute functions,
   catalog specs and content files were deleted with them rather than left
   as unreferenced code. See calculator-architecture.md for the catalog's
   own (unchanged, wider) research set: the catalog still describes 78
   calculators; this list is the product decision about which ones ship. */
export const LIVE_CALCULATOR_SLUGS: readonly string[] = [
  // Ads
  "roas", "cpc", "cpm", "cac",
  // Revenue & Unit Economics
  "aov", "gross-margin", "break-even-point", "ltv", "ltv-cac-ratio", "cac-payback-period",
  // Retention & SaaS
  "retention-rate", "nrr", "logo-churn", "rule-of-40",
  // Conversion & Funnel
  "cr", "funnel-analysis-multistep",
  // Experimentation
  "ab-test", "sample-size-calculator",
  // Email & CRM
  "email-performance",
];

/* The library's display taxonomy - seven groups, deliberately separate from
   each spec's own `category` field. Those categories come from the Phase 1
   research set and are cross-validated against calculator-candidates.json by
   the catalog generator, so they answer "what kind of metric is this" across
   all 78 researched calculators; this map answers the narrower product
   question of where each of the 19 live ones belongs on the index page. They
   genuinely disagree: CAC's research category is `acquisition` but it sits
   with the ad-spend metrics here, and AOV/Gross Margin are `ecommerce` but
   belong with unit economics. Rewriting the catalog's categories to match
   would have made the generator's own cross-validation lie.

   Text tools have no entry HERE because they carry no CalcSpec to key off,
   but they are a group like any other on the index - see TEXT_TOOL_GROUP
   below and CalculatorRoutes' own entry construction. */
export type LibraryGroup =
  | "ads" | "revenue-unit-economics" | "retention-saas"
  | "conversion-funnel" | "experimentation" | "email-crm" | "text-tools";

export const LIBRARY_GROUP: Record<string, LibraryGroup> = {
  roas: "ads",
  cpc: "ads",
  cpm: "ads",
  cac: "ads",
  aov: "revenue-unit-economics",
  "gross-margin": "revenue-unit-economics",
  "break-even-point": "revenue-unit-economics",
  ltv: "revenue-unit-economics",
  "ltv-cac-ratio": "revenue-unit-economics",
  "cac-payback-period": "revenue-unit-economics",
  "retention-rate": "retention-saas",
  nrr: "retention-saas",
  "logo-churn": "retention-saas",
  "rule-of-40": "retention-saas",
  cr: "conversion-funnel",
  "funnel-analysis-multistep": "conversion-funnel",
  "ab-test": "experimentation",
  "sample-size-calculator": "experimentation",
  "email-performance": "email-crm",
};

/* UTM Builder and Character Counter. They have no catalog spec - no
   formula, no inputs, no outputs - so they cannot appear in LIBRARY_GROUP
   above, which is keyed by slug against LIVE_CALCULATOR_SLUGS. They are
   still a real group in the library rather than a separate list below it:
   somebody looking for a tool on this page should find all of them in one
   grid, filterable and searchable the same way. */
export const TEXT_TOOL_GROUP: LibraryGroup = "text-tools";

/* Which output a calculator leads with.

   The split panel headlines one result and lists the rest beneath it, and
   for all but one calculator the catalog's own first output is the right
   one - break-even leads with units, retention with the retention rate, NRR
   with NRR. ab-test is the exception: its outputs are ordered as a
   derivation (control rate, variant rate, uplift, z-score, p-value,
   verdict), so the first one is an input restated, not the answer. Nobody
   opens a significance calculator to be told their control rate.

   p-value rather than the boolean verdict, because the verdict sits
   directly beneath it either way and the number is the thing that carries
   how close the call was. This is a presentation choice and lives here
   rather than in the catalog, whose ordering is a correct description of
   the calculation.

   Slugs absent from this map lead with outputs[0]. */
export const PRIMARY_OUTPUT: Record<string, string> = {
  "ab-test": "pValue",
};

/* Order on the index page. Not alphabetical and not by count - it follows
   the funnel: what you spend, what it earns, whether they stay, whether
   they convert, how you prove it, how you reach them - then the tools that
   aren't metrics at all. */
/* The library's groups as displayed. Keyed by LibraryGroup, NOT by the
   catalog's own `category` field - see LIBRARY_GROUP's own comment for why
   the two deliberately disagree.

   Lives here rather than in CalculatorRoutes because two surfaces render it
   now: the calculators index's facet rail, and the home page's calculator
   band, which lists the live tools grouped the same way. One map, so the
   two cannot drift into calling the same group different things. */
export const GROUP_LABEL: Record<LibraryGroup, { en: string; tr: string }> = {
  ads: { en: "Ads", tr: "Reklam" },
  "revenue-unit-economics": { en: "Revenue & Unit Economics", tr: "Gelir ve Birim Ekonomisi" },
  "retention-saas": { en: "Retention & SaaS", tr: "Elde Tutma ve SaaS" },
  "conversion-funnel": { en: "Conversion & Funnel", tr: "Dönüşüm ve Huni" },
  experimentation: { en: "Experimentation", tr: "Deneysel Test" },
  "email-crm": { en: "Email & CRM", tr: "E-posta ve CRM" },
  "text-tools": { en: "Text Tools", tr: "Metin Araçları" },
};

export const LIBRARY_GROUP_ORDER: readonly LibraryGroup[] = [
  "ads", "revenue-unit-economics", "retention-saas",
  "conversion-funnel", "experimentation", "email-crm",
  // Last because it is the one group that isn't a metric - the funnel
  // ordering above doesn't apply to it.
  "text-tools",
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
  return correctedFormulaPlainEnglish(spec);
}
