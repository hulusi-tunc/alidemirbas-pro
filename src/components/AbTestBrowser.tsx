"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

import { FacetRadio } from "@/components/ui/Facets";
import type { AbTestRow, Surface } from "@/lib/ab-test-view";

const T = {
  en: {
    search: "Search by subject or category",
    surface: "Page / surface",
    all: "All surfaces",
    results: "tests",
    clear: "Clear filters",
    empty: "No tests match these filters.",
  },
  tr: {
    search: "Konu veya kategoriye göre ara",
    surface: "Sayfa / yüzey",
    all: "Tüm yüzeyler",
    results: "test",
    clear: "Filtreleri temizle",
    empty: "Bu filtrelere uyan test yok.",
  },
};

export default function AbTestBrowser({
  lang,
  rows: allRows,
  surfaces,
  basePath,
}: {
  lang: "en" | "tr";
  rows: readonly AbTestRow[];
  surfaces: readonly Surface[];
  basePath: string;
}) {
  const t = T[lang];
  const [query, setQuery] = useState("");
  const [surface, setSurface] = useState<Surface | "">("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { rows, surfaceCounts } = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    const byQuery = (r: AbTestRow) => !q || [r.id, r.question, r.category].join(" ").toLocaleLowerCase().includes(q);
    const bySurface = (r: AbTestRow) => !surface || r.surface === surface;
    const forSurfaceFacet = allRows.filter(byQuery);
    return {
      rows: allRows.filter((r) => byQuery(r) && bySurface(r)),
      surfaceCounts: Object.fromEntries(surfaces.map((s) => [s, forSurfaceFacet.filter((r) => r.surface === s).length])),
    };
  }, [query, surface, allRows, surfaces]);

  const activeCount = (surface ? 1 : 0) + (query.trim() ? 1 : 0);

  const facetPanel = (
    <div className="space-y-2">
      <p className="mb-3 text-xs font-medium tracking-wide text-neutral-500 uppercase">{t.surface}</p>
      <FacetRadio label={t.all} count={allRows.length} selected={surface === ""} onSelect={() => setSurface("")} />
      {surfaces.map((s) => (
        <FacetRadio key={s} label={s} count={surfaceCounts[s] ?? 0} selected={surface === s} onSelect={() => setSurface(surface === s ? "" : s)} />
      ))}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          className="flex w-full items-center justify-between border border-line bg-paper px-4 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:border-neutral-400 lg:hidden"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal aria-hidden className="size-4 text-neutral-500" />
            {t.surface}
            {activeCount > 0 ? <span className="text-blue-600">({activeCount})</span> : null}
          </span>
          <ChevronDown aria-hidden className={`size-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
        </button>
        <div className={`${filtersOpen ? "mt-6 block" : "hidden"} lg:mt-0 lg:block`}>{facetPanel}</div>
      </aside>

      <div className="min-w-0">
        <div className="flex items-center gap-3 border border-line bg-paper px-4 py-2.5 focus-within:border-blue-600">
          <Search aria-hidden className="size-4 shrink-0 text-neutral-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-neutral-500"
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-500 tabular-nums">
            {rows.length} / {allRows.length} {t.results}
          </p>
          {activeCount > 0 ? (
            <button type="button" onClick={() => { setQuery(""); setSurface(""); }} className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
              <X aria-hidden className="size-3.5" />
              {t.clear}
            </button>
          ) : null}
        </div>

        {rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-neutral-500">{t.empty}</p>
        ) : (
          <div className="mt-4">
            {rows.map((r) => (
              <Link
                key={r.id}
                href={`${basePath}/${r.slug}`}
                className="group grid w-full grid-cols-1 items-start gap-3 border-t border-line py-6 text-left transition-colors last:border-b hover:bg-paper-soft sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:gap-6"
              >
                <span className="font-mono text-xs text-neutral-500 tabular-nums">{r.id}</span>
                <div className="min-w-0">
                  <p className="text-[15px] leading-snug font-medium tracking-tight text-ink-950">{r.question}</p>
                  <p className="mt-0.5 text-sm text-ink-500">{r.category}</p>
                </div>
                <span className="border border-line px-2 py-1 text-xs text-ink-500 sm:justify-self-end">{r.surface}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
