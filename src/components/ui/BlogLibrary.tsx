"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { BlogCard, fallbackCover } from "./BlogCard";
import { BlogCover, COVERS, categoryAccent } from "./BlogCover";
import { PortraitContainer } from "./PortraitContainer";
import { Section } from "./Section";
import type { BlogFacetCount, BlogPost } from "@/lib/blog";
import type { Lang } from "@/lib/content";

function formatDate(iso: string, lang: Lang) {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { year: "numeric", month: "short", day: "numeric" });
}

/* One row of the "Latest" split's compact list - a small square cover,
   the category dot + date, and the title. No excerpt: the featured card
   beside it already carries the one long summary this slot needs, and a
   list of four is meant to be scanned, not read.

   MECHANISM SOURCE: adapted from a Figma Community personal-blog
   template ("Articler", reviewed 2026-08) - that reference's own
   "featured card + compact list" split, and its list row's small-
   thumbnail + icon-meta + title shape. Its surface (lavender/peach
   palette, circular photo thumbnails, a comment count) is NOT carried
   over - this list row uses BlogCover's real accent system in a small
   square instead of photography, and drops the comment count entirely
   since this blog has no comments feature to report a real count for. */
function BlogCompactRow({ post, href, lang }: { post: BlogPost; href: string; lang: Lang }) {
  const spec = COVERS[post.slug] ?? fallbackCover(post.category);
  const accent = categoryAccent(post.category);
  const dotClass = accent === "experimentation" ? "bg-primary-600" : accent === "growth" ? "bg-neutral-600" : "bg-ink-700";
  return (
    <Link href={href} className="group flex items-start gap-4 py-4 first:pt-0 last:pb-0">
      <span className="block size-16 shrink-0 overflow-hidden rounded-md">
        <BlogCover spec={spec} size="compact" />
      </span>
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="flex items-center gap-1.5 text-xs text-ink-500">
          <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${dotClass}`} />
          {post.category}
          <span aria-hidden className="text-ink-300">
            &middot;
          </span>
          <span className="font-mono">{formatDate(post.date, lang)}</span>
        </span>
        <span className="text-[15px] leading-[1.35] font-semibold tracking-tight text-ink-950 transition-colors duration-[var(--duration-fast)] group-hover:text-primary-700">
          {post.title}
        </span>
      </span>
    </Link>
  );
}

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
    emptyFilteredTitle: "Eşleşen yazı yok.",
    emptyFilteredBody: "Başka bir arama deneyin ya da filtreyi kaldırın.",
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
          <div className="rounded-card bg-paper-soft py-16 text-center">
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
          <div className="no-scrollbar flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-[var(--duration-fast)] ${
                category === "all" ? "bg-primary-600 text-white" : "bg-paper-soft text-ink-700 hover:bg-blue-50 hover:text-primary-700"
              }`}
            >
              {t.all}
            </button>
            {facets.categories.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCategory(f.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-[var(--duration-fast)] ${
                  category === f.id ? "bg-primary-600 text-white" : "bg-paper-soft text-ink-700 hover:bg-blue-50 hover:text-primary-700"
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
              className="w-full rounded-full bg-paper-soft py-2.5 pr-4 pl-9 text-sm text-ink-900 outline-none transition-shadow placeholder:text-ink-400 focus:shadow-[inset_0_0_0_1px_var(--color-primary-400)]"
            />
          </div>
        </div>

        {/* Result count — only while a filter/search is actually active,
            per this round's "don't permanently display a count" rule. */}
        {!isDefaultView && (
          <p className="mt-5 text-sm text-ink-500 tabular-nums">{t.resultsCount(filtered.length)}</p>
        )}

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-card bg-paper-soft py-16 text-center">
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
        ) : isDefaultView && featured ? (
          /* DEFAULT VIEW: featured card + a compact list beside it, not a
             plain grid - the split this blog's own real post count (5)
             actually fits, adapted from the Articler reference's
             "featured + list" mechanism (see BlogCompactRow's comment).
             At 5 posts, "featured + list of 4" uses every real post with
             no orphan row; a plain N-column grid was the thing under
             review here (see the retired comment this replaced, about a
             stranded last card). Revisit the split point if the archive
             grows enough that a list of the rest gets too long to scan. */
          <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <BlogCard post={featured} href={`${basePath}/${featured.slug}`} lang={lang} featured />
            {rest.length > 0 && (
              <div className="flex flex-col divide-y divide-line">
                {rest.map((post) => (
                  <BlogCompactRow key={post.slug} post={post} href={`${basePath}/${post.slug}`} lang={lang} />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Filtered/searched view: a plain grid of whatever matched - no
          // "featured" editorializing over a subset the visitor chose.
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {filtered.map((post) => (
              <BlogCard key={post.slug} post={post} href={`${basePath}/${post.slug}`} lang={lang} />
            ))}
          </div>
        )}
      </PortraitContainer>
    </Section>
  );
}
