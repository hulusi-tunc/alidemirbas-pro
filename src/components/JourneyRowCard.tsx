import Link from "next/link";

/* One row of the Journey Library list. A plain presentational component (no
   hooks, no "use client") so it can render identically from both the
   interactive JourneyBrowser (client-side, filtered) and LabPage's static
   Suspense fallback (server-rendered, unfiltered - see LabPage.tsx for why
   that fallback exists: useSearchParams forces its subtree to client-render
   during prerendering, so this is what keeps the full 255-journey list
   present in the initial HTML rather than only appearing after hydration). */

export default function JourneyRowCard({
  href,
  id,
  name,
  goalLabel,
  categoryTitle,
  competesIn,
  nodeCount,
  nodesLabel,
}: {
  href: string;
  id: string;
  name: string;
  goalLabel: string;
  categoryTitle: string;
  competesIn: string | null;
  nodeCount: number;
  nodesLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group grid w-full grid-cols-1 items-start gap-3 border-t border-line py-6 text-left transition-colors last:border-b hover:bg-paper-soft sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:gap-6"
    >
      <span className="font-mono text-xs text-neutral-500 tabular-nums">{id}</span>
      <div className="min-w-0">
        <p className="text-[15px] leading-snug font-medium tracking-tight text-ink-950">{name}</p>
        <p className="mt-0.5 text-sm">
          <span className="font-medium text-ink-700">{goalLabel}</span>
          <span className="text-ink-400"> · {categoryTitle}</span>
          {competesIn ? <span className="text-ink-400"> · {competesIn}</span> : null}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
        <span className="border border-line px-2 py-1 text-xs text-ink-500 tabular-nums">
          {nodeCount} {nodesLabel}
        </span>
      </div>
    </Link>
  );
}
