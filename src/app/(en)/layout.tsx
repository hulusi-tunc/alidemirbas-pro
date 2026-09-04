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
    "Data-driven growth for mobile products. Mobile App Growth Lead at Aksigorta; previously Vodafone, Getir and Wingie Enuygun Group.",
  alternates: pageAlternates("", "en"),
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

/* One of two root layouts (see also tr/layout.tsx). Routes are duplicated
   folders (/about vs /tr/about), not a [lang] segment, so there's no route
   param to read the language from. Splitting into an (en) route group and a
   real tr/ folder - each with its own root layout - lets every page declare
   its own <html lang> at build time instead of reading it from a request
   header. That in turn means no page needs the dynamic headers() API, so
   the whole site can be statically prerendered again (confirm with
   `next build`: every route should show as ○, not ƒ). */
export default function EnRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* THE FONT VARIABLE BELONGS ON <html>, NOT ON <body>. globals.css declares
       `--font-sans: var(--font-outfit), …` inside `@theme`, which Tailwind
       emits on `:root` — i.e. on <html>. A var() that resolves to nothing
       makes the whole declaration invalid at computed-value time, so with
       `--font-outfit` defined one level down on <body>, `--font-sans` would
       compute to empty everywhere and every `font-sans` utility would fall
       back to the browser's default sans. */
    <html
      lang="en"
      className={`${outfit.variable} ${firaCode.variable} ${merriweather.variable}`}
    >
      <body className="bg-paper font-sans text-ink-900 antialiased">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
