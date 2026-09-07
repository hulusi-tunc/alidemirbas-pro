import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { AboutTimeline, type TimelineJob } from "@/components/ui/AboutTimeline";
import { Reveal } from "@/components/ui/Reveal";
import { copy, type Lang } from "@/lib/content";

/* About page — BROUGHT ONTO THE SITE (2026-08-31).

   This was a deliberate one-off: a user-supplied "Portfolio" mockup with
   its own fonts (Space Grotesk / IBM Plex Mono), its own teal-sage
   palette, its own bare wordmark header and a footer carrying no site
   navigation at all. It was reviewed as reading "yabancı gibi" - like a
   different site - and the missing header was called out by name.

   So the mockup's SKIN is gone and its SUBSTANCE is kept. The page now
   uses SiteHeader/SiteFooter/FinalCta, the site's own Geist and its
   paper/ink/primary tokens, and the section rhythm every other page
   uses (tinted stage -> white -> tinted -> white). What survives is
   what was real: the hero statement, the current-role paragraph with
   its live company link, the eight-years line, and the timeline with
   its Simple/Detailed toggle - whose dates, titles and companies match
   `content.ts`'s own `about.timeline`, this site's source of truth for
   those facts.

   `AboutTimeline` was retoned in the same pass: its hardcoded teal
   hexes are now the shared tokens, so it inherits future palette
   changes instead of drifting away from them again. */

const JOBS: Record<Lang, TimelineJob[]> = {
  en: [
    {
      dates: "2026–Present",
      title: "Mobile App Growth Lead",
      company: "Aksigorta",
      info: "Mobile app growth for one of Turkey's largest insurers — user acquisition, engagement, and an app-first growth strategy.",
      bottom: "Owning the app growth roadmap end-to-end. And we're just getting started...",
    },
    {
      dates: "2024–2026",
      title: "Growth Marketing Lead",
      company: "Vodafone",
      info: "Growth marketing across digital channels for one of the world's largest telecom brands.",
      bottom: "Data-driven acquisition and lifecycle programs working as one growth engine.",
    },
    {
      dates: "2023–2024",
      title: "Growth – CRM Analytics Executive",
      company: "Getir",
      info: "CRM analytics and growth initiatives for the pioneer of rapid commerce.",
      bottom: "Retention and LTV, optimized at rapid-commerce speed.",
    },
    {
      dates: "2021–2023",
      title: "Lifecycle Marketing",
      company: "Wingie Enuygun Group",
      info: "Lifecycle and CRM programs for a leading online travel platform.",
      bottom: "Owned lifecycle and CRM end-to-end across the group's travel brands.",
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
      info: "Türkiye'nin en büyük sigorta şirketlerinden biri için mobil uygulama büyümesi — kullanıcı kazanımı, etkileşim ve app-first bir büyüme stratejisi.",
      bottom: "Uçtan uca app growth roadmap'ini yönetiyorum. Ve daha yeni başlıyoruz...",
    },
    {
      dates: "2024–2026",
      title: "Büyüme Pazarlaması Lideri",
      company: "Vodafone",
      info: "Dünyanın en büyük telekom markalarından biri için dijital kanallarda büyüme pazarlaması.",
      bottom: "Veriye dayalı kullanıcı kazanımı ve lifecycle programları, tek bir growth motoru gibi çalışıyor.",
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
      bottom: "Grubun seyahat markaları genelinde lifecycle ve CRM'i uçtan uca yönettim.",
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
    subLines: ["8+ years building.", "Growth, lifecycle, and analytics.", "From startups to enterprises."],
    toggle: { simple: "Simple", detailed: "Detailed", at: "at", bottomLine: "Bottom Line" },
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
    subLines: ["8+ yıldır inşa ediyorum.", "Büyüme, lifecycle ve analitik.", "Startup'lardan kurumsala."],
    toggle: { simple: "Basit", detailed: "Detaylı", at: "@", bottomLine: "Özet" },
    footerEmailLabel: "E-posta",
    langLabel: "EN",
    langHref: "/about",
  },
} as const;

export default function AboutPage({ lang }: { lang: Lang }) {
  const t = T[lang];
  const c = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const jobs = JOBS[lang];

  return (
    <>
      <SiteHeader t={c} anchorBase={home} langHref={t.langHref} />
      <main>
        {/* THE OPENING. Portrait beside the statement, on the site's own
            tinted stage - the same shape the other pages open with, so
            arriving here from anywhere else is not a jump. */}
        <section className="bg-paper-soft pt-16 pb-16 md:pt-20 md:pb-20">
          <div className="altor-container">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:gap-16">
              <Reveal>
                <p className="altor-eyebrow text-ink-subtle">{c.nav.about}</p>
                <h1 className="mt-4 max-w-3xl text-h1 text-balance text-ink-950">
                  {t.heroText}
                </h1>
              </Reveal>
              <Reveal delay={100}>
                <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl bg-blue-600">
                  <Image
                    src="/portrait.jpg"
                    alt="Ali Demirbaş"
                    width={640}
                    height={800}
                    className="w-full object-cover opacity-95 grayscale"
                  />
                  <div aria-hidden className="absolute inset-0 bg-blue-600/20 mix-blend-multiply" />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Where he is now, and how to reach him. */}
        <section className="bg-paper py-16 md:py-20">
          <div className="altor-container">
            <Reveal>
              <div className="max-w-[62ch]">
                <p className="text-lg leading-relaxed text-pretty text-ink-700">
                  {t.introPrefix}
                  <a
                    href={t.companyHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline underline-offset-2 hover:text-blue-800"
                  >
                    {t.company}
                  </a>
                  {t.introSuffix}
                </p>
                <p className="mt-5 text-lg leading-relaxed text-pretty text-ink-700">{t.outsideWork}</p>
                {/* Real buttons, not underlined links - the site's rule since
                    the Lab review (2026-09-06). */}
                <div className="mt-7 flex flex-wrap gap-3">
                  <ButtonLink href={t.exploreHref} variant="primary" size="md">
                    {t.exploreLabel}
                    <ArrowRight aria-hidden className="size-4" />
                  </ButtonLink>
                  <ButtonLink href="https://www.linkedin.com/in/ali-demirbas/" variant="outline" size="md">
                    {t.linkedinLabel}
                    <ArrowUpRight aria-hidden className="size-4" />
                  </ButtonLink>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* The statement, and the three lines that qualify it. */}
        <section className="bg-paper-soft py-16 md:py-24">
          <div className="altor-container">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-16">
              <Reveal>
                <h2 className="max-w-[30ch] text-h2 text-balance text-ink-950">
                  {t.h2}
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <ul className="flex list-none flex-col gap-3 p-0 lg:pt-2">
                  {t.subLines.map((line) => (
                    <li
                      key={line}
                      className="rounded-xl bg-paper px-5 py-3.5 text-[17px] font-medium text-ink-900"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* The record. Real dates, titles and companies. */}
        <section className="bg-paper py-16 md:py-20">
          <div className="altor-container">
            <AboutTimeline jobs={jobs} labels={t.toggle} />
          </div>
        </section>

        <FinalCta t={c} />
      </main>
      <SiteFooter t={c} lang={lang} />
    </>
  );
}
