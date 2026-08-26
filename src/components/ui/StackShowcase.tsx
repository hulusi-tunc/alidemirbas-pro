import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HoverLift } from "./HoverLift";
import { Reveal } from "./Reveal";
import { copy, type Lang } from "@/lib/content";
import { resolveLogo, stackGroups, stackPreview, type Tool } from "@/lib/stack";

/* Homepage Stack section - an editorial logo showcase (bento-style grid,
   varied cell sizes, monochrome-by-default logos) instead of the old
   uniform two-column badge list. Layout/rhythm is the reference's; every
   token (border, radius, spacing, hover) and every logo/count is this
   site's own real stack data - nothing invented, no fabricated stat
   cell. Explicit grid placement (not auto-flow) so the "some cells are
   bigger" arrangement is deliberate, not accidental masonry. */

const PLACEMENT = [
  "md:col-start-2 md:row-start-1",
  "md:col-start-3 md:row-start-1",
  "md:col-start-4 md:row-start-1",
  "md:col-start-2 md:row-start-2 md:col-span-2",
  "md:col-start-4 md:row-start-2",
  "md:col-start-1 md:row-start-3",
  "md:col-start-2 md:row-start-3",
  "md:col-start-3 md:row-start-3",
];

function LogoCell({ name, tool, tag, className }: { name: string; tool: Tool; tag: string; className: string }) {
  return (
    <HoverLift distance={2} className={className}>
      <div className="group flex h-full flex-col items-center justify-center gap-3 border border-line bg-paper px-5 py-7 text-center transition-colors hover:border-neutral-400">
        <span className="relative h-9 w-full max-w-[7rem]">
          <Image
            src={resolveLogo(tool)}
            alt={name}
            fill
            sizes="7rem"
            className="object-contain opacity-70 grayscale transition-[opacity,filter] duration-300 group-hover:opacity-100 group-hover:grayscale-0"
          />
        </span>
        <span className="text-xs text-neutral-500">{tag}</span>
      </div>
    </HoverLift>
  );
}

export function StackShowcase({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const tools = stackPreview();
  const totalTools = new Set(stackGroups.flatMap((g) => g.tools.map((tool) => tool.name))).size;
  const moreCount = Math.max(totalTools - tools.length, 0);

  return (
    <section className="bg-paper-soft py-24 md:py-32">
      <div className="altor-container">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-3">
          <Reveal className="col-span-2 md:col-start-1 md:row-start-1 md:row-span-2">
            <div className="flex h-full flex-col justify-between border border-line bg-paper p-7">
              <div>
                <p className="altor-eyebrow text-ink-400">{t.stack.eyebrow}</p>
                <h2 className="mt-4 text-2xl leading-tight text-ink-900">{t.stack.homeTitle}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">{t.stack.homeIntro}</p>
              </div>
              <Link
                href={t.nav.stackHref}
                className="mt-6 flex w-fit items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                {t.stack.homeMore}
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </div>
          </Reveal>

          {tools.map((tool, i) => (
            <Reveal key={tool.name} delay={60 + i * 30} className={PLACEMENT[i] ?? ""}>
              <LogoCell name={tool.name} tool={tool} tag={tool.tag[lang]} className="h-full" />
            </Reveal>
          ))}

          {moreCount > 0 && (
            <Reveal delay={60 + tools.length * 30} className="md:col-start-4 md:row-start-3">
              <Link
                href={t.nav.stackHref}
                className="flex h-full flex-col items-center justify-center gap-1 border border-dashed border-line-strong px-5 py-7 text-center text-sm text-neutral-500 transition-colors hover:border-ink-900 hover:text-ink-900"
              >
                <span className="text-lg font-semibold tabular-nums text-ink-900">+{moreCount}</span>
                {t.stack.homeMore}
              </Link>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
