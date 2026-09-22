import { Terminal } from "lucide-react";

import type { SkillProductContent } from "@/components/SkillProductPage";
import { getAllSkillProjects, getSkillProject, githubUrl } from "@/lib/skill-catalog";
import { withLabProjectFacts, resolveLabCopy } from "@/lib/lab-project-facts";
import type { Lang } from "@/lib/content";

/* dashboard-builder's content module, consumed by the bespoke
   DashboardBuilderPage.tsx (not the generic SkillProductPage template -
   see that page's own header comment for why it moved off it).

   `name`/`desc`/`tags`/`links` are copied verbatim from the existing
   copy.lab.projects entry in content.ts. The three install methods
   (marketplace, local plugin clone, skills CLI) are the repo's own
   README "Install" section, read directly - not invented. The FAQ was
   written after cloning ali-demirbas/dashboard-builder and reading
   README.md, comparability-rules.md, data-quality-gate.md,
   kpi-framework.md and analysis-playbook.md in full; every claim in it
   (the comparability engine's four states, the 11-template filter
   logic, the insight engine's 8-question gate and SUPPRESS, and the
   "no real account data" rule from CLAUDE.md) traces to that reading,
   not to this page's own guess. The installSteps below feed only the
   HowTo JSON-LD (title/desc) - DashboardBuilderPage.tsx renders its own
   CodeTabs with the same three real commands, the way
   ChangeHistoryExplorerPage.tsx already does for its own install
   section. */

export const DASHBOARD_BUILDER_PAGE_COPY = {
  en: {
    eyebrow: "Lab / Dashboard Builder",
    heroTitle: "Shows which metrics are actually comparable.",
    heroSub:
      "A Claude Code plugin for marketing and growth data. Before it draws a chart, it checks which metrics can be compared and leaves out combinations that would be misleading.",
    proof: ["{dashboardTemplateCount} dashboard templates", "No real account data in the repo"],

    pipelineNote: "Each stage runs once on the same data. The dashboard and the deck are two outputs of one analysis, not two separate calculations.",

    compEyebrow: "Comparability check",
    compTitle: "Every number is classified before it's shown.",
    compSub: "Numbers fall into four classes.",
    compWorkedLabel: "The report template used when a rule fires. A real example.",
    refusalNotComparable: "Not comparable",
    refusalAsked: "What was asked",
    refusalWhy: "Why it fails",
    refusalCanSay: "What can still be said",
    refusalFix: "To make it comparable",
    revenueLabel: "Revenue by source",
    naiveSumLabel: 'Naive "Total Revenue"',
    trueTotalLabel: "Actual total (Shopify, system of record)",

    gateEyebrow: "Before any number is trusted",
    gateTitle: "Every metric is labeled, every dataset is checked.",
    gateSub: "Two checks run before analysis starts. How reliable the metric mapping is, and how serious the data quality problem is.",
    registryLabel: "Metric mapping confidence",
    qualityLabel: "Data quality severity",

    insightEyebrow: "Insight check",
    insightTitle: "A finding passes eight questions before it's shown.",
    insightSub: "No score, just rules. A finding that fails any of the first three is never shown.",
    ifNoLabel: "If no:",
    suppressQuote: '"If a finding fails the first three checks, it is not shown."',

    templatesEyebrow: "Dashboards & Presentations",
    templatesTitle: "{dashboardTemplateCount} templates. Only the ones your data actually supports.",
    templatesSub: "Two kinds of template: ones for mixed, multi-domain datasets and ones for a single specific data shape. The same analysis renders as a dashboard or a deck.",
    templatesFilterNote: "Template selection passes three filters. Data shape, business question, available evidence. No hand-picked vertical template.",

    installEyebrow: "Install",
    installTitle: "Install",
    installSub: "Three ways in, all from the repository's own README.",
    stepAdd: "Add the plugin to Claude Code",
    stepTest: "Run the tests",
    tabMarketplace: "Marketplace",
    tabLocal: "Local plugin",
    tabSkillsCli: "Skills CLI",
    testNote: "17 tests pass on the current clone.",
    viewRepo: "Read the repo",

    faqEyebrow: "FAQ",
    ctaEyebrow: "OPEN SOURCE",
    ctaTitle: "See what your data can support.",
  },
  tr: {
    eyebrow: "Lab / Dashboard Oluşturucu",
    heroTitle: "Hangi metriklerin gerçekten karşılaştırılabileceğini gösterir.",
    heroSub:
      "Pazarlama ve büyüme verisi için bir Claude Code eklentisi. Grafik çizmeden önce hangi metriklerin karşılaştırılabilir olduğunu kontrol eder; yanıltıcı olacak eşleşmeleri dışarıda bırakır.",
    proof: ["{dashboardTemplateCount} dashboard şablonu", "Repoda gerçek hesap verisi yok"],

    pipelineNote: "Her aşama aynı veri üzerinde bir kez çalışır. Dashboard ve sunum aynı analizin iki farklı çıktısı, iki ayrı hesap değil.",

    compEyebrow: "Karşılaştırılabilirlik kontrolü",
    compTitle: "Her sayı gösterilmeden önce sınıflandırılır.",
    compSub: "Sayılar dört sınıfa ayrılır.",
    compWorkedLabel: "Bir kural tetiklendiğinde kullanılan rapor şablonu, gerçek bir örnek",
    refusalNotComparable: "Karşılaştırılamaz",
    refusalAsked: "Ne soruldu",
    refusalWhy: "Neden başarısız",
    refusalCanSay: "Yine de söylenebilen",
    refusalFix: "Karşılaştırılabilir yapmak için",
    revenueLabel: "Kaynağa göre gelir",
    naiveSumLabel: 'Saf "Toplam Gelir"',
    trueTotalLabel: "Gerçek toplam (Shopify, sistem kaydı)",

    gateEyebrow: "Bir sayıya güvenilmeden önce",
    gateTitle: "Her metrik etiketlenir, her veri seti kontrolden geçer.",
    gateSub: "Analiz başlamadan önce iki kontrol çalışır. Metrik eşlemesi ne kadar güvenilir, veri kalitesi sorunu ne kadar ciddi.",
    registryLabel: "Metrik eşleme güveni",
    qualityLabel: "Veri kalitesi ciddiyeti",

    insightEyebrow: "İçgörü kontrolü",
    insightTitle: "Bir bulgu gösterilmeden önce sekiz sorudan geçer.",
    insightSub: "Puan yok, kural var. İlk üç soruyu geçemeyen bulgu hiç gösterilmez.",
    ifNoLabel: "Hayırsa:",
    suppressQuote: '"İlk üç kontrolden geçmeyen bulgu gösterilmez."',

    templatesEyebrow: "Dashboard'lar ve Sunumlar",
    templatesTitle: "{dashboardTemplateCount} şablon. Yalnızca verinin desteklediği olanlar sunulur.",
    templatesSub:
      "İki tür şablon var. Karma, çok alanlı veri setleri için olanlar ve tek bir belirli veri şekli için olanlar. Aynı analiz dashboard ya da sunum olarak çıkar.",
    templatesFilterNote: "Şablon seçimi üç filtreden geçer. Verinin şekli, iş sorusu, eldeki kanıt. Elle seçilen sektör şablonu yok.",

    installEyebrow: "Kurulum",
    installTitle: "Kurulum",
    installSub: "Reponun kendi README'sinden üç kurulum yolu.",
    stepAdd: "Eklentiyi Claude Code'a ekle",
    stepTest: "Testleri çalıştır",
    tabMarketplace: "Marketplace",
    tabLocal: "Yerel eklenti",
    tabSkillsCli: "Skills CLI",
    testNote: "Mevcut klonda 17 test geçiyor.",
    viewRepo: "Repoyu oku",

    faqEyebrow: "SSS",
    ctaEyebrow: "AÇIK KAYNAK",
    ctaTitle: "Verinin hangi sonuçları desteklediğini gör.",
  },
} as const;

const T = {
  en: {
    eyebrow: "Lab",
    installTitle: "Install",
    step1Title: "As a Claude Code plugin",
    step1Desc: "Add the marketplace, then install the plugin.",
    step2Title: "Or clone it as a local plugin",
    step2Desc: "No marketplace step - point Claude Code at the folder directly.",
    step3Title: "Or install with the skills CLI",
    step3Desc: "skills.sh installs every plugin in the repo with one command.",
    viewRepo: "View the repository",
    whatItDoesTitle: "What it does",
    howItWorksTitle: "Built as",
    relatedTitle: "Other Lab projects",
    repoLabel: "View on GitHub",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        id: "does-it-fix-my-numbers",
        q: "Does it fix or reconcile numbers that don't match?",
        a: "No. It explains why they don't match and says what each number is actually valid for. The comparability check classifies the mismatch (attribution window, denominator, counting unit); it doesn't pick a winner or average the two. Reconciliation here means naming the mechanism behind the gap, not producing one blended figure.",
      },
      {
        id: "which-templates",
        q: "How does it decide which of the {dashboardTemplateCount} dashboard templates to offer?",
        a: "It checks three things in order: what the data structure can support, which business question is being asked, and what the data can answer with a defensible level of confidence. Only templates that pass all three are offered; it does not force a vertical template onto data that cannot support it.",
      },
      {
        id: "why-not-more-observations",
        q: "Why does it sometimes surface fewer than 5 observations, or none?",
        a: "Every candidate finding passes eight checks before it is shown: whether the movement is real, statistically supportable, material, economically meaningful and actionable, among others. Anything that fails one of the first three checks is left out, so the output can stay short when the data does not support more.",
      },
      {
        id: "real-account-data",
        q: "Does the repo contain real account or business data?",
        a: "No. The repo's own maintenance rules don't allow it. Every example and test dataset is either synthetic or a cited public source. Never a real account export.",
      },
    ],
  },
  tr: {
    eyebrow: "Lab",
    installTitle: "Kurulum",
    step1Title: "Claude Code eklentisi olarak",
    step1Desc: "Önce marketplace'i ekle, sonra eklentiyi kur.",
    step2Title: "Ya da yerel eklenti olarak klonla",
    step2Desc: "Marketplace adımı yok; Claude Code'u doğrudan klasöre yönlendir.",
    step3Title: "Ya da skills CLI ile kur",
    step3Desc: "skills.sh, repodaki her eklentiyi tek komutla kurar.",
    viewRepo: "Repoyu oku",
    whatItDoesTitle: "Ne işe yarar",
    howItWorksTitle: "Nasıl geliştirildi",
    relatedTitle: "Diğer Lab projeleri",
    repoLabel: "GitHub'da görüntüle",
    faqTitle: "Sık sorulan sorular",
    faq: [
      {
        id: "does-it-fix-my-numbers",
        q: "Uyuşmayan sayıları düzeltiyor ya da uzlaştırıyor mu?",
        a: "Hayır. Neden uyuşmadıklarını açıklar ve her birinin gerçekte ne için geçerli olduğunu söyler. Karşılaştırılabilirlik kontrolü uyuşmazlığı sınıflandırır (attribution penceresi, payda, sayım birimi); kazanan seçmez, ikisini ortalamaz. Buradaki uzlaştırma tek bir rakam üretmek değil, farkın mekanizmasını adlandırmak.",
      },
      {
        id: "which-templates",
        q: "{dashboardTemplateCount} dashboard şablonundan hangisini sunacağına nasıl karar veriyor?",
        a: "Üç şeye sırayla bakar: verinin yapısı neyi destekliyor, hangi iş sorusu soruluyor ve veri bunu ne kadar güvenilir biçimde yanıtlayabiliyor. Yalnızca üçünü de geçen şablonlar sunulur; verinin desteklemediği bir sektör şablonu zorla seçilmez.",
      },
      {
        id: "why-not-more-observations",
        q: "Bazen neden 5'ten az gözlem, hatta hiç gözlem çıkmıyor?",
        a: "Her aday bulgu gösterilmeden önce sekiz kontrolden geçer: hareket gerçek mi, istatistiksel olarak desteklenebilir mi, anlamlı mı, ekonomik etkisi var mı, aksiyona dönüşebilir mi ve benzeri. İlk üç kontrolden birini geçemeyen bulgu gösterilmez; veri daha fazlasını desteklemiyorsa çıktı kısa kalır.",
      },
      {
        id: "real-account-data",
        q: "Repo gerçek hesap ya da işletme verisi içeriyor mu?",
        a: "Hayır. Reponun kendi bakım kuralları buna izin vermiyor. Her örnek ve test verisi ya sentetik ya da kaynağı gösterilen bir kamu verisi. Gerçek bir hesap dışa aktarımı yok.",
      },
    ],
  },
} as const;

export function getDashboardBuilderContent(lang: Lang): SkillProductContent | null {
  const project = getSkillProject(lang, "dashboard-builder");
  if (!project) return null;
  const t = resolveLabCopy(T[lang]);
  const repo = githubUrl(project);

  const related = getAllSkillProjects(lang)
    .filter((p) => p.slug !== "dashboard-builder")
    .slice(0, 4)
    .map((p) => ({ href: p.links[0].href, name: p.name, desc: withLabProjectFacts(p.desc) }));

  return {
    slug: "dashboard-builder",
    eyebrow: t.eyebrow,
    title: project.name,
    sub: project.desc,
    primaryLinks: project.links.map((l) => ({ label: l.label, href: l.href })),
    whatItDoes: { title: t.whatItDoesTitle, body: project.desc, bullets: [...project.tags] },
    howItWorks: undefined,
    installTitle: t.installTitle,
    installSteps: [
      {
        n: 1,
        title: t.step1Title,
        desc: t.step1Desc,
        content: (
          <code className="block whitespace-pre rounded-md border border-line bg-ink-950 px-4 py-3 font-mono text-xs text-white/85">
            {"/plugin marketplace add ali-demirbas/dashboard-builder\n/plugin install dashboard-builder@dashboard-builder"}
          </code>
        ),
      },
      {
        n: 2,
        title: t.step2Title,
        desc: t.step2Desc,
        content: repo ? (
          <code className="block whitespace-pre rounded-md border border-line bg-ink-950 px-4 py-3 font-mono text-xs text-white/85">
            {`git clone ${repo}.git\nclaude --plugin-dir ./dashboard-builder`}
          </code>
        ) : undefined,
      },
      {
        n: 3,
        title: t.step3Title,
        desc: t.step3Desc,
        content: (
          <code className="block rounded-md border border-line bg-ink-950 px-4 py-3 font-mono text-xs text-white/85">
            npx skills add ali-demirbas/dashboard-builder --all
          </code>
        ),
      },
    ],
    faq: t.faq.map((f) => ({ id: f.id, q: f.q, a: f.a })),
    relatedTitle: t.relatedTitle,
    related,
    // A repository/plugin, not a hosted app - "Built and tested as a Claude
    // Code plugin" (step2Desc above) is the page's own real claim, restated
    // here rather than invented for the schema.
    appSchema: {
      type: "SoftwareApplication",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Cross-platform (Claude Code plugin)",
    },
  };
}

// Exported for the InstallationStepper's ToolSelectorCards, if a future
// pass adds a real multi-tool picker to this specific page.
export const DASHBOARD_BUILDER_TOOL_ICON = Terminal;
