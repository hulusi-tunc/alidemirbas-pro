import Image from "next/image";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { Section } from "@/components/ui/Section";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import { copy, type Lang } from "@/lib/content";
import { resolveLogo, stackGroups, type Tool } from "@/lib/stack";

/* Stack page — PORTRAIT PILOT (PORTRAIT-DESIGN-SOURCE-AUDIT.md is this
   round's source of truth, same as the approved Contact pilot; the tokens/
   patterns established there are LOCKED and reused here verbatim, not
   reinvented — see the per-section comments for exactly which).

   The tool list itself (`stackGroups`) is unchanged — same real data,
   same groups, same tags, ported from the cv repo as before. Only the
   presentation layer changed.

   LOGOS RESTORED (per explicit later request, reversing the note that
   used to live here): every tool card now carries its real favicon again
   via the same `resolveLogo(tool)` helper `StackShowcase.tsx` (Home) has
   used all along — same real 36-tool data, mostly the same Google favicon
   service, no new fetch mechanism (one exception: Data Studio, see
   stack.ts's own comment on why it carries a direct `logo` override
   instead of a derived-from-domain one). Presented as a 2-column card
   grid (icon tile + name + tag), matching a user-supplied reference
   layout, rather than the plain text rows this page used in between. */

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
      <PortraitContainer>
        {/* Centered per this round's site-wide request ("tüm başlıkları
            ortala") - was left-aligned (`max-w-md`, no `mx-auto`). */}
        <Reveal className="mx-auto max-w-2xl text-center">
          {/* Plain case, not the mono-uppercase `.altor-eyebrow` rail. That
              micro-label was retired from the calculator family in the
              2026-08-30 pass ("uppercase + small" reads as a lock-up, not
              as a label) and this page follows the same rule. */}
          <p className="mb-4 text-[13px] font-medium text-ink-400">{t.stack.eyebrow}</p>
          {/* text-h1: the site's one page-title step (THE HEADING RAMP in globals.css)
              - not a page-specific variant. */}
          <h1 className="text-h1 text-ink-950">{t.stack.title}</h1>
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

/* ONE TINT PER CATEGORY, keyed by the real group title in stack.ts - the
   same system the calculator library already runs (`CATEGORY_TINT` in
   ui/CalculatorLibrary.tsx), extended here so the two pages read as one
   design rather than two.

   Why colour is the right lever on this page: 40 tools in 8 groups were
   rendering as 40 identical cards down 4,200px, so the only thing telling
   a reader they had moved from Analytics to CRM was a heading they had
   already scrolled past. The tint gives each group its own zone, which is
   a real job (semantic distinction), not decoration.

   The ground is the `-50` step, not the `-100` the calculators use on
   their small round tiles: this is a full card, and at `-100` eight of
   them stacked read as a paint chart. The logo tile stays WHITE on every
   tint, because the logos carry real brand colour of their own and a
   tinted plate underneath fights them.

   Both classes are written out in full. Tailwind scans source for literal
   class strings, so deriving the dot from the ground at runtime (a
   `.replace("-50", "-400")`) would compile to nothing - the utility never
   appears literally anywhere for the scanner to find. */
const GROUP_TINT: Record<string, { card: string; dot: string }> = {
  "Design & Build": { card: "bg-fuchsia-50", dot: "bg-fuchsia-400" },
  "Web & Product Analytics": { card: "bg-blue-50", dot: "bg-blue-400" },
  "Mobile / Attribution (MMP)": { card: "bg-violet-50", dot: "bg-violet-400" },
  "BI / Data Visualization": { card: "bg-emerald-50", dot: "bg-emerald-400" },
  "CRM & Engagement": { card: "bg-teal-50", dot: "bg-teal-400" },
  "SEO & Content": { card: "bg-amber-50", dot: "bg-amber-400" },
  "CRO / A-B Test / Experimentation": { card: "bg-rose-50", dot: "bg-rose-400" },
  "Work Management": { card: "bg-slate-100", dot: "bg-slate-400" },
};

const FALLBACK_TINT = { card: "bg-paper-soft", dot: "bg-ink-300" };

/* Soft fill, no stroke - the surface pattern the 2026-08-30 style pass made
   site-wide, and the same one the calculator cards use. The card was white
   with a `line-soft` border; the tint now does the separating, and the logo
   tile flips to white so it still reads as a plate on top rather than
   dissolving into its own card. */
function ToolCard({ name, tool, tag, tint }: { name: string; tool: Tool; tag: string; tint: string }) {
  return (
    <div className={`flex items-center gap-4 rounded-card p-5 ${tint}`}>
      {/* Real favicon, same `resolveLogo(tool)` helper/domain-per-tool data
          `StackShowcase.tsx` already uses on Home - not re-fetched or
          re-derived here. `alt=""`: decorative next to the tool's own
          visible name right beside it (unlike Home's grid, where the
          logo is the ONLY label on a bare tile and needs its own alt). */}
      <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-paper">
        <Image src={resolveLogo(tool)} alt="" fill sizes="56px" className="object-contain p-3" />
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
          {stackGroups.map((group, gi) => {
            const tint = GROUP_TINT[group.title.en] ?? FALLBACK_TINT;
            return (
            <Reveal key={group.title.en} delay={gi * 40}>
              {/* A real subhead, at the same size and weight the calculator
                  pages give theirs (`EditorialColumn`). It was a 12px
                  muted uppercase label, which under-set a genuine section
                  heading and used the retired micro-label pattern.

                  The dot repeats the group's own tint at full strength, so
                  the heading and the cards under it are visibly one zone -
                  the tint at `-50` is quiet by design, and this is what
                  makes it legible as a system rather than as eight
                  slightly different whites. */}
              <h2 className="flex items-center gap-2.5 text-lg font-semibold text-ink-950">
                <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${tint.dot}`} />
                {group.title[lang]}
              </h2>
              {/* 2-column card grid at sm+ (matches the reference), 1
                  column on mobile. A lone-tool category (e.g. "CRO / A-B
                  Test / Experimentation") simply renders one card. */}
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {group.tools.map((tool) => (
                  <ToolCard key={tool.name} name={tool.name} tool={tool} tag={tool.tag[lang]} tint={tint.card} />
                ))}
              </div>
            </Reveal>
            );
          })}
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
