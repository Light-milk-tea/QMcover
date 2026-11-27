// 首页缩略图：取 #/__thumb/<id> 的 html-to-image 导出，转 960×540 WebP，
// 同时写 public/thumbs/<id>.webp 和 src/assets/thumbs/<id>-shot.webp。
// node scripts/qa/thumb.mjs <模板id...> [--min-images 1]
import { readFileSync } from "node:fs";
import { BASE, launch, parseArgs, waitCanvasReady, writeDataUrl } from "./common.mjs";

const args = parseArgs();
const ids = args._;
if (!ids.length) {
  console.log("用法：node scripts/qa/thumb.mjs <模板id...> [--min-images 1]");
  process.exit(1);
}
const registry = readFileSync("src/lib/thumbs.ts", "utf8");
const { browser, page } = await launch();
for (const id of ids) {
  await page.goto(`${BASE}/#/__thumb/${id}`);
  await waitCanvasReady(page, "[data-thumb-capture]", Number(args["min-images"] ?? 1));
  await page.waitForFunction(() => Boolean(window.__QM_THUMB), null, { timeout: 90000 });
  const webp = await page.evaluate(async () => {
    const src = window.__QM_THUMB;
    if (src.startsWith("error:")) return src;
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = Object.assign(document.createElement("canvas"), { width: 960, height: 540 });
    c.getContext("2d").drawImage(img, 0, 0, 960, 540);
    return c.toDataURL("image/webp", 0.8);
  });
  if (webp.startsWith("error:")) throw new Error(`${id} 导出失败：${webp}`);
  writeDataUrl(`public/thumbs/${id}.webp`, webp);
  writeDataUrl(`src/assets/thumbs/${id}-shot.webp`, webp);
  const note = registry.includes(`${id}-shot.webp`) ? "" : "（src/lib/thumbs.ts 还没 import，记得登记）";
  console.log(`${id} → public/thumbs/${id}.webp、src/assets/thumbs/${id}-shot.webp${note}`);
}
await browser.close();
