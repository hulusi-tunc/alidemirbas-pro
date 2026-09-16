import type { ReactNode } from "react";

import { CtaBurst } from "@/components/ui/CtaBurst";
import { Reveal } from "@/components/ui/Reveal";

/* THE CLOSING BAND - every page ends on this. A full-width brand-blue
   band, not a framed plate: the words and the two actions, centred in a
   single column now that the portrait photo (Hulusi's original, 2026-09-07
   "just Ali's photo" version) has been dropped per Ali's own request. The
   band still answers your arrival with the pixel sweep the blue plate
   always had - dark grain on brand blue, the primary button's own
   dissolve. `data-tone="dark"` flips the primary button to its white plate
   and the secondary to the dark-ground ring. */
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
          <div className="py-16 md:py-24 lg:py-28">
            {eyebrow && <p className="altor-eyebrow mb-4 text-white/70">{eyebrow}</p>}
            <h2 className="max-w-[20ch] text-h2 text-balance text-white">{title}</h2>
            {body && <p className="mt-5 max-w-md text-lg leading-relaxed text-pretty text-white/75">{body}</p>}
            <div className="mt-9 flex flex-wrap gap-3">{actions}</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
