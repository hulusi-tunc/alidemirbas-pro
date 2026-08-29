# Structural Donors

How to import a third-party UI/component library without importing its
design system along with it. A component's interaction logic, structural
behavior, and accessibility patterns are usually well-tested and expensive
to reproduce; its visual skin is exactly the surface material
reference-analysis.md warns against importing wholesale. Treat every
external component as a **structural donor**: take the mechanism, replace
the skin.

## KEEP

- **Interaction logic** — the state machine behind a disclosure, a
  combobox, a drag interaction. Usually correct and non-trivial to redo.
- **Structural behavior** — DOM shape that exists for a reason (a listbox's
  roving tabindex, a modal's focus trap).
- **Accessibility behavior** — ARIA roles/states, keyboard handling, focus
  management. This is the highest-value thing a mature component library
  offers and the easiest thing to break by reskinning carelessly.
- **Responsive logic** — breakpoint behavior that encodes real interaction
  changes (a menu that becomes a sheet on narrow viewports), as distinct
  from responsive *styling*, which is stripped below.

## STRIP / REPLACE

- Demo copy — every string
- Demo colors, gradients, shadows — replaced with the project's own
  DESIGN.md tokens
- Demo typography — replaced with the project's own type roles
- Demo radius / border language — replaced with the project's own
  border-and-radius language (site-constitution.md Layer 1)
- Stock imagery
- Any layout assumption baked into the donor's own design system that isn't
  actually load-bearing for the interaction (a card shape chosen for the
  donor's marketing site, not for the interaction it demonstrates)

## Procedure

1. **Identify what the component is actually for** — the interaction it
   solves, not the page it's demonstrated on.
2. **Trace the KEEP list** through the component's implementation: which
   props/behaviors are the mechanism, which are styling.
3. **Reskin/recompose using the project's own DESIGN.md** — every visual
   value should be traceable to the project's constitution the same way any
   other design decision is (core P7). A component that still visibly
   belongs to its origin library after this step wasn't stripped enough.
4. **Re-verify the KEEP list survived the reskin** — accessibility behavior
   in particular is easy to silently break while restyling (a focus ring
   removed along with a color that happened to carry it, a keyboard
   handler that assumed a DOM structure the restyle changed).

## Relationship to other modules

This is a Layer-1/Layer-2 decision under site-constitution.md — once a
donor component is stripped and reskinned, its resulting shape becomes part
of the project's own constitution (a control variant, a family skeleton
piece), not a standing exception that needs re-justifying every time it's
reused.
