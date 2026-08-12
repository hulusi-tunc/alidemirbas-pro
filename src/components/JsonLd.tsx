import { EMAIL, LINKEDIN } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

/* Site-wide Person + WebSite structured data. Rendered once from the root
   layout - JSON-LD doesn't need to live in <head>, Google reads it anywhere
   in the document. Kept deliberately small: just the two types every page
   already substantiates (About's bio, the mailto/LinkedIn links repeated
   across Contact, the hero, and the footer), not speculative fields. */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Ali Demirbaş",
        url: SITE_URL,
        image: `${SITE_URL}/portrait.jpg`,
        jobTitle: "Mobile App Growth Lead",
        worksFor: { "@type": "Organization", name: "Aksigorta" },
        email: `mailto:${EMAIL}`,
        // Matches the three Expertise cards on the home page - real topics
        // the site substantiates, not a speculative keyword list.
        knowsAbout: ["Mobile App Growth", "CRM & Lifecycle Marketing", "Growth Analytics & Experimentation"],
        sameAs: [LINKEDIN, "https://github.com/ali-demirbas"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Ali Demirbaş",
        inLanguage: ["en", "tr"],
        publisher: { "@id": `${SITE_URL}/#person` },
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
