import type { ReactNode } from "react";
import { ArrowRightLeft, Clock, Cog, Flag, LogOut, Mail, Split, UserRound, Zap } from "lucide-react";

import type { FlowNode } from "@/lib/canonical-view";
import type { Lang } from "@/lib/content";
import type { ChannelId, SignalSource } from "@/canonical/types";
import { CHANNEL_HUE } from "@/lib/journey-channels";

/* THE CANVAS NODE KIT, on the site's own system (Hulusi, 2026-09-14: "each
   canvas element needs to be redesigned and restructured; we need a design
   system for that - we already started it on the Lab page"). The cards
   now speak the Lab's drawn idiom: paper cards with a hairline ring and a
   soft shadow, a tinted icon tile per kind carrying a Lucide icon (the
   site's one icon set), plain-case labels on the 12px step, secondary
   states as quiet pills. Hierarchy stays as the grammar sets it: Action
   is the strongest (widest, four lines of its sentence), Trigger is the
   one filled card - brand blue, with the Entry pin standing on its top
   edge so the start of a journey is the first thing the eye finds
   ("Entry is so hard to see") - Condition and Wait are compact, Exit sits
   at rest on a dashed edge. Every word on a card is canonical prose or one
   of the kind names below; nothing is invented.

   Sizes are reserved by journey-canvas-layout.ts's SIZE table; keep the
   two in step when changing padding, type or clamps here. */

export function humanize(text: string): string {
  const words = text.replace(/[_.]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const KIND = {
  message: { tile: "bg-primary-50 text-primary-700", ink: "text-primary-700" },
  human: { tile: "bg-amber-50 text-amber-700", ink: "text-amber-700" },
  internal: { tile: "bg-paper-soft text-ink-600", ink: "text-ink-600" },
  condition: { tile: "bg-violet-50 text-violet-700", ink: "text-violet-700" },
  wait: { tile: "bg-teal-50 text-teal-700", ink: "text-teal-700" },
  handoff: { tile: "bg-indigo-50 text-indigo-700", ink: "text-indigo-700" },
  outcome: { tile: "bg-emerald-50 text-emerald-700", ink: "text-emerald-700" },
  exit: { tile: "bg-paper-soft text-ink-500", ink: "text-ink-500" },
} as const;

type Kind = (typeof KIND)[keyof typeof KIND];

/** The trigger's evidence-source pill (SignalSource is a closed 4-value
    enum, not canonical free prose) - a small bilingual lookup, same shape
    as CARD_TEXT below, not per-journey content. */
const SIGNAL_SOURCE_LABEL: Record<Lang, Record<SignalSource, string>> = {
  en: { authoritative: "Authoritative", declared: "Declared", behavioral: "Behavioral", inferred: "Inferred" },
  tr: { authoritative: "Yetkili kaynak", declared: "Beyan edilen", behavioral: "Davranışsal", inferred: "Çıkarımsal" },
};

const CARD_TEXT = {
  en: {
    trigger: "Trigger",
    decision: "Decision",
    wait: "Wait",
    handoff: "Handoff",
    outcome: "Outcome",
    exit: "Exit",
    external: "External",
    internal: "Internal",
    message: "Message",
    human: "Human",
    internalAction: "Internal",
    branches: (n: number) => `${n} branches`,
  },
  tr: {
    trigger: "Tetikleyici",
    decision: "Karar",
    wait: "Bekleme",
    handoff: "Devir",
    outcome: "Sonuç",
    exit: "Çıkış",
    external: "Dış",
    internal: "İç",
    message: "Mesaj",
    human: "İnsan",
    internalAction: "İç işlem",
    branches: (n: number) => `${n} dal`,
  },
} as const;

function Shell({
  children,
  className = "",
  onClick,
  ariaLabel,
  fit = false,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel: string;
  /** Wait is the one capsule: it shrinks to its own content. */
  fit?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`block h-full cursor-pointer text-left transition-[box-shadow,transform] duration-[var(--duration-fast)] hover:-translate-y-px hover:shadow-[0_10px_24px_-12px_rgb(10_16_32/0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
        fit ? "mx-auto w-fit" : "w-full"
      } ${className}`}
    >
      {children}
    </button>
  );
}

const CARD = "rounded-2xl bg-paper px-3.5 py-3 ring-1 ring-ink-950/[0.08] shadow-[0_1px_2px_rgb(10_16_32/0.04)]";
const FAR = {
  message: "[[data-lod=far]_&]:bg-primary-200 [[data-lod=far]_&]:ring-primary-300",
  human: "[[data-lod=far]_&]:bg-amber-200 [[data-lod=far]_&]:ring-amber-300",
  internal: "[[data-lod=far]_&]:bg-neutral-200 [[data-lod=far]_&]:ring-neutral-300",
  condition: "[[data-lod=far]_&]:bg-violet-200 [[data-lod=far]_&]:ring-violet-300",
  handoff: "[[data-lod=far]_&]:bg-indigo-200 [[data-lod=far]_&]:ring-indigo-300",
  outcome: "[[data-lod=far]_&]:bg-emerald-200 [[data-lod=far]_&]:ring-emerald-300",
} as const;

/* At a far zoom (the world's `data-lod="far"`, under 45%) a card gives up
   its words and becomes its icon: the tile grows to fill the card's top
   and the sentence, the pills and the kind label hide, so a zoomed-out
   journey reads as a diagram of coloured glyphs instead of specks. */
function Tile({ kind, children, className = "" }: { kind: Kind | { tile: string; ink: string }; children: ReactNode; className?: string }) {
  return (
    <span aria-hidden className={`grid size-6 shrink-0 place-items-center rounded-lg ${kind.tile} [&>svg]:size-3.5 [[data-lod=far]_&]:size-20 [[data-lod=far]_&]:rounded-3xl [[data-lod=far]_&]:bg-white/70 [[data-lod=far]_&]:[&>svg]:size-10 ${className}`}>
      {children}
    </span>
  );
}

function KindRow({ kind, icon, children }: { kind: Kind; icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <Tile kind={kind}>{icon}</Tile>
      <span className={`text-xs font-medium ${kind.ink} [[data-lod=far]_&]:hidden`}>{children}</span>
    </span>
  );
}

function Pill({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
        onDark ? "bg-white/15 text-white/85" : "bg-paper-soft text-ink-600"
      }`}
    >
      {children}
    </span>
  );
}

/* Trigger: the one filled card, brand blue. The Entry pin stands on its
   top edge in ink, so the start reads before anything else. */
export function TriggerCard({ node, onOpen, entryLabel, lang = "en" }: { node: FlowNode; onOpen: () => void; entryLabel: string; lang?: Lang }) {
  const w = CARD_TEXT[lang];
  return (
    <div className="relative h-full w-full">
      {node.isEntry ? (
        <span className="absolute -top-3.5 left-3 z-10 flex origin-bottom-left items-center gap-1 rounded-full bg-ink-950 px-2.5 py-1 text-xs font-semibold text-white shadow-[0_6px_16px_-8px_rgb(10_16_32/0.6)] ring-2 ring-paper [[data-lod=far]_&]:scale-[2.4]">
          <Zap aria-hidden className="size-3" />
          {entryLabel}
        </span>
      ) : null}
      <Shell onClick={onOpen} ariaLabel={node.headline} className="rounded-2xl bg-primary-600 px-3.5 py-3 text-white ring-1 ring-primary-700/40 shadow-[0_10px_24px_-14px_rgb(46_92_255/0.6)]">
        <span className="flex items-center gap-2">
          <Tile kind={{ tile: "bg-white/15 text-white", ink: "" }}>
            <Zap aria-hidden />
          </Tile>
          <span className="text-xs font-medium text-white/85 [[data-lod=far]_&]:hidden">{w.trigger}</span>
        </span>
        <p className="mt-2 line-clamp-2 text-[13.5px] leading-snug font-medium [[data-lod=far]_&]:hidden">{humanize(node.headline)}</p>
        {node.evidenceSource ? (
          <span className="mt-2 flex [[data-lod=far]_&]:hidden">
            <Pill onDark>{SIGNAL_SOURCE_LABEL[lang][node.evidenceSource]}</Pill>
          </span>
        ) : null}
      </Shell>
    </div>
  );
}

export function HandoffCard({ node, onOpen, lang = "en" }: { node: FlowNode; onOpen: () => void; lang?: Lang }) {
  const w = CARD_TEXT[lang];
  return (
    <Shell onClick={onOpen} ariaLabel={node.headline} className={`${CARD} ${FAR.handoff}`}>
      <KindRow kind={KIND.handoff} icon={<ArrowRightLeft aria-hidden />}>
        {w.handoff}
      </KindRow>
      <p className="mt-2 line-clamp-2 text-[13.5px] leading-snug text-ink-950 [[data-lod=far]_&]:hidden">{node.headline}</p>
      <span className="mt-2 flex [[data-lod=far]_&]:hidden">
        <Pill>{node.external ? w.external : w.internal}</Pill>
      </span>
    </Shell>
  );
}

export function OutcomeCard({ node, onOpen, lang = "en" }: { node: FlowNode; onOpen: () => void; lang?: Lang }) {
  const w = CARD_TEXT[lang];
  return (
    <Shell onClick={onOpen} ariaLabel={node.headline} className={`${CARD} ${FAR.outcome}`}>
      <KindRow kind={KIND.outcome} icon={<Flag aria-hidden />}>
        {w.outcome}
      </KindRow>
      <p className="mt-2 line-clamp-2 text-[13.5px] leading-snug text-ink-950 [[data-lod=far]_&]:hidden">{node.headline}</p>
    </Shell>
  );
}

/* Exit: at rest - a dashed edge, no fill, quieter ink. */
export function ExitCard({ node, onOpen, terminalLabel, lang = "en" }: { node: FlowNode; onOpen: () => void; terminalLabel: string; lang?: Lang }) {
  const w = CARD_TEXT[lang];
  return (
    <Shell onClick={onOpen} ariaLabel={node.headline} className="rounded-2xl border border-dashed border-ink-300 bg-paper/70 px-3.5 py-2.5 [[data-lod=far]_&]:bg-neutral-100">
      <span className="flex items-center gap-2">
        <Tile kind={KIND.exit}>
          <LogOut aria-hidden />
        </Tile>
        <span className="flex items-center gap-1.5 text-xs font-medium text-ink-500 [[data-lod=far]_&]:hidden">
          {w.exit}
          {node.terminal ? <Pill>{terminalLabel}</Pill> : null}
        </span>
      </span>
      <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-ink-600 [[data-lod=far]_&]:hidden">{node.headline}</p>
    </Shell>
  );
}

export function ActionCard({
  node,
  sequence,
  onOpen,
  messageLabels,
  humanLabels,
  lang = "en",
}: {
  node: FlowNode;
  sequence: number;
  onOpen: () => void;
  lang?: Lang;
  /** The journey's message-delivery surfaces, localised and ordered, with
      the channel id for its tint. Shown on a communication action only. */
  messageLabels: readonly { id: ChannelId; label: string }[];
  /** The journey's human routes (sales, task). Shown on a human action only. */
  humanLabels: readonly { id: ChannelId; label: string }[];
}) {
  const w = CARD_TEXT[lang];
  const execution = node.execution ?? "system";
  const kind = execution === "communication" ? KIND.message : execution === "human" ? KIND.human : KIND.internal;
  const icon = execution === "communication" ? <Mail aria-hidden /> : execution === "human" ? <UserRound aria-hidden /> : <Cog aria-hidden />;
  const label = execution === "communication" ? w.message : execution === "human" ? w.human : w.internalAction;
  const routes = execution === "communication" ? messageLabels : execution === "human" ? humanLabels : [];
  const far = execution === "communication" ? FAR.message : execution === "human" ? FAR.human : FAR.internal;
  return (
    <Shell onClick={onOpen} ariaLabel={node.headline} className={`${CARD} ${far}`}>
      <KindRow kind={kind} icon={icon}>
        {label} · {String(sequence).padStart(2, "0")}
      </KindRow>
      {/* The canonical sentence itself, clamped - the full text is in the
          detail panel; never a paraphrase. */}
      <p className="mt-2 line-clamp-4 text-[13.5px] leading-snug text-ink-950 [[data-lod=far]_&]:hidden">{node.headline}</p>
      {routes.length > 0 ? (
        <span className="mt-2 flex flex-wrap gap-1 [[data-lod=far]_&]:hidden">
          {routes.map((r) => (
            <span key={r.id} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CHANNEL_HUE[r.id].pill}`}>
              {r.label}
            </span>
          ))}
        </span>
      ) : null}
    </Shell>
  );
}

export function ConditionCard({ node, onOpen, lang = "en" }: { node: FlowNode; onOpen: () => void; lang?: Lang }) {
  const w = CARD_TEXT[lang];
  return (
    <Shell onClick={onOpen} ariaLabel={node.headline} className={`${CARD} ${FAR.condition}`}>
      <KindRow kind={KIND.condition} icon={<Split aria-hidden />}>
        {w.decision}
      </KindRow>
      <p className="mt-2 line-clamp-3 text-[13.5px] leading-snug font-medium text-ink-950 [[data-lod=far]_&]:hidden">{node.headline}</p>
      {typeof node.branchCount === "number" ? (
        <span className="mt-2 flex [[data-lod=far]_&]:hidden">
          <Pill>{w.branches(node.branchCount)}</Pill>
        </span>
      ) : null}
    </Shell>
  );
}

/* Wait: the capsule, compact, its own width. */
export function WaitCard({ node, onOpen }: { node: FlowNode; onOpen: () => void }) {
  return (
    <Shell
      onClick={onOpen}
      ariaLabel={node.headline}
      fit
      className="flex max-w-[240px] items-center gap-2 rounded-full bg-paper py-1.5 pr-3.5 pl-1.5 ring-1 ring-teal-200 shadow-[0_1px_2px_rgb(10_16_32/0.04)] [[data-lod=far]_&]:bg-teal-200 [[data-lod=far]_&]:p-0"
    >
      <Tile kind={KIND.wait}>
        <Clock aria-hidden />
      </Tile>
      <span className="line-clamp-2 text-[13px] leading-snug font-medium text-ink-800 [[data-lod=far]_&]:hidden">{humanize(node.headline)}</span>
    </Shell>
  );
}
