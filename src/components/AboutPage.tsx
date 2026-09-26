import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin, Target } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Section";
import { ExperienceSpiral } from "@/components/ui/ExperienceSpiral";
import { getAllBlogPosts } from "@/lib/blog";
import { CATEGORY_TAB_LABEL } from "@/lib/blog-category-labels";
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
   pills ("8+ years building.") and the "Bottom Line" rows are gone.

   2026-09-12 COPY PASS: the four homepage service tiles and the toolkit
   band (StackShowcase) were removed from this page, and the six projects
   are now a plain name + one-line list rather than bento tiles. The page
   reads hero -> How I work -> the record -> my own projects -> contact
   (plus the EN-only writing band, which the Turkish page skips because
   there are no Turkish posts). */

const T = {
  en: {
    wordmark: "Ali Demirbaş",
    heroText: "I started in digital marketing. Today I work on mobile product growth.",
    introPrefix: "Currently, at ",
    company: "Aksigorta",
    companyHref: "https://www.aksigorta.com.tr",
    introSuffix: ", I'm responsible for mobile app growth. Before that, I worked across growth, CRM and lifecycle at Vodafone, Getir and Wingie Enuygun Group.",
    outsideWork: "Outside the day job, I turn recurring problems into open-source tools.",
    exploreLabel: "Explore projects",
    exploreHref: "/lab",
    linkedinLabel: "Connect on LinkedIn",
    h2: "The places that shaped how I work.",
    basedIn: "Istanbul",
    nowLabel: "Currently",
    nowRole: "Mobile Growth Lead",
    nowPeriod: "Apr 2026 – Present",
    focusTitle: "Focus areas",
    focusItems: ["User acquisition", "CRM & lifecycle", "Analytics & experimentation"],
    experienceTitle: "Growth across different industries",
    experienceLine: "Insurance, telecom, travel, media and automotive.",
    howEyebrow: "A short history",
    howTitle: "From campaigns to the full customer journey.",
    howLead: "I began by running digital campaigns. Over time, the questions moved further into the product: who arrived, what they did next, where they got stuck and what brought them back. That path took me through user acquisition, CRM analytics and lifecycle before my current role in mobile app growth.",
    howBody: "It also changed how I work. I no longer see acquisition, product behavior and CRM as separate disciplines. I start with a reliable measurement baseline, test the smallest useful version of an idea and build on it only when the result holds up.",
    writingEyebrow: "Blog",
    writingTitle: "Writing",
    writingIntro: "Writing on growth, CRM, experimentation, and measurement.",
    allPosts: "View all posts",
    buildEyebrow: "Lab",
    buildTitle: "Things I build",
    buildIntro: "Most of these started as a note to myself about a problem I had seen more than once. I turned the useful ones into tools other people can inspect and use.",
    allProjects: "Explore all projects",
    footerEmailLabel: "Email",
    langLabel: "TR",
    langHref: "/tr/about",
  },
  tr: {
    wordmark: "Ali Demirbaş",
    heroText: "Dijital pazarlamayla başladım. Bugün mobil ürün büyümesi üzerine çalışıyorum.",
    introPrefix: "Şu anda ",
    company: "Aksigorta",
    companyHref: "https://www.aksigorta.com.tr",
    introSuffix: "'da mobil uygulamanın büyümesinden sorumluyum. Öncesinde Vodafone, Getir ve Wingie Enuygun Group'ta growth, CRM ve lifecycle tarafında çalıştım.",
    outsideWork: "İş dışında, tekrar eden problemleri açık kaynak araçlara dönüştürüyorum.",
    exploreLabel: "Projeleri incele",
    exploreHref: "/tr/lab",
    linkedinLabel: "LinkedIn'de bağlantı kur",
    h2: "Çalışma biçimimi şekillendiren yerler.",
    basedIn: "İstanbul",
    nowLabel: "Şu an",
    nowRole: "Mobil Büyüme Lideri",
    nowPeriod: "Nis 2026 – Günümüz",
    focusTitle: "Odak alanlarım",
    focusItems: ["Kullanıcı kazanımı", "CRM ve lifecycle", "Analitik ve deneyler"],
    experienceTitle: "Farklı sektörlerde büyüme",
    experienceLine: "Sigorta, telekom, seyahat, medya ve otomotiv.",
    howEyebrow: "Kısa hikâye",
    howTitle: "Kampanyalardan bütün müşteri yolculuğuna.",
    howLead: "Dijital kampanyalar yürüterek başladım. Zamanla sorular ürünün içine doğru ilerledi: Kim geldi, sonra ne yaptı, nerede zorlandı ve onu ne geri getirdi? Bu çizgi beni kullanıcı kazanımı, CRM analitiği ve lifecycle rollerinden bugünkü mobil uygulama büyümesi sorumluluğuna taşıdı.",
    howBody: "Bu süreç çalışma biçimimi de değiştirdi. Kullanıcı kazanımı, ürün davranışı ve CRM'i artık ayrı uzmanlıklar olarak görmüyorum. Önce güvenilir bir ölçüm temeli kuruyor, fikrin işe yarayan en küçük hâlini test ediyor ve ancak sonuç dayanıyorsa üzerine ekliyorum.",
    writingEyebrow: "Blog",
    writingTitle: "Yazılar",
    writingIntro: "Büyüme, CRM, deneyler ve ölçümleme üzerine yazılar.",
    allPosts: "Tüm yazıları gör",
    buildEyebrow: "Lab",
    buildTitle: "Ürettiklerim",
    buildIntro: "Bunların çoğu, daha önce de karşıma çıkmış bir problem için kendime aldığım not olarak başladı. İşe yarayanları başkalarının da inceleyip kullanabileceği araçlara dönüştürdüm.",
    allProjects: "Tüm projeleri incele",
    footerEmailLabel: "E-posta",
    langLabel: "EN",
    langHref: "/about",
  },
} as const;

const PROJECT_SUMMARY: Record<Lang, Record<string, string>> = {
  en: {
    "claude-lifecycle": "Turns signals and goals into lifecycle journeys.",
    "lifecycle-card-archive": "Ready-made journeys for common lifecycle needs.",
    "ab-test-playbook": "Practical A/B test ideas from hypothesis to measurement.",
    "dashboard-builder": "Turns cross-platform exports into comparable metrics and dashboards.",
    "google-ads-change-history-dashboard": "Tracks changes alongside date, campaign, and performance data.",
    numerspace: "Free calculators for marketing metrics.",
  },
  tr: {
    "claude-lifecycle": "Sinyal ve hedeflerden lifecycle akışları oluşturur.",
    "lifecycle-card-archive": "Farklı lifecycle ihtiyaçları için hazır journey örnekleri.",
    "ab-test-playbook": "Fikirden ölçüme, uygulanabilir A/B test senaryoları.",
    "dashboard-builder": "Farklı platform raporlarını karşılaştırılabilir metriklere dönüştürür.",
    "google-ads-change-history-dashboard": "Değişiklikleri tarih, kampanya ve performans verisiyle birlikte takip eder.",
    numerspace: "Pazarlama metrikleri için ücretsiz hesaplayıcılar.",
  },
};

type Row = { key: string; co: string; logo: string; role: string; period: string; desc: string };

export default function AboutPage({ lang }: { lang: Lang }) {
  const t = T[lang];
  const c = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const logos = c.about.timeline.map((e) => ({ co: e.co, logo: e.logo }));
  const posts = [...getAllBlogPosts(lang)].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  // One row per entry - every timeline entry is a single role since the
  // two Enuygun titles were merged (2026-09-14); same shape as Site.tsx's Bio.
  const rows = c.about.timeline.map(
    (e): Row => ({ key: `${e.co}-${e.role}`, co: e.co, logo: e.logo, role: e.role, period: e.period, desc: e.desc }),
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
                <div className="flex w-full flex-col rounded-card bg-paper p-6 ring-1 ring-ink-950/[0.06]">
                  <p className="altor-eyebrow text-ink-subtle">{t.nowLabel}</p>
                  <Image src={rows[0].logo} alt={rows[0].co} width={140} height={28} className="mt-4 h-7 w-auto max-w-[9rem] object-contain object-left" />
                  <p className="mt-4 text-lg leading-snug font-semibold text-ink-950">{t.nowRole}</p>
                  <p className="mt-auto pt-5 text-sm text-ink-subtle tabular-nums">{t.nowPeriod}</p>
                </div>
              </Reveal>

              {/* Focus areas: what the work is actually about, rather than
                  repeating the location already shown on the portrait. */}
              <Reveal delay={320} className="flex">
                <div className="flex w-full flex-col rounded-card bg-paper p-6 ring-1 ring-ink-950/[0.06]">
                  <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary-700">
                    <Target className="size-5" />
                  </span>
                  <p className="mt-4 text-lg leading-snug font-semibold text-ink-950">{t.focusTitle}</p>
                  <div className="mt-3 flex flex-col gap-1 text-sm leading-relaxed text-ink-muted">
                    {t.focusItems.map((item) => <p key={item}>{item}</p>)}
                  </div>
                </div>
              </Reveal>

              {/* The years, and the companies they were spent at. */}
              <Reveal delay={380} className="flex">
                <div className="flex w-full flex-col rounded-card bg-paper p-6 ring-1 ring-ink-950/[0.06]">
                  <p className="text-h3 text-ink-950">{t.experienceTitle}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t.experienceLine}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-6">
                    {logos.map((l) => (
                      <Image key={l.co} src={l.logo} alt={l.co} width={100} height={20} className="h-5 w-auto max-w-[6rem] object-contain opacity-80" />
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Outside the day job, on the night plate. */}
              <Reveal delay={440} className="flex">
                <div className="relative isolate flex w-full flex-col justify-between overflow-hidden rounded-card bg-ink-950 p-6 text-white">
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

        {/* HOW HE WORKS: his own two paragraphs (content.ts `about.lead` /
            `about.body`). The four homepage services used to sit beside them
            as tiles; they were removed in the 2026-09-12 copy pass - they are
            the homepage's own section, and repeating them here made the About
            page a second homepage rather than a page about the person. */}
        <section className="bg-paper py-20 md:py-28">
          <div className="altor-container">
            <SectionHeading eyebrow={t.howEyebrow} title={t.howTitle} />
            <Reveal className="mt-12">
              <p className="max-w-[52ch] text-lg leading-relaxed text-pretty text-ink-muted">{t.howLead}</p>
              <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-pretty text-ink-muted">{t.howBody}</p>
            </Reveal>
          </div>
        </section>

        {/* THE RECORD: the roles on a slowly turning spiral. */}
        <section className="bg-paper-soft py-20 md:py-28">
          <div className="altor-container">
            <SectionHeading eyebrow={c.about.experience} title={t.h2} align="center" />
            {/* The spiral record (ui/ExperienceSpiral.tsx): the roles on a
                turning coil, the one in front spelled out beneath. */}
            <div className="mt-12">
              <ExperienceSpiral items={rows} label={c.about.experience} />
            </div>
          </div>
        </section>

        {/* WHAT HE BUILDS: the six projects as a plain list - name and one
            line each. They were a grid of six cards (icon, tagline, proof
            row) until the 2026-09-12 copy pass; the Lab index is where the
            projects are presented, and on the About page they only need to
            be named. The homepage's toolkit band (StackShowcase) went in the
            same pass, for the same reason. */}
        <section className="bg-paper py-20 md:py-28">
          <div className="altor-container">
            <SectionHeading eyebrow={t.buildEyebrow} title={t.buildTitle} intro={t.buildIntro} />
            <div className="mt-12 overflow-hidden rounded-card bg-paper ring-1 ring-ink-950/[0.06]">
              {c.lab.projects.map((project, i) => {
                const [primary] = project.links;
                return (
                  <Reveal key={project.slug} delay={i * 60} className="border-t border-line first:border-t-0">
                    <Link
                      href={primary.href}
                      className="group flex items-center justify-between gap-6 px-6 py-5 transition-colors duration-[var(--duration-fast)] hover:bg-paper-soft"
                    >
                      <span className="min-w-0">
                        <span className="block text-lg leading-snug font-semibold text-ink-950">{project.short}</span>
                        <span className="mt-1 block text-sm leading-relaxed text-pretty text-ink-muted">{PROJECT_SUMMARY[lang][project.slug] ?? project.tagline}</span>
                      </span>
                      <ArrowRight aria-hidden className="size-4 shrink-0 text-ink-400 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5" />
                    </Link>
                  </Reveal>
                );
              })}
            </div>
            <Reveal delay={420} className="mt-12">
              <ButtonLink href={c.nav.labHref} variant="outline" size="md">
                {t.allProjects}
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            </Reveal>
          </div>
        </section>

        {/* WRITING: the three latest posts, real dates - EN only, the blog
            has no Turkish posts, so the Turkish page skips the band. */}
        {posts.length > 0 && (
          <section className="bg-paper-soft py-20 md:py-28">
            <div className="altor-container">
              <SectionHeading eyebrow={t.writingEyebrow} title={t.writingTitle} intro={t.writingIntro} />
              <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
                {posts.map((post, i) => (
                  <Reveal key={post.slug} delay={i * 60} className="flex">
                    <Link
                      href={lang === "en" ? `/blog/${post.slug}` : `/tr/blog/${post.slug}`}
                      className="group flex w-full flex-col rounded-card bg-paper p-6 ring-1 ring-ink-950/[0.06] transition-shadow duration-[var(--duration-fast)] hover:shadow-[0_18px_40px_-24px_rgb(10_16_32/0.35)]"
                    >
                      <p className="altor-eyebrow text-ink-subtle">{CATEGORY_TAB_LABEL[post.category]?.[lang] ?? post.category}</p>
                      <p className="mt-3 text-lg leading-snug font-semibold text-balance text-ink-950">{post.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-muted">{post.excerpt}</p>
                      <p className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm text-ink-subtle tabular-nums">
                        {new Date(post.date).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                        <ArrowRight aria-hidden className="size-4 text-ink-400 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5" />
                      </p>
                    </Link>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={240} className="mt-12">
                <ButtonLink href={c.nav.blogHref} variant="outline" size="md">
                  {t.allPosts}
                  <ArrowRight aria-hidden className="size-4" />
                </ButtonLink>
              </Reveal>
            </div>
          </section>
        )}

        <FinalCta t={c} />
      </main>
      <SiteFooter t={c} lang={lang} />
    </>
  );
}
