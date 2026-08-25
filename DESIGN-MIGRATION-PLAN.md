# Design Migration Plan — Mobbin-Derived Visual System

Presentation-layer only. No content, data, calculator logic, SEO metadata, canonical/production contracts, or search data are touched by anything in this document. Information architecture (routes, nav structure, page composition order) is unchanged — this is a re-skin, not a redesign of what the site does.

**Not implemented yet** — this is the audit + plan the brief asked for, nothing has been changed in code.

---

## 0. Methodology note (read this before the rest)

This session has no Mobbin MCP server connected (only Figma/Canva/Notion/Gamma/GitHub are available) and no gated access to Mobbin's 600K+ screen library or its specific e-commerce category — that limitation is real and unchanged. What changed: the user pasted the actual raw page source (HTML/CSS, Framer-built) of `mobbin.com/mcp` directly into this conversation, which is a materially better source than the marketing-page summary this section originally relied on. The values below (§1.2, §5) are now reverse-engineered from that real markup — real CSS custom properties, computed radii, font-face declarations, backdrop-filter values — not inferred from category-level familiarity with premium SaaS design. Superseding the earlier "not pixel-measured" framing for the specific facts listed below; still not a browse of Mobbin's actual e-commerce screen library, which remains inaccessible.

**Boundary held regardless of source quality** (per the brief's own core rule — reverse-engineer the system, don't clone the content): Mobbin's own brand typeface ("M Saans", a proprietary display face used site-wide on that page) is **not** adopted — this project keeps Geist. Mobbin's literal hex color values are **not** copied — this project keeps its own ink/neutral/primary palette. Mobbin's copy, illustrations, and logo treatments are **not** referenced at all. What IS taken from the real markup, because it's a structural/geometric pattern rather than a proprietary asset: the radius scale skewing larger and pill-shaped for buttons, the floating-inset nav-capsule pattern, the FAQ-as-individual-rounded-cards pattern, alpha-based (not fixed-gray) hairline borders, and the section-padding scale. These are exactly the category of "visual system" facts the brief asked for (sizing/weight relationships, border-radius system, nav treatment, card geometry) — not the branding/content the brief said to leave alone.

Real, extractable facts from the supplied page source:
- **Fonts**: "M Saans" (custom display family, weights 300/380/456/600/652/900) for headings/UI, Inter for body/fallback text, Geist Mono for code blocks. *Not adopted* — noted only to confirm the pattern "one distinctive display face + one neutral body face," which this project already satisfies with a single Geist family at multiple weights, so no second font is being introduced.
- **Radius**: 8px (buttons/badges — pre-pill), 12px (menu items), 16px (the modal card radius), 20px (larger image/media cards), 24px (large content blocks), 999px (pill buttons/badges/nav capsule). Real, concrete, and notably larger and more pill-leaning than this project's current 10px ceiling.
- **Buttons**: fully pill-shaped (`border-radius: 999px`), ~10–11px vertical / 16px horizontal padding, solid dark-fill primary + 1.5px-outline secondary variant. Confirms R3 below is a real, sourced tension, not a guess.
- **Navigation**: a floating, inset (not edge-to-edge) pill-shaped capsule (`border-radius: 28–30px`) with heavy backdrop blur (`backdrop-filter: blur(48px)`), sitting with margin from the viewport edge rather than a full-width bar.
- **Color**: near-black text (`rgb(20,20,20)`) on white, secondary text mid-gray (`rgb(113,113,113)`), borders as low-alpha black overlays (`rgba(64,64,64,0.06–0.16)`) rather than a fixed gray swatch — a real, generalizable pattern (alpha-based hairlines scale correctly across surfaces) worth adopting as a technique even though this project keeps its own actual color values.
- **FAQ**: rendered as individual rounded cards (16px radius, subtle alpha-gray fill) rather than a flat divided list — relevant to §4.1 below as a system-level cue, even though the Shuttle reference (not this page) governs the FAQ's actual accordion *structure/behavior* per the brief.
- **Motion**: spring-physics-based transitions (not fixed-duration ease curves) — noted, not adopted as a required change; this project's existing `--ease-out-soft`/duration-token system already satisfies "subtle and fast," and swapping to spring physics is a bigger behavioral change than this plan's scope, not a free consolidation.
- **Section spacing**: large, ~80–120px between major sections; content max-width in the ~1200–1262px range.
- **Numbered-step pattern**: the page's own "how it works" steps use circular numbered badges + a connecting line — this project's existing `InstallationStepper.tsx` already follows this exact pattern; a real, low-risk confirmation rather than a new requirement.

The existing codebase (audited below) is **already** most of the way toward the broader family this confirms — a real, computed token system (not ad hoc), a restrained ink/neutral/primary palette, a working radius/shadow/easing/duration scale, and Geist as a clean variable sans. This plan evolves that system to match the now-sourced reference language more precisely; it does not throw it out and start over.

---

## 1. Extracted design system (current state → target state)

### 1.1 Current state (audited directly from the repo, not assumed)

- **Stack**: Tailwind CSS v4, config-in-CSS (`src/app/globals.css`'s `@theme` block, no `tailwind.config.*` file). Single font: Geist (variable, `next/font/google`), loaded identically on both EN and TR root layouts.
- **Color**: a real, computed system — `neutral-*` (true grey, 0–1000), `ink-*` (navy-tinted text ramp, 100–950), `primary-*`/`blue-*` (OKLCH-generated brand blue, anchor `#154ce4`), plus `paper`/`paper-soft` surfaces and semantic aliases (`--color-line`, `--color-surface`, `--color-ink-muted`, etc.). >90% of actual color-class usage in the codebase draws from this system; a handful of stock Tailwind hues (emerald/amber/violet/red) are used only for feature-specific status indicators (journey category dots, copy-confirmation, danger states) — not brand color.
- **Radius**: a real, deliberately narrow scale — `xs` 4px, `sm` 6px, `md` 8px, `lg`+ all clamped to a 10px ceiling. `Button` explicitly opts OUT of radius (`rounded-none`, always square) — a deliberate brand choice, not an oversight.
- **Shadows/easing/duration**: already tokenized (`--shadow-hairline/card/card-hover/lift/blue`, `--ease-out-soft/spring/out-cubic`, `--duration-instant/fast/base/slow/fill/reveal`) — genuinely sophisticated, under-utilized rather than absent.
- **Spacing rhythm**: section-level vertical rhythm clusters at `py-24`/`py-32`/`md:py-36` (matching `Section.tsx`'s 3 padding tiers: sm=14/20, md=18/28, lg=24/36); component-internal spacing clusters small (4–16px). This is a real, consistent rhythm already.
- **Containers — a real inconsistency**: TWO container systems coexist. `.altor-container` (1248px max, used by nearly every existing page) and the newer `Container` component (1400px max, used only by the ported hero-hero primitives). This needs to converge to one during migration (see §8, risk R1).
- **Cards/badges/pills**: no dedicated component — every card/chip is ad hoc per-feature (`border border-line`, `rounded-lg`/`rounded-md`, `hover:border-ink-900`/`hover:border-neutral-400`, occasionally a shadow). This is the single biggest concrete gap versus a Mobbin-style card-forward system.
- **Navigation — two different treatments**: `SiteHeader` (absolute/transparent, floats over the dark hero, no persistent header once scrolled) on marketing pages; `LabShell` (sticky, slim, no footer) on data-browser pages (Journeys, AB-library). A real inconsistency (see §8, risk R2).
- **Motion**: `Reveal` (scroll fade+translateY), `HoverLift` (motion.div y-offset+scale), `PixelFill` (canvas hover-dissolve on buttons) — already present, already restrained. Good alignment with the reference family's "subtle, fast" motion philosophy.
- **Dark mode**: none. `color-scheme: light` is hardcoded; no `dark:` variants, no theme toggle, no `prefers-color-scheme` handling anywhere. The only "dark" concept is per-section `data-tone="dark"` (a fixed on-dark-background variant of specific components), not a site-wide mode. Not proposed for addition here (not requested) — noted as a constraint the token system should keep in mind (semantic tokens already lean that direction, which is good future-proofing, not immediate scope).

### 1.2 Target: what the Mobbin-family visual language asks for, applied to what exists

| Dimension | Reference-family characteristic | What changes here |
|---|---|---|
| Typography hierarchy | Confident but restrained scale; large display headline, clear step-down to section headings, body copy stays modest (15–17px) | Formalize the existing ad hoc clamp values (`text-display-xl`, the bespoke `SectionHeading` clamp, etc.) into a named, documented type scale (see §5) — mostly consolidation, not re-authoring |
| Card geometry | Larger radius than this site's current 10px ceiling — real sourced values: 16px (standard card), 20px (media/image card), 24px (large content block) | Raise the radius ceiling for card-class surfaces specifically (not global — Button's square identity is a brand choice, preserved, see §8 R3), introduce one `Card` primitive |
| Border usage | Hairline borders as the default separator, but alpha-based (`rgba(0,0,0,0.06–0.16)`) rather than a fixed gray swatch — scales correctly across different surface colors; shadow reserved for hover/elevation | This project already uses hairline borders as the dominant pattern (`border-line`, 96 occurrences) but as fixed color tokens, not alpha — worth evaluating an alpha-based line token as part of formalizing into the `Card` primitive, values unchanged |
| Background hierarchy | 2–3 flat surface levels (page bg, card bg, sunken/soft bg) — no gradients except restrained hero treatments | Already present (`paper`/`paper-soft`/`surface-sunken`) — keep as-is |
| Navigation treatment | Real sourced pattern: a floating, inset pill-shaped capsule (28–30px radius, not edge-to-edge), heavy backdrop blur (`blur(48px)`), margin from viewport edge | Converge `SiteHeader`/`LabShell` into one consistent sticky treatment (§8 R2) — the floating-capsule *pattern* is a real option to consider for the unified header, not mandatory; nav LINKS/structure unchanged either way |
| Button geometry | Real sourced value: fully pill-shaped, `border-radius: 999px`, ~10–11px/16px padding | Real, now-sourced tension with this site's deliberately-square Button — flagged as a decision point, not silently changed (§8 R3) |
| Icon treatment | Consistent single icon set, 1.5–2px stroke, sized to text | Already Lucide throughout at consistent sizes (`size-4`/`size-5`) — keep |
| Grid/responsive behavior | 12-column-equivalent behavior via CSS grid, 2–4 column card grids collapsing to 1 on mobile | Already the pattern in every grid component audited (`LabProjectGrid`, `CategoryCardGrid`, `RelatedGrid`, `BlogLibrary`'s results grid) — keep, formalize breakpoints |
| Whitespace/density | Generous section padding, moderate information density within cards | Already matches (`py-24`/`py-32` rhythm) — keep |
| Motion philosophy | Fast (150–250ms), ease-out, subtle (fade+8–16px translate, or scale 0.98→1) | Already matches (`--duration-fast` 140ms, `--duration-base` 220ms, `Reveal`'s 14px translateY) — keep, apply more consistently site-wide |

---

## 2. Page-family mapping

All 16 real page families (audited directly, not assumed) mapped to migration treatment. "Chrome" = which header/footer system.

| # | Family | Instances | Chrome (current) | Chrome (target) | Redesign scope |
|---|---|---|---|---|---|
| 1 | Home | 1 (+TR) | SiteHeader/Footer | Unified sticky header | Full — hero, teaser grid, CTA band |
| 2 | About | 1 (+TR) | SiteHeader/Footer | Unified sticky header | Full — dark intro band, bio, timeline |
| 3 | Stack | 1 (+TR) | SiteHeader/Footer | Unified sticky header | Full — intro band, tool-tile grid |
| 4 | Contact | 1 (+TR) | SiteHeader/Footer | Unified sticky header | Full — **Coda-mapped**, see §4 |
| 5 | Blog index | 1 (+TR) | SiteHeader/Footer | Unified sticky header | Full — **Anthropic-grid-mapped**, see §4 |
| 6 | Blog post detail | 5 (EN-only) | SiteHeader/Footer | Unified sticky header | Full — editorial article layout |
| 7 | Calculators index | 1 (+TR) | SiteHeader/Footer | Unified sticky header | Full — category card grid |
| 8 | Calculator detail | 43 (×2 langs) | SiteHeader/Footer | Unified sticky header | Full — hero, tool body (untouched logic), content block, related grid, **FAQ (Shuttle-mapped, see §4)** |
| 9 | Lab index | 1 (+TR) | SiteHeader/Footer | Unified sticky header | Full — intro band, project grid |
| 10 | AB-testing landing (plugin marketing) | 1 (+TR) | SiteHeader/Footer | Unified sticky header | Full — install steps, framework grid, FAQ (Shuttle-mapped) |
| 11 | AB-library index | 1 (+TR) | LabShell | Unified sticky header | Full — search + facet sidebar + result list |
| 12 | AB-test detail | 211 (×2 langs) | LabShell | Unified sticky header | Full — data-dense detail layout, no card/related pattern currently (kept absent — not this plan's call to add) |
| 13 | Journeys index | 1 (+TR) | LabShell | Unified sticky header | Full — search + 2 facet groups |
| 14 | Journey detail | 255 (×2 langs, dual full-page + modal) | LabShell / modal overlay | Unified sticky header / modal overlay | Full — **highest-risk family**, see §8 R4 |
| 15 | Dashboard-builder (Skill template) | 1 (+TR) | SiteHeader/Footer | Unified sticky header | Full — this IS the reusable template for future skill pages, migrate it first (see §7) |
| 16 | 404 | 1 (×2 langs) | None (deliberately bare) | Unchanged (bare) | Minimal — just token/type updates, no chrome (by design) |

---

## 3. Component mapping (reusable families → target primitives)

| Existing | Used on (traced) | Target primitive | Notes |
|---|---|---|---|
| `Site.tsx`: `SiteHeader`, `MobileNav`, `SiteFooter`, `FinalCta`, `Hero`, `AboutTeaser`, `Lab` (home teaser) | 11 families | Split into standalone `Header`, `Footer`, `MobileNav`, `CtaBand` primitives (currently bundled in one file) | Same nav links/hrefs, new sticky behavior + card-system-aware visual treatment |
| `Section.tsx`: `Section`, `SectionHeading` | nearly every page | Keep concept, extend `tone`/`size` variants to reference the new card/surface tokens | Low risk — already a clean abstraction |
| `Primitives.tsx`: `Container`, `EditorialGrid`, `SectionLabel` | hero-port only so far | Promote `Container` to THE site-wide container (resolves R1), roll out `EditorialGrid`/`SectionLabel` more broadly | See R1 |
| `Button.tsx`, `ButtonLink`, `PixelFill.tsx` | nearly every page | Keep component API, revisit only the `rounded-none` default (decision point, R3) | Interaction logic (`PixelFill` hover dissolve) preserved regardless of radius decision |
| `FaqAccordion.tsx` | Calculator detail, Dashboard-builder, AB-testing landing | Restyle only — **Shuttle-mapped**, see §4 | Structure (`<details>/<summary>`, no-JS) preserved |
| `BlogCard.tsx`, `BlogLibrary.tsx` | Blog index only | Restyle only — **Anthropic-grid-mapped**, see §4 | Structure already matches the reference almost exactly (see §4) |
| `CategoryCardGrid.tsx`, `RelatedGrid.tsx`, `LabProjectGrid.tsx` | Calculators index, Blog/Calculator/Dashboard-builder related-content, Home + Lab index | Consolidate into ONE `Card`/`CardGrid` primitive with variant props, replacing 3 near-duplicate ad hoc implementations | Real simplification opportunity, not just visual — same pattern (bordered box, hover state, link) implemented 3 times today |
| `Facets.tsx`: `FacetRadio`, `FacetCheckbox`, `FacetGroup` | AB-library, Journeys, Blog index | Restyle only — functional filter primitives, keep API | Used by 3 independent browsers; a single visual update here propagates everywhere |
| `InstallationStepper.tsx`, `CodeBlock`, `ToolSelectorCards` | Dashboard-builder only (today) | Restyle only, keep for reuse by future skill pages | |
| `ContactForm.tsx` | Contact only | Restyle + **add real visible labels** (currently placeholder-only, a real, worth-fixing accessibility gap surfaced during this audit) — **Coda-mapped**, see §4 | Fields/validation/mailto-fallback logic fully preserved |
| `CanonicalFlow.tsx`, `JourneyModal.tsx` | Journey detail only | Restyle carefully — see R4, this is the most structurally unique component on the site | |

---

## 4. Special-reference mapping

### 4.1 FAQ — Shuttle pricing-page accordion reference

**Note**: this reference wasn't re-supplied in this session's visible context (the brief calls it "previously supplied" — likely from an earlier conversation this session doesn't have). Mapping below is based on the brief's own description ("accordion structure and visual behavior") applied to what already exists.

- **Current**: `FaqAccordion.tsx` — native `<details>/<summary>` (zero-JS, real accessibility win, keep), flat list, `divide-y` hairline separators, chevron rotates on open.
- **Target**: restyle the summary row (larger click target, the new card-radius-aware hover state instead of a bare color change), keep the native-details mechanism — a JS-driven accordion would be a functional regression (loses free keyboard/AT support), not requested by the brief, not worth the risk.
- **Used on**: Calculator detail (43), Dashboard-builder (1), AB-testing landing (1) — one visual update propagates to all three.

### 4.2 Blog listing — Anthropic-style editorial grid reference

**Structural finding: this is nearly a pure re-skin, not a rebuild.** `BlogLibrary.tsx` already has every structural element the brief asks for:
- ✅ Left filter column (`FilterSidebar`, `lg:grid-cols-[13rem_1fr]`)
- ✅ Search (top row, icon-prefixed input)
- ✅ Grid/list switch (`Grid3x3`/`ListIcon` toggle buttons)
- ✅ Large cards with an image/illustration upper area (`BlogCard`'s grid variant: `aspect-[16/10]` image zone, generated gradient pattern placeholder)
- ✅ Metadata + title + category lower area (category chip + title + excerpt below the image)

What actually needs to change is purely visual: card radius/border treatment to match the new `Card` primitive, image-zone treatment (the current generated-gradient placeholder stays — no new illustration/branding asset is being introduced, consistent with "don't clone proprietary assets"), spacing/type scale alignment. **Zero structural rework needed.**

### 4.3 Contact form — Coda contact-form reference

- ✅ Split desktop composition (already `lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]` — intro column left, form right)
- ✅ Two-column fields where appropriate (name/email pair, company/subject pair)
- ✅ Full-width long field (message textarea)
- ✅ Compact primary CTA (`h-12` submit button)
- ✅ Legal/privacy-adjacent copy below CTA (`t.contact.formNote`, explaining the mailto-fallback honestly)
- ❌ **Real gap found**: fields currently use **placeholder text only, no visible labels above fields** — the brief explicitly asks for "labels above fields." This is worth fixing regardless of the redesign (placeholder-as-label is a known accessibility anti-pattern) — added to migration scope, not a new feature, a correction.

All form fields, the `required` validation, and the mailto-fallback submission logic (no backend exists — documented in the component's own comment) are preserved exactly; only field wrapper markup (add `<label>`) and visual styling change.

---

## 5. Proposed design tokens

Extending, not replacing, the existing `@theme` block in `globals.css`. Values marked **(new)** don't exist today; values marked **(keep)** are already correct and just need more consistent application.

### Typography
| Token | Value | Status |
|---|---|---|
| `--font-sans` | Geist (existing) | keep |
| `--text-display-xl` | clamp(2.5rem, 6.4vw, 4rem), 600 weight | keep |
| `--text-display-lg` (new) | clamp(2rem, 4.8vw, 3rem) — fills the gap between `display-xl` and the current bespoke `SectionHeading` clamp | new |
| `--text-2xl` / `--text-xl` | existing overrides | keep |
| `--text-base` | 1rem / 1.6 line-height | formalize (currently implicit) |
| `--text-sm` | 0.875rem / 1.5 | formalize |
| Heading weight | 500 (h1-h4), -0.025em tracking | keep |
| Body weight | 400 | keep |

### Spacing (8px base grid — matches existing rhythm)
| Token | Value |
|---|---|
| `--space-section-sm` | 3.5rem / 5rem (mobile/desktop) — existing `Section` sm tier |
| `--space-section-md` | 4.5rem / 7rem — existing `Section` md tier |
| `--space-section-lg` | 6rem / 9rem — existing `Section` lg tier |
| `--space-card-padding` (new) | 1.5rem mobile / 2rem desktop — for the new `Card` primitive |
| Section padding, sourced check | Reference's real section spacing is ~80–120px between major sections — this project's existing `py-24`/`py-32`/`md:py-36` rhythm (≈96–144px) already sits at or above that range | keep, no change — a sourced confirmation, not a gap |

### Radius (extends the existing scale — does not replace it)
| Token | Current | Proposed |
|---|---|---|
| `--radius-xs` | 4px | keep |
| `--radius-sm` | 6px | keep |
| `--radius-md` | 8px | keep |
| `--radius-lg` | 10px (ceiling today) | **raise to 16px** — revised from an earlier 14px estimate now that the real reference source gives a concrete 16px standard-card value; scoped to card/surface components only |
| `--radius-card` (new) | 16px | dedicated card token, matches the sourced standard-card radius; so Button's square identity is never accidentally coupled to this change |
| `--radius-card-media` (new) | 20px | for image/media-forward cards specifically (Blog listing's image zone) — sourced value, distinct tier from the standard card |
| `--radius-block` (new) | 24px | for large content blocks (e.g. a full-width FAQ card wrapper) — sourced value |
| `--radius-pill` (new) | 999px | for pill-shaped chips/badges *if* adopted — does not itself decide the Button question, see below |
| Button radius | `rounded-none` (square) | **decision point, not changed by default** — see R3. Reference value if changed: full pill (999px), not a moderate round — this is now a sourced fact, not an estimate |

### Surfaces / borders (already correct — formalize into primitives, don't change values)
`--color-paper`, `--color-paper-soft`, `--color-surface-sunken`, `--color-line`, `--color-line-strong` — all kept as-is (this project's own hex/OKLCH values, never the reference's).

| Token | Value | Status |
|---|---|---|
| `--line-alpha` (new, optional) | `rgb(0 0 0 / 0.08)`-style alpha border, evaluated against this project's own ink color, not the reference's | worth prototyping alongside the existing fixed `--color-line` — sourced technique (alpha borders scale across surface colors), not a forced replacement |

### Navigation surface (new — only if the floating-capsule direction is chosen for R2)
| Token | Value |
|---|---|
| `--nav-capsule-radius` (new) | 28–30px, sourced value, only relevant if the unified header adopts an inset-capsule shape |
| `--nav-blur` (new) | `blur(48px)`, sourced value, for a frosted/translucent header treatment |

### Containers (resolves R1)
| Token | Value | Note |
|---|---|---|
| `--container-max` | **1400px** (adopt the newer `Container` value site-wide) | `.altor-container`'s 1248px retired in favor of one system |
| `--container-gutter` | 1.25rem → 2rem (≥40rem) → 3rem (≥64rem) | keep existing responsive gutter steps |

### Motion (already correct — apply more broadly)
`--duration-fast` 140ms, `--duration-base` 220ms, `--ease-out-soft` — kept, used consistently for hover/reveal across every migrated component rather than only some.

---

## 6. Responsive rules

Adopting Tailwind v4's default breakpoints (already in effect, no custom breakpoints declared today — kept):

| Breakpoint | Width | Behavior |
|---|---|---|
| base (mobile) | <640px | 1-column card grids, stacked nav (MobileNav overlay), stacked form fields, sidebar filters move to a drawer (already the pattern in `BlogLibrary`) |
| `sm` | ≥640px | 2-column form field pairs activate (already the pattern in `ContactForm`) |
| `md` | ≥768px | Section padding steps up (existing `md:py-*` pattern) |
| `lg` | ≥1024px | Desktop nav appears, filter sidebars go persistent (not drawer), 3-column card grids, Contact's split 2-column composition activates |
| `xl`/`2xl` | ≥1280px/1536px | Container reaches max-width, no further layout changes — just breathing room |

No new breakpoints proposed — the existing responsive behavior (audited across `BlogLibrary`, `ContactPage`, `LabProjectGrid`, `Section`) already follows this exact pattern consistently; migration keeps it.

---

## 7. Migration sequence (proposed order — for approval, not started)

1. **Tokens first**: land the extended `@theme` block (§5) with zero visual change yet (new tokens alongside old, nothing switched over) — a safe, reviewable, isolated commit.
2. **Primitives**: build the new `Card`/`CardGrid` primitive (consolidating `CategoryCardGrid`/`RelatedGrid`/`LabProjectGrid`), extend `Container`/`Section`. No pages touched yet.
3. **Chrome unification**: converge `SiteHeader`/`LabShell` into one sticky header treatment (resolves R2) — touches every page's shell but not page content.
4. **Lowest-risk page families first**: 404 (bare, minimal), Stack, About — simple, single-column, low component count, good smoke test for the new tokens/primitives.
5. **Skill template**: Dashboard-builder — since `SkillProductPage` is explicitly the reusable template for future skill pages, migrating it early means every FUTURE skill page inherits the new system for free.
6. **Special-reference components**: FAQ restyle (propagates to 3 families at once), Blog listing restyle (structural work already done, low risk), Contact restyle + label fix.
7. **High-volume static families**: Calculators index, Calculator detail (43×2 — verify one instance thoroughly, then confirm the rest via the existing `validate-calculator-content.mjs`/build pipeline before considering this family done).
8. **Data-browser families**: AB-library index/detail (211×2), Journeys index — same card/facet primitives as blog, lower risk than journey detail specifically.
9. **Journey detail last**: highest structural uniqueness (`CanonicalFlow` graph renderer, modal/full-page dual rendering) — see R4, budget the most review time here.
10. **Home**: last, not first — it's the highest-visibility page and benefits most from every other primitive already being proven out on lower-traffic pages first.

---

## 8. Risks / conflicts

- **R1 — Two container systems today** (`.altor-container` 1248px vs `Container` 1400px). Resolved by this plan (§5) via adopting 1400px site-wide, but every page currently using `.altor-container` needs a mechanical swap — a real, non-zero-risk find-and-replace across ~15+ files, not just a token change.
- **R2 — Two navigation chrome systems** (`SiteHeader` transparent-over-hero vs `LabShell` sticky-slim-no-footer). Converging them is a real behavioral decision (should data-browser pages gain a footer? should marketing pages lose the transparent-hero float?) — flagged for explicit sign-off before touching, not decided unilaterally in this plan.
- **R3 — Button's square identity vs. the reference family's rounded/pill geometry.** This looks like a deliberate current brand choice (`Button.tsx`'s own opt-out is explicit, not an oversight), not a bug. Now backed by a sourced, concrete fact rather than a category guess: the real Mobbin page markup uses `border-radius: 999px` (full pill) on every button, not a moderate round. That sharpens the decision rather than resolving it — full pill is a bigger visual departure from the current square identity than a moderate round would have been. Recommend confirming with the site owner before rounding buttons at all, and if approved, confirm whether "moderate round" (matching the new 16px card radius, less of a brand break) or "full pill" (matching the sourced reference exactly) is intended — these are two different decisions, not one.
- **R4 — Journey detail is the highest-risk family.** `CanonicalFlow.tsx` renders a bespoke node-graph (trigger/action/condition/wait/outcome/exit/handoff nodes, breadth-first layout, cross-links) — this is closer to a data-visualization component than a content page, and it's dual-rendered (full page + intercepted modal via `JourneyModal.tsx`, with focus-trap/inert/scroll-lock). A generic "restyle every page" pass risks breaking modal focus management or graph-layout math if colors/spacing tokens it depends on change underneath it without dedicated testing. Recommend the most QA time of any family here specifically, and no do it early in the sequence, or you'll be debugging the new system AND the graph renderer's edge cases at once.
- **R5 — AB-test detail currently has no related-content or FAQ block** (unlike Calculator detail). Not a redesign call to silently add one — flagged so nobody assumes symmetry with Calculator detail that doesn't currently exist. If related content is wanted here, that's a content/IA decision outside this plan's scope (and the search round's `search/search-relations.json` already has ab-test relation data ready if that's ever wanted — noted, not actioned).
- **R6 — Blog post detail is EN-only** (by design, per existing code comment — `/tr/blog/*` 404s deliberately). The redesign should not accidentally imply TR blog support exists; this is a content/IA fact, unchanged by presentation work.
- **R7 — The three special references (Shuttle FAQ, Anthropic-grid blog, Coda contact form) still weren't actually supplied/visible in this session** — only `mobbin.com/mcp` was, and only after the user pasted its raw source directly. The level of structural match found for the blog/contact mappings was inferred from the brief's own text description, cross-checked against the ALREADY-EXISTING implementation, not from literally viewing the three referenced screenshots. If those references show something materially different from what's assumed here (e.g. the Shuttle FAQ has a two-column layout, not a flat list), flag it — cheap to correct before implementation, expensive after. Unlike the Mobbin source, this gap is still open.
- **R8 — No dark mode exists.** Not requested by this brief, not added — but worth a decision now (not mid-migration) on whether the new semantic tokens should be dark-mode-ready from day one (cheap to plan for, expensive to retrofit).
- **R9 — Temptation to over-adopt Mobbin's own brand assets now that real markup is available.** Having the actual page source makes it easy to reach for exact values that cross from "visual system" into "proprietary asset" — e.g. importing "M Saans" itself, or copying its literal hex codes. §0 draws this line explicitly (structural/geometric patterns adopted: radius scale, pill buttons, capsule nav, alpha-borders, FAQ-as-cards; brand assets not adopted: the typeface itself, exact colors, copy, illustrations) — holding that line during implementation is what keeps this compliant with the brief's own core rule, not just at planning time.

---

## 9. What this plan explicitly does not touch

Per the brief's own instruction, confirmed unchanged: A/B Test Library data (`src/data/ab-tests.json`), Journey Library data (`production/journey-view-model.json`, `src/canonical/*`), calculator content (`production/calculators/content/*.json`), blog content (`src/lib/blog-posts.ts`), SEO titles/descriptions (`seo/*`), canonical data (`seo/canonical-contract.json`), search data (`search/*`), structured data/schemas (`seo/structured-data-contract.json`). All form field names, validation rules, calculator compute functions, and the mailto-fallback contact mechanism are preserved exactly — this plan only proposes new classNames/tokens/component wrappers around the same functional behavior.
