/** Renders one or more schema.org nodes as a single JSON-LD script tag,
    wrapped in the same @context/@graph envelope the site-wide Person +
    WebSite script (components/JsonLd.tsx) already uses. Every page-level
    schema addition (BreadcrumbList, WebApplication, SoftwareApplication,
    HowTo) goes through this one renderer rather than hand-rolling its own
    <script> tag. */
export function JsonLdScript({ data }: { data: object | object[] }) {
  const graph = Array.isArray(data) ? data : [data];
  const payload = { "@context": "https://schema.org", "@graph": graph };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />;
}
