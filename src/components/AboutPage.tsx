import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { LabProjectIcon, labAccent } from "@/components/ui/LabProjectIdentity";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Section";
import { withJourneyCount } from "@/lib/archive";
import { copy, type Lang } from "@/lib/content";

/* About page - REBUILT IN THE HOMEPAGE'S LANGUAGE (2026-09-07, Hulusi: "now
   update the About page"). Three moves, all on material the site already
   owns: the opening puts the person and the words in one screen (the colour
   portrait as a card with the one fact that matters as a pill, beside the
   statement, the current-role paragraph and the two actions - no more
   greyscale plate, no second band for the buttons); the record is the
   timeline the homepage's bio approved (bare wordmarks, the rail that
   draws itself, rows arriving in turn), here with each role's own line
   from content.ts's `about.timeline` - the site's source of truth for those
   facts - and no Simple/Detailed toggle; and the six things he builds as
   the bento tiles the hero uses, from `lab.projects`. The three filler
   pills ("8+ years building.") and the "Bottom Line" rows are gone. */

const T = {
  en: {
    wordmark: "Ali Demirbaş",
    heroText: "I work where growth, lifecycle and product meet.",
    introPrefix: "Currently, I lead mobile growth at ",
    company: "Aksigorta",
    companyHref: "https://www.aksigorta.com.tr",
    introSuffix: ", focusing on acquisition, activation, engagement, and digital customer experiences.",
    outsideWork: "Outside my day-to-day work, I build practical tools, frameworks, and open-source projects around growth and lifecycle marketing.",
    exploreLabel: "Explore my work",
    exploreHref: "/lab",
    linkedinLabel: "Connect on LinkedIn",
    h2: "Over eight years bridging data and marketing into measurable growth.",
    basedIn: "Based in Istanbul",
    buildEyebrow: "Lab",
    buildTitle: "What I build outside the day job",
    buildIntro: "Open-source tools and small products around growth and lifecycle marketing. Each one started as a problem I kept running into.",
    footerEmailLabel: "Email",
    langLabel: "TR",
    langHref: "/tr/about",
  },
  tr: {
    wordmark: "Ali Demirbaş",
    heroText: "Growth, lifecycle ve ürünün kesiştiği yerdeyim.",
    introPrefix: "Şu anda ",
    company: "Aksigorta",
    companyHref: "https://www.aksigorta.com.tr",
    introSuffix: "'da mobil büyüme çalışmalarına liderlik ediyor; kullanıcı kazanımı, aktivasyon, etkileşim ve dijital müşteri deneyimi üzerine çalışıyorum.",
    outsideWork: "Bunun yanında growth ve lifecycle marketing alanlarında araçlar, framework'ler ve açık kaynak projeler geliştiriyorum.",
    exploreLabel: "Çalışmalarıma göz at",
    exploreHref: "/tr/lab",
    linkedinLabel: "LinkedIn'de bağlantı kur",
    h2: "Sekiz yıldır veriyi ve pazarlamayı ölçülebilir büyümeye bağlıyorum.",
    basedIn: "İstanbul'da",
    buildEyebrow: "Lab",
    buildTitle: "İş dışında ne yapıyorum",
    buildIntro: "Growth ve lifecycle marketing etrafında açık kaynak araçlar ve küçük ürünler. Her biri, tekrar tekrar karşılaştığım bir problemle başladı.",
    footerEmailLabel: "E-posta",
    langLabel: "EN",
    langHref: "/about",
  },
} as const;

type Row = { key: string; co: string; logo: string; role: string; period: string; desc: string };

export default function AboutPage({ lang }: { lang: Lang }) {
  const t = T[lang];
  const c = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const rows = c.about.timeline.flatMap((e): Row[] =>
    "roles" in e
      ? e.roles.map((r) => ({ key: `${e.co}-${r.role}`, co: e.co, logo: e.logo, role: r.role, period: r.period, desc: r.desc }))
      : [{ key: `${e.co}-${e.role}`, co: e.co, logo: e.logo, role: e.role, period: e.period, desc: e.desc }],
  );

  return (
    <>
      <SiteHeader t={c} anchorBase={home} langHref={t.langHref} />
      <main>
        {/* THE OPENING: person and words in one screen. */}
        <section className="bg-paper-soft py-20 md:py-28">
          <div className="altor-container">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16">
              <Reveal>
                <p className="altor-eyebrow text-ink-subtle">{c.nav.about}</p>
                <h1 className="mt-4 max-w-3xl text-h1 text-balance text-ink-950">{t.heroText}</h1>
                <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-pretty text-ink-muted">
                  {t.introPrefix}
                  <a href={t.companyHref} target="_blank" rel="noreferrer" className="font-medium text-ink-950 underline decoration-ink-300 underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:decoration-ink-950">
                    {t.company}
                  </a>
                  {t.introSuffix}
                </p>
                <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-pretty text-ink-muted">{t.outsideWork}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink href={t.exploreHref} variant="primary" size="md">
                    {t.exploreLabel}
                    <ArrowRight aria-hidden className="size-4" />
                  </ButtonLink>
                  <ButtonLink href="https://www.linkedin.com/in/ali-demirbas/" variant="outline" size="md">
                    {t.linkedinLabel}
                    <ArrowUpRight aria-hidden className="size-4" />
                  </ButtonLink>
                </div>
              </Reveal>
              <Reveal delay={100} className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[28px] bg-paper lg:max-w-none">
                <Image src="/portrait.jpg" alt="Ali Demirbaş" fill sizes="(min-width: 1024px) 26rem, 24rem" priority className="object-cover" />
                <p className="absolute bottom-5 left-5 flex items-center gap-1.5 rounded-full bg-paper/95 px-3.5 py-2 text-sm font-medium text-ink-950 ring-1 ring-ink-950/[0.06]">
                  <MapPin aria-hidden className="size-4 text-primary-600" />
                  {t.basedIn}
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* THE RECORD: the homepage bio's timeline, with each role's line. */}
        <section className="bg-paper py-20 md:py-28">
          <div className="altor-container">
            <SectionHeading eyebrow={c.about.experience} title={t.h2} />
            <Reveal delay={80} className="mt-12">
              <ol className="relative flex list-none flex-col p-0 [--bio-rail:0.375rem] md:[--bio-rail:11rem]">
                <span aria-hidden className="bio-rail absolute top-3 bottom-3 left-[var(--bio-rail)] w-px" />
                {rows.map((r, i) => (
                  <li
                    key={r.key}
                    className="bio-row relative grid grid-cols-[minmax(0,1fr)] gap-y-1.5 py-6 pl-8 md:grid-cols-[9.5rem_minmax(0,1fr)] md:gap-x-10 md:pl-0"
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <span
                      aria-hidden
                      className={`absolute top-[1.9rem] left-[calc(var(--bio-rail)-0.3125rem)] size-2.5 rounded-full ring-4 ring-paper ${i === 0 ? "bio-node-live bg-primary-600" : "bg-ink-300"}`}
                    />
                    <span className="text-sm whitespace-nowrap text-ink-subtle tabular-nums md:pt-1 md:text-right">{r.period}</span>
                    <div className="max-w-[60ch] min-w-0">
                      <Image src={r.logo} alt={r.co} width={140} height={28} className="h-7 w-auto max-w-[9rem] object-contain object-left" />
                      <h3 className="mt-2.5 text-h3 text-balance text-ink-950">{r.role}</h3>
                      <p className="mt-0.5 text-sm text-ink-muted">{r.co}</p>
                      <p className="mt-3 text-base leading-relaxed text-pretty text-ink-muted">{r.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* WHAT HE BUILDS: the six projects as the hero's tiles. */}
        <section className="bg-paper-soft py-20 md:py-28">
          <div className="altor-container">
            <SectionHeading eyebrow={t.buildEyebrow} title={t.buildTitle} intro={t.buildIntro} />
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {c.lab.projects.map((project, i) => {
                const accent = labAccent(project.slug);
                const [primary] = project.links;
                return (
                  <Reveal key={project.slug} delay={i * 60} className="flex">
                    <Link
                      href={primary.href}
                      className="group flex w-full flex-col rounded-[28px] bg-paper p-6 ring-1 ring-ink-950/[0.06] transition-shadow duration-[var(--duration-fast)] hover:shadow-[0_18px_40px_-24px_rgb(10_16_32/0.35)]"
                    >
                      <span aria-hidden className={`grid size-10 place-items-center rounded-xl ${accent.tile}`}>
                        <LabProjectIcon slug={project.slug} className="size-5" />
                      </span>
                      <p className="mt-4 text-lg font-semibold text-ink-950">{project.short}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-pretty text-ink-muted">{withJourneyCount(project.tagline)}</p>
                      <p className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-medium text-ink-950">
                        <span className="tabular-nums">{withJourneyCount(project.proof ?? "")}</span>
                        <ArrowRight aria-hidden className="size-4 text-ink-400 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5" />
                      </p>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
            <Reveal delay={420} className="mt-12">
              <ButtonLink href={c.nav.labHref} variant="outline" size="md">
                {c.home.labMore}
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            </Reveal>
          </div>
        </section>

        <FinalCta t={c} />
      </main>
      <SiteFooter t={c} lang={lang} />
    </>
  );
}
