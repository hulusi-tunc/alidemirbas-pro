"use client";

import { useId, useMemo, useState } from "react";
import { PRIMARY_OUTPUT, type RuntimeCalcSpec } from "@/lib/calc-catalog";
import { getCompute } from "@/lib/calc-registry";
import { validateInputs, errorMessage } from "@/lib/calc-validate";
import { formatByUnit, isEnumUnit, parseEnumOptions } from "@/lib/calc-format";
import { CalcPanel, PanelLabel, PrimaryResult, ResultHint, SecondaryResults } from "@/components/ui/CalcPanel";
import type { Lang } from "@/lib/content";

type Stage = { label: string; count: string };

/* Generic, spec-driven calculator renderer. Server components never pass
   this component a function - it receives a plain-data RuntimeCalcSpec
   (built by calc-catalog.ts's toRuntimeSpec) and looks up its own compute
   function client-side from calc-registry.ts by slug, the same pattern
   the pre-Phase-2 version of this file already used and that this phase
   keeps for the same reason (a Server Component cannot pass a function as
   a Client Component prop).

   The shell is CalcPanel (ui/CalcPanel.tsx): inputs on the left, the
   primary result large on the right. Shared with the two bespoke tools
   (BreakEvenSliderTool, EmailPerformanceTool) so all three read as one
   design rather than three, and it adapts to what a calculator actually
   has - one input or ten, one result or eight. The formula used to render
   inside this card (FormulaBlock/ExampleBlock, deleted with this change);
   it now belongs to the page template's worked-example strip and its
   "What this number means" section. */
export default function CalculatorTool({ spec, lang }: { spec: RuntimeCalcSpec; lang: Lang }) {
  const hasModes = Boolean(spec.modes && spec.modes.length);
  const [modeId, setModeId] = useState(hasModes ? spec.modes![0].id : undefined);
  const activeMode = hasModes ? spec.modes!.find((m) => m.id === modeId)! : undefined;
  const inputs = activeMode ? activeMode.inputs : spec.inputs;
  const outputs = activeMode ? activeMode.outputs : spec.outputs;

  const isFunnel = inputs.some((i) => i.key === "stages");
  const [raw, setRaw] = useState<Record<string, string>>({});
  const [stages, setStages] = useState<Stage[]>([
    { label: "", count: "" },
    { label: "", count: "" },
  ]);

  const compute = useMemo(() => getCompute(spec.slug), [spec.slug]);

  let results: Record<string, unknown> | null = null;
  let errors: Record<string, string> = {};

  if (isFunnel) {
    const filled = stages.filter((s) => s.label.trim() && s.count.trim() && Number.isFinite(Number(s.count)));
    if (filled.length >= 2 && compute) {
      results = compute({ stages: filled.map((s) => ({ label: s.label, count: Number(s.count) })) });
    }
  } else {
    const v = validateInputs(inputs, raw, spec.slug);
    if (v.ok && compute) {
      results = compute(v.values);
    } else if (!v.ok && Object.keys(raw).length > 0) {
      errors = Object.fromEntries(Object.entries(v.errors).map(([k, e]) => [k, errorMessage(e, lang)]));
    }
  }

  /* The headline result, and everything else in the order the catalog
     declares it. Almost always outputs[0]; PRIMARY_OUTPUT names the one
     calculator whose first output is a step in the derivation rather than
     the answer (see that map's own note). */
  const primaryKey = PRIMARY_OUTPUT[spec.slug];
  const primary = (primaryKey && outputs.find((o) => o.key === primaryKey)) || outputs[0];
  const rest = outputs.filter((o) => o.key !== primary.key);

  return (
    <CalcPanel
      // The funnel's stage list is a form that grows; give it the room.
      split={isFunnel || inputs.length > 4 ? "input-heavy" : "even"}
      inputs={
        <>
          <PanelLabel>{lang === "en" ? "Inputs" : "Girdiler"}</PanelLabel>

          {hasModes && (
            <fieldset className="mt-4 border-0 p-0">
              <legend className="mb-2 text-sm font-medium text-ink-900">
                {lang === "en" ? "Model" : "Model"}
              </legend>
              <div className="flex flex-wrap gap-2" role="radiogroup">
                {spec.modes!.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={m.id === modeId}
                    onClick={() => setModeId(m.id)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      m.id === modeId ? "border-ink-900 bg-ink-900 text-white" : "border-line text-ink-700 hover:border-ink-900"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                {lang === "en"
                  ? "Changing the model changes the formula and the required inputs - the result label always shows which model produced it."
                  : "Model değişimi formülü ve gereken girdileri değiştirir - sonuç etiketi her zaman hangi modelin kullanıldığını gösterir."}
              </p>
            </fieldset>
          )}

          {isFunnel ? (
            <div className="mt-4">
              <FunnelInputs stages={stages} setStages={setStages} lang={lang} />
            </div>
          ) : (
            /* One column up to four fields, two beyond that - a calculator
               with two inputs shouldn't have them squeezed side by side in
               half a panel, and one with six shouldn't run off the fold. */
            <div className={`mt-4 grid gap-4 ${inputs.length > 4 ? "sm:grid-cols-2" : ""}`}>
              {inputs.map((input) => (
                <ScalarInput
                  key={input.key}
                  input={input}
                  value={raw[input.key] ?? ""}
                  error={errors[input.key]}
                  onChange={(v) => setRaw((r) => ({ ...r, [input.key]: v }))}
                />
              ))}
            </div>
          )}
        </>
      }
      results={
        <div aria-live="polite">
          {isFunnel ? (
            <>
              <PanelLabel>{lang === "en" ? "Conversion by step" : "Adım bazında dönüşüm"}</PanelLabel>
              {results ? (
                <div className="mt-4">
                  <FunnelResults results={results} lang={lang} />
                </div>
              ) : (
                <ResultHint>
                  {lang === "en"
                    ? "Name at least two stages and give each a count."
                    : "En az iki aşama adlandırın ve her birine bir sayı girin."}
                </ResultHint>
              )}
            </>
          ) : (
            <>
              <PrimaryResult
                label={primary.label}
                value={results ? formatByUnit(results[primary.key], primary.unit) : ""}
                ready={Boolean(results)}
              />
              <SecondaryResults
                items={rest.map((o) => ({
                  key: o.key,
                  label: o.label,
                  value: results ? formatByUnit(results[o.key], o.unit) : "",
                  ready: Boolean(results),
                }))}
              />
              {!results && (
                <ResultHint>
                  {lang === "en" ? "Fill in every field to see the result." : "Sonucu görmek için tüm alanları doldurun."}
                </ResultHint>
              )}
            </>
          )}
        </div>
      }
    />
  );
}

function ScalarInput({
  input,
  value,
  error,
  onChange,
}: {
  input: RuntimeCalcSpec["inputs"][number];
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  const errId = `${id}-err`;
  if (isEnumUnit(input.unit)) {
    const options = parseEnumOptions(input.unit);
    return (
      <label htmlFor={id} className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink-900">{input.label}</span>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errId : undefined}
          className="rounded-md border border-line bg-white px-3 py-2 text-ink-950 outline-none focus:border-ink-900"
        >
          <option value="" disabled>
            {"— select —"}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {error && (
          <span id={errId} className="text-xs text-red-600">
            {error}
          </span>
        )}
      </label>
    );
  }
  const suffix = input.unit === "%" ? "%" : undefined;
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink-900">
        {input.label}
        {suffix ? <span className="text-neutral-400"> ({suffix})</span> : null}
      </span>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errId : undefined}
        className="rounded-md border border-line px-3 py-2 text-ink-950 outline-none focus:border-ink-900"
      />
      {error && (
        <span id={errId} className="text-xs text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

function FunnelInputs({
  stages,
  setStages,
  lang,
}: {
  stages: Stage[];
  setStages: (s: Stage[]) => void;
  lang: Lang;
}) {
  const update = (i: number, field: "label" | "count", v: string) => {
    const next = stages.slice();
    next[i] = { ...next[i], [field]: v };
    setStages(next);
  };
  return (
    <div className="flex flex-col gap-2">
      {stages.map((s, i) => (
        <div key={i} className="flex gap-2">
          <label className="flex-1 text-sm">
            <span className="sr-only">{lang === "en" ? `Stage ${i + 1} name` : `${i + 1}. aşama adı`}</span>
            <input
              value={s.label}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder={lang === "en" ? `Stage ${i + 1} (e.g. Visit)` : `${i + 1}. aşama (örn. Ziyaret)`}
              className="w-full rounded-md border border-line px-3 py-2 text-ink-950 outline-none focus:border-ink-900"
            />
          </label>
          <label className="w-32 text-sm">
            <span className="sr-only">{lang === "en" ? `Stage ${i + 1} count` : `${i + 1}. aşama sayısı`}</span>
            <input
              type="number"
              inputMode="decimal"
              value={s.count}
              onChange={(e) => update(i, "count", e.target.value)}
              placeholder="0"
              className="w-full rounded-md border border-line px-3 py-2 text-ink-950 outline-none focus:border-ink-900"
            />
          </label>
          {stages.length > 2 && (
            <button
              type="button"
              onClick={() => setStages(stages.filter((_, idx) => idx !== i))}
              aria-label={lang === "en" ? `Remove stage ${i + 1}` : `${i + 1}. aşamayı kaldır`}
              className="rounded-md border border-line px-2 text-sm text-neutral-500 hover:border-red-400 hover:text-red-600"
            >
              ×
            </button>
          )}
        </div>
      ))}
      {stages.length < 10 && (
        <button
          type="button"
          onClick={() => setStages([...stages, { label: "", count: "" }])}
          className="mt-1 self-start rounded-md border border-line px-3 py-1.5 text-sm text-ink-700 hover:border-ink-900"
        >
          {lang === "en" ? "+ Add stage" : "+ Aşama ekle"}
        </button>
      )}
    </div>
  );
}

function FunnelResults({ results, lang }: { results: Record<string, unknown>; lang: Lang }) {
  const steps = (results.stepConversions ?? []) as { label: string; value: number }[];
  const drop = (results.dropOffByStage ?? []) as { label: string; value: number }[];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-neutral-600">{lang === "en" ? "Overall conversion" : "Genel dönüşüm"}</span>
        <span className="font-mono text-lg font-semibold text-ink-950 tabular-nums">
          {formatByUnit(results.overallConversion, "%")}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500">
              <th className="py-1 pr-4 font-medium">{lang === "en" ? "Step" : "Adım"}</th>
              <th className="py-1 pr-4 font-medium">{lang === "en" ? "Conversion" : "Dönüşüm"}</th>
              <th className="py-1 font-medium">{lang === "en" ? "Drop-off" : "Kayıp"}</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s, i) => {
              // A step "converting" above 100% means this stage counted more
              // entities than the one before it - not impossible (a
              // different cohort/measurement window can produce it, per the
              // catalog's own validationRule), but a likely data error that
              // should be visible, not silently rendered as if it were a
              // normal rate.
              const roseAboveHundred = Number.isFinite(s.value) && s.value > 1;
              return (
                <tr key={i} className="border-t border-line">
                  <td className="py-1.5 pr-4 text-ink-900">{s.label}</td>
                  <td className="py-1.5 pr-4 font-mono tabular-nums text-ink-950">
                    {formatByUnit(s.value, "%")}
                    {roseAboveHundred && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 align-middle text-xs font-sans font-medium text-amber-800">
                        {lang === "en" ? "check data - rose vs. previous stage" : "veriyi kontrol edin - önceki aşamadan yüksek"}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 font-mono tabular-nums text-ink-950">{formatByUnit(drop[i]?.value, "%")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* "Related calculators" used to render right here as an inline chip list -
   moved to its own page-level section (RelatedGrid, rendered by
   CalculatorRoutes after the FAQ) as part of the Calculator Product Page
   section order, so it isn't shown twice. Formula + plain-English stays
   inline above - it's the tool's own compact summary, not a duplicate of
   anything the new page sections add. */
