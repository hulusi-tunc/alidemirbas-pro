"use client";

import type { ChannelId } from "@/canonical/types";
import { ActionCard, ConditionCard, ExitCard, HandoffCard, OutcomeCard, TriggerCard, WaitCard } from "@/components/ui/JourneyCanvasNodes";
import type { FlowNode } from "@/lib/canonical-view";
import type { Lang } from "@/lib/content";

/* One real canvas card, standing still - for the landing page's figures,
   which explain a trigger, a fork and a wait with the very cards the canvas
   draws (Hulusi, 2026-09-20: "update the library landing page's visuals,
   we made such nice updates in the details"). Inert: it is a picture. */
export function NodeFigure({
  node,
  lang,
  entryLabel,
  terminalLabel,
  messageLabels = [],
  humanLabels = [],
  sequence = 1,
  className = "",
}: {
  node: FlowNode;
  lang: Lang;
  entryLabel: string;
  terminalLabel: string;
  messageLabels?: readonly { id: ChannelId; label: string }[];
  humanLabels?: readonly { id: ChannelId; label: string }[];
  sequence?: number;
  className?: string;
}) {
  const noop = () => {};
  const card =
    node.kind === "trigger" ? (
      <TriggerCard node={node} onOpen={noop} entryLabel={entryLabel} lang={lang} />
    ) : node.kind === "action" ? (
      <ActionCard node={node} sequence={sequence} onOpen={noop} messageLabels={messageLabels} humanLabels={humanLabels} lang={lang} />
    ) : node.kind === "condition" ? (
      <ConditionCard node={node} onOpen={noop} lang={lang} />
    ) : node.kind === "wait" ? (
      <WaitCard node={node} onOpen={noop} />
    ) : node.kind === "handoff" ? (
      <HandoffCard node={node} onOpen={noop} lang={lang} />
    ) : node.kind === "outcome" ? (
      <OutcomeCard node={node} onOpen={noop} lang={lang} />
    ) : (
      <ExitCard node={node} onOpen={noop} terminalLabel={terminalLabel} lang={lang} />
    );
  return (
    <div aria-hidden inert className={`pointer-events-none select-none ${className}`}>
      {card}
    </div>
  );
}
