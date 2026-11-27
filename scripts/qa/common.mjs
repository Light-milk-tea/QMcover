import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname } from "node:path";
import { chromium } from "playwright";

/** 开发服务器地址；先 `npm run dev`。 */
export const BASE = process.env.QM_BASE ?? "http://localhost:5173";

/** 解析 `--key value` / `--flag`，其余按顺序放进 `_`。 */
export function parseArgs(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      out._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

export function ensureDir(file) {
  mkdirSync(dirname(file), { recursive: true });
}

export function writeDataUrl(file, dataUrl) {
  ensureDir(file);
  writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));
}

export function mimeFor(file) {
  const ext = extname(file).toLowerCase();
  return ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
}

export function fileToDataUrl(file) {
  return `data:${mimeFor(file)};base64,${readFileSync(file).toString("base64")}`;
}

/**
 * 两张图缩到同尺寸后的平均通道差（0–255）和差值超过 32 的像素占比。
 * 在临时页里算：若在应用页上 setContent，之后 goto 别的 `#/t/<id>` 只换 hash，不会重新挂载应用。
 */
export async function imageDiff(page, a, b) {
  const scratch = await page.context().newPage();
  try {
    return await diffIn(scratch, a, b);
  } finally {
    await scratch.close();
  }
}

async function diffIn(page, a, b) {
  return page.evaluate(
    async ([a, b]) => {
      const load = (src) => new Promise((resolve, reject) => Object.assign(new Image(), { onload() { resolve(this); }, onerror: reject, src }));
      const [ia, ib] = await Promise.all([load(a), load(b)]);
      const w = 960;
      const h = 540;
      const read = (img) => {
        const c = Object.assign(document.createElement("canvas"), { width: w, height: h });
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        return ctx.getImageData(0, 0, w, h).data;
      };
      const da = read(ia);
      const db = read(ib);
      let sum = 0;
      let over = 0;
      for (let i = 0; i < da.length; i += 4) {
        const d = (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2])) / 3;
        sum += d;
        if (d > 32) over += 1;
      }
      const n = da.length / 4;
      return { mean: +(sum / n).toFixed(2), over32: +((over / n) * 100).toFixed(2) };
    },
    [a, b],
  );
}

export async function launch(options = {}) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, ...options });
  const page = await context.newPage();
  page.on("pageerror", (e) => console.log("pageerror:", e.message));
  page.on("console", (m) => m.type() === "error" && console.log("console:", m.text().slice(0, 200)));
  return { browser, page };
}

/**
 * 等字体和画布里的图片都解码完。`img.complete` 只说明下载完，异步解码的图此时可能还没画；
 * 也不能让空列表的 `every` 冒充就绪，所以要求至少 `minImages` 张图。
 */
export async function waitCanvasReady(page, selector, minImages = 1) {
  const canvas = page.locator(selector).first();
  await canvas.waitFor({ state: "visible", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(
    ({ selector, minImages }) => (document.querySelector(selector)?.querySelectorAll("img").length ?? 0) >= minImages,
    { selector, minImages },
    { timeout: 60000 },
  );
  await canvas.evaluate(async (el) => {
    const images = [...el.querySelectorAll("img")];
    await Promise.all(images.map((img) => img.decode()));
    if (images.some((img) => img.naturalWidth === 0)) throw new Error("画布图片未成功解码");
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  return canvas;
}

/** 在空白页的 canvas 里合成图片，不额外装图像库。`draw` 在页面里执行，拿到已解码的 `imgs`。 */
export async function composeInBrowser(page, sources, draw, args, mime) {
  await page.setContent("<!doctype html><body style='margin:0'></body>");
  return page.evaluate(
    async ({ sources, drawSrc, args, mime }) => {
      const imgs = await Promise.all(
        sources.map(
          (src) =>
            new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = () => reject(new Error("图片读不出"));
              img.src = src;
            }),
        ),
      );
      const fn = new Function(`return (${drawSrc})`)();
      const canvas = fn(imgs, args);
      return canvas.toDataURL(mime, 0.9);
    },
    { sources, drawSrc: draw.toString(), args, mime },
  );
}
