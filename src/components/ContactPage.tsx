import { Briefcase, Mail, MessageCircle, Users } from "lucide-react";

import { CalEmbed } from "@/components/CalEmbed";
import { ContactForm } from "@/components/ContactForm";
import { SiteFooter, SiteHeader } from "@/components/Site";
import { Section } from "@/components/ui/Section";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { GitHubMark, LinkedInMark } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/Reveal";
import { copy, EMAIL, LINKEDIN, type Lang } from "@/lib/content";

const GITHUB = "https://github.com/ali-demirbas";
const REASON_ICONS = [Briefcase, Users, MessageCircle];

/* Contact page — CONTACT PILOT, see DESIGN-MIGRATION-PLAN.md.

   ROUND 1: merged the old dark hero band + separate "Main" section into
   one light, two-column Coda-style composition (see git history for the
   full PLANNED->OBSERVED->RECOMMENDED note — kept short here since round 3
   changes most of what round 1 set visually).

   ROUND 2: applied Portrait-derived tokens (PORTRAIT-DESIGN-SOURCE-AUDIT.md)
   for container/type/radius/motion.

   ROUND 3 (this pass) — VISUAL REVISION, presentation-only, per the fidelity
   audit table in this round's own report. Structure (Coda's two-column
   composition, which fields exist, the mailto-fallback logic) is UNCHANGED.
   What changed, and why, per field:
     - Intro column tightened (smaller gaps, narrower measures) so it reads
       as one editorial block instead of loosely spaced lines — Portrait's
       own hero uses a tight `max-w-[10em]` heading and a supporting
       paragraph colored as the HEADING'S OWN COLOR AT 65% OPACITY, not a
       separate muted gray step — both adopted below.
     - The form's "boxed SaaS card" (ring + shadow + white fill) is gone —
       Portrait itself only rings/shadows small feature TILES, never wraps
       a whole multi-field form section in one; the form now sits on a
       barely-there `paper-soft` tint with no ring/border/shadow, reading
       as a zone of the page rather than a floating object.
     - CTA color: Portrait's real confirmed primary-button fill is a dark
       NEUTRAL (`bg-gray-700` → hover `bg-gray-1000`), never brand blue —
       see ContactForm.tsx's own note on the `Button` override.
     - Reason blocks: divider rules removed (they read as FAQ/CV list rows,
       flagged explicitly this round) — pure vertical rhythm now carries
       the separation, matching Portrait's own icon+heading+copy stacks,
       which don't rule dividers between list items.
     - Schedule section: reduced outer padding/reserved height — see that
       function's own comment; CalEmbed itself (the real, wired Cal.com
       booking widget) is UNCHANGED, only its container is right-sized.
   Nothing here touches SiteHeader/SiteFooter/Button.tsx/Section.tsx
   themselves — see this round's report for the footer finding, reported
   as a GLOBAL-DESIGN-DECISION rather than forked locally. */

function Composition({ t }: { t: (typeof copy)[Lang] }) {
  const c = t.contact;
  return (
    // size="md" (was "lg"): less top/bottom section padding, per "üst
    // bölümdeki boşluğu azalt" — the intro and the form should feel like
    // one composition, not two blocks separated by a generous SaaS gutter.
    <Section tone="paper" size="md">
      <PortraitContainer>
        {/* gap-14/lg:gap-20 -> gap-10/lg:gap-14: the two columns were
            reading as disconnected at the wider gap. Still enough to
            separate them, not enough to feel like two unrelated blocks. */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <Reveal>
            <p className="altor-eyebrow mb-4 text-ink-400">{c.eyebrow}</p>
            {/* max-w-xl -> max-w-md: Portrait's own real H1 caps at
                `max-w-[10em]` (tight, editorial, forces controlled line
                breaks) rather than running the full column width. */}
            <h1 className="max-w-md text-h1-fluid font-medium text-ink-950">{c.title}</h1>
            {/* Color: `text-ink-950/65` — Portrait's real technique for
                supporting copy is the HEADING's own color at 65% opacity,
                not a separately-stepped gray (`ink-600` before) — this is
                what actually ties heading and body into one visual family
                instead of two different colors sitting near each other.
                mt-6->mt-3, max-w-lg->max-w-md: tighter heading-to-body
                rhythm and measure, matching the "one editorial block"
                brief. */}
            <p className="mt-3 max-w-md text-lg leading-relaxed text-ink-950/65">{c.sub}</p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 rounded-full border border-line-soft px-4 py-2 text-sm text-ink-600 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:border-ink-300 hover:text-ink-950"
              >
                <Mail aria-hidden className="size-4" />
                {c.emailPill}
              </a>
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line-soft px-4 py-2 text-sm text-ink-600 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:border-ink-300 hover:text-ink-950"
              >
                <LinkedInMark className="size-4" />
                LinkedIn
              </a>
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line-soft px-4 py-2 text-sm text-ink-600 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:border-ink-300 hover:text-ink-950"
              >
                <GitHubMark className="size-4" />
                GitHub
              </a>
            </div>

            {/* mt-12 -> mt-10: tightened; divider rules REMOVED (round 3) —
                a flat `border-t` between each row read as an FAQ/CV list,
                flagged explicitly this round. Vertical rhythm alone
                (space-y) now separates the three blocks — no new
                decorative card/border introduced, per this round's own
                "don't invent a new decorative card" instruction. Icons
                stay small/secondary (`text-ink-400`, unchanged); title +
                description are the actual focus, description now uses the
                same heading-color-at-opacity technique as the intro copy
                for one consistent "ink family" across the whole column. */}
            <p className="altor-eyebrow mt-10 mb-4 text-ink-400">{c.reasonsTitle}</p>
            <div className="flex flex-col gap-6">
              {c.reasons.map((reason, i) => {
                const Icon = REASON_ICONS[i] ?? MessageCircle;
                return (
                  <div key={reason.title} className="flex gap-4">
                    <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-ink-400" strokeWidth={1.5} />
                    <div>
                      <p className="font-medium text-ink-950">{reason.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-950/65">{reason.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Right: the form. ROUND 3 — the "boxed SaaS card" is gone:
              no `ring`, no `shadow`, no `bg-paper` (white-on-white would be
              invisible anyway once the ring/shadow that defined its edges
              is removed). `bg-paper-soft` is this project's own existing,
              barely-there tint (already used elsewhere as the site's one
              "not quite white" surface) — enough to suggest a zone of the
              page without drawing a box around it. `rounded-card` (16px)
              is kept as pure shape, not a boundary. This matches what
              Portrait's real production DOM actually does: `ring-1
              ring-black/6` there is reserved for small feature TILES, not
              used to wrap an entire multi-field form section. */}
          <Reveal delay={90}>
            <div className="rounded-card bg-paper-soft p-8 md:p-10">
              <h2 className="text-h6 font-medium tracking-tight text-ink-950">{c.formTitle}</h2>
              <div className="mt-6">
                <ContactForm t={c} />
              </div>
            </div>
          </Reveal>
        </div>
      </PortraitContainer>
    </Section>
  );
}

function Schedule({ t }: { t: (typeof copy)[Lang] }) {
  return (
    // size="md" (was "lg"): less dead vertical space before/after this
    // section — same reasoning as Composition above.
    <Section tone="soft" size="md">
      <PortraitContainer>
        <Reveal>
          <h2 className="text-h2-fluid font-medium text-ink-900">{t.contact.scheduleTitle}</h2>
          <p className="mt-2 text-base text-ink-500">{t.contact.scheduleSub}</p>
        </Reveal>
        {/* ROUND 3: the outer `ring`/box is gone (same reasoning as the
            form card above — this was reading as an empty placeholder
            card rather than a natural page zone). `minHeight` reduced from
            600 to 480 — CalEmbed's own Cal.com widget (real, wired,
            unchanged — calLink/theme/layout props untouched) still gets
            enough room for its month-view layout without this page
            reserving more empty space than the actual content needs. This
            is a container-sizing change only; nothing about the embed's
            own functionality/content contract changed. */}
        <Reveal delay={90} className="mt-6">
          <div style={{ minHeight: 480 }}>
            <CalEmbed />
          </div>
        </Reveal>
      </PortraitContainer>
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
