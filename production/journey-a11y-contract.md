# Journey graph — accessibility data contract

Semantics only. No component, no styling, no ARIA role name — those belong
to whatever implements this. This does not touch or replace the existing
modal accessibility implementation (`src/components/JourneyModal.tsx`) —
that already handles focus trap, `inert`, scroll lock, and Escape-to-close;
this contract is scoped to the graph content inside it.

## Heading hierarchy

One journey detail view = one `<h1>`, the journey's `name`. Everything
inside the graph is content, not a heading level of its own — a node's
`does`/`asks`/`state` text is a label, not a document heading, because 255
journeys × up to 23 nodes each would otherwise produce a heading outline no
one can navigate.

## Node accessible name

Per `journey-graph-contract.json`'s `nodeFamilies`, every node kind has an
explicit accessible-name rule (trigger → humanized event; action → `does`
in full; condition → `asks`; wait → composed from `until`/`timeout`; exit →
`state`; handoff → target name or the pending-external label; outcome →
`state`). The rule that holds across all seven: **the accessible name is
never a generated fragment like "Node 3" or "Step 4" — it is always the
real content field**, because the content field is the only thing that
tells a screen-reader user what actually happens there.

## Edge accessible description

An edge announces its `label` (if present) and its `when`/reason text
together, not the label alone — per `journey-graph-contract.json`'s
`edgeFamilies`, `label` and `when` are deliberately separate fields
(median 13 vs 60 chars), and collapsing to the label loses the actual
decision criterion.

## Branch relation

A condition node's branches must announce as a set with a count ("1 of 3
branches") before each one, not as a flat list indistinguishable from a
forward chain — a condition changing from 2 to 6 arms (the real range, see
`journey-layout-risks.json`'s `high-branch-count`) must be equally legible
at both ends.

## Backward-edge announcement

An edge whose target sits earlier in reading order (125/255 journeys carry
at least one) must announce as returning to an earlier point — e.g. "back
to {target node's accessible name}" — never as an ordinary forward edge,
because silently following it would disorient a screen-reader user who has
no visual cue that the reading direction reversed.

## Handoff destination announcement

Per `journey-graph-contract.json`'s `handoff` node family: a handoff to a
live canonical journey announces the real destination journey's name and
is an actual link target. A handoff to an `external:` pending lifecycle
(68/255 journeys) announces explicitly as **not yet defined** and must
**not** be exposed as an activatable link — a focusable control that leads
nowhere is a worse experience than no link at all.

## Terminal exit semantics

`terminal: true` (5/433 exit nodes) must announce as a stronger claim than
an ordinary exit ("this state does not allow re-entry"), not folded
silently into the state label — see `nodeFamilies.exit` in
`journey-graph-contract.json`.

## Keyboard navigation requirements

- Every node and every edge in the current view must be reachable by
  keyboard alone, in the same reading order the BFS-derived layout uses
  (`src/lib/canonical-view.ts`'s `orderedNodes`), not an arbitrary DOM
  order that happens to differ from the visual one.
- A handoff to another journey must be reachable and activatable via
  keyboard exactly like any other in-page link — no hover-only affordance.

## Focus target requirements

- On opening a journey detail (page or modal), initial focus goes to the
  `<h1>` (the journey name), not to the first graph node — the reader
  needs the journey's identity before its internals.
- Following an internal edge (a jump to another node in the same journey,
  including a backward edge) must move focus to that node's accessible
  name, not just scroll the viewport — a sighted keyboard user and a
  screen-reader user need the same landing behavior.

## Deep-link anchor requirements

- Every node id must be a stable, addressable anchor (`#{nodeId}`) so a
  link to one specific node in a 23-node journey (the real max, see
  `journey-content-stats.json`) is possible without requiring the reader
  to scan the whole graph.
- A deep link into a node must still announce that node's journey context
  (which journey, via the `<h1>`) — a node reached by direct link should
  not read as context-free.
