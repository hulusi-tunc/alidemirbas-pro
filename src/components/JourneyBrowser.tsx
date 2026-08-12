"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";

import { journeys, type Journey } from "@/lib/journeys";
import { flows } from "@/lib/flows";
import type { copy, Lang } from "@/lib/content";

const CHANNELS = ["email", "push", "sms", "inapp", "whatsapp"] as const;
const CHANNEL_LABELS: Record<string, string> = {
  email: "Email", push: "Push", sms: "SMS", inapp: "In-app", whatsapp: "WhatsApp",
};
const DOT: Record<string, string> = {
  email: "bg-blue-600", push: "bg-amber-500", sms: "bg-neutral-500",
  inapp: "bg-violet-500", whatsapp: "bg-green-600",
};

export default function JourneyBrowser({
  lang, t,
}: { lang: Lang; t: (typeof copy)[Lang]["lab"]["page"] }) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("");
  const [channel, setChannel] = useState("");
  const [open, setOpen] = useState<Journey | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sectors = useMemo(
    () => Array.from(new Set(journeys.map((j) => j.sector[lang]))),
    [lang],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    return journeys.filter((j) => {
      if (sector && j.sector[lang] !== sector) return false;
      if (channel && !j.channels.includes(channel)) return false;
      if (!q) return true;
      return [j.idx, j.title[lang], j.journey[lang], j.sector[lang]]
        .join(" ").toLocaleLowerCase(lang).includes(q);
    });
  }, [query, sector, channel, lang]);

  const active = query || sector || channel;

  return (
    <div>
      {/* filter bar */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 border border-line bg-paper px-4 py-2.5 focus-within:border-blue-600 sm:max-w-sm">
          <Search aria-hidden className="size-4 shrink-0 text-neutral-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-neutral-500"
          />
        </div>

        <div>
          <p className="altor-eyebrow text-ink-400">{t.sectorLabel}</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <FilterChip active={!sector} onClick={() => setSector("")}>{t.allSectors}</FilterChip>
            {sectors.map((s) => (
              <FilterChip key={s} active={sector === s} onClick={() => setSector(sector === s ? "" : s)}>
                {s}
              </FilterChip>
            ))}
          </div>
        </div>

        <div>
          <p className="altor-eyebrow text-ink-400">{t.channelsLabel}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {CHANNELS.map((c) => (
              <button
                key={c} type="button"
                onClick={() => setChannel(channel === c ? "" : c)}
                aria-pressed={channel === c}
                className={
                  channel === c
                    ? "flex h-9 items-center gap-2 border border-blue-600 bg-blue-600 px-3 text-sm text-white"
                    : "flex h-9 items-center gap-2 border border-line bg-paper px-3 text-sm text-ink-600 transition-colors hover:border-neutral-400"
                }
              >
                <span aria-hidden className={`size-1.5 rounded-full ${channel === c ? "bg-white" : DOT[c]}`} />
                {CHANNEL_LABELS[c]}
              </button>
            ))}
            {active ? (
              <button
                type="button"
                onClick={() => { setQuery(""); setSector(""); setChannel(""); }}
                className="flex h-9 items-center gap-1.5 px-2 text-sm text-blue-600 transition-colors hover:text-blue-700"
              >
                <X aria-hidden className="size-3.5" />
                {rows.length} / {journeys.length}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* flat, filterable list of journeys */}
      {rows.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-500">{t.empty}</p>
      ) : (
        <div className="mt-10">
          {rows.map((j) => (
            <button
              key={j.slug} type="button"
              onClick={() => setOpen(j)}
              className="group grid w-full grid-cols-1 items-start gap-3 border-t border-line py-6 text-left transition-colors last:border-b hover:bg-paper-soft sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:gap-6"
            >
              <span className="text-xs text-neutral-500 tabular-nums">{j.idx}</span>
              <div className="min-w-0">
                <p className="text-[15px] leading-snug font-medium tracking-tight text-ink-950">{j.title[lang]}</p>
                <p className="mt-0.5 text-sm text-ink-500">{j.sector[lang]} · {j.journey[lang]}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:justify-end">
                {j.channels.map((c) => (
                  <span key={c} className="flex items-center gap-1.5 border border-line px-2 py-1 text-xs text-ink-600">
                    <span aria-hidden className={`size-1.5 rounded-full ${DOT[c] ?? "bg-neutral-400"}`} />
                    {CHANNEL_LABELS[c] ?? c}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* slide-over flow panel */}
      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <button
            type="button" aria-label="Close"
            onClick={() => setOpen(null)}
            className="absolute inset-0 bg-ink-950/30"
          />
          <aside className="absolute inset-4 mx-auto flex max-w-4xl flex-col border border-line bg-paper shadow-2xl md:inset-y-10 md:inset-x-8">
            <header className="border-b border-line px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-neutral-500 tabular-nums">{open.idx} - {open.sector[lang]}</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink-950">{open.title[lang]}</h2>
                </div>
                <button
                  type="button" onClick={() => setOpen(null)}
                  className="grid size-8 shrink-0 place-items-center border border-line text-neutral-500 transition-colors hover:border-neutral-400 hover:text-ink-900"
                >
                  <X aria-hidden className="size-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {open.channels.map((c) => (
                  <span key={c} className="flex items-center gap-1.5 border border-line px-2 py-0.5 text-xs text-neutral-600">
                    <span aria-hidden className={`size-1.5 rounded-full ${DOT[c] ?? "bg-neutral-400"}`} />
                    {CHANNEL_LABELS[c] ?? c}
                  </span>
                ))}
              </div>
            </header>
            <div className="flex-1 overflow-y-auto [background-image:radial-gradient(circle,var(--color-neutral-300)_1px,transparent_1px)] [background-size:18px_18px]">
              {flows[open.slug] ? <Flow steps={flows[open.slug][lang]} /> : null}
            </div>
          </aside>
        </div>
      ) : null}
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
    <div className="px-4 py-10">
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

function FilterChip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "h-9 border border-blue-600 bg-blue-600 px-3 text-sm text-white"
          : "h-9 border border-line bg-paper px-3 text-sm text-ink-600 transition-colors hover:border-neutral-400"
      }
    >
      {children}
    </button>
  );
}
