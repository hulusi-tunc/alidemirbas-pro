"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, SlidersHorizontal, X } from "lucide-react";

import { FacetCheckbox, FacetGroup } from "./Facets";
import type { Lang } from "@/lib/content";

/* Calculators index — PORTRAIT PILOT, continuing the locked visual system
   (Contact/Stack/Blog/Lab; PORTRAIT-DESIGN-SOURCE-AUDIT.md remains this
   round's source of truth).

   ARCHITECTURE REUSED FROM BLOG (the approved pattern, not a new one):
   server component computes a plain, serializable data array + facet
   counts, hands them to this client component for search/filter state —
   identical shape to BlogPage.tsx -> BlogLibrary.tsx. The shared
   `Facets.tsx` primitive (FacetCheckbox/FacetGroup, also used by
   AB-library/Journeys/Blog) is consumed here exactly as Blog consumes
   it — NOT modified, so nothing about those pages' filter controls
   changes.

   REAL DATA ONLY: `entries`/`categoryFacets` below are computed from the
   real Phase 1 catalog (calc-catalog.ts) + TEXT_TOOLS by
   CalculatorRoutes.tsx's own `CalculatorIndexPage` and passed in as
   props — this file holds no calculator data or category names of its
   own and invents nothing. No "Most Popular"/"Trending" — the catalog
   carries no such signal, so none is shown (see this round's own report
   for the explicit check). */

export type CalcEntry = {
  slug: string;
  name: string;
  description: string;
  categoryLabel: string;
  /** Precomputed, lowercased "name + description + category + aliases" —
      search matches against real fields, per this round's own
      instruction; built server-side so this client component does no
      string-concatenation work on every keystroke. */
  searchText: string;
  href: string;
};

export type CategoryFacet = { id: string; label: string; count: number };

const T = {
  en: {
    searchPlaceholder: "Search calculators...",
    filtersLabel: "Filter",
    categoryLabel: "Category",
    clearAll: "Clear all",
    resultsCount: (n: number) => `${n} ${n === 1 ? "calculator" : "calculators"}`,
    empty: "No calculators match your search.",
    resetSearch: "Clear search and filters",
  },
  tr: {
    searchPlaceholder: "Hesaplayıcılarda ara...",
    filtersLabel: "Filtrele",
    categoryLabel: "Kategori",
    clearAll: "Temizle",
    resultsCount: (n: number) => `${n} hesaplayıcı`,
    empty: "Bu aramayla eşleşen hesaplayıcı yok.",
    resetSearch: "Arama ve filtreleri temizle",
  },
} as const;

function CalculatorEntryRow({ entry }: { entry: CalcEntry }) {
  return (
    <Link
      href={entry.href}
      className="group flex flex-col gap-1 py-4 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)]"
    >
      <span className="flex items-center gap-1.5 text-[15px] font-medium text-ink-950 transition-colors group-hover:text-ink-600">
        {entry.name}
        <ArrowUpRight
          aria-hidden
          className="size-3.5 shrink-0 text-ink-950/40 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
      <span className="text-sm leading-snug text-ink-950/65">{entry.description}</span>
      <span className="text-xs text-ink-950/65">{entry.categoryLabel}</span>
    </Link>
  );
}

function FilterSidebar({
  t, categoryFacets, category, setCategory,
}: {
  t: (typeof T)[Lang];
  categoryFacets: CategoryFacet[];
  category: Set<string>;
  setCategory: (v: Set<string>) => void;
}) {
  const toggle = (id: string) => {
    const next = new Set(category);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCategory(next);
  };

  return (
    <FacetGroup title={t.categoryLabel} moreLabel="" lessLabel="">
      {categoryFacets.map((f) => (
        <FacetCheckbox
          key={f.id}
          label={f.label}
          count={f.count}
          selected={category.has(f.id)}
          onSelect={() => toggle(f.id)}
        />
      ))}
    </FacetGroup>
  );
}

export function CalculatorLibrary({
  lang, entries, categoryFacets,
}: {
  lang: Lang;
  entries: CalcEntry[];
  categoryFacets: CategoryFacet[];
}) {
  const t = T[lang];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (q && !e.searchText.includes(q)) return false;
      // OR within the category facet, matching the site's own established
      // facet-combination convention (search-facet-combination-contract.json).
      if (category.size > 0 && !category.has(e.categoryLabel)) return false;
      return true;
    });
  }, [entries, query, category]);

  const hasActiveFilter = query.trim().length > 0 || category.size > 0;
  const reset = () => {
    setQuery("");
    setCategory(new Set());
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search: the exact locked pill/neutral field grammar from
            Contact/Blog's own search input — same visual family. */}
        <div className="relative w-full max-w-sm">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            className="w-full rounded-full border border-neutral-200 bg-paper py-2.5 pr-4 pl-10 text-sm text-ink-900 outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] placeholder:text-neutral-500 focus:border-neutral-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-ink-950/65">{t.resultsCount(results.length)}</p>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-sm text-ink-700 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:border-ink-300 lg:hidden"
          >
            <SlidersHorizontal aria-hidden className="size-3.5" />
            {t.filtersLabel}
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[13rem_1fr]">
        <aside className="hidden lg:block">
          <FilterSidebar t={t} categoryFacets={categoryFacets} category={category} setCategory={setCategory} />
        </aside>

        <div>
          {results.length === 0 ? (
            <div className="border-t border-line-soft py-16 text-center">
              <p className="text-base font-medium text-ink-950">{t.empty}</p>
              <button
                type="button"
                onClick={reset}
                className="mt-4 text-sm font-medium text-ink-900 underline decoration-line-soft underline-offset-4 transition-colors hover:text-ink-600"
              >
                {t.resetSearch}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 divide-y divide-line-soft sm:grid-cols-2 sm:gap-x-8 sm:gap-y-2 sm:divide-y-0 lg:grid-cols-3">
              {results.map((entry) => (
                <CalculatorEntryRow key={entry.slug} entry={entry} />
              ))}
            </div>
          )}
          {hasActiveFilter && results.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="mt-6 text-sm font-medium text-ink-900 underline decoration-line-soft underline-offset-4 transition-colors hover:text-ink-600"
            >
              {t.clearAll}
            </button>
          )}
        </div>
      </div>

      {drawerOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex lg:hidden">
          <div aria-hidden className="flex-1 bg-ink-950/40" onClick={() => setDrawerOpen(false)} />
          <div className="flex w-[85vw] max-w-xs flex-col overflow-y-auto bg-paper p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-medium text-ink-950">{t.filtersLabel}</p>
              <button type="button" aria-label="Close" onClick={() => setDrawerOpen(false)}>
                <X aria-hidden className="size-5 text-ink-700" />
              </button>
            </div>
            <FilterSidebar t={t} categoryFacets={categoryFacets} category={category} setCategory={setCategory} />
          </div>
        </div>
      )}
    </>
  );
}
