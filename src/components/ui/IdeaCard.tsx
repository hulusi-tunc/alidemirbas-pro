import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* One entry in a library gallery grid - the card both the journey library
   (JourneyIdeaCard) and the A/B test library (AbTestGallery) render, so
   the two galleries are one card with two data sources rather than two
   cards that drift apart. Extracted from JourneyIdeaCard (2026-09) with
   its classes unchanged; that file's design notes still apply and still
   live there.

   The card's shape: a ruled-off header holding the title and a row of
   small badges, a clamped body, and a footer with a quiet left label and
   a mono right label. Every slot is real data the caller supplies; the
   card invents nothing and formats nothing. */

export type IdeaCardBadge = {
  label: string;
  /** `accent` is the blue pill (a channel, a surface - the thing that
      reaches out); `muted` is the grey one (a state, a metric - a fact
      about the entry). The two must not look alike. */
  tone: "accent" | "muted";
  /** Optional hover/assistive expansion of a terse label. */
  title?: string;
};

export default function IdeaCard({
  href,
  title,
  badges,
  body,
  footLeft,
  footRight,
}: {
  href: string;
  title: string;
  badges: readonly IdeaCardBadge[];
  body: string;
  footLeft: string;
  footRight: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-lg border border-line bg-paper transition-colors hover:border-neutral-400 hover:bg-paper-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <p className="text-[14.5px] leading-snug font-semibold tracking-tight text-ink-950">{title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {badges.map((b) => (
              <span
                key={`${b.tone}:${b.label}`}
                title={b.title}
                className={
                  b.tone === "accent"
                    ? "rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700"
                    : "rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600"
                }
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>
        <ArrowRight
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-ink-300 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5 group-hover:text-ink-600"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 py-3">
        <p className="line-clamp-3 text-[13px] leading-relaxed text-ink-600">{body}</p>
        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="truncate text-[11px] text-ink-400">{footLeft}</span>
          <span className="shrink-0 font-mono text-[10px] text-ink-400 tabular-nums">{footRight}</span>
        </div>
      </div>
    </Link>
  );
}
