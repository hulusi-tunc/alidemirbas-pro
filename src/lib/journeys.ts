// Generated from the live archive at alidemirbas.com.tr/lab/crm-journeys, then
// extended with the orchestration facts each journey declares about itself.
// The descriptive half says what the journey is. The orchestration half is what
// lets a send engine answer, for one person at one moment, which journey wins
// and whether it may send at all - see orchestration.ts, which is the only
// place those rules live now.
import type { Channel, JourneyOrchestration } from "@/lib/orchestration";

export type Journey = {
  slug: string;
  idx: string;
  /** Channels this journey CAN run on - not the ones its example sequence
      happens to use. A sequence showing only email and push under a badge that
      also lists SMS is correct: it is one build of the journey, not the only
      one. The reverse is a genuine error and the validator treats it as one -
      a step may not send on a channel the journey does not declare. */
  channels: Channel[];
  sector: { en: string; tr: string };
  journey: { en: string; tr: string };
  title: { en: string; tr: string };
} & JourneyOrchestration;

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
    },
    "priority": "cart-intent",
    "family": "commerce-intent",
    "exclusionGroup": "purchase-intent-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "high-intent-triggered",
    "exitEvents": [
      "cart_emptied",
      "product_out_of_stock"
    ],
    "handoffEvents": {
      "purchase_completed": "ecom-second-01"
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
    },
    "priority": "browse-discovery",
    "family": "commerce-intent",
    "exclusionGroup": "purchase-intent-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [],
    "handoffEvents": {
      "added_to_cart": "ecom-cart-01",
      "purchase_completed": "ecom-second-01"
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
    },
    "priority": "triggered-info",
    "family": "commerce-intent",
    "exclusionGroup": "purchase-intent-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "high-intent-triggered",
    "exitEvents": [
      "target_product_purchased",
      "product_out_of_stock"
    ],
    "handoffEvents": {
      "added_to_cart": "ecom-cart-01"
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
    },
    "priority": "triggered-info",
    "family": "commerce-intent",
    "exclusionGroup": "purchase-intent-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "high-intent-triggered",
    "exitEvents": [
      "target_product_purchased",
      "price_returned_to_normal",
      "product_out_of_stock"
    ],
    "handoffEvents": {}
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
    },
    "priority": "expansion",
    "family": "post-purchase",
    "exclusionGroup": "post-purchase-followup",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "reorder_completed",
      "auto_replenishment_activated"
    ],
    "handoffEvents": {}
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
    },
    "priority": "expansion",
    "family": "post-purchase",
    "exclusionGroup": "post-purchase-followup",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "reorder_completed",
      "order_cancelled"
    ],
    "handoffEvents": {
      "order_returned": "ecom-recovery-01",
      "guest_order_delivered": "ecom-guest-01"
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
    },
    "priority": "winback",
    "family": "win-back",
    "exclusionGroup": "retention-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "purchase_completed"
    ],
    "handoffEvents": {
      "added_to_cart": "ecom-cart-01"
    }
  },
  {
    "slug": "ecom-guest-01",
    "idx": "ECOM-08",
    "channels": [
      "email",
      "push"
    ],
    "sector": {
      "en": "E-commerce",
      "tr": "E-ticaret"
    },
    "journey": {
      "en": "Account Activation",
      "tr": "Hesap oluşturma"
    },
    "title": {
      "en": "Guest buyer to account holder",
      "tr": "Misafir alıcıdan hesap sahibine"
    },
    "priority": "activation",
    "family": "lifecycle-start",
    "exclusionGroup": null,
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "account_created",
      "support_ticket_opened"
    ],
    "handoffEvents": {}
  },
  {
    "slug": "ecom-recovery-01",
    "idx": "ECOM-09",
    "channels": [
      "email",
      "push"
    ],
    "sector": {
      "en": "E-commerce",
      "tr": "E-ticaret"
    },
    "journey": {
      "en": "Service Recovery",
      "tr": "Hizmet telafisi"
    },
    "title": {
      "en": "Winning back confidence after a return",
      "tr": "İade sonrası güveni geri kazanma"
    },
    "priority": "risk-service",
    "family": "retention-risk",
    "exclusionGroup": null,
    "communicationClass": "operational",
    "frequencyClass": "service-critical",
    "exitEvents": [
      "purchase_completed",
      "support_ticket_opened"
    ],
    "handoffEvents": {}
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
    },
    "priority": "browse-discovery",
    "family": "commerce-intent",
    "exclusionGroup": "purchase-intent-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [],
    "handoffEvents": {
      "booking_completed": "ota-pretrip-01",
      "checkout_started": "ota-checkout-01"
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
    },
    "priority": "checkout-abandonment",
    "family": "commerce-intent",
    "exclusionGroup": "purchase-intent-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "high-intent-triggered",
    "exitEvents": [
      "departure_date_passed"
    ],
    "handoffEvents": {
      "booking_completed": "ota-pretrip-01"
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
    },
    "priority": "triggered-info",
    "family": "commerce-intent",
    "exclusionGroup": "purchase-intent-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "high-intent-triggered",
    "exitEvents": [
      "price_returned_to_normal"
    ],
    "handoffEvents": {
      "booking_completed": "ota-pretrip-01",
      "checkout_started": "ota-checkout-01"
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
    },
    "priority": "risk-service",
    "family": "post-purchase",
    "exclusionGroup": null,
    "communicationClass": "operational",
    "frequencyClass": "service-critical",
    "exitEvents": [
      "booking_cancelled"
    ],
    "handoffEvents": {
      "trip_completed": "ota-review-01"
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
    },
    "priority": "expansion",
    "family": "revenue-growth",
    "exclusionGroup": "post-purchase-followup",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "accommodation_booked",
      "flight_departed",
      "booking_cancelled"
    ],
    "handoffEvents": {}
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
    },
    "priority": "promotional",
    "family": "engagement",
    "exclusionGroup": "soft-engagement",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "support_ticket_opened"
    ],
    "handoffEvents": {
      "rebooking_completed": "ota-pretrip-01"
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
    },
    "priority": "winback",
    "family": "win-back",
    "exclusionGroup": "retention-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [],
    "handoffEvents": {
      "booking_completed": "ota-pretrip-01",
      "flight_searched": "ota-aband-01"
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
    },
    "priority": "activation",
    "family": "lifecycle-start",
    "exclusionGroup": "conversion-window",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "trial_converted",
      "cancellation_completed"
    ],
    "handoffEvents": {}
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
    },
    "priority": "activation",
    "family": "lifecycle-start",
    "exclusionGroup": "conversion-window",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "trial_converted"
    ],
    "handoffEvents": {
      "activation_completed": "saas-trial-01"
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
    },
    "priority": "activation",
    "family": "engagement",
    "exclusionGroup": null,
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "feature_adopted"
    ],
    "handoffEvents": {}
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
    },
    "priority": "retention",
    "family": "retention-risk",
    "exclusionGroup": "retention-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "usage_recovered",
      "plan_upgraded"
    ],
    "handoffEvents": {}
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
    },
    "priority": "risk-service",
    "family": "retention-risk",
    "exclusionGroup": null,
    "communicationClass": "operational",
    "frequencyClass": "service-critical",
    "exitEvents": [
      "payment_recovered",
      "cancellation_completed"
    ],
    "handoffEvents": {}
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
    },
    "priority": "activation",
    "family": "lifecycle-start",
    "exclusionGroup": null,
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "account_activated"
    ],
    "handoffEvents": {
      "onboarding_completed": "saas-activate-01"
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
    },
    "priority": "expansion",
    "family": "revenue-growth",
    "exclusionGroup": null,
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "plan_upgraded",
      "seat_purchased"
    ],
    "handoffEvents": {
      "value_tier_dropped": "saas-churn-01"
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
    },
    "priority": "activation",
    "family": "lifecycle-start",
    "exclusionGroup": null,
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "account_activated"
    ],
    "handoffEvents": {
      "onboarding_completed": "fin-card-activate-01"
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
    },
    "priority": "activation",
    "family": "lifecycle-start",
    "exclusionGroup": null,
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "card_activated"
    ],
    "handoffEvents": {}
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
    },
    "priority": "winback",
    "family": "win-back",
    "exclusionGroup": "retention-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "session_resumed"
    ],
    "handoffEvents": {}
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
    },
    "priority": "activation",
    "family": "engagement",
    "exclusionGroup": null,
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "feature_adopted"
    ],
    "handoffEvents": {}
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
    },
    "priority": "expansion",
    "family": "revenue-growth",
    "exclusionGroup": null,
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "target_product_purchased"
    ],
    "handoffEvents": {
      "value_tier_dropped": "fin-churn-01"
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
    },
    "priority": "activation",
    "family": "engagement",
    "exclusionGroup": null,
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "profile_completed"
    ],
    "handoffEvents": {}
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
    },
    "priority": "retention",
    "family": "retention-risk",
    "exclusionGroup": "retention-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "usage_recovered"
    ],
    "handoffEvents": {}
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
    },
    "priority": "activation",
    "family": "lifecycle-start",
    "exclusionGroup": "conversion-window",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [],
    "handoffEvents": {
      "purchase_completed": "mkt-second-01"
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
    },
    "priority": "expansion",
    "family": "post-purchase",
    "exclusionGroup": "post-purchase-followup",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "order_returned",
      "support_ticket_opened"
    ],
    "handoffEvents": {
      "reorder_completed": "mkt-category-01"
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
    },
    "priority": "retention",
    "family": "retention-risk",
    "exclusionGroup": "retention-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "purchase_completed",
      "user_became_dormant"
    ],
    "handoffEvents": {}
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
    },
    "priority": "expansion",
    "family": "revenue-growth",
    "exclusionGroup": "post-purchase-followup",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "target_product_purchased"
    ],
    "handoffEvents": {}
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
    },
    "priority": "winback",
    "family": "win-back",
    "exclusionGroup": "retention-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [],
    "handoffEvents": {
      "session_resumed": "mkt-activate-01",
      "purchase_completed": "mkt-second-01"
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
    },
    "priority": "promotional",
    "family": "engagement",
    "exclusionGroup": "soft-engagement",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "reward_redeemed"
    ],
    "handoffEvents": {}
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
    },
    "priority": "promotional",
    "family": "engagement",
    "exclusionGroup": "soft-engagement",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "reward_redeemed",
      "campaign_ended"
    ],
    "handoffEvents": {}
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
    },
    "priority": "activation",
    "family": "lifecycle-start",
    "exclusionGroup": "conversion-window",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "tutorial_completed"
    ],
    "handoffEvents": {}
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
    },
    "priority": "winback",
    "family": "win-back",
    "exclusionGroup": "retention-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "session_resumed"
    ],
    "handoffEvents": {}
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
    },
    "priority": "activation",
    "family": "revenue-growth",
    "exclusionGroup": "conversion-window",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "purchase_completed",
      "subscription_activated"
    ],
    "handoffEvents": {}
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
    },
    "priority": "activation",
    "family": "lifecycle-start",
    "exclusionGroup": null,
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "notifications_opted_in"
    ],
    "handoffEvents": {}
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
    },
    "priority": "promotional",
    "family": "engagement",
    "exclusionGroup": "soft-engagement",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "referral_completed"
    ],
    "handoffEvents": {}
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
    },
    "priority": "promotional",
    "family": "engagement",
    "exclusionGroup": "soft-engagement",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "next_milestone_reached"
    ],
    "handoffEvents": {
      "tier_changed": "game-loyalty-01"
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
    },
    "priority": "promotional",
    "family": "engagement",
    "exclusionGroup": "soft-engagement",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "reward_redeemed",
      "tier_retained"
    ],
    "handoffEvents": {}
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
    },
    "priority": "activation",
    "family": "lifecycle-start",
    "exclusionGroup": "conversion-window",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "subscription_activated",
      "trial_converted"
    ],
    "handoffEvents": {}
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
    },
    "priority": "winback",
    "family": "win-back",
    "exclusionGroup": "retention-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "subscription_activated"
    ],
    "handoffEvents": {
      "session_resumed": "media-trial-01"
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
    },
    "priority": "retention",
    "family": "retention-risk",
    "exclusionGroup": "retention-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "cancellation_aborted",
      "subscription_reactivated"
    ],
    "handoffEvents": {
      "cancellation_completed": "media-winback-01"
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
    },
    "priority": "winback",
    "family": "win-back",
    "exclusionGroup": "retention-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "subscription_reactivated"
    ],
    "handoffEvents": {}
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
    },
    "priority": "expansion",
    "family": "revenue-growth",
    "exclusionGroup": null,
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "plan_upgraded",
      "cancellation_completed"
    ],
    "handoffEvents": {}
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
    },
    "priority": "activation",
    "family": "engagement",
    "exclusionGroup": null,
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "feature_adopted"
    ],
    "handoffEvents": {}
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
    },
    "priority": "promotional",
    "family": "engagement",
    "exclusionGroup": "soft-engagement",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "next_milestone_reached",
      "streak_broken"
    ],
    "handoffEvents": {}
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
    },
    "priority": "activation",
    "family": "lifecycle-start",
    "exclusionGroup": "conversion-window",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [],
    "handoffEvents": {
      "first_lesson_completed": "edu-premium-01"
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
    },
    "priority": "promotional",
    "family": "engagement",
    "exclusionGroup": "soft-engagement",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "next_milestone_reached",
      "streak_broken"
    ],
    "handoffEvents": {}
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
    },
    "priority": "winback",
    "family": "win-back",
    "exclusionGroup": "retention-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "subscription_activated"
    ],
    "handoffEvents": {
      "session_resumed": "edu-activate-01"
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
    },
    "priority": "activation",
    "family": "lifecycle-start",
    "exclusionGroup": "conversion-window",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "subscription_activated",
      "trial_converted"
    ],
    "handoffEvents": {}
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
    },
    "priority": "activation",
    "family": "lifecycle-start",
    "exclusionGroup": null,
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [],
    "handoffEvents": {
      "account_created": "edu-activate-01"
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
    },
    "priority": "expansion",
    "family": "revenue-growth",
    "exclusionGroup": "post-purchase-followup",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "target_product_purchased"
    ],
    "handoffEvents": {}
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
    },
    "priority": "promotional",
    "family": "engagement",
    "exclusionGroup": "soft-engagement",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "reward_redeemed"
    ],
    "handoffEvents": {}
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
    },
    "priority": "activation",
    "family": "lifecycle-start",
    "exclusionGroup": null,
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "feature_adopted",
      "cancellation_completed"
    ],
    "handoffEvents": {}
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
    },
    "priority": "expansion",
    "family": "revenue-growth",
    "exclusionGroup": null,
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "plan_upgraded",
      "add_on_purchased",
      "payment_failed"
    ],
    "handoffEvents": {}
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
    },
    "priority": "retention",
    "family": "retention-risk",
    "exclusionGroup": "retention-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "contract_renewed",
      "plan_upgraded"
    ],
    "handoffEvents": {
      "cancellation_completed": "tel-winback-01",
      "number_ported_out": "tel-winback-01"
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
    },
    "priority": "risk-service",
    "family": "retention-risk",
    "exclusionGroup": null,
    "communicationClass": "operational",
    "frequencyClass": "service-critical",
    "exitEvents": [
      "payment_recovered",
      "payment_plan_arranged"
    ],
    "handoffEvents": {}
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
    },
    "priority": "activation",
    "family": "engagement",
    "exclusionGroup": null,
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "feature_adopted"
    ],
    "handoffEvents": {}
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
    },
    "priority": "winback",
    "family": "win-back",
    "exclusionGroup": "retention-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [],
    "handoffEvents": {
      "subscription_reactivated": "tel-onboard-01"
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
    },
    "priority": "promotional",
    "family": "engagement",
    "exclusionGroup": "soft-engagement",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "issue_resolved",
      "referral_completed",
      "support_ticket_opened"
    ],
    "handoffEvents": {}
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
    },
    "priority": "retention",
    "family": "retention-risk",
    "exclusionGroup": "retention-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "session_resumed",
      "cancellation_completed"
    ],
    "handoffEvents": {
      "inactivity_threshold_reached": "hea-reactivate-01"
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
    },
    "priority": "winback",
    "family": "win-back",
    "exclusionGroup": "retention-ladder",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [],
    "handoffEvents": {
      "session_resumed": "hea-premium-01"
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
    },
    "priority": "promotional",
    "family": "engagement",
    "exclusionGroup": "soft-engagement",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "next_goal_started"
    ],
    "handoffEvents": {}
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
    },
    "priority": "activation",
    "family": "lifecycle-start",
    "exclusionGroup": "conversion-window",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "trial_converted"
    ],
    "handoffEvents": {}
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
    },
    "priority": "promotional",
    "family": "engagement",
    "exclusionGroup": "soft-engagement",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "referral_completed"
    ],
    "handoffEvents": {}
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
    },
    "priority": "promotional",
    "family": "engagement",
    "exclusionGroup": "soft-engagement",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "appointment_booked",
      "checkup_completed"
    ],
    "handoffEvents": {}
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
    },
    "priority": "promotional",
    "family": "engagement",
    "exclusionGroup": "soft-engagement",
    "communicationClass": "marketing",
    "frequencyClass": "standard-promotional",
    "exitEvents": [
      "issue_resolved",
      "referral_completed",
      "support_ticket_opened"
    ],
    "handoffEvents": {}
  }
];
