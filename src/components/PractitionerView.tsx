import Link from "next/link";
import type { PractitionerView as View, TimelineStep } from "@/lib/practitioner-view";
import type { copy, Lang } from "@/lib/content";
import { CHANNEL_LABEL } from "@/lib/journey-channels";
import type { ChannelId, Label } from "@/canonical/types";
import { configValueText } from "@/canonical/config-text";

/* The practitioner's view of a Customer Journey. Rendered from
   practitioner-view.ts's projection and nothing else: no hand-written
   explanatory copy, no numbers that are not a Config the journey carries.

   Reading order is the brief's: trigger, who enters, suppressed when, the
   recommended orchestration as a timeline, stops when, configure, required
   data, collision and priority, measurement. The technical graph follows
   below it on the page as "Technical logic". Design language is the site's
   own: the mono rail for labels, ruled sections, no cards around prose.
   A label is rendered as a small pill so a RECOMMENDED_DEFAULT never reads
   as a rule and an OPTIONAL_STRATEGY never reads as required. */

type T = (typeof copy)[Lang]["lab"]["page"]["practitioner"];

const LABEL_PILL: Record<Label, string> = {
  CANONICAL_RULE: "bg-ink-950 text-white",
  RECOMMENDED_DEFAULT: "bg-blue-50 text-blue-700",
  CONFIG_REQUIRED: "bg-amber-50 text-amber-700",
  OPTIONAL_STRATEGY: "bg-neutral-100 text-neutral-600",
};

function Pill({ label, t }: { label: Label; t: T }) {
  return (
    <span className={`inline-block shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide whitespace-nowrap ${LABEL_PILL[label]}`}>
      {t.labels[label]}
    </span>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-5">
      <p className="altor-eyebrow text-ink-400">{label}</p>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

function Step({ s, index, view, lang, t }: { s: TimelineStep; index: number; view: View; lang: Lang; t: T }) {
  const roles = view.channelStrategy?.roles ?? [];
  const roleChannels = (role: string) => roles.find((r) => r.role === role)?.channels.map((c) => CHANNEL_LABEL[c as ChannelId][lang]).join("/") ?? "";
  return (
    <li className="relative pl-8">
      <span aria-hidden className="absolute top-1 left-0 grid size-5 place-items-center rounded-full bg-ink-950 font-mono text-[10px] font-semibold text-white">{index + 1}</span>
      {s.gate ? (
        <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-[12px] font-medium text-ink-900 tabular-nums">{s.gate.timing}</span>
          <span className="text-[12px] text-ink-500">
            {t.relative[s.gate.relativeTo as "trigger" | "previous-touch" | "attribute"]}{s.gate.attribute ? ` ${s.gate.attribute}` : ""} · {t.cancelOn} {s.gate.cancelOn.join("; ")}
          </span>
        </div>
      ) : (
        <p className="mb-2 text-[12px] text-ink-500">{t.onClassification}</p>
      )}
      {s.gate?.recheck ? <p className="text-[12px] text-ink-600"><span className="font-medium text-ink-800">{t.recheck}:</span> {s.gate.recheck}</p> : null}
      {s.checks.length ? <p className="mt-1 text-[12px] text-ink-600"><span className="font-medium text-ink-800">{t.checks}:</span> {s.checks.join(" · ")}</p> : null}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="rounded bg-paper-soft px-1.5 py-0.5 font-mono text-[10px] text-ink-600">{s.stage}</span>
        {s.channelRoles.map((r, i) => (
          <span key={r} className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
            {i > 0 ? "→ " : ""}{t.roles[r]}{roleChannels(r) ? ` (${roleChannels(r)})` : ""}
          </span>
        ))}
        {s.mandatory ? <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700">{t.mandatory}</span> : null}
        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">{t.priority}: {s.priority}</span>
        <Pill label={s.label} t={t} />
      </div>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-800">{s.purpose}</p>
      {s.priorityReason ? <p className="mt-1 text-[12px] text-ink-500">{t.priorityReason}: {s.priorityReason}</p> : null}
      {s.destination ? (
        <p className="mt-1 text-[12px] text-ink-600">
          <span className="font-medium text-ink-800">{t.destination}:</span> <span className="font-mono">{s.destination.target}</span> · {t.boundTo} <span className="font-mono">{s.destination.boundTo}</span>
          {s.destination.mustNotClaim?.length ? <> · {t.mustNotClaim}: {s.destination.mustNotClaim.join(", ")}</> : null}
        </p>
      ) : null}
      {s.after ? <p className="mt-1 font-mono text-[10px] text-ink-400">{t.after} {s.after}</p> : null}
    </li>
  );
}

export default function PractitionerView({ view, lang, t, basePath }: { view: View; lang: Lang; t: T; basePath: string }) {
  const bo = view.measurement.businessOutcome;

  /* Configure and required data sit under the left column on a
     communicating journey, whose right column carries the touch plan; a
     silent state has no plan, so they move right and the page stays in two
     columns of comparable height instead of one long one beside a stub. */
  const configureBlocks = (
    <>
      <Block label={t.configure}>
        <ul className="flex flex-col gap-2">
          {view.configure.map((c) => (
            <li key={c.key} className="text-[12.5px] leading-relaxed text-ink-700">
              <span className="font-mono text-[12px] text-ink-900">{c.key}</span> <Pill label={c.label} t={t} />
              {c.class ? <span className="ml-1 font-mono text-[10px] text-ink-400">{c.class}</span> : null}
              <br />
              {c.override ? (
                <>
                  <span className="font-mono text-[12px] text-ink-900">{c.override}</span>{" "}
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-blue-700">{t.preset}</span>{" "}
                  <span className="font-mono text-[11px] text-ink-400 line-through">{c.short}</span>
                </>
              ) : (
                <span className="font-mono text-[12px] text-ink-800">{c.short}</span>
              )}{" "}
              · {c.rule}
            </li>
          ))}
        </ul>
      </Block>
      <Block label={t.requiredData}>
        <p className="text-[12px] text-ink-500">{t.events}</p>
        <ul className="mt-1 flex flex-col gap-0.5 text-[12.5px] text-ink-700">
          {view.requiredData.events.map((e) => (
            <li key={e.id}><span className="font-mono text-[12px] text-ink-900">{e.id}</span> <span className="font-mono text-[10px] text-ink-400">{e.source}</span>: {e.meaning}</li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] text-ink-500">{t.attributes}</p>
        <p className="mt-1 font-mono text-[12px] text-ink-800">{view.requiredData.attributes.required.join(" · ")}</p>
        {view.requiredData.attributes.optional.length ? <p className="mt-1 font-mono text-[12px] text-ink-500">{t.optional}: {view.requiredData.attributes.optional.join(" · ")}</p> : null}
      </Block>
    </>
  );

  return (
    <div data-practitioner-view className="mt-8">
      {view.preset ? (
        <div data-preset-banner className="mb-6 border border-line bg-paper-soft px-4 py-3">
          <p className="altor-eyebrow text-ink-400">{t.preset} · {view.preset.name}</p>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-800"><Pill label={view.preset.applicableWhen.label} t={t} /> {view.preset.applicableWhen.text}</p>
          {view.preset.overrides.length ? (
            <p className="mt-1.5 font-mono text-[12px] text-ink-700">{t.presetOverrides}: {view.preset.overrides.map((o) => `${o.key} = ${o.value}`).join(" · ")}</p>
          ) : (
            <p className="mt-1.5 text-[12px] text-ink-500">{t.presetNoOverrides}</p>
          )}
          {view.preset.destination ? <p className="mt-1 text-[12px] text-ink-500">{t.destination}: {view.preset.destination}</p> : null}
        </div>
      ) : null}
      <p className="text-[15px] leading-relaxed text-ink-800">{view.objective}</p>

      <div className="mt-6 grid grid-cols-1 gap-x-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <Block label={t.trigger}>
            <p className="font-mono text-[13px] text-ink-900">{view.trigger.event}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-700">{view.trigger.meaning}</p>
            <p className="mt-1.5 text-[12px] text-ink-500"><span className="font-medium text-ink-700">{t.notEnough}:</span> {view.trigger.insufficient.join("; ")}</p>
          </Block>
          <Block label={t.entity}>
            <p className="text-[13px] leading-relaxed text-ink-700">{view.entity.scope}</p>
            <p className="mt-1.5 font-mono text-[12px] text-ink-600">{t.instanceKey}: {view.entity.instanceKey.join(" + ")}{view.entity.concurrency ? ` · ${view.entity.concurrency}` : ""}</p>
            {view.entity.supersession ? <p className="mt-1.5 text-[12px] text-ink-600"><Pill label={view.entity.supersession.label} t={t} /> {view.entity.supersession.text}</p> : null}
          </Block>
          <Block label={t.whoEnters}>
            <ul className="flex flex-col gap-1 text-[13px] leading-relaxed text-ink-700">
              {view.whoEnters.map((e) => <li key={e} className="flex gap-2"><span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-ink-400" />{e}</li>)}
            </ul>
          </Block>
          <Block label={t.suppressedWhen}>
            <ul className="flex flex-col gap-1.5 text-[13px] leading-relaxed text-ink-700">
              {view.suppressedWhen.map((s) => <li key={s.id} className="flex items-start gap-2"><Pill label={s.label} t={t} /><span>{s.text}</span></li>)}
            </ul>
          </Block>
          {view.timeline.length ? configureBlocks : null}
        </div>
        <div>
          {view.timeline.length ? (
            <Block label={`${t.orchestration}${view.strategy ? ` · ${view.strategy}` : ""}`}>
              <ol className="flex flex-col gap-6">{view.timeline.map((s, i) => <Step key={s.id} s={s} index={i} view={view} lang={lang} t={t} />)}</ol>
              {view.channelStrategy ? (
                <div className="mt-5 border-t border-line-soft pt-3">
                  <p className="text-[12px] text-ink-500"><span className="font-medium text-ink-700">{t.channelRoles}</span> <Pill label={view.channelStrategy.label} t={t} /></p>
                  <ul className="mt-1.5 flex flex-col gap-1 text-[12px] text-ink-600">
                    {view.channelStrategy.roles.map((r) => <li key={r.role}><span className="font-medium text-ink-800">{t.roles[r.role]}</span> ({r.channels.map((c) => CHANNEL_LABEL[c][lang]).join(", ")}): {r.when}</li>)}
                  </ul>
                  <p className="mt-1.5 text-[12px] text-ink-500">{t.fallback}: {view.channelStrategy.fallback}</p>
                </div>
              ) : null}
            </Block>
          ) : null}
          <Block label={t.stopsWhen}>
            <ul className="flex flex-col gap-1 text-[13px] text-ink-700">
              {view.stopsWhen.exits.map((x) => <li key={x.id} className="flex gap-2"><span className="w-24 shrink-0 font-mono text-[11px] text-ink-400">{x.class}</span><span>{x.state}</span></li>)}
              {view.stopsWhen.handoffs.map((h) => (
                <li key={h.id} className="flex gap-2">
                  <span className="w-24 shrink-0 font-mono text-[11px] text-ink-400">{t.handoff}</span>
                  <span>{h.href ? <Link href={`${basePath}/${h.href}`} className="text-blue-600 hover:text-blue-700">{h.toName ?? h.to}</Link> : <span className="font-mono">{h.to}</span>}: {h.on}</span>
                </li>
              ))}
            </ul>
          </Block>
          {!view.timeline.length ? configureBlocks : null}
          {view.collision ? (
            <Block label={t.collision}>
              <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1 text-[12.5px] text-ink-700">
                <dt className="text-ink-500">{t.priority}</dt><dd>{view.collision.defaultPriority}{view.collision.mandatoryTouches.length ? ` · ${t.mandatoryTouches}: ${view.collision.mandatoryTouches.join(", ")}` : ""}</dd>
                <dt className="text-ink-500">{t.pressureClass}</dt><dd>{view.collision.pressureClass}</dd>
                <dt className="text-ink-500">{t.localCap}</dt><dd>{view.collision.localCap} ({view.collision.localCapAppliesTo})</dd>
                <dt className="text-ink-500">{t.cooldown}</dt><dd>{view.collision.cooldown}</dd>
                <dt className="text-ink-500">{t.competition}</dt><dd>{view.collision.competition}</dd>
              </dl>
              <p className="mt-3 text-[12px] text-ink-500">{t.noAction} <span className="font-mono text-ink-700">{view.collision.noAction.map((s) => s.id).join(" · ")}</span>. {t.noActionNote}</p>
            </Block>
          ) : null}
          <Block label={t.measurement}>
            <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1 text-[12.5px] text-ink-700">
              <dt className="text-ink-500">{t.journeyOutcome}</dt><dd className="font-mono text-[12px]">{view.measurement.journeyOutcome.type}: {view.measurement.journeyLabel}</dd>
              {bo ? (
                <>
                  <dt className="text-ink-500">{t.businessOutcome}</dt><dd><span className="font-mono text-[12px]">{bo.event}</span>: {view.measurement.businessMeaning}</dd>
                  <dt className="text-ink-500">{t.scope}</dt><dd>{bo.observationScope.type === "self" ? t.self : `${t.through} ${bo.observationScope.journeys.join(" → ")}`}{typeof bo.window === "object" && "until" in bo.window ? ` · ${t.until} ${bo.window.until}` : ""}</dd>
                  <dt className="text-ink-500">{t.attribution}</dt><dd>{bo.attribution} · {bo.comparison}{bo.holdout ? ` (${t.holdout} ${configValueText(bo.holdout.default?.value as never)})` : ""}</dd>
                </>
              ) : null}
              <dt className="text-ink-500">{t.guardrails}</dt><dd className="font-mono text-[12px]">{view.measurement.guardrails.join(" · ")}</dd>
            </dl>
          </Block>
          {view.presets.length ? (
            <Block label={t.presets}>
              <ul className="flex flex-col gap-2 text-[12.5px] text-ink-700">
                {view.presets.map((p) => (
                  <li key={p.id}>
                    <Link href={`${basePath}/${p.id}`} className="font-medium text-blue-600 hover:text-blue-700">{p.name}</Link> <Pill label={p.applicableWhen.label} t={t} /> {p.applicableWhen.text}
                    {Object.keys(p.overrides).length ? <span className="block font-mono text-[11px] text-ink-500">{Object.entries(p.overrides).map(([k, v]) => `${k} = ${configValueText(v as never)}`).join(" · ")}</span> : null}
                  </li>
                ))}
              </ul>
            </Block>
          ) : null}
        </div>
      </div>
    </div>
  );
}
