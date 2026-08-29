# Reference Analysis

References exist to be **dissected, not copied**. The unit of transfer is a
mechanism; the unit of contamination is a surface. Every studied workflow
that skipped this distinction either copied skins (superficial mimicry) or
bypassed references entirely and converged anyway.

[PLAUSIBLE] Reference Cards are repeatable — i.e., two different operators
dissecting the same site would produce interchangeable cards. One card has
been produced under this format and the surface/mechanism split held; the
two-operator test has not been run.

---

## SURFACE vs MECHANISM

**SURFACE** — what the reference *looks like*. Palette, typefaces, radius,
texture, gradients, shadows, iconography style, specific spacing values.
Surfaces are register- and brand-bound; imported, they read as costume.

**MECHANISM** — what the reference *does structurally*, independent of its
skin. Examples: anchor choice ("no section is text-only"), bleed, density
transitions, asymmetry, section interruption, narrow→wide measure shifts,
statement→witness pairing, repetition→break, persistent context rails.
Mechanisms transfer across skins when the register conditions match.

**RULE: Never import a surface decision because it is visually attractive.**
Attraction is precisely the signal that you are responding to the skin.
IF a surface element seems essential → identify the mechanism underneath it
and import that instead; the surface gets re-derived from your own project
material (core P4).

**RULE: A mechanism entry must state why it works in its original register
and under which conditions it transfers.** A mechanism without transfer
conditions is a surface wearing a mechanism's name.

---

## The Reference Card

One card per reference. Cards live in project memory (project-memory.md)
and are consulted at direction-manifesto time (visual-direction.md).

```
REFERENCE CARD — <site / page / period>
IDENTITY            what it is, when captured, which pages examined
REGISTER            its register + sub-mode, in this taxonomy's terms
WHY SELECTED        who chose it and for what quality (one line, named)
MECHANISMS          named structural moves, each with WHERE it appears
                    and WHY it works in this register
SURFACE             the skin, listed explicitly so it is visible…
SURFACE QUARANTINE  …and explicitly marked DO-NOT-IMPORT
TRANSFER CONDITIONS which registers/page-families each mechanism moves to,
                    and which it must not
TRANSFER RISK /     mandatory field, but a valid value may be: a named toxic
DO-NOT-TAKE         surface or mechanism · a condition under which the
                    reference stops transferring · or "none identified after
                    review". The operator must show transfer risk was
                    considered; inventing a flaw to satisfy the form is worse
                    than recording that none was found
MEASURED EVIDENCE   numbers, not impressions: measures in px/ch, column
                    counts, section heights, screenshots attached
PROVENANCE          who dissected it, when, from what material
REVIEW / EXPIRY     date to re-examine; references stale like rules do
```

Field rules:
- MECHANISMS with no WHERE → delete the entry; unlocated mechanisms are
  guesses.
- TRANSFER RISK / DO-NOT-TAKE is a mandatory field with an honest empty
  value. Most admired references carry a signature that would poison the
  importing project, and naming it is the card's immune system — but a
  forced criticism is noise, and "none identified after review" is a real
  finding when it is true.
- MEASURED EVIDENCE beats adjectives. "Generous spacing" is not evidence;
  "text measure 68ch, section padding 96px, 11 sections over 8987px" is.
- A card whose TRANSFER CONDITIONS cannot be written is blocked on register
  vocabulary — classify the reference's register first.

## Lifecycle

- Cards are created during the REFERENCE ANALYSIS stage (workflow.md) or
  opportunistically when the human shares an admired site.
- Cards are consulted, never pasted: direction manifestos may cite card
  mechanisms; they may not cite card surfaces.
- Cards expire. On expiry: re-verify against the live reference; renew,
  amend, or archive with a reason (core P14).
- IF multiple cards in the store share the same mechanism list → the store
  itself is converging; diversify sources before the next project
  (project-memory.md convergence audit applies to the card store too).

---

# Taste Memory

A second, weaker layer beside Reference Cards. **Taste memory is not design
law** (core P16: it sits second-from-bottom in the precedence ladder, above
only model defaults). It records what this human repeatedly responds to, so
that preference becomes visible and reviewable instead of invisible and
assumed.

Reference Card vs Taste Memory:
- A **Reference Card** is a deliberate dissection of a chosen reference,
  produced during a project stage, consulted when writing manifestos.
- A **Taste Memory item** is an opportunistic capture — something the human
  saved, liked, or disliked, in or out of project context. Cheap to record,
  weak in authority, valuable in aggregate.

## Inspiration item format

```
TASTE ITEM — <short name>
DATE
SOURCE                url / file / screenshot / "seen in <context>"
TYPE                  site · page · component · motion · type · layout · other
TAGS                  free tags for clustering
HUMAN WORDS (VERBATIM)  the human's own explanation, unedited
ANALYSIS              Claude's reading — kept separate from the words above
TRANSFERABLE MECHANISM  the structural move, if any (may be "none")
SURFACE FEATURES      the skin, listed so it stays visible as skin
REGISTER              the source's register, in registers.md terms
POSITIVE / NEGATIVE   liked or disliked — negatives are equally valuable
STATUS                active · superseded · retired
SCORE (optional)      strength of the reaction, if the human gave one
```

**The human's verbatim words are the highest-value field.** Never overwrite
them with Claude's interpretation, never "clean them up", never summarise
them away. ANALYSIS is a separate field precisely so the two are never
conflated: the human's "this feels like it respects my time" and Claude's
"low density, high measure discipline" are different kinds of evidence, and
only the first is primary.

A NEGATIVE item is recorded with the same care as a positive one. What
someone reliably dislikes constrains the space faster than what they like.

## Synthesis

Individual items → recurring preference clusters → a provisional taste
profile.

- **Cluster** when ≥3 items share a mechanism or a tag with the same
  polarity. Name the cluster in mechanism terms, not surface terms.
- **Provisional taste profile** = the current set of clusters, dated, each
  with the item ids behind it. It is provisional by construction and is
  regenerated, never hand-edited.
- The profile may be consulted at manifesto time as a tie-breaker only
  (core P16). A manifesto may not cite taste as its reason for an anchor,
  a hierarchy, or a density decision — those come from content and register.

## Taste decay

Preferences age. Every item and cluster carries a review date; on review it
is renewed, superseded, or retired with a reason (core P14).

[PLAUSIBLE] Working defaults, explicitly not scientific truth: review items
at ~90 days; weight recent items above older ones when clustering; retire an
item that has not been reinforced across two consecutive reviews. These
numbers are placeholders awaiting evidence — do not present them as
findings, and do not import another system's half-life as if it were one.

## Taste and convergence

Taste memory feeds the convergence audit (project-memory.md). A preference
that keeps winning is exactly how an unconscious house style forms — the
audit's response is one forced-alternative direction, never a ban.
