import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BlogCover, COVERS, categoryAccent, type CoverSpec } from "./BlogCover";
import { HoverLift } from "./HoverLift";
import type { BlogPost } from "@/lib/blog";

/* Editorial article card — REFINEMENT ROUND. Replaces the old pastel
   gradient placeholder rectangle (read as a missing image) with the
   BlogCover system, drops the grid/list variant split (list view is
   gone site-wide per this round's brief), lightens the card shell
   (rounded-card + a hairline border, not a ring + shadow-sm "floating
   SaaS card"), gives titles more size/room, and swaps the grey rounded
   category pill for a small dot + text indicator matching the cover's
   own accent - the same colour language, not a second badge system.

   `featured` renders the same card content at a larger scale for the
   single newest-post slot on the default (unfiltered) view - see
   BlogLibrary.tsx for where that slot is chosen. It is still one
   component, not a forked "FeaturedCard": the brief's whole point is one
   system with real hierarchy, not two unrelated card designs. */

function fallbackCover(category: string): CoverSpec {
  // Any post without a hand-authored entry in COVERS (a future post,
  // before someone writes its own cover spec) still gets a real,
  // non-empty cover rather than a blank rectangle - the category name
  // itself, in that category's real accent, with no invented diagram.
  return { lines: [category.split(" ")[0].toUpperCase()], tag: category, accent: categoryAccent(category), diagram: "ratio" };
}

function formatDate(iso: string, lang: "en" | "tr") {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function BlogCard({
  post,
  href,
  lang,
  featured = false,
}: {
  post: BlogPost;
  href: string;
  lang: "en" | "tr";
  featured?: boolean;
}) {
  const spec = COVERS[post.slug] ?? fallbackCover(post.category);
  const accent = categoryAccent(post.category);
  const dotClass =
    accent === "experimentation" ? "bg-primary-600" : accent === "growth" ? "bg-neutral-600" : "bg-ink-700";

  return (
    <HoverLift distance={2}>
      <Link
        href={href}
        className={`group flex h-full overflow-hidden rounded-card border border-line-soft transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:border-line-strong ${
          featured ? "flex-col md:flex-row" : "flex-col"
        }`}
      >
        <span
          className={`block shrink-0 overflow-hidden transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-smooth)] group-hover:scale-[1.01] ${
            featured ? "aspect-[16/10] md:aspect-auto md:w-[46%]" : "aspect-[16/10]"
          }`}
        >
          <BlogCover spec={spec} size={featured ? "featured" : "grid"} />
        </span>
        <span className={`flex flex-1 flex-col gap-2 ${featured ? "p-6 sm:p-8" : "p-5"}`}>
          <span className="flex items-center gap-1.5 text-xs text-ink-500">
            <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${dotClass}`} />
            {post.category}
          </span>
          <span
            className={`font-semibold tracking-tight text-ink-950 transition-colors duration-[var(--duration-fast)] group-hover:text-primary-700 ${
              featured ? "text-2xl leading-[1.15] sm:text-[1.75rem]" : "text-lg leading-[1.2]"
            }`}
          >
            {post.title}
          </span>
          {featured && post.excerpt && (
            <span className="line-clamp-2 max-w-[52ch] text-[15px] leading-relaxed text-ink-950/65">
              {post.excerpt}
            </span>
          )}
          <span className="mt-auto flex items-center gap-3 pt-2 text-xs text-ink-400">
            <span>{formatDate(post.date, lang)}</span>
            {featured && (
              <span className="ml-auto flex items-center gap-1 font-medium text-ink-950 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5">
                {lang === "tr" ? "Yazıyı oku" : "Read article"}
                <ArrowRight aria-hidden className="size-3.5" />
              </span>
            )}
          </span>
        </span>
      </Link>
    </HoverLift>
  );
}
