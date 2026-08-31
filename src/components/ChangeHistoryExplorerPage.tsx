import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import { ProductBenefitStory, ProductHeading, ProductSection } from "@/components/ui/ProductPage";
import { CodeTabs } from "@/components/ui/CodeTabs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGrid } from "@/components/ui/RelatedGrid";
import type { SkillProductContent } from "@/components/SkillProductPage";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { breadcrumbList, howTo, softwareApplication } from "@/lib/schema";
import { copy, type Lang } from "@/lib/content";

/* Google Ads Change History Explorer.

   SECOND REDESIGN PASS this session, using /lab/dashboard-builder as the
   editorial benchmark (product storytelling, section rhythm, mechanism-
   over-feature-list explanation, real UI over generic cards) - NOT as a
   visual template. Nothing here reuses dashboard-builder's own state-chip
   language or layout; the product visual here is this tool's own
   BrowserChrome + table UI, already this page's own idiom before this
   pass.

   REMOVED this pass, per explicit direction:
   - Human vs Automation as a feature. The Change Explorer's old USER
     column and its "Automation" pill are gone - not because the
     distinction is false (examples/dashboard-demo.html's
     `ads-budget-system` row really is automation-authored), but because
     surfacing it read as a primary classification the product doesn't
     actually make a feature of. "Who" is still real, unshown data, not a
     hidden capability.
   - The generic "Why it's different" template section (already gone from
     an earlier pass, confirmed still gone here).
   - The three-way tool picker in Install (Claude Code / Cursor / Codex
     ToolSelectorCards) - this tool is built for Claude Code and Python
     only; showing two greyed-out inactive cards read as three equal
     install paths where there are two.

   ADDED this pass:
   - A compact "Worked Example" transition between Hero and Change
     Explorer - one real row, shown large, before the full table appears.

   EVERY VALUE BELOW IS REAL, re-verified against
   examples/dashboard-demo.html this pass (not just carried over): the
   `DASH_DATA` JSON embedded in that file. Six Change Explorer rows now
   (was four) - the two added are the file's first Budget row (Campaign
   Alpha, 150,000 -> 200,000, the account's single largest change, used
   for the Worked Example) and its Bidding row (3.50 -> 4.20). Campaign
   Last Changes now shows each campaign's real
   `days_since_last_change_at_generation` (14/13/11/10/0) instead of the
   previous pass's absolute dates - both are equally real; this is a
   presentation choice, not a data change, made because the tool's own
   README frames this exact fact as "hasn't changed in N days," and this
   is a frozen demo snapshot already understood as illustrative (the
   whole page's Aug 2026 dates are), not a live "days ago" claim.

   The Rule Matches magnitude defaults (Budget ±50%, Target CPA ±30%,
   Target ROAS ±30%, Bid/CPC ±50%) and structural defaults (paused/
   removed/ad-group-removed on, enabled off) are, again, the demo file's
   own "Configure rules" panel - re-read this pass, unchanged from the
   prior one, and still not the ±20/±15/±10 a draft brief for this pass
   proposed. No row in the real 10-row dataset actually crosses the real
   ±50% budget default (the two real budget increases are +25% and
   +33%), so the worked "matched a rule" example states its own ±20%
   threshold explicitly rather than implying it's the tool's default. */

const REAL = {
  explorerRows: [
    { campaign: "Campaign Alpha", account: "Account A", adGroup: "—", category: "Budget", en: { date: "Aug 1, 2026 · 9:12 AM", old: "150,000", new: "200,000" }, tr: { date: "1 Ağu 2026 · 09:12", old: "150.000", new: "200.000" } },
    { campaign: "Campaign Alpha", account: "Account A", adGroup: "Ad Group 1", category: "Bidding", en: { date: "Aug 1, 2026 · 9:15 AM", old: "3.50", new: "4.20" }, tr: { date: "1 Ağu 2026 · 09:15", old: "3,50", new: "4,20" } },
    { campaign: "Campaign Beta", account: "Account A", adGroup: "—", category: "Budget", en: { date: "Aug 3, 2026 · 2:22 PM", old: "80,000", new: "100,000" }, tr: { date: "3 Ağu 2026 · 14:22", old: "80.000", new: "100.000" } },
    { campaign: "Campaign Alpha", account: "Account A", adGroup: "—", category: "Status", en: { date: "Aug 4, 2026 · 8:40 AM", old: "Enabled", new: "Paused" }, tr: { date: "4 Ağu 2026 · 08:40", old: "Etkin", new: "Duraklatıldı" } },
    { campaign: "Campaign Gamma", account: "Account B", adGroup: "—", category: "Budget", en: { date: "Aug 6, 2026 · 10:00 AM", old: "50,000", new: "45,000" }, tr: { date: "6 Ağu 2026 · 10:00", old: "50.000", new: "45.000" } },
    { campaign: "Campaign Alpha", account: "Account B", adGroup: "—", category: "Status", en: { date: "Aug 17, 2026 · 9:45 AM", old: "Enabled", new: "Paused" }, tr: { date: "17 Ağu 2026 · 09:45", old: "Etkin", new: "Duraklatıldı" } },
  ],
  // Each campaign's real days_since_last_change_at_generation, from the
  // demo file's own "untouched" array - a fact the tool itself computes
  // and states this way, not a relative "ago" claim about today.
  lastChanges: [
    { campaign: "Campaign Beta", account: "Account A", days: 14 },
    { campaign: "Campaign Alpha", account: "Account A", days: 13 },
    { campaign: "Campaign Gamma", account: "Account B", days: 11 },
    { campaign: "Campaign Delta", account: "Account B", days: 10 },
    { campaign: "Campaign Alpha", account: "Account B", days: 0 },
  ],
  accountActivity: [
    { account: "Account A", count: 6 },
    { account: "Account B", count: 4 },
  ],
  totalChanges: 10,
  period: { en: "Aug 1 - 17, 2026", tr: "1 - 17 Ağustos 2026" },
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
    sub: "Turn Google Ads Change History into a searchable dashboard with the campaign, category, previous value, new value and timestamp behind every change.",
    ctaGithub: "View on GitHub",
    proof: ["Zero dependencies", "Works fully offline", "57 self-test checks"],

    workedEyebrow: "One real change",
    workedLine1: "A change log tells you something happened.",
    workedLine2: "The dashboard shows exactly what moved.",

    explorerEyebrow: "Change Explorer",
    explorerTitle: "Every change, classified and searchable.",
    explorerSub: "Search and filter across accounts, campaigns, dates and change categories - then open any record to inspect the exact change.",
    explorerCols: ["Date", "Account", "Campaign", "Ad group", "Category", "Old value", "New value"],

    baEyebrow: "Before / After",
    baTitle: "Before and after are shown together.",
    baSub: "Open any change to see what existed before, what replaced it, and the campaign it happened in.",

    actEyebrow: "Activity",
    actTitle: "See what changed - and what hasn't.",
    actSub: "One view of how often each account changes; another of when each campaign was last touched.",
    actActivityLabel: "Change activity by account",
    actLastLabel: "Campaign last changes",
    actTotal: (n: number, period: string) => `${n} changes · ${period}`,
    daysSince: (n: number) => (n === 0 ? "Changed today" : n === 1 ? "1 day since last change" : `${n} days since last change`),

    rulesEyebrow: "Rule Matches",
    rulesTitle: "Set your own change thresholds.",
    rulesSub: "Off by default. Create a magnitude or structural rule, computed entirely in the browser - a match is only ever shown as a match, never scored or ranked.",
    rulesMagnitudeLabel: "Magnitude (±% change)",
    rulesStructuralLabel: "Structural",
    rulesExampleLabel: "Example - with Budget change set to ±20%",
    rulesExampleNote: "Matched the ±20% rule you set",
    principleTitle: "Factual by design.",
    principleBody: "The dashboard reports what happened. It doesn't label a change as good, bad or risky.",

    fileEyebrow: "Portable",
    fileTitle: "One dashboard. One HTML file.",
    fileSub: "Generate a standalone dashboard that works locally, with no server, CDN or external dependency to install.",
    fileFlow: ["Google Ads export", "Run", "dashboard.html"],
    fileFormats: "CSV · TSV · ChangeEvent JSON",
    fileNote: "Open it locally, archive it, or send it as a plain attachment.",

    installEyebrow: "Install",
    installTitle: "Install",
    installSub: "No account, no API key, no dependencies to install.",
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
    sub: "Google Ads Değişiklik Geçmişi'ni aranabilir bir dashboard'a çevirin - her değişikliğin arkasındaki kampanya, kategori, önceki değer, yeni değer ve zaman damgasıyla.",
    ctaGithub: "GitHub'da görüntüle",
    proof: ["Sıfır bağımlılık", "Tamamen çevrimdışı çalışır", "57 self-test kontrolü"],

    workedEyebrow: "Gerçek bir değişiklik",
    workedLine1: "Bir değişiklik günlüğü bir şeyin olduğunu söyler.",
    workedLine2: "Pano tam olarak neyin değiştiğini gösterir.",

    explorerEyebrow: "Change Explorer",
    explorerTitle: "Her değişiklik sınıflandırılmış ve aranabilir.",
    explorerSub: "Hesaba, kampanyaya, tarihe ve değişiklik kategorisine göre arayın ve filtreleyin - sonra herhangi bir kaydı açıp tam değişikliği inceleyin.",
    explorerCols: ["Tarih", "Hesap", "Kampanya", "Reklam grubu", "Kategori", "Eski değer", "Yeni değer"],

    baEyebrow: "Öncesi / Sonrası",
    baTitle: "Öncesi ve sonrası birlikte gösterilir.",
    baSub: "Herhangi bir değişikliği açın; öncesinde ne vardı, yerine ne geldi ve hangi kampanyada olduğunu görün.",

    actEyebrow: "Aktivite",
    actTitle: "Ne değişti - ne değişmedi görün.",
    actSub: "Bir tarafta her hesabın ne sıklıkla değiştiği; diğer tarafta her kampanyaya en son ne zaman dokunulduğu.",
    actActivityLabel: "Hesaba göre değişiklik aktivitesi",
    actLastLabel: "Kampanya son değişiklikleri",
    actTotal: (n: number, period: string) => `${n} değişiklik · ${period}`,
    daysSince: (n: number) => (n === 0 ? "Bugün değişti" : n === 1 ? "Son değişiklikten bu yana 1 gün" : `Son değişiklikten bu yana ${n} gün`),

    rulesEyebrow: "Rule Matches",
    rulesTitle: "Kendi değişiklik eşiklerinizi belirleyin.",
    rulesSub: "Varsayılan olarak kapalı. Bir büyüklük ya da yapısal kural belirleyin - tamamen tarayıcıda hesaplanır, bir eşleşme yalnızca eşleşme olarak gösterilir, asla puanlanmaz ya da sıralanmaz.",
    rulesMagnitudeLabel: "Büyüklük (±% değişim)",
    rulesStructuralLabel: "Yapısal",
    rulesExampleLabel: "Örnek - Bütçe değişimi ±%20 olarak ayarlandığında",
    rulesExampleNote: "Ayarladığınız ±%20 kuralıyla eşleşti",
    principleTitle: "Tasarım gereği tarafsız.",
    principleBody: "Pano ne olduğunu raporlar. Bir değişikliği iyi, kötü ya da riskli olarak etiketlemez.",

    fileEyebrow: "Taşınabilir",
    fileTitle: "Tek pano. Tek HTML dosyası.",
    fileSub: "Sunucu, CDN ya da kurulacak bir dış bağımlılık olmadan yerelde çalışan bağımsız bir pano üretin.",
    fileFlow: ["Google Ads dışa aktarımı", "Çalıştır", "dashboard.html"],
    fileFormats: "CSV · TSV · ChangeEvent JSON",
    fileNote: "Yerelde açın, arşivleyin ya da sade bir ek olarak gönderin.",

    installEyebrow: "Kurulum",
    installTitle: "Kurulum",
    installSub: "Hesap yok, API anahtarı yok, kurulacak bağımlılık yok.",
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

const CLAUDE_CODE_CMD = `/plugin marketplace add ali-demirbas/google-ads-change-history-dashboard\n/plugin install google-ads-change-history-dashboard@google-ads-change-history-dashboard`;
const PYTHON_CMD = `python3 ads_change_history.py run export.csv --out-dir ./out --open`;
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

/** One record, phone-width: the same fields the table shows, stacked
    instead of spread across seven columns nothing under ~700px can fit
    without clipping. Same visual language as BeforeAfterCard - this is
    the same data, a narrower frame. */
function ExplorerRecordCard({ row, lang }: { row: (typeof REAL.explorerRows)[number]; lang: Lang }) {
  return (
    <div className="border-b border-line px-4 py-3 last:border-0">
      <div className="flex items-center justify-between gap-2">
        <CategoryBadge category={row.category} />
        <span className="font-mono text-[11px] text-ink-400">{row[lang].date}</span>
      </div>
      <p className="mt-2 truncate text-[13px] font-medium text-ink-900">{row.campaign}</p>
      <p className="truncate text-[11.5px] text-ink-500">
        {row.account}
        {row.adGroup !== "—" ? ` · ${row.adGroup}` : ""}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="rounded-md bg-[#fdf3f0] px-2 py-1 font-mono text-[12px] text-[#c65d3f] line-through decoration-1">
          {row[lang].old}
        </span>
        <ArrowRight aria-hidden className="size-3.5 shrink-0 text-ink-300" />
        <span className="rounded-md bg-emerald-50 px-2 py-1 font-mono text-[12px] font-medium text-emerald-700">
          {row[lang].new}
        </span>
      </div>
    </div>
  );
}

/** The real Change Explorer table, real rows - no USER column (see the
    file header comment on why that was dropped). `compact` also drops
    the Ad group column and shows fewer rows, for the hero's condensed
    preview. Below ~640px the table gives way to ExplorerRecordCard: a
    7-column table has no honest way to fit a phone width, and scrolling
    it sideways inside a card reads as broken, not as a feature. */
function ExplorerTable({ lang, compact = false }: { lang: Lang; compact?: boolean }) {
  const t = T[lang];
  const rows = compact ? REAL.explorerRows.slice(0, 4) : REAL.explorerRows;
  const cols = compact ? t.explorerCols.filter((_, i) => i !== 3) : t.explorerCols;
  return (
    <>
      <div className="sm:hidden">
        {rows.map((r, i) => (
          <ExplorerRecordCard key={i} row={r} lang={lang} />
        ))}
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[560px] border-collapse text-left text-[12.5px]">
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
    </>
  );
}

/* ---- 01 · Hero ------------------------------------------------------ */
function Hero({ c, t, lang }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  return (
    <section className="relative isolate overflow-hidden bg-paper pt-16 pb-20 md:pt-20 md:pb-24">
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
              {t.ctaGithub}
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </Reveal>
        )}
        {/* Trust strip - small, secondary to the CTA and the product visual. */}
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

/* ---- 02 · Worked example --------------------------------------------- */
/* Compact transition, not a section in its own right - one real row,
   shown large, before the full Change Explorer table below it makes the
   same point at scale. */
function WorkedExampleSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const row = REAL.explorerRows[0]; // Campaign Alpha, Budget 150,000 -> 200,000 (+33%)
  return (
    <ProductSection tone="soft" space="band">
      <PortraitContainer>
        <Reveal className="mx-auto max-w-md">
          <p className="mb-3 text-center text-[11px] font-medium tracking-wide text-ink-400 uppercase">{t.workedEyebrow}</p>
          <div className="rounded-card border border-line bg-paper p-5">
            <div className="flex items-center justify-between gap-3">
              <CategoryBadge category={row.category} />
              <span className="font-mono text-[11px] text-ink-400">{row[lang].date}</span>
            </div>
            <div className="mt-3 flex items-center gap-2.5">
              <span className="rounded-md bg-[#fdf3f0] px-2.5 py-1.5 font-mono text-base text-[#c65d3f] line-through decoration-1">
                {row[lang].old}
              </span>
              <ArrowRight aria-hidden className="size-4 shrink-0 text-ink-300" />
              <span className="rounded-md bg-emerald-50 px-2.5 py-1.5 font-mono text-base font-medium text-emerald-700">
                {row[lang].new}
              </span>
              <span className="ml-auto font-mono text-[13px] font-semibold text-ink-500">+33%</span>
            </div>
            <p className="mt-3 text-[12.5px] text-ink-500">
              {row.campaign} · {row.account}
            </p>
          </div>
        </Reveal>
        <Reveal delay={90} className="mx-auto mt-8 max-w-lg text-center">
          <p className="text-lg leading-relaxed text-ink-950/70">{t.workedLine1}</p>
          <p className="text-lg leading-relaxed font-medium text-ink-950">{t.workedLine2}</p>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 03 · Change Explorer -------------------------------------------- */
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

/* ---- 04 · Before / After ---------------------------------------------- */
function BeforeAfterCard({ row, lang }: { row: (typeof REAL.explorerRows)[number]; lang: Lang }) {
  return (
    <div className="rounded-card border border-line bg-paper p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13px] font-medium text-ink-900">{row.campaign}</p>
        <CategoryBadge category={row.category} />
      </div>
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
  // 4 fragments spanning three real categories - budget up, a bid
  // increase, a status flip, and a budget cut - not four of the same shape.
  const rows = [REAL.explorerRows[0], REAL.explorerRows[1], REAL.explorerRows[3], REAL.explorerRows[4]];
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <ProductBenefitStory
          eyebrow={t.baEyebrow}
          title={t.baTitle}
          body={t.baSub}
          side="right"
          visual={
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {rows.map((row, i) => (
                <BeforeAfterCard key={i} row={row} lang={lang} />
              ))}
            </div>
          }
        />
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 05 · Activity + Campaign Last Changes ----------------------------- */
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
                  <span className="shrink-0 text-right text-[11.5px] text-ink-500">{t.daysSince(row.days)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 06 · Rule Matches -------------------------------------------------- */
function RuleMatchesSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const exampleRow = REAL.explorerRows[2]; // Campaign Beta, 80,000 -> 100,000 (+25%)
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={t.rulesEyebrow} title={t.rulesTitle} body={t.rulesSub} align="center" />
        <Reveal delay={100} className="mx-auto mt-12 max-w-2xl text-left">
          <div className="rounded-card border border-line bg-paper p-6">
            <p className="altor-eyebrow text-ink-400">{t.rulesMagnitudeLabel}</p>
            <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {REAL.magnitudeRules.map((r) => (
                <div key={r.label.en} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="text-ink-700">{r.label[lang]}</span>
                  <span className="shrink-0 font-mono text-ink-950">±{r.value}%</span>
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

/* ---- 07 · Portable offline dashboard --------------------------------------- */
function OneFileSection({ t }: { t: (typeof T)[Lang] }) {
  return (
    <ProductSection tone="paper" space="md">
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
          <p className="mt-2 text-[12.5px] text-ink-500">{t.fileNote}</p>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 08 · Install -------------------------------------------------------- */
function Install({ c, t, lang }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  return (
    <ProductSection tone="soft" space="md">
      <PortraitContainer className="max-w-2xl">
        <ProductHeading eyebrow={t.installEyebrow} title={t.installTitle} body={t.installSub} align="center" />
        <Reveal delay={100} className="mt-10">
          <CodeTabs
            tabs={[
              { id: "claude", label: t.claudeTab, code: CLAUDE_CODE_CMD },
              { id: "python", label: t.pythonTab, code: PYTHON_CMD },
            ]}
            copyLabel={lang === "en" ? "Copy" : "Kopyala"}
            copiedLabel={lang === "en" ? "Copied" : "Kopyalandı"}
          />
        </Reveal>
        <Reveal delay={140} className="mt-6 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-500">
          <span className="rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-[11.5px] text-ink-700">
            {SELF_TEST_CMD}
          </span>
          <span>{t.selfTestNote}</span>
        </Reveal>
        <Reveal delay={170} className="mt-8 border-l-2 border-line-strong py-0.5 pl-4">
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
              {t.ctaGithub}
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
        <WorkedExampleSection t={t} lang={lang} />
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
