import type { Metadata } from "next";
import NotFoundPage from "@/components/NotFoundPage";
import { copy } from "@/lib/content";

/* Scoped not-found.tsx, not a bare app/not-found.tsx or global-not-found.js
   - this repo has two independent root layouts ((en) and tr/, see that
   layout's own comment), so there's no single root to compose a global
   404 from. A not-found.tsx inside each route group's own tree renders
   within that group's root layout (correct html/body/fonts/lang) and
   catches any unmatched URL that falls under it - which for (en), a
   route-group with no URL segment of its own, is effectively "anything
   not claimed by /tr". That keeps the 404 locale-correct without the
   experimental global-not-found flag. */
export const metadata: Metadata = { title: copy.en.notFound.metaTitle };

export default function NotFound() {
  return <NotFoundPage lang="en" />;
}
