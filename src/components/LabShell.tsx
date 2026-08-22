import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";

import { copy, EMAIL, type Lang } from "@/lib/content";

/* The lab workspace chrome: slim top bar, then whatever the route puts in it.

   `data-lab-root` is the handle the journey modal uses to make everything
   behind it inert. It belongs on the outermost element the modal is not part
   of, which is this one. */

export default function LabShell({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const otherLab = lang === "en" ? "/tr/lab/journeys" : "/lab/journeys";

  return (
    <div data-lab-root className="flex min-h-svh flex-col bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Link
              href={home}
              className="flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-ink-900"
            >
              <ArrowLeft aria-hidden className="size-3.5" />
              <span className="hidden sm:inline">{t.lab.shell.backToSite}</span>
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

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
