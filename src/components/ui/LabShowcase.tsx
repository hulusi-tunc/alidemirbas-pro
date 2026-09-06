"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { LabProjectIcon, labAccent } from "@/components/ui/LabProjectIdentity";
import { clsx } from "@/lib/clsx";

/* The Lab hero's product window, with a tab for each of the six projects.

   THE MECHANISM IS THE ONE THE PREVIOUS ROUND SHIPPED (LabProductShot,
   2026-09-05, from a reference Hulusi supplied): a light, frosted window
   carrying the product, heavy soft shadow, its lower edge cut by the fold
   so the page seems to continue into it. What this round adds is the rail
   above it - Hulusi: "in the row above the mockup I wanna put tab
   structure buttons and we gonna show each representative mockup for each
   lab project" - so one window now shows all six, one at a time.

   WHAT IS IN THE WINDOW IS REAL, and none of it is built here. The panels
   arrive as server-rendered ReactNodes (LabPanels.tsx): the builder's
   pattern blueprints, the library's largest graph, a real playbook record,
   the real template table, the real change rows, the real category counts.
   This component owns exactly one piece of state - which tab is open - and
   ships no data of its own, so the 284-journey library never reaches the
   client bundle through it.

   THE FRAME IS FIXED. The window body is clipped to one height at every
   breakpoint, so switching tabs never changes the hero's height and never
   moves the page below it. A panel that runs longer is cut by the frame
   and then by the fold - the reference's own "board half over the
   horizon" effect, and the reason nothing here is scaled to fit (Hulusi:
   "cut a bit from below, not squeezed").

   ALL SIX PANELS ARE IN THE HTML. Inactive ones carry `hidden`, so the
   server render has every project's material, a no-JS reader sees the
   first, and a switch is a display flip plus a 250ms settle rather than a
   fetch. The rail is a real tablist: roving focus, arrow keys, Home/End. */

export type ShowcaseItem = {
  slug: string;
  /** The tab's label and the window's title - the project's short name. */
  label: string;
  /** The full project name, the rail's heading. */
  name: string;
  /** The project's real figure ("284 journeys · 26 categories"). */
  fact: string;
  tagline: string;
  /** The project's real taxonomy tags ("Lifecycle", "CRM", ...). */
  tags: readonly string[];
  href: string;
  cta: string;
  /** Server-rendered: the real material shown in the window. */
  panel: ReactNode;
};

export function LabShowcase({ items, tablistLabel }: { items: ShowcaseItem[]; tablistLabel: string }) {
  const [activeSlug, setActiveSlug] = useState(items[0]?.slug);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = items.find((item) => item.slug === activeSlug) ?? items[0];
  if (!active) return null;
  const accent = labAccent(active.slug);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = items.findIndex((item) => item.slug === active.slug);
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setActiveSlug(items[next].slug);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="relative mx-auto mt-10 max-w-5xl px-4 sm:px-0 md:mt-12">
      {/* THE RAIL. A frosted segmented control on the sky, the same frost
          as the window below so the two read as one instrument. The open
          tab is the ink plate; the others show their project's glyph in
          its own hue, so the rail is also the legend for the sections
          below. Below ~1024px the rail scrolls sideways under its own
          hidden scrollbar rather than wrapping into two ragged rows. */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div
          role="tablist"
          aria-label={tablistLabel}
          onKeyDown={onKeyDown}
          className="mx-auto flex w-max items-center gap-1 rounded-lg bg-white/60 p-1 ring-1 ring-white/80 backdrop-blur-md"
        >
          {items.map((item, i) => {
            const selected = item.slug === active.slug;
            return (
              <button
                key={item.slug}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${item.slug}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${item.slug}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveSlug(item.slug)}
                className={clsx(
                  "flex h-10 shrink-0 items-center gap-2 rounded-md px-3.5 text-[13.5px] font-medium whitespace-nowrap transition-colors duration-[var(--duration-fast)]",
                  selected ? "bg-ink-950 text-white shadow-sm" : "text-ink-700 hover:bg-white/80 hover:text-ink-950",
                )}
              >
                <LabProjectIcon slug={item.slug} className={clsx("size-4", selected ? "text-white" : labAccent(item.slug).ink)} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* THE WINDOW. Negative bottom margin pulls the section's edge up
          over it; the section's overflow-hidden does the cutting. */}
      <div className="mt-5 -mb-6 sm:mt-6 sm:-mb-10 md:-mb-16">
        <div className="rounded-[26px] bg-white/70 p-2 shadow-[0_40px_90px_-30px_rgb(30_50_110/0.35),0_16px_40px_-20px_rgb(30_50_110/0.25)] ring-1 ring-white/80 backdrop-blur-md sm:p-2.5">
          <div className="overflow-hidden rounded-[18px] bg-paper">
            {/* Window chrome: which project, and its one real figure. */}
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span aria-hidden className="flex shrink-0 items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-ink-200" />
                  <span className="size-2.5 rounded-full bg-ink-200" />
                  <span className="size-2.5 rounded-full bg-ink-200" />
                </span>
                <span className="truncate text-[13px] font-medium text-ink-500">{active.name}</span>
              </div>
              <span className="truncate text-[13px] font-medium text-ink-950 tabular-nums">{active.fact}</span>
            </div>

            <div className="grid md:grid-cols-[minmax(0,1fr)_240px]">
              <div className="relative h-[22rem] overflow-hidden md:h-[26rem]">
                {items.map((item) => (
                  <div
                    key={item.slug}
                    role="tabpanel"
                    id={`${baseId}-panel-${item.slug}`}
                    aria-labelledby={`${baseId}-tab-${item.slug}`}
                    hidden={item.slug !== active.slug}
                    className="lab-panel-in h-full"
                  >
                    {item.panel}
                  </div>
                ))}
              </div>

              {/* Inspector rail: the project's mark, its one-line claim, its
                  real tags and its real action. The full name is the window
                  title above, so nothing here repeats it. Hidden below md,
                  where the panel needs the whole width; the sections below
                  carry the same buttons at every width. */}
              <aside className="hidden border-l border-line px-5 py-5 md:flex md:flex-col">
                <span className={clsx("flex items-center gap-2 text-[12px] font-medium", accent.ink)}>
                  <span className={clsx("grid size-6 shrink-0 place-items-center rounded-md", accent.tile)}>
                    <LabProjectIcon slug={active.slug} className="size-3.5" />
                  </span>
                  {active.label}
                </span>
                <span className="mt-3 text-[15px] leading-snug font-semibold text-balance text-ink-950">{active.tagline}</span>
                <span className="mt-3 flex flex-wrap gap-1.5">
                  {active.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-paper-soft px-2 py-0.5 text-[11.5px] font-medium text-ink-600">
                      {tag}
                    </span>
                  ))}
                </span>
                <div className="mt-6">
                  <ButtonLink href={active.href} variant="primary" size="sm">
                    {active.cta}
                    <ArrowRight aria-hidden className="size-3.5" />
                  </ButtonLink>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
