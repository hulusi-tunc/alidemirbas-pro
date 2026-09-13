"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { Info, Workflow } from "lucide-react";

/* THE DETAIL PAGE'S TWO TABS (Hulusi, 2026-09-13): "Info" - the title and
   everything written about the journey - and "Canvas" - the graph on a
   full-page free canvas. Both panels arrive server-rendered; this component
   only switches between them. The choice lives in the URL hash (#canvas)
   so a link can open the canvas directly and Back returns to the notes;
   the bar pins under the Lab shell's own header. Arrow keys move between
   the tabs, as a tablist should. */
export function JourneyDetailTabs({
  info,
  canvas,
  labels,
}: {
  info: ReactNode;
  canvas: ReactNode;
  labels: { info: string; canvas: string };
}) {
  const [tab, setTab] = useState<"info" | "canvas">("info");
  const base = useId();

  useEffect(() => {
    const fromHash = () => setTab(window.location.hash === "#canvas" ? "canvas" : "info");
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const select = (next: "info" | "canvas") => {
    setTab(next);
    const url = next === "canvas" ? "#canvas" : window.location.pathname + window.location.search;
    window.history.replaceState(null, "", url);
  };

  const tabs = [
    { id: "info" as const, label: labels.info, icon: Info },
    { id: "canvas" as const, label: labels.canvas, icon: Workflow },
  ];

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] flex-col">
      <div className="sticky top-14 z-30 border-b border-line-soft bg-paper/95 backdrop-blur-sm">
        <div role="tablist" aria-label={`${labels.info} / ${labels.canvas}`} className="altor-container-wide flex h-12 items-center gap-1">
          {tabs.map(({ id, label, icon: Icon }) => {
            const on = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`${base}-tab-${id}`}
                aria-selected={on}
                aria-controls={`${base}-panel-${id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => select(id)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    select(id === "info" ? "canvas" : "info");
                    document.getElementById(`${base}-tab-${id === "info" ? "canvas" : "info"}`)?.focus();
                  }
                }}
                className={`flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-[var(--duration-fast)] ${
                  on ? "bg-ink-950 text-white" : "text-ink-600 hover:bg-paper-soft hover:text-ink-950"
                }`}
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div role="tabpanel" id={`${base}-panel-info`} aria-labelledby={`${base}-tab-info`} hidden={tab !== "info"}>
        {info}
      </div>
      <div role="tabpanel" id={`${base}-panel-canvas`} aria-labelledby={`${base}-tab-canvas`} hidden={tab !== "canvas"} className="flex-1">
        {canvas}
      </div>
    </div>
  );
}
