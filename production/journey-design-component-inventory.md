# Journey Design Component Inventory

For the designer redesigning journey diagrams. Answers one question:
**what do you actually have to design to correctly render all 255
canonical journeys?** Derived from a full scan of the live corpus
(255 journeys, 3,186 nodes, 3,816 edges) - nothing here was estimated
from a sample. `src/canonical/` was not modified; this is a read-only
audit layer. Regenerate anytime with
`node production/generate-journey-step-vocabulary.mjs`.

No colors, hex values, or icon drawings are prescribed below - only
what each visual channel should mean and how many distinct things need
representing.

---

## Structural Components (Level 1)

Six components, not seven. `outcome` occurs once in the entire corpus
(0.03% of nodes) - not enough to justify a seventh dedicated shape;
fold it into the Action treatment with its own label, and stop treating
it as a first-class type.

| Component | Occurrences | Journeys | Coverage | Visual role | Recommended differentiation |
|---|---|---|---|---|---|
| **Action** | 1,131 | 255/255 | 100% | The system does something (writes state, checks a fact, decides internally). The workhorse node - a third of all nodes. | Neutral/operational treatment. Not a decision, not terminal. |
| **Condition** | 702 | 254/255 | 99.6% | A real fork - always 2+ named branches. | The one node that must read as "a choice happens here" at a glance - see cardinality note below. |
| **Handoff** | 500 | 239/255 | 93.7% | Ownership leaves this journey. | Must read as "this journey's job ends here, control moves elsewhere" - distinct from Exit (job also ends, but nothing continues). |
| **Exit** | 433 | 225/255 | 88.2% | This journey's ownership ends, nothing continues. | Terminal treatment - the visual endpoint of a branch. |
| **Trigger** | 255 | 255/255 | 100% | Where the journey starts. | Exactly one per journey - the obvious entry marker. |
| **Wait** | 164 | 146/255 | 57.3% | An asynchronous pause with two named arms (event / timeout). | The only node with two *equally weighted* forward paths that aren't a business decision - needs to read differently from Condition's branches. |
| ~~Outcome~~ | 1 | 1/255 | 0.4% | *(folded into Action)* | Render as an Action card; the rare "mid-journey milestone" framing can live in the label alone. |

**This is the whole structural vocabulary.** No other `kind` value
exists in the schema or the data - verified against the full 3,186-node
scan, not assumed from the earlier filter-taxonomy audit's smaller
sample.

---

## Semantic Subtype Treatments (Level 2)

Only where the data actually supports a distinct treatment. Several
plausible subtypes were tested and **rejected** - see each section.

### Condition → branch cardinality (COMPONENT-level layout variant)

**553 binary (79%) vs. 149 multi-way (21%)**, 3-8 branches. This is a
structural fact, not a topic guess - a 2-branch fork and a 6-branch fan
are different shapes to draw regardless of what the question is about.
**Recommendation: one Condition component, two layout modes** (simple
two-arm split; fanned/listed for 3+). This is the single most
actionable finding in this audit for layout purposes.

A secondary **business-topic tag** (eligibility, identity, existence/
duplicate, state, timing, threshold, ownership) was tested and only
covers **39.5%** of conditions cleanly - real where it applies, too
thin to require. **Recommendation: LABEL ONLY / optional badge, never
required.**

### Trigger → evidence source (SUBTYPE TREATMENT - badge/icon, not a new shape)

Already a real schema field (`evidence.source`), not invented:
**authoritative 213 (84%), declared 21 (8%), behavioral 14 (5%),
inferred 7 (3%)**. This is the one property that changes what a journey
is *allowed to conclude* (per the canonical schema's own doc comment) -
worth a small badge distinguishing "a system of record confirmed this"
from "we're inferring this," but not a different Trigger shape.
**Recommendation: SUBTYPE TREATMENT, 4 values, all real, `inferred`
thin but genuine (7 uses).**

Event *names* (255, almost all unique) are **Level 3 instance
label**, never a design subtype - there is no clean way to cluster 255
mostly-unique business event names into a handful of design-meaningful
groups, and trying would just recreate Category.

### Handoff → internal vs. external (SUBTYPE TREATMENT)

**423 internal (85%, resolves to a real canonical journey) vs. 77
external (15%, `external:` prefix - a destination this library doesn't
model yet)**. Clean, structural, schema-derivable. **The current
renderer already does this correctly** - `CanonicalFlow.tsx`'s
`EdgeTarget` component already branches on `edge.kind === "external"`
vs. `"journey"` with different link treatments. No gap here; carry the
distinction forward into the redesign rather than re-deriving it.

Individual destination labels (`Route to ACQ-05`, `external:human-in-
the-loop-lifecycle`) are **Level 3 instance label**, never a subtype -
confirmed by instruction 9's own example.

### Exit → terminal flag (SUBTYPE TREATMENT, rare) + reason text (NOT recommended as a subtype)

**Terminal (state forbids re-entry): only 5/433 (1.2%)**. The current
renderer already treats this as a rare badge rather than a full
subtype (its own code comment says as much) - correct, keep it that
way.

**Reason-text clustering was tested** (completed/ineligible/failed/
expired/cancelled/suppressed/etc.) and covers only **33%** of exits
cleanly - the state text is highly journey-specific prose
("known profile, no lifecycle entered", "re-entered qualification")
that resists clean bucketing. **Recommendation: do NOT build a required
exit-reason subtype system.** Confidence here is LOW, not HIGH - flagged
explicitly rather than presented as settled (see Confidence Levels
below).

### Wait → no subtype evidenced

Tested `windowExtendsOnEngagement` (false on all 164 - zero variance)
and the `until`/`timeout` text (bespoke prose, no clean pattern).
**Recommendation: one Wait component, no subtypes.** The two arms
(event vs. timeout) are already structural, not a subtype question -
every Wait has both, always.

### Action → verb family (LABEL ONLY / optional icon, NOT required)

Every `does` sentence in this corpus is written as a leading imperative
verb by convention - a real, principled clustering signal. 10 families
cover **76.7%** of the 1,131 action nodes:

| Family | Occurrences | Categories | Goals |
|---|---|---|---|
| record-create | 455 | 26/26 | 21 |
| determine-classify | 109 | 25/26 | 21 |
| apply-establish | 56 | 22/26 | 17 |
| verify-validate | 47 | 21/26 | 15 |
| suppress-block | 45 | 20/26 | 15 |
| preserve-hold | 45 | 20/26 | 14 |
| reconcile-resolve | 37 | 20/26 | 18 |
| stop-close-release | 28 | 15/26 | 12 |
| collect-request | 24 | 15/26 | 11 |
| retry-execute | 16 | 12/26 | 6 |
| send-external | 6 | 5/26 | 4 |
| *(no family match)* | 263 (23.3%) | 26/26 | 21 |

Every family spans most of the 26 categories and most of the 20 goals -
this confirms Action families are a **reusable mechanism vocabulary**,
not a restatement of Category or Goal. But at 77% coverage with 23%
falling to no match at all, and given none of these families changes
*how a viewer should read the node* (all are still "the system did
something internally"), **recommend LABEL ONLY - an optional small icon
if the design wants one, never a required differentiator.** Forcing a
required 11-way Action subtype system for a 23%-uncovered, low-stakes
distinction would be exactly the over-fragmentation this audit is meant
to catch.

`send-external` (6 occurrences: "Send education matched to the reason,"
"Send one follow-up," "Send the reminder defined for this threshold")
is the *only* place in the entire 3,186-node corpus that gestures at
customer-facing output, and even these stay abstract (no channel, no
copy). Worth a distinct micro-icon precisely because it's the corpus's
single point of contact with the future customer-facing library
(§28 - not building that here, just naming the seam).

---

## Required Icons

**6 required** (one per structural component - Trigger, Action,
Condition, Wait, Exit, Handoff). **1 optional** (a small marker for
Handoff's external/unmodeled-destination subtype, or reuse a generic
"leaves the system" glyph rather than draw a new one). **0 icons** are
recommended for: Trigger evidence-source (badge/label is enough at 4
thin-tailed values), Condition topic tags (39.5% coverage, too partial),
Exit reason tags (33% coverage), Action verb families (label only).

Same icon may be reused where the underlying concept repeats - e.g. a
single "branches" glyph works for Condition regardless of cardinality;
the *layout* (not the icon) carries the binary-vs-multi-way distinction.

---

## Rare / Special Cases (generic fallback covers these)

- **Outcome** (1 occurrence) - render as Action + label, no dedicated component.
- **Action generic-uncovered** (263, 23.3%) - render as a plain Action card, no family icon.
- **Exit without a reason tag** (67%) - render as a plain Exit card, no reason badge.
- **Condition without a topic tag** (60.5%) - render as a plain Condition card with its cardinality layout, no topic badge.
- **Trigger `inferred`** (7 occurrences, 3%) - real, keep the evidence-source badge; too rare to need anything beyond that badge.

None of these need the design system to grow a special component for a
one-off. Every one of them is fully expressible with the 6 structural
components + the subtype treatments already listed.

---

## Ambiguous Cases (need a product decision, not a design guess)

1. **Is a required Exit reason-taxonomy worth building later**, once
   more journeys/content exist, even though it's only 33%-evidenced
   today? Recommend: no, not yet - revisit if the corpus grows and the
   coverage improves; forcing it now would mean labeling 67% of exits
   with a guessed tag.
2. **Does `send-external`'s 6-occurrence cluster deserve its own icon**,
   given it's the corpus's only brush with customer-facing content
   (§28's boundary)? Recommend: yes, small and distinct, precisely
   because it marks the seam to the future customer-facing library -
   but this is a product call about how much to foreshadow that future
   work, not a pure data finding.
3. **Should Condition's binary/multi-way distinction be a layout mode
   or a genuinely separate component (e.g. a "decision" card vs. a
   "classifier" card)?** Data supports either; this audit recommends
   one component, two layouts, but a designer working through actual
   diagram density on 6-8-branch conditions may find a separate
   component reads better in practice - worth a quick visual check
   before committing.

Zero *node-level* classification-review-required cases were found in
this pass (`journey-step-review-required.json` is empty) - the
family-matching rules are anchored to the leading word of each label,
which structurally can't produce a multi-family conflict, so there was
nothing genuinely ambiguous at the individual-node level to flag. The
three items above are the real open questions, and they're
system-level, not per-node.

---

## Visual Grammar Recommendation

- **Shape represents:** the 6 structural components (Trigger/Action/
  Condition/Wait/Exit/Handoff). This is the primary read - a viewer
  should be able to tell these apart from silhouette alone.
- **Icon represents:** the same 6 structural components, reinforcing
  shape (redundant coding, not a second axis of meaning) - plus the
  1 optional `send-external` marker.
- **Layout (not a new shape) represents:** Condition's branch cardinality
  (2-arm split vs. fanned list).
- **Badge represents:** the three genuinely rare/high-signal flags -
  Trigger evidence source, Handoff internal-vs-external, Exit terminal.
  Each is real, schema-backed, and narrow enough not to clutter the
  card.
- **Color:** not recommended as a primary channel in this pass (no hex
  chosen, per scope) - if used at all, reserve it for the same 6
  structural components color already encodes today
  (`CanonicalFlow.tsx` currently colors only Condition and Handoff
  distinctly; Trigger/Action/Wait/Outcome/Exit are grayscale
  variations). Using color for a 7th axis (e.g. Category, which has 26
  values) would overload the channel - Category already has its own
  filter UI, it doesn't need to fight for color on the diagram too.
- **Label represents:** everything else - the actual business text
  (Level 3), which is the majority of what a reader needs and was never
  meant to be encoded visually.

---

## Component Count (final answer to the audit's own question)

- **6 structural components** (Trigger, Action, Condition, Wait, Exit, Handoff)
- **4 subtype treatments** (Trigger evidence-source badge, Condition
  cardinality layout, Handoff internal/external treatment, Exit
  terminal badge)
- **6 required icons** + 1 optional (`send-external` marker)
- **1 generic fallback pattern** (Outcome folds into Action)
- **0 truly special components** - nothing in 3,186 nodes needed a
  one-off design

That is the complete answer: **a designer needs to design 6 shapes, 4
secondary treatments, and roughly 6-7 icons to correctly represent all
255 canonical journeys** - not 7 structural types treated as equally
weighted, not an 11-way Action icon set, not a customer-channel palette
that doesn't exist in this library yet.
