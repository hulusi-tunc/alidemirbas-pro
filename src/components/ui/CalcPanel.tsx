import type { ReactNode } from "react";

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
}: {
  inputs: ReactNode;
  results: ReactNode;
  split?: "even" | "input-heavy";
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-paper">
      <div
        className={`grid ${
          split === "input-heavy" ? "md:grid-cols-[3fr_2fr]" : "md:grid-cols-2"
        }`}
      >
        <div className="border-b border-line p-6 md:border-r md:border-b-0 md:p-7">{inputs}</div>
        {/* Tinted, so the answer reads as a distinct surface from the form
            that produced it without needing a heavier border or a shadow. */}
        <div className="bg-paper-soft p-6 md:p-7">{results}</div>
      </div>
    </div>
  );
}

/** The small uppercase label at the top of either panel. */
export function PanelLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] tracking-[0.12em] text-ink-400 uppercase">{children}</p>
  );
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
  return (
    <div>
      <PanelLabel>{label}</PanelLabel>
      <p
        className={`mt-2 font-semibold tracking-[-0.03em] tabular-nums ${
          ready ? "text-blue-700" : "text-ink-200"
        } text-[clamp(2.5rem,1.6rem+3.4vw,3.5rem)] leading-[1.05]`}
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
    <dl className="mt-6 flex flex-col gap-2.5 border-t border-line pt-5">
      {items.map((r) => (
        <div key={r.key} className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-ink-600">{r.label}</dt>
          <dd
            className={`font-mono text-sm font-medium tabular-nums ${
              r.ready ? "text-ink-950" : "text-ink-300"
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
  return <p className="mt-4 text-[13px] leading-snug text-ink-400">{children}</p>;
}
