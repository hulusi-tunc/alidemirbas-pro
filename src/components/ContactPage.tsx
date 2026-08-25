import { Briefcase, Mail, MessageCircle, Users } from "lucide-react";

import { CalEmbed } from "@/components/CalEmbed";
import { ContactForm } from "@/components/ContactForm";
import { SiteFooter, SiteHeader } from "@/components/Site";
import { Section } from "@/components/ui/Section";
import { GitHubMark, LinkedInMark } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/Reveal";
import { copy, EMAIL, LINKEDIN, type Lang } from "@/lib/content";

const GITHUB = "https://github.com/ali-demirbas";
const REASON_ICONS = [Briefcase, Users, MessageCircle];

/* Contact page — CONTACT PILOT, see DESIGN-MIGRATION-PLAN.md.

   This is the first real-implementation validation of the Mobbin-derived
   design system, scoped to this page only (per the pilot brief: don't
   touch Home/Blog/Lab/Calculators/AB-tests/Journeys/Search, don't change
   shared chrome, don't change nav/footer). SiteHeader/SiteFooter below are
   used exactly as everywhere else, unmodified.

   STRUCTURAL DEVIATION FROM THE PRE-PILOT PLAN, reported per the brief's
   own "PLANNED -> OBSERVED -> RECOMMENDED" instruction:
     PLANNED (DESIGN-MIGRATION-PLAN.md §2, row 4): keep the existing
       full-bleed dark "Intro" hero band above a separate, weaker
       two-column "Main" section.
     OBSERVED while implementing against the supplied Coda reference: the
       brief's own composition description - "solda güçlü page heading +
       kısa supporting copy, ALTINDA 3 information/value block, sağda
       büyük form surface" - describes ONE split (heading and the 3
       reason-blocks together in the SAME left column as the form), not a
       hero band stacked above a second, separate section. A full-bleed
       dark gradient band over it also directly contradicts the
       reference's own explicit "geniş whitespace, düşük görsel gürültü."
     RECOMMENDED (applied here): the dark hero band and the old "Main"
       section are merged into ONE light, low-noise, two-column section -
       heading + supporting copy + quick-contact links + the 3 reason
       blocks on the left, the form card on the right. All existing copy,
       links and the mailto-fallback form are preserved; only the section
       structure and visual treatment changed. The "Schedule a call" /
       Cal.com section is unaffected by the Coda reference (it isn't part
       of that composition) and keeps its own section below, lightly
       touched only for token consistency (border/radius). */

function Composition({ t }: { t: (typeof copy)[Lang] }) {
  const c = t.contact;
  return (
    <Section tone="paper" size="lg">
      <div className="altor-container">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          {/* Left: heading + supporting copy + quick links + 3 reason blocks.
              Mobile/tablet: this column renders first, form second - matches
              the pilot's "intro önce, form sonra" stacking requirement, and
              needs no extra markup since it's simply source order under a
              single-column grid below `lg`. */}
          <Reveal>
            <p className="altor-eyebrow mb-5 text-ink-400">{c.eyebrow}</p>
            <h1 className="max-w-xl text-display-xl text-ink-950">{c.title}</h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-600">{c.sub}</p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink-600 transition-colors hover:border-ink-300 hover:text-ink-950"
              >
                <Mail aria-hidden className="size-4" />
                {c.emailPill}
              </a>
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink-600 transition-colors hover:border-ink-300 hover:text-ink-950"
              >
                <LinkedInMark className="size-4" />
                LinkedIn
              </a>
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink-600 transition-colors hover:border-ink-300 hover:text-ink-950"
              >
                <GitHubMark className="size-4" />
                GitHub
              </a>
            </div>

            <p className="altor-eyebrow mt-12 mb-2 text-ink-400">{c.reasonsTitle}</p>
            <div className="flex flex-col">
              {c.reasons.map((reason, i) => {
                const Icon = REASON_ICONS[i] ?? MessageCircle;
                return (
                  <div
                    key={reason.title}
                    className="flex gap-4 border-t border-line-soft py-6 first:border-t-0 first:pt-4"
                  >
                    <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-ink-400" strokeWidth={1.5} />
                    <div>
                      <p className="font-medium text-ink-950">{reason.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-600">{reason.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Right: the form surface — a bordered, `--radius-card`-rounded
              card (16px, sourced from the real Mobbin reference markup,
              see globals.css's own note on `--radius-card`). Border only
              at rest, no shadow — this project's own "hairline as default,
              shadow reserved for hover/elevation" pattern, unchanged. */}
          <Reveal delay={90}>
            <div className="rounded-card border border-line bg-paper p-8 md:p-10">
              <h2 className="text-xl font-semibold tracking-tight text-ink-950">{c.formTitle}</h2>
              <div className="mt-6">
                <ContactForm t={c} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

function Schedule({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <Section tone="soft" size="lg">
      <div className="altor-container">
        <Reveal>
          <h2 className="text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-[1.1] text-ink-900">
            {t.contact.scheduleTitle}
          </h2>
          <p className="mt-2 text-base text-ink-500">{t.contact.scheduleSub}</p>
        </Reveal>
        <Reveal delay={90} className="mt-8">
          <div className="rounded-card border border-line" style={{ minHeight: 600 }}>
            <CalEmbed />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export default function ContactPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? "/tr/contact" : "/contact";
  return (
    <>
      <SiteHeader t={t} anchorBase={home} langHref={langHref} />
      <main>
        <Composition t={t} />
        <Schedule t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
