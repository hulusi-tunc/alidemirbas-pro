import Image from "next/image";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { Section } from "@/components/ui/Section";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import { copy, type Lang } from "@/lib/content";
import { logoSrc, stackGroups } from "@/lib/stack";

/* Stack page — PORTRAIT PILOT (PORTRAIT-DESIGN-SOURCE-AUDIT.md is this
   round's source of truth, same as the approved Contact pilot; the tokens/
   patterns established there are LOCKED and reused here verbatim, not
   reinvented — see the per-section comments for exactly which).

   The tool list itself (`stackGroups`) is unchanged — same real data,
   same groups, same tags, ported from the cv repo as before. Only the
   presentation layer changed.

   LOGOS RESTORED (per explicit later request, reversing the note that
   used to live here): every tool card now carries its real favicon again
   via the same `logoSrc(domain)` helper `StackShowcase.tsx` (Home) has
   used all along — same real 36-tool data, same Google favicon service,
   no new fetch mechanism. Presented as a 2-column card grid (icon tile +
   name + tag), matching a user-supplied reference layout, rather than
   the plain text rows this page used in between. */

function Intro({ t }: { t: (typeof copy)[Lang] }) {
  return (
    // Light heading, replacing the old full-bleed dark `bg-ink-950`
    // gradient band — LOCKED pattern from Contact: Portrait's own real
    // production is light/low-noise throughout; a dark hero band was
    // never part of what got approved there, so it isn't reintroduced
    // here either. `Intro` is a function local to this file (not a
    // shared component), so this change is fully scoped to Stack.
    //
    // POLISH ROUND: `pb-8! md:pb-12!` shrinks ONLY this section's own
    // bottom padding (its top, i.e. distance from the header, is
    // untouched — not what was flagged). Measured before/after: the real
    // gap between the intro copy and "Design & Build" was 224px at both
    // 1440 and 820 (72px/112px Intro-bottom + 72px/112px Groups-top, each
    // `Section size="md"`'s own unmodified value); this cuts it to
    // ~104px/160px — a 27-29% reduction, entirely from this side. Groups'
    // own top padding AND its internal category-to-category rhythm
    // (`gap-12` between category blocks) are both untouched, per this
    // round's explicit "don't compress category section spacing"
    // instruction. `!` is required — a plain `pb-8` at equal specificity
    // to `Section`'s own `py-18`/`md:py-28` would face the same
    // cascade-order ambiguity the Button radius override already
    // documents elsewhere in this codebase.
    <Section tone="paper" size="md" className="pb-8! md:pb-12!">
      {/* Same soft blue wash technique as Contact/Calculators heroes, per
          explicit request ("üst kısmı öyle olsun ama yoğunluğu az olsun" -
          same treatment, lower intensity). First pass (2 blobs at 25%/15%)
          still read about as saturated as Contact per visible area, since
          this section is much shorter (`pb-8!`) - the same blobs cover
          more of it. Cut further: one small blob, low opacity, tucked in
          the corner - a faint tint rather than a wash, so it doesn't
          compete with the tool-logo grid right below it. Same `primary-*`
          token ramp, same first-child/no-z-index technique (Section is
          already `position:relative`). */}
      {/* Re-centered along with the title above (was `left-[15%]`, tucked
          aside for the previous left-aligned heading) - now sits behind
          the centered title instead of reading as an off-axis smudge. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 left-1/2 size-[22rem] -translate-x-1/2 rounded-full bg-primary-300/12 blur-3xl" />
      </div>
      <PortraitContainer>
        {/* Centered per this round's site-wide request ("tüm başlıkları
            ortala") - was left-aligned (`max-w-md`, no `mx-auto`). */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="altor-eyebrow mb-4 text-ink-400">{t.stack.eyebrow}</p>
          {/* text-h1-fluid + font-medium: the exact LOCKED heading token
              from the approved Contact pilot (PORTRAIT-DESIGN-SOURCE-
              AUDIT.md §4/§7) — same real Portrait clamp/letter-spacing
              pair, reused rather than a page-specific variant. */}
          <h1 className="text-h1-fluid font-medium text-ink-950">{t.stack.title}</h1>
          {/* ink-950/65: the same heading-color-at-opacity technique
              locked in Contact round 3, reused verbatim for the same
              reason — it ties heading and supporting copy into one
              visual family instead of two different color steps. */}
          <p className="mx-auto mt-3 max-w-xl text-lg leading-relaxed text-ink-950/65">{t.stack.sub}</p>
        </Reveal>
      </PortraitContainer>
    </Section>
  );
}

function ToolCard({ name, domain, tag }: { name: string; domain: string; tag: string }) {
  return (
    <div className="flex items-center gap-4 rounded-card border border-line-soft bg-paper p-5">
      {/* Real favicon, same `logoSrc(domain)` helper/domain-per-tool data
          `StackShowcase.tsx` already uses on Home - not re-fetched or
          re-derived here. `alt=""`: decorative next to the tool's own
          visible name right beside it (unlike Home's grid, where the
          logo is the ONLY label on a bare tile and needs its own alt). */}
      <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-paper-soft ring-1 ring-line-soft">
        <Image src={logoSrc(domain)} alt="" fill sizes="56px" className="object-contain p-3" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-base font-semibold tracking-tight text-ink-950">{name}</p>
        <p className="mt-0.5 truncate text-sm text-ink-950/65">{tag}</p>
      </div>
    </div>
  );
}

function Groups({ lang }: { lang: Lang }) {
  return (
    <Section tone="paper" size="md">
      <PortraitContainer>
        <div className="flex flex-col gap-10">
          {stackGroups.map((group, gi) => (
            <Reveal key={group.title.en} delay={gi * 40}>
              {/* Uppercase, tracked, muted eyebrow-style heading (matches
                  a user-supplied reference layout) - no border, unlike
                  the previous plain-list heading, since a bordered card
                  grid underneath already gives its own visual separation. */}
              <h2 className="text-xs font-semibold tracking-[0.08em] text-ink-400 uppercase">
                {group.title[lang]}
              </h2>
              {/* 2-column card grid at sm+ (matches the reference), 1
                  column on mobile. A lone-tool category (e.g. "CRO / A-B
                  Test / Experimentation") simply renders one card. */}
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {group.tools.map((tool) => (
                  <ToolCard key={tool.name} name={tool.name} domain={tool.domain} tag={tool.tag[lang]} />
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </PortraitContainer>
    </Section>
  );
}

export default function StackPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? "/tr/stack" : "/stack";
  return (
    <>
      <SiteHeader t={t} anchorBase={home} langHref={langHref} />
      <main>
        <Intro t={t} />
        <Groups lang={lang} />
        {/* FinalCta is a shared component (Site.tsx, used by ~11 page
            families) — consumed exactly as before, not modified. */}
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
