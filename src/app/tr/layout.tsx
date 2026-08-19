import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../globals.css";
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
    "Mobil ürünler için veriyle büyüme. Aksigorta'da Mobile App Growth Lead; öncesinde Vodafone, Getir ve Wingie Enuygun Group.",
  alternates: pageAlternates("", "tr"),
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
    <html lang="tr" className={geist.variable}>
      <body className="bg-paper font-sans text-ink-900 antialiased">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
