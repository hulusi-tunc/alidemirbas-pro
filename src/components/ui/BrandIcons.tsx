/* lucide-react (this repo's version) ships no brand/logo icons - no
   LinkedIn, no GitHub. Small inline SVGs at the same 24x24 viewBox as every
   other icon in the site, so they drop in at any lucide-style size class. */

export function LinkedInMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6.94 8.5H3.56V20.5H6.94V8.5Z" />
      <path d="M5.25 7.03A1.97 1.97 0 1 0 5.25 3.09a1.97 1.97 0 0 0 0 3.94Z" />
      <path d="M20.5 13.63c0-3.16-1.69-4.63-3.94-4.63-1.82 0-2.63 1-3.08 1.7V8.5H10.1c.05 1 0 12 0 12h3.38v-6.7c0-.36.03-.72.13-.98.29-.72.94-1.47 2.05-1.47 1.45 0 2.03 1.1 2.03 2.72V20.5h3.38l-.57-6.87Z" />
    </svg>
  );
}

export function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.48 2 2 6.58 2 12.21c0 4.51 2.87 8.33 6.84 9.68.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.51-3.5-.7-3.72-1.34-.13-.33-.68-1.35-1.16-1.63-.4-.22-.97-.75-.01-.77.9-.01 1.55.85 1.76 1.2 1.03 1.76 2.68 1.26 3.33.97.1-.76.4-1.27.72-1.56-2.53-.29-5.18-1.29-5.18-5.72 0-1.26.44-2.3 1.16-3.11-.11-.29-.51-1.48.11-3.08 0 0 .95-.31 3.12 1.19.9-.26 1.86-.38 2.82-.38.96 0 1.92.13 2.82.38 2.17-1.5 3.12-1.19 3.12-1.19.62 1.6.22 2.79.11 3.08.72.81 1.16 1.84 1.16 3.11 0 4.44-2.65 5.42-5.19 5.71.41.37.77 1.08.77 2.18 0 1.58-.01 2.85-.01 3.24 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.21C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}
