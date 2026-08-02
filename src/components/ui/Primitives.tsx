import type { CSSProperties, ReactNode } from "react";

import { clsx } from "@/lib/clsx";

/**
 * The reference's layout primitives, ported for the hero.
 *
 * These are NEW names, not replacements. `.altor-container` stays exactly where
 * it is and every existing route keeps using it — see the note on `Container`
 * below for why the hero cannot.
 */

/* ------------------------------------------------------------------ layout */

/**
 * The reference's page container: 1400px, gutters 20 / 32 / 48.
 *
 * NOT `.altor-container`, and the difference is deliberate. This codebase's
 * container is 78rem/1248px with 20/32/40px gutters; the reference's is
 * 87.5rem/1400px with 20/32/48px. The hero artwork's scale ladder (`.hero-art`
 * in globals.css) is derived from the 1400px measure — its ceiling of 0.749 is
 * a 652px column over an 870px stage — so the artwork and the container have to
 * be ported together or the artwork falls short of its column at every step.
 *
 * The visible consequence is that the hero band runs ~150px wider than the
 * sections beneath it. That is the reference's own proportion; unifying the two
 * measures is a whole-site decision, not a hero one.
 */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}

const RULES = [0, 1, 2, 3, 4];

/**
 * The site's grid, drawn. Five vertical rules on the `Container` measure —
 * outer two on its edges, inner three splitting it in four. Geometry and
 * layering are documented in globals.css under § EDITORIAL GRID.
 *
 * `scope="band"` is the repair for sections that paint their own opaque ground:
 * drop it in as a direct child of the `relative` section, after the background
 * and before the content, and pair it with `tone="invert"` on dark ones. That
 * is the only scope the hero needs.
 *
 * `scope="page"` is the reference's document-wide layer, mounted once in the
 * root layout at a negative z-index. It is kept in the API — the prop and its
 * classes are here — but nothing mounts it yet: making the grid run through the
 * whole site is a decision beyond this section, and the day it is taken the
 * only change is one line in the root layout.
 */
export function EditorialGrid({
  scope = "page",
  tone = "ink",
  className,
}: {
  scope?: "page" | "band";
  tone?: "ink" | "invert";
  className?: string;
}) {
  const rule = tone === "invert" ? "bg-grid-rule-inverse" : "bg-grid-rule";

  return (
    <div
      aria-hidden
      className={clsx(
        "editorial-grid",
        scope === "page" ? "fixed inset-0 z-[-1]" : "absolute inset-0",
        className,
      )}
    >
      <div className="container-page h-full">
        {/* The inner box is the container's *content* width — absolute children
            resolve against the padding box, so positioning the rules directly
            on `container-page` would put the outer two in the gutters. */}
        <div className="relative h-full">
          {RULES.map((index) => (
            <span
              key={index}
              className={clsx("editorial-grid-rule", rule)}
              style={{ "--rule": index } as CSSProperties}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ section badge */

/**
 * The label that names a section — a compact uppercase badge, one per section
 * heading, and the only thing that plays this role.
 *
 * No tone prop, and deliberately so: the light and dark colourways are selected
 * by `[data-tone="dark"]` on the enclosing section, which re-points three
 * inherited custom properties. A badge nested at any depth under a dark section
 * flips by itself, and the call site reads the same on both grounds — which is
 * the difference between "adapts to its background" and "is told what its
 * background is". Geometry and both colourways are under § SECTION BADGE in
 * globals.css; the plate takes the scale's 8px step, exactly as the reference
 * draws it.
 */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    /* A span, not a p: it may sit inside a `<legend>`, which takes phrasing
       content only. The utility makes it block-level anyway. */
    <span className="section-badge">{children}</span>
  );
}
