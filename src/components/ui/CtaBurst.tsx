"use client";

import { useEffect, useRef, useState } from "react";

import { PixelBurst, type BurstDirection } from "@/components/ui/PixelField";

/* The closing plate's answer. The calculator plate fires a pixel
   wavefront when its number changes; this plate has no number, so it
   fires when YOU arrive - once as it scrolls into view, and again when
   the pointer enters it. Same grain, same neutral-900, same sweep; the
   burst's own throttle absorbs a pulse that lands mid-flight, so a jittery
   pointer at the edge reads as one sweep, not a strobe. Nothing runs
   under reduced motion (PixelBurst returns before scheduling a frame).

   Since 2026-09-07 (Hulusi: "apply that pixel effect on the other images
   also") the same layer sits over every photographed plate on the site -
   ProductFrame, the hero meadow, the Tools band, the closing section - so
   a photograph arrives the way the plate does. `className` lets the
   caller place it above an image inside a masked layer (`z-0`) instead of
   the default `-z-10` under a plate's content. */
export function CtaBurst({
  className = "-z-10",
  color,
  direction,
  opacity,
  sweepMs,
  lifeMs,
  rearm = true,
}: {
  className?: string;
  /** Grain colour; default is the button's neutral-900 on the blue plate. A
      photograph takes white at a low opacity - dark grain read as dirt. */
  color?: string;
  direction?: BurstDirection;
  opacity?: number;
  sweepMs?: number;
  lifeMs?: number;
  /** Fire again when the pointer enters the plate. The blue plate does; a
      photograph passes once, on arrival, and is then still. */
  rearm?: boolean;
}) {
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
    if (rearm) plate.addEventListener("pointerenter", bump);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      plate.removeEventListener("pointerenter", bump);
    };
  }, [rearm]);

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <PixelBurst pulse={pulse} color={color} direction={direction} opacity={opacity} sweepMs={sweepMs} lifeMs={lifeMs} />
    </div>
  );
}
