"use client";

import { useId, useMemo, useState } from "react";

import type { RuntimeCalcSpec } from "@/lib/calc-catalog";
import { getCompute } from "@/lib/calc-registry";
import { formatByUnit, parseField } from "@/lib/calc-format";
import { FormulaBlock } from "@/components/CalculatorTool";
import type { Lang } from "@/lib/content";

/* The one composite calculator: one set of campaign numbers, eight metrics.

   A bespoke tool rather than the generic CalculatorTool, for one structural
   reason. CalculatorTool validates every input as a set and shows results
   only once all of them pass - correct for a calculator that computes one
   thing from two numbers, and wrong here, where the eight metrics are
   independent and somebody who only has send/delivery figures should still
   get Delivery Rate and Bounce Rate. Nothing is required; each metric
   appears the moment its own two or three fields are filled and stays
   absent otherwise. Same one-off precedent as BreakEvenSliderTool.

   Everything else is shared, deliberately: the compute function lives in
   calc-registry.ts like every other calculator's, the labels and units come
   from the catalog spec rather than being restated here, and the card,
   inputs and FormulaBlock are the same ones every other calculator page
   renders. The only things this file owns are the input grouping, the
   per-metric dependency lists, and the one-line reading of each result. */

/** Which inputs each metric needs. This is the calculator's own structure -
    the compute function returns NaN for a metric whose inputs are missing,
    but NaN alone can't distinguish "not filled in yet" from "you divided by
    zero", and those deserve different treatment on screen. */
const METRICS: readonly { key: string; needs: readonly string[] }[] = [
  { key: "deliveryRate", needs: ["delivered", "sent"] },
  { key: "bounceRate", needs: ["bounced", "sent"] },
  { key: "openRate", needs: ["opens", "delivered"] },
  { key: "ctor", needs: ["clicks", "opens"] },
  { key: "unsubRate", needs: ["unsubscribes", "delivered"] },
  { key: "complaintRate", needs: ["complaints", "delivered"] },
  { key: "listGrowthRate", needs: ["newSubscribers", "unsubscribes", "listStart"] },
  { key: "rpr", needs: ["revenue", "sent"] },
];

/* Input groups, in the order a campaign report tends to list them. Purely a
   layout concern - the catalog holds one flat input list, and grouping it
   here keeps ten fields from reading as an undifferentiated wall. */
const GROUPS: readonly { id: string; keys: readonly string[] }[] = [
  { id: "send", keys: ["sent", "delivered", "bounced"] },
  { id: "engagement", keys: ["opens", "clicks"] },
  { id: "list", keys: ["unsubscribes", "complaints", "newSubscribers", "listStart"] },
  { id: "revenue", keys: ["revenue"] },
];

const T = {
  en: {
    groups: {
      send: "Send & delivery",
      engagement: "Engagement",
      list: "List health",
      revenue: "Revenue",
    } as Record<string, string>,
    results: "Results",
    hint: "Nothing is required. Each metric appears once the figures behind it are filled in.",
    pending: "Needs",
    undefinedResult: "Denominator is zero",
    negative: "Cannot be negative",
    invalid: "Enter a number",
    metrics: {
      deliveryRate: "Share of sent emails that reached an inbox.",
      bounceRate: "Share of sent emails that were returned undelivered.",
      openRate: "Share of delivered emails that were opened. Inflated by privacy features like Apple MPP.",
      ctor: "Of the people who opened, the share who clicked - content and offer quality, isolated from deliverability.",
      unsubRate: "Share of delivered emails that led someone to opt out.",
      complaintRate: "Share of delivered emails marked as spam. Above ~0.1% is a sender-reputation risk.",
      listGrowthRate: "Net change in list size over the period. Negative when losses exceed gains.",
      rpr: "Average revenue per email sent, bounces included.",
    } as Record<string, string>,
  },
  tr: {
    groups: {
      send: "Gönderim ve teslimat",
      engagement: "Etkileşim",
      list: "Liste sağlığı",
      revenue: "Gelir",
    } as Record<string, string>,
    results: "Sonuçlar",
    hint: "Hiçbir alan zorunlu değil. Her metrik, arkasındaki rakamlar girildiğinde görünür.",
    pending: "Gerekli",
    undefinedResult: "Payda sıfır",
    negative: "Negatif olamaz",
    invalid: "Bir sayı girin",
    metrics: {
      deliveryRate: "Gönderilen e-postaların gelen kutusuna ulaşan oranı.",
      bounceRate: "Gönderilen e-postaların teslim edilemeyip geri dönen oranı.",
      openRate: "Teslim edilen e-postaların açılma oranı. Apple MPP gibi gizlilik özellikleri bu oranı şişirir.",
      ctor: "Açanlar içinde tıklayanların oranı - içerik ve teklif kalitesini teslimattan bağımsız ölçer.",
      unsubRate: "Teslim edilen e-postaların abonelikten çıkışa yol açan oranı.",
      complaintRate: "Teslim edilen e-postaların spam olarak işaretlenme oranı. ~%0,1 üzeri gönderen itibarı için risklidir.",
      listGrowthRate: "Dönem boyunca liste büyüklüğündeki net değişim. Kayıplar kazançları aşarsa negatif olur.",
      rpr: "Gönderilen e-posta başına ortalama gelir, geri dönenler dahil.",
    } as Record<string, string>,
  },
} as const;

export default function EmailPerformanceTool({ spec, lang }: { spec: RuntimeCalcSpec; lang: Lang }) {
  const t = T[lang];
  const [raw, setRaw] = useState<Record<string, string>>({});

  const inputByKey = useMemo(() => new Map(spec.inputs.map((i) => [i.key, i])), [spec.inputs]);
  const outputByKey = useMemo(() => new Map(spec.outputs.map((o) => [o.key, o])), [spec.outputs]);
  const compute = useMemo(() => getCompute(spec.slug), [spec.slug]);

  /* Parsed once per render. A field that is blank is absent, not zero - the
     distinction matters because 0 is a legitimate value for every count here
     (a campaign really can have zero complaints) and treating blank as 0
     would report a 0.00% Complaint Rate for someone who simply hasn't
     entered the figure. */
  const { values, errors, filled } = useMemo(() => {
    const values: Record<string, number> = {};
    const errors: Record<string, string> = {};
    const filled = new Set<string>();
    for (const input of spec.inputs) {
      const entry = raw[input.key];
      if (entry === undefined || entry.trim() === "") continue;
      const parsed = parseField(entry);
      if (parsed.ok) {
        values[input.key] = parsed.value;
        filled.add(input.key);
      } else {
        errors[input.key] = parsed.error === "negative" ? t.negative : t.invalid;
      }
    }
    return { values, errors, filled };
  }, [raw, spec.inputs, t.negative, t.invalid]);

  const results = compute ? compute(values) : {};

  const anyFilled = filled.size > 0;

  return (
    <div className="rounded-lg border border-line bg-white p-6">
      <div className="flex flex-col gap-6">
        {GROUPS.map((group) => (
          <fieldset key={group.id} className="border-0 p-0">
            <legend className="mb-3 font-mono text-[11px] tracking-[0.1em] text-ink-400 uppercase">
              {t.groups[group.id]}
            </legend>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.keys.map((key) => {
                const input = inputByKey.get(key);
                if (!input) return null;
                return (
                  <CountInput
                    key={key}
                    label={input.label}
                    currency={input.unit === "currency"}
                    value={raw[key] ?? ""}
                    error={errors[key]}
                    onChange={(v) => setRaw((r) => ({ ...r, [key]: v }))}
                  />
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-8 border-t border-line pt-6" aria-live="polite">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-mono text-[11px] tracking-[0.1em] text-ink-400 uppercase">{t.results}</p>
          <p className="text-xs text-neutral-500">{t.hint}</p>
        </div>

        <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {METRICS.map(({ key, needs }) => {
            const output = outputByKey.get(key);
            if (!output) return null;
            const missing = needs.filter((n) => !filled.has(n));
            const value = results[key];
            const ready = missing.length === 0;
            const computable = ready && typeof value === "number" && Number.isFinite(value);
            return (
              <div key={key} className="border-l border-line pl-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-ink-900">{output.label}</span>
                  <span
                    className={`font-mono text-lg font-semibold tabular-nums ${
                      computable ? "text-ink-950" : "text-ink-300"
                    }`}
                  >
                    {computable ? formatByUnit(value, output.unit) : "—"}
                  </span>
                </div>
                <p className="mt-1 text-[13px] leading-snug text-ink-600">{t.metrics[key]}</p>
                {/* Says which figures are still outstanding rather than just
                    showing a dash - with ten optional fields feeding eight
                    metrics, "what would make this one appear" is the thing a
                    reader actually needs. Only shown once they have started
                    filling the form in; on an empty form every metric is
                    pending and eight of these would be noise. */}
                {anyFilled && !ready ? (
                  <p className="mt-1 text-xs text-ink-400">
                    {t.pending}: {missing.map((m) => inputByKey.get(m)?.label ?? m).join(", ")}
                  </p>
                ) : null}
                {ready && !computable ? (
                  <p className="mt-1 text-xs text-amber-700">{t.undefinedResult}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <FormulaBlock spec={spec} lang={lang} />
    </div>
  );
}

/* The same field markup CalculatorTool's ScalarInput renders, minus the enum
   branch (no enum inputs here) and with a currency prefix instead of its
   percent suffix - every input on this calculator is a raw count or an
   amount, never a percentage. */
function CountInput({
  label,
  currency,
  value,
  error,
  onChange,
}: {
  label: string;
  currency: boolean;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink-900">
        {label}
        {currency ? <span className="text-neutral-400"> ($)</span> : null}
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
