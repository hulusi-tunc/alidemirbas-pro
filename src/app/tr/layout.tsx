import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { JsonLd } from "@/components/JsonLd";
import { pageAlternates, SITE_URL } from "@/lib/seo";

/* ONE FAMILY: INTER (2026-09-05, by explicit request - "Inter Display yapar
   misin tum sitedeki fontlari"). This supersedes the 2026-09-04 brand
   guideline's two-family "Manrope (sans) + JetBrains Mono (mono)" spec, and
   the Outfit/Fira Code/Merriweather set before it. Both `--font-sans` and
   `--font-mono` now resolve to this one load - see globals.css § Typography
   for what that costs and what carries the load instead.

   "Inter Display" IS NOT A SEPARATE FAMILY on Google Fonts. Inter v4 ships an
   optical-size axis (`opsz`, 14-32) and the Display drawing is its top end -
   tighter apertures, tighter spacing, cut for large type. Requesting `opsz`
   in `axes` is therefore what actually loads Display; without it the browser
   only ever gets the 14 (Text) instance and no headline can reach the Display
   cut at all.

   `font-optical-sizing` is left at its `auto` default on purpose: the browser
   then feeds each element's used font-size into `opsz`, so a 56px hero lands
   on the Display drawing and 15px body copy stays on the Text drawing, which
   is the axis's whole reason for existing. Pinning `opsz: 32` globally would
   put Display's tight spacing on 14px body text and cost legibility for
   nothing. `wght` is a default axis and is requested automatically. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ali Demirbaş - Growth Marketer",
  description:
    "Mobil ürünler için veriyle büyüme. Aksigorta'da Mobile App Growth Lead; öncesinde Vodafone, Getir ve Wingie Enuygun Group.",
  alternates: pageAlternates("", "tr"),
  /* SITE-WIDE NOINDEX. This is a demo site and is deliberately kept out of
     search results; every page inherits this unless it sets its own
     `robots`, and nothing does (see the note in robots.ts).

     Deliberately NOT done with a robots.txt `Disallow` - that would be the
     intuitive lever and the wrong one. Disallow stops a crawler from
     FETCHING the page, which means it never sees this tag, so URLs already
     in the index stay there (often as a bare title with "no information is
     available"). Removal needs the opposite: keep the pages crawlable so
     the noindex is actually read. */
  robots: { index: false, follow: false },
};

/* The other of two root layouts - see (en)/layout.tsx for why the site is
   split this way instead of reading language from a request header. `tr` is
   a real folder (not a route group) so it keeps producing /tr/... URLs;
   with no shared app/layout.tsx above it, it's still eligible to be its own
   root and declare <html lang="tr">. */
export default function TrRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="bg-paper font-sans text-ink-900 antialiased">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
