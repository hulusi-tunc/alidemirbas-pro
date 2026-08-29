# Designing pages on this site

This site's design work runs on **`web-design-director/`** — a generic,
register-aware methodology and orchestrator, built to be portable across
site types. This file is the thin, site-specific loader: it points at that
engine and names this project's own constitution instance and two rules
that hold regardless of whether the engine gets loaded.

**Read `web-design-director/SKILL.md` first.** It decides mode (DISCOVER /
DESIGN / BUILD / EDIT / QA / SHIP — `web-design-director/methodology/modes.md`),
reads project state, and loads only the modules the current task needs. Do
not answer a design request from taste alone; the reasoning lives there,
not here.

This project's filled-in constitution — the actual tokens, type ramp, and
named failure-mode incidents behind the generic engine's evidence base —
lives at `web-design-director/examples/ali-demirbas-site/`. Read
`site-constitution-instance.md` there before designing any page on this
site; it is this project's `DESIGN.md` (`web-design-director/templates/DESIGN.md`).

## Two absolute rules, even when nothing else has been loaded

- **Never restyle `SiteHeader` / `SiteFooter`** (`src/components/Site.tsx`)
  as part of a page-level change. They are shared by every page; changing
  them is a site-wide change disguised as a page change.
- **Never put a fabricated number, screenshot, or metric on a page.** No
  invented data, ever, at any stage (`web-design-director/methodology/anti-patterns.md`
  #9 — the ban is absolute and not subject to register or taste).

## Quick reference: where things live now

| Was | Now |
|---|---|
| This project's tokens/type/failure-mode narrative | `web-design-director/examples/ali-demirbas-site/site-constitution-instance.md` |
| Named failure-mode incidents (commit hashes, the 19-box case, the Stack-band withdrawal, Controlled Experiment 1) | `web-design-director/examples/ali-demirbas-site/incident-log.md` |
| The render→critique→refine loop, motion-settle protocol | `web-design-director/methodology/qa.md` (B — Visual Critique) |
| "This section looks empty" / "too safe" / "cluttered" mapping to a named defect | `web-design-director/methodology/anti-patterns.md` |

If `web-design-director/` is ever extracted into its own repository, update
the paths above to wherever it's vendored (submodule, subtree, or copy) —
nothing else on this page should need to change, because everything
project-specific already lives in `examples/ali-demirbas-site/`, not here.
