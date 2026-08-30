import puppeteer from "puppeteer-core";
import fs from "fs";
const map = Object.fromEntries(fs.readFileSync("/tmp/xp-mapping.txt","utf8").trim().split("\n").map(l => l.split("=")));
const port = process.argv[2];
const b = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const wait = ms => new Promise(r => setTimeout(r, ms));
for (const label of ["X","Y"]) {
  const route = map[label];
  const pg = await b.newPage();
  for (const [w, tag] of [[1440,"desktop"],[834,"tablet"],[390,"mobile"]]) {
    await pg.setViewport({ width: w, height: 1000 });
    await pg.goto(`http://127.0.0.1:${port}/${route}`, { waitUntil: "networkidle2", timeout: 60000 });
    const h = await pg.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 400) { await pg.evaluate(v => window.scrollTo(0, v), y); await wait(70); }
    await pg.evaluate(() => window.scrollTo(0, 0)); await wait(450);
    if (tag === "desktop") {
      // full page in slices
      const stops = []; for (let y = 0; y < h; y += 950) stops.push(y);
      for (const [i, y] of stops.entries()) {
        await pg.evaluate(v => window.scrollTo(0, v), y); await wait(300);
        await pg.screenshot({ path: `/tmp/page${label}-desktop-${String(i).padStart(2,"0")}.png` });
      }
    } else {
      await pg.screenshot({ path: `/tmp/page${label}-${tag}-top.png` });
      await pg.evaluate(v => window.scrollTo(0, Math.floor(v)), Math.floor(h*0.45)); await wait(300);
      await pg.screenshot({ path: `/tmp/page${label}-${tag}-mid.png` });
    }
  }
  await pg.close();
}
// also run QA per label so even metrics stay blind
console.log("shots done");
await b.close();
