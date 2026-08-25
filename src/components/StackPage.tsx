import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { Section } from "@/components/ui/Section";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import { copy, type Lang } from "@/lib/content";
import { stackGroups } from "@/lib/stack";

/* Stack page — PORTRAIT PILOT (PORTRAIT-DESIGN-SOURCE-AUDIT.md is this
   round's source of truth, same as the approved Contact pilot; the tokens/
   patterns established there are LOCKED and reused here verbatim, not
   reinvented — see the per-section comments for exactly which).

   The tool list itself (`stackGroups`) is unchanged — same real data,
   same groups, same tags, ported from the cv repo as before. Only the
   presentation layer changed.

   STRUCTURAL DECISION — logos dropped: every tool tile used to carry a
   small favicon image fetched from Google's favicon service
   (`logoSrc(domain)`). Kept for the HOME PAGE'S `StackShowcase.tsx`
   (unchanged — Home is out of scope this round) but DROPPED here: the
   brief's own explicit goal is "highly scannable, professional... without
   turning into a logo wall," and 36 real tools across 8 categories with a
   third-party icon per row is closer to a logo wall than an inventory.
   The tool's NAME is its real identity; a fetched favicon was always
   decorative, never semantic content, so dropping it loses no real
   information and removes a real fragility (an external image request
   per row) besides.

   IA DECISION: category sections (real groups, unchanged) each holding a
   compact multi-column list of text-only rows (name + tag), not cards and
   not a bento grid — with 8 categories and a range of 1-7 tools each
   (see stack.ts), a card-per-tool layout would be far taller than useful
   and a bento grid (already used for the curated 8-tool HOME preview)
   would look arbitrary at 36 real, un-curated items. A dense, typographic
   list is what actually reads fast for a recruiter scanning tool names -
   closer to a well-set CV skills section (which is genuinely this
   content's origin) than a SaaS feature grid. */

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
      <PortraitContainer>
        <Reveal>
          <p className="altor-eyebrow mb-4 text-ink-400">{t.stack.eyebrow}</p>
          {/* text-h1-fluid + font-medium: the exact LOCKED heading token
              from the approved Contact pilot (PORTRAIT-DESIGN-SOURCE-
              AUDIT.md §4/§7) — same real Portrait clamp/letter-spacing
              pair, reused rather than a page-specific variant. */}
          <h1 className="max-w-md text-h1-fluid font-medium text-ink-950">{t.stack.title}</h1>
          {/* ink-950/65: the same heading-color-at-opacity technique
              locked in Contact round 3, reused verbatim for the same
              reason — it ties heading and supporting copy into one
              visual family instead of two different color steps. */}
          <p className="mt-3 max-w-md text-lg leading-relaxed text-ink-950/65">{t.stack.sub}</p>
        </Reveal>
      </PortraitContainer>
    </Section>
  );
}

function ToolRow({ name, tag }: { name: string; tag: string }) {
  return (
    <div>
      <p className="truncate text-sm font-medium text-ink-950">{name}</p>
      {/* POLISH ROUND: `text-[13px]` at base (mobile), reverting to the
          already-approved `text-xs` (12px) from `sm:` up — measured at
          exactly 12px computed at 375px, i.e. already at the stated
          floor rather than under it, but bumped 1px specifically on the
          smallest viewport for a safer readability margin, per this
          round's explicit "keep effective size >= ~11-12px" instruction.
          Name hierarchy (`text-sm` above) and line-height are untouched -
          no explicit line-height is set here, so it inherits the normal
          ratio rather than adopting a larger fixed value. */}
      <p className="mt-0.5 truncate text-[13px] sm:text-xs text-ink-950/65">{tag}</p>
    </div>
  );
}

function Groups({ lang }: { lang: Lang }) {
  return (
    <Section tone="paper" size="md">
      <PortraitContainer>
        <div className="flex flex-col gap-12">
          {stackGroups.map((group, gi) => (
            <Reveal key={group.title.en} delay={gi * 40}>
              {/* Category heading: a real wayfinding need across 8
                  distinct groups and 36 tools (unlike Contact's 3-item
                  reason list, where a divider read as an FAQ row and was
                  removed) — kept here, but on the LOCKED neutral-alpha
                  border token (`border-line-soft`) instead of the old
                  opaque `border-line`, and `font-medium` (Portrait's own
                  confirmed heading weight) instead of `font-semibold`. */}
              <h2 className="border-b border-line-soft pb-2 text-base font-medium tracking-tight text-ink-950">
                {group.title[lang]}
              </h2>
              {/* Compact multi-column row grid, not cards — see this
                  file's own top comment for the IA reasoning. Columns
                  step up with viewport width; a lone-tool category (e.g.
                  "CRO / A-B Test / Experimentation", 1 real tool) simply
                  renders one row without forcing decorative filler. */}
              <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.tools.map((tool) => (
                  <ToolRow key={tool.name} name={tool.name} tag={tool.tag[lang]} />
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
