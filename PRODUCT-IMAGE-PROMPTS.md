# PRODUCT-IMAGE-PROMPTS.md

Image-generation prompts for the **A/B Test Playbook** product page pilot.

---

## Outcome: no images are generated for this page

**Zero raster assets were produced.** All nine visuals (VISUAL-01 … VISUAL-09 in
`PRODUCT-VISUAL-ASSET-PLAN.md`) are built in React + CSS.

This is a decision, not an omission. The brief's own rule was:

> Prefer HTML/CSS/React for UI mockups, charts, workflow nodes, test cards,
> library cards, metrics, experiment results, diagrams, interface fragments …
> DO NOT generate raster images for UI that can reasonably be built in code.

Every visual this page needs falls inside that list. Concretely:

1. **They are all product UI or data.** A brief card, a coverage map, a
   control/variant diff, a guardrail ledger, library cards, a significance panel —
   these are interface fragments and charts, not illustration.
2. **They carry real text that must stay real.** Each visual renders live values
   pulled from `src/data/ab-tests.json` and
   `production/calculators/calculator-catalog.json`. A generated image would
   freeze — and inevitably garble — that text, and it would silently go stale the
   next time the dataset changes. Worse, a generated image of a *number* is an
   invented number, which the brief forbids outright.
3. **Bilingual.** The page ships EN and TR. Code renders both from one component;
   images would need two sets per visual, kept in sync by hand.
4. **Responsive + legible.** The brief requires simplifying rather than shrinking
   at 375px (drop nodes, reflow, scroll-snap). A raster crop cannot do that, and
   text inside a scaled-down PNG fails the "must remain understandable at 375px"
   bar.
5. **Accessibility and SEO.** Real DOM text is selectable, translatable,
   screen-reader-readable and indexable. Text baked into an image is none of those.
6. **Theme + token coupling.** The visuals are drawn with `primary-*`, `ink-*`,
   `line-soft` and the radius/duration tokens. Retokenising is a CSS change;
   images would have to be regenerated.

Nothing on this page is a photographic subject, an atmospheric background, a
mascot, or an editorial illustration — the categories where generation genuinely
earns its place.

---

## Standing negative constraints (if an image is ever added here)

Recorded now so a future asset cannot drift from the page's language:

> No text of any kind. No logos or brand marks. No UI chrome or fake dashboards.
> No stock-photo aesthetic. No generic AI gradient mesh or iridescent blobs.
> No 3D cartoon characters, no mascots, no people, no hands. No neon,
> no glassmorphism, no drop-shadow pile-ups. No Peerbie blue/pink/orange —
> the two-hue system (brand blue `#154CE4` + ink `#05080f`) only.
> No numbers, charts, or metrics rendered as pixels — those must always be DOM.

## If an image is ever needed — required prompt template

Any future addition must be specified to this level before generation:

```
IMAGE NN — [name]

Purpose:            [what the reader learns]
Why not code:       [why React/CSS genuinely cannot do this]
Subject:            [exact subject]
Composition:        [placement, focal point, negative space]
Perspective:        [camera/angle, or "flat, orthographic"]
Background:         [exact ground, and how it meets the section tone]
Colour treatment:   [tokens only: primary-*, ink-*, paper*]
Lighting:           [direction, softness]
Whitespace:         [where the page's own text will sit over/next to it]
Aspect ratio:       [e.g. 16:10]
Intended crop:      [safe area, what may be cropped at container edges]
Desktop usage:      [px box]
Mobile usage:       [stack / crop / simplify / hide]
Relationship:       [how it reads next to the surrounding sections]
Negative:           [the standing constraints above, plus any specific ones]
```

No `IMAGE NN` entries exist, because none are required.
