import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { AboutTimeline, type TimelineJob } from "@/components/ui/AboutTimeline";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { withJourneyCount } from "@/lib/archive";
import { copy, type Lang } from "@/lib/content";

/* About page — EDITORIAL REDESIGN (2026-09-05) to a supplied external
   reference ("Executive Growth Editorial": Swiss/neo-grotesque discipline,
   asymmetric 8/4 and 3/9 splits, hairline rules instead of shadows, and a
   cobalt accent spent only on focal points).

   NOT a page-scoped palette exception, unlike the three Lab reskins this
   session. That distinction is deliberate: /about is a core site page, and
   the reference's palette is already this site's palette in all but name -
   white canvas, a near-black warm ink, hairline rules, one blue accent. So
   every colour here is a site token (`paper`/`paper-soft`, the `ink` ramp,
   `line`, `primary`), and a future token change moves this page with the
   rest of the site instead of stranding it.

   ONE THING FROM THE REFERENCE IS REFUSED ON GUARDRAIL GROUNDS, not taste:
   its `label-caps` treatment (11px, uppercase, +0.08em tracking) is the
   uppercase mono eyebrow the brand guideline explicitly RETIRED sitewide -
   `.altor-eyebrow` in globals.css forces `text-transform: none` and even
   overrides `.uppercase` on its own call sites so the retirement is total.
   Eyebrows here are therefore sentence case in `.altor-eyebrow`. Mono is
   still used where the guideline still uses it: dates, counts, meta rails.

   AND FOUR THINGS ARE REFUSED AS FABRICATION - every one an unverifiable
   claim, not a style choice:

   - "10M+ Push & In-App Users" in the hero stat strip. No number like it
     exists anywhere in this repository. The strip ships with two stats
     instead of three: "8+ years", which is `about`'s own copy, and the
     Lab tool count, which is COMPUTED from `copy[lang].lab.projects`.
   - "Available for strategic advisory" / "Open to Advisory & Speaking" /
     "Response latency: < 24h" - three claims about availability and
     responsiveness that nothing here states. Dropped. (The closing band
     is the shared `FinalCta`, which already says what is true: the inbox
     is open.)
   - "Portrait // 2026 Archive" and the "Aksigorta HQ" location pill under
     the portrait. Neither the shot's date nor where it was taken is
     recorded anywhere. The caption keeps the name and the current role,
     both real.
   - The three pillar cards' invented prose ("navigating hypergrowth
     velocity at Getir...", etc.). Their HEADINGS are real - `about`'s own
     three sub-lines - so the supporting line under each is DERIVED from
     the timeline on this same page instead: the span and company count
     are computed from `JOBS`, the company list is `JOBS` itself, and the
     disciplines are the ones named in the role titles below.

   "Based in Istanbul" IS kept: `copy[lang].footer.right` already carries
   it, as does `contact`'s own "Based in" row.

   SiteHeader / SiteFooter / FinalCta untouched. */

const JOBS: Record<Lang, TimelineJob[]> = {
  en: [
    {
      dates: "2026–Present",
      title: "Mobile App Growth Lead",
      company: "Aksigorta",
      info: "Mobile app growth for one of Turkey's largest insurers: user acquisition, engagement, and an app-first growth strategy.",
      bottom: "Owning the whole app growth roadmap. Still early days.",
    },
    {
      dates: "2024–2026",
      title: "Growth Marketing Lead",
      company: "Vodafone",
      info: "Growth marketing across digital channels for one of the world's largest telecom brands.",
      bottom: "Acquisition and lifecycle programs run together, not as separate tracks.",
    },
    {
      dates: "2023–2024",
      title: "Growth – CRM Analytics Executive",
      company: "Getir",
      info: "CRM analytics and growth initiatives for the pioneer of rapid commerce.",
      bottom: "Retention and LTV work, at rapid-commerce pace.",
    },
    {
      dates: "2021–2023",
      title: "Lifecycle Marketing",
      company: "Wingie Enuygun Group",
      info: "Lifecycle and CRM programs for a leading online travel platform.",
      bottom: "Ran lifecycle and CRM across the group's travel brands.",
      subs: [
        { dates: "2023", title: "Experienced Lifecycle Marketing Specialist (Growth)" },
        { dates: "2021–2023", title: "Lifecycle Marketing Specialist (Growth)" },
      ],
    },
    {
      dates: "2020–2021",
      title: "Digital Marketing Specialist",
      company: "Albayrak Grubu",
      info: "Digital marketing campaigns across group companies.",
    },
    {
      dates: "2019–2020",
      title: "Jr. Digital Marketing Specialist",
      company: "Doğuş Oto",
      info: "Digital marketing execution for one of Turkey's leading automotive dealer groups.",
    },
  ],
  tr: [
    {
      dates: "2026–Günümüz",
      title: "Mobil Uygulama Büyüme Lideri",
      company: "Aksigorta",
      info: "Türkiye'nin en büyük sigorta şirketlerinden biri için mobil uygulama büyümesi: kullanıcı kazanımı, etkileşim ve app-first bir büyüme stratejisi.",
      bottom: "App growth roadmap'inin tamamını yönetiyorum. Henüz yolun başındayız.",
    },
    {
      dates: "2024–2026",
      title: "Büyüme Pazarlaması Lideri",
      company: "Vodafone",
      info: "Dünyanın en büyük telekom markalarından biri için dijital kanallarda büyüme pazarlaması.",
      bottom: "Kullanıcı kazanımı ve lifecycle programlarını ayrı kollar olarak değil, birlikte yürüttüm.",
    },
    {
      dates: "2023–2024",
      title: "Büyüme – CRM Analitiği Uzmanı",
      company: "Getir",
      info: "Hızlı ticaretin öncüsü için CRM analitiği ve büyüme girişimleri.",
      bottom: "Hızlı ticaret temposunda elde tutma ve LTV optimizasyonu.",
    },
    {
      dates: "2021–2023",
      title: "Yaşam Döngüsü Pazarlama",
      company: "Wingie Enuygun Group",
      info: "Önde gelen bir çevrimiçi seyahat platformu için lifecycle ve CRM programları.",
      bottom: "Grubun seyahat markalarında lifecycle ve CRM'in tamamını yönettim.",
      subs: [
        { dates: "2023", title: "Kıdemli Yaşam Döngüsü Pazarlama Uzmanı (Büyüme)" },
        { dates: "2021–2023", title: "Yaşam Döngüsü Pazarlama Uzmanı (Büyüme)" },
      ],
    },
    {
      dates: "2020–2021",
      title: "Dijital Pazarlama Uzmanı",
      company: "Albayrak Grubu",
      info: "Grup şirketleri genelinde dijital pazarlama kampanyaları.",
    },
    {
      dates: "2019–2020",
      title: "Jr. Dijital Pazarlama Uzmanı",
      company: "Doğuş Oto",
      info: "Türkiye'nin önde gelen otomotiv bayi gruplarından biri için dijital pazarlama uygulamaları.",
    },
  ],
};

const T = {
  en: {
    wordmark: "Ali Demirbaş",
    heroText: "I work where growth, lifecycle, and product meet, turning data into better customer experiences.",
    introPrefix: "Currently, I lead mobile growth at ",
    company: "Aksigorta",
    companyHref: "https://www.aksigorta.com.tr",
    introSuffix: ", focusing on acquisition, activation, engagement, and digital customer experiences.",
    outsideWork: "Outside my day-to-day work, I build practical tools, frameworks, and open-source projects around growth and lifecycle marketing.",
    exploreLabel: "Browse the Lab",
    exploreHref: "/lab",
    linkedinLabel: "Connect on LinkedIn",
    h2: "Eight years bridging data and marketing into measurable growth.",
    subLines: ["8+ years building.", "Growth, lifecycle, and analytics.", "Startups and large enterprises."],
    toggle: { simple: "Simple", detailed: "Detailed", at: "at", bottomLine: "Bottom Line", active: "Active" },
    footerEmailLabel: "Email",
    langLabel: "TR",
    langHref: "/tr/about",

    /* --- Redesign copy. Labels and section names only: every fact on
       this page still comes from `JOBS`, `copy[lang].lab.projects` or the
       lines above. --- */
    heroEyebrow: "Profile",
    statYears: "8+",
    statYearsLabel: "Years in the field",
    statToolsLabel: "Open-source tools built",
    portraitRoleFallback: "Mobile App Growth Lead",
    foundationsEyebrow: "Foundations",
    pillarLabels: ["01 · Duration", "02 · Discipline", "03 · Scale"],
    /* Card 2's list. Not free prose - each item is the discipline named
       in one of the role titles in the timeline below. */
    disciplines: ["Growth", "Lifecycle marketing", "CRM analytics", "Digital marketing"],
    spanLabel: "Span",
    companiesLabel: "Companies",
    present: "present",
    recordEyebrow: "Track record",
    recordTitle: "Experience, by role",
    labEyebrow: "Engineering and tooling",
    labTitle: "Open-source systems and calculators",
    labViewAll: "See everything in the Lab",
  },
  tr: {
    wordmark: "Ali Demirbaş",
    heroText: "Growth, lifecycle ve ürünün kesiştiği yerde çalışıyorum; veriyi daha iyi müşteri deneyimine çeviriyorum.",
    introPrefix: "Şu anda ",
    company: "Aksigorta",
    companyHref: "https://www.aksigorta.com.tr",
    introSuffix: "'da mobil büyümeyi yönetiyorum; odağım kullanıcı kazanımı, aktivasyon, etkileşim ve dijital müşteri deneyimi.",
    outsideWork: "Bunun yanında growth ve lifecycle marketing alanlarında araçlar, framework'ler ve açık kaynak projeler geliştiriyorum.",
    exploreLabel: "Lab'e göz at",
    exploreHref: "/tr/lab",
    linkedinLabel: "LinkedIn'de bağlantı kur",
    h2: "Sekiz yıldır veriyi ve pazarlamayı ölçülebilir büyümeye bağlıyorum.",
    subLines: ["8+ yıldır inşa ediyorum.", "Büyüme, lifecycle ve analitik.", "Startup'lar ve büyük kurumlar."],
    toggle: { simple: "Basit", detailed: "Detaylı", at: "@", bottomLine: "Özet", active: "Aktif" },
    footerEmailLabel: "E-posta",
    langLabel: "EN",
    langHref: "/about",

    heroEyebrow: "Profil",
    statYears: "8+",
    statYearsLabel: "Yıl deneyim",
    statToolsLabel: "Açık kaynak araç",
    portraitRoleFallback: "Mobil Uygulama Büyüme Lideri",
    foundationsEyebrow: "Temeller",
    pillarLabels: ["01 · Süre", "02 · Disiplin", "03 · Ölçek"],
    disciplines: ["Büyüme", "Lifecycle pazarlama", "CRM analitiği", "Dijital pazarlama"],
    spanLabel: "Aralık",
    companiesLabel: "Şirket",
    present: "günümüz",
    recordEyebrow: "Kariyer",
    recordTitle: "Deneyim, rol bazında",
    labEyebrow: "Mühendislik ve araçlar",
    labTitle: "Açık kaynak sistemler ve hesaplayıcılar",
    labViewAll: "Lab'in tamamına göz at",
  },
} as const;

/** Section eyebrow + title, on the reference's one editorial pattern. */
function SectionHead({ eyebrow, title, className }: { eyebrow: string; title: string; className?: string }) {
  return (
    <div className={className}>
      <p className="altor-eyebrow text-ink-500">{eyebrow}</p>
      <h2 className="mt-1.5 max-w-2xl text-[clamp(1.625rem,1.2rem+1.7vw,2.5rem)] leading-[1.15] font-semibold tracking-[-0.025em] text-balance text-ink-950">
        {title}
      </h2>
    </div>
  );
}

/** A hairline meta row inside a pillar card: label left, value right. */
function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-line pt-2.5">
      <span className="font-mono text-[11px] text-ink-400">{label}</span>
      <span className="text-right font-mono text-[12px] text-ink-700 tabular-nums">{value}</span>
    </div>
  );
}

export default function AboutPage({ lang }: { lang: Lang }) {
  const t = T[lang];
  const c = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const jobs = JOBS[lang];
  const projects = c.lab.projects;

  /* DERIVED, NOT AUTHORED. The pillar cards and the stat strip read these
     off the same two arrays the rest of the page renders, so they cannot
     drift from the timeline or the Lab catalogue. */
  const firstYear = jobs[jobs.length - 1].dates.split(/[–—-]/)[0].trim();
  const companies = jobs.map((j) => j.company).filter((name): name is string => Boolean(name));
  const currentRole = jobs[0];

  return (
    <>
      <SiteHeader t={c} anchorBase={home} langHref={t.langHref} />
      <main>
        {/* A thin context rail under the header. Page name and location -
            both real; the reference's availability pill is not here. */}
        <div className="border-b border-line bg-paper-soft">
          <div className="altor-container flex items-center justify-between gap-4 py-2.5">
            <span className="font-mono text-[12px] font-medium text-ink-900">{c.nav.about}</span>
            <span className="font-mono text-[12px] text-ink-400">{c.footer.right}</span>
          </div>
        </div>

        {/* THE OPENING. 8/4 asymmetric split: the statement and the way in
            on the left, the portrait plate on the right. */}
        <section className="bg-paper py-14 md:py-20 lg:py-24">
          <div className="altor-container">
            <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-7 xl:col-span-8">
                <Reveal>
                  <p className="altor-eyebrow text-ink-500">{t.heroEyebrow}</p>
                  <h1 className="mt-2.5 max-w-3xl text-[clamp(2.125rem,1.35rem+3.1vw,3.5rem)] leading-[1.08] font-bold tracking-[-0.035em] text-balance text-ink-950">
                    {t.heroText}
                  </h1>
                </Reveal>
                <Reveal delay={80} className="mt-7 max-w-xl">
                  <p className="text-[18px] leading-[1.6] text-pretty text-ink-600">
                    {t.introPrefix}
                    <a
                      href={t.companyHref}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-ink-950 underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-primary-600"
                    >
                      {t.company}
                    </a>
                    {t.introSuffix}
                  </p>
                  <p className="mt-4 text-[15px] leading-[1.6] text-pretty text-ink-600">{t.outsideWork}</p>
                </Reveal>
                <Reveal delay={120} className="mt-7 flex flex-wrap items-center gap-3">
                  {/* `ink`, not `primary`: the reference's primary action is
                      a deep near-black fill with blue kept for accents, and
                      `ink` is exactly that variant already in the shared
                      Button - no restyle of the component needed. */}
                  <ButtonLink href={t.exploreHref} variant="ink" size="sm">
                    {t.exploreLabel}
                    <ArrowRight aria-hidden className="size-4" />
                  </ButtonLink>
                  <ButtonLink href="https://www.linkedin.com/in/ali-demirbas/" variant="outline" size="sm">
                    {t.linkedinLabel}
                    <ArrowUpRight aria-hidden className="size-4" />
                  </ButtonLink>
                </Reveal>
                {/* Two stats, not the reference's three - see the file
                    header for the one that was dropped and why. */}
                <Reveal delay={160} className="mt-8 grid max-w-md grid-cols-2 gap-3">
                  <div className="rounded-lg border border-line-strong bg-primary-50 px-4 py-3.5">
                    <span className="block text-[26px] leading-none font-bold tracking-[-0.02em] text-primary-700 tabular-nums">
                      {t.statYears}
                    </span>
                    <span className="mt-1.5 block font-mono text-[12px] text-ink-600">{t.statYearsLabel}</span>
                  </div>
                  <div className="rounded-lg border border-line-strong bg-paper-soft px-4 py-3.5">
                    <span className="block text-[26px] leading-none font-bold tracking-[-0.02em] text-ink-950 tabular-nums">
                      {projects.length}
                    </span>
                    <span className="mt-1.5 block font-mono text-[12px] text-ink-600">{t.statToolsLabel}</span>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={100} className="lg:col-span-5 xl:col-span-4">
                <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-lg border border-line-strong bg-paper-soft lg:ml-auto lg:mr-0">
                  <Image
                    src="/portrait.jpg"
                    alt="Ali Demirbaş"
                    width={640}
                    height={800}
                    className="aspect-[4/5] w-full object-cover grayscale contrast-[1.08]"
                  />
                  {/* Caption: the name and the role he actually holds,
                      read off the first timeline row. */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 via-ink-950/45 to-transparent px-4 pt-10 pb-4">
                    <span className="block text-[19px] leading-tight font-bold tracking-[-0.015em] text-white">
                      Ali Demirbaş
                    </span>
                    <span className="mt-0.5 block font-mono text-[12px] text-white/75">
                      {currentRole.title} {t.toggle.at} {currentRole.company}
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* CORE FOUNDATIONS. The three headings are `about`'s own
            sub-lines; everything under them is derived from the timeline
            further down, not written fresh. */}
        <section className="border-y border-line bg-paper-soft py-16 md:py-24">
          <div className="altor-container">
            <Reveal>
              <SectionHead eyebrow={t.foundationsEyebrow} title={t.h2} />
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {t.subLines.map((line, i) => (
                <Reveal key={line} delay={80 + i * 60}>
                  <div className="flex h-full flex-col rounded-lg border border-line-strong bg-paper p-6">
                    <span className="self-start rounded bg-primary-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary-700">
                      {t.pillarLabels[i]}
                    </span>
                    <h3 className="mt-4 text-[19px] leading-snug font-semibold tracking-[-0.015em] text-ink-950">
                      {line}
                    </h3>
                    <div className="mt-auto flex flex-col gap-2.5 pt-5">
                      {i === 0 && (
                        <>
                          <MetaRow label={t.spanLabel} value={`${firstYear}–${t.present}`} />
                          <MetaRow label={t.companiesLabel} value={String(companies.length)} />
                        </>
                      )}
                      {i === 1 && (
                        <ul className="flex list-none flex-wrap gap-1.5 border-t border-line p-0 pt-3.5">
                          {t.disciplines.map((d) => (
                            <li key={d} className="rounded bg-paper-soft px-2 py-1 font-mono text-[11px] text-ink-600">
                              {d}
                            </li>
                          ))}
                        </ul>
                      )}
                      {i === 2 && (
                        <ul className="flex list-none flex-wrap gap-1.5 border-t border-line p-0 pt-3.5">
                          {companies.map((name) => (
                            <li key={name} className="rounded bg-paper-soft px-2 py-1 font-mono text-[11px] text-ink-600">
                              {name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* THE RECORD. Real dates, titles and companies. */}
        <section className="bg-paper py-16 md:py-24">
          <div className="altor-container">
            <AboutTimeline jobs={jobs} labels={t.toggle} eyebrow={t.recordEyebrow} title={t.recordTitle} />
          </div>
        </section>

        {/* ENGINEERING & TOOLING. The Lab catalogue itself - names, blurbs,
            proofs and destinations all straight out of content.ts, with
            `withJourneyCount` filling the live {count} tokens exactly as
            the Lab hub does. No invented tags or per-card labels. */}
        <section className="border-y border-line bg-paper-soft py-16 md:py-24">
          <div className="altor-container">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <Reveal>
                <SectionHead eyebrow={t.labEyebrow} title={t.labTitle} />
              </Reveal>
              <Reveal delay={60}>
                <a
                  href={c.nav.labHref}
                  className="inline-flex items-center gap-1.5 font-mono text-[12px] font-medium text-primary-700 underline decoration-primary-200 underline-offset-4 transition-colors hover:decoration-primary-600"
                >
                  {t.labViewAll}
                  <ArrowRight aria-hidden className="size-3.5" />
                </a>
              </Reveal>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => {
                const href = p.links[0].href;
                const external = href.startsWith("http");
                return (
                  <Reveal key={p.slug} delay={80 + i * 50}>
                    <a
                      href={href}
                      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="group flex h-full flex-col justify-between rounded-lg border border-line-strong bg-paper p-6 transition-colors hover:border-primary-600"
                    >
                      <div>
                        <h3 className="text-[19px] leading-snug font-semibold tracking-[-0.015em] text-ink-950 transition-colors group-hover:text-primary-700">
                          {p.name}
                        </h3>
                        <p className="mt-2 text-[14px] leading-relaxed text-ink-600">{withJourneyCount(p.desc)}</p>
                      </div>
                      <div className="mt-5 flex items-baseline justify-between gap-3 border-t border-line pt-3.5">
                        {p.proof ? (
                          <span className="font-mono text-[11px] text-ink-500 tabular-nums">
                            {withJourneyCount(p.proof)}
                          </span>
                        ) : (
                          <span />
                        )}
                        <span
                          aria-hidden
                          className="font-mono text-[12px] font-semibold text-primary-700 transition-transform group-hover:translate-x-0.5"
                        >
                          {external ? "↗" : "→"}
                        </span>
                      </div>
                    </a>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <FinalCta t={c} />
      </main>
      <SiteFooter t={c} lang={lang} />
    </>
  );
}
