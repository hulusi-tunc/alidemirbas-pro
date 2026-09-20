"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/* A PAGE DRAWN AT ITS REAL SIZE, SHOWN SMALL (2026-09-20, Hulusi on the A/B
   screens: "the screens are small but the components inside look so big -
   it looks like a toy"). A screenshot of a website is a 1120px page seen at
   40%; a drawing whose nav links are 11px tall in a 500px window is not.
   So the children are laid out at `width` - real text sizes, real control
   heights, four product columns - and this scales them to whatever width
   the container gives, keeping the container as tall as the scaled page.
   Layout runs at full size (the inner box's offsetHeight is untouched by
   the transform), so nothing inside has to know it is being shrunk. The
   pre-hydration frame uses `initial` so the server HTML is roughly right
   before the observer measures. */
export function ScaledPage({
  width,
  initial = 0.45,
  className,
  children,
}: {
  /** The page's laid-out width in CSS px. */
  width: number;
  /** A first guess at the scale, for the server-rendered frame. */
  initial?: number;
  className?: string;
  children: ReactNode;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(initial);
  const [height, setHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const update = () => {
      const s = o.clientWidth / width;
      setScale(s);
      setHeight(i.offsetHeight * s);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div ref={outer} className={className} style={{ height: height ?? undefined, overflow: "hidden" }}>
      <div ref={inner} style={{ width, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        {children}
      </div>
    </div>
  );
}
