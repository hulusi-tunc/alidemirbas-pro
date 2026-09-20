import { Terminal } from "lucide-react";

import type { SkillProductContent } from "@/components/SkillProductPage";
import { getAllSkillProjects, getSkillProject, githubUrl } from "@/lib/skill-catalog";
import { withJourneyCount } from "@/lib/archive";
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
        q: "How does it decide which of the 11 dashboard templates to offer?",
        a: "Three filters, in order. What the data's structure can support, which business question is being asked, and what the data can answer at a defensible level of confidence. Only templates that pass all three are offered. Never a hand-picked vertical template the data doesn't support.",
      },
      {
        id: "why-not-more-observations",
        q: "Why does it sometimes surface fewer than 5 observations, or none?",
        a: "Every candidate finding passes eight questions before it's shown. Is it real, is it statistically supportable, is it material, is it economically significant, is it actionable. Anything that fails one of the first three is suppressed. That's deliberate: an output full of statistically meaningless movements looks thorough but is worse than a short one.",
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
        q: "11 dashboard şablonundan hangisini sunacağına nasıl karar veriyor?",
        a: "Sırasıyla üç filtre. Verinin yapısı neyi destekliyor, hangi iş sorusu soruluyor, veri savunulabilir bir güven düzeyinde neyi yanıtlayabiliyor. Yalnızca üçünü de geçen şablonlar sunulur. Verinin desteklemediği, elle seçilmiş bir sektör şablonu asla.",
      },
      {
        id: "why-not-more-observations",
        q: "Bazen neden 5'ten az gözlem, hatta hiç gözlem çıkmıyor?",
        a: "Her aday bulgu gösterilmeden önce sekiz sorudan geçer. Gerçek mi, istatistiksel olarak desteklenebilir mi, önemli mi, ekonomik olarak büyük mü, aksiyona dönüştürülebilir mi. İlk üçünden birini geçemeyen gösterilmez. Bu bilinçli bir tercih. Anlamsız hareketlerle dolu bir çıktı kapsamlı görünür ama kısa bir çıktıdan daha kötüdür.",
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
  const t = T[lang];
  const repo = githubUrl(project);

  const related = getAllSkillProjects(lang)
    .filter((p) => p.slug !== "dashboard-builder")
    .slice(0, 4)
    .map((p) => ({ href: p.links[0].href, name: p.name, desc: withJourneyCount(p.desc) }));

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
