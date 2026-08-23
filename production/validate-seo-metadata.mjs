/* Programmatic SEO metadata validator for both libraries.
   `node production/validate-seo-metadata.mjs`

   Deterministic and re-runnable: no randomness, no clock, no network. It
   reads the two metadata files plus the canonical sources they claim to
   describe, and writes seo-validation-report.json and
   seo-cannibalization-report.json alongside them.

   It deliberately does NOT try to reach zero warnings. Two genuinely
   adjacent pages competing for one query is a real property of a 466-page
   programmatic corpus; the validator's job is to surface it with names and
   numbers, not to let it be hidden behind artificially reworded metadata. */

import { readFile, writeFile } from "node:fs/promises";

const read = async (f) => JSON.parse(await readFile(f, "utf8"));

const abMeta = await read("production/ab-test-seo-metadata.json");
const jrMeta = await read("production/journey-seo-metadata.json");
const jrViewModel = await read("production/journey-view-model.json");
const mergedContract = await read("production/journey-merged-id-contract.json");

const AB_EXPECTED = 211;
const JR_EXPECTED = 255;
const TOTAL_EXPECTED = AB_EXPECTED + JR_EXPECTED;

const AB_INTENTS = new Set(["a/b testing ideas", "a/b test examples", "cro experiments", "conversion optimization tests"]);
const JR_INTENTS = new Set(["customer journey examples", "lifecycle marketing journeys", "customer lifecycle examples", "marketing automation journeys"]);

const all = [
  ...abMeta.map((r) => ({ ...r, library: "ab" })),
  ...jrMeta.map((r) => ({ ...r, library: "journey" })),
];

const findings = [];
const fails = [];
const add = (severity, code, id, message) => {
  findings.push({ severity, code, id, message });
  if (severity === "error") fails.push(`${code} (${id}): ${message}`);
};
const check = (n, desc, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${String(n).padStart(2)}. ${desc}${extra ? ` — ${extra}` : ""}`);
  if (!ok) fails.push(`${n}. ${desc}`);
};

/* ------------------------------------------------------------ tokenising */
const STOP = new Set(["a","an","the","and","or","of","to","in","on","for","with","is","are","that","this","how","what","when","which","from","by","at","as","it","its","be","can","you","your","test","a/b","ab"]);
/* Light suffix stripping. Without it the mismatch check below compares
   "Testimonials" in a title against "testimonial" in its description and
   calls them unrelated — which would punish exactly the synonym-and-
   inflection variety that makes a description worth reading. */
const stem = (w) =>
  w.replace(/(ies)$/, "y").replace(/(sses|shes|ches|xes)$/, "").replace(/([^s])s$/, "$1")
   .replace(/(ing|ed)$/, "");
const tokens = (s) =>
  new Set(
    s.toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w))
      .map(stem)
      .filter((w) => w.length > 2),
  );
const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
};

/* ------------------------------------------------------------- 1-2 counts */
check(1, `expected active record count = ${TOTAL_EXPECTED}`, all.length === TOTAL_EXPECTED, `got ${all.length} (ab ${abMeta.length}, journey ${jrMeta.length})`);
check(2, "A/B = 211 and Journey = 255", abMeta.length === AB_EXPECTED && jrMeta.length === JR_EXPECTED);

/* ------------------------------------------------------------ 3 missing */
const REQUIRED = ["id","slug","seoTitle","seoDescription","titleCharacterCount","descriptionCharacterCount","primaryIntent","secondaryIntent","canonicalPath","index","follow","sitemap","sourceBasis","needsSeoReview"];
let missing = 0;
for (const r of all) {
  for (const f of REQUIRED) {
    const v = r[f];
    if (v === undefined || v === null || (typeof v === "string" && !v.trim()) || (Array.isArray(v) && !v.length)) {
      add("error", "missing_metadata", r.id, `field "${f}" is missing or empty`);
      missing++;
    }
  }
}
check(3, "missing metadata = 0", missing === 0, `${missing} field(s)`);

/* ------------------------------------------------------- 4-5 dup id/slug */
const idCount = {}, slugCount = {};
for (const r of all) { idCount[r.id] = (idCount[r.id] || 0) + 1; slugCount[`${r.library}:${r.slug}`] = (slugCount[`${r.library}:${r.slug}`] || 0) + 1; }
const dupIds = Object.entries(idCount).filter(([, c]) => c > 1);
const dupSlugs = Object.entries(slugCount).filter(([, c]) => c > 1);
for (const [k] of dupIds) add("error", "duplicate_id", k, "id appears more than once");
for (const [k] of dupSlugs) add("error", "duplicate_slug", k, "slug appears more than once within its library");
check(4, "duplicate ID = 0", dupIds.length === 0);
check(5, "duplicate slug = 0", dupSlugs.length === 0);

/* ------------------------------------- 6-7 exact duplicate title/description */
const byTitle = {}, byDesc = {};
for (const r of all) {
  (byTitle[r.seoTitle.trim().toLowerCase()] ??= []).push(r.id);
  (byDesc[r.seoDescription.trim().toLowerCase()] ??= []).push(r.id);
}
const exactDupTitles = Object.entries(byTitle).filter(([, v]) => v.length > 1);
const exactDupDescs = Object.entries(byDesc).filter(([, v]) => v.length > 1);
for (const [t, ids] of exactDupTitles) add("error", "duplicate_title", ids.join(","), `identical title: "${t}"`);
for (const [, ids] of exactDupDescs) add("error", "duplicate_description", ids.join(","), "identical description");
check(6, "exact duplicate title = 0", exactDupTitles.length === 0, `${exactDupTitles.length} group(s)`);
check(7, "exact duplicate description = 0", exactDupDescs.length === 0, `${exactDupDescs.length} group(s)`);

/* ------------------------------------------------------ 8-9 length bounds */
let titleOver = 0, titleCountMismatch = 0, descOut = 0;
for (const r of all) {
  if (r.seoTitle.length !== r.titleCharacterCount || r.seoDescription.length !== r.descriptionCharacterCount) {
    add("error", "character_count_mismatch", r.id, "stated character count does not match the actual string length");
    titleCountMismatch++;
  }
  if (r.seoTitle.length > 60) {
    titleOver++;
    add(r.needsSeoReview ? "warning" : "error", "title_too_long", r.id, `title is ${r.seoTitle.length} chars${r.needsSeoReview ? " (flagged for review)" : " and is NOT flagged for review"}`);
  }
  if (r.seoDescription.length < 120 || r.seoDescription.length > 165) {
    descOut++;
    add("warning", "description_length", r.id, `description is ${r.seoDescription.length} chars (target 140-155, tolerated 120-165)`);
  }
}
check(8, "stated character counts match actual lengths", titleCountMismatch === 0, `${titleCountMismatch} mismatch(es)`);
check(9, "titles over 60 chars are all flagged for review", all.every((r) => r.seoTitle.length <= 60 || r.needsSeoReview), `${titleOver} over 60`);

/* ------------------------------------------------------ 10 primary intent */
let badIntent = 0;
for (const r of all) {
  const allowed = r.library === "ab" ? AB_INTENTS : JR_INTENTS;
  if (!r.primaryIntent?.trim()) { add("error", "empty_primary_intent", r.id, "primaryIntent is empty"); badIntent++; }
  else if (!allowed.has(r.primaryIntent)) { add("error", "wrong_intent_set", r.id, `primaryIntent "${r.primaryIntent}" belongs to the other library's intent set`); badIntent++; }
  if (!r.secondaryIntent?.trim()) { add("error", "empty_secondary_intent", r.id, "secondaryIntent is empty"); badIntent++; }
}
check(10, "primary/secondary intent present and from the right set", badIntent === 0, `${badIntent} problem(s)`);

/* ---------------------------------------------------- 11 canonical path */
let badPath = 0;
for (const r of all) {
  const expectedPrefix = r.library === "ab" ? "/lab/ab-testing/" : "/lab/journeys/";
  const expected = `${expectedPrefix}${r.slug}`;
  if (r.canonicalPath !== expected) { add("error", "invalid_canonical_path", r.id, `canonicalPath is "${r.canonicalPath}", expected "${expected}"`); badPath++; }
  if (/^https?:\/\//i.test(r.canonicalPath)) { add("error", "canonical_has_origin", r.id, "canonicalPath must be a path, not an absolute URL"); badPath++; }
}
check(11, "canonical path derived from routing contract", badPath === 0, `${badPath} problem(s)`);

/* -------------------------------------------- 12 index/follow/sitemap */
let badRobots = 0;
for (const r of all) {
  if (r.index !== true || r.follow !== true || r.sitemap !== true) {
    add("error", "robots_contract", r.id, "an ACTIVE detail page must be index+follow+sitemap");
    badRobots++;
  }
}
check(12, "index/follow/sitemap contract on active pages", badRobots === 0, `${badRobots} problem(s)`);

/* ------------------------------------------------ 13 merged journey leakage */
const mergedIds = new Set(mergedContract.records.map((r) => r.requestedId));
const mergedSlugs = new Set(mergedContract.records.map((r) => r.requestedId.toLowerCase()));
const activeJourneyIds = new Set(jrViewModel.map((r) => r.identity.id));
let mergedLeak = 0;
for (const r of jrMeta) {
  if (mergedIds.has(r.id)) { add("error", "merged_leakage", r.id, "a merged/redirect id must not have detail-page SEO metadata"); mergedLeak++; }
  if (mergedSlugs.has(r.slug)) { add("error", "merged_leakage", r.id, `slug "${r.slug}" is a merged-redirect slug`); mergedLeak++; }
  if (!activeJourneyIds.has(r.id)) { add("error", "unknown_journey_id", r.id, "not an active canonical journey"); mergedLeak++; }
}
check(13, "merged journey leakage = 0", mergedLeak === 0, `${mergedLeak} problem(s)`);

/* --------------------------------- 14-15 unsupported numeric / performance */
const NUMERIC_CLAIM = /(\d+(\.\d+)?\s*%|\b\d+x\b|\b\d+(\.\d+)?\s*(percent|pp)\b)/i;

/* These are deliberately narrow. A first, blunter version flagged 7 records
   and 5 of them were false positives: the POSITION "top of the plan card",
   the sort-option NAME "best-selling", and the ordinary verb senses in "the
   risk it raises", "what drives page length" and "raises a blocker". A
   validator that is wrong 5 times out of 7 trains people to ignore it, so
   each pattern below now requires the marketing sense specifically. */
const SUPERLATIVE = new RegExp(
  [
    "\\b(ultimate|guaranteed|world[- ]class|fastest)\\b",
    "#1|\\bno\\.?\\s?1\\b",
    "\\bbest\\b(?!\\s*[-–]?\\s*selling)",       // "best practice" yes, "best-selling" (a sort name) no
    "\\btop\\s+(\\d|rated|performing|converting)", // "top 10" yes, "top of the card" no
    "\\bproven\\s+(results?|method|way|strategy|approach|tactic|winner)", // not "has proven it can"
    "\\bhighest[- ](converting|performing|revenue)",  // not "highest-exit", which describes a page type
  ].join("|"),
  "i",
);

/* A performance claim is a performance VERB pointed at a METRIC. Requiring
   the metric noun within the same clause is what separates "increases
   conversion" (a claim) from "raises a blocker" (a description). */
const PERF_CLAIM = /\b(increases?|boosts?|improves?|lifts?|raises?|drives?|maximi[sz]es?|skyrockets?|doubles?|triples?)\b[^.?!]{0,40}\b(conversion|conversions|revenue|sales|signups?|sign-ups?|clicks?|ctr|aov|retention|engagement|traffic|orders?|leads?)\b/i;

let numericClaims = 0, perfClaims = 0;
for (const r of all) {
  for (const [field, text] of [["seoTitle", r.seoTitle], ["seoDescription", r.seoDescription]]) {
    if (NUMERIC_CLAIM.test(text)) { add("error", "unsupported_numeric_claim", r.id, `${field} contains a numeric performance figure: "${text.match(NUMERIC_CLAIM)[0]}"`); numericClaims++; }
    if (SUPERLATIVE.test(text)) { add("error", "unsupported_superlative", r.id, `${field} contains an unproven superlative: "${text.match(SUPERLATIVE)[0].trim()}"`); perfClaims++; }
    // an assertion is a claim; the same wording inside a question is the source's own framing
    if (PERF_CLAIM.test(text) && !text.includes("?")) {
      add("error", "unsupported_performance_claim", r.id, `${field} asserts a performance outcome: "${text.match(PERF_CLAIM)[0]}"`);
      perfClaims++;
    }
  }
}
check(14, "unsupported numeric claim = 0", numericClaims === 0, `${numericClaims} found`);
check(15, "unsupported performance/superlative claim = 0", perfClaims === 0, `${perfClaims} found`);

/* ---------------------------------------------------------- 16 ID leakage */
const ID_PATTERN = /\b(AB-\d{3}|[A-Z]{3}-\d+)\b/;
let idLeak = 0;
for (const r of all) {
  for (const [field, text] of [["seoTitle", r.seoTitle], ["seoDescription", r.seoDescription]]) {
    if (ID_PATTERN.test(text)) { add("error", "id_leakage", r.id, `${field} contains a library ID: "${text.match(ID_PATTERN)[0]}"`); idLeak++; }
  }
}
check(16, "ID leakage into title/description = 0", idLeak === 0, `${idLeak} found`);

/* ------------------------------------------- 17-18 near duplicate detection */
const titleTok = new Map(all.map((r) => [r.id, tokens(r.seoTitle)]));
const descTok = new Map(all.map((r) => [r.id, tokens(r.seoDescription)]));
const NEAR_TITLE = 0.8, NEAR_DESC = 0.75;
const nearTitlePairs = [], nearDescPairs = [];
for (let i = 0; i < all.length; i++) {
  for (let j = i + 1; j < all.length; j++) {
    const a = all[i], b = all[j];
    const ts = jaccard(titleTok.get(a.id), titleTok.get(b.id));
    if (ts >= NEAR_TITLE) {
      nearTitlePairs.push({ a: a.id, b: b.id, similarity: Number(ts.toFixed(3)), aTitle: a.seoTitle, bTitle: b.seoTitle, flagged: a.needsSeoReview || b.needsSeoReview });
      add(a.needsSeoReview || b.needsSeoReview ? "warning" : "error", "near_duplicate_title", `${a.id}/${b.id}`, `title similarity ${ts.toFixed(2)}${a.needsSeoReview || b.needsSeoReview ? " (flagged)" : " and NOT flagged"}`);
    }
    const ds = jaccard(descTok.get(a.id), descTok.get(b.id));
    if (ds >= NEAR_DESC) {
      nearDescPairs.push({ a: a.id, b: b.id, similarity: Number(ds.toFixed(3)), flagged: a.needsSeoReview || b.needsSeoReview });
      add(a.needsSeoReview || b.needsSeoReview ? "warning" : "error", "near_duplicate_description", `${a.id}/${b.id}`, `description similarity ${ds.toFixed(2)}${a.needsSeoReview || b.needsSeoReview ? " (flagged)" : " and NOT flagged"}`);
    }
  }
}
check(17, "unflagged near-duplicate titles = 0", nearTitlePairs.every((p) => p.flagged), `${nearTitlePairs.length} near pair(s), ${nearTitlePairs.filter((p) => !p.flagged).length} unflagged`);
check(18, "unflagged near-duplicate descriptions = 0", nearDescPairs.every((p) => p.flagged), `${nearDescPairs.length} near pair(s), ${nearDescPairs.filter((p) => !p.flagged).length} unflagged`);

/* --------------------------------------------------- 19 title/desc mismatch */
let mismatch = 0, echo = 0;
for (const r of all) {
  const overlap = jaccard(titleTok.get(r.id), descTok.get(r.id));
  if (overlap === 0) { add("warning", "title_description_mismatch", r.id, "description shares no content token with the title"); mismatch++; }
  if (r.seoDescription.toLowerCase().includes(r.seoTitle.toLowerCase().replace(/\s*[-|].*$/, "").trim()) && overlap > 0.7) {
    add("warning", "description_echoes_title", r.id, "description mostly restates the title");
    echo++;
  }
}
/* Zero shared stems is a signal worth a human glance, not a defect a machine
   can adjudicate: a description that legitimately paraphrases its title in
   entirely different words is good copy, not broken metadata. Only the echo
   case — a description that just restates its title — is something lexical
   analysis can actually call wrong, so that is what this check fails on. */
check(19, "description echoes its own title = 0", echo === 0, `${echo} echo, ${mismatch} zero-overlap pair(s) surfaced as warnings`);

/* -------------------------------------------------------- 20 sourceBasis */
const noBasis = all.filter((r) => !Array.isArray(r.sourceBasis) || r.sourceBasis.length === 0);
for (const r of noBasis) add("error", "missing_source_basis", r.id, "sourceBasis is empty — the metadata cannot be audited");
check(20, "sourceBasis present on every record", noBasis.length === 0, `${noBasis.length} missing`);

/* ----------------------------------------------- 21 needsSeoReview coherence */
let reviewIncoherent = 0;
for (const r of all) {
  if (r.needsSeoReview === true && !r.reviewReason?.trim()) { add("error", "review_without_reason", r.id, "needsSeoReview is true but reviewReason is empty"); reviewIncoherent++; }
  if (r.needsSeoReview === false && r.reviewReason !== null && r.reviewReason !== undefined) { add("error", "reason_without_review", r.id, "reviewReason is set but needsSeoReview is false"); reviewIncoherent++; }
}
check(21, "needsSeoReview / reviewReason coherent", reviewIncoherent === 0, `${reviewIncoherent} problem(s)`);

/* ------------------------------------------------- 22 cannibalization clusters */
const clusters = {};
for (const r of all) (clusters[`${r.library} :: ${r.secondaryIntent}`] ??= []).push(r);
const clusterReport = Object.entries(clusters)
  .map(([key, members]) => {
    let worst = 0, worstPair = null;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const s = jaccard(titleTok.get(members[i].id), titleTok.get(members[j].id));
        if (s > worst) { worst = s; worstPair = [members[i].id, members[j].id]; }
      }
    }
    const unresolved = members.filter((m) => !m.needsSeoReview);
    return {
      cluster: key,
      size: members.length,
      ids: members.map((m) => m.id),
      worstTitleSimilarity: Number(worst.toFixed(3)),
      worstPair,
      flaggedForReview: members.length - unresolved.length,
      // a cluster is "unresolved" only when two of its members are genuinely
      // close AND nobody flagged it — a big cluster of well-differentiated
      // titles is normal for a programmatic corpus, not a defect
      unresolved: worst >= 0.6 && members.filter((m) => m.needsSeoReview).length === 0,
    };
  })
  .sort((a, b) => b.size - a.size);

const unresolvedClusters = clusterReport.filter((c) => c.unresolved);
for (const c of unresolvedClusters) {
  add("warning", "cannibalization_cluster", c.worstPair?.join("/") ?? c.cluster, `cluster "${c.cluster}" (${c.size} pages) has an unflagged title similarity of ${c.worstTitleSimilarity}`);
}
check(22, "unresolved cannibalization clusters = 0", unresolvedClusters.length === 0, `${unresolvedClusters.length} of ${clusterReport.length} clusters`);

/* --------------------------------------------- 23 malformed slug inheritance */
/* seo-metadata.schema.json's canonicalPath pattern correctly refuses a path
   ending in a hyphen. Two A/B slugs do end in one (upstream slug generation
   truncated an ~80-char Turkish question mid-word). The schema is right and
   the data is wrong; changing a slug is out of scope for this round, so the
   contract here is: the defect may exist, but every record carrying it must
   be flagged. That is what this asserts — it does NOT assert the defect is
   absent, because that would be false. */
const malformed = all.filter((r) => r.slug.endsWith("-") || r.slug.startsWith("-") || r.slug.includes("--"));
const malformedUnflagged = malformed.filter((r) => !r.needsSeoReview);
for (const r of malformed) {
  add("warning", "malformed_slug_inherited", r.id, `canonicalPath inherits a malformed slug ("${r.slug}") — upstream slug fix required, out of scope here`);
}
check(23, "every malformed-slug record is flagged for review", malformedUnflagged.length === 0, `${malformed.length} malformed (${malformed.map((r) => r.id).join(", ") || "none"}), ${malformedUnflagged.length} unflagged`);

/* ----------------------------------------------------------------- reports */
const errors = findings.filter((f) => f.severity === "error");
const warnings = findings.filter((f) => f.severity === "warning");

await writeFile(
  "production/seo-validation-report.json",
  JSON.stringify(
    {
      totals: { abPages: abMeta.length, journeyPages: jrMeta.length, total: all.length, expected: TOTAL_EXPECTED },
      counts: { errors: errors.length, warnings: warnings.length },
      needsSeoReview: all.filter((r) => r.needsSeoReview).map((r) => ({ id: r.id, reason: r.reviewReason })),
      exactDuplicateTitles: exactDupTitles.map(([t, ids]) => ({ title: t, ids })),
      exactDuplicateDescriptions: exactDupDescs.map(([, ids]) => ({ ids })),
      nearDuplicateTitles: nearTitlePairs,
      nearDuplicateDescriptions: nearDescPairs,
      findings,
    },
    null,
    2,
  ),
);

await writeFile(
  "production/seo-cannibalization-report.json",
  JSON.stringify(
    {
      note: "Clustered by library + secondaryIntent. A large cluster is normal for a programmatic corpus; what matters is whether two pages inside it are actually competing for the same query with near-identical titles. `unresolved: true` means they are AND nobody flagged it.",
      totalClusters: clusterReport.length,
      unresolvedClusters: unresolvedClusters.length,
      clusters: clusterReport,
    },
    null,
    2,
  ),
);

console.log(`\nerrors ${errors.length} · warnings ${warnings.length}`);
console.log("wrote production/seo-validation-report.json and production/seo-cannibalization-report.json");
console.log(`\nRESULT: ${fails.length === 0 ? "PASS" : `FAIL (${fails.length})`}`);
for (const f of fails) console.log("  -", f);
process.exit(fails.length ? 1 : 0);
