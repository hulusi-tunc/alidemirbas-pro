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
  className,
  children,
}: {
  slug: string;
  /** A different photograph from the project's default (the builder has
      three: `claude-lifecycle-0/1/2`). */
  plate?: string;
  inset?: "none" | "sm" | "md";
  className?: string;
  children: ReactNode;
}) {
  const accent = labAccent(slug);
  return (
    <div data-hue={accent.hue} className={clsx("lab-frame relative isolate overflow-hidden rounded-[28px]", className)}>
      <Image
        src={`/lab/frames/${plate ?? slug}.jpg`}
        alt=""
        aria-hidden
        fill
        sizes="(min-width: 1280px) 1120px, 100vw"
        className="-z-10 origin-bottom scale-[1.3] object-cover object-bottom opacity-80"
      />
      {/* The wash: the hue over the photograph, luminosity from the photo,
          colour from the project. Later in DOM than the image, same
          negative layer, so it paints over the image and under the grain. */}
      <div aria-hidden className={clsx("absolute inset-0 -z-10 opacity-70 mix-blend-color", WASH[accent.hue] ?? WASH.neutral)} />
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
