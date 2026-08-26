import type { ReactNode } from "react";
import {
  ArrowRightLeft, Clock, GitBranch, LogOut, Play, Zap, Flag,
} from "lucide-react";

import type { FlowNode, NodeKind } from "@/lib/journey-marketing";
import type { Lang } from "@/lib/content";

/* Journey-specific visual grammar for /lab/claude-lifecycle.

   DELIBERATELY NOT the A/B Test page's grammar. That page is built from
   cards, rows and result panels because an experiment is an OBJECT. A
   journey is a GRAPH, so this page is built from nodes, connectors,
   branches and time. The two pages share typography, spacing, container,
   buttons, borders and motion - and share no composition.

   NODE SYSTEM. Seven real kinds from src/canonical/types.ts, distinguished
   by icon + a 3px left rule + (for `wait` only) a dashed border. Not seven
   saturated fills: the brief's own rule, and the site's two-hue system
   (brand blue + ink) has no room for a rainbow. The rules read as a scale
   of "how much this node commits you":

     trigger   primary-600   the entry point
     action    primary-400   the system does something
     condition ink-950       a real fork, drawn with authority
     wait      ink-300 +     time - dashed, because it is the only kind
               dashed         that is a pause rather than a step
     handoff   primary-700   ownership leaves this journey
     exit      ink-200       the end of ownership, deliberately quiet
     outcome   ink-400       in the schema, 1 of 3,186 nodes - legend only

   CONNECTORS are CSS rules, not SVG paths, for the big flows: a 1px border
   cannot misalign against the box it is attached to, which is what makes
   the diagrams survive 375px without a viewBox to fight. The one SVG here
   is the branch fork, whose fixed viewBox scales cleanly at any width.

   ACCESSIBILITY: every node carries its kind as real text (the mono label),
   not only as colour or position; branch meaning is a real text pill;
   decorative rules are aria-hidden. */

/* ---- Node kind system ------------------------------------------------ */

export const NODE_KIND_META: Record<
  NodeKind,
  { icon: typeof Zap; rule: string; en: string; tr: string }
> = {
  trigger:   { icon: Zap,            rule: "bg-primary-600", en: "Trigger",   tr: "Tetikleyici" },
  action:    { icon: Play,           rule: "bg-primary-400", en: "Action",    tr: "Aksiyon" },
  condition: { icon: GitBranch,      rule: "bg-ink-950",     en: "Condition", tr: "Koşul" },
  wait:      { icon: Clock,          rule: "bg-ink-300",     en: "Wait",      tr: "Bekleme" },
  handoff:   { icon: ArrowRightLeft, rule: "bg-primary-700", en: "Handoff",   tr: "Devir" },
  exit:      { icon: LogOut,         rule: "bg-ink-200",     en: "Exit",      tr: "Çıkış" },
  outcome:   { icon: Flag,           rule: "bg-ink-400",     en: "Outcome",   tr: "Sonuç" },
};

export const kindLabel = (k: NodeKind, lang: Lang) => NODE_KIND_META[k][lang];

/* ---- The node ---------------------------------------------------------
   One shape for every kind. Differentiation is the left rule + icon +
   label, never the box itself, so a diagram of six kinds still reads as
   one system. `wait` alone gets a dashed border - time is the one thing
   that is not a step. */
export function JourneyNode({
  kind,
  title,
  detail,
  lang,
  size = "md",
  muted = false,
}: {
  kind: NodeKind;
  title: string;
  detail?: string;
  lang: Lang;
  size?: "sm" | "md";
  muted?: boolean;
}) {
  const meta = NODE_KIND_META[kind];
  const Icon = meta.icon;
  const dashed = kind === "wait";
  return (
    <div
      className={`relative flex overflow-hidden rounded-md bg-paper ${
        dashed ? "border border-dashed border-ink-300" : "border border-line-soft"
      } ${muted ? "opacity-70" : ""}`}
    >
      <span aria-hidden className={`w-[3px] shrink-0 ${meta.rule}`} />
      <div className={size === "sm" ? "min-w-0 px-3 py-2.5" : "min-w-0 px-4 py-3"}>
        <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-ink-400 uppercase">
          <Icon aria-hidden className="size-3" />
          {meta[lang]}
        </p>
        <p
          className={`mt-1 leading-snug text-ink-950 ${
            size === "sm" ? "text-[12px]" : "text-[13px]"
          }`}
        >
          {title}
        </p>
        {detail && <p className="mt-1 text-[11px] leading-snug text-ink-500">{detail}</p>}
      </div>
    </div>
  );
}

/* ---- Connectors -------------------------------------------------------
   A vertical rule, optionally carrying a branch label. Pure CSS: it is a
   border on a box that sits between two nodes in the same flex column, so
   it is always exactly aligned with them. */
export function Connector({ label, height = "h-7" }: { label?: string; height?: string }) {
  return (
    <div className={`relative flex ${height} shrink-0 justify-center`}>
      <span aria-hidden className="w-px bg-line-strong" />
      {label && (
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line-soft bg-paper px-2 py-0.5 text-[10px] font-medium whitespace-nowrap text-ink-600">
          {label}
        </span>
      )}
    </div>
  );
}

/* A fork: one rule down, a horizontal span, then a rule down into each
   arm. Drawn with borders so the corners meet exactly. */
export function Fork({
  children,
  nested = false,
}: {
  children: ReactNode;
  /** A fork inside another fork's arm. Stacks below `sm`: a nested fork
      splits an already-halved column, which at 375 left each arm ~75px -
      too narrow for a node, and the exit's text clipped. The TOP-level
      fork never stacks, because side-by-side arms are the one thing this
      diagram exists to show. */
  nested?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <div aria-hidden className="flex h-5 justify-center">
        <span className="w-px bg-line-strong" />
      </div>
      <div aria-hidden className="mx-auto h-px w-1/2 bg-line-strong sm:w-2/3" />
      <div
        className={
          nested
            ? "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5"
            : "grid grid-cols-2 gap-3 sm:gap-5"
        }
      >
        {children}
      </div>
    </div>
  );
}

/** One arm of a fork: a short rule down from the horizontal span, the
    branch's real label, then the arm's content. */
export function ForkArm({
  label,
  children,
  align = "center",
}: {
  label: string;
  children: ReactNode;
  align?: "left" | "center" | "right";
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <div
        aria-hidden
        className={`flex h-4 ${
          align === "left" ? "justify-center" : align === "right" ? "justify-center" : "justify-center"
        }`}
      >
        <span className="w-px bg-line-strong" />
      </div>
      {/* wraps rather than truncates: at 375 a second-level arm is ~160px
          and `truncate` cut "on timeout" to "on time…". Branch meaning is
          the one thing on this diagram that may not be abbreviated. */}
      <span className="mx-auto mb-2 max-w-full rounded-full border border-line-soft bg-paper px-2.5 py-0.5 text-center text-[10px] leading-tight font-medium text-balance text-ink-600">
        {label}
      </span>
      {children}
    </div>
  );
}

/* ---- The node-kind legend --------------------------------------------
   Real counts, so the legend doubles as an honest weighting: `outcome`
   shows its true 1, rather than being dressed as a peer of the other six. */
export function NodeLegend({
  counts,
  lang,
}: {
  counts: readonly { kind: NodeKind; count: number }[];
  lang: Lang;
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {counts.map((c) => {
        const meta = NODE_KIND_META[c.kind];
        const Icon = meta.icon;
        return (
          <li
            key={c.kind}
            className="inline-flex items-center gap-2 rounded-full border border-line-soft bg-paper py-1.5 pr-3 pl-2"
          >
            <span aria-hidden className={`h-4 w-[3px] rounded-full ${meta.rule}`} />
            <Icon aria-hidden className="size-3.5 text-ink-400" />
            <span className="text-[13px] text-ink-700">{meta[lang]}</span>
            <span className="font-mono text-[11px] text-ink-400 tabular-nums">
              {c.count.toLocaleString(lang === "en" ? "en-US" : "tr-TR")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ---- A card's mini flow strip ----------------------------------------
   What makes a journey card read as a FLOW rather than an article: the
   journey's real node kinds, in graph order, as a chain of dots. This is
   the single clearest visual separation from the A/B page's cards. */
export function FlowStrip({ strip, lang }: { strip: readonly NodeKind[]; lang: Lang }) {
  return (
    <div className="flex items-center gap-1" aria-label={strip.map((k) => kindLabel(k, lang)).join(" → ")}>
      {strip.map((k, i) => (
        <span key={`${k}-${i}`} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden className="h-px w-2.5 bg-line-strong" />}
          <span
            aria-hidden
            title={kindLabel(k, lang)}
            className={`size-2.5 shrink-0 rounded-full ${NODE_KIND_META[k].rule}`}
          />
        </span>
      ))}
    </div>
  );
}

/* ---- Helper: pull a projected node out of the featured graph ---------- */
export const nodeById = (nodes: readonly FlowNode[], id: string) =>
  nodes.find((n) => n.id === id);
