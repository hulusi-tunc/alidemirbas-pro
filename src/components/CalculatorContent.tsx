import type { CalcContent, ContentSection } from "@/lib/calc-content";

/* Renders Phase 4 editorial content below the calculator (the tool stays
   primary - see calculator-content-architecture.md's hierarchy note).
   Plain server component: no interactivity needed beyond native
   <details>/<summary> for FAQ, which is accessible without JS. Section
   layout is driven entirely by `type` - no calculator-specific markup,
   so all 13 pages share this one renderer while their actual content
   still differs per calculator. */
export default function CalculatorContent({ content }: { content: CalcContent }) {
  return (
    <div className="altor-container max-w-2xl pb-16">
      <div className="flex flex-col gap-8 border-t border-line pt-10">
        {content.sections.map((s) => (
          <Section key={s.id} section={s} />
        ))}

        {content.faq.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-ink-950">FAQ</h2>
            <div className="mt-3 flex flex-col divide-y divide-line border-t border-line">
              {content.faq.map((f) => (
                <details key={f.id} className="group py-3">
                  <summary className="cursor-pointer list-none text-sm font-medium text-ink-900 marker:content-none">
                    {f.q}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
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
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{section.body}</p>
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

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink-950">{section.heading}</h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">{section.body}</p>
    </div>
  );
}
