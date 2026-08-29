# PROJECT_STATE.md — <project name>

The resume pointer, not a knowledge dump (project-memory.md). Detailed
memory lives in CONTEXT.md, COPY.md, DESIGN.md, and the structured records
project-memory.md defines (reference cards, exceptions, learnings, taste
items). This file's entire job is letting a session resume without
re-deriving or re-asking for anything already decided.

```
PROJECT                        <name>
CURRENT REGISTER                <register + sub-mode + hybrid split, if any>
CURRENT MODE                    <one of modes.md's six: DISCOVER/DESIGN/BUILD/EDIT/QA/SHIP>
CURRENT WORKFLOW MODE            <one of workflow.md's four: GREENFIELD/EXISTING/ROUTINE/FAST PATH>
CURRENT STAGE                   <workflow.md stage number/name>
LATEST APPROVED DIRECTION        <manifesto id + date, or "n/a — no fan-out run">
ACTIVE ARTIFACTS                 <paths to CONTEXT.md, COPY.md, DESIGN.md, active plans/cards in play>
PROTECTED AREAS                  <what is shipped and must not change without a new EDIT-mode scope declaration>
DECISIONS SINCE LAST SESSION     <append-only, dated one-liners>
OPEN ISSUES                      <unresolved named findings, blocked questions>
NEXT STEP                        <the single next action>
```

## Protocol

- **At the start of any session: read this file first**, before any
  methodology module. It says which modules the current mode and workflow
  mode even need loaded (workflow.md's module-loading table).
- **At every mode transition and every workflow stage transition: update
  this file.**
- `DECISIONS SINCE LAST SESSION` is append-safe — add, never rewrite
  history.
- The human must never have to re-explain context this file already holds.
  IF a question gets asked about something recorded here → that is a defect
  in the reading protocol, not a question for the human (project-memory.md).

## IF this file does not exist for a project

Greenfield, or a project that has never used this system: run BRIEF →
initial REGISTER declaration → **initialize this file from the template
above** → continue. Never invent prior project state, and never treat a
missing file as an error (workflow.md, Session start / state).
