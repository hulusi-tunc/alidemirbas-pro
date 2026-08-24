#!/usr/bin/env node
// Deterministic, dependency-free headless search prototype - implements
// search-ranking-contract.json against search-index.json. Not a UI, not a
// production search engine - exists to prove the contract is implementable
// and test it against search-query-fixtures.json.
// Run: node search/headless-search-prototype.mjs [--query "some query"] [--verbose]
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rj = (p) => JSON.parse(readFileSync(path.join(ROOT, p), "utf8"));

const index = rj("search/search-index.json");
const aliases = rj("search/search-aliases.json").aliases;
const synonymsData = rj("search/search-synonyms.json").synonyms;
const ranking = rj("search/search-ranking-contract.json");

/* ---------------------------------------------------------- normalization */
function normalize(s) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^\p{L}\p{N}\s/-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function tokenize(s) {
  return normalize(s).split(/[\s/-]+/).filter(Boolean);
}
// Splitting IDs like "ACC-75" on the hyphen means a bare numeric query
// token ("75") can spuriously match the numeric half of an unrelated
// document's id. Numeric-only tokens under 3 digits are too short to be a
// real signal on their own (found via search-query-fixtures.json: "75+
// calculator tools" was matching journey:ACC-75 on "75" alone before this
// guard) - dropped from scoring, not from tokenize() itself (keyword-exact
// lookups like "AB-001" still need the full multi-digit id intact).
function isNoiseToken(t) {
  return /^\d{1,2}$/.test(t);
}
// Additive Turkish-character folding. EMPIRICALLY VERIFIED (not assumed):
// normalize()'s NFD-decompose-then-strip-combining-marks step already
// folds ö/ü/ş/ğ/ç to o/u/s/g/c as a side effect, because those 5 letters
// have a canonical NFD decomposition into base-letter + combining mark in
// Unicode (confirmed by testing normalize('şık çiçek öğün üzüm') ->
// 'sık cicek ogun uzum' before this fold was added). Turkish dotless ı
// (and capital İ, which .toLowerCase() already handles) is the ONE real
// gap - it has no NFD decomposition, so it survives normalize() as a
// distinct character and needs its own explicit fold. This is why the
// fold table below is only one entry, not six - the other five were a
// false assumption in this file's own first draft, corrected after
// actually running the test instead of trusting the assumption.
function foldTurkish(t) {
  return t.replace(/ı/g, "i");
}
function tokenVariants(t) {
  const folded = foldTurkish(t);
  return folded === t ? [t] : [t, folded];
}

/* ---------------------------------------------------------------- aliases */
function resolveAlias(query) {
  const norm = normalize(query);
  for (const a of aliases) {
    if (normalize(a.alias) === norm || a.aliasSlugLowercased === norm) return a;
  }
  return null;
}

/* --------------------------------------------------------------- synonyms */
// term -> [equivalents], built both directions (term->equivalents and each
// equivalent->term+other equivalents), all lowercased for matching.
const synonymMap = new Map();
function addSynonym(a, b) {
  const ka = normalize(a);
  if (!synonymMap.has(ka)) synonymMap.set(ka, new Set());
  synonymMap.get(ka).add(normalize(b));
}
for (const s of synonymsData) {
  for (const eq of s.equivalents) {
    addSynonym(s.term, eq);
    addSynonym(eq, s.term);
  }
}
function expandTokensWithSynonyms(tokens, rawQueryNorm) {
  const expanded = new Set(tokens);
  // whole-query synonym match (handles multi-word terms like "return on ad spend")
  if (synonymMap.has(rawQueryNorm)) for (const eq of synonymMap.get(rawQueryNorm)) for (const t of eq.split(/\s+/)) expanded.add(t);
  for (const t of tokens) if (synonymMap.has(t)) for (const eq of synonymMap.get(t)) for (const w of eq.split(/\s+/)) expanded.add(w);
  // Turkish dotless-ı folding (see foldTurkish's own comment) - additive,
  // both directions, so a query typed either with or without Turkish
  // characters matches indexed text typed the other way.
  for (const t of [...expanded]) for (const v of tokenVariants(t)) expanded.add(v);
  return [...expanded];
}

/* ----------------------------------------------------------- query intent */
function classifyIntent(queryNorm) {
  const intents = new Set();
  for (const rule of ranking.queryIntentSignals.rules) {
    for (const trig of rule.triggers) if (queryNorm.includes(normalize(trig))) intents.add(rule.intent);
  }
  if (intents.has("find-test") || intents.has("find-journey")) intents.add("find-example");
  return [...intents];
}

/* ------------------------------------------------------------- IDF weight
   A token that appears in the title/keywords of MANY documents (e.g.
   "calculator", present in all 43 calculator titles) is a weak
   discriminating signal and shouldn't score the same as a rare, specific
   token. Standard IDF-style dampening, computed once from the corpus
   itself - not hand-tuned per token. Found necessary while running
   search-query-fixtures.json (see SEARCH-DESIGN-HANDOFF.md's own note on
   this - "75+ calculator tools" was initially outranking the one document
   that actually says "75+ calculator tools", Numerspace, purely because
   43 other documents all contain the word "calculator"). */
const docFrequency = new Map();
for (const doc of index) {
  const tokens = new Set([...tokenize(doc.title), ...doc.keywords.flatMap(tokenize)]);
  for (const t of tokens) docFrequency.set(t, (docFrequency.get(t) ?? 0) + 1);
}
const N = index.length;
function idfWeight(token) {
  const df = docFrequency.get(token) ?? 1;
  // log((N+1)/(df+1)) + 1, then clamped to [0.35, 1] so a token present on
  // literally every document still contributes a little (it's not noise,
  // just not distinguishing), and a truly unique token gets the full
  // weight rather than an unbounded multiplier.
  const raw = Math.log((N + 1) / (df + 1)) + 1;
  const normalized = raw / (Math.log(N + 1) + 1);
  return Math.max(0.35, Math.min(1, normalized));
}

/* -------------------------------------------------------------- scoring */
function scoreDocument(doc, queryNorm, tokens, expandedTokens, queryIntents) {
  let score = 0;
  const explain = [];
  const titleNorm = normalize(doc.title);

  if (titleNorm === queryNorm) { score += 100; explain.push("exact-title-match"); }
  if (doc.keywords.some((k) => normalize(k) === queryNorm)) { score += 90; explain.push("acronym-exact-match"); }
  if (titleNorm.startsWith(queryNorm) && queryNorm.length > 2) { score += 60; explain.push("title-prefix-match"); }

  // Every document-side token set below is expanded with its own Turkish-
  // folded variants too (not just the query side) - a query already typed
  // in plain ASCII ("orani") needs the document's own "ı"-bearing token
  // ("oranı") folded down to match it, the reverse of what expandTokens-
  // WithSynonyms does for the query. Folding both sides is what makes the
  // match direction-independent.
  const foldSet = (tokens) => new Set(tokens.flatMap((t) => tokenVariants(t)));

  const titleTokens = foldSet(tokenize(doc.title));
  let titleWeighted = 0, titleHits = 0;
  for (const t of expandedTokens) if (!isNoiseToken(t) && titleTokens.has(t)) { titleWeighted += 12 * idfWeight(t); titleHits++; }
  if (titleHits) { score += titleWeighted; explain.push(`title-token-match(${titleHits})`); }

  const kwTokens = foldSet(doc.keywords.flatMap(tokenize));
  let kwWeighted = 0, kwHits = 0;
  for (const t of expandedTokens) if (!isNoiseToken(t) && kwTokens.has(t)) { kwWeighted += 8 * idfWeight(t); kwHits++; }
  if (kwHits) { score += kwWeighted; explain.push(`keyword-match(${kwHits})`); }

  const catTokens = new Set([...doc.category, ...doc.normalizedCategory].flatMap(tokenize));
  let catHits = 0;
  for (const t of expandedTokens) if (catTokens.has(t)) catHits++;
  if (catHits) { score += 6 * catHits; explain.push(`category-match(${catHits})`); }

  const surfStageTokens = new Set([...doc.surface, ...doc.funnelStage].flatMap(tokenize));
  let surfHits = 0;
  for (const t of expandedTokens) if (surfStageTokens.has(t)) surfHits++;
  if (surfHits) { score += 5 * surfHits; explain.push(`surface-or-stage-match(${surfHits})`); }

  // metric field values (KPI labels like "CTA", "Oranı", "Test") are drawn
  // from the same recurring vocabulary as keywords (doc.metric IS the same
  // kpiLabels array folded into doc.keywords for ab-test/calculator docs -
  // see build-search-index.mjs), so a generic recurring KPI-name token
  // deserves the same IDF dampening keyword-match already gets, not a flat
  // per-hit score. Found by testing real Turkish-language queries against
  // the ab-test corpus: a document whose own question/hypothesis literally
  // WAS the query text (all 4 tokens hit in searchText) was ranking below
  // documents that only shared one generic KPI-label word ("CTA") with no
  // IDF dampening applied - the same class of problem idfWeight() was
  // already built to solve for title/keyword, just not wired here yet.
  const metricTokens = new Set(doc.metric.flatMap(tokenize));
  let metricWeighted = 0, metricHits = 0;
  for (const t of expandedTokens) if (metricTokens.has(t)) { metricWeighted += 7 * idfWeight(t); metricHits++; }
  if (metricHits) { score += metricWeighted; explain.push(`metric-match(${metricHits})`); }

  const docIntents = ranking_defaultIntentByType(doc.type);
  if (queryIntents.some((i) => docIntents.includes(i))) { score += 4; explain.push("intent-match"); }

  const searchTextTokens = foldSet(tokenize(doc.searchText));
  let stHits = 0;
  for (const t of expandedTokens) if (searchTextTokens.has(t)) stHits++;
  if (stHits) { score += 2 * stHits; explain.push(`searchtext-match(${stHits})`); }

  const boost = ranking.boostByType[doc.type] ?? 1.0;
  score *= boost;

  return { score, explain };
}

const TAXONOMY = rj("search/search-taxonomy.json");
function ranking_defaultIntentByType(type) {
  return TAXONOMY.intents.defaultIntentByType[type] ?? [];
}

/* -------------------------------------------------------- content balancing */
function applyContentTypeBalancing(ranked) {
  const top10 = ranked.slice(0, 10);
  if (top10.length < 10) return { ranked, balanced: false }; // nothing to rebalance against - fewer than 10 results at all
  const typeCounts = {};
  for (const r of top10) typeCounts[r.doc.type] = (typeCounts[r.doc.type] ?? 0) + 1;
  const dominant = Object.entries(typeCounts).find(([, c]) => c > 6);
  if (!dominant) return { ranked, balanced: false };
  const threshold = top10[9].score * 0.7; // within 30% of 10th place
  const outsideCandidate = ranked.slice(10).find((r) => r.doc.type !== dominant[0] && r.score >= threshold);
  if (!outsideCandidate) return { ranked, balanced: false };
  const newRanked = ranked.filter((r) => r !== outsideCandidate);
  newRanked.splice(9, 0, outsideCandidate);
  return { ranked: newRanked, balanced: true, promoted: outsideCandidate.doc.id };
}

/* ------------------------------------------------------------------- search */
export function search(query, { limit = 10 } = {}) {
  const queryNorm = normalize(query);
  const alias = resolveAlias(query);
  const tokens = tokenize(query);
  const expandedTokens = expandTokensWithSynonyms(tokens, queryNorm);
  const queryIntents = classifyIntent(queryNorm);

  // Deliberately NOT filtering by `doc.indexable` here - that field means
  // "should a search engine index this URL" (SEO), a different question
  // from "should THIS SITE'S OWN search feature return it as a result".
  // The 3 external Lab products (Numerspace, Google Ads Change History
  // Explorer, claude-lifecycle) are indexable:false (their canonical is
  // off-site, not this site's to index) but are still legitimate,
  // desired internal search results - see SEARCH-DESIGN-HANDOFF.md.
  let ranked = index
    .map((doc) => {
      const { score, explain } = scoreDocument(doc, queryNorm, tokens, expandedTokens, queryIntents);
      let finalScore = score;
      const finalExplain = [...explain];
      if (alias && doc.id === alias.targetId) { finalScore += 95; finalExplain.push("alias-match"); }
      return { doc, score: finalScore, explain: finalExplain };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || (ranking.boostByType[b.doc.type] ?? 1) - (ranking.boostByType[a.doc.type] ?? 1) || a.doc.title.localeCompare(b.doc.title));

  const balancedResult = applyContentTypeBalancing(ranked);
  ranked = balancedResult.ranked;

  return {
    query, queryNorm, queryIntents, aliasResolved: alias ? alias.targetId : null,
    balancingApplied: balancedResult.balanced, promotedForBalancing: balancedResult.promoted ?? null,
    results: ranked.slice(0, limit).map((r) => ({ id: r.doc.id, type: r.doc.type, title: r.doc.title, score: Number(r.score.toFixed(2)), explain: r.explain })),
  };
}

/* --------------------------------------------------------------------- CLI */
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const queryIdx = args.indexOf("--query");
  if (queryIdx >= 0) {
    const q = args[queryIdx + 1];
    const result = search(q);
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("Usage: node search/headless-search-prototype.mjs --query \"your query\"");
  }
}
