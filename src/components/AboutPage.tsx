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
    nowLabel: "Now",
    city: "Istanbul",
    languages: "Works in English and Turkish",
    years: "8+ years",
    yearsLine: "in digital marketing and growth",
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
    nowLabel: "Şu an",
    city: "İstanbul",
    languages: "İngilizce ve Türkçe çalışır",
    years: "8+ yıl",
    yearsLine: "dijital pazarlama ve growth",
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
  const logos = c.about.timeline.map((e) => ({ co: e.co, logo: e.logo }));
  const rows = c.about.timeline.flatMap((e): Row[] =>
    "roles" in e
      ? e.roles.map((r) => ({ key: `${e.co}-${r.role}`, co: e.co, logo: e.logo, role: r.role, period: r.period, desc: r.desc }))
      : [{ key: `${e.co}-${e.role}`, co: e.co, logo: e.logo, role: e.role, period: e.period, desc: e.desc }],
  );

  return (
    <>
      <SiteHeader t={c} anchorBase={home} langHref={t.langHref} />
      <main>
        {/* THE OPENING, the homepage's way (Hulusi, 2026-09-07: "on a small
            screen we have only a head photo - be smarter, like the home
            page"): the statement, the lead and the two actions centred, then
            a bento of the facts - the portrait as a tall tile (md and up only;
            on a phone the homepage and the closing band already show him),
            where he works now with the company's wordmark, where he is based
            and in which languages he works, the years with the companies he
            has worked for, and the dark tile with what he does outside the
            day job. Every fact from content.ts's timeline or this page's own
            copy; no filler pills. */}
        <section className="bg-paper-soft py-16 md:py-20">
          <div className="altor-container">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="altor-eyebrow text-ink-subtle">{c.nav.about}</p>
              <h1 className="mx-auto mt-4 max-w-4xl text-h1 text-balance text-ink-950">{t.heroText}</h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-ink-muted">
                {t.introPrefix}
                <a href={t.companyHref} target="_blank" rel="noreferrer" className="font-medium text-ink-950 underline decoration-ink-300 underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:decoration-ink-950">
                  {t.company}
                </a>
                {t.introSuffix}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
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

            <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Reveal delay={200} className="relative hidden overflow-hidden rounded-[28px] bg-paper md:row-span-2 md:block md:min-h-[26rem]">
                <Image src="/portrait.jpg" alt="Ali Demirbaş" fill sizes="(min-width: 1024px) 24rem, 50vw" priority className="object-cover" />
                <p className="absolute bottom-5 left-5 flex items-center gap-1.5 rounded-full bg-paper/95 px-3.5 py-2 text-sm font-medium text-ink-950 ring-1 ring-ink-950/[0.06]">
                  <MapPin aria-hidden className="size-4 text-primary-600" />
                  {t.basedIn}
                </p>
              </Reveal>

              {/* Now: the first timeline entry, its wordmark bare. */}
              <Reveal delay={260} className="flex">
                <div className="flex w-full flex-col rounded-[28px] bg-paper p-6 ring-1 ring-ink-950/[0.06]">
                  <p className="altor-eyebrow text-ink-subtle">{t.nowLabel}</p>
                  <Image src={rows[0].logo} alt={rows[0].co} width={140} height={28} className="mt-4 h-7 w-auto max-w-[9rem] object-contain object-left" />
                  <p className="mt-4 text-lg leading-snug font-semibold text-ink-950">{rows[0].role}</p>
                  <p className="mt-1 text-sm text-ink-muted">{rows[0].co}</p>
                  <p className="mt-auto pt-5 text-sm text-ink-subtle tabular-nums">{rows[0].period}</p>
                </div>
              </Reveal>

              {/* Where. */}
              <Reveal delay={320} className="flex">
                <div className="flex w-full flex-col rounded-[28px] bg-paper p-6 ring-1 ring-ink-950/[0.06]">
                  <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary-700">
                    <MapPin className="size-5" />
                  </span>
                  <p className="mt-4 text-lg leading-snug font-semibold text-ink-950">{t.city}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t.languages}</p>
                </div>
              </Reveal>

              {/* The years, and the companies they were spent at. */}
              <Reveal delay={380} className="flex">
                <div className="flex w-full flex-col rounded-[28px] bg-paper p-6 ring-1 ring-ink-950/[0.06]">
                  <p className="text-h2 text-ink-950 tabular-nums">{t.years}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t.yearsLine}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-6">
                    {logos.map((l) => (
                      <Image key={l.co} src={l.logo} alt={l.co} width={100} height={20} className="h-5 w-auto max-w-[6rem] object-contain opacity-80" />
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Outside the day job, on the night plate. */}
              <Reveal delay={440} className="flex">
                <div className="relative isolate flex w-full flex-col justify-between overflow-hidden rounded-[28px] bg-ink-950 p-6 text-white">
                  <Image src="/lab/frames/google-ads-change-history-dashboard.jpg" alt="" aria-hidden fill sizes="(min-width: 1024px) 24rem, 50vw" className="-z-20 origin-bottom scale-[1.15] object-cover object-bottom" />
                  <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/85 via-ink-950/45 to-ink-950/30" />
                  <p className="text-lg leading-snug font-semibold text-balance">{t.outsideWork}</p>
                  <Link href={t.exploreHref} className="mt-6 flex w-fit items-center gap-1.5 text-sm font-medium text-white/80 transition-colors duration-[var(--duration-fast)] hover:text-white">
                    {t.exploreLabel}
                    <ArrowRight aria-hidden className="size-4" />
                  </Link>
                </div>
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
