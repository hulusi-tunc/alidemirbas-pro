"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { LabProjectIcon, labAccent } from "@/components/ui/LabProjectIdentity";
import { clsx } from "@/lib/clsx";

type NavItem = { label: string; href: string };
type LabProject = { name: string; href: string; slug?: string };

/* Below md, SiteHeader's own <nav> and CTA are both display:none with no
   replacement - this is that replacement.

   IT IS A LIGHT PANEL NOW, not the dark ink-950 overlay it used to be.
   The overlay was built when the site still had dark bands; against the
   soft light language everything else now speaks, opening the menu meant
   crossing a tone boundary the rest of the site never asks for. It also
   carried a hairline under every one of six rows - the stroke-heavy habit
   the site has left. Rows are soft filled cards instead, which also makes
   each one an obvious 56px target rather than text with a rule under it.

   PARITY WITH THE DESKTOP NAV: the desktop bar has a Lab dropdown listing
   the real Lab projects, and the mobile menu used to flatten that to a
   single "Lab" link - content that simply vanished on a phone. The
   projects render here as a nested list under Lab.

   The current page is marked (`aria-current`) and tinted, because a menu
   that cannot say where you are makes you open it twice.

   TYPE AND CONTROLS ARE THE SYSTEM'S (2026-09-06). Rows were `text-[17px]`
   and project rows `text-[15px]` - two sizes the type ramp does not have -
   and the CTA / language pair at the bottom were hand-rolled pills that
   never went through Button.tsx, so they kept a `rounded-full` corner and a
   plain colour swap after the real button moved to the squared 8px corner
   and the pixel-fill hover. Rows now sit on `text-base` (the button's own
   16px label tier) with `py-4` so the row is still the 56px target the note
   above promises - the same 56px the `md` button is - project rows on
   `text-label` (the ramp's 14px Medium UI-label tier, see globals.css),
   colours on the semantic `ink` / `ink-muted` / `ink-brand`
   names, and the two controls are `ButtonLink` (`ink` beside `outline`, the
   component's documented solid-plus-deferring pair). */
export function MobileNav({
  items, langHref, langLabel, ctaHref, ctaLabel, labHref, labProjects = [],
}: {
  items: NavItem[];
  langHref: string;
  langLabel: string;
  ctaHref: string;
  ctaLabel: string;
  /** Which nav item owns the project sub-list. */
  labHref?: string;
  labProjects?: LabProject[];
}) {
  const [open, setOpen] = useState(false);
  /* The panel is PORTALLED to <body>. SiteHeader carries
     `backdrop-blur-sm`, and an ancestor with a backdrop-filter becomes the
     containing block for its `fixed` descendants - so a panel rendered in
     place resolved `top-16 bottom-0` against the 64px header and collapsed
     to its own padding. Nothing about the classes was wrong; the panel was
     simply measuring the wrong box. `mounted` keeps this off the server
     render, where there is no document to portal into. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    /* Focus moves into the panel so a keyboard or screen-reader user is
       actually taken to the menu they just opened, and returns to the
       trigger on close rather than being dropped at the top of the page. */
    const first = panelRef.current?.querySelector<HTMLElement>("a, button");
    first?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      triggerRef.current?.focus();
    };
  }, [open]);

  // A tap that navigates to the page you are already on fires no route
  // change, so close on every activation rather than on pathname change.
  const close = () => setOpen(false);

  const isCurrent = (href: string) => {
    const path = href.split("#")[0].replace(/\/$/, "");
    if (!path) return false;
    const here = pathname?.replace(/\/$/, "") ?? "";
    return here === path;
  };

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 -mr-2 grid size-10 place-items-center text-ink"
      >
        {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
      </button>

      {open && mounted ? createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          /* `top-16` rather than `inset-0` with padding: the panel starts
             below the 64px header instead of hiding behind it, so the
             wordmark and the close control stay visible and the menu never
             covers the thing that opened it. */
          className="nav-panel-in fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col overflow-y-auto bg-paper px-5 pt-4 pb-6"
        >
          <nav className="flex flex-col gap-1.5">
            {items.map((item) => {
              const current = isCurrent(item.href);
              const showProjects = labHref && item.href === labHref && labProjects.length > 0;
              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={current ? "page" : undefined}
                    className={`flex items-center rounded-xl px-4 py-4 text-base font-medium transition-colors duration-[var(--duration-fast)] ${
                      current ? "bg-surface-brand-subtle text-ink-brand" : "text-ink hover:bg-paper-soft"
                    }`}
                  >
                    {item.label}
                  </Link>
                  {showProjects && (
                    <ul className="mt-1 mb-1 flex list-none flex-col gap-0.5 pl-4">
                      {labProjects.map((p) => (
                        <li key={p.href}>
                          <Link
                            href={p.href}
                            onClick={close}
                            aria-current={isCurrent(p.href) ? "page" : undefined}
                            className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-label transition-colors duration-[var(--duration-fast)] ${
                              isCurrent(p.href) ? "text-ink-brand" : "text-ink-muted hover:text-ink"
                            }`}
                          >
                            {/* The project's own glyph on its tint - the same
                                mark the desktop dropdown and /lab carry. */}
                            {p.slug && (
                              <span className={clsx("grid size-6 shrink-0 place-items-center rounded-md", labAccent(p.slug).tile)}>
                                <LabProjectIcon slug={p.slug} className="size-3.5" />
                              </span>
                            )}
                            {p.name}
                            {p.href.startsWith("http") && (
                              <ArrowUpRight aria-hidden className="size-3.5 shrink-0" />
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Pushed to the bottom of the panel, so the CTA sits in thumb
              reach rather than under six menu rows. */}
          <div className="mt-auto flex items-center gap-3 pt-8">
            <ButtonLink href={ctaHref} onClick={close} variant="ink" size="md" className="flex-1">
              {ctaLabel}
            </ButtonLink>
            <ButtonLink href={langHref} onClick={close} variant="outline" size="md">
              {langLabel}
            </ButtonLink>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
