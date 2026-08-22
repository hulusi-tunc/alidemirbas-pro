import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";

import JourneyBrowser from "@/components/JourneyBrowser";
import { JOURNEY_COUNT, withJourneyCount } from "@/lib/archive";
import { copy, EMAIL, type Lang } from "@/lib/content";

/* The archive as its own workspace: slim top bar, then the journey browser
   full-width. Used to also carry a "Tools" sidebar linking to the other Lab
   projects, but that's redundant now that /lab is its own landing page
   people arrive from - re-add it (see git history before this comment) if
   that stops being true. */

export default function LabPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const shell = t.lab.shell;
  const home = lang === "en" ? "/" : "/tr";
  const otherLab = lang === "en" ? "/tr/lab/journeys" : "/lab/journeys";

  return (
    <div className="flex min-h-svh flex-col bg-paper">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Link
              href={home}
              className="flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-ink-900"
            >
              <ArrowLeft aria-hidden className="size-3.5" />
              <span className="hidden sm:inline">{shell.backToSite}</span>
            </Link>
            <span aria-hidden className="h-4 w-px bg-line" />
            <span className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink-950">
              <FlaskConical aria-hidden className="size-4 text-blue-600" />
              Ali Demirbaş - Lab
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href={otherLab} className="text-sm text-neutral-600 transition-colors hover:text-ink-900">
              {t.nav.lang}
            </Link>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex h-8 items-center bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              {t.nav.cta}
            </a>
          </div>
        </div>
      </header>

      {/* workspace */}
      <main className="min-w-0 flex-1">
        <div className="border-b border-line px-4 py-6 md:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-ink-950">{t.lab.page.title}</h1>
              <span className="border border-line bg-paper-soft px-2 py-0.5 text-xs font-medium text-neutral-600">
                {JOURNEY_COUNT} {t.lab.page.results}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
              {withJourneyCount(t.lab.page.intro)}
            </p>
          </div>
        </div>
        <div className="px-4 py-6 md:px-8">
          {/* wider than the header block: the facet sidebar takes 15rem out of
              the row, and the list still needs room for title plus badges */}
          <div className="mx-auto max-w-6xl">
            <JourneyBrowser lang={lang} t={t.lab.page} />
          </div>
        </div>
      </main>
    </div>
  );
}
