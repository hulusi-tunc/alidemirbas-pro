"use client";

import { useMemo, useState } from "react";
import { Grid3x3, List as ListIcon, Search, SlidersHorizontal, X } from "lucide-react";

import { BlogCard } from "./BlogCard";
import { FacetCheckbox, FacetGroup } from "./Facets";
import { PortraitContainer } from "./PortraitContainer";
import { Section } from "./Section";
import type { BlogFacetCount, BlogPost } from "@/lib/blog";
import type { Lang } from "@/lib/content";

/* The editorial blog library shell: search, grid/list toggle, a filter
   sidebar built from this site's existing Facets.tsx primitives (not a
   new filter control system), and the results themselves. All client-
   side - the post list is small enough that a server round-trip per
   filter change isn't worth the complexity yet.

   Every filter GROUP is conditional on real data: a facet with zero
   distinct values simply doesn't render (see the `.length > 0` guards
   below) rather than showing an empty, decorative control. With 5 real
   posts today, `categories` (3 values) and `topics` (5 values) both
   render for real; `contentTypes` does NOT — every post today is
   "Article" (see blog-posts.ts), so that facet would have exactly one
   selectable option that can never actually change the visible set. A
   `.length > 1` guard (not `.length > 0`) keeps it hidden until a second
   real content type exists, per this round's own "only expose filters
   supported by real data" instruction — showing a single-option filter
   isn't wrong data, but it is a functionally inert control, which is the
   thing being guarded against here specifically.

   PORTRAIT PILOT (PORTRAIT-DESIGN-SOURCE-AUDIT.md): the search field,
   segmented grid/list toggle and mobile filter trigger below are restyled
   to the Contact-approved, LOCKED visual grammar — pill shape, neutral
   borders (no brand-blue focus/accent), `ease-out-smooth` motion. The
   shared `Facets.tsx` primitive itself (FacetCheckbox/FacetGroup, used by
   AB-library and Journeys too) is INTENTIONALLY UNTOUCHED — restyling it
   is out of this round's scope (those two page families are explicitly
   not to be touched), so the sidebar's actual checkboxes/radios still
   render in their existing style; only this file's own layout/search/
   toggle controls changed. */

type Facets = { categories: BlogFacetCount[]; topics: BlogFacetCount[]; contentTypes: BlogFacetCount[] };

const T = {
  en: {
    searchPlaceholder: "Search posts...",
    filtersLabel: "Filter and sort",
    sortLabel: "Sort by",
    sortNewest: "Newest first",
    sortOldest: "Oldest first",
    categoryLabel: "Category",
    topicLabel: "Topic",
    contentTypeLabel: "Content type",
    gridLabel: "Grid",
    listLabel: "List",
    clearAll: "Clear all",
    empty: "Nothing matches those filters.",
    resultsCount: (n: number) => `${n} ${n === 1 ? "post" : "posts"}`,
  },
  tr: {
    searchPlaceholder: "Yazılarda ara...",
    filtersLabel: "Filtrele ve sırala",
    sortLabel: "Sırala",
    sortNewest: "Önce en yeni",
    sortOldest: "Önce en eski",
    categoryLabel: "Kategori",
    topicLabel: "Konu",
    contentTypeLabel: "İçerik türü",
    gridLabel: "Izgara",
    listLabel: "Liste",
    clearAll: "Temizle",
    empty: "Bu filtrelerle eşleşen yazı yok.",
    resultsCount: (n: number) => `${n} yazı`,
  },
} as const;

function FilterSidebar({
  t, facets, category, setCategory, topic, setTopic, contentType, setContentType, sort, setSort,
}: {
  t: (typeof T)[Lang];
  facets: Facets;
  category: Set<string>; setCategory: (v: Set<string>) => void;
  topic: Set<string>; setTopic: (v: Set<string>) => void;
  contentType: Set<string>; setContentType: (v: Set<string>) => void;
  sort: "newest" | "oldest"; setSort: (v: "newest" | "oldest") => void;
}) {
  const toggle = (set: Set<string>, setFn: (v: Set<string>) => void, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    setFn(next);
  };

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="text-sm font-medium tracking-tight text-ink-950">{t.sortLabel}</p>
        <div className="mt-2.5 flex flex-col gap-1">
          {(["newest", "oldest"] as const).map((id) => (
            <label key={id} className="flex cursor-pointer items-center gap-2.5 py-[7px] text-sm">
              <input
                type="radio"
                checked={sort === id}
                onChange={() => setSort(id)}
                // Locally-defined radio (not Facets.tsx's shared FacetRadio),
                // so safe to move off `accent-blue-600` — no Portrait
                // evidence supports a brand-blue accent (Contact round 3's
                // own finding), and this control isn't shared with
                // AB-library/Journeys.
                className="size-[18px] accent-ink-900"
              />
              <span className={sort === id ? "font-medium text-ink-950" : "text-ink-700"}>
                {id === "newest" ? t.sortNewest : t.sortOldest}
              </span>
            </label>
          ))}
        </div>
      </div>

      {facets.categories.length > 0 && (
        <FacetGroup title={t.categoryLabel} moreLabel="" lessLabel="">
          {facets.categories.map((f) => (
            <FacetCheckbox
              key={f.id}
              label={f.id}
              count={f.count}
              selected={category.has(f.id)}
              onSelect={() => toggle(category, setCategory, f.id)}
            />
          ))}
        </FacetGroup>
      )}

      {facets.topics.length > 0 && (
        <FacetGroup title={t.topicLabel} moreLabel="" lessLabel="">
          {facets.topics.map((f) => (
            <FacetCheckbox
              key={f.id}
              label={f.id}
              count={f.count}
              selected={topic.has(f.id)}
              onSelect={() => toggle(topic, setTopic, f.id)}
            />
          ))}
        </FacetGroup>
      )}

      {facets.contentTypes.length > 1 && (
        <FacetGroup title={t.contentTypeLabel} moreLabel="" lessLabel="">
          {facets.contentTypes.map((f) => (
            <FacetCheckbox
              key={f.id}
              label={f.id}
              count={f.count}
              selected={contentType.has(f.id)}
              onSelect={() => toggle(contentType, setContentType, f.id)}
            />
          ))}
        </FacetGroup>
      )}
    </div>
  );
}

export function BlogLibrary({
  lang, posts, facets, basePath, emptyTitle, emptyBody,
}: {
  lang: Lang;
  posts: BlogPost[];
  facets: Facets;
  basePath: string;
  emptyTitle: string;
  emptyBody: string;
}) {
  const t = T[lang];
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState<Set<string>>(new Set());
  const [topic, setTopic] = useState<Set<string>>(new Set());
  const [contentType, setContentType] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // contentTypes: `> 1`, not `> 0` — see this file's own top comment
  // (a single real value can't ever change the visible set).
  const hasFacets = facets.categories.length > 0 || facets.topics.length > 0 || facets.contentTypes.length > 1;

  const results = useMemo(() => {
    let list = posts.filter((p) => {
      if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (category.size > 0 && !category.has(p.category)) return false;
      if (topic.size > 0 && (!p.topic || !topic.has(p.topic))) return false;
      if (contentType.size > 0 && (!p.contentType || !contentType.has(p.contentType))) return false;
      return true;
    });
    list = [...list].sort((a, b) =>
      sort === "newest" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date),
    );
    return list;
  }, [posts, query, category, topic, contentType, sort]);

  const sidebarProps = { t, facets, category, setCategory, topic, setTopic, contentType, setContentType, sort, setSort };

  return (
    <>
    {/* Section handles the vertical rhythm (locked "md" tier, same as
        Contact/Stack/the hero above this component); PortraitContainer is
        the locked 1280px measure, replacing `.altor-container` (1248px).

        POLISH ROUND: `md:pt-16!` (paired with BlogPage.tsx's own
        `md:pb-16!` on the hero above this) shrinks the real measured
        224px hero-to-search gap to ~128px at `md:`/1440/820, leaving the
        144px mobile gap untouched — see BlogPage.tsx's own comment for
        the full before/after numbers. */}
    <Section tone="paper" size="md" className="md:pt-16!">
      <PortraitContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search: the exact locked pill/neutral field grammar from
            Contact's `fieldBase` (rounded-full, border-neutral-200,
            focus:border-neutral-500, ease-out-smooth) - same visual
            family, not a per-page variant. */}
        <div className="relative w-full max-w-sm">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-full border border-neutral-200 bg-paper py-2.5 pr-4 pl-10 text-sm text-ink-900 outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] placeholder:text-neutral-500 focus:border-neutral-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {hasFacets && (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-sm text-ink-700 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:border-ink-300 lg:hidden"
            >
              <SlidersHorizontal aria-hidden className="size-3.5" />
              {t.filtersLabel}
            </button>
          )}
          {/* Grid/list toggle: a pill-shaped segmented control (LOCKED
              pill-button grammar), the active pill filled `bg-ink-900`
              (Portrait's real confirmed neutral-dark CTA fill, per
              PORTRAIT-DESIGN-SOURCE-AUDIT.md's round-3 addendum - not
              brand blue, which this control never used anyway). */}
          <div className="flex gap-0.5 rounded-full border border-neutral-200 p-1">
            <button
              type="button"
              aria-label={t.gridLabel}
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
              className={`grid size-7 place-items-center rounded-full transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] ${view === "grid" ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-950"}`}
            >
              <Grid3x3 aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              aria-label={t.listLabel}
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
              className={`grid size-7 place-items-center rounded-full transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] ${view === "list" ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-950"}`}
            >
              <ListIcon aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[13rem_1fr]">
        {hasFacets && (
          <aside className="hidden lg:block">
            <FilterSidebar {...sidebarProps} />
          </aside>
        )}

        <div>
          {results.length === 0 ? (
            <div className="border-t border-line-soft py-16 text-center">
              <p className="text-lg font-medium text-ink-950">{emptyTitle}</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-950/65">{emptyBody}</p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((post) => (
                <BlogCard key={post.slug} post={post} href={`${basePath}/${post.slug}`} lang={lang} variant="grid" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              {results.map((post) => (
                <BlogCard key={post.slug} post={post} href={`${basePath}/${post.slug}`} lang={lang} variant="list" />
              ))}
            </div>
          )}
        </div>
      </div>
      </PortraitContainer>
      </Section>

      {/* Fixed-position overlay - deliberately OUTSIDE Section/
          PortraitContainer above (a `fixed` element positions against the
          viewport, not a max-width ancestor, so nesting it inside would
          cost nothing functionally, but closing the container first
          keeps the DOM's own structure honest about what's "page content
          in the 1280px column" vs. "a full-viewport overlay"). */}
      {hasFacets && drawerOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex lg:hidden">
          <div aria-hidden className="flex-1 bg-ink-950/40" onClick={() => setDrawerOpen(false)} />
          <div className="flex w-[85vw] max-w-xs flex-col overflow-y-auto bg-paper p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-medium text-ink-950">{t.filtersLabel}</p>
              <button type="button" aria-label="Close" onClick={() => setDrawerOpen(false)}>
                <X aria-hidden className="size-5 text-ink-700" />
              </button>
            </div>
            <FilterSidebar {...sidebarProps} />
          </div>
        </div>
      )}
    </>
  );
}
