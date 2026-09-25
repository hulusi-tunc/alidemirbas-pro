import type { ReactNode } from "react";
import { ArrowRightLeft, Bell, CheckCircle2, Clock, Cog, Flag, LogOut, Mail, MessageCircle, MessageSquareText, Route, Smartphone, Split, UserRound, Zap } from "lucide-react";

import type { FlowNode } from "@/lib/canonical-view";
import type { Lang } from "@/lib/content";
import type { ChannelId, SignalSource } from "@/canonical/types";
import { CHANNEL_HUE, CHANNEL_LABEL } from "@/lib/journey-channels";

/* THE CANVAS NODE KIT, on the site's own system (Hulusi, 2026-09-14: "each
   canvas element needs to be redesigned and restructured; we need a design
   system for that - we already started it on the Lab page"). The cards
   now speak the Lab's drawn idiom: paper cards with a hairline ring and a
   soft shadow, a tinted icon tile per kind carrying a Lucide icon (the
   site's one icon set), plain-case labels on the 12px step, secondary
   states as quiet pills. Hierarchy stays as the grammar sets it: Action
   is the widest card, its own sentence clamped to a glance rather than a
   read (the full sentence is one click away, in the detail panel), Trigger
   is the one filled card - brand blue, with the Entry pin standing on its
   top edge so the start of a journey is the first thing the eye finds
   ("Entry is so hard to see") - Condition and Wait are compact, Exit sits
   at rest on a dashed edge. Every word on a card is canonical prose,
   mechanically derived from it (a short title, a short duration), or one
   of the kind names below; nothing is invented.

   Sizes are reserved by journey-canvas-layout.ts's SIZE table; keep the
   two in step when changing padding, type or clamps here. */

export function humanize(text: string): string {
  const words = text.replace(/[_.]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/* A wait's `detail` (`timeout after ...`) already carries the timeout's own
   value inside a parenthetical - "(example: 45 minutes; configure ...)" on
   the EN route, "(örnek: 45 dakika; ayarla: ...)" on the TR route, both
   composed by config-text.ts and journey-tr-overrides.ts before this
   component ever sees the string (see canonical-view.ts / journey-tr-
   overrides.ts - this file receives `node.detail` already localized, in
   whichever language the page is). Pulling the value back out of that
   wrapper - rather than adding a second, raw-English field bypassing that
   localization - is what keeps a Turkish reader from ever seeing an English
   duration on the one route where this card's main text has to be short.

   A REQUIRED wait with no configured default (vNext, `Config.required:
   true`) has NO value to pull out - config-text.ts's wrapper for it is
   "<rule sentence> (configure <key>)", and 46 of the library's 81 waits are
   this case, because the honest length depends on the company's own
   product rather than on anything the corpus can assert.

   Those 46 used to render the config key itself - `bounded_education.window`,
   `onboarding.step_interval` - scraped back out of that parenthetical. It
   was reasoned as "the key is language-neutral, so it is safe on both
   routes", which is true and beside the point: a dotted identifier is
   engine vocabulary standing where a duration belongs, on a customer-journey
   canvas, which is exactly what "no canonical config keys on the canvas"
   forbids. Removed 2026-09-20.

   What they render instead is the fall-through that was always below it and
   never reached: the wait's own headline, "until <event meaning>, or
   <event meaning>, ...", cut at its first clause. Already localized, already
   short, and the right thing to say when there is no number to say - what
   the journey is waiting FOR. The rule sentence and the key both stay
   reachable, unchanged, in the detail panel's `detail`. */
const WAIT_VALUE_RE = /\((?:example|recommended|örnek|önerilen): ([^;)]+)[;)]/i;
const CLAUSE_SEP_RE = /, | veya | ya da | or |; /;

function firstClause(text: string): string {
  if (text.length <= 70) return text;
  const m = CLAUSE_SEP_RE.exec(text);
  return m && m.index <= 90 ? text.slice(0, m.index) : text;
}

/* Card body budget - the same idea as the wait pill's `firstClause` above,
   applied to every card that renders a canonical sentence.

   Every body below is already `line-clamp-2`: two lines, then an ellipsis.
   That stops a long sentence overflowing its slot, but it cuts wherever the
   second line happens to run out - mid-word, mid-clause - so the corpus's
   longest action sentences (412 characters on FBK-47's `a.apply`, 391 on
   FBK-46's `a.close-unconfirmed`, measured, not estimated) reach the canvas
   as a fragment. A reader glancing at the graph gets half a subordinate
   clause and no way to tell there was more.

   Cutting at the sentence's OWN first boundary instead gives them a whole
   clause. Order of preference: the end of the first sentence, then a
   semicolon or a dash, then - only if none of those exists - the softer
   comma/"or"/"veya" break `firstClause` already uses. Nothing is
   paraphrased and nothing is lost: the detail panel renders `node.headline`
   in full, unchanged, which is the same contract the wait pill and the
   clamp itself have always had. A sentence that already fits the budget is
   passed through exactly as authored, so short cards - the majority - are
   untouched.

   Every boundary in the sentence is collected, not just the first, and the
   LONGEST one that still fits the budget wins - the most the card can say
   inside its two lines, rather than the least. The 24-character floor drops
   a cut so early that the card would say nothing ("Establish what failed");
   the next boundary is taken instead. A sentence with no boundary at all
   inside the budget keeps its full text and the clamp handles it, which is
   exactly the behaviour before this function existed. */
const CARD_BODY_BUDGET = 120;
const MIN_CARD_BODY = 24;
/* `keep: 1` keeps the full stop itself; the others cut before the mark. The
   sentence rule wants a capital after the stop so that an abbreviation
   mid-sentence ("e.g. the ...") is not read as the end of one. */
const HARD_CUTS: readonly { re: RegExp; keep: number }[] = [
  { re: /\.\s+[A-ZÇĞİÖŞÜ]/g, keep: 1 },
  { re: /: /g, keep: 0 },
  { re: /; /g, keep: 0 },
  { re: / - | — /g, keep: 0 },
];
const SOFT_CUTS = /, | veya | ya da | or /g;

function cutPoints(text: string, re: RegExp, keep: number): number[] {
  const out: number[] = [];
  re.lastIndex = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const at = m.index + keep;
    if (at >= MIN_CARD_BODY) out.push(at);
  }
  return out;
}

export function cardSummary(text: string): string {
  if (text.length <= CARD_BODY_BUDGET) return text;
  const hard: number[] = [];
  for (const { re, keep } of HARD_CUTS) hard.push(...cutPoints(text, re, keep));
  const fits = (points: number[]) => points.filter((p) => p <= CARD_BODY_BUDGET).sort((a, b) => b - a)[0];
  const hardFit = fits(hard);
  if (hardFit !== undefined) return text.slice(0, hardFit);
  const softFit = fits(cutPoints(text, SOFT_CUTS, 0));
  if (softFit !== undefined) return text.slice(0, softFit);
  const anyHard = hard.sort((a, b) => a - b)[0];
  return anyHard === undefined ? text : text.slice(0, anyHard);
}


/* Communication cards already show their channel in the card header. Repeating
   "Email:", "Push:" or a slash-separated channel list in the body made the
   canvas read like implementation shorthand instead of a journey someone
   could scan. Keep the node's full headline intact for the detail panel, but
   give the canvas a short practitioner-facing sentence. */
const ACTION_CARD_COPY: Partial<Record<Lang, Record<string, string>>> = {
  tr: {
    "100 TL kazandın + ödül kodu": "Kazanılan 100 TL ödülü ve kullanım kodunu göster.",
    "Teşekkür + ilk kullanım bilgisi": "Teşekkür et ve ilk kullanım bilgisini paylaş.",
    "Hoş geldin + mevcut seviye veya puan + nasıl kazanılır + ilk ödül": "Mevcut puanı, nasıl puan kazanıldığını ve ilk ödül yolunu anlat.",
    "İlk puanı kazanmak için son hatırlatma": "İlk puanı kazanmak için son bir fırsat göster.",
    "Ödül + nasıl kullanılır + son kullanma tarihi": "Ödülü, kullanım şeklini ve varsa son tarihi göster.",
    "İade onayı + tutar + işlem bilgisi": "İadenin onaylandığını, tutarı ve beklenen işlem süresini paylaş.",
    "Son geri dönüş teklifi": "Geri dönmek için son teklifi göster.",
    "Ürünü daha detaylı anlat; nasıl çalışır, kimler için uygun, faydaları": "Ürünün nasıl çalıştığını, kimler için uygun olduğunu ve faydalarını anlat.",
    "Son hatırlatma": "İlgi devam ediyorsa son kez hatırlat.",
    "Kaldığın yerden devam et + güncel teklif / ürün gelişmesi": "Kaldığı yerden devam etmesini sağla; güncel teklif veya ürün değişikliğini göster.",
    "İlgi alanına göre kullanım senaryosu / fayda anlat": "İlgilendiği konuya uygun kullanım senaryosunu ve faydayı anlat.",
    "Sınırlı süreli ilk alışveriş indirimi / geri dönüş teşviki": "Sınırlı süreli ilk alışveriş avantajını göster.",
    "Ödeme gecikmesi + ek sürenin biteceği tarih": "Ödeme gecikmesini ve ek sürenin biteceği tarihi açıkça belirt.",
    "Erişimi kısıtla; e-posta + push ile nedeni ve geri açma yolunu bildir": "Erişimi kısıtla; nedenini ve yeniden açmak için gereken adımı bildir.",
    "İptal onayı + erişimin biteceği tarih": "İptali onayla ve erişimin sona ereceği tarihi göster.",
    "Geri dönüş indirimi / kuponu": "Yeniden başlamak için geri dönüş avantajını göster.",
    "Özür + yeni teslimat tarihi": "Gecikme için özür dile ve yeni teslimat tarihini paylaş.",
    "Yeniden planlama veya alternatif için son hatırlatma": "Yeni teslimat zamanı veya alternatif teslimat seçeneğini son kez hatırlat.",
    "Kaydettiğin ürün + ilgili alternatifler": "Kaydedilen ürünü ve ilgili alternatifleri göster.",
    "Sepettekiler + ödeme bağlantısı + güven unsurları": "Sepette kalan ürünleri, ödeme bağlantısını ve güven veren bilgileri göster.",
    "Sepettekiler + sepete dönüş bağlantısı": "Sepette kalan ürünleri ve sepete dönüş bağlantısını göster.",
    "Son, daha doğrudan sepet hatırlatması": "Yüksek değerli sepette son hatırlatmayı daha doğrudan yap.",
    "Ürün yeniden stokta; stok değişmeden incele": "Ürünün yeniden stokta olduğunu bildir ve ürüne doğrudan dönüş sağla.",
    "Daha kapsamlı yardım + canlı destek seçeneği": "Daha kapsamlı yardım ve canlı destek seçeneği sun.",
    "Risk sinyaline göre kişiselleştirilmiş değer hatırlatması": "Risk sinyaline göre kullanıcıya en ilgili değeri yeniden göster.",
    "Uyumlu alternatif / yeni versiyon öner": "Aynı ürün yoksa uyumlu alternatifi veya yeni versiyonu öner.",
    "Yenileme hatırlatması + uygun paket / fiyat seçenekleri": "Yenileme zamanını ve uygun paket seçeneklerini göster.",
    "Sınırlı süreli geri dönüş indirimi": "Geri dönüş için sınırlı süreli avantaj sun.",
    "İlk alışverişe göre ilgili bir sonraki satın alma teklifi": "İlk alışverişe göre ilgili ikinci satın alma teklifini göster.",
    "Teklif bitmeden son hatırlatma": "Teklif sona ermeden son kez hatırlat.",
    "Pazarlama sıklığını azalt; yalnızca önemli mesajları bırak": "Pazarlama sıklığını azalt ve yalnızca önemli iletişimleri sürdür.",
    "Tek bir son geri dönüş / değer kampanyası gönder": "Tek bir son geri dönüş kampanyası gönder.",
    "Puanlama / geri bildirim iste": "Deneyimi puanlamasını veya kısa geri bildirim vermesini iste.",
    "Teşekkür et; uygunsa yorum / referral fırsatına yönlendir": "Teşekkür et; uygunsa yorum veya arkadaş daveti adımına yönlendir.",
    "Öneriyi aldığını bildir ve ürün / insight havuzuna aktar": "Önerinin alındığını bildir ve ürün ekibine aktar.",
    "Hata bildirimini teknik destek / ürün ekibine aktar": "Hata bildirimini teknik destek veya ürün ekibine aktar.",
    "Sorumlu ekibi hatırlat / eskale et ve kaydı açık tut": "Sorumlu ekibe eskale et ve söz verilen aksiyon tamamlanana kadar kaydı açık tut.",
    "Teslimatında gecikme var + yeni tahmini tarih": "Gecikmeyi ve yeni tahmini teslimat tarihini bildir.",
    "Gecikme var; yeni tarih netleşince haber vereceğiz": "Gecikmeyi bildir; yeni tarih henüz belli değilse bunu açıkça söyle.",
    "Özür + yeni tarih + alternatif teslimat veya destek": "Özür dile; yeni tarihi ve alternatif teslimat veya destek seçeneklerini sun.",
    "İnsan desteğine / uzman ekibe eskale et": "Sorunu insan desteğine veya uzman ekibe aktar.",
    "Eksik bilgi / belgeyi tamamla": "Randevu öncesi eksik bilgi veya belgeyi tamamlat.",
    "Randevu tarihi, saati, konumu / bağlantısı": "Randevunun tarihini, saatini ve konum veya bağlantı bilgisini paylaş.",
    "Rezervasyon özeti + tutar + ödeme son tarihi + ödeme CTA'sı": "Rezervasyon özetini, tutarı ve ödeme son tarihini göster.",
    "Ödeme alındı; rezervasyon kesinleşti": "Ödemenin alındığını ve rezervasyonun kesinleştiğini bildir.",
    "Yenileme tarihi + yeni fiyat / paket + ödeme yöntemi": "Yenileme tarihini, yeni fiyatı veya paketi ve ödeme yöntemini göster.",
    "Eksik belgeler + yükleme adımları + son tarih": "Eksik belgeleri, nasıl yükleneceğini ve son tarihi göster.",
    "Son tarihten önce son hatırlatma": "Son tarihten önce eksik belgeyi son kez hatırlat.",
    "Doğum gününü / dönüm noktasını tanımlı faydayla birlikte kutla": "Doğum gününü veya dönüm noktasını tanımlı faydayla kutla.",
    "Son ödeme hatırlatması ve alternatif ödeme bağlantısı": "Ödemeyi tamamlamak için son hatırlatmayı ve alternatif ödeme bağlantısını paylaş.",
    "Son checkout hatırlatması": "Checkout'u tamamlamak için son kez hatırlat.",
    "Son randevu hatırlatması": "Randevuya kısa süre kaldığını son kez hatırlat.",
    "Son eksik hazırlık adımlarını bildir": "Randevu öncesi kalan son hazırlık adımlarını göster.",
    "Son yenileme hatırlatması": "Üyelik bitmeden önce yenilemeyi son kez hatırlat.",
  },
  en: {
    "100 TL reward earned + code": "Show the 100 TL reward and its redemption code.",
    "Thank you + first-use information": "Thank the customer and share the first-use information.",
    "Welcome + current tier or points + how to earn + first reward": "Show the current balance, how to earn and the path to the first reward.",
    "One last prompt to earn the first points": "Give one final prompt to earn the first points.",
    "Reward + how to use it + expiry date": "Show the reward, how to use it and its expiry when relevant.",
    "Refund approved + amount + expected processing information": "Confirm the refund, amount and expected processing time.",
    "Final return-to-shop offer": "Show the final reason to return and shop again.",
    "Explain how the product works, who it fits and the main benefits": "Explain how the product works, who it suits and the main benefits.",
    "Final reminder": "Send one final reminder while interest is still active.",
    "Continue where you left off + current offer / product update": "Help the user continue where they left off and show any relevant update.",
    "Relevant use case / benefit content": "Show a use case and benefit that match the user's interest.",
    "Limited first-purchase incentive / return offer": "Show a limited first-purchase incentive.",
    "Payment delay notice + grace-period end date": "Explain the overdue payment and the grace-period end date.",
    "Restrict access and send email / push explaining how to restore it": "Restrict access and explain why it happened and how to restore it.",
    "Cancellation confirmation + access end date": "Confirm cancellation and show the access end date.",
    "Come-back discount / coupon": "Show a return incentive for restarting the subscription.",
    "Apology + new delivery date": "Apologise for the delay and share the new delivery date.",
    "Final reminder to reschedule or choose an alternative": "Give one final chance to reschedule or choose an alternative.",
    "Saved product + relevant alternatives": "Show the saved product and relevant alternatives.",
    "Items + checkout link + delivery/payment reassurance": "Show the cart, checkout link and the information needed to continue confidently.",
    "Cart contents + return-to-cart link": "Show the cart contents and a direct return-to-cart link.",
    "Final direct cart reminder": "Use a more direct final reminder for a high-value cart.",
    "Back in stock — check it before availability changes": "Confirm that the product is back in stock and link straight to it.",
    "More complete help + live-support option": "Offer fuller guidance and a live-support option.",
    "Personalized value reminder based on the risk signal": "Re-surface the most relevant value based on the churn-risk signal.",
    "Show a compatible alternative / newer version": "Offer a compatible alternative or newer version when the original is unavailable.",
    "Repurchase reminder + useful pack/price options": "Show the replenishment timing and useful pack or price options.",
    "Limited return discount / win-back offer": "Offer a limited incentive to return.",
    "Relevant next-purchase offer based on the first order": "Show a relevant second-purchase offer based on the first order.",
    "Final reminder before the offer ends": "Send one final reminder before the offer ends.",
    "Reduce marketing frequency; keep important messages only": "Reduce marketing frequency and keep only important communication.",
    "Send one final return/value campaign": "Send one final return campaign.",
    "Ask for a rating / feedback": "Ask for a rating or a short piece of feedback.",
    "Thank the customer and route to review/referral only when appropriate": "Thank the customer and route to review or referral only when appropriate.",
    "Acknowledge the suggestion and route it to product insight": "Acknowledge the suggestion and route it to the product team.",
    "Route the bug report to technical support / product": "Route the bug report to technical support or product.",
    "Remind / escalate to the responsible team and keep the record open": "Escalate to the responsible team and keep the record open until the promised action is complete.",
    "Delivery is delayed + new estimated date": "Explain the delay and share the new estimated delivery date.",
    "Delivery is delayed; we will update you when the new date is clear": "Explain the delay and be clear when a new date is not known yet.",
    "Apology + new date + delivery alternatives / support": "Apologise, share the new date and offer delivery alternatives or support.",
    "Escalate to a person / specialist": "Escalate the issue to a person or specialist.",
    "Complete the missing information / document": "Complete missing information or documents before the appointment.",
    "Appointment date, time, location / link": "Share the appointment date, time and location or link.",
    "Reservation details + amount + payment deadline + pay CTA": "Show the reservation summary, amount and payment deadline.",
    "Payment received; reservation confirmed": "Confirm that payment was received and the reservation is secured.",
    "Renewal date + new price / plan + payment method": "Show the renewal date, new price or plan and the payment method.",
    "Missing documents + upload instructions + deadline": "Show which documents are missing, how to upload them and the deadline.",
    "There is something new in the product / feature you viewed": "Show what is new in the product or feature the user viewed.",
    "Final payment reminder and alternative-payment link": "Share a final payment reminder with an alternative payment link.",
    "Direct final checkout reminder": "Use a direct final reminder to complete checkout.",
    "Final checkout reminder": "Give one final prompt to complete checkout.",
    "Use a problem-specific retention action: offer, guidance, support, payment help or value reminder": "Use the intervention that matches the actual churn reason.",
    "Final replenishment reminder with direct link": "Give one final replenishment reminder with a direct purchase link.",
    "Final appointment reminder": "Remind the user that the appointment is approaching.",
    "Final renewal reminder": "Give one final renewal reminder before the subscription ends.",
    "Missing-document reminder": "Remind the user which required document is still missing.",
    "Final reminder before the deadline": "Give one final reminder before the document deadline.",
  },
};

function actionCardSummary(text: string, lang: Lang): string {
  const colon = text.indexOf(":");
  const lead = colon >= 0 ? text.slice(0, colon) : "";
  const withoutChannel =
    colon >= 0 && /(email|e-posta|push|sms|whatsapp|in-app)/i.test(lead)
      ? text.slice(colon + 1).trim()
      : text;
  const rewritten = ACTION_CARD_COPY[lang]?.[withoutChannel] ?? withoutChannel;
  return cardSummary(rewritten);
}

function waitLabel(node: FlowNode): string {
  const detail = node.detail;
  const value = detail ? WAIT_VALUE_RE.exec(detail) : null;
  if (value) return value[1].trim();
  /* NO CONFIGURED VALUE - and therefore no duration to name. 35 of the
     library's 81 waits carry a `Config.default` the line above reads; the
     other 46 are `required: true` with no default, because the honest
     length depends on the company's own product. The card used to print
     that Config's KEY in that case - `bounded_education.window`,
     `onboarding.step_interval` - which is a database-shaped string sitting
     where a duration should be, on 46 cards, in both locales, and exactly
     what "no canonical config keys on the canvas" forbids.

     The fall-through below was always the right answer for these and was
     simply unreachable: a wait's headline is `until <event>, or <event>…`,
     already localized and already the thing a reader needs when there is no
     number to show - what it is waiting FOR. "Until a nurture progression
     signal" is a true statement about the journey; the config key is a
     statement about the codebase. The key stays reachable in the detail
     panel, which renders `detail` in full. */
  return humanize(firstClause(node.headline));
}

/* A communication action's own real name, when its prose follows the
   corpus's own "Send the first/second <noun> reminder on the channel just
   selected, ..." idiom (EN) or "... ilk/ikinci <noun> hatırlatmasını
   gönder, ..." (TR, already-localized text - see WAIT_VALUE_RE's own
   comment on why this reads `node.headline` post-localization rather than
   adding a second raw field). Pattern-matched against the sentence
   structure, not any one journey's node id, so it applies to every future
   action authored the same way and falls back to the generic kind label +
   sequence, unchanged, wherever the pattern does not match. */
const ACTION_TITLE_EN_RE = /^Send (?:the )?(?:first|second|third|fourth|next)?\s*(.+?)\s+on the channel\b/i;
const ACTION_TITLE_TR_RE = /(?:ilk|ikinci|üçüncü|dördüncü)\s+(\S+)\s+hatırlatmasını\s+gönder/i;

/* Fallback tier 2: most of the corpus does not phrase a send action as
   "Send the X reminder..." (that idiom is this session's own, used only on
   the two journeys it authored) - it describes what the message SAYS or
   SHOWS in free prose with no consistent extractable noun. `Touch.stage`
   (orchestration.touches, vNext) is authored, structured data instead:
   the practitioner's own short name for this step in the send cascade
   ("initial-recovery", "follow-up", "final-notice"), found by the touch's
   own `action` reference back to this node - not a guess from sentence
   shape. EN humanizes the key directly (a hyphenated English identifier
   reads fine split into words); TR needs real translation, since the key
   itself is always English - this table is that translation, covering
   every stage value the customer-library surface actually uses (closed,
   generated by inspecting the corpus, not invented). A stage outside this
   table (only possible on a non-library public journey) falls through to
   the generic kind label, same as a journey with no orchestration at all. */
const TOUCH_STAGE_TR: Readonly<Record<string, string>> = {
  "accept-request": "Talebi kabul et", "acknowledge": "Bilgilendirme", "acknowledge-review": "İnceleme bildirimi",
  "acknowledgement": "Onay bildirimi", "action-prompt": "Aksiyon hatırlatması", "active": "Aktif bildirim",
  "alert": "Uyarı", "alternative-offer": "Alternatif teklif", "approve": "Onay",
  "arrived": "Varış bildirimi", "ask": "Soru", "ask-heavy": "Detaylı soru",
  "ask-light": "Kısa soru", "assign": "Atama bildirimi", "assisted": "Destekli yönlendirme",
  "at-risk-notice": "Risk bildirimi", "at-the-wall": "Son aşama bildirimi", "attempt": "Deneme bildirimi",
  "availability-alert": "Erişilebilirlik uyarısı",
  "behaviour-nudge": "Davranış hatırlatması", "brief": "Özet bilgilendirme", "challenge": "Doğrulama isteği",
  "cleared": "Temizlendi bildirimi", "closed-full": "Tam kapanış bildirimi", "closed-partial": "Kısmi kapanış bildirimi",
  "communicate": "Bilgilendirme", "communicate-outcome": "Sonuç bildirimi", "confirm": "Onay",
  "confirm-accept": "Kabul onayı", "confirm-closure": "Kapanış onayı", "confirm-decline": "Red onayı",
  "confirmation": "Onay", "confirmation-ask": "Onay isteği", "confirmation-request": "Onay talebi",
  "correct": "Düzeltme", "correct-distribution": "Dağıtım düzeltmesi", "correctable": "Düzeltilebilir bildirim",
  "corrective-request": "Düzeltme talebi", "decision-request": "Karar talebi", "decline": "Red bildirimi",
  "delay-update": "Gecikme güncellemesi", "deliver": "Teslimat bildirimi", "dependency-hold": "Bağımlılık bekleme bildirimi", "dispatch": "Sevkiyat bildirimi",
  "distribute": "Dağıtım bildirimi", "educate": "Bilgilendirme", "educate-again": "İkinci bilgilendirme", "ending": "Sonlanma bildirimi",
  "expired": "Süresi doldu bildirimi", "expiry-notice": "Son kullanma bildirimi", "explain": "Açıklama", "explain-terminal": "Sonlanma açıklaması",
  "final": "Son bildirim", "final-notice": "Son uyarı", "first-touch": "İlk temas",
  "fix-auth": "Yetkilendirme düzeltmesi", "fix-capability": "Yetenek düzeltmesi", "fix-scope": "Kapsam düzeltmesi",
  "follow-up": "Takip bildirimi", "followup": "Takip bildirimi", "generic": "Bildirim",
  "in-force-actionable": "Yürürlükte, aksiyon gerekli", "in-force-standing": "Yürürlükte bildirim", "inform": "Bilgilendirme",
  "inform-hold": "Bekletme bilgilendirmesi", "inform-only": "Yalnızca bilgilendirme", "informational-notice": "Bilgilendirme notu",
  "initial-recovery": "İlk kurtarma hatırlatması", "initial-reminder": "İlk hatırlatma", "invitation": "Davet", "invite-known": "Bilinen kişiye davet",
  "invite-new": "Yeni davet", "issue": "Sorun bildirimi", "lapse": "Sona erme bildirimi",
  "last-call": "Son çağrı", "lead-prompt": "Potansiyel müşteri hatırlatması", "lost": "Kayıp bildirimi",
  "name-blocker": "Engel bildirimi", "next-action": "Sıradaki aksiyon", "next-step": "Sıradaki adım",
  "no-arrival": "Varış olmadı bildirimi", "no-choice-update": "Seçim yapılmadı güncellemesi", "no-remedy": "Çözüm yok bildirimi",
  "no-route": "Yönlendirme yok bildirimi", "notify": "Bildirim", "notify-authorization": "Yetkilendirme bildirimi",
  "notify-blocked-party": "Engellenen taraf bildirimi", "notify-cannot-close": "Kapatılamıyor bildirimi", "notify-provider-cancel": "Sağlayıcı iptali bildirimi",
  "notify-quiet": "Sessiz bildirim", "notify-rejection": "Red bildirimi", "notify-restricted": "Kısıtlama bildirimi",
  "notify-unauthorized": "Yetkisiz erişim bildirimi", "nurture": "Besleme mesajı", "offer": "Teklif",
  "offer-alternate": "Alternatif teklif", "offer-holder": "Hak sahibine teklif", "offer-route": "Yönlendirme teklifi",
  "offer-self": "Kendi kendine teklif", "overdue": "Gecikme bildirimi", "owner-task": "Sahip görevi",
  "partial": "Kısmi bildirim", "prerequisite-prompt": "Ön koşul hatırlatması", "present": "Sunum",
  "prompt-email": "E-posta hatırlatması", "prompt-in-app": "Uygulama içi hatırlatma", "prompt-sms": "SMS hatırlatması", "ready": "Hazır bildirimi",
  "reapply": "Yeniden başvuru", "reason-ask": "Neden sorgusu", "rebooking-offer": "Yeniden rezervasyon teklifi",
  "received": "Alındı bildirimi", "recognition": "Takdir bildirimi", "recovery": "Kurtarma hatırlatması",
  "reject": "Red", "reject-scope": "Kapsam reddi", "remedy-confirmed": "Çözüm onayı", "remind": "Hatırlatma",
  "remind-final": "Son hatırlatma", "reminder": "Hatırlatma", "renew": "Yenileme", "reoffer": "Yeniden teklif",
  "replace": "Değiştirme", "replacement-notice": "Değişiklik bildirimi", "requalify": "Yeniden yeterlilik",
  "request": "Talep", "request-internal": "İç talep", "request-more": "Ek bilgi talebi",
  "request-more-info": "Ek bilgi talebi", "required-notice": "Zorunlu bildirim", "reset": "Sıfırlama bildirimi",
  "resolution": "Çözüm bildirimi", "restored": "Geri yüklendi bildirimi", "review": "İnceleme",
  "revised-window": "Revize pencere bildirimi",
  "risk-check-in": "Risk kontrol mesajı",
  "route-dependency": "Yönlendirme bağımlılığı", "routing": "Yönlendirme",
  "second-reminder": "İkinci hatırlatma", "second-reminder-high-value": "Yüksek değerli ikinci hatırlatma",
  "signature-request": "İmza talebi",
  "specific-action": "Özel aksiyon", "surface": "Görünür kılma", "total": "Toplam bildirim",
  "unverified": "Doğrulanmadı bildirimi", "verify": "Doğrulama", "waitlist": "Bekleme listesi",
  "withdrawn": "Geri çekildi bildirimi",
};

function stageTitle(stage: string, lang: Lang): string | null {
  if (lang === "tr") return TOUCH_STAGE_TR[stage] ?? null;
  return humanize(stage.replace(/-/g, " "));
}

function actionTitle(node: FlowNode, lang: Lang): string | null {
  if (lang === "tr") {
    const m = ACTION_TITLE_TR_RE.exec(node.headline);
    if (m) return `${humanize(m[1])} hatırlatması`;
  } else {
    const m = ACTION_TITLE_EN_RE.exec(node.headline);
    if (m) return humanize(m[1]);
  }
  return node.touchStage ? stageTitle(node.touchStage, lang) : null;
}

/** The channel row: plain pills by default, and a labelled "Primary" /
    "Fallback" pair (or longer chain) ONLY where the journey backs that
    claim - never a bare arrow either, which "Push → Email" alone read as
    two channels a message goes out on in sequence rather than as "try
    Push, and only if it fails, Email" (2026-09-19 feedback: the
    arrow-only chip was genuinely ambiguous).

    `ranked` decides which of those two this row is. It must be true only
    when the groups it is given really are a tried-in-order cascade:
    - a single group is never ranked - one channel, or one role's set of
      alternates, is not a priority relative to anything else, and a lone
      "Primary" row asserted a cascade of one (2026-09-21 fix: this is
      what put `Primary: Task` on an internal owner-task card, and
      `Primary: Email` on every single-channel journey in the corpus).
    - two or more groups are ranked only when the journey's own
      `channelStrategy.fallback` is `"next-eligible-role"` - the one
      value that means the roles `channelPlan` lists are actually tried
      in that order. `"same-role-other-channel"` describes delivery
      recovery inside ONE role, never a cascade between the roles this
      row is showing, and `"none"` or an absent value backs no ordering
      claim at all. Callers that already know their own priority list is
      a genuine resolved cascade (`RouterCard`, over an actual router
      node's own sequential logic) pass `ranked` themselves instead of
      deriving it from `channelStrategy.fallback`.

    Un-ranked, multi-group rows still stack one row per group (a role can
    carry more than one channel - "low-friction" is push AND in-app, both
    pills on that one row) but carry no rank word at all, so nothing on
    the card claims an order the data does not. */
function ChannelPriorityRow({ groups, lang, ranked }: { groups: readonly (readonly ChannelId[])[]; lang: Lang; ranked: boolean }) {
  const w = CARD_TEXT[lang];
  const showRank = ranked && groups.length >= 2;
  return (
    <div className="mt-2.5 flex flex-col gap-1 [[data-lod=far]_&]:hidden">
      {groups.map((ids, i) => (
        <span key={ids.join("+")} className="flex items-center gap-2">
          {showRank ? (
            <span className="w-[62px] shrink-0 text-[11px] text-ink-400">{i === 0 ? w.primary : w.fallback}</span>
          ) : null}
          <span className="flex flex-wrap gap-1">
            {ids.map((id) => (
              <span key={id} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CHANNEL_HUE[id].pill}`}>
                {CHANNEL_LABEL[id][lang]}
              </span>
            ))}
          </span>
        </span>
      ))}
    </div>
  );
}

const KIND = {
  message: { tile: "bg-primary-50 text-primary-700", ink: "text-primary-700" },
  human: { tile: "bg-amber-50 text-amber-700", ink: "text-amber-700" },
  internal: { tile: "bg-paper-soft text-ink-600", ink: "text-ink-600" },
  router: { tile: "bg-cyan-50 text-cyan-700", ink: "text-cyan-700" },
  condition: { tile: "bg-violet-50 text-violet-700", ink: "text-violet-700" },
  wait: { tile: "bg-teal-50 text-teal-700", ink: "text-teal-700" },
  handoff: { tile: "bg-indigo-50 text-indigo-700", ink: "text-indigo-700" },
  outcome: { tile: "bg-emerald-50 text-emerald-700", ink: "text-emerald-700" },
  exit: { tile: "bg-paper-soft text-ink-500", ink: "text-ink-500" },
} as const;

type Kind = (typeof KIND)[keyof typeof KIND];

const CHANNEL_CARD_ACCENT: Record<ChannelId, string> = {
  email: "border-t-violet-500",
  push: "border-t-sky-500",
  sms: "border-t-teal-500",
  "in-app": "border-t-amber-500",
  whatsapp: "border-t-emerald-500",
  sales: "border-t-rose-500",
  task: "border-t-orange-500",
};

function ChannelGlyph({ id }: { id: ChannelId }) {
  if (id === "email") return <Mail aria-hidden />;
  if (id === "push") return <Bell aria-hidden />;
  if (id === "sms") return <MessageSquareText aria-hidden />;
  if (id === "in-app") return <Smartphone aria-hidden />;
  if (id === "whatsapp") return <MessageCircle aria-hidden />;
  return <UserRound aria-hidden />;
}

function uniqueChannels(groups: readonly (readonly ChannelId[])[], routes: readonly { id: ChannelId }[]): ChannelId[] {
  const source = groups.length ? groups.flat() : routes.map((r) => r.id);
  return [...new Set(source)];
}

/** The trigger's evidence-source pill (SignalSource is a closed 4-value
    enum, not canonical free prose) - a small bilingual lookup, same shape
    as CARD_TEXT below, not per-journey content. */
const SIGNAL_SOURCE_LABEL: Record<Lang, Record<SignalSource, string>> = {
  en: { authoritative: "Authoritative", declared: "Declared", behavioral: "Behavioral", inferred: "Inferred" },
  tr: { authoritative: "Yetkili kaynak", declared: "Beyan edilen", behavioral: "Davranışsal", inferred: "Çıkarımsal" },
};

const CARD_TEXT = {
  en: {
    trigger: "Trigger",
    decision: "Decision",
    wait: "Wait",
    handoff: "Handoff",
    outcome: "Outcome",
    exit: "Exit",
    external: "External",
    internal: "Internal",
    message: "Message",
    human: "Human",
    internalAction: "Internal",
    channelSelection: "Channel selection",
    primary: "Primary",
    fallback: "Fallback",
  },
  tr: {
    trigger: "Trigger",
    decision: "Karar",
    wait: "Bekleme",
    handoff: "Handoff",
    outcome: "Sonuç",
    exit: "Çıkış",
    external: "Dış",
    internal: "İç",
    message: "Mesaj",
    human: "İnsan",
    internalAction: "İç işlem",
    channelSelection: "Kanal seçimi",
    primary: "Öncelikli",
    fallback: "Fallback",
  },
} as const;

function Shell({
  children,
  className = "",
  onClick,
  ariaLabel,
  fit = false,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel: string;
  /** Wait is the one capsule: it shrinks to its own content. */
  fit?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`block h-full cursor-pointer text-left transition-[box-shadow,transform] duration-[var(--duration-fast)] hover:-translate-y-px hover:shadow-[0_10px_24px_-12px_rgb(10_16_32/0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
        fit ? "mx-auto w-fit" : "w-full"
      } ${className}`}
    >
      {children}
    </button>
  );
}

const CARD = "rounded-2xl bg-paper px-3.5 py-3 ring-1 ring-ink-950/[0.08] shadow-[0_1px_2px_rgb(10_16_32/0.04)]";
const FAR = {
  message: "[[data-lod=far]_&]:bg-primary-200 [[data-lod=far]_&]:ring-primary-300",
  human: "[[data-lod=far]_&]:bg-amber-200 [[data-lod=far]_&]:ring-amber-300",
  internal: "[[data-lod=far]_&]:bg-neutral-200 [[data-lod=far]_&]:ring-neutral-300",
  router: "[[data-lod=far]_&]:bg-cyan-200 [[data-lod=far]_&]:ring-cyan-300",
  condition: "[[data-lod=far]_&]:bg-violet-200 [[data-lod=far]_&]:ring-violet-300",
  handoff: "[[data-lod=far]_&]:bg-indigo-200 [[data-lod=far]_&]:ring-indigo-300",
  outcome: "[[data-lod=far]_&]:bg-emerald-200 [[data-lod=far]_&]:ring-emerald-300",
} as const;

/* At a far zoom (the world's `data-lod="far"`, under 45%) a card gives up
   its words and becomes its icon: the tile grows to fill the card's top
   and the sentence, the pills and the kind label hide, so a zoomed-out
   journey reads as a diagram of coloured glyphs instead of specks. */
function Tile({ kind, children, className = "" }: { kind: Kind | { tile: string; ink: string }; children: ReactNode; className?: string }) {
  return (
    <span aria-hidden className={`grid size-6 shrink-0 place-items-center rounded-lg ${kind.tile} [&>svg]:size-3.5 [[data-lod=far]_&]:size-20 [[data-lod=far]_&]:rounded-3xl [[data-lod=far]_&]:bg-white/70 [[data-lod=far]_&]:[&>svg]:size-10 ${className}`}>
      {children}
    </span>
  );
}

function KindRow({ kind, icon, children }: { kind: Kind; icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <Tile kind={kind}>{icon}</Tile>
      <span className={`text-xs font-medium ${kind.ink} [[data-lod=far]_&]:hidden`}>{children}</span>
    </span>
  );
}

function Pill({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
        onDark ? "bg-white/15 text-white/85" : "bg-paper-soft text-ink-600"
      }`}
    >
      {children}
    </span>
  );
}

/* Trigger: the one filled card, brand blue. The Entry pin stands on its
   top edge in ink, so the start reads before anything else. */
export function TriggerCard({ node, onOpen, entryLabel, lang = "en" }: { node: FlowNode; onOpen: () => void; entryLabel: string; lang?: Lang }) {
  const w = CARD_TEXT[lang];
  return (
    <div className="relative h-full w-full">
      {node.isEntry ? (
        <span className="absolute -top-3.5 left-3 z-10 flex origin-bottom-left items-center gap-1 rounded-full bg-ink-950 px-2.5 py-1 text-xs font-semibold text-white shadow-[0_6px_16px_-8px_rgb(10_16_32/0.6)] ring-2 ring-paper [[data-lod=far]_&]:scale-[2.4]">
          <Zap aria-hidden className="size-3" />
          {entryLabel}
        </span>
      ) : null}
      <Shell onClick={onOpen} ariaLabel={node.headline} className="rounded-2xl bg-ink-950 px-3.5 py-3 text-white ring-1 ring-ink-900/70 shadow-[0_12px_28px_-16px_rgb(10_16_32/0.65)]">
        <span className="flex items-center gap-2">
          <Tile kind={{ tile: "bg-white/15 text-white", ink: "" }}>
            <Zap aria-hidden />
          </Tile>
          <span className="text-xs font-medium text-white/85 [[data-lod=far]_&]:hidden">{w.trigger}</span>
        </span>
        <p className="mt-2 line-clamp-2 text-[13.5px] leading-snug font-medium [[data-lod=far]_&]:hidden">{humanize(cardSummary(node.headline))}</p>
        {node.detail ? (
          <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-white/70 [[data-lod=far]_&]:hidden">{node.detail}</p>
        ) : null}
        {node.evidenceSource ? (
          <span className="mt-2 flex [[data-lod=far]_&]:hidden">
            <Pill onDark>{SIGNAL_SOURCE_LABEL[lang][node.evidenceSource]}</Pill>
          </span>
        ) : null}
      </Shell>
    </div>
  );
}

export function HandoffCard({ node, onOpen, lang = "en" }: { node: FlowNode; onOpen: () => void; lang?: Lang }) {
  const w = CARD_TEXT[lang];
  return (
    <Shell
      onClick={onOpen}
      ariaLabel={node.headline}
      fit
      className="flex max-w-[252px] items-center gap-2 rounded-full bg-indigo-50/60 py-1.5 pr-3 pl-1.5 ring-1 ring-indigo-200 shadow-[0_1px_2px_rgb(10_16_32/0.04)]"
    >
      <Tile kind={KIND.handoff}><ArrowRightLeft aria-hidden /></Tile>
      <span className="line-clamp-1 text-[12.5px] font-medium text-indigo-800 [[data-lod=far]_&]:hidden">{cardSummary(node.headline)}</span>
      {node.external ? <span className="text-[10px] text-indigo-500 [[data-lod=far]_&]:hidden">{w.external}</span> : null}
    </Shell>
  );
}

export function OutcomeCard({ node, onOpen }: { node: FlowNode; onOpen: () => void; lang?: Lang }) {
  return (
    <Shell
      onClick={onOpen}
      ariaLabel={node.headline}
      fit
      className="flex max-w-[244px] items-center gap-2 rounded-full bg-emerald-50/70 py-1.5 pr-3 pl-1.5 ring-1 ring-emerald-200"
    >
      <Tile kind={KIND.outcome}><Flag aria-hidden /></Tile>
      <span className="line-clamp-1 text-[12.5px] font-medium text-emerald-800 [[data-lod=far]_&]:hidden">{cardSummary(node.headline)}</span>
    </Shell>
  );
}

/* Exit: a small terminal capsule, the same "fit" sizing Wait already uses
   (Shell's `fit` prop) rather than a card sized like an action - a journey
   ends in a word, not a paragraph, and `splitExitState` (canonical-view.ts)
   already keeps that word short. Dashed, at rest, for every ending except
   a successful one, which reads instead of just stops: a filled check tile
   in the same emerald the Outcome card already uses elsewhere in this file
   (no new color introduced). Driven by the exit's own authored `class`
   (see FlowNode.exitClass) - never a guess from its headline text - and
   every other class (timeout, invalid-state, no-action, ...) keeps
   exactly the prior, undifferentiated capsule. */
export function ExitCard({ node, onOpen, terminalLabel }: { node: FlowNode; onOpen: () => void; terminalLabel: string; lang?: Lang }) {
  const success = node.exitClass === "success";
  return (
    <Shell
      onClick={onOpen}
      ariaLabel={node.headline}
      fit
      className={`flex max-w-[220px] items-center gap-1.5 rounded-full border border-dashed py-1.5 pr-3 pl-1.5 ${
        success ? "border-emerald-200 bg-emerald-50/40 [[data-lod=far]_&]:bg-emerald-100" : "border-ink-300 bg-paper/70 [[data-lod=far]_&]:bg-neutral-100"
      }`}
    >
      <Tile kind={success ? KIND.outcome : KIND.exit} className="size-5">
        {success ? <CheckCircle2 aria-hidden /> : <LogOut aria-hidden />}
      </Tile>
      {/* No line-clamp here on purpose: `line-clamp` establishes a
          `-webkit-box` that does not size predictably inside a `w-fit`
          flex shell (verified - it truncated a longer TR exit headline to
          "Checkout..." well before the pill's own max-width). That still
          holds, so the budget is applied in STRING space instead, where the
          flex shell has no opinion: `cardSummary` cuts at the sentence's own
          boundary, the same rule every other card body uses.

          It catches only the genuinely long ones. `splitExitState` bounds
          clause count, not length, so nothing stopped a run-on exit state
          reaching the capsule - but most of the overflow measured across
          the 51 was shorter than the shared budget and wrapped on WIDTH
          instead, which a string budget cannot fix. That half is handled by
          the slot: SIZE.exit is 68, the measured worst case. */}
      <span className={`text-[13px] leading-snug font-medium [[data-lod=far]_&]:hidden ${success ? "text-emerald-700" : "text-ink-600"}`}>
        {cardSummary(node.headline)}
      </span>
      {node.terminal ? <Pill>{terminalLabel}</Pill> : null}
    </Shell>
  );
}

/* A channel-selecting action with no matching successor to collapse into
   (journey-canvas-layout.ts's display graph absorbs the ordinary case -
   see its own comment - so this is the rare/defensive path: some other
   corpus shape where a router isn't immediately followed by the send it
   selects for). Reads as a routing step, not a paragraph of permission
   rules - the priority-with-fallback IS the card; the full prose stays
   one click away in the detail panel, unchanged there. */
function RouterCard({ node, onOpen, priority, lang }: { node: FlowNode; onOpen: () => void; priority: readonly ChannelId[]; lang: Lang }) {
  const w = CARD_TEXT[lang];
  return (
    <Shell onClick={onOpen} ariaLabel={node.headline} fit className="flex max-w-[264px] items-center gap-2 rounded-full bg-paper px-2.5 py-2 ring-1 ring-cyan-200 shadow-[0_1px_2px_rgb(10_16_32/0.04)]">
      <Tile kind={KIND.router}><Route aria-hidden /></Tile>
      <span className="text-[12px] font-medium text-ink-600 [[data-lod=far]_&]:hidden">{w.channelSelection}</span>
      <span className="flex items-center gap-1 [[data-lod=far]_&]:hidden">
        {priority.map((id, i) => (
          <span key={id} className="flex items-center gap-1">
            {i > 0 ? <span className="text-[11px] text-ink-300">→</span> : null}
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CHANNEL_HUE[id].pill}`}>
              {CHANNEL_LABEL[id][lang]}
            </span>
          </span>
        ))}
      </span>
    </Shell>
  );
}

/* Communication and human actions - a journey builder's own message card:
   an icon, the action's real name, a ONE-LINE preview of what it says, and
   the channel(s) it goes out on.

   The preview is new (2026-09-20). This card previously carried no body text
   at all, on the reasoning that a paragraph belongs in the detail panel -
   correct about paragraphs, wrong about the card: it left every one of the
   122 message cards in the library saying only "Follow-up" or "Reminder"
   and a channel pill, so the canvas could tell you a message went out but
   never what it said. A lifecycle builder's message card shows a line of the
   message ("SMS #1 / Your cart is waiting…"), and that is the one thing a
   reader is actually scanning the canvas for.

   It stays a PREVIEW, not the copy: `cardSummary` cuts at the sentence's own
   first boundary inside the shared card budget and the clamp holds it to one
   line, with the full canonical sentence one click away in the detail panel,
   never paraphrased there. Still no sequence number (nothing left on the
   card needs one to stay distinct; the node's own id does that job in the
   panel). `priority`
   is usually inherited from a channel-selecting action the display graph
   collapsed into this same card (journey-canvas-layout.ts) - the router's
   own full logic is still one click away too, surfaced in the panel under
   its own "Routing logic" section (NodeDetailPanel's `collapsedRouter`). */
function HumanActionCard({ node, onOpen, humanLabels, lang = "en" }: {
  node: FlowNode;
  onOpen: () => void;
  humanLabels: readonly { id: ChannelId; label: string }[];
  lang?: Lang;
}) {
  const title = humanLabels.length
    ? humanLabels.map((r) => r.label).join(" / ")
    : CARD_TEXT[lang].human;
  return (
    <Shell
      onClick={onOpen}
      ariaLabel={node.headline}
      fit
      className="flex max-w-[268px] items-center gap-2 rounded-full bg-amber-50/70 py-1.5 pr-3 pl-1.5 ring-1 ring-amber-200 shadow-[0_1px_2px_rgb(10_16_32/0.04)]"
    >
      <Tile kind={KIND.human}><UserRound aria-hidden /></Tile>
      <span className="shrink-0 text-[12px] font-semibold text-amber-800 [[data-lod=far]_&]:hidden">{title}</span>
      <span className="line-clamp-1 text-[11.5px] text-ink-500 [[data-lod=far]_&]:hidden">{actionCardSummary(node.headline, lang)}</span>
    </Shell>
  );
}

export function CommunicationCard({ node, onOpen, messageLabels, humanLabels, lang = "en" }: {
  node: FlowNode;
  onOpen: () => void;
  lang?: Lang;
  messageLabels: readonly { id: ChannelId; label: string }[];
  humanLabels: readonly { id: ChannelId; label: string }[];
}) {
  const w = CARD_TEXT[lang];
  const routes = messageLabels;
  const plan = node.channelPlan;
  const priority = node.channelPriority;
  const groups: readonly (readonly ChannelId[])[] = plan?.length
    ? plan.map((r) => r.channels)
    : priority?.length
      ? [priority]
      : [];

  const channels = uniqueChannels(groups, routes);
  const firstChannel = channels[0] ?? null;
  const stage = actionTitle(node, lang);
  const simultaneous = node.channelStrategySimultaneous === true;
  const channelTitle = channels.length
    ? channels.map((id) => CHANNEL_LABEL[id][lang]).join(simultaneous ? " + " : " / ")
    : stage ?? w.message;
  const accent = firstChannel ? CHANNEL_CARD_ACCENT[firstChannel] : "border-t-ink-300";
  const tileKind = firstChannel ? { tile: CHANNEL_HUE[firstChannel].tile, ink: "" } : KIND.message;

  return (
    <Shell
      onClick={onOpen}
      ariaLabel={node.headline}
      className={`${CARD} ${FAR.message} border-t-[3px] ${accent} py-2.5`}
    >
      <span className="flex items-center gap-2">
        <Tile kind={tileKind}>
          {firstChannel ? <ChannelGlyph id={firstChannel} /> : <Mail aria-hidden />}
        </Tile>
        <span className="min-w-0 flex-1 text-[14px] leading-snug font-semibold text-ink-950 [[data-lod=far]_&]:hidden">
          {channelTitle}
        </span>
        {stage && stage !== channelTitle ? (
          <span className="max-w-[108px] truncate text-right text-[11px] font-medium text-ink-400 [[data-lod=far]_&]:hidden">{stage}</span>
        ) : null}
      </span>
      <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-ink-700 [[data-lod=far]_&]:hidden">{actionCardSummary(node.headline, lang)}</p>
    </Shell>
  );
}

/* A plain internal action - state or data work with no outward effect
   (`ActionNode.execution` unset) that isn't a channel-selecting router
   either: a kind label and its own sentence clamped short.

   The `Internal · 03` counter is gone (2026-09-20). It existed because these
   cards once had nothing else to tell them apart, and that stopped being
   true twice over: `cardSummary` now puts the action's own sentence on the
   card, and the bookkeeping absorption means the only internal actions still
   drawn are the 14 that write real state - each one a distinct, nameable
   step. What was left was an implementation counter on a customer-journey
   canvas, which is what "no sequence numbers" forbids. ConditionCard dropped
   its branch count for exactly this reason; this is the same removal. */
export function ActionCard({ node, onOpen, messageLabels, humanLabels, lang = "en" }: {
  node: FlowNode;
  onOpen: () => void;
  lang?: Lang;
  messageLabels: readonly { id: ChannelId; label: string }[];
  humanLabels: readonly { id: ChannelId; label: string }[];
}) {
  const w = CARD_TEXT[lang];
  // Execution decides the card FIRST: a communication/human action also
  // carries `channelPriority` once it inherits one from a collapsed router
  // (canonical-view.ts), so checking priority before execution would catch
  // the message too and mislabel it a router. Only a plain action (no
  // execution) with a self-detected priority is an actual, undrawn router -
  // the rare case journey-canvas-layout.ts's collapse did not absorb.
  if (node.execution === "communication") {
    return <CommunicationCard node={node} onOpen={onOpen} messageLabels={messageLabels} humanLabels={humanLabels} lang={lang} />;
  }
  if (node.execution === "human") {
    return <HumanActionCard node={node} onOpen={onOpen} humanLabels={humanLabels} lang={lang} />;
  }
  const priority = node.channelPriority;
  if (priority && priority.length >= 2) return <RouterCard node={node} onOpen={onOpen} priority={priority} lang={lang} />;
  /* A plain internal action whose own write IS a declared suppression - the
     corpus's `*_suppression` field convention (`marketing_suppression` is
     the one live instance today, CON-300's `a.suppress`) - is this
     journey's declared end state, not bookkeeping on the way to one.
     `absorbableBookkeeping` (journey-canvas-layout.ts) already keeps it
     from being folded into its host card because its write is real, not
     journal-only; what was still missing is the card KIND itself, which
     defaulted to the generic "Internal" cog regardless. Read off the
     authored field name, never a journey or node id, so a future second
     writer of a different `*_suppression` field renders the same way with
     no code change here. */
  const isDeclaredSuppression = (node.writesFields ?? []).some((f) => f.endsWith("_suppression"));
  if (isDeclaredSuppression) {
    return (
      <Shell onClick={onOpen} ariaLabel={node.headline} className={`${CARD} ${FAR.outcome}`}>
        <KindRow kind={KIND.outcome} icon={<Flag aria-hidden />}>
          {w.outcome}
        </KindRow>
        <p className="mt-2 line-clamp-2 text-[13.5px] leading-snug text-ink-950 [[data-lod=far]_&]:hidden">{cardSummary(node.headline)}</p>
      </Shell>
    );
  }
  return (
    <Shell
      onClick={onOpen}
      ariaLabel={node.headline}
      fit
      className="flex max-w-[252px] items-center gap-2 rounded-full bg-paper-soft py-1.5 pr-3 pl-1.5 ring-1 ring-line-soft"
    >
      <Tile kind={KIND.internal}><Cog aria-hidden /></Tile>
      <span className="line-clamp-1 text-[12px] font-medium text-ink-600 [[data-lod=far]_&]:hidden">{cardSummary(node.headline)}</span>
    </Shell>
  );
}

export function ConditionCard({
  node,
  waitNode,
  repeatCheck,
  onOpen,
}: {
  node: FlowNode;
  waitNode?: FlowNode;
  /** journey-canvas-layout.ts's `repeatedChecks()`: this condition asks the
      same question as another one elsewhere in the journey - a re-check a
      cascade makes at a later stage. Drawn as a small position/total tag so
      a reader recognizes it as a repeat rather than re-reading the question
      to work that out. Numbers only, no words - reads the same in TR/EN. */
  repeatCheck?: { position: number; total: number };
  onOpen: () => void;
  lang?: Lang;
}) {
  return (
    <Shell
      onClick={onOpen}
      ariaLabel={node.headline}
      fit
      className="max-w-[280px] rounded-2xl bg-emerald-50/80 px-3 py-2 ring-1 ring-emerald-200 shadow-[0_1px_2px_rgb(10_16_32/0.03)]"
    >
      <span className="flex items-center justify-center gap-1.5 [[data-lod=far]_&]:hidden">
        {waitNode ? <Clock aria-hidden className="size-3 shrink-0 text-teal-600" /> : <Split aria-hidden className="size-3 shrink-0 text-emerald-600" />}
        {repeatCheck ? (
          <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-px font-mono text-[9px] font-medium tracking-[0.04em] text-emerald-800 tabular-nums">
            {repeatCheck.position}/{repeatCheck.total}
          </span>
        ) : null}
        <span className="line-clamp-2 text-[12px] leading-snug font-semibold text-emerald-800">
          {waitNode ? `${waitLabel(waitNode)} · ${cardSummary(node.headline)}` : cardSummary(node.headline)}
        </span>
      </span>
    </Shell>
  );
}

/* Wait: the capsule, compact, its own width. */
export function WaitCard({ node, onOpen }: { node: FlowNode; onOpen: () => void }) {
  return (
    <Shell
      onClick={onOpen}
      ariaLabel={node.headline}
      fit
      className="flex max-w-[240px] items-center gap-2 rounded-full bg-paper py-1.5 pr-3.5 pl-1.5 ring-1 ring-teal-200 shadow-[0_1px_2px_rgb(10_16_32/0.04)] [[data-lod=far]_&]:bg-teal-200 [[data-lod=far]_&]:p-0"
    >
      <Tile kind={KIND.wait}>
        <Clock aria-hidden />
      </Tile>
      <span className="line-clamp-2 text-[13px] leading-snug font-medium text-ink-800 [[data-lod=far]_&]:hidden">{waitLabel(node)}</span>
    </Shell>
  );
}
