import type { SkillProductContent } from "@/components/SkillProductPage";
import { getAllSkillProjects, getSkillProject } from "@/lib/skill-catalog";
import { withJourneyCount } from "@/lib/archive";
import type { Lang } from "@/lib/content";

/* Numerspace's page on this site.

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
      "Formulas are the recognised ones - Mifflin-St Jeor, Devine, Hamwi for health - alongside regional tax and labour regulation for the tools that depend on it.",
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
        q: "Is it really free, and is there an account?",
        a: "All the calculators are free, and there is no registration system at all - no subscription, no credit card, no email address. Every tool runs for a guest visitor, so nothing is locked behind signing up.",
      },
      {
        id: "privacy",
        q: "Is what I type stored anywhere?",
        a: "No. The large majority of the calculators run client-side, which means the arithmetic happens in your own browser. A salary, a weight, a birth date, a loan amount - none of it is transmitted to or stored on a server, and it is erased the moment you close the tab.",
      },
      {
        id: "languages",
        q: "Which languages does it support?",
        a: "Turkish and English, switched from the toggle in the top-right corner. It is not a partial translation: the sitemap lists 97 calculator pages in each language, and the interface and results are localised along with the tools.",
      },
      {
        id: "accuracy",
        q: "How reliable are the results?",
        a: "The tools are built on recognised formulas - Mifflin-St Jeor, Devine and Hamwi among the health ones - and on official regional sources for the tools that depend on regulation, such as tax and labour rules. They are a strong reference rather than professional advice: for a legal, financial or medical decision, check with someone qualified before acting.",
      },
      {
        id: "finding",
        q: "How do I find a specific calculator?",
        a: "Either search from the home page, or work down through a category. The catalogue is organised into 13 tool-bearing categories, from Finance and Health to Marketing Analytics and Unit Conversion.",
      },
      {
        id: "requests",
        q: "Can I ask for a calculator that isn't there?",
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
      "Tasarım kısıtı sürtünme: üye olmanız gereken bir hesaplayıcıyı bir kez kullanırsınız. Hiçbir şey hesabın, ödeme duvarının ya da e-posta alanının arkasında değil; yazdığınız hiçbir şey tarayıcınızdan çıkmıyor.",
    bullets: [
      "Kayıt gerektirmeyen ücretsiz kullanım - abonelik yok, kredi kartı yok, e-posta yok. Her araç misafir kullanıcıyla çalışıyor.",
      "Hesaplamalar tarayıcıda çalışıyor. Maaş, kilo, doğum tarihi, kredi tutarı - hiçbiri sunucuya gitmiyor ve sekmeyi kapattığınızda siliniyor.",
      "Tam iki dilli: Türkçe 97 hesaplayıcı, İngilizce aynı 97'si - arayüz ve sonuçlar dahil.",
      "Formüller kabul görmüş olanlar - sağlık tarafında Mifflin-St Jeor, Devine, Hamwi - ve mevzuata bağlı araçlarda Türkiye mevzuatı (SGK, GİB, TÜFE).",
      "Uygulama değil, duyarlı tasarım: telefonda, tablette ve masaüstünde aynı deneyim, indirilecek bir şey yok.",
      "Girdileri değişen araçlar - vergi oranları, finansal veriler, birim değerleri - standartlar değiştikçe güncelleniyor.",
    ],
    useTitle: "Nasıl kullanılır",
    step1Title: "Siteyi açın",
    step1Desc: "Sağ üstteki değiştiriciyle Türkçe ya da İngilizce seçin; ikisinde de katalogun tamamı var.",
    step2Title: "Hesaplayıcıyı bulun",
    step2Desc: "Ana sayfadan arayın ya da bir kategoriden ilerleyin - Finans, Sağlık, Pazarlama ve diğerleri.",
    step3Title: "Sayıları girin",
    step3Desc: "Sonuç siz yazarken çıkıyor. Hesap yok, dışa aktarma adımı yok, sonrasında saklanan bir şey yok.",
    visit: "numerspace.com'u aç",
    faqTitle: "Sık sorulan sorular",
    faq: [
      {
        id: "free",
        q: "Gerçekten ücretsiz mi, üyelik var mı?",
        a: "Hesaplayıcıların tamamı ücretsiz ve kayıt sistemi hiç yok - abonelik, kredi kartı ya da e-posta kaydı gerekmiyor. Her araç misafir kullanıcıyla çalışıyor, yani hiçbiri üyelik arkasında değil.",
      },
      {
        id: "privacy",
        q: "Girdiğim bilgiler bir yerde saklanıyor mu?",
        a: "Hayır. Hesaplamaların büyük çoğunluğu doğrudan tarayıcınızda çalışıyor. Maaş, kilo, doğum tarihi, kredi tutarı - hiçbiri sunucuya gönderilmiyor ya da saklanmıyor; sayfayı kapattığınız anda siliniyor.",
      },
      {
        id: "languages",
        q: "Hangi dilleri destekliyor?",
        a: "Türkçe ve İngilizce; sağ üst köşedeki düğmeyle geçiliyor. Kısmi bir çeviri değil: sitemap her iki dilde de 97 hesaplayıcı sayfası listeliyor, arayüz ve sonuçlar da araçlarla birlikte yerelleştirilmiş.",
      },
      {
        id: "accuracy",
        q: "Sonuçlar ne kadar güvenilir?",
        a: "Araçlar kabul görmüş formüllere - sağlık tarafında Mifflin-St Jeor, Devine, Hamwi - ve mevzuata bağlı araçlarda resmî kaynaklara (SGK, GİB, TÜFE) dayanıyor. Sonuçlar güçlü bir referans; uzman görüşü değil. Yasal, finansal ya da tıbbi bir kararda adımı atmadan önce bir uzmana danışın.",
      },
      {
        id: "finding",
        q: "Belirli bir hesaplayıcıyı nasıl bulurum?",
        a: "Ya ana sayfadan arayın ya da kategoriden ilerleyin. Katalog, Finans ve Sağlık'tan Pazarlama Analitiği ve Birim Dönüşümü'ne kadar araç barındıran 13 kategoriye ayrılmış.",
      },
      {
        id: "requests",
        q: "Sitede olmayan bir hesaplayıcı isteyebilir miyim?",
        a: "Evet - iletişim sayfası önerileri alıyor, talepler değerlendirilip yol haritasına ekleniyor. Hatalı bir formülü ya da eskimiş bir mevzuatı da aynı sayfadan bildirebilirsiniz.",
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
    .map((p) => ({ href: p.links[0].href, name: p.name, desc: withJourneyCount(p.desc) }));

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
  };
}
