import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { NotFoundMark } from "@/components/ui/NotFoundMark";
import { copy, type Lang } from "@/lib/content";

/* Deliberately minimal - no SiteHeader/SiteFooter, no nav, no secondary
   links. Just the mark, the code, a short human sentence and one way
   back, per instruction 7 ("gereksiz seçenek kalabalığı oluşturma"). */
export default function NotFoundPage({ lang }: { lang: Lang }) {
  const t = copy[lang].notFound;
  const home = lang === "en" ? "/" : "/tr";

  return (
    <main className="flex min-h-svh flex-col bg-paper">
      <div className="altor-container flex h-20 items-center">
        <Link href={home} className="text-[15px] font-semibold tracking-tight text-ink-950">
          Ali Demirbaş
        </Link>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <NotFoundMark className="h-16 w-auto text-ink-300" />
        <p className="mt-8 font-mono text-sm tracking-[0.2em] text-neutral-400">{t.eyebrow}</p>
        <h1 className="mt-3 max-w-md text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">
          {t.title}
        </h1>
        <p className="mt-3 max-w-sm text-base leading-relaxed text-ink-500">{t.body}</p>
        <ButtonLink href={home} variant="primary" size="sm" className="mt-8">
          {t.cta}
        </ButtonLink>
      </div>
    </main>
  );
}
