import Link from "next/link";

import JourneyTopologyPreview from "@/components/ui/JourneyTopologyPreview";
import type { JourneyPreview } from "@/lib/journey-preview";

/* One Journey Library entry. A plain presentational component (no hooks, no
   "use client") so it renders identically from both the interactive
   JourneyBrowser (client-side, filtered) and LabPage's static Suspense
   fallback (server-rendered, unfiltered) - see LabPage.tsx for why that
   fallback exists.

   A ROW, not a card. The A/B library settled the list grammar for this
   site - id in a mono gutter, title as the loudest text, hairline rules
   between entries - and 281 journeys are scanned faster down one column
   than across a three-column grid, where the eye has to serpentine and
   every title competes with two neighbours. The topology thumbnail, the
   one thing the old card design got right, survives the conversion: it
   moves to a fixed slot on the row's right edge, still on its tinted
   band, still the journey's visual fingerprint - just no longer the
   thing that sets the page's rhythm.

   Same zones, same order of importance as the approved card: id, name,
   Goal as primary semantic metadata, muted category + node count, then
   channels in the mono register. No description, no chips, no badges. */

export default function JourneyRowCard({
  href,
  id,
  name,
  goalLabel,
  categoryTitle,
  nodeCount,
  nodesLabel,
  channelLabels,
  preview,
}: {
  href: string;
  id: string;
  name: string;
  goalLabel: string;
  categoryTitle: string;
  nodeCount: number;
  nodesLabel: string;
  /** The journey's execution channels, localised and ordered by the server.
      Empty for the journeys that do no outbound communication, and those
      render nothing rather than a placeholder - a blank line would read as
      missing data when it is actually a statement. */
  channelLabels: readonly string[];
  preview: JourneyPreview;
}) {
  return (
    <Link
      href={href}
      /* content-visibility lets the browser skip layout and paint for the
         rows that are off screen, which is what keeps 281 topology SVGs on
         one page cheap; contain-intrinsic-size gives it a height to reserve
         for them meanwhile, so the scrollbar stays honest. */
      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-line py-4 transition-colors [content-visibility:auto] [contain-intrinsic-size:auto_116px] last:border-b hover:bg-paper-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:grid-cols-[5rem_minmax(0,1fr)_10.5rem] sm:gap-6"
    >
      <span className="hidden self-start pt-0.5 font-mono text-xs text-ink-400 tabular-nums sm:block">
        {id}
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[10px] tracking-[0.08em] text-ink-400 tabular-nums sm:hidden">{id}</p>
        <p className="mt-0.5 text-[15px] leading-snug font-medium tracking-tight text-ink-950 sm:mt-0">
          {name}
        </p>
        <p className="mt-0.5 text-[13px] leading-snug text-ink-600">{goalLabel}</p>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 text-xs text-ink-400">
          <span>{categoryTitle}</span>
          <span aria-hidden className="text-ink-200">
            ·
          </span>
          <span className="tabular-nums">
            {nodeCount} {nodesLabel}
          </span>
        </p>
        {channelLabels.length > 0 ? (
          <p className="mt-1 font-mono text-[10px] tracking-[0.06em] text-ink-400 uppercase">
            {channelLabels.join(" · ")}
          </p>
        ) : null}
      </div>
      <div className="h-[64px] w-[92px] shrink-0 self-center rounded-md border border-line-soft bg-paper-soft px-2 py-1.5 sm:h-[76px] sm:w-full">
        <JourneyTopologyPreview preview={preview} />
      </div>
    </Link>
  );
}
