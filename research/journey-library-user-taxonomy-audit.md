# Journey Library — user-facing taxonomy audit

Product/IA/UX task, not a canonical architecture change. Nothing under `src/canonical/` is
touched; no journey semantics change. Scope: `/lab/journeys` (hub) and its four listing surfaces
(`/lab/customer-journeys`, `/lab/lifecycle-states`, `/lab/runtime-mechanisms`,
`/lab/operational-workflows`), both locales.

## 1. Current problem

The brief's own framing names 2 pages (`/lab/customer-journeys`, `/lab/operational-workflows`).
**The live site actually has 4 equal-weight top-level listing routes**, not 2 — inspected directly
in `src/lib/canonical-view.ts` (`SURFACE_KEYS`), `src/components/JourneyLibraryPage.tsx` (the hub's
`Split()` section renders one card per surface, all four styled with the same card treatment
except a dark/outline tone difference), and `src/components/JourneyGallery.tsx` (each of the four
pages carries a "surface switch" — four pill-links to the other three, all equal weight):

| Route | Label shown today | Count |
|---|---|---|
| `/lab/customer-journeys` | "Customer journeys" | 68 |
| `/lab/lifecycle-states` | "Lifecycle states" | 67 |
| `/lab/runtime-mechanisms` | "Runtime mechanisms" | 25 |
| `/lab/operational-workflows` | "Operational workflows" | 124 |

Three of these four labels are architecture terms, not practitioner language: "Runtime
mechanisms" and "Lifecycle states" name *how the canonical system is built*, not *what a visitor
would look for*; "Operational workflows" is vague on its own (workflows for what?). Only "Customer
journeys" reads as a category a first-time visitor already has a mental slot for.

The corpus's own copy already signals this, unprompted — `lifecycle-states`' blurb reads "Browse
them as dependencies and linked supporting logic, **not as campaigns to launch**" and
`runtime-mechanisms`' reads "Contracts, not customer journeys" — both are written as if to
pre-empt a visitor who arrived expecting something to browse for its own sake. That is itself
evidence the current flat, equal-weight framing oversells two of the four surfaces.

Meanwhile the hub's own **Hero and Final sections already frame the library as a 2-way choice**
(`ctaCommunication` → customer-journeys, `ctaInternal` → operational-workflows) while the **middle
Split section shows all 4 as equal cards** — an internal inconsistency on the hub page itself, not
just a labeling problem.

## 2. Recommended number of primary sections

**2 primary discovery sections**, with the other two canonical surfaces kept as fully live,
fully linked, fully searchable **secondary/reference surfaces** rather than deleted or hidden.
This is the low end of the brief's allowed 2–4 range, and it is the best-supported reading of the
actual content shape:

- `lifecycle-states` and `runtime-mechanisms` are both real, valuable, but neither is a thing a
  practitioner opens looking for "something to browse" — one is silent state a communicating
  journey depends on, the other is delivery/retry/eligibility machinery every journey runs on. Both
  are naturally discovered *from* a journey ("what does this depend on," "what runtime machinery
  does this rely on"), not browsed to on their own, and the corpus's own copy already says so.
- Splitting `operational-workflows`'s 124 items into 2–3 *additional* top-level routes was
  evaluated and rejected (§3) — the content clusters cleanly by **filter**, not by needing its own
  URL, and adding more top-level routes would move the taxonomy layer count in the wrong direction
  ("do not add dozens of taxonomy layers").

This is not a demotion in substance: nothing is deleted, no URL changes, no canonical label is
removed. It is a demotion in **prominence** — which two surfaces the hub markets with equal weight,
and which two it correctly frames as supporting material.

## 3. Final section names

| Surface (route unchanged) | Old label | New label | Role |
|---|---|---|---|
| `/lab/customer-journeys` | Customer journeys | **Customer Journeys** (unchanged) | PRIMARY |
| `/lab/operational-workflows` | Operational workflows | **Operations** | PRIMARY |
| `/lab/lifecycle-states` | Lifecycle states | **Lifecycle States** (unchanged label, reframed copy) | SECONDARY / reference |
| `/lab/runtime-mechanisms` | Runtime mechanisms | **Runtime Mechanisms** (unchanged) | ADVANCED / TECHNICAL |

**Why "Operations," not "Operational Workflows":** the 124 items collectively do the internal work
a business already calls "operations" in ordinary language — approvals, ownership and access
changes, incident response, document handling, payment and refund resolution, deployments. "Ops"
is a term practitioners already use for exactly this kind of internal, cross-functional work;
"workflows" is the part that reads as software-internal. Dropping it, not replacing it with another
compound, is the smaller change. The route itself, `/lab/operational-workflows`, is **not**
renamed — only the display label, page title and copy change; the URL, canonical `surface` key,
sitemap entry and every existing deep link keep working unmodified.

`Lifecycle States` and `Runtime Mechanisms` keep their existing labels. Per the brief: architecture
terms "may remain useful internally or on advanced/detail surfaces" — both pages remain fully
built, fully indexed, fully linked from journey detail pages ("depends on" / "runs on"); they are
just no longer given equal marketing weight on the hub as the two primary destinations.

## 4. Counts per section

**Superseded by §12.** As first shipped this round, the split was Customer Journeys 68 / Operations
124 / Lifecycle States 67 / Runtime Mechanisms 25 — read straight off `communicating`
(`surface.ts`'s `sends`), which put 3 journeys that route work to a person but send no message
(ACQ-04, ACT-11, RET-24) under Lifecycle States. §12 corrects this: those 3 move to Customer
Journeys, which is where a practitioner actually looks for them. Final counts:

| Section | Count | Role |
|---|---|---|
| Customer Journeys | 71 (68 Customer Engagement + 3 Human Routing) | PRIMARY |
| Operations | 124 | PRIMARY |
| Lifecycle States | 64 | SECONDARY |
| Runtime Mechanisms | 25 | ADVANCED |
| **Total** | **284** | — |

No item moves between the 3 *canonical* surfaces (customer/mechanism/operational) —
`src/canonical/surface.ts`'s own rule is unchanged and this task never touches it. What moves in
§12 is 3 items between two *site* listing pages within the single canonical "customer" surface.

## 5. Item-placement changes

**None.** Every one of the 284 items' surface assignment is correct as-is (this was independently
re-verified twice in prior rounds' own audits, most recently the cross-library integration round —
0 leakage between surfaces, confirmed by direct computation). This task's item-level review found:

- **100% of the 124 Operations items already carry a practitioner-facing `shortName`** (e.g.
  `OWN-56` → "Approval Request", `FIN-138` → "Refund Execution Verification", `INC-259` →
  "Post-Incident Review") — checked directly against `production/canonical-dump.json`; zero items
  fall back to the long canonical chain-name on a card. No per-item display-name work was needed.
- Card content (`JourneyIdeaCard`) already follows the right discipline — the file's own history
  comment records a prior round removing the canonical chain-name from the card face specifically
  because it competed with the title; `shortName` leads, canonical `id` is present but small, in
  the footer, next to node count. Nothing here needed changing.
- A handful of Operations items read more technical even by `shortName` alone (`Verification
  Dependency Resolution`, `Migration Readiness Validation`, `Delegation Authorization`) — these are
  correctly classified ADVANCED-flavored within the section (§ Filters), not misplaced; the fix is
  a filter that lets a practitioner skip past them by work type, not a rename.

## 6. Display-name changes

None required — see §5. `shortName` already serves the `displayName` role the brief describes;
`canonicalName` (the full chain-form `name`) stays exactly where it already lives, on the detail
page.

## 7. Filters per section

**Customer Journeys** (unchanged — already audited and tuned): Category, Channel, Goal, Search.
Kept as-is; Goal is explicitly documented in code as "this library's audited primary discovery
filter" for communicating journeys and the data supports that (channel and goal both carry real,
usable spread across 68 items).

**Operations** (changed): the existing filter set was Category (18 present values) + Goal (**23**
present values, several with a single-digit count) + Channel (auto-hidden, only `task` ever
present). Goal is not a usable filter here — it was tuned for customer journeys, not internal work,
and 23 near-flat values is exactly the "12 filters because data exists" failure mode the brief
warns against.

Replaced Goal with a new **Type** filter — 4 values, derived directly from the 18 real categories
present on this surface (not invented, not the brief's own example labels applied blindly; grouped
by what the categories' own titles already say they are about):

| Type | Categories folded in | Count |
|---|---|---|
| Reviews & Decisions | ownership, decision, risk, control | 37 |
| Account & Access | access, identity, structure, terminal | 21 |
| Service & Fulfillment | financial, remedy, document, subscription, scheduling | 21 |
| Systems & Reliability | integration, data, rollout, incident, time | 45 |

Final Operations filter set: **Type (new) + Category (kept) + Search** — 2 real filters plus
search, on the low end of the brief's 3–5 target, deliberately: Category and Type overlap by
design (Type is a coarser grouping of the same field), so offering both without a third dimension
that adds nothing is the "smallest useful set," not an omission.

**Lifecycle States / Runtime Mechanisms** (unchanged): both are lower-traffic, already-adequate
Category + Channel(auto-hidden) + Goal filter sets; this task does not touch them, consistent with
treating them as secondary surfaces this round is not redesigning.

## 8. Search improvements

Spot-checked the 9 sample queries the brief names directly against the live search index
(`search/search-index-light.json`, 525 documents): *checkout abandonment, renewal, payment
failure, identity verification, complaint, refund, access, retention, document review*. All 9
returned relevant, correctly-targeted top results (e.g. "payment failure" → `FIN-132`/`FIN-134`/
`FIN-135`; "complaint" → `FBK-46`/`REM-151`; "refund" → `FIN-137`/`FIN-138`). **No search fix was
needed or made** — the existing aliases/keywords/summary fields already carry practitioner
vocabulary well. Per the brief's own instruction not to rename the canonical model merely for
search, and finding nothing broken, none was touched.

## 9. Listing/card changes

Card component (`JourneyIdeaCard`) unchanged — already correct (§5). Section-header components
(`CategorySection` in `JourneyGallery.tsx`) unchanged — category title + real `purpose` sentence +
count, already matches the brief's card-quality bar. The only listing-level change is the new Type
filter's UI (one more `<select>`, same pattern as the existing Category/Channel/Goal controls) and
the section-copy rewrite described in §3/§11.

## 10. Routes/navigation changes

**No route changes, no redirects needed.** All four URLs (`/lab/customer-journeys`,
`/lab/lifecycle-states`, `/lab/runtime-mechanisms`, `/lab/operational-workflows`) and their `tr`
mirrors stay exactly where they are — every canonical deep link, every sitemap entry, every
existing inbound link keeps working. The change is confined to:

- The hub's `Split()` section (`JourneyLibraryPage.tsx`): today renders 4 equal-weight cards; will
  render Customer Journeys and Operations as the two full primary cards, with Lifecycle States and
  Runtime Mechanisms folded into a visually secondary strip beneath — same information, same links,
  different weight, resolving the Hero/Final-vs-Split inconsistency named in §1.
- Each surface page's own "surface switch" (`JourneyGallery.tsx`): stays a link row to all four
  routes (removing a working cross-link would be a regression, not a simplification) but the two
  secondary labels read plainly rather than as equal-weight tabs.
- Copy only (`src/lib/content.ts`, both `en` and `tr`): the `operational-workflows` label/blurb/
  intro, and light reframing of the two secondary surfaces' blurbs to read explicitly as
  reference/dependency material.

## 11. Implementation summary

As built (5 files, EN + TR both updated in every content change):

1. `src/lib/content.ts` — reworded `journeysSplit.surfaceLabels["operational-workflows"]`,
   `surfaceBlurbs["operational-workflows"]`, `surfaces["operational-workflows"].{title,intro}`;
   added the 4 Type filter labels plus `workTypeFilterLabel`/`allWorkTypes`/`workTypeLabels`; added
   `referenceStrip` (the hub's secondary-strip caption); reworded the hub's own `journeysHub.split`
   eyebrow/title/body and `ctaInternal` pill label from a "four equal surfaces" framing to the
   2-primary-plus-2-reference framing this round settled on — this last piece surfaced only once the
   new `Split()` layout was rendered and compared against its own heading (render → critique → fix,
   not planned in the original 5-point list above).
2. `src/lib/operational-work-type.ts` — new file: the `OperationalWorkType` type, the ordered
   4-value list, and `OPERATIONAL_WORK_TYPE_OF`, the Type↔Category mapping table from §7. Read-only,
   reads `CategoryId`, deriving nothing new from canonical source; nothing in `src/canonical/` reads
   it back.
3. `src/components/JourneyGallery.tsx` — added the Type `<select>` for the `operational-workflows`
   surface only (`usesWorkType`), replacing Goal for that surface; Category, Channel, Search
   unchanged; the other three surfaces keep their existing Goal-based filter set untouched.
   Confirmed by direct interaction (not just visual check): selecting "Account & access" returns
   exactly 21/124, matching §7's table.
4. `src/components/JourneyLibraryPage.tsx` — `Split()` now renders `PRIMARY_SURFACE_KEYS`
   (Customer Journeys, Operations) as the two full `Half()` cards, and a new `ReferenceStrip`
   renders `SECONDARY_SURFACE_KEYS` (Lifecycle States, Runtime Mechanisms) as two smaller
   `ReferenceCard`s underneath their own caption — same links, same counts, reduced visual weight.
   Removed the now-unused `SURFACE_KEYS` import.
5. Both `page.tsx` files for `/lab/operational-workflows` (en + tr) needed no direct edit — they
   pick up the new title/intro automatically via
   `copy.lab.journeysSplit.surfaces["operational-workflows"]`, confirmed by rendering the live page.

Verified by rendering, not just compiling: the hub (`/lab/journeys`) and the Operations surface
(`/lab/operational-workflows`) were both screenshotted end-to-end (scrolled, to let the page's
existing `Reveal`/`IntersectionObserver` animations fire) and the Type filter was driven through a
real `<select>` interaction rather than inspected as markup only.

No canonical file, no validator, no production/ or search/ generated artifact is touched. Full
verification run: `npx tsc --noEmit` clean, `npm run build` clean (every route still `○`/`●` except
the pre-existing `ƒ` exceptions), `npm run lint` shows the same pre-existing 13 warnings and 1
pre-existing error (`MobileNav.tsx`, confirmed present on a clean stash of this branch, untouched by
this change) plus one already-pre-existing unused-import warning in `JourneyLibraryPage.tsx`
(present before this round too), `npm run validate:canonical` 0 errors / 284 journeys / 3690 nodes
unchanged, `npm run validate:journey-production` 30/30 PASS including check 30 (canonical source
mutation = 0), `npm run validate:seo` PASS.

## 12. Final correction — the 3 human-routing journeys (post-review)

Pre-merge review caught a real gap in §4/§7 above: the site's Customer Journeys / Lifecycle States
split read `communicating` alone (`surface.ts`'s `sends` - "declares a message channel"), so 3
journeys that resolve entirely by putting a person on the work - **ACQ-04** (High-Intent Lead
Routing, `channels: ["sales", "task"]`), **ACT-11** (Onboarding Route Assignment, `["task"]`) and
**RET-24** (Churn Risk Escalation, `["task"]`) - landed on `/lab/lifecycle-states` alongside the 64
journeys that are genuinely silent state. They are not: `surface.ts` computes exactly this
distinction already, as its own `routesToHuman` field (independent of `sends`), and its own doc
comment names these 3 journeys as precisely the `routesToHuman: true, sends: false` case. The site
read `sends` and dropped `routesToHuman` on the floor.

**Fix, presentation-layer only:**

- `src/lib/canonical-view.ts` - `JourneyRow` gained a `routesToHuman` field (copied straight from
  `surfaceOf(j).routesToHuman`, already-computed canonical metadata, nothing new derived).
  `surfaceKeyOf` now reads `communicating || routesToHuman` for the customer-journeys/
  lifecycle-states split, instead of `communicating` alone. A new `isHumanRoutingRow` reads the same
  two fields for card presentation. **`src/canonical/surface.ts` was not touched** - `sends`,
  `routesToHuman` and the canonical `surface: "customer"` classification are exactly what they were;
  only which of the site's two listing pages a "customer" journey with `routesToHuman: true` renders
  under changed.
- The 3 journeys need no item-level rework: all 3 already carry a practitioner `shortName` and a
  non-empty `channels` array (`sales`/`task`), so their cards already render the right badge
  (`Sales`/`Task`, accent tone) the moment they list under Customer Journeys. Added on top: a small
  muted **"Human routing"** badge (`humanRoutingBadge`, EN/TR), prepended before the channel badges
  on exactly these 3 cards wherever a Customer Journeys card renders (`JourneyGallery.tsx`'s
  category-grouped and flat-filtered grids, `JourneyLibraryPage.tsx`'s hub preview) - the
  "Customer Engagement / Human Routing" distinction the correction asked for, at the smallest weight
  that does the job. No new filter control: with only 3 items, a dropdown would repeat the exact
  "12 filters because data exists" mistake this whole audit exists to avoid, and the existing
  Channel filter already isolates them (`Sales`/`Task`) for a reader who wants to).
- `src/lib/content.ts` - `surfaces["customer-journeys"].intro` (EN+TR) no longer says
  "communicating customer journeys" (no longer accurate for all 71); reworded to "each one reaches a
  customer, by message or by routing the work to a person." `{count}`/`{presets}` are unchanged
  template variables, still filled from `SURFACE_ROWS["customer-journeys"].length` at the page level
  - no `page.tsx` edit needed, the count updates from 68 to 71 automatically. Added
  `humanRoutingBadge` next to the surface's other card-badge labels (`internalBadge`, `silentBadge`,
  `mechanismBadge`).

**Verified counts** (`SURFACE_ROWS[key].length` at build): Customer Journeys 71 (68 `communicating`
+ 3 `routesToHuman`-only), Lifecycle States 64, Operations 124 (untouched), Runtime Mechanisms 25
(untouched). Total 284, unchanged. `npm run validate:canonical` still reports the canonical split
unchanged - customer 135 (68 communicating / 67 silent by `sends` alone, exactly as before) - because
that number is `surface.ts`'s own, and this correction never touched `surface.ts`; only the site's
further split of "customer" into two listing pages moved.
