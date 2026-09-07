"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { PixelBurst } from "@/components/ui/PixelField";

/* THE HIGHLIGHT (Hulusi, 2026-09-07: "use the effect to highlight the A and
   B differences - put it inside the red ring; a logical place, not just
   for using it"). The pixel pass confined to one element - the thing a
   test changed - so the eye lands there. It runs when the element's card
   becomes the active one (the nearest `[data-on]` ancestor turning true,
   watched with a MutationObserver) or, where there is no such ancestor,
   when it scrolls into view; then it repeats every few seconds while the
   card stays on, and stops when it goes off. Rose grain, radiating from
   the centre, soft. Nothing under reduced motion (PixelBurst's own guard). */
export function PixelHighlight({ children, className = "" }: { children?: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    const start = () => {
      stop();
      setPulse((n) => n + 1);
      timer = window.setInterval(() => setPulse((n) => n + 1), 3800);
    };
    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = 0;
    };
    const host = el.closest<HTMLElement>("[data-on]");
    if (host) {
      if (host.dataset.on === "true") start();
      const mo = new MutationObserver(() => (host.dataset.on === "true" ? start() : stop()));
      mo.observe(host, { attributes: true, attributeFilter: ["data-on"] });
      return () => {
        mo.disconnect();
        stop();
      };
    }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())), { threshold: 0.6 });
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  return (
    <span ref={ref} className={`relative block overflow-hidden ${className}`}>
      {children}
      <PixelBurst pulse={pulse} color="#f43f5e" opacity={0.55} direction="center" sweepMs={900} lifeMs={520} />
    </span>
  );
}
