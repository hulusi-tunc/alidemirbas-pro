import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Database, FlaskConical } from "lucide-react";

import JourneyBrowser from "@/components/JourneyBrowser";
import { copy, EMAIL, type Lang } from "@/lib/content";

/* The lab as an app shell rather than a marketing page: slim top bar,
   library sidebar on the left (live tools + a visible roadmap of
   coming-soon entries), and the archive as the main workspace panel. */

export default function LabPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const shell = t.lab.shell;
  const home = lang === "en" ? "/" : "/tr";
  const otherLab = lang === "en" ? "/tr/lab" : "/lab";

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

      <div className="flex flex-1">
        {/* library sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-line bg-paper-soft md:block">
          <div className="sticky top-14 flex max-h-[calc(100svh-3.5rem)] flex-col gap-8 overflow-y-auto p-4 pt-6">
            <nav aria-label={shell.tools}>
              <p className="px-2 text-xs font-medium text-neutral-500">{shell.tools}</p>
              <ul className="mt-2 space-y-0.5">
                {shell.library.map((item) => {
                  const external = item.href.startsWith("http");
                  const Cmp = external ? "a" : Link;
                  return (
                    <li key={item.name}>
                      <Cmp
                        href={item.href}
                        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                        aria-current={"active" in item && item.active ? "page" : undefined}
                        className={
                          "active" in item && item.active
                            ? "flex items-start gap-2.5 border-l-2 border-blue-600 bg-paper px-2.5 py-2"
                            : "flex items-start gap-2.5 border-l-2 border-transparent px-2.5 py-2 transition-colors hover:bg-paper"
                        }
                      >
                        <Database aria-hidden className="mt-0.5 size-4 shrink-0 text-neutral-500" />
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 text-sm font-medium text-ink-900">
                            <span className="truncate">{item.name}</span>
                            {external ? <ArrowUpRight aria-hidden className="size-3 shrink-0 text-neutral-400" /> : null}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-neutral-500">{item.desc}</span>
                        </span>
                      </Cmp>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* "Coming soon" (Push benchmarks / Subject line lab / RFM
                playground) removed from the sidebar per feedback. shell.
                planned/comingSoon/soon copy is untouched in content.ts -
                re-add the block above (see git history) to bring it back. */}

            <p className="mt-auto px-2 pb-2 text-xs text-neutral-400">{t.footer.left}</p>
          </div>
        </aside>

        {/* workspace */}
        <main className="min-w-0 flex-1">
          <div className="border-b border-line px-4 py-6 md:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-ink-950">{t.lab.page.title}</h1>
              <span className="border border-line bg-paper-soft px-2 py-0.5 text-xs font-medium text-neutral-600">
                70 {t.lab.page.results}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">{t.lab.page.intro}</p>
            {/* mobile: the sidebar's tools collapse into links here */}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 md:hidden">
              {shell.library
                .filter((item) => item.href.startsWith("http"))
                .map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm font-medium text-blue-600"
                  >
                    {item.name}
                    <ArrowUpRight aria-hidden className="size-3" />
                  </a>
                ))}
            </div>
          </div>
          <div className="px-4 py-6 md:px-8">
            <JourneyBrowser lang={lang} t={t.lab.page} />
          </div>
        </main>
      </div>
    </div>
  );
}
