import Image from "next/image";
import type { ReactNode } from "react";

import { CtaBurst } from "@/components/ui/CtaBurst";
import { Reveal } from "@/components/ui/Reveal";

/* THE CLOSING BAND - every page ends on this (Hulusi, 2026-09-07: "just
   Ali's photo, a solid colour is better, no UI elements, some nice effect
   or feeling, crop Ali's background, and make this CTA global"). A
   full-width brand-blue band, not a framed plate: the words and the two
   actions on the left; on the right Ali himself, cut out of the studio
   photograph (public/portrait-cutout.png, made with the system's
   foreground mask), standing on the band's bottom edge with a soft
   lighter bloom behind him. The band answers your arrival with the pixel
   sweep the blue plate always had - dark grain on brand blue, the primary
   button's own dissolve. The figure rises in with the scene-card entrance.
   `data-tone="dark"` flips the primary button to its white plate and the
   secondary to the dark-ground ring. */
export function CtaBand({
  eyebrow,
  title,
  body,
  actions,
  id = "contact",
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  actions: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} data-tone="dark" className="relative isolate overflow-hidden bg-primary-600 text-white">
      <span aria-hidden className="absolute -right-24 -bottom-40 -z-10 size-[44rem] rounded-full bg-primary-400/60 blur-3xl" />
      <CtaBurst opacity={0.6} sweepMs={900} lifeMs={400} />
      <div className="altor-container">
        <Reveal>
          <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
            <div className="pt-16 pb-6 md:pt-24 lg:py-28">
              {eyebrow && <p className="altor-eyebrow mb-4 text-white/70">{eyebrow}</p>}
              <h2 className="max-w-[20ch] text-h2 text-balance text-white">{title}</h2>
              {body && <p className="mt-5 max-w-md text-lg leading-relaxed text-pretty text-white/75">{body}</p>}
              <div className="mt-9 flex flex-wrap gap-3">{actions}</div>
            </div>
            <div className="relative mx-auto h-72 w-full max-w-sm sm:h-80 lg:mx-0 lg:h-auto lg:max-w-none lg:self-stretch">
              <Image
                src="/portrait-cutout.png"
                alt="Ali Demirbaş"
                fill
                sizes="(min-width: 1024px) 34rem, 24rem"
                className="lab-scene-card object-contain object-bottom drop-shadow-[0_30px_50px_rgb(0_0_0/0.35)]"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
