import type { CSSProperties, ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  BellRing,
  Bot,
  Briefcase,
  Calculator,
  CalendarClock,
  Car,
  Check,
  CircleCheck,
  CircleX,
  FileClock,
  FileSpreadsheet,
  Filter,
  Flag,
  Gavel,
  GitBranch,
  Goal,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  LayoutDashboard,
  LibraryBig,
  Link2,
  Mail,
  Megaphone,
  MessageSquare,
  Moon,
  PawPrint,
  Power,
  Radio,
  Rocket,
  Search,
  SearchCheck,
  Shirt,
  ShoppingCart,
  Sigma,
  Smartphone,
  Sparkles,
  SquareSplitHorizontal,
  Ticket,
  UserMinus,
  UserRound,
  Wallet,
  Workflow,
} from "lucide-react";

import JourneyTopologyPreview from "@/components/ui/JourneyTopologyPreview";
import {
  AppBar,
  Badge,
  type BadgeTone,
  Chip,
  codeLabel,
  Count,
  DrawnButton,
  Field,
  FormLabel,
  KeyValues,
  Rail,
  RailTitle,
  SearchField,
  Segmented,
  SelectField,
  Stepper,
  type StepState,
  Table,
  TabStrip,
  Td,
  Th,
  Toggle,
  Tr,
  Window,
} from "@/components/ui/LabWindow";
import { AB004_TEXT } from "@/components/ui/LabPreviews";
import { PATTERNS, PatternFlowCard, type Pattern } from "@/components/ui/PatternFlow";
import { AB_SCALE, FEATURED, SURFACE_COUNTS, canvasRows } from "@/lib/ab-test-marketing";
import { AB_CATEGORIES, AB_TEST_COUNT, surfaceLabel } from "@/lib/ab-test-view";
import { JOURNEY_ROWS, type JourneyRow } from "@/lib/canonical-view";
import { clsx } from "@/lib/clsx";
import { copy, type Lang } from "@/lib/content";
import { CHANNEL_LABEL, sortChannels } from "@/lib/journey-channels";
import { GOALS, GOAL_LABEL } from "@/lib/journey-taxonomy";
import { CHANGE_HISTORY_REAL, DASHBOARD_REAL, NUMERSPACE_REAL } from "@/lib/lab-material";

/* THE LAB'S WITNESSES: one real view of each project for the hero window,
   and one for its section further down the page.

   The brief (2026-09-05): tabs above the hero mock-up, "each representative
   mockup for each lab project". A representative mock-up on this site
   cannot be a mock-up - AGENTS.md bans fabricated screenshots outright, and
   the Lab exists to prove the tools are real. So every panel here is the
   tool's own material, rendered: the builder's pattern blueprints copied
   from its knowledge base; the library's largest graph drawn by the same
   layout engine as its detail page; a real record from the 211-test
   playbook beside the real category counts; the dashboard builder's own
   11-row template table; the change-history tool's demo dataset in its
   real explorer columns; Numerspace's 13 categories with counts read off
   the live site. Nothing is invented, nothing is typed in twice - the data
   comes from lab-material.ts and the same view models the product pages
   read.

   Every hero panel is designed for a FIXED FRAME (LabShowcase.tsx clips
   the window body to one height so switching tabs never moves the page
   below): the important rows sit in the top ~340px, and whatever runs
   longer is cut by the frame and then by the fold, which reads as the
   product continuing rather than ending. Section witnesses (DECK
   WITNESSES, below) are sized for one pinned card each: LabIndexPage.tsx
   holds every project card at viewport height, so each stays under
   ~520px tall at desktop widths.

   All server-rendered. LabShowcase is a client component and receives
   these as ReactNode props, so none of the data here reaches the browser
   as JavaScript - the same server-only discipline canonical-view.ts
   asks for. */

type HeroJourney = Pick<JourneyRow, "id" | "name" | "shortName" | "categoryTitle" | "nodeCount" | "preview">;

const T = {
  en: {
    patternSource: "knowledge/journey-patterns",
    patternTable: "Step blueprint · standard",
    nodes: (n: number) => `${n} nodes`,
    categories: "Categories",
    ofTests: (n: number) => `1 of ${n} scenarios`,
    templatesCaption: "Dashboards & Presentations",
    templates: (n: number) => `${n} templates`,
    changes: (n: number) => `${n} changes`,
    accounts: (n: number) => `${n} accounts`,
    cols: { campaign: "Campaign", account: "Account", category: "Category", change: "Change", date: "Date" },
    calculators: (n: number) => `${n} calculators`,
    categoriesWord: "categories",
    magnitude: "Flag when a change exceeds",
    structural: "Structural changes",
    on: "On",
    off: "Off",
    bmr: "BMR",
    more: (n: number) => `+ ${n} more`,
  },
  tr: {
    patternSource: "knowledge/journey-patterns",
    patternTable: "Adım planı · standart",
    nodes: (n: number) => `${n} düğüm`,
    categories: "Kategoriler",
    ofTests: (n: number) => `${n} senaryodan 1'i`,
    templatesCaption: "Dashboard'lar ve Sunumlar",
    templates: (n: number) => `${n} şablon`,
    changes: (n: number) => `${n} değişiklik`,
    accounts: (n: number) => `${n} hesap`,
    cols: { campaign: "Kampanya", account: "Hesap", category: "Kategori", change: "Değişim", date: "Tarih" },
    calculators: (n: number) => `${n} hesaplayıcı`,
    categoriesWord: "kategori",
    magnitude: "Şunu aşan değişiklikleri işaretle",
    structural: "Yapısal değişiklikler",
    on: "Açık",
    off: "Kapalı",
    bmr: "BMR",
    more: (n: number) => `+ ${n} daha`,
  },
} as const;

/* ------------------------------------------------------ HERO PANELS */

/** The builder: its three real pattern blueprints side by side, the way
    the knowledge base holds them. One card below md, where three would
    each be a sliver. */
function PatternBoardPanel({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <div className="h-full bg-paper-soft/70 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3 text-[12px] text-ink-500">
        <span>{t.patternSource}</span>
        <span>{t.patternTable}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PATTERNS.map((pattern, i) => (
          <div key={pattern.trigger} className={i > 0 ? "hidden md:block" : ""}>
            <PatternFlowCard pattern={pattern} lang={lang} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** The library: its largest graph, under its own id, name, category and
    node count - the detail page's facts, in a caption row. */
function LibraryGraphPanel({ journey, lang }: { journey: HeroJourney; lang: Lang }) {
  const t = T[lang];
  return (
    <div className="flex h-full flex-col px-4 pt-4 sm:px-6 sm:pt-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px]">
        <span className="text-ink-400">{journey.id}</span>
        <span className="font-medium text-ink-950">{journey.shortName ?? journey.name}</span>
        <span className="rounded-pill bg-primary-50 px-2 py-0.5 text-[12px] font-medium text-primary-700">
          {journey.categoryTitle}
        </span>
        <span className="text-ink-500 tabular-nums">{t.nodes(journey.nodeCount)}</span>
      </div>
      <div className="mt-4 min-h-0 flex-1">
        <div className="aspect-[1000/440] w-full">
          <JourneyTopologyPreview preview={journey.preview} />
        </div>
      </div>
    </div>
  );
}

/** The playbook as its library browser, in the hero window (Hulusi,
    2026-09-06 evening: "improve the A/B mock-up in the banner, you know
    the UI we made for A/B"): the search field with the featured record's
    category applied, the twelve real categories with their counts down
    the rail, real result rows with AB-004 selected, and that record open
    in a detail pane - the same anatomy as PlaybookWindow on the deck,
    without a second window frame, since the showcase already draws one.
    The frame is fixed-height and cuts the list, which reads as the
    library continuing. Category ids are the corpus's own English labels
    in both locales - they are the dataset's proper nouns. */
function PlaybookPanel({ lang }: { lang: Lang }) {
  const t = T[lang];
  const w = WT[lang];
  const rec = AB004_TEXT[lang];
  const categories = [...AB_CATEGORIES].sort((a, b) => b.count - a.count);
  const rows = canvasRows(lang);
  return (
    /* text-left: the hero section centres its type, and a browser is not centred. */
    <div className="flex h-full flex-col text-left">
      <AppBar>
        <SearchField placeholder={w.searchScenarios} className="flex-1" />
        <Chip active>{rec.category}</Chip>
        <span className="hidden shrink-0 text-[12px] text-ink-500 tabular-nums sm:block">{t.ofTests(AB_TEST_COUNT)}</span>
      </AppBar>
      <div className="flex min-h-0 flex-1">
        <Rail
          title={t.categories}
          items={categories.map((c) => ({ label: c.id, count: c.count, active: c.id === AB004_TEXT.en.category }))}
          className="hidden w-48 md:block"
        />
        <div className="min-w-0 flex-1">
          {rows.map((r) => (
            <div
              key={r.id}
              className={clsx(
                "flex items-center gap-3 border-b border-line-soft px-3.5 py-2.5",
                r.id === FEATURED.id && "bg-primary-50/60",
              )}
            >
              <span className="w-14 shrink-0 text-[12px] text-ink-500 tabular-nums">{r.id}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink-950">{r.title}</span>
                <span className="block truncate text-[12px] text-ink-500">{r.category}</span>
              </span>
              <Badge>{surfaceLabel(r.surface)}</Badge>
            </div>
          ))}
        </div>
        <aside className="hidden w-64 shrink-0 border-l border-line-soft xl:block">
          <div className="px-4 py-3.5">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-ink-500 tabular-nums">{FEATURED.id}</span>
              <Badge hue="rose">{rec.category}</Badge>
            </div>
            <p className="mt-2 text-[13px] leading-snug font-semibold text-ink-950">{rec.question}</p>
            <KeyValues
              className="mt-3"
              rows={[
                [rec.whatToTestLabel, rec.whatToTest],
                [rec.kpiLabel, rec.kpi],
                [rec.avoidLabel, rec.avoid],
              ]}
            />
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Badge>{codeLabel(FEATURED.setupType)}</Badge>
              <Badge>{codeLabel(FEATURED.comparisonMode)}</Badge>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** The dashboard builder: its 11 templates, each with the question it
    answers - the README's own table, two columns. */
function TemplatesPanel({ lang }: { lang: Lang }) {
  const t = T[lang];
  const templates = DASHBOARD_REAL.templates;
  return (
    <div className="h-full px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex items-center justify-between gap-3 text-[12px]">
        <span className="font-medium text-ink-950">{t.templatesCaption}</span>
        <span className="text-ink-500 tabular-nums">{t.templates(templates.length)}</span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {templates.map((tpl) => (
          <div key={tpl.id} className="flex items-start gap-2.5 rounded-lg bg-paper-soft px-3 py-2">
            <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-ink-950 text-[12px] font-semibold text-white">
              {tpl.id}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-medium text-ink-900">{tpl[lang]}</p>
              <p className="line-clamp-2 text-[12px] leading-snug text-ink-500">{tpl.q[lang]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Same map the product page's CategoryBadge uses - written out in full. */
/** The explorer's table in two tones: light inside the hero window, dark
    on the Lab deck's one dark card, where the same six demo rows read as
    the console of a tool that runs on exports (LabIndexPage.tsx). The
    category badges keep their semantic hues in both tones - the project's
    own amber is spent on the card's mark, not on its data. Every class
    string is literal; Tailwind cannot see a tone composed at runtime. */
const TABLE_TONE = {
  light: {
    head: "border-line text-ink-500",
    headFact: "text-ink-950",
    th: "text-ink-400",
    row: "border-line",
    campaign: "text-ink-900",
    adGroup: "text-ink-500",
    account: "text-ink-600",
    old: "text-ink-400",
    arrow: "text-ink-300",
    next: "text-emerald-700",
    date: "text-ink-400",
    badge: {
      Status: "bg-emerald-50 text-emerald-700",
      Budget: "bg-primary-50 text-primary-700",
      Bidding: "bg-violet-50 text-violet-700",
      Keyword: "bg-sky-50 text-sky-700",
      other: "bg-paper-soft text-ink-600",
    },
  },
  dark: {
    head: "border-white/10 text-white/60",
    headFact: "text-white",
    th: "text-white/45",
    row: "border-white/10",
    campaign: "text-white",
    adGroup: "text-white/50",
    account: "text-white/65",
    old: "text-white/40",
    arrow: "text-white/30",
    next: "text-emerald-300",
    date: "text-white/45",
    badge: {
      Status: "bg-emerald-400/15 text-emerald-300",
      Budget: "bg-primary-400/20 text-primary-200",
      Bidding: "bg-violet-400/15 text-violet-300",
      Keyword: "bg-sky-400/15 text-sky-300",
      other: "bg-white/10 text-white/70",
    },
  },
} as const;

type TableTone = keyof typeof TABLE_TONE;

function CategoryBadge({ category, tone }: { category: string; tone: TableTone }) {
  const badge: Record<string, string> = TABLE_TONE[tone].badge;
  return <span className={`rounded px-1.5 py-0.5 text-[12px] font-medium ${badge[category] ?? badge.other}`}>{category}</span>;
}

/** The change-history explorer: its real table over its real demo rows.
    The header carries facts the tool itself states (10 changes, the
    period, two accounts). `bare` drops that row where a window bar
    already states the facts (ExplorerWindow below); `trim` lets the deck
    card drop rows from `trimFrom` on in a short window (`.lab-deck-trim`,
    globals.css). */
export function ChangeTable({
  lang,
  tone = "light",
  trim = false,
  trimFrom = 5,
  bare = false,
}: {
  lang: Lang;
  tone?: TableTone;
  trim?: boolean;
  trimFrom?: number;
  bare?: boolean;
}) {
  const t = T[lang];
  const R = CHANGE_HISTORY_REAL;
  const s = TABLE_TONE[tone];
  return (
    <div className="h-full">
      {!bare && (
        <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 border-b px-4 py-3 text-[12px] sm:px-5 ${s.head}`}>
          <span className={`font-medium tabular-nums ${s.headFact}`}>{t.changes(R.totalChanges)}</span>
          <span>{R.period[lang]}</span>
          <span className="tabular-nums">{t.accounts(R.accountActivity.length)}</span>
        </div>
      )}
      <table className="w-full text-left text-[12px]">
        <thead>
          <tr className={`text-[12px] ${s.th}`}>
            <th className="px-4 py-2 font-medium sm:px-5">{t.cols.campaign}</th>
            <th className="hidden px-3 py-2 font-medium sm:table-cell">{t.cols.account}</th>
            <th className="px-3 py-2 font-medium">{t.cols.category}</th>
            <th className="px-3 py-2 font-medium">{t.cols.change}</th>
            <th className="hidden px-3 py-2 font-medium md:table-cell">{t.cols.date}</th>
          </tr>
        </thead>
        <tbody>
          {R.explorerRows.map((row, i) => (
            <tr key={i} className={`border-t ${s.row} ${trim && i >= trimFrom ? "lab-deck-trim" : ""}`}>
              <td className="px-4 py-2.5 sm:px-5">
                <p className={`font-medium ${s.campaign}`}>{row.campaign}</p>
                {row.adGroup !== "—" && <p className={`text-[12px] ${s.adGroup}`}>{row.adGroup}</p>}
              </td>
              <td className={`hidden px-3 py-2.5 sm:table-cell ${s.account}`}>{row.account}</td>
              <td className="px-3 py-2.5">
                <CategoryBadge category={row.category} tone={tone} />
              </td>
              <td className="px-3 py-2.5">
                <span className={`inline-flex items-center gap-1.5 ${/^[\d.,]+$/.test(row[lang].old) ? "font-mono text-[12.5px] tabular-nums" : "text-[12.5px]"}`}>
                  <span className={`line-through decoration-1 ${s.old}`}>{row[lang].old}</span>
                  <ArrowRight aria-hidden className={`size-3 ${s.arrow}`} />
                  <span className={`font-medium ${s.next}`}>{row[lang].new}</span>
                </span>
              </td>
              <td className={`hidden px-3 py-2.5 text-[12px] whitespace-nowrap tabular-nums md:table-cell ${s.date}`}>{row[lang].date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Numerspace: all 13 categories with their real counts and one real
    tool each. The featured eight sit on tint, the rest on paper - the
    same split the project page makes. */
function CategoriesPanel({ lang }: { lang: Lang }) {
  const t = T[lang];
  const cats = NUMERSPACE_REAL.categories;
  const total = cats.reduce((sum, c) => sum + c.count, 0);
  return (
    <div className="h-full px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex items-center justify-between gap-3 text-[12px]">
        <span className="font-medium text-ink-950">numerspace.com</span>
        <span className="text-ink-500 tabular-nums">
          {t.calculators(total)} · {cats.length} {t.categoriesWord}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {cats.map((c) => (
          <div key={c.en} className={`rounded-lg px-3 py-2.5 ${c.featured ? "bg-paper-soft" : "bg-paper shadow-hairline"}`}>
            <p className="truncate text-[12.5px] font-medium text-ink-900">{c[lang]}</p>
            <p className="mt-0.5 text-[12px] text-ink-500 tabular-nums">{t.calculators(c.count)}</p>
            <p className="mt-1 truncate text-[12px] text-ink-400">{c.ex[lang][0]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Slug -> the hero window's panel. */
export function LabHeroPanel({ slug, lang, journey }: { slug: string; lang: Lang; journey: HeroJourney }) {
  switch (slug) {
    case "claude-lifecycle":
      return <PatternBoardPanel lang={lang} />;
    case "lifecycle-card-archive":
      return <LibraryGraphPanel journey={journey} lang={lang} />;
    case "ab-test-playbook":
      return <PlaybookPanel lang={lang} />;
    case "dashboard-builder":
      return <TemplatesPanel lang={lang} />;
    case "google-ads-change-history-dashboard":
      return <ChangeTable lang={lang} />;
    case "numerspace":
      return <CategoriesPanel lang={lang} />;
    default:
      return null;
  }
}


/* -------------------------------------------------------- DECK WINDOWS */

/* One window per project card on the Lab deck (LabIndexPage.tsx): a
   screenshot of the product, rendered.

   Hulusi's brief (2026-09-06): the deck's visuals must "feel like real
   product screenshots, not Claude design". The previous witnesses were
   cards of text on a tint - a chip cloud, a two-by-two of plates, a
   record with a field list - and however real their data, they read as
   a website explaining a product, not as the product. Each window below
   is instead the product's own working surface, with the chrome a
   product has: the builder's canvas with its pattern rail and inspector;
   the library's browser with its search field, goal filter and result
   table; the playbook's browser with its surface facets, result rows and
   an open record; the dashboard builder's pipeline and its comparability
   check; the explorer's tabbed dashboard with its filters beside the
   change table; a Numerspace calculator page with its form filled in.

   STILL NOTHING IS INVENTED. Every row, count, value and label is the
   product's own material: the three pattern blueprints, the library's
   goals and its largest journeys, the playbook's real records and
   surface counts, the README's pipeline and comparability classes, the
   explorer's demo dataset and its shipped filter defaults, the calorie
   example with its real result. The chrome shows only controls the
   product really has (the explorer's Rule Matches toggle ships off; the
   library filters by goal, not by category), and every window is a
   picture - `role="img"`, no pointer events (LabWindow.tsx) - so a drawn
   search field is never mistaken for a live one. All server-rendered;
   no data here reaches the browser as JavaScript.

   SIZE. Each window sits inside one pinned card and stays under ~480px
   tall at desktop widths; `lab-deck-trim` drops its last rows in a short
   window, the same rule the table used. Below md the rails and inspectors
   go, and the window keeps its main pane. */

const WT = {
  en: {
    patterns: "Patterns",
    steps: (n: number) => `${n} steps`,
    step: "Step",
    wait: "Wait",
    intent: "Intent",
    branch: "Branch",
    exit: "Exit",
    none: "—",
    journey: "Journey",
    category: "Category",
    channels: "Channels",
    more: (n: number) => `+ ${n} more`,
    surface: "Surface",
    scenarios: (n: number) => `${n} scenarios`,
    searchScenarios: "Search 211 scenarios…",
    pipeline: "Pipeline",
    outputs: "Outputs",
    templates: (n: number) => `${n} templates`,
    check: "Comparability check",
    classes: (n: number) => `${n} classes`,
    cls: "Class",
    rule: "Rule",
    example: "Example",
    refused: "Refused",
    asked: "Asked",
    fix: "Fix",
    changes: (n: number) => `${n} changes`,
    filters: "Filters",
    account: "Account",
    ruleMatches: "Rule matches",
    thresholds: "Magnitude thresholds",
    nav: { categories: "Categories", blog: "Blog", search: "Search", home: "Home" },
    genders: ["Male", "Female"] as const,
    info: "Your info",
    goal: "Your goal",
    goals: ["Lose weight", "Maintain weight", "Gain weight"] as const,
    bmr: "BMR",
    labels: {
      builder: "The Journey Builder's canvas: the Abandoned cart pattern as a flow of five steps, with its pattern rail and an inspector on the first step.",
      builderPattern: (name: string, n: number) =>
        `The Journey Builder's canvas: the ${name} pattern as a flow of ${n} steps, with its pattern rail and an inspector on the first step.`,
      library: "The Canonical Journey Library's browser: search field, goal filter and a table of the largest journeys with category, channels and node count.",
      playbook: "The A/B Test Playbook's library: surface facets, result rows and the AB-004 record open in a detail pane.",
      dashboard: "The Dashboard Builder's pipeline at the comparability engine, with the four comparability classes and a refused comparison.",
      explorer: "The Change History Explorer's dashboard: its section tabs, filters and the change table over the demo dataset.",
      numerspace: "Numerspace's Daily Calorie Calculator page with the worked example filled in and its result.",
    },
  },
  tr: {
    patterns: "Desenler",
    steps: (n: number) => `${n} adım`,
    step: "Adım",
    wait: "Bekleme",
    intent: "Amaç",
    branch: "Dal",
    exit: "Çıkış",
    none: "—",
    journey: "Journey",
    category: "Kategori",
    channels: "Kanallar",
    more: (n: number) => `+ ${n} daha`,
    surface: "Yüzey",
    scenarios: (n: number) => `${n} senaryo`,
    searchScenarios: "211 senaryoda ara…",
    pipeline: "Pipeline",
    outputs: "Çıktılar",
    templates: (n: number) => `${n} şablon`,
    check: "Karşılaştırılabilirlik kontrolü",
    classes: (n: number) => `${n} sınıf`,
    cls: "Sınıf",
    rule: "Kural",
    example: "Örnek",
    refused: "Reddedildi",
    asked: "İstenen",
    fix: "Çözüm",
    changes: (n: number) => `${n} değişiklik`,
    filters: "Filtreler",
    account: "Hesap",
    ruleMatches: "Kural eşleşmeleri",
    thresholds: "Büyüklük eşikleri",
    nav: { categories: "Kategoriler", blog: "Blog", search: "Ara", home: "Ana sayfa" },
    genders: ["Erkek", "Kadın"] as const,
    info: "Bilgileriniz",
    goal: "Hedefiniz",
    goals: ["Kilo ver", "Kilo koru", "Kilo al"] as const,
    bmr: "BMR",
    labels: {
      builder: "Journey Builder'ın tuvali: Terk edilmiş sepet deseni beş adımlık bir akış olarak, desen rayı ve ilk adımın denetçisiyle.",
      builderPattern: (name: string, n: number) =>
        `Journey Builder'ın tuvali: ${name} deseni ${n} adımlık bir akış olarak, desen rayı ve ilk adımın denetçisiyle.`,
      library: "Canonical Journey Kütüphanesi'nin tarayıcısı: arama alanı, hedef filtresi ve en büyük journey'lerin kategori, kanal ve düğüm sayısıyla tablosu.",
      playbook: "A/B Test Playbook kütüphanesi: yüzey filtreleri, sonuç satırları ve detay panelinde açık AB-004 kaydı.",
      dashboard: "Dashboard Builder'ın pipeline'ı karşılaştırılabilirlik motorunda, dört karşılaştırılabilirlik sınıfı ve reddedilen bir karşılaştırmayla.",
      explorer: "Change History Explorer'ın panosu: bölüm sekmeleri, filtreler ve demo veri seti üzerindeki değişiklik tablosu.",
      numerspace: "Numerspace'in Günlük Kalori Hesaplayıcı sayfası, örnek değerler girilmiş ve sonucu görünür halde.",
    },
  },
} as const;

/* The flow vocabulary's hues - the same map as PatternFlow.tsx, so a
   channel is the same colour on the canvas, in the inspector and in the
   legend. */
const CHANNEL_TILE: Record<string, string> = {
  email: "bg-violet-50 text-violet-700",
  push: "bg-sky-50 text-sky-700",
  sms: "bg-teal-50 text-teal-700",
  "in-app": "bg-amber-50 text-amber-700",
};
const CHANNEL_ICON = { email: Mail, push: BellRing, sms: MessageSquare, "in-app": Smartphone } as const;
const CHANNEL_NAME: Record<string, string> = { email: "Email", push: "Push", sms: "SMS", "in-app": "In-app" };

/* The canvas legend: the same entries the builder's own demo canvas
   prints above its graph (Entry · Email · Push · SMS · In-app · Exit). */
const LEGEND: readonly { label: string; icon: ReactNode; ink: string }[] = [
  { label: "Entry", icon: <Flag aria-hidden />, ink: "text-ink-900" },
  { label: "Email", icon: <Mail aria-hidden />, ink: "text-violet-600" },
  { label: "Push", icon: <BellRing aria-hidden />, ink: "text-sky-600" },
  { label: "SMS", icon: <MessageSquare aria-hidden />, ink: "text-teal-600" },
  { label: "In-app", icon: <Smartphone aria-hidden />, ink: "text-amber-600" },
  { label: "Exit", icon: <CircleCheck aria-hidden />, ink: "text-emerald-600" },
];

/** The canvas pane the builder draws: its legend strip, then the
    blueprint as numbered nodes on the dotted ground. Shared by the full
    window (BuilderWindow) and by the fragment the /lab frame shows
    (BuilderCanvasFragment) - the reference frame is exactly this pane,
    no title bar, no rail, no inspector. */
function BuilderCanvas({ pattern, lang, selected, wide = false }: { pattern: Pattern; lang: Lang; selected: Pattern["steps"][number]; wide?: boolean }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line-soft px-3 py-2">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-[12px] font-medium text-ink-600">
            <span className={clsx("flex [&>svg]:size-3.5", l.ink)}>{l.icon}</span>
            {l.label}
          </span>
        ))}
      </div>
      <div className="bg-[radial-gradient(circle,rgb(0_0_0/0.07)_1px,transparent_1px)] bg-[size:14px_14px] px-4 py-3">
        <div className={clsx("mx-auto flex flex-col items-center", wide ? "max-w-[30rem]" : "max-w-[22rem]")}>
          <span className="flex items-center gap-1.5 rounded-md bg-ink-950 px-3 py-1.5 text-[12px] font-medium text-white">
            <Flag aria-hidden className="size-3.5" />
            {pattern.trigger}
          </span>
          {pattern.steps.map((step, i) => {
            const Icon = CHANNEL_ICON[step.channel];
            const on = step === selected;
            return (
              <div key={i} className="flex w-full flex-col items-center">
                <span aria-hidden className="h-2.5 w-px bg-line-strong" />
                {step.branch && (
                  <>
                    <span className="flex items-center gap-1 rounded-md bg-paper px-2 py-0.5 text-[12px] text-ink-600 shadow-hairline">
                      <GitBranch aria-hidden className="size-3 text-ink-400" />
                      {step.branch}
                    </span>
                    <span aria-hidden className="h-2.5 w-px bg-line-strong" />
                  </>
                )}
                <div
                  className={clsx(
                    "flex w-full items-center gap-2.5 rounded-md border bg-paper px-2.5 py-1.5",
                    on ? "border-primary-300 ring-2 ring-primary-100" : "border-line shadow-hairline",
                  )}
                >
                  <span className={clsx("grid size-6 shrink-0 place-items-center rounded", CHANNEL_TILE[step.channel])}>
                    <Icon aria-hidden className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-ink-950">{CHANNEL_NAME[step.channel]}</span>
                      <span className="font-mono text-[12px] text-ink-500 tabular-nums">{step.wait}</span>
                    </span>
                    <span className="block truncate text-[12px] text-ink-600">{step.intent}</span>
                  </span>
                  <span className="shrink-0 pr-1 text-[12px] text-ink-400 tabular-nums">{i + 1}</span>
                </div>
              </div>
            );
          })}
          <span aria-hidden className="h-2.5 w-px bg-line-strong" />
          <span className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-[12px] font-medium text-white">
            <CircleCheck aria-hidden className="size-3.5" />
            {pattern.exit[lang]}
          </span>
        </div>
      </div>
    </div>
  );
}

/** The builder as its canvas: the pattern rail on the left, the
    blueprint drawn as nodes on a dotted canvas, and the inspector open
    on step 1. Three panes above md, the canvas alone below it. */
export function BuilderWindow({ lang, pattern: patternIndex = 0 }: { lang: Lang; pattern?: number }) {
  const w = WT[lang];
  const pattern = PATTERNS[patternIndex] ?? PATTERNS[0];
  const selected = pattern.steps[0];
  const SelectedIcon = CHANNEL_ICON[selected.channel];
  return (
    <Window
      label={patternIndex === 0 ? w.labels.builder : w.labels.builderPattern(pattern.name[lang], pattern.steps.length)}
      address="claude-lifecycle · demo/journey-canvas.html"
      meta={w.steps(pattern.steps.length)}
    >
      <div className="flex">
        <Rail
          title={w.patterns}
          icon={<Workflow aria-hidden />}
          items={PATTERNS.map((p) => ({ label: p.name[lang], count: p.steps.length, active: p === pattern, icon: <GitBranch aria-hidden /> }))}
          className="hidden w-48 sm:block"
        />

        <BuilderCanvas pattern={pattern} lang={lang} selected={selected} />

        <aside className="hidden w-48 shrink-0 border-l border-line-soft md:block">
          <RailTitle>
            {w.step} 1
          </RailTitle>
          <div className="px-3.5 pb-3">
            <span className={clsx("inline-flex h-6 items-center gap-1.5 rounded px-1.5 text-[12px] font-medium", CHANNEL_TILE[selected.channel])}>
              <SelectedIcon aria-hidden className="size-3" />
              {CHANNEL_NAME[selected.channel]}
            </span>
            <KeyValues
              className="mt-2.5"
              rows={[
                [w.wait, <span key="w" className="font-mono text-[12.5px] tabular-nums">{selected.wait}</span>],
                [w.intent, selected.intent],
                [w.branch, selected.branch ?? w.none],
              ]}
            />
          </div>
          <RailTitle>{w.exit}</RailTitle>
          <p className="px-3.5 pb-3 text-[12.5px] font-medium text-emerald-700">{pattern.exit[lang]}</p>
        </aside>
      </div>
    </Window>
  );
}

/** The canvas alone, as a card - what the /lab frame shows for the
    builder. A picture like the windows: role="img", no pointer events. */
export function BuilderCanvasFragment({ lang, pattern: patternIndex = 0 }: { lang: Lang; pattern?: number }) {
  const w = WT[lang];
  const pattern = PATTERNS[patternIndex] ?? PATTERNS[0];
  return (
    <figure
      role="img"
      aria-label={w.labels.builderPattern(pattern.name[lang], pattern.steps.length)}
      className="pointer-events-none m-0 overflow-hidden rounded-xl bg-paper text-left ring-1 ring-ink-950/[0.06] select-none"
    >
      <BuilderCanvas pattern={pattern} lang={lang} selected={pattern.steps[0]} wide />
    </figure>
  );
}

/* The library's own facets, computed once, server side: every goal with
   its live journey count (the browser's real filter), and the seven
   largest journeys by node count - the same ordering the library page
   uses for its previews, a rule, not a pick. */
const GOAL_COUNTS = GOALS.map((goal) => ({
  goal,
  count: JOURNEY_ROWS.filter((j) => j.goal === goal).length,
})).sort((a, b) => b.count - a.count || GOAL_LABEL[a.goal].en.localeCompare(GOAL_LABEL[b.goal].en));

const LARGEST_JOURNEYS = [...JOURNEY_ROWS].sort((a, b) => b.nodeCount - a.nodeCount || a.id.localeCompare(b.id)).slice(0, 7);

/** The library as its browser: the page's real search placeholder and
    goal select, the goals as a facet rail with counts, and the largest
    journeys as a result table. */
export function LibraryWindow({ lang }: { lang: Lang }) {
  const w = WT[lang];
  const p = copy[lang].lab.page;
  const shown = GOAL_COUNTS.slice(0, 8);
  const rest = GOAL_COUNTS.length - shown.length;
  return (
    <Window label={w.labels.library} address={lang === "en" ? "/lab/journeys" : "/tr/lab/journeys"} meta={`${JOURNEY_ROWS.length} ${p.results}`}>
      <AppBar>
        <SearchField placeholder={p.searchPlaceholder} className="flex-1" />
        <SelectField value={p.allGoals} className="hidden sm:flex" />
        <span className="ml-auto shrink-0 text-[12px] text-ink-500 tabular-nums">
          {JOURNEY_ROWS.length} / {JOURNEY_ROWS.length} {p.results}
        </span>
      </AppBar>
      <div className="flex">
        <Rail
          title={p.goalLabel}
          items={[
            ...shown.map((g) => ({ label: GOAL_LABEL[g.goal][lang], count: g.count })),
            ...(rest > 0 ? [{ label: w.more(rest), muted: true }] : []),
          ]}
          className="hidden w-48 md:block"
        />
        <div className="min-w-0 flex-1">
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th className="w-full">{w.journey}</Th>
                <Th className="hidden lg:table-cell">{w.category}</Th>
                <Th className="hidden sm:table-cell">{w.channels}</Th>
                <Th className="text-right">{p.nodesLabel}</Th>
              </tr>
            </thead>
            <tbody>
              {LARGEST_JOURNEYS.map((j, i) => {
                const channels = sortChannels(j.channels).slice(0, 3);
                return (
                  <Tr key={j.id} className={i >= 5 ? "lab-deck-trim" : undefined}>
                    <Td className="text-[12px] whitespace-nowrap text-ink-400">{j.id}</Td>
                    <Td className="w-full max-w-0">
                      <span className="block truncate font-medium text-ink-950">{j.shortName ?? j.name}</span>
                    </Td>
                    <Td className="hidden whitespace-nowrap lg:table-cell">
                      <Badge hue="primary">{j.categoryTitle}</Badge>
                    </Td>
                    <Td className="hidden sm:table-cell">
                      <span className="flex gap-1">
                        {channels.length === 0 ? (
                          <span className="text-ink-400">{w.none}</span>
                        ) : (
                          channels.map((c) => <Badge key={c}>{CHANNEL_LABEL[c][lang]}</Badge>)
                        )}
                      </span>
                    </Td>
                    <Td className="text-right font-mono text-[12px] text-ink-600 tabular-nums">{j.nodeCount}</Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </Window>
  );
}

/** The playbook as its library browser: the real surface facets with
    the featured record's surface applied, six real result rows with
    AB-004 selected, and that record open in the detail pane. */
export function PlaybookWindow({ lang }: { lang: Lang }) {
  const w = WT[lang];
  const rec = AB004_TEXT[lang];
  const rows = canvasRows(lang).slice(0, 6);
  const surfaces = SURFACE_COUNTS.slice(0, 7);
  return (
    <Window label={w.labels.playbook} address="ab-test-playbook · library" meta={w.scenarios(AB_SCALE.scenarios)}>
      <AppBar>
        <SearchField placeholder={w.searchScenarios} className="flex-1" />
        <Chip active>{surfaceLabel(FEATURED.surface)}</Chip>
      </AppBar>
      <div className="flex">
        <Rail
          title={w.surface}
          items={surfaces.map((s) => ({ label: surfaceLabel(s.surface), count: s.count, active: s.surface === FEATURED.surface }))}
          className="hidden w-40 lg:block"
        />
        <div className="min-w-0 flex-1">
          {rows.map((r, i) => (
            <div
              key={r.id}
              className={clsx(
                "flex items-center gap-3 border-b border-line-soft px-3 py-2",
                r.id === FEATURED.id && "bg-primary-50/60",
                i >= 4 && "lab-deck-trim",
              )}
            >
              <span className="w-14 shrink-0 text-[12px] text-ink-400">{r.id}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium text-ink-950">{r.title}</span>
                <span className="block truncate text-[12px] text-ink-400">{r.category}</span>
              </span>
              <Badge>{surfaceLabel(r.surface)}</Badge>
            </div>
          ))}
        </div>
        <aside className="hidden w-60 shrink-0 border-l border-line-soft md:block">
          <div className="px-3.5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-ink-400">{FEATURED.id}</span>
              <Badge hue="rose">{rec.category}</Badge>
            </div>
            <p className="mt-2 text-[12.5px] leading-snug font-semibold text-ink-950">{rec.question}</p>
            <KeyValues
              className="mt-3"
              rows={[
                [rec.whatToTestLabel, rec.whatToTest],
                [rec.kpiLabel, rec.kpi],
                [rec.avoidLabel, rec.avoid],
              ]}
            />
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge>{codeLabel(FEATURED.setupType)}</Badge>
              <Badge>{codeLabel(FEATURED.comparisonMode)}</Badge>
            </div>
          </div>
        </aside>
      </div>
    </Window>
  );
}

/* The README's tone words as the kit's badge hues. */
const TONE_HUE: Record<string, BadgeTone> = { emerald: "emerald", sky: "sky", amber: "amber", rose: "rose", neutral: "neutral", ink: "ink" };

/** The dashboard builder at work: its six-stage pipeline in the rail,
    stopped at the comparability engine, and that engine's check - the
    four classes with their rule and example, then the refusal it makes
    in the README's own worked case. */
export function DashboardWindow({ lang }: { lang: Lang }) {
  const w = WT[lang];
  const D = DASHBOARD_REAL;
  const activeStage = 3;
  const steps = D.pipeline.map((s, i) => ({
    label: s[lang],
    state: (i < activeStage ? "done" : i === activeStage ? "active" : "todo") as StepState,
  }));
  return (
    <Window label={w.labels.dashboard} address="dashboard-builder" meta={w.templates(D.templates.length)}>
      <div className="flex">
        <Rail title={w.pipeline} className="hidden w-48 md:block">
          <div className="px-3.5 pb-3">
            <Stepper steps={steps} />
          </div>
          <RailTitle>{w.outputs}</RailTitle>
          <div className="flex flex-wrap gap-1 px-3.5 pb-3.5">
            {D.pipelineOutputs.map((o) => (
              <Chip key={o.en}>{o[lang]}</Chip>
            ))}
          </div>
        </Rail>
        <div className="min-w-0 flex-1">
          <AppBar>
            <span className="text-[12px] font-medium text-ink-950">{w.check}</span>
            <Badge hue="emerald" dot>
              {D.pipeline[activeStage][lang]}
            </Badge>
            <span className="ml-auto shrink-0 text-[12px] text-ink-500 tabular-nums">{w.classes(D.comparabilityStates.length)}</span>
          </AppBar>
          <Table>
            <thead>
              <tr>
                <Th>{w.cls}</Th>
                <Th>{w.rule}</Th>
                <Th className="hidden w-[36%] lg:table-cell">{w.example}</Th>
              </tr>
            </thead>
            <tbody>
              {D.comparabilityStates.map((s) => (
                <Tr key={s.id}>
                  <Td className="align-top whitespace-nowrap">
                    <Badge hue={TONE_HUE[s.tone] ?? "neutral"}>{codeLabel(s.id)}</Badge>
                  </Td>
                  <Td className="align-top text-[12px] leading-snug text-ink-800">{s[lang]}</Td>
                  <Td className="hidden max-w-[16rem] align-top text-[12px] leading-snug text-ink-500 lg:table-cell">{s.example[lang]}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <div className="lab-deck-trim border-t border-line-soft bg-rose-50/40 px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge hue="rose" dot>
                {w.refused}
              </Badge>
              <span className="text-[12px] font-medium text-ink-700">{D.refusalExample.rule[lang]}</span>
            </div>
            <p className="mt-1.5 text-[12px] leading-snug text-ink-600">
              <span className="text-ink-400">{w.asked}: </span>
              {D.refusalExample.asked[lang]}
            </p>
            <p className="mt-0.5 text-[12px] leading-snug text-ink-600">
              <span className="text-ink-400">{w.fix}: </span>
              {D.refusalExample.fix[lang]}
            </p>
          </div>
        </div>
      </div>
    </Window>
  );
}

/* The dashboard's own sections, as its README lists them (six of the
   nine, so the strip fits one row; the open one is the Explorer). */
const EXPLORER_TABS = ["Summary", "Activity Timeline", "User Activity", "Category Distribution", "Rule Matches", "Change Explorer"] as const;

/* Category counts over the demo rows, in first-appearance order. */
const EXPLORER_CATEGORIES = CHANGE_HISTORY_REAL.explorerRows.reduce<{ category: string; count: number }[]>((acc, row) => {
  const hit = acc.find((c) => c.category === row.category);
  if (hit) hit.count += 1;
  else acc.push({ category: row.category, count: 1 });
  return acc;
}, []);

/** The explorer as the dashboard the tool writes: its section tabs with
    the Change Explorer open, the Filters rail (both accounts checked,
    the category chips, Rule Matches off - the shipped default - over its
    thresholds), and the change table. Dark, for the deck's dark card. */
export function ExplorerWindow({ lang }: { lang: Lang }) {
  const w = WT[lang];
  const R = CHANGE_HISTORY_REAL;
  return (
    <Window label={w.labels.explorer} address="dashboard.html" tone="dark" meta={`${w.changes(R.totalChanges)} · ${R.period[lang]}`}>
      <TabStrip tone="dark" items={EXPLORER_TABS} active="Change Explorer" />
      <div className="flex">
        <Rail tone="dark" title={w.filters} icon={<Filter aria-hidden />} className="hidden w-52 md:block">
          <div className="px-3.5 pb-3">
            <p className="text-[12px] font-medium text-white/50">{w.account}</p>
            <ul className="mt-1 flex list-none flex-col p-0">
              {R.accountActivity.map((a) => (
                <li key={a.account} className="flex items-center justify-between gap-2 py-1 text-[12px] text-white/75">
                  <span className="flex items-center gap-2">
                    <span aria-hidden className="grid size-3.5 place-items-center rounded-[3px] bg-primary-500 text-white">
                      <Check aria-hidden className="size-2.5" strokeWidth={3} />
                    </span>
                    {a.account}
                  </span>
                  <Count tone="dark">{a.count}</Count>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] font-medium text-white/50">{w.category}</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {EXPLORER_CATEGORIES.map((c) => (
                <Chip key={c.category} tone="dark">
                  {c.category}
                  <Count tone="dark">{c.count}</Count>
                </Chip>
              ))}
            </div>
            <p className="mt-3 text-[12px] font-medium text-white/50">{w.ruleMatches}</p>
            <div className="mt-1.5">
              <Toggle tone="dark" on={false} label={w.thresholds} />
            </div>
            <ul className="mt-1.5 flex list-none flex-col gap-0.5 p-0">
              {R.magnitudeRules.map((r) => (
                <li key={r.label.en} className="flex items-center justify-between gap-2 text-[12px] text-white/50">
                  <span className="truncate">{r.label[lang]}</span>
                  <span className="font-mono tabular-nums">±{r.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Rail>
        <div className="min-w-0 flex-1">
          <ChangeTable lang={lang} tone="dark" trim trimFrom={4} bare />
        </div>
      </div>
    </Window>
  );
}

/** Numerspace as the calculator page itself, the way numerspace.com
    lays it out: the site's nav row, the breadcrumb, the category badge
    and title, the gender segments, the four inputs with the example's
    values in them, the goal segments, then BMR and the result. */
export function NumerspaceWindow({ lang }: { lang: Lang }) {
  const w = WT[lang];
  const c = NUMERSPACE_REAL.calorie;
  const category = NUMERSPACE_REAL.categories.find((x) => x.en === "Health & Fitness");
  const value = (input: (typeof c.inputs)[number]) => (typeof input.value === "string" ? input.value : input.value[lang]);
  const [gender, age, height, weight, activity] = c.inputs;
  return (
    <Window label={w.labels.numerspace} address="www.numerspace.com" meta={category?.[lang]} className="mx-auto w-full max-w-[30rem]">
      <div className="flex items-center gap-3 border-b border-line-soft px-3.5 py-2">
        <span className="text-[12px] font-bold tracking-tight text-ink-950">NumerSpace</span>
        <span className="flex items-center gap-1 text-[12px] text-ink-700">
          {w.nav.categories}
          <span aria-hidden className="text-ink-400">▾</span>
        </span>
        <span className="text-[12px] text-ink-700">{w.nav.blog}</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[12px] text-ink-400">
          <Search aria-hidden className="size-3" />
          {w.nav.search}
          <span className="rounded bg-paper-soft px-1 text-[12px] text-ink-500">⌘K</span>
        </span>
        <Segmented options={["TR", "EN"]} active={lang === "en" ? "EN" : "TR"} className="w-[4.5rem] [&>span]:h-6" />
      </div>
      <div className="px-4 pt-3 pb-4 sm:px-5">
        <p className="text-[12px] text-ink-400">
          {w.nav.home} / {category?.[lang]} / {c.title[lang]}
        </p>
        <div className="mt-2">
          <Badge hue="teal">{category?.[lang]}</Badge>
        </div>
        <p className="mt-1.5 text-[15px] font-semibold tracking-tight text-ink-950">{c.title[lang]}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{c.formula[lang]}</p>

        <div className="mt-3.5">
          <FormLabel>{gender.label[lang]}</FormLabel>
        </div>
        <Segmented options={w.genders} active={value(gender)} className="mt-1.5" />

        <div className="mt-3">
          <FormLabel>{w.info}</FormLabel>
        </div>
        <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-2">
          <Field label={age.label[lang]} value={value(age)} mono />
          <Field label={height.label[lang]} value={value(height)} mono />
          <Field label={weight.label[lang]} value={value(weight)} mono />
          <Field label={activity.label[lang]} value={value(activity)} select />
        </div>

        <div className="lab-deck-trim mt-3">
          <FormLabel>{w.goal}</FormLabel>
          <Segmented options={w.goals} active={w.goals[1]} className="mt-1.5" />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-2.5 text-[12px]">
          <span className="text-ink-500">{w.bmr}</span>
          <span className="font-mono text-ink-900 tabular-nums">{c.bmr[lang]}</span>
        </div>
        <div className="mt-2 rounded-lg bg-teal-600 px-3.5 py-2.5">
          <p className="text-[12px] text-white/75">{c.resultLabel[lang]}</p>
          <p className="mt-0.5 text-[17px] font-semibold text-white tabular-nums">{c.result[lang]}</p>
        </div>
      </div>
    </Window>
  );
}

/** Numerspace's 13 categories with their real counts - what the "97
    calculators" are made of, beside the statement that claims them. */
export function NumerspaceIndex({ lang }: { lang: Lang }) {
  return (
    <ul className="flex list-none flex-wrap gap-1.5 p-0">
      {NUMERSPACE_REAL.categories.map((c) => (
        <li
          key={c.en}
          className="inline-flex items-center gap-1.5 rounded-md bg-paper px-2.5 py-1.5 text-[12px] font-medium text-ink-700 shadow-hairline"
        >
          {c[lang]}
          <span className="text-ink-400 tabular-nums">{c.count}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------- SECTION MATERIAL */

/* Two pieces for the section structures on /lab (LabIndexPage.tsx,
   2026-09-06, the round where every section got its own shape): the
   playbook's three largest categories as a three-card row, and
   Numerspace's 13 categories as tiles for the rail that slides on scroll.
   Both are the archive's and the site's own facets - nothing invented. */

/** Numerspace's 13 categories as tiles for the rail: the name, the real
    count, and the three calculators the site lists first in each. Two
    rows, seven columns - a row wider than the page but not three pages
    wide, so the slide stays gentle. */
export function NumerspaceTiles({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <div className="grid grid-flow-col grid-rows-2 gap-3">
      {NUMERSPACE_REAL.categories.map((c) => (
        <div key={c.en} className="w-[14.5rem] shrink-0 rounded-card bg-paper p-5 shadow-hairline">
          <p className="text-[14px] font-semibold text-ink-950">{c[lang]}</p>
          <p className="mt-1 text-[12.5px] text-teal-700 tabular-nums">{t.calculators(c.count)}</p>
          <ul className="mt-4 list-none space-y-1.5 p-0">
            {c.ex[lang].map((e) => (
              <li key={e} className="truncate text-[12.5px] text-ink-600">
                {e}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- SCENES */

/* Hulusi's reviews (2026-09-06, fourth to sixth): "no full screens; choose
   and combine the parts that tell the story", then "so text heavy, I don't
   understand what the lab project does - redesign the components, add
   icons, don't kill people with text", and "the three builder images look
   identical; three different perspectives". This page promotes Ali's
   tools to people who have never seen them, so every frame now carries
   ONE idea a stranger gets in a glance: a signal becoming a journey; a
   journey as a graph; an A/B split with the one metric that decides it;
   revenue that must not be summed; a change as old → new; a calculator's
   answer over a shelf of categories. Numbers and icons where the windows
   had columns of text. Every figure is still the product's own - the
   three blueprints, the library's largest graph, AB-004, the README's
   revenue example, the demo change log, the calorie example - nothing is
   invented. A scene fills its frame (absolute inset-0) and places its
   cards; below md the secondary cards go and the one that carries the
   idea stays. Each scene is one picture: role="img", pointer events off. */

const ST = {
  en: {
    signals: "Signals in",
    journey: "Journey",
    channels: "Channels out",
    exits: "Where journeys end",
    channelMix: "Steps by channel",
    control: "Control · field visible",
    treatment: "Treatment · behind a link",
    coupon: "Coupon code",
    apply: "Apply",
    couponLink: "Have a coupon code?",
    primaryKpi: "Primary KPI",
    split: "Traffic split",
    decidedBy: "Decided by",
    checkout: "Checkout",
    revenueBySource: "Revenue by source",
    exportsIn: "Exports in",
    dashboardOut: "Dashboard out",
    addedUp: "Added up",
    trueTotal: "True total · platform of record",
    templateOf: (n: number) => `1 of ${n} templates`,
    naiveSum: "Naive sum",
    platformOfRecord: "Platform of record",
    refuse: "Refuse to sum",
    latest: "Latest changes",
    filters: "Filters",
    searchChanges: "Search changes…",
    zeroDeps: "Zero dependencies",
    outputFile: "dashboard.html",
  },
  tr: {
    signals: "Sinyaller girer",
    journey: "Journey",
    channels: "Kanallar çıkar",
    exits: "Journey'lerin bittiği yer",
    channelMix: "Kanala göre adımlar",
    control: "Kontrol · alan görünür",
    treatment: "Varyant · bağlantı arkasında",
    coupon: "Kupon kodu",
    apply: "Uygula",
    couponLink: "Kupon kodunuz var mı?",
    primaryKpi: "Birincil KPI",
    split: "Trafik bölünmesi",
    decidedBy: "Karar metriği",
    checkout: "Ödeme",
    revenueBySource: "Kaynağa göre gelir",
    exportsIn: "Dışa aktarımlar girer",
    dashboardOut: "Dashboard çıkar",
    addedUp: "Toplandığında",
    trueTotal: "Gerçek toplam · kayıt platformu",
    templateOf: (n: number) => `${n} şablondan 1'i`,
    naiveSum: "Düz toplam",
    platformOfRecord: "Kayıt platformu",
    refuse: "Toplamayı reddet",
    latest: "Son değişiklikler",
    filters: "Filtreler",
    searchChanges: "Değişikliklerde ara…",
    zeroDeps: "Sıfır bağımlılık",
    outputFile: "dashboard.html",
  },
} as const;

function Scene({ label, flow = false, children }: { label: string; flow?: boolean; children: ReactNode }) {
  return (
    <div role="img" aria-label={label} className={clsx("lab-scene pointer-events-none select-none", flow ? "relative" : "absolute inset-0")}>
      {children}
    </div>
  );
}

/** One component of a scene, as a card on the plate. Positioned by the
    scene through `className` (absolute offsets and a width). `bare`
    keeps the position and the entrance but draws no card - for a rail of
    cards that carry their own surfaces. */
function SceneCard({
  tone = "light",
  tint = false,
  bare = false,
  flow = false,
  className,
  children,
}: {
  tone?: "light" | "dark";
  /** The rose plate a refusal sits on. */
  tint?: boolean;
  bare?: boolean;
  /** Laid out by the scene's own flow instead of absolute offsets. */
  flow?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "lab-scene-card text-left",
        flow ? "relative" : "absolute",
        !bare && "overflow-hidden rounded-xl ring-1 shadow-[0_28px_70px_-28px_rgb(10_16_32/0.6),0_10px_24px_-14px_rgb(10_16_32/0.35)]",
        !bare && (tone === "dark" ? "bg-ink-900 text-white ring-white/10" : tint ? "bg-rose-50 text-ink-950 ring-rose-100" : "bg-paper text-ink-950 ring-ink-950/[0.06]"),
        className,
      )}
    >
      {children}
    </div>
  );
}

/** An icon on a tinted tile - the scenes' unit of "no text where a picture
    will do". Classes are literal (Tailwind cannot see composed tints). */
function IconTile({ tint, size = "md", children }: { tint: string; size?: "md" | "lg"; children: ReactNode }) {
  return (
    <span className={clsx("grid shrink-0 place-items-center rounded-lg", size === "lg" ? "size-10 [&>svg]:size-5" : "size-8 [&>svg]:size-4", tint)}>
      {children}
    </span>
  );
}

/** A card's title row: icon, then a few words. */
function CardTitle({ icon, tone = "light", children }: { icon: ReactNode; tone?: "light" | "dark"; children: ReactNode }) {
  return (
    <p className={clsx("m-0 flex items-center gap-2 text-[13px] font-medium [&>svg]:size-4", tone === "dark" ? "text-white/70 [&>svg]:text-white/50" : "text-ink-700 [&>svg]:text-ink-400")}>
      {icon}
      {children}
    </p>
  );
}

/* The builder's signals and channels, drawn from its three blueprints. */
const SIGNAL_ICON: Record<string, ReactNode> = {
  add_to_cart: <ShoppingCart aria-hidden />,
  trial_start: <Rocket aria-hidden />,
  "segment: lapsed": <UserMinus aria-hidden />,
};
const CHANNEL_ORDER = ["email", "push", "sms", "in-app"] as const;
const CHANNEL_STEP_COUNT = CHANNEL_ORDER.map((channel) => ({
  channel,
  count: PATTERNS.reduce((sum, p) => sum + p.steps.filter((s) => s.channel === channel).length, 0),
}));

/** The builder in three views, one per frame in the sticky column - three
    different pictures, not one canvas three times:
      0  a signal becomes a journey becomes a channel: the tool's whole
         idea as one diagram, its real triggers on the left, its real
         channels on the right;
      1  one journey as the builder draws it (the reference frame);
      2  where journeys end and what they are made of: the three real
         exits, and the blueprints' steps counted by channel. */
export function BuilderScene({ lang, view = 0 }: { lang: Lang; view?: number }) {
  const w = WT[lang];
  const s = ST[lang];
  const pattern = PATTERNS[0];

  if (view === 1) {
    return (
      <Scene label={w.labels.builder}>
        <SceneCard className="inset-x-0 top-8 mx-auto w-[min(34rem,88%)] md:top-10">
          <BuilderCanvas pattern={pattern} lang={lang} selected={pattern.steps[0]} wide />
        </SceneCard>
      </Scene>
    );
  }

  if (view === 2) {
    const max = Math.max(...CHANNEL_STEP_COUNT.map((c) => c.count));
    return (
      <Scene label={w.labels.builderPattern(pattern.name[lang], pattern.steps.length)}>
        <SceneCard className="top-8 left-6 w-[min(22rem,88%)] md:top-10 md:left-8">
          <div className="px-4 py-4">
            <CardTitle icon={<CircleCheck aria-hidden />}>{s.exits}</CardTitle>
            <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
              {PATTERNS.map((p) => (
                <li key={p.trigger} className="flex items-center gap-3">
                  <IconTile tint="bg-emerald-50 text-emerald-700">
                    <CircleCheck aria-hidden />
                  </IconTile>
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-medium text-ink-950">{p.exit[lang]}</span>
                    <span className="block text-[12px] text-ink-500">{p.name[lang]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </SceneCard>
        <SceneCard className="hidden top-[9rem] left-[19rem] w-[17rem] md:block">
          <div className="px-4 py-4">
            <CardTitle icon={<Workflow aria-hidden />}>{s.channelMix}</CardTitle>
            <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
              {CHANNEL_STEP_COUNT.map(({ channel, count }) => {
                const Icon = CHANNEL_ICON[channel];
                return (
                  <li key={channel} className="flex items-center gap-2.5">
                    <IconTile tint={CHANNEL_TILE[channel]}>
                      <Icon aria-hidden />
                    </IconTile>
                    <span className="w-14 shrink-0 text-[12.5px] text-ink-700">{CHANNEL_NAME[channel]}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-paper-soft">
                      <span className="block h-full rounded-full bg-violet-400" style={{ width: `${(count / max) * 100}%` }} />
                    </span>
                    <span className="w-5 text-right text-[12.5px] font-medium text-ink-950 tabular-nums">{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </SceneCard>
      </Scene>
    );
  }

  return (
    <Scene label={w.labels.builder}>
      <SceneCard className="inset-x-0 top-10 mx-auto w-[min(36rem,90%)] md:top-24">
        <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 sm:grid-cols-[1fr_auto_1fr] md:gap-4 md:px-5 md:py-5">
          <div>
            <CardTitle icon={<Radio aria-hidden />}>{s.signals}</CardTitle>
            <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
              {PATTERNS.map((p) => (
                <li key={p.trigger} className="flex items-center gap-2.5">
                  <IconTile tint="bg-violet-50 text-violet-700">{SIGNAL_ICON[p.trigger] ?? <Flag aria-hidden />}</IconTile>
                  <span className="truncate font-mono text-[12.5px] text-ink-800">{p.trigger}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ArrowRight aria-hidden className="size-4 text-ink-300" />
            <span className="flex flex-col items-center gap-1.5 rounded-xl bg-ink-950 px-4 py-3 text-white">
              <Workflow aria-hidden className="size-5" />
              <span className="text-[12px] font-medium whitespace-nowrap">{s.journey}</span>
            </span>
            <ArrowRight aria-hidden className="size-4 text-ink-300" />
          </div>
          <div className="hidden sm:block">
            <CardTitle icon={<Mail aria-hidden />}>{s.channels}</CardTitle>
            <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
              {CHANNEL_ORDER.map((channel) => {
                const Icon = CHANNEL_ICON[channel];
                return (
                  <li key={channel} className="flex items-center gap-2.5">
                    <IconTile tint={CHANNEL_TILE[channel]}>
                      <Icon aria-hidden />
                    </IconTile>
                    <span className="text-[12.5px] text-ink-800">{CHANNEL_NAME[channel]}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </SceneCard>
    </Scene>
  );
}

/** A journey as a small card: its id and short name over its real graph. */
function JourneyMiniCard({ journey, lang, className }: { journey: (typeof LARGEST_JOURNEYS)[number]; lang: Lang; className?: string }) {
  const t = T[lang];
  return (
    <div className={clsx("w-[15rem] overflow-hidden rounded-xl bg-paper text-left ring-1 ring-ink-950/[0.06] shadow-[0_24px_60px_-28px_rgb(10_16_32/0.5)]", className)}>
      <div className="flex items-center gap-2 border-b border-line-soft px-3.5 py-2.5 text-[12px]">
        <span className="text-ink-400">{journey.id}</span>
        <span className="min-w-0 flex-1 truncate font-medium text-ink-950">{journey.shortName ?? journey.name}</span>
        <span className="shrink-0 text-ink-500 tabular-nums">{t.nodes(journey.nodeCount)}</span>
      </div>
      <div className="px-3 py-3">
        <div className="aspect-[1000/440] w-full">
          <JourneyTopologyPreview preview={journey.preview} />
        </div>
      </div>
    </div>
  );
}

/** The library in three frames side by side (Hulusi, 2026-09-06: "three
    frames, not one big"), each a facet a stranger gets in a glance:
      0  a journey is a graph - the largest one, drawn by the engine its
         detail page uses, cut by the frame's right and bottom edges;
      1  a library of them - three journeys fanned like cards, each over
         its own real graph, the count in the corner;
      2  find the one you need - the browser's search, its goal facets
         with live counts, three real results. */
export function LibraryScene({ lang, view = 0 }: { lang: Lang; view?: number }) {
  const w = WT[lang];
  const t = T[lang];
  const p = copy[lang].lab.page;

  if (view === 1) {
    /* Three journeys fanned like cards, as one centred group: the pill on
       top, the fan below it, symmetric about the frame's middle (Hulusi,
       2026-09-06: "make it centred"). */
    const fan = LARGEST_JOURNEYS.slice(1, 4);
    const tilt = ["-rotate-6", "rotate-1", "rotate-6"];
    const place = ["top-4 left-0", "top-1 left-[3rem]", "top-5 left-[6rem]"];
    return (
      <Scene label={w.labels.library}>
        <div className="absolute inset-x-0 top-5 flex justify-center">
          <SceneCard flow>
            <span className="flex items-center gap-2 px-3 py-2">
              <LibraryBig aria-hidden className="size-4 text-primary-600" />
              <span className="text-[13px] font-semibold text-ink-950 tabular-nums">{JOURNEY_ROWS.length}</span>
              <span className="text-[12.5px] text-ink-500">{p.results}</span>
            </span>
          </SceneCard>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pt-10">
          <div className="relative h-[12rem] w-[21rem]">
            {fan.map((journey, i) => (
              <SceneCard key={journey.id} bare className={place[i]}>
                <JourneyMiniCard journey={journey} lang={lang} className={tilt[i]} />
              </SceneCard>
            ))}
          </div>
        </div>
      </Scene>
    );
  }

  if (view === 2) {
    /* A real query and its real matches: the library filtered by name, the
       matched word marked, each hit over its own graph. No ids, no
       facets - "type, and the right journey appears". */
    const query = "abandoned";
    const hits = JOURNEY_ROWS.filter((j) => (j.shortName ?? j.name).toLowerCase().includes(query)).slice(0, 3);
    const mark = (name: string) => {
      const at = name.toLowerCase().indexOf(query);
      if (at < 0) return name;
      return (
        <>
          {name.slice(0, at)}
          <mark className="rounded bg-primary-100 px-0.5 text-primary-800">{name.slice(at, at + query.length)}</mark>
          {name.slice(at + query.length)}
        </>
      );
    };
    return (
      <Scene label={w.labels.library}>
        <SceneCard className="top-6 right-6 left-6 md:top-8 md:right-8 md:left-8">
          <div className="border-b border-line-soft p-2.5">
            <span className="flex h-9 items-center gap-2 rounded-md border border-primary-300 bg-paper px-3 text-[13px] ring-2 ring-primary-100">
              <Search aria-hidden className="size-4 shrink-0 text-ink-500" />
              <span className="text-ink-950">{query}</span>
              <span aria-hidden className="h-4 w-px bg-ink-950 motion-safe:animate-pulse" />
              <span className="ml-auto shrink-0 text-[12px] text-ink-500 tabular-nums">
                {hits.length} {p.results}
              </span>
            </span>
          </div>
          <ul className="m-0 list-none p-0">
            {hits.map((j) => (
              <li key={j.id} className="flex items-center gap-3 border-b border-line-soft px-3 py-2.5 last:border-b-0">
                <span className="w-24 shrink-0 rounded-md bg-paper-soft px-2 py-1.5">
                  <span className="block aspect-[1000/440]">
                    <JourneyTopologyPreview preview={j.preview} />
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-[13px] leading-snug font-medium text-ink-950">{mark(j.shortName ?? j.name)}</span>
                  <span className="block text-[12px] text-ink-500 tabular-nums">{t.nodes(j.nodeCount)}</span>
                </span>
              </li>
            ))}
          </ul>
        </SceneCard>
      </Scene>
    );
  }

  const journey = LARGEST_JOURNEYS[0];
  return (
    <Scene label={w.labels.library}>
      <SceneCard className="top-6 left-6 w-[125%] md:top-8 md:left-8">
        <div className="flex items-center gap-2 border-b border-line-soft px-3.5 py-2.5 text-[12.5px]">
          <span className="text-ink-400">{journey.id}</span>
          <span className="min-w-0 truncate font-medium text-ink-950">{journey.shortName ?? journey.name}</span>
          <span className="ml-auto shrink-0 text-ink-500 tabular-nums">{t.nodes(journey.nodeCount)}</span>
        </div>
        <div className="px-3 py-3">
          <div className="aspect-[1000/440] w-full">
            <JourneyTopologyPreview preview={journey.preview} />
          </div>
        </div>
      </SceneCard>
    </Scene>
  );
}

/** A cart drawn as a wireframe - two item rows and a total as bars, a
    checkout button - so the ONE thing that differs between the variants
    is the only thing with words on it. Nothing here is a product or a
    price; the tested element is real (AB-004's coupon field). */
function CartWireframe({ label, mark, variant, checkout, children }: { label: string; mark: "A" | "B"; variant: "control" | "treatment"; checkout: string; children: ReactNode }) {
  return (
    <div className="px-4 py-4">
      <p className="m-0 flex items-center gap-2 text-[12.5px] font-medium text-ink-700">
        <span className={clsx("grid size-6 place-items-center rounded-md text-[12px] font-semibold text-white", variant === "control" ? "bg-ink-950" : "bg-rose-600")}>{mark}</span>
        {label}
      </p>
      <div className="mt-4 flex flex-col gap-2.5">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-3" aria-hidden>
            <span className="size-10 shrink-0 rounded-md bg-paper-soft" />
            <span className="flex flex-1 flex-col gap-1.5">
              <span className={clsx("block h-2.5 rounded-full bg-ink-200/70", i === 0 ? "w-3/5" : "w-1/2")} />
              <span className="block h-2 w-2/5 rounded-full bg-ink-200/50" />
            </span>
            <span className="h-2.5 w-10 rounded-full bg-ink-200/70" />
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-line pt-3">{children}</div>
      <div className="mt-3 flex items-center justify-between" aria-hidden>
        <span className="h-2.5 w-16 rounded-full bg-ink-200/70" />
        <span className="h-3 w-14 rounded-full bg-ink-300/80" />
      </div>
      <div className="mt-3 flex h-9 items-center justify-center rounded-md bg-ink-950 text-[12.5px] font-medium text-white">{checkout}</div>
    </div>
  );
}

/** The playbook: one scenario as a picture. The question at headline
    size on the plate; the two carts people were shown, identical except
    for the coupon element (AB-004's real test), a split between them;
    the metric that decides it as the verdict line under both; and the
    library's scale - 211 scenarios, its surfaces with counts - once, in
    one strip. Laid out in flow, so the frame is exactly as tall as the
    story. */
export function PlaybookScene({ lang }: { lang: Lang }) {
  const w = WT[lang];
  const t = T[lang];
  const s = ST[lang];
  const rec = AB004_TEXT[lang];
  const surfaces = SURFACE_COUNTS.slice(0, 5);
  const checkout = ST[lang].checkout;
  return (
    <Scene label={w.labels.playbook} flow>
      <div className="flex flex-col gap-5 p-6 md:gap-6 md:p-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-8">
          <div className="min-w-0">
            <p className="m-0 flex flex-wrap items-center gap-2">
              <Badge hue="rose">{rec.category}</Badge>
              <span className="text-[12.5px] text-ink-600 tabular-nums">{t.ofTests(AB_TEST_COUNT)}</span>
            </p>
            <p className="m-0 mt-3 max-w-[30rem] text-[22px] leading-[1.15] font-semibold tracking-[-0.02em] text-balance text-ink-950 md:text-[26px]">
              {rec.question}
            </p>
          </div>
          <SceneCard flow className="hidden shrink-0 md:block">
            <div className="flex flex-wrap items-center gap-1.5 p-2">
              {surfaces.map((x) => (
                <Chip key={x.surface} active={x.surface === FEATURED.surface}>
                  {surfaceLabel(x.surface)}
                  <Count active={x.surface === FEATURED.surface}>{x.count}</Count>
                </Chip>
              ))}
            </div>
          </SceneCard>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-4">
          <SceneCard flow>
            <CartWireframe label={s.control} mark="A" variant="control" checkout={checkout}>
              <div className="flex items-center gap-2 rounded-lg ring-2 ring-rose-200 ring-offset-2 ring-offset-paper">
                <span className="flex h-8 flex-1 items-center rounded-md border border-line bg-paper px-2.5 text-[12px] text-ink-400">
                  <Ticket aria-hidden className="mr-1.5 size-3.5" />
                  {s.coupon}
                </span>
                <DrawnButton variant="primary">{s.apply}</DrawnButton>
              </div>
            </CartWireframe>
          </SceneCard>
          <div className="hidden flex-col items-center justify-center gap-1.5 text-ink-600 md:flex">
            <span className="grid size-9 place-items-center rounded-full bg-paper/80 ring-1 ring-ink-950/[0.06]">
              <SquareSplitHorizontal aria-hidden className="size-4" />
            </span>
            <span className="text-[12px] font-medium">{s.split}</span>
          </div>
          <SceneCard flow>
            <CartWireframe label={s.treatment} mark="B" variant="treatment" checkout={checkout}>
              <p className="m-0 flex h-8 items-center gap-1.5 rounded-lg text-[12.5px] font-medium text-primary-700 ring-2 ring-rose-200 ring-offset-2 ring-offset-paper">
                <Link2 aria-hidden className="ml-1 size-3.5" />
                <span className="underline decoration-primary-300 underline-offset-2">{s.couponLink}</span>
              </p>
            </CartWireframe>
          </SceneCard>
        </div>

        <SceneCard flow>
          <div className="flex flex-wrap items-center gap-3 px-4 py-3.5 md:px-5">
            <IconTile tint="bg-rose-50 text-rose-700">
              <Goal aria-hidden />
            </IconTile>
            <span className="text-[12.5px] text-ink-500">{s.decidedBy}</span>
            <span className="text-[15px] font-semibold text-ink-950">{rec.kpi}</span>
            <span className="ml-auto hidden items-center gap-1.5 text-[12.5px] text-ink-500 md:flex">
              <CircleX aria-hidden className="size-4 text-rose-600" />
              {rec.avoid}
            </span>
          </div>
        </SceneCard>
      </div>
    </Scene>
  );
}

/** A caption on the plate above one beat of a pipeline. */
function BeatLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="m-0 flex items-center gap-1.5 text-[12.5px] font-medium text-ink-700 [&>svg]:size-4 [&>svg]:text-ink-500">
      {icon}
      {children}
    </p>
  );
}

/** The dashboard builder as the pipeline it is, in three beats read in
    order: exports in (four sources, their figures - the README's own
    example), the check (the sum those figures must not become, struck
    through, the tool's own sentence for why, and the total that stands),
    dashboard out (a wireframe titled with a real template and the
    question it answers). Laid out in flow; nothing sits on a number. */
export function DashboardScene({ lang }: { lang: Lang }) {
  const w = WT[lang];
  const s = ST[lang];
  const D = DASHBOARD_REAL;
  const ex = D.revenueExample;
  const notComparable = D.comparabilityStates.find((c) => c.id === "NOT_COMPARABLE");
  const template = D.templates[0];
  const money = (v: number) => `$${v.toFixed(1)}M`;
  return (
    <Scene label={w.labels.dashboard} flow>
      <div className="flex flex-col gap-4 p-5 md:gap-5 md:p-8">
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="flex flex-col gap-2.5">
            <BeatLabel icon={<FileSpreadsheet aria-hidden />}>{s.exportsIn}</BeatLabel>
            <div className="grid flex-1 grid-cols-2 gap-2.5">
              {ex.parts.map((part) => (
                <SceneCard key={part.source} flow>
                  <div className="flex items-center gap-3 px-3.5 py-3">
                    <IconTile tint="bg-emerald-50 text-emerald-700">
                      <FileSpreadsheet aria-hidden />
                    </IconTile>
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-medium text-ink-950">{part.source}</span>
                      <span className="block font-mono text-[12.5px] text-ink-600 tabular-nums">{money(part.value)}</span>
                    </span>
                  </div>
                </SceneCard>
              ))}
            </div>
          </div>
          <div className="hidden items-center pt-6 text-ink-500 md:flex">
            <ArrowRight aria-hidden className="size-5" />
          </div>
          <div className="flex flex-col gap-2.5">
            <BeatLabel icon={<SearchCheck aria-hidden />}>{w.check}</BeatLabel>
            <SceneCard flow tint className="flex-1">
              <div className="flex h-full flex-col justify-between gap-3 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge hue="rose" dot>
                    {w.refused}
                  </Badge>
                  <span className="text-[12.5px] font-medium text-ink-800">{codeLabel("NOT_COMPARABLE")}</span>
                </div>
                <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
                  <span>
                    <span className="block text-[12px] text-ink-500">{s.addedUp}</span>
                    <span className="mt-0.5 block font-mono text-[22px] leading-none font-semibold text-rose-700/70 line-through decoration-rose-700 decoration-[3px] tabular-nums">
                      {money(ex.naiveSum)}
                    </span>
                  </span>
                  <span>
                    <span className="block text-[12px] text-ink-500">{s.trueTotal}</span>
                    <span className="mt-0.5 block font-mono text-[28px] leading-none font-semibold text-emerald-700 tabular-nums">{money(ex.trueTotal)}</span>
                  </span>
                </div>
                {notComparable && (
                  <p className="m-0 flex items-start gap-1.5 text-[12.5px] leading-snug text-ink-700">
                    <CircleX aria-hidden className="mt-0.5 size-4 shrink-0 text-rose-600" />
                    {notComparable[lang]}
                  </p>
                )}
              </div>
            </SceneCard>
          </div>
        </div>

        <div className="flex justify-center text-ink-500">
          <ArrowDown aria-hidden className="size-5" />
        </div>

        <div className="flex flex-col gap-2.5">
          <BeatLabel icon={<LayoutDashboard aria-hidden />}>{s.dashboardOut}</BeatLabel>
          <SceneCard flow>
            <div className="flex flex-wrap items-center gap-3 border-b border-line-soft px-4 py-3">
              <IconTile tint="bg-emerald-50 text-emerald-700">
                <LayoutDashboard aria-hidden />
              </IconTile>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-semibold text-ink-950">{template[lang]}</span>
                <span className="block truncate text-[12.5px] text-ink-500">{template.q[lang]}</span>
              </span>
              <span className="shrink-0 text-[12px] text-ink-500 tabular-nums">{s.templateOf(D.templates.length)}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 px-4 py-4" aria-hidden>
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-lg bg-paper-soft p-3">
                  <span className="block h-2 w-2/3 rounded-full bg-ink-200/70" />
                  <span className="mt-3 block h-4 w-1/2 rounded-full bg-ink-300/70" />
                </div>
              ))}
              <div className="col-span-3 flex h-16 items-end gap-1.5 rounded-lg bg-paper-soft px-3 pt-3 pb-0">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span key={i} className="block flex-1 rounded-t-sm bg-ink-200/60" style={{ height: "60%" }} />
                ))}
              </div>
            </div>
          </SceneCard>
        </div>
      </div>
    </Scene>
  );
}

/* The explorer's kinds of change, each with an icon and a dark-tone tint. */
const CHANGE_KIND: Record<string, { icon: ReactNode; tint: string }> = {
  Budget: { icon: <Wallet aria-hidden />, tint: "bg-primary-400/20 text-primary-200" },
  Bidding: { icon: <Gavel aria-hidden />, tint: "bg-violet-400/20 text-violet-200" },
  Status: { icon: <Power aria-hidden />, tint: "bg-emerald-400/20 text-emerald-200" },
};

const numeric = (value: string) => /^[\d.,]+$/.test(value);

/** Who made the change - the export's own user name; a bot where the demo
    attributes the change to a system account rather than a person. */
function Who({ user, automated = false, className }: { user: string; automated?: boolean; className?: string }) {
  return (
    <span className={clsx("flex min-w-0 items-center gap-1.5 text-[12.5px] text-white/70 [&>svg]:size-3.5 [&>svg]:shrink-0", automated ? "[&>svg]:text-amber-300" : "[&>svg]:text-white/45", className)}>
      {automated ? <Bot aria-hidden /> : <UserRound aria-hidden />}
      <span className="truncate">{user}</span>
    </span>
  );
}

/** The explorer as ONE piece of UI - the dashboard the tool writes, read
    as a timeline: its file and facts in the title bar, the search that
    makes it searchable, the first change expanded large, then the rest
    on a time rail, each with an icon for its kind. The card runs off the
    frame's bottom edge; the history goes on. (Hulusi, 2026-09-06: "one
    UI, cut at the bottom, and don't repeat the previous section".) */
export function ExplorerScene({ lang }: { lang: Lang }) {
  const w = WT[lang];
  const t = T[lang];
  const s = ST[lang];
  const R = CHANGE_HISTORY_REAL;
  const [lead, ...rest] = R.explorerRows;
  const leadKind = CHANGE_KIND[lead.category];
  return (
    <Scene label={w.labels.explorer}>
      {/* Cut by the frame's right and bottom edges, like the reference
          window: the plate shows only as the top and left margins. The
          right padding keeps the dates clear of the cut. */}
      <SceneCard tone="dark" className="top-6 -right-4 left-6 pr-4 md:top-10 md:-right-8 md:left-10 md:pr-8">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3">
          <IconTile tint="bg-amber-400/15 text-amber-300">
            <FileClock aria-hidden />
          </IconTile>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-white">{s.outputFile}</span>
            <span className="block truncate text-[12px] text-white/50 tabular-nums">
              {w.changes(R.totalChanges)} · {R.period[lang]} · {t.accounts(R.accountActivity.length)}
            </span>
          </span>
          <Badge hue="emerald" tone="dark" icon={<Check aria-hidden />}>
            {s.zeroDeps}
          </Badge>
        </div>
        <div className="border-b border-white/10 px-4 py-3">
          <SearchField placeholder={s.searchChanges} tone="dark" />
        </div>
        <div className="border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <IconTile tint={leadKind?.tint ?? "bg-white/10 text-white"}>{leadKind?.icon ?? <FileClock aria-hidden />}</IconTile>
            <span className="min-w-0">
              <span className="block text-[13.5px] font-medium text-white">{lead.campaign}</span>
              <span className="block text-[12px] text-white/50">
                {lead.category} · {lead[lang].date} · {lead.account}
              </span>
            </span>
            <Who user={lead.user} automated={"automated" in lead && lead.automated} className="ml-auto hidden sm:flex" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="font-mono text-[22px] leading-none text-white/40 line-through decoration-1 tabular-nums">{lead[lang].old}</span>
            <ArrowRight aria-hidden className="size-5 text-white/40" />
            <span className="font-mono text-[32px] leading-none font-semibold text-emerald-300 tabular-nums">{lead[lang].new}</span>
          </div>
        </div>
        <ul className="relative m-0 list-none px-4 py-2">
          <span aria-hidden className="absolute top-2 bottom-2 left-[2rem] w-px bg-white/10" />
          {rest.map((row, i) => {
            const kind = CHANGE_KIND[row.category];
            return (
              <li key={i} className="relative flex items-center gap-3 py-2.5 md:grid md:grid-cols-[auto_14rem_minmax(0,1fr)_10rem_auto] md:gap-4">
                <IconTile tint={kind?.tint ?? "bg-white/10 text-white"}>{kind?.icon ?? <FileClock aria-hidden />}</IconTile>
                <span className="min-w-0 flex-1 md:flex-none">
                  <span className="block truncate text-[13px] text-white/85">{row.campaign}</span>
                  <span className="hidden text-[12px] text-white/45 md:block">{row.category}</span>
                  <span className="flex items-center gap-1.5 text-[12.5px] md:hidden">
                    <span className={clsx("truncate text-white/40 line-through decoration-1", numeric(row[lang].old) && "font-mono tabular-nums")}>{row[lang].old}</span>
                    <ArrowRight aria-hidden className="size-3 shrink-0 text-white/30" />
                    <span className={clsx("truncate font-medium text-emerald-300", numeric(row[lang].new) && "font-mono tabular-nums")}>{row[lang].new}</span>
                  </span>
                </span>
                <span className="hidden items-center gap-2 text-[14px] md:flex">
                  <span className={clsx("truncate text-white/40 line-through decoration-1", numeric(row[lang].old) && "font-mono tabular-nums")}>{row[lang].old}</span>
                  <ArrowRight aria-hidden className="size-3.5 shrink-0 text-white/30" />
                  <span className={clsx("truncate font-medium text-emerald-300", numeric(row[lang].new) && "font-mono tabular-nums")}>{row[lang].new}</span>
                </span>
                <Who user={row.user} automated={"automated" in row && row.automated} className="hidden md:flex" />
                <span className="hidden shrink-0 text-[12px] text-white/45 tabular-nums sm:inline">{row[lang].date}</span>
              </li>
            );
          })}
        </ul>
      </SceneCard>
    </Scene>
  );
}

/* Numerspace's categories, each with the icon its subject suggests. */
const NUMERSPACE_ICON: Record<string, ReactNode> = {
  "Finance & Investment": <Landmark aria-hidden />,
  "Health & Fitness": <HeartPulse aria-hidden />,
  "Work & Career": <Briefcase aria-hidden />,
  "Time & Date": <CalendarClock aria-hidden />,
  "Marketing & Analytics": <Megaphone aria-hidden />,
  "Math & Converters": <Sigma aria-hidden />,
  "Education & Productivity": <GraduationCap aria-hidden />,
  "Home & Living": <House aria-hidden />,
  "Clothing & Sizing": <Shirt aria-hidden />,
  Pets: <PawPrint aria-hidden />,
  "Vehicle & Travel": <Car aria-hidden />,
  Faith: <Moon aria-hidden />,
  Astrology: <Sparkles aria-hidden />,
};

/** One category on the shelf: its icon, its name, how many calculators. */
function ShelfItem({ lang, cat }: { lang: Lang; cat: (typeof NUMERSPACE_REAL.categories)[number] }) {
  const t = T[lang];
  return (
    <span className="mr-3 flex shrink-0 items-center gap-3 rounded-xl bg-paper px-4 py-3 ring-1 ring-ink-950/[0.06] shadow-[0_18px_40px_-20px_rgb(10_16_32/0.45)]">
      <IconTile tint="bg-teal-50 text-teal-700">{NUMERSPACE_ICON[cat.en] ?? <Calculator aria-hidden />}</IconTile>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium whitespace-nowrap text-ink-950">{cat[lang]}</span>
        <span className="block text-[12px] whitespace-nowrap text-teal-700 tabular-nums">{t.calculators(cat.count)}</span>
      </span>
    </span>
  );
}

/** A row of the shelf: the items twice over, gliding endlessly. */
function Shelf({ lang, items, reverse = false, duration }: { lang: Lang; items: (typeof NUMERSPACE_REAL.categories)[number][]; reverse?: boolean; duration: string }) {
  return (
    <div className="lab-marquee" data-reverse={reverse ? "" : undefined} style={{ "--marquee-duration": duration } as CSSProperties}>
      {[0, 1].map((copy) => (
        <span key={copy} className="flex" aria-hidden={copy === 1 ? true : undefined}>
          {items.map((cat) => (
            <ShelfItem key={cat.en} lang={lang} cat={cat} />
          ))}
        </span>
      ))}
    </div>
  );
}

/** Numerspace: the whole catalogue as two shelves of categories, icons
    and counts, gliding past in opposite directions on their own - every
    kind of calculator the site has, without a word more. */
export function NumerspaceScene({ lang }: { lang: Lang }) {
  const w = WT[lang];
  const cats = NUMERSPACE_REAL.categories;
  const half = Math.ceil(cats.length / 2);
  return (
    <Scene label={w.labels.numerspace}>
      <div className="absolute inset-0 flex flex-col justify-center gap-4">
        <SceneCard bare flow>
          <Shelf lang={lang} items={cats.slice(0, half)} duration="52s" />
        </SceneCard>
        <SceneCard bare flow>
          <Shelf lang={lang} items={cats.slice(half)} reverse duration="60s" />
        </SceneCard>
      </div>
    </Scene>
  );
}
