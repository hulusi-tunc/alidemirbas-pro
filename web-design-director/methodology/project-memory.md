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
| CONTEXT | verified project truth — templates/CONTEXT.md | BRIEF/REGISTER stages |
| COPY | approved/working content — templates/COPY.md | before serious composition, when real copy exists |
| REGISTER DECISION | register + sub-mode + hybrid split, one-line reason, who confirmed | classification stage |
| SITE CONSTITUTION | the three-layer document — templates/DESIGN.md is this project's instance | after first direction selection; amended thereafter |
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

## PROJECT_STATE.md — the resume pointer

The resume-pointer file is specified in full as `templates/PROJECT_STATE.md`
— this section is a pointer, not a second copy, to avoid the two drifting
apart. In brief: it is a single small file, distinct from the structured
records above, whose only job is letting a session resume without
re-deriving or re-asking for anything already decided. Read it before any
other methodology module (workflow.md, Session start / state); update it at
every major decision, mode transition (modes.md), and workflow stage
transition.

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
