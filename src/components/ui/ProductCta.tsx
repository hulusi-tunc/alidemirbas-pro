import { ArrowRight, ArrowUpRight } from "lucide-react";

import { ButtonLink, buttonStyles } from "@/components/ui/Button";
import { CtaBurst } from "@/components/ui/CtaBurst";
import { PixelFill } from "@/components/ui/PixelFill";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";

/* THE PRODUCT PAGES' CLOSING PLATE. The same brand-blue plate the site
   closes every page with (FinalCta in Site.tsx: bg-primary-600, rounded,
   inside the container, the pixel wavefront on arrival) with the page's
   own words and actions. It replaces the ink-950 slab the product pages
   still ended on - the dark stage the site retired on 2026-08-30 - so a
   product page and the Lab index now end the same way. `data-tone="dark"`
   flips the primary button to its white plate and the secondary to the
   dark-ground ring. */

export type CtaAction = { label: string; href: string };

function Action({ action, variant }: { action: CtaAction; variant: "primary" | "outlineInverted" }) {
  const external = action.href.startsWith("http");
  const label = (
    <>
      {action.label}
      {external ? <ArrowUpRight aria-hidden className="size-4" /> : <ArrowRight aria-hidden className="size-4" />}
    </>
  );
  if (external) {
    return (
      <a href={action.href} target="_blank" rel="noreferrer" className={buttonStyles({ variant, size: "md" })}>
        <PixelFill />
        {label}
      </a>
    );
  }
  return (
    <ButtonLink href={action.href} variant={variant} size="md">
      {label}
    </ButtonLink>
  );
}

export function ProductCta({
  eyebrow,
  title,
  body,
  primary,
  secondary,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  primary: CtaAction;
  secondary?: CtaAction;
}) {
  return (
    <section className="bg-paper py-20 md:py-28">
      <PortraitContainer>
        <Reveal>
          <div data-tone="dark" className="relative isolate overflow-hidden rounded-[28px] bg-primary-600 px-6 py-16 text-center sm:px-12 md:py-24">
            <CtaBurst />
            {eyebrow && <p className="text-[13px] font-medium text-white/70">{eyebrow}</p>}
            <h2 className="mx-auto mt-4 max-w-2xl text-h2 text-balance text-white">
              {title}
            </h2>
            {body && <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-pretty text-white/75">{body}</p>}
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Action action={primary} variant="primary" />
              {secondary && <Action action={secondary} variant="outlineInverted" />}
            </div>
          </div>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}
