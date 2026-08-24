/* Server-side loader for Phase 4 editorial content
   (production/calculators/content/{slug}.json). EN only, for the 18
   approved calculators (13 original + the CPC/MRR/Logo Churn/Break-Even
   Point/Test Duration Estimator batch) - see
   calculator-content-architecture.md. Not imported by any "use client"
   file, same server/client boundary discipline as calc-catalog.ts. */
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
import cpc from "../../production/calculators/content/cpc.json";
import mrr from "../../production/calculators/content/mrr.json";
import logoChurn from "../../production/calculators/content/logo-churn.json";
import breakEvenPoint from "../../production/calculators/content/break-even-point.json";
import testDurationEstimator from "../../production/calculators/content/test-duration-estimator.json";
import contributionMargin from "../../production/calculators/content/contribution-margin.json";
import minimumDetectableEffect from "../../production/calculators/content/minimum-detectable-effect.json";
import confidenceIntervalCalculator from "../../production/calculators/content/confidence-interval-calculator.json";
import marketingRoi from "../../production/calculators/content/marketing-roi.json";
import revenuePerVisitor from "../../production/calculators/content/revenue-per-visitor.json";
import openRate from "../../production/calculators/content/open-rate.json";
import ruleOf40 from "../../production/calculators/content/rule-of-40.json";
import d1Retention from "../../production/calculators/content/d1-retention.json";
import cpa from "../../production/calculators/content/cpa.json";
import cartAbandonment from "../../production/calculators/content/cart-abandonment.json";
import ctor from "../../production/calculators/content/ctor.json";
import saasQuickRatio from "../../production/calculators/content/saas-quick-ratio.json";
import dauMauStickiness from "../../production/calculators/content/dau-mau-stickiness.json";
import cpm from "../../production/calculators/content/cpm.json";
import cpl from "../../production/calculators/content/cpl.json";
import activationRate from "../../production/calculators/content/activation-rate.json";
import funnelAnalysisMultistep from "../../production/calculators/content/funnel-analysis-multistep.json";
import profitMargin from "../../production/calculators/content/profit-margin.json";
import engagementRate from "../../production/calculators/content/engagement-rate.json";
import deliveryRate from "../../production/calculators/content/delivery-rate.json";
import bounceRateEmail from "../../production/calculators/content/bounce-rate-email.json";
import unsubscribeRate from "../../production/calculators/content/unsubscribe-rate.json";
import complaintRate from "../../production/calculators/content/complaint-rate.json";
import listGrowthRate from "../../production/calculators/content/list-growth-rate.json";
import revenuePerRecipient from "../../production/calculators/content/revenue-per-recipient.json";

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
  cpc: cpc as CalcContent,
  mrr: mrr as CalcContent,
  "logo-churn": logoChurn as CalcContent,
  "break-even-point": breakEvenPoint as CalcContent,
  "test-duration-estimator": testDurationEstimator as CalcContent,
  "contribution-margin": contributionMargin as CalcContent,
  "minimum-detectable-effect": minimumDetectableEffect as CalcContent,
  "confidence-interval-calculator": confidenceIntervalCalculator as CalcContent,
  "marketing-roi": marketingRoi as CalcContent,
  "revenue-per-visitor": revenuePerVisitor as CalcContent,
  "open-rate": openRate as CalcContent,
  "rule-of-40": ruleOf40 as CalcContent,
  "d1-retention": d1Retention as CalcContent,
  cpa: cpa as CalcContent,
  "cart-abandonment": cartAbandonment as CalcContent,
  ctor: ctor as CalcContent,
  "saas-quick-ratio": saasQuickRatio as CalcContent,
  "dau-mau-stickiness": dauMauStickiness as CalcContent,
  cpm: cpm as CalcContent,
  cpl: cpl as CalcContent,
  "activation-rate": activationRate as CalcContent,
  "funnel-analysis-multistep": funnelAnalysisMultistep as CalcContent,
  "profit-margin": profitMargin as CalcContent,
  "engagement-rate": engagementRate as CalcContent,
  "delivery-rate": deliveryRate as CalcContent,
  "bounce-rate-email": bounceRateEmail as CalcContent,
  "unsubscribe-rate": unsubscribeRate as CalcContent,
  "complaint-rate": complaintRate as CalcContent,
  "list-growth-rate": listGrowthRate as CalcContent,
  "revenue-per-recipient": revenuePerRecipient as CalcContent,
};

/* EN only, by design (instruction 46) - TR pages fall back to the
   existing minimal behavior (spec.formulaPlainEnglish) rather than
   showing untranslated English long-form content on a Turkish route. */
export function getContent(slug: string, lang: "en" | "tr"): CalcContent | undefined {
  if (lang !== "en") return undefined;
  return CONTENT_BY_SLUG[slug];
}
