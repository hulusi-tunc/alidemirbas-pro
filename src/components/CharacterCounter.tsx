"use client";

import { useState } from "react";

const LIMITS = [
  { en: "Google Ads headline", tr: "Google Ads başlığı", limit: 30 },
  { en: "Google Ads description", tr: "Google Ads açıklaması", limit: 90 },
  { en: "Meta primary text (recommended)", tr: "Meta ana metni (önerilen)", limit: 125 },
  { en: "X / Twitter post", tr: "X / Twitter gönderisi", limit: 280 },
  { en: "SEO title tag", tr: "SEO başlık etiketi", limit: 60 },
  { en: "Meta description", tr: "Meta açıklama etiketi", limit: 155 },
];

export default function CharacterCounter({ lang }: { lang: "en" | "tr" }) {
  const [text, setText] = useState("");
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="rounded-lg border border-line bg-white p-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className="w-full rounded-md border border-line px-3 py-2 text-ink-950 outline-none focus:border-ink-900"
        placeholder={lang === "en" ? "Paste or type your text" : "Metninizi yapıştırın veya yazın"}
      />
      <div className="mt-4 flex gap-6 font-mono text-sm">
        <span>
          {lang === "en" ? "Characters" : "Karakter"}: <b>{chars}</b>
        </span>
        <span>
          {lang === "en" ? "Words" : "Kelime"}: <b>{words}</b>
        </span>
      </div>
      <div className="mt-6 border-t border-line pt-6">
        <p className="mb-3 text-sm text-neutral-600">{lang === "en" ? "Common limits" : "Yaygın limitler"}</p>
        <div className="flex flex-col gap-2">
          {LIMITS.map((l) => (
            <div key={l.en} className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">{lang === "en" ? l.en : l.tr}</span>
              <span className={`font-mono tabular-nums ${chars > l.limit ? "text-red-600" : "text-ink-950"}`}>
                {chars}/{l.limit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

