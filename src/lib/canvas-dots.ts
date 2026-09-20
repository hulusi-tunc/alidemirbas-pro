/* The canvas's dot sheet (Hulusi, 2026-09-20: "dots like FigJam", then
   "not high quality, so big"): one small circle per cell, as an SVG data
   URI so it rasterises at the device's own resolution - a CSS radial
   gradient dot is drawn at CSS-pixel size and reads soft and fat on a 2x
   display. 24 world px between dots, doubling whenever the on-screen gap
   would fall under 18px so a zoomed-out sheet never crowds. Shared by the
   free canvas, the Info preview and the landing page's figures. */

export const DOT_GAP = 24;

export function dotGap(scale: number): number {
  let gap = DOT_GAP;
  while (gap * scale < 18) gap *= 2;
  return gap;
}

export function dotSheet(scale: number): string {
  const size = dotGap(scale) * scale;
  const r = Math.min(1, Math.max(0.6, 0.9 * scale)).toFixed(2);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><circle cx='${(size / 2).toFixed(2)}' cy='${(size / 2).toFixed(2)}' r='${r}' fill='rgb(10 16 32 / 0.22)'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

/** Inline style for a static sheet at 100%. */
export const DOT_STYLE = { backgroundImage: dotSheet(1), backgroundSize: `${DOT_GAP}px ${DOT_GAP}px` } as const;
