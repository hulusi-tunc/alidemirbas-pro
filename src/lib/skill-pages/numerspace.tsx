import type { SkillProductContent } from "@/components/SkillProductPage";
import { getAllSkillProjects, getSkillProject } from "@/lib/skill-catalog";
import { withJourneyCount } from "@/lib/archive";
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

const T = {
  en: {
    eyebrow: "Lab",
    whatItDoesTitle: "What it is",
    whatItDoesBody:
      "A public calculator site: 97 tools across 13 categories - finance and investment, health and fitness, work and career, tax, time and date, marketing analytics, maths and unit conversion, home, travel, pets, clothing sizes, astrology and faith. Every tool exists in both Turkish and English, with the same 97 in each.",
    howItWorksTitle: "How it's built",
    howItWorksBody:
      "The design constraint is friction: a calculator you have to sign up for is a calculator you use once. Nothing is behind an account, a paywall, or an email field, and nothing you type leaves your browser.",
    bullets: [
      "Free with no registration - no subscription, no credit card, no email. Every tool works as a guest.",
      "Calculations run client-side. Salary, weight, birth date, loan amount - none of it is sent to a server, and it is gone when the tab closes.",
      "Fully bilingual: 97 calculators in Turkish and the same 97 in English, interface and results included.",
      "Formulas are the recognised ones - Mifflin-St Jeor, Devine, Hamwi for health - alongside Turkish tax and labour regulation (SGK, GİB) for the tools that depend on it.",
      "Responsive rather than an app: same experience on phone, tablet and desktop, nothing to download.",
      "Tools whose inputs move - tax rates, financial figures, unit values - are revised as those standards change.",
    ],
    useTitle: "How to use it",
    step1Title: "Open the site",
    step1Desc: "Pick Turkish or English with the toggle in the top-right corner; both carry the full catalogue.",
    step2Title: "Find the calculator",
    step2Desc: "Search from the home page, or go through a category - Finance, Health, Marketing and the rest.",
    step3Title: "Enter your numbers",
    step3Desc: "The result appears as you type. No account, no export step, nothing kept afterwards.",
    visit: "Open numerspace.com",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        id: "free",
        q: "Is Numerspace free?",
        a: "Yes. All 97 calculators are free to use, with no subscription, no credit card and no account required - every tool works for a guest visitor.",
      },
      {
        id: "privacy",
        q: "Does Numerspace store my inputs?",
        a: "No. The large majority of the calculators run client-side: the arithmetic happens in your own browser and is never transmitted to or stored on a server. A salary, a weight, a birth date, a loan amount - none of it survives past closing the tab.",
      },
      {
        id: "formulas",
        q: "Where do the formulas come from?",
        a: "Established formulas and official sources - Mifflin-St Jeor, Devine and Hamwi for the health calculators, and official regional rules (SGK, GİB) for the ones tied to tax and labour regulation. They're a strong reference, not professional advice - check with someone qualified for a legal, financial or medical decision.",
      },
      {
        id: "languages",
        q: "Does every calculator support Turkish and English?",
        a: "Yes. The sitemap lists 97 calculator pages in each language - the interface, the inputs and the results are all localised together, tool for tool.",
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
      "Herkese açık bir hesaplayıcı sitesi: 13 kategoride 97 araç - finans ve yatırım, sağlık ve fitness, iş ve kariyer, vergi, zaman ve tarih, pazarlama analitiği, matematik ve birim dönüşümü, ev, seyahat, evcil hayvan, kıyafet bedeni, astroloji ve inanç. Her araç hem Türkçe hem İngilizce var; ikisinde de aynı 97 araç.",
    howItWorksTitle: "Nasıl kurgulandı",
    howItWorksBody:
      "Tasarım kısıtı sürtünme: üye olman gereken bir hesaplayıcıyı bir kez kullanırsın. Hiçbir şey hesabın, ödeme duvarının ya da e-posta alanının arkasında değil; yazdığın hiçbir şey tarayıcından çıkmıyor.",
    bullets: [
      "Kayıt gerektirmeyen ücretsiz kullanım: abonelik yok, kredi kartı yok, e-posta yok. Her araç misafir kullanıcıyla çalışıyor.",
      "Hesaplamalar tarayıcıda çalışıyor. Maaş, kilo, doğum tarihi, kredi tutarı - hiçbiri sunucuya gitmiyor ve sekmeyi kapattığında siliniyor.",
      "Tam iki dilli: Türkçe 97 hesaplayıcı, İngilizce aynı 97'si - arayüz ve sonuçlar dahil.",
      "Formüller kabul görmüş olanlar - sağlık tarafında Mifflin-St Jeor, Devine, Hamwi - ve mevzuata bağlı araçlarda Türkiye mevzuatı (SGK, GİB).",
      "Uygulama değil, duyarlı tasarım: telefonda, tablette ve masaüstünde aynı deneyim, indirilecek bir şey yok.",
      "Girdileri değişen araçlar - vergi oranları, finansal veriler, birim değerleri - standartlar değiştikçe güncelleniyor.",
    ],
    useTitle: "Nasıl kullanılır",
    step1Title: "Siteyi aç",
    step1Desc: "Sağ üstteki değiştiriciyle Türkçe ya da İngilizce seç; ikisinde de katalogun tamamı var.",
    step2Title: "Hesaplayıcıyı bulun",
    step2Desc: "Ana sayfadan ara ya da bir kategoriden ilerle: Finans, Sağlık, Pazarlama ve diğerleri.",
    step3Title: "Sayıları gir",
    step3Desc: "Sonuç siz yazarken çıkıyor. Hesap yok, dışa aktarma adımı yok, sonrasında saklanan bir şey yok.",
    visit: "numerspace.com'u aç",
    faqTitle: "Sık sorulan sorular",
    faq: [
      {
        id: "free",
        q: "Numerspace ücretsiz mi?",
        a: "97 hesaplayıcının tamamı ücretsiz: abonelik yok, kredi kartı yok, hesap gerekmiyor; hepsi misafir olarak kullanılabiliyor.",
      },
      {
        id: "privacy",
        q: "Numerspace girdiğim bilgileri saklıyor mu?",
        a: "Hayır. Hesaplamaların büyük çoğunluğu doğrudan tarayıcında çalışıyor ve sunucuya hiç gönderilmiyor. Maaş, kilo, doğum tarihi, kredi tutarı: hiçbiri sekmeyi kapattıktan sonra kalmıyor.",
      },
      {
        id: "formulas",
        q: "Formüller nereden geliyor?",
        a: "Kabul görmüş formüller ve resmi kaynaklardan - sağlık hesaplayıcılarında Mifflin-St Jeor, Devine ve Hamwi; vergi ve iş mevzuatına bağlı araçlarda resmi kaynaklar (SGK, GİB). Bunlar güçlü bir referans, uzman görüşü değil - yasal, finansal ya da tıbbi bir kararda önce bir uzmana danışın.",
      },
      {
        id: "languages",
        q: "Her hesaplayıcı Türkçe ve İngilizce destekliyor mu?",
        a: "Evet. Sitemap her iki dilde de 97 hesaplayıcı sayfası listeliyor - arayüz, girdiler ve sonuçlar araç araç birlikte yerelleştirilmiş.",
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
  const t = T[lang];

  const related = getAllSkillProjects(lang)
    .filter((p) => p.slug !== SLUG)
    .slice(0, 4)
    .map((p) => ({ href: p.links[0].href, slug: p.slug, name: p.name, desc: withJourneyCount(p.desc), proof: withJourneyCount(p.proof) }));

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
