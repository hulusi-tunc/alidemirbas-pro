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

   IA (search, grid/list toggle, filter sidebar, editorial cards) is
   UNCHANGED — it already matched the previously-supplied blog reference's
   information architecture almost exactly before this round (see
   DESIGN-MIGRATION-PLAN.md §4.2's own finding). Only the VISUAL LANGUAGE
   changed, to Portrait's — see BlogLibrary.tsx/BlogCard.tsx for the
   detailed per-control translation. */
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

            POLISH ROUND: `md:pb-16!` shrinks this section's own bottom
            padding at `md:` and up ONLY — mobile is untouched, per this
            round's explicit "375px ritmi zaten iyi, mümkün olduğunca
            değiştirme" instruction. Paired with the matching `md:pt-16!`
            on BlogLibrary's own top padding (see that file), this cuts
            the measured real gap between the H1 and the search field from
            224px to ~128px at both 1440 and 820 (a ~43% reduction) while
            leaving the 144px mobile gap exactly as it was. */}
        {/* Centered per this round's site-wide request ("tüm başlıkları
            ortala") - was left-aligned (`max-w-md`, no `mx-auto`). */}
        <Section tone="paper" size="md" className="md:pb-16!">
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
