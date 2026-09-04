import { ArrowRight, ArrowUpRight } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import { ProductHeading, ProductMetricStrip, ProductSection } from "@/components/ui/ProductPage";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import type { SkillProductContent } from "@/components/SkillProductPage";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { breadcrumbList, webApplication } from "@/lib/schema";
import { copy, type Lang } from "@/lib/content";
import { clsx } from "@/lib/clsx";

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

const REAL = {
  calorie: {
    title: { en: "Daily Calorie Calculator", tr: "Günlük Kalori İhtiyacı Hesaplayıcı" },
    formula: {
      en: "BMR = 10 × weight + 6.25 × height − 5 × age + 5 (male) or −161 (female)",
      tr: "BMR = 10 × kilo + 6,25 × boy − 5 × yaş + 5 (erkek) ya da −161 (kadın)",
    },
    inputs: [
      { label: { en: "Gender", tr: "Cinsiyet" }, value: { en: "Male", tr: "Erkek" } },
      { label: { en: "Age", tr: "Yaş" }, value: "30" },
      { label: { en: "Height (cm)", tr: "Boy (cm)" }, value: "180" },
      { label: { en: "Weight (kg)", tr: "Kilo (kg)" }, value: "80" },
      { label: { en: "Activity", tr: "Aktivite" }, value: { en: "Sedentary", tr: "Hareketsiz" } },
    ] as { label: { en: string; tr: string }; value: string | { en: string; tr: string } }[],
    bmr: { en: "1,780", tr: "1.780" },
    resultLabel: { en: "Daily calorie need (×1.20)", tr: "Günlük kalori ihtiyacı (×1,20)" },
    result: { en: "2,136 kcal/day", tr: "2.136 kcal/gün" },
  },
  /** All 13, with the real per-category tool count. `featured` marks the
      8 shown on this page - the rest are one click away at the real site,
      not reproduced here (this is a project page, not the catalogue). */
  categories: [
    { en: "Finance & Investment", tr: "Finans & Yatırım", count: 8, featured: true, ex: { en: ["Loan Calculator", "Deposit Interest Calculator", "Rent Increase Calculator"], tr: ["Kredi Hesaplama", "Mevduat Getirisi Hesaplama", "Kira Artış Hesaplama"] } },
    { en: "Health & Fitness", tr: "Sağlık & Fitness", count: 15, featured: true, ex: { en: ["BMI Calculator", "Daily Calorie Calculator", "Ideal Weight Calculator"], tr: ["Vücut Kitle İndeksi Hesaplama", "Günlük Kalori İhtiyacı Hesaplama", "İdeal Kilo Hesaplama"] } },
    { en: "Work & Career", tr: "İş & Kariyer", count: 7, featured: true, ex: { en: ["Salary Calculator", "Annual Leave Calculator", "Overtime Calculator"], tr: ["Maaş Hesaplama", "Yıllık İzin Hesaplama", "Fazla Mesai Hesaplama"] } },
    { en: "Time & Date", tr: "Zaman & Tarih", count: 8, featured: true, ex: { en: ["Age Calculator", "Date Difference Calculator", "Time Difference Calculator"], tr: ["Yaş Hesaplama", "Tarih Farkı Hesaplama", "Saat Farkı Hesaplama"] } },
    { en: "Marketing & Analytics", tr: "Pazarlama & Analitik", count: 17, featured: true, ex: { en: ["ROAS Calculator", "Conversion Rate Calculator", "CAC Calculator"], tr: ["ROAS Hesaplama", "CR Hesaplama", "CAC Hesaplama"] } },
    { en: "Math & Converters", tr: "Matematik & Çeviri", count: 13, featured: true, ex: { en: ["Percentage Calculator", "Standard Deviation", "Basic Calculator"], tr: ["Yüzde Hesaplama", "Standart Sapma Hesaplama", "Hesap Makinesi"] } },
    { en: "Education & Productivity", tr: "Eğitim & Üretkenlik", count: 4, featured: false, ex: { en: ["GPA Calculator", "Reading Time Calculator", "Writing Speed Test"], tr: ["Not Ortalaması Hesaplama", "Okuma Süresi Hesaplama", "Yazma Hızı Testi"] } },
    { en: "Home & Living", tr: "Ev & Yaşam", count: 6, featured: true, ex: { en: ["Paint Calculator", "Electricity Bill Calculator", "TV Size Calculator"], tr: ["Boya Hesaplama", "Elektrik Faturası Hesaplama", "TV Boyut Hesaplama"] } },
    { en: "Clothing & Sizing", tr: "Giyim & Beden", count: 4, featured: false, ex: { en: ["Bra Size Calculator", "Belt Size Calculator", "Jacket Size Calculator"], tr: ["Sütyen Bedeni Hesaplama", "Kemer Ölçüsü Hesaplama", "Ceket Bedeni Hesaplama"] } },
    { en: "Pets", tr: "Evcil Hayvan", count: 4, featured: false, ex: { en: ["Dog Age Calculator", "Cat Age Calculator", "Cat Pregnancy Calculator"], tr: ["Köpek Yaşı Hesaplama", "Kedi Yaşı Hesaplama", "Kedi Gebelik Hesaplama"] } },
    { en: "Vehicle & Travel", tr: "Araç & Seyahat", count: 2, featured: false, ex: { en: ["Fuel Consumption Calculator", "Distance Calculator"], tr: ["Yakıt Tüketimi Hesaplama", "Mesafe Hesaplama"] } },
    { en: "Faith", tr: "İnanç", count: 4, featured: false, ex: { en: ["Prayer Times", "Zakat Calculator", "Ramadan Schedule"], tr: ["Namaz Vakitleri", "Zekat Hesaplama", "İmsakiye"] } },
    { en: "Astrology", tr: "Astroloji", count: 5, featured: false, ex: { en: ["Zodiac Compatibility", "Rising Sign Calculator", "Chinese Zodiac Calculator"], tr: ["Burç Uyumu Hesaplama", "Yükselen Burç Hesaplama", "Çin Burcu Hesaplama"] } },
  ],
};

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
    whyStats: [
      { value: "97", label: "Calculators" },
      { value: "13", label: "Categories" },
      { value: "2", label: "Languages" },
      { value: "0", label: "Accounts required" },
    ],

    catEyebrow: "Categories",
    catTitle: "97 calculators across 13 categories.",
    catSub: "From finance and health to work, travel and everyday calculations.",
    catCount: (n: number) => `${n} calculator${n === 1 ? "" : "s"}`,
    catExploreAll: "Explore all 13 categories",

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

    ctaEyebrow: "FREE, NO SIGN-UP",
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
    whyStats: [
      { value: "97", label: "Hesaplayıcı" },
      { value: "13", label: "Kategori" },
      { value: "2", label: "Dil" },
      { value: "0", label: "Gereken hesap" },
    ],

    catEyebrow: "Kategoriler",
    catTitle: "13 kategoride 97 hesaplayıcı.",
    catSub: "Finans ve sağlıktan işe, seyahate ve gündelik hesaplamalara.",
    catCount: (n: number) => `${n} hesaplayıcı`,
    catExploreAll: "13 kategorinin tamamını keşfet",

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

    ctaEyebrow: "ÜCRETSİZ, ÜYELİK YOK",
    ctaTitle: "Kendiniz de kontrol edebileceğiniz bir hesaplayıcı deneyin.",
  },
} as const;

function fv(value: string | { en: string; tr: string }, lang: Lang): string {
  return typeof value === "string" ? value : value[lang];
}

/* ---- Shared bits -------------------------------------------------- */

function BrowserChrome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-paper shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_24px_48px_-16px_rgb(10_16_32/0.18)]">
      <div className="flex items-center gap-3 border-b border-line bg-paper-soft px-4 py-2.5">
        <div className="flex gap-1.5">
          <span aria-hidden className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span aria-hidden className="size-2.5 rounded-full bg-[#febc2e]" />
          <span aria-hidden className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 truncate rounded-md bg-paper px-3 py-1 text-center font-mono text-[11px] text-ink-400">
          {title}
        </div>
      </div>
      {children}
    </div>
  );
}

/** A compact, code-rendered rebuild of the real Daily Calorie Calculator's
    input fields, its Mifflin-St Jeor formula, and its result - never a
    screenshot, but every field, the formula text and the arithmetic are
    real (see the file header comment for what was read off the live
    tool and what was computed here on illustrative inputs). Rendered once
    now, in the hero - the prior pass's second, full-section repeat of this
    same mock is gone; see `verifyCaption`/`verifyNote` for where its point
    (the formula is visible, not hidden) survives. */
function CalorieCalculatorMock({ lang }: { lang: Lang }) {
  const c = REAL.calorie;
  return (
    <div className="p-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {c.inputs.map((f, i) => (
          <div key={i} className="rounded-md border border-line-strong bg-paper-soft px-2.5 py-1.5">
            <p className="text-[10px] font-medium tracking-wide text-ink-400 uppercase">{f.label[lang]}</p>
            <p className="mt-0.5 font-mono text-[12.5px] text-ink-900">{fv(f.value, lang)}</p>
          </div>
        ))}
      </div>
      <p className="mt-3.5 font-mono text-[11.5px] leading-relaxed text-ink-500">{c.formula[lang]}</p>
      <p className="mt-1 text-[11.5px] text-ink-400">BMR = {c.bmr[lang]}</p>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-emerald-50 px-3.5 py-2.5">
        <span className="text-[12.5px] font-medium text-emerald-700">{c.resultLabel[lang]}</span>
        <span className="font-mono text-base font-semibold text-emerald-700">{c.result[lang]}</span>
      </div>
    </div>
  );
}

/* ---- 01 · Hero - centred / visual -------------------------------------- */
function Hero({ c, t, lang }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang }) {
  const link = c.primaryLinks[0];
  return (
    <section className="relative isolate overflow-hidden bg-paper pt-16 pb-20 md:pt-20 md:pb-24">
      <PortraitContainer className="text-center">
        <Reveal>
          <p className="altor-eyebrow mb-5 text-ink-400">{t.eyebrow}</p>
          <h1 className="mx-auto max-w-3xl text-h1-fluid font-medium text-ink-950">{t.heroTitle}</h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-ink-950/65">{t.heroSub}</p>
        </Reveal>
        {link && (
          <Reveal delay={140} className="mt-8 flex flex-wrap justify-center gap-2.5">
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-ink-950 px-6 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
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

        <Reveal delay={220} className="mx-auto mt-14 max-w-md text-left">
          <BrowserChrome title={`numerspace.com — ${REAL.calorie.title[lang]}`}>
            <CalorieCalculatorMock lang={lang} />
          </BrowserChrome>
          {/* Secondary product detail, not a section of its own - the point
              the old "One real calculator" section existed to make. */}
          <div className="mt-3 flex flex-col gap-0.5 px-1 sm:flex-row sm:items-baseline sm:gap-2">
            <span className="text-[13px] font-medium text-ink-800">{t.verifyCaption}</span>
            <span className="text-[12px] text-ink-500">{t.verifyNote}</span>
          </div>
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
  return (
    <ProductSection tone="paper" space="band">
      <PortraitContainer>
        <ProductHeading eyebrow={t.whyEyebrow} title={t.whyTitle} body={t.whyBody} />
        <Reveal delay={100} className="mt-10">
          <ProductMetricStrip items={t.whyStats} />
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 03 · Categories - structured browsing list ------------------------
   One bordered module, one hairline list inside it - not 13 (or even 8)
   separate cards. Only the 8 largest/most recognisable categories are
   rows here; the real site's own category nav is one click away for the
   rest ("Explore all 13 categories"), because this page's job is to
   represent the catalogue, not to reproduce it. */
function CategoriesSection({ t, lang, siteHref }: { t: (typeof T)[Lang]; lang: Lang; siteHref: string }) {
  const featured = REAL.categories.filter((c) => c.featured);
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={t.catEyebrow} title={t.catTitle} body={t.catSub} align="center" />
        <Reveal delay={100} className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-card border border-line bg-paper">
          <div className="divide-y divide-line">
            {featured.map((cat) => (
              <div key={cat.en} className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[14.5px] font-medium text-ink-950">{cat[lang]}</p>
                  <span className="shrink-0 font-mono text-[11px] text-ink-400 tabular-nums">{t.catCount(cat.count)}</span>
                </div>
                <p className="mt-1 text-[12.5px] text-ink-500">{cat.ex[lang].join(" · ")}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={160} className="mt-6 text-center">
          <a
            href={siteHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            {t.catExploreAll}
            <ArrowRight aria-hidden className="size-3.5" />
          </a>
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
function JourneyArtifact() {
  return (
    <div aria-hidden className="flex flex-col items-center gap-1.5 py-1">
      <span className="rounded-md bg-ink-950 px-2.5 py-1 font-mono text-[9px] font-semibold tracking-wide text-white uppercase">
        Trigger
      </span>
      <span className="h-3 w-px bg-line-strong" />
      <span className="rounded-md border border-primary-300 bg-primary-50/60 px-2.5 py-1 font-mono text-[9px] font-semibold tracking-wide text-primary-700 uppercase">
        Condition
      </span>
      <span className="h-3 w-px bg-line-strong" />
      <span className="rounded-md border border-line-strong bg-paper px-2.5 py-1 font-mono text-[9px] font-semibold tracking-wide text-ink-600 uppercase">
        Handoff
      </span>
    </div>
  );
}

function LibraryArtifact() {
  // A fanned stack, not a single card with a shadow - the back two layers
  // use a visibly duller fill so "one of many" reads even at this size,
  // and each is offset far enough (rotation + x/y) to actually show an
  // edge past the front card rather than hide fully behind it.
  const layers = [
    { rotate: -9, x: -10, y: 3, bg: "bg-paper-soft", border: "border-line" },
    { rotate: 6, x: 8, y: 5, bg: "bg-paper-soft", border: "border-line" },
    { rotate: 0, x: 0, y: 0, bg: "bg-paper", border: "border-line-strong" },
  ];
  return (
    <div aria-hidden className="relative flex h-[92px] w-full items-center justify-center">
      {layers.map((l, i) => (
        <div
          key={i}
          className={clsx("absolute h-14 w-24 rounded-md border shadow-[0_6px_14px_-8px_rgb(10_16_32/0.25)]", l.bg, l.border)}
          style={{ transform: `translate(${l.x}px, ${l.y}px) rotate(${l.rotate}deg)`, zIndex: i }}
        >
          <div className="mx-2 mt-2 h-1.5 w-10 rounded-full bg-primary-200" />
          <div className="mx-2 mt-1.5 h-1 w-14 rounded-full bg-line-strong" />
          <div className="mx-2 mt-1 h-1 w-8 rounded-full bg-line-strong" />
        </div>
      ))}
    </div>
  );
}

function ExperimentArtifact() {
  return (
    <div aria-hidden className="flex flex-col items-center gap-2 py-1">
      <span className="font-mono text-[9px] font-medium tracking-wide text-ink-400 uppercase">Hypothesis</span>
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-md border border-line-strong bg-paper font-mono text-[11px] font-semibold text-ink-700">
          A
        </span>
        <span className="text-[10px] text-ink-300">vs</span>
        <span className="grid size-8 place-items-center rounded-md border border-primary-300 bg-primary-50/60 font-mono text-[11px] font-semibold text-primary-700">
          B
        </span>
      </div>
      <span className="rounded-full bg-paper-soft px-2 py-0.5 font-mono text-[9px] text-ink-500">guardrail set</span>
    </div>
  );
}

function DashboardArtifact() {
  return (
    <div aria-hidden className="flex flex-col items-center gap-2 py-1">
      <div className="flex h-10 items-end gap-1.5">
        <span className="h-4 w-2.5 rounded-sm bg-line-strong" />
        <span className="h-7 w-2.5 rounded-sm bg-primary-300" />
        <span className="h-5 w-2.5 rounded-sm bg-line-strong" />
        <span className="h-10 w-2.5 rounded-sm bg-primary-500" />
        <span className="h-6 w-2.5 rounded-sm bg-line-strong" />
      </div>
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[9px] font-medium text-emerald-700 uppercase">
        Validated
      </span>
    </div>
  );
}

const ARTIFACT_BY_SLUG: Record<string, () => React.ReactElement> = {
  "claude-lifecycle": JourneyArtifact,
  "lifecycle-card-archive": LibraryArtifact,
  "ab-test-playbook": ExperimentArtifact,
  "dashboard-builder": DashboardArtifact,
};

function OtherProjects({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  const items = c.related;
  if (items.length === 0) return null;
  return (
    <ProductSection tone="paper" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={t.relatedEyebrow} title={c.relatedTitle} align="center" />
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item, i) => {
            const Artifact = (item.slug && ARTIFACT_BY_SLUG[item.slug]) || null;
            return (
              <Reveal key={item.href} delay={i * 70}>
                <a
                  href={item.href}
                  className="group flex h-full flex-col rounded-card border border-line bg-paper p-5 transition-colors hover:border-neutral-400 hover:bg-paper-soft"
                >
                  {Artifact ? (
                    <div className="flex items-center justify-center rounded-lg bg-paper-soft py-3">
                      <Artifact />
                    </div>
                  ) : null}
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
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 py-24 text-white md:py-32">
      <PortraitContainer className="text-center">
        <Reveal>
          <p className="altor-eyebrow mb-5 text-white/45">{t.ctaEyebrow}</p>
          <h2 className="mx-auto max-w-2xl text-h2-fluid font-medium text-white">{t.ctaTitle}</h2>
        </Reveal>
        {link && (
          <Reveal delay={90} className="mt-9 flex flex-wrap justify-center gap-3">
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-ink-950 transition-colors hover:bg-primary-50"
            >
              {t.ctaVisit}
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </Reveal>
        )}
      </PortraitContainer>
    </section>
  );
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
        <Hero c={content} t={t} lang={lang} />
        <WhySection t={t} />
        <CategoriesSection t={t} lang={lang} siteHref={siteHref} />
        <PrivacySection t={t} />
        <Faq c={content} t={t} />
        <OtherProjects c={content} t={t} />
        <PageCta c={content} t={t} />
      </main>
      <SiteFooter t={copyT} lang={lang} />
    </>
  );
}
