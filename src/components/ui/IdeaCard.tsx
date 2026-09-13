import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

/* One entry in a library gallery grid - the card both the journey library
   (JourneyIdeaCard) and the A/B test library (AbTestGallery) render, so
   the two galleries are one card with two data sources rather than two
   cards that drift apart. Extracted from JourneyIdeaCard (2026-09) with
   its classes unchanged; that file's design notes still apply and still
   live there.

   The card's shape: a header holding the title and a row of small
   badges, a clamped body, and a ruled-off footer with a quiet left label
   and a tabular right label. Every slot is real data the caller supplies;
   the card invents nothing and formats nothing.

   Restyled 2026-09-13 onto the house card (the homepage tiles' rounded
   ring, lift and shadow): sans throughout, badges as 12px pills, nothing
   under 12px, no mono - the type rules every Lab window keeps. */

export type IdeaCardBadge = {
  label: string;
  /** `accent` is the blue pill (a channel, a surface - the thing that
      reaches out); `muted` is the grey one (a state, a metric - a fact
      about the entry). The two must not look alike. */
  tone: "accent" | "muted";
  /** Optional hover/assistive expansion of a terse label. */
  title?: string;
  /** A glyph before the label (a channel's, a state's), so the badge can
      be read at a glance. */
  icon?: ReactNode;
};

export default function IdeaCard({
  href,
  icon,
  title,
  badges,
  body,
  footLeft,
  footRight,
}: {
  href: string;
  /** A glyph for what the entry belongs to (its category), in a tile
      before the title - the card's visual anchor. */
  icon?: ReactNode;
  title: string;
  badges: readonly IdeaCardBadge[];
  body: string;
  footLeft: string;
  footRight: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-2xl bg-paper ring-1 ring-ink-950/[0.06] transition-[box-shadow,transform] duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-32px_rgb(10_16_32/0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
    >
      <div className="flex items-start gap-3.5 px-5 pt-5">
        {icon ? (
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-paper-soft text-ink-700 [&>svg]:size-4">{icon}</span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-base leading-snug font-semibold text-ink-950">{title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {badges.map((b) => (
              <span
                key={`${b.tone}:${b.label}`}
                title={b.title}
                className={
                  b.tone === "accent"
                    ? "inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700 [&>svg]:size-3.5"
                    : "inline-flex items-center gap-1 rounded-full bg-paper-soft px-2 py-0.5 text-xs font-medium text-ink-600 [&>svg]:size-3.5"
                }
              >
                {b.icon}
                {b.label}
              </span>
            ))}
          </div>
        </div>
        <ArrowRight
          aria-hidden
          className="mt-1 size-4 shrink-0 text-ink-400 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5 group-hover:text-ink-950"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pt-3 pb-5">
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-600">{body}</p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-soft pt-3">
          <span className="truncate text-xs text-ink-500">{footLeft}</span>
          <span className="shrink-0 text-xs text-ink-500 tabular-nums">{footRight}</span>
        </div>
      </div>
    </Link>
  );
}
