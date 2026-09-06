# Readiness matrix — 71 orchestration-bearing Customer Journeys

Generated from `implementation-contracts.json` after the production-readiness gap-closure round
(P0 = 0 across all 71). See `COMMUNICATING-CUSTOMER-JOURNEYS-AUDIT.md` for the corpus-count note
(68 vs 71), the full per-journey audit, and the executive summary this table is a compressed index
of. "Main missing contract" is the gap area with the most findings on that journey, not
necessarily its most severe one — read the journey's own GAPS section for severity.

## Round-over-round

| | Before this round | After this round |
|---|--:|--:|
| READY | 1 | 0 |
| READY WITH MAPPING | 50 | 71 |
| NEEDS CONTRACT WORK | 20 | 0 |
| NEEDS CANONICAL CHANGE | 0 | 0 |
| P0 | 20 | 0 |
| P1 | 58 | 45 |
| P2 | 26 | 27 |

The READY count moved to 0, not up: REM-151 was re-derived rather than carried over from the prior
round, and on inspection it carries a genuine open P1 (see its own GAPS section) - no journey in
this corpus needs literally zero company decisions, which is what READY (as distinct from READY
WITH MAPPING) actually means. One P1 (ACT-14's own suppression-signal exposure) downgraded to P2
on inspection - see its own GAPS section.

| Journey | Readiness | P0 | P1 | Main missing contract | Canonical change? |
|---|---|--:|--:|---|---|
| ACC-261 | READY WITH MAPPING | 0 | 1 | handoff | no |
| ACC-263 | READY WITH MAPPING | 0 | 0 | none | no |
| ACQ-04 | READY WITH MAPPING | 0 | 1 | data | no |
| ACQ-09 | READY WITH MAPPING | 0 | 0 | config | no |
| ACQ-11 | READY WITH MAPPING | 0 | 0 | config | no |
| ACQ-12 | READY WITH MAPPING | 0 | 0 | outcome | no |
| ACQ-13 | READY WITH MAPPING | 0 | 1 | config | no |
| ACQ-285 | READY WITH MAPPING | 0 | 0 | instance | no |
| ACT-11 | READY WITH MAPPING | 0 | 0 | none | no |
| ACT-12 | READY WITH MAPPING | 0 | 0 | config | no |
| ACT-13 | READY WITH MAPPING | 0 | 0 | none | no |
| ACT-14 | READY WITH MAPPING | 0 | 0 | suppression | no |
| ACT-17 | READY WITH MAPPING | 0 | 0 | none | no |
| ACT-18 | READY WITH MAPPING | 0 | 0 | none | no |
| ACT-19 | READY WITH MAPPING | 0 | 0 | none | no |
| ACT-20 | READY WITH MAPPING | 0 | 0 | none | no |
| CON-264 | READY WITH MAPPING | 0 | 1 | events | no |
| CON-272 | READY WITH MAPPING | 0 | 0 | channel | no |
| CON-283 | READY WITH MAPPING | 0 | 1 | config | no |
| DEC-184 | READY WITH MAPPING | 0 | 1 | config | no |
| DEC-267 | READY WITH MAPPING | 0 | 0 | none | no |
| DOC-214 | READY WITH MAPPING | 0 | 0 | none | no |
| DOC-215 | READY WITH MAPPING | 0 | 0 | none | no |
| DOC-220 | READY WITH MAPPING | 0 | 0 | none | no |
| DOC-286 | READY WITH MAPPING | 0 | 0 | none | no |
| FBK-41 | READY WITH MAPPING | 0 | 0 | handoff | no |
| FBK-42 | READY WITH MAPPING | 0 | 1 | channel | no |
| FBK-43 | READY WITH MAPPING | 0 | 1 | handoff | no |
| FBK-46 | READY WITH MAPPING | 0 | 1 | channel | no |
| FBK-47 | READY WITH MAPPING | 0 | 0 | none | no |
| FBK-49 | READY WITH MAPPING | 0 | 0 | none | no |
| FIN-134 | READY WITH MAPPING | 0 | 1 | data | no |
| FIN-137 | READY WITH MAPPING | 0 | 2 | outcome | no |
| FUL-146 | READY WITH MAPPING | 0 | 1 | config | no |
| FUL-148 | READY WITH MAPPING | 0 | 2 | events | no |
| FUL-265 | READY WITH MAPPING | 0 | 1 | events | no |
| FUL-276 | READY WITH MAPPING | 0 | 0 | config | no |
| IDN-270 | READY WITH MAPPING | 0 | 1 | data | no |
| IDN-271 | READY WITH MAPPING | 0 | 1 | suppression | no |
| IDN-81 | READY WITH MAPPING | 0 | 1 | suppression | no |
| IDN-84 | READY WITH MAPPING | 0 | 1 | config | no |
| IDN-85 | READY WITH MAPPING | 0 | 0 | suppression | no |
| INC-254 | READY WITH MAPPING | 0 | 0 | none | no |
| INT-269 | READY WITH MAPPING | 0 | 1 | source-of-truth | no |
| INT-278 | READY WITH MAPPING | 0 | 0 | none | no |
| REL-284 | READY WITH MAPPING | 0 | 0 | none | no |
| REM-151 | READY WITH MAPPING | 0 | 1 | source-of-truth | no |
| REM-152 | READY WITH MAPPING | 0 | 2 | handoff | no |
| REM-157 | READY WITH MAPPING | 0 | 1 | handoff | no |
| RET-24 | READY WITH MAPPING | 0 | 1 | config | no |
| RET-26 | READY WITH MAPPING | 0 | 2 | config | no |
| RET-28 | READY WITH MAPPING | 0 | 1 | config | no |
| RET-30 | READY WITH MAPPING | 0 | 2 | config | no |
| RET-31 | READY WITH MAPPING | 0 | 1 | data | no |
| RET-32 | READY WITH MAPPING | 0 | 1 | config | no |
| RLT-279 | READY WITH MAPPING | 0 | 0 | none | no |
| RSK-273 | READY WITH MAPPING | 0 | 1 | config | no |
| SCH-180 | READY WITH MAPPING | 0 | 2 | instance | no |
| SCH-266 | READY WITH MAPPING | 0 | 2 | channel | no |
| SCH-277 | READY WITH MAPPING | 0 | 1 | config | no |
| SCH-280 | READY WITH MAPPING | 0 | 1 | source-of-truth | no |
| SCH-282 | READY WITH MAPPING | 0 | 1 | data | no |
| SUB-163 | READY WITH MAPPING | 0 | 1 | config | no |
| SUB-262 | READY WITH MAPPING | 0 | 1 | config | no |
| TIM-268 | READY WITH MAPPING | 0 | 1 | channel | no |
| TIM-274 | READY WITH MAPPING | 0 | 0 | none | no |
| TIM-281 | READY WITH MAPPING | 0 | 0 | handoff | no |
| TIM-61 | READY WITH MAPPING | 0 | 0 | none | no |
| TIM-63 | READY WITH MAPPING | 0 | 1 | data | no |
| TRM-106 | READY WITH MAPPING | 0 | 0 | none | no |
| TRM-275 | READY WITH MAPPING | 0 | 0 | none | no |
