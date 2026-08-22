"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

import JourneyFlow from "@/components/JourneyFlow";
import { FacetCheckbox, FacetGroup, FacetRadio } from "@/components/ui/Facets";
import { journeys, type Journey } from "@/lib/journeys";
import { flows } from "@/lib/flows";
import type { Channel } from "@/lib/orchestration";
import type { copy, Lang } from "@/lib/content";

/* Every channel a journey can declare is filterable, internal ones included -
   "which journeys need a person or a team in them" is a real question to ask
   of this archive. */
const CHANNELS = ["email", "push", "sms", "inapp", "whatsapp", "sales", "task"] as const satisfies readonly Channel[];
/* Every channel a journey can declare needs a label here, including the ones
   that are not filter chips - `sales` is a supported channel on four journeys
   and was rendering as the raw slug on their badges. */
const CHANNEL_LABELS: Record<string, string> = {
  email: "Email", push: "Push", sms: "SMS", inapp: "In-app", whatsapp: "WhatsApp",
  sales: "Sales rep", task: "Internal task",
};
const DOT: Record<string, string> = {
  email: "bg-blue-600", push: "bg-amber-500", sms: "bg-neutral-500",
  inapp: "bg-violet-500", whatsapp: "bg-green-600", sales: "bg-ink-700", task: "bg-yellow-700",
};

export default function JourneyBrowser({
  lang, t,
}: { lang: Lang; t: (typeof copy)[Lang]["lab"]["page"] }) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  /* Each facet is a separate predicate so the counts can leave one out. A
     sector's count is "how many would I get if I picked this", which means
     every other filter applies but the sector itself does not - otherwise
     every unselected option would read zero. */
  const { rows, sectorCounts, allSectorsCount, channelCounts } = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    const byQuery = (j: Journey) =>
      !q ||
      [j.idx, j.title[lang], j.journey[lang], j.sector[lang]]
        .join(" ").toLocaleLowerCase(lang).includes(q);
    const bySector = (j: Journey) => !sector || j.sector[lang] === sector;
    // Several channels read as "any of these", not "all of them" - nobody
    // wants only the journeys that happen to use every channel they ticked.
    const byChannels = (j: Journey) =>
      channels.length === 0 || channels.some((c) => j.channels.includes(c));

    const forSectorFacet = journeys.filter((j) => byQuery(j) && byChannels(j));
    const forChannelFacet = journeys.filter((j) => byQuery(j) && bySector(j));

    return {
      rows: journeys.filter((j) => byQuery(j) && bySector(j) && byChannels(j)),
      allSectorsCount: forSectorFacet.length,
      sectorCounts: Object.fromEntries(
        sectors.map((s) => [s, forSectorFacet.filter((j) => j.sector[lang] === s).length]),
      ) as Record<string, number>,
      channelCounts: Object.fromEntries(
        CHANNELS.map((c) => [c, forChannelFacet.filter((j) => j.channels.includes(c)).length]),
      ) as Record<Channel, number>,
    };
  }, [query, sector, channels, lang, sectors]);

  const activeCount = (sector ? 1 : 0) + channels.length + (query.trim() ? 1 : 0);
  const toggleChannel = (c: Channel) =>
    setChannels((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  const clearAll = () => { setQuery(""); setSector(""); setChannels([]); };

  const facetPanel = (
    <div className="flex flex-col gap-7">
      <FacetGroup
        title={t.sectorLabel}
        initialVisible={8}
        moreLabel={t.showMore}
        lessLabel={t.showLess}
      >
        {[
          <FacetRadio
            key="__all"
            label={t.allSectors}
            count={allSectorsCount}
            selected={!sector}
            onSelect={() => setSector("")}
          />,
          ...sectors.map((s) => (
            <FacetRadio
              key={s}
              label={s}
              count={sectorCounts[s] ?? 0}
              selected={sector === s}
              onSelect={() => setSector(sector === s ? "" : s)}
            />
          )),
        ]}
      </FacetGroup>

      <FacetGroup title={t.channelsLabel} moreLabel={t.showMore} lessLabel={t.showLess}>
        {CHANNELS.map((c) => (
          <FacetCheckbox
            key={c}
            label={CHANNEL_LABELS[c]}
            dot={DOT[c]}
            count={channelCounts[c] ?? 0}
            selected={channels.includes(c)}
            onSelect={() => toggleChannel(c)}
          />
        ))}
      </FacetGroup>
    </div>
  );

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12">
        {/* facets - a sidebar from lg up, a disclosure below it, where a
            twenty-row filter list above the results would bury them */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            className="flex w-full items-center justify-between border border-line bg-paper px-4 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:border-neutral-400 lg:hidden"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal aria-hidden className="size-4 text-neutral-500" />
              {t.filtersLabel}
              {activeCount > 0 ? <span className="text-blue-600">({activeCount})</span> : null}
            </span>
            <ChevronDown aria-hidden className={`size-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
          </button>
          <div className={`${filtersOpen ? "mt-6 block" : "hidden"} lg:mt-0 lg:block`}>{facetPanel}</div>
        </aside>

        <div className="min-w-0">
          <div className="flex items-center gap-3 border border-line bg-paper px-4 py-2.5 focus-within:border-blue-600">
            <Search aria-hidden className="size-4 shrink-0 text-neutral-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-neutral-500"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-ink-500 tabular-nums">
              {rows.length} / {journeys.length} {t.results}
            </p>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                <X aria-hidden className="size-3.5" />
                {t.clearAll}
              </button>
            ) : null}
          </div>

          {/* flat, filterable list of journeys */}
          {rows.length === 0 ? (
            <p className="py-16 text-center text-sm text-neutral-500">{t.empty}</p>
          ) : (
            <div className="mt-4">
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
              <div
                className="flex flex-wrap gap-1.5 sm:justify-end"
                title={t.supportedChannelsHint}
                aria-label={t.supportedChannels}
              >
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
        </div>
      </div>

      {/* slide-over flow panel */}
      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <button
            type="button" aria-label="Close"
            onClick={() => setOpen(null)}
            className="absolute inset-0 bg-ink-950/30"
          />
          <aside className="absolute inset-4 mx-auto flex max-w-2xl flex-col border border-line bg-paper shadow-2xl md:inset-y-10">
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
              {/* Supported channels, not "the channels used below". The example
                  sequence deliberately shows one build of the journey; the badge
                  says what it can run on. Labelled so that difference is legible
                  rather than looking like a mismatch. */}
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5" title={t.supportedChannelsHint}>
                <span className="altor-eyebrow text-ink-400">{t.supportedChannels}</span>
                {open.channels.map((c) => (
                  <span key={c} className="flex items-center gap-1.5 border border-line px-2 py-0.5 text-xs text-neutral-600">
                    <span aria-hidden className={`size-1.5 rounded-full ${DOT[c] ?? "bg-neutral-400"}`} />
                    {CHANNEL_LABELS[c] ?? c}
                  </span>
                ))}
              </div>
              <p className="mt-2 font-mono text-[11px]" style={{ color: "#a6adbd" }}>
                {t.clickToExplore}
              </p>
            </header>
            <div className="flex-1 overflow-y-auto bg-paper-soft px-5 py-6">
              {flows[open.slug] ? (
                <div className="mx-auto flex justify-center">
                  <JourneyFlow steps={flows[open.slug][lang]} t={t.flow} />
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

