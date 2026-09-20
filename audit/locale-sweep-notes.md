# TR locale leak — what was leaking, the fix, and the gate

2026-09-20. Companion to `audit/locale-sweep.mjs`.

## What was leaking

The reported bug was English prose on `/tr/lab/journeys`. The sweep written for it
found the same bug, larger, on the three surface listings:

| route | English text nodes (deployed build, at the gate's threshold) |
| --- | --- |
| `/tr/lab/journeys` | 9 |
| `/tr/lab/customer-journeys` | 55 |
| `/tr/lab/lifecycle-states` | 52 |
| `/tr/lab/runtime-mechanisms` | 23 |
| `/tr/lab/journeys/first-purchase-welcome` | 1 |
| **total** | **140** |

`/tr` and `/tr/lab` were already clean.

All of it is one bug in five places, and none of it is a missing translation:

1. **`src/lib/journey-marketing.ts` is locale-blind by design.** It serves the English
   canonical record. `src/components/ui/JourneyFlows.tsx` rendered each story figure's
   *card* through `localizedJourneyDetail` (correct Turkish) but read every piece of prose
   *beside* the card straight off `FEATURED_JOURNEY` — `trigger.requires`,
   `trigger.insufficientAlone`, `branch.branches[].label` / `.when`, `wait.until`,
   `wait.timeoutAfter`, `wait.timeoutReason`.
2. **`JOURNEY_CATEGORY_COUNTS[].title`** was rendered as `{c.title}` — the raw English
   category title, six of them as pills.
3. **`showcaseCards(lang)`** takes a `lang` and spends it only on the `href`; `name`,
   `shortName`, `purpose` and `categoryTitle` came back English.
4. **`JOURNEY_ROWS` / `SURFACE_ROWS`** (`src/lib/canonical-view.ts`) are the English
   projection, computed once at module load and shared by both locales. `LabPage` passed
   them to `JourneyGallery` untouched, so every card on all three surface galleries listed
   its purpose — and its category title — in English. This is the larger half of the bug
   and it had never been reported, because no gate looked at a listing page.
5. **`JourneyDetail.distinctFrom[].name`** named another journey by that journey's raw
   canonical `name`, right where it links to it, while the same journey's Turkish name was
   already in `OVERRIDES` under its own id.

The Turkish for almost all of it already existed and was simply not wired up:
`CATEGORY_TITLE_TR` was module-private, and `OVERRIDES` already carried `name`,
`shortName`, `purpose` per journey and `headline` / `detail` / `edges[].label` /
`edges[].detail` per node.

## The one mechanism

`src/lib/journey-tr-overrides.ts` stays the single owner of TR journey content — one
table, one layer — and now exposes **one localizer per shape that leaves the server**.
Every one of them returns its argument unchanged for `lang !== "tr"`, so nothing on the EN
route can move.

| export | shape | applied at |
| --- | --- | --- |
| `localizedCategoryTitle(title, lang)` | a category title | `JourneyFlows` pills; used internally by the two below |
| `localizedJourneyNaming(row, lang)` | anything with `id`/`name`/`shortName?`/`purpose`/`categoryTitle` | `LabPage` (all three galleries + the flat list), `JourneyLibraryPage`'s largest-journey rows, `JourneyFlows`' showcase cards, `LabIndexPage`'s hero |
| `localizedFeaturedJourney(featured, lang)` | `FEATURED_JOURNEY` | `JourneyFlows`, once per locale |
| `localizedJourneyDetail(detail, lang)` | `JourneyDetail` (existing) | unchanged call sites; now built on `localizedJourneyNaming` and also localizes `distinctFrom[].name` |

`localizedJourneyNaming` is structurally typed rather than a union of `JourneyRow` and
`ShowcaseCard`: its contract is "whatever carries a journey id and these names", so a
future projection is covered the moment it is passed through, and nothing in the layer
needs to know which page is asking.

`localizedFeaturedJourney` finds the trigger, condition and wait it needs **the same way
`journey-marketing.ts` found them when it built the projection** — the first node of each
kind, in the journey's own node order — so the override it reads is always the override of
the node the page is quoting. No node id and no journey id is named anywhere in the layer.

### The closed category map stayed closed

`CATEGORY_TITLE_TR`'s comment claims it is a full, closed translation "not a partial lookup
with an English fallback baked in for the ones missing". `localizedJourneyDetail` had a
`?? detail.categoryTitle` that quietly made that claim false. `localizedCategoryTitle` now
**throws**, naming the title and the map, and it is the only way a category title reaches
a page in either locale. Same house style as `journey-marketing.ts` throwing at module load
when a hard-referenced journey id disappears: a build that fails naming the string is
cheaper than a page that ships it.

## Turkish written for this change

Nine strings, all on ACQ-01, all of them canonical fields that had **no Turkish anywhere**
because they are not on a canvas card — `TriggerNode.evidence.requires` /
`.insufficientAlone`, `WaitNode.until`'s event text and `WaitNode.timeout.reason`.
`canonical-view.ts` folds these into `meta` behind a fixed English prefix, so layer 1
translated the prefix and the value stayed English.

They are authored in `OVERRIDES` under the same node ids as everything else, through four
new optional `NodeOverride` fields (`requires`, `insufficientAlone`, `until`,
`timeoutReason`), positional like `edges` — not in a second table beside the page.

`t.threshold` — `evidence.requires`:

| EN | TR |
| --- | --- |
| repeated visits to high-intent pages | yüksek niyet taşıyan sayfalara tekrarlanan ziyaretler |
| interaction with pricing | fiyatlandırmayla etkileşim |
| product or configuration exploration | ürün veya yapılandırma incelemesi |
| a meaningful return after a first session | ilk oturumun ardından anlamlı bir geri dönüş |

`t.threshold` — `evidence.insufficientAlone`:

| EN | TR |
| --- | --- |
| a single page view | tek bir sayfa görüntüleme |
| one session with no return | geri dönüşü olmayan tek bir oturum |
| an ad click that landed and bounced | gelip hemen ayrılan bir reklam tıklaması |

`w.identity`:

| field | EN | TR |
| --- | --- | --- |
| `until[0]` | a deterministic known identity is resolved for the anonymous profile | anonim profil için kesin (deterministik) bilinen bir kimlik çözülür |
| `timeout.reason` | anonymous intent goes stale like any other evidence, and an unresolved profile is not held open indefinitely waiting for a name | anonim niyet de diğer her kanıt gibi bayatlar; çözülmemiş bir profil, bir isim bekleyerek süresiz açık tutulmaz |

Everything else on the page — the six category pills, both branch labels and both branch
reasons, the wait's timeout wording, all four showcase cards, every gallery card on the
three surfaces — was wiring only. The register follows the existing `OVERRIDES` entries:
lower-case evidence fragments, no transliteration, `kesin (deterministik)` kept exactly as
ACQ-01's own `c.identity` override already phrases it.

## The gate

`node audit/locale-sweep.mjs [port|baseUrl]` — default port 4514.

Fetches every public TR route, strips scripts/styles/comments/SVG, reads every text node
and flags any that contains **two or more distinct English function words**. The word list
and the threshold are `audit/measure-display.mjs`'s, copied deliberately so the two gates
cannot disagree about what English looks like; two hits rather than one is what stops
`In-app`, a bare `Push` or a product name from reading as a sentence.

Routes: `/tr`, `/tr/lab`, `/tr/lab/journeys`, and the three surfaces, plus every
`/tr/lab/journeys/<slug>` **derived from the running server's `sitemap.xml`** — which is
built from `JOURNEY_ROWS`/`PRESET_ROWS`, so a journey that enters or leaves the public
corpus enters or leaves the sweep with it. 161 routes today. Plain `fetch`, no puppeteer:
the pages are prerendered, so the first paint is exactly what comes back, and the corpus
sweeps in seconds instead of the ~20 minutes a headless browser needs.

Prints `route | text` and exits non-zero on any finding. Writes
`audit/locale-sweep-report.json`.

### Allowlist

`ALLOWED` — an exact string mapped to a written reason, the shape and discipline of
`CHANNEL_RULE_EXCEPTIONS` in `scripts/validate-public-scope.mjs`.

**It is empty, and that is a measured result, not an oversight.** Swept with `ALLOWED`
*and* the identifier rule both disabled, the public TR routes still produce zero findings.
The English that legitimately stands on these pages — the five channel names, the Lab
projects' product names, the deliberate loanwords (`58 journey`, `Push`, `In-app`,
`onboarding`) — is one or two words long and never reaches two distinct function words.
The threshold is doing the job an allowlist would otherwise have to do. An entry gets added
the day a real sweep flags a real string, with its reason beside it.

`IDENTIFIER_SHAPE` is kept separately and is a **rule, not an exception**: a text node that
is entirely a config/event id (`anonymous_intent.identity`), a node id (`c.identity`), a
journey id (`ACQ-01`) or a bare channel name is skipped before the word count runs, because
this site's stated rule is that canonical identifiers are never translated
(`canonical-view.ts`, `externalTargetName`). Nothing currently reaches it either; it encodes
the rule rather than a finding.

## Reported, not failed: the Info-tab / practitioner gap

3,118 text nodes across 155 detail routes are English and are **not** failed by this gate.
They are the pre-existing translation backlog `journey-tr-overrides.ts` declares in its own
header — "the Info tab's deeper technical fields — eligibility, suppressions, guardrails,
reusableRule, distinctFrom — are not part of this pass and stay English even for a journey
listed here" — plus the practitioner write-up, which `src/lib/practitioner-view.ts` builds
straight off the canonical journey and which `localizedJourneyDetail` never sees.

Two different exclusions, because they need two different mechanisms:

- **The Info tiles** are excluded **by string**, read out of
  `production/canonical-dump.json`: `entity`, `distinctFrom`, `objective`, `eligibility`,
  `suppressions`, `implementation`, `measurement`, `discovery`, `guardrails`,
  `reusableRule`, `competition`, `contact`, `channelStrategy`, `orchestration`,
  `preemptedBy`. Derived rather than hand-listed, so the bucket shrinks on its own the day
  someone translates those fields. A journey's `name`, `shortName` and `purpose` are
  collected separately as **in-scope** and always win the match — several of them appear
  verbatim inside an `objective` sentence, and without that guard a real gallery leak would
  have been marked "known".
- **The practitioner disclosure** is excluded **by region** — the one `<details>` element
  on a detail page. Most of what it renders is node prose, and node prose is exactly what
  the TR pass *does* cover on the canvas, so matching those strings anywhere on the page
  would have blinded this gate to a real canvas leak. The canvas is already gated per node
  by `audit/measure-display.mjs`; that disclosure is the one part of a detail page neither
  gate claims.

Translating those ~2,500 distinct strings is a content project, not a wiring fix. The count
is printed on every run, so it cannot grow in silence.

## Known and deliberately not fixed

- **Preset chips on `/tr/lab/journeys` and the customer-journeys gallery** (`Quote
  Abandonment`, `Application Abandonment`, `Saved Item Reminder`, …). `PRESET_ROWS[].name`
  and `.applicableWhen` come from `discovery.presets` in canonical data and have no Turkish
  anywhere — not in `OVERRIDES`, which is keyed by journey and node id. The sweep does not
  flag them (a two-word title never reaches two function words), and inventing translations
  for 20+ preset names is a content decision, not this fix. Worth a follow-up.
- **The Info tab / practitioner backlog** above.
