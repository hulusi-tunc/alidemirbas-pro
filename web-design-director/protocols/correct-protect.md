# CORRECT / PROTECT

This is a pointer file, not a duplicate. The canonical rule lives in two
places that already agree with each other:

- **core-principles.md P18** — the rule itself: every refinement pass
  declares CHANGE (allowed to move) and PROTECT (must not move) before
  touching anything.
- **qa.md B2 — Finding Classes and Iteration Scope** — the mechanics: how
  findings classify into WRONG / MISSING / ROUGH / CORRECT-PROTECT, how that
  classification derives the CHANGE/PROTECT scope, and the re-verification
  step (diff the captures where possible) that closes the loop.

Read this protocol as those two sections, plus the one addition below that
neither currently makes explicit.

## The addition: implementation architecture should reinforce the boundary

CORRECT/PROTECT is defined above as a *prompting and review* discipline —
what a critique is allowed to license. It works better when the build
itself makes the boundary easy to hold:

**RULE: where practical, an approved section maps to a stable component
boundary.** IF a page's sections are built as genuinely separable
components (not necessarily separate files — separable in the sense that
one can change without the render of its neighbors changing), then a
PROTECT declaration has a natural, checkable home: "don't touch the Hero
component" is enforceable in a way "don't touch the top of the page" is
not.

This is a preference, not a requirement — modes.md's EDIT mode and qa.md's
B2 scope discipline hold regardless of how the code is structured. But
where the choice is free (a new build, not an existing codebase's
established pattern — see technical-fit.md's "respect the existing
architecture" default), prefer the structure that makes the smallest safe
diff also the *obvious* diff.

**RULE: prefer the smallest safe diff.** A local correction implemented as
a full-file rewrite carries the same regression risk CORRECT/PROTECT exists
to prevent, even when the rendered result looks identical to a fresh build —
because "looks identical" is a claim that needs the same re-verification a
visible change would need, at higher cost for no benefit. Change what the
finding names; touch nothing else.
