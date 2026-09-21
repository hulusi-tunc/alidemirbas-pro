/* Phase 16 canvas hygiene, checked against a REAL render of every public
   journey in both locales - not against the source, because what matters is
   what a reader actually sees on a card.

     node audit/canvas-hygiene.mjs [port]

   The rule being enforced: the canvas answers what happened, how long, what
   is being decided, what is being sent and where ownership goes. It does not
   show canonical config keys, database fields, raw event syntax, branch
   counts, sequence numbers or namespaced ids. Those all stay one click away
   in the detail panel, which this script deliberately does not read.

   Checks, per card:
     H1  no canonical config key   (`bounded_education.window`)
     H2  no sequence number        (`Internal · 03`, `Message · 02`)
     H3  no namespaced external id (`external:sales-assignment`)
     H4  every message card says something about the message
*/
import fs from "node:fs";
import puppeteer from "puppeteer-core";
import { assertServerBuild } from "./assert-build.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const PORT = process.argv[2] ?? "4511";
/* Refuse to report numbers measured against a build we did not make. */
await assertServerBuild(PORT);
const manifest = JSON.parse(fs.readFileSync(ROOT + "audit/manifest.json", "utf8"));

const browser = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox", "--disable-gpu"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1200 });

const findings = [];
let cards = 0;
let messageCards = 0;
let i = 0;

for (const m of manifest.journeys) {
  i++;
  for (const lang of ["en", "tr"]) {
    const url = `http://localhost:${PORT}${lang === "en" ? "" : "/tr"}/lab/journeys/${m.slug}#canvas`;
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 150));
    const drawn = await page.evaluate(() => {
      const byLayout = new Map();
      for (const el of document.querySelectorAll("[data-canvas-node-id]")) {
        const layoutId = el.getAttribute("data-canvas-node-id");
        const kind = el.getAttribute("data-canvas-node-kind");
        const text = (el.querySelector("button")?.innerText || "").replace(/\s+/g, " ").trim();
        const prev = byLayout.get(layoutId);
        if (!prev || text.length > prev.text.length) byLayout.set(layoutId, { layoutId, kind, text });
      }
      return [...byLayout.values()];
    });

    for (const c of drawn) {
      cards++;
      const add = (check, detail) => findings.push({ check, journey: m.journey_id, lang, node: c.layoutId, kind: c.kind, detail });

      // H1 - a dotted lowercase identifier is a config key, never prose.
      const key = /\b[a-z][a-z0-9_]*\.[a-z][a-z0-9_]+\b/.exec(c.text);
      if (key) add("H1_CONFIG_KEY", key[0]);

      // H2 - "<kind> · 03". The separator plus digits is the shape; a real
      // sentence does not end a clause with a bare two-digit number.
      const seq = /·\s*\d{1,2}\b/.exec(c.text);
      if (seq) add("H2_SEQUENCE_NUMBER", c.text.slice(0, 40));

      // H3 - a namespaced canonical id reaching a card.
      if (/\bexternal:/.test(c.text)) add("H3_NAMESPACED_ID", c.text.slice(0, 40));

      // H4 - a message card must say something about the message. The kind
      // attribute is `action`; a message card is one whose text carries a
      // channel pill, so this is checked on the rendered text length past
      // the title rather than on canonical execution. A router card (kind
      // label "Channel selection" / "Kanal seçimi", JourneyCanvasNodes.tsx's
      // RouterCard) also carries channel pills but is not a message by
      // design - it draws the channel DECISION, never a body of its own,
      // ahead of the send it feeds (audit/refactor/_ARBITRATION.md §5,
      // 2026-09-21: the library's seven genuine channel-resolving routers
      // became visible on the canvas rather than staying folded into the
      // send). Excluded here on the same rendered-text signal rather than a
      // journey or node id, so it stays correct if the corpus grows more.
      if (c.kind === "action") {
        const isRouter = /(Channel selection|Kanal seçimi)/.test(c.text);
        const isMessage = !isRouter && /(Email|SMS|Push|WhatsApp|In-app|E-posta|Uygulama içi)/.test(c.text);
        if (isMessage) {
          messageCards++;
          // title + preview + pills; a card with no preview is title + pills
          // only, which is 2 lines. Require a line that is a real sentence.
          const lines = c.text.split(/\n|(?<=[a-zçğıöşü])\s(?=[A-ZÇĞİÖŞÜ])/).map((s) => s.trim()).filter(Boolean);
          const hasProse = lines.some((l) => l.length >= 25 && /\s/.test(l));
          if (!hasProse) add("H4_MESSAGE_CARD_SILENT", c.text.slice(0, 60));
        }
      }
    }
  }
  if (i % 15 === 0) console.log(`... ${i}/${manifest.journeys.length}`);
}
await browser.close();

const by = (k) => findings.filter((f) => f.check === k);
const report = { generated: new Date().toISOString(), cards, messageCards, findings };
fs.writeFileSync(ROOT + "audit/canvas-hygiene-report.json", JSON.stringify(report, null, 2) + "\n");

console.log(`\n=== CANVAS HYGIENE ===`);
console.log(`${cards} cards inspected across ${manifest.journeys.length} journeys x2 locales (${messageCards} message cards)`);
for (const k of ["H1_CONFIG_KEY", "H2_SEQUENCE_NUMBER", "H3_NAMESPACED_ID", "H4_MESSAGE_CARD_SILENT"]) {
  const hits = by(k);
  console.log(`${k}: ${hits.length}`);
  for (const f of hits.slice(0, 5)) console.log(`   ${f.journey} [${f.lang}] ${f.node} — ${f.detail}`);
  if (hits.length > 5) console.log(`   ... and ${hits.length - 5} more`);
}
console.log(findings.length === 0 ? "\nRESULT: PASS" : "\nRESULT: FAIL");
process.exit(findings.length === 0 ? 0 : 1);
