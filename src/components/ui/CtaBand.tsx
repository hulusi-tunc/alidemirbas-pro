import type { ReactNode } from "react";

import { CtaBurst } from "@/components/ui/CtaBurst";
import { Reveal } from "@/components/ui/Reveal";

/* THE CLOSING BAND - every page ends on this. A full-width brand-blue
   band, not a framed plate, with the words and the two actions centred
   and a soft lighter bloom behind them; the band answers your arrival
   with the pixel sweep the blue plate always had - dark grain on brand
   blue, the primary button's own dissolve. `data-tone="dark"` flips the
   primary button to its white plate and the secondary to the dark-ground
   ring.

   CENTRED, NO PHOTOGRAPH (Hulusi, 2026-09-14: "put this as the default
   CTA on each page, remove the photo and make it centered"). From
   2026-09-07 to today the band was split: words on the left, Ali cut out
   of his studio photograph standing on the right edge. The figure and its
   column are gone, the bloom moves behind the centred block, and the
   same band now closes every page - the product pages included, which
   used to end on a product-specific version of it (ui/ProductCta, now
   removed); their GitHub and demo actions still sit in their heroes. */
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
      <span aria-hidden className="absolute top-1/2 left-1/2 -z-10 size-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-400/60 blur-3xl" />
      <CtaBurst opacity={0.6} sweepMs={900} lifeMs={400} />
      <div className="altor-container">
        <Reveal>
          <div className="mx-auto flex max-w-2xl flex-col items-center py-16 text-center md:py-24 lg:py-28">
            {eyebrow && <p className="altor-eyebrow mb-4 text-white/70">{eyebrow}</p>}
            <h2 className="max-w-[20ch] text-h2 text-balance text-white">{title}</h2>
            {body && <p className="mt-5 max-w-md text-lg leading-relaxed text-pretty text-white/75">{body}</p>}
            <div className="mt-9 flex flex-wrap justify-center gap-3">{actions}</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
