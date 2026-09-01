import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { RelatedGrid } from "@/components/ui/RelatedGrid";
import { basePathFor } from "@/components/BlogPage";
import { copy, type Lang } from "@/lib/content";
import { getAllBlogPosts, BLOG_AUTHOR, type BlogPost } from "@/lib/blog";
import { breadcrumbList } from "@/lib/schema";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { SITE_URL } from "@/lib/seo";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/* Single post page.

   REWORKED this pass, per the same "Articler" Figma reference used for
   the blog index (see BlogPage.tsx/BlogLibrary.tsx's own comments): a
   byline, an on-this-page TOC rail, a pull-quote pulled out of the
   body, a tags row, real share links, and prev/next - none of which the
   plain heading+paragraph shell before this pass had. As before, the
   reference's surface (its palette, its comment counts) isn't carried
   over; the mechanisms are rebuilt in this site's own ink/paper/primary
   tokens and real content:

   - The pull-quote is `post.pullQuote` - a verbatim sentence from the
     post's own sections (see blog-posts.ts), never new copy.
   - The byline is BLOG_AUTHOR (lib/blog.ts) - this is a one-author
     blog, so it's a shared constant instead of invented per-post data.
   - The TOC is computed directly from `post.sections[].heading` - no
     new content, just the post's own structure surfaced as navigation.
   - Prev/next are the real adjacent posts in blog-posts.ts's own array
     order - never invented titles. */
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

  const pageUrl = `${SITE_URL}${base}/${post.slug}`;
  const shareX = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(pageUrl)}`;
  const shareLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;

  return (
    <>
      <JsonLdScript data={breadcrumb} />
      <SiteHeader t={c} anchorBase={home} langHref={base} />
      <main>
        {/* pt-40 -> pt-24: SiteHeader is now a real, solid header, not an
            absolute overlay - see its own comment in Site.tsx. */}
        <section data-tone="dark" className="relative isolate overflow-hidden bg-ink-950 pt-24 pb-14">
          <div className="altor-container max-w-2xl">
            <Link href={base} className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white">
              <ArrowLeft aria-hidden className="size-3.5" />
              Blog
            </Link>
            <p className="mt-4 text-xs text-white/50">
              {formatDate(post.date)}
              {post.category && <> · {post.category}</>}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{post.title}</h1>
            <p className="mt-3 text-base leading-relaxed text-white/70">{post.excerpt}</p>

            {/* Byline */}
            <div className="mt-6 flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/80">
                {BLOG_AUTHOR.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </span>
              <span>
                <span className="block text-sm font-medium text-white">{BLOG_AUTHOR.name}</span>
                <span className="block text-xs text-white/50">{BLOG_AUTHOR.role}</span>
              </span>
            </div>
          </div>
        </section>

        <div className="altor-container grid grid-cols-1 gap-12 py-12 lg:grid-cols-[minmax(0,680px)_minmax(0,1fr)]">
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

            {/* Share */}
            <div className="mt-6 flex items-center gap-3 border-t border-line pt-6">
              <span className="text-xs text-ink-400">Share</span>
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

            {post.related && post.related.length > 0 && (
              <div className="mt-10 border-t border-line pt-10">
                <RelatedGrid
                  title="Related tools"
                  items={post.related.map((r) => ({ href: r.href, name: r.label }))}
                />
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
