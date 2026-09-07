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
    step3Desc: "skills.sh installs every skill in the repo in one command.",
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
        a: "No - it explains why they don't match and states what each one is actually valid for. The comparability engine classifies a mismatch (attribution window, denominator, counting unit) rather than picking a winner or averaging the two. Reconciliation here means naming the specific counting mechanic, not producing one merged figure.",
      },
      {
        id: "which-templates",
        q: "How does it decide which of the 11 dashboard templates to offer?",
        a: "Three filters, in order: what your data's structure can support, what business question you're actually asking, and what the data can answer at a defensible confidence level. Only templates that clear all three are offered - never a manually-picked \"vertical\" template that the data doesn't actually back up.",
      },
      {
        id: "why-not-more-observations",
        q: "Why does it sometimes surface fewer than 5 observations, or none?",
        a: "Every candidate observation runs through an 8-question gate before it's shown - is it real, statistically supportable, material, economically sized, actionable. Failing any of the first three suppresses it outright. Suppression is deliberate: an output padded with statistically meaningless moves reads as thorough and is worse than a short one.",
      },
      {
        id: "real-account-data",
        q: "Does the repo contain real account or business data?",
        a: "No. CLAUDE.md's own maintenance rules forbid it - every example, test fixture and research citation uses synthetic data or a cited public source, never a real account export.",
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
    step3Desc: "skills.sh, repodaki her skill'i tek komutla kurar.",
    viewRepo: "Repoyu görüntüle",
    whatItDoesTitle: "Ne işe yarar",
    howItWorksTitle: "Şu şekilde geliştirildi",
    relatedTitle: "Diğer Lab projeleri",
    repoLabel: "GitHub'da görüntüle",
    faqTitle: "Sık sorulan sorular",
    faq: [
      {
        id: "does-it-fix-my-numbers",
        q: "Uyuşmayan sayıları düzeltiyor ya da uzlaştırıyor mu?",
        a: "Hayır - neden uyuşmadıklarını açıklar ve her birinin gerçekte ne için geçerli olduğunu söyler. Comparability engine, bir uyuşmazlığı (attribution penceresi, payda, sayım birimi) sınıflandırır; bir kazanan seçmez ya da ikisini ortalamaz. Buradaki uzlaştırma, tek bir birleşik rakam üretmek değil, tam sayım mekanizmasını adlandırmaktır.",
      },
      {
        id: "which-templates",
        q: "11 dashboard şablonundan hangisini sunacağına nasıl karar veriyor?",
        a: "Sırasıyla üç filtre: verinin yapısının neyi destekleyebileceği, gerçekte hangi iş sorusunu sorduğun ve verinin savunulabilir bir güven düzeyinde neyi yanıtlayabileceği. Yalnızca üçünü de geçen şablonlar sunulur - verinin gerçekten desteklemediği elle seçilmiş bir \"vertical\" şablon asla.",
      },
      {
        id: "why-not-more-observations",
        q: "Bazen neden 5'ten az gözlem, hatta hiç gözlem çıkmıyor?",
        a: "Her aday gözlem gösterilmeden önce 8 soruluk bir kapıdan geçer: gerçek mi, istatistiksel olarak desteklenebilir mi, önemli mi, ekonomik olarak ölçeklendirilebilir mi, aksiyona dönüştürülebilir mi. İlk üçünden birini geçemeyen doğrudan bastırılır. Bastırma bilinçlidir: istatistiksel olarak anlamsız hareketlerle dolu bir çıktı kapsamlı görünür ama kısa bir çıktıdan daha kötüdür.",
      },
      {
        id: "real-account-data",
        q: "Repo gerçek hesap ya da işletme verisi içeriyor mu?",
        a: "Hayır. CLAUDE.md'nin kendi bakım kuralları buna izin vermiyor - her örnek, test fixture'ı ve araştırma alıntısı sentetik veri ya da kaynak gösterilen bir kamu kaynağı kullanıyor, gerçek bir hesap dışa aktarımı asla.",
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
