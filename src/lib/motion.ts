import type { Transition } from "motion/react";

/**
 * Shared motion presets.
 *
 * One vocabulary for the whole site: a card lifting, a nav pill sliding and a
 * fanned card straightening should all settle with the same weight, otherwise
 * the page feels assembled from different products.
 *
 * `mass` is kept low and `damping` high — a premium B2B interface should feel
 * precise, not bouncy. No overshoot anywhere.
 */
export const springSnap: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.6,
};

export const springSoft: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
  mass: 0.8,
};
