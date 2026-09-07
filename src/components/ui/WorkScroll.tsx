"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { PixelBurst, type BurstDirection } from "@/components/ui/PixelField";

const SIDES: BurstDirection[] = ["right", "down", "left", "up"];

/* THE SCROLL SWITCH for the homepage's "What I do" band (Hulusi, 2026-09-07,
   picked from three scroll-driven directions: "1"). The four service rows
   scroll past on the left; the row nearest the reading line lights up and
   the others sit back. On the right one panel stays pinned and shows the
   evidence card that belongs to the lit row, the cards fading and rising
   into each other. The reference was Intercom's feature list beside one
   changing visual. Below lg nothing pins: every row carries its own card.
   Round two (Hulusi): the pinned panel sits 7rem down so it clears the
   header with room, the list carries bottom padding so the last row can
   reach the line, and the active row is the last one whose top has passed
   mid-viewport - so the final card is reachable and stays. Round three
   (Hulusi: "the first three images change in a very small scroll"): on
   lg every row is at least 48vh tall with its text centred, so each card
   holds for about half a screen of scrolling before the next one takes
   over (62vh was tried and read as rows too far apart). Round four: the
   panel pins at the vertical centre of the viewport (top = 50vh minus half
   its height), not near the header. Round five: every row is exactly as
   tall as the panel (24rem) with its text centred, so when the band's
   scroll runs out the panel and the last row end aligned, centre to
   centre; the hairlines between rows are gone and the rows sit closer.

   The rows and cards are server-rendered nodes handed in as props - this
   component only decides which one is active. Nothing here depends on
   reduced motion except the transitions, which the utilities switch off. */
export function WorkScroll({ rows, panels }: { rows: ReactNode[]; panels: ReactNode[] }) {
  const [active, setActive] = useState(0);
  const [pulse, setPulse] = useState(0);
  const activeRef = useRef(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      // The row whose top has crossed the reading line (mid-viewport) is
      // the active one - the LAST such row, so the final row can take over
      // as soon as it arrives and stays lit until the band scrolls away.
      const line = window.innerHeight * 0.5;
      let best = 0;
      refs.current.forEach((el, i) => {
        if (!el) return;
        if (el.getBoundingClientRect().top <= line) best = i;
      });
      if (best !== activeRef.current) {
        activeRef.current = best;
        setActive(best);
        // The panel answers the switch with one soft pass, from a different
        // side each time - the pixel language fires when something changes,
        // never as wallpaper.
        setPulse((n) => n + 1);
      }
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
            className="py-6 transition-opacity duration-[var(--duration-fast)] first:pt-0 last:pb-0 lg:flex lg:min-h-[24rem] lg:flex-col lg:justify-center lg:py-6 lg:data-[active=false]:opacity-45 motion-reduce:transition-none"
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
        <div className="relative min-h-[24rem] lg:sticky lg:top-[calc(50vh-12rem)]">
          <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[28px]">
            <PixelBurst pulse={pulse} color="#ffffff" opacity={0.4} direction={SIDES[active % SIDES.length]} />
          </div>
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
