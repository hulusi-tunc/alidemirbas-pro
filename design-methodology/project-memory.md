# Project Memory

Design decisions must outlive the session (core P14). This module defines
what is stored per project, and the cross-project audit that keeps the
methodology from converging on itself (core P15).

Storage shape: one directory per project (e.g. `design-memory/`), plain
files, append-mostly. Records are dated; nothing is silently deleted.

---

## What a project stores

| Record | Content | Written when |
|---|---|---|
| REGISTER DECISION | register + sub-mode + hybrid split, one-line reason, who confirmed | classification stage |
| SITE CONSTITUTION | the three-layer document (site-constitution.md instance) | after first direction selection; amended thereafter |
| PAGE-FAMILY RULES | per-family skeletons, anchor norms, density bands | as families emerge |
| REFERENCE CARDS | full cards per reference-analysis.md | reference stage |
| DIRECTION MANIFESTOS | every manifesto rendered, marked selected / rejected / hybrid-source | fan-out + selection |
| REJECTED DIRECTIONS | kept, with the human's stated reason — rejections are data | selection |
| EXCEPTIONS | the exception records per site-constitution.md | on approval |
| QA FAILURES | machine-QA reds and named critique findings that reached the human, with resolution | QA stages |
| LEARNINGS | real events only: what happened, evidence, what rule changed. Withdrawn conclusions recorded as withdrawals. No ceremonial entries — "nothing learned" writes nothing. Conditional in **every** mode, including the fast path (workflow.md stage 16) | when a trigger fires |
| ANTI-PATTERN EVENTS | each time a named anti-pattern fired in this project | on detection |
| TASTE ITEMS + PROFILE | inspiration items and the regenerated cluster profile (reference-analysis.md) | opportunistically; profile on review |
| COMPOSITION MOVE HISTORY | per shipped page: the moves its plan named | after ship |

The LEARNINGS discipline is load-bearing: entries carry provenance
(commit / PR / screenshot) or they do not enter. [VALIDATED IN PROJECT —
provenance-carrying rules steered production harder than abstract ones here.]

---

## design-memory/STATE.md — the resume pointer

A single small file, distinct from the structured records above. **It is a
resume pointer, not a knowledge dump**; detailed memory stays in its own
artifacts. Its entire responsibility:

```
PROJECT
CURRENT REGISTER              (+ sub-mode, hybrid split)
CURRENT WORKFLOW MODE
CURRENT STAGE                 (workflow.md stage number/name)
LATEST APPROVED DIRECTION     (manifesto id + date)
ACTIVE ARTIFACTS              paths to the constitution, plans, cards in play
DECISIONS SINCE LAST SESSION  append-only, dated one-liners
OPEN ISSUES                   unresolved named findings, blocked questions
NEXT STEP                     the single next action
```

Protocol:
- **At the start of a design session: read STATE.md first**, before any
  methodology module. It says which modules the current mode even needs.
- **At every major decision or stage transition: update STATE.md.**
- DECISIONS SINCE LAST SESSION is append-safe — add, never rewrite history.
- The human must never have to re-explain context that STATE.md already
  holds. IF Claude asks about something recorded there → that is a defect
  in the reading protocol, not a question for the human.

## Project-to-project convergence audit

[PLAUSIBLE — thresholds are working values; the audit has not yet run
against a real multi-project ledger.]

**Ledger:** every shipped page/project appends a structured row:
anchor type · composition moves used · hero structure · font families ·
palette architecture (structure, not hex) · physical metaphor if any ·
motion pattern · signature element class.

**Cadence:** every N projects (default 3) or quarterly, whichever first.

**Flags** (computed over the last N ledger rows):
- same ANCHOR TYPE in > 60% of pages
- same FONT FAMILY PAIRING in ≥ 3 consecutive projects
- same HERO STRUCTURE in ≥ 3 consecutive projects (silhouette metric makes
  this partially computable)
- same PHYSICAL METAPHOR CATEGORY reused
- same SIGNATURE ELEMENT CLASS reused
- same PALETTE ARCHITECTURE in ≥ 3 consecutive projects
- REFERENCE CARD STORE sharing one mechanism list across most cards
- **TASTE CLUSTER DOMINANCE**: one taste cluster's mechanism decides
  directions across most recent projects. Repeated human preference is
  itself a convergence vector — the most invisible one, because it feels
  like judgment rather than habit. Flagging it does **not** ban it.

**Response rule — conscious reuse, not forced novelty:**
IF a flag fires → the next project's fan-out MUST include at least one
direction that avoids the flagged mechanism. The flagged mechanism may
still win — after the human sees the alternative. The audit's job is to
convert unconscious repetition into conscious reuse, never to make projects
weird on principle.

**Audit of the auditor:** the grammar and this audit are themselves subject
to core P15. IF audit flags fire repeatedly on grammar-level moves, the
question escalates from "rotate the direction" to "has the vocabulary
itself become the template" — that is a methodology review, recorded in
LEARNINGS.
