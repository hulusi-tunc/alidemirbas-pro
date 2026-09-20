"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { clsx } from "@/lib/clsx";

/* A ROW OF CARDS THAT SCROLLS SIDEWAYS (2026-09-20, Hulusi on the A/B
   detail: "cancel the tab structure, put the four cards under the main
   page as a horizontal carousel"). The strip is a plain scroll container
   with snap points - a trackpad, a finger or a scroll wheel all work with
   nothing wired - and the two round buttons in the heading row step it by
   one card for a mouse. They dim at either end. Each child is expected
   to carry `data-card` so the step matches the card's real width. */
export function CardCarousel({
  heading,
  label,
  prevLabel,
  nextLabel,
  children,
}: {
  /** The row above the strip: an icon tile and a title, supplied whole. */
  heading: ReactNode;
  /** The strip's accessible name. */
  label: string;
  prevLabel: string;
  nextLabel: string;
  children: ReactNode;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const update = () => {
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const step = (dir: -1 | 1) => {
    const el = strip.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const gap = 16;
    const by = card ? card.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * by, behavior: "smooth" });
  };

  const button = "grid size-9 place-items-center rounded-full bg-paper text-ink-700 ring-1 ring-ink-950/[0.08] transition-[opacity,background-color] duration-[var(--duration-fast)] hover:bg-paper-soft disabled:opacity-35 disabled:hover:bg-paper";

  return (
    <div>
      <div className="flex items-center justify-between gap-6">
        {heading}
        <div className="flex items-center gap-2">
          <button type="button" aria-label={prevLabel} disabled={!canPrev} onClick={() => step(-1)} className={button}>
            <ChevronLeft aria-hidden className="size-4" />
          </button>
          <button type="button" aria-label={nextLabel} disabled={!canNext} onClick={() => step(1)} className={button}>
            <ChevronRight aria-hidden className="size-4" />
          </button>
        </div>
      </div>
      <div
        ref={strip}
        role="region"
        aria-label={label}
        className={clsx(
          "no-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2",
          canNext && "[mask-image:linear-gradient(to_right,black_calc(100%-4rem),transparent)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
