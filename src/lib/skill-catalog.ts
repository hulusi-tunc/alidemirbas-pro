import { copy, type Lang } from "@/lib/content";

/* Thin accessor over the real Lab project data that already lives in
   content.ts (`copy[lang].lab.projects`) - NOT a second catalog. The
   Skill Product Page template reads real name/desc/tags/links from here;
   this file adds no content of its own, only typed lookup helpers, so
   there is exactly one place project data is authored. */

// Structural, not derived from `typeof copy["en"]` - the EN and TR project
// arrays are each typed as literal tuples via `as const`, so a type pulled
// from one language's exact literals doesn't structurally accept the
// other's (different name/desc/tag strings). This just describes the
// shape both already share.
export type SkillProject = {
  name: string;
  slug: string;
  desc: string;
  tags: readonly string[];
  links: readonly { label: string; href: string }[];
};

export function getAllSkillProjects(lang: Lang): SkillProject[] {
  return [...copy[lang].lab.projects];
}

export function getSkillProject(lang: Lang, slug: string): SkillProject | undefined {
  return copy[lang].lab.projects.find((p) => p.slug === slug);
}

/** GitHub repo URL for a project, if it has one - derived from its own
    links array (real data), not constructed from the slug. Falls back to
    undefined for projects whose only link is a hosted destination
    (Numerspace, the Journey Library's own /lab/journeys route). */
export function githubUrl(project: SkillProject): string | undefined {
  return project.links.find((l) => l.href.startsWith("https://github.com/"))?.href;
}
