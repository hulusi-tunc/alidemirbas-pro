import { notFound } from "next/navigation";

/* Catch-all for any path under the (en) tree that isn't a real route.
   A route-group's own not-found.tsx (see ../not-found.tsx) only fires
   for an explicit notFound() call within a matched segment - it does
   NOT catch a request that matches no route file at all, which is
   exactly what happens for a made-up URL when the app has no single
   root layout for Next to fall back to (confirmed by curl: without
   this file, an unknown path returned Next's generic default 404, not
   our custom one). This file makes "unknown path" a real match - one
   that immediately calls notFound() - so ../not-found.tsx renders
   correctly, in this tree's own root layout, in English. */
export default function CatchAll() {
  notFound();
}
