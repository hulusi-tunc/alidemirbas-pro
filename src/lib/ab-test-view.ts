import rawTests from "@/data/ab-tests.json";

/* The A/B test library read model. Source data is frozen (produced by the
   ab-test-playbook repo's authoring pipeline) and lives in src/data/ab-tests.json.
   This module is the only place that turns it into list rows and detail
   pages, mirroring src/lib/canonical-view.ts's separation for the journey
   library - server-only import, so the full 211-record set never reaches
   the client bundle; the list gets rows, a detail page gets its own record. */

export type SetupType = "control-vs-treatment" | "variant-vs-variant" | "option-vs-option" | "unresolved";
export type ComparisonMode = "element" | "structural" | "media";
export type Surface =
  | "pdp" | "plp" | "home" | "cart" | "checkout" | "search" | "filters" | "form"
  | "pricing" | "saas" | "mobile" | "thankyou" | "dashboard" | "generic-ui";

export type AbTestDetail = {
  id: string;
  slug: string;
  category: string;
  surface: Surface;
  question: string;
  hypothesis: string;
  setupType: SetupType;
  comparisonMode: ComparisonMode;
  differenceBehavior: string;
  testedSlot: string | null;
  primaryKpi: { label: string; explanation: string };
  otherKpis: { label: string; explanation: string }[];
  whatToTest: { label: string; explanation: string }[];
  guardrails: string[];
  sideA: { role: string; label: string | null; sourceBasis: string | null } | null;
  sideB: { role: string; label: string | null; sourceBasis: string | null } | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

const TESTS = rawTests as AbTestDetail[];

export const AB_TEST_COUNT = TESTS.length;

export type AbSurfaceFacet = { id: Surface; count: number };

export const SURFACES: readonly Surface[] = [
  "pdp", "plp", "home", "cart", "checkout", "search", "filters", "form",
  "pricing", "saas", "mobile", "thankyou", "dashboard", "generic-ui",
];

export type AbTestRow = {
  id: string;
  slug: string;
  question: string;
  category: string;
  surface: Surface;
  setupType: SetupType;
};

export const AB_TEST_ROWS: readonly AbTestRow[] = TESTS.map((r) => ({
  id: r.id, slug: r.slug, question: r.question, category: r.category, surface: r.surface, setupType: r.setupType,
}));

export const ALL_AB_TEST_SLUGS: readonly string[] = TESTS.map((r) => r.slug);

const BY_SLUG = new Map(TESTS.map((r) => [r.slug, r]));

export function abTestDetail(slug: string): AbTestDetail | null {
  return BY_SLUG.get(slug) ?? null;
}
