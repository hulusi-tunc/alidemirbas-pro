import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { JsonLd } from "@/components/JsonLd";
import { pageAlternates, SITE_URL } from "@/lib/seo";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
});

/* The mono rail the detail pages and the home page's spec plate already use
   was resolving to whatever monospace the OS happened to ship - `--font-mono`
   was referenced but never defined. This is the same family's mono cut, so a
   label set in it does not read as a second typeface. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
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
       `--font-sans: var(--font-geist), …` inside `@theme`, which Tailwind emits
       on `:root` — i.e. on <html>. A var() that resolves to nothing makes the
       whole declaration invalid at computed-value time, so with `--font-geist`
       defined one level down on <body>, `--font-sans` computed to empty
       everywhere, every `font-sans` utility fell back to the browser's default
       sans, and Geist was never requested at all. */
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="bg-paper font-sans text-ink-900 antialiased">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
