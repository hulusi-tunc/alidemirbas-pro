#!/usr/bin/env node
// Deterministic, dependency-free headless search prototype - implements
// search-ranking-contract.json against search-index.json. Not a UI - exists
// to prove the contract is implementable and test it against
// search-query-fixtures.json. Also the ONE ranking implementation the live
// /api/search route (src/app/api/search/route.ts) calls, via
// createSearchEngine() below - no separate/reimplemented ranking logic
// exists anywhere else, so the exact code search-validator.mjs and
// run-query-fixtures.mjs test against is the exact code that's live.
// Run: node search/headless-search-prototype.mjs [--query "some query"] [--verbose]
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { createSearchEngine } from "./search-engine.mjs";

export { createSearchEngine } from "./search-engine.mjs";

/* ================================================== fs-backed module wiring
   Everything below is the ONLY part of this file that touches the
   filesystem - used by plain Node consumers (this file's own CLI, plus
   search-validator.mjs and run-query-fixtures.mjs, both of which `import {
   search } from "./headless-search-prototype.mjs"`). The Next.js route
   handler does NOT import this section - it calls createSearchEngine()
   directly with statically-imported JSON data instead (see
   src/app/api/search/route.ts's own comment on why). */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rj = (p) => JSON.parse(readFileSync(path.join(ROOT, p), "utf8"));

const index = rj("search/search-index.json");
const aliases = rj("search/search-aliases.json").aliases;
const synonymsData = rj("search/search-synonyms.json").synonyms;
const ranking = rj("search/search-ranking-contract.json");
const taxonomy = rj("search/search-taxonomy.json");

export const search = createSearchEngine({ index, aliases, synonyms: synonymsData, ranking, taxonomy }).search;

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
