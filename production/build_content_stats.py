#!/usr/bin/env python3
"""journey-content-stats.json — real content-length extremes per field, so a
designer never guesses a constraint. No truncation anywhere; this measures
what already exists."""
import json

d = json.load(open("canonical-dump.json"))
journeys = d["journeys"]


def field_stats(label, values_with_id, single_line_risk):
    vals = [(len(v), i) for v, i in values_with_id if v]
    if not vals:
        return {"field": label, "n": 0}
    lens = sorted(v for v, _ in vals)
    n = len(lens)
    maxv, maxid = max(vals)
    return {
        "field": label,
        "n": n,
        "min": lens[0],
        "median": lens[n // 2],
        "p90": lens[int(n * 0.9)],
        "p95": lens[int(n * 0.95)],
        "max": maxv,
        "maxRecordId": maxid,
        "singleLineAssumptionRisk": single_line_risk,
    }


STATS = []
STATS.append(field_stats("journey.name (title)", [(j["name"], j["id"]) for j in journeys], "two-line — median 62, max 87 chars; a single-line title truncates ~10% of the library"))
STATS.append(field_stats("journey.purpose", [(j["purpose"], j["id"]) for j in journeys], "unbounded — this is prose, never single-line"))
STATS.append(field_stats("entity.note", [(j["entity"]["note"], j["id"]) for j in journeys], "unbounded — max is 3.5x the median, one real outlier (REL-91)"))
STATS.append(field_stats("reusableRule", [(j["reusableRule"], j["id"]) for j in journeys], "unbounded prose"))

triggers = [(n, j["id"]) for j in journeys for n in j["nodes"] if n["kind"] == "trigger"]
STATS.append(field_stats("trigger.event (raw, humanized for display)", [(t["event"], jid) for t, jid in triggers], "two-line safe at p95, but max=48 chars needs wrap"))
STATS.append(field_stats("trigger.evidence.requires (per item)", [(r, jid) for t, jid in triggers for r in t["evidence"]["requires"]], "unbounded — this is a list, never single-line; item COUNT also varies (see requiresCount)"))
STATS.append(field_stats("trigger.evidence.insufficientAlone (per item)", [(r, jid) for t, jid in triggers for r in (t["evidence"].get("insufficientAlone") or [])], "unbounded list"))

STATS.append(field_stats("guardrails (per item)", [(g, j["id"]) for j in journeys for g in j["guardrails"]], "DANGEROUS as single-line — median 71, max 497 chars (RET-27)"))
STATS.append(field_stats("distinctFrom.because", [(x["because"], j["id"]) for j in journeys for x in (j.get("distinctFrom") or [])], "unbounded prose, only present on 166/255 journeys"))

actions = [(n, j["id"]) for j in journeys for n in j["nodes"] if n["kind"] == "action"]
STATS.append(field_stats("action.does (node headline)", [(n["does"], jid) for n, jid in actions], "DANGEROUS — this is the node's HEADLINE with no secondary field, median 214, max 483 chars (OWN-54). A one-line node-headline assumption fails on the majority of action nodes."))

conditions = [(n, j["id"]) for j in journeys for n in j["nodes"] if n["kind"] == "condition"]
STATS.append(field_stats("condition.asks (node headline)", [(n["asks"], jid) for n, jid in conditions], "two-line safe (median 45, p95 74)"))
STATS.append(field_stats("branch.label (short, chip-safe)", [(b["label"], jid) for n, jid in conditions for b in n["branches"]], "single-line safe — median 13, p95 35, max 73 (CMS-203)"))
STATS.append(field_stats("branch.when (secondary text, separate field from label)", [(b["when"], jid) for n, jid in conditions for b in n["branches"]], "unbounded — must render as expandable/secondary, never inline with the label"))

waits = [(n, j["id"]) for j in journeys for n in j["nodes"] if n["kind"] == "wait"]
STATS.append(field_stats("wait.until (per item)", [(u, jid) for n, jid in waits for u in n["until"]], "unbounded list"))
STATS.append(field_stats("wait.timeout.after", [(n["timeout"]["after"], jid) for n, jid in waits], "single-line safe — median 35, max 119"))
STATS.append(field_stats("wait.timeout.reason", [(n["timeout"]["reason"], jid) for n, jid in waits], "unbounded prose, median 137"))

exits = [(n, j["id"]) for j in journeys for n in j["nodes"] if n["kind"] == "exit"]
STATS.append(field_stats("exit.state (node headline)", [(n["state"], jid) for n, jid in exits], "two-line safe, median 53"))
STATS.append(field_stats("exit.reEntry (secondary text)", [(n["reEntry"], jid) for n, jid in exits], "unbounded prose, median 115"))

handoffs = [(n, j["id"]) for j in journeys for n in j["nodes"] if n["kind"] == "handoff"]
STATS.append(field_stats("handoff.on (secondary text)", [(n["on"], jid) for n, jid in handoffs], "two-line safe at median, unbounded at max"))
STATS.append(field_stats("handoff.carries (per item)", [(c, jid) for n, jid in handoffs for c in n["carries"]], "unbounded list"))

json.dump({
    "fields": STATS,
    "guidance": (
        "single-line assumption is safe only for: branch.label, wait.timeout.after. "
        "two-line assumption is safe for: journey.name, trigger.event, condition.asks, exit.state. "
        "everything else — action.does (the most dangerous: it is a node's ONLY headline field "
        "and runs to 483 chars), purpose, entity.note, reusableRule, guardrails, distinctFrom.because, "
        "branch.when, wait.timeout.reason, exit.reEntry, handoff.on, and every list-typed field "
        "(requires, insufficientAlone, until, carries) — must be designed as unbounded text or lists, "
        "never clamped."
    ),
}, open("journey-content-stats.json", "w"), ensure_ascii=False, indent=2)
print("journey-content-stats.json written,", len(STATS), "fields")
