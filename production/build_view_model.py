#!/usr/bin/env python3
"""journey-view-model.json — all 255 journeys reshaped into the canonical
production model (journey-view-model.schema.json). No new semantic content;
pure reshape + deterministic derived metadata."""
import json

dump = json.load(open("canonical-dump.json"))
enriched = json.load(open("_analysis_enriched.json"))
journeys = {j["id"]: j for j in dump["journeys"]}
cat_titles = dump["categoryTitles"]

FAMILY_BY_SYNTACTIC = {
    "forward": "forward",
    "branch": "branch",
    "wait-event": "wait-event",
    "wait-timeout": "wait-timeout",
    "handoff": None,  # resolved below into cross-journey-handoff / external
}


def humanize(event):
    words = event.replace("_", " ").replace(".", " ").strip()
    return words[0].upper() + words[1:] if words else words


def node_headline(n):
    k = n["kind"]
    if k == "trigger":
        return humanize(n["event"])
    if k == "action":
        return n["does"]
    if k == "condition":
        return n["asks"]
    if k == "wait":
        return "until " + ", or ".join(n["until"])
    if k == "outcome":
        return n["state"]
    if k == "exit":
        return n["state"]
    if k == "handoff":
        target = journeys.get(n["to"])
        return n["to"] if n["to"].startswith("external:") else (target["name"] if target else n["to"])
    return n["id"]


def node_detail(n):
    k = n["kind"]
    if k == "wait":
        return f"timeout after {n['timeout']['after']}"
    if k == "outcome":
        return n["means"]
    if k == "exit":
        return n["reEntry"]
    if k == "handoff":
        return n["on"]
    return None


def build(jid):
    j = journeys[jid]
    a = enriched[jid]
    trigger = next(n for n in j["nodes"] if n["kind"] == "trigger")

    nodes = []
    for n in j["nodes"]:
        nodes.append({
            "id": n["id"], "kind": n["kind"],
            "headline": node_headline(n),
            "detail": node_detail(n),
            "isEntry": n["id"] == j["entry"],
            "terminal": bool(n.get("terminal", False)),
        })

    edges = []
    edge_index_by_family = {"backward": [], "branch": [], "cross-journey-handoff": [], "external": []}
    for e in a["edges"]:
        if e["syntacticKind"] == "handoff":
            family = "external" if e["isExternal"] else "cross-journey-handoff"
        elif e["isBackward"]:
            family = "backward"
        else:
            family = e["syntacticKind"]
        label = None
        when = None
        src = next((n for n in j["nodes"] if n["id"] == e["from"]), None)
        if src and src["kind"] == "condition":
            b = next((b for b in src["branches"] if b["to"] == e["to"]), None)
            if b:
                label, when = b["label"], b["when"]
        elif src and src["kind"] == "wait":
            label = "on event" if e["syntacticKind"] == "wait-event" else "on timeout"
            when = ", ".join(src["until"]) if e["syntacticKind"] == "wait-event" else src["timeout"]["reason"]
        elif src and src["kind"] == "handoff":
            when = src["on"]
        edges.append({"from": e["from"], "to": e["to"], "family": family, "label": label, "when": when})
        idx = len(edges) - 1
        if family == "backward": edge_index_by_family["backward"].append(idx)
        if e["syntacticKind"] == "branch": edge_index_by_family["branch"].append(idx)
        if family == "cross-journey-handoff": edge_index_by_family["cross-journey-handoff"].append(idx)
        if family == "external": edge_index_by_family["external"].append(idx)

    terminal_nodes = [n["id"] for n in j["nodes"] if n["kind"] in ("exit", "handoff")]

    return {
        "identity": {
            "id": j["id"], "slug": j["slug"], "category": j["category"],
            "categoryTitle": cat_titles.get(j["category"], j["category"]),
            "title": j["name"], "purpose": j["purpose"],
        },
        "entry": {
            "trigger": humanize(trigger["event"]),
            "triggerEvidenceClass": trigger["evidence"]["source"],
            "requires": list(trigger["evidence"]["requires"]),
            "insufficientAlone": list(trigger["evidence"].get("insufficientAlone") or []),
        },
        "graph": {
            "nodes": nodes, "edges": edges,
            "startNode": j["entry"], "terminalNodes": terminal_nodes,
            "backwardEdgeIds": edge_index_by_family["backward"],
            "branchEdgeIds": edge_index_by_family["branch"],
            "handoffEdgeIds": edge_index_by_family["cross-journey-handoff"],
            "externalEdgeIds": edge_index_by_family["external"],
        },
        "relationships": {
            "handoffs": [{"to": n["to"], "isExternal": n["to"].startswith("external:")} for n in j["nodes"] if n["kind"] == "handoff"],
            "distinctFrom": list(j.get("distinctFrom") or []),
            "competition": j.get("competition"),
            "preemptedBy": list(j.get("preemptedBy") or []),
        },
        "governance": {
            "guardrails": list(j["guardrails"]),
            "reusableRule": j["reusableRule"],
            "entityScope": j["entity"]["scope"],
            "entityNote": j["entity"]["note"],
        },
        "derived": {
            "hasBranches": a["hasBranches"], "hasBackwardEdges": a["hasBackwardEdges"],
            "hasTrueCycle": a["hasTrueCycle"], "hasExternalHandoff": a["hasExternalHandoff"],
            "hasCrossJourneyHandoff": a["hasCrossJourneyHandoff"], "hasWait": a["hasWait"],
            "hasReEntryException": a["hasTerminalExit"], "hasTerminalExit": a["hasTerminalExit"],
            "hasMultipleExits": a["hasMultipleExits"], "hasPreemption": a["hasPreemption"],
            "hasCompetition": a["hasCompetition"],
            "nodeCount": a["nodeCount"], "edgeCount": a["edgeCount"],
            "branchNodeCount": a["branchNodeCount"], "backwardEdgeCount": a["backwardEdgeCount"],
            "handoffCount": a["handoffCount"], "exitCount": a["exitCount"],
            "maxDepth": a["maxDepth"], "maxFanIn": a["maxFanIn"], "maxFanOut": a["maxFanOut"],
            "primaryStructure": a["primaryStructure"], "behaviors": a["behaviors"],
            "complexityTier": a["complexityTier"], "complexityScore": a["complexityScore"],
        },
    }


out = [build(jid) for jid in sorted(journeys.keys(), key=lambda x: (x.split("-")[0], int(x.split("-")[1])))]
json.dump(out, open("journey-view-model.json", "w"), ensure_ascii=False, indent=2)
print("journey-view-model.json:", len(out), "records")
