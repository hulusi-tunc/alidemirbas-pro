"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { springSnap } from "@/lib/motion";

/**
 * Spring lift on hover, for cards whose content is rendered on the server.
 *
 * Only `y` and `scale` are animated — both GPU-composited. The shadow change
 * stays in CSS on the card itself: animating `box-shadow` repaints on every
 * frame, and the two run close enough together to read as one gesture.
 */
export function HoverLift({
  children,
  className,
  distance = 4,
  scale = 1,
}: {
  children: ReactNode;
  className?: string;
  /** Pixels lifted on hover. */
  distance?: number;
  scale?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={reduceMotion ? undefined : { y: -distance, scale }}
      transition={springSnap}
    >
      {children}
    </motion.div>
  );
}
