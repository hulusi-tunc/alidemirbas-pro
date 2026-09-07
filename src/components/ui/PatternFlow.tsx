import type { Lang } from "@/lib/content";

/* One real journey pattern, drawn as the step flow its source defines.

   Each Pattern below is copied verbatim from one file in the Lifecycle
   Marketing Journey Builder's knowledge base
   (knowledge/journey-patterns/<slug>.md): the front matter's trigger, and
   the file's own "Step blueprint (standard, N steps)" table - wait,
   channel, intent, branch. Nothing here is a mock-up of a journey; it IS
   the engine's definition, rendered.

   Shared by the Journey Builder product page (all three, as the pattern
   section) and the Lab index (the first one, as the builder's figure in
   the lifecycle bento), so the two never drift into two drawings of the
   same blueprint. */

type FlowChannel = "email" | "push" | "sms" | "in-app";

const CHANNEL_STYLE: Record<FlowChannel, { label: string; badge: string; bar: string }> = {
  email: { label: "Email", badge: "bg-violet-50 text-violet-700", bar: "bg-violet-500" },
  push: { label: "Push", badge: "bg-sky-50 text-sky-700", bar: "bg-sky-500" },
  sms: { label: "SMS", badge: "bg-teal-50 text-teal-700", bar: "bg-teal-500" },
  "in-app": { label: "In-app", badge: "bg-amber-50 text-amber-700", bar: "bg-amber-500" },
};

type FlowStep = { wait: string; channel: FlowChannel; intent: string; branch?: string };
export type Pattern = { name: { en: string; tr: string }; trigger: string; steps: FlowStep[]; exit: { en: string; tr: string } };

/** Source: knowledge/journey-patterns/abandoned-cart.md, winback.md,
    trial-conversion.md - front matter (trigger/depth) and each file's own
    "Step blueprint (standard, N steps)" table, copied verbatim. */
export const PATTERNS: Pattern[] = [
  {
    name: { en: "Abandoned cart", tr: "Terk edilmiş sepet" },
    trigger: "add_to_cart",
    steps: [
      { wait: "+1h", channel: "email", intent: "Reminder: cart contents, zero pressure" },
      { wait: "+20h", channel: "push", intent: "Short nudge, deeplink to cart", branch: "if not opened" },
      { wait: "+24h", channel: "email", intent: "Objection handling: shipping/returns/trust" },
      { wait: "+48h", channel: "email", intent: "Social proof on cart items", branch: "if clicked, no purchase" },
      { wait: "+72h", channel: "push", intent: "Last call, no fake urgency" },
    ],
    exit: { en: "purchase · 7-day window", tr: "purchase · 7 günlük pencere" },
  },
  {
    name: { en: "Trial conversion", tr: "Deneme dönüşümü" },
    trigger: "trial_start",
    steps: [
      { wait: "+1h", channel: "email", intent: "Welcome: the one action that predicts success" },
      { wait: "+2d", channel: "in-app", intent: "Nudge toward the core feature", branch: "if no feature used" },
      { wait: "+2d", channel: "email", intent: "Use-case deepening or \"what's blocking you?\"", branch: "split on feature use" },
      { wait: "midpoint", channel: "email", intent: "Progress recap, what stays behind on free" },
      { wait: "−72h", channel: "email", intent: "Expiry notice: date, price, plain and factual" },
      { wait: "−24h", channel: "push", intent: "Last call, real deadline only", branch: "if not clicked" },
    ],
    exit: { en: "subscription_start", tr: "subscription_start" },
  },
  {
    name: { en: "Winback", tr: "Winback" },
    trigger: "segment: lapsed",
    steps: [
      { wait: "on entry", channel: "email", intent: "What changed since you left, no discount" },
      { wait: "+5d", channel: "email", intent: "Personalized best-of, restates original value" },
      { wait: "+7d", channel: "sms", intent: "Short direct reminder, one link", branch: "if steps 1-2 not opened" },
      { wait: "+10d", channel: "email", intent: "Incentive, gated on LTV tier, needs approval" },
    ],
    exit: { en: "purchase or session_start", tr: "purchase veya session_start" },
  },
];

export function PatternFlowCard({ pattern, lang }: { pattern: Pattern; lang: Lang }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-line bg-paper shadow-[0_0_0_1px_rgb(0_0_0/0.04),0_8px_24px_-16px_rgb(10_16_32/0.15)]">
      <div className="border-b border-line px-5 py-4">
        <p className="text-sm font-semibold text-ink-950">{pattern.name[lang]}</p>
        <p className="mt-0.5 text-[12px] text-ink-500">{pattern.trigger}</p>
      </div>
      <div className="flex flex-col gap-0 px-5 py-5">
        {/* Trigger pill */}
        <div className="flex justify-center">
          <span className="rounded-full bg-ink-950 px-3 py-1 text-[12px] font-medium text-white">
            {pattern.trigger}
          </span>
        </div>
        {pattern.steps.map((step, i) => {
          const cs = CHANNEL_STYLE[step.channel];
          return (
            <div key={i} className="flex flex-col items-center">
              <span aria-hidden className="h-4 w-px bg-line-strong" />
              {step.branch && (
                <span className="-mt-1 mb-1 rounded-full bg-paper-soft px-2 py-0.5 text-[12px] text-ink-600">
                  {step.branch}
                </span>
              )}
              <div className="flex w-full items-stretch overflow-hidden rounded-lg border border-line">
                <span aria-hidden className={`w-1 shrink-0 ${cs.bar}`} />
                <div className="flex-1 bg-paper-soft/60 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[12px] font-medium ${cs.badge}`}>{cs.label}</span>
                    <span className="font-mono text-[12px] text-ink-500 tabular-nums">{step.wait}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-snug text-ink-700">{step.intent}</p>
                </div>
              </div>
            </div>
          );
        })}
        <span aria-hidden className="h-4 w-px self-center bg-line-strong" />
        <div className="flex justify-center">
          <span className="rounded-full bg-emerald-600 px-3 py-1 text-[12px] font-medium text-white">
            {pattern.exit[lang]}
          </span>
        </div>
      </div>
    </div>
  );
}
