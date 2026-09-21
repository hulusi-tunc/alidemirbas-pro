/* PRESET LOCALE CHECK - Turkish for every practitioner preset.

     node audit/preset-locale.mjs            # data only: the closed map vs the corpus
     node audit/preset-locale.mjs 4552       # ... plus the rendered TR and EN routes

   WHY THIS EXISTS BESIDE audit/locale-sweep.mjs.

   That gate reads every text node on every public TR route and flags one
   that carries two or more DISTINCT English function words. It is the right
   detector for prose and it is STRUCTURALLY BLIND to a preset: "Browse
   Abandonment" is two words and no function word at all, so a preset chip
   can never reach the threshold however wide the sweep gets. Lowering the
   threshold to one word is not the fix either - it would flag every channel
   name, every product name and every canonical id on the site. The preset's
   `applicableWhen` sentence IS long enough to trip the detector, but it is a
   `discovery` field, and locale-sweep reads the canonical dump's `discovery`
   into its "known Info-tab gap" bucket, which is reported and not failed.
   So both halves of a preset were invisible to the only gate that looks at
   TR pages. That is how ~twenty English chips (eight, counted) stood on
   /tr/lab/journeys with every gate green.

   SO THIS ONE DOES NOT SNIFF RENDERED TEXT FOR ENGLISH-LOOKING WORDS. It
   compares the page against the SOURCE DATA: the preset names and
   `applicableWhen` sentences in production/canonical-dump.json are the exact
   strings that must NOT appear on a TR route, and the entries in
   `PRESET_TR` (src/lib/journey-tr-overrides.ts) are the exact strings that
   MUST. A missing translation, an entry that merely copies the English, a
   new preset nobody translated and a call site that forgot to pass through
   the localizer are each a named failure rather than an absence of evidence.

   Exits non-zero on any failure. */
import fs from "node:fs";
import { assertServerBuild } from "./assert-build.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const ARG = process.argv[2];
const BASE = ARG ? (/^https?:\/\//.test(ARG) ? ARG.replace(/\/$/, "") : `http://localhost:${ARG}`) : null;

/* The file that owns TR journey content. Overridable ONLY so this check can
   be pointed at a pre-fix copy of that file and shown to fail there - a
   check that has never been seen to fail proves nothing. See
   audit/preset-localization-notes.md for the before/after run. */
const OVERRIDES_FILE = process.env.PRESET_TR_SOURCE ?? ROOT + "src/lib/journey-tr-overrides.ts";

const failures = [];
const fail = (code, where, msg) => failures.push(`[${code}] ${where}: ${msg}`);

/* ------------------------------------------------- the presets that ship */

/* Presets live on `discovery.presets` in the canonical data. Which ones reach
   a public page is the publishing boundary's rule, not this script's: a
   preset ships iff its parent journey ships, and `surface-assignment.json`
   carries that decision for every plain-Node script (surface + the explicit
   `excludedFromPublic` list - see CLAUDE.md, "Generated vs authored"). */
const dump = JSON.parse(fs.readFileSync(ROOT + "production/canonical-dump.json", "utf8"));
const assignment = JSON.parse(fs.readFileSync(ROOT + "production/surface-assignment.json", "utf8"));
const publicIds = new Set(
  assignment.journeys.filter((j) => j.surface !== "operational" && !j.excludedFromPublic).map((j) => j.id),
);

const presets = dump.journeys
  .filter((j) => publicIds.has(j.id))
  .flatMap((j) =>
    (j.discovery?.presets ?? []).map((p) => ({
      id: p.id,
      parent: j.id,
      name: p.name,
      applicableWhen: p.applicableWhen?.text ?? "",
      destination: p.destination ?? null,
    })),
  );

if (!presets.length) {
  console.error("preset-locale: no presets found in the public corpus - that is not a pass, it is a broken read.");
  process.exit(2);
}

/* ------------------------------------------------------- the closed map  */

/* src/lib/journey-tr-overrides.ts is TypeScript, so it is read the way
   scripts/validate-canonical.mjs reads src/canonical: slice the object
   literal out and evaluate it on its own. No build step, no type checker. */
function readPresetMap(file) {
  let src;
  try {
    src = fs.readFileSync(file, "utf8");
  } catch {
    fail("overrides_unreadable", file, "cannot read the file that owns TR journey content");
    return null;
  }
  const start = src.indexOf("const PRESET_TR");
  if (start < 0) return null;
  const open = src.indexOf("{", start);
  let depth = 0;
  let inStr = null;
  let end = -1;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === "\\") i++;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") inStr = c;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) { end = i + 1; break; }
  }
  if (end < 0) {
    fail("overrides_unparsed", file, "found `const PRESET_TR` but could not find the end of its object literal");
    return null;
  }
  return new Function(`return ${src.slice(open, end)};`)();
}

const tr = readPresetMap(OVERRIDES_FILE);
if (tr === null && !failures.length) {
  fail(
    "no_preset_map",
    OVERRIDES_FILE,
    `no \`const PRESET_TR\` in the one file that owns TR journey content, while ${presets.length} preset(s) reach a public page. ` +
      `Every preset name and applicableWhen sentence therefore renders in English on /tr/lab/journeys and on its own /tr route.`,
  );
}

/* Same word list and same threshold as audit/locale-sweep.mjs and
   audit/measure-display.mjs: used here only to catch a "translation" that is
   still an English sentence, never to decide what is on a page. */
const EN_FUNCTION_WORDS =
  /\b(the|and|with|that|this|for|from|already|still|before|after|not|what|which|when|where|because|its|their|been|have|has|does|are|were)\b/gi;
const looksEnglish = (s) => new Set((s.match(EN_FUNCTION_WORDS) ?? []).map((w) => w.toLowerCase())).size >= 2;

if (tr) {
  for (const p of presets) {
    const e = tr[p.id];
    if (!e) {
      fail("preset_untranslated", p.id, `no PRESET_TR entry (parent ${p.parent}, English name "${p.name}"). PRESET_TR is a closed map of every preset in the public corpus.`);
      continue;
    }
    for (const field of ["name", "applicableWhen"]) {
      const en = p[field];
      const got = e[field];
      if (typeof got !== "string" || !got.trim()) {
        fail("preset_field_missing", `${p.id}.${field}`, `PRESET_TR entry has no ${field}`);
        continue;
      }
      if (got.trim() === en.trim()) {
        fail("preset_field_english", `${p.id}.${field}`, `the Turkish is character-for-character the English ("${en.slice(0, 60)}...")`);
        continue;
      }
      if (looksEnglish(got)) {
        fail("preset_field_english_prose", `${p.id}.${field}`, `the translation still reads as English prose: "${got.slice(0, 80)}"`);
      }
    }
    // A destination is rendered beside the preset banner ("Hedef: <destination>").
    if (p.destination && (typeof e.destination !== "string" || !e.destination.trim())) {
      fail("preset_destination_untranslated", p.id, `canonical destination "${p.destination}" has no Turkish in PRESET_TR`);
    }
  }
  for (const id of Object.keys(tr)) {
    if (!presets.some((p) => p.id === id)) {
      fail("preset_orphan_entry", id, "PRESET_TR carries a preset that no public journey declares - the map is closed in both directions");
    }
  }
}

/* --------------------------------------------------------- the rendering */

/* The data half above proves the translations EXIST. It cannot prove they
   REACH the page - a call site that renders PRESET_ROWS without passing them
   through the localizer would leave the map perfect and the chip English.
   That is exactly the bug class here, so when a port is given every route a
   preset surfaces on is fetched and checked against both strings. */
const strip = (html) =>
  html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]*>/g, " ");

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'", nbsp: " ", "#x27": "'" };
const decode = (s) =>
  s.replace(/&(#x?[0-9a-fA-F]+|[a-z]+);/g, (m, e) => {
    if (ENTITIES[e]) return ENTITIES[e];
    if (e[0] === "#") return String.fromCodePoint(parseInt(e.slice(1).replace(/^x/i, ""), e[1] === "x" || e[1] === "X" ? 16 : 10));
    return m;
  });

const visible = (html) => decode(strip(html)).replace(/\s+/g, " ");

let routesFetched = 0;
async function text(route) {
  const res = await fetch(`${BASE}${route}`);
  if (!res.ok) {
    fail("route_not_ok", route, `HTTP ${res.status}`);
    return null;
  }
  routesFetched++;
  return visible(await res.text());
}

if (BASE) {
  if (!/^https?:\/\//.test(ARG)) await assertServerBuild(ARG);

  /* (a) THE SERVER-RENDERED TEXT. /tr/lab/journeys carries the chip row
     (JourneyLibraryPage) and every /tr/lab/journeys/<preset-id> carries the
     preset's own title card, its "preset of" line and the practitioner
     banner with its rule sentence. All of it is in the first paint, so a
     plain fetch sees exactly what a reader sees. */
  for (const route of ["/tr/lab/journeys", ...presets.map((p) => `/tr/lab/journeys/${p.id}`)]) {
    const body = await text(route);
    if (body === null) continue;
    const isChips = route === "/tr/lab/journeys";
    for (const p of presets) {
      const want = tr?.[p.id];
      const mine = isChips || route.endsWith(`/${p.id}`);
      if (body.includes(p.name)) fail("en_name_on_tr_route", route, `English preset name "${p.name}" is on the page`);
      if (!mine) continue;
      if (p.applicableWhen && body.includes(p.applicableWhen))
        fail("en_rule_on_tr_route", route, `English applicableWhen is on the page: "${p.applicableWhen.slice(0, 70)}..."`);
      if (want?.name && !body.includes(want.name)) fail("tr_name_missing", route, `Turkish preset name "${want.name}" (${p.id}) is not on the page`);
      if (!isChips && want?.applicableWhen && !body.includes(want.applicableWhen))
        fail("tr_rule_missing", route, `Turkish applicableWhen is not on the page: "${want.applicableWhen.slice(0, 70)}..."`);
    }
  }

  /* (b) THE GALLERY'S PROPS. The customer-journeys gallery is a client
     component behind `useSearchParams`, so its preset cards are NOT in the
     prerendered HTML - only its props are, serialized into the RSC payload,
     and the cards are built from them on hydration. Reading the payload is
     the only way to check that surface without a browser, and it is exactly
     what would catch a call site handing the gallery PRESET_ROWS straight
     through. The pattern is `PresetRow`'s own field order (`id`, `slug`,
     `name`), so it cannot match the raw canonical preset nested inside it -
     that one stays canonical English by design, and nothing renders it. */
  const propName = (payload, id) =>
    payload.match(new RegExp(`"id":"${id}","slug":"${id}","name":"([^"]+)"`))?.[1] ?? null;
  for (const [route, side] of [["/tr/lab/customer-journeys", "tr"], ["/lab/customer-journeys", "en"]]) {
    const res = await fetch(`${BASE}${route}`);
    if (!res.ok) {
      fail("route_not_ok", route, `HTTP ${res.status}`);
      continue;
    }
    routesFetched++;
    const payload = (await res.text()).replace(/\\"/g, '"');
    for (const p of presets) {
      const got = propName(payload, p.id);
      const expected = side === "tr" ? tr?.[p.id]?.name : p.name;
      if (got === null) {
        fail("preset_prop_missing", route, `the gallery is never given preset "${p.id}"`);
        continue;
      }
      if (expected && got !== expected)
        fail(
          side === "tr" ? "en_name_in_tr_gallery_props" : "tr_name_in_en_gallery_props",
          route,
          `preset "${p.id}" reaches the gallery as "${got}", expected "${expected}"`,
        );
    }
  }

  /* (c) THE OTHER DIRECTION, and the reason this is not a one-sided check:
     the EN route must still carry the canonical English, exactly. A
     localizer that leaked into `en` would be just as wrong. */
  for (const route of ["/lab/journeys", ...presets.map((p) => `/lab/journeys/${p.id}`)]) {
    const body = await text(route);
    if (body === null) continue;
    const isChips = route === "/lab/journeys";
    for (const p of presets) {
      const mine = isChips || route.endsWith(`/${p.id}`);
      const trName = tr?.[p.id]?.name;
      if (trName && body.includes(trName)) fail("tr_name_on_en_route", route, `Turkish preset name "${trName}" is on the EN page`);
      if (!mine) continue;
      if (!body.includes(p.name)) fail("en_name_missing_on_en_route", route, `English preset name "${p.name}" is NOT on the EN page`);
      if (!isChips && p.applicableWhen && !body.includes(p.applicableWhen))
        fail("en_rule_missing_on_en_route", route, "English applicableWhen is NOT on the EN page");
    }
  }
}

/* --------------------------------------------------------------- the run */

for (const f of failures) console.log(f);

console.log(
  `\npreset-locale: ${presets.length} preset(s) in the public corpus, ` +
    `${tr ? Object.keys(tr).length : 0} translated` +
    (BASE ? `, ${routesFetched} route(s) fetched from ${BASE}` : ", data only (pass a port to check the render)"),
);
console.log(`failures: ${failures.length}`);

fs.writeFileSync(
  ROOT + "audit/preset-locale-report.json",
  JSON.stringify({ base: BASE, presets: presets.map((p) => p.id), translated: tr ? Object.keys(tr) : [], failures }, null, 2) + "\n",
);

process.exit(failures.length ? 1 : 0);
