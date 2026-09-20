"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Target, X } from "lucide-react";

import IdeaCard from "@/components/ui/IdeaCard";
import { Button } from "@/components/ui/Button";
import { FilterMenu } from "@/components/ui/FilterMenu";
import {
  ALL_AB_CATEGORIES_ICON,
  ALL_AB_SURFACES_ICON,
  AbCategoryIcon,
  AbSurfaceIcon,
  SEARCH_SHELL,
  TOOLBAR_ROW,
  abCategoryAccent,
} from "@/components/ui/LibraryChrome";
import { clsx } from "@/lib/clsx";
import type { AbCategory, AbTestRow, Surface } from "@/lib/ab-test-view";
import { primaryKpiLabel } from "@/lib/ab-test-kpi-labels";

/* The A/B test library as a browsable gallery: category sections over a
   grid of cards, with search and two filters above the whole thing.

   MECHANISM SOURCE: this site's own JourneyGallery, per site-owner
   direction to make this library look like that one. Same structure, same
   card (ui/IdeaCard), same chrome (ui/LibraryChrome, ui/FilterMenu), same
   default-vs-filtered split: sections group the DEFAULT view only, and the
   moment a search or a filter is active a flat grid of matches takes over.
   What is different is only what the data can honestly supply:

   - Sections are the library's twelve real categories, in the order the
     archive itself numbers them (AB-001 opens "Cart & Checkout"). A
     category has no purpose sentence, so the line under its title is its
     real page set instead - "Cart · Checkout" - rather than a sentence
     written to fill the slot.
   - Every category carries its own glyph and tint (LibraryChrome), so the
     rail, the section heading and the cards can be found by colour.
   - The card's accent badge is the page, with the page's glyph; its muted
     badge is the primary KPI - the playbook's own first rule ("one primary
     metric decides the winner") made visible on every card. The body is
     the hypothesis.
   - Filters are Category and Page, as menus whose options carry the same
     glyphs. The primary KPI is deliberately not a filter: 68 distinct
     labels across 211 tests is a list, not a facet.

   Rebuilt 2026-09-20 onto the design system (Hulusi: the A/B library and
   detail pages were never updated). Filter state is local - no URL sync -
   so the page prerenders whole with no Suspense fallback to maintain. */

const SECTION_PREVIEW_COUNT = 6;

const T = {
  en: {
    search: "Search by question, category or KPI",
    category: "Category",
    allCategories: "All categories",
    surface: "Page",
    allSurfaces: "All pages",
    results: "scenario",
    testsLabel: ["scenario", "scenarios"],
    clear: "Clear filters",
    empty: "No scenario matches these filters.",
    showMore: "Show more ({count})",
    showLess: "Show less",
    primaryKpi: "Primary KPI",
    rail: "Categories",
  },
  tr: {
    search: "Soru, kategori veya KPI'ya göre ara",
    category: "Kategori",
    allCategories: "Tüm kategoriler",
    surface: "Sayfa",
    allSurfaces: "Tüm sayfalar",
    results: "senaryo",
    testsLabel: ["senaryo", "senaryo"],
    clear: "Filtreleri temizle",
    empty: "Bu filtrelerle eşleşen senaryo yok.",
    showMore: "Daha fazla göster ({count})",
    showLess: "Daha az göster",
    primaryKpi: "Birincil KPI",
    rail: "Kategoriler",
  },
} as const;

type Lang = keyof typeof T;

/* The category and surface display labels are resolved on the server
   (AbTestRoutes.tsx) and passed down as plain maps: the label tables live
   in ui/AbTestVisuals, which is server-only. */
type LabelMap = Record<string, string>;

function TestCard({
  row,
  basePath,
  t,
  lang,
  categoryLabels,
  surfaceLabels,
}: {
  row: AbTestRow;
  basePath: string;
  t: (typeof T)[Lang];
  lang: Lang;
  categoryLabels: LabelMap;
  surfaceLabels: LabelMap;
}) {
  return (
    <IdeaCard
      href={`${basePath}/${row.slug}`}
      icon={<AbCategoryIcon id={row.category} />}
      iconTone={abCategoryAccent(row.category).tile}
      title={row.question}
      badges={[
        { label: surfaceLabels[row.surface] ?? row.surface, tone: "accent", icon: <AbSurfaceIcon id={row.surface} /> },
        { label: primaryKpiLabel(row.primaryKpi, lang), tone: "muted", title: t.primaryKpi, icon: <Target aria-hidden /> },
      ]}
      body={row.hypothesis}
      footLeft={categoryLabels[row.category] ?? row.category}
      footRight={row.id}
    />
  );
}

function CategorySection({
  category,
  items,
  basePath,
  t,
  lang,
  categoryLabels,
  surfaceLabels,
}: {
  category: AbCategory;
  items: readonly AbTestRow[];
  basePath: string;
  t: (typeof T)[Lang];
  lang: Lang;
  categoryLabels: LabelMap;
  surfaceLabels: LabelMap;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, SECTION_PREVIEW_COUNT);
  const remaining = items.length - visible.length;
  const accent = abCategoryAccent(category.id);

  return (
    <section id={`cat-${slugOf(category.id)}`} data-cat={category.id} className="scroll-mt-24">
      <div className="flex items-start gap-4">
        <span className={clsx("grid size-10 shrink-0 place-items-center rounded-xl", accent.tile)}>
          <AbCategoryIcon id={category.id} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-h3 text-ink-950">{categoryLabels[category.id] ?? category.id}</h2>
            <span className="shrink-0 text-sm text-ink-500 tabular-nums">
              {items.length} {t.testsLabel[items.length === 1 ? 0 : 1]}
            </span>
          </div>
          {/* the category's real pages - the closest honest thing to a
              purpose sentence */}
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-600">
            {category.surfaces.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <AbSurfaceIcon id={s} className="size-4 text-ink-500" />
                {surfaceLabels[s] ?? s}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((r) => (
          <TestCard key={r.id} row={r} basePath={basePath} t={t} lang={lang} categoryLabels={categoryLabels} surfaceLabels={surfaceLabels} />
        ))}
      </div>

      {remaining > 0 || expanded ? (
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setExpanded((v) => !v)}>
          {expanded ? t.showLess : t.showMore.replace("{count}", String(remaining))}
        </Button>
      ) : null}
    </section>
  );
}

const slugOf = (id: string) => id.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/* THE CATEGORY RAIL: twelve sections make a page seven screens tall; the
   rail is the way across it - every category with its glyph, its tint and
   its count, anchored to its section, the one under the reading line
   held. Default view only, from lg. */
function CategoryRail({
  title,
  sections,
  active,
  categoryLabels,
}: {
  title: string;
  sections: readonly { id: string; count: number }[];
  active: string;
  categoryLabels: LabelMap;
}) {
  return (
    <nav aria-label={title} className="hidden lg:block">
      <div className="sticky top-20 max-h-[calc(100svh-6rem)] overflow-y-auto pr-2">
        <p className="px-3 text-sm font-semibold text-ink-950">{title}</p>
        <ol className="mt-2 flex list-none flex-col gap-0.5 p-0">
          {sections.map((c) => (
            <li key={c.id}>
              <a
                href={`#cat-${slugOf(c.id)}`}
                title={categoryLabels[c.id] ?? c.id}
                aria-current={active === c.id ? "true" : undefined}
                className={clsx(
                  "flex items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors duration-[var(--duration-fast)]",
                  active === c.id ? "bg-paper-soft font-medium text-ink-950" : "text-ink-600 hover:bg-paper-soft hover:text-ink-950",
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <AbCategoryIcon id={c.id} className={clsx("size-4 shrink-0", abCategoryAccent(c.id).ink)} />
                  <span className="truncate">{categoryLabels[c.id] ?? c.id}</span>
                </span>
                <span className="shrink-0 text-xs text-ink-500 tabular-nums">{c.count}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

export default function AbTestGallery({
  lang,
  rows: allRows,
  categories,
  surfaces,
  basePath,
  categoryLabels,
  surfaceLabels,
}: {
  lang: Lang;
  rows: readonly AbTestRow[];
  categories: readonly AbCategory[];
  surfaces: readonly Surface[];
  basePath: string;
  categoryLabels: LabelMap;
  surfaceLabels: LabelMap;
}) {
  const t = T[lang];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [surface, setSurface] = useState<Surface | "">("");

  const q = query.trim().toLowerCase();
  const isDefault = !q && !category && !surface;
  const activeCount = (q ? 1 : 0) + (category ? 1 : 0) + (surface ? 1 : 0);

  const filtered = useMemo(
    () =>
      allRows.filter(
        (r) =>
          (!category || r.category === category) &&
          (!surface || r.surface === surface) &&
          (!q ||
            [r.id, r.question, r.hypothesis, categoryLabels[r.category] ?? r.category, surfaceLabels[r.surface] ?? r.surface, primaryKpiLabel(r.primaryKpi, lang)]
              .join(" ")
              .toLowerCase()
              .includes(q)),
      ),
    [allRows, q, category, surface, categoryLabels, surfaceLabels, lang],
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

  // Only offer a page that some real row actually has.
  const presentSurfaces = useMemo(() => {
    const present = new Set(allRows.map((r) => r.surface));
    return surfaces.filter((s) => present.has(s));
  }, [allRows, surfaces]);

  const clearAll = () => {
    setQuery("");
    setCategory("");
    setSurface("");
  };

  // Which section sits under the reading line - the last one whose top has
  // passed it. Read on a frame, written only when it changes.
  const [activeCat, setActiveCat] = useState<string>("");
  useEffect(() => {
    if (!isDefault) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-cat]"));
    if (!els.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = 128;
      let best = els[0].dataset.cat ?? "";
      for (const el of els) if (el.getBoundingClientRect().top <= line) best = el.dataset.cat ?? best;
      setActiveCat(best);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isDefault, sections]);

  return (
    <div>
      <div className={TOOLBAR_ROW}>
        <div className={`${SEARCH_SHELL} min-w-0 lg:flex-1`}>
          <Search aria-hidden className="size-4 shrink-0 text-ink-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-500"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t.clear}
              className="shrink-0 text-ink-500 transition-colors duration-[var(--duration-fast)] hover:text-ink-950"
            >
              <X aria-hidden className="size-4" />
            </button>
          ) : null}
        </div>
        <FilterMenu
          label={t.category}
          all={{ label: t.allCategories, icon: ALL_AB_CATEGORIES_ICON }}
          options={categories.map((c) => ({ id: c.id, label: categoryLabels[c.id] ?? c.id, icon: <AbCategoryIcon id={c.id} /> }))}
          value={category}
          onChange={setCategory}
          align="end"
        />
        <FilterMenu
          label={t.surface}
          all={{ label: t.allSurfaces, icon: ALL_AB_SURFACES_ICON }}
          options={presentSurfaces.map((s) => ({ id: s, label: surfaceLabels[s] ?? s, icon: <AbSurfaceIcon id={s} className="size-4" /> }))}
          value={surface}
          onChange={(id) => setSurface(id as Surface | "")}
          align="end"
        />
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
              className="flex items-center gap-1.5 text-sm font-medium text-primary-600 transition-colors duration-[var(--duration-fast)] hover:text-primary-700"
            >
              <X aria-hidden className="size-3.5" />
              {t.clear}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className={clsx("mt-10", isDefault && "lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10")}>
        {isDefault ? (
          <CategoryRail
            title={t.rail}
            sections={sections.map((s) => ({ id: s.category.id, count: s.items.length }))}
            active={activeCat}
            categoryLabels={categoryLabels}
          />
        ) : null}
        <div className="min-w-0">
          {isDefault ? (
            <div className="flex flex-col gap-14">
              {sections.map((s) => (
                <CategorySection
                  key={s.category.id}
                  category={s.category}
                  items={s.items}
                  basePath={basePath}
                  t={t}
                  lang={lang}
                  categoryLabels={categoryLabels}
                  surfaceLabels={surfaceLabels}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-paper-soft px-6 py-16 text-center">
              <p className="text-sm text-ink-500 tabular-nums">0 / {allRows.length}</p>
              <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-ink-700">{t.empty}</p>
              <Button type="button" variant="outline" size="sm" className="mt-6" onClick={clearAll}>
                <X aria-hidden className="size-4" />
                {t.clear}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((r) => (
                <TestCard key={r.id} row={r} basePath={basePath} t={t} lang={lang} categoryLabels={categoryLabels} surfaceLabels={surfaceLabels} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
