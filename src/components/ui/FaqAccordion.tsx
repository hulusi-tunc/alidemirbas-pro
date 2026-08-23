import { ChevronDown } from "lucide-react";
import { clsx } from "@/lib/clsx";

export type FaqItem = { id: string; q: string; a: string };

/** Reusable FAQ accordion - native <details>/<summary> so it's fully
    accessible and interactive with zero client JS (same accessibility
    trade-off CalculatorContent's original inline FAQ block already made;
    this generalizes that pattern into one shared component instead of
    hand-rolling it per page). Chevron rotation is pure CSS
    (`group-open:rotate-180`), no client component needed.

    Used by both the Calculator Product Page and the Skill Product Page
    templates - same visual language, same markup, wherever a FAQ shows up. */
export function FaqAccordion({ title, items }: { title?: string; items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      {title && <h2 className="text-lg font-semibold text-ink-950">{title}</h2>}
      <div className={clsx("flex flex-col divide-y divide-line border-t border-line", title && "mt-3")}>
        {items.map((item) => (
          <details key={item.id} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-ink-900 marker:content-none">
              {item.q}
              <ChevronDown
                aria-hidden
                className="size-4 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-neutral-600">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
