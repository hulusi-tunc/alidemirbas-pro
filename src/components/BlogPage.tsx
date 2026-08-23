import { SiteFooter, SiteHeader } from "@/components/Site";
import { copy, type Lang } from "@/lib/content";

/* No posts yet. An honest empty state, not a placeholder pretending
   otherwise - the first post creates a list, not this file. */
const T = {
  en: {
    eyebrow: "Blog",
    title: "Nothing published yet.",
    body: "This section is reserved for writing on growth, CRM and lifecycle marketing. The first post will show up here.",
  },
  tr: {
    eyebrow: "Blog",
    title: "Henüz bir yazı yok.",
    body: "Bu bölüm büyüme, CRM ve lifecycle pazarlama üzerine yazılar için ayrıldı. İlk yazı burada görünecek.",
  },
};

export default function BlogPage({ lang }: { lang: Lang }) {
  const c = copy[lang];
  const t = T[lang];
  const home = lang === "en" ? "/" : "/tr";

  return (
    <>
      <SiteHeader t={c} anchorBase={home} langHref={lang === "en" ? "/tr/blog" : "/blog"} />
      <main>
        <section data-tone="dark" className="relative isolate overflow-hidden bg-ink-950 pt-40 pb-24 md:pb-32">
          <div className="altor-container">
            <p className="altor-eyebrow text-white/50">{t.eyebrow}</p>
            <h1 className="mt-2 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t.title}</h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/70">{t.body}</p>
          </div>
        </section>
      </main>
      <SiteFooter t={c} lang={lang} />
    </>
  );
}
