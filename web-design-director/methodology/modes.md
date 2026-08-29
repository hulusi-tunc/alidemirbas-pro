# Working Modes

A behavioral gate, not a workflow stage. Modes exist because the workflow
answers "how much process does this deserve" (workflow.md's Modes table),
which is a different question from "what category of action is currently
licensed." A task can be fully-scoped GREENFIELD work and still need a mode
gate — the two axes are independent.

**Every design/build task declares a mode before acting, from the request
itself.** IF the request doesn't name one → infer it from the verb and state
it in one line (core P8), the same way register is declared, not asked for.

---

## The six modes

| Mode | Licensed to | Forbidden | Typical request |
|---|---|---|---|
| **DISCOVER** | Read, inventory, classify, write CONTEXT.md/COPY.md drafts, ask clarifying questions | Any visual decision (core P3); any file write outside discovery artifacts | "What do we actually have to work with here?" |
| **DESIGN** | Manifestos, mocks, composition plans, reference cards — all pre-production artifacts | Implementing into production code; touching a live route or component | "Design the homepage first. Do not implement it." |
| **BUILD** | Implementing an **already-approved** plan/manifesto into code | Inventing new direction; silently deviating from the approved plan (core P7) | "Implement the approved design." |
| **EDIT** | A **named, scoped** correction to existing, shipped work | Redesigning anything outside the named scope; "while I'm in here" changes | "Fix the spacing in this existing section." |
| **QA** | Inspecting, capturing, measuring, naming findings | Any file write that changes rendered output | "Audit this page but change nothing." |
| **SHIP** | Deploy, verify-live, rollback | Any new design decision (SHIP is not the place to notice something's wrong and fix it silently — that's a mode switch, declared) | "Prepare and deploy the approved version." |

## The three failure modes this exists to stop

- **DESIGN silently becoming BUILD.** A "design only" request produces a
  rendered mock or a written manifesto — never a merged component, never a
  changed production route. If production code seems like the only way to
  show the direction, that is a mode-change request back to the human, not
  a silent escalation.
- **QA silently mutating production.** A QA-mode task never edits the thing
  it is inspecting. Findings are named and returned (qa.md B); fixing them is
  a separate EDIT or BUILD pass, even when the fix is obvious and small.
- **EDIT silently becoming a redesign.** An EDIT task states CHANGE and
  PROTECT before touching anything (qa.md B2, core P18) and never widens
  scope mid-pass. "The spacing looks off elsewhere too" is a new finding to
  report, not license to touch it.

## Mode transitions

A mode change is always **explicit and one-directional per request**:
finishing a DESIGN pass and being asked to build it is a new BUILD-mode
task, not DESIGN quietly continuing. State the transition in one line:
"Design approved; switching to BUILD mode" — the same commitment-device
discipline as every other declared decision (core P8).

**Default when ambiguous:** the more restrictive mode. A request that could
be read as either QA or EDIT is QA until the human says otherwise — asking
for permission to fix costs one line; fixing something nobody approved
touching costs a regression.

## Relationship to workflow.md's Modes table

Two different tables, same file family, not to be confused:

- **workflow.md Modes** (GREENFIELD / EXISTING DESIGN LANGUAGE / ROUTINE PAGE /
  FAST PATH) decide **how many stages run** for a given task.
- **This file's modes** (DISCOVER…SHIP) decide **what category of action is
  currently permitted**, regardless of how many stages the task needs.

A ROUTINE PAGE task can be in DESIGN mode, then BUILD mode, then QA mode,
each a separate declared pass — the workflow scale-down does not collapse
the mode gate.
