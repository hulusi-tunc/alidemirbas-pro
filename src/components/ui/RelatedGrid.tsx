import Link from "next/link";

export type RelatedItem = { href: string; name: string; desc?: string };

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
        <h2 className="mb-3 text-sm font-medium tracking-wide text-neutral-500 uppercase">{title}</h2>
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
