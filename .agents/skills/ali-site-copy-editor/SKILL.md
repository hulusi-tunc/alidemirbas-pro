---
name: ali-site-copy-editor
description: Rewrite, edit, localize, or audit user-facing copy in this site. Use for Turkish or English website copy, journey-library copy, About, Lab/project pages, headings, descriptions, CTA/microcopy, growth/CRM/lifecycle terminology, and TR/EN localization. Do not use existing site copy as a style model; use it only to recover intended meaning.
---

# Ali Site Copy Editor

## Purpose
Produce clear, human, practitioner-level website copy in Turkish and English without corporate filler or obvious AI-writing patterns.

## Authority order
1. Facts and intended meaning already present in the source or explicitly supplied by the user.
2. User decisions in the current task.
3. This skill's writing rules.
4. Approved terminology/reference corpus in `references/reference-corpus.md`.

Never invent facts, metrics, outcomes, customer claims, experience, or product capabilities to improve the prose.

## Core rule
Existing site copy is **source material for meaning only**. Never learn tone, phrasing, rhythm, vocabulary, or style from it.

## Workflow
### 1. Recover meaning
Before rewriting, identify:
- what this block is trying to say;
- who needs to understand it;
- what action, if any, follows;
- which technical/growth terms carry real meaning and must survive.

If the source does not support a claim, do not add it.

### 2. Choose the copy job
Treat the block as one of:
- positioning / hero;
- explanatory body copy;
- project or case-study copy;
- CTA / microcopy;
- growth / CRM / lifecycle copy;
- journey-library copy;
- SEO/meta copy;
- personal/About copy.

Do not force landing-page persuasion patterns onto documentation, portfolio projects, or journey definitions.

### 3. Draft for clarity
Apply these priorities in order:
1. Clear before clever.
2. Specific before vague.
3. Concrete nouns and verbs before abstract marketing language.
4. One main idea per sentence or UI block.
5. Explain what something does before claiming why it matters.
6. Prefer short copy when the same meaning survives.
7. Benefits are useful only when supported by the source.
8. Keep real practitioner terminology when translating it would sound artificial.

### 4. Edit in focused passes
Run these passes:
- **Clarity:** Can a practitioner understand it on first read?
- **Meaning:** Did the rewrite preserve conditions, scope, causality, uncertainty, and technical distinctions?
- **Specificity:** Remove vague claims that cannot be made concrete from available evidence.
- **Voice:** Remove corporate, academic, translated, and assistant-like phrasing.
- **Utility:** Does each sentence earn its place?
- **Consistency:** Names, channels, journey concepts, CTA labels, and terminology must be consistent across the page.
- **Human pass:** Vary sentence shape naturally. Remove template phrasing, synonym cycling, forced contrasts, generic conclusions, filler transitions, and unnecessary rhetorical flourishes.
Then re-read once after the rewrite. Make a second editing pass only if a real issue remains.

## Turkish rules
Turkish is authored as Turkish, not translated from English.

- Prefer natural contemporary Turkish used by digital product, growth, CRM, performance marketing, and lifecycle practitioners.
- Do not translate established terms merely to make the text look more Turkish. Terms such as growth, lifecycle, CRM, journey, trigger, push, conversion, checkout, onboarding, churn, retention, A/B test and KPI may remain English when that is the natural professional usage.
- Avoid noun-heavy bureaucratic constructions when a verb is clearer.
- Avoid unnecessary `-mektedir/-maktadır` register.
- Avoid inflated corporate phrases such as “yenilikçi çözümler”, “uçtan uca”, “benzersiz deneyim”, “güçlü altyapı”, “dijital dönüşüm yolculuğu”, “değer yaratmak”, “ihtiyaçlara özel çözümler”, “müşteri odaklı yaklaşım” unless the source makes the phrase concrete and necessary.
- Watch repetitive “sağlamak / sunmak / gerçekleştirmek / hedeflemek” constructions. Replace with the actual action where possible.
- Do not use literal English syntax in Turkish.
- Headings should usually name the thing, action, or outcome directly.
- Do not make Turkish sound like an ad unless the page is actually an ad/landing page.

## English rules
English is authored independently, not as a literal translation of Turkish.

- Prefer plain professional English.
- Use active verbs and concrete language.
- Avoid inflated words such as leverage, robust, seamless, cutting-edge, transformative, innovative, unlock, harness when a simpler accurate verb exists.
- Avoid formulaic openings, generic future-facing conclusions, stacked hedges, excessive em dashes, compulsive rule-of-three structures, “It’s not X, it’s Y” templates, “Let’s…” transitions, fake candor, and unnecessary bolding.
- Preserve legitimate technical language.
- Do not remove uncertainty that exists in the source.

## TR/EN localization
TR and EN must communicate the same underlying meaning, but they do not need the same sentence structure, headline construction, idioms, or word count.

When both languages exist:
1. Establish the semantic source of truth.
2. Write the Turkish version naturally.
3. Write the English version naturally.
4. Compare facts, scope, conditions, CTA intent, and terminology.
5. Fix semantic drift without forcing literal symmetry.

## Journey-library rules
Journey copy must read like something a CRM/lifecycle practitioner can implement.

Prefer explicit concepts:
- trigger;
- segment / eligibility;
- channel and purpose;
- wait/timing;
- decision/condition;
- exit;
- handoff;
- KPI.

Rules:
- A channel step names one actual channel. Do not bundle “Email / Push / SMS / WhatsApp” into one node.
- Say what the message is for, not merely “send message”.
- Preserve control logic exactly when editing copy.
- Do not expose internal IDs or taxonomy to public users.
- Do not invent a linked handoff journey that does not exist.
- Separate browse abandonment, cart abandonment, checkout abandonment, and other materially different intent states.
- Use in-app only when the user is actually in an app/session context.
- Stop messaging when the journey's conversion/suppression condition is met.

## CTA and microcopy
- Tell the user what happens next.
- Avoid generic CTA labels when a more specific label fits.
- Do not manufacture urgency.
- Keep labels short enough for UI use.
- Do not add exclamation marks for energy.

## Claims and evidence
Never strengthen a claim beyond the source.
Do not invent:
- statistics;
- testimonials;
- “leading/best/most trusted” claims;
- time savings;
- conversion lifts;
- guarantees;
- customer counts;
- causality.

If stronger copy would require evidence that is unavailable, write the strongest accurate version that does not require invented proof.

## Reference use
The only approved external copy/terminology corpus is listed in `references/reference-corpus.md`.
Use it for terminology, conventions, and quality calibration—not imitation.
Do not introduce additional style-reference sites unless the user explicitly changes the corpus.

## Output behavior
For direct editing requests, lead with the revised copy. Do not bury the result under a long critique.
When useful, briefly explain only material changes.
Do not provide multiple alternatives unless the user asks or the choice is genuinely unresolved.
When editing repository copy, change only the requested scope unless the user explicitly authorizes a broader sweep.

## Final QA
Before delivering, check:
- Would a real practitioner say this?
- Is any sentence generic enough to fit almost any company?
- Did any claim become stronger than the evidence?
- Does Turkish sound translated?
- Does English sound templated or AI-polished?
- Is there an easier way to say the same thing?
- Did we preserve technical distinctions?
- For TR/EN pairs, is meaning aligned without literal translation?
- For journeys, are trigger, eligibility, channel, timing, decision, exit/handoff and KPIs understandable where relevant?

If a line fails, revise it before delivery.
