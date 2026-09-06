"use client";

import { useEffect, useRef, useState } from "react";
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
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  // Small delay before closing on mouse-leave so moving the cursor from
  // the trigger down into the panel doesn't close it mid-travel.
  const closeSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div ref={ref} className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <div className="flex items-center gap-1">
        <Link href={href} className="transition-colors hover:text-ink-950">
          {label}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-label={label}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center p-0.5 transition-colors hover:text-ink-950"
        >
          <ChevronDown aria-hidden className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div
          role="menu"
          className="absolute top-full left-1/2 z-50 mt-3 w-[40rem] -translate-x-1/2 rounded-card border border-line-soft bg-paper p-2 shadow-[var(--shadow-card-hover)]"
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
                    <span className="block text-sm font-medium text-ink-950">{p.name}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-ink-500">{p.tagline}</span>
                  </span>
                </>
              );
              const className = "flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-paper-soft";
              return external ? (
                <a key={p.slug} href={p.href} target="_blank" rel="noreferrer" role="menuitem" onClick={() => setOpen(false)} className={className}>
                  {body}
                </a>
              ) : (
                <Link key={p.slug} href={p.href} role="menuitem" onClick={() => setOpen(false)} className={className}>
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
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:bg-paper-soft hover:text-ink-950"
            >
              {viewAllLabel}
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
