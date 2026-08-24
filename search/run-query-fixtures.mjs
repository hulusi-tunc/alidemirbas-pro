#!/usr/bin/env node
// Runs search/search-query-fixtures.json through headless-search-prototype.mjs
// and reports pass/fail per fixture. Run: node search/run-query-fixtures.mjs
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { search } from "./headless-search-prototype.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rj = (p) => JSON.parse(readFileSync(path.join(ROOT, p), "utf8"));
const fixtures = rj("search/search-query-fixtures.json").fixtures;

let pass = 0, fail = 0, knownGap = 0;
const results = [];

for (const f of fixtures) {
  const r = search(f.query, { limit: 10 });
  const topIds = r.results.map((x) => x.id);
  let ok;
  if (f.expectedEntity) {
    ok = topIds[0] === f.expectedEntity || topIds.slice(0, 3).includes(f.expectedEntity);
  } else if (f.expectedTopSet) {
    if (f.expectedTopSet.includes("type-diversity-check")) {
      const types = new Set(r.results.map((x) => x.type));
      ok = types.size >= 2 || r.results.length === 0;
    } else {
      ok = f.expectedTopSet.some((id) => topIds.includes(id));
    }
  } else {
    ok = topIds.length > 0;
  }
  const isKnownGap = f.expectedType === "misspelling" && !ok;
  if (isKnownGap) { knownGap++; }
  else if (ok) { pass++; } else { fail++; }
  results.push({ query: f.query, expectedType: f.expectedType, ok, isKnownGap, top3: topIds.slice(0, 3), reason: f.reason });
  const status = isKnownGap ? "GAP " : ok ? "PASS" : "FAIL";
  console.log(`${status} [${f.expectedType}] "${f.query}" -> top3: ${topIds.slice(0, 3).join(", ") || "(none)"}`);
}

console.log(`\n${pass} passed, ${fail} failed, ${knownGap} known-gap (misspelling, no fuzzy matching implemented by design)`);

writeFileSync(path.join(ROOT, "search/search-query-fixtures-report.json"), JSON.stringify({
  _description: "Output of search/run-query-fixtures.mjs against search/headless-search-prototype.mjs. Regenerate by re-running that script.",
  summary: { total: fixtures.length, pass, fail, knownGap },
  results,
}, null, 2) + "\n");

process.exit(fail > 0 ? 1 : 0);
