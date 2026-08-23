// Phase 3 generator: SEO/keyword architecture for all 77 catalog
// calculators. Reads catalog.json + formula-families.json + candidates.json
// (never re-derives calculator math), generates a baseline secondary-
// keyword set programmatically per calculator, and layers in
// hand-authored judgment (comparison backlog, cannibalization risk pairs,
// glossary backlog, category strategy, manual keyword extras) - the same
// generate-from-data-plus-curated-overrides pattern as
// _generate-catalog.mjs, for the same reason: keeps 77 records internally
// consistent instead of hand-typed and drifting.
import { readFileSync, writeFileSync } from "fs";

const dir = new URL("./", import.meta.url);
const read = (name) => JSON.parse(readFileSync(new URL(name, dir)));

const catalog = read("calculator-catalog.json").calculators;
const families = read("calculator-formula-families.json").families;
const candidates = read("calculator-candidates.json").candidates;
const taxonomy = read("calculator-taxonomy.json").categories;

const bySlug = new Map(catalog.map((c) => [c.slug, c]));
const familyOf = new Map(catalog.map((c) => [c.slug, c.formulaFamily]));

// ---------------------------------------------------------------------
// Content depth: derived from the brief's own worked examples (CTR/CPC/
// CPM -> light; CAC/ROAS/AOV/Churn -> standard; LTV/sample size/CI/
// significance/duration -> deep), generalized as a small family rule
// rather than 77 individual judgments, with a short override list for
// members of the "light" families that carry real interpretation nuance.
const LIGHT_FAMILIES = ["cost-per-unit", "rate-ratio"];
const STANDARD_OVERRIDES = new Set([
  "open-rate", "ctor", "dau-mau-stickiness", "cpe", "share-of-voice",
  "refund-rate", "field-abandonment-rate", "exit-rate",
]);
// Phase 4.5 audit finding: "experimentation category -> deep" is a
// blanket rule that over-classifies calculators whose actual complexity
// is a single caveat, not genuine statistical methodology/assumptions/
// limitations. test-duration-estimator is arithmetic (sample size /
// daily traffic, rounded up to a week) - nowhere near the distributional
// reasoning ab-test/sample-size-calculator/confidence-interval-calculator
// need. See calculator-content-rule-audit.json's depthModel entry.
const DEPTH_OVERRIDES = { "test-duration-estimator": "standard" };
function contentDepth(c) {
  if (DEPTH_OVERRIDES[c.slug]) return DEPTH_OVERRIDES[c.slug];
  if (c.modes) return "deep";
  if (c.category === "experimentation") return "deep";
  if (STANDARD_OVERRIDES.has(c.slug)) return "standard";
  if (LIGHT_FAMILIES.includes(c.formulaFamily)) return "light";
  return "standard";
}

// ---------------------------------------------------------------------
// SEO priority: reuses the Phase 1 P0-P3 usefulness tier directly
// (P0->A .. P3->D). Deliberately not a second, fuzzier score - Phase 1's
// priority already weighed usefulness/recognizability, and re-deriving a
// parallel number here would be exactly the "fake precision" this phase
// is told to avoid.
const PRIORITY_TO_SEO = { P0: "A", P1: "B", P2: "C", P3: "D" };

// ---------------------------------------------------------------------
// Comparison backlog (instruction 18) - genuine, decision-relevant or
// frequently-confused pairs only. Several brief-named "collisions"
// (Retention vs Churn, MRR vs ARR, NRR vs GRR) are NOT here because
// they're already one page with two output fields - a comparison page
// would just re-explain the same tool, which is exactly the manufactured
// redundancy instruction 18 says to avoid.
const COMPARISON_BACKLOG = [
  { id: "roas-vs-roi", a: "roas", b: "marketing-roi", why: "Both answer 'was this spend worth it', with different denominators (spend vs. cost) that regularly get conflated.", strength: "high" },
  { id: "cac-vs-cpa", a: "cac", b: "cpa", why: "CAC counts paying customers, CPA counts any defined conversion - the two get used interchangeably in casual usage.", strength: "high" },
  { id: "cpc-vs-cpm", a: "cpc", b: "cpm", why: "Different bidding models (per-click vs. per-1000-impressions); a buyer choosing between them is genuine decision intent.", strength: "medium" },
  { id: "ctr-vs-ctor", a: "ctr", b: "ctor", why: "Both are click ratios with different denominators (impressions/delivered vs. opens) - a common email-marketing confusion point.", strength: "high" },
  { id: "margin-types-compared", a: "gross-margin", b: "contribution-margin", c: "profit-margin", why: "Three margin calculators with increasingly broad cost bases; one three-way comparison page serves this better than pairwise ones.", strength: "high" },
  { id: "ltv-vs-arpu", a: "ltv", b: "arpu", why: "ARPU is a per-period snapshot, LTV projects across a customer's lifetime - frequently confused when sizing a business.", strength: "medium" },
  { id: "significance-vs-confidence-interval", a: "ab-test", b: "confidence-interval-calculator", why: "A CI calculator can be (mis)used to eyeball significance; the two answer related but distinct questions.", strength: "medium" },
  { id: "sample-size-vs-mde", a: "sample-size-calculator", b: "minimum-detectable-effect", why: "Same equation, solved for the opposite variable - users often aren't sure which one they actually need.", strength: "high" },
  { id: "blended-cac-vs-paid-cac", a: "blended-cac", b: "cac", why: "Same formula shape, different spend/customer population - a frequent methodology mix-up in CAC reporting.", strength: "medium" },
  { id: "logo-churn-vs-revenue-churn", a: "logo-churn", b: "nrr", why: "Customer-count churn vs. dollar-weighted churn (an NRR output) can move in opposite directions in the same period.", strength: "medium" },
  { id: "rule-of-40-vs-quick-ratio", a: "rule-of-40", b: "saas-quick-ratio", why: "Both are single-number SaaS health checks; teams often want to know which one to report.", strength: "low" },
  { id: "activation-rate-vs-conversion-rate", a: "activation-rate", b: "cr", why: "Mobile 'activation' is a specific product event, not a generic funnel conversion - worth a direct contrast.", strength: "low" },
  { id: "cpi-vs-cac", a: "cpi", b: "cac", why: "Cost to install vs. cost to acquire a paying customer - a common mobile-UA budgeting confusion.", strength: "medium" },
];

// ---------------------------------------------------------------------
// Cannibalization audit (instruction 5) - the brief's own named examples,
// classified. ALIAS pairs are not a risk (already one URL, verified
// against formula-families.json foldedVariants below); these are the
// pairs where TWO separate URLs exist and could compete for the same
// intent if content isn't deliberately differentiated.
const CANNIBALIZATION_RISK_PAIRS = [
  { a: "roas", b: "marketing-roi", risk: "cannibalization-risk", why: "Near-synonymous in casual usage ('was this worth it'); titles/intros must state the denominator difference explicitly." },
  { a: "cac", b: "cpa", risk: "cannibalization-risk", why: "'Cost to acquire a customer' is ambiguous between the two; each page must state what counts as the denominator event." },
  { a: "gross-margin", b: "contribution-margin", risk: "cannibalization-risk", why: "Adjacent cost bases, very similar page titles - needs an explicit 'what's excluded here' statement on both." },
  { a: "gross-margin", b: "profit-margin", risk: "cannibalization-risk", why: "Same risk as above, wider cost-base gap but still commonly conflated as 'margin calculator'." },
  { a: "ctr", b: "ctor", risk: "cannibalization-risk", why: "Same click-ratio shape, different denominator - CTOR's page must not just look like a CTR variant." },
  { a: "ab-test", b: "confidence-interval-calculator", risk: "cannibalization-risk", why: "Both statistical, both about 'can I trust this result' - CI page must stay framed around ANY observed rate, not just A/B tests." },
  { a: "revenue-per-visitor", b: "cr", risk: "adjacent-intent", why: "Different metrics on the same e-commerce funnel; internal linking is enough, no wording risk." },
  { a: "ltv", b: "customer-lifetime", risk: "adjacent-intent", why: "Customer Lifetime is a glossary/input-modeling concept feeding LTV, not a separate search target of its own." },
  { a: "cpc", b: "cpm", risk: "no-issue", why: "Different, well-established bidding-model queries; no wording confusion in practice." },
  { a: "d1-retention", b: "retention-rate", risk: "no-issue", why: "Cohort day-N retention vs. period retention are distinct, well-understood query families in mobile/product contexts." },
];

// Alias pairs (verified programmatically against formula-families.json,
// not hand-listed) - already resolved to one URL, so explicitly NO risk.
const ALIAS_PAIRS = [];
for (const f of families) {
  const canonical = [...f.standaloneCalculators, ...(f.keptSeparate || [])];
  for (const foldedId of f.foldedVariants) {
    const foldedCand = candidates.find((c) => c.id === foldedId);
    if (foldedCand?.dup && canonical.includes(foldedCand.dup)) {
      ALIAS_PAIRS.push({ folded: foldedId, canonical: foldedCand.dup, family: f.id });
    }
  }
}

// ---------------------------------------------------------------------
// Glossary backlog (instruction 17): existing Phase 1 "glossary"
// candidates, plus new discoveries that surfaced only when thinking
// about SEO/query intent (not calculator candidates - never were).
const EXISTING_GLOSSARY = candidates
  .filter((c) => c.classification === "glossary")
  .map((c) => ({ id: c.id, term: c.name, source: "phase-1-candidate", relatedCalculators: [], note: c.note }));

const NEW_GLOSSARY_DISCOVERIES = [
  { id: "attribution-window", term: "Attribution Window", relatedCalculators: ["cac", "roas"], note: "Explains why the same spend/conversion data can produce different CAC/ROAS depending on the lookback window used - referenced from both, defined on neither." },
  { id: "assisted-conversion", term: "Assisted Conversion", relatedCalculators: ["cr", "roas"], note: "Common point of confusion when a channel's ROAS looks low but it's actually assisting conversions credited elsewhere." },
  { id: "view-through-conversion", term: "View-Through Conversion", relatedCalculators: ["ctr", "roas"], note: "A conversion counted without a click - relevant context for CTR/ROAS pages without being a calculator itself." },
  { id: "activation-event", term: "Activation Event", relatedCalculators: ["activation-rate"], note: "Product-defined, not generic - the Activation Rate page references this term but shouldn't try to define it universally." },
  { id: "cohort", term: "Cohort", relatedCalculators: ["d1-retention", "retention-rate"], note: "Underpins every retention/D1-D30 calculator; worth one shared definition instead of repeating it per page." },
  { id: "incrementality", term: "Incrementality", relatedCalculators: ["incremental-roas"], note: "The methodology behind Incremental ROAS; a glossary page can carry the holdout-test explanation once." },
  { id: "statistical-power", term: "Statistical Power", relatedCalculators: ["sample-size-calculator", "minimum-detectable-effect"], note: "Referenced by every experimentation calculator's power selector; one shared definition avoids repeating it four times." },
  { id: "p-value", term: "p-value", relatedCalculators: ["ab-test"], note: "Widely searched on its own ('what is a p-value'), separate from wanting to run a test." },
  { id: "holdout-group", term: "Holdout Group", relatedCalculators: ["incremental-roas"], note: "Prerequisite concept for Incremental ROAS; not a calculator, but a common blocker query." },
  { id: "multiple-comparisons-problem", term: "Multiple Comparisons Problem", relatedCalculators: [], note: "Underlies the (not-yet-built) A/B/n Bonferroni correction; worth defining once ahead of that build." },
  { id: "network-effect-vs-organic-lift", term: "Statistical Significance vs. Practical Significance", relatedCalculators: ["ab-test"], note: "A recurring 'my test is significant but the lift is tiny' confusion; belongs next to the significance calculator, not inside it." },
];

// ---------------------------------------------------------------------
// Category strategy (instruction 16)
const CATEGORY_STRATEGY_NOTES = {
  advertising: { verdict: "create-later", why: "27 candidates / 14 catalog calculators - largest, most coherent category with real hub-page navigational value once more of it ships." },
  acquisition: { verdict: "not-needed", why: "Only 2 catalog calculators (CAC, Blended CAC); a hub with 2 links has no navigational value." },
  ecommerce: { verdict: "create-later", why: "14 catalog calculators, coherent audience (store operators); worth a hub once P1/P2 e-commerce items ship." },
  "lifecycle-retention": { verdict: "maybe", why: "4 catalog calculators today; conceptually coherent but thin until reactivation/customer-lifetime-adjacent items expand." },
  "crm-email": { verdict: "maybe", why: "8 catalog calculators, coherent audience (lifecycle/CRM marketers); reasonable hub candidate once deliverability calculators (bounce/complaint) ship." },
  "mobile-growth": { verdict: "maybe", why: "7 catalog calculators; coherent but overlaps conceptually with acquisition/retention - a hub adds value mainly for a mobile-specific audience segment." },
  saas: { verdict: "create-later", why: "11 catalog calculators, the most internally coherent audience (SaaS operators) of any category - good future hub candidate." },
  "unit-economics": { verdict: "not-needed", why: "Only 4 catalog calculators, and they're already the most-cross-linked group (LTV, LTV:CAC, CAC Payback, Break-Even) - internal links do this job better than a thin hub." },
  "cro-funnel": { verdict: "maybe", why: "6 catalog calculators, real conceptual coherence (funnel/CRO practitioners), but small until more forms/landing calculators ship." },
  experimentation: { verdict: "create-later", why: "8 catalog calculators, high topical coherence, and the one category where a hub could plausibly rank for 'a/b testing calculators' as its own query." },
};

// =======================================================================
// Build the per-calculator SEO record
// =======================================================================
// Strip disambiguating/expansion parentheticals ("CTR (ads)" -> "CTR",
// "Net Revenue Retention (NRR)" -> "Net Revenue Retention") so the
// primary keyword never reads like "ctr (ads) calculator" - a query
// nobody types. See below for recovering the acronym form as its own
// keyword when it's genuinely a distinct, short, commonly-searched form.
function baselineName(c) {
  return c.name.replace(/\s+Calculator$/i, "").replace(/\s*\([^)]*\)/g, "").trim();
}

function autoSecondary(c) {
  const base = baselineName(c).toLowerCase();
  const kws = [
    { keyword: `${base} formula`, intent: "formula", placement: "same-page" },
    { keyword: `how to calculate ${base}`, intent: "formula", placement: "same-page" },
    { keyword: `${base} example`, intent: "example", placement: "same-page" },
    { keyword: `what is ${base}`, intent: "definition", placement: "supporting-section" },
  ];
  // Short acronym slugs whose full name got stripped above are a real,
  // separate query form (e.g. "ctor calculator", "nrr calculator") -
  // add them back explicitly rather than losing them to the strip.
  if (c.slug.length <= 5 && /^[a-z]+$/.test(c.slug) && base.split(" ").length > 1) {
    kws.push({ keyword: `${c.slug} calculator`, intent: "tool", placement: "same-page" });
  }
  for (const alias of c.aliases) {
    const aliasBase = alias.toLowerCase();
    if (aliasBase !== base) kws.push({ keyword: `${aliasBase} calculator`, intent: "tool", placement: "same-page" });
  }
  const depth = contentDepth(c);
  if (depth !== "light") {
    kws.push({ keyword: `what is a good ${base}`, intent: "interpretation", placement: "supporting-section" });
  }
  if (c.modes) {
    for (const m of c.modes) {
      kws.push({ keyword: `${m.label.toLowerCase()} ${base} formula`, intent: "method-model", placement: "same-page" });
    }
  }
  return kws;
}

// Curated benchmark-intent additions - only where "average/good X" is a
// genuinely searched, genuinely answerable-with-caveats query. Not added
// blanket to every "standard/deep" calculator (most don't have reliable
// public benchmark data to point to yet).
const BENCHMARK_SLUGS = new Set(["cr", "ctr", "open-rate", "retention-rate", "cac", "roas", "aov", "unsubscribe-rate", "bounce-rate-email"]);

// Manual secondary-keyword extras for calculators whose query space is
// distinctive enough that the auto baseline undersells it. Kept short -
// most of the 77 ship with the auto baseline only, matching the brief's
// "not every page needs the same content" principle.
const MANUAL_EXTRAS = {
  roas: [{ keyword: "target roas", intent: "improvement", placement: "future-guide" }],
  cac: [{ keyword: "reduce cac", intent: "improvement", placement: "future-guide" }],
  ltv: [{ keyword: "simple vs margin-adjusted ltv", intent: "method-model", placement: "same-page" }],
  "retention-rate": [{ keyword: "improve customer retention", intent: "improvement", placement: "future-guide" }],
  "cart-abandonment": [{ keyword: "reduce cart abandonment", intent: "improvement", placement: "future-guide" }],
  "sample-size-calculator": [{ keyword: "ab test sample size formula", intent: "formula", placement: "same-page" }],
  "ab-test": [{ keyword: "statistical significance vs practical significance", intent: "glossary-related-concept", placement: "future-glossary" }],
  cr: [{ keyword: "average conversion rate by industry", intent: "benchmark", placement: "supporting-section" }],
};

const seoMap = catalog.map((c) => {
  const depth = contentDepth(c);
  const secondary = [...autoSecondary(c), ...(MANUAL_EXTRAS[c.slug] || [])];
  if (BENCHMARK_SLUGS.has(c.slug)) {
    secondary.push({ keyword: `average ${baselineName(c).toLowerCase()}`, intent: "benchmark", placement: "supporting-section" });
  }
  const comparisons = COMPARISON_BACKLOG.filter((cmp) => cmp.a === c.slug || cmp.b === c.slug || cmp.c === c.slug).map((cmp) => cmp.id);
  const risks = CANNIBALIZATION_RISK_PAIRS.filter((p) => (p.a === c.slug || p.b === c.slug) && p.risk === "cannibalization-risk")
    .map((p) => ({ with: p.a === c.slug ? p.b : p.a, why: p.why }));

  return {
    calculatorId: c.id,
    slug: c.slug,
    primaryKeyword: `${baselineName(c).toLowerCase()} calculator`,
    primaryIntent: "tool",
    secondaryKeywords: secondary,
    contentDepth: depth,
    seoPriority: PRIORITY_TO_SEO[c.priority],
    titlePattern: "{Metric Name} Calculator",
    canonicalPath: `/calculators/${c.slug}`,
    index: true,
    localizationStatus: { name: "tr-missing", formulaPlainEnglish: "tr-missing", example: "tr-missing", metadata: "tr-missing" },
    cannibalizationRisks: risks,
    futureGlossary: NEW_GLOSSARY_DISCOVERIES.filter((g) => g.relatedCalculators.includes(c.slug)).map((g) => g.id),
    futureComparisons: comparisons,
    doNotTarget: depth === "light"
      ? ["methodology", "benchmarks (unless in BENCHMARK_SLUGS)", "long interpretation guides"]
      : ["unrelated formula-family aliases already folded into this page's own keyword set"],
  };
});

writeFileSync(new URL("./calculator-seo-map.json", dir), JSON.stringify({
  _description: "Phase 3: search-intent architecture for all 77 catalog calculators. Generated from calculator-catalog.json + calculator-formula-families.json + curated overrides (see _generate-seo-map.mjs) - never hand-edit this file directly.",
  count: seoMap.length,
  calculators: seoMap,
}, null, 2) + "\n");

// =======================================================================
// Content slots (instruction 9) - depth-keyed templates, not 77
// individually authored slot lists. A calculator's contentDepth (above)
// determines which template applies; the template IS the per-calculator
// answer, since content depth was already reasoned per-calculator.
// =======================================================================
const SLOT_TEMPLATES = {
  light: {
    required: ["definition", "formulaExplanation", "howToCalculate", "workedExample", "relatedMetrics"],
    optional: ["interpretation"],
    prohibited: ["methodology", "assumptions", "limitations", "benchmarks", "faq"],
  },
  standard: {
    required: ["definition", "formulaExplanation", "howToCalculate", "workedExample", "interpretation", "commonMistakes", "relatedMetrics", "comparisonLinks"],
    optional: ["goodValue", "benchmarks", "faq"],
    prohibited: ["methodology", "assumptions", "limitations"],
  },
  deep: {
    required: ["definition", "formulaExplanation", "howToCalculate", "workedExample", "interpretation", "methodology", "assumptions", "limitations", "commonMistakes", "relatedMetrics", "comparisonLinks", "faq"],
    optional: ["benchmarks", "goodValue"],
    prohibited: [],
  },
};
const contentSlots = catalog.map((c) => {
  const depth = contentDepth(c);
  return { slug: c.slug, contentDepth: depth, ...SLOT_TEMPLATES[depth] };
});
writeFileSync(new URL("./calculator-content-slots.json", dir), JSON.stringify({
  _description: "Content slot requirements per calculator, derived from contentDepth in calculator-seo-map.json via 3 fixed templates (light/standard/deep) - not 77 individually authored lists, since depth classification already encodes the judgment.",
  templates: SLOT_TEMPLATES,
  calculators: contentSlots,
}, null, 2) + "\n");

// =======================================================================
// Cannibalization report (instruction 5)
// =======================================================================
writeFileSync(new URL("./calculator-cannibalization-report.json", dir), JSON.stringify({
  _description: "Phase 3 cannibalization audit. ALIAS pairs are verified programmatically from calculator-formula-families.json's foldedVariants (already one URL, zero risk by construction). The rest are the brief's named example collisions, hand-classified.",
  aliasPairsAlreadyMerged: ALIAS_PAIRS,
  namedCollisions: CANNIBALIZATION_RISK_PAIRS,
}, null, 2) + "\n");

// =======================================================================
// Glossary + comparison + category strategy artifacts
// =======================================================================
writeFileSync(new URL("./calculator-glossary-backlog.json", dir), JSON.stringify({
  _description: "Phase 3 glossary backlog: Phase 1's 8 glossary-classified candidates plus 11 new terms discovered while mapping calculator query intent. Structured backlog only - no glossary pages exist yet.",
  fromPhase1Candidates: EXISTING_GLOSSARY,
  newDiscoveries: NEW_GLOSSARY_DISCOVERIES,
}, null, 2) + "\n");

writeFileSync(new URL("./calculator-comparison-backlog.json", dir), JSON.stringify({
  _description: "Phase 3 comparison-page backlog. Only pairs with real confusion or decision-relevance are listed - see calculator-architecture.md / seo-architecture.md for pairs explicitly considered and rejected (MRR vs ARR, Retention vs Churn, NRR vs GRR - all already one page).",
  comparisons: COMPARISON_BACKLOG,
}, null, 2) + "\n");

writeFileSync(new URL("./calculator-category-strategy.json", dir), JSON.stringify({
  _description: "Phase 3 category-hub strategy. verdict is one of create-later / maybe / not-needed. No routes implemented - see Phase 2's own §7 decision to skip category routes for now.",
  categories: taxonomy.map((cat) => ({
    id: cat.id,
    name: cat.name,
    catalogCalculatorCount: catalog.filter((c) => c.category === cat.id).length,
    ...CATEGORY_STRATEGY_NOTES[cat.id],
  })),
}, null, 2) + "\n");

console.log(`Wrote SEO map for ${seoMap.length} calculators.`);
const byDepth = {}; for (const c of seoMap) byDepth[c.contentDepth] = (byDepth[c.contentDepth]||0)+1;
const byPrio = {}; for (const c of seoMap) byPrio[c.seoPriority] = (byPrio[c.seoPriority]||0)+1;
console.log("contentDepth:", byDepth);
console.log("seoPriority:", byPrio);
console.log("comparisons:", COMPARISON_BACKLOG.length, "| cannibalization risk pairs:", CANNIBALIZATION_RISK_PAIRS.filter(p=>p.risk==="cannibalization-risk").length, "| alias pairs (auto):", ALIAS_PAIRS.length);
console.log("glossary backlog:", EXISTING_GLOSSARY.length + NEW_GLOSSARY_DISCOVERIES.length);
