"use client";

import Link from "next/link";
import { useEffect, useId, useState, type ReactNode } from "react";
import { ArrowLeft, FlaskConical, Info, Workflow } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";

/* THE DETAIL PAGE'S CHROME (Hulusi, 2026-09-14: three stacked bars - "Back
   to site", the Info/Canvas tabs, "All journeys" - did not match; on the
   canvas everything should float, and the title and a short description
   should stay visible). One bar now: the way back to the library and the
   Lab mark on the left, the Info/Canvas switch in the middle, the language
   and the CTA on the right. On the Info tab it is the page's sticky header;
   on the Canvas tab the same three groups float as pills over the canvas,
   the canvas runs full height behind them, and a title card floats under
   them top-left. The choice lives in the URL hash (#canvas). */
export function JourneyDetailShell({
  labels,
  hrefs,
  info,
  canvas,
  titleCard,
}: {
  labels: { back: string; info: string; canvas: string; lang: string; cta: string; lab: string };
  hrefs: { library: string; lab: string; lang: string; cta: string };
  info: ReactNode;
  canvas: ReactNode;
  titleCard: ReactNode;
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
    window.history.replaceState(null, "", next === "canvas" ? "#canvas" : window.location.pathname + window.location.search);
  };

  const floating = tab === "canvas";
  const pill = floating ? "rounded-full bg-paper/95 shadow-[0_12px_30px_-16px_rgb(10_16_32/0.35)] ring-1 ring-ink-950/[0.06] backdrop-blur-sm" : "";
  const tabs = [
    { id: "info" as const, label: labels.info, icon: Info },
    { id: "canvas" as const, label: labels.canvas, icon: Workflow },
  ];

  return (
    <div data-lab-root className="relative flex min-h-svh flex-col bg-paper">
      <div
        className={
          floating
            ? "pointer-events-none absolute inset-x-0 top-0 z-40"
            : "sticky top-0 z-40 border-b border-line-soft bg-paper/95 backdrop-blur-sm"
        }
      >
        <div className="altor-container-wide flex h-16 items-center justify-between gap-3">
          <div className={`pointer-events-auto flex items-center gap-1 ${pill} ${floating ? "p-1 pr-3" : ""}`}>
            <Link
              href={hrefs.library}
              className="flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-600 transition-colors duration-[var(--duration-fast)] hover:bg-paper-soft hover:text-ink-950"
            >
              <ArrowLeft aria-hidden className="size-4" />
              <span className="hidden sm:inline">{labels.back}</span>
            </Link>
            <span aria-hidden className="h-4 w-px bg-line-soft" />
            <Link href={hrefs.lab} className="flex h-9 items-center gap-2 px-2 text-sm font-semibold text-ink-950">
              <FlaskConical aria-hidden className="size-4 text-primary-600" />
              <span className="hidden md:inline">{labels.lab}</span>
            </Link>
          </div>

          <div role="tablist" aria-label={`${labels.info} / ${labels.canvas}`} className={`pointer-events-auto flex items-center gap-1 ${pill} ${floating ? "p-1" : ""}`}>
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
                      const other = id === "info" ? "canvas" : "info";
                      select(other);
                      document.getElementById(`${base}-tab-${other}`)?.focus();
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

          <div className={`pointer-events-auto flex items-center gap-1 ${pill} ${floating ? "p-1" : ""}`}>
            <Link
              href={hrefs.lang}
              className="flex h-9 items-center rounded-full px-3 text-sm font-medium text-ink-600 transition-colors duration-[var(--duration-fast)] hover:bg-paper-soft hover:text-ink-950"
            >
              {labels.lang}
            </Link>
            <span className="hidden sm:block">
              <ButtonLink href={hrefs.cta} variant="primary" size="sm">
                {labels.cta}
              </ButtonLink>
            </span>
          </div>
        </div>
      </div>

      <main className="min-w-0 flex-1">
        <div role="tabpanel" id={`${base}-panel-info`} aria-labelledby={`${base}-tab-info`} hidden={!floating ? false : true}>
          {info}
        </div>
        <div role="tabpanel" id={`${base}-panel-canvas`} aria-labelledby={`${base}-tab-canvas`} hidden={!floating} className="relative h-svh">
          {canvas}
          {/* The title card: what this canvas is, always in view. */}
          <div className="pointer-events-none absolute top-[4.75rem] left-4 z-30 hidden max-w-sm sm:block">
            <div className="pointer-events-auto rounded-[24px] bg-paper/95 p-5 shadow-[0_18px_40px_-24px_rgb(10_16_32/0.35)] ring-1 ring-ink-950/[0.06] backdrop-blur-sm">
              {titleCard}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
