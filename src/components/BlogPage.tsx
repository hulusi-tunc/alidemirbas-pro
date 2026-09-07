import { SiteFooter, SiteHeader } from "@/components/Site";
import { Section } from "@/components/ui/Section";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { BlogLibrary } from "@/components/ui/BlogLibrary";
import { BlogCover, COVERS } from "@/components/ui/BlogCover";
import { fallbackCover } from "@/components/ui/BlogCard";
import { copy, type Lang } from "@/lib/content";
import { getAllBlogPosts, getBlogFacets } from "@/lib/blog";
import { breadcrumbList } from "@/lib/schema";
import { JsonLdScript } from "@/components/ui/JsonLdScript";

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
    emptyBody: "Posts on growth, CRM and lifecycle marketing will be published here.",
  },
  tr: {
    eyebrow: "Blog",
    title: "Büyüme, CRM ve lifecycle pazarlama üzerine yazılar.",
    emptyTitle: "Henüz bir yazı yok.",
    emptyBody: "Büyüme, CRM ve lifecycle pazarlama üzerine yazılar burada yayımlanacak.",
  },
};

export function basePathFor(lang: Lang) {
  return lang === "en" ? "/blog" : "/tr/blog";
}

/* Two-cover staggered collage beside the hero H1 - the asymmetric-hero
   mechanism from the Articler Figma reference (2026-08 review), rebuilt
   with this site's own real BlogCover system in place of that
   reference's travel photography. Two real, existing posts, picked for
   visual range (a two-line ratio cover and a one-line single-word
   cover) rather than strict recency - a curatorial choice, not a claim
   about which posts are newest (BlogLibrary's own featured slot already
   makes that claim, correctly, further down the page). */
const HERO_COVER_SLUGS = ["the-guardrail-metric-most-ab-tests-forget", "ltv-cac-ratio-doesnt-tell-you-when-to-scale"];

function HeroCoverCollage({ posts }: { posts: ReturnType<typeof getAllBlogPosts> }) {
  const covers = HERO_COVER_SLUGS.map((slug) => posts.find((p) => p.slug === slug)).filter((p): p is NonNullable<typeof p> => !!p);
  if (covers.length < 2) return null;
  return (
    // Hidden below `lg`: BlogCover's "grid" size is sized for a full
    // BlogCard-width frame, and this collage's two side-by-side cards
    // have no room for that type scale at a phone or tablet width - the
    // text overflowed its card there. The hero already reads fine as
    // text-only at that width (this is the same layout it always had
    // before this pass); the collage is a wide-screen decoration, not
    // load-bearing content.
    <div className="hidden w-full grid-cols-2 items-end gap-4 lg:grid">
      {covers.map((post, i) => (
        <span
          key={post.slug}
          className={`block aspect-[3/4] overflow-hidden rounded-card ${i === 0 ? "mt-10" : ""}`}
        >
          <BlogCover spec={COVERS[post.slug] ?? fallbackCover(post.category)} size="grid" />
        </span>
      ))}
    </div>
  );
}

export default function BlogPage({ lang }: { lang: Lang }) {
  const c = copy[lang];
  const t = T[lang];
  const home = lang === "en" ? "/" : "/tr";
  const posts = getAllBlogPosts(lang);
  const facets = getBlogFacets(posts);
  const breadcrumb = breadcrumbList([
    { name: c.footer.home, url: home },
    { name: c.nav.blog, url: basePathFor(lang) },
  ]);

  return (
    <>
      <JsonLdScript data={breadcrumb} />
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
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.7fr)] lg:gap-16">
                <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-none lg:text-left">
                  <p className="altor-eyebrow mb-4 text-ink-subtle">{t.eyebrow}</p>
                  <h1 className="text-h1 text-ink-950">{t.title}</h1>
                </div>
                <HeroCoverCollage posts={posts} />
              </div>
            ) : (
              // No posts (TR today) - the collage has nothing real to show,
              // so this keeps the plain centered heading rather than an
              // empty or placeholder pair of covers.
              <div className="mx-auto max-w-2xl text-center">
                {/* `.altor-eyebrow` is plain case now - see its note in
                    globals.css. */}
                <p className="altor-eyebrow mb-4 text-ink-subtle">{t.eyebrow}</p>
                <h1 className="text-h1 text-ink-950">{t.title}</h1>
              </div>
            )}
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
