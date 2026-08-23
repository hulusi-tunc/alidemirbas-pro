#!/usr/bin/env python3
"""journey-layout-risks.json — real structural risks a layout engine will
meet, with affected counts and worst-case IDs. No layout is designed here."""
import json, collections

enriched = json.load(open("_analysis_enriched.json"))


def top(field, n=5):
    return [(a["id"], a[field]) for a in sorted(enriched.values(), key=lambda x: -x[field])[:n]]


risks = []

risks.append({
    "risk": "high-branch-count",
    "description": "A condition node's arm count varies 2 to 6+; a layout that assumes 2-3 arms per fork will overflow.",
    "affectedCount": sum(1 for a in enriched.values() if a["branchNodeCount"] >= 4),
    "threshold": ">=4 branch nodes in one journey",
    "worst": top("branchNodeCount"),
    "maxValue": max(a["branchNodeCount"] for a in enriched.values()),
})

risks.append({
    "risk": "long-forward-chain",
    "description": "Depth from entry to the furthest node along non-backward edges. A layout that assumes a short chain will need vertical scroll or compression.",
    "affectedCount": sum(1 for a in enriched.values() if a["maxDepth"] >= 10),
    "threshold": ">=10 levels deep",
    "worst": top("maxDepth"),
    "maxValue": max(a["maxDepth"] for a in enriched.values()),
})

risks.append({
    "risk": "backward-edges",
    "description": "An edge whose target sits earlier in reading order than its source. Needs an explicit upward-arrow or back-reference treatment, not a straight-line layout.",
    "affectedCount": sum(1 for a in enriched.values() if a["backwardEdgeCount"] >= 1),
    "threshold": ">=1 backward edge",
    "worst": top("backwardEdgeCount"),
    "maxValue": max(a["backwardEdgeCount"] for a in enriched.values()),
})

risks.append({
    "risk": "true-graph-cycles",
    "description": "A backward edge is not automatically a cycle - only 33 of the 125 backward-edge journeys form an actual cycle (a path that returns to its own source). These need a recursion/traversal guard in the layout algorithm itself; the other 92 are simple back-references and do not.",
    "affectedCount": sum(1 for a in enriched.values() if a["hasTrueCycle"]),
    "threshold": "DFS-detected true cycle",
    "worst": [a["id"] for a in enriched.values() if a["hasTrueCycle"]][:10],
    "maxValue": None,
})

risks.append({
    "risk": "many-exits",
    "description": "Multiple named terminal states from one journey. A layout with one exit slot at the bottom fails for these.",
    "affectedCount": sum(1 for a in enriched.values() if a["exitCount"] >= 4),
    "threshold": ">=4 exits",
    "worst": top("exitCount"),
    "maxValue": max(a["exitCount"] for a in enriched.values()),
})

risks.append({
    "risk": "handoff-density",
    "description": "Cross-journey and external handoffs on one graph. Each is a link leaving the current view - a layout that treats handoffs like ordinary nodes undercounts how often the reader leaves this journey.",
    "affectedCount": sum(1 for a in enriched.values() if a["handoffCount"] >= 4),
    "threshold": ">=4 handoffs",
    "worst": top("handoffCount"),
    "maxValue": max(a["handoffCount"] for a in enriched.values()),
})

risks.append({
    "risk": "node-convergence (fan-in)",
    "description": "Multiple distinct nodes pointing at the same target node. A tree-shaped layout algorithm cannot represent convergence without either duplicating the node or drawing a shared-target edge.",
    "affectedCount": sum(1 for a in enriched.values() if a["maxFanIn"] >= 3),
    "threshold": ">=3 incoming edges to one node",
    "worst": top("maxFanIn"),
    "maxValue": max(a["maxFanIn"] for a in enriched.values()),
})

risks.append({
    "risk": "node-divergence (fan-out)",
    "description": "One node with many outgoing edges (a condition with many branches, or a wait's two arms feeding a further hub). ACQ-10 alone has BOTH the highest fan-in (5) and highest fan-out (8) — the single worst node-density case in the library.",
    "affectedCount": sum(1 for a in enriched.values() if a["maxFanOut"] >= 5),
    "threshold": ">=5 outgoing edges from one node",
    "worst": top("maxFanOut"),
    "maxValue": max(a["maxFanOut"] for a in enriched.values()),
})

risks.append({
    "risk": "long-labels-at-fork-points",
    "description": "branch.when text (median 60, max 211 chars, see journey-content-stats.json) rendered at a branch point competes for space with the branch arms themselves — this is a layout risk, not just a content-length one, because it happens exactly where the graph is already widest.",
    "affectedCount": None,
    "threshold": "n/a — cross-reference with journey-content-stats.json's branch.when row",
    "worst": None,
    "maxValue": None,
})

layout_stress_fixtures = sorted(set(
    [i for r in risks if r.get("worst") for i, *_ in (r["worst"] if isinstance(r["worst"][0], (list, tuple)) else [(x,) for x in r["worst"]])]
))

json.dump({
    "risks": risks,
    "layoutStressFixtureCandidates": layout_stress_fixtures,
    "note": "These candidates overlap heavily with journey-fixture-set.json by design — the same outlier graphs stress both content and layout.",
}, open("journey-layout-risks.json", "w"), ensure_ascii=False, indent=2)
print("journey-layout-risks.json written,", len(risks), "risk categories")
print("stress fixture candidates:", layout_stress_fixtures)
