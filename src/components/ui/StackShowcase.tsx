import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-5 transition-colors hover:border-neutral-400">
      <span className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-paper-soft">
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
    <section className="bg-paper-soft py-16 md:py-20">
      <div className="altor-container">
        <SectionHeading eyebrow={t.stack.eyebrow} title={t.stack.homeTitle} intro={t.stack.homeIntro} />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tools.map((tool, i) => (
            <Reveal key={tool.name} delay={i * 50}>
              <ToolCard tool={tool} tag={tool.tag[lang]} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={tools.length * 50 + 40}>
          <Link
            href={t.nav.stackHref}
            className="mt-10 flex w-fit items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            {t.stack.homeMore}
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
