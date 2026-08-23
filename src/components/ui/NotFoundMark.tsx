/* Small line-art illustration for the 404 page - a growth line that runs
   off its own chart, on-brand for a site about measurement and growth
   rather than a generic broken-robot/ghost. Same hand-authored inline-SVG
   convention as BrandIcons.tsx: single stroke color (currentColor), no
   fill, no external asset. Kept deliberately simple - a placeholder
   graphic treatment per instruction 7, not a commissioned illustration. */
export function NotFoundMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 88" fill="none" className={className} aria-hidden>
      {/* axes */}
      <path d="M8 4v72M8 76h104" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      {/* the line that goes off-course */}
      <path
        d="M16 60 L34 44 L50 52 L66 24 L80 34"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M80 34 Q94 22 108 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 7"
      />
      {/* the point where it lost the plot */}
      <circle cx="80" cy="34" r="3.5" fill="currentColor" />
      <circle cx="108" cy="30" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}
