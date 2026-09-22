import type { SkillProductContent } from "@/components/SkillProductPage";
import { getAllSkillProjects, getSkillProject } from "@/lib/skill-catalog";
import { withLabProjectFacts, resolveLabCopy } from "@/lib/lab-project-facts";
import type { Lang } from "@/lib/content";

/* Numerspace's content module, consumed by the bespoke NumerspacePage.tsx
   (not the generic SkillProductPage template - see that page's own
   header comment). This module still supplies whatItDoes/howItWorks/
   installSteps for the HowTo/WebApplication JSON-LD and for `faq`/
   `related`, which the bespoke page renders as-is.

   The FAQ's old "finding" question (how do I find a calculator) was
   dropped this pass - NumerspacePage.tsx's own Categories section, new
   this pass, now answers that visually, so the question was redundant
   rather than removed for length alone.

   Numerspace is the one Lab project that is a hosted product rather than
   a repository, and that changes what this page is FOR. The other five
   pages exist because the thing itself lives on GitHub and needs
   somewhere legible to be described. Numerspace has its own site, so
   this page is not a substitute for it - it is the portfolio entry:
   what was built, at what scale, on what principles, with one door out
   to the real thing.

   That is also why the stepper below is headed "How to use it" rather
   than "Install". There is nothing to install, and running the template's
   install copy over a hosted web app would be the template dictating the
   content instead of the other way round.

   EVERY NUMBER AND CLAIM IS TAKEN FROM THE LIVE SITE, not from the
   one-line project description. numerspace.com's sitemap was fetched and
   counted, and its own FAQ (published as JSON-LD on the EN and TR home
   pages) is where the answers below come from - in each language, in
   that language's own words, rather than a translation of the English.

   Counted from the sitemap (293 URLs):
     - 97 calculator pages in EN and 97 in TR - exact parity, which is
       what makes the bilingual claim safe to state as a fact
     - 13 categories own those tools; 15 category hubs exist in total
       (Tax and Unit Converter are hub pages whose tools are cross-listed
       under other categories, so they are not counted as owning any)
     - 29 EN and 34 TR blog posts, deliberately NOT counted as tools

   The site's own marketing says "140+" and its FAQ says "hundreds of
   tools"; neither is repeated here. 97 is what the sitemap actually
   lists, and a portfolio page that inflates its own numbers is worse
   than one that undersells them. Same reason the project's `proof` line
   was corrected from a stale "75+ tools" in the same change. */

export const NUMERSPACE_PAGE_COPY = {
  en: {
    eyebrow: "Lab",
    heroTitle: "{numerspaceCount} calculators, no account required.",
    heroSub: "Free calculators for everyday questions, from money and health to work, time and marketing.",
    ctaVisit: "Open numerspace.com",
    heroStats: ["{numerspaceCount} calculators", "{numerspaceCategories} categories", "Turkish + English"],
    verifyCaption: "You can check the result yourself.",
    verifyNote: "Where a calculator uses a standard formula, the formula is shown alongside the result.",

    whyEyebrow: "Project",
    whyTitle: "Open a calculator, enter what you know, and get the result.",
    whyBody: "I built Numerspace as a collection of practical calculators in Turkish and English. Open a tool, enter the inputs, and see the result without creating an account. Most calculations run in the browser, so the values you enter are not sent to a server.",

    catEyebrow: "Categories",
    catTitle: "Categories",
    catSub: "From finance and health to work, travel and everyday sums. {numerspaceCount} calculators in {numerspaceCategories} categories.",
    catExploreAll: "See all {numerspaceCategories} categories",
    catBrowse: "Browse by category",
    heroShotAlt: "numerspace.com's homepage: a search field over category sections of calculator cards.",

    faqEyebrow: "FAQ",

    relatedEyebrow: "Also in the Lab",
    relatedCta: "Explore",

    ctaEyebrow: "Free, no account",
    ctaTitle: "Try a calculator and check the result yourself.",
  },
  tr: {
    eyebrow: "Lab",
    heroTitle: "{numerspaceCount} hesaplayıcı, üyelik gerekmiyor.",
    heroSub: "Paradan sağlığa, işten zamana ve pazarlamaya kadar günlük sorular için ücretsiz hesaplayıcılar.",
    ctaVisit: "numerspace.com'u aç",
    heroStats: ["{numerspaceCount} hesaplayıcı", "{numerspaceCategories} kategori", "Türkçe + İngilizce"],
    verifyCaption: "Sonucu kendin kontrol edebilirsin.",
    verifyNote: "Bir hesaplayıcı standart bir formül kullandığında, formül sonuçla birlikte gösterilir.",

    whyEyebrow: "Proje",
    whyTitle: "Aracı aç, bilgileri gir, sonucu gör.",
    whyBody: "Numerspace'i Türkçe ve İngilizce çalışan pratik hesaplayıcılardan oluşan bir site olarak kurdum. Aracı aç, bilgileri gir ve hesap oluşturmadan sonucu gör. Hesaplamaların çoğu tarayıcıda çalıştığı için girdiğin değerler sunucuya gönderilmez.",

    catEyebrow: "Kategoriler",
    catTitle: "Kategoriler",
    catSub: "Finans ve sağlıktan işe, seyahate ve gündelik hesaplamalara. {numerspaceCategories} kategoride {numerspaceCount} hesaplayıcı.",
    catExploreAll: "{numerspaceCategories} kategorinin tamamını gör",
    catBrowse: "Kategoriye göre göz at",
    heroShotAlt: "numerspace.com'un ana sayfası: hesaplayıcı kartlarından oluşan kategori bölümlerinin üstünde bir arama alanı.",

    faqEyebrow: "SSS",

    relatedEyebrow: "Lab'de ayrıca",
    relatedCta: "Keşfet",

    ctaEyebrow: "Ücretsiz, üyelik gerekmiyor",
    ctaTitle: "Bir hesaplayıcı dene, sonucu kendin kontrol et.",
  },
} as const;

const T = {
  en: {
    eyebrow: "Lab",
    whatItDoesTitle: "What it is",
    whatItDoesBody:
      "A public calculator site. {numerspaceCount} tools in {numerspaceCategories} categories: finance and investing, health and fitness, work and career, tax, time and dates, marketing analytics, math and unit conversion, home, travel, pets, clothing sizes, astrology and faith. Every tool in both Turkish and English.",
    howItWorksTitle: "How it's built",
    howItWorksBody:
      "The site is built to keep the calculation itself simple. No calculator sits behind an account, paywall or email form; you can open a tool and use it straight away.",
    bullets: [
      "Free with no registration - no subscription, no credit card, no email. Every tool works as a guest.",
      "Most calculations run in the browser. A salary, a weight, a birth date, a loan amount: none of it is stored on a server, and it's gone when you close the tab.",
      "Fully bilingual: {numerspaceCount} calculators in Turkish and the same {numerspaceCount} in English, interface and results included.",
      "Formulas are the recognised ones - Mifflin-St Jeor, Devine, Hamwi for health - alongside Turkish tax and labour regulation (SGK, GİB) for the tools that depend on it.",
      "A responsive website rather than a native app: the same tools work on phone, tablet and desktop, with nothing to download.",
      "Tools whose inputs move - tax rates, financial figures, unit values - are revised as those standards change.",
    ],
    useTitle: "How to use it",
    step1Title: "Open the site",
    step1Desc: "Pick Turkish or English with the toggle in the top-right corner; both carry the full catalogue.",
    step2Title: "Find the calculator",
    step2Desc: "Search from the home page, or go through a category - Finance, Health, Marketing and the rest.",
    step3Title: "Enter your numbers",
    step3Desc: "The result updates as you enter the inputs. No account or export step is required, and most tools keep the calculation in the browser.",
    visit: "Open numerspace.com",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        id: "free",
        q: "Is Numerspace free?",
        a: "Yes. All {numerspaceCount} calculators are free to use, with no subscription, no credit card and no account required - every tool works for a guest visitor.",
      },
      {
        id: "privacy",
        q: "Does Numerspace store my inputs?",
        a: "No. The large majority of the calculators run client-side: the arithmetic happens in your own browser and is never transmitted to or stored on a server. A salary, a weight, a birth date, a loan amount - none of it survives past closing the tab.",
      },
      {
        id: "formulas",
        q: "Where do the formulas come from?",
        a: "Established formulas and official sources. Mifflin-St Jeor, Devine and Hamwi for the health calculators; SGK and GİB for the tools tied to Turkish tax and labour rules. The results are for information. Talk to a professional before a legal, financial or medical decision.",
      },
      {
        id: "languages",
        q: "Does every calculator support Turkish and English?",
        a: "Yes. The sitemap lists {numerspaceCount} calculator pages in each language - the interface, the inputs and the results are all localised together, tool for tool.",
      },
      {
        id: "requests",
        q: "Can I suggest a calculator?",
        a: "Yes - the contact page takes suggestions, and requests are reviewed and added to the roadmap. The same page is where an incorrect formula or an out-of-date regulation should be reported.",
      },
    ],
    relatedTitle: "Other Lab projects",
  },
  tr: {
    eyebrow: "Lab",
    whatItDoesTitle: "Nedir",
    whatItDoesBody:
      "Herkese açık bir hesaplayıcı sitesi. {numerspaceCategories} kategoride {numerspaceCount} araç: finans ve yatırım, sağlık ve fitness, iş ve kariyer, vergi, zaman ve tarih, pazarlama analitiği, matematik ve birim dönüşümü, ev, seyahat, evcil hayvan, kıyafet bedeni, astroloji ve inanç. Her araç hem Türkçe hem İngilizce.",
    howItWorksTitle: "Nasıl kurgulandı",
    howItWorksBody:
      "Site, hesabı mümkün olduğunca aradan çıkarmak için kurgulandı. Hiçbir hesaplayıcı üyelik, ödeme duvarı veya e-posta formunun arkasında değil; aracı açıp doğrudan kullanabilirsin.",
    bullets: [
      "Kayıt gerektirmeyen ücretsiz kullanım. Abonelik yok, kredi kartı yok, e-posta yok.",
      "Hesaplamaların çoğu tarayıcıda çalışır. Maaş, kilo, doğum tarihi, kredi tutarı sunucuda saklanmaz ve sekmeyi kapattığında silinir.",
      "Tam iki dilli. Türkçe {numerspaceCount} hesaplayıcı, İngilizce aynı {numerspaceCount}'si; arayüz ve sonuçlar dahil.",
      "Formüller kabul görmüş olanlar. Sağlıkta Mifflin-St Jeor, Devine, Hamwi; mevzuata bağlı araçlarda Türkiye mevzuatı (SGK, GİB).",
      "Native uygulama değil, responsive bir web sitesi. Telefonda, tablette ve masaüstünde aynı araçlar çalışır; indirilecek bir şey yok.",
      "Vergi oranı, finansal veri veya birim değeri gibi güncel girdilere bağlı araçlar, bu değerler değiştikçe güncellenir.",
    ],
    useTitle: "Nasıl kullanılır",
    step1Title: "Siteyi aç",
    step1Desc: "Sağ üstteki değiştiriciyle Türkçe ya da İngilizce seç; ikisinde de katalogun tamamı var.",
    step2Title: "Hesaplayıcıyı bul",
    step2Desc: "Ana sayfadan ara ya da bir kategoriden ilerle: Finans, Sağlık, Pazarlama ve diğerleri.",
    step3Title: "Sayıları gir",
    step3Desc: "Sonuç bilgileri girdikçe güncellenir. Hesap açman veya bir şey dışa aktarman gerekmez; hesaplamaların çoğu tarayıcıda kalır.",
    visit: "numerspace.com'u aç",
    faqTitle: "Sık sorulan sorular",
    faq: [
      {
        id: "free",
        q: "Numerspace ücretsiz mi?",
        a: "{numerspaceCount} hesaplayıcının tamamı ücretsiz: abonelik yok, kredi kartı yok, hesap gerekmiyor; hepsi misafir olarak kullanılabiliyor.",
      },
      {
        id: "privacy",
        q: "Numerspace girdiğim bilgileri saklıyor mu?",
        a: "Hayır. Hesaplamaların büyük çoğunluğu doğrudan tarayıcında çalışıyor ve sunucuya hiç gönderilmiyor. Maaş, kilo, doğum tarihi, kredi tutarı: hiçbiri sekmeyi kapattıktan sonra kalmıyor.",
      },
      {
        id: "formulas",
        q: "Formüller nereden geliyor?",
        a: "Kabul görmüş formüller ve resmi kaynaklar. Sağlık hesaplayıcılarında Mifflin-St Jeor, Devine ve Hamwi; vergi ve iş mevzuatına bağlı araçlarda SGK ve GİB. Sonuçlar bilgi amaçlı. Hukuki, finansal ya da tıbbi bir karar vermeden önce bir uzmana danış.",
      },
      {
        id: "languages",
        q: "Her hesaplayıcı Türkçe ve İngilizce destekliyor mu?",
        a: "Evet. Her iki dilde de {numerspaceCount} hesaplayıcı var; arayüz, girdiler ve sonuçlar araç araç birlikte yerelleştirilmiş.",
      },
      {
        id: "requests",
        q: "Bir hesaplayıcı önerebilir miyim?",
        a: "İletişim sayfası önerileri alıyor; talepler değerlendirilip yol haritasına ekleniyor. Hatalı bir formülü ya da eskimiş bir mevzuatı da aynı sayfadan bildirebilirsin.",
      },
    ],
    relatedTitle: "Diğer Lab projeleri",
  },
} as const;

const SLUG = "numerspace";
const SITE = "https://www.numerspace.com";

export function getNumerspaceContent(lang: Lang): SkillProductContent | null {
  const project = getSkillProject(lang, SLUG);
  if (!project) return null;
  const t = resolveLabCopy(T[lang]);

  const related = getAllSkillProjects(lang)
    .filter((p) => p.slug !== SLUG)
    .slice(0, 4)
    .map((p) => ({ href: p.links[0].href, slug: p.slug, name: p.name, desc: withLabProjectFacts(p.desc), proof: withLabProjectFacts(p.proof) }));

  /* The site link, in the language the reader is already in - the /en and
     /tr entry points are the site's own, confirmed by following its root
     redirect (numerspace.com -> /en). Sending a Turkish reader to the
     English catalogue would be a worse door than the one the card
     already had. */
  const href = `${SITE}/${lang}`;

  return {
    slug: SLUG,
    eyebrow: t.eyebrow,
    title: project.name,
    sub: project.desc,
    primaryLinks: [{ label: t.visit, href }],
    whatItDoes: {
      title: t.whatItDoesTitle,
      body: t.whatItDoesBody,
      bullets: [...project.tags],
    },
    howItWorks: {
      title: t.howItWorksTitle,
      body: t.howItWorksBody,
      bullets: [...t.bullets],
    },
    installTitle: t.useTitle,
    installSteps: [
      {
        n: 1,
        title: t.step1Title,
        desc: t.step1Desc,
        content: (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            {t.visit} →
          </a>
        ),
      },
      { n: 2, title: t.step2Title, desc: t.step2Desc },
      { n: 3, title: t.step3Title, desc: t.step3Desc },
    ],
    faqTitle: t.faqTitle,
    faq: [...t.faq],
    relatedTitle: t.relatedTitle,
    related,
    // A hosted calculator site with nothing to install and no account -
    // "UtilitiesApplication" rather than this site's own "BusinessApplication"
    // calculators, since Numerspace spans finance, health, career and more,
    // not marketing metrics specifically.
    appSchema: { type: "WebApplication", applicationCategory: "UtilitiesApplication" },
  };
}
