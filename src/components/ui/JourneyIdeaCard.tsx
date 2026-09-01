import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* One journey in the gallery grid, as opposed to JourneyRowCard's full-width
   row (still the shape the A/B library settled for scan-everything archives).

   MECHANISM SOURCE: Klaviyo's "Flows / Browse Ideas" screen (reviewed
   2026-09) - grouped sections of small template cards, each one title +
   secondary metadata + a clamped description + a footer badge, whole card
   clickable. What was deliberately NOT taken: its platform badges (Shopify
   and friends - this library integrates with nothing and a badge would be
   fabricated), its personalized "Recommended for you" carousel (no account
   to personalize for), its template variants ("Standard", "A/B Test",
   "Localized" - the canonical library counts those as one journey by rule),
   and any performance or conversion figure.

   THE CANONICAL NAME IS NOT ON THE CARD. It was, briefly: the card led with
   `shortName` and put `name` underneath in grey. The brief this round asks
   for the opposite and it is right - "Cancellation intent -> understand
   state -> save or proceed" under "Cancellation Save" is a second title
   competing with the first, in a grid where the eye is scanning titles. The
   canonical name still leads the DETAIL page, where there is room for it and
   a graph for it to describe. */

export default function JourneyIdeaCard({
  href,
  id,
  title,
  categoryTitle,
  purpose,
  nodeCount,
  nodesLabel,
  channelLabels,
  internalLabel,
}: {
  href: string;
  id: string;
  /** The journey's plain-language name (CanonicalJourney.shortName). */
  title: string;
  categoryTitle: string;
  purpose: string;
  nodeCount: number;
  nodesLabel: string;
  /** The journey's real execution channels, localised and ordered. Empty on
      an internal journey, which gets `internalLabel` instead - the two must
      not look alike, because one can reach a person and the other cannot. */
  channelLabels: readonly string[];
  internalLabel: string;
}) {
  const isInternal = channelLabels.length === 0;

  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-lg border border-line bg-paper transition-colors hover:border-neutral-400 hover:bg-paper-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      {/* Header, ruled off from the body - the reference's one structural
          move worth keeping: it gives every card in a row the same anchor
          line whatever the title wraps to. */}
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <p className="text-[14.5px] leading-snug font-semibold tracking-tight text-ink-950">{title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {isInternal ? (
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                {internalLabel}
              </span>
            ) : (
              channelLabels.map((label) => (
                <span key={label} className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                  {label}
                </span>
              ))
            )}
          </div>
        </div>
        <ArrowRight
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-ink-300 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5 group-hover:text-ink-600"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 py-3">
        <p className="line-clamp-3 text-[13px] leading-relaxed text-ink-600">{purpose}</p>
        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="truncate text-[11px] text-ink-400">{categoryTitle}</span>
          <span className="shrink-0 font-mono text-[10px] text-ink-400 tabular-nums">
            {id} · {nodeCount} {nodesLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
