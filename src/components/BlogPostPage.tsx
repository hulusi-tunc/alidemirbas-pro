import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { RelatedGrid } from "@/components/ui/RelatedGrid";
import { BlogCover, COVERS, categoryAccent } from "@/components/ui/BlogCover";
import { fallbackCover } from "@/components/ui/BlogCard";
import { basePathFor } from "@/components/BlogPage";
import { copy, type Lang } from "@/lib/content";
import { getAllBlogPosts, BLOG_AUTHOR, type BlogPost } from "@/lib/blog";
import { breadcrumbList } from "@/lib/schema";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { SITE_URL } from "@/lib/seo";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** Real, derived from the post's own word count (title + excerpt + every
    section's body) at a standard 200wpm reading speed, rounded up - not a
    guessed number. */
function estimateReadTime(post: BlogPost): number {
  const words = [post.title, post.excerpt, ...post.sections.flatMap((s) => [s.heading, s.body])]
    .join(" ")
    .trim()
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/* Single post page.

   REWORKED across two passes. First pass, per the "Articler" Figma
   reference also used for the blog index (see BlogPage.tsx/
   BlogLibrary.tsx's own comments): a byline, an on-this-page TOC rail, a
   pull-quote pulled out of the body, a tags row, real share links, and
   prev/next - none of which the plain heading+paragraph shell before
   that pass had.

   SECOND PASS (2026-09), per a different Figma Community reference -
   "A Blog Template" by Mika Matikainen
   (figma.com/design/n3yq6xL6s3bP4BTm2lrkRm, "Article desktop" frame),
   picked by the user specifically for the article/post-detail page
   (Articler's own inner page didn't fit, per their own review) - added
   the two mechanisms that reference had and this page didn't: an
   author bio card (richer than the hero byline chip) and a "What to
   read next" related-POSTS grid, distinct from the existing "Related
   tools" block. Not carried over from that reference: its newsletter
   signup box (no real subscription backend exists to wire it to - a
   fake form would be exactly the kind of non-functional affordance
   this site avoids) and its illustrated decorative header art
   (BlogCover already fills that role, typographically, for this site).

   Every real-content rule from the first pass still holds:
   - The pull-quote is `post.pullQuote` - a verbatim sentence from the
     post's own sections (see blog-posts.ts), never new copy.
   - The byline/bio is BLOG_AUTHOR (lib/blog.ts) - one-author blog, so
     it's a shared constant instead of invented per-post data; `bio`
     restates the same real role and this blog's own real subject line.
   - The TOC is computed directly from `post.sections[].heading` - no
     new content, just the post's own structure surfaced as navigation.
   - Prev/next and "What to read next" are real other posts from
     blog-posts.ts - never invented titles; "next to read" picks
     same-category posts first, then whatever's left, newest first. */
export default function BlogPostPage({ lang, post }: { lang: Lang; post: BlogPost }) {
  const c = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const base = basePathFor(lang);
  const breadcrumb = breadcrumbList([
    { name: c.footer.home, url: home },
    { name: c.nav.blog, url: base },
    { name: post.title, url: `${base}/${post.slug}` },
  ]);

  const all = getAllBlogPosts(lang);
  const index = all.findIndex((p) => p.slug === post.slug);
  const prev = index > 0 ? all[index - 1] : null;
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : null;

  // "What to read next" - a Figma "A Blog Template" mechanism (2026-09
  // review) this page didn't have: related POSTS, not related tools.
  // Same-category posts first, then whatever's left, newest first within
  // each group - never a random pick, and never padded past what's real.
  const relatedPosts = all
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => {
      const aSame = a.category === post.category ? 0 : 1;
      const bSame = b.category === post.category ? 0 : 1;
      if (aSame !== bSame) return aSame - bSame;
      return b.date.localeCompare(a.date);
    })
    .slice(0, 3);

  const pageUrl = `${SITE_URL}${base}/${post.slug}`;
  const shareX = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(pageUrl)}`;
  const shareLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
  const readTime = estimateReadTime(post);
  const cover = COVERS[post.slug] ?? fallbackCover(post.category);

  return (
    <>
      <JsonLdScript data={breadcrumb} />
      <SiteHeader t={c} anchorBase={home} langHref={base} />
      <main>
        {/* THIRD PASS (2026-09): title area rebuilt to match "A Blog
            Template" exactly, per direct instruction - that reference has
            no dark section at all: plain text on the page's own paper
            background, then a full-width image area, then byline+share as
            one row underneath. The dark bg-ink-950 band this page used to
            open with was never from either Figma reference - it was this
            site's own pre-existing Calculator/Skill/Journey detail-page
            convention, copied in when this page was first built. It's
            gone now, on this page only; those other detail pages are
            untouched. The reference's photo goes to BlogCover, same
            reasoning as everywhere else on this blog: a real system,
            never stock/generated imagery. */}
        <section className="bg-paper pt-24 pb-10 md:pt-28">
          <div className="altor-container max-w-2xl">
            <Link href={base} className="inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-900">
              <ArrowLeft aria-hidden className="size-3.5" />
              Blog
            </Link>
            <div className="mt-8 text-center">
              <p className="text-xs text-ink-400">
                {formatDate(post.date)}
                {post.category && <> · {post.category}</>}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">{post.title}</h1>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-ink-600">{post.excerpt}</p>
            </div>
          </div>
        </section>

        {/* Cover / image area */}
        <div className="altor-container max-w-3xl">
          <span className="block aspect-[16/8] overflow-hidden rounded-card">
            <BlogCover spec={cover} size="featured" />
          </span>
        </div>

        {/* Byline + share, one row - the reference's own placement,
            directly under the cover rather than split top/bottom. */}
        <div className="altor-container max-w-2xl">
          <div className="mt-6 flex items-center justify-between gap-4 border-b border-line pb-6">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-paper-soft text-xs font-semibold text-ink-700">
                {BLOG_AUTHOR.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </span>
              <span>
                <span className="block text-sm font-medium text-ink-950">{BLOG_AUTHOR.name}</span>
                <span className="block text-xs text-ink-400">
                  {formatDate(post.date)} · {readTime} min read
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={shareX}
                target="_blank"
                rel="noreferrer"
                aria-label="Share on X"
                className="flex size-8 items-center justify-center rounded-full bg-paper-soft text-ink-600 transition-colors hover:bg-blue-50 hover:text-primary-700"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-6.7L4.5 22H1.3l8.1-9.3L1 2h7.2l5 6.1L18.9 2Zm-1.2 18h1.7L7.4 4H5.6l12.1 16Z" />
                </svg>
              </a>
              <a
                href={shareLinkedIn}
                target="_blank"
                rel="noreferrer"
                aria-label="Share on LinkedIn"
                className="flex size-8 items-center justify-center rounded-full bg-paper-soft text-ink-600 transition-colors hover:bg-blue-50 hover:text-primary-700"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1c.53-1 1.83-2 3.77-2 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="altor-container grid grid-cols-1 gap-12 pb-12 lg:grid-cols-[minmax(0,680px)_minmax(0,1fr)]">
          {/* Article column */}
          <div className="min-w-0 max-w-2xl">
            <div className="flex flex-col gap-8">
              {post.sections.map((s, i) => (
                <div key={s.heading} id={`section-${i}`}>
                  <h2 className="text-lg font-semibold text-ink-950">{s.heading}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{s.body}</p>
                  {/* Pull-quote after the first section - a verbatim line
                      from the post, not a summary written for display. */}
                  {i === 0 && post.pullQuote && (
                    <blockquote className="mt-6 border-l-2 border-primary-600 py-1 pl-5">
                      <p className="text-lg leading-snug font-medium tracking-tight text-ink-950">
                        &ldquo;{post.pullQuote}&rdquo;
                      </p>
                    </blockquote>
                  )}
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="mt-10 flex flex-wrap gap-2">
              {[post.category, post.topic].filter(Boolean).map((tag) => (
                <span key={tag} className="rounded-full border border-line bg-paper-soft px-3 py-1 text-xs text-ink-600">
                  {tag}
                </span>
              ))}
            </div>

            {/* Author bio - richer than the top byline row (name + role
                only): a short real bio card, the "who wrote this" a reader
                reaches for after finishing, not before starting. */}
            <div className="mt-10 flex items-start gap-4 rounded-card border border-line bg-paper-soft p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-paper text-sm font-semibold text-ink-700">
                {BLOG_AUTHOR.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-950">{BLOG_AUTHOR.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">{BLOG_AUTHOR.bio}</p>
              </div>
            </div>

            {post.related && post.related.length > 0 && (
              <div className="mt-10 border-t border-line pt-10">
                <RelatedGrid
                  title="Related tools"
                  items={post.related.map((r) => ({ href: r.href, name: r.label }))}
                />
              </div>
            )}

            {relatedPosts.length > 0 && (
              <div className="mt-10 border-t border-line pt-10">
                <p className="mb-4 text-sm font-medium tracking-wide text-neutral-500 uppercase">What to read next</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {relatedPosts.map((p) => {
                    const spec = COVERS[p.slug] ?? fallbackCover(p.category);
                    const accent = categoryAccent(p.category);
                    const dotClass = accent === "experimentation" ? "bg-primary-600" : accent === "growth" ? "bg-neutral-600" : "bg-ink-700";
                    return (
                      <Link key={p.slug} href={`${base}/${p.slug}`} className="group flex flex-col gap-2.5">
                        <span className="block aspect-[16/10] overflow-hidden rounded-lg">
                          <BlogCover spec={spec} size="grid" />
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-ink-500">
                          <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${dotClass}`} />
                          {p.category}
                        </span>
                        <span className="text-[15px] leading-[1.3] font-semibold text-ink-950 transition-colors duration-[var(--duration-fast)] group-hover:text-primary-700">
                          {p.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* TOC rail - desktop only, visually; still real markup on mobile,
              just placed after the article by column order. */}
          {post.sections.length > 1 && (
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-xs font-semibold tracking-wide text-ink-400 uppercase">On this page</p>
                <div className="mt-3 flex flex-col gap-1 border-l-2 border-line pl-4">
                  {post.sections.map((s, i) => (
                    <a
                      key={s.heading}
                      href={`#section-${i}`}
                      className="py-1 text-sm text-ink-500 transition-colors hover:text-primary-700"
                    >
                      {s.heading}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Prev / next */}
        {(prev || next) && (
          <div className="altor-container pb-16">
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-card bg-line sm:grid-cols-2">
              {prev ? (
                <Link href={`${base}/${prev.slug}`} className="group bg-paper p-6 transition-colors hover:bg-paper-soft">
                  <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-ink-400 uppercase">
                    <ArrowLeft aria-hidden className="size-3" />
                    Previous
                  </p>
                  <p className="mt-2 text-base font-semibold text-ink-950 group-hover:text-primary-700">{prev.title}</p>
                </Link>
              ) : (
                <span className="bg-paper p-6" />
              )}
              {next ? (
                <Link href={`${base}/${next.slug}`} className="group bg-paper p-6 text-right transition-colors hover:bg-paper-soft">
                  <p className="flex items-center justify-end gap-1.5 text-xs font-semibold tracking-wide text-ink-400 uppercase">
                    Next
                    <ArrowRight aria-hidden className="size-3" />
                  </p>
                  <p className="mt-2 text-base font-semibold text-ink-950 group-hover:text-primary-700">{next.title}</p>
                </Link>
              ) : (
                <span className="bg-paper p-6" />
              )}
            </div>
          </div>
        )}
      </main>
      <SiteFooter t={c} lang={lang} />
    </>
  );
}
