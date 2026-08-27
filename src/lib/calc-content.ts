/* Server-side loader for the editorial content that sits under each
   calculator (production/calculators/content/{slug}.json). EN only. One
   file per live calculator, no more and no fewer - both directions are
   enforced by production/calculators/validate-calculator-content.mjs, so a
   calculator added without content, or content left behind after its
   calculator was retired, fails validation rather than shipping. Not
   imported by any "use client" file, same server/client boundary
   discipline as calc-catalog.ts. */
import roas from "../../production/calculators/content/roas.json";
import cpc from "../../production/calculators/content/cpc.json";
import cpm from "../../production/calculators/content/cpm.json";
import cac from "../../production/calculators/content/cac.json";
import aov from "../../production/calculators/content/aov.json";
import grossMargin from "../../production/calculators/content/gross-margin.json";
import breakEvenPoint from "../../production/calculators/content/break-even-point.json";
import ltv from "../../production/calculators/content/ltv.json";
import ltvCacRatio from "../../production/calculators/content/ltv-cac-ratio.json";
import cacPaybackPeriod from "../../production/calculators/content/cac-payback-period.json";
import retentionRate from "../../production/calculators/content/retention-rate.json";
import nrr from "../../production/calculators/content/nrr.json";
import logoChurn from "../../production/calculators/content/logo-churn.json";
import ruleOf40 from "../../production/calculators/content/rule-of-40.json";
import cr from "../../production/calculators/content/cr.json";
import funnelAnalysisMultistep from "../../production/calculators/content/funnel-analysis-multistep.json";
import abTest from "../../production/calculators/content/ab-test.json";
import sampleSizeCalculator from "../../production/calculators/content/sample-size-calculator.json";
import emailPerformance from "../../production/calculators/content/email-performance.json";

export type ContentSection = {
  id: string;
  type:
    | "definition" | "formula" | "example" | "interpretation" | "methodology"
    | "models" | "assumptions" | "limitations" | "common-mistakes" | "comparison-note"
    // worked-example: a scannable input/output readout followed by a plain-
    // language reading of the result. output/inputs come straight from the
    // calculator spec's own verified exampleInput/exampleOutput - never
    // invented.
    | "worked-example"
    // trust-checks: the "Before You Trust This Result" pattern - a short
    // title + 1-3 sentences per check, not a flat bullet list, because each
    // check is its own small claim rather than one item in a series.
    | "trust-checks";
  heading: string;
  /** Supports inline links: `[label](href)` - see Prose in CalculatorContent.tsx.
      Internal (starts with "/") renders as a Next Link, external (starts with
      "http") as a new-tab anchor. This is the only markup body text accepts. */
  body?: string;
  items?: string[];
  intro?: string;
  models?: { modeId: string; heading: string; body: string; example?: string }[];
  inputs?: { label: string; value: string }[];
  output?: { label: string; value: string };
  checks?: { title: string; body: string }[];
};

export type CalcContent = {
  calculatorId: string;
  slug: string;
  contentDepth: "light" | "standard" | "deep";
  /** Overrides the H1 (and only the H1 - breadcrumbs, nav, related-card
      labels elsewhere on the site keep using the catalog's own spec.name)
      when the page needs a fuller form than the catalog's short tool
      name, e.g. "Customer Acquisition Cost (CAC) Calculator" vs. the
      catalog's "CAC Calculator". Optional - omitting it keeps the
      existing spec.name behavior exactly as before. */
  heroTitle?: string;
  intro: string;
  sections: ContentSection[];
  /** Authored Related Calculators, verified against LIVE_CALCULATOR_SLUGS at
      build time by CalculatorRoutes.tsx - a real, checked slug with a real
      one-sentence relationship description, not the catalog's own
      relatedCalculators field (which can carry a slug that no longer
      resolves to a live route, and carries no description at all). */
  related?: { slug: string; name: string; desc: string }[];
  faq: { id: string; q: string; a: string }[];
  seo: { seoTitle: string; seoDescription: string; canonicalPath: string; index: boolean; follow: boolean };
  qaStatus: "ready" | "review" | "blocked";
};

const CONTENT_BY_SLUG: Record<string, CalcContent> = {
  roas: roas as CalcContent,
  cpc: cpc as CalcContent,
  cpm: cpm as CalcContent,
  cac: cac as CalcContent,
  aov: aov as CalcContent,
  "gross-margin": grossMargin as CalcContent,
  "break-even-point": breakEvenPoint as CalcContent,
  ltv: ltv as CalcContent,
  "ltv-cac-ratio": ltvCacRatio as CalcContent,
  "cac-payback-period": cacPaybackPeriod as CalcContent,
  "retention-rate": retentionRate as CalcContent,
  nrr: nrr as CalcContent,
  "logo-churn": logoChurn as CalcContent,
  "rule-of-40": ruleOf40 as CalcContent,
  cr: cr as CalcContent,
  "funnel-analysis-multistep": funnelAnalysisMultistep as CalcContent,
  "ab-test": abTest as CalcContent,
  "sample-size-calculator": sampleSizeCalculator as CalcContent,
  "email-performance": emailPerformance as CalcContent,
};

/* EN only, by design (instruction 46) - TR pages fall back to the
   existing minimal behavior (spec.formulaPlainEnglish) rather than
   showing untranslated English long-form content on a Turkish route. */
export function getContent(slug: string, lang: "en" | "tr"): CalcContent | undefined {
  if (lang !== "en") return undefined;
  return CONTENT_BY_SLUG[slug];
}
