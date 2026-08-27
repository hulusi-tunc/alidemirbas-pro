import Link from "next/link";

import JourneyTopologyPreview from "@/components/ui/JourneyTopologyPreview";
import type { JourneyPreview } from "@/lib/journey-preview";

/* One Journey Library card. A plain presentational component (no hooks, no
   "use client") so it renders identically from both the interactive
   JourneyBrowser (client-side, filtered) and LabPage's static Suspense
   fallback (server-rendered, unfiltered) - see LabPage.tsx for why that
   fallback exists.

   Five zones, fixed order, per the approved design: topology thumbnail on a
   tinted band at ~45-50% of card height, then the mono id, the title (the
   loudest text), the Goal as primary semantic metadata, and a muted
   category + node-count footer. No description, no chips, no badges - the
   thumbnail is what gives the card its identity, not decoration. */

export default function JourneyRowCard({
  href,
  id,
  name,
  goalLabel,
  categoryTitle,
  nodeCount,
  nodesLabel,
  preview,
}: {
  href: string;
  id: string;
  name: string;
  goalLabel: string;
  categoryTitle: string;
  nodeCount: number;
  nodesLabel: string;
  preview: JourneyPreview;
}) {
  return (
    <Link
      href={href}
      /* content-visibility lets the browser skip layout and paint for the
         cards that are off screen, which is what keeps 255 topology SVGs on
         one page cheap; contain-intrinsic-size gives it a height to reserve
         for them meanwhile, so the scrollbar stays honest. */
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-paper transition-[border-color,box-shadow] duration-150 [content-visibility:auto] [contain-intrinsic-size:auto_296px] hover:border-ink-300 hover:shadow-[0_2px_10px_-4px_rgba(15,23,42,0.14)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <div className="h-[132px] shrink-0 border-b border-line-soft bg-paper-soft px-4 py-3 sm:h-[148px]">
        <JourneyTopologyPreview preview={preview} />
      </div>
      <div className="flex flex-1 flex-col px-4 pt-3.5 pb-4">
        <p className="font-mono text-[11px] tracking-[0.08em] text-ink-400 tabular-nums">{id}</p>
        <p className="mt-1.5 text-[15px] leading-snug font-medium tracking-tight text-balance text-ink-950">
          {name}
        </p>
        <p className="mt-1.5 flex-1 text-[13px] leading-snug text-ink-600">{goalLabel}</p>
        <p className="mt-3 flex flex-wrap items-baseline gap-x-1.5 text-xs text-ink-400">
          <span>{categoryTitle}</span>
          <span aria-hidden className="text-ink-200">
            ·
          </span>
          <span className="tabular-nums">
            {nodeCount} {nodesLabel}
          </span>
        </p>
      </div>
    </Link>
  );
}
