import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { ButtonLink } from "./Button";
import { CtaBurst } from "./CtaBurst";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./Section";
import { copy, type Lang } from "@/lib/content";
import { resolveLogo, stackOnePerCategory, type Tool } from "@/lib/stack";

/* Homepage Stack section - one card per category (stackOnePerCategory),
   in the row-card style of the /stack page's own reference (real, full-
   colour logo tile + bold product name + its tag as a subtitle),
   replacing the earlier grayscale-icon bento grid. Same heading -> card
   grid -> "see all" link shape as the Lab and Calculators sections above
   it, for one consistent pattern across the homepage. Every logo/name/tag
   is this site's own real stack data (lib/stack.ts) - nothing invented. */
function ToolCard({ tool, tag }: { tool: Tool; tag: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-b from-paper to-paper/50 shadow-[0_24px_60px_-32px_rgb(10_16_32/0.35)] ring-1 ring-white/70 backdrop-blur-2xl transition-[box-shadow,transform] duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-28px_rgb(10_16_32/0.45)] p-5">
      <span className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-paper/80 ring-1 ring-ink-950/[0.04]">
        <span className="relative size-6">
          <Image src={resolveLogo(tool)} alt="" fill sizes="1.5rem" className="object-contain" />
        </span>
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold text-ink-950">{tool.name}</span>
        <span className="block truncate text-sm text-ink-500">{tag}</span>
      </span>
    </div>
  );
}

export function StackShowcase({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const tools = stackOnePerCategory();

  return (
    <section className="relative isolate overflow-hidden bg-paper-soft py-16 md:py-20">
      {/* THE GROUND (Hulusi, 2026-09-07: "put some background here and
          make the cards glassy"): the journey builder's meadow plate - the
          one frame the homepage had not used yet - rising from the bottom
          under a mask so the heading stays on paper and the cards sit on
          the field, frosted the way the hero tiles are. */}
      <div aria-hidden className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent_8%,black_55%)]">
        <Image src="/lab/frames/claude-lifecycle.jpg" alt="" fill sizes="100vw" className="object-cover object-bottom" />
        <CtaBurst className="z-0" />
      </div>
      <div className="altor-container">
        <SectionHeading eyebrow={t.stack.eyebrow} title={t.stack.homeTitle} intro={t.stack.homeIntro} />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tools.map((tool, i) => (
            <Reveal key={tool.name} delay={i * 50}>
              <ToolCard tool={tool} tag={tool.tag[lang]} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={tools.length * 50 + 40} className="mt-12">
          <ButtonLink href={t.nav.stackHref} variant="outline" size="md">
            {t.stack.homeMore}
            <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
