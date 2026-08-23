#!/usr/bin/env python3
"""Deep structural analysis of all 255 canonical journeys. Derives graph
taxonomy, complexity metrics, and content stats from REAL data — no assumed
taxonomy. Read-only against canonical-dump.json."""
import json, collections, statistics

d = json.load(open("canonical-dump.json"))
journeys = d["journeys"]
merged = d["mergedInto"]
print(f"{len(journeys)} journeys loaded")

def successors(n):
    k = n["kind"]
    if k in ("trigger", "action", "outcome"):
        return [(n["next"], "forward")]
    if k == "condition":
        return [(b["to"], "branch") for b in n["branches"]]
    if k == "wait":
        return [(n["onEvent"], "wait-event"), (n["onTimeout"], "wait-timeout")]
    if k == "handoff":
        return [(n["to"], "handoff")]
    return []  # exit

def analyze_journey(j):
    nodes = {n["id"]: n for n in j["nodes"]}
    entry = j["entry"]

    # BFS order + backward-edge detection (mirrors canonical-view.ts's logic)
    order = []
    seen = set()
    queue = [entry]
    while queue:
        nid = queue.pop(0)
        if nid in seen or nid not in nodes:
            continue
        seen.add(nid)
        order.append(nid)
        for tgt, kind in successors(nodes[nid]):
            if tgt in nodes and tgt not in seen:
                queue.append(tgt)
    pos = {nid: i for i, nid in enumerate(order)}

    edges = []
    for nid, n in nodes.items():
        for tgt, kind in successors(n):
            is_external = tgt.startswith("external:")
            is_journey = (not is_external) and (tgt not in nodes) and (tgt == tgt)  # handoff to another journey id
            is_internal = tgt in nodes
            backward = is_internal and nid in pos and tgt in pos and pos[tgt] <= pos[nid]
            edges.append({
                "from": nid, "to": tgt, "syntacticKind": kind,
                "isExternal": is_external,
                "isCrossJourney": (kind == "handoff" and not is_external),
                "isInternal": is_internal,
                "isBackward": backward,
            })

    branch_nodes = [n for n in j["nodes"] if n["kind"] == "condition"]
    wait_nodes = [n for n in j["nodes"] if n["kind"] == "wait"]
    exit_nodes = [n for n in j["nodes"] if n["kind"] == "exit"]
    handoff_nodes = [n for n in j["nodes"] if n["kind"] == "handoff"]
    terminal_exits = [n for n in exit_nodes if n.get("terminal")]

    backward_edges = [e for e in edges if e["isBackward"]]
    external_edges = [e for e in edges if e["isExternal"]]
    cross_journey_edges = [e for e in edges if e["isCrossJourney"]]

    # incoming edge fan-in (internal only)
    incoming = collections.Counter(e["to"] for e in edges if e["isInternal"])
    outgoing = collections.Counter(e["from"] for e in edges)
    max_fan_in = max(incoming.values(), default=0)
    max_fan_out = max(outgoing.values(), default=0)

    # longest forward chain (rough depth via BFS levels, backward edges excluded to avoid cycles)
    depth = {entry: 0}
    q = [entry]
    while q:
        nid = q.pop(0)
        for e in edges:
            if e["from"] == nid and e["isInternal"] and not e["isBackward"]:
                nd = depth[nid] + 1
                if e["to"] not in depth or nd > depth[e["to"]]:
                    depth[e["to"]] = nd
                    q.append(e["to"])
    max_depth = max(depth.values(), default=0)

    reentry = any(nid not in seen for nid in nodes)  # unreached-by-forward-BFS => only reachable via backward edge
    has_reentry_field = any((n["kind"] == "exit") and n.get("reEntry") and "no" not in n["reEntry"].lower()[:2] for n in exit_nodes)

    return {
        "id": j["id"], "category": j["category"],
        "nodeCount": len(j["nodes"]),
        "edgeCount": len(edges),
        "branchNodeCount": len(branch_nodes),
        "branchEdgeCount": sum(len(n["branches"]) for n in branch_nodes),
        "waitCount": len(wait_nodes),
        "exitCount": len(exit_nodes),
        "terminalExitCount": len(terminal_exits),
        "handoffCount": len(handoff_nodes),
        "externalHandoffCount": sum(1 for n in handoff_nodes if n["to"].startswith("external:")),
        "crossJourneyHandoffCount": sum(1 for n in handoff_nodes if not n["to"].startswith("external:")),
        "backwardEdgeCount": len(backward_edges),
        "maxFanIn": max_fan_in,
        "maxFanOut": max_fan_out,
        "maxDepth": max_depth,
        "hasBranches": len(branch_nodes) > 0,
        "hasBackwardEdges": len(backward_edges) > 0,
        "hasWait": len(wait_nodes) > 0,
        "hasExternalHandoff": len(external_edges) > 0,
        "hasCrossJourneyHandoff": len(cross_journey_edges) > 0,
        "hasMultipleExits": len(exit_nodes) > 1,
        "hasTerminalExit": len(terminal_exits) > 0,
        "hasPreemption": bool(j.get("preemptedBy")),
        "hasCompetition": bool(j.get("competition")),
        "hasDistinctFrom": bool(j.get("distinctFrom")),
        "edges": edges,
    }

analyses = [analyze_journey(j) for j in journeys]
byid_a = {a["id"]: a for a in analyses}
json.dump(analyses, open("_analysis_raw.json", "w"), ensure_ascii=False, indent=1)
print("wrote _analysis_raw.json")

# ---- distributions ----
print("\n--- node kind distribution ---")
nk = collections.Counter(n["kind"] for j in journeys for n in j["nodes"])
print(dict(nk), "sum=", sum(nk.values()))

print("\n--- complexity metric distributions ---")
for field in ("nodeCount","edgeCount","branchNodeCount","backwardEdgeCount","handoffCount","exitCount","maxDepth","maxFanIn","maxFanOut"):
    vals = sorted(a[field] for a in analyses)
    n = len(vals)
    print(f"{field:20s} min={vals[0]:3d} p50={vals[n//2]:3d} p90={vals[int(n*0.9)]:3d} p95={vals[int(n*0.95)]:3d} max={vals[-1]:3d} (max id={[a['id'] for a in analyses if a[field]==vals[-1]][0]})")

print("\n--- behavior flags (count true) ---")
for flag in ("hasBranches","hasBackwardEdges","hasWait","hasExternalHandoff","hasCrossJourneyHandoff","hasMultipleExits","hasTerminalExit","hasPreemption","hasCompetition","hasDistinctFrom"):
    c = sum(1 for a in analyses if a[flag])
    print(f"{flag:25s} {c}")
