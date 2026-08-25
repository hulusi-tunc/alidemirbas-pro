import Image from "next/image";
import Link from "next/link";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { Section } from "@/components/ui/Section";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import { copy, type Lang } from "@/lib/content";

/* About page — PORTRAIT PILOT, continuing the locked visual system from
   Contact/Stack/Blog/Lab/Calculators (PORTRAIT-DESIGN-SOURCE-AUDIT.md
   remains this round's source of truth).

   CONTENT AUDIT (done before any redesign, per this round's own
   instruction) — everything below is REPOSITIONED existing content.ts
   copy, not invented. See this round's own report for the full
   before/after list; summarized here at the point each decision is made:

   - HERO H1: `content.ts`'s own `about.title` ("Professional Profile" /
     "Profesyonel Profil") is the kind of generic headline this round's
     own brief explicitly asks not to default to. The strongest EXISTING
     positioning line already on this page is `about.sub` ("Digital
     Marketing · Analytics · Growth Strategy") — already real, already
     used as this page's own metaDesc — promoted to the H1 role here;
     `about.title` is retired from display (not deleted from content.ts,
     which this file does not touch).
   - HERO SUPPORTING COPY: `about.lead`, verbatim, unchanged.
   - "What I work on": `DOMAINS` below are not invented — each label is
     lifted directly from words already in the real timeline job titles
     and `about.body` (see that constant's own comment for the exact
     source phrase per label).
   - EXPERIENCE: `about.timeline` — every company, role, period and
     description is unchanged, same discriminated union
     (single/group) AboutPage.tsx already used. Only the per-row COMPANY
     LOGO images are dropped (see `TimelineEntry`'s own comment) — the
     company name itself (`item.co`) is real text, unchanged, still
     shown.
   - LAB BRIDGE: `BRIDGE` below is new, short editorial copy this
     round's own brief explicitly asked for ("a restrained link toward
     Lab is appropriate") — not a biographical claim, just a transition
     sentence connecting real, already-shipped Lab projects to this
     person's real growth/lifecycle work. Kept local to this file, same
     as Stack/Blog/Lab's own local UI-copy objects — content.ts's `about`
     object is not touched. */

type Timeline = (typeof copy)["en"]["about"]["timeline"];
type Entry = Timeline[number];

const DOMAINS = {
  // Each label is a real word/phrase already present in this page's own
  // content.ts data - not a separately-authored skills list:
  //   Growth            -> appears in 3 of 6 real job titles
  //   Lifecycle & CRM    -> "Lifecycle Marketing Specialist" x2, "CRM
  //                        Analytics Executive" (real titles)
  //   Analytics          -> about.body: "My experience spans analytics..."
  //   Acquisition        -> about.body: "...user acquisition..."
  //   Mobile Growth      -> Aksigorta's real title: "Mobile App Growth Lead"
  //   Digital Marketing  -> Albayrak/Doğuş Oto's real titles: "Digital
  //                        Marketing Specialist"
  en: ["Growth", "Lifecycle & CRM", "Analytics", "Acquisition", "Mobile Growth", "Digital Marketing"],
  tr: ["Büyüme", "Yaşam Döngüsü ve CRM", "Analitik", "Kullanıcı Kazanımı", "Mobil Büyüme", "Dijital Pazarlama"],
} as const;

const T = {
  en: {
    workOn: "What I work on",
    bridgeText: "The Lab has the open-source tools and experiments built out of this work.",
    bridgeLink: "Explore the Lab",
    labHref: "/lab",
  },
  tr: {
    workOn: "Üzerinde çalıştıklarım",
    bridgeText: "Lab'de bu çalışmalardan doğan açık kaynak araçlar ve deneyler var.",
    bridgeLink: "Lab'i keşfet",
    labHref: "/tr/lab",
  },
} as const;

// Ties a middle dot to the word BEFORE it with a non-breaking space, so a
// line-wrap can never strand "·" alone at the start of a line - the text
// itself (`about.sub`) is untouched, only where the browser is allowed to
// break it.
function withNbspDots(s: string) {
  return s.replace(/ · /g, " · ");
}

function Intro({ t }: { t: (typeof copy)[Lang] }) {
  return (
    // Light, open composition — same LOCKED reasoning as every other
    // Portrait-pilot page. `pb-14!`/`md:pb-13!`: the tightened
    // hero-to-content rhythm the Stack/Blog/Lab polish rounds converged
    // on, applied from the start this round.
    <Section tone="paper" size="md" className="pb-14! md:pb-13!">
      <PortraitContainer>
        <Reveal>
          <p className="altor-eyebrow mb-4 text-ink-400">{t.about.eyebrow}</p>
          {/* H1 = the repositioned `about.sub` — see this file's own top
              comment for the reasoning. */}
          <h1 className="max-w-md text-h1-fluid font-medium text-ink-950">{withNbspDots(t.about.sub)}</h1>
          <p className="mt-3 max-w-md text-lg leading-relaxed text-ink-950/65">{t.about.lead}</p>
        </Reveal>
      </PortraitContainer>
    </Section>
  );
}

function WorkOn({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const domains = DOMAINS[lang];
  return (
    // `md:pt-13!` pairs with Intro's own `md:pb-13!` above.
    <Section tone="paper" size="md" className="md:pt-13!">
      <PortraitContainer>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="max-w-xl text-lg leading-relaxed text-ink-950/65">{t.about.body}</p>
            </Reveal>
            <Reveal delay={90} className="mt-10">
              <p className="altor-eyebrow mb-4 text-ink-400">{T[lang].workOn}</p>
              {/* Plain text list, divided by rules, not pills/icon cards -
                  per this round's own "avoid skill cards, icon clouds"
                  instruction. */}
              <ul className="flex flex-wrap">
                {domains.map((d, i) => (
                  <li
                    key={d}
                    className={`border-line-soft py-1 text-sm font-medium text-ink-950 ${i === 0 ? "pr-6" : "border-l px-6 last:pr-0"}`}
                  >
                    {d}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* Real, already-used personal photo (also the home hero's
              portrait plate) - restyled to the locked Portrait surface
              grammar (`rounded-card`, `ring-line-soft`) rather than the
              old offset-frame + blue-tint treatment. Not added because
              "this is an About page" - it already existed and is kept
              because a real, restrained personal photo genuinely serves
              this page's own "personal but restrained" goal; grayscale
              is kept (an editorial choice, not the old tint effect). */}
          <Reveal delay={140}>
            <div className="mx-auto w-full max-w-sm overflow-hidden rounded-card ring-1 ring-line-soft">
              <div className="relative aspect-4/5">
                <Image
                  src="/portrait.jpg"
                  alt="Ali Demirbaş"
                  fill
                  sizes="(min-width: 1024px) 24rem, (min-width: 640px) 20rem, 90vw"
                  className="object-cover grayscale"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </PortraitContainer>
    </Section>
  );
}

const rowClass = "flex flex-col gap-1 border-t border-line-soft py-6 first:border-t-0 first:pt-0 md:flex-row md:gap-6";

function TimelineEntry({ item }: { item: Entry }) {
  // Company logos DROPPED here (see this file's own top comment) - the
  // company name is real text (`item.co`), unchanged, still shown; only
  // the decorative per-row image is gone, matching Stack's own
  // established "text carries the identity" precedent.
  if (item.kind === "group") {
    return (
      <div className={rowClass}>
        <span className="shrink-0 text-sm text-ink-950/65 tabular-nums md:w-16">{item.year}</span>
        <div>
          <h3 className="text-base font-medium tracking-tight text-ink-950">{item.co}</h3>
          <p className="mt-0.5 text-sm text-ink-950/65">{item.span}</p>
          <div className="mt-4 flex flex-col gap-4 border-l border-line-soft pl-6">
            {item.roles.map((r) => (
              <div key={r.role}>
                <h4 className="text-sm font-medium tracking-tight text-ink-950">{r.role}</h4>
                <p className="mt-0.5 text-xs text-ink-950/65 tabular-nums">{r.period}</p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-950/65">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={rowClass}>
      <span className="shrink-0 text-sm text-ink-950/65 tabular-nums md:w-16">{item.year}</span>
      <div>
        <h3 className="text-base font-medium tracking-tight text-ink-950">{item.role}</h3>
        <p className="mt-0.5 text-sm text-ink-950/65">
          {item.co} <span aria-hidden>·</span> <span className="tabular-nums">{item.period}</span>
        </p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-950/65">{item.desc}</p>
      </div>
    </div>
  );
}

function Experience({ t }: { t: (typeof copy)[Lang] }) {
  const timeline = t.about.timeline as Timeline;
  const lang = t === copy.en ? "en" : "tr";
  return (
    <Section id="experience" tone="soft" size="md">
      <PortraitContainer>
        <h2 className="text-h2-fluid font-medium text-ink-950">{t.about.experience}</h2>
        <div className="mt-8">
          {timeline.map((item, i) => (
            <Reveal key={item.co + item.year} delay={i * 50}>
              <TimelineEntry item={item} />
            </Reveal>
          ))}
        </div>

        {/* Building/Lab bridge - see this file's own top comment. */}
        <Reveal delay={timeline.length * 50}>
          <p className="mt-10 max-w-xl border-t border-line-soft pt-8 text-sm leading-relaxed text-ink-950/65">
            {T[lang].bridgeText}{" "}
            <Link
              href={T[lang].labHref}
              className="font-medium text-ink-900 underline decoration-line-soft underline-offset-4 transition-colors hover:text-ink-600"
            >
              {T[lang].bridgeLink}
            </Link>
          </p>
        </Reveal>
      </PortraitContainer>
    </Section>
  );
}

export default function AboutPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? "/tr/about" : "/about";
  return (
    <>
      <SiteHeader t={t} anchorBase={home} langHref={langHref} />
      <main>
        <Intro t={t} />
        <WorkOn t={t} lang={lang} />
        <Experience t={t} />
        {/* FinalCta is a shared component (Site.tsx, ~11 page families) —
            consumed exactly as before, not modified. */}
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
