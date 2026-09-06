import { SITE_URL } from "@/lib/seo";

/* Page-level JSON-LD builders, additive to the site-wide Person + WebSite
   graph in components/JsonLd.tsx. Same discipline as that file: every field
   here restates something the page itself already shows and substantiates -
   no aggregateRating, no review count, no price beyond the real "free, no
   account" fact every tool and calculator on this site already states in
   its own copy. Nothing here is fetched or computed; callers pass the exact
   strings already rendered on the page. */

function absolute(url: string): string {
  return url.startsWith("http") ? url : `${SITE_URL}${url}`;
}

export type BreadcrumbItem = { name: string; url: string };

/** BreadcrumbList - built from the same crumbs a page's own back-link/rail
    already shows, never a hierarchy invented only for search engines. */
export function breadcrumbList(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absolute(item.url),
    })),
  };
}

/** A free, browser-run tool with no install step - every calculator on this
    site, and Numerspace (a hosted calculator site with nothing to
    download). `offers` states the real "no account, no tracking" fact
    already on the page, nothing more. */
export function webApplication(opts: {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
}) {
  return {
    "@type": "WebApplication",
    name: opts.name,
    description: opts.description,
    url: absolute(opts.url),
    applicationCategory: opts.applicationCategory,
    operatingSystem: "Any (runs in the browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

/** An open-source repository or CLI/plugin tool - claude-lifecycle,
    dashboard-builder, the Google Ads Change History Explorer. */
export function softwareApplication(opts: {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  codeRepository?: string;
}) {
  return {
    "@type": "SoftwareApplication",
    name: opts.name,
    description: opts.description,
    url: absolute(opts.url),
    applicationCategory: opts.applicationCategory,
    operatingSystem: opts.operatingSystem,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    ...(opts.codeRepository ? { codeRepository: opts.codeRepository } : {}),
  };
}

/** A real, already-rendered numbered step list (InstallationStepper's own
    steps, or a "how to use it" sequence) - `steps` is `{name, text}` per
    step, taken verbatim from the same copy the page's own stepper UI
    renders, not reworded for the schema. */
export function howTo(opts: { name: string; description: string; steps: { name: string; text: string }[] }) {
  return {
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}
