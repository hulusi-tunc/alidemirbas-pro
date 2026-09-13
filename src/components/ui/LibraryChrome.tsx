import Link from "next/link";
import type { ReactNode } from "react";
import {
  Archive,
  BellRing,
  Bookmark,
  CalendarClock,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Cog,
  Cpu,
  CreditCard,
  FileText,
  Fingerprint,
  GitBranch,
  HeartPulse,
  KeyRound,
  Layers,
  Mail,
  Megaphone,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Network,
  Package,
  Plug,
  Repeat,
  Rocket,
  Send,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Smartphone,
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

export const SELECT_CLASS =
  "h-11 w-full appearance-none rounded-xl bg-paper pr-10 pl-4 text-sm font-medium text-ink-800 ring-1 ring-ink-950/[0.08] outline-none transition-shadow duration-[var(--duration-fast)] focus:ring-2 focus:ring-primary-400 sm:w-auto";

/** A native select with the site's chevron drawn over it. */
export function SelectShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <label className={clsx("relative block", className)}>
      {children}
      <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-500" />
    </label>
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
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper-soft text-ink-700">
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
