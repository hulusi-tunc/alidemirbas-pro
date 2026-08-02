"use client";

import { useEffect, useRef, useState } from "react";

/**
 * THE PIXEL FILL — the button's one interaction, drawn per pixel on a canvas.
 *
 * Mechanics ported from React Bits' `PixelCard`
 * (https://reactbits.dev/components/pixel-card) — MIT licence, © React Bits
 * contributors. What is ported is the pixel field, not the card: the `Pixel`
 * class and its `appear` / `disappear` / `shimmer` state machine, the
 * distance-from-centre delay, the per-pixel randomisation of `speed`,
 * `sizeStep`, `maxSize` and `counterStep`, the 60 fps-throttled single
 * `requestAnimationFrame` loop cancelled when every pixel is idle,
 * `getEffectiveSpeed`'s 0–100 → ×0.001 mapping with its reduced-motion zero,
 * and the `ResizeObserver` re-init. The card wrapper, its `variants` map and
 * its literal `colors` list are not ported.
 *
 * WHY A CANVAS AND NOT A MASK. Two CSS-mask implementations were built and both
 * were rejected for the same structural reason: a mask can only reveal a
 * CONTINUOUS SHAPE. However finely you dither the thing being revealed, what
 * grows is a rectangle or a disc, and that is what the eye reads. A field of
 * independent pixels, each with its own delay, has no shape to grow — the
 * colour arrives as a dissolve radiating outward. That is only expressible if
 * every pixel is addressed individually, which means a canvas.
 *
 * HOW IT MOUNTS. This renders one `<canvas>` and nothing else. It is the first
 * child of the control (`Button`, `ButtonLink`), sized `absolute inset-0` and
 * pinned to a NEGATIVE z-index inside the control's own stacking context
 * (`.btn-fill` sets `isolation: isolate`), which puts it above the resting
 * plate and its inset ring but below the label — exactly where the `::after`
 * it replaces sat, and without wrapping the label in anything. Nothing wraps
 * the children, because several call sites hand the button a `w-full` inner
 * row and an extra element in that chain would break their layout.
 *
 * WHERE THE COLOUR COMES FROM. `--btn-fill`, read off the HOST with
 * `getComputedStyle` at the start of every arrival — so the seven variants,
 * the `[data-tone="dark"]` / `.btn-tone-dark` overrides and the `:active`
 * shift all keep working with no second source of truth in JavaScript. Its
 * companion `--btn-fill-ink` is the LABEL colour and is consumed by CSS on the
 * host (§ THE BUTTON PLATE in globals.css), not here: the label's delayed flip
 * is a colour transition and belongs in the stylesheet.
 *
 * REDUCED MOTION. The canvas is not rendered at all — no element, no listeners,
 * no loop. The fill then falls to the plain colour swap in globals.css, which
 * keys on the canvas's own absence (`:not(:has(> [data-pixel-fill]))`), so the
 * same rule covers reduced motion, JavaScript off and the pre-hydration frame.
 */

/** The four opacities of the dither this replaces, kept verbatim. */
const PALETTE_ALPHAS = [1, 0.75, 0.5, 0.3];

const FRAME_MS = 1000 / 60;

/**
 * HOW `--duration-fill` IS SPENT. An arrival is four stages: the wavefront
 * reaching a pixel (the only stage that varies by position), the pixel growing
 * to its own random ceiling, an optional shimmer, and the settle onto the
 * plate. The budget is divided in `deriveTiming` in this order of priority.
 *
 * THE DELAY RAMP GETS A FIXED SHARE, not the remainder. That is the effect: it
 * is the only thing that makes the fill radiate instead of flash, so it cannot
 * be what absorbs a shortened budget. At 45% the outermost pixel still starts
 * growing a clearly readable ~10 frames after the centre one.
 *
 * `GROW_FRAMES` is a CEILING, not a target: `sizeStep` is floored at
 * `cell / GROW_FRAMES`, so the one pixel whose `maxSize` came out at the full
 * cell takes exactly this many frames and every other pixel takes fewer.
 *
 * `SETTLE_FRAMES` is the densification — the dust closing into a solid plate.
 * Below about five frames it stops reading as a convergence and becomes a pop.
 *
 * THE SHIMMER TAKES WHAT IS LEFT, AND MAY GET NOTHING. It is the one garnish
 * here: the reference oscillates forever because a card is hovered and held,
 * whereas this has to arrive. Fewer than `SHIMMER_MIN` frames cannot read as an
 * oscillation — it would be a single sub-pixel twitch — so below that it is
 * skipped outright rather than compressed. At `--duration-fill: 360ms` it is
 * skipped; from roughly 500ms up it comes back on its own.
 */
const DELAY_SHARE = 0.45;
const GROW_FRAMES = 6;
const SETTLE_FRAMES = 5;
const SHIMMER_MIN = 4;

/**
 * Per-pixel jitter on the delay step. The reference gets this from the
 * `Math.random() * 4` term of its `counterStep`; without it neighbours light up
 * in lockstep and the wavefront reads as a mechanical sweep with a clean edge.
 *
 * ONE-SIDED, AND THAT MATTERS: it only ever makes a pixel EARLIER, never later.
 * Symmetric jitter would put the unluckiest pixel at `delayFrames / 0.75` and
 * the whole fill would overrun `--duration-fill` by a third — measured at 400ms
 * against a 360ms budget before this was one-sided. Now the slowest possible
 * pixel is the nominal one, so the budget is a ceiling by construction rather
 * than on average.
 */
const DELAY_JITTER = 0.5;

/**
 * The reference shimmers forever, because a card is hovered and held. A button
 * has to ARRIVE: the finished state must be one flat plate, alpha 1 edge to
 * edge, or the control looks half-rendered while the pointer rests on it. So
 * after its shimmer each pixel settles — size to its full cell, alpha to 1 —
 * and the loop is then free to stop, which it cannot do in the reference.
 */
const SETTLE_STEP = 1 / SETTLE_FRAMES;

/** Frames the plate spends breaking back into pixels before any of them shrink. */
const EXIT_SETTLE_FRAMES = 4;
const EXIT_SETTLE_STEP = 1 / EXIT_SETTLE_FRAMES;

/** The per-pixel spread of the shrink, as a fraction of the frames available. */
const EXIT_SPREAD_MIN = 0.55;

/**
 * The reference's 0.001 throttle is calibrated for a pixel that shimmers
 * indefinitely on a 400px card. Over a six-frame window on a 3px cell the same
 * step is sub-pixel and invisible, so it is scaled by the cell — the shimmer is
 * a jitter in units of the pixel, not of the screen.
 */
const SHIMMER_GAIN = 4;

/**
 * Half a pixel of overlap on each side, applied ONLY once a pixel is fully
 * settled at alpha 1. It closes the antialiasing seams between cells so the
 * finished plate is airtight. Never applied at partial alpha, where overlapping
 * rects would composite twice and draw a grid of darker lines.
 */
const OVERDRAW = 1;

/** Retina cells stay crisp; past 2× the extra rects buy nothing visible. */
const MAX_DPR = 2;

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/** The reference's mapping, verbatim: a 0–100 prop through a 0.001 throttle. */
function getEffectiveSpeed(value: number, reducedMotion: boolean) {
  const min = 0;
  const max = 100;
  const throttle = 0.001;
  if (!Number.isFinite(value) || value <= min || reducedMotion) return min;
  if (value >= max) return max * throttle;
  return value * throttle;
}

/** A CSS `<time>` in ms. Only `ms` and `s` occur in the token file. */
function readMs(value: string, fallback: number) {
  const text = value.trim();
  const number = Number.parseFloat(text);
  if (!Number.isFinite(number)) return fallback;
  if (text.endsWith("ms")) return number;
  if (text.endsWith("s")) return number * 1000;
  return fallback;
}

type Timing = {
  delayFrames: number;
  shimmerFrames: number;
  shrinkFrames: number;
};

/**
 * THE BUDGET COMES FROM THE TOKENS, not from constants here.
 * `--duration-fill` and `--duration-fill-exit` are declared once in globals.css
 * alongside the rest of the duration scale, which is where anyone retuning the
 * interaction will look. So they are read off the element and divided into
 * frames rather than restated — otherwise the two numbers drift apart and the
 * token becomes a comment. It has already earned that: the client asked for a
 * faster dissolve and the change was one line of CSS.
 *
 * THE ACCOUNTING AT 360ms / 200ms (60fps, so 16.67ms a tick). Measured, not
 * predicted — the loop was frozen and stepped a tick at a time:
 *
 *   enter   22 ticks   delay ≤9 (150ms) · grow ≤6 (100ms) · shimmer 0 ·
 *                      settle 5 (83ms) · 1 to lay the airtight plate.
 *                      Coverage reaches 100% at ~250ms and the last cell hits
 *                      full opacity at 350ms, inside the 360ms budget. Ring
 *                      coverage crosses 100% at 117ms (inner), 200ms (middle),
 *                      283ms (outer): the front is still visibly travelling
 *                      three quarters of the way through.
 *   exit    12 ticks   plate coming apart 4 (67ms) · shrink 4–7 (67–117ms).
 *                      The plate breaks into 19 opacity levels on the first
 *                      tick and the last pixel is gone by tick 11 (183ms) —
 *                      a snap-back, not a fade. The shrink is per-pixel rather
 *                      than positional, so a 600px `w-full` control clears in
 *                      the same time as a 149px header CTA: nothing is cut off
 *                      by width, because width buys no extra distance here.
 *
 * One tick is reserved for the settled plate because that draw happens on the
 * tick AFTER the settle completes. The shimmer takes what is then left, and at
 * 360ms that is 1 tick — below `SHIMMER_MIN`, so it is skipped. Raise
 * `--duration-fill` past ~450ms and it reappears with no code change.
 */
function deriveTiming(style: CSSStyleDeclaration): Timing {
  const enter = Math.round(
    readMs(style.getPropertyValue("--duration-fill"), 360) / FRAME_MS,
  );
  const exit = Math.round(
    readMs(style.getPropertyValue("--duration-fill-exit"), 200) / FRAME_MS,
  );
  const usable = Math.max(4, enter - 1);
  const delayFrames = Math.max(2, Math.round(usable * DELAY_SHARE));
  const spare = usable - delayFrames - GROW_FRAMES - SETTLE_FRAMES;
  return {
    delayFrames,
    shimmerFrames: spare >= SHIMMER_MIN ? spare : 0,
    // Same reservation on the way out: the tick that finds a pixel at zero and
    // reports it idle draws nothing, so it is not part of the visible retreat.
    shrinkFrames: Math.max(2, exit - EXIT_SETTLE_FRAMES - 1),
  };
}

/**
 * One cell of the field. Every constant that varies between pixels is drawn at
 * construction and never re-rolled, which is what stops the field reading as a
 * mechanical sweep: neighbours reach the same radius a few frames apart.
 */
class Pixel {
  private readonly cell: number;
  private readonly x: number;
  private readonly y: number;
  private readonly alpha0: number;
  private readonly delay: number;
  private readonly counterStep: number;
  private readonly sizeStep: number;
  private readonly minSize: number;
  private readonly maxSize: number;
  private readonly shimmerStep: number;
  private readonly shimmerFrames: number;
  private readonly exitStep: number;

  private counter = 0;
  private size = 0;
  private settle = 0;
  private shimmered = 0;
  private isShimmer = false;
  private isReverse = false;
  /** Size the settle ramps FROM — wherever the shimmer left the pixel. */
  private plateFrom: number;

  /** True when this pixel has nothing further to change, in either direction. */
  isIdle = true;

  constructor(
    cell: number,
    x: number,
    y: number,
    delay: number,
    maxDelay: number,
    speed: number,
    timing: Timing,
  ) {
    this.cell = cell;
    this.x = x;
    this.y = y;
    this.alpha0 =
      PALETTE_ALPHAS[Math.floor(Math.random() * PALETTE_ALPHAS.length)];
    this.delay = delay;
    /* THE ONE PLACE THE REFERENCE'S ARITHMETIC IS REPLACED. It derives
       `counterStep` from `Math.random() * 4 + (width + height) * 0.01`, which
       makes the wait a function of the element's ABSOLUTE size — fine for a deck
       of identically sized cards, wrong here, where the same component covers a
       40px table-row control and a 600px `w-full` form submit and both have to
       complete inside the same `--duration-fill`. Normalised against the
       element's own half-diagonal instead, so the wavefront always crosses in
       `timing.delayFrames`; the reference's jitter is kept. */
    this.counterStep =
      random(1, 1 + DELAY_JITTER) * (maxDelay / timing.delayFrames);
    // The reference's `Math.random() * 0.4` against a max size of 2, expressed
    // against this cell instead, with a floor: a step that rounds to nothing
    // would leave a pixel growing forever and the loop would never stop. The
    // floor is what makes GROW_FRAMES a ceiling.
    this.sizeStep = random(1 / GROW_FRAMES, 2 / GROW_FRAMES) * cell;
    this.minSize = cell * 0.25;
    this.maxSize = random(this.minSize, cell);
    this.plateFrom = this.maxSize;
    this.shimmerStep = random(0.1, 0.9) * speed * cell * SHIMMER_GAIN;
    this.shimmerFrames = timing.shimmerFrames;
    this.exitStep =
      cell / (timing.shrinkFrames * random(EXIT_SPREAD_MIN, 1));
  }

  private draw(ctx: CanvasRenderingContext2D, size: number, alpha: number) {
    if (size <= 0) return;
    const offset = (this.cell - size) / 2;
    ctx.globalAlpha = alpha;
    ctx.fillRect(this.x + offset, this.y + offset, size, size);
  }

  appear(ctx: CanvasRenderingContext2D) {
    this.isIdle = false;

    // 1 · the wavefront has not reached this cell yet. Nothing is drawn — this
    //     is what makes the field radiate rather than fade in as a whole.
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }

    // 4 · settled. Full cell, full alpha, overdrawn so the seams close.
    if (this.settle >= 1) {
      this.draw(ctx, this.cell + OVERDRAW, 1);
      this.isIdle = true;
      return;
    }

    /* 2 · grow to this pixel's own ceiling. Reference verbatim, and the stage the
           client is responding to, so it is never the one that gets compressed
           when the budget shrinks — the shimmer below is. */
    if (this.size >= this.maxSize) this.isShimmer = true;

    /* 3 · the shimmer is spent — or was never funded — so converge on the plate.
           THIS TEST SITS AFTER THE FLIP ABOVE, not before it: with
           `shimmerFrames` at 0 (which is what a 360ms budget buys) an earlier
           test would fire on the pixel's first drawn frame and it would pop
           straight to `maxSize` with no growth at all. Ramping from `plateFrom`
           rather than from `maxSize` keeps it continuous when the shimmer HAS
           run and left the pixel somewhere other than its ceiling. */
    if (this.isShimmer && this.shimmered >= this.shimmerFrames) {
      if (this.settle === 0) this.plateFrom = this.size;
      this.settle = Math.min(1, this.settle + SETTLE_STEP);
      this.draw(
        ctx,
        this.plateFrom + (this.cell - this.plateFrom) * this.settle,
        this.alpha0 + (1 - this.alpha0) * this.settle,
      );
      return;
    }

    if (this.isShimmer) {
      this.shimmer();
      this.shimmered += 1;
    } else {
      this.size += this.sizeStep;
    }
    this.draw(ctx, this.size, this.alpha0);
  }

  disappear(ctx: CanvasRenderingContext2D) {
    this.isShimmer = false;
    this.shimmered = 0;
    this.counter = 0;

    // The plate breaks back into pixels before any of them shrink, so the exit
    // reads as the same field coming apart rather than as a colour fading out.
    if (this.settle > 0) {
      this.isIdle = false;
      this.settle = Math.max(0, this.settle - EXIT_SETTLE_STEP);
      this.size = this.plateFrom + (this.cell - this.plateFrom) * this.settle;
      this.draw(
        ctx,
        this.size,
        this.alpha0 + (1 - this.alpha0) * this.settle,
      );
      return;
    }

    if (this.size <= 0) {
      this.size = 0;
      this.isIdle = true;
      return;
    }

    this.isIdle = false;
    this.size -= this.exitStep;
    this.draw(ctx, this.size, this.alpha0);
  }

  private shimmer() {
    if (this.size >= this.maxSize) this.isReverse = true;
    else if (this.size <= this.minSize) this.isReverse = false;
    this.size += this.isReverse ? -this.shimmerStep : this.shimmerStep;
  }
}

export function PixelFill({
  /**
   * Cell pitch in CSS pixels. 3px, not the reference's 5–10: those are sized
   * for a 400px card, and on a 56px control they leave a dozen rows and read as
   * blocks. 3px is the grain of the dither this replaces, which reviewed well —
   * the objection was to the SHAPE, not to the pixel size.
   */
  gap = 3,
  /**
   * 0–100, the reference's scale. Only the shimmer reads it; the arrival is
   * frame-counted against `--duration-fill`. 80 keeps the six shimmer frames
   * legible as jitter without the field boiling.
   */
  speed = 80,
}: {
  gap?: number;
  speed?: number;
} = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [motionOk, setMotionOk] = useState(false);

  /* The query is live: toggling the OS setting adds or removes the canvas
     without a reload. Starts `false` so the server, the hydration pass and the
     reduced-motion visitor all agree on rendering nothing. */
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const update = () => setMotionOk(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!motionOk) return;

    /* Narrowed into `const`s ahead of the closures below, and every closure is
       an arrow assigned to a `const` rather than a hoisted `function`: a hoisted
       declaration is treated as created at the top of the scope, before these
       guards run, so the compiler will not carry the narrowing into it. */
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellSize = Math.max(1, Math.round(gap));
    const effectiveSpeed = getEffectiveSpeed(speed, false);
    const timing = deriveTiming(getComputedStyle(host));

    let pixels: Pixel[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let previous = 0;
    let debt = 0;
    let phase: "appear" | "disappear" = "appear";
    let fill = "";

    const measure = () => {
      const rect = host.getBoundingClientRect();
      return [
        Math.max(1, Math.round(rect.width)),
        Math.max(1, Math.round(rect.height)),
      ] as const;
    };

    const init = () => {
      [width, height] = measure();

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // Everything below works in CSS pixels; the device ratio lives here only.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const maxDelay = Math.max(1, Math.hypot(width / 2, height / 2));
      const next: Pixel[] = [];
      for (let x = 0; x < width; x += cellSize) {
        for (let y = 0; y < height; y += cellSize) {
          // The reference's own measure: distance from the element's centre.
          const delay = Math.hypot(x - width / 2, y - height / 2);
          next.push(
            new Pixel(cellSize, x, y, delay, maxDelay, effectiveSpeed, timing),
          );
        }
      }
      pixels = next;
    };

    const step = () => {
      frame = requestAnimationFrame(step);

      /* ONE LOGICAL TICK PER 1/60s OF REAL TIME, ACCUMULATED RATHER THAN GATED.
         The reference compares `now - previous` against `1000 / 60` and returns
         early when it is smaller. On a 60Hz display that delta lands on either
         side of the threshold by a few hundred microseconds, so it drops roughly
         every other frame and the animation runs at half the speed it claims.
         Measured here: 44 ticks to fill instead of 22 — 730ms against a 360ms
         budget. Survivable for a card that shimmers indefinitely, not survivable
         for a budget this tight, and invisible until you count frames.

         Spending an accumulated balance instead gives exactly 60 ticks a second
         at any refresh rate — 120Hz and 144Hz panels tick on the frames that
         cross the threshold rather than every frame — so `--duration-fill` means
         what it says on all of them. The balance is capped at two frames so a
         backgrounded tab does not come back and fast-forward. */
      const now = performance.now();
      debt += previous === 0 ? FRAME_MS : now - previous;
      previous = now;
      if (debt < FRAME_MS) return;
      debt = Math.min(debt - FRAME_MS, FRAME_MS * 2);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = fill;

      let allIdle = true;
      for (const pixel of pixels) {
        if (phase === "appear") pixel.appear(ctx);
        else pixel.disappear(ctx);
        if (!pixel.isIdle) allIdle = false;
      }

      // The last frame stays on the canvas, so a settled fill holds under the
      // pointer for free — no loop running while nothing changes.
      if (allIdle) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const start = (next: "appear" | "disappear") => {
      if (next === "appear") {
        const value = getComputedStyle(host)
          .getPropertyValue("--btn-fill")
          .trim();
        // No fill declared — nothing to paint, and painting `""` would throw
        // the context's fillStyle back to black.
        if (!value) return;
        fill = value;
      }
      phase = next;
      previous = 0;
      debt = 0;
      if (!frame) frame = requestAnimationFrame(step);
    };

    /* Driven off the control's own `:hover` / `:focus-visible`, re-read at
       event time rather than tracked in booleans. That keeps the canvas in
       lockstep with the CSS label flip, which keys on the same two
       pseudo-classes — including where the two would otherwise diverge, such as
       the sticky `:hover` mobile browsers leave behind after a tap. A label
       flipped with no fill under it is unreadable on the light variants, so the
       two must never disagree. */
    /* A CONTROL THAT WAS HIDDEN WHEN THIS MOUNTED MEASURED 0×0, so its grid is a
       single floored cell and its dissolve is silently dead. The mobile-header
       CTAs are exactly this: `lg:hidden`, so on a desktop first paint they build
       a 1×1 canvas, and the visitor who then narrows the window gets a button
       that answers the pointer with nothing.

       `ResizeObserver` is the obvious fix and is not dependable enough on its
       own — engines disagree about whether a box going from `display: none` to
       laid out reports as a resize. So the box is re-checked on the way IN as
       well. One `getBoundingClientRect` on the element the pointer has just
       entered is free on the common path, where it matches and nothing happens,
       and it closes the whole class of bug rather than the one instance of it:
       a button revealed inside a Dialog, a Tabs panel or an accordion arrives
       here by the same route. */
    const ensureGrid = () => {
      const [w, h] = measure();
      if (w !== width || h !== height) init();
    };

    const sync = () => {
      const inert =
        host.matches(":disabled") ||
        host.getAttribute("aria-disabled") === "true";
      const active =
        !inert && (host.matches(":hover") || host.matches(":focus-visible"));
      if (active) ensureGrid();
      start(active ? "appear" : "disappear");
    };

    // `pointerdown` / `pointerup` are here for `--btn-fill`'s `:active` shift:
    // `start("appear")` re-reads the property, and a settled field repaints in
    // one frame because `appear()` draws before it reports itself idle.
    const events = [
      "pointerenter",
      "pointerleave",
      "pointercancel",
      "pointerdown",
      "pointerup",
      "focusin",
      "focusout",
    ] as const;
    for (const event of events) host.addEventListener(event, sync);

    init();

    const observer = new ResizeObserver(() => {
      const rect = host.getBoundingClientRect();
      if (
        Math.round(rect.width) === width &&
        Math.round(rect.height) === height
      ) {
        return;
      }
      init();
      sync();
    });
    observer.observe(host);

    return () => {
      // A button inside a Dialog that closes mid-dissolve unmounts here.
      cancelAnimationFrame(frame);
      frame = 0;
      observer.disconnect();
      for (const event of events) host.removeEventListener(event, sync);
    };
  }, [motionOk, gap, speed]);

  if (!motionOk) return null;

  return (
    <canvas
      ref={canvasRef}
      data-pixel-fill=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
    />
  );
}
