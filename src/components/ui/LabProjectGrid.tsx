import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { copy, type Lang } from "@/lib/content";

/** The Lab project card grid - shared between the home page's Lab section
    and the dedicated /lab landing page, so the card markup only lives once. */
export function LabProjectGrid({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {t.lab.projects.map((project, i) => (
        <Reveal key={project.slug} delay={i * 80}>
          <article className="group flex h-full flex-col border border-line p-6 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-[0_12px_32px_-16px_rgba(10,16,32,0.18)]">
            <h3 className="text-lg font-semibold tracking-tight text-ink-950">{project.name}</h3>
            <p className="mt-1 font-mono text-xs text-neutral-500">{project.slug}</p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">{project.desc}</p>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
              {project.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  {link.label}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </a>
              ))}
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
