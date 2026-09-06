import type { ReactNode } from "react";
import { Check, ChevronDown, Lock, Search } from "lucide-react";

import { clsx } from "@/lib/clsx";

/* THE LAB'S PRODUCT WINDOWS: the parts a screenshot of a product is made of.

   Hulusi's brief (2026-09-06): the Lab's project visuals must "feel like
   real product screenshots, not Claude design" - not tidy cards of text
   with a tint behind them, but the product itself: a title bar, an app
   bar with its search field, a rail of filters with counts, a table with
   a header row, an inspector, a form with labelled inputs, a tab strip.
   This file is that vocabulary, once, so every window in the Lab is a
   screenshot of a different product taken with the same camera.

   THE ANATOMY IS BORROWED, THE SKIN IS OURS. The component set is the
   one an app kit has - it follows the shapes of the CESP kit in
   hulusi-tunc/CESP (sidebar, topbar, table card, status badge, stepper,
   segmented control) - used as a structural donor: the DOM shapes and
   the density travel, every visual value is this site's own token
   (paper / paper-soft / line / ink, primary-600). Nothing here should
   look like the kit it came from.

   TYPE RULES (Hulusi's second review, same day): the mono face is for
   NUMBERS only - values, counts, deltas, thresholds - never for words,
   so rail titles, addresses, event names and labels are all set in the
   sans. Nothing is set in capitals: rail titles, form labels and even
   the products' own enum ids (NOT_COMPARABLE, BLOCKER) are shown in
   sentence case - see `codeLabel`. Nothing in a window is set below
   12px, and secondary text sits on ink-500, not lighter: a screenshot
   has to be legible at the size it is shown. Status is never a bare
   coloured dot; a badge, a legend entry or a pipeline stage carries an
   icon that says what it is.

   A WINDOW IS A PICTURE. Every control in it is drawn, not wired - a
   search field that does not search, a toggle that does not toggle -
   and a control that looks live but is not is the false-affordance
   failure. So the root is a `<figure role="img">` with a label, and it
   turns pointer events off: the cursor never changes over a drawn
   control, nothing in it can be clicked, and the one real action - the
   project's own buttons beside it - is never confused with the picture.
   What the picture shows is still real: every row, count, value and
   label is the product's own data, never a mock-up.

   Two tones, `light` and `dark`, each written out as literal class
   strings per part: Tailwind cannot see a class composed at runtime. */

export type WindowTone = "light" | "dark";

const isDark = (tone: WindowTone) => tone === "dark";

/* ------------------------------------------------------------ THE FRAME */

const FRAME: Record<WindowTone, string> = {
  light:
    "border-line-soft bg-paper text-ink-900 shadow-[0_0_0_1px_rgb(0_0_0/0.03),0_30px_70px_-30px_rgb(10_16_32/0.38)]",
  dark: "border-white/10 bg-ink-900 text-white shadow-[0_30px_70px_-30px_rgb(0_0_0/0.7)]",
};

/** The window itself: a title bar with the traffic lights, the address
    of what is open behind a lock, and one fact on the right; then
    whatever the product shows. `label` is what a screen reader gets
    instead of the picture. */
export function Window({
  label,
  address,
  meta,
  tone = "light",
  className,
  children,
}: {
  label: string;
  address: string;
  meta?: ReactNode;
  tone?: WindowTone;
  className?: string;
  children: ReactNode;
}) {
  const dark = isDark(tone);
  return (
    <figure
      role="img"
      aria-label={label}
      className={clsx("pointer-events-none m-0 overflow-hidden rounded-xl border text-left select-none", FRAME[tone], className)}
    >
      <div
        className={clsx(
          "grid h-10 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b px-3.5",
          dark ? "border-white/10 bg-white/[0.03]" : "border-line-soft bg-paper-soft/70",
        )}
      >
        <span aria-hidden className="flex gap-1.5">
          <span className={clsx("size-2.5 rounded-full", dark ? "bg-white/15" : "bg-ink-200")} />
          <span className={clsx("size-2.5 rounded-full", dark ? "bg-white/15" : "bg-ink-200")} />
          <span className={clsx("size-2.5 rounded-full", dark ? "bg-white/15" : "bg-ink-200")} />
        </span>
        <span className="flex min-w-0 justify-center">
          <span
            className={clsx(
              "flex h-7 min-w-0 max-w-full items-center gap-1.5 rounded-md px-3 text-[12px] font-medium",
              dark ? "bg-white/[0.06] text-white/60" : "bg-paper text-ink-600 shadow-hairline",
            )}
          >
            <Lock aria-hidden className={clsx("size-3 shrink-0", dark ? "text-white/35" : "text-ink-400")} />
            <span className="truncate">{address}</span>
          </span>
        </span>
        <span className={clsx("hidden text-[12px] font-medium tabular-nums sm:block", dark ? "text-white/45" : "text-ink-500")}>{meta}</span>
      </div>
      {children}
    </figure>
  );
}

/* ---------------------------------------------------------- THE APP BAR */

/** The row under the title bar where a product keeps its title, its
    search field, its filters and its count. */
export function AppBar({ tone = "light", className, children }: { tone?: WindowTone; className?: string; children: ReactNode }) {
  return (
    <div
      className={clsx(
        "flex min-h-11 items-center gap-2.5 border-b px-3.5 py-2",
        isDark(tone) ? "border-white/10" : "border-line-soft",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** The app bar's title: an icon that says what the surface is, then
    the name. */
export function AppTitle({ icon, tone = "light", children }: { icon?: ReactNode; tone?: WindowTone; children: ReactNode }) {
  const dark = isDark(tone);
  return (
    <span className={clsx("flex min-w-0 items-center gap-2 text-[13px] font-semibold", dark ? "text-white" : "text-ink-950")}>
      {icon && <span className={clsx("flex shrink-0 [&>svg]:size-4", dark ? "text-white/55" : "text-ink-500")}>{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
}

/** Secondary text in an app bar: a source, a note, a count. */
export function AppMeta({ tone = "light", className, children }: { tone?: WindowTone; className?: string; children: ReactNode }) {
  return (
    <span className={clsx("shrink-0 text-[12px] tabular-nums", isDark(tone) ? "text-white/45" : "text-ink-500", className)}>{children}</span>
  );
}

/** A search field, drawn. */
export function SearchField({ placeholder, tone = "light", className }: { placeholder: string; tone?: WindowTone; className?: string }) {
  const dark = isDark(tone);
  return (
    <span
      className={clsx(
        "flex h-8 min-w-0 items-center gap-2 rounded-md border px-3 text-[12.5px]",
        dark ? "border-white/10 bg-white/[0.04] text-white/45" : "border-line bg-paper text-ink-500",
        className,
      )}
    >
      <Search aria-hidden className="size-4 shrink-0" />
      <span className="truncate">{placeholder}</span>
    </span>
  );
}

/** A select, drawn: its current value and the chevron. */
export function SelectField({ value, tone = "light", className }: { value: string; tone?: WindowTone; className?: string }) {
  const dark = isDark(tone);
  return (
    <span
      className={clsx(
        "flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-3 text-[12.5px] font-medium",
        dark ? "border-white/10 bg-white/[0.04] text-white/75" : "border-line bg-paper text-ink-800",
        className,
      )}
    >
      {value}
      <ChevronDown aria-hidden className={clsx("size-4", dark ? "text-white/40" : "text-ink-500")} />
    </span>
  );
}

/** A button, drawn - only for actions the product really has. */
export function DrawnButton({
  children,
  variant = "neutral",
  tone = "light",
  icon,
}: {
  children: ReactNode;
  variant?: "primary" | "neutral";
  tone?: WindowTone;
  icon?: ReactNode;
}) {
  const dark = isDark(tone);
  const look =
    variant === "primary"
      ? "bg-primary-600 text-white"
      : dark
        ? "border border-white/10 bg-white/[0.04] text-white/85"
        : "border border-line bg-paper text-ink-900 shadow-hairline";
  return (
    <span className={clsx("inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-[12.5px] font-medium [&>svg]:size-3.5", look)}>
      {icon}
      {children}
    </span>
  );
}

/** A filter chip. `active` is the one the product has applied. */
export function Chip({
  children,
  active = false,
  tone = "light",
  icon,
}: {
  children: ReactNode;
  active?: boolean;
  tone?: WindowTone;
  icon?: ReactNode;
}) {
  const dark = isDark(tone);
  return (
    <span
      className={clsx(
        "inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-[12px] font-medium whitespace-nowrap [&>svg]:size-3.5",
        active
          ? dark
            ? "border-primary-400/40 bg-primary-400/15 text-primary-200"
            : "border-primary-200 bg-primary-50 text-primary-700"
          : dark
            ? "border-white/10 text-white/65"
            : "border-line text-ink-700",
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** A count beside a label - tabular, quiet, never the mono face. */
export function Count({ children, tone = "light", active = false }: { children: ReactNode; tone?: WindowTone; active?: boolean }) {
  const dark = isDark(tone);
  return (
    <span
      className={clsx(
        "shrink-0 text-[12px] tabular-nums",
        active ? (dark ? "text-primary-200" : "font-medium text-primary-600") : dark ? "text-white/45" : "text-ink-500",
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------- THE RAIL */

export type RailItem = { label: string; count?: ReactNode; active?: boolean; muted?: boolean; icon?: ReactNode };

/** The side rail: a heading and a list of the product's own facets, one
    of them applied. Items may carry an icon. */
export function Rail({
  title,
  icon,
  items,
  tone = "light",
  className,
  children,
}: {
  title?: string;
  icon?: ReactNode;
  items?: RailItem[];
  tone?: WindowTone;
  className?: string;
  children?: ReactNode;
}) {
  const dark = isDark(tone);
  return (
    <aside className={clsx("shrink-0 border-r", dark ? "border-white/10 bg-white/[0.02]" : "border-line-soft bg-paper-soft/50", className)}>
      {title && (
        <RailTitle tone={tone} icon={icon}>
          {title}
        </RailTitle>
      )}
      {items && (
        <ul className="m-0 flex list-none flex-col gap-px p-1.5 pt-0">
          {items.map((item) => (
            <li
              key={item.label}
              className={clsx(
                "flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px]",
                item.active
                  ? dark
                    ? "bg-white/[0.08] font-medium text-white"
                    : "bg-paper font-medium text-ink-950 shadow-hairline"
                  : item.muted
                    ? dark
                      ? "text-white/40"
                      : "text-ink-500"
                    : dark
                      ? "text-white/70"
                      : "text-ink-700",
              )}
            >
              {item.icon && (
                <span
                  className={clsx(
                    "flex shrink-0 [&>svg]:size-4",
                    item.active ? (dark ? "text-primary-200" : "text-primary-600") : dark ? "text-white/35" : "text-ink-400",
                  )}
                >
                  {item.icon}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.count !== undefined && (
                <Count tone={tone} active={item.active}>
                  {item.count}
                </Count>
              )}
            </li>
          ))}
        </ul>
      )}
      {children}
    </aside>
  );
}

/** A rail's section heading, with an icon that says what the section
    holds. */
export function RailTitle({ children, icon, tone = "light" }: { children: ReactNode; icon?: ReactNode; tone?: WindowTone }) {
  const dark = isDark(tone);
  return (
    <p
      className={clsx(
        "m-0 flex items-center gap-1.5 px-3.5 pt-3.5 pb-2 text-[12px] font-semibold [&>svg]:size-3.5",
        dark ? "text-white/50" : "text-ink-500",
      )}
    >
      {icon}
      {children}
    </p>
  );
}

/* -------------------------------------------------------------- THE TABS */

export type TabItem = { label: string; icon?: ReactNode };

/** A tab strip: the product's sections, one open, each with its icon. */
export function TabStrip({ items, active, tone = "light" }: { items: readonly (string | TabItem)[]; active: string; tone?: WindowTone }) {
  const dark = isDark(tone);
  return (
    <div className={clsx("flex gap-0.5 overflow-hidden border-b px-2", dark ? "border-white/10" : "border-line-soft")}>
      {items.map((raw) => {
        const item = typeof raw === "string" ? { label: raw } : raw;
        const on = item.label === active;
        return (
          <span
            key={item.label}
            className={clsx(
              "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-[12.5px] whitespace-nowrap [&>svg]:size-4",
              on
                ? dark
                  ? "border-primary-300 font-medium text-white"
                  : "border-primary-600 font-medium text-ink-950"
                : dark
                  ? "border-transparent text-white/55"
                  : "border-transparent text-ink-500",
            )}
          >
            {item.icon}
            {item.label}
          </span>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------- THE TABLE */

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return <table className={clsx("w-full border-collapse text-left text-[13px]", className)}>{children}</table>;
}

export function Th({ children, tone = "light", className }: { children?: ReactNode; tone?: WindowTone; className?: string }) {
  return (
    <th
      className={clsx(
        "px-3.5 py-2.5 text-[12px] font-medium whitespace-nowrap",
        isDark(tone) ? "bg-white/[0.03] text-white/50" : "bg-paper-soft/60 text-ink-500",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Tr({
  children,
  tone = "light",
  selected = false,
  className,
}: {
  children: ReactNode;
  tone?: WindowTone;
  selected?: boolean;
  className?: string;
}) {
  const dark = isDark(tone);
  return (
    <tr
      className={clsx(
        "border-t",
        dark ? "border-white/10" : "border-line-soft",
        selected && (dark ? "bg-primary-400/10" : "bg-primary-50/60"),
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={clsx("px-3.5 py-2.5 align-middle", className)}>{children}</td>;
}

/* ------------------------------------------------------------- THE BADGE */

/** A product's enum id in sentence case: NOT_COMPARABLE -> "Not comparable",
    BLOCKER -> "Blocker". The id stays the product's own word; only the
    capitals go. */
export function codeLabel(id: string): string {
  const words = id.replace(/[_-]+/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export type BadgeTone = "neutral" | "primary" | "violet" | "sky" | "emerald" | "amber" | "rose" | "teal" | "ink";

const BADGE: Record<WindowTone, Record<BadgeTone, string>> = {
  light: {
    neutral: "bg-paper-soft text-ink-700",
    primary: "bg-primary-50 text-primary-700",
    violet: "bg-violet-50 text-violet-700",
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    teal: "bg-teal-50 text-teal-700",
    ink: "bg-ink-950 text-white",
  },
  dark: {
    neutral: "bg-white/10 text-white/75",
    primary: "bg-primary-400/20 text-primary-200",
    violet: "bg-violet-400/15 text-violet-300",
    sky: "bg-sky-400/15 text-sky-300",
    emerald: "bg-emerald-400/15 text-emerald-300",
    amber: "bg-amber-400/15 text-amber-300",
    rose: "bg-rose-400/15 text-rose-300",
    teal: "bg-teal-400/15 text-teal-300",
    ink: "bg-white text-ink-950",
  },
};

const DOT: Record<BadgeTone, string> = {
  neutral: "bg-ink-400",
  primary: "bg-primary-500",
  violet: "bg-violet-500",
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  teal: "bg-teal-500",
  ink: "bg-ink-950",
};

/** A status badge. Give it an `icon` that says what the status is; a
    bare `dot` is the fallback for a hue that only marks a category.
    `code` marks an enum id (pass it through `codeLabel` first) - an id
    is a word, not a number, so it never takes the mono face, and never
    capitals either. */
export function Badge({
  children,
  hue = "neutral",
  tone = "light",
  icon,
  dot = false,
  code = false,
  mono = false,
}: {
  children: ReactNode;
  hue?: BadgeTone;
  tone?: WindowTone;
  icon?: ReactNode;
  dot?: boolean;
  code?: boolean;
  /** Kept for callers written before `code`; renders the same. */
  mono?: boolean;
}) {
  const asCode = code || mono;
  return (
    <span
      className={clsx(
        "inline-flex h-6 items-center gap-1.5 rounded-md px-2 whitespace-nowrap [&>svg]:size-3.5",
        asCode ? "text-[12px] font-semibold" : "text-[12px] font-medium",
        BADGE[tone][hue],
      )}
    >
      {icon}
      {!icon && dot && <span aria-hidden className={clsx("size-1.5 rounded-full", DOT[hue])} />}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------- THE FORM */

/** A labelled input, drawn with its value already in it. `mono` is for
    a numeric value. */
export function Field({
  label,
  value,
  suffix,
  select = false,
  mono = false,
  className,
}: {
  label: string;
  value: string;
  suffix?: string;
  select?: boolean;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="m-0 text-[12px] font-medium text-ink-700">{label}</p>
      <span className="mt-1.5 flex h-9 items-center justify-between gap-2 rounded-md border border-line bg-paper px-3 text-[13px] text-ink-950">
        <span className={clsx("truncate", mono && "font-mono text-[12.5px] tabular-nums")}>{value}</span>
        {select ? <ChevronDown aria-hidden className="size-4 shrink-0 text-ink-500" /> : suffix ? <span className="shrink-0 text-[12px] text-ink-500">{suffix}</span> : null}
      </span>
    </div>
  );
}

/** A small heading over a form group. */
export function FormLabel({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <p className="m-0 flex items-center gap-1.5 text-[12px] font-semibold text-ink-600 [&>svg]:size-3.5">
      {icon}
      {children}
    </p>
  );
}

/** A segmented control with one segment selected. */
export function Segmented({ options, active, className }: { options: readonly string[]; active: string; className?: string }) {
  return (
    <div className={clsx("grid gap-1 rounded-md bg-paper-soft p-0.5", className)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((option) => (
        <span
          key={option}
          className={clsx(
            "flex h-8 items-center justify-center truncate rounded-[5px] px-2 text-[12.5px]",
            option === active ? "bg-paper font-medium text-ink-950 shadow-hairline" : "text-ink-600",
          )}
        >
          {option}
        </span>
      ))}
    </div>
  );
}

/** A toggle, drawn in the state the product ships it in. */
export function Toggle({ on, label, tone = "light" }: { on: boolean; label: string; tone?: WindowTone }) {
  const dark = isDark(tone);
  return (
    <span className="flex items-center justify-between gap-3 text-[13px]">
      <span className={clsx("truncate font-medium", dark ? "text-white/80" : "text-ink-800")}>{label}</span>
      <span
        aria-hidden
        className={clsx(
          "relative h-[18px] w-8 shrink-0 rounded-full transition-none",
          on ? "bg-primary-600" : dark ? "bg-white/15" : "bg-ink-200",
        )}
      >
        <span className={clsx("absolute top-0.5 size-3.5 rounded-full bg-white shadow-sm", on ? "left-4" : "left-0.5")} />
      </span>
    </span>
  );
}

/** A checkbox row, drawn in its state. */
export function CheckRow({ on, tone = "light", children, count }: { on: boolean; tone?: WindowTone; children: ReactNode; count?: ReactNode }) {
  const dark = isDark(tone);
  return (
    <span className={clsx("flex items-center gap-2.5 py-1.5 text-[13px]", dark ? "text-white/80" : "text-ink-800")}>
      <span
        aria-hidden
        className={clsx(
          "grid size-4 shrink-0 place-items-center rounded-[4px]",
          on ? "bg-primary-600 text-white" : dark ? "border border-white/25" : "border border-line-strong bg-paper",
        )}
      >
        {on && <Check aria-hidden className="size-3" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {count !== undefined && <Count tone={tone}>{count}</Count>}
    </span>
  );
}

/* --------------------------------------------------------- THE INSPECTOR */

/** Label-beside-value rows, the way a detail pane states a record. */
export function KeyValues({
  rows,
  tone = "light",
  wide = false,
  className,
}: {
  rows: readonly [string, ReactNode][];
  tone?: WindowTone;
  /** A wider label column, for labels that are phrases rather than words. */
  wide?: boolean;
  className?: string;
}) {
  const dark = isDark(tone);
  return (
    <dl className={clsx("m-0 flex flex-col", className)}>
      {rows.map(([label, value]) => (
        <div
          key={label}
          className={clsx(
            "grid gap-3 border-t py-2.5",
            wide ? "grid-cols-[9.5rem_minmax(0,1fr)]" : "grid-cols-[5.5rem_minmax(0,1fr)]",
            dark ? "border-white/10" : "border-line-soft",
          )}
        >
          <dt className={clsx("text-[12px] leading-snug font-medium", dark ? "text-white/50" : "text-ink-500")}>{label}</dt>
          <dd className={clsx("m-0 text-[13px] leading-snug", dark ? "text-white/90" : "text-ink-900")}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ----------------------------------------------------------- THE STEPPER */

export type StepState = "done" | "active" | "todo";

/** A vertical pipeline: what ran, what is running, what is next. Each
    stage carries its own icon in a tile; the state colours the tile and
    a check marks the stages that are through. */
export function Stepper({ steps }: { steps: readonly { label: string; state: StepState; icon?: ReactNode }[] }) {
  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={step.label} className="relative flex items-center gap-2.5 pb-3 last:pb-0">
            {!last && <span aria-hidden className="absolute top-7 left-[13px] h-[calc(100%-1.25rem)] w-px bg-line-strong" />}
            <span
              aria-hidden
              className={clsx(
                "relative grid size-7 shrink-0 place-items-center rounded-md [&>svg]:size-4",
                step.state === "done"
                  ? "bg-primary-600 text-white"
                  : step.state === "active"
                    ? "bg-primary-50 text-primary-700 ring-1 ring-primary-300 ring-inset"
                    : "bg-paper-soft text-ink-400 ring-1 ring-line ring-inset",
              )}
            >
              {step.icon ?? <span className={clsx("size-2 rounded-full", step.state === "todo" ? "bg-ink-300" : "bg-current")} />}
            </span>
            <span
              className={clsx(
                "min-w-0 flex-1 truncate text-[13px]",
                step.state === "active" ? "font-semibold text-ink-950" : step.state === "done" ? "text-ink-800" : "text-ink-500",
              )}
            >
              {step.label}
            </span>
            {step.state === "done" && <Check aria-hidden className="size-3.5 shrink-0 text-primary-600" strokeWidth={2.5} />}
          </li>
        );
      })}
    </ol>
  );
}
