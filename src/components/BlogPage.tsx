import { SiteFooter, SiteHeader } from "@/components/Site";
import { Section } from "@/components/ui/Section";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { BlogLibrary } from "@/components/ui/BlogLibrary";
import { copy, type Lang } from "@/lib/content";
import { getAllBlogPosts, getBlogFacets } from "@/lib/blog";

/* Blog index — PORTRAIT PILOT (PORTRAIT-DESIGN-SOURCE-AUDIT.md is this
   round's source of truth; the Contact-approved tokens/patterns below are
   LOCKED and reused, not reinvented — see each comment for which).

   STALE-COMMENT CORRECTION: this file used to say "No posts yet -
   getAllBlogPosts returns [] for real." That was true when written but
   is no longer accurate for EN - `src/lib/blog-posts.ts` now holds 5 real,
   authored posts, and `getAllBlogPosts("en")` returns them. `[]` is still
   correct for TR specifically (blog is EN-only by design, see
   `src/lib/blog.ts`'s own comment) - so `/blog` has 5 real posts and a
   real, non-empty facet set, while `/tr/blog` correctly still hits the
   honest empty state. Both are exercised in this round's screenshots.

   EDITORIAL REFINEMENT ROUND: the filter-sidebar/grid-list-toggle/sort-
   control IA from the earlier Portrait pass was itself the thing this
   round's brief flagged - it read as a filtered CMS archive rather than
   a personal editorial publication, at a scale (5 real posts) that never
   needed that much interface. BlogLibrary.tsx and BlogCard.tsx now carry
   a lightweight category-tab + search toolbar, a featured-newest-post
   slot, and the BlogCover.tsx editorial cover system in place of the old
   sidebar/toggle/pastel-placeholder shell - see each file's own comment
   for the detail. This file's own hero/H1 treatment is unchanged beyond
   the vertical-rhythm tightening noted below. */
const T = {
  en: {
    eyebrow: "Blog",
    title: "Writing on growth, CRM and lifecycle marketing.",
    emptyTitle: "Nothing published yet.",
    emptyBody: "This section is reserved for writing on growth, CRM and lifecycle marketing. The first post will show up here.",
  },
  tr: {
    eyebrow: "Blog",
    title: "Büyüme, CRM ve lifecycle pazarlama üzerine yazılar.",
    emptyTitle: "Henüz bir yazı yok.",
    emptyBody: "Bu bölüm büyüme, CRM ve lifecycle pazarlama üzerine yazılar için ayrıldı. İlk yazı burada görünecek.",
  },
};

export function basePathFor(lang: Lang) {
  return lang === "en" ? "/blog" : "/tr/blog";
}

export default function BlogPage({ lang }: { lang: Lang }) {
  const c = copy[lang];
  const t = T[lang];
  const home = lang === "en" ? "/" : "/tr";
  const posts = getAllBlogPosts(lang);
  const facets = getBlogFacets(posts);

  return (
    <>
      <SiteHeader t={c} anchorBase={home} langHref={lang === "en" ? "/tr/blog" : "/blog"} />
      <main>
        {/* Light heading, replacing the old full-bleed dark `bg-ink-950`
            band — same LOCKED reasoning as Contact/Stack: Portrait's real
            production is light/low-noise throughout.

            EDITORIAL REFINEMENT ROUND: `pb-8!/md:pb-10!` (was `md:pb-16!`,
            mobile untouched at the default) - the brief flagged this hero
            as leaving "a very large amount of empty space" underneath the
            headline; no subtitle was added (the headline already explains
            the page, per that same brief), so the fix is purely tightening
            this section's own bottom padding. Paired with BlogLibrary's
            matching `pt-8!/md:pt-10!` (this file's other hero -> toolbar
            gap contributor), the combined hero-to-content gap is smaller
            at every breakpoint now, not just at `md:` as the previous
            pass left it. Still `size="md"`, still centered - just less
            dead air below the H1. */}
        <Section tone="paper" size="md" className="pb-8! md:pb-10!">
          <PortraitContainer>
            <div className="mx-auto max-w-2xl text-center">
              <p className="altor-eyebrow mb-4 text-ink-400">{t.eyebrow}</p>
              <h1 className="text-h1-fluid font-medium text-ink-950">{t.title}</h1>
            </div>
          </PortraitContainer>
        </Section>
        <BlogLibrary
          lang={lang}
          posts={posts}
          facets={facets}
          basePath={basePathFor(lang)}
          emptyTitle={t.emptyTitle}
          emptyBody={t.emptyBody}
        />
      </main>
      <SiteFooter t={c} lang={lang} />
    </>
  );
}
