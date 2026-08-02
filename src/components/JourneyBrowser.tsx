"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { journeys } from "@/lib/journeys";
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
            <div
              key={j.slug}
              className="group grid grid-cols-[5.5rem_1fr] items-baseline gap-x-6 gap-y-2 border-t border-line py-5 transition-colors hover:bg-paper-soft md:grid-cols-[5.5rem_1.4fr_1fr_auto] md:items-center"
            >
              <span className="text-sm text-neutral-500 tabular-nums">{j.idx}</span>
              <h3 className="text-base font-medium tracking-tight text-ink-950">{j.title[lang]}</h3>
              <span className="col-start-2 text-sm text-ink-500 md:col-start-3">{j.sector[lang]}</span>
              <div className="col-start-2 flex flex-wrap gap-1.5 md:col-start-4">
                {j.channels.map((c) => (
                  <span
                    key={c}
                    className="border border-line px-2 py-0.5 text-xs text-neutral-600 group-hover:border-neutral-300"
                  >
                    {CHANNEL_LABELS[c] ?? c}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div className="border-t border-line" />
        </div>
      )}
    </div>
  );
}
