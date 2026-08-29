# Visual Material Strategy

A decision that precedes composition and follows real-material inventory
(workflow.md stage 3): **what category of real material should carry this
page's visual experience?** Register classification decides which rules
apply; visual material strategy decides what actually fills the page. Both
are declared, both are named, neither is skipped by going straight to
layout.

Anchor selection (composition-grammar.md move 1) picks a specific object
*within* a chosen material family. This module runs first, and decides the
family.

---

## The question, asked explicitly

**What carries this page: what does the visitor actually look at?**

Not "what illustration fits the mood" — that question skips straight past
whether the project owns something better. Ask instead: of everything the
real-material inventory turned up, which category is strong enough to be
the page's visual spine?

## Material families

| Family | Strength signal | Weakness signal |
|---|---|---|
| Real product UI | Screenshots/renders of the actual interface, current | Stale, inconsistent with shipped product, or the product has no meaningful UI yet |
| Real data / diagrams | Numbers, structures, or relationships that are true and specific to this project | Data too thin to visualize honestly, or would need invention to look complete |
| Photography | Real photographs of the real subject (people, place, product, process) | Stock-looking, generic, or standing in for a subject with no photography budget |
| Video | Real motion capture of the real subject | Same risk as photography, plus production cost |
| Illustration | A deliberate, register-appropriate synthetic choice (see anti-patterns #9's EXPRESSIVE/SYNTHETIC category) | Generic SaaS-illustration default, chosen because nothing else was inventoried |
| Editorial imagery | Curated, story-specific images with real editorial judgment behind the selection | Decorative filler with no relation to the story |
| Code / documents / physical objects | The actual artifact the project produces or works with | None if it's real; risk only appears if it's staged to look real when it isn't |
| Portfolio / case-study material | Real work product, real outcomes | Sanitized to the point of being generic, or outcomes that can't be verified |
| Generated imagery | Chosen deliberately, register-appropriate, and its synthetic nature is not disguised | The default filler when nothing else was found — this is the failure mode this module exists to prevent |

## The decision rule

1. **Rank what the inventory actually found**, not what would look best in
   the abstract. A thin inventory constrains the strategy; it does not
   license invention (core P5).
2. **Prefer the family with the most real, specific, verifiable material**,
   even if a thinner family would be more visually dramatic. Register sets
   the ceiling on how dramatic the page is allowed to be (registers.md);
   material strategy decides what's real enough to spend that budget on.
3. **State the strategy in one line**, the same commitment-device form as
   every other declared decision (core P8): "Visual material strategy: real
   product UI, because the inventory turned up current, representative
   screenshots for every claim the page makes" or "…: data visualization,
   because the project's real asset is its dataset, not its interface."
4. **IF the inventory is genuinely thin** — no family has enough real
   material to carry a page — that is a stage-3 finding to report (workflow.md
   stage 3's own failure mode: "empty inventory answered with fabrication
   instead of 'material missing, here is what I need'"), not a license to
   default into generic illustration or decorative abstraction.

## What this module explicitly forbids

The default-filler failure this module exists to name and stop, regardless
of register (anti-patterns.md #9, #11):

generic SaaS illustration · fake dashboards · fake analytics charts ·
decorative gradients used to fill absence rather than to signal · random
blobs · meaningless 3D objects standing in for a product · generic icon
grids substituting for real interface or real content · stock-looking AI
imagery chosen because nothing else was inventoried.

**None of these are banned outright** (core P2, anti-patterns #2 — token
and technique bans relocate the mode, they don't fix it). An illustration
*chosen deliberately*, because the register calls for expressive/synthetic
material and its synthetic nature is not deceptive, is legitimate (see
anti-patterns.md #9's material distinction). The forbidden move is reaching
for one of these as *filler* because the real inventory came up short — that
is fabrication-by-omission, and the correct response is the four legal
responses to missing evidentiary content already named in anti-patterns.md
#9 (preserve / request-or-source / design around / explicit placeholder).

## Output

A one-line declared strategy, entered into DESIGN.md alongside the register
and the selected direction manifesto, consulted at anchor-selection time
(composition-grammar.md move 1) and at fan-out time (visual-direction.md) —
directions may vary in treatment of the chosen material family, but do not
vary the family itself without a new stage-3 finding to justify it.
