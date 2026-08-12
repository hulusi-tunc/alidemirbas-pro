"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Clock, Flag, GitBranch, Search, X } from "lucide-react";

import { journeys, type Journey } from "@/lib/journeys";
import { flows, type FlowStep } from "@/lib/flows";
import type { copy, Lang } from "@/lib/content";

const CHANNELS = ["email", "push", "sms", "inapp", "whatsapp"] as const;
const CHANNEL_LABELS: Record<string, string> = {
  email: "Email", push: "Push", sms: "SMS", inapp: "In-app", whatsapp: "WhatsApp",
};
const DOT: Record<string, string> = {
  email: "bg-blue-600", push: "bg-amber-500", sms: "bg-neutral-500",
  inapp: "bg-violet-500", whatsapp: "bg-green-600", sales: "bg-ink-700",
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
              <div className="mt-3 flex flex-wrap gap-1.5">
                {open.channels.map((c) => (
                  <span key={c} className="flex items-center gap-1.5 border border-line px-2 py-0.5 text-xs text-neutral-600">
                    <span aria-hidden className={`size-1.5 rounded-full ${DOT[c] ?? "bg-neutral-400"}`} />
                    {CHANNEL_LABELS[c] ?? c}
                  </span>
                ))}
              </div>
            </header>
            <div className="flex-1 overflow-y-auto bg-paper-soft">
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

// Steps that are a real action in the journey - everything else (wait,
// condition) is metadata ABOUT the gap between two actions, not an action
// itself, so it renders on the connector rather than as its own card.
const NODE_TYPES = new Set(["entry", "email", "push", "sms", "inapp", "whatsapp", "sales"]);

function groupFlow(steps: FlowStep[]) {
  const nodes: { step: FlowStep; before: FlowStep[] }[] = [];
  let pending: FlowStep[] = [];
  for (const s of steps) {
    if (NODE_TYPES.has(s.t)) {
      nodes.push({ step: s, before: pending });
      pending = [];
    } else {
      pending.push(s);
    }
  }
  return { nodes, trailing: pending };
}

/** The line between two action cards - wait/condition steps sit on it as
    small labels rather than full-width cards, so they read as gaps in the
    timeline instead of competing with the actions for visual weight. */
function Connector({ items }: { items: FlowStep[] }) {
  return (
    <div className="relative flex flex-col items-center">
      <span aria-hidden className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-neutral-300" />
      {items.length > 0 ? (
        <div className="relative z-10 flex flex-col items-center gap-1.5 py-3">
          {items.map((it, i) => (
            <span
              key={i}
              className={
                it.t === "condition"
                  ? "flex items-center gap-1.5 border border-dashed border-neutral-400 bg-paper px-2.5 py-1 text-xs text-ink-700"
                  : "flex items-center gap-1.5 border border-line bg-paper px-2.5 py-1 text-xs text-neutral-600"
              }
            >
              {it.t === "condition" ? (
                <GitBranch aria-hidden className="size-3 shrink-0 text-neutral-500" />
              ) : (
                <Clock aria-hidden className="size-3 shrink-0 text-neutral-400" />
              )}
              {it.a}
            </span>
          ))}
        </div>
      ) : (
        <div className="h-6" />
      )}
      <ChevronDown aria-hidden className="relative z-10 size-4 shrink-0 -mt-1 text-neutral-400" />
    </div>
  );
}

function NodeCard({ step }: { step: FlowStep }) {
  if (step.t === "entry") {
    return (
      <div className="w-full bg-ink-950 p-5 text-white">
        <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-white/60">
          <Flag aria-hidden className="size-3.5" />
          Entry - Trigger
        </p>
        <p className="mt-2 text-sm leading-relaxed font-medium">{step.a}</p>
        {step.b ? <p className="mt-2 text-xs leading-relaxed text-white/65">{step.b}</p> : null}
      </div>
    );
  }
  const style = STEP_STYLE[step.t];
  return (
    <div className={`w-full border border-line bg-paper p-4 ${style?.bar ?? ""}`}>
      <p className={`flex items-center gap-1.5 text-xs font-semibold ${style?.label ?? "text-ink-700"}`}>
        <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${DOT[step.t] ?? "bg-ink-700"}`} />
        {step.a}
      </p>
      {step.b ? <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{step.b}</p> : null}
    </div>
  );
}

function Flow({ steps }: { steps: FlowStep[] }) {
  const { nodes, trailing } = groupFlow(steps);
  return (
    <div className="px-6 py-10">
      <div className="mx-auto flex max-w-md flex-col items-stretch">
        {nodes.map((n, i) => (
          <div key={i} className="flex flex-col items-stretch">
            {i > 0 ? <Connector items={n.before} /> : null}
            <NodeCard step={n.step} />
          </div>
        ))}
        {trailing.length > 0 ? <Connector items={trailing} /> : null}
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
