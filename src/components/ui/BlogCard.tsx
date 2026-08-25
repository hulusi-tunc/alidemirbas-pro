import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { HoverLift } from "./HoverLift";

/* Reusable editorial card - visual area, date, title, category/topic.
   The visual is a small deterministic geometric pattern derived from the
   post's own category string (picks among this site's existing token
   colors), not a stock photo or an invented cover-image asset - there is
   no cover-image pipeline yet, and this reads as an intentional
   treatment rather than a missing image. `list` renders a flatter row
   for the List view; `grid` (default) renders the full card.

   PORTRAIT PILOT: unlike Contact's form surface (a single, non-repeating
   content zone, de-carded this round), a grid of repeating article
   previews is the same shape as Portrait's own real confirmed pattern for
   repeating tiles - `rounded-2xl` + `ring-1 ring-black/6` + a restrained
   shadow, applied at rest (PORTRAIT-DESIGN-SOURCE-AUDIT.md §6/§7). The
   `grid` variant below gets that treatment (`rounded-card`, `ring-line-
   soft`, `shadow-sm`); the `list` variant stays a flatter row with a
   hairline divider, now on the LOCKED neutral-alpha token instead of the
   old opaque one. */

const PATTERNS = [
  "bg-[radial-gradient(circle_at_30%_30%,var(--color-primary-200)_0%,transparent_55%)] bg-primary-50",
  "bg-[radial-gradient(circle_at_70%_30%,var(--color-sand-200)_0%,transparent_55%)] bg-sand-50",
  "bg-[linear-gradient(135deg,var(--color-ink-100)_0%,transparent_60%)] bg-paper-soft",
];

function patternFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PATTERNS[h % PATTERNS.length];
}

function formatDate(iso: string, lang: "en" | "tr") {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function BlogCard({
  post,
  href,
  lang,
  variant = "grid",
}: {
  post: BlogPost;
  href: string;
  lang: "en" | "tr";
  variant?: "grid" | "list";
}) {
  if (variant === "list") {
    return (
      <Link
        href={href}
        className="flex items-center gap-4 border-b border-line-soft py-4 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:border-ink-300"
      >
        <span aria-hidden className={`size-14 shrink-0 rounded-card ${patternFor(post.category)}`} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-ink-950">{post.title}</span>
          <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-950/65">
            <span>{formatDate(post.date, lang)}</span>
            {post.category && (
              <>
                <span aria-hidden>·</span>
                <span>{post.category}</span>
              </>
            )}
          </span>
        </span>
      </Link>
    );
  }

  return (
    <HoverLift distance={3}>
      <Link
        href={href}
        className="group flex h-full flex-col overflow-hidden rounded-card bg-paper ring-1 ring-line-soft shadow-sm transition-shadow duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:shadow-[var(--shadow-card-hover)]"
      >
        {/* POLISH ROUND: the decorative media zone was over-dominant
            relative to the title/metadata below it, specifically at
            tablet's 2-column width. Card width/radius/border/shadow/text
            are all unchanged — only this zone's own height, via aspect
            ratio, and only from `sm:` up (mobile/1-column stays the
            original 16/10, not flagged as an issue). `sm:aspect-[2/1]`
            (16/8) is a 20% height reduction at tablet's 2-column width;
            `lg:aspect-video` (16/9, Tailwind's own built-in ratio) is a
            ~10% reduction at desktop's 3-column width - "a smaller
            reduction," per this round's own instruction, not the same
            cut applied twice. */}
        <span aria-hidden className={`aspect-[16/10] sm:aspect-[2/1] lg:aspect-video w-full ${patternFor(post.category)}`} />
        <span className="flex flex-1 flex-col gap-2 p-5">
          <span className="text-xs text-ink-950/65">{formatDate(post.date, lang)}</span>
          <span className="text-base font-medium tracking-tight text-ink-950">{post.title}</span>
          {post.category && (
            <span className="mt-auto w-fit rounded-full bg-paper-soft px-2.5 py-1 text-xs text-ink-950/65 ring-1 ring-line-soft">
              {post.category}
            </span>
          )}
        </span>
      </Link>
    </HoverLift>
  );
}
