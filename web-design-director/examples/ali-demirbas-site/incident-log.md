# Incident log — alidemirbas.com.tr

The provenance behind this project's citations inside `methodology/`.
Referenced by dated STATUS lines there (per core P14); expanded here so an
external reader has the actual incident, not just a commit hash.

## Dead canvas (commit `a9178b2`)

The homepage's every section below the hero was a single left-aligned
column at 1248px inside a 1440px viewport — the right 40–50% of the page
held nothing on About, What I Do, Lab, and Calculators. The page was
5841px tall and a large fraction of that was absence. Diagnosed from a
full-page render, not from reading the code; fixed with statement+witness
and measure-narrowing moves. This is anti-patterns.md #4 and #5's source
incident.

## Padding-only seams (same commit)

400–600px of vertical nothing between sections, same commit. This incident
is what the padding-only seam detector (qa.md's VALIDATED PROJECT DETECTOR)
was built to catch — it separated this known-bad case from a known-good
case and a positive control at 3/0/0 within this project.

## The 19-one-name-boxes case

A card grid where each card held a single label and nothing else — a fence
around a word, not a card earning its border. Rejected in review. The
counter-example that shaped the rule (anti-patterns.md #6): this project's
own Stack band, a bento of bordered cells that works because each cell
holds a real logo, a real category tag, and the overflow cell holds a real
count.

## The withdrawn Stack-band diagnosis

An earlier design skill revision claimed the Stack band was "empty cards."
This was wrong: the screenshots behind that claim were taken mid-scroll-
reveal-animation, before the logos had faded in. The correction produced
the motion-settle capture rule now in qa.md B's capture protocol
(VALIDATED IN PROJECT — "a real wrong verdict here"). Recorded as a
withdrawal, not silently erased, per core P14.

## Controlled Experiment 1 — composition-grammar planning

A blind A/B test of composition-grammar-vocabulary planning against
ordinary prose planning, on one isolated page (`/experiment-a` /
`/experiment-b` in this project's repo, product-marketing register). Result:
MIXED — machine, blind critic, and human preference all favored the
grammar-planned branch on section rhythm and canvas use, but the plan was
3.6x longer and the grammar branch shipped the experiment's only hard
overflow defect, so the result cannot cleanly separate "the vocabulary
works" from "more deliberate planning works." Full dossier lives in this
project's own repository (`EXPERIMENT-1.md`) rather than duplicated here.
This is core P12b's evidence source, and the reason P12b remains
`[PLAUSIBLE]` rather than promoted.

## Production domain mismatch

The production domain for this project was found, mid-audit, to be serving
an entirely different, older site than the repository this methodology was
built against — discovered by checking the live site directly, not by
assumption. This is the concrete incident behind
`protocols/pre-post-deploy-qa.md`'s existence: "exporting files" and
"shipping the intended result" were, for a real period, two different
facts about this project.
