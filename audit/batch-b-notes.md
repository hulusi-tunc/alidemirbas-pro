# Batch B — five loyalty / relationship journeys

Phase 25, batch 2 of 4. Adds RET-295, SUB-296, SUB-297, SUB-298 and SUB-299 per
`audit/new-journey-id-map.md`. Public library **58 → 63**; canonical corpus
**292/3802 → 297/3854**. The 21-journey exclusion list is untouched, and no
existing journey was removed, restored or re-evaluated.

| Id | Journey | Slug | File | Nodes | Customer-facing touches |
|---|---|---|---|--:|--:|
| RET-295 | Birthday & Milestone | `milestone-recognition` | `src/canonical/retention.ts` | 8 | **1** |
| SUB-296 | Loyalty Program Welcome | `loyalty-welcome` | `src/canonical/subscription.ts` | 13 | **2** |
| SUB-297 | Loyalty Program Nurture | `loyalty-nurture` | `src/canonical/subscription.ts` | 13 | **2** |
| SUB-298 | Reward Confirmation | `reward-confirmation` | `src/canonical/subscription.ts` | 7 | **1** |
| SUB-299 | Loyalty Tier Upgrade | `loyalty-tier-change` | `src/canonical/subscription.ts` | 11 | **1** |

Seven touches across five journeys. Nothing was padded to look substantial:
every journey that sends twice does so because its second touch is reached only
through a condition that re-read authoritative state and found the first one had
not landed the outcome.

## Ownership boundaries, and the side each is stated from

The standing rule in this repo is that a claimed collision must quote the
`contact.competition` block of **both** sides, and that a boundary stated from
one side only is a bug. Both halves of every boundary below are in the data.

### 1. RET-295 (personal date) vs RET-292 (relationship anniversary)

Batch A flagged this when it authored RET-292. RET-292 previously declared
`"competition": "none"`; it now shares an exclusion group with RET-295, and both
sides carry a reciprocal `distinctFrom` row.

**RET-295's own block:**

```
exclusionGroup: "date-recognition"
scope:          "person"
precedence:     "above the first-purchase anniversary for the same person - a date the
                 person would call their own comes before the company's own count of how
                 long the relationship has lasted; while this journey holds the person's
                 window, that one is suppressed for it rather than queued behind it"
onLoss:         "suppressed"
```

**RET-292's own block (changed in this batch):**

```
exclusionGroup: "date-recognition"
scope:          "person"
precedence:     "below the personal milestone recognition for the same person - the
                 company's own count of how long the relationship has lasted yields to a
                 date the person would call their own; where both fall in the same window
                 this one is suppressed and its interval closes unsent, exactly as an
                 interval that passes unsent always does here"
onLoss:         "suppressed"
```

Why RET-295 is the one on top: a birthday or a milestone the person's own record
reached is addressed to *them*; an anniversary counted from the first purchase is
the company counting its own side of the relationship. When only one may be sent,
the message about the person wins and the company's self-count yields — and the
cost of that loss is already what RET-292's own `s.interval` rule says happens to
any interval that passes unsent: it closes, it is never sent late.

RET-292 also gained an `s.contest` suppression (and its id in
`orchestration.noAction`) so the loss has a named reason rather than being
absorbed silently by the generic send-path gate.

### 2. The four membership journeys — `membership-standing`

SUB-296, SUB-297, SUB-298 and SUB-299 all speak to the same member about the same
membership, so they are one exclusion group, scope `subscription` (the
`CompetitionScope` vocabulary has no `membership` member, and the id map's own
reasoning — a loyalty membership is an ordinary enrolled relationship with a join,
a state and an exit — is why loyalty sits under `SUB` at all). Precedence, top to
bottom: **reward confirmation → tier change → welcome → nurture.**

- **SUB-298** — `"highest in the group - a state the membership has actually reached
  outranks every marketing-shaped message about it, so the welcome, the tier
  announcement and the nurture are all suppressed for a membership this journey is
  holding; it yields to nothing in this group and loses only to a newer
  authoritative state for the same reward"`, `onLoss: "superseded"`. It is the only
  transactional journey in the batch (`defaultPriority: "transactional"`,
  `pressureClass: "none"`, `localCap.appliesTo: "non-mandatory"`, its one touch
  `mandatory: true`), so it is never traded against a marketing contact budget.
- **SUB-299** — `"below the reward confirmation on the same membership … above the
  membership welcome and the membership nurture, both of which are suppressed while
  this journey holds the membership because a standing that has just moved is the
  more current thing to say"`, `onLoss: "suppressed"`.
- **SUB-296** — `"below the reward confirmation and below the tier change on the same
  membership - a state the membership has actually reached outranks an introduction
  to it; above the membership nurture, which is suppressed for a membership this new
  because a member who has not yet been welcomed cannot be nurtured"`,
  `onLoss: "suppressed"`.
- **SUB-297** — `"lowest in the group - a reward the membership has earned, a change in
  its standing and the welcome that opens it all outrank a reminder that something
  already held has gone unused; while any of them holds the membership, this journey
  is suppressed for it"`, `onLoss: "suppressed"`.

SUB-297 states the SUB-298 boundary from its own side twice more — in its
`s.transactional` suppression and in its `distinctFrom` — and SUB-298 states it
back in its own `distinctFrom` row for SUB-297.

### 3. SUB-296 vs the first-purchase welcome and vs product onboarding

These are different entities (a membership; a customer relationship; an onboarding
instance), so a shared exclusion group would be a category error — two journeys only
compete when they contend for the same scope *instance*. The boundary is therefore
stated as reciprocal `distinctFrom` rows plus suppressions, not as precedence:

- **RET-290 → SUB-296** (added this batch) and **SUB-296 → RET-290**: RET-290 owns the
  first-purchase moment and never explains the membership; SUB-296 owns the
  membership and never makes the bounceback offer. Where somebody enrols at the
  moment they first buy, both are true at once and neither carries the other's
  message. SUB-296's `s.purchase` suppression says the same thing in its own voice.
- **ACT-12 → SUB-296** (added this batch) and **SUB-296 → ACT-12**: enrolling in a
  membership is not a setup step and never advances the onboarding record; SUB-296
  never orients anybody inside the product. SUB-296's `s.onboarding` suppression is
  the third statement of it.

### 4. SUB-297 vs the recommendation family

Also different subjects rather than a contest: RET-293/RET-294 propose things to
*buy*; SUB-297 names one thing the member *already holds*. Reciprocal rows were
added on both sides — **RET-293 → SUB-297**, **RET-294 → SUB-297**, and SUB-297 →
RET-293 / RET-294 — and SUB-297's `s.recommendation` suppression forbids it from
ever assembling a set of items or dressing a product proposal as a membership
benefit.

## Deliberately out of scope

- **Downgrade (SUB-299).** Upgrade only, and the refusal is **in the graph**, not in
  a comment: `loyalty_tier_changed` fires for a downward movement too, `c.direction`
  reads the programme's own ordering, and a downward movement exits at
  `x.out-of-scope` (class `no-action`) without a message. A loss of standing carries
  obligations an upgrade announcement does not have — what is lost, when, and what
  the member may still do about it — and it deserves a journey written for it rather
  than an upgrade's structure with the words changed. Stated in `entity.note`,
  `eligibility`, the `s.upgrade-only` suppression and the guardrails.
- **No downgrade handoff.** SUB-299 does not hand a downgrade to another journey,
  because no journey in the corpus owns that message today and a handoff to a target
  that does not exist is exactly what `validate:canonical` forbids. `x.out-of-scope`'s
  `reEntry` says so in plain words instead of implying a route that is not there.
- **SUB-297 is bounded, not a drip.** One explanation and at most one reminder;
  reaching the end of the plan closes the instance rather than restarting it with
  different words (`s.bounded`), and a membership holding several unused things does
  not become a standing campaign — the cooldown is what stops that.
- **No holdout on SUB-299.** `comparison: "none"`. Withholding the news of a standing
  somebody has actually earned is not an acceptable control, so the journey declares
  no holdout rather than claiming a comparison it should not run. SUB-296 and SUB-297
  both do carry a required persistent holdout, because members use what they hold
  without being told and neither journey may claim those uses.
- **No new `external:` handoff target**, so `EXTERNAL_TARGET_TR` needed no entry.

## Vendor neutrality

Nothing here names, paraphrases or copies any vendor's copy, terminology,
message text or integration logic. The two new semantic events added to
`scripts/event-curation.json` — `loyalty_benefit_used` and
`loyalty_membership_ended` — are described in the corpus's own vocabulary; their
`commonMappings` are generic event names a company might already use, in the same
spirit as every other entry in that file. No number, benchmark or percentage was
invented: every `Config` is either `required: true` or carries a `corpus-rule`
basis pointing at GLB-24.

## Registration touched

`src/lib/public-corpus.ts` (58 → 63), `scripts/public-scope.mjs`
(`EXPECTED_PUBLIC_COUNT` 63), `production/validate-journey-production.mjs`
(baseline 292/3802 → 297/3854, with the reason recorded beside the Batch A bump),
`scripts/event-curation.json` + regenerated `src/canonical/events.ts` (464 → 471
events), `src/lib/journey-tr-overrides.ts` (all 52 new node ids), and the
regenerated `production/` and `search/` artifacts.

## Inherited failure worth naming

`node seo/seo-validator.mjs` check 18 (`AB/journey/blog counts used by sitemap.ts
match the live data sources`) hardcodes `journeyViewModel.length === 286`. It was
already failing before this batch — Batch A moved the view model to 292 without
bumping it — so it now reports `journey=297` instead of `journey=292`. Left alone
rather than quietly edited; it belongs with whichever batch owns that constant.
`npm run validate:seo`, which is the npm-script gate, passes. The other documented
known failures (seo-validator 14, search-validator 30/31, 9 query fixtures) are
unchanged in count and content.
