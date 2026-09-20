import Image from "next/image";
import type { ReactNode } from "react";

import { LabProjectIcon, labAccent } from "@/components/ui/LabProjectIdentity";
import { clsx } from "@/lib/clsx";
import { copy, type Lang } from "@/lib/content";

/* THE PRODUCT PAGES' FRAME (2026-09-06, Hulusi: "check the sub lab pages
   and improve them based on the work we've done on the main lab page, and
   don't forget to use images in frames - but apply some colour overlay
   to differentiate each of them").

   The same plate the index uses (`.lab-frame` in globals.css: the hue's
   gradient, the SVG grain; the project's photograph from
   public/lab/frames/<slug>.jpg anchored at the bottom) - plus a COLOUR
   WASH in the project's own hue laid over the photograph with
   `mix-blend-mode: color`, so the six pages read as six tones of one
   family: violet, blue, rose, emerald, amber, teal. The product window
   sits on top with the frame's own padding. Every class string is
   literal - Tailwind cannot see a tint composed at runtime. */

const WASH: Record<string, string> = {
  violet: "bg-violet-500",
  primary: "bg-primary-500",
  rose: "bg-rose-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-400",
  teal: "bg-teal-500",
  neutral: "bg-ink-400",
};

export function ProductFrame({
  slug,
  plate,
  inset = "md",
  wash = true,
  clip = true,
  className,
  children,
}: {
  slug: string;
  /** A different photograph from the project's default (the builder has
      three: `claude-lifecycle-0/1/2`). */
  plate?: string;
  inset?: "none" | "sm" | "md";
  /** `false` shows the photograph as it is - no hue wash, no tinted
      ground under it (the A/B detail page, 2026-09-20: "not red, no
      colour overlay"). The grain stays. */
  wash?: boolean;
  /** `false` lets children spill past the plate's edge (the A/B detail's
      screens grow on hover); the photograph and the wash are clipped to
      the corner on their own layer instead of by the plate. */
  clip?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const accent = labAccent(slug);
  return (
    <div data-hue={wash ? accent.hue : undefined} className={clsx("lab-frame relative isolate rounded-[28px]", clip ? "overflow-hidden" : "", className)}>
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
        <Image
          src={`/lab/frames/${plate ?? slug}.jpg`}
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 1280px) 1120px, 100vw"
          className={clsx("origin-bottom scale-[1.3] object-cover object-bottom", wash ? "opacity-80" : "opacity-100")}
        />
        {/* The wash: the hue over the photograph, luminosity from the photo,
            colour from the project. Later in DOM than the image, same
            layer, so it paints over the image and under the grain. */}
        {wash ? <div className={clsx("absolute inset-0 opacity-70 mix-blend-color", WASH[accent.hue] ?? WASH.neutral)} /> : null}
      </div>
      <div className={clsx("relative", inset === "md" ? "p-4 sm:p-8 md:p-10" : inset === "sm" ? "p-3 sm:p-5 md:p-6" : "")}>{children}</div>
    </div>
  );
}

/** The project's mark as a hero eyebrow - the same glyph and hue the index,
    the header menu and the phone menu use for it, in place of the mono
    micro-label the product pages used to open with. */
export function ProductMark({ slug, lang, className }: { slug: string; lang: Lang; className?: string }) {
  const accent = labAccent(slug);
  const project = copy[lang].lab.projects.find((p) => p.slug === slug);
  if (!project) return null;
  return (
    <p className={clsx("flex items-center justify-center gap-2.5 text-[13px] font-medium", accent.ink, className)}>
      <span className={clsx("grid size-8 shrink-0 place-items-center rounded-md", accent.tile)}>
        <LabProjectIcon slug={slug} className="size-4" />
      </span>
      {project.short}
    </p>
  );
}
