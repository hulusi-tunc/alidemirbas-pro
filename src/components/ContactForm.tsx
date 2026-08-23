"use client";

import { useState } from "react";
import { EMAIL, type copy, type Lang } from "@/lib/content";

/* This site has no backend and no email-sending service configured, so
   "Submit" can't actually deliver the message server-side. Rather than
   fake a working form, it builds a mailto: link from the fields and opens
   the visitor's own email client with everything pre-filled - a real,
   honest fallback that needs no credentials on either side. t.contact.
   formNote says exactly this on the page, no surprise on click. */
export function ContactForm({ t }: { t: (typeof copy)[Lang]["contact"] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

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

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.formName}
          className="border border-line bg-paper px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-neutral-500 focus:border-blue-600"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.formEmail}
          className="border border-line bg-paper px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-neutral-500 focus:border-blue-600"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder={t.formCompany}
          className="border border-line bg-paper px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-neutral-500 focus:border-blue-600"
        />
        <input
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={t.formSubject}
          className="border border-line bg-paper px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-neutral-500 focus:border-blue-600"
        />
      </div>
      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t.formMessage}
        rows={5}
        className="resize-y border border-line bg-paper px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-neutral-500 focus:border-blue-600"
      />
      <button
        type="submit"
        className="h-12 bg-ink-950 text-sm font-medium text-white transition-colors hover:bg-ink-900"
      >
        {t.formSubmit}
      </button>
      <p className="text-xs text-neutral-500">{t.formNote}</p>
    </form>
  );
}
