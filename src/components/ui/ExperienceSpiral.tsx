"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* THE SPIRAL RECORD, SCROLL-DRIVEN (Hulusi, 2026-09-07: "the spiral
   animation for the Experience section; it should show all jobs, it
   needs the timeline too, and it should be scroll-driven"). On lg the
   band is a runway: the stage pins while the page scrolls through it, and
   the scroll turns the coil so each role comes to the front in order,
   newest first - the timeline on the left is the index, its node and row
   lighting as its role arrives. All roles stay visible on the coil; the
   ones behind sit back and dim, never vanish. Every frame writes
   transforms straight to the DOM; React state changes only when the
   front role changes (for the line under the stage). Below lg, and under
   reduced motion, the timeline list alone carries the record. */

export type SpiralItem = { key: string; logo: string; co: string; role: string; period: string; desc: string };

const RISE = 220; // px, the coil's height from its lowest to its highest card

export function ExperienceSpiral({ items, label }: { items: SpiralItem[]; label: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    const n = items.length;
    const step = 360 / n;
    let raf = 0;

    const layout = () => {
      raf = 0;
      const rect = root.getBoundingClientRect();
      const runway = Math.max(1, rect.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / runway));
      // Turn the coil so role p*(n-1) sits in front: newest first.
      const rotation = -p * (n - 1) * step;
      const width = stage.clientWidth;
      const radius = Math.min(300, width * 0.3);
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const a = rotation + i * step;
        const an = ((a % 360) + 540) % 360 - 180; // -180..180, 0 = front
        const rad = (an * Math.PI) / 180;
        const x = Math.sin(rad) * radius;
        const z = Math.cos(rad) * radius;
        const depth = (z / radius + 1) / 2; // 0 back .. 1 front
        const y = (an / 180) * (RISE / 2); // the helix climbs with the angle
        const scale = 0.7 + 0.3 * depth;
        card.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), 0) scale(${scale.toFixed(3)})`;
        card.style.opacity = (0.45 + 0.55 * depth).toFixed(3);
        card.style.zIndex = String(Math.round(depth * 100));
      });
      const best = Math.round(p * (n - 1));
      if (best !== activeRef.current) {
        activeRef.current = best;
        setActive(best);
      }
      rowRefs.current.forEach((row, i) => {
        if (row) row.dataset.on = i === best ? "true" : "false";
      });
      cardRefs.current.forEach((card, i) => {
        if (card) card.dataset.active = i === best ? "true" : "false";
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(layout);
    };
    layout();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items.length]);

  const current = items[active];

  return (
    <div ref={rootRef} className="relative lg:h-[240vh]">
      <div className="lg:sticky lg:top-24 lg:grid lg:h-[calc(100svh-8rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12">
        {/* The timeline: the index of the coil. */}
        <ol className="relative flex list-none flex-col p-0 [--bio-rail:0.375rem]">
          <span aria-hidden className="absolute top-3 bottom-3 left-[var(--bio-rail)] w-px bg-line" />
          {items.map((item, i) => (
            <li
              key={item.key}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              data-on={i === 0}
              className="group relative py-3 pl-8 transition-opacity duration-300 lg:data-[on=false]:opacity-50 motion-reduce:transition-none"
            >
              <span
                aria-hidden
                className="absolute top-[1.15rem] left-[calc(var(--bio-rail)-0.3125rem)] size-2.5 rounded-full bg-ink-300 ring-4 ring-paper-soft transition-colors duration-300 group-data-[on=true]:bg-primary-600"
              />
              <p className="text-sm whitespace-nowrap text-ink-subtle tabular-nums">{item.period}</p>
              <p className="mt-0.5 text-base leading-snug font-semibold text-balance text-ink-950">{item.role}</p>
              <p className="mt-0.5 text-sm text-ink-muted">{item.co}</p>
              {/* Below lg the timeline is the whole record: each role's line. */}
              <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-muted lg:hidden">{item.desc}</p>
            </li>
          ))}
        </ol>

        {/* The coil. */}
        <div className="hidden lg:block">
          <div ref={stageRef} className="relative h-[26rem] select-none overflow-hidden" aria-label={label}>
            <ol className="absolute inset-0 m-0 list-none p-0">
              {items.map((item, i) => (
                <li
                  key={item.key}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  data-active={i === 0}
                  className="absolute top-1/2 left-1/2 w-[14rem] rounded-2xl bg-paper p-4 shadow-[0_20px_50px_-24px_rgb(10_16_32/0.35)] ring-1 ring-ink-950/[0.06] transition-[box-shadow] duration-500 will-change-transform data-[active=true]:ring-2 data-[active=true]:ring-primary-500 motion-reduce:transition-none"
                >
                  <Image src={item.logo} alt={item.co} width={140} height={24} draggable={false} className="pointer-events-none h-6 w-auto max-w-[8rem] object-contain object-left" />
                  <p className="mt-3 text-base leading-snug font-semibold text-balance text-ink-950">{item.role}</p>
                  <p className="mt-1 text-sm text-ink-muted tabular-nums">{item.period}</p>
                </li>
              ))}
            </ol>
          </div>
          {/* The role in front, spelled out. */}
          <div className="mx-auto mt-4 max-w-lg text-center" aria-live="polite">
            <p className="text-sm font-medium text-ink-950">
              {current.role} <span className="text-ink-subtle">· {current.co}</span>
            </p>
            <p className="mt-2 text-base leading-relaxed text-pretty text-ink-muted">{current.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
