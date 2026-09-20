import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { SiteFooter, SiteHeader } from "@/components/Site";
import { copy, EMAIL, type Lang } from "@/lib/content";

/* The lab workspace chrome: slim top bar, then whatever the route puts in it.

   `data-lab-root` is the handle the journey modal uses to make everything
   behind it inert. It belongs on the outermost element the modal is not part
   of, which is this one. */

export default function LabShell({
  lang,
  chrome = "workspace",
  langHref,
  back,
  children,
}: {
  lang: Lang;
  /** "workspace" is the slim bar the journey detail pages open in;
      "site" is the marketing shell (SiteHeader/SiteFooter) the Lab
      product pages use - the library list pages take it since 2026-09-13
      so they read as one family with /lab and the product pages. Either
      way this element stays `data-lab-root` for the modal. */
  chrome?: "workspace" | "site";
  /** The counterpart page in the other language, for the site header's
      switch; defaults to the library hub. */
  langHref?: string;
  /** Where the workspace bar's back link goes. A detail page hands in its
      own library ("All scenarios"), the way the journey detail bar does;
      the default is the site's home. */
  back?: { href: string; label: string };
  children: React.ReactNode;
}) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const otherLab = langHref ?? (lang === "en" ? "/tr/lab/journeys" : "/lab/journeys");
  const backLink = back ?? { href: home, label: t.lab.shell.backToSite };

  if (chrome === "site") {
    return (
      <div data-lab-root className="flex min-h-svh flex-col bg-paper">
        <SiteHeader t={t} anchorBase={home} langHref={otherLab} />
        <main className="min-w-0 flex-1">{children}</main>
        <SiteFooter t={t} lang={lang} />
      </div>
    );
  }

  return (
    <div data-lab-root className="flex min-h-svh flex-col bg-paper">
      {/* On the site's tokens since 2026-09-13: the same hairline, ground and
          blur as SiteHeader, links on the label step, the CTA a ButtonLink -
          the raw blue block and neutral greys it opened with were the last
          of the old Lab idiom. */}
      <header className="sticky top-0 z-40 border-b border-line-soft bg-paper/95 backdrop-blur-sm">
        <div className="altor-container-wide flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={backLink.href}
              className="flex items-center gap-1.5 text-sm font-medium text-ink-600 transition-colors duration-[var(--duration-fast)] hover:text-ink-950"
            >
              <ArrowLeft aria-hidden className="size-4" />
              <span className="hidden sm:inline">{backLink.label}</span>
            </Link>
            <span aria-hidden className="h-4 w-px bg-line-soft" />
            <span className="flex items-center gap-2 text-sm font-semibold text-ink-950">
              <FlaskConical aria-hidden className="size-4 text-primary-600" />
              Ali Demirbaş - Lab
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={otherLab}
              className="text-sm font-medium text-ink-600 transition-colors duration-[var(--duration-fast)] hover:text-ink-950"
            >
              {t.nav.lang}
            </Link>
            <ButtonLink href={`mailto:${EMAIL}`} variant="primary" size="sm">
              {t.nav.cta}
            </ButtonLink>
          </div>
        </div>
      </header>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
