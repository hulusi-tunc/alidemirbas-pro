import { ArrowRight, ArrowUpRight, CheckCircle2, DatabaseZap, EyeOff, Plus, ShieldOff, Unlock } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import type { SkillProductContent } from "@/components/SkillProductPage";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { breadcrumbList, webApplication } from "@/lib/schema";
import { copy, type Lang } from "@/lib/content";
import { clsx } from "@/lib/clsx";

/* Numerspace's product page - RESKINNED (2026-09-05) to a supplied external
   reference ("Editorial Functionalism": warm paper, ink-black type, hairline
   borders, an emerald accent reserved for verified calculation output), by
   explicit request: "bunun aynısı yapalım, sadece bizim fontlarımızı
   kullanalım" (make it exactly like this, just use our own fonts).

   A DECLARED, PAGE-SCOPED EXCEPTION, same protocol as /about and
   /calculators' recorded cream-palette exception (site-constitution-instance
   .md) - not a global token change. Every color class below is local to
   this file's own JSX, arbitrary-value or Tailwind's stock zinc/emerald
   scale (which already matches the reference's hex values almost exactly -
   zinc-200 IS #e4e4e7). `ProductSection`/`ProductHeading`/`FaqAccordion`
   are NOT reused here even though other Lab pages use them: all three bake
   in this site's own ink/primary/blue tokens, which would fight rather than
   carry this page's own palette. SiteHeader/SiteFooter are untouched, per
   the standing rule.

   FONTS: the one substitution the request asked for. The reference specifies
   Hanken Grotesk (headings) + Inter (body) + JetBrains Mono (data/labels).
   This page uses `font-sans` (Manrope, this site's one sans - see
   globals.css) for BOTH headings and body, matching this project's own
   established typographic principle of one sans doing the work through
   weight and size rather than a second family - and `font-mono` (JetBrains
   Mono), which already matches the reference exactly, so nothing new loads.

   DATA: the `REAL` object is UNCHANGED from the prior pass - every number
   (97 calculators, 13 categories, each category's real count, the Daily
   Calorie Calculator's real inputs/formula/BMR/result) was already verified
   against the live site there and carries over untouched. See its own
   comment for provenance.

   ONE DELIBERATE DEVIATION FROM THE REFERENCE: its manifesto stat strip
   includes "100% Formula Auditability" - an unconditional claim this page's
   own, already-vetted copy does not support ("where a calculator uses a
   standard formula, the formula is shown alongside the result" - a
   conditional, not every one of the 97). Asserting 100% would be printing a
   number nobody checked, which the standing no-fabrication rule forbids
   regardless of what the reference shows. That slot uses a label
   ("Formulas shown"), not a percentage. The other two stats (0ms network
   latency, 0 bytes retained) are unchanged - both are direct restatements
   of the Privacy section's own real architecture claim just below them.

   ONE SECTION THE REFERENCE DOESN'T HAVE: "Also in the Lab" (other Lab
   projects). The reference is a generic mockup with no knowledge of the
   rest of this site; dropping this page's real cross-links to match its
   section count exactly would trade real navigation for literal fidelity.
   Kept, reskinned to the new palette, in its prior position. */

const REAL = {
  calorie: {
    title: { en: "Daily Calorie Calculator", tr: "Günlük Kalori İhtiyacı Hesaplayıcı" },
    formulaName: "Mifflin-St Jeor",
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
    activityMultiplier: "× 1.20",
    resultLabel: { en: "Daily calorie need", tr: "Günlük kalori ihtiyacı" },
    result: { en: "2,136", tr: "2.136" },
    resultUnit: { en: "kcal/day", tr: "kcal/gün" },
  },
  /** All 13, with the real per-category tool count and a fixed accent so a
      category is recognisable by colour across the page. `featured` marks
      the 7 shown on this page - the rest are one click away at the real
      site, not reproduced here (this is a project page, not the catalogue). */
  categories: [
    { en: "Finance & Investment", tr: "Finans & Yatırım", count: 8, featured: true, accent: "emerald", ex: { en: ["Loan Calculator", "Deposit Interest Calculator", "Rent Increase Calculator"], tr: ["Kredi Hesaplama", "Mevduat Getirisi Hesaplama", "Kira Artış Hesaplama"] } },
    { en: "Health & Fitness", tr: "Sağlık & Fitness", count: 15, featured: true, accent: "rose", ex: { en: ["BMI Calculator", "Daily Calorie Calculator", "Ideal Weight Calculator"], tr: ["Vücut Kitle İndeksi Hesaplama", "Günlük Kalori İhtiyacı Hesaplama", "İdeal Kilo Hesaplama"] } },
    { en: "Work & Career", tr: "İş & Kariyer", count: 7, featured: true, accent: "blue", ex: { en: ["Salary Calculator", "Annual Leave Calculator", "Overtime Calculator"], tr: ["Maaş Hesaplama", "Yıllık İzin Hesaplama", "Fazla Mesai Hesaplama"] } },
    { en: "Time & Date", tr: "Zaman & Tarih", count: 8, featured: true, accent: "amber", ex: { en: ["Age Calculator", "Date Difference Calculator", "Time Difference Calculator"], tr: ["Yaş Hesaplama", "Tarih Farkı Hesaplama", "Saat Farkı Hesaplama"] } },
    { en: "Marketing & Analytics", tr: "Pazarlama & Analitik", count: 17, featured: true, accent: "violet", ex: { en: ["ROAS Calculator", "Conversion Rate Calculator", "CAC Calculator"], tr: ["ROAS Hesaplama", "CR Hesaplama", "CAC Hesaplama"] } },
    { en: "Math & Converters", tr: "Matematik & Çeviri", count: 13, featured: true, accent: "orange", ex: { en: ["Percentage Calculator", "Standard Deviation", "Basic Calculator"], tr: ["Yüzde Hesaplama", "Standart Sapma Hesaplama", "Hesap Makinesi"] } },
    { en: "Education & Productivity", tr: "Eğitim & Üretkenlik", count: 4, featured: false, accent: "cyan", ex: { en: ["GPA Calculator", "Reading Time Calculator", "Writing Speed Test"], tr: ["Not Ortalaması Hesaplama", "Okuma Süresi Hesaplama", "Yazma Hızı Testi"] } },
    { en: "Home & Living", tr: "Ev & Yaşam", count: 6, featured: true, accent: "teal", ex: { en: ["Paint Calculator", "Electricity Bill Calculator", "TV Size Calculator"], tr: ["Boya Hesaplama", "Elektrik Faturası Hesaplama", "TV Boyut Hesaplama"] } },
    { en: "Clothing & Sizing", tr: "Giyim & Beden", count: 4, featured: false, accent: "pink", ex: { en: ["Bra Size Calculator", "Belt Size Calculator", "Jacket Size Calculator"], tr: ["Sütyen Bedeni Hesaplama", "Kemer Ölçüsü Hesaplama", "Ceket Bedeni Hesaplama"] } },
    { en: "Pets", tr: "Evcil Hayvan", count: 4, featured: false, accent: "lime", ex: { en: ["Dog Age Calculator", "Cat Age Calculator", "Cat Pregnancy Calculator"], tr: ["Köpek Yaşı Hesaplama", "Kedi Yaşı Hesaplama", "Kedi Gebelik Hesaplama"] } },
    { en: "Vehicle & Travel", tr: "Araç & Seyahat", count: 2, featured: false, accent: "sky", ex: { en: ["Fuel Consumption Calculator", "Distance Calculator"], tr: ["Yakıt Tüketimi Hesaplama", "Mesafe Hesaplama"] } },
    { en: "Faith", tr: "İnanç", count: 4, featured: false, accent: "stone", ex: { en: ["Prayer Times", "Zakat Calculator", "Ramadan Schedule"], tr: ["Namaz Vakitleri", "Zekat Hesaplama", "İmsakiye"] } },
    { en: "Astrology", tr: "Astroloji", count: 5, featured: false, accent: "fuchsia", ex: { en: ["Zodiac Compatibility", "Rising Sign Calculator", "Chinese Zodiac Calculator"], tr: ["Burç Uyumu Hesaplama", "Yükselen Burç Hesaplama", "Çin Burcu Hesaplama"] } },
  ],
};

/** Tailwind can't see classes built from a runtime string, so each accent
    used above needs its literal utility names listed once, here. */
const ACCENT: Record<string, { dot: string; text: string; hoverBg: string; hoverText: string; badgeBg: string; badgeText: string; badgeBorder: string }> = {
  emerald: { dot: "bg-emerald-600", text: "text-emerald-700", hoverBg: "group-hover:bg-emerald-50/50", hoverText: "group-hover:text-emerald-800", badgeBg: "bg-emerald-50", badgeText: "text-emerald-800", badgeBorder: "border-emerald-200" },
  rose: { dot: "bg-rose-600", text: "text-rose-700", hoverBg: "group-hover:bg-rose-50/50", hoverText: "group-hover:text-rose-800", badgeBg: "bg-rose-50", badgeText: "text-rose-800", badgeBorder: "border-rose-200" },
  blue: { dot: "bg-blue-600", text: "text-blue-700", hoverBg: "group-hover:bg-blue-50/50", hoverText: "group-hover:text-blue-800", badgeBg: "bg-blue-50", badgeText: "text-blue-800", badgeBorder: "border-blue-200" },
  amber: { dot: "bg-amber-600", text: "text-amber-700", hoverBg: "group-hover:bg-amber-50/50", hoverText: "group-hover:text-amber-800", badgeBg: "bg-amber-50", badgeText: "text-amber-800", badgeBorder: "border-amber-200" },
  violet: { dot: "bg-violet-600", text: "text-violet-700", hoverBg: "group-hover:bg-violet-50/50", hoverText: "group-hover:text-violet-800", badgeBg: "bg-violet-50", badgeText: "text-violet-800", badgeBorder: "border-violet-200" },
  orange: { dot: "bg-orange-600", text: "text-orange-700", hoverBg: "group-hover:bg-orange-50/50", hoverText: "group-hover:text-orange-800", badgeBg: "bg-orange-50", badgeText: "text-orange-800", badgeBorder: "border-orange-200" },
  teal: { dot: "bg-teal-600", text: "text-teal-700", hoverBg: "group-hover:bg-teal-50/50", hoverText: "group-hover:text-teal-800", badgeBg: "bg-teal-50", badgeText: "text-teal-800", badgeBorder: "border-teal-200" },
  cyan: { dot: "bg-cyan-600", text: "text-cyan-700", hoverBg: "group-hover:bg-cyan-50/50", hoverText: "group-hover:text-cyan-800", badgeBg: "bg-cyan-50", badgeText: "text-cyan-800", badgeBorder: "border-cyan-200" },
  pink: { dot: "bg-pink-600", text: "text-pink-700", hoverBg: "group-hover:bg-pink-50/50", hoverText: "group-hover:text-pink-800", badgeBg: "bg-pink-50", badgeText: "text-pink-800", badgeBorder: "border-pink-200" },
  lime: { dot: "bg-lime-600", text: "text-lime-700", hoverBg: "group-hover:bg-lime-50/50", hoverText: "group-hover:text-lime-800", badgeBg: "bg-lime-50", badgeText: "text-lime-800", badgeBorder: "border-lime-200" },
  sky: { dot: "bg-sky-600", text: "text-sky-700", hoverBg: "group-hover:bg-sky-50/50", hoverText: "group-hover:text-sky-800", badgeBg: "bg-sky-50", badgeText: "text-sky-800", badgeBorder: "border-sky-200" },
  stone: { dot: "bg-stone-600", text: "text-stone-700", hoverBg: "group-hover:bg-stone-50/50", hoverText: "group-hover:text-stone-800", badgeBg: "bg-stone-50", badgeText: "text-stone-800", badgeBorder: "border-stone-200" },
  fuchsia: { dot: "bg-fuchsia-600", text: "text-fuchsia-700", hoverBg: "group-hover:bg-fuchsia-50/50", hoverText: "group-hover:text-fuchsia-800", badgeBg: "bg-fuchsia-50", badgeText: "text-fuchsia-800", badgeBorder: "border-fuchsia-200" },
};

const T = {
  en: {
    eyebrow: "Lab / Utility 01",
    heroTitle: "97 calculators. No signup. No data stored.",
    heroSub: "Free calculators for everyday questions - from money and health to work, time and marketing. No account required.",
    ctaVisit: "Open numerspace.com",
    heroStats: ["97 calculators", "13 categories", "Turkish + English"],
    localEngine: "Local engine",
    formulaAudit: "Formula audit: verified",
    activityFactor: "Activity factor",
    verifyCaption: "Auditable arithmetic.",
    verifyNote: "Every standard formula and input variable is transparently visible in the computation trace.",

    whyEyebrow: "Manifesto",
    whyLabel: "Product ethos",
    whyTitle: "A calculator should answer the question, then get out of the way.",
    whyBody: "I built Numerspace as a fast, bilingual collection of practical calculators. Open a tool, enter what you know and get the result - without creating an account, enduring modal overlays, or sending your calculation inputs to a server.",
    whyBody2: "Most online calculators exist to harvest telemetry or force newsletter subscriptions. Numerspace returns to the quiet utility of a good instrument: clean typography, immediate deterministic outcomes, and respect for your attention.",
    statLatency: "Network latency",
    statData: "User data retained",
    statFormulas: "Formulas shown",

    catEyebrow: "Index & directory",
    catTitle: "97 calculators across 13 categories.",
    catSub: "From finance and health to work, travel and everyday calculations. Indexed for rapid retrieval.",
    catCount: (n: number) => `${n} calculator${n === 1 ? "" : "s"}`,
    catExploreAll: "Explore all 13 categories",

    privacyEyebrow: "Privacy by design",
    privacyTitle: "Your numbers stay in your browser.",
    privacySub: "Most calculations run locally on your device - inputs aren't sent to Numerspace for calculation or stored in an account.",
    step1Label: "01 · Client",
    step1Title: "User input",
    step1Sub: "Kept inside the page",
    step2Label: "02 · Local engine",
    step2Title: "Your browser",
    step2Sub: "Runs in client-side JS",
    step2Badge: "Stays on your device",
    step3Label: "03 · Verified",
    step3Title: "Result output",
    step3Sub: "Direct render to screen",
    privacyPoints: ["No account", "No calculation database", "Calculated on your device", "No input telemetry"],

    faqEyebrow: "FAQ",
    faqTitle: "Frequently asked questions",

    relatedEyebrow: "Also in the Lab",
    relatedCta: "Explore",

    ctaEyebrow: "Open utility",
    ctaTitle: "Ready to compute without friction?",
    ctaAbout: "About the creator",
  },
  tr: {
    eyebrow: "Lab / Araç 01",
    heroTitle: "97 hesaplayıcı. Üyelik yok. Veri saklanmıyor.",
    heroSub: "Paradan sağlığa, işten zamana ve pazarlamaya kadar günlük sorular için ücretsiz hesaplayıcılar. Hesap gerekmez.",
    ctaVisit: "numerspace.com'u aç",
    heroStats: ["97 hesaplayıcı", "13 kategori", "Türkçe + İngilizce"],
    localEngine: "Yerel motor",
    formulaAudit: "Formül denetimi: doğrulandı",
    activityFactor: "Aktivite katsayısı",
    verifyCaption: "Denetlenebilir aritmetik.",
    verifyNote: "Her standart formül ve girdi değişkeni, hesaplama izinde şeffaf biçimde görünür.",

    whyEyebrow: "Manifesto",
    whyLabel: "Ürün felsefesi",
    whyTitle: "Bir hesaplayıcı soruyu yanıtlamalı, sonra yoldan çekilmeli.",
    whyBody: "Numerspace'i hızlı, iki dilli, pratik hesaplayıcılardan oluşan bir koleksiyon olarak kurdum. Bir aracı açın, bildiğinizi girin ve sonucu alın - hesap oluşturmadan, modal pencerelere katlanmadan ya da hesaplama girdilerinizi bir sunucuya göndermeden.",
    whyBody2: "Çoğu çevrimiçi hesaplayıcı, telemetri toplamak ya da bülten aboneliğine zorlamak için var. Numerspace, iyi bir aletin sessiz faydasına geri döner: sade tipografi, anında deterministik sonuçlar ve dikkatinize saygı.",
    statLatency: "Ağ gecikmesi",
    statData: "Saklanan kullanıcı verisi",
    statFormulas: "Gösterilen formüller",

    catEyebrow: "Dizin & kategoriler",
    catTitle: "13 kategoride 97 hesaplayıcı.",
    catSub: "Finans ve sağlıktan işe, seyahate ve gündelik hesaplamalara. Hızlı erişim için dizinlendi.",
    catCount: (n: number) => `${n} hesaplayıcı`,
    catExploreAll: "13 kategorinin tamamını keşfet",

    privacyEyebrow: "Tasarımdan gelen gizlilik",
    privacyTitle: "Sayılarınız tarayıcınızda kalır.",
    privacySub: "Hesaplamaların çoğu cihazınızda, yerel olarak çalışır - girdiler hesaplama için Numerspace'e gönderilmez ya da bir hesapta saklanmaz.",
    step1Label: "01 · İstemci",
    step1Title: "Kullanıcı girdisi",
    step1Sub: "Sayfa içinde kalır",
    step2Label: "02 · Yerel motor",
    step2Title: "Tarayıcınız",
    step2Sub: "İstemci taraflı JS'de çalışır",
    step2Badge: "Cihazınızda kalır",
    step3Label: "03 · Doğrulandı",
    step3Title: "Sonuç çıktısı",
    step3Sub: "Doğrudan ekrana render edilir",
    privacyPoints: ["Hesap yok", "Hesaplama veritabanı yok", "Cihazınızda hesaplanır", "Girdi telemetrisi yok"],

    faqEyebrow: "SSS",
    faqTitle: "Sıkça sorulan sorular",

    relatedEyebrow: "Lab'de ayrıca",
    relatedCta: "Keşfet",

    ctaEyebrow: "Açık araç",
    ctaTitle: "Sürtünmesiz hesaplamaya hazır mısınız?",
    ctaAbout: "Kurucu hakkında",
  },
} as const;

function fv(value: string | { en: string; tr: string }, lang: Lang): string {
  return typeof value === "string" ? value : value[lang];
}

/* ---- Shared editorial primitives, scoped to this page ------------------ */

/** The page's own section label: small, mono, wide-tracked - the reference's
    `label-editorial` role, in this site's own mono (JetBrains Mono). */
function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={clsx("font-mono text-[11px] font-semibold tracking-[0.08em] text-stone-500 uppercase", className)}>
      {children}
    </span>
  );
}

/* ---- 01 · Hero - the calculator as a specimen --------------------------- */
function Hero({ c, t, lang }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang }) {
  const link = c.primaryLinks[0];
  const cal = REAL.calorie;
  return (
    <section className="bg-[#fbfbfa] px-5 pt-16 pb-20 sm:px-8 md:pt-24 md:pb-28 lg:px-12">
      <PortraitContainer className="flex flex-col items-center text-center">
        <Reveal className="flex items-center gap-2">
          <span aria-hidden className="size-1.5 rounded-full bg-[#111111]" />
          <Kicker>{t.eyebrow}</Kicker>
        </Reveal>
        <Reveal delay={60} className="mt-5">
          <h1 className="max-w-3xl text-[2.25rem] leading-[1.08] font-bold tracking-[-0.03em] text-[#111111] sm:text-[3.5rem] sm:leading-[1.05] sm:tracking-[-0.04em]">
            {t.heroTitle}
          </h1>
        </Reveal>
        <Reveal delay={100} className="mt-5">
          <p className="max-w-xl text-[17px] leading-relaxed text-stone-600">{t.heroSub}</p>
        </Reveal>
        {link && (
          <Reveal delay={140} className="mt-7">
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-[#111111] px-6 py-3 text-sm font-medium tracking-tight text-white transition-colors hover:bg-[#27272a]"
            >
              {t.ctaVisit}
              <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Reveal>
        )}
        <Reveal delay={180} className="mt-6">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 font-mono text-[11px] tracking-[0.08em] text-stone-500 uppercase">
            {t.heroStats.map((item, i) => (
              <span key={item} className="flex items-center gap-3">
                {i > 0 && <span className="text-stone-300">/</span>}
                {item}
              </span>
            ))}
          </div>
        </Reveal>

        {/* The calculation instrument specimen - a code-rendered rebuild of
            the real Daily Calorie Calculator, never a screenshot; every
            field, the formula text and the arithmetic are real (see this
            file's header comment for provenance). */}
        <Reveal delay={220} className="mt-14 w-full max-w-2xl text-left">
          <div className="overflow-hidden rounded-lg border border-[#e4e4e7] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#e4e4e7] bg-[#f5f5f1] px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span aria-hidden className="size-2.5 rounded-full bg-[#f87171]/80" />
                <span aria-hidden className="size-2.5 rounded-full bg-[#fbbf24]/80" />
                <span aria-hidden className="size-2.5 rounded-full bg-[#34d399]/80" />
              </div>
              <div className="flex min-w-0 items-center gap-2 truncate font-mono text-[11px] font-medium tracking-wide text-stone-500">
                <span className="font-semibold text-[#111111]">numerspace.com</span>
                <span className="text-stone-300">/</span>
                <span className="truncate">{cal.title[lang]}</span>
              </div>
              <span className="hidden shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-emerald-800 uppercase sm:flex">
                <span aria-hidden className="size-1.5 rounded-full bg-emerald-600" />
                {t.localEngine}
              </span>
            </div>
            <div className="flex flex-col gap-4 bg-[#fafaf8] p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {cal.inputs.map((f, i) => {
                  const emphasis = i === 0 ? "confirmed" : i === 3 ? "active" : null;
                  return (
                    <div
                      key={i}
                      className={clsx(
                        "rounded-md border bg-white px-2.5 py-1.5",
                        emphasis === "confirmed" && "border-emerald-600 ring-1 ring-emerald-600/25",
                        emphasis === "active" && "border-blue-600 ring-1 ring-blue-600/20",
                        !emphasis && "border-[#e4e4e7]",
                        i === 4 && "col-span-2 sm:col-span-1",
                      )}
                    >
                      <p
                        className={clsx(
                          "font-mono text-[10px] font-semibold tracking-wide uppercase",
                          emphasis === "confirmed" ? "text-emerald-800" : emphasis === "active" ? "text-blue-700" : "text-stone-500",
                        )}
                      >
                        {f.label[lang]}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1">
                        <span className="truncate font-mono text-[13px] font-semibold text-[#111111]">{fv(f.value, lang)}</span>
                        {emphasis === "active" && (
                          <span aria-hidden className="ml-0.5 h-3.5 w-0.5 animate-pulse bg-blue-600" />
                        )}
                        {emphasis === "confirmed" && (
                          <span aria-hidden className="ml-auto size-1.5 rounded-full bg-emerald-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Formula transparency note - the arithmetic trace. */}
              <div className="flex flex-col gap-1.5 rounded-md border border-[#fef08a] bg-[#fefce8] p-3.5 font-mono text-[11.5px] leading-relaxed text-[#854d0e]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-semibold text-[#713f12]">
                    <span aria-hidden className="size-1.5 rounded-full bg-amber-600" />
                    BMR ({cal.formulaName})
                  </span>
                  <span className="rounded border border-[#fde68a] bg-[#fef3c7] px-2 py-0.5 text-[9.5px] font-bold tracking-wide text-[#b45309] uppercase">
                    {t.formulaAudit}
                  </span>
                </div>
                <p className="rounded border border-[#fef08a] bg-white/70 px-2 py-1 break-words">{cal.formula[lang]}</p>
                <p>BMR = {cal.bmr[lang]}</p>
                <div className="flex items-center justify-between pt-0.5 text-[#713f12]">
                  <span className="font-medium">{t.activityFactor}</span>
                  <span className="font-bold">{cal.activityMultiplier}</span>
                </div>
              </div>

              {/* Verified outcome. */}
              <div className="flex flex-col gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.08em] text-emerald-800 uppercase">
                    <CheckCircle2 aria-hidden className="size-3.5" />
                    {cal.resultLabel[lang]}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-2xl font-bold tracking-tight text-emerald-800">{cal.result[lang]}</span>
                  <span className="font-mono text-sm font-semibold text-emerald-700">{cal.resultUnit[lang]}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 border-t border-[#e4e4e7] bg-[#f5f5f1] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[13px] font-semibold text-[#111111]">{t.verifyCaption}</span>
              <span className="text-[12px] text-stone-500">{t.verifyNote}</span>
            </div>
          </div>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 02 · Manifesto - asymmetric editorial column ----------------------- */
function WhySection({ t }: { t: (typeof T)[Lang] }) {
  return (
    <section className="border-y border-[#e4e4e7] bg-[#f5f4f0] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer>
        <div className="grid grid-cols-1 items-baseline gap-x-6 gap-y-8 md:grid-cols-12">
          <div className="flex items-baseline justify-between md:col-span-3 md:flex-col md:items-start">
            <Kicker>{t.whyEyebrow}</Kicker>
            <span className="mt-3 hidden font-mono text-[11px] tracking-wide text-stone-500 uppercase md:block">{t.whyLabel}</span>
          </div>
          <div className="max-w-2xl md:col-span-9">
            <Reveal>
              <h2 className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-[#111111] sm:text-[2.5rem] sm:tracking-[-0.035em]">
                {t.whyTitle}
              </h2>
            </Reveal>
            <Reveal delay={70} className="mt-6 flex flex-col gap-4">
              <p className="text-[17px] leading-relaxed text-stone-600">{t.whyBody}</p>
              <p className="text-[15px] leading-relaxed text-stone-500">{t.whyBody2}</p>
            </Reveal>
            <Reveal delay={110} className="mt-8 grid grid-cols-3 gap-3 border-t border-[#d4d4d8] pt-8">
              {[
                { value: "0ms", label: t.statLatency },
                { value: "0 B", label: t.statData },
                { value: "✓", label: t.statFormulas },
              ].map((stat) => (
                <div key={stat.label} className="rounded-md border border-[#d4d4d8]/60 bg-white/60 p-2.5">
                  <div className="font-mono text-lg font-bold text-emerald-700 sm:text-xl">{stat.value}</div>
                  <div className="mt-1 font-mono text-[10px] font-semibold tracking-[0.08em] text-stone-500 uppercase">{stat.label}</div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </PortraitContainer>
    </section>
  );
}

/* ---- 03 · Categories - a structured directory, not a card grid --------- */
function CategoriesSection({ t, lang, siteHref }: { t: (typeof T)[Lang]; lang: Lang; siteHref: string }) {
  const featured = REAL.categories.filter((c) => c.featured);
  return (
    <section className="bg-[#fbfbfa] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer>
        <div className="flex flex-col justify-between gap-4 border-b border-[#e4e4e7] pb-6 md:flex-row md:items-end">
          <div>
            <Kicker className="mb-2 block">{t.catEyebrow}</Kicker>
            <h2 className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-[#111111] sm:text-[2.5rem] sm:tracking-[-0.035em]">
              {t.catTitle}
            </h2>
          </div>
          <p className="max-w-sm text-[13px] leading-relaxed text-stone-500">{t.catSub}</p>
        </div>
        <Reveal delay={80} className="flex flex-col divide-y divide-[#e4e4e7]">
          {featured.map((cat) => {
            const a = ACCENT[cat.accent];
            return (
              <div key={cat.en} className={clsx("group flex flex-col gap-y-1.5 rounded-sm px-2 py-5 transition-colors md:flex-row md:items-baseline md:justify-between md:gap-x-6", a.hoverBg)}>
                <div className="flex shrink-0 items-baseline gap-2.5 md:w-64">
                  <span aria-hidden className={clsx("size-2 shrink-0 rounded-full", a.dot)} />
                  <span className={clsx("text-[15px] font-semibold text-[#111111] transition-colors", a.hoverText)}>{cat[lang]}</span>
                </div>
                <p className="flex-1 text-[13px] leading-relaxed text-stone-500">
                  {cat.ex[lang].map((name, i) => (
                    <span key={name}>
                      {i > 0 && ", "}
                      <span className={clsx("font-medium text-[#111111] hover:underline", a.text)}>{name}</span>
                    </span>
                  ))}
                </p>
                <div className="shrink-0 pt-1 md:pt-0">
                  <span className={clsx("rounded border px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide uppercase", a.badgeBg, a.badgeText, a.badgeBorder)}>
                    {t.catCount(cat.count)}
                  </span>
                </div>
              </div>
            );
          })}
        </Reveal>
        <div className="mt-8 flex justify-center">
          <a
            href={siteHref}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 border-b border-[#111111]/30 pb-0.5 text-sm font-medium text-[#111111] transition-colors hover:text-emerald-700 hover:border-emerald-700/40"
          >
            {t.catExploreAll}
            <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </PortraitContainer>
    </section>
  );
}

/* ---- 04 · Privacy - the execution pipeline ------------------------------ */
function PrivacySection({ t }: { t: (typeof T)[Lang] }) {
  const steps = [
    { label: t.step1Label, title: t.step1Title, sub: t.step1Sub, tone: "plain" as const },
    { label: t.step2Label, title: t.step2Title, sub: t.step2Sub, tone: "brand" as const, badge: t.step2Badge },
    { label: t.step3Label, title: t.step3Title, sub: t.step3Sub, tone: "amber" as const },
  ];
  const checks = [
    { icon: Unlock, label: t.privacyPoints[0] },
    { icon: DatabaseZap, label: t.privacyPoints[1] },
    { icon: ShieldOff, label: t.privacyPoints[2] },
    { icon: EyeOff, label: t.privacyPoints[3] },
  ];
  return (
    <section className="border-y border-[#d2e7dd] bg-[#f2f8f5] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer>
        <div className="mx-auto max-w-xl text-center">
          <Kicker className="text-emerald-800">{t.privacyEyebrow}</Kicker>
          <h2 className="mt-2 text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-[#111111] sm:text-[2.5rem] sm:tracking-[-0.035em]">
            {t.privacyTitle}
          </h2>
          <p className="mt-3 text-[17px] leading-relaxed text-stone-600">{t.privacySub}</p>
        </div>

        <Reveal delay={100} className="mx-auto mt-10 max-w-3xl rounded-lg border border-[#d2e7dd] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.03)] sm:p-8">
          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.label}
                className={clsx(
                  "relative flex flex-col items-center rounded-md border p-4 text-center",
                  step.tone === "brand" && "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-600/15",
                  step.tone === "amber" && "border-[#fde68a] bg-[#fefce8]",
                  step.tone === "plain" && "border-[#e4e4e7] bg-[#fafaf9]",
                )}
              >
                {step.badge && (
                  <span className="absolute -top-2.5 flex items-center gap-1 rounded-full bg-emerald-700 px-2.5 py-0.5 font-mono text-[9px] font-semibold tracking-[0.08em] text-white uppercase shadow-sm">
                    <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-white" />
                    {step.badge}
                  </span>
                )}
                <span
                  className={clsx(
                    "font-mono text-[11px] font-semibold tracking-wide uppercase",
                    step.tone === "brand" ? "text-emerald-800" : step.tone === "amber" ? "text-[#854d0e]" : "text-stone-500",
                  )}
                >
                  {step.label}
                </span>
                <span
                  className={clsx(
                    "mt-1 text-[15px] font-semibold",
                    step.tone === "brand" ? "text-emerald-800" : step.tone === "amber" ? "text-[#713f12]" : "text-[#111111]",
                  )}
                >
                  {step.title}
                </span>
                <span
                  className={clsx(
                    "mt-1 text-[12px]",
                    step.tone === "brand" ? "text-emerald-700/80" : step.tone === "amber" ? "text-[#854d0e]/80" : "text-stone-500",
                  )}
                >
                  {step.sub}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#d2e7dd] pt-6 text-center sm:grid-cols-4">
            {checks.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <span className="grid size-8 place-items-center rounded-full bg-emerald-50">
                  <Icon aria-hidden className="size-4 text-emerald-700" />
                </span>
                <span className="font-mono text-[10px] font-semibold tracking-[0.08em] text-[#111111] uppercase">{label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 05 · FAQ - a hairline-divided list, not filled cards ---------------
   Deliberately not the shared `FaqAccordion` (used elsewhere on the site):
   that component's open/hover states are the site's own blue tokens, which
   would fight this page's ink/emerald palette. Same accessible <details>/
   <summary> pattern, this page's own visual treatment. */
function Faq({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  if (!c.faq || c.faq.length === 0) return null;
  return (
    <section className="bg-[#fbfbfa] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer className="max-w-[720px]">
        <Kicker className="mb-2 block">{t.faqEyebrow}</Kicker>
        <h2 className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-[#111111] sm:text-[2.5rem] sm:tracking-[-0.035em]">
          {t.faqTitle}
        </h2>
        <Reveal delay={80} className="mt-8 flex flex-col divide-y divide-[#e4e4e7] border-t border-[#e4e4e7]">
          {c.faq.map((item) => (
            <details key={item.id} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 marker:content-none">
                <span className="text-[16px] font-semibold text-[#111111] transition-colors group-hover:text-emerald-700">{item.q}</span>
                <span aria-hidden className="shrink-0 text-lg text-stone-400 transition-transform duration-200 group-open:rotate-45">
                  <Plus className="size-4" />
                </span>
              </summary>
              <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-stone-500">{item.a}</p>
            </details>
          ))}
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- Also in the Lab - kept from the prior pass, reskinned -------------
   Not in the reference (it has no knowledge of this site's other Lab
   projects) - real cross-links, kept rather than dropped for section-count
   fidelity. See this file's header comment. */
function OtherProjects({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  const items = c.related;
  if (items.length === 0) return null;
  return (
    <section className="border-t border-[#e4e4e7] bg-[#f5f4f0] px-5 py-16 sm:px-8 md:py-20 lg:px-12">
      <PortraitContainer>
        <Kicker className="mb-6 block text-center">{t.relatedEyebrow}</Kicker>
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item, i) => (
            <Reveal key={item.href} delay={i * 60}>
              <a
                href={item.href}
                className="group flex h-full flex-col rounded-lg border border-[#e4e4e7] bg-white p-5 transition-colors hover:border-[#d4d4d8] hover:bg-[#fafaf9]"
              >
                <p className="text-[15px] font-semibold tracking-tight text-[#111111]">{item.name}</p>
                {item.desc ? <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-stone-500">{item.desc}</p> : null}
                <div className="mt-4 flex items-center justify-between gap-3">
                  {item.proof ? (
                    <span className="font-mono text-[11px] text-stone-400 tabular-nums">{item.proof}</span>
                  ) : (
                    <span />
                  )}
                  <span className="flex items-center gap-1 text-[12.5px] font-medium text-stone-600 transition-colors group-hover:text-[#111111]">
                    {t.relatedCta}
                    <ArrowRight aria-hidden className="size-3.5" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </PortraitContainer>
    </section>
  );
}

/* ---- 06 · Closing - a light dismissal bar, not a dark full-bleed band --- */
function PageCta({ c, t, aboutHref }: { c: SkillProductContent; t: (typeof T)[Lang]; aboutHref: string }) {
  const link = c.primaryLinks[0];
  return (
    <section className="border-t border-[#e4e4e7] bg-[#fbfbfa] px-5 py-14 sm:px-8 lg:px-12">
      <PortraitContainer className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="text-center md:text-left">
          <Kicker className="mb-1 block">{t.ctaEyebrow}</Kicker>
          <h3 className="text-xl font-semibold tracking-[-0.015em] text-[#111111]">{t.ctaTitle}</h3>
        </div>
        <div className="flex items-center gap-3">
          {link && (
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#27272a]"
            >
              {t.ctaVisit}
              <ArrowUpRight aria-hidden className="size-3.5" />
            </a>
          )}
          <a
            href={aboutHref}
            className="inline-flex items-center rounded-md border border-[#e4e4e7] px-5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-[#f5f4f0] hover:text-[#111111]"
          >
            {t.ctaAbout}
          </a>
        </div>
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
  const aboutHref = lang === "en" ? "/about" : "/tr/about";

  const jsonLd: object[] = [
    breadcrumbList([
      { name: copyT.footer.home, url: home },
      { name: copyT.nav.lab, url: lang === "en" ? "/lab" : "/tr/lab" },
      { name: content.title, url: path },
    ]),
  ];
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
      <main className="font-sans">
        <Hero c={content} t={t} lang={lang} />
        <WhySection t={t} />
        <CategoriesSection t={t} lang={lang} siteHref={siteHref} />
        <PrivacySection t={t} />
        <Faq c={content} t={t} />
        <OtherProjects c={content} t={t} />
        <PageCta c={content} t={t} aboutHref={aboutHref} />
      </main>
      <SiteFooter t={copyT} lang={lang} />
    </>
  );
}
