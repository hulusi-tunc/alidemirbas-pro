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
   under 12px, no mono - the type rules every Lab window keeps.

   LONG TITLES (2026-09-20, Hulusi on the A/B library: "the texts are so
   long it looks ugly"). A journey's name is two words; an A/B scenario's
   title is a three-line question, and under it two pills that would not
   share a line. So the title is held to three balanced lines, and a
   caller whose facts are too long for pills hands them in as `meta` - one
   quiet line of glyph-and-label pairs, the first in full ink, the rest
   truncating - and asks for a three-line body so the card fills the
   height the grid gives it. `badges` stays for the short labels it was
   made for (a channel, a surface). */

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

export type IdeaCardMeta = { label: string; icon?: ReactNode; title?: string };

export default function IdeaCard({
  href,
  icon,
  iconTone = "bg-paper-soft text-ink-700",
  title,
  badges = [],
  meta,
  body,
  bodyLines = 2,
  footLeft,
  footRight,
}: {
  href: string;
  /** A glyph for what the entry belongs to (its category), in a tile
      before the title - the card's visual anchor. */
  icon?: ReactNode;
  /** The tile's ground and glyph colour - a category's own tint, or the
      neutral default. */
  iconTone?: string;
  title: string;
  badges?: readonly IdeaCardBadge[];
  /** Facts too long for pills, as one quiet line under the title. */
  meta?: readonly IdeaCardMeta[];
  body: string;
  /** How many lines the body may run before it clamps. */
  bodyLines?: 2 | 3;
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
          <span className={`grid size-9 shrink-0 place-items-center rounded-lg [&>svg]:size-4 ${iconTone}`}>{icon}</span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-3 text-base leading-snug font-semibold text-balance text-ink-950">{title}</p>
          {meta?.length ? (
            <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-ink-500 [&_svg]:size-3.5 [&_svg]:shrink-0">
              {meta.map((m, i) => (
                <span key={`${m.label}:${i}`} className="contents">
                  {i > 0 ? <span aria-hidden className="text-ink-300">·</span> : null}
                  <span title={m.title} className={i === 0 ? "flex shrink-0 items-center gap-1 text-ink-700" : "flex min-w-0 items-center gap-1 truncate"}>
                    {m.icon}
                    <span className={i === 0 ? "" : "truncate"}>{m.label}</span>
                  </span>
                </span>
              ))}
            </p>
          ) : null}
          <div className={badges.length ? "mt-2 flex flex-wrap items-center gap-1.5" : "hidden"}>
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
        <p className={bodyLines === 3 ? "line-clamp-3 text-sm leading-relaxed text-ink-600" : "line-clamp-2 text-sm leading-relaxed text-ink-600"}>{body}</p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-soft pt-3">
          <span className="truncate text-xs text-ink-500">{footLeft}</span>
          <span className="shrink-0 text-xs text-ink-500 tabular-nums">{footRight}</span>
        </div>
      </div>
    </Link>
  );
}
