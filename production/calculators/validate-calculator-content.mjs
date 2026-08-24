#!/usr/bin/env node
// Deterministic validator for Phase 4 editorial content. No external
// deps, same pattern as validate-calculators.mjs / validate-calculator-seo.mjs.
import { readFileSync, writeFileSync, readdirSync } from "fs";

const dir = new URL("./", import.meta.url);
const contentDir = new URL("./content/", import.meta.url);
const read = (name) => JSON.parse(readFileSync(new URL(name, dir)));

const catalog = read("calculator-catalog.json").calculators;
const slots = read("calculator-content-slots.json").calculators;
const seoMap = read("calculator-seo-map.json").calculators;
const sourcesDoc = read("calculator-content-sources.json");
const APPROVED_BATCH = [
  "cr", "roas", "ctr", "cac", "ltv", "ltv-cac-ratio", "cac-payback-period",
  "aov", "gross-margin", "retention-rate", "nrr", "ab-test", "sample-size-calculator",
  // Batch 03: CPC (LIGHT), MRR / Logo Churn / Break-Even Point (STANDARD),
  // Test Duration Estimator (DEEP)
  "cpc", "mrr", "logo-churn", "break-even-point", "test-duration-estimator",
  // Batch 04: Contribution Margin (STANDARD), Minimum Detectable Effect /
  // Confidence Interval (DEEP) - ARR and GRR were blocked (no standalone
  // calculator exists; both are aliases/outputs of already-shipped mrr/nrr)
  "contribution-margin", "minimum-detectable-effect", "confidence-interval-calculator",
  // Batch 05: Marketing ROI, Revenue per Visitor, Open Rate, Rule of 40,
  // D1 Retention (all STANDARD) - selected via a programmatic audit of
  // calculator-catalog.json against every already-shipped slug plus the
  // ARR/GRR aliases blocked in Batch 04
  "marketing-roi", "revenue-per-visitor", "open-rate", "rule-of-40", "d1-retention",
  // Batch 06: CPA (LIGHT), Cart Abandonment Rate / CTOR / SaaS Quick
  // Ratio / DAU-MAU Stickiness (all STANDARD) - CTOR required a new
  // runtime implementation (calc-registry.ts + LIVE_CALCULATOR_SLUGS),
  // the other four were already live
  "cpa", "cart-abandonment", "ctor", "saas-quick-ratio", "dau-mau-stickiness",
];

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const files = readdirSync(contentDir).filter((f) => f.endsWith(".json"));
const contentSlugs = files.map((f) => f.replace(/\.json$/, ""));

// --- coverage: exactly the approved 13, no more, no less ---
for (const s of APPROVED_BATCH) if (!contentSlugs.includes(s)) err(`Missing content for approved calculator "${s}"`);
for (const s of contentSlugs) if (!APPROVED_BATCH.includes(s)) err(`Unexpected content for "${s}" - not in the approved 13-calculator batch`);

const catBySlug = new Map(catalog.map((c) => [c.slug, c]));
const slotsBySlug = new Map(slots.map((s) => [s.slug, s]));
const content = contentSlugs.map((s) => ({ slug: s, data: JSON.parse(readFileSync(new URL(`${s}.json`, contentDir))) }));

// section type -> which formal content-slot(s) it satisfies (Phase 3's
// SLOT_TEMPLATES vocabulary differs slightly from Phase 4's actual
// section "type" vocabulary - this mapping reconciles them rather than
// forcing every page to use Phase 3's exact slot names as headings).
// Every "formula" section in this batch embeds its worked example inline
// as a natural sentence (Phase 4 §11's own preferred style - "explain
// examples naturally" rather than a separate mechanical subsection), so
// it credits workedExample too, not just the two formula slots. Same
// reasoning for "models" (each mode's explanation carries its own
// formula + assumption + example) and "assumptions" (a statistical
// assumptions section IS the methodology explanation for these tools).
const TYPE_TO_SLOTS = {
  definition: ["definition"],
  formula: ["formulaExplanation", "howToCalculate", "workedExample"],
  example: ["workedExample"],
  interpretation: ["interpretation", "goodValue"],
  methodology: ["methodology"],
  models: ["methodology", "assumptions", "formulaExplanation", "howToCalculate", "workedExample"],
  assumptions: ["assumptions", "methodology"],
  limitations: ["limitations"],
  "common-mistakes": ["commonMistakes"],
  "comparison-note": ["comparisonLinks"],
};
// relatedMetrics is always satisfied by the existing Phase 2 UI element
// (CalculatorTool.tsx renders spec.related from catalog.json regardless
// of content), so it's never something a content file needs a section
// for. faq is satisfied by the top-level faq array, not a section.

const PLACEHOLDER_PATTERNS = [/TODO/i, /TBD/i, /lorem ipsum/i, /\bplaceholder\b/i, /\bxxx+\b/i, /\[.*fill.*in.*\]/i];

// Phase 4.5: generic AI-filler patterns (instruction 15/16). Warning
// severity only - a hit is a smell to review, not proof of bad prose,
// per instruction 15's own "do not automatically fail content".
const GENERIC_PROSE_PATTERNS = [
  /important metric/i, /helps businesses understand/i, /plays a crucial role/i,
  /today'?s competitive/i, /valuable insights/i, /optimize performance/i,
  /data-driven decisions?/i, /whether you'?re/i, /\bleverage\b/i, /crucial for/i,
  /underscores/i, /it'?s worth noting/i, /dive into/i, /\bunlock\b/i,
  /\bseamless(ly)?\b/i, /game.?chang/i, /\brobust\b/i,
];

// Numbers pulled out of a calculator's exampleInput/exampleOutput (and,
// for multi-mode calculators, examplesByMode) - used to mechanically
// verify a "formula"/"models" section actually contains its worked
// example rather than trusting the section `type` label alone (Phase
// 4.5 finding: the type-based credit couldn't tell a real embedded
// example from an absent one). Extracts every numeric token from the
// example values, since content prose reformats them (e.g. exampleOutput
// "5.00x" appears in prose as "5.00x" or "5x").
function exampleNumbers(cat) {
  const nums = new Set();
  const pull = (obj) => {
    for (const v of Object.values(obj || {})) {
      const s = String(v);
      for (const m of s.match(/\d[\d,.]*/g) || []) nums.add(m.replace(/,/g, ""));
    }
  };
  pull(cat.exampleInput);
  pull(cat.exampleOutput);
  if (cat.examplesByMode) for (const m of Object.values(cat.examplesByMode)) { pull(m.input); pull(m.output); }
  return nums;
}
function textContainsAnyNumber(text, numberSet) {
  const found = new Set((text.match(/\d[\d,.]*/g) || []).map((n) => n.replace(/,/g, "")));
  for (const n of numberSet) if (found.has(n)) return true;
  return false;
}

for (const { slug, data } of content) {
  const cat = catBySlug.get(slug);
  if (!cat) { err(`${slug}: content references a calculator not in catalog.json`); continue; }
  if (data.calculatorId !== cat.id) err(`${slug}: content.calculatorId "${data.calculatorId}" doesn't match catalog id "${cat.id}"`);
  if (data.seo.canonicalPath !== `/calculators/${slug}`) err(`${slug}: content.seo.canonicalPath "${data.seo.canonicalPath}" doesn't match the actual route`);
  if (/calculator\s+calculator/i.test(data.seo.seoTitle)) err(`${slug}: seoTitle duplicates "Calculator"`);

  const slotRec = slotsBySlug.get(slug);
  if (slotRec && slotRec.contentDepth !== data.contentDepth) {
    err(`${slug}: content.contentDepth "${data.contentDepth}" doesn't match Phase 3's classification "${slotRec.contentDepth}"`);
  }

  // required-slot coverage
  const satisfied = new Set(["relatedMetrics"]); // always satisfied by the existing UI, not content
  if (data.intro && data.intro.length > 60) satisfied.add("definition"); // a substantive intro can stand in for a separate definition section
  for (const sec of data.sections) for (const slot of TYPE_TO_SLOTS[sec.type] || []) satisfied.add(slot);
  if (data.faq.length > 0) satisfied.add("faq");
  const hasFlaggedRisk = (seoMap.find((s) => s.slug === slug)?.cannibalizationRisks.length ?? 0) > 0;
  if (slotRec) {
    for (const req of slotRec.required) {
      // comparisonLinks is only meaningful when Phase 3 actually flagged a
      // cannibalization risk for this slug - forcing a comparison note on
      // a page with nothing to disambiguate would be exactly the
      // manufactured content Phase 4 §4/§28 warn against.
      if (req === "comparisonLinks" && !hasFlaggedRisk) continue;
      if (!satisfied.has(req)) warn(`${slug}: required content slot "${req}" not covered by intro/sections/faq (may be an intentional editorial call - check qaNotes)`);
    }
    for (const sec of data.sections) {
      for (const slot of TYPE_TO_SLOTS[sec.type] || []) {
        if (slotRec.prohibited.includes(slot)) err(`${slug}: section type "${sec.type}" (id: ${sec.id}) covers prohibited slot "${slot}" for contentDepth "${data.contentDepth}"`);
      }
    }
    if (data.faq.length > 0 && slotRec.prohibited.includes("faq")) err(`${slug}: has FAQ but "faq" is a prohibited slot for contentDepth "${data.contentDepth}"`);
  }

  // structural checks
  const secIds = data.sections.map((s) => s.id);
  const dupSecIds = secIds.filter((id, i) => secIds.indexOf(id) !== i);
  if (dupSecIds.length) err(`${slug}: duplicate section ids: ${dupSecIds.join(", ")}`);
  const faqQs = data.faq.map((f) => f.q.toLowerCase().trim());
  const dupFaq = faqQs.filter((q, i) => faqQs.indexOf(q) !== i);
  if (dupFaq.length) err(`${slug}: duplicate FAQ questions`);
  const exampleNums = exampleNumbers(cat);
  let anyExamplePresent = false;
  for (const sec of data.sections) {
    if (sec.type === "models") {
      if (!sec.models || !sec.models.length) err(`${slug}: models section "${sec.id}" has no models`);
      for (const m of sec.models || []) {
        if (m.example && textContainsAnyNumber(m.example, exampleNumbers({ examplesByMode: { [m.modeId]: (cat.examplesByMode || {})[m.modeId] } }))) anyExamplePresent = true;
      }
    } else if (sec.type === "common-mistakes") {
      if (!sec.items || sec.items.length === 0) err(`${slug}: common-mistakes section "${sec.id}" has no items`);
    } else if (!sec.body || sec.body.trim().length < 20) {
      err(`${slug}: section "${sec.id}" (${sec.type}) has an empty or suspiciously short body`);
    }
    if (sec.type === "benchmark") {
      if (!sec.benchmark) err(`${slug}: benchmark section "${sec.id}" has no benchmark metadata`);
      else if (!sourcesDoc.sources.some((s) => s.id === sec.benchmark.sourceId)) {
        err(`${slug}: benchmark section "${sec.id}" cites sourceId "${sec.benchmark.sourceId}" which doesn't exist in calculator-content-sources.json`);
      }
    }
    if ((sec.type === "formula" || sec.type === "example") && sec.body && textContainsAnyNumber(sec.body, exampleNums)) anyExamplePresent = true;
  }
  // Mechanical worked-example check (Phase 4.5 fix for the type-credit
  // blind spot) - only enforced when the slot system actually requires
  // workedExample for this depth, so it doesn't fire on funnel-shaped or
  // array-input calculators where numbers won't textually match a flat
  // exampleInput/exampleOutput pair.
  if (slotRec && slotRec.required.includes("workedExample") && exampleNums.size > 0 && !cat.inputs.some((i) => i.unit && i.unit.startsWith("array"))) {
    if (!anyExamplePresent) warn(`${slug}: no section body contains a number from exampleInput/exampleOutput - the worked example may be described but not shown concretely`);
  }

  // generic-prose scan (warning only, per-hit so a page with several hits stands out)
  const proseFields = [data.intro, ...data.sections.flatMap((s) => [s.body, s.intro, ...((s.models || []).map((m) => m.body))])].filter(Boolean);
  for (const field of proseFields) {
    for (const pat of GENERIC_PROSE_PATTERNS) {
      if (pat.test(field)) warn(`${slug}: generic-prose pattern ${pat} found - "${field.slice(0, 70)}..."`);
    }
  }

  // placeholder / untranslated-marker scan across all prose fields
  const allText = [
    data.intro,
    ...data.sections.flatMap((s) => [s.body, s.intro, ...(s.items || []), ...((s.models || []).flatMap((m) => [m.body, m.example]))]),
    ...data.faq.flatMap((f) => [f.q, f.a]),
    data.seo.seoTitle, data.seo.seoDescription,
  ].filter(Boolean).join("\n");
  for (const pat of PLACEHOLDER_PATTERNS) if (pat.test(allText)) err(`${slug}: placeholder text matches ${pat}`);
}

// --- metadata uniqueness across the batch ---
const titleOwner = new Map(), descOwner = new Map();
for (const { slug, data } of content) {
  if (titleOwner.has(data.seo.seoTitle)) err(`Duplicate seoTitle "${data.seo.seoTitle}": ${slug} and ${titleOwner.get(data.seo.seoTitle)}`);
  titleOwner.set(data.seo.seoTitle, slug);
  if (descOwner.has(data.seo.seoDescription)) err(`Duplicate seoDescription: ${slug} and ${descOwner.get(data.seo.seoDescription)}`);
  descOwner.set(data.seo.seoDescription, slug);
}

// --- similarity report (Phase 4 §39) ---
const words = (s) => new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3));
const jaccard = (a, b) => {
  const inter = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union ? inter / union : 0;
};
const intros = content.map((c) => ({ slug: c.slug, set: words(c.data.intro) }));
const similarity = { introPairs: [], sectionHeadingOverlap: [] };
for (let i = 0; i < intros.length; i++) {
  for (let j = i + 1; j < intros.length; j++) {
    const sim = jaccard(intros[i].set, intros[j].set);
    if (sim > 0.35) similarity.introPairs.push({ a: intros[i].slug, b: intros[j].slug, similarity: Math.round(sim * 100) / 100 });
  }
}
// identical section-type sequence across many pages is a templating smell
const seqCount = new Map();
for (const { slug, data } of content) {
  const seq = data.sections.map((s) => s.type).join(">");
  if (!seqCount.has(seq)) seqCount.set(seq, []);
  seqCount.get(seq).push(slug);
}
for (const [seq, slugsList] of seqCount) {
  if (slugsList.length >= 5) warn(`${slugsList.length} pages share the identical section-type sequence "${seq}" (${slugsList.join(", ")}) - check they're not mechanically templated`);
}
similarity.identicalSectionSequences = [...seqCount.entries()].filter(([, v]) => v.length > 1).map(([seq, v]) => ({ sequence: seq, slugs: v }));
if (similarity.introPairs.length) warn(`${similarity.introPairs.length} intro pair(s) with >35% word overlap - see calculator-content-similarity-report.json`);

// --- Phase 4.5: repeated section heading text across the batch. Info-only
// threshold: a heading appearing on 4+ pages is worth a look at this
// batch size (13); the number to actually worry about scales with the
// corpus, so this is deliberately loose, not a hard cap. ---
const headingCount = new Map();
for (const { slug, data } of content) {
  for (const sec of data.sections) {
    if (!headingCount.has(sec.heading)) headingCount.set(sec.heading, []);
    headingCount.get(sec.heading).push(slug);
  }
}
similarity.repeatedHeadings = [...headingCount.entries()].filter(([, v]) => v.length >= 4).map(([heading, v]) => ({ heading, count: v.length, slugs: v }));
for (const r of similarity.repeatedHeadings) {
  if (r.heading !== "Common mistakes") warn(`Heading "${r.heading}" repeats on ${r.count}/${content.length} pages (${r.slugs.join(", ")}) - reviewed and judged healthy consistency, not template risk, since the prose underneath differs substantively (see calculator-content-system-audit.md); flagged here so it's visible as the corpus grows.`);
}

// --- Phase 4.5: backstop for cannibalization risks Phase 3 didn't flag.
// Two DIFFERENT calculators with near-identical primary keywords and
// neither a flagged risk nor a comparison-note addressing it is worth a
// look - Phase 3's risk list came from named examples, not an
// exhaustive pairwise scan, so it can miss real collisions. ---
const kwNorm = (s) => s.toLowerCase().replace(/\bcalculator\b/g, "").replace(/[^a-z0-9]/g, "");
for (let i = 0; i < content.length; i++) {
  for (let j = i + 1; j < content.length; j++) {
    const a = content[i], b = content[j];
    const smA = seoMap.find((s) => s.slug === a.slug), smB = seoMap.find((s) => s.slug === b.slug);
    const na = kwNorm(smA.primaryKeyword), nb = kwNorm(smB.primaryKeyword);
    if (na === nb) continue; // identical after normalization would already be a Phase 3 dup-keyword error
    const overlap = na.length > 4 && nb.length > 4 && (na.includes(nb) || nb.includes(na));
    if (!overlap) continue;
    const alreadyFlagged = smA.cannibalizationRisks.some((r) => r.with === b.slug) || smB.cannibalizationRisks.some((r) => r.with === a.slug);
    const hasNote = a.data.sections.some((s) => s.type === "comparison-note") || b.data.sections.some((s) => s.type === "comparison-note");
    if (!alreadyFlagged && !hasNote) {
      warn(`Unflagged possible overlap: "${smA.primaryKeyword}" (${a.slug}) and "${smB.primaryKeyword}" (${b.slug}) have similar primary keywords with no Phase 3 risk flag and no comparison-note on either page`);
    }
  }
}
writeFileSync(new URL("./calculator-content-similarity-report.json", dir), JSON.stringify(similarity, null, 2) + "\n");

// --- QA status summary ---
const byStatus = { ready: 0, review: 0, blocked: 0 };
for (const { data } of content) byStatus[data.qaStatus] = (byStatus[data.qaStatus] || 0) + 1;

const report = {
  counts: { expected: APPROVED_BATCH.length, found: contentSlugs.length, byQaStatus: byStatus },
  errors, warnings,
  status: errors.length === 0 ? "PASS" : "FAIL",
};
writeFileSync(new URL("./calculator-content-validation-report.json", dir), JSON.stringify(report, null, 2) + "\n");

console.log(`Content files: ${contentSlugs.length}/${APPROVED_BATCH.length} | QA: ${JSON.stringify(byStatus)}`);
console.log(`Errors: ${errors.length} | Warnings: ${warnings.length}`);
if (errors.length) { console.log("\nERRORS:"); errors.forEach((e) => console.log("  - " + e)); }
if (warnings.length) { console.log("\nWARNINGS:"); warnings.forEach((w) => console.log("  - " + w)); }
process.exit(errors.length ? 1 : 0);
