import { ArrowUpRight } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { Reveal } from "@/components/ui/Reveal";
import { copy, type Lang } from "@/lib/content";

/* Landing page for the ab-test-playbook Claude Code plugin. Structure is
   borrowed from a marketing page a competitor built for their own A/B
   testing skill (install guide -> methodology -> worked example -> FAQ) -
   but every word of content here is real, pulled verbatim or translated
   from the plugin's own README/CLAUDE.md/methodology.md/FAQ.md, not
   invented for this page. Design is this site's own - sharp corners, the
   dark Intro band every other subpage uses, no rounded cards or borrowed
   branding from the reference. */

const REPO = "https://github.com/ali-demirbas/ab-test-playbook";
const DEMO = "https://ali-demirbas.github.io/ab-test-playbook/";

function Intro({ t }: { t: (typeof copy)[Lang] }) {
  const c = t.abTesting;
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
          <p className="altor-eyebrow mb-5 text-white/45">{c.eyebrow}</p>
          <h1 className="max-w-3xl bg-gradient-to-r from-primary-300 to-white bg-clip-text text-display-xl text-transparent">
            {c.title}
          </h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="max-w-2xl text-xl leading-relaxed text-white/75">{c.sub}</p>
        </Reveal>
        <Reveal delay={140} className="mt-8">
          <div className="flex flex-wrap gap-2.5">
            <a
              href={REPO} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 border border-white/20 px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white"
            >
              {c.repoLink}
              <ArrowUpRight aria-hidden className="size-3.5" />
            </a>
            <a
              href={DEMO} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 border border-white/20 px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white"
            >
              {c.demoLink}
              <ArrowUpRight aria-hidden className="size-3.5" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Install({ t }: { t: (typeof copy)[Lang] }) {
  const c = t.abTesting.install;
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="altor-container">
        <Reveal>
          <h2 className="text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-[1.1] text-ink-900">{c.title}</h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {c.options.map((opt, i) => (
            <Reveal key={opt.label} delay={i * 70}>
              <div className="flex h-full flex-col border border-line">
                <p className="border-b border-line px-4 py-2.5 text-sm font-medium text-ink-700">{opt.label}</p>
                <pre className="flex-1 overflow-x-auto bg-ink-950 p-4 font-mono text-xs leading-relaxed text-white/85">
                  {opt.code}
                </pre>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Framework({ t }: { t: (typeof copy)[Lang] }) {
  const c = t.abTesting.framework;
  return (
    <section className="bg-paper-soft py-24 md:py-32">
      <div className="altor-container">
        <Reveal>
          <h2 className="max-w-2xl text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-[1.1] text-ink-900">{c.title}</h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
          {c.boxes.map((box, i) => (
            <Reveal key={box.title} delay={i * 80} className="bg-paper">
              <div className="flex h-full flex-col p-8">
                <span className="text-sm font-medium text-neutral-500">0{i + 1}</span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-ink-950">{box.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-ink-600">{box.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Principles({ t }: { t: (typeof copy)[Lang] }) {
  const c = t.abTesting;
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="altor-container">
        <Reveal>
          <h2 className="max-w-2xl text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-[1.1] text-ink-900">{c.principlesTitle}</h2>
        </Reveal>
        <div className="mt-10">
          {c.principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 60}>
              <div className="grid grid-cols-1 gap-2 border-t border-line py-6 last:border-b md:grid-cols-[16rem_1fr] md:gap-8">
                <h3 className="text-base font-medium tracking-tight text-ink-950">{p.title}</h3>
                <p className="max-w-2xl text-base leading-relaxed text-ink-600">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScenarioBox({ label, items }: { label: string; items: readonly string[] }) {
  return (
    <div className="border border-line bg-paper p-6">
      <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">{label}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="text-sm leading-relaxed text-ink-600">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Example({ t }: { t: (typeof copy)[Lang] }) {
  const c = t.abTesting;
  const ex = c.example;
  return (
    <section className="bg-paper-soft py-24 md:py-32">
      <div className="altor-container">
        <Reveal>
          <h2 className="max-w-2xl text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-[1.1] text-ink-900">{c.exampleTitle}</h2>
        </Reveal>
        <Reveal delay={80} className="mt-10">
          <div className="border border-line bg-paper">
            <div className="border-b border-line p-8">
              <p className="text-xs text-neutral-500 tabular-nums">{ex.idx}</p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-ink-950">{ex.title}</h3>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-600">{ex.intro}</p>
            </div>
            <div className="grid grid-cols-1 gap-px bg-line p-px md:grid-cols-3">
              <ScenarioBox label={ex.testBox.label} items={ex.testBox.items} />
              <ScenarioBox label={ex.kpiBox.label} items={ex.kpiBox.items} />
              <ScenarioBox label={ex.dontBox.label} items={ex.dontBox.items} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Faq({ t }: { t: (typeof copy)[Lang] }) {
  const c = t.abTesting;
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="altor-container">
        <Reveal>
          <h2 className="text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-[1.1] text-ink-900">{c.faqTitle}</h2>
          <p className="mt-3 max-w-xl text-base text-ink-500">{c.faqIntro}</p>
        </Reveal>
        <div className="mt-10 max-w-3xl">
          {c.faq.map((item, i) => (
            <Reveal key={item.q} delay={i * 50}>
              <div className="border-t border-line py-6 last:border-b">
                <h3 className="text-base font-medium tracking-tight text-ink-950">{item.q}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-600">{item.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AbTestingPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? "/tr/lab/ab-testing" : "/lab/ab-testing";
  return (
    <>
      <SiteHeader t={t} anchorBase={home} langHref={langHref} />
      <main>
        <Intro t={t} />
        <Install t={t} />
        <Framework t={t} />
        <Principles t={t} />
        <Example t={t} />
        <Faq t={t} />
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
