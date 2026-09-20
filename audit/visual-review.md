# Visual review — current render vs. the lifecycle-builder target language

Scope: the **52 public journeys** fixed by `audit/public-journey-scope.md`. Every number below
is computed over those 52 from `production/canonical-dump.json` and `audit/display-after.json`,
or read directly out of the renderer. Nothing is estimated except where the text says so.

Corpus shape of the 52, for reference:

| | |
|---|---|
| triggers | 52 |
| conditions | 198 (156 binary · 42 wider) |
| waits | 81 |
| actions | 228 — 122 communication · 5 human · 101 internal |
| exits | 143 |
| handoffs | 80 (14 of them `external:`) |
| outcomes | **0** |
| display nodes drawn (EN) | 678 · min 7 / median 13 / max 29 (FBK-43) |
| canonical nodes behind them | 782 |

---

## 0. What is already right, and must not be regressed

This section is first on purpose. Four collapse rules and a text budget shipped in PRs #9–#12,
and one of them (#9) had to be corrected after it **erased authored business logic in five
journeys**. Nothing proposed below may loosen them.

**The four collapses in `src/lib/journey-canvas-layout.ts`.** Each is safe because of one
specific signal, not because of its shape:

- `collapsibleRouters` — a channel-selecting action folds into the one send it selects for.
- `collapsibleGates` — a permission gate draws no box **only when its short arm books a reason
  before it ends**. `exitClass === "no-action"` alone was not enough: that version deleted
  RET-24's whole objective and TIM-63's authored suppression. The bookkeeping-hop requirement
  took it from 24 collapses to 9, and the 15 it stopped collapsing are real questions. A second
  clause requires *every* parent of a shared hop to have collapsed before the hop may be hidden
  (RET-32 lost an "Excluded" arm to that). Do not relax either clause to "simplify more".
- `absorbableBookkeeping` — pass-through internal actions that write nothing or only journal
  fields. 103 of 117 absorbed; the 14 that write real state keep their cards.
- `collapsibleWaitFollowers` — **exact equality** of both wait arms plus sole-source
  exclusivity. The looser reading (any sole-parent condition) was measured at 43 sites and
  only 1 passed the safety signal; it was rejected. Keep the equality test exact.

**`representedSteps` and the "Represented canonical steps" panel section.** This is what makes
a collapse a change of drawing rather than of meaning. Any new collapse or grouping proposed
below must register there or it is not acceptable.

**Per-parent instancing of shared terminals** (`x.converted@c.state`, `INSTANCED_KINDS`). This
is already the repo's answer to "no giant connector highways" for endings, and it is why
branch terminals sit beside their branch. It is deliberately limited to leaf kinds — extending
it to continuation nodes would draw the rest of the journey twice. Do not.

**The two-layer split.** Node ids, `eventId`, `writes <field> (<mode>)` and `→ x.purchased`
live in `NodeDetailPanel.tsx`, off the cards. The target's "no implementation detail" rule is
about the canvas, not the drawer. Everything this review asks to remove from a card already has
a home in the panel.

**One card kit, one layout engine.** `JourneyCanvasNodes.tsx` is reused by the canvas, by
`NodeFigure` on the landing page, and its geometry feeds `journey-preview.ts`'s thumbnails from
the same `CanvasLayout`. ELK is the only engine and `journey-canvas-layout.ts`'s own contract
forbids post-layout coordinate patching. Every fix below is a graph change, an ELK option, or a
card change — never a coordinate.

**Things that already match the target language:** vertical top-to-bottom layered layout; the
trigger as the one filled card with the Entry pin standing on its edge; conditions that ask one
question (median `asks` 41 characters); exits as small dashed capsules with success
differentiated by the authored `class` rather than guessed from text; channel pills with
explicit **Primary / Fallback** rows — strictly better than the target's bare "SMS #1", and it
was changed *to* this after an arrow-only chip read as a sequence; message cards titled by
`Touch.stage` ("Initial recovery", "Final notice") rather than by a number (121 of 127
communication/human actions carry a stage); the branch count already removed from the condition
card; far-zoom LOD glyph mode; hover-to-trace edge highlighting.

**Simple flows stay simple.** Nothing below adds a node to any journey.

---

## P0

### P0-1 · Wait cards print a raw canonical config key

**46 of the 81 waits in the 52** render a dotted canonical key as the *entire* card text —
`bounded_education.window`, `onboarding.step_interval`, `activation_blocker.resolve`,
`adoption.observation_window`. The target language says "Wait 4 hours" and forbids canonical
config keys outright. This is the single most frequent violation on the canvas.

**Generic cause.** `canonical-view.ts` hands the card a *localized prose sentence*
(`detail = "timeout after " + configText(...)`), and `waitLabel()` in `JourneyCanvasNodes.tsx`
scrapes a duration back out of it with three regexes. When `Config` has no `default` — 46 of 81
cases, all `required: true` — `configText` emits `"<rule> (configure <key>)"` and there is no
duration to scrape, so the third regex pulls the key. The file's own comment defends this
("reads honestly as the technical reference it is"); against the target language it does not.
The same function feeds the Family B duration strip, so the leak appears inside condition cards
too.

**Owner.** `src/lib/canonical-view.ts` (`nodeView`, case `"wait"`) and
`src/components/ui/JourneyCanvasNodes.tsx` (`waitLabel`).

**Proposed generic rule.** Project the duration as declarative display metadata instead of
re-deriving it from prose: add a `duration: string | null` to `FlowNode` for waits, filled from
`Config.default.value` (via `configValueText`, which already handles ranges) and `null` when
there is none. The card then renders one of two localized templates — `"<Wait> <duration>"`
when a duration exists, and the timeout **rule's** own first clause when it does not — and
never the key. The key stays in the detail panel, where `configText`'s full sentence already
lives. Fixes the standalone wait pill and the Family B strip in one place, and removes three
regexes that parse localized text.

### P0-2 · Message cards say nothing about the message

`CommunicationCard` renders a title and channel pills and **no body at all** — there is no `<p>`
in it. For **122 communication actions** (plus 5 human) in the 52, the canvas shows "Initial
recovery / Push · Email" and nothing about what the message says. The target language asks for
a channel *and a short preview*. `audit/patterns.md` logged this as P-CONTENT-01 and scored it
as affecting one journey; on the 52 it is every message card.

**Generic cause.** The card was built as the answer to "no paragraph, ever", and the whole body
was removed rather than budgeted. The budget mechanism (`cardSummary`) shipped afterwards, in
the same file, and was never applied here.

**Owner.** `src/components/ui/JourneyCanvasNodes.tsx` (`CommunicationCard`).

**Proposed generic rule.** Render `cardSummary(node.headline)` as a **one-line** (`line-clamp-1`)
preview under the title, at the same geometric budget P1-1 defines. No new canonical data, no
paraphrase, no per-journey text: the corpus's own `does` sentences open with what the message
shows ("Send the first cart reminder … showing the cart as it currently stands"), and the full
sentence stays in the panel, unchanged. This is the one place where adding text to a card makes
the canvas *more* like the target, not less.

### P0-3 · `Internal · 03` — a kind label plus a sequence number

`ActionCard` renders `{w.internalAction} · {String(sequence).padStart(2, "0")}`. **21 internal
cards across 17 of the 52** show it. The target language names this exact string as forbidden
("no sequence numbers (`Internal · 01`, `Message · 02`)").

**Generic cause.** The sequence was the tie-breaker for same-kind cards with no name of their
own. The `ConditionCard` already faced the identical question and resolved it correctly —
its comment at the branch-count line says the count "added nothing a reader couldn't already
see" and it was dropped. Internal cards did not get the same treatment.

**Owner.** `src/components/ui/JourneyCanvasNodes.tsx` (`ActionCard`) and
`src/components/JourneyCanvas.tsx` (`actionSequenceOf`, whose doc comment still describes a
"Message · 03" label that no longer exists).

**Proposed generic rule.** Drop the sequence from the kind row; the card's own sentence
distinguishes it and `node.id` is in the panel. Remove `actionSequenceOf` and the `sequence`
prop with it rather than leaving a dead parameter threaded through `NodeFigure`.

### P0-4 · 14 handoff cards print `external:sales-assignment`

Of the 80 handoffs in the 52, **14 target an `external:` destination** and the card headline is
the raw namespaced id: `external:sales-assignment`, `external:human-in-the-loop-lifecycle`,
`external:customer-lifecycle`, `external:health-monitoring`. Colon-prefixed canonical id syntax
on a card.

**Generic cause.** `nodeView`'s handoff case looks up a real journey's `shortName` and falls
through to `n.to` verbatim when the target is external. The same file already owns
`humanEvent()`, which humanizes exactly this kind of identifier for triggers; it is simply not
applied here.

**Owner.** `src/lib/canonical-view.ts` (`nodeView`, case `"handoff"`).

**Proposed generic rule.** Humanize an `external:` target the same way `humanEvent` humanizes an
event id — drop the namespace, split the slug, sentence-case — so it reads "Sales assignment".
Nothing is invented; the `External` pill the card already shows carries the fact that the
destination is outside this library, and the raw id stays in the panel's edge list.

---

## P1

### P1-1 · The card text budget is a character count, decoupled from the box it has to fit

`CARD_BODY_BUDGET = 120` characters. The widest card is 264px wide (action) — about 236px of
inner width, two `line-clamp-2` lines at 13.5px, so roughly **70 characters**. The condition
card is 240px wide — roughly **60**. The budget overshoots the geometry by 70–100%, so a
sentence *under* 120 characters passes `cardSummary()` untouched and is then cut mid-word by
CSS — which is the exact failure Family E was built to end.

Measured on the 52: **29 of 198 condition `asks` exceed ~60 characters** (longest 113, *"Is the
risk driven by a known operational problem, other than a payment failure already open in
payment recovery?"*) and **33 of 143 exit headlines exceed ~32**. `audit/display-after.json`
reports only 12 long cards for the 52 because `measure-display.mjs` uses the same 110/120
threshold — the instrument inherits the budget's own blind spot and cannot see these.

**Generic cause.** Two numbers describing one card live in two files and were fitted
independently: `CARD_BODY_BUDGET` in `JourneyCanvasNodes.tsx` and `SIZE` in
`journey-canvas-layout.ts`. Nothing makes them agree.

**Owner.** Both files.

**Proposed generic rule.** Derive the character budget from the slot: `chars ≈ (innerWidth /
avgAdvance) × lines`, with `innerWidth` read from the same `SIZE` entry the layout reserves and
`avgAdvance` fitted against real rendered text — exactly the method `estimatedLabelWidth`
already uses for label chips in this repo, so there is precedent for the fit and no new
mechanism. One budget function, per kind, consumed by both files. `measure-display.mjs`'s
threshold should then read the same function rather than a literal.

### P1-2 · The exit capsule is outside the text budget entirely, and overflows its own slot

`ExitCard` renders `{node.headline}` with **no `cardSummary` and no clamp** (the clamp was
removed deliberately — `-webkit-box` does not size inside a `w-fit` shell). Its `max-w-[220px]`
also exceeds `SIZE.exit.width` of **200**. With 33 of 143 exit headlines over ~32 characters
(longest 61), those capsules wrap to two or three lines inside a **48px** reserved slot and
render wider than the slot the layout gave them — a card drawing outside its own border, which
`SIZE`'s own comment names as the failure mode to avoid.

**Generic cause.** `splitExitState()` shortens the exit headline at the *projection* layer and
the card then assumes the result is short. It usually is (median 21), but the assumption is
unbudgeted, and the two width constants are in two files.

**Owner.** `src/components/ui/JourneyCanvasNodes.tsx` (`ExitCard`) and
`src/lib/journey-canvas-layout.ts` (`SIZE.exit`).

**Proposed generic rule.** Bring the exit under P1-1's geometric budget (a truncation that works
without `line-clamp` — a character cut at a clause boundary, which is what `cardSummary` already
is), and make the capsule's max width *be* `SIZE.exit.width` rather than a second literal.

### P1-3 · Every card reserves its kind's worst case — the generic cause of the whitespace

`SIZE` is a constant per kind, measured as the worst case across the whole library.
`sizeOf(d)` is the only content-aware sizing in the engine and it handles exactly one case
(`MERGED_WAIT_STRIP`). Estimated from the markup:

| card | content when typical | reserved | slack |
|---|---|---|---|
| trigger (1-line event, 1 pill) | ~102 | 124 | ~22 |
| handoff (1-line short name, 1 pill) | ~103 | 124 | ~21 |
| communication (title + 1 channel row) | ~74 | 108 | ~34 |
| internal action (2-line body) | ~93 | 108 | ~15 |
| wait pill (`w-fit`, often ~120px wide) | — | **240 wide** | up to 120px of horizontal slot |
| exit capsule (`w-fit`) | — | **200 wide** | similar |

The target language asks for "message content-sized" cards and "avoid big cards with empty
whitespace"; trigger headlines here have a median of 31 characters and handoff target names a
median of 25, so both nearly always draw one line into a two-line slot. The `w-fit` cards are
worse: the slot is what ELK spaces siblings by, so a 120px pill pushes its neighbours 240px
apart and the canvas sprawls horizontally for nothing.

**Generic cause.** One constant per kind instead of one estimate per node.

**Owner.** `src/lib/journey-canvas-layout.ts` (`SIZE`, `sizeOf`).

**Proposed generic rule.** Extend `sizeOf(d)` from a lookup to an estimate over the display
node's own content: line count of the budgeted body (P1-1 gives it), number of pill rows
(`channelPlan`/`channelPriority`/routes/evidence/terminal — all already on `FlowNode`), plus the
existing merged-wait strip. For the two `w-fit` kinds, estimate width from the text the same way
`estimatedLabelWidth` does. `sizeOf` is already the one place both the ELK graph and the
read-back size a node, so they still cannot disagree. Keep the bias-high convention the file
states: an overestimate costs space, an underestimate is a collision.

### P1-4 · The trigger does not read as "When someone X", and carries a provenance pill

The trigger card reads `Trigger` / `Item added to cart` / `Authoritative`. The target reads
"When someone Checkout Started". `Authoritative` / `Declared` / `Behavioral` / `Inferred` is
evidence-provenance vocabulary — implementation detail by the target's definition, and it is
already in `node.meta` as `evidence: authoritative` for the panel.

**Generic cause.** The kind row and the headline are two separate strings, and the card has no
template joining them; the pill was added under a "secondary states are badges" rule that
predates the target language.

**Owner.** `src/components/ui/JourneyCanvasNodes.tsx` (`CARD_TEXT`, `TriggerCard`).

**Proposed generic rule.** A bilingual template in `CARD_TEXT` applied to the humanized event —
EN `"When <event>"`, TR the equivalent `"… olduğunda"` construction — replacing the separate
`Trigger` kind row. Costs nothing: trigger headlines are 31 characters at the median and 50 at
the worst. Move `evidenceSource` to the panel. The Entry pin and the filled brand-blue treatment
stay; they are already the strongest thing on the canvas and are correct.

### P1-5 · Branch labels have no budget, and two files disagree about how wide one is

`estimatedLabelWidth` reserves up to **360px** for a label chip. `EdgeShape` renders it in a
`foreignObject` of **200px** with `whitespace-nowrap` and `overflow-visible`. So a long label is
reserved at one width, drawn at another, and escapes its box. On the 52: **58 EN and 75 TR
labels exceed 24 characters**, longest 71 (*"Değiştiriyor · Değiştirmiyor ama yine de bir
güncelleme yükümlülüğü var"*). Long labels also force ELK to widen the whole graph.

**Generic cause.** The twin-route edge merge joins two arms' labels with `·` and nothing budgets
the result; and the reservation and the render are two literals in two files.

**Owner.** `src/lib/journey-canvas-layout.ts` (`estimatedLabelWidth`) and
`src/components/JourneyCanvas.tsx` (`EdgeShape`).

**Proposed generic rule.** Apply a label budget of Family E's shape to the label text *before*
both the reservation and the render, and share one max-width constant between them. Already
identified as the top remaining item in `audit/patterns.md` §"What is left"; the two-file
disagreement is the part that report does not yet name.

### P1-6 · Branch labels sit at the middle of the connector, not near the split

`ROOT_OPTIONS` sets `elk.edgeLabels.inline` per label and `elk.spacing.edgeLabel`, but leaves
`org.eclipse.elk.edgeLabels.placement` unset, so ELK uses **CENTER**. On a branch that runs
several layers down before it lands, the answer ("Cleared or expired") ends up far from the
question that produced it — the target language's "branch labels stay NEAR the split".

**Generic cause.** An unset ELK option, not a drawing problem.

**Owner.** `src/lib/journey-canvas-layout.ts` (`ROOT_OPTIONS`).

**Proposed generic rule.** Set `org.eclipse.elk.edgeLabels.placement: TAIL` (both options are
present in the bundled `elkjs` — verified) and tune
`org.eclipse.elk.layered.edgeLabels.sideSelection` with it. One option change, no coordinate
arithmetic, no post-layout shifting — which is what that module's stated contract requires.

### P1-7 · The caption and legend count nodes the canvas does not draw

`journeyCanvasProps` builds the figure caption and the legend from `detail.nodes.length` — the
**canonical** node array — while the canvas draws the post-collapse display graph. On the 52,
**34 of 52 captions disagree with their own canvas**: 782 canonical vs 678 drawn. ACQ-288's
caption says "22 nodes" over a 16-card canvas; ACQ-287 says 16 over 10; ACQ-11 says 26 over 19.
Separately, "19 nodes · 6 decisions · 4 exits · 2 handoffs" is graph vocabulary — no lifecycle
builder puts a node count on a canvas.

**Generic cause.** The caption was written before the four collapses shipped and still reads the
pre-collapse array; nothing ties it to the layout it captions.

**Owner.** `src/components/JourneyDetailBody.tsx` (`journeyCanvasProps`).

**Proposed generic rule.** Count the `CanvasLayout` that is already computed two lines above,
not `detail.nodes`, and state the shape in journey words (steps, decisions, endings, handoffs)
rather than graph words. The legend's spotlight-and-fly-to affordance is genuinely good and
should stay exactly as it is.

---

## P2

### P2-1 · An archived handoff is a link that isn't, with no reason on the card

Family D's one open item, already in `audit/patterns.md`. A handoff into an archived
Operational Workflows journey correctly renders as text rather than a link, but the card does
not say why. The card already has a pill carrying `Internal` / `External`; the signal is already
computed (`edge.href === null && edge.kind === "journey"`, in `canonical-view.ts`'s `edge()`).
Owner: `JourneyCanvasNodes.tsx` (`HandoffCard`) fed by an existing `FlowNode` field. A third
pill value, driven by data that already exists — not a new lookup.

### P2-2 · Wait pills that *do* have a duration say "2 hours", not "Wait 2 hours"

The other 35 of 81 waits. The Clock icon carries most of the meaning, but the two halves of the
corpus read differently. Fold into P0-1's template so both cases produce the same sentence shape.

### P2-3 · `OutcomeCard` never renders on the public 52

**Zero outcome nodes** in the 52. The kind still occupies rows in `SIZE`, `KIND`, `FAR`,
`INSTANCED_KINDS` and `PREVIEW_KINDS`, and `PREVIEW_KINDS`' order is a wire format that must not
be reshuffled. Not a defect — just do not spend sizing or budget effort on it, and do not delete
it from `PREVIEW_KINDS`.

### P2-4 · The amber Human card is a whole visual kind for 5 cards

5 human actions across the 52, against 122 communication. A distinct hue, tile, icon and
fallback route list for 5 cards. Worth revisiting only if the palette is ever under pressure;
listed so it is a known cost rather than a discovery.

### P2-5 · Merges are already drawn correctly — do not "fix" them

101 targets with in-degree 2 and 32 with in-degree ≥3 (16 of them non-terminal: ACQ-11
`c.state2` with four parents, TIM-61 `w.tracking`, ACT-12 `a.read`, …). All incoming edges land
on one zero-size NORTH port, so they converge to a single point at the top of the card — which
*is* the merge affordance the target asks for ("paths may merge"). The terminal cases are
already handled by per-parent instancing. If a converging run ever reads as a highway, the lever
is layering and spacing, **not** instancing a continuation node — that duplicates the rest of
the journey, and the module already says so.

---

## What the display graph should collapse or group that it does not — stated as rules

Two candidates, both generic, both stated as rules rather than journey lists. Neither is
recommended for implementation without the measurement discipline PR #9 → #10 established.

1. **One form for a repeated state question** (`P-STATE-01`, 14 journeys corpus-wide). The
   signal is a set of conditions *within one journey* sharing an `asks` string. The rule would
   be: where a journey asks the same question at several stages, every instance renders in one
   recognisable form (same card treatment, same branch-label ordering) so a reader recognises
   the recheck instead of re-reading it. This changes how a decision *reads*, not what the graph
   contains, so it wants a render-and-critique pass, not a detector. `audit/REPORT.md` §7 says
   the same.

2. **Entry eligibility gates — measured and correctly NOT shipped.** The shape matches 9
   conditions corpus-wide and **3 of the 9 are real business decisions** (CON-283, IDN-271,
   arguably ACT-20). No further signal in the canonical data separates them. Shipping it would
   repeat PR #9 exactly. Recorded here so it is not re-proposed as a fresh idea.

**What must not be proposed as a collapse:** the 42 conditions with more than two branches, the
16 non-terminal merge points, and the 14 internal actions that write real state. Each was
measured and each carries information a reader needs.

---

## Ranked summary

| # | finding | owner |
|---|---|---|
| P0-1 | 46/81 waits print a raw canonical config key | `canonical-view.ts` · `JourneyCanvasNodes.tsx` |
| P0-2 | 122 message cards show no message preview | `JourneyCanvasNodes.tsx` |
| P0-3 | `Internal · 03` sequence numbers, 21 cards | `JourneyCanvasNodes.tsx` · `JourneyCanvas.tsx` |
| P0-4 | 14 handoff cards print `external:<id>` | `canonical-view.ts` |
| P1-1 | text budget is characters, not geometry (29 asks + 33 exits overflow unseen) | both files |
| P1-2 | exit capsule unbudgeted; 220px max-width vs a 200px slot | both files |
| P1-3 | per-kind worst-case sizing is the cause of all whitespace and `w-fit` sprawl | `journey-canvas-layout.ts` |
| P1-4 | trigger lacks "When someone X"; provenance pill on the card | `JourneyCanvasNodes.tsx` |
| P1-5 | 133 over-long branch labels; 360px reserved vs 200px drawn | both files |
| P1-6 | branch labels centred on the connector, not near the split | `journey-canvas-layout.ts` |
| P1-7 | 34/52 captions state a node count the canvas does not draw | `JourneyDetailBody.tsx` |
| P2-1 | archived handoff gives no reason for not being a link | `JourneyCanvasNodes.tsx` |
| P2-2 | "2 hours" vs "Wait 2 hours" | `JourneyCanvasNodes.tsx` |
| P2-3 | `OutcomeCard` never renders on the 52 | — (note only) |
| P2-4 | Human card is a visual kind for 5 cards | — (note only) |
| P2-5 | merges are correct; do not instance continuation nodes | — (guard) |

Every item is a generic renderer rule, a generic graph/projection change, declarative display
metadata, or a single ELK option. None branches on a journey id, none hand-places a coordinate,
none adds a node to any journey, and none touches `src/canonical/`.
