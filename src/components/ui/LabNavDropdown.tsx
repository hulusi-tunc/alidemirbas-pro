"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export type LabNavProject = { name: string; desc: string; href: string };

/* Apollo.io-style nav dropdown, scoped to "Lab" only - the one nav item
   with real, already-existing sub-content (the 6 real projects also
   listed in SiteFooter's "Lab projects" column and on /lab itself).
   Every other nav item (About/Calculators/Blog/Stack/Contact) is a
   single real page with nothing underneath it, so none of them get a
   dropdown - inventing sub-items for them would be exactly the kind of
   fake mega-menu category this round's own brief warned against.

   Data comes in pre-resolved from SiteHeader (a server component -
   `withJourneyCount()` is server-only, so the Canonical Journey
   Library's real {count} token is already filled in by the time it
   reaches this client component).

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
          className="absolute top-full left-1/2 z-50 mt-3 w-80 -translate-x-1/2 rounded-card border border-line-soft bg-paper p-2 shadow-[var(--shadow-card-hover)]"
        >
          {projects.map((p) => {
            const external = p.href.startsWith("http");
            return (
              <a
                key={p.name}
                href={p.href}
                {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block rounded-[10px] px-3 py-2.5 transition-colors hover:bg-paper-soft"
              >
                <span className="block text-sm font-medium text-ink-950">{p.name}</span>
                <span className="mt-0.5 block text-xs leading-snug text-ink-950/65">{p.desc}</span>
              </a>
            );
          })}
          <Link
            href={href}
            onClick={() => setOpen(false)}
            className="mt-1 block border-t border-line-soft px-3 pt-2.5 pb-1 text-sm font-medium text-ink-900 transition-colors hover:text-ink-600"
          >
            {viewAllLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
