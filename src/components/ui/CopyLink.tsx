"use client";

import { Check, Link2 } from "lucide-react";
import { useEffect, useState } from "react";

/* Copies a post's permalink. The confirmation resets itself after two seconds,
   and the timer is cleared on unmount so a quick navigation away can't set
   state on a gone component. */

export function CopyLink({ href, label, done }: { href: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(href);
          setCopied(true);
        } catch {
          /* clipboard blocked (insecure context, denied permission) — the link
             is still on screen for the reader to copy by hand. */
        }
      }}
      className="inline-flex items-center gap-2 text-sm text-ink-500 transition-colors hover:text-ink-900"
    >
      {copied ? <Check className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
      {copied ? done : label}
    </button>
  );
}
