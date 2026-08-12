import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { JsonLd } from "@/components/JsonLd";
import { pageAlternates, SITE_URL } from "@/lib/seo";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ali Demirbaş - Growth Marketer",
  description:
    "Data-driven growth for mobile products. Mobile App Growth Lead at Aksigorta; previously Vodafone, Getir and Wingie Enuygun Group.",
  alternates: pageAlternates("", "en"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Routes are duplicated folders (/about vs /tr/about), not a [lang] segment,
  // so there's no route param to read the language from here. middleware.ts
  // stamps it onto a request header from the URL; this is the one place in
  // the tree that's allowed to read it back and declare <html lang>.
  const lang = (await headers()).get("x-lang") === "tr" ? "tr" : "en";

  return (
    /* THE FONT VARIABLE BELONGS ON <html>, NOT ON <body>. globals.css declares
       `--font-sans: var(--font-geist), …` inside `@theme`, which Tailwind emits
       on `:root` — i.e. on <html>. A var() that resolves to nothing makes the
       whole declaration invalid at computed-value time, so with `--font-geist`
       defined one level down on <body>, `--font-sans` computed to empty
       everywhere, every `font-sans` utility fell back to the browser's default
       sans, and Geist was never requested at all. */
    <html lang={lang} className={geist.variable}>
      <body className="bg-paper font-sans text-ink-900 antialiased">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
