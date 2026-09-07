"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* THE SCROLL SWITCH for the homepage's "What I do" band (Hulusi, 2026-09-07,
   picked from three scroll-driven directions: "1"). The four service rows
   scroll past on the left; the row nearest the reading line lights up and
   the others sit back. On the right one panel stays pinned and shows the
   evidence card that belongs to the lit row, the cards fading and rising
   into each other. The reference was Intercom's feature list beside one
   changing visual. Below lg nothing pins: every row carries its own card.

   The rows and cards are server-rendered nodes handed in as props - this
   component only decides which one is active. Nothing here depends on
   reduced motion except the transitions, which the utilities switch off. */
export function WorkScroll({ rows, panels }: { rows: ReactNode[]; panels: ReactNode[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      // The reading line sits a little above the middle, where the eye rests.
      const line = window.innerHeight * 0.42;
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const distance = Math.abs(r.top + r.height / 2 - line);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      });
      setActive(best);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
      <ol className="flex list-none flex-col p-0">
        {rows.map((row, i) => (
          <li
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-active={i === active}
            className="border-t border-line py-8 transition-opacity duration-[var(--duration-fast)] first:border-t-0 first:pt-0 last:pb-0 lg:py-10 lg:data-[active=false]:opacity-45 motion-reduce:transition-none"
          >
            {row}
            {/* Below lg the card travels with its row. `group` + data-on
                lets the card's own motion (the bars) run the same way it
                does in the pinned panel. */}
            <div data-on="true" className="group mt-6 lg:hidden">
              {panels[i]}
            </div>
          </li>
        ))}
      </ol>
      <div className="hidden lg:block">
        <div className="relative min-h-[27rem] lg:sticky lg:top-24">
          {panels.map((panel, i) => (
            <div
              key={i}
              data-on={i === active}
              aria-hidden={i !== active}
              className="group absolute inset-0 translate-y-3 opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-soft)] data-[on=true]:translate-y-0 data-[on=true]:opacity-100 motion-reduce:transition-none"
            >
              {panel}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
