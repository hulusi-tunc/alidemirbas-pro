import Link from "next/link";

import CanonicalFlow from "@/components/CanonicalFlow";
import type { JourneyDetail, MergedRedirect } from "@/lib/canonical-view";
import type { copy, Lang } from "@/lib/content";

/* The body of one journey, shared by the full page and the modal that
   intercepts it. A server component: it takes one journey's detail and hands
   the graph to a client island, so the browser receives this journey and no
   other. */

export default function JourneyDetailBody({
  detail,
  merged,
  basePath,
  t,
}: {
  detail: JourneyDetail;
  merged: MergedRedirect | null;
  basePath: string;
  t: (typeof copy)[Lang]["lab"]["page"];
}) {
  return (
    <div>
      {/* A retired id resolves here rather than 404ing, and says so before
          anything else - the journey below is the survivor, not the id in
          the address bar. */}
      {merged ? (
        <p className="mb-6 border border-line bg-paper-soft px-4 py-3 text-[13px] leading-snug text-ink-600">
          {t.mergedNote.replace("{from}", merged.from).replace("{to}", merged.to)}
        </p>
      ) : null}

      <section className="mb-6">
        <p className="altor-eyebrow text-ink-400">{t.entityLabel}</p>
        <p className="mt-1 text-sm text-ink-700">{detail.entityScope}</p>
        <p className="mt-1 text-[13px] leading-snug text-ink-500">{detail.entityNote}</p>
      </section>

      {detail.competition ? (
        <section className="mb-6">
          <p className="altor-eyebrow text-ink-400">{t.competesLabel}</p>
          <p className="mt-1 text-sm text-ink-700">
            {detail.competition.exclusionGroup} · {detail.competition.scope} · on loss:{" "}
            {detail.competition.onLoss}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-ink-500">
            {detail.competition.precedence}
          </p>
        </section>
      ) : null}

      {/* Two journeys in the library carry this. It is rendered where it
          exists and shipped nowhere else. */}
      {detail.preemptedBy.length ? (
        <section className="mb-6">
          <p className="altor-eyebrow text-ink-400">{t.preemptedLabel}</p>
          <ul className="mt-1 space-y-2">
            {detail.preemptedBy.map((p) => (
              <li key={p.event} className="text-[13px] leading-snug text-ink-500">
                <span className="text-ink-700">{p.event}</span> - {p.then}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {detail.distinctFrom.length ? (
        <section className="mb-6">
          <p className="altor-eyebrow text-ink-400">{t.distinctLabel}</p>
          <ul className="mt-1 space-y-2">
            {detail.distinctFrom.map((d) => (
              <li key={d.journey} className="text-[13px] leading-snug text-ink-500">
                {d.slug ? (
                  <Link href={`${basePath}/${d.slug}`} className="font-mono text-blue-700 hover:underline">
                    {d.journey}
                  </Link>
                ) : (
                  <span className="font-mono text-ink-700">{d.journey}</span>
                )}
                {d.name ? <span className="text-ink-600"> {d.name}</span> : null} - {d.because}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-6">
        <p className="altor-eyebrow text-ink-400">{t.flowLabel}</p>
        <div className="mt-3">
          <CanonicalFlow
            nodes={detail.nodes}
            basePath={basePath}
            labels={{ more: t.more, less: t.less, terminal: t.terminalLabel }}
          />
        </div>
      </section>

      <section className="mb-6">
        <p className="altor-eyebrow text-ink-400">{t.guardrailsLabel}</p>
        <ul className="mt-1 space-y-1.5">
          {detail.guardrails.map((g) => (
            <li key={g} className="text-[13px] leading-snug text-ink-600">
              {g}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="altor-eyebrow text-ink-400">{t.ruleLabel}</p>
        <p className="mt-1 text-sm leading-snug text-ink-700">{detail.reusableRule}</p>
      </section>
    </div>
  );
}
