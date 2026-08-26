# PRODUCT-VISUAL-ASSET-PLAN.md

Visual asset plan for the **A/B Test Playbook** product page pilot
(`/lab/ab-testing`, `/tr/lab/ab-testing`).

Reference for **page composition / product storytelling**: peerbie.com/custom-workflow.
Reference for **design language**: this project's existing Portrait-derived system
(`PORTRAIT-DESIGN-SOURCE-AUDIT.md`, `DESIGN-MIGRATION-PLAN.md`). Peerbie is **not**
replacing the design system — only the section sequencing, scale changes and
"the product dominates the screen" composition principle.

---

## 0. Content provenance — every fact used in a visual

No capability, number or label below is invented. Sources:

| Fact | Value | Source |
|---|---|---|
| Scenario count | 211 | `src/data/ab-tests.json` — `.length` |
| Categories | 12 | distinct `.category` |
| Surfaces | 14 | distinct `.surface` |
| Guardrail lines, total | 1,055 | sum of `.guardrails.length` |
| Guardrails per scenario, minimum | 5 | `Math.min` of `.guardrails.length` |
| Scenarios with an explicit control/variant pair | 198 | records where `sideA && sideB` |
| Featured scenario | AB-004 | `src/data/ab-tests.json` (TR) + `content.ts` `abTesting.example` (EN, already-verified translation shipped on the current page) |
| Worked significance example | 5,000/250 vs 5,000/290 → p 0.0847, not significant | `production/calculators/calculator-catalog.json` → `ab-test.exampleInput` / `exampleOutput` |
| Statistical field labels | Control visitors, Baseline conversion rate, MDE, Required sample per variant, … | same catalog, `inputs[].label` / `outputs[].label` of the five live stat calculators |
| Library card titles (EN) | `seoTitle` | 211/211 populated, English, avg 50 chars |
| Library card titles (TR) | `question` | native Turkish source field |
| Install commands | 3 options | `content.ts` `abTesting.install.options` (unchanged) |
| The five rules | verbatim | `content.ts` `abTesting.principles` (unchanged) |

**Derived arithmetic only** (not invention): 250/5000 = 5.00%, 290/5000 = 5.80%,
absolute uplift 0.80pp, relative uplift +16.0%.

---

## 1. Semantic colour system for the visuals

Two hues only — the system's existing brand blue + ink. **No new palette, no
Peerbie blue/pink/orange, no third hue.** `--color-success` exists in
`globals.css` but is explicitly gated ("nothing else in the product may reach for
it without a decision") and is therefore **not** used here.

| Meaning | Token | Rationale |
|---|---|---|
| Control / baseline | `ink-*` neutral, `paper-soft` fill | the unchanged side reads as quiet |
| Variant / the thing under test | `primary-600` / `primary-50` | the single accent already used site-wide |
| Primary KPI (decides the winner) | `primary-600` | same accent — it *is* the decision |
| Guardrail (must not degrade) | `ink-950` solid plate | authority, not alarm; avoids inventing a red/amber |
| Not significant / verdict | `ink-950` plate + plain wording | no fake red "fail" chrome |

---

## 2. The visuals

### VISUAL-01 — Experiment Brief
- **Section**: 01 Hero
- **Purpose**: show in one glance that the product's output is a *structured brief*, not a tip.
- **Communicates**: a scenario carries surface + question + control/variant + primary KPI + guardrail, together.
- **Content source**: AB-004 (`content.ts` `abTesting.example` for EN, raw record for TR); structural chips (`surface`, `category`, `setupType`, `comparisonMode`) from the JSON.
- **Format**: product-UI composition (a "brief card" as the plugin would emit it).
- **Method**: React + CSS. **No image.**
- **Desktop**: ~600 × 520, right column of a 42/58 split, on the dark hero plate.
- **Mobile**: full-width, below the text; drops the `otherKpis` rows and the comparison-mode chip, keeps question → control/variant → primary KPI → one guardrail.

### VISUAL-02 — Coverage Map
- **Section**: 02 Benefit story 01 ("start from the surface you're actually on")
- **Purpose**: show the library is *distributed across real product surfaces*, not a flat list.
- **Communicates**: 14 surfaces, unevenly weighted; PDP/home/form are deep, thankyou/dashboard are thin — an honest shape, not a marketing-flat grid.
- **Content source**: real per-surface counts from the JSON.
- **Format**: proportional bar/tile map.
- **Method**: React + CSS. **No image.**
- **Desktop**: ~620 × 440.
- **Mobile**: same map, 2 columns, bars retained (they are the point), label + count only.

### VISUAL-03 — One-Variable Diff
- **Section**: 03 Benefit story 02 ("one variable, or it isn't a test")
- **Purpose**: show the discipline *visually* — two sides, exactly one slot differing.
- **Communicates**: control vs variant with the tested slot highlighted and everything else held identical.
- **Content source**: AB-004 `sideA` / `sideB` / `testedSlot` / `differenceBehavior`; the 198/211 count.
- **Format**: side-by-side diff panel with the changed row marked.
- **Method**: React + CSS. **No image.**
- **Desktop**: ~640 × 420.
- **Mobile**: stacks vertically, control above variant, the changed row keeps its marker.

### VISUAL-04 — Guardrail Ledger
- **Section**: 04 Benefit story 03 ("every scenario ships with what must not break")
- **Purpose**: make "guardrail" concrete rather than a word in a bullet.
- **Communicates**: five real guardrail lines from one real scenario + the corpus-wide 1,055 / min-5 fact.
- **Content source**: AB-004 `guardrails` (TR raw / EN from `content.ts` `example.dontBox.items`).
- **Format**: dark ledger plate, numbered rules, count stat.
- **Method**: React + CSS. **No image.**
- **Desktop**: ~600 × 460.
- **Mobile**: full-width, all five rules kept (they are short), stat above.

### VISUAL-05 — Library Spread  *(the Peerbie screenshot-1 moment)*
- **Section**: 05 Library showcase — the largest visual moment on the page.
- **Purpose**: make 211 *feel* like a body of work, and tease that it continues past the viewport.
- **Communicates**: real entries, real categories, real surfaces; the library is browsable and deep.
- **Content source**: 7 real curated records across 7 categories (AB-004, AB-072, AB-114, AB-127, AB-103, AB-163, AB-049) + real category facet counts.
- **Format**: one fully-visible centre card, flanked by cards deliberately cropped at the container edge, over a tinted canvas, with real category filter chips above.
- **Method**: React + CSS. **No image.**
- **Desktop**: full 1280 container, ~560 tall; side cards overflow-cropped.
- **Mobile**: horizontal scroll-snap rail (crop preserved as the affordance), chips wrap to two rows.
- **CTA**: "Explore all 211 tests →" → `/lab/ab-testing/library` (real route).

### VISUAL-06 / 07 / 08 — How It Works, steps 1–3  *(the Peerbie screenshot-3 moment)*
Three *different* miniature product fragments, aligned on a common baseline.

| | VISUAL-06 (step 1) | VISUAL-07 (step 2) | VISUAL-08 (step 3) |
|---|---|---|---|
| Teaches | narrowing | constructing | deciding |
| Shows | surface chips + matching-count readout | hypothesis → primary KPI → guardrail stack | control/variant rates, uplift, p-value, verdict |
| Source | real surface counts | AB-004 fields | `ab-test` calculator's real `exampleInput`/`exampleOutput` |
| Method | React + CSS | React + CSS | React + CSS |
| Desktop | ~360 × 300 | ~360 × 300 | ~360 × 300 |
| Mobile | full-width, stacked 01→02→03, node count reduced rather than text shrunk |

VISUAL-08 deliberately shows a **+16% uplift that is NOT significant** (p 0.0847) —
the real catalog example — because that is the single most useful thing the product
teaches. It links to the live Significance / Sample Size / Duration calculators on
this same site.

### VISUAL-09 — Install
- **Section**: 07 Deep features
- **Purpose**: it is a Claude Code plugin; installing it is a real, three-option action.
- **Content source**: `content.ts` `abTesting.install.options`, unchanged.
- **Method**: React + CSS terminal blocks. **No image.**

---

## 3. Format decision summary

| Visual | React/CSS | Generated image |
|---|---|---|
| VISUAL-01 … VISUAL-09 | ✅ all nine | ❌ none |

**Zero raster assets are generated for this page.** Rationale in
`PRODUCT-IMAGE-PROMPTS.md`.

---

## 4. Motion

Entrance only, via the existing `Reveal` primitive (`--duration-reveal`,
`--ease-out-smooth`), staggered 0/90/140ms. Card hover = border + shadow step only.
No floating, no parallax, no scroll-jacking. `prefers-reduced-motion` is already
honoured by `Reveal` / `globals.css` and is not overridden.

---

## 5. Section pacing (density is deliberately uneven)

| # | Section | Tone | Density |
|---|---|---|---|
| 01 | Hero | ink-950 dark | large |
| 02 | Scale strip | paper | **low** (thin band — a breath) |
| 03 | Benefit 01 — coverage | paper | large, text ǀ visual |
| 04 | Benefit 02 — one variable | paper-soft | large, visual ǀ text |
| 05 | Benefit 03 — guardrails | paper | large, text ǀ visual |
| 06 | Library spread | tinted canvas | **very large** |
| 07 | How it works | paper | medium-large |
| 08 | Deep features + install | paper-soft | large |
| 09 | FAQ | paper | medium |
| 10 | Final CTA (shared) | existing | medium |
