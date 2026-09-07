"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";

export type BioTrackRow = { key: string; co: string; logo: string; role: string; period: string };

/* THE PATH TRACKER (homepage Bio band, Hulusi, 2026-09-07: "make this
   section's experience timeline horizontal and add an effect like the
   path tracker effect"). From lg the roles stand in a row, oldest on the
   left, and a hairline runs under their nodes from the first to the last.
   As the band scrolls up the screen a brand-blue fill travels the line
   with a small head at its tip; each node turns blue as the head passes
   it and its role lights up behind it, so the reader follows the path to
   the role he holds today, whose node pulses once the path is complete.

   Progress is the band's position in the viewport, not time: it fills
   while the track climbs from 88% of the viewport height to 38%, so it
   runs at the reader's own pace and rewinds when they scroll back. The
   rows are plain data; the vertical rail below lg lives in Site.tsx.
   Under reduced motion the path is drawn complete and nothing moves.
   Before JS runs no role is dimmed (data-js gates the dimming), so the
   server HTML reads as a finished list. */
export function BioTrack({ rows }: { rows: BioTrackRow[] }) {
  const ref = useRef<HTMLOListElement>(null);

  // Progress is written straight to the DOM (a custom property and data
  // attributes), not to React state: a scroll frame must not re-render
  // seven rows, and the JSX below is the same at every progress value.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLLIElement>(":scope > li"));
    const last = items[items.length - 1]?.querySelector<HTMLElement>(".bio-track-node");
    const n = items.length;
    const end = (n - 1) / n;
    const apply = (p: number) => {
      el.style.setProperty("--p", String(p));
      el.dataset.state = p <= 0 ? "idle" : p >= 1 ? "done" : "moving";
      items.forEach((li, i) => {
        if (p * end >= i / n - 0.0005) li.dataset.passed = "true";
        else delete li.dataset.passed;
      });
      last?.classList.toggle("bio-node-live", p >= 1);
    };
    el.dataset.js = "true";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(1);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const top = el.getBoundingClientRect().top;
      const vh = window.innerHeight;
      const start = vh * 0.88;
      const stop = vh * 0.38;
      apply(Math.min(1, Math.max(0, (start - top) / (start - stop))));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const n = rows.length;
  // Every node sits on the left edge of its column, so the last one is at
  // (n-1)/n of the width and the path ends there, not at the right edge.
  const end = (n - 1) / n;

  return (
    <ol
      ref={ref}
      className="bio-track relative m-0 grid list-none p-0 pt-9"
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, "--p": 0 } as CSSProperties}
    >
      <span aria-hidden className="bio-track-rail absolute top-[0.3125rem] left-[0.3125rem] h-px" style={{ right: `calc(${(1 - end) * 100}% - 0.3125rem)` }}>
        <span className="bio-track-fill absolute inset-y-0 left-0" />
        <span className="bio-track-head absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      </span>
      {rows.map((r) => (
        <li key={r.key} className="relative min-w-0 pr-5">
          <span aria-hidden className="bio-track-node absolute -top-9 left-0 size-2.5 rounded-full ring-4 ring-paper" />
          <span className="block text-sm whitespace-nowrap text-ink-500 tabular-nums">{r.period}</span>
          <Image src={r.logo} alt={r.co} width={140} height={28} className="mt-3 h-7 w-auto max-w-[8.5rem] object-contain object-left" />
          <span className="mt-3 block text-sm leading-snug font-semibold text-balance text-ink-950">{r.role}</span>
          <span className="mt-1 block text-sm text-ink-600">{r.co}</span>
        </li>
      ))}
    </ol>
  );
}
