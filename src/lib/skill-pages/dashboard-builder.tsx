import { Terminal } from "lucide-react";

import type { SkillProductContent } from "@/components/SkillProductPage";
import { getAllSkillProjects, getSkillProject, githubUrl } from "@/lib/skill-catalog";
import { withJourneyCount } from "@/lib/archive";
import type { Lang } from "@/lib/content";

/* First real instantiation of the Skill Product Page template - proves
   the template renders and routes correctly. dashboard-builder was
   picked because it's a real Lab project with no dedicated page yet
   (ab-test-playbook and the Journey Library already have bespoke pages
   and are left alone).

   Every field below is either copied verbatim from the existing
   copy.lab.projects entry (name/desc/tags/links - see content.ts) or a
   generic, verifiably-true instruction ("clone the repo", "see the
   repository for exact commands") - no invented install commands, no
   fabricated FAQ. That's why there's no `faq` field here: no real FAQ
   copy exists yet for this project, and FaqAccordion / the Faq section
   simply don't render when it's empty. */

const T = {
  en: {
    eyebrow: "Lab",
    installTitle: "Install",
    step1Title: "Clone the repository",
    step1Desc: "Everything needed to run it is in the repo itself.",
    step2Title: "Open it in Claude Code",
    step2Desc: "Built and tested as a Claude Code plugin.",
    step3Title: "Follow the repository's setup steps",
    step3Desc: "Exact commands and configuration live in the repo's own README - this page won't duplicate them and risk them going stale.",
    viewRepo: "View the repository",
    whatItDoesTitle: "What it does",
    howItWorksTitle: "Built as",
    relatedTitle: "Other Lab projects",
    repoLabel: "View on GitHub",
  },
  tr: {
    eyebrow: "Lab",
    installTitle: "Kurulum",
    step1Title: "Repoyu klonlayın",
    step1Desc: "Çalıştırmak için gereken her şey reponun içinde.",
    step2Title: "Claude Code'da açın",
    step2Desc: "Bir Claude Code eklentisi olarak geliştirildi ve test edildi.",
    step3Title: "Repodaki kurulum adımlarını izleyin",
    step3Desc: "Tam komutlar ve yapılandırma reponun kendi README'sinde - bu sayfa onları tekrarlayıp eskimesini göze almıyor.",
    viewRepo: "Repoyu görüntüle",
    whatItDoesTitle: "Ne işe yarar",
    howItWorksTitle: "Şu şekilde geliştirildi",
    relatedTitle: "Diğer Lab projeleri",
    repoLabel: "GitHub'da görüntüle",
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
        content: repo ? (
          <code className="block rounded-md border border-line bg-ink-950 px-4 py-3 font-mono text-xs text-white/85">
            git clone {repo}.git
          </code>
        ) : undefined,
      },
      { n: 2, title: t.step2Title, desc: t.step2Desc },
      {
        n: 3,
        title: t.step3Title,
        desc: t.step3Desc,
        content: repo ? (
          <a
            href={repo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            {t.viewRepo} →
          </a>
        ) : undefined,
      },
    ],
    faq: [],
    relatedTitle: t.relatedTitle,
    related,
  };
}

// Exported for the InstallationStepper's ToolSelectorCards, if a future
// pass adds a real multi-tool picker to this specific page.
export const DASHBOARD_BUILDER_TOOL_ICON = Terminal;
