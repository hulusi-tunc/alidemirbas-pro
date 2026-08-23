import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { HoverLift } from "./HoverLift";

export type CategoryCard = {
  slug: string;
  label: string;
  count: number;
  href: string;
  icon: LucideIcon;
};

/** Reusable icon + label + count category grid (Product Page building
    block #1). Visual reference: a plain icon-over-label card grid - not
    copied line-for-line, adapted to this site's existing rounded-lg /
    border-line card language (the same one CalculatorIndexPage's own
    category links already use).

    Caller supplies real `count`/`label`/`href` per category - this
    component holds no catalog data of its own and invents no category
    names, so it stays correct as the underlying catalog changes. */
export function CategoryCardGrid({ title, items }: { title?: string; items: CategoryCard[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      {title && (
        <h2 className="mb-4 text-sm font-medium tracking-wide text-neutral-500 uppercase">{title}</h2>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <HoverLift key={item.slug} distance={3}>
              <Link
                href={item.href}
                className="flex h-full flex-col gap-3 rounded-lg border border-line bg-paper p-4 transition-colors hover:border-ink-900"
              >
                <Icon aria-hidden className="size-5 text-ink-700" strokeWidth={1.75} />
                <span>
                  <span className="block font-medium text-ink-950">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-neutral-500 tabular-nums">
                    {item.count}
                  </span>
                </span>
              </Link>
            </HoverLift>
          );
        })}
      </div>
    </div>
  );
}
