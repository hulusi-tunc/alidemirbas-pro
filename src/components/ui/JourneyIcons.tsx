/* Icons for the journey flow view - hand-authored to match the approved
   Journey Detail design (Turn 7, 7a-7e) exactly: 16x16 viewBox, 1.5 stroke,
   round joins, no fill except where the design itself fills (the condition
   diamond's outline only - everything here is stroke-based). Two channel
   types the approved explorations didn't show an example of - WhatsApp and
   Sales Rep - are drawn in the same hand here so the vocabulary stays one
   family rather than mixing in a different icon set's weight. */

type IconProps = { className?: string };

export function TriggerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className={className}>
      <path d="M9 1.5L3.5 9H7l-.8 5.5L11.5 7H8z" />
    </svg>
  );
}

export function EmailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className={className}>
      <path d="M2 3.5h12v9H2z" />
      <path d="M2 4l6 4.5L14 4" />
    </svg>
  );
}

export function PushIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className={className}>
      <path d="M8 2.5a3.5 3.5 0 0 0-3.5 3.5v2.8L3 11h10l-1.5-2.2V6A3.5 3.5 0 0 0 8 2.5z" />
      <path d="M6.5 13a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}

export function SmsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className={className}>
      <path d="M2 3h12v8H9.5L6.5 13.5V11H2z" />
    </svg>
  );
}

export function InAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className={className}>
      <path d="M2 3h12v10H2z" />
      <path d="M6.5 7h5v4h-5z" />
    </svg>
  );
}

/* Not in the approved explorations (no WhatsApp example card was shown) -
   drawn to match: a rounded speech bubble with a small tail, distinct from
   SMS's squared-off bubble so the two don't read as the same mark. */
export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className={className}>
      <path d="M8 2.5a5.3 5.3 0 0 0-4.6 7.9L2.5 13.5l3.2-.9A5.3 5.3 0 1 0 8 2.5z" />
      <path d="M5.6 7.8c.3 1.6 1.4 2.6 3 2.9" strokeLinecap="round" />
    </svg>
  );
}

/* Not in the approved explorations either - a simple person mark for a
   human handoff, kept as plain as the channel icons rather than a
   photographic avatar. */
export function SalesRepIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="5.2" r="2.2" />
      <path d="M3.2 13.5c.5-2.7 2.3-4.2 4.8-4.2s4.3 1.5 4.8 4.2" strokeLinecap="round" />
    </svg>
  );
}

export function WaitIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5v3l2 1.5" />
    </svg>
  );
}

export function ConditionIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className={className}>
      <path d="M8 2.5L13.5 8 8 13.5 2.5 8z" />
    </svg>
  );
}

export function ExitIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className={className}>
      <path d="M6 3H3v10h3" />
      <path d="M7 8h7M11.5 5.5L14 8l-2.5 2.5" />
    </svg>
  );
}
