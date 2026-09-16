import type { FlowNode, JourneyDetail } from "@/lib/canonical-view";
import type { Lang } from "@/lib/content";

/* JOURNEY CANVAS LOCALIZATION for the TR site - applied on top of the
   shared canonical projection at render time, never a change to
   canonical-view.ts's own (English, computed once at module load)
   derivation and never a change to canonical data, node order, branch
   structure or business logic. Two layers, both generic - neither reads a
   journey id to decide what to do, so nothing here is a per-journey
   special case:

   1. STRUCTURAL. Every journey's wait-edge labels, the fixed English
      prefixes canonical-view.ts's `nodeView` bakes into `meta` (evidence/
      requires/writes/carries/suppresses/the engagement-window sentence)
      and a wait's `timeout after ...` detail wrapper are mechanically
      composed by canonical-view.ts from a small, closed set of English
      templates - the same handful of strings on every journey in the
      library. Translating that closed set once, matched by its exact
      prefix rather than by journey id, fixes the "half English chip in an
      otherwise Turkish card" failure mode everywhere at once. Category
      titles are the other member of this layer: 26 titles, shared by
      every journey in that category, translated once here rather than
      once per journey.

   2. CONTENT. `OVERRIDES` below carries natural Turkish for the free
      prose canonical data authors per node - headline, detail, branch
      label and branch reason, plus the journey's own name/shortName/
      purpose. This is content, not code: a journey with no entry (or a
      node with no entry inside one) renders its structural layer
      translated and its own prose in English, same as it always has,
      rather than a hardcoded per-journey branch deciding what happens.
      Coverage is tracked by `TRANSLATION_COVERAGE` below rather than
      claimed silently - see that constant's own comment.

   ENGLISH ON THE EN ROUTE, always: `localizedJourneyDetail` returns
   `detail` unchanged for any lang other than "tr". */

/* ---------------------------------------------------------------- layer 1 */

/* Keyed by the exact English title `canonical-view.ts`'s CATEGORY_TITLE
   resolves to (JourneyDetail exposes only that resolved string, not the
   underlying CategoryId) - all 26 categories in the library, so this is a
   full, closed translation, not a partial lookup with an English
   fallback baked in for the ones missing. */
const CATEGORY_TITLE_TR: Readonly<Record<string, string>> = {
  "Acquisition, intent & qualification": "Kazanım, niyet ve yeterlilik",
  "Activation, onboarding & early value": "Aktivasyon, onboarding ve erken değer",
  "Engagement, health, retention & churn prevention": "Etkileşim, sağlık, elde tutma ve kayıp önleme",
  "Consent, preferences, communication & contactability": "Onay, tercihler, iletişim ve ulaşılabilirlik",
  "Feedback, advocacy, referral & relationship signals": "Geri bildirim, savunuculuk, referans ve ilişki sinyalleri",
  "Ownership, assignment, approval & decision authority": "Sahiplik, atama, onay ve karar yetkisi",
  "Time, deadlines, expiry & temporary states": "Zaman, son tarihler, süre dolumu ve geçici durumlar",
  "Access, entitlement, credentials & capability": "Erişim, yetki, kimlik bilgileri ve yetkinlik",
  "Identity, verification, authentication & account integrity": "Kimlik, doğrulama, kimlik denetimi ve hesap bütünlüğü",
  "Account structure, identity relationships & entity reconciliation": "Hesap yapısı, kimlik ilişkileri ve varlık eşleştirme",
  "Entity merge, account closure, data lifecycle & terminal states": "Varlık birleştirme, hesap kapatma, veri yaşam döngüsü ve nihai durumlar",
  "Integrations, synchronization, external systems & data consistency": "Entegrasyonlar, senkronizasyon, dış sistemler ve veri tutarlılığı",
  "Processing, queues, async work & operational reliability": "İşleme, kuyruklar, asenkron işler ve operasyonel güvenilirlik",
  "Transactions, payments, billing & financial outcomes": "İşlemler, ödemeler, faturalama ve finansal sonuçlar",
  "Orders, fulfillment, delivery & service completion": "Siparişler, teslimat, sevkiyat ve hizmet tamamlanması",
  "Returns, remedies, corrections & post-completion recovery": "İadeler, düzeltmeler, telafiler ve tamamlanma sonrası kurtarma",
  "Subscriptions, contracts, renewals & continuing relationships": "Abonelikler, sözleşmeler, yenilemeler ve süregelen ilişkiler",
  "Scheduling, appointments, reservations & time-bound commitments": "Randevu, rezervasyon ve süreye bağlı taahhütler",
  "Approvals, decisions, reviews & human-in-the-loop work": "Onaylar, kararlar, incelemeler ve insan katılımlı işler",
  "Risk, policy, compliance & exception management": "Risk, politika, uyumluluk ve istisna yönetimi",
  "Notifications, communications, delivery & contactability": "Bildirimler, iletişim, teslim ve ulaşılabilirlik",
  "Documents, records, signatures & versioned artifacts": "Belgeler, kayıtlar, imzalar ve sürümlenmiş dokümanlar",
  "Data change, import, migration & state transformation": "Veri değişikliği, içe aktarma, taşıma ve durum dönüşümü",
  "Ownership, delegation, transfer & multi-party control": "Sahiplik, devir, transfer ve çok taraflı kontrol",
  "Deployment, rollout, change & version transitions": "Dağıtım, yayına alma, değişiklik ve sürüm geçişleri",
  "Incidents, service disruption, operations & recovery": "Olaylar, hizmet kesintisi, operasyonlar ve kurtarma",
};

/** The exact English templates `canonical-view.ts`'s `nodeView` composes -
    kept in lockstep with that file's own literals (see its wait/trigger/
    action/handoff cases). Each entry is `[match, replacement]`; `match` is
    tried as an exact string first, then as a leading-prefix strip so the
    free variable that follows (a field name, a rule sentence, a config
    key) survives untouched - it is canonical content, not chrome, and
    stays whatever `OVERRIDES` below says or English if that has nothing
    for it. */
const EDGE_LABEL_TR: Readonly<Record<string, string>> = {
  "on event": "olay gerçekleşirse",
  "on timeout": "süre dolarsa",
};

const META_PREFIX_TR: readonly (readonly [string, string])[] = [
  ["evidence: ", "kanıt: "],
  ["not enough on its own: ", "tek başına yeterli değil: "],
  ["requires: ", "gerekli: "],
  ["carries: ", "taşır: "],
  ["suppresses: ", "bastırır: "],
];

const META_EXACT_TR: Readonly<Record<string, string>> = {
  "the window extends on engagement": "etkileşim olursa pencere uzar",
  "engagement does not extend the window": "etkileşim pencereyi uzatmaz",
};

/** `writes <field> (<mode>)` - the one meta template with the free
    variable in the MIDDLE rather than after a fixed prefix. */
const WRITES_RE = /^writes (.+) \((.+)\)$/;

function localizeMeta(m: string): string {
  if (META_EXACT_TR[m]) return META_EXACT_TR[m];
  for (const [prefix, tr] of META_PREFIX_TR) if (m.startsWith(prefix)) return tr + m.slice(prefix.length);
  const writes = WRITES_RE.exec(m);
  if (writes) return `${writes[1]} alanına yazar (${writes[2]})`;
  return m;
}

/** `timeout after <configText>` - `configText` (src/canonical/config-text.ts)
    wraps a node's own `rule` sentence with an optional "(recommended: ...;
    configure <key>)" / "(<key> ayarlanmalı)" suffix. Only the fixed English
    words of that wrapper are translated here; the embedded `rule` sentence
    is canonical content and is whatever `OVERRIDES` supplies. */
function localizeWaitDetail(detail: string): string {
  let out = detail;
  if (out.startsWith("timeout after ")) out = "zaman aşımı: " + out.slice("timeout after ".length);
  out = out.replace(/\(recommended: /g, "(önerilen: ").replace(/\(example: /g, "(örnek: ");
  out = out.replace(/; configure ([\w.]+)\)/g, "; şunu ayarla: $1)");
  out = out.replace(/\(configure ([\w.]+)\)/g, "($1 ayarlanmalı)");
  return out;
}

/** Layer 1, applied to every node of every journey on the TR route,
    override or none. */
function localizeStructural(node: FlowNode): FlowNode {
  return {
    ...node,
    detail: node.kind === "wait" && node.detail ? localizeWaitDetail(node.detail) : node.detail,
    meta: node.meta.map(localizeMeta),
    edges: node.edges.map((e) => (e.label && EDGE_LABEL_TR[e.label] ? { ...e, label: EDGE_LABEL_TR[e.label] } : e)),
  };
}

/* ------------------------------------------------------------------ layer 2 */

/* Hand-translated Turkish text for the free prose canonical data authors
   per node - headline, detail, branch label and branch reason, plus a
   journey's own name/shortName/purpose. Only the fields actually visible
   on the canvas + floating title card are covered (the Info tab's deeper
   technical fields - eligibility, suppressions, guardrails, reusableRule,
   distinctFrom - are not part of this pass and stay English even for a
   journey listed here). A journey or node with no entry renders its
   structural layer translated and its own prose in English, exactly as
   before this pass existed. */

type EdgeOverride = { label?: string; detail?: string };
type NodeOverride = { headline?: string; detail?: string; edges?: readonly (EdgeOverride | undefined)[] };
type JourneyOverride = {
  shortName?: string;
  name?: string;
  purpose?: string;
  nodes?: Readonly<Record<string, NodeOverride>>;
};

const OVERRIDES: Readonly<Record<string, JourneyOverride>> = {
  "ACQ-01": {
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

/** How many of the 160 public journeys carry a content override above, for
    an honest count rather than a silent claim - read by scripts/tooling,
    not by any page. */
export const TRANSLATION_COVERAGE = { journeysCovered: Object.keys(OVERRIDES).length } as const;

function localizeNodeContent(node: FlowNode, override: NodeOverride | undefined): FlowNode {
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

/** Applies both layers for `lang === "tr"`; returns `detail` unchanged for
    every other lang. Reads only `detail.id` and each node's own `id` as
    table keys - there is no `if (journey.id === ...)` branch anywhere in
    this file or its call sites. */
export function localizedJourneyDetail(detail: JourneyDetail, lang: Lang): JourneyDetail {
  if (lang !== "tr") return detail;
  const override = OVERRIDES[detail.id];
  const structured = detail.nodes.map((n) => localizeStructural(n));
  return {
    ...detail,
    categoryTitle: CATEGORY_TITLE_TR[detail.categoryTitle] ?? detail.categoryTitle,
    shortName: override?.shortName ?? detail.shortName,
    name: override?.name ?? detail.name,
    purpose: override?.purpose ?? detail.purpose,
    nodes: structured.map((n) => localizeNodeContent(n, override?.nodes?.[n.id])),
  };
}
