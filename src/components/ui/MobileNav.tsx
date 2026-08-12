"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type NavItem = { label: string; href: string };

/* Below md, SiteHeader's own <nav> and CTA are both display:none with no
   replacement - this is that replacement. A full-screen overlay rather than
   a dropdown, on the same ink-950 ground as the header itself. */
export function MobileNav({
  items, langHref, langLabel, ctaHref, ctaLabel,
}: { items: NavItem[]; langHref: string; langLabel: string; ctaHref: string; ctaLabel: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 grid size-10 -mr-2 place-items-center text-white"
      >
        {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40 flex flex-col bg-ink-950 pt-[4.5rem]"
        >
          <nav className="flex flex-1 flex-col overflow-y-auto px-6">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-5 text-lg font-medium text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-between border-t border-white/10 px-6 py-5">
            <Link href={langHref} onClick={() => setOpen(false)} className="text-sm text-white/70">
              {langLabel}
            </Link>
            <a
              href={ctaHref}
              className="inline-flex h-10 items-center bg-white px-4 text-sm font-medium text-ink-900"
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
