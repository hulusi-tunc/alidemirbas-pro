import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { Reveal } from "@/components/ui/Reveal";
import { copy, type Lang } from "@/lib/content";

/* About page. The copy and the experience data are the cv's, verbatim; the
   design is this site's — a dark title band, the biography set beside the
   portrait plate, and the experience list built on the home page's Experience
   rows, widened to carry a period and a description per role.

   One row is a GROUP: two successive roles at Wingie Enuygun Group share a
   company heading and a span, which is why the timeline is a discriminated
   union rather than a flat list. */

type Timeline = (typeof copy)["en"]["about"]["timeline"];
type Entry = Timeline[number];

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
          <p className="altor-eyebrow mb-5 text-white/45">{t.about.eyebrow}</p>
          <h1 className="max-w-3xl bg-gradient-to-r from-primary-300 to-white bg-clip-text text-display-xl text-transparent">
            {t.about.title}
          </h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="text-xl leading-relaxed text-white/75">{t.about.sub}</p>
        </Reveal>
      </div>
    </section>
  );
}

function Biography({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="altor-container">
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="text-[1.375rem] leading-relaxed tracking-[-0.011em] text-ink-900">
                {t.about.lead}
              </p>
            </Reveal>
            <Reveal delay={90} className="mt-6">
              <p className="text-[1.0625rem] leading-relaxed text-ink-600">{t.about.body}</p>
            </Reveal>
          </div>

          {/* the home hero's portrait plate, on the light ground */}
          <Reveal delay={140}>
            <div className="relative mx-auto w-full max-w-sm">
              <div aria-hidden className="absolute -inset-3 border border-line" />
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

/** Company logo — same treatment as the home page's Experience rows. */
function Logo({ src }: { src: string }) {
  return (
    <div className="hidden pt-1 md:block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="h-4.5 w-auto max-w-24 object-contain opacity-55 grayscale transition-[filter,opacity] duration-200 group-hover:opacity-100 group-hover:grayscale-0"
      />
    </div>
  );
}

const rowClass =
  "group grid grid-cols-[4.5rem_1fr] items-start gap-6 border-t border-line py-8 last:border-b md:grid-cols-[4.5rem_1fr_auto]";

function TimelineEntry({ item }: { item: Entry }) {
  if (item.kind === "group") {
    return (
      <div className={rowClass}>
        <span className="pt-0.5 text-sm text-neutral-500 tabular-nums">{item.year}</span>
        <div>
          <h3 className="text-lg font-medium tracking-tight text-ink-950">{item.co}</h3>
          <p className="mt-0.5 text-sm text-ink-500">{item.span}</p>
          {/* The two roles hang off a rule, so the nesting is visible rather
              than implied by indentation alone. */}
          <div className="mt-6 space-y-6 border-l border-line pl-6">
            {item.roles.map((r) => (
              <div key={r.role}>
                <h4 className="text-base font-medium tracking-tight text-ink-950">{r.role}</h4>
                <p className="mt-0.5 text-sm text-ink-500 tabular-nums">{r.period}</p>
                <p className="mt-2 max-w-xl text-base leading-relaxed text-ink-600">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <Logo src={item.logo} />
      </div>
    );
  }

  return (
    <div className={rowClass}>
      <span className="pt-0.5 text-sm text-neutral-500 tabular-nums">{item.year}</span>
      <div>
        <h3 className="text-lg font-medium tracking-tight text-ink-950">{item.role}</h3>
        <p className="mt-0.5 text-sm text-ink-500">{item.co}</p>
        <p className="mt-0.5 text-sm text-ink-500 tabular-nums">{item.period}</p>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-600">{item.desc}</p>
      </div>
      <Logo src={item.logo} />
    </div>
  );
}

function Experience({ t }: { t: (typeof copy)[Lang] }) {
  const timeline = t.about.timeline as Timeline;
  return (
    <section id="experience" className="bg-paper-soft py-24 md:py-32">
      <div className="altor-container">
        <Reveal>
          <h2 className="text-[clamp(1.75rem,1.15rem+2.4vw,2.875rem)] leading-[1.08] text-ink-900">
            {t.about.experience}
          </h2>
        </Reveal>
        <div className="mt-12">
          {timeline.map((item, i) => (
            <Reveal key={item.co + item.year} delay={i * 50}>
              <TimelineEntry item={item} />
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
        <Experience t={t} />
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} />
    </>
  );
}
