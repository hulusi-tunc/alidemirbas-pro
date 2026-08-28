<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design work on this site

Any task that designs, redesigns, restyles or visually reviews a page, section
or component — including a one-line ask like "this section looks empty" —
loads the **`ali-web-design`** skill (`.claude/skills/ali-web-design/SKILL.md`)
before writing code.

It carries three things this repo cannot afford to re-derive per session: the
design language the finished pages already speak, the named failure modes that
actually shipped here and had to be undone, and a required
render → critique → refine loop. Do not answer a design request from taste
alone; the language is settled and written down.

Two rules from it are absolute even when the skill has not been loaded:
never restyle `SiteHeader` / `SiteFooter` as part of a page-level change, and
never put a fabricated number, screenshot or metric on a page.
