import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDown, Cog, Layers, Send } from "lucide-react";

import { clsx } from "@/lib/clsx";
import type { SurfaceKey } from "@/lib/canonical-view";

/* THE LIBRARY CHROME (2026-09-13, Hulusi: "now improve this page", on
   /lab/customer-journeys). The journey library pages were the last surface
   still drawn in the old Lab idiom: square corners, raw blue and neutral
   greys, mono micro-labels, uppercase tracking. This file holds the pieces
   the gallery and its prerender fallback share, on the site's own tokens:
   the surface switch as the same pill rail the /lab hero uses, the search
   and select fields in the rounded, ringed shape of the hero tiles, and
   the category heading. Words are sans, numbers are tabular, nothing under
   12px, nothing uppercase - the rules every Lab window already keeps. */

const SURFACE_ICON: Record<SurfaceKey, ReactNode> = {
  "customer-journeys": <Send aria-hidden className="size-4" />,
  "lifecycle-states": <Layers aria-hidden className="size-4" />,
  "runtime-mechanisms": <Cog aria-hidden className="size-4" />,
};

/** The three public surfaces are routes, so this is navigation, not a
    filter: the current one is a static pill, the others are links. */
export function SurfaceTabs({
  links,
  active,
  label,
}: {
  links: readonly { key: SurfaceKey; href: string; label: string }[];
  active: SurfaceKey;
  label: string;
}) {
  return (
    <nav aria-label={label} className="inline-flex max-w-full flex-wrap gap-1 rounded-full bg-paper-soft p-1">
      {links.map((l) =>
        l.key === active ? (
          <span
            key={l.key}
            aria-current="page"
            className="flex items-center gap-2 rounded-full bg-ink-950 px-3.5 py-1.5 text-sm font-medium text-paper"
          >
            {SURFACE_ICON[l.key]}
            {l.label}
          </span>
        ) : (
          <Link
            key={l.key}
            href={l.href}
            className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium text-ink-700 transition-colors duration-[var(--duration-fast)] hover:bg-paper hover:text-ink-950"
          >
            {SURFACE_ICON[l.key]}
            {l.label}
          </Link>
        ),
      )}
    </nav>
  );
}

/** The search field's shell; the live input (JourneyGallery) and the inert
    prerender copy (LabPage's fallback) both sit inside it. */
export const SEARCH_SHELL =
  "flex h-11 items-center gap-2.5 rounded-xl bg-paper px-4 text-sm text-ink-900 ring-1 ring-ink-950/[0.08] transition-shadow duration-[var(--duration-fast)] focus-within:ring-2 focus-within:ring-primary-400";

export const SELECT_CLASS =
  "h-11 w-full appearance-none rounded-xl bg-paper pr-10 pl-4 text-sm font-medium text-ink-800 ring-1 ring-ink-950/[0.08] outline-none transition-shadow duration-[var(--duration-fast)] focus:ring-2 focus:ring-primary-400 sm:w-auto";

/** A native select with the site's chevron drawn over it. */
export function SelectShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <label className={clsx("relative block", className)}>
      {children}
      <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-500" />
    </label>
  );
}

/** A category section's heading: the category's own id prefix as the
    marker (real addressable data - every journey in it is ACQ-nn, RET-nn),
    the title on the h3 step, the count in tabular figures, the category's
    purpose sentence under it. */
export function CategoryHeader({
  code,
  title,
  count,
  countLabel,
  purpose,
}: {
  code: string;
  title: string;
  count: number;
  countLabel: string;
  purpose: string;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span
        aria-hidden
        className="mt-1 grid h-8 min-w-8 shrink-0 place-items-center rounded-lg bg-paper-soft px-2 text-xs font-semibold text-ink-700"
      >
        {code}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-h3 text-ink-950">{title}</h2>
          <span className="shrink-0 text-sm text-ink-500 tabular-nums">
            {count} {countLabel}
          </span>
        </div>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-600">{purpose}</p>
      </div>
    </div>
  );
}
