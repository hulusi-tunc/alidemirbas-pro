"use client";

import Link from "next/link";
import { useEffect, useId, useState, type ReactNode } from "react";
import { ArrowLeft, ClipboardList, FlaskConical } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";

/* THE A/B DETAIL PAGE'S CHROME (Hulusi, 2026-09-20: "we need bigger space
   for the previews, everything in boxes is hard to understand - a
   multi-tab layout, or more compact, or direct the reader where to look").
   The journey detail page's answer, taken as it is (JourneyDetailShell):
   one bar - the way back to the library and the Lab mark on the left, the
   tab switch in the middle, the language and the CTA on the right - and
   two panels under a shared header. "Experiment" is the record's subject:
   the two sides at the page's full width with the changed element called
   out, then the claim. "How to run" is everything else: the primary KPI,
   the guardrails, what to watch, the never-do rules, the reusable rule.
   The choice lives in the URL hash (#run), so a link can open the run
   notes directly and the back button returns to the experiment. */
export function AbDetailShell({
  labels,
  hrefs,
  header,
  experiment,
  run,
}: {
  labels: { back: string; lab: string; experiment: string; run: string; lang: string; cta: string };
  hrefs: { library: string; lab: string; lang: string; cta: string };
  header: ReactNode;
  experiment: ReactNode;
  run: ReactNode;
}) {
  const [tab, setTab] = useState<"experiment" | "run">("experiment");
  const base = useId();

  useEffect(() => {
    const fromHash = () => setTab(window.location.hash === "#run" ? "run" : "experiment");
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const select = (next: "experiment" | "run") => {
    setTab(next);
    window.history.replaceState(null, "", next === "run" ? "#run" : window.location.pathname + window.location.search);
  };

  const tabs = [
    { id: "experiment" as const, label: labels.experiment, icon: FlaskConical },
    { id: "run" as const, label: labels.run, icon: ClipboardList },
  ];

  return (
    <div data-lab-root className="flex min-h-svh flex-col bg-paper-soft">
      <div className="sticky top-0 z-40 border-b border-line-soft bg-paper/95 backdrop-blur-sm">
        <div className="altor-container-wide grid h-16 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <div className="flex items-center gap-1">
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

          <div role="tablist" aria-label={`${labels.experiment} / ${labels.run}`} className="flex items-center gap-1">
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
                      const other = id === "experiment" ? "run" : "experiment";
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

          <div className="flex items-center justify-end gap-1">
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

      <main className="min-w-0 flex-1 px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-[1180px]">
          {header}
          <div role="tabpanel" id={`${base}-panel-experiment`} aria-labelledby={`${base}-tab-experiment`} hidden={tab !== "experiment"}>
            {experiment}
          </div>
          <div role="tabpanel" id={`${base}-panel-run`} aria-labelledby={`${base}-tab-run`} hidden={tab !== "run"}>
            {run}
          </div>
        </div>
      </main>
    </div>
  );
}
