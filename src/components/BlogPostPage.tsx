import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { RelatedGrid } from "@/components/ui/RelatedGrid";
import { basePathFor } from "@/components/BlogPage";
import { copy, type Lang } from "@/lib/content";
import type { BlogPost } from "@/lib/blog";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/* Single post page. Same dark-hero-then-content pattern every other
   detail page on this site uses (Calculator, Skill, Journey) - sections
   are plain heading+body, same shape CalculatorContent already renders
   Phase 4 content with, and related links reuse RelatedGrid rather than
   a bespoke list. */
export default function BlogPostPage({ lang, post }: { lang: Lang; post: BlogPost }) {
  const c = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const base = basePathFor(lang);

  return (
    <>
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
          </div>
        </section>

        <div className="altor-container max-w-2xl py-12">
          <div className="flex flex-col gap-8">
            {post.sections.map((s) => (
              <div key={s.heading}>
                <h2 className="text-lg font-semibold text-ink-950">{s.heading}</h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{s.body}</p>
              </div>
            ))}
          </div>

          {post.related && post.related.length > 0 && (
            <div className="mt-12 border-t border-line pt-10">
              <RelatedGrid
                title="Related tools"
                items={post.related.map((r) => ({ href: r.href, name: r.label }))}
              />
            </div>
          )}
        </div>
      </main>
      <SiteFooter t={c} lang={lang} />
    </>
  );
}
