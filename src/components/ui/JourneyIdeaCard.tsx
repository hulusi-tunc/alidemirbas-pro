import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* A compact grid card, as opposed to JourneyRowCard's full-width row.

   MECHANISM SOURCE: Klaviyo's "Flows / Browse Ideas" screen (reviewed
   2026-09) - its grouped-by-outcome sections of small idea cards (title +
   variant subtitle + one-line description + a footer row of channel/
   platform badges), used for a curated subset (their flow templates) rather
   than a scan-everything archive. That distinction is why this card exists
   ALONGSIDE JourneyRowCard rather than replacing it: JourneyRowCard's own
   comment settled "a row, not a card" for the full 281-journey library
   (a column of rows scans faster than a grid the eye has to serpentine) -
   still true there. This card is for /lab/journeys/communication
   specifically, a curated 87-journey subset grouped by Goal, where a grid
   of outcome-grouped cards is the more legible shape - same reasoning
   Klaviyo's own "Prevent lost sales" / "Nurture subscribers" sections use
   for their curated flow set, not their raw workflow list.

   SURFACE LEFT OUT: Klaviyo's per-flow platform icon (Shopify bag), its
   personalized "Recommended for you" carousel (this page has no user
   account to personalize for - would be fabricated), and its own short
   marketing flow names (this site's journeys keep their real canonical
   name, however long, rather than a shorter name invented for the card).
   Channel badges are plain text pills, not icons - this codebase has no
   established icon-per-channel mapping anywhere else (JourneyRowCard's own
   channel line is already plain mono text), and inventing one here risked
   a set of icons nobody could verify meant what they seemed to. */
export default function JourneyIdeaCard({
  href,
  id,
  name,
  categoryTitle,
  purpose,
  nodeCount,
  nodesLabel,
  channelLabels,
}: {
  href: string;
  id: string;
  name: string;
  categoryTitle: string;
  purpose: string;
  nodeCount: number;
  nodesLabel: string;
  /** Empty for a journey with no message/human route - renders no badge row
      rather than a placeholder, same rule as JourneyRowCard. */
  channelLabels: readonly string[];
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col gap-2 rounded-lg border border-line bg-paper p-4 transition-colors hover:border-neutral-400 hover:bg-paper-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-[0.08em] text-ink-400 tabular-nums">{id}</p>
          <p className="mt-0.5 text-[14.5px] leading-snug font-medium tracking-tight text-ink-950">{name}</p>
        </div>
        <ArrowRight
          aria-hidden
          className="mt-1 size-4 shrink-0 text-ink-300 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5 group-hover:text-ink-600"
        />
      </div>
      <p className="text-xs text-ink-500">{categoryTitle}</p>
      <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-600">{purpose}</p>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
        {channelLabels.map((label) => (
          <span key={label} className="rounded-full bg-paper-soft px-2 py-0.5 text-[10px] font-medium text-ink-600">
            {label}
          </span>
        ))}
        <span className="ml-auto shrink-0 font-mono text-[10px] text-ink-400 tabular-nums">
          {nodeCount} {nodesLabel}
        </span>
      </div>
    </Link>
  );
}
