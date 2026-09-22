import { notFound } from "next/navigation";

/* Archived experiment route.
   The original page source is preserved under /archive/experiments.
   Keeping the route file in place avoids accidentally reintroducing a
   stale public design while making every request resolve as a 404. */
export default function ArchivedExperimentPage() {
  notFound();
}
