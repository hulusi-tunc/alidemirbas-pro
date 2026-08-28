import type { SkillProductContent } from "@/components/SkillProductPage";
import { getAllSkillProjects, getSkillProject, githubUrl } from "@/lib/skill-catalog";
import { withJourneyCount } from "@/lib/archive";
import type { Lang } from "@/lib/content";

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
      "Takes a Google Ads change-history export - CSV, TSV, or pre-flattened ChangeEvent JSON - and turns it into a single-file HTML dashboard you can open offline: who changed what, in which account, campaign and ad group, the old value and the new one, and which category the change falls into.",
    howItWorksTitle: "What it will and won't tell you",
    howItWorksBody:
      "The tool reports; it does not grade. It will say a campaign hasn't changed in 23 days. It will not say that neglecting it was a mistake - judging whether a change was good, risky or overdue is explicitly out of scope, and the dashboard has no severity colours or bare badges for that reason.",
    bullets: [
      "Answers who changed this campaign's budget last week, and what it was before.",
      "Separates changes made by a person from changes made by an automation - a script, a bidding rule, a Recommendation.",
      "Shows which campaigns haven't been touched in 30+ days, and which category of change is most common right now.",
      "Rule Matches, off by default, lets you set your own magnitude thresholds in the browser; a match reads \"crossed the threshold you set\", always shown with the exact number beside it.",
      "Stops rather than guesses: an unrecognised column, an ambiguous date like 03/04/2026, or an uncategorised change combination exits with a structured status telling you which flag to re-run with.",
      "--mask-users replaces human names with User A / User B for external sharing, and keeps the same label for the same person across runs.",
    ],
    installTitle: "Install",
    step1Title: "As a Claude Code plugin",
    step1Desc: "Add the marketplace, then install the plugin.",
    step2Title: "Or run it directly, no Claude required",
    step2Desc: "Python 3 and its standard library are the only requirements - there are no dependencies to install.",
    step3Title: "Check it against its own fixtures",
    step3Desc:
      "The built-in suite runs the whole pipeline end to end on synthetic data. 57 checks pass on the current version.",
    viewRepo: "Read the repository",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        id: "live-api",
        q: "Does it read my Google Ads account directly?",
        a: "Not by default, and that is deliberate: the skill reads a file you export, which is what keeps it dependency-free and runnable offline. If you do have API access, tools/fetch_live_data.py in the repository is a separate optional script that pulls change history live and writes it in the exact shape the skill reads, so you can skip the manual export step without changing how the skill itself works.",
      },
      {
        id: "formats",
        q: "Which export formats does it accept?",
        a: "CSV, TSV, and pre-flattened ChangeEvent JSON. It will not read an XLSX file or a Google Sheets URL directly - export to one of those three first.",
      },
      {
        id: "unknown-columns",
        q: "My export's column names don't match. What happens?",
        a: "It stops and tells you, rather than guessing. The run exits non-zero with a structured JSON status naming the columns it could not map, and you re-run with --mapping-file. The mapping is then fingerprinted and saved, so the next export in the same shape needs no flag at all.",
      },
      {
        id: "offline",
        q: "Does the dashboard need to be online?",
        a: "No. It is a single HTML file with no CDN references, so it works fully offline and can be sent to someone as one attachment. Filters, the activity timeline, the account and campaign drill-down, the category distribution and the searchable change explorer all run in the browser from data embedded in that file.",
      },
      {
        id: "sharing",
        q: "Can I share it without exposing who did what?",
        a: "Pass --mask-users. Human user names and emails become User A, User B and so on, and the labels persist across runs so the same person keeps the same label between reports. Account and campaign names are never masked - that is your own data, not someone else's identity.",
      },
    ],
    relatedTitle: "Other Lab projects",
  },
  tr: {
    eyebrow: "Lab",
    whatItDoesTitle: "Ne işe yarar",
    whatItDoesBody:
      "Google Ads değişiklik geçmişi dışa aktarımını - CSV, TSV ya da düzleştirilmiş ChangeEvent JSON - çevrimdışı açabileceğiniz tek dosyalık bir HTML panoya dönüştürür: kim neyi değiştirmiş, hangi hesap, kampanya ve reklam grubunda, eski değer neydi yeni değer ne oldu, değişiklik hangi kategoriye giriyor.",
    howItWorksTitle: "Ne söyler, ne söylemez",
    howItWorksBody:
      "Araç raporlar, not vermez. Bir kampanyanın 23 gündür değişmediğini söyler; bunun bir ihmal olduğunu söylemez. Bir değişikliğin iyi, riskli ya da gecikmiş olduğuna karar vermek bilinçli olarak kapsam dışı - pano bu yüzden ne önem derecesi rengi ne de açıklamasız bir rozet kullanıyor.",
    bullets: [
      "Bu kampanyanın bütçesini geçen hafta kim değiştirmiş, öncesinde neydi - cevaplar.",
      "İnsanın yaptığı değişiklikle otomasyonun yaptığını ayırır: bir script, bir teklif kuralı, bir Recommendation.",
      "30+ gündür dokunulmamış kampanyaları ve şu an en sık görülen değişiklik kategorisini gösterir.",
      "Varsayılan olarak kapalı olan Rule Matches, kendi büyüklük eşiklerinizi tarayıcıda ayarlamanızı sağlar; bir eşleşme \"belirlediğiniz eşiği aştı\" demektir ve her zaman tam sayısıyla birlikte görünür.",
      "Tahmin etmek yerine durur: tanınmayan bir sütun, 03/04/2026 gibi belirsiz bir tarih ya da kategorize edilemeyen bir değişiklik bileşimi, hangi bayrakla yeniden çalıştıracağınızı söyleyen yapılandırılmış bir durum çıktısıyla sonlanır.",
      "--mask-users, dışarıyla paylaşım için kişi adlarını User A / User B ile değiştirir ve aynı kişiye çalıştırmalar arasında aynı etiketi verir.",
    ],
    installTitle: "Kurulum",
    step1Title: "Claude Code eklentisi olarak",
    step1Desc: "Önce marketplace'i ekleyin, sonra eklentiyi kurun.",
    step2Title: "Ya da doğrudan çalıştırın, Claude gerekmez",
    step2Desc: "Tek gereksinim Python 3 ve standart kütüphanesi - kurulacak hiçbir bağımlılık yok.",
    step3Title: "Kendi fixture'larıyla doğrulayın",
    step3Desc:
      "Yerleşik test paketi tüm hattı sentetik veri üzerinde uçtan uca çalıştırır. Mevcut sürümde 57 kontrol geçiyor.",
    viewRepo: "Repoyu okuyun",
    faqTitle: "Sık sorulan sorular",
    faq: [
      {
        id: "live-api",
        q: "Google Ads hesabımı doğrudan okuyor mu?",
        a: "Varsayılan olarak hayır ve bu bilinçli: skill sizin dışa aktardığınız dosyayı okur, onu bağımlılıksız ve çevrimdışı çalışabilir kılan da bu. API erişiminiz varsa repodaki tools/fetch_live_data.py ayrı ve isteğe bağlı bir script; değişiklik geçmişini canlı çeker ve skill'in okuduğu biçimde yazar, böylece manuel dışa aktarma adımını atlarsınız - skill'in kendi çalışma şekli değişmeden.",
      },
      {
        id: "formats",
        q: "Hangi dışa aktarma biçimlerini kabul ediyor?",
        a: "CSV, TSV ve düzleştirilmiş ChangeEvent JSON. XLSX dosyasını ya da bir Google Sheets bağlantısını doğrudan okumaz - önce bu üç biçimden birine aktarın.",
      },
      {
        id: "unknown-columns",
        q: "Dışa aktarımımın sütun adları uyuşmuyor, ne olur?",
        a: "Tahmin etmez, durur ve söyler. Çalıştırma, eşleştiremediği sütunları adlandıran yapılandırılmış bir JSON durumuyla sıfırdan farklı çıkar; --mapping-file ile yeniden çalıştırırsınız. Eşleştirme sonra parmak izine bağlanıp kaydedilir, aynı biçimdeki bir sonraki dosyada hiçbir bayrak gerekmez.",
      },
      {
        id: "offline",
        q: "Panonun çevrimiçi olması gerekiyor mu?",
        a: "Hayır. CDN bağlantısı olmayan tek bir HTML dosyası; tamamen çevrimdışı çalışır ve birine tek ek olarak gönderilebilir. Filtreler, aktivite zaman çizelgesi, hesap ve kampanya kırılımı, kategori dağılımı ve aranabilir değişiklik gezgini - hepsi o dosyanın içindeki veriden tarayıcıda çalışır.",
      },
      {
        id: "sharing",
        q: "Kimin ne yaptığını göstermeden paylaşabilir miyim?",
        a: "--mask-users verin. Kişi adları ve e-postaları User A, User B şeklinde etiketlenir ve etiketler çalıştırmalar arasında korunur, böylece aynı kişi raporlar arası aynı etiketi taşır. Hesap ve kampanya adları hiçbir zaman maskelenmez - onlar sizin kendi verinizdir, başkasının kimliği değil.",
      },
    ],
    relatedTitle: "Diğer Lab projeleri",
  },
} as const;

const SLUG = "google-ads-change-history-dashboard";

/** The dark code plate the install steps use, same treatment as the
    dashboard-builder page's clone line. */
function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="block overflow-x-auto rounded-md border border-line bg-ink-950 px-4 py-3 font-mono text-xs leading-relaxed whitespace-pre text-white/85">
      {children}
    </code>
  );
}

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
        title: t.step1Title,
        desc: t.step1Desc,
        content: (
          <Code>
            {`/plugin marketplace add ali-demirbas/${SLUG}\n/plugin install ${SLUG}@${SLUG}`}
          </Code>
        ),
      },
      {
        n: 2,
        title: t.step2Title,
        desc: t.step2Desc,
        content: (
          <Code>
            {`python3 ads_change_history.py run <export.csv> --out-dir ./out --open`}
          </Code>
        ),
      },
      {
        n: 3,
        title: t.step3Title,
        desc: t.step3Desc,
        content: (
          <div className="flex flex-col gap-3">
            <Code>{`python3 ads_change_history.py self-test`}</Code>
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
  };
}
