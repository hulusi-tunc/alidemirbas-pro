import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Flame,
  Gift,
  Globe,
  Lock,
  CreditCard,
  Heart,
  Landmark,
  LayoutGrid,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Ruler,
  Search,
  SearchX,
  Share,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Smartphone,
  Star,
  Truck,
  UserRound,
  X,
  LoaderCircle, Quote, ThumbsUp, TriangleAlert,
} from "lucide-react";

import { PixelHighlight } from "@/components/ui/PixelHighlight";
import { ScaledPage } from "@/components/ui/ScaledPage";
import { clsx } from "@/lib/clsx";
import type { AbElementKind, AbVariableKind } from "@/lib/ab-test-playbook";

/* THE SCREEN (Hulusi, 2026-09-20: "so low-fi - we want half low-fi, half
   high-fi; the high-fi part should be super realistic, real UI, to show the
   difference of the test"). One side of an A/B test drawn as a screen: the
   page the test runs on as a LOW-FI skeleton - bars and blocks for the
   words and photographs, real interface words for the chrome - and on it
   the TESTED ELEMENT as real UI: a button with its label, a coupon field
   with Apply, a countdown, a free-shipping bar, trust badges, a form, a
   nav, product cards, a plan table, a pop-up. The eye is sent to the
   element by the homepage's own device, PixelHighlight: the rose ring with
   the pixel pass confined inside it.

   DRAWN AT REAL SIZE, SHOWN SMALL (2026-09-20, second pass: "the screens
   are small but the components inside look so big - it looks like a
   toy"). A page is laid out at PAGE_W - 14px links, 40px inputs, four
   product columns, 40px gutters, the sizes a real shop has - and
   ui/ScaledPage shrinks the whole thing to the window, the way a
   screenshot of a website is a 1120px page seen at 40%. Nothing in here
   knows it is small.

   TWO CLASSIFIERS FEED IT (lib/ab-test-playbook.ts): abElementKind says
   WHICH element to draw, abVariableKind says HOW the two sides differ, and
   the difference is applied to that element - present on one side and a
   dashed slot on the other, quiet then loud, three fields then five,
   ink then brand blue, step order swapped, the pop-up on load then after a
   scroll. A kind an element has no drawing for falls back to the element's
   normal state on both sides.

   THE HONESTY RULE: labels are real interface words ("Add to cart",
   "Coupon code", "Free shipping") and VALUES ARE BARS. No price, no count,
   no time, no review score is typed into a screen - the record never
   states one, and a number on a page is read as a fact. A countdown shows
   digit tiles with bars in them; a price is a bar in a price's place;
   stars are outlines. The brands are logoipsum placeholders. */

type Lang = "en" | "tr";
export type AbSide = "a" | "b" | "solo";

/** The laid-out width of a desktop page and of a phone page. */
const PAGE_W = 1120;
const PHONE_W = 390;

const UI = {
  addToCart: { en: "Add to cart", tr: "Sepete ekle" },
  buyNow: { en: "Buy now", tr: "Hemen al" },
  checkout: { en: "Checkout", tr: "Ödemeye geç" },
  continue: { en: "Continue", tr: "Devam et" },
  getStarted: { en: "Get started", tr: "Başla" },
  apply: { en: "Apply", tr: "Uygula" },
  couponCode: { en: "Coupon code", tr: "Kupon kodu" },
  haveCoupon: { en: "Have a coupon code?", tr: "Kupon kodun var mı?" },
  codeApplied: { en: "Code applied", tr: "Kod uygulandı" },
  freeShipping: { en: "Free shipping", tr: "Ücretsiz kargo" },
  freeReturns: { en: "Free returns", tr: "Ücretsiz iade" },
  securePayment: { en: "Secure payment", tr: "Güvenli ödeme" },
  saleEndsIn: { en: "Sale ends in", tr: "İndirimin bitmesine" },
  hours: { en: "hours", tr: "saat" },
  minutes: { en: "minutes", tr: "dakika" },
  seconds: { en: "seconds", tr: "saniye" },
  total: { en: "Total", tr: "Toplam" },
  subtotal: { en: "Subtotal", tr: "Ara toplam" },
  shipping: { en: "Shipping", tr: "Kargo" },
  perMonth: { en: "/ month", tr: "/ ay" },
  search: { en: "Search", tr: "Ara" },
  searchProducts: { en: "Search products", tr: "Ürün ara" },
  filters: { en: "Filters", tr: "Filtreler" },
  size: { en: "Size", tr: "Beden" },
  colour: { en: "Colour", tr: "Renk" },
  priceFilter: { en: "Price", tr: "Fiyat" },
  sortBy: { en: "Sort by", tr: "Sırala" },
  fullName: { en: "Full name", tr: "Ad Soyad" },
  email: { en: "Email", tr: "E-posta" },
  phone: { en: "Phone", tr: "Telefon" },
  address: { en: "Address", tr: "Adres" },
  city: { en: "City", tr: "Şehir" },
  optional: { en: "optional", tr: "isteğe bağlı" },
  helper: { en: "We only use this for delivery updates.", tr: "Sadece teslimat bilgilendirmesi için kullanılır." },
  continueWithGoogle: { en: "Continue with Google", tr: "Google ile devam et" },
  continueAsGuest: { en: "Continue as guest", tr: "Üye olmadan devam et" },
  savedCard: { en: "Saved card", tr: "Kayıtlı kart" },
  card: { en: "Card", tr: "Kart" },
  bankTransfer: { en: "Bank transfer", tr: "Havale" },
  wallet: { en: "Wallet", tr: "Cüzdan" },
  steps: { en: ["Cart", "Shipping", "Payment"], tr: ["Sepet", "Teslimat", "Ödeme"] },
  home: { en: "Home", tr: "Ana sayfa" },
  shop: { en: "Shop", tr: "Mağaza" },
  sale: { en: "Sale", tr: "İndirim" },
  about: { en: "About", tr: "Hakkında" },
  mostPopular: { en: "Most popular", tr: "En popüler" },
  monthly: { en: "Monthly", tr: "Aylık" },
  yearly: { en: "Yearly", tr: "Yıllık" },
  plans: { en: ["Basic", "Pro", "Team"], tr: ["Temel", "Pro", "Ekip"] },
  choose: { en: "Choose plan", tr: "Planı seç" },
  quantity: { en: "Quantity", tr: "Adet" },
  reviews: { en: "Reviews", tr: "Yorumlar" },
  notNow: { en: "Not now", tr: "Şimdi değil" },
  allow: { en: "Allow", tr: "İzin ver" },
  onLoad: { en: "on load", tr: "açılışta" },
  afterScroll: { en: "after a scroll", tr: "kaydırınca" },
  absent: { en: "absent", tr: "yok" },
  forYou: { en: "For returning visitors", tr: "Geri dönen ziyaretçiler için" },
  sticky: { en: "stays while scrolling", tr: "kaydırırken sabit" },
  outOfStock: { en: "Out of stock", tr: "Stokta yok" },
  add: { en: "Add", tr: "Ekle" },
  newArrivals: { en: "New arrivals", tr: "Yeni gelenler" },
  yourCart: { en: "Your cart", tr: "Sepetin" },
  description: { en: "Description", tr: "Açıklama" },
  choosePlan: { en: "Choose your plan", tr: "Planını seç" },
  createAccount: { en: "Create your account", tr: "Hesabını oluştur" },
  trustedBy: { en: "Trusted by", tr: "Güvenenler" },
  results: { en: "results", tr: "sonuç" },
  viewAll: { en: "View all", tr: "Tümünü gör" },
  // the second wave
  loadMore: { en: "Load more", tr: "Daha fazla yükle" },
  page: { en: "Page", tr: "Sayfa" },
  sizeGuide: { en: "Size guide", tr: "Beden tablosu" },
  modelWears: { en: "Model wears size M", tr: "Manken M beden giyiyor" },
  trueToSize: { en: "Fits true to size", tr: "Kalıbı tam" },
  findMySize: { en: "Find my size", tr: "Bedenimi bul" },
  deliveryBy: { en: "Delivery", tr: "Teslimat" },
  madeIn: { en: "Made in", tr: "Menşe" },
  returnsIn: { en: "Free returns within 30 days", tr: "30 gün içinde ücretsiz iade" },
  faq: { en: "Frequently asked questions", tr: "Sık sorulan sorular" },
  howItWorks: { en: "How it works", tr: "Nasıl çalışır" },
  useCases: { en: "Use cases", tr: "Kullanım senaryoları" },
  meetTheTeam: { en: "Meet the team", tr: "Ekip" },
  learnMore: { en: "Learn more", tr: "Daha fazla" },
  getTheApp: { en: "Get the app", tr: "Uygulamayı indir" },
  downloadGuide: { en: "Download the guide", tr: "Rehberi indir" },
  inviteFriends: { en: "Invite friends", tr: "Arkadaşlarını davet et" },
  createAccountCta: { en: "Create an account", tr: "Hesap oluştur" },
  chatWithUs: { en: "Chat with us", tr: "Bize yazın" },
  welcome: { en: "Welcome", tr: "Hoş geldin" },
  skip: { en: "Skip", tr: "Geç" },
  next: { en: "Next", tr: "İleri" },
  gotIt: { en: "Got it", tr: "Anladım" },
  whyWeAsk: { en: "Why we ask", tr: "Neden istiyoruz" },
  recentlyViewed: { en: "Recently viewed", tr: "Son gezilenler" },
  viewed: { en: "Viewed", tr: "Görüldü" },
  profileComplete: { en: "Profile completion", tr: "Profil tamamlanma" },
  youSave: { en: "You save", tr: "Kazancın" },
  noResults: { en: "No results", tr: "Sonuç yok" },
  tryAgain: { en: "Try another search", tr: "Başka bir arama dene" },
  clearFilters: { en: "Clear filters", tr: "Filtreleri temizle" },
  recommended: { en: "Recommended", tr: "Önerilen" },
  newest: { en: "Newest", tr: "En yeni" },
  priceLowHigh: { en: "Price: low to high", tr: "Fiyat: artan" },
  sellingFast: { en: "Selling fast", tr: "Hızla tükeniyor" },
  onlyLeft: { en: "Only a few left", tr: "Son birkaç adet" },
  viewingNow: { en: "people viewing now", tr: "kişi şu an bakıyor" },
  single: { en: "Single", tr: "Tekli" },
  pack: { en: "Pack", tr: "Paket" },
  customise: { en: "Customise", tr: "Özelleştir" },
  engraving: { en: "Add engraving", tr: "Yazı ekle" },
  startTrial: { en: "Start free trial", tr: "Ücretsiz denemeyi başlat" },
  days7: { en: "7 days", tr: "7 gün" },
  days14: { en: "14 days", tr: "14 gün" },
  days30: { en: "30 days", tr: "30 gün" },
  workEmail: { en: "Work email", tr: "İş e-postası" },
  benefits: { en: "Benefits", tr: "Avantajlar" },
  specs: { en: "Specs", tr: "Özellikler" },
  contact: { en: "Contact", tr: "İletişim" },
  overview: { en: "Overview", tr: "Genel" },
  thankYou: { en: "Thank you for your order", tr: "Siparişin için teşekkürler" },
  orderConfirmed: { en: "Order confirmed", tr: "Sipariş onaylandı" },
  orderNumber: { en: "Order number", tr: "Sipariş numarası" },
  trackOrder: { en: "Track order", tr: "Siparişi takip et" },
  continueShopping: { en: "Continue shopping", tr: "Alışverişe devam et" },
  dashboard: { en: "Dashboard", tr: "Panel" },
  revenue: { en: "Revenue", tr: "Gelir" },
  orders: { en: "Orders", tr: "Siparişler" },
  visitors: { en: "Visitors", tr: "Ziyaretçiler" },
  conversion: { en: "Conversion", tr: "Dönüşüm" },
  resultsFor: { en: "Results for", tr: "Arama sonuçları" },
  notifications: { en: "Notifications", tr: "Bildirimler" },
  welcomeBack: { en: "Welcome back", tr: "Tekrar hoş geldin" },
  continueWhereLeft: { en: "Continue where you left off", tr: "Kaldığın yerden devam et" },
  resumeCta: { en: "Resume", tr: "Devam et" },
  everyone: { en: "Everyone", tr: "Herkes" },
  fromAd: { en: "From the ad", tr: "Reklamdan gelen" },
  fromSearch: { en: "From search", tr: "Aramadan gelen" },
  matchedToYou: { en: "Matched to your industry", tr: "Sektörüne göre eşleşen" },
  completeProfile: { en: "Complete your profile", tr: "Profilini tamamla" },
  placeFirstOrder: { en: "Place your first order", tr: "İlk siparişini ver" },
  hello: { en: "Hello", tr: "Merhaba" },
  bonjour: { en: "Bonjour", tr: "Merhaba" },
  hallo: { en: "Hallo", tr: "Merhaba" },
  detectedLanguage: { en: "shown in your language", tr: "senin dilinde" },
  list: { en: "List", tr: "Liste" },
  map: { en: "Map", tr: "Harita" },
  // the records whose difference is on the button, in the headline, in a flow
  send: { en: "Send", tr: "Gönder" },
  getMyQuote: { en: "Get my quote", tr: "Fiyat teklifimi al" },
  tryFirst: { en: "Try it first", tr: "Önce dene" },
  seeThePrice: { en: "See the price", tr: "Fiyatı gör" },
  start: { en: "Start", tr: "Başlat" },
  imStarting: { en: "I'm starting", tr: "Başlıyorum" },
  tryForFree: { en: "Try for free", tr: "Ücretsiz dene" },
  startDaysFree: { en: "Start 14 days free", tr: "14 gün ücretsiz başla" },
  problemHeadline: { en: "Losing leads to slow follow-up?", tr: "Geç dönüş yüzünden müşteri mi kaçıyor?" },
  solutionHeadline: { en: "Follow up with every lead in minutes", tr: "Her müşteriye dakikalar içinde dönün" },
  abstractBenefit: { en: "Work more efficiently", tr: "Daha verimli çalışın" },
  concreteBenefit: { en: "Cut report prep time in half", tr: "Rapor hazırlama süresini yarıya indirin" },
  benefitLine: { en: "Close more deals.", tr: "Daha çok satış kapatın." },
  featureLine: { en: "One shared inbox for your team.", tr: "Ekibiniz için tek bir ortak gelen kutusu." },
  forIndividuals: { en: "For personal use", tr: "Bireysel kullanım için" },
  forTeams: { en: "For your team", tr: "Ekibiniz için" },
  lossFrame: { en: "Your trial ends soon. You will lose your saved work.", tr: "Deneme süreniz bitiyor. Kayıtlı çalışmalarınız silinecek." },
  gainFrame: { en: "Keep everything you built. Upgrade to continue.", tr: "Kurduğunuz her şey sizinle kalsın. Devam etmek için yükseltin." },
  upgrade: { en: "Upgrade", tr: "Yükselt" },
  standardDelivery: { en: "Standard delivery", tr: "Standart teslimat" },
  expressDelivery: { en: "Express delivery", tr: "Hızlı teslimat" },
  processingPayment: { en: "Processing your payment", tr: "Ödemeniz işleniyor" },
  verifyingCard: { en: "Verifying card", tr: "Kart doğrulanıyor" },
  bankApproval: { en: "Waiting for bank approval", tr: "Banka onayı bekleniyor" },
  creatingOrder: { en: "Creating your order", tr: "Sipariş oluşturuluyor" },
  done: { en: "Done", tr: "Bitti" },
  placeOrder: { en: "Place order", tr: "Sipariş ver" },
  autoAdvance: { en: "moves on by itself", tr: "kendiliğinden ilerler" },
  mostHelpful: { en: "Most helpful", tr: "En faydalı" },
  relevance: { en: "Relevance", tr: "İlgi düzeyi" },
  bestSelling: { en: "Best selling", tr: "Çok satan" },
  nameWord: { en: "name", tr: "ad" },
  serviceWord: { en: "service", tr: "hizmet" },
} as const;

const CAPTION: Record<AbVariableKind, Record<Lang, string>> = {
  timing: { en: "The moment is the variable, not what appears.", tr: "Değişken olan an; ne göründüğü değil." },
  threshold: { en: "Where the line sits is the variable.", tr: "Çizginin nereye konduğu değişken." },
  quantity: { en: "How many are shown is the variable, not what they look like.", tr: "Değişken kaç tane gösterildiği; nasıl göründükleri değil." },
  ordering: { en: "The sequence is the variable.", tr: "Değişken olan sıranın kendisi." },
  "ordering-nav": { en: "Position in the menu is the variable.", tr: "Menü içindeki sıra değişken." },
  hierarchy: { en: "Which information leads is the variable.", tr: "Hangi bilginin başa geçtiği değişken." },
  emphasis: { en: "How hard the same message is pushed is the variable.", tr: "Aynı mesajın ne kadar öne çıkarıldığı değişken." },
  anatomy: { en: "Several properties are in scope, not one.", tr: "Kapsamda tek bir özellik değil, birkaçı var." },
  microcopy: { en: "The words in the slot are the variable.", tr: "Alandaki sözler değişken." },
  placement: { en: "Where it sits is the variable; the element itself does not change.", tr: "Değişken nerede durduğu; öğenin kendisi değişmiyor." },
  presence: { en: "Absent on one side, present on the other.", tr: "Bir tarafta yok, öbüründe var." },
  behavior: { en: "What the interface does on its own is the variable.", tr: "Arayüzün kendiliğinden ne yaptığı değişken." },
  personalization: { en: "Who the visitor is decides what fills the slot.", tr: "Alanı neyin dolduracağına ziyaretçinin kim olduğu karar veriyor." },
  default: { en: "Which option arrives already chosen is the variable.", tr: "Hangi seçeneğin hazır seçili geldiği değişken." },
  size: { en: "The same element, larger or smaller.", tr: "Aynı öğe, daha büyük ya da daha küçük." },
  style: { en: "The visual treatment is the variable, not the words or the position.", tr: "Değişken görsel biçim; sözler ya da konum değil." },
  format: { en: "The same value, presented two ways.", tr: "Aynı değer, iki farklı sunumla." },
  options: { en: "Two alternatives; neither is the incumbent.", tr: "İki alternatif; hiçbiri mevcut hâl değil." },
  media: { en: "The asset itself is the variable.", tr: "Değişken görselin kendisi." },
  layout: { en: "How the blocks are arranged is the variable.", tr: "Blokların nasıl dizildiği değişken." },
  wording: { en: "Same slot, different words.", tr: "Aynı alan, farklı sözler." },
};

export function abCaption(kind: AbVariableKind, lang: Lang): string {
  return CAPTION[kind][lang];
}

/** Placeholder brands (logoipsum, supplied by Hulusi 2026-09-20): the
    first is the shop the screens belong to, the rest are the customer
    logos a record can test. Nothing here is a real company. */
const BRAND = "/lab/logoipsum/brand-1.svg";
const CUSTOMER_LOGOS = [2, 3, 4, 5, 6].map((n) => `/lab/logoipsum/brand-${n}.svg`);

/* ---- the skeleton, low-fi: words and photographs as bars and tiles ---- */

/** A line of 14px body text. */
function Bar({ w = "w-full", className = "" }: { w?: string; className?: string }) {
  return <span aria-hidden className={clsx("block h-2 rounded-full bg-ink-950/10", w, className)} />;
}
/** A heading. */
function Title({ w = "w-2/3", className = "", size = "md" }: { w?: string; className?: string; size?: "sm" | "md" | "lg" }) {
  return <span aria-hidden className={clsx("block rounded bg-ink-950/85", size === "lg" ? "h-7" : size === "sm" ? "h-3" : "h-4", w, className)} />;
}
/** A photograph's place: a soft two-tone tile. */
function Img({ className = "", video = false }: { className?: string; video?: boolean }) {
  return (
    <span aria-hidden className={clsx("grid place-items-center rounded-lg bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300", className)}>
      {video ? <span className="grid size-12 place-items-center rounded-full bg-paper/90 text-ink-900 shadow-md"><Play className="size-5 fill-current" /></span> : null}
    </span>
  );
}
/** A price where a price goes. */
function PriceBar({ big = false, className = "" }: { big?: boolean; className?: string }) {
  return <span aria-hidden className={clsx("block rounded bg-ink-950/85", big ? "h-6 w-24" : "h-3.5 w-14", className)} />;
}

/* ---- the real UI, high-fi -------------------------------------------- */

function Btn({ children, tone = "ink", size = "md", shape = "rounded-md", className = "" }: { children: ReactNode; tone?: "ink" | "primary" | "outline" | "link" | "ghost" | "white"; size?: "sm" | "md" | "lg"; shape?: string; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap",
        shape,
        size === "sm" ? "h-8 px-3 text-[12px]" : size === "lg" ? "h-12 px-6 text-[15px]" : "h-10 px-4 text-[13px]",
        tone === "primary" && "bg-primary-600 text-white",
        tone === "ink" && "bg-ink-950 text-white",
        tone === "outline" && "bg-paper text-ink-900 ring-1 ring-ink-950/[0.15]",
        tone === "ghost" && "bg-paper-soft text-ink-900",
        tone === "white" && "bg-white text-primary-700 shadow-sm",
        tone === "link" && "h-auto px-0 text-[13px] text-primary-700 underline underline-offset-2",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Field({ label, placeholder, floating = false, helper, tag, tall = false, required = false, focused = false }: { label: string; placeholder?: string; floating?: boolean; helper?: string; tag?: string; tall?: boolean; required?: boolean; focused?: boolean }) {
  return (
    <span className="block min-w-0">
      {!floating && (
        <span className="mb-1.5 flex items-center gap-2 text-[12px] font-medium text-ink-800">
          {label}
          {required ? <span className="-ml-1 text-rose-600">*</span> : null}
          {tag ? <span className="rounded bg-paper-soft px-1.5 py-0.5 text-[11px] font-normal text-ink-500">{tag}</span> : null}
        </span>
      )}
      <span className={clsx("relative flex items-center rounded-md bg-paper px-3 text-[13px] text-ink-400 ring-1", focused ? "ring-2 ring-primary-500" : "ring-ink-950/[0.14]", tall ? "h-12" : "h-10")}>
        {floating ? <span className="absolute top-1.5 left-3 text-[10px] font-medium text-ink-600">{label}</span> : null}
        <span className={floating ? "mt-3" : ""}>{placeholder ?? ""}</span>
        {focused ? <span aria-hidden className="ml-0.5 h-4 w-px bg-ink-900" /> : null}
      </span>
      {helper ? <span className="mt-1.5 block text-[11px] text-ink-500">{helper}</span> : null}
    </span>
  );
}

/** The highlight: the homepage's rose ring with the pixel pass inside it. */
function Spot({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <PixelHighlight className={clsx("rounded-lg ring-[3px] ring-rose-300 ring-offset-4 ring-offset-paper", className)}>
      {children}
    </PixelHighlight>
  );
}

/** Where the element would be, on the side that does not have it. */
function Ghost({ lang, className = "h-14" }: { lang: Lang; className?: string }) {
  return (
    <span className={clsx("grid place-items-center rounded-lg border-2 border-dashed border-rose-300 text-[12px] font-semibold tracking-wide text-rose-400 uppercase", className)}>
      {UI.absent[lang]}
    </span>
  );
}

/* ---- what the two sides do to one element ---------------------------- */

type Ctx = {
  kind: AbVariableKind;
  element: AbElementKind;
  surface: string;
  side: AbSide;
  present: boolean;
  /** A "remove" record runs the other way: the control has the more, the
      bigger, the louder, and the variant takes it away. */
  invert: boolean;
  /** The record's testedSlot, diacritics folded - so a family that holds
      several things (a delivery note or an origin line; the app banner or
      a guide download) can tell which one it is drawing. */
  slotFold: string;
  lang: Lang;
  phone: boolean;
};

const fold = (s: string) => s.toLowerCase().replace(/[ıİ]/g, "i").replace(/[şŞ]/g, "s").replace(/[ğĞ]/g, "g").replace(/[üÜ]/g, "u").replace(/[öÖ]/g, "o").replace(/[çÇ]/g, "c").replace(/â/g, "a");

/** `a` on side A, `b` on side B, `normal` when the kind is not this one
    (or on a solo drawing). */
function diff<T>(ctx: Ctx, kinds: AbVariableKind | AbVariableKind[], a: T, b: T, normal: T): T {
  const ks = Array.isArray(kinds) ? kinds : [kinds];
  if (!ks.includes(ctx.kind) || ctx.side === "solo") return normal;
  const onB = ctx.side === "b";
  return onB !== ctx.invert ? b : a;
}

/** The treatment side, whatever the variable kind: B, or A on a "remove"
    record, never on a solo drawing. The slot-specific drawings use it
    (2026-09-20: twenty-eight records drew the same screen twice, because
    a kind like "options" or "behavior" says nothing about WHAT the two
    options are - the slot does). */
function treat(ctx: Ctx): boolean {
  return ctx.side !== "solo" && (ctx.side === "b") !== ctx.invert;
}

/** A headline with real words in it, for the records whose variable IS
    the words: placeholder copy for the placeholder brand, never a figure. */
function Headline({ children, phone, muted = false }: { children: ReactNode; phone: boolean; muted?: boolean }) {
  return <span className={clsx("block font-semibold tracking-tight", phone ? "text-[24px] leading-[1.15]" : "text-[34px] leading-[1.1]", muted ? "text-ink-400" : "text-ink-950")}>{children}</span>;
}

/** A promo strip with a live countdown - the digits are bars. */
function Countdown({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const loud = diff(ctx, "emphasis", false, true, false);
  return (
    <span className={clsx("flex items-center gap-4 rounded-lg px-5 py-3 text-white", loud ? "bg-primary-600" : "bg-ink-950")}>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10"><Clock className="size-4" /></span>
      <span className="text-[14px] font-semibold">{UI.saleEndsIn[l]}</span>
      <span className="ml-auto flex items-center gap-2">
        {[UI.hours, UI.minutes, UI.seconds].map((u, i) => (
          <span key={u.en} className="flex items-center gap-2">
            <span className="flex w-14 flex-col items-center rounded-md bg-white/10 py-1.5 ring-1 ring-white/15">
              <span className="block h-5 w-7 rounded-sm bg-white/90" />
              <span className="mt-1 text-[9px] leading-none tracking-wide text-white/60 uppercase">{u[l]}</span>
            </span>
            {i < 2 ? <span className="text-[16px] font-semibold text-white/50">:</span> : null}
          </span>
        ))}
      </span>
    </span>
  );
}

function Cta({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const s = ctx.surface;
  const f = ctx.slotFold;
  const b = treat(ctx);
  const label = s === "cart" || s === "checkout" ? UI.checkout[l] : s === "form" || s === "saas" ? UI.continue[l] : s === "pdp" || s === "plp" ? UI.addToCart[l] : UI.getStarted[l];
  /* THE BUTTON RECORDS, each by its slot: the words on a button are
     interface words, so the two sides carry the two wordings for real. */
  if (/metni cercevesi/.test(f)) return <Btn tone="primary" size="lg">{b ? UI.getMyQuote[l] : UI.send[l]}</Btn>;
  if (/metni kipi/.test(f)) return <Btn tone="primary" size="lg">{b ? UI.imStarting[l] : UI.start[l]}</Btn>;
  if (/deneme cta/.test(f)) return <Btn tone="primary" size="lg">{b ? UI.startDaysFree[l] : UI.tryForFree[l]}</Btn>;
  if (/tutarlilig/.test(f)) {
    // Three sections' buttons, one under the other: three styles, or one.
    const styles: Array<{ tone: "primary" | "ink" | "outline"; shape: string }> = b
      ? [{ tone: "primary", shape: "rounded-md" }, { tone: "primary", shape: "rounded-md" }, { tone: "primary", shape: "rounded-md" }]
      : [{ tone: "primary", shape: "rounded-md" }, { tone: "ink", shape: "rounded-full" }, { tone: "outline", shape: "rounded-none" }];
    const words = [UI.getStarted[l], UI.addToCart[l], UI.learnMore[l]];
    return (
      <span className="flex flex-col gap-3">
        {styles.map((st, i) => (
          <span key={words[i]} className="flex items-center gap-4 rounded-lg bg-paper-soft px-4 py-3">
            <span className="flex-1"><Title size="sm" w="w-24" /><Bar className="mt-2" w="w-2/3" /></span>
            <Btn tone={st.tone} size="md" shape={st.shape}>{words[i]}</Btn>
          </span>
        ))}
      </span>
    );
  }
  if (/buton stili/.test(f)) return <Btn tone={b ? "outline" : "primary"} size="lg">{label}</Btn>;
  if (/ikincil aksiyon/.test(f)) {
    return (
      <span className="flex flex-wrap items-center gap-4">
        <Btn tone="primary" size="lg">{label}</Btn>
        {b ? <Btn tone="outline" size="lg">{UI.learnMore[l]}</Btn> : <Btn tone="link">{UI.learnMore[l]}</Btn>}
      </span>
    );
  }
  if (/taahhut/.test(f)) {
    return b
      ? <span className="flex flex-wrap items-center gap-3"><Btn tone="primary" size="lg">{UI.tryFirst[l]}</Btn><Btn tone="outline" size="lg">{UI.seeThePrice[l]}</Btn></span>
      : <Btn tone="ink" size="lg">{UI.buyNow[l]}</Btn>;
  }
  const wording = diff(ctx, ["wording", "microcopy"], label, s === "pdp" || s === "plp" ? UI.buyNow[l] : UI.getStarted[l], label);
  const tone = diff<"ink" | "primary" | "outline">(ctx, ["style", "anatomy"], "ink", "primary", diff(ctx, "emphasis", "outline", "primary", "primary"));
  const size = diff<"sm" | "md" | "lg">(ctx, ["size", "anatomy"], "md", "lg", diff(ctx, "emphasis", "md", "lg", "lg"));
  const two = diff(ctx, "quantity", false, true, false);
  return (
    <span className="flex flex-wrap items-center gap-3">
      <Btn tone={tone} size={size} className={two ? "" : "w-full"}>{s === "pdp" || s === "plp" ? <ShoppingBag className="size-4" /> : null}{wording}</Btn>
      {two ? <Btn tone="outline" size={size}>{UI.buyNow[l]}</Btn> : null}
    </span>
  );
}

function Coupon({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const asLink = diff(ctx, ["options", "format", "layout"], false, true, false);
  const applied = diff(ctx, "behavior", false, true, false);
  if (applied) {
    return (
      <span className="flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700">
        <Check className="size-4" /> {UI.codeApplied[l]}
      </span>
    );
  }
  if (asLink) return <Btn tone="link">{UI.haveCoupon[l]}</Btn>;
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-10 flex-1 items-center rounded-md bg-paper px-3 text-[13px] text-ink-400 ring-1 ring-ink-950/[0.14]">{UI.couponCode[l]}</span>
      <Btn tone="primary" size="md">{UI.apply[l]}</Btn>
    </span>
  );
}

function Shipping({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const at = diff(ctx, "threshold", 40, 70, 55);
  return (
    <span className="block rounded-lg bg-paper-soft px-4 py-3">
      <span className="flex items-center gap-2 text-[13px] font-medium text-ink-900"><Truck className="size-4 text-primary-600" />{UI.freeShipping[l]}<Bar w="w-24" className="ml-1" /></span>
      <span className="relative mt-2.5 block h-2 rounded-full bg-ink-950/10">
        <span className="absolute inset-y-0 left-0 rounded-full bg-primary-600" style={{ width: `${at}%` }} />
        <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-primary-600 bg-paper" style={{ left: `${at}%` }} />
      </span>
    </span>
  );
}

function Badges({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const f = ctx.slotFold;
  const b = treat(ctx);
  const items = [
    { icon: <ShieldCheck />, label: UI.securePayment[l] },
    { icon: <Truck />, label: UI.freeShipping[l] },
    { icon: <RotateCcw />, label: UI.freeReturns[l] },
  ];
  if (/bildirim isareti/.test(f)) {
    // The mark on the bell: a count (its digits a bar), or a dot.
    return (
      <span className="inline-flex items-center gap-4">
        <span className="relative grid size-10 place-items-center rounded-full bg-paper-soft text-ink-700">
          <Bell className="size-5" />
          {b ? <span className="absolute top-1 right-1 size-3 rounded-full bg-rose-600 ring-2 ring-paper" /> : <span className="absolute -top-0.5 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-600 px-1 ring-2 ring-paper"><span className="h-1.5 w-2.5 rounded-sm bg-white/90" /></span>}
        </span>
        <span className="text-[13px] font-medium text-ink-700">{UI.notifications[l]}</span>
      </span>
    );
  }
  if (/guvence listesi/.test(f)) {
    // The guarantees inside a paragraph, or as a list of their own.
    if (!b) {
      const ib = (w: string) => <span aria-hidden className={clsx("inline-block h-2 rounded-full bg-ink-950/10 align-middle", w)} />;
      return <span className="block text-[13px] leading-[1.9] text-ink-700">{ib("w-24")} {ib("w-10")} <span className="font-medium text-ink-900">{UI.securePayment[l]}</span> {ib("w-16")} {ib("w-8")} <span className="font-medium text-ink-900">{UI.freeShipping[l]}</span> {ib("w-20")} <span className="font-medium text-ink-900">{UI.freeReturns[l]}</span> {ib("w-12")}.</span>;
    }
    return <span className="flex flex-col gap-2">{items.map((x) => <span key={x.label} className="flex items-center gap-2 text-[13px] font-medium text-ink-800"><Check className="size-4 text-emerald-600" />{x.label}</span>)}</span>;
  }
  if (/dagilim/.test(f)) {
    // All the guarantees in one block, or each beside the worry it answers.
    const pill = (x: (typeof items)[number]) => <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-[12px] font-medium text-emerald-700 [&>svg]:size-4">{x.icon}{x.label}</span>;
    if (!b) return <span className="flex flex-wrap gap-2 rounded-lg bg-paper-soft p-4">{items.map((x) => <span key={x.label}>{pill(x)}</span>)}</span>;
    return (
      <span className="flex flex-col gap-3">
        <span className="flex items-center gap-4"><PriceBar big />{pill(items[2])}</span>
        <span className="flex items-center gap-4"><span className="h-10 flex-1 rounded-md bg-paper ring-1 ring-ink-950/[0.14]" />{pill(items[0])}</span>
        <span className="flex items-center gap-4"><Btn tone="primary" size="md">{UI.checkout[l]}</Btn>{pill(items[1])}</span>
      </span>
    );
  }
  const n = diff(ctx, "quantity", 2, 3, 3);
  const loud = diff(ctx, "emphasis", false, true, false);
  const column = diff(ctx, ["format", "layout", "options"], false, true, false);
  return (
    <span className={clsx("flex gap-2", column ? "flex-col" : "flex-wrap")}>
      {items.slice(0, n).map((x) => (
        <span key={x.label} className={clsx("inline-flex items-center gap-2 rounded-md text-[12px] font-medium [&>svg]:size-4", loud ? "bg-emerald-50 px-3 py-2 text-emerald-700" : "px-1 py-1 text-ink-600 [&>svg]:text-ink-400")}>
          {x.icon}{x.label}
        </span>
      ))}
    </span>
  );
}

function Price({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  if (/sayfadaki sira/.test(ctx.slotFold)) {
    // The price first and the benefits under it, or the other way round.
    const b = treat(ctx);
    const benefits = <span className="flex flex-col gap-2.5">{[0, 1, 2].map((i) => <span key={i} className="flex items-center gap-2"><Check className="size-4 text-primary-600" /><Bar w={i ? "w-2/3" : "w-4/5"} /></span>)}</span>;
    const price = <span className="flex items-end gap-2"><PriceBar big /><span className="pb-0.5 text-[12px] text-ink-500">{UI.perMonth[l]}</span></span>;
    return (
      <span className="flex max-w-sm flex-col gap-5 rounded-xl bg-paper p-6 ring-1 ring-ink-950/[0.1]">
        <span className="text-[15px] font-semibold text-ink-950">{UI.plans[l][1]}</span>
        {b ? <>{benefits}{price}</> : <>{price}{benefits}</>}
        <Btn tone="primary" size="md" className="w-full">{UI.choose[l]}</Btn>
      </span>
    );
  }
  const unit = diff(ctx, ["format", "options"], false, true, false);
  const big = diff(ctx, ["emphasis", "size"], false, true, true);
  const sale = diff(ctx, "emphasis", false, true, false);
  return (
    <span className="flex items-end gap-3">
      <PriceBar big={big} />
      {unit ? <span className="text-[12px] text-ink-500">{UI.perMonth[l]}</span> : null}
      {sale ? <span className="rounded bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">%</span> : null}
    </span>
  );
}

function Payment({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  if (/odeme yukleme/.test(ctx.slotFold)) {
    // While the payment runs: one spinner, or the steps it is going through.
    const b = treat(ctx);
    const steps = [UI.verifyingCard[l], UI.bankApproval[l], UI.creatingOrder[l]];
    return (
      <span className="flex flex-col items-center gap-4 rounded-xl bg-paper p-6 ring-1 ring-ink-950/[0.08]">
        {b ? (
          <span className="flex w-full flex-col gap-3">
            {steps.map((s, i) => (
              <span key={s} className={clsx("flex items-center gap-3 text-[13px] font-medium", i === 0 ? "text-ink-950" : i === 1 ? "text-ink-800" : "text-ink-400")}>
                {i === 0 ? <span className="grid size-6 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check className="size-3.5" /></span> : i === 1 ? <LoaderCircle className="size-6 text-primary-600" /> : <span className="size-6 rounded-full border-2 border-ink-200" />}
                {s}
              </span>
            ))}
          </span>
        ) : (
          <><LoaderCircle className="size-9 text-primary-600" /><span className="text-[13px] font-medium text-ink-700">{UI.processingPayment[l]}</span></>
        )}
      </span>
    );
  }
  const guest = diff(ctx, "presence", false, true, true) && ctx.present;
  const saved = diff(ctx, ["options", "format"], false, true, false);
  return (
    <span className="block">
      <span className="grid grid-cols-3 gap-2">
        {[{ i: <CreditCard />, t: saved ? UI.savedCard[l] : UI.card[l] }, { i: <Landmark />, t: UI.bankTransfer[l] }, { i: <Smartphone />, t: UI.wallet[l] }].map((m, i) => (
          <span key={m.t} className={clsx("flex flex-col items-center gap-1.5 rounded-md py-3 text-[12px] font-medium ring-1 [&>svg]:size-5", i === 0 ? "bg-primary-50 text-primary-700 ring-primary-200" : "bg-paper text-ink-700 ring-ink-950/[0.12]")}>
            {m.i}{m.t}
          </span>
        ))}
      </span>
      {guest && ctx.element === "payment" ? <span className="mt-3 block text-center"><Btn tone="link">{UI.continueAsGuest[l]}</Btn></span> : null}
    </span>
  );
}

function Stepper({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const f = ctx.slotFold;
  const b = treat(ctx);
  const row = (names: string[], active: number, ringed = -1) => (
    <span className="flex items-center gap-3">
      {names.map((s, i) => (
        <span key={s} className="flex flex-1 items-center gap-2">
          <span className={clsx("grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold", i === active ? "bg-primary-600 text-white" : i < active ? "bg-emerald-100 text-emerald-700" : "bg-paper-soft text-ink-500", i === ringed && "ring-2 ring-primary-300 ring-offset-2 ring-offset-paper")}>{i < active ? <Check className="size-3" /> : i + 1}</span>
          <span className={clsx("text-[13px] font-medium whitespace-nowrap", i === active ? "text-ink-950" : "text-ink-500")}>{s}</span>
          {i < names.length - 1 ? <span className="h-px flex-1 bg-ink-950/10" /> : null}
        </span>
      ))}
    </span>
  );
  if (/kayit adimi/.test(f)) {
    // Where the sign-up sits: first, or after the thing the visitor came to do.
    const names = b ? [UI.placeOrder[l], UI.createAccountCta[l], UI.done[l]] : [UI.createAccountCta[l], UI.placeOrder[l], UI.done[l]];
    return row(names, 0, b ? 1 : 0);
  }
  if (/adim gecis/.test(f)) {
    // A choice made: wait for "Continue", or move on by itself.
    const names = [...UI.steps[l]];
    return (
      <span className="flex flex-col gap-5">
        {row(names, b ? 2 : 1)}
        <span className="flex flex-col gap-2">
          {[UI.standardDelivery[l], UI.expressDelivery[l]].map((o, i) => <span key={o} className={clsx("flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium ring-1", i === 0 ? "bg-primary-50 text-primary-800 ring-primary-300" : "text-ink-800 ring-ink-950/[0.12]")}><span className={clsx("grid size-4 place-items-center rounded-full border-2", i === 0 ? "border-primary-600" : "border-ink-300")}>{i === 0 ? <span className="size-2 rounded-full bg-primary-600" /> : null}</span>{o}</span>)}
        </span>
        {b ? <span className="flex items-center gap-2 text-[12px] text-ink-500"><ArrowRight className="size-3.5" />{UI.autoAdvance[l]}</span> : <Btn tone="primary" size="md" className="w-fit">{UI.continue[l]}</Btn>}
      </span>
    );
  }
  let steps = [...UI.steps[l]];
  if (diff(ctx, ["ordering", "options"], false, true, false)) steps = [steps[1], steps[0], steps[2]];
  const single = diff(ctx, "options", true, false, false) && ctx.element === "stepper" && ctx.surface === "checkout";
  if (single) return <span className="flex items-center gap-2 text-[13px] font-medium text-ink-700"><span className="size-2.5 rounded-full bg-primary-600" />{steps.join(" · ")}</span>;
  return (
    <span className="flex items-center gap-3">
      {steps.map((s, i) => (
        <span key={s} className="flex flex-1 items-center gap-2">
          <span className={clsx("grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold", i === 0 ? "bg-primary-600 text-white" : "bg-paper-soft text-ink-500")}>{i + 1}</span>
          <span className={clsx("text-[13px] font-medium whitespace-nowrap", i === 0 ? "text-ink-950" : "text-ink-500")}>{s}</span>
          {i < steps.length - 1 ? <span className="h-px flex-1 bg-ink-950/10" /> : null}
        </span>
      ))}
    </span>
  );
}

function Form({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const f = ctx.slotFold;
  const b = treat(ctx);
  if (/ifade bicimi/.test(f) && b) {
    // The form as a sentence, the fields inside it.
    const slot = (w: string, word: string) => <span className={clsx("inline-flex h-9 items-center rounded-md bg-paper px-3 text-[13px] text-ink-400 ring-1 ring-ink-950/[0.14]", w)}>{word}</span>;
    return (
      <span className="flex flex-wrap items-center gap-x-2 gap-y-3 text-[16px] leading-none text-ink-800">
        {l === "tr"
          ? <>Ben {slot("w-28", UI.nameWord[l])}, {slot("w-24", UI.city[l].toLowerCase())}&apos;de {slot("w-28", UI.serviceWord[l])} arıyorum.</>
          : <>I&apos;m {slot("w-28", UI.nameWord[l])}, looking for {slot("w-28", UI.serviceWord[l])} in {slot("w-24", UI.city[l].toLowerCase())}.</>}
      </span>
    );
  }
  let fields: string[] = [UI.fullName[l], UI.email[l], UI.address[l]];
  if (diff(ctx, "quantity", false, true, false)) fields = [UI.fullName[l], UI.email[l], UI.phone[l], UI.address[l], UI.city[l]];
  if (diff(ctx, "ordering", false, true, false)) fields = [fields[1], fields[0], ...fields.slice(2)];
  const floating = diff(ctx, ["placement", "style", "options"], false, true, false);
  const twoCol = diff(ctx, "layout", false, true, false);
  const tall = diff(ctx, "size", false, true, false);
  const helper = diff(ctx, "presence", false, true, false) && ctx.present;
  // Required and optional marked on every field, or nothing marked at all.
  const marked = /zorunlu ve istege/.test(f) && b;
  // The cursor already in the first field when the page opens.
  const focusFirst = /imlec/.test(f) && b;
  return (
    <span className={clsx("grid gap-4", twoCol ? "grid-cols-2" : "grid-cols-1")}>
      {fields.map((field, i) => (
        <Field key={field} label={field} floating={floating} tall={tall} required={marked && i < fields.length - 1} tag={marked && i === fields.length - 1 ? UI.optional[l] : undefined} focused={focusFirst && i === 0} helper={helper && i === 1 ? UI.helper[l] : undefined} />
      ))}
    </span>
  );
}

function Nav({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  let items = [UI.home[l], UI.shop[l], UI.sale[l], UI.about[l]];
  if (/menu yapisi/.test(ctx.slotFold)) {
    // A mega menu or a plain one: both open on "Shop", so the structure
    // is the thing on show.
    const plain = treat(ctx);
    const shadow = "shadow-[0_24px_50px_-24px_rgb(10_16_32/0.45)] ring-1 ring-ink-950/[0.08]";
    return (
      <span className="block">
        <span className="flex h-14 items-center gap-8 px-5">
          <Image src={BRAND} alt="" aria-hidden width={130} height={26} className="h-6 w-auto" />
          {items.map((t, i) => <span key={t} className={clsx("flex items-center gap-1 text-[14px] font-medium", i === 1 ? "text-ink-950" : "text-ink-600")}>{t}{i === 1 ? <ChevronDown className="size-3.5" /> : null}</span>)}
        </span>
        {plain ? (
          <span className={clsx("flex w-48 flex-col gap-3 rounded-lg bg-paper p-4", ctx.phone ? "ml-24" : "ml-44", shadow)}>
            {[0, 1, 2, 3, 4].map((i) => <Bar key={i} w={i % 2 ? "w-20" : "w-28"} />)}
          </span>
        ) : (
          <span className={clsx("grid gap-6 rounded-lg bg-paper p-6", ctx.phone ? "grid-cols-2" : "grid-cols-4", shadow)}>
            {[0, 1, 2].map((c) => <span key={c} className="flex flex-col gap-2.5"><Title size="sm" w="w-20" className="mb-1" /><Bar w="w-24" /><Bar w="w-20" /><Bar w="w-28" /><Bar w="w-16" /></span>)}
            <Img className="h-28 w-full" />
          </span>
        )}
      </span>
    );
  }
  if (diff(ctx, ["ordering", "ordering-nav"], false, true, false)) items = [items[0], items[2], items[1], items[3]];
  const sticky = diff(ctx, "behavior", false, true, false);
  return (
    <span className={clsx("flex h-14 items-center gap-8 rounded-lg px-5", sticky ? "bg-paper shadow-[0_12px_30px_-16px_rgb(10_16_32/0.45)] ring-1 ring-ink-950/[0.06]" : "")}>
      <Image src={BRAND} alt="" aria-hidden width={130} height={26} className="h-6 w-auto" />
      {items.map((t, i) => <span key={t} className={clsx("text-[14px] font-medium", i === 1 ? "text-ink-950" : "text-ink-600")}>{t}</span>)}
      {sticky ? <span className="ml-auto rounded bg-paper-soft px-2 py-1 text-[11px] text-ink-500">{UI.sticky[l]}</span> : null}
    </span>
  );
}

function SearchBox({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const iconOnly = diff(ctx, "emphasis", true, false, false);
  if (iconOnly) return <span className="grid size-10 place-items-center rounded-md text-ink-600 ring-1 ring-ink-950/[0.14]"><Search className="size-4" /></span>;
  return (
    <span className="flex h-10 items-center gap-2.5 rounded-md bg-paper px-3 text-[13px] text-ink-400 ring-1 ring-ink-950/[0.14]">
      <Search className="size-4 text-ink-500" />{UI.searchProducts[l]}
    </span>
  );
}

function Filters({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const f = ctx.slotFold;
  const b = treat(ctx);
  if (/kaydirma/.test(f)) {
    // The same row; on the variant it has become a bar that stays put.
    return (
      <span className={clsx("flex flex-wrap items-center gap-2", b && "rounded-lg bg-paper p-2 shadow-[0_12px_30px_-16px_rgb(10_16_32/0.45)] ring-1 ring-ink-950/[0.06]")}>
        <span className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink-950 px-3 text-[12px] font-medium text-white"><SlidersHorizontal className="size-3.5" />{UI.filters[l]}</span>
        {[UI.size[l], UI.colour[l], UI.priceFilter[l]].map((c) => <span key={c} className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium text-ink-700 ring-1 ring-ink-950/[0.14]">{c}<ChevronDown className="size-3.5 text-ink-400" /></span>)}
        {b ? <span className="ml-auto rounded bg-paper-soft px-2 py-1 text-[11px] text-ink-500">{UI.sticky[l]}</span> : null}
      </span>
    );
  }
  if (/filtre paneli gorunurlug/.test(f)) {
    // The filters open on the page, or folded behind one button.
    if (b) return <span className="inline-flex h-10 items-center gap-2 rounded-md bg-ink-950 px-4 text-[13px] font-medium text-white"><SlidersHorizontal className="size-4" />{UI.filters[l]}</span>;
    return (
      <span className="flex flex-col gap-4 rounded-lg bg-paper-soft p-4">
        <span className="flex items-center gap-4 text-[13px] font-medium text-ink-800"><span className="w-14">{UI.size[l]}</span>{["S", "M", "L", "XL"].map((o, i) => <span key={o} className={clsx("grid h-8 min-w-8 place-items-center rounded-md px-2 text-[12px] font-semibold ring-1", i === 1 ? "bg-ink-950 text-white ring-ink-950" : "bg-paper text-ink-800 ring-ink-950/[0.15]")}>{o}</span>)}</span>
        <span className="flex items-center gap-4 text-[13px] font-medium text-ink-800"><span className="w-14">{UI.colour[l]}</span>{["bg-ink-950", "bg-stone-400", "bg-primary-600", "bg-rose-500", "bg-emerald-500"].map((c) => <span key={c} className={clsx("size-6 rounded-full ring-2 ring-paper", c)} />)}</span>
        <span className="flex items-center gap-4 text-[13px] font-medium text-ink-800"><span className="w-14">{UI.priceFilter[l]}</span><span className="relative mx-2 h-1.5 flex-1 rounded-full bg-ink-950/10"><span className="absolute inset-y-0 right-1/3 left-1/4 rounded-full bg-primary-600" /><span className="absolute -top-1.5 left-1/4 size-4 -translate-x-1/2 rounded-full bg-paper ring-2 ring-primary-600" /><span className="absolute -top-1.5 right-1/3 size-4 translate-x-1/2 rounded-full bg-paper ring-2 ring-primary-600" /></span></span>
      </span>
    );
  }
  const panel = diff(ctx, ["options", "format", "layout"], false, true, false);
  const chips = [UI.size[l], UI.colour[l], UI.priceFilter[l]];
  if (panel) {
    return (
      <span className="flex flex-col gap-2.5 rounded-lg bg-paper-soft p-4">
        {chips.map((c) => <span key={c} className="flex items-center justify-between text-[13px] font-medium text-ink-800">{c}<ChevronDown className="size-4 text-ink-400" /></span>)}
      </span>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink-950 px-3 text-[12px] font-medium text-white"><SlidersHorizontal className="size-3.5" />{UI.filters[l]}</span>
      {chips.map((c) => <span key={c} className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium text-ink-700 ring-1 ring-ink-950/[0.14]">{c}<ChevronDown className="size-3.5 text-ink-400" /></span>)}
    </span>
  );
}

function Popup({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  /* THE RING ON A POPUP (2026-09-20): the dialog itself is ringed, never the
     overlay. Wrapping the overlay in the Spot made it a zero-height strip at
     the foot of the page - PixelHighlight's `relative` beat the overlay's
     `absolute` - so no popup record showed its popup at all. */
  const ringed = ctx.side === "solo" || ctx.kind === "presence" || treat(ctx);
  const spot = (node: ReactNode, className: string) => (ringed ? <Spot className={className}>{node}</Spot> : <span className={clsx("block", className)}>{node}</span>);
  if (/sohbet/.test(ctx.slotFold)) {
    // The chat in the corner: its closed launcher, or the window already open.
    const open = treat(ctx);
    return (
      <span className="absolute inset-0 z-10 flex items-end justify-end p-8">
        {open ? spot(
          <span className="block overflow-hidden rounded-2xl bg-paper shadow-[0_32px_80px_-32px_rgb(10_16_32/0.6)] ring-1 ring-ink-950/[0.06]">
            <span className="flex items-center gap-3 bg-ink-950 px-4 py-3 text-white"><span className="size-8 rounded-full bg-white/20" /><span className="text-[13px] font-semibold">{UI.chatWithUs[l]}</span><X className="ml-auto size-4 text-white/60" /></span>
            <span className="flex flex-col gap-2 p-4">
              <span className="block w-3/4 rounded-2xl rounded-tl-sm bg-paper-soft p-3"><Bar /><Bar className="mt-1.5" w="w-2/3" /></span>
              <span className="ml-auto block w-1/2 rounded-2xl rounded-tr-sm bg-primary-600 p-3"><Bar className="bg-white/70" /></span>
            </span>
            <span className="flex items-center gap-2 border-t border-line-soft px-4 py-3"><span className="h-9 flex-1 rounded-md bg-paper-soft" /><span className="grid size-9 place-items-center rounded-md bg-primary-600 text-white"><ArrowRight className="size-4" /></span></span>
          </span>, "w-full max-w-[20rem]",
        ) : spot(
          <span className="grid size-14 place-items-center rounded-full bg-ink-950 text-white shadow-[0_16px_40px_-16px_rgb(10_16_32/0.5)]"><MessageCircle className="size-6" /></span>, "w-fit rounded-full",
        )}
      </span>
    );
  }
  const later = diff(ctx, "timing", false, true, false);
  const dim = diff(ctx, ["style", "options"], "bg-ink-950/20", "bg-ink-950/55", "bg-ink-950/35");
  const chat = ctx.surface === "saas" && diff(ctx, "behavior", false, true, false);
  return (
    <span className={clsx("absolute inset-0 z-10 grid p-8", dim, chat ? "items-end justify-end" : later ? "items-end justify-center pb-12" : "place-items-center")}>
      {spot(<span className="block rounded-2xl bg-paper p-6 shadow-[0_32px_80px_-32px_rgb(10_16_32/0.6)]">
        <span className="flex items-center justify-between"><Title w="w-32" size="sm" /><X className="size-4 text-ink-400" /></span>
        <Bar className="mt-4" /><Bar className="mt-2" w="w-3/4" />
        <span className="mt-5 flex gap-2"><Btn tone="outline" size="md" className="flex-1">{UI.notNow[l]}</Btn><Btn tone="primary" size="md" className="flex-1">{UI.allow[l]}</Btn></span>
        {ctx.kind === "timing" ? <span className="mt-3 block text-center text-[11px] text-ink-500">{later ? UI.afterScroll[l] : UI.onLoad[l]}</span> : null}
      </span>, "w-full max-w-[22rem]")}
    </span>
  );
}

function Media({ ctx }: { ctx: Ctx }) {
  if (/secenek gorsel/.test(ctx.slotFold)) {
    // Three options of equal weight, or one of them lifted above the others.
    const lifted = treat(ctx);
    return (
      <span className={clsx("grid items-end gap-4", ctx.phone ? "grid-cols-1" : "grid-cols-3")}>
        {[0, 1, 2].map((i) => {
          const hot = lifted && i === 1;
          return (
            <span key={i} className={clsx("flex flex-col gap-3 rounded-xl p-5 ring-1", hot ? "bg-primary-600 py-8 text-white ring-primary-600" : "bg-paper ring-ink-950/[0.1]")}>
              {hot ? <span className="w-fit rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">{UI.recommended[ctx.lang]}</span> : null}
              <Title size="sm" w="w-1/2" className={hot ? "bg-white/90" : ""} /><Bar className={hot ? "bg-white/25" : ""} /><Bar w="w-2/3" className={hot ? "bg-white/25" : ""} />
              <Btn tone={hot ? "white" : "outline"} size="sm">{UI.choose[ctx.lang]}</Btn>
            </span>
          );
        })}
      </span>
    );
  }
  const video = diff(ctx, ["media", "options"], false, true, false);
  const n = diff(ctx, "quantity", 1, 3, 1);
  const big = diff(ctx, "size", false, true, false);
  return (
    <span className="grid gap-3" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {Array.from({ length: n }, (_, i) => <Img key={i} video={video && i === 0} className={big ? "h-80" : "h-56"} />)}
    </span>
  );
}

function Reviews({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  if (/yorum sira/.test(ctx.slotFold)) {
    // The reviews sorted newest first, or most helpful first.
    const helpful = treat(ctx);
    return (
      <span className="block rounded-lg bg-paper-soft p-5">
        <span className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-ink-950">{UI.reviews[l]}</span>
          <span className="inline-flex h-8 items-center gap-1.5 rounded-md bg-paper px-2.5 text-[12px] font-medium text-ink-800 ring-1 ring-ink-950/[0.14]"><span className="text-ink-500">{UI.sortBy[l]}:</span>{helpful ? UI.mostHelpful[l] : UI.newest[l]}<ChevronDown className="size-3.5 text-ink-400" /></span>
        </span>
        {[0, 1].map((i) => (
          <span key={i} className="mt-4 block border-t border-line-soft pt-4">
            <span className="flex items-center gap-2">
              <span className="size-7 rounded-full bg-gradient-to-br from-stone-200 to-stone-300" />
              <span className="flex items-center gap-0.5 text-amber-500">{[0, 1, 2, 3, 4].map((k) => <Star key={k} className="size-3.5" />)}</span>
              {i === 0 ? (helpful
                ? <span className="ml-auto inline-flex items-center gap-1 rounded bg-primary-50 px-1.5 py-0.5 text-[11px] font-medium text-primary-700"><ThumbsUp className="size-3" />{UI.mostHelpful[l]}</span>
                : <span className="ml-auto inline-flex items-center gap-1 rounded bg-paper px-1.5 py-0.5 text-[11px] font-medium text-ink-500 ring-1 ring-ink-950/[0.08]"><Clock className="size-3" />{UI.newest[l]}</span>) : null}
            </span>
            <Bar className="mt-3" /><Bar className="mt-2" w="w-2/3" />
          </span>
        ))}
      </span>
    );
  }
  const photos = diff(ctx, "media", false, true, false);
  const video = diff(ctx, ["options", "media"], false, true, false) && ctx.surface !== "pdp";
  const matched = diff(ctx, "personalization", false, true, false);
  return (
    <span className={clsx("block rounded-lg p-5", matched ? "bg-primary-50 ring-1 ring-primary-200" : "bg-paper-soft")}>
      <span className="flex items-center justify-between">
        <span className="flex items-center gap-2"><span className="size-8 rounded-full bg-gradient-to-br from-stone-200 to-stone-300" /><span className="flex items-center gap-1 text-amber-500">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="size-4" />)}</span></span>
        <span className={clsx("text-[12px] font-medium", matched ? "text-primary-700" : "text-ink-600")}>{matched ? UI.matchedToYou[l] : UI.reviews[l]}</span>
      </span>
      <Bar className="mt-4" /><Bar className="mt-2" w="w-2/3" />
      {photos ? <span className="mt-4 flex gap-2"><Img className="size-16" /><Img className="size-16" /><Img className="size-16" /></span> : null}
      {video ? <Img video className="mt-4 h-40" /> : null}
    </span>
  );
}

/** A product card as a shop draws one. */
function ProductCard({ lang, list = false, priceFirst = false, badge, note, info }: { lang: Lang; list?: boolean; priceFirst?: boolean; badge?: ReactNode; note?: ReactNode; info?: "specs" | "story" }) {
  return (
    <span className={clsx("relative rounded-lg bg-paper p-2.5 ring-1 ring-ink-950/[0.06]", list ? "flex items-center gap-4" : "block")}>
      <Img className={list ? "size-20 shrink-0" : "aspect-[4/5] w-full"} />
      <span className={clsx("block min-w-0", list ? "flex-1" : "mt-3 px-0.5")}>
        {priceFirst ? <PriceBar /> : <Bar w="w-4/5" />}
        {priceFirst ? <Bar className="mt-2" w="w-4/5" /> : <PriceBar className="mt-2" />}
        {info === "specs" ? <span className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-ink-500">{UI.specs[lang]}<span className="inline-block h-1.5 w-8 rounded-full bg-ink-950/10" /><span className="inline-block h-1.5 w-6 rounded-full bg-ink-950/10" /><span className="inline-block h-1.5 w-7 rounded-full bg-ink-950/10" /></span> : null}
        {info === "story" ? <span className="mt-2 flex items-start gap-1.5"><Quote className="size-3 shrink-0 text-primary-600" /><span className="flex-1"><span className="block h-1.5 w-full rounded-full bg-primary-600/30" /><span className="mt-1 block h-1.5 w-3/4 rounded-full bg-primary-600/30" /></span></span> : null}
        {!list ? <span className="mt-3 flex items-center justify-between"><Heart className="size-4 text-ink-300" /><Btn tone="outline" size="sm">{UI.add[lang]}</Btn></span> : null}
      </span>
      {badge}{note}
      {list ? <Btn tone="outline" size="sm">{UI.addToCart[lang]}</Btn> : null}
    </span>
  );
}

function Grid({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  // AB-029: what the card says under its name - the specs, or a line of story.
  const info = /liste sayfasi mesaji/.test(ctx.slotFold) ? (treat(ctx) ? "story" : "specs") : undefined;
  const base = ctx.phone ? 2 : 4;
  const cols = diff(ctx, "quantity", base - 1, base, base);
  const list = diff(ctx, ["options", "layout"], false, true, false);
  const priceFirst = diff(ctx, "hierarchy", false, true, false);
  const badge = diff(ctx, "presence", false, true, false) && ctx.present;
  const stock = diff(ctx, ["options", "format"], false, true, false) && ctx.kind !== "quantity";
  const items = Array.from({ length: list ? 2 : cols }, (_, i) => i);
  return (
    <span className={clsx("grid gap-4", list ? "grid-cols-1" : "")} style={list ? undefined : { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {items.map((i) => (
        <ProductCard
          key={i}
          lang={l}
          list={list}
          info={info}
          priceFirst={priceFirst}
          badge={badge && i === 0 ? <span className="absolute top-4 left-4 rounded bg-rose-600 px-2 py-0.5 text-[11px] font-semibold text-white">%</span> : null}
          note={stock && i === 1 ? <span className="absolute top-4 right-4 rounded bg-paper px-2 py-0.5 text-[11px] font-medium text-ink-500 ring-1 ring-ink-950/[0.08]">{UI.outOfStock[l]}</span> : null}
        />
      ))}
    </span>
  );
}

function Plans({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  let names = [...UI.plans[l]];
  if (/plan sunum/.test(ctx.slotFold) && !treat(ctx)) {
    // The plans as one comparison table, row by row.
    const cols = `1.4fr repeat(${names.length}, 1fr)`;
    return (
      <span className="block overflow-hidden rounded-xl bg-paper ring-1 ring-ink-950/[0.1]">
        <span className="grid bg-paper-soft text-[13px] font-semibold text-ink-950" style={{ gridTemplateColumns: cols }}><span className="px-4 py-3" />{names.map((p) => <span key={p} className="px-4 py-3 text-center">{p}</span>)}</span>
        {[0, 1, 2, 3, 4].map((r) => (
          <span key={r} className="grid items-center border-t border-line-soft" style={{ gridTemplateColumns: cols }}>
            <span className="px-4 py-3"><Bar w={r % 2 ? "w-2/3" : "w-4/5"} /></span>
            {names.map((p, c) => <span key={p} className="grid place-items-center px-4 py-3">{c >= Math.floor(r / 2) ? <Check className="size-4 text-primary-600" /> : <Minus className="size-4 text-ink-300" />}</span>)}
          </span>
        ))}
        <span className="grid items-center border-t border-line-soft" style={{ gridTemplateColumns: cols }}><span className="px-4 py-3" />{names.map((p, i) => <span key={p} className="px-4 py-3"><Btn tone={i === 1 ? "primary" : "outline"} size="sm" className="w-full">{UI.choose[l]}</Btn></span>)}</span>
      </span>
    );
  }
  const n = diff(ctx, "quantity", 2, 3, 3);
  if (diff(ctx, "ordering", false, true, false)) names = [names[1], names[0], names[2]];
  const yearly = diff(ctx, "default", false, true, false);
  const popular = diff(ctx, "presence", false, true, true) && ctx.present;
  return (
    <span className="block">
      <span className="mx-auto mb-6 flex w-fit rounded-lg bg-paper-soft p-1 text-[13px] font-medium">
        <span className={clsx("rounded-md px-4 py-1.5", !yearly ? "bg-paper text-ink-950 shadow-sm" : "text-ink-500")}>{UI.monthly[l]}</span>
        <span className={clsx("rounded-md px-4 py-1.5", yearly ? "bg-paper text-ink-950 shadow-sm" : "text-ink-500")}>{UI.yearly[l]}</span>
      </span>
      <span className="grid gap-4" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {names.slice(0, n).map((p, i) => (
          <span key={p} className={clsx("relative flex flex-col gap-3 rounded-xl p-6 ring-1", i === 1 ? "bg-ink-950 text-white ring-ink-950" : "bg-paper text-ink-900 ring-ink-950/[0.1]")}>
            {popular && i === 1 ? <span className="absolute -top-3 left-6 rounded-full bg-primary-600 px-3 py-1 text-[11px] font-semibold text-white">{UI.mostPopular[l]}</span> : null}
            <span className="text-[15px] font-semibold">{p}</span>
            <span className={clsx("block h-7 w-24 rounded", i === 1 ? "bg-white/85" : "bg-ink-950/85")} />
            <span className="mt-2 flex flex-col gap-2">
              {[0, 1, 2, 3].map((k) => <span key={k} className="flex items-center gap-2"><Check className={clsx("size-3.5", i === 1 ? "text-white/70" : "text-primary-600")} /><Bar w={k % 2 ? "w-2/3" : "w-4/5"} className={i === 1 ? "bg-white/20" : ""} /></span>)}
            </span>
            <Btn tone={i === 1 ? "primary" : "outline"} size="md" className="mt-3 w-full">{UI.choose[l]}</Btn>
          </span>
        ))}
      </span>
    </span>
  );
}

function Selector({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const f = ctx.slotFold;
  const b = treat(ctx);
  if (/varsayilan isaretli/.test(f)) {
    // A neutral choice: nothing chosen, or the first one already ticked.
    return (
      <span className="flex flex-col gap-2">
        {[UI.standardDelivery[l], UI.expressDelivery[l]].map((o, i) => {
          const on = b && i === 0;
          return (
            <span key={o} className={clsx("flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium ring-1", on ? "bg-primary-50 text-primary-800 ring-primary-300" : "bg-paper text-ink-800 ring-ink-950/[0.12]")}>
              <span className={clsx("grid size-4 place-items-center rounded-full border-2", on ? "border-primary-600" : "border-ink-300")}>{on ? <span className="size-2 rounded-full bg-primary-600" /> : null}</span>
              {o}<PriceBar className="ml-auto" />
            </span>
          );
        })}
      </span>
    );
  }
  if (/adet secici/.test(f)) {
    // The quantity control: a faint little select, or a stepper you cannot miss.
    if (!b) return <span className="inline-flex items-center gap-2 text-[12px] text-ink-500">{UI.quantity[l]}<span className="inline-flex h-8 w-14 items-center justify-between rounded px-2 ring-1 ring-ink-950/[0.08]"><span className="h-2.5 w-3 rounded-sm bg-ink-950/50" /><ChevronDown className="size-3 text-ink-400" /></span></span>;
    return (
      <span className="inline-flex items-center gap-3 text-[13px] font-semibold text-ink-900">
        {UI.quantity[l]}
        <span className="inline-flex items-center overflow-hidden rounded-md ring-1 ring-primary-300"><span className="grid size-10 place-items-center bg-primary-50 text-primary-700"><Minus className="size-4" /></span><span className="mx-3 h-3 w-5 rounded bg-ink-950/70" /><span className="grid size-10 place-items-center bg-primary-50 text-primary-700"><Plus className="size-4" /></span></span>
      </span>
    );
  }
  const chips = diff(ctx, ["options", "format", "style"], false, true, false);
  const pre = diff(ctx, "default", false, true, true);
  if (ctx.surface === "cart" || ctx.surface === "checkout" || (ctx.element === "selector" && ctx.kind === "emphasis")) {
    return (
      <span className="inline-flex items-center gap-3 text-[13px] font-medium text-ink-700">
        {UI.quantity[l]}
        <span className="inline-flex items-center rounded-md ring-1 ring-ink-950/[0.15]"><span className="grid size-9 place-items-center"><Minus className="size-4" /></span><span className="h-3 w-5 rounded bg-ink-950/70" /><span className="grid size-9 place-items-center"><Plus className="size-4" /></span></span>
      </span>
    );
  }
  const opts = ["S", "M", "L", "XL"];
  return (
    <span className="flex items-center gap-2">
      {opts.map((o, i) =>
        chips ? (
          <span key={o} className={clsx("grid h-10 min-w-10 place-items-center rounded-md px-3 text-[13px] font-semibold ring-1", pre && i === 1 ? "bg-ink-950 text-white ring-ink-950" : "text-ink-800 ring-ink-950/[0.15]")}>{o}</span>
        ) : (
          <span key={o} className="flex items-center gap-1.5 text-[13px] text-ink-800"><span className={clsx("size-4 rounded-full border-2", pre && i === 1 ? "border-primary-600 bg-primary-600" : "border-ink-300")} />{o}</span>
        ),
      )}
    </span>
  );
}

function Text({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const loud = diff(ctx, "emphasis", false, true, false);
  const personal = diff(ctx, "personalization", false, true, false);
  const longer = diff(ctx, ["wording", "microcopy", "format"], false, true, false);
  const greeting = /dil/.test(ctx.slotFold);
  const f = ctx.slotFold;
  const b = treat(ctx);
  /* THE HEADLINE RECORDS: a bar cannot say whether a headline names the
     problem or the solution, so these carry real words. */
  if (/baslik cercevesi/.test(f)) return <span className="block"><Headline phone={ctx.phone}>{b ? UI.solutionHeadline[l] : UI.problemHeadline[l]}</Headline><Bar className="mt-4" w="w-2/3" /></span>;
  if (/somutlug/.test(f)) return <span className="block"><Headline phone={ctx.phone}>{b ? UI.concreteBenefit[l] : UI.abstractBenefit[l]}</Headline><Bar className="mt-4" w="w-2/3" /></span>;
  if (/ozellik ve fayda/.test(f)) {
    const [first, second] = b ? [UI.featureLine[l], UI.benefitLine[l]] : [UI.benefitLine[l], UI.featureLine[l]];
    return <span className="block"><Headline phone={ctx.phone}>{first}</Headline><Headline phone={ctx.phone} muted>{second}</Headline><Bar className="mt-4" w="w-2/3" /></span>;
  }
  if (/anlati/.test(f)) {
    // One story for everyone, or a block per kind of visitor.
    if (!b) return <span className="block"><Title size="lg" w="w-5/6" /><Title size="lg" w="w-3/5" className="mt-1" /><Bar className="mt-4" /><Bar className="mt-2" w="w-2/3" /></span>;
    return (
      <span className={clsx("grid gap-4", ctx.phone ? "grid-cols-1" : "grid-cols-2")}>
        {[UI.forIndividuals[l], UI.forTeams[l]].map((who, i) => (
          <span key={who} className="flex flex-col gap-3 rounded-xl bg-paper p-5 ring-1 ring-ink-950/[0.08]">
            <span className={clsx("w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold text-white", i ? "bg-ink-950" : "bg-primary-600")}>{who}</span>
            <Title size="md" w="w-4/5" /><Bar /><Bar w="w-2/3" />
            <Btn tone={i ? "ink" : "primary"} size="sm" className="w-fit">{UI.getStarted[l]}</Btn>
          </span>
        ))}
      </span>
    );
  }
  if (/deneme bitis/.test(f)) {
    // The end-of-trial notice: what you lose, or what you keep.
    return (
      <span className={clsx("flex items-start gap-4 rounded-xl p-5 ring-1", b ? "bg-emerald-50 ring-emerald-200" : "bg-amber-50 ring-amber-200")}>
        {b ? <Check className="mt-0.5 size-5 shrink-0 text-emerald-600" /> : <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" />}
        <span className="flex flex-1 flex-col gap-3">
          <span className={clsx("text-[15px] leading-snug font-semibold", b ? "text-emerald-900" : "text-amber-900")}>{b ? UI.gainFrame[l] : UI.lossFrame[l]}</span>
          <Btn tone={b ? "primary" : "ink"} size="md" className="w-fit">{UI.upgrade[l]}</Btn>
        </span>
      </span>
    );
  }
  if (/metin ici baglanti/.test(f)) {
    // The way onward: a button under the paragraph, or a link inside it.
    return (
      <span className="block">
        <Title size="lg" w="w-4/5" />
        <Bar className="mt-4" />
        {b
          ? <span className="mt-2 flex items-center gap-2"><Bar w="w-1/4" /><span className="text-[13px] font-medium text-primary-700 underline underline-offset-2">{UI.learnMore[l]}</span><Bar w="w-1/3" /></span>
          : <><Bar className="mt-2" w="w-3/4" /><Btn tone="outline" size="md" className="mt-4">{UI.learnMore[l]}</Btn></>}
      </span>
    );
  }
  if (personal && greeting) {
    // The greeting follows the browser's language: three visitors, three words.
    return (
      <span className="flex flex-col gap-2">
        {[UI.hello, UI.bonjour, UI.hallo].map((g, i) => <span key={g.en} className="flex items-center gap-3"><span className="rounded bg-paper-soft px-1.5 py-0.5 text-[10px] font-medium text-ink-500 uppercase">{["en", "fr", "de"][i]}</span><span className={clsx("text-[18px] font-semibold text-ink-950", i > 0 && "opacity-50")}>{g.en}</span>{i === 0 ? <span className="text-[11px] text-primary-700">{UI.detectedLanguage[l]}</span> : null}</span>)}
      </span>
    );
  }
  if (personal) {
    // A headline that answers where the visitor came from: the source
    // named on a tab, the words under it different for each.
    return (
      <span className="block">
        <span className="mb-3 flex gap-1.5">{[UI.fromAd[l], UI.fromSearch[l]].map((s, i) => <span key={s} className={clsx("rounded-md px-2 py-1 text-[11px] font-medium", i === 0 ? "bg-primary-600 text-white" : "bg-paper-soft text-ink-500")}>{s}</span>)}</span>
        <Title size="lg" w="w-4/5" className="bg-primary-700" /><Title size="lg" w="w-1/2" className="mt-1 bg-primary-700" />
        <Bar className="mt-3" w="w-2/3" />
      </span>
    );
  }
  return (
    <span className="block">
      <Title size={loud ? "lg" : "md"} w={loud ? "w-4/5" : "w-3/5"} />
      <Bar className="mt-3" w={longer ? "w-full" : "w-2/3"} />
      {longer ? <Bar className="mt-2" w="w-1/2" /> : null}
    </span>
  );
}

/** A strip of customer logos - grey and quiet, or in colour when the
    test pushes them. */
function Logos({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const n = diff(ctx, "quantity", 3, 5, 5);
  const colour = diff(ctx, "emphasis", false, true, false);
  return (
    <span className="block">
      <span className="block text-center text-[12px] font-medium text-ink-500">{UI.trustedBy[l]}</span>
      <span className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {CUSTOMER_LOGOS.slice(0, n).map((src) => (
          <Image key={src} src={src} alt="" aria-hidden width={130} height={26} className={clsx("h-6 w-auto", colour ? "" : "opacity-60 grayscale")} />
        ))}
      </span>
    </span>
  );
}

/* ---- the second wave -------------------------------------------------- */

/** Numbered pages, or a "load more" button under the grid. */
function Pagination({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const loadMore = diff(ctx, ["options", "format"], false, true, false);
  if (loadMore) return <span className="flex justify-center"><Btn tone="outline" size="md">{UI.loadMore[l]}</Btn></span>;
  return (
    <span className="flex items-center justify-center gap-1.5">
      <span className="grid size-9 place-items-center rounded-md text-ink-400"><ChevronLeft className="size-4" /></span>
      {[1, 2, 3, 4].map((n) => <span key={n} className={clsx("grid size-9 place-items-center rounded-md text-[13px] font-medium", n === 1 ? "bg-ink-950 text-white" : "text-ink-700 ring-1 ring-ink-950/[0.12]")}>{n}</span>)}
      <span className="text-[13px] text-ink-400">…</span>
      <span className="grid size-9 place-items-center rounded-md text-ink-700 ring-1 ring-ink-950/[0.12]"><ChevronRight className="size-4" /></span>
    </span>
  );
}

/** Size help beside the size selector: a link, a "find my size" button,
    the model's size, or the fit feedback line. */
function SizeGuide({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const asButton = diff(ctx, ["options", "format"], false, true, false);
  const modelLine = diff(ctx, "presence", false, true, true) && ctx.present;
  return (
    <span className="flex flex-col gap-2.5">
      {asButton ? <Btn tone="outline" size="sm" className="w-fit"><Ruler className="size-4" />{UI.findMySize[l]}</Btn> : <span className="inline-flex items-center gap-1.5 text-[13px] text-primary-700 underline underline-offset-2"><Ruler className="size-4" />{UI.sizeGuide[l]}</span>}
      {modelLine ? <span className="flex flex-col gap-1 text-[12px] text-ink-600"><span>{UI.modelWears[l]}</span><span className="flex items-center gap-1.5 text-emerald-700"><Check className="size-3.5" />{UI.trueToSize[l]}</span></span> : null}
    </span>
  );
}

/** Delivery, returns and origin as a small fact list. */
function Delivery({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const loud = diff(ctx, "emphasis", false, true, false);
  const origin = ctx.element === "delivery" && /mense/.test(ctx.slotFold);
  const rows: { icon: ReactNode; label: string; value?: ReactNode }[] = origin
    ? [{ icon: <Globe />, label: UI.madeIn[l], value: <Bar w="w-16" /> }]
    : [{ icon: <Truck />, label: UI.deliveryBy[l], value: <Bar w="w-20" /> }, { icon: <RotateCcw />, label: UI.returnsIn[l] }];
  return (
    <span className={clsx("flex flex-col gap-2.5 rounded-lg", loud ? "bg-emerald-50 p-4" : "")}>
      {rows.map((r) => (
        <span key={r.label} className={clsx("flex items-center gap-2.5 text-[13px] [&>svg]:size-4", loud ? "text-emerald-800 [&>svg]:text-emerald-600" : "text-ink-700 [&>svg]:text-ink-400")}>
          {r.icon}<span className="font-medium">{r.label}</span>{r.value}
        </span>
      ))}
    </span>
  );
}

/** An accordion of questions, the first open. */
function Faq({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  return (
    <span className="block">
      <span className="block text-[15px] font-semibold text-ink-950">{UI.faq[l]}</span>
      <span className="mt-3 flex flex-col divide-y divide-line-soft border-y border-line-soft">
        {[0, 1, 2].map((i) => (
          <span key={i} className="block py-3">
            <span className="flex items-center justify-between"><Bar w={i === 0 ? "w-3/5" : i === 1 ? "w-1/2" : "w-2/3"} className="h-2.5" /><ChevronDown className={clsx("size-4 text-ink-400", i === 0 && "rotate-180")} /></span>
            {i === 0 ? <><Bar className="mt-3" /><Bar className="mt-2" w="w-4/5" /></> : null}
          </span>
        ))}
      </span>
    </span>
  );
}

/** A content section: "how it works", use cases, the team, a closing CTA
    - drawn as a titled block whose shape the test varies. */
function Section({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const f = ctx.slotFold;
  const title = /nasil calisir/.test(f) ? UI.howItWorks[l] : /kullanim/.test(f) ? UI.useCases[l] : /uzman|kurucu/.test(f) ? UI.meetTheTeam[l] : /onay/.test(f) ? UI.orderConfirmed[l] : UI.learnMore[l];
  const team = /uzman|kurucu/.test(f);
  const zig = diff(ctx, "layout", false, true, false);
  const longer = diff(ctx, "options", false, true, false) && /uzunlug/.test(f);
  const bigIcons = diff(ctx, "size", false, true, false);
  const personal = diff(ctx, "personalization", false, true, false);
  const cols = team ? 3 : 3;
  return (
    <span className="block">
      <span className="flex items-baseline justify-between"><span className="text-[18px] font-semibold text-ink-950">{title}</span>{personal ? <span className="rounded bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">{UI.forYou[l]}</span> : null}</span>
      {zig ? (
        <span className="mt-4 flex flex-col gap-4">{[0, 1].map((i) => <span key={i} className={clsx("grid grid-cols-2 items-center gap-6", i % 2 ? "[&>*:first-child]:order-2" : "")}><Img className="h-28" /><span><Title w="w-2/3" /><Bar className="mt-3" /><Bar className="mt-2" w="w-3/4" /></span></span>)}</span>
      ) : (
        <span className="mt-4 grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }, (_, i) => (
            <span key={i} className="block rounded-lg bg-paper-soft p-4">
              {team ? <span className="mx-auto block size-14 rounded-full bg-gradient-to-br from-stone-200 to-stone-300" /> : <span className={clsx("grid place-items-center rounded-lg bg-primary-50 text-primary-700", bigIcons ? "size-14 [&>svg]:size-7" : "size-9 [&>svg]:size-4")}><Check /></span>}
              <Title size="sm" w="w-1/2" className={clsx("mt-3", team && "mx-auto")} /><Bar className={clsx("mt-2", team && "mx-auto")} w="w-4/5" />
            </span>
          ))}
        </span>
      )}
      {longer ? <span className="mt-4 grid grid-cols-3 gap-4">{[0, 1, 2].map((i) => <span key={i} className="block rounded-lg bg-paper-soft p-4"><Title size="sm" w="w-1/2" /><Bar className="mt-2" w="w-4/5" /></span>)}</span> : null}
    </span>
  );
}

/** The thin announcement bar above the nav. */
function TopBar({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  return (
    <span className="-mx-10 -mt-2 flex h-9 items-center justify-center gap-2 bg-ink-950 text-[12px] font-medium text-white">
      <Truck className="size-3.5" />{UI.freeShipping[l]}<span className="mx-1 text-white/40">·</span><RotateCcw className="size-3.5" />{UI.freeReturns[l]}
    </span>
  );
}

/** An offer banner: the app, a downloadable guide, an invitation. */
function Banner({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const f = ctx.slotFold;
  const app = /uygulama/.test(f); const guide = /indirilebilir/.test(f); const invite = /arkadas/.test(f);
  const icon = app ? <Smartphone /> : guide ? <Download /> : invite ? <Gift /> : <UserRound />;
  const cta = app ? UI.getTheApp[l] : guide ? UI.downloadGuide[l] : invite ? UI.inviteFriends[l] : UI.createAccountCta[l];
  return (
    <span className="flex items-center gap-4 rounded-xl bg-primary-50 p-4 ring-1 ring-primary-100">
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary-600 text-white [&>svg]:size-5">{icon}</span>
      <span className="min-w-0 flex-1"><Title size="sm" w="w-1/2" /><Bar className="mt-2" w="w-3/4" /></span>
      <Btn tone="primary" size="md">{cta}</Btn>
    </span>
  );
}

/** The live-chat launcher, bottom right. */
function Chat({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const labelled = diff(ctx, ["options", "format"], false, true, true);
  return (
    <span className="flex justify-end">
      <span className={clsx("inline-flex h-12 items-center gap-2 rounded-full bg-ink-950 text-[13px] font-semibold text-white shadow-[0_16px_40px_-16px_rgb(10_16_32/0.5)]", labelled ? "px-5" : "w-12 justify-center")}>
        <MessageCircle className="size-5" />{labelled ? UI.chatWithUs[l] : null}
      </span>
    </span>
  );
}

/** A first-run screen: welcome, a coach-mark tip, a permission rationale,
    a next-step suggestion. */
function Onboarding({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const f = ctx.slotFold;
  const tip = /ipuc/.test(f); const why = /gerekce/.test(f); const nextStep = /sonraki/.test(f);
  if (tip) {
    return (
      <span className="relative block rounded-xl bg-ink-950 p-4 text-white">
        <span aria-hidden className="absolute -top-2 left-8 size-4 rotate-45 bg-ink-950" />
        <Bar w="w-3/4" className="bg-white/25" /><Bar className="mt-2 bg-white/25" w="w-1/2" />
        <span className="mt-3 flex items-center justify-between"><span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className={clsx("size-1.5 rounded-full", i === 0 ? "bg-white" : "bg-white/30")} />)}</span><span className="text-[12px] font-semibold">{UI.gotIt[l]}</span></span>
      </span>
    );
  }
  if (nextStep) {
    const personal = diff(ctx, "personalization", false, true, false);
    if (personal) {
      // Three users, three suggestions - the one that fits is lit.
      const items = [{ i: <UserRound />, t: UI.completeProfile[l] }, { i: <ShoppingBag />, t: UI.placeFirstOrder[l] }, { i: <Smartphone />, t: UI.getTheApp[l] }];
      return (
        <span className="flex flex-col gap-2">
          {items.map((it, i) => <span key={it.t} className={clsx("flex items-center gap-3 rounded-xl p-3", i === 0 ? "bg-primary-600 text-white" : "bg-paper-soft text-ink-400")}><span className={clsx("grid size-9 shrink-0 place-items-center rounded-lg [&>svg]:size-4", i === 0 ? "bg-white/15" : "bg-paper")}>{it.i}</span><span className="flex-1 text-[13px] font-medium">{it.t}</span>{i === 0 ? <Btn tone="outline" size="sm">{UI.next[l]}</Btn> : null}</span>)}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-3 rounded-xl bg-paper-soft p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-700"><ArrowRight className="size-4" /></span>
        <span className="min-w-0 flex-1"><span className="text-[13px] font-medium text-ink-900">{UI.next[l]}</span><Bar className="mt-2" w="w-1/2" /></span>
        <Btn tone="primary" size="sm">{UI.next[l]}</Btn>
      </span>
    );
  }
  return (
    <span className="flex flex-col items-center gap-4 rounded-2xl bg-paper p-6 text-center ring-1 ring-ink-950/[0.08]">
      <span className="grid size-14 place-items-center rounded-full bg-primary-50 text-primary-700">{why ? <Bell className="size-6" /> : <Check className="size-6" />}</span>
      <span className="text-[17px] font-semibold text-ink-950">{why ? UI.whyWeAsk[l] : UI.welcome[l]}</span>
      <Bar w="w-4/5" /><Bar w="w-3/5" />
      <span className="mt-1 flex w-full gap-2"><Btn tone="outline" size="md" className="flex-1">{UI.skip[l]}</Btn><Btn tone="primary" size="md" className="flex-1">{why ? UI.allow[l] : UI.next[l]}</Btn></span>
    </span>
  );
}

/** A strip of recently viewed products, or a "viewed" mark on a card. */
function Recent({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const mark = /gorulen/.test(ctx.slotFold);
  if (mark) {
    return (
      <span className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <ProductCard key={i} lang={l} badge={i < 2 ? <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded bg-paper/95 px-1.5 py-0.5 text-[10px] font-medium text-ink-600 ring-1 ring-ink-950/[0.08]"><Check className="size-3" />{UI.viewed[l]}</span> : null} />)}
      </span>
    );
  }
  return (
    <span className="block">
      <span className="flex items-center justify-between"><span className="text-[15px] font-semibold text-ink-950">{UI.recentlyViewed[l]}</span><span className="text-[12px] text-ink-500">{UI.viewAll[l]}</span></span>
      <span className="mt-3 flex gap-3 overflow-hidden">{[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className="block w-24 shrink-0"><Img className="aspect-square w-full" /><Bar className="mt-2" w="w-4/5" /></span>)}</span>
    </span>
  );
}

/** A progress meter: profile completion, or the value of a pack. */
function Meter({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const value = /paket/.test(ctx.slotFold);
  return (
    <span className="block rounded-lg bg-paper-soft p-4">
      <span className="flex items-center justify-between text-[13px] font-medium text-ink-900">{value ? UI.youSave[l] : UI.profileComplete[l]}<span className="block h-3.5 w-10 rounded bg-ink-950/80" /></span>
      <span className="relative mt-3 block h-2 rounded-full bg-ink-950/10"><span className="absolute inset-y-0 left-0 w-[64%] rounded-full bg-primary-600" /></span>
      {!value ? <span className="mt-2 flex gap-1.5">{[0, 1, 2, 3].map((i) => <span key={i} className={clsx("size-5 rounded-full grid place-items-center", i < 3 ? "bg-primary-600 text-white" : "bg-paper ring-1 ring-ink-950/[0.12]")}>{i < 3 ? <Check className="size-3" /> : null}</span>)}</span> : null}
    </span>
  );
}

/** The zero-results page. */
function Empty({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const helpful = diff(ctx, "presence", false, true, true) && ctx.present;
  return (
    <span className="flex flex-col items-center gap-3 rounded-xl bg-paper-soft px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-paper text-ink-400 ring-1 ring-ink-950/[0.08]"><SearchX className="size-5" /></span>
      <span className="text-[16px] font-semibold text-ink-950">{UI.noResults[l]}</span>
      <Bar w="w-1/2" />
      {helpful ? <><span className="mt-1 flex gap-2"><Btn tone="outline" size="sm">{UI.clearFilters[l]}</Btn><Btn tone="primary" size="sm">{UI.tryAgain[l]}</Btn></span><span className="mt-3 grid w-full grid-cols-4 gap-3">{[0, 1, 2, 3].map((i) => <span key={i} className="block"><Img className="aspect-square w-full" /><Bar className="mt-2" w="w-4/5" /></span>)}</span></> : null}
    </span>
  );
}

/** The sort control with its default reading. */
function Sort({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  if (/varsayilan siralama/.test(ctx.slotFold)) {
    // The list open, the default ticked: relevance, or best selling.
    const names = [UI.relevance[l], UI.bestSelling[l], UI.newest[l], UI.priceLowHigh[l]];
    const picked = treat(ctx) ? 1 : 0;
    return (
      <span className="inline-flex flex-col items-start gap-1.5">
        <span className="inline-flex h-10 items-center gap-2 rounded-md bg-paper px-3 text-[13px] font-medium text-ink-800 ring-1 ring-ink-950/[0.14]"><span className="text-ink-500">{UI.sortBy[l]}:</span>{names[picked]}<ChevronDown className="size-4 rotate-180 text-ink-400" /></span>
        <span className="flex w-56 flex-col rounded-md bg-paper p-1 shadow-[0_24px_50px_-24px_rgb(10_16_32/0.45)] ring-1 ring-ink-950/[0.08]">
          {names.map((o, i) => <span key={o} className={clsx("flex items-center justify-between rounded px-2.5 py-1.5 text-[12px]", i === picked ? "bg-primary-50 font-semibold text-primary-800" : "text-ink-700")}>{o}{i === picked ? <Check className="size-3.5" /> : null}</span>)}
        </span>
      </span>
    );
  }
  const opts = [UI.recommended[l], UI.newest[l], UI.priceLowHigh[l]];
  const chosen = diff(ctx, ["ordering", "default", "options"], 0, 1, 0);
  return (
    <span className="inline-flex h-10 items-center gap-2 rounded-md bg-paper px-3 text-[13px] font-medium text-ink-800 ring-1 ring-ink-950/[0.14]">
      <span className="text-ink-500">{UI.sortBy[l]}:</span>{opts[chosen]}<ChevronDown className="size-4 text-ink-400" />
    </span>
  );
}

/** An urgency line: stock, or people looking. */
function Urgency({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const social = diff(ctx, ["options", "format"], false, true, false);
  return social ? (
    <span className="inline-flex items-center gap-2 text-[13px] text-ink-700"><span className="flex -space-x-1.5">{[0, 1, 2].map((i) => <span key={i} className="size-5 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 ring-2 ring-paper" />)}</span><span className="block h-3 w-5 rounded bg-ink-950/80" />{UI.viewingNow[l]}</span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-md bg-rose-50 px-3 py-1.5 text-[12px] font-medium text-rose-700"><Flame className="size-4" />{UI.onlyLeft[l]}</span>
  );
}

/** Pack sizes side by side, or a customise option. */
function Bundle({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const custom = /ozellestir/.test(ctx.slotFold);
  if (custom) {
    return (
      <span className="flex items-center justify-between rounded-lg p-3 ring-1 ring-ink-950/[0.12]">
        <span className="flex items-center gap-3"><span className="size-5 rounded border-2 border-ink-300" /><span className="text-[13px] font-medium text-ink-900">{UI.engraving[l]}</span></span>
        <PriceBar />
      </span>
    );
  }
  return (
    <span className="grid grid-cols-3 gap-2">
      {[UI.single[l], `${UI.pack[l]} ×3`, `${UI.pack[l]} ×5`].map((o, i) => (
        <span key={o} className={clsx("flex flex-col items-center gap-1.5 rounded-lg p-3 ring-1", i === 1 ? "bg-primary-50 text-primary-800 ring-primary-300" : "text-ink-800 ring-ink-950/[0.12]")}>
          <span className="text-[12px] font-semibold">{o}</span><PriceBar />{i === 1 ? <span className="rounded bg-primary-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">%</span> : null}
        </span>
      ))}
    </span>
  );
}

/** The trial's terms on a SaaS sign-up: its length, the email it asks for. */
function Steps({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const emailRule = /e-posta/.test(ctx.slotFold);
  if (emailRule) {
    const work = diff(ctx, ["options", "format"], false, true, false);
    return <Field label={work ? UI.workEmail[l] : UI.email[l]} placeholder={work ? "name@company.com" : "name@example.com"} />;
  }
  // AB-169 asks 7 or 14; the days are also drawn as a strip, so the length shows without reading.
  const trialLength = /deneme suresi/.test(ctx.slotFold);
  const days = trialLength ? (treat(ctx) ? UI.days14[l] : UI.days7[l]) : diff(ctx, ["options", "format", "quantity"], UI.days7[l], UI.days30[l], UI.days14[l]);
  const ticks = trialLength ? (treat(ctx) ? 14 : 7) : 0;
  return (
    <span className="flex flex-col gap-3">
      <Btn tone="primary" size="lg" className="w-full">{UI.startTrial[l]}<span className="rounded bg-white/20 px-1.5 py-0.5 text-[11px]">{days}</span></Btn>
      {ticks ? <span className="flex flex-wrap gap-1">{Array.from({ length: ticks }, (_, i) => <span key={i} className="h-2.5 w-4 rounded-sm bg-primary-600/70" />)}</span> : null}
      <span className="flex items-center justify-center gap-4 text-[11px] text-ink-500"><span className="flex items-center gap-1"><Check className="size-3.5 text-emerald-600" /><Bar w="w-14" /></span><span className="flex items-center gap-1"><Check className="size-3.5 text-emerald-600" /><Bar w="w-16" /></span></span>
    </span>
  );
}

/** Product information as tabs, or as an open list. */
function Tabs({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const f = ctx.slotFold;
  if (/urun aciklamasi/.test(f)) {
    // The description open on arrival, or folded into an accordion.
    const collapsed = treat(ctx);
    return (
      <span className="block border-y border-line-soft py-4">
        <span className="flex items-center justify-between text-[14px] font-semibold text-ink-950">{UI.description[l]}<ChevronDown className={clsx("size-4 text-ink-400", !collapsed && "rotate-180")} /></span>
        {collapsed ? null : <><Bar className="mt-3" /><Bar className="mt-2" /><Bar className="mt-2" w="w-3/4" /><Bar className="mt-2" w="w-1/2" /></>}
      </span>
    );
  }
  const contactRow = /iletisim/.test(f);
  const asList = diff(ctx, ["options", "format", "hierarchy"], false, true, false);
  const loud = diff(ctx, "emphasis", false, true, false);
  if (contactRow) {
    return <span className={clsx("flex items-center gap-4 rounded-lg p-3 text-[12px] text-ink-700 [&>span>svg]:size-4", loud ? "bg-paper-soft" : "")}><span className="flex items-center gap-1.5"><Mail className="text-ink-400" /><Bar w="w-24" /></span><span className="flex items-center gap-1.5"><MessageCircle className="text-ink-400" /><Bar w="w-16" /></span><span className="flex items-center gap-1.5"><MapPin className="text-ink-400" /><Bar w="w-20" /></span></span>;
  }
  const names = [UI.overview[l], UI.benefits[l], UI.specs[l]];
  if (asList) {
    return <span className="flex flex-col gap-3">{names.map((n) => <span key={n} className="block"><span className="text-[13px] font-semibold text-ink-950">{n}</span><Bar className="mt-2" /><Bar className="mt-1.5" w="w-3/4" /></span>)}</span>;
  }
  return (
    <span className="block">
      <span className="flex gap-6 border-b border-line-soft">{names.map((n, i) => <span key={n} className={clsx("pb-2 text-[13px] font-medium", i === (loud ? 1 : 0) ? "border-b-2 border-ink-950 text-ink-950" : "text-ink-500")}>{n}</span>)}</span>
      <span className={clsx("mt-3 block", loud && "rounded-lg bg-emerald-50 p-3")}>{loud ? <span className="flex flex-col gap-2">{[0, 1, 2].map((i) => <span key={i} className="flex items-center gap-2 text-emerald-800"><Check className="size-4 text-emerald-600" /><Bar w={i ? "w-1/2" : "w-2/3"} /></span>)}</span> : <><Bar /><Bar className="mt-2" w="w-3/4" /></>}</span>
    </span>
  );
}

/** A dashboard's widgets; the order is the variable. */
function Dashboard({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  let tiles = [UI.revenue[l], UI.orders[l], UI.visitors[l], UI.conversion[l]];
  if (diff(ctx, "ordering", false, true, false)) tiles = [tiles[3], tiles[0], tiles[1], tiles[2]];
  return (
    <span className="grid grid-cols-4 gap-3">
      {tiles.map((t, i) => (
        <span key={t} className={clsx("block rounded-lg p-4 ring-1", i === 0 ? "bg-ink-950 text-white ring-ink-950" : "bg-paper text-ink-900 ring-ink-950/[0.08]")}>
          <span className={clsx("text-[11px] font-medium", i === 0 ? "text-white/60" : "text-ink-500")}>{t}</span>
          <span className={clsx("mt-2 block h-6 w-16 rounded", i === 0 ? "bg-white/85" : "bg-ink-950/85")} />
          <span className="mt-3 flex items-end gap-1">{[4, 7, 5, 9, 6, 10, 8].map((h, k) => <span key={k} className={clsx("w-2 rounded-sm", i === 0 ? "bg-white/30" : "bg-primary-200")} style={{ height: h * 2 }} />)}</span>
        </span>
      ))}
    </span>
  );
}

/** The home a returning visitor gets: a "welcome back" strip and the
    thing they left - a product, a step - with a Resume button. The
    control is the same home for everyone: the block is simply not there,
    so the slot draws the page's normal hero instead. */
function Resume({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const personal = diff(ctx, "personalization", false, true, true);
  if (!personal) {
    return (
      <span className="block rounded-2xl bg-paper-soft p-5">
        <span className="mb-3 inline-block rounded bg-paper px-2 py-0.5 text-[10px] font-medium text-ink-500 ring-1 ring-ink-950/[0.08]">{UI.everyone[l]}</span>
        <Title size="lg" w="w-5/6" /><Bar className="mt-3" /><Bar w="w-2/3" />
        <Btn tone="primary" size="md" className="mt-4 w-fit">{UI.getStarted[l]}</Btn>
      </span>
    );
  }
  return (
    <span className="block rounded-2xl bg-primary-600 p-5 text-white">
      <span className="text-[12px] font-medium text-white/70">{UI.welcomeBack[l]}</span>
      <span className="mt-1 block text-[18px] font-semibold">{UI.continueWhereLeft[l]}</span>
      <span className="mt-4 flex items-center gap-3 rounded-xl bg-white p-3 text-ink-900">
        <Img className="size-14 shrink-0" />
        <span className="min-w-0 flex-1"><Bar w="w-3/4" /><span className="mt-2 block h-1.5 w-full rounded-full bg-ink-950/10"><span className="block h-full w-2/3 rounded-full bg-primary-600" /></span></span>
        <Btn tone="primary" size="sm">{UI.resumeCta[l]}<ArrowRight className="size-3.5" /></Btn>
      </span>
    </span>
  );
}

/** A listing with a map: beside the list on one side, behind a Map tab on
    the other (AB-041). The map is a tinted plate with pins; the list is
    the shop's cards. */
function MapView({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const tabbed = diff(ctx, ["placement", "options", "layout"], false, true, false);
  const pins = [[22, 30], [55, 48], [70, 22], [38, 66], [80, 70]];
  const map = (
    <span className="relative block h-full min-h-56 overflow-hidden rounded-lg bg-[#e8efe6]">
      <span aria-hidden className="absolute inset-0 opacity-50" style={{ backgroundImage: "linear-gradient(#cfd9cc 1px, transparent 1px), linear-gradient(90deg, #cfd9cc 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <span aria-hidden className="absolute top-1/2 left-0 h-3 w-full -translate-y-1/2 -rotate-6 bg-paper/80" />
      {pins.map(([x, y], i) => <span key={i} className="absolute grid size-6 -translate-x-1/2 -translate-y-full place-items-center" style={{ left: `${x}%`, top: `${y}%` }}><MapPin className="size-6 fill-primary-600 text-primary-700" /></span>)}
    </span>
  );
  if (tabbed) {
    return (
      <span className="block">
        <span className="mb-3 flex w-fit rounded-lg bg-paper-soft p-1 text-[12px] font-medium">
          <span className="rounded-md bg-paper px-3 py-1.5 text-ink-950 shadow-sm">{UI.list[l]}</span>
          <span className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-ink-500"><MapPin className="size-3.5" />{UI.map[l]}</span>
        </span>
        <span className="grid grid-cols-4 gap-4">{[0, 1, 2, 3].map((i) => <ProductCard key={i} lang={l} />)}</span>
      </span>
    );
  }
  return (
    <span className="grid grid-cols-[1.1fr_1fr] gap-4">
      <span className="grid grid-cols-2 gap-3">{[0, 1, 2, 3].map((i) => <ProductCard key={i} lang={l} />)}</span>
      {map}
    </span>
  );
}

function Generic({ ctx }: { ctx: Ctx }) {
  const loud = diff(ctx, "emphasis", false, true, false);
  const big = diff(ctx, "size", false, true, false);
  return <span className={clsx("block rounded-lg", loud ? "bg-ink-950" : "bg-ink-950/[0.08]", big ? "h-24" : "h-14")} />;
}

function Element({ ctx }: { ctx: Ctx }) {
  switch (ctx.element) {
    case "countdown": return <Countdown ctx={ctx} />;
    case "cta": return <Cta ctx={ctx} />;
    case "coupon": return <Coupon ctx={ctx} />;
    case "shipping": return <Shipping ctx={ctx} />;
    case "badge": return <Badges ctx={ctx} />;
    case "price": return <Price ctx={ctx} />;
    case "payment": return <Payment ctx={ctx} />;
    case "stepper": return <Stepper ctx={ctx} />;
    case "form": return <Form ctx={ctx} />;
    case "nav": return <Nav ctx={ctx} />;
    case "search": return <SearchBox ctx={ctx} />;
    case "filters": return <Filters ctx={ctx} />;
    case "media": return <Media ctx={ctx} />;
    case "reviews": return <Reviews ctx={ctx} />;
    case "grid": return <Grid ctx={ctx} />;
    case "plans": return <Plans ctx={ctx} />;
    case "selector": return <Selector ctx={ctx} />;
    case "text": return <Text ctx={ctx} />;
    case "logos": return <Logos ctx={ctx} />;
    case "pagination": return <Pagination ctx={ctx} />;
    case "sizeguide": return <SizeGuide ctx={ctx} />;
    case "delivery": return <Delivery ctx={ctx} />;
    case "faq": return <Faq ctx={ctx} />;
    case "section": return <Section ctx={ctx} />;
    case "topbar": return <TopBar ctx={ctx} />;
    case "banner": return <Banner ctx={ctx} />;
    case "chat": return <Chat ctx={ctx} />;
    case "onboarding": return <Onboarding ctx={ctx} />;
    case "recent": return <Recent ctx={ctx} />;
    case "meter": return <Meter ctx={ctx} />;
    case "empty": return <Empty ctx={ctx} />;
    case "sort": return <Sort ctx={ctx} />;
    case "urgency": return <Urgency ctx={ctx} />;
    case "bundle": return <Bundle ctx={ctx} />;
    case "steps": return <Steps ctx={ctx} />;
    case "tabs": return <Tabs ctx={ctx} />;
    case "dashboard": return <Dashboard ctx={ctx} />;
    case "resume": return <Resume ctx={ctx} />;
    case "map": return <MapView ctx={ctx} />;
    default: return <Generic ctx={ctx} />;
  }
}

/* ---- the page around it ---------------------------------------------- */

/** The shop's own top bar: its wordmark, real menu words, the icons. */
function ShopNav({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  if (ctx.phone) {
    return (
      <span className="flex h-14 items-center justify-between">
        <Menu className="size-5 text-ink-800" />
        <Image src={BRAND} alt="" aria-hidden width={120} height={24} className="h-6 w-auto" />
        <span className="flex items-center gap-4 text-ink-800"><Search className="size-5" /><ShoppingBag className="size-5" /></span>
      </span>
    );
  }
  return (
    <span className="flex h-14 items-center gap-8">
      <Image src={BRAND} alt="" aria-hidden width={130} height={26} className="h-6 w-auto" />
      {[UI.home[l], UI.shop[l], UI.sale[l], UI.about[l]].map((w, i) => <span key={w} className={clsx("text-[14px] font-medium", i === 1 ? "text-ink-950" : "text-ink-600")}>{w}</span>)}
      <span className="ml-auto flex items-center gap-5 text-ink-700"><Search className="size-5" /><UserRound className="size-5" /><ShoppingBag className="size-5" /></span>
    </span>
  );
}
function SectionTitle({ children, meta }: { children: ReactNode; meta?: ReactNode }) {
  return (
    <span className="flex items-baseline justify-between">
      <span className="text-[18px] font-semibold text-ink-950">{children}</span>
      {meta ? <span className="text-[12px] text-ink-500">{meta}</span> : null}
    </span>
  );
}
function Footer() {
  return (
    <span className="mt-2 grid grid-cols-4 gap-8 border-t border-line-soft pt-8">
      {[0, 1, 2, 3].map((i) => <span key={i} className="block"><Title size="sm" w="w-20" /><Bar className="mt-4" w="w-3/4" /><Bar className="mt-2" w="w-1/2" /><Bar className="mt-2" w="w-2/3" /></span>)}
    </span>
  );
}

/** The tested element in its slot, ringed - or its dashed ghost when this
    side does not have it. Every other slot draws its skeleton. A body
    names its slots up front so `rest()` - the place for an element the
    page has no slot of its own for - can tell, wherever it sits in the
    markup, whether the element already has a home; and `at()` draws the
    element once, whatever else names the same slot. */
function useSlots(ctx: Ctx, slots: readonly AbElementKind[]) {
  const moved = diff(ctx, "placement", false, true, false);
  let placed = false;
  /* WHO GETS THE RING (2026-09-20, Hulusi on AB-106: both sides ringed,
     nothing between them). The ring says "this is what changed"; on the
     control it says nothing. So the treatment side is ringed, the
     baseline side draws the element plain - except a presence test, where
     the absent side shows its ghost and the present side its ring, and a
     solo drawing, which is the whole point of the page. On a "remove"
     record the sides are already swapped by `invert`, so the ring follows. */
  const ringed = ctx.side === "solo" || ctx.kind === "presence" || (ctx.side === "b") !== ctx.invert;
  const draw = (tall: boolean): ReactNode => {
    placed = true;
    if (!ctx.present) return <Ghost lang={ctx.lang} className={tall ? "h-40" : "h-14"} />;
    return ringed ? <Spot><Element ctx={ctx} /></Spot> : <span className="block"><Element ctx={ctx} /></span>;
  };
  const at = (name: AbElementKind, skeleton: ReactNode, alt = false): ReactNode => {
    const mine = ctx.element === name && (moved ? alt : !alt);
    if (!mine || placed) return alt ? null : skeleton;
    return draw(name === "form" || name === "grid" || name === "plans");
  };
  const rest = (): ReactNode => {
    if (placed || ctx.element === "popup" || slots.includes(ctx.element)) return null;
    return draw(false);
  };
  return { at, rest };
}

function Pdp({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx, ["nav", "media", "text", "reviews", "price", "selector", "sizeguide", "cta", "shipping", "badge", "countdown", "coupon", "urgency", "bundle", "delivery", "tabs", "faq", "banner", "topbar", "recent"]);
  const l = ctx.lang;
  return (
    <span className="flex flex-col gap-8">
      {at("topbar", null)}
      {at("nav", <ShopNav ctx={ctx} />)}
      {at("banner", null)}
      <span className={clsx("grid gap-10", ctx.phone ? "grid-cols-1" : "grid-cols-[1.1fr_1fr]")}>
        <span className="flex flex-col gap-3">
          {at("media", <Img className="aspect-[4/5] w-full" />)}
          <span className="grid grid-cols-5 gap-3"><Img className="aspect-square" /><Img className="aspect-square" /><Img className="aspect-square" /><Img className="aspect-square" /><Img className="aspect-square" /></span>
        </span>
        <span className="flex flex-col gap-5">
          {at("text", <><Title size="lg" w="w-5/6" /><Bar w="w-1/2" className="mt-1" /></>)}
          {at("reviews", <span className="flex items-center gap-2"><span className="flex items-center gap-0.5 text-amber-500">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="size-4" />)}</span><Bar w="w-16" /></span>)}
          {at("price", <PriceBar big />)}
          {at("urgency", null)}
          <span className="block"><span className="mb-2 block text-[12px] font-medium text-ink-700">{UI.size[l]}</span>{at("selector", <span className="flex gap-2">{["S", "M", "L", "XL"].map((o) => <span key={o} className="grid h-10 min-w-10 place-items-center rounded-md px-3 text-[13px] font-medium text-ink-700 ring-1 ring-ink-950/[0.12]">{o}</span>)}</span>)}</span>
          {at("sizeguide", <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-500"><Ruler className="size-4" />{UI.sizeGuide[l]}</span>)}
          {at("bundle", null)}
          {at("cta", <Btn tone="ink" size="lg" className="w-full"><ShoppingBag className="size-4" />{UI.addToCart[l]}</Btn>)}
          {at("shipping", null)}
          {at("delivery", <span className="flex items-center gap-2.5 text-[13px] text-ink-700"><Truck className="size-4 text-ink-400" /><span className="font-medium">{UI.deliveryBy[l]}</span><Bar w="w-20" /></span>)}
          {at("badge", <span className="flex gap-6 text-[12px] text-ink-600 [&>span>svg]:size-4 [&>span>svg]:text-ink-400"><span className="flex items-center gap-2"><Truck />{UI.freeShipping[l]}</span><span className="flex items-center gap-2"><RotateCcw />{UI.freeReturns[l]}</span><span className="flex items-center gap-2"><ShieldCheck />{UI.securePayment[l]}</span></span>)}
          {at("countdown", null)}{at("coupon", null)}
          {rest()}
          {at("cta", null, true)}{at("badge", null, true)}{at("price", null, true)}{at("reviews", null, true)}{at("text", null, true)}{at("media", null, true)}{at("selector", null, true)}{at("urgency", null, true)}{at("sizeguide", null, true)}{at("bundle", null, true)}{at("delivery", null, true)}
          {at("tabs", <span className="mt-2 block border-t border-line-soft pt-5"><span className="block text-[14px] font-semibold text-ink-950">{UI.description[l]}</span><Bar className="mt-3" /><Bar className="mt-2" /><Bar className="mt-2" w="w-3/4" /></span>)}
        </span>
      </span>
      {at("faq", null)}{at("recent", null)}
      {at("nav", null, true)}{at("faq", null, true)}{at("recent", null, true)}{at("tabs", null, true)}{at("banner", null, true)}{at("topbar", null, true)}
      {!ctx.phone ? <Footer /> : null}
    </span>
  );
}

function Plp({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx, ["nav", "search", "filters", "sort", "countdown", "text", "badge", "media", "logos", "grid", "recent", "pagination", "empty", "topbar", "banner", "map"]);
  const l = ctx.lang;
  const searching = ctx.surface === "search";
  const empty = ctx.element === "empty";
  return (
    <span className="flex flex-col gap-6">
      {at("topbar", null)}
      {at("nav", <ShopNav ctx={ctx} />)}
      {at("banner", null)}
      <span className={clsx("flex gap-3", ctx.phone ? "flex-col" : "items-center")}>
        <span className="min-w-0 flex-1">{at("search", <span className="flex h-10 items-center gap-2.5 rounded-md bg-paper px-3 text-[13px] ring-1 ring-ink-950/[0.14]"><Search className="size-4 text-ink-500" />{searching ? <Bar w="w-24" className="h-2.5" /> : <span className="text-ink-400">{UI.searchProducts[l]}</span>}</span>)}</span>
        {at("filters", <span className="flex gap-2">{[UI.size[l], UI.colour[l], UI.priceFilter[l]].map((c) => <span key={c} className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium text-ink-700 ring-1 ring-ink-950/[0.14]">{c}<ChevronDown className="size-3.5 text-ink-400" /></span>)}</span>)}
        {at("sort", <span className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium text-ink-700 ring-1 ring-ink-950/[0.14]">{UI.sortBy[l]}<ChevronDown className="size-3.5 text-ink-400" /></span>)}
      </span>
      {at("countdown", null)}{at("text", null)}{at("badge", null)}{at("media", null)}{at("logos", null)}
      {rest()}
      {empty ? at("empty", null) : <>
        <SectionTitle meta={<><Bar w="w-6" className="mr-1 inline-block align-middle" />{UI.results[l]}</>}>{searching ? UI.resultsFor[l] : UI.newArrivals[l]}</SectionTitle>
        {at("recent", null)}{at("map", null)}
        {ctx.element === "map" ? null : at("grid", <span className={clsx("grid gap-4", ctx.phone ? "grid-cols-2" : "grid-cols-4")}>{Array.from({ length: ctx.phone ? 4 : 8 }, (_, i) => <ProductCard key={i} lang={l} />)}</span>)}
        {at("pagination", <span className="flex items-center justify-center gap-1.5">{[1, 2, 3].map((n) => <span key={n} className={clsx("grid size-9 place-items-center rounded-md text-[13px] font-medium", n === 1 ? "bg-ink-950 text-white" : "text-ink-500")}>{n}</span>)}</span>)}
      </>}
      {at("countdown", null, true)}{at("text", null, true)}{at("badge", null, true)}{at("search", null, true)}{at("filters", null, true)}{at("nav", null, true)}{at("media", null, true)}{at("logos", null, true)}{at("sort", null, true)}{at("recent", null, true)}{at("pagination", null, true)}{at("topbar", null, true)}{at("banner", null, true)}{at("map", null, true)}
      {!ctx.phone ? <Footer /> : null}
    </span>
  );
}

function Checkout({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx, ["nav", "selector", "coupon", "shipping", "countdown", "price", "badge", "stepper", "form", "payment", "text", "cta"]);
  const l = ctx.lang;
  // AB-020 is a delivery choice, which lives in the main column; the cart line keeps its quantity.
  const choice = /varsayilan isaretli/.test(ctx.slotFold);
  const summary = (
    <span className="flex flex-col gap-4 rounded-xl bg-paper-soft p-6">
      <span className="text-[15px] font-semibold text-ink-950">{UI.yourCart[l]}</span>
      {[0, 1].map((i) => (
        <span key={i} className="flex items-center gap-4"><Img className="size-16 shrink-0" /><span className="flex-1"><Bar w="w-3/4" /><Bar className="mt-2" w="w-1/3" /></span>{i === 0 && !choice ? at("selector", <span className="h-3 w-8 rounded bg-ink-950/60" />) : <span className="h-3 w-8 rounded bg-ink-950/60" />}<PriceBar /></span>
      ))}
      {at("coupon", null)}{at("shipping", null)}{at("countdown", null)}
      <span className="flex flex-col gap-2 border-t border-line-soft pt-4 text-[13px] text-ink-600">
        <span className="flex justify-between">{UI.subtotal[l]}<PriceBar /></span>
        <span className="flex justify-between">{UI.shipping[l]}<PriceBar /></span>
        <span className="flex justify-between text-[15px] font-semibold text-ink-950">{UI.total[l]}{at("price", <PriceBar big />)}</span>
      </span>
      {at("badge", null)}
    </span>
  );
  const main = (
    <span className="flex flex-col gap-6">
      {at("stepper", <span className="flex items-center gap-3">{UI.steps[l].map((s, i) => <span key={s} className="flex flex-1 items-center gap-2"><span className={clsx("grid size-6 place-items-center rounded-full text-[11px] font-semibold", i === 0 ? "bg-ink-950 text-white" : "bg-paper-soft text-ink-500")}>{i + 1}</span><span className={clsx("text-[13px] font-medium", i === 0 ? "text-ink-950" : "text-ink-400")}>{s}</span>{i < 2 ? <span className="h-px flex-1 bg-ink-950/10" /> : null}</span>)}</span>)}
      {at("form", <span className="grid grid-cols-2 gap-4"><Field label={UI.fullName[l]} /><Field label={UI.email[l]} /><span className="col-span-2"><Field label={UI.address[l]} /></span></span>)}
      {choice ? at("selector", null) : null}
      {at("payment", <span className="grid grid-cols-3 gap-2">{[{ i: <CreditCard />, t: UI.card[l] }, { i: <Landmark />, t: UI.bankTransfer[l] }, { i: <Smartphone />, t: UI.wallet[l] }].map((m, i) => <span key={m.t} className={clsx("flex flex-col items-center gap-1.5 rounded-md py-3 text-[12px] font-medium ring-1 [&>svg]:size-5", i === 0 ? "bg-paper text-ink-900 ring-ink-950" : "bg-paper text-ink-600 ring-ink-950/[0.12]")}>{m.i}{m.t}</span>)}</span>)}
      {at("text", null)}
      {rest()}
      {at("cta", <Btn tone="ink" size="lg" className="w-full">{UI.checkout[l]}</Btn>)}
      {at("coupon", null, true)}{at("shipping", null, true)}{at("payment", null, true)}{at("cta", null, true)}{at("badge", null, true)}{at("stepper", null, true)}{at("selector", null, true)}{at("countdown", null, true)}{at("text", null, true)}{at("price", null, true)}{at("form", null, true)}
    </span>
  );
  return (
    <span className="flex flex-col gap-6">
      {at("nav", <ShopNav ctx={ctx} />)}
      <span className={clsx("grid gap-8", ctx.phone ? "grid-cols-1" : "grid-cols-[1.2fr_1fr]")}>{main}{summary}</span>
      {at("nav", null, true)}
    </span>
  );
}

function FormPage({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx, ["nav", "stepper", "text", "payment", "form", "selector", "cta", "badge", "steps", "onboarding"]);
  const l = ctx.lang;
  return (
    <span className="flex flex-col gap-8">
      {at("nav", <ShopNav ctx={ctx} />)}
      <span className={clsx("mx-auto flex w-full flex-col gap-5 rounded-2xl bg-paper p-8 ring-1 ring-ink-950/[0.06]", ctx.phone ? "" : "max-w-[30rem]")}>
        {at("stepper", null)}
        {at("text", <><span className="block text-[22px] font-semibold text-ink-950">{UI.createAccount[l]}</span><Bar w="w-1/2" /></>)}
        {at("payment", null)}
        {at("form", <span className="grid gap-4"><Field label={UI.fullName[l]} />{at("steps", <Field label={UI.email[l]} />)}</span>)}
        {at("selector", null)}{at("onboarding", null)}
        {at("cta", <Btn tone="primary" size="lg" className="w-full">{UI.continue[l]}</Btn>)}
        <Btn tone="outline" size="lg" className="w-full">{UI.continueWithGoogle[l]}</Btn>
        {at("badge", null)}
        {rest()}
        {at("form", null, true)}{at("cta", null, true)}{at("text", null, true)}{at("badge", null, true)}{at("stepper", null, true)}{at("payment", null, true)}{at("steps", null, true)}{at("onboarding", null, true)}
      </span>
      {at("nav", null, true)}
    </span>
  );
}

/** The order confirmation. */
function ThankYou({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx, ["nav", "section", "banner", "cta", "recent", "grid", "text"]);
  const l = ctx.lang;
  return (
    <span className="flex flex-col gap-8">
      {at("nav", <ShopNav ctx={ctx} />)}
      {at("section", <span className="flex flex-col items-center gap-3 text-center"><span className="grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check className="size-8" /></span><span className="text-[26px] font-semibold text-ink-950">{UI.thankYou[l]}</span><span className="flex items-center gap-2 text-[13px] text-ink-600">{UI.orderNumber[l]}<span className="block h-3 w-16 rounded bg-ink-950/80" /></span></span>)}
      {at("text", null)}
      <span className={clsx("mx-auto flex w-full flex-col gap-4 rounded-2xl bg-paper-soft p-6", ctx.phone ? "" : "max-w-[34rem]")}>
        {[0, 1].map((i) => <span key={i} className="flex items-center gap-4"><Img className="size-14 shrink-0" /><span className="flex-1"><Bar w="w-3/4" /><Bar className="mt-2" w="w-1/3" /></span><PriceBar /></span>)}
        <span className="flex justify-between border-t border-line-soft pt-3 text-[14px] font-semibold text-ink-950">{UI.total[l]}<PriceBar big /></span>
      </span>
      {at("banner", null)}
      {at("cta", <span className="flex justify-center gap-3"><Btn tone="outline" size="md">{UI.trackOrder[l]}</Btn><Btn tone="ink" size="md">{UI.continueShopping[l]}</Btn></span>)}
      {rest()}
      {at("recent", null)}{at("grid", null)}
      {at("nav", null, true)}{at("section", null, true)}{at("banner", null, true)}{at("cta", null, true)}{at("recent", null, true)}{at("grid", null, true)}{at("text", null, true)}
      {!ctx.phone ? <Footer /> : null}
    </span>
  );
}

/** A SaaS dashboard: a rail, the widget row, a table. */
function DashboardPage({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx, ["nav", "dashboard", "onboarding", "banner", "meter", "chat", "text", "cta", "badge"]);
  const l = ctx.lang;
  return (
    <span className="flex flex-col gap-6">
      {at("nav", <span className="flex h-12 items-center gap-6 border-b border-line-soft"><Image src={BRAND} alt="" aria-hidden width={110} height={22} className="h-5 w-auto" /><span className="text-[13px] font-medium text-ink-950">{UI.dashboard[l]}</span><Bar w="w-12" /><Bar w="w-12" /><span className="ml-auto flex items-center gap-4 text-ink-500"><Search className="size-4" /><Bell className="size-4" /><span className="size-7 rounded-full bg-gradient-to-br from-stone-200 to-stone-300" /></span></span>)}
      {at("onboarding", null)}{at("banner", null)}{at("meter", null)}
      {at("dashboard", <span className="grid grid-cols-4 gap-3">{[UI.revenue[l], UI.orders[l], UI.visitors[l], UI.conversion[l]].map((t) => <span key={t} className="block rounded-lg bg-paper p-4 ring-1 ring-ink-950/[0.08]"><span className="text-[11px] font-medium text-ink-500">{t}</span><span className="mt-2 block h-6 w-16 rounded bg-ink-950/85" /></span>)}</span>)}
      {at("text", null)}{at("cta", null)}{at("badge", null)}
      {rest()}
      <span className="block rounded-lg ring-1 ring-ink-950/[0.08]">
        <span className="flex items-center gap-4 border-b border-line-soft px-4 py-3"><LayoutGrid className="size-4 text-ink-400" /><Bar w="w-24" className="h-2.5" /><span className="ml-auto"><Bar w="w-16" /></span></span>
        {[0, 1, 2, 3].map((i) => <span key={i} className="flex items-center gap-6 border-b border-line-soft px-4 py-3 last:border-0"><span className="size-7 rounded-full bg-gradient-to-br from-stone-200 to-stone-300" /><Bar w="w-1/4" /><Bar w="w-1/6" /><span className="ml-auto"><Bar w="w-12" /></span></span>)}
      </span>
      {at("chat", null)}
      {at("nav", null, true)}{at("dashboard", null, true)}{at("onboarding", null, true)}{at("banner", null, true)}{at("meter", null, true)}{at("text", null, true)}{at("cta", null, true)}{at("badge", null, true)}
    </span>
  );
}

function Home({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx, ["nav", "text", "cta", "badge", "media", "logos", "countdown", "reviews", "search", "plans", "form", "price", "grid", "topbar", "banner", "section", "recent", "onboarding", "chat", "meter", "steps", "faq", "tabs", "dashboard", "urgency", "resume"]);
  const l = ctx.lang;
  return (
    <span className="flex flex-col gap-8">
      {at("topbar", null)}
      {at("nav", <ShopNav ctx={ctx} />)}
      {at("onboarding", null)}
      {at("banner", null)}
      {at("resume", null)}
      <span className={clsx("grid items-center gap-10 rounded-2xl bg-paper-soft p-10", ctx.phone ? "grid-cols-1" : "grid-cols-[1.1fr_1fr]", ctx.element === "resume" && "hidden")}>
        <span className="flex flex-col gap-5">
          {at("text", <><Title size="lg" w="w-5/6" /><Title size="lg" w="w-3/5" /><Bar className="mt-2" /><Bar w="w-2/3" /></>)}
          {at("cta", <Btn tone="primary" size="lg" className="w-fit">{UI.getStarted[l]}</Btn>)}
          {at("steps", null)}
          {at("badge", null)}{at("urgency", null)}
        </span>
        {at("media", <Img className="aspect-[4/3] w-full" />)}
      </span>
      {at("logos", null)}{at("meter", null)}{at("dashboard", null)}
      {at("countdown", null)}{at("reviews", null)}{at("search", null)}{at("plans", null)}{at("form", null)}{at("price", null)}{at("recent", null)}
      {rest()}
      {at("section", <><SectionTitle>{UI.howItWorks[l]}</SectionTitle><span className="grid grid-cols-3 gap-4">{[0, 1, 2].map((i) => <span key={i} className="block rounded-lg bg-paper-soft p-4"><span className="grid size-9 place-items-center rounded-lg bg-primary-50 text-primary-700"><Check className="size-4" /></span><Title size="sm" w="w-1/2" className="mt-3" /><Bar className="mt-2" w="w-4/5" /></span>)}</span></>)}
      <SectionTitle>{UI.newArrivals[l]}</SectionTitle>
      {at("grid", <span className={clsx("grid gap-4", ctx.phone ? "grid-cols-2" : "grid-cols-4")}>{Array.from({ length: ctx.phone ? 2 : 4 }, (_, i) => <ProductCard key={i} lang={l} />)}</span>)}
      {at("faq", null)}{at("tabs", null)}
      {at("nav", null, true)}{at("text", null, true)}{at("cta", null, true)}{at("badge", null, true)}{at("media", null, true)}{at("countdown", null, true)}{at("reviews", null, true)}{at("grid", null, true)}{at("search", null, true)}{at("plans", null, true)}{at("form", null, true)}{at("price", null, true)}{at("logos", null, true)}{at("section", null, true)}{at("topbar", null, true)}{at("banner", null, true)}{at("onboarding", null, true)}{at("meter", null, true)}{at("steps", null, true)}{at("faq", null, true)}{at("tabs", null, true)}{at("dashboard", null, true)}{at("recent", null, true)}{at("urgency", null, true)}
      {at("chat", null)}
      {!ctx.phone ? <Footer /> : null}
    </span>
  );
}

function PricingPage({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx, ["nav", "text", "plans", "price", "badge", "cta", "selector", "logos", "meter", "faq", "steps"]);
  const l = ctx.lang;
  return (
    <span className="flex flex-col gap-8">
      {at("nav", <ShopNav ctx={ctx} />)}
      {at("text", <span className="block text-center"><span className="block text-[28px] font-semibold text-ink-950">{UI.choosePlan[l]}</span><Bar className="mx-auto mt-3 w-1/3" /></span>)}
      {at("plans", <span className={clsx("grid gap-4", ctx.phone ? "grid-cols-1" : "grid-cols-3")}>{[0, 1, 2].map((i) => <span key={i} className={clsx("flex flex-col gap-3 rounded-xl p-6 ring-1", i === 1 ? "bg-ink-950 ring-ink-950" : "bg-paper ring-ink-950/[0.1]")}><Title size="sm" w="w-16" className={i === 1 ? "bg-white/85" : ""} /><span className={clsx("block h-7 w-24 rounded", i === 1 ? "bg-white/85" : "bg-ink-950/85")} /><Bar className={clsx("mt-2", i === 1 ? "bg-white/20" : "")} w="w-4/5" /><Bar className={i === 1 ? "bg-white/20" : ""} w="w-2/3" /><Btn tone={i === 1 ? "primary" : "outline"} size="md" className="mt-3 w-full">{UI.choose[l]}</Btn></span>)}</span>)}
      {at("price", null)}{at("badge", null)}{at("cta", null)}{at("selector", null)}{at("logos", null)}{at("meter", null)}{at("steps", null)}
      {rest()}
      {at("faq", null)}
      {at("plans", null, true)}{at("text", null, true)}{at("price", null, true)}{at("badge", null, true)}{at("cta", null, true)}{at("nav", null, true)}{at("logos", null, true)}{at("meter", null, true)}{at("steps", null, true)}{at("faq", null, true)}
      {!ctx.phone ? <Footer /> : null}
    </span>
  );
}

function Body({ ctx }: { ctx: Ctx }) {
  switch (ctx.surface) {
    case "pdp": return <Pdp ctx={ctx} />;
    case "plp": case "search": case "filters": return <Plp ctx={ctx} />;
    case "cart": case "checkout": return <Checkout ctx={ctx} />;
    case "form": return <FormPage ctx={ctx} />;
    case "pricing": return <PricingPage ctx={ctx} />;
    case "thankyou": return <ThankYou ctx={ctx} />;
    case "dashboard": return <DashboardPage ctx={ctx} />;
    default: return <Home ctx={ctx} />;
  }
}

/* ---- the browser around it ------------------------------------------- */

/** The browser's own chrome, drawn INSIDE the scaled page so it shrinks
    with it (Hulusi, 2026-09-20: "the header tab bar is not at the right
    scale, and the dots are not realistic - Safari's are red, yellow,
    green"). A desktop tab bar at 44px with the three lights in their real
    colours and the page's name in the address pill; on a phone, a status
    bar with the time as a bar and an address bar under it. Nothing in the
    chrome is typed as a fact: the time is a bar, the address is the
    page's name. */
function BrowserChrome({ address, phone }: { address: string; phone: boolean }) {
  if (phone) {
    return (
      <span className="block bg-paper-soft/80">
        <span className="flex h-11 items-center justify-between px-6">
          <span aria-hidden className="block h-3 w-9 rounded bg-ink-950/85" />
          <span aria-hidden className="flex items-center gap-1.5">
            <span className="flex items-end gap-0.5">{[3, 5, 7, 9].map((h) => <span key={h} className="block w-1 rounded-sm bg-ink-950/85" style={{ height: h }} />)}</span>
            <span className="block h-3 w-6 rounded-[3px] border-2 border-ink-950/70"><span className="block h-full w-4/5 bg-ink-950/85" /></span>
          </span>
        </span>
        <span className="flex h-12 items-center gap-2 border-b border-line-soft px-4">
          <span className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-paper text-[13px] font-medium text-ink-700 shadow-sm ring-1 ring-ink-950/[0.06]"><Lock className="size-3 text-ink-400" />{address}</span>
        </span>
      </span>
    );
  }
  return (
    <span className="grid h-11 grid-cols-[1fr_minmax(0,2fr)_1fr] items-center gap-4 border-b border-line-soft bg-paper-soft/80 px-4">
      <span className="flex items-center gap-4">
        <span aria-hidden className="flex gap-2">
          <span className="size-3 rounded-full bg-[#ff5f57] ring-1 ring-inset ring-black/10" />
          <span className="size-3 rounded-full bg-[#febc2e] ring-1 ring-inset ring-black/10" />
          <span className="size-3 rounded-full bg-[#28c840] ring-1 ring-inset ring-black/10" />
        </span>
        <span aria-hidden className="flex items-center gap-2 text-ink-400"><ChevronLeft className="size-4" /><ChevronRight className="size-4" /></span>
      </span>
      <span className="flex h-7 items-center justify-center gap-1.5 rounded-md bg-paper text-[13px] font-medium text-ink-600 shadow-hairline"><Lock className="size-3 text-ink-400" />{address}</span>
      <span aria-hidden className="flex items-center justify-end gap-3 text-ink-400"><Share className="size-4" /><MoreHorizontal className="size-4" /></span>
    </span>
  );
}

/* ---- the screen ------------------------------------------------------- */

export function AbScreen({
  surface,
  element,
  kind,
  side,
  presence,
  behavior,
  slot,
  lang,
  label,
  address,
  ring = false,
  caption = false,
  className = "",
}: {
  surface: string;
  element: AbElementKind;
  kind: AbVariableKind;
  side: AbSide;
  /** On a presence test the data fixes each side; elsewhere null. */
  presence?: "absent" | "present" | null;
  /** The record's differenceBehavior: on "remove" the sides run the other
      way round. */
  behavior?: string;
  /** The record's testedSlot, for the families that hold several things. */
  slot?: string | null;
  lang: Lang;
  /** What a screen reader gets instead of the picture. */
  label: string;
  /** The window's address line - the page's name, not a made-up domain. */
  address: string;
  /** The brand ring the variant carries: "look here". */
  ring?: boolean;
  caption?: boolean;
  className?: string;
}) {
  const phone = surface === "mobile";
  const ctx: Ctx = { kind, element, surface, side, present: presence !== "absent", invert: behavior === "remove", slotFold: fold(slot ?? ""), lang, phone };
  const popup = element === "popup" && ctx.present;
  return (
    <div className={clsx("min-w-0", className)}>
      {/* The frame is the Lab product window's (ui/LabWindow.tsx: the same
          rounded corner, hairline and long shadow) but the browser chrome
          lives INSIDE the scaled page, so the tab bar is as small as a tab
          bar is in a screenshot. A picture, not a control: role="img",
          pointer events off. */}
      {/* ZOOM ON HOVER (Hulusi, 2026-09-20: "when I hover the screen, scale
          it up so the user can see it easily"; then "animate it, and hold
          the position - grow in place, not from the top"; then "it zooms
          too much, make it less"): the screen grows to 1.2x about its own
          centre, so it stays where it was and
          swells over the arrow, the other side and the plate's edge, on
          the slow duration with the soft ease-out - the homepage tiles'
          hover. The transition names `scale`, because the scale utility
          sets the CSS `scale` property, not `transform`. The hover is the
          side's, not the figure's (a picture takes no pointer events), so
          `group` sits on the Side. */}
      <figure
        role="img"
        aria-label={label}
        className={clsx(
          "pointer-events-none relative m-0 origin-center overflow-hidden rounded-xl border border-line-soft bg-paper text-left select-none shadow-[0_0_0_1px_rgb(0_0_0/0.03),0_30px_70px_-30px_rgb(10_16_32/0.38)]",
          "transition-[scale,box-shadow] duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] group-hover:z-30 group-hover:scale-[1.2] group-hover:shadow-[0_50px_100px_-40px_rgb(10_16_32/0.5)]",
          phone ? "mx-auto max-w-[20rem]" : "",
          ring && "ring-2 ring-primary-400 ring-offset-2 ring-offset-paper-soft",
        )}
      >
        <ScaledPage width={phone ? PHONE_W : PAGE_W} initial={phone ? 0.8 : 0.45}>
          <BrowserChrome address={address} phone={phone} />
          <span className={clsx("relative block bg-paper text-ink-700", phone ? "px-5 py-4" : "px-10 py-2")} style={{ minHeight: phone ? 640 : 520 }}>
            <Body ctx={ctx} />
            {popup ? <Popup ctx={ctx} /> : null}
            {element === "popup" && !ctx.present ? <span className="absolute right-8 bottom-8"><Ghost lang={lang} className="h-14 w-48" /></span> : null}
          </span>
        </ScaledPage>
      </figure>
      {caption ? <span className="mt-2 block text-[11px] leading-snug text-ink-subtle">{CAPTION[kind][lang]}</span> : null}
    </div>
  );
}
