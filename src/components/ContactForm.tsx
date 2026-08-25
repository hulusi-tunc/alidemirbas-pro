"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EMAIL, type copy, type Lang } from "@/lib/content";

/* This site has no backend and no email-sending service configured, so
   "Submit" can't actually deliver the message server-side. Rather than
   fake a working form, it builds a mailto: link from the fields and opens
   the visitor's own email client with everything pre-filled - a real,
   honest fallback that needs no credentials on either side. t.contact.
   formNote says exactly this on the page, no surprise on click.

   CONTACT PILOT restyle (DESIGN-MIGRATION-PLAN.md): fields, `required`
   validation, and the mailto-fallback submission logic below are
   unchanged from before this pilot — only the field markup (added visible
   `<label>`s, closing the placeholder-only gap the plan's audit flagged)
   and classNames changed. Labels follow the same `<label htmlFor>` +
   `useId()` pattern CalculatorTool.tsx's own inputs already use elsewhere
   in this codebase, not a new convention. */
export function ContactForm({ t }: { t: (typeof copy)[Lang]["contact"] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const nameId = useId();
  const emailId = useId();
  const companyId = useId();
  const subjectId = useId();
  const messageId = useId();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bodyLines = [
      message,
      "",
      `${t.formName}: ${name}`,
      `${t.formEmail}: ${email}`,
      company ? `${t.formCompany}: ${company}` : null,
    ].filter((line): line is string => line !== null);
    const href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject || t.formTitle)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    window.location.href = href;
  };

  const fieldClass =
    "rounded-sm border border-line bg-paper px-4 py-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-neutral-500 focus:border-primary-600";

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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label htmlFor={companyId} className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink-900">{t.formCompany}</span>
          <input
            id={companyId}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label htmlFor={subjectId} className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink-900">{t.formSubject}</span>
          <input
            id={subjectId}
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={fieldClass}
          />
        </label>
      </div>
      {/* Full-width long field, per the Coda reference's own "büyük
          textarea" instruction — rows raised from 5 to 7 and given a
          floor height so it reads as the page's largest single field,
          not just another input that happens to wrap. */}
      <label htmlFor={messageId} className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink-900">{t.formMessage}</span>
        <textarea
          id={messageId}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={7}
          className={`${fieldClass} min-h-40 resize-y`}
        />
      </label>

      {/* Compact primary CTA, per the Coda reference — the shared `Button`
          primitive at its smallest size (40px), not full-width. This also
          answers R3 in DESIGN-MIGRATION-PLAN.md in practice: Button's
          square (`rounded-none`) identity is left untouched here and sits
          fine inside a Coda-style form — this pilot did not need to round
          it to work, so R3 stays an open brand decision, not a blocker. */}
      <div>
        <Button type="submit" variant="primary" size="sm">
          {t.formSubmit}
        </Button>
      </div>
      <p className="text-xs text-neutral-500">{t.formNote}</p>
    </form>
  );
}
