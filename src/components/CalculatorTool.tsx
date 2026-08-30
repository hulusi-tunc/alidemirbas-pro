"use client";

import { useId, useMemo, useState } from "react";
import { PRIMARY_OUTPUT, type RuntimeCalcSpec } from "@/lib/calc-catalog";
import { getCompute } from "@/lib/calc-registry";
import { validateInputs, errorMessage } from "@/lib/calc-validate";
import { formatByUnit, isEnumUnit, parseEnumOptions } from "@/lib/calc-format";
import { CalcPanel, PanelLabel, PrimaryResult, ResultHint, SecondaryResults } from "@/components/ui/CalcPanel";
import { Button } from "@/components/ui/Button";
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
  /* Nothing is judged before the reader asks to be judged: validation
     messages and the result panel both wait for the first Calculate.
     After that the tool goes live - the button has done its job of
     marking the moment, and from then on edits recompute as they type. */
  const [attempted, setAttempted] = useState(false);

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
    } else if (!v.ok && attempted) {
      errors = Object.fromEntries(Object.entries(v.errors).map(([k, e]) => [k, errorMessage(e, lang)]));
    }
  }

  /* One pixel wavefront across the answer plate EVERY time the shown
     answer changes (PixelBurst absorbs pulses that land mid-sweep, so a
     keystroke run reads as back-to-back sweeps, not a strobe). Gated on
     `attempted` like the panel itself, so nothing fires before the first
     Calculate. Derived during render, same pattern as PrimaryResult's
     reveal. */
  const signature = attempted && results ? JSON.stringify(results) : null;
  const [pulsedFor, setPulsedFor] = useState(signature);
  const [pulse, setPulse] = useState(0);
  if (signature !== pulsedFor) {
    setPulsedFor(signature);
    if (signature !== null) setPulse((p) => p + 1);
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
      answerPulse={pulse}
      plateWatermark={unitGlyph(primary.unit)}
      plateFootnote={prettyFormula(spec, activeMode)}
      inputs={
        /* No "Inputs" heading: a form of labelled fields says what it is,
           and the micro-label that used to sit here was rejected in review.
           A real form: Enter in any field is the same as pressing the
           Calculate button, the site's primary control with its pixel
           dissolve - the press that produces the answer. */
        <form
          className="flex flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            setAttempted(true);
          }}
        >
          {hasModes && (
            <fieldset className="border-0 p-0">
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
                    className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                      m.id === modeId
                        ? "bg-primary-600 text-white"
                        : "bg-paper-soft text-ink-700 hover:bg-blue-50 hover:text-primary-700"
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
            <div className={hasModes ? "mt-4" : ""}>
              <FunnelInputs stages={stages} setStages={setStages} lang={lang} />
            </div>
          ) : (
            /* One column up to four fields, two beyond that - a calculator
               with two inputs shouldn't have them squeezed side by side in
               half a panel, and one with six shouldn't run off the fold. */
            <div className={`${hasModes ? "mt-4 " : ""}grid gap-4 ${inputs.length > 4 ? "sm:grid-cols-2" : ""}`}>
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

          {/* Grows to eat the panel's spare height, so the button below sits
              on the bottom edge whatever the field count - with at least a
              field-gap of air when the form is tall. */}
          <div aria-hidden className="min-h-6 flex-1" />

          {/* `sm` is the compact 40px tier - the 56px control read as
              oversized in this panel. (This carried `btn-keep-tone` while
              the stage band was data-tone="dark" and would otherwise have
              flipped the primary to its white dark-ground plate. The band
              is light as of 2026-08-30, so there is no flip to opt out of
              and the class is gone rather than left as a no-op.) */}
          <Button type="submit" variant="primary" size="sm" className="w-full">
            {lang === "en" ? "Calculate" : "Hesapla"}
          </Button>
        </form>
      }
      results={
        <div aria-live="polite">
          {!attempted ? (
            /* Before the first Calculate: the answer's own shape, ghosted.
               The catalog's documented example output at full display size,
               faint enough to read as a placeholder - the same number the
               worked-example strip below the tool derives, so it is real
               content, not an invented figure. The live answer then
               resolves in its place (PrimaryResult's reveal). */
            <>
              <PanelLabel>{isFunnel ? (lang === "en" ? "Conversion by step" : "Adım bazında dönüşüm") : primary.label}</PanelLabel>
              <p className="mt-2 font-semibold tracking-[-0.03em] tabular-nums text-white/25 text-[clamp(3rem,1.9rem+4.4vw,4.75rem)] leading-[1.02]">
                {ghostValue(spec, activeMode, primary.key)}
              </p>
              <ResultHint>
                {lang === "en"
                  ? "Enter your numbers and press Calculate."
                  : "Sayılarınızı girin ve Hesapla'ya basın."}
              </ResultHint>
            </>
          ) : isFunnel ? (
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

/* The plate's giant corner watermark: the primary metric's unit as a
   single glyph. Units without a one-glyph identity get no watermark
   rather than a strained one. */
function unitGlyph(unit: string | null | undefined): string | undefined {
  if (unit === "%") return "%";
  if (unit?.startsWith("x")) return "×";
  if (unit === "currency") return "$";
  return undefined;
}

/* The plate footnote: the catalog's code-cased formula read back through
   its own field labels (the two don't always agree on names - roas's
   `adSpend` vs the key `spend` - so unknown identifiers are decamelized
   instead), operators set in real glyphs. Mode-aware: each mode is its own
   equation over its own inputs. */
function prettyFormula(
  spec: RuntimeCalcSpec,
  mode?: NonNullable<RuntimeCalcSpec["modes"]>[number],
): string {
  if (!mode && spec.formulaDisplay) return spec.formulaDisplay;
  const fields = mode ? [...mode.inputs, ...mode.outputs] : [...spec.inputs, ...spec.outputs];
  const formula = mode?.formula ?? spec.formula;
  const pretty = formula.replace(/[A-Za-z_][A-Za-z0-9_]*/g, (token) => {
    const field = fields.find((x) => x.key.toLowerCase() === token.toLowerCase());
    if (field) return field.label;
    return token.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  });
  return pretty.replace(/\//g, "÷").replace(/\*/g, "×");
}

/* The ghost the empty panel shows: the catalog's own documented example
   output for the primary metric, already formatted by the catalog
   ("5.00x", "720.00"). Mode-aware, because each mode documents its own
   example. Falls back to a dash for the one calculator (the funnel) whose
   example output is a table rather than a number. */
function ghostValue(
  spec: RuntimeCalcSpec,
  mode: NonNullable<RuntimeCalcSpec["modes"]>[number] | undefined,
  primaryKey: string,
): string {
  const output = (mode && spec.examplesByMode?.[mode.id]?.output) ?? spec.exampleOutput;
  const value = output?.[primaryKey];
  return typeof value === "string" || typeof value === "number" ? String(value) : "—";
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
          className="rounded-full bg-paper-soft px-4 py-2.5 text-ink-950 outline-none transition-shadow focus:shadow-[inset_0_0_0_1px_var(--color-primary-400)]"
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
        className="rounded-full bg-paper-soft px-4 py-2.5 text-ink-950 outline-none transition-shadow focus:shadow-[inset_0_0_0_1px_var(--color-primary-400)]"
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
              className="w-full rounded-full bg-paper-soft px-4 py-2.5 text-ink-950 outline-none transition-shadow focus:shadow-[inset_0_0_0_1px_var(--color-primary-400)]"
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
              className="w-full rounded-full bg-paper-soft px-4 py-2.5 text-ink-950 outline-none transition-shadow focus:shadow-[inset_0_0_0_1px_var(--color-primary-400)]"
            />
          </label>
          {stages.length > 2 && (
            <button
              type="button"
              onClick={() => setStages(stages.filter((_, idx) => idx !== i))}
              aria-label={lang === "en" ? `Remove stage ${i + 1}` : `${i + 1}. aşamayı kaldır`}
              className="rounded-full bg-paper-soft px-2.5 text-sm text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600"
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
          className="mt-1 self-start rounded-full bg-paper-soft px-3.5 py-1.5 text-sm text-ink-700 transition-colors hover:bg-blue-50 hover:text-primary-700"
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
        <span className="text-sm text-white/70">{lang === "en" ? "Overall conversion" : "Genel dönüşüm"}</span>
        <span className="font-mono text-lg font-semibold text-white tabular-nums">
          {formatByUnit(results.overallConversion, "%")}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/60">
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
                <tr key={i} className="border-t border-white/15">
                  <td className="py-1.5 pr-4 text-white/80">{s.label}</td>
                  <td className="py-1.5 pr-4 font-mono tabular-nums text-white">
                    {formatByUnit(s.value, "%")}
                    {roseAboveHundred && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 align-middle text-xs font-sans font-medium text-amber-800">
                        {lang === "en" ? "check data - rose vs. previous stage" : "veriyi kontrol edin - önceki aşamadan yüksek"}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 font-mono tabular-nums text-white">{formatByUnit(drop[i]?.value, "%")}</td>
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
