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
   on all 255 journeys then in the library rendered as INTERNAL by default.

   `ActionNode.execution` now carries it explicitly: `communication` on the
   150 actions whose effect is a message reaching a recipient, `human` on the
   34 that put work in front of a person, and omitted on the remaining 1,048
   internal operations - which keeps INTERNAL as the honest default rather
   than the only option. A communication card names the journey's own
   declared channels (CanonicalJourney.channels) rather than inventing one
   per node: the canonical send path picks the actual channel at stage 9,
   from the permitted set, so the set is what a node can truthfully show.

   PER-KIND ACCENT + REAL SECONDARY BADGES (2026-09 pass): adapted from the
   "Journey Node System" design exploration (a Claude Design artifact, not a
   third-party library) - its icon-badge chip and its "secondary states are
   badges, never a new shape" rule. Per reference-analysis.md's SURFACE vs
   MECHANISM split, only the mechanism crossed over: the exploration's own
   raw hex values are explicitly placeholder ("palette and icons are
   placeholders for the concept, not final brand values") and its 11-channel
   per-Action-node coloring is flagged inside the exploration itself as
   "Future communication example - not part of current canonical corpus" (a
   single Action node has no single channel in the real schema - only the
   journey declares a permitted set, and the send path picks at runtime; see
   ActionNode's own comment above). Building that part would be a fabricated
   distinction the data can't back, so it was left out.

   What DID cross over, using only fields the schema actually carries and
   this site's own tokens (never the exploration's hex):
    - an icon-badge chip (tinted square) per kind, replacing a bare inline
      icon
    - a distinct accent hue for Condition (violet), Wait (teal) and Handoff
      (indigo) - the three kinds that previously had no color identity at
      all, hence indistinguishable from each other by anything but shape
    - three real, previously-uncarded schema fields, now shown as pills:
      TriggerNode.evidence.source (already computed into `meta`'s free-text
      list; now also on the card face), ConditionNode.branches.length, and
      HandoffNode's internal/external split (`to.startsWith("external:")`)
   Trigger keeps its solid dark fill and Exit keeps its quiet dashed/muted
   treatment rather than gaining a new hue - both already match the
   exploration's own stated semantics ("Trigger reads as commanding", "Exit
   sits visually at rest"), so a new accent there would fight the reference
   rather than follow it. Action keeps its existing 3-way border-l accent
   (blue/amber/neutral) - a real, already-correct distinction predating this
   pass - now paired with a matching icon-badge instead of standing alone. */

const ICON_PROPS = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor" } as const;

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

/** One accent per kind: an icon-badge tint/ink pair, reused for any matching
    secondary pill on the same card. This site's own Tailwind tokens - the
    same `violet-50/700`, `teal-50/700`, `blue-50/700`, `amber-50/700` family
    JourneyBuilderPage.tsx's CHANNEL_STYLE already uses elsewhere in this
    codebase - not the design exploration's placeholder hex. Condition,
    Wait and Handoff are the three kinds getting a hue for the first time;
    Action's three execution accents already existed and are kept as-is. */
const ACCENT = {
  internal: { tint: "bg-neutral-100", ink: "text-neutral-600", ring: "border-neutral-200" },
  communication: { tint: "bg-blue-50", ink: "text-blue-700", ring: "border-blue-200" },
  human: { tint: "bg-amber-50", ink: "text-amber-700", ring: "border-amber-200" },
  condition: { tint: "bg-violet-50", ink: "text-violet-700", ring: "border-violet-200" },
  wait: { tint: "bg-teal-50", ink: "text-teal-700", ring: "border-teal-200" },
  handoff: { tint: "bg-indigo-50", ink: "text-indigo-700", ring: "border-indigo-200" },
  outcome: { tint: "bg-success-subtle", ink: "text-success", ring: "border-success-subtle" },
  quiet: { tint: "bg-neutral-100", ink: "text-ink-400", ring: "border-line-soft" },
} as const;

function IconBadge({ accent, children }: { accent: (typeof ACCENT)[keyof typeof ACCENT]; children: ReactNode }) {
  return (
    <span className={`grid size-[22px] shrink-0 place-items-center rounded-md ${accent.tint} ${accent.ink}`}>
      {children}
    </span>
  );
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

function KindRow({ accent, icon, children }: { accent: (typeof ACCENT)[keyof typeof ACCENT]; icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <IconBadge accent={accent}>{icon}</IconBadge>
      <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase">{children}</span>
    </span>
  );
}

/** A real, schema-backed secondary state - never decoration. Same neutral
    pill shape as ExitCard's pre-existing terminal badge, generalised so
    every kind that now carries one of these renders it identically. */
function StatePill({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-1.5 py-px text-[10px] font-medium normal-case ${
        onDark ? "border-white/20 bg-white/10 text-white/70" : "border-line-soft bg-paper-soft text-ink-500"
      }`}
    >
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
        <span className="flex items-center gap-2">
          <span className="grid size-[22px] shrink-0 place-items-center rounded-md bg-white/10 text-neutral-300">
            <TriggerIcon />
          </span>
          <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-neutral-300 uppercase">Trigger</span>
        </span>
        <p className="mt-2 line-clamp-2 text-[14.5px] leading-snug text-paper">{humanize(node.headline)}</p>
        {node.evidenceSource ? (
          <span className="mt-2 flex">
            <StatePill onDark>{humanize(node.evidenceSource)}</StatePill>
          </span>
        ) : null}
      </CardShell>
    </div>
  );
}

export function HandoffCard({ node, onOpen }: { node: FlowNode; onOpen: () => void }) {
  const accent = ACCENT.handoff;
  return (
    <CardShell
      onClick={onOpen}
      ariaLabel={node.headline}
      className="rounded-lg border border-line-soft border-l-[3px] border-l-indigo-600 bg-paper px-4 py-4"
    >
      <KindRow accent={accent} icon={<HandoffIcon />}>
        <span className="text-indigo-700">Handoff</span>
      </KindRow>
      <p className="mt-2 line-clamp-2 text-[14.5px] leading-snug text-ink-900">{node.headline}</p>
      <span className="mt-2 flex">
        <StatePill>{node.external ? "External" : "Internal"}</StatePill>
      </span>
    </CardShell>
  );
}

export function OutcomeCard({ node, onOpen }: { node: FlowNode; onOpen: () => void }) {
  const accent = ACCENT.outcome;
  return (
    <CardShell
      onClick={onOpen}
      ariaLabel={node.headline}
      className="rounded-lg border border-line-soft border-l-[3px] border-l-[color:var(--color-success)] bg-paper px-4 py-4"
    >
      <KindRow accent={accent} icon={<OutcomeIcon />}>
        <span className="text-ink-700">Outcome</span>
      </KindRow>
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
      <span className="flex items-center gap-2">
        <IconBadge accent={ACCENT.quiet}>
          <svg {...ICON_PROPS} strokeWidth={1.7}>
            <rect x="5" y="5" width="14" height="14" rx="3" />
          </svg>
        </IconBadge>
        <span className="flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] text-ink-500 uppercase">
          Exit
          {node.terminal ? <StatePill>{terminalLabel}</StatePill> : null}
        </span>
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
  const accent = execution === "communication" ? ACCENT.communication : execution === "human" ? ACCENT.human : ACCENT.internal;
  const borderL =
    execution === "communication" ? "border-l-blue-700" : execution === "human" ? "border-l-amber-700" : "border-l-neutral-600";

  return (
    <CardShell
      onClick={onOpen}
      ariaLabel={node.headline}
      className={`rounded-lg border border-line-soft border-l-[3px] ${borderL} bg-paper px-4 py-4`}
    >
      <KindRow
        accent={accent}
        icon={
          execution === "communication" ? (
            <CommunicationIcon />
          ) : execution === "human" ? (
            <HumanActionIcon />
          ) : (
            <InternalActionIcon />
          )
        }
      >
        <span className={accent.ink}>
          {execution === "communication" ? "Message" : execution === "human" ? "Human" : "Internal"} ·{" "}
          {String(sequence).padStart(2, "0")}
        </span>
      </KindRow>
      {/* No separate short title exists in canonical data (ActionNode has
          one `does` sentence, not a title + a purpose line) - see the file
          comment. The full sentence renders here, clamped to 4 lines rather
          than the 3 the first pass used (the card grew to fit it), with a
          shortened paraphrase never substituted for the canonical wording;
          the untruncated text is always available in the detail panel. */}
      <p className="mt-2 line-clamp-4 text-[14.5px] leading-snug text-ink-900">{node.headline}</p>
      {(() => {
        const routes = execution === "communication" ? messageLabels : execution === "human" ? humanLabels : [];
        return routes.length > 0 ? (
          <p className="mt-2 font-mono text-[10.5px] tracking-[0.06em] text-ink-500 uppercase">{routes.join(" · ")}</p>
        ) : null;
      })()}
    </CardShell>
  );
}

export function ConditionCard({ node, onOpen }: { node: FlowNode; onOpen: () => void }) {
  const accent = ACCENT.condition;
  // Branch names already sit on the connectors leaving this card (§5 of the
  // grammar: "branch labels belong close to their corresponding edges") -
  // repeating them as pills inside the card too, on top of what the edges
  // already say, is the one thing the grammar's own anatomy demo shows in
  // isolation but never actually does in an assembled journey (§4/§6). The
  // branch COUNT is different information (a real layout signal, not a
  // repeat of the edge labels), which is why it gets a pill and the branch
  // names don't.
  return (
    <CardShell
      onClick={onOpen}
      ariaLabel={node.headline}
      className="rounded-2xl border border-line-soft border-t-[3px] border-t-violet-600 bg-paper px-4 py-3.5"
    >
      <span className="flex items-start gap-2">
        <IconBadge accent={accent}>
          <ConditionIcon />
        </IconBadge>
        <span className="flex-1 text-[14.5px] leading-snug font-medium text-ink-900">{node.headline}</span>
      </span>
      {typeof node.branchCount === "number" ? (
        <span className="mt-2 flex justify-end">
          <StatePill>{node.branchCount} branches</StatePill>
        </span>
      ) : null}
    </CardShell>
  );
}

export function WaitCard({ node, onOpen }: { node: FlowNode; onOpen: () => void }) {
  const accent = ACCENT.wait;
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
      className={`flex max-w-[280px] items-center gap-2 rounded-full border ${accent.ring} bg-paper px-3 py-2`}
    >
      <IconBadge accent={accent}>
        <WaitIcon />
      </IconBadge>
      <span className="line-clamp-2 text-[14px] leading-snug font-medium text-ink-700">{humanize(node.headline)}</span>
    </CardShell>
  );
}
