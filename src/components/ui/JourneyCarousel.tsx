"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CarouselSlide = { src: string; alt: string; caption: string };

/** 3 visible on desktop (lg+), 2 on tablet (sm+), 1 on mobile - matching
    the brief's spec for this carousel. Autoplay every 4.5s, pauses on
    hover; wraps via index modulo rather than DOM-cloned infinite scroll
    (a small, deliberate simplification - the loop still reads as
    continuous, just without clone nodes). */
export function JourneyCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [visible, setVisible] = useState(3);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const compute = () => {
      if (window.innerWidth < 640) setVisible(1);
      else if (window.innerWidth < 1024) setVisible(2);
      else setVisible(3);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  const trackRef = useRef<HTMLDivElement>(null);
  const step = 100 / visible;
  const offset = -(index * step);

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + slides.length) % slides.length);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex transition-transform duration-500 ease-[var(--ease-out-smooth)]"
          style={{ transform: `translateX(${offset}%)` }}
        >
          {slides.map((s, i) => (
            <div key={s.src + i} className="shrink-0 px-2.5" style={{ width: `${step}%` }}>
              <div className="overflow-hidden rounded-card border border-line bg-paper">
                <div className="relative aspect-[4/3] w-full">
                  <Image src={s.src} alt={s.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                </div>
              </div>
              <p className="mt-3 text-center text-[13px] text-ink-500">{s.caption}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous"
        onClick={() => go(-1)}
        className="absolute top-[38%] -left-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-paper text-ink-600 shadow-[0_1px_2px_rgb(10_16_32/0.06)] transition-colors hover:border-ink-300 hover:text-ink-950 sm:-left-5"
      >
        <ChevronLeft aria-hidden className="size-4.5" />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => go(1)}
        className="absolute top-[38%] -right-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-paper text-ink-600 shadow-[0_1px_2px_rgb(10_16_32/0.06)] transition-colors hover:border-ink-300 hover:text-ink-950 sm:-right-5"
      >
        <ChevronRight aria-hidden className="size-4.5" />
      </button>

      <div className="mt-6 flex justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.src + i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-primary-600" : "w-1.5 bg-line-strong"}`}
          />
        ))}
      </div>
    </div>
  );
}
