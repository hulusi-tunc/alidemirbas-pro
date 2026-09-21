# Preset localization — the eight presets, their Turkish, and the check

The practitioner **presets** (canonical `discovery.presets`) rendered in English
on every Turkish route: as chips on `/tr/lab/journeys`, as cards above the
customer-journeys gallery, and as the whole subject of their own pages under
`/tr/lab/journeys/<preset-id>` — title card, "preset of" line, practitioner
banner, `<title>`, meta description and JSON-LD breadcrumb.

Two facts explain why they lasted this long:

1. `src/lib/journey-tr-overrides.ts` — the one file that owns TR journey
   content — is keyed by **journey id** and **node id**. A preset is neither.
   It had no slot, so nobody could have filled one.
2. `audit/locale-sweep.mjs` is **structurally blind** to them. Its detector
   flags a text node carrying two or more *distinct* English function words;
   `Browse Abandonment` is two words and carries none. The `applicableWhen`
   sentence is long enough to trip it, but it is a `discovery` field, and the
   sweep reads `discovery` into its "known Info-tab gap" bucket, which is
   reported and **not** failed. Both halves of a preset were invisible to the
   only gate that looks at TR pages.

Lowering the sweep's threshold to one function word is not a fix — it would
flag every channel name, product name and canonical id on the site. This class
needs a check of its own, comparing the page against the **source data**
rather than against a word list. That check is `audit/preset-locale.mjs`.

## How many presets there actually are: eight

Not "around twenty". Read off `production/canonical-dump.json` across all 303
canonical journeys, `discovery.presets` appears on **four** journeys and
carries **eight** presets in total. All four parents are public customer
journeys (`production/surface-assignment.json`: surface `customer`,
`excludedFromPublic: false`), so all eight reach a public page.

(`canonical-view.ts`'s comment on `ALL_DETAIL_SLUGS` says "10 preset URLs".
That comment is stale — the same paragraph also says "160 public journeys"
where the corpus is 158. The code itself derives the list and is correct;
only the prose is out of date. Not touched here.)

## The translations

`PRESET_TR` in `src/lib/journey-tr-overrides.ts`, keyed by preset id.

| id (parent) | EN name | TR name |
|---|---|---|
| `quote-abandonment` (ACQ-11) | Quote Abandonment | **Teklif Terki** |
| `application-abandonment` (ACQ-11) | Application Abandonment | **Başvuru Terki** |
| `incomplete-registration` (ACQ-11) | Incomplete Registration | **Yarım Kalan Kayıt** |
| `saved-item-reminder` (ACQ-12) | Saved Item Reminder | **Kaydedilen Ürün Hatırlatması** |
| `browse-abandonment` (ACQ-13) | Browse Abandonment | **Gezinme Terki** |
| `product-view-abandonment` (ACQ-13) | Product View Abandonment | **Ürün İnceleme Terki** |
| `search-abandonment` (ACQ-13) | Search Abandonment | **Arama Terki** |
| `predicted-next-purchase` (RET-31) | Predicted Next Purchase | **Öngörülen Sonraki Satın Alma** |

The register is the one the file already speaks — these read as Turkish, not as
transliterated English. `Terki` for *abandonment* is the word the corpus
already uses for exactly this idea: SCH-282's own TR shortName in this file is
`Müsaitlik Arama Terki`. `Yarım Kalan Kayıt` follows ACQ-11/ACQ-12's own TR
short names (`Yarım Kalan Süreç Kurtarma`, `Yarım Kalan Seçim Kurtarma`), which
is what a reader of the parent page has just read.

`applicableWhen` is translated in full for all eight; each is one or two
sentences and is quoted in the file beside its name. Each preset's
`destination` (`the quote`, `the saved list`, …) is translated too — it is
rendered after `Hedef:` on the preset banner.

## What was deliberately left in English

- **Config keys and their values** in a preset's `overrides`
  (`recovery.first_check`, `selection.lifetime`, …). These are canonical
  identifiers. The site's standing rule is that identifiers are never
  translated — the same rule that keeps event ids, node ids and journey ids as
  they are in both locales. They render in a monospace run, not as prose.
- **Journey ids quoted inside an `applicableWhen` sentence** — `TIM-61`,
  `IDN-81`, `SCH-282`. An id is the thing a practitioner looks up; translating
  it would make it unlookup-able. The journey *named* beside such an id **is**
  given in Turkish (`Son Tarih Takibi (TIM-61)`, `Kimlik Doğrulama (IDN-81)`),
  because that name is already in this file under that journey's id and every
  other TR list on the site shows it that way.
- **A preset's `aliases`** (`quote abandonment`, `abandoned quote`,
  `quote follow-up`, …). Nothing renders them: `JourneyGallery` uses them as
  search keys only (`[p.name, p.parentName, ...p.aliases]`), exactly as a
  journey's own `discovery.aliases` are used and left in English on the TR
  route today. Leaving them keeps the English term findable from the Turkish
  gallery, which is what the TR page's own intro promises ("Zaten kullandığın
  adlarla arayabilirsin. Kayıtlar İngilizce."). The Turkish name is searchable
  because it is now the `name`.
- **The raw canonical `Preset` nested inside `PresetRow.preset`.** It is
  canonical data carried for `practitionerView`'s override lookup and nothing
  renders it; canonical data stays canonical. The check's gallery-props
  assertion is written against `PresetRow`'s own field order precisely so it
  cannot confuse the two.
- **The search index** (`search/search-index.json`) folds preset names into
  their parent journey's document. It is a single English corpus behind a
  JSON API (`/api/search`) with no UI and no TR variant, so no preset text
  reaches a TR *page* through it. Out of scope here; translating it would be a
  bilingual-index project, not a presentation fix.

No preset name was kept in English: all eight are ordinary noun phrases with
ordinary Turkish, none is a term of art the TR register would keep.

## The mechanism, and why this one

`journey-tr-overrides.ts` now exposes a fifth localizer beside
`localizedCategoryTitle`, `localizedJourneyNaming`, `localizedFeaturedJourney`
and `localizedJourneyDetail`:

```ts
export function localizedPreset<T extends PresetNaming>(row: T, lang: Lang): T
```

Built the same way as the four it sits with:

- **Returns its argument unchanged for `lang !== "tr"`.** The EN route cannot
  move, by construction.
- **Structurally typed**, like `localizedJourneyNaming`. The contract is
  "whatever carries a preset id and these fields", so `PresetRow`
  (`canonical-view.ts`), the practitioner view's applied `preset` and the
  parent's `presets` list all pass through one function, and a future
  projection is covered the moment it is passed through. `applicableWhen`
  arrives as a flat string on one and as the canonical `RuleStatement` on the
  others; the localizer handles both and leaves the `label` alone (the page
  already translates that enum from its own dictionary).
- **Applied at the boundary**, never per call site: `LabPage` maps
  `PRESET_ROWS` once next to its existing `localizedJourneyNaming` map,
  `JourneyLibraryPage` does the same for the chip row, `journeyMetadata` and
  the breadcrumb take it in `JourneyRoutes.tsx`, and everything on a detail
  page (title card, "preset of" line, practitioner banner, the parent's preset
  list) is reached inside `localizedJourneyDetail`.
- **Closed, and loud on a miss** — the precedent is `CATEGORY_TITLE_TR`.
  Every preset the public corpus declares is in `PRESET_TR`, so the map is
  closed and `localizedPreset` **throws** naming the preset id rather than
  falling back to English. A silent `?? row.name` is exactly the failure this
  file exists to prevent: it would ship the next untranslated preset onto a
  Turkish page with every gate green, which is how these eight got here.

The preset banner is the one part of the practitioner view reached by the TR
content pass. The rest of that view is English on the TR route by a standing
decision (a translation backlog, documented in this file's header and in
`audit/locale-sweep-notes.md`). The preset's name and rule are the exception
because they are what the URL promises and what the page's `<title>` and meta
description say.

## The check: `audit/preset-locale.mjs`

```
node audit/preset-locale.mjs          # data only
node audit/preset-locale.mjs 4552     # plus the rendered TR and EN routes
```

Data half — every preset on a public journey (surface and `excludedFromPublic`
read from `production/surface-assignment.json`, the same boundary every
plain-Node script uses) must have a `PRESET_TR` entry; the entry's `name` and
`applicableWhen` must be present, must not be character-for-character the
English, and must not themselves read as English prose (same word list and
threshold as the sweep, used only to catch a "translation" that is still
English); a canonical `destination` must have a Turkish one; and `PRESET_TR`
may not carry a preset the corpus does not declare. The map is closed in both
directions.

Render half (with a port, after `assertServerBuild`) —

- `/tr/lab/journeys` and every `/tr/lab/journeys/<preset-id>`: the English name
  must be absent, the Turkish name present, the English `applicableWhen`
  absent and the Turkish one present.
- `/tr/lab/customer-journeys` and `/lab/customer-journeys`: the gallery's
  preset cards are client-rendered (it reads `useSearchParams`), so they are
  not in the prerendered HTML — only its **props** are, in the RSC payload.
  The check reads the name the gallery is actually given, matched on
  `PresetRow`'s own `id`/`slug`/`name` field order. This is the assertion that
  catches a call site handing the gallery `PRESET_ROWS` straight through.
- `/lab/journeys` and every `/lab/journeys/<preset-id>`: the English must still
  be there and the Turkish must not. A localizer that leaked into `en` fails
  here.

Exits non-zero on any failure; writes `audit/preset-locale-report.json`.

`PRESET_TR_SOURCE` points the data half at another copy of
`journey-tr-overrides.ts`, which exists only so the check can be run against
the pre-fix file and shown to fail.

## Before / after — the evidence

Both runs are against a server on port 4552 that `assertServerBuild` confirmed
was serving the build in question.

### Before (unmodified `main`, its own build)

```
$ node audit/preset-locale.mjs
[no_preset_map] src/lib/journey-tr-overrides.ts: no `const PRESET_TR` in the one file that owns
  TR journey content, while 8 preset(s) reach a public page. Every preset name and applicableWhen
  sentence therefore renders in English on /tr/lab/journeys and on its own /tr route.

preset-locale: 8 preset(s) in the public corpus, 0 translated, data only
failures: 1
exit=1

$ node audit/preset-locale.mjs 4552
[no_preset_map] ...
[en_name_on_tr_route] /tr/lab/journeys: English preset name "Quote Abandonment" is on the page
[en_name_on_tr_route] /tr/lab/journeys: English preset name "Application Abandonment" is on the page
[en_name_on_tr_route] /tr/lab/journeys: English preset name "Incomplete Registration" is on the page
[en_name_on_tr_route] /tr/lab/journeys: English preset name "Saved Item Reminder" is on the page
[en_name_on_tr_route] /tr/lab/journeys: English preset name "Browse Abandonment" is on the page
[en_name_on_tr_route] /tr/lab/journeys: English preset name "Product View Abandonment" is on the page
[en_name_on_tr_route] /tr/lab/journeys: English preset name "Search Abandonment" is on the page
[en_name_on_tr_route] /tr/lab/journeys: English preset name "Predicted Next Purchase" is on the page
[en_name_on_tr_route] /tr/lab/journeys/quote-abandonment: English preset name "Quote Abandonment" is on the page
[en_rule_on_tr_route] /tr/lab/journeys/quote-abandonment: English applicableWhen is on the page: "The
  resumable process is a quote or proposal the person configured and..."
  ... the same two findings for all eight preset routes ...
failures: 32
exit=1
```

(That first run of the render half was taken with an earlier revision of the
script, before the gallery assertion was changed from "visible text" to "RSC
props" — the gallery's preset cards are not in the prerendered HTML, so the
visible-text form of that assertion was wrong about *where* to look, not about
what to look for. Every finding above is a real English string on a real
Turkish page.)

### After (this branch, its own build)

```
$ node audit/preset-locale.mjs
preset-locale: 8 preset(s) in the public corpus, 8 translated, data only (pass a port to check the render)
failures: 0
exit=0

$ node audit/preset-locale.mjs 4552
preset-locale: 8 preset(s) in the public corpus, 8 translated, 20 route(s) fetched from http://localhost:4552
failures: 0
exit=0

$ node audit/locale-sweep.mjs 4552
locale-sweep: 172/172 TR routes fetched
leaks: 0 text node(s) across 0 route(s)          # unchanged: it never saw these
```

Its `known` bucket, however, did move: **3684 → 3656** text nodes. The 28 that
left are the preset `applicableWhen` sentences, which the sweep had been
filing as "canonical field outside the TR pass". That is the shape of the gap
this change closes — strings the sweep could see but was told not to fail on,
plus names it could not see at all.

What changed on the page, `/tr/lab/journeys` (visible text, before → after):

```
Quote Abandonment            → Teklif Terki
Application Abandonment      → Başvuru Terki
Incomplete Registration      → Yarım Kalan Kayıt
Saved Item Reminder          → Kaydedilen Ürün Hatırlatması
Browse Abandonment           → Gezinme Terki
Product View Abandonment     → Ürün İnceleme Terki
Search Abandonment           → Arama Terki
Predicted Next Purchase      → Öngörülen Sonraki Satın Alma
```

and on `/tr/lab/journeys/quote-abandonment`, the `<title>`, the title card,
the practitioner banner (`Ön ayar · Teklif Terki`), its rule sentence, the
`hedef :` line (`the quote` → `teklif`) and the parent's list of its three
presets. All eight preset routes return 200 in both locales.

### Still discriminating after the fix

Four independent ways of putting the check back into the state it is meant to
catch, all run against the fixed build:

```
# 1. the pre-fix overrides file - no map at all
$ git show HEAD~1:src/lib/journey-tr-overrides.ts > <scratch>/prefix-overrides.ts   # pre-fix copy
$ PRESET_TR_SOURCE=<scratch>/prefix-overrides.ts node audit/preset-locale.mjs
[no_preset_map] <scratch>/prefix-overrides.ts: no `const PRESET_TR` ... while 8 preset(s) reach a
  public page. Every preset name and applicableWhen sentence therefore renders in English ...
failures: 1 · exit=1

# 2. one entry deleted - named by id, not in bulk
$ PRESET_TR_SOURCE=<scratch>/one-missing.ts node audit/preset-locale.mjs
[preset_untranslated] browse-abandonment: no PRESET_TR entry (parent ACQ-13, English name
  "Browse Abandonment"). PRESET_TR is a closed map of every preset in the public corpus.
preset-locale: 8 preset(s) in the public corpus, 7 translated
failures: 1 · exit=1

# 3. an entry that "translates" by copying the English
$ PRESET_TR_SOURCE=<scratch>/english-passthrough.ts node audit/preset-locale.mjs
[preset_field_english] browse-abandonment.name: the Turkish is character-for-character the
  English ("Browse Abandonment...")
failures: 1 · exit=1
```

4. **The gallery-props assertion (b)**, run against the captured pre-fix and
   post-fix payloads of `/tr/lab/customer-journeys` and
   `/lab/customer-journeys` with the check's own matcher:

```
before  /tr/lab/customer-journeys   quote-abandonment -> Quote Abandonment   | browse-abandonment -> Browse Abandonment
after   /tr/lab/customer-journeys   quote-abandonment -> Teklif Terki        | browse-abandonment -> Gezinme Terki
after   /lab/customer-journeys      quote-abandonment -> Quote Abandonment   | browse-abandonment -> Browse Abandonment
```

   On the pre-fix payload the check reports `en_name_in_tr_gallery_props` for
   all eight; on the post-fix payload the TR gallery is given Turkish and the
   EN gallery is given English. That is the assertion that would catch a call
   site rendering `PRESET_ROWS` without the localizer, which no sweep of the
   HTML can see, because those cards are not in the HTML.

## The EN route did not move

`/lab/journeys`, `/lab/customer-journeys`, the two other surface galleries and
four journey/preset detail pages were fetched from a build of **unmodified
`main`** before any edit, and again from this branch's build:

- rendered visible text: **identical** on all eight routes (`diff`, empty);
- raw served HTML: **identical** once Next's per-build id is normalized
  (`md5sum` equal on `/lab/journeys`, `/lab/customer-journeys`,
  `/lab/journeys/quote-abandonment`, `/lab/journeys/abandoned-process-recovery`).

`localizedPreset` returns its argument for any lang other than `tr`, and the
check's part (c) asserts the English is still on the EN routes and the Turkish
is not, on every run.

## Scope

Unchanged: 69 / 21 / 90, the canonical corpus (303 journeys / 3959 nodes),
`src/canonical/` (not touched), every count on every page, and all styling.
