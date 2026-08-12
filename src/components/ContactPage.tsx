import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { Reveal } from "@/components/ui/Reveal";
import { copy, EMAIL, LINKEDIN, type Lang } from "@/lib/content";

/* Contact page. Same dark title band as About and Stack; the two reach-out
   channels are styled as the Lab archive's project cards (icon badge, title,
   sub, a "go" link) rather than the cv's cblock treatment. No FinalCta here -
   the whole page already is the contact CTA - but SiteFooter still closes it
   out like every other page. lucide-react ships no LinkedIn mark in this
   version, so it's a small inline SVG at the same 24x24 scale as the rest. */

function LinkedInMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6.94 8.5H3.56V20.5H6.94V8.5Z" />
      <path d="M5.25 7.03A1.97 1.97 0 1 0 5.25 3.09a1.97 1.97 0 0 0 0 3.94Z" />
      <path d="M20.5 13.63c0-3.16-1.69-4.63-3.94-4.63-1.82 0-2.63 1-3.08 1.7V8.5H10.1c.05 1 0 12 0 12h3.38v-6.7c0-.36.03-.72.13-.98.29-.72.94-1.47 2.05-1.47 1.45 0 2.03 1.1 2.03 2.72V20.5h3.38l-.57-6.87Z" />
    </svg>
  );
}

function Intro({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section
      data-tone="dark"
      className="relative isolate overflow-hidden bg-ink-950 pt-40 pb-20 md:pb-28"
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
      </div>
    </section>
  );
}

function Channels({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="altor-container">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Reveal>
            <a
              href={LINKEDIN}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col border border-line p-8 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-[0_12px_32px_-16px_rgba(10,16,32,0.18)]"
            >
              <span className="flex size-11 items-center justify-center border border-line bg-paper-soft text-ink-700">
                <LinkedInMark className="size-5" />
              </span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-ink-950">{t.contact.linkedinLabel}</h3>
              <p className="mt-2 flex-1 text-base leading-relaxed text-ink-500">linkedin.com/in/ali-demirbas</p>
              <span className="mt-8 flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors group-hover:text-blue-700">
                {t.contact.linkedinGo}
                <ArrowUpRight aria-hidden className="size-3.5" />
              </span>
            </a>
          </Reveal>

          <Reveal delay={80}>
            <a
              href={`mailto:${EMAIL}`}
              className="group flex h-full flex-col border border-line p-8 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-[0_12px_32px_-16px_rgba(10,16,32,0.18)]"
            >
              <span className="flex size-11 items-center justify-center border border-line bg-paper-soft text-ink-700">
                <Mail aria-hidden className="size-5" />
              </span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-ink-950">{t.contact.emailLabel}</h3>
              <p className="mt-2 flex-1 text-base leading-relaxed text-ink-500">{EMAIL}</p>
              <span className="mt-8 flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors group-hover:text-blue-700">
                {t.contact.emailGo}
                <ArrowRight aria-hidden className="size-3.5" />
              </span>
            </a>
          </Reveal>
        </div>
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
        <Channels t={t} />
      </main>
      <SiteFooter t={t} />
    </>
  );
}
