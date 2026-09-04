# Operational Workflows — new validator coverage (repair round, 2026-09-04)

Two new mechanical validators were added to `scripts/validate-canonical.mjs` this round, per Part
13/14 of the governing repair brief — the two candidates from `VALIDATOR-OPPORTUNITIES.md` judged
mechanically buildable across the corpus without hardcoding company policy or producing an
unacceptable false-positive rate. Both are scoped to `operationalIds` — a locally-computed set
mirroring `surfaceOf()`'s own operational classification (not in `MECHANISM_IDS`, sends no message
channel, not a customer-category journey with a customer-worded entity) — so neither fires on
Customer Journeys, Silent Lifecycle States, or Runtime Mechanisms.

Run: `node scripts/validate-canonical.mjs` (also wired into `npm run validate:canonical`).

---

## `durable_work_without_idempotency` (WARNING)

**Rule:** for every operational-surface action node that appends to a durable field
(`writes[].mode === "append"`) and declares no `idempotencyKey`, warn.

**Severity: WARNING, not ERROR.** The corpus predates the `ActionNode.idempotencyKey` structural
convention entirely (Part 11 of the brief); flipping this to ERROR corpus-wide would fail the build
on hundreds of pre-existing, mostly-benign append-only log writes (observability trails, history
records) that are not the consequential-effect duplication risk the audit's actual P0s named. This
mirrors the phased approach the Runtime Mechanism round took with its own analogous idempotency
validator: WARN first across the whole surface, then ERROR is reserved for the smaller, provably
unsafe subset (which the 11 P0 repairs this round already closed directly in source, each with its
own declared `idempotencyKey`).

**Defect class it catches:** a replayed trigger, duplicate event delivery, or retried handoff
causing an action to append a second record to a durable field with no way to detect or collapse
the duplicate — the exact shape of the `RSK-192`/`RSK-198`/`SUB-164` P0s this round fixed.

**Current count: 570 warnings** across the 124-workflow operational surface. This number is large
because it is deliberately unfiltered — every append-mode write without a key counts, including the
large majority that are genuinely low-risk (append-only audit/history logs where a duplicate entry
is harmless or already deduplicated by the log's own timestamp/actor fields, not the kind of
consequential financial/manual-effect duplication the P0 register cared about). This is why the
validator is a WARNING to be triaged by domain, not a build-breaking gate — narrowing it to the
subset that is genuinely production-unsafe is future work, not this round's (see
`VALIDATOR-OPPORTUNITIES.md`'s remaining candidates for related follow-up ideas), and the 11
already-known-critical instances were fixed directly at the source rather than left for the
validator to flag.

**False-positive considerations:** a read-only review/evaluation node is excluded by construction
(only `kind === "action"` nodes with an actual `writes[].mode === "append"` entry are considered —
a node that only reads or that writes with `mode !== "append"` never fires this rule).

**Example fixture:** any operational action whose `does` text describes recording/logging/appending
information with no `idempotencyKey` field — e.g. before this round's fix, `RSK-192`'s `a.case`
("if no case already exists... create one") had no key; it now declares
`idempotencyKey: "risk_subject_id + a.case"` and no longer contributes to this count.

---

## `workflow_result_unconsumed` (WARNING)

**Rule:** for every operational-surface workflow with zero corpus-wide inbound handoff consumers
(no other journey's `handoffs[].to` names it) **and** zero outbound handoffs of its own, warn that
it is fully isolated.

**Severity: WARNING, not ERROR**, and deliberately narrow-scoped (the AND, not OR, of "nothing
sends to me" and "I send to nothing") per Part 13's explicit instruction: "identify consequential
outputs with no downstream consumer... without flagging legitimate terminal/event-driven workflows
merely for lacking a canonical handoff." A workflow with outbound handoffs but no found inbound
consumer is very often a legitimate event-driven entry point (something external triggers it) —
flagging those would produce mass false positives across the corpus's many externally-triggered
operational workflows. Only true double-isolation (nothing in, nothing out) is flagged.

**Defect class it catches:** a workflow whose result silently has nowhere to go and which nothing
in the current corpus ever invokes — the shape a genuine orphan (as opposed to a legitimate
external-entry-point) would have.

**Current count: 0 warnings.** This is an honest, currently-empty result, not a validator that
does nothing: `REL-99` and `INT-120` — the two workflows `BOUNDARY-CLASSIFICATION-AUDIT.md` /
`CONSUMER-COVERAGE.md` name as orphan-*candidates* from the narrative audit — both have at least
one outbound handoff of their own, so the mechanical AND-condition does not (and structurally
should not) flag them; the audit's own narrative judgment that they are nonetheless orphan
candidates (a valid workflow with no traceable real trigger in the current corpus, as opposed to
zero outbound activity) is a different, softer signal this mechanical rule does not attempt to
replicate — see `CONSUMER-COVERAGE.md` for that judgment. The validator exists to catch a *future*
regression (a workflow that becomes fully isolated on both sides as the corpus evolves), not to
re-flag the two already-documented candidates.

**False-positive considerations:** relies on the same corpus-wide handoff-target scan
`handoff_identifier_unprovenanced` already performs (`ids.has(n.to)` — only handoffs targeting a
real journey id count as "inbound"), so a handoff to a merged/retired id is correctly not counted
as a live consumer.

**Example fixture:** a hypothetical operational workflow added with no `handoffs` array and no
other journey's `handoffs[].to` referencing its id would trigger this warning immediately, per the
rule's own AND-condition read directly off `handoffTargets`/`hasOutbound` in
`scripts/validate-canonical.mjs`.

---

## Why only these two

Per Part 13's own instruction ("do not add validators for validator-count vanity"), the remaining
candidates in `VALIDATOR-OPPORTUNITIES.md` were left unimplemented this round because each would
require either hardcoding a company-specific policy shape (approval thresholds, team/queue names)
that the round's own "do not invent policy" rule forbids, or would need a corpus-wide structural
convention (e.g. a declared `businessCompletion` field) that does not yet exist and would itself be
a canonical-schema change requiring its own justification — out of scope for a validator addition.
