"use client";

import { useMemo, useState } from "react";
import { CalcPanel, PanelLabel, PrimaryResult, ResultHint, SecondaryResults } from "@/components/ui/CalcPanel";
import type { RuntimeCalcSpec } from "@/lib/calc-catalog";
import { getCompute } from "@/lib/calc-registry";
import { formatByUnit } from "@/lib/calc-format";
import type { Lang } from "@/lib/content";

/* One-off, slider-driven UI for a single calculator (break-even-point),
   after a user-supplied reference (convertsite.com's ROI calculator) -
   live range sliders instead of number fields, one large headline
   result plus secondary stat tiles in a dark panel, updating on every
   drag with no submit button.

   Deliberately scoped to this one calculator, not merged into the
   shared CalculatorTool.tsx: that component drives every other live
   calculator via a generic, spec-shaped renderer, and this page's own
   brief was "for one example" - retrofitting sliders onto every field
   type (enums, funnel stages, arbitrary-range currency figures with no
   natural bound) is a separate, much larger design decision the user
   hasn't asked for yet. CalculatorRoutes.tsx special-cases this one
   slug to render this component instead of CalculatorTool.

   It shares the CalcPanel shell with the other two tools, so a reader
   moving between calculator pages sees one interface with a different
   input control, not a different page.

   REAL FORMULA, NOT REINVENTED: `getCompute("break-even-point")` is the
   exact same function every other rendering of this calculator (and
   its own FAQ/related-calculator content) uses - only the input/output
   chrome around it is new. Slider bounds/defaults below are new (the
   catalog itself has no min/max, only a `>0`/`< pricePerUnit`
   relationship) but the defaults are the catalog's own real
   `exampleInput`, not arbitrary picks. */

const BOUNDS = {
  fixedCosts: { min: 0, max: 200_000, step: 1_000 },
  pricePerUnit: { min: 1, max: 500, step: 1 },
  variableCostPerUnit: { min: 0, max: 499, step: 1 },
} as const;

const T = {
  en: {
    exploreMore: "Explore more calculators",
    noBreakEven: "At this price and cost, there's no break-even point - variable cost per unit must be lower than price per unit.",
  },
  tr: {
    exploreMore: "Daha fazla hesaplayıcı keşfet",
    noBreakEven: "Bu fiyat ve maliyetle bir başabaş noktası yok - birim değişken maliyet, birim fiyattan düşük olmalı.",
  },
} as const;

function Slider({
  label, value, min, max, step, unit, onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: "currency" | "count";
  onChange: (v: number) => void;
}) {
  const display = unit === "currency" ? `$${value.toLocaleString()}` : value.toLocaleString();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <span className="text-sm font-medium text-ink-950">{label}</span>
      <p className="mt-1 text-xl font-medium text-ink-950 tabular-nums">{display}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-600 [&::-webkit-slider-thumb]:bg-paper [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-600 [&::-moz-range-thumb]:bg-paper"
        style={{ background: `linear-gradient(to right, var(--color-primary-600) ${pct}%, var(--color-line) ${pct}%)` }}
      />
      <div className="mt-1.5 flex justify-between text-xs tabular-nums text-ink-950/40">
        <span>{unit === "currency" ? `$${min.toLocaleString()}` : min.toLocaleString()}</span>
        <span>{unit === "currency" ? `$${max.toLocaleString()}` : max.toLocaleString()}</span>
      </div>
    </div>
  );
}

export function BreakEvenSliderTool({ spec, lang }: { spec: RuntimeCalcSpec; lang: Lang }) {
  const t = T[lang];
  const byKey = new Map(spec.inputs.map((i) => [i.key, i]));
  const outByKey = new Map(spec.outputs.map((o) => [o.key, o]));
  const example = spec.exampleInput as Record<string, number>;

  const [fixedCosts, setFixedCosts] = useState(example.fixedCosts ?? 50_000);
  const [pricePerUnit, setPricePerUnit] = useState(example.pricePerUnit ?? 100);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(example.variableCostPerUnit ?? 40);

  const compute = useMemo(() => getCompute(spec.slug), [spec.slug]);
  const results = compute?.({ fixedCosts, pricePerUnit, variableCostPerUnit }) as Record<string, number> | undefined;
  const valid = results && Number.isFinite(results.breakEvenUnits);

  // The slider can't be dragged past its own max, but pricePerUnit
  // itself moves - clamp variableCostPerUnit down live so the two
  // sliders never silently disagree with the real validation rule
  // (variableCostPerUnit < pricePerUnit) the catalog documents.
  const vcMax = Math.max(pricePerUnit - 1, 0);
  const clampedVariableCost = Math.min(variableCostPerUnit, vcMax);

  return (
    <CalcPanel
      split="input-heavy"
      inputs={
        <>
          <PanelLabel>{lang === "en" ? "Inputs" : "Girdiler"}</PanelLabel>
          <div className="mt-4 flex flex-col gap-4">
            <Slider
              label={byKey.get("fixedCosts")?.label ?? "Fixed costs"}
              value={fixedCosts}
              min={BOUNDS.fixedCosts.min}
              max={BOUNDS.fixedCosts.max}
              step={BOUNDS.fixedCosts.step}
              unit="currency"
              onChange={setFixedCosts}
            />
            <Slider
              label={byKey.get("pricePerUnit")?.label ?? "Price per unit"}
              value={pricePerUnit}
              min={BOUNDS.pricePerUnit.min}
              max={BOUNDS.pricePerUnit.max}
              step={BOUNDS.pricePerUnit.step}
              unit="currency"
              onChange={setPricePerUnit}
            />
            <Slider
              label={byKey.get("variableCostPerUnit")?.label ?? "Variable cost per unit"}
              value={clampedVariableCost}
              min={BOUNDS.variableCostPerUnit.min}
              max={vcMax}
              step={BOUNDS.variableCostPerUnit.step}
              unit="currency"
              onChange={setVariableCostPerUnit}
            />
          </div>
        </>
      }
      results={
        <div aria-live="polite">
          <PrimaryResult
            label={outByKey.get("breakEvenUnits")?.label ?? "Break-Even Units"}
            value={valid ? formatByUnit(results.breakEvenUnits, "count") : ""}
            ready={Boolean(valid)}
          />
          <SecondaryResults
            items={[
              {
                key: "breakEvenCac",
                label: outByKey.get("breakEvenCac")?.label ?? "Break-Even CAC",
                value: valid ? formatByUnit(results.breakEvenCac, "currency") : "",
                ready: Boolean(valid),
              },
              {
                key: "breakEvenRoas",
                label: outByKey.get("breakEvenRoas")?.label ?? "Break-Even ROAS",
                value: valid ? formatByUnit(results.breakEvenRoas, "x (multiplier)") : "",
                ready: Boolean(valid),
              },
            ]}
          />
          {/* Not an empty state: at variable cost >= price there is no
              break-even volume at all, which is a real answer the sliders
              can reach and worth saying in words. */}
          {!valid && <ResultHint>{t.noBreakEven}</ResultHint>}
        </div>
      }
    />
  );
}
