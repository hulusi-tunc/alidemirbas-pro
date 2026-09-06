"use client";

import { useEffect, useRef, useState } from "react";

import { PixelBurst } from "@/components/ui/PixelField";

/* The closing plate's answer. The calculator plate fires a pixel
   wavefront when its number changes; this plate has no number, so it
   fires when YOU arrive - once as it scrolls into view, and again when
   the pointer enters it. Same grain, same neutral-900, same sweep; the
   burst's own throttle absorbs a pulse that lands mid-flight, so a jittery
   pointer at the edge reads as one sweep, not a strobe. Nothing runs
   under reduced motion (PixelBurst returns before scheduling a frame). */
export function CtaBurst() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const layer = ref.current;
    const plate = layer?.parentElement;
    if (!layer || !plate) return;

    const bump = () => setPulse((n) => n + 1);

    /* The plate arrives inside a Reveal fade; a sweep that starts on the
       first intersecting frame runs half-hidden under that ramp. Wait for
       the reveal to finish, then answer. */
    const ARRIVAL_DELAY = 450;
    let fired = false;
    let timer = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !fired) {
            fired = true;
            timer = window.setTimeout(bump, ARRIVAL_DELAY);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(plate);
    plate.addEventListener("pointerenter", bump);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      plate.removeEventListener("pointerenter", bump);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <PixelBurst pulse={pulse} />
    </div>
  );
}
