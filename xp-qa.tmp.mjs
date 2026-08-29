/* Experiment QA battery — measures one page, writes JSON. Extended with
   horizontal-space utilization, section-height distribution, and repeated
   section-structure frequency. */
import puppeteer from "puppeteer-core";
import fs from "fs";
const url = process.argv[2], tag = process.argv[3];
const b = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const pg = await b.newPage();
await pg.setViewport({ width: 1440, height: 1000 });
await pg.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
const H0 = await pg.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < H0; y += 400) { await pg.evaluate(v => window.scrollTo(0, v), y); await new Promise(r=>setTimeout(r,80)); }
await pg.evaluate(() => window.scrollTo(0, 0)); await new Promise(r=>setTimeout(r,500));
const m = await pg.evaluate(() => {
  const W = 1440;
  const boxes = [];
  const walk = (el) => {
    for (const c of el.children) walk(c);
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    const intrinsic = ["IMG","SVG","CANVAS","VIDEO","BUTTON","INPUT","SELECT","TEXTAREA","A"].includes(el.tagName) && el.children.length === 0;
    if (!hasText && !intrinsic) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) return;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return;
    boxes.push({ x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height });
  };
  walk(document.body);
  const H = document.body.scrollHeight;
  const BAND = 100, nb = Math.ceil(H / BAND);
  const bands = Array.from({ length: nb }, () => ({ any: false, maxRight: 0, minLeft: W }));
  for (const b0 of boxes) {
    const b1 = Math.max(0, Math.floor(b0.y / BAND)), b2 = Math.min(nb - 1, Math.floor((b0.y + b0.h) / BAND));
    for (let i = b1; i <= b2; i++) { bands[i].any = true;
      bands[i].maxRight = Math.max(bands[i].maxRight, b0.x + b0.w);
      bands[i].minLeft = Math.min(bands[i].minLeft, b0.x); }
  }
  const main = document.querySelector("main") ?? document.body;
  const mr = main.getBoundingClientRect();
  const mTop = Math.floor((mr.top + scrollY) / BAND), mBot = Math.ceil((mr.bottom + scrollY) / BAND);
  const mb = bands.slice(Math.max(0, mTop), Math.min(nb, mBot));
  const withC = mb.filter(x => x.any);
  const spans = withC.map(x => (x.maxRight - x.minLeft) / W);
  const meanSpan = spans.reduce((a,c)=>a+c,0) / (spans.length || 1);
  const rights = withC.map(x => x.maxRight);
  const rmean = rights.reduce((a,c)=>a+c,0)/(rights.length||1);
  const rsd = Math.sqrt(rights.reduce((a,c)=>a+(c-rmean)**2,0)/(rights.length||1));
  // sections
  const secs = [...main.querySelectorAll("section")];
  const seams = [];
  for (let i = 0; i + 1 < secs.length; i++) {
    const a = secs[i].getBoundingClientRect(), c = secs[i+1].getBoundingClientRect();
    const bgA = getComputedStyle(secs[i]).backgroundColor, bgB = getComputedStyle(secs[i+1]).backgroundColor;
    const padA = parseFloat(getComputedStyle(secs[i]).paddingBottom), padB = parseFloat(getComputedStyle(secs[i+1]).paddingTop);
    seams.push({ gap: Math.round(padA + padB + Math.max(0, c.top - a.bottom)), bgChange: bgA !== bgB });
  }
  const heights = secs.map(s => Math.round(s.getBoundingClientRect().height));
  // structure signature: tag sequence of direct children (depth 2)
  const sig = (el) => [...el.children].map(c => c.tagName + (c.children.length ? "(" + [...c.children].map(g=>g.tagName).join(",") + ")" : "")).join("|");
  const sigs = secs.map(sig);
  const dupSecs = sigs.length - new Set(sigs).size;
  // text measure violations: text blocks wider than ~75ch approx (75 * 8.2px ≈ 615... use ch via canvas? approximate with 720px for 16px font)
  let measureViol = 0;
  for (const el of main.querySelectorAll("p")) {
    const r = el.getBoundingClientRect();
    const fs2 = parseFloat(getComputedStyle(el).fontSize);
    if (r.width > 46 * fs2 * 0.62 * 1.35) measureViol++; // ≈ >62ch
  }
  return {
    pageHeight: H,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    sections: secs.length,
    absenceRatio: +((mb.length - withC.length) / (mb.length || 1)).toFixed(3),
    horizontalUtilization: +meanSpan.toFixed(3),
    silhouetteCV: +(rsd / (rmean || 1)).toFixed(3),
    paddingOnlySeams: seams.filter(s => !s.bgChange && s.gap > 220).length,
    seams: seams.map(s => `${s.gap}px${s.bgChange ? "+bg" : " SAME"}`),
    sectionHeights: heights,
    sectionHeightCV: +( (arr=>{const m2=arr.reduce((a,c)=>a+c,0)/arr.length;return Math.sqrt(arr.reduce((a,c)=>a+(c-m2)**2,0)/arr.length)/m2;})(heights.length?heights:[1]) ).toFixed(3),
    repeatedSectionStructures: dupSecs,
    textMeasureViolations: measureViol,
  };
});
console.log(JSON.stringify({ tag, ...m }));
fs.writeFileSync(`/tmp/xp-${tag}.json`, JSON.stringify(m, null, 1));
await b.close();
