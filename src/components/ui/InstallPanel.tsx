import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { buttonStyles } from "@/components/ui/Button";
import { CopyPill, InstallTerminal, type InstallMethod } from "@/components/ui/InstallTerminal";
import { labAccent } from "@/components/ui/LabProjectIdentity";
import { PixelFill } from "@/components/ui/PixelFill";
import { ProductHeading } from "@/components/ui/ProductPage";
import { Reveal } from "@/components/ui/Reveal";
import { clsx } from "@/lib/clsx";

/* THE INSTALL PANEL (2026-09-20, Hulusi: "this section - we use it on many
   different pages - let's update it, make it cool"). One shape for every
   plugin page: the heading, then one tile holding the numbered rail - the
   number in the product's own tile hue, the ways in as a segmented
   control over the terminal block (ui/InstallTerminal), the test command
   as a small copyable row, the repository and demo as pill buttons. A
   first draft stood the terminal on the product's photo plate beside the
   steps; Hulusi: "people are going to think this is an image, not
   clickable - everything on a plate looks the same as the other parts".
   The plate is this site's word for a picture, so the terminal left it
   and sits in the steps as the control it is. The tile ground the steps
   first had went the same day ("remove the grey box"); `tone` is the
   section's ground, so the test-command row takes the other paper. */

export function InstallPanel({
  slug,
  tone = "paper",
  title,
  body,
  methodsTitle,
  methods,
  then,
  use,
  linksTitle,
  linksNote,
  links,
  copyLabel,
  copiedLabel,
}: {
  slug: string;
  /** The ProductSection tone the panel sits in. */
  tone?: "paper" | "soft";
  title: string;
  body?: string;
  methodsTitle: string;
  methods: readonly InstallMethod[];
  /** An optional second step - the repository's own test command. */
  then?: { title: string; note?: string; code: string };
  /** An optional step for what to type once the tool is in - the
      README's own commands, drawn as a second terminal block. */
  use?: { title: string; note?: string; code: string };
  linksTitle: string;
  linksNote?: string;
  links: readonly { label: string; href: string }[];
  copyLabel: string;
  copiedLabel: string;
}) {
  const accent = labAccent(slug);
  const soft = tone === "soft";
  const steps: { title: string; note?: string; content?: ReactNode }[] = [
    /* On a phone the terminal leaves the step's text column (`-ml-12` is
       the badge and its gap) and takes the tile's whole width. */
    {
      title: methodsTitle,
      content: <InstallTerminal methods={methods} accent={accent.darkInk} copyLabel={copyLabel} copiedLabel={copiedLabel} className="-ml-12 sm:ml-0" />,
    },
    ...(then
      ? [
          {
            title: then.title,
            note: then.note,
            content: (
              <div className={clsx("flex items-start gap-2 rounded-xl py-1 pr-1 pl-4", soft ? "bg-paper ring-1 ring-ink-950/[0.06]" : "bg-paper-soft")}>
                <span aria-hidden className="py-2 font-mono text-xs leading-5 text-ink-400 select-none">$</span>
                <code className="min-w-0 flex-1 py-2 font-mono text-xs leading-5 whitespace-pre-wrap text-ink-950 [overflow-wrap:anywhere]">{then.code}</code>
                <CopyPill value={then.code} label={copyLabel} copiedLabel={copiedLabel} />
              </div>
            ),
          },
        ]
      : []),
    ...(use
      ? [
          {
            title: use.title,
            note: use.note,
            content: (
              <InstallTerminal methods={[{ id: "use", label: use.title, code: use.code }]} accent={accent.darkInk} copyLabel={copyLabel} copiedLabel={copiedLabel} className="-ml-12 sm:ml-0" />
            ),
          },
        ]
      : []),
    ...(links.length > 0
      ? [
          {
            title: linksTitle,
            note: linksNote,
            content: (
              <div className="flex flex-wrap gap-2">
                {links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={buttonStyles({ variant: "outline", size: "sm" })}>
                    <PixelFill />
                    {l.label}
                    <ArrowUpRight aria-hidden />
                  </a>
                ))}
              </div>
            ),
          },
        ]
      : []),
  ];

  /* Centred on the page, on the section's own ground (Hulusi, 2026-09-20:
     "make the section centred and remove the grey box"): the heading
     centred, the rail in a centred column. */
  return (
    <div className="mx-auto max-w-3xl">
      <ProductHeading title={title} body={body} align="center" />
      <Reveal delay={80} className="mt-12">
        <ol className="flex flex-col">
          {steps.map((step, i) => {
            const last = i === steps.length - 1;
            return (
              <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
                {!last && <span aria-hidden className="absolute top-9 bottom-0 left-4 w-px bg-line" />}
                <span className={clsx("relative z-10 grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold tabular-nums", accent.tile)}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 pt-1">
                  <h3 className="text-base font-semibold tracking-tight text-ink-950">{step.title}</h3>
                  {step.note && <p className="mt-1 text-sm leading-relaxed text-pretty text-ink-600">{step.note}</p>}
                  {step.content && <div className="mt-4">{step.content}</div>}
                </div>
              </li>
            );
          })}
        </ol>
      </Reveal>
    </div>
  );
}
