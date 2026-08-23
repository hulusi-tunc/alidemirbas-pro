/* Server-side loader for Phase 4 editorial content
   (production/calculators/content/{slug}.json). EN only, for the 13
   approved calculators - see calculator-content-architecture.md. Not
   imported by any "use client" file, same server/client boundary
   discipline as calc-catalog.ts. */
import cr from "../../production/calculators/content/cr.json";
import roas from "../../production/calculators/content/roas.json";
import ctr from "../../production/calculators/content/ctr.json";
import cac from "../../production/calculators/content/cac.json";
import ltv from "../../production/calculators/content/ltv.json";
import ltvCacRatio from "../../production/calculators/content/ltv-cac-ratio.json";
import cacPaybackPeriod from "../../production/calculators/content/cac-payback-period.json";
import aov from "../../production/calculators/content/aov.json";
import grossMargin from "../../production/calculators/content/gross-margin.json";
import retentionRate from "../../production/calculators/content/retention-rate.json";
import nrr from "../../production/calculators/content/nrr.json";
import abTest from "../../production/calculators/content/ab-test.json";
import sampleSizeCalculator from "../../production/calculators/content/sample-size-calculator.json";

export type ContentSection = {
  id: string;
  type: "definition" | "formula" | "example" | "interpretation" | "methodology" | "models" | "assumptions" | "limitations" | "common-mistakes" | "comparison-note";
  heading: string;
  body?: string;
  items?: string[];
  intro?: string;
  models?: { modeId: string; heading: string; body: string; example?: string }[];
};

export type CalcContent = {
  calculatorId: string;
  slug: string;
  contentDepth: "light" | "standard" | "deep";
  intro: string;
  sections: ContentSection[];
  faq: { id: string; q: string; a: string }[];
  seo: { seoTitle: string; seoDescription: string; canonicalPath: string; index: boolean; follow: boolean };
  qaStatus: "ready" | "review" | "blocked";
};

const CONTENT_BY_SLUG: Record<string, CalcContent> = {
  cr: cr as CalcContent,
  roas: roas as CalcContent,
  ctr: ctr as CalcContent,
  cac: cac as CalcContent,
  ltv: ltv as CalcContent,
  "ltv-cac-ratio": ltvCacRatio as CalcContent,
  "cac-payback-period": cacPaybackPeriod as CalcContent,
  aov: aov as CalcContent,
  "gross-margin": grossMargin as CalcContent,
  "retention-rate": retentionRate as CalcContent,
  nrr: nrr as CalcContent,
  "ab-test": abTest as CalcContent,
  "sample-size-calculator": sampleSizeCalculator as CalcContent,
};

/* EN only, by design (instruction 46) - TR pages fall back to the
   existing minimal behavior (spec.formulaPlainEnglish) rather than
   showing untranslated English long-form content on a Turkish route. */
export function getContent(slug: string, lang: "en" | "tr"): CalcContent | undefined {
  if (lang !== "en") return undefined;
  return CONTENT_BY_SLUG[slug];
}
