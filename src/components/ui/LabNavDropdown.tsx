"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

import { LabProjectIcon, labAccent } from "@/components/ui/LabProjectIdentity";
import { clsx } from "@/lib/clsx";

export type LabNavProject = { slug: string; name: string; tagline: string; href: string };

/* Apollo.io-style nav dropdown, scoped to "Lab" only - the one nav item
   with real, already-existing sub-content (the 6 real projects also
   listed in SiteFooter's "Lab projects" column and on /lab itself).
   Every other nav item (About/Calculators/Blog/Stack/Contact) is a
   single real page with nothing underneath it, so none of them get a
   dropdown - inventing sub-items for them would be exactly the kind of
   fake mega-menu category this round's own brief warned against.

   REDRAWN 2026-09-05 (Hulusi: "looks so messy, no message delivery there,
   put some icon for each specific lab project"). It was six stacked rows
   of name plus a two-line description in a narrow column - 18 lines of
   prose the eye had to read to find anything. Now: two columns of six
   entries, each led by the project's own glyph on its own tint
   (LabProjectIdentity.tsx - the same mark the /lab hero tabs and
   sections carry, so the menu doubles as the legend), the name, and a
   one-line tagline instead of the description. Three real nodes per
   entry, scannable in one glance; the description still lives on /lab.

   HOW IT HANGS (2026-09-06, Hulusi: "overlay touches the nav bar, add
   some lil gap" and "need appear animation in overlay"). The trigger's
   wrapper is the full bar height (`h-16` - the one height SiteHeader's
   bar and MobileNav's `top-16` already agree on), so its bottom edge IS
   the header's bottom edge, and that is where the panel is hung from.
   Before, the panel hung `mt-3` under the 20px trigger text, which landed
   exactly on the header's border and read as the panel being glued to
   the bar. The 8px gap is `pt-2` on the positioning wrapper rather than a
   margin on the panel, so the gap is part of the hover region and
   crossing it never fires a mouseleave. The panel carries `nav-panel-in`
   - the same rise-and-fade the phone menu uses, timed on
   `--duration-base` (globals.css) - on the INNER element, so its
   transform cannot fight the wrapper's centring translate. Type is the
   ramp's `text-label` tier for names and the caption alias for taglines;
   see SiteHeader's NAV_LINK note.

   THE PANEL IS PORTALLED TO <body>, like MobileNav's, and for a sibling
   reason. Rendered in place - a descendant of the sticky, backdrop-blurred
   header - the panel's opacity fade put it on its own compositor layer,
   and Chrome then painted the page's hero THROUGH it: computed opacity 1,
   hit-testing correct, pixels wrong. Fourteen variants were rendered to
   pin it (animation off, transform-only, opacity-only, fill-mode none,
   header not sticky, blur off, opaque header, header z-index, forced
   layers on header/nav/panel/hero, isolation, paint containment): only
   removing the opacity animation or moving the panel out of the header
   fixed it, and the phone menu - same animation, already portalled - was
   never affected. So the panel measures the trigger on open and hangs
   `fixed` at that x and at the header's bottom; the position is taken
   once per open and a resize closes the menu rather than chasing it.
   Outside-click has to consult both the trigger and the panel, because
   the two are no longer one DOM subtree.

   Data comes in pre-resolved from SiteHeader (a server component -
   `withJourneyCount()` is server-only, so the Journey Library's real
   {count} token is already filled in by the time it reaches this client
   component). The glyphs are looked up here by slug, because a component
   cannot cross the server/client boundary as a prop but a string can.

   Kept as its own small client component, same reasoning as MobileNav
   - SiteHeader itself stays a server component, importing content.ts
   directly with no client-only state of its own. */
export function LabNavDropdown({
  label, href, viewAllLabel, projects,
}: {
  label: string;
  href: string;
  viewAllLabel: string;
  projects: LabNavProject[];
}) {
  const [open, setOpen] = useState(false);
  /* Where the panel hangs, in viewport coordinates: x at the trigger's
     centre, y at the header's bottom edge. Measured on open, never on the
     server - the panel only exists after a pointer or a key has asked for
     it, so there is no hydration frame to keep it off. */
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || panelRef.current?.contains(t)) return;
      close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const openNow = () => {
    cancelClose();
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom, left: r.left + r.width / 2 });
    setOpen(true);
  };
  // Small delay before closing on mouse-leave so moving the cursor from
  // the trigger down into the panel doesn't close it mid-travel.
  const closeSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  const itemClass =
    "flex items-start gap-3 rounded-lg p-3 transition-colors duration-[var(--duration-fast)] hover:bg-paper-soft";

  return (
    <div ref={ref} className="flex h-16 items-center" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <div className="flex items-center gap-1">
        {/* Colour and size come from SiteHeader's <nav> (its NAV_LINK), so the
            trigger reads exactly like its sibling links; only the hover is
            restated here because it has to sit on the element itself. */}
        <Link href={href} className="transition-colors duration-[var(--duration-fast)] hover:text-ink">
          {label}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-label={label}
          onClick={() => (open ? setOpen(false) : openNow())}
          className="flex items-center p-0.5 transition-colors duration-[var(--duration-fast)] hover:text-ink"
        >
          <ChevronDown aria-hidden className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && pos && createPortal(
        <div
          ref={panelRef}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-50 -translate-x-1/2 pt-2"
          onMouseEnter={cancelClose}
          onMouseLeave={closeSoon}
        >
          <div
            role="menu"
            className="nav-panel-in w-[40rem] rounded-card border border-line-soft bg-paper p-2 shadow-[var(--shadow-card-hover)]"
          >
            <div className="grid grid-cols-2 gap-1">
              {projects.map((p) => {
                const accent = labAccent(p.slug);
                const external = p.href.startsWith("http");
                const body = (
                  <>
                    <span className={clsx("mt-0.5 grid size-9 shrink-0 place-items-center rounded-md", accent.tile)}>
                      <LabProjectIcon slug={p.slug} className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-label text-ink">{p.name}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-ink-subtle">{p.tagline}</span>
                    </span>
                  </>
                );
                return external ? (
                  <a key={p.slug} href={p.href} target="_blank" rel="noreferrer" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
                    {body}
                  </a>
                ) : (
                  <Link key={p.slug} href={p.href} role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
                    {body}
                  </Link>
                );
              })}
            </div>
            <div className="mt-1 border-t border-line-soft pt-1">
              <Link
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-label text-ink transition-colors duration-[var(--duration-fast)] hover:bg-paper-soft"
              >
                {viewAllLabel}
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
