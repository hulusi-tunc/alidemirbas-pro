"use client";

import { useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

/* Faceted filter controls for the journey archive.

   Two kinds of control, and the shape says which is which before you read the
   label: a radio is a circle because you get exactly one, a checkbox is a
   square because you can take several. That is the only place round corners
   appear in this design - `rounded-full` on a real circle - so the square
   checkbox is not a stylistic choice, it is the system's default and the
   circle is the exception.

   Counts are faceted, not totals: each option shows how many journeys you
   would get if you picked it *given everything else already selected*. A
   zero-count option is disabled rather than hidden, so the list does not jump
   around as you filter. */

function Count({ n }: { n: number }) {
  return <span className="text-ink-400 tabular-nums">({n})</span>;
}

function Row({
  children, selected, disabled, onSelect, indicator,
}: {
  children: ReactNode;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  indicator: ReactNode;
}) {
  return (
    <label
      className={`group flex items-center gap-2.5 py-[7px] text-sm ${
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={selected}
        disabled={disabled}
        onChange={onSelect}
      />
      <span
        aria-hidden
        className="shrink-0 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600"
      >
        {indicator}
      </span>
      <span className={selected ? "font-medium text-ink-950" : "text-ink-700 group-hover:text-ink-950"}>
        {children}
      </span>
    </label>
  );
}

export function FacetRadio({
  label, count, selected, onSelect,
}: { label: string; count: number; selected: boolean; onSelect: () => void }) {
  return (
    <Row
      selected={selected}
      disabled={count === 0 && !selected}
      onSelect={onSelect}
      indicator={
        <span
          className={`grid size-[18px] place-items-center rounded-full border-2 transition-colors ${
            selected ? "border-blue-600 bg-blue-600" : "border-line-strong group-hover:border-neutral-400"
          }`}
        >
          {selected ? <span className="size-1.5 rounded-full bg-white" /> : null}
        </span>
      }
    >
      {label} <Count n={count} />
    </Row>
  );
}

export function FacetCheckbox({
  label, count, selected, onSelect, dot,
}: { label: string; count: number; selected: boolean; onSelect: () => void; dot?: string }) {
  return (
    <Row
      selected={selected}
      disabled={count === 0 && !selected}
      onSelect={onSelect}
      indicator={
        <span
          className={`grid size-[18px] place-items-center border-2 transition-colors ${
            selected ? "border-blue-600 bg-blue-600" : "border-line-strong group-hover:border-neutral-400"
          }`}
        >
          {selected ? <Check className="size-3 text-white" strokeWidth={3} /> : null}
        </span>
      }
    >
      {dot ? <span aria-hidden className={`mr-1.5 inline-block size-1.5 rounded-full align-middle ${dot}`} /> : null}
      {label} <Count n={count} />
    </Row>
  );
}

/** A titled group. `initialVisible` collapses a long list behind a disclosure
    rather than making the sidebar scroll - the shorter groups never show the
    control at all. */
export function FacetGroup({
  title, children, initialVisible, moreLabel, lessLabel,
}: {
  title: string;
  children: ReactNode[];
  initialVisible?: number;
  moreLabel: string;
  lessLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const collapsible = initialVisible != null && children.length > initialVisible;
  const shown = collapsible && !expanded ? children.slice(0, initialVisible) : children;

  return (
    <div>
      <p className="text-sm font-semibold tracking-tight text-ink-950">{title}</p>
      <div className="mt-2.5">{shown}</div>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="mt-1 flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          <ChevronDown
            aria-hidden
            className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? lessLabel : moreLabel}
        </button>
      ) : null}
    </div>
  );
}
