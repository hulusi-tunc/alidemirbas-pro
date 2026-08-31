import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import { ProductBenefitStory, ProductHeading, ProductSection } from "@/components/ui/ProductPage";
import { CodeTabs } from "@/components/ui/CodeTabs";
import { ToolSelectorCards, type ToolOption } from "@/components/ui/InstallationStepper";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGrid } from "@/components/ui/RelatedGrid";
import type { SkillProductContent } from "@/components/SkillProductPage";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { breadcrumbList, howTo, softwareApplication } from "@/lib/schema";
import { copy, type Lang } from "@/lib/content";
import { Code2, MousePointer2, Terminal } from "lucide-react";

/* Google Ads Change History Explorer.

   REBUILT (this pass) around the tool's actual features rather than a
   generic "why different" template: Change Explorer, Before/After,
   Activity + Campaign Last Changes, and Rule Matches are the real,
   named sections of the tool's own single-file dashboard (see the
   cloned repo's README - "Filters, Summary, Activity Timeline, User
   Activity split by human/automation, Account/Campaign drill-down,
   Category Distribution, Rule Matches, Campaign Last Changes, and a
   sortable/searchable Change Explorer with a before/after detail
   panel"). The old "Human or automation" panel is gone - the real
   Change Explorer table already carries that attribution inline (an
   "Automation" badge in the same USER column as "User A"), so a
   separate feature slot for it was inventing a distinction the real UI
   doesn't make.

   EVERY EXAMPLE ROW BELOW IS REAL, not invented for this page: pulled
   directly from examples/dashboard-demo.html in the cloned repository -
   the tool's own real (synthetic-input, real-output) demo file - not
   typed up from memory. Campaign names (Alpha/Beta/Gamma/Delta),
   account names (Account A/B), user labels (User A/B/C, already
   --mask-users-masked in the source file), old/new values, dates and
   the exact Change Explorer column order all come from that file. The
   Rule Matches magnitude defaults (Budget ±50%, Target CPA ±30%,
   Target ROAS ±30%, Bid/CPC ±50%) and the structural rule defaults
   (Campaign paused/removed/Ad group removed on, Campaign enabled off)
   are read from the demo file's own "Configure rules" panel, not
   guessed - they don't match what an earlier draft of this page
   assumed (±20/±15/±10). The one explicitly-labelled hypothetical is
   the Rule Matches "if you set Budget to ±20%" example, which computes
   its percentage from a real row rather than inventing one. */

const REAL = {
  // Column order and every value here: examples/dashboard-demo.html,
  // Change Explorer table, read directly.
  explorerRows: [
    { user: "User A", account: "Account B", campaign: "Campaign Alpha", adGroup: "—", category: "Status", en: { date: "Aug 17, 2026 · 9:45 AM", old: "Enabled", new: "Paused" }, tr: { date: "17 Ağu 2026 · 09:45", old: "Etkin", new: "Duraklatıldı" } },
    { user: "User C", account: "Account B", campaign: "Campaign Gamma", adGroup: "—", category: "Budget", en: { date: "Aug 6, 2026 · 10:00 AM", old: "50,000", new: "45,000" }, tr: { date: "6 Ağu 2026 · 10:00", old: "50.000", new: "45.000" } },
    { user: "Automation", account: "Account A", campaign: "Campaign Beta", adGroup: "—", category: "Budget", en: { date: "Aug 3, 2026 · 2:22 PM", old: "80,000", new: "100,000" }, tr: { date: "3 Ağu 2026 · 14:22", old: "80.000", new: "100.000" } },
    { user: "User A", account: "Account A", campaign: "Campaign Alpha", adGroup: "Ad Group 1", category: "Bidding", en: { date: "Aug 1, 2026 · 9:15 AM", old: "3.50", new: "4.20" }, tr: { date: "1 Ağu 2026 · 09:15", old: "3,50", new: "4,20" } },
  ],
  // Campaign Last Changes table, same file, read directly - exact dates,
  // not the "days since" figure (the real UI computes that against the
  // visitor's own clock, which is honest live but would drift on a
  // static page).
  lastChanges: [
    { campaign: "Campaign Beta", account: "Account A", date: { en: "Aug 3, 2026", tr: "3 Ağu 2026" } },
    { campaign: "Campaign Alpha", account: "Account A", date: { en: "Aug 4, 2026", tr: "4 Ağu 2026" } },
    { campaign: "Campaign Gamma", account: "Account B", date: { en: "Aug 6, 2026", tr: "6 Ağu 2026" } },
    { campaign: "Campaign Delta", account: "Account B", date: { en: "Aug 7, 2026", tr: "7 Ağu 2026" } },
    { campaign: "Campaign Alpha", account: "Account B", date: { en: "Aug 17, 2026", tr: "17 Ağu 2026" } },
  ],
  // "Account / Campaign Activity" bars, same file.
  accountActivity: [
    { account: "Account A", count: 6 },
    { account: "Account B", count: 4 },
  ],
  totalChanges: 10,
  period: { en: "Aug 1 - 17, 2026", tr: "1 - 17 Ağustos 2026" },
  // "Configure rules" panel defaults, same file - read with the checkbox
  // enabled, not assumed.
  magnitudeRules: [
    { label: { en: "Budget change", tr: "Bütçe değişimi" }, value: 50 },
    { label: { en: "Target CPA change", tr: "Target CPA değişimi" }, value: 30 },
    { label: { en: "Target ROAS change", tr: "Target ROAS değişimi" }, value: 30 },
    { label: { en: "Bid/CPC change", tr: "Teklif/TBM değişimi" }, value: 50 },
  ],
  structuralRules: [
    { label: { en: "Campaign paused", tr: "Kampanya duraklatıldı" }, on: true },
    { label: { en: "Campaign removed", tr: "Kampanya kaldırıldı" }, on: true },
    { label: { en: "Ad group removed", tr: "Reklam grubu kaldırıldı" }, on: true },
    { label: { en: "Campaign enabled", tr: "Kampanya etkinleştirildi" }, on: false },
  ],
};

const T = {
  en: {
    eyebrow: "Lab / Google Ads",
    title: "See exactly what changed in Google Ads.",
    sub: "Turn Google Ads Change History into a searchable dashboard with the exact campaign, category, old value, new value and timestamp behind every change.",
    proof: ["57 self-test checks pass", "Zero dependencies", "Works fully offline"],

    explorerEyebrow: "Change Explorer",
    explorerTitle: "Find any change in seconds.",
    explorerSub: "Search and filter by account, campaign, ad group, category, user or automation, date range and change type - then open any row for the full before/after detail.",
    explorerCols: ["Date", "User", "Account", "Campaign", "Ad group", "Category", "Old value", "New value"],

    baEyebrow: "Before / After",
    baTitle: "Before and after, without digging through logs.",
    baSub: "Open a change and see the previous value beside the new one, with the campaign, ad group and exact timestamp attached.",

    actEyebrow: "Activity",
    actTitle: "See what changed - and what hasn't.",
    actSub: "One view of how often each account changes; another of which campaigns haven't had a change logged recently.",
    actActivityLabel: "Account activity",
    actLastLabel: "Campaign last changes",
    actTotal: (n: number, period: string) => `${n} changes · ${period}`,

    rulesEyebrow: "Rule Matches",
    rulesTitle: "Set your own change thresholds.",
    rulesSub: "Off by default. Set a magnitude threshold and a structural rule like a paused or removed campaign, computed entirely in the browser - no re-run needed to change a threshold.",
    rulesMagnitudeLabel: "Magnitude (±% change)",
    rulesStructuralLabel: "Structural",
    rulesExampleLabel: "Example - with Budget change set to ±20%",
    rulesExampleNote: "crosses your ±20% rule",
    principleTitle: "Factual by design.",
    principleBody: "The dashboard reports what happened. It doesn't label a change as good, bad or risky.",

    fileEyebrow: "Single file",
    fileTitle: "Your change history stays in one file.",
    fileSub: "The dashboard is generated as a single HTML file with no CDN dependency. Open it locally, archive it or share it as an attachment.",
    fileFlow: ["Google Ads export", "Run", "dashboard.html"],
    fileFormats: "CSV · TSV · ChangeEvent JSON",

    installEyebrow: "Install",
    installTitle: "Install",
    installSub: "No account, no API key, no dependencies to install.",
    toolStepLabel: "Built for",
    claudeTab: "Claude Code",
    pythonTab: "Python",
    selfTestNote: "57 built-in checks pass on the current version.",
    reliabilityTitle: "Built to fail explicitly.",
    reliabilityBody: "Ambiguous dates or unknown columns stop the run instead of being silently interpreted.",
    viewRepo: "Read the repository",

    faqEyebrow: "FAQ",
    ctaEyebrow: "OPEN SOURCE",
    ctaTitle: "Read the change history your account already logged.",
  },
  tr: {
    eyebrow: "Lab / Google Ads",
    title: "Google Ads'te tam olarak ne değişti görün.",
    sub: "Google Ads Değişiklik Geçmişi'ni aranabilir bir dashboard'a çevirin - her değişikliğin arkasındaki tam kampanya, kategori, eski değer, yeni değer ve zaman damgasıyla.",
    proof: ["57 self-test kontrolü geçiyor", "Sıfır bağımlılık", "Tamamen çevrimdışı çalışır"],

    explorerEyebrow: "Change Explorer",
    explorerTitle: "Herhangi bir değişikliği saniyeler içinde bulun.",
    explorerSub: "Hesaba, kampanyaya, reklam grubuna, kategoriye, kullanıcıya ya da otomasyona, tarih aralığına ve değişiklik türüne göre arayın ve filtreleyin - sonra herhangi bir satırı açıp tam öncesi/sonrası detayını görün.",
    explorerCols: ["Tarih", "Kullanıcı", "Hesap", "Kampanya", "Reklam grubu", "Kategori", "Eski değer", "Yeni değer"],

    baEyebrow: "Öncesi / Sonrası",
    baTitle: "Loglara dalmadan öncesi ve sonrası.",
    baSub: "Bir değişikliği açın, önceki değeri kampanya, reklam grubu ve tam zaman damgasıyla birlikte yeni değerin yanında görün.",

    actEyebrow: "Aktivite",
    actTitle: "Ne değişti - ne değişmedi görün.",
    actSub: "Bir tarafta her hesabın ne sıklıkla değiştiği; diğer tarafta hangi kampanyalara son zamanlarda bir değişiklik kaydedilmediği.",
    actActivityLabel: "Hesap aktivitesi",
    actLastLabel: "Kampanya son değişiklikleri",
    actTotal: (n: number, period: string) => `${n} değişiklik · ${period}`,

    rulesEyebrow: "Rule Matches",
    rulesTitle: "Kendi değişiklik eşiklerinizi belirleyin.",
    rulesSub: "Varsayılan olarak kapalı. Bir büyüklük eşiği ve duraklatılmış ya da kaldırılmış kampanya gibi yapısal bir kural belirleyin - tamamen tarayıcıda hesaplanır, eşiği değiştirmek için yeniden çalıştırmaya gerek yok.",
    rulesMagnitudeLabel: "Büyüklük (±% değişim)",
    rulesStructuralLabel: "Yapısal",
    rulesExampleLabel: "Örnek - Bütçe değişimi ±%20 olarak ayarlandığında",
    rulesExampleNote: "±%20 kuralınızı aşıyor",
    principleTitle: "Tasarım gereği tarafsız.",
    principleBody: "Pano ne olduğunu raporlar. Bir değişikliği iyi, kötü ya da riskli olarak etiketlemez.",

    fileEyebrow: "Tek dosya",
    fileTitle: "Değişiklik geçmişiniz tek bir dosyada kalır.",
    fileSub: "Pano, CDN bağımlılığı olmayan tek bir HTML dosyası olarak üretilir. Yerelde açın, arşivleyin ya da ek olarak paylaşın.",
    fileFlow: ["Google Ads dışa aktarımı", "Çalıştır", "dashboard.html"],
    fileFormats: "CSV · TSV · ChangeEvent JSON",

    installEyebrow: "Kurulum",
    installTitle: "Kurulum",
    installSub: "Hesap yok, API anahtarı yok, kurulacak bağımlılık yok.",
    toolStepLabel: "Şunun için geliştirildi",
    claudeTab: "Claude Code",
    pythonTab: "Python",
    selfTestNote: "Mevcut sürümde 57 yerleşik kontrol geçiyor.",
    reliabilityTitle: "Açıkça başarısız olacak şekilde kuruldu.",
    reliabilityBody: "Belirsiz tarihler ya da tanınmayan sütunlar, sessizce yorumlanmak yerine çalıştırmayı durdurur.",
    viewRepo: "Repoyu okuyun",

    faqEyebrow: "SSS",
    ctaEyebrow: "AÇIK KAYNAK",
    ctaTitle: "Hesabınızın zaten kaydettiği değişiklik geçmişini okuyun.",
  },
} as const;

const TOOL_OPTIONS: ToolOption[] = [
  { id: "claude-code", label: "Claude Code", icon: Terminal },
  { id: "cursor", label: "Cursor", icon: MousePointer2 },
  { id: "codex", label: "Codex", icon: Code2 },
];

const CLAUDE_CODE_CMD = `/plugin marketplace add ali-demirbas/google-ads-change-history-dashboard\n/plugin install google-ads-change-history-dashboard@google-ads-change-history-dashboard`;
const PYTHON_CMD = `python3 ads_change_history.py run <export.csv> --out-dir ./out --open`;
const SELF_TEST_CMD = `python3 ads_change_history.py self-test`;

/* ---- Shared bits -------------------------------------------------- */

/** A plain macOS-style browser chrome, purely decorative framing (three
    dots, an address-bar-shaped strip) around a real data visual - never
    a screenshot of an actual browser, just the "this is a page you'd
    open" cue the hero needs. */
function BrowserChrome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-paper shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_24px_48px_-16px_rgb(10_16_32/0.18)]">
      <div className="flex items-center gap-3 border-b border-line bg-paper-soft px-4 py-2.5">
        <div className="flex gap-1.5">
          <span aria-hidden className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span aria-hidden className="size-2.5 rounded-full bg-[#febc2e]" />
          <span aria-hidden className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 truncate rounded-md bg-paper px-3 py-1 text-center font-mono text-[11px] text-ink-400">
          {title}
        </div>
      </div>
      {children}
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    Status: "bg-emerald-50 text-emerald-700",
    Budget: "bg-primary-50 text-primary-700",
    Bidding: "bg-violet-50 text-violet-700",
    Keyword: "bg-sky-50 text-sky-700",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${styles[category] ?? "bg-paper-soft text-ink-600"}`}>
      {category}
    </span>
  );
}

/** The real Change Explorer table, real rows - `compact` drops the Ad
    group column and shows fewer rows for the hero's condensed preview. */
function ExplorerTable({ lang, compact = false }: { lang: Lang; compact?: boolean }) {
  const t = T[lang];
  const rows = compact ? REAL.explorerRows.slice(0, 3) : REAL.explorerRows;
  const cols = compact ? t.explorerCols.filter((_, i) => i !== 4) : t.explorerCols;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-[12.5px]">
        <thead>
          <tr className="border-b border-line text-[11px] tracking-wide text-ink-400 uppercase">
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 font-medium whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              <td className="px-3 py-2.5 font-mono text-[11.5px] whitespace-nowrap text-ink-500">{r[lang].date}</td>
              <td className="px-3 py-2.5 whitespace-nowrap">
                {r.user === "Automation" ? (
                  <span className="rounded-full bg-sand-50 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
                    {r.user}
                  </span>
                ) : (
                  <span className="text-ink-800">{r.user}</span>
                )}
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap text-ink-600">{r.account}</td>
              <td className="px-3 py-2.5 whitespace-nowrap font-medium text-ink-900">{r.campaign}</td>
              {!compact && <td className="px-3 py-2.5 whitespace-nowrap text-ink-500">{r.adGroup}</td>}
              <td className="px-3 py-2.5 whitespace-nowrap">
                <CategoryBadge category={r.category} />
              </td>
              <td className="px-3 py-2.5 font-mono whitespace-nowrap text-[#c65d3f]">{r[lang].old}</td>
              <td className="px-3 py-2.5 font-mono whitespace-nowrap text-emerald-700">{r[lang].new}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---- 01 · Hero ------------------------------------------------------ */
function Hero({ c, t, lang }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  return (
    <section className="relative isolate overflow-hidden bg-paper pt-16 pb-24 md:pt-20 md:pb-32">
      <PortraitContainer className="text-center">
        <Reveal>
          <p className="altor-eyebrow mb-5 text-ink-400">{t.eyebrow}</p>
          <h1 className="mx-auto max-w-3xl text-h1-fluid font-medium text-ink-950">{t.title}</h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-ink-950/65">{t.sub}</p>
        </Reveal>
        {repo && (
          <Reveal delay={140} className="mt-8 flex flex-wrap justify-center gap-2.5">
            <a
              href={repo.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-ink-950 px-6 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              {repo.label}
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </Reveal>
        )}
        {/* Trust strip - small, not the hero's main event anymore. */}
        <Reveal delay={180} className="mt-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12.5px] text-ink-500">
            {t.proof.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check aria-hidden className="size-3 shrink-0 text-primary-600" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={220} className="mx-auto mt-14 max-w-3xl text-left">
          <BrowserChrome title="dashboard.html">
            <ExplorerTable lang={lang} compact />
          </BrowserChrome>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 02 · Change Explorer -------------------------------------------- */
function ChangeExplorerSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <ProductSection tone="paper" space="xl">
      <PortraitContainer>
        <ProductHeading eyebrow={t.explorerEyebrow} title={t.explorerTitle} body={t.explorerSub} align="center" />
        <Reveal delay={100} className="mx-auto mt-12 max-w-4xl text-left">
          <BrowserChrome title="dashboard.html — Change Explorer">
            <ExplorerTable lang={lang} />
          </BrowserChrome>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 03 · Before / After ---------------------------------------------- */
function BeforeAfterCard({ row, lang }: { row: (typeof REAL.explorerRows)[number]; lang: Lang }) {
  return (
    <div className="rounded-card border border-line bg-paper p-4">
      <p className="truncate text-[13px] font-medium text-ink-900">{row.campaign}</p>
      <p className="mt-0.5 text-[11.5px] leading-snug text-ink-500">
        {row.account} · {row[lang].date}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-md bg-[#fdf3f0] px-2.5 py-1.5 font-mono text-[13px] text-[#c65d3f] line-through decoration-1">
          {row[lang].old}
        </span>
        <ArrowRight aria-hidden className="size-3.5 shrink-0 text-ink-300" />
        <span className="rounded-md bg-emerald-50 px-2.5 py-1.5 font-mono text-[13px] font-medium text-emerald-700">
          {row[lang].new}
        </span>
      </div>
    </div>
  );
}

function BeforeAfterSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <ProductBenefitStory
          eyebrow={t.baEyebrow}
          title={t.baTitle}
          body={t.baSub}
          side="right"
          visual={
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {REAL.explorerRows.slice(1).map((row, i) => (
                <BeforeAfterCard key={i} row={row} lang={lang} />
              ))}
            </div>
          }
        />
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 04 · Activity + Campaign Last Changes ----------------------------- */
function ActivitySection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const maxCount = Math.max(...REAL.accountActivity.map((a) => a.count));
  return (
    <ProductSection tone="paper" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={t.actEyebrow} title={t.actTitle} body={t.actSub} align="center" />
        <Reveal delay={100} className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 text-left md:grid-cols-2">
          <div className="rounded-card border border-line bg-paper p-5">
            <p className="text-[13px] font-medium text-ink-950">{t.actActivityLabel}</p>
            <p className="mt-0.5 text-[11.5px] text-ink-400">{t.actTotal(REAL.totalChanges, REAL.period[lang])}</p>
            <div className="mt-4 flex flex-col gap-3">
              {REAL.accountActivity.map((a) => (
                <div key={a.account}>
                  <div className="flex items-baseline justify-between text-[12.5px]">
                    <span className="font-medium text-ink-800">{a.account}</span>
                    <span className="font-mono text-ink-500">{a.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper-soft">
                    <div className="h-full rounded-full bg-primary-500" style={{ width: `${(a.count / maxCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-card border border-line bg-paper p-5">
            <p className="text-[13px] font-medium text-ink-950">{t.actLastLabel}</p>
            <ul className="mt-4 flex flex-col divide-y divide-line">
              {REAL.lastChanges.map((row, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-[12.5px]">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">{row.campaign}</p>
                    <p className="truncate text-[11.5px] text-ink-500">{row.account}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11.5px] text-ink-500">{row.date[lang]}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 05 · Rule Matches -------------------------------------------------- */
function RuleMatchesSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const exampleRow = REAL.explorerRows[2]; // Campaign Beta, 80,000 -> 100,000 (+25%)
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={t.rulesEyebrow} title={t.rulesTitle} body={t.rulesSub} align="center" />
        <Reveal delay={100} className="mx-auto mt-12 max-w-2xl text-left">
          <div className="rounded-card border border-line bg-paper p-6">
            <p className="altor-eyebrow text-ink-400">{t.rulesMagnitudeLabel}</p>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
              {REAL.magnitudeRules.map((r) => (
                <div key={r.label.en} className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-700">{r.label[lang]}</span>
                  <span className="font-mono text-ink-950">±{r.value}%</span>
                </div>
              ))}
            </div>
            <p className="altor-eyebrow mt-6 text-ink-400">{t.rulesStructuralLabel}</p>
            <div className="mt-3 flex flex-col gap-2">
              {REAL.structuralRules.map((r) => (
                <label key={r.label.en} className="flex items-center gap-2.5 text-[13px] text-ink-700">
                  <span
                    aria-hidden
                    className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                      r.on ? "border-primary-600 bg-primary-600" : "border-line-strong bg-paper"
                    }`}
                  >
                    {r.on && <Check aria-hidden className="size-3 text-white" />}
                  </span>
                  {r.label[lang]}
                </label>
              ))}
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <p className="text-[12px] font-medium text-ink-400">{t.rulesExampleLabel}</p>
              <div className="mt-2 flex items-center justify-between gap-3 rounded-md bg-primary-50/70 px-3.5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-ink-900">
                    {exampleRow.campaign} · {exampleRow[lang].old} → {exampleRow[lang].new}
                  </p>
                  <p className="mt-0.5 text-[12px] text-primary-700">{t.rulesExampleNote}</p>
                </div>
                <span className="shrink-0 font-mono text-sm font-semibold text-primary-700">+25%</span>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={140} className="mx-auto mt-8 max-w-2xl border-l-2 border-primary-600 py-1 pl-5 text-left">
          <p className="text-sm font-medium text-ink-950">{t.principleTitle}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-600">{t.principleBody}</p>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 06 · One file, fully offline --------------------------------------- */
function OneFileSection({ t }: { t: (typeof T)[Lang] }) {
  return (
    <ProductSection tone="paper" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={t.fileEyebrow} title={t.fileTitle} body={t.fileSub} align="center" />
        <Reveal delay={100} className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-3">
          {t.fileFlow.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <span className="rounded-full border border-line-strong bg-paper px-4 py-2 text-sm font-medium text-ink-800">
                {step}
              </span>
              {i < t.fileFlow.length - 1 && <ArrowRight aria-hidden className="size-4 shrink-0 text-ink-300" />}
            </div>
          ))}
        </Reveal>
        <Reveal delay={140} className="mt-5 text-center">
          <p className="font-mono text-[12.5px] text-ink-400">{t.fileFormats}</p>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 07 · Install -------------------------------------------------------- */
function Install({ c, t, lang }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer className="max-w-2xl">
        <ProductHeading eyebrow={t.installEyebrow} title={t.installTitle} body={t.installSub} align="center" />
        <Reveal delay={80} className="mt-10">
          <p className="mb-3 text-[13px] font-medium text-ink-500">{t.toolStepLabel}</p>
          <ToolSelectorCards options={TOOL_OPTIONS} activeId="claude-code" />
        </Reveal>
        <Reveal delay={120} className="mt-8">
          <CodeTabs
            tabs={[
              { id: "claude", label: t.claudeTab, code: CLAUDE_CODE_CMD },
              { id: "python", label: t.pythonTab, code: PYTHON_CMD },
            ]}
            copyLabel={lang === "en" ? "Copy" : "Kopyala"}
            copiedLabel={lang === "en" ? "Copied" : "Kopyalandı"}
          />
        </Reveal>
        <Reveal delay={150} className="mt-6 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-500">
          <span className="rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-[11.5px] text-ink-700">
            {SELF_TEST_CMD}
          </span>
          <span>{t.selfTestNote}</span>
        </Reveal>
        <Reveal delay={180} className="mt-8 border-l-2 border-line-strong py-0.5 pl-4">
          <p className="text-sm font-medium text-ink-950">{t.reliabilityTitle}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-600">{t.reliabilityBody}</p>
        </Reveal>
        {repo && (
          <Reveal delay={200} className="mt-6">
            <a
              href={repo.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              {t.viewRepo} →
            </a>
          </Reveal>
        )}
      </PortraitContainer>
    </ProductSection>
  );
}

function Faq({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  if (!c.faq || c.faq.length === 0) return null;
  return (
    <ProductSection tone="paper" space="lg">
      <PortraitContainer className="max-w-2xl">
        <ProductHeading eyebrow={t.faqEyebrow} title={c.faqTitle ?? "FAQ"} />
        <Reveal delay={80} className="mt-10">
          <FaqAccordion items={c.faq} />
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

function Related({ c }: { c: SkillProductContent }) {
  if (c.related.length === 0) return null;
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <RelatedGrid title={c.relatedTitle} items={c.related} />
      </PortraitContainer>
    </ProductSection>
  );
}

function PageCta({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 py-24 text-white md:py-32">
      <PortraitContainer className="text-center">
        <Reveal>
          <p className="altor-eyebrow mb-5 text-white/45">{t.ctaEyebrow}</p>
          <h2 className="mx-auto max-w-2xl text-h2-fluid font-medium text-white">{t.ctaTitle}</h2>
        </Reveal>
        {repo && (
          <Reveal delay={90} className="mt-9 flex flex-wrap justify-center gap-3">
            <a
              href={repo.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-ink-950 transition-colors hover:bg-primary-50"
            >
              {repo.label}
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </Reveal>
        )}
      </PortraitContainer>
    </section>
  );
}

export default function ChangeHistoryExplorerPage({ lang, content }: { lang: Lang; content: SkillProductContent }) {
  const copyT = copy[lang];
  const t = T[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? `/tr/lab/${content.slug}` : `/lab/${content.slug}`;
  const path = lang === "en" ? `/lab/${content.slug}` : `/tr/lab/${content.slug}`;

  const appUrl =
    content.primaryLinks.find((l) => l.href.includes("github.com"))?.href ??
    content.primaryLinks.find((l) => l.href.startsWith("http"))?.href ??
    content.primaryLinks[0]?.href;
  const jsonLd: object[] = [
    breadcrumbList([
      { name: copyT.footer.home, url: home },
      { name: copyT.nav.lab, url: lang === "en" ? "/lab" : "/tr/lab" },
      { name: content.title, url: path },
    ]),
  ];
  if (content.appSchema && appUrl) {
    jsonLd.push(
      softwareApplication({
        name: content.title,
        description: content.sub,
        url: appUrl,
        applicationCategory: content.appSchema.applicationCategory,
        operatingSystem: content.appSchema.operatingSystem ?? "Cross-platform",
        ...(appUrl.includes("github.com") ? { codeRepository: appUrl } : {}),
      }),
    );
  }
  if (content.installSteps.length > 0) {
    jsonLd.push(
      howTo({
        name: content.installTitle,
        description: content.whatItDoes.body,
        steps: content.installSteps.map((s) => ({ name: s.title, text: s.desc ?? s.title })),
      }),
    );
  }

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <SiteHeader t={copyT} anchorBase={home} langHref={langHref} />
      <main>
        <Hero c={content} t={t} lang={lang} />
        <ChangeExplorerSection t={t} lang={lang} />
        <BeforeAfterSection t={t} lang={lang} />
        <ActivitySection t={t} lang={lang} />
        <RuleMatchesSection t={t} lang={lang} />
        <OneFileSection t={t} />
        <Install c={content} t={t} lang={lang} />
        <Faq c={content} t={t} />
        <Related c={content} />
        <PageCta c={content} t={t} />
      </main>
      <SiteFooter t={copyT} lang={lang} />
    </>
  );
}
