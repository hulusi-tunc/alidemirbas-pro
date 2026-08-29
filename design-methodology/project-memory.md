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
| LEARNINGS | real events only: what happened, evidence, what rule changed. Withdrawn conclusions recorded as withdrawals. No ceremonial entries — "nothing learned" is a legitimate outcome and writes nothing | document-learning stage |
| ANTI-PATTERN EVENTS | each time a named anti-pattern fired in this project | on detection |
| COMPOSITION MOVE HISTORY | per shipped page: the moves its plan named | after ship |

The LEARNINGS discipline is load-bearing: entries carry provenance
(commit / PR / screenshot) or they do not enter. [PROVEN — provenance-
carrying rules steered production harder than principles.]

---

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
