import type { ReactNode } from "react";

/* LAB VISUALS — the page's illustrations, drawn in code rather than
   generated.

   The brief asked for illustrations that feel alive, not stills dropped
   into a slot, and explicitly not "stupid geometrical shapes". These are
   SVG and CSS: they animate on their own clock, they scale to any size
   without resampling, they cost a few kilobytes, and - the reason that
   actually matters here - every figure in them is REAL. A generated
   picture of a dashboard would be a fabricated screenshot, which this
   site bans outright (AGENTS.md); a drawn diagram fed by the real
   canonical counts is evidence.

   Every animation here is transform/opacity only, so it composites on the
   GPU, and all of it is neutralised by the global reduced-motion rule in
   globals.css. */

/* ------------------------------------------------------------- MATRIX */

/** The dot matrix, the same grain the primary button's pixel dissolve
    uses - a dotted field that breathes rather than a static texture.
    Rendered as two offset radial-gradient grids with a radial mask, so it
    fades out before it reaches an edge and never reads as wallpaper. */
export function DotMatrix({
  className = "",
  tone = "brand",
}: {
  className?: string;
  tone?: "brand" | "ink" | "light";
}) {
  const dot =
    tone === "brand"
      ? "var(--color-primary-400)"
      : tone === "light"
        ? "rgb(255 255 255 / 0.5)"
        : "var(--color-ink-300)";
  return (
    <div
      aria-hidden
      className={`lab-matrix pointer-events-none absolute ${className}`}
      style={{
        backgroundImage: `radial-gradient(${dot} 1px, transparent 1px)`,
        backgroundSize: "10px 10px",
        maskImage: "radial-gradient(circle at center, black 0%, transparent 72%)",
        WebkitMaskImage: "radial-gradient(circle at center, black 0%, transparent 72%)",
      }}
    />
  );
}

/* ------------------------------------------------------------- ORBITS */

/** Concentric arcs turning at different rates around a still centre. Used
    where a project is about orchestration - something coordinating other
    things - so the figure carries the idea rather than decorating it. */
export function OrbitRings({ label }: { label?: ReactNode }) {
  return (
    <div className="relative aspect-square w-full max-w-[22rem]">
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full" aria-hidden>
        <g fill="none" strokeLinecap="round">
          <circle
            cx="100" cy="100" r="78"
            stroke="var(--color-primary-200)" strokeWidth="1"
            strokeDasharray="6 10" className="lab-spin-slow"
            style={{ transformOrigin: "100px 100px" }}
          />
          <circle
            cx="100" cy="100" r="58"
            stroke="var(--color-primary-500)" strokeWidth="2.5"
            strokeDasharray="120 250" className="lab-spin"
            style={{ transformOrigin: "100px 100px" }}
          />
          <circle
            cx="100" cy="100" r="40"
            stroke="var(--color-primary-600)" strokeWidth="2.5"
            strokeDasharray="70 180" className="lab-spin-reverse"
            style={{ transformOrigin: "100px 100px" }}
          />
          <ellipse
            cx="100" cy="100" rx="88" ry="34"
            stroke="var(--color-primary-300)" strokeWidth="1"
            className="lab-spin-slow" style={{ transformOrigin: "100px 100px" }}
          />
        </g>
        <circle cx="178" cy="100" r="3.5" fill="var(--color-primary-600)" className="lab-spin" style={{ transformOrigin: "100px 100px" }} />
        <circle cx="100" cy="60" r="2.5" fill="var(--color-primary-400)" className="lab-spin-reverse" style={{ transformOrigin: "100px 100px" }} />
      </svg>
      {label && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">{label}</div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- FLOW */

export type FlowNode = { label: string; accent?: boolean };

/** A hub with branches, and a pulse travelling down each branch. This is
    the "signal in, journey out" shape the lifecycle tools actually have,
    so the labels are the real stage names the caller passes in - never
    invented UI copy. */
export function SignalFlow({ hub, nodes }: { hub: string; nodes: FlowNode[] }) {
  const count = nodes.length;
  return (
    <div className="relative w-full">
      <svg viewBox="0 0 400 190" className="w-full" role="img" aria-label={`${hub} branching into ${nodes.map((n) => n.label).join(", ")}`}>
        {/* Branch lines, drawn from the hub down to each node slot. */}
        {nodes.map((n, i) => {
          const x = 40 + (i * 320) / Math.max(count - 1, 1);
          return (
            <g key={n.label}>
              <path
                d={`M200 62 V92 H${x} V126`}
                fill="none"
                stroke="var(--color-line-strong)"
                strokeWidth="1.5"
              />
              <path
                d={`M200 62 V92 H${x} V126`}
                fill="none"
                stroke="var(--color-primary-500)"
                strokeWidth="1.5"
                strokeDasharray="10 190"
                className="lab-pulse"
                style={{ animationDelay: `${i * 0.45}s` }}
              />
            </g>
          );
        })}

        {/* The hub. */}
        <rect x="150" y="26" width="100" height="36" rx="18" fill="var(--color-primary-600)" />
        <text x="200" y="49" textAnchor="middle" className="fill-white text-[13px] font-medium">
          {hub}
        </text>

        {/* The branch endpoints. */}
        {nodes.map((n, i) => {
          const x = 40 + (i * 320) / Math.max(count - 1, 1);
          return (
            <g key={n.label}>
              <rect
                x={x - 38} y="126" width="76" height="34" rx="17"
                fill={n.accent ? "var(--color-primary-50)" : "var(--color-paper)"}
                stroke={n.accent ? "var(--color-primary-200)" : "var(--color-line-strong)"}
                strokeWidth="1"
              />
              <text x={x} y="148" textAnchor="middle" className="fill-ink-700 text-[11.5px]">
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------- STACK */

/** Layered plates receding into depth, each drifting a little out of
    phase - the "library" idea, a lot of one kind of thing. Depth comes
    from shadow and offset, the way the reference images do it. */
export function DepthStack({ items }: { items: string[] }) {
  return (
    <div className="relative mx-auto h-[15rem] w-full max-w-[26rem]">
      {items.slice(0, 5).map((item, i) => (
        <div
          key={item}
          className="lab-float absolute left-1/2 w-[76%] -translate-x-1/2 rounded-2xl bg-paper px-5 py-3.5 text-[13.5px] font-medium text-ink-800 shadow-card"
          style={{
            top: `${i * 2.35}rem`,
            zIndex: 10 - i,
            transform: `translateX(-50%) scale(${1 - i * 0.045})`,
            opacity: 1 - i * 0.14,
            animationDelay: `${i * 0.5}s`,
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
