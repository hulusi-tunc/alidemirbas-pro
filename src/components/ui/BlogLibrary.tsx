"use client";

import { useMemo, useState } from "react";
import { Grid3x3, List as ListIcon, Search, SlidersHorizontal, X } from "lucide-react";

import { BlogCard } from "./BlogCard";
import { FacetCheckbox, FacetGroup } from "./Facets";
import type { BlogFacetCount, BlogPost } from "@/lib/blog";
import type { Lang } from "@/lib/content";

/* The editorial blog library shell: search, grid/list toggle, a filter
   sidebar built from this site's existing Facets.tsx primitives (not a
   new filter control system), and the results themselves. All client-
   side - the post list is small enough (and currently empty) that a
   server round-trip per filter change isn't worth the complexity yet.

   Every filter GROUP is conditional on real data: a facet with zero
   distinct values simply doesn't render (see the `.length > 0` guards
   below) rather than showing an empty, decorative control. With today's
   zero posts, that means the whole sidebar is absent and the search/
   toggle row sits above the existing honest empty state - exactly
   accurate to what the site currently has, not a placeholder pretending
   otherwise. */

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
        <p className="text-sm font-semibold tracking-tight text-ink-950">{t.sortLabel}</p>
        <div className="mt-2.5 flex flex-col gap-1">
          {(["newest", "oldest"] as const).map((id) => (
            <label key={id} className="flex cursor-pointer items-center gap-2.5 py-[7px] text-sm">
              <input
                type="radio"
                checked={sort === id}
                onChange={() => setSort(id)}
                className="size-[18px] accent-blue-600"
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

      {facets.contentTypes.length > 0 && (
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

  const hasFacets = facets.categories.length > 0 || facets.topics.length > 0 || facets.contentTypes.length > 0;

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
    <div className="altor-container py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full border border-line bg-paper py-2.5 pr-3 pl-9 text-sm text-ink-900 outline-none placeholder:text-neutral-500 focus:border-blue-600"
          />
        </div>
        <div className="flex items-center gap-2">
          {hasFacets && (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 border border-line px-3 py-2 text-sm text-ink-700 lg:hidden"
            >
              <SlidersHorizontal aria-hidden className="size-3.5" />
              {t.filtersLabel}
            </button>
          )}
          <div className="flex border border-line">
            <button
              type="button"
              aria-label={t.gridLabel}
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
              className={`grid size-9 place-items-center ${view === "grid" ? "bg-ink-950 text-white" : "text-neutral-500"}`}
            >
              <Grid3x3 aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              aria-label={t.listLabel}
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
              className={`grid size-9 place-items-center border-l border-line ${view === "list" ? "bg-ink-950 text-white" : "text-neutral-500"}`}
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
            <div className="border-t border-line py-16 text-center">
              <p className="text-lg font-medium text-ink-950">{emptyTitle}</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">{emptyBody}</p>
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

      {hasFacets && drawerOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex lg:hidden">
          <div aria-hidden className="flex-1 bg-ink-950/40" onClick={() => setDrawerOpen(false)} />
          <div className="flex w-[85vw] max-w-xs flex-col overflow-y-auto bg-paper p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-950">{t.filtersLabel}</p>
              <button type="button" aria-label="Close" onClick={() => setDrawerOpen(false)}>
                <X aria-hidden className="size-5 text-ink-700" />
              </button>
            </div>
            <FilterSidebar {...sidebarProps} />
          </div>
        </div>
      )}
    </div>
  );
}
