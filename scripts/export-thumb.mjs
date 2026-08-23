import { chromium } from "playwright-core";
import sharp from "sharp";
import { resolve } from "node:path";

const id = process.argv[2] || "lowspec";
const dest = resolve("public/thumbs", `${id}.webp`);

const browser = await chromium.launch({
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
await page.goto(`http://localhost:5173/?t=${Date.now()}#/__thumb/${id}`, {
  waitUntil: "networkidle",
  timeout: 45000,
});
await page.waitForFunction(
  () => {
    const imgs = [...document.images];
    return imgs.length >= 1 && imgs.every((img) => img.complete && img.naturalWidth > 0);
  },
  null,
  { timeout: 45000 },
);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);
const el = page.locator("[data-thumb-capture]");
await el.waitFor({ state: "visible", timeout: 15000 });
const buf = await el.screenshot({ type: "jpeg", quality: 90 });
await sharp(buf).webp({ quality: 82 }).toFile(dest);
await browser.close();
console.log("wrote", dest);
