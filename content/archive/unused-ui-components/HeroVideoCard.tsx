"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";

/** The hero's primary visual: a real poster frame with a big play button,
    swapping in-place for the actual clip on click - no modal, no layout
    shift, the video simply takes over the same 16:9 card. Muted + controls
    so playback is reliable and a viewer can unmute themselves. */
export function HeroVideoCard({
  poster,
  posterAlt,
  video,
}: {
  poster: string;
  posterAlt: string;
  video: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="overflow-hidden rounded-card border border-line shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(10_16_32/0.04),0_8px_24px_-12px_rgb(10_16_32/0.12)]">
      <div className="relative aspect-video w-full bg-ink-950">
        {playing ? (
          <video src={video} className="size-full object-cover" autoPlay muted controls playsInline />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative block size-full"
            aria-label="Play demo video"
          >
            <Image src={poster} alt={posterAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            <span className="absolute inset-0 bg-ink-950/15 transition-colors group-hover:bg-ink-950/25" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="grid size-16 place-items-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-105">
                <Play aria-hidden className="ml-1 size-6 fill-ink-950 text-ink-950" />
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
