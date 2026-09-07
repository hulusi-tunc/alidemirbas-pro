"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { clsx } from "@/lib/clsx";

/* Two scroll behaviours for the Lab body, each owned by exactly one
   section (LabIndexPage.tsx) - the sections are meant to differ, so no
   behaviour repeats. Both receive strings and server-rendered nodes only;
   no data is shipped. Neither does anything under reduced motion beyond
   its resting state. */

/** SpyList - the three views of the builder as an icon stepper inside the
    sticky statement. Watches the frames by id and lights the step nearest
    the middle of the viewport, so the column says which view is passing
    on the right. Function: orientation in a long column. The steps are
    in-page links, so the list is also the fast way to each frame. */
export function SpyList({
  items,
  activeTile,
  className,
}: {
  items: { id: string; label: string; icon: ReactNode }[];
  /** The lit step's tile, in the rail's own hue, e.g. "bg-violet-600 text-white". */
  activeTile: string;
  className?: string;
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const ids = items.map((item) => item.id).join(",");

  useEffect(() => {
    const targets = ids
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      let best = targets[0];
      let bestDistance = Infinity;
      for (const target of targets) {
        const rect = target.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - middle);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = target;
        }
      }
      setActive(best.id);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ids]);

  return (
    <ol className={clsx("m-0 list-none p-0", className)}>
      {items.map((item, i) => {
        const on = item.id === active;
        const last = i === items.length - 1;
        return (
          <li key={item.id} className="relative pb-2.5 last:pb-0">
            {!last && <span aria-hidden className="absolute top-8 bottom-0 left-4 w-px bg-line-strong" />}
            <a href={`#${item.id}`} aria-current={on ? "true" : undefined} className="flex items-center gap-3">
              <span
                className={clsx(
                  "relative grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-[var(--duration-base)] [&>svg]:size-4",
                  on ? activeTile : "bg-paper-soft text-ink-500",
                )}
              >
                {item.icon}
              </span>
              <span className={clsx("text-[13.5px] transition-colors duration-[var(--duration-base)]", on ? "font-medium text-ink-950" : "text-ink-500")}>
                {item.label}
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/** ScrollRail - a row wider than the page that slides sideways as the
    section passes through the viewport, so scrolling down reads the row
    left to right (Numerspace's 13 categories). Progress is 0 once the
    rail is fully in view at the bottom of the viewport - nothing has left
    yet - and 1 when its top reaches the header. Only with a fine
    pointer at lg and up; on touch, or under reduced motion, the same row
    is a plain swipeable rail - the site's mobile chip pattern - and the
    JavaScript hands the overflow back to the browser. */
export function ScrollRail({ children, className }: { children: ReactNode; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = outer.current;
    const row = inner.current;
    if (!track || !row) return;
    const drives = window.matchMedia("(min-width: 64rem) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const measure = () => {
      frame = 0;
      if (!drives.matches || reduced.matches) {
        track.style.overflowX = "";
        row.style.transform = "";
        return;
      }
      track.style.overflowX = "hidden";
      const rect = track.getBoundingClientRect();
      const viewport = window.innerHeight;
      const overflow = Math.max(row.scrollWidth - track.clientWidth, 0);
      const header = 64; // the sticky SiteHeader's height
      const travel = Math.max(viewport - header - rect.height, 1);
      const progress = Math.min(1, Math.max(0, (viewport - rect.bottom) / travel));
      row.style.transform = `translate3d(${(-progress * overflow).toFixed(1)}px, 0, 0)`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    drives.addEventListener("change", schedule);
    reduced.addEventListener("change", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      drives.removeEventListener("change", schedule);
      reduced.removeEventListener("change", schedule);
      track.style.overflowX = "";
      row.style.transform = "";
    };
  }, []);

  return (
    <div ref={outer} className={clsx("no-scrollbar overflow-x-auto", className)}>
      <div ref={inner} className="flex w-max items-start gap-3 will-change-transform">
        {children}
      </div>
    </div>
  );
}
