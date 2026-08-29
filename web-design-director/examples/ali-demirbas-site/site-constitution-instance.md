# DESIGN.md instance — alidemirbas.com.tr

This is the filled-in `templates/DESIGN.md` for this project — moved here
from what used to be the entire content of the site's own design skill
prompt, so the generic engine and this project's specific answers stay in
separate files.

## Register

Site shell: PORTFOLIO/PERSONAL. Individual Lab project pages: PRODUCT
MARKETING. Calculator pages: UTILITY-interactive (registers.md's hybrid
rule — page register differs from shell register).

## Site constitution — Layer 1 (global)

**Ground and ink.** `bg-paper` (#ffffff) and `bg-paper-soft` (#f7f8fb) are
the grounds; the ink ramp runs `ink-950` → `ink-100`. `line` / `line-soft` /
`line-strong` are the rules. Blue (`primary-*` / `blue-*`, same ramp) is
the brand and stays functional — links, active states, one CTA. Not
decoration, never atmosphere.

**The mono rail.** `font-mono text-[11px] tracking-[0.12em] uppercase
text-ink-400` is how this site labels things — section eyebrows, meta
lines, counts, units. `.altor-eyebrow` resolves to exactly this. This
project's single most recognizable signature.

**One dark block per page, maximum.** `bg-ink-950` on a rounded plate is
reserved for the single thing worth interrupting for. A second one on the
same page destroys the first (composition-grammar.md move 8's overuse
failure, observed here directly).

**Measures.** Body prose sets to `max-w-[46ch]`. A single-column document
page is `max-w-[760px]`. A two-column working page is `max-w-[1120px]`.
`.altor-container` (78rem/1248px) is the landing-page container. One per
page, held.

**Type.** One sans (Geist); weight and size do the work. `text-display-xl`
for a hero, `text-h1-fluid` for a page title, `clamp()` pairs for section
heads. No display face, no second family — the mono rail is the only
typographic contrast, and it is enough.

**Prose is not boxed.** A tool gets an edge because it is an interface. A
worked example gets a tint because it is evidence. A takeaway gets a dark
plate because it interrupts. Everything else sits open on the page.

## Declared exceptions

`about` and `/calculators` run a deliberate one-off palette (a cream mockup
conversion, kept as-is rather than forced through the tokens above) — a
real, recorded exception under site-constitution.md's protocol, not a
constitution violation.

## Hard rules (never overridden by a page-level change)

- Never restyle the shared header/footer as part of a page-level change —
  they are shared by every page; changing them is a site-wide change
  disguised as a page change.
- Never fabricate data — no invented screenshots, metrics, testimonials,
  counts, or product details (anti-patterns.md #9, applied here without
  exception).
- Every Lab project gets a strong, differentiated treatment — never made
  premium by making others plainer; differentiated by what each one *is*,
  not by design budget spent.
