import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Ali Demirbaş - Growth Marketer",
  description:
    "Data-driven growth for mobile products. Mobile App Growth Lead at Aksigorta; previously Vodafone, Getir and Wingie Enuygun Group.",
};

export default function RootLayout({
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
    <html lang="en" className={geist.variable}>
      <body className="bg-paper font-sans text-ink-900 antialiased">
        {children}
      </body>
    </html>
  );
}
