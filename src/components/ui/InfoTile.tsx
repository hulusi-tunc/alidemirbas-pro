import type { ReactNode } from "react";

/* The Info page's tile - the homepage bento's card (rounded-[28px] paper,
   hairline ring) with a tinted icon tile and a plain-case title, so the
   journey notes read as cards with icons instead of ruled columns under
   mono uppercase labels (Hulusi, 2026-09-14: "text-heavy; icons and more
   cards, like the Lab homepage"). */
export function InfoTile({
  icon,
  tint = "bg-primary-50 text-primary-700",
  title,
  children,
  className = "",
}: {
  icon: ReactNode;
  tint?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-col rounded-[28px] bg-paper p-6 ring-1 ring-ink-950/[0.06] ${className}`}>
      <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-xl ${tint} [&>svg]:size-5`}>
        {icon}
      </span>
      <h2 className="mt-4 text-base font-semibold text-ink-950">{title}</h2>
      <div className="mt-3 min-w-0">{children}</div>
    </section>
  );
}
