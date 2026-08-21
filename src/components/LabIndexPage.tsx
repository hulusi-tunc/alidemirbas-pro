import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { LabProjectGrid } from "@/components/ui/LabProjectGrid";
import { Reveal } from "@/components/ui/Reveal";
import { copy, type Lang } from "@/lib/content";

/* The /lab landing page - what nav.labHref actually points to. Before this
   existed, /lab dropped straight into the CRM Journey Archive tool (now at
   /lab/journeys) with no orientation. This gives Lab the same dark-band
   intro every other subpage has, then the same project grid the home page
   teases, as the actual destination. */

function Intro({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section
      data-tone="dark"
      className="relative isolate overflow-hidden bg-ink-950 pt-40 pb-20 md:pb-28"
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
        <Reveal>
          <p className="altor-eyebrow mb-5 text-white/45">{t.lab.label}</p>
          <h1 className="max-w-3xl bg-gradient-to-r from-primary-300 to-white bg-clip-text text-display-xl text-transparent">
            {t.lab.title}
          </h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="max-w-2xl text-xl leading-relaxed text-white/75">{t.lab.intro}</p>
        </Reveal>
      </div>
    </section>
  );
}

function Projects({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="altor-container">
        <LabProjectGrid t={t} />
      </div>
    </section>
  );
}

export default function LabIndexPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? "/tr/lab" : "/lab";
  return (
    <>
      <SiteHeader t={t} anchorBase={home} langHref={langHref} />
      <main>
        <Intro t={t} />
        <Projects t={t} />
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
