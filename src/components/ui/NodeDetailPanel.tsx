"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import type { FlowNode } from "@/lib/canonical-view";
import type { Lang } from "@/lib/content";
import { humanize } from "@/components/ui/JourneyCanvasNodes";
import { CHANNEL_LABEL } from "@/lib/journey-channels";
import { springSnap } from "@/lib/motion";

/* The canvas answers "what is the shape of this journey"; this panel answers
   "what exactly does this one node do" - the two-layer split section 7 of
   the visual grammar asks for. Everything here already exists on the
   FlowNode canonical-view.ts projects (headline/detail/meta/edges) - no new
   canonical field, no node-type-specific panel component. One panel renders
   any of the seven kinds because the data shape is already uniform. */

const PRIORITY_LABEL: Record<Lang, string> = { en: "Channel priority", tr: "Kanal önceliği" };
const REPRESENTS_LABEL: Record<Lang, string> = { en: "Represented canonical steps", tr: "Temsil edilen kanonik adımlar" };

const KIND_LABEL: Record<FlowNode["kind"], Record<Lang, string>> = {
  trigger: { en: "Trigger", tr: "Tetikleyici" },
  action: { en: "Internal action", tr: "İç işlem" },
  condition: { en: "Condition", tr: "Koşul" },
  wait: { en: "Wait", tr: "Bekleme" },
  outcome: { en: "Outcome", tr: "Sonuç" },
  exit: { en: "Exit", tr: "Çıkış" },
  handoff: { en: "Handoff", tr: "Devir" },
};

/** `action` alone reads as "Internal action" above regardless of
    `execution` - true for the 1,048-of-1,232 majority with no outward
    effect, wrong for the message/human minority (`ActionNode.execution`,
    same field JourneyCanvasNodes.tsx already reads to pick a card). */
const ACTION_KIND_LABEL: Record<"communication" | "human", Record<Lang, string>> = {
  communication: { en: "Message", tr: "Mesaj" },
  human: { en: "Human action", tr: "İnsan işlemi" },
};

export type PanelLabels = {
  close: string;
  entry: string;
  terminal: string;
  /** The locale the kind names render in. Optional so a caller with
      nothing but English to show (the QA sweep route) stays a valid
      caller; every other label here is already resolved by the server. */
  lang?: Lang;
};

export function NodeDetailPanel({
  node,
  represents,
  basePath,
  labels,
  onClose,
}: {
  node: FlowNode | null;
  /** The canonical steps this node's own card stands in for on the canvas -
      a channel-selecting action it absorbed, a permission gate and the
      "record why nothing was sent" hop behind it, the journey's own
      bookkeeping - in canonical order. Each is still a real, full FlowNode;
      the display graph just draws one card instead of several
      (journey-canvas-layout.ts's `representedSteps`, the same detection the
      layout itself uses). Null or empty for a card that stands only for
      itself. This section is the collapse's own contract: the canvas gets
      simpler, and the implementation stays one click away, traceable step
      by step rather than summarised. */
  represents?: readonly FlowNode[] | null;
  basePath: string;
  labels: PanelLabels;
  onClose: () => void;
}) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const lang = labels.lang ?? "en";
  const kindLabel = (n: FlowNode) =>
    n.execution === "communication" || n.execution === "human" ? ACTION_KIND_LABEL[n.execution][lang] : KIND_LABEL[n.kind][lang];

  /* Matches JourneyModal.tsx's own dialog convention (Escape closes,
     opening moves focus in, closing returns it to whatever opened it) -
     this panel just isn't a MODAL version of it: the canvas behind stays
     visible and interactive by design (§ reference/exploration, not a
     blocking editor), so there is deliberately no aria-modal and no
     focus trap here, only the parts of the convention that don't require
     one. Runs once per node open/close, not per keystroke - the keydown
     listener itself is what's cheap enough to leave on `window` for the
     panel's whole open lifetime. */
  useEffect(() => {
    if (!node) return;
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusTimer = window.setTimeout(() => closeBtnRef.current?.focus(), 50);
    /* Capture phase, with stopPropagation once handled: when this panel
       opens over JourneyModal (a canvas-enabled journey opened from the
       library), that modal has its own Escape-closes-me listener on
       `document` in the ordinary bubble phase. Bubble order reaches
       document before window, so a plain bubble-phase listener here would
       run AFTER the modal's own and do nothing to stop it - one Escape
       press would close the drawer AND the modal in the same keystroke,
       instead of peeling one layer at a time the way stacked dialogs
       should. Capture fires window before document, so intercepting here
       and stopping propagation is what keeps the modal (if any) closed by
       its OWN, separate Escape press. */
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown, true);
      triggerRef.current?.focus();
    };
  }, [node, onClose]);

  return (
    <AnimatePresence>
      {node ? (
        <motion.aside
          key={node.id}
          role="dialog"
          aria-label={kindLabel(node)}
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 24, opacity: 0 }}
          transition={springSnap}
          className="absolute inset-y-0 right-0 z-20 flex w-full max-w-sm flex-col overflow-y-auto border-l border-line bg-paper shadow-[-8px_0_24px_-12px_rgba(15,23,42,0.15)]"
        >
          <div className="flex items-start justify-between gap-3 border-b border-line-soft px-5 py-4">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.1em] text-ink-400 uppercase">
                {kindLabel(node)}
                <span className="text-ink-300">·</span>
                <span className="normal-case">{node.id}</span>
                {node.isEntry ? (
                  <span className="rounded-full bg-ink-950 px-1.5 py-px text-[9px] text-paper normal-case">
                    {labels.entry}
                  </span>
                ) : null}
                {node.terminal ? (
                  <span className="rounded-full border border-ink-300 px-1.5 py-px text-[9px] text-ink-500 normal-case">
                    {labels.terminal}
                  </span>
                ) : null}
              </p>
              <p className="mt-1.5 text-[15px] leading-snug font-medium text-ink-950">
                {node.kind === "wait" ? humanize(node.headline) : node.headline}
              </p>
              {node.eventId ? (
                <p className="mt-1 font-mono text-[11px] break-all text-ink-400">{node.eventId}</p>
              ) : null}
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              className="grid size-7 shrink-0 place-items-center rounded-full text-ink-400 transition-colors hover:bg-paper-soft hover:text-ink-900"
            >
              <X aria-hidden className="size-4" />
              <span className="sr-only">{labels.close}</span>
            </button>
          </div>

          <div className="flex-1 space-y-5 px-5 py-4">
            {node.detail ? <p className="text-sm leading-relaxed text-ink-700">{node.detail}</p> : null}

            {node.channelPriority && node.channelPriority.length >= 2 ? (
              <div className="border-t border-line-soft pt-4">
                <p className="font-mono text-[10px] font-semibold tracking-[0.1em] text-ink-400 uppercase">{PRIORITY_LABEL[lang]}</p>
                <ol className="mt-1.5 space-y-1 text-[13px] leading-snug text-ink-700">
                  {node.channelPriority.map((id, i) => (
                    <li key={id}>
                      {i + 1}. {CHANNEL_LABEL[id][lang]}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {represents?.length ? (
              <div className="border-t border-line-soft pt-4">
                <p className="font-mono text-[10px] font-semibold tracking-[0.1em] text-ink-400 uppercase">{REPRESENTS_LABEL[lang]}</p>
                <ol className="mt-2 space-y-2.5">
                  {represents.map((step, i) => (
                    <li key={step.id} className="flex gap-2.5">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-paper-soft font-mono text-[10px] font-semibold text-ink-600 tabular-nums">
                        {i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-mono text-[11px] text-ink-500">{step.id}</span>
                          <span className="text-[11px] text-ink-400">{kindLabel(step)}</span>
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-600">{step.headline}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {node.meta.length ? (
              <ul className="space-y-1.5 border-t border-line-soft pt-4">
                {node.meta.map((m) => (
                  <li key={m} className="text-[13px] leading-snug text-ink-600">
                    {m}
                  </li>
                ))}
              </ul>
            ) : null}

            {node.edges.length ? (
              <ul className="space-y-2.5 border-t border-line-soft pt-4">
                {node.edges.map((e) => (
                  <li key={`${e.label ?? ""}-${e.to}`} className="text-[13px] leading-snug">
                    {e.label ? <span className="font-medium text-ink-800">{e.label}</span> : null}
                    {e.label && e.detail ? ": " : null}
                    {e.detail ? <span className="text-ink-600">{e.detail}</span> : null}
                    <span className="mt-0.5 block font-mono text-[11px] text-ink-400">
                      {e.kind === "journey" && e.href ? (
                        <Link href={`${basePath}/${e.href}`} className="text-blue-700 hover:underline">
                          → {e.to}
                        </Link>
                      ) : (
                        `→ ${e.to}`
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
