# JOURNEY-PRODUCT-IMAGE-PROMPTS.md

Image-generation prompts for the **Lifecycle Marketing Journey Builder**
product page (`/lab/claude-lifecycle`).

---

## Outcome: no images are generated for this page

**No raster/generated illustration is needed, because all major visuals
communicate actual product logic and are better implemented in React/CSS/SVG.**

All ten visuals (VISUAL-J01 … J10 in `JOURNEY-PRODUCT-VISUAL-ASSET-PLAN.md`)
are built in React + CSS. This is a decision, not an omission, and it is
stronger here than it was on the A/B Test page:

1. **The page's subject is software logic.** Nodes, branch labels, timeouts and
   handoff payloads are the content. An AI illustration of a "customer journey"
   would replace the product with a picture of the idea of the product.
2. **Every label is live canonical data.** The diagrams render `ACQ-01`'s real
   `event`, `asks`, `branches[].label`, `timeout.after` and `carries[]`. Baking
   those into a PNG freezes them, and they would silently go stale the next time
   a journey is revised. A generated image of a *count* would be an invented
   count.
3. **Both languages, one component.** The page ships EN and TR; images would
   need two sets per visual kept in sync by hand.
4. **Mobile requires restructuring, not scaling.** At 375px the nested fork
   *stacks* and branch labels *wrap*. A raster crop cannot reflow, and a
   scaled-down diagram would fail the brief's "no microscopic node labels" bar.
5. **Accessibility.** Node kinds, branch meanings and flow order are real DOM
   text — readable by screen readers, translatable, indexable, selectable.
   None of that survives being flattened into pixels.
6. **Token coupling.** The node system is drawn with `primary-*`, `ink-*`,
   `line-soft` and the radius/duration tokens. Retheming is a CSS change.

Nothing on this page is a photographic subject, an atmospheric background, a
mascot, or an editorial illustration — the cases where generation earns its place.

---

## Standing negative constraints, if an image is ever added here

> No text of any kind. No node labels, arrows, flowcharts or diagram-like
> shapes — those are the product and must stay in code. No logos or brand
> marks. No UI chrome or fake dashboards. No stock-photo aesthetic. No generic
> AI gradient mesh or iridescent blobs. No 3D cartoon characters, mascots,
> people or hands. No neon, no glassmorphism. No Peerbie blue/pink/orange —
> the two-hue system (brand blue `#154CE4` + ink `#05080f`) only. No numbers or
> metrics rendered as pixels.

## Required prompt template

Any future addition must be specified to this level before generation:

```
IMAGE NN — [name]

Purpose:            [what the reader learns]
Why not code:       [why React/CSS/SVG genuinely cannot do this]
Subject:            [exact subject]
Composition:        [placement, focal point, negative space]
Perspective:        [camera/angle, or "flat, orthographic"]
Background:         [exact ground, and how it meets the section tone]
Colour treatment:   [tokens only: primary-*, ink-*, paper*]
Lighting:           [direction, softness]
Whitespace:         [where the page's own text sits over/next to it]
Aspect ratio:       [e.g. 16:10]
Intended crop:      [safe area, what may crop at container edges]
Desktop usage:      [px box]
Tablet / mobile:    [stack / crop / simplify / hide]
Relationship:       [how it reads next to the surrounding sections]
Negative:           [the standing constraints above, plus specifics]
```

No `IMAGE NN` entries exist, because none are required.
