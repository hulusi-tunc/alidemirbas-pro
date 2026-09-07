import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Calculator,
  CalendarClock,
  Car,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  Megaphone,
  Moon,
  PawPrint,
  Shirt,
  Sigma,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { buttonStyles } from "@/components/ui/Button";
import { PixelFill } from "@/components/ui/PixelFill";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { ProductCta } from "@/components/ui/ProductCta";
import { ProductFrame, ProductMark } from "@/components/ui/ProductFrame";
import { Reveal } from "@/components/ui/Reveal";
import { ProductHeading, ProductSection } from "@/components/ui/ProductPage";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { LabProjectIcon, labAccent } from "@/components/ui/LabProjectIdentity";
import type { SkillProductContent } from "@/components/SkillProductPage";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { breadcrumbList, webApplication } from "@/lib/schema";
import { copy, type Lang } from "@/lib/content";
import { clsx } from "@/lib/clsx";
import { NUMERSPACE_CATALOG } from "@/lib/numerspace-catalog";

/* Numerspace's product page - revised (2026-09) for length and repetition,
   not for a new visual language. The prior pass ran seven sections through
   one rhythm (centred eyebrow -> centred headline -> grey paragraph ->
   rounded card), which read as a second Numerspace homepage rather than
   Ali's own case page for it. This pass:

   - drops three sections that didn't earn their own screen (Bilingual,
     Accuracy, How to use it) - their one useful fact each survives as
     microcopy where it already belongs, not as a fourth headline;
   - adds one new section ("Why I built it") that a portfolio page needs
     and a marketing page doesn't - product thinking, not another feature
     list, set left-aligned and editorial rather than centred, so the page
     visibly changes register partway through instead of repeating itself;
   - keeps every other section's real material (the real category counts,
     the real calorie-calculator mock, the real FAQ, the real project
     proof lines) and re-composes it more compactly.

   EVERY VALUE BELOW IS REAL, re-checked against the live site this pass.
   The 13 category names, their example tool names and the calorie
   calculator's fields/formula/arithmetic carry over unchanged from the
   prior pass (see its own note, preserved below) - re-verified, not
   re-guessed. What's NEW this pass: the per-category tool counts (fetched
   directly from numerspace.com/en, category by category; they sum to
   exactly 97, the same sitemap-counted total this page already used,
   which is what makes them trustworthy enough to print). */


const T = {
  en: {
    eyebrow: "Lab",
    heroTitle: "97 calculators. No signup. No data stored.",
    heroSub: "Free calculators for everyday questions - from money and health to work, time and marketing. No account required.",
    ctaVisit: "Open numerspace.com",
    heroStats: ["97 calculators", "13 categories", "Turkish + English"],
    verifyCaption: "Results you can verify.",
    verifyNote: "Where a calculator uses a standard formula, the formula is shown alongside the result.",

    whyEyebrow: "Project",
    whyTitle: "A calculator should answer the question, then get out of the way.",
    whyBody: "I built Numerspace as a fast, bilingual collection of practical calculators. Open a tool, enter what you know and get the result - without creating an account or sending your calculation inputs to a server.",

    catEyebrow: "Categories",
    catTitle: "97 calculators across 13 categories.",
    catSub: "From finance and health to work, travel and everyday calculations.",
    catCount: (n: number) => `${n} calculator${n === 1 ? "" : "s"}`,
    catExploreAll: "Explore all 13 categories",
    catBrowse: "Browse by category",
    catOpen: "Open on numerspace.com",
    catTotal: (n: number, k: number) => `${n} calculators in ${k} categories, all on numerspace.com`,
    heroShotAlt: "numerspace.com's homepage: a search field over category sections of calculator cards.",

    privacyEyebrow: "Privacy by design",
    privacyTitle: "Your numbers stay in your browser.",
    privacySub: "Most calculations run locally on your device - inputs aren't sent to Numerspace for calculation or stored in an account.",
    privacyInput: "Input",
    privacyBrowser: "Your browser",
    privacyResult: "Result",
    privacyStays: "Stays on your device",
    privacyPoints: ["No account", "No calculation database", "Calculated on your device"],

    faqEyebrow: "FAQ",

    relatedEyebrow: "Also in the Lab",
    relatedCta: "Explore",

    ctaEyebrow: "Free, no sign-up",
    ctaTitle: "Try a calculator you can check yourself.",
  },
  tr: {
    eyebrow: "Lab",
    heroTitle: "97 hesaplayıcı. Üyelik yok. Veri saklanmıyor.",
    heroSub: "Paradan sağlığa, işten zamana ve pazarlamaya kadar günlük sorular için ücretsiz hesaplayıcılar. Hesap gerekmez.",
    ctaVisit: "numerspace.com'u aç",
    heroStats: ["97 hesaplayıcı", "13 kategori", "Türkçe + İngilizce"],
    verifyCaption: "Kendiniz de kontrol edebileceğiniz sonuçlar.",
    verifyNote: "Bir hesaplayıcı standart bir formül kullandığında, formül sonuçla birlikte gösterilir.",

    whyEyebrow: "Proje",
    whyTitle: "Bir hesaplayıcı soruyu yanıtlamalı, sonra yoldan çekilmeli.",
    whyBody: "Numerspace'i hızlı, iki dilli, pratik hesaplayıcılardan oluşan bir koleksiyon olarak kurdum. Bir aracı açın, bildiğinizi girin ve sonucu alın - hesap oluşturmadan ya da hesaplama girdilerinizi bir sunucuya göndermeden.",

    catEyebrow: "Kategoriler",
    catTitle: "13 kategoride 97 hesaplayıcı.",
    catSub: "Finans ve sağlıktan işe, seyahate ve gündelik hesaplamalara.",
    catCount: (n: number) => `${n} hesaplayıcı`,
    catExploreAll: "13 kategorinin tamamını keşfet",
    catBrowse: "Kategoriye göre göz at",
    catOpen: "numerspace.com'da aç",
    catTotal: (n: number, k: number) => `${k} kategoride ${n} hesaplayıcı, hepsi numerspace.com'da`,
    heroShotAlt: "numerspace.com'un ana sayfası: hesaplayıcı kartlarından oluşan kategori bölümlerinin üstünde bir arama alanı.",

    privacyEyebrow: "Tasarımdan gelen gizlilik",
    privacyTitle: "Sayılarınız tarayıcınızda kalır.",
    privacySub: "Hesaplamaların çoğu cihazınızda, yerel olarak çalışır - girdiler hesaplama için Numerspace'e gönderilmez ya da bir hesapta saklanmaz.",
    privacyInput: "Girdi",
    privacyBrowser: "Tarayıcınız",
    privacyResult: "Sonuç",
    privacyStays: "Cihazınızda kalır",
    privacyPoints: ["Hesap yok", "Hesaplama veritabanı yok", "Cihazınızda hesaplanır"],

    faqEyebrow: "SSS",

    relatedEyebrow: "Lab'de ayrıca",
    relatedCta: "Keşfet",

    ctaEyebrow: "Ücretsiz, üyelik yok",
    ctaTitle: "Kendiniz de kontrol edebileceğiniz bir hesaplayıcı deneyin.",
  },
} as const;

/* ---- The product, drawn ------------------------------------------------
   Hulusi (2026-09-06): the Lab's product visuals must "feel like real
   product screenshots, not Claude design". The hero used to frame a
   compact grid of the calorie calculator's fields; it now shows the
   calculator PAGE as numerspace.com lays it out - nav, breadcrumb,
   category, title, formula, the segmented gender and goal controls, the
   four inputs with the worked example in them, BMR and the result
   (ui/LabProductWindows.tsx). Same real fields, same real arithmetic. */

/* ---- 01 · Hero - centred / visual -------------------------------------- */
function Hero({ c, t, lang, siteHref }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang; siteHref: string }) {
  const link = c.primaryLinks[0];
  return (
    <section className="relative isolate overflow-hidden bg-paper pt-16 pb-20 md:pt-20 md:pb-24">
      <PortraitContainer className="text-center">
        <Reveal>
          <ProductMark slug="numerspace" lang={lang} className="mb-5" />
          <h1 className="mx-auto max-w-4xl text-h1 text-ink-950">{t.heroTitle}</h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-ink-950/65">{t.heroSub}</p>
        </Reveal>
        {link && (
          <Reveal delay={140} className="mt-8 flex flex-wrap justify-center gap-2.5">
            <a href={link.href} target="_blank" rel="noreferrer" className={buttonStyles({ variant: "primary", size: "md" })}>
              <PixelFill />
              {t.ctaVisit}
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </Reveal>
        )}
        <Reveal delay={180} className="mt-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12.5px] text-ink-500">
            {t.heroStats.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={220} className="mx-auto mt-14 max-w-5xl text-left">
          {/* THE REAL SITE. Numerspace exists and is Ali's, so its hero is a
              photograph of it - numerspace.com's homepage in this language,
              captured on 2026-09-06 (public/lab/numerspace/home-<lang>.jpg,
              1440×900 at 2x) - not a drawing of it (Hulusi: "this is not the
              website he built; go there, take a screenshot"). On the
              project's plate, in its hue (ui/ProductFrame.tsx). */}
          <ProductFrame slug="numerspace">
            <a href={siteHref} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl bg-paper ring-1 ring-ink-950/10 shadow-[0_28px_70px_-28px_rgb(10_16_32/0.55)]">
              <Image
                src={`/lab/numerspace/home-${lang}.jpg`}
                alt={t.heroShotAlt}
                width={2880}
                height={1800}
                sizes="(min-width: 1280px) 1024px, 100vw"
                className="block h-auto w-full"
                priority
              />
            </a>
          </ProductFrame>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 02 · Why I built it - editorial / left-aligned --------------------
   The page's register change: everything above and below this is centred;
   this one section reads as a note from Ali, not a product claim, and the
   left-aligned heading is the visible signal of that before a reader has
   parsed a single word. */
function WhySection({ t }: { t: (typeof T)[Lang] }) {
  // No stat strip here - the 97/13/2/0 numbers already carry the next
  // section's own headline ("97 calculators across 13 categories"), so a
  // second, larger rendering of the same four numbers right above it was
  // pure repetition. This section is copy only.
  return (
    <ProductSection tone="paper" space="band">
      <PortraitContainer>
        <ProductHeading eyebrow={t.whyEyebrow} title={t.whyTitle} body={t.whyBody} />
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 03 · The catalogue - every calculator, as cards --------------------
   Hulusi (2026-09-06): "show all of the available calculators for that
   specific project - look at the calculator page and do something like
   that". So this is the site's own calculator-library grammar (ui/
   CalculatorLibrary.tsx: soft cards, a Lucide icon on a round tile tinted
   per category, chips to jump by category) over numerspace.com's real
   catalogue: src/lib/numerspace-catalog.ts, generated from the site's
   sitemap and category pages by scripts/fetch-numerspace-catalog.mjs -
   97 calculators in 13 categories, each with the site's own name, one-line
   description and link. Nothing here is typed in by hand. */

const CATEGORY_LOOK: Record<string, { icon: LucideIcon; tint: string }> = {
  "finance-investment": { icon: Landmark, tint: "bg-emerald-100 text-emerald-700" },
  "health-fitness": { icon: HeartPulse, tint: "bg-rose-100 text-rose-700" },
  "business-career": { icon: Briefcase, tint: "bg-sky-100 text-sky-700" },
  "time-date": { icon: CalendarClock, tint: "bg-amber-100 text-amber-700" },
  "math-converter": { icon: Sigma, tint: "bg-violet-100 text-violet-700" },
  "education-productivity": { icon: GraduationCap, tint: "bg-indigo-100 text-indigo-700" },
  "home-living": { icon: House, tint: "bg-orange-100 text-orange-700" },
  "clothing-size": { icon: Shirt, tint: "bg-fuchsia-100 text-fuchsia-700" },
  "marketing-analytics": { icon: Megaphone, tint: "bg-blue-100 text-blue-700" },
  pet: { icon: PawPrint, tint: "bg-lime-100 text-lime-700" },
  "cars-travel": { icon: Car, tint: "bg-cyan-100 text-cyan-700" },
  faith: { icon: Moon, tint: "bg-teal-100 text-teal-700" },
  astrology: { icon: Sparkles, tint: "bg-purple-100 text-purple-700" },
};
const FALLBACK_LOOK = { icon: Calculator, tint: "bg-teal-100 text-teal-700" };

/* The two languages list the same 13 categories in the same order, so a
   Turkish category takes its look from its English twin by position. */
const LOOK_BY_INDEX = NUMERSPACE_CATALOG.en.map((c) => CATEGORY_LOOK[c.slug] ?? FALLBACK_LOOK);

/** The category's short name: the site's own page title without its
    trailing "Calculators" / "Hesaplayıcıları". */
function shortName(name: string) {
  return name.replace(/\s+(Calculators?|Hesaplay[ıi]c[ıi]lar[ıi]?|Hesaplama Araçlar[ıi])$/iu, "");
}

function CatalogueSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const cats = NUMERSPACE_CATALOG[lang];
  const total = cats.reduce((n, c) => n + c.count, 0);
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={t.catEyebrow} title={t.catTitle} body={t.catSub} align="center" />

        {/* The chip row: one per category, with its count - in-page jumps. */}
        <Reveal delay={80} className="mt-10">
          <p className="text-center text-[13px] text-ink-500">{t.catBrowse}</p>
          <ul className="mt-3 flex list-none flex-wrap justify-center gap-2 p-0">
            {cats.map((c, i) => {
              const Icon = LOOK_BY_INDEX[i].icon;
              return (
                <li key={c.slug}>
                  <a
                    href={`#ns-${c.slug}`}
                    className="inline-flex h-9 items-center gap-2 rounded-full bg-paper px-3.5 text-[13px] font-medium text-ink-700 shadow-hairline transition-colors hover:bg-blue-50 hover:text-primary-700"
                  >
                    <Icon aria-hidden className="size-4 text-ink-400" />
                    {shortName(c.name)}
                    <span className="text-ink-400 tabular-nums">{c.count}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </Reveal>

        {/* The groups: a heading with the category's mark and count, then
            its calculators as cards, three across. */}
        <div className="mt-14 flex flex-col gap-14">
          {cats.map((c, i) => {
            const look = LOOK_BY_INDEX[i];
            const Icon = look.icon;
            return (
              <section key={c.slug} id={`ns-${c.slug}`} className="scroll-mt-24">
                <Reveal className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                  <h3 className="flex items-center gap-3 text-h3 text-ink-950">
                    <span aria-hidden className={clsx("grid size-9 shrink-0 place-items-center rounded-full", look.tint)}>
                      <Icon className="size-4.5" />
                    </span>
                    {shortName(c.name)}
                    <span className="text-[14px] font-normal text-ink-500 tabular-nums">{t.catCount(c.count)}</span>
                  </h3>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-600 transition-colors hover:text-primary-700"
                  >
                    {t.catOpen}
                    <ArrowUpRight aria-hidden className="size-3.5" />
                  </a>
                </Reveal>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {c.items.map((item, j) => (
                    <Reveal key={item.slug} delay={Math.min(j, 5) * 50}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex h-full gap-4 rounded-card bg-paper p-4 transition-colors hover:bg-blue-50 sm:flex-col sm:gap-2.5 sm:p-5"
                      >
                        <span aria-hidden className={clsx("grid size-10 shrink-0 place-items-center rounded-full sm:mb-1", look.tint)}>
                          <Icon className="size-5" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col sm:contents">
                          <span className="text-[15px] font-semibold tracking-tight text-ink-950">{item.name}</span>
                          <span className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-600 sm:mt-0">{item.description}</span>
                          <span className="mt-2 flex items-center justify-between gap-2 sm:mt-auto sm:pt-1.5">
                            <span className="text-[12px] text-ink-400">numerspace.com</span>
                            <ArrowUpRight aria-hidden className="size-3.5 shrink-0 text-ink-300 transition-colors group-hover:text-primary-600" />
                          </span>
                        </span>
                      </a>
                    </Reveal>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <Reveal delay={60} className="mt-12 text-center text-[13px] text-ink-500 tabular-nums">
          {t.catTotal(total, cats.length)}
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 04 · Privacy - horizontal product explanation ---------------------
   One real flow (input -> your browser -> result), drawn as part of the
   product rather than a slide: a single bordered panel instead of loose
   pills over the page background, with the crossed-out "sent to a server"
   pill from the prior pass gone - the honest claim is what stays local,
   not a struck-through claim about what doesn't happen. */
function PrivacySection({ t }: { t: (typeof T)[Lang] }) {
  return (
    // soft, not paper: keeps the paper/soft rhythm varied now that Faq
    // (right after this one) needs to be paper for its own cards to read -
    // the flow panel below is a bordered bg-paper card either way, the
    // same "card on a tinted ground" pattern Categories already uses.
    <ProductSection tone="soft" space="md">
      <PortraitContainer>
        <ProductHeading eyebrow={t.privacyEyebrow} title={t.privacyTitle} body={t.privacySub} align="center" />
        <Reveal delay={100} className="mx-auto mt-10 max-w-xl overflow-hidden rounded-card border border-line bg-paper">
          <div className="flex flex-col items-stretch sm:flex-row">
            {[t.privacyInput, t.privacyBrowser, t.privacyResult].map((step, i) => (
              <div key={step} className="relative flex flex-1 items-center justify-center gap-3 px-5 py-6">
                {i === 1 ? (
                  <span className="absolute inset-x-2 top-2 rounded-full bg-emerald-50 px-2 py-0.5 text-center font-mono text-[9.5px] font-medium tracking-wide text-emerald-700 uppercase sm:inset-x-3">
                    {t.privacyStays}
                  </span>
                ) : null}
                <span className={clsx("mt-3 text-[13.5px] font-medium", i === 1 ? "text-emerald-700" : "text-ink-800")}>
                  {step}
                </span>
                {i < 2 && (
                  <ArrowRight
                    aria-hidden
                    className="absolute top-1/2 right-0 hidden size-4 -translate-y-1/2 translate-x-1/2 text-ink-300 sm:block"
                  />
                )}
                {i < 2 && (
                  <span aria-hidden className="mt-2 block h-px w-8 bg-line sm:hidden" />
                )}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={150} className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12.5px] text-ink-500">
          {t.privacyPoints.map((p) => (
            <span key={p}>{p}</span>
          ))}
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

function Faq({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  if (!c.faq || c.faq.length === 0) return null;
  return (
    // paper, not soft: FaqAccordion's own items are already bg-paper-soft
    // filled cards (see that file's own comment) - on a soft-toned section
    // they sit on the exact same colour as their own fill and disappear
    // into it. CalculatorDetailTemplate.tsx hit the same thing and fixed
    // it the same way - white ground, so the cards read as cards.
    <ProductSection tone="paper" space="lg">
      <PortraitContainer className="max-w-2xl">
        <ProductHeading eyebrow={t.faqEyebrow} title={c.faqTitle ?? "FAQ"} />
        <Reveal delay={80} className="mt-10">
          <FaqAccordion items={c.faq} />
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- Other Lab projects - visual project cards --------------------------
   Deliberately NOT RelatedGrid (the plain bordered-link row used
   elsewhere): the brief for this pass asks the four other Lab projects to
   read as distinct from the category rows above, each with a small,
   restrained visual keyed to what that project actually is - not a fifth
   repeat of "bordered rectangle, name, one line of grey text". All four
   get the same size and treatment; nothing here is a featured card. */
/** The other project's own mark - the glyph and tint it carries on
    every Lab surface (ui/LabProjectIdentity.tsx) - instead of the four
    abstract "artifact" drawings this card used to invent for them. */
function ProjectMark({ slug }: { slug: string }) {
  const accent = labAccent(slug);
  return (
    <span className={clsx("grid size-10 place-items-center rounded-lg", accent.tile)}>
      <LabProjectIcon slug={slug} className="size-5" />
    </span>
  );
}

function OtherProjects({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  const items = c.related;
  if (items.length === 0) return null;
  return (
    <ProductSection tone="paper" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={t.relatedEyebrow} title={c.relatedTitle} align="center" />
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item, i) => {
            return (
              <Reveal key={item.href} delay={i * 70}>
                <a
                  href={item.href}
                  className="group flex h-full flex-col rounded-card border border-line bg-paper p-5 transition-colors hover:border-neutral-400 hover:bg-paper-soft"
                >
                  {item.slug ? <ProjectMark slug={item.slug} /> : null}
                  <p className="mt-4 text-[15px] font-medium tracking-tight text-ink-950">{item.name}</p>
                  {item.desc ? <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink-500">{item.desc}</p> : null}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    {item.proof ? (
                      <span className="font-mono text-[11px] text-ink-400 tabular-nums">{item.proof}</span>
                    ) : (
                      <span />
                    )}
                    <span className="flex items-center gap-1 text-[12.5px] font-medium text-ink-700 transition-colors group-hover:text-ink-950">
                      {t.relatedCta}
                      <ArrowRight aria-hidden className="size-3.5" />
                    </span>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </PortraitContainer>
    </ProductSection>
  );
}

function PageCta({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  const link = c.primaryLinks[0];
  if (!link) return null;
  return <ProductCta eyebrow={t.ctaEyebrow} title={t.ctaTitle} primary={{ label: t.ctaVisit, href: link.href }} />;
}

export default function NumerspacePage({ lang, content }: { lang: Lang; content: SkillProductContent }) {
  const copyT = copy[lang];
  const t = T[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? `/tr/lab/${content.slug}` : `/lab/${content.slug}`;
  const path = lang === "en" ? `/lab/${content.slug}` : `/tr/lab/${content.slug}`;
  const siteHref = content.primaryLinks[0]?.href ?? "https://www.numerspace.com";

  const jsonLd: object[] = [
    breadcrumbList([
      { name: copyT.footer.home, url: home },
      { name: copyT.nav.lab, url: lang === "en" ? "/lab" : "/tr/lab" },
      { name: content.title, url: path },
    ]),
  ];
  // No HowTo entry this pass: the page no longer walks a visible 1-2-3
  // "how to use it" sequence (see this file's header comment), and a
  // HowTo result should describe steps a visitor can actually see on the
  // page, not steps that used to be here.
  if (content.appSchema && siteHref) {
    jsonLd.push(
      webApplication({
        name: content.title,
        description: content.sub,
        url: siteHref,
        applicationCategory: content.appSchema.applicationCategory,
      }),
    );
  }

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <SiteHeader t={copyT} anchorBase={home} langHref={langHref} />
      <main>
        <Hero c={content} t={t} lang={lang} siteHref={siteHref} />
        <WhySection t={t} />
        <CatalogueSection t={t} lang={lang} />
        <PrivacySection t={t} />
        <Faq c={content} t={t} />
        <OtherProjects c={content} t={t} />
        <PageCta c={content} t={t} />
      </main>
      <SiteFooter t={copyT} lang={lang} />
    </>
  );
}
