/* Unified search document model - the single contract every corpus (A/B
   tests, journeys, calculators, Lab products, blog articles) projects into.
   Not a copy of any one corpus's own schema - see search/search-taxonomy.json
   for the controlled vocabularies referenced below, and
   search/build-search-index.mjs for how each corpus is actually projected.

   This file is the type-level contract; search/search-document.schema.json
   is the runtime-validatable JSON Schema equivalent - keep them in sync by
   hand (small, rarely-changed file, same discipline already used for
   journey-taxonomy.ts's own port-verbatim comment). */

export type EntityType = "ab-test" | "journey" | "calculator" | "lab-product" | "blog-article";

/** Cross-corpus normalized category - a SECOND layer alongside each
    corpus's own native `category` (never replaces it). Built from real
    category values only - see search-taxonomy.json's `categoryMap` for
    the actual mapping table used, and its own documented "unmapped" list
    for values that were deliberately left unmapped rather than force-fit. */
export type NormalizedCategory = string; // see search-taxonomy.json normalizedCategories[]

/** A/B test's own 14-value surface enum (src/lib/ab-test-view.ts SURFACES).
    Only ab-test documents ever populate this - no other corpus has a real
    surface concept, so it stays [] for journey/calculator/lab-product/blog
    rather than being force-mapped. */
export type Surface = string; // see search-taxonomy.json surfaces[]

/** Journey's own 5-value LifecycleStage (src/lib/journey-taxonomy.ts,
    ported verbatim into build-search-index.mjs). Populated on journey
    documents always (every journey resolves to one of the 5, including
    the "cross-lifecycle" catch-all - it's a real value, not a null).
    Left [] on other types unless a genuinely confident category-level
    mapping exists (see search-taxonomy.json's stageMap). */
export type FunnelStage = string; // see search-taxonomy.json funnelStages[]

/** The 21-value Goal taxonomy from src/lib/journey-taxonomy.ts, ported
    verbatim and applied UNIFORMLY (same regex rules, same order) to every
    corpus's own title+description text - not a separate taxonomy invented
    per corpus. "review-required" is journey-taxonomy.ts's own real
    fallback value when no rule matches; it is preserved here rather than
    hidden, so an unclassified document is visibly unclassified, not
    silently miscategorized. */
export type BusinessObjective = string; // see search-taxonomy.json businessObjectives[]

/** Query-intent taxonomy - see search-taxonomy.json's own intents[] list
    and search-ranking-contract.json for how a query's intent signal
    affects ranking. Not stored as a single value per document because one
    document can legitimately satisfy more than one intent. */
export type QueryIntent = "learn" | "calculate" | "find-example" | "find-journey" | "find-test" | "use-tool" | "browse" | "compare";

export type SourceProvenance = {
  /** Repo-relative path(s) to the file(s) this document's fields were
      projected from - never invented, always the real read location. */
  file: string[];
  /** Which of THIS document's own fields came from that file - lets an
      auditor trace any field back to its origin without re-deriving it. */
  fields: string[];
};

export type SearchDocument = {
  /** `${type}:${nativeId-or-slug}` - globally unique, stable across
      re-generation as long as the source record's own id/slug doesn't
      change. Never a random/generated UUID. */
  id: string;
  type: EntityType;
  /** The corpus's own slug (or, for lab-product entries with no on-site
      route, the copy.lab.projects slug). */
  slug: string;
  /** Relative EN path for on-site entities; the real external URL
      (github.com/..., numerspace.com) for the 3 Lab projects that only
      link out - see `external` below. Never fabricated. */
  url: string;
  /** Relative TR path, only when a real TR route exists for this exact
      entity (see seo/hreflang-and-language-status.json's per-family
      findings - e.g. blog-article is EN-only, so this is null there). */
  urlTr: string | null;
  /** True only for the 3 Lab project cards whose only real destination is
      off-site (GitHub, numerspace.com) - `url` is then that external URL,
      not a site-internal path, and `canonical`/`urlTr` are both null. */
  external: boolean;
  title: string;
  /** Short, human-readable, result-card-length description (~1-2
      sentences) - reuses the corpus's own existing short-description
      field (seoDescription, purpose, excerpt, desc) rather than a new
      authored string, per the task's "don't dump the canonical source"
      instruction applied to summaries too. */
  summary: string;
  /** Bounded, controlled search-text projection - see
      search-taxonomy.json's `searchTextPolicy` for exactly which fields
      per type are allowed into this string and which are explicitly
      excluded (guardrails, internal provenance, validator notes,
      authoring notes, confidence, render contracts, graph internals). */
  searchText: string;
  /** Acronyms, explicit alternate names, sourced synonyms for THIS
      document specifically (not the global synonym dictionary - see
      search-synonyms.json for that; this field is the per-document subset
      that actually applies). */
  keywords: string[];
  /** The corpus's own native category value(s) - UNCHANGED, never
      renamed/reinterpreted. */
  category: string[];
  normalizedCategory: NormalizedCategory[];
  surface: Surface[];
  funnelStage: FunnelStage[];
  /** Metric/KPI concepts - calculator's own metric name+acronym, A/B
      test's primaryKpi+otherKpis labels. Empty for journey/lab-product/
      blog-article, which have no real per-document metric concept. */
  metric: string[];
  businessObjective: BusinessObjective[];
  intent: QueryIntent[];
  /** Catch-all controlled tags that don't fit the dimensions above -
      e.g. a journey's own `derived.behaviors` (cross-journey-handoff,
      multi-exit, etc. - already-computed, controlled-vocabulary values,
      not invented here). */
  tags: string[];
  language: "en" | "tr" | "en+tr";
  indexable: boolean;
  /** Absolute canonical URL (SITE_URL-prefixed) for on-site entities;
      null for `external: true` documents (an off-site URL is not this
      site's canonical anything). */
  canonical: string | null;
  /** Alternate query strings that should resolve to THIS document without
      creating a second document - currently populated only for the 5
      merged-journey ids (their old id/slug), per search-aliases.json,
      which is this field's own generation source. */
  searchAliases: string[];
  /** Static per-type ranking weight - see search-ranking-contract.json
      for the actual values and the signals this composes with. */
  boost: Record<string, number>;
  source: SourceProvenance;
  /** Journey-only, OPTIONAL type-specific field (absent on the other 4
      types - no forced universal field, per Part 2). Deterministic,
      source-backed relation references read directly from journey-view-
      model.json's own relationships.handoffs/distinctFrom (94%/65% of
      journeys carry at least one real edge - see search-related-content-
      readiness-report.json for the full coverage evaluation this stems
      from). Only internally-resolvable targets are kept (relationships can
      also reference "external:xxx" conceptual targets with no journey
      document of their own - those are filtered out, never left dangling).
      Deliberately NOT yet consumed by search-relations.json's
      relatedPrimary/relatedSecondary - prepared data for a future round,
      not a related-content recommendation being published this round. */
  journeyRelationRefs?: {
    handoffs: { targetId: string }[];
    distinctFrom: { targetId: string; because: string }[];
  };
};
