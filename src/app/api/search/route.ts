import { NextResponse } from "next/server";
// createSearchEngine is a plain JS module (allowJs picks up its inferred
// types automatically, no .d.ts needed) - a pure function (see its own
// header comment). All 5 data arguments below are statically `import`-ed
// JSON so Next bundles them into this route's build output directly,
// rather than this route reading files from disk at request time. A
// runtime fs.readFileSync of a path outside src/ (which search/headless-
// search-prototype.mjs's own CLI/script wiring does) is NOT reliably
// included in a Vercel serverless function's deployed file set - Next's
// file-tracer can't see through a dynamically-constructed path.join(...)
// call to know it needs to bundle that JSON. Static JSON imports don't
// have that problem: they become part of this route's own JS bundle at
// build time, guaranteed present at runtime.
import { createSearchEngine } from "../../../../search/headless-search-prototype.mjs";
import searchIndex from "../../../../search/search-index.json";
import aliasesDoc from "../../../../search/search-aliases.json";
import synonymsDoc from "../../../../search/search-synonyms.json";
import rankingContract from "../../../../search/search-ranking-contract.json";
import taxonomy from "../../../../search/search-taxonomy.json";

// Built once per server instance (module scope, not per-request) - the
// search data is static, regenerated only by search/build-search-index.mjs
// at build time, never at runtime, so there's no reason to re-index on
// every call.
const engine = createSearchEngine({
  index: searchIndex,
  aliases: aliasesDoc.aliases,
  synonyms: synonymsDoc.synonyms,
  ranking: rankingContract,
  taxonomy,
});

const MAX_QUERY_LENGTH = 200;
const MAX_LIMIT = 50;

// No UI, no component, no HTML - a plain JSON endpoint over the exact same,
// already-tested ranking engine search-validator.mjs (34/34) and
// run-query-fixtures.mjs (67/70 + 3 disclosed known-gaps) validate. This
// makes the search/ data+logic layer live and callable; it does not decide
// how (or whether) a future UI presents the results - see
// SEARCH-DESIGN-HANDOFF.md's own RESULT MODES / STATES / DESIGN FREEDOM
// sections, none of which this route makes a decision about.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = (searchParams.get("q") ?? "").slice(0, MAX_QUERY_LENGTH);
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), MAX_LIMIT) : 10;

  // Per search-empty-states-contract.json's own emptyQuery state - not a
  // 0-result search, a distinct, explicit response so a client doesn't have
  // to infer "nothing typed yet" from an empty results array.
  if (!rawQuery.trim()) {
    return NextResponse.json(
      { query: rawQuery, state: "empty-query", results: [] },
      { headers: { "X-Robots-Tag": "noindex" } },
    );
  }

  const result = engine.search(rawQuery, { limit });
  // The other 5 states (no-results / filtered-no-results / partial-results
  // via aliasResolved / invalid-query / very-broad-query) are all
  // computable by a client directly from this same response shape (see
  // search-empty-states-contract.json) - only emptyQuery needs a check
  // before the engine even runs, since there's no query to rank against.
  const state = result.results.length === 0 ? "no-results" : "results";

  // Per search-seo-separation-contract.json: this endpoint returns JSON,
  // not an HTML results page, so it was never going to be indexed the way
  // a /search?q=... page would be - the X-Robots-Tag header here is
  // defense-in-depth, consistent with that contract's "always noindex,
  // never let a query-driven surface become indexable" rule, applied even
  // though the risk is already low for a JSON API response.
  return NextResponse.json(
    { ...result, state },
    { headers: { "X-Robots-Tag": "noindex" } },
  );
}
