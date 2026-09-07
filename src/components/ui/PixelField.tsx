"use client";

import { useEffect, useRef } from "react";

/**
 * THE ANSWER BURST — the button's pixel dissolve (PixelFill.tsx), re-cut as
 * an event on the calculator's answer plate.
 *
 * Three ambient versions of this component were built and rejected (static
 * dither, full-plate twinkle, corner ember drift): every texture that LIVES
 * on the plate ends up read as noise behind the number. The pixel language
 * appears here only when the plate has something to say - a wavefront of
 * pixels sweeps across from the inputs' side EVERY time the computed answer
 * changes, in the same neutral-900 the primary button's hover dissolve
 * fills with. The plate answers your numbers the way the button answers
 * your pointer, and is clean at every other moment.
 *
 * RE-FIRE THROTTLING. Live computation means the answer can change on every
 * keystroke and on every frame of a slider drag. A burst that restarted on
 * each of those would strobe at the left edge and never travel, so a pulse
 * that arrives while a sweep is in flight is absorbed: the running front
 * already covers that moment of change, and the next pulse after it
 * finishes starts a fresh one. Continuous dragging reads as back-to-back
 * sweeps, not flicker.
 *
 * MECHANICS. Full-density 3px cells (the button's grain and alpha palette),
 * delay proportional to distance from the left edge plus jitter - the
 * front travels the direction the answer arrives from. A pixel grows,
 * holds a beat, shrinks, and is gone; the last pixel's death cancels the
 * loop and clears the canvas. Nothing runs before the first pulse or under
 * reduced motion.
 */

const PALETTE_ALPHAS = [1, 0.75, 0.5, 0.3];
const FRAME_MS = 1000 / 60;
/** Ticks the wavefront spends crossing the plate (~430ms at 60fps). */
const SWEEP_TICKS = 26;
const JITTER_TICKS = 5;
const GROW_TICKS = 4;
const HOLD_TICKS = 3;
const SHRINK_TICKS = 6;
const MAX_DPR = 2;

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

type Grain = {
  x: number;
  y: number;
  alpha: number;
  delay: number;
  age: number;
  maxSize: number;
};

export type BurstDirection = "right" | "left" | "down" | "up" | "center";

export function PixelBurst({
  /** Bump to request a burst. 0 (or an unchanged value) never fires; a bump
      during a running sweep is absorbed (see RE-FIRE THROTTLING above). */
  pulse,
  gap = 3,
  /** The primary button's hover fill (neutral-900) - dark pixels crossing
      the brand-blue plate, exactly the button's own dissolve pairing. */
  color = "#2a2a2a",
  /** Where the front travels from (2026-09-07, Hulusi: "you applied the
      same left-to-right everywhere; vary it, don't overuse it"). The plate
      keeps `right`; a photograph picks the direction its subject suggests
      - the sky coming down, the field rising, the person's side. */
  direction = "right",
  /** Multiplies the grain palette's alphas. 1 is the plate's full-density
      answer; a photograph wants a softer pass (0.4-0.6) in a light colour. */
  opacity = 1,
  /** How long the front takes to cross the plate. The plate's answer is
      quick (430ms); a photograph's pass is slow (1.5-2.5s) so it reads as
      weather, not a flash (2026-09-07, Hulusi: "so sharp, fast,
      distracting - smoother; in the hero slow, inside-out"). */
  sweepMs = 430,
  /** How long one grain lives (grow, hold, shrink). Scales with the sweep. */
  lifeMs = 215,
}: {
  pulse: number;
  gap?: number;
  color?: string;
  direction?: BurstDirection;
  opacity?: number;
  sweepMs?: number;
  lifeMs?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fireRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cell = Math.max(1, Math.round(gap));
    const sweepTicks = Math.max(1, Math.round(sweepMs / FRAME_MS));
    const lifeScale = Math.max(0.25, lifeMs / 215);
    const growTicks = Math.max(1, Math.round(GROW_TICKS * lifeScale));
    const holdTicks = Math.max(1, Math.round(HOLD_TICKS * lifeScale));
    const shrinkTicks = Math.max(1, Math.round(SHRINK_TICKS * lifeScale));
    const jitterTicks = Math.max(1, Math.round(JITTER_TICKS * Math.max(1, sweepTicks / SWEEP_TICKS)));
    const LIFE = growTicks + holdTicks + shrinkTicks;

    let grains: Grain[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let previous = 0;
    let debt = 0;
    let running = false;

    const build = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const progress = (x: number, y: number) => {
        switch (direction) {
          case "left":
            return 1 - x / width;
          case "down":
            return y / height;
          case "up":
            return 1 - y / height;
          case "center":
            return Math.hypot(x - width / 2, y - height / 2) / Math.hypot(width / 2, height / 2);
          default:
            return x / width;
        }
      };
      const next: Grain[] = [];
      for (let x = 0; x < width; x += cell) {
        for (let y = 0; y < height; y += cell) {
          next.push({
            x,
            y,
            alpha: PALETTE_ALPHAS[Math.floor(Math.random() * PALETTE_ALPHAS.length)],
            delay: progress(x, y) * sweepTicks + random(0, jitterTicks),
            age: 0,
            maxSize: random(cell * 0.4, cell),
          });
        }
      }
      grains = next;
    };

    const step = () => {
      frame = requestAnimationFrame(step);
      const now = performance.now();
      debt += previous === 0 ? FRAME_MS : now - previous;
      previous = now;
      if (debt < FRAME_MS) return;
      debt = Math.min(debt - FRAME_MS, FRAME_MS * 2);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;

      let alive = false;
      for (const g of grains) {
        if (g.delay > 0) {
          g.delay -= 1;
          alive = true;
          continue;
        }
        if (g.age >= LIFE) continue;
        g.age += 1;
        alive = true;

        let size: number;
        let alpha = g.alpha;
        if (g.age <= growTicks) {
          const t = g.age / growTicks;
          size = g.maxSize * (t * (2 - t)); // ease-out: no hard pop
        } else if (g.age <= growTicks + holdTicks) {
          size = g.maxSize;
        } else {
          const t = (g.age - growTicks - holdTicks) / shrinkTicks;
          const e = t * t; // ease-in fade
          size = g.maxSize * (1 - e);
          alpha = g.alpha * (1 - e);
        }
        if (size <= 0) continue;
        const offset = (cell - size) / 2;
        ctx.globalAlpha = alpha * opacity;
        ctx.fillRect(g.x + offset, g.y + offset, size, size);
      }

      // Last pixel gone: clear, stop, and become willing to fire again.
      if (!alive) {
        ctx.clearRect(0, 0, width, height);
        cancelAnimationFrame(frame);
        frame = 0;
        running = false;
      }
    };

    fireRef.current = () => {
      if (running) return;
      running = true;
      build();
      previous = 0;
      debt = 0;
      frame = requestAnimationFrame(step);
    };

    return () => {
      fireRef.current = () => {};
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
    };
  }, [gap, color, direction, opacity, sweepMs, lifeMs]);

  useEffect(() => {
    if (pulse > 0) fireRef.current();
  }, [pulse]);

  return (
    <canvas
      ref={canvasRef}
      data-pixel-burst=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
