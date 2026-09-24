import type { FlowNode, JourneyDetail } from "@/lib/canonical-view";
import { externalTargetName, splitExitState } from "@/lib/canonical-view";
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

   3. PRESETS. `PRESET_TR` near the bottom of the file. A preset
      (canonical `discovery.presets`) is the one shape the library renders
      that is NOT a journey and not a node, so it fitted neither key this
      file is built on and went untranslated everywhere it appears. Same
      discipline as layer 1's category titles: a closed map of every preset
      the public corpus declares, applied by one localizer at the boundary,
      throwing rather than falling back to English on a miss.

   ENGLISH ON THE EN ROUTE, always: every localizer here returns its
   argument unchanged for any lang other than "tr". */

/* ---------------------------------------------------------------- layer 1 */

/* Keyed by the exact English title `canonical-view.ts`'s CATEGORY_TITLE
   resolves to (JourneyDetail exposes only that resolved string, not the
   underlying CategoryId) - all 26 categories in the library, so this is a
   full, closed translation, not a partial lookup with an English
   fallback baked in for the ones missing. */
const CATEGORY_TITLE_TR: Readonly<Record<string, string>> = {
  "Acquisition, intent & qualification": "Edinim, niyet ve niteliklendirme",
  "Activation, onboarding & early value": "Etkinleştirme, ilk kullanım ve erken değer",
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

/** The one way a category title reaches a page in either locale.
 *
 *  LOUD, NOT SILENT, on a miss. `CATEGORY_TITLE_TR` above is a full, closed
 *  translation of every category in the library - that is the property its
 *  comment claims, and a `?? title` fallback here would quietly turn the
 *  first uncovered category into English prose on a Turkish page, which is
 *  precisely the failure this file exists to prevent. So an uncovered title
 *  throws at render, the same way `journey-marketing.ts` throws at module
 *  load when a hard-referenced journey id disappears: a build that fails
 *  naming the string is cheaper than a page that ships it. */
export function localizedCategoryTitle(title: string, lang: Lang): string {
  if (lang !== "tr") return title;
  const tr = CATEGORY_TITLE_TR[title];
  if (!tr) {
    throw new Error(
      `journey-tr-overrides: no Turkish title for category "${title}". CATEGORY_TITLE_TR is a closed map of every category in the library - add the translation there rather than letting an English title reach a TR page.`,
    );
  }
  return tr;
}

/** The exact English templates `canonical-view.ts`'s `nodeView` composes -
    kept in lockstep with that file's own literals (see its wait/trigger/
    action/handoff cases). Each entry is `[match, replacement]`; `match` is
    tried as an exact string first, then as a leading-prefix strip so the
    free variable that follows (a field name, a rule sentence, a config
    key) survives untouched - it is canonical content, not chrome, and
    stays whatever `OVERRIDES` below says or English if that has nothing
    for it. */
const EDGE_LABEL_TR: Readonly<Record<string, string>> = {
  "on event": "event gerçekleşirse",
  "on timeout": "süre dolarsa",
};

const META_PREFIX_TR: readonly (readonly [string, string])[] = [
  ["evidence: ", "kanıt: "],
  ["not enough on its own: ", "tek başına yeterli değil: "],
  ["requires: ", "gerekli: "],
  ["carries: ", "taşır: "],
  ["suppresses: ", "baskılama: "],
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
  if (out.startsWith("timeout after ")) out = "timeout: " + out.slice("timeout after ".length);
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

/* Turkish text for the free prose canonical data authors per node -
   headline, detail, branch label and branch reason, plus a journey's own
   name/shortName/purpose - covering all 160 public journeys (translated
   in parallel per canonical domain file, then verified: every journey/
   node/edge count and id matched its English source exactly, and every
   translated field differs from its English source - no leftover
   untranslated string). Only the fields actually visible on the canvas +
   floating title card are covered (the Info tab's deeper technical
   fields - eligibility, suppressions, guardrails, reusableRule,
   distinctFrom - are not part of this pass and stay English even for a
   journey listed here). A journey or node with no entry here (there
   should be none among the 160) renders its structural layer translated
   and its own prose in English. Wait-node edge labels are deliberately
   NOT carried in this table even though the source translation included
   them - "on event"/"on timeout" are handled once, uniformly, by
   EDGE_LABEL_TR above, so 23 independently-translated batches can never
   disagree with each other on that one phrase. */

type EdgeOverride = { label?: string; detail?: string };
type NodeOverride = {
  headline?: string;
  detail?: string;
  edges?: readonly (EdgeOverride | undefined)[];
  /* The four canonical fields below are NOT on the canvas card - they are
     `TriggerNode.evidence` and `WaitNode.timeout.reason`/`until`, which
     canonical-view.ts folds into `meta` behind a fixed English prefix
     (`requires: `, `not enough on its own: `) or a generated event text.
     Layer 1 translates those prefixes; the values after them are canonical
     prose and have never had a Turkish entry anywhere.

     The journey library's landing page quotes them directly - a trigger's
     evidence as two tiles, a wait's arms as chips - so they are authored
     here, in the file that owns TR journey content, keyed by the same node
     id as everything else, rather than in a second table beside the page
     that happens to render them. Positional, like `edges`: entry i is the
     translation of canonical entry i. */
  /** `TriggerNode.evidence.requires`, in canonical order. */
  requires?: readonly string[];
  /** `TriggerNode.evidence.insufficientAlone`, in canonical order. */
  insufficientAlone?: readonly string[];
  /** `WaitNode.until`, as the event registry renders each id, in order. */
  until?: readonly string[];
  /** `WaitNode.timeout.reason`. */
  timeoutReason?: string;
};
type JourneyOverride = {
  shortName?: string;
  name?: string;
  purpose?: string;
  nodes?: Readonly<Record<string, NodeOverride>>;
};

const OVERRIDES: Readonly<Record<string, JourneyOverride>> = {
  "SCH-303": {
  shortName: "Rezervasyon Ödeme Hatırlatması",
  name: "Ödeme koşuluna bağlı duran rezervasyon → hatırlatıldı → korundu, serbest bırakıldı ya da tahsilata devredildi",
  purpose: "Yalnızca bir ödeme hâlâ beklendiği için ayakta duran bir rezervasyonu korumak: sahibine neyin ödenmediğini ve rezervasyon koşullarının bu durumda ne yapacağını söyleyerek - ve asıl aksayan şey ödemenin kendisi olduğu anda aradan çekilerek.",
  nodes: {
    "t.outstanding": { headline: "Rezervasyonun ödemesi hâlâ bekliyor" },
    "c.standing": {
      headline: "Rezervasyon hâlâ ayakta mı ve yükümlülük hâlâ ödenmemiş mi?",
      edges: [
        { label: "Ayakta ve ödenmemiş", detail: "rezervasyon kayıtlı saatiyle onaylı durumda ve arkasındaki yükümlülük ne karşılanmış, ne feragat edilmiş, ne de iptal edilmiş" },
        { label: "Zaten karşılanmış", detail: "yükümlülüğün herhangi bir yoldan karşılandığı, feragat edildiği ya da iptal edildiği kayıtlı" },
        { label: "Artık ayakta değil", detail: "hiçbir şey gönderilmeden önce rezervasyon iptal edildi, taşındı ya da esaslı biçimde değişti" },
      ],
    },
    "c.sendable": {
      headline: "Ödenmemiş tutar bildirimi gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor: bu rezervasyona dair hizmet iletişimi izni, ulaşılabilir bir hedef, hizmet iletişim yoğunluğu sınıfı ve bu rezervasyonu şu anda tutan daha yüksek öncelikli bir rezervasyon-yaşam-döngüsü akışının bulunmaması" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor; hangi kapının durdurduğu gerekçe olarak kaydedilir" },
      ],
    },
    "a.remind": {
      headline: "Bu rezervasyona karşı hâlâ neyin ödenmediğini, rezervasyon koşullarının bunu hangi noktaya kadar beklediğini ve karşılanmazsa koşulların rezervasyona ne yapacağını söyle. Konu para değil, kişinin elindeki yer: bunu bir fatura gibi okuyan kişi mesajı bir kenara koyar, rezervasyonunun tehlikede olduğunu okuyan kişi harekete geçer",
    },
    "w.payment": {
      headline: "yükümlülük karşılanana, ödeme sistemi bir denemenin başarısız olduğunu bildirene ya da rezervasyon iptal edilene, taşınana veya esaslı biçimde değişene kadar",
      detail: "Zaman aşımı: rezervasyon koşullarının bu rezervasyon için kendi belirlediği son ödeme noktası. Bu akış o noktayı okur; kendisi asla bir nokta belirlemez ve hatırlatmanın gönderildiği anı bir saatin başlangıcı saymaz. (reservation_payment.due ayarlanmalı)",
    },
    "c.outcome": {
      headline: "Bekleme neyle sonuçlandı?",
      edges: [
        { label: "Rezervasyon korundu", detail: "rezervasyonun arkasındaki yükümlülüğün karşılandığı, feragat edildiği ya da iptal edildiği kayıtlı" },
        { label: "Ödemenin kendisi başarısız oldu", detail: "bu yükümlülüğe karşı bir deneme yapıldı ve ödeme sistemi denemenin başarısız olduğunu bildirdi" },
        { label: "Rezervasyon geri çekildi", detail: "rezervasyon iptal edildi, taşındı ya da esaslı biçimde değişti" },
      ],
    },
    "c.still": {
      headline: "Yeniden okunduğu hâliyle rezervasyon hâlâ ayakta mı?",
      edges: [
        { label: "Hâlâ risk altında", detail: "rezervasyon onaylı durumda ve arkasındaki yükümlülük son ödeme noktasında hâlâ karşılanmamış" },
        { label: "Bu arada karşılandı", detail: "pencere açıkken yükümlülük karşılandı, feragat edildi ya da iptal edildi" },
        { label: "Bu arada geri çekildi", detail: "pencere açıkken rezervasyon iptal edildi, taşındı ya da esaslı biçimde değişti" },
      ],
    },
    "c.sendable2": {
      headline: "Son bildirim gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor ve bu rezervasyonu tutan daha yüksek öncelikli bir rezervasyon-yaşam-döngüsü akışı yok; bu bildirim kişiye borçlu olunan bir bildirimdir, bu yüzden isteğe bağlı temas bütçesi onu durdurmaz" },
        { label: "Engellendi", detail: "sert bir kapı durduruyor; hangi kapının durdurduğu gerekçe olarak kaydedilir ve iletemeyecek başka bir yol zorlanmaz" },
      ],
    },
    "a.final": {
      headline: "Rezervasyonun şu andaki hâlini, hâlâ korunabileceği son noktayı ve o noktadan sonra koşulların ona ne yapacağını bildir. Burada serbest bırakma noktası ne ötelenir ne de yumuşatılır - son tarihin esnek olduğu söylenen kişiye iki kez yanlış şey söylenmiş olur",
    },
    "w.release": {
      headline: "yükümlülük karşılanana, ödeme sistemi bir denemenin başarısız olduğunu bildirene ya da rezervasyon iptal edilene, taşınana veya esaslı biçimde değişene kadar",
      detail: "Zaman aşımı: rezervasyon koşullarının yeri yeniden müsaitliğe bıraktığı nokta. O noktanın sahibi koşullardır; bu akış onu okur ve o noktada ne olduğunu bildirir. (reservation_payment.release ayarlanmalı)",
    },
    "c.outcome2": {
      headline: "Son pencere neyle sonuçlandı?",
      edges: [
        { label: "Rezervasyon korundu", detail: "rezervasyonun arkasındaki yükümlülüğün karşılandığı, feragat edildiği ya da iptal edildiği kayıtlı" },
        { label: "Ödemenin kendisi başarısız oldu", detail: "bu yükümlülüğe karşı bir deneme yapıldı ve ödeme sistemi denemenin başarısız olduğunu bildirdi" },
        { label: "Rezervasyon geri çekildi", detail: "rezervasyon iptal edildi, taşındı ya da esaslı biçimde değişti" },
      ],
    },
    "a.lapse": {
      headline: "Rezervasyonun serbest bırakıldığını, hiçbir yerin tutulmadığını ve kaydın şimdi ne gösterdiğini söyle. Sessizce kaybolan bir yer, o yerin hâlâ kendisinde olduğuna inanan biri tarafından gün geldiğinde fark edilir",
    },
    "a.record-no-action": {
      headline: "Bildirimi hangi kapının ve hangi aşamada durdurduğunu kaydet; böylece hiç uyarılmamış bir rezervasyon sessiz bir boşluk değil, ölçülen bir sonuç olur",
    },
    "h.payment-failure": {
      detail: "bu rezervasyonun yükümlülüğüne karşı yapılan ve ödeme sisteminin başarısız olduğunu bildirdiği bir deneme",
    },
    "x.kept": {
      headline: "Korundu",
      detail: "bu rezervasyona karşı yeni bir koşullu ödeme ya da aynı kişinin sonraki bir rezervasyonu kendi örneğini açar",
    },
    "x.released": {
      headline: "Serbest bırakıldı",
      detail: "yeni bir rezervasyon yeni bir örnektir; bu örnek asla canlandırılmaz, çünkü işaret ettiği yer artık bu kişiye ait değildir",
    },
    "x.superseded": {
      headline: "Geçersiz kaldı",
      detail: "onun yerine geçen rezervasyon kendi koşullarıyla kendi örneğini çalıştırır",
    },
    "x.no-action": {
      headline: "Bildirim gönderilmedi",
      detail: "aynı kişinin sonraki bir rezervasyonu kendi kapılarıyla değerlendirilir",
    },
  },
  },
  "SCH-304": {
  shortName: "Varış Öncesi Hazırlık",
  name: "Varış penceresi açıldı → gelmek için gerekenler → giriş yapıldı, gelindi ya da geçersiz kaldı",
  purpose: "Birine gelmenin gerçekte ne gerektirdiğini söylemek - nereye gideceğini ya da nasıl katılacağını, yanında ne bulunduracağını ve yola çıkmadan önce tamamlayabileceği adımı - ve bunu yalnızca zaten bilemeyeceği bir şeyi yanıtladığı yerde söylemek.",
  nodes: {
    "t.window": { headline: "Varış penceresi açıldı" },
    "c.standing": {
      headline: "Bu randevu hâlâ gidilecek bir şey mi?",
      edges: [
        { label: "Hâlâ ileride", detail: "rezervasyon kayıtlı saatiyle onaylı durumda ve planlanan saat henüz geçmedi" },
        { label: "İptal edildi ya da taşındı", detail: "rezervasyon iptal edildi, taşındı ya da esaslı biçimde değişti" },
        { label: "Çoktan başlamış", detail: "bu randevuya karşı varış ya da katılım hâlihazırda yetkili olarak kaydedilmiş" },
      ],
    },
    "c.sendable": {
      headline: "Varış bilgileri gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor, rezervasyon aktarmaya değer varış bilgileri taşıyor ve bu randevuyu tutan daha yüksek öncelikli bir rezervasyon-yaşam-döngüsü akışı yok" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor ya da rezervasyon, kişinin zaten sahip olmadığı hiçbir bilgi taşımıyor; gerekçe kaydedilir" },
      ],
    },
    "a.details": {
      headline: "Gelmenin ne gerektirdiğini söyle: yer ya da katılım yolu, yanında bulundurulacaklar ve rezervasyonun böyle bir adımı varsa yola çıkmadan önce tamamlanabilecek adım. Buradaki her şey gönderim anında rezervasyondan okunur; çünkü pencere açıldığında doğru olan bir tarif, insanın yanlış kapıya gitmesini sağlayan tariftir",
    },
    "w.checkin": {
      headline: "giriş adımı tamamlanana, rezervasyon iptal edilene, taşınana veya esaslı biçimde değişene ya da katılım kaydedilene kadar",
      detail: "Zaman aşımı: rezervasyonun bir giriş adımı varsa, bunun hatırlatılmaya değer olduğu, planlanan saatten önceki nokta. Bu nokta adımın kişinin kendisinden ne kadar zaman aldığına göre belirlenir, rezervasyonun ne kadar önceden yapıldığına göre değil. (pre_arrival.check_in_point ayarlanmalı)",
    },
    "c.resolved": {
      headline: "Giriş penceresi neyle sonuçlandı?",
      edges: [
        { label: "Giriş yapıldı", detail: "rezervasyonun gerektirdiği giriş adımı tamamlanmış olarak kayıtlı" },
        { label: "Rezervasyon değişti", detail: "rezervasyon iptal edildi, taşındı ya da esaslı biçimde değişti" },
        { label: "Zaten gelinmiş", detail: "bu randevuya karşı varış ya da katılım yetkili olarak kaydedilmiş" },
      ],
    },
    "c.owed": {
      headline: "Bu rezervasyonda hâlâ yapılması gereken bir giriş adımı var mı?",
      edges: [
        { label: "Hâlâ bekliyor", detail: "rezervasyon bir giriş adımı gerektiriyor, adım açık ve kayıt bunun tamamlandığını göstermiyor" },
        { label: "Bekleyen bir şey yok", detail: "rezervasyon hiçbir giriş adımı gerektirmiyor ya da kayıt adımın çoktan tamamlandığını gösteriyor" },
      ],
    },
    "c.sendable2": {
      headline: "Giriş hatırlatması gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor, bu randevu için temas bütçesi tükenmemiş ve bu randevuyu tutan daha yüksek öncelikli bir rezervasyon-yaşam-döngüsü akışı yok" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor ya da bütçe tükenmiş; hatırlatma zorlanmak yerine gerekçe kaydedilir" },
      ],
    },
    "a.checkin": {
      headline: "Varıştan önce hâlâ yapılması gereken tek adımı ve bunun önceden tamamlanabileceği son noktayı belirt. Tek adım, tek mesaj - yapacak tek şeyi olan birine varış bilgilerinin ikinci bir kopyası gönderildiğinde, ona yeni kısmı bulma işi verilmiş olur",
    },
    "w.dayof": {
      headline: "rezervasyon iptal edilene, taşınana veya esaslı biçimde değişene ya da katılım kaydedilene kadar",
      detail: "Zaman aşımı: planlanan saate yakın, daha önce bilinemeyecek olanın artık bilinebildiği nokta. Bu nokta, geç bir bilginin gönderilebileceği bir yer olsun diye vardır; bir şey gönderilsin diye değil. (pre_arrival.late_detail_point ayarlanmalı)",
    },
    "c.resolved2": {
      headline: "Son pencere neyle sonuçlandı?",
      edges: [
        { label: "Rezervasyon değişti", detail: "rezervasyon iptal edildi, taşındı ya da esaslı biçimde değişti" },
        { label: "Zaten gelinmiş", detail: "bu randevuya karşı varış ya da katılım yetkili olarak kaydedilmiş" },
      ],
    },
    "c.late": {
      headline: "Gelmekle ilgili, daha önce söylenemeyecek olan bir şey var mı?",
      edges: [
        { label: "Değişen ya da yeni bilinen bir şey var", detail: "rezervasyon artık bu akışın daha önce göndermediği bir varış bilgisi taşıyor - binanın içinde farklı bir yer, bir giriş talimatı, adı verilen bir kişi" },
        { label: "Yeni bir şey yok", detail: "rezervasyon, kişiye zaten söylenmemiş hiçbir şey taşımıyor; bu olağan durumdur ve bir başarısızlık değildir" },
      ],
    },
    "c.sendable3": {
      headline: "Geç gelen bilgi gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor, bu randevu için temas bütçesi tükenmemiş ve bu randevuyu tutan daha yüksek öncelikli bir rezervasyon-yaşam-döngüsü akışı yok" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor ya da bütçe tükenmiş; gerekçe kaydedilir" },
      ],
    },
    "a.late-detail": {
      headline: "Yalnızca ilk mesajdan sonra değişen ya da bilinir hâle geleni gönder ve hangi kısmın yeni olduğunu söyle. Tek bir yeni satırı taşımak için varış bilgilerinin tamamını tekrarlamak, kişiye farkı arama işi yükler ve çoğu kişi bunu yapmaz",
    },
    "a.record-no-action": {
      headline: "Teması hangi kapının durdurduğunu ya da söylenecek bir şey olmadığını ve bunun hangi aşamada olduğunu kaydet - böylece hiçbir şey almayan bir randevu sessiz bir boşluk değil, ölçülen bir sonuç olur",
    },
    "x.ready": {
      headline: "Hazır",
      detail: "süregelen bir taahhüdün bir sonraki randevusu kendi varış penceresini ve kendi örneğini açar",
    },
    "x.arrived": {
      headline: "Gelindi",
      detail: "bir sonraki randevu kendi varış penceresini ve kendi örneğini açar",
    },
    "x.superseded": {
      headline: "Geçersiz kaldı",
      detail: "onun yerine geçen randevu kendi planlanan saatinden kendi varış penceresini açar",
    },
    "x.overtaken": {
      headline: "Zamanı geçti",
      detail: "bir sonraki randevu kendi varış penceresini ve kendi örneğini açar",
    },
    "x.no-action": {
      headline: "Hiçbir şey gönderilmedi",
      detail: "bir sonraki randevu kendi kapılarıyla değerlendirilir",
    },
  },
  },
  "REM-305": {
  shortName: "Destek Talebi Alındı Bildirimi",
  name: "Hizmet talebi alındı → alındı bildirildi ya da zaten çözülmüştü → kapandı veya işi yürütene devredildi",
  purpose: "Bir sorunu bildiren kişiye, o talebin var olduğunu, bir sahibi bulunduğunu ve kaybolmadığını söylemek - bir kez, işlemsel olarak ve henüz kimsenin karar vermediği bir sonucu vaat etmeden.",
  nodes: {
    "t.received": { headline: "Hizmet talebi alındı" },
    "a.capture": {
      headline: "Talebi, kişinin geri okuyabileceği ve ekibin bulabileceği bir referansla kaydet: kimin bildirdiği, sorunu nasıl anlattığı, hangi kanaldan geldiği, ne zaman geldiği ve şu anda kimin sahiplendiği. Sahibi bir isim değil de bir kuyruk olan talep, kimsenin üstlenmediği taleptir",
    },
    "c.covered": {
      headline: "Bu sorunu zaten kapsayan açık bir talep var mı?",
      edges: [
        { label: "Zaten kapsanıyor", detail: "aynı kişiden gelen açık bir talep aynı sorunla ilgili" },
        { label: "Açık talep yok", detail: "bu kişiden gelen hiçbir açık talep bu sorunla ilgili değil" },
      ],
    },
    "a.attach": {
      headline: "Yeni anlatılanı, o sorun için zaten açık olan talebe ekle ve o talebin kendi alındı bildirimini geçerli bırak. İkinci bir talep açmak iki sahip, iki yanıt ve hangisine inanacağına karar vermeye çalışan bir kişi üretir",
    },
    "c.immediate": {
      headline: "Bu talep, alındığı anda çoktan çözülmüş müydü?",
      edges: [
        { label: "Alındığında çözülmüş", detail: "kayıt, talebin girişte çözülmüş olarak kapandığını ve onu neyin çözdüğünü gösteriyor" },
        { label: "Hâlâ açık", detail: "talep bir sahiple açık olarak kayıtlı ve karşısında herhangi bir çözüm yok" },
      ],
    },
    "c.sendable-now": {
      headline: "\"Zaten çözülmüş\" mesajı gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "sert kapılar bu amaçla iletişime izin veriyor ve iletişim noktası ulaşılabilir durumda" },
        { label: "Engellendi", detail: "sert bir kapı durduruyor; başka bir yol zorlanmak yerine hangi kapının durdurduğu gerekçe olarak kaydedilir" },
      ],
    },
    "a.resolved-now": {
      headline: "Bildirdikleri şeyin çoktan yapılmış olduğunu ve talebi hangi çözümün kapattığını, talebin başına ne geldiği olarak söyle. O çözüm paranın geri dönmesiyse, paranın kendisi burada anılmaz - tutar, zamanlama ve paranın hesaba geçip geçmediği finansal kaydın duyuracağı şeylerdir (FIN-302). Burada bir alındı bildirimi, artık var olmayan bir soruna ilgi göstereceğini vaat eder ve kişi o ilgiyi beklemeye başlar",
    },
    "c.sendable": {
      headline: "Alındı bildirimi gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "zorunlu kontroller bu amaçla iletişime izin veriyor ve iletişim noktası ulaşılabilir durumda; bu mesaj kişiye borçlu olunduğu için iletişim yoğunluğu limiti uygulanmaz" },
        { label: "Engellendi", detail: "sert bir kapı durduruyor; hangi kapının durdurduğu kaydedilir ve talep yine de sahibine ulaşır" },
      ],
    },
    "a.acknowledge": {
      headline: "Talebin var olduğunu, hangi referansla kayıtlı olduğunu, şu anda kimin sahiplendiğini ve bundan sonra ne olacağını söyle. Çözüm yok, hak ediş yok, kusur atfı yok - hiçbirine karar verilmedi ve burada yapılacak bir tahmin, kişinin sonradan herkesi bağlı tutacağı şey olur",
    },
    "w.window": {
      headline: "talep sahibi ekip ya da sistem tarafından çözülmüş olarak kaydedilene ya da talep sahibi talebini geri çekene kadar",
      detail: "Zaman aşımı: alındı bildiriminin kapsadığı süre - hiçbir şey olmadığı için başka bir şey söylememenin dürüst olduğu süre. Bu sürenin ardından talep sessiz değildir, yalnızca sahibi başkasıdır. (support_ack.window ayarlanmalı)",
    },
    "c.outcome": {
      headline: "Alındı bildirimi penceresi neyle sonuçlandı?",
      edges: [
        { label: "Çözüldü", detail: "talep, sahibi olan taraf tarafından çözülmüş olarak kayda geçti" },
        { label: "Geri çekildi", detail: "talep sahibi talebini geri çekti" },
      ],
    },
    "c.open": {
      headline: "Alındı bildirimi penceresi kapandığına göre talep hâlâ açık mı?",
      edges: [
        { label: "Hâlâ açık - tamamlanmış bir teslimat ya da hizmet sorunu", detail: "talep bir sahibe karşı açık olarak kayıtlı; ne bir çözüm ne de bir geri çekme var ve yetkili talep bağlamı, bunun tamamlanmış bir teslimatı ya da somut, çözülmemiş bir sorunu olan tamamlanmış bir hizmeti ilgilendirdiğini gösteriyor" },
        { label: "Hâlâ açık - başka bir konu", detail: "talep bir sahibe karşı açık olarak kayıtlı; ne bir çözüm ne de bir geri çekme var, ve tamamlanmış bir teslimatı ya da somut, çözülmemiş bir sorunu olan tamamlanmış bir hizmeti ilgilendirmiyor" },
        { label: "Pencere sürerken kapanmış", detail: "talep pencere kapanmadan önce çözülmüş olarak kaydedilmiş ve bu olay mutabakatla doğrulanmış" },
      ],
    },
    "c.sendable2": {
      headline: "Çözüm bildirimi gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "sert kapılar bu amaçla iletişime izin veriyor, iletişim noktası ulaşılabilir durumda ve kayıt talebi neyin kapattığını gerçekten taşıyor" },
        { label: "Engellendi", detail: "sert bir kapı durduruyor ya da kayıt, talebin kişiye anlatılabilecek hiçbir şey olmadan kapandığını gösteriyor; gerekçe kaydedilir" },
      ],
    },
    "a.resolution": {
      headline: "Talebin kapandığını ve bir çözüme ulaşıldığını, talep sahibinin sorunu anlattığı terimlerle söyle - hareket eden paranın terimleriyle değil; o FIN-302'ye aittir. Bu mesaj, talebin kendi durumu değiştiği için gönderilir; ikinci bir mesajın var olmasının tek nedeni budur",
    },
    "a.record-no-action": {
      headline: "Mesajı hangi kapının ve hangi aşamada durdurduğunu kaydet; böylece hiçbir şey duymayan bir talep sahibi sessiz bir boşluk değil, ölçülen bir sonuç olur - ve kimse bu sessizliği talebin hiç ulaşmadığı biçiminde okumaz",
    },
    "h.owner": {
      detail: "alındı bildirimi penceresi kapandığında hâlâ açık olan ve artık sorunun kendisinin tespit edilmesi gereken bir talep",
    },
    "x.resolved": {
      headline: "Çözüldü",
      detail: "aynı kişiden gelen başka bir talep kendi örneğidir; hiçbir şey açık değilken yeniden anlatılan aynı sorun yeni bir talep olarak girer",
    },
    "x.attached": {
      headline: "Bu sorun için zaten açık olan talebe eklendi",
      detail: "o talep sorun hâlâ ortadayken kapanırsa, sorunun bir sonraki anlatımı kendi kanıtıyla yeni bir talep olarak girer",
    },
    "x.withdrawn": {
      headline: "Talep sahibi tarafından geri çekildi",
      detail: "aynı sorunla ilgili yeni bir talep yeni bir örnektir; kişi bu konuda başka iletişim istemediğini söylemediyse",
    },
    "x.no-action": {
      headline: "Hiçbir mesaj gönderilmedi",
      detail: "aynı kişiden gelen sonraki bir talep kendi kapılarıyla değerlendirilir",
    },
    "x.owned": {
      headline: "Talep, işi sahiplenen ekipte; bu süreç bundan sonra hiçbir şey söylemiyor",
      detail: "aynı kişiden gelen sonraki bir talep kendi örneğidir; bu sürecin kendi alındı bildirimi ve damlama karşıtı kuralı ona da aynen uygulanır",
    },
  },
  },
  "ACQ-289": {
  shortName: "Yeniden Stokta Bildirimi",
  name: "Ürün alınamazken ilgi kaydedildi → ürün yeniden alınabilir oldu → bildirildi → satın alındı veya kapandı",
  purpose: "Bir ürünü satın alınamaz durumdayken isteyen kişiye, o ürünün yeniden alınabilir olduğunu bir kez söylemek - ve bunu yalnızca bu ilgi hâlâ gerçekten o kişinin ilgisiyken yapmak.",
  nodes: {
    "t.registered": { headline: "Ürün satın alınamazken ilgi kaydedildi" },
    "w.availability": {
      headline: "ürün yeniden satın alınabilir olana kadar",
      detail: "Zaman aşımı: satın alınamayan bir ürüne duyulan ilgi, ancak şirketin dürüstçe \"bu hâlâ bu kişinin ilgisi\" diyebildiği süre boyunca tutulmaya değer; o noktadan sonra örnek hiç bildirim gönderilmeden kapanır. (back_in_stock.interest_lifetime ayarlanmalı)",
    },
    "c.relevant": {
      headline: "Bu ilgi hâlâ bildirime değer mi?",
      edges: [
        { label: "Hâlâ isteniyor", detail: "ürün yeniden satın alınabilir durumda, bu kişinin ürünü aldığına dair bir kayıt yok ve ilgi geri çekilmemiş" },
        { label: "Zaten satın alınmış", detail: "bu kişinin ürünü satın aldığına dair yetkili bir kayıt mevcut" },
        { label: "Artık istenmiyor", detail: "kişi ilgisini geri çekti ya da ürün bildirim gönderilmeden önce yeniden satın alınamaz hâle geldi" },
      ],
    },
    "c.sendable1": {
      headline: "Push bildirimi gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor: ticari iletişim izni, ulaşılabilir bir push hedefi, promosyon iletişim yoğunluğu limiti, bu kişiyi şu anda tutan daha yüksek öncelikli bir ticaret-kurtarma akışının bulunmaması ve yürürlükte bekleme süresi olmaması" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor; hangi kapının durdurduğu gerekçe olarak kaydedilir" },
      ],
    },
    "a.alert-push": {
      headline: "Push ile bu kişinin istediği ürünün yeniden satın alınabilir olduğunu söyle ve doğrudan ürüne giden yolu ver. Rezerve stok, tutulan fiyat, indirim ya da platformun uygulamadığı bir son tarih iddia etme.",
    },
    "a.record-no-action1": {
      headline: "Push bildirimini hangi kapının durdurduğunu ve hangi ilgiye karşı olduğunu kaydet; böylece \"hiçbir şey yapılmadı\" sessiz bir boşluk değil, ölçülen bir sonuç olur",
    },
    "w.window1": {
      headline: "1 gün bekle",
      detail: "Zaman aşımı: push bildirimine - ya da onu durduran kapıya - akışın ürünü yeniden okuyup e-posta bildirimine geçmeden önce sabit bir pencere tanınır. (back_in_stock.window1 ayarlanmalı)",
    },
    "c.converted1": {
      headline: "Push bildirimi satın almaya ulaştı mı?",
      edges: [
        { label: "Satın alındı", detail: "push bildiriminden sonra bu kişinin ürünü satın aldığına dair yetkili bir kayıt mevcut" },
        { label: "Satın alınmadı", detail: "pencere içinde bu kişinin ürünü satın aldığına dair hiçbir kayıt yok" },
      ],
    },
    "c.sendable2": {
      headline: "E-posta bildirimi gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor: ticari iletişim izni, ulaşılabilir bir e-posta hedefi, promosyon iletişim yoğunluğu limiti, yürürlükte bekleme süresi olmaması, ürünün hâlâ satın alınabilir olması ve push bildiriminden bu yana bir satın alma kaydedilmemiş olması" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor; hangi kapının durdurduğu gerekçe olarak kaydedilir" },
      ],
    },
    "a.alert-email": {
      headline: "E-posta ile bu kişinin ilgilendiği ürünün yeniden satın alınabilir olduğunu söyle ve doğrudan ürüne giden yolu ver. Rezerve stok, tutulan fiyat, indirim ya da platformun uygulamadığı bir son tarih iddia etme.",
    },
    "a.record-no-action2": {
      headline: "E-posta bildirimini hangi kapının durdurduğunu ve hangi ilgiye karşı olduğunu kaydet",
    },
    "w.window2": {
      headline: "2 gün bekle",
      detail: "Zaman aşımı: e-posta bildirimine - ya da onu durduran kapıya - akışın ürünü yeniden okuyup SMS bildirimine geçmeden önce sabit bir pencere tanınır. (back_in_stock.window2 ayarlanmalı)",
    },
    "c.converted2": {
      headline: "E-posta bildirimi satın almaya ulaştı mı?",
      edges: [
        { label: "Satın alındı", detail: "e-posta bildiriminden sonra bu kişinin ürünü satın aldığına dair yetkili bir kayıt mevcut" },
        { label: "Satın alınmadı", detail: "pencere içinde bu kişinin ürünü satın aldığına dair hiçbir kayıt yok" },
      ],
    },
    "c.sendable3": {
      headline: "SMS bildirimi gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor: SMS'e özgü onay dâhil ticari iletişim izni, ulaşılabilir bir telefon hedefi, promosyon iletişim yoğunluğu limiti, yürürlükte bekleme süresi olmaması, ürünün hâlâ satın alınabilir olması ve e-posta bildiriminden bu yana bir satın alma kaydedilmemiş olması" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor; hangi kapının durdurduğu gerekçe olarak kaydedilir" },
      ],
    },
    "a.alert-sms": {
      headline: "SMS ile bu kişinin istediği ürünün tükenmeden önce yeniden satın alınabilir olduğunu söyle ve doğrudan ürüne giden yolu ver. Rezerve stok, tutulan fiyat, indirim ya da platformun uygulamadığı bir son tarih iddia etme.",
    },
    "a.record-no-action3": {
      headline: "SMS bildirimini hangi kapının durdurduğunu ve hangi ilgiye karşı olduğunu kaydet; denenecek başka kanal kalmadığı için akış burada kapanır",
    },
    "w.window3": {
      headline: "1 gün bekle",
      detail: "Zaman aşımı: SMS bildirimine, ardından gelen bir satın almanın dürüstçe ona bağlanabileceği kısa bir pencere tanınır; pencere kapandığında örnek de kapanır, denenecek dördüncü bir kanal yoktur. (back_in_stock.window3 ayarlanmalı)",
    },
    "c.converted3": {
      headline: "SMS bildirimi satın almaya ulaştı mı?",
      edges: [
        { label: "Satın alındı", detail: "SMS bildiriminden sonra bu kişinin ürünü satın aldığına dair yetkili bir kayıt mevcut" },
        { label: "Satın alınmadı", detail: "pencere içinde bu kişinin ürünü satın aldığına dair hiçbir kayıt yok" },
      ],
    },
    "x.purchased": {
      headline: "Satın alındı",
      detail: "bu ürün için yeni bir satın alınamazlık döneminde kaydedilen ilgi kendi örneğini açar",
    },
    "x.no-purchase": {
      headline: "Bildirildi, satın alınmadı",
      detail: "bu ürün için yeni bir satın alınamazlık döneminde kaydedilen ilgi, bekleme süresi dolduktan sonra kendi örneğini açar",
    },
    "x.expired": {
      headline: "İlgi, ürün geri gelmeden zaman aşımına uğradı",
      detail: "bu ürüne yeniden ilgi kaydedilmesi kendi saatiyle yeni bir örnek açar",
    },
    "x.closed": {
      headline: "İlgi kapandı",
      detail: "kişi başka bildirim istemediğini söylemediyse, bu ürün için yeni bir satın alınamazlık döneminde kaydedilen ilgi kendi örneğini açar",
    },
    "x.no-action": {
      headline: "Bildirim gönderilmedi",
      detail: "bu ürünün yeniden satın alınabilir hâle gelmesi kendi kapılarıyla yeniden değerlendirilir",
    },
  },
  },
  "RET-290": {
  shortName: "İlk Satın Almadan İkinci Satın Almaya",
  name: "İlk satın alma tamamlandı → tekrar satın alma penceresi beklendi → geri döndü, ikna oldu veya sona erdi",
  purpose: "Bir ilk satın almayı ikinciye çevirmek: ürünün kendi doğal tekrar satın alma süresini bekle, sonra bir sonraki satın alma için dürüstçe, iki kez teklif yap ve bu gerçekleştiği an dur.",
  nodes: {
    "t.first": { headline: "İlk satın alma tamamlandı" },
    "w.natural": {
      headline: "ürünün doğal tekrar satın alma süresi kadar",
      detail: "Zaman aşımı: ilk teklif, ürünün kendi doğal tekrar satın alma süresi geçene kadar bekler; böylece hiçbir zaman kendi başına yeniden satın alacak olan birine denk gelmez. (first_purchase_welcome.natural_repurchase_period ayarlanmalı)",
    },
    "c.returned1": {
      headline: "İkinci satın alma gerçekleşti mi?",
      edges: [
        { label: "Evet", detail: "bu kişinin ikinci satın almasına dair yetkili bir kayıt mevcut" },
        { label: "İlişki sona erdi", detail: "kişi iznini geri çekti ya da ilk satın alma iptal edildi veya tamamen geri alındı" },
        { label: "Hayır", detail: "ilk satın alma geçerli, ikinci bir satın alma kaydı yok ve yaşam döngüsü iletişimi izni hâlâ geçerli" },
      ],
    },
    "c.sendable": {
      headline: "Teklif gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim kontrolleri geçiliyor: yaşam döngüsü iletişimi izni var, ulaşılabilir bir kanal var, iletişim yoğunluğu limiti aşılmadı, kişiyi daha yüksek öncelikli bir akış tutmuyor ve işletmenin adını verebileceği bir öneri ya da teklif var" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor ya da adı verilebilecek bir şey yok; gerekçe kaydedilir" },
      ],
    },
    "a.touch1": {
      headline: "E-posta ile söyle: ilk satın almaya dayalı ilgili bir ürün ya da kategori önerisi, ve bir sonraki alışverişe yönelik sınırlı süreli bir teklif. Uydurulan hiçbir şey yok ve çoktan yeniden satın almış birine hiçbir şey gönderilmez.",
    },
    "w.window1": {
      headline: "3–5 gün bekle",
      detail: "Zaman aşımı: teklife, akışın satın alma kaydını yeniden okuyup SMS hatırlatmasına geçmeden önce sabit bir süre tanınır. (first_purchase_welcome.window1 ayarlanmalı)",
    },
    "c.returned2": {
      headline: "İkinci satın alma gerçekleşti mi?",
      edges: [
        { label: "Evet", detail: "bu kişinin ikinci satın almasına dair yetkili bir kayıt mevcut" },
        { label: "Hayır", detail: "bu kişi için ilk satın almadan sonra hiçbir satın alma kaydı yok" },
      ],
    },
    "c.sendable2": {
      headline: "Hatırlatma gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor, temas bütçesi tükenmemiş ve ilk temasta adı verilen teklif hâlâ geçerli" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor ya da teklif süresi doldu; gerekçe kaydedilir" },
      ],
    },
    "a.touch2": {
      headline: "SMS ile aynı teklif bitmeden son bir çağrı yap, aynı kullanım yoluyla birlikte. Uydurulan hiçbir şey yok ve çoktan yeniden satın almış birine hiçbir şey gönderilmez.",
    },
    "w.offer": {
      headline: "teklif süresi boyunca bekle",
      detail: "Zaman aşımı: hatırlatmaya, teklifin kendi süresi kadar bir eylem penceresi tanınır; ardından örnek sona erer, üçüncü bir temas yoktur. (first_purchase_welcome.offer_window ayarlanmalı)",
    },
    "c.returned3": {
      headline: "Satın aldı mı?",
      edges: [
        { label: "Evet", detail: "teklif penceresi içinde bu kişinin ikinci satın almasına dair yetkili bir kayıt mevcut" },
        { label: "Hayır", detail: "pencere içinde böyle bir kayıt yok" },
      ],
    },
    "a.record-no-action": {
      headline: "Hiçbir şeyin neden ve hangi aşamada gönderilmediğini kaydet; böylece \"hiçbir şey yapılmadı\" sessiz bir boşluk değil, ölçülen bir sonuç olur",
    },
    "x.returning": {
      headline: "Geri döndü",
      detail: "ilk satın alma kişi başına bir kez olur; ilişkiyi buradan sonra olağan elde tutma akışları devralır",
    },
    "x.prompted": {
      headline: "Bu yolculuk sona erdi",
      detail: "teklif yapıldı ve hatırlatıldı, geri dönülmedi; bu örnek yeniden açılmaz, teklifin daha sonra kabul edilip edilmediğini gözlemek olağan yaşam döngüsünün işidir",
    },
    "x.closed": {
      headline: "Teklif yapılmadan kapandı",
      detail: "geri alınan ilk satın alma yeniden geçerli olur ve izin geri gelirse kayıt yeniden değerlendirilir; aksi hâlde hiçbir şey yeniden açılmaz",
    },
    "x.no-action": {
      headline: "Hiçbir temas gönderilmedi",
      detail: "örnek yeniden açılmaz; teklifi engellenmiş bir kişiye daha sonra yeniymiş gibi teklif yapılmaz",
    },
  },
  },
  "FUL-291": {
  shortName: "Satın Alma Sonrası Takip",
  name: "Teslimat tamamlandı → işe yarayan bir sonraki adım gönderildi → takip edildi, devredildi veya gönderilmedi",
  purpose: "Borçlu olunan şey gerçekten ulaştıktan sonra, onu işe yarar kılan tek şeyi göndermek - nasıl başlanacağı, nasıl bakılacağı, mantıken ne geldiği - ve başka hiçbir şeyi.",
  nodes: {
    "t.completed": { headline: "Teslimatın tamamlandığı yetkili olarak doğrulandı" },
    "w.settle": {
      headline: "ulaşan şey kişinin eline geçene kadar",
      detail: "Zaman aşımı: takip mesajı, ulaşan şeyin kişinin eline makul olarak geçtiği ana kadar bekler; böylece kullanım rehberi gerçekten rehber olur, sipariş hakkında bir mesaj daha olmaz. (post_purchase_followup.settle ayarlanmalı)",
    },
    "c.state": {
      headline: "Takip mesajı hâlâ gönderilecek doğru şey mi?",
      edges: [
        { label: "Takip zamanı", detail: "tamamlanma geçerli, buna karşı açılmış bir sorun yok ve hizmet iletişimi izni hâlâ geçerli" },
        { label: "Açık bir sorun var", detail: "bu tamamlanmaya karşı bir sorun bildirilmiş" },
        { label: "Artık ulaşılamıyor", detail: "kişi bu tür iletişim için iznini geri çekti" },
      ],
    },
    "c.sendable": {
      headline: "Takip mesajı gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor ve teslim edilen şeye karşı gerçekten söylenmeye değer bir şey kayıtlı" },
        { label: "Söylenecek bir şey yok veya engellendi", detail: "bir kapı akışı durduruyor ya da teslim edilen şeye karşı işe yarar hiçbir şey kayıtlı değil; gerekçe kaydedilir" },
      ],
    },
    "a.followup": {
      headline: "Alınan şey için işe yarayan sonraki adımı gönder: kurulumu, bakımı ya da mantıken ondan sonra geleni. Durum bildirimi yok, görüş talebi yok, siparişin kendi onayının tekrarı yok.",
    },
    "a.record-no-action": {
      headline: "Neden takip mesajı gönderilmediğini ve hangi tamamlanmaya karşı olduğunu kaydet; böylece \"hiçbir şey yapılmadı\" sessiz bir boşluk değil, ölçülen bir sonuç olur",
    },
    "x.followed-up": {
      headline: "Takip edildi",
      detail: "bu kişi için sonraki bir tamamlanma kendi örneğini açar; bu örnek yeniden açılmaz",
    },
    "x.superseded": {
      headline: "Bir sorun nedeniyle devredildi",
      detail: "bu kişi için sonraki bir tamamlanma kendi örneğini açar; çözülen bir telafi bu örneği yeniden açmaz",
    },
    "x.closed": {
      headline: "Takip yapılmadan kapandı",
      detail: "izin geri gelirse sonraki bir tamamlanma yeniden uygun hâle gelir; bu örnek yeniden açılmaz",
    },
    "x.no-action": {
      headline: "Takip mesajı gönderilmedi",
      detail: "bu kişi için sonraki bir tamamlanma kendi örneğini açar",
    },
  },
  },
  "RET-292": {
  shortName: "İlk Satın Alma Yıl Dönümü",
  name: "İlk satın alma yapıldı → yıl dönümü aralığı beklendi → uygunluk kontrol edildi → kutlandı veya gönderilmedi",
  purpose: "Birinin ilk kez satın aldığı tarihin yıl dönümünü - ilişkinin kendi yaşını, ilk işleminden sayarak ve başka hiçbir şeyden değil - bir kez dile getirmek.",
  nodes: {
    "t.purchase": {
      headline: "İlk satın alma yapıldı",
    },
    "w.interval": {
      headline: "yıl dönümü aralığı geçene ya da hesap kapanana kadar",
      detail: "Zaman aşımı: ilişkinin kendi yapılandırılmış yıl dönümü aralığı, ilk satın almadan bu yana - daha erken değil, başka hiçbir saatte değil. (örnek: 1 yıl; şunu ayarla: first_purchase_anniversary.interval)",
    },
    "c.eligible": {
      headline: "Bu yıl dönümü hâlâ bizim kutlayacağımız bir şey mi?",
      edges: [
        { label: "Kutla", detail: "ilişki açık, ilk satın alma hâlâ geçerli, bu dönem daha önce kutlanmamış ve gönderim yolu geçiliyor" },
        { label: "İlişki sona ermiş", detail: "hesap kapalı, ilk satın alma tamamen geri alınmış ya da kişi bu tür iletişim için iznini geri çekmiş" },
        { label: "Gönderilemez", detail: "bir gönderim-yolu kapısı durduruyor ya da bu dönem zaten kutlanmış; gerekçe kaydedilir" },
      ],
    },
    "a.recognise": {
      headline: "İlişkinin ilk satın almadan bu yana ne kadar sürdüğünü push ile söyle ve kaydın desteklemediği hiçbir şeyi dile getirme. Gerçekten tanımlanmış olmadıkça ödül, seviye ya da ayrıcalıktan söz etme.",
    },
    "c.opened": {
      headline: "Kişi push'a karşılık uygulamayı açtı mı?",
      edges: [
        { label: "Açtı", detail: "kutlama hâlâ güncelken push'ın ardından bir uygulama oturumu geldi" },
        { label: "Açmadı", detail: "kutlama penceresi kapanana kadar push'ın ardından bir uygulama oturumu gelmedi" },
      ],
    },
    "a.show-in-app": {
      headline: "Aynı kutlamayı hesabın içinde göster - ilişkinin ilk satın almadan bu yana ne kadar sürdüğünü - kişi artık bunu görecek bir oturumdayken.",
    },
    "a.record-no-action": {
      headline: "Neden kutlama gönderilmediğini ve hangi dönem için olduğunu kaydet; böylece \"hiçbir şey yapılmadı\" sessiz bir boşluk değil, ölçülen bir sonuç olur",
    },
    "x.recognised": {
      headline: "Kutlandı",
      detail: "bu akış ilk satın alma yıl dönümünü, kendisini açan ilk satın alma olayından itibaren bir kez kutlar; yeni bir ilk satın alma tarihiyle birleştirilen ya da yeniden düzenlenen bir ilişki bu akışı kendi tetikleyicisinden yeniden başlatır",
    },
    "x.no-action": {
      headline: "Kutlama gönderilmedi",
      detail: "bu akış bu dönemi yeniden denemez; yeni bir ilk satın alma tarihiyle birleştirilen ya da yeniden düzenlenen bir ilişki bu akışı kendi tetikleyicisinden yeniden başlatır",
    },
    "x.closed": {
      headline: "Mesaj gönderilmeden kapandı",
      detail: "yeniden kurulan bir ilişki kendi ilk satın almasından tarihlenir ve bu akışı kendi tetikleyicisinden yeniden başlatır",
    },
  },
  },
  "RET-294": {
  shortName: "Çapraz Satış / Tamamlayıcı Teklif",
  name: "Tanımlı tamamlayıcısı olan satın alma → olgunlaştı → teklif edildi → alındı, reddedildi veya kapandı",
  purpose: "Kişinin zaten sahip olduğu bir şeyi gerçekten tamamlayan şeyi, ilk şey kullanılacak kadar zaman geçtikten sonra teklif etmek ve tamamlayıcı eline geçer geçmez susmak.",
  nodes: {
    "t.owned": { headline: "Tanımlı tamamlayıcısı olan bir satın alma yapıldı" },
    "w.maturation": {
      headline: "sahip olunan şey kullanılacak kadar zaman geçene kadar",
      detail: "Zaman aşımı: teklif, tamamladığı şeyin makul olarak teslim alınıp kullanıldığı ana kadar bekler; böylece tamamlayıcı, hâlâ yoldaki bir siparişe iliştirilmiş bir ek satış değil, gerçek bir sonraki adım olur. (next_offer.maturation ayarlanmalı)",
    },
    "c.opportunity": {
      headline: "Teklif etmeye değer bir tamamlayıcı sonraki adım hâlâ var mı?",
      edges: [
        { label: "Fırsat geçerli", detail: "kişi hâlâ ana ürüne sahip, tamamlayıcıya sahip değil, tanımlı ilişki hâlâ geçerli ve tamamlayıcı bu kişi için satın alınabilir ve izinli" },
        { label: "Zaten tamamlanmış", detail: "kişi o zamandan beri tamamlayıcıyı herhangi bir yoldan edinmiş" },
        { label: "Artık geçerli değil", detail: "tanımlı ilişki artık geçerli değil, tamamlayıcı satın alınamaz ya da bu kişi için izinli değil, veya izin geri çekilmiş" },
      ],
    },
    "c.sendable": {
      headline: "Teklif gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor: ticari iletişim izni, ulaşılabilir bir hedef, promosyon iletişim yoğunluğu limiti, bu kişiyi şu anda tutan daha yüksek öncelikli bir akışın bulunmaması ve yürürlükte bekleme süresi olmaması" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor; hangi kapının durdurduğu gerekçe olarak kaydedilir" },
      ],
    },
    "a.offer": {
      headline: "Teklifi, kişinin zaten sahip olduğu şeyin üzerine kur: tamamlayıcı, neyi tamamladığı ve onu eklemek için izlenecek yol. Rezerve stok, tutulan fiyat ya da indirim iddia etme; tamamlayıcının zorunlu olduğunu asla söyleme.",
    },
    "w.response": {
      headline: "tamamlayıcı satın alınana kadar",
      detail: "Zaman aşımı: teklife, tek bir hatırlatma düşünülmeden önce üzerine hareket edilebilecek bir pencere tanınır; o hatırlatmadan sonra zamanlanacak başka bir şey yoktur. (next_offer.response_window ayarlanmalı)",
    },
    "c.outcome": {
      headline: "Teklif kabul edildi mi?",
      edges: [
        { label: "Kabul edildi", detail: "bu kişinin tamamlayıcıyı satın aldığına dair yetkili bir kayıt mevcut" },
        { label: "Reddedildi", detail: "kişi tamamlayıcıyı istemediğini belirtti" },
        { label: "Henüz yanıt yok", detail: "tamamlayıcı hâlâ kişide değil ve reddedilmiş bir şey de yok" },
      ],
    },
    "c.sendable2": {
      headline: "Tek hatırlatma gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor ve temas bütçesi tükenmemiş" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor ya da bütçe tükenmiş; gerekçe kaydedilir" },
      ],
    },
    "a.remind": {
      headline: "Aynı sahip olunan ürüne karşı aynı teklifi bir kez hatırlat; ilkinde olmayan hiçbir şey ekleme.",
    },
    "a.record-no-action": {
      headline: "Hiçbir şeyin neden ve hangi aşamada gönderilmediğini kaydet; böylece \"hiçbir şey yapılmadı\" sessiz bir boşluk değil, ölçülen bir sonuç olur",
    },
    "x.complete": {
      headline: "Tamamlandı",
      detail: "kendi tanımlı tamamlayıcısı olan başka bir sahip olunan ürün kendi örneğini açar",
    },
    "x.declined": {
      headline: "Reddedildi",
      detail: "kendi tanımlı tamamlayıcısı olan başka bir sahip olunan ürün kendi örneğini açar; bu tamamlayıcı bir daha teklif edilmez",
    },
    "x.offered": {
      headline: "Teklif edildi ve hatırlatıldı",
      detail: "aynı tamamlayıcının aynı ürün için ne zaman yeniden teklif edilebileceğini bekleme süresi belirler",
    },
    "x.closed": {
      headline: "Kapandı",
      detail: "ürün ilişkisi ve izin geri gelirse, sonraki değerlendirmede ürün yeniden uygun hâle gelir",
    },
    "x.no-action": {
      headline: "Hiçbir temas gönderilmedi",
      detail: "kendi tanımlı tamamlayıcısı olan başka bir sahip olunan ürün kendi örneğini açar",
    },
  },
  },
  "RET-295": {
  shortName: "Doğum Günü Akışı",
  name: "Kişiye ait bir tarih kaydedildi → döngüsü beklendi → uygunluk kontrol edildi → kutlandı veya gönderilmedi",
  purpose: "Kişinin kendisine ait bir tarihi - bize kendi verdiği doğum gününü ya da kendi kaydının ulaştığı bir dönüm noktasını - bir kez dile getirmek ve tanımlanmamış hiçbir şeyi ona iliştirmemek.",
  nodes: {
    "t.recorded": { headline: "Kişiye ait bir tarih kaydedildi" },
    "w.cycle": {
      headline: "bu dönüm noktasının döngüsü gelene ya da izin geri çekilene kadar",
      detail: "Zaman aşımı: dönüm noktasının kendi döngüsü, kayıtlı tarihten bu yana - daha erken değil, başka hiçbir saatte değil. (örnek: 1 yıl; şunu ayarla: milestone_recognition.cycle)",
    },
    "c.date": {
      headline: "Bu tarih hâlâ bizim kutlayacağımız bir şey mi?",
      edges: [
        { label: "Kutla", detail: "tarih kişinin verdiği ya da kaydından türetilen bir tarih, ilişki açık, bu dönem daha önce kutlanmadı ve gönderim kontrolleri geçiliyor: amaç düzeyinde yaşam döngüsü izni var, ulaşılabilir bir kanal var, iletişim yoğunluğu limiti aşılmadı ve kişiyi daha yüksek öncelikli bir akış tutmuyor" },
        { label: "İlişki sona ermiş", detail: "hesap kapalı, kişi bu tür iletişim için iznini geri çekmiş ya da rahatsız edilmemeyi istemiş" },
        { label: "Dönem tükenmiş", detail: "bu dönem zaten kutlanmış ya da tarih geçmiş ve dönem mesaj gönderilmeden kapanmış" },
        { label: "Gönderilemez", detail: "bir gönderim yolu kapısı bunu durduruyor ya da daha yüksek öncelikli bir tarih kutlaması bu kişinin penceresini tutuyor; gerekçe kaydedilir" },
      ],
    },
    "a.recognise": {
      headline: "Tarihi ve neyi işaret ettiğini kişinin kendi diliyle bir e-postayla söyle; kaydın desteklemediği hiçbir şeyi dile getirme. Gerçekten tanımlanmış olmadıkça ödül, indirim, seviye ya da ayrıcalıktan söz etme.",
    },
    "a.record-no-action": {
      headline: "Neden kutlama gönderilmediğini ve hangi dönem için olduğunu kaydet; böylece \"hiçbir şey yapılmadı\" sessiz bir boşluk değil, ölçülen bir sonuç olur",
    },
    "x.recognised": {
      headline: "Kutlandı",
      detail: "bu akış bu dönüm noktasını, kendisini açan kayıt olayından itibaren bir kez kutlar; yeni bir tarihle birleştirilen ya da yeniden düzenlenen bir kayıt, ya da kişiye ait gerçekten farklı bir dönüm noktası, bu akışı kendi tetikleyicisinden yeniden başlatır",
    },
    "x.closed": {
      headline: "Mesaj gönderilmeden kapandı",
      detail: "izni geri gelen ve yeniden açılan bir ilişki, tarihin yeni bir kaydıyla bu akışı kendi tetikleyicisinden yeniden başlatır; rahatsız edilmemeyi isteyen kişi yeniden alınmaz",
    },
    "x.no-action": {
      headline: "Kutlama gönderilmedi",
      detail: "bu akış bu dönemi yeniden denemez; yeni bir tarihle birleştirilen ya da yeniden düzenlenen bir kayıt bu akışı kendi tetikleyicisinden yeniden başlatır",
    },
  },
  },
  "SUB-296": {
  shortName: "Sadakat Programı Karşılaması",
  name: "Üyelik açıldı → karşılandı → yönlendirildi, zaten kullanımda ya da kapandı",
  purpose: "Açılan bir üyeliği dürüstçe başlatmak: bugünden itibaren gerçekte neyi verdiği, nerede durduğu ve nasıl kullanıldığı - ürünün kendi onboarding'ini ya da ilk satın almanın kendi karşılamasını ödünç almadan.",
  nodes: {
    "t.enrolled": { headline: "Sadakat üyeliğine kayıt gerçekleşti" },
    "c.state": {
      headline: "Bu üyelik bizim karşılayacağımız bir üyelik mi?",
      edges: [
        { label: "Karşılama gerekli", detail: "üyelik aktif, bu üyeliğe karşı kayıtlı bir karşılama yok ve yaşam döngüsü iletişimi izni hâlâ geçerli" },
        { label: "Üyelik artık geçerli değil", detail: "kayıt geri alınmış, üyelik karşılama gönderilmeden iptal edilmiş ya da kişi iznini geri çekmiş" },
        { label: "Zaten karşılanmış", detail: "bu üyeliğe karşı kayıtlı bir karşılama zaten var" },
      ],
    },
    "c.sendable": {
      headline: "Karşılama gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim kontrolleri geçiliyor: yaşam döngüsü iletişimi izni var, ulaşılabilir bir kanal var, iletişim yoğunluğu limiti aşılmadı ve üyeliği daha yüksek öncelikli bir akış tutmuyor" },
        { label: "Engellendi", detail: "bir kapı durduruyor; hangi kapının durdurduğu gerekçe olarak kaydedilir" },
      ],
    },
    "a.welcome": {
      headline: "Bu üyeliğin bugünden itibaren neyi verdiğini, nerede durduğunu ve nasıl kullanıldığını, her iddiayı üyelik kaydından okuyarak söyle. Kaydın taşımadığı hiçbir şeyi adlandırma; sonra başlayan bir ayrıcalığı sonra başlıyor diye anlat.",
    },
    "w.benefit": {
      headline: "üyeliğin verdiği bir şey kullanılana ya da üyelik sona erene kadar",
      detail: "Zaman aşımı: yönlendirme, üyeliği kendi başına kullanacak olan bir üyenin buna fırsat bulacağı kadar bekler; kaydın açıklanmaya değecek kadar yeni olmaktan çıktığı noktadan öteye geçmez. (loyalty_welcome.orientation_window ayarlanmalı)",
    },
    "c.used": {
      headline: "Üyelik kullanıldı mı?",
      edges: [
        { label: "Zaten kullanımda", detail: "üyeliğin kendi kullanım kaydı, verdiği bir ayrıcalığın kullanıldığını gösteriyor" },
        { label: "Henüz değil", detail: "üyelik hâlâ aktif ve kullanım kaydı kayıttan bu yana kullanılmış hiçbir şey göstermiyor" },
      ],
    },
    "c.sendable2": {
      headline: "Yönlendirme gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor, temas bütçesi tükenmemiş ve üyelik kaydı hâlâ işaret edilecek kullanılmamış bir ayrıcalık taşıyor" },
        { label: "Engellendi", detail: "bir kapı durduruyor ya da üyelik artık işaret edilecek kullanılmamış bir ayrıcalık taşımıyor; gerekçe kaydedilir" },
      ],
    },
    "a.orient": {
      headline: "Üyeliğin hâlihazırda verdiği tek bir şeyi ve onu kullanma yolunu göster; her ikisini de göndermeden hemen önce üyelik kaydından yeniden oku. Hiçbir şey uydurma ve onu zaten kullanmış bir üyeye gönderme.",
    },
    "a.record-no-action": {
      headline: "Neden hiçbir şey gönderilmediğini ve hangi aşamada olduğunu kaydet; böylece \"hiçbir şey yapılmadı\" sessiz bir boşluk değil, ölçülen bir sonuç olur",
    },
    "x.settled": {
      headline: "Karşılandı ve üyelik kullanımda",
      detail: "bir üyeliğe bir kez kayıt olunur; buradan sonrasını olağan üyelik akışları sahiplenir",
    },
    "x.oriented": {
      headline: "Karşılandı ve yönlendirildi",
      detail: "bu örnek yeniden açılmaz; üyeliğin kullanılıp kullanılmadığı olağan üyelik akışlarının gözleyeceği bir şeydir",
    },
    "x.closed": {
      headline: "Karşılama gönderilmeden kapandı",
      detail: "kapandıktan sonra yeniden kayıt olunan bir üyelik yeni bir üyeliktir ve kendi örneğini açar",
    },
    "x.no-action": {
      headline: "Hiçbir temas gönderilmedi",
      detail: "örnek yeniden açılmaz; karşılaması engellenen bir üyelik sonradan yeniymiş gibi karşılanmaz",
    },
  },
  },
  "SUB-297": {
  shortName: "Sadakat Programı Besleme",
  name: "Üyelikte kullanılmamış bir şey duruyor → anlatıldı → kullanıldı, bir kez hatırlatıldı ya da kapandı",
  purpose: "Bir üyeye, kendi üyeliğinin onun için tuttuğu ve kullanmadığı şeyi söylemek - süren bir kadans olarak değil, sonu olan sınırlı bir plan olarak.",
  nodes: {
    "t.unused": { headline: "Üyelik, kullanılmamış bir değer tutuyor" },
    "c.valid": {
      headline: "Söylenecek gerçek bir şey hâlâ var mı?",
      edges: [
        { label: "Hâlâ kullanılmamış", detail: "üyelik aktif ve kaydı bu şeyin hâlâ tutulduğunu, bu üye tarafından kullanılabilir olduğunu ve kullanılmadığını gösteriyor" },
        { label: "Üyelik artık geçerli değil", detail: "üyelik sona ermiş ya da üye bu tür iletişim için iznini geri çekmiş" },
        { label: "Söylenecek bir şey kalmamış", detail: "konu kullanılmış, süresi dolmuş ya da artık bu üye tarafından kullanılabilir değil" },
      ],
    },
    "c.sendable": {
      headline: "Anlatım gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor: promosyon iletişimi izni, ulaşılabilir bir hedef, promosyon iletişim yoğunluğu limiti, bu üyeliği şu anda tutan daha yüksek öncelikli bir üyelik akışının bulunmaması ve yürürlükte bekleme süresi olmaması" },
        { label: "Engellendi", detail: "bir kapı durduruyor; hangi kapının durdurduğu gerekçe olarak kaydedilir" },
      ],
    },
    "a.explain": {
      headline: "Bu üyeliğin tuttuğu ve kullanılmamış olan şeyi, ne için kullanılabileceğini ve ne zamana kadar geçerli olduğunu, her parçasını göndermeden hemen önce üyelik kaydından okuyarak söyle.",
    },
    "c.expires": {
      headline: "Bu konunun, üyenin hâlâ vaktinde harekete geçebileceği bir son kullanma tarihi var mı?",
      edges: [
        { label: "Süresi doluyor", detail: "üyelik kaydı, konunun kullanılması gereken bir son noktayı taşıyor" },
        { label: "Son kullanma tarihi yok", detail: "üyelik kaydı, konunun kullanılması gereken bir son nokta taşımıyor" },
      ],
    },
    "x.explained": {
      headline: "anlatıldı; konunun bir son kullanma tarihi yok ve söylenecek başka bir şey kalmadı",
      detail: "kullanılmamış başka bir konu, bekleme süresi dolduktan sonra kendi örneğini açar",
    },
    "w.act": {
      headline: "şey kullanılana, üyelik sona erene ya da izin geri çekilene kadar",
      detail: "Zaman aşımı: son kullanma bildirimi, açıklamadan sonra sabit bir süre yerine konunun kendi son kullanma tarihinin yaklaşmasını bekler; şeyi son kullanma tarihinden önce kullanacak olan bir üye o ana kadar her olağan fırsatı bulmuş olur. (loyalty_nurture.response_window ayarlanmalı)",
    },
    "c.acted": {
      headline: "Üye kullandı mı?",
      edges: [
        { label: "Kullandı", detail: "üyelik kaydı konunun kullanıldığını gösteriyor" },
        { label: "Hâlâ kullanılmamış", detail: "üyelik aktif ve kaydı konunun hâlâ tutulduğunu ve kullanılmadığını gösteriyor" },
      ],
    },
    "c.sendable2": {
      headline: "Son kullanma bildirimi gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor ve temas bütçesi tükenmemiş" },
        { label: "Engellendi", detail: "bir kapı durduruyor ya da temas bütçesi tükenmiş; gerekçe kaydedilir" },
      ],
    },
    "a.expiry-notice": {
      headline: "Bu konunun ne zaman süresinin dolacağını, göndermeden hemen önce üyelik kaydından okuyarak söyle. Bu, açıklamadan farklı bir mesajdır ve bir süre geçtiği için değil, bir olgu değiştiği - son kullanma tarihinin yaklaşması - için gönderilir; bundan sonra ne olursa olsun planı kapat.",
    },
    "a.record-no-action": {
      headline: "Neden hiçbir şey gönderilmediğini ve hangi aşamada olduğunu kaydet; böylece \"hiçbir şey yapılmadı\" sessiz bir boşluk değil, ölçülen bir sonuç olur",
    },
    "x.used": {
      headline: "Kullanıldı",
      detail: "aynı üyelikte kullanılmamış başka bir konu, bekleme süresi dolduktan sonra kendi örneğini açar",
    },
    "x.nurtured": {
      headline: "Anlatıldı ve son kullanma bildirimi gönderildi",
      detail: "bu konu bir daha gündeme getirilmez; kullanılmamış başka bir konu, bekleme süresi dolduktan sonra kendi örneğini açar",
    },
    "x.closed": {
      headline: "Başka temas olmadan kapandı",
      detail: "geri gelen bir üyelik, izni de geri geldiyse, o anda kullanılmamış olarak ne tutuyorsa onun üzerinden değerlendirilir",
    },
    "x.no-action": {
      headline: "Hiçbir temas gönderilmedi",
      detail: "bu konu bu örnek altında bir daha gündeme getirilmez; kullanılmamış başka bir konu kendi örneğini açar",
    },
  },
  },
  "SUB-298": {
  shortName: "Ödül Onayı",
  name: "Ödül kazanıldı → kayıt doğrulandı → bir kez bildirildi ya da bildirilmeden kapandı",
  purpose: "Üyeliğin gerçekten ulaştığı bir durumu - kazanılmış, hesaba geçmiş ve kullanılabilir bir ödülü - kaydın söylediği gibi bildirmek ve kaydın söylemediği hiçbir şeyi bildirmemek.",
  nodes: {
    "t.earned": { headline: "Üyelik bir ödül kazandı" },
    "c.state": {
      headline: "Bu ödül üyeliğin gerçekten ulaştığı bir durum mu ve hâlâ bizim bildireceğimiz bir şey mi?",
      edges: [
        { label: "Bildir", detail: "ödül hesaba geçmiş, üyelik aktif, bu ödül kaydına karşı kayıtlı bir bildirim yok ve ulaşılabilir bir hedef mevcut" },
        { label: "Ulaşılmış bir durum değil", detail: "ödül bildirim gönderilmeden önce geri alınmış ya da düzeltilmiş, veya üyelik sona ermiş" },
        { label: "Gönderilecek bir şey yok", detail: "bu ödül kaydına karşı zaten bir bildirim kayıtlı ya da ulaşılabilir bir hedef yok; gerekçe kaydedilir" },
      ],
    },
    "a.confirm": {
      headline: "Neyin kazanıldığını, ne için kullanılabileceğini ve ne zamana kadar geçerli olduğunu, her parçasını ödül kaydından okuyarak söyle. Hiçbir teklif, öneri ya da bir sonrakini kazanmaya teşvik ekleme.",
    },
    "c.expires": {
      headline: "Bu ödülün, kullanılması gereken bir son tarihi var mı?",
      edges: [
        { label: "Süresi doluyor", detail: "ödül kaydı, ödülün kullanılması gereken bir son noktayı taşıyor" },
        { label: "Son tarih yok", detail: "ödül kaydı, ödülün kullanılması gereken bir son nokta taşımıyor" },
      ],
    },
    "w.act": {
      headline: "ödül kullanılana, üyelik sona erene ya da izin geri çekilene kadar",
      detail: "Zaman aşımı: son kullanma hatırlatması, onaydan sonra sabit bir süre yerine ödülün kendi son kullanma tarihinin yaklaşmasını bekler; ödülü son tarihinden önce kullanacak olan bir üye o ana kadar her olağan fırsatı bulmuş olur. (reward_confirmation.expiry_reminder ayarlanmalı)",
    },
    "c.used": {
      headline: "Üye ödülü kullandı mı?",
      edges: [
        { label: "Kullandı", detail: "ödül kaydı ödülün kullanıldığını gösteriyor" },
        { label: "Hâlâ kullanılmamış", detail: "üyelik aktif ve ödül kaydı ödülün hâlâ tutulduğunu ve kullanılmadığını gösteriyor" },
      ],
    },
    "c.sendable2": {
      headline: "Son kullanma hatırlatması gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor: hatırlatma için izin, ulaşılabilir bir hedef ve bu üyeliği şu anda tutan daha yüksek öncelikli bir üyelik akışının bulunmaması" },
        { label: "Engellendi", detail: "bir kapı durduruyor; gerekçe kaydedilir" },
      ],
    },
    "a.remind": {
      headline: "Bu ödülün süresinin dolacağını ve ne zaman dolacağını, göndermeden hemen önce ödül kaydından okuyarak söyle. Bu, onaydan farklı bir mesajdır - bir süre geçtiği için değil, son tarih yaklaştığı için gönderilir. Hiçbir teklif, öneri ya da bir sonrakini kazanmaya teşvik ekleme.",
    },
    "a.record-no-action": {
      headline: "Neden bildirim gönderilmediğini ve hangi ödül kaydına karşı olduğunu kaydet; böylece \"hiçbir şey yapılmadı\" sessiz bir boşluk değil, ölçülen bir sonuç olur",
    },
    "x.confirmed": {
      headline: "Bildirildi",
      detail: "aynı ödülün daha yeni bir yetkili durumu - düzeltme, geri alma, yeniden hesaba geçirme - kendi örneğini açar ve ne ise o olarak bildirilir",
    },
    "x.closed": {
      headline: "Bildirim gönderilmeden kapandı",
      detail: "aktif bir üyelikte yeniden geçerli kılınan bir ödül, kendi yeni kaydı üzerinden bildirilir",
    },
    "x.no-action": {
      headline: "Bildirim gönderilmedi",
      detail: "aynı ödül kaydı sonradan yeniymiş gibi bildirilmez; düzeltilmiş bir kayıt kendi örneğini açar",
    },
  },
  },
  "SUB-299": {
  shortName: "Sadakat Seviyesi Yükselmesi",
  name: "Seviye değişti → yön kontrol edildi → yükselme duyuruldu, kullanıldı ya da başka bir akışa bırakıldı",
  purpose: "Bir üyeye üyeliğinin kendi standının yukarı hareket ettiğini söylemek ve bu standın öncekinin vermediği neyi verdiğini tam olarak belirtmek - başka hiçbir şeyi değil.",
  nodes: {
    "t.changed": { headline: "Üyelik seviyesi değişti" },
    "c.direction": {
      headline: "Stand hangi yöne hareket etti ve yürürlükte mi?",
      edges: [
        { label: "Yukarı hareket etti ve yürürlükte", detail: "programın kendi sıralaması yeni standı öncekinin üzerine koyuyor, yeni stand yürürlükte ve bu üyelikte daha yeni bir seviye değişikliği yok" },
        { label: "Aşağı hareket etti", detail: "programın kendi sıralaması yeni standı öncekinin altına koyuyor" },
        { label: "Anlamlı bir hareket yok", detail: "stand değişmemiş, yatay, henüz yürürlükte değil ya da bu üyelikteki daha yeni bir değişiklikle geçersiz kılınmış" },
      ],
    },
    "c.sendable": {
      headline: "Duyuru gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim kontrolleri geçiliyor: yaşam döngüsü iletişimi izni var, ulaşılabilir bir kanal var, iletişim yoğunluğu limiti aşılmadı ve üyeliği daha yüksek öncelikli bir akış tutmuyor" },
        { label: "Engellendi", detail: "bir kapı durduruyor; hangi kapının durdurduğu gerekçe olarak kaydedilir" },
      ],
    },
    "a.announce": {
      headline: "Üyenin artık tuttuğu standı ve bu standın öncekinin vermediği neyi verdiğini, ikisini de programın kendi koşullarından okuyarak söyle. Önceki standın zaten verdiği hiçbir şeyi yeniymiş gibi sunma.",
    },
    "w.use": {
      headline: "yeni standın verdiği bir şey kullanılana ya da üyelik sona erene kadar",
      detail: "Zaman aşımı: pencere, yeni standı kullanmak isteyen bir üyenin bunun için olağan bir fırsat bulacağı kadar uzundur, daha fazlası değil; örneğin nasıl kaydedileceğine karar verir, başka bir mesaj gönderilip gönderilmeyeceğine değil. (loyalty_tier_change.adoption_window ayarlanmalı)",
    },
    "c.used": {
      headline: "Yeni stand kullanıldı mı?",
      edges: [
        { label: "Kullanıldı", detail: "üyeliğin kullanım kaydı, yeni standın verdiği bir ayrıcalığın yürürlüğe girmesinden bu yana kullanıldığını gösteriyor" },
        { label: "Kullanılmadı", detail: "pencere kapandı ya da üyelik sona erdi ve yeni standın verdiği hiçbir şey kullanılmadı" },
      ],
    },
    "a.record-no-action": {
      headline: "Neden duyuru gönderilmediğini ve hangi değişiklik kaydına karşı olduğunu kaydet; böylece \"hiçbir şey yapılmadı\" sessiz bir boşluk değil, ölçülen bir sonuç olur",
    },
    "x.adopted": {
      headline: "Duyuruldu ve kullanıldı",
      detail: "bu üyelikte yukarı yönlü başka bir hareket kendi örneğini açar",
    },
    "x.announced": {
      headline: "Duyuruldu",
      detail: "yukarı yönlü başka bir hareket kendi örneğini açar; bununla ilgili başka bir şey gönderilmez",
    },
    "x.out-of-scope": {
      headline: "Bu akışın konusu değil",
      detail: "bu üyelikte sonraki yukarı yönlü bir hareket kendi örneğini açar; aşağı yönlü hareket onu sahiplenen akışa bırakılır ve burada varsayılan olarak anlatılmaz",
    },
    "x.no-action": {
      headline: "Duyuru gönderilmedi",
      detail: "bu değişiklik kaydı sonradan güncelmiş gibi duyurulmaz; daha yeni bir değişiklik kendi örneğini açar",
    },
  },
  },
  "ACQ-287": {
  shortName: "Checkout Tamamlama Kurtarma",
  name: "Ödeme süreci başladı → tamamlanmadı → satın alma veya çıkış",
  purpose: "Checkout'u başlatıp tamamlamayan kişiyi geri getiren bir hatırlatma dizisi kurmak; en yüksek değerli checkout'larda daha doğrudan bir kanala geçmek ve satın alma zaten gerçekleştiyse bir daha mesaj göndermemek.",
  nodes: {
    "t.started": { headline: "Ödeme süreci başladı" },
    "w.first": {
      headline: "checkout tamamlanana kadar",
      detail: "Zaman aşımı: kişiye kendi başına tamamlaması için süre tanı. (örnek: 45 dakika; ayarla: checkout_abandonment.first_check)",
    },
    "c.completed1": {
      headline: "Checkout şu anda ne durumda?",
      edges: [
        { label: "Tamamlandı", detail: "bu checkout örneği için yetkili bir satın alma veya sipariş kaydı mevcut" },
        { label: "Ödeme başarısız", detail: "bu checkout'a karşı bir ödeme hatası kaydedildi - başarısız bir ödeme terk anlamına gelmez" },
        { label: "İptal edildi veya süresi doldu", detail: "kişi checkout'u iptal etti ya da platform süresini doldurdu" },
        { label: "Tamamlanmadı", detail: "bu checkout örneği için hiçbir tamamlanma kaydı, ödeme hatası veya iptal/süre dolumu yok" },
      ],
    },
    "c.sendable1": {
      headline: "İlk hatırlatma gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor: ticari kurtarma iletişimi izni, ulaşılabilir bir hedef, promosyon iletişim yoğunluğu limiti, yürürlükte bir bekleme süresi bulunmaması ve ticaret-kurtarma çekişmesinde bu kişiyi şu anda daha yüksek öncelikli bir akışın tutmuyor olması" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor; hangi kapının durdurduğu gerekçe olarak kaydedilir" },
      ],
    },
    "a.record-no-action-t1": {
      headline: "İlk hatırlatmayı hangi kapının ve hangi checkout için durdurduğunu kaydet; böylece işlem yapılmaması sessiz bir yokluk değil, ölçülen bir sonuç olur",
    },
    "x.purchased": {
      headline: "Satın Alma Tamamlandı",
      detail: "kişi için yeni bir checkout kendi örneğini açar; bu örnekle ilgili hiçbir şey yeniden açılmaz",
    },
    "x.invalid": {
      headline: "Tamamlanmadan Kapandı",
      detail: "iptal edildi ya da süresi doldu; başka hiçbir şey gönderilmez - yeni bir checkout kendi örneğini açar",
    },
    "a.router1": {
      headline: "Bu hatırlatmanın gerçekten ulaşabileceği en yüksek öncelikli kanalı seç: önce push (geçerli, güncel bir push jetonu kayıtlıysa), yoksa e-posta (geçerli, ulaşılabilir bir e-posta adresi kayıtlıysa). Hiçbir kanal ulaşılabilirlik testini geçemezse, kanal bulunamadığını kaydet ve mesaj göndermeden doğrudan sonraki bekleme adımına geç.",
    },
    "a.reminder1": {
      headline: "Az önce seçilen kanal üzerinden ilk checkout hatırlatmasını gönder; kişiyi başladığı checkout'a, o anki durumuyla geri yönlendir.",
    },
    "w.second": {
      headline: "checkout tamamlanana kadar",
      detail: "Zaman aşımı: ilk hatırlatmanın gerçekten işe yarayıp yaramadığını görmek için yeterli süre tanı, ikinci ve daha doğrudan bir temasın gerekip gerekmediğine ondan sonra karar ver. (örnek: 6 saat; ayarla: checkout_abandonment.second_check)",
    },
    "c.completed2": {
      headline: "Checkout şu anda ne durumda?",
      edges: [
        { label: "Tamamlandı", detail: "bu checkout örneği için yetkili bir satın alma veya sipariş kaydı mevcut" },
        { label: "Ödeme başarısız", detail: "bu checkout'a karşı bir ödeme hatası kaydedildi - başarısız bir ödeme terk anlamına gelmez" },
        { label: "İptal edildi veya süresi doldu", detail: "kişi checkout'u iptal etti ya da platform süresini doldurdu" },
        { label: "Tamamlanmadı", detail: "bu checkout örneği için hiçbir tamamlanma kaydı, ödeme hatası veya iptal/süre dolumu yok" },
      ],
    },
    "c.highvalue": {
      headline: "Yüksek değerli bir checkout mu?",
      edges: [
        { label: "Yüksek değerli", detail: "checkout değeri, uygulayan şirketin yapılandırdığı yüksek-değer eşiğinin üzerinde veya eşitidir - burada hiçbir değer belirtilmez" },
        { label: "Standart", detail: "checkout değeri yapılandırılan eşiğin altındadır" },
      ],
    },
    "c.sendable2-hv": {
      headline: "Yüksek değerli ikinci hatırlatma gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor: ticari kurtarma iletişimi izni, ulaşılabilir bir hedef, promosyon iletişim yoğunluğu limiti, yürürlükte bir bekleme süresi bulunmaması ve ticaret-kurtarma çekişmesinde bu kişiyi şu anda daha yüksek öncelikli bir akışın tutmuyor olması" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor; hangi kapının durdurduğu gerekçe olarak kaydedilir" },
      ],
    },
    "c.sendable2-std": {
      headline: "İkinci hatırlatma gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor: ticari kurtarma iletişimi izni, ulaşılabilir bir hedef, promosyon iletişim yoğunluğu limiti, yürürlükte bir bekleme süresi bulunmaması ve ticaret-kurtarma çekişmesinde bu kişiyi şu anda daha yüksek öncelikli bir akışın tutmuyor olması" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor; hangi kapının durdurduğu gerekçe olarak kaydedilir" },
      ],
    },
    "a.record-no-action-t2": {
      headline: "İkinci hatırlatmayı hangi kapının ve hangi checkout için durdurduğunu kaydet; böylece işlem yapılmaması sessiz bir yokluk değil, ölçülen bir sonuç olur",
    },
    "a.router2-hv": {
      headline: "En öncelikli doğrudan kanalı seç: önce WhatsApp (geçerli bir telefon numarası kayıtlıysa ve numara WhatsApp üzerinden ulaşılabilirse), yoksa SMS (geçerli bir telefon numarası kayıtlıysa). Yüksek değerli bir checkout, ilk temasın bir tekrarını değil, daha doğrudan bir kanal alır. Hiçbir kanal ulaşılabilirlik testini geçemezse, kanal bulunamadığını kaydet ve mesaj göndermeden doğrudan sonraki bekleme adımına geç.",
    },
    "a.router2-std": {
      headline: "En yüksek öncelikli kanalı seç: önce push (geçerli, güncel bir push jetonu kayıtlıysa), yoksa e-posta (geçerli, ulaşılabilir bir e-posta adresi kayıtlıysa). Öncelik sırası ilk temasla aynıdır. Hiçbir kanal ulaşılabilirlik testini geçemezse, kanal bulunamadığını kaydet ve mesaj göndermeden doğrudan sonraki bekleme adımına geç.",
    },
    "a.reminder2-hv": {
      headline: "Az önce seçilen kanal üzerinden ikinci checkout hatırlatmasını gönder; yüksek değerli bir checkout'un gerektirdiği daha doğrudan üslubu kullan.",
    },
    "a.reminder2-std": {
      headline: "Az önce seçilen kanal üzerinden ikinci checkout hatırlatmasını gönder; kişiyi başladığı checkout'a, o anki durumuyla geri yönlendir.",
    },
    "w.third": {
      headline: "checkout tamamlanana kadar",
      detail: "Zaman aşımı: son hatırlatmaya tam bir gün tanı; bu sürenin sonunda checkout tamamlanmadıysa tamamlanmamış sayılır. (örnek: 24 saat; ayarla: checkout_abandonment.final_check)",
    },
    "c.completed3": {
      headline: "Kademenin sonunda checkout ne durumda?",
      edges: [
        { label: "Tamamlandı", detail: "bu checkout örneği için yetkili bir satın alma veya sipariş kaydı mevcut" },
        { label: "Ödeme başarısız", detail: "bu checkout'a karşı bir ödeme hatası kaydedildi - başarısız bir ödeme terk anlamına gelmez" },
        { label: "İptal edildi veya süresi doldu", detail: "kişi checkout'u iptal etti ya da platform süresini doldurdu" },
        { label: "Tamamlanmadı", detail: "bu checkout örneği için hiçbir tamamlanma kaydı, ödeme hatası veya iptal/süre dolumu yok" },
      ],
    },
    "x.abandoned": {
      headline: "Checkout Tamamlanmadı",
      detail: "kişi için yeni bir checkout başlangıcı kendi saatiyle yeni bir örnek açar; bu örnek yeniden açılmaz",
    },
  },
  },
  "ACQ-288": {
  shortName: "Sepet Terk Etme Kurtarma",
  name: "Sepete ürün eklendi → checkout başlamadı → satın alma, checkout'a devir veya terk",
  purpose: "Sepetine ürün ekleyip checkout'a geçmeyen kişiyi geri getiren bir hatırlatma dizisi kurmak; en yüksek değerli sepetlerde daha doğrudan bir kanala geçmek, checkout başlar başlamaz Checkout Abandonment'a devretmek ve satın alma zaten gerçekleştiyse bir daha mesaj göndermemek.",
  nodes: {
    "t.added": { headline: "Sepete ürün eklendi" },
    "w.first": {
      headline: "satın alma tamamlanana, checkout başlayana, sepet boşalana veya süresi dolana kadar",
      detail: "Zaman aşımı: kişiye sepete kendi başına dönmesi için süre tanı. (örnek: 2 saat; ayarla: cart_abandonment.first_check)",
    },
    "c.state1": {
      headline: "Sepet şu anda ne durumda?",
      edges: [
        { label: "Satın alındı", detail: "bu sepetten en az bir ürünü içeren yetkili bir satın alma veya sipariş kaydı mevcut" },
        { label: "Checkout başladı", detail: "bu sepetten yetkili bir checkout kaydı açıldı" },
        { label: "Boşaldı veya süresi doldu", detail: "kişi tüm ürünleri kaldırdı, sepeti sildi veya sepetin tutma ya da oturum süresi doldu" },
        { label: "Hâlâ duruyor", detail: "sepet, platformun hâlâ kullanılabilir saydığı en az bir ürünü tutuyor, hiçbir sipariş kaydedilmedi ve hiçbir checkout açılmadı" },
      ],
    },
    "c.sendable1": {
      headline: "İlk hatırlatma gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor: ticari kurtarma iletişimi izni, ulaşılabilir bir hedef, promosyon iletişim yoğunluğu limiti, kişi üzerinde daha yüksek öncelikli bir çakışma olmaması ve yürürlükte bir bekleme süresi bulunmaması" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor; hangi kapının durdurduğu gerekçe olarak kaydedilir" },
      ],
    },
    "a.record-no-action-t1": {
      headline: "İlk hatırlatmayı hangi kapının ve hangi sepet için durdurduğunu kaydet; böylece işlem yapılmaması sessiz bir yokluk değil, ölçülen bir sonuç olur",
    },
    "a.router1": {
      headline: "Bu hatırlatmanın gerçekten ulaşabileceği en yüksek öncelikli kanalı seç: önce push (geçerli, güncel bir push jetonu kayıtlıysa), yoksa e-posta (geçerli, ulaşılabilir bir e-posta adresi kayıtlıysa). Hiçbir kanal ulaşılabilirlik testini geçemezse, kanal bulunamadığını kaydet ve mesaj göndermeden doğrudan sonraki bekleme adımına geç.",
    },
    "a.reminder1": {
      headline: "Az önce seçilen kanal üzerinden ilk sepet hatırlatmasını gönder; sepeti şu anki hâliyle - platformun hâlâ kullanılabilir saydığı ürünleri ve güncel fiyatlarını - göster ve sepete dönüş bağlantısını ekle. Sistemin doğrulamadığı hiçbir şey iddia edilmez: rezerve stok, tutulan fiyat, indirim veya son tarih yok.",
    },
    "w.second": {
      headline: "satın alma tamamlanana, checkout başlayana, sepet boşalana veya süresi dolana kadar",
      detail: "Zaman aşımı: ilk hatırlatmanın gerçekten işe yarayıp yaramadığını görmek için yeterli süre tanı, ikinci ve daha doğrudan bir temasın gerekip gerekmediğine ondan sonra karar ver. (örnek: 20–24 saat; ayarla: cart_abandonment.second_check)",
    },
    "c.state2": {
      headline: "Sepet şu anda ne durumda?",
      edges: [
        { label: "Satın alındı", detail: "bu sepetten en az bir ürünü içeren yetkili bir satın alma veya sipariş kaydı mevcut" },
        { label: "Checkout başladı", detail: "bu sepetten yetkili bir checkout kaydı açıldı" },
        { label: "Boşaldı veya süresi doldu", detail: "kişi tüm ürünleri kaldırdı, sepeti sildi veya sepetin tutma ya da oturum süresi doldu" },
        { label: "Hâlâ duruyor", detail: "sepet, platformun hâlâ kullanılabilir saydığı en az bir ürünü tutuyor, hiçbir sipariş kaydedilmedi ve hiçbir checkout açılmadı" },
      ],
    },
    "c.highvalue": {
      headline: "Yüksek değerli bir sepet mi?",
      edges: [
        { label: "Yüksek değerli", detail: "sepetin değeri, uygulayan şirketin yapılandırdığı yüksek-değer eşiğinin üzerinde veya eşitidir - burada hiçbir değer belirtilmez" },
        { label: "Standart", detail: "sepetin değeri yapılandırılan eşiğin altındadır" },
      ],
    },
    "c.sendable2-hv": {
      headline: "Yüksek değerli ikinci hatırlatma gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor: ticari kurtarma iletişimi izni, ulaşılabilir bir hedef, promosyon iletişim yoğunluğu limiti, kişi üzerinde daha yüksek öncelikli bir çakışma olmaması ve yürürlükte bir bekleme süresi bulunmaması" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor; hangi kapının durdurduğu gerekçe olarak kaydedilir" },
      ],
    },
    "c.sendable2-std": {
      headline: "İkinci hatırlatma gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor: ticari kurtarma iletişimi izni, ulaşılabilir bir hedef, promosyon iletişim yoğunluğu limiti, kişi üzerinde daha yüksek öncelikli bir çakışma olmaması ve yürürlükte bir bekleme süresi bulunmaması" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor; hangi kapının durdurduğu gerekçe olarak kaydedilir" },
      ],
    },
    "a.record-no-action-t2": {
      headline: "İkinci hatırlatmayı hangi kapının ve hangi sepet için durdurduğunu kaydet; böylece işlem yapılmaması sessiz bir yokluk değil, ölçülen bir sonuç olur",
    },
    "a.router2-hv": {
      headline: "En öncelikli doğrudan kanalı seç: önce WhatsApp (geçerli bir telefon numarası kayıtlıysa ve numara WhatsApp üzerinden ulaşılabilirse), yoksa SMS (geçerli bir telefon numarası kayıtlıysa). Yüksek değerli bir sepet, ilk temasın bir tekrarını değil, daha doğrudan bir kanal alır. Hiçbir kanal ulaşılabilirlik testini geçemezse, kanal bulunamadığını kaydet ve mesaj göndermeden doğrudan sonraki bekleme adımına geç.",
    },
    "a.reminder2-hv": {
      headline: "Az önce seçilen kanal üzerinden ikinci sepet hatırlatmasını gönder; yüksek değerli bir sepetin gerektirdiği daha doğrudan üslubu kullan ve sepeti şu anki hâliyle göster.",
    },
    "a.router2-std": {
      headline: "En yüksek öncelikli kanalı seç: önce push (geçerli, güncel bir push jetonu kayıtlıysa), yoksa e-posta (geçerli, ulaşılabilir bir e-posta adresi kayıtlıysa). Öncelik sırası ilk temasla aynıdır. Hiçbir kanal ulaşılabilirlik testini geçemezse, kanal bulunamadığını kaydet ve mesaj göndermeden doğrudan sonraki bekleme adımına geç.",
    },
    "a.reminder2-std": {
      headline: "Az önce seçilen kanal üzerinden ikinci sepet hatırlatmasını gönder; sepeti şu anki hâliyle - platformun hâlâ kullanılabilir saydığı ürünleri ve güncel fiyatlarını - göster ve sepete dönüş bağlantısını ekle.",
    },
    "w.third": {
      headline: "satın alma tamamlanana, sepet boşalana veya süresi dolana kadar",
      detail: "Zaman aşımı: son hatırlatmaya iki tam gün tanı; bu sürenin sonunda satın alma tamamlanmadıysa sepet terk edilmiş sayılır. (örnek: 48 saat; ayarla: cart_abandonment.final_check)",
    },
    "c.state3": {
      headline: "Kademenin sonunda sepet ne durumda?",
      edges: [
        { label: "Satın alındı", detail: "bu sepetten en az bir ürünü içeren yetkili bir satın alma veya sipariş kaydı mevcut" },
        { label: "Boşaldı veya süresi doldu", detail: "kişi tüm ürünleri kaldırdı, sepeti sildi veya sepetin tutma ya da oturum süresi doldu" },
        { label: "Hâlâ duruyor", detail: "sepet, platformun hâlâ kullanılabilir saydığı en az bir ürünü tutuyor; başka hiçbir şey gönderilmez" },
      ],
    },
    "x.purchased": {
      headline: "Satın Alma Tamamlandı",
      detail: "kişi için yeni bir sepet kendi örneğini açar; bu örnekle ilgili hiçbir şey yeniden açılmaz",
    },
    "x.cleared": {
      headline: "Sepet Artık Aktif Değil",
      detail: "kişi için yeni bir sepete-ürün-eklendi olayı yeni bir örnek açar",
    },
    "x.abandoned": {
      headline: "Sepet Terk Edildi",
      detail: "kişi için yeni bir sepete-ürün-eklendi olayı kendi saatiyle yeni bir örnek açar; bu örnek yeniden açılmaz",
    },
    "h.checkout": {
      headline: "Ödeme süreci başladı → tamamlanmadı → satın alma veya çıkış",
      detail: "bu sepetten checkout başladı - o andan itibaren kurtarmayı Checkout Abandonment yürütür",
    },
  },
  },
  "ACC-261": {
  shortName: "Erişim Kısıtlama Bildirimi",
  name: "Erişim kısıtlandı veya sona eriyor → belirtilen geri dönüş yolu → geri yüklendi veya sona erdi",
  purpose: "Hesap sahibine hangi erişimin, ne zaman kaldırılacağını ve bunu geri getirecek tek koşulu bildirmek; böylece kısıtlama, sonradan fark edilen bir durum değil, üzerine hareket edilebilecek bir bilgi haline gelir.",
  nodes: {
    "t.restricted": { headline: "Erişim kısıtlaması veya sonlandırması kaydedildi" },
    "c.actionable": { headline: "Hak sahibi bu konuda bir şey yapabilir mi?", edges: [{ label: "Kendisi tarafından çözülebilir", detail: "serbest bırakma koşulu, hesap sahibinin karşılayabileceği bir şeydir - bir ödeme, bir belge, bir düzeltme, yeniden doğrulama" }, { label: "Çözümü kendisine bağlı değil", detail: "koşul, dahili bir incelemeye, üçüncü bir tarafa veya belirli bir sürenin geçmesine bağlıdır" }, { label: "Güvenlik müdahalesi tarafından uygulandı", detail: "kısıtlama, ne olduğunu ve neyin kısıtlandığını hesap sahibine zaten bildiren bir güvenlik müdahalesi tarafından uygulandı - aynı kısıtlama hakkında ikinci bir bildirim, birinciyle çakışır veya ona ters düşer" }] },
    "c.reachable": { headline: "Kendisine ulaşmak için izin verilen bir yol var mı?", edges: [{ label: "Ulaşılabilir", detail: "bu tür bir hizmet bildirimi için en az bir iletişim noktası geçerli ve izinli" }, { label: "Ulaşılamaz", detail: "amaç ve izin kontrollerinden geçen izinli bir yol yok" }] },
    "a.inform-only": { headline: "Neyin ne zamana kadar kısıtlandığını, herhangi bir eylem çağrısı eklemeden bildir - çünkü yapabilecekleri bir şey yok. Eylemin mümkün olmadığı bir durumda harekete geçmeye çağırmak suçlama gibi algılanır ve çözüm yerine destek başvurularına yol açar" },
    "x.security-owned": { headline: "kısıtlama güvenlik müdahalesi tarafından duyuruldu; ayrı bir bildirim gönderilmedi", detail: "güvenlik müdahalesinin sona ermesi veya kısıtlamayı sıradan bir kısıtlamaya dönüştürmesi, bunu kendi koşulları çerçevesinde burada yeniden değerlendirir" },
    "a.notify": { headline: "Neyin kısıtlandığını, neyin hâlâ çalıştığını, son tarihi ve kısıtlamayı kaldıracak tek koşulu açıkça belirt. Hâlâ çalışan şeyleri belirtmek, kişinin tüm ilişkinin sona erdiğini varsaymasını önler" },
    "h.unreachable": { headline: "Kanal ulaşılabilirliği değişikliği → ulaşılabilirliği yeniden hesaplama → yönlendirme veya engelleme", detail: "izinli hiçbir yoldan iletilemeyen bir kısıtlama bildirimi" },
    "w.resolve": { headline: "bu kısıtlamayı kaldırmak için kaydedilen koşul karşılanana, kısıtlama sahibi tarafından kaldırılana veya kısıtlama kalıcı hale getirilene kadar", detail: "Zaman aşımı: belirtilen son tarih veya gözden geçirme noktası. (yapılandırma: access_restriction.resolve)" },
    "c.outcome": { headline: "Sonuç ne oldu?", edges: [{ label: "Geri yüklendi", detail: "koşul karşılandı ve erişim geri geldi" }, { label: "Hâlâ kısıtlı", detail: "son tarih, koşul karşılanmadan geçti" }, { label: "Kalıcı hale getirildi", detail: "kısıtlama kalıcı hale getirildi; serbest bırakma koşulu artık geçerli değil" }] },
    "a.confirm": { headline: "Erişimin geri geldiğini doğrula ve neyin geri yüklendiğini belirt; böylece kişi, tamamen çözülmüş bir kısıtlama ile kısmi bir kısıtlama arasındaki farkı anlayabilir" },
    "x.stands": { headline: "kısıtlama son tarihinden sonra da geçerliliğini koruyor", detail: "koşul daha sonra karşılanırsa, geri yükleme süreci kaldırma olayından itibaren işler" },
    "x.restored": { headline: "geri yüklendi ve doğrulandı", detail: "aynı hesap üzerindeki sonraki bir kısıtlama yeni bir örnektir" },
    "x.permanent": { headline: "kısıtlama artık kalıcı; serbest bırakma koşulu artık geçerli değil", detail: "kısıtlamayı yeniden sınırlı bir hale dönüştüren daha sonraki bir inceleme, yeni bir örnektir" },
  },
  },
  "ACC-71": {
  shortName: "Hak Niteliği Belirleme",
  name: "Hak niteliği belirleme → verilme, ret veya beklemede",
  purpose: "Bir hakkın fiilen var olup olmadığını belirlemek; bu, o hak için uygun olmaktan veya ona yönelik ödeme yapmış olmaktan ayrı bir durumdur.",
  nodes: {
    "t.basis": { headline: "Hak dayanağı değerlendirildi veya değişti" },
    "a.evaluate": { headline: "Yetkili dayanağı değerlendir - hakkı tesis eden kaydı, ona giden süreci değil. Önemli olan iş durumunun bu hakkın verildiğini onaylayıp onaylamadığıdır, buna ne kadar yaklaşıldığı değil" },
    "c.existing": { headline: "Bu hak için bu kapsamda halihazırda bir yetki mevcut mu?", edges: [{ label: "Zaten mevcut", detail: "önceki bir verilme aynı hakkı ve kapsamı kapsıyor" }, { label: "Yeni", detail: "bunu kapsayan mevcut bir verilme yok" }] },
    "a.reconcile": { headline: "İkinci bir hak vermek yerine kapsamı ve geçerliliği mevcut verilmeyle uyumlu hale getir. Aynı hak için iki ayrı verilme, iki son geçerlilik tarihi, iki iptal ve kimsenin okuyamayacağı bir durum yaratır" },
    "c.satisfied": { headline: "Bu hakkın gereksinimleri karşılanıyor mu?", edges: [{ label: "Karşılandı", detail: "yetkili dayanak hakkı tesis ediyor" }, { label: "Belirli bir gereksinim eksik", detail: "hak ilke olarak mevcut ancak belirli bir şey henüz karşılanmadı" }, { label: "Mevcut değil", detail: "bu hesap için gereksinimler karşılanamaz - eksik bir adım değil, yapısal bir dışlama söz konusu" }] },
    "x.reconciled": { headline: "mevcut hak uyumlu hale getirildi; mükerrer verilme yapılmadı", detail: "dayanakta yaşanacak yeni bir değişiklik, uyumlu hale getirilen verilmeye karşı bunu yeniden açar" },
    "a.grant": { headline: "VERİLDİ durumunu, onu tesis eden dayanak, kapsadığı alan ve geçerlilik süresiyle birlikte kaydet. Verme işlemi idempotenttir - aynı dayanak iki kez gelse bile tek bir verilme oluşur" },
    "x.pending": { headline: "GEREKSİNİM_BEKLİYOR; hak ulaşılabilir durumda ancak henüz elde edilmemiş", detail: "belirtilen gereksinimin karşılanması bunu yeniden açar. Beklemede ve reddedildi durumları birbirinden ayrı tutulur çünkü geri dönüş yolu farklıdır - biri bir adımın tamamlanmasını, diğeri kuralların değişmesini gerektirir" },
    "x.denied": { headline: "REDDEDİLDİ; hak bu dayanakla mevcut değil", detail: "farklı bir dayanak - bir satın alma, bir rol, bir sözleşme - kendi koşulları çerçevesinde değerlendirilir" },
    "h.provision": { headline: "Hak verilmesi → sağlama → kullanılabilirliği doğrulama", detail: "bir hakkın tesis edilmesi" },
  },
  },
  "ACC-78": {
  shortName: "Erişim Askıya Alma",
  name: "Erişim askıya alma → kısıtlı durum → geri yükleme veya sonlandırma",
  purpose: "Tanımlanmış yetenekleri, bir gerekçeyle ve bu gerekçeyi karşılayacak en küçük kapsamda kısıtlamak; bunu yaparken geri yüklemeyi gerçekten mümkün tutmak.",
  nodes: {
    "t.suspension": { headline: "Yetkili askıya alma kararı" },
    "a.scope": { headline: "Gerekçeyi, kapsamı, ne zaman yürürlüğe gireceğini, hangi yeteneklerin engellendiğini, hangilerinin devam ettiğini ve neyin bu durumu sona erdireceğini kaydet. Kapsam, gerekçeyi karşılayacak en küçük kapsamdır - bir ödeme sorunu bir güvenlik ayarının engellenmesini haklı kılmaz; aşırı geniş bir kısıtlama, kısıtlamanın kendisini bir olay haline getirir" },
    "c.partial": { headline: "Erişilebilir kalan bir şey var mı?", edges: [{ label: "Kısmi", detail: "gerekçenin kapsamı dışındaki yetenekler etkilenmez" }, { label: "Tam", detail: "gerekçe, kapsamdaki her şeyin engellenmesini haklı kılıyor" }] },
    "a.preserve": { headline: "Etkilenmeyen yetenekleri çalışır durumda bırak; böylece durum bir kesinti değil, bir askıya alma olarak okunabilir olur - ve hak sahibi, durumu çözecek şeyi hâlâ yapabilir" },
    "a.full": { headline: "Etkilenen kapsam dahilinde, aynı gözden geçirme koşuluyla tam bir askıya alma kaydet. Tam askıya alma yine de kalıcı değildir ve kayıt bunu belirtir" },
    "w.suspension": { headline: "askıya almanın gerekçesi çözülene veya kalıcı bir karar kaydedilene kadar", detail: "Zaman aşımı: gözden geçirme noktası veya kayıtlı sona erme tarihi. (yapılandırma: access_suspension.suspension)" },
    "c.outcome": { headline: "Nasıl çözüldü?", edges: [{ label: "Gerekçe çözüldü", detail: "askıya almayı haklı kılan durum giderildi" }, { label: "Kalıcı karar", detail: "gözden geçirme, hakkın devam etmek yerine sona ermesi gerektiği sonucuna vardı" }] },
    "c.review": { headline: "Gözden geçirme noktasında hiçbir şey çözülmemişse şimdi ne olacak?", edges: [{ label: "Yeni bir bitiş tarihiyle uzat", detail: "gerekçe hâlâ geçerli ve politika ek bir süreye izin veriyor" }, { label: "Kaldır", detail: "resmi olarak hiçbir şey çözülmemiş olsa da gerekçe geçerliliğini yitirdi" }, { label: "Kimse karar vermedi", detail: "gözden geçirme noktasına hiçbir karar alınmadan gelindi" }] },
    "a.check-authority": { headline: "Bu askıya almayı kaldırmadan önce güncel hesap-kısıtlama-yetkisi durumunu yeniden oku: aynı exclusionGroup ve hesap üzerinde daha yüksek önceliğe sahip bir rakip süreç (şüpheli ihlal soruşturması, IDN-90) hâlâ açık mı? Bu askıya almanın kendi bildirilen önceliği IDN-90'ınkinden düşük ve onLoss değeri paused durumunda - IDN-90 açıkken bağımsız şekilde çözüme gitmek, daha acil ve güvenlik açısından kritik olan sorunun hâlâ kısıtladığı yetenekleri geri yükler; bu tam olarak onLoss: paused'ın önlemek için var olduğu, soruşturma sürerken erişimin geri yüklenmesi riskidir" },
    "h.terminate": { headline: "Hak kaybı → gelecekteki yeteneği iptal etme → mevcut yükümlülükleri uzlaştırma", detail: "hakkın sona ermesi gerektiği sonucuna varan bir gözden geçirme" },
    "a.extend": { headline: "Uzatmayı, yeni bir gözden geçirme noktasıyla kendi başına ayrı bir askıya alma örneği olarak kaydet; böylece birinin kaç kez karar alınmadan askıya alındığı, tek uzun bir kayıt içinde gizlenmek yerine sayılabilir kalır" },
    "h.escalate": { headline: "Sorumluluk yükseltme → üst makam → çözüm veya geri dönüş", detail: "hiçbir karar alınmadan ulaşılan bir askıya alma gözden geçirme noktası" },
    "c.authority-clear": { headline: "Bu hesap, daha yüksek önceliğe sahip bir hesap-kısıtlama-yetkisi rakibinden temiz mi?", edges: [{ label: "Temiz", detail: "bu hesap için şu anda açık bir IDN-90 örneği (veya bu exclusionGroup'un daha yüksek öncelikli başka bir üyesi) yok" }, { label: "Hâlâ tartışmalı", detail: "bu hesap için daha yüksek öncelikli bir rakip süreç hâlâ açık - bu askıya almanın kendi gerekçesi geçerliliğini yitirmiş olabilir, ancak hesabın kendisi henüz serbest bırakılmaya hazır değil" }] },
    "x.extended": { headline: "askıya alma uzatıldı; yeni gözden geçirme noktasını yeni bir örnek taşıyor", detail: "uzatma, kendi bitişiyle birlikte ayrı bir örnek olarak yürür" },
    "h.restore": { headline: "Yetenek geri yükleme → yeniden doğrulama → güvenli şekilde geri yükleme", detail: "kalıcı bir karar olmadan sona eren bir askıya alma" },
  },
  },
  "ACC-79": {
  shortName: "Yetenek Geri Yükleme",
  name: "Yetenek geri yükleme → yeniden doğrulama → güvenli şekilde geri yükleme",
  purpose: "Erişimi, birinin eskiden sahip olduğu yetenek kümesini yeniden oynatmak yerine, şu anda geçerli olan üzerinden yeniden inşa etmek.",
  nodes: {
    "t.condition": { headline: "Geri yükleme koşulu karşılandı" },
    "a.reevaluate": { headline: "Her mevcut gereksinimi bağımsız olarak yeniden değerlendir: hak, yetkilendirme, güvenlik durumu, politika durumu, kimlik bilgisinin kendi geçerliliği ve kaynağın hâlâ var olup olmadığı. Her biri, erişim kaldırıldığında alınan anlık görüntüden değil, şu anki durumundan okunur" },
    "c.requirements": { headline: "Önceki yetenek kümesinin ne kadarı şu anda geçerli?", edges: [{ label: "Tamamı", detail: "etkilenen her yetenek için tüm gereksinimler şu anda karşılanıyor" }, { label: "Bir kısmı", detail: "kümenin bir kısmı şu anda geçerli, bir kısmı değil" }, { label: "Hiçbiri", detail: "etkilenen hiçbir yetenek güncel gereksinimlerini karşılamıyor" }] },
    "a.restore-full": { headline: "Etkilenen yetenekleri geri yükle ve artık geçersiz hale gelen kısıtlama işlemlerini geçersiz kıl" },
    "a.restore-subset": { headline: "Yalnızca şu anda geçerli olan alt kümeyi geri yükle ve ona ait geçersiz kısıtlama işlemlerini geçersiz kıl. Süresi dolmuş kimlik bilgileri, geri alınmış izinler, geçerliliğini yitirmiş haklar, silinmiş kaynaklar ve artık var olmayan roller yeniden canlandırılmaz - her biri kendi gerekçesiyle sona ermiştir ve erişimin geri yüklenmesi bunların hiçbirini çözmez. Geri yüklenmeyen şey açıkça belirtilir; böylece hak sahibi bunu kendisi keşfetmek yerine sorabilir" },
    "x.remains": { headline: "hâlâ kısıtlı; şu anda geri yükleme için uygun hiçbir şey yok", detail: "önceki erişim, güncel bir erişim hakkı değildir; bunu yeniden kazanmak, geçmişte gereksinimleri karşılamış olmayı değil, şu anda karşılamayı gerektirir" },
    "x.restored": { headline: "yetenekler güncel geçerli duruma göre geri yüklendi", detail: "sonraki bir kısıtlama ve geri yükleme kendi başına ayrı bir döngüdür" },
    "x.partial": { headline: "kısmen geri yüklendi; geri dönmeyen şey belirtildi", detail: "geri yüklenmeyen her yetenek, kendi gereksinimi karşılandığında sürece yeniden girer - eksik olan alt küme, bir şeylerin yanlış olduğuna dair belirsiz bir izlenim değil, somut bir listedir" },
  },
  },
  "ACQ-01": {
  shortName: "Anonim Kimlik Çözümlemesi",
  name: "Anonim niyet → bilinen kimlik → yeterli giriş",
  purpose: "Anlamlı ama anonim bir niyet sinyalini, bir kimlik uydurmadan kimlik çözümleme sürecinden geçirmek ve yaşam döngüsü'a girişi, kimliğin çözülmüş olmasından ayrı bir soru olarak ele almak.",
  nodes: {
    "t.threshold": {
      headline: "Anonim niyet eşiği aşıldı",
      requires: [
        "yüksek niyet taşıyan sayfalara tekrarlanan ziyaretler",
        "fiyatlandırmayla etkileşim",
        "ürün veya yapılandırma incelemesi",
        "ilk oturumun ardından anlamlı bir geri dönüş",
      ],
      insufficientAlone: [
        "tek bir sayfa görüntüleme",
        "geri dönüşü olmayan tek bir oturum",
        "gelip hemen ayrılan bir reklam tıklaması",
      ],
    },
    "c.identity": { headline: "Bu anonim profil için kesin (deterministik) bilinen bir kimlik mevcut mu?", edges: [{ label: "Kesin kimlik", detail: "ziyaretçi kimlik doğruladı, birinci taraf bir tanımlayıcı gönderdi ya da tam olarak tek bir bilinen profille eşleşen imzalı bir bağlantıyı takip etti" }, { label: "Sadece olasılıksal", detail: "yalnızca cihaz, ağ veya benzerlik sinyalleri mevcut - bunlar birden fazla kişiyi tanımlayabilir" }] },
    "a.reconcile": { headline: "Anonim davranışsal geçmişi bilinen profille birleştir, kimlik öncesi kaydı onun yerine geçmek yerine yanında okunabilir tut ve kimliği hangi yöntemin çözdüğünü kaydet" },
    "w.identity": {
      headline: "kesin bir bilinen kimlik bu profil için çözülene kadar",
      detail: "Eşiği açan sinyallerin tazelik penceresi sonrasında zaman aşımına uğrar. (anonymous_intent.identity ayarlanmalı)",
      until: ["anonim profil için kesin (deterministik) bilinen bir kimlik çözülür"],
      timeoutReason:
        "anonim niyet de diğer her kanıt gibi bayatlar; çözülmemiş bir profil, bir isim bekleyerek süresiz açık tutulmaz",
    },
    "c.eligible": { headline: "Artık bilinen profil bir yaşam döngüsü'a girmeye uygun mu?", edges: [{ label: "Uygun", detail: "aday yaşam döngüsünün uygunluk kuralları birleştirilmiş profilde geçerli ve bu yaşam döngüsünün yapacağı şey için yasal bir dayanak mevcut" }, { label: "Uygun değil", detail: "uygunluk sağlanmıyor ya da iletişim için yasal bir dayanak yok - kimliğin çözüldüğü ama iznin hiç verilmediği sıradan durum dahil" }] },
    "x.stale": { headline: "anonim, niyet bayatladı, kimlik talep edilmedi", detail: "niyet eşiğinin yeniden aşılması yeni bir örnek açar; hiçbir şey birleştirilmedi ve beklemenin kendisi bir izin anlamına gelmedi" },
    "h.qualification": { headline: "Yeterlilik durumu değişikliği → yönlendir, tekrar yönlendir veya çıkış", detail: "bilinen, uygun bir profilin ilk kez yeterlilik sürecine girmesi" },
    "x.known-only": { headline: "bilinen profil, yaşam döngüsü'a girilmedi", detail: "ACQ-06, altta yatan veri değiştiğinde uygunluğu yeniden değerlendirir; bilinir hale gelmek kendi başına aday geliştirme akışını başlatmaz" },
  },
  },
  "ACQ-02": {
  shortName: "İlgi Yeterliliği Yönlendirmesi",
  name: "Yakalanan ilgi → yeterlilik → uygun hedef",
  purpose: "Birinci taraf ilgiyi, her yakalamayı ya satış adayı ya da abone olarak ele almak yerine, kendi içeriğinin haklı çıkardığı hedefe yönlendirmek.",
  nodes: {
    "t.captured": { headline: "Birinci taraf ilgi sinyali yakalandı" },
    "a.record": { headline: "Yakalama kaynağını, kişinin belirttiği bağlamı ve bunun kanıtladığı niyeti kaydet - her biri izinden ayrı olarak saklanır; izin ise yalnızca gerçekten verildiği yerde, kendi başına bir gerçek olarak kaydedilir" },
    "c.ready": { headline: "Yakalanan ilgi, kişinin şu an hazır olduğu bir hedefi zaten belirtiyor mu?", edges: [{ label: "Hedef belirtilmiş ve girilebilir", detail: "belirtilen talep şu anda girilebilecek bir hedefle eşleşiyor - deneme sürümü, satış görüşmesi, teklif, rezervasyon, başvuru, onboarding" }, { label: "Hedefsiz ilgi", detail: "ilgi gerçek ama bir hedef belirtmiyor, ya da belirttiği hedefe hazır olduğu kanıtlanmamış" }] },
    "h.destination": { headline: "external:destination-yaşam döngüsü", detail: "girilebilir bir hedefle eşleşen, açıkça belirtilmiş bir talep" },
    "c.disqualifier": { headline: "Bu aday müşteriyi eleyen bir koşul var mı?", edges: [{ label: "Elendi", detail: "yetkili bir kural aday müşteriyi eliyor: hizmet verilen pazarın dışında, bir rakip, geçersiz iletişim bilgisi ya da bu kapsamda zaten aktif bir müşteri" }, { label: "Eleyen koşul yok", detail: "aday müşteri geçerli ancak henüz aksiyona hazır değil" }] },
    "h.reason": { headline: "Yeterlilik durumu değişikliği → yönlendir, tekrar yönlendir veya çıkış", detail: "yakalama sırasında tespit edilen diskalifiye eden bir koşul" },
    "h.education": { headline: "Aday müşteri geliştirme akışı → sınırlı temas → ilerleme veya çıkış", detail: "henüz aksiyona hazır olmayan geçerli bir aday müşteri" },
  },
  },
  "ACQ-03": {
  shortName: "Yüksek Niyet / Satışa Devir",
  name: "Niyet yükselmesi → daha yüksek niyetli akışa devir",
  purpose: "Düşük niyetli bir yaşam döngüsündeki kişi daha güçlü bir sinyal verdiğinde sahipliği doğru akışa devretmek ve önceki akışın gönderimlerini durdurmak.",
  nodes: {
    "t.crossed": { headline: "Niyet eşiği aşıldı" },
    "c.strength": { headline: "Sinyal, gürültü değil gerçek bir yükselme sayılacak kadar güçlü mü?", edges: [{ label: "Gerçek yükselme", detail: "güçlü kanıt taşıyan bir eylem, ya da tekrarlanan orta düzey bir eylem - ve şu anı yansıtacak kadar taze" }, { label: "Gürültü", detail: "tek başına zayıf bir sinyal, ya da zaten bayatlamış güçlü bir sinyal" }] },
    "a.resolve": { headline: "Bu varlıkta kişiyi hangi akışın tuttuğunu ve yeni niyetin hangi yaşam döngüsü'a ait olduğunu belirle" },
    "x.unchanged": { headline: "sahiplikte değişiklik yok", detail: "daha sonra gelen, daha güçlü ya da tekrarlanan bir sinyal yeni bir örnek açar" },
    "c.higher": { headline: "Yeni niyet için daha yüksek öncelikli bir süreç var mı?", edges: [{ label: "Daha yüksek öncelikli süreç var", detail: "yeni niyet, mevcut sahibinden daha yüksek öncelikli bir yaşam döngüsü ile eşleşiyor" }, { label: "Daha yüksek yok", detail: "mevcut süreç, bu varlık için kayıtlı en güçlü niyeti zaten temsil ediyor" }] },
    "a.suppress": { headline: "Devir tamamlanmadan önce önceki akışın kuyruktaki ve gönderim aşamasındaki mesajlarını baskıla" },
    "x.retained": { headline: "sahiplik mevcut süreçte kalır", detail: "ileride yaşanacak bir yükselme bu soruyu yeniden açar; mevcut süreçte hiçbir şey değişmedi" },
    "h.escalate": { headline: "external:higher-intent-yaşam döngüsü", detail: "bu varlık için niyet önemli ölçüde arttı" },
  },
  },
  "ACQ-04": {
  shortName: "Yüksek Niyetli Aday müşteri Routing",
  name: "Yüksek niyetli eylem → yeterlilik → insan veya otomatik yönlendirme",
  purpose: "Ticari açıdan ciddi bir eylemden sonra, bir sonraki adımın bir kişinin değerlendirmesini mi gerektirdiğine yoksa otomatik olarak devam edebileceğine karar vermek - ve herhangi bir şey oluşturmadan önce zaten var olanı belirlemek.",
  nodes: {
    "t.high-intent": { headline: "Yüksek niyetli ticari eylem" },
    "a.resolve": { headline: "Herhangi bir şey oluşturmadan önce mevcut hesabı ve açık fırsatları belirle; böylece tekrarlanan ya da yinelenen bir talep, aynı kişi için ikinci bir kayıt açmak yerine var olanı günceller" },
    "c.converted": { headline: "Bu hesap, bu eylemin hedeflediği noktaya zaten ulaştı mı?", edges: [{ label: "Zaten ulaşıldı", detail: "sistem kaydı, bu varlık kapsamı için hedef durumun zaten ulaşıldığını gösteriyor" }, { label: "Henüz değil", detail: "bu kapsam için bir hedef durum mevcut değil" }] },
    "h.reached": { headline: "Ticari hedef tamamlandı → edinim baskılama → yaşam döngüsü devir", detail: "hedef tamamlandıktan sonra gelen yüksek niyetli bir aksiyon" },
    "c.human": { headline: "Bu eylem insan değerlendirmesi gerektiriyor mu?", edges: [{ label: "İnsan değerlendirmesi gerekli", detail: "değer, karmaşıklık, sözleşme koşulları ya da talebin kendisi bir kişi istiyor" }, { label: "Otomatik devam yeterli", detail: "talep kendi kendine yürütülebilir ve açık; bir kişinin dahil olması değerlendirme katmadan yalnızca gecikme yaratır" }] },
    "a.assign": { headline: "Dahili ticari kaydı oluştur ya da güncelle, bir sahip ata ve bunu gerekli kılan kanıtı taşıyan bir görev oluştur - sahiplik değişiklikleri eklenerek kaydedilir, böylece kimin sahip olduğuna dair iz kaybolmaz" },
    "h.automated": { headline: "external:automated-continuation", detail: "insan değerlendirmesi gerektirmeyen, kendi kendine yürütülebilir bir talep" },
    "h.human": { headline: "external:human-in-the-loop-yaşam döngüsü", detail: "bir sonraki adımı artık atanmış bir sahibin yürütmesi" },
  },
  },
  "ACQ-05": {
  shortName: "Yeterlilik Durumu Yönlendirmesi",
  name: "Yeterlilik durumu değişikliği → yönlendir, tekrar yönlendir veya çıkış",
  purpose: "Yeterliliği, bir kez uygulanıp sonra güvenilen bir etiket olarak değil, yönlendirmesi neden değiştiğine bağlı olan geri döndürülebilir bir durum olarak ele almak.",
  nodes: {
    "t.changed": { headline: "Yeterlilik durumu değişti" },
    "a.read": { headline: "Yeni durumu, değişme nedeniyle birlikte oku ve ikisini de yeterlilik geçmişine ekle - önceki durum ve nedeni okunabilir kalır, çünkü bir sonraki yönlendirme kararı bunlara bağlıdır" },
    "c.state": { headline: "Yeni yeterlilik durumu nedir?", edges: [{ label: "QUALIFIED", detail: "hesap, ticari bir hedefin eşiğini karşılıyor" }, { label: "QUALIFYING", detail: "kanıt toplanıyor ve henüz bir sonuca varılmadı" }, { label: "UNQUALIFIED", detail: "eşik karşılanmıyor ve diskalifiye eden bir gerçek bulunamadı" }, { label: "DISQUALIFIED", detail: "belirli bir gerçek hesabı eliyor" }, { label: "RECYCLE_ELIGIBLE", detail: "önceki olumsuz durumun bilinen bir geri dönüş yolu var" }] },
    "h.destination": { headline: "external:commercial-destination", detail: "yeterliliğin QUALIFIED durumuna ulaşması" },
    "x.in-progress": { headline: "yeterlilik sürüyor, henüz ticari yükselme yok", detail: "bir sonraki yetkili durum değişikliği yeni bir örnek açar" },
    "x.not-yet": { headline: "uygun değil, hiçbir şey elemiyor", detail: "yeni bir kanıt, önce hiçbir şeyin geri alınması gerekmeden bunu QUALIFYING durumuna taşıyabilir" },
    "c.why": { headline: "Neden diskalifiye edildi?", edges: [{ label: "Nihai uyumsuzluk", detail: "hesaba asla hizmet verilemez - kalıcı olarak pazarın dışında, yapısal olarak uygun değil ya da yasaklı" }, { label: "Zamanlama", detail: "uyum doğru ama an yanlış" }, { label: "Eksik gereklilik", detail: "belirli bir gereklilik karşılanmıyor ve ileride karşılanabilir" }, { label: "Yinelenen veya mevcut ilişki", detail: "kayıt, zaten var olan bir hesabı yineliyor ya da ilişki başka bir yerde zaten mevcut" }] },
    "w.recycle": { headline: "aday müşteri için kaydedilen yeniden giriş koşulu veya tarihi gelene kadar", detail: "Yeniden değerlendirme, nedenle birlikte kaydedilen koşula veya tarihe bağlıdır; bekleme bu noktada sona erer ve sistem yeni bir tarih uydurmaz. (qualification_state.recycle ayarlanmalı)" },
    "x.terminal": { headline: "diskalifiye edildi, nihai uyumsuzluk", detail: "bu nedenden dolayı yok - yalnızca ne sunduğumuzdaki bir değişiklik bunu değiştirebilir, bu da hesapta değil kuralda bir değişikliktir" },
    "a.mark-recycle": { headline: "RECYCLE_ELIGIBLE durumunu, zamanlama nedeniyle ve yeniden değerlendirmeyi anlamlı kılacak koşul veya tarihle birlikte kaydet; böylece geri dönüş bir periyoda değil gerçek bir şeye bağlı olur" },
    "w.requirement": { headline: "ilerlemeyi engelleyen, adı belirtilen gerekliliğin karşılandığı kaydedilene kadar", detail: "Gerekliliğin geçerlilik süresi doluyor. (qualification_state.requirement ayarlanmalı)" },
    "h.merge": { headline: "external:account-master-data", detail: "yinelenen veya zaten mevcut olan bir ilişki" },
    "a.requalify": { headline: "Durumu, yeniden değerlendirme nedeniyle birlikte QUALIFYING durumuna taşı - bu da kendi başına yetkili bir durum değişikliğidir ve bu sürecin yeni bir örneğini açar" },
    "x.recycle-expired": { headline: "koşul karşılanmadan yeniden değerlendirme süresi doldu", detail: "yeni bir gelen sinyal, eski geçmiş korunarak yeterliliği baştan başlatabilir" },
    "x.requirement-lapsed": { headline: "diskalifiye edildi, gereklilik hiç karşılanmadı", detail: "gerekliliğin daha sonra karşılanması yeni bir yetkili durum değişikliğidir ve süreç normal şekilde yeniden başlar" },
    "x.recycled": { headline: "yeterliliğe yeniden girildi", detail: "yeniden giriş zaten gerçekleşti; devamını yeni örnek yürütür" },
  },
  },
  "ACQ-06": {
  shortName: "Uygunluk Yeniden Hesaplama",
  name: "Dinamik uygunluk → uygun veya uygun değil → sonuç",
  purpose: "Altta yatan veri değiştikçe uygunluğu yeniden karara bağlamak ve bundan sonrasında neyi yasakladığını geri almadığı şeylerden ayırmak.",
  nodes: {
    "t.evaluated": { headline: "Uygunluk girdileri değişti veya yeniden değerlendirildi" },
    "a.evaluate": { headline: "Yetkili kuralları değerlendir ve sonucu hangi kuralın hangi girdiyle ürettiğini kaydet; böylece yanıt daha sonra açıklanabilir ve itiraz edilebilir olur" },
    "c.eligible": { headline: "Varlık şu anda uygun mu?", edges: [{ label: "Uygun", detail: "kapsamdaki her kural mevcut veriyle geçerli" }, { label: "Uygun değil", detail: "en az bir kural sağlanmıyor ve başarısız olan kural kaydediliyor" }] },
    "o.permitted": { headline: "bu kural kapsamında yeni eylemlere uygun", detail: "kural kapsamındaki yeni eylemler devam edebilir. Bu, yetkinin sunulmaya hazır olduğu ya da bir hak tanındığı anlamına gelmez - bunlar kendi durumları olan iki ayrı adımdır" },
    "c.commitment": { headline: "Mevcut bir taahhüt veya zaten tanınmış bir hak bu uygunluğa bağlı mı?", edges: [{ label: "Taahhüt mevcut", detail: "zaten vaat edilmiş, tanınmış, sözleşmeye bağlanmış ya da işlemdeki bir şey, az önce geçersiz kalan bu uygunluğa dayanıyor" }, { label: "Bekleyen bir şey yok", detail: "uygunluk yalnızca gelecekteki eylemleri yönetiyordu" }] },
    "x.eligible": { headline: "uygun, kararı veren kuralla birlikte kaydedildi", detail: "girdilerdeki herhangi bir değişiklik değerlendirmeyi yeniden açar" },
    "a.reconcile": { headline: "Mevcut taahhüdü kendi mutabakat süreci için işaretle; değişen kuralı ve nedeni belirt - bu süreç zaten tanınmış hiçbir şeyi iptal etmez, azaltmaz veya geri almaz" },
    "a.block": { headline: "Kuralın artık yasakladığı yeni eylemleri engelle; engelleme sırasında kuralı belirt, böylece neden, açıklanamayan bir hata olarak değil ret ile birlikte iletilir" },
    "h.reconcile": { headline: "external:commitment-reconciliation", detail: "bir yükümlülük beklerken uygunluğun kaybedilmesi" },
    "x.ineligible": { headline: "yeni eylemlere uygun değil, bekleyen hiçbir şey geri alınmadı", detail: "uygunluğun geri kazanılması sıradan bir yeniden değerlendirmedir ve özel bir durum gerektirmez" },
  },
  },
  "ACQ-07": {
  shortName: "Niyet Zayıflaması",
  name: "Niyet zayıflaması → önceliği düşür → bekleme süresi veya çıkış",
  purpose: "Bir kişiyi bir kez yaptığı bir şeyin gücüne dayanarak takip etmek yerine, arkasındaki kanıt bayatladığında kayıtlı yüksek niyet durumunun süresinin dolmasına izin vermek.",
  nodes: {
    "t.stale": { headline: "Niyet tazelik eşiği aşıldı" },
    "a.weigh": { headline: "Son anlamlı sinyalden bu yana geçen süreyi, bunu çürüten sonraki davranışları, hedefe doğru kaydedilen ilerlemeyi ve altta yatan ilişki durumunu değerlendir" },
    "c.credible": { headline: "Kayıtlı niyet hâlâ inandırıcı mı?", edges: [{ label: "Hâlâ inandırıcı", detail: "son davranışlar bunu desteklemeye devam ediyor, ya da hedefe doğru gerçek bir ilerleme sürüyor" }, { label: "Artık inandırıcı değil", detail: "kanıt bayatlamış ya da çürütülmüş ve hiçbir ilerleme kaydedilmedi" }] },
    "x.unchanged": { headline: "niyet durumu korundu", detail: "bir sonraki tazelik eşiği bu soruyu yeniden açar" },
    "a.downgrade": { headline: "Niyet sınıflandırmasını kanıtın artık desteklediği düzeye indir ve nedenini kaydet. Pazarlama izni buna dokunulmaz: zayıflayan niyet, geri çekilen bir onay değildir; ikisi tam da bu an için ayrı saklanır" },
    "a.suppress": { headline: "Daha yüksek niyet için yazılmış takip iletişimini durdur; bu öncelikte kuyrukta bekleyen her şey dahil" },
    "c.relationship": { headline: "Zayıflayan niyetin altında hangi ilişki var?", edges: [{ label: "Mevcut müşteri", detail: "kişi veya hesap zaten aktif bir ürün veya hizmet ilişkisine sahip" }, { label: "Müşteri değil", detail: "aktif bir ilişki mevcut değil" }] },
    "h.customer": { headline: "external:customer-yaşam döngüsü", detail: "aktif bir müşteri ilişkisi üzerinde zayıflayan kazanım niyeti" },
    "w.cooldown": { headline: "niyeti yeniden açacak kadar güçlü yeni bir davranış sinyali gelene kadar", detail: "Bu niyet bağlamında bekleme süresi işler. Süre içinde gelen güçlü bir sinyal niyeti yeniden yükseltir; süre dolarsa zayıflayan niyet karar kaydı oluşturmadan kapanır. (intent_decay.cooldown ayarlanmalı)" },
    "h.re-escalate": { headline: "Niyet yükselmesi → daha yüksek niyetli akışa devir", detail: "bekleme süresi boyunca gelen yeni ve güçlü bir sinyal" },
    "x.cooled": { headline: "niyetin süresi doldu, izin değişmedi, karar kaydedilmedi", detail: "yeni güçlü bir sinyal, sıfırdan yeni bir niyet durumu oluşturur" },
  },
  },
  "ACQ-08": {
  shortName: "Kazanım Çıkış Devri",
  name: "Ticari hedef tamamlandı → edinim baskılama → yaşam döngüsü devir",
  purpose: "Kazanım sürecinin var olma amacı olan sonuç kaydedildiği anda sahipliği bırakmasını sağlamak ve zaten kuyruğa alınmış olanı durdurmak.",
  nodes: {
    "t.destination": { headline: "Yetkili hedef olayı" },
    "c.authoritative": { headline: "Olay, o hedef için sistem kaydından mı geldi?", edges: [{ label: "Yetkili", detail: "hedef sistem bu gerçeği kaydetti" }, { label: "Yalnızca dolaylı gösterge", detail: "sinyal, kayıtlı bir iş gerçeğini değil, etkileşimi veya gezinmeyi tanımlıyor" }] },
    "a.scope": { headline: "Hedefin ait olduğu varlığı belirle - sipariş, abonelik, rezervasyon veya başvuru - böylece bundan sonraki her şey buna göre kapsamlanır" },
    "x.not-conversion": { headline: "hedef kaydedilmedi, hiçbir şey baskılanmadı", detail: "gerçek olay meydana gelirse sistem kaydından gelir ve düzgün bir örnek açar" },
    "a.identify": { headline: "Bu olayın, o varlık kapsamı için amacını geçersiz kıldığı kazanım süreçlerini belirle - yalnızca bunları; başka bir varlıkla ilgili süreçlere dokunulmaz" },
    "a.suppress": { headline: "Bir sonraki gönderim penceresi açılmadan önce, kuyruktaki hatırlatmalarını, planlanmış yeniden denemelerini, düşük niyetli harekete geçirici mesajlarını ve bayatlamış promosyon adımlarını baskıla" },
    "h.next": { headline: "external:next-yaşam döngüsü", detail: "hedef durumun kaydedilmesi" },
  },
  },
  "ACQ-09": {
  shortName: "Aday müşteri geliştirme akışı",
  name: "Aday müşteri henüz hazır değil → sınırlı aday geliştirme akışı → ilerleme veya çıkış",
  purpose: "Geçerli ancak henüz aksiyona hazır olmayan bir aday müşteriye, süresi ve temas sayısı baştan belirlenmiş bir aday geliştirme akışı akışı sunmak.",
  nodes: {
    "t.not-ready": { headline: "Aday müşteri henüz aksiyona hazır değil" },
    "c.basis": { headline: "Bu tür bir iletişim için açık izin ve yasal bir dayanak var mı?", edges: [{ label: "Dayanak mevcut", detail: "izin verildi ve bu tür bilgilendirmeyi kapsıyor" }, { label: "Dayanak yok", detail: "yakalama sırasında izin verilmedi ya da mevcut dayanak bunu kapsamıyor - bu sıradan bir durumdur, çünkü bir formu göndermek onay anlamına gelmez" }] },
    "a.educate": { headline: "Kişinin sürece girmesine gerçekte neden olan konuya uygun bilgilendirme gönder - genel bir dizi değil, aralıklarla tekrarlanan satış baskısı da değil" },
    "w.first": { headline: "aday müşteri ilerleme sinyali verene, izin geri çekilene veya izinli hiçbir kanala ulaşılamayana kadar", detail: "İlk ve son temas arasındaki süre, ilk mesajın değerlendirilebileceği kadar uzun; akış penceresini aşmayacak kadar kısa olmalıdır." },
    "c.still-open": { headline: "Aday müşteri hâlâ aynı aday geliştirme akışı kapsamında mı?", edges: [{ label: "İlerledi", detail: "ilk temastan bu yana ilerleme sinyali kaydedildi; son temas gönderilmez" }, { label: "İzin geri çekildi", detail: "aday geliştirme akışının dayandığı yasal dayanak veya izin artık geçerli değil" }, { label: "Ulaşılabilir kanal yok", detail: "bu kişi için izinli ve ulaşılabilir bir kanal kalmadı" }, { label: "Hâlâ hazır değil", detail: "ilerleme kaydedilmedi, giriş nedeni hâlâ geçerli, izin devam ediyor ve ulaşılabilir bir kanal var" }] },
    "a.educate2": { headline: "Pencerenin son bilgilendirmesini gönder - aynı giriş nedeni üzerinden ve ilkinin zaten kapsadığının ötesinde; onun tekrarı değil, bilgilendirme kılığına girmiş satış baskısı da değil" },
    "x.no-basis": { headline: "beklemede, besleme başlatılmadı", detail: "daha sonra verilen izin bunu normal şekilde yeniden açar; yakalamanın kendisi hiçbir zaman onay sayılmadı ve bu süre boyunca hiçbir şey gönderilmedi" },
    "w.window": { headline: "aday müşteri yanıt, talep veya satın alma adımıyla ilerleyene; izin geri çekilene ya da izinli hiçbir kanala ulaşılamayana kadar", detail: "geliştirme akışı penceresi akış girişinde sabitlenir ve etkileşim olsa da uzamaz. Süre dolduğunda akış kapanır. (bounded_education.window ayarlanmalı)" },
    "c.window-olay": { headline: "Beklemeyi ne sonlandırdı?", edges: [{ label: "İlerleme kaydetti", detail: "anlamlı bir ilerleme sinyali geldi" }, { label: "İzin geri çekildi", detail: "bu beslemenin dayandığı yasal dayanak veya izin artık bunu kapsamıyor" }, { label: "Ulaşım yolu kayboldu", detail: "bu kişi için izinli hiçbir hedefe artık ulaşılamıyor" }] },
    "a.sunset": { headline: "Pencereyi kapat ve ilerleme kaydedilmeden sona erdiğini kaydet - bu, kişi hakkında bir yargı değil, bu denemeye dair bir gerçektir" },
    "h.progressed": { headline: "Niyet yükselmesi → daha yüksek niyetli sürece devir", detail: "bu kişinin ihtiyacını değiştirecek kadar güçlü bir ilerleme sinyali" },
    "a.stop-permission": { headline: "Bu örnek için kuyrukta bekleyen beslemeyi geçersiz kıl ve nedeni ekle. Yalnızca ilerlemeyle veya kendi süresiyle sona eren bir pencere, dayandığı izin ortadan kalktıktan sonra da göndermeye devam eder" },
    "a.stop-contactability": { headline: "Aday geliştirme akışını ilgisizlik olarak işaretlemeden durdur. Kanalın çalışmaması, aday müşteriyin ilgisini kaybettiği anlamına gelmez" },
    "x.sunset": { headline: "besleme penceresi ilerleme olmadan kapandı", detail: "yeni bir gelen sinyal veya yeni bir talep yeni bir pencere açabilir; aynı bilgilendirmeye anında yeniden giriş engellenir" },
    "x.permission-ended": { headline: "besleme durduruldu; izin artık bunu kapsamıyor", detail: "yeni ve geçerli bir izin, yeni bir uygun neden ile birleşince yeni bir pencere başlar" },
    "x.unreachable": { headline: "besleme durduruldu; izinli hiçbir yola ulaşılamıyor", detail: "giriş nedeni hâlâ geçerliyken onarılan veya yeni izin verilen bir yol beslemeyi yeniden başlatır" },
  },
  },
  "ACQ-10": {
  shortName: "Ticari Ret Yönlendirmesi",
  name: "Açık ticari ret → gerekçe → kapat, bekleme süresi'a al veya yeniden değerlendir",
  purpose: "Olumsuz bir ticari sonucu, hepsini 'kaybedildi' başlığı altına kaydetmek yerine nedenine göre yönlendirmek.",
  nodes: {
    "t.decline": { headline: "Açık ret veya yetkili kayıp sonucu" },
    "a.capture": { headline: "Nedeni fırsata karşı kaydet ve ret geçmişine ekle; önceki nedenler okunabilir kalır - farklı bir nedenle yaşanan ikinci bir kayıp, ilkinin düzeltmesi değil, iki ayrı gerçektir" },
    "c.reason": { headline: "Hangi neden ailesi geçerli?", edges: [{ label: "NOT_FIT", detail: "uyumsuzluk yapısal ve değişmeyecek" }, { label: "TIMING", detail: "uyum doğru, an yanlış" }, { label: "NO_PRIORITY", detail: "gerçek bir uyum var ama harekete geçmek için şu anda bir yetki yok" }, { label: "PROCUREMENT_BLOCK", detail: "bizim hakkımızda bir yargı değil, bir süreç veya politika engeli" }, { label: "PRICE", detail: "değer önerisi bu anda fiyatı karşılamadı" }, { label: "COMPETITOR", detail: "başka bir tedarikçi seçildi - bunun bir süresi, dolayısıyla bir sonu var" }, { label: "NO_RESPONSE", detail: "fırsat, kimsenin gerçekten karar vermediği bir sessizlik nedeniyle kapatıldı" }, { label: "OTHER", detail: "neden sınıflandırılmamış ve kaydedildiği haliyle yönlendirilemiyor" }] },
    "x.terminal": { headline: "reddedildi, nihai uyumsuzluk", detail: "bu nedenden dolayı yok - değişmesi gereken şey bu hesabın kararı değil, sattığımız şey olurdu" },
    "c.reentry": { headline: "Bir yeniden giriş olayı, tarihi veya koşulu gerçekten biliniyor mu?", edges: [{ label: "Biliniyor", detail: "bir sözleşme sonu, bütçe döngüsü, proje tarihi ya da adı belirtilmiş bir koşul, ret ile birlikte kaydedildi" }, { label: "Bilinmiyor", detail: "neden geçici ama ne zaman geri dönüleceğini gösteren hiçbir şey kaydedilmedi" }] },
    "h.decay": { headline: "Niyet zayıflaması → önceliği düşür → bekleme süresi veya çıkış", detail: "bir karar yerine sessizlik nedeniyle kapatılan bir fırsat" },
    "h.classify": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "OTHER olarak kaydedilen bir ret" },
    "w.reentry": { headline: "aday müşteri için kaydedilen yeniden giriş koşulu veya tarihi gelene kadar", detail: "Bekleme; ret nedeniyle birlikte kaydedilen olay, tarih veya koşul gerçekleştiğinde sona erer. Hiçbiri bilinmiyorsa yeni temas planlanmaz. (commercial_decline.reentry ayarlanmalı)" },
    "x.cooldown": { headline: "reddedildi, yeniden değerlendirmeye uygun, hiçbir şey planlanmadı", detail: "yeni bir gelen sinyal, ya da daha sonra kaydedilecek bir yeniden giriş koşulu; sessizliği doldurmak için bir periyot uydurulmaz" },
    "h.requalify": { headline: "Yeterlilik durumu değişikliği → yönlendir, tekrar yönlendir veya çıkış", detail: "kaydedilen yeniden giriş koşulunun karşılanması" },
  },
  },
  "ACQ-11": {
  shortName: "Yarım Kalan Süreç Kurtarma",
  name: "Süreç başladı → terk onaylandı → kurtarıldı, yerini yenisi aldı veya sona erdi",
  purpose: "Bir kişiyi, başlattığı ama tamamlamadığı, sürdürülebilir bir sürece - ödeme, başvuru, teklif, kayıt - hâlâ sürdürülebilirken geri döndürmek; sistemin sahip olmadığı bir durumu hiçbir zaman iddia etmeden.",
  nodes: {
    "t.started": { headline: "Süreç başladı" },
    "c.eligible": { headline: "Bu süreç bu kişi için hiç kurtarılabilir mi?", edges: [{ label: "Uygun", detail: "kimlik, ulaşılabilir bir kişiyle eşleşiyor; süreç ürünler ve bir hedefle sürdürülebilir durumda; bunun için açık bir örnek yok; üzerinde kayıtlı bir ödeme hatası yok ve ticari kurtarma izni kayıtlı" }, { label: "Uygun değil", detail: "bunlardan herhangi biri sağlanmıyor - neden, işlem yapılmama nedeni olarak kaydedilir" }] },
    "a.open": { headline: "Kurtarma örneğini mantıksal sürece karşı aç ve terk sayacını sürecin açıldığı andan değil, üzerindeki son etkinlikten başlat. İlk temastan önceki etkinlik sayacı ileri alır; ilk temastan sonraki hiçbir şey pencereyi uzatmaz" },
    "x.no-action": { headline: "hiçbir temas gönderilmedi; bunu durduran engel kaydedildi", detail: "yeni bir mantıksal süreç yeni bir örnektir; bu süreç sona erdiğinde veya baskılandığında aktif bekleme süresi'a tabidir" },
    "w.abandon": { headline: "mantıksal süreç sistem kaydında tamamlanana kadar, ya da kişi mantıksal süreci iptal edene kadar, ya da platform mantıksal sürecin süresini doldurana kadar, ya da süreçteki tüm ürünler kaldırılana kadar, ya da yetkili bir sağlayıcı yanıtı bir ödeme denemesini başarısız olarak sınıflandırana kadar", detail: "İlk kontrol, kişinin süreç içinde duraklamadığından, gerçekten ayrıldığından emin olacak kadar - ama niyet tazeliğini yitirmeden önce - son etkinlikten sonra bekler. (örnek: 30–60 dakika; recovery.first_check ayarlanmalı)" },
    "c.state": { headline: "Süreç şu anda ne durumda?", edges: [{ label: "Hâlâ sürdürülebilir", detail: "süreç ürünler ve bir devam hedefiyle açık, ve buna karşı bir sipariş verilmedi" }, { label: "Tamamlandı", detail: "sürece karşı herhangi bir kanaldan bir sipariş veya tamamlanma kaydedildi" }, { label: "İptal edildi, süresi doldu veya boşaltıldı", detail: "kişi iptal etti, platform süresini doldurdu ya da tüm ürünler kaldırıldı" }, { label: "Yerine yenisi geçti", detail: "aynı kişi için daha yeni bir mantıksal süreç var ve yerine geçme kuralı geçerli" }, { label: "Ödeme başarısız", detail: "bu sürece karşı bir ödeme hatası kaydedildi" }] },
    "c.sendable": { headline: "İlk temas gönderilebilir mi?", edges: [{ label: "Gönderilebilir", detail: "gönderim yolu geçerli: ticari kurtarma izni var, ulaşılabilir bir hedef var, promosyon iletişim yoğunluğu limiti aşılmadı, hesapta daha yüksek öncelikli bir çakışma yok ve yürürlükte bir bekleme süresi yok" }, { label: "Gönderilmez", detail: "baskılama gerekçesi kaydedilir" }] },
    "x.converted": { headline: "tamamlandı; süreç sonuna ulaştı", detail: "yeni bir mantıksal süreç yeni bir örnektir; bu örnek dönüşüm gerçekleşmiş olarak kapatılır" },
    "x.invalid": { headline: "tamamlanmadan kapandı - iptal edildi, süresi doldu veya boşaltıldı; başka hiçbir şey gönderilmez", detail: "yeni bir mantıksal süreç yeni bir örnektir" },
    "x.superseded": { headline: "aynı kişi için daha yeni bir süreç tarafından yerine geçildi", detail: "bu süreç için hiçbir şey yapılmaz; kurtarmayı daha yeni süreç yürütür" },
    "h.payment": { headline: "Ödeme hatası → sınıflandır → kurtar, alternatif sun veya çıkış", detail: "sürece karşı kaydedilen bir ödeme hatası - başarısız bir ödeme terk anlamına gelmez" },
    "a.touch1": { headline: "Sürecin hâlâ açık olduğunu söyle, ürünleri şu anki haliyle göster ve durumu geri yüklenmiş şekilde tam olarak bu sürece dönen bağlantıyı ver. Sistemin iddia etmediği hiçbir şeyi iddia etme - ne rezerve stok, ne tutulan fiyat, ne indirim" },
    "a.record-no-action": { headline: "Temasın hangi süreç için hangi engel tarafından durdurulduğunu kaydet; böylece işlem yapılmaması sessiz bir yokluk değil, ölçülmüş bir sonuç olur" },
    "w.second": { headline: "kimliği doğrulanmış bir oturum aynı mantıksal sürece geri dönene kadar, ya da mantıksal süreç sistem kaydında tamamlanana kadar, ya da kişi mantıksal süreci iptal edene kadar, ya da platform mantıksal sürecin süresini doldurana kadar, ya da süreçteki tüm ürünler kaldırılana kadar, ya da yetkili bir sağlayıcı yanıtı bir ödeme denemesini başarısız olarak sınıflandırana kadar", detail: "İkinci kontrol, kişinin ilk temasa kendi zamanında tepki verme fırsatı bulmasından sonra, ama süreç sürdürülebilir olmaktan çıkmadan önce yapılır. (örnek: 20–28 saat; recovery.second_check ayarlanmalı)" },
    "c.state2": { headline: "Süreç şu anda ne durumda ve kişi geri döndü mü?", edges: [{ label: "Tamamlandı", detail: "sürece karşı bir sipariş veya tamamlanma kaydedildi" }, { label: "İptal edildi, süresi doldu veya boşaltıldı", detail: "sürece artık geri dönülemez" }, { label: "Yerine yenisi geçti", detail: "aynı kişi için daha yeni bir mantıksal süreç var ve yerine geçme kuralı geçerli" }, { label: "Ödeme başarısız", detail: "bu sürece karşı bir ödeme hatası kaydedildi" }, { label: "Geri dönüldü, hâlâ açık", detail: "ilk temastan bu yana kimliği doğrulanmış bir oturum sürece dokundu ve süreç hâlâ açık - kişi unutmuyor, karar veriyor" }, { label: "Hâlâ açık, geri dönülmedi", detail: "süreç açık ve ilk temastan bu yana hiç dokunulmadı" }] },
    "c.resume-budget": {
      headline: "Geri dönüş erteleme bütçesi hâlâ mevcut mu?",
      edges: [
        { label: "Bütçe mevcut", detail: "bu örneğe karşı, recovery.resume_rearms'ın izin verdiğinden daha az sayıda geri dönüş ertelemesi kullanılmış" },
        { label: "Bütçe tükendi", detail: "örnek açıldığında belirlenen geri dönüş erteleme bütçesi zaten kullanılmış - ikinci temas bir geri dönüş için bir kez ertelenir, sonsuza kadar değil" },
      ],
    },
    "a.note-return": { headline: "Geri dönüşü kaydet ve yeni son etkinlikten itibaren bir bekleme süresini daha başlat. Geri dönüp yeniden ayrılan bir kişi karar veriyordur; ikinci temas bir kez ertelenir, ne atlanır ne de hızlandırılır" },
    "c.sendable2": { headline: "İkinci temas gönderilebilir mi?", edges: [{ label: "Gönderilebilir", detail: "gönderim yolu geçerli ve temas bütçesi tükenmedi" }, { label: "Gönderilmez", detail: "baskılama gerekçesi kaydedilir" }] },
    "w.resumed": { headline: "mantıksal süreç sistem kaydında tamamlanana kadar, ya da kişi mantıksal süreci iptal edene kadar, ya da platform mantıksal sürecin süresini doldurana kadar, ya da süreçteki tüm ürünler kaldırılana kadar, ya da yetkili bir sağlayıcı yanıtı bir ödeme denemesini başarısız olarak sınıflandırana kadar", detail: "Bir geri dönüşten sonra, aynı ilk kontrol aralığı yeni son etkinlikten itibaren tekrar işler. (örnek: 30–60 dakika; recovery.first_check ayarlanmalı)" },
    "a.touch2": { headline: "Muhtemel engeli - kargo, iade, güven, soru sorabileceği bir yol - aynı bağlantıyla sürece geri dönerek ele al. Yine sistemin iddia etmediği hiçbir şey iddia edilmez" },
    "w.final": { headline: "mantıksal süreç sistem kaydında tamamlanana kadar, ya da kişi mantıksal süreci iptal edene kadar, ya da platform mantıksal sürecin süresini doldurana kadar, ya da süreçteki tüm ürünler kaldırılana kadar, ya da yetkili bir sağlayıcı yanıtı bir ödeme denemesini başarısız olarak sınıflandırana kadar", detail: "Kurtarma süresi, platformun kendi sürdürülebilirlik süresinden önce sona erer; böylece son temas hiçbir zaman zaten kapanmış bir sürece işaret etmez. (örnek: 3–7 gün; recovery.lifetime ayarlanmalı)" },
    "c.state3": { headline: "Kurtarma süresinin sonunda süreç ne durumda?", edges: [{ label: "Tamamlandı", detail: "sürece karşı bir sipariş veya tamamlanma kaydedildi" }, { label: "İptal edildi, süresi doldu veya boşaltıldı", detail: "sürece artık geri dönülemez" }, { label: "Yerine yenisi geçti", detail: "aynı kişi için daha yeni bir mantıksal süreç var ve yerine geçme kuralı geçerli" }, { label: "Ödeme başarısız", detail: "bu sürece karşı bir ödeme hatası kaydedildi" }, { label: "Hâlâ açık", detail: "süreç açık ve sürdürülebilir" }] },
    "c.final-enabled": { headline: "Son bildirim etkin mi ve belirtilecek gerçek bir son tarih var mı?", edges: [{ label: "Etkin, son tarih belirtilmiş", detail: "şirket son bildirimi etkinleştirmiş (recovery.final_notice_enabled), platform bu süreç için bir son tarih belirtiyor ve gönderim yolu geçerli" }, { label: "Devre dışı, ya da gerçek bir son tarih yok", detail: "son bildirim devre dışı, ya da bildirimin doğru şekilde belirtebileceği bir son tarih yok" }] },
    "a.touch3": { headline: "Sürecin gerçek son tarihinde kapanacağını bir kez söyle ve bağlantıyı ver. Sistemin iddia etmediği hiçbir aciliyet, ve politika son temas için özel olarak izin vermedikçe hiçbir teşvik kullanılmaz" },
    "x.lapsed": { headline: "kurtarma süresi, süreç hâlâ açıkken doldu; başka hiçbir şey gönderilmez", detail: "yeni bir mantıksal süreç yeni bir örnektir ve bekleme süresi işlerken sessizce başlar" },
    "w.close": { headline: "mantıksal süreç sistem kaydında tamamlanana kadar, ya da kişi mantıksal süreci iptal edene kadar, ya da platform mantıksal sürecin süresini doldurana kadar, ya da süreçteki tüm ürünler kaldırılana kadar, ya da yetkili bir sağlayıcı yanıtı bir ödeme denemesini başarısız olarak sınıflandırana kadar", detail: "Son bekleme, platformun kendi son tarihi dolduğunda sona erer; ondan sonra hiçbir şey gönderilmez. (önerilen: platformun belirttiği expires_at değeri; recovery.process_expiry ayarlanmalı)" },
    "c.close": { headline: "Son beklemeyi ne sonlandırdı?", edges: [{ label: "Tamamlandı", detail: "sürece karşı bir sipariş veya tamamlanma kaydedildi" }, { label: "Ödeme başarısız", detail: "bu sürece karşı bir ödeme hatası kaydedildi" }, { label: "Tamamlanmadan kapandı", detail: "süreç iptal edildi, süresi doldu ya da boşaltıldı" }] },
  },
  },
  "ACQ-12": {
  shortName: "Yarım Kalan Seçim Kurtarma",
  name: "Seçim kaydedildi → sürece taşınmadan tutuldu → kurtarıldı, sürece taşındı, temizlendi veya sona erdi",
  purpose: "Bir kişiyi, seçtiği ama bir sürece taşımadığı ürünlere - sepet, alışveriş listesi, kaydedilmiş bir liste - seçim hâlâ geçerliyken ve ürünler hâlâ mevcutken geri döndürmek; sistemin sahip olmadığı bir durumu iddia etmeden.",
  nodes: {
    "t.selected": { headline: "Seçim kaydedildi" },
    "c.eligible": { headline: "Bu seçim bu kişi için hiç kurtarılabilir mi?", edges: [{ label: "Uygun", detail: "kimlik, ulaşılabilir bir kişiyle eşleşiyor; en az bir ürün mevcut; bu ürünler için açık bir süreç yok; bu seçim için açık bir örnek yok ve ticari kurtarma izni kayıtlı" }, { label: "Uygun değil", detail: "bunlardan herhangi biri sağlanmıyor - neden, işlem yapılmama nedeni olarak kaydedilir" }] },
    "a.open": { headline: "Kurtarma örneğini seçime karşı aç ve sayacı üzerindeki son etkinlikten başlat. İlk temastan önceki etkinlik sayacı ileri alır; ilk temastan sonraki hiçbir şey pencereyi uzatmaz" },
    "x.no-action": { headline: "hiçbir temas gönderilmedi; bunu durduran engel kaydedildi", detail: "yeni bir seçim yeni bir örnektir; bu seçim sona erdiğinde veya baskılandığında aktif bekleme süresi'a tabidir" },
    "w.settle": { headline: "seçimden en az bir ürünü içeren bir sipariş veya tamamlanma kaydedilene kadar, ya da kişi seçimdeki tüm ürünleri kaldırana kadar, ya da seçim silinene kadar, ya da en az bir ürün ve sürdürülebilir bir durumla bir kişi için sürdürülebilir bir sürecin (ödeme, başvuru, teklif, kayıt) açıldığına dair yetkili bir kayıt oluşana kadar, ya da en az bir ürün kalırken seçime bir ürün eklenene veya seçimden kaldırılana kadar", detail: "İlk kontrol, kişinin duraklamadığından, gerçekten ayrıldığından emin olacak kadar - ama seçimin hatırlanması muhtemel olduğu süreyi aşmadan - son seçim etkinliğinden sonra bekler. (örnek: 1–4 saat; selection.first_check ayarlanmalı)" },
    "c.state": { headline: "Seçim şu anda ne durumda?", edges: [{ label: "Dönüştü", detail: "seçimden herhangi bir ürünü içeren bir sipariş kaydedildi" }, { label: "Temizlendi", detail: "kişi tüm ürünleri kaldırdı ya da seçimi sildi" }, { label: "Sürece taşındı", detail: "seçimden bir süreç başlatıldı" }, { label: "Değişti, hâlâ duruyor", detail: "bir ürün eklendi veya kaldırıldı ve en az biri kalıyor - kişi hâlâ karar veriyor" }, { label: "Hâlâ duruyor", detail: "seçim olduğu gibi duruyor" }] },
    "x.converted": { headline: "dönüştü; seçili bir ürünü içeren bir sipariş kaydedildi", detail: "yeni bir seçim yeni bir örnektir; bu örnek dönüşüm gerçekleşmiş olarak kapatılır" },
    "x.invalid": { headline: "kişi tarafından temizlendi; başka hiçbir şey gönderilmez", detail: "yeni bir seçim yeni bir örnektir" },
    "h.process": { headline: "Süreç başladı → terk onaylandı → kurtarıldı, yerini yenisi aldı veya sona erdi", detail: "seçimden başlatılan bir süreç - o andan itibaren kurtarmayı süreç yürütür" },
    "c.rearm-budget": {
      headline: "Yeniden başlatma bütçesi hâlâ mevcut mu?",
      edges: [
        { label: "Bütçe mevcut", detail: "bu örneğe karşı, selection.rearm_limit'in izin verdiğinden daha az sayıda yeniden başlatma kullanılmış" },
        { label: "Bütçe tükendi", detail: "örnek açıldığında belirlenen yeniden başlatma bütçesi zaten kullanılmış - hâlâ tuttuğu bir seçimi değiştirmeye devam eden bir kişi hâlâ karar veriyordur, ama bekleme sonsuza kadar yeniden başlatılmaz" },
      ],
    },
    "a.rearm": { headline: "Değişikliği kaydet ve ilk beklemeyi, sınırlı sayıda olmak üzere, yeni son etkinlikten itibaren yeniden başlat. Seçimini hâlâ düzenleyen bir kişi unutmuyor, karar veriyordur" },
    "c.availability": { headline: "Bunlardan herhangi biri hâlâ işleme alınabilir mi?", edges: [{ label: "En az bir ürün mevcut", detail: "platform, seçili ürünlerden en az birinin mevcut olduğunu belirtiyor" }, { label: "Hiçbiri mevcut değil", detail: "platform, seçili ürünlerin tamamının mevcut olmadığını belirtiyor" }] },
    "c.sendable": { headline: "İlk temas gönderilebilir mi?", edges: [{ label: "Gönderilebilir", detail: "gönderim yolu geçerli: ticari kurtarma izni var, ulaşılabilir bir hedef var, promosyon iletişim yoğunluğu limiti aşılmadı, kişi üzerinde daha yüksek öncelikli bir çakışma yok ve yürürlükte bir bekleme süresi yok" }, { label: "Gönderilmez", detail: "baskılama gerekçesi kaydedilir" }] },
    "x.unavailable": { headline: "seçili tüm ürünler mevcut değil; işleme alınamayan ürünler hakkında hiçbir şey gönderilmez", detail: "mevcudiyetin geri gelmesi, burada bir yeniden giriş değil, daha sonraki bir mevcudiyet süreci için yetkili bir olaydır" },
    "a.touch1": { headline: "Seçimi şu anki haliyle göster - yalnızca platformun mevcut olduğunu belirttiği ürünleri - ve onu yeniden açan bağlantıyı ver. Sistemin iddia etmediği hiçbir şeyi iddia etme: ne rezerve stok, ne tutulan fiyat, ne indirim, ne son tarih" },
    "a.record-no-action": { headline: "Temasın hangi seçim için hangi engel tarafından durdurulduğunu kaydet; böylece işlem yapılmaması sessiz bir yokluk değil, ölçülmüş bir sonuç olur" },
    "w.second": { headline: "seçimden en az bir ürünü içeren bir sipariş veya tamamlanma kaydedilene kadar, ya da kişi seçimdeki tüm ürünleri kaldırana kadar, ya da seçim silinene kadar, ya da en az bir ürün ve sürdürülebilir bir durumla bir kişi için sürdürülebilir bir sürecin (ödeme, başvuru, teklif, kayıt) açıldığına dair yetkili bir kayıt oluşana kadar, ya da platform seçimdeki bir ürünün artık satın alınamaz olduğunu belirtene kadar, ya da platform seçimdeki bir üründe fiyat değişikliği belirtene kadar", detail: "İkinci kontrol, kişinin ilk temasa kendi zamanında tepki verme fırsatı bulmasından sonra, ama seçim hatırlanabilir olmaktan çıkmadan önce yapılır. (örnek: 2–4 gün; selection.second_check ayarlanmalı)" },
    "c.state2": { headline: "Seçim şu anda ne durumda ve onunla ilgili bir şey değişti mi?", edges: [{ label: "Dönüştü", detail: "seçimden herhangi bir ürünü içeren bir sipariş kaydedildi" }, { label: "Temizlendi", detail: "kişi tüm ürünleri kaldırdı ya da seçimi sildi" }, { label: "Sürece taşındı", detail: "seçimden bir süreç başlatıldı" }, { label: "Hiçbiri mevcut değil", detail: "platform artık seçili ürünlerin tamamının mevcut olmadığını belirtiyor" }, { label: "Hâlâ duruyor", detail: "en az bir ürün, değişmiş olsun ya da olmasın, hâlâ duruyor ve mevcut" }] },
    "c.sendable2": { headline: "İkinci temas gönderilebilir mi?", edges: [{ label: "Gönderilebilir", detail: "gönderim yolu geçerli ve temas bütçesi tükenmedi" }, { label: "Gönderilmez", detail: "baskılama gerekçesi kaydedilir" }] },
    "a.touch2": { headline: "Seçimi, tutulan bir üründe platformun belirttiği gerçek bir değişiklikle - mevcudiyet geri geldi, fiyat değişti - birlikte yeniden göster ve aynı bağlantıyı ver. Sistemin iddia etmediği hiçbir aciliyet, ve politika son temas için özel olarak izin vermedikçe hiçbir teşvik kullanılmaz" },
    "w.final": { headline: "seçimden en az bir ürünü içeren bir sipariş veya tamamlanma kaydedilene kadar, ya da kişi seçimdeki tüm ürünleri kaldırana kadar, ya da seçim silinene kadar, ya da en az bir ürün ve sürdürülebilir bir durumla bir kişi için sürdürülebilir bir sürecin (ödeme, başvuru, teklif, kayıt) açıldığına dair yetkili bir kayıt oluşana kadar", detail: "Kurtarma süresi, tutulan bir seçimin hâlâ bir kayıt değil bir niyet olarak sayıldığı dönemdir; bu sürenin ötesinde hiçbir şey gönderilmez. (örnek: 7–14 gün; selection.lifetime ayarlanmalı)" },
    "c.state3": { headline: "Kurtarma süresinin sonunda seçim ne durumda?", edges: [{ label: "Dönüştü", detail: "seçimden herhangi bir ürünü içeren bir sipariş kaydedildi" }, { label: "Temizlendi", detail: "kişi tüm ürünleri kaldırdı ya da seçimi sildi" }, { label: "Sürece taşındı", detail: "seçimden bir süreç başlatıldı" }, { label: "Hâlâ duruyor", detail: "seçim duruyor; başka hiçbir şey gönderilmez" }] },
    "x.lapsed": { headline: "kurtarma süresi, seçim hâlâ dururken doldu; başka hiçbir şey gönderilmez", detail: "yeni bir seçim yeni bir örnektir ve bekleme süresi işlerken sessizce başlar" },
  },
  },
  "ACQ-13": {
  shortName: "Çözümlenmemiş İlgi Kurtarma",
  name: "Çıkarsanan ilgi → yeterli bulundu → seçime veya satın almaya dönüştü, ya da kendi haline bırakıldı",
  purpose: "Bir ürüne, kategoriye veya aramaya yönelik, yeterli bulunmuş ama çözümlenmemiş ilgiyi - ne bir seçimle ne de bir süreçle sonuçlanan gezinmeyi - en fazla bir temasla takip etmek ve ilgi yeterli bulunmadığında işlem yapılmamasını normal sonuç olarak kaydetmek.",
  nodes: {
    "t.interest": { headline: "İlgi sinyali kaydedildi" },
    "c.qualify": { headline: "Bu ilgi, yeterli bulunan bir ilgi sayılıyor mu ve hâlâ çözümlenmedi mi?", edges: [{ label: "Yeterli bulundu ve çözümlenmedi", detail: "yeterlilik kuralı sağlanıyor, bir seçim, sipariş veya süreç izlenmedi, konu mevcut, izin kayıtlı ve açık bir örnek yok" }, { label: "Zaten çözümlendi", detail: "ilgiden bu yana konu için bir seçim, sipariş veya süreç mevcut" }, { label: "Yeterli bulunmadı", detail: "kural sağlanmıyor, konu mevcut değil ya da zaten tutuluyor, ya da izin yok - neden kaydedilir" }] },
    "a.open": { headline: "İlgi örneğini kişiye ve ilgi anahtarına karşı aç ve sayacı son ilgiden başlat. Temastan önceki ek ilgi sayacı ileri alır; sonrasındaki hiçbir şey pencereyi uzatmaz" },
    "x.resolved": { headline: "çözümlendi; konu için bir seçim, süreç veya satın alma kaydedildi - bu, kendi sürecinin gerçek tetikleyicisidir (sepete geri dönerek yapılan bir seçim, ACQ-288'in kendi giriş olayıdır), bu sürecin doğrudan yönlendirdiği bir şey değil", detail: "yeni bir ilgi anahtarı yeni bir ilgidir" },
    "a.record-no-action": { headline: "Hiçbir şeyin gönderilmeme nedenini kaydet - yeterli bulunmadı, mevcut değil, zaten tutuluyor, izin yok ya da gönderim yolunda bir engel var - böylece burada sık görülen sonuç olan işlem yapılmaması ölçülmüş bir sonuç olur" },
    "w.settle": { headline: "kişiye karşı bir süreç başlatılmadan sistem kaydında bir seçim kaydedilene kadar, ya da en az bir ürün ve sürdürülebilir bir durumla bir kişi için sürdürülebilir bir sürecin (ödeme, başvuru, teklif, kayıt) açıldığına dair yetkili bir kayıt oluşana kadar, ya da kişi için herhangi bir konuda yetkili bir satın alma gerçekleşene kadar", detail: "Temas, kişinin konuda duraklamadığından, gerçekten ayrıldığından emin olacak kadar - ama ilgi tazeliğini yitirmeden önce - son ilgiden sonra bekler. (örnek: 6–24 saat; interest.settle_window ayarlanmalı)" },
    "x.no-action": { headline: "hiçbir temas gönderilmedi; neden kaydedildi - bu sürecin sık görülen sonucu", detail: "aynı ilgi anahtarının bekleme süresi içinde yeniden yeterli bulunması aynı ilgidir; yeni bir anahtar yeni bir ilgidir" },
    "c.state": { headline: "İlgi hâlâ çözümlenmedi mi ve konusu hâlâ mevcut mu?", edges: [{ label: "Çözümlenmedi, konu mevcut", detail: "bir seçim, sipariş veya süreç izlenmedi ve platform konunun mevcut olduğunu belirtiyor" }, { label: "Bu arada çözümlendi", detail: "konu için bir seçim, sipariş veya süreç kaydedildi" }, { label: "Konu kayboldu", detail: "platform artık konunun mevcut olmadığını belirtiyor" }] },
    "c.sendable": { headline: "Temas gönderilebilir mi?", edges: [{ label: "Gönderilebilir", detail: "gönderim yolu geçerli: ticari kurtarma izni var, ulaşılabilir bir hedef var, promosyon iletişim yoğunluğu limiti aşılmadı, kişi üzerinde daha yüksek öncelikli bir çakışma yok ve yürürlükte bir bekleme süresi yok" }, { label: "Gönderilmez", detail: "baskılama gerekçesi kaydedilir" }] },
    "x.unavailable": { headline: "konu artık mevcut değil; kişinin işleme alamayacağı bir şey hakkında hiçbir şey gönderilmez", detail: "yeni bir ilgi anahtarı yeni bir ilgidir" },
    "a.touch1": { headline: "Baktıkları şeyi şu anki haliyle göster ve ona geri dönecek bir yol ver. Sistemin iddia etmediği hiçbir şeyi iddia etme: ne rezerve stok, ne tutulan fiyat, ne indirim, ne de ne kastettiklerine dair bir varsayım" },
    "w.after": { headline: "kişiye karşı bir süreç başlatılmadan sistem kaydında bir seçim kaydedilene kadar, ya da en az bir ürün ve sürdürülebilir bir durumla bir kişi için sürdürülebilir bir sürecin (ödeme, başvuru, teklif, kayıt) açıldığına dair yetkili bir kayıt oluşana kadar, ya da kişi için herhangi bir konuda yetkili bir satın alma gerçekleşene kadar", detail: "Tek temastan sonra örnek, yalnızca bir çözümlenmeyi gözlemleyecek kadar açık kalır; ardından süresi dolar ve başka hiçbir şey gönderilmez. (örnek: 3–7 gün; interest.lifetime ayarlanmalı)" },
    "x.lapsed": { headline: "bir kez temas edildi, çözümlenmedi; başka hiçbir şey gönderilmez", detail: "yeni bir ilgi anahtarı yeni bir ilgidir ve bekleme süresi işlerken sessizce başlar" },
  },
  },
  "ACQ-285": {
  shortName: "Yeni Aday müşteri Karşılama",
  name: "Yakalanan ilgi → hazır olma kontrolü → hedefe uygun ilk temas",
  purpose: "Belirtilen bir ilgiyi, o ilginin gerçekte talep ettiği şeyle yanıtlamak ve kişinin kendisi hakkında söylediklerinin haklı kıldığı noktaya kadar ilerletmek.",
  nodes: {
    "t.captured": { headline: "Birinci taraf ilgi sinyali yakalandı" },
    "c.contactable": { headline: "Sağladıkları hedef bunun için gerçekten kullanılabilir mi?", edges: [{ label: "Kullanılabilir", detail: "sağlanan hedef geçerli, ulaşılabilir ve talep edileni karşılamak için izinli" }, { label: "Kullanılamaz", detail: "geçerli, ulaşılabilir bir hedef sağlanmadı ya da bu karşılama için izinli değil" }] },
    "c.declared": { headline: "Kişi gerçekte ne belirtti?", edges: [{ label: "Bir kişi talep etti", detail: "yakalama, yalnızca bir kişinin yanıtlayabileceği bir talep içeriyor - bir görüşme, kendi durumuna özel bir fiyat, bir değerlendirme" }, { label: "İçerik talep etti", detail: "yakalama bir belge, erişim veya bildirim talep ediyor ve bir kişi tarafından yürütülecek bir talep belirtmiyor" }] },
    "c.declared-no-route": { headline: "Kendilerine ulaşamadığımıza göre ne talep ettiler?", edges: [{ label: "Bir kişi talep etti", detail: "talep içerik için değil, iletişim içindi" }, { label: "İçerik talep etti", detail: "talep, göndermiş olacağımız bir şey içindi ama gönderilecek bir yer yok" }] },
    "a.first-touch": { headline: "Talep ettiklerini gönder ve bir kişinin ne zaman geri döneceğini belirterek takip edeceğini söyle. Zamanı belirtilmeyen bir takip vaadi, bir yanıt değil bir sıra gibi algılanır ve kişi başka bir yerde yeniden başlar" },
    "a.deliver": { headline: "Yakalamanın talep ettiği şeyi, bir kez ve tam olarak gönder; kişinin talep etmediği hiçbir şeyi yanına ekleme. Karşılama talebe dayanır; bunun ötesindeki her şey izne dayanır ve ikisi birlikte gönderilmemelidir" },
    "h.person": { headline: "external:sales-assignment", detail: "belirtilen talebi yalnızca bir kişinin yanıtlayabileceği, yakalanmış bir ilgi" },
    "x.no-delivery-route": { headline: "yakalandı ama ulaştırılabilecek hiçbir şey yok; talep karşılanmadı", detail: "daha sonra sağlanacak geçerli ve izinli bir hedef, aynı talebi karşılanabilir hale getirir" },
    "c.permission": { headline: "Karşılamanın ötesine geçmek için izin var mı?", edges: [{ label: "İzinli", detail: "sürekli iletişimi kapsayan bir izin, yakalama sırasında verildi ve kendi başına bir gerçek olarak kaydedildi" }, { label: "Yalnızca karşılama", detail: "talep edilen tek teslimatın ötesinde hiçbir şeye izin verilmedi" }] },
    "x.delivered": { headline: "karşılandı, sürekli iletişime izin verilmedi", detail: "izin taşıyan daha sonraki bir yakalama, sınırlı yolu açar" },
    "w.follow-up": { headline: "kişi nereye gittiğini belirten bir şey yapana kadar - bir yanıt, bir görüşme talebi, bir satın alma - ya da bu iletişimin dayandığı izni geri çekene kadar", detail: "Zaman aşımı: karşılamanın ötesine geçmeden önce, kişiye kendi başına bir hedef belirtmesi için zaman tanınır. (welcome.follow_up ayarlanmalı)" },
    "c.still-open": {
      headline: "Bu hâlâ hiçbir şey belirtmemiş bir aday müşteri mi?",
      edges: [
        { label: "Hazır olduğunu belirtti", detail: "kişi karşılamadan bu yana, artık hazır olduğu bir hedefi belirten bir şey yaptı" },
        { label: "İzin geri çekildi", detail: "yakalama sırasında kaydedilen izin artık sürekli iletişimi kapsamıyor" },
        { label: "Hâlâ açık", detail: "hiçbir hedef belirtilmedi, yakalama sırasında kaydedilen izin hâlâ geçerli ve iletişim hedefi hâlâ ulaşılabilir" },
      ],
    },
    "a.follow-up": { headline: "Belirttikleri konuda tek bir ek mesaj gönder; bunun karşılamanın sonuncusu olduğunu ve bundan sonra ne olacağını açıkça belirt. Sonu belirtilmeyen bir dizi, kimsenin kabul etmediği bir abonelik gibidir ve öyle hatırlanır" },
    "w.window": { headline: "kişi nereye gittiğini belirten bir şey yapana kadar - bir yanıt, bir görüşme talebi, bir satın alma - ya da bu iletişimin dayandığı izni geri çekene kadar", detail: "Zaman aşımı: sınırlı karşılamanın belirtilen süresi doluyor. (welcome.window ayarlanmalı)" },
    "c.progressed": { headline: "Bekleyişi ne sonlandırdı?", edges: [{ label: "Hazır olduğunu belirtti", detail: "kişi, artık hazır olduğu bir hedefi belirten bir şey yaptı" }, { label: "Durduruldu", detail: "kişi izni geri çekti ya da durdurulmasını istedi" }] },
    "x.sunset": { headline: "karşılama sona erdi, hedef belirtilmedi", detail: "aynı kişiden gelecek daha sonraki bir yakalama, kendi hedefiyle kendi örneğini oluşturur" },
    "x.stopped": { headline: "kişinin talebi üzerine durduruldu", detail: "kendi izniyle gelecek daha sonraki bir yakalama yeni bir örnektir; bu örnek asla sürdürülmez" },
  },
  },
  "ACT-11": {
  shortName: "Onboarding Rota Ataması",
  name: "Yeni kayıt → onboarding rotası → uygun yol",
  purpose: "Değere ulaşmak için fiilen gereken işten yola çıkarak onboarding yolunu seç, bu iş başlamadan önce.",
  nodes: {
    "t.entry": { headline: "Yetkili yaşam döngüsü girişi" },
    "a.context": { headline: "Onboarding bağlamını oku: belirtilen hedef, rol, ürün veya kullanım senaryosu, kurulum karmaşıklığı, hesap veya organizasyon türü, varsa uygulama gereksinimi ve yardım talebi. Plan katmanı bunların hiçbirinin yerine geçmez" },
    "c.assisted": { headline: "Buradaki değere ulaşmak destekli onboarding gerektiriyor mu?", edges: [{ label: "Destekli", detail: "kurulum işi gerçekten bir kişi gerektiriyor: bir uygulama, bir geçiş, hesabın tek başına tamamlayamayacağı bir yapılandırma veya açıkça talep edilen bir yardım" }, { label: "Kendi kendine", detail: "kurulum işi, değeri veya planı ne olursa olsun, hesabın tek başına tamamlayabileceği kapsamda" }] },
    "a.assisted": { headline: "Destekli rotayı kaydet ve bu onboarding'e bir insan sahip atayan iç görevi oluştur - rota, onboarding'in bir özelliğidir ve sonraki her adıma taşınır" },
    "a.self-service": { headline: "Kendi kendine rotayı kaydet; bu rota daha sonra değiştirilebilir: ileride bir kişiye ihtiyaç duyulduğunun anlaşılması bir başarısızlık değil, yeniden yönlendirmedir" },
    "c.prerequisite": { headline: "Onboarding'in başlayabilmesi için kritik bir ön koşul eksik mi?", edges: [{ label: "Başlangıçta tıkandı", detail: "adı konmuş ve zorunlu bir şey eksik - bir doğrulama, bir erişim izni, gerekli bir taraf - ve bu olmadan anlamlı hiçbir şey ilerleyemez" }, { label: "Başlamaya hazır", detail: "bekleyen zorunlu bir ön koşul yok; tamamlanmamış isteğe bağlı alanlar sayılmaz" }] },
    "h.requirement": { headline: "Eksik aktivasyon gereksinimi → engeli çöz → devam et", detail: "onboarding başlamadan önce eksik olan zorunlu bir ön koşul" },
    "x.ready": { headline: "rota seçildi, başlangıcı engelleyen bir şey yok; hesap kendi başına kuruluma başlamaya hazır", detail: "sonradan keşfedilen zorunlu bir ön koşul kendi örneğidir (ACT-13)" },
  },
  },
  "ACT-13": {
  shortName: "Onboarding Engel Hatırlatması",
  name: "Eksik aktivasyon gereksinimi → engeli çöz → devam et",
  purpose: "Tüm süreci adı konmuş tek bir eksik şeye yönelt ve o var olduğunda onboarding'e devam et.",
  nodes: {
    "t.blocked": { headline: "Aktivasyon, adı konmuş bir gereksinim tarafından engellendi" },
    "a.identify": { headline: "Tam olarak hangi gereksinimin neyi engellediğini belirle, böylece sonraki her adım genel bir kurulum tarifi yerine bunu adıyla anabilir" },
    "c.blocking": { headline: "Bu gereksinim fiilen aktivasyonu engelliyor mu?", edges: [{ label: "Gerçekten engelliyor", detail: "bu karşılanmadan aktivasyon gerçekleşemez" }, { label: "Eksik ama engellemiyor", detail: "alan veya adım eksik ama değer bu olmadan da üretilebilir" }] },
    "c.self-resolvable": { headline: "Bu hesap gereksinimi doğrudan çözebilir mi?", edges: [{ label: "Evet, doğrudan", detail: "hesap gerekli erişime, bilgiye ve izne sahip" }, { label: "Hayır, başkasına bağlı", detail: "başka bir ekibe, bir iç sürece, üçüncü bir tarafa veya henüz katılmamış bir kişiye ihtiyaç var" }] },
    "x.not-blocking": { headline: "engel değil; olağan onboarding sürüyor", detail: "aynı gereksinim ileride zorunlu hâle gelirse, gerçek bir engel olarak devreye girer; şimdiden öyleymiş gibi sunmak, insanlara önemli olanları görmezden gelmeyi öğretir" },
    "a.specific-action": { headline: "Bu gereksinimi ortadan kaldıracak tek somut eylemi, adı konarak belirt - kurulumu tamamlamaya yönelik genel bir uyarı değil; zaten tıkanmış birine zaten bildiği bir şeyi söylemenin bir anlamı yok" },
    "a.route-dependency": { headline: "Gereksinimi, neyin neden engellendiğini de aktararak fiilen çözebilecek kişiye ilet. Devam ettirme sorumluluğu burada kalır, böylece hesap devredilip unutulmaz" },
    "a.hold-notice": { headline: "Bekleyen gereksinimi adıyla belirt, bunun artık çözebilecek tarafta olduğunu söyle ve karşılandığında ne olacağını anlat. Hesaptan hiçbir şey yapmasını istemez - bu, yapamayacakları daldır" },
    "w.resolve": { headline: "ilerlemeyi engelleyen, adı konmuş belirli gereksinim karşılanmış olarak kaydedilene kadar", detail: "zaman aşımı: Bu gereksinime uygun çözüm ufku. (activation_blocker.resolve üzerinden yapılandırılır)" },
    "a.stop-reminders": { headline: "Bu gereksinimle ilgili her hatırlatmayı, kuyrukta bekleyenler dahil, hemen durdur - kişinin az önce tamamladığı bir şey için gönderilen bir hatırlatma, hiç kimsenin takip etmediğinin en net göstergesidir" },
    "c.unresolved": { headline: "Çözülmemiş bu gereksinim ne gerektiriyor?", edges: [{ label: "Bir kişiye yükselt", detail: "gereksinim sonuç açısından yeterince önemli, artık bir insanın sahiplenmesi gerekiyor" }, { label: "Alternatif bir yol var", detail: "değere, bu gereksinime ihtiyaç duymayan farklı bir yoldan ulaşılabilir" }, { label: "Yol yok", detail: "gereksinim zorunlu ve ne çözülebilir ne de atlanabilir" }] },
    "c.next-blocker": { headline: "Bu gereksinim karşılandığına göre, aktivasyona artık ulaşılabiliyor mu?", edges: [{ label: "Ulaşılabilir", detail: "bekleyen başka bir zorunlu gereksinim yok" }, { label: "Başka bir gereksinim engelliyor", detail: "bunun çözülmesi ikinci bir zorunlu gereksinimi ortaya çıkardı" }] },
    "h.escalate": { headline: "external:human-in-the-loop-yaşam döngüsü", detail: "çözüm ufkunu aşan bir engel" },
    "h.reroute": { headline: "Yeni kayıt → onboarding rotası → uygun yol", detail: "engellenen şeye ihtiyaç duymayan, değere giden alternatif bir yol" },
    "x.blocked": { headline: "aktivasyon engellendi, kullanılabilir bir yol yok", detail: "gereksinim ileride karşılanabilir hâle gelirse bu yeniden açılır; bu arada aynı şey tekrar tekrar istenmez" },
    "x.unblocked": { headline: "engel kalktı ve aktivasyona yeniden ulaşılabilir; kurulum durumu şu anki haliyle kalır, baştan başlamak yerine kaldığı yerden devam eder", detail: "sonradan keşfedilen bir gereksinim kendi örneğini açar" },
    "x.next-blocker": { headline: "çözüldü; şimdi başka bir gereksinim engelliyor", detail: "sonraki gereksinim kendi terimleriyle adlandırılan kendi örneğini açar - bunları tek bir mesajda üst üste yığmak, somut bir engelin yeniden genel bir kurulum baskısına dönüşmesine yol açar" },
  },
  },
  "ACT-14": {
  shortName: "Onboarding Yardımı",
  name: "Zorlanan kullanıcı tespiti → proaktif destek → kurtarma veya çıkış",
  purpose: "Açıkça çabalayan ama bir yere varamayan kişiye yardım teklif et ve yanıt verdiğinde sormayı bırak.",
  nodes: {
    "t.struggling": { headline: "Aktivasyonda ilerleme olmadan yardım arayışı" },
    "c.hard-entry": { headline: "Kesin giriş koşulları sağlanıyor mu?", edges: [{ label: "Uygun", detail: "onboarding veya deneme hâlâ açık ve temel aktivasyon henüz kaydedilmedi" }, { label: "Uygun değil", detail: "örnek kapandı ya da aktivasyon zaten gerçekleşti - bu durumda yardım arayışı başka bir şeyle ilgili" }] },
    "c.duplicate": { headline: "Bu engel üzerinde zaten çalışan bir kişi var mı?", edges: [{ label: "ACT-13 veya bir kişi zaten üstlendi", detail: "açık bir destek talebi veya atanmış bir insan sahibi aynı konuyu kapsıyor, ya da ACT-13 bu örnekte adı konmuş bir gereksinimi zaten sahipleniyor - zorlanma neredeyse her zaman o gereksinimden kaynaklanıyor ve bir engel hatırlatmasının yanına yardım teklifi eklemek, tek bir soruna iki sesle yaklaşmak demek" }, { label: "Kimse ilgilenmiyor", detail: "bunu kapsayan açık bir talep veya sahip yok" }] },
    "x.not-eligible": { headline: "kurtarma kapsamında değil", detail: "açık, aktifleşmemiş bir örnekte ileride yaşanan bir zorlanma normal şekilde nitelik kazanır" },
    "x.defer": { headline: "zaten ilgilenen kişiye bırakıldı", detail: "o talep zorlanma çözülmeden kapanırsa bu yeniden nitelik kazanır - tek bir soruna iki kanaldan gitmek, tek bir yavaş kanaldan daha kötüdür" },
    "a.offer": { headline: "Sürekli takıldıkları adıma özel, adı konmuş bir yardım teklif et. Birincil yol destekli kurulum randevusu alır; ikincil yol, kimseyle konuşmak istemeyenler için o adıma özel kılavuzu açar" },
    "w.response": { headline: "destekli bir görüşme ayarlanana, bu onboarding için yetkili aktivasyon olayı kaydedilene ya da kişi yardım teklifini açıkça reddedene kadar", detail: "zaman aşımı: Sınırlı bir yanıt penceresi. (struggling_user.response üzerinden yapılandırılır)" },
    "c.what-happened": { headline: "Ne yaptılar?", edges: [{ label: "Randevu aldı", detail: "destekli bir görüşme planlandı" }, { label: "Kendi başına çözdü", detail: "aktivasyon olayı herhangi bir görüşme olmadan kaydedildi" }, { label: "Reddetti", detail: "teklif açıkça reddedildi" }] },
    "c.final-option": { headline: "Yanıt gelmediğinde, son bir kendi kendine seçenek gönderilmeye değer mi?", edges: [{ label: "Değer", detail: "takıldıkları adım için özel bir kılavuz mevcut" }, { label: "Değmez", detail: "işaret edilecek somut bir şey yok ve genel bir hatırlatma sadece teklifi tekrarlamış olur" }] },
    "a.confirm": { headline: "Saati, katılım şeklini ve görüşmenin, takıldıkları adımdan alınan somut sorunla açılacağını teyit et" },
    "h.activated": { headline: "Aktivasyona ulaşıldı → onboarding'i durdur → benimseme devri", detail: "görüşme olsun olmasın aktivasyona ulaşıldı" },
    "x.declined": { headline: "yardım reddedildi, bekleme süresi devrede", detail: "bekleme süresinden sonra yaşanan yeni bir zorlanma yeniden nitelik kazanabilir; zaten hayır demiş birine aynı teklif tekrar gönderilmez" },
    "a.final": { headline: "Son bir kendi kendine seçenek gönder ve dur. Görüşme üçüncü kez teklif edilmez" },
    "x.normal": { headline: "kurtarma girişimi kapandı, olağan yaşam döngüsü devam ediyor", detail: "bekleme süresinden sonra, açık ve aktifleşmemiş bir örnekte yaşanan yeni bir zorlanma" },
    "w.session": { headline: "destekli görüşmenin sonucu kaydedilene ya da randevu sistem kaydında iptal edilene kadar", detail: "zaman aşımı: Planlanan görüşme saati artı kısa bir ek süre. (struggling_user.session üzerinden yapılandırılır)" },
    "c.outcome": { headline: "Yardımın ardından aktivasyon gerçekleşti mi?", edges: [{ label: "Aktifleşti", detail: "yetkili aktivasyon olayı görüşmenin ardından kaydedildi" }, { label: "Hâlâ aktifleşmedi", detail: "görüşme gerçekleşti ama değer hâlâ üretilmedi" }] },
    "x.no-outcome": { headline: "görüşme sonucu kaydedilmedi", detail: "bu örnekte yardım teklifi tekrarlanmaz; bekleme süresinden sonraki yeni bir zorlanma ayrı bir konudur" },
    "c.followup": { headline: "Gerçekten faydalı bir takip adımı kaldı mı?", edges: [{ label: "Evet", detail: "görüşme, adı konmaya değer somut bir kalan eylemi ortaya çıkardı" }, { label: "Hayır", detail: "somut bir şey çıkmadı ve bir takip mesajı sadece teklifi tekrarlamış olurdu" }] },
    "a.followup": { headline: "Görüşmede fiilen ele alınana bağlı tek bir takip mesajı gönder. İkincisi yok, yeni bir görüşme talebi de yok" },
  },
  },
  "ACT-16": {
  shortName: "Onboarding Tamamlanma Devri",
  name: "Aktivasyona ulaşıldı → onboarding'i durdur → benimseme devri",
  purpose: "Aktivasyon kaydedilir kaydedilmez onboarding'in, kuyrukta bekleyen mesajlar dahil, süreci bırakmasını sağla.",
  nodes: {
    "t.activated": { headline: "Yetkili temel aktivasyon olayı" },
    "c.authoritative": { headline: "Bu, ürünün üretilen değer kaydından mı geldi?", edges: [{ label: "Yetkili", detail: "ürün, değer üreten olayı kaydetti" }, { label: "Vekil sinyal", detail: "sinyal, bir mesajla etkileşimi veya ürün içi gezinmeyi tanımlıyor" }] },
    "a.complete": { headline: "Onboarding hedefini tamamlanmış olarak işaretle ve bunu hangi olayın karşıladığını kaydet - böylece bu hesabın ne zaman aktifleştiği sorusunun bir tahmin değil, tek bir yanıtı olur" },
    "x.not-activation": { headline: "aktivasyon kaydedilmedi; onboarding değişmeden sürüyor", detail: "gerçek olay meydana geldiğinde üründen gelir ve uygun bir örnek açar" },
    "a.invalidate": { headline: "Onboarding'de kalan her şeyi geçersiz kıl: bekleyen kurulum hatırlatmaları, onboarding harekete geçirme çağrıları, artık doğru olmayan tamamlanmamış-adım mesajları ve amacı az önce ortadan kalkmış yardım uyarıları - kuyrukta bekleyenler dahil" },
    "c.mandatory": { headline: "Bekleyen zorunlu bir operasyonel gereksinim var mı?", edges: [{ label: "Hâlâ gereken bir şey var", detail: "operasyonel bir yükümlülük karşılanmadı - bir doğrulama, bir fatura bilgisi, bir uyumluluk adımı - bunların hiçbiri değeri engellemedi ama hepsinin gerçekleşmesi gerekiyor" }, { label: "Bekleyen bir şey yok", detail: "olağan kullanımın ötesinde kalan bir yükümlülük yok" }] },
    "a.spin-off": { headline: "Bekleyen operasyonel gereksinimi kendi yaşam döngüsüne devret. Bu, onboarding'i açık tutmaz ve onboarding onun adına mesaj göndermeye devam etmez" },
    "h.adoption": { headline: "Erken benimseme → kullanım derinliği → alışkanlık veya kararlı kullanım", detail: "aktivasyon kaydedildi ve onboarding kapandı" },
  },
  },
  "ACT-17": {
  shortName: "Benimseme Besleme",
  name: "Erken benimseme → kullanım derinliği → alışkanlık veya kararlı kullanım",
  purpose: "Bir hesabı, değeri bir kez üretmiş olmaktan, kendi kullanım senaryosuna göre ölçülen tekrarlı üretime taşı.",
  nodes: {
    "t.activated": { headline: "Temel aktivasyon tamamlandı" },
    "c.next": { headline: "Az önce yaptıklarından doğal bir sonraki eylem çıkıyor mu?", edges: [{ label: "Evet", detail: "ürettikleri şeyden somut bir şey doğuyor - onu paylaşmak, tekrarlamak, genişletmek" }, { label: "Hayır", detail: "gerçekten hiçbir şey doğmuyor ve uydurma bir sonraki adım, takdiri bir satış mesajına dönüştürür" }] },
    "a.recognize-next": { headline: "Fiilen üretileni, kendi terimleriyle takdir et ve ürettikleri şeyden doğan tek bir sonraki eylemi adlandır: onu paylaşmak, tekrarlamak, genişletmek. Gerçek bir şeyi adlandırmayan bir takdir, sessizlikten daha kötüdür" },
    "a.recognize-only": { headline: "Fiilen üretileni, kendi terimleriyle takdir et ve başka bir şey söyleme - uydurma bir sonraki adım, takdiri bir satış mesajına dönüştürür. Gerçek bir şeyi adlandırmayan bir takdir, sessizlikten daha kötüdür" },
    "c.stable": { headline: "Benimseme kararlı hâle geldi mi?", edges: [{ label: "Kararlı", detail: "değer, bu kullanım senaryosunun gerektirdiği ritimde, herhangi bir hatırlatma olmadan tekrar tekrar üretiliyor" }, { label: "Henüz değil", detail: "değer üretildi ama güvenilir şekilde tekrarlanmadı" }] },
    "h.normal": { headline: "external:customer-yaşam döngüsü", detail: "benimseme kararlılaşıyor" },
    "a.next-behavior": { headline: "Bu kullanım senaryosu için fiilen daha fazla değer üretecek sonraki davranışı belirle ve yalnızca onu teşvik et. Değer dar olduğunda genişlik hedeflenmez - tek bir iş akışından ihtiyacı olan her şeyi alan bir kişi, eksik benimsemiş değil, benimsemiş sayılır" },
    "w.observe": { headline: "ürün, kişinin bu kullanım senaryosunda tekrar değer ürettiğini kaydedene kadar", detail: "zaman aşımı: Erken benimseme penceresi, ürünün bu kullanım senaryosu için öngördüğü kullanım ritmidir; haftalık bir ürün ile yılda iki kez kullanılan bir ürün aynı pencereyi paylaşamaz, paylaşılan bir pencere ise her mevsimsel hesabı başarısız gibi gösterir. (adoption.observation_window üzerinden yapılandırılır)" },
    "w.confirm": { headline: "ürün, kişinin bu kullanım senaryosunda tekrar değer ürettiğini kaydedene kadar", detail: "zaman aşımı: Hatırlatmadan önceki aynı gözlem penceresi geçerlidir - kullanım senaryosunun ritmi değişmedi. (adoption.observation_window üzerinden yapılandırılır)" },
    "c.stable-after-nudge": { headline: "Şimdi tekrarlanıyor mu?", edges: [{ label: "Evet", detail: "değer, hatırlatmanın ardından bu kullanım senaryosunun gerektirdiği ritimde tekrar tekrar üretiliyor" }, { label: "Hâlâ değil", detail: "hatırlatma gönderildi ve değer hâlâ tekrarlanmadı" }] },
    "x.stalled": { headline: "Durdu", detail: "aynı kullanım senaryosunda yeni bir aktivasyon kendi örneğini açar" },
  },
  },
  "ACT-20": {
  shortName: "Uyuyan Aday Yeniden Aktifleştirme",
  name: "Uykuda müşteri olmayan kişinin yeniden aktifleştirilmesi → geri dönüş → yeniden nitelendirme veya çıkış",
  purpose: "Hiç ödeme yapan bir ilişkiye dönüşmemiş bir bağlantıyı yeniden başlatmak için sınırlı bir girişimde bulun ve sonucu kişinin fiilen yaptığına göre değerlendir.",
  nodes: {
    "t.dormant": { headline: "Etkileşimli, müşteri olmayan kişi uykuya geçti" },
    "c.never-monetized": { headline: "Bu ilişki bu bağlamda hiç parasallaştı mı?", edges: [{ label: "Hiç ödeme yapmadı", detail: "bu bağlamda bir müşteri veya ücretli ilişki hiç var olmadı" }, { label: "Ödeme yapan müşteriydi", detail: "parasallaşmış bir ilişki var ya da bir zamanlar vardı" }] },
    "a.reason": { headline: "Geri dönmek için inandırıcı bir neden olup olmadığını belirle: hiç bitirmedikleri bir kurulum, dile getirdikleri bir ilgi, daha önce alakalı olmayıp şimdi olan bir şey, yarım kalmış bir hedef ya da üründeki gerçek bir değişiklik" },
    "x.winback": { headline: "kapsam dışı; win-back sürecine ait", detail: "burada değil - bir zamanlar ücretli olan bir ilişkiyi geri kazanmak, farklı ekonomisi ve farklı mesajıyla ayrı bir sorundur; bunu yeniden aktifleştirme gibi ele almak ikisini de yanlış yapar" },
    "c.reason": { headline: "Bir girişimde bulunmak için inandırıcı bir neden var mı?", edges: [{ label: "Somut bir neden var", detail: "geri dönmek için somut bir şey var - hiç bitirilmemiş bir kurulum, dile getirilmiş bir ilgi, şimdi alakalı olan bir şey, üründeki gerçek bir değişiklik" }, { label: "Somut bir neden yok", detail: "somut bir neden yok; tek başına uykuda kalmak asla neden hâline gelmez" }] },
    "a.attempt": { headline: "Kaydedilen nedene dayanan sınırlı bir girişimde bulun. Kendilerinin özlendiğine dair genel bir not değil - bu hiçbir şey söylemez, hiçbir şey istemez" },
    "x.no-reason": { headline: "uykuda, yeniden etkileşime geçmek için inandırıcı bir neden yok", detail: "gerçek bir değişiklik - üründe, kendi koşullarında, talep ettikleri şeyde - ileride bir neden yaratabilir; sadece uykuda kalmanın uzaması tek başına asla neden hâline gelmez" },
    "w.return": { headline: "üründe gerçek bir etkinlik ya da huniden bir hareket olana kadar - bir mesajın açılması değil", detail: "zaman aşımı: Yeniden aktifleştirme penceresi. (dormant_non.return üzerinden yapılandırılır)" },
    "a.inspect": { headline: "Bir şey ilan etmeden önce fiilen ne olduğunu incele. Mesajı açmak geri dönmek değildir; soru, gerçek bir durumun değişip değişmediğidir" },
    "x.sunset": { headline: "yeniden aktifleştirme penceresi kapandı, bekleme süresi devrede", detail: "yalnızca yeni bir neden bunu değiştirir, daha uzun bir sessizlik değil; tekrarlanan uykuda kalma, kimseye tekrarlanan kampanya hakkı vermez" },
    "c.state": { headline: "Fiilen hangi duruma geri döndüler?", edges: [{ label: "Tamamlanmamış onboarding", detail: "açık bir onboarding örneği var ve kurulum devam ediyor" }, { label: "Yenilenmiş ticari niyet", detail: "davranış, kayıtlı olandan daha güçlü bir niyet gösteriyor" }, { label: "Güncel bir nitelik yok", detail: "geri döndüler ama kayıtlarda şu an herhangi bir şey için nitelikli olup olmadıklarına dair bir bilgi yok" }, { label: "Sinyal incelemeye dayanmadı", detail: "geri dönüş gibi görünen şey, mesajla etkileşimden ibaret çıktı" }] },
    "x.resumed": { headline: "tamamlanmamış kuruluma geri dönüldü; tamamlanmış kilometre taşları korunur ve hesap baştan başlamak yerine kaldığı yerden devam eder", detail: "sonraki bir geri dönüş aynı kilometre taşı kaydını yeniden okur" },
    "h.intent": { headline: "Niyet yükseltme → daha yüksek niyetli sürece devir", detail: "kayıttakinden daha güçlü niyet taşıyan bir geri dönüş" },
    "h.qualify": { headline: "Nitelik durumu değişikliği → yönlendir, yeniden yönlendir veya çık", detail: "kayıtta güncel bir nitelik olmadan geri dönüş" },
    "x.engagement-only": { headline: "sadece etkileşim; hiçbir şey yeniden aktifleşmedi", detail: "pencere henüz dolmadıysa sonuna kadar devam eder; bir tıklama geri dönüş olarak kaydedilmez, çünkü bunu yapmak bu sürecin kendi mesajını sonuç gibi raporlamasına yol açar" },
  },
  },
  "CMS-201": {
  shortName: "İletişim Yükümlülüğü Oluşturma",
  name: "İş olayı → iletişim yükümlülüğü → oluştur veya baskılama uygula",
  purpose: "Herhangi bir mesaj var olmadan önce, olan bitenle ilgili gerçekten birine borçlu olunup olunmadığına karar ver.",
  nodes: {
    "t.olay": { headline: "Yetkili iş olayı" },
    "a.evaluate": { headline: "Olay türünü, alıcıyı, iletişim gerekliliğini, amacı, aciliyeti, güncel durum'i, bekleyen eşdeğer iletişimi ve geçerli gönderim kurallarını değerlendir" },
    "c.required": { headline: "Bu olay ve alıcı için iletişim yükümlülüğü var mı?", edges: [{ label: "Var", detail: "bir kural, sözleşme veya tanımlı beklenti bu alıcıya mesaj gönderilmesini gerektiriyor" }, { label: "Yok", detail: "bu alıcıya olay hakkında bilgi verilmesini gerektiren bir kural yok" }] },
    "c.existing": { headline: "Atomik olmayan bir okumanın gösterebildiği kadarıyla, bu alıcı için hâlihazırda bekleyen eşdeğer bir iletişim var mı?", edges: [{ label: "Var ve bunu içine alabilir", detail: "çözülmemiş bir yükümlülük aynı konuyu kapsıyor ve semantik, bunun güncellenmesine izin veriyor" }, { label: "Henüz görünmüyor veya birleştirilemez", detail: "bu okumaya göre bunu kapsayan bekleyen bir şey yok, ya da ikisi gerçekten farklı mesajlar - kimliği asıl kesinleştiren yetkili adım a.create'dir, bu dal yalnızca denemeye değip değmediğine karar verir" }] },
    "a.suppress": { headline: "Hiçbir yükümlülük oluşturulmadığını ve nedenini kaydet. Her olayın bir mesaj üretmesi, insanların hepsini görmezden gelmeyi öğrenmesine yol açar; sonunda önemli olan mesaj da kimsenin açmadığı bir akışın içinde kalır" },
    "a.reuse": { headline: "İkincisini oluşturmak yerine mevcut yükümlülüğü güncelle. Yinelenen bir olayın yinelenen bir mesaj üretmesi, alıcıya aynı şeyin iki kez söylenmesi demektir ve ikinci bildirim, birincisinden şüphe duyulmasına yol açar" },
    "a.create": { headline: "İletişim yükümlülüğünü (recipient_id, obligation_subject) anahtarıyla atomik biçimde yoksa-oluştur mantığıyla oluştur: bu kimlik için henüz bir yükümlülük yoksa, amacını, alıcısını, gerektirdiği sonucu ve geçerli kalacağı zaman penceresini belirterek bir tane oluştur; obligation_id'yi (recipient_id, obligation_subject) değerinden deterministik biçimde türet, böylece aynı kimlik her zaman aynı obligation_id'ye karşılık gelsin. c.existing adımının okumasıyla bu eylem arasında eşzamanlı bir çağrı aynı kimlik için zaten bir tane oluşturmuşsa, ikinci bir tane türetmek yerine mevcut olan - aynı obligation_id'ye sahip - yükümlülüğü döndür. Yükümlülük, olaydan ayrı bir varlıktır; iletişim kuralları ne olduğunu tarif eder, onu asla yeniden tanımlamaz. Bu, mekanizmanın kendi 'en fazla bir' garantisidir; c.existing'in önceki okuması bir optimizasyondur, bunun yerine geçmez" },
    "x.none": { headline: "iletişim yükümlülüğü yok; olay kendi başına duruyor", detail: "sonraki bir olay kendi koşullarında bir yükümlülük oluşturabilir. Bunun hiçbirini oluşturmaması bir eksiklik değil, kaydedilmiş bir karardır" },
    "x.reused": { headline: "bekleyen yükümlülüğün içine dahil edildi; ikinci bir mesaj oluşturulmadı", detail: "o yükümlülük, bu olay hâlâ bildirilmemiş durumdayken kapanırsa, gereklilik kendi koşullarında yeniden değerlendirilir" },
    "h.recipient": { headline: "İletişim yükümlülüğü → alıcıyı çöz → hazır, beklemede veya başarısız", detail: "oluşturulmuş bir iletişim yükümlülüğü" },
  },
  },
  "CMS-202": {
  shortName: "Alıcı Çözümleme",
  name: "İletişim yükümlülüğü → alıcıyı çöz → hazır, beklemede veya başarısız",
  purpose: "Bunun gerçekte kime borçlu olunduğunu ve o kişiye şu anda nereden ulaşılabileceğini belirle.",
  nodes: {
    "t.created": { headline: "Alıcı bekleyen iletişim yükümlülüğü" },
    "a.identity": { headline: "Yetkili alıcı kimliğini çöz. Hesap sahibi her zaman hedeflenen alıcı değildir - bir çalışma alanı bildirimi bir yöneticiye, bir politika bildirimi bir hukuk irtibat kişisine, bir güvenlik uyarısı ise faturayı ödeyen kişiye değil, kimlik bilgisi söz konusu olan kişiye borçlu olunabilir" },
    "c.resolvable": { headline: "Hedeflenen alıcı çözümlenebilir mi?", edges: [{ label: "Çözümlendi", detail: "yükümlülüğün borçlu olduğu taraf yetkili biçimde belirlendi" }, { label: "Çözümlenemedi", detail: "bunun kime borçlu olunduğu belirlenemiyor" }] },
    "c.role": { headline: "Bu alıcı, adı belirli bir kişi yerine bir rol üzerinden mi çözümleniyor?", edges: [{ label: "Bir rol üzerinden", detail: "yükümlülük, bir pozisyonu elinde bulunduran kişiye borçludur - bir yönetici, bir onaylayıcı, bir uyumluluk irtibat kişisi" }, { label: "Belirli bir taraf", detail: "yükümlülük belirli bir kişiye veya varlığa borçludur" }] },
    "a.unresolved": { headline: "RECIPIENT_UNRESOLVED durumunu kaydet ve hiçbir şey gönderme. Başka kimse bulunamadığı için hesapta kim varsa ona yönelmek, özel bir konuyu yanlış kişiye iletir; bu da sonradan bir düzeltmeyle geri alınamaz" },
    "a.role": { headline: "Kaydın yazıldığı sırada rolü kim taşıyorsa ona değil, rolün mevcut sahibine çöz. Geçen yılın yöneticisine gönderilen bir bildirim, kimsenin almadığı bir bildirimdir; paylaşılan veya ekip bazlı bir varlıkta bu, istisna değil normal durumdur" },
    "a.person": { headline: "Yükümlülüğün belirttiği şekilde, adı geçen tarafı çöz" },
    "x.unresolved": { headline: "RECIPIENT_UNRESOLVED; yükümlülük karşılanmamış durumda ve hiçbir şey gönderilmedi", detail: "alıcının çözümlenebilir hale gelmesi yönlendirmeyi yeniden açar. Yükümlülük ne sona ermiştir ne de karşılanmıştır" },
    "a.destinations": { headline: "Şu anda geçerli olan hedef adaylarını çöz - e-posta, telefon, cihaz, uygulama içi hesap, çalışma alanı veya desteklenen başka bir hedef. Şu anda geçerli olmak, hedefin yalnızca var olması değil, kendi sağlığı demektir: altı aydır sert şekilde geri dönen (hard-bounce) bir adres, bir yol sayılmaz" },
    "c.available": { headline: "En az bir geçerli hedef mevcut mu?", edges: [{ label: "Mevcut", detail: "bir veya daha fazla hedef şu anda kullanılabilir" }, { label: "Yok", detail: "bu alıcı için şu anda geçerli hiçbir hedef yok" }] },
    "c.authorization": { headline: "Bu alıcıya bu hedefler üzerinden ulaşmak ek doğrulama veya yetkilendirme gerektiriyor mu?", edges: [{ label: "Gerektiriyor", detail: "içerik, hedefin önce doğrulanmasını gerektirecek kadar hassas" }, { label: "Gerektirmiyor", detail: "hedefler bu içerik için zaten yeterli" }] },
    "a.no-route": { headline: "Bu alıcı için CONTACT_ROUTE_UNAVAILABLE durumunu kaydet. Bu, alıcının genel olarak ulaşılamaz olduğuna dair bir ifade değil, bir yönlendirme gerçeğidir ve yalnızca fiilen denenenle sınırlıdır" },
    "a.hold": { headline: "Neyin gerekli olduğunu belirterek HOLD durumunu kaydet ve doğrulamayı bunu yöneten mekanizma üzerinden başlat. Hassas bir şey içeren bir bildirim, sadece hedef var diye doğrulanmamış bir hedefe gönderilmez" },
    "a.ready": { headline: "Çözümlenen alıcı ve onlar için şu anda geçerli olan hedeflerle birlikte READY_FOR_CHANNEL_SELECTION durumunu kaydet" },
    "x.no-route": { headline: "CONTACT_ROUTE_UNAVAILABLE; yükümlülük karşılanmamış durumda", detail: "yeni geçerli hale gelen bir hedef, bu yükümlülük hâlâ geçerliyken yönlendirmeyi yeniden açar" },
    "w.authorization": { headline: "gerekli doğrulama veya yetkilendirme tamamlanana, reddedilene ya da tamamlanamaz hale gelene kadar", detail: "iletişimin geçerli kaldığı zaman penceresi kadar sonra zaman aşımına uğrar" },
    "h.permission": { headline: "İletişim amacı → izin ve tercih kontrolü → gönder, baskılama uygula veya alternatif kullan", detail: "kullanılabilir kanalları olan, çözümlenmiş bir alıcı" },
    "c.auth": { headline: "Yetkilendirme nasıl sonuçlandı?", edges: [{ label: "Tamamlandı", detail: "hedef artık bu içerik için yeterli" }, { label: "Reddedildi veya imkânsız", detail: "hedef yeterli hale getirilemiyor" }] },
  },
  },
  "CMS-203": {
  shortName: "Kanal Uygunluğu Çözümleme",
  name: "İletişim amacı → izin ve tercih kontrolü → gönder, baskılama uygula veya alternatif kullan",
  purpose: "Çalışan bir hedefin, amacı göz önünde bulundurulduğunda, bu belirli mesajı taşıyıp taşıyamayacağına karar ver.",
  nodes: {
    "t.resolved": { headline: "Alıcı ve hedefler çözümlendi" },
    "a.purpose": { headline: "İletişimin amacını sınıflandır: işlemsel, güvenlik, hizmet, zorunlu bildirim, operasyonel, pazarlama veya tanımlı başka bir amaç. Uygulanacak izin ve baskılama kurallarını bu sınıf belirler" },
    "a.evaluate": { headline: "Geçerli izni, onayı, kanal tercihini, zorunlu teslim kurallarını ve baskılama durumunu iletişim amacına göre değerlendir. Baskılama gönderen tarafta tutuluyorsa izin hâlâ açık olsa bile tanıtım ve yaşam döngüsü mesajlarını engeller; hizmet, işlemsel, güvenlik ve zorunlu iletişim kendi kurallarıyla devam eder" },
    "c.rules": { headline: "Bu amaç ve bu kanallar için izin kuralları tanımlı mı?", edges: [{ label: "Tanımlı", detail: "kurallar, hangi kanalların bu amacı taşıyabileceğini ve herhangi bir teslimin zorunlu olup olmadığını belirtir" }, { label: "Tanımlı değil", detail: "bu amacın bu kanalları kullanıp kullanamayacağına dair hiçbir şey belirtilmemiş" }] },
    "c.per-channel": { headline: "Değerlendirme sonucunda ne kullanılabilir kalıyor?", edges: [{ label: "En az bir kanala izin veriliyor", detail: "bir kanal bu amacı bu alıcıya taşıyabilir" }, { label: "Tercih edilen kanala izin verilmiyor ve iletişim zorunlu", detail: "alıcının tercihi olağan yolu kapatıyor, ancak bir kural yine de teslimi zorunlu kılıyor" }, { label: "İzin verilen hiçbir yol yok", detail: "bu amaç için tüm kanallar kapalı" }] },
    "h.review": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "izin kuralları tanımlanmamış bir iletişim amacı" },
    "a.candidates": { headline: "Bu amaç için izin verilen kanalları ve her kanala izin veren kuralı kaydet. Böylece hem gönderim hem baskılama kararı açıklanabilir kalır" },
    "a.alternate": { headline: "Zorunlu teslim kurallarının fiilen izin verdiği alternatif yolları değerlendir. Zorunlu olması, herhangi bir kanalın işe yarayacağı anlamına gelmez - hangi kanalların bir tercihi aşabileceğini kurallar belirler, kullanılabilecek olanlar yalnızca bunlardır" },
    "a.undeliverable": { headline: "Amacı ve her yolu kapatan kuralı belirterek UNDELIVERABLE_BY_POLICY durumunu kaydet. Bu bir teslim hatası değil, bir politika sonucudur; bunu bir hata olarak kaydetmek, değişmeyecek bir kurala karşı bir yeniden deneme döngüsüne sokar" },
    "h.route": { headline: "Kanal seçimi → yolu belirle → mesajı hazırla", detail: "bu amaç için izin verilen en az bir kanal" },
    "c.alternate": { headline: "İzin verilen bir alternatif var mı?", edges: [{ label: "Var", detail: "zorunlu teslim kuralları bir yolu açık tutuyor" }, { label: "Yok", detail: "kurallar bu amaç için hiçbir yol bırakmıyor" }] },
    "c.escalate": { headline: "Hiçbir yola izin verilmediğinde bu yükümlülük yükseltme gerektiriyor mu?", edges: [{ label: "Gerektiriyor", detail: "iletişim zorunlu veya kritik olduğundan basitçe bırakılamaz" }, { label: "Gerektirmiyor", detail: "yönlendirilemeyen isteğe bağlı bir mesaj başka bir işlem yapılmadan kapanır" }] },
    "h.escalate": { headline: "İletişim sonucu → yükümlülüğü kapat veya ulaşılamazı yükselt", detail: "izin verilen hiçbir yolu olmayan zorunlu bir iletişim" },
    "x.undeliverable": { headline: "UNDELIVERABLE_BY_POLICY; bu amaç için izin verilen hiçbir yol yok", detail: "bir izin değişikliği veya yeni izin verilen bir hedef, yükümlülük hâlâ geçerliyken yönlendirmeyi yeniden açar" },
  },
  },
  "CMS-204": {
  shortName: "Kanal Yönlendirme",
  name: "Kanal seçimi → yolu belirle → mesajı hazırla",
  purpose: "Yükümlülüğü fiilen karşılayan en küçük kanal kümesini seç ve mesajı bunlar için oluştur.",
  nodes: {
    "t.permitted": { headline: "İzin verilen kanallar mevcut" },
    "a.evaluate": { headline: "Amacı, aciliyeti, alıcının tercihlerini, kanal yeteneklerini, içerik gereksinimlerini, teslim güvenilirliğini, fallback politikasını ve tanımlıysa maliyet veya önceliği değerlendir" },
    "a.select": { headline: "Birincil yolu seç - yükümlülüğü karşılayabilecek en küçük geçerli küme. Mevcut her kanaldan göndermek titizlik değildir; tek bir olayın dört kez gelmesidir ve alıcı bu tekrarı sistemde bir arıza olarak okur" },
    "c.multi": { headline: "Yükümlülük gerçekten birden fazla kanal gerektiriyor mu?", edges: [{ label: "Açıkça, evet", detail: "bir kural veya yükümlülüğün kendi gerekliliği, birden fazla kanaldan teslim istiyor" }, { label: "Tek yol, bir yedek tutularak", detail: "tek bir kanal yükümlülüğü karşılıyor" }] },
    "a.coordinate": { headline: "Her biri diğerlerinden haberdar olacak şekilde açıkça koordine edilmiş teslimler oluştur; böylece yükümlülük her kanal için bir kez değil, tek seferde kapanır. Koordinesiz paralel gönderimler, üç kez kapanan bir yükümlülük ve kendisine üç kez bildirim yapılan bir alıcı üretir" },
    "a.single": { headline: "Tek birincil kanalı ve başarısız olursa kullanılacak fallback kanalı kaydet. Fallback beklemede tutulur; aynı anda ikinci bir mesaj göndermez" },
    "a.prepare": { headline: "Kanala uygun mesaj örneğini, iş gerçeklerini bağımsız olarak yeniden ifade etmek yerine onlara referans vererek hazırla ve message_id'yi obligation_id'den deterministik biçimde türet - aynı yükümlülük için hazırlığın yeniden çağrılması (yeniden iletilen bir tetikleyici, yeniden denenen bir çağrı), ikinci bir hazırlanmış örnek yerine aynı message_id'ye karşılık gelir. Kanal seçimi gerçekleri asla değiştirmez - kısaltılmış bir mesaj tam olandan daha azını söyler, ama farklı bir şey söylememelidir" },
    "h.send-ready": { headline: "Mesaj hazırlandı → durum'i yeniden doğrula → gönder veya baskılama uygula", detail: "seçilmiş kanala göre hazırlanmış bir mesaj" },
  },
  },
  "CMS-205": {
  shortName: "Gönderim Uygunluğu Kontrolü",
  name: "Mesaj hazırlandı → durum'i yeniden doğrula → gönder veya baskılama uygula",
  purpose: "Mesajın gönderilmeden hemen önce hâlâ doğru olup olmadığını kontrol et, değilse durdur.",
  nodes: {
    "t.ready": { headline: "Mesaj gönderime hazır duruma ulaşıyor" },
    "a.reread": { headline: "Mesajın tarif ettiği yetkili durumu yeniden oku. Hazırlık ile gönderim arasında randevu iptal edilmiş, ödeme başarıyla tamamlanmış veya onay geri alınmış olabilir - ve bunların her biri yararlı bir mesajı zarar verici bir mesaja dönüştürür. Mesajın kaynaklandığı akış bir rekabet exclusionGroup'u ve kapsamı (GLB-01) tanımlıyorsa, bu yeniden okuma OPS-131'in o (exclusion_group, scope_instance_id) için geçerli olan mevcut sahibini de içerir - gönderim yolunun kendi 3. adımı olan \"akış rekabeti ve önceliği\", hiçbir somut düğümün gerçekleştirmediği bir aşama olarak bırakılmak yerine burada uygulanır, çünkü bu, hangi akıştan geldiğinden bağımsız olarak, rekabetteki her üyenin her mesajının teslimattan hemen önce geçtiği tek noktadır" },
    "c.valid": { headline: "İletişim hâlâ geçerli mi?", edges: [{ label: "Hâlâ geçerli", detail: "mesajın nedeni ve konusu hâlâ geçerliliğini koruyor, ve kaynaklandığı akış bir rekabet alanı tanımlıyorsa, o akış hâlâ kendi (exclusion_group, scope_instance_id) değeri için OPS-131'in geçerli sahibi durumunda" }, { label: "Yerine yeni süreç geçti veya çözüldü", detail: "mesajın konu aldığı olay geri alınmış, iptal edilmiş veya çözülmüş, YA DA mesaj kuyruğa alındıktan sonra kaynaklandığı akış, tanımladığı rekabet kapsamının sahipliğini kaybetmiş - kaybeden bir yarışmacının kuyruğa alınmış mesajı, sadece kaybetmeden önce kuyruğa girdiği için çalışmaya devam etmez (GLB-07)" }, { label: "Alıcı veya kanal artık geçerli değil", detail: "yönlendirmeden bu yana hedef başarısız oldu veya alıcı değişti" }] },
    "c.content": { headline: "İçerik, hazırlıktan bu yana değişmiş verilere mi dayanıyor?", edges: [{ label: "Değişti", detail: "mesajdaki bir tutar, tarih, durum veya ad artık güncel değil" }, { label: "Değişmedi", detail: "mesajın belirttiği her şey hâlâ güncel" }] },
    "a.suppress": { headline: "Güncelliğini yitirmiş mesajı baskıla ve gerekçeyi kaydet. İptal edilen randevu için hatırlatma ya da tamamlanan ödeme için hata bildirimi gönderme" },
    "h.reroute": { headline: "İletişim yükümlülüğü → alıcıyı çöz → hazır, beklemede veya başarısız", detail: "gönderilmeden önce alıcısı veya hedefi geçerliliğini yitirmiş bir mesaj" },
    "a.regenerate": { headline: "Göndermeden önce içeriği güncel verilerden yeniden oluştur. Güncelliğini yitirmiş bir tutar, tarih veya durum göndermek, hiçbir şey göndermemekten daha kötüdür; çünkü alıcı buna göre hareket eder ve sonra bunun yanlış olduğu kendisine söylenmek zorunda kalınır" },
    "a.send": { headline: "Mesajı, ne kontrol edildiğini ve hangi sürüme karşı kontrol edildiğini belirterek gönderim anında doğrulanmış olarak kaydet ve devrettiği gönderim için attempt_id türet. Bu mekanizma her message_id için en fazla bir kez çalışır - CMS-208'in kendi kurtarma döngüsü, bu mekanizmaya geri dönmek yerine akışın ilerisinde bağımsız olarak yeniden dener - dolayısıyla a.send, message_id üzerinde idempotenttir: yeniden iletilen bir t.ready, ikinci bir attempt_id türetip sağlayıcıya yinelenen bir gönderim riski almak yerine, zaten türetilmiş olan attempt_id'yi yeniden kullanır. Geçmişte gönderilmiş mesajlar sonradan asla değiştirilmez - gönderilen şey gönderilmiştir, ve bunu yeniden yazmak yanlış bir şeyin gittiğine dair kanıtı ortadan kaldırır" },
    "x.suppressed": { headline: "güncelliğini yitirmiş mesaj baskılandı; gönderim yapılmadı", detail: "yükümlülük tamamlandı olarak değil, yerine yenisi geçti olarak kapanır. Aynı konudaki yeni bir olay kendi yükümlülüğünü oluşturur" },
    "h.attempt": { headline: "Gönderim denemesi → kabul edildi, başarısız oldu veya bilinmiyor", detail: "teslimattan hemen önce doğrulanmış bir mesaj" },
  },
  },
  "CMS-206": {
  shortName: "Gönderim Denemesi Durumu",
  name: "Gönderim denemesi → kabul edildi, başarısız oldu veya bilinmiyor",
  purpose: "Mesaj bir sağlayıcıya teslim edildiğinde ne olduğunu kaydet - bu, alıcıya ne olduğuyla aynı şey değildir.",
  nodes: {
    "t.submitted": { headline: "Mesaj sağlayıcıya iletildi" },
    "a.persist": { headline: "Mesaj kimliğini, deneme kimliğini, iletildiği destination_id'yi, kanalı, sağlayıcıyı ve onun referansını, iletim zamanını ve içerik sürümü referansını kalıcı olarak kaydet. Deneme, sonucu bilinmeden önce yazılır; böylece saatler sonra gelen bir sonucun bağlanacağı bir kayıt olur. Hem message_id hem de attempt_id zaten türetilmiş olarak gelir - aynı (message_id, attempt_id) için yeniden iletilen bir çağrı bir kez kalıcı hale gelir, iki kez değil - ve destination_id, iletimin kendisinden okunur; koordineli çok kanallı bir yükümlülükte bile her deneme her zaman tam olarak tek bir hedefi hedefler" },
    "w.acceptance": { headline: "sağlayıcı iletimi kabul edene ya da sağlayıcı anında yetkili bir başarısızlık bildirene kadar", detail: "bu kanal için gönderim zaman aşımı süresi kadar sonra zaman aşımına uğrar" },
    "c.outcome": { headline: "Sağlayıcı bununla ne yaptı?", edges: [{ label: "Kabul edildi", detail: "sağlayıcı mesajı teslim için aldı" }, { label: "Anında reddedildi", detail: "sağlayıcı iletimi yetkili biçimde reddetti" }] },
    "a.unknown": { headline: "DELIVERY_UNKNOWN durumunu kaydet ve herhangi bir yeniden göndermeyi beklet. Zaman aşımı bir başarısızlık değildir - mesaj gerçekten gitmiş olabilir ve körlemesine yeniden göndermek aynı bildirimi iki kez teslim eder; bazı bildirimler için bu, tek seferlikten bambaşka bir mesaj gibi okunur" },
    "a.accepted": { headline: "SENT ve DELIVERY_PENDING durumlarını kaydet. Sağlayıcının mesajı alması, sağlayıcının kuyruğu hakkında bir gerçektir - hiç kimseye hiçbir şey ulaşmadan kabul edilebilir, beklemeye alınabilir, geri dönebilir veya elenebilir" },
    "a.failed": { headline: "Sağlayıcının bildirdiğini sınıflandırmadan, tam olarak olduğu gibi DELIVERY_FAILED olarak kaydet. Sınıflandırma, ham nedene ihtiyaç duyan kurtarma akışına aittir, onun bir özetine değil" },
    "c.duplicates": { headline: "Bu iletişim için bir yinelenme önemli olur mu?", edges: [{ label: "Olur", detail: "mesaj bir kod, bir bağlantı, bir ödeme talimatı veya ikinci bir kopyanın belirsizleştireceği başka bir şey taşıyor" }, { label: "Olmaz", detail: "bir tekrar zararsız ve mesajın bu temelde yeniden gönderilmesi mantıklı" }] },
    "x.pending": { headline: "SENT ve DELIVERY_PENDING; iletildi ve kabul edildi, teslim henüz kesinleşmedi", detail: "kanalın teslim sonucu kendi zamanlamasında gelir ve bu denemeyle ilişkilendirilir. Burada hiçbir şey yükümlülüğü sonuçlandırmaz" },
    "h.recover": { headline: "Teslim başarısızlığı → sınıflandır → yeniden dene, yedeğe geç veya durdur", detail: "sağlayıcının reddettiği bir iletim, ya da yinelenmelerin zararsız olduğu bilinmeyen bir sonuç" },
    "h.reconcile": { headline: "external:external-status-reconciliation", detail: "yinelenmenin önemli olacağı, bilinmeyen bir iletim sonucu" },
  },
  },
  "CMS-207": {
  shortName: "Teslim Sonucu Uzlaştırma",
  name: "Teslim sonucu → teslim edildi, başarısız oldu veya bilinmiyor → iletişimi güncelle",
  purpose: "Kanalın bildirdiğinden, ilgili olduğu tam denemeye bağlı gerçek teslim durumunu türet.",
  nodes: {
    "t.status": { headline: "Teslim durumu alındı" },
    "a.correlate": { headline: "Sonucu, ilgili olduğu tam teslim denemesiyle ilişkilendir. Bağlanacağı bir denemesi olmayan bir durum, hiçbir şey hakkında olmayan bir durumdur; yanlış bir denemeye bağlanması ise farklı bir mesajı teslim edilmiş olarak işaretler" },
    "c.correlated": { headline: "Bilinen bir denemeyle ilişkilendirildi mi?", edges: [{ label: "İlişkilendirildi", detail: "sonuç, elimizde olan bir denemeyi işaret ediyor" }, { label: "İlişkilendirilemedi", detail: "sonuç, tanıdığımız hiçbir şeyi işaret etmiyor" }] },
    "c.idempotent": { headline: "Bu sonuç yeni mi, tekrar mı, yoksa hâlihazırda kayıtlı olandan daha mı eski?", edges: [{ label: "Yeni ve güncel", detail: "bu sonuç, deneme hakkında bilinenleri ileri taşıyor" }, { label: "Zaten işlendi", detail: "aynı sonuç bu denemeye zaten uygulanmış" }, { label: "Geç ve daha zayıf", detail: "hâlihazırda kesinleşmiş olandan sonra geliyor ve ondan daha azını bildiriyor" }] },
    "h.reconcile": { headline: "external:external-status-reconciliation", detail: "ilişkilendirilemeyen veya belirsizliğini koruyan bir teslim sonucu" },
    "c.outcome": { headline: "Kanal ne bildiriyor?", edges: [{ label: "Teslim edildi", detail: "kanal, hedefe ulaştığını yetkili biçimde bildiriyor" }, { label: "Kesin başarısızlık", detail: "kanal, ulaşmadığını ve ulaşmayacağını yetkili biçimde bildiriyor" }, { label: "Belirsiz", detail: "bildirim ikisini de kesinleştirmiyor" }] },
    "x.duplicate-olay": { headline: "yinelenen teslim olayı yok sayıldı; kayıtlı durum değişmedi", detail: "bu deneme için gerçekten yeni bir sonuç kendi koşullarında işlenir. Kanallar webhook'ları tekrarlar ve durum değişikliğini onlarla birlikte tekrarlamak her teslimi iki kez saymak anlamına gelir" },
    "a.late": { headline: "Geç gelen olayı, daha güçlü kanıtın üzerine yazmadan kaydet. Onaylanmış bir teslimden sonra gelen bir geri dönüş (bounce), aksini açıkça belirten bir kanal semantiği olmadıkça teslimi geçersiz kılmaz - böyle bir durum varsa bu açıkça belirtilir ve kural varsayılmak yerine uygulanır" },
    "a.delivered": { headline: "Bu denemeye karşı DELIVERED durumunu kaydet. Teslim edilmiş olmak okunmuş olmak değildir, okunmuş olmak da anlaşılmış olmak değildir - bir teslim makbuzu, mesajın bir hedefe ulaştığını söyler; kimsenin onu görmüş olduğuna, bir yana bırakın buna göre hareket etmiş olduğuna dair hiçbir şey söylemez" },
    "a.failed": { headline: "Nedeni, kanalın bildirdiği gibi tam olarak belirterek DELIVERY_FAILED durumunu kaydet. Kurtarma akışının sınıflandırma yaptığı şey bu nedendir; burada özetlemek, dolu bir posta kutusu ile ölü bir adres arasındaki ayrımı kaybettirir" },
    "a.unknown": { headline: "DELIVERY_UNKNOWN durumunu kaydet. Ne teslim edilmiş ne de başarısız olmak gerçek bir durumdur; bunu hangisi daha uygunsa ona çözmek, ya kimsenin karşılamadığı kapanmış bir yükümlülük ya da kimsenin ihtiyaç duymadığı bir yineleme üretir" },
    "x.late": { headline: "geç sonuç kaydedildi; daha güçlü teslim kanıtı korundu", detail: "geç bir başarısızlığı gerçekten yetkili kılan kanal semantikleri, varış sırasına göre değil bir kural olarak uygulanır" },
    "h.obligation": { headline: "İletişim sonucu → yükümlülüğü kapat veya ulaşılamazı yükselt", detail: "onaylanmış bir teslim" },
    "h.recover": { headline: "Teslim başarısızlığı → sınıflandır → yeniden dene, yedeğe geç veya durdur", detail: "yetkili bir teslim başarısızlığı" },
  },
  },
  "CMS-208": {
  shortName: "Mesaj Teslim Kurtarma",
  name: "Teslim başarısızlığı → sınıflandır → yeniden dene, yedeğe geç veya durdur",
  purpose: "Fiilen yaşanan başarısızlığa, ait olduğu hedefin ötesine yaymadan yanıt ver.",
  nodes: {
    "t.failed": { headline: "Yetkili teslim başarısızlığı" },
    "a.classify": { headline: "Başarısızlığı, kanalın fiilen bildirdiğine göre açık bir sınıfa ayır - TEMPORARY, PROVIDER_FAILURE, RATE_LIMITED, PERMANENT, INVALID_DESTINATION, CHANNEL_RESTRICTED veya UNKNOWN. Akışın devamındaki her şeye bu sınıf karar verir; bu yüzden herhangi bir şey yeniden denenmeden önce belirlenir - hepsini geçici saymak, asla var olmayacak bir adrese karşı bir yeniden deneme döngüsü üretir" },
    "c.relevant": { headline: "İletişim hâlâ geçerliliğini koruyor mu?", edges: [{ label: "Hâlâ geçerli", detail: "mesajın nedeni hâlâ geçerli ve zaman penceresi açık" }, { label: "Artık geçerli değil", detail: "ilgili olduğu olay çözülmüş ya da geçerlilik penceresi kapanmış" }] },
    "c.class": { headline: "Başarısızlık sınıfı ne gerektiriyor?", edges: [{ label: "Geçici, hız sınırlı veya sağlayıcı kaynaklı", detail: "hedef sorunsuz ve başarısızlığın geçmesi bekleniyor" }, { label: "Bu hedef için kalıcı", detail: "sert bir geri dönüş, geçersiz bir adres veya ölü bir token" }, { label: "Bu kanalda kısıtlı", detail: "bu kanal bu içeriği taşımayacak, ve neden bir yeniden denemeyle çözülecek türden değil" }, { label: "Sınıflandırılamıyor", detail: "sağlayıcı güvenilebilecek bir sınıf vermedi" }] },
    "a.suppress-recovery": { headline: "Kurtarmayı bastır. Var olma nedeni geçmiş bir mesajın teslimini kurtarmaya çalışmak, güncelliğini yitirmiş bir bildirime ulaşmak için çaba harcamaktır - bu da iki olası sonucun en kötüsüdür" },
    "a.retry": { headline: "Aynı kanalda, geri çekilme (backoff) uygulayarak yeniden dene; bu fiziksel deneme için yeni bir attempt_id türet ve (message_id, destination_id) için ilk başarısızlıkta belirlenen bütçeden bir birim harca. Bütçe bir kez belirlenir ve yenilenmez - bir yeniden deneme politikası ile bir döngü arasındaki fark budur; sonu olmayan bir zamanlama, içeriden bakıldığında çalışan bir sistem gibi görünür, alıcının gelen kutusundan bakıldığında ise tacize benzer" },
    "a.permanent": { headline: "Bu hedefe karşı sonuçsuz yeniden denemeleri durdur ve ulaşılabilirlik kanıtını ilerlet. Geçersiz bir adres yalnızca o adresi geçersiz kılar, başka hiçbir şeyi değil - geri dönen bir e-posta, alıcının telefonunu, cihazını veya uygulama içi hesabını etkilemez" },
    "c.fallback": { headline: "Alternatif bir kanal mevcut mu?", edges: [{ label: "Mevcut", detail: "alıcının başka bir kanalda başka bir hedefi var" }, { label: "Yok", detail: "bu alıcı için başka kanal kalmadı" }] },
    "a.cautious": { headline: "Sınıflandırılamayan bir başarısızlığı geçici say, ama daha küçük bir bütçeyle, ve sınıfın bilinmediğini kaydet. Kalıcı varsaymak, çalışabilecek bir hedefi elemektir; tam bütçeyle geçici varsaymak ise bilinmeyen bir başarısızlığın sınırsız bir yeniden denemeye dönüşme biçimidir" },
    "x.abandoned": { headline: "kurtarma bırakıldı; mesaj olaylar tarafından geride bırakıldı", detail: "yükümlülük başarısız olarak değil, yerine yenisi geçmiş olarak kapanır. Konusunun yeni bir olay üretmesi yeni bir yükümlülük oluşturur" },
    "c.budget": { headline: "Yeniden deneme bütçesi kaldı mı?", edges: [{ label: "Bütçe kaldı", detail: "deneme sayısı ve zaman penceresi hâlâ bir deneme daha yapılmasına izin veriyor" }, { label: "Hedefin ulaşılabilirliği yeniden deneme sırasında değişti", detail: "bütçe harcanırken irtibat noktasının kendi durumu değişti" }, { label: "Tükendi", detail: "ilk başarısızlıkta belirlenen bütçe harcandı" }] },
    "h.contactability": { headline: "Kanal ulaşılabilirliği değişimi → erişilebilirliği yeniden hesapla → yönlendir veya bastır", detail: "denemenin değil, irtibat noktasının bir özelliği olan bir başarısızlık" },
    "h.fallback": { headline: "İletişim amacı → izin ve tercih kontrolü → izin ver, bastır veya alternatif kullan", detail: "alternatif bir hedefi bulunan başarısız bir kanal" },
    "h.obligation": { headline: "İletişim sonucu → yükümlülüğü kapat veya ulaşılamazı yükselt", detail: "denenecek başka kanal kalmayan bir başarısızlık" },
    "x.retrying": { headline: "aynı kanalda bütçe dahilinde yeniden deneniyor", detail: "her yeniden deneme kendi sonucuna sahip yeni bir gönderim denemesidir; bu denemedeki bir başarısızlık, bütçe bir birim azalmış olarak buraya geri döner" },
  },
  },
  "CMS-210": {
  shortName: "İletişim Yükümlülüğü Kapanışı",
  name: "İletişim sonucu → yükümlülüğü kapat veya ulaşılamazı yükselt",
  purpose: "Yükümlülüğü fiilen gerektirdiği şeye göre kapat ve karşılanamayanları yükselt.",
  nodes: {
    "t.outcome": { headline: "Teslim denemeleri anlamlı bir sonuca ulaşıyor" },
    "c.obsolete": { headline: "İletişim, teslim edilmeden önce güncelliğini mi yitirdi?", edges: [{ label: "Yitirdi", detail: "ilgili olduğu olay, teslim hâlâ devam ederken çözüldü veya geri alındı" }, { label: "Geçerliliğini koruyor", detail: "mesajın nedeni hâlâ gerçek" }] },
    "a.superseded": { headline: "SUPERSEDED veya SUPPRESSED olarak kapat; yükümlülüğün karşılandığı için değil, nedeni ortadan kalktığı için sona erdiğini kaydet. Bu ikisi bir tamamlanma sayacında birbirinin aynı görünür ama tam tersi anlamlara gelir" },
    "c.requirement": { headline: "Bu yükümlülüğün karşılanması için ne gerekiyor?", edges: [{ label: "Onaylanmış teslim", detail: "gereklilik, mesajın alıcıya fiilen ulaşmış olmasıdır" }, { label: "Belgelenmiş bir gönderim denemesi", detail: "gereklilik, bir mesajın usulüne uygun şekilde gönderilmiş olması ve bunu gösteren bir kaydın bulunmasıdır" }, { label: "Tanımlı değil", detail: "bir denemenin mi yoksa bir teslimin mi bu bildirimi karşıladığına dair hiçbir şey belirtilmemiş" }] },
    "x.superseded": { headline: "yerine yenisi geçmiş olarak kapandı; yükümlülük karşılanmadan ve gereksiz hale gelerek sona erdi", detail: "aynı konudaki yeni bir olay, bunu canlandırmak yerine kendi yükümlülüğünü oluşturur" },
    "c.delivered": { headline: "Teslim onaylandı mı?", edges: [{ label: "Onaylandı", detail: "yetkili kanal kanıtı ulaştığını kesinleştiriyor" }, { label: "Onaylanmadı", detail: "hiçbir yolda teslim kesinleşmedi" }] },
    "c.attempted": { headline: "Belgelenmiş bir gönderim denemesi kayıtlı mı?", edges: [{ label: "Kayıtlı", detail: "usulüne uygun şekilde doğrulanmış bir mesaj iletildi ve deneme kayıtlı" }, { label: "Hiçbiri yapılamadı", detail: "izin verilen hiçbir yolda hiçbir deneme yapılmadı" }] },
    "h.review": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "tamamlanma semantiği tanımlanmamış bir yükümlülük" },
    "a.complete": { headline: "Fiilen hangi gerekliliği karşıladığını belirterek COMMUNICATION_COMPLETED durumunu kaydet. Okunmamış olmak teslim edilmemiş olmak demek değildir; teslimle karşılanan bir yükümlülük, kimse açmış olsun ya da olmasın karşılanmış demektir" },
    "c.routes": { headline: "İzin verilen tüm teslim yolları tükendi mi?", edges: [{ label: "Yollar kaldı", detail: "izin verilen bir kanal veya hedef henüz denenmedi" }, { label: "Tükendi", detail: "bu amaç için izin verilen her yol denendi ve hiçbiri işe yaramadı" }] },
    "x.completed": { headline: "Belirtilen gerekliliğe karşı COMMUNICATION_COMPLETED", detail: "aynı konudaki sonraki bir olay kendi yükümlülüğünü oluşturur. Alıcının anlayıp anlamadığı, bu durumun iddia ettiği bir şey değildir" },
    "x.in-progress": { headline: "yükümlülük açık; izin verilen yollar henüz denenmedi", detail: "kalan yollar denenir ve kendi sonuçlarını buraya bildirir" },
    "a.unreachable": { headline: "UNREACHABLE_FOR_PURPOSE durumunu kaydet. Bu, amaçla sınırlıdır - bu tür bir mesaj için izin verilen her yol başarısız oldu, ama aynı alıcıya başka bir konuda gayet iyi ulaşılabiliyor olabilir" },
    "c.critical": { headline: "Bu iletişim zorunlu veya kritik mi?", edges: [{ label: "Öyle", detail: "bir kural, bir sözleşme veya bir düzenleme bu alıcıya bilgi verilmesini gerektiriyor" }, { label: "Değil", detail: "mesaj zorunlu değil, faydalıydı" }] },
    "h.escalate": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "izin verilen hiçbir yolla teslim edilemeyen zorunlu bir iletişim" },
    "x.unreachable": { headline: "UNREACHABLE_FOR_PURPOSE; yükümlülük karşılanmadan kapanır ve bu şekilde kaydedilir", detail: "bu amaç için yeni geçerli bir hedef, alıcıyı yeniden ulaşılabilir kılar ve sonraki bir yükümlülük normal şekilde yönlendirilir" },
  },
  },
  "CON-264": {
  shortName: "İletişim Noktası Doğrulama",
  name: "İletişim noktası eklendi veya değişti → onaylama → izinli veya süresi doldu",
  purpose: "Yeni bir hedefin sahibi olan kişinin bunu gerçekten talep ettiğini, oraya herhangi bir şey gönderilmeden önce tespit etmek - ve yerini aldığı hedefi bilgilendirmek, çünkü kimsenin yapmadığı bir değişiklik yalnızca elinden alınan adresten fark edilebilir.",
  nodes: {
    "t.contact-point": { headline: "İletişim noktası eklendi veya değişti" },
    "c.replacement": { headline: "Bu, zaten var olan bir hedefin yerini mi alıyor?", edges: [{ label: "Mevcut birinin yerini alıyor", detail: "bu kimlik için bu türde bir iletişim noktası zaten kayıtlı ve ulaşılabilir" }, { label: "Türünün ilki", detail: "bu türde önceki bir iletişim noktası yok, dolayısıyla uyarılacak başka bir yer yok" }] },
    "a.alert-old": { headline: "Yerine yenisi konan hedefe, yerinin alındığını, neyle değiştirildiğini ve bunu nasıl durdurabileceğini bildir - bu bilgi eski hedefin kendisine gönderilir. Bir devralma, devralan adresten görünmezken, erişimini kaybeden adresten açıkça görülür" },
    "a.confirm-new": { headline: "Onayı yeni hedefin kendisinden iste, bu talebi başka hiçbir yere gönderme. Hesabın içinden verilen bir onay, zaten şüphe konusu olmayan hesap kontrolünü kanıtlar" },
    "w.confirm": { headline: "yeni hedef kendi içinden onaylayana, eski hedef değişikliğe itiraz edene ya da iletişim noktası onaydan önce geri çekilene veya yeniden değişene kadar", detail: "zaman aşımı: onay penceresi bu tür hedef için tanımlanan süredir; pencere yanıtsız geçtiğinde hatırlatma gönderilir ve pencerenin kalan kısmı hatırlatmanın süresini belirler. (configure contact_verification.confirmation_window)" },
    "c.resolution": { headline: "Bekleyişi ne sonlandırdı?", edges: [{ label: "Onaylandı", detail: "yeni hedefin sahibi o hedeften onay verdi" }, { label: "İtiraz edildi", detail: "yerine yenisi konan hedef, değişikliğin kendisine ait olmadığını söylüyor" }, { label: "Yerine yeni süreç geçti", detail: "iletişim noktası herhangi bir onaydan önce geri çekildi veya yeniden değişti" }] },
    "a.remind": { headline: "Aynı hedefte bir kez daha sor, bundan sonra oraya hiçbir şey gönderilmeyeceği noktayı belirterek. Yalnızca bir kez tekrarla, daha fazla değil - iki kez yanıt vermeyen bir hedefin meşgul olmaktan çok yanlış olma ihtimali daha yüksektir" },
    "a.activate": { headline: "Onayı yalnızca bu hedef için ve sadece bu hedef için kaydet. Yerini aldığı adresin sahip olduğu izin öne aktarılmaz - onay, adres değişikliğiyle birlikte taşınmaz; öyleymiş gibi davranmak, onaylanmış bir kabulün onaylanmamış bir kabule dönüşmesine yol açar" },
    "h.disputed": { headline: "Kimlik özelliği değişikliği → gerekirse doğrulama → güncelleme → yayma", detail: "önceki hedefin kendisinin yapmadığını söylediği bir iletişim noktası değişikliği" },
    "x.superseded": { headline: "onaydan önce yerine yeni süreç geçti", detail: "yerine geçen hedef kendi onay sürecini işletir" },
    "w.last": { headline: "yeni hedef kendi içinden onaylayana kadar", detail: "zaman aşımı: hatırlatmadan sonra yalnızca ilk onay penceresinin kalan kısmı beklenir; pencere hatırlatmayla asla uzatılmaz. (önerilen: ilk talepten itibaren sayılan, onay penceresinin kalan kısmı; configure contact_verification.window_remainder)" },
    "x.permitted": { headline: "bu hedef için onaylandı ve izinli", detail: "aynı iletişim noktasında yapılacak sonraki bir değişiklik, kendi onayına sahip yeni bir örnektir" },
    "x.lapsed": { headline: "onaylanmadı; hedef kullanılamaz durumda kalıyor", detail: "aynı hedefin yeniden gönderilmesi, bunun devamı değil yeni bir onay sürecini başlatır" },
  },
  },
  "CON-272": {
  shortName: "İzin Yeniden Açma",
  name: "Kanal izni kapandı → açık bir rotadan sor → yeniden açıldı ya da kapalı kaldı",
  purpose: "Kapanan bir kanalın iznini, hâlâ açık olan bir rotadan sorarak geri kazanmak - kapalı kanalın kendisine hiç ulaşmadan ve teknik bir düzeltmeyi yeni bir izinmiş gibi ele almadan.",
  nodes: {
    "t.closed": { headline: "Bir kanalın izni kapandı" },
    "c.route": { headline: "Hangi kanallar açık, uygulama aktif mi?", edges: [{ label: "Oturum açık", detail: "kişi üründe aktif, bu da hangi kanal kapandıysa kapansın talebi taşıyabilir" }, { label: "E-posta ayakta kalıyor", detail: "yakın zamanda oturum açması beklenmiyor, SMS izni kapalı ve e-posta izni açık" }, { label: "Telefon ayakta kalıyor", detail: "yakın zamanda oturum açması beklenmiyor, e-posta izni kapalı ve SMS izni açık" }, { label: "Zaten başka bir yerde açık", detail: "yeniden okunan güncel durum, az önce kapanan kanalın dışında başka bir kanalın zaten açık olduğunu gösteriyor ve yakın zamanda oturum açması beklenmiyor" }, { label: "Hiçbiri açık değil", detail: "hiçbir kanal açık değil ve yakın zamanda oturum beklenmiyor" }] },
    "a.ask-inapp": { headline: "Kapalı kanal için uygulama içi izin ekranını göster, nelerin kaçırıldığını belirt ve tercih merkezine yönlendir. Talebin kapalı kanaldan farklı bir yerde görülmesi, onu yanıtlanabilir kılar" },
    "a.ask-email": { headline: "Ayakta kalan e-posta adresinden SMS iznini yeniden açmasını iste, nelerin kaçırıldığını belirt ve tercih merkezine yönlendir. Kapalı kanala, kendisini yeniden açması için hiçbir şey gönderilmez" },
    "a.ask-sms": { headline: "Ayakta kalan telefon numarasından e-posta iznini yeniden açmasını iste, nelerin kaçırıldığını belirt ve tercih merkezine yönlendir. Kapalı kanala, kendisini yeniden açması için hiçbir şey gönderilmez" },
    "x.already-open": { headline: "başka bir kanal zaten açıktı; onarılacak bir şey yoktu", detail: "herhangi bir kanalın sonradan kapanması kendi örneğini açar" },
    "x.unreachable": { headline: "açık kanal ve talebi taşıyacak bir oturum yok; kapanma sürüyor", detail: "herhangi bir kanal açılırsa ya da bir oturum başlarsa, onarım talebi oradan işletilir" },
    "w.reopen": { headline: "ayakta kalan rotada bir karar verilene kadar", detail: "Zaman aşımı: ayakta kalan rotada karar için ilk sınırlı pencere; talep uygulama içinden gittiyse bu pencere sabit bir süre yerine kişinin bir sonraki oturumuna kadar sürer. (örnek: 2-3 gün; şunu ayarla: contactability_repair.reopen_window)" },
    "c.outcome": { headline: "Kapalı kanalın izni yeniden açıldı mı?", edges: [{ label: "Yeniden açıldı", detail: "kapalı kanalın izni artık açık" }, { label: "Hâlâ kapalı", detail: "kapalı kanalın izni hâlâ kapalı" }] },
    "a.remind": { headline: "Orijinal talebi taşıyan aynı rotada - asla ikinci bir rotada değil - kanalın izninin hâlâ kapalı olduğunu son kez hatırlat ve tercih merkezine yönlendir" },
    "w.reopen2": { headline: "ayakta kalan rotada bir karar verilene kadar", detail: "Zaman aşımı: bu kapanma için izin verilen tek hatırlatma penceresi, ilk talepten daha kısa çünkü talep zaten bir kez yapıldı. (örnek: 1-2 gün; şunu ayarla: contactability_repair.reminder_window)" },
    "c.outcome2": { headline: "Kapalı kanalın izni yeniden açıldı mı?", edges: [{ label: "Yeniden açıldı", detail: "kapalı kanalın izni artık açık" }, { label: "Hâlâ kapalı", detail: "kapalı kanalın izni hâlâ kapalı" }] },
    "x.reopened": { headline: "kapalı kanalın izni yeniden açıldı; o kanalda normal iletişim sürüyor", detail: "herhangi bir kanalın sonradan kapanması kendi örneğidir" },
    "x.stayed-closed": { headline: "bir onarım döngüsünün ardından kanalın izni kapalı kalıyor", detail: "kişinin bunu daha sonra kendisi yeniden açması bu örneğe geri dönüş değil, yeni bir izindir" },
  },
  },
  "CON-283": {
  shortName: "Sıklık Tercihi Güncelleme",
  name: "Sıklık azaltıldı → tempo yeniden hesaplandı → kaybedilmek yerine korundu",
  purpose: "Daha azını isteyen birine gerçekten daha azını alacağını doğrulamak; böylece daha az mesaj istemek, hiç istememek için gerçek bir alternatif olmaya devam eder.",
  nodes: {
    "t.reduced": { headline: "Sıklık tercihi azaltıldı" },
    "c.less-or-none": { headline: "Daha azını mı istediler, yoksa hiç mi?", edges: [{ label: "Daha az", detail: "tercih, isteğe bağlı iletişimi sonlandırmak yerine azaltılmış bir tempo belirliyor" }, { label: "Hiç istemiyor", detail: "tercih, isteğe bağlı iletişimden tam bir vazgeçme" }] },
    "a.recalculate": { headline: "Yalnızca isteğe bağlı sınıflar için ileriye dönük tempoyu yeniden hesapla, zorunlu ve işlemsel iletişimi kendi kurallarına bırak. Bizden daha az duymak isteyen biri, kendi yükümlülükleri hakkında bilgilendirilmeyi durdurmak istememiştir" },
    "x.opted-out": { headline: "tam vazgeçme; bu süreç hiçbir şey göndermiyor", detail: "sonradan hiç yerine azaltılmış bir tempo seçilirse, bu durum buraya tekrar girer" },
    "c.queued": { headline: "Zaten planlanmış olanlar yeni tempoyu aşıyor mu?", edges: [{ label: "Aşıyor", detail: "isteğe bağlı iletişim zaten yeni tempinin izin vermediği bir hızda kuyrukta" }, { label: "Sınırlar içinde", detail: "planlanmış olanlar zaten yeni tempoya uyuyor" }] },
    "a.trim": { headline: "Artık tempoyu aşan isteğe bağlı iletişimi durdur veya yeniden planla; ikisi arasındaki seçimi mesajın daha sonra hâlâ bir anlam taşıyıp taşımadığına göre yap. Birinin daha az istedikten sonra alacağı ilk şey birikmiş mesajlar olmamalı" },
    "a.confirm": { headline: "Neyin değiştiğini bir kez doğrula: isteğe bağlı iletişimin artık ne sıklıkla geleceğini, hiç isteğe bağlı olmadığı için etkilenmeyeni ve tamamen durdurmanın yolunu. Etkilenmeyeni belirtmek, gelecek hafta zorunlu bir bildirim geldiğinde kişinin hiçbir şeyin uygulanmadığı sonucuna varmasını engeller" },
    "w.cycle": { headline: "iletişimin ne sıklıkla gelmesi gerektiğine dair bilinçli bir değişiklik olana kadar - haftalıktan aylığa, her şeyden yalnızca önemliye, belirtilen bir minimuma indirim ya da kişinin tüm isteğe bağlı iletişimden vazgeçmesi", detail: "zaman aşımı: yeni tempoda tam bir döngünün ardından. (configure frequency_reduction.cycle)" },
    "c.settled": { headline: "İlk döngü sırasında ne değişti?", edges: [{ label: "Yeniden azaltıldı", detail: "döngü tamamlanmadan önce ek bir azaltma kaydedildi" }, { label: "Tamamen durduruldu", detail: "döngü tamamlanmadan önce tam bir vazgeçme kaydedildi" }] },
    "x.holding": { headline: "azaltılmış tempo yürürlükte ve sabit", detail: "aynı tercihte sonradan yapılacak bir değişiklik yeni bir örnek başlatır" },
    "x.reduced-again": { headline: "ilk tempo oturmadan ikinci kez azaltıldı", detail: "kaydedilen her azaltma kendi örneğidir ve kendi tek doğrulamasını alır" },
  },
  },
  "CON-31": {
  shortName: "İzin Doğrulama",
  name: "İzin kaydı → kapsam doğrulama → etkinleştir veya reddet",
  purpose: "Bir izin kararını, sadece \"evet\" diyen bir bayrak yerine, tam olarak neyin yetkilendirildiğini gösteren denetlenebilir bir kayda dönüştürmek.",
  nodes: {
    "t.decision": { headline: "Açık izin kararı alındı" },
    "a.capture": { headline: "İzin türünü, amacı, kanalı, kapsamı, kaynağı, zamanı ve gerekli olduğu durumlarda kanıtı veya onay metni sürümünü kaydet - sürüm önemlidir, çünkü kişinin kabul ettiği şey o an önünde duran metindir" },
    "c.valid": { headline: "Bu geçerli bir izin mi ve kapsamı net mi?", edges: [{ label: "Geçerli ve net", detail: "eylem bilinçliydi, amaç ve kanal belirlenmiş, kapsam da net" }, { label: "Geçerli ama kapsamı belirsiz", detail: "izin açıkça verilmiş, ancak neyi kapsadığı birden fazla şekilde yorumlanabiliyor" }, { label: "İzin sayılmaz", detail: "eylem bir yetkilendirme oluşturmuyor - zımni bir kabul, önceden işaretlenmiş bir kutu ya da onayla karıştırılan bir kayıt" }] },
    "c.existing": { headline: "Bu amaç, kanal ve kapsam için zaten bir izin var mı?", edges: [{ label: "Mevcut", detail: "önceki bir kayıt aynı kombinasyonu kapsıyor" }, { label: "Yeni", detail: "bunu kapsayan önceki bir kayıt yok" }] },
    "a.narrow": { headline: "Yalnızca savunulabilir en dar yorumu kaydet ve belirsizliği işaretle, böylece varsayımla değil sorarak çözülebilsin. Belirsiz bir kapsamı geniş yorumlamak, tek bir bültene kaydolmanın her şeyi gönderme iznine dönüşmesine yol açar" },
    "x.rejected": { headline: "izin olarak kaydedilmedi", detail: "sonradan verilecek gerçek bir izin kararı normal şekilde yeni bir kayıt oluşturur; daha sonraki bir sürecin onayla karıştırabileceği yarım kalmış hiçbir şey saklanmaz" },
    "a.reconcile": { headline: "Bu izin türü için geçerli kurallara göre önceki kayıtla uzlaştır; üzerine yazmak yerine ekleyerek yap - önceki verilen izin, kaynağı ve sürümü okunabilir kalır, çünkü izin geçmişi, o izinle neyin gönderildiğinin tek savunmasıdır" },
    "a.activate": { headline: "İzni tam olarak kaydedilen amaç, kanal ve kapsam için etkinleştir, bunlara yakın hiçbir şey için değil" },
    "x.active": { headline: "kaydedilen amaç, kanal ve kapsam için izin etkin", detail: "aynı kombinasyon üzerine verilecek sonraki her karar yeni bir örnek açar; etkin bir izindeki değişiklikler bu sürecin değil, CON-35'in konusudur" },
  },
  },
  "CON-32": {
  shortName: "Tercih Kaydı",
  name: "Tercih kaydı → kalıcı hale getirme → uygun iletişimi kişiselleştirme",
  purpose: "Bir kişinin izin verilen iletişimin nasıl yapılmasını istediğini, yapısı gereği izne dönüşemeyecek bir depoda kaydetmek.",
  nodes: {
    "t.set": { headline: "Tercih açıkça belirlendi veya değiştirildi" },
    "a.persist": { headline: "Değeri kaynağıyla ve değiştiği zamanla birlikte, yalnızca beyan edilmiş yanıtları tutan depoya kalıcı olarak kaydet. Çıkarım başka bir yere yazılır - ikisi aynı alanı paylaştığı anda, kişinin gerçekte ne söylediğini kimse anlayamaz" },
    "c.permitted": { headline: "Bu tercihin şekillendireceği iletişime gerçekten izin var mı?", edges: [{ label: "İzinli", detail: "etkin bir izin, tercihin uygulandığı amaç ve kanalı kapsıyor" }, { label: "İzinli değil", detail: "bunu kapsayan bir izin yok - biri bir kanalı hiç yetkilendirmeden o kanal için tercih belirttiğinde de bu geçerli" }] },
    "a.apply": { headline: "Tercihi, zaten izin verilmiş olan iletişime uygula - bir tercihin yapabileceği tek şey budur" },
    "x.stored-only": { headline: "tercih kaydedildi, hiçbir şeyi şekillendirmiyor", detail: "izin sonradan verilirse, kaydedilen tercih o andan itibaren geçerli olur; tercih bir şeyi yetkilendirmedi, sadece bekledi" },
    "h.recalculate": { headline: "Tercih değişikliği → aktif süreçleri yeniden hesaplama → durdur veya uyarla", detail: "hâlihazırda çalışan süreçlerin ne yapması gerektiğini değiştirecek bir tercih" },
  },
  },
  "CON-33": {
  shortName: "Tercih Yeniden Hesaplama",
  name: "Tercih değişikliği → aktif süreçleri yeniden hesaplama → durdur veya uyarla",
  purpose: "Bir tercih değişikliğinin yalnızca profil alanına değil, kuyrukta zaten bekleyen mesajlara da ulaşmasını sağlamak.",
  nodes: {
    "t.changed": { headline: "Yetkili tercih değişti" },
    "a.history": { headline: "Yeni değeri değişiklik geçmişini koruyarak kalıcı hale getir - neydi, neye dönüştü ve ne zaman. Eski tercihe göre zaten teslim edilmiş mesajlar yeniden yazılmaz ve bunlar için özür de dilenmez; gönderildikleri anda doğruydular" },
    "a.identify": { headline: "Bu tercihin etkilediği aktif süreç örneklerini ve kuyruktaki eylemleri belirle. Asıl mesele kuyruktur: yalnızca henüz planlanmamış olanı etkileyen bir tercih, kimsenin fark edeceği hiçbir şeyi değiştirmez" },
    "c.conflict": { headline: "Bekleyen her eylem yeni tercih karşısında nasıl bir durumda?", edges: [{ label: "Artık istenmiyor", detail: "yeni tercihe göre bu eylemin hiç gerçekleşmemesi gerekiyor - kaldırılan bir konu, kapatılan bir kategori" }, { label: "Yasaklanmadı, yeniden şekillendi", detail: "eylem yine gerçekleşiyor ama farklı şekilde - değişen bir dil, değişen bir format, değişen bir ayrıntı düzeyi" }, { label: "Etkilenmedi", detail: "bekleyen hiçbir şeyle çelişki yok" }] },
    "a.suppress": { headline: "Çelişen eylemleri gerçekleşmeden önce durdur. Eski tercihe göre yazılmış kuyruktaki bir eylemin, sırf önce sıraya girdiği için yeni tercihin üzerine yazmasına izin verilmemeli" },
    "a.adapt": { headline: "Bekleyen eylemleri gerçekleştirmeden önce yeni tercihe uyarla, sonradan değil - sonradan uyarlamanın adı özürdür" },
    "x.recalculated": { headline: "gelecekteki yönlendirme yeni tercihe göre hizalandı; izin değişmedi", detail: "bir sonraki tercih değişikliği bunu yeniden açar" },
  },
  },
  "CON-34": {
  shortName: "Sıklık Yeniden Hesaplama",
  name: "İletişim sıklığı değişikliği → temposu yeniden hesaplama → ileriye dönük uygulama",
  purpose: "İsteğe bağlı iletişimin ne sıklıkla gönderilebileceğini yeniden hesaplamak, ama bunun kişinin almak zorunda olduğu mesajlara sessizce sızmasına izin vermeden.",
  nodes: {
    "t.frequency": { headline: "Sıklık tercihi değişti" },
    "a.classes": { headline: "Bu tercihin hangi iletişim sınıflarını yönettiğini belirle. Varsayılan olarak bu yalnızca isteğe bağlı iletişimdir ve bir politika açıkça aksini söylemedikçe geçerli olan da bu varsayılandır" },
    "c.required": { headline: "Yürürlükteki politika bu tercihi zorunlu veya işlemsel iletişimi de kapsayacak şekilde genişletiyor mu?", edges: [{ label: "Politika genişletiyor", detail: "belirli bir politika, hangisini belirterek bu tercihin zorunlu iletişimi de kapsadığını söylüyor" }, { label: "Yalnızca isteğe bağlı", detail: "böyle bir politika yok - olağan durum" }] },
    "a.include": { headline: "Politikanın belirttiği zorunlu sınıfları, yalnızca bunları dahil et; hangi politikanın bunu yetkilendirdiğini kaydet" },
    "a.exclude": { headline: "Zorunlu ve işlemsel iletişimi kendi kurallarına bırak. Daha az pazarlama e-postası isteyen biri, hizmetinin askıya alındığını öğrenmek istemediğini söylememiştir" },
    "a.recalculate": { headline: "Yönetilen sınıflar için gelecekteki tempoyu yeniden hesapla. Zaten teslim edilmiş mesajlara dokunulmaz - bir tempo değişikliği tanımı gereği ileriye dönüktür" },
    "c.queued": { headline: "Kuyrukta zaten bekleyenler yeni tempoyu aşıyor mu?", edges: [{ label: "Aşıyor", detail: "yeni tercihin izin verdiğinden daha fazla isteğe bağlı iletişim planlanmış" }, { label: "Sınırlar içinde", detail: "kuyruk zaten uyumlu" }] },
    "a.trim": { headline: "Artık tempoyu aşan isteğe bağlı iletişimi durdur veya yeniden planla; ikisi arasındaki seçimi, mesajın daha sonra anlamını koruyup korumadığına göre yap" },
    "x.applied": { headline: "tempo ileriye dönük olarak yeniden hesaplandı; izin değişmedi", detail: "bir sonraki sıklık değişikliği bunu yeniden açar" },
  },
  },
  "CON-35": {
  shortName: "İzin Değişikliği Uygulaması",
  name: "Onay veya izin değişikliği → anında uygulama → yayma",
  purpose: "İzin değiştiği anda etkilenen iletişimi durdurmak ve dağıtık sistemlerin bunu sonradan yakalamasına izin vermek.",
  nodes: {
    "t.change": { headline: "Yetkili izin değişikliği" },
    "a.record": { headline: "Eski durumu, yeni durumu, kaynağı, zamanı ve uygulandığı kapsam, amaç ve kanalı kaydet - ekleyerek, çünkü sonradan sorulan şey her zaman belirli bir anda ne yapmaya yetkili olduğumuzdur. Bu geçiş için change_version atar ve geldiği sistemi belirten change_origin'i kaydeder" },
    "c.direction": { headline: "Bu izni daraltıyor mu, genişletiyor mu?", edges: [{ label: "Geri çekme veya kısıtlama", detail: "izin kaldırılıyor, daraltılıyor veya kısıtlanıyor" }, { label: "Verme veya genişletme", detail: "izin veriliyor veya genişletiliyor" }] },
    "a.enforce": { headline: "Kuyruktaki her şey dahil olmak üzere, etkilenen giden iletişimi hemen durdur; hiçbir alt sistemin onay vermesini bekleme. Bu asimetri bilinçlidir: geç uygulanan bir izin verme, gönderilebilecek bir mesaja mal olur; geç uygulanan bir izin geri çekme ise gönderilmemesi gereken bir mesaja mal olur" },
    "a.propagate": { headline: "Yeni durumu, change_origin ve change_version taşıyarak bağımlı sistemlere yay; böylece sıra dışı gelen bir yankı bunu geri alamaz ve yeniden teslim bir alışverişi baştan başlatamaz - bağımlı bir sistem, gelen change_version'ı bu (person_id, amaç, kanal, kapsam) için zaten elinde tuttuğundan daha yeni ise yaymayı uygular; hem yeniden teslimi hem sıra bozulmasını güvenli kılan da budur" },
    "w.converge": { headline: "gerekli yayma onayları gelene kadar", detail: "zaman aşımı: bu izin türü için senkronizasyon SLA'sının ardından" },
    "c.consistent": { headline: "Bağımlı sistemler artık uyumlu mu?", edges: [{ label: "Uyumlu", detail: "gereken tüm sistemler yeni durumu beklenen sürümde doğruluyor" }, { label: "Uyumsuz", detail: "en az bir sistem farklı bir durum bildiriyor" }] },
    "h.conflict": { headline: "İzin çelişkisi → güvenli mod → uzlaştırma → geri yükleme", detail: "yeni izin durumunda uzlaşamayan sistemler" },
    "x.consistent": { headline: "izin değişikliği uygulandı ve bağımlı sistemler arasında tutarlı", detail: "bu izinde yapılacak bir sonraki değişiklik yeni bir örnek açar" },
  },
  },
  "CON-36": {
  shortName: "Ulaşılabilirlik Yeniden Hesaplama",
  name: "Kanal ulaşılabilirliği değişikliği → erişilebilirliği yeniden hesaplama → yönlendir veya durdur",
  purpose: "Bir kanalın birine ulaşıp ulaşamayacağını, ulaşmaya izinli olup olmadığından tamamen ayrı bir durum olarak takip etmek ve her hedefin rota sağlığını ayrı ayrı tutarak, gelecekteki gönderimlerin bozuk olanı atlayarak ilerlemesini sağlamak.",
  nodes: {
    "t.contactability": { headline: "Kanal ulaşılabilirliği önemli ölçüde değişti" },
    "a.state": { headline: "Ulaşılabilirlik durumunu CONTACTABLE, TEMPORARILY_UNAVAILABLE, UNDELIVERABLE, INVALID veya RESTORED olarak güncelle; izne dokunma - birine ulaşamayan bir kanal, ulaşmaya izinli olup olmadığı konusunda hiçbir şey söylemiş olmaz" },
    "c.state": { headline: "Kanıtlar bu iletişim noktası hakkında neyi ortaya koyuyor?", edges: [{ label: "Geri geldi veya ulaşılabilir", detail: "iletişim noktası yeniden çalışıyor" }, { label: "Yeni eklenen veya doğrulanan bir hedef", detail: "bir rota ilk kez eklendi veya doğrulandı" }, { label: "Kullanılamıyor", detail: "geçici olarak kullanılamıyor, teslim edilemiyor veya geçersiz" }] },
    "a.resume": { headline: "Bu iletişim noktasında gelecekteki uygun iletişime yeniden izin ver; bunu, neden durdurulduğuna dair geçmişi silerek değil, mevcut kanıttan yola çıkarak kaydet. Önceki hatalar okunabilir kalır, çünkü sürekli bozulup düzelen bir rotayı görebilmek değerlidir. Ulaşılamadığı sırada kaçırılanlar yeniden gönderilmez - kuyruk, o zamandan beri değişmiş bir durumu tarif ediyordu" },
    "a.add": { headline: "Yeni hedefi gelecekteki uygun iletişim için kullanılabilir hale getir. Kullanılabilir olmak onaylanmış olmak anlamına gelmez - doğrulanmış bir adres bir rotadır, belirli bir amacı taşıyıp taşıyamayacağı ise ayrı ayrı karara bağlanan farklı bir sorudur" },
    "a.suppress": { headline: "Bu iletişim noktasındaki gelecekteki denemeleri hata sınıfına göre durdur - geçici bir hata ile kalıcı olarak geçersiz bir hedef aynı şekilde ele alınmaz ve öyleymiş gibi kaydedilmemelidir. Geçmiş teslimat kayıtlarına dokunulmaz: geçen yıl bu adrese teslim edilen bir mesaj teslim edilmiştir, bunu bugünün durumuna göre yeniden yazmak, kişiye gerçekte ne söylendiğinin kaydını yok eder" },
    "c.pending": { headline: "Bu iletişim noktasını bekleyen herhangi bir iletişim var mı?", edges: [{ label: "Bekleyen var", detail: "bu hedef için yükümlülükler tutuldu ya da hedef kullanılamazken başka yere yönlendirildi" }, { label: "Yok", detail: "bu iletişim noktasına bağlı bekleyen hiçbir şey yok" }] },
    "c.pending-blocked": { headline: "Bu iletişim noktasını hedefleyen bekleyen bir iletişim var mı?", edges: [{ label: "Hedefleyen var", detail: "az önce kullanılamaz hale gelen bir hedefe karşı yükümlülükler kuyrukta bekliyor" }, { label: "Yok", detail: "buraya yönlendirilmiş bekleyen hiçbir şey yok" }] },
    "h.reroute": { headline: "İletişim yükümlülüğü → alıcıyı çözümleme → hazır, beklet veya başarısız", detail: "bu hedefin sağlığındaki bir değişiklikten etkilenen bekleyen iletişim" },
    "x.resumed": { headline: "iletişim noktasına yeniden ulaşılabiliyor; hiçbir şey yeniden gönderilmedi", detail: "bir sonraki ulaşılabilirlik değişikliği bunu yeniden açar" },
    "c.alternative": { headline: "Bu kişiye başka ne ile ulaşılabilir?", edges: [{ label: "İzinli ve uygun bir alternatif", detail: "başka bir kanal hem bu amaç için izinle kapsanıyor hem de sürecin yaptığı işe uygun" }, { label: "Henüz yok, ama hata geçici", detail: "iletişim noktası geri gelebilir ve iletişim onu bekleyebilir" }, { label: "Yok ve önemli", detail: "izinli bir alternatif yok ve iletişim, kişinin bilmesi gerekecek kadar önemli" }, { label: "Yok ama bekleyebilir", detail: "izinli bir alternatif yok ve yükseltilmesi gereken bir şey yok" }] },
    "x.alternative": { headline: "buradan ulaşılamıyor, izinle başka yerden ulaşılabiliyor", detail: "alternatifin kullanılıp kullanılmayacağına gönderen süreç karar verir; bu süreç yalnızca bunun izinli olduğunu belirler, bunu önermekle aynı şey değildir" },
    "w.restore": { headline: "iletişim noktasına yeniden ulaşılabilir hale gelene kadar", detail: "zaman aşımı: bu hata sınıfı için tanımlanan sürenin ardından" },
    "h.human": { headline: "external:human-in-the-loop-yaşam döngüsü", detail: "teslim edilecek izinli bir yolu olmayan önemli bir iletişim" },
    "x.unreachable": { headline: "izinli ve çalışan bir kanal yok; izin değişmedi", detail: "düzeltilmiş bir iletişim noktası veya yeni bir izin bunu yeniden açar - kişi vazgeçmemiştir ve burada hiçbir şey vazgeçmiş gibi kaydedilemez" },
  },
  },
  "CON-38": {
  shortName: "Baskılama",
  name: "Baskılama → gerekçe ve kapsam → kaldır veya sürdür",
  purpose: "Bir gönderimin neden engellendiğini açık, kapsamı belli ve kaldırılabilir bir durum olarak kaydetmek.",
  nodes: {
    "t.suppression": { headline: "Baskılama koşulu aktif oldu" },
    "a.record": { headline: "Baskılama gerekçesini, kapsamını, kaynağını, başlangıç zamanını ve varsa kaldırma koşulunu kaydet" },
    "c.kind": { headline: "Baskılamanın tanımlı bir kaldırma koşulu var mı?", edges: [{ label: "Geçici", detail: "belirli bir süre, olay, sıklık penceresi veya kapanan bir vaka baskılamayı kaldıracak" }, { label: "Kalıcı", detail: "izin geri çekme, yasal kısıtlama veya geçersiz iletişim noktası gibi yetkili durum değişene kadar sürer" }] },
    "w.release": { headline: "baskılamayı kaldıracak koşul gerçekleşene kadar", detail: "zaman aşımı: gerekçeye uygun review süresinin ardından. (communication_suppression.release ayarlanmalı)" },
    "x.persistent": { headline: "temel durum değişene kadar baskılama devam eder", detail: "koşul değiştiğinde yeni bir değerlendirme açılır; kişi ve geçmiş kayıtları korunur, yalnızca gönderim engellenir" },
    "a.reevaluate": { headline: "Etkilenen akışların güncel durum'e göre ne yapması gerektiğini yeniden değerlendir. Baskılama sırasında bekleyen mesajları sonradan toplu göndermeden iptal et" },
    "c.still": { headline: "Baskılama gerekçesi hâlâ geçerli mi?", edges: [{ label: "Hâlâ geçerli", detail: "baskılamaya neden olan koşul devam ediyor" }, { label: "Artık geçerli değil", detail: "kaldırma olayı gelmese de gerekçe geçerliliğini yitirdi" }] },
    "x.released": { headline: "baskılama kaldırıldı; güncel uygunluk yeniden hesaplandı, bekleyen mesajlar iptal edildi", detail: "yeni bir baskılama koşulu kendi gerekçesi ve kapsamıyla yeni bir örnek açar" },
  },
  },
  "CON-39": {
  shortName: "İletişim Cooldown'u",
  name: "Cooldown → isteğe bağlı iletişimi beklet → yeniden değerlendir",
  purpose: "İzne dokunmadan ve gerekenden fazlasını kapsamadan, isteğe bağlı iletişim yükünü bir süreliğine azaltmak.",
  nodes: {
    "t.cooldown": { headline: "Cooldown'u başlatan olay" },
    "a.create": { headline: "Cooldown'u gerekçesiyle uyumlu kapsamda oluştur; gerekçeyi, kapsamı, başlangıcı, bitiş zamanını veya erken bitirme koşulunu kaydet" },
    "c.scope": { headline: "Bu gerekçe, zorunlu veya güvenlik iletişimini de bekletmeyi haklı çıkarıyor mu?", edges: [{ label: "Yalnızca isteğe bağlı", detail: "olağan durum - gerekçe güvenlikle değil yükle ilgili" }, { label: "Politika genişletiyor", detail: "belirli bir politika, bekletilmesi gereken zorunlu iletişimi adıyla belirtiyor ve nedenini açıklıyor" }] },
    "w.cooldown": { headline: "bekleme süresini oluşturan koşul değişene kadar", detail: "zaman aşımı: bekleme süresi dolduğunda" },
    "a.policy-scope": { headline: "Cooldown kapsamını yalnızca politikanın açıkça belirttiği zorunlu iletişimlere genişlet ve ilgili politikayı kaydet" },
    "c.basis": { headline: "Temel koşul nasıl değişti?", edges: [{ label: "Gerekçe ortadan kalktı", detail: "sessiz dönemi haklı çıkaran durum beklenenden erken çözüldü" }, { label: "Gerekçe ağırlaştı", detail: "durum, zamana bağlı bir bekletme yerine açık, gerekçeli bir durdurmayı gerektirir hale geldi" }] },
    "a.reevaluate": { headline: "Güncel uygunluğu yeniden değerlendir. Cooldown sırasında kuyrukta bekleyen mesajları sonradan göndermek yerine iptal et" },
    "h.suppression": { headline: "Baskılama → gerekçe ve kapsam → kaldır veya sürdür", detail: "gerekçesini aşan bir bekleme süresi" },
    "x.released": { headline: "bekleme süresi sona erdi; uygunluk yeniden hesaplandı, bekleyen mesajlar iptal edildi", detail: "bekleme süresini tetikleyen yeni bir olay, kendi gerekçesi ve kapsamıyla yeni bir örnek açar" },
  },
  },
  "CON-40": {
  shortName: "İzin Çelişkisi Çözümü",
  name: "İzin çelişkisi → güvenli mod → uzlaştırma → geri yükleme",
  purpose: "İki sistem izin konusunda anlaşamazken isteğe bağlı iletişimi kapalı tutmak ve uzlaşmayı hangi değerin daha fazlasına izin verdiğine göre değil, kanıta dayalı olarak sağlamak.",
  nodes: {
    "t.conflict": { headline: "Çelişen izin durumları tespit edildi" },
    "a.failsafe": { headline: "Herhangi bir şey toplanmadan veya karara bağlanmadan önce, etkilenen isteğe bağlı giden iletişimi hemen durdur. Bu bilinçli olarak ilk sırada çalışır: göndermeye devam ederken araştırma yapmak, belirsizliği göndermeden yana çözer ki bu sürecin var oluş amacı tam da bunu önlemektir" },
    "a.collect": { headline: "Katılan her sistemden durumunu, kaynağını, zaman damgasını, sürümünü ve değişikliğin kökenini topla. Yalnızca bir zaman damgası yetki anlamına gelmez - saatler birbiriyle uyuşmayabilir ve yazma sırası, kararların verildiği sıra değildir" },
    "a.scope": { headline: "Tam olarak hangi amaç, kanal ve kapsam kombinasyonunun tartışmalı olduğunu belirle. Bunun dışındaki her şey çelişkili değildir ve durdurulmaz" },
    "c.resolvable": { headline: "Kanıtlardan güvenli, yetkili bir durum hemen belirlenebiliyor mu?", edges: [{ label: "Belirlenebilir", detail: "köken ve sürüm, kişinin gerçek kararını hangi kaydın yansıttığını gösteriyor" }, { label: "Belirlenemez", detail: "kanıtlar hangi durumun doğru olduğunu ortaya koymuyor - daha izin verici olanın daha yeni olduğu durum da dahil, bu doğru olmakla aynı şey değildir" }] },
    "a.apply": { headline: "Belirlenen durumu uygula ve düzeltmeyi çözüm için change_origin ile yeni bir change_version taşıyarak yay; böylece yeniden teslim edilmiş veya sıra dışı gelen bir yankı yeni bir değişiklik olarak değil, göz ardı edilerek ele alınır - bir uzlaştırmayı senkronizasyon döngüsüne çeviren şey tam olarak budur" },
    "a.enter": { headline: "PERMISSION_CONFLICT durumunu kaydet ve güvenli mod durdurmasını yürürlükte bırak. Çözümsüz olmak, iki durum arasındaki bir boşluk değil, adı konmaya değer bir durumdur" },
    "a.verify": { headline: "Uyuşması gereken sistemler arasında yakınsamayı, change_version kontrollü yazımlar kullanarak doğrula; böylece doğrulamanın kendisi alışverişin yeni bir turuna dönüşmez - bir sistemin kendi raporu yalnızca çözümün change_version'ında kabul edilir, çıplak bir onaydan asla çıkarım yapılmaz" },
    "w.reconcile": { headline: "yetkili uzlaştırma tamamlanana veya manuel bir çözüm kaydedilene kadar", detail: "zaman aşımı: bu izin türü için tanımlanan uzlaştırma süresinin ardından" },
    "c.converged": { headline: "Gereken tüm sistemler artık çözülen durumu tutuyor mu?", edges: [{ label: "Yakınsadı", detail: "gereken tüm sistemler çözülen durumu çözülen sürümde bildiriyor" }, { label: "Hâlâ uyumsuz", detail: "düzeltmenin ardından en az bir sistem hâlâ yakınsamadı" }] },
    "h.manual": { headline: "Karar talebi → doğrulama → yönlendir, reddet veya beklet", detail: "otomatik uzlaştırmanın çözemediği bir çelişki" },
    "a.release": { headline: "Çelişki durumunu kaldır ve şu anda neyin uygun olduğunu yeniden değerlendir. Çelişki hangi yönde çözülürse çözülsün, çelişki sırasında bekletilen iletişim yeniden gönderilmez" },
    "x.resolved": { headline: "çelişki çözüldü, durum yakınsadı, uygunluk yeniden hesaplandı", detail: "aynı kombinasyonda ortaya çıkacak yeni bir uyumsuzluk yeni bir örnek açar ve bu örneğin kaydı, bir sonrakinin değerlendirileceği verinin parçası olur" },
  },
  },
  "DEC-184": {
  shortName: "Ek Bilgi Talebi",
  name: "Daha fazla bilgi gerekiyor → topla → yeniden doğrula → incelemeye devam et",
  purpose: "Bir kararı, gerçekten eksik olan bilgi yüzünden askıya almak, ama şimdiye kadar yapılan incelemeyi kaybetmeden.",
  nodes: {
    "t.identified": { headline: "Bilgi ihtiyacı tespit edildi" },
    "a.specify": { headline: "Talebi tam olarak netleştirin: hangi bilgi, hangi belge, kimden ve karar bunu neden gerektiriyor. Belirsiz bir talep belirsiz bir yanıt ve ardından ikinci bir tur doğurur; işe yarar diye ilgisiz şeyler de istemek tek bir eksikliği bir anket formuna dönüştürür - iki günlük bir vakanın üç haftaya yayılmasının nedeni budur" },
    "a.state": { headline: "Durumu AWAITING_INFORMATION olarak kaydedin ve incelemenin şimdiye kadar ortaya koyduğu her şeyi koruyun. Vaka sıfırlanmaz, yalnızca askıya alınır - ek bilgi talebi bir ret anlamına gelmez ve vakaya geri dönen bir incelemeci baştan başlamak zorunda kalmamalıdır" },
    "c.source-type": { headline: "Eksik bilgiyi asıl elinde bulunduran kim?", edges: [{ label: "Talep sahibi veya başka bir dış taraf", detail: "bunu yalnızca kuruluş dışındaki biri sağlayabilir" }, { label: "Kuruluş içinden biri", detail: "buna sahip olan ya da bunu üretmeye yetkili olan bir iç sahip, ekip veya sistem var" }] },
    "a.request": { headline: "Dış kaynaktan hâlâ eksik olanı, tam olarak adını vererek talep edin. Tüm gereksinimi yeniden istemek, zaten verilmiş şeyleri de yeniden istemek anlamına gelir ve bu, ilk gönderimin göz ardı edildiği izlenimini verir - bir iç sistemin zaten elinde bulunan bir şeyi müşteriden istemek bu hatanın en sık görülen halidir" },
    "a.request-internal": { headline: "Eksik gereksinimi, bloke olan kararı ve değişmeyen son tarihini de taşıyarak iç sahibine ait bir iş kalemi olarak açın. İç bir kanıt eksikliğinin müşteri kanalına yönlendirilmesi, yanlış tarafa hiç kabul etmediği bir yol üzerinden soru sormak demektir" },
    "w.info": { headline: "istenen bilgi ulaşana veya talep sahibi talebini geri çekene kadar", detail: "Zaman aşımı: politikanın bu gereksinim için tanımladığı son tarihin ardından. (configure information_requirement.info)" },
    "c.received": { headline: "Bekleme nasıl sonuçlandı?", edges: [{ label: "Bilgi geldi", detail: "gereksinime karşılık bir şey sağlandı" }, { label: "Karar artık gerekli değil", detail: "talep geri çekildi veya hakkında olduğu şey artık mevcut değil" }] },
    "a.deadline": { headline: "Politikanın tanımladığı zaman aşımı mantığını uygulayın: eskalasyon, kapanış veya elde bulunan kanıtla karar verme. Hangisinin uygulanacağı politikadan gelir: kimse yanıt vermediği için sessizce kapanan bir vaka, kimsenin vermediği bir rettir; sessizce ilerleyen bir vaka ise birinin eksik olduğunu bildiği kanıtla verilmiş bir karardır" },
    "a.validate": { headline: "Gelen şeyi, belirtilen gereksinime göre ilgililik ve eksiksizlik açısından doğrulayın. Bir şeyin gelmiş olması, gereksinimin karşılandığı anlamına gelmez - doğru türde ama yanlış şeyi söyleyen bir belge yalnızca bir kontrol listesini karşılar, bir kararı değil" },
    "a.moot": { headline: "Vakayı, gerekçesiyle birlikte artık karar gerektirmediği şeklinde kaydedin. Bu ne bir ret ne de bir onaydır; ikisinden biri gibi bildirmek, talep sahibine olanlar hakkında yanlış bir şey söylemek olur" },
    "c.timeout": { headline: "Politika, süresi dolmuş bir bilgi son tarihi için neyi tanımlıyor?", edges: [{ label: "Elde olanla karar ver", detail: "politika, eldeki kanıtla karar verilmesine izin veriyor; eksiklik de eksiklik olarak kaydediliyor" }, { label: "Vakayı kapat", detail: "politika, yanıtsız kalan bir vakayı, bunun için tanımlanmış bir mantıkla açıkça kapatıyor" }, { label: "Eskale et, veya politika bunu tanımlamıyor", detail: "politika ya eskalasyonu öngörüyor ya da hiçbir şey söylemiyor; bu durumda burada bir kapanış mantığı uydurulmaz" }] },
    "c.complete": { headline: "Gelen, gereksinimi karşılıyor mu?", edges: [{ label: "Karşılıyor", detail: "gereksinim, ilgili ve eksiksiz şekilde karşılanıyor" }, { label: "Kısmen", detail: "gereksinimin bir kısmı karşılanıyor, bir kısmı karşılanmıyor" }] },
    "x.moot": { headline: "artık karar gerektirmiyor; inceleme geçmişi sonuçlandırılmış değil, kapanmamış olarak duruyor", detail: "aynı değerlendirmeye yönelik yenilenen bir ihtiyaç yeni bir taleptir; bu talep bu vakaya ve kanıtlarına atıfta bulunabilir" },
    "h.resume": { headline: "İnceleme başladı → kanıtı değerlendir → karar ver veya ek bilgi talep et", detail: "bir bilgi gereksinimi çözüldü veya politika kapsamında tüketildi" },
    "a.close": { headline: "Vakayı, politikanın gerçekten belirttiği mantığa göre kapatın; esasa dayalı değil, bilgi eksikliği nedeniyle kapandığını kaydedin" },
    "h.escalate": { headline: "Karar eskalasyonu → üst makam → karar ver, geri gönder veya yeniden ata", detail: "eskalasyonla veya tanımlanmış bir kapanış mantığı olmadan süresi dolan bir bilgi son tarihi" },
    "c.further": { headline: "Politika, kalanının talep edilmesine izin veriyor mu?", edges: [{ label: "İzin veriyor, talep bütçesi dahilinde", detail: "ek turlara izin veriliyor ve vaka bunların tamamını henüz kullanmadı" }, { label: "İzin vermiyor, veya bütçe tükendi", detail: "başka bir tura izin verilmiyor, ya da vaka modelin izin verdiği kadar tur zaten yapmış durumda" }] },
    "x.closed-noinfo": { headline: "bilgi eksikliği nedeniyle kapandı; esasa ilişkin bir karar verilmedi", detail: "bilginin mevcut olduğu yeni bir talep sıfırdan değerlendirilir ve bu kapanış aleyhine sayılmaz" },
  },
  },
  "DEC-267": {
  shortName: "Olumsuz Karar Telafisi",
  name: "Olumsuz karar → belirtilen düzeltme yolu → düzeltildi veya kesinleşti",
  purpose: "Birine, kararın aleyhine sonuçlandığını ve tam olarak şu üç durumdan hangisinin geçerli olduğunu söylemek - şimdi düzeltilebilir, ileride yeniden başvurulabilir ya da kesin - böylece sonuç, yorumlanması gereken bir hüküm değil, üzerine hareket edilebilecek net bir durum olarak iletilir.",
  nodes: {
    "t.adverse": { headline: "Olumsuz karar kaydedildi" },
    "c.path": { headline: "Politika, bu gerekçe için gerçekte hangi yolu tanımlıyor?", edges: [{ label: "Şimdi düzeltilebilir", detail: "gerekçe, ilgili kişinin tanımlı bir süre içinde düzeltebileceği bir şey" }, { label: "İleride yeniden başvurulabilir", detail: "şu anda düzeltilebilecek bir şey yok, ancak politika yeni bir talep için koşullar tanımlıyor" }, { label: "Kesin", detail: "politika ne düzeltme, ne yeniden başvuru ne de itiraz tanımlıyor" }] },
    "a.correctable": { headline: "Neyin karara bağlandığını, nedenini, tam olarak neyin değişmesi gerektiğini ve son tarihini bildirin - kulağa mantıklı gelenden değil, yolu tanımlayan politikadan alarak. Geri dönüş yolu belirtilmeden iletilen bir karar bir azarlamadır ve düzeltme yerine şikâyet doğurur" },
    "a.reapply": { headline: "Politikanın yeni bir talep için gerçekte tanımladığı koşulları belirtin - ne kadar süre sonra, hangi gerekçeyle, hangi kanıtla - ve bunun ötesine geçmeyin. Mesajı yumuşatmak için uydurulan bir hak, birinin üzerine plan kurduğu ve bu yüzden yeniden reddedildiği bir hakka dönüşür" },
    "a.final": { headline: "Kararın kesin olduğunu ve geri dönüş yolu bulunmadığını, yumuşatmak için herhangi bir eyleme çağrı eklemeden söyleyin. İyi niyetle sunulan sahte bir yol, reddin kendisinden daha pahalıya mal olur - çünkü daha sonra, üzerine zaten hareket etmiş biri tarafından fark edilir" },
    "w.remediate": { headline: "düzeltme tamamlandı olarak kaydedilene, düzeltme başarısız olana ya da karar geri çekilene veya bozulana kadar", detail: "Zaman aşımı: politikanın tanımladığı düzeltme son tarihinin ardından. (configure adverse_decision.remediate)" },
    "x.reapply": { headline: "aleyhte karar verildi; yeni bir talep için belirtilen bir yol var", detail: "bu koşullar altında yapılan bir talep, bu kararın devamı değil, yeni bir karardır" },
    "x.final": { headline: "kesin; ileriye dönük bir yol tanımlanmamış", detail: "geçerli politikada veya altta yatan olgularda bir değişiklik, bu vakanın yeniden açılması değil, yeni bir karar vakasıdır" },
    "c.corrected": { headline: "Süreyi ne sonlandırdı?", edges: [{ label: "Düzeltildi", detail: "düzeltme tamamlandı olarak kaydedildi ve karar artık geçerli değil" }, { label: "Düzeltme başarısız oldu", detail: "girişimde bulunuldu ve yetkili şekilde sorunu çözmediği belirlendi" }, { label: "Geri çekildi", detail: "herhangi bir düzeltme yapılmadan önce kararın kendisi geri çekildi veya bozuldu" }] },
    "a.expired": { headline: "Sürenin dolduğunu ve artık neyin geçerli olduğunu bir kez bildirin. Belirtilen bir son tarihin sona ermesi, hiçbir şey söylememenin birinin durumunu ona haber vermeden değiştirdiği tek andır" },
    "a.cleared": { headline: "Kararın çözüldüğünü onaylayın ve artık neyi etkilemediğini belirtin. Düzeltmenin ardından sessiz kalmak, kararın hâlâ geçerli olduğu izlenimini verir ve kişi öyleymiş gibi davranmaya devam eder" },
    "c.residual": { headline: "Düzeltme gerçekleşmediğine göre, geriye kalan bir yol var mı?", edges: [{ label: "İleride bir yol var", detail: "politika, yeni bir talebin hangi koşullarda yapılabileceğini tanımlıyor" }, { label: "Hiçbir şey kalmıyor", detail: "politika buradan sonrası için bir yol tanımlamıyor" }] },
    "x.withdrawn": { headline: "düzeltmeden önce karar geri çekildi", detail: "karar yeniden yürürlüğe konursa, yeni bir olumsuz karar olarak tekrar sürece girer" },
    "x.corrected": { headline: "olumsuz karar, süresi içinde düzeltildi", detail: "aynı kişi hakkında verilecek başka bir karar yeni bir örnektir" },
  },
  },
  "DOC-214": {
  shortName: "Eksik Belge Takibi",
  name: "Belge gerekliliği → hatırlatıldı → tamamlandı ya da bir kişiye aktarıldı",
  purpose: "Yalnızca tarafın sağlayabileceği bir belge, gelene ya da başvurunun kendi son tarihi dolana kadar takip edilir; sonrasında başvuruyu sessizce sona erdirmek yerine bir kişiye aktarılır.",
  nodes: {
    "t.required": { headline: "Belge gerekliliği yalnızca tarafın karşılayabileceği noktaya ulaştı" },
    "a.notify": { headline: "Tam olarak hangi belgelerin eksik olduğunu, nasıl gönderileceğini ve son tarihini belirt" },
    "w.first": { headline: "belge yüklenene ya da ilk hatırlatma penceresi dolana kadar", detail: "Zaman aşımı: İlk hatırlatmadan önceki sınırlı pencere, son tarihe hâlâ rahatça yetişilebilecek kadar kısa. (örnek: 2-3 gün; şunu ayarla: document_requirement.first_reminder)" },
    "c.complete1": { headline: "Gerekli tüm belgeler artık tamamlandı mı?", edges: [{ label: "Tamamlandı", detail: "gerekliliğin adını verdiği her belge alındı" }, { label: "Hâlâ eksik", detail: "en az bir gerekli belge hâlâ alınmadı" }] },
    "a.remind": { headline: "Belgelerin hâlâ eksik olduğunu, yükleme akışına doğrudan bir bağlantıyla ve aynı son tarihle hatırlat" },
    "w.second": { headline: "belge yüklenene ya da ikinci hatırlatma penceresi dolana kadar", detail: "Zaman aşımı: İkinci pencere, sabit bir uzunluk yerine başvurunun kendi son tarihine göre çalışır. (örnek: 3-5 gün, ya da hangisi önce gelirse başvurunun son tarihi; şunu ayarla: document_requirement.second_reminder)" },
    "c.complete2": { headline: "Gerekli tüm belgeler artık tamamlandı mı?", edges: [{ label: "Tamamlandı", detail: "gerekliliğin adını verdiği her belge alındı" }, { label: "Hâlâ eksik", detail: "en az bir gerekli belge hâlâ alınmadı" }] },
    "a.final": { headline: "Eksik belgeler olmadan son tarihin kapanmak üzere olduğunu, hâlâ yardımcı olabilecek destek kanalını belirterek son kez bildir" },
    "h.escalate": { headline: "İnsan katılımlı süreç", detail: "iki hatırlatmanın ardından gereklilik hâlâ karşılanmamışken son tarihe ulaşıldı" },
    "x.complete": { headline: "gerekliliğin adını verdiği her belge alındı; süreç devam ediyor", detail: "aynı sürecin içindeki daha sonraki bir belge gerekliliği kendi örneğini açar" },
  },
  },
  "DOC-215": {
  shortName: "İmza Hatırlatması",
  name: "İmza talebi → imzaları bekle → imzalandı, reddedildi veya süresi doldu",
  purpose: "Gerekli imzaları tek bir tam sürüme karşı toplamak ve hepsinin gerçekten tamamlandığı anı bilmek.",
  nodes: {
    "t.requires": { headline: "Belge imza gerektiriyor" },
    "a.define": { headline: "Gerekli imzalayanları, her birinin ihtiyaç duyduğu imza yetkisini, geçerliyse imzalama sırasını, neyin imzalandığının kapsamını ve tanımlıysa geçerlilik penceresini belirle" },
    "c.window": { headline: "Bir imza geçerlilik penceresi tanımlanmış mı?", edges: [{ label: "Tanımlı", detail: "süreç veya belge, talebin ne kadar süre geçerli kalacağını belirtir" }, { label: "Tanımlı değil", detail: "talep için herhangi bir son tarih belirtilmemiştir" }] },
    "a.bounded": { headline: "Pencereyi tanımlı olarak kaydet, böylece talebin ne zaman geçersiz olacağına kendi şartları karar versin" },
    "a.unbounded": { headline: "Bir son tarih atamak yerine, hiçbir son tarih belirlenmediğini kaydet. Uydurulmuş bir imza son tarihi, kimsenin geri çekmediği bir talebi geçersiz kılar ve imzalayan kişi bunu, imzası reddedildiği anda öğrenir" },
    "a.request": { headline: "İMZA_BEKLENİYOR durumunu kaydet ve talebi, tam belge sürümüne bağlı olarak her gerekli imzalayana ilet. Bir sürüm belirtmeyen imza talebi, sonradan kimsenin tanımlayamayacağı bir şey üzerinde imza toplamış olur" },
    "w.signatures": { headline: "gerekli bir imzalayan imzalayana, bir imzalayan reddedene veya belge sürümünün yerini yenisi alana kadar", detail: "zaman aşımı: Hatırlatma, sonucu hâlâ değiştirebileceği son noktaya yerleştirilir; bu nokta, tanımlıysa talebin kendi geçerlilik süresinden, tanımlı değilse sürecin gözden geçirme noktasından alınır. (örnek: 3 gün-5 gün; yapılandırma: signature.reminder_point)" },
    "c.olay": { headline: "Ne oldu?", edges: [{ label: "Gerekli bir imzalayan doğru sürümü imzaladı", detail: "imza, bu sürecin yönettiği sürüme karşı ve gerekli yetkiye sahip bir imzalayan tarafından atılmıştır" }, { label: "Bir imzalayan reddetti", detail: "gerekli bir imzalayan imzalamayı reddetti" }, { label: "Sürümün yerini yenisi aldı", detail: "bu sürecin bağlı olduğu belge artık güncel sürüm değil" }] },
    "c.reminder-useful": { headline: "Bir hatırlatma hâlâ bir şeyi değiştirir mi?", edges: [{ label: "Değiştirir", detail: "imzalar hâlâ eksik, tam sürüm hâlâ güncel, talep hâlâ geçerli ve bu imzalayana henüz hatırlatma gönderilmemiş" }, { label: "Değiştirmez", detail: "ya hatırlatma zaten gönderilmiş ya da sürüm veya talep artık geçerli değil" }] },
    "a.record-sig": { headline: "İmza kanıtını kaydet - kim, ne zaman, hangi sürümü ve hangi yetkiyle imzaladı. Sürüm, kanıtın çevresindeki bir bağlam değil, kanıtın kendisinin bir parçasıdır" },
    "a.declined": { headline: "REDDEDİLDİ durumunu, imzalayan ve varsa gerekçesiyle birlikte kaydet. Reddetme bir hata değil, bir iş sonucudur; belgeyi gerektiren sürecin kendisi bundan sonra ne olacağına karar verir" },
    "a.superseded": { headline: "İmza sürecini, karşılık geldiği sürüm artık geçerli olmadığı için sonlandır ve bekleyen talepleri engelle. Hâlihazırda toplanan imzalar yeni sürüme taşınmaz - yeni sürüm farklı bir belgedir ve onu imzalamak yeni bir taleptir" },
    "a.remind": { headline: "Yalnızca hâlâ imzalamamış olanlara, kalan eylemi ve gerçek geçerlilik sınırını belirterek hatırlatma gönder. Tek bir hatırlatma yeterlidir; herhangi bir imza, reddetme veya sürüm değişikliği bunu anında geçersiz kılar - ikinci bir hatırlatma, bir talebi baskıya dönüştürür" },
    "w.expiry": { headline: "gerekli bir imzalayan imzalayana, bir imzalayan reddedene veya belge sürümünün yerini yenisi alana kadar", detail: "zaman aşımı: Süreç, tanımlıysa geçerlilik penceresinin sonunda, tanımlı değilse sürecin kendi gözden geçirme noktasında sona erer; hiçbir şey uydurulmaz. (önerilen: tanımlıysa validity_ends_at, aksi halde sürecin kayıtlı gözden geçirme noktası; yapılandırma: signature.validity_window)" },
    "c.complete": { headline: "Gerekli tüm imzalar artık tamamlandı mı?", edges: [{ label: "Tümü tamamlandı", detail: "gerekli tüm imzalayanlar, yönetilen sürümü imzaladı" }, { label: "Bazıları eksik", detail: "en az bir gerekli imza hâlâ bekleniyor" }] },
    "h.declined": { headline: "external:operational-resolution", detail: "gerekli bir imzalayanın reddetmesi" },
    "x.superseded": { headline: "imza süreci sona erdi; sürümünün yerini tamamlanmadan önce yenisi aldı", detail: "yeni sürüm kendi imza sürecini başlatır. Burada toplanan imzalar, karşılık geldikleri sürüme dair kanıt olarak kalır" },
    "a.expired": { headline: "İMZA_SÜRESİ_DOLDU durumunu kaydet. Talebin süresi doldu - kimse reddetmedi ve hiçbir şeye karar verilmedi; bunu bir ret olarak bildirmek, imzalayanın yaptığını yanlış yansıtır" },
    "a.fully-signed": { headline: "Bu sürüme karşı TAMAMEN_İMZALANDI durumunu kaydet. Birden fazla imza gerektiğinde tek bir imza, imzalanmış bir belge anlamına gelmez; ilk imzayla ilerleyen bir süreç, henüz var olmayan bir anlaşmayla ilerliyor demektir" },
    "x.expired": { headline: "İMZA_SÜRESİ_DOLDU; o ana kadar toplanan imzalar kanıt olarak kalır, imza seti eksiktir", detail: "aynı sürüme karşı yeni bir talep, yeni bir süreçtir. Eksik imzaların hâlâ geçerli sayılıp sayılmayacağı varsayılmaz, belgenin kendi kurallarına tabidir" },
    "h.effective": { headline: "İmzalanan belge → tamamlanmayı doğrula → yürürlüğe girme veya bekleyen durum", detail: "gerekli tüm imzaları tamamlanmış bir belge" },
  },
  },
  "DOC-220": {
  shortName: "Belge Çakışması İncelemesi",
  name: "Belge veya kayıt çakışması → yetkili sürümü belirle → mutabakat sağla",
  purpose: "Hangi sürümün fiilen geçerli olduğunu belirlemek ve çakışmayı silmek yerine açıklamak.",
  nodes: {
    "t.inconsistency": { headline: "Belge sürümünde tutarsızlık tespit edildi" },
    "a.collect": { headline: "Belge kimliklerini, sürüm kimliklerini, karma değerleri veya referanslarıyla birlikte içeriği, yayımlanma zamanlarını, imza kanıtlarını, yürürlük tarihlerini, soy zincirini ve her kaydın arkasındaki yetkiyi veya kaynağı topla" },
    "c.identifiable": { headline: "Yetkili sürüm belirlenimci biçimde tanımlanabiliyor mu?", edges: [{ label: "Tanımlanabiliyor", detail: "soy zinciri, yayımlama yetkisi ve yürürlük anlamı birlikte tek bir sürümü işaret ediyor" }, { label: "Tanımlanamıyor", detail: "iki veya daha fazla sürümün eşit derecede geçerlilik iddiası var, ya da soy zinciri kopuk" }] },
    "a.authoritative": { headline: "Hangi sürümün yetkili olduğunu ve nedenini kaydet, çelişen tüm kayıtları da yanında koruyarak. Bu, c.identifiable'ın kendi kriterlerini - soy zinciri, yayımlama yetkisi ve yürürlük anlamı - uygulayan belirlenimci bir çözümleyicidir; bu adımda asla insan takdirine başvurulmaz. Çözümleyicinin zaten tek bir sürümü belirlemiş olması, bu eylemin ulaşılabilir olmasının nedenidir; bunu yapamaması durumunda süreç buraya değil, h.review'daki insan kararına yönlendirilir. Çelişen kanıtlar, durumu sadeleştirmek için silinmez - çünkü bunlar çakışmanın yaşandığına dair tek kanıttır ve sonradan kimin gerçekte neye dayandığını anlamanın tek yoludur" },
    "a.cannot": { headline: "BELGE_MUTABAKATI_GEREKLİ durumunu kaydet ve hiçbir şeyi değiştirme. En yeni dosya otomatik olarak yetkili sürüm değildir - güncellik bir dosya sisteminin özelliğidir, yetki ise bir yayımlamanın özelliğidir; daha yeni olanı seçmek, yerini almış bir taslağın sözleşme hâline gelmesine yol açar" },
    "c.signature": { headline: "Herhangi bir imza, yetkili sürüm dışındaki bir sürüme mi bağlı?", edges: [{ label: "Bir veya daha fazlası öyle", detail: "bir imza, yetkili olmayan bir sürüme karşı atılmış" }, { label: "Hepsi doğru bağlı", detail: "tüm imzalar yetkili sürüme karşı atılmış" }] },
    "h.review": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "yetkili sürümün güvenli biçimde belirlenemediği bir çakışma" },
    "a.sig-invalid": { headline: "İmzayı silmeden, imzanın yetkili sürüme bağlı olmadığını kaydet. İçerikleri ne kadar benzer görünse de, imza yalnızca karşılık geldiği sürüm için geçerli kanıttır, başka hiçbiri için değil" },
    "c.acted": { headline: "Yetkili olmayan bir sürüm dağıtıldı mı veya üzerine işlem yapıldı mı?", edges: [{ label: "Dağıtıldı, işlem yapılmadı", detail: "bir alıcı yanlış sürümü elinde tutuyor ve üzerinde herhangi bir işlem yapmadı" }, { label: "Zaten bir iş eylemi için kullanıldı", detail: "yanlış sürüm üzerinden bir karar verildi, ödeme yapıldı, hak tanındı veya bir işlem gerçekleştirildi" }, { label: "Hiçbiri", detail: "çakışma sistem içinde kaldı, hiçbir şey sistemin dışına çıkmadı" }] },
    "h.resign": { headline: "İmza talebi → imzaları bekle → imzalandı, reddedildi veya süresi doldu", detail: "yetkili sürüm dışındaki bir sürüme bağlı imzalar" },
    "a.correct-distribution": { headline: "Yetkili sürümü, neyin değiştiğini ve hangi sürümün yerini aldığını açıkça belirterek yeniden dağıt. Sessiz bir düzeltme, alıcıyı elinde iki belgeyle ve hangisinin geçerli olduğunu bilmeden bırakır; bu, ilk hatadan daha kötüdür" },
    "a.preserve-history": { headline: "Neyin, hangi sürüm altında yapıldığını koru. Eylem zaten gerçekleşti - bununla ilgili ne yapılacağı, kendi yetkisine sahip ayrı bir sorudur; kaydı doğru sürümü gösterecek şekilde yeniden yazmak, nedeni olmayan bir sonuç bırakır" },
    "x.reconciled": { headline: "yetkili sürüm belirlendi; çelişen kayıtlar korundu ve açıklandı", detail: "bu soy zincirinde ortaya çıkacak yeni bir tutarsızlık, bu mutabakatı kendi kanıtının bir parçası olarak değerlendirecektir - hiçbir şeyin silinmemesinin nedeni budur" },
    "h.remedy": { headline: "Çözüm seçimi → yükümlülüğü sonuçlandır → gerekirse finansal devir", detail: "yetkili olmayan bir belge sürümü üzerinde alınmış bir iş eylemi" },
  },
  },
  "DOC-286": {
  shortName: "Belge Aktivasyonu",
  name: "Belge yürürlüğe girer → hak aktifleşir → ilk kullanım veya atıl kalma",
  purpose: "İmzaladığı şeyin fiilen başladığını ve artık kendisine ne yapma imkânı tanıdığını, imzaladığı anda değil, bunun gerçekten geçerli hâle geldiği anda, hak sahibine bildirmek.",
  nodes: {
    "t.effective": { headline: "Belge yürürlüğe girmiş olarak kaydedildi" },
    "c.usable": { headline: "Bu hak kullanılıyor mu, yoksa sadece elde mi tutuluyor?", edges: [{ label: "Kullanılıyor", detail: "hak, sahibinin gerçekleştirdiği bir eylemle devreye giriyor - bir talep, bir rezervasyon, bir erişim, bir çekim" }, { label: "Elde tutuluyor", detail: "hak, bir şey olmadıkça yapılacak hiçbir eylem gerektirmeyen, kalıcı bir koruma veya izindir" }] },
    "a.in-force-actionable": { headline: "Belgenin ne zamandan itibaren yürürlükte olduğunu belirt ve hakkın artık yapmalarına izin verdiği tek ve ilk şeyi adlandır. İmzalama ile yürürlüğe girme arasındaki boşluk, hak sahiplerinin sessizce 'hiçbir şey olmadı' sonucuna vardığı yerdir" },
    "a.in-force-standing": { headline: "Belgenin yürürlükte olduğunu ve neyi kapsadığını belirt; şimdi yapılacak bir eylem yerine, önemli hâle geleceği anı adlandır. Yalnızca bir şeyler ters gittiğinde geçerli olan bir hak, ihtiyaç duyulana kadar aksi hâlde etkisiz gibi algılanır" },
    "w.first-use": { headline: "tanınan yetkinin ilk kez kullanılmasına, belge sürümünün yerini yenisinin almasına veya yürürlük süresinin sona ermesine kadar", detail: "zaman aşımı: Bu hakkın sahibinin normal şartlarda hakkı kullanmış olacağı süre. (yapılandırma: document_effective.first_use)" },
    "x.standing": { headline: "yürürlükte, hak sahibinin kullanacağı bir şey yok", detail: "yerini alan bir sürüm veya hakka kullanılabilecek bir içerik kazandıran bir değişiklik, yeni bir örnek oluşturur" },
    "c.what-happened": { headline: "Bekleyişi ne sonlandırdı?", edges: [{ label: "Kullanıldı", detail: "hakkın yetkili ilk kullanımı kaydedildi" }, { label: "Önce sona erdi", detail: "belge, herhangi bir kullanım olmadan yerini yenisine bıraktı, iptal edildi veya süresi doldu" }] },
    "c.still-in-force": { headline: "Belge hâlâ geçerli mi?", edges: [{ label: "Hâlâ yürürlükte", detail: "bu, hâlâ yetkili sürümdür ve yürürlük süresi sona ermemiştir" }, { label: "Artık yürürlükte değil", detail: "belgenin yerini yenisi almıştır, iptal edilmiştir veya süresi dolmuştur" }] },
    "x.used": { headline: "hak kullanıldı", detail: "aynı hak sahibi için yürürlüğe giren başka bir belge, kendi başına ayrı bir örnektir" },
    "x.moot": { headline: "yürürlükte kaldı ve hiç kullanılmadan sona erdi", detail: "yerini alan bir sürümün yürürlüğe girmesi, kendi örneğini başlatır" },
    "a.reminder": { headline: "Neyin yürürlükte olduğunu ve aynı tek ilk eylemi belirten bir hatırlatma gönder; belgenin ikinci bir açıklamasını değil. Başka bir hatırlatma gönderilmez - hak, kullanılsın ya da kullanılmasın geçerliliğini korur; peşinden gitmek bir faydayı bir talebe dönüştürür" },
    "w.dormancy": { headline: "tanınan yetkinin ilk kez kullanılmasına kadar", detail: "zaman aşımı: Tek hatırlatmanın ardından örnek, yürürlük süresi sona erene kadar izlemeye devam eder; hiç kullanılmamış bir hak, peşine düşülmeden atıl olarak kaydedilir. (yapılandırma: document_effective.dormancy)" },
    "x.dormant": { headline: "yürürlükte ve atıl", detail: "bir yenileme veya yerini alan bir sürümün yürürlüğe girmesi, yeni bir örnek başlatır" },
  },
  },
  "FBK-41": {
  shortName: "Geri Bildirim Talebi",
  name: "Geri bildirim uygunluğu → sor, engelle veya ertele",
  purpose: "Sormanın gerçekten uygun olup olmadığına karar ver ve sorma ile yanıt alma arasındaki boşluğu gerçek bir durum olarak tut.",
  nodes: {
    "t.moment": { headline: "Olası geri bildirim anı" },
    "c.complete": { headline: "Deneyim, kişi açısından gerçekten tamamlandı mı?", edges: [{ label: "Tamamlandı", detail: "hakkında soru sorulan şey onlar için de bitti, sadece bizim için değil" }, { label: "Henüz değil", detail: "hâlâ devam ediyor - sipariş ulaşmadı, iş bitmedi" }] },
    "w.completion": { headline: "geri bildirimin konusu olacak deneyim tamamlanana kadar", detail: "Zaman aşımı: Bu tür bir deneyimin tamamlanmış olması gereken zaman ufku; bu ufkun ötesinde hâlâ tamamlanmamış bir deneyim hakkında hiçbir zaman soru sorulmaz. (configure feedback_request.completion_horizon)" },
    "x.deferred": { headline: "ertelendi; çözüm, memnuniyetten önce bu süreci sahiplenir", detail: "sorun gerçekten çözüldüğünde bu yeniden uygun hale gelir - sorun hâlâ çözülmemişken nasıl gittiğimizi sormak kendi gecikmemizi ölçmek anlamına gelir ve kayıtsızlık olarak algılanır" },
    "x.never-completed": { headline: "deneyim hiç tamamlanmadı; soru sorulmadı", detail: "daha sonra gerçekleşecek bir tamamlanma yeni bir örnek başlatır" },
    "x.duplicate": { headline: "yinelenen bir talep olarak engellendi", detail: "gerçekten farklı bir deneyim, farklı bir bağlamdır ve kendi koşullarına göre sorulur" },
    "c.appropriate": { headline: "Şimdi sormak uygun mu?", edges: [{ label: "Çözülmemiş sorun açık", detail: "kişinin burada hâlâ açık bir sorunu var - bu, bir talebin kapalı olarak işaretlenmesine değil, kanıta bakılarak değerlendirilir" }, { label: "Zaten soruldu", detail: "yakın zamanlı bir talep veya yanıt aynı deneyimi kapsıyor" }, { label: "Soru bütçesi tükendi", detail: "açık bir sorun yok ve yakın zamanda buna dair bir şey yok, ama bu kişiye yakın zamanda tüm bağlamlarda yeterince soru soruldu" }, { label: "Uygun", detail: "bu bağlamda bekleyen bir sorun yok, yakın zamanda buna dair bir şey yok ve genel soru bütçesinde yer var" }] },
    "c.channel": { headline: "Talebi şu anda hangi rota taşıyabilir?", edges: [{ label: "Oturum açık", detail: "kişi zaten üründe aktif, bu talebi bulunduğu yerde taşıyabilir" }, { label: "Oturum olmadan ulaşılabilir", detail: "oturum açık değil ama push izni açık" }, { label: "Hiçbiri", detail: "ne oturum açık ne de push izni açık" }] },
    "a.request-inapp": { headline: "Bu spesifik deneyim hakkında, kişinin zaten bulunduğu yerde, az önce yaşadığı şeyle ilgili olduğunu anlayacağı şekilde geri bildirim iste" },
    "a.request-push": { headline: "Bu spesifik deneyim hakkında, tek dokunuşla yanıtlanabilecek bir rotayla, kişinin az önce yaşadığı şeyle ilgili olduğunu anlayacağı şekilde geri bildirim iste" },
    "a.request-email": { headline: "Bu spesifik deneyim hakkında, kişinin az önce yaşadığı şeyle ilgili olduğunu anlayacağı şekilde, yanıtlayabileceği bir rotayla geri bildirim iste" },
    "x.not-now": { headline: "ilke olarak uygun, ancak soru sorulmadı", detail: "bu deneyim için varsa bir sonraki an - talep, bütçe açılır açılmaz tetiklenmek üzere kuyruğa alınmaz" },
    "w.response": { headline: "kişi geri bildirim gönderene kadar", detail: "Zaman aşımı: Talep, kişinin kendi zamanında yanıt verebilmesi için yeterince açık kalır ve ardından kapanır. (örnek: 3-7 gün; şunu ayarla: feedback_request.response_window)" },
    "c.response": { headline: "Geri bildirim geldi mi?", edges: [{ label: "Geldi", detail: "bu bağlam için geri bildirim herhangi bir rotadan ulaştı" }, { label: "Yanıt yok", detail: "henüz bir şey gelmedi" }] },
    "a.remind": { headline: "Aynı talep için son bir hatırlatma gönder; mesajı ilkinden farklılaştır ve mümkünse farklı bir rota kullan" },
    "w.response2": { headline: "kişi geri bildirim gönderene kadar", detail: "Zaman aşımı: bu deneyim için izin verilen tek hatırlatma penceresi, ilk talepten daha kısa çünkü talep zaten bir kez yapıldı. (örnek: 3-5 gün; şunu ayarla: feedback_request.reminder_window)" },
    "c.response2": { headline: "Geri bildirim geldi mi?", edges: [{ label: "Geldi", detail: "bu bağlam için geri bildirim herhangi bir rotadan ulaştı" }, { label: "Hâlâ yok", detail: "hatırlatmadan sonra da hiçbir şey gelmedi" }] },
    "x.received": { headline: "geri bildirim alındı; ne anlama geldiğini FBK-43 belirler", detail: "bu sürecin görevi talep aşamasında sona erdi; gelen yanıtın kendi yaşam döngüsü var" },
    "x.no-response": { headline: "soruldu, bir kez hatırlatıldı, yanıt gelmedi", detail: "gelecekteki bir deneyim hakkında yeniden soru sorulabilir; burada hiçbir şey sinyal olarak kaydedilmez, çünkü sessizlik memnuniyetsizlik değildir ve sonraki hiçbir süreç bunu öyleymiş gibi okuyamaz" },
  },
  },
  "FBK-42": {
  shortName: "Savunuculuk Talebi",
  name: "Savunuculuk uygunluğu → sor, ertele veya engelle",
  purpose: "Birinden bizim için kefil olmasını yalnızca ilişki bunu gerçekten hak ettiğinde iste ve kamuya açık şekilde yeniden kullanımı ayrı bir izin olarak tut.",
  nodes: {
    "t.opportunity": { headline: "Olası savunuculuk fırsatı" },
    "c.negative": { headline: "Bu ilişkide herhangi bir yerde açık bir olumsuz sorun var mı?", edges: [{ label: "Açık bir sorun var", detail: "çözülmemiş bir şikayet, sorun veya anlaşmazlık mevcut" }, { label: "Açık sorun yok", detail: "bekleyen bir olumsuz durum yok" }] },
    "x.suppressed": { headline: "bir şey çözülmemişken engellendi", detail: "çözüm bunu yeniden uygun hale getirir - ve ardından kalıcı olan bir iyileştirme, kendi başına güçlü bir kanıttır, dolayısıyla beklenen süre boşa gitmez" },
    "a.evaluate": { headline: "Birikmiş olumlu kanıtları değerlendir: gerçekten elde edilen sonuçlar, tekrar tekrar gerçekleşen değer, olumlu geri bildirimler, anlamlı bir süreklilik, ardından kalıcı olan bir iyileştirme, istenmeden sunulan katkılar. Önemli olan bu bütündür, içindeki en son öğe değil" },
    "c.sufficient": { headline: "Kanıt, soru sormayı haklı çıkaracak kadar yeterli mi?", edges: [{ label: "Yeterli", detail: "ilişki, bir talebi taşıyacak kadar yeterli ve bağımsız olumlu kanıt taşıyor" }, { label: "Henüz değil", detail: "kanıt gerçek ama zayıf - iyi bir deneyim henüz bir ilişki değildir" }] },
    "c.type": { headline: "Bu kanıt ne büyüklükte bir talebi destekler?", edges: [{ label: "Düşük taahhüt", detail: "bir puanlama veya bir yorum - birkaç dakika, kendi sözleri, nerede paylaşacaklarını kendileri seçer" }, { label: "Yüksek taahhüt", detail: "bir referans yazısı, bir vaka analizi, bir referans görüşmesi - kendi adları ve itibarları bizimkiyle ilişkilendirilir ve genellikle yeniden kullanılabilir" }] },
    "x.delay": { headline: "henüz uygun değil; kanıt birikebilir", detail: "ek olumlu kanıt, hiçbir şeyin geri alınmasına gerek kalmadan bunu yeniden açar" },
    "a.ask-light": { headline: "Küçük talebi bir kez yap, ardında bir takip dizisi olmadan. Bir puanlama veya tek dokunuşluk bir yanıt, kişinin zaten bulunduğu her yere gönderilebilir - buna izin bulunan durumlarda kesintiye uğratıcı bir kanal da dahildir" },
    "a.ask-heavy": { headline: "Kapsamlı talebi kalıcı, gözden geçirilebilir bir kanalda yap; neyin, nerede kullanılacağını açıkça belirt ve katkıda bulunmayı kabul etmenin, yayınlanmasını kabul etmekten ayrı bir şey olduğunu söyle - çünkü öyledir, ve bunu sonradan öğrenmek, bir destekçinin nasıl şikayetçiye dönüştüğünün ta kendisidir. Birinin adını ve itibarını kuruluşla ilişkilendiren bir talep, hızlıca geçiştirilecek bir kesinti değildir; iki kez okuyabilecekleri bir yere ihtiyaç duyar" },
    "w.response": { headline: "istenen savunuculuk eylemi tamamlandı olarak kaydedilene ya da kişi talebi reddedene kadar", detail: "Zaman aşımı: Sınırlı bir yanıt penceresi. (configure advocacy_eligibility.response)" },
    "c.outcome": { headline: "Ne geri döndü?", edges: [{ label: "Katkıda bulundu, kamuya açık kullanım için", detail: "yayınlamayı, alıntılamayı veya referans göstermeyi düşündüğümüz bir şey sağladılar" }, { label: "Katkıda bulundu, kamuya açık kullanım yok", detail: "iç kullanımda kalacak bir şey sağladılar" }, { label: "Reddetti", detail: "hayır dediler" }] },
    "x.no-response": { headline: "yanıt yok; hiçbir çıkarım yapılmadı", detail: "bir ricaya karşı sessizlik ne bir reddir ne de ilişki hakkında bir sinyal - bu sadece bir yanıt olmamasıdır" },
    "h.permission": { headline: "İzin alma → kapsamı doğrula → etkinleştir veya reddet", detail: "birinin katkıda bulunduğu bir şeyi kamuya açık şekilde yeniden kullanma niyeti" },
    "x.contributed": { headline: "iç kullanım için katkıda bulundu", detail: "bunu daha sonra yayınlama niyeti, bu sürecin bir uzantısı değil, yeni bir izin sorusudur" },
    "x.declined": { headline: "reddedildi; bekleme süresi yürürlükte", detail: "bekleme süresinden sonra önemli ölçüde daha güçlü bir kanıt, farklı bir talebi haklı çıkarabilir; aynı talep tekrarlanmaz" },
  },
  },
  "FBK-43": {
  shortName: "Geri Bildirim Takibi",
  name: "Geri bildirim alındı → sınıflandır → yönlendir → süreci kapat",
  purpose: "Geri bildirimi, üzerinde işlem yapabilecek sürece ulaştır ve karşılığında söz verilen her şey gerçekleşene kadar kaydı açık tut.",
  nodes: {
    "t.received": { headline: "Geri bildirim alındı" },
    "a.persist": { headline: "Kaydı kimliği, kaynağı, ilgili varlığı, zaman damgası ve kişinin kendisinin seçtiği duygu durumu veya kategori ile birlikte, gerçekte yazdıklarıyla birlikte ve birebir korunmuş şekilde kalıcı hale getir. Bundan sonraki her şey bizim yorumumuzdur ve kişinin sözlerinin üzerine değil, yanına kaydedilir" },
    "a.classify": { headline: "Operasyonel anlamı kendi alanında PRAISE, PRODUCT_FEEDBACK, SERVICE_ISSUE, SUPPORT_NEED, COMPLAINT, GENERAL_COMMENT veya UNKNOWN olarak sınıflandır. Bir sınıflandırma bir yönlendirme kararıdır, neyin yanlış gittiğine dair bir bulgu değildir" },
    "c.route": { headline: "Bu, operasyonel olarak ne anlama geliyor?", edges: [{ label: "Övgü", detail: "olumlu, arkasında somut bir gerekçe var" }, { label: "Hizmet sorunu veya şikayet", detail: "bir şey yanlış gitti, ya da yanlış gittiği iddia ediliyor" }, { label: "Yardım talebi", detail: "bir arıza bildirmek yerine bir konuda yardıma ihtiyaçları var" }, { label: "Ürün geri bildirimi", detail: "bu kişiye karşı herhangi bir yükümlülük doğurmayan, ürünle ilgili bir gözlem" }, { label: "Genel yorum", detail: "saklanmaya değer, yapılacak bir şey yok" }, { label: "Anlamı belirsiz", detail: "anlam, yönlendirme yapılabilecek kadar güvenilir şekilde belirlenemiyor" }] },
    "a.persist-positive": { headline: "Bunu tarihli, kapsamı belirli, olumlu bir ilişki kanıtı parçası olarak kaydet. Bir etiket değil, bir durum değil, bir savunucu işareti değil - bir ana dair bir gerçek" },
    "c.existing": { headline: "Açık bir sorun veya vaka bunu zaten kapsıyor mu?", edges: [{ label: "Zaten açık", detail: "aynı deneyim veya varlıkla ilgili açık bir sorun, anlattıklarıyla eşleşiyor" }, { label: "Açık bir şey yok", detail: "eşleşen açık bir sorun yok" }] },
    "a.obligation": { headline: "Sahip süreçte iş kalemini, iki kaydın bağlantılı kalması için geri bildirim kayıt kimliğiyle oluştur. Bu noktadan itibaren sorunun kendi yaşam döngüsünü ve sahibi vardır; kayıt bağımsız olarak açık kalır çünkü sorunun kapanması ile kişiye geri dönüş yapılması iki farklı olay'tir. Talep sahibi burada değil, support_request_received üzerine REM-305 tarafından bilgilendirilir" },
    "a.product": { headline: "Bunu kanıt olarak ürün girdisine ilet. Karşılığında bu kişiye hiçbir şey borçlu değiliz ve kendilerine hiçbir söz verilmez" },
    "c.acknowledge": { headline: "Bir teyit uygun mu?", edges: [{ label: "Teyit edilmeye değer", detail: "bize doğrudan hitap ettiler ve bir yanıt bekliyor olabilirler" }, { label: "Gerekli değil", detail: "bir teyit gürültüden başka bir şey olmaz" }] },
    "h.triage": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "güvenilir şekilde sınıflandırılamayan geri bildirim" },
    "c.recognition": { headline: "Bir takdir uygun mu?", edges: [{ label: "Teyit edilmeye değer", detail: "bir kişinin yanıt verebileceği somut bir şey söylediler" }, { label: "Gerekli değil", detail: "bir teyit gürültüden başka bir şey olmaz" }] },
    "a.attach": { headline: "Geri bildirimi ek bağlam olarak mevcut vakaya ekle. İkinci bir vaka oluşturulmaz ve paralel bir iyileştirme süreci açılmaz" },
    "a.assess": { headline: "Anlattıklarının, üzerinde işlem yapılabilir operasyonel bir sorun mu, yoksa karşılayamadığımız bir deneyim mi olduğunu belirle. İkisi de gerçektir; ama sadece biri bir yükümlülük doğurur ve yönlendirilecek bir yer bulmak için yükümlülük uydurmak, bu adımın önlemeye çalıştığı hatadır" },
    "w.outcome": { headline: "operasyonel sonuç iş kalemine karşı kaydedilene kadar", detail: "Zaman aşımı: Bekleme süresi, iş kalemi için sahip sürecin kendi SLA'sıdır; bu süreç sahibi olmadığı bir iş için asla bir son tarih uydurmaz. (configure feedback.obligation_sla)" },
    "c.promise": { headline: "Kişiye bir geri dönüş sözü verildi mi?", edges: [{ label: "Söz verildi", detail: "kendilerine geri dönüş yapılacağı söylendi" }, { label: "Söz verilmedi", detail: "kendilerine hiçbir taahhütte bulunulmadı" }] },
    "a.acknowledge": { headline: "Bir kişinin bunu gerçekten okuduğu belli olacak kadar spesifik şekilde teyit et" },
    "x.stored": { headline: "kaydedildi; borçlu olunan bir şey yok", detail: "kayıt, ilişki kanıtına katkıda bulunur ve başka bir şeye ihtiyaç duymaz" },
    "a.acknowledge-positive": { headline: "Söyledikleri spesifik şeyi teyit et. Bir övgüye karşılık gönderilen kalıp bir teşekkür, sessizlikten daha kötüdür, çünkü kimsenin okumadığını kanıtlar" },
    "c.contribution": { headline: "Yeniden kullanılabilir bir şey mi sundular - yazılı bir yorum, bir alıntı, bir hikaye?", edges: [{ label: "Bir şey sundu", detail: "sorumuza verdikleri yanıtın ötesinde bir içerik sağladılar" }, { label: "Sadece geri bildirim", detail: "sadece yanıt verdiler, başka bir şey yok" }] },
    "x.attached": { headline: "mevcut vakaya eklendi", detail: "sonucu vakanın kendi yaşam döngüsünü belirler; geri bildirim kaydı kanıt olarak kalır" },
    "c.actionable": { headline: "Üzerinde işlem yapılabilir operasyonel bir sorun var mı?", edges: [{ label: "İşlem yapılabilir", detail: "düzeltilebilecek somut bir şey var ve bunu düzeltmek bize düşer" }, { label: "İşlem yapılamaz", detail: "karşılayamadığımız bir deneyim, düzeltilecek operasyonel bir şey yok" }] },
    "x.open": { headline: "yükümlülük devam ediyor; süreç kapanmadı", detail: "sonucun daha sonra gelmesi, süreci kapatmak üzere bunu yeniden açar; yükseltmeyi sorunun kendi süreci yönetir ve burada hiçbir şey kaydın tamamlandığı izlenimini vermez" },
    "w.followup": { headline: "söz verilen geri dönüş yapılana kadar", detail: "Zaman aşımı: Söz verilen bir geri dönüş, yalnızca bu sözün kişi için hâlâ bir anlam taşıdığı süre boyunca beklenir; bu sürenin ötesinde bu, tutulmamış bir söz haline gelir ve öyle olarak yükseltilir. Söz, kendi tarihini taşır. (configure feedback.promise_window)" },
    "x.closed": { headline: "süreç kapatıldı", detail: "aynı deneyimle ilgili yeni bir geri bildirim kendi kaydını açar" },
    "h.contribution": { headline: "external:advocacy-contribution", detail: "gönüllü olarak sunulan, yeniden kullanılabilir bir katkı" },
    "c.eligible": { headline: "İlişki artık savunuculuk uygunluğunu karşılıyor mu?", edges: [{ label: "Uygun", detail: "bu kanıt, önceden var olanlarla birlikte, bir talepte bulunmayı haklı çıkaracak kadar yeterli" }, { label: "Uygun değil", detail: "bu tek başına iyi bir sinyal ve ilişki daha fazlasını biriktirmedi" }] },
    "c.severity": { headline: "Yükseltme kriterleri geçerli mi?", edges: [{ label: "Ciddi", detail: "politika, bunu ciddiyet, zarar veya ilgili taraflar açısından yükseltme gerektiren bir durum olarak tanımlıyor" }, { label: "Sıradan", detail: "işlem yapılabilir, normal seviyede" }] },
    "a.acknowledge-negative": { headline: "Söylediklerini teyit et ve ilişki kanıtı olarak kaydet. Ortada bir kusur uydurulmaz, düzeltilecek bir şey olmamasının yerine tazminat sunulmaz" },
    "h.promise": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "gerçekleşmeyen, söz verilmiş bir geri dönüş" },
    "h.advocacy": { headline: "Savunuculuk uygunluğu → sor, ertele veya engelle", detail: "savunuculuk eşiğine ulaşan olumlu kanıt" },
    "x.evidence": { headline: "kanıt olarak kaydedildi; savunucu durumu oluşturulmadı", detail: "ek olumlu geri bildirim kendi kaydını açar ve kanıtı yeniden değerlendirir" },
    "a.escalate": { headline: "Politika yükseltmesini uygula ve sorun üzerinde ciddiyet düzeyini işaretle, böylece devraldığı sahiplik ve SLA varsayılan değil, yükseltilmiş olanlar olsun" },
    "h.issue": { headline: "Şikayet veya sorun oluşturuldu → sahiplik → çözüm → onay", detail: "geri bildirimden doğan, işlem yapılabilir bir sorun" },
    "x.acknowledged": { headline: "dinlendi, düzeltilecek bir şey yok", detail: "aynı deneyimle ilgili yeni bir geri bildirim kendi kaydını açar" },
  },
  },
  "FBK-46": {
  shortName: "Şikayet Çözümü",
  name: "Şikayet veya sorun oluşturuldu → sahiplik → çözüm → onay",
  purpose: "İşlem yapılabilir bir sorunu, hem düzeltme hem de kapanış koşulu sağlanana kadar, adı belirli bir sahibi olan açık bir yükümlülük olarak tut.",
  nodes: {
    "t.created": { headline: "İşlem yapılabilir sorun oluşturuldu" },
    "a.capture": { headline: "Sorun türünü, ciddiyet düzeyini, ilgili varlığı, SLA'yı ve kaynağı kaydet. Aynı temel soruna ait kopyalar iki kez işlenmek yerine burada birleştirilir" },
    "c.owner": { headline: "Doğru sahip biliniyor mu?", edges: [{ label: "Biliniyor", detail: "sorun türü ve varlık, sahibinin kim olduğunu belirliyor" }, { label: "Bilinmiyor", detail: "sorunun kendisinden bir sahip belirlenemiyor" }] },
    "a.assign": { headline: "Sahibi ata ve atamayı eklenmiş şekilde kaydet - bir sorunu kimin ne zaman elinde tuttuğu, çözüm geçmişinin bir parçasıdır" },
    "h.orphan": { headline: "İş oluşturuldu → yönlendirme → atama", detail: "sahibi belirlenemeyen bir sorun" },
    "w.resolution": { headline: "sorunun operasyonel düzeltmesi tamamlandı olarak kaydedilene kadar", detail: "Zaman aşımı: Bekleme süresi, bu ciddiyet düzeyi için SLA eşiğidir; kaçırılması bir seviye yükseltmeye yol açar, asla müşteriye yansımaz. (configure complaint.sla_threshold)" },
    "c.confirmation": { headline: "Kapanış, kişinin onayını gerektiriyor mu?", edges: [{ label: "Onay gerekli", detail: "düzeltme yalnızca onların tarafından doğrulanabiliyor, ya da politika onayını gerektiriyor" }, { label: "Gerekli değil", detail: "düzeltme operasyonel olarak doğrulanabiliyor ve politika bu şekilde kapanışa izin veriyor" }] },
    "a.escalate": { headline: "Bir seviye yükselt: bildirim gönder, ardından ekibi veya yöneticiyi dahil et, ardından öncelikli bir kuyruğa yeniden ata. Bu nedenle müşteriye yönelik hiçbir şey gönderilmez - iç gecikme bizim sorunumuzdur, onlar için yeni bir bilgi değildir" },
    "c.confirm-route": { headline: "Onlara sormak için izin verilmiş bir kanal var mı?", edges: [{ label: "Bir kanal var", detail: "bu kişi için sorun yazışması amacıyla izin verilmiş, ulaşılabilir bir hedef mevcut" }, { label: "Kanal yok", detail: "izin verilmiş bir hedef mevcut değil, ya da bildirimi yapan kişiye bunların hiçbirinden ulaşılamıyor" }] },
    "a.close": { headline: "Sorunu kapat, tüm çözüm geçmişini koruyarak: neyin yanlış olduğu, kimin sahiplendiği, ne yapıldığı, ne zaman yapıldığı ve kişinin bunu onayladığı" },
    "c.levels": { headline: "Yükseltme seviyeleri tükendi mi?", edges: [{ label: "Seviye kaldı", detail: "başka bir yükseltme seviyesi mevcut" }, { label: "Tükendi", detail: "tüm basamaklar denendi ve sorun hâlâ açık" }] },
    "a.request-confirmation": { headline: "Bildirdikleri spesifik sorunun, gerçekte yapılan düzeltmeye göre şimdi çözülüp çözülmediğini sor. Kimseden istenmemiş bir onayı beklemek, bir onay durumu değildir; bu, onay kılığına girmiş bir zaman aşımıdır" },
    "a.close-unconfirmed": { headline: "Sınırlı kapanış kuralı kapsamında kapat; düzeltmenin tamamlandığını ve kişinin hiçbir zaman onaylamadığını açıkça kaydet. Onaylanmış ve onaylanmamış kapanışlar farklı gerçeklerdir ve asla aynı şekilde yazılmaz - ve kapanışın, bildirimi yapan kişiye izin verilmiş bir kanal olmadığı için onaylanmamış olduğu durumlarda, bu neden sessizlik olarak değil, kendisi olarak kaydedilir" },
    "x.closed": { headline: "çözüldü ve onaylandı", detail: "aynı sorunun tekrar ortaya çıkması, bu sorunu yeniden açmak yerine ona bağlı yeni bir sorun olarak ele alınır" },
    "h.escalate": { headline: "external:human-in-the-loop-yaşam döngüsü", detail: "yükseltme basamaklarını aşan bir sorun" },
    "w.confirm": { headline: "kişi sorunun çözüldüğünü onaylayana ya da sorunun çözülmediğini söyleyene kadar", detail: "Zaman aşımı: Kişiye onaylaması için sınırlı bir süre tanınır; bu sürenin ötesinde sorun, çözüldü olarak değil, hiç onaylanmadı olarak kaydedilerek sınırlı kapanış kuralı kapsamında kapatılır. (örnek: 5-10 gün; configure complaint.closure_window)" },
    "x.closed-unconfirmed": { headline: "operasyonel olarak düzeltildi, hiç onaylanmadı", detail: "aynı sorunla ilgili daha sonraki her temas, bunun hiç doğrulanmadığını bilerek başlar; ayrımın kaydedilmesinin nedeni de budur" },
    "c.confirmed": { headline: "Ne dediler?", edges: [{ label: "Çözüldü", detail: "düzeltmenin işe yaradığını onayladılar" }, { label: "Hâlâ düzelmedi", detail: "sorunun devam ettiğini söylüyorlar - iç görev tamamlandı ama onların sorunu tamamlanmadı" }] },
  },
  },
  "FBK-47": {
  shortName: "İtiraz İncelemesi",
  name: "İtiraz veya anlaşmazlık → kanıt incelemesi → onayla, iptal et veya değiştir",
  purpose: "Zaten alınmış bir kararı, inceleme sürerken silmeden gözden geçir.",
  nodes: {
    "t.appeal": { headline: "İtiraz veya anlaşmazlık sunuldu" },
    "a.link": { headline: "İtirazı orijinal karara bağla ve nedeni, sunulan kanıtı, ne zaman geldiğini ve varsa son tarihi kaydet. Orijinal karar, kendisine karşı bir itiraz var diye değiştirilmez" },
    "c.eligible": { headline: "İtiraz, incelemeye uygun mu?", edges: [{ label: "Uygun", detail: "incelenebilir bir kararı, geçerli süre içinde ve buna hakkı olan biri tarafından itiraz ediyor" }, { label: "Uygun değil", detail: "süresi geçmiş, incelenebilir bir karar değil, ya da bunu yapmaya yetkisi olmayan biri tarafından yapılmış" }] },
    "c.hold": { headline: "Politika, inceleme sürerken orijinal kararın askıya alınmasını gerektiriyor mu?", edges: [{ label: "Askıya alma gerekli", detail: "politika, inceleme sonuçlanana kadar kararın etkisini askıya alıyor" }, { label: "Askıya alma yok", detail: "karar, inceleme sırasında yürürlükte kalır - bu varsayılan durumdur" }] },
    "a.reject": { headline: "İtirazı gerçek nedeniyle ve geçerli olan süreçle birlikte reddet. Nedenini açıklamayan bir ret, bir sonraki şikayeti doğuran şeydir" },
    "a.hold": { headline: "Kararın etkisini askıya al ve bunu bir iptal olarak değil, bir askıya alma olarak kaydet. Askıya alınmış ve iptal edilmiş farklı durumlardır; birini diğeri gibi yazmak, incelemenin sonucunu önceden belirlemek olur" },
    "w.review": { headline: "inceleme bir sonuca ulaşana kadar", detail: "Zaman aşımı: İnceleme son tarihi. (configure appeal_and.review)" },
    "x.rejected": { headline: "itiraz uygun değil; orijinal karar değişmedi", detail: "farklı bir gerekçeye dayanan bir itiraz veya yeni bir kanıt, kendi koşullarına göre değerlendirilir" },
    "c.outcome": { headline: "İnceleme neye vardı?", edges: [{ label: "ONAYLANDI", detail: "orijinal karar geçerliliğini koruyor" }, { label: "GERİ ÇEVRİLDİ", detail: "orijinal karar yanlıştı" }, { label: "DEĞİŞTİRİLDİ", detail: "karar kısmen geçerliliğini koruyor" }, { label: "DAHA FAZLA BİLGİ GEREKİYOR", detail: "inceleme, elindeki bilgiyle bir sonuca varamıyor" }] },
    "h.deadline": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "sonuçlanmadan geçen bir inceleme son tarihi" },
    "a.apply": { headline: "Geçerli iş durumunu sonuca uyacak şekilde güncelle - onaylanması kararı geçerli bırakır, iptal edilmesi etkisini ortadan kaldırır, değiştirilmesi ise kısmen yerine geçer. Her durumda orijinal karar, itiraz ve inceleme sonucu okunabilir halde kalır; hiçbir şey yerinde düzenlenmez, çünkü neyin karar verildiğinin ve sonra değiştirildiğinin kaydı, bir itiraz sürecinin var olma amacının ta kendisidir" },
    "a.request-more-info": { headline: "İtiraz edenden, incelemede eksik olan spesifik kanıtı iste; sadece neyin eksik olduğunu belirt ve itiraz son tarihini olduğu yerde bırak. Kimsenin talep etmediği bir bilgi için incelemeyi askıya almak, itiraz edeni kendisine hiç bildirilmemiş bir eksiklikten sorumlu tutmak olur" },
    "a.communicate-outcome": { headline: "İncelemenin sonucunu, bunun sonucunda hangi durumun artık geçerli olduğunu ve usul açısından hâlâ neyin mümkün olduğunu belirt. Sessizlikle sonuçlanan bir itiraz, itiraz edeni elinde orijinal kararla ve yeniden değerlendirildiğini bilmesinin hiçbir yolu olmadan bırakır" },
    "w.more-info": { headline: "istenen bilgi alınana kadar", detail: "Zaman aşımı: İstenen bilgi, yalnızca itirazın kendi son tarihine kadar beklenir; son tarih bu talep nedeniyle asla ertelenmez. (configure appeal_and.more_info)" },
    "x.concluded": { headline: "inceleme sonuçlandı; hem orijinal karar hem de sonuç korundu", detail: "sürecin izin verdiği durumlarda yapılacak yeni bir itiraz, orijinal kararı değil, bu sonucu itiraz konusu yapar" },
  },
  },
  "FBK-48": {
  shortName: "Beyan Edilen Bağlamın Yeniden Hesaplanması",
  name: "Beyan edilen ihtiyaç veya tercih sinyali → kalıcı hale getir → ilgili deneyimi yeniden hesapla",
  purpose: "Bir kişinin durumu hakkında bize söylediği bir şeyin, yalnızca buna gerçekten bağlı olan kararlara ulaşmasını sağla, başka hiçbir şeye değil.",
  nodes: {
    "t.declared": { headline: "İlgili bağlam açıkça beyan edildi" },
    "a.persist": { headline: "Değeri kaynağıyla, zamanla ve geçerli olduğu kapsamla birlikte, beyan edilen yanıtların tutulduğu depoda kalıcı hale getir. Buraya asla bir çıkarım yazılmaz ve mevcut olanın üzerine asla yazılmaz - bu, hem ACT-19'un hem de CON-32'nin bağlı olduğu aynı ayrımdır" },
    "c.volatility": { headline: "Bu özellik durağan mı, değişken mi?", edges: [{ label: "Durağan", detail: "genellikle değişmeyen bir şeyi tanımlıyor - bir rol, bir sektör, yapısal bir kısıt" }, { label: "Değişken", detail: "güncel bir durumu tanımlıyor - bir proje, bir sezon, geçici bir hedef" }] },
    "a.stable": { headline: "Bunu uzun bir geçerlilik süresiyle ve planlanmış bir yeniden doğrulama olmadan kaydet" },
    "a.volatile": { headline: "Bir geçerlilik süresi veya bir yeniden doğrulama koşulu ekle. Bir çeyrek için belirtilen bir ihtiyacın iki yıl sonra hâlâ kararları yönlendirmesi, hiç sorulmamış olmasından daha kötüdür, çünkü bu, kişinin gerçekten söylediği bir şeyin otoritesiyle yanlış olmaktır" },
    "a.consumers": { headline: "Kararları gerçekten bu özelliğe bağlı olan aktif ve gelecekteki süreçleri belirle - buna referans verebilecek her şeyi değil, yalnızca bu yüzden farklı karar verecek olanları" },
    "c.affected": { headline: "Şu anda çalışan herhangi bir şey önemli ölçüde etkileniyor mu?", edges: [{ label: "Etkilendi", detail: "canlı bir süreç, bunu bilerek farklı bir karar verir" }, { label: "Etkilenen yok", detail: "daha sonra neyi etkileyebileceğine bakılmaksızın, şu anda çalışan hiçbir şey buna bağlı değil" }] },
    "a.adapt": { headline: "Bu süreçlerin gelecekteki eylemlerini uyarlar. Zaten gönderilmiş mesajlar yeniden ele alınmaz" },
    "x.stored": { headline: "kaydedildi; hiçbir orkestrasyon tetiklenmedi", detail: "buna bağlı olan gelecekteki bir karar, o zaman bunu okur - bugün hiçbir şeyi değiştirmeyen bir özellik, yine de saklanmaya değer" },
    "x.applied": { headline: "beyan edilen bağlam kaydedildi ve bir kararı değiştirdiği yerlerde uygulandı", detail: "aynı özelliğin değişmesi veya yeniden doğrulanması yeni bir örnek açar" },
  },
  },
  "FBK-49": {
  shortName: "Eksik Bilgi Hatırlatması",
  name: "Eksik kritik veri → talep et veya çöz → devam ettir",
  purpose: "Gerçekten engelleyici bir veri eksikliğini, adı belirli bir bağımlılık olarak ele al ve bunu biri hakkında daha fazla bilgi edinme isteğinden ayrı tut.",
  nodes: {
    "t.blocked": { headline: "Gerekli veri eksik ve süreci engelliyor" },
    "a.identify": { headline: "Eksik olan tam öğeyi ve engellediği adı belirli süreci tespit et. Neyi engelden kurtardığını söyleyemeyen bir talep, engelleyici kılığına girmiş kademeli profillemedir ve bu ikisi birbirine karıştırılmamalıdır" },
    "c.authoritative": { headline: "Yetkili bir kaynak bunu kimseye sormadan sağlayabilir mi?", edges: [{ label: "Zaten elimizde var", detail: "yetkili bir sistem bunu tutuyor, ya da elimizdeki verilerden türetilebilir veya uzlaştırılabilir" }, { label: "Sağlanması gerekiyor", detail: "hiçbir sistem bunu tutmuyor ve birinin sağlaması gerekiyor" }] },
    "a.retrieve": { headline: "Bunu al ve uzlaştır. Zaten yetkili şekilde elimizde tuttuğumuz bir şeyi birinden istemek, kendi kayıtlarımızı bilmediğimizi göstermenin en hızlı yoludur" },
    "c.provider": { headline: "Eksik öğeyi gerçekte kim sağlayabilir?", edges: [{ label: "Müşteri veya hesap sahibi", detail: "bunu yalnızca kaydın ait olduğu kişi tutuyor, ya da politika bunu doğrudan onlardan istemeyi gerektiriyor" }, { label: "Kuruluş içinden biri", detail: "iç bir sahip, ekip veya operatör bunu tutuyor, ya da bunu üretmeye yetkili olan taraf bu" }] },
    "c.valid": { headline: "Elimizde şimdi olan geçerli mi?", edges: [{ label: "Geçerli", detail: "gereksinimi karşılıyor" }, { label: "Geçersiz veya eksik", detail: "gelen şey gereksinimi karşılamıyor" }] },
    "a.request": { headline: "Bunu, kaydın ait olduğu kişiden, neyi engelden kurtaracağını belirterek talep et; böylece talep sadece alınan değil, yanıtlanabilir bir talep olur" },
    "a.reject": { headline: "Gönderdikleri şeyde neyin yanlış olduğunu söyle ve aynı öğeyi, aynı konuşmayı, aynı rotada yeniden talep et. Bir belge gönderip hiçbir şey duymamak, yeniden sorulmaktan daha kötüdür, çünkü reddedildiğini anlamanın hiçbir yolu yoktur" },
    "a.request-internal": { headline: "Talebi, öğeyi elinde tutan iç tarafa karşı sahipli bir iş olarak, engellenen süreci ve işleyen son tarihi taşıyacak şekilde oluştur. İç bir bağımlılığı müşteri kanalından yönlendirmek, hiç kabul etmedikleri bir kanalda yanlış kişiye soru sormak olur" },
    "a.persist": { headline: "Bunu kalıcı hale getir ve engellenen süreci yeniden değerlendir; süreç, kendisine söylendiği için değil, bağımlılığı karşılandığı için devam eder" },
    "c.criticality": { headline: "Engellenen sürecin ne kadar kritik olduğu düşünüldüğünde, şimdi ne olacak?", edges: [{ label: "Bir kişiyi gerektirecek kadar kritik", detail: "süreç, birinin bunun çözülmesini sahiplenmesini gerektirecek kadar önemli" }, { label: "Alternatif bir yol var", detail: "süreç, bu öğeyi gerektirmeyen bir yol üzerinden devam edebilir" }, { label: "Devam ettirmeye değmez", detail: "engellenen süreç zarar vermeden beklenebilir veya bırakılabilir" }] },
    "w.received": { headline: "istenen bilgi ulaşana, bağımlılık başka bir yoldan çözülene ya da engellenen süreç iptal edilene kadar", detail: "Zaman aşımı: Talep, engellenen sürecin kaldırabileceği kadar süre boyunca beklenir; ardından kritiklik düzeyi bir kişi, alternatif bir yol veya vazgeçme arasında karar verir. (configure missing_critical.received)" },
    "x.resumed": { headline: "gereksinim karşılandı; engellenen süreç devam etmekte serbest", detail: "ek bir eksik gereksinim, kendi örneğine sahip ayrı bir bağımlılıktır" },
    "h.escalate": { headline: "external:human-in-the-loop-yaşam döngüsü", detail: "talep etmenin çözemediği kritik bir bağımlılık" },
    "x.alternate": { headline: "engellenen süreç, buna ihtiyaç duymayan bir yol üzerinden devam ediyor", detail: "alternatif yol daha sonra ne olursa olsun buna ihtiyaç duyarsa, bu yeni bir bağımlılıktır" },
    "x.abandoned": { headline: "gereksinim karşılanmadı; engellenen süreç engelli kalır ve bunu belirtir", detail: "öğenin daha sonra gelmesi bunu normal şekilde yeniden açar; bu süre zarfında tekrar tekrar talep edilmez" },
  },
  },
  "FBK-50": {
  shortName: "İlişki Durumu Yeniden Değerlendirmesi",
  name: "İlişki sinyali → kanıt birikimi → durum yeniden değerlendirmesi",
  purpose: "Sinyalleri tarihli kanıtlar olarak biriktir ve bir ilişki etiketinin yalnızca bir politikanın anlamını tanımladığı yerlerde var olmasını sağla.",
  nodes: {
    "t.signal": { headline: "Anlamlı ilişki sinyali" },
    "a.store": { headline: "Sinyali türü, kaynağı, zamanı, ilgili varlığı ve ne kadar güvenilir olduğuyla birlikte kaydet. Bu, bir sonuç olarak değil, kanıt olarak kaydedilir - fark, sonrasında herhangi bir sürecin buna itiraz edip edemeyeceğidir" },
    "c.immediate": { headline: "Bu sinyal, acil operasyonel bir eylem gerektiriyor mu?", edges: [{ label: "Eylem gerekli", detail: "şimdi bir şeyin olması gerekiyor - bir şikayet, bir arıza, bir talep" }, { label: "Sadece kanıt", detail: "herhangi bir eylem gerektirmeden ilişki hakkında bir şey söylüyor" }] },
    "x.owned": { headline: "kanıt olarak kaydedildi; eylem başka bir yerde sahiplenildi", detail: "eylemi sahiplenen süreç, aynı sinyal tarafından bağımsız olarak tetiklenir - bu süreç kaydeder, göndermez; göndermeyi burada tekrarlamak, iki sistemin tek bir olaya yanıt vermesine yol açar" },
    "c.reassess": { headline: "Birikmiş kanıt, bir ilişki durumunun yeniden değerlendirilmesini haklı çıkarıyor mu?", edges: [{ label: "Yeniden değerlendirmeye değer", detail: "kanıt kümesinde yeterince değişiklik oldu, mevcut durum artık doğru olmayabilir" }, { label: "Durum geçerliliğini koruyor", detail: "zaten kayıtlı olanla tutarlı bir sinyal daha" }] },
    "a.reassess": { headline: "Mevcut kanıt kümesinin tamamına karşı, değerlendirilen durumun gerektirdiği azalmayı uygulayarak yeniden değerlendir. Kanıtın ne kadar hızlı geçerliliğini yitireceği, neyin değerlendirildiğine bağlıdır: memnuniyet hızla eskir, süreklilik eskimez" },
    "x.evidence": { headline: "kanıt kaydedildi; durum değişmedi", detail: "bir sonraki sinyal, biraz daha büyük bir küme karşısında değerlendirilir" },
    "c.governed": { headline: "Atanan durum, bir politikanın gerçekten tanımladığı bir durum mu?", edges: [{ label: "Tanımlı", detail: "bir politika, bu etiketin ne anlama geldiğini, hangi kanıtın onu oluşturduğunu ve neyin onu kaldırdığını tanımlıyor" }, { label: "Tanımsız", detail: "etiket burada ilk kez oluşturulmuş olur - LOYAL, ADVOCATE, AT_RISK, VIP, DETRACTOR ve bunlara benzer her şey" }] },
    "a.assign": { headline: "Durumu ata; hangi politikanın bunu tanımladığını ve hangi kanıtın bunu sağladığını kaydet, böylece oluşturulduğu aynı yoldan açıklanabilir, itiraz edilebilir ve kaldırılabilir olsun" },
    "x.no-label": { headline: "kanıt kaydedildi; etiket oluşturulmadı", detail: "etiketi tanımlayan bir politika, bunu daha sonra aynı kanıta karşı atanabilir hale getirir - kimsenin tanımlamadığı bir etiket, kimsenin itiraz edemeyeceği, kaldıramayacağı veya taşıyan kişiye açıklayamayacağı bir etikettir" },
    "x.reassessed": { headline: "ilişki durumu, mevcut kanıt kümesine göre yeniden değerlendirildi", detail: "ek sinyaller bunu her iki yönde de yeniden değiştirebilir" },
  },
  },
  "FIN-131": {
  shortName: "Finansal Yükümlülük Takibi",
  name: "Finansal yükümlülük oluşturuldu → vadesi geldi → karşılandı veya bakiyesi açık",
  purpose: "Borçlu olunan tutarı, ödeme girişimlerinden ve bu konuda gönderilen her şeyden bağımsız, kendi başına bir durum olarak tutar.",
  nodes: {
    "t.created": { headline: "Finansal yükümlülük oluşturuldu" },
    "a.record": { headline: "Yükümlülük kimliğini, tutarı, para birimini, ödeyeni, alacaklıyı, varsa vade tarihini, kaynağı, ilgili işletme kaydını ve ödeme koşulunu kaydet. Para birimi tutarın ayrılmaz bir parçasıdır - para birimi belirtilmeyen bir tutar daha sonra hiçbir şeyle mutabakat edilemez" },
    "c.already": { headline: "Bunu zaten karşılayan mevcut bir ödeme veya alacak var mı?", edges: [{ label: "Zaten karşılanmış", detail: "mevcut, yetkili bir finansal işlem bunu kısmen veya tamamen kapatıyor" }, { label: "Karşılığında hiçbir şey yok", detail: "buna henüz hiçbir finansal işlem uygulanmamış" }] },
    "h.satisfy": { headline: "Finansal yükümlülük karşılandı → bakiyeyi mutabakat et → bağımlı durumu serbest bırak", detail: "bu yükümlülüğe uygulanan yetkili bir finansal işlem" },
    "a.outstanding": { headline: "AÇIK olarak kaydet. Bu, yeni bir yükümlülüğün olağan durumudur, bir hata değildir - hiçbir şey yanlış gitmemiştir ve henüz ödeme de yapılmamıştır; bu ikisi birbirinden farklı gerçeklerdir" },
    "w.obligation": { headline: "yükümlülük ana sistemde karşılanana, yükümlülüğe ilişkin bir düzeltme veya iptal kaydedilene ya da yükümlülüğün vadesi gelene veya vadesi geçene kadar", detail: "zaman aşımı: Yükümlülüğün kendi ufku - zamanaşımı süresi, değersizleştirme (write-off) noktası veya ait olduğu ilişkinin sona ermesi. (yapılandırma: financial_obligation.obligation)" },
    "c.olay": { headline: "Yükümlülüğe ne oldu?", edges: [{ label: "Bir finansal işlem bunun bir kısmını veya tamamını kapattı", detail: "bir ödeme, alacak veya mutabakat uygulandı" }, { label: "Düzeltildi veya iptal edildi", detail: "tutar, koşullar veya yükümlülüğün varlığı yetkili bir şekilde değişti" }, { label: "Vade durumu değişti", detail: "vadesi geldi veya karşılanmadan vade tarihini geçti" }] },
    "x.aged": { headline: "ufkunu aşmış, hâlâ açık", detail: "eskimiş bir yükümlülüğe ne olacağı bir muhasebe kararıdır - değersizleştirmek kendi yetkisine sahip bir politika eylemidir ve bu süreç bu kararı vermez" },
    "a.version": { headline: "Yükümlülüğü sürümle ve finansal durumu mutabakat et. Bir düzeltme, orijinal tutarın üzerine yazılmaz - yükümlülüğün geçmişi, sonradan çıkacak her itiraz veya mutabakatın referans aldığı şeydir; sessizce değiştirilmiş bir bakiye kimseye açıklanamaz" },
    "h.due": { headline: "Vade durumu değişikliği → önceliği yeniden hesapla → çöz veya yükselt", detail: "yükümlülüğün vadesinin gelmesi veya geçmesi" },
    "x.adjusted": { headline: "yükümlülük düzeltildi; önceki sürümler korunuyor", detail: "düzeltilen yükümlülük kendi yaşam döngüsününda yeni tutarıyla devam eder" },
  },
  },
  "FIN-134": {
  shortName: "Ödeme Başarısızlığından Kurtarma",
  name: "Ödeme başarısızlığı → sınıflandır → kurtar, alternatif sun veya çık",
  purpose: "Ödemenin gerçekte neden başarısız olduğuna göre yanıt ver ve bunu yaparken yükümlülüğü canlı tut.",
  nodes: {
    "t.failure": { headline: "Yetkili ödeme başarısızlığı" },
    "a.classify": { headline: "Başarısızlığı, sağlayıcının gerçekte bildirdiği sınıfa göre sınıflandır: geçici, yetersiz bakiye, geçersiz yöntem, süresi dolmuş yöntem, kimlik doğrulama gerekli, sağlayıcı hatası, politika reddi veya bilinmeyen neden. Ret nedeni asla uydurulmaz - sağlayıcı yalnızca 'ödemeyi onaylamıyorum' dediğinde kişiye kartında yetersiz bakiye olduğunu söylemek, denetlenebilir bir yanlış beyandır ve kişiyi yanlış şeyi düzeltmeye yönlendirir" },
    "c.class": { headline: "Ne tür bir başarısızlıktı?", edges: [{ label: "Geçici, tekrar denemek güvenli", detail: "geçici bir durum veya sağlayıcı tarafındaki bir hata söz konusu ve aynı idempotency anahtarı hâlâ geçerli" }, { label: "Müşteri düzeltebilir", detail: "yetersiz bakiye, geçersiz veya süresi dolmuş bir yöntem ya da tamamlanmamış bir kimlik doğrulama" }, { label: "Reddedildi veya kullanılabilir bir neden verilmedi", detail: "bir politika reddi ya da nedeni bir talimata dönüştürülemeyen bir ret" }] },
    "a.retry": { headline: "Sınırlı politika dahilinde, aynı idempotency anahtarını kullanarak tekrar dene; böylece başarıyla ulaşmış olan ilk deneme tekrarlanmak yerine özümsenebilir" },
    "a.corrective": { headline: "Tam olarak hangi düzeltici eylemin gerektiğini iste - yöntemi güncelle, kimlik doğrulamayı tamamla, başka bir yöntem seç. Neyin düzeltileceğini söylemek sınıflandırmanın tüm değeridir; ödemenin başarısız olduğuna dair genel bir bildirim kişiyi tahmin etmeye zorlar. Sağlayıcının risk detayları ve dahili ret kodları paylaşılmaz" },
    "c.alternate": { headline: "Geçerli bir alternatif ödeme yolu mevcut mu ve bu karar kime ait?", edges: [{ label: "Sistemin kullanabileceği tanımlı bir yedek", detail: "kayıtlı başka bir yöntem mevcut ve mevcut yetki, tekrar sormaya gerek kalmadan bu yöntemden tahsilat yapılmasını zaten kapsıyor" }, { label: "Müşterinin seçmesi veya onaylaması gerekiyor", detail: "bir alternatif mevcut ancak buna ilişkin bir yetki bulunmuyor; bu nedenle onu kullanmak, kişinin seçmediği bir yöntemden tahsilat yapmak anlamına gelir" }, { label: "Sunulacak başka bir şey yok", detail: "kullanılabilir veya izin verilen başka bir yol yok" }] },
    "w.recovery": { headline: "yükümlülük ana sistemde karşılanana veya sahibi geri dönüş yolunu takip etmeyi bırakana kadar", detail: "zaman aşımı: Müşterinin sonuç tarihinden önce hâlâ harekete geçebilmesi için yerleştirilmiş tek bir hatırlatma. Bir sonuç tarihi yoksa hatırlatma noktası kurtarma penceresinin kendisidir ve hatırlatma atlanır. (örnek: 2 gün-3 gün; yapılandırma: payment.reminder_point)" },
    "a.use-alternate": { headline: "Onaylı alternatif yolu, kendi tanımlayıcılarına sahip yeni bir deneme olarak tahsil et. Buraya ya mevcut yetkinin bunu zaten kapsaması ya da müşterinin bunu seçmiş olması nedeniyle ulaşılır - her iki durumda da bu yöntemi kullanma yetkisi, kullanılmadan önce mevcuttur" },
    "a.offer-alternate": { headline: "Mevcut alternatifleri müşteriye sun ve hangisini kullanmak istediğini sor; yükümlülüğün her durumda geçerli olduğunu belirt. Ödeme yöntemini seçmek müşterinin kararıdır; bunu sessizce seçen dahili bir eylem, müşterinin onaylamadığı bir tahsilat anlamına gelir" },
    "c.recovered": { headline: "Kurtarma süreci nasıl sonuçlandı?", edges: [{ label: "Karşılandı", detail: "sonraki bir deneme yükümlülüğü kapattı" }, { label: "Vazgeçildi", detail: "müşteri denemeyi bıraktı" }] },
    "c.reminder": { headline: "Bir hatırlatma hâlâ işe yarar mı ve belirtilecek bir sonuç var mı?", edges: [{ label: "Sonuç yaklaşıyor, yükümlülük açık", detail: "yükümlülük hâlâ açık, yöntem hâlâ geçersiz ve belirtilmiş bir sonuç tarihi önde" }, { label: "Eklenecek bir şey yok", detail: "bir sonuç tarihi yok ya da durum, bir hatırlatmanın değiştirebileceği şekilde değişmedi" }] },
    "w.alternate-choice": { headline: "müşteri alternatif bir ödeme yöntemi seçene veya onaylayana kadar", detail: "zaman aşımı: Yöntem seçimi müşterinin kararıdır ve bu karar beklenir. Yanıtsız kalan bir seçim, ödemeyi reddetmek anlamına gelmez; yükümlülük reddedilmiş sayılmak yerine kendi sonucuna doğru ilerler. (örnek: 3 gün-7 gün; yapılandırma: payment.alternate_choice_window)" },
    "a.confirmed": { headline: "Yükümlülüğün kapandığını, hangi yöntemle kapandığını ve başka bir beklenti olmadığını teyit et. Karşılanmış ama hiç bildirilmemiş bir yükümlülük, kişinin sürekli kontrol etmeye devam ettiği bir yükümlülüktür; bu kontrol etme de içeriden bakıldığında bir destek talebi gibi görünür. Kişinin kendisinin seçmediği bir yöntemle yapılan tahsilat, yükümlülük kapandığı anda açıklanır, hesap özetinde keşfedilmez" },
    "c.next": { headline: "Kurtarma penceresinden sonra yükümlülük hâlâ ödenmedi - hangi politika uygulanır?", edges: [{ label: "Ek süre (grace period)", detail: "yükümlülük çözülmemişken politika sınırlı hizmete devam eder" }, { label: "Vadesi geçmiş takibi", detail: "yükümlülük, ani bir sonuç doğurmadan vadesi geçmiş operasyonel duruma geçer" }, { label: "Erişim kısıtlaması", detail: "yükümlülük ödenmemişken politika yeteneği kısıtlar" }] },
    "a.remind": { headline: "Sonucun yaklaştığını ve ne zaman gerçekleşeceğini bir kez söyle ve aynı düzeltici eylemi tekrarla. Tek bir bildirim - ikincisi artık bir hatırlatma değil, bir kurtarma dizisi olur" },
    "x.recovered": { headline: "yükümlülük kurtarma yoluyla karşılandı", detail: "gelecekteki bir yükümlülüğe karşı gelecekte yaşanacak bir başarısızlık, kendi başına ayrı bir örnektir" },
    "h.grace": { headline: "Ek süreye giriş → geçici devamlılık → kurtar veya sonlandır", detail: "ödenmemiş bir yükümlülüğün ek süreye girmesi" },
    "h.overdue": { headline: "Vade durumu değişikliği → önceliği yeniden hesapla → çöz veya yükselt", detail: "ödenmemiş bir yükümlülüğün vadesinin geçmesi" },
    "h.restrict": { headline: "Erişim askıya alma → kısıtlı durum → geri yükle veya sonlandır", detail: "bir yükümlülük ödenmemişken politikanın yeteneği kısıtlaması" },
    "w.final": { headline: "yükümlülük ana sistemde karşılanana veya sahibi geri dönüş yolunu takip etmeyi bırakana kadar", detail: "zaman aşımı: Kurtarma penceresi, yükümlülük sınıfının kendi ek süre veya sonuç politikasıdır. Sürenin sona ermesi ödeme, gecikme veya kısıtlama yaşam döngüsününın sonucudur; burada yeni bir uzatma üretilmez. (yapılandırma: payment.recovery_window)" },
  },
  },
  "FIN-136": {
  shortName: "Bakiye Mutabakatı",
  name: "Finansal yükümlülük karşılandı → bakiyeyi mutabakat et → bağımlı durumu serbest bırak",
  purpose: "Bir finansal işlemi bir yükümlülüğe tam olarak bir kez uygula ve yalnızca gerçekten o yükümlülüğe bağlı olanı serbest bırak.",
  nodes: {
    "t.satisfying": { headline: "Yükümlülüğe karşı yetkili finansal işlem" },
    "a.apply": { headline: "Tutarı yükümlülüğe idempotent şekilde uygula; aynı finansal işlemin iki kez gelmesi durumunda bakiyenin yalnızca bir kez değişmesini sağlayacak şekilde anahtarla. Herhangi bir netleştirme yapılmadan önce para birimi uyumu kontrol edilir - farklı para birimlerindeki tutarlar birbirine mahsup edilmez" },
    "a.recalculate": { headline: "Kalan bakiyeyi, yükümlülüğün durumunu, varsa fazla ödemeyi ve özellikle bu yükümlülüğe dayanan bağımlı kısıtlamaları veya blokeleri yeniden hesapla" },
    "c.status": { headline: "Yeniden hesaplanan bakiye ne gösteriyor?", edges: [{ label: "Tamamen karşılandı", detail: "bakiye sıfıra ulaşıyor" }, { label: "Kısmen karşılandı", detail: "bir tutar açık kalıyor" }, { label: "Fazla ödendi", detail: "uygulanan tutar, borçlu olunan tutarı aşıyor" }] },
    "a.satisfied": { headline: "Yükümlülüğe karşı KARŞILANDI olarak kaydet" },
    "a.partial": { headline: "Kalan bakiyeyi açıkça belirterek KISMEN_KARŞILANDI olarak kaydet. Kısmi karşılama, ödenmiş olmak değildir; açıkça belirtilmeyip yalnızca ima edilen bir kalan tutar, kimsenin tahsil edemeyeceği ve kimsenin itiraz edemeyeceği bir tutardır" },
    "h.overpayment": { headline: "external:overpayment-or-credit", detail: "borçlu olunan tutarı aşan bir tutarın uygulanması" },
    "c.restriction": { headline: "Mevcut bir kısıtlama yalnızca bu yükümlülüğe mi dayanıyor?", edges: [{ label: "Kısıtlama buna dayanıyordu", detail: "bir yetenek, özellikle bu yükümlülük ödenmediği için kısıtlanmıştı" }, { label: "Hiçbir kısıtlama buna bağlı değildi", detail: "bu yükümlülük nedeniyle hiçbir şey alıkonulmamıştı" }] },
    "x.partial": { headline: "KISMEN_KARŞILANDI; kalan bakiye açıkça belirtilmiş ve hâlâ açık", detail: "sonraki finansal işlemler kalan bakiyeye uygulanır. Bu yükümlülüğe dayanan kısıtlamalar yürürlükte kalır, çünkü yükümlülük henüz kapanmamıştır" },
    "h.restore": { headline: "Yetenek geri yükleme → yeniden doğrula → güvenle geri yükle", detail: "ödenmesi, bir yeteneğin kısıtlanma nedenini ortadan kaldıran bir yükümlülük" },
    "x.satisfied": { headline: "KARŞILANDI; başka hiçbir şey buna bağlı değildi", detail: "bu yükümlülüğe karşı sonradan yapılacak bir düzeltme veya ters kayıt, açık bir bakiyeye değil, kapanmış bir bakiyeye uygulanan kendi başına ayrı bir finansal işlemdir" },
  },
  },
  "FIN-137": {
  shortName: "Para İadesi Talebi",
  name: "İade talebi → uygunluk → onayla, reddet veya incele",
  purpose: "Talebin kendisinde herhangi bir para hareketi olmadan, iade talebini yetkili bir karara dönüştür.",
  nodes: {
    "t.requested": { headline: "İade talep edildi" },
    "a.record": { headline: "Talep kimliğini, orijinal işlemi, talep edilen tutarı, nedeni, talep sahibini ve gönderim zamanını kaydet. Kendisine karşı yapılan bir talep, orijinal ödeme geçmişini değiştirmez" },
    "c.scope": { headline: "Talep geçerli mi ve süreç kapsamında mı?", edges: [{ label: "Geçerli", detail: "gerçek bir işlemi tanımlıyor, talep etmeye yetkili biri tarafından yapılmış ve varsa geçerli süre içinde" }, { label: "Kapsam dışı", detail: "geçerli bir işlem belirtmiyor, yetkisi olmayan biri tarafından yapılmış ya da tamamen sürecin dışında kalıyor" }] },
    "c.policy": { headline: "Bu işlem türü için bir iade uygunluk politikası tanımlanmış mı?", edges: [{ label: "Tanımlı", detail: "politika, neyin hangi koşullarda iadeye uygun olduğunu belirtiyor" }, { label: "Tanımlı değil", detail: "bu tür bir iadeyi kapsayan bir politika yok" }] },
    "a.reject-scope": { headline: "Gerçek nedeni ve geçerliyse uygulanabilecek süreci belirterek reddet. Nedenini açıklamayan bir ret, bu talebi kapatmak yerine bir sonraki talebi doğurur" },
    "c.eligible": { headline: "Politika neyi belirliyor?", edges: [{ label: "Uygun", detail: "politikanın koşulları kesin olarak karşılanıyor" }, { label: "Uygun değil", detail: "politika bunu kesin olarak dışlıyor" }, { label: "Değerlendirme gerektiriyor", detail: "politika bu durumu bir kurala değil, bir karara bırakıyor" }] },
    "h.undefined": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "kendisine uygulanan bir uygunluk politikası olmayan bir iade talebi" },
    "x.rejected": { headline: "REDDEDİLDİ; hiçbir para hareketi olmaz ve orijinal işlem geçerliliğini korur", detail: "farklı bir gerekçeye dayanan bir talep veya yeni bir kanıt, kendi başına değerlendirilir. Talep edilen bir iade, borçlu olunan bir iade anlamına gelmez" },
    "a.approve": { headline: "Onaylanan tutarı ve onaylayan yetkiyi belirterek ONAYLANDI olarak kaydet. Onaylanmış olmak, hareketi yetkilendirir ama gerçekleştirmez" },
    "a.reject": { headline: "Talebi dışlayan politikadan gelen nedeni belirterek REDDEDİLDİ olarak kaydet" },
    "a.review": { headline: "İNCELENİYOR olarak kaydet ve kararın gerektirdiği her şeyi topla. İnceleme sürerken hiçbir şey hareket etmez" },
    "h.execute": { headline: "İade onaylandı → gerçekleştir → teyit et veya mutabakat et", detail: "gerçekleştirilmek üzere onaylanmış bir iade" },
    "a.notify-rejection": { headline: "İadenin reddedildiğini ve reddin nedenini - ister doğrudan politikadan ister bir incelemeciden gelsin - talep sahibine bildir. Kaydedilip hiç gönderilmemiş bir ret, kişiyi zaten verilmiş bir kararı beklerken bırakır" },
    "a.acknowledge-review": { headline: "Talep sahibine iadenin incelendiğini ve bu durumun ne anlama geldiğini, bir sonucu ima etmeden bildir. İnsan kararı beklemek bu sürecin en uzun sessizliğidir ve yanıt gelmeyeceği şeklinde en kolay yanlış anlaşılan durumdur" },
    "w.decision": { headline: "talep hakkında yetkili bir karar kaydedilene kadar", detail: "zaman aşımı: Karar SLA'sı. (yapılandırma: refund_request.decision)" },
    "c.decision": { headline: "Ne karar verildi?", edges: [{ label: "Onaylandı", detail: "incelemeci iadeyi onayladı" }, { label: "Reddedildi", detail: "incelemeci reddetti" }] },
    "h.escalate": { headline: "Sorumluluk yükseltme → üst yetkili → çözüm veya geri dönüş", detail: "SLA süresini aşan bir iade kararı" },
  },
  },
  "FUL-141": {
  shortName: "İfa Talebi Doğrulama",
  name: "İfa talebi → doğrulama → kabul, ret veya beklemeye alma",
  purpose: "Bir şeyin teslimatından sorumluluk üstlenip üstlenmediğimize karar vermek; bu, yalnızca talep edilmiş olmaktan ayrı bir durumdur.",
  nodes: {
    "t.submitted": { headline: "İfa talebi gönderildi" },
    "a.capture": { headline: "Talep kimliğini, ürünü veya hizmeti, miktarı veya kapsamı, alıcıyı, hedefi veya bağlamı, talep edilen zamanlamayı, ilgili işlemi veya sözleşmeyi ve gönderim zamanını kaydet" },
    "a.validate": { headline: "Asgari ifa gereksinimlerini doğrula - talep edilenin bizim sunduğumuz bir şey olarak var olduğunu, hedefin hizmet verilebilir olduğunu, talep sahibinin bunu isteme yetkisi olduğunu ve kapsamın tutarlı olduğunu doğrula" },
    "c.valid": { headline: "Talep geçerli mi?", edges: [{ label: "Geçerli", detail: "üstlenmeyi değerlendirmemiz için gereken asgari koşulları karşılıyor" }, { label: "Geçersiz", detail: "hiçbir bağımlılığın çözemeyeceği şekilde bir gereksinimi karşılamıyor" }] },
    "c.dependency": { headline: "Çözülmemiş ek bir bağımlılık var mı?", edges: [{ label: "Bekleyen bir şey var", detail: "sorumluluk üstlenebilmemiz için bir ön koşulun, onayın, belgenin veya teyidin tamamlanması gerekiyor" }, { label: "Bekleyen bir şey yok", detail: "kabul için gereken her şey mevcut" }] },
    "a.reject": { headline: "Belirli nedenle birlikte REDDEDİLDİ durumunu kaydet. Hiçbir yükümlülük oluşturulmaz - reddedilmiş bir talebin arkasında gizli bir yükümlülük varsa, bunun üzerinde kimse çalışmıyor ve varlığından kimse haberdar değildir; bu durum ancak müşteri siparişinin nerede olduğunu sorduğunda ortaya çıkar" },
    "a.hold": { headline: "Belirli bağımlılığı belirterek BEKLEMEDE / GEREKSİNİM_BEKLENİYOR durumunu kaydet. Beklemeye alınmış bir talep kabul edilmiş sayılmaz ve beklerken herhangi bir yükümlülük oluşturmaz" },
    "a.accept": { headline: "KABUL EDİLDİ durumunu kaydet ve ifa yükümlülüğünü oluştur. Teslimat sorumluluğu burada başlar ve bundan sonraki her şey artık yalnızca talep edilmiş değil, borçlu olunan bir şeydir" },
    "x.rejected": { headline: "REDDEDİLDİ; ifa yükümlülüğü oluşturulmadı", detail: "düzeltilmiş bir talep kendi koşullarına göre yeniden doğrulanır" },
    "w.dependency": { headline: "adı geçen bağımlılık çözülene kadar", detail: "zaman aşımı süresi: Talebin geçerlilik penceresi. (fulfillment_request.dependency içinden yapılandırın)" },
    "h.availability": { headline: "Kabul edilmiş ifa → müsaitlik kontrolü → tahsis, geri sipariş veya ret", detail: "karşılanması için kaynak gerektiren, kabul edilmiş bir yükümlülük" },
    "x.lapsed": { headline: "bağımlılığı çözülmeden talebin süresi doldu; yükümlülük oluşturulmadı", detail: "yeni bir talep, bağımlılığın o andaki durumuna göre yeniden doğrulanır" },
  },
  },
  "FUL-142": {
  shortName: "İfa Tahsisi",
  name: "Kabul edilmiş ifa → müsaitlik kontrolü → tahsis, geri sipariş veya ret",
  purpose: "Kabul edilmiş bir yükümlülüğü karşılayacak kaynakların, onu karşılayacak kapsam ve zaman penceresinde gerçekten var olup olmadığını belirlemek.",
  nodes: {
    "t.needs-resource": { headline: "Kabul edilmiş ifa kaynak gerektiriyor" },
    "a.evaluate": { headline: "Yetkili müsaitlik bilgisini ilgili kapsam ve zamana göre değerlendir - bu hedefe hizmet verecek konumu, bu zamanlamayı karşılayacak pencereyi, bu hizmetin gerektirdiği yetkinliği. Katalog müsaitliği neyi sattığımıza dair bir beyandır; tahsis edilebilir müsaitlik ise bu yükümlülüğe şu anda ne taahhüt edilebileceğine dair bir beyandır" },
    "c.availability": { headline: "Bu yükümlülük için fiilen ne mevcut?", edges: [{ label: "Tamamen mevcut", detail: "yükümlülüğün ihtiyaç duyduğu her şey doğru kapsam ve pencerede taahhüt edilebilir" }, { label: "Kısmen mevcut", detail: "kapsamın bir kısmı taahhüt edilebilir, bir kısmı edilemez" }, { label: "Geçici olarak mevcut değil", detail: "kaynağın, yükümlülüğün tolere edebileceği bir pencere içinde tekrar kullanılabilir hale gelmesi bekleniyor" }, { label: "Karşılanamaz", detail: "kaynak, bu yükümlülüğün tolere edebileceği hiçbir pencerede mevcut olmayacak" }] },
    "h.allocate": { headline: "Kaynak tahsisi → rezervasyon → onay, serbest bırakma veya yeniden tahsis", detail: "bu yükümlülüğe hizmet edebilecek kaynakların var olması" },
    "c.partial": { headline: "Politika bu yükümlülüğün kısmen karşılanmasına izin veriyor mu?", edges: [{ label: "Kısmi karşılamaya izin var", detail: "kapsam bölünebiliyor ve bir kısmının teslim edilmesi alıcı için faydalı" }, { label: "Ya hep ya hiç", detail: "kapsam bölünemiyor ya da kısmi bir teslimat alıcıya fayda sağlamaz" }] },
    "a.backorder": { headline: "Neyin eksik olduğunu ve neyin bunu çözeceğini tam olarak belirterek GERİ_SİPARİŞ / KAPASİTE_BEKLENİYOR durumunu kaydet. Yükümlülük geçerliliğini korur - başarısız olmuyor, yalnızca kapasiteyi bekliyor" },
    "a.unavailable": { headline: "Tedarik edilemeyeni ve nedenini belirterek İFA_YAPILAMAZ durumunu kaydet" },
    "w.capacity": { headline: "gereken kaynaklar kullanılabilir hale gelene kadar", detail: "zaman aşımı süresi: Yükümlülüğün tolerans penceresi. (fulfillment_availability.capacity içinden yapılandırın)" },
    "h.unavailable": { headline: "İfa iptali → gelecekteki işi durdurma → kaynakları serbest bırakma → mutabakat", detail: "kaynak sağlanamayan bir yükümlülük" },
    "c.recheck": { headline: "Kapasite geri döndüğünde yükümlülük artık karşılanabiliyor mu?", edges: [{ label: "Artık mevcut", detail: "geri dönen kapasite, bu yükümlülüğün kapsamı ve penceresinde ihtiyaç duyduğunu karşılıyor" }, { label: "Hâlâ yetersiz", detail: "geri dönen kapasite bu yükümlülüğü karşılamıyor ya da başka biri tarafından alındı" }] },
  },
  },
  "FUL-143": {
  shortName: "Kaynak Rezervasyonu",
  name: "Kaynak tahsisi → rezervasyon → onay, serbest bırakma veya yeniden tahsis",
  purpose: "Belirli bir kapasiteyi, tüketilene veya bilinçli olarak serbest bırakılana kadar tek bir yükümlülüğe bağlamak.",
  nodes: {
    "t.selected": { headline: "İfa için kaynak seçildi" },
    "a.reserve": { headline: "Kaynak kimliğini, miktarı veya kapasiteyi, ait olduğu ifayı, rezervasyon zamanını, geçerliliğini ve durumunu kaydederek tahsisi idempotent şekilde oluştur. İdempotentlik, tekrarlanan bir tahsis işleminin kaynağı iki kez tüketmesini engelleyen şeydir - bir sistemin kimse fazladan satış yapmadan fazla satış yapmasının yolu tam olarak budur" },
    "c.confirmed": { headline: "Rezervasyon onaylandı mı?", edges: [{ label: "Onaylandı", detail: "kaynak sistemi talebi kabul etti" }, { label: "Başka bir talebe kaybedildi", detail: "kaynak, müsaitlik okuması ile bu rezervasyon arasında elden gitti" }] },
    "c.temporary": { headline: "Bu rezervasyon geçici mi?", edges: [{ label: "Geçici", detail: "bir pencere içinde tüketilmezse talep süresi dolar" }, { label: "Tüketilene veya serbest bırakılana kadar tutuluyor", detail: "yükümlülük onu kullanana veya vazgeçene kadar talep geçerliliğini korur" }] },
    "h.recheck": { headline: "Kabul edilmiş ifa → müsaitlik kontrolü → tahsis, geri sipariş veya ret", detail: "mevcut görünen bir kaynak için yarışı kaybeden bir rezervasyon" },
    "a.temporary": { headline: "Açık bir sona erme veya serbest bırakma koşuluyla TAHSİS_EDİLDİ durumunu kaydet. Sonu belirtilmemiş bir rezervasyon, hiç tüketmeyebilecek bir yükümlülük adına kıt kapasiteyi elde tutar ve kapasiteye ihtiyaç duyulana kadar kimse bunun farkına varmaz" },
    "a.allocated": { headline: "Yükümlülük onu tüketene veya açıkça serbest bırakana kadar tutulacak şekilde TAHSİS_EDİLDİ durumunu kaydet" },
    "w.allocation": { headline: "ifa, tahsis edilen kaynağı tüketene, ifa iptal edilene ya da kapsamı değişene veya rezerve edilen kaynak kullanılamaz hale gelene kadar", detail: "zaman aşımı süresi: Rezervasyonun geçerlilik süresi, varsa. (resource_allocation.allocation içinden yapılandırın)" },
    "c.olay": { headline: "Tahsise ne oldu?", edges: [{ label: "Tüketildi", detail: "ifa onu kullandı" }, { label: "Artık gerekli değil", detail: "ifa iptal edildi ya da kapsamı değişti ve bu kaynağa artık ihtiyaç yok" }, { label: "Kaynağın kendisi kullanılamaz hale geldi", detail: "rezerve edilen şey hasar gördü, geri çekildi ya da başka bir şekilde ortadan kalktı" }] },
    "a.expire": { headline: "Geçici rezervasyonun süresini doldur ve kapasiteyi geri döndür; bunun tüketilme veya serbest bırakılma değil, süre dolması olduğunu kaydet - bu üç farklı sonuç, yükümlülük hakkında üç farklı şey anlatır" },
    "x.consumed": { headline: "tahsis, oluşturulduğu ifa tarafından tüketildi", detail: "aynı yükümlülük üzerindeki ek bir kaynak ihtiyacı kendi başına ayrı bir tahsistir" },
    "a.release": { headline: "Tahsisi, yalnızca bu ifanın kendi rezervasyonuyla sınırlı olacak şekilde serbest bırak. Paylaşılan bir kaynağın diğer taleplerine uzanan bir serbest bırakma işlemi, hâlâ devam eden yükümlülüklerden kapasite alır ve bu başarısızlıklar tamamen başka bir yerde ortaya çıkar" },
    "h.exception": { headline: "İfa istisnası → teşhis → kurtarma, ikame veya başarısızlık", detail: "rezerve edilmiş bir kaynağın tüketilmeden önce kullanılamaz hale gelmesi" },
    "x.expired": { headline: "rezervasyonun süresi tüketilmeden doldu; yükümlülük hâlâ kaynak bekliyor", detail: "yükümlülük, adına hiçbir şey tutulmamış halde müsaitlik sorusuna geri döner" },
    "x.released": { headline: "serbest bırakıldı; kapasite geri döndü, diğer talepler etkilenmedi", detail: "kaynak, ondan sonra kim talep ederse ona açıktır" },
  },
  },
  "FUL-144": {
  shortName: "İfa Yürütmesi",
  name: "İfa yürütmesi → ilerleme → tamamlama, kısmi tamamlama veya başarısızlık",
  purpose: "İç bir adımın ne bildirdiğini değil, yükümlülüğün kapsamının fiilen nereye ulaştığını takip etmek.",
  nodes: {
    "t.started": { headline: "İfa yürütmesi başladı" },
    "a.in-fulfillment": { headline: "İFA_SÜRÜYOR durumunu kaydet ve yükümlülüğün kapsamının gerektirdiği yerlerde anlamlı ilerlemeyi takip etmeye başla" },
    "w.execution": { headline: "yürütme bir sonuç bildirene ya da ifa sırasında önemli bir istisna meydana gelene kadar", detail: "zaman aşımı süresi: Beklenen ifa penceresi. (fulfillment_execution.execution içinden yapılandırın)" },
    "c.outcome": { headline: "Yürütme neye ulaştı?", edges: [{ label: "Yükümlülüğün tamamı", detail: "kapsamın her parçası karşılandı" }, { label: "Bir kısmı", detail: "kapsamın bir kısmı karşılandı, bir kısmı kaldı" }, { label: "Kurtarılabilir bir istisna", detail: "bir sorun oluştu ancak sonuçta teslim edileni değiştirmeyebilir" }, { label: "Kesin imkânsızlık", detail: "kalan kapsam hiçbir şekilde karşılanamaz" }] },
    "h.delay": { headline: "İfa gecikmesi → taahhüdü yeniden hesaplama → devam, yeniden planlama veya üst mercie yönlendirme", detail: "beklenen penceresini aşan ifa" },
    "a.fulfilled": { headline: "İFA_EDİLDİ durumunu kaydet - bu, iç bir görevin başarıyla sonuçlandığı değil, yükümlülüğün kapsamının karşılandığı anlamına gelir. Görevin üretmesi gereken iş sonucu teyit edilmediyse, görevin tamamlanması ifa sayılmaz" },
    "a.partial": { headline: "KISMEN_İFA_EDİLDİ durumunu kaydet ve tam olarak neyin hâlâ borçlu olduğunu belirle. Tamamlanan kapsam korunur - onaylanmış bir kısım başarılı olduğu halde yükümlülüğün tamamını başarısız olarak işaretlemek, fiilen yapılmış ve teslim edilmiş işi yok sayar" },
    "h.exception": { headline: "İfa istisnası → teşhis → kurtarma, ikame veya başarısızlık", detail: "yürütme sırasında önemli bir istisna" },
    "a.failed": { headline: "Karşılanamayan kapsam için, tamamlandığı onaylanmış olan her şeyi koruyarak İFA_BAŞARISIZ durumunu kaydet. Başarısızlık yalnızca fiilen başarısız olan kısımla sınırlıdır" },
    "c.dispatch": { headline: "Tamamlama, bunu bir teslimat mekanizmasına devretmeyi gerektiriyor mu?", edges: [{ label: "Sevkiyat gerektiriyor", detail: "bir taşıyıcı, teknisyen veya başka bir yürütücü bunu alıcıya ulaştırmak zorunda" }, { label: "Yerinde teslim ediliyor", detail: "kapsamı karşılamanın kendisi teslimattır - dijital bir hizmet, yerinde bir kurulum, tamamlanmış bir saha çalışması" }] },
    "x.partial": { headline: "KISMEN_İFA_EDİLDİ; tamamlanan kapsam korundu ve kalan kapsam açıkça belirtildi", detail: "kalan kapsam kendi yürütme sürecine devam eder. Teslim edilen teslim edilmiştir, borçlu olunan ise ima edilmek yerine açıkça belirtilir" },
    "h.remedy": { headline: "İfa iptali → gelecekteki işi durdurma → kaynakları serbest bırakma → mutabakat", detail: "ifa edilemeyen bir kapsam" },
    "h.dispatch": { headline: "Sevkiyat veya devir → takip → teslim edildi, başarısız veya bilinmiyor", detail: "hazırlanmış bir ürün veya hizmetin bir teslimat yürütücüsüne geçmesi" },
    "h.confirm": { headline: "Teslimat teyidi → kabul veya itiraz penceresi → sonuçlandırma", detail: "tamamlanması kendisi teslimat olan bir ifa" },
  },
  },
  "FUL-145": {
  shortName: "İfa İstisnası Kurtarma",
  name: "İfa istisnası → teşhis → kurtarma, ikame veya başarısızlık",
  purpose: "Bir yükümlülükte yalnızca operasyonel sorunun gerçekten etkilediği kısmı değiştirmek.",
  nodes: {
    "t.exception": { headline: "Önemli ifa istisnası" },
    "a.classify": { headline: "İstisnayı ve fiilen etkilediği kapsamı sınıflandır. Çok kalemli bir yükümlülükteki hasarlı bir birim yalnızca o birimi etkiler - yükümlülüğün geri kalanı etkilenmez ve yoluna devam eder; bir istisna, etrafındaki her şeyin iptali anlamına gelmez" },
    "c.route": { headline: "Bunu ne çözebilir?", edges: [{ label: "Vaadi değiştirmeden kurtarılabilir", detail: "aynı sonuç hâlâ aynı zamanda teslim edilebilir" }, { label: "Bir ikame mevcut", detail: "farklı bir şey yükümlülüğü karşılayabilir" }, { label: "Yalnızca zamanlama değişiyor", detail: "vadedilen sonuç geçerliliğini korur ve daha sonra ulaşacak" }, { label: "Yükümlülük karşılanamaz", detail: "ne kurtarma, ne ikame, ne de daha sonraki bir tarih bunu çözer" }] },
    "a.recover": { headline: "Kurtar ve devam ettir. Vadedilen sonuç ve zamanlama geçerliliğini korur, yükümlülükle ilgili hiçbir şey değişmez" },
    "c.approval": { headline: "İkame yapmak onay veya bir seçim gerektiriyor mu?", edges: [{ label: "Onay gerekli", detail: "ikame, alıcının önemseyeceği bir şekilde farklılık gösteriyor" }, { label: "Politika otomatik olarak izin veriyor", detail: "politika bu ikameyi eşdeğer ve önceden onaylanmış olarak tanımlıyor" }] },
    "h.delay": { headline: "İfa gecikmesi → taahhüdü yeniden hesaplama → devam, yeniden planlama veya üst mercie yönlendirme", detail: "yalnızca yükümlülüğün ne zaman karşılanacağını değiştiren bir istisna" },
    "a.terminal": { headline: "Etkilenen kapsam için yükümlülüğü karşılanamaz olarak kaydet, zaten tamamlanmış olan her şeyi koru" },
    "h.resume": { headline: "İfa yürütmesi → ilerleme → tamamlama, kısmi tamamlama veya başarısızlık", detail: "yükümlülüğün devam etmesiyle çözülen bir istisna" },
    "w.approval": { headline: "ikame onaylanana ya da ikame reddedilene kadar", detail: "zaman aşımı süresi: Onay penceresi. (fulfillment_exception.approval içinden yapılandırın)" },
    "a.substitute": { headline: "İkameyi uygula; neyin vadedildiğini ve bunun yerine neyin teslim edildiğini kaydet. Yükümlülük azaltılmış değil, yerine yenisi konmuş sayılır ve kalan kapsamı ikamenin şartlarıyla ifade edilir" },
    "h.terminal": { headline: "İfa iptali → gelecekteki işi durdurma → kaynakları serbest bırakma → mutabakat", detail: "yükümlülüğün etkilenen kapsamını sona erdiren bir istisna" },
    "c.approved": { headline: "İkame kabul edildi mi?", edges: [{ label: "Onaylandı", detail: "alıcı veya işletme onu kabul etti" }, { label: "Reddedildi", detail: "ikame reddedildi ve istisnayı çözecek başka bir şey yok" }] },
  },
  },
  "FUL-146": {
  shortName: "Teslimat Gecikme Uyarısı",
  name: "İfa gecikmesi → taahhüdü yeniden hesaplama → devam, yeniden planlama veya üst mercie yönlendirme",
  purpose: "Gecikmeyi kendi başına bir durum olarak ele almak; yeni tahmin ne olursa olsun, orijinal taahhüt bunun arkasında bozulmadan kalır.",
  nodes: {
    "t.slip": { headline: "Beklenen ifa zamanlaması kaydı" },
    "a.assess": { headline: "Orijinal taahhüdü, güncel tahmini, nedeni, etkilenen kapsamı ve etkiyi belirle ve GECİKTİ durumunu kaydet. Gecikme, zamanlamada bir değişikliktir, bir başarısızlık değil - yükümlülük hâlâ borçludur ve sonraki hiçbir adım bunu yok saymamalıdır" },
    "c.estimate": { headline: "Güvenilir yeni bir tamamlanma tahmini var mı?", edges: [{ label: "Güvenilir bir tahmin var", detail: "neden, ne zaman çözüleceğini tahmin edecek kadar iyi anlaşılmış durumda" }, { label: "Güvenilir bir tahmin yok", detail: "neden, tutarlı bir tarih belirleyecek kadar iyi anlaşılmış değil" }] },
    "a.update": { headline: "Beklenen zamanlamayı güncelle ve bunu taahhüt geçmişine ekle. Orijinal taahhüt korunur - ne vadedildiği ve neye dönüştüğü iki ayrı gerçektir; her ikisini de saklamak, tekrarlanan bir kaymanın görünür hale gelmesinin tek yoludur" },
    "a.no-estimate": { headline: "Bir tarih vermek yerine güvenilir bir tahminin bulunmadığını kaydet. Tutulmayacak tarihleri tekrar tekrar vadetmek, tarihin bilinmediğini kabul etmekten daha fazla güven kaybettirir; her bozulan tarih bir sonrakini daha değersiz kılar" },
    "c.recipient-impact": { headline: "Değişen zamanlama, alıcının plan yapması gereken şeyi değiştiriyor mu?", edges: [{ label: "Planlarını değiştiriyor", detail: "yeni tahmin ya da güvenilir bir tahminin kaybolması, kendi zamanlarını veya taahhütlerini ayarladıkları bir şeyi kaydırıyor" }, { label: "Onlar için önemli bir değişiklik yok", detail: "kayma, kendilerine zaten bildirilen beklenti aralığının içinde kalıyor ve ayarladıkları hiçbir şey değişmiyor" }] },
    "a.delay-update": { headline: "Orijinal taahhüdü, güncel tahmini veya güvenilir bir tahminin bulunmadığı gerçeğini ve hâlâ neyin borçlu olduğunu açıkça belirt. Kayıtta gerçek olup bekleyen kişi için görünmez kalan bir gecikme, bu sürecin önlemek için var olduğu başarısızlıktır - ve bu, tolerans içindeyken de geçerlidir, çünkü tolerans bize aittir, onlara değil" },
    "c.threshold": { headline: "Gecikme kabul edilebilir eşiği aşıyor mu?", edges: [{ label: "Tolerans içinde", detail: "yeni zamanlama hâlâ taahhüdün veya politikanın kabul ettiği sınırlar içinde" }, { label: "Tolerans dışında", detail: "gecikme, taahhüdün veya politikanın kabul ettiği sınırı aştı" }] },
    "w.resume": { headline: "ifa devam edene veya tamamlanana kadar", detail: "zaman aşımı süresi: Revize edilmiş ufuk. (fulfillment_delay.resume içinden yapılandırın)" },
    "c.choice": { headline: "Karşı tarafın vereceği bir karar var mı?", edges: [{ label: "Onlar seçiyor", detail: "gerçek seçenekler mevcut ve aralarındaki seçim onlara ait" }, { label: "Sunacak bir şey yok", detail: "aralarında anlamlı bir seçim yapabilecekleri hiçbir seçenek yok" }] },
    "x.resumed": { headline: "gecikmiş yükümlülük revize edilmiş taahhüdüne karşı yeniden devam etti veya tamamlandı", detail: "revize edilmiş taahhüde karşı sonraki bir kayma kendi örneğini açar" },
    "h.escalate": { headline: "Sorumluluk yükseltme → üst merci → çözüm veya iade", detail: "sunacak bir şey olmadan tolerans dışına çıkan ya da revize edilmiş ufkunu aşan bir gecikme" },
    "a.offer": { headline: "Sunmadan önce yükümlülüğün yeniden devam etme durumunu yeniden oku - bu seçim değerlendirilirken yeniden devam etmiş bir yükümlülüğe iptal veya yeniden planlama seçeneği sunulmaz. Fiilen mevcut olan seçenekleri sun - bekleme, yeniden planlama, bir alternatif veya iptal. Yerine getirilemeyecek bir seçenek sunmak hiç sunmamaktan daha kötüdür, çünkü bir gecikmeyi bozulmuş ikinci bir vaade dönüştürür" },
    "a.no-choice-update": { headline: "Gecikmenin taahhüt edilenin ötesine geçtiğini, şu anda kendilerine sunulabilecek bir seçenek olmadığını ve durumun bırakılmak yerine üst mercie yönlendirildiğini belirt. Sessizce üst mercie yönlendirmek, en çok şeyin olduğu tam da o anda alıcıya hiçbir şey olmadığı izlenimini verir" },
    "w.decision": { headline: "kişi sunulan seçimi yapana kadar", detail: "zaman aşımı süresi: Karar penceresi. (fulfillment_delay.decision içinden yapılandırın)" },
    "c.decision": { headline: "Ne seçtiler?", edges: [{ label: "Bekleme", detail: "revize edilmiş zamanlamayı kabul ediyorlar" }, { label: "Yeniden planlama", detail: "farklı bir tarih veya pencere istiyorlar" }, { label: "Bir alternatif", detail: "bunun yerine farklı bir şey almayı kabul ederler" }, { label: "İptal", detail: "artık istemiyorlar" }] },
    "a.reschedule": { headline: "Yeniden planlanan taahhüdü, öncekinin yerine geçmek yerine geçmişe eklenerek kaydet" },
    "h.exception": { headline: "İfa istisnası → teşhis → kurtarma, ikame veya başarısızlık", detail: "karşı tarafın beklemek yerine bir alternatifi seçmesi" },
    "h.cancel": { headline: "İfa iptali → gelecekteki işi durdurma → kaynakları serbest bırakma → mutabakat", detail: "karşı tarafın beklemek yerine iptal etmesi" },
  },
  },
  "FUL-147": {
  shortName: "Teslimat Sonucu Takibi",
  name: "Sevkiyat veya devir → takip → teslim edildi, başarısız veya bilinmiyor",
  purpose: "Yükümlülük bize ait ve açık kalmaya devam ederken, yürütmeyi teslimatı gerçekleştirecek tarafa devretmek.",
  nodes: {
    "t.handoff": { headline: "İfa, teslimat yürütücüsüne devredildi" },
    "a.persist": { headline: "Devir kimliğini, yürütücüyü, alıcıyı ve hedefi, devir zamanını, varsa takip referansını ve beklenen teslimat penceresini kaydet. TESLİMATTA durumunu kaydet - sevk edilmiş olmak teslim edilmiş olmak anlamına gelmez ve yükümlülük bu süre boyunca çözülmemiş kalır" },
    "w.delivery": { headline: "teslimat yürütücü veya alıcı tarafından onaylanana, teslimat denemesinin başarısız olduğu teyit edilene ya da yürütücü önemli bir gecikme bildirene kadar", detail: "zaman aşımı süresi: Beklenen teslimat penceresi artı toleransı. (dispatch_and.delivery içinden yapılandırın)" },
    "c.outcome": { headline: "Ne bildirildi?", edges: [{ label: "Teslim edildi", detail: "yürütücü, alıcının bunu teslim aldığını yetkili şekilde teyit ediyor" }, { label: "Deneme başarısız", detail: "yürütücü bir deneme yapıldığını ve teslimatın gerçekleşmediğini teyit ediyor" }, { label: "Gecikti", detail: "yürütücü, teslimatın pencereden daha geç olacağını bildiriyor" }] },
    "a.unknown": { headline: "TESLİMAT_BİLİNMİYOR durumunu kaydet. Ara bir takip güncellemesi nihai bir sonuç değildir ve yürütücünün sessizleşmesi ürünün nerede olduğu hakkında hiçbir şey söylemez. Bu durum bilinmediği sürece hiçbir şey yeniden yürütülmez, çünkü bilinmeyen bir duruma karşı yeniden gönderim yapmak ürünün iki adet oluşmasına yol açar" },
    "h.confirm": { headline: "Teslimat teyidi → kabul veya itiraz penceresi → sonuçlandırma", detail: "yetkili bir teslimat teyidi" },
    "h.failed": { headline: "Teslimat denemesi başarısız → neden → yeniden deneme, düzeltme, alternatif veya iade", detail: "başarısız olduğu teyit edilmiş bir teslimat denemesi" },
    "h.delay": { headline: "İfa gecikmesi → taahhüdü yeniden hesaplama → devam, yeniden planlama veya üst mercie yönlendirme", detail: "yürütücünün teslimatın daha geç olacağını bildirmesi" },
    "h.reconcile": { headline: "external:external-status-reconciliation", detail: "sonucu belirlenemeyen bir teslimat" },
  },
  },
  "FUL-148": {
  shortName: "Başarısız Teslimat Kurtarma",
  name: "Teslimat denemesi başarısız → neden → yeniden deneme, düzeltme, alternatif veya iade",
  purpose: "Başarısız bir teslimatı, neden başarısız olduğuna göre ve sınırlı sayıda deneme içinde kurtarmak.",
  nodes: {
    "t.failed": { headline: "Yetkili teslimat denemesi başarısızlığı" },
    "a.classify": { headline: "Başarısızlığı, yürütücünün fiilen bildirdiği sınıfa göre sınıflandır. Reddedilme ve bulunamama farklı sonuçlardır - biri alıcının bir kararı, diğeri ise bir yokluktur; ilkini ikinci gibi ele almak, zaten hayır demiş birine tekrar tekrar teslimat denemeye devam etmek anlamına gelir" },
    "c.class": { headline: "Ne tür bir başarısızlıktı?", edges: [{ label: "Düzeltilebilir bilgi gerekiyor", detail: "hedef yanlış ya da erişimi, bilgiyle çözülebilecek bir şekilde engellenmiş" }, { label: "Yeniden deneme güvenli", detail: "alıcıya ulaşılamadı, zaman penceresi kaçırıldı ya da yürütücünün kendisi başarısız oldu" }, { label: "Alıcı reddetti", detail: "reddetme yetkisi olan biri bunu yaptı" }, { label: "Hasarlı", detail: "ulaşan şey, teslim edilmesi gereken şey değil" }, { label: "Kullanılabilir bir neden verilmedi", detail: "yürütücü, bir eyleme dönüştürülemeyecek bir başarısızlık bildirdi" }] },
    "a.correct": { headline: "Tam olarak gereken düzeltmeyi talep et - adres, erişim talimatı, iletişim bilgisi. Neyin eksik olduğunu belirtmek onu düzeltilebilir kılar; teslimatın başarısız olduğuna dair genel bir bildirim ise alıcıyı tahmin etmeye zorlar" },
    "c.budget": { headline: "Sınırlı politika dahilinde bir yeniden deneme hakkı var mı?", edges: [{ label: "Deneme hakkı kaldı", detail: "politikanın deneme sınırına ulaşılmadı" }, { label: "Tükendi", detail: "deneme sınırına ulaşıldı" }] },
    "h.return": { headline: "Tamamlama sonrası sorun → doğrulama → çözüm yolu", detail: "tamamlanamayan bir teslimat - reddedilmiş, düzeltilemez ya da deneme hakkı tükenmiş" },
    "h.exception": { headline: "İfa istisnası → teşhis → kurtarma, ikame veya başarısızlık", detail: "hasarlı ulaşan bir ürün" },
    "w.correction": { headline: "alıcı istenen düzeltmeyi sağlayana kadar", detail: "zaman aşımı süresi: Düzeltme, sınırlı politika dahilinde bir yeniden deneme hâlâ mümkün olduğu sürece beklenir; bu sürenin ötesinde teslimat iade sürecine gider. (delivery_attempt.correction içinden yapılandırın)" },
    "c.alternate": { headline: "Alternatif bir güzergâh, aynısını tekrar denemekten daha iyi sonuç verir mi?", edges: [{ label: "Alternatif daha iyi ve politika buna izin veriyor", detail: "bir teslim alma noktası, farklı bir pencere veya başka bir yürütücü başarılı olma ihtimali daha yüksek ve politika bu değişikliğe sormadan izin veriyor" }, { label: "Alternatif daha iyi ama seçim alıcıya ait", detail: "bu değişiklik, alıcının nerede veya ne zaman hazır bulunması gerektiğini değiştirir; politika bunu onlar adına karar vermemize izin vermez" }, { label: "Aynı güzergâhı yeniden dene", detail: "orijinal güzergâh en iyi seçenek olmaya devam ediyor" }] },
    "a.alternate": { headline: "Yetkilendirilmiş alternatif güzergâhı kullan; bunu yeni bir yükümlülük değil, güzergâh değişikliği olarak kaydet. Bu değişikliğe ya politika izin verdiği ya da alıcı bunu seçtiği için ulaşıldı - yetki, güzergâh değişmeden önce vardır" },
    "a.offer-route": { headline: "Somut alternatifleri alıcının önüne koy - teslim alma noktası, farklı pencere, başka bir yürütücü - ve hangisini istediğini sor; deneme bütçesinin her iki durumda da sıfırlanmadığını belirt. Birinin nerede bulunması gerektiğini sormadan değiştirmek, onlar adına alınmış bir karardır" },
    "a.reattempt": { headline: "Yeni bir bütçe yerine kalan deneme bütçesine karşı sınırlı yeniden denemeyi planla" },
    "x.reattempt-scheduled": { headline: "yeni bir deneme planlandı; kalan bütçeye karşı ya da politikanın onayladığı bir alternatif güzergâh üzerinden", detail: "yine başarısız olan bir sonraki deneme kendi teslimat denemesine karşı kendi örneğini açar" },
    "w.route-choice": { headline: "alıcı bir alternatif güzergâh seçene ya da tüm alternatifleri reddedene kadar", detail: "zaman aşımı süresi: Alternatif seçimi, sınırlı politika dahilinde bir yeniden deneme hâlâ mümkün olduğu sürece beklenir; yanıtsız kalan bir seçim aynı güzergâhın yeniden denenmesine yol açar. (delivery_attempt.route_choice içinden yapılandırın)" },
    "c.route-answer": { headline: "Alıcı ne dedi?", edges: [{ label: "Bir alternatif seçti", detail: "sunulan güzergâhlardan birini belirtti" }, { label: "Hepsini reddetti", detail: "sunulan güzergâhların hiçbiri kendisine uygun değil ve bunu belirtti" }] },
  },
  },
  "FUL-149": {
  shortName: "Teslimat Kabulü Sonuçlandırma",
  name: "Teslimat teyidi → kabul veya itiraz penceresi → sonuçlandırma",
  purpose: "Bu farkın iş açısından bir anlam taşıdığı her yerde, 'ulaşmış olmak' ile 'doğru ulaştığının kabul edilmiş olması'nı birbirinden ayırmak.",
  nodes: {
    "t.delivered": { headline: "Yetkili teslimat tamamlanması" },
    "a.record": { headline: "Teslimat kanıtıyla birlikte TESLİM_EDİLDİ durumunu kaydet; bu kanıt, sonrasında gelecek herhangi bir sonuçlandırma tarafından yerinden edilmek yerine teslimat geçmişine bağlı kalır" },
    "c.acceptance": { headline: "Bu ifa açık bir kabul gerektiriyor mu?", edges: [{ label: "Kabul gerekli", detail: "sözleşme ya da işin niteliği, alıcının bunun doğru olduğunu onaylaması gerektiği anlamına gelir" }, { label: "Kabul gerekli değil", detail: "teslimatın kendisi yükümlülüğü sona erdirir" }] },
    "w.acceptance": { headline: "alıcı teslim edileni kabul edene ya da teslimatla ilgili bir sorun bildirene kadar", detail: "zaman aşımı süresi: Sözleşme veya politika tarafından tanımlanan kabul son tarihi. (delivery_acceptance.acceptance içinden yapılandırın)" },
    "c.window": { headline: "Politika, teslimat sonrası bir itiraz penceresi tanımlıyor mu?", edges: [{ label: "Bir pencere var", detail: "politika, alıcıya bir sorunu bildirmesi için tanımlı bir süre tanır" }, { label: "Tanımlı bir pencere yok", detail: "politika, tamamlanmayı teslimat anında tanımlar" }] },
    "c.response": { headline: "Alıcı ne yaptı?", edges: [{ label: "Kabul etti", detail: "doğru olduğunu teyit etti" }, { label: "Sorun bildirdi", detail: "bir şeyin yanlış olduğunu söylüyor" }] },
    "a.finalize": { headline: "SONUÇLANDIRILDI durumunu kaydet. Bu, ifa ilişkisini kapatır ve politikanın sonrasında bağımsız olarak sağladığı hakları ortadan kaldırmaz - bir garanti, yasal bir iade süresi ya da bir hizmet güvencesi sonuçlandırmadan sonra da geçerliliğini korur ve bu durumun ölçtüğü şey bunlar değildir" },
    "w.window": { headline: "alıcı teslimatla ilgili bir sorun bildirene kadar", detail: "zaman aşımı süresi: İtiraz penceresinin kapanması. (delivery_acceptance.window içinden yapılandırın)" },
    "h.issue": { headline: "Tamamlama sonrası sorun → doğrulama → çözüm yolu", detail: "geçerli bir teslimat sonrası pencere içinde bildirilen bir sorun" },
    "x.finalized": { headline: "SONUÇLANDIRILDI; yükümlülük sona erdi ve kalan kapsam sıfır", detail: "politikanın bağımsız olarak sağladığı sonraki haklar kendi koşulları içinde kullanılır ve bu durumu yeniden açmaz" },
  },
  },
  "FUL-150": {
  shortName: "İfa İptali Mutabakatı",
  name: "İfa iptali → gelecekteki işi durdurma → kaynakları serbest bırakma → mutabakat",
  purpose: "Zaten gerçekleşmiş olan her şeyi korurken, bir yükümlülükten geriye kalanı durdurmak.",
  nodes: {
    "t.effective": { headline: "İfa iptali yürürlüğe girdi" },
    "a.record": { headline: "İptal kaynağını, nedeni, yürürlük zamanını ve üç kapsamı ayrı ayrı kaydet - tamamlanmış olan, devam etmekte olan ve henüz başlamamış olan. Bunlar süreç boyunca farklı şekilde ele alınır; bunları birleştirmek ya teslim edilmiş işi yok sayar ya da hiçbir şeyi iptal etmemiş olur" },
    "a.stop": { headline: "Hâlâ durdurulabilecek gelecekteki işi durdur; bu, başlamamış kısım ve güvenle durdurulabilecek devam eden işlerle sınırlıdır" },
    "a.release": { headline: "Bu yükümlülüğün artık ihtiyaç duymadığı tahsis ve rezervasyonları, yalnızca kendisiyle sınırlı olacak şekilde serbest bırak. Paylaşılan bir tahsise veya başka bir yükümlülüğün talebine uzanan bir serbest bırakma işlemi, hâlâ devam eden işten kapasite alır" },
    "c.completed": { headline: "Herhangi bir kapsam zaten tamamlandı mı?", edges: [{ label: "Bir kısmı tamamlandı", detail: "iptal yürürlüğe girmeden önce yükümlülüğün bir kısmı karşılandı" }, { label: "Hiçbir şey tamamlanmadı", detail: "hiçbir kapsam karşılanmadı" }] },
    "a.preserve": { headline: "Tamamlanan kapsamı koru. İptal, geriye kalanı durdurur; teslim edileni hiç olmamış gibi göstermez ve bunu silen bir kayıt, alıcının fiilen elinde olanla mutabık kılınamaz" },
    "c.dispatched": { headline: "Bunun bir kısmı zaten bir teslimat yürütücüsüne devredildi mi?", edges: [{ label: "Zaten sevk edildi", detail: "bir şey bir taşıyıcı veya yürütücüde ve hâlâ ulaşabilir" }, { label: "Hiçbir şey sevk edilmedi", detail: "hiçbir şey elimizden çıkmadı" }] },
    "a.intercept": { headline: "Desteklenen yerlerde durdurma veya iade yolunu belirle ve başlat. Desteklenmediği durumlarda ürün teslimatını tamamlar ve iade daha sonra gerçekleşir - bir iptal bir teslimat aracının içine uzanamaz; bunun tersini varsaymak, kimsenin kaydetmediği beklenmedik bir teslimatla sonuçlanır" },
    "c.external": { headline: "İptalde harici bir bağımlılık var mı?", edges: [{ label: "Harici taraf dahil", detail: "iptalin gerçek olması için bir tedarikçi, yürütücü veya sağlayıcının harekete geçmesi gerekiyor" }, { label: "Yalnızca dahili", detail: "sistemlerimizin dışında hiçbir şeyin değişmesi gerekmiyor" }] },
    "a.verify": { headline: "İptalin harici tarafta fiilen yürürlüğe girdiğini varsaymak yerine doğrula. Bizim sistemimizin kabul ettiği ama onlarınkinin kabul etmediği bir iptal, yine de iptal ettiğimiz şeyi ortaya çıkarır" },
    "c.financial": { headline: "İptalin mali bir sonucu var mı?", edges: [{ label: "Para söz konusu", detail: "artık teslim edilmeyecek bir kapsam için ödeme yapılmış ya da iptalin kendisine bir ücret uygulanıyor" }, { label: "Mali bir sonuç yok", detail: "hiçbir ödeme yapılmadı ya da yapılan ödeme teslim edilenle eşleşiyor" }] },
    "h.financial": { headline: "İade talebi → uygunluk → onay, ret veya inceleme", detail: "mali sonucu olan bir iptal" },
    "x.cancelled": { headline: "iptal edildi; kalan yükümlülük durduruldu, tamamlanan kapsam korundu", detail: "kalan yükümlülük, iptal edilen kapsam için açıkça sıfırdır ve teslim edilen her şey için değişmeden kalır. Aynı şey için yeni bir talep, yeni bir yükümlülüktür" },
  },
  },
  "FUL-265": {
  shortName: "Teslimat Takibi",
  name: "Sevkiyat → takip → teslim edildi → kabul edildi veya itiraz edildi",
  purpose: "Alıcıyı, yürütmenin elimizden çıktığı andan, yükümlülüğün doğru şekilde yerine getirildiğini kabul ettiği ana kadar taşımak - çünkü 'ulaşmış olmak' ile 'doğru ulaştığının kabul edilmesi' iki ayrı olgudur ve bunlardan yalnızca biri kaynağını alıcıdan alır.",
  nodes: {
    "t.dispatched": { headline: "Yükümlülük teslimat yürütücüsüne devredildi" },
    "a.dispatch": { headline: "Yolda olduğunu, beklenen pencereyle ve gerçekten kendisine eşlik eden referansla birlikte belirt. Bir referans yoksa, uydurmak yerine bunu açıkça söyle - hiçbir şeye çıkmayan bir bağlantı, dürüst bir yokluktan daha pahalıya mal olur" },
    "w.delivery": { headline: "teslimat yürütücü veya alıcı tarafından onaylanana, teslimat denemesinin başarısız olduğu teyit edilene ya da yürütücü önemli bir gecikme bildirene kadar", detail: "zaman aşımı süresi: Sevk kaydından alınan, yürütücünün kendi beklenen penceresi; yetkili bir rapor olmadan bu sürenin geçmesi, hiçbir zaman teslim edildiği varsayılmayan, mutabakatı yapılması gereken bir ulaşmama durumudur. (dispatch_to.delivery içinden yapılandırın)" },
    "c.delivery": { headline: "Yürütücü yetkili olarak ne bildirdi?", edges: [{ label: "Revize edilmiş bir pencere bildirildi", detail: "yürütücü henüz bir başarısızlığı teyit etmeden, teslimatın son bildirilen pencereden daha geç olacağını bildiriyor" }, { label: "Teslim edildi", detail: "ara bir takip hareketi değil, nihai bir teslimat teyidi mevcut" }, { label: "Teslim edilmedi", detail: "teyit edilmiş bir başarısızlık ya da nihai bir sonuç olmadan geçmiş bir pencere" }] },
    "a.revised": { headline: "Yürütücünün şu anda bildirdiği revize edilmiş pencereyi, bir kez olmak üzere belirt. Aynı yükümlülük üzerinde ikinci bir revizyon üçüncü bir anlatı değildir - pencereyi tutamayan bir yürütücü anlamına gelir ve yükümlülük kurtarmaya taşınır" },
    "a.no-arrival": { headline: "Ulaşmadığını söyle ve bunun hangisi olduğunu belirt - teyit edilmiş bir başarısızlık mı yoksa gözden kaybettiğimiz bir yürütücü mü. Bilinmeyen bir durumu başarısızlık olarak adlandırmak, orijinaliyle birlikte ulaşan bir yedek üretilmesine yol açar" },
    "a.arrived": { headline: "Ulaştığını ve bunun kanıtının ne olduğunu teyit et. Teslimat kanıtı yürütücüye dair bir gerçektir ve bunu belirtmek, hafıza tazeyken alıcının buna itiraz edebilmesini sağlar" },
    "h.no-arrival": { headline: "Teslimat denemesi başarısız → neden → yeniden deneme, düzeltme, alternatif veya iade", detail: "teyit edilmiş bir ulaşmama durumu, yükümlülüğün daha fazla beklemek yerine aktif kurtarmaya ihtiyaç duyacak kadar uzun süre sessiz kalan bir yürütücü ya da aynı yükümlülük üzerinde ikinci bir revize edilmiş pencere" },
    "c.acceptance": { headline: "Kabulün burada herhangi bir sonucu var mı?", edges: [{ label: "Kabul anlamlı", detail: "politika, buna bağlı bir şeyin olduğu bir kabul veya itiraz penceresi tanımlıyor" }, { label: "Teslimat sürecin sonu", detail: "tanımlı bir kabul penceresi yok, dolayısıyla istenecek bir şey yok" }] },
    "a.accept-request": { headline: "Doğru şekilde ulaştığını teyit etmelerini ya da bir sorun bildirmelerini iste ve hangi tarihten sonra kabul edilmiş sayılacağını belirt. Bu tarihi belirtmek, sessizliğin kendilerine yapılan bir şey değil, kendi seçtikleri bir şey anlamına gelmesini sağlar" },
    "x.delivered": { headline: "teslim edildi; kabul gerekmedi", detail: "aynı alıcıya yönelik daha sonraki bir yükümlülük yeni bir örnektir" },
    "w.acceptance": { headline: "alıcı teslim edileni kabul edene ya da teslimatla ilgili bir sorun bildirene kadar", detail: "zaman aşımı süresi: Politikanın tanımladığı kabul penceresi. (dispatch_to.acceptance içinden yapılandırın)" },
    "c.response": { headline: "Alıcı ne dedi?", edges: [{ label: "Kabul etti", detail: "alıcı, doğru şekilde ulaştığını açıkça teyit etti" }, { label: "Sorun bildirildi", detail: "alıcı, ulaşan şeyin yanlış, eksik veya hasarlı olduğunu söylüyor" }] },
    "a.finalize": { headline: "Süre dolumuyla oluşan kabulü, mutabakatla oluşan kabulden ayırt edilebilir şekilde kaydet. Biri alıcının doğru olduğunu söylemesi, diğeri kimsenin hiçbir şey söylememesidir; bu ikisini ayırt edemeyen bir rapor, sahip olmadığı bir memnuniyeti raporluyor demektir" },
    "x.accepted": { headline: "alıcı tarafından kabul edildi", detail: "politikanın sonrasında bağımsız olarak sağladığı haklar buradan işlemez" },
    "h.issue": { headline: "Teslimat teyidi → kabul veya itiraz penceresi → sonuçlandırma", detail: "alıcının kabul penceresi içinde itiraz ettiği, teslim edilmiş bir yükümlülük" },
    "x.finalized": { headline: "açık bir kabul olmaksızın kabul penceresinin dolmasıyla sonuçlandırıldı", detail: "daha sonra bildirilen bir sorun, bu pencereye değil, politikanın bağımsız olarak sağladığı hangi hakka bağlıysa ona göre işler" },
  },
  },
  "FUL-276": {
  shortName: "İkame Onayı",
  name: "İkame gerekli → alternatif sunma → kabul edildi, reddedildi veya süresi doldu",
  purpose: "Yükümlülüğün kendisine verildiği kişinin önüne, gerçek bir reddetme yolu ve belirtilmiş bir son tarihle birlikte tanımlı bir alternatif koymak; böylece 'nasılsa aldırmazlar' varsayımıyla asla farklı bir şey tedarik edilmez.",
  nodes: {
    "t.substitute": { headline: "Tanımlı bir alternatifle ikame gerekiyor" },
    "c.reachable": { headline: "Karar vermeleri için zamanında ulaşacak izin verilen bir kanal var mı?", edges: [{ label: "Ulaşılabilir", detail: "en az bir iletişim noktası geçerli, bu tür bir hizmet bildirimi için izin verilmiş ve karar penceresi içinde ulaşıyor" }, { label: "Ulaşılamıyor", detail: "izin verilen hiçbir kanal, pencere kapanmadan önce ulaşamaz" }] },
    "a.offer": { headline: "Tedarik edilemeyeni belirt, tek alternatifi ve farkı açık terimlerle adlandır, teklifin bittiği tarihle birlikte açık kabul ve reddetme yolları sun. Kabul yolundan daha zor bulunan bir reddetme yolu, bir seçenek değildir" },
    "h.unreachable": { headline: "Kanal ulaşılabilirlik değişikliği → erişilebilirliği yeniden hesaplama → yönlendirme veya bastırma", detail: "penceresi kapanmadan izin verilen hiçbir kanalda iletilemeyen bir ikame teklifi" },
    "w.decision": { headline: "ikame onaylanana ya da ikame reddedilene kadar", detail: "zaman aşımı süresi: Pencere içinde bir hatırlatmanın hâlâ işleme konulabileceği nokta. (substitution_offer.decision içinden yapılandırın)" },
    "c.answer": { headline: "Ne yanıt geldi?", edges: [{ label: "Kabul edildi", detail: "alıcı alternatifi açıkça kabul etti" }, { label: "Reddedildi", detail: "alıcı bunu açıkça reddetti" }] },
    "a.remind": { headline: "Aynı alternatifi, aynı iki yolu ve teklifin kapanacağı kesin tarihi belirten tek bir hatırlatma gönder. İkinci bir hatırlatma yoktur - kimsenin yapmak istemediği bir seçim, tekrar sorularak kolaylaşmaz" },
    "a.confirm-accept": { headline: "Artık neyin, hangi şartlarla tedarik edileceğini ve yükümlülüğün geri kalanında neyin değişmediğini teyit et. Bir ikameyi kabul etmek yeni bir vaat oluşturur ve bu, eskisinin devamı gibi değil, yeni bir vaat olarak ifade edilir" },
    "a.confirm-decline": { headline: "Reddi teyit et, etkilenen kapsam için yükümlülüğün açık ve ifa edilmemiş kaldığını belirt ve sırada ne olacağını adlandır. Bir ret, bir iptal değildir ve asla iptal olarak kaydedilmemelidir" },
    "w.final": { headline: "ikame onaylanana ya da ikame reddedilene kadar", detail: "zaman aşımı süresi: Hatırlatmadan sonra teklif, belirtilen kapanış tarihine kadar açık kalır ve daha fazla değil; o tarihte sessizlik teklifin süresini doldurur ve hiçbir şey ikame edilmez. (substitution_offer.final içinden yapılandırın)" },
    "x.accepted": { headline: "alternatif kabul edildi ve onaylandı", detail: "aynı yükümlülük üzerindeki ek bir istisna, kendi teklifiyle yeni bir örnektir" },
    "x.declined": { headline: "alternatif reddedildi, etkilenen kapsam hâlâ borçlu", detail: "daha sonra bulunan farklı bir alternatif yeni bir tekliftir" },
    "a.lapse": { headline: "Teklifi kapat, alternatifi serbest bırak ve hiçbir şeyin ikame edilmediğini, etkilenen kapsamın hâlâ açık olduğunu açıkça belirt. Bir pencerenin sonundaki sessizlik onay olarak okunur - bir ikamenin asla dayanmaması gereken şey tam olarak budur" },
    "x.lapsed": { headline: "teklifin süresi kararsız şekilde doldu, etkilenen kapsam hâlâ açık", detail: "daha sonra belirlenen yeni bir alternatif yeni bir teklif başlatır" },
  },
  },
  "IDN-270": {
  shortName: "Hesap Kurtarma",
  name: "Hesap kurtarma başlatıldı → kontrol kanıtı → erişim geri yüklendi veya pencere kapandı",
  purpose: "Kimlik doğrulaması yapamayan bir kişiyi, kurtarmanın gerçekte gerektirdiği kanıt üzerinden, belirtilen bir pencere içinde ve yerini aldığı oturum açma işleminden daha zayıf olmayan bir yolla ilerlet.",
  nodes: {
    "t.recovery": { headline: "Hesap kurtarma vakası açıldı" },
    "c.incident": { headline: "Bu hesap zaten açık bir güvenlik olayı altında mı?", edges: [{ label: "Olay açık", detail: "bu hesapta bir ele geçirme sinyali veya güvenlik olayı devam ediyor" }, { label: "Temiz", detail: "hesapta açık bir olay yok ve bu sıradan bir erişim kaybı" }] },
    "h.security": { headline: "Şüpheli hesap ele geçirme → sınırla → doğrula → kurtar veya temizle", detail: "zaten açık bir ele geçirme sinyali altındaki bir hesapta yapılan kurtarma denemesi" },
    "a.issue": { headline: "Kurtarma yolunu, hesabın zaten sahip olduğu bir hedefe gönder ve tam olarak hangi kanıtın gerektiğini ve pencerenin ne zaman kapanacağını belirt. Talep eden herhangi bir hedefe gönderilen bir yol kurtarma değildir - kurtarmanın önlemek için var olduğu tam olarak budur" },
    "w.proof": { headline: "kontrol veya kimliğe ilişkin yeterli kanıt sunulana, talep sahibi normal kimlik doğrulamayla erişimini geri kazanana veya talep sahibi talebi geri çekene kadar", detail: "zaman aşımı: Pencere içinde, bir hatırlatmanın hâlâ harekete geçmeye zaman bırakacağı nokta. (configure account_recovery.proof)" },
    "c.proof": { headline: "Bekleyişi ne sonlandırdı?", edges: [{ label: "Kontrol kanıtlandı", detail: "temelin gerektirdiği kanıt sunuldu ve yeterli görüldü" }, { label: "Başka yolla çözüldü", detail: "talep sahibi normal yollarla tekrar giriş yaptı ya da vakayı geri çekti" }] },
    "c.remind": { headline: "Bir hatırlatma göndermeye hâlâ değer mi?", edges: [{ label: "Zaman kalıyor", detail: "eksik kanıtın üretilmesi için pencerede yeterli zaman kaldı ve bu vaka için henüz hatırlatma gönderilmedi" }, { label: "Fiilen kapandı", detail: "kanıtın zamanında ulaşması için pencerede çok az zaman kaldı" }] },
    "a.restored": { headline: "Kontrolün geri geldiğini doğrula ve bu süreçte neyin geçersiz kılındığını belirt - artık çalışmayacak oturumları ve kimlik bilgilerini. Nelerin kesildiği kendisine söylenmeyen bir kişi, bir sonraki reddedilmeyi ikinci bir ele geçirme olarak okur" },
    "x.moot": { headline: "kurtarma kullanılmadan kapandı", detail: "yeni bir talep yeni bir vaka açar; bu vaka devam ettirilmez" },
    "a.remind": { headline: "Aynı, zaten sahip olunan hedefe, son tarihi ve eksik kalan kanıtı belirten tek bir hatırlatma gönder. İkinci bir hatırlatma yoktur - kimsenin peşinden gitmediği bir kurtarma genellikle unutulmuş değil terk edilmiştir; bir güvenlik yolunda tekrar, başlı başına bir baskı taktiğidir" },
    "x.closed": { headline: "kurtarma penceresi yeterli kanıt olmadan kapandı", detail: "yeni bir talep yeni bir vaka ve yeni bir pencere açar; kapanan pencere asla uzatılmaz" },
    "x.restored": { headline: "kontrol geri yüklendi ve doğrulandı", detail: "aynı hesapta daha sonraki bir kurtarma vakası, kendi penceresine sahip yeni bir örnektir" },
    "w.final": { headline: "kontrol veya kimliğe ilişkin yeterli kanıt sunulana kadar", detail: "zaman aşımı: Hatırlatmanın ardından örnek, kurtarma penceresinin kendisi kapanana kadar bekler; pencere asla yeniden başlatılmaz. (configure account_recovery.final)" },
  },
  },
  "IDN-81": {
  shortName: "Kimlik Doğrulama",
  name: "Kimlik iddiası → kanıt → doğrulandı, reddedildi veya ek kanıt gerekiyor",
  purpose: "Belirli bir kimlik iddiasına, onu kuran kanıta bağlı kalarak güven oluşturmak.",
  nodes: {
    "t.required": { headline: "Kimlik doğrulaması gerekiyor" },
    "a.örnek": { headline: "Doğrulama örneğini tam olarak hangi iddiaya bağlı olduğunu belirterek oluştur - hangi öznitelik, hangi güvence düzeyinde, hangi amaçla - ve durumunu PENDING (BEKLEMEDE) olarak kaydet. Bir iddiaya bağlanmamış doğrulama hiçbir şeyi somut olarak doğrulamaz ve daha sonra her şeyi doğrulamış gibi okunur" },
    "c.evidence": { headline: "Gerekli kanıt zaten mevcut mu?", edges: [{ label: "Mevcut", detail: "bu iddia için bu güvence düzeyinde yeterli kanıt zaten elde" }, { label: "Henüz değil", detail: "iddia, elde bulunanlarla değerlendirilemez" }] },
    "a.validate": { headline: "Kanıtı bu iddianın kabul kurallarına göre doğrula ve işlem sürerken durumu UNDER_REVIEW (İNCELENİYOR) olarak kaydet" },
    "a.request": { headline: "Bu iddianın gerektirdiği asgari kanıtı talep et ve durumu EVIDENCE_REQUIRED (KANIT GEREKLİ) olarak kaydet. Kanıt, iddiayla sınırlıdır - ihtiyaçtan fazlasını toplamak güven değil sorumluluk yaratır; bir telefon numarasını doğrulamak için pasaport istemek, karşımızdaki kişiye aslında neyi kontrol ettiğimizi bilmediğimizi gösterir" },
    "c.result": { headline: "Doğrulama sonucunda ne belirlendi?", edges: [{ label: "Doğrulandı", detail: "kanıt, iddiayı gerekli güvence düzeyinde kanıtlıyor" }, { label: "Reddedildi", detail: "kanıt iddiayı kanıtlamıyor ve nedeni biliniyor" }, { label: "Belirsiz, ek kanıt yardımcı olur", detail: "iddia ne kanıtlanmış ne de çürütülmüş; ek kanıt konuyu netleştirebilir" }, { label: "İnsan değerlendirmesi gerekiyor", detail: "kanıtın bir kişi tarafından değerlendirilmesi gerekiyor" }] },
    "w.evidence": { headline: "iddiaya ilişkin talep edilen kanıt alınana kadar", detail: "zaman aşımı: Bu iddia için doğrulama zaman aşımı süresi. (configure identity_claim.evidence)" },
    "a.verified": { headline: "Bu iddiayı, kanıtın desteklediği güvence düzeyinde ve kapsadığı alanda, onu kuran kanıtla birlikte VERIFIED (DOĞRULANDI) olarak işaretle. Bir özniteliğin doğrulanması başka hiçbir şeyi doğrulamaz - doğrulanmış bir adres, doğrulanmış bir kimlik hakkında hiçbir şey söylemez; bu bağlama, birinin diğerinden çıkarılmasını önleyen şeydir" },
    "h.failure": { headline: "Doğrulama başarısızlığı → neden → tekrar dene, düzelt, incele veya çık", detail: "bir iddiaya karşı doğrulamanın başarısız olması" },
    "c.rounds": { headline: "Politika bir kanıt turu daha izin veriyor mu?", edges: [{ label: "Tur mevcut", detail: "bu iddia için kanıt talebi sayısı politika sınırının içinde" }, { label: "Sınıra ulaşıldı", detail: "iddia, politikanın izin verdiği kadar turdan geçti" }] },
    "h.review": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "otomatik doğrulamanın karara bağlayamadığı bir iddia" },
    "x.expired": { headline: "EXPIRED (SÜRESİ DOLDU); iddia hiç doğrulanmadı", detail: "aynı iddia için yeni bir doğrulama örneği açılabilir. Süresi dolmak reddedilmek değildir - iddiayı değerlendirip aleyhine karar veren olmadı" },
    "x.verified": { headline: "Bu iddia için, bu kapsam ve güvence düzeyinde VERIFIED (DOĞRULANDI)", detail: "farklı bir iddia kendi kanıtıyla doğrulanır; bu iddia ise kendi geçerliliği sona erdiğinde yeniden doğrulanır" },
    "a.request-more": { headline: "Konuyu netleştirecek belirli ek kanıtı, orijinal talebi tekrarlamak yerine neyin eksik olduğunu belirterek talep et" },
  },
  },
  "IDN-84": {
  shortName: "Doğrulama Kurtarma",
  name: "Doğrulama başarısızlığı → neden → tekrar dene, düzelt, incele veya çık",
  purpose: "Başarısız bir doğrulamayı, başarısız olma nedenine göre yönlendirmek ve kendi hatalarımızı müşterinin doğrulama kaydına yansıtmamak.",
  nodes: {
    "t.failed": { headline: "Doğrulama denemesi başarısız oldu" },
    "a.classify": { headline: "Başarısızlığı INSUFFICIENT_EVIDENCE (YETERSİZ KANIT), MISMATCH (UYUŞMAZLIK), UNREADABLE (OKUNAMADI), EXPIRED_EVIDENCE (KANITIN SÜRESİ DOLDU), TECHNICAL_FAILURE (TEKNİK ARIZA), POLICY_FAILURE (POLİTİKA İHLALİ), REVIEW_REQUIRED (İNCELEME GEREKLİ) veya UNKNOWN (BİLİNMİYOR) olarak sınıflandır. Bu sınıf yönlendirmeyi belirler, ama başka bir şeyi de belirler: kendi kesintimizi bir kimlik reddi olarak kaydetmek, bir kişiyi hiç deneyemediği bir kontrolü geçememiş gibi göstermektir" },
    "c.class": { headline: "Bu ne tür bir başarısızlıktı?", edges: [{ label: "Kişi bunu düzeltebilir", detail: "yetersiz kanıt, okunamayan kanıt veya süresi dolmuş kanıt" }, { label: "Bize ait ve geçici", detail: "bizim tarafımızda veya bir sağlayıcı tarafında teknik bir arıza" }, { label: "Bir kişi gerekiyor", detail: "bir uyuşmazlık, açık bir inceleme gerekliliği veya kimsenin sınıflandıramadığı bir başarısızlık" }, { label: "Politika gereği kesin", detail: "politika bu iddianın bu temelde doğrulanmasını tamamen yasaklıyor" }] },
    "c.retry-budget": { headline: "Bu iddia için tekrar deneme bütçesinde yer var mı?", edges: [{ label: "Tekrar denemeye yer var", detail: "bu iddiaya yönelik denemeler, güvenlik hassasiyetine göre belirlenen politika sınırının içinde" }, { label: "Bütçe tükendi", detail: "sınıra ulaşıldı - ama tekrarlanan başarısızlık, zorlanan gerçek bir kişinin de görünümüdür" }] },
    "c.technical-budget": { headline: "Geri çekilme bütçesi içinde güvenli bir tekrar deneme mümkün mü?", edges: [{ label: "Tekrar dene", detail: "başarısızlık geçici ve bütçede yer var" }, { label: "Israrcı", detail: "teknik arıza düzelmiyor" }] },
    "h.review": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "insan değerlendirmesi gerektiren bir başarısızlık" },
    "h.review-budget": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "bu iddia için tekrar deneme bütçesinin tükenmesi" },
    "a.explain-terminal": { headline: "Bu iddianın bu temelde doğrulanamayacağını belirt ve kabul edilebilecek bir temel varsa onu açıkça söyle. Doğrulama denemiş ve hiçbir yanıt almamış bir kişi bunu tekrar deneyecektir; her deneme, zaten geçemeyecek olan bir kişinin aleyhine bir başarısızlık kaydı oluşturur" },
    "a.explain": { headline: "Tam olarak neyin düzeltilmesi gerektiğini açıkla ve sınırlı bir tekrar deneme hakkı sun. Açıklama yapılmadan sunulan bir tekrar deneme, aynı denemenin tekrarlanmasına yol açar ve hiçbir şeyi iyileştirmeden bütçeyi tüketir" },
    "a.backoff": { headline: "Geri çekilme ile tekrar dene; kişinin doğrulama geçmişine hiçbir şey kaydetme. Bizim hatamız onun reddi değildir ve bu ayrım, bu geçmişi daha sonra okuyacak her sistemde korunmalıdır" },
    "a.ours": { headline: "Başarısızlığın bizim tarafımızdan kaynaklandığını, gönderdikleri hiçbir şeyin reddedilmediğini ve şu anda tekrar denendiğini belirt. Denemesinin kendi kesintimiz yüzünden başarısız olduğunu az önce gören bir kişi, bu söylenmezse biz tekrar denerken sessizlikle karşılaşır ve gayet geçerli kanıtları yeniden gönderir" },
    "h.escalate": { headline: "Sorumluluk yükseltme → üst makam → çözüm veya geri dönüş", detail: "düzelmeyen bir teknik arıza" },
    "x.terminal": { headline: "bu temelde doğrulama mümkün değil", detail: "farklı bir temel veya farklı bir iddia kendi koşullarına göre değerlendirilir; burada değişmesi gereken kanıt değil politikadır" },
    "x.retry": { headline: "sınırlı tekrar deneme mümkün; doğrulama örneği açık kalır", detail: "tekrar deneme aynı doğrulama örneğinin parçası olarak, aynı bütçeye karşı çalışır - yeni bir örnek sayacı sıfırlar, sınırlı bir tekrar deneme de böyle sınırsız hale gelir" },
  },
  },
  "IDN-85": {
  shortName: "Oturum Açma Doğrulaması",
  name: "Kimlik doğrulama zorlaması → doğrula, güçlendir veya reddet",
  purpose: "Bağlamın gerektirdiği güvence düzeyinde, karşımızdaki kişinin gerekli kimliği gerçekten kontrol ettiğini tespit etmek.",
  nodes: {
    "t.required": { headline: "Kimlik doğrulama gerekiyor" },
    "a.assurance": { headline: "Bu bağlamın gerektirdiği güvence düzeyini belirle. Güvence, işlemi kimin yaptığının değil, ne yapıldığının bir özelliğidir - kullanıcı bazında belirlemek, aynı anda hem sıradan bir oturumu gereğinden fazla zorlar hem de hassas bir oturumu yetersiz zorlar" },
    "c.sufficient": { headline: "Mevcut kimlik doğrulama gerekli düzeyi zaten karşılıyor mu?", edges: [{ label: "Yeterli", detail: "mevcut oturum gerekli güvence düzeyine sahip ve süresi dolmamış" }, { label: "Yetersiz", detail: "oturum yok, süresi dolmuş ya da bu bağlamın gerektirdiğinden daha düşük bir güvence düzeyinde" }] },
    "x.satisfied": { headline: "gerekli düzeyde zaten kimlik doğrulaması yapılmış", detail: "daha yüksek güvence gerektiren bir bağlam bunu yeniden açar. Kimlik doğrulanmış olmak, kişinin kim olduğunu söyler; ne yapmaya yetkili olduğu hakkında hiçbir şey söylemez" },
    "a.challenge": { headline: "Gerekli güvence düzeyine uygun zorlamayı başlat" },
    "w.auth": { headline: "kimlik doğrulama zorlaması başarılı olana veya başarısız olana kadar", detail: "zaman aşımı: Zorlama penceresi. (configure authentication_challenge.auth)" },
    "c.result": { headline: "Ne tespit edildi?", edges: [{ label: "Gerekli düzeyde doğrulandı", detail: "zorlama, bu bağlamın gerektirdiği güvence düzeyinde başarılı oldu" }, { label: "Gerekli düzeyin altında doğrulandı", detail: "kontrol, bağlamın gerektirdiğinden daha düşük bir güvence düzeyinde kuruldu" }, { label: "Başarısız", detail: "zorlama karşılanmadı" }] },
    "x.timeout": { headline: "zorlamaya yanıt verilmedi; hiçbir doğrulama yapılmadı ve kişinin aleyhine hiçbir kayıt oluşturulmadı", detail: "yeni bir deneme yeni bir zorlama başlatır" },
    "a.session": { headline: "Doğrulanmış oturumu, açık bir güvence düzeyi ve açık bir geçerlilik süresiyle oluştur veya güncelle. İkisi de sonraki adımlar için gerekli: düzey olmadan hiçbir şey güçlendirme talep edemez, geçerlilik süresi olmadan hiçbir şey oturumun süresinin dolduğuna karar veremez" },
    "h.stepup": { headline: "Güçlendirme gerekliliği → daha güçlü kimlik doğrulama → devam et veya reddet", detail: "kontrol, bağlamın gerektirdiğinden daha düşük bir güvence düzeyinde kuruldu" },
    "h.failure": { headline: "Kimlik doğrulama başarısızlığı örüntüsü → güvenlik kontrolü → kurtar veya kısıtla", detail: "bir kimlik doğrulama başarısızlığı" },
    "x.authenticated": { headline: "belirtilen güvence düzeyinde ve belirtilen geçerlilik süresi için doğrulandı", detail: "belirli bir eylem için yetkilendirme her seferinde ayrıca karara bağlanır - başarılı bir oturum açma, hesabın kontrolünü kanıtlar ama hiçbir yetkiyi kanıtlamaz" },
  },
  },
  "IDN-87": {
  shortName: "Kimlik Doğrulama Risk Değerlendirmesi",
  name: "Kimlik doğrulama başarısızlığı örüntüsü → güvenlik kontrolü → kurtar veya kısıtla",
  purpose: "Sıradan bir şifre unutma durumunu saldırı altındaki bir hesaptan ayırt etmek; birincisini ikincisine dönüştürmeden.",
  nodes: {
    "t.pattern": { headline: "Kimlik doğrulama başarısızlığı örüntüsü" },
    "a.evaluate": { headline: "Başarısızlıkların çevresindeki bağlamı değerlendir: ne hızla geldikleri, hangi cihazdan ve hangi bağlamdan geldikleri, bir kimlik bilgisi sıfırlamasının söz konusu olup olmadığı, örüntünün bilinen bir saldırıyla eşleşip eşleşmediği ve herhangi bir oturumun başarılı olup olmadığı. Bir modelin skoru işi sıralar ama hiçbir sonuca varmaz - üretilen şey incelenecek bir vakadır, bir saldırgan değil" },
    "c.assessment": { headline: "Kanıt gerçekte neyi destekliyor?", edges: [{ label: "Sıradan kullanıcı hatası", detail: "örüntü, şifresini unutmuş birine benziyor - insana özgü bir hız, tanıdık bir cihaz, başka hiçbir sinyal yok" }, { label: "Kişi girişi sağlayamıyor ve geri dönüş yoluna ihtiyacı var", detail: "meşru görünen tekrarlayan başarısızlıklar, normal kimlik doğrulama yoluyla ilerleme imkânı yok" }, { label: "Ciddi güvenlik riski", detail: "sıradan hatanın açıklayamayacağı hız, bağlam değişikliği veya saldırı biçimli davranış" }] },
    "x.normal": { headline: "sıradan başarısızlık örüntüsü; güvenliğe özgü hiçbir işlem uygulanmadı", detail: "alışılmış kurtarma yolları değişmeden açık kalır. Bunu bir saldırı gibi ele almak çoğunlukla meşru kişileri hesap dışında bırakır - bu dal, tam olarak bunu önlemek için var" },
    "h.recovery": { headline: "Hesap kurtarma talebi → kontrolü kanıtla → güvenli erişimi geri yükle", detail: "normal kimlik doğrulama yoluyla ilerleyemeyen, meşru görünen bir kullanıcı" },
    "a.restrict": { headline: "Kanıtın haklı çıkardığı en küçük kısıtlamayı uygula ve neyin bunu haklı çıkardığını kaydet. Bu kategorideki sinyallerin çoğu yanlış pozitiftir ve bunlar için kısıtlama, müşterinin gördüğü olayın tamamıdır" },
    "h.security": { headline: "Şüpheli hesap ele geçirme → sınırla → doğrula → kurtar veya temizle", detail: "sıradan hatanın açıklayamayacağı bir başarısızlık örüntüsü" },
  },
  },
  "IDN-88": {
  shortName: "Hesap Kurtarma Doğrulaması",
  name: "Hesap kurtarma talebi → kontrolü kanıtla → güvenli erişimi geri yükle",
  purpose: "Artık kimlik doğrulaması yapamadığı bir hesaba geri dönüş yolu sunmak; bu yolun, yerini aldığı yoldan daha zayıf olmamasını sağlamak.",
  nodes: {
    "t.recovery": { headline: "Hesap kurtarma başlatıldı" },
    "a.basis": { headline: "Mevcut kurtarma temelini belirle ve hesabın güncel güvenlik durumunu incele. Hesapta olan biten, kurtarmanın neler yapabileceğini değiştirir" },
    "c.incident": { headline: "Bu hesapta aktif bir ele geçirme veya güvenlik olayı var mı?", edges: [{ label: "Olay açık", detail: "bir ele geçirmeden şüpheleniliyor ya da doğrulandı ve sınırlama yürürlükte" }, { label: "Olay yok", detail: "hesaba sahibi tarafından erişilemiyor, başka bir şey değil" }] },
    "h.security": { headline: "Şüpheli hesap ele geçirme → sınırla → doğrula → kurtar veya temizle", detail: "açık bir güvenlik olayı sürerken gelen bir kurtarma talebi" },
    "a.evidence": { headline: "Yalnızca bu kurtarma temelinin gerektirdiği kanıtı topla. Kurtarma, normal kimlik doğrulamanın topladığından fazlasını toplama fırsatı değildir ve yerini aldığı erişime göre daha kolay bir yol olmamalıdır - kurtarma, normal kimlik doğrulamanın zaten başarısız olduğu durumlar için vardır ki bu da onu bir saldırganın önce yöneleceği kapı hâline getirir" },
    "w.proof": { headline: "kontrol veya kimliğe ilişkin yeterli kanıt sunulana ya da kurtarma denemesi başarısız olana kadar", detail: "zaman aşımı: Kanıt, kurtarma penceresi kapanana kadar beklenir; pencere tekrarlanan denemelerle yeniden başlatılmaz. (configure account_recovery.proof)" },
    "c.proof": { headline: "Kanıt, bu hesabın gerektirdiği güvence düzeyi için yeterli mi?", edges: [{ label: "Yeterli", detail: "talep sahibi, gerekli düzeyde kontrol veya hak sahipliğini ortaya koydu" }, { label: "Yetersiz", detail: "kanıt, gerekli düzeye ulaşmıyor" }] },
    "x.expired": { headline: "kurtarma penceresi yeterli kanıt olmadan kapandı", detail: "yeni bir kurtarma talebi kendi vakasını açar; bu vaka geçmişte kalır" },
    "a.invalidate": { headline: "Yeni bir şey oluşturmadan önce artık güvenli olmayan kimlik bilgilerini ve oturumları geçersiz kıl. Kurtarma sonrasında aktif bırakılan eski bir kimlik bilgisi, kurtarmanın tam olarak ortadan kaldırmak için var olduğu şeydir; sıralama önemlidir - önce yeni erişim verilirse ikisi de aynı anda canlı kalır" },
    "c.next": { headline: "Kanıt yetersizken politika neye izin veriyor?", edges: [{ label: "Ek kanıt", detail: "kurtarma temeli, pencere içinde kanıta giden başka bir yola izin veriyor" }, { label: "Manuel inceleme", detail: "sunulanı bir kişinin değerlendirmesi gerekiyor" }, { label: "Reddet", detail: "yeterli kanıta giden hiçbir yol kalmadı" }] },
    "a.replace": { headline: "Bu hesabın gerektirdiği güvence düzeyinde güvenli yedek erişim oluştur" },
    "x.more": { headline: "kurtarma penceresi içinde ek kanıt sunulabilir", detail: "aynı vaka devam eder; pencere başka bir denemeyle yeniden başlatılmaz" },
    "h.review": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "bir kişinin değerlendirmesi gereken kurtarma kanıtı" },
    "x.denied": { headline: "kurtarma reddedildi; hesap erişimi değişmedi", detail: "gerçekten yeni kanıt içeren yeni bir talep değerlendirilebilir; aynı kanıtı tekrarlamak yeni kanıt sayılmaz" },
    "a.verify": { headline: "Kurtarılan durumu doğrula: amaçlanan erişimin çalıştığını ve geçersiz kılınan kimlik bilgilerinin gerçekten artık çalışmadığını. İkinci kısım genellikle atlanan kısımdır" },
    "x.recovered": { headline: "mevcut hesabın güvenli kontrolü geri yüklendi", detail: "bu, tek bir hesabı kurtardı, hiçbir şeyi birleştirmedi. Aynı kişiye ait olduğu ortaya çıkan iki kimlik, farklı kanıt gerektiren farklı bir sorundur" },
  },
  },
  "IDN-89": {
  shortName: "Kimlik Özniteliği Güncellemesi",
  name: "Kimlik özniteliği değişikliği → gerekiyorsa doğrula → güncelle → yay",
  purpose: "Bir kimlik özniteliğini güvenli biçimde değiştirmek ve eski değere bağlı olan her şeyi miras yoluyla değil bağımsız olarak yeniden uzlaştırmak.",
  nodes: {
    "t.change": { headline: "Kimlik özniteliği değişikliği" },
    "a.sensitivity": { headline: "Özniteliğin hassasiyetini ve değişikliğin gerektirdiği doğrulamayı belirle. Görünen adı değiştirmek ile yasal adı değiştirmek aynı işlem değildir; kurtarma adresini değiştirmek de öyle" },
    "c.verification": { headline: "Bu değişiklik ek doğrulama gerektiriyor mu?", edges: [{ label: "Doğrulama gerekli", detail: "öznitelik hassas ya da hesaba geri dönüş için kendisi bir yol niteliğinde" }, { label: "Gerekli değil", detail: "özniteliğin güvenlik veya hukuki bir ağırlığı yok" }] },
    "a.verify": { headline: "Hesabın mevcut kontrolünü ve politikanın gerektirdiği durumlarda yeni özniteliğin kendisini doğrula. Canlı bir oturuma sahip bir saldırgan, yalnızca o oturumun gücüyle kurtarma adresini değiştirebilmemelidir" },
    "c.valid": { headline: "Değişikliğin kendisi geçerli mi?", edges: [{ label: "Geçerli", detail: "yeni değer düzgün biçimlendirilmiş, izin verilen ve başka bir kayıtla çelişmiyor" }, { label: "Geçersiz", detail: "değer kabul edilemiyor - hatalı biçimlendirilmiş, yasaklanmış ya da başka bir yerde zaten kayıtlı" }] },
    "w.verification": { headline: "doğrulama başarılı olana veya başarısız olana kadar", detail: "zaman aşımı: Bu değişiklik için doğrulama penceresi. (configure identity_attribute.verification)" },
    "a.update": { headline: "Yetkili kimlik kaydını güncelle; politikanın izin verdiği yerlerde önceki değeri, yeni değeri, ne zaman yürürlüğe girdiğini, kaynağını ve doğrulama kanıtı ile durumunu koru. Denetlenebilirliğin gerektiği yerlerde kimlik geçmişi sessizce üzerine yazılmaz - birinin ne olarak adlandırıldığı ve bunun ne zaman değiştiği, çoğu zaman sonradan sorulan asıl sorudur" },
    "x.rejected": { headline: "değişiklik geçersiz olarak reddedildi", detail: "düzeltilmiş bir değer gönderilebilir" },
    "c.verified": { headline: "Gerekli kontrol kuruldu mu?", edges: [{ label: "Doğrulandı", detail: "kontrol ve gerektiği yerlerde yeni öznitelik kuruldu" }, { label: "Doğrulanmadı", detail: "doğrulama başarılı olmadı" }] },
    "x.not-applied": { headline: "değişiklik uygulanmadı; öznitelik olduğu gibi kaldı", detail: "yeni bir talep kendi koşullarına göre doğrulanır. Hiçbir eksik kayıt yazılmadı, dolayısıyla hiçbir alt sistem hiç onaylanmamış bir değeri tutmuyor" },
    "a.propagate": { headline: "change_origin ve change_version bilgilerini taşıyarak bağımlı sistemlere yay; böylece geç gelen eski bir güncelleme önceki değeri geri getiremez" },
    "c.dependents": { headline: "Bu değişiklik kimlik bilgilerini, ulaşılabilirliği veya izinleri etkiliyor mu?", edges: [{ label: "Bağımlılar etkilendi", detail: "öznitelik bir kimlik bilgisi, bir iletişim noktası veya bir iznin temeli olarak kullanılıyor" }, { label: "Hiçbir şey buna bağlı değil", detail: "öznitelik yalnızca betimleyici" }] },
    "a.reconcile": { headline: "Her bağımlıyı bağımsız olarak yeniden değerlendir. Yeni bir e-posta adresi, eskisinin ne teslim edilebilirliğini ne de rızasını devralır - yeni adres, politika açıkça aksini söylemedikçe kendi ulaşılabilirlik durumu ve kendi izniyle, ikisi de boş olarak başlar. Eski değere bağlı kimlik bilgileri kendi koşullarına göre değerlendirilir, buna dayanan izinler de öyle" },
    "x.updated": { headline: "kimlik güncellendi; önceki değere bağlı hiçbir şey yoktu", detail: "aynı özniteliğe yapılacak bir sonraki değişiklik kendi hassasiyetine göre değerlendirilir" },
    "x.reconciled": { headline: "kimlik güncellendi; her bağımlı kendi koşullarına göre yeniden değerlendirildi", detail: "sonraki adımı her bağımlının kendi akışı belirler; ulaşılabilirlik, izin ve kimlik bilgisi yaşam döngüsü'ları farklı sahip ve kurallarla ayrı ayrı tetiklenir" },
  },
  },
  "IDN-90": {
  shortName: "Hesap Ele Geçirme Kurtarması",
  name: "Şüpheli hesap ele geçirme → sınırla → doğrula → kurtar veya temizle",
  purpose: "Konu hâlâ açıkken olası bir ele geçirmenin verebileceği zararı sınırlamak ve her iki yöne de gidebilecek bir sonuca ulaşmak.",
  nodes: {
    "t.signal": { headline: "Ciddi ele geçirme sinyali" },
    "a.scope": { headline: "Etkilenen kapsamı belirle - hangi oturumlar, hangi kimlik bilgileri, hangi hassas yetkinlikler. Buradaki asıl mesele kapsamdır, çünkü bu kategorideki sinyallerin çoğu yanlış pozitif çıkar ve bunlar için sınırlama, müşterinin gördüğü olayın tamamı olur" },
    "c.containment": { headline: "Kanıt, ihtiyati bir sınırlamayı haklı çıkarıyor mu?", edges: [{ label: "Şimdi sınırla", detail: "konu açıkken olabilecekler, meşru çıkan birini kısıtlamanın maliyetinden daha ağır basıyor" }, { label: "Kısıtlamadan araştır", detail: "sinyal araştırmayı gerektiriyor ama bu sırada engellenmesi gereken hiçbir şey yok" }] },
    "a.contain": { headline: "Etkilenen oturumları, kimlik bilgilerini ve hassas yetkinlikleri, kanıtın haklı çıkardığı en küçük kapsamda geçersiz kıl veya kısıtla. Sınırlama tasarım gereği geri alınabilir ve adli veya denetim geçmişini silmez - olanların kaydı, soruşturmanın elindeki tek şeydir" },
    "a.open": { headline: "Hiçbir şeyi kısıtlamadan güvenlik kurtarma durumunu aç; sınırlamanın değerlendirildiğini ve gerekli görülmediğini kaydet. Şüpheli olmak doğrulanmış olmak değildir; kayıt bunun hangisi olduğunu belirtir" },
    "w.resolution": { headline: "hesap sahibi doğrulanana veya güvenlik incelemesi sonuçlanana kadar", detail: "zaman aşımı: Bu olay sınıfı için çözüm SLA'sı. (configure suspected_account.resolution)" },
    "c.outcome": { headline: "Soruşturma neyi ortaya koydu?", edges: [{ label: "Ele geçirme doğrulandı", detail: "kanıt, yetkisiz erişimi ortaya koyuyor" }, { label: "Temizlendi", detail: "sahibi doğrulandı ve etkinlik açıklandı" }] },
    "c.inconclusive": { headline: "SLA, bir sonuca varılmadan geçti - şimdi ne olacak?", edges: [{ label: "Kapsamlı kısıtlamaya devam et", detail: "kanıt, çalışma sürerken mevcut kapsamda kısıtlamaya devam etmeyi hâlâ destekliyor" }, { label: "Manuel inceleme", detail: "otomatik yol hiçbir sonuç üretmediği için bir kişinin karar vermesi gerekiyor" }] },
    "a.confirmed": { headline: "Etkilenen kimlik bilgilerini ve oturumları iptal et, düzeltmenin geçerli olduğu yerlerde yetkisiz değişiklikleri düzelt. Yetkisiz finansal veya ticari işlemler burada düzeltilmez - her biri kendi kanıt kurallarına ve kendi yetkisine sahip kendi itiraz veya düzeltme sürecini taşır; bunları bir güvenlik olayından geri almak ikisini de atlamak olur" },
    "a.cleared": { headline: "Sinyali temizlendi olarak kaydet, güvenlik geçmişinde tut. Temizlenmiş bir şüphe bile görülen şeye ilişkin bir gerçektir; bunu silmek bir tekrarı ilk kez oluyormuş gibi gösterir - en çok yakalanması gereken örüntü de tam olarak budur" },
    "x.continued": { headline: "olay açık; kapsamlı kısıtlama sürüyor", detail: "soruşturma devam eder ve kendi sonucuna ulaşır. Şüpheli olan şüpheli kalır - daha uzun sürmesi onu doğrulanmış hâle getirmez" },
    "h.review": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "otomatik yolun kendi SLA'sı içinde çözemediği bir olay" },
    "h.recover": { headline: "Yetkinlik geri yükleme → yeniden doğrula → güvenle geri yükle", detail: "güvenli geri yüklemeye geçen doğrulanmış bir ele geçirme" },
    "h.lift": { headline: "Yetkinlik geri yükleme → yeniden doğrula → güvenle geri yükle", detail: "kısıtlamalarının kaldırılması gereken, temizlenmiş bir olay" },
  },
  },
  "INC-254": {
  shortName: "Olay Güncellemesi",
  name: "Olay iletişimi → etkilenen kitlenin belirlenmesi → bilgilendirme, güncelleme veya kapatma",
  purpose: "Gerçekten etkilenen kişilere, teslimatı zaten yöneten mekanizma üzerinden doğru ve işe yarar bir bilgi iletmek.",
  nodes: {
    "t.relevant": { headline: "Olay, iletişim gerektiren bir duruma ulaştı" },
    "a.determine": { headline: "Gerçekten kimlerin etkilendiğini, nelerin bilindiğini, nelerin henüz bilinmediğini, kullanıcının hangi eylemi gerçekleştirmesi gerektiğini, varsa güvenli bir geçici çözümü ve bir sonraki anlamlı güncellemenin hangi koşulda geleceğini belirle. Henüz bilinmeyeni söylemek bilgi vermektir; bunu atlayıp geri kalanını kesinmiş gibi sunmak değildir" },
    "c.cohort": { headline: "Etkilenen kitle makul bir kesinlikle belirlenebiliyor mu?", edges: [{ label: "Belirlenebiliyor", detail: "etkilenen kitle hesap, bölge, yetenek veya kohort bazında tanımlanabiliyor" }, { label: "Henüz belirlenemiyor", detail: "etkinin sınırları gerçekten belirsiz" }] },
    "a.scoped": { headline: "İletişimi yalnızca etkilenen kitleyle sınırlı tut. Tek bir bölgeyi etkileyen bir olayı herkese duyurmak, tüm kullanıcı tabanını olay bildirimlerini görmezden gelmeye alıştırır; oysa bir sonraki bildirim tam da onları ilgilendiren olabilir" },
    "a.broad": { headline: "Kapsamı yalnızca gerektiği kadar genişlet ve kapsamın hâlâ netleştirilmekte olduğunu açıkça belirt. Belirtilen belirsizlik bir bilgidir; kesinlik gibi sunulan belirsizlik ise daha sonra düzeltilmesi gereken bir iddiadır" },
    "c.verified": { headline: "Söylenecek olan gerçekten doğrulandı mı?", edges: [{ label: "Doğrulandı", detail: "içindeki her iddia varsayım değil, kanıtlanmış bilgi" }, { label: "Doğrulanmadı", detail: "neden, çözüm veya zamanlama hâlâ bir varsayım" }] },
    "c.material": { headline: "Bu durum, alıcının elindeki yönlendirmeyi gerçekten değiştiriyor mu?", edges: [{ label: "Değiştiriyor", detail: "ne yapmaları, ne beklemeleri veya nelerden kaçınmaları gerektiği değişti" }, { label: "Değiştirmiyor ve bir güncelleme yükümlülüğü de yok", detail: "son mesajdan bu yana onlar için hiçbir şey değişmedi" }, { label: "Değiştirmiyor ama yine de bir güncelleme yükümlülüğü var", detail: "durum sayfası takvimi, bir sözleşme veya yasal bir zorunluluk buna rağmen güncelleme gerektiriyor" }] },
    "a.hold-claim": { headline: "Bilineni ve bilinmeyeni söyle, henüz kanıtlanmamış bir neden veya çözüm hakkında hiçbir iddiada bulunma. Açıklanıp sonra geri çekilen bir kök neden, yavaş bir güncellemeden çok daha fazla güven kaybettirir; henüz kesinleşmemiş bir teknik detayın kesinmiş gibi sunulması da bu geri çekmelerin en sık nedenidir" },
    "a.communicate": { headline: "İletişimi, yükümlülüğü, alıcı çözümlemesini, kanalları, izinleri ve teslimat kanıtını yöneten kanonik iletişim mekanizması üzerinden başlat. Olay iletişimi kendi teslimat yolunu oluşturmaz ve mesaj hiçbir tanıtım içeriği taşımaz" },
    "a.no-send": { headline: "Hiçbir şey gönderme ve nedenini kaydet. Sadece zaman geçti diye göndermek gürültü üretir; bu gürültü de sonunda gelecek çözüm bildirimini, onu bekleyen kişilerin okumamasına yol açar" },
    "c.final": { headline: "Bu, bu alıcı kapsamı için çözüm bildirimi mi?", edges: [{ label: "Evet", detail: "bu mesajın gittiği kitle için olay çözüldü" }, { label: "Hayır", detail: "olay onlar için devam ediyor" }] },
    "x.no-send": { headline: "güncelleme gönderilmedi; önemli bir değişiklik olmadı", detail: "bir sonraki önemli değişiklik ya da bir yükümlülüğün güncelleme gerektirdiği an, süreci yeniden buraya getirir" },
    "x.closed-comms": { headline: "çözüm bu alıcı kapsamına bildirildi", detail: "alıcılara olayın bittiği söylendiği için, bir tekrar yaşanması durumunda bu durum yeni bir olay değil, bir tekrar (relaps) olarak bildirilir" },
    "x.updated": { headline: "güncelleme yayımlandı; bir sonraki güncelleme bir zamana değil, belirtilen bir koşula bağlı", detail: "belirtilen koşulun gerçekleşmesi veya önemli bir değişiklik, bir sonraki güncellemeyi tetikler" },
  },
  },
  "INT-269": {
  shortName: "Entegrasyon Kurtarma",
  name: "Entegrasyon bağlantısı koptu → yeniden bağlanma → geri geldi veya kısıtlı çalışıyor",
  purpose: "Bağlantısı kopan kişiye hangi özelliklerinin durduğunu, çözümün kendisine mi ait olduğunu ve bağlantıyı geri getirecek tek adımın ne olduğunu söyle - böylece sessiz bir bağımlılık arızası, yavaş yavaş fark edilen bir sorun yerine anında verilebilecek bir karara dönüşsün.",
  nodes: {
    "t.disconnected": { headline: "Entegrasyon bağlantısı başarısız oldu veya yetkilendirmesi kaldırıldı" },
    "c.fixable": { headline: "Çözüm, bağlantı sahibinin yapması gereken bir şey mi?", edges: [{ label: "Sahip yeniden yetkilendirebilir", detail: "sorunun nedeni, bağlantının sahip tarafındaki yetkilendirmenin geri alınmış, süresi dolmuş veya yetersiz olması" }, { label: "Sahibine ait değil", detail: "sorunun nedeni sağlayıcı tarafındaki bir kesinti, bizim tarafımızdaki bir hata veya sahibin kontrolünde olmayan bir yetkilendirme kısıtı" }] },
    "c.scope": { headline: "Bağlantının ne kadarı etkilendi?", edges: [{ label: "Bazı özellikler", detail: "yetkilendirme, verilenlerin bir kısmını hâlâ kapsıyor ve bağlantının geri kalanı çalışmaya devam ediyor" }, { label: "Hiçbiri çalışmıyor", detail: "yeniden yetkilendirilene kadar bu bağlantıdaki hiçbir özellik çalışamaz" }] },
    "a.inform-only": { headline: "Hangi özelliklerin durduğunu ve kendilerinden herhangi bir işlem beklenmediğini söyle; herhangi bir yeniden bağlanma adımı ekleme - çünkü işe yarayacak bir adım yok. Sağlayıcı kaynaklı bir kesintide yeniden yetkilendirme istemek, kişinin üç kez deneyip sonra destek talebi açmasına yol açar" },
    "a.partial": { headline: "Tam olarak hangi özelliklerin durduğunu, hangilerinin çalışmaya devam ettiğini ve tek yeniden yetkilendirme adımını açıkça belirt. Bağlantının büyük kısmı çalışırken kişiye tüm bağlantının koptuğunu söylemek, gereksiz yere bir öğleden sonrasının kaybolmasına ve bir sonraki bildirime karşı kalıcı bir güvensizliğe yol açar" },
    "a.total": { headline: "Bağlantının şu anda hiçbir şey taşımadığını söyle, buna bağlı olarak neyin durduğunu belirt ve tek yeniden yetkilendirme adımını ver. Neyin durduğu, sahibin bu durumun ne kadar acil olduğuna karar verebilmesi için ihtiyaç duyduğu bilgidir" },
    "x.informed": { headline: "bilgilendirildi, kurtarma işlemi sahibin yapması gereken bir şey değil", detail: "neden daha sonra sahip tarafından çözülebilir olarak yeniden sınıflandırılırsa, bu durum yeniden yetkilendirme yolunda tekrar geçerli hale gelir" },
    "w.revalidate": { headline: "bağlantı yeni bir yetkilendirmeyle yeniden doğrulanana, sahip bağlantıyı kaldırana ya da arıza sahibin çözebileceği bir sorun olmadığı şeklinde yeniden sınıflandırılana kadar", detail: "zaman aşımı: yeniden yetkilendirme adımı, bildirimden itibaren sınırlı bir yanıt penceresi boyunca açık tutulur; bu sürenin ardından hâlâ kopuk olan bir bağlantı, yalnızca bu arıza üzerinden değil, bağımsız ilişki kanıtlarına göre değerlendirilir. (yapılandırma: integration_reconnect.revalidate)" },
    "c.outcome": { headline: "Bekleyişi ne sonlandırdı?", edges: [{ label: "Yeniden bağlandı", detail: "yeniden doğrulama, özelliklerin yeni yetkilendirmeyle çalıştığını onaylıyor" }, { label: "Kaldırıldı", detail: "sahip, yeniden yetkilendirmek yerine bilinçli olarak bağlantıyı kaldırdı" }, { label: "Aslında sahibine ait değilmiş", detail: "neden yeniden sınıflandırıldı ve sahibin herhangi bir işlemi bir şeyi değiştirmeyecekti" }] },
    "a.unreconnected": { headline: "Kurtarma penceresinin, bağlantı hâlâ kopukken kapandığını, ilişki hakkında bir sonuç olarak değil, bu entegrasyona dair tarihli bir gerçek olarak kaydet. Birinin geri getirmemeyi tercih ettiği bir bağlantı tek bir sinyaldir ve bu, müşterinin ayrılmasından çok bir kullanım senaryosunun bilinçli olarak sona ermesi anlamına gelebilir" },
    "a.restored": { headline: "Hangi özelliklerin yeniden çalıştığını onayla ve öncekinden daha kısıtlı geri gelen varsa bunları belirt. Öncesine göre daha azını sessizce geri getiren bir yeniden bağlanma, eksik özelliğe ihtiyaç duyulduğu anda fark edilir" },
    "x.removed": { headline: "bağlantı, sahibi tarafından bilinçli olarak kaldırıldı", detail: "aynı sağlayıcıya yeniden bağlanmak yeni bir bağlantıdır ve bu sürece değil, etkinleştirme sürecine girer" },
    "c.relationship-signal": { headline: "İlişkinin kendisinin risk altında olduğuna dair bağımsız bir kanıt var mı?", edges: [{ label: "Doğrulandı", detail: "bu ilişkiye dair başka bir kaynaktan gelen risk kanıtı zaten mevcut, dolayısıyla yeniden bağlanmayan entegrasyon bu tablonun tamamı değil, ona eklenen bir parça" }, { label: "Tek sinyal bu kopma", detail: "başka hiçbir şey ilişkinin risk altında olduğuna işaret etmiyor" }] },
    "x.restored": { headline: "yeniden bağlandı ve onaylandı", detail: "aynı bağlantıda daha sonra yaşanacak bir kopma yeni bir örnektir" },
    "h.abandoned": { headline: "Kayıp riski eskalasyonu → kanıt → müdahale önceliği", detail: "sahibin yeniden yetkilendirebileceği ama yetkilendirmediği, kopmanın artık geçici bir kesinti olarak değerlendirilme sınırını aşmış bir bağlantı" },
    "x.unreconnected": { headline: "kurtarma penceresi kapandı, bağlantı hâlâ kopuk, ilişki risk altında olarak etiketlenmedi", detail: "yeni bir kopma olayı veya bir yeniden yetkilendirme denemesi, kurtarma sürecini tekrar başlatır" },
  },
  },
  "INT-278": {
  shortName: "Entegrasyon Kurulumu",
  name: "Entegrasyon bağlantısı başlatıldı → doğrulama sonucu → etkin veya hedefli çözüm",
  purpose: "Bağlantıyı başlatan kişiye sürecin gerçekte hangi aşamada başarısız olduğunu ve o aşamayı neyin düzelteceğini söyle - çünkü genel geçer bir hata mesajı, çözebilecek kişiyi destek ekibine yönlendirirken çözemeyecek kişiyi tamamen vazgeçirir.",
  nodes: {
    "t.started": { headline: "Entegrasyon bağlantı denemesi sonuçlandı" },
    "c.outcome": { headline: "Deneme hangi aşamaya kadar ilerledi?", edges: [{ label: "Etkin", detail: "kimlik doğrulama, gerekli yetki kapsamı ve özellik testi hepsi başarılı oldu ve bağlantı etkin olarak kaydedildi" }, { label: "Belirli bir aşamada başarısız oldu", detail: "deneme başarısız oldu ve hangi aşamada başarısız olduğu kesin olarak kaydedildi" }, { label: "Başarısız oldu, aşama belirlenemedi", detail: "deneme başarısız oldu ve hangi aşamada olduğu kesin olarak belirlenemedi" }] },
    "a.active": { headline: "Bağlantının etkin olduğunu onayla ve yapılandırılan özellikler yerine gerçekten doğrulanan özellikleri belirt. Bu fark, birinin sahip olmadığı bir izin üzerine bir şey inşa etmesini önler" },
    "c.stage": { headline: "Hangi aşama başarısız oldu?", edges: [{ label: "Kimlik bilgisi", detail: "sağlayıcı kimlik bilgisini reddetti veya yetkilendirme hiç tamamlanmadı" }, { label: "İzin", detail: "kimlik bilgisi kabul edildi ama gerekli bir izin verilmedi" }, { label: "Özellik", detail: "kimlik bilgisi ve izin ikisi de geçerliydi ama güvenli test asgari işlemi gerçekleştiremedi" }] },
    "a.generic": { headline: "Denemenin başarısız olduğunu, aşamanın henüz belirlenemediğini ve konu incelenirken kurulumu yapan kişiden başka bir şey beklenmediğini söyle. Henüz bir neden bulunmadığını kabul etmek, bir neden uydurmaktan daha iyidir - tahmini bir neden, kişiyi bozuk olmayan bir şeyi düzeltmeye yönlendirir" },
    "x.active": { headline: "etkin, doğrulanan özellikler belirtilmiş durumda", detail: "aynı sağlayıcıya yapılacak yeni bir bağlantı yeni bir örnektir" },
    "a.fix-auth": { headline: "Kimlik bilgisinin reddedildiğini söyle ve bunu yeniden kuracak tek adımı ver. Bu, kurulumu yapan kişinin genellikle yardım almadan düzeltebileceği tek aşamadır ve çoğunlukla genel bir hata mesajının arkasında kaybolur" },
    "a.fix-scope": { headline: "Eksik olan belirli izni ve nereden verildiğini belirt. Eksik bir iznin başarısız bir kurulum olarak bildirilmesi, kişinin tek bir ayarı değiştirmek için tüm bağlantıyı yeniden kurmasına neden olur" },
    "a.fix-capability": { headline: "Erişimin verildiğini ama asgari işlemin gerçekleştirilemediğini söyle ve hangi işlem olduğunu belirt. Bunun nedeni genellikle sağlayıcı tarafındaki bir kısıttır, bu yüzden mesaj kurulumu yapan kişiyi değil, sağlayıcıyı işaret eder" },
    "h.diagnose": { headline: "Entegrasyon bağlantısı → kimlik doğrulama → doğrulama → etkinleştirme", detail: "hangi aşamada olduğu kesin olarak belirlenemeyen başarısız bir bağlantı denemesi" },
    "w.retry": { headline: "yeni bir bağlantı denemesi kaydedilene ya da sahip bağlantıyı kaldırana kadar", detail: "zaman aşımı: tamamlanmamış bir bağlantının terk edilmiş sayılacağı süre. (yapılandırma: integration_setup.retry)" },
    "c.retry": { headline: "Sonraki deneme ne oldu?", edges: [{ label: "Şimdi etkin", detail: "sonraki bir deneme tüm aşamalardan geçti ve bağlantı etkin olarak kaydedildi" }, { label: "Yine başarısız oldu", detail: "sonraki bir deneme, kurulumu yapan kişiye daha önce bildirilmiş olan aşamada yine başarısız oldu" }, { label: "Farklı bir aşamada başarısız oldu", detail: "sonraki bir deneme, bildirilen aşamayı geçti ama henüz bildirilmemiş bir aşamada başarısız oldu" }, { label: "Kaldırıldı", detail: "hiçbir deneme başarılı olmadan yapılandırma kaldırıldı" }] },
    "x.abandoned": { headline: "bağlantı hiç kurulamadan terk edildi", detail: "aynı entegrasyonla yapılacak yeni bir deneme yeni bir örnek başlatır" },
    "x.unresolved": { headline: "bildirilen çözümden sonra bile hâlâ bağlanamadı", detail: "sonraki bir deneme sonuç kontrolüne yeniden girer; daha önce verilmiş bir çözüm ikinci kez gönderilmez" },
  },
  },
  "OPS-121": {
  shortName: "Asenkron İş İşleme",
  name: "İş kabul edildi → kuyruğa alındı → işlendi → tamamlandı veya başarısız oldu",
  purpose: "Asenkron işe açık durumlar tanımlayarak işi kabul etmek, beklemeye almak, çalıştırmak ve tamamlamak hiçbir zaman aynı olay olarak okunmasın.",
  nodes: {
    "t.accepted": { headline: "Asenkron iş kabul edildi" },
    "a.persist": { headline: "İş kimliğini, türünü, hedef varlığı, istek zamanını, istek sürümünü ve bağlamını, tanımlıysa önceliği, ayrıca idempotency ve correlation anahtarlarını kalıcı olarak kaydet. ACCEPTED durumunu kaydet - bu, işin elimizde olduğunu kabul eder, işe henüz bir şey olduğunu değil. Kabul işlemi logical_operation_key üzerinde kendi içinde idempotent'tir: aynı anahtarla gelen ikinci bir t.accepted, yeni bir kimlik üretmek yerine mevcut work_id'yi döndürür" },
    "c.immediate": { headline: "Şu anda başlamak için kapasite müsait mi?", edges: [{ label: "Hemen başla", detail: "bir çalışan (worker) işi hemen üstlenebilir" }, { label: "Beklemeli", detail: "şu anda boşta kapasite yok" }] },
    "a.processing": { headline: "PROCESSING durumunu, yürütme denemesiyle birlikte kaydet - hangi çalışan (worker), hangi deneme numarası, ne zaman başladığı; bu belirli yürütme denemesi için attempt_number yeni baştan üretilir. Deneme kaydı, daha sonra oluşacak bir takılmayı veya çalışan hatasını yalnızca görünür değil, teşhis edilebilir kılan şeydir" },
    "a.queued": { headline: "QUEUED durumunu kaydet. Kuyrukta beklemek sağlıklı bir durumdur, bir hata değildir - sırasını bekleyen iş, asenkron bir sistemin normal halidir" },
    "w.execution": { headline: "iş bir sonuç bildirene kadar", detail: "bu iş türü için beklenen yürütme penceresi geçtiğinde zaman aşımına uğrar" },
    "w.start": { headline: "bir çalışan (worker) işi başlatana, ya da iş iptal edilene veya geçersiz kılınana kadar", detail: "bu iş sınıfı için kuyruk SLA eşiği geçtiğinde zaman aşımına uğrar" },
    "c.outcome": { headline: "İş hangi sonucu bildirdi?", edges: [{ label: "COMPLETED", detail: "yürütme hatasız tamamlandı" }, { label: "FAILED_RETRYABLE", detail: "hata, sınıflandırmaya göre geçicidir" }, { label: "FAILED_TERMINAL", detail: "hata, işi tekrarlayarak çözülemez" }, { label: "UNKNOWN", detail: "yürütme, bir şey yapıp yapmadığı belirlenemeden sona erdi" }] },
    "h.stalled": { headline: "İş takıldı → ilerleme eksikliği tespit edildi → kurtar, başarısız say veya yükselt", detail: "yürütme penceresini bir sonuç bildirmeden aşan iş" },
    "c.started": { headline: "Hangisi gerçekleşti?", edges: [{ label: "Bir çalışan (worker) işi üstlendi", detail: "yürütme başladı" }, { label: "İptal edildi veya geçersiz kılındı", detail: "iş artık istenmiyor veya hedefi ortadan kalktı" }] },
    "h.lag": { headline: "Kuyruk gecikmesi → ölç → önceliklendir, ölçekle veya kısıtla", detail: "başlamadan kuyruk SLA'sını aşan iş" },
    "h.verify": { headline: "Teknik tamamlanma → iş sonucunu doğrula → sonuçlandır veya mutabakat sağla", detail: "teknik tamamlanmanın bildirilmesi" },
    "h.retry": { headline: "Yeniden denenebilir hata → bekleme süresi → yeniden dene → çöz veya tüket", detail: "yeniden denenebilir olarak sınıflandırılan bir hata" },
    "h.dead-letter": { headline: "Dead-letter kaydı → teşhis et → yeniden oynat, düzelt veya kapat", detail: "işi tekrarlamanın çözemeyeceği bir hata" },
    "h.reconcile": { headline: "external:side-effect-reconciliation", detail: "yan etki durumu bilinmeyen bir yürütme" },
    "x.cancelled": { headline: "yürütmeden önce iptal edildi; hiçbir şey çalışmadı", detail: "aynı iş eyleminin yeniden talep edilmesi, kendi kimlikleriyle yeni bir iş kalemidir" },
  },
  },
  "OPS-122": {
  shortName: "Kuyruk Gecikmesi Yönetimi",
  name: "Kuyruk gecikmesi → ölç → önceliklendir, ölçekle veya kısıtla",
  purpose: "Yetişemeyen bir kuyruğa, bitmemiş işin ne kadar biriktiğine değil ne kadar eskidiğine göre ölçerek müdahale et.",
  nodes: {
    "t.threshold": { headline: "Kuyruk gecikmesi veya derinliği eşiği aşıldı" },
    "a.measure": { headline: "Derinliği, en eski bitmemiş kalemin yaşını, işleme hızını (throughput), varış oranını, hangi iş yükü sınıflarının etkilendiğini ve bunun yarattığı SLA riskini ölç. Önemli olan sinyal yaştır - hızla boşalan derin bir kuyruk sağlıklıdır, bir saattir kımıldamayan sığ bir kuyruk ise değildir" },
    "c.burst": { headline: "Bu, mevcut işleme hızının kaldırabileceği geçici bir yoğunluk mu?", edges: [{ label: "Geçici yoğunluk", detail: "varış oranı ani yükseldi ve işleme hızı bunu SLA süresi içinde eritecek" }, { label: "Kalıcı gecikme", detail: "en eski iş SLA'sına karşı yaşlanıyor ve işleme hızı farkı kapatmıyor" }] },
    "x.observe": { headline: "gözlemlendi; operasyonel bir müdahale uygulanmadı", detail: "eşik aşımlarının çoğu burada çözülür. Her birini bir olay (incident) gibi ele almak güvenilirlik değil alarm yorgunluğu üretir ve önemli olan uyarılar kimsenin okumadığı bir kanala düşer" },
    "a.lagging": { headline: "Etkilenen iş yükü sınıfları için, tüm kuyruk yerine yalnızca onları kapsayacak şekilde LAGGING durumunu kaydet" },
    "c.sla": { headline: "Bir müşteri veya iş SLA'sı tehlikede mi?", edges: [{ label: "Tehlikede", detail: "gecikme sürerse iş, sistem dışında verilmiş bir taahhüdü karşılayamayacak" }, { label: "Sadece dahili", detail: "gecikme gerçek ancak henüz riske giren dışa dönük bir taahhüt yok" }] },
    "a.urgent": { headline: "Operasyonel müdahaleyi uygula ve etkilenen yeteneği kısıtla veya yükselt. Bunu sadece dağınık değil acil kılan şey, risk altındaki dışa dönük bir taahhüttür - bir mühendislik görevi ile bir olay (incident) arasındaki fark tam olarak budur" },
    "a.response": { headline: "Tanımlanan operasyonel müdahaleyi uygula - kapasite ölçeklendirme, öncelik ayarı, kritik olmayan sınıfları erteleme, hız kontrolü. İş, metriği sağlıklı göstermek için asla sessizce düşürülmez; çünkü bu, görünür bir birikimi görünmez bir kayba dönüştürür" },
    "h.escalate": { headline: "Sorumluluk yükseltmesi → üst yetkili → çözüm veya iade", detail: "dışa dönük bir taahhüdü tehdit eden veya kendi müdahale penceresini aşan gecikme" },
    "w.recovery": { headline: "işleme hızı toparlanıp en eski iş normal bir yaşa dönene, ya da gecikme SLA eşiğini aşarak kötüleşene kadar", detail: "operasyonel müdahale penceresi geçtiğinde zaman aşımına uğrar" },
    "c.direction": { headline: "Hangi yöne hareket etti?", edges: [{ label: "Toparlandı", detail: "işleme hızı varışların önünde ve en eski işin yaşı azalıyor" }, { label: "Kötüleşti", detail: "gecikme SLA eşiğini aştı" }] },
    "h.drain": { headline: "Birikim kurtarma → yeniden doğrula → kontrollü boşaltma → normal duruma dönüş", detail: "arkasında ciddi bir birikim oluşmuş halde toparlanan kapasite" },
  },
  },
  "OPS-123": {
  shortName: "Takılan İş Kurtarma",
  name: "İş takıldı → ilerleme eksikliği tespit edildi → kurtar, başarısız say veya yükselt",
  purpose: "Uzun süren işi durmuş işten ayırt et ve yalnızca yan etkileri bilinen durumlarda kurtarma uygula.",
  nodes: {
    "t.threshold": { headline: "İlerleme eşiği tamamlanmadan aşıldı" },
    "a.inspect": { headline: "Son kaydedilen ilerlemeyi, sahibinin kim olduğunu, lease veya lock'un hâlâ geçerli olup olmadığını, harici bir bağımlılıkta engellenip engellenmediğini, deneme durumunu ve şimdiye kadar hangi yan etkilerin oluştuğunu incele. Bunlardan sonuncusu, devamında olacak her şeyi belirler" },
    "c.progressing": { headline: "İş gerçekten hâlâ ilerliyor mu?", edges: [{ label: "Hâlâ ilerliyor", detail: "kontrol noktaları (checkpoint) ilerliyor, ya da geri dönecek bir şeyde meşru şekilde bekliyor" }, { label: "İlerleme yok", detail: "hiçbir şey ilerlemedi ve meşru bir şekilde engelleyen de yok" }] },
    "x.observe": { headline: "uzun sürüyor, takılmadı; gözlem sürüyor", detail: "eşik, süreyi ölçtü ve sağlıklı buldu. Meşru uzun süren işleri bir süre kuralına dayanarak sonlandırmak, tam olarak o kuralın yakalamak için yazıldığı hatalara yol açar" },
    "a.stalled": { headline: "İnceleme sonucunda bulunanlarla birlikte bu deneme için STALLED durumunu kaydet" },
    "c.side-effects": { headline: "Yan etki durumu belirlendi mi?", edges: [{ label: "Belirlendi", detail: "denemenin ne yapıp ne yapmadığını biliyoruz" }, { label: "Bilinmiyor", detail: "deneme, göremediğimiz etkiler üretmiş olabilir - bir zaman aşımı, o ana kadar neyin çalıştığı hakkında hiçbir şey kanıtlamaz" }] },
    "c.recoverable": { headline: "Bu, kendi yürütme semantiğine göre güvenli şekilde kurtarılabilir mi?", edges: [{ label: "Devralmak güvenli", detail: "işlem yeniden başlatılabilir veya devam ettirilebilir ve sahiplik temiz bir şekilde devredilebilir" }, { label: "Güvenle kurtarılamaz", detail: "işlem tekrarlanamaz ve devam noktası mevcut değil" }] },
    "h.reconcile": { headline: "external:side-effect-reconciliation", detail: "yan etkileri belirlenemeyen takılı bir deneme" },
    "a.reclaim": { headline: "Yürütme semantiğine göre devral ve yeniden başlat; iş kaleminin lease'ini devrederek iki çalışanın (worker) aynı münhasır işi eş zamanlı olarak devralmasını engelle. Buradaki asıl mesele koordinasyondur - koordinasyonsuz bir devralma, takılı tek bir işi çalışan iki işe dönüştürür" },
    "h.escalate": { headline: "Sorumluluk yükseltmesi → üst yetkili → çözüm veya iade", detail: "güvenle kurtarılamayan takılı iş" },
    "x.recovered": { headline: "koordineli sahiplik altında devralındı ve yeniden başlatıldı", detail: "yeni denemede oluşacak yeni bir takılma, kendi kanıtlarına göre değerlendirilir" },
  },
  },
  "OPS-124": {
  shortName: "Yeniden Deneme Yönetimi",
  name: "Yeniden denenebilir hata → bekleme süresi → yeniden dene → çöz veya tüket",
  purpose: "Geçici bir hatayı, yalnızca tekrarlamanın güvenli olduğu ve işin hâlâ istendiği durumlarda, sınırlı bir bütçe içinde tekrarla.",
  nodes: {
    "t.retryable": { headline: "Hata yeniden denenebilir olarak sınıflandırıldı" },
    "a.record": { headline: "Hata sınıfını, deneme numarasını, en son ne zaman başarısız olduğunu, yan etkiler konusunda ne kadar emin olduğumuzu ve yeniden deneme uygunluğunu kaydet. Deneme sayısı kalıcıdır ve bir çalışanın (worker) yeniden başlatılmasıyla sıfırlanmaz - süreç belleğinde tutulan bir sayaç, her dağıtımda (deploy) kendini yenileyen bir yeniden deneme bütçesidir" },
    "c.safe": { headline: "Yeniden denemek gerçekten güvenli mi?", edges: [{ label: "Tekrarlamak güvenli", detail: "işlem idempotent'tir, ya da yan etkilerinin gerçekleşmediği biliniyor" }, { label: "Yan etkiler belirsiz", detail: "başarısız deneme, göremediğimiz etkileri zaten üretmiş olabilir" }, { label: "Güvenle tekrarlanamaz", detail: "hata sınıfı ne derse desin, işlem hiçbir şekilde tekrarlanamaz" }] },
    "a.backoff": { headline: "Bu deneme numarası için politikada tanımlı bekleme süresini (backoff) hesapla" },
    "h.reconcile": { headline: "external:side-effect-reconciliation", detail: "yan etki durumu belirsiz, yeniden denenebilir bir hata" },
    "h.dead-letter": { headline: "Dead-letter kaydı → teşhis et → yeniden oynat, düzelt veya kapat", detail: "otomatik kurtarmanın tükenmesi veya mevcut olmaması" },
    "w.retry": { headline: "iş iptal edilene veya geçersiz hale gelene kadar", detail: "hesaplanan bekleme aralığı geçtiğinde zaman aşımına uğrar" },
    "x.cancelled": { headline: "bekleme sırasında iptal edildi; başka deneme yapılmayacak", detail: "aynı iş eyleminin yeniden talep edilmesi yeni bir iş kalemidir" },
    "a.revalidate": { headline: "Herhangi bir şey denemeden önce işi ve hedef varlığını güncel duruma karşı yeniden doğrula. Bekleme sırasında zaman geçmiştir ve artık geçerliliğini yitirmiş bir duruma göre yazılmış bir talimatı çalıştıran bir yeniden deneme, hiç denememekten daha kötüdür" },
    "c.required": { headline: "İş hâlâ gerekli mi?", edges: [{ label: "Hâlâ gerekli", detail: "hedef durum, bu işin yapacağı şeye hâlâ ihtiyaç duyuyor" }, { label: "Artık gerekli değil", detail: "varlık değişti, istek yerini başka birine bıraktı ya da sonuç başka bir yoldan ulaştı" }] },
    "a.attempt": { headline: "Yeniden denemeyi, her fiziksel denemede aynı değeri taşıyan logical_operation_key altında idempotent şekilde çalıştır; böylece daha önceki bir denemeyi zaten almış olan alt sistem, bunu çift işlemek yerine özümseyebilir. attempt_number, bu mekanizmanın kendi kayıt tutması için ilerlemeye devam eder; alt sistemin tekilleştirme (dedupe) yaptığı değerin bir parçası hiçbir zaman olmaz" },
    "x.stale": { headline: "CANCELLED_STALE; iş artık gerekli değil", detail: "çalıştırılmak yerine iptal edildi, gerekçesi kaydedildi. Geçerliliğini yitirmiş bir işi çalıştıran bir yeniden deneme, yanlış şeyde başarılı olan bir yeniden denemedir" },
    "c.result": { headline: "Yeniden deneme ne üretti?", edges: [{ label: "Başarılı oldu", detail: "deneme tamamlandı" }, { label: "Başarısız, bütçe kaldı", detail: "sınırlı bütçe içinde başka bir deneme hakkı var" }, { label: "Bütçe tükendi", detail: "politikanın deneme sınırına ulaşıldı" }] },
    "h.verify": { headline: "Teknik tamamlanma → iş sonucunu doğrula → sonuçlandır veya mutabakat sağla", detail: "teknik başarı bildiren bir yeniden deneme" },
  },
  },
  "OPS-125": {
  shortName: "İş Tekilleştirme",
  name: "Yinelenen iş tespit edildi → tekilleştir → yeniden kullan, engelle veya mutabakat sağla",
  purpose: "Aynı mantıksal işlemin iki kez çalışmasını önle, ancak iki meşru tekrarı birbirine indirgeme.",
  nodes: {
    "t.duplicate": { headline: "Olası yinelenen iş tespit edildi" },
    "a.compare": { headline: "Sabit kimlikleri karşılaştır: logical_operation_key, iş operasyonunun kimliği, hedef varlık, ilgili sürüm ve yürütme geçmişi. Tekilleştirme penceresi ve kapsamı, pratik bir zaman aralığını değil iş semantiğini takip eder" },
    "c.same": { headline: "Bu aynı mantıksal işlem mi?", edges: [{ label: "Aynı işlem", detail: "sabit kimlikler, bunun birden fazla kez iletilmiş tek bir işlem olduğunu ortaya koyuyor" }, { label: "Farklı işlemler", detail: "yükler (payload) eşleşiyor ama iş kimliği eşleşmiyor" }] },
    "c.canonical": { headline: "Kanonik yürütme hangi durumda?", edges: [{ label: "Tamamlandı", detail: "kanonik iş tamamlandı ve sonucu hâlâ geçerli" }, { label: "Devam ediyor", detail: "kanonik iş çalışıyor" }, { label: "Çelişkili sonuçla tamamlandı", detail: "örnekler ne olduğu konusunda birbiriyle çelişiyor" }] },
    "x.independent": { headline: "bağımsız olarak işlendi; bir kopya değil", detail: "iki meşru tekrarı birbirine indirgemek, bir kopyayı çalıştırmaktan daha kötü bir hatadır; çünkü müşteri ikisini de talep etmiştir ve sadece biri ulaşır" },
    "a.reuse": { headline: "Hâlâ geçerli olduğu sürece mevcut sonucu yeniden kullan ve kopya yürütmeyi çalıştırıp çıktısını atmak yerine engelle" },
    "a.attach": { headline: "Mimari izin verdiğinde, ikinci bir yürütme başlatmak yerine devam eden yürütmeye bağlan ve sonucunu bekle. İzin vermediğinde ise kopya bunun yerine engellenir" },
    "h.reconcile": { headline: "external:side-effect-reconciliation", detail: "çelişkili sonuçlar bildiren kopya örnekler" },
    "x.suppressed": { headline: "kopya engellendi; kanonik sonuç yeniden kullanıldı", detail: "aynı varlık üzerinde gerçekten yeni bir işlem, kendi anahtarına sahip yeni bir örnektir" },
    "x.attached": { headline: "kanonik yürütmeye bağlandı", detail: "kanonik yürütmenin sonucu ikisini de çözer" },
  },
  },
  "OPS-126": {
  shortName: "Kısmi İşleme Kurtarma",
  name: "Kısmi işleme → tamamlanan işi koru → yalnızca başarısız kapsamı yeniden dene",
  purpose: "Bileşik bir işlemin başarısız olan kısmını, çalışan kısmı yeniden çalıştırmadan kurtar.",
  nodes: {
    "t.mixed": { headline: "Bileşik işleme karma sonuçlar üretti" },
    "a.classify": { headline: "Her alt öğeyi COMPLETED, FAILED_RETRYABLE, FAILED_TERMINAL, PENDING veya UNKNOWN olarak sınıflandır ve üst öğe için PARTIALLY_COMPLETED durumunu kaydet. Başarılı alt öğeler asla yeniden oynatılmaz - yan etkileri olan bir toplu işlemde, başarıları yeniden çalıştırmak, ilk hatadan daha büyük bir olaydır" },
    "c.policy": { headline: "Bu üst öğe için bir toplulaştırma (aggregation) politikası tanımlı mı?", edges: [{ label: "Tanımlı", detail: "bir politika, üst öğenin hangi alt öğe sonuçlarını gerektirdiğini ve nelere tahammül ettiğini belirtir" }, { label: "Tanımlı değil", detail: "alt öğelerin nasıl birleşip bir üst öğe sonucu oluşturacağını belirten hiçbir şey yok" }] },
    "c.children": { headline: "Çözülmemiş alt öğelerin neye ihtiyacı var?", edges: [{ label: "Bağımsız olarak yeniden denenebilir", detail: "başarısız alt öğeler, başarılara dokunmadan kendi başlarına yeniden denenebilir" }, { label: "Kalıcı hata, politika buna izin veriyor", detail: "üst öğenin politikası, bu alt öğeler başarısız olsa bile tamamlanmaya izin veriyor" }, { label: "Kalıcı hata, tamamlanan alt öğeler geri alınmalı", detail: "geçerli işlem (transaction) semantiği, başarılı olanın geri alınmasını gerektiriyor" }, { label: "Belirsiz alt öğeler", detail: "bazı alt öğeler ne yaptıkları belirlenemeden sona erdi" }] },
    "h.undefined": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "birleştirecek bir toplulaştırma politikası olmayan bileşik bir sonuç" },
    "h.retry": { headline: "Yeniden denenebilir hata → bekleme süresi → yeniden dene → çöz veya tüket", detail: "bağımsız olarak yeniden denenebilecek başarısız alt öğeler" },
    "a.recompute": { headline: "Üst öğenin durumunu, bunları bildiren olaylardan değil, toplulaştırma politikasını kullanarak yetkili alt öğe sonuçlarından yeniden hesapla. Kısmi tamamlanma, tam bir başarısızlık değildir; üst öğenin durumu, ikisinden hangisi olduğunu söyleyebilmelidir" },
    "h.compensate": { headline: "external:correction-or-compensation", detail: "tamamlanan alt öğelerin geri alınmasını gerektiren işlem (transaction) semantiği" },
    "h.reconcile": { headline: "external:side-effect-reconciliation", detail: "yan etki durumu belirlenemeyen alt öğeler" },
    "x.recomputed": { headline: "üst öğe durumu, yetkili alt öğe sonuçlarından yeniden hesaplandı", detail: "yeni bir alt öğe sonucu, üst öğeyi kaynağından yeniden hesaplar" },
  },
  },
  "OPS-127": {
  shortName: "Dead-Letter Kurtarma",
  name: "Dead-letter kaydı → teşhis et → yeniden oynat, düzelt veya kapat",
  purpose: "Otomasyonun tamamlayamadığı işi, kimsenin okumadığı bir kuyruk yerine, birinin sahiplendiği bir yükümlülüğe dönüştür.",
  nodes: {
    "t.exhausted": { headline: "İş, otomatik kurtarma imkanlarını tüketti" },
    "a.preserve": { headline: "Orijinal yükü (payload) ya da ona bir referansı, hedef varlığı, tüm deneme geçmişini, hata nedenlerini, bilinen son yan etki durumunu ve oluşturulma ile dead-letter'a düşme zaman damgalarını koru. Dead-letter'a düşmek silinmek değildir - bu, otomasyonun tamamlayamadığı bir iştir ve artık birinin sahiplendiği bir iştir" },
    "c.uncertain": { headline: "Yan etki durumu belirsiz mi?", edges: [{ label: "Belirsiz", detail: "başarısız denemeler, göremediğimiz etkiler üretmiş olabilir" }, { label: "Belirlendi", detail: "neyin olup neyin olmadığını biliyoruz" }] },
    "h.reconcile": { headline: "external:side-effect-reconciliation", detail: "yan etkileri belirlenemeyen, dead-letter'a düşmüş bir kalem" },
    "c.remediation": { headline: "Bunu ne çözer?", edges: [{ label: "Bir veri veya yapılandırma düzeltmesi", detail: "asıl sorun düzeltilebilir ve iş bu durumda başarılı olur" }, { label: "İş artık geçersiz", detail: "yapacağı şeye artık ihtiyaç yok" }, { label: "Manuel yürütme gerekiyor", detail: "otomasyonun yapamadığını bir kişinin yapması gerekiyor" }, { label: "Henüz teşhis edilemiyor", detail: "hata, kayıtlı bilgilerden sınıflandırılamıyor" }] },
    "a.correct": { headline: "Asıl sorunu düzelt, ardından bir replay_id üret ve original_work_id ile orijinal işe bağlı, kontrollü bir yeniden oynatma (replay) oluştur. Yeniden oynatma, kendi kaydına sahip yeni bir denemedir ve orijinalin denetim geçmişini sıfırlamaz - bir yükü düzeltmek, ilk başarısızlıkla olan ilişkiyi korur" },
    "a.close": { headline: "Kalemi, gerekçesi kaydedilmiş şekilde geçersiz olarak kapat. Gerekçeyle kapatmak ile sessizce terk etmek aynı kuyruk derinliğini üretir ama hesap verebilirlik açısından tamamen farklıdır" },
    "h.manual": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "yalnızca bir kişinin tamamlayabileceği iş" },
    "w.review": { headline: "hata teşhis edilip bir çözüm seçilene kadar", detail: "dead-letter inceleme süresi geçtiğinde zaman aşımına uğrar" },
    "x.replayed": { headline: "düzeltildi ve orijinaline bağlı yeni bir deneme altında yeniden oynatıldı", detail: "yeniden başarısız olan bir oynatma, zincir bozulmadan kendi kaydı üzerinden yeniden dead-letter'a düşer" },
    "x.obsolete": { headline: "gerekçesi kaydedilerek geçersiz olarak kapatıldı", detail: "aynı iş ihtiyacının yeniden ortaya çıkması, bu kalemin canlanması değil, yeni bir iştir" },
    "h.escalate": { headline: "Sorumluluk yükseltmesi → üst yetkili → çözüm veya iade", detail: "teşhis edilmeden inceleme süresini aşan, dead-letter'a düşmüş iş" },
  },
  },
  "OPS-128": {
  shortName: "Çalışan Hatası Kurtarma",
  name: "Çalışan (worker) veya işleyici hatası → işi devral → güvenle devam ettir",
  purpose: "Yürütme sorumluluğunu, işin başarısız olduğunu varsaymadan ve iki çalışanın (worker) aynı işi elinde tutmasına izin vermeden, hatalı bir çalışandan al.",
  nodes: {
    "t.worker-down": { headline: "İşi elinde tutarken çalışan (worker) erişilemez hale geldi" },
    "a.identify": { headline: "Etkilenen işi lease, heartbeat, yürütme kaydı, varsa kontrol noktası (checkpoint) ve sahiplik meta verilerini kullanarak belirle" },
    "c.lease": { headline: "Önceki lease hâlâ geçerli olabilir mi?", edges: [{ label: "Muhtemelen geçerli", detail: "lease süresi dolmadı ve çalışan (worker) ölmüş değil, bağlantısı kopmuş olabilir" }, { label: "Süresi doldu veya serbest bırakıldı", detail: "lease kesin olarak sona erdi" }] },
    "w.lease": { headline: "orijinal çalışan (worker) işi tamamlayana veya serbest bırakana kadar", detail: "kalan lease süresi geçtiğinde zaman aşımına uğrar" },
    "c.confirmed": { headline: "İşin tamamlandığı zaten doğrulandı mı?", edges: [{ label: "Zaten tamamlandı", detail: "bu iş için yetkili bir tamamlanma kaydı var" }, { label: "Tamamlanmadı", detail: "kayıtlı bir tamamlanma yok" }] },
    "x.original": { headline: "orijinal çalışan (worker) işi bitirdi; devralmaya gerek yok", detail: "kaçırılan bir heartbeat, ölü bir süreç anlamına gelmez; bu sonuç, hemen devralmak yerine beklemenin doğru olduğunu gösterir" },
    "x.no-replay": { headline: "zaten tamamlandı; hiçbir şey yeniden oynatılmadı", detail: "çalışanın (worker) ölmesi, işin başarısız olduğu anlamına gelmez. İşlem, süreç sona ermeden bir an önce bitmiş olabilir ve bunun aksini varsayarak yeniden oynatmak işlemi tekrarlar" },
    "c.resume": { headline: "Yürütme nasıl devam ettirilebilir?", edges: [{ label: "Geçerli bir kontrol noktasından", detail: "bir kontrol noktası (checkpoint), işin nereye kadar ilerlediğini kaydeder ve oradan devam etmek güvenlidir" }, { label: "Baştan güvenle yeniden başlatılabilir", detail: "işlem idempotent'tir, ya da yaptığı hiçbir şeyin geri alınmasına gerek yoktur" }, { label: "Yan etki durumu bilinmiyor", detail: "iş, bir yeniden başlatmanın tekrarlayacağı etkiler üretmiş olabilir" }] },
    "a.checkpoint": { headline: "Yeni sahiplik altında kontrol noktasından devam et; yeni sahip için taze bir lease_id üret, böylece tamamlanan kısım tekrarlanmaz" },
    "a.restart": { headline: "Idempotent şekilde devral ve yeniden başlat; taze bir lease_id üreterek ikinci bir çalışanın (worker) işi eş zamanlı olarak üstlenmesini engelle" },
    "h.reconcile": { headline: "external:side-effect-reconciliation", detail: "bir çalışan (worker) hatası sonrasında yan etki durumu belirlenemeyen, devam eden iş" },
    "x.resumed": { headline: "yürütme sorumluluğu devredildi; iş yeni sahiplik altında devam ettirildi", detail: "yeni sahipte oluşacak yeni bir çalışan (worker) hatası, kendi lease'ine göre değerlendirilir" },
  },
  },
  "OPS-129": {
  shortName: "Birikim Kurtarma",
  name: "Birikim kurtarma → yeniden doğrula → kontrollü boşaltma → normal duruma dönüş",
  purpose: "Biriken bir yığını bilinçli şekilde işle; geçerliliğini yitirenleri at, geçerliliğini koruyanları ise hızını kontrol ederek işle.",
  nodes: {
    "t.capacity": { headline: "İşleme kapasitesi, birikimle birlikte toparlandı" },
    "a.inventory": { headline: "Birikimi yaş, öncelik, iş geçerliliği, son tarih, bağımlılık ve müşteri etkisine göre envanterle. Bu envanter, boşaltmayı bir toplu tahliyeye değil bilinçli bir karara dönüştürür" },
    "c.relevant": { headline: "Birikmiş işin tamamı hâlâ geçerli mi?", edges: [{ label: "Bir kısmı geçerliliğini yitirmiş", detail: "birikimin bir kısmı artık değişmiş durumları ya da artık uygun olmayan eylemleri tanımlıyor" }, { label: "Tamamı hâlâ geçerli", detail: "bekletilen her şeye hâlâ ihtiyaç var" }] },
    "a.cancel": { headline: "Geçerliliğini yitirmiş işi, gerekçesi kaydedilmiş şekilde iptal et veya engelle. Kuyruğa alındığı anda doğru olan müşteriye yönelik bir eylem, şimdi yanlış olabilir; bu adımın önlediği hata tam olarak, sırf bir zamanlar kuyruğa alındığı için o eylemi teslim etmektir" },
    "a.strategy": { headline: "Boşaltma stratejisini belirle - önceliğe dayalı, hız sınırlı, bağımlılık farkında, en eski geçerliden başlayan ya da politikanın tanımladığı başka bir yöntem. Yeni ve yüksek öncelikli bir iş, eski ve geçersiz bir birikimin arkasında beklemek zorunda değildir; katı bir varış sırası ise onu buna zorlardı" },
    "a.drain": { headline: "Alt sistemin kapasitesi dahilinde, her kalemin orijinal son tarihini ve iş bağlamını koruyarak kademeli olarak boşalt" },
    "w.monitor": { headline: "yeni iş için gecikme artana, hata oranı yükselene ya da alt sistem kapasitesi aşılana kadar", detail: "birikim normal aralığa döndüğünde zaman aşımına uğrar" },
    "a.throttle": { headline: "Boşaltma hızını düşür. Sistemi yeniden çökerten bir kurtarma, kurtarma değildir ve ikinci kesinti, kendi yaptığımız bir şey değil de yeni bir arızaymış gibi görünür" },
    "x.normal": { headline: "NORMAL; birikim boşaltıldı ve sistem kararlı", detail: "yeni bir olay, kendi envanteriyle kendi birikimini oluşturur" },
    "c.floor": { headline: "Hız daha da düşürülüp yine de ilerleme sağlanabilir mi?", edges: [{ label: "Yavaşlamaya alan var", detail: "birikimin küçülmeyi durdurduğu tabanın üzerinde, daha düşük bir hız hâlâ mevcut" }, { label: "Tabanda", detail: "birikim, sistemin tolere ettiği minimum hızda bile boşaltılamıyor" }] },
    "h.escalate": { headline: "Sorumluluk yükseltmesi → üst yetkili → çözüm veya iade", detail: "hiçbir güvenli hızda boşaltılamayan bir birikim" },
  },
  },
  "OPS-130": {
  shortName: "İş Sonucu Doğrulama",
  name: "Teknik tamamlanma → iş sonucunu doğrula → sonuçlandır veya mutabakat sağla",
  purpose: "Bir işin varlık nedeni olan durumun gerçekten oluştuğunu, işin kendi başarısının bunun kanıtı olmadığı her durumda kontrol et.",
  nodes: {
    "t.technical": { headline: "Teknik işleme başarı bildirdi" },
    "c.authoritative": { headline: "Teknik tamamlanmanın kendisi, burada iş tamamlanması için yetkili mi?", edges: [{ label: "Yetkili", detail: "işin kendi başarısı iş gerçeğinin ta kendisidir - yazdığını bildirdiği kaydı gerçekten yazmıştır" }, { label: "Yetkili değil", detail: "iş durumu, işin kendi içinden doğrulayamayacağı bir yerde bulunuyor" }] },
    "a.finalize": { headline: "İşi tamamlanmış olarak sonuçlandır ve bu iş türü için teknik tamamlanmanın yetkili olduğunu kaydet" },
    "a.verify": { headline: "İşin oluşturması amaçlanan iş durumunu doğrula - kayıt mevcut mu, durum geçişi gerçekleşti mi, kaynak kullanılabilir mi, bakiye güncellendi mi, hak (entitlement) uygulandı mı, alt sistem onayladı mı. Doğrulama, yapısı gereği idempotent'tir (yeniden kontrol etmek, güncel durumdan aynı sonucu yeniden hesaplar) ve kendi idempotencyKey'i, tekrarı güvenli kılan şey değil, tutarlı bir yapısal işarettir" },
    "x.complete": { headline: "tamamlandı; teknik başarı, iş gerçeğinin ta kendisiydi", detail: "aynı varlık üzerindeki başka bir iş, kendi başına ayrı bir kalemdir" },
    "c.confirmed": { headline: "Doğrulama ne gösteriyor?", edges: [{ label: "Doğrulandı", detail: "beklenen iş durumu mevcut" }, { label: "Eksik veya çelişkili", detail: "iş başarı bildirdi ama üretmesi gereken durum orada değil" }, { label: "Hâlâ asenkron olarak bekliyor", detail: "durumun ortaya çıkması bekleniyor ama henüz çıkmadı" }] },
    "a.business-complete": { headline: "İşin varlık nedeni olan yükümlülüğü kapatan durum olan BUSINESS_COMPLETED'i kaydet" },
    "a.reconcile": { headline: "RECONCILIATION_REQUIRED'ı kaydet: gerektirdiği iş durumu oluşmadan gerçekleşen teknik başarı. İşin SUCCESS'i, üretmesi gereken durum orada olmadığında kullanıcının veya işin yükümlülüğünü kapatmaz - bu, tamamlandı olarak bildirilmek yerine boşluğun görünür kalması için, her work_id başına bir kez kaydedilir (aynı work_id için yeniden gönderilen bir teknik tamamlanma raporu veya tekrarlanan bir zaman aşımı, ikinci bir kayıt açmak yerine aynı mutabakat kaydına çözülür)" },
    "w.pending": { headline: "beklenen iş durumu ortaya çıkana kadar", detail: "bu durum için sonuç penceresi geçtiğinde zaman aşımına uğrar" },
    "x.business-complete": { headline: "BUSINESS_COMPLETED; amaçlanan durum mevcut ve kontrol edildi", detail: "aynı varlık üzerindeki başka bir iş, kendi başına ayrı bir kalemdir" },
    "h.escalate": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "üretmesi gereken iş durumu olmadan gerçekleşen teknik başarı; boşluğun nasıl çözüleceğine dair yetkili bir karar gerekiyor" },
  },
  },
  "OPS-131": {
  shortName: "Süreç Rekabeti Hakemliği",
  name: "Bir dışlama kapsamında iki veya daha fazla süreç uygun hale geldi → hakemlik yap → tek bir sahip belirle",
  purpose: "Aynı anda uygun olan birkaç sürecin (akış) tanımlanmış bir dışlama grubunu paylaştığı durumlarda, çekişmeli bir kapsam örneğine hangisinin sahip olacağına atomik ve deterministik biçimde karar ver, ve kazanamayan herkese ne uygulanacağını belirle - GLB-01'den GLB-10'a kadar olan kuralları, kimsenin çalıştırmadığı bir politika olarak bırakmak yerine çalıştırılabilir hale getir.",
  nodes: {
    "t.contended": { headline: "Rakip süreçler aynı anda uygun hale geldi" },
    "a.load-contenders": { headline: "Bu (exclusion_group, scope_instance_id) çifti için şu anda uygun olarak tanımlanmış her süreç örneğini yükle; bu tetikleyicinin ateşlendiği andaki durumu doğru kabul etmek yerine, her birinin güncel uygunluğunu yetkili durumdan yeniden oku - bu eyleme ulaşana kadar geçen sürede uygunluk değişmiş olabilir ve zaten sonlanmış bir aday, gerçek bir aday değildir" },
    "c.still-contested": { headline: "Güncel uygunluk yeniden okunduktan sonra en az iki aday kalıyor mu?", edges: [{ label: "İkiden az kaldı", detail: "tetikleyiciden bu yana uygunluk değişti ve bu kapsam örneği için gerçekten uygun olan en fazla bir aday kaldı" }, { label: "İki veya daha fazla kaldı", detail: "en az iki bağımsız olarak uygun aday hâlâ aynı exclusion_group ve scope_instance_id'yi bildiriyor" }] },
    "x.no-contest": { headline: "hakemliğe gerek yok - bir kazanan seçilmesi gerekmeden önce, uygunluk değiştiği için çekişme kendiliğinden çözüldü", detail: "kendi yeniden okunmuş adaylarıyla gelen yeni bir tetikleyici, bunun devamı değil, yeni bir hakemliktir" },
    "c.precedence": { headline: "Tanımlı politika önceliği, kalan adayları tam olarak tek bir en üst sıradaki adaya ayırıyor mu?", edges: [{ label: "Kesin bir sıra var", detail: "kalan her adayın kendi tanımlı öncelik metni - ya da GLB-02'nin belirtilen politikanın ötesinde izin verdiği iki ayırt edicinin biri, yani güncel çıkarımlanmış bir duruma karşı yetkili taze bir olay, ya da yalnızca uygun olan bir adaya karşı aktif ve geçerli bir sahiplik - tam olarak tek bir en üst sıradaki adayı ortaya çıkarır" }, { label: "Gerçek beraberlik", detail: "tanımlı politika, iki veya daha fazla kalan adayı eşit konumda bırakıyor ve GLB-02 ayırt edicilerinden hiçbiri geçerli değil" }] },
    "a.claim": { headline: "En üst sıradaki aday için (exclusion_group, scope_instance_id) sahipliğini atomik olarak talep et: şu anda bir sahip yoksa, bunu sahip olarak belirle; eğer c.precedence'in okuması ile bu eylem arasında eş zamanlı bir değerlendirme aynı kimlik için zaten bir sahip belirlemişse, ikinci bir sahip belirlemek yerine mevcut sahibi döndür. Bu, CMS-201'in kendi yükümlülük oluşturma mekanizmasının kullandığı en-fazla-tek-kanonik-sonuç garantisinin aynısıdır; burada bir yükümlülüğe değil, çekişmeli bir kapsamın sahipliğine uygulanmıştır - bir kimlik için asla birden fazla talep başarılı olmaz ve yarışı kaybeden, bir hata değil yetkili kazananı alır" },
    "h.escalate": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "kalan adayları arasında politikayla çözülebilir bir öncelik bulunmayan bir rekabet" },
    "a.suppress-losers": { headline: "Kazanmayan her adayın kendi tanımlı onLoss davranışını uygula - engellendi, duraklatıldı, yerine yeni süreç geçti ya da çıkış; asla uydurulmuş veya varsayılan bir davranış değil - ve o adayın çalıştırılmak üzere zaten kuyruğa alınmış olan her şeyini, tetiklenmeden önce geçersiz kıl: kaybeden bir adayın kuyruğa alınmış mesajı veya eylemi, sırf kaybetmeden önce kuyruğa alınmış olduğu için çalışma hakkı kazanmaz (GLB-07)" },
    "w.ownership": { headline: "kazanan aday çözülene, süresi dolana, başarısız olana ya da bu kapsam örneği için başka bir şekilde uygunluğunu yitirene kadar", detail: "kazanan adayın kendi geçerli politikası makul bir azami sahiplik süresi belirtiyorsa, sınırlı bir kontrol aralığı geçtiğinde zaman aşımına uğrar; aksi halde serbest bırakma olayının kendisinin ötesinde zaman aşımına dayalı bir kontrol borcu yoktur" },
    "a.reevaluate": { headline: "(exclusion_group, scope_instance_id) için hakemliği, herhangi birinin son kazandığı veya kaybettiği andaki konumundan değil, güncel yetkili durumdan yeniden çalıştır (GLB-06). Daha önce engellenmiş bir aday hiçbir zaman kaldığı yerden basitçe devam ettirilmez (GLB-10) - tıpkı yeni bir aday gibi yeniden girer; güncel uygunluk, niyet, varlık durumu, izin, bekleme süresi (bekleme süresi) ve hedef tamamlanması açısından değerlendirilir - GLB-06'nın kendisinin adlandırdığı aynı liste" },
  },
  },
  "REL-100": {
  shortName: "Sahipsiz İlişki Kurtarma",
  name: "Zorunlu ilişki eksik → sahipsiz durum → çöz veya yeniden ata",
  purpose: "Eksik olan zorunlu bir ilişkiyi, aktif işlerin sessizce üzerinden yürüdüğü boş bir alan yerine, açık ve bulunabilir bir durum hâline getir.",
  nodes: {
    "t.missing": { headline: "Zorunlu ilişki eksik" },
    "a.state": { headline: "Varlığı ORPHANED olarak kaydet ve hangi ilişkinin eksik olduğunu belirt. Bu, boş bir alan değil, açık bir durumdur - boş alan sorgulanamaz ve yükseltilemez; sahibi olmayan bir varlık, sahibi olmayan bir varlık olarak bulunabilir olmalıdır. Devralınan son tarihler ve yükümlülükler bu süre boyunca işlemeye devam eder; sahipsiz kalmak bizim sorunumuzdur ve zaten borçlu olunanı durdurmaz" },
    "c.replacement": { headline: "Kesin bir yerine geçecek ilişki var mı?", edges: [{ label: "Tam olarak bir geçerli alternatif var", detail: "kurallar tek bir geçerli karşı tarafa işaret ediyor" }, { label: "Birden fazla olasılık var", detail: "birden fazla karşı taraf geçerli olabilir ve aralarında seçim yapacak bir kural yok" }, { label: "Hiçbiri mevcut değil", detail: "şu anda geçerli bir karşı taraf yok" }] },
    "a.reassign": { headline: "Yerine geçecek ilişkiyi kur; varlığın devraldığı son tarihleri ve yükümlülükleri olduğu gibi koru. Yeniden atama, kimin bağlı olduğunu değiştirir; ne borçlu olunduğunu veya ne zamana kadar olduğunu asla değiştirmez" },
    "h.manual": { headline: "Karar talebi → doğrula → yönlendir, reddet veya beklet", detail: "birden fazla olası alternatifi olan ve aralarında bir kural bulunmayan sahipsiz bir varlık" },
    "c.holding": { headline: "Bu varlık için güvenli, geçici bir bekletme kapsamı var mı?", edges: [{ label: "Bekletme kapsamı mevcut", detail: "açık bir çözülmemiş kuyruk veya durum, eksik bir ilişkiye karşı iş ilerlemeden onu bekletebilir" }, { label: "Yok", detail: "aktif iş buna karşı devam ederken hiçbir şey onu güvenle bekletemez" }] },
    "a.revalidate": { headline: "Devam etmeden önce varlığın mevcut durumunu, geri yüklenen ilişkiye göre yeniden doğrula. İlişki değiştiği için, varlığın yeni ilişki altında hak sahibi olduğu veya sorumlu olduğu şeyler, eski ilişki altındakinden farklı olabilir" },
    "a.hold": { headline: "Varlığı, devraldığı son tarihler ve yükümlülükler bozulmadan ve görünür şekilde, açık çözülmemiş kuyrukta beklet. Bekletilmiş olmak, birinin sorgulayabileceği ve yükseltebileceği bir durumdur; boş bir ilişki bunların hiçbiri değildir" },
    "h.escalate": { headline: "Sorumluluk yükseltme → üst yetki → çözüm veya geri dönüş", detail: "yeniden bağlanamayan sahipsiz bir varlık" },
    "x.resumed": { headline: "ilişki geri yüklendi; varlık yeniden doğrulandı ve devam ettirildi", detail: "sonraki eksik bir ilişki kendi sahipsiz durumunu açar" },
    "w.restore": { headline: "geçerli bir ilişki geri yüklenene veya kurulana kadar", detail: "zaman aşımı: Bu varlık türü için çözüm SLA'sı sona erdiğinde. (yapılandırma: orphaned_entity.restore)" },
    "c.terminal": { headline: "Çözüm SLA'sı geçti ve varlık hâlâ sahipsiz - politika ne yapıyor?", edges: [{ label: "Yükselt", detail: "varlık, bir sahibin arzu edilir değil zorunlu olmasını gerektiren yükümlülükler taşıyor" }, { label: "Nihai işlem", detail: "politika, yeniden bağlanamayan varlıklar için bir bitiş durumu tanımlıyor" }] },
    "x.terminal": { headline: "sahipsiz varlık, politikasının öngördüğü bitiş durumuna göre işleme alındı", detail: "daha sonra geçerli bir ilişkinin ortaya çıkması bunu yeniden açar; varlık hiçbir zaman sessizce elden çıkarılmadı" },
  },
  },
  "REL-284": {
  shortName: "Arkadaş Daveti Ödülü",
  name: "Davet kodu verildi → kullanıldı ya da kullanılmadı → ödül onaylandı ya da tek hatırlatma",
  purpose: "Bir davet kodu kullanıldığı anda her iki tarafın da kazandığı ödülü onaylamak; kimse kullanmamışsa kodu tekrar paylaşmaya tek bir hatırlatmayla yönlendirmek.",
  nodes: {
    "t.issued": { headline: "Davet kodu paylaşılmak üzere verildi" },
    "w.redeem": { headline: "kod kullanılana kadar", detail: "Zaman aşımı: kodun, bir hatırlatma göndermeye değecek kadar kullanılmadan geçebileceği süre. (örnek: 3 gün; şunu ayarla: referral_invite.redeem_window)" },
    "c.redeemed": { headline: "Kod kullanıldı mı?", edges: [{ label: "Kullanıldı", detail: "bir arkadaş kodu kullandı" }, { label: "Henüz değil", detail: "kodu kimse kullanmadı" }] },
    "a.reward": { headline: "Her iki tarafın da kazandığı ödülü, gerçekte kazanılan tutarı ve nasıl kullanılacağını belirt" },
    "x.rewarded": { headline: "kod kullanıldıktan sonra daveti gönderen kişiye ödül onaylandı", detail: "aynı kişiye verilecek yeni bir kod kendi örneğini açar" },
    "a.nudge": { headline: "Kodun hâlâ kullanılmadığını hatırlat ve tekrar paylaşmaya yönlendir; paylaşırlarsa kendilerinin ve bir arkadaşlarının ne kazanacağını belirt" },
    "x.unused": { headline: "kullanım penceresinin ardından kod kullanılmadı; başka bir şey gönderilmiyor", detail: "kodun sonradan kullanılması bunu kullanım olayından yeniden açar; yeni verilen bir kod kendi örneğidir" },
  },
  },
  "REL-91": {
  shortName: "İlişki Doğrulama",
  name: "Varlık ilişkisi oluşturuldu → doğrula → etkinleştir veya reddet",
  purpose: "İki varlık arasında yalnızca ilişkinin kendisi yetkili bir dayanağa sahip olduğunda bağlantı kur ve bunu bir birleştirme değil, bir bağlantı olarak tut.",
  nodes: {
    "t.requested": { headline: "İlişki oluşturma talebi alındı veya tespit edildi" },
    "a.define": { headline: "İlişki türünü, kaynağını, ne zaman yürürlüğe gireceğini, kapsamını ve kurulması için hangi yetki veya kanıtın gerektiğini belirle. Anlamın yönlü olduğu durumlarda yön, sonradan çıkarılacak bir özellik değil, türün kendisinin bir parçasıdır" },
    "c.authority": { headline: "Bu ilişkinin kurulması taraflardan birinin doğrulamasını veya onayını gerektiriyor mu?", edges: [{ label: "Doğrulama veya onay gerekli", detail: "ilişki, bir tarafın kabul etmesi gereken haklar, sorumluluk veya görünürlük sağlıyor" }, { label: "Hiçbiri gerekli değil", detail: "ilişki idari niteliktedir ve onay gerektiren hiçbir şey sağlamaz" }] },
    "h.verify": { headline: "Doğrulama gereksinimi → kanıt topla → engellenen süreci sürdür", detail: "oluşturulması doğrulama veya onaya bağlı bir ilişki" },
    "c.valid": { headline: "İlişki, mevcut kanıtlara göre geçerli mi?", edges: [{ label: "Geçerli", detail: "dayanak yeterlidir ve bu varlık türleri arasında ilişkiye izin verilmektedir" }, { label: "Kanıt bekleniyor", detail: "ilişki makul görünüyor ancak dayanak henüz yeterli değil" }, { label: "Geçersiz", detail: "ilişkiye izin verilmiyor ya da dayanak buna ters düşüyor" }] },
    "a.activate": { headline: "Türü, yönü, kapsamı ve yürürlük zamanıyla birlikte ACTIVE_RELATIONSHIP kaydını oluştur. Bir ilişki kurmak iki varlığı birbirine bağlar, hiçbir şeyi birleştirmez - her iki varlık da kendi kimliğini, kendi yaşam döngüsününı ve kendi geçmişini korur" },
    "x.pending": { headline: "PENDING_EVIDENCE; ilişki etkin değil", detail: "yeterli dayanağın sonradan sağlanması ilişkiyi etkinleştirir. Bekleyen bir ilişkiden hiçbir şey doğmaz; bekleyen ile etkin arasındaki fark da budur" },
    "x.rejected": { headline: "REJECTED; ilişki oluşturulmadı", detail: "farklı bir dayanak kendi koşullarına göre ayrıca değerlendirilir" },
    "x.active": { headline: "ACTIVE_RELATIONSHIP", detail: "üzerindeki değişiklikler REL-92'ye, sonlanması ise REL-93'e aittir" },
  },
  },
  "REL-92": {
  shortName: "İlişki Etkisi Yeniden Hesaplama",
  name: "İlişki değişikliği → hak ve yükümlülükleri yeniden hesapla → devam et",
  purpose: "Bir ilişki değiştiğinde yalnızca ona bağlı olanı yeniden hesapla, başka hiçbir şeyi değil.",
  nodes: {
    "t.changed": { headline: "İlişki durumu veya türü değişti" },
    "a.record": { headline: "Önceki ilişkiyi, yeni ilişkiyi, değişikliğin ne zaman ve neden yürürlüğe girdiğini üzerine yazmak yerine ekleyerek kaydet. Eski ilişkinin kapsadığı dönem okunabilir kalır" },
    "a.identify": { headline: "Bu ilişkiye gerçekten neyin bağlı olduğunu belirle: haklar, sorumluluklar, hak edişler, yönlendirme, izinler ve devam eden yükümlülükler. Bu listede olmayan hiçbir şeye dokunulmaz" },
    "a.invalidate": { headline: "Yerine geçilen ilişkiye bağlı olarak sıraya alınmış eylemleri geçersiz kıl. Değişmiş bir ilişki altında zamanlanmış bir eylem, artık var olmayan bir yapı adına yürütülür" },
    "c.affected": { headline: "Bağımlı herhangi bir durum gerçekten etkileniyor mu?", edges: [{ label: "Buna bağlı bir şey var", detail: "bu nedenle en az bir hak, yükümlülük veya izin değişiyor" }, { label: "Buna bağlı hiçbir şey yok", detail: "değişiklik tanımlayıcı niteliktedir ve sonraki hiçbir süreç bunu okumaz" }] },
    "c.responsibility": { headline: "Herhangi bir şeyin sorumluluğu gerçekten el değiştiriyor mu?", edges: [{ label: "Sorumluluk el değiştiriyor", detail: "bu değişiklik nedeniyle açık bir yükümlülükten başka biri sorumlu hâle geliyor" }, { label: "Sorumluluk aynı kalıyor", detail: "haklar veya izinler değişirken sorumlu taraf aynı kalıyor" }] },
    "x.recorded": { headline: "ilişki güncellendi; başka hiçbir şey yeniden hesaplanmadı", detail: "bir sonraki değişiklik yeni ilişkiye göre değerlendirilir" },
    "h.ownership": { headline: "Sahiplik değişikliği → yükümlülükleri devret → devam et", detail: "açık bir yükümlülüğün sorumluluğunu başkasına taşıyan bir ilişki değişikliği" },
    "a.recalculate": { headline: "Yalnızca etkilenen hak ve yükümlülükleri, tam bir yeniden oluşturma değil, kapsamı sınırlı bir fark olarak yeniden hesapla" },
    "c.entitlement": { headline: "Değişiklik, hak ediş kapsamını değiştiriyor mu?", edges: [{ label: "Hak edişi etkiliyor", detail: "ilişki, bir hak edişin dayandığı temelin parçasıdır" }, { label: "Hak edişi etkilemiyor", detail: "değişen şey herhangi bir hak ediş dayanağının dışında kalıyor" }] },
    "h.entitlement": { headline: "Hak ediş değişikliği → kapsamı yeniden hesapla → genişlet, daralt veya koru", detail: "bir hak ediş dayanağını değiştiren ilişki değişikliği" },
    "x.recalculated": { headline: "bağımlı hak ve yükümlülükler yeniden hesaplandı; başka hiçbir şeye dokunulmadı", detail: "sonraki bir değişiklik yeni durumdan itibaren yeniden hesaplama yapar" },
  },
  },
  "REL-93": {
  shortName: "Varlık İlişkisi Sonlandırma Uzlaştırması",
  name: "İlişkinin sona ermesi → gelecekteki bağımlılığı kaldır → mevcut yükümlülükleri uzlaştır",
  purpose: "Bir ilişkinin ileriye taşıdığı şeyi durdur, ama geçerli şekilde ürettiği şeyi iptal etme.",
  nodes: {
    "t.ended": { headline: "İlişki sona erdi" },
    "a.record-end": { headline: "İlişkinin ne zaman ve neden sona erdiğini, geçmişine ekleyerek kaydet. İlişkinin var olmuş olması, sona ermesiyle geçersiz hâle gelmez; kapsadığı dönem okunabilir kalır - o dönemde üstlenilen taahhütler, ilişkinin o an gerçek olmasına dayanıyordu" },
    "a.future": { headline: "Bu ilişkiye bağlı gelecekteki hak ve yetkileri belirle ve bunları geçerlilik bitiş tarihinden itibaren kaldır veya yeniden hesapla. Aynı varlıklar arasındaki ilgisiz ilişkilere ve farklı bir dayanağa oturan hiçbir şeye dokunulmaz" },
    "c.obligations": { headline: "İlişki geçerliyken herhangi bir yükümlülük oluşturuldu mu?", edges: [{ label: "Bekleyen yükümlülükler var", detail: "bu ilişki kapsamında açık bir vaka, onaylanmış bir rezervasyon, onaylanmış bir talep, mevcut bir hak ediş veya mali bir yükümlülük oluşturuldu" }, { label: "Bekleyen bir şey yok", detail: "ilişki yalnızca gelecekteki davranışı taşıyordu" }] },
    "h.reconcile": { headline: "external:commitment-reconciliation", detail: "kapsamında oluşturulan yükümlülükleri hâlâ geçerliyken sona eren bir ilişki" },
    "c.retention": { headline: "Veri veya geçmiş, ilişkinin ötesinde saklanmalı mı?", edges: [{ label: "Saklama geçerli", detail: "politika veya mevzuat, kaydın ilişkiden sonra da varlığını sürdürmesini gerektiriyor" }, { label: "Saklama gereği yok", detail: "ilişki kaydının kendisi dışında saklanması gereken bir şey yok" }] },
    "a.retain": { headline: "İlgili politikaya göre sakla; kaydın hâlâ canlı bir ilişki gibi görünmesi yerine, sona ermiş bir ilişki kapsamında saklandığı belirtilir" },
    "x.ended": { headline: "ilişki sona erdi; geçmiş bozulmadan kaldı, yükümlülükler ayrıca uzlaştırıldı", detail: "aynı varlıklar arasında kurulan yeni bir ilişki kendi dayanağı üzerine kurulur ve bu ilişkinin canlandırılması değil, farklı bir ilişkidir" },
  },
  },
  "REL-94": {
  shortName: "Rol Yetkisi Güncellemesi",
  name: "Rol değişikliği → yetki ve kapasite farkı → uygula",
  purpose: "Bir kişinin bundan sonra yapabileceklerini, iki rol arasındaki farka göre değiştir; eski rolü altında yaptıklarına dokunma.",
  nodes: {
    "t.role": { headline: "Rol değişti" },
    "a.delta": { headline: "Önceki ve yeni rolü karşılaştır ve kapasite ile yetki farkını hesapla. Uygulanan şey bu farktır - her iki rolde de bulunan bir kapasite iptal edilip yeniden verilmez; bu, kullanıcının idari bir değişikliğin ortasında bir kesinti yaşaması anlamına gelirdi" },
    "c.pending": { headline: "Bekleyen bir iş veya açık bir onay, önceki rolün taşıdığı yetkiye mi dayanıyor?", edges: [{ label: "Eski yetki altında bekleyen kararlar", detail: "bir onay, karar veya atama açık durumda ve yerini alınan rol altında geçerliydi" }, { label: "Bekleyen bir şey yok", detail: "açık hiçbir karar önceki role bağlı değil" }] },
    "h.authority": { headline: "Karar yetkisi değişikliği → bekleyen kararları yeniden doğrula → devret veya devam et", detail: "yerini aldığı yetki altında bekleyen kararları olan bir rol değişikliği" },
    "c.direction": { headline: "Fark hangi yönde ilerliyor?", edges: [{ label: "Yalnızca yetki ekliyor", detail: "yeni rol kapasite ekliyor ve hiçbirini kaldırmıyor" }, { label: "Kaldırıyor veya karma", detail: "başka kapasiteler eklenmiş olsun ya da olmasın, en az bir kapasite artık taşınmıyor" }] },
    "h.entitlement": { headline: "Hak ediş değişikliği → kapsamı yeniden hesapla → genişlet, daralt veya koru", detail: "yalnızca kapasite ekleyen bir rol değişikliği" },
    "a.apply": { headline: "Farkı uygula: yeni rolün eklediğini ver, kaldırdığını ise her kapasitenin kendi bağımlılık kurallarına göre iptal et veya kısıtla. Önceki rol altında geçerli şekilde yapılmış eylemler geçersiz kılınmaz - bir rol düşürme, kişinin bundan sonra yapabileceklerini değiştirir, daha önce yaptıklarını asla değiştirmez" },
    "x.applied": { headline: "yetki ve kapasite farkı uygulandı; önceki eylemler bozulmadan kaldı", detail: "sonraki bir rol değişikliği mevcut role göre karşılaştırılır" },
  },
  },
  "REM-151": {
  shortName: "Satış Sonrası Sorun Çözümü",
  name: "Tamamlanma sonrası sorun → türüne göre yönlendirildi → çözüldü ya da bir kişiye aktarıldı",
  purpose: "Bildirilen bir sorunu kendi türüne uygun sürece yönlendirmek, çözüm onaylanana ya da süre dolana kadar konuyu takip etmek ve çözülmediği an bir kişiye aktarmak.",
  nodes: {
    "t.reported": { headline: "Tamamlanma sonrası sorun bildirildi" },
    "c.type": {
      headline: "Bu ne tür bir sorun?",
      edges: [
        { label: "Ürün hasarlı ya da yanlış", detail: "gelen şey borçlanılan değil, ya da hasarlı geldi" },
        { label: "Çalışmıyor ya da kullanım sorunu", detail: "gelen şey doğru ama çalışmıyor, ya da kişi çalıştıramıyor" },
        { label: "Teslimat eksik", detail: "teslimat kaydı tamamlanmış görünüyor ama borçlanılanın bir kısmı gelenler arasında yok" },
      ],
    },
    "a.route-correction": { headline: "Hasarlı ya da yanlış gelen bir ürün için sorunu iade/değişim sürecine (REM-152) yönlendir ve yönlendirme kararını kaydet" },
    "a.route-support": { headline: "Arıza ya da kullanım sorununu giderebilecek bir kişiye sorunu yönlendir ve yönlendirme kararını kaydet" },
    "a.route-delivery": { headline: "Teslimattan eksik kalan kısım için sorunu başarısız teslimat kurtarma sürecine (FUL-148) yönlendir ve yönlendirme kararını kaydet" },
    "w.resolve": {
      headline: "kişi çözümü onaylayana ya da reddedene kadar",
      detail: "Zaman aşımı: yönlendirilen sürecin sorunu çözmesi için sabit bir süre tanınır; sonu olmayan bir süre döngüyü hiç kapatmaz. (örnek: 7 gün; şunu ayarla: post_completion_issue.resolution_window)",
    },
    "c.resolved": {
      headline: "Sorun çözüldü mü?",
      edges: [
        { label: "Çözüldü", detail: "kişi yönlendirilen sürecin sorunu çözdüğünü onayladı" },
        { label: "Çözülmedi", detail: "kişi çözümü reddetti, ya da süre onay gelmeden kapandı" },
      ],
    },
    "a.followup": { headline: "Yönlendirilen sürecin sorunu çözdüğü onaylandığına göre kısa bir memnuniyet kontrolü gönder" },
    "h.escalate": { headline: "İnsan katılımlı süreç", detail: "kişi çözümü reddetti, ya da çözüm süresi onay gelmeden kapandı" },
    "x.resolved": { headline: "Çözüldü", detail: "aynı tamamlanmaya karşı yeni bir sorun kendi örneğini açar" },
  },
  },
  "REM-152": {
  shortName: "Ürün İadesi Talebi",
  name: "İade talebi → uygunluk → onaylama, reddetme veya inceleme",
  purpose: "Bir şeyin iade sürecine girip giremeyeceğine, para borçlu olunup olunmadığından ayrı bir karar olarak karar vermek.",
  nodes: {
    "t.requested": { headline: "İade talep edildi" },
    "a.capture": { headline: "Talep kimliğini, ürünü veya kaynağı, miktarı veya kapsamı, gerekçeyi, talep sahibini ve talep zamanını kaydet" },
    "c.applicable": { headline: "Bu durum için iade süreci geçerli mi?", edges: [{ label: "İade edilebilir", detail: "söz konusu şey fiziksel olarak ya da geri alınabilir bir teslimat olarak mevcut ve geri gönderilebilir" }, { label: "İade edilecek bir şey yok", detail: "teslimat gerçekleştirilen bir hizmetti, tüketilmiş bir kaynaktı ya da iade yolu olmayan bir şeydi" }] },
    "c.policy": { headline: "Bunun için bir iade uygunluk politikası tanımlı mı?", edges: [{ label: "Tanımlı", detail: "politika, neyin, hangi süre içinde ve hangi koşullarla iade edilebileceğini belirtir" }, { label: "Tanımlı değil", detail: "bu tür iadeleri kapsayan bir politika yok" }] },
    "h.alternative": { headline: "Çözüm seçimi → yükümlülüğü karşılama → gerekirse mali devir", detail: "iade edilemeyecek bir şey için talep edilen iade" },
    "c.eligible": { headline: "Politika ne belirliyor?", edges: [{ label: "Uygun", detail: "politikanın koşulları kesin biçimde karşılanıyor" }, { label: "Uygun değil", detail: "politika bunu kesin biçimde devre dışı bırakıyor" }, { label: "İnceleme veya kanıt gerektirir", detail: "politika bu durumu bir kurala değil, bir karara bırakıyor" }] },
    "h.undefined": { headline: "Karar talebi → doğrulama → yönlendirme, reddetme veya bekletme", detail: "geçerli bir uygunluk politikası bulunmayan bir iade talebi" },
    "a.authorize": { headline: "Kapsam, yöntem ve geçerlilikle birlikte RETURN_AUTHORIZED kaydını oluştur. Bir iadeyi onaylamak, kaynağın geri gelmesine izin verir ve para borçlu olunup olunmadığına dair hiçbir şey belirlemez - geri ödeme uygunluğu, kendi kuralları ve kendi yanıtı olan ayrı bir sorudur" },
    "a.reject": { headline: "İadeyi devre dışı bırakan politikadan alınan gerekçeyle birlikte RETURN_REJECTED kaydını oluştur" },
    "a.review": { headline: "RETURN_UNDER_REVIEW kaydını oluştur ve kararın gerektirdiği bilgileri topla. İnceleme sürerken hiçbir şey onaylanmaz" },
    "a.notify-authorization": { headline: "Talep sahibine iadenin hangi kapsamda ve hangi yöntemle onaylandığını, bu onayın kaynağın geri gelmesine izin verdiğini ama para borçlu olunduğuna karar vermediğini bildir. Yanıtı taşıma sürecinden kendisinin öğrenmesine bırakmak, bir sonraki adımın karardan önce gelmesine yol açar" },
    "a.notify-rejection": { headline: "Talep sahibine iadenin reddedildiğini ve bunun gerekçesini bildir; bu ister politika tarafından doğrudan devre dışı bırakılmış olsun ister bir inceleyen kişi tarafından reddedilmiş olsun. Kendisine hiçbir şey bildirilmeyen kişi, elindeki ürünle ilgili iadenin hâlâ geleceğini düşünmeye devam eder" },
    "w.decision": { headline: "talep üzerinde onaylanmış bir karar kaydedilene kadar", detail: "Karar SLA'sı dolduğunda zaman aşımına uğrar. (configure return_authorization.decision)" },
    "h.transit": { headline: "İade onaylandı → yolda, teslim alındı, kayboldu veya süresi doldu", detail: "onaylanmış bir iade" },
    "x.rejected": { headline: "RETURN_REJECTED; asıl teslimat değişmeden kalır", detail: "reddedilen bir iade, başka bir çözümün borçlu olunup olunmadığını belirlemez - bu ayrı bir sorudur ve ayrıca sorulur" },
    "c.decision": { headline: "Ne karar verildi?", edges: [{ label: "Onaylandı", detail: "inceleyen kişi iadeye izin verdi" }, { label: "Reddedildi", detail: "inceleyen kişi reddetti" }] },
    "h.escalate": { headline: "Sorumluluk yükseltmesi → üst yetkili → çözüm veya iade", detail: "SLA süresini aşan bir iade kararı" },
  },
  },
  "REM-156": {
  shortName: "Düzeltici Yeniden Gerçekleştirme",
  name: "Yeniden gerçekleştirme veya düzeltme → uygulama → düzeltilmiş sonucu doğrulama",
  purpose: "İlk sonucun hatalı olduğunu kayıt hâlâ gösterirken, üretilmesi gereken sonucu üretmek.",
  nodes: {
    "t.authorized": { headline: "Düzeltme veya yeniden gerçekleştirme onaylandı" },
    "a.define": { headline: "Kusuru, etkilenen kapsamı, düzeltilmiş sonucun fiilen neye benzeyeceğini, bunun sorumlusunu ve varsa son tarihi tanımla. CORRECTION_REQUIRED kaydını oluştur" },
    "a.preserve": { headline: "Orijinal hatalı sonucu geçmiş kayıt olarak koru. Düzeltme, bir düzenleme değil, yeni bir düzeltici işlemdir - orijinali sanki hep doğruymuş gibi yeniden yazmak, bir şeyin düzeltilmesi gerektiğine dair kanıtı ortadan kaldırır ve bununla birlikte aynı hatanın başka işlerde tekrarlandığını görme imkânını da yok eder" },
    "a.execute": { headline: "Tanımlanan düzeltilmiş sonuca göre düzeltmeyi veya yeniden gerçekleştirmeyi uygula" },
    "w.correction": { headline: "düzeltilmiş bir sonuç üretilene ya da düzeltme başarısız olana kadar", detail: "Düzeltme için belirlenen son tarih dolduğunda zaman aşımına uğrar. (configure correction_reperformance.correction)" },
    "c.outcome": { headline: "Düzeltme neyi ortaya çıkardı?", edges: [{ label: "Düzeltilmiş bir sonuç", detail: "iş yeniden yapıldı ya da kusur, etkilenen kapsamın tamamında giderildi" }, { label: "Kısmen düzeltildi", detail: "etkilenen kapsamın bir kısmı artık doğru, bir kısmı değil" }, { label: "Başarısız", detail: "düzeltme, gereken sonucu üretemedi" }] },
    "h.escalate": { headline: "Sorumluluk yükseltmesi → üst yetkili → çözüm veya iade", detail: "son tarihini aşan bir düzeltme" },
    "h.verify": { headline: "Çözümün uygulanması → sonucu doğrulama → kapatma veya çözüm sürecine devam etme", detail: "bir sonuç üreten düzeltme" },
    "a.partial": { headline: "Neyin düzeltildiğini ve neyin hâlâ eksik kaldığını açıkça kaydet. Yarım bir düzeltmenin tam bir düzeltme olarak kaydedilmesi, hâlâ geçerli olan bir yükümlülüğü kapatmış gibi gösterir" },
    "h.alternative": { headline: "Çözüm seçimi → yükümlülüğü karşılama → gerekirse mali devir", detail: "gereken sonucu üretemeyen bir düzeltme" },
  },
  },
  "REM-157": {
  shortName: "Çözüm Onayı",
  name: "Çözüm seçimi → yükümlülüğü karşılama → gerekirse mali devir",
  purpose: "Gerçekten mevcut olan seçenekler arasından, çözülmemiş yükümlülüğü fiilen karşılayacak çözümü seçmek.",
  nodes: {
    "t.decision": { headline: "Çözüm kararı gerekiyor" },
    "a.obligation": { headline: "Çözülmemiş yükümlülüğü kesin biçimde tanımla - borçlu olunup da teslim edilmeyen neydi, ya da teslim edilip de borçlu olunan şey olmayan neydi. Çözüm, şikâyeti değil bu yükümlülüğü karşılamak üzere seçilir; yaşanan sıkıntının tazmini ise ayrı bir sorudur ve ayrıca ele alınır" },
    "a.evaluate": { headline: "Politikanın bu yükümlülük için fiilen sunduğu çözümleri değerlendir. Teslim edilemeyecek bir çözüm sunulmaz - böyle bir şey sunmak, çözülebilir bir sorunu ikinci kez tutulmayan bir söze dönüştürür ve bu ikincisi ilkinden daha pahalıya mal olur" },
    "c.choice": { headline: "Karşı taraf çözümler arasında bir seçim yapıyor mu?", edges: [{ label: "Kendisi seçiyor", detail: "yükümlülüğü karşılayabilecek birden fazla çözüm mevcut ve tercih kendisine ait" }, { label: "Yapılacak bir seçim yok", detail: "tek bir çözüm geçerli ya da bunu politika belirliyor" }] },
    "a.present": { headline: "Yalnızca gerçekten mevcut olan seçenekleri, her birinin ne anlama geleceğiyle birlikte sun" },
    "c.route": { headline: "Yükümlülüğü hangi çözüm karşılıyor?", edges: [{ label: "Düzeltme veya yeniden gerçekleştirme", detail: "mevcut olan düzeltilebilir ya da hizmet yeniden gerçekleştirilebilir" }, { label: "Değişim", detail: "yükümlülüğü karşılayan şey, o ürünün başka bir örneğidir" }, { label: "Önce iade", detail: "başka bir çözümün kesinleşebilmesi için önce kaynağın geri gelmesi gerekiyor ve bu sorun için daha önce reddedilmiş bir iade yok - REM-152, reddedilmiş bir iadeyi buraya bir alternatif olarak geri yönlendirdiğinde bu iade tekrar seçilmez; bu yönlendirme zaten reddin kaydedilmiş olduğu haliyle bu aynı koşula ulaşır ve bu dal ikinci kez geçersiz olur" }, { label: "Geri ödeme veya alacak", detail: "yükümlülüğün gerektirdiği çözüm paradır" }, { label: "Borçlu olunan bir çözüm yok", detail: "yükümlülüğün zaten karşılandığı ortaya çıkıyor ya da politika kapsamında geçerli bir çözüm yok" }] },
    "w.selection": { headline: "kişi bir çözüm seçene kadar", detail: "Çözüm seçimi, seçeneklerin sunulmasından itibaren sınırlı bir süre beklenir; yanıtlanmayan bir seçim politikanın varsayılanını alır. (configure remedy_selection.selection)" },
    "a.confirm-correction": { headline: "Onaylamadan önce yükümlülüğü yeniden oku - başka bir yerde başlamış bir düzeltme ya da bu sırada karşılanmış bir yükümlülük, hâlâ açık bir karar olarak onaylanmaz. Düzeltme veya yeniden gerçekleştirmenin yükümlülüğü karşılayan çözüm olduğunu ve şimdi ne olacağını belirt; seçim penceresi zaman aşımına uğradıysa politikanın varsayılanının uygulandığını ve bir seçim yapılmadığını adlandır. Alıcı sürecin taahhüt etmediği bir tarihi iddia etme, ve çözümün zaten tamamlandığını asla söyleme - seçildi, henüz uygulanmadı" },
    "a.confirm-replacement": { headline: "Onaylamadan önce yükümlülüğü yeniden oku - başka bir yerde başlamış bir değişim ya da bu sırada karşılanmış bir yükümlülük, hâlâ açık bir karar olarak onaylanmaz. Değişimin yükümlülüğü karşılayan çözüm olduğunu ve şimdi ne olacağını belirt; seçim penceresi zaman aşımına uğradıysa politikanın varsayılanının uygulandığını ve bir seçim yapılmadığını adlandır. Alıcı sürecin taahhüt etmediği bir tarihi iddia etme, ve çözümün zaten tamamlandığını asla söyleme - seçildi, henüz uygulanmadı" },
    "a.confirm-return": { headline: "Onaylamadan önce yükümlülüğü yeniden oku - başka bir yerde başlamış bir iade ya da bu sırada karşılanmış bir yükümlülük, hâlâ açık bir karar olarak onaylanmaz. İadenin, her şeyden önce, yükümlülüğü karşılayan çözüm olduğunu ve şimdi ne olacağını belirt; seçim penceresi zaman aşımına uğradıysa politikanın varsayılanının uygulandığını ve bir seçim yapılmadığını adlandır. Alıcı sürecin taahhüt etmediği bir tarihi iddia etme, ve çözümün zaten tamamlandığını asla söyleme - seçildi, henüz uygulanmadı" },
    "a.confirm-refund": { headline: "Onaylamadan önce yükümlülüğü yeniden oku - başka bir yerde başlamış bir geri ödeme ya da bu sırada karşılanmış bir yükümlülük, hâlâ açık bir karar olarak onaylanmaz. Geri ödeme veya alacağın yükümlülüğü karşılayan çözüm olduğunu ve şimdi ne olacağını belirt; seçim penceresi zaman aşımına uğradıysa politikanın varsayılanının uygulandığını ve bir seçim yapılmadığını adlandır. Yalnızca çözümü adlandır - tutarı asla, ne zaman görüneceğini asla, hesaba geçip geçmediğini asla, alıcı sürecin taahhüt etmediği bir tarihi asla ve çözümün zaten tamamlandığını asla söyleme" },
    "h.correction": { headline: "Yeniden gerçekleştirme veya düzeltme → uygulama → düzeltilmiş sonucu doğrulama", detail: "düzeltme veya yeniden gerçekleştirme seçildi ve onaylandı" },
    "h.replacement": { headline: "Değişim kararı → tahsis etme → teslim etme → onaylama", detail: "değişim seçildi ve onaylandı" },
    "h.return": { headline: "İade talebi → uygunluk → onaylama, reddetme veya inceleme", detail: "çözümün kesinleşebilmesi için gereken, onaylanmış bir iade" },
    "h.financial": { headline: "Geri ödeme talebi → uygunluk → onaylama, reddetme veya inceleme", detail: "çözüm olarak seçilen ve onaylanan geri ödeme veya alacak" },
    "a.no-remedy": { headline: "Yükümlülüğün karşılanmış sayıldığını ya da politikanın doğrulanan durum için bir çözüm sunmadığını belirt ve yalnızca gerçekten var olduğu durumlarda ayrı bir itiraz veya yükseltme yolu belirt. Bu süreç doğrulanmış bir sorundan başlar - çözüm bulunamadığında hiçbir şey söylenmemesi, kişinin konunun hâlâ açık olduğunu düşünmesine yol açar" },
    "a.default": { headline: "Varsa politikanın varsayılan olarak tanımladığı çözümü uygula; varsayılanı bir seçimmiş gibi göstermek yerine, herhangi bir seçim yapılmadığını kaydet" },
    "x.no-remedy": { headline: "borçlu olunan bir çözüm yok; yükümlülük karşılanmış ya da geçerli bir yükümlülük yok", detail: "yükümlülükle ilgili yeni kanıt bu süreci yeniden açar. Etkiye ilişkin tazminat, uygun görülürse, bu sonucun herhangi bir yönde karara bağlamadığı ayrı bir konudur" },
  },
  },
  "RET-21": {
  shortName: "Etkileşim Yeniden Sınıflandırması",
  name: "Etkileşim durumu değişikliği → yeniden sınıflandırma → uygun yaşam döngüsü",
  purpose: "Etkileşimi her iki yöne de hareket edebilen bir durum olarak ele alın ve bir hareketin harekete geçmeye değip değmediğine ayrı olarak karar verin.",
  nodes: {
    "t.changed": { headline: "Etkileşim durumu belirgin şekilde değişti" },
    "a.evaluate": { headline: "Yeni durumu ortak bir karşılaştırma ölçütüne göre değil, bu ilişkinin kendi ritminin öngördüğüne göre değerlendirin - aynı aylık ritim bir üründe sağlıklıyken bir başkasında endişe vericidir" },
    "c.direction": { headline: "Durum hangi yöne hareket etti?", edges: [{ label: "İyileşti", detail: "yeni durum, yerini aldığı durumdan daha güçlü" }, { label: "Kötüleşti", detail: "yeni durum, yerini aldığı durumdan daha zayıf" }] },
    "a.improved": { headline: "İyileşmeyi kaydedin ve yalnızca daha zayıf durum nedeniyle var olan müdahaleleri, halihazırda sıraya alınmış olanlar dahil, durdurun - zaten yeniden etkileşime geçmiş birine gönderilen bir yeniden etkileşim hatırlatması, hiçbir şeyin izlenmediğinin en açık kanıtıdır" },
    "c.expected": { headline: "Bu ilişki için düşüş beklenen bir durum mu, yoksa anormal mi?", edges: [{ label: "Beklenen", detail: "örüntü biliniyor - mevsimsel, dönemsel, biten bir proje veya bu hesabın her zaman sahip olduğu bir ritim" }, { label: "Anormal", detail: "düşüş, bu ilişkinin kendi geçmişinin öngördüğünden sapıyor" }] },
    "x.updated": { headline: "etkileşim durumu güncellendi, hiçbir şey tetiklenmedi", detail: "bir sonraki belirgin değişiklik bunu yeniden açar; bu sürecin çoğu geçişi doğru şekilde burada sona erer - bir durum değişmiş, hiçbir şey gönderilmemiştir" },
    "c.intervention": { headline: "Bu anormallik anlamlı bir müdahaleyi gerektiriyor mu?", edges: [{ label: "Harekete geçmeye değer", detail: "düşüş, teşhis edilmeye değecek kadar büyük veya yeterince destekleniyor" }, { label: "Yalnızca durum güncellemesi", detail: "hareket gerçek ama küçük, buna müdahale etmek değerinden fazla dikkat gerektirir" }] },
    "h.health": { headline: "Sağlık kötüleşmesi → nedeni teşhis et → kurtarma rotası", detail: "teşhis edilmeye değer, anormal bir etkileşim düşüşü" },
  },
  },
  "RET-22": {
  shortName: "Kullanım Açığı Değerlendirmesi",
  name: "Beklenen kullanım kaçırma → bağlam kontrolü → gözlemle ya da müdahale et",
  purpose: "Kaçırılan bir kullanım beklentisini yalnızca gerçekten bir beklenti var olduğunda ve başka bir şey bunu desteklediğinde kanıt olarak değerlendirin.",
  nodes: {
    "t.missed": { headline: "Beklenen kullanım kilometre taşı ya da ritmi kaçırıldı" },
    "a.compare": { headline: "Gerçek davranışı, hesap geneli ya da ürün geneli bir ortalamayla değil, bu kullanım senaryosu ve bu rol için beklenen örüntüyle karşılaştırın" },
    "c.episodic": { headline: "Bu kullanım doğası gereği dönemsel ya da mevsimsel mi?", edges: [{ label: "Dönemsel ya da mevsimsel", detail: "ürün patlamalar halinde, etkinlikler etrafında ya da sessiz bir dönemi normal kılan aralıklarla kullanılıyor" }, { label: "Sürekli beklenti", detail: "bu ilişki gerçekten gerçekleşmeyen bir kullanımı öngörmüştü" }] },
    "x.normal-quiet": { headline: "normal örüntü içinde sessiz bir dönem; gözlem sürüyor, hiçbir şey gönderilmedi", detail: "dönemsel örüntünün kendisinden sapan bir kaçırma - atlanan bir sezon, kaçırılan bir etkinlik döngüsü - bunu usulüne uygun şekilde yeniden açar" },
    "a.inspect": { headline: "Bu yokluğun çevresinde kanıt arayın: tekrarlayan hatalar, çözülmemiş bir engel, düşen değer gerçekleşmesi, olumsuz geri bildirim, daralan derinlik ya da genişlik, iptali araştırma belirtileri. Desteklensin ya da desteklenmesin, kaçırmanın kendisini kaydedin - böylece aynı kullanım senaryosundaki sonraki bir kaçırmanın üzerine ekleyebileceği bir şey olur; yokluk yalnızca toplamda kanıttır ve bir toplamın eklenecek bir kayda ihtiyacı vardır" },
    "c.corroborated": { headline: "Bu yokluğun yanında başka olumsuz kanıt var mı?", edges: [{ label: "Destekleniyor", detail: "kaçırılan kullanıma en az bir bağımsız olumsuz sinyal eşlik ediyor" }, { label: "Yalnızca yokluk", detail: "eksik etkinliğin kendisinden başka hiçbir şey yok" }] },
    "h.health": { headline: "Sağlık kötüleşmesi → nedeni teşhis et → kurtarma rotası", detail: "başka olumsuz kanıtlarla desteklenen, kaçırılan bir beklenti" },
    "x.observe": { headline: "gözlem durumu; arkasında hiçbir şey olmayan bir kaçırma risk değildir", detail: "ikinci bir kaçırma ya da destekleyici herhangi bir sinyal bunu yeniden açar - yokluk zamanla kanıta dönüşür, kanıt olarak başlamaz" },
  },
  },
  "RET-23": {
  shortName: "Sağlık Kötüleşmesi Teşhisi",
  name: "Sağlık kötüleşmesi → nedeni teşhis et → kurtarma rotası",
  purpose: "Kötüleşen bir ilişkiyi, onu asıl bozan mekanizmaya yönlendirin - yerine asla genel bir elde tutma kampanyasına değil.",
  nodes: {
    "t.deteriorated": { headline: "Sağlık durumu kötüleşme eşiğini aştı" },
    "a.decompose": { headline: "Kötüleşmeyi, onu üreten kanıtlara ayırın. Hangi girdinin hareket ettiğini söyleyemeyen bir puana göre yönlendirme yapılamaz; yine de buna göre yönlendirmek, her nedenin aynı mesajı almasına yol açan şeydir" },
    "c.cause": { headline: "Baskın bir neden belirlenebiliyor mu, hangisi?", edges: [{ label: "Benimseme düştü", detail: "değer üreten kullanım, arkasında başka bir engel olmadan azaldı" }, { label: "Kurulum bağımlılığı eksik", detail: "gerekli bir şey hiç tamamlanmadı ya da o zamandan beri bozuldu" }, { label: "Teknik sorun ya da destek sürtünmesi", detail: "çözülmemiş bir arıza ya da bir konuda yardım almakta tekrarlayan güçlük" }, { label: "Hizmet hatası", detail: "söz verdiğimiz bir şeyi teslim edemedik" }, { label: "Faturalandırma ya da ödeme sorunu", detail: "kötüleşme, başarısız bir ödemeye ya da bir faturalandırma anlaşmazlığına dayanıyor" }, { label: "Sahiplik ya da ilişki değişikliği", detail: "ilişkinin yürüdüğü kişi değişti ya da ayrıldı" }, { label: "İş ihtiyacı değişti", detail: "hiçbir şey bozulmadı; ürünü ihtiyaç duydukları amaç artık ihtiyaç duydukları şey değil" }, { label: "Baskın bir neden yok", detail: "etkileşim, arkasında tanımlanabilir bir engel olmadan düştü" }] },
    "h.adoption": { headline: "Erken benimseme → kullanım derinliği → alışkanlık veya kararlı kullanım", detail: "benimsemenin azalmasının yol açtığı kötüleşme" },
    "h.setup": { headline: "Eksik aktivasyon gereksinimi → engeli çöz → devam et", detail: "eksik ya da bozuk bir kurulum bağımlılığına dayanan kötüleşme" },
    "h.technical": { headline: "external:human-in-the-loop-yaşam döngüsü", detail: "çözülmemiş bir teknik sorun ya da tekrarlayan destek sürtünmesi" },
    "h.service": { headline: "Olumsuz deneyim → kurtarma uygunluğu → uygun yanıt", detail: "bizim tarafımızdaki bir hizmet hatasının neden olduğu kötüleşme" },
    "h.payment": { headline: "external:payment-recovery", detail: "faturalandırma ya da ödemeye dayanan kötüleşme" },
    "h.ownership": { headline: "external:relationship-ownership-reconciliation", detail: "ilişkinin yürüdüğü kişinin değişmesi ya da ayrılması" },
    "x.need-changed": { headline: "ihtiyaç değiştiği için sağlık düştü; hiçbir şey bozuk değil", detail: "yeni bir ihtiyaç ya da eskisinin geri dönmesi bunu yeniden açar - bittiği için sona eren bir ilişki, kurtarılması gereken bir başarısızlık değildir" },
    "a.diagnostic": { headline: "Sınırlı bir teşhis süreci açın: gözlemleyin, uygun olduğunda sorun. Hiçbir teşvik eklenmez, çünkü neden bilinmeden sunulan bir teşvik bize neden hakkında hiçbir şey öğretmez" },
    "w.diagnostic": { headline: "kötüleşmenin nedeni kanıtlardan belirlenebilir hale gelene ya da sağlık sinyali müdahale olmadan normal aralığına dönene kadar", detail: "zaman aşımı: Sınırlı bir teşhis penceresinin ardından. (yapılandırma: health_deterioration.diagnostic)" },
    "c.diagnostic-result": { headline: "Teşhis penceresi ne üretti?", edges: [{ label: "Bir neden", detail: "kanıtlar artık belirli bir şeye işaret ediyor" }, { label: "Toparlanma", detail: "sağlık müdahale olmadan iyileşti" }] },
    "x.unexplained": { headline: "kötüleşme gerçek, neden bulunamadı; daha düşük sıklıkta izleme", detail: "daha fazla kötüleşme ya da destekleyici bir sinyal bunu yeniden açar; açıklanamayan bir düşüş tedavi edilmez, izlenir" },
    "x.cause-found": { headline: "teşhis penceresi sırasında neden belirlendi", detail: "belirlenen neden yeni bir örnek açar ve ilk geçişte yönlendirme yapar - bu, yönlendirme kararını teşhis sürecinin içinde tekrarlamak yerine tek bir yerde tutar" },
    "h.recovery": { headline: "Kurtarma sinyali → gözlem tamponu → istikrarlı ya da tekrar kötüleşme", detail: "teşhis penceresi sırasında sağlığın iyileşmesi" },
  },
  },
  "RET-24": {
  shortName: "Kayıp Riski Yükselmesi",
  name: "Kayıp riski yükselmesi → kanıt → müdahale önceliği",
  purpose: "Risk altındaki bir ilişkiye ne kadar sıkı karşılık verileceğine, gerçekte ne kadar bağımsız kanıt bulunduğuyla orantılı olarak karar verin.",
  nodes: {
    "t.threshold": { headline: "Kayıp riski eşiği aşıldı" },
    "c.intent": { headline: "Açık bir iptal niyeti daha önce ifade edildi mi?", edges: [{ label: "Zaten iptal ediyor", detail: "bir iptal talep edildi ya da iptal akışına girildi" }, { label: "Belirtilmiş bir niyet yok", detail: "risk davranış ve olaylardan çıkarsanıyor, kimse bir şey söylemedi" }] },
    "h.cancellation": { headline: "İptal niyeti → durumu anla → kurtar ya da devam et", detail: "risk yükseldiğinde kayıtlarda zaten bulunan bir iptal niyeti" },
    "a.evidence": { headline: "Sinyalleri kaynakları ve güçleriyle birlikte bir araya getirin. Önemli olan sayıları değil, birbirini destekleyip desteklemedikleridir - aynı temel olayın üç farklı okuması tek bir kanıt parçasıdır" },
    "c.operational": { headline: "Risk, ödeme kurtarma sürecinde zaten açık olan bir ödeme hatası dışında, bilinen bir operasyonel sorundan mı kaynaklanıyor?", edges: [{ label: "Bilinen sorun", detail: "kanıtlar bozuk ya da çözülmemiş belirli bir şeye işaret ediyor ve bu, bu ilişkide açık bir ödeme kurtarma örneği olan bir ödeme hatası değil - o nedenin zaten bir sahibi var" }, { label: "Bilinen bir sorun yok", detail: "ilişki kötüleşiyor ve buna neden olan tanımlanabilir bir şey yok, ya da tanımlanabilir neden ödeme kurtarma sürecinin zaten sahiplendiği bir ödeme hatası" }] },
    "h.resolve-first": { headline: "Sağlık kötüleşmesi → nedeni teşhis et → kurtarma rotası", detail: "tanımlanabilir bir operasyonel nedeni olan risk" },
    "c.priority-clear": { headline: "Bu hesabı daha yüksek öncelikli bir elde tutma iletişimi adayı zaten talep ediyor mu?", edges: [{ label: "Açık", detail: "şu anda insan sahipliğinde açık bir konu (FBK-46) bu hesabı talep etmiyor - bu sürecin kendi bildirilen önceliği bunun altında, genel elde tutma müdahalesinin üzerindedir" }, { label: "Çekişmeli", detail: "insan sahipliğinde açık bir konu bu hesabı zaten talep ediyor - kontrol mesajı göndermek ya da ikinci, rakip bir sahip görevi açmak, kanıtlarını desteklemek yerine hesap üzerinde zaten çalışan kişiyle çelişir" }] },
    "c.signal-class": { headline: "Bu ne tür bir risk?", edges: [{ label: "Kopma", detail: "kanıtlar sürekli kullanım düşüşüne, hesap genelinde azalan benimsemeye, kilit bir paydaşın ayrılmasına ya da başarısız bir yenileme veya ödemeye işaret ediyor - tanım gereği kişi üründe değil" }, { label: "Ürün içi sürtünme", detail: "kanıtlar tekrarlanan çözülmemiş engellere, olumsuz bir destek deneyimine ya da açık bir memnuniyetsizliğe işaret ediyor - risk, ürünün içinde bir şeyin başarısız olmasından doğdu, kişi hâlâ orada" }] },
    "a.check-in-email": { headline: "Yanlış giden neyi görebildiğimizi belirten ve bir kişiye ulaşma yolu sunan bir kontrol mesajı gönderin, üründe olmayan birine ulaşan rota üzerinden. Hiçbir teklif ya da indirim içermez; teklifler RET-28 ve RET-30'a aittir" },
    "a.check-in-inapp": { headline: "Yanlış giden neyi görebildiğimizi belirten ve bir kişiye ulaşma yolu sunan bir kontrol mesajı gönderin, başarısız olan şeyin yanında, kişinin hâlâ bulunduğu yerde. Hiçbir teklif ya da indirim içermez; teklifler RET-28 ve RET-30'a aittir" },
    "w.response": { headline: "ilişkinin kendi durumu kişi yanıt vermeden düzelene ya da bir iptal akışına girilmesi, hâlâ geri alınabilirken bir iptal talep edilmesi ya da bir kişi aracılığıyla iptal istenmesi gibi açık bir eylem gerçekleşene kadar", detail: "zaman aşımı: Kontrol mesajının bir şeyi değiştirip değiştirmediğini fark etmek için sınırlı bir pencere, bir kişinin dikkatini yanıt vermeyen bir ilişkiye harcamadan önce. (yapılandırma: churn_risk.response_window)" },
    "c.moved": { headline: "İlişkinin durumu değişti mi?", edges: [{ label: "Düzeldi", detail: "ilişki ölçülebilir şekilde düzeldi" }, { label: "İptal bildirildi", detail: "kontrol mesajına yanıt beklenirken bir iptal talep edildi ya da iptal akışına girildi" }] },
    "x.recovered": { headline: "ilişki düzeldi; risk yükseltme olmadan ortadan kalktı", detail: "eşik yeniden aşılırsa, yeni bir risk değerlendirmesi yeni bir örnektir" },
    "c.human": { headline: "Kanıtlar - kontrol penceresinde alınan herhangi bir yanıt dahil - artık bir kişinin devreye girmesini haklı çıkarıyor mu?", edges: [{ label: "Haklı", detail: "kanıtlar güçlü ve destekleniyor, ilişki de birinin dikkatinin maliyetini haklı çıkarıyor" }, { label: "Haklı değil", detail: "kanıtlar gerçek ama zayıf, bir kişinin dikkati sinyalin desteklediğinden daha büyük bir müdahale olur" }] },
    "a.owner-task": { headline: "Hesap sahibi ya da müşteri başarısı ekibi için, puanı değil kanıtları taşıyan bir görev açın ve bu ilişki üzerindeki otomatik elde tutma sürecini durdurun - böylece kişi çalışırken bir otomatik dizi tarafından çelişkiye düşürülmez" },
    "h.human": { headline: "external:human-in-the-loop-yaşam döngüsü", detail: "bir kişinin devreye girmesini haklı çıkaracak kadar güçlü risk" },
    "x.contended": { headline: "bu hesabı zaten başka bir sahip elinde tutuyor", detail: "o adayın çözülmesi, eskimiş bir değerlendirmeyi sürdürmek yerine bu değerlendirmeyi güncel kanıtlardan yeniden açar" },
    "x.monitored": { headline: "risk kaydedildi, izleniyor; bu değerlendirmeden başka bir şey yok", detail: "daha güçlü ya da daha taze kanıtlar bunu daha üst bir düzeyde yeniden açar - zayıf kanıtlara hiçbir şey yapmamak meşru bir yanıttır" },
  },
  },
  "RET-27": {
  shortName: "Kurtarma İstikrarı Kontrolü",
  name: "Kurtarma sinyali → gözlem tamponu → istikrarlı ya da tekrar kötüleşme",
  purpose: "İyi bir belirti ile gerçek bir kurtarma arasındaki mesafeyi koruyun - böylece bir tekrar kötüleşme yaşandığında hâlâ gözetleniyor olur.",
  nodes: {
    "t.positive": { headline: "Kötüleşmenin ardından olumlu sinyal" },
    "a.mark": { headline: "RECOVERY_OBSERVED olarak kaydedin, açıkça RECOVERED olarak değil. Bu sürecin tamamı bu iki durum arasındaki mesafedir ve ikincisini burada yazmak, sürecin var olma nedenini ortadan kaldırır" },
    "w.stability": { headline: "kurtarmadan sonra kötüleşme sinyali yeniden ortaya çıkana kadar", detail: "zaman aşımı: Bu kullanım senaryosu ve bu tür kötüleşme için uygun istikrar penceresinin ardından. (yapılandırma: recovery_observation.stability)" },
    "a.relapse": { headline: "Tekrar kötüleşmeyi kaydedin; gözlemlenen iyileşmeyi silmek yerine geçmişte tutun - bir şeyin kısa süreliğine işe yaramış olması gürültü değil, teşhisin bir parçasıdır" },
    "a.stable": { headline: "RECOVERED olarak kaydedin ve hâlâ bekleyen kurtarma müdahalelerini, sıraya alınmış olanlar dahil, durdurun - bir ilişki gerçekten istikrar kazandıktan sonra gelen bir kurtarma mesajı, müşterinin artık sormayı bıraktığı bir soruyu yeniden açar" },
    "h.rediagnose": { headline: "Sağlık kötüleşmesi → nedeni teşhis et → kurtarma rotası", detail: "istikrar penceresi içinde geri dönen kötüleşme" },
    "h.normal": { headline: "external:customer-yaşam döngüsü", detail: "istikrar penceresi boyunca sürdürülen kurtarma" },
  },
  },
  "RET-28": {
  shortName: "İptali Önleme",
  name: "İptal niyeti → durumu anla → kurtar ya da devam et",
  purpose: "Ayrılma niyetini, gerçekten ilgili bir alternatifin sunulabileceği bir karar noktası olarak ele alın - asla bir engel parkuru olarak değil.",
  nodes: {
    "t.intent": { headline: "Açık iptal niyeti" },
    "a.context": { headline: "Şu anda ellerinde ne olduğunu, iptalin neyi sona erdireceğini ve ne zaman yürürlüğe gireceğini okuyun - böylece bundan sonra söylenecek her şey genel bir ilişki değil, onların gerçek ilişkisi hakkında olur" },
    "c.surface": { headline: "İptal niyeti nerede belirtildi?", edges: [{ label: "İptal akışında", detail: "niyet, ürünün içinde, iptal akışının kendisinde belirtildi" }, { label: "Bir kişi aracılığıyla / üründen bağımsız", detail: "niyet bir kişiye - mesajla, telefonla ya da destek üzerinden - belirtildi ve ürünün içinde değil" }] },
    "c.reason": { headline: "Belirtilmiş bir neden var mı?", edges: [{ label: "Belirtildi", detail: "kişi bir neden belirtti" }, { label: "Belirtilmedi", detail: "hiçbir neden verilmedi - ve iptal akışı yüzeyi, sormanın iptali geciktirmediği anlamına gelir" }] },
    "a.record-reason": { headline: "Nedeni kaynağıyla birlikte kaydedin - fiyat, düşük kullanım, gerçekleşmemiş değer, teknik bir sorun, bir hizmet sorunu, geçici bir ihtiyaç, başka bir şeye geçiş ya da kendi ifadeleriyle başka bir neden. Daha sonra çıkarsanan bir neden, belirtilmiş olanın üzerine asla yazılmaz" },
    "c.resolution": { headline: "Bu neden için meşru bir çözüm var mı?", edges: [{ label: "Gerçek bir alternatif", detail: "bir şey belirtilen nedeni gerçekten ele alıyor - teknik bir sorun için teknik yardım, maliyet ya da geçici ihtiyaç için plan değişikliği ya da durdurma, gerçekleşmemiş değer için eğitim, bir hizmet hatası için hizmet kurtarma" }, { label: "Gerçek bir şey yok", detail: "hiçbir alternatif nedeni gerçekten yanıtlamıyor ya da yanıtlanacak bir neden verilmedi" }] },
    "a.ask": { headline: "Bir kez sorun; iptal yolu, soruyla birlikte tamamen açık kalsın. Soru hiçbir zaman ayrılmak için geçilmesi gereken bir adım değildir - bu şekilde elde edilen bir neden bilgi değil, bir bedeldir" },
    "a.no-reason": { headline: "Neden olmadan devam edin ve hiçbir neden verilmediğini kaydedin. Çıkarsanan bir neden saklanabilir, ancak asla belirtilmiş nedenlerin tutulduğu alanda değil" },
    "a.offer": { headline: "Nedeniyle eşleşen alternatifi, iptale devam etmenin önünde hiçbir engel bırakmadan, bir kez sunun. Bir indirim yalnızca nedenin fiyat olduğu ve politikanın bunu desteklediği durumlarda görünür - teknik bir arıza için indirim sunmak yanlış soruyu yanıtlamak olur ve kimsenin nedeni okumadığını ortaya koyar" },
    "w.decision": { headline: "ilişki üzerinde kaydedilen doğrulanmış bir iptal, geçerlilik bitiş tarihi belirlenene ya da kişi onaylamadan iptal akışından çıkana kadar", detail: "zaman aşımı: Bir niyet, sınırlı bir süre boyunca anlamlı kalır; bu sürenin ardından onaylanmamış bir iptal, sona ermiş bir niyettir ve ilişki değişmeden kalır. (örnek: 7 gün–14 gün; yapılandırma: cancellation_save.intent_window)" },
    "w.answer": { headline: "kişi iptal için bir neden belirtene, ilişki üzerinde doğrulanmış bir iptal kaydedilip geçerlilik bitiş tarihi belirlenene ya da kişi onaylamadan iptal akışından çıkana kadar", detail: "zaman aşımı: Soru yalnızca kişi sorulduğu noktadayken açık kalır; kişi o noktadan ayrıldığında, yanıtsızlık yanıt sayılır. (önerilen: sorunun sorulduğu oturum ya da konuşmanın sonu; yapılandırma: cancellation_save.answer_window)" },
    "h.intervention": { headline: "Elde tutma müdahalesi → sonuç → durdur, yükselt ya da çık", detail: "karar noktasında sunulan bir elde tutma alternatifi" },
    "c.decision": { headline: "Ne karar verdiler?", edges: [{ label: "Onaylandı", detail: "iptal gerçekleştirildi" }, { label: "Vazgeçildi", detail: "ilişkiyi bozmadan akıştan ayrıldılar" }] },
    "x.lapsed": { headline: "niyet ifade edildi, gerçekleştirilmedi; ilişki değişmedi", detail: "niyetin yeniden ifade edilmesi yeni bir bölüm açar ve öncekisi bağlam olarak kalır - iptale defalarca yaklaşmak, RET-24'ün okuması gereken bir kanıtın kendisidir" },
    "c.answered": { headline: "Ne geri döndü?", edges: [{ label: "Bir neden", detail: "kişi bir neden belirtti" }, { label: "Bu sırada karar verdiler", detail: "soru hâlâ açıkken iptal onaylandı ya da vazgeçildi" }] },
    "h.execute": { headline: "İptal talebi → geçerlilik bitişini belirle → zamanla ya da şimdi iptal et", detail: "müşteri tarafından onaylanan iptal" },
  },
  },
  "RET-29": {
  shortName: "İptal Sonrası Kapanış",
  name: "İptal tamamlandı → elde tutmayı durdur → kalan ilişkiyi sonuçlandır",
  purpose: "İptal gerçekleştiği anda elde tutma sahipliğini sona erdirin ve ilişkinin ya tamamen bittiğini ya da hâlâ kazanılabilir olduğunu varsaymadan, hâlâ askıda olanı yönetin.",
  nodes: {
    "t.completed": { headline: "Doğrulanmış iptal tamamlandı" },
    "a.invalidate": { headline: "Artık uyumsuz hale gelen kurtarma tekliflerini, yenileme hatırlatmalarını, iptal hatırlatmalarını, elde tutma görevlerini ve promosyon eylemlerini geçersiz kılın - sıraya alınmış olanlar dahil. Bu, başka her şeyden önce, ilk sırada çalışır; çünkü geç çalışmasının bedeli, biri zaten ayrıldıktan sonra gelen bir kurtarma teklifidir" },
    "a.termination-durum": { headline: "Bunun gerçekte ne zaman sona erdiğini belirleyin: hemen, mevcut dönemin sonunda ya da planlanmış gelecek bir tarihte. Sonrasındaki her şey buna bağlıdır ve bunu hemen olarak varsaymak, ücretli hakların erken iptal edilmesine yol açar" },
    "c.access": { headline: "Hizmet ya da erişim geçici olarak etkin kalıyor mu?", edges: [{ label: "Hâlâ etkin", detail: "iptal, dönem sonunda ya da gelecek bir tarihte yürürlüğe girer" }, { label: "Şimdi sona erdi", detail: "iptal hemen yürürlüğe girdi" }] },
    "a.wind-down": { headline: "İlişkiyi, bitiş tarihiyle birlikte tanımlanmış bir kapanış durumunda tutun. Politika açıkça aksini söylemedikçe, ücretli haklar bu tarihten önce iptal edilmez - iptal eden biri, dönemin geri kalanı için zaten ödeme yapmıştır ve bunu erken almak, nötr bir bitişi bir şikayete dönüştürür" },
    "c.obligations": { headline: "Her iki tarafta da açık yükümlülükler kaldı mı?", edges: [{ label: "Askıda bir şey var", detail: "son bir fatura, bir geri ödeme, bir iade, bir veri dışa aktarımı, geri gelmesi gereken bir ekipman ya da açık bir destek konusu" }, { label: "Askıda hiçbir şey yok", detail: "hiçbir taraf diğerine artık bir şey borçlu değil" }] },
    "h.obligations": { headline: "external:obligation-resolution", detail: "iptalden sonra askıda kalan yükümlülükler" },
    "c.ended": { headline: "İlişki tamamen sona erdi mi?", edges: [{ label: "Tamamen sona erdi", detail: "bitiş tarihi geçti ve askıda hiçbir şey yok" }, { label: "Hâlâ kapanış sürecinde", detail: "bitiş tarihi ileride bir tarih" }] },
    "x.former": { headline: "eski müşteri; ilişki sona erdi, hesap ve veriler dokunulmadan kaldı", detail: "geri dönüş, bu ilişkiyi canlandırmakla değil, geri kazanma süreciyle ele alınan yeni bir ilişkidir. Hesabı kapatmak ve verileri silmek, kendi tetikleyicileri olan iki ayrı durumdur ve burada ikisi de gerçekleşmedi" },
    "x.wind-down": { headline: "iptal edildi, bitiş tarihine kadar kapanış sürecinde", detail: "bitiş tarihinden önce geri dönüş mümkündür ve kendi başına bir olaydır; kapanış durumu tam olarak bu pencerenin bir bitişe indirgenmeden temsil edilebilmesi için vardır" },
  },
  },
  "RET-31": {
  shortName: "Öngörülen İhtiyaç Yenilemesi",
  name: "Tükenme öngörüldü → tükenmeden önce yenileme hatırlatıldı → yenilendi, reddedildi ya da sona erdi",
  purpose: "Tüketilebilir ya da tekrarlı kullanımlı bir ürünün kullanılabilir süresinin sona ereceği öngörülmeden kısa bir süre önce kişiye yenileme hatırlatması yapın, öngörüyü bir tahmin olarak belirtin ve kişi satın aldığı, reddettiği ya da döngü geçtiği anda durdurun.",
  nodes: {
    "t.predicted": { headline: "Beklenen tükenme yaklaşıyor" },
    "c.eligible": { headline: "Hatırlatma yapmaya gerek var mı ve buna izin var mı?", edges: [{ label: "Uygun", detail: "daha yeni bir satın alma yok, abonelik yok, bu döngüde bir ret yok, açık bir örnek yok ve ticari izin kayıtlı" }, { label: "Zaten karşılandı", detail: "ihtiyacın daha yeni bir satın alması mevcut" }, { label: "Uygun değil", detail: "bir abonelik bunu kapsıyor, bu döngüde reddedildi, izin yok ya da açık bir örnek var - neden kaydediliyor" }] },
    "a.open": { headline: "İhtiyaca ve öngörü döngüsüne karşı örneği açın; hatırlatmanın zamanlanacağı beklenen tükenme tarihini kaydedin" },
    "x.replenished": { headline: "yenilendi; ihtiyacın bir satın alması kaydedildi", detail: "bu satın almadan hesaplanan bir sonraki öngörü döngüsü, bir sonraki örneği açar" },
    "a.record-no-action": { headline: "Hiçbir şey gönderilmemesinin nedenini ve hangi ihtiyaca karşı olduğunu kaydedin - böylece eylemsizlik sessiz bir yokluk değil, ölçülmüş bir sonuç olur" },
    "w.lead": { headline: "kişi için herhangi bir konuda doğrulanmış bir satın alma gerçekleşene ya da kişi yenilemeye ihtiyaç olmadığını belirtene kadar", detail: "zaman aşımı: Hatırlatma, beklenen tükenmeden önce bir öncü süre kadar zamanlanır - yeni bir siparişin ihtiyaç kendini hissettirmeden önce ulaşmasına yetecek kadar uzun, tahminin hâlâ bir anlam ifade etmesi için de yeterince kısa. (örnek: 3 gün–7 gün; yapılandırma: replenishment.lead_time)" },
    "x.no-action": { headline: "hatırlatma gönderilmedi; neden kaydedildi", detail: "bir sonraki öngörü döngüsü yeni bir örnek açar" },
    "c.state": { headline: "Öncü noktada ihtiyaç hâlâ karşılanmamış mı?", edges: [{ label: "Hâlâ karşılanmamış", detail: "örnek açıldığından beri satın alma, abonelik ve ret yok" }, { label: "Yenilendi", detail: "ihtiyacın bir satın alması kaydedildi" }, { label: "Reddedildi", detail: "kişi ihtiyacı reddetti" }] },
    "c.sendable": { headline: "Öncü hatırlatma gönderilebilir mi?", edges: [{ label: "Gönderilebilir", detail: "gönderim yolu geçiyor: ticari iletişim izni, teslim edilebilir bir hedef, promosyon baskısı üst sınırı, kişi üzerinde daha yüksek öncelikli bir çekişme yok ve yürürlükte bir bekleme süresi yok" }, { label: "Engellendi", detail: "bir engel bunu durduruyor; engel neden olarak kaydediliyor" }] },
    "x.dismissed": { headline: "kişi tarafından reddedildi; ihtiyaç bu döngü için susturuldu", detail: "ret, artık hatırlatma istenmediğini belirtmedikçe, bir sonraki öngörü döngüsü yeni bir örnek açar" },
    "a.touch1": { headline: "Ürünü belirtin, ne zaman tükeneceğinin tahmin edildiğini ve bunun kendi satın almalarından yapılan bir tahmin olduğunu söyleyin ve yeniden sipariş yolunu verin. Ellerinde ne kaldığına dair hiçbir iddiada bulunmayın; ayrılmış stok, tutulan fiyat ya da indirim yok" },
    "w.window": { headline: "kişi için herhangi bir konuda doğrulanmış bir satın alma gerçekleşene ya da kişi yenilemeye ihtiyaç olmadığını belirtene kadar", detail: "zaman aşımı: Takip, beklenen tükenmenin belirli bir payla geçmesini bekler - böylece o noktada muhtemelen gerçek olan bir ihtiyaca gönderilir, hâlâ önde olan birine değil. (örnek: 3 gün–7 gün; yapılandırma: replenishment.follow_margin)" },
    "c.outcome": { headline: "Tahmini tükenmeden sonra ne oldu?", edges: [{ label: "Yenilendi", detail: "ihtiyacın bir satın alması kaydedildi" }, { label: "Reddedildi", detail: "kişi ihtiyacı reddetti" }, { label: "Hâlâ karşılanmamış", detail: "hiçbir şey değişmedi" }] },
    "c.sendable2": { headline: "Takip gönderilebilir mi?", edges: [{ label: "Gönderilebilir", detail: "gönderim yolu geçiyor ve iletişim bütçesi harcanmadı" }, { label: "Engellendi", detail: "bir engel bunu durduruyor; engel kaydediliyor" }] },
    "a.touch2": { headline: "Tahmini noktanın geçtiğini bir kez söyleyin ve aynı yeniden sipariş yolunu verin. Uydurulmuş bir aciliyet yok, politika son iletişim için bir teşvike izin vermedikçe teşvik de yok" },
    "w.final": { headline: "kişi için herhangi bir konuda doğrulanmış bir satın alma gerçekleşene ya da kişi yenilemeye ihtiyaç olmadığını belirtene kadar", detail: "zaman aşımı: Takipten sonra örnek yalnızca bir yenilemeyi ya da reddi gözlemlemek için açık kalır; ardından sona erer ve bir sonraki öngörü döngüsü bir sonraki fırsat olur. (örnek: 14 gün–30 gün; yapılandırma: replenishment.lifetime)" },
    "c.final": { headline: "Gözlemi ne sonlandırdı?", edges: [{ label: "Yenilendi", detail: "ihtiyacın bir satın alması kaydedildi" }, { label: "Reddedildi", detail: "kişi ihtiyacı reddetti" }] },
    "x.lapsed": { headline: "hatırlatıldı, ne yenilendi ne de reddedildi; bu döngüde başka bir şey yok", detail: "bir sonraki öngörü döngüsü yeni bir örnek açar" },
  },
  },
  "RET-32": {
  shortName: "Kaybedilen Müşteriyi Geri Kazanma",
  name: "Ücretli ilişki sona erdi → iletişime izin verildi → geri kazanıldı, reddedildi ya da kendi haline bırakıldı",
  purpose: "Ücretli ilişkisi sona ermiş ya da hareketsiz kalmış bir kişiyi geri dönmeye davet edin - bir kez, dürüstçe, ayrıldıklarından bu yana gerçekte neyin değiştiğiyle - iptalin kendi bekleme süresi geçtikten sonra ve yalnızca kayıtlı neden ile geçmişin bunu engellemediği durumlarda.",
  nodes: {
    "t.lapsed": { headline: "Kaybedilen müşteri tespit edildi" },
    "c.eligible": { headline: "Bu ilişki, geri dönüş hakkında yazabileceğimiz bir ilişki mi?", edges: [{ label: "Uygun", detail: "daha önce ödeme yaptı, iptalin kendi bekleme süresini geçti, üzerinde açık bir şey yok, iletişimi dışlamayan bir neden ve geçmiş var, izin kayıtlı ve geri çekilmemiş" }, { label: "Dışlandı", detail: "neden, geçmiş, açık bir konu ya da eksik izin bunu engelliyor - neden kaydediliyor" }] },
    "a.open": { headline: "İlişkiye ve bu kayba karşı geri kazanma örneğini açın; hitap edeceği iptal nedenini ve bekleme süresinin hesaplanacağı tarihi kaydedin" },
    "w.cooldown30": { headline: "30 gün bekle", detail: "zaman aşımı: kaybedilen ilişki, ilk davetten önce sabit bir süre kendi haline bırakılır; böylece iletişim daha yeni ayrılmış birine denk gelmez. (yapılandırma: winback.cooldown30)" },
    "c.returned1": { headline: "Yeniden müşteri oldu mu?", edges: [{ label: "Evet", detail: "yetkili bir kayıt, kayıptan bu yana ilişkinin yeniden ödeme yaptığını ya da bir satın almanın tamamlandığını gösteriyor" }, { label: "Hayır", detail: "böyle bir kayıt yok" }] },
    "a.record-no-action": { headline: "Hiçbir şey gönderilmemesinin nedenini kaydedin - dışlayıcı bir neden, geçmiş, açık bir konu, izin eksikliği ya da gönderim yolundaki bir engel - böylece eylemsizlik ölçülmüş bir sonuç olur" },
    "x.no-action": { headline: "davet gönderilmedi; dışlayıcı neden ya da engel kaydedildi", detail: "dışlayıcı bir neden ya da geçmiş yalnızca değiştiğinde yeniden değerlendirilir; gönderim yolundaki bir engel ise bir sonraki kayıpta yeniden değerlendirilir" },
    "c.sendable": { headline: "Davet gönderilebilir mi?", edges: [{ label: "Gönderilebilir", detail: "gönderim yolu geçiyor: ticari iletişim izni, teslim edilebilir bir hedef, promosyon baskısı üst sınırı, hesap üzerinde daha yüksek öncelikli bir çekişme yok ve yürürlükte bir geri kazanma bekleme süresi yok" }, { label: "Engellendi", detail: "bir engel bunu durduruyor; engel neden olarak kaydediliyor" }] },
    "a.touch1": { headline: "E-posta ile ayrıldıklarından bu yana gerçekte ne değiştiğini söyle: yeni özellikler, ürün geliştirmeleri, yeni avantajlar - ve geri dönüş yolu. Hiçbir şey uydurulmaz, tutulmayan koşullar tutuluyormuş gibi gösterilmez, politikanın izin vermediği bir indirim sunulmaz" },
    "w.window1": { headline: "3–5 gün bekle", detail: "zaman aşımı: davete, akışın ilişkiyi yeniden okuyup geri dönüş indirimine geçmeden önce sabit bir süre tanınır. (yapılandırma: winback.window1)" },
    "c.returned2": { headline: "Geri döndü mü?", edges: [{ label: "Evet", detail: "yetkili bir kayıt, davetten bu yana ilişkinin yeniden ödeme yaptığını ya da bir satın almanın tamamlandığını gösteriyor" }, { label: "Hayır", detail: "böyle bir kayıt yok" }] },
    "x.won": { headline: "geri kazanıldı; ilişki yeniden ödeme yapıyor", detail: "sonraki bir kayıp yeni bir örnektir ve bu kayıptan itibaren hesaplanan bekleme süresine tabidir" },
    "c.sendable2": { headline: "Geri dönüş indirimi gönderilebilir mi?", edges: [{ label: "Gönderilebilir", detail: "gönderim yolu geçiyor ve iletişim bütçesi harcanmadı" }, { label: "Engellendi", detail: "bir engel bunu durduruyor; engel kaydediliyor" }] },
    "a.touch2": { headline: "SMS ile sınırlı süreli bir geri dönüş indirimini güçlü bir harekete geçirme çağrısıyla ve aynı geri dönüş yoluyla söyle, ve teşvikin kişi başına verilişini kaydet" },
    "w.offer": { headline: "teklif süresi boyunca bekle", detail: "zaman aşımı: indirime, kendi teklif süresi kadar bir eylem penceresi tanınır; ardından örnek kapanır, üçüncü bir temas yoktur. (örnek: 7 gün; yapılandırma: winback.offer_window)" },
    "c.returned3": { headline: "Yeniden satın aldı mı?", edges: [{ label: "Evet", detail: "yetkili bir kayıt, teklif penceresi içinde ilişkinin yeniden ödeme yaptığını ya da bir satın almanın tamamlandığını gösteriyor" }, { label: "Hayır", detail: "pencere içinde böyle bir kayıt yok" }] },
    "x.lapsed": { headline: "bu yolculuk sona erdi", detail: "davet edildi ve indirim sunuldu, geri dönmedi; bekleme süresi boyunca kendi haline bırakıldı - bekleme süresi geçene kadar başka bir geri kazanma örneği açılmaz" },
  },
  },
  "RLT-279": {
  shortName: "Yükseltme Engeli Hatırlatması",
  name: "Çözülebilir bir ön koşulla engellenen yükseltme → hatırlatma → hazır veya süresi doldu",
  purpose: "Engellenen hedefin sahibine, hazırlık penceresinde bu engeli kaldırmaya yetecek süre kalmışken, değişiklikle arasında duran o tek somut şeyi bildirmek.",
  nodes: {
    "t.blocked": { headline: "Hedef, belirtilen bir ön koşul nedeniyle bekletiliyor" },
    "c.resolvable": { headline: "Sahip bu engeli kendisi kaldırabilir mi?", edges: [{ label: "Kendisi kaldırabilir", detail: "ön koşul, sahibin kontrolündeki bir şeydir - boşaltılacak bir kapasite, geçilmesi gereken bir sürüm, kabul edilmesi gereken bir bağımlılık veya verilmesi gereken bir onay" }, { label: "Sahibinin elinde değil", detail: "ön koşul bir tedarikçiye, dahili bir onaya veya belirli bir sürenin geçmesine bağlıdır" }] },
    "a.name-blocker": { headline: "Tek bir ön koşulu, bunu kaldırmanın ne gerektirdiğini ve bu pencerede değişikliğin artık uygulanamayacağı tarihi açıkça belirt. Bir şeyin kullanılabilir olduğuna dair genel bir bildirim, sahibi engeli kendi başına keşfetmeye bırakır - hedefin takılı kalmasının tüm nedeni zaten budur" },
    "a.inform-hold": { headline: "Değişikliğin bekletildiğini ve nedenini belirt, sahipten herhangi bir eylem isteme - çünkü yapabileceği hiçbir şey yok. Eylemin mümkün olmadığı bir durumda harekete geçirme çağrısı suçlama gibi algılanır ve engelin kaldırılması yerine bir destek talebiyle sonuçlanır" },
    "w.clear": { headline: "ilerlemeyi engelleyen belirli koşul karşılandı olarak kaydedilene veya değişiklik talebi geri çekilene kadar", detail: "zaman aşımı: Hazırlık penceresinde, hâlâ engellenmiş bir hedefin zamanında hazır hale getirilemeyeceği noktadan sonra devreye girer. (configure upgrade_blocker.clear)" },
    "x.held": { headline: "sahibin kaldıramayacağı bir engelde bekletiliyor", detail: "engel daha sonra sahibinin kaldırabileceği bir hale gelirse, hedef çözülebilir yol için yeniden uygun hale gelir" },
    "c.cleared": { headline: "Bekleyişi ne sonlandırdı?", edges: [{ label: "Engel kaldırıldı", detail: "ön koşul, hedef üzerinde yetkili şekilde karşılanmıştır" }, { label: "Değişiklik geri çekildi", detail: "ön koşul karşılanmadan önce değişikliğin yerini başka bir değişiklik aldı veya değişiklik geri çekildi" }] },
    "c.last-call": { headline: "İkinci bir hatırlatma göndermeye hâlâ değer mi?", edges: [{ label: "Süre var", detail: "hazırlık penceresinde, engelin kaldırılmasının hedefi hâlâ hazır hale getirebileceği bir süre kalmıştır" }, { label: "Pencere kapandı", detail: "bu pencerede kalan hiçbir eylem hedefi hazır hale getiremez" }] },
    "h.resume": { headline: "Değişiklik hazırlığı → bağımlılıkları çözme → hazır veya beklemede", detail: "belirtilen ön koşulun, hazırlık penceresi içinde sahibi tarafından kaldırılması" },
    "x.moot": { headline: "engel kaldırılmadan önce değişiklik geri çekildi", detail: "aynı ön koşula sahip bir sonraki değişiklik bu hedefi yeniden kapsamına alır" },
    "a.last-call": { headline: "Aynı ön koşulu ve önemini yitireceği tarihi belirten bir hatırlatma daha gönder. Üçüncüsü yoktur - iki kez kaldırılmamış bir engel bir ihmal değil, bir karardır" },
    "x.unprepared": { headline: "engel çözülmeden hazırlık penceresi kapandı", detail: "hedef, popülasyonun hazırlanmamış bir üyesi olarak kalır ve aynı ön koşulu gerektiren bir sonraki değişiklikte yeniden hatırlatma alır" },
    "w.final": { headline: "ilerlemeyi engelleyen belirli koşul karşılandı olarak kaydedilene veya değişiklik talebi geri çekilene kadar", detail: "zaman aşımı: Son hatırlatmadan sonra örnek, hazırlık penceresinin kendisi kapanana kadar bekler; üçüncü bir hatırlatma yoktur. (configure upgrade_blocker.final)" },
  },
  },
  "RSK-273": {
  shortName: "Kullanım Limiti Uyarısı",
  name: "Kullanım limitine ulaşıldı → kapasite yolu → yükseltme, sıfırlanmayı bekleme veya engelli kalma",
  purpose: "Bir kullanıcıyla, bir limitin onu durdurduğu tam o anda, sonrasında ne olacağını belirleyen üç bilgiyle buluşun: limitin ne olduğu, ne zaman sıfırlanacağı ve daha fazla kapasitenin satın alınıp alınamayacağı - bunların hiçbiri bir suçlama gibi okunmadan.",
  nodes: {
    "t.blocked": { headline: "Limite ulaşıldı ve işlem engellendi" },
    "c.alternative": { headline: "Limitin durdurduğu şeyi tamamen karşılayan alternatif bir yol var mı?", edges: [{ label: "Alternatif mevcut", detail: "mevcut plandaki farklı bir özellik, model veya yol, engellenen şeyin yerini tamamen tutuyor" }, { label: "Tam karşılık yok", detail: "mevcut hiçbir şey ihtiyacın tamamını karşılamıyor, ya da hiç alternatif yok" }] },
    "a.alt-continue": { headline: "Mevcut alternatifi göster ve limiti hiç beklemeden şimdi nasıl devam edileceğini anlat" },
    "x.alternative": { headline: "limitin durdurduğu şeyi tamamen karşılayan bir alternatif sunuldu", detail: "aynı limite yeniden ulaşılması - alternatifin ihtiyacı gerçekte karşılamadığının işareti - yeni bir örnek açar" },
    "a.at-the-wall": { headline: "İşlem durdurulduğu anda, hangi limite ulaşıldığını, bu limite göre kullanımı ve pencerenin ne zaman sıfırlanacağını belirtin. Limite takılan tarafın kendisi ek kapasiteyi de onaylayabiliyorsa, bunu ve maliyetini belirtin; sıfırlanmanın bunu zaten karşılıksız serbest bırakacağını da ekleyin. Kapasite hiç satın alınamıyorsa, yalnızca pencerenin kendi zamanında sıfırlanacağını söyleyin. Bir limite ulaşmak, o limitin işlevini yerine getirmesidir - herhangi bir ifadenin suçlama gibi algılanması, sıradan bir kısıtlamayı bir destek talebine ve şikayete dönüştürür" },
    "a.blocked-notice": { headline: "İşlem durdurulduğu anda, hangi limite ulaşıldığını ve bu limite göre kullanımı belirtin. Bu limit için ne satın alınabilir bir kapasite ne de tanımlı bir sıfırlanma vardır, bu yüzden başka hiçbir şey vadedilmez" },
    "c.path": { headline: "Buradan hangi yol açık?", edges: [{ label: "Kapasite satın alınabilir", detail: "bu limit için ek kapasite onaylanabilir ve bu, ilgili hesap için gerçek bir seçenektir" }, { label: "Kendiliğinden sıfırlanır", detail: "bu pencerede başka kapasite yok, ancak sıfırlanma noktası kesin olarak tanımlıdır" }, { label: "İkisi de değil", detail: "limit sabittir; ne satın alınabilir kapasite ne de tanımlı bir sıfırlanma noktası vardır" }] },
    "c.decider": { headline: "Limite takılan kişi, kapasite kararını verme yetkisine sahip mi?", edges: [{ label: "Karar kendisine ait", detail: "aynı taraf ek kapasiteyi onaylayabilir" }, { label: "Karar başkasında", detail: "ticari karar, hesaptaki başka bir tarafa aittir" }] },
    "w.capacity1": { headline: "ek kapasite onaylanana, kullanım limiti sıfırlanana, bekleyen işlemden vazgeçilene ya da hatırlatma noktasına kadar", detail: "zaman aşımı: Sıfırlanmadan önce bir hatırlatmanın hâlâ işe yarayacağı nokta; sıfırlanma noktası hiçbir zaman varsayılarak uydurulmaz. (şunu ayarla: usage_limit.reset_lead)" },
    "a.nudge-reset": { headline: "Pencerenin yakında sıfırlanacağını ve işlemin kısa süre içinde devam edebileceğini, kesin sıfırlanma noktasına dayanarak hatırlat" },
    "w.capacity2": { headline: "ek kapasite onaylanana, kullanım limiti sıfırlanana ya da bekleyen işlemden vazgeçilene kadar", detail: "zaman aşımı: Bekleyen işlem, pencerenin kesin sıfırlanma noktasını ya da onaylanmış bir kapasite artışını bekler; sıfırlanma noktası hiçbir zaman varsayılarak uydurulmaz. (şunu ayarla: usage_limit.capacity)" },
    "x.blocked": { headline: "bu pencerede daha fazla kapasiteye giden bir yol olmaksızın limitte kalındı", detail: "bir sıfırlanma ya da başka bir yerde onaylanan bir limit değişikliği, bunu yeniden yeni bir örnek olarak nitelendirir" },
    "a.offer-holder": { headline: "Kararı veren tarafa neyin engellendiğini, kimin için engellendiğini, hangi kapasitenin bunu serbest bırakacağını, sıfırlanma alternatifinin ne olduğunu ve bu talebin sıfırlanma tarihinde geçerliliğini yitireceğini bildirin. Bu adım ile bir sonraki adım, farklı kişilere farklı kanallardan yapılan ayrı gönderimlerdir ve biri diğeri olmadan da başarısız olabilir" },
    "c.outcome": { headline: "Ne değişti?", edges: [{ label: "Kapasite onaylandı", detail: "daha fazla kapasite onaylandı ve yürürlüğe girmesi için plan veya koşullarda bir değişiklik gerekiyor" }, { label: "Pencere sıfırlandı", detail: "kesin sıfırlanma gerçekleşti ve aynı limit kapsamında kapasite yeniden kullanılabilir hale geldi" }, { label: "Hâlâ engelli", detail: "ikisi de gerçekleşmedi ve işlem hâlâ bekletiliyor" }] },
    "a.notify-blocked-party": { headline: "İşlemi bekletilen kişiye, kararın artık başka birine ait olduğunu, bu kişinin kim olduğunu ve her hâlükârda pencerenin ne zaman sıfırlanacağını kesin olarak bildirin. Yalnızca bir limite takıldığı söylenirse, kendisinin beklendiğinden habersiz bir kişiyi beklemiş olur" },
    "h.capacity": { headline: "Plan veya koşul değişikliği talebi → doğrulama → planlama, uygulama veya reddetme", detail: "plan veya koşullarda bir değişiklik olarak uygulanması gereken, onaylanmış bir kapasite artışı" },
    "a.reset": { headline: "İşlemi bekletilen kişiye, pencerenin sıfırlandığını ve işlemin devam edebileceğini, varsayılan bir saate değil kesin sıfırlanma noktasına dayanarak bildirin. Karar sahibine burada seslenilmez - sıfırlanma bir kapasite kararı değildir, kararsız sona eren bir bekleyiştir ve onun talebi zaten geçerliliğini yitirmiştir. Yerel olarak tahmin edilen bir sıfırlanma, kimsenin onaylamadığı bir kapasite tanır ve bu iki değer sessizce birbirinden uzaklaşır - ta ki biri, kendisine reddedilmeyeceği söylenen tam anda reddedilene kadar" },
    "x.reset": { headline: "pencere sıfırlandı; aynı limit kapsamında kapasite yeniden kullanılabilir", detail: "daha sonraki bir pencerede limite yeniden ulaşılması, buraya yeniden giriş yapar" },
  },
  },
  "SCH-172": {
  shortName: "Geçici Slot Tutma",
  name: "Slot tutma → geçici olarak rezerve etme → onaylama, süresi dolma veya serbest bırakma",
  purpose: "Bir rezervasyon tamamlanırken belirli bir kapasiteyi, bunun bir rezervasyon olduğunu iddia etmeden, sınırlı bir süre için korumak.",
  nodes: {
    "t.granted": { headline: "Geçici tutma verildi" },
    "c.idempotent": { headline: "Bu talep sahibine ait, bu slotu kapsayan aktif bir tutma zaten var mı?", edges: [{ label: "Zaten var", detail: "aynı sahip ve slot için süresi dolmamış bir tutma aktif" }, { label: "Yok", detail: "bu slotu kapsayan aktif bir tutma yok" }] },
    "a.reuse": { headline: "İkinci bir tutma oluşturmak yerine mevcut tutmayı döndür. Yeniden denenen bir rezervasyon adımı tek bir tutma üretmeli, iki değil - tek bir slota karşı iki tutma kapasiteyi iki kat tüketir ve iki farklı anda süresi dolar, bu yüzden slot ikisinin de bir önemi kalmadıktan çok sonra bile rezerve edilemez kalır" },
    "a.create": { headline: "Kimliği, kaynağı ve slotu, tutulan kapasiteyi, sahibini, oluşturulma zamanını, geçerlilik süresini ve ait olduğu rezervasyon niyetini içeren kapsamlı tutmayı oluştur. TUTULDU olarak kaydet. Tutma, süresi boyunca kapasiteyi tüketir ve hiçbir taahhüt yaratmaz - kimsenin bir randevusu yoktur, ve burada hiçbir şey talep sahibine sanki varmış gibi anlatılmamalıdır" },
    "w.hold": { headline: "Rezervasyon onaylanana, tutma açıkça serbest bırakılana veya tutmanın arkasındaki rezervasyon niyetinden vazgeçilene kadar bekle", detail: "zaman aşımı: Tutmanın geçerlilik süresinin sonunda. (yapılandırma: slot_hold.hold)" },
    "c.outcome": { headline: "Tutmayı ne sonuçlandırdı?", edges: [{ label: "Onaylandı", detail: "bu tutmaya karşılık bir rezervasyon onaylandı" }, { label: "Açıkça serbest bırakıldı", detail: "sahibi veya rezervasyon akışı tutmayı serbest bıraktı" }, { label: "Niyetten vazgeçildi", detail: "tutmayı yaratan rezervasyon girişimi durdu" }] },
    "a.expire": { headline: "Kapasiteyi serbest bırak ve tutmayı SÜRESİ DOLDU olarak kaydet. Süresi dolmuş bir tutma hiçbir şey tüketmez, ve serbest bırakma birinin hatırlamasıyla değil, saatin öyle söylemesiyle gerçekleşir" },
    "a.consume": { headline: "Tutmayı onaylanan rezervasyona dönüştürerek kapasiteyi tutulandan rezerve edilene tek adımda taşı. Önce serbest bırakıp sonra yeniden almak - kısa ama tamamen yeterince uzun - bir pencere açar; bu pencerede başka biri, talep sahibinin az önce parasını ödediği slotu kapabilir" },
    "a.release": { headline: "Kapasiteyi serbest bırak ve tutmayı SERBEST BIRAKILDI olarak kaydet. Serbest bırakma işlemi idempotenttir - zaten serbest bırakılmış bir tutmayı tekrar serbest bırakmak, kapasiteyi ikinci kez iade etmek yerine hiçbir şeyi değiştirmez; bu iki davranış arasındaki fark, tek bir slota kaç kişinin rezerve edilebileceğini belirler" },
    "c.still-needed": { headline: "Tutulan kapasite hâlâ aktif bir şey tarafından gerekli mi?", edges: [{ label: "Artık gerekli değil", detail: "bu kapasitenin tutulmasına bağlı başka hiçbir şey yok" }, { label: "Hâlâ gerekli", detail: "aynı talep sahibine ait başka bir aktif rezervasyon adımı buna bağlı" }] },
    "x.expired": { headline: "SÜRESİ DOLDU; kapasite serbest bırakıldı ve tekrar müsait", detail: "aynı talep sahibi, hâlâ boşsa aynı slot için yeni bir tutma alabilir; bu, mevcut tutmanın uzatılması değil, yeni bir tutmadır" },
    "x.consumed": { headline: "onaylanan bir rezervasyona dönüştürüldü; kapasite bir daha hiç boşa geçmedi", detail: "kapasiteye artık rezervasyon sahiptir. Bir iptal, bu tutma üzerinden değil, iptal yaşam döngüsünü üzerinden kapasiteyi serbest bırakır" },
    "x.released": { headline: "SERBEST BIRAKILDI; kapasite tekrar müsait", detail: "bu tutmaya karşı tekrarlanan bir serbest bırakma işlemi, kapasiteyi ikinci kez iade etmek yerine hiçbir etkisi olmayan bir işlemdir" },
  },
  },
  "SCH-173": {
  shortName: "Rezervasyon Doğrulama",
  name: "Rezervasyon talebi → doğrulama → onaylama, reddetme veya bekletme",
  purpose: "Belirli bir zaman için yapılan bir talebi her iki tarafın da güvenebileceği bir taahhüde dönüştürmek, ya da bunun olmadığını açıkça söylemek.",
  nodes: {
    "t.requested": { headline: "Rezervasyon talep edildi" },
    "a.capture": { headline: "Talep edilen slotu, kaynağı veya hizmeti, talep sahibini, rezervasyonun gerektirdiği bilgileri ve arkasındaki niyeti kaydet" },
    "c.duplicate": { headline: "Bu talep sahibi, kaynak ve slot için zaten onaylanmış bir rezervasyon var mı?", edges: [{ label: "Var", detail: "aynı rezervasyon zaten onaylanmış" }, { label: "Yok", detail: "bunu kapsayan onaylanmış bir rezervasyon yok" }] },
    "x.already": { headline: "zaten onaylanmış; mevcut rezervasyon geçerliliğini koruyor ve ikinci bir rezervasyon oluşturulmadı", detail: "gerçekten farklı bir rezervasyon farklı bir taleptir. Tekrar gönderilmiş bir talep ikinci bir slot tüketmek yerine burada sonuçlanır" },
    "a.revalidate": { headline: "Talep sahibine gösterilen bilgiye güvenmek yerine slotun güncel durumunu yeniden oku. Gördükleri müsaitlik, gösterildiği anda doğruydu ve şimdi doğru olmayabilir - yoğun rekabet altında iki kişinin aynı randevuyu elinde tutmasının en yaygın yolu tam olarak budur, ve bunu ancak ikisinden biri kapıda öğrenir" },
    "c.capacity": { headline: "Kapasite bu talep sahibi için hâlâ müsait mi?", edges: [{ label: "Müsait", detail: "slot boş, veya bu talep sahibi tarafından tutuluyor" }, { label: "Kalmadı", detail: "kapasite, sorgu ile talep arasında başkası tarafından alındı" }] },
    "a.validate-req": { headline: "Talep sahibinin uygunluğunu, rezervasyonun gerektirdiği bilgileri ve semantiğinin tanımladığı bağımlılıkları doğrula. Bir hizmet için uygunluk ile bir slot için müsaitlik farklı sorulardır, ve birinden geçmiş olmak diğeri hakkında hiçbir şey söylemez" },
    "a.reject": { headline: "Talebi gerekçesiyle birlikte REDDEDİLDİ olarak kaydet. Bundan sonra sunulan şey, talep sahibinin başlangıçta gördüğü küme değil, güncel müsaitliktir - o küme, tanımı gereği artık var olmayan en az bir slot içerir" },
    "c.requirements": { headline: "Rezervasyon gereksinimleri ne diyor?", edges: [{ label: "Hepsi karşılandı", detail: "uygunluk, bilgiler ve bağımlılıkların hepsi yerinde" }, { label: "Ek bir onay veya bağımlılık gerekiyor", detail: "rezervasyon semantiği, taahhüt edilmeden önce bir onay, ön ödeme veya doğrulama gerektiriyor" }, { label: "Karşılanmadı", detail: "bir gereksinim karşılanamıyor ve bu talep için sağlanamaz" }] },
    "h.alternative": { headline: "Müsaitlik sorgusu → kapasiteyi değerlendirme → geçerli seçenekleri sunma", detail: "talep edilen slota karşı yapılamayan bir rezervasyon" },
    "a.confirm": { headline: "Taahhüdü açıkça oluştur. Slotu, kaynağı, tarafları ve şartları içeren ONAYLANMIŞ_REZERVASYON kaydını oluştur. Bu, iki tarafın birbirine belirli bir zamanı borçlu olduğu andır - müşteri gününü buna göre planlar ve sağlayıcı slotu satmayı bırakır - ve bundan önceki hiçbir şey bu değildi" },
    "a.pending": { headline: "BEKLEMEDE_ONAY durumunu, tam olarak nelerin eksik olduğuyla birlikte kaydet ve rezervasyon semantiğinin izin verdiği süre boyunca kapasiteyi korumaya devam et. Bekleyen durum onaylanmış değildir ve talep sahibine hangisi olduğu söylenir - birinin sahip olduğuna inandığı ve aslında sahip olmadığı bir randevu, beklemesinin istenmesinden daha kötüdür" },
    "h.prepare": { headline: "Rezervasyon onaylandı → hazırlık → yaklaşan veya hazır", detail: "önünde hâlâ zaman olan, onaylanmış bir rezervasyon" },
    "w.pending": { headline: "Belirtilen bağımlılık çözülene veya talep sahibi talebini geri çekene kadar bekle", detail: "zaman aşımı: Rezervasyon semantiğinin izin verdiği beklemede kalma süresinin sonunda. (yapılandırma: reservation_request.pending)" },
    "c.pending-outcome": { headline: "Bekleyen gereksinim nasıl sonuçlandı?", edges: [{ label: "Çözüldü", detail: "eksik olan onay veya bağımlılık tamamlandı" }, { label: "Geri çekildi", detail: "talep sahibi çözülmeden önce talebini geri çekti" }] },
    "a.lapse": { headline: "Talebi süresi geçmiş olarak kaydet ve onun için korunan kapasiteyi serbest bırak. Slot, hiç tamamlanmamış bir rezervasyona karşı rezerve kalmak yerine müsaitliğe geri döner" },
    "x.lapsed": { headline: "talebin süresi doldu; kapasite serbest bırakıldı ve hiçbir şey taahhüt edilmedi", detail: "yeni bir talep güncel müsaitliğe göre değerlendirilir; bu müsaitlik artık tutulan slotu içermeyebilir" },
  },
  },
  "SCH-174": {
  shortName: "Rezervasyon Hazırlığı",
  name: "Rezervasyon onaylandı → hazırlık → yaklaşan veya hazır",
  purpose: "Başarılı bir hizmet için gerekli koşulları yerine getirmek, ama söz verilen zamanı asla ötelemeden.",
  nodes: {
    "t.confirmed": { headline: "Rezervasyon onaylandı" },
    "a.determine": { headline: "Bu rezervasyonun gerçekten ihtiyaç duyduğu hizmet öncesi gereksinimleri belirle - formlar, belgeler, talimatlar, kaynak hazırlığı, doğrulama, ön ödeme, giriş yapma zorunluluğu, sağlayıcı hazırlığı. Hangilerinin geçerli olduğu, standart bir liste değil, bu hizmetin bir özelliğidir; standart listeyi uygulamak, insanlardan randevularının ihtiyaç duymadığı şeyleri istemek anlamına gelir" },
    "c.existing": { headline: "Her ön koşul zaten karşılanmış veya zaten yürütülüyor mu?", edges: [{ label: "Zaten halledildi", detail: "gereksinim karşılandı, veya buna yönelik bir süreç zaten aktif" }, { label: "Eksik", detail: "gereksinim ne karşılanmış ne de devam ediyor" }] },
    "a.skip": { headline: "Tekrarlama. Geçen ay tamamlanmış bir doğrulama tamamlanmıştır; onu yeniden çalıştırmak tek bir gereksinim için ikinci bir süreç açar ve müşteriden zaten verdiği bir şeyi tekrar ister" },
    "a.initiate": { headline: "Her eksik ön koşulu kendi yaşam döngüsününda başlat. Bunlar çalışırken rezervasyonun zamanı değişmez ve hiçbiri rezervasyonun sahibi değildir" },
    "w.prepare": { headline: "Müşteriye ait tüm ön koşullar tamamlanmış olarak kaydedilene, veya rezervasyon iptal edilene, ertelenene ya da esaslı biçimde değişene kadar bekle", detail: "zaman aşımı: Kontrol noktası, hizmet öncesi politikanın bu hizmet sınıfı için planlanan zamandan önce tanımladığı süredir; kontrol noktasında karşılanmamış olan her şey, daha fazla beklenmeden yükseltilir. (yapılandırma: scheduling.readiness_checkpoint)" },
    "c.olay": { headline: "Bekleyişi ne sonuçlandırdı?", edges: [{ label: "Hazırlık tamamlandı", detail: "kontrol noktasından önce her ön koşul tamamlandı" }, { label: "Rezervasyon değişti", detail: "rezervasyon ertelendi, iptal edildi veya esaslı biçimde değiştirildi" }] },
    "c.critical": { headline: "Çözülmemiş bir ön koşul hizmetin verilmesi için kritik mi?", edges: [{ label: "Kritik", detail: "hizmet onsuz düzgün verilemez" }, { label: "Kritik değil", detail: "hizmet devam edebilir ve gereksinim sonradan tamamlanabilir" }] },
    "a.ready": { headline: "Hangi ön koşulların tamamlandığını ve hangilerinin eksik ama kritik olmadığını belirterek HAZIR veya YAKLAŞAN olarak kaydet. Bir hatırlatmanın gönderilmiş olması, hazırlığın tamamlanmış olmasından ayrı kaydedilir; çünkü ilki bizim yaptığımız bir şeydir, ikincisi ise gerçekleşen bir şeydir" },
    "x.superseded": { headline: "hazırlık, rezervasyondaki bir değişiklikle geçersiz kılındı", detail: "sonrasında ne olacağını erteleme veya iptal belirler. Hazırlık, taşınmak yerine yeni rezervasyona göre yeniden türetilir; çünkü farklı bir zaman farklı şeylere ihtiyaç duyabilir" },
    "a.at-risk": { headline: "Eksik ön koşulu belirterek politikaya göre RİSK_ALTINDA veya BEKLETİLDİ olarak kaydet. Onaylanmış zamanı değiştirme; randevuyu ötelemek erteleme yaşam döngüsüne ait ayrı bir rezervasyon kararıdır" },
    "x.upcoming": { headline: "HAZIR veya YAKLAŞAN; taahhüt geçerliliğini koruyor ve koşulları kaydedilen durumda", detail: "hizmet zamanındaki yeniden doğrulama, bu hazırlık kaydını değil, rezervasyonun o anki güncel durumunu okur; bu kayıt yazıldığı anda doğruydu" },
    "h.escalate": { headline: "Sorumluluk yükseltme → üst yetkili → çözüm veya iade", detail: "hizmet öncesi kontrol noktasında çözülmemiş kritik bir ön koşul" },
  },
  },
  "SCH-175": {
  shortName: "Erteleme Doğrulama",
  name: "Erteleme talebi → müsaitliği yeniden kontrol etme → taşıma, reddetme veya orijinali koruma",
  purpose: "Bir taahhüdü yeni bir zamana taşımak, ama müşteriyi asla hiçbirine sahip olmadan bırakmadan.",
  nodes: {
    "t.requested": { headline: "Erteleme talep edildi" },
    "a.preserve": { headline: "Yenisi değerlendirilirken orijinal rezervasyonu onaylı ve dokunulmamış tut. Önce onu serbest bırakmak, bu sürecin önlemeye çalıştığı hatadır - müşteri hiçbir randevusu olmadan kalır, ve elindeki slot, yenisinin müsait olmadığı fark edildiğinde çoktan gitmiş olur" },
    "a.search": { headline: "Orijinal rezervasyonun gerçekten ihtiyaç duyduğu kaynak ve hizmet için, hedeflenen müsaitliği güncel yetkili kapasiteye karşı ara ve doğrula" },
    "c.replacement": { headline: "Geçerli bir yer değiştirme mevcut mu?", edges: [{ label: "Var", detail: "rezervasyonun gereksinimlerini karşılayan bir slot şu anda boş" }, { label: "Yok", detail: "talep edilen pencerede geçerli hiçbir şey müsait değil" }] },
    "a.secure": { headline: "Yeni slotu, orijinal rezervasyonla aynı rezervasyon semantiği altında - önce bir tutma ve ardından bir onay, veya kaynağın izin verdiği durumlarda doğrudan bir taahhüt olarak - güvence altına al. Yer değiştirme, hiçbir şeyden vazgeçilmeden önce gerçekten taahhüt edilmiş olmalıdır" },
    "a.no-replacement": { headline: "Erteleme talebinin mümkün olmadığını kaydet ve orijinal rezervasyonu tam olarak olduğu gibi bırak. Müşterinin hâlâ randevusu vardır; bu, talep etmeden önceki konumudur - ve alternatiften çok daha iyi bir sonuçtur" },
    "c.secured": { headline: "Yer değiştirme gerçekten güvence altına alındı mı?", edges: [{ label: "Alındı", detail: "yeni slot bu rezervasyona taahhüt edildi" }, { label: "Rekabete kaybedildi", detail: "slot, bulunmasıyla güvence altına alınması arasında başkası tarafından alındı" }] },
    "x.original-stands": { headline: "orijinal rezervasyon değişmeden korundu; hiçbir taşıma gerçekleşmedi", detail: "erteleme, farklı bir müsaitliğe karşı tekrar denenebilir. Orijinali iptal etmek, müşterinin açıkça vereceği ayrı bir karardır" },
    "a.transfer": { headline: "Taahhüdü yeni slota taşı; orijinal zamanı, yeni zamanı ve bu rezervasyonun taşındığı gerçeğini kaydederek. Orijinal zaman okunabilir kalır - yalnızca güncel zamanını gösteren bir rezervasyon, kaç kez taşındığı sorusunu yanıtlayamaz; bu da bir hizmet sorununu araştıran birinin sormak isteyeceği ilk şeydir" },
    "a.release-old": { headline: "Orijinal slotu, ve ancak şimdi, serbest bırak. Kapasite, yer değiştirme gerçek olduğu anda müsaitliğe geri döner; bu tüm sürecin var olma amacı olan sıralamadır" },
    "a.reconcile": { headline: "Eski zamana yönelik olan her şeyi uzlaştır - kaynağı, sağlayıcıyı, talimatları, ön ödemeyi, hazırlık görevlerini ve kuyruğa alınmış tüm bildirimleri. Hâlâ orijinal zamanı hedefleyen bir hatırlatma tetiklenecektir, ve müşteri bunun yüzünden yanlış günde gelecektir" },
    "c.prep": { headline: "Yeni zaman veya kaynak, gereken hazırlığı değiştiriyor mu?", edges: [{ label: "Değişiyor", detail: "farklı bir sağlayıcı, konum veya hazırlık süresi ön koşulları değiştiriyor" }, { label: "Değişmiyor", detail: "aynı hazırlık geçerli ve zaten olduğu durumda" }] },
    "h.prepare": { headline: "Rezervasyon onaylandı → hazırlık → yaklaşan veya hazır", detail: "hazırlık gereksinimleri değişmiş, ertelenmiş bir rezervasyon" },
    "x.rescheduled": { headline: "taşındı; yeni zaman taahhüt edildi ve orijinal kayıtta korunuyor", detail: "sonraki bir taşıma, bu rezervasyona karşı yeni bir erteleme işlemidir ve yerini almak yerine aynı geçmişe katılır" },
  },
  },
  "SCH-176": {
  shortName: "Rezervasyon İptali Uzlaştırması",
  name: "Rezervasyon iptali → taahhüdü durdurma → kapasiteyi serbest bırakma → uzlaştırma",
  purpose: "Gelecekteki bir zaman taahhüdünü temiz bir şekilde sonlandırmak, kapasiteyi geri vermek ve parayla ilgili kararı başka bir yere bırakmak.",
  nodes: {
    "t.effective": { headline: "Rezervasyon iptali yürürlüğe girdi" },
    "a.record": { headline: "Eylemi gerçekleştireni ve kaynağını, gerekçeyi, yürürlük zamanını, iptal anındaki rezervasyon durumunu ve planlanan hizmete göre zamanlamayı kaydet. Çoğu iptal politikası zamanlamaya dayanır, ve bu bilgi başka şeyleri ifade eden zaman damgalarından sonradan yeniden inşa edilmek yerine o anda kaydedilmelidir" },
    "c.actor": { headline: "İptali hangi taraf yaptı?", edges: [{ label: "Müşteri veya talep sahibi", detail: "iptal, rezervasyonu yapan taraftan kaynaklanıyor" }, { label: "Sağlayıcı veya kaynak tarafı", detail: "iptal, hizmeti verememizden kaynaklanıyor" }] },
    "a.cancel": { headline: "Rezervasyonu, orijinal rezervasyonu, tuttuğu zamanları ve yürütülen hazırlığı koruyarak İPTAL EDİLDİ olarak işaretle. Geçmiş silinmez; çünkü serbest bırakılan bir slot, kapasitenin havuza dönmesidir ve randevunun hiç var olup olmadığı hakkında hiçbir şey söylemez" },
    "h.provider": { headline: "Sağlayıcı veya kaynak iptali → yeniden tahsis → erteleme, düzeltme veya iptal", detail: "sağlayıcı tarafından kaynaklanan bir iptal" },
    "a.release": { headline: "Rezervasyon semantiğinin izin verdiği yerde rezerve edilmiş kapasiteyi serbest bırak. Serbest bırakma idempotenttir - zaten serbest bırakılmış bir rezervasyon, her denemede değil, kapasiteyi bir kez iade eder; farkı, tek bir odaya iki kişinin rezerve edilmesi olarak ortaya çıkar" },
    "a.stop": { headline: "Geçersiz hale gelen hazırlık, hatırlatma ve giriş işlemlerini durdur. İptal edilmiş bir randevu için gönderilen hatırlatma, kimsenin beklemediği bir yere birini getirir; bu kategorideki en önlenebilir hatadır" },
    "c.external": { headline: "Bu rezervasyonu harici bir sağlayıcı veya rezervasyon sistemi mi tutuyor?", edges: [{ label: "Tutuyor", detail: "slot kendi sistemimizin dışındaki bir sistemde var" }, { label: "Tutmuyor", detail: "rezervasyon tamamen dahili" }] },
    "a.verify-external": { headline: "İptalin harici tarafta gerçekten geçerli hale geldiğini doğrula. Bizim kaydettiğimiz ama onların kaydetmediği bir iptal, onları bizim serbest bıraktığımız bir slotu hâlâ tutuyor durumda bırakır, ve her iki taraf da bunu birinin oraya gelmesiyle öğrenir" },
    "c.financial": { headline: "İptalin mali bir sonucu var mı?", edges: [{ label: "İade veya kredi söz konusu olabilir", detail: "rezervasyon için ödeme yapılmış ve şartlar bunun tamamını veya bir kısmını iade edebilir" }, { label: "İptal ücreti uygulanıyor", detail: "şartlar, iptalin zamanlamasına göre bir ücret oluşturuyor" }, { label: "İkisi de değil", detail: "hiçbir ödeme yapılmadı ve şartlar herhangi bir ücret oluşturmuyor" }] },
    "c.verified": { headline: "Harici taraf iptali onayladı mı?", edges: [{ label: "Onaylandı", detail: "harici sistem, iptal edildiğini yetkili biçimde bildiriyor" }, { label: "Onaylanmadı", detail: "harici taraf erişilemiyor, sessiz kalıyor veya hâlâ rezerve gösteriyor" }] },
    "h.refund": { headline: "İade talebi → uygunluk → onaylama, reddetme veya inceleme", detail: "ödemesi yapılmış, iptal edilmiş bir rezervasyon" },
    "h.fee": { headline: "Mali yükümlülük oluşturuldu → vadesi geldi → karşılandı veya bekliyor", detail: "şartların ücret bağladığı bir iptal" },
    "x.cancelled": { headline: "İPTAL EDİLDİ; kapasite serbest bırakıldı, geçmiş korundu, hiçbir borç kalmadı", detail: "yeni bir rezervasyon, bunun devamı değil, yeni bir rezervasyondur; bu iptal her iki durumda da kaydın bir parçası olarak kalır" },
    "h.reconcile": { headline: "external:external-status-reconciliation", detail: "harici rezervasyon sisteminin onaylamadığı bir iptal" },
  },
  },
  "SCH-177": {
  shortName: "Hizmet Öncesi Yeniden Doğrulama",
  name: "Planlanan zaman yaklaşıyor → yeniden doğrulama → giriş yapma, başlama veya istisna",
  purpose: "Bir hizmeti, haftalar önce verilmiş bir onaydan değil, rezervasyonun şu anki durumundan başlatmak.",
  nodes: {
    "t.window": { headline: "Başlangıç öncesi pencereye ulaşıldı" },
    "a.revalidate": { headline: "Rezervasyonu güncel yetkili durumdan yeniden oku - rezervasyon hâlâ onaylı mı, kaynak veya sağlayıcı müsait mi, gerekli ön koşullar karşılanmış mı, uygunluk gerekli olduğu yerde hâlâ geçerli mi, esaslı bir operasyonel kısıtlama var mı. Üç hafta önceki onay, şu an hakkında bir kanıt değildir; ve bu işin çalışması bir şey kontrol edildiği için değil, bir saatin öyle söylemesi yüzündendir" },
    "c.valid": { headline: "Rezervasyon hâlâ geçerli mi?", edges: [{ label: "Hâlâ onaylı", detail: "rezervasyon planlandığı gibi geçerliliğini koruyor" }, { label: "O zamandan beri iptal edildi veya ertelendi", detail: "iş planlandığından bu yana rezervasyon taşınmış veya sona ermiş" }] },
    "c.provider": { headline: "Sağlayıcı veya kaynak gerçekten hizmeti verebilir mi?", edges: [{ label: "Verebilir", detail: "atanan sağlayıcı ve kaynak müsait ve yeterli" }, { label: "Veremez", detail: "sağlayıcı müsait değil, kaynak arızalı veya konum bunu barındıramıyor" }] },
    "a.suppress": { headline: "Planlanan işi bastırılmış olarak kaydet, yerine neyin geçtiğini belirterek. Güncel olmayan bir başlatma işi, iptal edilmiş bir rezervasyonu yeniden canlandırır, ona bir sağlayıcı tahsis eder ve sonunda doğru şekilde iptal etmiş biri için bir gelmeme kaydı üretir - kontrol edilmemiş tek bir varsayımdan çıkan üç yanlış sonuç" },
    "c.prereq": { headline: "Kritik ön koşullar karşılanmış mı?", edges: [{ label: "Karşılandı", detail: "hizmetin düzgün başlaması için gereken her şey yerinde" }, { label: "Eksik", detail: "hizmetin onsuz ilerleyemeyeceği bir ön koşul çözülmemiş" }] },
    "h.provider-exception": { headline: "Sağlayıcı veya kaynak iptali → yeniden tahsis → erteleme, düzeltme veya iptal", detail: "atanan sağlayıcısı veya kaynağı tarafından verilemeyen bir rezervasyon" },
    "x.suppressed": { headline: "güncel olmayan başlatma bastırıldı; hiçbir hizmet başlamadı ve hiçbir katılım durumu kaydedilmedi", detail: "rezervasyonun güncel sürümünün kendi planlanan tekrarı var; bu tekrar geldiğinde kendi koşullarına göre yeniden doğrulanır" },
    "a.ready": { headline: "BAŞLAMAYA_HAZIR olarak kaydet. Planlanan zamanın gelmesi, hizmetin başlaması değildir - bu ikisi ayrı tutulur; çünkü aralarındaki her şey hâlâ başarısız olabilir, ve bu kategorideki başarısızlıkların çoğu tam olarak burada gerçekleşir" },
    "a.blocked": { headline: "Tekrarı hizmet zamanında, eksik ön koşulla birlikte engellenmiş olarak kaydet ve başlatma. Ön koşulu eksik bir hizmeti başlatmak, kısmi veya geçersiz bir teslimat üretir; bu da bir düzeltmeye ihtiyaç duyar - ve müşteri her iki durumda da randevusunu harcamış olur" },
    "w.arrival": { headline: "Katılım veya giriş yetkili biçimde belirlenene, veya rezervasyon sistem kaydında iptal edilene kadar bekle", detail: "zaman aşımı: Varış penceresi, hizmetin kendi katılım semantiğinin planlanan başlangıçtan sonra tanıdığı toleranstır. Bunun sona ermesi, geç kalmayı bir gelmemeye dönüştüren şeydir. (önerilen: scheduled_at artı varış toleransı politikasının kaydettiği süre; yapılandırma: scheduling.arrival_window)" },
    "h.escalate": { headline: "Sorumluluk yükseltme → üst yetkili → çözüm veya iade", detail: "kendi başlangıç zamanında engellenen bir hizmet" },
    "c.arrival": { headline: "Varış penceresi içinde ne oldu?", edges: [{ label: "Katıldı", detail: "katılım veya giriş yetkili biçimde belirlendi" }, { label: "Pencere içinde iptal edildi", detail: "rezervasyon, başlangıç penceresi açıldıktan sonra iptal edildi" }] },
    "h.missed": { headline: "Gelmeme veya kaçırılan randevu → doğrulama → yeniden rezervasyon, kapatma veya sonuç", detail: "hiçbir katılım belirlenmeden kapanan bir varış penceresi" },
    "h.attended": { headline: "Katılım veya hizmet başlangıcı → tamamlanma, kısmi tamamlanma veya kesinti", detail: "yeniden doğrulanan bir rezervasyon için belirlenen katılım" },
    "h.cancelled": { headline: "Rezervasyon iptali → taahhüdü durdurma → kapasiteyi serbest bırakma → uzlaştırma", detail: "başlangıç penceresi içinde gelen bir iptal" },
  },
  },
  "SCH-178": {
  shortName: "Hizmet Tamamlama",
  name: "Katılım veya hizmet başlangıcı → tamamlanma, kısmi tamamlanma veya kesinti",
  purpose: "Birinin geldiği gerçeğini, aradığını alıp almadığı sorusundan ayırmak.",
  nodes: {
    "t.started": { headline: "Hizmet başlangıcı belirlendi" },
    "a.state": { headline: "HİZMETTE veya KATILDI olarak kaydet. Etkileşim gerçekleşiyor ve sonucu hakkında henüz hiçbir şey bilinmiyor" },
    "a.track": { headline: "Hizmetin izlenmeye değer bir kapsamı olduğu yerde, gerçekten teslim edilen kapsamı izle. Kaydedilen şey, randevunun gerçekleştiği bilgisi değil, teslim edilen şeydir" },
    "w.service": { headline: "Hizmet tamamlanana veya hizmet kesintiye uğrayana kadar bekle", detail: "zaman aşımı: Planlanan sürenin, toleransı eklenmiş halinin sonunda. (yapılandırma: service_attendance.service)" },
    "c.outcome": { headline: "Hizmet nasıl sona erdi?", edges: [{ label: "Tam olarak teslim edildi", detail: "planlanan hizmetin tamamı teslim edildi" }, { label: "Kısmen teslim edildi", detail: "planlanan kapsamın bir kısmı teslim edildi, bir kısmı edilmedi" }, { label: "Kesintiye uğradı", detail: "teslimat başladı ve bitmeden durdu" }, { label: "Gelişten sonra ilerleyemedi", detail: "müşteri oradaydı ve hizmet hiç başlamadı" }] },
    "a.unknown": { headline: "Tekrarın sonucunu bilinmiyor olarak kaydet - biri geldi ve sonrasında ne olduğu hiç kaydedilmedi. Bu tamamlanma değildir, ve bunu tamamlanma gibi ele almak, kimsenin karşılandığını doğrulamadığı bir yükümlülüğü kapatır" },
    "a.complete": { headline: "TAMAMLANDI olarak kaydet. Planlanan yükümlülük karşılandı; bu, randevunun gerçekleşmiş olmasından farklı bir iddiadır" },
    "a.partial": { headline: "Tam olarak neyin teslim edildiğini ve neyin kaldığını belirterek KISMEN_TAMAMLANDI olarak kaydet. Katılım başarılı bir sonuç değildir, ve yarım teslim edilmiş bir hizmeti tamamlandı olarak kaydetmek, müşterinin hâlâ hak ettiği bir şeyi kapatır - bunu er ya da geç öğrenecekler, ve söyleyebileceğimizden daha geç öğrenecekler" },
    "a.interrupt": { headline: "Kesintiyi, nedenini ve teslimatın durduğu noktayı kaydet" },
    "a.could-not": { headline: "Katılımın gerçekleştiğini ve hizmetin gerçekleşmediğini kaydet. Bu, bir gelmemeden ve bir iptalden farklı bir olgudur - müşteri kendisinden istenen her şeyi yaptı ve elinde hiçbir şey olmadan ayrıldı; bu, yanlış kaydedilmesi en olası ve müşteri tarafından unutulması en az olası sonuçtur" },
    "h.reconcile": { headline: "external:side-effect-reconciliation", detail: "başlamış ve sonucu hiç belirlenmemiş bir tekrar" },
    "x.completed": { headline: "TAMAMLANDI; katılım ve teslimat ikisi de belirlendi", detail: "sonradan neyin teslim edildiğine dair gelen bir sorun, tamamlanma sonrası bir konudur ve kendi koşullarında değerlendirilir" },
    "h.remainder": { headline: "Çözüm seçimi → yükümlülüğü çözme → gerekirse mali sonrası", detail: "yalnızca kısmen teslim edilmiş, planlanan bir hizmet" },
    "c.interruption": { headline: "Kesinti neye izin veriyor?", edges: [{ label: "Şimdi devam etme", detail: "neden ortadan kalktı ve kalan kapsam bu tekrarın içine sığıyor" }, { label: "Ayrı bir randevu", detail: "kalan kapsam ayrı, planlanmış bir tekrara ihtiyaç duyuyor" }, { label: "Bir çözüm", detail: "eksik olan şey tekrarlanmak yerine çözülmeye ihtiyaç duyuyor" }] },
    "c.cause": { headline: "Neden ilerleyemedi?", edges: [{ label: "Sağlayıcı veya kaynak tarafı", detail: "teslimat noktasında sağlayıcı, ekipman, konum veya kapasite arızalandı" }, { label: "Müşterinin getirmesi gereken bir şey", detail: "müşteriye ait gerekli bir belge, koşul veya hazırlık eksikti" }] },
    "a.resume": { headline: "Aynı tekrara devam et ve teslim edilen kapsamı izlemeye devam et. Bekleyişin zaman aşımı planlanan süredir ve uzatılmaz; bu yüzden sürekli duran bir tekrar, süresiz devam etmek yerine kendi sınırına ulaşır" },
    "h.reschedule": { headline: "Erteleme talebi → müsaitliği yeniden kontrol etme → taşıma, reddetme veya orijinali koruma", detail: "ek bir planlanmış tekrara ihtiyaç duyan kalan kapsam" },
    "h.provider": { headline: "Sağlayıcı veya kaynak iptali → yeniden tahsis → erteleme, düzeltme veya iptal", detail: "müşteri geldikten sonra sağlayıcı tarafındaki nedenlerle ilerleyemeyen bir hizmet" },
    "h.rebook": { headline: "Erteleme talebi → müsaitliği yeniden kontrol etme → taşıma, reddetme veya orijinali koruma", detail: "müşteri tarafındaki bir gereksinim eksik olduğu için ilerleyemeyen bir hizmet" },
  },
  },
  "SCH-179": {
  shortName: "Gelmeme Doğrulaması",
  name: "Gelmeme veya kaçırılan randevu → doğrulama → yeniden rezervasyon, kapatma veya sonuç",
  purpose: "Onaylanmış bir rezervasyonun, her başka açıklama elenerek, müşterinin katılmaması yüzünden gerçekleşmediğini tespit etmek.",
  nodes: {
    "t.passed": { headline: "Hizmet penceresi başlamadan geçti" },
    "a.revalidate": { headline: "Herhangi bir sonuca varmadan önce rezervasyonun en güncel olaylarını yeniden oku. Kaçırılan randevu işi bir saate göre çalışır ve rezervasyon bundan dakikalar önce değişmiş olabilir - bu kontrol, bir gerçek ile bir suçlama arasındaki farktır" },
    "c.superseded": { headline: "Rezervasyon iptal edildi mi veya ertelendi mi?", edges: [{ label: "Edildi", detail: "bu tekrara karşı bir iptal veya erteleme mevcut" }, { label: "Geçerliliğini koruyor", detail: "rezervasyon onaylıydı ve penceresi boyunca değişmedi" }] },
    "a.suppress": { headline: "Gelmeme sınıflandırmasını tamamen bastır. Doğru şekilde iptal etmiş birine veya gelecek Salı'ya rezerve olmuş birine bunu kaydetmek, tamamen doğru bir davranışa bir ceza ve bir geçmiş yükler - ve bu, insanların hatırlayıp başkalarına anlattığı türden bir hatadır" },
    "c.provider": { headline: "Sağlayıcı veya kaynak gerçekten hizmeti verebilir miydi?", edges: [{ label: "Verebilirdi", detail: "sağlayıcı ve kaynak pencere boyunca müsait ve yeterliydi" }, { label: "Veremezdi", detail: "sağlayıcı müsait değildi, kaynak arızalandı veya konum bunu barındıramadı" }] },
    "x.suppressed": { headline: "gelmeme bastırıldı; rezervasyon iptal edildi veya taşındı ve hiçbir şey atfedilmedi", detail: "ertelenen tekrar kendi penceresine sahip ve geldiğinde kendi koşullarında değerlendirilir" },
    "c.semantics": { headline: "Rezervasyonun kendi semantiği, katılmamanın ne sayıldığını tanımlıyor mu?", edges: [{ label: "Tanımlı", detail: "bir tolerans süresi, bir geç varış kuralı ve varsa bir kısmi katılım kuralı belirtilmiş" }, { label: "Tanımlı değil", detail: "bu hizmet için gelmemenin ne sayıldığını belirten yetkili hiçbir şey yok" }] },
    "h.provider": { headline: "Sağlayıcı veya kaynak iptali → yeniden tahsis → erteleme, düzeltme veya iptal", detail: "sağlayıcı tarafının veremeyeceği, kaçırılmış bir tekrar" },
    "c.attended": { headline: "Müşteri bu semantiğe göre katılmamış mı sayılıyor?", edges: [{ label: "Katılmadı", detail: "semantiğin izin verdiği tolerans içinde hiçbir varış gerçekleşmedi" }, { label: "Geç ama tolerans içinde katıldı", detail: "varış, semantiğin tanımladığı tolerans içinde gerçekleşti" }] },
    "h.undefined": { headline: "Karar talebi → doğrulama → yönlendirme, reddetme veya bekletme", detail: "katılım semantiği tanımlanmamış, kaçırılmış bir tekrar" },
    "a.no-show": { headline: "GELMEME kaydını, kararın hangi semantiğe göre verildiğini ve kapanan pencereyi belirterek oluştur. Bu, tek bir onaylanmış rezervasyonun gerçekleşmemesinden başka bir şey değildir - müşterinin bağlılığı, sadakati veya ilişkisi hakkında bir yargı değildir, ve bunu okuyan süreçler bunu öyle ele almamalıdır" },
    "h.attended": { headline: "Katılım veya hizmet başlangıcı → tamamlanma, kısmi tamamlanma veya kesinti", detail: "semantiğin izin verdiği tolerans süresi içinde bir varış" },
    "c.next": { headline: "Politika sonraki adım olarak ne tanımlıyor?", edges: [{ label: "Yeniden rezervasyon sunuluyor", detail: "bu, kaçırıldığında yeniden rezervasyon yapılan bir hizmet türü" }, { label: "Mali bir sonuç uygulanıyor", detail: "şartlar, kaçırılan bir randevuya ücret veya kayıp bağlıyor" }, { label: "Kapatma", detail: "politika başka bir eylem tanımlamıyor" }] },
    "h.rebook": { headline: "Müsaitlik sorgusu → kapasiteyi değerlendirme → geçerli seçenekleri sunma", detail: "politikanın yeniden rezervasyona izin verdiği kaçırılmış bir randevu" },
    "h.fee": { headline: "Mali yükümlülük oluşturuldu → vadesi geldi → karşılandı veya bekliyor", detail: "şartların ücret bağladığı bir gelmeme" },
    "x.closed": { headline: "GELMEME kaydedildi; kayıt dışında bir sonuç yok", detail: "sonradan gelen bir katılım olayı, göz ardı edilmek yerine kaydedilmiş gelmeme durumuyla uzlaştırılır - geç gelen bir sistem güncellemesi, kaydı düzeltmek için bir sebeptir, kaydın doğru olduğunun kanıtı değil" },
  },
  },
  "SCH-180": {
  shortName: "Rezervasyon Ertelemesi",
  name: "Sağlayıcı veya kaynak iptali → yeniden tahsis → erteleme, düzeltme veya iptal",
  purpose: "Karşılayamadığımız bir taahhüdü, maliyetin hiçbir kısmı hazır olan kişiye yansımadan telafi etmek.",
  nodes: {
    "t.cannot": { headline: "Sağlayıcı veya kaynak hizmeti veremiyor" },
    "a.scope": { headline: "Arızanın etkilediği her rezervasyonu ve kapsamını belirle. Kapatılan bir konum tek bir iptal değildir - bunu öyle ele almak, alarmı tetikleyen rezervasyon için doğru bir sonuç ve arkasındaki kırk kişi için sessizlik üretir; her biri bunu kapıda öğrenir" },
    "a.protect": { headline: "Arızanın sağlayıcı tarafından kaynaklandığını kaydet. Sonrasında ne olursa olsun, müşteri iptal etmiş sayılmaz ve asla gelmeme olarak sınıflandırılmaz - müşteri hazırdı ve hizmet hazır değildi, ve kayıt bunu başka hiçbir şey bu rezervasyona dokunmadan önce belirtmelidir" },
    "c.replacement": { headline: "Aynı zaman için eşdeğer bir yer değiştirme mevcut mu?", edges: [{ label: "Mevcut ve izinli", detail: "başka bir sağlayıcı veya kaynak, rezerve edilen hizmeti rezerve edilen zamanda verebilir, ve kurallar ikamesine izin veriyor" }, { label: "Bu zamanda değil", detail: "eşdeğer hiçbir şey boş değil, veya bu hizmet için ikame izinli değil" }] },
    "a.reallocate": { headline: "Taahhüdü ve zamanı koruyarak yer değiştirmeye yeniden tahsis et. Yer değiştirme, hizmetin gereksinimlerini gerçekten karşılamalıdır - rezerve edilen hizmeti veremeyen farklı bir sağlayıcı bir yer değiştirme değildir, ve böyle bir ikame arızayı randevudan önceden randevu sırasına taşır" },
    "c.reschedule": { headline: "Geçerli karar kuralları bu rezervasyonun ertelenmesine izin veriyor mu?", edges: [{ label: "İzinli", detail: "hizmet başka bir zamanda verilebilir ve kurallar taşınmasına izin veriyor" }, { label: "İzinli değil", detail: "hizmet zamana bağlıydı, veya kurallar taşınmasına izin vermiyor" }] },
    "a.release-old": { headline: "Geçersiz hale gelen tahsisi, idempotent biçimde serbest bırak. Orijinal kaynak, serbest bırakma kaç kez denenmiş olursa olsun, müsaitliğe bir kez döner" },
    "h.reschedule": { headline: "Erteleme talebi → müsaitliği yeniden kontrol etme → taşıma, reddetme veya orijinali koruma", detail: "başka bir zamanda telafi edilebilecek, sağlayıcı tarafından kaynaklanan bir arıza" },
    "a.cancel": { headline: "Etkilenen rezervasyonu, sağlayıcı tarafı olarak kaydedilmiş şekilde iptal et. Sağlayıcı iptali ile müşteri iptali farklı sonuçları olan farklı nihai durumlardır, ve bunları birleştirmek, hizmetini karşılayamadığımız birine iptal ücreti kesmek anlamına gelir" },
    "c.notify": { headline: "Yeniden tahsis, müşterinin bilmesi gereken bir şeyi değiştiriyor mu?", edges: [{ label: "Değiştiriyor", detail: "sağlayıcı, konum veya hazırlık farklı" }, { label: "Değiştirmiyor", detail: "müşteriye görünen hiçbir şey değişmedi" }] },
    "a.release-cancel": { headline: "Tahsisi serbest bırak ve geçersiz hale gelen hazırlık, hatırlatma ve giriş işlemlerini durdur. İptal ettiğimiz bir randevu için gönderilen bir hatırlatma, müşteriyi kimsenin beklemediği bir hizmete getirir" },
    "a.inform": { headline: "Ne değiştiğini, zamanın değişmediğini vurgulayarak, bir ertelemeden ayrı biçimde söyle. 'Randevunuzda değişiklik oldu' okuyan ve zamanın kaydığını varsayan biri, başarıyla koruduğumuz bir randevuyu kaçırır" },
    "x.reallocated": { headline: "yeniden tahsis edildi; zaman ve taahhüt ikisi de geçerliliğini koruyor", detail: "rezervasyon, planlanan tekrarına devam eder ve orada diğerleri gibi yeniden doğrulanır" },
    "a.notify-provider-cancel": { headline: "Müşteriye, onaylanmış taahhüdün artık karşılanamayacağını, hatanın bize ait olduğunu ve müşterinin iptal etmiş veya kaçırmış sayılmayacağını söyle. Bu, herhangi bir çözüm veya iade belirlenmeden önce gönderilir - sonucu bekleyerek göndermek, kişinin rezervasyonunun gittiğini para hakkında bir mesajdan öğrenmesine yol açar" },
    "c.remedy": { headline: "Arıza geriye ne bırakıyor?", edges: [{ label: "Çözülmemiş bir hizmet yükümlülüğü", detail: "müşteri hâlâ hizmete ihtiyaç duyuyor ve bu teslim edilmedi" }, { label: "İade edilecek para", detail: "rezervasyon için ödeme yapıldı veya bir ücret alındı" }, { label: "İkisi de değil", detail: "hiçbir şey borçlanılmadı ve hiçbir şey ödenmedi" }] },
    "h.remedy": { headline: "Çözüm seçimi → yükümlülüğü çözme → gerekirse mali sonrası", detail: "sağlayıcı kaynaklı bir arızayla çözülmeden kalan bir hizmet yükümlülüğü" },
    "h.financial": { headline: "İade talebi → uygunluk → onaylama, reddetme veya inceleme", detail: "ödemesi yapılmış, sağlayıcı tarafından iptal edilmiş bir rezervasyon" },
    "x.cancelled-provider": { headline: "sağlayıcı tarafında iptal edildi; bize ait olarak kaydedildi, müşteriye hiçbir şey atfedilmedi", detail: "yeni bir rezervasyon yeni bir taahhüttür. Bu iptal, sağlayıcı arızası olarak kayıtta kalır; bu da müşterinin rezervasyon geçmişi hakkında sonradan sorulacak her sorunun dayandığı bilgidir" },
  },
  },
  "SCH-266": {
  shortName: "Randevu Hatırlatması",
  name: "Randevu yaklaşıyor → ön koşullar ve yeniden doğrulama → hazır, hatırlatıldı veya risk altında",
  purpose: "Müşterinin, onaylanmış bir taahhüde düşen kısmını taahhüt gelmeden önce tamamlatmak, ve hatırlatmayı rezervasyonun yapıldığı andaki durumundan değil, o anki durumundan göndermek.",
  nodes: {
    "t.booking": { headline: "Müşteriye ait ön koşulları olan onaylanmış rezervasyon" },
    "c.time": { headline: "Bir hatırlatma gönderilmeye değecek kadar zaman kaldı mı?", edges: [{ label: "Zaman kaldı", detail: "planlanan zaman, eksik bir ön koşulun hâlâ tamamlanabileceği kadar uzakta" }, { label: "Hatırlatmak için çok yakın", detail: "rezervasyon zaten kendi başlangıç öncesi penceresinin içinde" }] },
    "a.prompt": { headline: "Her eksik ön koşulu, kime ait olduğunu ve son yapılabileceği zamanı, gereksinim başına bir mesaj yerine tek bir mesajda belirt. Yapacak üç şeyi olan biri tek bir sorunla karşı karşıyadır, ve bunu üçe bölmek, birbirleriyle konuşmayan üç sistem izlenimi verir" },
    "a.revalidate": { headline: "Herhangi bir şey gönderilmeden önce rezervasyonu güncel yetkili durumdan yeniden oku - hâlâ onaylı mı, aynı zaman mı, aynı sağlayıcı mı, ve şu anda hangi ön koşullar eksik. Rezervasyonun eski hâlinden oluşturulmuş bir hatırlatma, doğru şekilde iptal etmiş birine gelmesi söylenmesinin yoludur" },
    "w.prereq": { headline: "Müşteriye ait tüm ön koşullar tamamlanmış olarak kaydedilene, veya rezervasyon iptal edilene, ertelenene ya da esaslı biçimde değişene kadar bekle", detail: "zaman aşımı: Hatırlatma, başlangıç öncesi noktada oluşturulur; böylece o andaki rezervasyonu yansıtır. Bu nokta, rezervasyonun ne zaman yapıldığından değil, müşterinin kendi hazırlığının ne kadar sürdüğünden belirlenir. (örnek: 24 saat–72 saat; yapılandırma: scheduling.pre_start_window)" },
    "c.valid": { headline: "Rezervasyon, az önce okunduğu haliyle hâlâ geçerli mi?", edges: [{ label: "Hâlâ geçerli", detail: "rezervasyon onaylı, kaydedilen zamanda, ve verilebilir durumda" }, { label: "İptal edildi, taşındı veya geçersiz kılındı", detail: "güncel durum, bu hatırlatmanın planlandığı rezervasyonla artık uyuşmuyor" }] },
    "c.prereq": { headline: "Bekleyişi ne sonuçlandırdı?", edges: [{ label: "Hepsi tamamlandı", detail: "müşterinin borçlu olduğu her ön koşul karşılanmış olarak kaydedildi" }, { label: "Rezervasyon değişti", detail: "rezervasyon iptal edildi, taşındı veya esaslı biçimde değiştirildi" }] },
    "c.critical": { headline: "Hizmetin gerçekleşmesini durduracak eksik bir şey var mı?", edges: [{ label: "Kritik ön koşul eksik", detail: "hizmetin onsuz verilemeyeceği bir gereksinim hâlâ karşılanmamış" }, { label: "Kritik olarak eksik bir şey yok", detail: "engelleyici olan her şey tamamlandı, kalan varsa engelleyici değil" }] },
    "x.superseded": { headline: "geçersiz kılındı; hatırlatma vadesi gelmeden rezervasyon değişti", detail: "yerine geçen rezervasyon, kendi hazırlığını kendi onayından yürütür" },
    "w.prestart": { headline: "Rezervasyon iptal edilene, taşınana veya esaslı biçimde değişene kadar bekle", detail: "zaman aşımı: Aynı başlangıç öncesi nokta: hatırlatma, rezervasyonun o andaki haline göre gönderilir. (örnek: 24 saat–72 saat; yapılandırma: scheduling.pre_start_window)" },
    "a.at-risk": { headline: "Hatırlatmayı gönder ve bunun ilerlemesini durduracak tek şeyi, hâlâ yapılabileceği son noktayla birlikte belirt. Onaylanmış zaman burada değiştirilmez - bir ön koşulun eksik olması birini uyarmak için bir sebeptir, planlanmış bir taahhüdü yeniden yazmak için değil" },
    "a.remind": { headline: "Zamanı, yeri veya katılım yolunu ve engel oluşturmayan, hâlâ eksik olan her şeyi hatırlat. Tekrar başına bir hatırlatma - ilkinin ulaştığını bilecek bir yol olmadığı için gönderilen ikinci bir hatırlatma, insanların onları okumayı bırakmasının yoludur" },
    "h.at-risk": { headline: "Rezervasyon onaylandı → hazırlık → yaklaşan veya hazır", detail: "başlangıç öncesi noktasına, kritik bir ön koşul hâlâ eksikken ulaşan bir rezervasyon" },
    "h.prestart": { headline: "Planlanan zaman yaklaşıyor → yeniden doğrulama → giriş yapma, başlama veya istisna", detail: "yeniden doğrulanmış bir rezervasyona karşı hatırlatıldı; başlangıç penceresi ve katılım, hizmet öncesi yeniden doğrulamaya aittir" },
  },
  },
  "SCH-277": {
  shortName: "Rezervasyon Onayı",
  name: "Rezervasyon talep edildi → kapasiteyi doğrulama → onaylama, yeniden sunma veya süresi geçme",
  purpose: "Talep sahibine, talep ettiği belirli zamanın artık bir taahhüt olup olmadığını söylemek, ve olmadığı yerde gerçekten var olan en yakın zamanı sunmak - çünkü daha önce gösterilen müsaitlik bir görüntüydü ve hiçbir zaman bir tutma değildi.",
  nodes: {
    "t.requested": { headline: "Rezervasyon talebi kaydedildi" },
    "a.received": { headline: "Talebi onayla ve bunun henüz bir taahhüt olmadığını açıkça söyle, sonucun ne zaman geleceğini belirterek. Bir zaman istemekle onu tutmak arasındaki boşluk, her çifte rezervasyon anlaşmazlığının başladığı yerdir" },
    "w.outcome": { headline: "Rezervasyon onaylanana, veya kapasite ya da uygunluk yokluğu nedeniyle talep reddedilene kadar bekle", detail: "zaman aşımı: Rezervasyon semantiğinin bir talebin çözülmeden kalmasına izin verdiği sürenin sonunda. (yapılandırma: reservation_outcome.outcome)" },
    "a.reread-outcome": { headline: "Zaman aşımını bir süresi geçme olarak ele almadan önce talebin sonucunu güncel yetkili durumdan yeniden oku. Zaman aşımına yakın bir anda ulaşan bir onay ya da bir ret, sessizlikle aynı olgu değildir" },
    "c.resolved-after-all": { headline: "Yeniden okuma sonuçta bir sonuç buldu mu?", edges: [{ label: "Sonuçta çözüldü", detail: "yeniden okuma, zaman aşımına işlem yapılmadan önce talebin taahhüt edildiğini veya reddedildiğini gösteriyor" }, { label: "Hâlâ çözülmemiş", detail: "yeniden okuma hiçbir şeye karar verilmediğini doğruluyor" }] },
    "c.outcome": { headline: "Yeniden doğrulama neye karar verdi?", edges: [{ label: "Taahhüt edildi", detail: "kapasite taahhüt edildi ve şimdi onaylanmış bir rezervasyon var" }, { label: "Kalmadı, ama yakın bir şey var", detail: "slot yeniden okunduğunda artık müsait değildi, ve güncel müsaitlik yeterince yakın, önerilmeye değer bir şey içeriyor" }, { label: "Kalmadı, yakın da bir şey yok", detail: "slot artık müsait değildi ve güncel müsaitlikte gerçek bir alternatif yok" }] },
    "a.lapse": { headline: "Talebi süresi geçmiş olarak kapat ve hiçbir şeyin tutulmadığını, hiçbir şeyin rezerve edilmediğini söyle. Talep sahipleri sessizliği onay olarak okur; bu, rezervasyonda yapılabilecek en maliyetli varsayımdır" },
    "a.confirm": { headline: "Taahhüt edilen slotu, kaynağı ve şartları somut olarak belirt - tarih, saat, yer, gelişte gerekenler. Ayrıntıları yeniden ifade etmeyen bir onay, talep sahibinin bir ay sonra üzerine hareket edebileceği bir şey değildir" },
    "a.reoffer": { headline: "Talep edilen zamanın kalmadığını söyle, şu anda müsait olan slotları belirt, ve seçim için bir son tarih ver. Sunulan şey güncel müsaitliktir ve asla başlangıçta gösterilen küme değildir; o küme, tanımı gereği artık var olmayan bir slot içerir" },
    "a.decline": { headline: "Zamanın taahhüt edilemediğini, hiçbir şeyin tutulmadığını ve bu tür kapasitenin bir sonraki ne zaman beklendiğini açıkça söyle. Bir sonraki ufuk belirtmeyen bir ret, talep sahibini takvime değil başka bir yere yönlendirir" },
    "x.lapsed": { headline: "talebin süresi çözülmeden doldu, hiçbir şey tutulmadı", detail: "yeni bir talep süreci yeniden başlatır" },
    "x.confirmed": { headline: "taahhüt edildi ve talep sahibine bildirildi", detail: "bu taahhütte yapılacak bir değişiklik veya iptal kendi başına ayrı bir örnektir; yeni bir talep de yenisidir" },
    "w.choice": { headline: "Talep sahibi sunulan slotlardan birini seçene, veya sunulan tüm slotları reddedene kadar bekle", detail: "zaman aşımı: Seçim için belirtilen son tarihte. (yapılandırma: reservation_outcome.choice)" },
    "x.declined": { headline: "hiçbir taahhüt oluşturulmadı, talep sahibine bilgi verildi", detail: "farklı bir zaman için yeni bir talep, yeni bir örnek olarak girer" },
    "c.choice": { headline: "Sunulanlardan birini aldılar mı?", edges: [{ label: "Bir slot aldı", detail: "talep sahibi sunulan slotlardan birini istedi" }, { label: "Hepsini reddetti", detail: "talep sahibi sunulan tüm alternatifleri reddetti" }] },
    "h.rebook": { headline: "Rezervasyon talebi → doğrulama → onaylama, reddetme veya bekletme", detail: "kendisine sunulan alternatif slotlardan birini seçen bir talep sahibi" },
  },
  },
  "SCH-282": {
  shortName: "Müsaitlik Arama Terki",
  name: "Müsaitlik arandı, rezervasyon yapılmadı → en yakın pencere veya bekleme listesi",
  purpose: "Rezervasyona dönüşmeyen bir müsaitlik sorgusunu, şu anda gerçekten rezerve edilebilecek bir şeyle, veya hiçbir şey uymadığında bir bekleme listesi yeriyle takip etmek - çünkü gösterilen şey hiçbir zaman tutulmadı ve muhtemelen zaten kalmadı.",
  nodes: {
    "t.queried": { headline: "Müsaitlik sorgusu rezervasyon olmadan kapandı" },
    "c.permitted": { headline: "Bu sorgu, iletişime geçebileceğimiz bir kişiye atfedilebilir mi?", edges: [{ label: "Tanımlı ve izinli", detail: "kişi biliniyor ve en az bir iletişim noktası bu tür bir teklif için geçerli ve izinli" }, { label: "Anonim veya izinli değil", detail: "sorgu, bu amaçla iletişime geçebileceğimiz bir kişiye atfedilemiyor" }] },
    "w.settle": { headline: "Rezervasyon onaylanana, veya talep edilen pencere alınana ya da geri çekilene kadar bekle", detail: "zaman aşımı: Teklif, sorgudan sonra istenmemiş bir rezervasyonun şansı olacak kadar bekler, ama soru güncelliğini koruduğu süreden fazla değil. (yapılandırma: availability_searched.settle)" },
    "x.no-route": { headline: "hiçbir teklif yapılmadı; sorgu ulaşılabilir bir kişiye atfedilemiyor", detail: "tanımlı bir kişiden gelen sonraki bir sorgu normal şekilde nitelenir" },
    "c.settled": { headline: "Beklemeyi ne sonlandırdı?", edges: [{ label: "İstenmeden rezerve edildi", detail: "kişi, pencere için kendi başına bir rezervasyon yaptı veya tutma aldı" }, { label: "Pencere kalmadı", detail: "sordukları pencere, harekete geçmelerinden önce alındı veya kaldırıldı" }] },
    "a.recheck": { headline: "Sorgunun döndürdüğü sonucu yeniden kullanmak yerine şu anda gerçekten rezerve edilebilecek şeyi yeniden değerlendir. Sorgu anında gösterilen hiçbir şey hiçbir zaman tutulmadı, ve o zamandan beri kalmamış bir pencerenin teklif edilmesi, hiçbir şey göndermemekten daha maliyetlidir" },
    "x.booked": { headline: "rezerve edildi; teklife gerek kalmadı", detail: "arkasında rezervasyon olmayan sonraki bir sorgu yeni bir örnek başlatır" },
    "c.options": { headline: "Şu anda gerçekten müsait olan ne var?", edges: [{ label: "Yakın bir pencere rezerve edilebilir", detail: "aynı ihtiyacı karşılayacak kadar talep edilene yakın bir kapasite var" }, { label: "Hiçbir şey uymuyor, bekleme listesi var", detail: "hiçbir pencere talebi karşılamıyor ve kaynak bir bekleme listesini destekliyor" }, { label: "Hiçbir şey uymuyor, bekleme listesi yok", detail: "hiçbir pencere talebi karşılamıyor ve kişiyi koyacak hiçbir şey yok" }] },
    "a.offer": { headline: "En yakın rezerve edilebilir pencereyi, talep edilenmiş gibi süslenmeden farklı bir pencere olarak etiketleyerek sun, ve tutulmadığını söyle. Bir gün isteyip başka bir gün gösterilen biri, bunu rezervasyon anında değil ilk bakışta görmelidir" },
    "a.waitlist": { headline: "Bir bekleme listesi yeri sun ve bunun hiçbir şey rezerve etmediğini belirt. Sahip olmadığı bir yere sahip olduğuna inanan biri buna göre plan yapar, ve bu, hiçbir şeyin olmadığının söylenmesinden daha kötü bir sonuçtur" },
    "x.nothing": { headline: "sunulacak bir şey yok; hiçbir mesaj gönderilmedi", detail: "kapasitesi olan bir pencere için sonradan gelen bir sorgu yeniden nitelenir" },
    "w.respond": { headline: "Rezervasyon onaylanana kadar bekle", detail: "zaman aşımı: Sunulan pencerenin geçerlilik süresinin sonunda. (yapılandırma: availability_searched.respond)" },
    "w.waitlist": { headline: "Kişi sunulan bekleme listesi yerini alana kadar bekle", detail: "zaman aşımı: Bekleme listesi teklifinin geçerlilik süresinin sonunda. (yapılandırma: availability_searched.waitlist)" },
    "x.offer-lapsed": { headline: "teklif yapıldı ve alınmadı", detail: "yeni bir müsaitlik sorgusu yeni bir örnektir; bu teklif bir daha asla yeniden sunulmaz" },
    "x.waitlisted": { headline: "bekleme listesine alındı; hiçbir şey rezerve edilmedi", detail: "kapasitenin bekleme listesine ulaşması, bu sürecin değil o mekanizmanın işidir" },
    "x.waitlist-lapsed": { headline: "bekleme listesi yeri sunuldu ve alınmadı", detail: "yeni bir müsaitlik sorgusu yeni bir örnektir; bu bekleme listesi yeri bir daha asla yeniden sunulmaz" },
  },
  },
  "SUB-161": {
  shortName: "İlişki Etkinleştirme",
  name: "Süregelen ilişki oluşturuldu → doğrulama → etkinleştirme veya beklemede",
  purpose: "Süregelen bir sözleşmenin var olmasını, fiilen yürürlüğe girdiği andan ayrı tutmak.",
  nodes: {
    "t.authorized": { headline: "Süregelen ilişki oluşturma yetkilendirildi" },
    "a.create": { headline: "İlişki kaydını oluştur. İlişki kimliğini, tarafları, ürün veya hizmet kapsamını, başlangıç ve yürürlük tarihini, süreyi, yenileme modelini, finansal koşullara yapılan referansı, hak tanımasının dayandığı temeli ve durumunu kaydet. CREATED olarak kaydet - sözleşme var ama henüz hiçbir şey işlemiyor" },
    "c.effective": { headline: "Hemen mi yürürlüğe giriyor?", edges: [{ label: "Şimdi yürürlükte", detail: "yürürlük tarihi şimdi veya geçmişte" }, { label: "Daha sonra yürürlükte", detail: "yürürlük tarihi gelecekte" }] },
    "a.requirements": { headline: "Bu ilişkiyi fiilen yöneten etkinleştirme koşullarını belirle - ödeme, doğrulama, sözleşme imzası, bir provizyon ön koşulu, düzenleyici bir şart. Bunlardan hangilerinin geçerli olduğu evrensel bir listeye değil, bu sözleşmenin kendi özelliklerine bağlıdır; yalnızca ödemenin geçerli olduğunu varsaymak, hiç imzalanmamış sözleşmeleri etkinleştirir" },
    "a.pending-date": { headline: "PENDING_EFFECTIVE_DATE olarak kaydet. Henüz başlamamış bir ilişki için hiçbir hak tanınmaz ve hiçbir fatura kesilmez" },
    "c.satisfied": { headline: "Gerekli koşullar sağlandı mı?", edges: [{ label: "Tümü sağlandı", detail: "etkinleştirmeyi yöneten her koşul yetkili biçimde karşılanmış durumda" }, { label: "Eksik var", detail: "yönetici koşullardan en az biri karşılanmamış" }] },
    "h.scheduled": { headline: "Gelecekte yürürlüğe giren başlangıç → bekleme → yeniden doğrulama → etkinleştirme veya iptal", detail: "gelecekte bir yürürlük başlangıcıyla oluşturulan ilişki" },
    "a.activate": { headline: "ACTIVE olarak, yürürlük tarihiyle ve her koşulu neyin sağladığıyla birlikte kaydet. Active, sözleşmenin işlemekte olduğunu ifade eder - sözleşmenin ne tanıdığını ifade etmez. Her hak, ilişkinin beyan edilmiş hak tanıma temelinden gelir; böylece bir ilişkinin aktif olması hiçbir zaman her şeye hak tanındığı anlamına gelmez" },
    "a.pending-req": { headline: "PENDING_REQUIREMENT olarak, hangi koşulun eksik olduğunu belirterek kaydet. Nedeni belirtilmeden beklemede kalan bir ilişki, yalnızca bozulmuş bir ilişkiden ayırt edilemez" },
    "h.entitlement": { headline: "Hak uygunluk değerlendirmesi → tanıma, ret veya beklemede", detail: "hakları artık değerlendirilmesi gereken aktif, süregelen bir ilişki" },
    "w.requirement": { headline: "eksik etkinleştirme koşulları sağlanana ya da sözleşme başlamadan geri çekilene kadar", detail: "zaman aşımı süresi: Pencere politikasının, oluşturulmuş ama henüz başlamamış bir ilişkinin açık kalmasına izin verdiği süre. (yapılandır: continuing_relationship.requirement)" },
    "c.recheck": { headline: "Bekleme neyle sonuçlandı?", edges: [{ label: "Koşullar sağlandı", detail: "eksik koşullar artık yetkili biçimde sağlanmış durumda" }, { label: "Geri çekildi", detail: "sözleşme başlamadan geri çekildi" }] },
    "a.abandon": { headline: "İlişkiyi hiç etkinleştirilmemiş olarak kaydet, kaydı ve nedenini koruyarak. İlişki var oldu ama başlamadı - bu, hiç oluşturulmamış olmaktan farklı bir durumdur ve sayılabilir olması gerekir" },
    "x.never-active": { headline: "oluşturuldu ama hiç etkinleştirilmedi; hiçbir hak tanınmadı", detail: "aynı taraflar arasında yapılan yeni bir sözleşme, bu ilişkinin devamı değil yeni bir ilişkidir ve kendi koşullarından başlar" },
  },
  },
  "SUB-162": {
  shortName: "Gelecek Etkinleştirme Yeniden Doğrulaması",
  name: "Gelecekte yürürlüğe giren başlangıç → bekleme → yeniden doğrulama → etkinleştirme veya iptal",
  purpose: "Gelecek tarihli bir ilişkiyi, planlandığı andaki değil, yürürlük anındaki gerçeklere göre etkinleştirmek.",
  nodes: {
    "t.future": { headline: "Gelecekte başlayacak şekilde oluşturulan ilişki" },
    "a.schedule": { headline: "SCHEDULED olarak, yürürlük zamanıyla ve bugün itibarıyla geçerli olan ön koşullarla kaydet. Saklanan şey, sonradan karşılaştırma yapmak için alınmış bir anlık görüntüdür - gelecekteki bir sözleşme şu an aktif bir ilişki değildir ve tanıyacağı hiçbir şey henüz mevcut değildir" },
    "w.effective": { headline: "ilişkiye karşı yetkili bir iptal kaydedilene, bir yürürlük bitiş tarihine ulaşılana ya da yürürlük tarihinden önce önemli bir ön koşul değişene kadar", detail: "zaman aşımı süresi: Planlanan etkinleştirme kendi yürürlük zamanına kadar bekler ve orada yeniden doğrulanır; planlandığı andaki gerçeklere göre hiçbir şey etkinleştirilmez. (yapılandır: future_effective.effective)" },
    "c.preempt": { headline: "Yürürlük zamanından önce ne oldu?", edges: [{ label: "Başlamadan iptal edildi", detail: "sözleşme henüz planlı haldeyken iptal edildi" }, { label: "Bir ön koşul değişti", detail: "etkinleştirmenin bağlı olduğu bir şey, iyi ya da kötü yönde değişti" }] },
    "a.revalidate": { headline: "İlişkinin güncel durumunu yürürlük zamanında yeniden oku - sözleşme hâlâ geçerli mi, finansal durum etkinleştirmenin gerektirdiği gibi mi, uygunluk hâlâ geçerli mi, doğrulama hâlâ güncel mi, koşullar hâlâ yerinde mi. Karar, şu anda yetkili olan bilgiye göre verilir; saklanan anlık görüntü yalnızca neyin değiştiğini görmek için kullanılır" },
    "a.cancel-scheduled": { headline: "CANCELLED_BEFORE_START olarak kaydet ve planlı etkinleştirmeyi bastır. Başlamadan önceki bir iptalin işlemi yerinde bırakması, artık kimsenin sahip olmadığı bir şeyi etkinleştirir, onun için fatura keser ve bu durum faturayı alan kişi tarafından fark edilir" },
    "a.note": { headline: "Değişikliği planlı etkinleştirmeye karşı kaydet ve şimdi işlem yapmak yerine beklemeye devam et. Mart ayında geçerliliğini yitiren bir ön koşul, Haziran'daki başlangıç tarihine kadar yeniden düzelmiş olabilir; etkinleştirmeyi üç ay erkenden başarısız saymak, henüz kimsenin sormadığı bir soruyu yanıtlamak olur. Beklemenin zaman aşımı sabit bir takvim noktasıdır, bu yüzden buraya geri dönülmesi onu uzatamaz" },
    "c.still-valid": { headline: "Koşullar hâlâ geçerli mi?", edges: [{ label: "Hâlâ sağlanıyor", detail: "etkinleştirmenin bağlı olduğu her şey yetkili biçimde yerinde" }, { label: "Telafi edilebilir, politika beklemeye izin veriyor", detail: "hâlâ sağlanabilecek bir şey eksik ve yönetici koşullar gecikmeli başlangıca izin veriyor" }, { label: "Artık sağlanmıyor", detail: "yönetici bir koşul başarısız oldu ve politika beklemeye izin vermiyor" }] },
    "x.cancelled-before-start": { headline: "başlamadan iptal edildi; hiç aktif olmadı ve hiç fatura kesilmedi", detail: "yeni bir sözleşme yeni bir ilişkidir. Bu ilişki, hiç çıkmadığı bir durumda kapanmıştır" },
    "a.activate": { headline: "Yürürlük tarihinden itibaren ACTIVE olarak, planlama anındaki değil etkinleştirme anındaki gerçeklerle kaydet" },
    "a.hold": { headline: "HOLD olarak, tam olarak neyin eksik olduğu ve bunu neyin gidereceğiyle kaydet. İlişki, başlamadan başlangıç tarihine ulaşmıştır; bu, sessizce gerçekleşmemiş bir etkinleştirme olarak bırakılmak yerine adlandırılmaya değer bir durumdur" },
    "a.failed": { headline: "Yönetici politikanın bu başarısızlık için tanımladığına göre FAILED_ACTIVATION veya CANCELLED olarak kaydet. Bu iki durum karşı taraf için farklı anlamlara gelir ve aralarındaki seçimi politika yapar - ayrım burada icat edilmez" },
    "h.entitlement": { headline: "Hak uygunluk değerlendirmesi → tanıma, ret veya beklemede", detail: "yürürlük zamanında etkinleşen, gelecek tarihli bir ilişki" },
    "w.hold": { headline: "eksik etkinleştirme koşulları sağlanana kadar", detail: "zaman aşımı süresi: Yönetici koşulların izin verdiği bekletme penceresi. (yapılandır: future_effective.hold)" },
    "x.failed": { headline: "yürürlük tarihine ulaştı ama etkinleşmedi", detail: "ön koşulların daha sonra sağlanması bu ilişkiyi geriye dönük olarak etkinleştirmez. Taraflar hâlâ istiyorsa yeni bir sözleşme oluşturulur" },
  },
  },
  "SUB-163": {
  shortName: "Yenileme Hatırlatması",
  name: "Yenileme penceresi → uygunluk → yenileme, yenilememe veya inceleme",
  purpose: "Bir sonraki dönem hakkında, o dönemi gerçek kılan hiçbir şeyden ayrı, kendi başına bir karara varmak.",
  nodes: {
    "t.window": { headline: "Yenileme karar penceresi açılır" },
    "a.evaluate": { headline: "Yenileme uygunluğunu, yenileme modelini, ilişkinin güncel durumunu, koşulların gerektirdiği bildirimi, uygulanacak fiyatlandırma ve koşulları, varsa eksik engelleri ve karşı tarafın karar vermesi gerekip gerekmediğini değerlendir" },
    "c.notice": { headline: "Yenileme koşulları ve gerekli bildirim süresi tanımlı mı?", edges: [{ label: "Tanımlı", detail: "yönetici koşullar bildirim süresini, yenileme modelini ve uygulanacak koşulları belirtiyor" }, { label: "Tanımlı değil", detail: "bildirim süresi veya yenilenecek koşullar hiçbir yetkili kaynakta belirtilmemiş" }] },
    "c.notice-required": { headline: "Yönetici koşullar, bildirimin fiilen yapılmasını gerektiriyor mu?", edges: [{ label: "Bildirim gerekli", detail: "koşullar, dönemin yenilenmesinden önce karşı tarafa bunu bildirmemizi zorunlu kılıyor" }, { label: "Bildirim yükümlülüğü yok", detail: "koşullar modeli ve süreyi tanımlıyor ama bildirim gerektirmiyor" }] },
    "h.undefined": { headline: "Karar talebi → doğrulama → yönlendirme, ret veya bekletme", detail: "bildirim süresi veya yenileme koşulları tanımlanmamış bir yenileme penceresi" },
    "a.notice": { headline: "Koşulların gerektirdiği bildirimi ver: uygulanacak yenileme modelini, hangi koşullarla yenileneceğini ve hiçbir şey yapılmazsa ne olacağını bildir. Bir bildirim süresi tanımlamış olmak, bildirimi fiilen yapmış olmakla aynı şey değildir; sessizce yürürlüğe giren bir otomatik yenileme, tam da bu yükümlülüğün var olma nedenidir. Bu bir bildirimdir, talep değildir - hiçbir zaman karar yerine geçmez" },
    "c.blockers": { headline: "Eksik bir engel, yenilemenin karara bağlanmasını önlüyor mu?", edges: [{ label: "Engellendi", detail: "çözülmemiş bir yükümlülük, anlaşmazlık veya uygunluk sorunu engel oluşturuyor" }, { label: "Engel yok", detail: "kararı engelleyecek hiçbir eksik yok" }] },
    "a.review": { headline: "Yenilemenin incelemede olduğunu, çözülmesi gerekenle birlikte kaydet. İlişki bu süreç boyunca mevcut dönemi üzerinde aktif kalır - incelemedeki bir yenileme, sorunlu bir ilişki anlamına gelmez" },
    "c.model": { headline: "Yenileme modeli ne gerektiriyor?", edges: [{ label: "Otomatik yenileme, koşullar sağlandı", detail: "koşullar otomatik olarak yenileniyor ve bunun için gereken her şart sağlanmış" }, { label: "Açık bir karar", detail: "koşullar, karşı tarafın seçim yapmasını gerektiriyor" }, { label: "Önce inceleme", detail: "koşullar, yenileme önerilmeden önce dahili bir karar alınmasını gerektiriyor" }] },
    "w.review": { headline: "yetkili bir yenileme kararı kaydedilene kadar", detail: "zaman aşımı süresi: Bildirim son tarihini aşan bir inceleme sorumluya yükseltilir; bu sırada ilişki mevcut dönemi üzerinde kalır. (önerilen: koşulların gerektirdiği bildirim süresi, dönem sona ermeden önce; yapılandır: renewal.notice_deadline)" },
    "a.decided": { headline: "Yenilemeyi, yeni dönemin tarihleri ve uygulanacak koşullarla birlikte karara bağlanmış olarak kaydet. Karara bağlanmış, yenilenmiş demek değildir - yeni dönem kendi koşulları sağlanana kadar var olmaz ve bir ilişki burada beklerken yine de sona erebilir" },
    "a.request": { headline: "Yenileme kararını kararı verecek kişiye ilet - bu döngüde bildirim henüz gönderilmediyse uygulanacak koşullarla birlikte, gönderildiyse koşulları tekrarlamadan yalnızca gereken kararı yineleyerek. Sormak karar vermek değildir - gönderilen bir yenileme bildirimi bir iletişimdir ve göndermeyi yanıt sayan bir uygulama, kimsenin onay vermediği ilişkileri yeniler" },
    "c.decision": { headline: "Bir sonraki dönem için sonuç nedir?", edges: [{ label: "İptal süreci işliyor", detail: "döngünün yeniden okunması, ilişki üzerinde şu anda işleyen bir iptal olduğunu gösteriyor - bu sürecin kendi beyan edilmiş önceliği aktif bir iptalin altındadır ve bir iptal işlerken yenileme kararını bağımsız şekilde sonuçlandırmak buna aykırı olur" }, { label: "Yenile", detail: "karar, ya da koşulların varsayılanı, devam etmek yönünde ve işleyen bir iptal yok" }, { label: "Yenileme", detail: "karar, ya da koşulların varsayılanı, dönemin sona ermesine izin vermek yönünde ve işleyen bir iptal yok" }] },
    "h.escalate": { headline: "Sorumluluk yükseltmesi → üst makam → çözüm veya iade", detail: "bildirim süresini aşan bir yenileme incelemesi" },
    "h.execute": { headline: "Yenileme uygulaması → finansal ve bağımlılık kontrolü → yeni dönem aktif", detail: "karara bağlanmış ve uygulanmaya hazır bir yenileme" },
    "w.decision": { headline: "yetkili bir yenileme kararı kaydedilene kadar", detail: "zaman aşımı süresi: Karar, gerekli bildirim süresinin hâlâ buna izin verdiği son ana kadar beklenir; ardından yönetici koşullar karar verir. (önerilen: koşulların gerektirdiği bildirim süresi, dönem sona ermeden önce; yapılandır: renewal.decision_deadline)" },
    "x.superseded": { headline: "yenileme kararı bastırıldı; ilişki üzerinde işleyen bir iptal öncelik kazandı", detail: "sonraki adımı iptalin kendi sonucu belirler - iptal geri çekilirse, yenileme döngüsü o zamandan beri kaldırılmış bir iptal altında verilmiş kararı devam ettirmek yerine baştan yeniden açılır" },
    "a.non-renew": { headline: "NON_RENEWING olarak, yürürlük bitişi mevcut dönemin bitişi olacak şekilde kaydet. İlişki hâlâ aktiftir ve hâlâ mevcut dönemine tabidir - yenilememe, bir sonraki dönem hakkında bir karardır ve bu dönem hakkında hiçbir şey söylemez" },
    "a.default": { headline: "Hiçbir karar verilmediğinde yönetici koşulların sonuç olarak tanımladığı şeyi uygula - bu, bazı yenileme modelleri için yenileme, bazıları için yenilememe anlamına gelir. Bir karar kaydetmek yerine hiçbir kararın verilmediğini kaydet, çünkü yanıt vermeyen biri onay vermiş sayılmaz" },
    "h.scheduled-end": { headline: "Planlı iptal → yürürlük zamanında yeniden doğrulama → sonlandırma veya koruma", detail: "mevcut dönemin bitişinde bir sonlanma planlayan bir yenilememe" },
  },
  },
  "SUB-165": {
  shortName: "Yenileme Ödemesi Tahsilatı",
  name: "Yenileme ödemesi başarısız → ek süre veya tahsilat → yenileme veya düşme",
  purpose: "Başarısız bir yenileme ödemesi tahsil edilmeye çalışılırken ilişkinin ne yapacağına, otomatik olarak sonlandırmadan karar vermek.",
  nodes: {
    "t.failed": { headline: "Yenileme ödemesi başarısız oldu" },
    "a.recovery": { headline: "Başarısızlığı, sınıflandırma ve tahsilatın sahibi olan ödeme tahsilatı yaşam döngüsüne devret. Bu akış parayı takip etmez; tahsilat sürerken ilişkinin durumunu tutar" },
    "c.policy": { headline: "Yönetici politika, bu ilişki için ek süre veya düşme anlamını tanımlıyor mu?", edges: [{ label: "Tanımlı", detail: "politika, tahsilat sırasında ilişkinin hangi durumu alacağını, hangi erişimi ne kadar süreyle koruyacağını belirtiyor" }, { label: "Tanımlı değil", detail: "başarısız bir yenileme ödemesi ile düşme arasında ne olacağını kapsayan bir politika yok" }] },
    "a.state": { headline: "Politikanın tahsilat sırasında tanımladığı ilişki durumunu uygula - ACTIVE_IN_GRACE, RENEWAL_PENDING, RESTRICTED veya LAPSE_PENDING. Karşı tarafın hangi erişimi koruyacağı bu durumdan ve politikadan belirlenir; her şeyi çalışır bırakmak veya her şeyi kapatmak gibi bir varsayımdan asla belirlenmez" },
    "h.undefined": { headline: "Karar talebi → doğrulama → yönlendirme, ret veya bekletme", detail: "ek süre veya düşme anlamı tanımlanmamış, başarısız bir yenileme ödemesi" },
    "c.restrict": { headline: "Tahsilat durumu, kullanım kabiliyetini kısıtlıyor mu?", edges: [{ label: "Kısıtlıyor", detail: "politika, tahsilat sırasında ilişkinin ne için kullanılabileceğini sınırlıyor" }, { label: "Tam erişim devam ediyor", detail: "politika, ek süre boyunca ilişkiyi tam olarak kullanılabilir tutuyor" }] },
    "a.restrict": { headline: "Kısıtlamayı, politikanın tanımladığı kapsamla birlikte erişim yaşam döngüsüne devret. Neyin nasıl kapatılacağının sahipliği orada, ilişkinin sözleşmesel durumunun sahipliği burada kalır" },
    "w.recovery": { headline: "yükümlülük sistem kaydında karşılanana ya da yükümlülüğe yönelik yetkili bir alternatif çözüm üzerinde anlaşılana kadar", detail: "zaman aşımı süresi: Ek süre durumu, bu abonelik sınıfı için ek süre politikasının tanımladığı kadar sürer; bitişi bir sonuçtur, burada icat edilmiş bir uzatma değildir. (önerilen: politikanın bu abonelik sınıfı için tanımladığı ek süre son tarihi; yapılandır: renewal_payment.grace_deadline)" },
    "c.outcome": { headline: "Yükümlülük nasıl çözüldü?", edges: [{ label: "Ödeme tahsil edildi", detail: "asıl yükümlülük yetkili biçimde karşılandı" }, { label: "Alternatif bir çözüm onaylandı", detail: "farklı bir yöntem, kısmi bir düzenleme veya bir feragat bunu çözdü" }] },
    "a.lapse": { headline: "Bu ilişkinin kendi anlamının tanımladığı sonucu kaydet - LAPSED, EXPIRED veya NON_RENEWED. Bunlar gerçekten farklı şeyler için farklı kelimelerdir; hangisinin geçerli olduğu, karşı tarafa ne söyleneceğini ve sonrasında ne yapabileceğini değiştirir" },
    "c.remaining": { headline: "Kalan yenileme koşulları hâlâ geçerli mi?", edges: [{ label: "Hâlâ geçerli", detail: "uygunluk, doğrulama ve yeni döneme ilişkin diğer koşullar hâlâ geçerli" }, { label: "Artık geçerli değil", detail: "yeni dönemin ihtiyaç duyduğu başka bir şey, ödeme tahsil edilirken geçerliliğini yitirdi" }] },
    "a.alternate": { headline: "Yükümlülüğün asıl ödeme dışında nasıl çözüldüğünü kaydet. Yenileme bu temelde ilerler ve kayıt hangi temelin kullanıldığını belirtir; çünkü bir feragatle yenilenen dönem ile bir ödemeyle yenilenen dönem aynı gerçek değildir" },
    "h.end": { headline: "İlişki sonu → nihai mutabakat → eski veya süresi dolmuş durum", detail: "tahsilat penceresi kapandıktan sonra düşen bir yenileme" },
    "h.complete": { headline: "Yenileme uygulaması → finansal ve bağımlılık kontrolü → yeni dönem aktif", detail: "diğer koşulları sağlam kalan, tahsil edilmiş bir yenileme yükümlülüğü" },
  },
  },
  "SUB-166": {
  shortName: "Plan Değişikliği Doğrulaması",
  name: "Plan veya koşul değişikliği talebi → doğrulama → planlama, uygulama veya ret",
  purpose: "Yetkilendirilmiş bir değişikliği, yürürlükteki bir ilişkiye doğru zamanda, o anda fiilen mevcut olana göre bir fark olarak uygulamak.",
  nodes: {
    "t.requested": { headline: "İlişki değişikliği talep edildi" },
    "a.capture": { headline: "Mevcut koşulları, talep edilen koşulları, talep edilen yürürlük zamanını, kapsam farkını ve finansal etkisine yapılan referansı kaydet. Saklanan şey, farkın kendisi ve yetkilendirildiği ilişki sürümüdür" },
    "c.allowed": { headline: "Yönetici koşullar bu değişikliğe izin veriyor mu?", edges: [{ label: "İzin veriliyor", detail: "koşullar, ilişkinin bu noktasında bu tür bir değişikliğe izin veriyor" }, { label: "İzin verilmiyor", detail: "koşullar bunu dışlıyor - bir asgari süre, kilitli bir plan kademesi, sözleşmesel bir kısıtlama" }, { label: "Koşullar belirtmiyor", detail: "bu değişikliğe izin verilip verilmediğini belirten hiçbir yetkili kaynak yok" }] },
    "c.timing": { headline: "Değişiklik ne zaman yürürlüğe girer?", edges: [{ label: "Hemen", detail: "koşullar buna şimdi izin veriyor ve talep de şimdi istiyor" }, { label: "Gelecekte bir yürürlük zamanında veya bir sonraki döngüde", detail: "koşullar bunu erteliyor ya da talep daha sonraki bir tarihi istiyor" }] },
    "a.reject": { headline: "Değişikliği, bunu dışlayan koşulu belirterek reddedilmiş olarak kaydet. İlişki mevcut koşulları üzerinde değişmeden devam eder" },
    "h.undefined": { headline: "Karar talebi → doğrulama → yönlendirme, ret veya bekletme", detail: "yönetici koşulların ele almadığı bir değişiklik talebi" },
    "a.validate-deps": { headline: "Değişikliğin gerektirdiklerini doğrula - müsaitlik, uygunluk, finansal kapasite, provizyon kapasitesi. İlişkinin uygun olmadığı bir plan kademesi ile temin edilemeyen bir kaynak, değişikliği aynı noktada durdurur" },
    "a.schedule": { headline: "SCHEDULED_CHANGE olarak, farkı, yürürlük zamanını ve yetkilendirildiği ilişki sürümünü kaydet. Saklanan şey sonuçtaki koşullar değil farktır, çünkü o koşulların ne olacağı, değişikliğin uygulandığı andaki ilişkinin durumuna bağlıdır" },
    "x.rejected": { headline: "değişiklik reddedildi; mevcut koşullar geçerliliğini korur", detail: "aynı değişiklik, ilişkinin farklı bir noktasında - bir dönem sınırında ya da asgari bir süreden sonra - izinli hâle gelebilir ve o zaman yeniden talep edilir" },
    "c.deps": { headline: "Değişikliğin bağımlılıkları sağlandı mı?", edges: [{ label: "Sağlandı", detail: "yeni koşulların gerektirdiği her şey yerinde" }, { label: "Sağlanmadı", detail: "değişikliğin ihtiyaç duyduğu bir bağımlılık eksik" }] },
    "w.effective": { headline: "iki taraf arasındaki aktif yapısal ilişkiye, bir yürürlük zamanıyla birlikte yetkili bir son verilene ya da değişiklik talebi geri çekilene kadar", detail: "zaman aşımı süresi: Planlı bir değişiklik kendi yürürlük zamanına kadar bekler ve orada, o andaki ilişki durumuna göre yeniden doğrulanır. (yapılandır: terms_change.effective)" },
    "a.apply": { headline: "Farkı, yürürlük zamanından itibaren geçerli yeni bir koşul sürümü olarak uygula. Önceki koşullar, yönettikleri dönemle birlikte kayıtta kalır - onları yeniden yazmak, geçen ayın faturasının sistemin sahip olduğu hiçbir koşulla eşleşmemesi anlamına gelir" },
    "a.not-applied": { headline: "Değişikliği, onu engelleyen bağımlılığı belirterek uygulanmamış olarak kaydet ve mevcut koşulları yürürlükte bırak. Yarım uygulanmış bir değişiklik - yeni fiyat, eski kapsam - hiç değişiklik olmamasından daha kötüdür" },
    "a.void": { headline: "Planlı değişikliği, nedeniyle birlikte geçersiz olarak kaydet. O zamandan beri sona ermiş bir ilişki için planlanmış bir düşürme, uygulanacak hiçbir şey bulamaz; yine de tetiklenmesi, artık işlemeyen bir şeyin üzerine koşul yazmak olur" },
    "a.revalidate": { headline: "İlişkiyi yürürlük zamanında yeniden oku ve farkın hâlâ ona göre anlamlı olup olmadığını kontrol et. Mart ayında onaylanan ama o zamandan beri iki kez yükseltilmiş bir ilişkiye uygulanan bir düşürme, kimsenin seçmediği koşullar ve kimsenin beklemediği bir fatura üretir" },
    "c.scope": { headline: "Uygulanan fark neyi etkiliyor?", edges: [{ label: "Hak kapsamını", detail: "değişiklik, ilişkinin tanıdığı hakları ekliyor, kaldırıyor veya değiştiriyor" }, { label: "Yalnızca finansal koşulları", detail: "değişiklik, kapsamı değiştirmeden fiyatı, faturalandırmayı veya taahhüdü değiştiriyor" }, { label: "Hiçbirini", detail: "değişiklik, kapsam veya finansal etkisi olmayan idari ya da sözleşmesel bir ayrıntıyı değiştiriyor" }] },
    "x.not-applied": { headline: "değişiklik uygulanmadı; mevcut koşullar değişmeden yürürlükte kalır", detail: "engelleyen bağımlılık sağlandığında değişiklik yeniden talep edilebilir" },
    "x.void": { headline: "planlı değişiklik yürürlüğe girmeden geçersiz sayıldı", detail: "değişiklik, o anda mevcut olan ilişkiye karşı yeniden talep edilebilir ve o koşullara göre değerlendirilir" },
    "c.still-valid": { headline: "Fark, ilişkinin şu anki durumuna hâlâ uygulanabilir mi?", edges: [{ label: "Hâlâ uygulanabilir", detail: "ilişki, değişikliğin yetkilendirildiği sürümde ya da fark mevcut sürüme karşı belirsizlik taşımıyor" }, { label: "Yerine yeni durum geçti", detail: "ilişki, farkı belirsiz veya çelişkili kılacak şekilde değişti" }] },
    "h.entitlement": { headline: "Hak değişikliği → kapsamı yeniden hesaplama → genişletme, daraltma veya koruma", detail: "hak kapsamını değiştiren, uygulanmış bir değişiklik" },
    "h.financial": { headline: "Finansal yükümlülük oluşturuldu → vadesi geldi → karşılandı veya eksik", detail: "finansal bir sonucu olan, uygulanmış bir değişiklik" },
    "x.applied": { headline: "değişiklik yeni bir koşul sürümü olarak uygulandı; önceki koşullar korundu", detail: "sonraki değişiklikler, orijinal sözleşmeye değil bu sürüme karşı değerlendirilen yeni taleplerdir" },
    "h.review": { headline: "Karar talebi → doğrulama → yönlendirme, ret veya bekletme", detail: "temel aldığı koşullar artık mevcut olmayan, planlı bir değişiklik" },
  },
  },
  "SUB-167": {
  shortName: "İptal Yürürlük Tarihi Belirleme",
  name: "İptal talebi → yürürlük bitişini belirleme → planlama veya şimdi iptal",
  purpose: "Bir ilişkinin sona erip ermeyeceğini ve ne zaman sona ereceğini, mevcut dönem sona erene kadar işlemeye devam ederken belirlemek.",
  nodes: {
    "t.requested": { headline: "İptal talep edildi" },
    "a.determine": { headline: "Yetkinin kimde olduğunu, mevcut dönemi ve durumu, ilişkinin iptal koşullarının fiilen ne söylediğini, bu koşulların ürettiği yürürlük bitişini ve zaten var olan ve ilişkiden daha uzun sürecek yükümlülükleri belirle" },
    "c.authority": { headline: "Talep eden kişi, bu ilişkiyi iptal etme yetkisine sahip mi?", edges: [{ label: "Yetkili", detail: "talep eden kişi taraflardan biri ya da sonlandırma hakkını devralmış durumda" }, { label: "Belirsiz", detail: "talep eden kişinin bu ilişki üzerindeki yetkisi belirsiz ya da yok" }] },
    "c.policy": { headline: "İlişkinin iptal koşulları tanımlı mı?", edges: [{ label: "Tanımlı", detail: "koşullar, iptalin ne zaman yürürlüğe gireceğini, hangi bildirimin geçerli olduğunu ve nelerin bundan sonra da geçerli kalacağını belirtiyor" }, { label: "Tanımlı değil", detail: "bu ilişkinin nasıl sona ereceğini belirten hiçbir yetkili kaynak yok" }] },
    "h.authority": { headline: "Karar talebi → doğrulama → yönlendirme, ret veya bekletme", detail: "yetkisi belirlenmemiş biri tarafından talep edilen bir iptal" },
    "c.blocker": { headline: "Geçerli bir koşul iptali engelliyor mu?", edges: [{ label: "Engellendi", detail: "bir asgari süre, eksik bir yükümlülük veya düzenleyici bir bildirim engel oluşturuyor" }, { label: "Engel yok", detail: "ilişkinin sona ermesini engelleyen geçerli hiçbir şey yok" }] },
    "h.undefined": { headline: "Karar talebi → doğrulama → yönlendirme, ret veya bekletme", detail: "iptal koşulları tanımlanmamış bir ilişkiye yönelik iptal talebi" },
    "a.blocked": { headline: "Engeli, neyin ve ne zaman gidereceğini belirterek açıkça kaydet. Nedeni belirtilmeden reddedilen bir iptal, genellikle karşı tarafın bekleyebileceği bir tarihle ilgili bir şikâyete, ardından bir anlaşmazlığa dönüşür" },
    "c.timing": { headline: "İlişki ne zaman sona erer?", edges: [{ label: "Hemen", detail: "koşullar hemen sonlanmaya izin veriyor ve talep edilen de bu" }, { label: "Mevcut dönemin sonunda", detail: "koşullar sonlanmayı dönem sınırına erteliyor" }] },
    "x.blocked": { headline: "iptal engellendi; ilişki değişmeden devam ediyor ve talep geçerliliğini koruyor", detail: "engel kalktığında talep ilerler. Bu süre boyunca ilişkiyle ilgili, hakları da dahil, hiçbir şey değişmedi" },
    "a.immediate": { headline: "Yürürlük bitişini, buna izin veren koşullar altında şimdi olarak, her iki tarafta kalan borçlarla birlikte kaydet" },
    "a.schedule": { headline: "NON_RENEWING veya CANCELLATION_SCHEDULED olarak, yürürlük bitişiyle birlikte kaydet ve ilişkiyi ACTIVE bırak. Mevcut dönem işlemeye devam eder ve tanıdığı her hak o tarihe kadar çalışmaya devam eder - talep anında erişimi kesmek, kişiye kullanamayacağı bir dönem için fatura keser ve temiz bir çıkışı bir iade talebine dönüştürür" },
    "h.end": { headline: "İlişki sonu → nihai mutabakat → eski veya süresi dolmuş durum", detail: "hemen yürürlüğe giren bir iptal" },
    "h.scheduled": { headline: "Planlı iptal → yürürlük zamanında yeniden doğrulama → sonlandırma veya koruma", detail: "gelecekteki bir yürürlük bitişi için planlanmış bir iptal" },
  },
  },
  "SUB-168": {
  shortName: "Planlı İptal Yeniden Doğrulaması",
  name: "Planlı iptal → yürürlük zamanında yeniden doğrulama → sonlandırma veya koruma",
  purpose: "Karşı tarafın o zamandan beri sürdürmeyi tercih ettiği bir ilişkiye karşı, planlı bir sonlanmanın uygulanmasını durdurmak.",
  nodes: {
    "t.effective": { headline: "Planlı iptalin yürürlük zamanına ulaşıldı" },
    "a.reread": { headline: "İlişkiyi, sürümü de dahil olmak üzere yetkili güncel durumundan yeniden oku. Karşılaştırılan şey, ilişkinin şu anki hali ile iptalin yetkilendirildiği sürümdür - planlı işin taşıdığı kopya değil" },
    "c.valid": { headline: "İptal, ilişkinin güncel sürümüne karşı hâlâ geçerli mi?", edges: [{ label: "Hâlâ geçerli", detail: "planlamadan bu yana hiçbir şey sonlandırma kararının yerini almadı" }, { label: "Yerine yeni durum geçti", detail: "bir yeniden etkinleştirme, yeniden abonelik, plan değişikliği veya sonraki bir yenileme kararı bunun önüne geçti" }] },
    "a.obligations": { headline: "Sonda hâlâ borçlu olunanları belirle - açık teslimatlar, faturalandırılmamış kullanım, ödenmemiş tutarlar, ilişki aktifken yapılan taahhütler. Bu, sonlanmadan sonra keşfedilmek yerine önceden belirlenir" },
    "a.suppress": { headline: "Planlı sonlandırmayı, yerini alan şeyi belirterek bastırılmış olarak kaydet. Bunu uygulamak, karşı tarafın o zamandan beri sürdürmeyi tercih ettiği bir ilişkiyi sonlandırır ve karşı taraf bunu, az önce ödediği bir şeye erişimini kaybederek fark eder" },
    "a.end": { headline: "İlişkinin anlamının tanımladığı nihai durumu kaydet - ENDED, CANCELLED veya EXPIRED. Tüm geçmiş kalır: her dönem, her yenileme, her askıya alma ve işlediği her fiyat. İlişkiyi silen bir sonlandırma, ileride biri bu ilişki hakkında bir soru sorduğunda verilecek her yanıtı ortadan kaldırır" },
    "x.suppressed": { headline: "geçerliliğini yitirmiş sonlandırma bastırıldı; ilişki güncel sürümü üzerinde devam ediyor", detail: "mevcut ilişkiye karşı yapılan yeni bir iptal, kendi yürürlük bitişiyle yeni bir karardır. Bastırılan iptal ise kararlaştırılmış ama sonradan geçerliliğini yitirmiş bir şey olarak kayıtta kalır" },
    "h.end": { headline: "İlişki sonu → nihai mutabakat → eski veya süresi dolmuş durum", detail: "hâlâ geçerli bir iptale karşı uygulanan, planlı bir sonlandırma" },
  },
  },
  "SUB-169": {
  shortName: "İlişki Askıya Alma",
  name: "Askıya alma veya bekletme → ilişkiyi kısıtlama → geri yükleme veya sonlandırma",
  purpose: "Bir ilişkiyi, normal şekilde işleyemeyen ama henüz sona ermemiş bir durumda tutmak.",
  nodes: {
    "t.condition": { headline: "İlişki askıya alma koşulu" },
    "a.record": { headline: "Nedeni, kapsamı, yürürlük zamanını, hangi davranışların izinli kaldığını ve geri yükleme koşulunu kaydet. Geri yükleme koşulu belirtilmemiş bir askıya alma çıkışsız kalır ve kimsenin karar vermediği, kimsenin gösteremediği bir sonlandırmaya dönüşür" },
    "c.dates": { headline: "Yönetici politika, askıya alma sırasında yenileme veya bitiş tarihlerini kaydırıyor mu?", edges: [{ label: "Politika kaydırıyor", detail: "koşullar, askıda kalındığı sürece ilişkinin tarihlerini açıkça uzatıyor ya da duraklatıyor" }, { label: "Politika olduğu gibi bırakıyor", detail: "koşullar duraklatma hakkında hiçbir şey söylemiyor ya da tarihleri açıkça sabit tutuyor" }] },
    "a.adjust": { headline: "Politikanın tanımladığı ayarlamayı uygula; dönemi sessizce düzenlemek yerine bunu, dayanağıyla birlikte bir ayarlama olarak kaydet. Tarihlerin kayması bir kuralın sonucudur ve kayıt hangi kuralın bu olduğunu belirtmelidir" },
    "a.keep": { headline: "Yenileme ve bitiş tarihlerini olduğu yerde bırak. Bunları sessizce ileriye çekmek, kimsenin uzatılmasına onay vermediği bir ilişkiyi uzatır ve aylar sonra, karşı tarafın haberi olmadığı bir tarihte beklemediği bir ücret olarak karşısına çıkar" },
    "a.restrict": { headline: "SUSPENDED olarak kaydet ve gerekli erişim kısıtlamasını, uygulamanın sahibi olan erişim yaşam döngüsüne devret. Bu akış ilişkinin sözleşmesel durumunu tutar; askıya alınmış olmak iptal edilmiş olmak değildir" },
    "w.suspension": { headline: "askıya almanın nedeni çözülene ya da nihai bir karar kaydedilene kadar", detail: "zaman aşımı süresi: Politikanın tanımladığı azami askıya alma süresi. (yapılandır: relationship_suspension.suspension)" },
    "c.outcome": { headline: "Askıya alma nasıl sonuçlandı?", edges: [{ label: "Neden çözüldü", detail: "belirtilen geri yükleme koşulu yetkili biçimde karşılandı" }, { label: "Nihai bir karar alındı", detail: "ilişki devam etmek yerine sona erecek" }] },
    "h.review": { headline: "Karar talebi → doğrulama → yönlendirme, ret veya bekletme", detail: "azami süresine karara bağlanmadan ulaşan bir askıya alma" },
    "a.revalidate": { headline: "İlişkinin güncel koşullarını yeniden oku ve kabiliyeti bunlardan yeniden oluştur. Askıya alma anında alınmış bir anlık görüntüden geri yüklemek, ilişkinin artık içermeyebileceği bir hakkı geri verebilir - plan değişmiş olabilir, dönem farklı bir kapsamla yenilenmiş olabilir ve aylarca süren bir askıya alma genellikle bunlardan en az birine denk gelir" },
    "h.end": { headline: "İlişki sonu → nihai mutabakat → eski veya süresi dolmuş durum", detail: "devam etmeyecek, askıya alınmış bir ilişki" },
    "c.still": { headline: "İlişki hâlâ var mı ve geri yüklemeyi hâlâ destekliyor mu?", edges: [{ label: "Evet", detail: "ilişki sağlam ve güncel koşulları devam etmeyi destekliyor" }, { label: "Hayır", detail: "ilişki askıdayken sona erdi, düştü veya süresi doldu" }] },
    "a.restore": { headline: "Yeniden ACTIVE olarak kaydet ve erişimi, eski haklara değil ilişkinin güncel koşullarına göre geri yüklemek üzere erişim yaşam döngüsüne devret" },
    "x.restored": { headline: "güncel koşullarla ACTIVE durumuna geri yüklendi", detail: "sonraki bir askıya alma, kendi nedeni ve kendi geri yükleme koşuluyla yeni bir askıya almadır. Öncekisi kayıtta kalır" },
  },
  },
  "SUB-170": {
  shortName: "Süregelen İlişki Sonu Mutabakatı",
  name: "İlişki sonu → nihai mutabakat → eski veya süresi dolmuş durum",
  purpose: "İlişkinin tanıdığı hakları durdururken, yarattığı her şeyin kendi yaşam döngüsününı sürdürmesine izin vermek.",
  nodes: {
    "t.end": { headline: "İlişki sonu yürürlüğe girdi" },
    "a.record": { headline: "Sonlanma nedenini, yürürlük bitişini, son dönemi ve sonlandıran yetkiyi kaydet. Beş nedenden hangisinin geçerli olduğu saklanır - iptal edildi, yenilenmedi, süresi doldu, feshedildi ve düştü, bunu sonradan okuyan herkes için ve karşı tarafın sonrasında ne yapabileceği açısından farklı anlamlara gelir" },
    "a.stop": { headline: "İlişkiye bağlı gelecekteki etkinlikleri durdur - planlı yenilemeler, tekrarlayan teslimatlar, yaklaşan ücretlendirmeler, sıraya alınmış ilişki kapsamlı iletişimler. Durdurulan şey gelecektir. Zaten teslim edilmiş ya da zaten borçlu olunan hiçbir şeye dokunulmaz" },
    "a.entitlement-loss": { headline: "Hak geri alımını burada uygulamak yerine hak tanıma yaşam döngüsüne devret. Hangi hakların sonlandırmadan sonra süreceği, hakkın kendi kuralıdır; burada ayrıca karar verilirse iki yaşam döngüsü çelişebilir" },
    "a.wind-down": { headline: "Her bağımlı alanın ihtiyaç duyduğu tasfiye sürecini ilet - hizmetten çıkarma, nihai faturalandırma, varsa borçlu olunan iade veya kredi, açık teslimatlar ve geçerliyse veri saklama. Her biri kendi yaşam döngüsününda işler ve kendi sonucuna ulaşır; hiçbiri burada uygulanmaz" },
    "c.obligations": { headline: "İlişki aktifken oluşan geçerli yükümlülükler hâlâ var mı?", edges: [{ label: "Var", detail: "dönem boyunca oluşan açık siparişler, ödenmemiş tutarlar, borçlu olunan iadeler, anlaşmazlıklar veya telafiler hâlâ geçerli" }, { label: "Yok", detail: "dönem boyunca oluşan her şey zaten çözüme kavuşmuş" }] },
    "a.preserve": { headline: "Bu yükümlülükleri koru ve kendi yaşam döngüsü'larında sonuçlanmalarına izin ver. Abonelik aktifken oluşan sipariş, iade veya anlaşmazlık sonlandırmayla ortadan kalkmaz; sonlandırma yalnızca gelecekteki hakları durdurur" },
    "c.complete": { headline: "İlişkiye özgü operasyonel yükümlülükler tamamlandı mı?", edges: [{ label: "Tamamlandı", detail: "bu ilişkinin kendisinin gerektirdiği tasfiye süreci sona erdi" }, { label: "Hâlâ sürüyor", detail: "hizmetten çıkarma, nihai faturalandırma veya ilişki kapsamındaki başka bir tasfiye süreci hâlâ devam ediyor" }] },
    "a.terminal": { headline: "İlişkinin kendi anlamının tanımladığı nihai durumu kaydet - FORMER, EXPIRED veya TERMINATED. Bu, ilişkinin sona ermesidir. Hesabın kapanması ya da verinin silinmesi değildir; bunların ikisi de kendi yetkisi ve kendi yaşam döngüsünü olan ayrı kararlardır ve hiçbiri bundan otomatik olarak doğmaz" },
    "w.winddown": { headline: "tasfiye süreci tamamlanana kadar", detail: "zaman aşımı süresi: Sonda hâlâ süren ilişkiye özgü yükümlülüklere, politikanın tanımladığı tasfiye penceresi verilir; bu sürenin ötesinde tasfiye süreci sorumluya yükseltilir. (yapılandır: continuing_relationship.winddown)" },
    "x.former": { headline: "FORMER, EXPIRED veya TERMINATED; hesap, geçmiş ve devam eden yükümlülükler korunur", detail: "yeni abonelik, sözleşme veya üyelik yeni bir ilişkidir. Geçmiş okunabilir kalır; açık yükümlülükler kendi yaşam döngüsünü sonuçlandırana kadar devam eder" },
    "h.escalate": { headline: "Sorumluluk yükseltmesi → üst makam → çözüm veya iade", detail: "penceresini aşan bir ilişki tasfiyesi" },
  },
  },
  "SUB-262": {
  shortName: "İptal Onayı",
  name: "İptal onaylandı → tasfiye penceresi → erişim sona erer veya müşteri geri döner",
  purpose: "Kişiyi, ayrılma kararı ile erişimin fiilen kaybedilmesi arasındaki dönem boyunca yönlendirmek; böylece bitiş tarihi hiçbir zaman sürpriz olmaz ve o tarihe kadar geri dönmek mümkün kalır.",
  nodes: {
    "t.cancelled": { headline: "İptal onaylandı" },
    "a.confirm": { headline: "İptali, erişimin sona ereceği kesin tarihi ve o tarihe kadar kullanılabilir kalacak şeyleri onayla. Ödemesi yapılmış erişim, kişi erken iptal etti diye kısaltılmaz; bunu belirtmek, 'erişimimi zaten kaybettim mi' şeklindeki anlık iletişim taleplerini önler" },
    "c.window": { headline: "Erişim sona ermeden önce anlamlı bir zaman aralığı var mı?", edges: [{ label: "Zaman aralığı var", detail: "yürürlük bitiş tarihi, öncesinde bir hatırlatmanın hâlâ işe yarayacağı kadar uzakta" }, { label: "Hemen sona eriyor", detail: "erişim hemen sona eriyor ya da başka bir mesajın zamanında ulaşamayacağı kadar yakın bir zamanda sona eriyor" }] },
    "w.lead": { headline: "kişi iptali yürürlüğe girmeden geri çekene ya da hatırlatma anına ulaşılana kadar", detail: "Zaman aşımı: hatırlatma, yürürlük bitiş tarihinden kısa bir süre önce gönderilir - hâlâ harekete geçilebilecek kadar erken, hâlâ bir anlam ifade edecek kadar yakın. (örnek: 3 gün; şunu ayarla: cancellation_wind.lead)" },
    "c.lead-withdrawn": { headline: "İptali geri çektiler mi?", edges: [{ label: "Geri çekildi", detail: "bitiş tarihinden önce yetkili bir yeniden etkinleştirme veya geri çekme kaydedildi" }, { label: "Hâlâ sona eriyor", detail: "ilişki hâlâ sona erme aşamasında" }] },
    "a.push-lead": { headline: "Erişimin yakında sona ereceğini push ile belirt - e-postayla gönderilen tam bildirime dönen kısa bir hatırlatma, onun ayrıntısını tekrarlamadan." },
    "w.window": { headline: "kişi iptali yürürlüğe girmeden geri çekene ya da yürürlük bitiş tarihine ulaşılana kadar", detail: "zaman aşımı süresi: Tasfiye süreci, ilk mesajda belirtilen yürürlük bitiş tarihine kadar işler; bu tarih hiçbir zaman değişmez. (yapılandır: cancellation_wind.window)" },
    "c.obligations": { headline: "İlişkiden daha uzun süren bir şey var mı?", edges: [{ label: "Yükümlülükler var", detail: "ödenmemiş bir bakiye, bir iade, bir saklama süresi veya harici bir abonelik bitiş tarihinden sonra da geçerli kalır" }, { label: "Eksik yok", detail: "ilişki temiz bir şekilde sona erer" }] },
    "c.withdrawn": { headline: "İptali geri çektiler mi?", edges: [{ label: "Geri çekildi", detail: "bitiş tarihinden önce yetkili bir yeniden etkinleştirme veya geri çekme kaydedildi" }, { label: "Hâlâ sona eriyor", detail: "ilişki hâlâ sona erme aşamasında" }] },
    "a.ending": { headline: "Erişimin yakında sona ereceğini ve bundan neyin sağ çıkıp neyin çıkmayacağını belirt - dışa aktarımlar, geçmiş, ödenmemiş yükümlülükler. Bu, kişi geri dönmeyi planlasın ya da planlamasın ihtiyaç duyduğu bilgidir" },
    "h.obligations": { headline: "İlişki sonu → nihai mutabakat → eski veya süresi dolmuş durum", detail: "sona ermesinden sonra da devam eden yükümlülükleri olan, iptal edilmiş bir ilişki" },
    "x.ended": { headline: "hiçbir şey eksik kalmadan sona erdi", detail: "geri dönen eski bir müşteri buradan değil, kazanım veya yeniden etkinleştirme üzerinden girer" },
    "x.returned": { headline: "iptal geri çekildi, ilişki devam ediyor", detail: "sonraki bir iptal, yeni bir tasfiye süreci başlatır" },
  },
  },
  "TIM-268": {
  shortName: "Eylem Gerekli Hatırlatması",
  name: "Müşterinin yapması gereken eylem → son tarih hatırlatması → tamamlandı veya düştü",
  purpose: "Birine, hâlâ vakit varken ne borçlu olduğunu, gönderim anındaki yükümlülük durumundan yola çıkarak hatırlat - çünkü zaten yapılmış bir şey için gönderilen hatırlatma, hiç gönderilmemiş bir hatırlatmadan daha pahalıya mal olur.",
  nodes: {
    "t.owed": { headline: "Müşterinin borçlu olduğu yükümlülük hâlâ karşılanmadı" },
    "c.remindable": { headline: "Son tarihe kadar beklemeye değer bir boşluk var mı?", edges: [{ label: "Zaman var", detail: "vade tarihi, hatırlatma noktasına henüz ulaşılmayacak kadar uzakta" }, { label: "Vadesi geldi veya geçti", detail: "bu duruma uygun hale geldiğinde hatırlatma noktasına ya ulaşılmış ya da geçilmiş oluyor" }] },
    "w.due": { headline: "yükümlülük karşılanana, iptal edilene veya sıfıra düşürülene, ya da yükümlülük değişip borçlu kalmaya devam edene kadar", detail: "zaman aşımı: Bu tür yükümlülük için tanımlanan hatırlatma noktası. (outstanding_obligation.due yapılandırın)" },
    "a.recheck": { headline: "Göndermeden hemen önce yükümlülüğü yetkili güncel durumdan yeniden oku - şu anda ne borçlu olunduğunu, buna karşılık ne alındığını ve son tarihin şu anda ne olduğunu. Bir saat önceki duruma göre kurgulanmış bir mesaj, zaten ödemesini yapmış birinden tekrar ödeme istemenin yoludur" },
    "c.outstanding": { headline: "Gönderim anında hâlâ borçlu olunan bir şey var mı?", edges: [{ label: "Hâlâ karşılanmadı", detail: "kayıt, yükümlülüğün tamamen veya kısmen karşılanmadığını gösteriyor" }, { label: "Karşılanmayan bir şey yok", detail: "karşılandı, iptal edildi veya sıfıra düşürüldü" }] },
    "a.remind": { headline: "Yükümlülüğü, karşılanmamış kalan kısmı, son tarihi ve bunu kapatmanın tek yolunu belirt. Kısmen karşılanmış, karşılanmamış demektir; belirtilen tutar başlangıçtaki değil, hâlâ borçlu olunan tutardır - bu fark, mesajı yanıtlanabilir kılan şeydir" },
    "x.moot": { headline: "artık borç yok; hiçbir şey gönderilmedi", detail: "aynı kişinin borçlu olduğu sonraki bir yükümlülük yeni bir örnektir" },
    "w.deadline": { headline: "yükümlülük karşılanana ya da iptal edilip sıfıra düşürülene kadar", detail: "zaman aşımı: Hatırlatmadan sonra örnek, vade tarihinin kendisine kadar bekler; o anda durumun ne olduğu onay, geçersizlik ve gecikme bildirimi arasında karar verir. (outstanding_obligation.deadline yapılandırın)" },
    "c.settled": { headline: "Nasıl sonuçlandı?", edges: [{ label: "Karşılandı", detail: "yetkili bir olay yükümlülüğü tamamen kapatır" }, { label: "İptal edildi veya kaldırıldı", detail: "yükümlülük artık karşılanacak şekilde mevcut değil" }] },
    "a.overdue": { headline: "Son tarihin geçtiğini, şu anki durumu ve politikanın buna gerçekte hangi sonucu bağladığını bir kez söyle. Tek bir bildirim - bunu tekrarlamak bir tahsilat sürecidir ve bu, hatırlatmanın değil sonucun sahibine aittir" },
    "a.confirm": { headline: "Kapandığını ve başka bir şeyin beklenmediğini onayla. Karşılanmış ama hiç onaylanmamış bir yükümlülük, kişinin sürekli kontrol ettiği bir yükümlülüktür - ve destek talebi de tam olarak bu kontrolden doğar" },
    "c.escalate": { headline: "Bunu şu anda tanımlı bir sonuç mu yönetiyor?", edges: [{ label: "Bir sonuç uygulanıyor", detail: "politika, son tarihinden sonra karşılanmamış bir yükümlülük için ek bir adım tanımlıyor" }, { label: "Başka bir şey tanımlı değil", detail: "tanımlı bir sonuç yok ve yükümlülük yalnızca karşılanmamış olarak duruyor" }] },
    "x.satisfied": { headline: "karşılandı ve onaylandı", detail: "aynı kişinin borçlu olduğu yeni bir yükümlülük yeni bir örnektir" },
    "h.consequence": { headline: "external:consequence-owner", detail: "son tarihinden sonra hâlâ karşılanmamış ve tanımlı bir sonucu olan bir yükümlülük" },
    "x.lapsed": { headline: "karşılanmadan düştü; başka bir sonuç tanımlı değil", detail: "yükümlülük daha sonra karşılanırsa, onay bu olaydan itibaren işler" },
  },
  },
  "TIM-274": {
  shortName: "Ek Süre Kurtarma",
  name: "Ek süreye girildi → bitmeden kurtar → geri yüklendi veya kaybedildi",
  purpose: "Sahibine, geçerliliğin azaltılmış işlevlere sahip sınırlı bir döneme düştüğünü, neyin hâlâ çalıştığını, bu dönemin ne zaman biteceğini ve geri dönüşün tek yolunu söyle - böylece ek süre, bir şey durduğunda fark ettiği değil, bilerek içinde bulunduğu bir durum olsun.",
  nodes: {
    "t.grace": { headline: "Ek süre başladı" },
    "c.restricted": { headline: "Ek süre, sahibin gerçekten fark edeceği bir şeyi kısıtlıyor mu?", edges: [{ label: "İşlev azaldı", detail: "ek süre için kaydedilen yetenekler, sahibin kullandığı şekilde aktif durumdan daha dardır" }, { label: "Süreklilik değişmedi", detail: "sahibin güvendiği her şey, pencere boyunca dokunulmadan sürüyor" }] },
    "a.notify-restricted": { headline: "Neyin çalışmayı bıraktığını, neyin hâlâ çalıştığını, pencerenin biteceği tarihi ve aktif durumu geri yükleyen tek koşulu belirt. Neyin hâlâ çalıştığını belirtmek, bir azalmanın bir sonlandırma olarak algılanmasını önler" },
    "a.notify-quiet": { headline: "Geçerliliğin düştüğünü, henüz hiçbir şeyin değişmediğini ve ne zaman değişeceğini belirt. Sahibin hissedemediği bir kısıtlamayı abartmak, hissedebileceği zaman gelecek mesajı önemsememeyi öğretir" },
    "w.grace": { headline: "kurtarılabilir durumu sona erdiren koşul karşılanana veya varlık sonlandırılana kadar", detail: "zaman aşımı: Pencere içinde, bir mesaj daha gönderilip hâlâ eyleme dönüştürülebilecek nokta. (grace_period.grace yapılandırın)" },
    "a.recheck-grace": { headline: "Son çağrıdan hemen önce ek süre kaydını yeniden oku: pencere hâlâ açık mı, varlık hâlâ ek süre içinde mi, bitiş tarihi değişti mi. Son çağrıyı körlemesine göndermek, bu süreçteki en sonuçlu iki mesajdan biridir ve gerçekleşmiş bir şeyin ardından ulaşma olasılığı en yüksek olandır" },
    "c.recheck-grace": { headline: "Varlık hâlâ ek süre içinde ve çözülmemiş mi?", edges: [{ label: "Hâlâ ek süre içinde", detail: "kurtarma gerçekleşmedi ve varlık, zaman aşımı tetiklendiğinden bu yana sonlandırılmadı" }, { label: "Zaten çözüldü", detail: "zaman aşımının tetiklenmesi ile bu yeniden okuma arasında kurtarma veya sonlandırma gerçekleşti" }] },
    "c.outcome": { headline: "Beklemeyi ne sona erdirdi?", edges: [{ label: "Kurtarıldı", detail: "kurtarma koşulu karşılandı ve varlık ek süreden çıkıp aktif duruma geçti" }, { label: "Erken sona erdi", detail: "varlık, pencere dolmadan sonlandırıldı veya geri çekildi" }] },
    "a.last-call": { headline: "Tam bitiş tarihini, o tarihte neyin duracağını ve aynı tek kurtarma yolunu belirten bir mesaj gönder. İkinci bir hatırlatma yoktur - sabit bitiş tarihi baskının kendisidir; bunu tekrarlamak yalnızca harekete geçmek için gereken dikkati tüketir" },
    "a.confirm": { headline: "Aktif durumun geri döndüğünü onayla ve azaltılmış yeteneklerden hangilerinin geri geldiğini belirt. Kimsenin onaylamadığı bir kurtarma, sahibin hâlâ kısıtlanmış gibi davranmasına yol açar - bu da kurtarılmamış olmakla aynı maliyeti taşır" },
    "x.moot": { headline: "ek süre, penceresi kapanmadan önce sonlandırmayla bitti", detail: "yeniden etkinleştirilip daha sonra tekrar düşen bir varlık, yeniden baştan uygun hale gelir" },
    "w.final": { headline: "kurtarılabilir durumu sona erdiren koşul karşılanana veya varlık sonlandırılana kadar", detail: "zaman aşımı: Son çağrıdan sonra örnek, ek sürenin bitişine kadar bekler; öncesindeki kurtarma onaylanır, geçmesi ise kayıp anlamına gelir. (grace_period.final yapılandırın)" },
    "a.recheck-final": { headline: "Kayıp bildiriminden hemen önce ek süre kaydını, son çağrıdan önce yapılan aynı yeniden okumayla oku: pencere hâlâ açık mı, varlık hâlâ ek süre içinde mi, bitiş tarihi değişti mi. Bu, süreçteki en sonuçlu iki mesajdan biridir ve ikisi de körlemesine gönderiliyordu" },
    "c.recheck-final": { headline: "Varlık hâlâ ek süre içinde ve çözülmemiş mi?", edges: [{ label: "Hâlâ çözülmemiş", detail: "kurtarma gerçekleşmedi ve varlık, zaman aşımı tetiklendiğinden bu yana sonlandırılmadı" }, { label: "Zaten çözüldü", detail: "zaman aşımının tetiklenmesi ile bu yeniden okuma arasında kurtarma veya sonlandırma gerçekleşti" }] },
    "x.recovered": { headline: "pencere içinde kurtarıldı", detail: "sonraki bir düşüş, yeni bir ek süre ve yeni bir örnek açar" },
    "a.lost": { headline: "Pencerenin kapandığını, artık neyin kullanılamaz olduğunu ve farklı koşullarla bile olsa bir geri dönüş yolu olup olmadığını açıkça söyle. Pencerenin kapandığı kendisine söylenmeyen bir sahip, açık olduğunu varsaymaya devam eder" },
    "x.lost": { headline: "pencere kurtarılmadan kapandı", detail: "daha sonra verilen bir geçerlilik yeni bir yaşam döngüsü başlatır; buraya yeniden girmek için yeni bir düşüş gerekir" },
  },
  },
  "TIM-61": {
  shortName: "Son Tarih Takibi",
  name: "Son tarih oluşturuldu → takip → tamamlandı, yükseltildi veya süresi doldu",
  purpose: "Bir son tarihin, mesajları bir tarihe göre planlamak yerine tek bir yükümlülüğün durumunu belirlemesini sağlar.",
  nodes: {
    "t.deadline": { headline: "Yetkili son tarih atandı" },
    "a.store": { headline: "Son tarihi; sonucu değiştirdiği durumlarda saat dilimiyle birlikte, kaynağıyla, yönettiği yükümlülükle, sahibiyle ve neyin tamamlanma sayılacağıyla birlikte kaydet. Tamamlanma koşulu bunun taşıyıcı unsurudur - neyin kendisini karşılayacağını söyleyemeyen bir son tarih, yalnızca geçen zamanı ölçebilir" },
    "w.tracking": { headline: "yükümlülük ana kayıt sisteminde karşılanana kadar veya son tarihten önce tanımlanmış bir noktaya ulaşılana kadar", detail: "zaman aşımı: Son tarihin kendisi. (deadline_tracking.tracking yapılandırın)" },
    "c.what": { headline: "Hangisi gerçekleşti?", edges: [{ label: "Tamamlandı", detail: "son tarihle birlikte kaydedilen tamamlanma koşulu karşılandı" }, { label: "Son tarih öncesi eşik", detail: "yükümlülük hâlâ açıkken son tarihten önce tanımlanan noktaya ulaşıldı" }] },
    "c.consequence": { headline: "Son tarih, yükümlülük açıkken geçti - yönetici kural ne olacağını söylüyor?", edges: [{ label: "GECİKMİŞ", detail: "yükümlülük son tarihinden sonra da varlığını sürdürür ve operasyonel durumu değişir" }, { label: "YÜKSELTİLDİ", detail: "kural, yükümlülüğün kendisini değiştirmek yerine onu üst mercie taşır" }, { label: "SÜRESİ DOLDU", detail: "yükümlülüğün kendisi son tarihte geçerliliğini yitirir" }, { label: "BAŞARISIZ", detail: "kural, bu son tarihi kaçırmayı açıkça başarısızlık olarak tanımlar" }, { label: "Hâlâ geçerli", detail: "son tarih bir hedeften ibaretti ve geçmesi yükümlülükle ilgili hiçbir şeyi değiştirmez" }] },
    "a.satisfied": { headline: "Yükümlülüğü tamamlandı olarak işaretle ve ona karşı sırada bekleyen tüm hatırlatma ve yükseltmeleri geçersiz kıl. Tamamlanmış bir yükümlülük, eskimiş bir son tarih işi tarafından asla yeniden açılmaz - bitmiş bir şeyin hayata dönmesinin özel yolu budur" },
    "c.useful": { headline: "Burada son tarih öncesi bir hatırlatma işe yarar mı ve politika böyle bir hatırlatma tanımlıyor mu?", edges: [{ label: "Gönderilsin", detail: "politika bu eşikte bir hatırlatma tanımlıyor ve alıcı hâlâ buna göre hareket edebilir" }, { label: "Gönderilecek bir şey yok", detail: "tanımlı bir hatırlatma yok, ya da bunu duyan kimse farklı bir şey yapamaz" }] },
    "c.threshold": { headline: "Hangi eşik tetiklendi?", edges: [{ label: "Son tarih öncesi son eşik", detail: "son tarihten önceki son eşik bu, ve SMS izni kayıtlı" }, { label: "Daha önceki bir eşik", detail: "erken, son olmayan bir eşik - yaklaşmakta olan bir sonuçla birlikte bir son tarih değil, bilgi niteliğinde" }] },
    "a.remind-final": { headline: "Son tarih öncesi son eşik için tanımlanan hatırlatmayı gönder. Bu, son tarihin kendisinin ne olacağına karar veren şey haline gelmeden önceki son fırsattır, bu yüzden yalnızca bilgi değil, son tarihi ve yükümlülüğü yerine getirmenin tek yolunu taşır" },
    "h.overdue": { headline: "Vade durumu değişikliği → önceliği yeniden hesapla → çöz veya yükselt", detail: "son tarihinden sonra da varlığını sürdüren bir yükümlülük" },
    "h.escalate": { headline: "Sorumluluk yükseltmesi → üst mercii → çözüm veya geri dönüş", detail: "yönetici kuralı, yükümlülüğü değiştirmek yerine üst mercie taşıyan bir son tarih" },
    "h.expired": { headline: "Son kullanma tarihine ulaşıldı → mevcut durumu doğrula → süresini doldur, uzat veya yenisiyle değiştir", detail: "yükümlülüğün kendisinin geçerliliğini yitirdiği bir son tarih" },
    "x.failed": { headline: "yükümlülük, kuralın tanımladığı şekilde son tarihinde başarısız oldu", detail: "yeni bir girişim, kendi son tarihine sahip yeni bir yükümlülüktür; bu kayıt yalnızca karşılanmadığını gösterir" },
    "x.still-valid": { headline: "son tarih geçti, yükümlülük değişmedi", detail: "yükümlülük, onu yöneten koşullar altında sürmeye devam eder - burada zamanın geçmesi hiçbir şeye karar vermedi; bu olağan durumdur, bir eksiklik değil" },
    "x.satisfied": { headline: "yükümlülük son tarihinden önce karşılandı", detail: "yeni bir yükümlülük kendi son tarihini taşır; bu yükümlülük kapandı" },
    "a.remind": { headline: "Bu eşik için tanımlanan hatırlatmayı gönder. Hatırlatma takvimi son tarih değildir ve onu değiştirmez - kimseye hatırlatılmamış bir son tarih yine de son tarihtir" },
  },
  },
  "TIM-62": {
  shortName: "Gecikme Durumu Yeniden Hesaplaması",
  name: "Vade durumu değişikliği → önceliği yeniden hesapla → çöz veya yükselt",
  purpose: "Çözülmemiş bir yükümlülük vadesi geldiğinde veya geciktiğinde bunu yalnızca duyurmak yerine, operasyonel olarak neye mal olduğunu değiştirir.",
  nodes: {
    "t.due": { headline: "Vade durumu değişti" },
    "a.reread": { headline: "Yükümlülüğün, zamanlayıcı kurulduğunda sahip olduğu duruma güvenmek yerine, şu andaki yetkili durumunu oku" },
    "c.satisfied": { headline: "Yükümlülük zaten karşılandı mı?", edges: [{ label: "Zaten tamamlandı", detail: "zamanlayıcı kurulduktan sonra ile tetiklenmesi arasında tamamlandı" }, { label: "Hâlâ açık", detail: "yükümlülük gerçekten çözümsüz kalmaya devam ediyor" }] },
    "a.suppress": { headline: "Eskimiş vade durumu eylemini bastır. Artık var olmayan bir yükümlülük için gecikmiş duruma geçmenin hiçbir anlamı yoktur" },
    "c.owner": { headline: "Bu yükümlülüğün bir sahibi var mı?", edges: [{ label: "Sahipli", detail: "aktif bir sahip bundan sorumludur" }, { label: "Sahipsiz", detail: "aktif bir sahibi yok - gecikmesinin nedeni de bu" }] },
    "x.stale": { headline: "eskimiş vade durumu eylemi bastırıldı", detail: "gerçekten açık olan ve bir vade eşiğini geçen yükümlülük sürece düzgün şekilde girer" },
    "a.priority": { headline: "Yükümlülüğün operasyonel önceliğini yeniden hesapla ve yalnızca bir bildirimin birinin yaptığı şeyi değiştireceği durumlarda bildirim gönder. Özgün son tarih geçmişinin üzerine yazılmaz, ona eklenir - vadesinin ne olduğu ile neye dönüştüğü iki ayrı gerçektir" },
    "h.orphan": { headline: "İş oluşturuldu → yönlendirme → atama", detail: "sorumlusu olmayan, gecikmiş bir yükümlülük" },
    "c.consequence": { headline: "Bu yükümlülüğün gecikmesi için tanımlı bir sonuç var mı?", edges: [{ label: "Yükseltme", detail: "politika, bunu çözebilecek bir seviyeye taşır" }, { label: "Kısıtlama veya başarısızlık", detail: "politika, varlığın kendisine tanımlı bir operasyonel sonuç uygular" }, { label: "Tanımlı sonuç yok", detail: "yükümlülük yalnızca gecikmiştir ve buna bağlı bir sonuç yoktur" }] },
    "h.escalate": { headline: "Sorumluluk yükseltmesi → üst mercii → çözüm veya geri dönüş", detail: "politikası kendisini üst mercie taşıyan, gecikmiş bir yükümlülük" },
    "h.consequence": { headline: "external:overdue-consequence", detail: "tanımlı bir operasyonel sonuç taşıyan, gecikmiş bir yükümlülük" },
    "x.tracked": { headline: "gecikmiş ve takip ediliyor; tanımlı bir sonuç yok", detail: "çözülmesi bunu kapatır, sonraki bir vade eşiği ise yeniden açar. Tanımlı bir sonucu olmayan gecikmiş bir kalem yalnızca raporlanacak bir gerçektir; bununla ilgili yapacak bir şey olsun diye bir sonuç uydurmak, bu dalın önlediği hatadır" },
  },
  },
  "TIM-63": {
  shortName: "Son Kullanma Tarihi Hatırlatması",
  name: "Son kullanma tarihi yaklaşıyor → uygunluk kontrolü → yenile, tamamla veya süresinin dolmasına izin ver",
  purpose: "Süre dolmadan önceki pencereyi, yalnızca o pencerede yapılacak bir eylemin sonucu gerçekten değiştirebileceği durumlarda kullan.",
  nodes: {
    "t.window": { headline: "Süre dolumu öncesi pencereye girildi" },
    "a.reread": { headline: "Varlığın güncel durumunu yeniden oku. Pencere bir takvime göre açıldı ve bu takvim yazıldığından bu yana varlık yenilenmiş, değiştirilmiş veya tamamlanmış olabilir" },
    "c.already": { headline: "Zaten yenilendi, değiştirildi veya tamamlandı mı?", edges: [{ label: "Zaten çözüldü", detail: "varlık artık bu süre dolumuna doğru ilerlemiyor" }, { label: "Hâlâ süresi dolmak üzere", detail: "süre dolumu hâlâ geçerli" }] },
    "x.suppressed": { headline: "süre dolumu öncesi süreç bastırıldı; süresi dolan bir şey yok", detail: "yerine geçen varlığın kendi süre dolumu ve kendi penceresi vardır" },
    "c.action": { headline: "Sonucu gerçek anlamda değiştirecek bir eylem mevcut mu?", edges: [{ label: "Eylem mevcut", detail: "yenileme, tamamlama veya değiştirme mümkündür ve biri bunu gerçekleştirebilir" }, { label: "Yapılabilecek bir şey yok", detail: "süre ne olursa olsun dolacak - ya yenileme seçeneği yok, ya da karar sahibin elinde değil" }] },
    "a.actor": { headline: "Eylemden kimin sorumlu olduğunu ve eylemin gerçekte ne olduğunu belirle. Yenilemeyi gerçekleştiremeyecek birine gönderilen bir süre dolumu öncesi mesaj, harekete geçirici mesaj gibi görünen bir bildirimden ibarettir" },
    "c.informational": { headline: "Yapılabilecek bir şey olmasa bile birine haber vermek işe yarar mı?", edges: [{ label: "Söylemeye değer", detail: "sahip buna göre plan yapmalı, aksi halde şaşırır" }, { label: "Söylemeye değmez", detail: "bunu erkenden bilmenin kimseye bir faydası yok" }] },
    "a.prompt-action": { headline: "Sorumlu kişiye neyin süresinin dolduğunu, sonucu değiştirecek somut eylemi ve bu eylemin artık mümkün olmayacağı noktayı bildir. Kimin harekete geçmesi gerektiğini belirleyip sonra onlara hiç haber vermeden hareket etmelerini beklemek, kimsenin ulaşmadığı bir çağrıdır" },
    "a.inform": { headline: "Neyin ne zaman olacağını, harekete geçirici bir çağrı eklemeden söyle - çünkü yapılabilecek bir eylem yok. Eylemin mümkün olmadığı bir yerde harekete geçirme çağrısı, sessizlikten daha kötüdür" },
    "x.silent": { headline: "süresi doluyor, yapılacak bir şey yok ve söylemeye değer bir şey yok", detail: "süre dolumunun kendisi, gerçekleştiği anda ele alınır" },
    "w.resolution": { headline: "süresi dolan öge yenilenene, gereken eylem süre dolmadan tamamlanana veya süresi dolan öge değiştirilene kadar", detail: "zaman aşımı: Bekleme, ana kayıt sisteminin bildirdiği süre dolum anında sona erer; süre dolumunun kendisi burada yeniden ileri sürülmez, bir sonraki süreçte doğrulanır ve ele alınır. (önerilen: ana kayıt sisteminin bildirdiği şekliyle expires_at; expiry.expiry_moment yapılandırın)" },
    "a.invalidate": { headline: "Eski geçerliliğe karşı sırada bekleyen süre dolumu eylemlerini geçersiz kıl; böylece bugün verilen bir yenileme, dün planlanmış bir süre dolumu tarafından geri alınmaz" },
    "h.expiry": { headline: "Son kullanma tarihine ulaşıldı → mevcut durumu doğrula → süresini doldur, uzat veya yenisiyle değiştir", detail: "pencerenin çözümsüz kapanması" },
    "h.resolved": { headline: "external:renewal-yaşam döngüsü", detail: "süresi dolmadan önce çözülen bir varlık" },
  },
  },
  "TIM-65": {
  shortName: "Ek Süre Yönetimi",
  name: "Ek süreye giriş → geçici süreklilik → kurtarma veya sonlandırma",
  purpose: "Kurtarılabilir bir şey çözülmemişken sınırlı bir sürekliliği korur, normal aktif durumun hâlâ var olduğunu varsaymadan.",
  nodes: {
    "t.grace": { headline: "Birincil geçerlilik, ek süre politikasıyla birlikte sona erdi" },
    "a.record": { headline: "Ek sürenin başlangıcını, bitişini, nedenini, kurtarma koşulunu ve hangi yeteneklerin sürdüğünü, hangilerinin kısıtlandığını açıkça kaydet. Neyin hâlâ çalıştığını söylemeyen bir ek süre durumu, aktif durumdan ayırt edilemez hale gelir; bu da onu ayrı adlandırmanın tek nedenini ortadan kaldırır" },
    "w.grace": { headline: "kurtarılabilir durumu sona erdiren koşul karşılanana kadar", detail: "zaman aşımı: Ek sürenin bitişi, girişte politikadan kaydedilir ve zaman aşımının kendisidir. Sonradan hiçbir şey bunu değiştirmez. (önerilen: girişte kaydedildiği şekliyle grace_end; time.grace_end yapılandırın)" },
    "c.eligibility": { headline: "Varlık, geri döneceği aktif durum için hâlâ uygun mu?", edges: [{ label: "Hâlâ uygun", detail: "aktif durumun koşulları öncekiyle aynı şekilde geçerliliğini koruyor" }, { label: "Uygunluk değişti", detail: "ek süre boyunca bir şey değişti - bir kural, bir sınır, bir hak veya bir durum" }] },
    "c.terminate": { headline: "Ek süre çözülmeden sona erdi - politika ne yapıyor?", edges: [{ label: "Varlığın süresi doluyor", detail: "süreye bağlı varlığın kendisi geçerliliğini yitirir" }, { label: "Erişim veya ilişki sona eriyor", detail: "politika, varlığın süresini doldurmak yerine onu sonlandırır veya daha da kısıtlar" }] },
    "a.restore": { headline: "Aktif durumu geri yükle ve ek süre kısıtlamalarını kaldır; kurtarmanın pencere içinde gerçekleştiğini kaydet" },
    "h.revalidate": { headline: "Dinamik uygunluk → uygun veya uygun değil → sonuç", detail: "uygunluk değişmiş olabilecekken gelen bir kurtarma" },
    "h.expire": { headline: "Son kullanma tarihine ulaşıldı → mevcut durumu doğrula → süresini doldur, uzat veya yenisiyle değiştir", detail: "varlığın süresinin dolmasıyla sonuçlanan ek süre" },
    "h.terminate": { headline: "external:termination-yaşam döngüsü", detail: "erişimin veya ilişkinin sona ermesiyle biten ek süre" },
    "x.recovered": { headline: "ek süre içinde kurtarıldı; aktif durum geri yüklendi", detail: "sonraki bir düşüş, tekrar ek süreye girer; bunun ne sıklıkla yaşandığının geçmişi de başlı başına incelemeye değer" },
  },
  },
  "TRM-105": {
  shortName: "Sorumluluk Devri",
  name: "Rol veya sorumluluk devri → yürürlük anında transfer → devam",
  purpose: "Bir rolü, öncesinde hiçbir şeyi değiştirmeden ve sonrasında hiçbir şeyi yeniden yazmadan, belirlenmiş bir anda iki kişi arasında taşımak.",
  nodes: {
    "t.handover": { headline: "Sorumluluk devri onaylandı" },
    "a.define": { headline: "Devreden tarafı, devralan tarafı, kapsamı, yürürlük tarihini ve gerekçeyi tanımlayın. İleri bir tarih için planlanan bir devir, şu an için bir yetki değişikliği anlamına gelmez; yürürlük tarihine kadar devreden taraf rolü ve ona bağlı her şeyi elinde tutmaya devam eder" },
    "a.inventory": { headline: "Rolle birlikte taşınacakları envanterleyin: açık işler, son tarihler, onaylar, planlanmış eylemler, taahhütler ve bunların herhangi birini sürdürmek için gereken bağlam" },
    "c.eligible": { headline: "Devralan taraf bu rol için uygun ve yetkili mi?", edges: [{ label: "Uygun", detail: "rolün gerektirdiği yetkiye sahipler ve onları diskalifiye eden hiçbir durum yok" }, { label: "Uygun değil", detail: "rolü üstlenemezler ya da yetkileri bu kapsamı içermiyor" }] },
    "a.prepare": { headline: "Devri, henüz etkinleştirmeden hazırlayın. Bu aşamada ne devreden tarafın yetkisinde ne de devralan tarafın yetkisinde herhangi bir değişiklik olur" },
    "h.hold": { headline: "Sorumluluk eskalasyonu → üst yetkili → çözüm veya geri dönüş", detail: "rolü üstlenemeyecek bir tarafa yapılan devir" },
    "w.effective": { headline: "devir iptal edilene veya başka bir devirle yerine geçilene kadar", detail: "zaman aşımı: Devir, kendi yürürlük tarihine kadar bekler; bu tarihten önce hiçbir şey değişmez ve o anda hem taraflar hem de hedef yeniden doğrulanır. (yapılandırma: responsibility_handover.effective)" },
    "x.cancelled": { headline: "yürürlük tarihinden önce devir iptal edildi veya yerine başka bir devir geçti", detail: "devreden taraf süreç boyunca rolü elinde tuttu, dolayısıyla geri alınması gereken hiçbir şey yok - yetkinin onay anında değil yürürlük anında el değiştirmesinin amacı da bu" },
    "a.revalidate": { headline: "Yürürlük tarihinde her iki tarafı ve hedef varlığı yeniden doğrulayın. Bir devrin onaylanması ile yürürlüğe girmesi arasında haftalar geçebilir; bu sürede taraflardan biri ayrılmış, rol değiştirmiş ya da devrin varsaydığı yetkiyi kaybetmiş olabilir" },
    "c.still-valid": { headline: "Yürürlük tarihinde her iki taraf ve hedef hâlâ geçerli mi?", edges: [{ label: "Hâlâ geçerli", detail: "devrin varsaydığı hiçbir şey değişmedi" }, { label: "Bir şey değişti", detail: "taraflardan biri ayrılmış, yetkisini kaybetmiş ya da hedef, kapsamda tanımlandığı şekliyle artık mevcut değil" }] },
    "a.activate": { headline: "Yeni sorumluluğu, yürürlük tarihinden itibaren, devralınan son tarihler ve yükümlülükler tam olarak oldukları hâliyle etkinleştirin. Devir, kimin hesap vereceğini değiştirir; neyin veya ne zaman borçlu olunduğunu asla değiştirmez" },
    "h.escalate": { headline: "Sorumluluk eskalasyonu → üst yetkili → çözüm veya geri dönüş", detail: "varsayımları yürürlük tarihine kadar geçerliliğini koruyamamış bir devir" },
    "a.invalidate": { headline: "Devreden tarafın yetkisinin artık sona erdiği alanlarda, gelecekteki planlanmış eylemlerini geçersiz kılın. Rolü elinde tutarken aldığı kararlar tarihsel birer gerçek olarak kalır ve bunlara dokunulmaz - değişen, bundan sonra ne yapabileceğidir" },
    "x.handed-over": { headline: "sorumluluk, yürürlük tarihinde devredildi", detail: "sonraki bir devir, kendi koşullarına göre planlanır ve doğrulanır" },
  },
  },
  "TRM-106": {
  shortName: "Hesap Kapatma",
  name: "Hesap kapatma talebi → doğrulama → engelleri giderme → kapatma",
  purpose: "Hesap ilişkisini, onu haklı olarak engelleyen yükümlülükler çözüldükten sonra sonlandırmak - başka hiçbir şeyi sonlandırmadan.",
  nodes: {
    "t.requested": { headline: "Hesap kapatma talep edildi" },
    "a.state": { headline: "CLOSURE_REQUESTED durumunu kaydedin ve talebi kimin yaptığını, bu yetkiye sahip olup olmadığını, hesabın mevcut durumunu, açık engellerini ve bağımlı ilişkilerini belirleyin" },
    "c.authority": { headline: "Talep sahibi bu hesabı kapatma yetkisine sahip mi?", edges: [{ label: "Yetkili", detail: "hesabın sahibi ya da onu kapatabilecek role sahip" }, { label: "Yetkisiz", detail: "talep, bunu yapamayacak biri tarafından gönderilmiş" }] },
    "c.blockers": { headline: "Kapatma şu anda mümkün mü?", edges: [{ label: "Mümkün", detail: "önünde hiçbir engel yok" }, { label: "Engelli, giderilebilir", detail: "aktif bir mali yükümlülük, açık bir işlem, gerekli bir iade, bir güvenlik incelemesi, bağımlı bir varlık ya da idari bir süreç önünde duruyor ve bu çözülebilir" }, { label: "Engelli, giderilemez", detail: "kapatmayı, hesap sahibinin çözemeyeceği bir şey engelliyor" }] },
    "a.notify-unauthorized": { headline: "Talep sahibine kapatmanın gerçekleşmediğini ve bu talebin neden bunu yapamadığını, erişim hakkı olmayan hesap bilgilerini ifşa etmeden bildirin. Yanıtsız kalan bir kapatma talebi, talep sahibinin kapanmamış bir hesabı kapanmış sanmasına yol açar" },
    "a.execute": { headline: "Hesap kapatmayı gerçekleştirin. Bu yalnızca hesap ilişkisini sonlandırır, başka hiçbir şey yapmaz - bir sözleşme açıkça bağlamadıkça hiçbir aboneliği iptal etmez ve hiçbir veriyi silmez. Denetim kaydı ve geçmiş dokunulmadan kalır" },
    "a.surface": { headline: "Engelin tam olarak ne olduğunu görünür kılın. Birine hesabını neden kapatamadığını söylemeden sadece kapatamayacağını bildirmek, bir kapatma yerine bir destek talebi doğurur ve bu bir gereklilik değil bir engel gibi algılanır" },
    "a.notify-cannot-close": { headline: "Kapatmayı engelleyen durumu, etrafından dolaşacak bir yol uydurmadan açıkça belirtin. Talep sahibinin yapabileceği hiçbir şeyin bunu değiştirmeyeceği durumlarda, bunu söylemek doğru yanıttır - çözülemez bir engelin sessizlikle bildirilmesi, talebin hâlâ işlemde olduğu izlenimini verir" },
    "x.unauthorized": { headline: "kapatma yetkili bir taraf tarafından talep edilmedi; hesap değişmedi", detail: "yetkili bir taraftan gelen talep kendi koşullarına göre değerlendirilir" },
    "a.verify": { headline: "Hesabın, kapatmanın yasakladığı işlemler için artık etkin olmadığını doğrulayın" },
    "w.blockers": { headline: "kapatmayı engelleyen sorun giderilene kadar", detail: "zaman aşımı: Kapatma talebinin geçerlilik süresi. (yapılandırma: account_closure.blockers)" },
    "x.cannot-close": { headline: "kapatma mümkün değil", detail: "engelleyen koşul değiştiğinde bu süreç yeniden açılır. Hesap açık kalır ve gerekçe, açıklanmamış bir ret olarak bırakılmak yerine kayıt altına alınır" },
    "c.verified": { headline: "Kapatma yürürlüğe girdi mi?", edges: [{ label: "Kapatıldı", detail: "hesap artık yasaklı işlemlere izin vermiyor" }, { label: "Tam uygulanmadı", detail: "hesap bir yerlerde hâlâ etkin durumda" }] },
    "c.recheck": { headline: "Bu engel giderildikten sonra önünde başka bir şey var mı?", edges: [{ label: "Engel yok", detail: "geriye hiçbir engel kalmadı" }, { label: "Yeni engeller", detail: "birini gidermek başkalarını ortaya çıkardı ya da olduğu gibi bıraktı" }] },
    "x.lapsed": { headline: "engeller giderilmeden kapatma talebinin süresi doldu", detail: "yeni bir talep, o sırada geçerli olan engellere karşı yeniden değerlendirilir" },
    "a.confirm-closure": { headline: "Hesap ilişkisinin kapandığını doğrula ve bunun abonelik iptali ya da veri silme olmadığını açıkça belirt. Her ikisinin de ayrı yaşam döngüsünü ve kanıtı vardır. Bildirimi talep anında değil, kapatma doğrulandıktan sonra gönder" },
    "h.escalate": { headline: "Sorumluluk eskalasyonu → üst yetkili → çözüm veya geri dönüş", detail: "tam olarak uygulanmamış bir kapatma" },
    "x.still-blocked": { headline: "bir engel giderildi, kalan engeller görünür kılındı", detail: "kalan her engel ayrı ayrı belirtilip kendi başına çözülür ve kapatma yeniden talep edilir - hepsini tek bir mesajda toplamak, hesap sahibine üzerinde hareket edebileceği hiçbir şey söylemez" },
    "h.dependencies": { headline: "Hesap kapatma → dış ve ticari bağımlılıkların uzlaştırılması → sonuçlandırma", detail: "hesabın kendisinde yürürlüğe girmiş bir kapatma" },
  },
  },
  "TRM-107": {
  shortName: "Hesap Kapatma Uzlaştırması",
  name: "Hesap kapatma → dış ve ticari bağımlılıkların uzlaştırılması → sonuçlandırma",
  purpose: "Hesap dışında var olan hiçbir şeyin, sırf hesap kapandı diye sona ermiş sayılmamasını sağlamak.",
  nodes: {
    "t.closing": { headline: "Hesap kapatma uygulanıyor veya sonuçlandırılıyor" },
    "a.inventory": { headline: "Dış ve bağımlı durumları envanterleyin: abonelikler, dış faturalandırma anlaşmaları, üçüncü taraf hizmetleri, etkin haklar, bekleyen faturalar, dış rezervasyonlar ve bağlı sözleşmeler. Her biri kendi başına bir ilişkidir ve bir uygulama hesabını kapatmak, başka biri tarafından faturalandırılan bir aboneliği hiçbir zaman iptal etmemiştir" },
    "c.coupled": { headline: "Yetkili bir sözleşme veya sistem, bu bağımlılığın hesapla birlikte sona erdiğini belirtiyor mu?", edges: [{ label: "Açıkça bağlı", detail: "bir sözleşme ya da sağlayıcının kendi sistemi, hesabın kapatılmasının bunu da sonlandırdığını belirtiyor" }, { label: "Bağımsız", detail: "bunları birbirine bağlayan yetkili hiçbir şey yok - olağan durum budur" }] },
    "a.verify-termination": { headline: "Sonlanmayı varsaymak yerine gerçekten gerçekleştiğini doğrulayın. Bir sağlayıcının başarı bildirmesi yalnızca kendi API'si hakkında bir beyandır ve sözleşmeye yazılmış bir bağlantı, bir sistemde uygulanmış bir bağlantıyla aynı şey değildir" },
    "a.separate": { headline: "Bu bağımlılığın kendi sonlandırma sürecini gerektirdiğini kaydedin ve bunu bu şekilde bildirin. Bizim hesabımız kapandı diye bu bağımlılık sona ermez; kişiye hangi ilişkileri hâlâ sürdürdüğü bildirilir" },
    "w.outcomes": { headline: "gerekli bağımlılık sonuçları kaydedilene kadar", detail: "zaman aşımı: Kapatma politikasının bağımlılık çözümü için tanıdığı süre. (yapılandırma: closure_external.outcomes)" },
    "c.all": { headline: "Gerekli tüm bağımlılıklar nihai durumuna ulaştı mı?", edges: [{ label: "Tümü çözüldü", detail: "her bağımlılık kayıtlı bir son duruma ulaştı" }, { label: "Bazıları çözülmedi", detail: "en az bir bağımlılık sonlandırılamadı" }] },
    "c.policy": { headline: "Kapatma politikası, bu bağımlılık sürerken hesabın kapanmasına izin veriyor mu?", edges: [{ label: "İzin var", detail: "politika, bağımlılık ayrıca takip edilmek kaydıyla hesabın kapanmasına izin veriyor" }, { label: "İzin yok", detail: "kapatmanın sonuçlanabilmesi için bağımlılığın önce çözülmesi gerekiyor" }] },
    "a.record-final": { headline: "Her bağımlılığın nihai durumunu, hesabınkinden bağımsız olarak kaydedin. Bunlar ayrı ilişkilerdir ve sona ermeleri de ayrı birer gerçektir; bu şekilde kaydedilir" },
    "a.record-unresolved": { headline: "Hangi bağımlılıkların sonlanmadığını, görünür şekilde ve isim belirterek kaydedin. Bir bağımlılığın sonlandırılamamış olması, CLOSED olarak işaretlenmiş bir hesabın arkasına asla gizlenmez - zira birinin, ayrıldığını sandığı bir sağlayıcı tarafından ücretlendirilmeye devam etmesinin tam olarak nedeni budur" },
    "a.record-remaining": { headline: "Kalan bağımlılığı, kendi durumu ve kendi sahibiyle birlikte bağımsız olarak kaydedin; böylece hesap kapandıktan sonra da görünür ve sorumlusu belirlenebilir kalır" },
    "h.escalate": { headline: "Sorumluluk eskalasyonu → üst yetkili → çözüm veya geri dönüş", detail: "sonlanmamış ve askıda bırakılamayacak bir bağımlılık" },
    "x.finalized": { headline: "bağımlılıklar uzlaştırıldı ve hesaptan bağımsız olarak kaydedildi", detail: "sonradan fark edilen bir bağımlılık, kapatılmış hesabın kaydına karşı kendi başına uzlaştırılır" },
  },
  },
  "TRM-108": {
  shortName: "Hesap Kapatma Tasfiyesi",
  name: "Kapatma tamamlandı → tasfiye → eski veya nihai hesap durumu",
  purpose: "Kapatmadan sonra da devam eden yükümlülüklerin gerçekten tamamlanmasına izin verirken normal hesap etkinliğini durdurmak.",
  nodes: {
    "t.closed": { headline: "Hesap kapatma başarılı oldu" },
    "a.suppress": { headline: "Yeni kazanım, normal kullanım, artık anlamsız hale gelen etkileşim süreçlerini ve kapatmayla bağdaşmayan her hesap eylemini - sıraya alınmış olanlar dahil - durdurun. Kapatılmış bir hesabın bir katılım (onboarding) e-postası alması, kapatmanın her yere ulaşmadığının en açık kanıtıdır" },
    "a.guard": { headline: "Yeniden etkinleşmeye karşı önlem alın. Eski bir oturum açma kaydı, sıraya alınmış bir katılım adımı ya da gecikmiş bir senkronizasyon, kapatılmış bir hesabı geri getirmemelidir - kapatma, sonraki olayların karşı kontrol edildiği bir durumdur; bu olayların sessizce üzerine yazabileceği bir şey değildir" },
    "c.remaining": { headline: "Bu hesaba karşı bekleyen yükümlülükler var mı?", edges: [{ label: "Yükümlülükler var", detail: "bir nihai fatura, bir iade, bir veri dışa aktarımı, bir ürün iadesi, açık bir destek talebi, yasal bir saklama yükümlülüğü ya da dış bir bağımlılık hâlâ bekliyor" }, { label: "Bekleyen yok", detail: "hesabın ne borcu var ne de alacağı" }] },
    "a.scope": { headline: "Yalnızca bu yükümlülüklerin gerektirdiği, tek tek belirlenmiş süreçlere izin verin. Genel bir istisna olarak bırakılan bir tasfiye, üzerinde farklı bir etiket taşıyan açık bir hesaptan ibarettir" },
    "x.former": { headline: "FORMER; ilişki sona erdi ve geçmiş kayıt bozulmadan duruyor", detail: "geri dönen bir müşteri, bu ilişkiyi canlandırmak yerine yeni bir ilişki açar. Nihai bir ilişki durumu, kayıtların hiç var olmadığı anlamına gelmez - bunları silmek, kendi talebi, kendi kapsamı ve kendi yetkisi olan ayrı bir yaşam döngüsü'dır" },
    "w.winddown": { headline: "bekleyen tüm operasyonel yükümlülükler tamamlanana kadar", detail: "zaman aşımı: Tasfiye için tanınan süre ufku. (yapılandırma: closure_wind.winddown)" },
    "h.escalate": { headline: "Sorumluluk eskalasyonu → üst yetkili → çözüm veya geri dönüş", detail: "kendi süre ufkunu aşan bir tasfiye" },
  },
  },
  "TRM-275": {
  shortName: "Veri Silme Onayı",
  name: "Silme talebi → talep sahibinin doğrulanması → kapsam ve saklama süresinin teyidi → kapandı",
  purpose: "Verilerinin kaldırılmasını isteyen kişiye; nelerin silindiğinin, nelerin hangi yükümlülük gereği saklandığının ve talebin hangi tarihte kapandığının kalıcı bir kaydını vermek - çünkü kimsenin gösteremeyeceği bir silme işlemi, hiç yapılmamış bir silme işleminden ayırt edilemez.",
  nodes: {
    "t.request": { headline: "Veri sahibi tarafından veri silme talep edildi" },
    "a.acknowledge": { headline: "Talebi alındı olarak bildirin, yükümlülüğün bir yanıt gerektirdiği tarihi belirtin ve önce talep sahibinin kimliğinin doğrulanması gerektiğini söyleyin. Alındığı bildirilmeyen bir talep, kişinin yasal bir bekleme süresini görmezden gelinmekten ayırt edememesine yol açar" },
    "c.verified": { headline: "Talep sahibinin belirtilen kapsam üzerindeki kontrolü zaten kanıtlanmış mı?", edges: [{ label: "Zaten kanıtlanmış", detail: "hesap üzerindeki kontrol ya da belirtilen kapsam üzerindeki yetki, yükümlülüğün gerektirdiği standardı karşılıyor" }, { label: "Henüz kanıtlanmamış", detail: "talep, sahibinin silinmesini istediği şey üzerinde kontrol sahibi olduğuna dair yeterli kanıt olmadan gelmiş" }] },
    "w.decision": { headline: "kapsam, saklanacak öğeler ve silme sonucu tamamen netleşene kadar", detail: "zaman aşımı: Çözüm, ilgili yükümlülüğün belirlediği yanıt süresine kadar beklenir; bu sürenin yanıtsız dolması, veri koruma sorumlularına eskale edilmesine yol açar. (yapılandırma: deletion_request.decision)" },
    "a.verify": { headline: "Yükümlülüğün gerektirdiği kontrol kanıtını tam olarak isteyin, bunun ötesine geçmeyin. Bir silme talebini yerine getirmek için fazladan kimlik verisi toplamak, tam da bu talebin ortadan kaldırmak için var olduğu çelişkidir" },
    "c.outcome": { headline: "Netleşen sonuç gerçekte ne diyor?", edges: [{ label: "Tamamen silindi", detail: "belirtilen kapsamdaki her şey silindi ve bunların hiçbirini kapsayan bir saklama yükümlülüğü yok" }, { label: "Kısmen saklandı", detail: "yetkili bir saklama yükümlülüğü, belirtilen kapsamın bir kısmını kapsıyor" }] },
    "h.overdue": { headline: "external:data-protection-escalation", detail: "yasal yanıt süresine, bildirilecek yetkili bir sonuç olmadan ulaşan bir silme talebi" },
    "w.verify": { headline: "yeterli kontrol veya kimlik kanıtı sağlanana kadar", detail: "zaman aşımı: Doğrulama süresi, yasal yanıt süresi içinde ayrılan dönemdir. (yapılandırma: deletion_request.verify)" },
    "a.closed-full": { headline: "Nelerin silindiğini, hangi kapsamı içerdiğini ve talebin hangi tarihte kapandığını teyit edin. Bu mesaj, talep sahibinin elinde kalacak kayıttır; bu yüzden sabrı için teşekkür etmek yerine sonucu bildirir" },
    "a.closed-partial": { headline: "Nelerin silindiğini, nelerin saklandığını, bunu hangi yükümlülüğün gerektirdiğini ve bu yükümlülüğün ne zaman sona ereceğini belirtin. Yükümlülüğü adıyla belirtmek, saklamayı bir tercih değil bir kural haline getirir" },
    "a.unverified": { headline: "Talebi doğrulanamadı olarak kapatın; hiçbir şeyin silinmediğini, nedenini ve yeni bir talebin istenildiği zaman açılabileceğini açıkça belirtin. Sessizce kapatılan bir talep, gerçekleşmiş bir silme işlemi gibi algılanır" },
    "x.closed": { headline: "yanıtlandı ve kayıtlı olarak kapatıldı", detail: "aynı kişiden gelecek sonraki bir silme talebi yeni bir vaka sayılır ve baştan yeniden doğrulanır" },
    "x.unverified": { headline: "doğrulanamadı olarak kapatıldı, hiçbir şey silinmedi", detail: "aynı kişiden gelecek yeni bir talep, kendi süresi ve kendi doğrulaması olan yeni bir vaka sayılır" },
  },
  },
  "CON-300": {
  shortName: "Yanıt Vermeyen Aboneyi Sonlandırma",
  name: "Pazarlama iletişimi yanıtsız kaldı → soru bir kez soruldu → sürdürüldü, azaltıldı veya sonlandırıldı",
  purpose: "Gönderilenlerin hiçbirine yanıt vermemiş biriyle pazarlama iletişimini sürdürmenin hâlâ gerekçeli olup olmadığına karar vermek - bunu bir kez sorarak, \"daha az\" seçeneğini \"hiç\" seçeneğinin yanına gerçek bir yanıt olarak koyarak ve yanıt hiç gelmediğinde iletişimi sonlandırarak.",
  nodes: {
    "t.unengaged": { headline: "Pazarlama iletişimi bir dönem boyunca yanıtsız kaldı" },
    "c.evidence": {
      headline: "Kayıt, pazarlama iletişiminin istenmediği sonucunu gerçekten destekliyor mu?",
      edges: [
        { label: "Destekliyor", detail: "dönem içinde etkileşimi raporlayabilen bir yoldan gönderim yapılmış, hiçbirine yanıt gelmemiş ve ticari iletişim izni hâlâ geçerli" },
        { label: "Okunacak bir şey yok", detail: "dönem içinde hiçbir şey gönderilmemiş ya da gönderilen yol etkileşimi hiç raporlayamıyor; buradaki sessizlikten bir sonuç çıkarılamaz" },
        { label: "Zaten yanıtlanmış", detail: "kişi dönem içinde kendi tercihini belirlemiş ya da izniyle ilgili bir karar vermiş" },
      ],
    },
    "c.sendable": {
      headline: "Soru gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim kontrolleri geçiliyor: bu amaç için izin var, ulaşılabilir bir kanal var, hizmet iletişim yoğunluğu limiti aşılmadı, aktif bir bekleme süresi yok ve kişiyi daha yüksek öncelikli bir ulaşılabilirlik akışı tutmuyor" },
        { label: "Engellendi", detail: "bir kapı akışı durduruyor; hangi kapının durdurduğu gerekçe olarak kaydedilir ve mesaj başka bir yola zorlanmaz" },
      ],
    },
    "a.ask": {
      headline: "Pazarlama iletişiminin sürüp sürmeyeceğini bir kez sor ve azaltılmış bir sıklığı tamamen durdurmanın yanına koy; böylece \"daha az\" kişinin gerçekten verebileceği bir yanıt olsun. Hiçbir teklif, hiçbir ayrıcalık ve ilişkiyi savunan hiçbir gerekçe taşıma.",
    },
    "w.answer": {
      headline: "soru yanıtlanana kadar",
      detail: "Zaman aşımı: soruya, son bir bildirim gerekmeden önce yanıtlanması için tanınan süre. (unengaged_sunset.answer_window ayarlanmalı)",
    },
    "c.answered": {
      headline: "Soru bir yanıt aldı mı?",
      edges: [
        { label: "Sürsün", detail: "bu kişi için dönem içinde pazarlama iletişimiyle kurulmuş kayıtlı bir etkileşim var ya da kişi duymaya devam etmek istediğini belirtti" },
        { label: "Daha az olsun", detail: "kişi sonlandırma yerine azaltılmış bir sıklık belirledi" },
        { label: "Dursun", detail: "kişi ticari iletişim iznini kendisi geri çekti" },
        { label: "Yanıt yok", detail: "süre, hiçbir kayıt oluşmadan kapandı" },
      ],
    },
    "c.sendable2": {
      headline: "Son bildirim gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor ve bu kişiyi şu anda tutan daha yüksek öncelikli bir ulaşılabilirlik akışı yok" },
        { label: "Kalan yol yok", detail: "bu amaç için izinli ve ulaşılabilir hiçbir hedef kalmamış; bildirimi iletebileceğimiz kimse yok ve gerekçe kaydedilir" },
      ],
    },
    "a.final": {
      headline: "Sona erme tarihini taşıyan tek bir son bildirim ver: pazarlama iletişiminin hangi tarihte biteceğini, onu sürdürecek tek eylemi ve arada duran yanıt olarak azaltılmış sıklığı söyle. İlişkiyi savunan hiçbir şey eklenmez ve başka neyin değiştiğine dair hiçbir iddiada bulunulmaz.",
    },
    "w.final": {
      headline: "bildirim süresi dolana kadar",
      detail: "Zaman aşımı: son bildirimde belirtilen süre; bildirimin bir anlamı olması için bu tarihin gerçekten gelmesi gerekir. (unengaged_sunset.notice_period ayarlanmalı)",
    },
    "c.final": {
      headline: "Bildirim süresi neyle sonuçlandı?",
      edges: [
        { label: "Sürsün", detail: "bu kişi için bildirim süresi içinde pazarlama iletişimiyle kurulmuş kayıtlı bir etkileşim var ya da kişi duymaya devam etmek istediğini belirtti" },
        { label: "Daha az olsun", detail: "kişi sonlandırma yerine azaltılmış bir sıklık belirledi" },
        { label: "Dursun", detail: "kişi ticari iletişim iznini kendisi geri çekti" },
        { label: "Sessizlikle sona erdi", detail: "bildirim süresi, hiçbir kayıt oluşmadan kapandı" },
      ],
    },
    "a.suppress": {
      headline: "Bu kişi için pazarlama iletişimini gönderen tarafta durdur - kendisine gönderilen her tanıtım ve yaşam döngüsü mesajını kapsar, bunun ötesine geçmez - ve gerekçeyi, okunduğu dönemi ve durdurmayı kaldıracak koşulu birlikte kaydet. Kişinin kendi izin kaydına dokunulmaz: sessizlik bir çıkış talebi değildir ve buraya öyle yazmak, kişinin hiç vermediği bir kararı kaydına geçirmek olur.",
    },
    "c.notify": {
      headline: "Sonlandırma kişiye bildirilebilir mi?",
      edges: [
        { label: "Bildirilebilir", detail: "bu türden bir hizmet bildirimi için izinli ve ulaşılabilir bir hedef kalmış durumda" },
        { label: "Bildirilecek yol yok", detail: "bu kişiye ulaşacak hiçbir yol kalmamış; durdurma geçerli olur ve bildirim yapılmadan kaydedilir" },
      ],
    },
    "a.confirm-end": {
      headline: "Pazarlama iletişiminin sona erdiğini bildir, zaten pazarlama olmadığı için sürmeye devam edecekleri - kişinin elindeki, borçlu olduğu ya da alacaklı olduğu her şeyi - adıyla say ve istediğinde geri dönebileceği yolu bırak. Bu, kendi gönderimimiz hakkında bir bildirimdir; teşekkür etmek ya da bir kez daha sormak yerine bunu söyler.",
    },
    "h.enforce": {
      headline: "Baskılama",
      detail: "bu kişi için pazarlama iletişiminin sona ermesi ve durdurmanın artık durdurma durumlarını yöneten mekanizma tarafından tutulması, kapsamlanması ve kaldırılması gerekmesi",
    },
    "h.frequency": {
      headline: "Sıklık Tercihi Güncelleme",
      detail: "sonlandırma yerine azaltılmış bir sıklığın seçilmesi",
    },
    "h.permission": {
      headline: "İzin Değişikliği Uygulaması",
      detail: "kişinin ticari iletişim iznini kendisinin geri çekmesi",
    },
    "a.record-no-action": {
      headline: "Sorunun neden sorulmadığını ve hangi döneme karşı olduğunu kaydet; böylece \"hiçbir şey yapılmadı\" sessiz bir boşluk değil, ölçülen bir sonuç olur",
    },
    "x.kept": {
      headline: "Sürdürüldü",
      detail: "sonraki bir yanıtsız dönem, bekleme süresinden sonra kendi kanıtıyla değerlendirilir",
    },
    "x.answered": {
      headline: "Sorulmadan kapandı",
      detail: "sonraki bir yanıtsız dönem kendi örneğini açar ve yanıttan sonra yapılan gönderimlerden okunur",
    },
    "x.ended": {
      headline: "Pazarlama iletişimi sonlandırıldı",
      detail: "yeniden verilen bir izin durdurmayı kaldırır; bu akışın içinde onu yeniden açan hiçbir şey yoktur",
    },
    "x.no-action": {
      headline: "Soru sorulmadı",
      detail: "sonraki yanıtsız dönem kendi kapılarıyla değerlendirilir",
    },
  },
  },
  "FIN-302": {
  shortName: "İade Bildirimi",
  name: "İade gönderildi → sonuç gözlendi → tamamı iade edildi, bir kısmı iade edildi ya da ulaşmadı",
  purpose: "Kişiye paranın geri gittiğini, sonra da gerçekten ulaşıp ulaşmadığını söylemek - iade kararını, paranın hareketini ve paranın varışını, her biri doğru hale geldiği anda söylenen üç ayrı olgu olarak tutarak.",
  nodes: {
    "t.submitted": { headline: "İade, tahsilat yoluna gönderildi" },
    "c.scope": {
      headline: "Gerçekten hareket eden bir para var mı?",
      edges: [
        { label: "Para hareket ediyor", detail: "gönderilen tutar, işlemin tamamı ya da bir kısmı olarak hareket ediyor; gönderim kısmiyse kalan iade edilebilir tutar ayrıca kayıtlı" },
        { label: "Hareket eden bir şey yok", detail: "gönderim, hakkında herhangi bir şey söylenmeden geri çekildi ya da iptal edildi" },
      ],
    },
    "c.sendable": {
      headline: "Bildirim gönderilebilir mi?",
      edges: [
        { label: "Gönderilebilir", detail: "gönderim yolu geçiliyor: işlemsel bir amaç, ulaşılabilir bir hedef, sert kapıların açık olması ve bu iade için daha önce kaydedilmiş bir bildirimin bulunmaması" },
        { label: "Yol yok", detail: "bu türden bir işlemsel bildirim için izinli ve ulaşılabilir hiçbir hedef kalmamış; bildirim izinsiz bir yola zorlanmak yerine gerekçesiyle kaydedilir" },
      ],
    },
    "a.issued": {
      headline: "Paranın geri gittiğini söyle: gönderilen tutarı, bunun işlemin tamamı mı yoksa bir kısmı mı olduğunu - bir kısmıysa kalan iade edilebilir tutarı ayrıca adıyla - ve henüz ulaşmadığını. Varış için hiçbir tarih verme; tahsilat yolunun kendi süresi bizim iddia edeceğimiz bir şey değildir.",
    },
    "w.outcome": {
      headline: "iadenin sonucu finansal kayda düşene veya gönderim, bildirim gönderildikten sonra geri çekilene kadar",
      detail: "Zaman aşımı: tahsilat yoluna, kişiye paranın geri geldiğinin doğrulanamadığı söylenmeden önce bir sonuç üretmesi için tanınan süre. (refund_notification.settlement_window ayarlanmalı)",
    },
    "c.outcome": {
      headline: "Finansal kayıt, paraya ne olduğunu söylüyor?",
      edges: [
        { label: "Tamamı geri döndü", detail: "kayıt, gönderilen tutarın tamamının iade edildiğini doğruluyor" },
        { label: "Bir kısmı geri döndü", detail: "kayıt, gönderilen tutarın bir kısmının iade edildiğini doğruluyor ve üzerinde açık kalan tutarı belirtiyor" },
        { label: "Geri çekildi", detail: "gönderim, bildirim gönderildikten sonra geri çekildi ya da iptal edildi" },
        { label: "Geri geldiği doğrulanmadı", detail: "kayıt başarısız bir tahsilat gösteriyor ya da süre kapandığında hiçbir sonuç yok; her iki durumda da paranın geri geldiği doğrulanmış değil" },
      ],
    },
    "a.settled": {
      headline: "Finansal kayda dayanarak paranın geri geldiğini ve ne kadarının geldiğini bildir. Paranın şu anda nerede durduğuna dair hiçbir şey söyleme.",
    },
    "a.partial": {
      headline: "Gönderilen tutarın bir kısmının geri geldiğini söyle, gelmeyen kısmı adıyla belirt ve kalan için ne olduğunu anlat. Bir kısmı tamamıymış gibi duyurmak, kişiyi kimsenin yanıtlayamayacağı bir soruyla baş başa bırakır.",
    },
    "a.withdrawn": {
      headline: "Bildirim gönderildikten sonra iadenin geri çekildiğini ya da iptal edildiğini ve kaydın şu anda ne gösterdiğini söyle. İlk bildirim paranın hareket ettiğini söylemişti; bu, hareketin durduğunu açıkça söyler.",
    },
    "a.unresolved": {
      headline: "Paranın geri geldiğinin doğrulanmadığını açıkça söyle, hareketin yeniden denenmek yerine mutabakata alındığını belirt ve kendisinden başka bir şey beklenmediğini ekle. Belirsiz olan belirsiz olarak söylenir; çünkü kendi parasını bekleyen birine borçlu olunan şey bir güvence değil, gerçeğin kendisidir.",
    },
    "a.record-no-action": {
      headline: "Neden bildirim gönderilmediğini ve hangi iadeye karşı olduğunu kaydet; böylece \"hiçbir şey yapılmadı\" sessiz bir boşluk değil, ölçülen bir sonuç olur",
    },
    "x.settled": {
      headline: "Geri döndü ve doğrulandı",
      detail: "aynı işleme karşı yapılacak başka bir iade kendi hareketi ve kendi örneğidir",
    },
    "x.partial": {
      headline: "Kısmen geri döndü",
      detail: "kalan iade edilebilir tutara karşı gönderilen bir iade kendi örneğini açar",
    },
    "x.unsettled": {
      headline: "Geri geldiği doğrulanmadı",
      detail: "mutabakat sonucunda para yeniden hareket ederse, o gönderim kendi örneğidir",
    },
    "x.withdrawn": {
      headline: "Bildirim sonrası geri çekildi; gönderim, ödemeye geçmeden önce hareket etmeyi bıraktı",
      detail: "aynı işleme karşı yapılacak yeni bir gönderim kendi hareketi ve kendi örneğidir",
    },
    "x.void": {
      headline: "Duyurulacak bir şey yok",
      detail: "yeniden gönderilen bir iade kendi hareketi ve kendi örneğidir",
    },
    "x.no-action": {
      headline: "Bildirim gönderilmedi",
      detail: "bu işleme karşı yapılacak başka bir iade kendi kapılarıyla değerlendirilir",
    },
  },
  },
};


/** How many of the 160 public journeys carry a content override above, for
    an honest count rather than a silent claim - read by scripts/tooling,
    not by any page. */
export const TRANSLATION_COVERAGE = { journeysCovered: Object.keys(OVERRIDES).length } as const;

/* An exit's TR `headline` override is hand-translated from the full
   canonical `state` sentence, the same source the EN side runs through
   `splitExitState` (canonical-view.ts) before it ever becomes a headline -
   so an override written as a direct translation carries the same
   "<short clause>; <elaboration>" shape the EN clause was split away from.
   Re-running the split here keeps the TR exit card exactly as short as its
   EN twin instead of trusting each translated entry to have been
   pre-shortened by hand (confirmed corpus-wide: several were not). */
/* A handoff's TR headline is the same case one layer along: the EN side
   names the target by its PLAIN-LANGUAGE shortName (canonical-view.ts), but
   a hand-translated override here carries whatever long state-machine
   sentence the translator worked from ("Ödeme hatası → sınıflandır →
   kurtar, alternatif sun veya çıkış"). The target journey's own TR
   shortName is in this very table, under the target's id - so the card
   names it the way every TR list and link already does. An external
   handoff has no journey to look up and keeps its own id. */
function trHandoffHeadline(node: FlowNode, fallback: string): string {
  const to = node.edges.find((e) => e.kind === "journey")?.to;
  const named = to ? OVERRIDES[to]?.shortName : undefined;
  if (named) return named;
  /* A handoff OUT of the corpus has no journey to look up a TR name for, and
     13 of the hand-authored overrides simply carried the raw canonical id
     through as their headline - so `external:human-in-the-loop-lifecycle`
     was reaching TR cards verbatim while the EN route already humanized it
     (canonical-view.ts's `externalTargetName`, applied at projection).

     Humanizing alone was not enough on this route: it turns the id into an
     English PHRASE ("Human in the loop lifecycle"), which is a locale leak
     on a Turkish page rather than a proper noun the reader can be expected
     to know. A handoff card's whole job is to say where ownership goes, so
     it has to say it in the page's language. The nine destinations the
     public corpus hands off to are a closed set - they are named by
     `external:` ids in src/canonical and nothing generates new ones - so
     they get real translations here, in the file that owns TR content,
     rather than a rule that guesses. An id outside the table still falls
     back to the humanized English, which is the honest failure. */
  if (!fallback.startsWith("external:")) return fallback;
  return EXTERNAL_TARGET_TR[fallback] ?? externalTargetName(fallback);
}

/** The nine destinations outside the canonical library that public journeys
    hand off to, in Turkish. Closed set, read off the corpus - see
    `trHandoffHeadline` for why these are translated where node ids, event
    ids and config keys deliberately are not. */
const EXTERNAL_TARGET_TR: Readonly<Record<string, string>> = {
  "external:advocacy-contribution": "Referans ve savunuculuk akışı",
  "external:consequence-owner": "Yaptırım sahibi",
  "external:customer-lifecycle": "Müşteri yaşam döngüsü",
  "external:external-status-reconciliation": "Dış durum mutabakatı",
  "external:health-monitoring": "Sağlık izleme",
  "external:human-in-the-loop-lifecycle": "İnsan denetimli süreç",
  "external:operational-resolution": "Operasyonel çözüm",
  "external:renewal-lifecycle": "Yenileme yaşam döngüsü",
  "external:sales-assignment": "Satış ataması",
};

function localizeNodeContent(node: FlowNode, override: NodeOverride | undefined): FlowNode {
  // A handoff is renamed from the target's own TR shortName whether or not
  // this node has a content override of its own, so an untranslated one
  // does not fall back to the EN name on a TR page.
  if (!override) return node.kind === "handoff" ? { ...node, headline: trHandoffHeadline(node, node.headline) } : node;
  const headline = override.headline ?? node.headline;
  return {
    ...node,
    headline:
      node.kind === "exit"
        ? splitExitState(headline)
        : node.kind === "handoff"
          ? trHandoffHeadline(node, headline)
          : headline,
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
    ...localizedJourneyNaming(detail, lang),
    /* A "distinct from" row names ANOTHER journey - by that journey's own
       canonical `name`, which is in this table under that journey's id. The
       `because` sentence beside it is an Info-tab field and is outside this
       pass (see the OVERRIDES comment), so it stays English; the NAME does
       not have to, and leaving it English made a TR page state a Turkish
       journey's title in English right where it links to it. */
    distinctFrom: detail.distinctFrom.map((d) =>
      d.name ? { ...d, name: OVERRIDES[d.journey]?.name ?? d.name } : d,
    ),
    nodes: structured.map((n) => localizeNodeContent(n, override?.nodes?.[n.id])),
    /* The preset half of the page: the applied preset and the parent's list
       of its own presets. `localizedPreset` is the single mechanism - see
       its own comment for every place a preset's text surfaces. */
    preset: detail.preset ? localizedPreset(detail.preset, lang) : null,
    presets: detail.presets.map((p) => localizedPreset(p, lang)),
  };
}

/* ------------------------------------------------------------- the rows --

   ONE localization layer, one table, applied wherever a canonical
   projection meets a `lang` - not a per-page patch.

   `localizedJourneyDetail` above covers the detail page. Everything ELSE
   the site renders out of the canonical library is some projection of the
   same four naming fields: `JourneyRow` (canonical-view.ts) on the Customer
   Journey gallery and the landing page's largest-journey rows,
   `ShowcaseCard` (journey-marketing.ts) on the landing page's spread. They
   were all reading canonical English straight through, which is how
   /tr/lab/customer-journeys once listed every card's purpose in English.

   Structural typing rather than a union of the two row types on purpose:
   this function's contract is "whatever carries a journey id and these
   names", so a future projection is covered the moment it is passed
   through, and nothing here needs to know which page is asking. */
export type JourneyNaming = {
  id: string;
  name: string;
  shortName?: string;
  purpose: string;
  categoryTitle: string;
};

export function localizedJourneyNaming<T extends JourneyNaming>(row: T, lang: Lang): T {
  if (lang !== "tr") return row;
  const override = OVERRIDES[row.id];
  return {
    ...row,
    categoryTitle: localizedCategoryTitle(row.categoryTitle, lang),
    name: override?.name ?? row.name,
    ...(row.shortName !== undefined || override?.shortName !== undefined
      ? { shortName: override?.shortName ?? row.shortName }
      : {}),
    purpose: override?.purpose ?? row.purpose,
  };
}

/* ------------------------------------------------------------- presets --

   A preset is a named specialisation of a communicating customer journey -
   canonical `discovery.presets`, projected as `PresetRow` by
   canonical-view.ts. It is the one canonical shape that is NOT a journey
   and therefore had no slot in this file, which is keyed by journey id and
   node id: that is the whole reason every preset name and every
   `applicableWhen` sentence stood in English on the Turkish routes.

   Where a preset's own text reaches a TR page (all of it goes through
   `localizedPreset` below, at the boundary, never patched per call site):

     /tr/lab/journeys                     the chip row on the library's
                                          landing page (JourneyLibraryPage)
     /tr/lab/customer-journeys            the preset cards above the gallery
                                          (JourneyGallery, via LabPage)
     /tr/lab/journeys/<preset-id>         its own page - title card and the
                                          "preset of" line
     <head> of that page                  `journeyMetadata`'s title and
                                          description (JourneyRoutes.tsx)
     JSON-LD                              the breadcrumb's last crumb

   CLOSED, AND LOUD ON A MISS, exactly like `CATEGORY_TITLE_TR` above: every
   preset the public corpus declares is translated here, so a preset added
   to `src/canonical` without a Turkish entry fails the render by name
   instead of quietly shipping "Browse Abandonment" onto a Turkish page.
   `audit/locale-sweep.mjs` cannot catch that class - a two-word title never
   reaches its two-distinct-function-word threshold, and the
   `applicableWhen` sentence is a `discovery` field, which that gate reports
   as the known Info-tab gap rather than failing on. `audit/preset-locale.mjs`
   is the check that can, and it asserts this map against the corpus.

   WHAT STAYS ENGLISH, deliberately: the preset's `overrides` are config
   KEYS and their values (`recovery.first_check`), which are canonical
   identifiers and are never translated anywhere on this site (same rule as
   event ids and node ids), and the journey ids quoted inside an
   `applicableWhen` sentence (TIM-61, IDN-81, SCH-282) - an id is the thing
   a practitioner looks up. The journey NAMED beside such an id is given in
   Turkish, because that name is in this file under that journey's id and
   every other TR list already shows it that way. */
type PresetTranslation = {
  name: string;
  applicableWhen: string;
  /** The canonical `destination` - rendered after "Hedef:" on the preset
      banner. Short noun phrase, lower case, as the English is. */
  destination: string;
};

const PRESET_TR: Readonly<Record<string, PresetTranslation>> = {
  "quote-abandonment": {
    name: "Teklif Terki",
    applicableWhen:
      "Sürdürülebilir süreç, kişinin yapılandırdığı ama kabul etmediği bir teklif ya da öneridir; sürdürülebileceği bir hedefi ve teklif sisteminin bildirdiği bir geçerlilik sonu vardır.",
    destination: "teklif",
  },
  "application-abandonment": {
    name: "Başvuru Terki",
    applicableWhen:
      "Sürdürülebilir süreç, durumu kaydedilmiş çok adımlı bir başvurudur; kesin bir son gönderim tarihi varsa o tarih, bu kurtarmanın değil, devir yoluyla Son Tarih Takibi'nin (TIM-61) sorumluluğundadır.",
    destination: "başvuru",
  },
  "incomplete-registration": {
    name: "Yarım Kalan Kayıt",
    applicableWhen:
      "Sürdürülebilir süreç, yarım bırakılmış bir kayıt ya da üyelik adımıdır; kimlik doğrulaması gerekiyorsa Kimlik Doğrulama'ya (IDN-81) devredilir ve burada bir daha istenmez.",
    destination: "kayıt adımı",
  },
  "saved-item-reminder": {
    name: "Kaydedilen Ürün Hatırlatması",
    applicableWhen:
      "Seçim, kaydedilmiş bir liste ya da istek listesidir: satın alma niyeti iddia edilmeyen, beyan edilmiş bir ilgi. Bu yüzden ilk kontrol çok daha geç yapılır ve yazmanın dürüst gerekçesi, kaydedilen bir üründeki değişikliktir.",
    destination: "kaydedilmiş liste",
  },
  "browse-abandonment": {
    name: "Gezinme Terki",
    applicableWhen:
      "Konu, kişinin tekrar tekrar gezindiği bir kategori ya da listedir; temas kategoriyi işaret eder, kişinin tek tek seçmediği bir ürünü değil.",
    destination: "kategori ya da liste",
  },
  "product-view-abandonment": {
    name: "Ürün İnceleme Terki",
    applicableWhen:
      "Konu, tekrar tekrar görüntülenen tek bir üründür; temas o ürünü olduğu hâliyle ve platformun bildirdiği güncel bulunabilirliğiyle gösterir.",
    destination: "ürün",
  },
  "search-abandonment": {
    name: "Arama Terki",
    applicableWhen:
      "Konu, hiçbir seçime yol açmamış, tekrarlanan bir aramadır; temas sonuçları oldukları hâliyle işaret eder. Bir şeyi tutan müsaitlik sorgusu SCH-282'ye aittir, buraya değil.",
    destination: "arama sonuçları",
  },
  "predicted-next-purchase": {
    name: "Öngörülen Sonraki Satın Alma",
    applicableWhen:
      "İhtiyaç, tek bir ürünün kullanılabilir süresinden değil, kişinin o kategorideki kendi satın alma ritminden öngörülür; işleyiş aynıdır ve öngörü bir tahmin olarak belirtilir.",
    destination: "kategorinin yeniden sipariş yolu",
  },
};

/** Every shape a preset leaves the server in. Structural, like
    `localizedJourneyNaming` above and for the same reason: the contract is
    "whatever carries a preset id and these fields", so `PresetRow`
    (canonical-view.ts) and any future projection pass through one function.

    `applicableWhen` arrives as a plain string on `PresetRow`, already
    flattened from the canonical `RuleStatement`. */
export type PresetNaming = {
  id: string;
  name: string;
  applicableWhen?: string | { text: string };
  destination?: string | null;
  parentId?: string;
  parentName?: string;
  categoryTitle?: string;
};

export function localizedPreset<T extends PresetNaming>(row: T, lang: Lang): T {
  if (lang !== "tr") return row;
  const tr = PRESET_TR[row.id];
  if (!tr) {
    throw new Error(
      `journey-tr-overrides: no Turkish for preset "${row.id}". PRESET_TR is a closed map of every preset the public corpus declares - add the translation there rather than letting an English preset name reach a TR page. (node audit/preset-locale.mjs names every untranslated preset.)`,
    );
  }
  return {
    ...row,
    name: tr.name,
    ...(row.applicableWhen !== undefined
      ? {
          applicableWhen:
            typeof row.applicableWhen === "string"
              ? tr.applicableWhen
              : { ...row.applicableWhen, text: tr.applicableWhen },
        }
      : {}),
    ...(row.destination !== undefined && row.destination !== null ? { destination: tr.destination } : {}),
    /* The parent is a journey, so its Turkish name is where every other TR
       list reads it from - `OVERRIDES` under the parent's own id, short name
       first, exactly as `localizedJourneyNaming` resolves it. */
    ...(row.parentId !== undefined && row.parentName !== undefined
      ? { parentName: OVERRIDES[row.parentId]?.shortName ?? OVERRIDES[row.parentId]?.name ?? row.parentName }
      : {}),
    ...(row.categoryTitle !== undefined ? { categoryTitle: localizedCategoryTitle(row.categoryTitle, lang) } : {}),
  };
}

/* ------------------------------------------------- the featured journey --

   `FEATURED_JOURNEY` (journey-marketing.ts) is the one projection that
   quotes RAW canonical fields a canvas card never shows: a trigger's
   evidence lists, a condition's branch labels and reasons, a wait's arms
   and its timeout reason. The journey library's landing page stands them
   beside the real cards as its three story figures, and it was reading all
   of them off the English record while the card next to them rendered in
   Turkish.

   Same table, same node ids: the branch text and the timeout wording are
   the `edges`/`detail` entries the canvas already uses, and the evidence
   lists and timeout reason are the four `NodeOverride` fields declared
   above. So a journey translated for the canvas is translated here too,
   and the page has no strings of its own. */
export function localizedFeaturedJourney<T extends JourneyNaming & {
  nodes: readonly { id: string; kind: string }[];
  trigger: { requires: readonly string[]; insufficientAlone: readonly string[] };
  branch: { asks: string; branches: readonly { label: string; when: string }[] };
  wait: { until: readonly string[]; timeoutAfter: string; timeoutReason: string } | null;
}>(featured: T, lang: Lang): T {
  if (lang !== "tr") return featured;
  const nodes = OVERRIDES[featured.id]?.nodes ?? {};
  /* The three nodes are found the SAME way journey-marketing.ts found them
     when it built this projection - the first node of each kind, in the
     journey's own node order - so the override read here is always the
     override of the node the page is quoting. No node id is named. */
  const byKind = (kind: string) => {
    const id = featured.nodes.find((n) => n.kind === kind)?.id;
    return id ? nodes[id] : undefined;
  };
  const trigger = byKind("trigger");
  const condition = byKind("condition");
  const wait = byKind("wait");

  const pick = <U,>(tr: readonly U[] | undefined, en: readonly U[]): readonly U[] =>
    tr && tr.length === en.length ? tr : en;

  return {
    ...localizedJourneyNaming(featured, lang),
    trigger: {
      ...featured.trigger,
      requires: pick(trigger?.requires, featured.trigger.requires),
      insufficientAlone: pick(trigger?.insufficientAlone, featured.trigger.insufficientAlone),
    },
    branch: {
      asks: condition?.headline ?? featured.branch.asks,
      branches: featured.branch.branches.map((b, i) => ({
        label: condition?.edges?.[i]?.label ?? b.label,
        when: condition?.edges?.[i]?.detail ?? b.when,
      })),
    },
    wait: featured.wait
      ? {
          ...featured.wait,
          until: pick(wait?.until, featured.wait.until),
          // The wait card's own `detail` IS the rendered timeout config text,
          // already translated for the canvas - see localizeWaitDetail.
          timeoutAfter: wait?.detail ?? featured.wait.timeoutAfter,
          timeoutReason: wait?.timeoutReason ?? featured.wait.timeoutReason,
        }
      : featured.wait,
  };
}
