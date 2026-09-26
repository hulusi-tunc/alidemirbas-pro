"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EMAIL, type copy, type Lang } from "@/lib/content";

/* This site has no backend and no email-sending service configured, so
   "Submit" can't actually deliver the message server-side. It builds a
   mailto: link from the three visible fields and opens the visitor's own
   email client with the draft pre-filled.

   CONTACT PILOT restyle (round 1, DESIGN-MIGRATION-PLAN.md): fields,
   `required` validation, and the mailto-fallback submission logic below
   are unchanged from before the pilot — only the field markup (added
   visible `<label>`s, closing the placeholder-only gap the plan's audit
   flagged) and classNames changed. Labels follow the same
   `<label htmlFor>` + `useId()` pattern CalculatorTool.tsx's own inputs
   already use elsewhere in this codebase, not a new convention.

   ROUND 2 (PORTRAIT-DESIGN-SOURCE-AUDIT.md is this round's source of
   truth): input/control geometry below is Portrait-derived, confirmed
   from real production DOM, not guessed — see the per-field comments.
   Fields/validation/submission logic are STILL unchanged from round 1.

   ROUND 3 — visual revision, presentation-only (see this round's own
   fidelity-audit report). Two confirmed corrections from Portrait's real
   production DOM, both applied below: (1) its real form-control focus
   treatment is a NEUTRAL border darkening, not a brand-color switch —
   `border-gray-50` at rest -> `border-gray-100` on focus/hover, no color
   hue change at all; (2) its real primary-button fill is a dark NEUTRAL
   (`bg-gray-700` -> hover `bg-gray-1000`), never brand blue. Both were
   guessed differently in round 2 (blue focus border, brand-blue CTA) —
   corrected here now that the real values are confirmed, not re-guessed. */
export function ContactForm({ t }: { t: (typeof copy)[Lang]["contact"] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const nameId = useId();
  const emailId = useId();
  const messageId = useId();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bodyLines = [
      message,
      "",
      `${t.formName}: ${name}`,
      `${t.formEmail}: ${email}`,
    ];
    const href = `mailto:${EMAIL}?subject=${encodeURIComponent(t.formTitle)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    window.location.href = href;
  };

  /* Shared field styling. ROUND 3 correction: round 2 used the alpha-black
     `border-line-soft` (this project's card/ring token) on inputs too, and
     a brand-blue `focus:border-primary-600`. Portrait's real form-control
     border is a SEPARATE, plain neutral-gray family from its card rings —
     `border-gray-50` at rest, `border-gray-100` (one step darker, still
     neutral) on focus/hover — never a brand-color switch. This project's
     own `neutral-*` ramp (already existed, not a new token) plays that
     role here: `neutral-200` at rest reads about as light as Portrait's
     `gray-50`, `neutral-500` on focus is a clearly visible but still
     neutral darkening — closer to Portrait's real pattern than either the
     too-faint alpha border or a brand-blue switch. `ease-[var(--ease-out-
     smooth)]`: Portrait's real, confirmed easing token, unchanged from
     round 2. */
  const fieldBase =
    "border border-neutral-200 bg-paper px-5 py-3 text-sm text-ink-900 outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] placeholder:text-neutral-500 focus:border-neutral-500";

  /* Pill radius for every SHORT, single-line control — a real, confirmed
     Portrait pattern (its own text-input example resolves to `rounded-full`
     in production, PORTRAIT-DESIGN-SOURCE-AUDIT.md §7). */
  /* ONE CONTROLS CORNER (2026-09-07): the pill was Portrait's; the site's
     own scale puts every control - button, input, select - on `--radius-md`
     (globals.css § Radii), and a form whose fields are pills beside a
     squared submit was the one place the two shapes met. */
  const fieldClass = `${fieldBase} rounded-md`;

  /* PROJECT ADAPTATION, not a blind copy: Portrait's own confirmed pill-
     input sample was a single-line hero widget. Forcing a 999px radius
     onto a tall, multi-line textarea rounds all four corners to a visually
     excessive degree relative to its height — not a clean "pill" the way
     it reads on a 48px-tall field, just an odd shape. `rounded-card`
     (16px) is used instead — Portrait's OWN confirmed surface/card radius
     (its `rounded-2xl` feature cards, independently matching this
     project's already-shipped `--radius-card`), which is the more honest
     fit for a taller control than forcing the short-control geometry onto
     it. Flagged here as a deliberate adaptation, not silently deviated. */
  const textareaClass = `${fieldBase} rounded-md min-h-[18rem] resize-y sm:min-h-[20rem]`;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label htmlFor={nameId} className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink-900">{t.formName}</span>
          <input
            id={nameId}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label htmlFor={emailId} className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink-900">{t.formEmail}</span>
          <input
            id={emailId}
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </label>
      </div>
      {/* Full-width long field, per the Coda reference's own "büyük
          textarea" instruction — rows raised from 5 to 7 and given a
          floor height so it reads as the page's largest single field,
          not just another input that happens to wrap. Radius: see
          `textareaClass`'s own comment above (project adaptation). */}
      <label htmlFor={messageId} className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink-900">{t.formMessage}</span>
        <textarea
          id={messageId}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={11}
          className={textareaClass}
        />
      </label>

      {/* Compact primary CTA on desktop, per the Coda reference — the
          shared `Button` primitive at its smallest size (40px). ROUND 3:
          `w-full sm:w-auto` makes it a full-width, more clearly tappable
          target on mobile specifically ("form CTA mobilde biraz daha
          güçlü/tappable olmalı") while staying compact/inline from `sm:`
          up, where the Coda reference's "compact" instruction actually
          applies.

          The submit is the site's one button family on its `primary`
          variant (2026-09-14, Hulusi: a page's main action is the brand
          blue; black is the header's). Earlier rounds argued a dark
          neutral from a Portrait audit and carried `rounded-full!`/`px-6!`
          overrides; the family is a pill now, so nothing is overridden. */}
      <div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full sm:w-auto"
        >
          {t.formSubmit}
        </Button>
      </div>
    </form>
  );
}
