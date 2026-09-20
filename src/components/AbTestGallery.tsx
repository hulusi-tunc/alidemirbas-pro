"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Target, X } from "lucide-react";

import IdeaCard from "@/components/ui/IdeaCard";
import { Button } from "@/components/ui/Button";
import { FilterMenu } from "@/components/ui/FilterMenu";
import { CategoryHeader, CategoryRail, SEARCH_SHELL, TOOLBAR_ROW } from "@/components/ui/LibraryChrome";
import { ALL_SURFACES_ICON, AbCategoryIcon, SurfaceIcon, abCategoryAccent } from "@/components/ui/AbLibraryIdentity";
import { clsx } from "@/lib/clsx";
import type { AbCategory, AbTestRow, Surface } from "@/lib/ab-test-view";
import { primaryKpiLabel } from "@/lib/ab-test-kpi-labels";

/* The A/B test library as a browsable gallery: category sections over a
   grid of cards, with search and a filter above the whole thing.

   MECHANISM SOURCE: this site's own JourneyGallery (/lab/customer-journeys),
   per site-owner direction to make this library look like that one
   (2026-09-13, and again 2026-09-20 once that page had its rail, its
   glyphs and its custom menus: "now update the A/B Test Library"). Same
   chrome (ui/LibraryChrome), same card (ui/IdeaCard), same category rail
   down the left from lg, same default-vs-filtered split: sections group
   the DEFAULT view only, and the moment a search or a filter is active a
   flat grid of matches takes over. What is different is only what the
   data can honestly supply:

   - Sections are the library's twelve real categories, in the order the
     archive itself numbers them (AB-001 opens "Cart & Checkout"). A
     category has no purpose sentence, so the line under its title is its
     real page set instead - "Cart · Checkout" - rather than a sentence
     written to fill the slot.
   - No id prefix on a section: every id here is AB-nnn, so the prefix that
     marks a journey category would say "AB" twelve times and mean nothing.
     The heading carries the count alone.
   - Each category and each page has a glyph and a tint of its own
     (ui/AbLibraryIdentity.tsx), the way the journey taxonomy has, so the
     rail and the cards can be scanned before they are read.
   - The card is a QUESTION CARD (2026-09-20, Hulusi: "the texts are so
     long it looks ugly"): a scenario's title is a three-line question
     where a journey's name is two words, so inside a section the card
     drops its glyph tile (the section heading carries it) and the title
     takes the whole width, held to three balanced lines; the page and the
     primary KPI - the playbook's own first rule, "one primary metric
     decides the winner" - sit on one quiet meta line under it rather than
     as two pills that never shared a row; the hypothesis runs to three
     lines so the card fills the height the grid gives it. In the filtered
     flat grid, where there is no section heading, the tile comes back.
   - One filter, Page. Category is the rail's job (a menu over twelve
     titles would be a second, worse way to the same place - the journey
     page dropped its own for that reason). The primary KPI is deliberately
     not a filter: 68 distinct labels across 211 tests is a list, not a
     facet.

   Filter state is local - no URL sync - so the page prerenders whole with
   no Suspense fallback to maintain. */

const SECTION_PREVIEW_COUNT = 6;

const T = {
  en: {
    search: "Search by question, category or KPI",
    surface: "Page",
    allSurfaces: "All pages",
    rail: "Categories",
    results: "scenarios",
    testsLabel: ["scenario", "scenarios"],
    clear: "Clear filters",
    empty: "No scenario matches these filters.",
    showMore: "Show more ({count})",
    showLess: "Show less",
    primaryKpi: "Primary KPI",
  },
  tr: {
    search: "Soru, kategori veya KPI'ya göre ara",
    surface: "Sayfa",
    allSurfaces: "Tüm sayfalar",
    rail: "Kategoriler",
    results: "senaryo",
    // Turkish takes no plural after a numeral - both forms identical on purpose.
    testsLabel: ["senaryo", "senaryo"],
    clear: "Filtreleri temizle",
    empty: "Bu filtrelere uyan senaryo yok.",
    showMore: "Daha fazla göster ({count})",
    showLess: "Daha az göster",
    primaryKpi: "Birincil KPI",
  },
} as const;

type Lang = keyof typeof T;

/* The dataset's `category` and `surface` values are stored in English and
   are never rewritten. The display labels come from CATEGORY_LABEL and
   SURFACE_LABEL in ui/AbTestVisuals.tsx and are resolved on the server,
   then handed down as plain id -> label maps: importing that module here
   would drag the whole 211-record marketing read model into the client
   bundle. */
type LabelMap = Readonly<Record<string, string>>;

/** A category's stored value is a title with spaces and ampersands; its
    section anchor is that title as a slug. */
const anchorOf = (id: string) => `cat-${id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

function TestCard({
  row,
  basePath,
  t,
  lang,
  categoryLabels,
  surfaceLabels,
  inSection,
}: {
  row: AbTestRow;
  basePath: string;
  t: (typeof T)[Lang];
  lang: Lang;
  categoryLabels: LabelMap;
  surfaceLabels: LabelMap;
  /** Under a category heading (which carries the glyph) or in the flat
      filtered grid (where the card carries it). */
  inSection: boolean;
}) {
  const kpi = primaryKpiLabel(row.primaryKpi, lang);
  return (
    <IdeaCard
      href={`${basePath}/${row.slug}`}
      icon={inSection ? undefined : <AbCategoryIcon id={row.category} />}
      iconTone={abCategoryAccent(row.category).tile}
      title={row.question}
      meta={[
        { label: surfaceLabels[row.surface] ?? row.surface, icon: <SurfaceIcon id={row.surface} /> },
        { label: kpi, icon: <Target aria-hidden />, title: `${t.primaryKpi}: ${kpi}` },
      ]}
      body={row.hypothesis}
      bodyLines={3}
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
  const title = categoryLabels[category.id] ?? category.id;
  // The category's real page set - unless it is one page that is the
  // category itself ("Pricing" under "Pricing"), which says nothing.
  const pages = category.surfaces.map((s) => surfaceLabels[s] ?? s).join(" · ");

  return (
    <section id={anchorOf(category.id)} data-cat={category.id} className="scroll-mt-24">
      <CategoryHeader
        id={category.id}
        icon={<AbCategoryIcon id={category.id} />}
        tone={abCategoryAccent(category.id).tile}
        title={title}
        count={items.length}
        countLabel={t.testsLabel[items.length === 1 ? 0 : 1]}
        purpose={pages.toLocaleLowerCase(lang) === title.toLocaleLowerCase(lang) ? undefined : pages}
      />

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((r) => (
          <TestCard key={r.id} row={r} basePath={basePath} t={t} lang={lang} categoryLabels={categoryLabels} surfaceLabels={surfaceLabels} inSection />
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
  const [surface, setSurface] = useState<Surface | "">("");

  const haystack = useMemo(
    () =>
      allRows.map((r) =>
        [
          r.id,
          r.question,
          r.category,
          categoryLabels[r.category] ?? "",
          r.primaryKpi,
          primaryKpiLabel(r.primaryKpi, lang),
          r.surface,
          surfaceLabels[r.surface] ?? "",
        ]
          .join(" ")
          .toLocaleLowerCase(lang),
      ),
    [allRows, categoryLabels, surfaceLabels, lang],
  );

  const q = query.trim().toLocaleLowerCase(lang);
  const isDefault = !q && !surface;
  const activeCount = (q ? 1 : 0) + (surface ? 1 : 0);

  const filtered = useMemo(
    () => allRows.filter((r, i) => (!q || haystack[i].includes(q)) && (!surface || r.surface === surface)),
    [allRows, haystack, q, surface],
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

  // Only offer a page that some real row actually sits on.
  const presentSurfaces = useMemo(() => {
    const present = new Set(allRows.map((r) => r.surface));
    return surfaces.filter((s) => present.has(s));
  }, [allRows, surfaces]);

  const clearAll = () => {
    setQuery("");
    setSurface("");
  };

  // Which section sits under the reading line - the last one whose top has
  // passed it. Read on a frame, written only when it changes. Same
  // mechanism as the journey gallery's.
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
          label={t.surface}
          all={{ label: t.allSurfaces, icon: ALL_SURFACES_ICON }}
          options={presentSurfaces.map((s) => ({ id: s, label: surfaceLabels[s] ?? s, icon: <SurfaceIcon id={s} /> }))}
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
            items={sections.map((s) => ({
              id: s.category.id,
              anchor: anchorOf(s.category.id),
              label: categoryLabels[s.category.id] ?? s.category.id,
              count: s.items.length,
              icon: <AbCategoryIcon id={s.category.id} className={clsx("size-4", abCategoryAccent(s.category.id).ink)} />,
            }))}
            active={activeCat}
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
                <TestCard key={r.id} row={r} basePath={basePath} t={t} lang={lang} categoryLabels={categoryLabels} surfaceLabels={surfaceLabels} inSection={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
