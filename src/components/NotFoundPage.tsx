import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Section } from "@/components/ui/Section";
import { SiteFooter, SiteHeader } from "@/components/Site";
import { copy, type Lang } from "@/lib/content";

/* 404 — PORTRAIT PILOT, continuing the locked visual system from
   Contact/Stack/Blog/Lab/Calculators/About. Recovery, not a visual
   concept, per this round's own instruction — the previous version's
   custom minimal header + hand-drawn "line that goes off-course" mark
   (NotFoundMark.tsx) is dropped: an illustration is on this round's own
   forbidden list even when it is restrained and on-brand, so it goes,
   along with the bespoke standalone header it kept the page framed by
   instead of the site's real one.

   SHARED SiteHeader/SiteFooter (unchanged) replace that custom header -
   same reasoning as every other page this round: a 404 is still a page
   on this site, and should read as one, not as an isolated splash
   screen. No `min-h-svh`/`100vh` - the page sits in the normal Section
   rhythm, exactly like every other locked page, so the footer lands
   where content naturally ends rather than being pinned off-screen.

   LOCALIZATION: `lang` arrives as a plain prop from each route group's
   own scoped not-found.tsx (see that file's own comment for why - two
   independent root layouts, no single global 404 to hang this off of).
   Nothing here reads the URL or guesses the locale itself; that
   architecture is unchanged, only this component's own presentation is. */
export default function NotFoundPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? "/tr" : "/";

  return (
    <>
      <SiteHeader t={t} anchorBase={home} langHref={langHref} />
      <main>
        <Section tone="paper" size="md">
          <PortraitContainer>
            {/* Hierarchy per this round's own instruction: "404" is the
                smallest line on the page, not the largest - eyebrow, then
                a meaningful H1, then supporting copy, then the two
                recovery actions. Same grammar as every other Portrait
                page's hero (text-h1-fluid/ink-950/65), not a special
                error-page treatment. */}
            <div className="mx-auto max-w-md text-center">
              <p className="altor-eyebrow mb-4 text-ink-400">{t.notFound.eyebrow}</p>
              <h1 className="text-h1-fluid font-medium text-ink-950">{t.notFound.title}</h1>
              <p className="mt-3 text-lg leading-relaxed text-ink-950/65">{t.notFound.body}</p>

              {/* Two recovery actions, per instruction - a real button for
                  the primary path (same ButtonLink/variant="primary" grammar
                  FinalCta already uses for its own primary action) and a
                  plain underlined text link for the secondary one, matching
                  the underline-link grammar already used for "Clear all" /
                  reset actions on Blog/Calculators. No search box - there is
                  nothing to search for on a page that does not exist. */}
              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <ButtonLink href={home} variant="primary" size="md">
                  {t.notFound.cta}
                </ButtonLink>
                <Link
                  href={t.nav.labHref}
                  className="text-sm font-medium text-ink-900 underline decoration-line-soft underline-offset-4 transition-colors hover:text-ink-600"
                >
                  {t.notFound.labLink}
                </Link>
              </div>
            </div>
          </PortraitContainer>
        </Section>
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
