import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { AbCard, JourneyCard } from "@/components/HomeWork";
import { ButtonLink } from "@/components/ui/Button";
import { CtaBurst } from "@/components/ui/CtaBurst";
import { Reveal } from "@/components/ui/Reveal";
import { withJourneyCount } from "@/lib/archive";
import { copy, EMAIL, LINKEDIN, type Lang } from "@/lib/content";

/* THE HOMEPAGE'S CLOSING SECTION (Hulusi, 2026-09-07: "the blue CTA does
   not match our style now; not a frame, a full-width section, not only
   blue, something enclosing Ali's photo and UI assets that support the
   CTA"). A full-bleed band on the night meadow - the blue-hour plate the
   hero's dark tile carries - under a dark gradient, with the pixel sweep
   on arrival. Left, the words and the two actions; right, the person and
   his work as one picture: the portrait in colour as a card, the journey
   steps card over its upper right edge and the A/B pair over its lower
   edge, the same two drawings the "What I do" band shows, arriving with
   the scene-card entrance. The other pages keep FinalCta for now. */
export function HomeCta({ t }: { t: (typeof copy)[Lang] }) {
  const library = t.lab.projects.find((p) => p.slug === "lifecycle-card-archive");
  const playbook = t.lab.projects.find((p) => p.slug === "ab-test-playbook");
  return (
    <section id="contact" data-tone="dark" className="relative isolate overflow-hidden bg-ink-950 py-20 text-white md:py-28">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image src="/lab/frames/google-ads-change-history-dashboard.jpg" alt="" fill sizes="100vw" className="object-cover object-bottom" />
        <span className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/55 to-ink-950/35" />
        <span className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950/70 to-transparent" />
        <CtaBurst className="z-0" />
      </div>

      <div className="altor-container">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <Reveal>
            <h2 className="max-w-[20ch] text-h2 text-balance text-white">{t.finalCta.title}</h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-pretty text-white/75">{t.finalCta.body}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href={`mailto:${EMAIL}`} variant="primary" size="md">
                {t.finalCta.button}
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
              <ButtonLink href={LINKEDIN} variant="outlineInverted" size="md">
                {t.finalCta.linkedin}
                <ArrowUpRight aria-hidden className="size-4" />
              </ButtonLink>
            </div>
          </Reveal>

          {/* The picture: portrait card with two work cards laid over its
              edges. Absolute on lg where there is room; below lg the
              portrait and the A/B card stack. */}
          <Reveal delay={120} className="relative mx-auto w-full max-w-md lg:max-w-none lg:h-[30rem]">
            {/* The overlaps cover only the portrait's right-hand padding, never
                the face; no pill on the portrait here - the cards are the
                caption. */}
            <div className="lab-scene-card relative aspect-[4/5] w-full overflow-hidden rounded-[28px] shadow-[0_40px_90px_-40px_rgb(0_0_0/0.7)] ring-1 ring-white/15 lg:absolute lg:top-0 lg:left-0 lg:aspect-auto lg:h-full lg:w-[18rem]">
              <Image src="/portrait.jpg" alt="Ali Demirbaş" fill sizes="(min-width: 1024px) 18rem, 28rem" className="object-cover" />
            </div>
            <div className="lab-scene-card hidden lg:absolute lg:top-2 lg:right-0 lg:block lg:w-[21rem]">
              <JourneyCard proof={withJourneyCount(library?.proof ?? "")} />
            </div>
            <div className="lab-scene-card -mt-16 ml-auto w-[88%] lg:absolute lg:right-4 lg:bottom-0 lg:mt-0 lg:w-[20rem]">
              <AbCard proof={withJourneyCount(playbook?.proof ?? "")} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
