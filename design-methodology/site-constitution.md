# Site Constitution

The mechanism that prevents both failure poles at once: 40 pages that look
like 40 websites, and 40 pages that look like one template. Exactly three
layers; every design decision belongs to one of them, and an undeclared
violation of a higher layer is a defect regardless of how the page looks
(core P13).

---

## Layer 1 — GLOBAL / SITE CONSTITUTION
Decisions every page inherits without renegotiation.

| Element | Constitutional content |
|---|---|
| Typography | Families, roles, scale; label register (the meta/eyebrow treatment) |
| Color | Token ramps; which color is functional vs identity; accessibility floor |
| Spacing | The spacing scale (not per-page values) |
| Container widths | The set of legal measures (prose / document / working / landing) |
| Navigation | Structure and behavior — **never restyled as part of a page change** |
| Footer | Same protection as navigation |
| Controls / buttons | Variants, states, interaction behavior |
| Border / radius | The one border-and-radius language |
| Imagery | Honesty rules (real material only); sourcing constraints |
| Motion | Easing/duration vocabulary; reduced-motion floor |
| Copy register | Voice, casing, naming consistency rules |

## Layer 2 — PAGE-FAMILY RULES
Decisions shared by a family (detail pages, index pages, product pages…).

| Element | Family content |
|---|---|
| Composition | The family's skeleton: section sequence template |
| Anchors | The family's anchor TYPE norm (each page picks its instance) |
| Density | The family's density band (register-derived) |
| Grammar subset | The family's house moves from composition-grammar.md |
| Background transitions | The family's seam pattern |
| Page transitions | How pages of this family connect (prev/next, related) |

## Layer 3 — PAGE-SPECIFIC FREEDOM
What each page decides alone, inside the bands above.

- Anchor **instance** (which real object, per its own content inventory)
- Section order within the family skeleton
- One budgeted one-off grammar move
- Density position within the family band
- Ground alternation pattern across its own seams
- Its single interruption plate — or none

IF a decision cannot be located in one of the three layers → it is
undeclared; declare it (usually Layer 3) or remove it.

---

## EXCEPTION PROTOCOL

A page may violate a higher-layer rule ONLY when the reason is an
**identifiable content requirement** — a property of the content, not a
preference.

- Acceptable: "The 281-item index cannot remain scannable under the
  standard card grid." [This is a real, shipped exception in the reference
  project.]
- Not acceptable: "A serif looks nicer here."

Test: IF the justification names a measurable content property that breaks
under the rule → proceed to record. IF it names taste → denied; route the
desire through visual-direction.md instead (maybe the *rule* is wrong — that
is an amendment discussion, not a page exception).

Every exception is recorded in project memory with:

```
EXCEPTION — <date>
PAGE            route
RULE BROKEN     layer + rule, verbatim
CONTENT REASON  the measurable property
RENDER EVIDENCE screenshot(s) of the exception working
HUMAN APPROVAL  who approved, when
```

Silent exceptions are defects even when the result is good: they rot the
constitution's authority and hide future promotions.

## PROMOTION

[PLAUSIBLE — thresholds are working values, not measured optima.]

- An exception reused successfully on **2–3 different pages** OR adopted
  once by **explicit owner decision** is promoted: to a page-family rule if
  family-scoped, to the global constitution if universal.
- Promotion carries its provenance chain (the original exception records).
- The demoted old rule is archived with a reason, not deleted (core P14).
- Reference precedent: a labeling treatment invented on one detail page,
  reused across the family, then promoted into the sitewide label register —
  the promotion path this protocol formalizes.
