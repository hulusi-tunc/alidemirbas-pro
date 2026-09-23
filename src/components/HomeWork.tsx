import { ArrowDown, ArrowRight, BarChart3, FlaskConical, Search, Workflow } from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Section";
import { copy, type Lang } from "@/lib/content";
import { withLabProjectFacts } from "@/lib/lab-project-facts";

type T = (typeof copy)[Lang];

const AREA_ICONS = [BarChart3, Workflow, Search, FlaskConical] as const;

const VISUAL = {
  en: {
    eyebrow: "One system",
    title: "From signal to decision.",
    steps: ["Measure", "Understand behavior", "Act through CRM", "Test what changes"],
    footer: "Observe → understand → act → learn",
  },
  tr: {
    eyebrow: "Tek sistem",
    title: "Sinyalden karara.",
    steps: ["Ölç", "Davranışı anla", "CRM ile aksiyon al", "Değişeni test et"],
    footer: "Gözlemle → anla → aksiyon al → öğren",
  },
} as const;

function WorkVisual({ lang }: { lang: Lang }) {
  const v = VISUAL[lang];
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-paper-soft p-5 ring-1 ring-ink-950/[0.06] sm:p-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="altor-eyebrow text-ink-subtle">{v.eyebrow}</p>
          <p className="mt-2 text-h3 text-ink-950">{v.title}</p>
        </div>
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700">
          <BarChart3 className="size-5" />
        </span>
      </div>

      <div className="mt-7 grid gap-2">
        {v.steps.map((step, i) => {
          const Icon = AREA_ICONS[i] ?? BarChart3;
          return (
            <div key={step}>
              <div className="flex items-center gap-3 rounded-xl bg-paper px-4 py-3.5 ring-1 ring-ink-950/[0.05]">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-700">
                  <Icon className="size-4" />
                </span>
                <span className="text-sm font-medium text-ink-950">{step}</span>
                <span className="ml-auto font-mono text-xs text-ink-300 tabular-nums">0{i + 1}</span>
              </div>
              {i < v.steps.length - 1 ? (
                <div className="flex h-5 items-center pl-7">
                  <ArrowDown aria-hidden className="size-3.5 text-ink-300" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="mt-6 border-t border-line-soft pt-4 text-sm text-ink-muted">{v.footer}</p>
    </div>
  );
}

/* Homepage work section: four areas the work covers, each naming the Lab
   project built for it ("Built for this: <project>"), linking straight to
   that project's page. The project name and href come from t.lab.projects
   (matched by the service's `tool` slug) rather than being typed here a
   second time, so the two stay in sync on their own. */
export function Work({ t, lang }: { t: T; lang: Lang }) {
  const services = t.home.work.services;
  const projectBySlug = new Map(t.lab.projects.map((project) => [project.slug, project] as const));

  return (
    <section id="work" className="bg-paper py-20 md:py-28">
      <div className="altor-container">
        <SectionHeading eyebrow={t.home.work.eyebrow} title={t.home.work.title} intro={t.home.work.lede} />

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)] lg:items-start lg:gap-16">
          <div className="flex flex-col">
            {services.map((service, i) => {
              const Icon = AREA_ICONS[i] ?? BarChart3;
              const project = projectBySlug.get(service.tool);
              const projectHref = project?.links[0]?.href;
              return (
                <Reveal key={service.title} delay={i * 60}>
                  <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-t border-line-soft py-7 first:border-t-0 first:pt-0">
                    <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-paper-soft text-ink-700">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-h3 text-ink-950">{service.title}</h3>
                      <p className="mt-3 max-w-[56ch] leading-relaxed text-pretty text-ink-600">{withLabProjectFacts(service.body)}</p>
                      {project && projectHref ? (
                        <Link
                          href={projectHref}
                          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 transition-colors hover:text-primary-800"
                        >
                          {t.home.work.builtFor}: {project.name}
                          <ArrowRight aria-hidden className="size-3.5" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </Reveal>
              );
            })}

            <Reveal delay={260} className="mt-4">
              <ButtonLink href={t.nav.labHref} variant="outline" size="md">
                {t.home.labMore}
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            </Reveal>
          </div>

          <Reveal delay={120} className="lg:sticky lg:top-24">
            <WorkVisual lang={lang} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
