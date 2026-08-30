"use client";

import { useState, type ReactNode } from "react";

import { PixelBurst } from "./PixelField";

/* The calculator interface shell, shared by all three tools (the generic
   CalculatorTool and the two bespoke ones). Inputs on the left, the primary
   result large on the right.

   Split into a shell plus small parts rather than one component that takes
   the whole calculator as data, because the three tools genuinely differ
   inside: one renders scalar fields, one renders a repeatable stage list,
   one renders ten optional fields in four groups. What they share is the
   frame, the two panel headings, and how a result is set - and that is
   exactly what lives here.

   It has to survive a wide range: one input or ten, one result or eight.
   The left column simply stacks whatever it is given; the right column
   states one primary result at display size and lists any others beneath
   it, because "the number you came for" is a real distinction on every
   calculator here that returns more than one (NRR's own rate over GRR,
   break-even units over the CAC ceiling and ROAS floor it implies). */

export function CalcPanel({
  inputs,
  results,
  /** Ratio of the two columns at md and up. The default suits a handful of
      scalar inputs beside one big number; a tool with a lot of input
      (the composite email calculator, the funnel's stage list) gives the
      left column more room instead. */
  split = "even",
  /** Bumped by the tool when a result first computes; fires one pixel
      wavefront across the answer plate (PixelBurst). 0 = never fired. */
  answerPulse = 0,
  /** A single glyph (%, ×, $) set giant at low opacity, bleeding off the
      plate's bottom-right corner - the unit as typographic brand mass. */
  plateWatermark,
  /** One quiet mono line pinned to the plate's bottom edge - the formula. */
  plateFootnote,
}: {
  inputs: ReactNode;
  results: ReactNode;
  split?: "even" | "input-heavy";
  answerPulse?: number;
  plateWatermark?: string;
  plateFootnote?: ReactNode;
}) {
  return (
    // No stroke and no radius: the white inputs half and the brand plate
    // draw the card's shape themselves, square-edged like the site's
    // buttons and blocks (a hairline and rounded corners were both
    // reviewed here and removed).
    <div className="overflow-hidden bg-paper">
      {/* min-height so a two-field calculator still gets a card with real
          presence - the working surface is the page's anchor and a stubby
          strip doesn't read as one. Bigger tools grow past it naturally. */}
      <div
        className={`grid md:min-h-[380px] ${
          split === "input-heavy" ? "md:grid-cols-[3fr_2fr]" : "md:grid-cols-2"
        }`}
      >
        {/* Flex column so a tool can pin its submit control to the panel's
            bottom edge (CalculatorTool's Calculate button does). */}
        <div className="flex flex-col border-b border-line p-6 md:border-r md:border-b-0 md:p-8">{inputs}</div>
        {/* The answer surface IS the primary button's plate: the same
            primary-600 ground, and the burst sweeps in the same
            neutral-900 the button's hover dissolve fills with - the plate
            answers your numbers the way the button answers your pointer.
            Clean at rest: three ambient pixel textures were tried here and
            every one read as noise behind the number. */}
        <div className="relative isolate flex overflow-hidden bg-primary-600 p-6 md:p-8">
          <PixelBurst pulse={answerPulse} />
          {plateWatermark && (
            <span
              aria-hidden
              className="pointer-events-none absolute -right-8 -bottom-20 hidden font-semibold tracking-tight text-white/10 select-none md:block md:text-[17rem] md:leading-none"
            >
              {plateWatermark}
            </span>
          )}
          {/* Top-aligned (centering was tried and pulled back on review):
              the answer leads the plate, the watermark and footnote hold
              the ground beneath it. */}
          <div className="relative w-full">{results}</div>
          {plateFootnote && (
            <p className="pointer-events-none absolute bottom-5 left-6 font-mono text-[12px] text-white/50 md:left-8">
              {plateFootnote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** The label at the top of a panel. Plain case at a readable size - the
    mono-uppercase micro-label this used to be was rejected in review
    ("uppercase + small" reads as lock-up, not as a label). */
export function PanelLabel({ children }: { children: ReactNode }) {
  return <p className="text-[13px] font-medium text-white/70">{children}</p>;
}

/* The primary result: the one number the calculator exists to produce.
   Rendered at display size in the accent, with its own label above it -
   the label is the unit ("DAYS", "ROAS"), so the number needs no second
   caption. Falls back to an em dash rather than a zero or a spinner when
   there is nothing to show yet: a dash reads as "not answered", a zero
   reads as an answer. */
export function PrimaryResult({
  label,
  value,
  ready,
}: {
  label: string;
  value: string;
  ready: boolean;
}) {
  /* The reveal runs on the not-ready → ready transition and only then: the
     arrival counter keys the element, so a NEW answer resolving out of a
     blur remounts and animates, while live edits to an already-standing
     answer (a slider mid-drag, a digit being appended) just update text.
     Derived DURING render (the setState-in-render pattern) so the very
     first ready paint already carries the new key - an effect would paint
     one unanimated frame first and the reveal would visibly restart.
     `.calc-reveal` lives in globals.css beside the other keyframes. */
  const [wasReady, setWasReady] = useState(ready);
  const [arrival, setArrival] = useState(0);
  if (ready !== wasReady) {
    setWasReady(ready);
    if (ready) setArrival((a) => a + 1);
  }

  return (
    <div>
      <PanelLabel>{label}</PanelLabel>
      <p
        key={arrival}
        className={`mt-2 font-semibold tracking-[-0.03em] tabular-nums ${
          ready ? "calc-reveal text-white" : "text-white/30"
        } text-[clamp(3rem,1.9rem+4.4vw,4.75rem)] leading-[1.02]`}
      >
        {ready ? value : "—"}
      </p>
    </div>
  );
}

/** Any result after the first: present, readable, and clearly secondary. */
export function SecondaryResults({
  items,
}: {
  items: readonly { key: string; label: string; value: string; ready: boolean }[];
}) {
  if (items.length === 0) return null;
  return (
    <dl className="mt-6 flex flex-col gap-2.5 border-t border-white/15 pt-5">
      {items.map((r) => (
        <div key={r.key} className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-white/70">{r.label}</dt>
          <dd
            className={`font-mono text-sm font-medium tabular-nums ${
              r.ready ? "text-white" : "text-white/30"
            }`}
          >
            {r.ready ? r.value : "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Shown in the results panel before anything is entered. */
export function ResultHint({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[13px] leading-snug text-white/60">{children}</p>;
}
