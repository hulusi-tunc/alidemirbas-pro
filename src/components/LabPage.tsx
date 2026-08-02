import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import JourneyBrowser from "@/components/JourneyBrowser";
import { SiteFooter, SiteHeader } from "@/components/Site";
import { Reveal } from "@/components/ui/Reveal";
import { copy, type Lang } from "@/lib/content";

export default function LabPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";

  return (
    <>
      <SiteHeader t={t} />
      <main>
        {/* compact dark hero so the light-on-dark header keeps working */}
        <section data-tone="dark" className="relative isolate overflow-hidden bg-ink-950 pt-32 pb-16 lg:pt-36">
          <div
            aria-hidden
            className="absolute inset-x-0 top-[-18rem] -z-10 h-[32rem] bg-[radial-gradient(50%_50%_at_50%_50%,var(--color-blue-600)_0%,transparent_70%)] opacity-35"
          />
          <div className="altor-container">
            <Reveal>
              <Link
                href={home}
                className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
              >
                <ArrowLeft aria-hidden className="size-3.5" />
                {t.lab.page.back}
              </Link>
              <p className="text-sm font-medium text-primary-300">{t.lab.label}</p>
              <h1 className="mt-4 max-w-3xl bg-gradient-to-r from-primary-300 to-white bg-clip-text text-[clamp(2rem,1.3rem+2.8vw,3.25rem)] leading-[1.06] text-transparent">
                {t.lab.page.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75">{t.lab.page.intro}</p>
            </Reveal>
          </div>
        </section>

        <section className="bg-paper py-16 md:py-20">
          <div className="altor-container">
            <Reveal>
              <JourneyBrowser lang={lang} t={t.lab.page} />
            </Reveal>
          </div>
        </section>

        {/* the other lab project, so the page carries both */}
        <section className="border-t border-line bg-paper-soft py-16">
          <div className="altor-container">
            <Reveal>
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-neutral-500">{t.lab.projects[0].meta}</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink-950">{t.lab.projects[0].name}</h2>
                  <p className="mt-2 max-w-xl text-base leading-relaxed text-ink-600">{t.lab.projects[0].desc}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-x-6 gap-y-2">
                  {t.lab.projects[0].links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                    >
                      {link.label}
                      <ArrowUpRight aria-hidden className="size-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter t={t} />
    </>
  );
}
