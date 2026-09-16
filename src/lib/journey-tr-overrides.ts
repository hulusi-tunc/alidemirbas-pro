import type { FlowNode, JourneyDetail } from "@/lib/canonical-view";
import type { Lang } from "@/lib/content";

/* Hand-translated Turkish text for INDIVIDUAL journeys, applied on top of
   the shared canonical data at render time - not a change to
   canonical-view.ts's own (English, computed once at module load)
   derivation, and not a site-wide translation mechanism: canonical journey
   prose stays English on both locales everywhere else in this codebase by
   deliberate design (see JourneyVisualBody.tsx's own "ENGLISH ON BOTH
   LOCALES" comment - the same rule a calculator's editorial content
   follows). This is a scoped, opt-in exception for journeys explicitly
   requested one at a time, same shape as a blog post's own optional `tr`
   field (blog-posts.ts) - a journey with no entry here renders exactly as
   it always has, on both locales.

   Only the fields actually visible on the canvas + floating title card are
   covered (headline/detail/branch label+reason, purpose/shortName/name/
   categoryTitle) - the Info tab's deeper technical fields (eligibility,
   suppressions, guardrails, reusableRule, distinctFrom) are not part of
   this pass and stay English even for a journey listed here. */

type EdgeOverride = { label?: string; detail?: string };
type NodeOverride = { headline?: string; detail?: string; edges?: readonly (EdgeOverride | undefined)[] };
type JourneyOverride = {
  categoryTitle?: string;
  shortName?: string;
  name?: string;
  purpose?: string;
  nodes?: Readonly<Record<string, NodeOverride>>;
};

const OVERRIDES: Readonly<Record<string, JourneyOverride>> = {
  "ACQ-01": {
    categoryTitle: "Kazanım, niyet ve yeterlilik",
    shortName: "Anonim Kimlik Çözümlemesi",
    name: "Anonim niyet → bilinen kimlik → yeterli giriş",
    purpose:
      "Anlamlı ama anonim bir niyet sinyalini, bir kimlik uydurmadan kimlik çözümleme sürecinden geçirmek ve yaşam döngüsüne girişi, kimliğin çözülmüş olmasından ayrı bir soru olarak ele almak.",
    nodes: {
      "t.threshold": { headline: "Anonim niyet eşiği aşıldı" },
      "c.identity": {
        headline: "Bu anonim profil için kesin (deterministik) bilinen bir kimlik mevcut mu?",
        edges: [
          {
            label: "Kesin kimlik",
            detail:
              "ziyaretçi kimlik doğruladı, birinci taraf bir tanımlayıcı gönderdi ya da tam olarak tek bir bilinen profille eşleşen imzalı bir bağlantıyı takip etti",
          },
          {
            label: "Sadece olasılıksal",
            detail: "yalnızca cihaz, ağ veya benzerlik sinyalleri mevcut - bunlar birden fazla kişiyi tanımlayabilir",
          },
        ],
      },
      "w.identity": {
        headline: "kesin bir bilinen kimlik bu profil için çözülene kadar",
        detail: "eşiği açan sinyallerin tazelik penceresi sonrasında zaman aşımı",
        edges: [{ label: "olay gerçekleştiğinde" }, { label: "zaman aşımında" }],
      },
      "x.stale": {
        headline: "anonim, niyet bayatladı, kimlik talep edilmedi",
        detail:
          "niyet eşiğinin yeniden aşılması yeni bir örnek açar; hiçbir şey birleştirilmedi ve beklemenin kendisi bir izin anlamına gelmedi",
      },
      "a.reconcile": {
        headline:
          "Anonim davranışsal geçmişi bilinen profille birleştir, kimlik öncesi kaydı onun yerine geçmek yerine yanında okunabilir tut ve kimliği hangi yöntemin çözdüğünü kaydet",
      },
      "c.eligible": {
        headline: "Artık bilinen profil bir yaşam döngüsüne girmeye uygun mu?",
        edges: [
          {
            label: "Uygun",
            detail:
              "aday yaşam döngüsünün uygunluk kuralları birleştirilmiş profilde geçerli ve bu yaşam döngüsünün yapacağı şey için yasal bir dayanak mevcut",
          },
          {
            label: "Uygun değil",
            detail:
              "uygunluk sağlanmıyor ya da iletişim için yasal bir dayanak yok - kimliğin çözüldüğü ama iznin hiç verilmediği sıradan durum dahil",
          },
        ],
      },
      "h.qualification": {
        // ACQ-05's own name (headline resolves through byId(n.to).name, a
        // cross-journey reference) - translated here as a display override
        // only, not a change to ACQ-05's own canonical data.
        headline: "Yeterlilik durumu değişikliği → yönlendir, tekrar yönlendir veya çıkış",
        detail: "bilinen, uygun bir profilin ilk kez yeterlilik sürecine girmesi",
      },
      "x.known-only": {
        headline: "bilinen profil, yaşam döngüsüne girilmedi",
        detail:
          "ACQ-06, altta yatan veri değiştiğinde uygunluğu yeniden değerlendirir; bilinir hale gelmek kendi başına nurture'ı başlatmaz",
      },
    },
  },
};

function localizedNode(node: FlowNode, override: NodeOverride | undefined): FlowNode {
  if (!override) return node;
  return {
    ...node,
    headline: override.headline ?? node.headline,
    detail: override.detail !== undefined ? override.detail : node.detail,
    edges: override.edges
      ? node.edges.map((e, i) => {
          const eo = override.edges![i];
          return eo ? { ...e, label: eo.label ?? e.label, detail: eo.detail !== undefined ? eo.detail : e.detail } : e;
        })
      : node.edges,
  };
}

/** Returns `detail` unchanged unless both `lang` is "tr" and this journey
    has an entry in OVERRIDES above - every other journey, and this same
    journey on the EN route, is untouched. */
export function localizedJourneyDetail(detail: JourneyDetail, lang: Lang): JourneyDetail {
  if (lang !== "tr") return detail;
  const override = OVERRIDES[detail.id];
  if (!override) return detail;
  return {
    ...detail,
    categoryTitle: override.categoryTitle ?? detail.categoryTitle,
    shortName: override.shortName ?? detail.shortName,
    name: override.name ?? detail.name,
    purpose: override.purpose ?? detail.purpose,
    nodes: detail.nodes.map((n) => localizedNode(n, override.nodes?.[n.id])),
  };
}
