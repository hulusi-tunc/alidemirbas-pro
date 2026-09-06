"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import IdeaCard from "@/components/ui/IdeaCard";
import { surfaceLabel, type AbCategory, type AbTestRow, type Surface } from "@/lib/ab-test-view";

/* The A/B test library as a browsable gallery: category sections over a
   grid of cards, with search and two filters above the whole thing.

   MECHANISM SOURCE: this site's own JourneyGallery (the communication
   journeys page), per site-owner direction to make this library look like
   that one. Same structure, same card (ui/IdeaCard), same default-vs-
   filtered split: sections group the DEFAULT view only, and the moment a
   search or a filter is active a flat grid of matches takes over. What is
   different is only what the data can honestly supply:

   - Sections are the library's twelve real categories, in the order the
     archive itself numbers them (AB-001 opens "Cart & Checkout"). A
     category has no purpose sentence, so the line under its title is its
     real surface set instead - "Cart · Checkout" - rather than a sentence
     written to fill the slot.
   - There is no square marker on a section: every id here is AB-nnn, so
     the id prefix that marks a journey category would say "AB" twelve
     times and mean nothing.
   - The card's accent badge is the surface; its muted badge is the primary
     KPI - the playbook's own first rule ("one primary metric decides the
     winner") made visible on every card. The body is the hypothesis.
   - Filters are Category and Surface. The primary KPI is deliberately not
     a filter: 68 distinct labels across 211 tests is a list, not a facet.

   This replaced AbTestBrowser (a facet rail of radio buttons beside a flat
   row list). Like that component, filter state is local - no URL sync -
   so the page prerenders whole with no Suspense fallback to maintain. */

const SECTION_PREVIEW_COUNT = 6;

const T = {
  en: {
    search: "Search by question, category or KPI",
    category: "Category",
    allCategories: "All categories",
    surface: "Page / surface",
    allSurfaces: "All surfaces",
    results: "tests",
    testsLabel: ["test", "tests"],
    clear: "Clear filters",
    empty: "No tests match these filters.",
    showMore: "Show more ({count})",
    showLess: "Show less",
    primaryKpi: "Primary KPI",
  },
  tr: {
    search: "Soru, kategori veya KPI'ya göre ara",
    category: "Kategori",
    allCategories: "Tüm kategoriler",
    surface: "Sayfa / yüzey",
    allSurfaces: "Tüm yüzeyler",
    results: "test",
    // Turkish takes no plural after a numeral - both forms identical on purpose.
    testsLabel: ["test", "test"],
    clear: "Filtreleri temizle",
    empty: "Bu filtrelere uyan test yok.",
    showMore: "Daha fazla göster ({count})",
    showLess: "Daha az göster",
    primaryKpi: "Birincil KPI",
  },
} as const;

type Lang = keyof typeof T;

function TestCard({ row, basePath, t }: { row: AbTestRow; basePath: string; t: (typeof T)[Lang] }) {
  return (
    <IdeaCard
      href={`${basePath}/${row.slug}`}
      title={row.question}
      badges={[
        { label: surfaceLabel(row.surface), tone: "accent" },
        { label: row.primaryKpi, tone: "muted", title: `${t.primaryKpi}: ${row.primaryKpi}` },
      ]}
      body={row.hypothesis}
      footLeft={row.category}
      footRight={row.id}
    />
  );
}

function CategorySection({
  category,
  items,
  basePath,
  t,
}: {
  category: AbCategory;
  items: readonly AbTestRow[];
  basePath: string;
  t: (typeof T)[Lang];
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, SECTION_PREVIEW_COUNT);
  const remaining = items.length - visible.length;

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-base font-semibold tracking-tight text-ink-950">{category.id}</h2>
        <span className="shrink-0 font-mono text-xs text-ink-400 tabular-nums">
          {items.length} {t.testsLabel[items.length === 1 ? 0 : 1]}
        </span>
      </div>
      {/* the category's real surfaces, in the mono rail this site labels
          things with - the closest honest thing to a purpose sentence */}
      <p className="mt-1 font-mono text-[11px] tracking-[0.12em] text-ink-400 uppercase">
        {category.surfaces.map(surfaceLabel).join(" · ")}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((r) => (
          <TestCard key={r.id} row={r} basePath={basePath} t={t} />
        ))}
      </div>

      {remaining > 0 || expanded ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 border border-line bg-paper px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:border-neutral-400 hover:bg-paper-soft"
        >
          {expanded ? t.showLess : t.showMore.replace("{count}", String(remaining))}
        </button>
      ) : null}
    </section>
  );
}

export default function AbTestGallery({
  lang,
  rows: allRows,
  categories,
  surfaces,
  basePath,
}: {
  lang: Lang;
  rows: readonly AbTestRow[];
  categories: readonly AbCategory[];
  surfaces: readonly Surface[];
  basePath: string;
}) {
  const t = T[lang];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [surface, setSurface] = useState<Surface | "">("");

  const haystack = useMemo(
    () =>
      allRows.map((r) =>
        [r.id, r.question, r.category, r.primaryKpi, r.surface, surfaceLabel(r.surface)]
          .join(" ")
          .toLocaleLowerCase(lang),
      ),
    [allRows, lang],
  );

  const q = query.trim().toLocaleLowerCase(lang);
  const isDefault = !q && !category && !surface;
  const activeCount = (q ? 1 : 0) + (category ? 1 : 0) + (surface ? 1 : 0);

  const filtered = useMemo(
    () =>
      allRows.filter(
        (r, i) =>
          (!q || haystack[i].includes(q)) &&
          (!category || r.category === category) &&
          (!surface || r.surface === surface),
      ),
    [allRows, haystack, q, category, surface],
  );

  const sections = useMemo(() => {
    if (!isDefault) return [];
    const byCat = new Map<string, AbTestRow[]>();
    for (const r of allRows) {
      const arr = byCat.get(r.category) ?? [];
      arr.push(r);
      byCat.set(r.category, arr);
    }
    return categories.filter((c) => byCat.has(c.id)).map((c) => ({ category: c, items: byCat.get(c.id)! }));
  }, [allRows, categories, isDefault]);

  const presentSurfaces = useMemo(() => {
    const present = new Set(allRows.map((r) => r.surface));
    return surfaces.filter((s) => present.has(s));
  }, [allRows, surfaces]);

  const clearAll = () => {
    setQuery("");
    setCategory("");
    setSurface("");
  };

  const selectClass =
    "w-full border border-line bg-paper px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-blue-600 sm:w-auto";

  return (
    <div>
      <div className="flex items-center gap-3 border border-line bg-paper px-4 py-2.5 focus-within:border-blue-600">
        <Search aria-hidden className="size-4 shrink-0 text-neutral-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search}
          className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-neutral-500"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={t.clear}
            className="shrink-0 text-neutral-400 transition-colors hover:text-ink-700"
          >
            <X aria-hidden className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <label className="block">
          <span className="sr-only">{t.category}</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
            <option value="">{t.allCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">{t.surface}</span>
          <select
            value={surface}
            onChange={(e) => setSurface(e.target.value as Surface | "")}
            className={selectClass}
          >
            <option value="">{t.allSurfaces}</option>
            {presentSurfaces.map((s) => (
              <option key={s} value={s}>
                {surfaceLabel(s)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!isDefault ? (
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-500 tabular-nums">
            {filtered.length} / {allRows.length} {t.results}
          </p>
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              <X aria-hidden className="size-3.5" />
              {t.clear}
            </button>
          ) : null}
        </div>
      ) : null}

      {isDefault ? (
        <div className="mt-8 flex flex-col gap-12">
          {sections.map((s) => (
            <CategorySection key={s.category.id} category={s.category} items={s.items} basePath={basePath} t={t} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Same designed dead end as the journey gallery's: count in the
           mono register, prose message, and the single useful action. */
        <div className="mt-5 border-t border-b border-line py-16 text-center">
          <p className="font-mono text-[11px] tracking-[0.12em] text-ink-400 uppercase tabular-nums">
            0 / {allRows.length}
          </p>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-700">{t.empty}</p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            <X aria-hidden className="size-3.5" />
            {t.clear}
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <TestCard key={r.id} row={r} basePath={basePath} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
