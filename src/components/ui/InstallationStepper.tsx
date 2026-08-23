import type { LucideIcon } from "lucide-react";
import { clsx } from "@/lib/clsx";
import { CopyButton } from "./CopyButton";

/** Reusable numbered installation stepper (Product Page building block #2).
    Visual reference: a vertical numbered list with a connecting line -
    step markers are circles (this codebase's existing convention: a
    circle marks one item from an ordered/single set, see FacetRadio in
    Facets.tsx; a step is exactly that). Corners, borders and type follow
    this site's own tokens, not the reference's rounding or spacing.

    Each step's body is a plain slot (`content`), so a step can hold a
    code block, a tool-selector grid, a copyable URL, or nothing at all -
    the stepper doesn't know or care what kind of step it is. This is the
    same shape the future MCP page's install flow will need (env/tool
    pick -> command -> configure -> verify -> ready), so it's built
    generic from the start rather than tailored to one plugin's steps. */

export type InstallStep = {
  n: number;
  title: string;
  desc?: string;
  content?: React.ReactNode;
};

export function InstallationStepper({ steps }: { steps: InstallStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <li key={step.n} className="relative flex gap-5 pb-10 last:pb-0">
            {!isLast && (
              <span aria-hidden className="absolute top-8 left-[15px] h-[calc(100%-2rem)] w-px bg-line" />
            )}
            <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-line-strong bg-paper text-sm font-medium text-ink-900 tabular-nums">
              {step.n}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="text-base font-semibold tracking-tight text-ink-950">{step.title}</h3>
              {step.desc && <p className="mt-1 text-sm leading-relaxed text-neutral-600">{step.desc}</p>}
              {step.content && <div className="mt-3.5">{step.content}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Step content: a code block with a copy affordance. Used for install
    commands, config snippets, or a bare URL to paste elsewhere. */
export function CodeBlock({ code, copyLabel, copiedLabel }: { code: string; copyLabel?: string; copiedLabel?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-line bg-ink-950 px-4 py-3">
      <pre className="min-w-0 flex-1 overflow-x-auto font-mono text-xs leading-relaxed whitespace-pre text-white/85">
        {code}
      </pre>
      <CopyButton value={code} label={copyLabel} copiedLabel={copiedLabel} />
    </div>
  );
}

export type ToolOption = { id: string; label: string; icon: LucideIcon };

/** Step content: the tool/environment picker (Claude Code, Cursor, Codex,
    "Other", etc). Static cards, not a real selector - this foundation has
    no per-tool command variants to switch between yet, so it renders
    every option and marks which one(s) the current guide actually
    verified rather than implying interactivity that isn't there. */
export function ToolSelectorCards({ options, activeId }: { options: ToolOption[]; activeId?: string }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = opt.id === activeId;
        return (
          <span
            key={opt.id}
            className={clsx(
              "flex items-center gap-2 rounded-md border px-3.5 py-2.5 text-sm font-medium",
              active ? "border-ink-900 text-ink-950" : "border-line text-neutral-500",
            )}
          >
            <Icon aria-hidden className="size-4" strokeWidth={1.75} />
            {opt.label}
          </span>
        );
      })}
    </div>
  );
}
