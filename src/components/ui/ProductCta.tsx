import { ArrowRight, ArrowUpRight } from "lucide-react";

import { ButtonLink, buttonStyles } from "@/components/ui/Button";
import { CtaBand } from "@/components/ui/CtaBand";
import { PixelFill } from "@/components/ui/PixelFill";

/* THE PRODUCT PAGES' CLOSING BAND: the site-wide CtaBand (ui/CtaBand.tsx -
   brand blue, Ali cut out of his photograph, the pixel sweep) with the
   page's own eyebrow, words and actions, so a product page ends the same
   way as every other page. */

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
    <CtaBand
      eyebrow={eyebrow}
      title={title}
      body={body}
      actions={
        <>
          <Action action={primary} variant="primary" />
          {secondary && <Action action={secondary} variant="outlineInverted" />}
        </>
      }
    />
  );
}
