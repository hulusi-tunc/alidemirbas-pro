import { AppWindow, ArrowRight, ArrowUpRight, Blocks, Check, Clock, FileCode2, FileSpreadsheet, Play, Power, ShieldAlert, Users, Wallet } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { buttonStyles } from "@/components/ui/Button";
import { PixelFill } from "@/components/ui/PixelFill";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { InstallPanel } from "@/components/ui/InstallPanel";
import { ProductFrame, ProductMark } from "@/components/ui/ProductFrame";
import { Reveal } from "@/components/ui/Reveal";
import { ProductBenefitStory, ProductHeading, ProductSection } from "@/components/ui/ProductPage";
import { ChangeCell, explorerTabLabel, explorerTabs, ExplorerWindow, explorerDelta } from "@/components/ui/LabProductWindows";
import { AppBar, AppMeta, AppTitle, Badge, CheckRow, Field, FormLabel, Rail, Table, TabStrip, Td, Th, Toggle, Tr, Window } from "@/components/ui/LabWindow";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import type { SkillProductContent } from "@/components/SkillProductPage";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { breadcrumbList, softwareApplication } from "@/lib/schema";
import { clsx } from "@/lib/clsx";
import { copy, type Lang } from "@/lib/content";
import { CHANGE_HISTORY_REAL } from "@/lib/lab-material";

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

const REAL = CHANGE_HISTORY_REAL;

const T = {
  en: {
    eyebrow: "Lab / Google Ads Change History",
    title: "See what changed in Google Ads, when it changed, and who changed it.",
    sub: "Turns your exported Google Ads change history into a searchable dashboard, with campaign, category, before-and-after values, and timestamps in one place.",
    ctaGithub: "View on GitHub",
    proof: ["No dependencies", "Runs fully offline", "Built-in self-test"],

    workedEyebrow: "One real change",
    workedLine1: "The export records that a change happened.",
    workedLine2: "The dashboard shows exactly what changed.",

    explorerEyebrow: "Search and filter",
    explorerTitle: "Find the change you're looking for.",
    explorerSub: "Filter by account, campaign, date, or category. Open any record to see the full change.",
    explorerCols: ["Date", "Account", "Campaign", "Ad group", "Category", "Old value", "New value"],

    baEyebrow: "Before / After",
    baTitle: "Old and new values, side by side.",
    baSub: "Open a record to see the previous value, new value, campaign, and timestamp in one place.",

    actEyebrow: "Activity",
    actTitle: "Track account and campaign activity.",
    actSub: "See change volume by account and the latest change date for each campaign.",
    actActivityLabel: "Change activity by account",
    actLastLabel: "Campaign last changes",
    actTotal: (n: number, period: string) => `${n} changes · ${period}`,
    daysSince: (n: number) => (n === 0 ? "Changed today" : n === 1 ? "1 day since last change" : `${n} days since last change`),

    rulesEyebrow: "Rule matches",
    rulesTitle: "Set the thresholds that matter to you.",
    rulesSub: "Define thresholds for budget, Target CPA, Target ROAS, or bid changes. You can also track structural changes such as pauses and removals. Matches are shown, not scored.",
    rulesMagnitudeLabel: "Magnitude (±% change)",
    rulesStructuralLabel: "Structural",
    rulesExampleLabel: "Example: budget change set to ±20%",
    rulesExampleNote: "Matched the ±20% rule you set",
    principleTitle: "It shows what changed. You decide what it means.",
    principleBody: "The dashboard doesn't score or rank changes as good, bad, or risky.",

    fileEyebrow: "Single file",
    fileTitle: "The dashboard runs as a single HTML file.",
    fileSub: "No server, CDN, or external dependency required.",
    fileFlow: ["Google Ads export", "Run", "dashboard.html"],
    fileFormats: "CSV · TSV · ChangeEvent JSON",
    fileNote: "Open it locally, archive it, or share it.",

    installEyebrow: "Install",
    installTitle: "Install",
    installSub: "No account or API key required. It works locally from your exported file.",
    stepInstall: "Install it, or run the script directly",
    stepTest: "Run the self-test",
    claudeTab: "Claude Code",
    pythonTab: "Python",
    selfTestNote: "Run the built-in checks with a single command.",
    reliabilityTitle: "It doesn't stay quiet on errors.",
    reliabilityBody: "Ambiguous dates or unknown columns stop the run instead of being silently interpreted.",
    viewRepo: "Read the repo",

    faqEyebrow: "FAQ",
    ctaEyebrow: "OPEN SOURCE",
    ctaTitle: "Turn your account's change history into something you can search.",
  },
  tr: {
    eyebrow: "Lab / Google Ads Değişiklik Geçmişi",
    title: "Google Ads'te neyin, ne zaman ve kim tarafından değiştirildiğini gör.",
    sub: "Dışa aktardığın Google Ads değişiklik geçmişini aranabilir bir dashboard'a dönüştürür. Kampanya, kategori, eski-yeni değer ve zaman bilgisi aynı yerde.",
    ctaGithub: "GitHub'da görüntüle",
    proof: ["Bağımlılık yok", "Tamamen çevrimdışı çalışır", "Yerleşik self-test"],

    workedEyebrow: "Gerçek bir değişiklik",
    workedLine1: "Dışa aktarım bir değişiklik yapıldığını kaydeder.",
    workedLine2: "Dashboard tam olarak neyin değiştiğini gösterir.",

    explorerEyebrow: "Arama ve filtre",
    explorerTitle: "İhtiyacın olan değişikliği hızlıca bul.",
    explorerSub: "Hesap, kampanya, tarih veya kategoriye göre filtrele. Bir kaydı açtığında değişikliğin tüm detayını gör.",
    explorerCols: ["Tarih", "Hesap", "Kampanya", "Reklam grubu", "Kategori", "Eski değer", "Yeni değer"],

    baEyebrow: "Öncesi / Sonrası",
    baTitle: "Eski ve yeni değer yan yana.",
    baSub: "Bir kaydı açtığında önceki değer, yeni değer, kampanya ve zaman bilgisi tek yerde görünür.",

    actEyebrow: "Aktivite",
    actTitle: "Hesap ve kampanya aktivitesini takip et.",
    actSub: "Hesap bazında değişiklik yoğunluğunu, kampanya bazında son değişiklik tarihini gör.",
    actActivityLabel: "Hesaba göre değişiklik aktivitesi",
    actLastLabel: "Kampanya son değişiklikleri",
    actTotal: (n: number, period: string) => `${n} değişiklik · ${period}`,
    daysSince: (n: number) => (n === 0 ? "Bugün değişti" : n === 1 ? "Son değişiklikten bu yana 1 gün" : `Son değişiklikten bu yana ${n} gün`),

    rulesEyebrow: "Kural eşleşmeleri",
    rulesTitle: "Eşikleri sen belirle.",
    rulesSub: "Bütçe, Target CPA, Target ROAS veya teklif değişimleri için eşik tanımla. İstersen duraklatma ve kaldırma gibi yapısal değişiklikleri de takip et. Eşleşmeler gösterilir, puanlanmaz.",
    rulesMagnitudeLabel: "Büyüklük (±% değişim)",
    rulesStructuralLabel: "Yapısal",
    rulesExampleLabel: "Örnek: bütçe değişimi ±%20 olarak ayarlandığında",
    rulesExampleNote: "Ayarladığın ±%20 kuralıyla eşleşti",
    principleTitle: "Ne olduğunu gösterir, ne anlama geldiğine sen karar verirsin.",
    principleBody: "Dashboard değişiklikleri iyi, kötü veya riskli diye puanlamaz ya da sıralamaz.",

    fileEyebrow: "Tek dosya",
    fileTitle: "Dashboard tek bir HTML dosyası olarak çalışır.",
    fileSub: "Sunucuya, CDN'e veya ek bağımlılığa ihtiyaç duymaz.",
    fileFlow: ["Google Ads dışa aktarımı", "Çalıştır", "dashboard.html"],
    fileFormats: "CSV · TSV · ChangeEvent JSON",
    fileNote: "Yerelde açabilir, arşivleyebilir veya paylaşabilirsin.",

    installEyebrow: "Kurulum",
    installTitle: "Kurulum",
    installSub: "Hesap veya API anahtarı gerekmez. Dışa aktardığın dosyayla yerelde çalışır.",
    stepInstall: "Kur ya da betiği doğrudan çalıştır",
    stepTest: "Self-test'i çalıştır",
    claudeTab: "Claude Code",
    pythonTab: "Python",
    selfTestNote: "Temel kontrolleri tek komutla çalıştır.",
    reliabilityTitle: "Hata olduğunda sessiz kalmaz.",
    reliabilityBody: "Belirsiz tarihler ya da tanınmayan sütunlar, sessizce yorumlanmak yerine çalıştırmayı durdurur.",
    viewRepo: "Repoyu oku",

    faqEyebrow: "SSS",
    ctaEyebrow: "AÇIK KAYNAK",
    ctaTitle: "Hesabındaki değişiklik geçmişini aranabilir hâle getir.",
  },
} as const;

const CLAUDE_CODE_CMD = `/plugin marketplace add ali-demirbas/google-ads-change-history-dashboard\n/plugin install google-ads-change-history-dashboard@google-ads-change-history-dashboard`;
const PYTHON_CMD = `python3 ads_change_history.py run export.csv --out-dir ./out --open`;
const SELF_TEST_CMD = `python3 ads_change_history.py self-test`;

/* ---- Shared bits -------------------------------------------------- */

/* The row's own category is a fixed English id (also the key the demo's
   filter and rule logic matches on, e.g. `row.category === "Budget"`) -
   never changes. Only the text shown here is per-language, matching how
   Google Ads' own Turkish interface names these same change types. */
const CATEGORY_LABEL: Record<string, { en: string; tr: string }> = {
  Status: { en: "Status", tr: "Durum" },
  Budget: { en: "Budget", tr: "Bütçe" },
  Bidding: { en: "Bidding", tr: "Teklif verme" },
  Keyword: { en: "Keyword", tr: "Anahtar kelime" },
};

function CategoryBadge({ category, lang }: { category: string; lang: Lang }) {
  const styles: Record<string, string> = {
    Status: "bg-emerald-50 text-emerald-700",
    Budget: "bg-primary-50 text-primary-700",
    Bidding: "bg-violet-50 text-violet-700",
    Keyword: "bg-sky-50 text-sky-700",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${styles[category] ?? "bg-paper-soft text-ink-600"}`}>
      {CATEGORY_LABEL[category]?.[lang] ?? category}
    </span>
  );
}

/* ---- The product's surfaces, drawn --------------------------------
   Hulusi (2026-09-06): the Lab's product visuals must "feel like real
   product screenshots, not Claude design". The dashboard this tool
   writes is one HTML file with named sections (README: Filters, Summary,
   Activity Timeline, User Activity, Account/Campaign drill-down, Category
   Distribution, Rule Matches, Campaign Last Changes, Change Explorer with
   a before/after detail panel), so the page now shows THAT: the Change
   Explorer with its tabs, filters and detail pane
   (ui/LabProductWindows.tsx), and below, two more of its sections drawn
   the same way - User Activity beside Campaign Last Changes, and Rule
   Matches with the thresholds panel open and the rows it matches. Every
   value is the demo dataset's own; the matches are computed from it. */

const WIN = {
  en: {
    activity: { label: "Screenshot of the dashboard's activity sections: changes per account, and each campaign's days since its last change.", campaign: "Campaign", account: "Account", last: "Last change" },
    rules: { label: "Screenshot of the dashboard's Rule Matches section: the thresholds panel with a budget rule set to ±20%, and the four rows it matches.", matches: (n: number) => `${n} matches`, campaign: "Campaign", rule: "Rule", change: "Change", budgetRule: (v: number) => `Budget ±${v}%` },
  },
  tr: {
    activity: { label: "Dashboard'un aktivite bölümleri: hesap başına değişiklik ve her kampanyanın son değişikliğinden bu yana geçen gün.", campaign: "Kampanya", account: "Hesap", last: "Son değişiklik" },
    rules: { label: "Dashboard'un kural eşleşmeleri bölümü: bütçe kuralı ±%20'ye ayarlanmış eşik paneli ve eşleştirdiği dört satır.", matches: (n: number) => `${n} eşleşme`, campaign: "Kampanya", rule: "Kural", change: "Değişim", budgetRule: (v: number) => `Bütçe ±%${v}` },
  },
} as const;

/** User Activity beside Campaign Last Changes - the two sections of the
    dashboard that answer "what changed, and what hasn't". */
function ActivityWindow({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const w = WIN[lang].activity;
  const maxCount = Math.max(...REAL.accountActivity.map((a) => a.count));
  return (
    <Window label={w.label} address="dashboard.html" meta={t.actTotal(REAL.totalChanges, REAL.period[lang])}>
      <TabStrip items={explorerTabs(lang)} active={explorerTabLabel("User Activity", lang)} />
      {/* Side by side only when the WINDOW is wide enough (a container
          query): inside a story column the two panes stack. */}
      <div className="@container">
      <div className="grid grid-cols-1 divide-y divide-line-soft @2xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] @2xl:divide-x @2xl:divide-y-0">
        <div className="min-w-0">
          <AppBar>
            <AppTitle icon={<Users aria-hidden />}>{t.actActivityLabel}</AppTitle>
          </AppBar>
          <div className="flex flex-col gap-3.5 px-3.5 py-3.5">
            {REAL.accountActivity.map((a) => (
              <div key={a.account}>
                <div className="flex items-baseline justify-between text-[13px]">
                  <span className="font-medium text-ink-900">{a.account}</span>
                  <span className="text-[12.5px] text-ink-500 tabular-nums">{a.count}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-soft">
                  <div className="h-full rounded-full bg-primary-500" style={{ width: `${(a.count / maxCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <AppBar>
            <AppTitle icon={<Clock aria-hidden />}>{t.actLastLabel}</AppTitle>
            <AppMeta className="ml-auto">{REAL.lastChanges.length}</AppMeta>
          </AppBar>
          <Table>
            <thead>
              <tr>
                <Th className="w-full">{w.campaign}</Th>
                <Th className="hidden sm:table-cell">{w.account}</Th>
                <Th className="text-right">{w.last}</Th>
              </tr>
            </thead>
            <tbody>
              {REAL.lastChanges.map((row, i) => (
                <Tr key={i}>
                  <Td className="w-full max-w-0">
                    <span className="block truncate font-semibold text-ink-950">{row.campaign}</span>
                  </Td>
                  <Td className="hidden whitespace-nowrap text-ink-700 sm:table-cell">{row.account}</Td>
                  <Td className="text-right text-[12.5px] whitespace-nowrap text-ink-600 tabular-nums">{t.daysSince(row.days)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
      </div>
    </Window>
  );
}

/* The section's own worked threshold: the text above the example says
   "with Budget change set to ±20%", so the panel shows that value in the
   Budget field and the shipped defaults in the other three. No row in
   the demo crosses the shipped ±50% (its budget changes are +25%, +33%
   and -10%); at ±20% two do, and the two Enabled -> Paused rows match the
   shipped "Campaign paused" structural rule. All computed from the rows. */
const BUDGET_EXAMPLE_THRESHOLD = 20;

/** Rule Matches: the thresholds panel open, the rules as the tool ships
    them but for the one this section sets, and the rows they match. */
function RuleMatchesWindow({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const w = WIN[lang].rules;
  const rules = REAL.magnitudeRules.map((r) => (r.label.en === "Budget change" ? { ...r, value: BUDGET_EXAMPLE_THRESHOLD } : r));
  const paused = REAL.structuralRules.find((r) => r.label.en === "Campaign paused");
  const matches = REAL.explorerRows.flatMap((row) => {
    if (row.category === "Budget") {
      const delta = explorerDelta(row);
      const pct = delta ? Math.abs(Number(delta.replace(/[+%]/g, ""))) : 0;
      return pct >= BUDGET_EXAMPLE_THRESHOLD ? [{ row, rule: w.budgetRule(BUDGET_EXAMPLE_THRESHOLD), delta, structural: false }] : [];
    }
    if (row.category === "Status" && row.en.new === "Paused" && paused?.on) {
      return [{ row, rule: paused.label[lang], delta: null, structural: true }];
    }
    return [];
  });
  return (
    <Window label={w.label} address="dashboard.html" meta={w.matches(matches.length)}>
      <TabStrip items={explorerTabs(lang)} active={explorerTabLabel("Rule Matches", lang)} />
      <div className="flex">
        <Rail className="hidden w-64 md:block">
          <div className="px-3.5 py-3.5">
            <Toggle on label={t.rulesEyebrow} />
            <div className="mt-4">
              <FormLabel>{t.rulesMagnitudeLabel}</FormLabel>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-2.5 gap-y-2.5">
              {rules.map((r) => (
                <Field key={r.label.en} label={r.label[lang]} value={`±${r.value}%`} mono />
              ))}
            </div>
            <div className="mt-4">
              <FormLabel>{t.rulesStructuralLabel}</FormLabel>
            </div>
            <div className="mt-1">
              {REAL.structuralRules.map((r) => (
                <CheckRow key={r.label.en} on={r.on}>
                  {r.label[lang]}
                </CheckRow>
              ))}
            </div>
          </div>
        </Rail>
        <div className="min-w-0 flex-1">
          <AppBar>
            <AppTitle icon={<ShieldAlert aria-hidden />}>{t.rulesExampleLabel}</AppTitle>
          </AppBar>
          <Table>
            <thead>
              <tr>
                <Th className="w-full">{w.campaign}</Th>
                <Th className="hidden sm:table-cell">{w.rule}</Th>
                <Th>{w.change}</Th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m, i) => {
                const badge = (
                  <Badge hue={m.structural ? "emerald" : "primary"} icon={m.structural ? <Power aria-hidden /> : <Wallet aria-hidden />}>
                    {m.rule}
                  </Badge>
                );
                return (
                  <Tr key={i}>
                    <Td className="w-full max-w-0 min-w-[7rem]">
                      <span className="block truncate font-semibold text-ink-950">{m.row.campaign}</span>
                      <span className="hidden truncate text-[12px] text-ink-500 tabular-nums sm:block">
                        {m.row.account} · {m.row[lang].date}
                      </span>
                      <span className="mt-1.5 block sm:hidden">{badge}</span>
                    </Td>
                    <Td className="hidden whitespace-nowrap sm:table-cell">{badge}</Td>
                    <Td className="sm:whitespace-nowrap">
                      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <ChangeCell row={m.row} lang={lang} />
                        {m.delta && <span className="font-mono text-[12.5px] font-semibold text-primary-700 tabular-nums">{m.delta}</span>}
                      </span>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
          <p className="border-t border-line-soft px-3.5 py-2.5 text-[12.5px] text-ink-500">{t.rulesExampleNote}</p>
        </div>
      </div>
    </Window>
  );
}

/* ---- 01 · Hero ------------------------------------------------------ */
function Hero({ c, t, lang }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  return (
    <section className="relative isolate overflow-hidden bg-paper pt-16 pb-20 md:pt-20 md:pb-24">
      <PortraitContainer className="text-center">
        <Reveal>
          <ProductMark slug="google-ads-change-history-dashboard" lang={lang} className="mb-5" />
          <h1 className="mx-auto max-w-4xl text-h1 text-ink-950">{t.title}</h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-ink-muted">{t.sub}</p>
        </Reveal>
        {repo && (
          <Reveal delay={140} className="mt-8 flex flex-wrap justify-center gap-2.5">
            <a href={repo.href} target="_blank" rel="noreferrer" className={buttonStyles({ variant: "primary", size: "md" })}>
              <PixelFill />
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

        <Reveal delay={220} className="mx-auto mt-14 max-w-5xl text-left">
          {/* On the project's plate, in its hue - the frame language of the
              Lab index (ui/ProductFrame.tsx). */}
          <ProductFrame slug="google-ads-change-history-dashboard">
            <ExplorerWindow lang={lang} limit={4} />
          </ProductFrame>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 02 · (gone) ------------------------------------------------------
   The "worked example" band that stood here - one row shown large under
   an uppercase tracked label, then two lines of prose - told the change
   the Before/After story below tells with four rows (2026-09-20,
   Hulusi's sub-page pass: remove what is only text or repeated). */

/* ---- 03 · Change Explorer -------------------------------------------- */
function ChangeExplorerSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <ProductSection tone="paper" space="xl">
      <PortraitContainer>
        <ProductHeading eyebrow={t.explorerEyebrow} title={t.explorerTitle} body={t.explorerSub} align="center" />
        <Reveal delay={100} className="mx-auto mt-12 max-w-5xl text-left">
          <ProductFrame slug="google-ads-change-history-dashboard" inset="sm">
            <ExplorerWindow lang={lang} detail />
          </ProductFrame>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 04 · Before / After ---------------------------------------------- */
function BeforeAfterCard({ row, lang }: { row: (typeof REAL.explorerRows)[number]; lang: Lang }) {
  return (
    <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink-950/[0.06]">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13px] font-medium text-ink-900">{row.campaign}</p>
        <CategoryBadge category={row.category} lang={lang} />
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
  /* A story with the window on the left, between the Before/After story
     (window right) and the wide rule-matches moment - the alternating
     rhythm the A/B page set, in place of a third centred plate. */
  return (
    <ProductSection tone="paper" space="lg">
      <PortraitContainer>
        <ProductBenefitStory
          eyebrow={t.actEyebrow}
          title={t.actTitle}
          body={t.actSub}
          side="left"
          visual={
            <ProductFrame slug="google-ads-change-history-dashboard" inset="sm">
              <ActivityWindow t={t} lang={lang} />
            </ProductFrame>
          }
        />
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 06 · Rule Matches -------------------------------------------------- */
function RuleMatchesSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={t.rulesEyebrow} title={t.rulesTitle} body={t.rulesSub} align="center" />
        <Reveal delay={100} className="mx-auto mt-12 max-w-4xl text-left">
          <ProductFrame slug="google-ads-change-history-dashboard" inset="sm">
            <RuleMatchesWindow t={t} lang={lang} />
          </ProductFrame>
        </Reveal>
        <Reveal delay={140} className="mx-auto mt-8 max-w-2xl border-l-2 border-primary-600 py-1 pl-5 text-left">
          <p className="text-sm font-medium text-ink-950">{t.principleTitle}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-600">{t.principleBody}</p>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 07 · Portable offline dashboard ---------------------------------------
   The three-step flow drawn in the site's miniature idiom (2026-09-20):
   the export and the run as paper tiles with their glyphs on a hairline,
   the single HTML file as the dark output tile, the accepted formats as
   chips under it. It was three bordered chips and a mono line. */
const FILE_ICON = [<FileSpreadsheet key="export" aria-hidden />, <Play key="run" aria-hidden />, <AppWindow key="file" aria-hidden />];

function OneFileSection({ t }: { t: (typeof T)[Lang] }) {
  const last = t.fileFlow.length - 1;
  return (
    <ProductSection tone="paper" space="md">
      <PortraitContainer>
        <ProductHeading eyebrow={t.fileEyebrow} title={t.fileTitle} body={t.fileSub} align="center" />
        <Reveal delay={100} className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-y-3">
          {t.fileFlow.map((step, i) => (
            <div key={step} className="flex items-center">
              {i > 0 && <span aria-hidden className="h-px w-5 shrink-0 bg-ink-300" />}
              <span
                className={clsx(
                  "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-medium [&>svg]:size-4",
                  i === last ? "bg-ink-950 text-white [&>svg]:text-white/70" : "bg-paper text-ink-900 ring-1 ring-ink-950/[0.06] [&>svg]:text-ink-500",
                )}
              >
                {FILE_ICON[i]}
                {step}
              </span>
            </div>
          ))}
        </Reveal>
        <Reveal delay={140} className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
          {t.fileFormats.split(" · ").map((f) => (
            <span key={f} className="rounded-full bg-paper-soft px-3 py-1 text-xs font-medium text-ink-600">
              {f}
            </span>
          ))}
        </Reveal>
        <Reveal delay={180} className="mx-auto mt-5 max-w-md text-center">
          <p className="text-sm leading-relaxed text-pretty text-ink-600">{t.fileNote}</p>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 08 · Install -------------------------------------------------------- */
function Install({ c, t, lang }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  /* The shared install panel (ui/InstallPanel): the steps tile beside the
     terminal on the product's plate. Two ways in - the plugin, or the
     script run directly - and the self-test; the tool's own behaviour
     note stays on the last step. */
  return (
    <ProductSection tone="soft" space="md">
      <PortraitContainer>
        <InstallPanel
          slug="google-ads-change-history-dashboard"
          tone="soft"
          title={t.installTitle}
          body={t.installSub}
          methodsTitle={t.stepInstall}
          methods={[
            { id: "claude", label: t.claudeTab, code: CLAUDE_CODE_CMD, icon: <Blocks aria-hidden /> },
            { id: "python", label: t.pythonTab, code: PYTHON_CMD, icon: <FileCode2 aria-hidden /> },
          ]}
          then={{ title: t.stepTest, note: t.selfTestNote, code: SELF_TEST_CMD }}
          linksTitle={t.viewRepo}
          linksNote={`${t.reliabilityTitle} ${t.reliabilityBody}`}
          links={repo ? [{ label: t.ctaGithub, href: repo.href }] : []}
          copyLabel={lang === "en" ? "Copy" : "Kopyala"}
          copiedLabel={lang === "en" ? "Copied" : "Kopyalandı"}
        />
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

/* The "Other Lab projects" grid before the closing band is gone
   (2026-09-20): the footer lists the same projects, and the A/B and
   Journey Builder pages never carried one. */

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
  /* No HowTo (2026-09-20): it described the old generic install steps,
     not the ones the Install panel shows, and Google stopped showing
     HowTo rich results in 2023 - the site's structured-data contract
     never asked for it. Breadcrumbs and the application node stay. */

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
        <FinalCta t={copy[lang]} />
      </main>
      <SiteFooter t={copyT} lang={lang} />
    </>
  );
}
