import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { withJourneyCount } from "@/lib/archive";
import { copy, type Lang } from "@/lib/content";

/** The Lab project card grid - shared between the home page's Lab section
    and the dedicated /lab landing page, so the card markup only lives once. */
export function LabProjectGrid({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {t.lab.projects.map((project, i) => (
        <Reveal key={project.slug} delay={i * 80}>
          {/* Soft filled card, and a hover that is a colour change only:
              the lift-and-shadow this used to do (translate + a 32px
              shadow) was reviewed as cheap, and it belonged to the
              stroke-heavy direction the site has left. */}
          <article className="group flex h-full flex-col rounded-card bg-paper-soft p-6 transition-colors duration-200 hover:bg-blue-50">
            <h3 className="text-lg font-semibold tracking-tight text-ink-950">{project.name}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">
              {withJourneyCount(project.desc)}
            </p>
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
