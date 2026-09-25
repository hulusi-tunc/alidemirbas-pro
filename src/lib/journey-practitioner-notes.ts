import type { Lang } from "@/lib/content";

export type PractitionerJourneyNotes = {
  trigger: string;
  eligibility: readonly string[];
  kpis: readonly string[];
};

const NOTES: Readonly<Record<string, Readonly<Record<Lang, PractitionerJourneyNotes>>>> = {
  "ACQ-09": {
    tr: {
      trigger: "Aday müşteri oluşması veya teklif talebinin alınması.",
      eligibility: [
        "Ürün veya hizmete ilgi göstermiş ancak henüz satın almaya hazır olmayan adaylar.",
        "İletişim izni bulunan ve satış / satın alma sürecine henüz geçmemiş adaylar.",
      ],
      kpis: [
        "Yeniden etkileşim oranı",
        "Satış / conversion sürecine aktarım oranı",
        "Journey kaynaklı dönüşüm oranı",
      ],
    },
    en: {
      trigger: "A lead is captured or a quote request is received.",
      eligibility: [
        "Leads who have shown interest in the product or service but are not yet ready to buy.",
        "Leads who can be contacted and have not yet entered the sales / purchase path.",
      ],
      kpis: [
        "Re-engagement rate",
        "Sales / conversion handoff rate",
        "Journey-attributed conversion rate",
      ],
    },
  },
  "ACQ-01": { tr:{trigger:"Anonim profilde anlamlı yüksek niyet sinyalinin oluşması.",eligibility:["Kimliği henüz doğrulanmamış, güçlü davranış sinyali veren profiller."],kpis:["Kimlik doğrulama oranı","Uygun profile dönüşüm oranı"]}, en:{trigger:"Meaningful high-intent behaviour is detected on an anonymous profile.",eligibility:["Anonymous profiles showing meaningful high-intent behaviour."],kpis:["Identity resolution rate","Eligible-profile rate"]} },
  "ACQ-02": { tr:{trigger:"Birinci taraf ilgi sinyalinin alınması.",eligibility:["Açık bir talep veya ilgi sinyali bırakmış kişiler."],kpis:["Doğru hedefe yönlendirme oranı","Satış / nurture aktarım oranı"]}, en:{trigger:"A first-party interest signal is captured.",eligibility:["People who submitted an explicit request or interest signal."],kpis:["Correct-routing rate","Sales / nurture handoff rate"]} },
  "ACQ-03": { tr:{trigger:"Mevcut journey'den daha güçlü bir niyet sinyalinin oluşması.",eligibility:["Aktif düşük niyet journey'sinde bulunan ve güçlü yeni sinyal üreten kullanıcılar."],kpis:["Yüksek niyetli sürece aktarım oranı","Devir sonrası conversion oranı"]}, en:{trigger:"A stronger intent signal appears than the one that opened the current journey.",eligibility:["Users in a lower-intent journey who produce a stronger current signal."],kpis:["Higher-intent handoff rate","Post-handoff conversion rate"]} },
  "ACQ-04": { tr:{trigger:"Yüksek niyetli ticari aksiyonun alınması.",eligibility:["Ticari niyeti netleşmiş lead'ler."],kpis:["Doğru routing oranı","İnsan desteğine aktarım oranı"]}, en:{trigger:"A high-intent commercial action is recorded.",eligibility:["Leads with clear commercial intent."],kpis:["Correct-routing rate","Human-assistance handoff rate"]} },
  "ACQ-05": { tr:{trigger:"Lead veya hesabın nitelik durumunun değişmesi.",eligibility:["Nitelik durumu ve değişim nedeni kaydedilebilen lead veya hesaplar."],kpis:["Yeniden nitelendirme oranı","Doğru yönlendirme oranı"]}, en:{trigger:"A lead or account qualification state changes.",eligibility:["Leads or accounts with a recorded qualification state and reason."],kpis:["Requalification rate","Correct-routing rate"]} },
  "ACQ-06": { tr:{trigger:"Uygunluğu etkileyen temel verinin değişmesi.",eligibility:["Uygunluk kararı yeniden hesaplanabilen kullanıcı veya hesaplar."],kpis:["Uygunluk değişim oranı","Doğru engelleme / izin verme oranı"]}, en:{trigger:"Underlying data that affects eligibility changes.",eligibility:["Users or accounts whose eligibility can be recalculated."],kpis:["Eligibility-change rate","Correct allow / block rate"]} },
  "ACQ-07": { tr:{trigger:"Güçlü niyet sinyalinin tazelik penceresini aşması.",eligibility:["Yüksek niyet durumu aktif olup yeni güçlü sinyal üretmeyen kullanıcılar."],kpis:["Niyet düşürme oranı","Yeniden yükselme oranı"]}, en:{trigger:"A strong intent signal passes its freshness window.",eligibility:["Users with an active high-intent state but no new strong signal."],kpis:["Intent-downgrade rate","Re-escalation rate"]} },
  "ACQ-08": { tr:{trigger:"Yetkili ticari hedef olayının gerçekleşmesi.",eligibility:["Acquisition journey'sinde aktif olup hedefi tamamlayan kullanıcılar."],kpis:["Acquisition sonrası suppression oranı","Sonraki sürece devir oranı"]}, en:{trigger:"The authoritative commercial conversion event is recorded.",eligibility:["Users in an active acquisition journey who complete its goal."],kpis:["Post-conversion suppression rate","Next-stage handoff rate"]} },
  "ACQ-10": { tr:{trigger:"Ticari fırsatın açık bir ret veya kayıp sonucuyla kapanması.",eligibility:["Ret nedeni kaydedilmiş fırsatlar."],kpis:["Ret nedeni dağılımı","Yeniden giriş oranı"]}, en:{trigger:"A commercial opportunity closes with an explicit decline or loss outcome.",eligibility:["Opportunities with a recorded decline reason."],kpis:["Decline-reason distribution","Re-entry rate"]} },
  "ACQ-285": { tr:{trigger:"Yeni lead veya ilgi kaydının oluşması.",eligibility:["İlk teması henüz yapılmamış yeni lead'ler."],kpis:["İlk temas süresi","İlk temas etkileşim oranı"]}, en:{trigger:"A new lead or captured-interest record is created.",eligibility:["New leads that have not yet received a first response."],kpis:["Time to first response","First-touch engagement rate"]} },
  "ACT-11": { tr:{trigger:"Yeni hesap, trial, abonelik veya onboarding kaydının oluşması.",eligibility:["Onboarding rotası henüz belirlenmemiş yeni kullanıcı veya hesaplar."],kpis:["Onboarding başlama oranı","Doğru rota seçimi oranı"]}, en:{trigger:"A new account, trial, subscription or onboarding instance is recorded.",eligibility:["New users or accounts without an assigned onboarding route."],kpis:["Onboarding start rate","Correct-route rate"]} },
  "ACT-12": { tr:{trigger:"Kullanıcının onboarding içinde anlamlı bir adımı tamamlaması.",eligibility:["Onboarding'i devam eden kullanıcılar."],kpis:["Onboarding ilerleme oranı","Sonraki adım tamamlama oranı"]}, en:{trigger:"A user completes a meaningful onboarding step.",eligibility:["Users with onboarding still in progress."],kpis:["Onboarding progression rate","Next-step completion rate"]} },
  "ACT-13": { tr:{trigger:"Aktivasyon ilerlemesinin durması veya belirli bir blocker oluşması.",eligibility:["Aktivasyon hedefine henüz ulaşmamış kullanıcılar."],kpis:["Blocker çözüm oranı","Aktivasyona dönüş oranı"]}, en:{trigger:"Activation progress stalls or a specific blocker is detected.",eligibility:["Users who have not yet reached activation."],kpis:["Blocker-resolution rate","Recovery-to-activation rate"]} },
  "ACT-16": { tr:{trigger:"Ürünün yetkili aktivasyon olayının gerçekleşmesi.",eligibility:["Onboarding'i aktif olan ve temel değer anına ulaşan kullanıcılar."],kpis:["Onboarding kapanış oranı","Adoption sürecine aktarım oranı"]}, en:{trigger:"The product's authoritative activation event is recorded.",eligibility:["Users in active onboarding who reach the core value moment."],kpis:["Onboarding close rate","Adoption handoff rate"]} },
  "ACT-18": { tr:{trigger:"Tekrarlanan değer davranışının belirgin biçimde yavaşlaması veya durması.",eligibility:["Daha önce aktivasyon ve tekrar kullanım göstermiş kullanıcılar."],kpis:["Sağlıklı kullanıma dönüş oranı","Re-engagement oranı"]}, en:{trigger:"Repeat value-producing behaviour slows materially or stops.",eligibility:["Users who previously activated and showed repeat use."],kpis:["Healthy-usage recovery rate","Re-engagement rate"]} },

};

export function practitionerJourneyNotes(id: string, lang: Lang): PractitionerJourneyNotes | null {
  return NOTES[id]?.[lang] ?? null;
}
