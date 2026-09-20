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
   same blueprint.

   `intent`/`branch` are localised (2026-09-12 site-wide copy audit):
   `name`/`exit` already carried both languages, these two didn't, which
   left a TR reader looking at raw English mid-card. Meaning translated,
   not the source file's exact English words - the underlying blueprint
   is the real thing either way. */

type FlowChannel = "email" | "push" | "sms" | "in-app";

const CHANNEL_STYLE: Record<FlowChannel, { label: { en: string; tr: string }; badge: string; bar: string }> = {
  email: { label: { en: "Email", tr: "E-posta" }, badge: "bg-violet-50 text-violet-700", bar: "bg-violet-500" },
  push: { label: { en: "Push", tr: "Push" }, badge: "bg-sky-50 text-sky-700", bar: "bg-sky-500" },
  sms: { label: { en: "SMS", tr: "SMS" }, badge: "bg-teal-50 text-teal-700", bar: "bg-teal-500" },
  "in-app": { label: { en: "In-app", tr: "Uygulama içi" }, badge: "bg-amber-50 text-amber-700", bar: "bg-amber-500" },
};

type FlowStep = {
  wait: string;
  channel: FlowChannel;
  intent: { en: string; tr: string };
  branch?: { en: string; tr: string };
};
export type Pattern = { name: { en: string; tr: string }; trigger: string; steps: FlowStep[]; exit: { en: string; tr: string } };

/** Source: knowledge/journey-patterns/abandoned-cart.md, winback.md,
    trial-conversion.md - front matter (trigger/depth) and each file's own
    "Step blueprint (standard, N steps)" table, copied verbatim (meaning
    only for intent/branch on the TR side - see file header). */
export const PATTERNS: Pattern[] = [
  {
    name: { en: "Abandoned cart", tr: "Terk edilmiş sepet" },
    trigger: "add_to_cart",
    steps: [
      {
        wait: "+1h",
        channel: "email",
        intent: { en: "Reminder: cart contents, zero pressure", tr: "Hatırlatma: sepet içeriği, baskı yok" },
      },
      {
        wait: "+20h",
        channel: "push",
        intent: { en: "Short nudge, deeplink to cart", tr: "Kısa dürtme, sepete deep link" },
        branch: { en: "if not opened", tr: "açılmadıysa" },
      },
      {
        wait: "+24h",
        channel: "email",
        intent: { en: "Objection handling: shipping/returns/trust", tr: "İtiraz karşılama: kargo/iade/güven" },
      },
      {
        wait: "+48h",
        channel: "email",
        intent: { en: "Social proof on cart items", tr: "Sepetteki ürünler için sosyal kanıt" },
        branch: { en: "if clicked, no purchase", tr: "tıklandı, satın alma yoksa" },
      },
      {
        wait: "+72h",
        channel: "push",
        intent: { en: "Last call, no fake urgency", tr: "Son çağrı, sahte aciliyet yok" },
      },
    ],
    exit: { en: "purchase · 7-day window", tr: "purchase · 7 günlük pencere" },
  },
  {
    name: { en: "Trial conversion", tr: "Deneme dönüşümü" },
    trigger: "trial_start",
    steps: [
      {
        wait: "+1h",
        channel: "email",
        intent: { en: "Welcome: the one action that predicts success", tr: "Hoş geldin: başarıyı öngören tek eylem" },
      },
      {
        wait: "+2d",
        channel: "in-app",
        intent: { en: "Nudge toward the core feature", tr: "Ana özelliğe yönlendirme" },
        branch: { en: "if no feature used", tr: "hiçbir özellik kullanılmadıysa" },
      },
      {
        wait: "+2d",
        channel: "email",
        intent: {
          en: "Use-case deepening or \"what's blocking you?\"",
          tr: "Kullanım senaryosunu derinleştirme veya \"seni ne engelliyor?\"",
        },
        branch: { en: "split on feature use", tr: "özellik kullanımına göre ayrım" },
      },
      {
        wait: "midpoint",
        channel: "email",
        intent: { en: "Progress recap, what stays behind on free", tr: "İlerleme özeti, ücretsizde neler kalır" },
      },
      {
        wait: "−72h",
        channel: "email",
        intent: { en: "Expiry notice: date, price, plain and factual", tr: "Son gün bildirimi: tarih, fiyat, sade ve net" },
      },
      {
        wait: "−24h",
        channel: "push",
        intent: { en: "Last call, real deadline only", tr: "Son çağrı, sadece gerçek son tarih" },
        branch: { en: "if not clicked", tr: "tıklanmadıysa" },
      },
    ],
    exit: { en: "subscription_start", tr: "subscription_start" },
  },
  {
    name: { en: "Winback", tr: "Winback" },
    trigger: "segment: lapsed",
    steps: [
      {
        wait: "on entry",
        channel: "email",
        intent: { en: "What changed since you left, no discount", tr: "Ayrıldığından beri ne değişti, indirim yok" },
      },
      {
        wait: "+5d",
        channel: "email",
        intent: { en: "Personalized best-of, restates original value", tr: "Kişiselleştirilmiş öne çıkanlar, ilk değeri yineler" },
      },
      {
        wait: "+7d",
        channel: "sms",
        intent: { en: "Short direct reminder, one link", tr: "Kısa doğrudan hatırlatma, tek link" },
        branch: { en: "if steps 1-2 not opened", tr: "1-2. adımlar açılmadıysa" },
      },
      {
        wait: "+10d",
        channel: "email",
        intent: { en: "Incentive, gated on LTV tier, needs approval", tr: "Teşvik, LTV kademesine bağlı, onay gerekir" },
      },
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
                  {step.branch[lang]}
                </span>
              )}
              <div className="flex w-full items-stretch overflow-hidden rounded-lg border border-line">
                <span aria-hidden className={`w-1 shrink-0 ${cs.bar}`} />
                <div className="flex-1 bg-paper-soft/60 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[12px] font-medium ${cs.badge}`}>{cs.label[lang]}</span>
                    <span className="font-mono text-[12px] text-ink-500 tabular-nums">{step.wait}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-snug text-ink-700">{step.intent[lang]}</p>
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
