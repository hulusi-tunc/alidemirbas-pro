"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";
import { CodeBlock } from "./InstallationStepper";
import type { CodeTab } from "./CodeTabs";

/** A dark-tab variant of `CodeTabs`, for pages whose own palette puts the
    install block inside a dark "terminal enclave" rather than on paper.

    NOT a replacement for `CodeTabs` and not a change to it: that component
    keeps its light tab row (`border-line`, `text-ink-950`), which is
    correct on the pages that use it and unreadable on a dark ground. This
    reimplements only the ~15 lines of tab-row markup, and reuses the same
    shared `CodeBlock` underneath - so the copy-to-clipboard behaviour and
    the code rendering stay one implementation, not two that can drift.

    Introduced for /lab/dashboard-builder's reskin (2026-09-05); written
    generically because a second page reaching for the same treatment
    shouldn't have to fork it again. */
export function TerminalCodeTabs({
  tabs,
  copyLabel,
  copiedLabel,
}: {
  tabs: CodeTab[];
  copyLabel?: string;
  copiedLabel?: string;
}) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];
  if (!active) return null;
  return (
    <div className="overflow-hidden rounded-lg border border-[#2d333b] bg-[#090a0c]">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-[#2d333b] bg-[#121417] px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveId(tab.id)}
            className={clsx(
              "-mb-px border-b-2 px-3 py-2.5 font-mono text-[12px] transition-colors",
              tab.id === active.id
                ? "border-white font-semibold text-white"
                : "border-transparent text-slate-400 hover:text-slate-200",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* CodeBlock brings its own dark plate and the copy button; the
          border it draws is redundant inside this wrapper, so it is
          neutralised rather than the component being edited.

          `[&>div]:overflow-hidden` is not cosmetic: CodeBlock's <pre> is
          `overflow-x-auto`, and at 375px a long install command's scroll
          extent propagated all the way up to the document (measured: a
          431px document against a 375px viewport). Only clipping on
          CodeBlock's own flex row contains it - hiding overflow further
          out, on this padding box or on the shell, does not. */}
      <div className="p-3 [&>div]:overflow-hidden [&>div]:border-transparent [&>div]:bg-transparent">
        <CodeBlock code={active.code} copyLabel={copyLabel} copiedLabel={copiedLabel} />
      </div>
    </div>
  );
}
