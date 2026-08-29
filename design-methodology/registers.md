# Registers

[PLAUSIBLE] The taxonomy below is logically forced by the reversal matrix
but has not been validated end-to-end across real projects in every
register. Treat classifications as declared assumptions open to correction,
not as ground truth.

A register is not an audience description. It is the switch that decides
which design rules apply, which reverse, and how large the risk budget is.
**No visual decision is valid before a register is declared** (core P3).

Six registers. UTILITY carries two sub-modes because eleven of its thirteen
behaviors are identical across tools and documentation; the two that differ
(composition, interaction priority) are set by the sub-mode.

---

## UTILITY (sub-modes: interactive · reading)

| Attribute | Behavior |
|---|---|
| Primary user job | Arrive with an input, leave with an answer or a completed task |
| Primary design job | Remove every obstacle between arrival and answer |
| Emotional register | Dependable calm; excitement is subtracted here, not added |
| Information density | High — hiding information is a cost; emptiness delays the answer |
| Convention / distinctiveness | Convention wins. Familiarity is usability. Distinctiveness budget ≈ 0 |
| Typography behavior | Self-effacing; carries hierarchy, never voice |
| Composition behavior | The anchor is the tool/answer itself, at reading measure. *interactive*: density gradient toward the working surface. *reading*: measure and rhythm are law; persistent rail for context |
| Imagery behavior | Explanatory and real only; decorative imagery lowers trust |
| Motion budget | ≈0; state feedback only |
| Interaction priority | Highest — states, forms, error paths are the body of the work. *reading*: navigation and search instead |
| Trust requirement | Correctness + consistency; one wrong number kills the page |
| Aesthetic risk budget | ≈0 |
| Common failure mode | Dressing the tool in marketing dramaturgy |

## PRODUCT MARKETING

| Attribute | Behavior |
|---|---|
| Primary user job | Evaluate a product for a later decision |
| Primary design job | Pair every claim with a witness — real product material beside every assertion |
| Emotional register | Competent, alive, unexaggerated |
| Information density | Medium; dense in proof, sparse in ornament |
| Convention / distinctiveness | Convention in structure, distinctiveness in identity; medium budget |
| Typography behavior | May carry expression but never outranks the claim |
| Composition behavior | Full-width anchors and bleed are the native language; no section is text-only |
| Imagery behavior | Real product material mandatory; evidence, not atmosphere |
| Motion budget | Medium; one orchestrated moment is legitimate |
| Interaction priority | CTA journey + section navigation |
| Trust requirement | Built through specificity: real screens, real numbers, real names |
| Aesthetic risk budget | Low-to-medium; one signature element |
| Common failure mode | A wall of unwitnessed claims; whimsy aimed at a trust-critical buyer |

## EDITORIAL

| Attribute | Behavior |
|---|---|
| Primary user job | Read — surrender attention voluntarily |
| Primary design job | Sustain reading: measure, rhythm, and pacing are law |
| Emotional register | Authority plus the publication's own voice |
| Information density | Low-to-medium on reading surfaces; high on index surfaces |
| Convention / distinctiveness | Strong template + per-story art direction. Distinctiveness lives in the template, not per page |
| Typography behavior | Highest typographic responsibility; readability craft first, expression second |
| Composition behavior | Stable symmetric body; interruption (pull-quote) is a budgeted tradition; figure interleave |
| Imagery behavior | Image direction is first-class work, decided per story |
| Motion budget | Low; anything that interrupts reading is debt |
| Interaction priority | Flow between pieces (next story, related) |
| Trust requirement | Consistency and editing discipline |
| Aesthetic risk budget | Medium-high at template design time; low at page execution time |
| Common failure mode | Redesigning every issue; ornamental body text without measure |

## PORTFOLIO / PERSONAL

| Attribute | Behavior |
|---|---|
| Primary user job | Judge a person through their work |
| Primary design job | Stage the work itself as evidence; the site is the first sample of its owner's judgment |
| Emotional register | Character and competence at once |
| Information density | Variable: dense where the work is, spacious where the narrative is |
| Convention / distinctiveness | High distinctiveness budget — but it must be **derived** from the person's real work (core P4) |
| Typography behavior | May carry identity; **recedes when the work is visual** (a photography portfolio anchors on images, not type) |
| Composition behavior | Anchors are real work artifacts; index-as-texture for bodies of work |
| Imagery behavior | The imagery *is* the work; fabrication is fatal |
| Motion budget | Medium; one moment in service of character |
| Interaction priority | Exploration + the contact path |
| Trust requirement | Honesty; one inflated number poisons the whole site |
| Aesthetic risk budget | Medium-high, if derived |
| Common failure mode | Talking *about* the work instead of showing it (this is where dead canvas lives) |

## PREMIUM BRAND

| Attribute | Behavior |
|---|---|
| Primary user job | Feel and remember; purchase happens later or elsewhere |
| Primary design job | Build perceived value through staging; exploration is part of the job |
| Emotional register | Desire + the sense of craft |
| Information density | **Low — scarcity signals value** (full reversal of commerce/utility) |
| Convention / distinctiveness | Highest distinctiveness budget; convention reads as commodity |
| Typography behavior | The most legitimate place to spend the budget on type: it is part of the emotional signal |
| Composition behavior | Few elements, large imagery, wide space; bleed and asymmetry are native |
| Imagery behavior | First-class and non-negotiable in quality. IF real assets of sufficient quality do not exist → say so; do not generate substitutes |
| Motion budget | Highest; easing quality becomes a QA subject |
| Interaction priority | Atmospheric exploration; the purchase path itself stays conventional |
| Trust requirement | Flawless execution — one cheap detail breaks the illusion |
| Aesthetic risk budget | Highest; **one real risk is expected, not optional** |
| Common failure mode | Atmosphere without craft precision ("cheap luxury") |

## COMMERCE (listing / product detail / checkout)

| Attribute | Behavior |
|---|---|
| Primary user job | Evaluate and buy — money is on the table now |
| Primary design job | Present decision information completely, comparably, reliably |
| Emotional register | Trust + efficiency; surprise is the enemy |
| Information density | High — abundance sells (the inverse of premium brand) |
| Convention / distinctiveness | Convention near-absolute: gallery/price/cart patterns are learned behavior; identity survives at accent level |
| Typography behavior | Price/variant/state hierarchy outranks everything |
| Composition behavior | Dense module sequences; repetition + break (badges) is the native move |
| Imagery behavior | Product imagery is decision data; accuracy is a legal-grade requirement |
| Motion budget | Low; state and gallery only |
| Interaction priority | Variant selection, stock, cart; error states cost money |
| Trust requirement | Highest and most concrete: returns, shipping, secure payment |
| Aesthetic risk budget | ≈0 on transaction surfaces |
| Common failure mode | A brand-site cosplay PDP — pruning decision info for atmosphere |

---

## Register classification procedure

Infer from the brief. Do not interrogate the user when the brief suffices.

1. **What did the visitor come here to do?** get an answer / complete a task
   (UTILITY) · evaluate for purchase (MARKETING or COMMERCE) · read
   (EDITORIAL) · judge a person (PORTFOLIO) · feel a brand (BRAND)
2. **What does success look like ~60 seconds in?** task done · demo booked ·
   still reading · contact made · item in cart · brand remembered
3. **Relationship to money:** now (COMMERCE) · later (MARKETING, BRAND) ·
   none (UTILITY, EDITORIAL, PORTFOLIO)

Default behavior: **infer → state the classification with the one-line
reason and the nearest alternative considered → proceed.** The human
corrects if wrong. Ask a question ONLY when the three answers conflict and
the hybrid rule below cannot resolve them.

**Hybrid rule:** PAGE register may differ from SITE SHELL register. The
page's register comes from its content; the shell's from the site. A
calculator inside a marketing site is a UTILITY page in a MARKETING shell —
the page obeys utility rules, the shell obeys marketing rules. [PROVEN in
production: calculator pages inside a marketing site work exactly this way.]

---

## State completeness by register

Which registers owe the interactive-state coverage defined in qa.md B3.
This is component-conditional too: a register marked "not required" still
owes coverage for any genuinely interactive component it contains.

| Register | State completeness |
|---|---|
| UTILITY-interactive | **Required** — states are the body of the work, not an edge case |
| COMMERCE | **Required** — error and empty states cost money directly |
| Product application UI (inside any register) | **Required** |
| UTILITY-reading | Required for search/nav/TOC components only |
| PRODUCT MARKETING | Not required for static sections; required for forms, pricing toggles, demos |
| EDITORIAL | Not required for reading surfaces; required for search/filters |
| PORTFOLIO | Not required for static sections; required for contact forms and filters |
| PREMIUM BRAND | Not required for atmospheric sections; required on any purchase or enquiry path |

## Reversal matrix

Rules that change sign across registers. A rule from this table may never
be written unconditionally anywhere in the system.

| Axis | Reversal |
|---|---|
| Density | COMMERCE/UTILITY: abundance = competence · BRAND: scarcity = value |
| Whitespace | BRAND: value signal · UTILITY: information cost · EDITORIAL: pacing |
| Distinctiveness | BRAND/PORTFOLIO: adds value · UTILITY/COMMERCE: subtracts task clarity and trust |
| Convention | UTILITY/COMMERCE: usability · BRAND: commodity smell |
| Animation | BRAND: produces emotion · UTILITY: state feedback only — same tool, opposite job |
| Anchor width | MARKETING/BRAND: full container · UTILITY: the tool at reading measure |
| Typography expressiveness | BRAND/EDITORIAL-template: budgeted expression · UTILITY/COMMERCE: hierarchy only · PORTFOLIO: recedes when work is visual |
| Navigation novelty | BRAND/PORTFOLIO: tolerable where exploration is the job · UTILITY/COMMERCE/reading: forbidden |
| Decoration | BRAND/PORTFOLIO: only when derived from subject · elsewhere: defect (see anti-patterns: decoration inflation) |

IF a design decision touches one of these axes and no register is declared
→ that is a blocking defect, not a style choice.
