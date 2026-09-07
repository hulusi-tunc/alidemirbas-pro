import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { ArrowRight, Bot, CircleCheck, CircleSlash, CircleX, Clock, Gavel, Mail, Power, Radio, UserRound, Wallet } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { LabProjectIcon, labAccent } from "@/components/ui/LabProjectIdentity";
import { ProductFrame } from "@/components/ui/ProductFrame";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Section";
import { WorkScroll } from "@/components/ui/WorkScroll";
import { withJourneyCount } from "@/lib/archive";
import { copy, type Lang } from "@/lib/content";
import { CHANGE_HISTORY_REAL, DASHBOARD_REAL } from "@/lib/lab-material";

/* THE "WHAT I DO" BAND (homepage). Four services with one drawn piece of
   evidence each, in the miniature idiom Hulusi approved on the hero
   (small paper-soft cards, circle badges, skeleton bars, one ringed
   element, real figures, no invented words), presented scroll-driven by
   `ui/WorkScroll.tsx`: the rows scroll, the evidence stays pinned and
   switches. Every card is real material from the tool it stands for:
   the Dashboard Builder's comparability rule on its README example, a
   journey as the library defines one, three rows of the change-history
   demo, the A/B pair. */

type T = (typeof copy)[Lang];

/* --- the evidence ------------------------------------------------------ */

/* Each card is a white sheet on the project's own plate (ui/ProductFrame:
   the meadow photograph in the project's hue wash), so the four panels
   read as four different pictures as they switch (Hulusi, 2026-09-07:
   "use different background images for each one, with colour overlays"). */
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div aria-hidden className={`rounded-2xl bg-paper p-4 shadow-[0_28px_70px_-30px_rgb(10_16_32/0.55)] ring-1 ring-ink-950/[0.06] sm:p-5 ${className}`}>
      {children}
    </div>
  );
}

function Sheet({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function Bar({ className = "", w = "w-full" }: { className?: string; w?: string }) {
  return <span className={`block h-1.5 rounded-full bg-ink-950/10 ${w} ${className}`} />;
}

/** The comparability check on the README's own figures: four revenue
    sources that must not be added, the naive total struck, the platform of
    record standing. The bars grow when the card becomes the active one. */
function ComparabilityCard({ lang }: { lang: Lang }) {
  const ex = DASHBOARD_REAL.revenueExample;
  const max = Math.max(...ex.parts.map((x) => x.value));
  return (
    <Card>
      <Sheet>
        <ul className="flex flex-col gap-2.5">
          {ex.parts.map((x, i) => (
            <li key={x.source} className="grid grid-cols-[5.5rem_minmax(0,1fr)_3.5rem] items-center gap-3 text-xs">
              <span className="truncate text-ink-600">{x.source}</span>
              <span className="h-2 overflow-hidden rounded-full bg-primary-100">
                <span
                  className="block h-2 origin-left scale-x-0 rounded-full bg-primary-500 transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-data-[on=true]:scale-x-100 motion-reduce:scale-x-100 motion-reduce:transition-none"
                  style={{ width: `${(x.value / max) * 100}%`, transitionDelay: `${120 + i * 90}ms` }}
                />
              </span>
              <span className="text-right font-mono text-ink-950 tabular-nums">${x.value.toFixed(1)}M</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3.5 text-xs">
          <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 font-medium text-rose-700">
            <CircleSlash aria-hidden className="size-3.5" />
            {lang === "en" ? "Not comparable" : "Karşılaştırılamaz"}
          </span>
          <span className="text-ink-500">
            {lang === "en" ? "Added up" : "Toplanınca"}{" "}
            <span className="font-mono text-ink-400 line-through tabular-nums">${ex.naiveSum.toFixed(1)}M</span>
            {" · "}
            {lang === "en" ? "Platform of record" : "Kayıt platformu"}{" "}
            <span className="font-mono font-semibold text-ink-950 tabular-nums">${ex.trueTotal.toFixed(1)}M</span>
          </span>
        </div>
      </Sheet>
    </Card>
  );
}

function Node({ tint, icon, children, className = "" }: { tint: string; icon: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-paper-soft p-3.5 ${className}`}>
      <div className="flex items-center gap-2">
        <span className={`grid size-6 shrink-0 place-items-center rounded-full ${tint} [&>svg]:size-3.5`}>{icon}</span>
        <Bar w="w-12" />
      </div>
      {children}
    </div>
  );
}

/** A journey as the library defines one: trigger, a step with its wait, the
    condition, the two kinds of exit. Real node kinds, no words. */
function JourneyCard({ proof }: { proof: string }) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <Node tint="bg-ink-950 text-white" icon={<Radio aria-hidden />} className="flex-1">
          <Bar className="mt-3" />
          <Bar className="mt-1.5" w="w-2/3" />
        </Node>
        <span className="h-px w-3 shrink-0 bg-ink-300" />
        <Node tint="bg-primary-600 text-white" icon={<Mail aria-hidden />} className="flex-1">
          <Bar className="mt-3" />
          <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-paper-soft px-2 py-1">
            <Clock aria-hidden className="size-3.5 text-ink-500" />
            <Bar w="w-7" />
          </span>
        </Node>
        <span className="h-px w-3 shrink-0 bg-ink-300" />
        <div className="flex flex-1 flex-col gap-2">
          <span className="flex items-center gap-2 rounded-2xl bg-paper-soft px-3 py-2.5">
            <CircleCheck aria-hidden className="size-4 shrink-0 text-emerald-600" />
            <Bar />
          </span>
          <span className="flex items-center gap-2 rounded-2xl bg-paper-soft px-3 py-2.5">
            <CircleX aria-hidden className="size-4 shrink-0 text-rose-600" />
            <Bar />
          </span>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-ink-950 tabular-nums">{proof}</p>
    </Card>
  );
}

const KIND: Record<string, { icon: ReactNode; tint: string }> = {
  Budget: { icon: <Wallet aria-hidden />, tint: "bg-primary-50 text-primary-700" },
  Bidding: { icon: <Gavel aria-hidden />, tint: "bg-violet-50 text-violet-700" },
  Status: { icon: <Power aria-hidden />, tint: "bg-emerald-50 text-emerald-700" },
};

/** Three rows of the change-history demo as the explorer shows them: the
    campaign, the kind of change, old value to new value, who made it. */
function ChangeLogCard({ lang }: { lang: Lang }) {
  const rows = CHANGE_HISTORY_REAL.explorerRows.slice(0, 3);
  return (
    <Card>
      <Sheet>
        <ul className="flex flex-col">
          {rows.map((r, i) => {
            const kind = KIND[r.category] ?? KIND.Budget;
            const v = r[lang];
            return (
              <li key={`${r.campaign}-${i}`} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 border-t border-line px-2 py-3 first:border-t-0 sm:grid-cols-[2rem_minmax(0,1fr)_auto_auto] sm:gap-4">
                <span className={`grid size-8 place-items-center rounded-lg ${kind.tint} [&>svg]:size-4`}>{kind.icon}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink-950">{r.campaign}</span>
                  <span className="block text-xs text-ink-500">{v.date}</span>
                </span>
                <span className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
                  <span className="text-ink-400 line-through">{v.old}</span>
                  <ArrowRight aria-hidden className="size-3 text-ink-400" />
                  <span className="font-semibold text-ink-950">{v.new}</span>
                </span>
                <span className="hidden items-center gap-1.5 text-xs text-ink-600 sm:flex">
                  {"automated" in r && r.automated ? <Bot aria-hidden className="size-3.5 text-amber-600" /> : <UserRound aria-hidden className="size-3.5 text-ink-400" />}
                  {r.user}
                </span>
              </li>
            );
          })}
        </ul>
      </Sheet>
    </Card>
  );
}

/** The A/B pair: the same cart twice, the coupon field in A, the link in B,
    the tested element ringed. */
function AbCard({ proof }: { proof: string }) {
  return (
    <Card>
      <div className="grid grid-cols-2 gap-3">
        {(["A", "B"] as const).map((mark) => (
          <div key={mark} className="rounded-2xl bg-paper-soft p-4">
            <div className="flex items-center gap-2">
              <span className={`grid size-6 place-items-center rounded-full text-xs font-semibold text-white ${mark === "A" ? "bg-ink-950" : "bg-rose-600"}`}>{mark}</span>
              <Bar w="w-14" />
            </div>
            <Bar className="mt-4" />
            <Bar className="mt-2" w="w-3/4" />
            {mark === "A" ? (
              <span className="mt-4 block h-8 rounded-lg bg-paper ring-2 ring-rose-300" />
            ) : (
              <span className="mt-4 flex h-8 items-center">
                <span className="h-1.5 w-1/2 rounded-full bg-primary-500 ring-2 ring-rose-300 ring-offset-2 ring-offset-paper-soft" />
              </span>
            )}
            <span className="mt-4 block h-8 rounded-lg bg-ink-950/90" />
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm font-medium text-ink-950 tabular-nums">{proof}</p>
    </Card>
  );
}

/* --- the band --------------------------------------------------------- */

export function Work({ t, lang }: { t: T; lang: Lang }) {
  const services = t.home.work.services;
  const projectOf = (slug: string) => t.lab.projects.find((p) => p.slug === slug);
  const evidence = (slug: string): ReactNode => {
    const proof = withJourneyCount(projectOf(slug)?.proof ?? "");
    let card: ReactNode = null;
    switch (slug) {
      case "dashboard-builder":
        card = <ComparabilityCard lang={lang} />;
        break;
      case "lifecycle-card-archive":
        card = <JourneyCard proof={proof} />;
        break;
      case "google-ads-change-history-dashboard":
        card = <ChangeLogCard lang={lang} />;
        break;
      case "ab-test-playbook":
        card = <AbCard proof={proof} />;
        break;
    }
    return (
      <ProductFrame slug={slug} inset="sm" className="flex h-full flex-col justify-center">
        {card}
      </ProductFrame>
    );
  };

  const rows = services.map((service) => {
    const project = projectOf(service.tool);
    const accent = labAccent(service.tool);
    return (
      <div key={service.title} className="flex items-start gap-4">
        <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-xl ${accent.tile}`}>
          <LabProjectIcon slug={service.tool} className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-h3 text-ink-950">{service.title}</h3>
          <p className="mt-3 max-w-[52ch] leading-relaxed text-pretty text-ink-600">{service.body}</p>
          {project && (
            <Link
              href={project.links[0].href}
              className="mt-5 flex w-fit items-center gap-1.5 text-sm font-medium text-ink-950 transition-colors duration-[var(--duration-fast)] hover:text-primary-600"
            >
              {t.home.work.builtFor}: {project.short}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          )}
        </div>
      </div>
    );
  });
  const panels = services.map((service) => <Fragment key={service.tool}>{evidence(service.tool)}</Fragment>);

  return (
    <section id="work" className="bg-paper py-16 md:py-20">
      <div className="altor-container">
        <SectionHeading eyebrow={t.home.work.eyebrow} title={t.home.work.title} intro={t.home.work.lede} />
        <Reveal className="mt-14">
          <WorkScroll rows={rows} panels={panels} />
        </Reveal>
        <Reveal delay={120} className="mt-14">
          <ButtonLink href={t.nav.labHref} variant="outline" size="md">
            {t.home.labMore}
            <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
