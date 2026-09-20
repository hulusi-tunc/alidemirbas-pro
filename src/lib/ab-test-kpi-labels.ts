/* Standalone, dependency-free module (imports only the Lang type) so it
   can be imported from client components ("use client" files like
   AbTestGallery.tsx) without dragging ab-test-view.ts's 211-record
   TESTS/AB_TEST_ROWS in with it. */
import type { Lang } from "@/lib/content";

/* ab-tests.json's own `primaryKpi.label`/`hypothesis`/`question` etc. are
   natively Turkish (the archive is a Turkish-authored dataset; only
   `seoTitle`/`seoDescription`/`slug` are English - see AbTestRoutes.tsx's
   own comment on this). That leaves the EN-tree A/B test library showing
   raw Turkish sentences inside English UI chrome. `primaryKpi.label` is
   the one field with a genuinely small, closed set of values (68 distinct
   labels across all 211 records - each is a metric name, not free prose),
   so it gets a real translation map here. The much larger free-text
   fields (`question`, `hypothesis`, `otherKpis[].explanation`,
   `whatToTest[].explanation`, `sideA`/`sideB`, `guardrails`) are per-record
   unique prose (up to 211 distinct values each) and are NOT covered here -
   translating those needs a dedicated content pass, not a lookup map; see
   CalculatorRoutes.tsx's own TR-content precedent for the shape that would
   take. Never edit ab-tests.json itself - upstream-owned, frozen. */
const PRIMARY_KPI_LABEL_EN: Record<string, string> = {
  "Adres Adımı Tamamlama": "Address Step Completion",
  "Aksiyon Tamamlama Oranı": "Action Completion Rate",
  "Akış Tamamlama Oranı": "Flow Completion Rate",
  "Alan Doldurma Oranı": "Field Fill Rate",
  "Ana Aksiyon Tamamlama Oranı": "Primary Action Completion Rate",
  "Arama Dönüşüm Oranı (CR)": "Search Conversion Rate (CR)",
  "Arama Sonucu Tıklama Oranı": "Search Result Click Rate",
  "Asıl Akış Tamamlama Oranı": "Main Flow Completion Rate",
  "Banner Tıklama Oranı": "Banner Click Rate",
  "Beden Seçim Tamamlama": "Size Selection Completion",
  "Brüt Gelir / Ziyaretçi": "Gross Revenue per Visitor",
  "Devam Etme Oranı": "Continuation Rate",
  "Doğrulama Hatası Oranı": "Validation Error Rate",
  "Duyurulan Aksiyonun Tamamlanma Oranı": "Announced Action Completion Rate",
  "Dönüşüm Oranı (CR)": "Conversion Rate (CR)",
  "Ek Satın Alma Oranı": "Add-On Purchase Rate",
  "Form Başlama Oranı": "Form Start Rate",
  "Form Tamamlama Oranı": "Form Completion Rate",
  "Giriş Tamamlama Oranı": "Login Completion Rate",
  "Haber Ver Kayıt Oranı": "Notify-Me Signup Rate",
  "Hesap Oluşturma Oranı": "Account Creation Rate",
  "Kampanya Tıklama Oranı": "Campaign Click Rate",
  "Kategori Sayfasından Satın Alma Oranı": "Category Page Purchase Rate",
  "Kategori Tıklama Oranı": "Category Click Rate",
  "Kayıt Oranı": "Signup Rate",
  "Kayıt Tamamlama Oranı": "Signup Completion Rate",
  "Kullanıcı Başına Gelir (ARPU)": "Revenue per User (ARPU)",
  "Kullanıcı Başına Toplam Tutar": "Total Amount per User",
  "Kurtarma Oranı": "Recovery Rate",
  "Liste → Ürün Tıklama Oranı": "List → Product Click Rate",
  "Marka Algısı (anket)": "Brand Perception (survey)",
  "Net İzin Kabul Oranı": "Net Consent Opt-In Rate",
  "Nihai Dönüşüm Oranı (CR)": "Final Conversion Rate (CR)",
  "Nitelikli Fırsat Sayısı": "Qualified Opportunity Count",
  "Nitelikli Fırsat Sayısı (SQL)": "Qualified Opportunity Count (SQL)",
  "Nitelikli Talep Sayısı": "Qualified Lead Count",
  "Ortalama Sepet Tutarı": "Average Cart Value",
  "Ortalama Sepet Tutarı (AOV)": "Average Order Value (AOV)",
  "Paylaşım Başlatma Oranı": "Share Initiation Rate",
  "Profil Tamamlama Oranı": "Profile Completion Rate",
  "Sayfada Kalma/Geri Dönüş Oranı": "Time on Page / Bounce Rate",
  "Sepete Ekleme Oranı": "Add-to-Cart Rate",
  "Seçim Tamamlama Süresi": "Selection Completion Time",
  "Sipariş Tamamlama Oranı": "Order Completion Rate",
  "Sıfır Sonuç Kurtarma Oranı": "Zero-Result Recovery Rate",
  "Tamamlama Oranı": "Completion Rate",
  "Tanıtılan Özellik Kullanım Oranı": "Featured Item Usage Rate",
  "Toplam Aksiyon Tamamlama Oranı": "Overall Action Completion Rate",
  "Toplam Kabul Oranı": "Overall Acceptance Rate",
  "Tıklama Oranı (CTR)": "Click-Through Rate (CTR)",
  "Widget Etkileşim Oranı": "Widget Engagement Rate",
  "Yeni Kullanıcı Başına Net Gelir": "Net Revenue per New User",
  "Yükseltme Oranı": "Upgrade Rate",
  "Ziyaretçi Başına Gelir (RPV)": "Revenue per Visitor (RPV)",
  "Ziyaretçi Başına Net Gelir": "Net Revenue per Visitor",
  "Ödeme Adımı Terk Oranı": "Checkout Step Abandonment Rate",
  "Ödeme Adımına Ulaşma Oranı": "Checkout Step Reach Rate",
  "Ödeme Tamamlama Oranı": "Checkout Completion Rate",
  "Önerilen Adımın Tamamlanma Oranı": "Suggested Step Completion Rate",
  "Özellik Deneme Oranı": "Feature Trial Rate",
  "Ücretliye Geçiş Oranı": "Paid Conversion Rate",
  "Ücretsiz Kayıt Oranı": "Free Signup Rate",
  "İade Oranı": "Return Rate",
  "İlgili Bloğa Tıklama Oranı": "Related Block Click Rate",
  "İlgili Bölüm Ziyaret Oranı": "Related Section Visit Rate",
  "İlgili İşlev Kullanım Oranı": "Related Feature Usage Rate",
  "İlk Aksiyon Tamamlama Oranı": "First Action Completion Rate",
  "İzin Kabul Oranı": "Consent Opt-In Rate",
};

/** The primary KPI's display label for `lang` - Turkish as authored on
    `tr`, translated on `en`. Falls back to the raw Turkish label only if
    a future record introduces a 69th value this map hasn't seen yet. */
export function primaryKpiLabel(label: string, lang: Lang): string {
  if (lang === "en") return PRIMARY_KPI_LABEL_EN[label] ?? label;
  return label;
}
