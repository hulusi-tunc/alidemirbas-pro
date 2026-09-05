import { ArrowRight, ArrowUpRight, Check, CheckCircle2, ListChecks, Plus, SlidersHorizontal } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import { CodeTabs } from "@/components/ui/CodeTabs";
import type { SkillProductContent } from "@/components/SkillProductPage";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { breadcrumbList, howTo, softwareApplication } from "@/lib/schema";
import { copy, type Lang } from "@/lib/content";
import { clsx } from "@/lib/clsx";

/* Google Ads Change History Explorer - RESKINNED (2026-09-05) to a supplied
   external reference ("Precision Diff Design System": engineering-minimal,
   IDE-diff-viewer chrome - graphite text on white/slate, emerald for
   additions, crimson for removals, amber for thresholds, sapphire for
   category tags), by explicit request: "Bu sayfayı da bu şekilde düzenle"
   (arrange this page the same way [as Numerspace]).

   A DECLARED, PAGE-SCOPED EXCEPTION, same protocol as Numerspace's own
   reskin, /about and /calculators' recorded cream-palette exception - not a
   global token change. Nearly the whole reference palette maps onto
   Tailwind's OWN stock slate/zinc/emerald/red/amber/blue scale almost to
   the hex - slate-50 IS #f8fafc, zinc-900 IS #18181b, emerald-700 IS
   #047857, red-700 IS #b91c1c, amber-200 IS #fde68a, blue-700 IS #1d4ed8 -
   so this page uses those stock utilities directly rather than arbitrary
   hex, with only "primary" (pure black, this reference's ink) as a literal
   value. `ProductSection`/`ProductHeading` (used by other Lab pages) are
   not reused here for the same reason Numerspace's didn't reuse them: both
   bake in this site's own ink/primary/blue tokens. SiteHeader/SiteFooter
   untouched.

   FONTS: at build time the reference already specified Manrope + JetBrains
   Mono, then this site's own two families (it moved to a single Inter
   family on 2026-09-05, and this page followed via the tokens) - this
   site's own two families - so nothing changes here; no substitution was
   even needed, unlike Numerspace's reference (Hanken Grotesk + Inter).

   DATA: `REAL` is carried over from the prior pass essentially unchanged -
   every value there was already verified against the tool's own demo file
   (see below). Two things from the reference are deliberately NOT adopted,
   both fabrication risks flagged before writing any code:

   - The hero's "v1.2 · Open Source" status pill states a version number
     this page has no verified source for. Dropped; the pill now reads
     "Open Source" only.
   - The Activity section's "Temporal Cadence" sparkline draws a specific
     day-by-day trend line and names "Peak: Aug 3" - a claim that would
     need a real per-day count for all 10 changes, and this page's REAL
     object only has exact dates for the 6 shown in the Change Explorer
     (the other 4 that make up the real total of 10 aren't itemized
     anywhere this page can check). Not included.
   - The Python install tab keeps this page's OWN already-verified command
     (`ads_change_history.py run export.csv --out-dir ./out --open`)
     rather than the reference's different, unverified invocation
     (`--input`/`--output` flags, a separate `git clone` step) - the
     Claude Code plugin command matches the reference exactly and is
     unchanged.
   - The FAQ section keeps this page's own existing `content.faq` (a real,
     already-vetted content source) rather than the reference's FAQ
     copy, which cites specifics this page cannot verify from inside this
     repository (a `tools/fetch_live_data.py` script, a `--mask-users`
     flag) - the actual tool lives in a separate external repository this
     session cannot check. Only the FAQ block's visual treatment changed.
   - The "Other Lab projects" cards drop the reference's per-card category
     label ("Tool" / "Library" / "Framework" / "Analytics") - no field in
     `content.related` carries that classification, so it would be
     invented per card. `item.proof` (already real) fills that slot
     instead. */

const REAL = {
  explorerRows: [
    { campaign: "Campaign Alpha", account: "Account A", adGroup: "—", category: "Budget", en: { date: "Aug 1, 2026 · 9:12 AM", old: "150,000", new: "200,000" }, tr: { date: "1 Ağu 2026 · 09:12", old: "150.000", new: "200.000" }, delta: "+33.3%" },
    { campaign: "Campaign Alpha", account: "Account A", adGroup: "Ad Group 1", category: "Bidding", en: { date: "Aug 1, 2026 · 9:15 AM", old: "3.50", new: "4.20" }, tr: { date: "1 Ağu 2026 · 09:15", old: "3,50", new: "4,20" }, delta: "+20.0%" },
    { campaign: "Campaign Beta", account: "Account A", adGroup: "—", category: "Budget", en: { date: "Aug 3, 2026 · 2:22 PM", old: "80,000", new: "100,000" }, tr: { date: "3 Ağu 2026 · 14:22", old: "80.000", new: "100.000" }, delta: "+25.0%" },
    { campaign: "Campaign Alpha", account: "Account A", adGroup: "—", category: "Status", en: { date: "Aug 4, 2026 · 8:40 AM", old: "Enabled", new: "Paused" }, tr: { date: "4 Ağu 2026 · 08:40", old: "Etkin", new: "Duraklatıldı" }, delta: null },
    { campaign: "Campaign Gamma", account: "Account B", adGroup: "—", category: "Budget", en: { date: "Aug 6, 2026 · 10:00 AM", old: "50,000", new: "45,000" }, tr: { date: "6 Ağu 2026 · 10:00", old: "50.000", new: "45.000" }, delta: "-10.0%" },
    { campaign: "Campaign Alpha", account: "Account B", adGroup: "—", category: "Status", en: { date: "Aug 17, 2026 · 9:45 AM", old: "Enabled", new: "Paused" }, tr: { date: "17 Ağu 2026 · 09:45", old: "Etkin", new: "Duraklatıldı" }, delta: null },
  ],
  // Each campaign's real days_since_last_change_at_generation, from the
  // tool's own "untouched" array - a fact the tool itself computes and
  // states this way, not a relative "ago" claim about today.
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

const CATEGORY_TONE: Record<string, string> = {
  Budget: "bg-blue-50 text-blue-700",
  Bidding: "bg-slate-100 text-slate-600",
  Status: "bg-amber-50 text-amber-700",
};

const T = {
  en: {
    eyebrow: "Lab / Google Ads",
    statusPill: "Open Source",
    title: "See exactly what changed in Google Ads.",
    sub: "Turn Google Ads Change History into a searchable dashboard with the campaign, category, previous value, new value, and timestamp behind every change.",
    ctaGithub: "View on GitHub",
    ctaPreview: "See it below",
    proof: ["Zero dependencies", "Works fully offline", "57 self-test checks"],
    recordsBadge: (n: number) => `${n} changes`,
    offlineReady: "offline-ready",

    workedEyebrow: "One real change",
    workedLine1: "A change log tells you something happened.",
    workedLine2: "The dashboard shows exactly what moved.",
    previousLabel: "Previous",
    updatedLabel: "Updated",
    netIncrease: (n: string) => `+${n} net increase`,
    baseLabel: (n: string) => `Base: ${n}`,

    explorerEyebrow: "Change Explorer",
    explorerTitle: "Every change, classified and searchable.",
    explorerSub: "Search and filter by account, campaign, date and change category, then open any record to see the exact change.",
    explorerCols: ["Date", "Account", "Campaign", "Ad group", "Category", "Old value", "", "New value"],
    filterPlaceholder: "Filter by campaign, account or value...",
    showingRecords: (n: number) => `Showing ${n} records`,

    baEyebrow: "Before / After",
    baTitle: "Before and after are shown together.",
    baSub: "Open any change to see what existed before, what replaced it, and the campaign it happened in. No hunting through nested changelogs or calculating percentages by hand.",

    actEyebrow: "Activity",
    actTitle: "What changed, and what hasn't.",
    actSub: "One view of how often each account changes; another of when each campaign was last touched.",
    actActivityLabel: "Change activity by account",
    actLastLabel: "Campaign last changes",
    actTotal: (n: number, period: string) => `${n} changes · ${period}`,
    actShare: (n: number, pct: number) => `${n} change${n === 1 ? "" : "s"} (${pct}%)`,
    daysSince: (n: number) => (n === 0 ? "Changed today" : n === 1 ? "1 day since last change" : `${n} days since last change`),

    rulesEyebrow: "Rule Matches",
    rulesTitle: "Set your own change thresholds.",
    rulesSub: "Off by default. Add a magnitude or structural rule; it is evaluated in the browser, and a match is shown as a match, never scored or ranked.",
    rulesMagnitudeLabel: "Magnitude (±% change)",
    rulesStructuralLabel: "Structural flags",
    rulesExampleLabel: "Live match simulation",
    rulesExampleNote: "Matched the ±20% rule you set",
    principleTitle: "Factual by design.",
    principleBody: "The dashboard reports what happened. It doesn't label a change as good, bad or risky. You decide what warrants attention.",

    fileEyebrow: "Portable",
    fileTitle: "One dashboard. One HTML file.",
    fileSub: "The output is a standalone HTML file: no server, no CDN, nothing to install.",
    fileStep1: "Google Ads export",
    fileStep1Sub: "CSV · TSV · JSON",
    fileStep2: "run script",
    fileStep3: "dashboard.html",
    fileStep3Sub: "100% self-contained",
    fileNote: "Open it locally, archive it, or send it as a plain attachment.",

    installEyebrow: "Install",
    installTitle: "No account, no API key, no dependencies to install.",
    claudeTab: "Claude Code",
    pythonTab: "Python",
    selfTestCommand: "python3 ads_change_history.py self-test",
    selfTestNote: "57 checks passing",
    reliabilityTitle: "Stops instead of guessing.",
    reliabilityBody: "Ambiguous dates or unknown columns stop the run instead of being silently interpreted.",
    viewRepo: "Read the repository",

    faqEyebrow: "FAQ",
    faqTitle: "Frequently asked questions",

    relatedEyebrow: "Also in the Lab",
    relatedTitle: "Other Lab projects",
    relatedCta: "Open",

    ctaEyebrow: "Open source",
    ctaTitle: "Read the change history your account already logged.",
  },
  tr: {
    eyebrow: "Lab / Google Ads",
    statusPill: "Açık Kaynak",
    title: "Google Ads'te tam olarak neyin değiştiğini gör.",
    sub: "Google Ads Değişiklik Geçmişi'ni aranabilir bir dashboard'a çevirin: her değişikliğin kampanyası, kategorisi, önceki değeri, yeni değeri ve zaman damgasıyla.",
    ctaGithub: "GitHub'da görüntüle",
    ctaPreview: "Aşağıda gör",
    proof: ["Sıfır bağımlılık", "Tamamen çevrimdışı çalışır", "57 self-test kontrolü"],
    recordsBadge: (n: number) => `${n} değişiklik`,
    offlineReady: "çevrimdışı hazır",

    workedEyebrow: "Gerçek bir değişiklik",
    workedLine1: "Bir değişiklik günlüğü bir şeyin olduğunu söyler.",
    workedLine2: "Dashboard tam olarak neyin değiştiğini gösterir.",
    previousLabel: "Önceki",
    updatedLabel: "Güncel",
    netIncrease: (n: string) => `+${n} net artış`,
    baseLabel: (n: string) => `Taban: ${n}`,

    explorerEyebrow: "Change Explorer",
    explorerTitle: "Her değişiklik sınıflandırılmış ve aranabilir.",
    explorerSub: "Hesap, kampanya, tarih ve değişiklik kategorisine göre arayıp filtrele; sonra herhangi bir kaydı aç, değişikliğin tamamını gör.",
    explorerCols: ["Tarih", "Hesap", "Kampanya", "Reklam grubu", "Kategori", "Eski değer", "", "Yeni değer"],
    filterPlaceholder: "Kampanya, hesap ya da değere göre filtrele...",
    showingRecords: (n: number) => `${n} kayıt gösteriliyor`,

    baEyebrow: "Öncesi / Sonrası",
    baTitle: "Öncesi ve sonrası birlikte gösterilir.",
    baSub: "Bir değişikliği aç: öncesinde ne vardı, yerine ne geldi, hangi kampanyada oldu. İç içe değişiklik günlüklerinde aramak ya da yüzdeyi elle hesaplamak gerekmez.",

    actEyebrow: "Aktivite",
    actTitle: "Ne değişti, ne değişmedi.",
    actSub: "Bir tarafta her hesabın ne sıklıkla değiştiği; diğer tarafta her kampanyaya en son ne zaman dokunulduğu.",
    actActivityLabel: "Hesaba göre değişiklik aktivitesi",
    actLastLabel: "Kampanya son değişiklikleri",
    actTotal: (n: number, period: string) => `${n} değişiklik · ${period}`,
    actShare: (n: number, pct: number) => `${n} değişiklik (%${pct})`,
    daysSince: (n: number) => (n === 0 ? "Bugün değişti" : n === 1 ? "Son değişiklikten bu yana 1 gün" : `Son değişiklikten bu yana ${n} gün`),

    rulesEyebrow: "Rule Matches",
    rulesTitle: "Kendi değişiklik eşiklerini belirle.",
    rulesSub: "Varsayılan olarak kapalı. Bir büyüklük ya da yapısal kural ekle; kural tarayıcıda hesaplanır, eşleşme yalnızca eşleşme olarak gösterilir, puanlanmaz ve sıralanmaz.",
    rulesMagnitudeLabel: "Büyüklük (±% değişim)",
    rulesStructuralLabel: "Yapısal bayraklar",
    rulesExampleLabel: "Canlı eşleşme simülasyonu",
    rulesExampleNote: "Ayarladığın ±%20 kuralıyla eşleşti",
    principleTitle: "Tasarım gereği tarafsız.",
    principleBody: "Dashboard ne olduğunu raporlar. Bir değişikliği iyi, kötü ya da riskli diye etiketlemez. Neyin dikkat gerektirdiğine sen karar verirsin.",

    fileEyebrow: "Taşınabilir",
    fileTitle: "Tek dashboard. Tek HTML dosyası.",
    fileSub: "Çıktı bağımsız bir HTML dosyası: sunucu yok, CDN yok, kurulacak bir şey yok.",
    fileStep1: "Google Ads dışa aktarımı",
    fileStep1Sub: "CSV · TSV · JSON",
    fileStep2: "betiği çalıştır",
    fileStep3: "dashboard.html",
    fileStep3Sub: "%100 bağımsız",
    fileNote: "Yerelde aç, arşivle ya da sade bir ek olarak gönder.",

    installEyebrow: "Kurulum",
    installTitle: "Hesap yok, API anahtarı yok, kurulacak bağımlılık yok.",
    claudeTab: "Claude Code",
    pythonTab: "Python",
    selfTestCommand: "python3 ads_change_history.py self-test",
    selfTestNote: "57 kontrol geçiyor",
    reliabilityTitle: "Tahmin etmez, durur.",
    reliabilityBody: "Belirsiz bir tarih ya da tanınmayan bir sütun sessizce yorumlanmaz; çalıştırma durur.",
    viewRepo: "Repoyu oku",

    faqEyebrow: "SSS",
    faqTitle: "Sıkça sorulan sorular",

    relatedEyebrow: "Diğer projeler",
    relatedTitle: "Lab'da ayrıca",
    relatedCta: "Aç",

    ctaEyebrow: "Açık kaynak",
    ctaTitle: "Hesabının zaten kaydettiği değişiklik geçmişini oku.",
  },
} as const;

const CLAUDE_CODE_CMD = `/plugin marketplace add ali-demirbas/google-ads-change-history-dashboard\n/plugin install google-ads-change-history-dashboard@google-ads-change-history-dashboard`;
const PYTHON_CMD = `python3 ads_change_history.py run export.csv --out-dir ./out --open`;

/* ---- Shared editorial primitives, scoped to this page ------------------ */

function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={clsx("font-mono text-[11px] font-semibold tracking-[0.06em] text-slate-400 uppercase", className)}>
      {children}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={clsx("rounded px-2 py-0.5 text-[11px] font-medium", CATEGORY_TONE[category] ?? "bg-slate-100 text-slate-600")}>
      {category}
    </span>
  );
}

function DiffValue({ value, kind }: { value: string; kind: "old" | "new" }) {
  return (
    <span
      className={clsx(
        "font-mono text-[12.5px] font-semibold",
        kind === "old" ? "text-red-700 line-through decoration-1" : "text-emerald-700",
      )}
    >
      {value}
    </span>
  );
}

/** A window-chrome frame - three plain dots and a titlebar, never a
    screenshot, framing a real data visual underneath. */
function WindowChrome({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-20px_rgba(15,23,42,0.18)]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex shrink-0 gap-1.5">
            <span aria-hidden className="size-2.5 rounded-full bg-slate-300" />
            <span aria-hidden className="size-2.5 rounded-full bg-slate-300" />
            <span aria-hidden className="size-2.5 rounded-full bg-slate-300" />
          </div>
          <span className="truncate font-mono text-[11px] font-medium text-slate-500">{title}</span>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

/** One record, phone-width - the same fields the table shows, stacked
    instead of spread across eight columns nothing under ~700px can fit. */
function ExplorerRecordCard({ row, lang }: { row: (typeof REAL.explorerRows)[number]; lang: Lang }) {
  return (
    <div className="border-b border-slate-100 px-4 py-3 last:border-0">
      <div className="flex items-center justify-between gap-2">
        <CategoryBadge category={row.category} />
        <span className="font-mono text-[11px] text-slate-400">{row[lang].date}</span>
      </div>
      <p className="mt-2 truncate text-[13px] font-semibold text-zinc-900">{row.campaign}</p>
      <p className="truncate text-[11.5px] text-slate-500">
        {row.account}
        {row.adGroup !== "—" ? ` · ${row.adGroup}` : ""}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <DiffValue value={row[lang].old} kind="old" />
        <ArrowRight aria-hidden className="size-3.5 shrink-0 text-slate-300" />
        <DiffValue value={row[lang].new} kind="new" />
        {row.delta && <span className="ml-auto font-mono text-[11px] font-semibold text-slate-400">{row.delta}</span>}
      </div>
    </div>
  );
}

/** The real Change Explorer table. `compact` drops the Ad group column and
    shows fewer rows, for the hero's condensed preview. Below ~640px the
    table gives way to ExplorerRecordCard. */
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
        <table className="w-full min-w-[620px] border-collapse text-left text-[12.5px]">
          <thead>
            <tr className="bg-slate-50 text-[10.5px] font-semibold tracking-wide text-slate-400 uppercase">
              {cols.map((c, i) => (
                <th key={i} className={clsx("px-3 py-2 font-mono whitespace-nowrap", i >= cols.length - 2 && c && "text-right")}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => (
              <tr key={i} className="transition-colors hover:bg-slate-50/70">
                <td className="px-3 py-2.5 font-mono text-[11.5px] whitespace-nowrap text-slate-500">{r[lang].date}</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-zinc-700">{r.account}</td>
                <td className="px-3 py-2.5 font-semibold whitespace-nowrap text-zinc-900">{r.campaign}</td>
                {!compact && <td className="px-3 py-2.5 whitespace-nowrap text-slate-400">{r.adGroup}</td>}
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <CategoryBadge category={r.category} />
                </td>
                <td className="px-3 py-2.5 text-right whitespace-nowrap">
                  <DiffValue value={r[lang].old} kind="old" />
                </td>
                <td className="px-1 py-2.5 text-center text-slate-300">→</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <DiffValue value={r[lang].new} kind="new" />
                </td>
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
    <section className="bg-white px-5 pt-16 pb-16 sm:px-8 md:pt-20 md:pb-20 lg:px-12">
      <PortraitContainer className="text-center">
        <Reveal className="inline-flex items-center gap-2 rounded bg-slate-50 px-2.5 py-1">
          <Kicker>{t.eyebrow}</Kicker>
          <span aria-hidden className="size-1 rounded-full bg-slate-300" />
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-emerald-700">
            <span aria-hidden className="size-1.5 rounded-full bg-emerald-600" />
            {t.statusPill}
          </span>
        </Reveal>
        <Reveal delay={60} className="mt-6">
          <h1 className="mx-auto max-w-3xl text-[2.25rem] leading-[1.1] font-bold tracking-[-0.025em] text-zinc-950 sm:text-[3.5rem] sm:leading-[1.14] sm:tracking-[-0.03em]">
            {t.title}
          </h1>
        </Reveal>
        <Reveal delay={100} className="mt-5">
          <p className="mx-auto max-w-xl text-[17px] leading-relaxed text-zinc-500">{t.sub}</p>
        </Reveal>
        <Reveal delay={140} className="mt-7 flex flex-wrap justify-center gap-2.5">
          {repo && (
            <a
              href={repo.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              {t.ctaGithub}
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          )}
          <a
            href="#demo"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-slate-50 hover:border-slate-300"
          >
            {t.ctaPreview}
          </a>
        </Reveal>
        <Reveal delay={180} className="mt-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12.5px] text-slate-500">
            {t.proof.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check aria-hidden className="size-3 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <div id="demo" className="mx-auto mt-12 max-w-3xl scroll-mt-24 text-left">
          <Reveal delay={220}>
            <WindowChrome
              title="dashboard.html · Google Ads Change History"
              badge={
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-emerald-700">{t.offlineReady}</span>
                  <span className="hidden font-mono text-[11px] text-slate-400 sm:inline">{t.recordsBadge(REAL.totalChanges)}</span>
                </div>
              }
            >
              <ExplorerTable lang={lang} compact />
            </WindowChrome>
          </Reveal>
        </div>
      </PortraitContainer>
    </section>
  );
}

/* ---- 02 · Worked example - one focused diff card ----------------------- */
function WorkedExampleSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const row = REAL.explorerRows[0]; // Campaign Alpha, Budget 150,000 -> 200,000 (+33.3%)
  return (
    <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-8 md:py-20 lg:px-12">
      <PortraitContainer className="max-w-[720px]">
        <div className="text-center">
          <Kicker>{t.workedEyebrow}</Kicker>
          <h2 className="mt-2 text-[1.5rem] leading-[1.25] font-bold tracking-[-0.02em] text-zinc-950 sm:text-[2rem]">
            {t.workedLine1}
            <br />
            <span className="text-blue-700">{t.workedLine2}</span>
          </h2>
        </div>
        <Reveal delay={90} className="mx-auto mt-8 max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CategoryBadge category={row.category} />
              <span className="text-[13px] font-semibold text-zinc-900">{row.campaign}</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-[11px] text-slate-400">{row.account}</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">{row[lang].date}</span>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="rounded-md bg-red-50 p-3">
              <p className="font-mono text-[10px] font-semibold tracking-wide text-red-700 uppercase">{t.previousLabel}</p>
              <p className="mt-1 font-mono text-lg font-bold text-red-700">{row[lang].old}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ArrowRight aria-hidden className="size-4 text-slate-300" />
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-emerald-700">{row.delta}</span>
            </div>
            <div className="rounded-md bg-emerald-50 p-3">
              <p className="font-mono text-[10px] font-semibold tracking-wide text-emerald-700 uppercase">{t.updatedLabel}</p>
              <p className="mt-1 font-mono text-lg font-bold text-emerald-700">{row[lang].new}</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-600" style={{ width: "70%" }} />
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[11px] text-slate-400">
            <span>{t.baseLabel(row[lang].old)}</span>
            <span>{t.netIncrease(lang === "en" ? "50,000" : "50.000")}</span>
          </div>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 03 · Change Explorer -------------------------------------------- */
function ChangeExplorerSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer>
        <div className="mx-auto max-w-[720px] text-center">
          <Kicker>{t.explorerEyebrow}</Kicker>
          <h2 className="mt-2 text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] text-zinc-950 sm:text-[2.5rem]">{t.explorerTitle}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">{t.explorerSub}</p>
        </div>
        <Reveal delay={100} className="mx-auto mt-10 max-w-4xl rounded-xl bg-slate-50 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5">
          <div className="mb-4 flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-2">
              <input
                readOnly
                type="text"
                value=""
                placeholder={t.filterPlaceholder}
                className="w-full max-w-sm rounded bg-white px-3 py-2 font-mono text-[12.5px] text-zinc-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <span className="shrink-0 font-mono text-[12px] text-slate-500">
              {t.showingRecords(REAL.explorerRows.length)}
            </span>
          </div>
          <div className="overflow-hidden rounded-lg bg-white">
            <ExplorerTable lang={lang} />
          </div>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 04 · Before / After ---------------------------------------------- */
function BeforeAfterCard({ row, lang }: { row: (typeof REAL.explorerRows)[number]; lang: Lang }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_4px_16px_-8px_rgba(15,23,42,0.15)]">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13px] font-bold text-zinc-900">{row.campaign}</p>
        <CategoryBadge category={row.category} />
      </div>
      <p className="mt-1 text-[11px] text-slate-400">
        {row.account} · {row[lang].date}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <DiffValue value={row[lang].old} kind="old" />
        <ArrowRight aria-hidden className="size-3.5 shrink-0 text-slate-300" />
        <DiffValue value={row[lang].new} kind="new" />
      </div>
    </div>
  );
}

function BeforeAfterSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const rows = [REAL.explorerRows[0], REAL.explorerRows[1], REAL.explorerRows[3], REAL.explorerRows[4]];
  return (
    <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <Kicker>{t.baEyebrow}</Kicker>
            <h2 className="mt-2 text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] text-zinc-950 sm:text-[2rem]">{t.baTitle}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">{t.baSub}</p>
          </div>
          <Reveal delay={80} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
            {rows.map((row, i) => (
              <BeforeAfterCard key={i} row={row} lang={lang} />
            ))}
          </Reveal>
        </div>
      </PortraitContainer>
    </section>
  );
}

/* ---- 05 · Activity + Campaign Last Changes ----------------------------- */
function ActivitySection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer>
        <div className="mx-auto max-w-[720px] text-center">
          <Kicker>{t.actEyebrow}</Kicker>
          <h2 className="mt-2 text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] text-zinc-950 sm:text-[2.5rem]">{t.actTitle}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">{t.actSub}</p>
        </div>
        <Reveal delay={100} className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 text-left md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-6">
            <p className="text-[15px] font-bold text-zinc-950">{t.actActivityLabel}</p>
            <p className="mt-0.5 font-mono text-[11px] text-slate-400">{t.actTotal(REAL.totalChanges, REAL.period[lang])}</p>
            <div className="mt-5 flex flex-col gap-4">
              {REAL.accountActivity.map((a) => {
                const pct = Math.round((a.count / REAL.totalChanges) * 100);
                return (
                  <div key={a.account}>
                    <div className="mb-1 flex items-baseline justify-between font-mono text-[12px]">
                      <span className="font-bold text-zinc-900">{a.account}</span>
                      <span className="text-slate-500">{t.actShare(a.count, pct)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-zinc-950" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-6">
            <p className="text-[15px] font-bold text-zinc-950">{t.actLastLabel}</p>
            <ul className="mt-4 flex flex-col divide-y divide-slate-200">
              {REAL.lastChanges.map((row, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-zinc-900">{row.campaign}</p>
                    <p className="truncate font-mono text-[11px] text-slate-400">{row.account}</p>
                  </div>
                  {row.days === 0 ? (
                    <span className="shrink-0 rounded bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-700">
                      {t.daysSince(0)}
                    </span>
                  ) : (
                    <span className="shrink-0 font-mono text-[11.5px] text-slate-500">{t.daysSince(row.days)}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 06 · Rule Matches -------------------------------------------------- */
function RuleMatchesSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const exampleRow = REAL.explorerRows[2]; // Campaign Beta, 80,000 -> 100,000 (+25.0%)
  return (
    <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer>
        <div className="mx-auto max-w-[720px] text-center">
          <Kicker>{t.rulesEyebrow}</Kicker>
          <h2 className="mt-2 text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] text-zinc-950 sm:text-[2.5rem]">{t.rulesTitle}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">{t.rulesSub}</p>
        </div>
        <Reveal delay={100} className="mx-auto mt-10 max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 text-[15px] font-semibold text-zinc-950">
                <SlidersHorizontal aria-hidden className="size-4 text-blue-700" />
                {t.rulesMagnitudeLabel}
              </h3>
              <div className="mt-3 flex flex-col gap-2">
                {REAL.magnitudeRules.map((r) => (
                  <div key={r.label.en} className="flex items-center justify-between gap-3 rounded bg-slate-50 px-3 py-2.5 text-[13px]">
                    <span className="text-zinc-700">{r.label[lang]}</span>
                    <span className="shrink-0 rounded bg-white px-2 py-0.5 font-mono text-[12px] font-semibold text-zinc-900">±{r.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-[15px] font-semibold text-zinc-950">
                <ListChecks aria-hidden className="size-4 text-blue-700" />
                {t.rulesStructuralLabel}
              </h3>
              <div className="mt-3 flex flex-col gap-2">
                {REAL.structuralRules.map((r) => (
                  <label key={r.label.en} className="flex cursor-default items-center gap-2.5 rounded bg-slate-50 px-3 py-2.5 text-[13px]">
                    <span
                      aria-hidden
                      className={clsx(
                        "flex size-4 shrink-0 items-center justify-center rounded-sm border",
                        r.on ? "border-zinc-950 bg-zinc-950" : "border-slate-300 bg-white",
                      )}
                    >
                      {r.on && <Check aria-hidden className="size-3 text-white" />}
                    </span>
                    <span className={r.on ? "font-medium text-zinc-900" : "text-slate-500"}>{r.label[lang]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Kicker>{t.rulesExampleLabel}</Kicker>
              <p className="mt-1 truncate text-[13px] font-bold text-zinc-900">
                {exampleRow.campaign} · <span className="font-mono font-normal">{exampleRow[lang].old} → {exampleRow[lang].new}</span>
              </p>
              <p className="mt-0.5 font-mono text-[11.5px] text-slate-500">{t.rulesExampleNote}</p>
            </div>
            <span className="shrink-0 self-start rounded bg-blue-50 px-3 py-1.5 font-mono text-sm font-bold text-blue-700 sm:self-auto">
              {exampleRow.delta}
            </span>
          </div>
          <div className="mt-4 rounded-lg bg-slate-100 p-4 text-left">
            <p className="text-[13px] font-semibold text-zinc-950">{t.principleTitle}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-zinc-600">{t.principleBody}</p>
          </div>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 07 · Portable offline dashboard --------------------------------------- */
function OneFileSection({ t }: { t: (typeof T)[Lang] }) {
  return (
    <section className="bg-white px-5 py-16 text-center sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer className="max-w-[720px]">
        <Kicker>{t.fileEyebrow}</Kicker>
        <h2 className="mt-2 text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] text-zinc-950 sm:text-[2.5rem]">{t.fileTitle}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">{t.fileSub}</p>

        <Reveal delay={100} className="mx-auto mt-10 grid max-w-2xl grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-lg bg-slate-50 p-5 text-center">
            <p className="text-[13px] font-bold text-zinc-900">{t.fileStep1}</p>
            <p className="mt-1 font-mono text-[11px] text-slate-400">{t.fileStep1Sub}</p>
          </div>
          <div className="flex flex-col items-center justify-center py-2">
            <span className="font-mono text-[11px] text-slate-400">{t.fileStep2}</span>
            <ArrowRight aria-hidden className="mt-1 size-4 text-zinc-400" />
          </div>
          <div className="rounded-lg bg-zinc-950 p-5 text-center shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)]">
            <p className="text-[13px] font-bold text-white">{t.fileStep3}</p>
            <p className="mt-1 font-mono text-[11px] text-white/60">{t.fileStep3Sub}</p>
          </div>
        </Reveal>
        <Reveal delay={140} className="mt-8">
          <p className="font-mono text-[12px] text-slate-400">{t.fileNote}</p>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 08 · Install -------------------------------------------------------- */
function Install({ c, t, lang }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  return (
    <section className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer className="max-w-[720px]">
        <div className="text-center">
          <Kicker>{t.installEyebrow}</Kicker>
          <h2 className="mt-2 text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] text-zinc-950 sm:text-[2.5rem]">{t.installTitle}</h2>
        </div>
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
        <Reveal delay={140} className="mt-6 flex items-center justify-between gap-3 rounded-lg bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex min-w-0 items-center gap-2">
            <CheckCircle2 aria-hidden className="size-4 shrink-0 text-emerald-600" />
            {/* `code`, not `span` - see DashboardBuilderPage's note: the character
                grid now comes from the element, not from `font-mono`. */}
            <code className="truncate text-[12px] font-medium text-zinc-900">{t.selfTestCommand}</code>
          </div>
          <span className="shrink-0 font-mono text-[12px] font-bold text-emerald-700">{t.selfTestNote}</span>
        </Reveal>
        <Reveal delay={170} className="mt-6 rounded-lg bg-slate-100 p-5">
          <p className="text-[13px] font-semibold text-zinc-950">{t.reliabilityTitle}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-600">{t.reliabilityBody}</p>
        </Reveal>
        {repo && (
          <Reveal delay={200} className="mt-6">
            <a
              href={repo.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 transition-colors hover:text-blue-800"
            >
              {t.viewRepo} →
            </a>
          </Reveal>
        )}
      </PortraitContainer>
    </section>
  );
}

/* ---- 09 · FAQ - hairline-divided, not the shared FaqAccordion -----------
   Same accessible <details>/<summary> pattern, this page's own visual
   treatment - the shared component's open/hover states are the site's own
   blue/ink tokens, which would fight this page's slate/zinc palette. */
function Faq({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  if (!c.faq || c.faq.length === 0) return null;
  return (
    <section className="bg-white px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer className="max-w-[720px]">
        <div className="text-center">
          <Kicker>{t.faqEyebrow}</Kicker>
          <h2 className="mt-2 text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] text-zinc-950 sm:text-[2.5rem]">{t.faqTitle}</h2>
        </div>
        <Reveal delay={80} className="mt-8 flex flex-col gap-3">
          {c.faq.map((item) => (
            <details key={item.id} className="group rounded-lg bg-slate-50 p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 marker:content-none">
                <span className="text-[15px] font-semibold text-zinc-950">{item.q}</span>
                <span aria-hidden className="shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-45">
                  <Plus className="size-4" />
                </span>
              </summary>
              <p className="mt-2.5 text-[14px] leading-relaxed text-zinc-600">{item.a}</p>
            </details>
          ))}
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 10 · Other Lab projects --------------------------------------------- */
function Related({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  const items = c.related;
  if (items.length === 0) return null;
  return (
    <section className="border-t border-slate-200 bg-slate-50 px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer>
        <div className="mx-auto max-w-[720px] text-center">
          <Kicker>{t.relatedEyebrow}</Kicker>
          <h2 className="mt-2 text-[1.5rem] leading-[1.2] font-bold tracking-[-0.02em] text-zinc-950 sm:text-[1.75rem]">{t.relatedTitle}</h2>
        </div>
        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.href} delay={i * 60}>
              <a
                href={item.href}
                className="group flex h-full flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_4px_16px_-8px_rgba(15,23,42,0.15)]"
              >
                <div>
                  <p className="text-[15px] font-bold text-zinc-900 transition-colors group-hover:text-blue-700">{item.name}</p>
                  {item.desc ? <p className="mt-2 text-[13px] leading-relaxed text-slate-500">{item.desc}</p> : null}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  {item.proof ? (
                    <span className="font-mono text-[11px] text-slate-400 tabular-nums">{item.proof}</span>
                  ) : (
                    <span />
                  )}
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400 transition-colors group-hover:text-zinc-900">
                    {t.relatedCta}
                    <ArrowRight aria-hidden className="size-3" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </PortraitContainer>
    </section>
  );
}

/* ---- 11 · Closing - full-bleed black band -------------------------------- */
function PageCta({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  return (
    <section className="bg-zinc-950 px-5 py-20 text-center sm:px-8 lg:px-12">
      <PortraitContainer className="max-w-[720px]">
        <Kicker className="text-white/40">{t.ctaEyebrow}</Kicker>
        <h2 className="mx-auto mt-3 max-w-2xl text-[1.75rem] leading-[1.2] font-bold tracking-[-0.02em] text-white sm:text-[2.5rem]">
          {t.ctaTitle}
        </h2>
        {repo && (
          <div className="mt-8 flex justify-center">
            <a
              href={repo.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-zinc-950 shadow-lg transition-colors hover:bg-slate-100"
            >
              {t.ctaGithub}
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </div>
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
      <main className="font-sans">
        <Hero c={content} t={t} lang={lang} />
        <WorkedExampleSection t={t} lang={lang} />
        <ChangeExplorerSection t={t} lang={lang} />
        <BeforeAfterSection t={t} lang={lang} />
        <ActivitySection t={t} lang={lang} />
        <RuleMatchesSection t={t} lang={lang} />
        <OneFileSection t={t} />
        <Install c={content} t={t} lang={lang} />
        <Faq c={content} t={t} />
        <Related c={content} t={t} />
        <PageCta c={content} t={t} />
      </main>
      <SiteFooter t={copyT} lang={lang} />
    </>
  );
}
