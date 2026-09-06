import { Plus } from "lucide-react";
import { clsx } from "@/lib/clsx";

export type FaqItem = { id: string; q: string; a: string };

/** Reusable FAQ accordion - native <details>/<summary> so it's fully
    accessible and interactive with zero client JS (same accessibility
    trade-off CalculatorContent's original inline FAQ block already made;
    this generalizes that pattern into one shared component instead of
    hand-rolling it per page). The open/closed affordance is pure CSS
    (`group-open:rotate-45` on a plus, which becomes a minus), no client
    component needed.

    EACH ITEM IS A CARD, NOT A RULED ROW. The divider-line version of this
    read as a table of contents: hairlines, a small grey chevron, and rows
    that gave no sign they could be opened. Soft filled cards on the site's
    own surface language make the target obvious, let an open item change
    colour rather than just get taller, and drop four hairlines per screen
    on the way (the site is no longer stroke-heavy). Every row is a real
    click target at 44px+ rather than a line of text with a chevron beside it.

    Used by both the Calculator Product Page and the Skill Product Page
    templates - same visual language, same markup, wherever a FAQ shows up. */
export function FaqAccordion({ title, items }: { title?: string; items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      {title && <h2 className="text-lg font-semibold text-ink-950">{title}</h2>}
      <div className={clsx("flex flex-col gap-2.5", title && "mt-4")}>
        {items.map((item) => (
          <details
            key={item.id}
            /* The open card takes the brand tint, so which question is
               answered is legible from the scroll position rather than
               only from the text height. */
            className="group rounded-xl bg-paper-soft transition-colors open:bg-blue-50 hover:bg-blue-50"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15px] font-medium text-ink-900 marker:content-none">
              {item.q}
              <span
                aria-hidden
                className="grid size-7 shrink-0 place-items-center rounded-full bg-paper text-ink-500 transition-[transform,color] duration-200 group-open:rotate-45 group-open:text-primary-600"
              >
                <Plus className="size-4" />
              </span>
            </summary>
            <p className="max-w-2xl px-5 pb-5 text-[14.5px] leading-relaxed text-ink-600">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
