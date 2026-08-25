"use client";

import { useState } from "react";

export type TimelineJob = {
  dates: string;
  title: string;
  company?: string;
  info: string;
  bottom?: string;
  subs?: { dates: string; title: string }[];
};

/* Simple/Detailed toggle for the experience timeline — a real interactive
   affordance from the "Portfolio" mockup this page was converted from
   (see AboutPage.tsx's own top comment), not decorative: it hides/shows
   each row's `info` paragraph so a visitor can scan just titles/dates
   first. Kept as its own small client component so AboutPage.tsx itself
   stays a server component (content.ts import, no client-only state). */
export function AboutTimeline({
  jobs,
  labels,
  defaultDetailed = true,
}: {
  jobs: TimelineJob[];
  labels: { simple: string; detailed: string; at: string; bottomLine: string };
  defaultDetailed?: boolean;
}) {
  const [detailed, setDetailed] = useState(defaultDetailed);

  return (
    <div>
      <button
        type="button"
        onClick={() => setDetailed((v) => !v)}
        aria-pressed={detailed}
        className="flex items-center gap-2.5 [font-family:var(--font-mono-plex)]"
      >
        <span className="text-[13px]" style={{ color: detailed ? "#7c9296" : "#22333a" }}>
          {labels.simple}
        </span>
        <span
          aria-hidden
          className="relative inline-block h-6 w-11 rounded-full transition-colors"
          style={{ background: detailed ? "#22333a" : "#8fb0b3" }}
        >
          <span
            className="absolute top-[3px] size-[18px] rounded-full transition-[left]"
            style={{ background: "#dcedee", left: detailed ? "23px" : "3px" }}
          />
        </span>
        <span className="text-[13px]" style={{ color: detailed ? "#22333a" : "#7c9296" }}>
          {labels.detailed}
        </span>
      </button>

      <ol className="mt-12 flex list-none flex-col p-0">
        {jobs.map((job) => (
          <li
            key={job.company ?? job.title}
            className="grid grid-cols-[minmax(0,72px)_28px_minmax(0,1fr)] gap-x-3 pb-12 sm:grid-cols-[minmax(0,1fr)_56px_minmax(0,1.6fr)] sm:gap-x-0 sm:pb-16"
          >
            <div className="pt-1 text-right text-sm sm:text-lg" style={{ color: "#45585c" }}>
              {job.dates}
            </div>
            <div className="relative flex justify-center">
              <span aria-hidden className="absolute top-3 -bottom-2 w-0.5" style={{ background: "#b9d4d6" }} />
              <span
                aria-hidden
                className="relative mt-1.5 size-3 rounded-full border-[2.5px]"
                style={{ borderColor: "#22333a", background: "#dcedee" }}
              />
            </div>
            <div className="max-w-[640px]">
              <h3 className="text-[22px] leading-tight tracking-tight sm:text-[30px]">
                <span className="font-bold">{job.title}</span>
                {job.company && (
                  <>
                    <span className="font-normal"> {labels.at} </span>
                    <span className="font-bold">{job.company}</span>
                  </>
                )}
              </h3>
              {detailed && (
                <p className="mt-4 text-base leading-relaxed sm:text-lg" style={{ color: "#45585c" }}>
                  {job.info}
                </p>
              )}
              {job.subs && (
                <ul className="mt-6 flex list-none flex-col gap-3 p-0">
                  {job.subs.map((sub) => (
                    <li key={sub.title} className="grid grid-cols-[100px_minmax(0,1fr)] items-baseline gap-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-5">
                      <span className="text-sm" style={{ color: "#7c9296" }}>{sub.dates}</span>
                      <span className="text-[15px] font-bold sm:text-base">{sub.title}</span>
                    </li>
                  ))}
                </ul>
              )}
              {detailed && job.bottom && (
                <p className="mt-4 text-base leading-relaxed sm:text-lg" style={{ color: "#45585c" }}>
                  <strong style={{ color: "#22333a" }}>{labels.bottomLine}</strong>{" "}
                  <span className="[font-family:var(--font-mono-plex)]">→</span> {job.bottom}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
