import { ArrowUpRight, Download, FileText } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { CopyLink } from "@/components/ui/CopyLink";
import { Reveal } from "@/components/ui/Reveal";
import { copy, LINKEDIN, type Lang } from "@/lib/content";
import { insights, type Post } from "@/lib/insights";

/* Insights (/content). The posts are the cv's, verbatim; the design is this
   site's — the about page's dark title band, then the writing as a single
   column of rules rather than a card grid, so the eye reads bodies of text in
   sequence instead of scanning tiles.

   Two posts carry a case study PDF, which sits inside the post as an attachment
   strip rather than as a separate download section. */

function Intro({ s }: { s: (typeof insights)[Lang] }) {
  return (
    <section
      data-tone="dark"
      className="relative isolate overflow-hidden bg-ink-950 pt-40 pb-20 md:pb-28"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-[-18rem] -z-10 h-[36rem] bg-[radial-gradient(50%_50%_at_50%_50%,var(--color-blue-600)_0%,transparent_70%)] opacity-40"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px)] [background-size:calc(100%/8)_100%]"
      />
      <div className="altor-container">
        <Reveal>
          <p className="altor-eyebrow mb-5 text-white/45">{s.eyebrow}</p>
          <h1 className="max-w-3xl bg-gradient-to-r from-primary-300 to-white bg-clip-text text-display-xl text-transparent">
            {s.title}
          </h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="max-w-2xl text-xl leading-relaxed text-white/75">{s.sub}</p>
        </Reveal>
      </div>
    </section>
  );
}

/** A case study attached to a post: title, extent, and the file itself. */
function Attachment({ pdf, label }: { pdf: NonNullable<Post["pdf"]>; label: string }) {
  return (
    <a
      href={pdf.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/pdf mt-6 flex items-center gap-4 border border-line bg-paper px-5 py-4 transition-colors hover:border-ink-900"
    >
      <FileText className="size-5 shrink-0 text-ink-400 transition-colors group-hover/pdf:text-blue-600" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9375rem] font-medium tracking-tight text-ink-950">
          {pdf.title}
        </span>
        <span className="block text-sm text-ink-500 tabular-nums">{pdf.meta}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-ink-500 transition-colors group-hover/pdf:text-ink-900">
        <Download className="size-4" aria-hidden />
        <span className="hidden sm:inline">{label}</span>
      </span>
    </a>
  );
}

function Entry({ post, s }: { post: Post; s: (typeof insights)[Lang] }) {
  return (
    <article className="border-t border-line py-10 last:border-b md:py-12">
      <p className="altor-eyebrow text-ink-400">{s.kicker}</p>
      <p className="mt-4 max-w-3xl text-[1.0625rem] leading-relaxed text-ink-700">{post.body}</p>

      {post.pdf ? <Attachment pdf={post.pdf} label={s.download} /> : null}

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
        <a
          href={post.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group/read inline-flex items-center gap-1.5 text-sm font-medium text-ink-900"
        >
          {s.read}
          <ArrowUpRight
            className="size-4 transition-transform duration-200 group-hover/read:-translate-y-0.5 group-hover/read:translate-x-0.5"
            aria-hidden
          />
        </a>
        <CopyLink href={post.href} label={s.copy} done={s.copied} />
      </div>
    </article>
  );
}

function Posts({ s }: { s: (typeof insights)[Lang] }) {
  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="altor-container">
        <div className="max-w-3xl">
          {s.posts.map((post, i) => (
            <Reveal key={post.id} delay={Math.min(i, 4) * 50}>
              <Entry post={post} s={s} />
            </Reveal>
          ))}

          <Reveal className="mt-12">
            <a
              href={LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="group/all inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink-900"
            >
              {s.seeAll}
              <ArrowUpRight
                className="size-4 transition-transform duration-200 group-hover/all:-translate-y-0.5 group-hover/all:translate-x-0.5"
                aria-hidden
              />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default function ContentPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const s = insights[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? "/tr/content" : "/content";
  return (
    <>
      <SiteHeader t={t} anchorBase={home} langHref={langHref} />
      <main>
        <Intro s={s} />
        <Posts s={s} />
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} />
    </>
  );
}
