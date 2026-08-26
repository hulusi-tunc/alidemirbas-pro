import type { ReactNode } from "react";

import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import { clsx } from "@/lib/clsx";

/* Layout primitives for Lab PRODUCT pages.

   Composition is modelled on peerbie.com/custom-workflow - section
   sequencing, scale changes, alternating text/visual rhythm, and
   sections where the product visual (not a text column) dominates the
   screen. The design LANGUAGE stays this project's own Portrait-derived
   system: PortraitContainer's 1280 measure, the h1/h2-fluid type ramp,
   ink/primary tokens, `Reveal`'s easing. Peerbie's palette and card
   styling are deliberately not copied.

   PILOT SCOPE: introduced for /lab/ab-testing only. They are written
   generically because the brief expects to reuse them across the other
   Lab products once this page is approved visually - but nothing else
   consumes them yet, so nothing else can regress from a change here. */

/* --- Section shell ---------------------------------------------------
   Deliberately NOT ui/Section.tsx: that component's three fixed padding
   steps are what produce the "every section is the same height" rhythm
   this redesign exists to break. `space` here runs from a thin band
   (the scale strip) to the page's single largest moment (the library),
   which is the pacing table in PRODUCT-VISUAL-ASSET-PLAN.md §5. */
export function ProductSection({
  children,
  tone = "paper",
  space = "lg",
  className,
  id,
}: {
  children: ReactNode;
  tone?: "paper" | "soft" | "ink" | "tint";
  space?: "band" | "md" | "lg" | "xl";
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={clsx(
        "relative",
        {
          "bg-paper text-ink-900": tone === "paper",
          "bg-paper-soft text-ink-900": tone === "soft",
          "bg-ink-950 text-white": tone === "ink",
          // The library canvas: a tint, not a third surface colour - it
          // reads as the page's own paper with the brand behind it.
          "bg-primary-50/40 text-ink-900": tone === "tint",
        },
        {
          "py-10 md:py-12": space === "band",
          "py-16 md:py-24": space === "md",
          "py-20 md:py-32": space === "lg",
          "py-24 md:py-44": space === "xl",
        },
        className,
      )}
    >
      {children}
    </section>
  );
}

/* --- Section heading -------------------------------------------------
   Uses the Portrait h2-fluid token, so product-page headings and the
   rest of the site share one type ramp. */
export function ProductHeading({
  eyebrow,
  title,
  body,
  align = "start",
  tone = "dark",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "start" | "center";
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <Reveal className={clsx(align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={clsx("altor-eyebrow mb-4", tone === "light" ? "text-white/45" : "text-ink-400")}>
          {eyebrow}
        </p>
      )}
      <h2
        className={clsx(
          "text-h2-fluid font-medium",
          align === "center" ? "mx-auto max-w-3xl" : "max-w-2xl",
          tone === "light" ? "text-white" : "text-ink-950",
        )}
      >
        {title}
      </h2>
      {body && (
        <p
          className={clsx(
            "mt-4 text-lg leading-relaxed",
            align === "center" ? "mx-auto max-w-2xl" : "max-w-xl",
            tone === "light" ? "text-white/70" : "text-ink-950/65",
          )}
        >
          {body}
        </p>
      )}
    </Reveal>
  );
}

/* --- Benefit story ---------------------------------------------------
   The page's rhythm device: text on one side, a LARGE product visual on
   the other, with the sides alternating down the page. The visual column
   is the wider one - the brief's "the product dominates" rule. On mobile
   the text always comes first regardless of desktop side. */
export function ProductBenefitStory({
  eyebrow,
  title,
  body,
  visual,
  side = "right",
  aside,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  visual: ReactNode;
  /** Which side the VISUAL sits on at lg+. */
  side?: "left" | "right";
  aside?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
      <div className={clsx(side === "left" && "lg:order-2")}>
        <ProductHeading eyebrow={eyebrow} title={title} body={body} />
        {aside && (
          <Reveal delay={90} className="mt-7">
            {aside}
          </Reveal>
        )}
      </div>
      <Reveal delay={80} className={clsx("min-w-0", side === "left" && "lg:order-1")}>
        {visual}
      </Reveal>
    </div>
  );
}

/* --- Metric strip ----------------------------------------------------
   The page's low-density breath, right after the hero. Large numerals
   on the Portrait display ramp, no counters, no animation. */
export function ProductMetricStrip({
  items,
}: {
  items: readonly { value: string; label: string }[];
}) {
  return (
    <PortraitContainer>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4">
        {items.map((m, i) => (
          <Reveal key={m.label} delay={i * 60}>
            <dt className="sr-only">{m.label}</dt>
            <dd>
              <span className="block text-[clamp(2rem,1.4rem+2.2vw,3rem)] leading-none font-semibold tracking-tight text-ink-950 tabular-nums">
                {m.value}
              </span>
              <span className="mt-2.5 block text-sm text-ink-500">{m.label}</span>
            </dd>
          </Reveal>
        ))}
      </dl>
    </PortraitContainer>
  );
}

/* --- How-it-works ----------------------------------------------------
   Three numbered steps, each with its own miniature product visual.
   Desktop: 3 columns with the visuals sharing a baseline (items-stretch
   + h-full inside each visual). Mobile: a vertical 01 -> 02 -> 03
   sequence at full width, so nothing is shrunk to unreadability. */
export function ProductHowItWorks({
  steps,
}: {
  steps: readonly { title: string; body: string; visual: ReactNode }[];
}) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-10 md:grid-cols-3 md:gap-8">
      {steps.map((s, i) => (
        <Reveal key={s.title} delay={i * 90} className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-ink-400 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span aria-hidden className="h-px flex-1 bg-line" />
          </div>
          <h3 className="mt-4 text-lg font-medium tracking-tight text-ink-950">{s.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-950/65">{s.body}</p>
          <div className="mt-6 flex-1">{s.visual}</div>
        </Reveal>
      ))}
    </div>
  );
}
