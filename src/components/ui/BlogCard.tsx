import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BlogCover, COVERS, categoryAccent, type CoverSpec } from "./BlogCover";
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

  /* No lift and no stroke: a soft filled card that answers the pointer
     with a colour change only (the translate-and-shadow hover was reviewed
     as cheap and came off site-wide in the 2026-08-30 pass), and no scale
     on the cover either - a cover that grows inside a clipped box is the
     same effect wearing a different name. */
  return (
      <Link
        href={href}
        className={`group flex h-full overflow-hidden rounded-card bg-paper-soft transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:bg-blue-50 ${
          featured ? "flex-col md:flex-row md:items-stretch" : "flex-col"
        }`}
      >
        {/* THE FEATURED COVER KEEPS THE GRID'S OWN 16/10. It used to be
            `md:aspect-auto`, so its height was dictated by the text column
            beside it and the artwork was cropped to whatever that came to -
            the two things flagged in review, a top card that read as too
            thin and a cover that did not match the ratio of the cards under
            it. Holding the ratio and letting the card take its height from
            the cover fixes both at once. */}
        <span
          className={`block shrink-0 overflow-hidden ${
            featured ? "aspect-[16/10] md:w-[52%]" : "aspect-[16/10]"
          }`}
        >
          <BlogCover spec={spec} size={featured ? "featured" : "grid"} />
        </span>
        <span
          className={`flex flex-1 flex-col gap-2 ${featured ? "p-6 sm:p-8 md:justify-center" : "p-5"}`}
        >
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
          {/* Grid cards push the meta to the bottom so a row of them lines
              up; the featured card centres its text beside a tall cover, so
              pushing the meta down there would open a gap in the middle of
              the block instead of tidying anything. */}
          <span
            className={`flex items-center gap-3 text-xs text-ink-400 ${
              featured ? "mt-3" : "mt-auto pt-2"
            }`}
          >
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
  );
}
