"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/* THE CURVED, SCROLL-DRIVEN RECORD (Hulusi, 2026-09-07: "make this centred,
   like a curvy path, scroll-driven, but not so long"). One path snakes down
   the middle of the band, bending to each role in turn; the roles sit on
   alternating sides at the bends. As the band scrolls through the middle
   of the viewport the blue stroke draws down the grey track and lights the
   node it reaches, and that role's card comes up - progress is written to
   a CSS variable and `data-on` attributes on the DOM, no React state on
   scroll. Rows are short (no descriptions; wordmark, role, company, period)
   so seven roles fit in about a screen and a half. Below md the path goes
   and the rows stack as plain cards. Reduced motion: everything on. */

export type CurveItem = { key: string; logo: string; co: string; role: string; period: string };

const LEFT = 34;
const RIGHT = 66;

export function CurveTimeline({ items }: { items: CurveItem[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const n = items.length;
  const points = items.map((_, i) => ({ x: i % 2 === 0 ? LEFT : RIGHT, y: ((i + 0.5) / n) * 100 }));
  const d = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} 0 C ${p.x} ${p.y / 2}, ${p.x} ${p.y / 2}, ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const mid = (prev.y + p.y) / 2;
    return `${acc} C ${prev.x} ${mid}, ${p.x} ${mid}, ${p.x} ${p.y}`;
  }, "");
  const last = points[n - 1];
  const path = `${d} C ${last.x} ${(last.y + 100) / 2}, ${last.x} ${(last.y + 100) / 2}, ${last.x} 100`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--p", "1");
      el.querySelectorAll<HTMLElement>("[data-at]").forEach((node) => (node.dataset.on = "true"));
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const line = window.innerHeight * 0.55;
      const p = Math.min(1, Math.max(0, (line - r.top) / r.height));
      el.style.setProperty("--p", p.toFixed(4));
      el.querySelectorAll<HTMLElement>("[data-at]").forEach((node) => {
        node.dataset.on = p >= Number(node.dataset.at) ? "true" : "false";
      });
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
    <div ref={ref} className="relative mx-auto max-w-3xl">
      <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 hidden h-full w-full md:block">
        <path d={path} fill="none" stroke="var(--color-line)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        <path
          d={path}
          fill="none"
          stroke="var(--color-primary-500)"
          strokeWidth={2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: "calc(1 - var(--p, 0))" }}
        />
      </svg>
      <ol className="relative flex list-none flex-col gap-4 p-0 md:gap-0">
        {items.map((item, i) => {
          const left = i % 2 === 0;
          const at = ((i + 0.5) / n).toFixed(3);
          return (
            <li
              key={item.key}
              data-at={at}
              data-on="false"
              className="group relative md:grid md:min-h-[8.5rem] md:grid-cols-2 md:items-center"
            >
              {/* The node sits on the path's bend for this row. */}
              <span
                aria-hidden
                className="absolute top-1/2 hidden size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-300 ring-4 ring-paper-soft transition-colors duration-500 group-data-[on=true]:bg-primary-600 md:block"
                style={{ left: `${left ? LEFT : RIGHT}%` }}
              />
              <div
                className={`rounded-[28px] bg-paper p-5 ring-1 ring-ink-950/[0.06] transition-[opacity,transform] duration-500 ease-[var(--ease-out-soft)] motion-reduce:transition-none md:opacity-40 md:translate-y-2 md:group-data-[on=true]:translate-y-0 md:group-data-[on=true]:opacity-100 ${
                  left ? "md:col-start-2 md:ml-[4.5rem]" : "md:col-start-1 md:mr-[4.5rem]"
                }`}
              >
                <Image src={item.logo} alt={item.co} width={140} height={28} className="h-6 w-auto max-w-[8rem] object-contain object-left" />
                <p className="mt-3 text-lg leading-snug font-semibold text-balance text-ink-950">{item.role}</p>
                <p className="mt-1 text-sm text-ink-muted">
                  {item.co} <span className="text-ink-subtle">· </span>
                  <span className="text-ink-subtle tabular-nums">{item.period}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
