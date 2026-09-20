/* LOCALE SWEEP - untranslated English prose on the PUBLIC TR ROUTES.

     node audit/locale-sweep.mjs [port|baseUrl]        # default: 4514

   Why this exists next to audit/measure-display.mjs: that gate already
   carries the English-prose detector, but it only ever looks at
   `[data-canvas-node-id]` elements on journey DETAIL pages. Everything
   else a TR reader sees - the library landing page's figures, the three
   surface listings' cards, the gallery - was outside every gate, which is
   how /tr/lab/journeys shipped six English category pills, three English
   story figures and four English showcase descriptions without a single
   check going red.

   So this one is deliberately DUMB and WIDE: fetch the rendered HTML of
   every public TR route, strip scripts and styles, and read every text
   node. No puppeteer - the pages are prerendered, so `fetch` sees exactly
   what a reader's first paint does, and the whole corpus sweeps in
   seconds rather than in the ~20 minutes a headless browser needs.

   THE DETECTOR is measure-display.mjs's, unchanged: English function
   words with no Turkish homograph, flagged at two or more DISTINCT hits
   in one text node. Two, not one, is what stops "In-app", a bare "Push"
   or a product name from reading as a sentence. */
import fs from "node:fs";
import { assertServerBuild } from "./assert-build.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const ARG = process.argv[2] ?? "4514";
const BASE = /^https?:\/\//.test(ARG) ? ARG.replace(/\/$/, "") : `http://localhost:${ARG}`;

/* Only a LOCAL server is claimed to be this checkout's build. Pointed at a
   deployed URL - which is how the 140-leak baseline for this gate was taken -
   there is no local build to compare against and the check would be false. */
const IS_LOCAL = !/^https?:\/\//.test(ARG);
if (IS_LOCAL) await assertServerBuild(ARG);

/* ---------------------------------------------------------------- detector */

/* Identical to audit/measure-display.mjs's EN_FUNCTION_WORDS - kept the same
   word list on purpose so the two gates cannot disagree about what English
   looks like. */
const EN_FUNCTION_WORDS =
  /\b(the|and|with|that|this|for|from|already|still|before|after|not|what|which|when|where|because|its|their|been|have|has|does|are|were)\b/gi;
const EN_PROSE_THRESHOLD = 2;

/* Shapes that are the same string on both routes BY CONSTRUCTION and carry no
   prose at all: a config/event id (`anonymous_intent.identity`), a journey or
   node id (`ACQ-01`, `c.identity`), a bare channel name. The site's own rule
   is that canonical identifiers are never translated - see
   canonical-view.ts's `externalTargetName` comment. A text node that is
   ENTIRELY one of these is skipped before the word count runs. */
const IDENTIFIER_SHAPE =
  /^(Push|SMS|WhatsApp|E-posta|Email|In-app|Uygulama içi|[a-z][a-z0-9_]*(\.[a-z0-9_]+)+|[A-Z]{2,5}-\d+|[a-z]+\.[a-z-]+)$/;

/* ------------------------------------------------------------- allowlist --
   Same shape and same discipline as CHANNEL_RULE_EXCEPTIONS in
   scripts/validate-public-scope.mjs: an exact string, and a written reason
   for why it is English on a Turkish page. Never a regex over prose, never a
   silent skip - an entry here is a claim someone can argue with.

   A string is matched after whitespace collapsing, exactly.

   IT IS EMPTY TODAY, and that is a result rather than an oversight: swept
   with the allowlist and the identifier rule BOTH disabled, the public TR
   routes produce the same zero. The English that legitimately stands on
   these pages - the five channel names, the Lab project's product names,
   the deliberate loanwords ("58 journey", "Push", "In-app", "onboarding") -
   is one or two words long and never reaches two DISTINCT function words,
   which is exactly the threshold's job. An entry is added here only when a
   real sweep flags a real string, with the reason it is English written
   beside it. */
const ALLOWED = {};

/* -------------------------------------------- the Info tab's English gap --
   ONE documented, data-derived exception, and the only bucket in this file
   that is reported without failing the run.

   src/lib/journey-tr-overrides.ts states its own scope in its header: the TR
   content pass covers "only the fields actually visible on the canvas +
   floating title card ... the Info tab's deeper technical fields -
   eligibility, suppressions, guardrails, reusableRule, distinctFrom - are not
   part of this pass and stay English even for a journey listed here". That is
   a real, known, PRE-EXISTING gap of its own - several thousand strings - and
   it is a translation backlog, not the wiring bug this gate was written for.

   Rather than allowlisting those strings by hand (they change whenever a
   journey is edited) or excluding a DOM region by selector (which would also
   hide a real leak that happened to land there), the out-of-scope fields are
   read straight out of production/canonical-dump.json. A flagged text node
   that IS one of those canonical strings is the known gap; anything else on
   the same page is a real leak and fails the run. The bucket therefore
   shrinks on its own the day someone translates those fields, and it can
   never swallow a string the TR pass was supposed to cover. */
const OUT_OF_TR_SCOPE_FIELDS = [
  "entity", "distinctFrom", "objective", "eligibility", "suppressions",
  "implementation", "measurement", "discovery", "guardrails", "reusableRule",
  "competition", "preemptedBy", "contact", "channelStrategy", "orchestration",
];

/* The other side of the same coin, and the reason this bucket cannot quietly
   grow into a blanket: a journey's `name`, `shortName` and `purpose` ARE in
   the TR pass (journey-tr-overrides.ts carries all three per journey), and
   they are exactly what the surface galleries render. Several of them also
   appear verbatim inside an `objective` or an `eligibility` sentence, so a
   plain substring test against the out-of-scope fields would have marked a
   real gallery leak "known". An in-scope string always wins. */
const { known: knownUntranslated, inScope } = (() => {
  const collect = (fields, dump) => {
    const strings = new Set();
    const walk = (v) => {
      if (typeof v === "string") { const s = v.replace(/\s+/g, " ").trim(); if (s.length >= 12) strings.add(s); return; }
      if (Array.isArray(v)) { v.forEach(walk); return; }
      if (v && typeof v === "object") { Object.values(v).forEach(walk); }
    };
    for (const j of dump) for (const f of fields) if (j[f] !== undefined) walk(j[f]);
    return strings;
  };
  let dump;
  try {
    const parsed = JSON.parse(fs.readFileSync(ROOT + "production/canonical-dump.json", "utf8"));
    dump = parsed.journeys ?? parsed;
  } catch {
    return { known: [], inScope: new Set() };
  }
  return {
    known: [...collect(OUT_OF_TR_SCOPE_FIELDS, dump)],
    inScope: collect(["name", "shortName", "purpose"], dump),
  };
})();

/** True when this flagged text is one of the canonical fields the TR content
    pass deliberately never covered - either verbatim, clamped, or composed
    with a separator into a longer line by the Info tile that renders it. */
function isKnownUntranslated(text) {
  if (text.length < 12) return false;
  if (inScope.has(text)) return false;
  for (const s of knownUntranslated) if (s === text || s.includes(text) || text.includes(s)) return true;
  return false;
}

/* ----------------------------------------------------------------- routes */

const STATIC_ROUTES = [
  "/tr",
  "/tr/lab",
  /* The journey library's landing page - the figures, the category pills and
     the showcase cards this gate was written for. */
  "/tr/lab/journeys",
  /* The three public surfaces (canonical-view.ts's SURFACE_PATH). Each is a
     gallery of journey cards: name, shortName, purpose, category title. */
  "/tr/lab/customer-journeys",
  "/tr/lab/lifecycle-states",
  "/tr/lab/runtime-mechanisms",
];

/* Journey and preset detail routes are DERIVED, never listed: the sitemap is
   built from JOURNEY_ROWS/PRESET_ROWS (src/app/sitemap.ts), so a journey that
   enters or leaves the public corpus enters or leaves this sweep with it. */
async function detailRoutes() {
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const paths = urls
    .map((u) => new URL(u).pathname)
    .filter((p) => /^\/tr\/lab\/journeys\/[^/]+$/.test(p));
  return [...new Set(paths)].sort();
}

/* ------------------------------------------------------------ extraction */

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'", nbsp: " ", "#x27": "'" };
const decode = (s) =>
  s.replace(/&(#x?[0-9a-fA-F]+|[a-z]+);/g, (m, e) => {
    if (ENTITIES[e]) return ENTITIES[e];
    if (e[0] === "#") return String.fromCodePoint(parseInt(e.slice(1).replace(/^x/i, ""), e[1] === "x" || e[1] === "X" ? 16 : 10));
    return m;
  });

const strip = (html) =>
  html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<template\b[\s\S]*?<\/template>/gi, " ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ");

const nodesOf = (fragment) =>
  fragment
    .split(/<[^>]*>/)
    .map((t) => decode(t).replace(/\s+/g, " ").trim())
    .filter(Boolean);

/* THE PRACTITIONER DISCLOSURE, the second half of the same documented gap.

   A journey detail page closes with one native <details> - JourneyDetailBody's
   "technical" disclosure, the practitioner write-up (trigger evidence, touch
   plan, timing basis, event registry text, outcomes). It is built by
   src/lib/practitioner-view.ts straight off the canonical journey and is not
   passed through localizedJourneyDetail at all, so it is English end to end on
   the TR route - the same pre-existing backlog the Info tiles are, and far
   outside a wiring fix.

   It is excluded BY REGION rather than by string because most of what it
   renders is node prose, and node prose is exactly what the TR pass DOES
   cover on the canvas - matching those strings anywhere on the page would
   blind this gate to a real canvas leak. The canvas is already gated, per
   node, by audit/measure-display.mjs; this region is the one part of a detail
   page neither gate claims. There is exactly one <details> on the page, so
   the region is unambiguous; a second one would show up as a jump in the
   reported count rather than as silence. */
const DISCLOSURE = /<details\b[\s\S]*?<\/details>/gi;

/** Every visible text node, in document order, split into the page proper and
    the practitioner disclosure. Scripts (JSON-LD, the RSC payload, Next's
    bootstrap), styles and comments go first - the RSC payload in particular
    is a serialized copy of every English string the server ever loaded and
    would flag every route. */
function textNodes(html) {
  const stripped = strip(html);
  const disclosures = stripped.match(DISCLOSURE) ?? [];
  return {
    page: nodesOf(stripped.replace(DISCLOSURE, " ")),
    disclosure: disclosures.flatMap(nodesOf),
  };
}

function leaksIn(html) {
  const out = [];
  const seen = new Set();
  const { page, disclosure } = textNodes(html);
  const consider = (text, region) => {
    if (seen.has(text)) return;
    seen.add(text);
    if (ALLOWED[text] !== undefined) return;
    if (IDENTIFIER_SHAPE.test(text)) return;
    const hits = [...new Set((text.match(EN_FUNCTION_WORDS) ?? []).map((w) => w.toLowerCase()))];
    if (hits.length < EN_PROSE_THRESHOLD) return;
    const known = region === "practitioner-disclosure" || isKnownUntranslated(text);
    out.push({ text, hits, known, ...(known ? { reason: region === "practitioner-disclosure" ? "practitioner disclosure" : "canonical field outside the TR pass" } : {}) });
  };
  for (const t of page) consider(t, "page");
  for (const t of disclosure) consider(t, "practitioner-disclosure");
  return out;
}

/* --------------------------------------------------------------- the run */

const routes = [...STATIC_ROUTES, ...(await detailRoutes())];
if (routes.length === STATIC_ROUTES.length) {
  console.error(`locale-sweep: no journey detail routes came back from ${BASE}/sitemap.xml - is the server up?`);
  process.exit(2);
}

const findings = [];
let fetched = 0;
for (const route of routes) {
  let html;
  try {
    const res = await fetch(`${BASE}${route}`);
    if (!res.ok) {
      findings.push({ route, text: `HTTP ${res.status}`, hits: [] });
      continue;
    }
    html = await res.text();
  } catch (e) {
    findings.push({ route, text: `fetch failed: ${String(e).slice(0, 120)}`, hits: [] });
    continue;
  }
  fetched++;
  for (const l of leaksIn(html)) findings.push({ route, ...l });
}

const leaks = findings.filter((f) => !f.known);
const known = findings.filter((f) => f.known);

for (const f of leaks) console.log(`${f.route} | ${f.text}`);

const routesHit = new Set(leaks.map((f) => f.route)).size;
console.log(`\nlocale-sweep: ${fetched}/${routes.length} TR routes fetched from ${BASE}`);
console.log(
  `known Info-tab gap (canonical fields outside the TR content pass, reported not failed): ` +
    `${known.length} text node(s) across ${new Set(known.map((f) => f.route)).size} route(s)`,
);
console.log(`leaks: ${leaks.length} text node(s) across ${routesHit} route(s)`);
fs.writeFileSync(
  ROOT + "audit/locale-sweep-report.json",
  JSON.stringify({ base: BASE, routes: routes.length, leaks, known }, null, 2) + "\n",
);

process.exit(leaks.length ? 1 : 0);
