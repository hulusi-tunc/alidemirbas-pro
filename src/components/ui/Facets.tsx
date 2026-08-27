"use client";

import type { ReactNode } from "react";

/* Faceted filter controls.

   FacetRadio is a circle because you get exactly one of a small set - used by
   the A/B test browser's surface filter. The Journey Library used to have a
   FacetCheckbox/FacetGroup pair here too (a square checkbox for a
   multi-select facet, a collapsible group for a long list), but Goal moved
   to a single-select control after the goal vocabulary audit - see
   JourneyBrowser.tsx - and Category was never a facet-checkbox filter to
   begin with, so both are gone rather than kept unused. */

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

