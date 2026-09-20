import Image from "next/image";
import type { ReactNode } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  CreditCard,
  Heart,
  Landmark,
  Menu,
  MoreHorizontal,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Search,
  Share,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Smartphone,
  Star,
  Truck,
  UserRound,
  X,
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

function Btn({ children, tone = "ink", size = "md", className = "" }: { children: ReactNode; tone?: "ink" | "primary" | "outline" | "link" | "ghost"; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap",
        size === "sm" ? "h-8 px-3 text-[12px]" : size === "lg" ? "h-12 px-6 text-[15px]" : "h-10 px-4 text-[13px]",
        tone === "primary" && "bg-primary-600 text-white",
        tone === "ink" && "bg-ink-950 text-white",
        tone === "outline" && "bg-paper text-ink-900 ring-1 ring-ink-950/[0.15]",
        tone === "ghost" && "bg-paper-soft text-ink-900",
        tone === "link" && "h-auto px-0 text-[13px] text-primary-700 underline underline-offset-2",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Field({ label, placeholder, floating = false, helper, tag, tall = false }: { label: string; placeholder?: string; floating?: boolean; helper?: string; tag?: string; tall?: boolean }) {
  return (
    <span className="block min-w-0">
      {!floating && (
        <span className="mb-1.5 flex items-center gap-2 text-[12px] font-medium text-ink-800">
          {label}
          {tag ? <span className="rounded bg-paper-soft px-1.5 py-0.5 text-[11px] font-normal text-ink-500">{tag}</span> : null}
        </span>
      )}
      <span className={clsx("relative flex items-center rounded-md bg-paper px-3 text-[13px] text-ink-400 ring-1 ring-ink-950/[0.14]", tall ? "h-12" : "h-10")}>
        {floating ? <span className="absolute top-1.5 left-3 text-[10px] font-medium text-ink-600">{label}</span> : null}
        <span className={floating ? "mt-3" : ""}>{placeholder ?? ""}</span>
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
  lang: Lang;
  phone: boolean;
};

/** `a` on side A, `b` on side B, `normal` when the kind is not this one
    (or on a solo drawing). */
function diff<T>(ctx: Ctx, kinds: AbVariableKind | AbVariableKind[], a: T, b: T, normal: T): T {
  const ks = Array.isArray(kinds) ? kinds : [kinds];
  if (!ks.includes(ctx.kind) || ctx.side === "solo") return normal;
  const onB = ctx.side === "b";
  return onB !== ctx.invert ? b : a;
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
  const label = s === "cart" || s === "checkout" ? UI.checkout[l] : s === "form" || s === "saas" ? UI.continue[l] : s === "pdp" || s === "plp" ? UI.addToCart[l] : UI.getStarted[l];
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
  const items = [
    { icon: <ShieldCheck />, label: UI.securePayment[l] },
    { icon: <Truck />, label: UI.freeShipping[l] },
    { icon: <RotateCcw />, label: UI.freeReturns[l] },
  ];
  const n = diff(ctx, "quantity", 2, 3, 3);
  const loud = diff(ctx, "emphasis", false, true, false);
  const column = diff(ctx, ["format", "layout", "options"], false, true, false);
  return (
    <span className={clsx("flex gap-2", column ? "flex-col" : "flex-wrap")}>
      {items.slice(0, n).map((b) => (
        <span key={b.label} className={clsx("inline-flex items-center gap-2 rounded-md text-[12px] font-medium [&>svg]:size-4", loud ? "bg-emerald-50 px-3 py-2 text-emerald-700" : "px-1 py-1 text-ink-600 [&>svg]:text-ink-400")}>
          {b.icon}{b.label}
        </span>
      ))}
    </span>
  );
}

function Price({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
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
  let fields: string[] = [UI.fullName[l], UI.email[l], UI.address[l]];
  if (diff(ctx, "quantity", false, true, false)) fields = [UI.fullName[l], UI.email[l], UI.phone[l], UI.address[l], UI.city[l]];
  if (diff(ctx, "ordering", false, true, false)) fields = [fields[1], fields[0], ...fields.slice(2)];
  const floating = diff(ctx, ["placement", "style", "options"], false, true, false);
  const twoCol = diff(ctx, "layout", false, true, false);
  const tall = diff(ctx, "size", false, true, false);
  const helper = diff(ctx, "presence", false, true, false) && ctx.present;
  const tag = diff(ctx, "format", "*", UI.optional[l], undefined as string | undefined);
  return (
    <span className={clsx("grid gap-4", twoCol ? "grid-cols-2" : "grid-cols-1")}>
      {fields.map((f, i) => (
        <Field key={f} label={f} floating={floating} tall={tall} tag={tag && i === fields.length - 1 ? tag : undefined} helper={helper && i === 1 ? UI.helper[l] : undefined} />
      ))}
    </span>
  );
}

function Nav({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  let items = [UI.home[l], UI.shop[l], UI.sale[l], UI.about[l]];
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
  const later = diff(ctx, "timing", false, true, false);
  const dim = diff(ctx, ["style", "options"], "bg-ink-950/20", "bg-ink-950/55", "bg-ink-950/35");
  const chat = ctx.surface === "saas" && diff(ctx, "behavior", false, true, false);
  return (
    <span className={clsx("absolute inset-0 z-10 grid p-8", dim, chat ? "items-end justify-end" : later ? "items-end justify-center pb-12" : "place-items-center")}>
      <span className="block w-full max-w-[22rem] rounded-2xl bg-paper p-6 shadow-[0_32px_80px_-32px_rgb(10_16_32/0.6)]">
        <span className="flex items-center justify-between"><Title w="w-32" size="sm" /><X className="size-4 text-ink-400" /></span>
        <Bar className="mt-4" /><Bar className="mt-2" w="w-3/4" />
        <span className="mt-5 flex gap-2"><Btn tone="outline" size="md" className="flex-1">{UI.notNow[l]}</Btn><Btn tone="primary" size="md" className="flex-1">{UI.allow[l]}</Btn></span>
        {ctx.kind === "timing" ? <span className="mt-3 block text-center text-[11px] text-ink-500">{later ? UI.afterScroll[l] : UI.onLoad[l]}</span> : null}
      </span>
    </span>
  );
}

function Media({ ctx }: { ctx: Ctx }) {
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
  const photos = diff(ctx, "media", false, true, false);
  const video = diff(ctx, ["options", "media"], false, true, false) && ctx.surface !== "pdp";
  return (
    <span className="block rounded-lg bg-paper-soft p-5">
      <span className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-amber-500">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="size-4" />)}</span>
        <span className="text-[12px] font-medium text-ink-600">{UI.reviews[l]}</span>
      </span>
      <Bar className="mt-4" /><Bar className="mt-2" w="w-2/3" />
      {photos ? <span className="mt-4 flex gap-2"><Img className="size-16" /><Img className="size-16" /><Img className="size-16" /></span> : null}
      {video ? <Img video className="mt-4 h-40" /> : null}
    </span>
  );
}

/** A product card as a shop draws one. */
function ProductCard({ lang, list = false, priceFirst = false, badge, note }: { lang: Lang; list?: boolean; priceFirst?: boolean; badge?: ReactNode; note?: ReactNode }) {
  return (
    <span className={clsx("relative rounded-lg bg-paper p-2.5 ring-1 ring-ink-950/[0.06]", list ? "flex items-center gap-4" : "block")}>
      <Img className={list ? "size-20 shrink-0" : "aspect-[4/5] w-full"} />
      <span className={clsx("block min-w-0", list ? "flex-1" : "mt-3 px-0.5")}>
        {priceFirst ? <PriceBar /> : <Bar w="w-4/5" />}
        {priceFirst ? <Bar className="mt-2" w="w-4/5" /> : <PriceBar className="mt-2" />}
        {!list ? <span className="mt-3 flex items-center justify-between"><Heart className="size-4 text-ink-300" /><Btn tone="outline" size="sm">{UI.add[lang]}</Btn></span> : null}
      </span>
      {badge}{note}
      {list ? <Btn tone="outline" size="sm">{UI.addToCart[lang]}</Btn> : null}
    </span>
  );
}

function Grid({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
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
  return (
    <span className="block">
      {personal ? <span className="mb-2 inline-block rounded bg-primary-50 px-2 py-1 text-[11px] font-medium text-primary-700">{UI.forYou[l]}</span> : null}
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
  const draw = (tall: boolean): ReactNode => {
    placed = true;
    if (!ctx.present) return <Ghost lang={ctx.lang} className={tall ? "h-40" : "h-14"} />;
    return <Spot><Element ctx={ctx} /></Spot>;
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
  const { at, rest } = useSlots(ctx, ["nav", "media", "text", "reviews", "price", "selector", "cta", "shipping", "badge", "countdown", "coupon"]);
  const l = ctx.lang;
  return (
    <span className="flex flex-col gap-8">
      {at("nav", <ShopNav ctx={ctx} />)}
      <span className={clsx("grid gap-10", ctx.phone ? "grid-cols-1" : "grid-cols-[1.1fr_1fr]")}>
        <span className="flex flex-col gap-3">
          {at("media", <Img className="aspect-[4/5] w-full" />)}
          <span className="grid grid-cols-5 gap-3"><Img className="aspect-square" /><Img className="aspect-square" /><Img className="aspect-square" /><Img className="aspect-square" /><Img className="aspect-square" /></span>
        </span>
        <span className="flex flex-col gap-5">
          {at("text", <><Title size="lg" w="w-5/6" /><Bar w="w-1/2" className="mt-1" /></>)}
          {at("reviews", <span className="flex items-center gap-2"><span className="flex items-center gap-0.5 text-amber-500">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="size-4" />)}</span><Bar w="w-16" /></span>)}
          {at("price", <PriceBar big />)}
          <span className="block"><span className="mb-2 block text-[12px] font-medium text-ink-700">{UI.size[l]}</span>{at("selector", <span className="flex gap-2">{["S", "M", "L", "XL"].map((o) => <span key={o} className="grid h-10 min-w-10 place-items-center rounded-md px-3 text-[13px] font-medium text-ink-700 ring-1 ring-ink-950/[0.12]">{o}</span>)}</span>)}</span>
          {at("cta", <Btn tone="ink" size="lg" className="w-full"><ShoppingBag className="size-4" />{UI.addToCart[l]}</Btn>)}
          {at("shipping", null)}
          {at("badge", <span className="flex gap-6 text-[12px] text-ink-600 [&>span>svg]:size-4 [&>span>svg]:text-ink-400"><span className="flex items-center gap-2"><Truck />{UI.freeShipping[l]}</span><span className="flex items-center gap-2"><RotateCcw />{UI.freeReturns[l]}</span><span className="flex items-center gap-2"><ShieldCheck />{UI.securePayment[l]}</span></span>)}
          {at("countdown", null)}{at("coupon", null)}
          {rest()}
          {at("cta", null, true)}{at("badge", null, true)}{at("price", null, true)}{at("reviews", null, true)}{at("text", null, true)}{at("media", null, true)}{at("selector", null, true)}
          <span className="mt-2 block border-t border-line-soft pt-5"><span className="block text-[14px] font-semibold text-ink-950">{UI.description[l]}</span><Bar className="mt-3" /><Bar className="mt-2" /><Bar className="mt-2" w="w-3/4" /></span>
        </span>
      </span>
      {at("nav", null, true)}
      {!ctx.phone ? <Footer /> : null}
    </span>
  );
}

function Plp({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx, ["nav", "search", "filters", "countdown", "text", "badge", "media", "logos", "grid"]);
  const l = ctx.lang;
  return (
    <span className="flex flex-col gap-6">
      {at("nav", <ShopNav ctx={ctx} />)}
      <span className={clsx("flex gap-3", ctx.phone ? "flex-col" : "items-center")}>
        <span className="min-w-0 flex-1">{at("search", <span className="flex h-10 items-center gap-2.5 rounded-md bg-paper px-3 text-[13px] text-ink-400 ring-1 ring-ink-950/[0.14]"><Search className="size-4 text-ink-500" />{UI.searchProducts[l]}</span>)}</span>
        {at("filters", <span className="flex gap-2">{[UI.size[l], UI.colour[l], UI.priceFilter[l], UI.sortBy[l]].map((c) => <span key={c} className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium text-ink-700 ring-1 ring-ink-950/[0.14]">{c}<ChevronDown className="size-3.5 text-ink-400" /></span>)}</span>)}
      </span>
      {at("countdown", null)}{at("text", null)}{at("badge", null)}{at("media", null)}{at("logos", null)}
      {rest()}
      <SectionTitle meta={<><Bar w="w-6" className="mr-1 inline-block align-middle" />{UI.results[l]}</>}>{UI.newArrivals[l]}</SectionTitle>
      {at("grid", <span className={clsx("grid gap-4", ctx.phone ? "grid-cols-2" : "grid-cols-4")}>{Array.from({ length: ctx.phone ? 4 : 8 }, (_, i) => <ProductCard key={i} lang={l} />)}</span>)}
      {at("countdown", null, true)}{at("text", null, true)}{at("badge", null, true)}{at("search", null, true)}{at("filters", null, true)}{at("nav", null, true)}{at("media", null, true)}{at("logos", null, true)}
      {!ctx.phone ? <Footer /> : null}
    </span>
  );
}

function Checkout({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx, ["nav", "selector", "coupon", "shipping", "countdown", "price", "badge", "stepper", "form", "payment", "text", "cta"]);
  const l = ctx.lang;
  const summary = (
    <span className="flex flex-col gap-4 rounded-xl bg-paper-soft p-6">
      <span className="text-[15px] font-semibold text-ink-950">{UI.yourCart[l]}</span>
      {[0, 1].map((i) => (
        <span key={i} className="flex items-center gap-4"><Img className="size-16 shrink-0" /><span className="flex-1"><Bar w="w-3/4" /><Bar className="mt-2" w="w-1/3" /></span>{i === 0 ? at("selector", <span className="h-3 w-8 rounded bg-ink-950/60" />) : <span className="h-3 w-8 rounded bg-ink-950/60" />}<PriceBar /></span>
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
  const { at, rest } = useSlots(ctx, ["nav", "stepper", "text", "payment", "form", "selector", "cta", "badge"]);
  const l = ctx.lang;
  return (
    <span className="flex flex-col gap-8">
      {at("nav", <ShopNav ctx={ctx} />)}
      <span className={clsx("mx-auto flex w-full flex-col gap-5 rounded-2xl bg-paper p-8 ring-1 ring-ink-950/[0.06]", ctx.phone ? "" : "max-w-[30rem]")}>
        {at("stepper", null)}
        {at("text", <><span className="block text-[22px] font-semibold text-ink-950">{UI.createAccount[l]}</span><Bar w="w-1/2" /></>)}
        {at("payment", null)}
        {at("form", <span className="grid gap-4"><Field label={UI.fullName[l]} /><Field label={UI.email[l]} /></span>)}
        {at("selector", null)}
        {at("cta", <Btn tone="primary" size="lg" className="w-full">{UI.continue[l]}</Btn>)}
        <Btn tone="outline" size="lg" className="w-full">{UI.continueWithGoogle[l]}</Btn>
        {at("badge", null)}
        {rest()}
        {at("form", null, true)}{at("cta", null, true)}{at("text", null, true)}{at("badge", null, true)}{at("stepper", null, true)}{at("payment", null, true)}
      </span>
      {at("nav", null, true)}
    </span>
  );
}

function Home({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx, ["nav", "text", "cta", "badge", "media", "logos", "countdown", "reviews", "search", "plans", "form", "price", "grid"]);
  const l = ctx.lang;
  return (
    <span className="flex flex-col gap-8">
      {at("nav", <ShopNav ctx={ctx} />)}
      <span className={clsx("grid items-center gap-10 rounded-2xl bg-paper-soft p-10", ctx.phone ? "grid-cols-1" : "grid-cols-[1.1fr_1fr]")}>
        <span className="flex flex-col gap-5">
          {at("text", <><Title size="lg" w="w-5/6" /><Title size="lg" w="w-3/5" /><Bar className="mt-2" /><Bar w="w-2/3" /></>)}
          {at("cta", <Btn tone="primary" size="lg" className="w-fit">{UI.getStarted[l]}</Btn>)}
          {at("badge", null)}
        </span>
        {at("media", <Img className="aspect-[4/3] w-full" />)}
      </span>
      {at("logos", null)}
      {at("countdown", null)}{at("reviews", null)}{at("search", null)}{at("plans", null)}{at("form", null)}{at("price", null)}
      {rest()}
      <SectionTitle>{UI.newArrivals[l]}</SectionTitle>
      {at("grid", <span className={clsx("grid gap-4", ctx.phone ? "grid-cols-2" : "grid-cols-4")}>{Array.from({ length: ctx.phone ? 2 : 4 }, (_, i) => <ProductCard key={i} lang={l} />)}</span>)}
      {at("nav", null, true)}{at("text", null, true)}{at("cta", null, true)}{at("badge", null, true)}{at("media", null, true)}{at("countdown", null, true)}{at("reviews", null, true)}{at("grid", null, true)}{at("search", null, true)}{at("plans", null, true)}{at("form", null, true)}{at("price", null, true)}{at("logos", null, true)}
      {!ctx.phone ? <Footer /> : null}
    </span>
  );
}

function PricingPage({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx, ["nav", "text", "plans", "price", "badge", "cta", "selector", "logos"]);
  const l = ctx.lang;
  return (
    <span className="flex flex-col gap-8">
      {at("nav", <ShopNav ctx={ctx} />)}
      {at("text", <span className="block text-center"><span className="block text-[28px] font-semibold text-ink-950">{UI.choosePlan[l]}</span><Bar className="mx-auto mt-3 w-1/3" /></span>)}
      {at("plans", <span className={clsx("grid gap-4", ctx.phone ? "grid-cols-1" : "grid-cols-3")}>{[0, 1, 2].map((i) => <span key={i} className={clsx("flex flex-col gap-3 rounded-xl p-6 ring-1", i === 1 ? "bg-ink-950 ring-ink-950" : "bg-paper ring-ink-950/[0.1]")}><Title size="sm" w="w-16" className={i === 1 ? "bg-white/85" : ""} /><span className={clsx("block h-7 w-24 rounded", i === 1 ? "bg-white/85" : "bg-ink-950/85")} /><Bar className={clsx("mt-2", i === 1 ? "bg-white/20" : "")} w="w-4/5" /><Bar className={i === 1 ? "bg-white/20" : ""} w="w-2/3" /><Btn tone={i === 1 ? "primary" : "outline"} size="md" className="mt-3 w-full">{UI.choose[l]}</Btn></span>)}</span>)}
      {at("price", null)}{at("badge", null)}{at("cta", null)}{at("selector", null)}{at("logos", null)}
      {rest()}
      {at("plans", null, true)}{at("text", null, true)}{at("price", null, true)}{at("badge", null, true)}{at("cta", null, true)}{at("nav", null, true)}{at("logos", null, true)}
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
  const ctx: Ctx = { kind, element, surface, side, present: presence !== "absent", invert: behavior === "remove", lang, phone };
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
            {popup ? <Spot className="absolute inset-0 rounded-none ring-0 ring-offset-0"><Popup ctx={ctx} /></Spot> : null}
            {element === "popup" && !ctx.present ? <span className="absolute right-8 bottom-8"><Ghost lang={lang} className="h-14 w-48" /></span> : null}
          </span>
        </ScaledPage>
      </figure>
      {caption ? <span className="mt-2 block text-[11px] leading-snug text-ink-subtle">{CAPTION[kind][lang]}</span> : null}
    </div>
  );
}
