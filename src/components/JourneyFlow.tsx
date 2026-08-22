"use client";

import { createContext, useContext, useState, type ComponentType, type KeyboardEvent } from "react";

import type { FlowStep } from "@/lib/flows";
import {
  ConditionIcon,
  EmailIcon,
  ExitIcon,
  InAppIcon,
  PushIcon,
  SalesRepIcon,
  SmsIcon,
  TriggerIcon,
  WaitIcon,
  WhatsAppIcon,
} from "@/components/ui/JourneyIcons";
import type { copy, Lang } from "@/lib/content";

/* Journey Detail - approved design, Turn 7 (7a linear / 7b two-way branch /
   7c branch+merge / 7d front-back anatomy / 7e mobile). See the design brief
   for the full spec; this file is the data-driven renderer, not tied to any
   one journey. Scan mode by default: action cards show icon + channel +
   number + title only. Clicking one crossfades to its back face in the same
   footprint - the strategic "why" this site can honestly show is the
   message's own description (`step.b`); the source data has no separate
   why/execution/test breakdown per step, so the back face shows that one
   real paragraph rather than three invented ones. Wait, condition and exit
   are never interactive. */

type FlowT = (typeof copy)[Lang]["lab"]["page"]["flow"];
const FlowTContext = createContext<FlowT | null>(null);
function useFlowT(): FlowT {
  const t = useContext(FlowTContext);
  if (!t) throw new Error("useFlowT used outside JourneyFlow");
  return t;
}

type ChannelMeta = {
  Icon: ComponentType<{ className?: string }>;
  accent: string;
  iconBg: string;
  iconBorder: string;
};

const CHANNEL_META: Record<string, ChannelMeta> = {
  email: { Icon: EmailIcon, accent: "#154ce4", iconBg: "#f3f7ff", iconBorder: "#a4c2ff" },
  push: { Icon: PushIcon, accent: "#b45309", iconBg: "#fdf6ec", iconBorder: "#f0c48c" },
  sms: { Icon: SmsIcon, accent: "#3a445c", iconBg: "#f0f2f6", iconBorder: "#cdd2dd" },
  inapp: { Icon: InAppIcon, accent: "#6d28d9", iconBg: "#f5f1fc", iconBorder: "#c9b8f0" },
  whatsapp: { Icon: WhatsAppIcon, accent: "#0f766e", iconBg: "#ecfdf6", iconBorder: "#8fdcc4" },
  sales: { Icon: SalesRepIcon, accent: "#232c42", iconBg: "#eef0f4", iconBorder: "#cdd2dd" },
};

function isAction(t: string): t is keyof FlowT["channel"] {
  return t in CHANNEL_META;
}
function isNode(t: string): boolean {
  return isAction(t) || t === "entry" || t === "exit";
}

/* ---------------------------------------------------------------- parsing */

type Node = { step: FlowStep; before: FlowStep[]; num?: string };
type BranchColumn = {
  label?: string;
  nodes: Node[];
  /** Wait/condition steps after the column's last card. They describe what
      happens between that card and the merge, so they render at the foot of
      the column - dropping them, which is what an earlier version did, threw
      away real steps whenever a branch ended on a wait. */
  trailing: FlowStep[];
};
type FlowItem =
  | { kind: "node"; node: Node }
  | { kind: "branch"; before: FlowStep[]; columns: BranchColumn[] };

const LETTERS = "ABCDEFGHIJ";

function parseFlow(steps: FlowStep[]) {
  const items: FlowItem[] = [];
  let pending: FlowStep[] = [];
  let actionCount = 0;
  const nextNum = () => String(++actionCount).padStart(2, "0");

  const groupColumn = (colSteps: FlowStep[], suffix: string): { nodes: Node[]; trailing: FlowStep[] } => {
    const nodes: Node[] = [];
    let colPending: FlowStep[] = [];
    for (const s of colSteps) {
      if (isNode(s.t)) {
        const num = isAction(s.t) ? `${nextNum()}${suffix}` : undefined;
        nodes.push({ step: s, before: colPending, num });
        colPending = [];
      } else {
        colPending.push(s);
      }
    }
    return { nodes, trailing: colPending };
  };

  let i = 0;
  while (i < steps.length) {
    const s = steps[i];
    if (s.branch != null) {
      let j = i;
      while (j < steps.length && steps[j].branch != null) j++;
      const run = steps.slice(i, j);
      const nums = Array.from(new Set(run.map((r) => r.branch!))).sort((a, b) => a - b);
      const columns: BranchColumn[] = nums.map((num, ci) => {
        const colSteps = run.filter((r) => r.branch === num);
        const label = colSteps.find((r) => r.branchLabel)?.branchLabel;
        return { label, ...groupColumn(colSteps, LETTERS[ci] ?? String(ci + 1)) };
      });
      items.push({ kind: "branch", before: pending, columns });
      pending = [];
      i = j;
      continue;
    }
    if (isNode(s.t)) {
      const num = isAction(s.t) ? nextNum() : undefined;
      items.push({ kind: "node", node: { step: s, before: pending, num } });
      pending = [];
      i++;
      continue;
    }
    pending.push(s);
    i++;
  }
  return { items, trailing: pending };
}

/* --------------------------------------------------------------- connector */

/** The line between two nodes. Wait/condition sit on it as small labelled
    rows rather than cards of their own - they describe the gap, they aren't
    a touchpoint.

    Condition semantics, since the design draws a single arm and the false
    arm has to mean something definite: a condition is a single-branch gate.
    The node directly below it runs only when the condition is true. When it
    is false that one node is skipped and the journey continues to the next
    applicable step - it does not end there. A journey that should stop on
    the false arm says so with an explicit `exit` node, and one that should
    move the person to a different journey says so with a handoff in
    `journeys.ts`. Nothing is left implied. */
function Connector({ items }: { items: FlowStep[] }) {
  const t = useFlowT();
  return (
    <div className="relative flex flex-col items-center">
      <span aria-hidden className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#cdd2dd]" />
      {items.length > 0 ? (
        <div className="relative z-10 flex flex-col items-center gap-1 py-1.5">
          <span aria-hidden className="h-[7px] w-px bg-[#cdd2dd]" />
          {items.map((it, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 py-px font-mono text-[11px]"
              style={{ color: it.t === "condition" ? "#1a7f37" : "#566078" }}
              title={it.t === "condition" ? t.conditionHint : t.wait}
            >
              {it.t === "condition" ? <ConditionIcon className="size-3.5 shrink-0" /> : <WaitIcon className="size-3.5 shrink-0" />}
              {it.a}
            </span>
          ))}
          <span aria-hidden className="h-[5px] w-px bg-[#cdd2dd]" />
        </div>
      ) : (
        <span aria-hidden className="h-4 w-px bg-[#cdd2dd]" />
      )}
      <Arrow />
    </div>
  );
}

function Arrow() {
  return (
    <span
      aria-hidden
      className="relative z-10 -mt-px h-0 w-0 shrink-0"
      style={{ borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid #a6adbd" }}
    />
  );
}

/** The fork/merge geometry - one stem spreading into N column drops (used
    reading either direction: expanding into a branch, or converging out of
    one). Pure CSS, no measurement: the horizontal bar spans exactly from
    the first column's centre to the last column's centre for any N because
    those centres sit at 100%/(2N) and 100% - 100%/(2N) in an N-up grid. */
function BranchFan({ columnCount }: { columnCount: number }) {
  const half = `${100 / (columnCount * 2)}%`;
  return (
    <div className="relative h-[22px] w-full" aria-hidden>
      <span className="absolute top-0 left-1/2 h-[6px] w-px -translate-x-1/2 bg-[#cdd2dd]" />
      <span className="absolute top-[6px] h-px bg-[#cdd2dd]" style={{ left: half, right: half }} />
      {Array.from({ length: columnCount }).map((_, ci) => {
        const pct = (100 * (ci + 0.5)) / columnCount;
        return <span key={ci} className="absolute top-[6px] h-[10px] w-px bg-[#cdd2dd]" style={{ left: `${pct}%` }} />;
      })}
      {Array.from({ length: columnCount }).map((_, ci) => {
        const pct = (100 * (ci + 0.5)) / columnCount;
        return (
          <span
            key={ci}
            className="absolute top-[15px] h-0 w-0 -translate-x-1/2"
            style={{ left: `${pct}%`, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid #a6adbd" }}
          />
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------- entry/exit */

function TriggerCard({ step }: { step: FlowStep }) {
  const t = useFlowT();
  return (
    <div className="flex w-full items-start gap-3 bg-[#05080f] px-3.5 py-2.5 text-white">
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center border"
        style={{ borderColor: "rgba(255,255,255,.3)", color: "#a4c2ff" }}
      >
        <TriggerIcon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[11px] tracking-wide" style={{ color: "rgba(255,255,255,.55)" }}>
          {t.trigger}
        </p>
        <p className="mt-[3px] text-[13px] leading-[1.45]">{step.a}</p>
        {step.b ? (
          <p className="mt-1.5 text-[11px] leading-[1.45]" style={{ color: "rgba(255,255,255,.55)" }}>
            {step.b}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ExitCard({ step }: { step: FlowStep }) {
  const t = useFlowT();
  return (
    <div className="flex w-full items-center gap-3 border px-3.5 py-2.5" style={{ borderColor: "#cdd2dd", color: "#566078" }}>
      <ExitIcon className="size-3.5 shrink-0" />
      <span className="shrink-0 font-mono text-[11px] tracking-wide">{t.exit}</span>
      <span className="text-[13px]" style={{ color: "#3a445c" }}>
        {step.a}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------- action card */

function ActionCard({ step, num, dense }: { step: FlowStep; num?: string; dense?: boolean }) {
  const t = useFlowT();
  const [open, setOpen] = useState(false);
  const meta = CHANNEL_META[step.t];
  const toggle = () => setOpen((o) => !o);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };
  if (!meta || !isAction(step.t)) return null;
  const label = t.channel[step.t];
  const pad = dense ? "px-2.5 py-2" : "px-3.5 py-[11px]";

  /* Inside a branch the card is a column wide, not a flow wide - three columns
     leaves about 130px. The full-width layout puts the icon, the title and the
     "Details +" affordance on one row, which at that width squeezed the title
     to literally zero and rendered a card with no name on it. Dense stacks
     instead: icon and channel on the first line, the title on its own line
     with the whole width to itself, and no "Details +" - the header already
     says the steps are clickable, and the card keeps its hover and focus
     states. */
  return (
    <div className="relative">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className={`flex cursor-pointer border ${pad} transition-colors hover:border-[#a6adbd] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 ${
          dense ? "flex-col gap-1" : "items-center gap-3"
        }`}
        style={{ borderColor: "#e4e7ee", borderTopWidth: 2, borderTopColor: meta.accent }}
      >
        {dense ? (
          <>
            <div className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="flex size-5 shrink-0 items-center justify-center border"
                style={{ borderColor: meta.iconBorder, background: meta.iconBg, color: meta.accent }}
              >
                <meta.Icon className="size-3" />
              </span>
              <p className="truncate font-mono text-[10px] tracking-wide">
                <span style={{ color: meta.accent, fontWeight: 500 }}>{label}</span>
                {num ? <span style={{ color: "#a6adbd" }}> · {num}</span> : null}
              </p>
            </div>
            <p className="text-[13px] leading-snug font-semibold tracking-tight text-ink-950">{step.title ?? label}</p>
          </>
        ) : (
          <>
            <span
              aria-hidden
              className="flex size-7 shrink-0 items-center justify-center border"
              style={{ borderColor: meta.iconBorder, background: meta.iconBg, color: meta.accent }}
            >
              <meta.Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[11px] tracking-wide">
                <span style={{ color: meta.accent, fontWeight: 500 }}>{label}</span>
                {num ? <span style={{ color: "#a6adbd" }}> · {num}</span> : null}
              </p>
              <p className="mt-[3px] truncate text-[15px] font-semibold tracking-tight text-ink-950">{step.title ?? label}</p>
            </div>
            <span className="shrink-0 font-mono text-[11px] whitespace-nowrap text-blue-600">{t.details}</span>
          </>
        )}
      </div>

      {open ? (
        <div
          role="button"
          tabIndex={0}
          onClick={toggle}
          onKeyDown={onKeyDown}
          className={`animate-[journeycardfade_.18s_ease] absolute inset-0 z-10 cursor-pointer border bg-paper ${pad} focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600`}
          style={{ borderColor: "#a6adbd", borderTopWidth: 2, borderTopColor: meta.accent }}
        >
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[11px] font-medium tracking-wide" style={{ color: meta.accent }}>
              {label}
              {num ? ` · ${num}` : ""}
            </span>
            <span className="ml-auto font-mono text-[11px]" style={{ color: "#566078" }}>
              {t.back}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "#3a445c" }}>
            {step.b}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------- node */

function NodeRow({ node }: { node: Node }) {
  return (
    <div className="flex flex-col items-stretch">
      <Connector items={node.before} />
      {node.step.t === "entry" ? (
        <TriggerCard step={node.step} />
      ) : node.step.t === "exit" ? (
        <ExitCard step={node.step} />
      ) : (
        <ActionCard step={node.step} num={node.num} />
      )}
    </div>
  );
}

function ColumnBody({ col }: { col: BranchColumn }) {
  return (
    <>
      {col.nodes.map((n, ni) => (
        <div key={ni} className="flex flex-col items-stretch">
          {ni > 0 ? <Connector items={n.before} /> : null}
          {n.step.t === "exit" ? <ExitCard step={n.step} /> : <ActionCard step={n.step} num={n.num} dense />}
        </div>
      ))}
      {col.trailing.length > 0 ? <Connector items={col.trailing} /> : null}
    </>
  );
}

/** Side-by-side columns with the fork/merge fan - only makes sense once
    there's room for each column to hold an action card without breaking, so
    this whole block is desktop-only (`hidden sm:flex`); MobileBranch below
    is its 7e counterpart for narrow viewports. */
function DesktopBranch({ columns, merges }: { columns: BranchColumn[]; merges: boolean }) {
  const t = useFlowT();
  return (
    <div className="hidden flex-col items-stretch sm:flex">
      <BranchFan columnCount={columns.length} />
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr))` }}>
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col items-stretch">
            <p className="pb-[5px] text-center font-mono text-[10px] tracking-wide text-ink-500 uppercase">
              {col.label ?? `${t.path} ${LETTERS[ci]}`}
            </p>
            <ColumnBody col={col} />
          </div>
        ))}
      </div>
      {merges ? <BranchFan columnCount={columns.length} /> : null}
    </div>
  );
}

/** 7e's mobile treatment: branches stack as labelled path blocks on a 2px
    rail instead of side-by-side columns - no fan geometry, since there's
    nothing to fan across on a single-column layout. */
function MobileBranch({ columns, merges }: { columns: BranchColumn[]; merges: boolean }) {
  const t = useFlowT();
  return (
    <div className="flex flex-col items-stretch gap-1.5 sm:hidden">
      <div className="flex justify-center">
        <Arrow />
      </div>
      {columns.map((col, ci) => (
        <div key={ci} className="ml-2.5 flex flex-col gap-1.5 border-l-2 py-2 pl-3.5" style={{ borderColor: "#cdd2dd" }}>
          <p className="font-mono text-[10px] tracking-wide text-ink-500 uppercase">
            {t.path} {LETTERS[ci]}
            {col.label ? ` · ${col.label}` : ""}
          </p>
          <ColumnBody col={col} />
        </div>
      ))}
      {merges ? (
        <div className="flex flex-col items-center">
          <p className="py-1 font-mono text-[10px] tracking-wide text-ink-500 uppercase">{t.pathsMerge}</p>
          <span aria-hidden className="h-[6px] w-px bg-[#cdd2dd]" />
          <Arrow />
        </div>
      ) : null}
    </div>
  );
}

function BranchRow({
  before,
  columns,
  merges,
}: {
  before: FlowStep[];
  columns: BranchColumn[];
  /** false when every column ends its own way (its own exit, or simply the
      journey ending) rather than rejoining a shared next step. */
  merges: boolean;
}) {
  return (
    <div className="flex flex-col items-stretch">
      <Connector items={before} />
      <DesktopBranch columns={columns} merges={merges} />
      <MobileBranch columns={columns} merges={merges} />
    </div>
  );
}

/* -------------------------------------------------------------------- flow */

export default function JourneyFlow({ steps, t }: { steps: FlowStep[]; t: FlowT }) {
  const { items, trailing } = parseFlow(steps);
  return (
    <FlowTContext.Provider value={t}>
      <div className="flex flex-col items-stretch" style={{ width: "min(100%, 26.25rem)" }}>
        <style>{"@keyframes journeycardfade{from{opacity:0}to{opacity:1}}"}</style>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          if (item.kind === "node") return <NodeRow key={i} node={item.node} />;
          // Draw the closing fan only when something actually follows to
          // converge into - another item, or leftover wait/condition text.
          // A branch that's the very last thing in the journey (each column
          // ending in its own exit, or the data just stopping) gets no fan
          // pointed at nothing.
          const merges = !isLast || trailing.length > 0;
          return <BranchRow key={i} before={item.before} columns={item.columns} merges={merges} />;
        })}
        {trailing.length > 0 ? <Connector items={trailing} /> : null}
      </div>
    </FlowTContext.Provider>
  );
}
