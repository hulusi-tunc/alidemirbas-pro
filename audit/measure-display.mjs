/* Measures the REAL display graph per journey by rendering the canvas, not by
   re-implementing buildDisplayGraph (which would drift). Usage:
     node audit/measure-display.mjs <before|after> [port]
   Writes audit/display-<phase>.json and folds the counts into the manifest. */
import fs from "node:fs";
import puppeteer from "puppeteer-core";

const ROOT = new URL("..", import.meta.url).pathname;
const phase = process.argv[2] === "after" ? "after" : "before";
const PORT = process.argv[3] ?? "4511";
const BASE = `http://localhost:${PORT}`;

const manifest = JSON.parse(fs.readFileSync(ROOT + "audit/manifest.json", "utf8"));
const browser = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox", "--disable-gpu"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 1 });

const EN_CHROME = ["Trigger", "Decision", "Wait", "Exit", "Handoff", "Outcome", "Internal", "Human", "Channel selection", "Primary", "Fallback", "Entry"];
const TR_CHROME = ["Tetikleyici", "Karar", "Bekleme", "Çıkış", "Devir", "Sonuç", "İç işlem", "İnsan", "Kanal seçimi", "Öncelikli", "Yedek", "Giriş"];
/* Locale lint allowlist: channel/product names and code identifiers are the
   same word on both routes by design (glossary), so a bare English-token
   check would flag them. */
const ALLOW = /^(Push|SMS|WhatsApp|E-posta|Email|In-app|Uygulama içi|[a-z_]+\.[a-z_.]+|[A-Z]{2,4}-\d+|[a-z_]+)$/;

const results = [];
let i = 0;
for (const j of manifest.journeys) {
  i++;
  const row = { journey_id: j.journey_id, slug: j.slug, locales: {} };
  for (const lang of ["en", "tr"]) {
    const url = `${BASE}${lang === "en" ? "" : "/tr"}/lab/journeys/${j.slug}#canvas`;
    try {
      await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
      await new Promise((r) => setTimeout(r, 250));
      const data = await page.evaluate(() => {
        /* The detail page mounts the canvas TWICE (the Info tab's preview and
           the Canvas tab), so every node appears in the DOM twice. Dedupe on
           `layoutId` ALONE: it is unique per display node by construction
           (a shared terminal's per-parent instance carries its own
           "x.converted@c.state" suffix), whereas an earlier `layoutId|text`
           key double-counted any card whose two mounts clamp their text
           differently - ACC-261 measured 21 against 13 real nodes. Keep the
           longer of the two texts, which is the unclamped one. */
        const byLayout = new Map();
        for (const el of document.querySelectorAll("[data-canvas-node-id]")) {
          const layoutId = el.getAttribute("data-canvas-node-id");
          const kind = el.getAttribute("data-canvas-node-kind");
          const text = (el.querySelector("button")?.innerText || "").replace(/\s+/g, " ").trim();
          const prev = byLayout.get(layoutId);
          if (!prev || text.length > prev.text.length) byLayout.set(layoutId, { layoutId, kind, text });
        }
        const nodes = [...byLayout.values()];
        const edges = [];
        const eseen = new Set();
        for (const el of document.querySelectorAll("[data-canvas-edge-from]")) {
          const k = el.getAttribute("data-canvas-edge-from") + ">" + el.getAttribute("data-canvas-edge-to") + "|" + (el.getAttribute("data-canvas-edge-label") || "");
          if (eseen.has(k)) continue;
          eseen.add(k);
          edges.push({ from: el.getAttribute("data-canvas-edge-from"), to: el.getAttribute("data-canvas-edge-to"), label: el.getAttribute("data-canvas-edge-label") || "" });
        }
        return { nodes, edges };
      });
      const canonicalIds = new Set(data.nodes.map((n) => n.layoutId.split("@")[0]));
      const longCards = data.nodes.filter((n) => n.text.length > 110).map((n) => ({ id: n.layoutId, len: n.text.length }));
      const longLabels = data.edges.filter((e) => e.label && e.label.length > 24).map((e) => ({ label: e.label, len: e.label.length }));
      const blocked = lang === "tr" ? EN_CHROME : TR_CHROME;
      const localeLeaks = [];
      for (const n of data.nodes) {
        for (const w of blocked) {
          if (new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(n.text) && !ALLOW.test(w)) {
            localeLeaks.push({ id: n.layoutId, word: w });
            break;
          }
        }
      }
      row.locales[lang] = {
        display_nodes: data.nodes.length,
        distinct_canonical_nodes: canonicalIds.size,
        terminal_instances: data.nodes.length - canonicalIds.size,
        edges: data.edges.length,
        internal_cards: data.nodes.filter((n) => /^(Internal|İç işlem)\s*·/.test(n.text)).length,
        long_cards: longCards,
        long_branch_labels: longLabels,
        locale_leaks: localeLeaks,
      };
    } catch (e) {
      row.locales[lang] = { error: String(e).slice(0, 160) };
    }
  }
  results.push(row);
  if (i % 10 === 0) console.log(`... ${i}/${manifest.journeys.length}`);
}
await browser.close();

fs.writeFileSync(ROOT + `audit/display-${phase}.json`, JSON.stringify(results, null, 2) + "\n");

const byId = new Map(results.map((r) => [r.journey_id, r]));
for (const j of manifest.journeys) {
  const r = byId.get(j.journey_id);
  const n = r?.locales?.en?.display_nodes ?? null;
  if (phase === "before") j.display_node_count_before = n;
  else j.display_node_count_after = n;
}
fs.writeFileSync(ROOT + "audit/manifest.json", JSON.stringify(manifest, null, 2) + "\n");

const errs = results.filter((r) => r.locales.en?.error || r.locales.tr?.error);
const leaks = results.filter((r) => (r.locales.en?.locale_leaks?.length ?? 0) + (r.locales.tr?.locale_leaks?.length ?? 0) > 0);
const longs = results.filter((r) => (r.locales.en?.long_cards?.length ?? 0) + (r.locales.tr?.long_cards?.length ?? 0) > 0);
const internals = results.filter((r) => (r.locales.en?.internal_cards ?? 0) > 0);
console.log(`\n[${phase}] measured ${results.length} journeys`);
console.log(`render errors: ${errs.length}${errs.length ? " -> " + errs.map((e) => e.slug).join(",") : ""}`);
console.log(`locale leaks: ${leaks.length} journeys`);
console.log(`long cards (>110 chars): ${longs.length} journeys`);
console.log(`journeys still showing plain Internal cards: ${internals.length}`);
const counts = results.map((r) => r.locales.en?.display_nodes ?? 0);
console.log(`display nodes: min ${Math.min(...counts)} / median ${counts.slice().sort((a, b) => a - b)[Math.floor(counts.length / 2)]} / max ${Math.max(...counts)}`);
