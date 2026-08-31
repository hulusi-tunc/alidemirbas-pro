"use client";

import { useEffect, useState } from "react";

/**
 * SCROLL TRACKING — a fixed rail that says where you are in the page and
 * lets you jump.
 *
 * IntersectionObserver, not a scroll listener: the browser tells us when a
 * section crosses the band we care about, so nothing runs per scroll
 * frame. `rootMargin` narrows the viewport to a horizontal strip across
 * its middle, which is what makes "the current section" mean the one under
 * the reader's eye rather than the one whose top edge happens to be
 * closest to zero.
 *
 * Hidden below `lg` - on a phone it would be a second navigation competing
 * with the content for a screen that has none to spare - and hidden
 * entirely from assistive tech, since it duplicates headings that are
 * already in the document.
 */

export type SpySection = { id: string; label: string };

export function ScrollSpy({ sections }: { sections: SpySection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (nodes.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Several sections can be intersecting the strip at once during a
        // fast scroll; take the one closest to the top of it.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    for (const n of nodes) io.observe(n);
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav
      aria-hidden
      className="pointer-events-none fixed top-1/2 left-6 z-30 hidden -translate-y-1/2 lg:block xl:left-10"
    >
      <ul className="flex list-none flex-col gap-3 p-0">
        {sections.map((s) => {
          const on = s.id === active;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                tabIndex={-1}
                className="pointer-events-auto group flex items-center gap-3"
              >
                {/* The bar grows and takes the brand colour when its
                    section is the one being read. */}
                <span
                  className={`h-px rounded-full transition-all duration-300 ${
                    on ? "w-7 bg-primary-600" : "w-3.5 bg-ink-300 group-hover:w-5 group-hover:bg-ink-500"
                  }`}
                />
                <span
                  className={`text-[11.5px] whitespace-nowrap transition-all duration-300 ${
                    on ? "text-ink-900 opacity-100" : "text-ink-400 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {s.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
