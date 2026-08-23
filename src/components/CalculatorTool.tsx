"use client";

import { useId, useMemo, useState } from "react";
import type { RuntimeCalcSpec } from "@/lib/calc-catalog";
import { getCompute } from "@/lib/calc-registry";
import { validateInputs, errorMessage } from "@/lib/calc-validate";
import { formatByUnit, isEnumUnit, parseEnumOptions } from "@/lib/calc-format";
import type { Lang } from "@/lib/content";

type Stage = { label: string; count: string };

/* Generic, spec-driven calculator renderer. Server components never pass
   this component a function - it receives a plain-data RuntimeCalcSpec
   (built by calc-catalog.ts's toRuntimeSpec) and looks up its own compute
   function client-side from calc-registry.ts by slug, the same pattern
   the pre-Phase-2 version of this file already used and that this phase
   keeps for the same reason (a Server Component cannot pass a function as
   a Client Component prop). */
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

  return (
    <div className="rounded-lg border border-line bg-white p-6">
      {hasModes && (
        <fieldset className="mb-6">
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
        <FunnelInputs stages={stages} setStages={setStages} lang={lang} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
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

      <div className="mt-6 border-t border-line pt-6" aria-live="polite">
        {results ? (
          isFunnel ? (
            <FunnelResults results={results} lang={lang} />
          ) : (
            <div className="flex flex-col gap-3">
              {outputs.map((o) => (
                <div key={o.key} className="flex items-baseline justify-between gap-4">
                  <span className="text-sm text-neutral-600">{o.label}</span>
                  <span className="font-mono text-lg font-semibold text-ink-950 tabular-nums">
                    {formatByUnit(results![o.key], o.unit)}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : (
          <p className="text-sm text-neutral-500">
            {lang === "en" ? "Fill in every field to see the result." : "Sonucu görmek için tüm alanları doldurun."}
          </p>
        )}
      </div>

      <FormulaBlock spec={spec} activeFormula={activeMode?.formula} activeModeId={modeId} lang={lang} />
    </div>
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
            {steps.map((s, i) => (
              <tr key={i} className="border-t border-line">
                <td className="py-1.5 pr-4 text-ink-900">{s.label}</td>
                <td className="py-1.5 pr-4 font-mono tabular-nums text-ink-950">{formatByUnit(s.value, "%")}</td>
                <td className="py-1.5 font-mono tabular-nums text-ink-950">{formatByUnit(drop[i]?.value, "%")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function prettyFormula(formula: string, inputs: RuntimeCalcSpec["inputs"]): string | null {
  if (!/^[a-zA-Z0-9_ ()+\-*/.]+$/.test(formula)) return null; // complex formula (sqrt, Σ, etc.) - don't mangle it
  const byKey = new Map(inputs.map((i) => [i.key, i.label]));
  // A token that isn't a known input key (the doc-only formula strings in
  // the catalog use readable pseudo-code, not always the literal input
  // key - e.g. roas's formula says "adSpend" where the real key is
  // "spend") still gets spaced out from camelCase rather than shown raw.
  const spaceCamel = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  let out = formula.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, (tok) => byKey.get(tok) ?? spaceCamel(tok));
  out = out.replace(/\*/g, "×").replace(/\//g, "÷");
  return out;
}

function FormulaBlock({
  spec,
  activeFormula,
  activeModeId,
  lang,
}: {
  spec: RuntimeCalcSpec;
  activeFormula?: string;
  activeModeId?: string;
  lang: Lang;
}) {
  const formula = activeFormula ?? spec.formula;
  const inputs = spec.modes ? spec.modes.flatMap((m) => m.inputs) : spec.inputs;
  // formulaDisplay is a hand-authored, editorially-controlled override
  // (Phase 3) for the handful of formulas the auto-prettifier can't
  // safely touch (^, ±, subscripts). Only used when there's no active
  // mode - a mode's own `formula` string is always plain enough to
  // prettify automatically, so activeFormula takes priority.
  const pretty = activeFormula ? prettyFormula(formula, inputs) : null;
  const displayFormula = activeFormula ? pretty ?? formula : spec.formulaDisplay ?? prettyFormula(formula, inputs) ?? formula;
  return (
    <div className="mt-6 border-t border-line pt-6 text-sm">
      <p className="font-medium text-ink-900">{lang === "en" ? "Formula" : "Formül"}</p>
      <p className="mt-1 text-neutral-600">{spec.formulaPlainEnglish}</p>
      <p className="mt-2 rounded-md bg-paper-soft px-3 py-2 font-mono text-ink-800">{displayFormula}</p>

      <ExampleBlock spec={spec} activeModeId={activeModeId} />

      {spec.related.length > 0 && (
        <div className="mt-6">
          <p className="font-medium text-ink-900">{lang === "en" ? "Related calculators" : "İlgili hesaplayıcılar"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {spec.related.map((r) => (
              <a
                key={r.slug}
                href={`${lang === "en" ? "" : "/tr"}/calculators/${r.slug}`}
                className="rounded-md border border-line px-2.5 py-1 text-xs text-ink-700 hover:border-ink-900"
              >
                {r.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExampleBlock({ spec, activeModeId }: { spec: RuntimeCalcSpec; activeModeId?: string }) {
  const fmt = (v: unknown): string => (Array.isArray(v) || (typeof v === "object" && v !== null) ? JSON.stringify(v) : String(v));
  // Multi-mode calculators get a per-mode example (Phase 3's
  // examplesByMode) instead of always showing the default mode's example
  // regardless of which mode is selected.
  const perMode = activeModeId ? spec.examplesByMode?.[activeModeId] : undefined;
  const input = perMode?.input ?? spec.exampleInput;
  const output = perMode?.output ?? spec.exampleOutput;
  if (activeModeId && !perMode) return null; // no example authored for this mode yet - say nothing rather than show a mismatched one
  return (
    <div className="mt-4 text-xs text-neutral-500">
      <span className="font-medium text-neutral-600">Example — </span>
      {Object.entries(input)
        .map(([k, v]) => `${k}: ${fmt(v)}`)
        .join(", ")}
      {" → "}
      {Object.entries(output)
        .map(([k, v]) => `${k}: ${fmt(v)}`)
        .join(", ")}
    </div>
  );
}
