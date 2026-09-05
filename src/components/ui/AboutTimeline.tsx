"use client";

import { useState } from "react";

import { clsx } from "@/lib/clsx";

export type TimelineJob = {
  dates: string;
  title: string;
  company?: string;
  info: string;
  bottom?: string;
  subs?: { dates: string; title: string }[];
};

/* Simple/Detailed toggle for the experience timeline — a real interactive
   affordance, not decorative: it hides/shows each row's `info` paragraph
   and Bottom Line so a visitor can scan just titles and dates first. Kept
   as its own small client component so AboutPage.tsx stays a server
   component (content.ts import, no client-only state).

   REBUILT (2026-09-05) alongside AboutPage's editorial redesign. Three
   things changed and two of them were live bugs:

   - The toggle was a switch whose KNOB HAD NO BACKGROUND COLOUR - an
     18px transparent circle on a blue track, i.e. invisible. It is now a
     segmented control (the shape the reference specifies anyway), which
     has no knob to lose and reads its own state from the active plate.
   - Both `[font-family:var(--font-mono-plex)]` call sites pointed at a
     variable THAT NO LONGER EXISTS - a leftover from the pre-brand-
     guideline font set, silently falling back to the inherited sans.
     They now use the real `font-mono` token.
   - Rows are hairline-ruled instead of hanging off a centre rail, on the
     3/9 asymmetric split the redesign uses everywhere: date rail left,
     narrative right. No shadows - depth here is tonal and linear only. */
export function AboutTimeline({
  jobs,
  labels,
  eyebrow,
  title,
  defaultDetailed = true,
}: {
  jobs: TimelineJob[];
  labels: { simple: string; detailed: string; at: string; bottomLine: string; active: string };
  /* The section header is rendered here, not by the page, because the
     reference pairs it with the toggle on one baseline - and the toggle
     is the only reason this component is a client component at all. */
  eyebrow: string;
  title: string;
  defaultDetailed?: boolean;
}) {
  const [detailed, setDetailed] = useState(defaultDetailed);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="altor-eyebrow text-ink-500">{eyebrow}</p>
          <h2 className="mt-1.5 text-[clamp(1.625rem,1.2rem+1.7vw,2.5rem)] leading-[1.15] font-semibold tracking-[-0.025em] text-ink-950">
            {title}
          </h2>
        </div>
        {/* Segmented control. `aria-pressed` on each half rather than one
            switch: two named options is what the control actually is. */}
        <div className="inline-flex items-center gap-1 self-start rounded-lg bg-paper-soft p-1 sm:self-auto">
          {[
            { id: "detailed", label: labels.detailed, on: detailed },
            { id: "simple", label: labels.simple, on: !detailed },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={opt.on}
              onClick={() => setDetailed(opt.id === "detailed")}
              className={clsx(
                "rounded-md px-3 py-1.5 font-mono text-[12px] transition-colors",
                opt.on ? "bg-paper font-medium text-ink-950" : "text-ink-500 hover:text-ink-900",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ol className="mt-8 flex list-none flex-col border-t border-line p-0">
        {jobs.map((job, i) => (
          <li
            key={job.company ?? job.title}
            className="grid grid-cols-1 gap-x-8 gap-y-3 border-b border-line py-7 transition-colors hover:bg-paper-soft lg:grid-cols-12 lg:py-8"
          >
            <div className="flex items-center gap-3 lg:col-span-3 lg:items-baseline">
              <span
                className={clsx(
                  "rounded px-2 py-0.5 font-mono text-[12px] tracking-wide tabular-nums",
                  i === 0 ? "bg-primary-50 font-semibold text-primary-700" : "bg-paper-soft text-ink-500",
                )}
              >
                {job.dates}
              </span>
              {i === 0 && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-primary-700">
                  <span aria-hidden className="size-1.5 rounded-full bg-primary-600" />
                  {labels.active}
                </span>
              )}
            </div>

            <div className="lg:col-span-9">
              <h3 className="text-[19px] leading-snug font-semibold tracking-[-0.015em] text-ink-950">
                {job.title}
                {job.company && (
                  <>
                    <span className="font-normal text-ink-500"> {labels.at} </span>
                    <span className={i === 0 ? "text-primary-700" : undefined}>{job.company}</span>
                  </>
                )}
              </h3>
              {detailed && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-600">{job.info}</p>}
              {job.subs && detailed && (
                <ul className="mt-3 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
                  {job.subs.map((sub) => (
                    <li key={sub.title} className="rounded border border-line bg-paper-soft px-3 py-2 text-[13px] text-ink-600">
                      <span className="font-mono font-medium text-ink-900 tabular-nums">{sub.dates}</span>
                      <span aria-hidden className="text-ink-300"> · </span>
                      {sub.title}
                    </li>
                  ))}
                </ul>
              )}
              {detailed && job.bottom && (
                <p className="mt-3 inline-flex flex-wrap items-baseline gap-x-2 rounded-md border border-line bg-paper-soft px-3.5 py-2 text-[14px] leading-relaxed text-ink-700">
                  <span className="font-semibold text-ink-950">{labels.bottomLine}</span>
                  <span aria-hidden className="font-mono font-semibold text-primary-700">
                    →
                  </span>
                  <span>{job.bottom}</span>
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
