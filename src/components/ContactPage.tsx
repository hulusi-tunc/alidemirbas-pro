import { Briefcase, Mail, MessageCircle, Users } from "lucide-react";

import { CalEmbed } from "@/components/CalEmbed";
import { ContactForm } from "@/components/ContactForm";
import { SiteFooter, SiteHeader } from "@/components/Site";
import { GitHubMark, LinkedInMark } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/Reveal";
import { copy, EMAIL, LINKEDIN, type Lang } from "@/lib/content";

const GITHUB = "https://github.com/ali-demirbas";
const REASON_ICONS = [Briefcase, Users, MessageCircle];

/* Contact page. Same dark title band as About and Stack, then the main
   content is one two-column section - reasons to reach out on the left,
   the form on the right (the layout instruction 6 asked for) - followed
   by the existing Cal.com scheduler as a supplementary section rather
   than removed outright. No FinalCta - the whole page already is the
   contact CTA. */

function Intro({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section
      data-tone="dark"
      className="relative isolate overflow-hidden bg-ink-950 pt-40 pb-16 md:pb-20"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-[-18rem] -z-10 h-[36rem] bg-[radial-gradient(50%_50%_at_50%_50%,var(--color-blue-600)_0%,transparent_70%)] opacity-40"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px)] [background-size:calc(100%/8)_100%]"
      />
      <div className="altor-container">
        <Reveal>
          <p className="altor-eyebrow mb-5 text-white/45">{t.contact.eyebrow}</p>
          <h1 className="max-w-3xl bg-gradient-to-r from-primary-300 to-white bg-clip-text text-display-xl text-transparent">
            {t.contact.title}
          </h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="max-w-xl text-xl leading-relaxed text-white/75">{t.contact.sub}</p>
        </Reveal>
        <Reveal delay={140} className="mt-8">
          <div className="flex flex-wrap gap-2.5">
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-2 border border-white/20 px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white"
            >
              <Mail aria-hidden className="size-4" />
              {t.contact.emailPill}
            </a>
            <a
              href={LINKEDIN} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 border border-white/20 px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white"
            >
              <LinkedInMark className="size-4" />
              LinkedIn
            </a>
            <a
              href={GITHUB} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 border border-white/20 px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white"
            >
              <GitHubMark className="size-4" />
              GitHub
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* The two-column body: reasons to reach out on the left (real copy
   derived from finalCta's own "role, project or question" framing - not
   a corporate demo-request page, so the copy stays personal), the form
   on the right. Stacks to one column on mobile per instruction 6. */
function Main({ t }: { t: (typeof copy)[Lang] }) {
  const c = t.contact;
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="altor-container">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
          <Reveal>
            <p className="altor-eyebrow text-ink-400">{c.reasonsTitle}</p>
            <div className="mt-6 flex flex-col">
              {c.reasons.map((reason, i) => {
                const Icon = REASON_ICONS[i] ?? MessageCircle;
                return (
                  <div key={reason.title} className="flex gap-4 border-t border-line py-6 first:pt-0 last:border-b">
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

          <Reveal delay={90}>
            <div className="border border-line bg-paper p-8">
              <h2 className="text-xl font-semibold tracking-tight text-ink-950">{c.formTitle}</h2>
              <div className="mt-6">
                <ContactForm t={c} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Schedule({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section className="bg-paper-soft py-24 md:py-32">
      <div className="altor-container">
        <Reveal>
          <h2 className="text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-[1.1] text-ink-900">
            {t.contact.scheduleTitle}
          </h2>
          <p className="mt-2 text-base text-ink-500">{t.contact.scheduleSub}</p>
        </Reveal>
        <Reveal delay={90} className="mt-8">
          <div className="border border-line" style={{ minHeight: 600 }}>
            <CalEmbed />
          </div>
        </Reveal>
      </div>
    </section>
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
        <Intro t={t} />
        <Main t={t} />
        <Schedule t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
