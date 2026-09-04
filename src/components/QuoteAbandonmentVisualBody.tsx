import JourneyCanvas from "@/components/JourneyCanvas";
import { CHANNEL_LABEL, humanChannels, messageChannels } from "@/lib/journey-channels";
import type { JourneyDetail } from "@/lib/canonical-view";
import type { copy, Lang } from "@/lib/content";

/* PILOT (2026-09): a visually-led alternative body for exactly one page -
   /lab/journeys/quote-abandonment (ACQ-11's preset). Not a template, not a
   new system: a single bespoke component, wired in from JourneyRoutes.tsx
   by exact preset slug, so every other journey and preset keeps rendering
   through JourneyDetailBody/PractitionerView completely unchanged. See that
   branch's own comment for why a slug check beats a second route tree here.

   Brief: turn a page that read as implementation documentation (Trigger,
   Entity, Suppressed when, Configure, Required data, Semantic events,
   Attributes, Presets, Reusable rule, Distinct from, Guardrails, raw
   config keys and rule badges) into a visual showcase - the graph first,
   then three short cards a first-time reader can scan in seconds: what it
   does, the recommended sequence, when it stops. Nothing here is invented:
   every sentence traces to this journey's own canonical fields (purpose,
   orchestration.touches and their wait timings - the preset's own override
   of recovery.first_check included - and the stopsWhen states already on
   ACQ-11). No canonical file changed; this reads the same JourneyDetail the
   full technical page still renders elsewhere for every other journey. */

const T = {
  en: {
    flowHeading: "Journey flow",
    whatEyebrow: "What this journey does",
    whatBody:
      "Quote Abandonment brings someone back to a quote they configured but never accepted. It reopens their exact quote - the same items, the same price - and never claims a stock hold, a discount, or an expiry the system doesn't actually enforce.",
    flowEyebrow: "Recommended flow",
    stages: [
      { title: "First reminder", timing: "4–24 hours after the quote is left" },
      { title: "Follow-up", timing: "20–28 hours after the first reminder" },
      { title: "Final reminder", timing: "3–7 days after the quote is left, before it expires" },
    ],
    stopsEyebrow: "Stops when",
    stops: [
      "Quote completed",
      "Quote cancelled",
      "Quote expired",
      "A newer quote supersedes it",
      "Payment failure takes over",
    ],
  },
  tr: {
    flowHeading: "Journey akışı",
    whatEyebrow: "Bu journey ne yapar",
    whatBody:
      "Quote Abandonment, birinin oluşturup kabul etmediği bir teklife geri dönüşü sağlar. Aynı kalemler ve aynı fiyatla, tam olarak bıraktıkları teklifi yeniden açar; sistemin gerçekten uygulamadığı bir stok tutma, indirim ya da son tarih hiçbir zaman iddia edilmez.",
    flowEyebrow: "Önerilen akış",
    stages: [
      { title: "İlk hatırlatma", timing: "teklif bırakıldıktan 4–24 saat sonra" },
      { title: "Takip", timing: "ilk hatırlatmadan 20–28 saat sonra" },
      { title: "Son hatırlatma", timing: "teklif bırakıldıktan 3–7 gün sonra, süresi dolmadan önce" },
    ],
    stopsEyebrow: "Şu durumlarda durur",
    stops: [
      "Teklif tamamlandı",
      "Teklif iptal edildi",
      "Teklifin süresi doldu",
      "Daha yeni bir teklif bunun yerine geçti",
      "Ödeme hatası devraldı",
    ],
  },
} as const;

function Card({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-line bg-paper p-6">
      <p className="font-mono text-[11px] font-medium tracking-[0.1em] text-ink-400 uppercase">{eyebrow}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function QuoteAbandonmentVisualBody({
  detail,
  basePath,
  lang,
  t,
}: {
  detail: JourneyDetail;
  basePath: string;
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
}) {
  const tt = T[lang];
  const messageLabels = messageChannels(detail.channels).map((c) => CHANNEL_LABEL[c][lang]);
  const humanLabels = humanChannels(detail.channels).map((c) => CHANNEL_LABEL[c][lang]);

  const count = (kind: JourneyDetail["nodes"][number]["kind"]) => detail.nodes.filter((n) => n.kind === kind).length;
  const plural = (n: number, forms: readonly [string, string]) => `${n} ${forms[n === 1 ? 0 : 1]}`;
  const caption = [
    `${detail.nodes.length} ${t.nodesLabel}`,
    count("condition") ? plural(count("condition"), t.decisionsLabel) : null,
    count("exit") ? plural(count("exit"), t.exitsLabel) : null,
    count("handoff") ? plural(count("handoff"), t.handoffsLabel) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      {/* The graph leads - the page's primary visual element, same component
          and same interaction (pan, zoom, node detail) as every other
          journey's canvas, only moved above the notes instead of below
          them and given a plain-language heading. */}
      <h2 className="text-base font-semibold tracking-tight text-ink-950">{tt.flowHeading}</h2>
      <div className="mt-4">
        <JourneyCanvas
          nodes={detail.nodes}
          basePath={basePath}
          labels={{
            entry: t.canvas.entry,
            zoomIn: t.canvas.zoomIn,
            zoomOut: t.canvas.zoomOut,
            fitToView: t.canvas.fitToView,
            reset: t.canvas.reset,
            close: t.close,
            terminal: t.terminalLabel,
          }}
          caption={caption}
          messageLabels={messageLabels}
          humanLabels={humanLabels}
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card eyebrow={tt.whatEyebrow}>
          <p className="text-[14px] leading-relaxed text-pretty text-ink-700">{tt.whatBody}</p>
        </Card>

        <Card eyebrow={tt.flowEyebrow}>
          <ol className="flex flex-col gap-3.5">
            {tt.stages.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ink-950 font-mono text-[10px] font-semibold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[13.5px] font-medium text-ink-900">{s.title}</p>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-ink-500">{s.timing}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <Card eyebrow={tt.stopsEyebrow}>
          <ul className="flex flex-col gap-2">
            {tt.stops.map((s) => (
              <li key={s} className="flex items-start gap-2 text-[13.5px] leading-snug text-ink-700">
                <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-400" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
