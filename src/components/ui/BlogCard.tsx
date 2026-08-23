import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { HoverLift } from "./HoverLift";

/* Reusable editorial card - visual area, date, title, category/topic.
   The visual is a small deterministic geometric pattern derived from the
   post's own category string (picks among this site's existing token
   colors), not a stock photo or an invented cover-image asset - there is
   no cover-image pipeline yet, and this reads as an intentional
   treatment rather than a missing image. `list` renders a flatter row
   for the List view; `grid` (default) renders the full card. */

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
        className="flex items-center gap-4 border-b border-line py-4 transition-colors hover:border-neutral-400"
      >
        <span aria-hidden className={`size-14 shrink-0 border border-line ${patternFor(post.category)}`} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-ink-950">{post.title}</span>
          <span className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500">
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
      <Link href={href} className="group flex h-full flex-col border border-line bg-paper transition-colors hover:border-neutral-400">
        <span aria-hidden className={`aspect-[16/10] w-full border-b border-line ${patternFor(post.category)}`} />
        <span className="flex flex-1 flex-col gap-2 p-5">
          <span className="text-xs text-neutral-500">{formatDate(post.date, lang)}</span>
          <span className="text-base font-medium tracking-tight text-ink-950">{post.title}</span>
          {post.category && (
            <span className="mt-auto w-fit rounded-md border border-line px-2 py-0.5 text-xs text-ink-700">
              {post.category}
            </span>
          )}
        </span>
      </Link>
    </HoverLift>
  );
}
