"use client";

import { useState } from "react";
import { CALCULATORS, type Lang } from "@/lib/calculators";

/* Takes a slug, not the calculator object - a server component cannot pass
   `compute` (a function) as a prop to a client component, so the lookup
   happens here, client-side, against the same config module. */
export default function CalculatorTool({ slug, lang }: { slug: string; lang: Lang }) {
  const calc = CALCULATORS.find((c) => c.slug === slug);
  const [values, setValues] = useState<Record<string, string>>({});
  if (!calc) return null;

  const nums: Record<string, number> = {};
  for (const input of calc.inputs) nums[input.key] = parseFloat(values[input.key] ?? "");
  const ready = calc.inputs.every((i) => Number.isFinite(nums[i.key]));
  const results = ready ? calc.compute(nums) : null;

  return (
    <div className="rounded-lg border border-line bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {calc.inputs.map((input) => (
          <label key={input.key} className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink-900">{input.label[lang]}</span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={values[input.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [input.key]: e.target.value }))}
              className="rounded-md border border-line px-3 py-2 text-ink-950 outline-none focus:border-ink-900"
              placeholder={input.placeholder}
            />
          </label>
        ))}
      </div>

      <div className="mt-6 border-t border-line pt-6">
        {results ? (
          <div className="flex flex-col gap-3">
            {results.map((r) => (
              <div key={r.label.en} className="flex items-baseline justify-between gap-4">
                <span className="text-sm text-neutral-600">{r.label[lang]}</span>
                <span className="font-mono text-lg font-semibold text-ink-950 tabular-nums">
                  {r.value}
                  {r.unit ? ` ${r.unit}` : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">
            {lang === "en" ? "Fill in every field to see the result." : "Sonucu görmek için tüm alanları doldurun."}
          </p>
        )}
      </div>
    </div>
  );
}
