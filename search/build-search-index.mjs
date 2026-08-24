#!/usr/bin/env node
// Builds search/search-index.json, search-index-light.json, search-manifest.json,
// search-facets.json, search-relations.json and search-aliases.json from the
// real corpus sources - no @/ path-alias imports (see seo/seo-validator.mjs's
// own note on why plain JSON/text reads are used instead of importing .ts
// modules through Next's bundler-only aliases).
// Run: node search/build-search-index.mjs
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rd = (p) => readFileSync(path.join(ROOT, p), "utf8");
const rj = (p) => JSON.parse(rd(p));
const SITE_URL = "https://alidemirbas.com.tr";

/* ============================================================ Goal taxonomy
   Ported VERBATIM from src/lib/journey-taxonomy.ts (same order, same
   patterns) - see that file's own comment on why it can't be imported
   here and must be kept in sync by hand. */
const GOAL_RULES = [
  ["eligibility-qualification", /eligib|qualif/i],
  ["consent-permission", /consent|permission|preference|contactability|opt.?(in|out)/i],
  ["identity-verification", /identit|verif|authenticat/i],
  ["expiry-renewal", /expir|renew/i],
  ["cancellation-termination", /cancel|terminat|closure|closed|close\b/i],
  ["suspension-restoration", /suspen|restor|reinstat/i],
  ["revocation-access-change", /revok|entitlement|provision|deprovision|capability|credential/i],
  ["ownership-transfer", /ownership|transfer|delegat|custody|assign\b/i],
  ["merge-consolidation", /merge|consolidat|duplicate|link(ed)?\b|split\b/i],
  ["reconciliation-correction", /reconcil|correct|mismatch|discrepan|financial obligation/i],
  ["recovery-retry", /recover|retry|resume|failure|failed/i],
  ["escalation-exception", /escalat|exception|override|violation/i],
  ["delivery-confirmation", /deliver|confirm|submit|dispatch/i],
  ["compensation-remedy", /compensat|remedy|refund|credit\b|dispute|chargeback/i],
  ["change-versioning", /version|amend|supersede|migrat|rollout|deploy|cutover/i],
  ["scheduling-commitment", /schedul|reservat|appointment|slot|booking|availability/i],
  ["decision-approval", /approv|review|decision|authoris|authoriz/i],
  ["risk-compliance", /risk|complian|polic(y|ies)|block|threshold/i],
  ["data-integrity", /\bdata\b|import|parse|backfill|transform/i],
  ["progression-milestone", /onboarding|activation|adoption|progress|queue|process(ing)?\b|execution|attendance/i],
];
function goalOf(text) {
  for (const [goal, re] of GOAL_RULES) if (re.test(text)) return goal;
  return "review-required";
}

const STAGE_BY_CATEGORY = { acquisition: "acquisition-qualification", activation: "activation-onboarding", retention: "engagement-retention", terminal: "ending-closure" };
function lifecycleStageOf(category) {
  return STAGE_BY_CATEGORY[category] ?? "cross-lifecycle";
}

const AB_STAGE_MAP = { checkout: "engagement-retention", cart: "engagement-retention", thankyou: "ending-closure", form: "acquisition-qualification", home: "acquisition-qualification" };
const AB_CATEGORY_MAP = {
  "Cart & Checkout": "cart-and-checkout", "Category & Listing": "search-and-discovery", "Dashboard": null,
  "Forms & Signup": "acquisition-and-onboarding", "Home & Landing": "acquisition-and-onboarding", "Mobile App": "mobile",
  "Pricing": "pricing-and-monetization", "Product Detail Page": "search-and-discovery", "SaaS & B2B": "saas-and-b2b",
  "Search & Filtering": "search-and-discovery", "Thank You": "cart-and-checkout", "UI Elements": null,
};
const CALC_CATEGORY_MAP = {
  advertising: "advertising-and-media", acquisition: "acquisition-and-onboarding", ecommerce: "cart-and-checkout",
  "lifecycle-retention": "retention-and-engagement", "crm-email": "crm-and-lifecycle", "mobile-growth": "mobile",
  saas: "saas-and-b2b", "unit-economics": "unit-economics", "cro-funnel": "experimentation-and-testing", experimentation: "experimentation-and-testing",
};
const JOURNEY_STAGE_TO_NORMALIZED = { "acquisition-qualification": "acquisition-and-onboarding", "activation-onboarding": "acquisition-and-onboarding", "engagement-retention": "retention-and-engagement", "ending-closure": null, "cross-lifecycle": null };

const truncate = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…");
const uniq = (arr) => [...new Set(arr.filter(Boolean))];

const docs = [];

/* ==================================================================== A/B TESTS */
const abTests = rj("src/data/ab-tests.json");
for (const r of abTests) {
  const kpiLabels = uniq([r.primaryKpi?.label, ...(r.otherKpis ?? []).map((k) => k.label)]);
  const whatToTestLabels = (r.whatToTest ?? []).map((w) => w.label);
  const searchText = truncate(
    [r.question, r.hypothesis, r.category, kpiLabels.join(", "), whatToTestLabels.join(", ")].filter(Boolean).join(". "),
    2000,
  );
  const objectiveText = `${r.question} ${r.hypothesis}`;
  docs.push({
    id: `ab-test:${r.id}`,
    type: "ab-test",
    slug: r.slug,
    url: `/lab/ab-testing/library/${r.slug}`,
    urlTr: `/tr/lab/ab-testing/library/${r.slug}`,
    external: false,
    title: r.seoTitle ?? r.question,
    summary: truncate(r.seoDescription ?? r.hypothesis, 400),
    searchText,
    keywords: uniq([r.id, ...kpiLabels]),
    category: [r.category],
    normalizedCategory: uniq([AB_CATEGORY_MAP[r.category] ?? null]),
    surface: [r.surface],
    funnelStage: uniq([AB_STAGE_MAP[r.surface] ?? null]),
    metric: kpiLabels,
    businessObjective: [goalOf(objectiveText)],
    intent: ["find-test", "find-example", "learn"],
    tags: [],
    language: "en+tr",
    indexable: true,
    canonical: `${SITE_URL}/lab/ab-testing/library/${r.slug}`,
    searchAliases: [],
    boost: {},
    source: { file: ["src/data/ab-tests.json"], fields: ["id", "slug", "question", "hypothesis", "category", "surface", "primaryKpi", "otherKpis", "whatToTest", "seoTitle", "seoDescription"] },
  });
}

/* ==================================================================== JOURNEYS */
const journeys = rj("production/journey-view-model.json");
const mergedContract = rj("production/journey-merged-id-contract.json");
const journeyById = new Map(journeys.map((j) => [j.identity.id, j]));
const aliases = [];

for (const j of journeys) {
  const { identity, entry, graph, relationships, derived } = j;
  const exitHeadlines = graph.nodes.filter((n) => n.kind === "exit").slice(0, 5).map((n) => n.headline);
  const handoffTargets = (relationships.handoffs ?? []).map((h) => h.to);
  const stage = lifecycleStageOf(identity.category);
  const normalizedFromStage = JOURNEY_STAGE_TO_NORMALIZED[stage];
  const handoffText = handoffTargets.length ? `Hands off to ${handoffTargets.join(", ")}` : null;
  const searchText = truncate(
    [identity.title, identity.purpose, entry.trigger, identity.categoryTitle, handoffText, ...exitHeadlines].filter(Boolean).join(". "),
    2000,
  );
  docs.push({
    id: `journey:${identity.id}`,
    type: "journey",
    slug: identity.slug,
    url: `/lab/journeys/${identity.slug}`,
    urlTr: `/tr/lab/journeys/${identity.slug}`,
    external: false,
    title: `${identity.id} ${identity.title}`,
    summary: truncate(identity.purpose, 400),
    searchText,
    keywords: [identity.id],
    category: [identity.category],
    normalizedCategory: uniq([normalizedFromStage]),
    surface: [],
    funnelStage: [stage],
    metric: [],
    businessObjective: [goalOf(`${identity.title} ${identity.purpose}`)],
    intent: ["find-journey", "learn"],
    tags: [...derived.behaviors],
    language: "en+tr",
    indexable: true,
    canonical: `${SITE_URL}/lab/journeys/${identity.slug}`,
    searchAliases: [],
    boost: {},
    source: { file: ["production/journey-view-model.json"], fields: ["identity", "entry.trigger", "graph.nodes[exit]", "relationships.handoffs", "derived.behaviors"] },
  });
}

// Merged journey aliases - the 5 retired ids resolve to their survivor's
// document, never a document of their own (per journey-merged-id-contract.json,
// the existing source of truth this file re-reads rather than re-deciding).
for (const m of mergedContract.records) {
  const survivor = journeyById.get(m.resolvedJourneyId);
  if (!survivor) continue; // defensive - should never happen if the contract is in sync
  aliases.push({
    alias: m.requestedId,
    aliasSlugLowercased: m.requestedId.toLowerCase(),
    targetId: `journey:${m.resolvedJourneyId}`,
    targetSlug: survivor.identity.slug,
    resultVisibility: "target-only",
    type: "merged-journey",
    source: "production/journey-merged-id-contract.json",
  });
  const targetDoc = docs.find((d) => d.id === `journey:${m.resolvedJourneyId}`);
  if (targetDoc) targetDoc.searchAliases.push(m.requestedId, m.requestedId.toLowerCase());
}

/* ================================================================= CALCULATORS */
const calcContentDir = "production/calculators/content";
const liveCalcSlugs = readdirSync(path.join(ROOT, calcContentDir)).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
const catalog = rj("production/calculators/calculator-catalog.json").calculators;
const seoMap = rj("production/calculators/calculator-seo-map.json").calculators;
const catalogBySlug = new Map(catalog.map((c) => [c.slug, c]));
const seoMapBySlug = new Map(seoMap.map((c) => [c.slug, c]));
const liveCalcSet = new Set(liveCalcSlugs);

for (const slug of liveCalcSlugs) {
  const spec = catalogBySlug.get(slug);
  const seo = seoMapBySlug.get(slug);
  const content = rj(`${calcContentDir}/${slug}.json`);
  if (!spec) continue;
  const secondaryKeywords = (seo?.secondaryKeywords ?? []).map((k) => k.keyword);
  const relatedLive = (spec.relatedCalculators ?? []).filter((s) => liveCalcSet.has(s));
  const searchText = truncate(
    [content.seo.seoTitle, content.seo.seoDescription, content.intro, spec.formulaPlainEnglish, spec.category].filter(Boolean).join(". "),
    2000,
  );
  const objectiveText = `${spec.name} ${content.intro ?? ""}`;
  docs.push({
    id: `calculator:${slug}`,
    type: "calculator",
    slug,
    url: `/calculators/${slug}`,
    urlTr: `/tr/calculators/${slug}`,
    external: false,
    title: content.heroTitle ?? spec.name,
    summary: truncate(content.seo.seoDescription, 400),
    searchText,
    keywords: uniq([spec.name.replace(/\s*Calculator$/i, ""), ...secondaryKeywords]),
    category: [spec.category],
    normalizedCategory: uniq([CALC_CATEGORY_MAP[spec.category] ?? null]),
    surface: [],
    funnelStage: [],
    metric: [spec.name.replace(/\s*Calculator$/i, "")],
    businessObjective: [goalOf(objectiveText)],
    intent: ["calculate", "use-tool"],
    tags: relatedLive,
    language: "en",
    indexable: content.seo.index !== false,
    canonical: `${SITE_URL}/calculators/${slug}`,
    searchAliases: [],
    boost: {},
    source: { file: ["production/calculators/calculator-catalog.json", "production/calculators/calculator-seo-map.json", `${calcContentDir}/${slug}.json`], fields: ["name", "category", "formulaPlainEnglish", "relatedCalculators", "primaryKeyword", "secondaryKeywords", "seo.seoTitle", "seo.seoDescription", "intro"] },
  });
}

/* =============================================================== LAB PRODUCTS
   Hand-transcribed from src/lib/content.ts's copy.en.lab.projects /
   copy.tr.lab.projects (6 real entries, read directly in this session - see
   this file's own header comment for the full quoted source). Not a
   generated-from-JSON step because the source is a `const ... as const`
   inside a .ts file, not JSON - transcribed verbatim, not paraphrased. */
const LAB_PROJECTS = [
  { slug: "claude-lifecycle", name: "Lifecycle Marketing Journey Builder", desc: "Looks at the customer data you already track and builds lifecycle journeys around what you can actually measure, segment and act on.", tags: ["Claude Code Plugin", "CRM", "Lifecycle Marketing", "26 journey patterns", "9 industries"], url: "https://github.com/ali-demirbas/claude-lifecycle", external: true, poweredCorpus: null },
  { slug: "lifecycle-card-archive", name: "Canonical Journey Library", desc: "255 domain-neutral lifecycle state machines - trigger, condition, wait, outcome, exit, handoff - with the orchestration rules that decide which one owns a person at a given moment.", tags: ["CRM", "Lifecycle Marketing", "255 journeys", "26 categories"], url: "/lab/journeys", external: false, poweredCorpus: "journey" },
  { slug: "ab-test-playbook", name: "A/B Test Playbook", desc: "211 A/B test scenarios across real product journeys, with guidance on what to test, what to measure and what can invalidate the result.", tags: ["Claude Code Plugin", "A/B Testing", "CRO", "211 scenarios"], url: "/lab/ab-testing", external: false, poweredCorpus: "ab-test" },
  { slug: "dashboard-builder", name: "Marketing Dashboard Builder", desc: "Takes messy exports from different marketing platforms, checks what can actually be compared, and turns the data into a decision-ready dashboard.", tags: ["Claude Code Plugin", "Marketing Analytics", "11 dashboard templates", "17 tests"], url: "/lab/dashboard-builder", external: false, poweredCorpus: null },
  { slug: "google-ads-change-history-dashboard", name: "Google Ads Change History Explorer", desc: "Turns a Google Ads change-history export into a searchable dashboard - what changed, who changed it, when, and how significant it was.", tags: ["Python", "Google Ads", "Offline Dashboard", "57 self-tests"], url: "https://github.com/ali-demirbas/google-ads-change-history-dashboard", external: true, poweredCorpus: null },
  { slug: "numerspace", name: "Numerspace", desc: "75+ free calculator tools spanning finance, health, career, marketing and daily life - built for a fast, accurate answer, no account or paywall.", tags: ["Web App", "Calculator Tools", "75+ tools", "EN/TR"], url: "https://www.numerspace.com", external: true, poweredCorpus: null },
];
const corpusPowers = {};
for (const p of LAB_PROJECTS) {
  const searchText = truncate([p.name, p.desc, p.tags.join(", ")].join(". "), 2000);
  docs.push({
    id: `lab-product:${p.slug}`,
    type: "lab-product",
    slug: p.slug,
    url: p.url,
    urlTr: p.external ? null : (p.url === "/lab/journeys" ? "/tr/lab/journeys" : p.url === "/lab/ab-testing" ? "/tr/lab/ab-testing" : p.url === "/lab/dashboard-builder" ? "/tr/lab/dashboard-builder" : null),
    external: p.external,
    title: p.name,
    summary: truncate(p.desc, 400),
    searchText,
    keywords: p.tags, // sourced directly from the project's own real tags - e.g. Numerspace's own "Calculator Tools" tag
    category: [],
    normalizedCategory: [],
    surface: [],
    funnelStage: [],
    metric: [],
    businessObjective: [],
    intent: ["use-tool", "browse"],
    tags: p.tags,
    language: p.external ? "en" : "en+tr",
    indexable: !p.external,
    canonical: p.external ? null : `${SITE_URL}${p.url}`,
    searchAliases: [],
    boost: {},
    source: { file: ["src/lib/content.ts (copy.lab.projects, hand-transcribed)"], fields: ["name", "slug", "desc", "tags", "links"] },
  });
  if (p.poweredCorpus) corpusPowers[p.slug] = p.poweredCorpus;
}

/* ================================================================ BLOG ARTICLES
   Hand-transcribed from src/lib/blog-posts.ts (5 real posts, read in full
   this session) - same reasoning as Lab products above (source is a .ts
   literal, not JSON). */
const BLOG_POSTS = [
  { slug: "ltv-cac-ratio-doesnt-tell-you-when-to-scale", title: "LTV:CAC alone doesn't tell you when to scale", excerpt: "A 3:1 ratio is the industry shorthand for \"healthy.\" It's a fine sanity check and a bad scaling signal on its own - here's what to look at alongside it.", category: "Growth Metrics", topic: "Unit Economics", headings: ["The ratio hides its own denominator", "Marginal CAC, not average CAC", "Payback period is the faster warning light", "What to check before increasing spend"], related: ["/calculators/ltv-cac-ratio", "/calculators/cac-payback-period", "/calculators/ltv"] },
  { slug: "reading-d1-d7-d30-retention-without-fooling-yourself", title: "Reading D1/D7/D30 retention without fooling yourself", excerpt: "The most common retention-reporting mistake isn't a bad number - it's comparing cohorts that were never comparable to begin with.", category: "Growth Metrics", topic: "Retention", headings: ["A curve, not a single number", "Cohort contamination is the usual culprit", "Day-of-week and seasonality distort short windows", "What a healthy curve looks like"], related: ["/calculators/retention-rate", "/calculators/d1-retention", "/calculators/dau-mau-stickiness"] },
  { slug: "why-your-roas-looks-different-on-every-ad-platform", title: "Why your ROAS looks different on every ad platform", excerpt: "Same campaign, same spend, three different ROAS numbers depending on which platform's dashboard you're reading. The formula isn't the problem - the attribution window is.", category: "Growth Metrics", topic: "Advertising", headings: ["ROAS is simple; attribution isn't", "Click windows vs. view windows", "Last-click vs. multi-touch", "Pick one source of truth for cross-channel comparison"], related: ["/calculators/roas", "/calculators/marketing-roi", "/calculators/cpa"] },
  { slug: "what-belongs-in-a-lifecycle-journey-vs-a-campaign", title: "What actually belongs in a lifecycle journey vs. a one-off campaign", excerpt: "Not every recurring message needs a journey behind it, and not every journey should be built like a campaign. The difference is what decides whether someone enters.", category: "Lifecycle & CRM", topic: "Lifecycle Marketing", headings: ["The entry condition is the whole difference", "Journeys are for conditions that recur; campaigns are for moments", "The trap: journeys that never exit anyone", "A quick test before you build one"], related: ["/lab/journeys", "/calculators/cart-abandonment", "/calculators/activation-rate"] },
  { slug: "the-guardrail-metric-most-ab-tests-forget", title: "The guardrail metric most A/B tests forget", excerpt: "A test can win on its primary metric and still be a net loss for the business. Guardrails exist to catch exactly that - and they're the first thing a rushed test setup skips.", category: "Experimentation", topic: "A/B Testing", headings: ["Winning the metric you're watching isn't the same as winning", "A guardrail is a metric that must not get worse", "Pick the guardrail before you see results, not after", "One exception to \"don't peek early\""], related: ["/lab/ab-testing", "/calculators/ab-test", "/calculators/sample-size-calculator"] },
];
const explicitBlogRelations = [];
for (const p of BLOG_POSTS) {
  const searchText = truncate([p.title, p.excerpt, p.category, p.topic, p.headings.join(", ")].join(". "), 2000);
  docs.push({
    id: `blog-article:${p.slug}`,
    type: "blog-article",
    slug: p.slug,
    url: `/blog/${p.slug}`,
    urlTr: null,
    external: false,
    title: p.title,
    summary: truncate(p.excerpt, 400),
    searchText,
    keywords: [],
    category: [p.category],
    normalizedCategory: [],
    surface: [],
    funnelStage: [],
    metric: [],
    businessObjective: [goalOf(`${p.title} ${p.excerpt}`)],
    intent: ["learn"],
    tags: [p.topic],
    language: "en",
    indexable: true,
    canonical: `${SITE_URL}/blog/${p.slug}`,
    searchAliases: [],
    boost: {},
    source: { file: ["src/lib/blog-posts.ts (hand-transcribed)"], fields: ["title", "excerpt", "category", "topic", "sections[].heading", "related"] },
  });
  for (const href of p.related) explicitBlogRelations.push({ from: `blog-article:${p.slug}`, hrefHint: href });
}

/* ========================================================= RELATIONS ENGINE
   Deterministic, scored, reasoned - never an opaque "these seem similar."
   See search-relations.json's own _description for the scoring model. */
function resolveHrefToDocId(href) {
  if (href.startsWith("/calculators/")) return `calculator:${href.replace("/calculators/", "")}`;
  if (href === "/lab/journeys") return null; // library index, not a single journey - no doc to point at
  if (href === "/lab/ab-testing") return "lab-product:ab-test-playbook";
  return null;
}

const edges = []; // { from, to, reasons: [...], score }
function addEdge(from, to, reason, score) {
  if (from === to) return; // no self-relations
  let e = edges.find((x) => x.from === from && x.to === to);
  if (!e) { e = { from, to, reasons: [], score: 0 }; edges.push(e); }
  if (!e.reasons.includes(reason)) e.reasons.push(reason);
  e.score += score;
}

// 1. Explicit relations (score 1.0, always kept) - calculator catalog's own relatedCalculators
for (const d of docs.filter((d) => d.type === "calculator")) {
  const spec = catalogBySlug.get(d.slug);
  for (const relSlug of (spec.relatedCalculators ?? [])) {
    if (liveCalcSet.has(relSlug)) addEdge(d.id, `calculator:${relSlug}`, "explicit-product-relation", 1.0);
  }
}
// 2. Explicit relations - blog post's own related[] links
for (const r of explicitBlogRelations) {
  const toId = resolveHrefToDocId(r.hrefHint);
  if (toId && docs.some((d) => d.id === toId)) addEdge(r.from, toId, "explicit-content-relation", 1.0);
}

// 3. Scored relations: normalizedCategory / funnelStage / metric overlap,
// computed pairwise within each relevant type-pair pool (not the full
// O(n^2) over 518 docs - bounded to pairs that could plausibly relate).
function jaccard(a, b) {
  const A = new Set(a.map((x) => x.toLowerCase())), B = new Set(b.map((x) => x.toLowerCase()));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

const calcDocs = docs.filter((d) => d.type === "calculator");
const abDocs = docs.filter((d) => d.type === "ab-test");
const journeyDocs = docs.filter((d) => d.type === "journey");

// calculator <-> ab-test: shared-category + shared-metric
for (const c of calcDocs) {
  for (const a of abDocs) {
    const catOverlap = jaccard(c.normalizedCategory, a.normalizedCategory);
    const metricOverlap = jaccard(c.metric, a.metric);
    if (catOverlap > 0) { addEdge(c.id, a.id, "shared-category", 0.5 * catOverlap); addEdge(a.id, c.id, "shared-category", 0.5 * catOverlap); }
    if (metricOverlap >= 0.2) { addEdge(c.id, a.id, "shared-metric", 0.6 * metricOverlap); addEdge(a.id, c.id, "shared-metric", 0.6 * metricOverlap); }
  }
}
// calculator <-> journey: shared-category + shared-stage
for (const c of calcDocs) {
  for (const j of journeyDocs) {
    const catOverlap = jaccard(c.normalizedCategory, j.normalizedCategory);
    if (catOverlap > 0) { addEdge(c.id, j.id, "shared-category", 0.5 * catOverlap); addEdge(j.id, c.id, "shared-category", 0.5 * catOverlap); }
  }
}
// ab-test <-> journey: shared-category only (no shared metric/stage concept in common)
for (const a of abDocs) {
  for (const j of journeyDocs) {
    const catOverlap = jaccard(a.normalizedCategory, j.normalizedCategory);
    if (catOverlap > 0) { addEdge(a.id, j.id, "shared-category", 0.5 * catOverlap); addEdge(j.id, a.id, "shared-category", 0.5 * catOverlap); }
  }
}

// Keep only meaningful edges - min relevance threshold, capped fan-out per
// source document, split into relatedPrimary (score >= 1.0) / relatedSecondary
// (0.3 <= score < 1.0). Below 0.3, drop - "yüzlerce anlamsız link" guard.
const byFrom = new Map();
for (const e of edges) {
  if (e.score < 0.3) continue;
  if (!byFrom.has(e.from)) byFrom.set(e.from, []);
  byFrom.get(e.from).push(e);
}
const relationsOut = {};
for (const [from, list] of byFrom) {
  list.sort((a, b) => b.score - a.score);
  const primary = list.filter((e) => e.score >= 1.0).slice(0, 3);
  const secondary = list.filter((e) => e.score < 1.0).slice(0, 3);
  relationsOut[from] = {
    relatedPrimary: primary.map((e) => ({ to: e.to, reasons: e.reasons, score: Number(e.score.toFixed(3)) })),
    relatedSecondary: secondary.map((e) => ({ to: e.to, reasons: e.reasons, score: Number(e.score.toFixed(3)) })),
  };
}

/* ================================================================ VALIDATION
   Drop any relation edge whose target id doesn't exist (broken-target guard) */
const allIds = new Set(docs.map((d) => d.id));
for (const from of Object.keys(relationsOut)) {
  for (const bucket of ["relatedPrimary", "relatedSecondary"]) {
    relationsOut[from][bucket] = relationsOut[from][bucket].filter((e) => allIds.has(e.to));
  }
}

/* =================================================================== OUTPUT */
writeFileSync(path.join(ROOT, "search/search-index.json"), JSON.stringify(docs, null, 2) + "\n");

// Light index: drop searchText and source (the two heaviest, least-essential-
// for-client fields) - only generated because the payload-size check below
// showed a real reason to (see search-manifest.json's own sizeReport).
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured out on purpose, to drop them from `rest`
const lightDocs = docs.map(({ searchText, source, ...rest }) => rest);
writeFileSync(path.join(ROOT, "search/search-index-light.json"), JSON.stringify(lightDocs, null, 2) + "\n");

writeFileSync(path.join(ROOT, "search/search-relations.json"), JSON.stringify({
  _description: "Per-document related-content edges, keyed by document id. Each edge carries its reasons[] and a deterministic score - never an opaque similarity number. Minimum relevance threshold 0.3; relatedPrimary requires score >= 1.0 (always includes at least one explicit-* reason, since only explicit relations score that high on their own... unless enough scored signals stack).",
  scoringModel: {
    "explicit-product-relation": "1.0 - from calculator-catalog.json's own relatedCalculators field",
    "explicit-content-relation": "1.0 - from a blog post's own related[] links",
    "shared-category": "0.5 * normalizedCategory Jaccard overlap",
    "shared-metric": "0.6 * metric[] Jaccard overlap, only counted if overlap >= 0.2",
    "shared-stage": "not currently producing edges - see note below",
    "note": "shared-stage (funnelStage overlap) is defined in the taxonomy but produced zero qualifying edges in this generation pass, since journey/ab-test funnelStage population is deliberately sparse (see search-taxonomy.json's abTestStageMap - only 5 of 14 surfaces map) - documented rather than forced to produce output.",
  },
  corpusPowers,
  relations: relationsOut,
}, null, 2) + "\n");

writeFileSync(path.join(ROOT, "search/search-aliases.json"), JSON.stringify({
  _description: "Search-time aliases - a query matching `alias` should resolve to `targetId`'s document, never create a separate result. Currently populated only by the 5 merged journeys (journey-merged-id-contract.json is the source of truth this list is generated from, never re-decided here).",
  aliases,
}, null, 2) + "\n");

const countsByType = {};
for (const d of docs) countsByType[d.type] = (countsByType[d.type] ?? 0) + 1;
const countsByCategory = {};
for (const d of docs) for (const c of d.normalizedCategory) countsByCategory[c] = (countsByCategory[c] ?? 0) + 1;
const countsBySurface = {};
for (const d of docs) for (const s of d.surface) countsBySurface[s] = (countsBySurface[s] ?? 0) + 1;
const countsByStage = {};
for (const d of docs) for (const s of d.funnelStage) countsByStage[s] = (countsByStage[s] ?? 0) + 1;
const countsByMetric = {};
for (const d of docs) for (const m of d.metric) countsByMetric[m] = (countsByMetric[m] ?? 0) + 1;

const rawSizes = {
  "src/data/ab-tests.json": Buffer.byteLength(rd("src/data/ab-tests.json")),
  "production/journey-view-model.json": Buffer.byteLength(rd("production/journey-view-model.json")),
};
const indexJson = readFileSync(path.join(ROOT, "search/search-index.json"), "utf8");
const lightJson = readFileSync(path.join(ROOT, "search/search-index-light.json"), "utf8");
const docSizes = docs.map((d) => Buffer.byteLength(JSON.stringify(d)));

writeFileSync(path.join(ROOT, "search/search-manifest.json"), JSON.stringify({
  _description: "Reproducibility + payload manifest for search-index.json. sourceVersion identifies the generator commit context by describing WHAT was read, not a timestamp (this repo's own convention for deterministic build scripts avoids Date.now()).",
  sourceVersion: {
    abTestRecordCount: abTests.length,
    journeyRecordCount: journeys.length,
    mergedJourneyCount: mergedContract.records.length,
    liveCalculatorCount: liveCalcSlugs.length,
    labProductCount: LAB_PROJECTS.length,
    blogArticleCount: BLOG_POSTS.length,
  },
  totalDocuments: docs.length,
  countsByType,
  countsByCategory,
  countsBySurface,
  countsByStage,
  countsByMetric,
  aliasCount: aliases.length,
  relationshipCount: Object.values(relationsOut).reduce((n, r) => n + r.relatedPrimary.length + r.relatedSecondary.length, 0),
  sizeReport: {
    rawSourceSizeBytes: rawSizes,
    searchIndexSizeBytes: Buffer.byteLength(indexJson),
    searchIndexLightSizeBytes: Buffer.byteLength(lightJson),
    averageDocumentSizeBytes: Math.round(docSizes.reduce((a, b) => a + b, 0) / docSizes.length),
    maxDocumentSizeBytes: Math.max(...docSizes),
    minDocumentSizeBytes: Math.min(...docSizes),
  },
}, null, 2) + "\n");

console.log(`Wrote ${docs.length} search documents (${countsByType["ab-test"]} ab-test, ${countsByType.journey} journey, ${countsByType.calculator} calculator, ${countsByType["lab-product"]} lab-product, ${countsByType["blog-article"]} blog-article)`);
console.log(`search-index.json: ${(Buffer.byteLength(indexJson) / 1024).toFixed(0)} KB, search-index-light.json: ${(Buffer.byteLength(lightJson) / 1024).toFixed(0)} KB`);
console.log(`${aliases.length} aliases, ${Object.keys(relationsOut).length} documents with at least one relation edge`);

/* =================================================================== FACETS */
function buildFacet(dimensionName, extractor) {
  const counts = {};
  for (const d of docs) {
    const values = extractor(d);
    for (const v of values) counts[v] = (counts[v] ?? 0) + 1;
  }
  const values = Object.entries(counts)
    .map(([value, documentCount]) => ({ value, documentCount, lowUtility: documentCount <= 2 }))
    .sort((a, b) => b.documentCount - a.documentCount);
  return { dimension: dimensionName, distinctValues: values.length, values };
}

const facets = {
  _description: "Filterable dimensions with real, computed document counts - no facet label/UI here (design's job, see SEARCH-DESIGN-HANDOFF.md), just the semantic values and how many real documents each one covers. lowUtility:true marks a facet value with <=2 documents - still real, just not worth surfacing as a prominent filter chip at this corpus size.",
  type: buildFacet("type", (d) => [d.type]),
  normalizedCategory: buildFacet("normalizedCategory", (d) => d.normalizedCategory),
  surface: buildFacet("surface", (d) => d.surface),
  funnelStage: buildFacet("funnelStage", (d) => d.funnelStage),
  businessObjective: buildFacet("businessObjective", (d) => d.businessObjective),
  metric: buildFacet("metric", (d) => d.metric),
  abTestNativeCategory: buildFacet("category (ab-test native)", (d) => (d.type === "ab-test" ? d.category : [])),
  calculatorNativeCategory: buildFacet("category (calculator native)", (d) => (d.type === "calculator" ? d.category : [])),
  journeyDerivedBehaviorTags: buildFacet("tags (journey derived.behaviors)", (d) => (d.type === "journey" ? d.tags : [])),
};
writeFileSync(path.join(ROOT, "search/search-facets.json"), JSON.stringify(facets, null, 2) + "\n");
console.log(`Wrote ${Object.keys(facets).length - 1} facet dimensions`);
