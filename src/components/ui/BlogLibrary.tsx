"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { BlogCard } from "./BlogCard";
import { PortraitContainer } from "./PortraitContainer";
import { Section } from "./Section";
import type { BlogFacetCount, BlogPost } from "@/lib/blog";
import type { Lang } from "@/lib/content";

/* Editorial blog library — REFINEMENT ROUND. Was a filtered-database
   shell (a permanent desktop sidebar with sort radios and category/topic
   checkboxes, a grid/list toggle, a wide detached search field) built
   from this site's shared Facets.tsx primitive. That primitive stays
   untouched globally (AB-library/Journeys still use it) - it's just no
   longer used HERE, because five articles don't need a filter sidebar.

   Replaced with one lightweight editorial toolbar: a text-tab category
   row (only the categories real posts actually have - never a filter
   with zero matching posts) and a narrower search field, side by side.
   No sort control (always newest-first - there's no real reason for a
   visitor to reverse five articles) and no grid/list toggle (one
   intentional reading layout).

   The newest post becomes a featured slot ONLY in the true default view
   (category="all", no search) - filtering or searching drops straight to
   a plain grid of the matching results, because "the newest article" is
   an editorial choice about the front page, not a property of a filtered
   subset. `topic`/`contentType` facets from blog.ts are no longer
   surfaced as UI at all (categories are the only filter this round's
   brief asks for) - the data itself is untouched, only this file stopped
   reading those two facets. */

type Facets = { categories: BlogFacetCount[]; topics: BlogFacetCount[]; contentTypes: BlogFacetCount[] };

const T = {
  en: {
    all: "All",
    searchPlaceholder: "Search articles…",
    resultsCount: (n: number) => `${n} ${n === 1 ? "article" : "articles"}`,
    emptyFilteredTitle: "No articles found.",
    emptyFilteredBody: "Try another search or clear the current filter.",
    clearFilters: "Clear filters",
    readArticle: "Read article",
  },
  tr: {
    all: "Tümü",
    searchPlaceholder: "Yazılarda ara…",
    resultsCount: (n: number) => `${n} yazı`,
    emptyFilteredTitle: "Hiç yazı bulunamadı.",
    emptyFilteredBody: "Başka bir arama deneyin veya filtreyi temizleyin.",
    clearFilters: "Filtreleri temizle",
    readArticle: "Yazıyı oku",
  },
} as const;

/** Short editorial label per real category — the tab row's own text, not
    a rename of the underlying filter value. "Experimentation" already
    reads fine as a tab in English; Turkish reuses the CRO calculator
    category's own established translation for the same real concept
    (CalculatorRoutes.tsx's CATEGORY_LABEL, "Deneysel Test") rather than
    inventing a second one here. */
const CATEGORY_TAB_LABEL: Record<string, { en: string; tr: string }> = {
  "Growth Metrics": { en: "Growth", tr: "Growth" },
  "Lifecycle & CRM": { en: "Lifecycle", tr: "Lifecycle" },
  Experimentation: { en: "Experimentation", tr: "Deneysel Test" },
};

export function BlogLibrary({
  lang, posts, facets, basePath, emptyTitle, emptyBody,
}: {
  lang: Lang;
  posts: BlogPost[];
  facets: Facets;
  basePath: string;
  /** Shown only when there are genuinely zero posts at all (TR today) -
      distinct from the "filtered to zero" empty state below, which needs
      different wording (clear the filter, not "nothing published yet"). */
  emptyTitle: string;
  emptyBody: string;
}) {
  const t = T[lang];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const isDefaultView = category === "all" && query.trim() === "";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Always newest-first (blog-posts.ts's own array order already is,
    // but sorting explicitly keeps this correct if that ever changes).
    return [...posts]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((p) => {
        if (category !== "all" && p.category !== category) return false;
        if (q && !p.title.toLowerCase().includes(q)) return false;
        return true;
      });
  }, [posts, query, category]);

  const featured = isDefaultView ? filtered[0] : null;
  const rest = featured ? filtered.slice(1) : filtered;

  if (posts.length === 0) {
    // Genuinely nothing published (TR today) — no toolbar, no tabs, no
    // search: there is nothing to browse or search among yet.
    return (
      <Section tone="paper" size="md" className="pt-8! md:pt-10!">
        <PortraitContainer>
          <div className="border-t border-line-soft py-16 text-center">
            <p className="text-lg font-medium text-ink-950">{emptyTitle}</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-950/65">{emptyBody}</p>
          </div>
        </PortraitContainer>
      </Section>
    );
  }

  return (
    <Section tone="paper" size="md" className="pt-8! md:pt-10!">
      <PortraitContainer>
        {/* Toolbar: category tabs left, search right - one editorial
            control row, not a form. Horizontally scrollable on mobile
            rather than wrapping into multiple rows. */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-5 overflow-x-auto pb-1 [scrollbar-width:none] sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`shrink-0 border-b-2 pb-1 text-sm font-medium whitespace-nowrap transition-colors duration-[var(--duration-fast)] ${
                category === "all" ? "border-primary-600 text-ink-950" : "border-transparent text-ink-500 hover:text-ink-950"
              }`}
            >
              {t.all}
            </button>
            {facets.categories.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCategory(f.id)}
                className={`shrink-0 border-b-2 pb-1 text-sm font-medium whitespace-nowrap transition-colors duration-[var(--duration-fast)] ${
                  category === f.id ? "border-primary-600 text-ink-950" : "border-transparent text-ink-500 hover:text-ink-950"
                }`}
              >
                {CATEGORY_TAB_LABEL[f.id]?.[lang] ?? f.id}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-full border border-neutral-200 bg-paper py-2 pr-4 pl-9 text-sm text-ink-900 outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] placeholder:text-neutral-500 focus:border-neutral-500"
            />
          </div>
        </div>

        {/* Result count — only while a filter/search is actually active,
            per this round's "don't permanently display a count" rule. */}
        {!isDefaultView && (
          <p className="mt-5 text-sm text-ink-500 tabular-nums">{t.resultsCount(filtered.length)}</p>
        )}

        {filtered.length === 0 ? (
          <div className="mt-10 border-t border-line-soft py-16 text-center">
            <p className="text-lg font-medium text-ink-950">{t.emptyFilteredTitle}</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-950/65">{t.emptyFilteredBody}</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="mt-5 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {t.clearFilters}
            </button>
          </div>
        ) : (
          <div className={isDefaultView ? "mt-10 flex flex-col gap-10" : "mt-8 flex flex-col gap-10"}>
            {featured && (
              <BlogCard key={featured.slug} post={featured} href={`${basePath}/${featured.slug}`} lang={lang} featured />
            )}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <BlogCard key={post.slug} post={post} href={`${basePath}/${post.slug}`} lang={lang} />
                ))}
              </div>
            )}
          </div>
        )}
      </PortraitContainer>
    </Section>
  );
}
