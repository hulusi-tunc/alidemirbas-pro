"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { clsx } from "@/lib/clsx";

/** Small isolated client island - the only interactive piece the
    Installation Stepper needs. Everything else in the stepper renders on
    the server; this is a one-off "use client" boundary, not a reason to
    push the whole stepper to the client. */
export function CopyButton({ value, label = "Copy", copiedLabel = "Copied" }: { value: string; label?: string; copiedLabel?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API can be unavailable (insecure context, permissions) -
      // fail silently rather than throw; the text is still selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={clsx(
        "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
        copied ? "text-emerald-600" : "text-neutral-500 hover:text-ink-900",
      )}
    >
      {copied ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
      {copied ? copiedLabel : label}
    </button>
  );
}
