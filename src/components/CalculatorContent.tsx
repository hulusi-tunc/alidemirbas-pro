import Link from "next/link";
import type { ReactNode } from "react";
import type { CalcContent, ContentSection } from "@/lib/calc-content";

/* Renders Phase 4 editorial content below the calculator (the tool stays
   primary - see calculator-content-architecture.md's hierarchy note).
   Plain server component. Section layout is driven entirely by `type` -
   no calculator-specific markup, so every calculator page shares this one
   renderer while its actual content still differs per calculator.

   FAQ used to render inline here (native <details>/<summary>) - it now
   lives in the shared FaqAccordion component instead, rendered by
   CalculatorRoutes after the category grid (see the Calculator Product
   Page section order). This component only owns `content.sections`. */
export default function CalculatorContent({ content }: { content: CalcContent }) {
  if (content.sections.length === 0) return null;
  return (
    <div className="altor-container max-w-2xl pb-16">
      <div className="flex flex-col gap-8 border-t border-line pt-10">
        {content.sections.map((s) => (
          <Section key={s.id} section={s} />
        ))}
      </div>
    </div>
  );
}

/** Inline-link-aware text. `[label](href)` is the only markup body text
    accepts - internal paths (starting with "/") render as a real Next
    Link, external URLs as a new-tab anchor with a real descriptive anchor
    text (never "click here", since the source text supplies the label). */
function Prose({ text, className }: { text: string; className?: string }) {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const [, label, href] = m;
    if (href.startsWith("/")) {
      parts.push(
        <Link key={i++} href={href} className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
          {label}
        </Link>,
      );
    } else {
      parts.push(
        <a
          key={i++}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
        >
          {label}
        </a>,
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <p className={className}>{parts}</p>;
}

function Section({ section }: { section: ContentSection }) {
  if (section.type === "common-mistakes") {
    return (
      <div>
        <h2 className="text-lg font-semibold text-ink-950">{section.heading}</h2>
        <ul className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-neutral-600">
          {(section.items ?? []).map((item, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="text-neutral-400">
                –
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (section.type === "comparison-note") {
    return (
      <div className="rounded-lg border border-line bg-paper-soft p-4">
        <h2 className="text-sm font-semibold text-ink-950">{section.heading}</h2>
        <Prose text={section.body ?? ""} className="mt-1.5 text-sm leading-relaxed text-neutral-600" />
      </div>
    );
  }

  if (section.type === "models") {
    return (
      <div>
        <h2 className="text-lg font-semibold text-ink-950">{section.heading}</h2>
        {section.intro && <p className="mt-1 text-sm text-neutral-500">{section.intro}</p>}
        <div className="mt-3 flex flex-col gap-4">
          {(section.models ?? []).map((m) => (
            <div key={m.modeId} className="border-l-2 border-line pl-4">
              <h3 className="text-sm font-semibold text-ink-900">{m.heading}</h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">{m.body}</p>
              {m.example && <p className="mt-1.5 text-sm text-neutral-500 italic">{m.example}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === "worked-example") {
    return (
      <div>
        <h2 className="text-lg font-semibold text-ink-950">{section.heading}</h2>
        <div className="mt-3 rounded-lg border border-line bg-paper-soft p-4 font-mono text-sm">
          {(section.inputs ?? []).map((row) => (
            <div key={row.label} className="flex justify-between gap-4 py-0.5 text-ink-700">
              <span>{row.label}</span>
              <span className="tabular-nums text-ink-900">{row.value}</span>
            </div>
          ))}
          {section.output && (
            <div className="mt-1.5 flex justify-between gap-4 border-t border-line pt-1.5 font-medium text-ink-950">
              <span>{section.output.label}</span>
              <span className="tabular-nums">{section.output.value}</span>
            </div>
          )}
        </div>
        {section.body && <Prose text={section.body} className="mt-3 text-sm leading-relaxed text-neutral-600" />}
      </div>
    );
  }

  if (section.type === "trust-checks") {
    return (
      <div>
        <h2 className="text-lg font-semibold text-ink-950">{section.heading}</h2>
        {section.intro && <p className="mt-1 text-sm text-neutral-500">{section.intro}</p>}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(section.checks ?? []).map((c) => (
            <div key={c.title} className="rounded-lg border border-line p-3.5">
              <p className="text-sm font-semibold text-ink-950">{c.title}</p>
              <Prose text={c.body} className="mt-1 text-xs leading-relaxed text-neutral-600" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink-950">{section.heading}</h2>
      <Prose text={section.body ?? ""} className="mt-2 text-sm leading-relaxed text-neutral-600" />
    </div>
  );
}
