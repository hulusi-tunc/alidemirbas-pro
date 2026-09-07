# Retired site copy (2026-09-05)

`retired-copy.json` holds, verbatim and in both locales, every key that was removed from
`src/lib/content.ts` in the 2026-09-05 content-architecture audit because no component read
it any more. Keys are the dotted path under `copy.en` / `copy.tr`.

Why each block was dead:

- `hero.reassurance` — the home hero stopped rendering the reassurance chips; the same
  facts live in `home.spec`.
- `lab.viewAll` — the Lab index and the home Lab band build their own links.
- `lab.journeysSplit.{communicationLabel, internalLabel, hubIntro, communicationBlurb,
  internalBlurb, communication, internal}` — the pre-2026-09-05 "communication / internal"
  split of the journeys hub. The hub now routes by product surface
  (`journeysSplit.surfaces`); these strings duplicated `lab.page.intro` and the surface blurbs.
- `about.{title, sub, lead, body, experience, timeline}` — the About page's career timeline
  and opening prose are authored in `src/components/AboutPage.tsx` (`JOBS` and `T`). This copy
  was a second, drifting version of the same facts (different company descriptors and periods).
  `about.metaTitle`, `metaDesc`, `eyebrow`, `moreLink`, `teaserLead` stay live.
- `contact.{linkedinGo, emailLabel, emailGo}` — the contact page renders `linkedinLabel`,
  `emailPill` and the form; these button labels had no caller.
- `journeyBuilder.{ctaJourney, anatomy, inspector, how, related, watchDemo}` — sections of
  the earlier `/lab/claude-lifecycle` page (hero CTA, node anatomy legend, handoff inspector,
  how-it-works, related-tool card, demo video) that were removed with `HandoffInspector`,
  `HeroVideoCard` and `JourneyCarousel` (see `../unused-ui-components/`).
- `abTesting.exampleTitle`, `abTesting.product.heroProof` — superseded by
  `abTesting.example.*` and `abTesting.product.brief`.

Restoring any of them is a copy-paste back into `content.ts` at the same path, in both
locales, plus a component that reads it.
