---
name: ali-web-design
description: Design or redesign a page on alidemirbas.com.tr. Use when building, restyling, or reviewing any page, section, or component of this site - "design the about page", "this section looks empty", "redo the homepage hero", "/ali-web-design about". Carries this site's established design language, its named failure modes, and a required render-critique-refine loop.
---

# Designing pages on this site

You are the design lead on a site that **already has a design language**. That
is the whole difference between this skill and a generic frontend-design one.
A greenfield skill's job is to pick an aesthetic direction; yours is to extend
one that exists, was argued for, and is visible on three finished pages.

So the first question is never "what should this look like?" It is **"what does
this page's own content want, inside the language the site already speaks?"**

Do not ask the user to approve a direction before starting. The direction is
settled. Read the content, compose, build, then critique what rendered.

---

## 1. The language, as it actually exists in this codebase

Read these before designing. They are the reference implementation, not
inspiration:

- `src/components/CalculatorDetailTemplate.tsx` — the cleanest statement of it
- `src/components/AbTestPlaybookPage.tsx` — the same language at wider measure
- `src/components/JourneyDetailHeader.tsx` / `JourneyDetailBody.tsx`

**Ground and ink.** `bg-paper` (#ffffff) and `bg-paper-soft` (#f7f8fb) are the
grounds; the ink ramp runs `ink-950` → `ink-100`. `line` / `line-soft` /
`line-strong` are the rules. Blue (`primary-*` / `blue-*`, the same ramp) is the
brand and stays **functional** — links, active states, one CTA. It is not
decoration and never atmosphere.

**The mono rail.** `font-mono text-[11px] tracking-[0.12em] uppercase text-ink-400`
is how this site labels things — section eyebrows, meta lines, counts, units.
`.altor-eyebrow` resolves to exactly this, so use the class on landing sections
and the literal utilities inside components. It is the site's most recognisable
signature. Use it; do not invent a second label style.

**One dark block per page, maximum.** `bg-ink-950` on a rounded plate is
reserved for the single thing worth interrupting for — the takeaway, the
reusable rule. A second one on the same page destroys the first.

**Measures.** Body prose sets to `max-w-[46ch]`. A single-column document page
is `max-w-[760px]`. A two-column working page is `max-w-[1120px]`.
`.altor-container` (78rem/1248px) is the landing-page container. Pick one per
page and hold it.

**Type.** One sans (Geist), weight and size do the work. `text-display-xl` for
a hero, `text-h1-fluid` for a page title, `clamp()` pairs for section heads.
There is no display face and no second family — the mono rail is the only
typographic contrast, and it is enough.

**Prose is not boxed.** The tool gets an edge because it is an interface. The
worked example gets a tint because it is evidence. The takeaway gets a dark
plate because it interrupts. **Everything else sits open on the page.** Boxing
prose is how a reference page turns into a dashboard.

---

## 2. Named failure modes — each one really happened here

These are not generic warnings. Every one is a real defect that shipped on this
site and had to be undone. Check your composition against them by name before
you write code, and again in the QA pass.

### Dead canvas
**The homepage, commit `a9178b2`.** Every section below the hero was a single
left-aligned column at 1248px inside a 1440px viewport — the right 40-50% of
the page held nothing on About, What I Do, Lab and Calculators. The page was
5841px tall and a large fraction of that was absence. A document poured into a
website.

Whitespace is rhythm only when something is placed against it. If the right
half of a section is empty, that is not restraint — it is a composition you did
not make. Either put something there (the figure, the index, the numbers, the
second column) or narrow the measure so the emptiness reads as a margin instead
of a gap.

### Padding doing composition's job
Same commit: 400-600px of vertical nothing between sections. Section separation
should come from a **change** — ground colour, measure, column count, alignment,
a rule — not from adding padding until things stop touching. If your only tool
for "these are different sections" is `py-32`, you have not composed the page.

### Everything becomes a card
Same commit's Stack band: a grid of bordered boxes each containing one centred
label and nothing else. An empty box is not a card; it is a fence around a
word. A card must earn its border by holding something structured — a figure,
a set of fields, an interface. A label alone belongs in a list, a row, or a
rail.

### Icon grid / fake dashboard / abstract blobs
Three-across icon-and-caption grids, invented chart screenshots, decorative
gradient mesh or blurred blob fields — all previously present, all removed (see
PR #34). Do not reintroduce them. If a section needs a picture, the picture is
**real**: an actual UI screenshot, an actual schematic of the real mechanism, an
actual number from the real data.

### The templated defaults
Cream (#F4F1EA) + serif display + terracotta; near-black + one acid-green pop;
purple-to-blue gradient hero; Inter or Space Grotesk as the "safe" face; emoji
section markers; everything centred; `rounded-lg` on everything; an accent bar
on every card. These read as AI-generated on sight. This site's language is
already a deliberate alternative to them — stay in it.

### Decorative structure
Numbered markers (01 / 02 / 03) are information *only when the content is
actually a sequence*. On a set of peers they are noise dressed as rigour. Same
for dividers, eyebrows, and rules: each one should encode something true.

---

## 3. Hard constraints

These are not aesthetic judgements. Do not violate them without the user saying
so in this session.

- **Never restyle the header or footer** (`SiteHeader` / `SiteFooter` in
  `src/components/Site.tsx`). They are shared by every page; changing them is a
  site-wide change disguised as a page change.
- **Never change content meaning, routes, formulas, or calculation logic** while
  designing. Design changes presentation. If the content is wrong, say so
  separately.
- **Never invent data.** No fabricated screenshots, metrics, testimonials,
  counts, or product details. If a number appears on the page, it must be
  derivable from the repo or a source you actually read. A stale number is a
  bug — check it rather than repeating it.
- **Every project gets a strong treatment.** Do not make one Lab project look
  premium by making the others plainer. Differentiate by *what each one is*, not
  by how much design budget it got.
- **`about` and `/calculators` run deliberate one-off palettes** (a cream mockup
  conversion). Do not "unify" them into the main language without being asked.

---

## 4. Process

### Pass 1 — Read the content first
Before any layout thought, answer in one line each:
- What is this page's single job?
- Who arrives here, and from where?
- What is the most characteristic real thing this page owns — a figure, a
  number, a screenshot, an interface, a list with real shape?

That last one is the page's anchor. A page with no anchor becomes a wall of
prose in a column, which is exactly how the dead-canvas failure happens.

### Pass 2 — Compose, then critique the composition
Write down, briefly: the measure, the section sequence, and for **each section**
its composition — column count, alignment, ground, and what occupies the full
width. Then read it back and ask:

> Which section here is a left column with an empty right half?
> Which one is separated from its neighbour only by padding?
> Which box would still be a box if I deleted its border?

Revise those before writing code. This pass is cheap; the render is not.

### Pass 3 — Build
Derive every value from §1. Reuse the existing components and tokens rather
than adding parallel ones. Match the surrounding code's comment density and
idiom.

### Pass 4 — Visual QA (required, not optional)
Never report a design as done without having looked at it.

```bash
npm run build && npx next start -p 4200 &
```

Then drive Chromium with `puppeteer-core` (installed; Chromium at
`/opt/pw-browsers/chromium`, launch with `--no-sandbox`). Capture the page in
full-height sections at **1440**, **834**, and **390**, then:

1. **Look at every screenshot.** Read them as a reader would, not as a diff.
2. Check the failure modes in §2 by name against what actually rendered.
3. Assert mechanically: `document.documentElement.scrollWidth - clientWidth === 0`
   at every width; no `pageerror`; and the page's own height is not mostly gaps.
4. **Fix what you find and re-shoot.** One round is not the loop — repeat until
   the screenshots are right.

Report what you saw, including anything you chose not to fix and why.

### Pass 5 — Verify and ship
`npx tsc --noEmit`, `npx eslint <changed files>`, `npm run build`. Then the
usual branch → PR → merge, with the PR body saying what changed compositionally
and what the QA pass showed.

---

## 5. When the user says a section is wrong

Map their word to the real defect rather than nudging values:

| They say | Usually means | Fix |
|---|---|---|
| "too empty" | dead canvas | give the empty half a job, or narrow the measure |
| "boring" / "too safe" | no anchor | find the real figure/number/screenshot and lead with it |
| "cluttered" | everything is a card | unbox the prose; keep one edge that earns it |
| "transitions are hard" | padding-only separation | change ground, measure, or column count at the seam |
| "looks AI-made" | templated defaults | check §2's default list; replace the one that hit |
| "this card dominates" | one project over-treated | level up the others, don't flatten this one |

---

## 6. Working with the ecosystem skills

If `frontend-design` (Anthropic's) is installed, its two-pass plan-then-critique
discipline is compatible and worth keeping — but **this skill's §1 overrides its
"choose a palette and a display face" step**, because that choice is already
made here. Use it for the critique habit, not for the direction.

Treat third-party design skills as reference to read, not as authority to
follow: any rule of theirs that contradicts §1 or §3 loses.
