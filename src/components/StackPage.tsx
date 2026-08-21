import Image from "next/image";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { Reveal } from "@/components/ui/Reveal";
import { copy, type Lang } from "@/lib/content";
import { logoSrc, stackGroups } from "@/lib/stack";

/* Stack page. The tool list is the cv's stack-data.ts, verbatim (checked
   programmatically against the source - see the port's commit); the design
   is this site's - the same dark title band as About, then the tool groups
   as bordered chips on the light ground, styled after the Lab archive's
   channel badges rather than the cv's rounded tiles. */

function Intro({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section
      data-tone="dark"
      className="relative isolate overflow-hidden bg-ink-950 pt-40 pb-16 md:pb-20"
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
          <p className="altor-eyebrow mb-5 text-white/45">{t.stack.eyebrow}</p>
          <h1 className="max-w-3xl bg-gradient-to-r from-primary-300 to-white bg-clip-text text-display-xl text-transparent">
            {t.stack.title}
          </h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="text-xl leading-relaxed text-white/75">{t.stack.sub}</p>
        </Reveal>
      </div>
    </section>
  );
}

function ToolTile({ name, domain, tag }: { name: string; domain: string; tag: string }) {
  return (
    <div className="group flex items-center gap-3 border border-line bg-paper p-3.5 transition-colors hover:border-neutral-400">
      <span className="relative size-11 shrink-0 border border-line bg-paper-soft p-2">
        <Image src={logoSrc(domain)} alt="" fill sizes="2.75rem" className="object-contain" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-medium tracking-tight text-ink-950">{name}</span>
        <span className="block truncate text-xs text-neutral-500">{tag}</span>
      </span>
    </div>
  );
}

function Groups({ lang }: { lang: Lang }) {
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="altor-container">
        <div className="flex flex-col gap-12">
          {stackGroups.map((group, gi) => (
            <Reveal key={group.title.en} delay={gi * 40}>
              <h2 className="border-b border-line pb-2 text-base font-semibold tracking-tight text-ink-950">
                {group.title[lang]}
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.tools.map((tool) => (
                  <ToolTile key={tool.name} name={tool.name} domain={tool.domain} tag={tool.tag[lang]} />
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function StackPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? "/tr/stack" : "/stack";
  return (
    <>
      <SiteHeader t={t} anchorBase={home} langHref={langHref} />
      <main>
        <Intro t={t} />
        <Groups lang={lang} />
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
