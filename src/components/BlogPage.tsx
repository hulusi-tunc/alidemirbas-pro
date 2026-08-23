import { SiteFooter, SiteHeader } from "@/components/Site";
import { BlogLibrary } from "@/components/ui/BlogLibrary";
import { copy, type Lang } from "@/lib/content";
import { getAllBlogPosts, getBlogFacets } from "@/lib/blog";

/* No posts yet - getAllBlogPosts returns [] for real (see lib/blog.ts).
   The page below is the full editorial-library shell (search, grid/list,
   filters built from real facets) sitting on top of that honest empty
   state, not a placeholder pretending there's content: with zero posts,
   the filter sidebar has nothing to show and stays hidden (BlogLibrary's
   own `hasFacets` guard), and the results area renders the same "nothing
   published yet" message this page has always shown. The moment real
   posts exist in getAllBlogPosts, this same code starts filtering/
   searching/toggling them - no rewiring needed. */
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
        <section data-tone="dark" className="relative isolate overflow-hidden bg-ink-950 pt-40 pb-16 md:pb-20">
          <div className="altor-container">
            <p className="altor-eyebrow text-white/50">{t.eyebrow}</p>
            <h1 className="mt-2 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t.title}</h1>
          </div>
        </section>
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
