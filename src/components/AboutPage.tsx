import Image from "next/image";
import Link from "next/link";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

import { AboutTimeline, type TimelineJob } from "@/components/ui/AboutTimeline";
import type { Lang } from "@/lib/content";

/* About page — converted from a user-supplied "Portfolio" mockup
   (Space Grotesk / IBM Plex Mono, teal-sage palette, vertical timeline
   with a Simple/Detailed toggle). This is a DELIBERATE one-off: unlike
   every other page on this site (Contact/Stack/Blog/Lab/Calculators/
   404/Home), it does NOT use the shared Portrait system
   (SiteHeader/SiteFooter/PortraitContainer/Section/ink-950 tokens) or
   Geist — the mockup specifies its own colors/fonts, and reproducing
   them exactly means not forcing them through the other pages' tokens.
   Nothing here touches globals.css, Site.tsx or any other shared
   primitive; every other page keeps its exact current look.

   FONTS: loaded here via next/font/google, scoped to this page's own
   wrapper (`spaceGrotesk.variable`/`plexMono.variable` classNames) —
   not applied at the root layout, so Geist and every other page are
   unaffected.

   CONTENT: the hero copy, the "8+ years building..." line and each
   job's `info`/`bottom` text are the mockup's own copy, used as given.
   The FACTS underneath (dates, titles, companies) are real - matched
   against `content.ts`'s own `about.timeline` (kept as this site's
   source of truth for the raw facts; not imported here since this
   page's copy is phrased differently by design) - the mockup's own
   year-only date ranges are a deliberate simplification of the more
   precise month-level periods `content.ts` carries. TR copy below is a
   direct translation of the same EN copy (not separately invented),
   using this site's own already-established TR job titles
   (`content.ts`'s `about.timeline` TR entries) so the two languages
   describe the same real roles consistently.

   NAV: the mockup's own header is a bare, unlinked wordmark and its
   footer carries no site navigation or language switch at all. Wiring
   the wordmark to home and adding a small EN/TR link is the one
   necessary addition beyond the mockup itself - without it this page
   would be a dead end with no way back into the rest of the site or to
   its own translation, which no other page on this site does. */

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-plex",
});

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
    heroPrefix: "I drive ",
    heroCode: "growth()",
    heroSuffix: " with data, build lifecycle programs that retain, and turn marketing into measurable outcomes.",
    introPrefix: "Currently, I'm Mobile App Growth Lead at ",
    company: "Aksigorta",
    companyHref: "https://www.aksigorta.com.tr",
    introSuffix: ", driving user acquisition and engagement for one of Turkey's largest insurers.",
    contact: (
      <>
        <a href="mailto:mehmetalidemirbas@gmail.com">Email me</a>, or shout over on{" "}
        <a href="https://www.linkedin.com/in/ali-demirbas/" target="_blank" rel="noreferrer">LinkedIn</a>.
      </>
    ),
    h2: "Over eight years bridging data and marketing into measurable growth.",
    subLines: ["8+ years building.", "Growth, lifecycle, and analytics.", "From startups to enterprises."],
    toggle: { simple: "Simple", detailed: "Detailed", at: "at", bottomLine: "Bottom Line" },
    footerEmailLabel: "Email",
    langLabel: "TR",
    langHref: "/tr/about",
  },
  tr: {
    wordmark: "Ali Demirbaş",
    heroPrefix: "Veriyle ",
    heroCode: "growth()",
    heroSuffix: " sağlıyor, elde tutan lifecycle programları kuruyor ve pazarlamayı ölçülebilir sonuçlara dönüştürüyorum.",
    introPrefix: "Şu anda, Türkiye'nin en büyük sigorta şirketlerinden birinde ",
    company: "Aksigorta",
    companyHref: "https://www.aksigorta.com.tr",
    introSuffix: "'da Mobil Uygulama Büyüme Lideri olarak kullanıcı kazanımını ve etkileşimi yönetiyorum.",
    contact: (
      <>
        <a href="mailto:mehmetalidemirbas@gmail.com">Bana e-posta at</a>, ya da{" "}
        <a href="https://www.linkedin.com/in/ali-demirbas/" target="_blank" rel="noreferrer">LinkedIn</a>&apos;de bul beni.
      </>
    ),
    h2: "Sekiz yılı aşkın süredir veriyi ve pazarlamayı ölçülebilir büyümeye bağlıyorum.",
    subLines: ["8+ yıldır inşa ediyorum.", "Büyüme, lifecycle ve analitik.", "Startup'lardan kurumsala."],
    toggle: { simple: "Basit", detailed: "Detaylı", at: "@", bottomLine: "Özet" },
    footerEmailLabel: "E-posta",
    langLabel: "EN",
    langHref: "/about",
  },
} as const;

export default function AboutPage({ lang }: { lang: Lang }) {
  const t = T[lang];
  const home = lang === "en" ? "/" : "/tr";
  const jobs = JOBS[lang];
  const year = new Date().getFullYear();

  return (
    <div
      className={`about-portfolio ${spaceGrotesk.variable} ${plexMono.variable} min-h-screen [font-family:var(--font-space-grotesk)] antialiased`}
      style={{ background: "#dcedee", color: "#22333a" }}
    >
      {/* Scoped to this page only — the mockup's own link/selection
          styling (see this file's own top comment on why this page
          doesn't share the rest of the site's tokens). */}
      <style>{`
        .about-portfolio a { color: #22333a; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: #7c9296; }
        .about-portfolio a:hover { text-decoration-color: #22333a; }
        .about-portfolio ::selection { background: #22333a; color: #dcedee; }
      `}</style>
      <a
        href="#about-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      <header className="flex items-center justify-center gap-3 px-8 pt-9">
        <Link
          href={home}
          className="rounded-xl px-6 py-3 text-xl font-bold tracking-tight no-underline"
          style={{ background: "#e7f3f4", boxShadow: "0 2px 10px rgba(34,51,58,0.06)" }}
        >
          {t.wordmark}
        </Link>
        <Link
          href={t.langHref}
          className="rounded-xl px-3 py-3 text-sm font-medium no-underline"
          style={{ background: "#e7f3f4", boxShadow: "0 2px 10px rgba(34,51,58,0.06)" }}
        >
          {t.langLabel}
        </Link>
      </header>

      <section className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-6 pt-12 sm:px-10 md:grid-cols-[minmax(0,1.1fr)_minmax(240px,0.9fr)] md:gap-12 md:pt-16">
        <h1 className="text-balance text-[clamp(2rem,5.2vw,4.5rem)] leading-[1.12] font-bold tracking-tight">
          {t.heroPrefix}
          <code className="font-normal [font-family:var(--font-mono-plex)]">{t.heroCode}</code>
          {t.heroSuffix}
        </h1>
        <Image
          src="/portrait.jpg"
          alt="Ali Demirbaş"
          width={640}
          height={800}
          className="w-full contrast-[1.02] grayscale mix-blend-multiply"
        />
      </section>

      <main id="about-main" className="mx-auto max-w-[1280px] px-6 sm:px-10">
        <section className="max-w-[620px] pt-16 md:ml-[44%] md:pt-18">
          <p className="m-0 text-lg leading-relaxed sm:text-xl">
            {t.introPrefix}
            <a href={t.companyHref} target="_blank" rel="noreferrer">{t.company}</a>
            {t.introSuffix}
          </p>
          <p className="mt-6 text-lg leading-relaxed sm:text-xl">{t.contact}</p>
        </section>

        <section className="pt-20 md:pt-28">
          <h2 className="max-w-[22ch] text-[clamp(1.75rem,4.2vw,3.5rem)] leading-[1.18] font-bold tracking-tight">
            {t.h2}
          </h2>
        </section>

        <section className="pt-16 pb-8 md:pt-24">
          <div className="max-w-[620px] md:ml-[44%]">
            <p className="text-xl leading-relaxed font-medium sm:text-2xl">
              {t.subLines.map((line, i) => (
                <span key={line}>
                  {line}
                  {i < t.subLines.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
          <AboutTimeline jobs={jobs} labels={t.toggle} />
        </section>
      </main>

      <footer
        className="mx-auto flex max-w-[1280px] flex-wrap items-baseline justify-between gap-4 px-6 py-8 sm:px-10"
        style={{ borderTop: "2px solid #b9d4d6" }}
      >
        <p className="m-0 text-sm" style={{ color: "#45585c" }}>
          © {year} {t.wordmark} 👋
        </p>
        <div className="flex gap-6 text-sm">
          <a href="mailto:mehmetalidemirbas@gmail.com">{t.footerEmailLabel}</a>
          <a href="https://www.linkedin.com/in/ali-demirbas/" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
}
