"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, CornerLeftUp } from "lucide-react";

import type { FlowEdge, FlowNode } from "@/lib/canonical-view";

/* Renders a canonical journey as what it is: a graph.

   The archive this replaced drew a column of cards, which worked because its
   flows were sequences with the occasional parallel run. A canonical journey
   is not a sequence - a condition has two to five branches, a wait has an
   event arm and a timeout arm, and several nodes are reached from more than
   one place. Drawing that as a column and relying on "the next card down" to
   mean "what happens next" would be a lie about the journey.

   So every node names its own successors. The order is breadth-first from the
   entry, which is close enough to reading order to be comfortable, and the
   edges are on the card rather than between the cards. An edge naming a node
   in this journey is a link to it, because 1561 node ids across the library
   is far too many to find by eye; the 5% of edges that point back up the page
   say so before you follow them.

   It takes one journey's nodes as props and imports nothing from the
   canonical library, which is what keeps the other 255 out of the bundle. */

const KIND_LABEL: Record<FlowNode["kind"], string> = {
  trigger: "TRIGGER",
  action: "ACTION",
  condition: "CONDITION",
  wait: "WAIT",
  outcome: "OUTCOME",
  exit: "EXIT",
  handoff: "HANDOFF",
};

const KIND_TONE: Record<FlowNode["kind"], string> = {
  trigger: "border-ink-900 text-ink-900",
  action: "border-line-strong text-ink-600",
  condition: "border-emerald-600/40 text-emerald-700",
  wait: "border-line-strong text-ink-400",
  outcome: "border-line-strong text-ink-600",
  exit: "border-ink-300 text-ink-500",
  handoff: "border-blue-600/40 text-blue-700",
};

export type FlowLabels = { more: string; less: string; terminal: string };

const nodeDomId = (nodeId: string) => `node-${nodeId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

function EdgeTarget({
  edge,
  basePath,
  onJump,
}: {
  edge: FlowEdge;
  basePath: string;
  onJump: (to: string) => void;
}) {
  const mono = "font-mono text-[12px]";

  if (edge.kind === "external") {
    return <span className={`${mono} text-ink-400`}>{edge.to}</span>;
  }
  if (edge.kind === "journey") {
    return (
      <Link href={`${basePath}/${edge.href}`} className={`${mono} text-blue-700 hover:underline`}>
        {edge.to}
      </Link>
    );
  }
  return (
    <a
      href={`#${nodeDomId(edge.to)}`}
      onClick={() => onJump(edge.to)}
      className={`${mono} text-ink-700 underline-offset-2 hover:text-blue-700 hover:underline`}
    >
      {edge.to}
    </a>
  );
}

function NodeCard({
  node,
  basePath,
  labels,
  flashed,
  onJump,
}: {
  node: FlowNode;
  basePath: string;
  labels: FlowLabels;
  flashed: boolean;
  onJump: (to: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasMore = node.meta.length > 0 || node.detail !== null;

  return (
    <li className="relative">
      <div
        id={nodeDomId(node.id)}
        className={`scroll-mt-24 border-l-2 pl-4 transition-colors duration-500 ${KIND_TONE[node.kind]} ${
          flashed ? "bg-blue-600/[0.07]" : ""
        }`}
      >
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-mono text-[10px] tracking-wider">{KIND_LABEL[node.kind]}</span>
          <span className="font-mono text-[10px] text-ink-400">{node.id}</span>
          {node.isEntry ? <span className="font-mono text-[10px] text-ink-400">· entry</span> : null}
          {node.terminal ? (
            <span className="border border-ink-300 px-1.5 py-px text-[10px] tracking-wide text-ink-600">
              {labels.terminal}
            </span>
          ) : null}
        </div>

        <p className="mt-1 text-[15px] leading-snug text-ink-950">{node.headline}</p>
        {/* The engine's name for the event, kept underneath the sentence that
            says what it means rather than in place of it. */}
        {node.eventId ? (
          <p className="mt-0.5 font-mono text-[11px] break-all text-ink-400">{node.eventId}</p>
        ) : null}

        {hasMore ? (
          <>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-1 font-mono text-[11px] text-ink-400 underline-offset-2 hover:text-ink-600 hover:underline"
            >
              {open ? labels.less : labels.more}
            </button>
            {open ? (
              <div className="mt-1.5 space-y-1">
                {node.detail ? <p className="text-sm text-ink-600">{node.detail}</p> : null}
                {node.meta.map((m) => (
                  <p key={m} className="text-[13px] leading-snug text-ink-500">
                    {m}
                  </p>
                ))}
              </div>
            ) : null}
          </>
        ) : null}

        {node.edges.length ? (
          <ul className="mt-2 space-y-1.5">
            {node.edges.map((e) => (
              <li key={`${e.label ?? ""}-${e.to}`} className="flex items-start gap-1.5 text-[13px]">
                {e.back ? (
                  <CornerLeftUp className="mt-[3px] size-3 shrink-0 text-amber-600" aria-hidden />
                ) : (
                  <ChevronRight className="mt-[3px] size-3 shrink-0 text-ink-400" aria-hidden />
                )}
                <span className="min-w-0">
                  {/* label first, condition text underneath: a branch is a
                      name with a reason, not one long inline sentence */}
                  {e.label ? <span className="text-ink-700">{e.label}</span> : null}
                  {e.label ? " " : null}
                  <EdgeTarget edge={e} basePath={basePath} onJump={onJump} />
                  {e.detail ? (
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-500">
                      {e.detail}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

export default function CanonicalFlow({
  nodes,
  basePath,
  labels,
}: {
  nodes: readonly FlowNode[];
  basePath: string;
  labels: FlowLabels;
}) {
  const [flashed, setFlashed] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* The anchor does the scrolling; this only says which card was asked for,
     because landing mid-graph with nothing marked is how you lose your place. */
  const onJump = useCallback((to: string) => {
    setFlashed(to);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlashed(null), 1600);
  }, []);

  return (
    <ol className="space-y-5">
      {nodes.map((n) => (
        <NodeCard
          key={n.id}
          node={n}
          basePath={basePath}
          labels={labels}
          flashed={flashed === n.id}
          onJump={onJump}
        />
      ))}
    </ol>
  );
}
