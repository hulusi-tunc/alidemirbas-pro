"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

import { journeys } from "@/lib/journeys";
import { flows } from "@/lib/flows";
import type { copy, Lang } from "@/lib/content";

const CHANNELS = ["email", "push", "sms", "inapp", "whatsapp"] as const;
const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  push: "Push",
  sms: "SMS",
  inapp: "In-app",
  whatsapp: "WhatsApp",
};

export default function JourneyBrowser({
  lang,
  t,
}: {
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
}) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("");
  const [channel, setChannel] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const sectors = useMemo(
    () => Array.from(new Set(journeys.map((j) => j.sector[lang]))).sort(),
    [lang],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    return journeys.filter((j) => {
      if (sector && j.sector[lang] !== sector) return false;
      if (channel && !j.channels.includes(channel)) return false;
      if (!q) return true;
      return [j.idx, j.title[lang], j.journey[lang], j.sector[lang]]
        .join(" ")
        .toLocaleLowerCase(lang)
        .includes(q);
    });
  }, [query, sector, channel, lang]);

  const active = query || sector || channel;

  return (
    <div>
      {/* filter bar */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3 border border-line bg-paper px-4 py-2.5 focus-within:border-blue-600 lg:max-w-sm">
          <Search aria-hidden className="size-4 shrink-0 text-neutral-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-neutral-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="h-10 border border-line bg-paper px-3 text-sm text-ink-700 outline-none focus:border-blue-600"
          >
            <option value="">{t.allSectors}</option>
            {sectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {CHANNELS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChannel(channel === c ? "" : c)}
              aria-pressed={channel === c}
              className={
                channel === c
                  ? "h-10 border border-blue-600 bg-blue-600 px-3 text-sm text-white"
                  : "h-10 border border-line bg-paper px-3 text-sm text-ink-600 transition-colors hover:border-neutral-400"
              }
            >
              {CHANNEL_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* count + clear */}
      <div className="flex items-center justify-between py-4 text-sm text-neutral-600">
        <span>
          {rows.length} / {journeys.length} {t.results}
        </span>
        {active ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSector("");
              setChannel("");
            }}
            className="flex items-center gap-1.5 text-blue-600 transition-colors hover:text-blue-700"
          >
            <X aria-hidden className="size-3.5" />
            {t.allSectors === "All sectors" ? "Clear filters" : "Filtreleri temizle"}
          </button>
        ) : null}
      </div>

      {/* rows */}
      {rows.length === 0 ? (
        <p className="border-t border-line py-16 text-center text-sm text-neutral-500">{t.empty}</p>
      ) : (
        <div>
          {rows.map((j) => (
            <div key={j.slug} className="border-t border-line">
              <button
                type="button"
                onClick={() => setOpen(open === j.slug ? null : j.slug)}
                aria-expanded={open === j.slug}
                className="group grid w-full grid-cols-[5.5rem_1fr_auto] items-baseline gap-x-6 gap-y-2 py-5 text-left transition-colors hover:bg-paper-soft md:grid-cols-[5.5rem_1.4fr_1fr_auto_auto] md:items-center"
              >
                <span className="text-sm text-neutral-500 tabular-nums">{j.idx}</span>
                <h3 className="text-base font-medium tracking-tight text-ink-950">{j.title[lang]}</h3>
                <span className="col-start-2 hidden text-sm text-ink-500 md:col-start-3 md:block">{j.sector[lang]}</span>
                <div className="col-start-2 flex flex-wrap gap-1.5 md:col-start-4">
                  {j.channels.map((c) => (
                    <span key={c} className="border border-line px-2 py-0.5 text-xs text-neutral-600 group-hover:border-neutral-300">
                      {CHANNEL_LABELS[c] ?? c}
                    </span>
                  ))}
                </div>
                <ChevronDown
                  aria-hidden
                  className={`col-start-3 size-4 text-neutral-400 transition-transform md:col-start-5 ${open === j.slug ? "rotate-180" : ""}`}
                />
              </button>
              {open === j.slug && flows[j.slug] ? <Flow steps={flows[j.slug][lang]} /> : null}
            </div>
          ))}
          <div className="border-t border-line" />
        </div>
      )}
    </div>
  );
}

const STEP_STYLE: Record<string, { bar: string; label: string }> = {
  email: { bar: "border-t-2 border-t-blue-600", label: "text-blue-600" },
  push: { bar: "border-t-2 border-t-amber-500", label: "text-amber-600" },
  sms: { bar: "border-t-2 border-t-neutral-500", label: "text-neutral-600" },
  inapp: { bar: "border-t-2 border-t-violet-500", label: "text-violet-600" },
  whatsapp: { bar: "border-t-2 border-t-green-600", label: "text-green-700" },
  sales: { bar: "border-t-2 border-t-ink-700", label: "text-ink-700" },
};

function Flow({ steps }: { steps: { t: string; a: string; b: string }[] }) {
  return (
    <div className="border-t border-dashed border-line bg-paper-soft/60 px-4 py-8">
      <div className="mx-auto flex max-w-md flex-col items-stretch">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center">
            {i > 0 ? (
              <span aria-hidden className="flex h-8 w-px items-center justify-center bg-neutral-300">
                <span className="grid size-4 shrink-0 place-items-center border border-line bg-paper text-[10px] leading-none text-neutral-500">+</span>
              </span>
            ) : null}
            {s.t === "entry" ? (
              <div className="w-full bg-ink-950 p-5 text-white">
                <p className="text-xs font-medium tracking-wide text-white/60">⚑ Entry - Trigger</p>
                <p className="mt-2 text-sm leading-relaxed font-medium">{s.a}</p>
                {s.b ? <p className="mt-2 text-xs leading-relaxed text-white/65">{s.b}</p> : null}
              </div>
            ) : s.t === "wait" ? (
              <div className="w-full border border-line bg-paper px-4 py-2.5">
                <p className="text-xs text-neutral-500">Wait</p>
                <p className="text-sm font-medium text-ink-900">{s.a}</p>
              </div>
            ) : s.t === "condition" ? (
              <div className="w-full border border-dashed border-neutral-400 bg-paper px-4 py-2.5">
                <p className="text-xs text-neutral-500">Condition</p>
                <p className="text-sm font-medium text-ink-900">{s.a}</p>
              </div>
            ) : (
              <div className={`w-full border border-line bg-paper p-4 ${STEP_STYLE[s.t]?.bar ?? ""}`}>
                <p className={`text-xs font-semibold ${STEP_STYLE[s.t]?.label ?? "text-ink-700"}`}>{s.a}</p>
                {s.b ? <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{s.b}</p> : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
