"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { buttonStyles } from "@/components/ui/Button";
import { clsx } from "@/lib/clsx";

/* THE TERMINAL (2026-09-20, Hulusi: the install section "we use on many
   pages - update it, make it cool"; then, on a first draft that put this
   on the product's photo plate: "people are going to think this is an
   image, not clickable"). So it is drawn as a control, not as a window:
   the ways in are a real segmented control on the tile's paper - the
   same pill tabs the library's surfaces use - and the dark block under it
   holds the active way's lines under their prompts, a caret waiting on
   the last line and the Copy pill. No title bar, no traffic lights, no
   address: those are what the site's product screenshots wear, and this
   is not a screenshot. The prompt tells the reader where each line goes:
   `›` is Claude Code's own prompt, so a `/plugin` line is typed there; `$`
   is the shell. Every line is the repository's own command. */

export type InstallMethod = { id: string; label: string; code: string };

const prompt = (line: string) => (line.startsWith("/") ? "›" : "$");

export function InstallTerminal({
  methods,
  accent,
  copyLabel,
  copiedLabel,
  className,
}: {
  methods: readonly InstallMethod[];
  /** The product's dark-ground ink class (`labAccent(slug).darkInk`); the
      command word of every line takes it, so the block carries the
      product's hue. A literal class string from the server. */
  accent?: string;
  copyLabel: string;
  copiedLabel: string;
  className?: string;
}) {
  const [activeId, setActiveId] = useState(methods[0]?.id);
  const [copied, setCopied] = useState(false);
  const active = methods.find((m) => m.id === activeId) ?? methods[0];
  if (!active) return null;
  const lines = active.code.split("\n");

  async function copy() {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API can be unavailable (insecure context, permissions);
      // the lines stay selectable.
    }
  }

  return (
    <div className={className}>
      {/* The ways in as pill tabs that wrap freely on a phone - the active
          one on ink, the others ringed paper, the library's own recipe. */}
      {methods.length > 1 && (
        <div role="tablist" className="flex flex-wrap gap-1.5">
          {methods.map((m) => {
            const on = m.id === active.id;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setActiveId(m.id);
                  setCopied(false);
                }}
                className={clsx(
                  "h-9 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors duration-[var(--duration-fast)]",
                  on ? "bg-ink-950 text-white" : "bg-paper text-ink-600 ring-1 ring-ink-950/[0.08] hover:text-ink-950",
                )}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      )}
      <div data-tone="dark" className={clsx("relative overflow-hidden rounded-2xl bg-ink-950 text-white", methods.length > 1 && "mt-3")}>
        {/* Keyed on the method so a switch re-runs the short rise. A long
            install id wraps under its own first character, the way a
            terminal wraps, never under the Copy pill. */}
        <div key={active.id} className="lab-panel-in px-5 py-5 pr-28 font-mono text-[13px] leading-7 sm:pr-32">
          {lines.map((line, i) => {
            const [word, ...rest] = line.split(" ");
            return (
              <div key={`${line}-${i}`} className="flex gap-3">
                <span aria-hidden className="w-3 shrink-0 text-white/35 select-none">
                  {prompt(line)}
                </span>
                <span className="min-w-0 whitespace-pre-wrap text-white/90 [overflow-wrap:anywhere]">
                  <span className={clsx("font-semibold", accent ?? "text-white")}>{word}</span>
                  {rest.length > 0 && ` ${rest.join(" ")}`}
                </span>
              </div>
            );
          })}
          <div aria-hidden className="flex items-center gap-3">
            <span className="w-3 shrink-0 text-white/35 select-none">{prompt(lines[lines.length - 1] ?? "")}</span>
            <span className="h-4 w-[7px] bg-white/70 motion-safe:animate-pulse" />
          </div>
        </div>
        {/* Wrapped, not positioned itself: the pill's own recipe is
            `relative` for its fill canvas. */}
        <div className="absolute top-3 right-3">
          <button type="button" onClick={copy} className={buttonStyles({ variant: "outlineInverted", size: "sm" })}>
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            {copied ? copiedLabel : copyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** The one-line copy control of a small command row: the ghost pill with
    the copy glyph, the check while the clipboard holds the line. */
export function CopyPill({ value, label, copiedLabel, className }: { value: string; label: string; copiedLabel: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable; the line stays selectable.
    }
  }
  return (
    <button type="button" onClick={copy} className={buttonStyles({ variant: "ghost", size: "sm", className: clsx("shrink-0", className) })}>
      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      {copied ? copiedLabel : label}
    </button>
  );
}
