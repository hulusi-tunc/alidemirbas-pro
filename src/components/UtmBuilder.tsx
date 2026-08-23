"use client";

import { useState } from "react";

const FIELDS = [
  { key: "url", en: "Destination URL", tr: "Hedef URL", param: null },
  { key: "source", en: "Campaign Source", tr: "Kaynak (source)", param: "utm_source" },
  { key: "medium", en: "Campaign Medium", tr: "Mecra (medium)", param: "utm_medium" },
  { key: "campaign", en: "Campaign Name", tr: "Kampanya adı", param: "utm_campaign" },
  { key: "term", en: "Campaign Term (optional)", tr: "Terim (opsiyonel)", param: "utm_term" },
  { key: "content", en: "Campaign Content (optional)", tr: "İçerik (opsiyonel)", param: "utm_content" },
] as const;

export default function UtmBuilder({ lang }: { lang: "en" | "tr" }) {
  const [v, setV] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  let result = "";
  try {
    if (v.url) {
      const u = new URL(v.url);
      for (const f of FIELDS) if (f.param && v[f.key]) u.searchParams.set(f.param, v[f.key]);
      result = u.toString();
    }
  } catch {
    result = "";
  }

  return (
    <div className="rounded-lg border border-line bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink-900">{lang === "en" ? f.en : f.tr}</span>
            <input
              type="text"
              value={v[f.key] ?? ""}
              onChange={(e) => setV((s) => ({ ...s, [f.key]: e.target.value }))}
              className="rounded-md border border-line px-3 py-2 text-ink-950 outline-none focus:border-ink-900"
            />
          </label>
        ))}
      </div>
      <div className="mt-6 border-t border-line pt-6">
        {result ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-neutral-600">{lang === "en" ? "Generated URL" : "Oluşturulan URL"}</span>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-md bg-neutral-50 px-3 py-2 font-mono text-xs">{result}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="rounded-md border border-line px-3 py-2 text-xs font-medium text-ink-900 hover:bg-neutral-50"
              >
                {copied ? (lang === "en" ? "Copied" : "Kopyalandı") : lang === "en" ? "Copy" : "Kopyala"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">
            {lang === "en" ? "Enter a valid URL and at least a source to build the link." : "Bağlantı oluşturmak için geçerli bir URL ve en az bir kaynak girin."}
          </p>
        )}
      </div>
    </div>
  );
}
