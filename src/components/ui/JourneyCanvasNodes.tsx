import type { ReactNode } from "react";

import type { FlowNode } from "@/lib/canonical-view";

/* Node cards for the journey canvas - one visual system per the attached
   Journey Visual Grammar, distinct from JourneyVisuals.tsx's simpler
   seven-kind grammar used on the /lab/claude-lifecycle product page. That
   page draws a marketing diagram; this one draws a real canonical journey's
   full graph, so it carries the grammar's richer hierarchy: Action at Level
   A (strongest), Trigger/Handoff/Outcome/Exit at Level B (structural, one
   filled, three quiet), Condition/Wait at Level C (compact, deliberately
   smaller than an Action).

   ACTION EXECUTION (was the ACTION SUBTYPE GAP, now closed): the grammar's
   Action level distinguishes customer-facing execution from internal work,
   and for a long time nothing in canonical could express that - `ActionNode`
   carried `{ does; writes?; next }` and no execution field, so every Action
   on all 255 journeys rendered as INTERNAL by default.

   `ActionNode.execution` now carries it explicitly: `communication` on the
   58 actions whose effect is a message reaching a recipient, `human` on the
   34 that put work in front of a person, and omitted on the remaining 1,039
   internal operations - which keeps INTERNAL as the honest default rather
   than the only option. A communication card names the journey's own
   declared channels (CanonicalJourney.channels) rather than inventing one
   per node: the canonical send path picks the actual channel at stage 9,
   from the permitted set, so the set is what a node can truthfully show. */

const ICON_PROPS = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor" } as const;

function TriggerIcon() {
  return (
    <svg {...ICON_PROPS} strokeWidth={1.8} strokeLinejoin="round">
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}
function HandoffIcon() {
  return (
    <svg {...ICON_PROPS} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function OutcomeIcon() {
  return (
    <svg {...ICON_PROPS} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12l5 5 11-11" />
    </svg>
  );
}
function ConditionIcon() {
  return (
    <svg {...ICON_PROPS} strokeWidth={1.8} strokeLinejoin="round">
      <path d="M12 3l9 9-9 9-9-9 9-9z" />
    </svg>
  );
}
function WaitIcon() {
  return (
    <svg {...ICON_PROPS} strokeWidth={1.8} strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function CommunicationIcon() {
  return (
    <svg {...ICON_PROPS} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7l9 6 9-6" />
      <rect x="3" y="5" width="18" height="14" rx="2" />
    </svg>
  );
}
function HumanActionIcon() {
  return (
    <svg {...ICON_PROPS} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}
function InternalActionIcon() {
  return (
    <svg {...ICON_PROPS} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4v8a4 4 0 0 0 4 4h6" />
      <path d="M14 13l3 3-3 3" />
    </svg>
  );
}

/** Snake_case/dot.case event and state ids read as engine internals, not as
    the sentence a reader needs first - the same cleanup canonical-view.ts's
    own `humanEvent` does for triggers, applied here to wait/exit headlines
    too since those flow through this renderer only, not the shared list
    view every other journey still uses. */
export function humanize(text: string): string {
  const words = text.replace(/[_.]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function CardShell({
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
  /** Wait's card is the one true pill/capsule (§4 LEVEL C) - it shrinks to
      its own content instead of stretching to fill its column slot, which
      is what keeps it reading as visibly smaller than an Action even when
      its reserved layout width is generous. Every other kind still fills
      its slot. */
  fit?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`block h-full cursor-pointer text-left transition-shadow duration-150 hover:shadow-[0_1px_0_0_rgba(0,0,0,0.03),0_4px_14px_-6px_rgba(15,23,42,0.18)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
        fit ? "mx-auto w-fit" : "w-full"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function KindLabel({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-[0.08em] uppercase">
      {children}
    </span>
  );
}

function EntryPin({ children }: { children: string }) {
  return (
    <span className="absolute -top-3 left-3 flex items-center rounded-full border border-paper bg-ink-950 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-paper shadow-sm">
      {children}
    </span>
  );
}

export function TriggerCard({ node, onOpen, entryLabel }: { node: FlowNode; onOpen: () => void; entryLabel: string }) {
  return (
    <div className="relative h-full w-full">
      {node.isEntry ? <EntryPin>{entryLabel}</EntryPin> : null}
      <CardShell onClick={onOpen} ariaLabel={node.headline} className="rounded-lg bg-ink-950 px-4 py-4">
        <KindLabel>
          <TriggerIcon />
          <span className="text-neutral-300">Trigger</span>
        </KindLabel>
        <p className="mt-2 line-clamp-2 text-[14.5px] leading-snug text-paper">{humanize(node.headline)}</p>
      </CardShell>
    </div>
  );
}

export function HandoffCard({ node, onOpen }: { node: FlowNode; onOpen: () => void }) {
  return (
    <CardShell onClick={onOpen} ariaLabel={node.headline} className="rounded-lg border border-line-soft bg-paper-soft px-4 py-4">
      <KindLabel>
        <span className="text-blue-700">
          <HandoffIcon />
        </span>
        <span className="text-blue-700">Handoff</span>
      </KindLabel>
      <p className="mt-2 line-clamp-2 text-[14.5px] leading-snug text-ink-900">{node.headline}</p>
    </CardShell>
  );
}

export function OutcomeCard({ node, onOpen }: { node: FlowNode; onOpen: () => void }) {
  return (
    <CardShell onClick={onOpen} ariaLabel={node.headline} className="rounded-lg border border-success-subtle bg-paper px-4 py-4">
      <KindLabel>
        <span className="text-success">
          <OutcomeIcon />
        </span>
        <span className="text-ink-700">Outcome</span>
      </KindLabel>
      <p className="mt-2 line-clamp-2 text-[14.5px] leading-snug text-ink-900">{node.headline}</p>
    </CardShell>
  );
}

export function ExitCard({ node, onOpen, terminalLabel }: { node: FlowNode; onOpen: () => void; terminalLabel: string }) {
  return (
    <CardShell
      onClick={onOpen}
      ariaLabel={node.headline}
      className="rounded-md border border-dashed border-ink-200 bg-transparent px-4 py-3"
    >
      <span className="flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] text-ink-500 uppercase">
        Exit
        {node.terminal ? (
          <span className="rounded-full border border-ink-200 px-1.5 py-px normal-case">{terminalLabel}</span>
        ) : null}
      </span>
      <p className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-ink-500">{node.headline}</p>
    </CardShell>
  );
}

export function ActionCard({
  node,
  sequence,
  onOpen,
  messageLabels,
  humanLabels,
}: {
  node: FlowNode;
  sequence: number;
  onOpen: () => void;
  /** The journey's message-delivery surfaces, localised and ordered. Shown on
      a communication action only; an empty list renders nothing rather than a
      placeholder. */
  messageLabels: readonly string[];
  /** The journey's human routes (sales, task). Shown on a human action only -
      a Message node does not send "on Task", and a Human node is not reached
      "on SMS". */
  humanLabels: readonly string[];
}) {
  const execution = node.execution ?? "system";
  const accent =
    execution === "communication"
      ? "border-l-blue-700 text-blue-700"
      : execution === "human"
        ? "border-l-amber-700 text-amber-700"
        : "border-l-neutral-600 text-neutral-600";
  const [rule, ink] = accent.split(" ");

  return (
    <CardShell
      onClick={onOpen}
      ariaLabel={node.headline}
      className={`rounded-lg border border-line-soft border-l-[3px] ${rule} bg-paper px-4 py-4`}
    >
      <KindLabel>
        <span className={ink}>
          {execution === "communication" ? (
            <CommunicationIcon />
          ) : execution === "human" ? (
            <HumanActionIcon />
          ) : (
            <InternalActionIcon />
          )}
        </span>
        <span className={ink}>
          {execution === "communication"
            ? "Message"
            : execution === "human"
              ? "Human"
              : "Internal"}{" "}
          · {String(sequence).padStart(2, "0")}
        </span>
      </KindLabel>
      {/* No separate short title exists in canonical data (ActionNode has
          one `does` sentence, not a title + a purpose line) - see the file
          comment. The full sentence renders here, clamped to 4 lines rather
          than the 3 the first pass used (the card grew to fit it), with a
          shortened paraphrase never substituted for the canonical wording;
          the untruncated text is always available in the detail panel. */}
      <p className="mt-2 line-clamp-4 text-[14.5px] leading-snug text-ink-900">{node.headline}</p>
      {(() => {
        const routes =
          execution === "communication"
            ? messageLabels
            : execution === "human"
              ? humanLabels
              : [];
        return routes.length > 0 ? (
          <p className="mt-2 font-mono text-[10.5px] tracking-[0.06em] text-ink-500 uppercase">
            {routes.join(" · ")}
          </p>
        ) : null;
      })()}
    </CardShell>
  );
}

export function ConditionCard({ node, onOpen }: { node: FlowNode; onOpen: () => void }) {
  // Branch names already sit on the connectors leaving this card (§5 of the
  // grammar: "branch labels belong close to their corresponding edges") -
  // repeating them as pills inside the card too, on top of what the edges
  // already say, is the one thing the grammar's own anatomy demo shows in
  // isolation but never actually does in an assembled journey (§4/§6).
  return (
    <CardShell onClick={onOpen} ariaLabel={node.headline} className="rounded-2xl border border-line-soft bg-paper px-4 py-3.5">
      <span className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0 text-ink-500">
          <ConditionIcon />
        </span>
        <span className="text-[14.5px] leading-snug font-medium text-ink-900">{node.headline}</span>
      </span>
    </CardShell>
  );
}

export function WaitCard({ node, onOpen }: { node: FlowNode; onOpen: () => void }) {
  // A pill, per the grammar - but "sensible two-line labels where
  // necessary" (no ellipsis on an essential label) wins over forcing a
  // single line: `line-clamp-2` wraps instead of truncating, and the
  // reserved width (SIZE.wait in journey-canvas-layout.ts) is generous
  // enough that ACQ-01's own wait headline fits on one line in practice.
  return (
    <CardShell
      onClick={onOpen}
      ariaLabel={node.headline}
      fit
      className="flex max-w-[280px] items-center gap-2 rounded-full border border-line-soft bg-paper px-4 py-2.5"
    >
      <span className="shrink-0 text-ink-500">
        <WaitIcon />
      </span>
      <span className="line-clamp-2 text-[14px] leading-snug font-medium text-ink-700">{humanize(node.headline)}</span>
    </CardShell>
  );
}
