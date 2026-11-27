// 默认稿截图 + html-to-image 导出，并比较两者是否一致。
// node scripts/qa/shot.mjs <模板id> <轮次标签> [--out tmp-compare/<id>] [--min-images 1]
// 产出 <out>/<标签>_chromium.png（1920×1080 Chromium 截图）和 <标签>_export.jpg（960 宽导出 JPEG）。
import { BASE, imageDiff, launch, parseArgs, waitCanvasReady, writeDataUrl } from "./common.mjs";

const args = parseArgs();
const [id, tag] = args._;
if (!id || !tag) {
  console.log("用法：node scripts/qa/shot.mjs <模板id> <轮次标签> [--out 目录] [--min-images 1]");
  process.exit(1);
}
const out = args.out ?? `tmp-compare/${id}`;
const minImages = Number(args["min-images"] ?? 1);

const { browser, page } = await launch({ deviceScaleFactor: 2 });
await page.goto(`${BASE}/#/__thumb/${id}`);
const canvas = await waitCanvasReady(page, "[data-thumb-capture]", minImages);
await page.waitForFunction(() => Boolean(window.__QM_THUMB), null, { timeout: 90000 });
const shotPath = `${out}/${tag}_chromium.png`;
const exportPath = `${out}/${tag}_export.jpg`;
const shot = await canvas.screenshot();
writeDataUrl(shotPath, `data:image/png;base64,${shot.toString("base64")}`);
const exported = await page.evaluate(() => window.__QM_THUMB);
if (exported.startsWith("error:")) throw new Error(`导出失败：${exported}`);
writeDataUrl(exportPath, exported);
const diff = await imageDiff(page, `data:image/png;base64,${shot.toString("base64")}`, exported);
console.log(`${shotPath}\n${exportPath}\n截图与导出：平均差 ${diff.mean}，差值>32 的像素 ${diff.over32}%`);
await browser.close();
