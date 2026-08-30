"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";

/** A small "Watch demo" trigger, overlaid on a hero visual. Opens the demo
    clip in a centered modal (muted, autoplay, native controls so a viewer
    can unmute) rather than inline - the hero visual it sits on keeps its
    own layout untouched either way, so nothing shifts when the video
    opens or closes. */
export function HeroDemoVideo({ src, label }: { src: string; label: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group absolute bottom-4 left-4 z-10 inline-flex items-center gap-2 rounded-full bg-ink-950/90 py-2 pr-4 pl-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-ink-950"
      >
        <span className="grid size-6 place-items-center rounded-full bg-white text-ink-950">
          <Play aria-hidden className="ml-0.5 size-3 fill-current" />
        </span>
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-6"
          onClick={() => setOpen(false)}
        >
          <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white/70 transition-colors hover:text-white"
            >
              <X aria-hidden className="size-6" />
            </button>
            <div className="overflow-hidden rounded-card bg-black">
              <video
                src={src}
                className="aspect-video w-full"
                autoPlay
                muted
                controls
                playsInline
                loop
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
