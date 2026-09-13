import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowLeftRight,
  BadgeCheck,
  Ban,
  BellRing,
  Bookmark,
  CalendarClock,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Cog,
  Cpu,
  CreditCard,
  Database,
  FileText,
  Fingerprint,
  Flag,
  GitBranch,
  HeartHandshake,
  HeartPulse,
  KeyRound,
  Layers,
  LifeBuoy,
  Mail,
  Megaphone,
  Merge,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Network,
  Package,
  PackageCheck,
  Pause,
  Plug,
  Radio,
  RefreshCw,
  Repeat,
  Rocket,
  RotateCcw,
  Route,
  Scale,
  Send,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Smartphone,
  Stethoscope,
  Target,
  Timer,
  Undo2,
  UserPlus,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { ChannelId } from "@/canonical/types";

import { clsx } from "@/lib/clsx";
import type { SurfaceKey } from "@/lib/canonical-view";

/* THE LIBRARY CHROME (2026-09-13, Hulusi: "now improve this page", on
   /lab/customer-journeys). The journey library pages were the last surface
   still drawn in the old Lab idiom: square corners, raw blue and neutral
   greys, mono micro-labels, uppercase tracking. This file holds the pieces
   the gallery and its prerender fallback share, on the site's own tokens:
   the surface switch as the same pill rail the /lab hero uses, the search
   and select fields in the rounded, ringed shape of the hero tiles, and
   the category heading. Words are sans, numbers are tabular, nothing under
   12px, nothing uppercase - the rules every Lab window already keeps. */

const SURFACE_ICON: Record<SurfaceKey, ReactNode> = {
  "customer-journeys": <Send aria-hidden className="size-4" />,
  "lifecycle-states": <Layers aria-hidden className="size-4" />,
  "runtime-mechanisms": <Cog aria-hidden className="size-4" />,
};

/* ICONS (Hulusi, 2026-09-13: "everything looks super text-heavy: no icon,
   nothing ... I am just getting bombarded by the text"). One glyph per
   category and per channel, so the rail, the section headings and the
   cards can be scanned before they are read. The category set is the
   canonical taxonomy's own ids; the channel glyphs are the ones the Lab
   windows already use for Email, Push, SMS and In-app. */
const CATEGORY_ICON: Record<string, LucideIcon> = {
  acquisition: UserPlus,
  activation: Rocket,
  retention: HeartPulse,
  consent: ShieldCheck,
  feedback: MessagesSquare,
  time: Timer,
  access: KeyRound,
  identity: Fingerprint,
  structure: Network,
  terminal: Archive,
  integration: Plug,
  processing: Cpu,
  financial: CreditCard,
  fulfillment: Package,
  remedy: Undo2,
  subscription: Repeat,
  scheduling: CalendarClock,
  decision: ClipboardCheck,
  risk: ShieldAlert,
  communication: Megaphone,
  document: FileText,
  rollout: GitBranch,
  incident: Siren,
  presets: Bookmark,
};

/* HUES (Hulusi, 2026-09-13: "her bir kategori için farklı renk kullanır
   mısın"). Each category owns a tint, in the Lab identity's own form - a
   -50 ground under a -700 glyph - so a section, its cards and its rail
   entry share one colour and the eye can find a category before reading
   it. Neighbours in the list never share a hue; a hue that repeats does
   so far apart. Presets sit on the brand blue, the one non-category. */
type Accent = { tile: string; ink: string };
const CATEGORY_ACCENT: Record<string, Accent> = {
  acquisition: { tile: "bg-sky-50 text-sky-700", ink: "text-sky-700" },
  activation: { tile: "bg-violet-50 text-violet-700", ink: "text-violet-700" },
  retention: { tile: "bg-rose-50 text-rose-700", ink: "text-rose-700" },
  consent: { tile: "bg-emerald-50 text-emerald-700", ink: "text-emerald-700" },
  feedback: { tile: "bg-amber-50 text-amber-700", ink: "text-amber-700" },
  time: { tile: "bg-orange-50 text-orange-700", ink: "text-orange-700" },
  access: { tile: "bg-teal-50 text-teal-700", ink: "text-teal-700" },
  identity: { tile: "bg-indigo-50 text-indigo-700", ink: "text-indigo-700" },
  structure: { tile: "bg-cyan-50 text-cyan-700", ink: "text-cyan-700" },
  terminal: { tile: "bg-stone-100 text-stone-700", ink: "text-stone-700" },
  integration: { tile: "bg-fuchsia-50 text-fuchsia-700", ink: "text-fuchsia-700" },
  processing: { tile: "bg-slate-100 text-slate-700", ink: "text-slate-700" },
  financial: { tile: "bg-lime-50 text-lime-700", ink: "text-lime-700" },
  fulfillment: { tile: "bg-purple-50 text-purple-700", ink: "text-purple-700" },
  remedy: { tile: "bg-pink-50 text-pink-700", ink: "text-pink-700" },
  subscription: { tile: "bg-green-50 text-green-700", ink: "text-green-700" },
  scheduling: { tile: "bg-yellow-50 text-yellow-700", ink: "text-yellow-700" },
  decision: { tile: "bg-indigo-50 text-indigo-700", ink: "text-indigo-700" },
  risk: { tile: "bg-red-50 text-red-700", ink: "text-red-700" },
  communication: { tile: "bg-sky-50 text-sky-700", ink: "text-sky-700" },
  document: { tile: "bg-stone-100 text-stone-700", ink: "text-stone-700" },
  rollout: { tile: "bg-teal-50 text-teal-700", ink: "text-teal-700" },
  incident: { tile: "bg-rose-50 text-rose-700", ink: "text-rose-700" },
  presets: { tile: "bg-primary-50 text-primary-700", ink: "text-primary-700" },
};
const NEUTRAL_ACCENT: Accent = { tile: "bg-paper-soft text-ink-700", ink: "text-ink-500" };

export function categoryAccent(id: string): Accent {
  return CATEGORY_ACCENT[id] ?? NEUTRAL_ACCENT;
}

export function CategoryIcon({ id, className = "size-4" }: { id: string; className?: string }) {
  const Icon = CATEGORY_ICON[id] ?? Layers;
  return <Icon aria-hidden className={className} />;
}

const CHANNEL_ICON: Record<ChannelId, LucideIcon> = {
  email: Mail,
  push: BellRing,
  sms: MessageSquare,
  "in-app": Smartphone,
  whatsapp: MessageCircle,
  sales: UserRound,
  task: ClipboardList,
};

export function ChannelIcon({ id, className = "size-3.5" }: { id: ChannelId; className?: string }) {
  const Icon = CHANNEL_ICON[id] ?? Send;
  return <Icon aria-hidden className={className} />;
}

/** One glyph per goal, the audited primary discovery filter, so the goal
    menu can be chosen from by eye (Hulusi, 2026-09-14). */
const GOAL_ICON: Record<string, LucideIcon> = {
  "access-entitlement-change": KeyRound,
  "cancellation-termination": Ban,
  "change-versioning": GitBranch,
  "compensation-remedy": Undo2,
  "consent-permission": ShieldCheck,
  "data-integrity": Database,
  "decision-approval": ClipboardCheck,
  "delivery-confirmation": PackageCheck,
  "eligibility-qualification": BadgeCheck,
  "escalation-exception": AlertTriangle,
  "expiry-renewal": RefreshCw,
  "health-risk-signal-scoring": Activity,
  "identity-verification": Fingerprint,
  "merge-consolidation": Merge,
  "ownership-transfer": ArrowLeftRight,
  "progression-milestone": Flag,
  "readiness-revalidation": RotateCcw,
  "reconciliation-correction": Scale,
  "recovery-retry": LifeBuoy,
  "relationship-hierarchy-structure": Network,
  "relationship-recovery-intervention": HeartHandshake,
  "risk-compliance": ShieldAlert,
  "root-cause-diagnostic-correlation": Stethoscope,
  "routing-assignment": Route,
  "scheduling-commitment": CalendarClock,
  "suspension-restoration": Pause,
};

export function GoalIcon({ id, className = "size-4" }: { id: string; className?: string }) {
  const Icon = GOAL_ICON[id] ?? Target;
  return <Icon aria-hidden className={className} />;
}

/** The "any" glyphs the two filter menus open with. */
export const ALL_CHANNELS_ICON = <Radio aria-hidden />;
export const ALL_GOALS_ICON = <Target aria-hidden />;

/** The taxonomy's titles are lists ("Acquisition, intent & qualification");
    in a rail only the first term fits, and with the icon and the count it
    is enough to navigate by. The full title still heads the section. */
export function shortCategoryTitle(title: string): string {
  return title.split(/,| & | ve /)[0].trim();
}

/** The three public surfaces are routes, so this is navigation, not a
    filter: the current one is a static pill, the others are links. */
export function SurfaceTabs({
  links,
  active,
  label,
}: {
  links: readonly { key: SurfaceKey; href: string; label: string }[];
  active: SurfaceKey;
  label: string;
}) {
  return (
    <nav aria-label={label} className="inline-flex max-w-full flex-wrap gap-1 rounded-full bg-paper-soft p-1">
      {links.map((l) =>
        l.key === active ? (
          <span
            key={l.key}
            aria-current="page"
            className="flex items-center gap-2 rounded-full bg-ink-950 px-3.5 py-1.5 text-sm font-medium text-paper"
          >
            {SURFACE_ICON[l.key]}
            {l.label}
          </span>
        ) : (
          <Link
            key={l.key}
            href={l.href}
            className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium text-ink-700 transition-colors duration-[var(--duration-fast)] hover:bg-paper hover:text-ink-950"
          >
            {SURFACE_ICON[l.key]}
            {l.label}
          </Link>
        ),
      )}
    </nav>
  );
}

/** The search field's shell; the live input (JourneyGallery) and the inert
    prerender copy (LabPage's fallback) both sit inside it. */
export const SEARCH_SHELL =
  "flex h-11 items-center gap-2.5 rounded-xl bg-paper px-4 text-sm text-ink-900 ring-1 ring-ink-950/[0.08] transition-shadow duration-[var(--duration-fast)] focus-within:ring-2 focus-within:ring-primary-400";

/* One toolbar row from lg: the search takes the room, the three filters
   are one fixed width each. Left to the browser, a native select is as
   wide as its longest option, and the category titles made that three
   mismatched boxes (Hulusi, 2026-09-13: "this part looks to me a problem"). */
export const TOOLBAR_ROW = "mt-4 flex flex-col gap-3 lg:flex-row lg:items-center";

export const SELECT_CLASS =
  "h-11 w-full appearance-none truncate rounded-xl bg-paper pr-10 pl-4 text-sm font-medium text-ink-800 ring-1 ring-ink-950/[0.08] outline-none transition-shadow duration-[var(--duration-fast)] focus:ring-2 focus:ring-primary-400";

export const SELECT_WIDTH = "w-full lg:w-52";

/** A native select with the site's chevron drawn over it. */
export function SelectShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <label className={clsx("relative block shrink-0", SELECT_WIDTH, className)}>
      {children}
      <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-500" />
    </label>
  );
}

/** The inert twin of a select for the prerender fallback: same shell,
    same width, no control. */
export function ChevronSelect({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className={clsx("relative block shrink-0", SELECT_WIDTH)}>
      <span className={clsx(SELECT_CLASS, "flex items-center gap-2.5 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-ink-500")}>
        {icon}
        {children}
      </span>
      <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-500" />
    </span>
  );
}

/** A category section's heading: the category's icon in a tile, the title
    on the h3 step, the id prefix (real addressable data - every journey in
    it is ACQ-nn, RET-nn) and the count in tabular figures, the category's
    purpose sentence under it, held to two lines. */
export function CategoryHeader({
  id,
  code,
  title,
  count,
  countLabel,
  purpose,
}: {
  id: string;
  code: string;
  title: string;
  count: number;
  countLabel: string;
  purpose: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className={clsx("grid size-10 shrink-0 place-items-center rounded-xl", categoryAccent(id).tile)}>
        <CategoryIcon id={id} className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-h3 text-ink-950">{title}</h2>
          <span className="shrink-0 text-sm text-ink-500 tabular-nums">
            {code} · {count} {countLabel}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 max-w-3xl text-sm leading-relaxed text-ink-600">{purpose}</p>
      </div>
    </div>
  );
}
