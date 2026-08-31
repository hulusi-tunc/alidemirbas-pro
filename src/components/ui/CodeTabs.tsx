"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";
import { CodeBlock } from "./InstallationStepper";

export type CodeTab = { id: string; label: string; code: string };

/** Two (or more) install/run methods that are alternatives to each other
    ("as a Claude Code plugin" vs "run it directly") rather than
    sequential steps - a small tab row over the same CodeBlock, so a
    reader picks their own path instead of reading two numbered steps
    that are really "step 2 OR step 3". The one client island this needs
    (tab selection state); the code block itself still renders through
    the shared, server-safe CodeBlock. */
export function CodeTabs({ tabs, copyLabel, copiedLabel }: { tabs: CodeTab[]; copyLabel?: string; copiedLabel?: string }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];
  if (!active) return null;
  return (
    <div>
      <div className="flex gap-1 border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveId(tab.id)}
            className={clsx(
              "-mb-px border-b-2 px-3.5 py-2 text-sm font-medium transition-colors",
              tab.id === active.id
                ? "border-ink-900 text-ink-950"
                : "border-transparent text-neutral-500 hover:text-ink-700",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-3.5">
        <CodeBlock code={active.code} copyLabel={copyLabel} copiedLabel={copiedLabel} />
      </div>
    </div>
  );
}
