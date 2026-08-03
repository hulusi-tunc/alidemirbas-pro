import { ArrowUpRight } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Section";
import { copy, EMAIL, LINKEDIN, type Lang } from "@/lib/content";

/* About page in the Altor design language: a short dark intro band carrying
   the header, then white-first editorial - biography beside a facts plate,
   and the experience timeline expanded with a line of context per role. */

function Intro({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section
      data-tone="dark"
      className="relative isolate overflow-hidden bg-ink-950 pt-40 pb-20 md:pb-24"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-[-18rem] -z-10 h-[36rem] bg-[radial-gradient(50%_50%_at_50%_50%,var(--color-blue-600)_0%,transparent_70%)] opacity-40"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px)] [background-size:calc(100%/8)_100%]"
      />
      <div className="altor-container">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="altor-eyebrow mb-5 text-white/45">{t.about.eyebrow}</p>
              <h1 className="max-w-3xl bg-gradient-to-r from-primary-300 to-white bg-clip-text text-display-xl text-transparent">
                {t.about.title1}
                <br />
                {t.about.title2}
              </h1>
            </Reveal>
            <Reveal delay={90} className="mt-6">
              <p className="max-w-lg text-xl leading-relaxed text-white/85">{t.about.lead}</p>
            </Reveal>
          </div>

          {/* the home hero's portrait plate, reused verbatim */}
          <Reveal delay={120} className="hidden lg:block">
            <div className="relative mx-auto w-full max-w-sm">
              <div aria-hidden className="absolute -inset-3 border border-white/15" />
              <div className="relative overflow-hidden bg-blue-600">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/portrait.jpg"
                  alt="Ali Demirbaş"
                  className="aspect-4/5 w-full object-cover opacity-95 grayscale"
                />
                <div aria-hidden className="absolute inset-0 bg-blue-600/20 mix-blend-multiply" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Biography({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="altor-container">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_20rem] lg:gap-20">
          <div>
            <SectionHeading eyebrow={t.about.bio.label} title={t.about.bio.title} />
            <div className="mt-10 max-w-2xl space-y-5">
              {t.about.bio.paragraphs.map((paragraph, i) => (
                <Reveal key={i} delay={i * 70}>
                  <p className="text-[1.0625rem] leading-relaxed text-ink-600">{paragraph}</p>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={140}>
            <aside className="border border-line p-8">
              <h2 className="text-sm font-medium text-neutral-500">{t.about.facts.title}</h2>
              <dl className="mt-6 space-y-5">
                {t.about.facts.rows.map((row) => (
                  <div key={row.label}>
                    <dt className="text-sm text-ink-500">{row.label}</dt>
                    <dd className="mt-1 text-base font-medium tracking-tight text-ink-950">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6">
                <a
                  href={`mailto:${EMAIL}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  {t.about.facts.email}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </a>
                <a
                  href={LINKEDIN}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  {t.about.facts.linkedin}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </a>
              </div>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Timeline({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section className="bg-paper-soft py-24 md:py-32">
      <div className="altor-container">
        <SectionHeading
          eyebrow={t.about.timeline.label}
          title={t.about.timeline.title}
          intro={t.about.timeline.intro}
        />
        <div className="mt-14">
          {t.xp.rows.map((row, i) => (
            <Reveal key={row.co + row.years} delay={i * 50}>
              <div className="group grid grid-cols-[7rem_1fr] items-start gap-6 border-t border-line py-8 last:border-b md:grid-cols-[7rem_1fr_auto]">
                <span className="pt-0.5 text-sm text-neutral-500 tabular-nums">{row.years}</span>
                <div>
                  <h3 className="text-lg font-medium tracking-tight text-ink-950">{row.role}</h3>
                  <p className="mt-0.5 text-sm text-ink-500">{row.co}</p>
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-600">{row.desc}</p>
                </div>
                <div className="hidden pt-1 md:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.logo}
                    alt=""
                    className="h-4.5 w-auto max-w-24 object-contain opacity-55 grayscale transition-[filter,opacity] duration-200 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AboutPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? "/tr/about" : "/about";
  return (
    <>
      <SiteHeader t={t} anchorBase={home} langHref={langHref} />
      <main>
        <Intro t={t} />
        <Biography t={t} />
        <Timeline t={t} />
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} />
    </>
  );
}
