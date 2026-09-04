# Operational Workflows — observability audit

Minimum semantic auditability a real operator needs, per the round's own 12-question checklist:
who created the work and why, what evidence was available, who owned it and how ownership changed,
what decision was made under which policy/version, who approved it, what evidence supported
completion, what was escalated, what outcome returned upstream.

## The dominant pattern: append-only logs, correctly used

Every workflow in the corpus that writes state uses an append-only log field
(`routing_log`, `assignment_log`, `ownership_chain`, `case_log`, and their domain-specific
equivalents) — no workflow was found silently overwriting its own history, the same discipline the
customer-facing and Runtime Mechanism rounds already established corpus-wide. `OWN-52`'s own
description is representative of the strong end of this pattern: "`assignment_log` records
`ASSIGNED`, rejection reason, and `ACTIVE_OWNERSHIP` append-only; `suppressed_sends` tracks
invalidated actions — sufficient to reconstruct who was offered what and when."

## Actions with no `writes` field — mostly benign, one genuine exception

29 of the 124 workflows contain at least one action with an empty `writes` array (32 actions
total). Reading them individually, the overwhelming majority are pure revalidation/read/decision-
support steps whose own job is to feed a *subsequent* action that does write (`a.revalidate`,
`a.reread`, `a.recheck`, `a.evaluate` appear repeatedly — `TIM-64/67/68/69/70`, `ACC-75/76`,
`RSK-196`, `DOC-216`, `DAT-223`, `CTL-234/236`, `RLT-243/246`, `DEC-182/185/188/190`). This is not,
on its own, an observability defect — a read that feeds a write two nodes later does not need its
own audit entry if the write it feeds already records the decision.

**One genuine exception, already flagged at P1 in `OPERATIONAL-WORKFLOWS-AUDIT.md`**: `IDN-86`'s
`a.revalidate` is not a supporting read for a later write — it is, in the workflow's own framing,
"the safety-critical re-authorization check after a challenge," i.e. the consequential decision
point itself, and it has no `writes` field at all. This is the one instance in the round where a
no-write action is the decision, not merely a read feeding one — the pattern above does not excuse
it.

A smaller number of no-write actions are genuinely worth a second look rather than assumed benign:
`OWN-53`'s `a.assemble`/`a.minimise` (context-assembly and minimization decisions that themselves
go unlogged, only the subsequent `a.start` writes), `DOC-212`'s `a.validate` (validation includes
judgment-adjacent checks per `OWNERSHIP-AND-ASSIGNMENT-AUDIT.md`'s own finding, and leaves no trail
of what was actually checked), `DEC-188`'s `a.evaluate`/`a.no-expiry`.

## What is answerable vs. what a company must still supply

Per the round's own 12-question list, most of the corpus answers "what mechanism ran / for which
work item / why / what decision" strongly (the append-only log field's own name plus the condition
nodes' own `asks` text is close to a ready-made audit trail). The corpus-wide weak points, all
already covered in depth by their own dedicated documents rather than repeated here:

- **"Who approved it, under which authority"** — weak wherever `AUTHORITY-AND-APPROVAL-AUDIT.md`
  found authority unnamed (`RLT-247`, `TRM-101`/`103`/`104`, `DAT-225`/`229`, `INC-253`/`258`): an
  operator cannot log an approver that was never named as one.
- **"What was escalated and why"** — the corpus generally names the escalation reason correctly;
  see `SLA-AND-ESCALATION-AUDIT.md` for the one structural gap (`DEC-183`'s missing in-review
  deadline enforcement) that would make the timing side of this unanswerable even though the
  content side is fine.
- **"What outcome was returned upstream"** — weak specifically where `COMPLETION-AND-FEEDBACK-
  AUDIT.md` found result propagation broken (`INT-118`, `IDN-86`'s second sender, `RLT-244`): the
  outcome exists in the workflow's own log but never reaches whatever needed to know it.

## Recommended minimum, derived from what already works

No new observability framework is needed — the corpus's own append-only log convention is already
the right shape. Where a genuine gap exists, it traces to one of the three items above (approval
authority, escalation timing, or result propagation), not to the logging mechanism itself. A
company implementing this layer should treat "does the append-only log capture X" as already
answered corpus-wide, and focus observability-specific mapping work on the specific ~10 workflows
named above rather than re-deriving a logging convention the other 114+ already demonstrate
correctly.
