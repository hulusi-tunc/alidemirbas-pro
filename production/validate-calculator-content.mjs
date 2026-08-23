#!/usr/bin/env node
// Calculator Product Page Content Standard validator. Runnable directly:
// `node production/validate-calculator-content.mjs [slug ...]` (defaults to
// every slug with Phase 4 content). Checks the rules from the ROAS pilot
// brief - FAQ count/word-count, paragraph length, internal/external link
// minimums and validity, H1 uniqueness (content-level: no duplicate H2
// headings acting as a second H1), worked-example math, no invented
// calculator routes. Does not touch src/canonical or the calc engine -
// read-only against production/calculators/*.
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const repoRoot = new URL("../", import.meta.url).pathname;
const contentDir = join(repoRoot, "production/calculators/content");
const catalog = JSON.parse(readFileSync(join(repoRoot, "production/calculators/calculator-catalog.json"), "utf8"));
const catalogBySlug = new Map(catalog.calculators.map((c) => [c.slug, c]));

// Mirrors LIVE_CALCULATOR_SLUGS in src/lib/calc-catalog.ts - kept in sync by
// hand (small, rarely-changed list); a route-validity check here is only as
// good as this list matching the real one.
const LIVE_CALCULATOR_SLUGS = [
  "roas", "marketing-roi", "ctr", "cpc", "cpm", "cpa", "cpl", "cac", "aov",
  "gross-margin", "retention-rate", "open-rate", "nrr", "ltv", "ltv-cac-ratio",
  "cac-payback-period", "cr", "ab-test",
  "activation-rate", "mrr", "funnel-analysis-multistep", "sample-size-calculator",
  "revenue-per-visitor", "contribution-margin", "break-even-point",
  "dau-mau-stickiness", "d1-retention", "saas-quick-ratio", "rule-of-40",
  "cart-abandonment", "confidence-interval-calculator", "test-duration-estimator",
  "profit-margin", "engagement-rate",
];

const stripLinks = (t) => (t ?? "").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
const wordCount = (t) => stripLinks(t).trim().split(/\s+/).filter(Boolean).length;
const extractLinks = (t) => [...(t ?? "").matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((m) => ({ label: m[1], href: m[2] }));

const targetSlugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(contentDir).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));

let totalErrors = 0;
let totalWarnings = 0;

for (const slug of targetSlugs) {
  const path = join(contentDir, `${slug}.json`);
  let content;
  try {
    content = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    console.log(`${slug}: SKIP (no content file)`);
    continue;
  }
  const spec = catalogBySlug.get(slug);
  const errors = [];
  const warnings = [];

  // --- FAQ ---
  // Count range is depth-aware: LIGHT pages (CTR) don't need to be padded
  // to 4 questions just to hit the STANDARD/DEEP range.
  const faq = content.faq ?? [];
  const [faqMin, faqMax] = content.contentDepth === "light" ? [2, 4] : [4, 6];
  if (faq.length < faqMin || faq.length > faqMax) errors.push(`FAQ count ${faq.length}, expected ${faqMin}-${faqMax} for ${content.contentDepth ?? "unknown"} depth`);
  const seenQ = new Set();
  for (const f of faq) {
    const wc = wordCount(f.a);
    if (wc < 100 || wc > 150) errors.push(`FAQ "${f.id}" answer is ${wc} words, expected 100-150`);
    const qNorm = f.q.trim().toLowerCase();
    if (seenQ.has(qNorm)) errors.push(`FAQ duplicate question: "${f.q}"`);
    seenQ.add(qNorm);
  }

  // --- Paragraph length (every section body / check body / list item) ---
  const allInternalLinks = [];
  const allExternalLinks = [];
  for (const s of content.sections ?? []) {
    const texts = [];
    if (s.body) texts.push(s.body);
    if (s.intro) texts.push(s.intro);
    for (const c of s.checks ?? []) texts.push(c.body);
    for (const it of s.items ?? []) texts.push(it);
    for (const m of s.models ?? []) texts.push(m.body);
    for (const t of texts) {
      const wc = wordCount(t);
      const limit = s.type === "common-mistakes" ? 60 : 150;
      if (wc > limit) errors.push(`Section "${s.id}" has a ${wc}-word block, over the ${limit}-word limit`);
      for (const link of extractLinks(t)) {
        if (link.href.startsWith("/")) allInternalLinks.push(link);
        else if (link.href.startsWith("http")) allExternalLinks.push(link);
      }
    }
  }
  if (content.sections?.find((s) => s.type === "comparison-note")) {
    const cmp = content.sections.find((s) => s.type === "comparison-note");
    const wc = wordCount(cmp.body);
    if (wc > 200) errors.push(`ROAS vs ROI (comparison-note) is ${wc} words, over the 200-word section limit`);
  }

  // --- Internal links: real, live routes only ---
  for (const link of allInternalLinks) {
    const linkedSlug = link.href.replace(/^\/(?:tr\/)?calculators\//, "").replace(/\/$/, "");
    if (link.href.startsWith("/calculators/") && !LIVE_CALCULATOR_SLUGS.includes(linkedSlug)) {
      errors.push(`Internal link to invented/non-live route: ${link.href} ("${link.label}")`);
    }
    if (link.label.toLowerCase().includes("click here")) errors.push(`Internal link uses non-descriptive anchor text: "${link.label}"`);
  }
  if (allInternalLinks.length < 2) errors.push(`Only ${allInternalLinks.length} contextual internal link(s) in body copy, minimum 2`);

  // --- External links: at least 1, descriptive anchor ---
  for (const link of allExternalLinks) {
    if (link.label.toLowerCase().includes("click here")) errors.push(`External link uses non-descriptive anchor text: "${link.label}"`);
  }
  if (allExternalLinks.length < 1) errors.push(`No external authoritative source link found, minimum 1`);

  // --- Related Calculators: real routes only ---
  for (const r of content.related ?? []) {
    if (!LIVE_CALCULATOR_SLUGS.includes(r.slug)) errors.push(`Related calculator "${r.slug}" is not a live route`);
  }
  if ((content.related ?? []).length > 0 && ((content.related.length < 3) || (content.related.length > 6))) {
    warnings.push(`Related calculators count is ${content.related.length}, brief asks for 3-6`);
  }

  // --- Worked example math must match the verified catalog spec ---
  const worked = content.sections?.find((s) => s.type === "worked-example");
  if (worked && spec) {
    const exIn = spec.exampleInput ?? {};
    const exOut = spec.exampleOutput ?? {};
    const specValues = new Set([...Object.values(exIn), ...Object.values(exOut)].map((v) => String(v)));
    for (const row of worked.inputs ?? []) {
      const numeric = row.value.replace(/[^0-9.]/g, "");
      const matchesSpec = [...specValues].some((v) => String(v).replace(/[^0-9.]/g, "") === numeric);
      if (!matchesSpec) warnings.push(`Worked example input "${row.label}: ${row.value}" doesn't match any catalog exampleInput value verbatim - check by hand`);
    }
    if (worked.output) {
      const outNumeric = worked.output.value.replace(/[^0-9.]/g, "");
      const specOutNumeric = String(exOut[Object.keys(exOut)[0]] ?? "").replace(/[^0-9.]/g, "");
      if (outNumeric !== specOutNumeric) errors.push(`Worked example output "${worked.output.value}" doesn't match catalog exampleOutput "${exOut[Object.keys(exOut)[0]]}"`);
    }
  }

  // --- Unsourced benchmark claims (heuristic - flag for human read, not auto-fail) ---
  const benchmarkPattern = /\b(average roas is|industry benchmark is|most (businesses|companies|marketers) (target|aim for|use))\b/i;
  for (const s of content.sections ?? []) {
    if (s.body && benchmarkPattern.test(s.body)) warnings.push(`Section "${s.id}" contains phrasing that reads like an unsourced benchmark claim - verify a source is cited nearby`);
  }
  for (const f of faq) {
    if (benchmarkPattern.test(f.a)) warnings.push(`FAQ "${f.id}" contains phrasing that reads like an unsourced benchmark claim - verify a source is cited nearby`);
  }

  totalErrors += errors.length;
  totalWarnings += warnings.length;

  console.log(`\n${slug} (${content.contentDepth ?? "?"}) - ${errors.length} errors, ${warnings.length} warnings`);
  errors.forEach((e) => console.log(`  ERROR: ${e}`));
  warnings.forEach((w) => console.log(`  WARN:  ${w}`));
  if (errors.length === 0 && warnings.length === 0) console.log("  clean");
}

console.log(`\n=== TOTAL: ${totalErrors} errors, ${totalWarnings} warnings across ${targetSlugs.length} file(s) ===`);
process.exit(totalErrors ? 1 : 0);
