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
  /** The card body on the gallery. Real, and the most useful sentence the
      record has short of the whole playbook. */
  hypothesis: string;
  /** Label only - the one metric that decides the winner, shown on the
      card because the playbook's first rule is that there is exactly one. */
  primaryKpi: string;
};

export const AB_TEST_ROWS: readonly AbTestRow[] = TESTS.map((r) => ({
  id: r.id, slug: r.slug, question: r.question, category: r.category, surface: r.surface, setupType: r.setupType,
  hypothesis: r.hypothesis, primaryKpi: r.primaryKpi.label,
}));

/** A category as the gallery sections it: its title (which is also its
    id - the archive has no separate code), the surfaces its tests actually
    sit on, and its count. Ordered by first appearance in the archive, so
    AB-001's category opens the page - the order the archive itself has. */
export type AbCategory = { id: string; surfaces: Surface[]; count: number };

export const AB_CATEGORIES: readonly AbCategory[] = (() => {
  const m = new Map<string, { surfaces: Set<Surface>; count: number }>();
  for (const r of TESTS) {
    const c = m.get(r.category) ?? { surfaces: new Set<Surface>(), count: 0 };
    c.surfaces.add(r.surface);
    c.count += 1;
    m.set(r.category, c);
  }
  return [...m.entries()].map(([id, c]) => ({
    id,
    surfaces: SURFACES.filter((s) => c.surfaces.has(s)),
    count: c.count,
  }));
})();

/* Surface keys are not prose, so the hyphen becomes a space and the
   acronyms - which are what most of these keys are - stay upper. No
   mapping table: that would be a second name for each surface to keep in
   sync with the data. Lived in AbTestPlaybookPage until the gallery needed
   it too. */
const ACRONYMS = new Set(["pdp", "plp", "ui", "saas"]);
export const surfaceLabel = (surface: string) =>
  surface
    .split("-")
    .map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");

export const ALL_AB_TEST_SLUGS: readonly string[] = TESTS.map((r) => r.slug);

const BY_SLUG = new Map(TESTS.map((r) => [r.slug, r]));

export function abTestDetail(slug: string): AbTestDetail | null {
  return BY_SLUG.get(slug) ?? null;
}
