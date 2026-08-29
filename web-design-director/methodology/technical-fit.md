# Technical Fit

A gate before implementation (workflow.md, between COMPOSITION PLAN and
IMPLEMENTATION), not a design decision. Its job is narrow: stop unnecessary
complexity from entering a build, in either direction — an existing
project gaining fashionable weight it doesn't need, or a greenfield project
choosing an architecture more elaborate than its requirements.

## For an existing project (this repo's own case)

**Default: respect the existing architecture.** The question is never "what
would I choose from scratch" — it's "does this feature require deviating
from what's already here."

1. Is there already a stack, a component system, a rendering strategy? →
   Use it. Deviating requires a stated reason, traceable the same way any
   other material decision is (core P7).
2. Does the new work require something the existing stack doesn't already
   provide — a new dependency, a new rendering mode, a backend it doesn't
   have? Name exactly what and why before adding it.
3. **A compelling reason to deviate is a content or requirement property**,
   not a preference — the same evidentiary bar site-constitution.md sets for
   breaking a higher-layer design rule. "This would be cleaner in framework X"
   is not compelling; "this feature needs real-time state the current stack
   has no primitive for" is.

## For a greenfield project

**Default: the simplest architecture that genuinely satisfies the
requirements.** Ask, in order, before reaching for the next layer of
complexity:

1. **Does this need JavaScript at all?** Static markup and CSS satisfy a
   surprising fraction of "interactive-feeling" requirements.
2. **Does this need a framework?** A framework earns its cost through
   routing, component reuse, or state complexity actually present in the
   requirements — not by being the default starting point.
3. **Does this need a backend?** Content that doesn't change per-request
   doesn't need one.
4. **Does this need a database?** Static or file-based data satisfies most
   small and medium projects; a database is a requirement, not a habit.

Each "yes" should trace to a specific requirement from CONTEXT.md or the
brief. A "yes" with no traceable requirement is complexity added because it
is fashionable, which is exactly what this gate exists to catch (echoing
core P1: decisions committed at the wrong altitude execute without
judgment).

## Output

One line per project, in DESIGN.md or PROJECT_STATE.md: the chosen stack (or
"unchanged, existing stack"), and — only where a deviation from "simplest
sufficient" was made — the specific requirement that justified it. Silence
on this line for a project with no unusual technical decisions is correct;
forcing a paragraph where nothing needed deciding is ceremony (workflow.md's
own scale-down rule: "ceremony beyond the mode is cost, not rigor").

## Relationship to other modules

This gate runs once per project (or once per page-family, if families
genuinely differ in technical shape), not once per page — most COMPOSITION
PLAN → IMPLEMENTATION transitions inherit the project's existing answer
without re-litigating it. It re-runs only when a task's requirements
plausibly exceed what the existing technical-fit decision covers.
