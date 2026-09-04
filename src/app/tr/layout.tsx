import type { Metadata } from "next";
import { Outfit, Fira_Code, Merriweather } from "next/font/google";
import "../globals.css";
import { JsonLd } from "@/components/JsonLd";
import { pageAlternates, SITE_URL } from "@/lib/seo";

/* REBRAND (2026-09-04): Geist -> Outfit/Fira Code/Merriweather, alongside the
   blue -> terracotta primary ramp in globals.css. See that file's header
   comment for why. */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
});

/* The mono rail the detail pages and the home page's spec plate already use
   was resolving to whatever monospace the OS happened to ship - `--font-mono`
   was referenced but never defined. Fira Code is the loaded mono cut now. */
const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin", "latin-ext"],
});

/* Not applied by any component today (see globals.css's `--font-serif`
   note) - loaded so the `font-serif` utility is correct the moment
   something reaches for it, rather than silently falling back. */
const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
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
    <html
      lang="tr"
      className={`${outfit.variable} ${firaCode.variable} ${merriweather.variable}`}
    >
      <body className="bg-paper font-sans text-ink-900 antialiased">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
