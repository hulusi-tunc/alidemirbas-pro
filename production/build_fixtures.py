#!/usr/bin/env python3
import json

enriched = json.load(open("_analysis_enriched.json"))
dump = json.load(open("canonical-dump.json"))
journeys = {j["id"]: j for j in dump["journeys"]}

FIXTURES = [
    ("ACT-15", "Shortest journey in the library (5 nodes) - the minimal-content floor a renderer must still handle gracefully."),
    ("SUB-166", "Most nodes (23) - the maximal-content ceiling for a single graph view."),
    ("DOC-216", "Most edges (28) - highest edge-rendering density."),
    ("OWN-54", "Extreme complexity tier: most branch nodes (6), deepest forward chain (12), and the single longest node-headline text in the library (action.does, 483 chars) - also the surviving target of merged id CTL-240."),
    ("CTL-240", "Merged-ID alias fixture - resolves to OWN-54. Exercises the noindex/redirect/banner contract on a real target that is itself a complexity outlier."),
    ("RSK-194", "Most backward edges (4) tied, extreme complexity tier, deep chain (11) - the layout engine's worst-case cycle-guard candidate."),
    ("ACQ-05", "Rare no-re-entry (terminal:true) exit, tied for most exits (6), plus backward-edge/wait-timeout/external-handoff together - five behaviors on one graph."),
    ("ACQ-10", "Rare no-re-entry exit, highest fan-in (5) AND highest fan-out (8) on the same graph - the worst single-node convergence/divergence case."),
    ("RET-23", "Most handoffs (7), fan-out tied at 8 - a handoff-dense dispatcher graph."),
    ("ACT-12", "One of only 2 journeys with preemptedBy, combined with a competition group - both rare governance relationships on one fixture."),
    ("RET-30", "Most simultaneous behaviors (6) - the single hardest journey to render honestly."),
    ("RSK-200", "Longest journey title (87 chars) and longest reusableRule text (181 chars)."),
    ("RET-24", "Longest trigger evidence text (requires items, 319 chars combined)."),
    ("RET-28", "Longest branch.when text (211 chars) - overflow case distinct from the short branch.label."),
    ("CMS-203", "Longest branch.label (73 chars) - tests the short-label assumption a chip/pill component would make."),
    ("RET-27", "Longest single guardrail item (497 chars) and longest wait.timeout.reason (208 chars) - the most extreme unbounded-text case in the whole content contract."),
    ("FBK-41", "Self-contained structure (never hands off, tied for most exits at 6) - represents the primaryStructure category no other fixture covers."),
]

ids = [f[0] for f in FIXTURES]
print("count:", len(FIXTURES), "unique:", len(set(ids)))
assert len(set(ids)) == len(FIXTURES)
active_ids = set(journeys.keys())
merged_ids = set(dump["mergedInto"].keys())
for i in ids:
    assert i in active_ids or i in merged_ids, i

out = []
for i, reason in FIXTURES:
    is_merged = i in dump["mergedInto"]
    real_id = dump["mergedInto"][i] if is_merged else i
    j = journeys[real_id]
    a = enriched[real_id]
    out.append({
        "id": i, "reason": reason,
        "category": j["category"], "nodeCount": a["nodeCount"], "edgeCount": a["edgeCount"],
        "primaryStructure": a["primaryStructure"], "behaviors": a["behaviors"],
        "complexityTier": a["complexityTier"], "isMergedAlias": is_merged,
        "resolvesTo": real_id if is_merged else None,
    })
json.dump(out, open("journey-fixture-set.json", "w"), ensure_ascii=False, indent=2)
print("fixture set written:", len(out))

structs = {f["primaryStructure"] for f in out}
print("primaryStructure coverage:", structs)
behs = set(b for f in out for b in f["behaviors"])
print("behavior coverage:", behs)
