import Link from "next/link";

export type RelatedItem = {
  href: string;
  name: string;
  desc?: string;
  /** Optional extras a bespoke page's own related-items rendering may use
      instead of this grid (e.g. NumerspacePage's per-project artifact
      cards) - RelatedGrid itself ignores them, so adding them here never
      changes how any existing "related" list renders. */
  slug?: string;
  proof?: string;
};

/** Reusable "related items" row (Product Page building block #3) - same
    card language as CalculatorIndexPage's own category links
    (rounded-lg border-line, hover:border-ink-900). Used for Related
    Calculators today; the Skill Product Page template reuses it for
    Related tools/projects with the exact same markup. */
export function RelatedGrid({ title, items }: { title?: string; items: RelatedItem[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      {title && (
        <h2 className="mb-3 text-h3 text-ink-950">{title}</h2>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-line p-4 transition-colors hover:border-ink-900"
          >
            <p className="font-medium text-ink-950">{item.name}</p>
            {item.desc && <p className="mt-1 text-sm text-neutral-600">{item.desc}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
