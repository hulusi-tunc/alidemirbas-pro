import rawTests from "@/data/ab-tests.json";

/* Read model for the A/B Test Playbook PRODUCT PAGE (/lab/ab-testing).

   Separate from ab-test-view.ts on purpose: that module serves the
   LIBRARY (list rows + detail records). This one serves the marketing
   page's visuals, which need a different shape - corpus-wide counts,
   a small curated card set, and one featured record's structural
   fields. Same discipline as ab-test-view.ts though: server-only
   import, so the full 211-record set never reaches the client bundle.
   Everything a client component needs is resolved here first and
   passed down as small, already-shaped props.

   NOTHING HERE IS INVENTED. Every number is computed from the real
   frozen dataset at module load; every card title is a real field
   (`seoTitle` for EN - 211/211 populated and written in English -
   and `question` for TR, the native source field). */

type AbTestRecord = {
  id: string;
  slug: string;
  category: string;
  surface: string;
  question: string;
  setupType: string;
  comparisonMode: string;
  differenceBehavior: string;
  testedSlot: string | null;
  guardrails: string[];
  sideA: { role: string; label: string | null } | null;
  sideB: { role: string; label: string | null } | null;
  seoTitle: string | null;
};

const TESTS = rawTests as AbTestRecord[];

export type Lang = "en" | "tr";

/* ---- Corpus-wide scale facts, all derived, none hard-coded ---------- */

const guardrailLengths = TESTS.map((r) => r.guardrails.length);

export const AB_SCALE = {
  /** 211 */
  scenarios: TESTS.length,
  /** 12 distinct `category` values */
  categories: new Set(TESTS.map((r) => r.category)).size,
  /** 14 distinct `surface` values */
  surfaces: new Set(TESTS.map((r) => r.surface)).size,
  /** 1,055 - the sum of every scenario's guardrail list */
  guardrails: guardrailLengths.reduce((a, b) => a + b, 0),
  /** 5 - no scenario in the set ships with fewer */
  guardrailsMin: Math.min(...guardrailLengths),
  /** 198 - records carrying an explicit control/variant pair */
  withSides: TESTS.filter((r) => r.sideA && r.sideB).length,
} as const;

/* ---- Surface coverage, sorted heaviest-first ------------------------ */

export type SurfaceCount = { surface: string; count: number };

export const SURFACE_COUNTS: readonly SurfaceCount[] = (() => {
  const m = new Map<string, number>();
  for (const r of TESTS) m.set(r.surface, (m.get(r.surface) ?? 0) + 1);
  return [...m.entries()]
    .map(([surface, count]) => ({ surface, count }))
    .sort((a, b) => b.count - a.count || a.surface.localeCompare(b.surface));
})();

/** The single heaviest surface's count - drives the coverage map's bar scale. */
export const SURFACE_MAX = Math.max(...SURFACE_COUNTS.map((s) => s.count));

/* ---- Category facets, sorted heaviest-first ------------------------- */

export type CategoryCount = { category: string; count: number };

export const CATEGORY_COUNTS: readonly CategoryCount[] = (() => {
  const m = new Map<string, number>();
  for (const r of TESTS) m.set(r.category, (m.get(r.category) ?? 0) + 1);
  return [...m.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
})();

/* ---- The library spread's curated cards ----------------------------- */

/* Seven real records, deliberately one per category, chosen to show the
   library's spread rather than its densest corner. Order is the visual
   left-to-right order in the spread; index 3 (AB-127) is the centre card
   that renders fully, the rest are progressively cropped. */
const SPREAD_IDS = ["AB-049", "AB-163", "AB-072", "AB-127", "AB-004", "AB-114", "AB-103"] as const;

export type SpreadCard = {
  id: string;
  title: string;
  category: string;
  surface: string;
  setupType: string;
  href: string;
};

export function spreadCards(lang: Lang): SpreadCard[] {
  const base = lang === "en" ? "/lab/ab-testing/library" : "/tr/lab/ab-testing/library";
  return SPREAD_IDS.map((id) => {
    const r = TESTS.find((x) => x.id === id);
    if (!r) throw new Error(`ab-test-marketing: curated id ${id} is no longer in the dataset`);
    return {
      id: r.id,
      // EN uses the record's own English `seoTitle`; TR uses the native
      // `question`. Neither is a translation written for this page.
      title: (lang === "en" ? r.seoTitle : r.question) ?? r.question,
      category: r.category,
      surface: r.surface,
      setupType: r.setupType,
      href: `${base}/${r.slug}`,
    };
  });
}

/* ---- The featured scenario (AB-004) --------------------------------- */

/* The page's prose already carries this exact record in both languages
   (content.ts `abTesting.example`, shipped and verified long before this
   redesign). This exposes only the STRUCTURAL fields that live in the
   dataset and have no translation problem - ids, enum-ish values, and
   the control/variant labels, which are Turkish in the source and are
   therefore only used for the TR rendering. */
export const FEATURED = (() => {
  const r = TESTS.find((x) => x.id === "AB-004");
  if (!r) throw new Error("ab-test-marketing: featured record AB-004 is no longer in the dataset");
  return {
    id: r.id,
    category: r.category,
    surface: r.surface,
    setupType: r.setupType,
    comparisonMode: r.comparisonMode,
    differenceBehavior: r.differenceBehavior,
    testedSlot: r.testedSlot,
    sideARole: r.sideA?.role ?? "control",
    sideBRole: r.sideB?.role ?? "variant",
    sideALabelTr: r.sideA?.label ?? null,
    sideBLabelTr: r.sideB?.label ?? null,
    guardrailCount: r.guardrails.length,
  } as const;
})();
