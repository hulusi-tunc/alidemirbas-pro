# Designing pages on this site

This site's design work runs on **[`web-design-director`](https://github.com/ali-demirbas/web-design-director)**
— a generic, register-aware methodology and orchestrator, extracted into
its own repository so it stays reusable across site types instead of
living only inside this one. This file is the thin, site-specific loader.

**Fetch and read `web-design-director`'s `SKILL.md` first** (it's a
separate public repo now — use `WebFetch` on
`https://raw.githubusercontent.com/ali-demirbas/web-design-director/main/SKILL.md`,
or `add_repo`/clone it if the session supports that, before starting any
non-trivial design task). It decides mode (DISCOVER / DESIGN / BUILD / EDIT /
QA / SHIP — `methodology/modes.md` in that repo), reads project state, and
loads only the modules the current task needs. Do not answer a design
request from taste alone; the reasoning lives there, not here.

This project's filled-in constitution — the actual tokens, type ramp, and
named failure-mode incidents behind the generic engine's evidence base —
lives at `examples/ali-demirbas-site/` in that same repo. Read
`site-constitution-instance.md` there before designing any page on this
site; it is this project's `DESIGN.md` (`templates/DESIGN.md` in that repo).

## Two absolute rules, even when nothing else has been loaded

- **Never restyle `SiteHeader` / `SiteFooter`** (`src/components/Site.tsx`)
  as part of a page-level change. They are shared by every page; changing
  them is a site-wide change disguised as a page change.
- **Never put a fabricated number, screenshot, or metric on a page.** No
  invented data, ever, at any stage (the methodology's `anti-patterns.md`
  #9 — the ban is absolute and not subject to register or taste).

## Why this file is thin

The methodology used to live in this repo (`web-design-director/`), fully
self-contained and already verified to have zero references outside
itself. It has since been extracted to
[github.com/ali-demirbas/web-design-director](https://github.com/ali-demirbas/web-design-director)
so it can be reused on other projects without dragging this site's own
specifics along. Nothing about the reasoning changed in the move — only
its address. If a session working on this repo needs the methodology and
can't reach the external repo (no network, no `add_repo` support), say so
plainly rather than designing from memory or from taste alone; that
silence-vs-fabrication distinction is itself one of the methodology's own
rules (`core-principles.md` P20, environment-awareness.md).
