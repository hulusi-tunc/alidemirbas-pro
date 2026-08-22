"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

/* The modal shell around an intercepted journey route.

   It is a real route underneath: the URL is the journey's own, refreshing
   gives the full page, and closing is a history step back rather than a piece
   of component state. Everything here is the part the browser does not give
   you for free - the page behind must not scroll, must not be tabbable, and
   focus has to come back to the row that opened it. */

const FOCUSABLE =
  'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

export default function JourneyModal({
  children,
  closeLabel,
}: {
  children: React.ReactNode;
  closeLabel: string;
}) {
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => router.back(), [router]);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const body = document.body;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;

    body.style.overflow = "hidden";
    // Compensating for the scrollbar keeps the page behind from shifting
    // sideways the moment it stops scrolling.
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    /* Everything the modal is not gets `inert`: no tab stops, no clicks, and
       no screen-reader announcements from the list underneath. */
    const inerted = Array.from(document.querySelectorAll<HTMLElement>("[data-lab-root]"));
    for (const el of inerted) el.inert = true;

    closeButton.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;

      const stops = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (stops.length === 0) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !panel.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      for (const el of inerted) el.inert = false;
      opener?.focus?.();
    };
  }, [close]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="journey-modal-title">
      <button
        type="button"
        aria-label={closeLabel}
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 bg-ink-950/30"
      />
      <div
        ref={panel}
        className="absolute inset-4 mx-auto flex max-w-2xl flex-col border border-line bg-paper shadow-2xl md:inset-y-10"
      >
        <button
          ref={closeButton}
          type="button"
          onClick={close}
          className="absolute top-4 right-4 z-10 grid size-8 shrink-0 place-items-center border border-line bg-paper text-neutral-500 transition-colors hover:border-neutral-400 hover:text-ink-900"
        >
          <X aria-hidden className="size-4" />
          <span className="sr-only">{closeLabel}</span>
        </button>
        {children}
      </div>
    </div>
  );
}
