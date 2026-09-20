import type { ReactNode } from "react";
import {
  Check,
  ChevronDown,
  CreditCard,
  Landmark,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Star,
  Truck,
  X,
} from "lucide-react";

import { Window } from "@/components/ui/LabWindow";
import { PixelHighlight } from "@/components/ui/PixelHighlight";
import { clsx } from "@/lib/clsx";
import type { AbElementKind, AbVariableKind } from "@/lib/ab-test-playbook";

/* THE SCREEN (Hulusi, 2026-09-20: "so low-fi - we want half low-fi, half
   high-fi; the high-fi part should be super realistic, real UI, to show the
   difference of the test"). One side of an A/B test drawn as a screen: the
   page the test runs on as a LOW-FI skeleton - bars and blocks, the way the
   homepage miniatures draw context - and on it the TESTED ELEMENT as real
   UI: a button with its label, a coupon field with its Apply, a countdown,
   a free-shipping bar, trust badges, a form, a nav, product cards, a plan
   table, a pop-up. The eye is sent to the element by the homepage's own
   device, PixelHighlight: the rose ring with the pixel pass confined
   inside it.

   TWO CLASSIFIERS FEED IT (lib/ab-test-playbook.ts): abElementKind says
   WHICH element to draw, abVariableKind says HOW the two sides differ, and
   the difference is applied to that element - present on one side and a
   dashed slot on the other, quiet then loud, three fields then five,
   ink then brand blue, step order swapped, the pop-up on load then after a
   scroll. A kind an element has no drawing for falls back to the element's
   normal state on both sides, and the caption under the screen still names
   the variable.

   THE HONESTY RULE, kept from the drawing this replaces: labels are real
   interface words ("Add to cart", "Coupon code", "Free shipping") and
   VALUES ARE BARS. No price, no count, no time, no review score is typed
   into a screen - the record never states one, and a number on a page is
   read as a fact. A countdown shows tiles with bars for digits; a price is
   a bar in a price's place; stars are outlines. Nothing is a brand. */

type Lang = "en" | "tr";
export type AbSide = "a" | "b" | "solo";

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
  endsIn: { en: "Ends in", tr: "Bitmesine" },
  hours: { en: "h", tr: "sa" },
  minutes: { en: "m", tr: "dk" },
  seconds: { en: "s", tr: "sn" },
  total: { en: "Total", tr: "Toplam" },
  perMonth: { en: "/ month", tr: "/ ay" },
  search: { en: "Search", tr: "Ara" },
  filters: { en: "Filters", tr: "Filtreler" },
  size: { en: "Size", tr: "Beden" },
  colour: { en: "Colour", tr: "Renk" },
  priceFilter: { en: "Price", tr: "Fiyat" },
  fullName: { en: "Full name", tr: "Ad Soyad" },
  email: { en: "Email", tr: "E-posta" },
  phone: { en: "Phone", tr: "Telefon" },
  address: { en: "Address", tr: "Adres" },
  city: { en: "City", tr: "Şehir" },
  optional: { en: "optional", tr: "isteğe bağlı" },
  helper: { en: "We only use this for delivery updates.", tr: "Sadece teslimat bilgilendirmesi için kullanılır." },
  signIn: { en: "Sign in", tr: "Giriş yap" },
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
  choose: { en: "Choose", tr: "Seç" },
  quantity: { en: "Quantity", tr: "Adet" },
  reviews: { en: "Reviews", tr: "Yorumlar" },
  notNow: { en: "Not now", tr: "Şimdi değil" },
  allow: { en: "Allow", tr: "İzin ver" },
  onLoad: { en: "on load", tr: "açılışta" },
  afterScroll: { en: "after a scroll", tr: "kaydırınca" },
  absent: { en: "absent", tr: "yok" },
  forYou: { en: "For returning visitors", tr: "Geri dönen ziyaretçiler için" },
  sticky: { en: "stays while scrolling", tr: "kaydırırken sabit" },
  inStock: { en: "In stock", tr: "Stokta" },
  outOfStock: { en: "Out of stock", tr: "Stokta yok" },
  viewAll: { en: "View all", tr: "Tümünü gör" },
  searchProducts: { en: "Search products", tr: "Ürün ara" },
  newArrivals: { en: "New arrivals", tr: "Yeni gelenler" },
  yourCart: { en: "Your cart", tr: "Sepetin" },
  delivery: { en: "Delivery", tr: "Teslimat" },
  payment: { en: "Payment", tr: "Ödeme" },
  description: { en: "Description", tr: "Açıklama" },
  add: { en: "Add", tr: "Ekle" },
  choosePlan: { en: "Choose your plan", tr: "Planını seç" },
  createAccount: { en: "Create your account", tr: "Hesabını oluştur" },
  saleEndsIn: { en: "Sale ends in", tr: "İndirimin bitmesine" },
} as const;

export function abCaption(kind: AbVariableKind, lang: Lang): string {
  return CAPTION[kind][lang];
}

/** The one line under each screen that names the variable - kept from the
    drawing this replaces, word for word. */
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

/* ---- the skeleton, low-fi ------------------------------------------- */

function Bar({ w = "w-full", className = "" }: { w?: string; className?: string }) {
  return <span aria-hidden className={clsx("block h-1.5 rounded-full bg-ink-950/10", w, className)} />;
}
function Block({ className = "" }: { className?: string }) {
  return <span aria-hidden className={clsx("block rounded-md bg-ink-950/[0.05]", className)} />;
}
/** A photograph's place: a soft two-tone tile, no placeholder glyph (the
    glyph is what made the earlier screens read as a wireframe). */
function Img({ className = "", video = false }: { className?: string; video?: boolean }) {
  return (
    <span aria-hidden className={clsx("grid place-items-center rounded-lg bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300", className)}>
      {video ? <span className="grid size-7 place-items-center rounded-full bg-paper/90 text-ink-900 shadow-sm"><Play className="size-3.5 fill-current" /></span> : null}
    </span>
  );
}
/** The shop's own top bar: a wordmark block and real menu words. */
function ShopNav({ lang }: { lang: Lang }) {
  const l = lang;
  return (
    <span className="flex items-center gap-3">
      <span className="h-3.5 w-9 rounded bg-ink-950/85" />
      {[UI.home[l], UI.shop[l], UI.sale[l], UI.about[l]].map((w, i) => <span key={w} className={clsx("text-[11px] font-medium", i === 1 ? "text-ink-950" : "text-ink-500")}>{w}</span>)}
      <span className="ml-auto flex items-center gap-2 text-ink-400"><Search className="size-3.5" /><span className="size-3.5 rounded-full bg-ink-950/15" /></span>
    </span>
  );
}
/** A product card as a shop draws one: the photograph, the name and the
    price as bars, a real Add button. */
function ProductCard({ lang, tall = false, children }: { lang: Lang; tall?: boolean; children?: ReactNode }) {
  return (
    <span className="relative block rounded-lg bg-paper p-1.5 ring-1 ring-ink-950/[0.06]">
      <Img className={tall ? "h-16" : "h-14"} />
      <Bar className="mt-2" w="w-4/5" />
      <span className="mt-1.5 flex items-center justify-between">
        <span className="block h-2 w-8 rounded bg-ink-950/80" />
        <span className="rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold text-ink-800 ring-1 ring-ink-950/[0.15]">{UI.add[lang]}</span>
      </span>
      {children}
    </span>
  );
}
function SectionTitle({ children }: { children: ReactNode }) {
  return <span className="block text-[12px] font-semibold text-ink-950">{children}</span>;
}

/* ---- the real UI, high-fi -------------------------------------------- */

function Btn({ children, tone = "ink", size = "md", className = "" }: { children: ReactNode; tone?: "ink" | "primary" | "outline" | "link"; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-semibold whitespace-nowrap",
        size === "sm" ? "h-7 px-2.5 text-[10.5px]" : size === "lg" ? "h-10 px-5 text-[12px]" : "h-8 px-3.5 text-[11px]",
        tone === "primary" && "bg-primary-600 text-white",
        tone === "ink" && "bg-ink-950 text-white",
        tone === "outline" && "bg-paper text-ink-900 ring-1 ring-ink-950/[0.15]",
        tone === "link" && "h-auto px-0 text-primary-700 underline underline-offset-2",
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
        <span className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-ink-700">
          {label}
          {tag ? <span className="rounded bg-paper-soft px-1 text-[9px] font-normal text-ink-500">{tag}</span> : null}
        </span>
      )}
      <span className={clsx("relative flex items-center rounded-md bg-paper px-2.5 text-[10.5px] text-ink-400 ring-1 ring-ink-950/[0.12]", tall ? "h-10" : "h-8")}>
        {floating ? <span className="absolute top-0.5 left-2.5 text-[8.5px] font-medium text-ink-600">{label}</span> : null}
        <span className={floating ? "mt-2.5" : ""}>{placeholder ?? ""}</span>
      </span>
      {helper ? <span className="mt-1 block text-[9.5px] text-ink-500">{helper}</span> : null}
    </span>
  );
}

/** The highlight: the homepage's rose ring with the pixel pass inside it. */
function Spot({ children, className = "", inline = false }: { children: ReactNode; className?: string; inline?: boolean }) {
  return (
    <PixelHighlight className={clsx("rounded-lg ring-2 ring-rose-300 ring-offset-2 ring-offset-paper", inline ? "inline-block" : "", className)}>
      {children}
    </PixelHighlight>
  );
}

/** Where the element would be, on the side that does not have it. */
function Ghost({ lang, className = "h-9" }: { lang: Lang; className?: string }) {
  return (
    <span className={clsx("grid place-items-center rounded-lg border border-dashed border-rose-300 text-[9.5px] font-medium tracking-wide text-rose-400 uppercase", className)}>
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
  lang: Lang;
};

/** `a` on side A, `b` on side B, `normal` when the kind is not this one
    (or on a solo drawing). */
function diff<T>(ctx: Ctx, kinds: AbVariableKind | AbVariableKind[], a: T, b: T, normal: T): T {
  const ks = Array.isArray(kinds) ? kinds : [kinds];
  if (!ks.includes(ctx.kind) || ctx.side === "solo") return normal;
  return ctx.side === "b" ? b : a;
}

function Countdown({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const loud = diff(ctx, "emphasis", false, true, false);
  return (
    <span className={clsx("flex items-center gap-3 rounded-lg px-3 py-2 text-white", loud ? "bg-primary-600" : "bg-ink-950")}>
      <span className="text-[11px] font-semibold">{UI.saleEndsIn[l]}</span>
      <span className="ml-auto flex items-center gap-1.5">
        {[UI.hours, UI.minutes, UI.seconds].map((u, i) => (
          <span key={u.en} className="flex items-center gap-1.5">
            <span className="flex h-7 w-8 flex-col items-center justify-center rounded-md bg-white/15">
              <span className="block h-2 w-4 rounded-sm bg-white/90" />
              <span className="mt-0.5 text-[7.5px] leading-none text-white/60">{u[l]}</span>
            </span>
            {i < 2 ? <span className="text-[11px] font-semibold text-white/60">:</span> : null}
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
  const size = diff<"sm" | "md" | "lg">(ctx, ["size", "anatomy"], "sm", "lg", diff(ctx, "emphasis", "md", "lg", "md"));
  const two = diff(ctx, "quantity", false, true, false);
  return (
    <span className="flex flex-wrap items-center gap-2">
      <Btn tone={tone} size={size} className={size === "lg" ? "flex-1" : ""}>{wording}</Btn>
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
      <span className="flex items-center gap-2 rounded-md bg-emerald-50 px-2.5 py-2 text-[10.5px] font-medium text-emerald-700">
        <Check className="size-3.5" /> {UI.codeApplied[l]}
      </span>
    );
  }
  if (asLink) return <Btn tone="link">{UI.haveCoupon[l]}</Btn>;
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-8 flex-1 items-center rounded-md bg-paper px-2.5 text-[10.5px] text-ink-400 ring-1 ring-ink-950/[0.12]">{UI.couponCode[l]}</span>
      <Btn tone="primary" size="md">{UI.apply[l]}</Btn>
    </span>
  );
}

function Shipping({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const at = diff(ctx, "threshold", 40, 70, 55);
  return (
    <span className="block rounded-lg bg-paper-soft px-2.5 py-2">
      <span className="flex items-center gap-1.5 text-[10px] font-medium text-ink-800"><Truck className="size-3.5 text-primary-600" />{UI.freeShipping[l]}</span>
      <span className="relative mt-1.5 block h-1.5 rounded-full bg-ink-950/10">
        <span className="absolute inset-y-0 left-0 rounded-full bg-primary-600" style={{ width: `${at}%` }} />
        <span className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary-600 bg-paper" style={{ left: `${at}%` }} />
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
    <span className={clsx("flex gap-1.5", column ? "flex-col" : "flex-wrap")}>
      {items.slice(0, n).map((b) => (
        <span key={b.label} className={clsx("inline-flex items-center gap-1 rounded-md text-[10px] font-medium [&>svg]:size-3.5", loud ? "bg-emerald-50 px-2 py-1 text-emerald-700" : "text-ink-600 [&>svg]:text-ink-400")}>
          {b.icon}{b.label}
        </span>
      ))}
    </span>
  );
}

function Price({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const unit = diff(ctx, ["format", "options"], false, true, false);
  const big = diff(ctx, ["emphasis", "size"], false, true, false);
  return (
    <span className="flex items-end gap-2">
      <span className={clsx("block rounded-md bg-ink-950/80", big ? "h-5 w-20" : "h-3.5 w-14")} />
      {unit ? <span className="text-[10px] text-ink-500">{UI.perMonth[l]}</span> : null}
      {diff(ctx, "emphasis", false, true, false) ? <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-semibold text-rose-700">%</span> : null}
    </span>
  );
}

function Payment({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const guest = diff(ctx, "presence", false, true, true) && ctx.present;
  const saved = diff(ctx, ["options", "format"], false, true, false);
  return (
    <span className="block">
      <span className="grid grid-cols-3 gap-1.5">
        {[{ i: <CreditCard />, t: saved ? UI.savedCard[l] : UI.card[l] }, { i: <Landmark />, t: UI.bankTransfer[l] }, { i: <Smartphone />, t: UI.wallet[l] }].map((m, i) => (
          <span key={m.t} className={clsx("flex flex-col items-center gap-1 rounded-md py-2 text-[9.5px] font-medium ring-1 [&>svg]:size-4", i === 0 ? "bg-primary-50 text-primary-700 ring-primary-200" : "bg-paper text-ink-700 ring-ink-950/[0.1]")}>
            {m.i}{m.t}
          </span>
        ))}
      </span>
      {guest && ctx.element === "payment" ? <span className="mt-2 block text-center"><Btn tone="link">{UI.continueAsGuest[l]}</Btn></span> : null}
    </span>
  );
}

function Stepper({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  let steps = [...UI.steps[l]];
  if (diff(ctx, ["ordering", "options"], false, true, false)) steps = [steps[1], steps[0], steps[2]];
  const single = diff(ctx, "options", true, false, false) && ctx.element === "stepper" && ctx.surface === "checkout";
  if (single) return <span className="flex items-center gap-2 text-[10px] font-medium text-ink-700"><span className="size-2 rounded-full bg-primary-600" />{steps.join(" · ")}</span>;
  return (
    <span className="flex items-center gap-2">
      {steps.map((s, i) => (
        <span key={s} className="flex flex-1 items-center gap-1.5">
          <span className={clsx("grid size-4 shrink-0 place-items-center rounded-full text-[8.5px] font-semibold", i === 0 ? "bg-primary-600 text-white" : "bg-paper-soft text-ink-500")}>{i + 1}</span>
          <span className={clsx("text-[9.5px] font-medium whitespace-nowrap", i === 0 ? "text-ink-900" : "text-ink-500")}>{s}</span>
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
    <span className={clsx("grid gap-2", twoCol ? "grid-cols-2" : "grid-cols-1")}>
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
    <span className={clsx("flex items-center gap-3 rounded-md px-2.5 py-1.5", sticky ? "bg-paper shadow-[0_8px_20px_-12px_rgb(10_16_32/0.4)] ring-1 ring-ink-950/[0.06]" : "")}>
      <span className="h-3 w-8 rounded bg-ink-950/80" />
      {items.map((t, i) => <span key={t} className={clsx("text-[10px] font-medium", i === 1 ? "text-ink-950" : "text-ink-600")}>{t}</span>)}
      {sticky ? <span className="ml-auto rounded bg-paper-soft px-1.5 py-0.5 text-[8.5px] text-ink-500">{UI.sticky[l]}</span> : null}
    </span>
  );
}

function SearchBox({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const iconOnly = diff(ctx, "emphasis", true, false, false);
  if (iconOnly) return <span className="grid size-8 place-items-center rounded-md ring-1 ring-ink-950/[0.12] text-ink-600"><Search className="size-3.5" /></span>;
  return (
    <span className="flex h-8 items-center gap-2 rounded-md bg-paper px-2.5 text-[10.5px] text-ink-400 ring-1 ring-ink-950/[0.12]">
      <Search className="size-3.5 text-ink-500" />{UI.search[l]}
    </span>
  );
}

function Filters({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const panel = diff(ctx, ["options", "format", "layout"], false, true, false);
  const chips = [UI.size[l], UI.colour[l], UI.priceFilter[l]];
  if (panel) {
    return (
      <span className="flex flex-col gap-1.5 rounded-md bg-paper-soft p-2">
        {chips.map((c) => <span key={c} className="flex items-center justify-between text-[10px] font-medium text-ink-800">{c}<ChevronDown className="size-3 text-ink-400" /></span>)}
      </span>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 rounded-md bg-ink-950 px-2 py-1 text-[9.5px] font-medium text-white"><SlidersHorizontal className="size-3" />{UI.filters[l]}</span>
      {chips.map((c) => <span key={c} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[9.5px] font-medium text-ink-700 ring-1 ring-ink-950/[0.12]">{c}<ChevronDown className="size-3 text-ink-400" /></span>)}
    </span>
  );
}

function Popup({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const later = diff(ctx, "timing", false, true, false);
  const dim = diff(ctx, ["style", "options"], "bg-ink-950/20", "bg-ink-950/55", "bg-ink-950/35");
  const chat = ctx.surface === "saas" && diff(ctx, "behavior", false, true, false);
  return (
    <span className={clsx("absolute inset-0 z-10 grid p-4", dim, chat ? "items-end justify-end" : later ? "items-end justify-center pb-6" : "place-items-center")}>
      <span className="block w-full max-w-[13rem] rounded-xl bg-paper p-3 shadow-[0_24px_60px_-24px_rgb(10_16_32/0.5)]">
        <span className="flex items-center justify-between"><Bar w="w-16" className="h-2" /><X className="size-3 text-ink-400" /></span>
        <Bar className="mt-2.5" /><Bar className="mt-1.5" w="w-3/4" />
        <span className="mt-3 flex gap-1.5"><Btn tone="outline" size="sm">{UI.notNow[l]}</Btn><Btn tone="primary" size="sm">{UI.allow[l]}</Btn></span>
        {ctx.kind === "timing" ? <span className="mt-2 block text-center text-[9px] text-ink-500">{later ? UI.afterScroll[l] : UI.onLoad[l]}</span> : null}
      </span>
    </span>
  );
}

function Media({ ctx }: { ctx: Ctx }) {
  const video = diff(ctx, ["media", "options"], false, true, false);
  const n = diff(ctx, "quantity", 1, 3, 1);
  const big = diff(ctx, "size", false, true, false);
  return (
    <span className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {Array.from({ length: n }, (_, i) => <Img key={i} video={video && i === 0} className={big ? "h-28" : "h-20"} />)}
    </span>
  );
}

function Reviews({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  const photos = diff(ctx, "media", false, true, false);
  const video = diff(ctx, ["options", "media"], false, true, false) && ctx.surface !== "pdp";
  return (
    <span className="block rounded-md bg-paper-soft p-2.5">
      <span className="flex items-center justify-between">
        <span className="flex items-center gap-0.5 text-amber-500">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="size-3" />)}</span>
        <span className="text-[9.5px] font-medium text-ink-600">{UI.reviews[l]}</span>
      </span>
      <Bar className="mt-2" /><Bar className="mt-1.5" w="w-2/3" />
      {photos ? <span className="mt-2 flex gap-1.5"><Img className="size-8" /><Img className="size-8" /><Img className="size-8" /></span> : null}
      {video ? <Img video className="mt-2 h-14" /> : null}
    </span>
  );
}

function Grid({ ctx }: { ctx: Ctx }) {
  const l = ctx.lang;
  // "2'li mi 3'lü grid mi" is the archive's own phrasing of this test.
  const cols = diff(ctx, "quantity", 2, 3, 3);
  const list = diff(ctx, ["options", "layout"], false, true, false);
  const priceFirst = diff(ctx, "hierarchy", false, true, false);
  const badge = diff(ctx, "presence", false, true, false) && ctx.present;
  const stock = diff(ctx, ["options", "format"], false, true, false) && ctx.kind !== "quantity";
  const items = Array.from({ length: list ? 2 : cols }, (_, i) => i);
  return (
    <span className={clsx("grid gap-1.5", list ? "grid-cols-1" : "")} style={list ? undefined : { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {items.map((i) => (
        <span key={i} className={clsx("relative rounded-lg bg-paper p-1.5 ring-1 ring-ink-950/[0.06]", list ? "flex items-center gap-2.5" : "block")}>
          <Img className={list ? "size-12 shrink-0" : "h-14"} />
          <span className={clsx("block min-w-0", list ? "flex-1" : "mt-2")}>
            {priceFirst ? <span className="block h-2 w-8 rounded bg-ink-950/80" /> : <Bar w="w-4/5" />}
            {priceFirst ? <Bar className="mt-1.5" w="w-4/5" /> : <span className="mt-1.5 block h-2 w-8 rounded bg-ink-950/80" />}
          </span>
          {badge && i === 0 ? <span className="absolute top-1 left-1 rounded bg-rose-600 px-1 py-0.5 text-[7.5px] font-semibold text-white">%</span> : null}
          {stock && i === 1 ? <span className="absolute top-1 right-1 rounded bg-paper-soft px-1 py-0.5 text-[7.5px] font-medium text-ink-500">{UI.outOfStock[l]}</span> : null}
          {list ? <Btn tone="outline" size="sm">{UI.addToCart[l]}</Btn> : null}
        </span>
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
      <span className="mx-auto mb-2 flex w-fit rounded-md bg-paper-soft p-0.5 text-[9.5px] font-medium">
        <span className={clsx("rounded px-2 py-0.5", !yearly ? "bg-paper text-ink-950 shadow-sm" : "text-ink-500")}>{UI.monthly[l]}</span>
        <span className={clsx("rounded px-2 py-0.5", yearly ? "bg-paper text-ink-950 shadow-sm" : "text-ink-500")}>{UI.yearly[l]}</span>
      </span>
      <span className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {names.slice(0, n).map((p, i) => (
          <span key={p} className={clsx("relative flex flex-col gap-1.5 rounded-md p-2 ring-1", i === 1 ? "bg-ink-950 text-white ring-ink-950" : "bg-paper text-ink-900 ring-ink-950/[0.1]")}>
            {popular && i === 1 ? <span className="absolute -top-2 left-2 rounded bg-primary-600 px-1.5 py-0.5 text-[7.5px] font-semibold text-white">{UI.mostPopular[l]}</span> : null}
            <span className="text-[10px] font-semibold">{p}</span>
            <span className={clsx("block h-3 w-10 rounded", i === 1 ? "bg-white/80" : "bg-ink-950/80")} />
            <Bar w="w-3/4" className={i === 1 ? "bg-white/20" : ""} /><Bar w="w-1/2" className={i === 1 ? "bg-white/20" : ""} />
            <Btn tone={i === 1 ? "primary" : "outline"} size="sm" className="mt-1">{UI.choose[l]}</Btn>
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
  if (ctx.surface === "cart" || ctx.surface === "checkout" || ctx.element === "selector" && ctx.kind === "emphasis") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-ink-700">
        {UI.quantity[l]}
        <span className="inline-flex items-center rounded-md ring-1 ring-ink-950/[0.15]"><span className="grid size-6 place-items-center"><Minus className="size-3" /></span><span className="h-2 w-3 rounded bg-ink-950/70" /><span className="grid size-6 place-items-center"><Plus className="size-3" /></span></span>
      </span>
    );
  }
  const opts = ["S", "M", "L"];
  return (
    <span className="flex items-center gap-1.5">
      {opts.map((o, i) =>
        chips ? (
          <span key={o} className={clsx("grid size-7 place-items-center rounded-md text-[10px] font-semibold ring-1", pre && i === 1 ? "bg-ink-950 text-white ring-ink-950" : "text-ink-800 ring-ink-950/[0.15]")}>{o}</span>
        ) : (
          <span key={o} className="flex items-center gap-1 text-[10px] text-ink-800"><span className={clsx("size-3 rounded-full border-2", pre && i === 1 ? "border-primary-600 bg-primary-600" : "border-ink-300")} />{o}</span>
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
      {personal ? <span className="mb-1.5 inline-block rounded bg-primary-50 px-1.5 py-0.5 text-[9px] font-medium text-primary-700">{UI.forYou[l]}</span> : null}
      <span className={clsx("block rounded bg-ink-950/80", loud ? "h-3.5 w-4/5" : "h-2.5 w-3/5")} />
      <Bar className="mt-2" w={longer ? "w-full" : "w-2/3"} />
      {longer ? <Bar className="mt-1.5" w="w-1/2" /> : null}
    </span>
  );
}

function Generic({ ctx }: { ctx: Ctx }) {
  const loud = diff(ctx, "emphasis", false, true, false);
  const big = diff(ctx, "size", false, true, false);
  return <span className={clsx("block rounded-md", loud ? "bg-ink-950" : "bg-ink-950/[0.08]", big ? "h-12" : "h-8")} />;
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
    default: return <Generic ctx={ctx} />;
  }
}

/* ---- the page around it ---------------------------------------------- */

/** The tested element in its slot, ringed - or its dashed ghost when this
    side does not have it. Every other slot draws its skeleton. */
function useSlots(ctx: Ctx) {
  const moved = diff(ctx, "placement", false, true, false);
  let placed = false;
  const at = (name: AbElementKind, skeleton: ReactNode, alt = false): ReactNode => {
    const mine = ctx.element === name && (moved ? alt : !alt);
    if (!mine) return alt ? null : skeleton;
    placed = true;
    if (!ctx.present) return <Ghost lang={ctx.lang} className={name === "form" || name === "grid" || name === "plans" ? "h-16" : "h-9"} />;
    return <Spot><Element ctx={ctx} /></Spot>;
  };
  /** Somewhere for an element the page has no slot of its own for. */
  const rest = (): ReactNode => {
    if (placed || ctx.element === "popup") return null;
    placed = true;
    if (!ctx.present) return <Ghost lang={ctx.lang} />;
    return <Spot><Element ctx={ctx} /></Spot>;
  };
  return { at, rest };
}

function Pdp({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx);
  return (
    <span className="flex flex-col gap-3">
      {at("nav", <ShopNav lang={ctx.lang} />)}
    <span className="grid grid-cols-[1fr_1.15fr] gap-3">
      <span className="flex flex-col gap-1.5">
        {at("media", <Img className="h-32" />)}
        <span className="grid grid-cols-4 gap-1"><Img className="h-7" /><Img className="h-7" /><Img className="h-7" /><Img className="h-7" /></span>
      </span>
      <span className="flex flex-col gap-2">
        {at("text", <><span className="block h-2.5 w-5/6 rounded bg-ink-950/80" /><Bar w="w-1/2" /></>)}
        {at("reviews", <span className="flex items-center gap-0.5 text-amber-500">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="size-2.5" />)}</span>)}
        {at("price", <span className="block h-3.5 w-14 rounded-md bg-ink-950/80" />)}
        {at("selector", <span className="flex gap-1">{["S", "M", "L"].map((o) => <span key={o} className="grid size-6 place-items-center rounded text-[9px] font-medium text-ink-600 ring-1 ring-ink-950/[0.1]">{o}</span>)}</span>)}
        {at("cta", <Btn tone="ink" className="w-full">{UI.addToCart[ctx.lang]}</Btn>)}
        {at("shipping", null)}
        {at("badge", <span className="flex gap-2 text-ink-400 [&>svg]:size-3"><ShieldCheck /><Truck /><RotateCcw /></span>)}
        {at("countdown", null)}
        {at("coupon", null)}
        {rest()}
        {at("cta", null, true)}{at("badge", null, true)}{at("price", null, true)}{at("reviews", null, true)}{at("text", null, true)}{at("media", null, true)}{at("selector", null, true)}
        <span className="mt-1 block"><SectionTitle>{UI.description[ctx.lang]}</SectionTitle><Bar className="mt-1.5" /><Bar className="mt-1" w="w-3/4" /></span>
      </span>
    </span>
    {at("nav", null, true)}
    </span>
  );
}

function Plp({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx);
  const l = ctx.lang;
  return (
    <span className="flex flex-col gap-3">
      {at("nav", <ShopNav lang={l} />)}
      <span className="flex items-center gap-2">
        <span className="min-w-0 flex-1">{at("search", <span className="flex h-8 items-center gap-2 rounded-md bg-paper px-2.5 text-[11px] text-ink-400 ring-1 ring-ink-950/[0.12]"><Search className="size-3.5 text-ink-500" />{UI.searchProducts[l]}</span>)}</span>
        {at("filters", <span className="flex gap-1.5">{[UI.size[l], UI.colour[l]].map((c) => <span key={c} className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium text-ink-700 ring-1 ring-ink-950/[0.12]">{c}<ChevronDown className="size-3 text-ink-400" /></span>)}</span>)}
      </span>
      {at("countdown", null)}{at("text", null)}{at("badge", null)}{at("media", null)}
      {rest()}
      <SectionTitle>{UI.newArrivals[l]}</SectionTitle>
      {at("grid", <span className="grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => <ProductCard key={i} lang={l} />)}</span>)}
      {at("countdown", null, true)}{at("text", null, true)}{at("badge", null, true)}{at("search", null, true)}{at("filters", null, true)}{at("nav", null, true)}{at("media", null, true)}
      <span className="flex justify-center gap-1">{[0, 1, 2].map((i) => <span key={i} className={clsx("size-1.5 rounded-full", i === 0 ? "bg-ink-950/60" : "bg-ink-950/15")} />)}</span>
    </span>
  );
}

function Checkout({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx);
  const l = ctx.lang;
  return (
    <span className="flex flex-col gap-3">
      {at("nav", null)}
      {at("stepper", <span className="flex items-center gap-2.5">{UI.steps[l].map((s, i) => <span key={s} className={clsx("text-[10.5px] font-medium", i === 0 ? "text-ink-950" : "text-ink-400")}>{s}</span>)}</span>)}
      <SectionTitle>{UI.yourCart[l]}</SectionTitle>
      <span className="flex flex-col gap-2">
        {[0, 1].map((i) => (
          <span key={i} className="flex items-center gap-2.5"><Img className="size-10 shrink-0" /><span className="flex-1"><Bar w="w-3/4" /><Bar className="mt-1.5" w="w-1/3" /></span>{i === 0 ? at("selector", <span className="h-2 w-8 rounded bg-ink-950/60" />) : <span className="h-2 w-8 rounded bg-ink-950/60" />}</span>
        ))}
      </span>
      {at("coupon", null)}{at("shipping", null)}{at("countdown", null)}
      {at("form", null)}
      {at("payment", null)}
      <span className="flex items-center justify-between border-t border-line-soft pt-2 text-[10px] font-medium text-ink-800">{UI.total[l]}{at("price", <span className="block h-3 w-12 rounded bg-ink-950/80" />)}</span>
      {at("cta", <Btn tone="ink" className="w-full">{UI.checkout[l]}</Btn>)}
      {at("badge", null)}{at("text", null)}
      {rest()}
      {at("coupon", null, true)}{at("shipping", null, true)}{at("payment", null, true)}{at("cta", null, true)}{at("badge", null, true)}{at("stepper", null, true)}{at("selector", null, true)}{at("countdown", null, true)}{at("text", null, true)}{at("price", null, true)}{at("form", null, true)}
    </span>
  );
}

function FormPage({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx);
  const l = ctx.lang;
  return (
    <span className="mx-auto flex max-w-[17rem] flex-col gap-3">
      {at("stepper", null)}
      {at("text", <><SectionTitle>{UI.createAccount[l]}</SectionTitle><Bar w="w-1/2" /></>)}
      {at("payment", null)}
      {at("form", <span className="grid gap-2"><Field label={UI.fullName[l]} /><Field label={UI.email[l]} /></span>)}
      {at("selector", null)}
      {at("cta", <Btn tone="primary" className="w-full">{UI.continue[l]}</Btn>)}
      {at("badge", null)}
      {rest()}
      {at("form", null, true)}{at("cta", null, true)}{at("text", null, true)}{at("badge", null, true)}{at("stepper", null, true)}{at("payment", null, true)}
    </span>
  );
}

function Home({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx);
  const l = ctx.lang;
  return (
    <span className="flex flex-col gap-2.5">
      {at("nav", <ShopNav lang={l} />)}
      <span className="grid grid-cols-[1.1fr_1fr] items-center gap-3 rounded-lg bg-paper-soft p-3">
        <span className="flex flex-col gap-2">
          {at("text", <><span className="block h-3 w-4/5 rounded bg-ink-950/80" /><Bar /><Bar w="w-2/3" /></>)}
          {at("cta", <Btn tone="primary">{UI.getStarted[l]}</Btn>)}
          {at("badge", null)}
        </span>
        {at("media", <Img className="h-20" />)}
      </span>
      {at("countdown", null)}{at("reviews", null)}{at("search", null)}{at("plans", null)}{at("form", null)}{at("price", null)}
      {rest()}
      {at("grid", <span className="grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => <ProductCard key={i} lang={l} />)}</span>)}
      {at("nav", null, true)}{at("text", null, true)}{at("cta", null, true)}{at("badge", null, true)}{at("media", null, true)}{at("countdown", null, true)}{at("reviews", null, true)}{at("grid", null, true)}{at("search", null, true)}{at("plans", null, true)}{at("form", null, true)}{at("price", null, true)}
    </span>
  );
}

function PricingPage({ ctx }: { ctx: Ctx }) {
  const { at, rest } = useSlots(ctx);
  return (
    <span className="flex flex-col gap-3">
      {at("text", <span className="block text-center"><SectionTitle>{UI.choosePlan[ctx.lang]}</SectionTitle><Bar className="mx-auto mt-1.5 w-1/2" /></span>)}
      {at("plans", <span className="grid grid-cols-3 gap-1.5">{[0, 1, 2].map((i) => <span key={i} className={clsx("block rounded-md p-2 ring-1", i === 1 ? "bg-ink-950 ring-ink-950" : "bg-paper ring-ink-950/[0.1]")}><Bar w="w-1/2" className={i === 1 ? "bg-white/40" : ""} /><span className={clsx("mt-2 block h-3 w-10 rounded", i === 1 ? "bg-white/80" : "bg-ink-950/80")} /><Block className={clsx("mt-2 h-5", i === 1 ? "bg-white/20" : "")} /></span>)}</span>)}
      {at("price", null)}{at("badge", null)}{at("cta", null)}{at("selector", null)}
      {rest()}
      {at("plans", null, true)}{at("text", null, true)}{at("price", null, true)}{at("badge", null, true)}{at("cta", null, true)}
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

/* ---- the screen ------------------------------------------------------- */

export function AbScreen({
  surface,
  element,
  kind,
  side,
  presence,
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
  const ctx: Ctx = { kind, element, surface, side, present: presence !== "absent", lang };
  const popup = element === "popup" && ctx.present;
  const mobile = surface === "mobile";
  return (
    <div className={clsx("min-w-0", className)}>
      {/* The site's own product window (ui/LabWindow.tsx) - the frame every
          Lab product page shows its screenshots in - rather than a chrome
          of our own: one frame, no box inside a box. */}
      <Window label={label} address={address} className={clsx(mobile ? "mx-auto max-w-[18rem]" : "", ring && "ring-2 ring-primary-400 ring-offset-2 ring-offset-paper-soft")}>
        <span className="relative block p-4 text-[12px] leading-snug text-ink-700 sm:p-5">
          <Body ctx={ctx} />
          {popup ? <Spot className="absolute inset-0 rounded-none ring-0 ring-offset-0"><Popup ctx={ctx} /></Spot> : null}
          {element === "popup" && !ctx.present ? <span className="absolute right-4 bottom-4"><Ghost lang={lang} className="h-8 w-24" /></span> : null}
        </span>
      </Window>
      {caption ? <span className="mt-2 block text-[11px] leading-snug text-ink-subtle">{CAPTION[kind][lang]}</span> : null}
    </div>
  );
}
