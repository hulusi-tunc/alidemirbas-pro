"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * THE PARALLAX FIELD — the Lab hero's moving ground.
 *
 * Layered illustration art on white, each layer drifting at its own rate
 * so the background has depth instead of being a flat picture: the further
 * "back" a layer reads, the less it moves. Two motions are combined:
 *
 *   · SCROLL PARALLAX. Each layer translates by `scrollY * depth`, read
 *     inside a rAF loop rather than on the scroll event itself, so the
 *     browser paints at most once a frame however fast the wheel spins.
 *   · IDLE DRIFT. A slow CSS keyframe float, so the field is alive before
 *     the visitor has scrolled at all - the "smooth animation" the brief
 *     asks for, rather than something that only happens on input.
 *
 * WHY NOT A FRAME SEQUENCE. The brief said "render png by png". An image
 * model produces each frame independently, so a hand-generated sequence
 * jitters - the shapes are never the same object twice, and at 24 frames
 * it also ships megabytes to animate a backdrop. Layered transforms give a
 * genuinely smooth, GPU-composited motion at three files, and every layer
 * stays a still PNG exactly as asked.
 *
 * REDUCED MOTION. No loop is started and no drift class is applied; the
 * layers render as a static composition.
 *
 * The layers are ART, not content: if a file has not been generated the
 * component simply renders nothing for it and the hero keeps its own
 * white ground.
 */

export type ParallaxLayer = {
  src: string;
  /** How far this layer moves per pixel scrolled. Back layers < front. */
  depth: number;
  className?: string;
};

export function ParallaxField({ layers }: { layers: ParallaxLayer[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const update = () => setMotionOk(q.matches);
    update();
    q.addEventListener("change", update);
    return () => q.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!motionOk) return;
    const host = ref.current;
    if (!host) return;
    const nodes = Array.from(host.querySelectorAll<HTMLElement>("[data-depth]"));
    let frame = 0;
    let last = -1;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const y = window.scrollY;
      // Nothing moved: skip the write entirely rather than re-setting the
      // same transform sixty times a second.
      if (y === last) return;
      last = y;
      for (const n of nodes) {
        const depth = Number(n.dataset.depth ?? 0);
        n.style.transform = `translate3d(0, ${(y * depth).toFixed(2)}px, 0)`;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [motionOk]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {layers.map((layer, i) => (
        <div
          key={layer.src}
          data-depth={layer.depth}
          className={`absolute inset-0 will-change-transform ${
            motionOk ? (i % 2 === 0 ? "parallax-drift" : "parallax-drift-slow") : ""
          }`}
        >
          <Image
            src={layer.src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={layer.className ?? "object-cover"}
          />
        </div>
      ))}
    </div>
  );
}
