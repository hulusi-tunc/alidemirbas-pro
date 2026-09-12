import { Code2, MoreHorizontal, MousePointer2, Terminal } from "lucide-react";
import type { SkillProductContent } from "@/components/SkillProductPage";
import { CodeBlock, ToolSelectorCards, type ToolOption } from "@/components/ui/InstallationStepper";
import { getAllSkillProjects, getSkillProject, githubUrl } from "@/lib/skill-catalog";
import { withJourneyCount } from "@/lib/archive";
import type { Lang } from "@/lib/content";

/* The tool picker every install flow will eventually need (numerspace and
   dashboard-builder don't have one yet - this is the first). Claude Code
   is the only one this skill is actually built and tested for today;
   Cursor/Codex/Other are shown INACTIVE (greyed, per ToolSelectorCards'
   own documented contract - "marks which one(s) the current guide
   actually verified rather than implying interactivity that isn't
   there") rather than omitted, since more editors are coming and the
   picker should already have somewhere to put them. Only the "Other"
   label is language-dependent - the rest are proper product names. */
const toolOptions = (lang: Lang): ToolOption[] => [
  { id: "claude-code", label: "Claude Code", icon: Terminal },
  { id: "cursor", label: "Cursor", icon: MousePointer2 },
  { id: "codex", label: "Codex", icon: Code2 },
  { id: "other", label: lang === "en" ? "Other" : "Diğer", icon: MoreHorizontal },
];

/* The Google Ads Change History Explorer's product page.

   It was the only in-house Lab project without one: five of the six
   entries in copy.lab.projects resolve to a page on this site, and this
   one sent people straight to GitHub - from the /lab card, the header's
   Lab dropdown, and the footer's project column alike. Numerspace is the
   sixth and is correctly external; it is a separate hosted product, and
   its own site is its product page.

   EVERY CLAIM BELOW IS CHECKED AGAINST THE TOOL ITSELF, not written
   from the project's one-line description. The repository was cloned and
   read for this page, and the two numbers on it were produced rather
   than copied: `python3 ads_change_history.py self-test` was run and its
   57 passing checks counted, and the file's import block was read to
   confirm the zero-dependency claim (argparse, csv, hashlib, json, re,
   string, sys, webbrowser, collections, datetime, difflib, pathlib -
   all standard library). The three CLI commands are the three
   subparsers the file actually registers. Where the tool's own README
   and this page disagree in future, the tool wins; this page states
   what it verified and links to the repo for the rest.

   dashboard-builder's page (the template's first instantiation) stays
   deliberately generic - "see the repository for exact commands" -
   because no real content had been gathered for it. That is a floor,
   not a ceiling: where real, verified material exists, the page should
   carry it, and here it does. */

const T = {
  en: {
    eyebrow: "Lab",
    whatItDoesTitle: "What it does",
    whatItDoesBody:
      "Turns a Google Ads change history export (CSV, TSV or flattened ChangeEvent JSON) into a single-file HTML dashboard that opens offline. Who changed what, in which account, campaign and ad group, what the old and new values were, and which category the change falls into.",
    howItWorksTitle: "What it will and won't tell you",
    howItWorksBody:
      "The tool reports, it doesn't grade. It will say a campaign hasn't changed in 23 days; it won't say that's neglect. Deciding whether a change is good, risky or overdue is deliberately out of scope, which is why the dashboard has no severity colors and no unexplained badges.",
    bullets: [
      "Answers who changed this campaign's budget last week, and what it was before.",
      "Shows which campaigns haven't been touched in 30+ days, and which category of change is most common right now.",
      "Rule Matches, off by default, lets you set your own magnitude thresholds in the browser; a match reads \"crossed the threshold you set\", always shown with the exact number beside it.",
      "Stops rather than guesses: an unrecognised column, an ambiguous date like 03/04/2026, or an uncategorised change combination exits with a structured status telling you which flag to re-run with.",
      "--mask-users replaces human names with User A / User B for external sharing, and keeps the same label for the same person across runs.",
    ],
    installTitle: "Install",
    toolStepTitle: "Pick your AI tool",
    toolStepDesc: "Built and tested for Claude Code today - support for other editors may follow.",
    step1Title: "As a Claude Code plugin",
    step1Desc: "Add the marketplace, then install the plugin.",
    step2Title: "Or run it directly, no Claude required",
    step2Desc: "Python 3 and its standard library are the only requirements - there are no dependencies to install.",
    step3Title: "Check it against its own fixtures",
    step3Desc:
      "The built-in suite runs the whole pipeline end to end on synthetic data. 57 checks pass on the current version.",
    viewRepo: "Read the repository",
    copyLabel: "Copy",
    copiedLabel: "Copied",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        id: "live-api",
        q: "Does it read my Google Ads account directly?",
        a: "Not by default. The plugin reads the file you export, which is what keeps it dependency-free and offline. If you have API access, the fetch_live_data.py script in the repo pulls change history live and writes it in the same format. That skips the export step; the plugin itself works the same way.",
      },
      {
        id: "formats",
        q: "Which export formats does it accept?",
        a: "CSV, TSV, and pre-flattened ChangeEvent JSON. It will not read an XLSX file or a Google Sheets URL directly - export to one of those three first.",
      },
      {
        id: "offline",
        q: "Does the dashboard need to be online?",
        a: "No. It is a single HTML file with no CDN references, so it works fully offline and can be sent to someone as one attachment. Filters, the activity timeline, the account and campaign drill-down, the category distribution and the searchable change explorer all run in the browser from data embedded in that file.",
      },
      {
        id: "sharing",
        q: "Can I share it without exposing who did what?",
        a: "Pass --mask-users. People's names and emails become User A, User B, and the labels are kept stable across runs, so the same person carries the same label in every report. Account and campaign names are never masked. They're your own data, not someone's identity.",
      },
    ],
    relatedTitle: "Other Lab projects",
  },
  tr: {
    eyebrow: "Lab",
    whatItDoesTitle: "Ne işe yarar",
    whatItDoesBody:
      "Google Ads değişiklik geçmişi dışa aktarımını (CSV, TSV ya da düzleştirilmiş ChangeEvent JSON) çevrimdışı açılan tek dosyalık bir HTML dashboard'a çevirir. Kim neyi değiştirmiş, hangi hesap, kampanya ve reklam grubunda, eski değer neydi, yeni değer ne oldu, hangi kategoriye giriyor.",
    howItWorksTitle: "Ne söyler, ne söylemez",
    howItWorksBody:
      "Araç raporlar, not vermez. Bir kampanyanın 23 gündür değişmediğini söyler; bunun ihmal olduğunu söylemez. Bir değişikliğin iyi, riskli ya da gecikmiş olduğuna karar vermek bilinçli olarak kapsam dışı. Bu yüzden dashboard'da ne önem rengi ne de açıklamasız rozet var.",
    bullets: [
      "Bu kampanyanın bütçesini geçen hafta kimin değiştirdiğini ve önceki değerin ne olduğunu gösterir.",
      "30+ gündür dokunulmamış kampanyaları ve şu an en sık görülen değişiklik kategorisini gösterir.",
      "Kural eşleşmeleri varsayılan olarak kapalı. Kendi büyüklük eşiklerini tarayıcıda ayarlarsın; bir eşleşme \"belirlediğin eşiği aştı\" demektir ve her zaman tam sayısıyla görünür.",
      "Tahmin etmek yerine durur. Tanınmayan bir sütun, 03/04/2026 gibi belirsiz bir tarih ya da kategorize edilemeyen bir değişiklik, hangi bayrakla yeniden çalıştıracağını söyleyen bir durum çıktısıyla sonlanır.",
      "--mask-users, dışarıyla paylaşım için kişi adlarını User A / User B ile değiştirir ve aynı kişiye çalıştırmalar arasında aynı etiketi verir.",
    ],
    installTitle: "Kurulum",
    toolStepTitle: "AI aracını seç",
    toolStepDesc: "Bugün Claude Code için geliştirildi ve test edildi. Diğer editörler için destek gelebilir.",
    step1Title: "Claude Code eklentisi olarak",
    step1Desc: "Önce marketplace'i ekle, sonra eklentiyi kur.",
    step2Title: "Ya da doğrudan çalıştır, Claude gerekmez",
    step2Desc: "Tek gereksinim Python 3 ve standart kütüphanesi. Kurulacak bağımlılık yok.",
    step3Title: "Kendi test verisiyle doğrula",
    step3Desc:
      "Yerleşik test paketi tüm akışı sentetik veri üzerinde baştan sona çalıştırır. Mevcut sürümde 57 test geçiyor.",
    viewRepo: "Repoyu oku",
    copyLabel: "Kopyala",
    copiedLabel: "Kopyalandı",
    faqTitle: "Sık sorulan sorular",
    faq: [
      {
        id: "live-api",
        q: "Google Ads hesabımı doğrudan okuyor mu?",
        a: "Varsayılan olarak hayır. Eklenti senin dışa aktardığın dosyayı okur; bağımlılıksız ve çevrimdışı çalışmasının sebebi bu. API erişimin varsa repodaki fetch_live_data.py betiği değişiklik geçmişini canlı çekip aynı biçimde yazar. Böylece dışa aktarma adımını atlarsın, eklentinin çalışma şekli değişmez.",
      },
      {
        id: "formats",
        q: "Hangi dışa aktarma biçimlerini kabul ediyor?",
        a: "CSV, TSV ve düzleştirilmiş ChangeEvent JSON. XLSX dosyasını ya da bir Google Sheets bağlantısını doğrudan okumaz; önce bu üç biçimden birine aktar.",
      },
      {
        id: "offline",
        q: "Dashboard'un çevrimiçi olması gerekiyor mu?",
        a: "Hayır. CDN bağlantısı olmayan tek bir HTML dosyası; tamamen çevrimdışı çalışır ve tek ek olarak gönderilebilir. Filtreler, zaman çizelgesi, hesap ve kampanya kırılımı, kategori dağılımı ve aranabilir değişiklik listesi, hepsi dosyanın içindeki veriden tarayıcıda çalışır.",
      },
      {
        id: "sharing",
        q: "Kimin ne yaptığını göstermeden paylaşabilir miyim?",
        a: "--mask-users ver. Kişi adları ve e-postaları User A, User B diye etiketlenir; etiketler çalıştırmalar arasında korunur, aynı kişi her raporda aynı etiketi taşır. Hesap ve kampanya adları hiçbir zaman maskelenmez. Onlar senin kendi verin, başkasının kimliği değil.",
      },
    ],
    relatedTitle: "Diğer Lab projeleri",
  },
} as const;

const SLUG = "google-ads-change-history-dashboard";

export function getChangeHistoryContent(lang: Lang): SkillProductContent | null {
  const project = getSkillProject(lang, SLUG);
  if (!project) return null;
  const t = T[lang];
  const repo = githubUrl(project);

  const related = getAllSkillProjects(lang)
    .filter((p) => p.slug !== SLUG)
    .slice(0, 4)
    .map((p) => ({ href: p.links[0].href, name: p.name, desc: withJourneyCount(p.desc) }));

  return {
    slug: SLUG,
    eyebrow: t.eyebrow,
    title: project.name,
    sub: project.desc,
    primaryLinks: project.links.map((l) => ({ label: l.label, href: l.href })),
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
    installTitle: t.installTitle,
    installSteps: [
      {
        n: 1,
        title: t.toolStepTitle,
        desc: t.toolStepDesc,
        content: <ToolSelectorCards options={toolOptions(lang)} activeId="claude-code" />,
      },
      {
        n: 2,
        title: t.step1Title,
        desc: t.step1Desc,
        content: (
          <CodeBlock
            code={`/plugin marketplace add ali-demirbas/${SLUG}\n/plugin install ${SLUG}@${SLUG}`}
            copyLabel={t.copyLabel}
            copiedLabel={t.copiedLabel}
          />
        ),
      },
      {
        n: 3,
        title: t.step2Title,
        desc: t.step2Desc,
        content: (
          <CodeBlock
            code="python3 ads_change_history.py run <export.csv> --out-dir ./out --open"
            copyLabel={t.copyLabel}
            copiedLabel={t.copiedLabel}
          />
        ),
      },
      {
        n: 4,
        title: t.step3Title,
        desc: t.step3Desc,
        content: (
          <div className="flex flex-col gap-3">
            <CodeBlock code="python3 ads_change_history.py self-test" copyLabel={t.copyLabel} copiedLabel={t.copiedLabel} />
            {repo ? (
              <a
                href={repo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                {t.viewRepo} →
              </a>
            ) : null}
          </div>
        ),
      },
    ],
    faqTitle: t.faqTitle,
    faq: [...t.faq],
    relatedTitle: t.relatedTitle,
    related,
    // Restates the page's own verified claim (step2Desc above): "Python 3
    // and its standard library are the only requirements."
    appSchema: {
      type: "SoftwareApplication",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Cross-platform (Python 3, standard library only)",
    },
  };
}
