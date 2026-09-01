import { ArrowRight, ArrowUpRight } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import { ProductHeading, ProductSection } from "@/components/ui/ProductPage";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGrid } from "@/components/ui/RelatedGrid";
import type { SkillProductContent } from "@/components/SkillProductPage";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { breadcrumbList, howTo, webApplication } from "@/lib/schema";
import { copy, type Lang } from "@/lib/content";

/* Numerspace's product page.

   THIRD bespoke Lab page this session, benchmarked against
   /lab/dashboard-builder for storytelling/rhythm/confidence - not copied
   from it visually. Numerspace has no repository and no change log to
   pull real rows from; its real material is the live site itself
   (numerspace.com), so this page's illustrative panels are calculator
   MOCKS - a compact, code-rendered rebuild of one real tool's own input
   fields and formula - rather than a table or a diff.

   EVERY VALUE BELOW IS REAL, checked against the live site this pass:
   - The 13 category names and their example tool names (3 per category,
     2 for Vehicle & Travel which only lists that many) come from
     numerspace.com's own EN and TR navigation, fetched directly - not
     translated from English by this page, since the site's own Turkish
     tool names sometimes differ from a literal translation (e.g. "CR
     Hesaplama" for Conversion Rate, "İmsakiye" for the Ramadan
     schedule).
   - The Daily Calorie Calculator's exact input fields, its Mifflin-St
     Jeor formula text, and its five activity-level multipliers were
     read directly off /en/health-fitness/daily-calorie-calculator.
     The worked numbers (30 / 180cm / 80kg / Sedentary -> BMR 1,780 ->
     x1.20 -> 2,136 kcal/day) are this page's own arithmetic run through
     that real formula on illustrative inputs - not a number pulled from
     the site, since the site computes per-visitor and has no fixed
     "example" of its own.
   - The site's own homepage badges (which sum to 113 across categories)
     and its "140+" marketing line are NOT used here - the file this
     page's content comes from (numerspace.tsx) already established 97
     as the sitemap-counted, EN/TR-matched real total, and a badge sum
     that doesn't reconcile with it is not a number to repeat.
   - Mifflin-St Jeor, Devine and Hamwi, and "official regional sources
     (SGK, GİB)" are the same three citations already verified in
     numerspace.tsx's own header comment - restated here, not
     re-guessed. */

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
  categories: [
    { en: "Finance & Investment", tr: "Finans & Yatırım", ex: { en: ["Loan Calculator", "Deposit Interest Calculator", "Rent Increase Calculator"], tr: ["Kredi Hesaplama", "Mevduat Getirisi Hesaplama", "Kira Artış Hesaplama"] } },
    { en: "Health & Fitness", tr: "Sağlık & Fitness", ex: { en: ["BMI Calculator", "Daily Calorie Calculator", "Ideal Weight Calculator"], tr: ["Vücut Kitle İndeksi Hesaplama", "Günlük Kalori İhtiyacı Hesaplama", "İdeal Kilo Hesaplama"] } },
    { en: "Work & Career", tr: "İş & Kariyer", ex: { en: ["Salary Calculator", "Annual Leave Calculator", "Overtime Calculator"], tr: ["Maaş Hesaplama", "Yıllık İzin Hesaplama", "Fazla Mesai Hesaplama"] } },
    { en: "Time & Date", tr: "Zaman & Tarih", ex: { en: ["Age Calculator", "Date Difference Calculator", "Time Difference Calculator"], tr: ["Yaş Hesaplama", "Tarih Farkı Hesaplama", "Saat Farkı Hesaplama"] } },
    { en: "Marketing & Analytics", tr: "Pazarlama & Analitik", ex: { en: ["ROAS Calculator", "Conversion Rate Calculator", "CAC Calculator"], tr: ["ROAS Hesaplama", "CR Hesaplama", "CAC Hesaplama"] } },
    { en: "Math & Converters", tr: "Matematik & Çeviri", ex: { en: ["Percentage Calculator", "Standard Deviation", "Basic Calculator"], tr: ["Yüzde Hesaplama", "Standart Sapma Hesaplama", "Hesap Makinesi"] } },
    { en: "Education & Productivity", tr: "Eğitim & Üretkenlik", ex: { en: ["GPA Calculator", "Reading Time Calculator", "Writing Speed Test"], tr: ["Not Ortalaması Hesaplama", "Okuma Süresi Hesaplama", "Yazma Hızı Testi"] } },
    { en: "Home & Living", tr: "Ev & Yaşam", ex: { en: ["Paint Calculator", "Electricity Bill Calculator", "TV Size Calculator"], tr: ["Boya Hesaplama", "Elektrik Faturası Hesaplama", "TV Boyut Hesaplama"] } },
    { en: "Clothing & Sizing", tr: "Giyim & Beden", ex: { en: ["Bra Size Calculator", "Belt Size Calculator", "Jacket Size Calculator"], tr: ["Sütyen Bedeni Hesaplama", "Kemer Ölçüsü Hesaplama", "Ceket Bedeni Hesaplama"] } },
    { en: "Pets", tr: "Evcil Hayvan", ex: { en: ["Dog Age Calculator", "Cat Age Calculator", "Cat Pregnancy Calculator"], tr: ["Köpek Yaşı Hesaplama", "Kedi Yaşı Hesaplama", "Kedi Gebelik Hesaplama"] } },
    { en: "Vehicle & Travel", tr: "Araç & Seyahat", ex: { en: ["Fuel Consumption Calculator", "Distance Calculator"], tr: ["Yakıt Tüketimi Hesaplama", "Mesafe Hesaplama"] } },
    { en: "Faith", tr: "İnanç", ex: { en: ["Prayer Times", "Zakat Calculator", "Ramadan Schedule"], tr: ["Namaz Vakitleri", "Zekat Hesaplama", "İmsakiye"] } },
    { en: "Astrology", tr: "Astroloji", ex: { en: ["Zodiac Compatibility", "Rising Sign Calculator", "Chinese Zodiac Calculator"], tr: ["Burç Uyumu Hesaplama", "Yükselen Burç Hesaplama", "Çin Burcu Hesaplama"] } },
  ],
  parity: {
    tool: { en: "Daily Calorie Calculator", tr: "Günlük Kalori İhtiyacı Hesaplama" },
    fields: [
      { en: "Weight (kg)", tr: "Kilo (kg)" },
      { en: "Height (cm)", tr: "Boy (cm)" },
      { en: "Age", tr: "Yaş" },
      { en: "Activity Level", tr: "Aktivite Düzeyi" },
    ],
  },
  formulas: [
    { name: "Mifflin-St Jeor", use: { en: "Daily calorie need", tr: "Günlük kalori ihtiyacı" } },
    { name: "Devine & Hamwi", use: { en: "Ideal body weight", tr: "İdeal vücut ağırlığı" } },
    { name: { en: "Official tax & labour rules (SGK, GİB)", tr: "Resmi vergi ve iş mevzuatı (SGK, GİB)" }, use: { en: "Salary, tax and leave calculators", tr: "Maaş, vergi ve izin hesaplayıcıları" } },
  ],
};

const T = {
  en: {
    eyebrow: "Lab",
    heroTitle: "97 calculators. No signup. Nothing saved.",
    heroSub: "A free calculator site spanning finance, health, work, time and marketing - every result computed in your own browser, in Turkish and English.",
    ctaVisit: "Open numerspace.com",
    proof: ["No signup, no account", "Computed in your browser", "97 calculators, EN and TR"],

    workedEyebrow: "One real calculator",
    workedLine1: "The formula is shown, not hidden.",
    workedLine2: "You can check the arithmetic yourself.",

    catEyebrow: "Categories",
    catTitle: "13 categories, so the right tool is never far.",
    catSub: "Finance, health, work, time, marketing, home, pets, sizing, faith and astrology among them - each with its own set of calculators.",

    privacyEyebrow: "Privacy",
    privacyTitle: "Calculated in your browser. Not on a server.",
    privacySub: "A salary, a weight, a birth date, a loan amount - the arithmetic runs on your device and is gone when the tab closes.",
    privacyInput: "You type a number",
    privacyCalc: "Calculated in your browser",
    privacyServer: "Sent to a server",
    privacyResult: "Result shown",

    bilingualEyebrow: "Bilingual",
    bilingualTitle: "97 calculators in Turkish. The same 97 in English.",
    bilingualSub: "Not a partial translation - the interface, the inputs and the results are localized together, tool for tool.",

    accuracyEyebrow: "Accuracy",
    accuracyTitle: "Built on named formulas, not guesses.",

    useEyebrow: "How to use it",
    useTitle: "Three steps, no account.",
    step1Title: "Open the site",
    step1Desc: "Pick Turkish or English with the toggle in the top-right corner; both carry the full catalogue.",
    step2Title: "Find the calculator",
    step2Desc: "Search from the home page, or go through a category.",
    step3Title: "Enter your numbers",
    step3Desc: "The result appears as you type. No account, no export step, nothing kept afterwards.",

    faqEyebrow: "FAQ",
    ctaEyebrow: "FREE, NO SIGN-UP",
    ctaTitle: "Try a calculator you can check yourself.",
  },
  tr: {
    eyebrow: "Lab",
    heroTitle: "97 hesaplayıcı. Üyelik yok. Hiçbir şey saklanmıyor.",
    heroSub: "Finans, sağlık, iş, zaman ve pazarlamayı kapsayan ücretsiz bir hesaplayıcı sitesi - her sonuç kendi tarayıcınızda hesaplanır, Türkçe ve İngilizce.",
    ctaVisit: "numerspace.com'u aç",
    proof: ["Üyelik yok, hesap yok", "Tarayıcınızda hesaplanır", "97 hesaplayıcı, TR ve EN"],

    workedEyebrow: "Gerçek bir hesaplayıcı",
    workedLine1: "Formül gösteriliyor, gizlenmiyor.",
    workedLine2: "Hesabı kendiniz de kontrol edebilirsiniz.",

    catEyebrow: "Kategoriler",
    catTitle: "13 kategori, doğru araç hiç uzak olmasın diye.",
    catSub: "Finans, sağlık, iş, zaman, pazarlama, ev, evcil hayvan, beden ölçüleri, inanç ve astroloji bunlardan bazıları - her birinin kendi hesaplayıcı seti var.",

    privacyEyebrow: "Gizlilik",
    privacyTitle: "Tarayıcınızda hesaplanır. Sunucuda değil.",
    privacySub: "Maaş, kilo, doğum tarihi, kredi tutarı - hesaplama cihazınızda yapılır ve sekmeyi kapattığınızda silinir.",
    privacyInput: "Bir sayı yazarsınız",
    privacyCalc: "Tarayıcınızda hesaplanır",
    privacyServer: "Sunucuya gönderilir",
    privacyResult: "Sonuç gösterilir",

    bilingualEyebrow: "İki Dilli",
    bilingualTitle: "Türkçe 97 hesaplayıcı. İngilizce aynı 97'si.",
    bilingualSub: "Kısmi bir çeviri değil - arayüz, girdiler ve sonuçlar araç araç birlikte yerelleştirilir.",

    accuracyEyebrow: "Doğruluk",
    accuracyTitle: "Tahmine değil, adlandırılmış formüllere dayanır.",

    useEyebrow: "Nasıl kullanılır",
    useTitle: "Üç adım, hesap yok.",
    step1Title: "Siteyi açın",
    step1Desc: "Sağ üstteki değiştiriciyle Türkçe ya da İngilizce seçin; ikisinde de katalogun tamamı var.",
    step2Title: "Hesaplayıcıyı bulun",
    step2Desc: "Ana sayfadan arayın ya da bir kategoriden ilerleyin.",
    step3Title: "Sayıları girin",
    step3Desc: "Sonuç siz yazarken çıkıyor. Hesap yok, dışa aktarma adımı yok, sonrasında saklanan bir şey yok.",

    faqEyebrow: "SSS",
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
    tool and what was computed here on illustrative inputs). */
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

/* ---- 01 · Hero ------------------------------------------------------ */
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
            {t.proof.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={220} className="mx-auto mt-14 max-w-md text-left">
          <BrowserChrome title={`numerspace.com — ${REAL.calorie.title[lang]}`}>
            <CalorieCalculatorMock lang={lang} />
          </BrowserChrome>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 02 · Worked example ---------------------------------------------- */
function WorkedExampleSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <ProductSection tone="soft" space="band">
      <PortraitContainer>
        <Reveal className="mx-auto max-w-md">
          <p className="mb-3 text-center text-[11px] font-medium tracking-wide text-ink-400 uppercase">{t.workedEyebrow}</p>
          <div className="rounded-card border border-line bg-paper">
            <CalorieCalculatorMock lang={lang} />
          </div>
        </Reveal>
        <Reveal delay={90} className="mx-auto mt-8 max-w-lg text-center">
          <p className="text-lg leading-relaxed text-ink-950/70">{t.workedLine1}</p>
          <p className="text-lg leading-relaxed font-medium text-ink-950">{t.workedLine2}</p>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 03 · Categories -------------------------------------------------- */
function CategoriesSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <ProductSection tone="paper" space="xl">
      <PortraitContainer>
        <ProductHeading eyebrow={t.catEyebrow} title={t.catTitle} body={t.catSub} align="center" />
        <Reveal delay={100} className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
          {REAL.categories.map((cat) => (
            <div key={cat.en} className="rounded-card border border-line bg-paper p-4">
              <p className="text-[13px] font-medium text-ink-900">{cat[lang]}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {cat.ex[lang].map((ex) => (
                  <span key={ex} className="rounded-md bg-paper-soft px-2 py-1 text-[11.5px] text-ink-600">
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 04 · Privacy mechanism -------------------------------------------- */
function PrivacySection({ t }: { t: (typeof T)[Lang] }) {
  return (
    <ProductSection tone="soft" space="md">
      <PortraitContainer>
        <ProductHeading eyebrow={t.privacyEyebrow} title={t.privacyTitle} body={t.privacySub} align="center" />
        <Reveal delay={100} className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-3">
          <span className="rounded-full border border-line-strong bg-paper px-4 py-2 text-sm font-medium text-ink-800">
            {t.privacyInput}
          </span>
          <ArrowRight aria-hidden className="size-4 shrink-0 text-ink-300" />
          <span className="rounded-full border border-line-strong bg-paper px-4 py-2 text-sm font-medium text-ink-800">
            {t.privacyCalc}
          </span>
          <ArrowRight aria-hidden className="size-4 shrink-0 text-ink-300" />
          <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            {t.privacyResult}
          </span>
        </Reveal>
        <Reveal delay={140} className="mt-5 flex justify-center">
          <span className="rounded-full bg-[#fdf3f0] px-4 py-2 text-[13px] font-medium text-[#c65d3f] line-through decoration-1">
            {t.privacyServer}
          </span>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 05 · Bilingual parity --------------------------------------------- */
function BilingualSection({ t }: { t: (typeof T)[Lang] }) {
  const p = REAL.parity;
  return (
    <ProductSection tone="paper" space="md">
      <PortraitContainer>
        <ProductHeading eyebrow={t.bilingualEyebrow} title={t.bilingualTitle} body={t.bilingualSub} align="center" />
        <Reveal delay={100} className="mx-auto mt-10 grid max-w-lg grid-cols-1 gap-4 text-left sm:grid-cols-2">
          <div className="rounded-card border border-line bg-paper p-4">
            <p className="text-[11px] font-medium tracking-wide text-ink-400 uppercase">EN</p>
            <p className="mt-1 text-[13px] font-medium text-ink-900">{p.tool.en}</p>
            <div className="mt-3 flex flex-col gap-1.5">
              {p.fields.map((f) => (
                <p key={f.en} className="text-[12.5px] text-ink-600">
                  {f.en}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-card border border-line bg-paper p-4">
            <p className="text-[11px] font-medium tracking-wide text-ink-400 uppercase">TR</p>
            <p className="mt-1 text-[13px] font-medium text-ink-900">{p.tool.tr}</p>
            <div className="mt-3 flex flex-col gap-1.5">
              {p.fields.map((f) => (
                <p key={f.tr} className="text-[12.5px] text-ink-600">
                  {f.tr}
                </p>
              ))}
            </div>
          </div>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 06 · Accuracy ------------------------------------------------------ */
function AccuracySection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <ProductSection tone="soft" space="md">
      <PortraitContainer>
        <ProductHeading eyebrow={t.accuracyEyebrow} title={t.accuracyTitle} align="center" />
        <Reveal delay={100} className="mx-auto mt-8 flex max-w-xl flex-col gap-2.5 text-left">
          {REAL.formulas.map((f, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-paper px-4 py-3">
              <span className="text-[13px] font-medium text-ink-900">{fv(f.name, lang)}</span>
              <span className="text-[12px] text-ink-500">{f.use[lang]}</span>
            </div>
          ))}
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 07 · How to use it -------------------------------------------------- */
function HowToSection({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  const link = c.primaryLinks[0];
  const steps = [
    { n: 1, title: t.step1Title, desc: t.step1Desc },
    { n: 2, title: t.step2Title, desc: t.step2Desc },
    { n: 3, title: t.step3Title, desc: t.step3Desc },
  ];
  return (
    <ProductSection tone="paper" space="md">
      <PortraitContainer className="max-w-xl">
        <ProductHeading eyebrow={t.useEyebrow} title={t.useTitle} align="center" />
        <Reveal delay={100} className="mx-auto mt-10 flex max-w-md flex-col gap-5 text-left">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink-950 font-mono text-[12px] font-semibold text-white">
                {s.n}
              </span>
              <div>
                <p className="text-[13.5px] font-medium text-ink-900">{s.title}</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </Reveal>
        {link && (
          <Reveal delay={200} className="mt-8 text-center">
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              {t.ctaVisit} →
            </a>
          </Reveal>
        )}
      </PortraitContainer>
    </ProductSection>
  );
}

function Faq({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  if (!c.faq || c.faq.length === 0) return null;
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer className="max-w-2xl">
        <ProductHeading eyebrow={t.faqEyebrow} title={c.faqTitle ?? "FAQ"} />
        <Reveal delay={80} className="mt-10">
          <FaqAccordion items={c.faq} />
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

function Related({ c }: { c: SkillProductContent }) {
  if (c.related.length === 0) return null;
  return (
    <ProductSection tone="paper" space="lg">
      <PortraitContainer>
        <RelatedGrid title={c.relatedTitle} items={c.related} />
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

  const jsonLd: object[] = [
    breadcrumbList([
      { name: copyT.footer.home, url: home },
      { name: copyT.nav.lab, url: lang === "en" ? "/lab" : "/tr/lab" },
      { name: content.title, url: path },
    ]),
  ];
  const appUrl = content.primaryLinks[0]?.href;
  if (content.appSchema && appUrl) {
    jsonLd.push(
      webApplication({
        name: content.title,
        description: content.sub,
        url: appUrl,
        applicationCategory: content.appSchema.applicationCategory,
      }),
    );
  }
  if (content.installSteps.length > 0) {
    jsonLd.push(
      howTo({
        name: content.installTitle,
        description: content.whatItDoes.body,
        steps: content.installSteps.map((s) => ({ name: s.title, text: s.desc ?? s.title })),
      }),
    );
  }

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <SiteHeader t={copyT} anchorBase={home} langHref={langHref} />
      <main>
        <Hero c={content} t={t} lang={lang} />
        <WorkedExampleSection t={t} lang={lang} />
        <CategoriesSection t={t} lang={lang} />
        <PrivacySection t={t} />
        <BilingualSection t={t} />
        <AccuracySection t={t} lang={lang} />
        <HowToSection c={content} t={t} />
        <Faq c={content} t={t} />
        <Related c={content} />
        <PageCta c={content} t={t} />
      </main>
      <SiteFooter t={copyT} lang={lang} />
    </>
  );
}
