import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  Ban,
  BarChart3,
  BellRing,
  BookOpen,
  ChevronDown,
  CircleCheck,
  Database,
  Filter,
  Flag,
  Gavel,
  GitBranch,
  Info,
  LayoutDashboard,
  Lightbulb,
  Mail,
  MessageSquare,
  PieChart,
  Power,
  Presentation,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Table2,
  Tag,
  Users,
  Wallet,
  Workflow,
} from "lucide-react";

import {
  AppBar,
  AppTitle,
  Badge,
  type BadgeTone,
  CheckRow,
  Chip,
  codeLabel,
  Count,
  Field,
  FormLabel,
  KeyValues,
  Rail,
  RailTitle,
  Segmented,
  Stepper,
  type StepState,
  Table,
  type TabItem,
  TabStrip,
  Td,
  Th,
  Toggle,
  Tr,
  Window,
  type WindowTone,
} from "@/components/ui/LabWindow";
import { PATTERNS } from "@/components/ui/PatternFlow";
import { clsx } from "@/lib/clsx";
import type { Lang } from "@/lib/content";
import { CHANGE_HISTORY_REAL, DASHBOARD_REAL, NUMERSPACE_REAL } from "@/lib/lab-material";

/* THE LAB'S PRODUCT WINDOWS, SHARED: screenshots of the products, rendered.

   Hulusi's brief (2026-09-06): the Lab's product visuals must "feel like
   real product screenshots, not Claude design". These are the windows
   more than one page needs - the builder's canvas, the explorer's
   dashboard, a Numerspace calculator page, the dashboard builder's
   comparability check - built from the parts in LabWindow.tsx (which
   also carries the type rules: mono for numbers only, no capitals,
   nothing under 12px, icons instead of bare dots) and used by the
   product pages under /lab. The Lab index may use them too; nothing
   here depends on it.

   STILL NOTHING IS INVENTED. Every row, count, value and label is the
   product's own material: the pattern blueprints copied from the
   builder's knowledge base (PatternFlow.tsx), the explorer's demo dataset
   and its shipped filter defaults, the calorie example with its real
   result, the README's revenue reconciliation (lab-material.ts). The
   chrome shows only controls the product really has, and every window
   is a picture (`role="img"`, no pointer events) so a drawn search field
   is never mistaken for a live one. All server-rendered. */

const PW = {
  en: {
    patterns: "Patterns",
    steps: (n: number) => `${n} steps`,
    step: "Step",
    wait: "Wait",
    intent: "Intent",
    branch: "Branch",
    exit: "Exit",
    none: "—",
    changes: (n: number) => `${n} changes`,
    filters: "Filters",
    account: "Account",
    category: "Category",
    ruleMatches: "Rule matches",
    thresholds: "Magnitude thresholds",
    cols: { date: "Date", account: "Account", campaign: "Campaign", category: "Category", change: "Change" },
    showing: (n: number, total: number) => `Showing ${n} of ${total} changes`,
    source: "Source",
    detail: "Change detail",
    adGroup: "Ad group",
    old: "Old value",
    next: "New value",
    delta: "Change",
    pipeline: "Pipeline",
    outputs: "Outputs",
    check: "Comparability check",
    nav: { categories: "Categories", blog: "Blog", search: "Search", home: "Home" },
    genders: ["Male", "Female"] as const,
    info: "Your info",
    goal: "Your goal",
    goals: ["Lose weight", "Maintain weight", "Gain weight"] as const,
    bmr: "BMR",
    labels: {
      builder: (name: string) => `The Journey Builder's canvas: the ${name} pattern as a flow of steps, with its pattern rail and an inspector on the first step.`,
      explorer: "The Change History Explorer's dashboard: its section tabs, filters and the change table over the demo dataset.",
      numerspace: "Numerspace's Daily Calorie Calculator page with the worked example filled in and its result.",
      dashboard: "The Dashboard Builder's pipeline stopped at the comparability engine, with revenue by source, the naive sum it refuses and the actual total.",
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
    changes: (n: number) => `${n} değişiklik`,
    filters: "Filtreler",
    account: "Hesap",
    category: "Kategori",
    ruleMatches: "Kural eşleşmeleri",
    thresholds: "Büyüklük eşikleri",
    cols: { date: "Tarih", account: "Hesap", campaign: "Kampanya", category: "Kategori", change: "Değişim" },
    showing: (n: number, total: number) => `${total} değişikliğin ${n} tanesi gösteriliyor`,
    source: "Kaynak",
    detail: "Değişiklik detayı",
    adGroup: "Reklam grubu",
    old: "Eski değer",
    next: "Yeni değer",
    delta: "Değişim",
    pipeline: "Pipeline",
    outputs: "Çıktılar",
    check: "Karşılaştırılabilirlik kontrolü",
    nav: { categories: "Kategoriler", blog: "Blog", search: "Ara", home: "Ana sayfa" },
    genders: ["Erkek", "Kadın"] as const,
    info: "Bilgileriniz",
    goal: "Hedefiniz",
    goals: ["Kilo ver", "Kilo koru", "Kilo al"] as const,
    bmr: "BMR",
    labels: {
      builder: (name: string) => `Journey Builder'ın tuvali: ${name} deseni adımlardan oluşan bir akış olarak, desen rayı ve ilk adımın denetçisiyle.`,
      explorer: "Change History Explorer'ın panosu: bölüm sekmeleri, filtreler ve demo veri seti üzerindeki değişiklik tablosu.",
      numerspace: "Numerspace'in Günlük Kalori Hesaplayıcı sayfası, örnek değerler girilmiş ve sonucu görünür halde.",
      dashboard: "Dashboard Builder'ın pipeline'ı karşılaştırılabilirlik motorunda durmuş; kaynağa göre gelir, reddettiği toplam ve gerçek toplam.",
    },
  },
} as const;

/* ------------------------------------------------ THE BUILDER'S CANVAS */

/* The flow vocabulary - the same hues as PatternFlow.tsx, so a channel
   is the same colour on the canvas, in the inspector and in the legend,
   and now the same icon everywhere too. */
const CHANNEL_TILE: Record<string, string> = {
  email: "bg-violet-50 text-violet-700",
  push: "bg-sky-50 text-sky-700",
  sms: "bg-teal-50 text-teal-700",
  "in-app": "bg-amber-50 text-amber-700",
};
const CHANNEL_HUE: Record<string, BadgeTone> = { email: "violet", push: "sky", sms: "teal", "in-app": "amber" };
const CHANNEL_ICON = { email: Mail, push: BellRing, sms: MessageSquare, "in-app": Smartphone } as const;
const CHANNEL_NAME: Record<string, string> = { email: "Email", push: "Push", sms: "SMS", "in-app": "In-app" };

/* The canvas legend: the same entries the builder's own demo canvas
   prints above its graph (Entry · Email · Push · SMS · In-app · Exit),
   each with the icon its nodes carry. */
const LEGEND: readonly { label: string; icon: ReactNode; ink: string }[] = [
  { label: "Entry", icon: <Flag aria-hidden />, ink: "text-ink-900" },
  { label: "Email", icon: <Mail aria-hidden />, ink: "text-violet-600" },
  { label: "Push", icon: <BellRing aria-hidden />, ink: "text-sky-600" },
  { label: "SMS", icon: <MessageSquare aria-hidden />, ink: "text-teal-600" },
  { label: "In-app", icon: <Smartphone aria-hidden />, ink: "text-amber-600" },
  { label: "Exit", icon: <CircleCheck aria-hidden />, ink: "text-emerald-600" },
];

/** The builder as its canvas: the pattern rail on the left, one
    blueprint drawn as numbered nodes on a dotted canvas, and the
    inspector open on one step. Three panes above md, the canvas alone
    below it. `patternIndex` picks the blueprint (PatternFlow.tsx's
    PATTERNS), `selectedStep` the node the inspector shows. */
export function BuilderCanvasWindow({
  lang,
  patternIndex = 0,
  selectedStep = 0,
  className,
}: {
  lang: Lang;
  patternIndex?: number;
  selectedStep?: number;
  className?: string;
}) {
  const w = PW[lang];
  const pattern = PATTERNS[patternIndex] ?? PATTERNS[0];
  const selected = pattern.steps[selectedStep] ?? pattern.steps[0];
  const selectedIndex = pattern.steps.indexOf(selected);
  const SelectedIcon = CHANNEL_ICON[selected.channel];
  return (
    <Window
      label={w.labels.builder(pattern.name[lang])}
      address="claude-lifecycle · demo/journey-canvas.html"
      meta={w.steps(pattern.steps.length)}
      className={className}
    >
      <div className="flex">
        <Rail
          title={w.patterns}
          icon={<Workflow aria-hidden />}
          items={PATTERNS.map((p) => ({ label: p.name[lang], count: p.steps.length, active: p === pattern, icon: <GitBranch aria-hidden /> }))}
          className="hidden w-48 sm:block"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-line-soft px-4 py-2.5">
            {LEGEND.map((l) => (
              <span key={l.label} className="flex items-center gap-1.5 text-[12px] font-medium text-ink-600">
                <span className={clsx("flex [&>svg]:size-3.5", l.ink)}>{l.icon}</span>
                {l.label}
              </span>
            ))}
          </div>
          <div className="bg-[radial-gradient(circle,rgb(0_0_0/0.07)_1px,transparent_1px)] bg-[size:14px_14px] px-4 py-4">
            <div className="mx-auto flex max-w-[24rem] flex-col items-center">
              <span className="flex items-center gap-1.5 rounded-md bg-ink-950 px-3 py-1.5 text-[12px] font-medium text-white">
                <Flag aria-hidden className="size-3.5" />
                {pattern.trigger}
              </span>
              {pattern.steps.map((step, i) => {
                const Icon = CHANNEL_ICON[step.channel];
                const on = i === selectedIndex;
                return (
                  <div key={i} className="flex w-full flex-col items-center">
                    <span aria-hidden className="h-3 w-px bg-line-strong" />
                    {step.branch && (
                      <>
                        <span className="flex items-center gap-1 rounded-md bg-paper px-2 py-0.5 text-[12px] text-ink-600 shadow-hairline">
                          <GitBranch aria-hidden className="size-3 text-ink-400" />
                          {step.branch}
                        </span>
                        <span aria-hidden className="h-3 w-px bg-line-strong" />
                      </>
                    )}
                    <div
                      className={clsx(
                        "flex w-full items-center gap-3 rounded-md border bg-paper px-3 py-2",
                        on ? "border-primary-300 ring-2 ring-primary-100" : "border-line shadow-hairline",
                      )}
                    >
                      <span className={clsx("grid size-7 shrink-0 place-items-center rounded-md", CHANNEL_TILE[step.channel])}>
                        <Icon aria-hidden className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="text-[13px] font-semibold text-ink-950">{CHANNEL_NAME[step.channel]}</span>
                          <span className="font-mono text-[12px] text-ink-500 tabular-nums">{step.wait}</span>
                        </span>
                        <span className="block truncate text-[12.5px] text-ink-600">{step.intent}</span>
                      </span>
                      <span className="shrink-0 text-[12px] text-ink-400 tabular-nums">{i + 1}</span>
                    </div>
                  </div>
                );
              })}
              <span aria-hidden className="h-3 w-px bg-line-strong" />
              <span className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-[12px] font-medium text-white">
                <CircleCheck aria-hidden className="size-3.5" />
                {pattern.exit[lang]}
              </span>
            </div>
          </div>
        </div>

        <aside className="hidden w-60 shrink-0 border-l border-line-soft md:block">
          <RailTitle icon={<SlidersHorizontal aria-hidden />}>
            {w.step} {selectedIndex + 1}
          </RailTitle>
          <div className="px-3.5 pb-3">
            <Badge hue={CHANNEL_HUE[selected.channel] ?? "neutral"} icon={<SelectedIcon aria-hidden />}>
              {CHANNEL_NAME[selected.channel]}
            </Badge>
            <KeyValues
              className="mt-3"
              rows={[
                [w.wait, <span key="w" className="font-mono text-[12.5px] tabular-nums">{selected.wait}</span>],
                [w.intent, selected.intent],
                [w.branch, selected.branch ?? w.none],
              ]}
            />
          </div>
          <RailTitle icon={<CircleCheck aria-hidden />}>{w.exit}</RailTitle>
          <p className="px-3.5 pb-3.5 text-[13px] font-medium text-emerald-700">{pattern.exit[lang]}</p>
        </aside>
      </div>
    </Window>
  );
}

/* ------------------------------------------- THE EXPLORER'S DASHBOARD */

/* The dashboard's own sections, as its README lists them (six of the
   nine, so the strip fits one row; the open one is the Explorer), each
   with an icon that says what the section is. */
export const EXPLORER_TABS: readonly TabItem[] = [
  { label: "Summary", icon: <LayoutDashboard aria-hidden /> },
  { label: "Activity Timeline", icon: <Activity aria-hidden /> },
  { label: "User Activity", icon: <Users aria-hidden /> },
  { label: "Category Distribution", icon: <PieChart aria-hidden /> },
  { label: "Rule Matches", icon: <ShieldAlert aria-hidden /> },
  { label: "Change Explorer", icon: <Table2 aria-hidden /> },
];

type ExplorerRow = (typeof CHANGE_HISTORY_REAL.explorerRows)[number];

/* Category counts over the demo rows, in first-appearance order. */
const EXPLORER_CATEGORIES = CHANGE_HISTORY_REAL.explorerRows.reduce<{ category: string; count: number }[]>((acc, row) => {
  const hit = acc.find((c) => c.category === row.category);
  if (hit) hit.count += 1;
  else acc.push({ category: row.category, count: 1 });
  return acc;
}, []);

/* The category hues the product page established (ChangeHistoryExplorerPage),
   now each with the icon the explorer's badges carry. */
const CATEGORY_HUE: Record<string, BadgeTone> = { Status: "emerald", Budget: "primary", Bidding: "violet", Keyword: "sky" };
const CATEGORY_ICON: Record<string, ReactNode> = {
  Status: <Power aria-hidden />,
  Budget: <Wallet aria-hidden />,
  Bidding: <Gavel aria-hidden />,
  Keyword: <Tag aria-hidden />,
};

/** A category badge, the explorer's own: hue and icon by category. */
export function CategoryBadge({ category, tone = "light" }: { category: string; tone?: WindowTone }) {
  return (
    <Badge tone={tone} hue={CATEGORY_HUE[category] ?? "neutral"} icon={CATEGORY_ICON[category]}>
      {category}
    </Badge>
  );
}

/** The size of a numeric change, from the row's own English values
    (150,000 -> 200,000 = +33%). Null where the change is not a number
    (Enabled -> Paused). Real arithmetic, never a stored figure. */
export function explorerDelta(row: ExplorerRow): string | null {
  const prev = Number(row.en.old.replace(/,/g, ""));
  const next = Number(row.en.new.replace(/,/g, ""));
  if (!Number.isFinite(prev) || !Number.isFinite(next) || prev === 0) return null;
  const pct = Math.round(((next - prev) / prev) * 100);
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

/** An old value beside its new one, the way the explorer's Change column
    states it: the old struck through, the new in the emerald the site
    uses for "after". Values are numbers or states; only the numbers take
    the mono face. */
export function ChangeCell({ row, lang, tone = "light" }: { row: ExplorerRow; lang: Lang; tone?: WindowTone }) {
  const dark = tone === "dark";
  const numeric = explorerDelta(row) !== null;
  const face = numeric ? "font-mono text-[12.5px] tabular-nums" : "text-[13px]";
  return (
    <span className={clsx("inline-flex items-center gap-1.5", face)}>
      <span className={clsx("line-through decoration-1", dark ? "text-white/40" : "text-ink-400")}>{row[lang].old}</span>
      <ArrowRight aria-hidden className={clsx("size-3.5", dark ? "text-white/30" : "text-ink-300")} />
      <span className={clsx("font-semibold", dark ? "text-emerald-300" : "text-emerald-700")}>{row[lang].new}</span>
    </span>
  );
}

/** The change table, in the kit's own parts, either tone. Date hides
    below md and Account below sm so the campaign and the change - the
    two columns that carry the row - survive every width. */
export function ExplorerTable({
  lang,
  rows,
  tone = "light",
  selected,
  compact = false,
}: {
  lang: Lang;
  rows: readonly ExplorerRow[];
  tone?: WindowTone;
  selected?: number;
  /** Beside a detail pane: the Account column waits until xl, since the
      pane states the account anyway and the campaign must not truncate. */
  compact?: boolean;
}) {
  const w = PW[lang];
  const dark = tone === "dark";
  /* Container queries: the columns answer to the table's own pane, so the
     same table fits beside a detail pane, alone in a hero, or on a phone. */
  const accountCell = compact ? "hidden @2xl:table-cell" : "hidden @sm:table-cell";
  return (
    <Table>
      <thead>
        <tr>
          <Th tone={tone} className="hidden @lg:table-cell">
            {w.cols.date}
          </Th>
          <Th tone={tone} className={accountCell}>
            {w.cols.account}
          </Th>
          <Th tone={tone} className="w-full">
            {w.cols.campaign}
          </Th>
          <Th tone={tone} className="hidden @sm:table-cell">
            {w.cols.category}
          </Th>
          <Th tone={tone}>{w.cols.change}</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <Tr key={i} tone={tone} selected={i === selected}>
            <Td className={clsx("hidden text-[12.5px] whitespace-nowrap tabular-nums @lg:table-cell", dark ? "text-white/50" : "text-ink-500")}>
              {row[lang].date}
            </Td>
            <Td className={clsx(accountCell, "whitespace-nowrap", dark ? "text-white/70" : "text-ink-700")}>{row.account}</Td>
            <Td className="w-full max-w-0 min-w-[7.5rem]">
              <span className={clsx("block truncate font-semibold", dark ? "text-white" : "text-ink-950")}>{row.campaign}</span>
              {row.adGroup !== "—" && <span className={clsx("block truncate text-[12px]", dark ? "text-white/50" : "text-ink-500")}>{row.adGroup}</span>}
              {/* On a phone the category sits under the name instead of in its own column. */}
              <span className="mt-1.5 block @sm:hidden">
                <CategoryBadge category={row.category} tone={tone} />
              </span>
            </Td>
            <Td className="hidden whitespace-nowrap @sm:table-cell">
              <CategoryBadge category={row.category} tone={tone} />
            </Td>
            <Td className="whitespace-nowrap">
              <ChangeCell row={row} lang={lang} tone={tone} />
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}

/** The explorer as the dashboard the tool writes: its section tabs with
    the Change Explorer open, the Filters rail (both accounts checked,
    the category chips, Rule Matches off - the shipped default - over its
    thresholds), and the change table. `detail` opens the before/after
    pane the real dashboard has on the first row; `limit` trims the rows
    for a smaller frame. Light on the product page, dark on a dark card. */
export function ExplorerWindow({
  lang,
  tone = "light",
  limit,
  detail = false,
  className,
}: {
  lang: Lang;
  tone?: WindowTone;
  limit?: number;
  detail?: boolean;
  className?: string;
}) {
  const w = PW[lang];
  const R = CHANGE_HISTORY_REAL;
  const dark = tone === "dark";
  const rows = limit ? R.explorerRows.slice(0, limit) : R.explorerRows;
  const open = rows[0];
  const delta = explorerDelta(open);
  const section = clsx("text-[12px] font-semibold", dark ? "text-white/55" : "text-ink-600");
  return (
    <Window label={w.labels.explorer} address="dashboard.html" tone={tone} meta={`${w.changes(R.totalChanges)} · ${R.period[lang]}`} className={className}>
      <TabStrip tone={tone} items={EXPLORER_TABS} active="Change Explorer" />
      <div className="flex">
        <Rail tone={tone} title={w.filters} icon={<Filter aria-hidden />} className={clsx("hidden md:block", detail ? "w-52" : "w-56")}>
          <div className="px-3.5 pb-3.5">
            <p className={section}>{w.account}</p>
            <div className="mt-0.5">
              {R.accountActivity.map((a) => (
                <CheckRow key={a.account} on tone={tone} count={a.count}>
                  {a.account}
                </CheckRow>
              ))}
            </div>
            <p className={clsx("mt-3", section)}>{w.category}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {EXPLORER_CATEGORIES.map((c) => (
                <Chip key={c.category} tone={tone} icon={CATEGORY_ICON[c.category]}>
                  {c.category}
                  <Count tone={tone}>{c.count}</Count>
                </Chip>
              ))}
            </div>
            <p className={clsx("mt-3.5", section)}>{w.ruleMatches}</p>
            <div className="mt-2">
              <Toggle tone={tone} on={false} label={w.thresholds} />
            </div>
            <ul className="mt-2 flex list-none flex-col gap-1 p-0">
              {R.magnitudeRules.map((r) => (
                <li key={r.label.en} className={clsx("flex items-center justify-between gap-2 text-[12.5px]", dark ? "text-white/50" : "text-ink-500")}>
                  <span className="truncate">{r.label[lang]}</span>
                  <span className="font-mono tabular-nums">±{r.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Rail>
        <div className="@container flex min-w-0 flex-1 flex-col">
          <ExplorerTable lang={lang} rows={rows} tone={tone} selected={detail ? 0 : undefined} compact={detail} />
          <p className={clsx("mt-auto border-t px-3.5 py-2.5 text-[12.5px] tabular-nums", dark ? "border-white/10 text-white/45" : "border-line-soft text-ink-500")}>
            {w.showing(rows.length, R.totalChanges)}
          </p>
        </div>
        {detail && (
          <aside className={clsx("hidden w-60 shrink-0 border-l lg:block", dark ? "border-white/10" : "border-line-soft")}>
            <RailTitle tone={tone} icon={<Info aria-hidden />}>
              {w.detail}
            </RailTitle>
            <div className="px-3.5 pb-3.5">
              <p className={clsx("text-[14px] font-semibold", dark ? "text-white" : "text-ink-950")}>{open.campaign}</p>
              <div className="mt-2">
                <CategoryBadge category={open.category} tone={tone} />
              </div>
              <KeyValues
                tone={tone}
                className="mt-3"
                rows={[
                  [w.account, open.account],
                  [w.adGroup, open.adGroup],
                  [w.old, <span key="o" className="font-mono text-[12.5px] line-through decoration-1 tabular-nums">{open[lang].old}</span>],
                  [w.next, <span key="n" className={clsx("font-mono text-[12.5px] font-semibold tabular-nums", dark ? "text-emerald-300" : "text-emerald-700")}>{open[lang].new}</span>],
                  ...(delta ? ([[w.delta, <span key="d" className="font-mono text-[12.5px] font-semibold tabular-nums">{delta}</span>]] as [string, ReactNode][]) : []),
                  [w.cols.date, <span key="t" className="tabular-nums">{open[lang].date}</span>],
                ]}
              />
            </div>
          </aside>
        )}
      </div>
    </Window>
  );
}

/* --------------------------------------- THE DASHBOARD BUILDER AT WORK */

/* The six stages, each with the icon the stepper shows for it. */
const STAGE_ICONS: readonly ReactNode[] = [
  <Database key="data" aria-hidden />,
  <ShieldCheck key="gate" aria-hidden />,
  <BookOpen key="registry" aria-hidden />,
  <Scale key="comparability" aria-hidden />,
  <BarChart3 key="analysis" aria-hidden />,
  <Lightbulb key="insight" aria-hidden />,
];
const OUTPUT_ICONS: readonly ReactNode[] = [<LayoutDashboard key="dashboard" aria-hidden />, <Presentation key="deck" aria-hidden />];

/** The pipeline as a stepper, stopped at one stage. */
export function PipelineStepper({ lang, activeStage }: { lang: Lang; activeStage: number }) {
  const steps = DASHBOARD_REAL.pipeline.map((s, i) => ({
    label: s[lang],
    icon: STAGE_ICONS[i],
    state: (i < activeStage ? "done" : i === activeStage ? "active" : "todo") as StepState,
  }));
  return <Stepper steps={steps} />;
}

/** The dashboard builder at its comparability check: the six-stage
    pipeline in the rail, stopped at the comparability engine, and the
    README's own revenue reconciliation - four sources, the naive sum it
    refuses to print, the actual total from the system of record. The
    three labels come from the page, so the page and the window cannot
    say the example two ways. */
export function DashboardHeroWindow({
  lang,
  labels,
  className,
}: {
  lang: Lang;
  labels: { revenue: string; naive: string; actual: string };
  className?: string;
}) {
  const w = PW[lang];
  const D = DASHBOARD_REAL;
  const activeStage = 3;
  const { parts, naiveSum, trueTotal } = D.revenueExample;
  const max = Math.max(...parts.map((p) => p.value), naiveSum);
  return (
    <Window label={w.labels.dashboard} address="dashboard-builder" meta={w.check} className={className}>
      <div className="flex">
        <Rail title={w.pipeline} icon={<Workflow aria-hidden />} className="hidden w-56 md:block">
          <div className="px-3.5 pb-3">
            <PipelineStepper lang={lang} activeStage={activeStage} />
          </div>
          <RailTitle icon={<Presentation aria-hidden />}>{w.outputs}</RailTitle>
          <div className="flex flex-wrap gap-1.5 px-3.5 pb-4">
            {D.pipelineOutputs.map((o, i) => (
              <Chip key={o.en} icon={OUTPUT_ICONS[i]}>
                {o[lang]}
              </Chip>
            ))}
          </div>
        </Rail>
        <div className="min-w-0 flex-1">
          <AppBar>
            <AppTitle icon={<BarChart3 aria-hidden />}>{labels.revenue}</AppTitle>
            <Badge hue="emerald" icon={<Scale aria-hidden />}>
              {D.pipeline[activeStage][lang]}
            </Badge>
            <span className="ml-auto">
              <Badge hue="rose" icon={<Ban aria-hidden />} code>
                {codeLabel("NOT_COMPARABLE")}
              </Badge>
            </span>
          </AppBar>
          <div className="px-3.5 py-3.5">
            <div className="flex flex-col gap-2.5">
              {parts.map((p) => (
                <div key={p.source} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-[13px] text-ink-700">{p.source}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-paper-soft">
                    <div className="h-full rounded-full bg-primary-500" style={{ width: `${(p.value / max) * 100}%` }} />
                  </div>
                  <span className="w-14 shrink-0 text-right font-mono text-[12.5px] text-ink-800 tabular-nums">${p.value.toFixed(1)}M</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-rose-50 px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-[13px] font-medium text-rose-700">
                <Ban aria-hidden className="size-4" />
                {labels.naive}
              </span>
              <span className="shrink-0 font-mono text-[14px] font-semibold text-rose-700 line-through decoration-1 tabular-nums">${naiveSum.toFixed(1)}M</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 rounded-md bg-emerald-50 px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-[13px] font-medium text-emerald-700">
                <CircleCheck aria-hidden className="size-4" />
                {labels.actual}
              </span>
              <span className="shrink-0 font-mono text-[14px] font-semibold text-emerald-700 tabular-nums">~${trueTotal.toFixed(1)}M</span>
            </div>
          </div>
          <p className="border-t border-line-soft px-3.5 py-2.5 text-[12.5px] text-ink-500">
            {w.source}: references/comparability-rules.md §2.1
          </p>
        </div>
      </div>
    </Window>
  );
}

/* ------------------------------------------ A NUMERSPACE CALCULATOR */

/** Numerspace as the calculator page itself, the way numerspace.com
    lays it out: the site's nav row, the breadcrumb, the category badge
    and title, the gender segments, the four inputs with the example's
    values in them, the goal segments, then BMR and the result. */
export function NumerspaceWindow({ lang, className }: { lang: Lang; className?: string }) {
  const w = PW[lang];
  const c = NUMERSPACE_REAL.calorie;
  const category = NUMERSPACE_REAL.categories.find((x) => x.en === "Health & Fitness");
  const value = (input: (typeof c.inputs)[number]) => (typeof input.value === "string" ? input.value : input.value[lang]);
  const [gender, age, height, weight, activity] = c.inputs;
  return (
    <Window label={w.labels.numerspace} address="www.numerspace.com" meta={category?.[lang]} className={className}>
      <div className="flex items-center gap-4 border-b border-line-soft px-4 py-2.5">
        <span className="text-[13px] font-bold tracking-tight text-ink-950">NumerSpace</span>
        <span className="flex items-center gap-1 text-[13px] text-ink-700">
          {w.nav.categories}
          <ChevronDown aria-hidden className="size-3.5 text-ink-500" />
        </span>
        <span className="text-[13px] text-ink-700">{w.nav.blog}</span>
        <span className="ml-auto hidden items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[12px] text-ink-500 sm:flex">
          <Search aria-hidden className="size-3.5" />
          {w.nav.search}
          <span className="rounded bg-paper-soft px-1 text-[11px] text-ink-500">⌘K</span>
        </span>
        <Segmented options={["TR", "EN"]} active={lang === "en" ? "EN" : "TR"} className="ml-auto w-[5rem] sm:ml-0 [&>span]:h-7" />
      </div>
      <div className="px-4 pt-3.5 pb-4 sm:px-5">
        <p className="text-[12.5px] text-ink-500">
          {w.nav.home} / {category?.[lang]} / {c.title[lang]}
        </p>
        <div className="mt-2.5">
          <Badge hue="teal">{category?.[lang]}</Badge>
        </div>
        <p className="mt-2 text-[16px] font-semibold tracking-tight text-ink-950">{c.title[lang]}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{c.formula[lang]}</p>

        <div className="mt-4">
          <FormLabel>{gender.label[lang]}</FormLabel>
        </div>
        <Segmented options={w.genders} active={value(gender)} className="mt-2" />

        <div className="mt-4">
          <FormLabel>{w.info}</FormLabel>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-3">
          <Field label={age.label[lang]} value={value(age)} mono />
          <Field label={height.label[lang]} value={value(height)} mono />
          <Field label={weight.label[lang]} value={value(weight)} mono />
          <Field label={activity.label[lang]} value={value(activity)} select />
        </div>

        <div className="mt-4">
          <FormLabel>{w.goal}</FormLabel>
          <Segmented options={w.goals} active={w.goals[1]} className="mt-2" />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3 text-[13px]">
          <span className="text-ink-600">{w.bmr}</span>
          <span className="font-mono text-ink-900 tabular-nums">{c.bmr[lang]}</span>
        </div>
        <div className="mt-2.5 rounded-lg bg-teal-600 px-4 py-3">
          <p className="text-[12.5px] text-white/80">{c.resultLabel[lang]}</p>
          <p className="mt-0.5 text-[20px] font-semibold text-white tabular-nums">{c.result[lang]}</p>
        </div>
      </div>
    </Window>
  );
}
