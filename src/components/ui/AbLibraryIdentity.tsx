import {
  Briefcase,
  ClipboardList,
  Component,
  CreditCard,
  Home,
  LayoutDashboard,
  LayoutList,
  PartyPopper,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Search,
  Smartphone,
  Tag,
  Target,
  type LucideIcon,
} from "lucide-react";

/* THE A/B LIBRARY'S IDENTITY (2026-09-20, Hulusi: bring /lab/ab-testing/
   library onto the Journey Library's design). The journey library gives
   every category a glyph and a tint (ui/LibraryChrome.tsx) so the rail,
   the section headings and the cards can be scanned before they are
   read; this is the same vocabulary for the A/B archive's twelve real
   categories and fourteen real pages. The keys are the dataset's own
   stored values (categories are English strings printed verbatim on the
   English pages, surfaces are the short slugs) - nothing here renames or
   regroups the data, it only draws it.

   Hues in the Lab identity's form, a -50 ground under a -700 glyph.
   Neighbours in the archive's own order never share a hue. */
type Accent = { tile: string; ink: string };

const CATEGORY: Record<string, { icon: LucideIcon; accent: Accent }> = {
  "Cart & Checkout": { icon: ShoppingCart, accent: { tile: "bg-sky-50 text-sky-700", ink: "text-sky-700" } },
  "Product Detail Page": { icon: ShoppingBag, accent: { tile: "bg-violet-50 text-violet-700", ink: "text-violet-700" } },
  "Home & Landing": { icon: Home, accent: { tile: "bg-amber-50 text-amber-700", ink: "text-amber-700" } },
  "Category & Listing": { icon: LayoutList, accent: { tile: "bg-emerald-50 text-emerald-700", ink: "text-emerald-700" } },
  "Forms & Signup": { icon: ClipboardList, accent: { tile: "bg-rose-50 text-rose-700", ink: "text-rose-700" } },
  "UI Elements": { icon: Component, accent: { tile: "bg-teal-50 text-teal-700", ink: "text-teal-700" } },
  "SaaS & B2B": { icon: Briefcase, accent: { tile: "bg-indigo-50 text-indigo-700", ink: "text-indigo-700" } },
  "Search & Filtering": { icon: Search, accent: { tile: "bg-orange-50 text-orange-700", ink: "text-orange-700" } },
  "Mobile App": { icon: Smartphone, accent: { tile: "bg-cyan-50 text-cyan-700", ink: "text-cyan-700" } },
  Pricing: { icon: Tag, accent: { tile: "bg-lime-50 text-lime-700", ink: "text-lime-700" } },
  "Thank You": { icon: PartyPopper, accent: { tile: "bg-fuchsia-50 text-fuchsia-700", ink: "text-fuchsia-700" } },
  Dashboard: { icon: LayoutDashboard, accent: { tile: "bg-slate-100 text-slate-700", ink: "text-slate-700" } },
};
const NEUTRAL: Accent = { tile: "bg-paper-soft text-ink-700", ink: "text-ink-500" };

export function abCategoryAccent(id: string): Accent {
  return CATEGORY[id]?.accent ?? NEUTRAL;
}

export function AbCategoryIcon({ id, className = "size-4" }: { id: string; className?: string }) {
  const Icon = CATEGORY[id]?.icon ?? Target;
  return <Icon aria-hidden className={className} />;
}

/** One glyph per page (the dataset's `surface`), for the Page filter and
    the card's accent badge - the same pairing the journey card makes
    between a channel and its glyph. */
const SURFACE: Record<string, LucideIcon> = {
  pdp: ShoppingBag,
  plp: LayoutList,
  home: Home,
  cart: ShoppingCart,
  checkout: CreditCard,
  search: Search,
  filters: SlidersHorizontal,
  form: ClipboardList,
  pricing: Tag,
  saas: Briefcase,
  mobile: Smartphone,
  thankyou: PartyPopper,
  dashboard: LayoutDashboard,
  "generic-ui": Component,
};

export function SurfaceIcon({ id, className = "size-4" }: { id: string; className?: string }) {
  const Icon = SURFACE[id] ?? Component;
  return <Icon aria-hidden className={className} />;
}

/** The "any page" glyph the Page filter opens with. */
export const ALL_SURFACES_ICON = <Component aria-hidden />;
