// Generated from the live archive at alidemirbas.com.tr/lab/crm-journeys
export type Journey = {
  slug: string;
  idx: string;
  channels: string[];
  sector: { en: string; tr: string };
  journey: { en: string; tr: string };
  title: { en: string; tr: string };
};

export const journeys: Journey[] = [
  {
    "slug": "ecom-cart-01",
    "idx": "ECOM-01",
    "channels": [
      "email",
      "push",
      "sms",
      "whatsapp"
    ],
    "sector": {
      "en": "E-commerce",
      "tr": "E-ticaret"
    },
    "journey": {
      "en": "Abandoned Cart",
      "tr": "Sepet terk"
    },
    "title": {
      "en": "Abandoned cart recovery",
      "tr": "Sepet terk kurtarma"
    }
  },
  {
    "slug": "ecom-browse-01",
    "idx": "ECOM-02",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "E-commerce",
      "tr": "E-ticaret"
    },
    "journey": {
      "en": "Browse Abandonment",
      "tr": "İnceleme terk"
    },
    "title": {
      "en": "Viewed the product, didn't add to cart",
      "tr": "Ürüne baktı, sepete atmadı"
    }
  },
  {
    "slug": "ecom-restock-01",
    "idx": "ECOM-03",
    "channels": [
      "email",
      "push",
      "sms",
      "whatsapp"
    ],
    "sector": {
      "en": "E-commerce",
      "tr": "E-ticaret"
    },
    "journey": {
      "en": "Back In Stock",
      "tr": "Yeniden stokta"
    },
    "title": {
      "en": "Back in stock (a sold-out item returns)",
      "tr": "Yeniden stokta (tükenen ürün geldi)"
    }
  },
  {
    "slug": "ecom-pricedrop-01",
    "idx": "ECOM-04",
    "channels": [
      "push",
      "email",
      "sms"
    ],
    "sector": {
      "en": "E-commerce",
      "tr": "E-ticaret"
    },
    "journey": {
      "en": "Price Drop",
      "tr": "Fiyat düşüşü"
    },
    "title": {
      "en": "Price drop on a tracked item",
      "tr": "Takip edilen üründe fiyat düştü"
    }
  },
  {
    "slug": "ecom-replen-01",
    "idx": "ECOM-05",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "E-commerce",
      "tr": "E-ticaret"
    },
    "journey": {
      "en": "Replenishment",
      "tr": "Tekrar alım"
    },
    "title": {
      "en": "Replenishment (reorder before running out)",
      "tr": "Ürün yenileme (tükenmeden tekrar sipariş)"
    }
  },
  {
    "slug": "ecom-second-01",
    "idx": "ECOM-06",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "E-commerce",
      "tr": "E-ticaret"
    },
    "journey": {
      "en": "Post Purchase",
      "tr": "Satış sonrası"
    },
    "title": {
      "en": "First-to-second-order bridge",
      "tr": "İlk → ikinci sipariş köprüsü"
    }
  },
  {
    "slug": "ecom-winback-01",
    "idx": "ECOM-07",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "E-commerce",
      "tr": "E-ticaret"
    },
    "journey": {
      "en": "Winback",
      "tr": "Geri kazanım"
    },
    "title": {
      "en": "Winning back a lapsing customer",
      "tr": "Uzaklaşan müşteriyi geri kazanma"
    }
  },
  {
    "slug": "ota-aband-01",
    "idx": "TRAVEL-01",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "Travel",
      "tr": "Seyahat"
    },
    "journey": {
      "en": "Browse Abandonment",
      "tr": "İnceleme terk"
    },
    "title": {
      "en": "Searched for a flight, didn't book",
      "tr": "Uçuş aradı, rezerve etmedi"
    }
  },
  {
    "slug": "ota-checkout-01",
    "idx": "TRAVEL-02",
    "channels": [
      "email",
      "push",
      "sms",
      "whatsapp"
    ],
    "sector": {
      "en": "Travel",
      "tr": "Seyahat"
    },
    "journey": {
      "en": "Abandoned Cart",
      "tr": "Sepet terk"
    },
    "title": {
      "en": "Abandoned at checkout",
      "tr": "Ödeme adımında bıraktı"
    }
  },
  {
    "slug": "ota-pricealert-01",
    "idx": "TRAVEL-03",
    "channels": [
      "email",
      "push",
      "sms",
      "whatsapp"
    ],
    "sector": {
      "en": "Travel",
      "tr": "Seyahat"
    },
    "journey": {
      "en": "Price Drop",
      "tr": "Fiyat düşüşü"
    },
    "title": {
      "en": "Route price alert",
      "tr": "Rota fiyat alarmı"
    }
  },
  {
    "slug": "ota-pretrip-01",
    "idx": "TRAVEL-04",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp",
      "whatsapp"
    ],
    "sector": {
      "en": "Travel",
      "tr": "Seyahat"
    },
    "journey": {
      "en": "Post Purchase",
      "tr": "Satış sonrası"
    },
    "title": {
      "en": "Pre-trip series",
      "tr": "Seyahat öncesi seri"
    }
  },
  {
    "slug": "ota-crosssell-01",
    "idx": "TRAVEL-05",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "Travel",
      "tr": "Seyahat"
    },
    "journey": {
      "en": "Upsell Cross Sell",
      "tr": "Ek / çapraz satış"
    },
    "title": {
      "en": "Hotel or car suggestion for a flight",
      "tr": "Uçuşa otel ya da araç önerisi"
    }
  },
  {
    "slug": "ota-review-01",
    "idx": "TRAVEL-06",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "Travel",
      "tr": "Seyahat"
    },
    "journey": {
      "en": "Feedback Nps",
      "tr": "Geri bildirim / NPS"
    },
    "title": {
      "en": "Post-trip review and rebooking",
      "tr": "Seyahat sonrası değerlendirme ve yeniden rezervasyon"
    }
  },
  {
    "slug": "ota-seasonal-01",
    "idx": "TRAVEL-07",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "Travel",
      "tr": "Seyahat"
    },
    "journey": {
      "en": "Winback",
      "tr": "Geri kazanım"
    },
    "title": {
      "en": "Seasonal win-back",
      "tr": "Sezonluk geri kazanım"
    }
  },
  {
    "slug": "saas-trial-01",
    "idx": "SAAS-01",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp",
      "sales"
    ],
    "sector": {
      "en": "SaaS",
      "tr": "SaaS"
    },
    "journey": {
      "en": "Trial Conversion",
      "tr": "Deneme dönüşümü"
    },
    "title": {
      "en": "Trial ending: move to a paid plan",
      "tr": "Deneme bitiyor, ücretli plana geçiş"
    }
  },
  {
    "slug": "saas-activate-01",
    "idx": "SAAS-02",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "SaaS",
      "tr": "SaaS"
    },
    "journey": {
      "en": "Activation",
      "tr": "Aktivasyon"
    },
    "title": {
      "en": "Trial activation rescue (no first result yet)",
      "tr": "Deneme aktivasyon kurtarma (ilk sonuç yok)"
    }
  },
  {
    "slug": "saas-adopt-01",
    "idx": "SAAS-03",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "SaaS",
      "tr": "SaaS"
    },
    "journey": {
      "en": "Feature Adoption",
      "tr": "Özellik benimseme"
    },
    "title": {
      "en": "Feature adoption (undiscovered value)",
      "tr": "Özellik benimsetme (keşfedilmemiş değer)"
    }
  },
  {
    "slug": "saas-churn-01",
    "idx": "SAAS-04",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "SaaS",
      "tr": "SaaS"
    },
    "journey": {
      "en": "Churn Prevention",
      "tr": "Kayıp önleme"
    },
    "title": {
      "en": "Usage decline, churn risk",
      "tr": "Kullanım düşüşü, kayıp riski"
    }
  },
  {
    "slug": "saas-dunning-01",
    "idx": "SAAS-05",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "SaaS",
      "tr": "SaaS"
    },
    "journey": {
      "en": "Payment Failure",
      "tr": "Ödeme hatası"
    },
    "title": {
      "en": "Payment failed (dunning)",
      "tr": "Ödeme başarısız (ödeme takibi)"
    }
  },
  {
    "slug": "saas-onboard-01",
    "idx": "SAAS-06",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "SaaS",
      "tr": "SaaS"
    },
    "journey": {
      "en": "Account Onboarding",
      "tr": "Hesap kurulumu"
    },
    "title": {
      "en": "B2B account onboarding (by role)",
      "tr": "B2B hesap kurulumu (role göre)"
    }
  },
  {
    "slug": "saas-expansion-01",
    "idx": "SAAS-07",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp",
      "sales"
    ],
    "sector": {
      "en": "SaaS",
      "tr": "SaaS"
    },
    "journey": {
      "en": "Upsell Cross Sell",
      "tr": "Ek / çapraz satış"
    },
    "title": {
      "en": "Seat and usage-limit expansion",
      "tr": "Koltuk ve limit genişletme"
    }
  },
  {
    "slug": "fin-onboard-01",
    "idx": "FIN-01",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Fintech",
      "tr": "Fintech"
    },
    "journey": {
      "en": "Welcome Onboarding",
      "tr": "Karşılama"
    },
    "title": {
      "en": "New account welcome",
      "tr": "Yeni hesap karşılama"
    }
  },
  {
    "slug": "fin-card-activate-01",
    "idx": "FIN-02",
    "channels": [
      "email",
      "push",
      "sms",
      "whatsapp"
    ],
    "sector": {
      "en": "Fintech",
      "tr": "Fintech"
    },
    "journey": {
      "en": "Activation",
      "tr": "Aktivasyon"
    },
    "title": {
      "en": "Card arrived, not activated",
      "tr": "Kart geldi, aktive edilmedi"
    }
  },
  {
    "slug": "fin-dormant-01",
    "idx": "FIN-03",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "Fintech",
      "tr": "Fintech"
    },
    "journey": {
      "en": "Reactivation",
      "tr": "Yeniden etkinleştirme"
    },
    "title": {
      "en": "Winning back a dormant account",
      "tr": "Uykuya geçmiş hesabı geri kazanma"
    }
  },
  {
    "slug": "fin-autopay-01",
    "idx": "FIN-04",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Fintech",
      "tr": "Fintech"
    },
    "journey": {
      "en": "Feature Adoption",
      "tr": "Özellik benimseme"
    },
    "title": {
      "en": "Driving adoption of autopay",
      "tr": "Otomatik ödeme talimatını benimsetme"
    }
  },
  {
    "slug": "fin-crosssell-01",
    "idx": "FIN-05",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Fintech",
      "tr": "Fintech"
    },
    "journey": {
      "en": "Upsell Cross Sell",
      "tr": "Ek / çapraz satış"
    },
    "title": {
      "en": "Cross-selling an additional product (loan / card)",
      "tr": "Ek ürün çapraz satışı (kredi / kart)"
    }
  },
  {
    "slug": "fin-profile-01",
    "idx": "FIN-06",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Fintech",
      "tr": "Fintech"
    },
    "journey": {
      "en": "Progressive Profiling",
      "tr": "Kademeli profilleme"
    },
    "title": {
      "en": "Collecting missing profile data",
      "tr": "Eksik profil verisi toplama"
    }
  },
  {
    "slug": "fin-churn-01",
    "idx": "FIN-07",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Fintech",
      "tr": "Fintech"
    },
    "journey": {
      "en": "Churn Prevention",
      "tr": "Kayıp önleme"
    },
    "title": {
      "en": "Value drift / usage decline",
      "tr": "Değer kayması / kullanım düşüşü"
    }
  },
  {
    "slug": "mkt-activate-01",
    "idx": "MKT-01",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Marketplace",
      "tr": "Marketplace"
    },
    "journey": {
      "en": "Activation",
      "tr": "Aktivasyon"
    },
    "title": {
      "en": "Signed up, no first order yet",
      "tr": "Kayıt oldu, ilk siparişi vermedi"
    }
  },
  {
    "slug": "mkt-second-01",
    "idx": "MKT-02",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "Marketplace",
      "tr": "Marketplace"
    },
    "journey": {
      "en": "Post Purchase",
      "tr": "Satış sonrası"
    },
    "title": {
      "en": "Bridge from first order to second",
      "tr": "İlk siparişten ikinciye köprü"
    }
  },
  {
    "slug": "mkt-frequency-01",
    "idx": "MKT-03",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Marketplace",
      "tr": "Marketplace"
    },
    "journey": {
      "en": "Churn Prevention",
      "tr": "Kayıp önleme"
    },
    "title": {
      "en": "Order frequency drop",
      "tr": "Sipariş sıklığı düşüşü"
    }
  },
  {
    "slug": "mkt-category-01",
    "idx": "MKT-04",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Marketplace",
      "tr": "Marketplace"
    },
    "journey": {
      "en": "Upsell Cross Sell",
      "tr": "Ek / çapraz satış"
    },
    "title": {
      "en": "Category expansion",
      "tr": "Kategori genişletme"
    }
  },
  {
    "slug": "mkt-reactivate-01",
    "idx": "MKT-05",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "Marketplace",
      "tr": "Marketplace"
    },
    "journey": {
      "en": "Reactivation",
      "tr": "Yeniden etkinleştirme"
    },
    "title": {
      "en": "Bringing back a dormant user",
      "tr": "Uykuya dalmış kullanıcıyı geri getirme"
    }
  },
  {
    "slug": "mkt-anniversary-01",
    "idx": "MKT-06",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "Marketplace",
      "tr": "Marketplace"
    },
    "journey": {
      "en": "Anniversary",
      "tr": "Yıl dönümü"
    },
    "title": {
      "en": "Membership or first-order anniversary",
      "tr": "Üyelik ya da ilk sipariş yıldönümü"
    }
  },
  {
    "slug": "mkt-gamified-01",
    "idx": "MKT-07",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Marketplace",
      "tr": "Marketplace"
    },
    "journey": {
      "en": "Gamified Rewards",
      "tr": "Oyunlaştırılmış ödül"
    },
    "title": {
      "en": "Seasonal spin-the-wheel campaign",
      "tr": "Sezonluk çarkıfelek kampanyası"
    }
  },
  {
    "slug": "game-d1-01",
    "idx": "GAME-01",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "Gaming",
      "tr": "Gaming"
    },
    "journey": {
      "en": "Activation",
      "tr": "Aktivasyon"
    },
    "title": {
      "en": "Day-one return (first 24 hours)",
      "tr": "İlk gün dönüşü (ilk 24 saat)"
    }
  },
  {
    "slug": "game-reactivate-01",
    "idx": "GAME-02",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "Gaming",
      "tr": "Gaming"
    },
    "journey": {
      "en": "Reactivation",
      "tr": "Yeniden etkinleştirme"
    },
    "title": {
      "en": "Winning back the silent player (7+ days)",
      "tr": "Sessizleşen oyuncuyu geri getirme (7+ gün)"
    }
  },
  {
    "slug": "game-iap-01",
    "idx": "GAME-03",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Gaming",
      "tr": "Gaming"
    },
    "journey": {
      "en": "Trial Conversion",
      "tr": "Deneme dönüşümü"
    },
    "title": {
      "en": "First in-app purchase (free to paid)",
      "tr": "İlk uygulama içi satın alma (ücretsizden ücretliye)"
    }
  },
  {
    "slug": "game-optin-01",
    "idx": "GAME-04",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Gaming",
      "tr": "Gaming"
    },
    "journey": {
      "en": "Channel Opt In",
      "tr": "Kanal izni"
    },
    "title": {
      "en": "Notification opt-in (at the right moment)",
      "tr": "Bildirim izni (doğru anda)"
    }
  },
  {
    "slug": "game-referral-01",
    "idx": "GAME-05",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Gaming",
      "tr": "Gaming"
    },
    "journey": {
      "en": "Referral",
      "tr": "Arkadaş getir"
    },
    "title": {
      "en": "Friend invite (referral loop)",
      "tr": "Arkadaş daveti (davet döngüsü)"
    }
  },
  {
    "slug": "game-milestone-01",
    "idx": "GAME-06",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Gaming",
      "tr": "Gaming"
    },
    "journey": {
      "en": "Milestone",
      "tr": "Kilometre taşı"
    },
    "title": {
      "en": "Achievement and streak celebration",
      "tr": "Başarı ve seri kutlaması"
    }
  },
  {
    "slug": "game-loyalty-01",
    "idx": "GAME-07",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "Gaming",
      "tr": "Gaming"
    },
    "journey": {
      "en": "Loyalty",
      "tr": "Sadakat"
    },
    "title": {
      "en": "Season pass / points program",
      "tr": "Sezon bileti / puan programı"
    }
  },
  {
    "slug": "media-trial-01",
    "idx": "MEDIA-01",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Media",
      "tr": "Medya"
    },
    "journey": {
      "en": "Trial Conversion",
      "tr": "Deneme dönüşümü"
    },
    "title": {
      "en": "Free to premium conversion",
      "tr": "Ücretsizden premium'a dönüşüm"
    }
  },
  {
    "slug": "media-reactivate-01",
    "idx": "MEDIA-02",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "Media",
      "tr": "Medya"
    },
    "journey": {
      "en": "Reactivation",
      "tr": "Yeniden etkinleştirme"
    },
    "title": {
      "en": "Finished the show, drifting viewer",
      "tr": "Diziyi bitirdi, uzaklaşan izleyici"
    }
  },
  {
    "slug": "media-cancel-01",
    "idx": "MEDIA-03",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Media",
      "tr": "Medya"
    },
    "journey": {
      "en": "Churn Prevention",
      "tr": "Kayıp önleme"
    },
    "title": {
      "en": "Save at the moment of cancellation",
      "tr": "İptal anında kurtarma"
    }
  },
  {
    "slug": "media-winback-01",
    "idx": "MEDIA-04",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "Media",
      "tr": "Medya"
    },
    "journey": {
      "en": "Winback",
      "tr": "Geri kazanım"
    },
    "title": {
      "en": "Win back a subscriber who left",
      "tr": "Ayrılan aboneyi geri kazan"
    }
  },
  {
    "slug": "media-upgrade-01",
    "idx": "MEDIA-05",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Media",
      "tr": "Medya"
    },
    "journey": {
      "en": "Upsell Cross Sell",
      "tr": "Ek / çapraz satış"
    },
    "title": {
      "en": "Monthly to annual upgrade",
      "tr": "Aylıktan yıllığa geçiş"
    }
  },
  {
    "slug": "media-adopt-01",
    "idx": "MEDIA-06",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Media",
      "tr": "Medya"
    },
    "journey": {
      "en": "Feature Adoption",
      "tr": "Özellik benimseme"
    },
    "title": {
      "en": "Drive adoption of profiles and offline viewing",
      "tr": "Profil ve çevrimdışı izleme özelliğini benimset"
    }
  },
  {
    "slug": "media-milestone-01",
    "idx": "MEDIA-07",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Media",
      "tr": "Medya"
    },
    "journey": {
      "en": "Milestone",
      "tr": "Kilometre taşı"
    },
    "title": {
      "en": "Watch streaks and year in review",
      "tr": "İzleme serisi ve yılın özeti"
    }
  },
  {
    "slug": "edu-activate-01",
    "idx": "EDU-01",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "EdTech",
      "tr": "EdTech"
    },
    "journey": {
      "en": "Activation",
      "tr": "Aktivasyon"
    },
    "title": {
      "en": "Signed up, never finished the first lesson",
      "tr": "Kayıt oldu, ilk dersini bitirmedi"
    }
  },
  {
    "slug": "edu-streak-01",
    "idx": "EDU-02",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "EdTech",
      "tr": "EdTech"
    },
    "journey": {
      "en": "Milestone",
      "tr": "Kilometre taşı"
    },
    "title": {
      "en": "Learning streaks and motivation",
      "tr": "Öğrenme serisi ve motivasyon"
    }
  },
  {
    "slug": "edu-reactivate-01",
    "idx": "EDU-03",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "EdTech",
      "tr": "EdTech"
    },
    "journey": {
      "en": "Reactivation",
      "tr": "Yeniden etkinleştirme"
    },
    "title": {
      "en": "Coming back to an unfinished course",
      "tr": "Yarım kalan kursa geri dönüş"
    }
  },
  {
    "slug": "edu-premium-01",
    "idx": "EDU-04",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "EdTech",
      "tr": "EdTech"
    },
    "journey": {
      "en": "Trial Conversion",
      "tr": "Deneme dönüşümü"
    },
    "title": {
      "en": "Free to paid (certificate / premium)",
      "tr": "Ücretsizden ücretliye (sertifika / premium)"
    }
  },
  {
    "slug": "edu-lead-01",
    "idx": "EDU-05",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "EdTech",
      "tr": "EdTech"
    },
    "journey": {
      "en": "Lead Nurture",
      "tr": "Aday besleme"
    },
    "title": {
      "en": "From guide / webinar lead to signup",
      "tr": "Rehber / webinar adayından kayda"
    }
  },
  {
    "slug": "edu-crosssell-01",
    "idx": "EDU-06",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "EdTech",
      "tr": "EdTech"
    },
    "journey": {
      "en": "Upsell Cross Sell",
      "tr": "Ek / çapraz satış"
    },
    "title": {
      "en": "Course finished, on to the next one",
      "tr": "Kurs bitti, sıradaki kursa"
    }
  },
  {
    "slug": "edu-referral-01",
    "idx": "EDU-07",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "EdTech",
      "tr": "EdTech"
    },
    "journey": {
      "en": "Referral",
      "tr": "Arkadaş getir"
    },
    "title": {
      "en": "From certificate sharing to referral",
      "tr": "Sertifika paylaşımından davete"
    }
  },
  {
    "slug": "tel-onboard-01",
    "idx": "TEL-01",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Telecom",
      "tr": "Telekom"
    },
    "journey": {
      "en": "Welcome Onboarding",
      "tr": "Karşılama"
    },
    "title": {
      "en": "New subscription welcome (preventing first-bill shock)",
      "tr": "Yeni abonelik karşılaması (ilk fatura şokunu önleme)"
    }
  },
  {
    "slug": "tel-upsell-01",
    "idx": "TEL-02",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Telecom",
      "tr": "Telekom"
    },
    "journey": {
      "en": "Upsell Cross Sell",
      "tr": "Ek / çapraz satış"
    },
    "title": {
      "en": "Plan and add-on recommendation at usage overage",
      "tr": "Kullanım aşımında paket ve ek hizmet önerisi"
    }
  },
  {
    "slug": "tel-churn-01",
    "idx": "TEL-03",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Telecom",
      "tr": "Telekom"
    },
    "journey": {
      "en": "Churn Prevention",
      "tr": "Kayıp önleme"
    },
    "title": {
      "en": "Contract end (critical churn window)",
      "tr": "Taahhüt bitişi (kritik kayıp penceresi)"
    }
  },
  {
    "slug": "tel-dunning-01",
    "idx": "TEL-04",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp",
      "whatsapp"
    ],
    "sector": {
      "en": "Telecom",
      "tr": "Telekom"
    },
    "journey": {
      "en": "Payment Failure",
      "tr": "Ödeme hatası"
    },
    "title": {
      "en": "Overdue bill (payment follow-up)",
      "tr": "Fatura gecikti (ödeme takibi)"
    }
  },
  {
    "slug": "tel-adopt-01",
    "idx": "TEL-05",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Telecom",
      "tr": "Telekom"
    },
    "journey": {
      "en": "Feature Adoption",
      "tr": "Özellik benimseme"
    },
    "title": {
      "en": "Self-service app adoption",
      "tr": "Self servis uygulama kullanımı"
    }
  },
  {
    "slug": "tel-winback-01",
    "idx": "TEL-06",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "Telecom",
      "tr": "Telekom"
    },
    "journey": {
      "en": "Winback",
      "tr": "Geri kazanım"
    },
    "title": {
      "en": "Win-back for canceled or ported-out subscribers",
      "tr": "Numara taşıyan veya iptal eden geri kazanımı"
    }
  },
  {
    "slug": "tel-nps-01",
    "idx": "TEL-07",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Telecom",
      "tr": "Telekom"
    },
    "journey": {
      "en": "Feedback Nps",
      "tr": "Geri bildirim / NPS"
    },
    "title": {
      "en": "Post-service satisfaction and follow-through",
      "tr": "Hizmet sonrası memnuniyet ve aksiyon"
    }
  },
  {
    "slug": "hea-continuity-01",
    "idx": "HEALTH-01",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Health",
      "tr": "Sağlık"
    },
    "journey": {
      "en": "Churn Prevention",
      "tr": "Kayıp önleme"
    },
    "title": {
      "en": "Drop in program consistency",
      "tr": "Program devamlılığında düşüş"
    }
  },
  {
    "slug": "hea-reactivate-01",
    "idx": "HEALTH-02",
    "channels": [
      "email",
      "push",
      "sms"
    ],
    "sector": {
      "en": "Health",
      "tr": "Sağlık"
    },
    "journey": {
      "en": "Reactivation",
      "tr": "Yeniden etkinleştirme"
    },
    "title": {
      "en": "Reactivating a member who's drifting away",
      "tr": "Uzaklaşan üyeyi yeniden aktive etme"
    }
  },
  {
    "slug": "hea-milestone-01",
    "idx": "HEALTH-03",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Health",
      "tr": "Sağlık"
    },
    "journey": {
      "en": "Milestone",
      "tr": "Kilometre taşı"
    },
    "title": {
      "en": "Goal and streak celebration",
      "tr": "Hedef ve seri kutlaması"
    }
  },
  {
    "slug": "hea-premium-01",
    "idx": "HEALTH-04",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Health",
      "tr": "Sağlık"
    },
    "journey": {
      "en": "Trial Conversion",
      "tr": "Deneme dönüşümü"
    },
    "title": {
      "en": "Converting free users to premium coaching",
      "tr": "Ücretsizden premium koçluğa geçiş"
    }
  },
  {
    "slug": "hea-referral-01",
    "idx": "HEALTH-05",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Health",
      "tr": "Sağlık"
    },
    "journey": {
      "en": "Referral",
      "tr": "Arkadaş getir"
    },
    "title": {
      "en": "From success to referral",
      "tr": "Başarıdan davete"
    }
  },
  {
    "slug": "hea-checkup-01",
    "idx": "HEALTH-06",
    "channels": [
      "email",
      "push",
      "sms",
      "whatsapp"
    ],
    "sector": {
      "en": "Health",
      "tr": "Sağlık"
    },
    "journey": {
      "en": "Anniversary",
      "tr": "Yıl dönümü"
    },
    "title": {
      "en": "Periodic checkup reminder",
      "tr": "Periyodik kontrol hatırlatması"
    }
  },
  {
    "slug": "hea-nps-01",
    "idx": "HEALTH-07",
    "channels": [
      "email",
      "push",
      "sms",
      "inapp"
    ],
    "sector": {
      "en": "Health",
      "tr": "Sağlık"
    },
    "journey": {
      "en": "Feedback Nps",
      "tr": "Geri bildirim / NPS"
    },
    "title": {
      "en": "Post-program satisfaction and follow-up action",
      "tr": "Program sonrası memnuniyet ve aksiyon"
    }
  }
];
