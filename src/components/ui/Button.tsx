import { Children, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { clsx } from "@/lib/clsx";
import { PixelFill } from "./PixelFill";

export type ButtonVariant =
  | "primary"
  | "ink"
  | "danger"
  | "outline"
  | "outlineInverted"
  | "ghost"
  | "inverted";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * One button. Seven variants, three sizes — the API is unchanged; the geometry
 * and the interaction are the reference's.
 *
 * THE SHAPE. Square (`rounded-none`), 56px tall at `md` and `lg`, label in
 * 16px Medium. Nothing here is rounded, raised, glowing or scaled: the button
 * is a block sitting on the page, and its edges are meant to line up with the
 * things around it. `sm` survives at 40px as the compact tier for table rows
 * and toolbars, where a 56px control would set the row height of a whole data
 * table.
 *
 * THE MOTION. One interaction, shared by every variant: on hover the fill
 * renders in as a field of 3px pixels, each lighting up on its own delay so the
 * colour arrives as a dissolve radiating from the centre, and the label flips
 * colour under it. `:focus-visible` triggers exactly the same fill, so keyboard
 * users get the acknowledgement pointer users do. That is the whole animation
 * budget.
 *
 * The dissolve is a `<canvas>` — `PixelFill`, rendered as the control's first
 * child. It was a CSS mask twice and was rejected twice for the same structural
 * reason: a mask reveals a continuous shape, so however finely it is dithered
 * what the eye reads is a rectangle or a disc growing. Only addressing every
 * pixel separately gets a dissolve. See `PixelFill.tsx` for the mechanics and
 * § THE BUTTON PLATE in globals.css for the plate, the ring, the delayed label
 * flip and the no-canvas / reduced-motion tier; the variants below only set
 * `--btn-fill` / `--btn-fill-ink` / `--btn-ring`.
 *
 * TWO COMPONENTS, ONE INTERACTION. `Button` is the `<button>`; `ButtonLink` is
 * the `<Link>`. They exist as a pair because the canvas is a CHILD, and roughly
 * forty call sites used to be `<Link className={buttonStyles(…)}>` — a class
 * string can carry a plate but it cannot carry a child. `buttonStyles()` is
 * still exported for the few controls that are neither a button nor an internal
 * link (an `<a>` to an external URL, a `<label>` wrapping a file input, a
 * `<span aria-disabled>`); those keep the plain colour swap, which is the same
 * fallback reduced-motion visitors get.
 *
 * NO VARIANT CARRIES A BORDER. The ring is an inset shadow, which sits outside
 * layout — so a ringed variant and a plain one agree on height, padding and
 * alignment by construction rather than by both happening to be ringed.
 *
 * VARIANT MAPPING (this codebase's seven onto the reference's two):
 *
 *   primary          the brand plate dissolving to neutral-900 — the reference's
 *                    light-ground `primary`, verbatim. Label white throughout;
 *                    only the ground beneath it moves. It dissolves to a
 *                    NEUTRAL rather than to another blue, because a
 *                    blue-to-blue fill has nothing to travel across and the
 *                    whole point is that you can see the front move.
 *   ink              the neutral-900 plate, dissolving to brand blue. The
 *                    inverse pairing of `primary`, for a second solid CTA in
 *                    the same block.
 *   outline          the ringed ghost on a white plate — the deferring action
 *                    beside a solid one, and this codebase's workhorse
 *                    secondary (~80 call sites, mostly toolbars and table
 *                    rows). Label at full ink rather than the reference's
 *                    `ink-muted`: a bordered white control reads as a control,
 *                    and muting its label as well would demote it twice.
 *   ghost            the same ringed ghost with the ring and the plate taken
 *                    off — the quietest action. Same brand fill, so the two
 *                    deferring variants answer the pointer identically.
 *   inverted         the dark-ground solid: white plate, ink label, fills brand
 *                    blue. This is the reference's `primary` as it resolves
 *                    under `[data-tone="dark"]`.
 *   outlineInverted  the dark-ground ghost: white/20 ring, white/70 label,
 *                    fills WHITE with the label flipping to ink. The
 *                    reference's `ghost` under `[data-tone="dark"]`.
 *   danger           kept. The reference RETIRED danger with its two-variant
 *                    consolidation, on the grounds that a destructive action no
 *                    longer needs its own colour — but this codebase has real
 *                    destructive confirmations (ConfirmDialog) and stripping
 *                    the one signal that separates "delete" from "save" is a
 *                    functional regression, not a simplification. It carries
 *                    `btn-keep-tone` so a dark panel cannot silently turn it
 *                    into a white button.
 *
 * The last two reproduce the reference's `[data-tone="dark"]` mechanism through
 * a self-matching `.btn-tone-dark` class rather than an inherited attribute,
 * because here the dark-ground variant is chosen at the call site and a call
 * site passes props, not section context. Both selectors drive the same custom
 * properties — see § THE BUTTON PLATE. A button placed inside a section that
 * *does* carry `data-tone="dark"` still flips on its own, exactly as in the
 * reference.
 */

/* THE BUTTON IS THE SYSTEM'S ONE DELIBERATELY SQUARE COMPONENT, and it opts out
   of the radius scale rather than inheriting from it — `rounded-none` here, and
   `focus-visible:rounded-none` so the focus ring traces the same box. The
   reference draws it this way for a reason that is about layout, not taste: a
   square button's edges land on the editorial grid's rules, and a pair of them
   set flush reads as one segmented bar with the middle rule running through the
   seam. Cards, chips, pills, avatars and every other surface follow the scale
   (§ Radii in globals.css); this is the exception, stated at the call site so a
   later change to the tokens cannot quietly round it. */
const base =
  "btn-fill relative inline-flex items-center justify-center gap-2 rounded-none font-medium " +
  "tracking-[-0.01em] whitespace-nowrap select-none " +
  "transition-[background-color,color] duration-[var(--duration-base)] ease-[var(--ease-in-out-quad)] " +
  "focus-visible:rounded-none " +
  "disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary " +
    "[--btn-fill:var(--color-neutral-900)] [--btn-fill-ink:var(--color-on-primary)] " +
    "active:[--btn-fill:var(--color-neutral-1000)]",
  ink:
    "bg-neutral-900 text-on-primary " +
    "[--btn-fill:var(--color-primary)] [--btn-fill-ink:var(--color-on-primary)] " +
    "active:[--btn-fill:var(--color-primary-active)]",
  // The one place red is used as a fill. Reserved for the confirm button of a
  // destructive action — never for a "Save" that merely happens to be final.
  danger:
    "btn-keep-tone bg-red-600 text-white " +
    "[--btn-fill:var(--color-ink-950)] [--btn-fill-ink:#ffffff] " +
    "active:[--btn-fill:#000000]",
  /* `btn-ghost` is the hook the dark-ground override in globals.css keys on. */
  outline:
    "btn-ghost bg-surface text-ink " +
    "[--btn-ring:var(--color-line-strong)] " +
    "[--btn-fill:var(--color-primary)] [--btn-fill-ink:var(--color-on-primary)] " +
    "active:[--btn-fill:var(--color-primary-active)]",
  ghost:
    "btn-ghost bg-transparent text-ink-muted " +
    "[--btn-fill:var(--color-primary)] [--btn-fill-ink:var(--color-on-primary)] " +
    "active:[--btn-fill:var(--color-primary-active)]",
  /* The dark-ground pair. Their colours are set entirely by the
     `.btn-tone-dark` block in globals.css, so the resting values are not
     restated here — one definition, one place to retune. */
  inverted: "btn-tone-dark",
  outlineInverted: "btn-ghost btn-tone-dark",
};

/**
 * `md` and `lg` are one height, because the reference geometry is one height:
 * a 56px block. They stay distinct names so the ~90 call sites that pick one or
 * the other keep compiling, and so the two can diverge again later without a
 * sweep.
 */
const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-[0.875rem]",
  md: "h-14 px-6 text-[1rem] leading-5",
  lg: "h-14 px-6 text-[1rem] leading-5",
};

/**
 * The 40px exception, ported from the reference: an icon-only control takes a
 * quiet tint rather than the fill, because 40px of dissolve is a twitch, not a
 * field. It REPLACES the variant — the variant maps carry plates and rings that
 * a bare glyph has no room for — exactly as the reference does. `btn-quiet` is
 * a plain class (see § THE BUTTON PLATE) so a `buttonStyles()` call site can opt
 * in by hand; `Button` below applies it on its own when the control has an
 * accessible name but no visible text, and skips the canvas with it — a
 * 40 × 40 square is ~180 cells, and a dissolve that short does not read as one.
 */
const quiet = "btn-quiet text-ink-muted";

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return clsx(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

/**
 * True when the control has an accessible name of its own and renders no
 * visible text — i.e. it is an icon-only control. Both halves are required:
 * `<Button><span>Enregistrer</span></Button>` has no direct text child either,
 * and must not be mistaken for one.
 */
function isIconOnly(children: ReactNode, ariaLabel: unknown) {
  if (typeof ariaLabel !== "string" || ariaLabel.length === 0) return false;
  return !Children.toArray(children).some(
    (child) => typeof child === "string" || typeof child === "number",
  );
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const iconOnly = isIconOnly(children, props["aria-label"]);

  return (
    <button
      type={type}
      className={
        iconOnly
          ? clsx(base, quiet, sizes[size ?? "md"], className)
          : buttonStyles({ variant, size, className })
      }
      {...props}
    >
      {/* First child, behind the label on a negative z-index, and never wrapping
          `children` — several call sites pass a `w-full` inner row that has to
          stay a direct flex item of the control. Nothing is rendered for the
          quiet tier, or under reduced motion; both fall back to the plain
          colour swap in globals.css. `disabled` and `aria-disabled` are
          `pointer-events-none` in `base`, and the canvas checks them too. */}
      {iconOnly ? null : <PixelFill />}
      {children}
    </button>
  );
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "children"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

/**
 * The same control as a link. Identical geometry, identical fill, identical
 * props — it is `<Link>` rather than `<button>` and that is the whole
 * difference.
 *
 * IT EXISTS BECAUSE THE FILL IS A CHILD. Every navigating CTA in the product
 * used to be `<Link className={buttonStyles({...})}>`, which was enough while
 * the dissolve was a `::after` on the class. A canvas cannot be handed over in a
 * class string, so the call sites move to a component. There is no `asChild`
 * escape hatch and no `render` prop: the two shapes a button takes here are a
 * button and an internal link, and naming both is shorter than a polymorphic
 * component that has to be told which it is.
 *
 * `href` and every other prop are `Link`'s — including `prefetch`, `replace`,
 * `scroll` and the locale-aware `href` object form.
 */
export function ButtonLink({
  variant,
  size,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonStyles({ variant, size, className })} {...props}>
      <PixelFill />
      {children}
    </Link>
  );
}

/** Small trailing arrow used on primary marketing CTAs. */
export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={clsx("h-3.5 w-3.5 shrink-0", className)}
    >
      <path
        d="M2.5 8h10m0 0L8.75 4.25M12.5 8l-3.75 3.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
